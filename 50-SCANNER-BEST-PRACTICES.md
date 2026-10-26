# ‏שלב 50 — `Scanner Best Practices`: לסרוק אלפי מניות בלי להפוך את ה־Scanner לצוואר בקבוק

> ‏מטרת הפרק: לבנות `Market Scanner` שמסוגל לעבד אלפי Symbols בזמן אמת, לשמור על freshness, לבצע דירוג דטרמיניסטי, לצמצם עבודה יקרה רק למועמדים הרלוונטיים, להתמודד עם bursts/backpressure, ולספק החלטות שניתן להסביר ולשחזר.
>
> ‏העיקרון המרכזי: **Scanner טוב אינו מחשב הכול לכולם כל הזמן. הוא שומר state אינקרמנטלי, עושה עבודה זולה על כל ה־Universe, עבודה יקרה רק על מועמדים, ומסרב להחליט כאשר freshness או coverage אינם מספיקים.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. מהו Scanner במערכת שלנו

‏ה־Scanner אינו רק `foreach` על 4,000 מניות.

‏הוא שכבת החלטה בין Market Data לבין Candidate Selection.

```text
Market Data
   ↓
Canonical State
   ↓
Fast Features
   ↓
Eligibility / Filters
   ↓
Cheap Ranking
   ↓
Top-N Candidate Funnel
   ↓
Deep Features / Execution Checks
   ↓
Final Ranking
   ↓
Trade / No Trade
```

‏אם השכבה הזו איטית, stale או לא דטרמיניסטית — כל שאר המערכת מקבלת החלטות על מציאות שכבר השתנתה.

---

# ‏2. שלושת היעדים של Scanner מקצועי

‏Scanner טוב צריך לאזן שלושה יעדים:

1. ‏`Freshness` — לעבוד על מידע מספיק עדכני.
2. ‏`Coverage` — לראות חלק מספיק גדול מה־Universe.
3. ‏`Decision Quality` — לחשב Features/Ranking באיכות מספקת.

‏אי אפשר למקסם את שלושתם ללא גבול.

‏לכן צריך Budget מפורש.

```text
Freshness Budget
Compute Budget
Coverage Budget
Decision Budget
```

---

# ‏3. Snapshot Scanner מול Event-Driven Scanner

‏ב־Snapshot Scanner מריצים סריקה מחזורית:

```text
Every X ms:
    read all symbols
    calculate
    rank
```

‏היתרון: פשוט להבנה ולשחזור.

‏החיסרון: הרבה עבודה חוזרת, burst גדול בכל cycle, ו־freshness לא אחידה.

‏ב־Event-Driven Scanner כל Symbol מתעדכן כאשר מגיע מידע חדש.

‏היתרון: incremental work.

‏החיסרון: state management מורכב יותר.

‏לרובוט שלנו סביר להשתמש ב־hybrid:

```text
Event-driven state updates
+
periodic ranking checkpoints
```

---

# ‏4. לא לחשב מחדש מה שאפשר לעדכן אינקרמנטלית

‏נניח שיש לנו return של 10 שניות.

‏גישה נאיבית:

```text
On every scan:
    query all history
    find old price
    calculate return
```

‏גישה טובה יותר:

```text
On market event:
    update rolling state
    update required anchors
    cache derived feature
```

‏ה־Scanner אז קורא feature מוכן.

‏זה בדיוק המקום שבו `precompute on ingest` יכול לחסוך latency משמעותי.

---

# ‏5. `O(N)` אינו בהכרח הבעיה

‏לסרוק 4,000 Symbols זה לא בהכרח יקר.

‏הבעיה היא:

```text
N × expensive_feature_cost
```

‏4,000 השוואות פשוטות יכולות להיות זולות מאוד.

‏4,000 queries למסד נתונים, allocations, JSON parses או book reconstructions — יקרות מאוד.

‏לכן מודדים cost per symbol, לא רק number of symbols.

---

# ‏6. Fast Path ו־Deep Path

‏חלוקה בסיסית:

```text
All Symbols
   ↓
Fast Path
   ↓
Top 100
   ↓
Medium Path
   ↓
Top 20
   ↓
Deep Path
   ↓
Top 1..3
```

‏`Fast Path` צריך להשתמש ב־Features זולים ומוכנים.

‏`Deep Path` יכול להוסיף:

- ‏Book analysis.
- ‏Order flow.
- ‏Execution feasibility.
- ‏Adverse-selection estimate.
- ‏Capacity.
- ‏Broker readiness.

---

# ‏7. Candidate Funnel

‏Candidate Funnel מצמצם את ה־Universe בשלבים.

‏דוגמה:

```text
4,000 symbols
→ 2,500 fresh/tradable
→ 500 active enough
→ 100 positive short momentum
→ 25 strongest cross-sectional candidates
→ 5 executable candidates
→ 1 best candidate or NO TRADE
```

‏המספרים הם דוגמה בלבד.

‏העיקרון הוא שכל שכבה צריכה להיות:

- ‏זולה יותר מהבאה אחריה.
- ‏מספיק שמרנית כדי לא לזרוק winners אמיתיים מוקדם מדי.
- ‏מדידה.

---

# ‏8. Early Filter Risk

‏Filter מוקדם מדי יכול לחסוך compute אבל למחוק Alpha.

‏לכן לכל Filter מודדים:

```text
rejection_rate
future_winner_rejection_rate
compute_saved
latency_saved
```

‏Filter טוב אינו רק כזה שמסיר הרבה Symbols.

‏הוא כזה שמסיר הרבה עבודה עם מעט false negatives חשובים.

---

# ‏9. Hard Filter מול Soft Penalty

‏`Hard Filter` אומר:

```text
candidate removed
```

‏`Soft Penalty` אומר:

```text
candidate remains
score reduced
```

‏Hard Filter מתאים יותר ל־invalid/tradability/safety.

‏Soft Penalty מתאים יותר ל־quality uncertainty.

‏לדוגמה:

- ‏Halt → Hard reject.
- ‏Stale data קשה → Hard reject.
- ‏Spread מעט רחב → אולי penalty.
- ‏Momentum מעט חלש → ranking penalty.

---

# ‏10. Freshness חייב להיות per-symbol

‏אסור להניח שכל ה־Universe עדכני באותה מידה.

‏לכל Symbol נשמור לפחות:

```text
last_trade_event_time
last_quote_event_time
last_received_time
last_processed_time
feature_as_of_time
```

‏כך אפשר לדעת לא רק מה הערך — אלא עד מתי הוא נכון.

---

# ‏11. `Fresh Coverage Ratio`

‏מדד חשוב:

```text
FreshCoverageRatio = FreshEligibleSymbols / EligibleUniverse
```

‏אם ה־Scanner רואה רק 35% מה־Universe בצורה טרייה, Top 1 שלו אינו באמת Top 1 של השוק.

‏לכן לפני ranking מלא צריך readiness gate.

---

# ‏12. Coverage Gate

‏אפשר להגדיר:

```text
if FreshCoverageRatio < MinCoverage:
    decision = NO_TRADE_DATA_COVERAGE
```

‏זה עדיף על החלטה “מהירה” שמבוססת על תמונת שוק חלקית.

---

# ‏13. Freshness אינו רק Time Since Last Trade

‏מניה יכולה לא להדפיס Trade ועדיין להיות בעלת Quotes עדכניים.

‏ומנגד Trade יכול להגיע אבל Quotes להיות stale.

‏לכן readiness יכול להשתמש בכמה clocks:

```text
trade_freshness
quote_freshness
book_freshness
feature_freshness
```

