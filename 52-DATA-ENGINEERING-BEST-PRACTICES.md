# ‏שלב 52 — `Data Engineering Best Practices`: לבנות Market Data שאפשר באמת לסמוך עליו

> ‏מטרת הפרק: להבין איך בונים `Market Data Pipeline` מקצועי שהוא point-in-time correct, replayable, auditable, scalable ועמיד בפני duplicates, gaps, out-of-order events, schema changes, provider quirks ו־silent corruption.
>
> ‏העיקרון המרכזי: **Raw data אינו “האמת” רק מפני ששמרנו אותו. Data הופך ל־Evidence שימושית רק כאשר אנחנו יודעים מה המקור שלו, מתי הוא התרחש, מתי התקבל אצלנו, באיזה סדר הוא הגיע, אילו events חסרים סביבו, ואיזו גרסת parser/schema הפכה אותו ל־state שעליו התקבלה החלטה.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה `Data Engineering` הוא חלק מה־Strategy

‏קל לחשוב שה־Strategy היא:

```text
features
→ score
→ rank
→ trade
```

‏אבל בפועל:

```text
provider bytes
→ transport
→ decode
→ normalize
→ validate
→ order events
→ maintain state
→ compute features
→ rank
→ trade
```

‏אם אחת השכבות הראשונות שגויה, כל מה שאחריה יכול להיות מדויק מתמטית ועדיין שגוי לחלוטין.

‏לכן:

```text
Bad Data Engineering
→ Bad State
→ Bad Features
→ Bad Rank
→ Bad Decision
```

‏ולפעמים הדבר המסוכן ביותר הוא לא crash.

‏אלא מערכת שממשיכה לעבוד ומייצרת numbers הגיוניים מתוך data פגום.

---

# ‏2. שלושת סוגי האמת שאנחנו צריכים להפריד

‏נשתמש בשלוש שכבות:

```text
Raw Provider Event
Canonical Event
Derived State / Feature
```

‏`Raw Provider Event` הוא מה שהספק שלח.

‏`Canonical Event` הוא הייצוג הנורמלי שלנו.

‏`Derived State` הוא מה שבנינו ממנו.

‏אסור לערבב ביניהם.

‏אם Feature נראה מוזר, אנחנו צריכים להיות מסוגלים לרדת אחורה:

```text
Feature
→ State
→ Canonical Events
→ Raw Events
```

---

# ‏3. `Raw` חייב להישמר ככל האפשר ללא שינוי

‏במערכת רצינית כדאי לשמור שכבת Raw שאינה “מתוקנת” בדיעבד.

‏למשל:

```text
provider
connection_id
subscription_id
provider_timestamp
receive_timestamp
sequence
message_type
raw_payload
parser_version
```

‏היתרון:

‏אם בעוד חודש נגלה bug ב־parser, נוכל לבצע Reprocess ל־Raw במקום לאבד את ההיסטוריה.

‏כלל:

> ‏`Raw` הוא evidence. ‏`Canonical` הוא interpretation.

---

# ‏4. אסור לעשות destructive normalization

‏טעות נפוצה:

```text
Provider says unknown/null
→ normalize to 0
```

‏זה מסוכן.

‏`0` הוא value.

‏`UNKNOWN` הוא knowledge state.

‏למשל:

```text
bidSize = 0
```

‏אינו בהכרח אותו דבר כמו:

```text
bidSize = unknown
```

‏במערכת שלנו חייבים לשמר את ההבדל.

---

# ‏5. `Canonical Event Schema`

‏כל provider יכול לדבר dialect אחר.

‏אנחנו לא רוצים Strategy שמכירה:

```text
IEX field names
IBKR callbacks
Alpaca JSON shape
exchange-specific message codes
```

‏במקום זאת נבנה canonical types.

‏דוגמה רעיונית:

```text
TradeEvent
QuoteEvent
BookLevelEvent
TradingStatusEvent
CorporateActionEvent
SymbolReferenceEvent
HeartbeatEvent
```

‏לכל אחד contract ברור.

---

# ‏6. `Event Time` אינו `Receive Time`

‏אחת ההבחנות החשובות ביותר:

```text
event_time    = when the market/provider says it happened
receive_time  = when our system received it
process_time  = when our code processed it
persist_time  = when storage committed it
```

‏אלה זמנים שונים.

‏אסור להחליף ביניהם.

---

# ‏7. למה צריך כמה timestamps

‏אם אנחנו שומרים רק זמן אחד, אי אפשר לדעת האם:

- ‏השוק היה מהיר.
- ‏ה־provider איחר.
- ‏הרשת איחרה.
- ‏התור שלנו התמלא.
- ‏ה־processor היה איטי.
- ‏ה־storage היה איטי.

‏לכן timestamp אחד מוחק observability.

---

# ‏8. `Clock Domain`

‏צריך לדעת מי יצר כל timestamp.

‏לדוגמה:

```text
exchange clock
provider clock
our wall clock
our monotonic clock
broker clock
```

‏אין להניח שהשעונים מסונכרנים מושלם.

---

# ‏9. `Monotonic Time`

‏למדידת latency פנימית עדיף שעון monotonic.

‏למשל:

```text
receive → processed
processed → decision
submit → ack
```

‏Wall clock עלול לזוז בגלל clock correction.

---

# ‏10. Sequence הוא נכס קריטי

‏אם provider נותן sequence number — צריך לשמור אותו.

‏הוא מאפשר לזהות:

```text
gap
reorder
duplicate
reset
session transition
```

‏Sequence שנזרק במהלך normalization הוא information loss.

---

# ‏11. `Gap Detection`

‏דוגמה:

```text
1001
1002
1005
```

‏אם אנחנו יודעים שה־sequence אמור להיות רציף, חסרים events.

‏המערכת צריכה לייצר state מפורש:

```text
DATA_INCOMPLETE
```

‏ולא להמשיך כאילו הכול תקין.

---

# ‏12. לא כל Sequence הוא גלובלי

‏Sequence יכול להיות:

- ‏per connection.
- ‏per channel.
- ‏per symbol.
- ‏per venue.
- ‏per message family.

‏לכן contract של provider חייב לתעד את scope שלו.

---

# ‏13. Duplicate Events

‏Duplicates יכולים להגיע בגלל:

- ‏reconnect.
- ‏retry.
- ‏provider replay.
- ‏network layer.
- ‏consumer restart.
- ‏fan-out duplication.

‏מערכת צריכה להגדיר duplicate policy במפורש.

---

# ‏14. Deduplication אינה תמיד פשוטה

‏אין להניח:

```text
same symbol + same timestamp = duplicate
```

‏יכולות להיות כמה עסקאות אמיתיות באותו timestamp.

‏Dedup key צריך להתבסס על identifiers אמינים כאשר הם קיימים.

---

# ‏15. `Out-of-Order Events`

‏Event מאוחר יכול להגיע אחרי event חדש ממנו.

‏זה קורה בגלל:

```text
network jitter
parallel channels
provider batching
reconnect
processing skew
```

‏צריך policy:

```text
accept
buffer
reorder
mark late
reject
rebuild state
```

---

# ‏16. Event-Time Watermark

‏במערכות שבהן ordering אינו מוחלט, אפשר להחזיק watermark.

‏הרעיון:

```text
we believe events older than T are unlikely to arrive now
```

‏אבל watermark מוסיף latency.

‏לרובוט קצר מאוד צריך לבדוק אם המחיר שווה את הדיוק.

---

# ‏17. Fast Path מול Corrective Path

‏אפשר להפריד:

```text
Fast Path
→ low-latency live state

Corrective Path
→ late-event reconciliation / historical repair
```

‏אבל אסור שה־Corrective Path ישנה בדיעבד את ההיסטוריה בלי version/audit.

---

# ‏18. Point-in-Time Correctness

‏בזמן החלטה `t`, Feature רשאי להשתמש רק במידע שהיה זמין למערכת עד `t`.

‏לא:

```text
information that happened before t
but arrived after t
```

‏אם בזמן Live לא ידענו אותו — Backtest לא רשאי לתת אותו ל־Strategy.

---

# ‏19. זו צורה עדינה של Leakage

‏Event יכול להיות בעל:

```text
event_time < decision_time
```

‏אבל:

```text
receive_time > decision_time
```

‏אם Backtest ממיין רק לפי event time, הוא עלול להכניס מידע שלא היה לנו בפועל.

---

# ‏20. `As-Known-At` Dataset

‏למחקר מקצועי כדאי לחשוב על:

```text
what happened?
```

‏וגם:

```text
what did our system know at that exact time?
```

‏זה הבדל קריטי למסחר קצר.

---

# ‏21. Snapshot אינו תמיד Atomic

‏אם Bid ו־Ask מגיעים בשני events שונים, snapshot יכול להיות torn:

```text
new bid
old ask
```

‏לכן צריך לדעת האם provider מספק quote atomically או כעדכונים נפרדים.

---

# ‏22. `Torn Snapshot`

‏Torn snapshot יכול לייצר:

```text
negative spread
impossible microprice
fake book imbalance
fake momentum
```

‏ולפעמים הוא קיים רק למילישניות — אבל זה בדיוק horizon שמעניין אותנו.

---

# ‏23. Canonical State Builder

‏במקום שכל Feature יפרש raw events בעצמו, נרצה רכיב אחד:

```text
Canonical State Builder
```

‏הוא אחראי על:

- ‏ordering.
- ‏validation.
- ‏state transitions.
- ‏freshness.
- ‏sequence continuity.
- ‏quality flags.

---

# ‏24. State חייב לשאת `Quality Metadata`

‏לא מספיק:

```text
bid = 10.01
ask = 10.02
```

‏נרצה גם:

```text
bid_age
ask_age
source
sequence_status
coverage_status
quality_state
```

---

# ‏25. `Freshness` היא per-field

‏ייתכן:

```text
last trade age = 20ms
bid age = 400ms
ask age = 390ms
book depth age = 2s
```

‏לכן `symbol_fresh = true` אחד יכול להסתיר בעיה.

---

# ‏26. `Freshness Vector`

‏אפשר לחשוב על:

```text
TradeFreshness
QuoteFreshness
BookFreshness
StatusFreshness
ReferenceFreshness
```

‏Feature משתמש רק בשכבות שהוא באמת צריך.

---

# ‏27. `Coverage`

‏Whole-market Scanner צריך לדעת לא רק כמה symbols יש Universe.

‏אלא כמה מהם כרגע:

```text
connected
subscribed
fresh
valid
rankable
tradable
```

---

# ‏28. `Fresh Coverage Ratio`

‏למשל:

```text
FreshCoverage = FreshSymbols / ExpectedTradableSymbols
```

‏אבל גם denominator צריך להיות point-in-time correct.

---

# ‏29. Coverage Bias

‏אם בזמן עומס רק מניות פעילות מקבלות עדכונים בזמן, Scanner עלול לחשוב שהן “הכי טובות” פשוט כי האחרות stale.

‏זו יכולה להיות selection bias שנובעת מ־pipeline.

---

# ‏30. Missing Data אינה אפס

‏אסור:

```text
missing volume → 0
missing trade count → 0
missing return → 0%
```

‏אלא אם contract מגדיר שזה באמת semantic נכון.

---

# ‏31. Missingness עצמה יכולה להיות Feature מסוכן

‏אם Model לומד ש־missing field מנבא outcome, ייתכן שהוא למד artifact של provider או ingest.

‏צריך לבדוק:

```text
is missingness market information
or pipeline information?
```

---

# ‏32. `Schema Version`

‏כל canonical event צריך להיות קשור ל־schema version.

‏למשל:

```text
schema_version = 7
```

‏כדי שנדע איך לפרש היסטוריה.

---

# ‏33. Schema Evolution

‏שינויים אפשריים:

```text
field added
field removed
unit changed
enum changed
meaning changed
precision changed
```

‏השינוי המסוכן ביותר הוא semantic change בלי שינוי שם.

---

# ‏34. Backward Compatibility

‏Reader חדש צריך לדעת האם הוא מסוגל לקרוא data ישן.

‏אם לא:

```text
fail explicitly
```

‏לא “לנחש”.

---

# ‏35. Forward Compatibility

‏כאשר מגיע enum חדש מה־provider:

```text
UNKNOWN
```

‏עדיף על crash או mapping שגוי.

---

# ‏36. `Parser Version`

‏Schema לבדו אינו מספיק.

‏אותו Raw message יכול להתפרש אחרת אחרי bug fix.

‏לכן נשמור גם:

```text
parser_version
normalizer_version
```

---

# ‏37. Data Provenance

‏לכל record חשוב לדעת:

```text
where did it come from?
which provider?
which connection?
which subscription?
which parser?
which correction?
```

---

# ‏38. Provider אינו Venue

‏Provider יכול לאחד כמה venues.

‏לכן:

```text
source_provider
```

‏ו־

```text
market_venue
```

‏הם concepts שונים.

---

# ‏39. Consolidated מול Direct Feed

‏אסור להשוות latency או book completeness בלי לדעת איזה feed יש לנו.

‏Consolidated feed יכול להיות מצוין למחקר מסוים ועדיין שונה מ־venue-direct data.

---

# ‏40. Feed Scope

‏צריך לתעד מה provider באמת מכסה:

```text
trades?
quotes?
NBBO?
venue-specific book?
odd lots?
auction messages?
trading status?
```

‏אחרת נתחיל להסיק דברים על events שמעולם לא ראינו.

---

# ‏41. `Trade Condition Codes`

‏לא כל print הוא אותו סוג של trade.

‏Provider/exchange יכול לסמן conditions שונים.

‏ה־pipeline צריך לשמר אותם גם אם Strategy לא משתמשת בהם היום.

---

# ‏42. למה לא למחוק Conditions מוקדם

‏מחר נרצה להבחין:

```text
regular trade
auction print
late report
corrected trade
special condition
```

‏אם זרקנו את ה־metadata ב־ingest, אי אפשר לשחזר.

---

# ‏43. Corrections ו־Cancellations

‏Trades יכולים לעבור תיקון או ביטול.

‏היסטוריה נאיבית ששומרת רק append ללא semantics עלולה לספור trade שבוטל.

---

# ‏44. Append-Only עדיין אפשרי

‏אפשר לשמור:

```text
TRADE
TRADE_CORRECTION
TRADE_CANCEL
```

‏במקום לשכתב Raw history.

‏אז projections בונות state נכון.

---

# ‏45. Event Sourcing — במינון נכון

‏לא חייבים להפוך את כל המערכת ל־Event Sourcing מלא.

‏אבל Market Data טבעי מאוד ל־append-only canonical event log.

‏ממנו אפשר לבנות:

```text
current state
historical snapshots
features
replay
RCA
```

---

# ‏46. `Replay` דורש Canonical Ordering Contract

‏Replay שלא יודע כיצד למיין events אינו deterministic.

‏צריך להגדיר tie-breakers.

