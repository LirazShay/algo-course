# ‏44 — Recommendation Sheet: Advanced Order Flow

> ‏מקור לימודי עיקרי: `../44-ADVANCED-ORDER-FLOW.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, ארכיטקטוני ומתודולוגי ל־`Advanced Order Flow` עבור רובוט `Short-Horizon Momentum`, כך שנמדוד Aggression, קצב, Persistence ו־Price Response באופן point-in-time, confidence-aware ו־execution-aware — בלי להפוך prints לסיפורים, בלי להעמיד פנים ש־Aggressor Side תמיד ידוע, ובלי להכניס Feature מורכב ל־Score לפני Evidence מחוץ למדגם.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי.

---

## ‏1. Decision

‏`Order Flow` יוגדר אצלנו כ־Feature Family, לא כ־Strategy, לא כ־Execution Policy ולא כ־Source of Truth לגבי כוונת משתתפים.

‏ה־Baseline:

```text
Canonical Trades / Quotes
→ Conservative Trade Signing
→ Flow Aggregates
→ Price Response
→ Flow Quality / Confidence
→ Cross-Sectional Context
→ Candidate Diagnostics
→ Shadow Challenger
→ OOS + Execution-Aware Validation
→ Promotion / Rejection
```

‏העיקרון המחייב:

```text
Aggression alone is not edge.
Aggression + Price Response + Persistence + Confidence
is the research object.
```

‏אנחנו לא נשאל:

```text
Are buyers in control?
```

‏אלא:

```text
What aggressive flow was observed?
How confidently was it classified?
How fast and persistently did it arrive?
How did price and displayed liquidity respond?
Did the relationship survive until executable entry?
Did it add net value beyond the momentum baseline?
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Aggressor Side הוא Observation רק כאשר המקור באמת מספק אותו

‏אם ה־feed אינו מספק aggressor truth אמין, Trade Signing הוא `INFERRED`.

‏נשמור לכל Trade לפחות:

```text
aggressor_side = BUY | SELL | UNKNOWN
aggressor_provenance = OBSERVED | INFERRED
aggressor_confidence
quote_age_at_trade_ms
signing_method
```

‏אין forced classification רק כדי לקבל Dataset מלא.

### ‏`P0 — Required`: ‏`UNKNOWN` נשאר `UNKNOWN`

‏אם Trade נמצא באמצע ה־spread, quote stale, ordering ambiguous או data quality בעייתית:

```text
AggressorSide = UNKNOWN
```

‏לא ממשיכים Tick Rule או heuristic ללא סוף כדי להכריח צד.

### ‏`P0 — Required`: ‏Activity ו־Directional Pressure הם Features שונים

‏נפריד:

```text
Activity:
trade_count
volume
notional
quote_rate
book_update_rate

Directional Pressure:
signed_volume
signed_notional
signed_trade_count
aggression_ratio
```

‏Trade Count גבוה אינו אומר Buy Pressure.

### ‏`P0 — Required`: ‏Aggression חייבת להימדד יחד עם `Price Response`

‏Baseline Research Pair:

```text
Aggressive Flow
+
Price Response
```

‏מצב:

```text
strong buy aggression
+ strong upward progress
```

‏שונה מ־:

```text
strong buy aggression
+ flat/down price response
```

‏הראשון הוא `continuation_candidate`; השני יכול להיות `absorption_candidate`, noise או classification error.

### ‏`P0 — Required`: ‏Flow Quality הוא חלק מה־Feature Contract

‏כל Snapshot משמעותי יכלול:

```text
flow_quality
flow_confidence
unknown_share
quote_age
last_event_age
gap_state
duplicate_state
provider_health
```

‏Feature ללא Quality metadata אינו קביל ל־Decision Engine.

### ‏`P0 — Required`: ‏Point-in-Time correctness

‏לכל Snapshot נשמור לפחות:

```text
window_start
as_of_time
last_event_time
received_watermark
feature_ready_time
```

‏שום Event אחרי `as_of_time` אינו רשאי להיכנס ל־Snapshot ההיסטורי של אותה החלטה.

### ‏`P0 — Required`: ‏Flow אינו עוקף Tradability / Risk / Safety

```text
Trading Status
→ Data Quality
→ Flow Features
→ Ranking
→ Candidate Gate
→ Risk
→ Safety
→ Execution
```

‏Flow קיצוני אינו override ל־halt, stale data, wide spread, LULD proximity, unknown broker state או risk limit.

### ‏`P1 — Preferred Default`: ‏Fast Path פשוט לכל ה־Universe

‏ל־whole-market scanner נתחיל ב־Feature Set קטן וזול:

```text
trade_count_1s
trade_count_5s
signed_volume_1s
signed_volume_5s
imbalance_1s
imbalance_5s
notional_rate_1s
flow_acceleration
flow_persistence
price_response_1s
unknown_share
flow_confidence
```

‏לא נחשב L2/venue-heavy analytics לכל אלפי הסמלים בכל event.

### ‏`P1 — Preferred Default`: ‏Deep Path רק ל־Top-N

```text
Broad Flow Scan
→ Top-N Candidates
→ Deep Flow Enrichment
```

‏Deep Path יכול לכלול בהמשך:

```text
book depletion
replenishment
absorption_candidate
sweep_candidate
multi-level response
venue-aware context
advanced markout context
```

### ‏`P1 — Preferred Default`: ‏Flow מתחיל כ־Shadow Challenger

‏ה־Champion נשאר ה־Momentum baseline שכבר קיים.

```text
Champion:
Price / Activity / Executability baseline

Challenger:
Baseline + Flow Family
```

‏Flow לא מקבל משקל קבוע ב־Score לפני OOS evidence.

