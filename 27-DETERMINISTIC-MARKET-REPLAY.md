# ‏שלב 27 — `Replay`: לשחזר יום מסחר Event-by-Event בצורה דטרמיניסטית

> ‏מטרת הפרק: להבין איך בונים מנגנון `Replay` שמסוגל לקחת הקלטה של יום מסחר ולהזרים אותה מחדש למערכת כאילו השוק מתרחש עכשיו — באותו סדר, באותם זמנים ובאותם נתונים — כדי לבדוק, לדבג ולהשוות גרסאות של ה־Scanner וה־Execution בלי תלות בשוק חי.
>
> ‏העיקרון המרכזי: **`Replay` מקצועי אינו “להריץ קובץ היסטורי”. הוא שחזור דטרמיניסטי של ה־event stream ושל כל ה־state שנבנה ממנו.** אם אותה גרסה, אותו dataset ואותו config אינם נותנים אותה החלטה — אי אפשר לסמוך על המחקר.
>
> ‏כמו בכל הקורס: קודם נלמד את העיקרון המקצועי הכללי, אחר כך את ה־Best Practices ורזי המקצוע, ולבסוף נתאים אותו לרובוט שלך — Scanner של כל השוק, Rank מתמשך ועסקאות של שניות בודדות ועד בערך דקה.

---

# ‏1. למה בכלל צריך `Replay`?

‏ב־Backtest רגיל אנחנו בדרך כלל שואלים:

```text
אם האסטרטגיה הייתה קיימת בעבר — מה היה קורה?
```

‏ב־`Replay` אנחנו שואלים שאלה מדויקת יותר:

```text
אם המערכת עצמה הייתה רצה אז,
Event אחרי Event,
איזה State היא הייתה רואה,
איזה Rank היא הייתה מייצרת,
ואיזו החלטה היא הייתה מקבלת?
```

---

# ‏2. ההבדל בין `Backtest` ל־`Replay`

‏`Backtest` יכול להיות גם חישוב אנליטי או batch גדול.

‏`Replay` מנסה לחקות את זרימת הזמן.

‏לדוגמה:

```text
09:30:00.001 QuoteUpdate
09:30:00.004 Trade
09:30:00.007 QuoteUpdate
09:30:00.011 Trade
```

‏המערכת מקבלת כל אירוע לפי הסדר ומעדכנת state בדיוק כפי שהייתה עושה ב־Live.

---

# ‏3. למה זה חשוב במיוחד למסחר של שניות

‏כאשר Holding Time הוא שניות:

- ‏סדר Events חשוב.
- ‏פער של 100ms יכול לשנות Rank.
- ‏Quote חדש יכול להפוך Candidate מלא־רלוונטי ללא־רלוונטי.
- ‏Fill יכול להגיע לפני או אחרי עדכון Signal.
- ‏Cancel יכול להתחרות עם Fill.
- ‏שני Events באותה שנייה אינם בהכרח שווי־משמעות.

‏לכן Replay הוא כלי מרכזי לפיתוח שלנו.

---

# ‏4. שלוש מטרות שונות של Replay

## ‏א. Research Replay

‏בדיקת Scanner/Features/Ranking.

## ‏ב. Execution Replay

‏בדיקת Orders/Fills/Latency/Exit.

## ‏ג. Incident Replay

‏שחזור תקלה או Trade מסוים כדי להבין בדיוק מה קרה.

---

# ‏5. Event Stream הוא מקור האמת

‏Replay טוב מתחיל מ־Event Stream.

‏לא רק:

```text
Price every 10 seconds
```

‏אלא, לפי רמת ה־Fidelity:

```text
Trade
QuoteUpdate
StatusChange
Halt
Resume
SessionChange
BrokerEvent
OrderAck
PartialFill
Fill
CancelAck
Reject
```

---

# ‏6. `Canonical Event`

‏כדי לא להיות תלויים בספק מסוים, מומלץ להמיר את הנתונים למודל קנוני.

‏לדוגמה:

```text
CanonicalTrade
CanonicalQuote
CanonicalMarketStatus
```

‏כך אותו Scanner יכול לעבוד עם:

```text
Provider A
Provider B
Historical Dataset
Replay
Live Feed
```

---

# ‏7. `Event Time`

‏זה הזמן שבו האירוע התרחש לפי המקור.

‏לדוגמה:

```text
exchange_timestamp
```

‏או timestamp של provider.

---

# ‏8. `Receive Time`

‏זה הזמן שבו המערכת שלנו קיבלה את האירוע.

```text
received_at
```

‏בשוק חי שני הזמנים אינם זהים.

---

# ‏9. למה לשמור את שניהם

‏כי אנחנו רוצים להפריד:

```text
Market chronology
```

‏מ־

```text
What our system actually knew at that time
```

‏זה חשוב במיוחד למחקר latency.

---

# ‏10. `Sequence Number`

‏אם ספק הנתונים מספק sequence, כדאי לשמור אותו.

‏הוא עוזר לזהות:

- ‏אירועים חסרים.
- ‏אירועים כפולים.
- ‏Out-of-order delivery.
- ‏Reconnect gaps.

---

# ‏11. Canonical ordering

‏צריך להגדיר כלל מפורש לסדר אירועים.

‏לדוגמה:

```text
1. event_time
2. provider_sequence
3. receive_time
4. stable ingest_sequence
```

‏המטרה היא שאותו dataset תמיד ינוגן באותו סדר.

---

# ‏12. למה stable tie-breaker חשוב

‏שני אירועים יכולים לקבל אותו timestamp.

‏בלי tie-breaker:

```text
Run A != Run B
```

‏ואז קשה לדעת האם שינוי תוצאה נובע מהקוד או מסדר מקרי.

---

# ‏13. Determinism

‏`Determinism` אומר:

> ‏אותם inputs + אותה גרסה + אותו config = אותם outputs.

‏זו אחת הדרישות החשובות ביותר ל־Replay מקצועי.

---

# ‏14. מה צריך להיות דטרמיניסטי

- ‏סדר Events.
- ‏Clock.
- ‏Feature computation.
- ‏Filters.
- ‏Score.
- ‏Rank tie-breaks.
- ‏Execution simulation.
- ‏Randomness.
- ‏State transitions.

---

# ‏15. Random Seed

‏אם סימולציה משתמשת באקראיות:

```text
slippage sample
fill probability
latency sample
```

‏חייבים seed שמור.

‏אחרת אי אפשר לשחזר Run.

---

# ‏16. Replay Clock

‏אסור לרכיבי המערכת לקרוא ישירות:

```text
DateTime.UtcNow
```

‏או equivalent.

‏עדיף abstraction:

```text
IClock
```

‏עם שתי מימושים:

```text
SystemClock
ReplayClock
```

---

# ‏17. למה Clock abstraction קריטי

‏נניח Feature מחשב:

```text
age = now - last_trade_time
```