‏למשל רעיונית:

```text
source sequence
then receive order
then stable event id
```

‏הסדר המדויק תלוי ב־provider contract.

---

# ‏47. Replay עם Arrival Timing

‏למחקר latency-sensitive לא מספיק לשחזר event time.

‏צריך אפשרות לשחזר גם:

```text
inter-arrival delays
bursts
jitter
late events
```

---

# ‏48. Replay Fidelity Levels

‏נגדיר למשל:

```text
L0 = snapshots only
L1 = ordered trades/quotes
L2 = original arrival timing
L3 = depth/sequence/gaps/status events
L4 = provider-specific high-fidelity reconstruction
```

‏כל תוצאה חייבת לציין באיזו fidelity התקבלה.

---

# ‏49. Backtest אינו יכול להיות מדויק יותר מה־Data

‏אם שמרנו snapshots כל `10s`, אסור לדמות כאילו ידענו מה קרה בכל `50ms` ביניהם.

‏זה false precision.

---

# ‏50. Sampling Loss

‏Snapshot sampling יכול להעלים:

```text
spikes
brief spreads
short bursts
queue churn
microstructure reversals
```

‏לכן research horizon חייב להתאים לרזולוציית הנתונים.

---

# ‏51. Nyquist אינו כל הסיפור

‏גם אם sampling rate נראה תיאורטית מספיק, market events אינם signal חלק ופשוט.

‏Event-driven capture עדיף כאשר horizon קצר.

---

# ‏52. `Raw Event Retention`

‏Raw data יקר באחסון.

‏לכן נבנה tiers:

```text
hot raw
warm canonical
cold compressed archive
derived aggregates
```

---

# ‏53. Retention Policy צריכה להיות Research-aware

‏אל תמחק Raw לפני שידוע אילו features אולי נרצה בעתיד.

‏מצד שני, retention אינסופי יכול להיות יקר.

‏צריך explicit policy.

---

# ‏54. Compression

‏Market Data בדרך כלל compresses היטב.

‏אפשר להשתמש ב:

```text
columnar storage
partition compression
delta encoding
integerized prices
```

‏אבל correctness לפני compression ratio.

---

# ‏55. Integerized Prices

‏Floating point עלול להכניס רעש.

‏לעיתים עדיף לייצג מחיר כ־integer ביחידת precision מוגדרת.

‏לדוגמה conceptually:

```text
price_units = 10023
price_scale = 1000
```

---

# ‏56. Precision Contract

‏צריך לדעת:

```text
display precision
storage precision
exchange tick size
calculation precision
```

‏אלה לא תמיד אותו דבר.

---

# ‏57. Quantity Precision

‏גם quantity יכולה לכלול semantics מיוחדים.

‏לא מניחים שכל instrument הוא integer shares ללא exceptions.

---

# ‏58. Unit Contracts

‏כל שדה צריך unit ברור:

```text
USD
shares
milliseconds
nanoseconds
basis points
percent
ratio
```

‏Unit bug יכול להיראות כמו Alpha ענק.

---

# ‏59. Percent Bug קלאסי

‏לדוגמה:

```text
0.5
```

‏יכול להיות:

```text
0.5%
```

‏או:

```text
50%
```

‏לכן unit הוא חלק מה־schema.

---

# ‏60. Corporate Actions

‏Splits, symbol changes ופעולות אחרות יכולות לשבור historical continuity.

‏צריך להפריד בין:

```text
raw traded prices
adjusted research series
```

---

# ‏61. אל תערבב Adjusted ו־Raw

‏Execution backtest צריך לעבוד על prices שניתן היה לבצע בהם בזמן אמת.

‏Long-term analytics אולי משתמשים adjusted series.

‏אלו מטרות שונות.

---

# ‏62. Symbol Identity

‏Ticker הוא label, לא identity נצחית.

‏צריך internal security identifier יציב ככל האפשר.

---

# ‏63. Symbol Lifecycle

‏מערכת צריכה להתמודד עם:

```text
IPO
rename
symbol change
delisting
halt
relisting
corporate action
```

---

# ‏64. Universe History

‏Backtest חייב לדעת מי היה eligible באותו יום.

‏לא להשתמש ברשימת symbols של היום על כל ההיסטוריה.

---

# ‏65. Survivorship Bias

‏אם נעלמו מה־dataset מניות שנכשלו/נמחקו, התוצאה יכולה להיראות טובה מדי.

---

# ‏66. Reference Data Versioning

‏גם metadata כמו:

```text
exchange
security type
currency
lot rules
session eligibility
```

‏צריכים להיות point-in-time aware כאשר הם משתנים.

---

# ‏67. Trading Calendar

‏צריך source of truth ל־calendar.

‏כולל:

```text
regular days
holidays
early closes
special sessions
```

‏לא hard-code “9:30–16:00 כל יום”.

---

# ‏68. Time Zones

‏אחסון timestamps צריך להיות חד־משמעי.

‏לרוב עדיף canonical UTC + explicit market/session metadata.

‏ה־UI יכול להציג timezone מקומי.

---

# ‏69. DST

‏Daylight Saving Time יוצר bugs קלאסיים.

‏אל תחשב offset קבוע ידנית.

---

# ‏70. Trading Day Boundary

‏`calendar date` אינו תמיד מספיק.

‏צריך concept של:

```text
trading_session_id
```

‏כדי להפריד sessions בצורה נכונה.

---

# ‏71. Partitioning

‏אחסון יכול להיות מחולק לפי:

```text
date
provider
symbol
message type
venue
```

‏אבל partition key צריך להתאים לדפוסי read/write.

---

# ‏72. Too Many Small Files

‏Partitioning אגרסיבי מדי יוצר מיליוני files קטנים.

‏זה פוגע ב־metadata overhead וב־query performance.

---

# ‏73. Too Few Giant Files

‏גם קובצי ענק מקשים על random access, parallelism ו־repair.

‏צריך איזון.

---

# ‏74. Columnar Historical Storage

‏למחקר batch, formats columnar יכולים להיות יעילים מאוד.

‏ל־live state נשתמש במבנה שונה.

‏אין storage אחד שמתאים לכל workload.

---

# ‏75. Hot State מול Historical Store

‏הפרדה:

```text
Hot State
→ current market truth

Historical Store
→ replay / research / analytics
```

‏לא מכריחים database אחד לעשות הכול.

---

# ‏76. Write Path חייב להיות פשוט

‏בשעת burst, ingestion לא צריך לבצע עשר joins ו־queries לפני write.

‏עיקרון:

```text
capture first
transform safely
analyze later
```

‏כאשר latency/throughput דורשים זאת.

---

# ‏77. אבל Capture בלי Validation מסוכן

‏צריך minimum validation כבר ב־ingest:

```text
parseable?
schema recognized?
sequence sane?
timestamp sane?
symbol known?
```

---

# ‏78. Quarantine

‏Events חשודים לא חייבים להיעלם.

‏אפשר להעביר ל־quarantine:

```text
bad schema
impossible price
unknown symbol
broken sequence
```

‏ולחקור אותם בנפרד.

---

# ‏79. `Data Quality State`

‏נגדיר states מפורשים:

```text
GOOD
DEGRADED
INCOMPLETE
STALE
CONFLICTED
UNKNOWN
```

‏Strategy לא צריכה להמציא את המשמעות לבד.

---

# ‏80. Data Quality חייבת להגיע עד Decision

‏אם upstream היה degraded, צריך שה־decision log יידע זאת.

‏לא לאבד quality flags בין layers.

---