---

# ‏14. Feature Age

‏Feature צריך לשאת metadata:

```text
value
as_of_event_time
computed_at
source_version
validity
confidence
```

‏אחרת Feature cache עלול להפוך למקור שגיאות שקט.

---

# ‏15. Canonical Symbol State

‏לכל Symbol כדאי להחזיק state קנוני אחד.

‏לדוגמה רעיונית:

```text
SymbolState
- market data
- rolling windows
- derived features
- eligibility
- score components
- last update metadata
- diagnostics
```

‏ה־Scanner קורא את אותו model, ולא בונה views שונים בכל module.

---

# ‏16. Single Writer Principle

‏דרך פשוטה להפחית races:

```text
one logical writer per SymbolState
```

‏אפשר לממש זאת בכמה דרכים.

‏המטרה היא שלא יהיו שני threads שמשנים את אותו rolling state ללא contract ברור.

---

# ‏17. Partitioning לפי Symbol

‏אפשר לחלק Symbols ל־partitions:

```text
hash(symbol) % partition_count
```

‏כל partition מעבד events בסדר עקבי.

‏כך מקבלים parallelism בלי לוותר בקלות על ordering per symbol.

---

# ‏18. Event Ordering

‏Market data יכולה להגיע:

- ‏באיחור.
- ‏מחוץ לסדר.
- ‏כפולה.
- ‏עם sequence gap.

‏Scanner צריך policy מפורש.

‏למשל:

```text
ACCEPT
DROP_DUPLICATE
REORDER_WITHIN_WINDOW
INVALIDATE_SYMBOL
REQUEST_RESYNC
```

---

# ‏19. Late Event Policy

‏אסור לכתוב פשוט:

```text
state.LastPrice = event.Price
```

‏בלי לבדוק event time/sequence.

‏Late event יכול להחזיר State אחורה בזמן.

---

# ‏20. Deterministic Ranking

‏אותו Market State ואותה Config צריכים לייצר אותו ranking.

‏זה חשוב ל־:

- ‏Replay.
- ‏RCA.
- ‏Testing.
- ‏Research reproducibility.

---

# ‏21. Tie Breakers

‏כאשר שני Symbols מקבלים אותו Score, צריך tie-breaker מפורש.

‏לדוגמה:

```text
1. higher executable edge
2. fresher signal
3. better liquidity
4. stable symbol id
```

‏לא מסתמכים על dictionary iteration order.

---

# ‏22. Stable Sorting

‏Ranking unstable יכול לגרום ל־candidate churn מלאכותי.

‏לכן stable ordering חשוב כאשר values כמעט שווים.

---

# ‏23. Candidate Churn

‏מדד:

```text
Top1ChurnRate
TopNChurnRate
AverageCandidateLifetime
```

‏אם Top 1 מתחלף עשרות פעמים בשנייה, צריך להבין אם:

- ‏השוק באמת משתנה.
- ‏ה־Score רועש.
- ‏ה־Scanner לא מסונכרן.
- ‏ties נשברים בצורה אקראית.

---

# ‏24. Candidate Persistence

‏לא כל winner רגעי הוא candidate טוב.

‏אפשר למדוד:

```text
time_in_top_1
percentage_of_recent_scans_in_top_3
rank_stability
```

‏אבל persistence היא Feature לבדיקה, לא חוק אוניברסלי.

---

# ‏25. Rank Separation

‏חשוב ההפרש בין #1 ל־#2.

```text
RankSeparation = Score1 - Score2
```

‏Top 1 בהפרש זעיר שונה מ־Top 1 עם separation ברור.

---

# ‏26. Cross-Sectional Snapshot Consistency

‏בעיה קשה: כאשר סורקים 4,000 Symbols, הראשון והאחרון אינם בהכרח מאותו רגע.

‏לכן ranking יכול להשוות:

```text
A as of 10:00:00.100
B as of 10:00:00.480
```

‏זה bias תפעולי.

---

# ‏27. Snapshot Watermark

‏פתרון אפשרי הוא watermark:

```text
ranking_time = T
use only features valid at or before T
within freshness tolerance
```

‏לא תמיד צריך snapshot מושלם, אבל צריך contract ברור.

---

# ‏28. Asynchronous Ranking

‏במערכת event-driven אפשר לדרג Symbols בעלי update times שונים.

‏במקרה כזה חייבים normalizing rule ל־age.

‏לדוגמה:

```text
reject if age > max_age
or
apply age penalty
```

---

# ‏29. Top-K במקום Full Sort

‏אם צריך רק Top 20 מתוך 4,000, לא תמיד חייבים sort מלא.

‏אפשר להשתמש ב־Top-K algorithms / heap / partial selection.

‏אבל קודם מודדים.

‏על 4,000 elements sort מלא יכול להיות זניח לעומת feature computation.

---

# ‏30. Optimize the Bottleneck, Not the Pretty Algorithm

‏אל תחליף sort ב־clever heap אם 90% מהזמן הולך למסד הנתונים.

‏Profiler קודם.

‏Optimization אחר כך.

---

# ‏31. No Database Query Per Symbol Per Cycle

‏Anti-pattern חמור:

```text
for each symbol:
    query database
```

‏הפתרונות האפשריים:

- ‏in-memory rolling state.
- ‏batch reads.
- ‏precomputed feature store.
- ‏append-only event ingestion + online state.

---

# ‏32. Storage אינו Fast Path

‏Database חשוב ל־durability, history ו־research.

‏אבל Scanner בזמן אמת בדרך כלל לא צריך לבצע round-trip ל־storage עבור כל החלטה.

---

# ‏33. Hot State מול Durable History

‏הפרדה:

```text
Hot State = current decision state
Durable History = evidence/replay/research
```

‏לא מכריחים את אותו storage model לעשות את שני התפקידים.

---

# ‏34. Bounded Memory

‏Rolling windows צריכים להיות bounded.

‏אם שומרים כל Tick לכל Symbol בזיכרון לנצח — המערכת תתנפח.

‏שומרים מה שנחוץ ל־online features.

‏את השאר שולחים ל־durable storage.

---

# ‏35. Ring Buffers

‏לחלונות קצרים, `ring buffer` יכול להיות פתרון פשוט ויעיל.

‏אבל גם כאן — clarity חשובה יותר מ־micro-optimization מוקדם.

---

# ‏36. Pre-Allocated Structures

‏ב־hot path אפשר להפחית allocations.

‏אבל אין צורך להפוך כל קוד ל־unsafe low-level.

‏עובדים לפי profiling.

---

# ‏37. GC Pauses

‏ב־.NET Scanner צריך למדוד:

```text
allocation_rate
GC collections
pause_duration
P99 processing latency
```

‏אם allocation burst יוצר latency spikes — זו בעיה אמיתית.

---

# ‏38. CPU Budget Per Cycle

‏אפשר לחשוב על:

```text
cycle_budget_ms
```

‏ולחלק:

```text
state update
fast filters
score
Top-K
Deep Path
decision logging
```

---

# ‏39. Per-Stage Timing

‏לכל stage מודדים latency בנפרד.

‏אחרת יודעים רק ש־“Scanner איטי” ולא יודעים למה.

---

# ‏40. Tail Latency חשוב יותר מהממוצע

‏Scanner עם average של `20ms` ו־P99 של `900ms` יכול להיות מסוכן יותר ממערכת יציבה של `50ms`.

‏במסחר קצר, tails יכולים להכריע.

---

# ‏41. Burst Handling