---

## ‏3. למה זו ברירת המחדל

‏`Order Flow` עשיר מאוד ב־degrees of freedom:

- ‏signing method.
- ‏window size.
- ‏normalization.
- ‏rate definitions.
- ‏burst thresholds.
- ‏persistence definitions.
- ‏response horizons.
- ‏absorption heuristics.
- ‏sweep heuristics.
- ‏venue filters.
- ‏trade-condition filters.

‏לכן הוא אזור מסוכן במיוחד ל־overfitting ול־storytelling.

‏הדרך הפשוטה והניתנת להפרכה היא:

```text
Classify conservatively
→ Aggregate simply
→ Measure response
→ Carry confidence
→ Validate incrementally
```

---

## ‏4. Core Concepts

### ‏Activity

```text
How much is happening?
```

### ‏Aggression

```text
Which side is taking liquidity?
```

### ‏Persistence

```text
Does the pressure persist or alternate?
```

### ‏Price Response

```text
Does price actually move in the direction of pressure?
```

### ‏Liquidity Response

```text
Does displayed liquidity deplete, replenish or move away?
```

### ‏Confidence

```text
How trustworthy is the observed/inferred Flow state?
```

‏ה־Flow Family שלנו לא תערבב concepts אלה למספר אחד בשלב הראשון.

---

## ‏5. Trade Signing Baseline

### ‏Baseline A — Quote Rule

‏כאשר quote טרי ואמין:

```text
trade near ask → BUY_AGGRESSOR
trade near bid → SELL_AGGRESSOR
otherwise → UNKNOWN
```

### ‏Fallback B — Tick Rule

‏רק אם מוגדר בניסוי נפרד וכאשר Quote Rule אינו זמין מספיק.

```text
price > previous_trade → positive
price < previous_trade → negative
same price → configured fallback or UNKNOWN
```

### ‏לא עושים

‏לא ניצור “hybrid magic classifier” עם עשרות heuristics לפני שנמדוד:

```text
coverage
unknown_share
classification stability
predictive delta
```

---

## ‏6. `CanonicalTrade` Baseline

```text
CanonicalTrade
- instrument_id
- price
- size
- notional
- event_time
- received_time
- venue
- conditions
- source
- aggressor_side
- aggressor_provenance
- aggressor_confidence
- quote_age_at_trade_ms
- signing_method_version
```

‏Raw trade conditions ו־provider metadata נשמרים ככל שניתן, כדי שנוכל לתקן semantics בעתיד בלי לאבד Evidence.

---

## ‏7. `CanonicalQuote` Baseline

```text
CanonicalQuote
- instrument_id
- bid_price
- bid_size
- ask_price
- ask_size
- event_time
- received_time
- source
- sequence?
- quality
```

‏Quote שמשמש ל־Trade Signing חייב להיות Point-in-Time compatible עם ה־Trade, לא quote עתידי שנראה “נכון יותר” בדיעבד.

---

## ‏8. Signed Flow Baseline

### ‏Signed Volume

```text
signed_volume
=
buy_aggressive_volume
-
sell_aggressive_volume
```

### ‏Normalized Imbalance

```text
flow_imbalance
=
(buy_volume - sell_volume)
/
max(buy_volume + sell_volume, epsilon)
```

### ‏Signed Notional

```text
signed_notional
=
buy_notional
-
sell_notional
```

### ‏Signed Trade Count

```text
signed_trade_count
=
buy_count
-
sell_count
```

‏לא נבחר מראש איזה מהם “הכי טוב”. הם נכנסים ל־Ablation.

---

## ‏9. Unknown Share

‏נשמור מפורשות:

```text
unknown_share
=
unknown_volume / total_volume
```

‏וכן לפי count:

```text
unknown_trade_share
```

‏`unknown_share` גבוה יכול להפוך Feature מ־`GOOD` ל־`DEGRADED` גם אם imbalance המספרי קיצוני.

---

## ‏10. Flow Rate

‏בגלל שה־horizon שלנו קצר, Rate חשוב לא פחות מהכמות:

```text
buy_volume_per_second
sell_volume_per_second
signed_notional_per_second
trades_per_second
```

‏אותה כמות ב־250ms וב־10s אינה אותו מצב.

---

## ‏11. Flow Acceleration

‏Baseline פשוט:

```text
recent_rate - previous_rate
```

‏או:

```text
rate_short / max(rate_long, epsilon)
```

‏אבל Ratio לא יקבל שימוש כאשר denominator קטן או לא יציב ללא guard מפורש.

---

## ‏12. Persistence / Alternation

‏נמדוד לפחות:

```text
same_sign_duration
same_sign_window_count
sign_flip_count
sign_flip_rate
longest_run
```

‏Burst חד־פעמי אינו שקול ל־pressure שנמשך כמה חלונות רצופים.

---

## ‏13. Burstiness

‏Feature candidate:

```text
max_trades_in_short_subwindow
max_signed_volume_in_short_subwindow
max_notional_rate
```

‏`250ms/500ms` הם examples, לא constants מומלצים. החלונות צריכים להיבדק מול resolution, latency ו־provider semantics.

---

## ‏14. Price Response

‏זהו אחד ה־P1 החשובים ביותר.

‏לכל Flow state נמדוד response בכמה horizons:

```text
response_100ms
response_250ms
response_500ms
response_1s
response_2s
response_5s
```

‏רק horizons שנתמכים אמפירית וברזולוציית הנתונים.

---

## ‏15. Flow-to-Price Efficiency

‏נחקור proxy כגון:

```text
price_progress
/
max(abs(signed_notional), epsilon)
```

‏אבל לא נניח ליניאריות.

‏המטרה היא להבחין בין:

```text
strong aggression + strong progress
```

‏לבין:

```text
strong aggression + weak progress
```

---

## ‏16. `Absorption Candidate`

‏נשתמש במונח Candidate בלבד.

```text
high aggression
+ weak same-direction price progress
+ repeated replenishment if visible
```

‏לא נכתוב:

```text
institutional seller absorbing buyers
```

‏מפני שזה Actor inference שאינו נצפה ישירות.

---

## ‏17. `Exhaustion Candidate`

‏נפריד אותו מ־Absorption:

```text
aggression rate declining
+ trade intensity declining
+ failure to extend price move
```

‏Absorption = Aggression קיימת אך response חלש.

‏Exhaustion = Aggression עצמה נחלשת.

---

## ‏18. `Sweep Candidate`

‏ללא L2/venue-rich data, לא נטען שזיהינו Sweep אמיתי.

‏נוכל לשמור `sweep_candidate` לפי evidence זמין:

```text
rapid aggressive flow
+ price displacement
+ multiple displayed levels consumed if observable
+ short elapsed time
```

‏ה־confidence יורד כאשר אין level/venue evidence.

---

## ‏19. Depletion / Replenishment

‏Deep Path בלבד בשלב הראשון.

```text
Ask depletion + upward price progress
```

‏שונה מ־:

```text
Ask depletion + repeated Ask replenishment + flat price
```

‏נזכור ש־snapshot size changes אינם בהכרח Add/Cancel truth ללא event-level book data.

---

## ‏20. Flow × Book Interaction

‏שלב 44 ישמור את הממשק, אך Book Imbalance עצמו יטופל עמוק יותר ב־45.

‏נרצה לאפשר Interaction עתידי:

```text
Aggressive Flow
×
Displayed Book State
×
Price Response
```

‏מבלי לספור את אותו מידע פעמיים ב־Score.

---

## ‏21. Multi-Horizon Baseline

‏נשמור מספר horizons ולא ערך יחיד.

‏Baseline Research Set אפשרי:

```text
500ms
1s
2s
5s
10s
```

‏חלונות קצרים יותר או ארוכים יותר הם Challenger בהתאם ל־data fidelity.

‏לא נניח שכל Symbol וכל Market Regime דורשים אותו horizon.

---

## ‏22. Wall-Time + Event-Time Views

‏נשמור לפחות שני views:

```text
Wall-time windows
Event-count windows
```

‏לדוגמה:

```text
last 2s
last 50 trades
```

‏הם עונים על שאלות שונות.

---

## ‏23. Time-of-Day Normalization

‏Activity ב־Open אינה דומה ל־Midday.

‏לכן נבחן:

```text
current_flow_rate
/
expected_flow_rate_same_time_of_day
```

‏אבל normalization כזה ילמד רק מ־Train period ולא מכל Dataset.

---

## ‏24. Symbol-Normalized Surprise

‏`Absolute Flow` ו־`Flow Surprise` יישמרו בנפרד.

```text
flow_surprise
=
observed_flow
-
expected_flow_given_symbol_and_context
```

‏בשלב ראשון אפשר להתחיל מ־percentiles/ratios פשוטים לפני מודל expected flow מורכב.

---

## ‏25. Cross-Sectional Flow

‏ל־whole-market scanner נרצה לדעת:

```text
Where is this symbol relative to the current fresh universe?
```

‏ולכן נחשב Candidate features כגון:

```text
flow_percentile
flow_rank
flow_rank_gap
flow_separation
```

‏רק כאשר `fresh_coverage_ratio` מספיק גבוה.

---

## ‏26. Market / Sector Context

‏נבחן בהמשך:

```text
symbol_flow_vs_market
symbol_flow_vs_sector
market_flow_breadth
flow_dispersion
flow_density
```

‏אבל אלה `P2/P3`; הם אינם Baseline לפני שנדע אם Flow בסיסי מוסיף value בכלל.

---

## ‏27. Flow Confidence

‏Baseline אפשרי:

```text
FlowConfidence = f(
  unknown_share,
  quote_age,
  sequence_integrity,
  source_health,
  coverage_quality
)
```

‏לא נתחיל מ־black-box Confidence Score.

‏בשלב ראשון נשמור כל component בנפרד ו־derived confidence פשוט ומוסבר.

---

## ‏28. Flow Quality States

```text
GOOD
DEGRADED
STALE
GAPPED
UNKNOWN
```

‏Transition ל־`GAPPED` או `STALE` אינו cosmetic warning; הוא משפיע על candidate eligibility או לפחות על Flow weight לפי policy.

---

## ‏29. Sequence Gaps

‏אם Provider מספק sequence semantics ואיבדנו events:

```text
flow_quality = GAPPED
```

‏לא ממשיכים כאילו signed volume מלא.

‏Recovery יכול לדרוש snapshot/reseed או פשוט expiration של חלון פגום.

---

## ‏30. Duplicate Events

‏Duplicate Trade יכול לנפח גם:

```text
trade_count
volume
signed_volume
flow_rate
```

‏לכן dedupe הוא correctness invariant, לא optimization.

---

## ‏31. Late Events

‏Policy baseline:

```text
Late event after live decision watermark:
- keep for audit
- do not rewrite the already-issued live decision
- optionally use for corrected historical reconstruction
```

‏נשמור גם `event_time` וגם `received_time` כדי למדוד detection/arrival distortion.

---

## ‏32. Provider Ordering

‏לא נניח שה־arrival order של Trades/Quotes שווה ל־exchange causal order.

‏Trade Signing policy תתועד לפי semantics של אותו Provider.

‏אם החלפנו Provider, זהו Feature/Data experiment חדש.

---