‏אם `now` הוא הזמן האמיתי של המחשב במקום זמן ה־Replay — כל התוצאה שגויה.

---

# ‏18. Virtual Time

‏ב־Replay הזמן הוא וירטואלי.

‏אפשר להזיז אותו לפי Event הבא במקום להמתין בזמן אמיתי.

---

# ‏19. Replay במהירות `1x`

‏מצב אחד:

```text
1 second historical = 1 second wall clock
```

‏שימושי ל־UI ולבדיקות התנהגות.

---

# ‏20. Replay מואץ

‏לדוגמה:

```text
10x
100x
Maximum speed
```

‏שימושי למחקר.

---

# ‏21. `As Fast As Possible`

‏במצב הזה אין משמעות להמתנה אמיתית.

‏המנוע:

```text
advance clock
publish event
process system
advance clock
publish next event
```

---

# ‏22. `Step Mode`

‏מצב חזק לדיבוג:

```text
Next Event
Next 100ms
Next 1s
Next Decision
Next Order
Next Fill
```

---

# ‏23. `Pause`

‏צריך להיות אפשר לעצור Replay בלי לשנות state.

‏זה מאפשר לחקור:

- ‏Rank.
- ‏Features.
- ‏Book state.
- ‏Position.
- ‏Working Orders.

---

# ‏24. `Seek`

‏רוצים לעיתים לקפוץ ישר ל־10:37:12.

‏אבל אי אפשר פשוט לדלג על כל האירועים הקודמים אם ה־state תלוי בהם.

---

# ‏25. הדרך הנאיבית ל־Seek

```text
Replay from session start → target time
```

‏נכון, אבל יכול להיות איטי.

---

# ‏26. `Checkpoint Snapshot`

‏אפשר לשמור snapshots תקופתיים של state.

‏לדוגמה כל:

```text
30 seconds
1 minute
5 minutes
```

---

# ‏27. Seek עם Checkpoint

```text
Load nearest checkpoint before target
Replay remaining events
```

‏כך אפשר להגיע במהירות לאירוע מסוים.

---

# ‏28. מה נשמר ב־Checkpoint

‏לפי הצורך:

- ‏Market State.
- ‏Feature windows.
- ‏Rank state.
- ‏Positions.
- ‏Working orders.
- ‏Risk state.
- ‏Sequence cursor.
- ‏Replay clock.

---

# ‏29. Snapshot חייב להיות Versioned

‏אם מבנה ה־state השתנה:

```text
snapshot_schema_version
```

‏צריך לדעת אם checkpoint ישן עדיין ניתן לקריאה.

---

# ‏30. Replay אינו רק Market Data

‏אם רוצים לשחזר Live behavior, צריך לשקול גם:

- ‏Broker events.
- ‏Order acknowledgements.
- ‏Rejects.
- ‏Partial fills.
- ‏Disconnects.
- ‏Reconnects.

---

# ‏31. `Market Replay`

‏משחזר רק את השוק.

---

# ‏32. `System Replay`

‏משחזר גם את אירועי המערכת.

---

# ‏33. `Incident Replay`

‏משחזר אירוע production ספציפי ככל האפשר.

---

# ‏34. Replay מול Simulation

‏אלה מושגים קרובים אך לא זהים.

‏`Replay`:

```text
Replays recorded facts
```

‏`Simulation`:

```text
Generates hypothetical consequences
```

---

# ‏35. דוגמה

‏Quote היסטורי הוא עובדה מוקלטת.

‏אבל השאלה:

```text
האם Limit Order שלנו הייתה מתמלאת?
```

‏היא סימולציה.

---

# ‏36. לכן יש שתי שכבות

```text
Recorded Market Events
        ↓
Execution Simulation
```

---

# ‏37. `ReplayDataset`

‏Dataset טוב צריך לכלול metadata.

```text
dataset_id
trading_date
provider
schema_version
coverage
created_at
checksum
```

---

# ‏38. `Dataset Manifest`

‏מומלץ ליצור manifest.

‏לדוגמה:

```text
Symbols: 4,012
Start: 09:30:00
End: 16:00:00
Trades: ...
Quotes: ...
Sequence gaps: ...
```

---

# ‏39. למה Coverage חשוב

‏אם יום מסוים כולל רק 70% מה־Universe, תוצאות ranking אינן שקולות ליום מלא.

---

# ‏40. Whole-Market Replay

‏לרובוט שלך זה חשוב במיוחד.

‏אנחנו לא רוצים Replay של:

```text
רק המניה שבסוף נבחרה
```

‏אלא:

```text
כל המניות שהמערכת הייתה יכולה לבחור באותו רגע
```

---

# ‏41. Cross-sectional integrity

‏כדי לשחזר Rank, צריך שכל candidate set יהיה זמין באותו timestamp.

‏אם חסרות מניות:

```text
Rank #1
```

‏יכול להיות מזויף.

---

# ‏42. `Universe Snapshot`

‏כדאי לשמור בכל Replay את גרסת ה־Universe.

```text
universe_version
```

---

# ‏43. Symbol Lifecycle

‏צריך לטפל ב:

- ‏Listings.
- ‏Delistings.
- ‏Symbol changes.
- ‏Trading halts.
- ‏Resumptions.

---

# ‏44. Session metadata

‏ה־Replay צריך לדעת:

```text
Pre-market
Regular session
After-hours
Closed
```

---

# ‏45. Calendar

‏צריך להשתמש בלוח המסחר של אותו יום היסטורי.

‏לא להניח שכל יום הוא 09:30–16:00 רגיל.

---

# ‏46. Half Days

‏יש ימי מסחר מקוצרים.

‏Replay חייב לדעת אותם.

---

# ‏47. DST

‏זמן מקומי ו־UTC יכולים להשתנות סביב Daylight Saving Time.

‏לכן timestamp פנימי עדיף לשמור בצורה חד־משמעית.

---

# ‏48. Corporate Actions

‏אם מחירי עבר מותאמים בדיעבד, צריך להיזהר לא לערבב אותם עם quotes/trades raw.

---

# ‏49. Data Quality Events

‏גם בעיות Data הן חלק מהמציאות.

‏לדוגמה:

```text
feed gap
stale quote
out-of-order event
reconnect
```

---

# ‏50. האם לנקות Data לפני Replay?

‏תלוי במטרה.

## ‏Research-clean Replay

‏Dataset מנוקה כדי לבדוק Signal.

## ‏Production-realistic Replay

‏משמר גם חלק מהתקלות כדי לבדוק robustness.

---

# ‏51. לעולם לא לערבב בלי תיעוד

‏צריך לדעת אם run מסוים היה:

```text
cleaned_data
```

‏או:

```text
raw_operational_data
```

---

# ‏52. Event Envelope

‏כל Event יכול לקבל envelope קבוע:

```text
event_id
event_type
symbol
event_time
received_time
sequence
provider
payload
```

---