‏כאשר השוק נהיה פעיל, מגיעים יותר Events בדיוק כאשר ההזדמנויות חשובות יותר.

‏זו correlated load.

‏לכן capacity testing צריך לדמות bursts אמיתיים.

---

# ‏42. Backpressure

‏אם ingestion מהיר יותר מ־processing:

```text
queue grows
→ data ages
→ features stale
→ ranking lies
```

‏צריך לזהות backlog לפני שהוא הופך ל־staleness שקט.

---

# ‏43. Queue Age

‏לא מספיק למדוד queue length.

‏חשוב למדוד:

```text
oldest_event_age
P95_event_age
```

‏Queue של 1,000 events בני 2ms שונה מ־Queue של 100 events בני 700ms.

---

# ‏44. Load Shedding

‏כאשר אין capacity, עדיף לפעמים לזרוק עבודה לא קריטית מאשר לעבד הכול באיחור.

‏דוגמאות אפשריות:

- ‏disable expensive diagnostics זמניים.
- ‏להקטין Deep Path candidate count.
- ‏לדלג על non-critical derived features.
- ‏לעבור למצב `NO_TRADE_DEGRADED` אם freshness נפגעת.

---

# ‏45. Safety Before Completeness

‏אסור ש־load shedding יזרוק:

- ‏Trading status.
- ‏Risk state.
- ‏Order/fill events.
- ‏Position reconciliation.

‏Safety events מקבלים עדיפות גבוהה.

---

# ‏46. Priority Classes

‏אפשר להגדיר:

```text
P0 = broker/risk/safety
P1 = market state required for active position
P2 = active candidates
P3 = full-universe ranking
P4 = diagnostics/research extras
```

‏זו דוגמה ארכיטקטונית.

---

# ‏47. Active Position Gets Priority

‏כאשר יש Position פתוח, Exit logic צריך לקבל עדיפות על סריקת Opportunity חדשה.

‏הסיבה פשוטה:

```text
existing risk > hypothetical opportunity
```

---

# ‏48. Entry Candidate Priority

‏Candidate שנמצא במעבר `Decision → Submit` צריך freshness עדכני יותר מסמל אקראי במקום 3,000.

---

# ‏49. Deep Path TTL

‏אם Deep Analysis לוקח יותר מדי זמן, התוצאה שלו יכולה לפוג לפני שמשתמשים בה.

‏לכן לכל Deep Result יש:

```text
computed_at
valid_until
source_as_of
```

---

# ‏50. Revalidation Before Submit

‏גם אם candidate ניצח ranking, לפני Order צריך recheck:

- ‏עדיין tradable?
- ‏signal עדיין חי?
- ‏spread עדיין תקין?
- ‏price לא ברח?
- ‏score עדיין מעל threshold?
- ‏risk עדיין מאפשר?

---

# ‏51. Scanner Decision ID

‏לכל decision cycle או candidate decision כדאי ID.

‏כך אפשר לחבר:

```text
market state
→ ranking
→ candidate
→ order intent
→ fill
→ outcome
```

---

# ‏52. Explainability

‏לכל Top candidate צריך לדעת:

```text
why #1?
why not #2?
what filters passed?
what penalties applied?
what features dominated?
what data age?
```

---

# ‏53. Top-N Snapshot Logging

‏אין צורך לשמור כל פרט לכל 4,000 symbols בכל millisecond.

‏אבל כדאי לשמור snapshots מספיקים של:

- ‏Top N.
- ‏score components.
- ‏eligibility.
- ‏freshness.
- ‏rejection reasons.

---

# ‏54. Rejection Reason Codes

‏במקום string חופשי:

```text
STALE_TRADE
STALE_QUOTE
HALTED
LOW_ACTIVITY
WIDE_SPREAD
INSUFFICIENT_EDGE
CAPACITY_TOO_LOW
RISK_BLOCKED
```

‏Reason codes מאפשרים aggregation ו־RCA.

---

# ‏55. `NO TRADE` הוא Output תקין

‏Scanner מקצועי לא חייב לבחור תמיד winner.

‏אם אין candidate שעובר threshold:

```text
NO_TRADE
```

‏זו החלטה מלאה.

---

# ‏56. Whole-Market Winner Fallacy

‏“יש תמיד מניה שעולה הכי הרבה” נכון מתמטית.

‏אבל לא אומר שיש תמיד candidate בעל executable edge חיובי.

‏Top 1 יכול להיות פשוט “הכי פחות גרוע”.

---

# ‏57. Absolute Threshold + Relative Rank

‏לכן שילוב טוב למחקר הוא:

```text
relative rank
+
absolute minimum quality
```

‏לא מספיק להיות מקום ראשון.

---

# ‏58. Score Decomposition

‏עדיף לשמור:

```text
momentum_score
activity_score
liquidity_score
flow_score
book_score
execution_score
risk_penalty
final_score
```

‏ולא רק number אחד.

---

# ‏59. Score Version

‏כל decision צריך לדעת באיזה Score Version נוצר.

```text
score_model_version
feature_schema_version
filter_config_version
```

---

# ‏60. Configuration Snapshot

‏Config משתנה.

‏לכן כל experiment/live decision צריך להיות קשור ל־config snapshot/version.

---

# ‏61. Feature Availability Contract

‏אם feature חסר:

‏צריך policy מפורש.

```text
REJECT
USE_DEFAULT
REDUCE_CONFIDENCE
FALLBACK_MODEL
```

‏לא ממלאים `0` בשקט אם `0` הוא ערך אמיתי אפשרי.

---

# ‏62. Unknown != Zero

‏זה אחד ה־anti-patterns החשובים.

```text
missing_volume != volume_zero
unknown_spread != spread_zero
```

---

# ‏63. Confidence לצד Score

‏אפשר להחזיק:

```text
score
confidence
```

‏Candidate עם Score גבוה ו־confidence נמוך שונה מ־Candidate עם Score מעט נמוך יותר ו־data איכותי.

---

# ‏64. Confidence Sources

‏Confidence יכול להיות מושפע מ־:

- ‏data freshness.
- ‏coverage.
- ‏sequence integrity.
- ‏provider agreement.
- ‏feature availability.
- ‏model calibration region.

---

# ‏65. Provider Divergence

‏אם שני feeds מראים states שונים מהותית, Scanner צריך לדעת זאת.

‏לא תמיד צריך לעצור הכול, אבל divergence היא diagnostic/risk signal.

---

# ‏66. Cross-Provider Time Alignment

‏כאשר משווים feeds, timestamps חייבים להיות מובנים.

‏אחרת divergence מדומה יכול להיות פשוט latency difference.

---

# ‏67. Symbol Lifecycle

‏Symbols יכולים:

- ‏להתווסף.
- ‏להימחק.
- ‏להחליף ticker.
- ‏להיות suspended.
- ‏לעבור corporate action.

‏Universe state צריך versioning.

---

# ‏68. Universe Version

‏לכל scan/replay כדאי לדעת:

```text
universe_version
```

‏אחרת קשה לשחזר למה Symbol היה או לא היה candidate.

---

# ‏69. Scanner Warm-Up

‏לאחר startup אין מיד 10s/30s/60s history מלא לכל Symbol.

‏צריך warm-up state.

```text
NOT_READY
PARTIALLY_READY
READY
```

---

# ‏70. Partial Readiness

‏Symbol יכול להיות ready ל־10s feature אך לא ל־60s feature.

‏Readiness צריך להיות feature-aware.

---

# ‏71. Startup Burst

‏ב־startup יכולים להגיע snapshots רבים מאוד.