## ‏33. Provider Fingerprint

‏בכל Run Manifest נשמור:

```text
provider
feed
entitlements
schema_version
normalization_version
trade_signing_version
flow_feature_version
```

‏כדי להבדיל Strategy drift מ־Provider drift.

---

## ‏34. Feature Provenance

‏כל `OrderFlowSnapshot` יכלול לפחות:

```text
instrument_id
as_of_time
provider
window_set
last_event_time
feature_ready_time
quality
confidence
feature_version
```

---

## ‏35. Immutable Snapshot

‏ה־Decision Engine יקבל Snapshot immutable ל־`as_of_time` מוגדר.

‏כך:

```text
same input events
+ same versions
=> same flow snapshot
```

‏זה invariant ל־Replay determinism.

---

## ‏36. Fast Path Architecture

```text
Canonical Event
→ O(1)-style rolling aggregate update
→ Cheap flow features
→ Current Flow Snapshot
→ Scanner
```

‏המטרה היא incremental computation ולא rescanning של raw history בכל Tick.

---

## ‏37. Deep Path Architecture

```text
Top-N Candidate
→ richer book/venue/event context
→ deep flow diagnostics
→ Candidate Gate / Shadow Feature
```

‏כך נמנע Complexity Tax ו־latency tax לכל ה־Universe.

---

## ‏38. Raw / Replayable Evidence

‏העדפה:

```text
raw or canonical replayable event capture
+ rolling aggregates
```

‏במקום לשמור רק Flow Score סופי שאי אפשר להסביר בדיעבד.

---

## ‏39. Candidate Funnel

‏Flow אינו Rank ישיר.

```text
Tradable Universe
→ Data Quality
→ Activity
→ Momentum
→ Flow Fast Path
→ Ranking
→ Top-N
→ Deep Enrichment
→ Executability
→ Candidate Gate
→ TRADE / NO_TRADE
```

---

## ‏40. `Flow` אינו Liquidity

‏Flow קיצוני יכול להתרחש כאשר:

```text
spread wide
depth thin
price unstable
```

‏ולכן:

```text
Predictive Flow
!=
Executable Opportunity
```

---

## ‏41. `Flow` אינו Risk Permission

‏גם `FlowConfidence=HIGH` ו־Top percentile אינם יכולים לעקוף:

```text
position limits
pending exposure
safety state
trading status
broker readiness
```

---

## ‏42. `Flow` אינו Execution Tactic

‏Flow יכול להשפיע בעתיד על Execution Policy experiment, למשל stale-flow abort.

‏אבל Feature Engine לא ישלח Cancel/Replace בעצמו.

---

## ‏43. Signal TTL

‏נמדוד אמפירית `Flow Half-Life`.

‏עד אז:

```text
Flow Snapshot has explicit age.
```

‏Entry Intent שאינו עומד ב־Flow freshness requirement לא משתמש ב־Flow ישן כאילו הוא עדיין תקף.

---

## ‏44. Decision → Submit → Fill Decay

‏לכל Trade מחקרי נשמור:

```text
flow_at_decision
flow_at_submit
flow_at_fill
```

‏ונחשב:

```text
flow_decay_to_submit
flow_decay_to_fill
flow_flip_before_fill
```

‏זהו מדד קריטי לשאלה האם Flow signal מהיר מספיק כדי להיות executable.

---

## ‏45. Flow Flip Before Fill

‏בשלב הראשון זה Diagnostic בלבד.

‏בהמשך אפשר Challenger:

```text
if directional flow flips before fill:
    cancel/abort remainder
```

‏אבל לא נכניס זאת ל־Execution Policy לפני Replay/Shadow evidence על cancel latency, missed fills ו־net outcome.

---

## ‏46. Price Response vs Forward Label

‏`Price Response` הוא Feature/Context עד `as_of_time`.

‏`Forward Return` הוא Label אחרי `as_of_time`.

‏אסור לערבב ביניהם.

---

## ‏47. Labels

‏למחקר נשתמש ב־:

```text
forward_return_1s
forward_return_2s
forward_return_5s
forward_return_10s
executable_forward_return
net_forward_return
MFE
MAE
time_to_first_profit
time_to_target
```

‏כל Label חייב להיות point-in-time ו־execution-aware לפי רמת fidelity המתאימה.

---

## ‏48. Primary Research Question

```text
Does Flow add incremental net predictive value
beyond the existing momentum/activity baseline?
```

‏לא:

```text
Does Flow look intuitive on a chart?
```

---

## ‏49. Secondary Research Question

‏נבדוק בנפרד:

```text
Flow as Winner Selector
vs
Flow as Bad-Candidate Filter
```

‏ייתכן ש־Flow מועיל יותר ב־`NO_TRADE` מאשר בבחירת Rank #1.

---

## ‏50. Absorption as Entry vs Exit Feature

‏נבדוק בנפרד:

```text
Does absorption improve entry selection?
Does absorption improve exit timing?
```

‏לא נניח שהשימוש הטוב ביותר שלו הוא Entry.

---

## ‏51. Flow Buckets לפני Threshold Magic

‏במקום לקבוע:

```text
imbalance > 0.73
```

‏ננתח buckets/percentiles ונבדוק monotonicity ו־robust regions.

---

## ‏52. Continuous Before Discrete State

‏נשמור continuous Features:

```text
imbalance
rate
persistence
response
confidence
```

‏ואז נגזור UI/RCA labels כגון:

```text
BUY_PRESSURE
BUY_ABSORPTION
FLOW_REVERSAL
```

‏לא להפך.

---

## ‏53. Flow Episode

‏כדי להימנע מ־sample-size illusion, נוכל לקבץ רצף events ל־Episode:

```text
start
peak
end
max_imbalance
max_rate
persistence
price_response
outcome
```

‏Episode evaluation יהיה `P2` אחרי event-level baseline.

---

## ‏54. Overlapping Labels

‏Event-frequency data מייצר observations מאוד תלויים.

‏לכן:

```text
1 million ticks
!=
1 million independent samples
```

‏נשתמש chronological splits, episode-aware analysis ו־cluster-aware uncertainty כאשר נדרש.

---

## ‏55. Cross-Sectional Consistency

‏Ranking חייב להשתמש ב־logical common `as_of_time`/watermark.

‏נשמור:

```text
rank_as_of
universe_size
fresh_symbol_count
fresh_coverage_ratio
```

‏אם Fresh Coverage אינו מספיק:

```text
rank_trusted = false
```

---

## ‏56. Flow Rank Churn

‏נמדוד:

```text
rank_churn_rate
candidate_persistence
flow_rank_velocity
flow_rank_gap
```

‏Rank #1 שחי 50ms אינו בהכרח executable Candidate.

---

## ‏57. Winner's Curse

‏Extreme Flow יכול להיות:

- ‏תחילת continuation.
- ‏Late-stage chase.
- ‏exhaustion.
- ‏absorption.
- ‏data artifact.

‏לכן Top1 extremeness עצמו אינו promotion criterion.

---

## ‏58. Fast Market Interaction

‏ב־Fast Market:

```text
quote_age ↑
classification uncertainty ↑
book half-life ↓
processing lag may ↑
```

‏לכן Flow Confidence יכול לרדת גם כאשר Flow magnitude עולה.

---

## ‏59. Halt / LULD Interaction

‏Flow קיצוני ליד LULD נשאר קודם כל Risk/Execution context.

‏`TradingStatus` ו־Safety של מקטע 43 מקדימים Flow Score.

---

## ‏60. Trade Conditions

‏לא נמחק Trade Conditions לפי רשימת “כללים אוניברסלית”.

‏Policy תהיה provider-specific, versioned ומתועדת.

‏כל שינוי filtering הוא Feature Version חדש.

---

## ‏61. Venue-Level Flow

‏`P3/P4` בלבד.

‏נדרש קודם להבין:

```text
execution venue
reporting venue
TRF/off-exchange semantics
condition codes
delayed reporting
coverage
```

‏ללא זאת venue-level Flow עלול להיות false precision.

---

## ‏62. Odd Lots

‏לא נניח ש־small prints הם Noise.

‏ה־Adapter ישמר אותם לפי feed semantics, וכל filtering ייבדק אמפירית.

---

## ‏63. Large Trades

‏לא נשתמש במונח “institutional trade” על סמך size בלבד.

‏נוכל למדוד:

```text
large_trade_share
p90_size
p95_size
max_size
```

‏כאשר Large מוגדר normalized לפי Symbol/context.

---

## ‏64. Count vs Volume Divergence

‏נשמור בנפרד:

```text
buy_count_dominance
signed_volume
signed_notional
```

‏כי:

```text
many small buys
+
few large sells
```

‏יכול לתת Sign שונה לפי metric.

---

## ‏65. Flow-to-ADV

‏ADV הוא Context בלבד, לא normalization יחיד ל־seconds strategy.

‏נעדיף לשלב גם intraday/local baseline.

---

## ‏66. Flow Surprise

‏`P2`:

```text
observed_flow
vs
expected_flow_same_symbol/time/regime
```

‏רק לאחר baseline פשוט של absolute/rate/percentile Features.

---

## ‏67. Flow Toxicity

‏לא נתחיל ממדד אקזוטי.

‏Baseline empirical components:

```text
aggression
price_response
post-event markout
our passive-fill markout
```

‏כך נמנע “Toxicity Score” שאי אפשר להסביר.

---

## ‏68. Markout

‏נמדוד Flow continuation/adverse selection ב־horizons שמתאימים למערכת:

```text
250ms
500ms
1s
2s
5s
10s
```

‏לפי resolution וזמינות.

---

## ‏69. Execution-Aware Validation

‏Flow Feature מתקדם רק אם השיפור שורד:

```text
spread
slippage
fill probability
missed opportunity
signal decay
fees
```

‏Raw forward return בלבד אינו מספיק.

---

## ‏70. Latency Tax

‏לכל Challenger נמדוד:

```text
feature_compute_latency
feature_ready_age
rank_latency
decision_latency
```

‏Feature predictive יותר אבל איטי יותר יכול להיות Net Regression.

---

## ‏71. Complexity Tax

‏Promotion דורש לא רק predictive delta אלא גם:

```text
operational stability
debuggability
replayability
provider portability
maintainability
```

---

## ‏72. Ablation Ladder

```text
A0 Momentum baseline
A1 + simple imbalance
A2 + flow rate
A3 + persistence
A4 + price response
A5 + confidence
A6 + deep absorption/depletion context
```

‏כל שלב נמדד בנפרד. לא נוסיף חבילת Features גדולה וננסה לנחש אחר כך מי תרם.

---

## ‏73. Redundancy Control

‏Features כגון:

```text
buy_volume
buy_ratio
imbalance
signed_volume
```

‏יכולים לשאת מידע חופף.

‏נבדוק correlation, ablation ו־incremental value לפני weighting מצטבר.

---

## ‏74. Feature Registry

‏לכל Feature נשמור:

```text
name
version
window
inputs
normalization
quality_rules
latency_budget
status = SHADOW | CHALLENGER | PROMOTED | RETIRED
```

---

## ‏75. Feature Retirement

‏Feature שלא מוסיף value יציב יוסר גם אם השקענו בו זמן.