# ‏53. Immutable Events

‏כדאי להתייחס לאירועים מוקלטים כ־immutable.

‏אם מתקנים dataset:

```text
create new dataset version
```

‏ולא לשנות בשקט את ההיסטוריה.

---

# ‏54. Checksums

‏Checksum מאפשר לוודא ש־Replay A ו־Replay B השתמשו בדיוק באותו input.

---

# ‏55. Run Identity

‏כל הרצה צריכה לקבל:

```text
replay_run_id
```

---

# ‏56. Run Manifest

‏שמור:

```text
code_commit
strategy_version
config_version
dataset_id
execution_model_version
random_seed
replay_speed
start_time
end_time
```

---

# ‏57. למה Commit חשוב

‏אם הקוד השתנה, אותה config אינה בהכרח אותה מערכת.

---

# ‏58. Deterministic output hash

‏אפשר לחשב hash של output מרכזי.

‏לדוגמה:

```text
Decision Ledger hash
```

‏אם אותו run נותן hash שונה — יש nondeterminism.

---

# ‏59. Replay Invariant ראשון

```text
same inputs → same decisions
```

---

# ‏60. Replay Invariant שני

```text
no event from the future may affect current state
```

---

# ‏61. Replay Invariant שלישי

```text
market state at T
must be constructible only from events <= T
```

---

# ‏62. Replay Invariant רביעי

```text
position state must equal fills processed so far
```

---

# ‏63. Replay Invariant חמישי

```text
working order state must follow the order lifecycle
```

---

# ‏64. Feature Windows

‏Rolling windows חייבים להתעדכן Event-by-Event.

‏לא לחשב בדיעבד window על כל DataFrame בצורה שיכולה להכניס future rows.

---

# ‏65. Warm-Up Period

‏אם Feature צריך 60 שניות היסטוריה, המערכת אינה Ready מיד בתחילת dataset.

```text
WARMING_UP
```

‏הוא state לגיטימי.

---

# ‏66. Cold Start

‏צריך להחליט איך המערכת מתנהגת כאשר אין מספיק היסטוריה.

‏לרוב:

```text
NO TRADE
```

‏עד שה־features הנדרשים תקינים.

---

# ‏67. Ranking cadence

‏Replay חייב להשתמש באותו trigger כמו Live.

‏למשל:

```text
Every event
Every 100ms
Every 1s
Every 10s
```

---

# ‏68. לא לשנות cadence בלי Version

‏שינוי cadence משנה את האסטרטגיה.

---

# ‏69. Event-driven Scanner

‏במודל Event-driven:

```text
MarketEvent
→ update state
→ update affected features
→ maybe rerank
```

---

# ‏70. Snapshot-driven Scanner

‏במודל snapshot:

```text
Market events accumulate
→ clock reaches scan boundary
→ create snapshot
→ rank universe
```

---

# ‏71. שניהם יכולים להיות נכונים

‏העיקר הוא ש־Replay ו־Live ישתמשו באותו semantics.

---

# ‏72. `ReplayClock` ו־Timers

‏גם timers פנימיים צריכים לרוץ על Virtual Time.

‏לדוגמה:

- ‏Order TTL.
- ‏Position timeout.
- ‏Cooldown.
- ‏Heartbeat timeout.

---

# ‏73. טעות נפוצה

‏Market Data רץ ב־Replay time אבל timeout משתמש ב־wall clock.

‏התוצאה:

```text
replay speed changes strategy behavior
```

‏זה באג חמור.

---

# ‏74. Replay speed must not change logic

‏באידיאל:

```text
1x
10x
100x
max-speed
```

‏צריכים לייצר אותן החלטות.

---

# ‏75. Backpressure

‏ב־max-speed אפשר להזרים Events מהר יותר ממה שהמערכת מסוגלת לעבד.

‏צריך להחליט:

```text
Replay waits for processing
```

‏או מדמה backlog מכוון.

---

# ‏76. שני מצבים שונים

## ‏Deterministic Functional Replay

‏Event הבא מחכה שהמערכת תסיים.

## ‏Performance Replay

‏Events מגיעים בקצב מוקלט כדי לבדוק עומס.

---

# ‏77. אל תערבב בין השניים

‏הם בודקים דברים שונים.

---

# ‏78. Functional Replay

‏שואל:

```text
האם הלוגיקה נכונה?
```

---

# ‏79. Performance Replay

‏שואל:

```text
האם המערכת מצליחה לעמוד בקצב?
```

---

# ‏80. `Burst Replay`

‏חשוב במיוחד לפתיחה או אירוע חד.

‏אפשר למדוד:

```text
events/sec
queue depth
processing lag
scan delay
```

---

# ‏81. Replay של כל השוק יכול להיות כבד

‏4,000 Symbols × הרבה events יכול לייצר dataset גדול מאוד.

‏לכן צריך תכנון יעיל.

---

# ‏82. Partitioning

‏אפשר לחלק לפי:

```text
date
symbol
hour
provider
```

‏אבל Replay צריך לדעת למזג חזרה chronologically.

---

# ‏83. Compression

‏Historical events לרוב ניתנים לדחיסה טובה.

‏אבל compression לא צריך לשנות ordering או precision.

---

# ‏84. Columnar Storage

‏למחקר batch, פורמטים columnar יכולים להיות יעילים.

‏ל־Replay event-by-event ייתכן שנרצה reader שממיר אותם לזרם events.

---

# ‏85. Raw + Derived separation

‏שמור בנפרד:

```text
Raw Events
Derived Features
Decisions
Orders
Fills
```

---

# ‏86. למה לא לשמור רק Features

‏אם נשנה Feature definition, נרצה לחשב אותו מחדש מ־Raw Data.

---

# ‏87. למה כן לשמור Derived Data לפעמים

‏ל־debugging והשוואת גרסאות.

‏אבל הוא cache/artifact — לא source of truth.

---

# ‏88. `Decision Ledger`

‏בכל החלטת Scanner כדאי לשמור:

```text
time
symbol
rank
score
feature snapshot
filter state
regime
decision
reason
```

---

# ‏89. `Order Ledger`

```text
intent_time
submit_time
order_id
type
limit_price
qty
state
```

---

# ‏90. `Fill Ledger`

```text
fill_time
fill_price
fill_qty
remaining_qty
```

---

# ‏91. Replay Debug View

‏UI טוב יכול להראות באותו זמן:

- ‏Top 10.
- ‏Score breakdown.
- ‏Quotes.
- ‏Recent trades.
- ‏Orders.
- ‏Position.
- ‏P&L.
- ‏Regime.

---

# ‏92. `Why #1?`

‏צריך להיות אפשר לעצור בזמן T ולשאול:

```text
למה XYZ היא Rank #1?
```

‏ולראות decomposition מלא.

---

# ‏93. `Why Not ABC?`

‏אותו דבר למניה אחרת.

‏למשל:

```text
filtered_by = spread_too_wide
```

‏או:

```text
rank = 12
```

---

# ‏94. Candidate Timeline

‏לכל Symbol אפשר להציג:

```text
Not eligible
→ eligible
→ rank 17
→ rank 4
→ rank 1
→ trade
→ exit
```

---

# ‏95. Rank Timeline

‏חשוב לראות אם Rank #1 היה:

```text
stable for 8 seconds
```

‏או:

```text
#27 → #1 → #19 in 200ms
```

---

# ‏96. Replay Markers

‏אפשר לסמן אוטומטית:

- ‏New Rank #1.
- ‏Trade decision.
- ‏Order submit.
- ‏Fill.
- ‏Target hit.
- ‏Stop.
- ‏Data gap.
- ‏Halt.

---

# ‏97. Bookmarks

‏מנגנון שימושי:

```text
bookmark timestamp + note
```

‏לדוגמה:

```text
10:17:03.421 — suspicious rank flip
```

---

# ‏98. Incident Package

‏כאשר מזהים Trade בעייתי, אפשר לייצא:

```text
30s before
trade interval
30s after
```

‏עם כל events וה־state הנדרש.

---

# ‏99. Minimal Reproduction

‏במקום להריץ יום שלם, incident package מאפשר לשחזר רק חלון קטן.

---

# ‏100. אבל Minimal Replay דורש Warm State

‏אם מתחילים באמצע יום, צריך:

```text
checkpoint before incident
```

‏או מספיק pre-roll כדי לבנות Features.

---

# ‏101. `Pre-Roll`

‏לדוגמה:

```text
Target incident = 10:00:00
Feature max window = 5m
Pre-roll begins = 09:55:00
```

---

# ‏102. Cross-Version Replay

‏אפשר להריץ:

```text
Strategy v1
Strategy v2
Strategy v3
```

‏על אותו dataset בדיוק.

---

# ‏103. `Run Diff`

‏במקום להשוות רק PnL:

```text
first different decision
first rank divergence
first feature divergence
first order divergence
```

---

# ‏104. First Divergence Analysis

‏זה כלי debugging חזק במיוחד.

‏אם v1 ו־v2 שונים ב־10:05:17, אנחנו מתחילים שם — לא בסוף היום.

---

# ‏105. Feature Diff

‏אפשר להשוות:

```text
momentum_5s
activity_10s
spread_bps
score
rank
```

‏בין שתי גרסאות.

---

# ‏106. Decision Diff

‏לדוגמה:

```text
v1 = NO_TRADE
v2 = BUY XYZ
```

‏וזה הרבה יותר מעניין מהפרש קטן ב־PnL הסופי.

---

# ‏107. Replay כ־Regression Test

‏Dataset קטן וקבוע יכול להפוך ל־test fixture.

‏למשל:

```text
Given recorded events
Expect exact decisions
```

---

# ‏108. Golden Replay

‏שמור כמה חלונות חשובים:

- ‏שוק רגוע.
- ‏פתיחה סוערת.
- ‏Spread מתרחב.
- ‏Halt.
- ‏Partial Fill.
- ‏Rank churn.

---

# ‏109. Snapshot Tests בלבד אינם מספיקים

‏המערכת תלויה ברצף.

‏לכן צריך לבדוק גם:

```text
state transitions over time
```

---

# ‏110. Replay Integration Test

‏דוגמה:

```text
Replay 60 seconds
Assert:
- no future data used
- rank sequence expected
- one trade decision
- no duplicate order
- final position flat
```

---

# ‏111. Replay End State

‏בסיום run צריך לדעת:

```text
positions
working orders
risk state
pnl
last processed sequence
```

---

# ‏112. Flat-at-End אינו תמיד חובה

‏אם dataset נקטע באמצע Position, זו יכולה להיות עובדה לגיטימית.

‏אבל צריך לתייג:

```text
incomplete_session
```

---

# ‏113. End-of-Session Policy

‏למחקר day-trading אפשר להגדיר:

```text
force_flat_before_close
```

‏אבל זו החלטת אסטרטגיה, לא “תיקון” של replay.

---

# ‏114. Replay ו־Risk Engine

‏Risk Engine צריך לרוץ גם ב־Replay.

‏אחרת אנחנו בודקים מערכת אחרת מה־Live.

---

# ‏115. Replay ו־Kill Switch

‏גם Kill Switch logic יכול להיבדק.

‏למשל:

```text
stale_feed → stop new entries
```

---

# ‏116. Fault Injection

‏אפשר להזריק בכוונה:

```text
feed disconnect
broker timeout
latency spike
duplicate event
missing quote
```

---

# ‏117. זה כבר מעבר ל־Historical Replay רגיל

‏אבל זה שימוש מצוין לאותה תשתית.

---

# ‏118. Replay Dataset Catalog

‏כדאי לנהל קטלוג של ימים.

```text
normal_day
high_vol_day
low_vol_day
open_shock
news_heavy
technical_failure
```

---

# ‏119. לא לבחור רק “ימים מעניינים”

‏זה יוצר selection bias.

‏צריך גם מדגם שגרתי.

---

# ‏120. Representative Replay Suite

‏סט טוב כולל מגוון רחב של ימי שוק, לא רק ימים שבהם האסטרטגיה הצליחה.

---

# ‏121. Replay Coverage Matrix

‏אפשר לעקוב:

| מצב | יש Dataset? | נבדק? |
|---|---:|---:|
| Opening burst | כן | כן |
| Quiet midday | כן | כן |
| Wide spread | כן | כן |
| Halt | כן | לא |
| Disconnect | simulated | כן |

---

# ‏122. Replay Performance Metrics

‏מדוד:

```text
events_processed
replay_speed_x
cpu
memory
max_queue_depth
processing_lag
```

---

# ‏123. Scanner Performance Metrics

```text
scan_duration
feature_compute_duration
ranking_duration
candidate_count
```

---

# ‏124. למה ביצועים חשובים גם ב־Replay

‏אם מערכת לא מצליחה לעבד recorded burst בקצב השוק, יש סימן שהיא עלולה לפגר גם ב־Live.

---

# ‏125. אבל אל תבלבל בין Logical Latency ל־Compute Latency

‏ב־Functional Replay ייתכן שאנחנו מדלגים על wall-clock latency.

‏ב־Performance Replay אנחנו רוצים למדוד אותה.

---

# ‏126. Replay Modes

‏מומלץ להגדיר מפורשות:

```text
FUNCTIONAL_DETERMINISTIC
REALTIME_1X
ACCELERATED
PERFORMANCE_STRESS
INCIDENT_DEBUG
```

---

# ‏127. CLI טוב

‏בעתיד אפשר לדמיין:

```text
replay --date 2026-10-20 --mode functional
```

‏או:

```text
replay --from 10:17:00 --to 10:18:00 --speed step
```

---

# ‏128. Configuration must be explicit