‏צריך לבדוק שהמערכת לא מנסה לחשב Deep Features לכולם באותו רגע.

---

# ‏72. Reconnect Burst

‏Reconnect דומה ל־startup אך מסוכן יותר כי ייתכן שיש Position קיים.

‏קודם reconciliation וסafety.

‏אחר כך scanning.

---

# ‏73. Degraded Mode

‏Scanner יכול לעבוד במצבי:

```text
FULL
DEGRADED
PAUSED
BLOCK_NEW_ENTRIES
```

‏המצב צריך להיות observable.

---

# ‏74. Failure Isolation

‏Symbol אחד עם payload בעייתי לא צריך להפיל את כל ה־Scanner.

‏יש לבודד:

```text
per-event failure
per-symbol failure
partition failure
systemic failure
```

---

# ‏75. Poison Event

‏Event שחוזר ונכשל בעיבוד עלול ליצור retry loop.

‏צריך dead-letter/quarantine policy או invalidation מפורש.

---

# ‏76. Retry אינו תמיד נכון

‏Market data ישנה יכולה להיות חסרת ערך אחרי כמה מאות milliseconds.

‏Retry מאוחר יכול להיות גרוע יותר מ־drop + resync.

---

# ‏77. Idempotent Event Handling

‏Duplicate event לא צריך להכפיל volume/counters.

‏לכן deduplication/sequence contracts חשובים.

---

# ‏78. Feature Increment Idempotency

‏אם event נכנס פעמיים:

```text
trade_count += 1
```

‏פעמיים זו corruption.

‏צריך event identity או sequence strategy מתאימה.

---

# ‏79. Multi-Horizon Windows

‏לרובוט שלנו יהיו horizons רבים.

‏לא בונים query נפרד לכל horizon בכל scan.

‏שומרים structure שמאפשר anchors/rolling windows יעילים.

---

# ‏80. Horizon Alignment

‏10s ו־30s צריכים להיות מוגדרים מאותו time semantics.

‏לא לערבב:

```text
processing time
with
exchange event time
```

‏בלי החלטה מפורשת.

---

# ‏81. Nearest-Earlier Anchor

‏אם אין sample בדיוק לפני 10s, אפשר להשתמש ב־nearest earlier snapshot לפי contract מוגדר.

‏אבל צריך לשמור:

```text
anchor_age_error
```

‏כי 10.02s שונה מ־13.7s.

---

# ‏82. Sampling Error Feature

‏הפרש בין requested horizon לבין actual anchor יכול להיות diagnostic ואפילו confidence penalty.

---

# ‏83. Event Density Matters

‏Symbol עם 100 trades ב־10s ו־Symbol עם trade יחיד צריכים interpretation שונה גם אם return זהה.

---

# ‏84. Activity as Readiness

‏לפעמים feature מחושב מתמטית אבל אינו statistically meaningful כי כמעט לא היו events.

‏לכן readiness יכולה לכלול minimum activity.

---

# ‏85. Scanner vs Strategy Boundary

‏Scanner אחראי על:

```text
state
features
eligibility
ranking
candidate evidence
```

‏Strategy/Decision layer אחראית על:

```text
trade intent
risk-aware choice
```

‏הגבול צריך להיות ברור.

---

# ‏86. Scanner vs Execution Boundary

‏Scanner לא שולח Order בעצמו.

‏הוא מייצר candidate/decision evidence.

‏Execution revalidates.

---

# ‏87. Avoid Hidden Side Effects

‏קריאת Score function לא צריכה לשנות state עסקי לא צפוי.

‏Pure-ish calculations מקלות Replay ו־Testing.

---

# ‏88. Deterministic Feature Functions

‏אותו input צריך לתת אותו output.

‏לא קוראים `DateTime.Now` מתוך Feature function בלי context מוזרק.

---

# ‏89. Explicit Time Context

‏מעבירים:

```text
EvaluationTime
```

‏לכל חישוב תלוי־זמן.

---

# ‏90. Replay-Compatible Architecture

‏אותו Scanner core צריך להיות מסוגל לעבוד על:

```text
Live events
Replay events
Backtest events
```

‏עם אותם contracts ככל האפשר.

---

# ‏91. Live-only Leakage

‏אל תבנה production scanner שזקוק לנתון שלא נשמר ב־Replay.

‏אחרת לא תוכל לחקור incidents.

---

# ‏92. Replay Fidelity Metadata

‏כאשר Replay לא כולל full book/hidden info/latency, מסמנים fidelity level.

---

# ‏93. Top-N Deep Path Bias

‏אם Deep Features מחושבים רק ל־Top 20, אי אפשר אחר כך להשוות אותם נאיבית לכל 4,000.

‏זו selection issue.

---

# ‏94. Shadow Deep Features

‏למחקר אפשר מדי פעם לחשב Deep Features גם למדגם control שאינו Top-N.

‏כך בודקים selection bias.

---

# ‏95. Candidate Funnel Attribution

‏כאשר Trade לא קרה, צריך לדעת באיזה שלב נפל candidate.

```text
universe
freshness
filter
cheap_rank
Top-N
execution_check
risk_gate
final_threshold
```

---

# ‏96. Funnel Metrics

‏לכל stage:

```text
input_count
output_count
processing_time
false-negative estimate
```

---

# ‏97. Rank Drift During Deep Analysis

‏Candidate שהיה #1 לפני 100ms יכול להיות #8 כשה־Deep Path מסתיים.

‏לכן final re-ranking חשוב.

---

# ‏98. Decision Snapshot

‏בזמן החלטה שומרים immutable snapshot של evidence.

‏אחרת RCA יראה current state ולא state שהיה בזמן decision.

---

# ‏99. Immutable Decision Evidence

‏Decision log צריך להיות append-only ככל האפשר.

‏לא “לעדכן” בדיעבד את מה שהמערכת ידעה אז.

---

# ‏100. Score Timestamp

‏לכל Score:

```text
score_as_of
score_computed_at
```

‏כך רואים age ו־compute lag.

---

# ‏101. Scanner Cycle ID

‏גם במערכת event-driven אפשר לייצר logical scan epochs.

‏זה מקל על observability.

---

# ‏102. Cycle Duration

‏מדדים:

```text
cycle_duration_p50
cycle_duration_p95
cycle_duration_p99
```

---

# ‏103. Cycle Overrun

‏אם cycle חדש מתחיל לפני הקודם הסתיים — צריך policy.

‏לא ליצור overlap שקט.

---

# ‏104. Skip vs Queue Cycles

‏במערכת קצרה לרוב עדיף לעיתים:

```text
skip stale cycle
```

‏מאשר:

```text
queue every missed cycle
```

‏כי backlog של decisions ישנים אינו שימושי.

---

# ‏105. Latest-State Coalescing

‏אם Symbol קיבל 50 quote updates בזמן שהמערכת עמוסה, לפעמים אפשר לעבד רק latest state לצורך scanner snapshot.

‏אבל אסור לעשות זאת אם Feature תלוי בכל event, למשל trade count/volume/order flow.

---

# ‏106. Coalescing Contract

‏לכל event type צריך לדעת:

```text
coalescible?
lossless?
requires every event?
```

---

# ‏107. Separate State Update from Ranking Trigger

‏לא כל event צריך להפעיל full ranking.

‏אפשר לעדכן state תמיד, ולדרג לפי trigger policy.

---

# ‏108. Ranking Trigger Policies

‏דוגמאות:

- ‏fixed interval.
- ‏significant feature change.
- ‏candidate threshold crossing.
- ‏burst trigger.

‏צריך לבדוק אמפירית.