‏Sunk cost אינו promotion criterion.

---

## ‏76. Shadow Features

‏Feature חדש יכול לרוץ בזמן אמת בלי להשפיע על Candidate/Order.

‏כך נמדוד:

```text
live distribution
latency
quality
drift
counterfactual decision impact
```

---

## ‏77. Champion / Challenger

‏Baseline experiment:

```text
Champion = current momentum ranking
Challenger = same system + Flow sub-score/gate
```

‏לא משנים במקביל Entry, Exit, Size, Universe ו־Execution tactic.

---

## ‏78. Decision Impact Evaluation

‏נתמקד ב־cases שבהם Flow באמת שינה החלטה:

```text
baseline candidate != flow candidate
baseline TRADE != flow NO_TRADE
baseline NO_TRADE != flow TRADE
```

‏כך נמנע מ־performance illusion כאשר שתי הגרסאות עושות כמעט אותו דבר.

---

## ‏79. Promotion Criteria

‏Flow Feature/Policy מתקדם רק אם:

- ‏השיפור OOS.
- ‏השיפור execution-aware ו־cost-aware.
- ‏ה־effect עקבי ביותר מתקופת/Regime אחת.
- ‏אין tail-risk חדש משמעותי.
- ‏Freshness/Quality failure behavior ידוע.
- ‏Latency tax אינו מוחק את השיפור.
- ‏Replay ו־Shadow מתיישבים מספיק.
- ‏ה־Decision impact sample מספיק.

---

## ‏80. Rejection Criteria

‏נדחה Feature כאשר:

- ‏השיפור קיים רק In-Sample.
- ‏השיפור תלוי threshold נקודתי ולא region יציב.
- ‏unknown/gapped data הופכים אותו לאמין פחות מדי.
- ‏אין incremental value מעל Momentum/Activity.
- ‏הוא משפר Hit Rate אך מוריד Net outcome.
- ‏הוא עובד רק עם future-perfect ordering שאינו קיים Live.
- ‏הוא מגדיל latency מעבר ל־signal half-life.
- ‏הוא דורש data tier שאינו זמין/כלכלי בלי ROI ברור.

---

## ‏81. Failure Modes

### ‏F1 — Forced Trade Signing

‏**Symptom:** Unknown trades מקבלים צד בכוח.

‏**Risk:** False imbalance.

‏**Control:** `UNKNOWN` + confidence.

### ‏F2 — Stale Quote Signing

‏**Symptom:** Trade מסווג מול Quote ישן.

‏**Risk:** Aggressor inversion.

‏**Control:** quote-age guard + degraded quality.

### ‏F3 — Duplicate Burst

‏**Symptom:** אותו Trade מגיע פעמיים.

‏**Risk:** Volume/Rate inflation.

‏**Control:** dedupe + golden test.

### ‏F4 — Sequence Gap

‏**Symptom:** חסרים events.

‏**Risk:** Signed Flow incomplete.

‏**Control:** `GAPPED` + expire/reseed policy.

### ‏F5 — Future Event Leakage

‏**Symptom:** Event אחרי Decision נכנס ל־Snapshot.

‏**Risk:** Fake predictive edge.

‏**Control:** immutable as-of watermark + replay test.

### ‏F6 — Storytelling Absorption

‏**Symptom:** strong buy flow + flat price מתויג “institutional seller”.

‏**Risk:** Actor inference בלי evidence.

‏**Control:** `absorption_candidate` בלבד.

### ‏F7 — Extreme Flow Chase

‏**Symptom:** תמיד רודפים אחרי Top1 Flow.

‏**Risk:** Winner's curse / late entry.

‏**Control:** forward net labels + signal decay analysis.

### ‏F8 — Flow Works, Execution Fails

‏**Symptom:** prediction נכון, fill מאוחר.

‏**Risk:** Alpha blamed incorrectly.

‏**Control:** decision/submit/fill Flow snapshots.

### ‏F9 — Provider Drift

‏**Symptom:** Flow distribution משתנה אחרי feed change.

‏**Risk:** false strategy drift.

‏**Control:** provider fingerprint + differential replay.

### ‏F10 — Whole-Market Skew

‏**Symptom:** fast symbols מקבלים יתרון ranking כי הם מעודכנים יותר.

‏**Risk:** update-frequency bias.

‏**Control:** common watermark + fresh coverage gate.

---

## ‏82. Operational Invariants

```text
No future event enters an as-of flow snapshot.
Unknown aggressor remains unknown unless evidence changes.
Gapped data cannot be marked GOOD.
Duplicate events cannot increase economic volume twice.
Flow cannot override non-tradable status.
Flow cannot override Risk or Safety.
Rank is untrusted when fresh cross-sectional coverage is inadequate.
Provider/version changes create a new feature experiment boundary.
Replay with same event stream + versions produces same snapshots.
```

---

## ‏83. Property Tests

```text
buy_volume >= 0
sell_volume >= 0
unknown_volume >= 0
abs(flow_imbalance) <= 1
classified_volume + unknown_volume <= total_volume + tolerance
last_event_time <= as_of_time
flow_quality != GOOD when unresolved sequence gap exists
```

---

## ‏84. Golden Scenarios

‏נשמור לפחות:

1. ‏Strong buy continuation.
2. ‏Strong sell continuation.
3. ‏Buy absorption candidate.
4. ‏Sell absorption candidate.
5. ‏Exhaustion.
6. ‏Flow reversal.
7. ‏Many small buys / few large sells.
8. ‏Trade at mid → unknown.
9. ‏Stale quote during fast market.
10. ‏Sequence gap.
11. ‏Duplicate burst.
12. ‏Late event.
13. ‏Provider reorder.
14. ‏Candidate #1 lives only 50ms.
15. ‏Flow flips before fill.
16. ‏High flow but wide spread → `NO_TRADE`.