‏אל תיתן ל־Replay לקחת defaults חבויים.

‏כל פרמטר שמשפיע על החלטה צריך להיות ב־manifest.

---

# ‏129. Environment-independent logic

‏Replay צריך לתת אותן החלטות ככל האפשר על מחשבים שונים.

‏לכן היזהר מ:

- ‏Locale.
- ‏Timezone defaults.
- ‏Floating-point surprises.
- ‏unordered collections.
- ‏thread scheduling.

---

# ‏130. Concurrency היא מקור nondeterminism

‏אם Features מחושבים במקביל, completion order עלול להשתנות.

‏הפתרון אינו בהכרח לבטל מקביליות — אלא להגדיר deterministic merge/order.

---

# ‏131. Stable Rank Tie-Breaker

‏אם לשתי מניות אותו Score:

```text
score equal
```

‏צריך tie-break rule קבוע.

‏לדוגמה:

```text
secondary metric
then symbol
```

---

# ‏132. Precision

‏החלט אם computations משתמשים ב:

```text
decimal
```

‏או:

```text
double
```

‏ותעד tolerance להשוואות.

---

# ‏133. Avoid hidden wall-clock dependencies

‏דוגמאות מסוכנות:

```text
Task.Delay
Stopwatch-driven logic
system timezone
current date
```

‏בתוך strategy logic.

---

# ‏134. Side Effects

‏ב־Replay אסור בטעות לשלוח Order אמיתי.

‏צריך separation חד בין:

```text
LiveBroker
SimulatedBroker
```

---

# ‏135. Safety Gate

‏מומלץ שמצב Replay ידרוש במפורש:

```text
execution_mode = SIMULATION
```

‏ולא יאפשר credentials/endpoint של מסחר אמיתי.

---

# ‏136. Replay אינו Production Clone מלא

‏יש דברים שקשה לשחזר מושלם:

- ‏Network behavior.
- ‏Venue queue אמיתי.
- ‏Hidden liquidity.
- ‏Broker internal routing.
- ‏External system load.

---

# ‏137. לכן צריך Calibration

‏משווים Live/Paper מול Replay:

```text
latency
fill rate
slippage
markout
```

‏ומעדכנים את מודל הסימולציה.

---

# ‏138. Sim-to-Live Gap

‏זה מדד בפני עצמו.

```text
simulated_fill_price - live_fill_price
```

‏או כל metric מתאים.

---

# ‏139. Replay הוא כלי Learning

‏אחרי כל Trade מעניין אפשר:

```text
capture
replay
inspect
hypothesize
experiment
```

---

# ‏140. זה מתאים מאוד ל־RCA של שלב 26

‏RCA אומר:

```text
מה כנראה השתבש?
```

‏Replay מאפשר:

```text
בוא נשחזר את הרגע ונבדוק.
```

---

# ‏141. Replay + Controlled Experiment

‏אפשר לקחת אותו יום ולשנות רק דבר אחד:

```text
Feature weight
Filter
Entry policy
Exit policy
```

‏ולבדוק את ההשפעה.

---

# ‏142. אבל אל תתאים את עצמך ליום אחד

‏Replay בודד טוב לדיבוג.

‏הוא לא מספיק ל־validation סטטיסטי.

---

# ‏143. שני סוגי אמת

## ‏Local Truth

‏למה האירוע הזה קרה?

## ‏Population Truth

‏האם הדפוס חוזר על עצמו על הרבה ימים?

‏Replay עוזר בראשון; Backtest/validation עוזרים בשני.

---

# ‏144. Replay של Success

‏אל תשחזר רק כישלונות.

‏גם הצלחות יכולות לחשוף:

- ‏מזל.
- ‏Execution מקרי.
- ‏Feature לא נחוץ.
- ‏Exit מוקדם מדי.

---

# ‏145. Replay של `NO TRADE`

‏חשוב לבדוק גם:

```text
למה לא נכנסנו?
```

‏ואם דווקא הייתה הזדמנות טובה.

---

# ‏146. Rejected Candidate Replay

‏למניה שנפסלה אפשר לראות:

```text
rejection reason
features
future path
```

‏כדי למצוא Filters אגרסיביים מדי.

---

# ‏147. Replay של Top-1 vs Top-2

‏אפשר לעצור ברגע הבחירה ולהשוות:

```text
#1 selected
#2 rejected
```

‏ואז להמשיך את שני הנתיבים כ־Counterfactuals.

---

# ‏148. Branching Simulation

‏אותו Replay יכול לייצר כמה branches:

```text
A = passive entry
B = marketable limit
C = no trade
```

---

# ‏149. Branching אינו משנה את Historical Market

‏אנחנו מניחים שהעסקה האישית שלנו קטנה מספיק כדי לא לשנות מהותית את השוק.

‏אם זה לא נכון, צריך מודל impact מתקדם יותר.

---

# ‏150. Replay Artifact

‏כל run יכול לייצר:

```text
run.json
metrics.json
decisions.parquet
orders.parquet
fills.parquet
errors.log
```

‏הפורמט הסופי ייקבע בארכיטקטורה, אבל הרעיון הוא שה־run עצמו הוא artifact שניתן לבדיקה.

---

# ‏151. Run Summary

‏סיכום צריך לכלול לפחות:

```text
trades
no_trades
net_pnl
max_drawdown
fill_rate
avg_slippage
avg_signal_to_fill
rank1_events
data_quality_warnings
```

---

# ‏152. Replay Diff Summary

‏בהשוואת שתי גרסאות:

```text
same decisions
different decisions
same trades
different trades
pnl delta
first divergence
```

---

# ‏153. למה First Divergence עדיף לעיתים על PnL Delta

‏PnL הוא תוצאה מאוחרת.

‏First divergence מצביע על הסיבה הראשונה שהמערכות התחילו להתנהג אחרת.

---

# ‏154. `Explain Current State`

‏כלי debug שימושי:

```text
explain symbol XYZ at 10:17:03.421
```

‏ומקבלים:

```text
market state
features
filters
score
rank
risk gates
orders
position
```

---

# ‏155. Replay as Time Machine

‏זו הדרך הנכונה לחשוב עליו:

> ‏יכולת לחזור לכל רגע ולשאול מה המערכת ידעה ומה היא עשתה.

---

# ‏156. Replay אינו “וידאו”

‏וידאו רק מציג מה קרה.

‏Replay מריץ שוב את הלוגיקה.

---

# ‏157. לכן אפשר לשנות קוד

‏ואז להריץ שוב אותו Market Tape.

‏זה היתרון הגדול.

---

# ‏158. Architecture מומלצת

```text
Recorded Events
      ↓
Replay Reader
      ↓
Replay Clock
      ↓
Canonical Event Bus
      ↓
Market State
      ↓
Features
      ↓
Filters
      ↓
Score / Rank
      ↓
Decision
      ↓
Risk Engine
      ↓
Simulated Broker
      ↓
Orders / Fills / Position
```