---

# ‏109. Debounce

‏אם quote flicker מפעיל ranking ללא הפסקה, debounce קצר יכול להפחית noise/CPU.

‏אבל הוא מוסיף latency.

‏מודדים trade-off.

---

# ‏110. Hysteresis

‏כדי למנוע Top1 flapping סביב threshold אפשר להשתמש ב־hysteresis.

‏למשל candidate חדש צריך לעבור את הנוכחי במרווח מינימלי.

‏אבל זה Feature/Policy למחקר, לא כלל קבוע.

---

# ‏111. Scanner Fairness

‏אסור שסמלים בתחילת array יקבלו freshness advantage קבוע.

‏אם processing sequential, בודקים bias לפי position/order.

---

# ‏112. Symbol Ordering Bias

‏בדיקה פשוטה:

‏משנים ordering של Universe ב־Replay.

‏אם results משתנים מהותית — architecture חשודה.

---

# ‏113. Partition Skew

‏Partition אחד יכול לקבל Symbols פעילים יותר ולקרוס בעומס.

‏מודדים load per partition.

---

# ‏114. Dynamic Rebalancing

‏אפשר לשקול rebalancing, אבל complexity גבוהה.

‏לעיתים static partitioning + מספיק headroom עדיף.

---

# ‏115. Headroom

‏Production scanner לא אמור לעבוד ב־95% CPU ביום רגיל.

‏צריך מקום ל־bursts.

---

# ‏116. Capacity Planning

‏בודקים לפחות:

```text
normal day
active open
news burst
market-wide volatility
reconnect flood
```

---

# ‏117. Synthetic Load אינו מספיק

‏Random events לא תמיד מדמים correlated market bursts.

‏עדיף Replay של ימים אמיתיים קשים.

---

# ‏118. Hot Symbols

‏Symbol אחד יכול לייצר event rate גדול בהרבה מאחרים.

‏צריך למנוע ממנו להרעיב את כל ה־Universe.

---

# ‏119. Per-Symbol Budget

‏אפשר להחזיק limits/monitoring על processing cost per symbol.

‏אם Symbol pathological — isolate/diagnose.

---

# ‏120. Feature Cost Accounting

‏לכל Feature כדאי לדעת בערך:

```text
CPU cost
memory cost
update frequency
predictive value
```

‏Feature יקר עם value זניח הוא מועמד לפרישה.

---

# ‏121. Cost-per-Edge

‏שאלה מקצועית:

```text
How much compute/latency does this feature cost for how much incremental edge?
```

---

# ‏122. Feature Retirement

‏Feature שאינו מוסיף value אבל ממשיך לצרוך hot-path budget צריך לצאת.

‏זה יתחבר בהמשך לפרק Feature Retirement.

---

# ‏123. Scanner Complexity Tax

‏כל feature חדש מוסיף:

- ‏CPU.
- ‏state.
- ‏testing.
- ‏failure modes.
- ‏explainability cost.

‏לכן complexity היא עלות כלכלית אמיתית.

---

# ‏124. Fast Approximation מול Exact Deep Calculation

‏לעיתים Fast Path יכול להשתמש approximation.

‏Deep Path מחשב version מדויק יותר.

‏צריך למדוד disagreement rate.

---

# ‏125. Approximation Drift

‏אם fast approximation כבר לא מנבא את deep result, funnel נפגע.

‏צריך alert/monitoring.

---

# ‏126. Candidate Recall

‏מדד חשוב:

```text
What percentage of eventual good candidates survive Fast Path into Deep Path?
```

‏זה Funnel Recall.

---

# ‏127. Compute Precision Trade-Off

‏ה־Fast Path לא צריך להיות מושלם.

‏הוא צריך להיות:

```text
cheap + high recall
```

---

# ‏128. Deep Path Precision

‏Deep Path יכול להתמקד ב־precision גבוה יותר.

---

# ‏129. Scanner as Two-Stage Retrieval System

‏אפשר לחשוב על Scanner כמו retrieval:

```text
Stage 1 = retrieve plausible candidates
Stage 2 = rerank deeply
```

‏זה מודל שימושי מאוד.

---

# ‏130. Top-N Size Is a Hyperparameter

‏Top 5/20/100 הוא parameter שצריך לבדוק.

‏קטן מדי → misses.

‏גדול מדי → compute/latency.

---

# ‏131. Dynamic Top-N

‏אפשר בעתיד להתאים Top-N לפי load/regime.

‏אבל baseline צריך להיות פשוט.

---

# ‏132. Resource-Aware Scanner

‏Scanner מקצועי יודע את health שלו.

‏אם CPU/queue age חורגים, הוא לא מתנהג כאילו הכול רגיל.

---

# ‏133. Backpressure as Market State Quality

‏Backpressure אינה רק infra metric.

‏היא משפיעה ישירות על איכות ה־market state.

‏לכן Strategy צריכה לקבל degraded flag.

---

# ‏134. Scanner Readiness Contract

‏אפשר לחשוב על:

```text
ScannerReadiness
- universe_ready
- coverage_ratio
- max_event_age
- backlog_age
- feature_readiness
- broker_ready
- trading_status_ready
```

---

# ‏135. Readiness Is Not Liveness

‏Process יכול להיות alive אבל scanner לא מוכן להחלטות.

‏זו הבחנה קריטית.

---

# ‏136. Warm Standby

‏אם בעתיד נרצה redundancy, standby scanner צריך לקבל אותו market state ולהיות capable of takeover.

‏אבל זה advanced production concern.

---

# ‏137. Duplicate Scanner Risk

‏שני scanner instances שמבצעים Trade intents בו־זמנית יכולים ליצור duplicate risk.

‏לכן leader/fencing contract חשוב כאשר מגיעים ל־HA.

---

# ‏138. Scanner Output Must Be Idempotent-Friendly

‏Decision עם ID יציב מקל על downstream deduplication.

---

# ‏139. Candidate Identity

‏Candidate אינו רק Symbol.

‏אפשר לחשוב על:

```text
CandidateId = symbol + decision_epoch + strategy_version
```

---

# ‏140. State Reset Boundaries

‏צריך לדעת מתי rolling state מתאפס:

- ‏session boundary.
- ‏halt/reopen.
- ‏corporate action.
- ‏provider reset.
- ‏symbol remap.

---

# ‏141. Session Awareness

‏Pre-market, regular session ו־after-hours יכולים להיות regimes שונים.

‏Scanner לא צריך לערבב stats ללא החלטה מפורשת.

---

# ‏142. Regime Context

‏Ranking יכול לכלול context:

```text
market volatility
session phase
breadth
activity regime
```

‏אבל כל interaction צריך validation.

---

# ‏143. Cross-Sectional Normalization

‏כאשר משווים Symbols שונים, raw values לא תמיד comparable.

‏אפשר להשתמש ב־:

- ‏percentile.
- ‏z-score.
- ‏rank.
- ‏relative-to-own-history.

‏כל אחד עם pitfalls.

---

# ‏144. Outlier Handling

‏Bad tick יכול להפוך Symbol ל־#1.

‏צריך data quality checks לפני ranking.

---

# ‏145. Bad Tick Defense

‏בדיקות אפשריות:

```text
impossible price
extreme jump without corroboration
zero/negative values where invalid
crossed/locked quote handling
provider mismatch
```

---

# ‏146. Do Not Hide Real Extreme Moves

‏Filter חזק מדי על outliers יכול למחוק בדיוק את המומנטום שאנו מחפשים.

‏לכן צריך evidence-based anomaly handling.

---