# ‏81. Silent Corruption

‏התקלה המסוכנת ביותר:

```text
pipeline green
numbers flowing
values plausible
meaning wrong
```

‏לדוגמה unit mismatch או shifted timestamp.

---

# ‏82. Semantic Checks

‏לא מספיק לבדוק schema.

‏צריך invariants:

```text
bid <= ask
price > 0
size >= 0
sequence nondecreasing where required
session state valid
```

---

# ‏83. Statistical Data Quality Checks

‏אפשר לזהות corruption דרך distributions:

```text
spread distribution shifted
trade rate collapsed
zero values increased
one provider diverged
latency jumped
```

---

# ‏84. Cross-Provider Comparison

‏אם יש שני feeds, אפשר למדוד:

```text
price divergence
quote divergence
timestamp divergence
missing-symbol divergence
status divergence
```

‏זה כלי diagnostics חזק.

---

# ‏85. אבל Providers אינם תמיד Identical

‏Divergence אינה בהכרח bug.

‏יכול להיות scope שונה.

‏לכן comparison צריך להבין semantics.

---

# ‏86. Golden Symbols

‏נבחר symbols נבחרים שבהם שומרים fidelity גבוהה במיוחד.

‏הם יכולים לשמש:

```text
regression
provider comparison
parser testing
replay validation
```

---

# ‏87. Golden Market Days

‏כדאי לשמור ימים עם:

```text
quiet market
open burst
halt
fast market
large spread
high volume
provider outage
```

‏כ־regression corpus.

---

# ‏88. Checksums

‏Files/partitions חשובים יכולים לקבל checksum.

‏כך מזהים corruption פיזי או transfer לא מלא.

---

# ‏89. Row/Event Counts

‏לכל partition נשמור metadata כמו:

```text
event_count
first_timestamp
last_timestamp
sequence_range
symbol_count
```

‏זה עוזר sanity checks.

---

# ‏90. `Data Manifest`

‏Dataset מחקרי צריך manifest:

```text
dataset_id
source_versions
schema_versions
partitions
coverage
known_gaps
quality_summary
build_code_version
```

---

# ‏91. Immutable Dataset IDs

‏Dataset שעליו נעשה experiment מקבל ID immutable.

‏אם מתקנים data — יוצרים גרסה חדשה.

‏לא משנים מתחת לרגליים תוצאה קיימת.

---

# ‏92. Reproducibility

‏Experiment חייב להפנות ל־dataset ID ולא רק ל־path כמו:

```text
/data/latest
```

‏`latest` אינו reproducible.

---

# ‏93. Data Lineage

‏צריך לדעת:

```text
raw partitions
→ canonical build
→ feature dataset
→ experiment
→ result
```

‏זה lineage.

---

# ‏94. Feature Dataset Versioning

‏גם אם raw data זהה, שינוי Feature code יוצר dataset לוגי חדש.

---

# ‏95. Feature Materialization

‏לא כל Feature חייב להישמר.

‏אפשר:

```text
compute-on-read
materialize expensive stable features
cache hot features
```

‏לפי cost/freshness.

---

# ‏96. Online/Offline Parity

‏אחת הבעיות הקשות:

```text
offline feature implementation
!=
online feature implementation
```

‏זה יוצר training-serving skew.

---

# ‏97. Shared Feature Logic

‏כאשר אפשר, אותה semantic implementation צריכה לשרת:

```text
Replay
Backtest
Shadow
Live
```

‏או לפחות לעבור conformance tests זהים.

---

# ‏98. Snapshotting Derived State

‏כדי לזרז Replay, אפשר לשמור checkpoints של canonical state.

‏אבל snapshot חייב לכלול:

```text
version
sequence positions
quality state
schema version
```

---

# ‏99. Snapshot + Event Tail

‏Recovery יעיל:

```text
load snapshot
replay events after snapshot
```

‏במקום להריץ את כל היום מהתחלה.

---

# ‏100. Snapshot Corruption

‏Snapshot לא צריך להיחשב נכון רק כי deserialization הצליח.

‏נבדוק checksum + invariants.

---

# ‏101. Backfill

‏כאשר חסרים historical partitions, אפשר backfill.

‏אבל צריך לסמן:

```text
original live capture
vs
later backfill
```

‏כי הם אינם אותו סוג evidence.

---

# ‏102. Why Backfill Can Mislead

‏Backfilled provider data יכול להיות cleaner או richer ממה שהיה זמין live.

‏אם משתמשים בו למחקר latency-sensitive, נוכל להמציא יתרון שלא היה קיים.

---

# ‏103. Live-Capture Dataset

‏לרובוט שלנו כדאי לשמור subset חשוב של data בדיוק כפי שנראה בזמן אמת.

‏זה dataset יקר במיוחד ל־validation.

---

# ‏104. `As-Traded` Evidence

‏לכל trade אמיתי נשמור snapshot/links ל־market state שנראה בזמן:

```text
signal
rank
entry decision
submit
fill
exit decision
exit fill
```

---

# ‏105. Decision Packet

‏Decision packet צריך לכלול references ל־data versions.

‏כך RCA אינו תלוי ב־“מה database מראה היום”.

---

# ‏106. Data Correction Policy

‏כאשר מתקנים historical data:

```text
never silently overwrite research evidence
```

‏צריך correction log.

---

# ‏107. Restatement

‏אם Dataset V1 היה שגוי ומייצרים V2:

‏תוצאות ישנות נשארות קשורות ל־V1.

‏לא מוחקים את ההיסטוריה המחקרית.

---

# ‏108. Raw vs Curated

‏נוח להחזיק:

```text
Raw
Canonical
Curated
Feature
Label
```

‏כל layer עם contract אחר.

---

# ‏109. Curated Data

‏Curated layer יכולה להסיר records לא רלוונטיים למחקר מסוים.

‏אבל filtering rules חייבים להיות versioned.

---

# ‏110. Label Store

‏Labels כמו:

```text
forward_return_1s
forward_return_5s
time_to_first_profit
MFE
MAE
```

‏צריכים להיות מחושבים pipeline נפרד, point-in-time safe.

---

# ‏111. Feature/Label Separation

‏Pipeline צריך למנוע accidental join שבו label future information נכנס ל־feature row.

---

# ‏112. Causal Cutoff

‏לכל feature row נשמור:

```text
feature_cutoff_time
```

‏ולכל label:

```text
label_start_time
label_end_time
```

---

# ‏113. `Data Leakage Tests`

‏בדיקות אפשריות:

```text
future timestamp assertion
shifted-label test
shuffle test
late-arrival exclusion test
```

---

# ‏114. Replay/Live Equality Test

‏ניקח recorded live session.

‏נריץ Replay.

‏נשווה:

```text
state hashes
feature values
rank snapshots
decisions
```

---

# ‏115. Deterministic State Hash

‏אפשר לחשב hash ל־canonical state בנקודות ידועות.

‏אם Replay שונה, יש drift.

---

# ‏116. Non-Determinism Sources

‏מקורות נפוצים:

```text
unordered collections
parallel race
current time calls
randomness
floating-point accumulation order
unstable sorting
```

---

# ‏117. Stable Sort

‏Ranking צריך tie-breaker יציב.

‏אחרת אותו dataset יכול להחזיר winner שונה בין runs.

---

# ‏118. Random Seeds

‏כאשר יש sampling/randomized research, seed נשמר ב־experiment manifest.

---

# ‏119. Floating-Point Reproducibility

‏Parallel reductions עלולים לתת tiny differences.