---

# ‏159. אותו Core כמו Live

‏ב־Live:

```text
Live Feed → Canonical Event Bus
```

‏ב־Replay:

```text
Replay Reader → Canonical Event Bus
```

‏כל מה שאחרי זה צריך להיות משותף ככל האפשר.

---

# ‏160. זה מפחית `Simulation Drift`

‏אם יש Scanner אחד ל־Backtest ואחד ל־Live, הם יסטו עם הזמן.

---

# ‏161. Dependency Injection

‏ארכיטקטונית אפשר להחליף:

```text
IClock
IMarketDataSource
IExecutionBroker
```

‏לפי מצב הרצה.

---

# ‏162. Replay Reader אינו צריך לדעת Strategy

‏הוא רק מספק Events.

‏זה שומר Separation of Concerns.

---

# ‏163. Strategy אינה צריכה לדעת Replay

‏מבחינתה היא מקבלת Market Events רגילים.

---

# ‏164. `ReplayController`

‏רכיב נפרד יכול לטפל ב:

```text
play
pause
step
speed
seek
stop
```

---

# ‏165. `ReplaySession`

‏Session יכול להחזיק:

```text
run_id
state
current_time
speed
source_dataset
checkpoint
```

---

# ‏166. States אפשריים

```text
CREATED
LOADING
WARMING_UP
RUNNING
PAUSED
SEEKING
COMPLETED
FAILED
CANCELLED
```

---

# ‏167. Replay Failure אינו Strategy Loss

‏צריך להפריד:

```text
simulation_failure
```

‏מ־

```text
trade_loss
```

---

# ‏168. Data Gap Policy

‏אם חסר data:

```text
FAIL
WARN_AND_CONTINUE
MARK_UNRELIABLE
```

‏לפי סוג המחקר.

---

# ‏169. Fail Fast למחקר קריטי

‏אם Ranking דורש whole-market coverage ואין לנו אותו, עדיף לעיתים לעצור מאשר לייצר Rank מטעה.

---

# ‏170. `Replay Confidence`

‏אפשר לתייג run:

```text
HIGH_FIDELITY
MEDIUM_FIDELITY
LOW_FIDELITY
```

‏לפי איכות הנתונים ומודל הביצוע.

---

# ‏171. אל תציג תוצאה בלי Fidelity

‏לדוגמה:

```text
Net PnL = +$240
Replay fidelity = LOW
```

‏אינו שקול ל:

```text
Net PnL = +$240
Replay fidelity = HIGH
```

---

# ‏172. Replay Scenario Library

‏נרצה לאורך זמן לשמור scenarios קבועים.

‏לדוגמה:

```text
S01-normal-open
S02-rank-churn
S03-wide-spread
S04-partial-fill
S05-feed-gap
S06-halt
```

---

# ‏173. כל Bug משמעותי יכול להפוך ל־Replay Test

‏זה Best Practice חזק:

```text
production bug
→ capture scenario
→ fix
→ permanent replay regression test
```

---

# ‏174. RCA Library

‏אפשר לקשר כל scenario ל־RCA שלו.

```text
scenario_id
rca_id
fixed_in_version
```

---

# ‏175. Reproducible Research

‏חוקר אחר — או אתה בעוד חצי שנה — צריך להיות מסוגל להריץ את אותו experiment מחדש.

---

# ‏176. `Replay Contract`

‏אפשר להגדיר חוזה:

```text
Given:
- dataset D
- commit C
- config K
- seed S

Then:
- decision hash = H
```

---

# ‏177. אם החוזה נשבר

‏צריך לדעת אם:

- ‏שינוי מכוון.
- ‏Bug.
- ‏Nondeterminism.
- ‏Data mutation.

---

# ‏178. Replay Before Live Promotion

‏גרסה חדשה לא צריכה לעבור ישירות מ־Backtest ל־Live.

‏מסלול טוב:

```text
Unit Tests
→ Golden Replay
→ Multi-Day Replay
→ Paper/Shadow
→ Limited Live
```

---

# ‏179. Replay אינו מחליף Paper Trading

‏Replay יודע את העבר.

‏Paper Trading פוגש שוק אמיתי חדש בזמן אמת.

‏שניהם נחוצים מסיבות שונות.

---

# ‏180. Replay אינו מחליף Live קטן

‏יש דברים שרק live execution חושף.

‏לכן Replay הוא שלב בגשר — לא סוף הדרך.

---

# ‏181. למה זה חשוב לרובוט שלך במיוחד

‏הרובוט שלך מקבל הרבה החלטות מהירות.

‏בלי Replay, כאשר Rank #1 נכשל נוכל לראות רק:

```text
Trade lost
```

‏עם Replay נוכל לראות:

```text
09:42:10.100 rank 7
09:42:10.400 rank 3
09:42:10.700 rank 1
09:42:10.850 decision TRADE
09:42:11.020 order sent
09:42:11.180 quote widened
09:42:11.260 partial fill
09:42:11.600 score collapsed
```

‏זו רמת הבנה אחרת לחלוטין.

---

# ‏182. Replay של Signal Decay

‏אפשר למדוד:

```text
score_at_signal
score_at_submit
score_at_fill
```

‏ולראות אם ה־Edge נעלם עוד לפני הכניסה.

---

# ‏183. Replay של Rank Decay

```text
rank_at_signal = 1
rank_at_fill = 14
```

‏זה יכול להסביר Trade גרוע הרבה יותר טוב מה־PnL לבדו.

---

# ‏184. Replay של Opportunity Switching

‏אולי בזמן שאנחנו ממתינים ל־Fill ב־XYZ, מניה ABC הפכה להזדמנות טובה יותר.

‏Replay מאפשר לחקור זאת.

---

# ‏185. Opportunity Timeline

‏אפשר להציג:

```text
best candidate over time
```

‏ולבדוק כמה מהר המוביל משתנה.

---

# ‏186. זה יכול להשפיע על Entry Policy

‏אם Rank #1 מתחלף כל 200ms, כניסה passive ארוכה אולי אינה מתאימה.

‏אבל זו Hypothesis למחקר, לא מסקנה אוטומטית.

---

# ‏187. Replay של No-Progress Exit

‏אפשר לראות האם `Time Stop` באמת חסך זמן/הפסד או חתך עסקאות שהיו מתאוששות שנייה אחר כך.

---

# ‏188. Replay של Alternative Exit

‏אותו entry יכול להיבדק עם:

```text
TP only
TP + stop
Time stop
Signal exit
Trailing
```

---

# ‏189. היזהר מ־Exit Overfitting

‏היכולת לנסות הרבה Exit policies על אותו יום אינה רישיון לבחור בדיעבד את הטובה ביותר.

‏כללי שלב 23 עדיין חלים.

---

# ‏190. Replay Experiment Registry

‏כל branch של Replay צריך להירשם כניסוי.

---