# ‏147. Data Quality Score

‏אפשר לשמור score נפרד לאיכות data.

‏לא לערבב אותו בשקט עם alpha score.

---

# ‏148. Scanner Diagnostics UI

‏UI שימושי צריך להראות לפחות:

- ‏Universe size.
- ‏Fresh count.
- ‏Eligible count.
- ‏Top N.
- ‏Score components.
- ‏Feature ages.
- ‏Backlog age.
- ‏cycle latency.
- ‏NO TRADE reason.

---

# ‏149. Drill-Down per Symbol

‏ל־Symbol מסוים צריך לראות:

```text
raw market state
rolling anchors
features
filters
score history
rank history
reason codes
```

---

# ‏150. Rank History

‏Rank trajectory יכולה להסביר יותר מ־rank נקודתי.

```text
120 → 25 → 5 → 1
```

‏שונה מ־:

```text
1 → 70 → 1 → 80
```

---

# ‏151. Rank Velocity

‏`Rank Velocity` יכולה להיות Feature למחקר.

‏לא להכניס ל־live לפני validation.

---

# ‏152. Rank Acceleration

‏גם acceleration של rank אפשרית, אבל רגישה מאוד לרעש.

---

# ‏153. Winner Emergence

‏מעניין למדוד כמה זמן לפני Trade candidate התחיל להיכנס ל־Top N.

‏זה יכול לעזור להבין lead time.

---

# ‏154. Candidate Half-Life

‏כמה זמן candidate נשאר איכותי אחרי שהוא מופיע.

‏זה מחבר Scanner ל־Latency Engineering.

---

# ‏155. Decision Latency Budget

‏מ־market state רלוונטי עד candidate final צריך budget.

‏אם Scanner צורך רוב signal half-life — אין execution headroom.

---

# ‏156. Scanner-to-Execution Handoff

‏ה־handoff צריך לכלול:

```text
candidate_id
symbol
score
score_components
signal_time
expiry_time
reference_price
execution_constraints
risk_context
```

---

# ‏157. Expiry Time

‏Candidate ללא TTL הוא מסוכן.

‏Execution לא צריך לנחש אם signal עדיין valid.

---

# ‏158. Price Drift Guard

‏בין ranking ל־submit המחיר יכול לזוז.

‏אפשר להגדיר max drift מה־reference price.

---

# ‏159. Score Drift Guard

‏גם Score יכול להשתנות.

‏לפני submit אפשר לבצע lightweight recheck.

---

# ‏160. Spread Drift Guard

‏Candidate טוב עם spread של 2 bps יכול להיות לא executable כאשר spread נהיה 25 bps.

---

# ‏161. Liquidity Drift Guard

‏Depth יכול להיעלם רגע לפני execution.

---

# ‏162. Trading Status Guard

‏Halt/Limit state overrides ranking.

---

# ‏163. Risk Guard

‏Scanner אינו עוקף risk gate לעולם.

---

# ‏164. Scanner Should Not Predict Fill It Cannot Observe

‏אם אין מספיק data על queue/venue, confidence צריך לשקף זאת.

---

# ‏165. Execution-Aware Ranking

‏ה־best predicted mover אינו בהכרח best trade.

‏אפשר לחשוב על:

```text
NetExecutableScore
=
PredictionQuality
- ExpectedCosts
- ExpectedAdverseSelection
- CapacityPenalty
- LatencyPenalty
```

‏הנוסחה המדויקת היא מחקרית.

---

# ‏166. Separate Predictive Rank from Executable Rank

‏רעיון חזק:

```text
PredictiveRank
ExecutableRank
```

‏כך רואים אם execution משנה את winner.

---

# ‏167. Selection Regret

‏אחרי העסקה אפשר לשאול:

```text
Was another candidate better after realistic execution costs?
```

‏זה selection regret.

---

# ‏168. Rank #1 RCA

‏כאשר #1 נכשל, בודקים:

- ‏prediction wrong?
- ‏data stale?
- ‏execution too slow?
- ‏spread expanded?
- ‏adverse selection?
- ‏candidate churn?
- ‏feature artifact?

---

# ‏169. Scanner Incident Packet

‏בכשל חשוב שומרים:

```text
Top N
raw state
feature versions
config
latencies
backlog
provider health
broker health
```

---

# ‏170. Golden Scanner Scenarios

‏צריכים Replay cases ידועים:

- ‏clear winner.
- ‏no winner.
- ‏stale top candidate.
- ‏tie.
- ‏bad tick.
- ‏burst.
- ‏halt.
- ‏provider lag.
- ‏candidate flips rapidly.

---

# ‏171. Property Tests

‏דוגמאות:

```text
invalid symbol can never become final candidate
stale candidate can never be submitted
same state + same config => same rank
NO_TRADE is allowed
```

---

# ‏172. Differential Tests

‏מריצים old scanner ו־new scanner על אותו Replay.

‏משווים:

```text
rank differences
candidate differences
latency differences
decision differences
```

---

# ‏173. Shadow Scanner

‏אפשר להריץ Challenger scanner בלי Trading.

‏כך מודדים Decision Impact לפני promotion.

---

# ‏174. Decision Impact Rate

‏כמה פעמים שינוי Scanner באמת משנה candidate/decision.

‏Feature חדש שמשנה 0.01% מההחלטות אולי לא מצדיק complexity.

---

# ‏175. False Improvement

‏Scanner מהיר יותר יכול להיות גרוע יותר אם הוא משתמש בנתונים פחות מלאים.

‏לכן speed metric לעולם לא עומד לבד.

---

# ‏176. Scanner Quality Vector

‏מודדים יחד:

```text
freshness
coverage
latency
candidate recall
rank stability
execution-adjusted outcome
```

---

# ‏177. Pareto Trade-Off

‏לעיתים אי אפשר לשפר latency בלי לפגוע coverage.

‏מחפשים Pareto improvement או trade-off מודע.

---

# ‏178. Progressive Degradation

‏במקום crash מלא תחת load:

```text
full deep analysis
→ smaller deep set
→ fast-only ranking
→ block new entries
```

‏אבל כל transition חייב להיות observable.

---

# ‏179. Never Silently Degrade Semantics

‏אם feature נעלם תחת load, לא ממשיכים עם אותו Score label כאילו כלום לא השתנה.

‏צריך version/mode ברור.

---

# ‏180. Scanner Mode in Decision Log

```text
FULL
DEGRADED_FAST_ONLY
RECOVERY
REPLAY
SHADOW
```

---

# ‏181. Kill Switch Integration

‏אם Scanner data integrity נשברת:

```text
BLOCK_NEW_ENTRIES
```

‏יכול להיות נכון יותר מלהמשיך.

---

# ‏182. Active Position Independence

‏גם אם Scanner מושבת, Position Manager צריך להמשיך לנהל Exit לפי contract מתאים.

---

# ‏183. Scanner Crash Must Not Lose Broker Truth

‏Order/Position truth שייכים ל־Execution/Broker state, לא רק לזיכרון Scanner.

---

# ‏184. Restart Recovery

‏אחרי restart:

1. ‏reconcile broker.
2. ‏restore/initialize market state.
3. ‏warm required features.
4. ‏prove readiness.
5. ‏רק אז resume scanning for entries.

---

# ‏185. Scanner Persistence

‏לא חייבים persist כל cache.

‏אבל צריך לדעת אילו states אפשר לבנות מחדש ואילו evidence חייבים לשמור.

---

# ‏186. Checkpointing

‏אם warm-up יקר, אפשר לשקול checkpoint של state.