‏ב־thresholds חדים tiny difference יכולה לשנות decision.

---

# ‏120. Epsilon Policy

‏אם comparisons רגישים ל־floating point, צריך policy עקבית ומתועדת.

---

# ‏121. Data Contract Tests

‏לכל provider adapter נבדוק:

```text
required fields
units
enums
timestamps
sequence semantics
reconnect semantics
null handling
```

---

# ‏122. Contract Tests נגד Recorded Samples

‏שומרים raw samples אמיתיים ומשתמשים בהם regression tests ל־parser.

---

# ‏123. Schema Drift Alarm

‏אם provider מוסיף/משנה field unexpectedly:

```text
alert
quarantine if needed
```

‏לא להתעלם בשקט.

---

# ‏124. Provider Version Drift

‏גם בלי schema change, behavior יכול להשתנות.

‏לכן monitoring distributional חשוב.

---

# ‏125. Throughput Budget

‏נמדוד:

```text
events/sec
bytes/sec
peak burst
queue depth
processing lag
write lag
```

---

# ‏126. Average Throughput אינו מספיק

‏Market bursts יכולים להיות פי כמה מהממוצע.

‏Sizing לפי average בלבד יוצר collapse בדיוק ברגעים החשובים.

---

# ‏127. Burst Capacity

‏צריך headroom.

‏למשל:

```text
sustainable throughput > observed peak with margin
```

‏המספר המדויק נקבע במדידה.

---

# ‏128. Backpressure

‏כאשר consumer איטי מה־producer, צריך policy.

‏אפשרויות:

```text
buffer
slow producer
drop low-priority data
switch fidelity
block decisions
```

---

# ‏129. Dropping Data דורש Semantics

‏אם חייבים drop, חשוב לדעת מה מותר.

‏למשל אולי אפשר להוריד UI updates.

‏אסור להוריד silently critical trade/status/order events.

---

# ‏130. Loss Budget

‏לכל event class נגדיר loss tolerance.

‏לדוגמה:

```text
order/fill events: zero tolerated
market telemetry: maybe bounded loss
UI rendering updates: highly droppable
```

---

# ‏131. Priority Queues

‏תחת עומס:

```text
broker/risk/status
> position-relevant market data
> top candidates
> full-universe deep data
> UI/analytics
```

---

# ‏132. Queue Age חשוב יותר מ־Queue Length

‏100 events בני `1ms` אולי בסדר.

‏10 events בני `2s` יכולים להיות אסון.

‏לכן נמדוד age.

---

# ‏133. Lag Watermark

‏לכל pipeline stage:

```text
latest event time processed
latest receive time processed
queue oldest age
```

---

# ‏134. Storage Backpressure

‏אם storage איטי, אסור שהוא בהכרח יעצור execution hot path.

‏נפריד critical durable journal מ־bulk analytics storage לפי design.

---

# ‏135. Write-Ahead Strategy

‏Critical events יכולים לדרוש durable write לפני effect.

‏Market data bulk אולי משתמש buffering.

‏אין policy אחת לכל stream.

---

# ‏136. Batching

‏Batching משפר throughput אך מוסיף latency.

‏נבחר batch size לפי horizon.

‏ל־research archive אפשר batches גדולים יותר מאשר live path.

---

# ‏137. Flush Policy

‏צריך policy מפורשת:

```text
flush every N events
or every T milliseconds
or both
```

---

# ‏138. Memory Buffers

‏Buffers צריכים cap.

‏Unbounded queue היא crash שמחכה לקרות.

---

# ‏139. Spill-to-Disk

‏בחלק מהזרמים אפשר spill זמני לדיסק בעת burst.

‏אבל צריך למדוד recovery semantics.

---

# ‏140. Crash Consistency

‏אחרי crash, אנחנו צריכים לדעת מה durable ומה לא.

‏לא להניח שכל event שנקרא בזיכרון כבר persisted.

---

# ‏141. Restart Cursor

‏Consumer state צריך cursor/checkpoint durable.

‏אבל cursor חייב להיות atomic ביחס ל־processed output.

---

# ‏142. Exactly-Once Again

‏גם ב־data pipelines, `exactly once` לרוב תלוי בגבולות המערכת.

‏בפועל נבנה:

```text
at-least-once transport
+ idempotent processing
+ deterministic state
```

‏כאשר זה מתאים.

---

# ‏143. Transaction Boundary

‏צריך להגדיר מה atomic:

```text
read event
update state
persist derived output
advance cursor
```

‏בלי זה crash יכול ליצור duplicate או missing derived data.

---

# ‏144. Idempotent Projection

‏Projection של canonical events צריך להיות בטוח להרצה חוזרת כאשר אפשר.

---

# ‏145. State Rebuild

‏מערכת טובה יכולה למחוק cache/materialized state ולבנות אותו מחדש מה־source of truth.

‏זה מבחן איכות חזק.

---

# ‏146. Disaster Recovery

‏צריך לדעת:

```text
what data can be rebuilt?
what data cannot?
what must be backed up?
what is acceptable RPO/RTO?
```

---

# ‏147. RPO/RTO

‏`RPO` — כמה data מותר לאבד.

‏`RTO` — כמה זמן מותר עד חזרה לפעילות.

‏ל־Market Data archive ול־Execution Journal יהיו יעדים שונים.

---

# ‏148. Observability של Data Pipeline

‏נמדוד לפחות:

```text
ingest rate
parse failures
duplicate rate
gap rate
out-of-order rate
freshness
coverage
queue age
persist latency
reconnect count
schema errors
```

---

# ‏149. Data Quality Dashboard

‏Dashboard נפרד צריך להראות:

```text
provider health
symbol coverage
freshness distribution
sequence gaps
latency percentiles
cross-provider divergence
```

---

# ‏150. Alert על Symptom ולא רק Crash

‏Alert כאשר:

```text
fresh coverage drops
median spread suddenly halves across universe
trade count collapses
zero/null rate spikes
```

‏גם אם process עדיין alive.

---

# ‏151. `Data Incident Packet`

‏בעת incident נשמור:

```text
provider status
connection ids
sequence ranges
sample raw messages
quality metrics
system load
queue ages
recent deploy/version
```

---

# ‏152. Data RCA

‏שאלות:

```text
what was the first divergence?
raw source or parser?
ordering or state builder?
storage or query?
online only or historical too?
which decisions were affected?
```

---

# ‏153. Impact Analysis

‏Data bug לא נגמר ב־“תיקנו parser”.

‏צריך לדעת:

```text
which days?
which symbols?
which features?
which experiments?
which live decisions?
```

---

# ‏154. Backfill after Incident

‏אחרי תיקון:

```text
rebuild affected canonical data
recompute affected features
rerun affected experiments
compare decisions
```

---

# ‏155. Provenance Graph

‏ככל שהמערכת גדלה, כדאי לחשוב על graph:

```text
Raw Partition
→ Canonical Partition
→ Feature Set
→ Experiment
→ Strategy Version
→ Live Decision
```

---

# ‏156. Security

‏Market data אולי לא סודי, אבל credentials, account identifiers ו־broker events כן יכולים להיות רגישים.

‏אין לערבב secrets ב־raw logs.

---

# ‏157. Redaction

‏Logs ו־archives צריכים redaction policy.

‏לא לשמור tokens/passwords/auth headers.

---

# ‏158. Access Control

‏Historical market data, broker data ו־research results יכולים לקבל permissions שונות.

---

# ‏159. Licensing

‏Market Data יכולה להיות כפופה ל־license restrictions.