---

## ‏85. Replay Requirements

‏Replay צריך לשחזר:

```text
trade event
quote state
arrival ordering
flow snapshot
rank update
decision
submit
fill
```

‏כדי שנוכל למצוא `First Divergence` בין Live ל־Replay.

---

## ‏86. Differential Testing

‏נריץ אותו event stream דרך:

```text
FlowEngine vN
FlowEngine vN+1
```

‏ונשווה:

```text
snapshots
ranks
decisions
changed-decision set
```

---

## ‏87. Observability

‏Dashboard בסיסי:

```text
trades_per_sec
signed_volume_per_sec
unknown_share
flow_quality_counts
flow_confidence_distribution
sequence_gap_count
top_flow_percentiles
flow_rank_churn
flow_compute_latency_p95/p99
```

---

## ‏88. Candidate Diagnostics

‏ל־Top Candidate נציג:

```text
price path
buy/sell flow
trade intensity
price response
unknown share
flow confidence
spread
depth
rank
rank gap
```

‏כך `Why #1?` נשאר Explainable.

---

## ‏89. Decision Record

```text
DecisionId
AsOfTime
InstrumentId
MomentumFeatures
FlowFeatures
FlowQuality
FlowConfidence
Rank
RankGap
Spread
Depth
Tradability
Decision
ReasonCodes
FeatureVersions
```

---

## ‏90. Execution Join

```text
DecisionId
OrderIntentId
SubmitTime
FillTime
FlowAtDecision
FlowAtSubmit
FlowAtFill
FillPrice
ImplementationShortfall
Markout
NetOutcome
```

---

## ‏91. RCA — Prediction Failure

‏נבדוק:

```text
Was flow actually directional?
Was confidence sufficient?
Was there absorption?
Was flow already exhausting?
Was price response consistent?
Was candidate merely an extreme late-stage outlier?
```

---

## ‏92. RCA — Execution Failure

‏אם Flow prediction היה נכון אך Fill איחר:

```text
Prediction = potentially valid
Execution = bottleneck
```

‏לא נעניש אוטומטית את Feature.

---

## ‏93. RCA — Data Failure

‏Gap/duplicate/order mismatch הם Data incidents.

‏הם לא Strategy failures.

---

## ‏94. Success RCA

‏גם הצלחה מפורקת:

```text
flow state
price response
signal age
fill delay
flow decay
markout
net outcome
```

‏כדי להבדיל Repeatable mechanism מ־luck.

---

## ‏95. Metrics — Predictive

```text
forward return by flow bucket
net forward return by flow bucket
MFE / MAE
monotonicity
Top-N lift
changed-decision lift
```

---

## ‏96. Metrics — Data Quality

```text
unknown_share
stale_quote_signing_rate
sequence_gap_rate
duplicate_rate
late_event_rate
flow_quality_distribution
```

---

## ‏97. Metrics — Cross Section

```text
fresh_coverage_ratio
flow_rank_churn
candidate_persistence
flow_rank_gap
flow_breadth
flow_dispersion
```

---

## ‏98. Metrics — Execution Coupling

```text
flow_age_at_submit
flow_age_at_fill
flow_flip_before_fill_rate
signal_survival_to_submit
signal_survival_to_fill
net_edge_retained
```

---

## ‏99. Performance Priorities

‏Optimize לפי הסדר:

```text
Correctness
→ Incremental rolling aggregation
→ Freshness
→ Whole-market consistency
→ Top-N enrichment
→ Advanced feature sophistication
```

‏לא להפך.

---

## ‏100. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏Deep learning על tick stream.
- ‏Dozens of microstructure transforms.
- ‏Per-symbol hand-tuned thresholds.
- ‏Forced aggressor classification.
- ‏Venue-level inference בלי semantics אמינים.
- ‏Actor identification.
- ‏Complex Flow State machine במקום continuous features.
- ‏Flow-controlled execution לפני baseline prediction validation.
- ‏Hidden-liquidity narratives.
- ‏HFT architecture שאינה תואמת לסביבת latency שלנו.

---

## ‏101. What to Add Later

### ‏`P2`

- ‏Time-of-day Flow Surprise.
- ‏Episode-level evaluation.
- ‏Absorption / Exhaustion enrichment.
- ‏Flow persistence in Candidate Gate.
- ‏Decision-to-fill Flow decay monitoring.

### ‏`P3`

- ‏Sector/market-relative Flow.
- ‏Venue-aware Flow.
- ‏advanced event clocks.
- ‏dynamic confidence by regime.
- ‏Flow-aware execution challenger.

### ‏`P4`

- ‏MBO/L3 flow reconstruction.
- ‏learned trade-signing classifier.
- ‏learned Flow representation.
- ‏high-dimensional venue microstructure models.

---

## ‏102. Required Data / Evidence

‏לפני promotion נרצה:

- ‏Point-in-time Trades.
- ‏Point-in-time Quotes.
- ‏Event/receive timestamps.
- ‏Trade Conditions כאשר זמינים.
- ‏Provider/source metadata.
- ‏Sequence/gap evidence כאשר זמין.
- ‏Execution joins.
- ‏Spread/depth context.
- ‏Regime context.
- ‏OOS chronological sample.
- ‏Replay parity.

---

## ‏103. Fact / Judgment / Hypothesis

### ‏Facts / structural truths