# ‏191. Compare by More Than PnL

‏השווה גם:

- ‏Hit rate.
- ‏Net EV.
- ‏MFE capture.
- ‏MAE.
- ‏Time in market.
- ‏Turnover.
- ‏Fill rate.
- ‏Slippage.

---

# ‏192. Replay של Whole-Day Capital State

‏אם כל עסקה משפיעה על buying power/risk budget, צריך לשחזר גם את state הזה לאורך היום.

---

# ‏193. Stateless Backtest יכול לפספס זאת

‏כי הוא עשוי להעריך כל signal בנפרד כאילו ההון תמיד פנוי.

---

# ‏194. Replay Portfolio State

‏גם אם כרגע מחזיקים רק Position אחד, כדאי שהמודל יתמוך ב:

```text
cash
positions
reserved capital
working orders
realized pnl
unrealized pnl
```

---

# ‏195. Replay of Risk Stops

‏אם Daily Loss Limit הופעל ב־11:00, כל signals שאחריו צריכים להיות rejected.

---

# ‏196. אחרת Backtest מנפח הזדמנויות

‏כי הוא “ממשיך לסחור” אחרי נקודה שבה Live היה נעצר.

---

# ‏197. Replay of Cooldowns

‏אותו דבר ל־loss cooldown או symbol cooldown.

---

# ‏198. Replay of Duplicate Protection

‏צריך לוודא שאותו signal לא יוצר פעמיים אותה פקודה בגלל retries/events כפולים.

---

# ‏199. Replay of Restart

‏אפשר לדמות:

```text
crash
restart
load persisted state
reconcile
continue
```

---

# ‏200. זה גשר ישיר ל־Production

‏ככל ש־Replay משתמש באותם State Machines, bugs תפעוליים מתגלים מוקדם יותר.

---

# ‏201. Best Practice — Raw First

‏שמור את ה־rawest usable event stream האפשרי.

‏Derived snapshots אפשר לייצר מחדש.

---

# ‏202. Best Practice — Immutable Dataset IDs

‏אל תחליף תוכן של dataset קיים בלי לשנות version/id.

---

# ‏203. Best Practice — Explicit Replay Mode

‏כל log צריך לומר:

```text
mode=REPLAY
```

---

# ‏204. Best Practice — Same Decision Code

‏הימנע מ:

```text
if (replay) use special strategy logic
```

‏ככל האפשר.

---

# ‏205. Best Practice — Version Everything

- ‏Dataset.
- ‏Schema.
- ‏Strategy.
- ‏Feature set.
- ‏Score.
- ‏Execution model.
- ‏Config.

---

# ‏206. Best Practice — First Divergence Tool

‏זה צריך להיות כלי מרכזי, לא luxury.

---

# ‏207. Best Practice — Replay Small Before Replay Huge

‏כאשר בודקים Bug:

```text
30-second scenario
```

‏עדיף לעיתים על יום שלם.

---

# ‏208. Best Practice — Full-Day Before Promotion

‏אבל לפני promotion אמיתי, צריך גם runs של ימים מלאים ומגוונים.

---

# ‏209. Anti-Pattern — Replay from Aggregated Bars Only

‏אם האסטרטגיה תלויה בשניות/quotes, bars יכולים לאבד ordering קריטי.

---

# ‏210. Anti-Pattern — Hardcoded Sleeps

‏`Thread.Sleep` או equivalent אינם מודל זמן תקין ל־Replay.

---

# ‏211. Anti-Pattern — Hidden Randomness

‏Random ללא seed שובר reproducibility.

---

# ‏212. Anti-Pattern — Current Date in Strategy

‏Strategy שקוראת את תאריך המחשב במקום ReplayClock עלולה לשנות behavior.

---

# ‏213. Anti-Pattern — Different Code Path

‏Backtest/Replay code שמחשב Score אחרת מ־Live הוא מקור קבוע לבעיות.

---

# ‏214. Anti-Pattern — Only Successful Days

‏Replay suite חייבת לכלול גם ימים שבהם ה־Strategy נכשלת.

---

# ‏215. Anti-Pattern — PnL-only Comparison

‏שתי גרסאות יכולות לקבל PnL דומה מסיבות שונות לחלוטין.

---

# ‏216. Anti-Pattern — Treating Touch as Fill

‏כבר ראינו בשלב 21: מחיר שנגע ב־Limit אינו בהכרח Fill.

---

# ‏217. Anti-Pattern — Ignoring Missing Symbols

‏Whole-market Rank עם Universe חלקי אינו אותו Rank.

---

# ‏218. Anti-Pattern — Replaying Only Selected Symbols

‏זה עלול להכניס selection bias.

---

# ‏219. Anti-Pattern — Mutating Historical Events

‏אם “מתקנים” raw event תוך כדי Replay, אי אפשר עוד לשחזר בדיוק מה הורץ.

---

# ‏220. Anti-Pattern — Wall Clock Metrics בתוך Logic

‏Performance metrics כן.

‏Strategy semantics — לא.

---

# ‏221. רז מקצוע — Replay טוב הופך Bugs ל־Assets

‏כל incident משמעותי יכול להפוך לתרחיש קבוע שמגן על המערכת בעתיד.

---

# ‏222. רז מקצוע — Diff מוקדם עדיף על Debug מאוחר

‏כשגרסאות שונות, מציאת ה־first divergence חוסכת שעות של חקירה.

---

# ‏223. רז מקצוע — אל תרדוף אחרי Fidelity לפני Edge

‏אם גם עם execution assumptions סבירים אין Signal Edge — queue simulator מושלם לא יציל את האסטרטגיה.

---

# ‏224. רז מקצוע — אבל אל תסמוך על Fidelity נמוך בשביל כסף אמיתי

‏מודל coarse טוב למחקר מוקדם, לא להוכחת Production readiness.

---

# ‏225. רז מקצוע — Reproducibility היא Feature

‏מערכת שאפשר לשחזר בה כל החלטה מהעבר קלה הרבה יותר לשיפור ולתחזוקה.

---

# ‏226. רז מקצוע — Replay צריך להיות מהיר מספיק למחקר

‏אם Run אחד לוקח שעות, תבצע פחות ניסויים ופחות RCA.

‏Performance של כלי המחקר משפיעה על קצב הלמידה.

---

# ‏227. רז מקצוע — אבל מהירות לא על חשבון correctness

‏Replay מהיר ושגוי הוא פשוט דרך מהירה להגיע למסקנה שגויה.

---

# ‏228. רז מקצוע — Keep the Tape, Recompute the Brain

‏שמור את השוק כפי שנקלט.

‏את Features/Score/Decision אפשר לחשב מחדש שוב ושוב.

---

# ‏229. רז מקצוע — Same Tape, Many Brains

‏זה בדיוק היתרון:

```text
Market Tape fixed
Strategy versions vary
```

---