‏לפני redistribution/export/share צריך לבדוק תנאי provider עדכניים.

---

# ‏160. Provider-Agnostic Storage

‏Raw נשאר provider-specific.

‏Canonical צריך להיות provider-agnostic ככל שניתן.

‏אבל לא למחוק provider-specific metadata שעשוי להסביר behavior.

---

# ‏161. Canonical אינו Lowest Common Denominator

‏טעות היא להוריד כל provider לרמת המכנה המשותף הנמוך ביותר.

‏עדיף:

```text
canonical core
+ provider extensions/provenance
```

---

# ‏162. Capability-Aware Data

‏אם feed מסוים לא מספק depth, feature שדורש depth צריך להיות:

```text
UNAVAILABLE
```

‏לא fabricated.

---

# ‏163. Multi-Provider Merge

‏אם משלבים feeds, צריך conflict policy.

‏למשל:

```text
primary source
secondary validator
failover source
```

‏לא “קח את המחיר האחרון מכל אחד”.

---

# ‏164. Failover Semantics

‏כאשר עוברים provider:

```text
provider_generation++
```

‏כדי שלא נמשיך להשתמש state כאילו continuity מובטחת.

---

# ‏165. Warm-Up after Failover

‏לא תמיד נכון לחזור ל־TRADE מיד.

‏ייתכן שצריך:

```text
fresh quote
fresh trade
fresh status
minimum history window
```

‏לפני candidate eligibility.

---

# ‏166. History Warm-Up

‏Feature של `30s momentum` אינו valid מיד אחרי restart אם יש לנו רק `2s` history.

‏צריך explicit warm-up state.

---

# ‏167. Partial Feature Readiness

‏לכל Feature יכול להיות readiness משלו.

‏כך symbol יכול להיות rankable ל־Feature A אבל לא ל־Feature B.

---

# ‏168. Derived Feature Cache

‏Cache צריך invalidation semantics.

‏כאשר late correction משנה source state, feature cache אולי invalid.

---

# ‏169. Cache Key חייב לכלול Version

‏למשל:

```text
symbol
feature_id
feature_version
cutoff_time
source_generation
```

---

# ‏170. Query Correctness

‏Historical query צריכה להגדיר:

```text
inclusive/exclusive boundaries
session
symbol identity
timezone
revision policy
```

---

# ‏171. Off-by-One Time Bugs

‏חלון:

```text
[t-10s, t]
```

‏אינו בהכרח אותו דבר כמו:

```text
(t-10s, t]
```

‏ב־high-frequency data זה משנה.

---

# ‏172. Nearest Earlier Snapshot

‏כאשר עושים joins לפי זמן, לרוב צריך:

```text
latest record known at-or-before t
```

‏ולא nearest absolute.

---

# ‏173. Future Nearest Bug

‏`nearest()` יכול לבחור record אחרי `t`.

‏זה leakage קלאסי.

---

# ‏174. Tolerance

‏אם snapshot ישן מדי, צריך להחזיר `UNKNOWN`, לא להשתמש בו כי הוא “הכי קרוב”.

---

# ‏175. Window Completeness

‏Feature של 10 שניות צריך לדעת אם החלון מלא.

‏אם חסרות 7 שניות בגלל reconnect, number יכול להיות misleading.

---

# ‏176. Coverage inside Window

‏נשמור metadata כמו:

```text
expected_duration
observed_duration
event_count
gap_count
max_gap
```

---

# ‏177. Feature Confidence from Data Quality

‏Feature confidence יכול להיות פונקציה של:

```text
freshness
coverage
gaps
provider health
sample count
```

---

# ‏178. אבל Confidence אינו תיקון קסם

‏אם data חסר מדי — reject.

‏לא תמיד מספיק “להוריד score”.

---

# ‏179. Hard Data Gates

‏למשל:

```text
if quote stale → no execution
if status unknown → no new risk
if window incomplete → feature unavailable
```

---

# ‏180. Soft Data Penalties

‏במקרים פחות חמורים אפשר:

```text
reduce confidence
reduce rank contribution
```

‏אבל policy חייבת להיות research-backed.

---

# ‏181. Data and Execution Truth

‏Market Data Provider אומר מה הוא ראה בשוק.

‏Broker אומר מה קרה לפקודות ול־position שלנו.

‏אלה שני truth domains שונים.

---

# ‏182. Never Infer Fill from Market Print

‏גם אם trade print עבר במחיר שלנו, אסור להסיק שה־order שלנו התמלא.

‏Fill truth מגיע מה־broker/execution venue.

---

# ‏183. Never Infer Position from Intent

‏Intent אינו Position.

‏Position truth מגיע broker reconciliation + execution ledger.

---

# ‏184. Data Retention for RCA

‏סביב trades/incident נשמור fidelity גבוהה יותר.

‏למשל window לפני/אחרי decision.

---

# ‏185. Triggered High-Fidelity Capture

‏אפשר להפעיל capture עמוק יותר כאשר:

```text
symbol enters Top-N
order submitted
position opened
halt detected
data anomaly detected
```

---

# ‏186. Research Sampling vs Live Sampling

‏אל תניח ש־dataset sampled בקצב `1s` יכול להסביר strategy שפועלת ב־`100ms`.

---

# ‏187. Milliseconds-to-Seconds Requirement שלנו

‏לרובוט שלנו data pipeline צריך להיות מתוכנן כך שה־resolution וה־arrival metadata יתאימו ל־signals ממאות מילישניות ועד שניות.

‏אין צורך להעמיד פנים שיש לנו microsecond-grade market truth אם provider וה־API לא נותנים זאת.

---

# ‏188. Honest Fidelity

‏עדיף לומר:

```text
we know this to ~100ms fidelity
```

‏מאשר להציג timestamps עם 6 ספרות אחרי הנקודה וליצור אשליית precision.

---

# ‏189. `Signal Half-Life` ו־Data Quality

‏אם Feature משתמש data בן `300ms` ו־signal half-life הוא `500ms`, ה־data age כבר מהותי מאוד.

---

# ‏190. Data Latency Budget

‏נפריד:

```text
provider latency
network latency
ingest latency
normalize latency
state update latency
feature latency
scanner latency
```

---

# ‏191. Data Age at Decision

‏המדד החשוב הוא לא רק pipeline latency.

‏אלא:

```text
DecisionTime - SourceEventTime
```

‏או המקבילה המדויקת שניתנת למדידה.

---

# ‏192. Data Age Distribution

‏נמדוד P50/P95/P99.

‏Tail stale data יכול להיות בדיוק מה שפוגע בעסקאות הגרועות.

---

# ‏193. Freshness Bias in Winners

‏יכול להיות שה־Top candidates הם פשוט symbols עם feed fresh יותר.

‏צריך לבדוק correlation בין rank לבין data age.

---

# ‏194. Research Check: Rank vs Freshness

‏נריץ diagnostics:

```text
rank bucket
vs
median data age
vs
coverage
```

‏אם יש bias — Scanner architecture משפיעה על Alpha.

---

# ‏195. Data Quality as Confounder

‏Feature שנראה predictive אולי רק מסמן symbols שה־provider מעדכן בתדירות גבוהה.

‏צריך להפריד market effect מ־delivery effect.

---

# ‏196. Provider Popularity Bias

‏מניות פעילות יותר עשויות לקבל richer data.

‏אם Feature משתמש event count, צריך לדעת האם מדובר בשוק או batching/provider mechanics.

---

# ‏197. Batch Timestamp Artifact

‏Provider עלול לשלוח קבוצת events יחד.