- ‏בכל Trade יש קונה ומוכר; Aggressor הוא הצד שיזם liquidity taking.
- ‏אם ה־feed אינו מספק aggressor truth, Signing הוא inference.
- ‏Activity ו־Directional Pressure אינם אותו metric.
- ‏Price Response מוסיף מידע שאין ב־Flow magnitude לבדו.
- ‏Late/duplicate/missing events יכולים לעוות Flow Features.
- ‏Point-in-time correctness נדרש כדי למנוע leakage.

### ‏Judgments

- ‏להתחיל עם Flow Feature Set קטן.
- ‏Quote-rule-first עם `UNKNOWN` כ־Baseline.
- ‏Fast Path לכל ה־Universe ו־Deep Path ל־Top-N.
- ‏להכניס Flow תחילה כ־Shadow Challenger.
- ‏למדוד Aggression יחד עם Price Response ו־Confidence.

### ‏Hypotheses

- ‏Flow מוסיף predictive value מעל Momentum.
- ‏Flow מועיל יותר כ־bad-candidate filter מאשר winner selector.
- ‏Absorption מועיל ל־Exit או Entry.
- ‏Flow persistence משפר execution viability.
- ‏Flow extremes מסוימים מנבאים continuation ולא exhaustion.

---

## ‏104. Confidence

### ‏High

- ‏Need for `UNKNOWN` trade classification.
- ‏Point-in-time snapshots.
- ‏Quality metadata.
- ‏Separation of Activity/Aggression/Response.
- ‏Replayable evidence.
- ‏Execution-aware validation.

### ‏Medium-High

- ‏Fast Path/Deep Path architecture לרובוט whole-market.
- ‏Simple signed Flow + Response כ־first challenger.

### ‏Low / Unproven until our data

- ‏ה־horizon האופטימלי.
- ‏כל threshold מספרי.
- ‏ערך Absorption/Sweep/Exhaustion features.
- ‏Flow weighting ב־Score.
- ‏Flow-aware cancel policy.

---

## ‏105. Time-Sensitive Facts

‏מקטע 44 אינו מוסיף Broker limit, Exchange cutoff, regulation parameter או vendor capability חדש.

‏לכן לא נדרש Web verification חדש לצורך ההכרעה המרכזית.

‏כן נדרשת בדיקה מחדש כאשר:

```text
provider changes
feed tier changes
trade-condition semantics change
venue coverage changes
historical/live schema changes
```

‏כי אלה יכולים לשנות Flow distributions גם ללא שינוי ב־Strategy.

---

## ‏106. Relationship to Earlier Sheets

### ‏10 — Activity / Volume / Flow

‏44 מעמיק מ־Activity בסיסית ל־signed aggression, persistence ו־response.

### ‏13 — Feature Engineering

‏כל Flow feature כפוף ל־Feature Contract, point-in-time ו־versioning.

### ‏14 — Ranking

‏Flow הוא sub-score/challenger, לא override ל־Rank discipline.

### ‏15 — Candidate Gate

‏Flow יכול לעזור ב־`NO_TRADE`, אבל רק עם evidence.

### ‏21 / 22

‏Prediction נבדק execution-aware, ולא רק Raw Return.

### ‏23 / 24

‏Ablation, OOS, experiment discipline ו־multiple-testing controls חלים במלואם.

### ‏27

‏Replay חייב לשחזר event ordering ו־Feature snapshots.

### ‏32

‏Provider provenance ו־data/execution separation נשמרים.

### ‏35

‏Flow מקבל telemetry, distributions, latency ו־RCA evidence.

### ‏43

‏Trading Status / LULD / Fast Market קודמים לכל Flow signal.

---

## ‏107. Relationship to Next Sheet

‏שלב 45 יעמיק בצד הפסיבי:

```text
Book Imbalance
Microprice
Depth Dynamics
```

‏החיבור העתידי יהיה:

```text
Aggressive Flow
×
Passive Book State
×
Price Response
```

‏אבל 44 לא יקדים את מסקנות 45 ולא ימציא Microprice weighting מראש.

---

## ‏108. Recommended Research Sequence

```text
R0 — Momentum baseline only
R1 — + signed imbalance
R2 — + flow rate
R3 — + persistence
R4 — + price response
R5 — + confidence / unknown-share
R6 — + Top-N absorption/depletion diagnostics
R7 — Flow-aware candidate gate if evidence survives
```

‏כל R-step הוא Experiment נפרד ככל האפשר.

---

## ‏109. Recommended MVP

```text
Canonical trades + quotes
→ conservative signing
→ UNKNOWN support
→ 1s/5s signed flow
→ flow rate
→ price response
→ quality/confidence
→ shadow diagnostics
```

‏זה מספיק כדי לענות על שאלת המחקר הראשונה בלי overengineering.

---

## ‏110. Recommendation Summary

```text
Baseline
→ Conservative Trade Signing with UNKNOWN
→ Simple Signed Flow
→ Multi-Horizon Rate + Persistence
→ Price Response
→ Quality / Confidence
→ Whole-Market Freshness
→ Shadow Challenger
→ OOS + Execution-Aware Validation

Preferred Default
→ Fast Path for all symbols
→ Deep Path only for Top-N

Challenger
→ Flow as Candidate Gate / Sub-score
→ Absorption / Exhaustion context

Advanced Option
→ Market/Sector-relative flow
→ Venue-aware flow
→ Flow-aware execution experiments

Specialist Option
→ MBO/L3 reconstruction
→ learned representations/classifiers

Avoid Unless Evidence
→ Forced signing
→ Actor storytelling
→ Flow-only trading
→ Extreme-flow chasing
→ Per-symbol overfitting
→ black-box complexity before baseline
```

‏העיקרון המסכם:

```text
Order Flow is useful only when we can say:
what was observed,
what was inferred,
how fresh and complete it was,
how price reacted,
and whether the information survived long enough to execute.
```