# ‏230. רז מקצוע — Replay הוא בסיס ל־Shadow Comparison

‏בעתיד אפשר להשוות:

```text
Live decisions
vs
Replay of the same recorded session
```

‏ולמצוא פערים.

---

# ‏231. מה כדאי לשמור כבר מה־Live הראשון

‏לפחות:

- ‏Raw market events או data מספיק לשחזור.
- ‏Receive timestamps.
- ‏Sequence metadata.
- ‏Decision logs.
- ‏Orders.
- ‏Broker events.
- ‏Fills.
- ‏Config/version IDs.

---

# ‏232. אם לא שומרים בזמן אמת — אי אפשר להמציא אחר כך

‏זו נקודה חשובה במיוחד.

‏Replay עתידי תלוי ב־observability של היום.

---

# ‏233. לכן Data Retention היא החלטה ארכיטקטונית

‏צריך לבחור:

```text
what to store
resolution
retention period
compression
cost
```

---

# ‏234. לא חייבים לשמור הכול לנצח

‏אפשר tiers:

```text
hot recent raw data
compressed archive
selected incident datasets
aggregated long-term metrics
```

---

# ‏235. Privacy/Secrets

‏Market data אינה הסיבה לשמור credentials.

‏לעולם אין צורך לשים API secrets בתוך Replay artifact.

---

# ‏236. Replay Report בסיסי

‏בסיום כל run:

```text
Dataset
Strategy version
Config
Mode
Fidelity
Decisions
Trades
PnL
Execution metrics
Data warnings
First error
```

---

# ‏237. Replay Comparison בסיסי

```text
Baseline Run
Candidate Run
First divergence
Changed decisions
Changed trades
Metric deltas
```

---

# ‏238. מה לא ננסה להוכיח בשלב הזה

‏Replay לבדו אינו מוכיח:

- ‏שה־Strategy תמשיך לעבוד בעתיד.
- ‏שה־Execution simulation מושלם.
- ‏ש־Live broker יתנהג בדיוק כמו simulator.
- ‏שאין regime shift.

---

# ‏239. מה הוא כן נותן

‏הוא נותן לנו:

- ‏שחזור.
- ‏דיבוג.
- ‏השוואה.
- ‏Regression protection.
- ‏מחקר מבוקר.
- ‏גשר בין Historical Data ל־Live architecture.

---

# ‏240. Baseline מומלץ לרובוט שלנו

‏לשלב ראשון מעשי בעתיד:

```text
1. Record canonical market events
2. Store event_time + received_time + sequence
3. Replay through the same MarketState/Scanner core
4. Use ReplayClock
5. Use SimulatedBroker
6. Produce Decision/Order/Fill ledgers
7. Guarantee deterministic reruns
8. Support pause/step
9. Add run diff
10. Add checkpoints only when seek performance requires them
```

‏זה מספיק פשוט להתחלה, אבל בנוי בכיוון הנכון.

---

# ‏241. Checklist — Data

- ‏האם dataset immutable/versioned?
- ‏האם נשמר event ordering?
- ‏האם יש event time?
- ‏האם יש receive time אם הוא זמין?
- ‏האם sequence gaps ידועים?
- ‏האם coverage של Universe ידוע?

---

# ‏242. Checklist — Determinism

- ‏האם clock וירטואלי?
- ‏האם random seed קבוע?
- ‏האם tie-breaks קבועים?
- ‏האם concurrency אינה משנה outcome?
- ‏האם אותו run נותן אותו Decision Ledger?

---

# ‏243. Checklist — Strategy Parity

- ‏האם Replay ו־Live משתמשים באותו Feature code?
- ‏אותם Filters?
- ‏אותו Score?
- ‏אותו Decision Engine?
- ‏אותו Risk Engine?

---

# ‏244. Checklist — Execution

- ‏האם execution model versioned?
- ‏האם latency מפורש?
- ‏האם partial fills נתמכים?
- ‏האם cancel/replace נתמך?
- ‏האם unknown states יכולים להופיע?

---

# ‏245. Checklist — Debuggability

- ‏האם אפשר pause?
- ‏האם אפשר step?
- ‏האם אפשר למצוא first divergence?
- ‏האם אפשר לראות למה Symbol היה Rank #1?
- ‏האם אפשר לייצא incident window?

---

# ‏246. Checklist — Research

- ‏האם אותו Tape משמש להשוואת גרסאות?
- ‏האם ניסויים נרשמים?
- ‏האם איננו מתאימים את עצמנו ליום אחד?
- ‏האם יש suite מייצג של ימים?
- ‏האם Fidelity מתועדת?

---

# ‏247. סימן ש־Replay בנוי טוב

‏אפשר לקחת החלטה היסטורית ולענות:

```text
מה המערכת ידעה?
למה היא בחרה דווקא את המניה הזאת?
מה השתנה בשניות הבאות?
למה הפקודה התמלאה או לא התמלאה?
מתי ה-Signal מת?
ומה גרסה אחרת הייתה עושה באותו רגע?
```

---

# ‏248. סימן ש־Replay עדיין חלש

‏אם התשובה היא:

> ‏"בערך זה מה שהיה בשוק."

‏זה לא מספיק למחקר ברמת שניות.

---

# ‏249. התמונה המלאה

```text
Historical/Recorded Market
        ↓
Deterministic Replay
        ↓
Same Strategy Core
        ↓
Same Risk Logic
        ↓
Versioned Execution Simulator
        ↓
Decision + Order + Fill Ledgers
        ↓
Run Metrics + First Divergence
        ↓
RCA / Experiments / Regression Tests
```

---

# ‏250. מה למדנו בשלב 27

‏למדנו ש־`Replay` הוא הרבה יותר מנגן נתונים.

‏הוא מאפשר:

- ‏לשחזר את השוק.
- ‏לשחזר את מצב המערכת.
- ‏להריץ את אותה לוגיקה כמו Live.
- ‏להשוות גרסאות על אותו Tape.
- ‏למצוא divergence ראשון.
- ‏להפוך incidents ל־tests.
- ‏לחקור Rank/Signal/Execution ברמת האירוע.
- ‏ולבנות גשר אמיתי ממחקר למערכת Production.

‏עבור הרובוט שלך, זו תהיה אחת התשתיות החשובות ביותר: כאשר Trade ייכשל או גרסה חדשה תשנה התנהגות, לא נצטרך לנחש מה קרה — נוכל לחזור לאותו רגע ולהריץ אותו שוב.

---

# ‏השלב הבא

‏בשלב 28 נלמד **`Paper Trading` ו־`Shadow Mode`**.

‏שם נעבור משוק היסטורי לשוק חי אמיתי, אבל עדיין נפריד בין:

```text
Signal only
Shadow execution
Paper orders
Real-money execution
```

‏ונבנה מסלול הדרגתי שבו מערכת חדשה צריכה להוכיח את עצמה בזמן אמת לפני שמותר לה לסכן כסף.