‏אם אנחנו משתמשים receive timestamp כאילו הוא event timestamp, נראה burst מלאכותי.

---

# ‏198. Heartbeats

‏Heartbeat עוזר להבחין בין:

```text
quiet symbol
quiet market
broken connection
stalled subscription
```

---

# ‏199. Liveness vs Freshness Again

‏Socket פתוח אינו אומר data fresh.

‏Process alive אינו אומר market state usable.

---

# ‏200. Subscription Audit

‏Whole-market system צריך לדעת:

```text
expected subscriptions
active subscriptions
failed subscriptions
pending subscriptions
```

---

# ‏201. Silent Unsubscribe

‏Provider יכול להפסיק symbol מסוים בלי להפיל connection כולו.

‏צריך per-symbol freshness/coverage monitoring.

---

# ‏202. Symbol Admission

‏Symbol לא נכנס ל־Scanner רק כי קיבל event אחד.

‏צריך readiness gate.

---

# ‏203. Symbol Eviction

‏Symbol stale/invalid צריך לצאת מ־eligible universe מהר מספיק.

---

# ‏204. Re-entry after Data Recovery

‏לאחר data recovery צריך warm-up מחדש כאשר feature windows נפגעו.

---

# ‏205. `Data Generation`

‏כאשר יש reconnect/failover/reset משמעותי, נעלה generation.

‏Signals שנבנו על generation ישן יכולים להפוך stale.

---

# ‏206. Feature Generation Matching

‏לפני execution אפשר לבדוק:

```text
current_data_generation == decision_data_generation
```

‏אם לא — revalidate.

---

# ‏207. Data Mutation after Decision

‏אם late correction משנה historical state, אין לשכתב decision log כאילו ידענו אז את המידע החדש.

---

# ‏208. `Observed`, ‏`Inferred`, ‏`Corrected`

‏שווה לסמן records:

```text
OBSERVED_LIVE
INFERRED
BACKFILLED
CORRECTED
```

‏כדי שהמחקר יבין איכות provenance.

---

# ‏209. Synthetic Data

‏Synthetic scenarios טובים לבדיקות.

‏אבל אסור לערבב אותם בטעות עם market observations.

---

# ‏210. Fixture Provenance

‏גם test fixture צריך source/version.

‏אחרת golden test הופך artifact שאיש אינו יודע למה הוא נכון.

---

# ‏211. Property Tests ל־Data

‏דוגמאות:

```text
replay twice → same state
duplicate event → no duplicate economic effect
late invalid event → quality state changes predictably
unknown enum → no silent coercion
```

---

# ‏212. Fault Injection

‏נזריק:

```text
gaps
duplicates
reordering
clock jumps
provider disconnect
partial file
schema drift
slow disk
queue overflow
```

---

# ‏213. Golden Replay Scenarios

‏נשמור scenarios קבועים עם expected final state.

---

# ‏214. Performance Regression Tests

‏Data pipeline צריך thresholds גם ל־throughput ו־latency.

‏Bug יכול להיות “נכון אבל איטי פי 5”.

---

# ‏215. Memory Regression

‏Whole-market capture יכול לדלוף memory בהדרגה.

‏Soak tests חשובים.

---

# ‏216. Allocation Budget

‏ב־.NET hot path נמדוד allocations/event.

‏אבל לא נעשה micro-optimization בלי profiler.

---

# ‏217. Object Pooling

‏Pooling יכול לעזור, אבל גם ליצור bugs של reuse/stale state.

‏נשתמש רק כאשר evidence מצדיק.

---

# ‏218. Serialization Format

‏JSON נוח.

‏Binary/columnar formats יכולים להיות יעילים יותר.

‏בחירה לפי workload, debuggability ו־compatibility.

---

# ‏219. Human Debuggability

‏לפחות path אחד צריך לאפשר inspect פשוט של event.

‏Optimization שאי אפשר לחקור בשעת incident עולה ביוקר.

---

# ‏220. Dual Representation

‏אפשר:

```text
compact binary primary
+ sampled human-readable diagnostics
```

---

# ‏221. Data Catalog

‏ככל שהקורס/מערכת גדלים, צריך catalog:

```text
dataset
owner
schema
source
retention
quality guarantees
consumers
```

---

# ‏222. Documentation is Part of the Contract

‏Data field בלי definition מדויק הוא bug עתידי.

---

# ‏223. Example Field Contract

```text
field: last_trade_price
meaning: price of latest accepted trade event in canonical stream
source: provider trade feed
unit: USD
unknown_policy: null/UNKNOWN
freshness: derived from latest accepted trade event
```

---

# ‏224. `Last` צריך הגדרה

‏המילה `LAST` יכולה להשתנות לפי provider ו־trade conditions.

‏לכן לא מניחים semantics בלי contract.

---

# ‏225. Same Name, Different Meaning

‏שני providers יכולים לקרוא לשדה `volume` ולתת משמעות שונה.

‏Canonical mapping דורש בדיקה.

---

# ‏226. Data Comparison Harness

‏כל provider חדש יעבור side-by-side comparison על symbols וימים ידועים.

---

# ‏227. Migration without Big Bang

‏Provider חדש:

```text
capture shadow
compare
calibrate
promote gradually
```

‏לא מחליפים source of truth ביום אחד.

---

# ‏228. Shadow Feed

‏Shadow feed לא משפיע על החלטות אבל נמדד.

‏כך לומדים divergence בלי לסכן execution.

---

# ‏229. Promotion Criteria

‏Provider חדש צריך להוכיח:

```text
coverage
freshness
reliability
semantic correctness
cost
latency
recovery behavior
```

---

# ‏230. Data Cost אינו רק Subscription Fee

‏יש גם:

```text
engineering cost
storage
bandwidth
operations
licensing constraints
vendor lock-in
```

---

# ‏231. `Data ROI`

‏Feature/data tier יקר צריך להוכיח Decision Impact או Execution Improvement.

---

# ‏232. More Data Can Hurt

‏עוד fields יכולים:

```text
increase latency
increase cost
increase noise
increase failure surface
increase overfitting
```

‏לא אוספים הכול רק כי אפשר.

---

# ‏233. אבל Raw Optionality חשובה

‏מצד שני, data זול יחסית שקשה להשיג מחדש בעתיד יכול להיות שווה retention.

‏זו החלטת trade-off.

---

# ‏234. `Data Debt`

‏Shortcuts ב־schema/provenance/replay מצטברים מהר.

‏אחר כך כל experiment נהיה חשוד.

---

# ‏235. Definition of Done ל־Feed חדש

‏Feed אינו “מחובר” רק כי websocket עובד.

‏Done דורש:

```text
schema documented
sequence understood
gaps detected
reconnect tested
quality metrics live
replay supported
provider comparison done
failure modes tested
```

---

# ‏236. Practitioner Secret — Bugs נוטים להיות Conditional

‏Data bug מסוכן לרוב אינו פוגע ב־100% מהאירועים.

‏הוא קורה למשל:

```text
only at open
only after reconnect
only on high-volume symbols
only when sequence resets
only around halts
only on provider failover
```

‏לכן aggregate health יכול להיראות תקין.

---

# ‏237. Practitioner Secret — Corruption יכול ליצור Alpha יפה

‏דוגמאות:

```text
future quote joined backward
stale losers excluded
missing symbols removed
late trades reordered into the past
spread reconstructed unrealistically
```

‏כל אחד מהם יכול לשפר Backtest.

---

# ‏238. Practitioner Secret — Clean Data יכול להיות פחות Realistic