‏אבל checkpoint ישן חייב freshness validation.

---

# ‏187. Configuration Hot Reload

‏שינוי thresholds בזמן live דורש version boundary.

‏לא “לשנות באמצע” בלי audit.

---

# ‏188. Atomic Config Swap

‏כל decision צריך לראות config version עקבי.

‏לא חצי old וחצי new.

---

# ‏189. Feature Schema Migration

‏כאשר feature משתנה, Replay/Research/Live צריכים לדעת version.

---

# ‏190. Observability Cardinality

‏אסור להפוך כל symbol ל־metric label בכל metric אם זה מפוצץ cardinality.

‏משתמשים logs/traces או bounded Top-N labels לפי הצורך.

---

# ‏191. Metrics חשובים ל־Scanner

- ‏Universe size.
- ‏Fresh coverage.
- ‏Eligible count.
- ‏Events/sec.
- ‏Queue age.
- ‏Cycle latency.
- ‏Feature latency.
- ‏Top-N churn.
- ‏NO TRADE rate.
- ‏Rejection reasons.
- ‏Dropped/coalesced events.
- ‏Partition skew.

---

# ‏192. Histograms, Not Only Averages

‏Latency ו־age נשמרים כ־distribution.

---

# ‏193. Alerts צריכים להיות Actionable

‏Alert טוב:

```text
FreshCoverage < threshold for X seconds
```

‏פחות טוב:

```text
CPU = 72%
```

‏אלא אם 72% באמת קשור לבעיה.

---

# ‏194. Scanner SLO

‏אפשר להגדיר SLO לדוגמה:

```text
99% of ranking decisions use data younger than X
99% of cycles finish within Y
coverage above Z during eligible session
```

‏הערכים עצמם נקבעים empirically.

---

# ‏195. Research Scanner מול Production Scanner

‏Research יכול להרשות compute כבד.

‏Production חייב latency/robustness.

‏אבל semantics צריכים להיות aligned ככל האפשר.

---

# ‏196. Feature Parity

‏אם Research feature אינו ניתן לחישוב causal/live — הוא לא production-ready.

---

# ‏197. Offline Precomputation

‏דברים שאינם time-critical אפשר להכין offline:

- ‏symbol metadata.
- ‏liquidity baselines.
- ‏historical percentiles.
- ‏corporate action adjustments.

---

# ‏198. Online Features

‏דברים שתלויים עכשיו:

- ‏short returns.
- ‏activity burst.
- ‏flow.
- ‏book state.
- ‏freshness.

---

# ‏199. Static vs Dynamic Features

‏שומרים אותם בשכבות שונות כדי לא לעדכן unnecessary state.

---

# ‏200. Baseline Architecture לרובוט שלנו

‏Baseline פשוט:

```text
Market Data Events
→ Canonical Per-Symbol State
→ Incremental Fast Features
→ Cheap Eligibility Filters
→ Full-Universe Cheap Rank
→ Top-N
→ Deep Features + Execution Checks
→ Final Rank
→ Trade / No Trade
→ Execution Revalidation
```

---

# ‏201. Baseline Feature Budget

‏ב־All-Universe Fast Path נתחיל ב־Features זולים:

- ‏short-horizon returns.
- ‏activity/trade-rate.
- ‏basic spread/liquidity.
- ‏freshness.
- ‏tradability.

‏Flow/Book/Capacity עמוקים יותר יכולים להיות Top-N stage.

---

# ‏202. לא להתחיל עם 100 Features

‏יותר Features אינם בהכרח יותר Edge.

‏מתחילים עם baseline קטן שניתן להסביר.

---

# ‏203. Scanner Experiment Order

‏סדר מחקר בריא:

1. ‏baseline correctness.
2. ‏freshness/coverage.
3. ‏predictive ranking.
4. ‏execution-aware ranking.
5. ‏Deep Path.
6. ‏performance optimization.
7. ‏complex adaptive policies.

---

# ‏204. Correctness Before Speed

‏Scanner שמהיר פי 10 אבל מדרג timeline לא נכון הוא חסר ערך.

---

# ‏205. Speed Before Fancy Models

‏לאחר correctness, יש לוודא שהמערכת עומדת ב־latency budget לפני שמוסיפים model כבד.

---

# ‏206. Scanner Practitioner Secret — `Top 1` הוא אובייקט מסוכן

‏Top 1 נראה חד וברור, אבל הוא רגיש במיוחד ל־noise, ties ו־Winner's Curse.

‏לכן מקצועית מסתכלים גם על:

```text
Top-N neighborhood
separation
stability
confidence
```

---

# ‏207. Practitioner Secret — `Freshness` היא Feature

‏לא רק validation.

‏אותו Score עם age של 20ms ו־700ms אינו אותו signal.

---

# ‏208. Practitioner Secret — Scanner Load Correlates with Opportunity

‏דווקא כשהשוק נהיה מעניין, event rate עולה.

‏מערכת שבנויה רק ל־average day נכשלת בזמן הכי חשוב.

---

# ‏209. Practitioner Secret — Fastest Candidate Is Not Always Best Candidate

‏Candidate שקל לחשב/לקבל data עליו יכול לקבל structural advantage.

‏צריך לבדוק compute/data bias.

---

# ‏210. Practitioner Secret — Missing Data Creates Hidden Ranking Bias

‏אם חסר feature לחלק מהSymbols והמערכת ממלאת default, ranking עלול להעדיף קבוצה מסוימת.

---

# ‏211. Practitioner Secret — Candidate Funnel Can Overfit

‏גם filters עצמם יכולים להפוך ל־parameter hunting.

‏צריך validate funnel end-to-end.

---

# ‏212. Practitioner Secret — Deep Path Creates Conditional Dataset

‏כל analysis של Deep Features חייב לזכור שנבדקו רק מועמדים שכבר עברו filters קודמים.

---

# ‏213. Practitioner Secret — Rank Stability Can Be Fake

‏Smoothing חזק מדי יוצר ranking יציב אבל איטי.

‏Stability אינה תמיד טובה.

---

# ‏214. Practitioner Secret — Churn Can Be Information

‏Churn גבוה יכול להיות noise, אבל לפעמים הוא משקף genuine competition בין fast-moving candidates.

‏לא מדכאים אותו אוטומטית.

---

# ‏215. Practitioner Secret — Scanner Latency Is Endogenous

‏ה־latency מושפעת מהשוק עצמו.

‏לכן model שמתבסס על constant latency עלול להיות אופטימי.

---

# ‏216. Practitioner Secret — NO TRADE Reasons Are Research Data

‏אם רוב ה־NO TRADE נובעים מ־wide spread, זו תובנה אסטרטגית.

‏אם רובם נובעים מ־stale coverage, זו בעיית infra.

---

# ‏217. Practitioner Secret — Best Feature Can Be a System Health Feature

‏לפעמים לדעת ש־data stale חשוב יותר מעוד indicator מתוחכם.

---

# ‏218. Practitioner Secret — Recompute Only What Changed

‏Incremental dependency graph יכול להיות שווה יותר מעוד CPU cores.

---

# ‏219. Practitioner Secret — But Dependency Graphs Can Become Too Clever

‏אם invalidation logic מורכב מדי, correctness נפגע.

‏KISS עדיף עד שה־profile מוכיח אחרת.

---

# ‏220. Scanner RCA Taxonomy

‏Reason codes אפשריים:

```text
SC_STALE_INPUT
SC_LOW_COVERAGE
SC_BACKLOG
SC_PARTITION_SKEW
SC_BAD_EVENT
SC_FEATURE_NOT_READY
SC_RANK_UNSTABLE
SC_TOP1_LOW_SEPARATION
SC_DEEP_PATH_EXPIRED
SC_PROVIDER_DIVERGENCE
SC_CONFIG_MISMATCH
SC_REPLAY_DIVERGENCE
SC_EXECUTION_RECHECK_FAIL
```

---

# ‏221. Acceptance Criteria ל־Production Scanner

‏לפני כסף אמיתי צריך להוכיח:

- ‏Deterministic Replay.
- ‏No stale candidate submission.
- ‏Coverage gate עובד.
- ‏Burst load לא יוצר silent backlog.
- ‏Ranking explainable.
- ‏NO TRADE תקין.
- ‏Crash/restart recovery תקין.
- ‏Same state/config gives same outcome.

---

# ‏222. Stress Tests

‏חייבים לבדוק:

- ‏10× event rate.
- ‏1–5 hot symbols קיצוניים.
- ‏provider reconnect flood.
- ‏delayed partition.
- ‏DB/storage slowdown.
- ‏GC pressure.
- ‏deep-path slowdown.

---

# ‏223. Fault Injection

‏מזריקים:

```text
sequence gaps
late events
duplicates
bad ticks
stale quotes
missing trades
provider divergence
```

‏ובודקים failure mode צפוי.

---

# ‏224. Scanner Replay Gold Standard

‏אותו input log צריך לייצר:

```text
same features
same filters
same ranking
same decision reasons
```

‏בהינתן אותה version/config.

---

# ‏225. Performance Benchmark

‏שומרים benchmark baseline.

‏כל שינוי משמעותי ב־Scanner נבדק מולו.

---

# ‏226. Regression Budget

‏אם Feature חדש מוסיף 30% latency, הוא צריך להצדיק זאת ב־value.

---

# ‏227. Capacity Headroom Target

‏אין צורך לקבע מספר אוניברסלי, אבל production צריך headroom ניכר מעל observed peak.

---

# ‏228. Scanner Scaling

‏אם בעתיד Universe/Feed rate גדלים:

‏קודם optimize state/data path.

‏רק אחר כך scale-out אם צריך.

---

# ‏229. Scale-Up vs Scale-Out

‏4,000 Symbols אינם בהכרח דורשים distributed system.

‏מערכת single-process יעילה יכולה להספיק.

‏אל בונים cluster רק כי זה נשמע מקצועי.

---

# ‏230. Network Hop Tax

‏כל service split מוסיף:

```text
serialization
network latency
failure modes
observability burden
```

‏לכן microservices אינם ברירת מחדל ל־hot path.

---

# ‏231. In-Process Fast Path

‏לרובוט אישי, in-process pipeline יכול להיות יתרון גדול בפשטות וב־latency.

---

# ‏232. Separate Slow Services

‏Research, storage, reporting ו־dashboard יכולים להיות מחוץ ל־hot path.

---

# ‏233. Asynchronous Telemetry

‏Logging לא צריך לחסום Scanner.

‏אבל critical decision evidence חייב להיות durable מספיק לפי architecture.

---

# ‏234. Logging Backpressure

‏גם logger יכול להפיל מערכת.

‏צריך bounded async queues ו־drop policy ל־noncritical logs.

---

# ‏235. Critical Evidence Must Not Disappear Silently

‏אם decision journal לא יכול להישמר, אפשר להיכנס degraded/safe state.

---

# ‏236. Scanner Security

‏Input חיצוני נחשב untrusted.

‏Payload malformed לא צריך להפיל process.

---

# ‏237. Resource Exhaustion

‏מגינים מפני:

```text
unbounded queues
unbounded symbol creation
unbounded logging
unbounded history
```

---

# ‏238. Symbol Validation

‏לא יוצרים state לכל arbitrary ticker string שמגיע בלי validation.

---

# ‏239. Timezone Discipline

‏Internally משתמשים time representation עקבי.

‏Session logic אינו מבוסס על local machine time assumptions.

---

# ‏240. Clock Monitoring

‏Clock skew יכול לשבור freshness.

‏לכן clock health הוא production metric.

---

# ‏241. Final Baseline עבור הרובוט שלנו

‏בשלב ראשון נעדיף:

```text
simple incremental state
cheap full-universe scan
strict freshness
strict tradability
simple rank
small Top-N deep path
explicit NO TRADE
execution recheck
strong diagnostics
```

‏לפני שנוסיף architecture מתוחכם.

---

# ‏242. מה לא נעשה בתחילת הדרך

‏לא נתחיל עם:

- ‏distributed streaming cluster.
- ‏GPU ranking.
- ‏100+ features ב־hot path.
- ‏complex dynamic partition balancing.
- ‏microsecond optimization.
- ‏ML model כבד לכל 4,000 symbols בכל event.

‏אלא אם evidence מוכיח שזה נחוץ.

---

# ‏243. מה כן נמדוד מהיום הראשון

- ‏Fresh Coverage.
- ‏Feature Age.
- ‏Cycle/Decision Latency.
- ‏Queue Age.
- ‏Candidate Churn.
- ‏Rank Separation.
- ‏Rejection Reasons.
- ‏NO TRADE Reasons.
- ‏Top-N snapshots.
- ‏Decision-to-Fill latency.

---

# ‏244. Definition of Done ל־Scanner

‏Scanner נחשב production-ready רק אם:

1. ‏הוא דטרמיניסטי ב־Replay.
2. ‏הוא יודע להגיד `NO TRADE`.
3. ‏הוא לא מדרג stale data כאילו היא current.
4. ‏הוא מודד coverage ולא מניח coverage.
5. ‏הוא שורד bursts בלי silent backlog.
6. ‏הוא מפריד Fast Path מ־Deep Path.
7. ‏הוא מסביר כל winner.
8. ‏הוא revalidates לפני execution.
9. ‏הוא נכנס safe/degraded state כשאיכות המידע נפגעת.
10. ‏הוא נשאר פשוט ככל שניתן עד שהנתונים מצדיקים complexity.

---

# ‏245. מה צריך לזכור בעל פה

- ‏`Top 1` אינו בהכרח Trade.
- ‏Freshness ו־Coverage הם חלק מה־signal quality.
- ‏Fast Path צריך להיות זול ובעל recall גבוה.
- ‏Deep Path צריך לעבוד רק על מעט candidates.
- ‏Stale work עדיף לעיתים לזרוק מאשר להשלים באיחור.
- ‏Same State + Same Config חייבים להוביל לאותה החלטה.
- ‏`NO TRADE` הוא Output תקין.
- ‏Execution עושה revalidation.
- ‏Backpressure הוא בעיית Trading, לא רק DevOps.
- ‏Optimize רק bottleneck שנמדד.

---

# ‏246. משפט הסיכום

> ‏**Scanner מקצועי אינו זה שמחשב הכי הרבה. הוא זה שמזהה במהירות ובצורה דטרמיניסטית את מעט המועמדים שבאמת ראויים לבדיקה עמוקה, יודע מתי המידע שלו אינו מספיק טוב, ושומר מספיק Evidence כדי להסביר כל החלטה בדיעבד.**

---

# ‏247. מעבר לשלב הבא

‏השלב הבא הוא `Execution Engine Best Practices`.

‏שם נעבור מהשאלה “מי המועמד הטוב ביותר?” לשאלה “איך מממשים את ההחלטה בצורה בטוחה, idempotent, observable ו־recoverable — בלי duplicate orders, בלי לאבד partial fills ובלי להניח שהברוקר תמיד עונה בזמן”.