‏Dataset historical “מנוקה” מדי עלול להסיר בדיוק את הבעיות שהמערכת תפגוש Live.

‏לכן צריך גם clean research data וגם as-observed live data.

---

# ‏239. Practitioner Secret — Latency Is a Data Property Too

‏Latency אינה רק property של הקוד שלנו.

‏היא property של feed delivery.

‏צריך version/measure אותה כמו spread או volume.

---

# ‏240. Practitioner Secret — Gaps During Bursts Matter More

‏Missing 100 events בזמן שוק מת יכול להיות שולי.

‏Missing 100 events בזמן burst יכול למחוק את כל ה־signal.

‏לכן gap severity צריך להיות context-aware.

---

# ‏241. Practitioner Secret — Provider Recovery Can Backfill History

‏אחרי reconnect, provider יכול לשלוח data backlog.

‏אם אנחנו מתייחסים אליו כ־fresh live flow, נקבל fake burst.

---

# ‏242. Practitioner Secret — Receive Order Can Become Strategy Input Accidentally

‏אם code משתמש “last processed event” במקום market semantics, network scheduling הופך Feature.

---

# ‏243. Practitioner Secret — Data Quality and Strategy Performance Are Coupled

‏אם Strategy מצליחה רק כאשר data quality מושלמת, זה בסדר — אבל חייבים למדוד availability של התנאי הזה.

‏Edge נדיר מדי בגלל data gates אולי אינו operationally useful.

---

# ‏244. Practitioner Secret — Unknown Is Valuable

‏`UNKNOWN` שומר אותנו מפני confidence מזויף.

‏מערכת שמכריחה כל field להיות מספר מסתירה אי־ודאות.

---

# ‏245. Practitioner Secret — Repair Can Break Reproducibility

‏תיקון dataset ללא version חדש יכול לשנות תוצאות ישנות בלי שנדע.

‏זו אחת הסיבות ל־immutable dataset IDs.

---

# ‏246. Practitioner Secret — “Same Day” Is Not Same Market State

‏Open, lunch, close, halt, fast market ו־provider degradation הם regimes שונים גם באותו trading day.

‏Data quality analysis צריך segmentation.

---

# ‏247. Practitioner Secret — Data Incident Can Be Strategy Incident

‏אם feed drift שינה rank, זה לא “רק infrastructure”.

‏זה שינוי economic behavior.

---

# ‏248. RCA Taxonomy מוצע

```text
DX_GAP
DX_DUPLICATE
DX_OUT_OF_ORDER
DX_STALE
DX_TORN_STATE
DX_SCHEMA_DRIFT
DX_PARSER_BUG
DX_UNIT_MISMATCH
DX_PROVIDER_DIVERGENCE
DX_BACKFILL_MISMATCH
DX_FUTURE_LEAKAGE
DX_UNIVERSE_BIAS
DX_CLOCK_ERROR
DX_STORAGE_CORRUPTION
DX_REPLAY_MISMATCH
DX_UNKNOWN
```

---

# ‏249. Minimal Architecture לרובוט שלנו

```text
Provider Adapter
    ↓
Raw Capture
    ↓
Canonical Normalizer
    ↓
Sequence / Quality Validator
    ↓
Canonical Event Log
    ↓
Per-Symbol State
    ↓
Incremental Feature Engine
    ↓
Scanner
```

‏במקביל:

```text
Canonical Event Log
    ↓
Historical Store
    ↓
Replay / Research / RCA
```

---

# ‏250. Baseline ל־MVP

‏בשלב ראשון לא צריך data lake מפלצתי.

‏צריך:

1. ‏Raw capture אמין.
2. ‏Canonical schema קטן וברור.
3. ‏`event_time` + `receive_time`.
4. ‏sequence/gap detection כאשר provider מאפשר.
5. ‏per-symbol freshness.
6. ‏append-only historical log.
7. ‏deterministic Replay.
8. ‏dataset/version metadata.
9. ‏quality metrics.
10. ‏יכולת RCA מה־Feature עד Raw event.

---

# ‏251. מה לא לעשות ב־MVP

‏לא צריך להתחיל עם:

```text
huge distributed lakehouse
10 databases
complex streaming framework
hundreds of schemas
real-time ML feature store
```

‏אם local/event-driven pipeline פשוט עומד ב־throughput וב־reliability — הוא עדיף.

---

# ‏252. מתי כן להוסיף Infrastructure

‏רק כאשר measurement מראה bottleneck:

```text
CPU
memory
I/O
storage size
query latency
replay duration
recovery time
```

---

# ‏253. Checklist לפני שמאמינים ל־Dataset

- ‏האם המקור והגרסה ידועים?
- ‏האם timestamps מוגדרים סמנטית?
- ‏האם ידוע איך ordering עובד?
- ‏האם gaps ו־duplicates נמדדים?
- ‏האם missing נשמר כ־missing?
- ‏האם units מפורשים?
- ‏האם symbol identity point-in-time correct?
- ‏האם corporate actions מטופלים לפי מטרת המחקר?
- ‏האם historical join אינו משתמש בעתיד?
- ‏האם dataset immutable/versioned?
- ‏האם אפשר לשחזר אותו?
- ‏האם ידוע מה היה live-observed ומה backfilled?
- ‏האם freshness/coverage היו מספיקים?
- ‏האם Replay משחזר את ה־state הצפוי?

---

# ‏254. Checklist לפני שמשתמשים ב־Data ל־Live Decision

- ‏Connection healthy?
- ‏Subscription active?
- ‏Trading status known?
- ‏Trade/quote freshness מספיקים?
- ‏Sequence continuity מספיק טובה?
- ‏Feature windows warmed up?
- ‏Provider generation תואם ל־decision?
- ‏Coverage של השוק מספיקה לדירוג cross-sectional?
- ‏אין active data incident?
- ‏אין provider conflict לא פתור?

‏אם לא — `NO TRADE` יכול להיות התוצאה הנכונה.

---

# ‏255. מה צריך לזכור בעל פה

‏חמישה עקרונות:

1. ‏`Event Time != Receive Time != Process Time`.
2. ‏`Missing != Zero`.
3. ‏`Raw != Canonical != Derived`.
4. ‏`Historical Correctness != Point-in-Time Correctness`.
5. ‏Data ללא provenance, quality ו־replayability אינו בסיס מספיק ל־Edge קצר־טווח.

---

# ‏256. הקשר הישיר לרובוט שלנו

‏הרובוט שלנו מנסה לזהות momentum קצר על אלפי מניות.

‏לכן Data Engineering חייב להגן במיוחד מפני:

```text
stale symbols
uneven freshness across universe
fake bursts from batching/backfill
future leakage in historical joins
reconnect gaps
partial universe coverage
data age that is large relative to signal half-life
```

‏במערכת שלנו, data quality אינה רק Operations.

‏היא חלק מ־Alpha preservation.

---

# ‏257. משפט הסיום

> ‏**לפני ששואלים “האם ה־Feature מנבא?”, צריך לשאול “האם אנחנו יודעים בדיוק איזה מידע היה זמין, באיזה זמן, באיזה סדר ובאיזו איכות?”. רק אחר כך המספרים מתחילים להיות Evidence.**

---

# ‏258. מעבר לשלב הבא

‏אחרי שבנינו בסיס נתונים אמין, השלב הבא בקורס הוא `Testing Best Practices` — איך בודקים Strategy, Scanner, Data Pipeline, Execution ו־Recovery בצורה שמכסה גם correctness וגם failure modes, בלי להפוך את suite לאיטית ולא שימושית.
