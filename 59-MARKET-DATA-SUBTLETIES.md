# ‏שלב 59 — `Market Data Subtleties`: כשה־Feed נראה תקין אבל מספר סיפור שגוי

> ‏מטרת הפרק: להבין את שכבת ה־Market Data ברמת הפרטים שמבדילים בין signal אמיתי לבין artifact — timestamps, trade conditions, odd lots, quote semantics, direct/consolidated views, corrections, out-of-order delivery, batching, normalization, gaps, symbol lifecycle ו־provider-specific behavior.
>
> ‏העיקרון המרכזי: **Market Data הוא observation של השוק — לא השוק עצמו. כל field חייב להיבחן לפי source, timing, eligibility, ordering, aggregation ו־correction semantics.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה Data שנראה “נקי” יכול להיות מסוכן

‏מפתח רואה:

```text
Symbol = XYZ
Last = 25.13
Bid = 25.12
Ask = 25.14
Timestamp = 14:30:02.120
```

‏אבל מאחורי ארבעת השדות האלה יש שאלות רבות:

- ‏מי יצר את המחיר?
- ‏מאיזה venue?
- ‏האם ה־Last הוא trade רגיל?
- ‏האם הוא eligible לשינוי official last?
- ‏האם מדובר ב־odd lot?
- ‏האם ה־Bid וה־Ask מאותו רגע?
- ‏האם quote אחד מהם כבר stale?
- ‏האם provider איחד מספר feeds?
- ‏האם timestamp הוא exchange time או provider time?
- ‏האם event הגיע אלינו מאוחר?
- ‏האם הייתה correction שלא ראינו עדיין?

‏לכן:

```text
Value without semantics
!=
Reliable market state
```

---

# ‏2. ארבעת הזמנים שחייבים להפריד

‏ל־event כדאי לשמור לפחות:

```text
EventTime
ProviderTime
ReceiveTime
ProcessTime
```

‏ולעתים גם:

```text
PersistTime
FeatureReadyTime
DecisionTime
```

‏המשמעות:

- ‏`EventTime` — מתי האירוע התרחש לפי המקור.
- ‏`ProviderTime` — מתי ספק הנתונים עיבד/הפיץ אותו, אם קיים.
- ‏`ReceiveTime` — מתי המערכת שלנו קיבלה אותו.
- ‏`ProcessTime` — מתי הוא נכנס ל־canonical state.

‏הפרדה זו מאפשרת לזהות:

```text
market delay
provider delay
network delay
local queueing delay
processing delay
```

---

# ‏3. Timestamp precision אינו Timestamp accuracy

‏Timestamp עם microseconds אינו מבטיח שהאירוע באמת תוזמן בדיוק כזה.

‏יכול להיות:

```text
14:30:02.123456
```

‏אבל בפועל:

- ‏ה־provider batch עדכן כמה events יחד.
- ‏השעון לא מסונכרן היטב.
- ‏ה־timestamp נוצר אחרי processing פנימי.
- ‏precision הוא שש ספרות, אבל accuracy היא מילישניות.

‏לכן אין להסיק ordering עדין רק ממספר ספרות רב.

---

# ‏4. Sequence Numbers לעיתים חשובים יותר מ־Timestamp

‏כאשר feed מספק sequence:

```text
101
102
103
104
```

‏הוא יכול לתת ordering חזק יותר מ־timestamps קרובים.

‏פער:

```text
101
102
105
```

‏צריך להפוך מיד ל־Data Quality Event.

‏לא מתעלמים ממנו רק משום שהמחירים “נראים סבירים”.

---

# ‏5. Duplicate אינו בהכרח Bug פשוט

‏אותו event יכול להופיע שוב בגלל:

- ‏reconnect.
- ‏replay של provider.
- ‏retry.
- ‏multiple transport paths.
- ‏aggregation layer.

‏לכן deduplication צריך להתבסס על identity אמינה ככל האפשר.

‏Dedup אגרסיבי מדי גם מסוכן — שני trades אמיתיים יכולים להיות זהים במחיר ובכמות.

---

# ‏6. Out-of-Order Events

‏בשוק מבוזר ובמערכת רשתית:

```text
A happened first
B happened second
```

‏לא מבטיח:

```text
A arrives first
B arrives second
```

‏Out-of-order יכול לשבש:

- ‏returns.
- ‏velocity.
- ‏trade signing.
- ‏order-book reconstruction.
- ‏MFE/MAE.
- ‏labels.

‏צריך להגדיר policy מפורשת:

```text
accept
reorder within bounded window
mark late
ignore for live state but preserve for audit
```

---

# ‏7. Late Event הוא לא אותו דבר כמו Bad Event

‏אירוע יכול להיות אמיתי לחלוטין אבל להגיע מאוחר מדי לשימוש בהחלטה.

‏לכן לכל event חשוב גם:

```text
event_age_at_receive
```

‏ולעתים:

```text
event_age_at_decision
```

‏Signal שמבוסס על אירוע בן `800ms` אינו שקול לאותו signal כשהאירוע בן `20ms`.

---

# ‏8. Trade Conditions

‏לא כל trade צריך לקבל אותה משמעות.

‏Trades עשויים להגיע עם conditions שמשנים את הפרשנות שלהם.

‏לדוגמה עקרונית:

- ‏regular trade.
- ‏late report.
- ‏out-of-sequence.
- ‏auction print.
- ‏average-price related print.
- ‏derivatively priced trade.
- ‏corrected/canceled trade.

‏המשמעות המדויקת של כל code תלויה ב־feed וב־venue ולכן לא hard-code בלי documentation עדכני.

---

# ‏9. “Last” אינו מושג אחד

‏יכולים להיות כמה `Last`-ים:

```text
last received trade
last eligible trade
last regular-session trade
last consolidated trade
last venue-local trade
official last
```

‏אם Scanner משתמש ב־`LAST`, צריך לדעת בדיוק איזה מהם הוא מקבל.

---

# ‏10. Last Price יכול להיות ישן למרות שהוא “המחיר האחרון”

‏מניה יכולה להמשיך לקבל quote updates בלי trade חדש.

‏לכן:

```text
LastAge
```

‏הוא field חשוב בפני עצמו.

‏ב־short-horizon momentum:

```text
Fresh quote + stale last
```

‏יכול להיות מצב שונה מאוד מ־fresh trade.

---

# ‏11. Bid/Ask אינם Snapshot אטומי בהכרח

‏אם provider שולח:

```text
Bid update
then Ask update
```

‏ייתכן שבין שניהם השוק כבר השתנה.

‏אם אנחנו מחברים אותם כאילו הגיעו באותו רגע, אנחנו עלולים ליצור:

- ‏spread מזויף.
- ‏crossed market מזויף.
- ‏midpoint שגוי.
- ‏microprice שגוי.

‏זו אחת הצורות של `torn snapshot`.

---

# ‏12. Crossed ו־Locked Markets

‏מצב:

```text
Bid > Ask
```

‏יכול להעיד על:

- ‏אירועים לא מסונכרנים.
- ‏שילוב feeds שונים.
- ‏stale side.
- ‏מצב שוק זמני אמיתי.
- ‏aggregation artifact.

‏לא נכון לתקן אוטומטית בלי להבין את המקור.

---

# ‏13. Spread חייב להיות Time-Aware

‏לא מספיק:

```text
spread = ask - bid
```

‏צריך לדעת:

```text
bid_age
ask_age
quote_age
```

‏Spread זול המבוסס על ask ישן יכול להיות אשליה.

---

# ‏14. Odd Lots

‏מסחר בכמויות קטנות יכול להיות משמעותי במיוחד במניות יקרות או פעילות.

‏אבל treatment של odd lots יכול להיות שונה בין feeds, quote systems ו־historical datasets.

‏לכן צריך לדעת:

- ‏האם trades כאלה קיימים ב־feed?
- ‏האם הם משפיעים על `Last`?
- ‏האם הם מופיעים ב־volume?
- ‏האם quotes שלהם מיוצגים?

‏אין להניח שכל ספק מתנהג אותו דבר.

---

# ‏15. Round Lots ו־Displayed Size

‏`BidSize` ו־`AskSize` יכולים לייצג unit שונה לפי API.

‏לדוגמה עקרונית:

```text
100 shares
```

‏או:

```text
1 lot
```

‏Normalization של quantity חייב להיות contract מפורש.

---

# ‏16. Size Units הם מקור קלאסי לבאגים

‏צריך להגדיר canonical units:

```text
Price → decimal/ticks
Quantity → shares
Notional → currency
Time → UTC + source timestamp
```

‏Unit ambiguity יכולה ליצור impact, volume ו־liquidity metrics שגויים פי `100` בלי crash אחד.

---

# ‏17. Consolidated Feed מול Direct Feed

‏`Consolidated` ו־`Direct` אינם פשוט “איטי” מול “מהיר”.

‏הם יכולים להיות שונים ב:

- ‏coverage.
- ‏venue visibility.
- ‏ordering.
- ‏timestamps.
- ‏depth.
- ‏aggregation.
- ‏latency.

‏לכן תוצאות Feature יכולות להשתנות רק בגלל observation model שונה.

---

# ‏18. Feed Fragmentation

‏שוק המניות האמריקאי מפוצל בין מספר venues.

‏לכן:

```text
One venue view
!=
Whole market view
```

‏Momentum שנראה ב־venue אחד יכול להיות:

- ‏מקומי.
- ‏מאוחר.
- ‏כבר reflected במקום אחר.

‏Cross-venue interpretation דורש זהירות.

---

# ‏19. Best Bid/Offer הוא Derived State

‏`NBBO` או best quote aggregate אינם “אירוע טבעי” אחד.

‏הם נגזרים ממספר מקורות.

‏לכן שינוי best bid יכול להגיע בגלל:

- ‏quote חדש.
- ‏quote cancellation.
- ‏venue becoming ineligible.
- ‏stale feed removal.

‏הסיבה לשינוי חשובה לפעמים לא פחות מהמחיר עצמו.

---

# ‏20. L1 אינו L2

‏`L1` נותן top of book.

‏הוא לא מספר:

- ‏כמה depth יש level אחד מאחור.
- ‏כמה venue fragmentation קיימת.
- ‏אם size שמופיע יציב.
- ‏כמה מהר הוא replenishes.

‏לכן אין לבנות inference של depth מלא מתוך L1 בלבד.

---

# ‏21. MBP מול MBO

‏עקרונית:

- ‏`MBP` מציג aggregate לפי price level.
- ‏`MBO` יכול לחשוף individual orders כאשר feed תומך בכך.

‏Queue estimation ו־order-flow reconstruction יכולים להיות שונים מאוד בין השניים.

---

# ‏22. Book Reset

‏יש feeds שבהם snapshot חדש מבטל state קודם.

‏אם reset לא מטופל נכון:

```text
old levels remain
+
new levels arrive
=
phantom liquidity
```

‏לכן book state חייב לדעת מתי generation השתנה.

---

# ‏23. Snapshot + Incremental Updates

‏Pattern נפוץ:

```text
Snapshot
→ incremental updates
→ gap
→ resnapshot
```

‏אסור להמשיך להחיל incremental updates על snapshot שכבר אינו trustworthy.

---

# ‏24. Gap State צריך להיות מפורש

‏לא:

```text
Book still looks okay
```

‏אלא:

```text
BookQuality = INVALID_AFTER_GAP
```

‏ורק resync מחזיר אותו ל־trusted state.

---

# ‏25. Corrections ו־Cancellations

‏Trade שדווח יכול להשתנות אחר כך.

‏אם historical pipeline מתקן אותו אך live pipeline השתמש בערך המקורי:

```text
historical truth
!=
live-known truth
```

‏זה קריטי למחקר point-in-time.

---

# ‏26. שתי אמיתות שצריך לשמור

‏לעיתים צריך להפריד:

```text
AsOriginallyObserved
AsLaterCorrected
```

‏למחקר signal צריך בדרך כלל לדעת מה היה known בזמן ההחלטה.

‏לחשבונאות/clean history אולי נרצה גם corrected view.

---

# ‏27. Backfill הוא מסוכן למחקר

‏Backfill יכול להביא data איכותי יותר ממה שהיה זמין ב־live.

‏אם מחליפים raw live history ב־clean backfill ללא סימון:

‏אנחנו עלולים לשפר את העבר באופן מלאכותי.

---

# ‏28. Batching מוסיף Latency סמוי

‏Provider יכול לשלוח events בקבוצות.

‏לכן:

```text
many events arrive together
```

‏לא אומר שהם התרחשו יחד.

‏Burst ב־ReceiveTime יכול להיות artifact של transport.

---

# ‏29. Compression Trade-Off

‏Compression יכולה:

- ‏לחסוך bandwidth.
- ‏להגדיל CPU.
- ‏להוסיף buffering.
- ‏להוסיף latency variance.

‏החלטה צריכה להיות empirical, לא אידאולוגית.

---

# ‏30. Provider Heartbeat אינו Market Activity

‏Heartbeat מוכיח שהחיבור חי.

‏הוא לא מוכיח שה־symbol feed fresh.

‏לכן צריך להפריד:

```text
ConnectionLiveness
DataFreshness
MarketActivity
```

---

# ‏31. “No Update” יכול להיות תקין

‏במניה שקטה:

```text
no trade for 3 seconds
```

‏אינו בהכרח feed failure.

‏Freshness צריך להיות contextual:

- ‏symbol activity.
- ‏quote activity.
- ‏session.
- ‏expected update rate.

---

# ‏32. אבל Silence גם יכול להיות Failure

‏אם כל universe מפסיק להתעדכן יחד:

‏זו אינדיקציה שונה לחלוטין.

‏לכן health צריך לכלול:

```text
per-symbol freshness
cross-universe freshness
provider heartbeat
message rate
sequence continuity
```

---

# ‏33. Fresh Coverage חשוב ל־Scanner

‏נגדיר:

```text
FreshCoverageRatio = FreshSymbols / EligibleUniverse
```

‏Top 1 מתוך `95%` universe fresh אינו בהכרח Top 1 אמיתי.

---

# ‏34. Candidate Freshness חשוב יותר מהממוצע

‏גם אם coverage טוב:

‏המועמד המוביל עצמו יכול להיות stale.

‏לכן לפני submit:

```text
candidate freshness gate
```

‏חייב להיות נפרד מה־global gate.

---

# ‏35. Cross-Sectional Fairness

‏אם מניות מתעדכנות בזמנים שונים:

‏השוואת score בזמן wall-clock אחד יכולה להיות unfair.

‏צריך למדוד:

```text
RankAge
FeatureAge
LastUpdateAge
```

‏לכל candidate.

---

# ‏36. Sampling יוצר Alias

‏אם sample כל `1s`, שני patterns שונים יכולים להיראות זהים.

‏לדוגמה:

```text
smooth rise
```

‏ו־

```text
spike + reversal + recovery
```

‏יכולים להגיע לאותה נקודת sample.

---

# ‏37. Event-Time Features עדיפים כאשר ה־Horizon קצר

‏כאשר אפשר:

‏Features המבוססים על events יכולים לשמור יותר מידע מ־fixed snapshots.

‏אבל הם יקרים יותר מבחינת:

- ‏volume.
- ‏storage.
- ‏complexity.
- ‏replay.

‏לכן אפשר לשלב:

```text
broad lightweight state
+
deep event detail for Top-N
```

---

# ‏38. Sampling Frequency אינה Strategy Horizon

‏`100ms` sampling לא אומר שיש לנו `100ms` edge.

‏ו־`1s` sampling לא אומר שה־edge חי שנייה.

‏אלה מושגים שונים:

```text
Observation cadence
Signal half-life
Decision latency
Holding horizon
```

---

# ‏39. Midpoint יכול להיות שגוי אם צד אחד stale

‏הנוסחה:

```text
Mid = (Bid + Ask) / 2
```

‏פשוטה.

‏אבל validity שלה תלויה בשני sides תקינים ורלוונטיים.

---

# ‏40. Microprice רגיש מאוד ל־Data Quality

‏Microprice משתמש ב־price + displayed size imbalance.

‏אם size:

- ‏stale.
- ‏unit-wrong.
- ‏fragmented.
- ‏transient.

‏אז microprice יכול להיות מדויק מתמטית ושגוי כלכלית.

---

# ‏41. Trade Signing אינו Truth

‏אלגוריתמים שמנסים להחליט אם trade היה buyer-initiated או seller-initiated הם inference.

‏צריך לשמור:

```text
side_estimate
confidence
method
```

‏ולא להפוך inference ל־fact.

---

# ‏42. Unknown Trade Side הוא מידע

‏אם confidence נמוך:

‏עדיף:

```text
UNKNOWN
```

‏מאשר לכפות BUY/SELL.

‏`unknown_share` יכול להפוך Feature חשוב לאיכות המידע.

---

# ‏43. Quote Stuffing / High Churn

‏הרבה quote updates לא בהכרח משקפים liquidity יציבה.

‏צריך להבחין בין:

```text
displayed depth
persistent depth
consumed depth
replenished depth
```

---

# ‏44. Liquidity Half-Life

‏Size גדול שחי `20ms` אינו שקול ל־size קטן שחי `800ms`.

‏לכן persistence יכול להיות Feature חשוב יותר מהצילום הבודד.

---

# ‏45. Zero Size / Missing Size

‏`0`, ‏`null`, missing field ו־“not supplied” אינם תמיד אותו דבר.

‏Normalization חייב לשמור semantic distinction כאשר אפשר.

---

# ‏46. Default Value הוא מלכודת

‏אסור להפוך:

```text
missing bid = 0
```

‏אם `0` הוא גם value חוקי טכנית בשכבה מסוימת.

‏עדיף explicit quality/state.

---

# ‏47. Decimal Precision

‏Price conversion צריך להימנע מ־floating noise מיותר.

‏אפשר לשקול canonical tick/integer representation כאשר מתאים.

‏אבל צריך לשמור tick-size semantics ולא להניח decimal places קבועים לכל symbol.

---

# ‏48. Tick Size יכול להשתנות לפי מכשיר/מחיר/כללים

‏אין להניח:

```text
always 0.01
```

‏כל validation של order price חייב לעבוד מול instrument rules עדכניות.

---

# ‏49. Symbol Identity אינו רק Ticker

‏Ticker יכול:

- ‏להשתנות.
- ‏להיות reused.
- ‏להתקשר ל־listing שונה.

‏לכן long-lived datasets צריכים stable instrument identity כאשר provider מאפשר זאת.

---

# ‏50. Corporate Actions

‏Splits, symbol changes ושינויים אחרים יכולים ליצור jumps מלאכותיים.

‏Historical feature computation חייב לדעת אם המחירים adjusted או raw.

---

# ‏51. Raw מול Adjusted Prices

‏ל־short-horizon execution:

‏בדרך כלל צריך raw tradable prices של אותו רגע.

‏למחקר ארוך יותר adjusted series יכול להיות שימושי.

‏אסור לערבב ביניהם בלי contract מפורש.

---

# ‏52. Session Context

‏אותו quote ב־pre-market, regular session ו־after-hours אינו בהכרח בעל אותה משמעות.

‏צריך לשמור:

```text
session_state
```

‏במקום להסיק רק מהשעה.

---

# ‏53. Auctions

‏Auction-related prints ו־quotes יכולים לשבור Features רגילים.

‏יש להפריד:

```text
continuous trading
auction state
reopen state
```

---

# ‏54. Halts

‏ב־halt:

‏Data יכול להמשיך להציג last known quote/trade.

‏`Price exists` אינו אומר `Price executable`.

---

# ‏55. Stale-but-Plausible הוא המסוכן ביותר

‏Data מופרך קל לזהות.

‏Data ישן שנראה הגיוני יכול לייצר decision אמין למראה.

‏לכן freshness gates קריטיים.

---

# ‏56. Provider Normalization יכול להסתיר Semantics

‏API נוח יכול להפוך feeds שונים למבנה אחיד.

‏זה טוב לארכיטקטורה, אבל מסוכן אם semantic differences נעלמים.

‏Canonical layer צריך לשמר metadata כמו:

```text
source
venue
condition
quality
sequence
original_timestamp
```

---

# ‏57. Canonical אינו Mean “Lossy”

‏Normalization טוב:

```text
common shape
+
source-specific evidence
```

‏ולא:

```text
throw away everything inconvenient
```

---

# ‏58. Parser Version חייב להישמר

‏אם parsing logic משתנה:

‏אותו raw event יכול להפוך ל־canonical state שונה.

‏לכן dataset reproducibility דורש:

```text
parser_version
schema_version
normalizer_version
```

---

# ‏59. Schema Drift

‏Provider יכול להוסיף/לשנות semantics בלי שהקוד יקרוס.

‏זה מסוכן במיוחד כאשר:

```text
field still parses
but meaning changed
```

‏Contract tests ו־sample fixtures עוזרים לזהות זאת.

---

# ‏60. Silent Enum Expansion

‏Condition code חדש שלא מוכר לנו לא צריך להפוך אוטומטית ל־regular.

‏עדיף:

```text
UNKNOWN_CONDITION
```

‏עם alert/metric.

---

# ‏61. Data Quality State

‏לכל stream/symbol אפשר להחזיק:

```text
GOOD
DEGRADED
GAPPED
STALE
UNKNOWN
INVALID
```

‏Feature computation יכול להשתמש בזה ישירות.

---

# ‏62. Quality הוא Input ל־Decision

‏לא רק metric לדשבורד.

‏לדוגמה:

```text
Good signal + Poor data quality
→ NO TRADE
```

---

# ‏63. Provider Failover אינו שקוף לחלוטין

‏מעבר Provider יכול לשנות:

- ‏latency.
- ‏coverage.
- ‏quote semantics.
- ‏trade conditions.
- ‏symbol mapping.

‏לכן צריך `DataGeneration` חדש ולעתים warm-up מחדש.

---

# ‏64. Cross-Provider Divergence

‏אם שני providers חולקים על:

```text
Last
Bid
Ask
status
```

‏אין לבחור אוטומטית את “המחיר היפה יותר”.

‏צריך divergence policy.

---

# ‏65. Redundancy יכולה להוסיף Complexity

‏שני feeds אינם בהכרח פי שניים אמינות.

‏הם מוסיפים:

- ‏dedup.
- ‏ordering ambiguity.
- ‏source precedence.
- ‏clock differences.

‏Redundancy צריכה להגיע עם arbitration design.

---

# ‏66. Historical Data Vendor ≠ Live Data Vendor

‏אם Research ו־Live משתמשים בספקים שונים:

‏צריך למדוד distribution shift של:

- ‏timestamps.
- ‏trade inclusion.
- ‏quotes.
- ‏volume.
- ‏conditions.

---

# ‏67. Online/Offline Parity

‏Feature צריך להיות מוגדר כך שנוכל להסביר:

```text
what live saw
what replay saw
why they match or differ
```

---

# ‏68. Replay עם “Perfectly Ordered Data” עלול לשקר

‏אם Live חווה:

- ‏late events.
- ‏gaps.
- ‏batching.
- ‏reconnect.

‏Replay אידיאלי מדי נותן Strategy יתרון שלא היה לה בעולם האמיתי.

---

# ‏69. Replay Fidelity Levels

‏כדאי להבחין:

```text
Economic Replay
Transport Replay
Failure Replay
```

‏`Economic Replay` בודק market sequence.

‏`Transport Replay` כולל arrival timing/batching.

‏`Failure Replay` מוסיף gaps/reconnect/latency spikes.

---

# ‏70. Point-in-Time Universe

‏גם רשימת symbols היא Data.

‏Backtest שמשתמש ב־universe של היום על העבר יכול ליצור survivorship bias.

---

# ‏71. Market Status הוא Data קריטי

‏לא מספיק prices.

‏צריך לשמור status כמו:

```text
trading
halted
auction
closed
unknown
```

‏לפי מה שה־provider מסוגל לספק.

---

# ‏72. Metadata Age

‏גם instrument metadata יכול להתיישן.

‏לדוגמה:

- ‏tick size.
- ‏listing venue.
- ‏status.
- ‏symbol mapping.

‏צריך versioning/refresh policy.

---

# ‏73. Volume אינו תמיד Comparable

‏צריך להבין אם volume הוא:

```text
venue-local
consolidated
session cumulative
rolling
per trade
```

‏בלי זה Feature של activity יכול להיות חסר משמעות.

---

# ‏74. Cumulative Volume Reset

‏Session boundary או reconnect יכולים לייצר reset.

‏Delta calculation בלי detection יכול ליצור volume שלילי או spike מזויף.

---

# ‏75. Trade Count Semantics

‏`TradeCount` יכול להיות:

- ‏מספר raw prints.
- ‏מספר eligible prints.
- ‏aggregated events.

‏צריך לדעת מה provider סופר.

---

# ‏76. One Provider Event יכול לייצג Multiple Market Events

‏Aggregation יכולה לצמצם message count.

‏לכן event count אינו תמיד trade count.

---

# ‏77. One Market Event יכול לייצר Multiple Provider Events

‏Corrections, enrichment או venue-specific fan-out יכולים ליצור ההפך.

---

# ‏78. Quote Size Change בלי Price Change

‏זה עדיין information.

‏Scanner שלא מעבד size-only updates מפספס book pressure dynamics.

---

# ‏79. Price Change בלי Trade

‏Bid/Ask יכולים לזוז ללא print.

‏לכן momentum של transaction prices ו־quote momentum הם signals שונים.

---

# ‏80. Last-Only Scanner הוא Baseline — לא Truth מלאה

‏`Last` יכול להיות שימושי כשלב מחקר פשוט.

‏אבל לפני Execution נרצה בדרך כלל גם:

```text
Bid
Ask
Freshness
Spread
Liquidity
```

‏כדי להעריך executability.

---

# ‏81. Data Entitlements יכולים לשנות את מה שאנחנו רואים

‏Provider/Broker עשויים להחזיר data שונה לפי entitlement, account או session.

‏לכן startup validation צריך לזהות capability בפועל.

---

# ‏82. Partial Universe Coverage

‏Subscription limit או failed subscription יכולים להשאיר subset בלבד.

‏המערכת לא צריכה להתנהג כאילו universe מלא.

---

# ‏83. Subscription Success אינו Data Success

‏ACK ל־subscription לא מבטיח שהגיע update תקין.

‏צריך freshness/readiness verification.

---

# ‏84. Reconnect יכול לשנות Ordering Boundary

‏אחרי reconnect:

‏לא מניחים continuity אוטומטית.

‏ייתכן צורך ב:

```text
new generation
snapshot
warmup
```

---

# ‏85. Warm-Up אינו רק Performance

‏אחרי reconnect חסר history ל־rolling features.

‏לכן symbol יכול להיות connected אך לא feature-ready.

---

# ‏86. Feature Readiness חייב להיות מפורש

‏לדוגמה:

```text
HAS_10S_HISTORY
HAS_60S_HISTORY
BOOK_SYNCED
TRADE_FLOW_READY
```

‏ולא boolean יחיד של `IsReady`.

---

# ‏87. Provider Batching יכול ליצור Fake Acceleration

‏אם חמישה trades בני `200ms` מגיעים יחד:

‏Receive-time model יכול להסיק burst חריף מדי.

‏Event-time ו־receive-time צריכים להישמר שניהם.

---

# ‏88. Network Jitter יכול ליצור Fake Deceleration

‏אותו עיקרון בכיוון ההפוך.

‏הפרדה בין market dynamics לבין transport dynamics היא חובה.

---

# ‏89. Clock Drift

‏אם שני machines לא מסונכרנים:

‏הפרשי timestamps יכולים לייצר latency שלילי או ordering שגוי.

‏ל־durations מקומיים משתמשים ב־monotonic clock.

---

# ‏90. Wall Clock אינו Duration Clock

‏`DateTime.Now` אינו כלי אידיאלי למדידת latency.

‏Durations צריכים monotonic timing.

‏Wall clock נשמר לצורכי correlation/audit.

---

# ‏91. DST ו־Timezone

‏Trading calendar צריך להיות explicit.

‏לא hard-code offsets קבועים בין ישראל לארה״ב.

‏Sessions צריכים להיגזר מלוח מסחר/timezone מוסמך.

---

# ‏92. Holidays ו־Early Close

‏“יום חול” אינו בהכרח trading day רגיל.

‏Research ו־Live צריכים calendar versioned/validated.

---

# ‏93. Feed Rate Limiting

‏אם provider throttles:

‏התוצאה יכולה להיות:

- ‏delayed updates.
- ‏coalesced updates.
- ‏dropped subscriptions.

‏צריך telemetry שמפריד market inactivity מ־provider throttling.

---

# ‏94. Client-Side Throttling

‏גם הקוד שלנו יכול להפוך feed מהיר ל־feed איטי דרך:

- ‏unbounded queues.
- ‏slow logging.
- ‏blocking persistence.
- ‏expensive normalization.

---

# ‏95. Queue Age חשוב יותר מ־Queue Length בלבד

‏Queue של `100` events בני `2ms` יכולה להיות בריאה.

‏Queue של `20` events בני `800ms` יכולה להיות מסוכנת לרובוט שלנו.

---

# ‏96. Coalescing יכול להיות נכון או הרסני

‏ל־latest-state quote:

‏לפעמים אפשר לזרוק intermediate states.

‏ל־trade flow:

‏זריקת intermediate events יכולה למחוק signal.

‏Semantics קובעים את policy.

---

# ‏97. Data Drop Policy חייב להיות לפי Event Class

‏אפשר לסווג:

```text
STATE_UPDATE
TRADE_EVENT
BROKER_EVENT
AUDIT_EVENT
```

‏וכל class מקבל loss policy שונה.

---

# ‏98. Audit Data לא בהכרח זהה ל־Hot-Path Data

‏אפשר לשמור Hot Path קומפקטי ומהיר,

‏אבל Raw/Audit path צריך לשמר מספיק evidence ל־RCA.

---

# ‏99. Storage Format הוא חלק מה־Research Fidelity

‏אם storage מעגל timestamp או price:

‏ה־Replay כבר אינו נאמן למקור.

‏צריך להגדיר fidelity requirements לפי signal horizon.

---

# ‏100. Millisecond Strategy דורשת Millisecond-Capable Evidence

‏אם רוצים לחקור signal של `200ms`:

‏dataset של `1s` snapshots אינו מספיק להוכיח אותו.

‏זה לא אומר שחייבים HFT infrastructure.

‏זה אומר שרזולוציית ה־Evidence חייבת להיות מתאימה להיפותזה.

---

# ‏101. Data Age חייב להיות Feature ראשון במעלה

‏כדאי לשמור לכל candidate:

```text
lastTradeAge
bidAge
askAge
featureAge
bookAge
```

‏ולא רק price values.

---

# ‏102. Data Confidence

‏אפשר לבנות score נפרד:

```text
DataConfidence
```

‏שמשקלל:

- ‏freshness.
- ‏sequence continuity.
- ‏coverage.
- ‏source quality.
- ‏cross-source consistency.

---

# ‏103. Confidence אינו תחליף ל־Hard Gate

‏יש מצבים שבהם:

```text
GAP
UNKNOWN_STATUS
STALE_CANDIDATE
```

‏צריכים פשוט לחסום Entry.

---

# ‏104. Data Quality צריך להיכנס ל־RCA

‏כאשר Trade נכשל:

‏צריך לשאול:

```text
Was the signal wrong?
Or was the observation wrong?
```

---

# ‏105. First Divergence

‏ב־RCA ננסה למצוא את הנקודה הראשונה שבה:

```text
market reality
≠
provider view
≠
canonical state
≠
feature state
≠
decision state
```

---

# ‏106. Data Bugs יכולים להיראות כמו Alpha

‏דוגמאות:

- ‏future correction נכנסת לעבר.
- ‏stale quote יוצר spread קטן.
- ‏late trades נראים כמו momentum burst.
- ‏missing symbols משפרים rank.
- ‏unit bug מגדיל volume.

‏לכן Alpha חדש דורש Data RCA לפני התלהבות.

---

# ‏107. Data Bugs יכולים גם להסתיר Alpha

‏לא כל pipeline flaw משפר backtest.

‏חלקם מוסיפים noise ומוחקים signal אמיתי.

‏לכן “לא מצאנו edge” אינו הוכחה שה־data מספיק טוב.

---

# ‏108. Cross-Provider Experiment

‏כאשר אפשר:

‏מריצים אותו Feature על שני sources.

‏אם conclusions משתנים מאוד:

‏זה evidence שה־Feature תלוי observation semantics.

---

# ‏109. Provider-Specific Feature Risk

‏Feature שעובד רק אצל Provider אחד צריך להיבדק:

```text
Is this market alpha?
Or provider artifact?
```

---

# ‏110. Golden Raw Packets / Messages

‏כדאי לשמור fixtures של events אמיתיים:

- ‏normal.
- ‏duplicate.
- ‏gap.
- ‏correction.
- ‏halt.
- ‏auction.
- ‏unknown condition.

‏כדי parser/normalizer tests לא יהיו synthetic בלבד.

---

# ‏111. Schema Compatibility Tests

‏כל שינוי parser צריך להוכיח:

```text
old raw data still parses as expected
new fields do not silently change semantics
unknown codes remain explicit
```

---

# ‏112. Replay Hash / Determinism

‏אותו raw dataset + אותה code version צריכים לייצר אותו canonical result.

‏אם לא:

‏צריך לדעת למה.

---

# ‏113. Dataset Manifest

‏לכל experiment כדאי לשמור:

```text
data_provider
feed_type
coverage
raw_version
parser_version
schema_version
calendar_version
corporate_action_version
start/end time
known gaps
```

---

# ‏114. Known Gaps הם Metadata

‏לא מוחקים gap כאילו לא היה.

‏שומרים אותו כחלק מה־dataset evidence.

---

# ‏115. Quality-Aware Labels

‏Label של forward return יכול להיות invalid אם future path עצמו gapped.

‏לכן גם labels צריכים quality rules.

---

# ‏116. Quality-Aware Backtest

‏Backtest צריך להיות מסוגל להגיד:

```text
TRADEABLE
NOT_TRADEABLE_DATA_QUALITY
```

‏ולא להכריח fill בכל timestamp.

---

# ‏117. Data Health Dashboard

‏לפחות:

```text
message_rate
fresh_coverage
candidate_age
gap_count
duplicate_rate
late_event_rate
unknown_condition_rate
crossed_quote_rate
provider_disconnects
reconnect_count
queue_age
```

---

# ‏118. Alerting על שינוי Distribution

‏אם overnight:

- ‏duplicate rate עולה פי `10`.
- ‏unknown condition מופיע פתאום.
- ‏trade count יורד דרמטית.

‏זה יכול להיות schema/provider change לפני שזה bug ב־Strategy.

---

# ‏119. Data Quality SLO

‏אפשר להגדיר objective כגון:

```text
FreshCoverage >= required threshold
CandidateAge <= signal-specific threshold
No unresolved sequence gap before new entry
```

‏המספרים עצמם צריכים calibration אמפירי.

---

# ‏120. Data Incident הוא Production Incident

‏אם prices לא trustworthy:

‏גם אם כל process ירוק:

```text
SafeToTrade = false
```

---

# ‏121. Fast Path מול Deep Path

‏לרובוט שלנו baseline שימושי:

```text
Whole universe:
price + quote + freshness + activity

Top-N:
deeper book/flow/context
```

‏כך אפשר לשמור coverage רחב בלי להפוך כל symbol ל־L2 research project.

---

# ‏122. Candidate Promotion צריך Data Gate

‏לפני מעבר מ־Fast Path ל־Deep Path:

‏בודקים:

```text
freshness
coverage
quality
eligibility
```

---

# ‏123. Pre-Submit Data Revalidation

‏גם signal טוב יכול להתיישן בזמן ranking/execution preparation.

‏לפני order:

```text
candidate still fresh?
spread still valid?
status still tradable?
edge still positive?
```

---

# ‏124. Exit Path לא צריך להיות תלוי בכל ה־Universe

‏Position active דורש data path בעדיפות גבוהה.

‏גם אם scanner overloaded:

‏exit monitor צריך לקבל quotes/trades רלוונטיים בזמן.

---

# ‏125. Data Priority Classes

‏אפשר לחשוב על:

```text
P0 broker/order/position
P1 active position market data
P2 top candidates
P3 broad universe
P4 analytics
```

‏בעת עומס, degradation צריך לפגוע קודם ב־analytics ולא ב־risk reduction.

---

# ‏126. Data Provider != Execution Broker

‏כאשר הם נפרדים:

‏צריך להכיר divergence אפשרי בין:

```text
price used for decision
price seen by broker
price available at venue
```

---

# ‏127. Broker Snapshot אינו בהכרח Scanner Feed

‏לא נכון להניח ש־quote ב־broker UI הוא אותה observation שמשמשת את Scanner.

‏ל־RCA צריך לשמור מקור ברור לכל value.

---

# ‏128. “Real-Time” הוא מונח שצריך לפרק

‏צריך לדעת:

- ‏real-time from which source?
- ‏with what entitlement?
- ‏with what transport?
- ‏with what batching?
- ‏with what timestamp semantics?

‏לא להסתפק בתווית שיווקית.

---

# ‏129. “Full Market” גם הוא מונח שצריך לפרק

‏האם הכוונה:

- ‏כל venues?
- ‏כל trades?
- ‏כל listed equities?
- ‏quotes בלבד?
- ‏regular session בלבד?

‏צריך contract מדויק.

---

# ‏130. Data Completeness אינו Binary

‏אפשר להיות complete ב־prices וחסר ב־conditions.

‏או complete ב־trades וחסר ב־quotes.

‏לכן completeness הוא vector, לא bool.

---

# ‏131. Data Lineage

‏לכל Feature חשוב שנוכל לעקוב:

```text
Feature
→ canonical fields
→ normalized events
→ raw provider messages
```

‏בלי lineage קשה לעשות RCA אמיתי.

---

# ‏132. Evidence Preservation

‏ל־Top candidate ולכל trade כדאי לשמור packet קטן של state:

- ‏raw references.
- ‏canonical snapshot.
- ‏feature values.
- ‏quality flags.
- ‏timestamps.
- ‏provider/source.

‏זה הופך incident מסתורי לבעיה ניתנת לחקירה.

---

# ‏133. Data Retention לפי ערך

‏לא כל data חייב להישמר באותה resolution לנצח.

‏אפשר:

```text
raw high-resolution recent
compressed historical
aggregated long-term
```

‏אבל retention policy חייב לשמר את מה שנדרש ל־RCA ולמחקר.

---

# ‏134. Downsampling צריך להיות Reproducible

‏אם יוצרים `1s`, ‏`10s`, ‏`1m` bars/snapshots:

‏צריך להגדיר במדויק:

- ‏window boundaries.
- ‏timezone.
- ‏empty windows.
- ‏late events.
- ‏corrections.
- ‏aggregation rules.

---

# ‏135. Empty Window אינו Zero Return בהכרח

‏אין trade חדש יכול להיות:

```text
no observation
```

‏ולא בהכרח:

```text
confirmed unchanged price
```

‏הבחנה זו חשובה ב־activity models.

---

# ‏136. Forward Fill הוא Decision, לא Fact

‏Forward-fill של price יכול להיות שימושי.

‏אבל צריך לשמור age, אחרת stale value נראה fresh.

---

# ‏137. Interpolation על Market Prices דורשת זהירות

‏מחיר שלא נצפה בפועל אינו בהכרח tradable.

‏ל־execution research לא ממציאים quote intermediate כאילו היה קיים.

---

# ‏138. Bar OHLC מסתיר Ordering

‏אותו bar יכול להכיל:

```text
Open → High → Low → Close
```

‏או:

```text
Open → Low → High → Close
```

‏ל־short horizon זה הבדל עצום.

---

# ‏139. Seconds Bars עדיין יכולים להיות גסים מדי

‏אם target הוא מאות milliseconds:

‏צריך event/tick evidence לפחות בחלק מהמחקר.

---

# ‏140. Data Cost הוא חלק מה־Architecture

‏Feed עשיר יותר אינו אוטומטית טוב יותר.

‏צריך לשאול:

```text
Does this additional data improve decisions enough to justify cost and complexity?
```

---

# ‏141. More Data יכול להגדיל Overfitting

‏עוד fields יוצרים עוד hypotheses.

‏כל Feature חדש צריך controlled experiment.

---

# ‏142. Provider Change הוא Model Change

‏אם מחליפים data provider:

‏גם בלי לשנות Strategy code, בפועל input distribution יכול להשתנות.

‏לכן צריך validation מחדש.

---

# ‏143. Feed Upgrade הוא Experiment

‏מעבר מ־L1 ל־L2 או consolidated ל־direct צריך למדוד:

- ‏Decision Impact Rate.
- ‏Net Edge change.
- ‏Latency change.
- ‏Operational complexity.

---

# ‏144. Data Feature Retirement

‏אם field אינו מוסיף predictive/execution value:

‏ייתכן שכדאי להסיר אותו כדי להפחית complexity.

---

# ‏145. Unknown צריך להישאר Unknown

‏זה כלל שחוזר שוב ושוב.

```text
Missing != Zero
Late != Invalid
Unknown != False
Disconnected != Market Closed
```

---

# ‏146. Data Quality חייב להיות Deterministic

‏אותו stream צריך לייצר אותם quality flags ב־Replay.

‏אחרת קשה להשוות Research ל־Live.

---

# ‏147. Quality Rules הן Versioned Logic

‏גם threshold של staleness הוא חלק מה־model.

‏צריך versioning בדיוק כמו Feature/Strategy config.

---

# ‏148. RCA Codes שימושיים

‏דוגמאות:

```text
DATA_GAP
DATA_STALE
DATA_LATE
DATA_DUPLICATE_SPIKE
DATA_OUT_OF_ORDER
DATA_TORN_QUOTE
DATA_UNKNOWN_CONDITION
DATA_PROVIDER_DIVERGENCE
DATA_SCHEMA_DRIFT
DATA_UNIT_MISMATCH
DATA_BOOK_INVALID
DATA_PARTIAL_COVERAGE
DATA_RECONNECT_WARMUP
DATA_CLOCK_UNCERTAIN
```

---

# ‏149. Tests שחייבים להיות לנו

‏לפחות:

- ‏duplicate trade.
- ‏out-of-order trade.
- ‏sequence gap.
- ‏bid update בלי ask update.
- ‏stale ask.
- ‏crossed quote.
- ‏correction אחרי decision.
- ‏reconnect + snapshot.
- ‏unknown condition code.
- ‏provider switch.
- ‏unit mismatch.
- ‏session transition.
- ‏halt/resume.
- ‏late batch.
- ‏universe partial coverage.

---

# ‏150. Property Invariants

‏דוגמאות:

```text
FreshnessAge >= 0 under a valid clock model
Invalid book cannot become tradable without resync
Unknown condition cannot silently become regular
Gap state survives until explicit recovery
Provider switch changes DataGeneration
```

---

# ‏151. Golden Replay

‏כדאי לשמור מספר sessions מאתגרים:

- ‏high-volume open.
- ‏quiet period.
- ‏fast mover.
- ‏halt/resume.
- ‏provider reconnect.
- ‏data gap.

‏וכל שינוי data pipeline חייב לעבור אותם.

---

# ‏152. Shadow Comparison

‏כאשר משנים normalizer/feed:

‏מריצים ישן וחדש במקביל ומודדים:

```text
field divergence
feature divergence
rank divergence
decision divergence
```

---

# ‏153. Decision Impact Rate

‏שינוי data pipeline חשוב באמת כאשר הוא משנה:

```text
candidate
TRADE/NO TRADE
entry timing
exit timing
```

‏לא רק כאשר metric פנימי זז מעט.

---

# ‏154. Data Quality Budget לרובוט שלנו

‏ב־short-horizon system:

‏אנחנו צריכים לקשור quality ל־signal half-life.

‏לדוגמה רעיונית:

```text
allowed_data_age << signal_half_life
```

‏אבל לא מקבעים יחס מספרי בלי מחקר.

---

# ‏155. Recommendation Baseline לרובוט שלנו — כרגע כ־Hypothesis

‏בשלב זה baseline סביר למחקר הוא:

```text
Broad universe:
Last + Bid + Ask + timestamps + freshness + activity

Top candidates:
Deeper flow/book/context when available
```

‏אבל זו recommendation hypothesis שצריכה להיבדק אמפירית מול עלות, latency ו־Decision Impact Rate.

---

# ‏156. מה לא הייתי עושה כברירת מחדל

‏לא הייתי מתחיל מ:

- ‏L2 מלא לכל `4,000` symbols אם אין evidence שזה נחוץ.
- ‏עשרות providers במקביל.
- ‏complex cross-feed reconstruction לפני שיש baseline.
- ‏microsecond timestamp obsession כשה־signal חי שניות.
- ‏Feature שמסתיר source/quality semantics.

---

# ‏157. מה כן הייתי עושה מוקדם

‏כן הייתי משקיע מוקדם ב:

- ‏canonical timestamps.
- ‏source metadata.
- ‏freshness.
- ‏sequence/gap detection.
- ‏raw evidence retention.
- ‏quality flags.
- ‏replayability.
- ‏candidate revalidation.

‏אלו יסודות שקשה לתקן בדיעבד.

---

# ‏158. Practitioner Secret — Data Pipeline יכול לייצר “Strategy” שלמה בטעות

‏אם batching, stale values ו־selection bias עובדים יחד:

‏אפשר לקבל signal עקבי לכאורה שאין לו שום counterpart בשוק.

‏לכן כל Alpha חדש צריך להיבחן גם כ־possible data artifact.

---

# ‏159. Practitioner Secret — The Best Feed Is Not Always the Best System

‏Feed עשיר ומהיר יותר יכול:

- ‏להוסיף complexity.
- ‏להגדיל failure surface.
- ‏להעלות cost.
- ‏לייצר יותר noise.

‏המבחן הוא:

```text
Does it improve executable net edge?
```

---

# ‏160. Practitioner Secret — Staleness Is Relative

‏`200ms` יכול להיות:

- ‏מצוין ל־signal של `5s`.
- ‏קטסטרופלי ל־signal של `100ms`.

‏Data quality צריך להיות signal-aware.

---

# ‏161. Practitioner Secret — Feed Errors Cluster בזמן הכי גרוע

‏עומס, volatility ו־market bursts יכולים להגדיל:

- ‏latency.
- ‏gaps.
- ‏batching.
- ‏queueing.

‏בדיוק כשה־Strategy הכי רוצה לפעול.

‏לכן stress testing חשוב יותר מממוצע רגוע.

---

# ‏162. Practitioner Secret — Clean Historical Data יכול להיות “טוב מדי”

‏Live data כולל imperfections.

‏Dataset מנוקה לחלוטין יכול לגרום לנו להעריך יתר על המידה precision של signal.

---

# ‏163. Practitioner Secret — Data Correctness לפני Data Speed

‏Feed מהיר שמגיע torn/gapped יכול להיות פחות שימושי מ־feed מעט איטי יותר אך עקבי.

‏המטרה היא:

```text
fast enough
+
correct enough
+
observable enough
```

---

# ‏164. Practitioner Secret — “Same Price” אינו Same State

‏מחיר `25.10` יכול להגיע עם:

- ‏spread שונה.
- ‏depth שונה.
- ‏trade flow שונה.
- ‏freshness שונה.
- ‏venue mix שונה.

‏לכן price alone לא מתאר state מלא.

---

# ‏165. Practitioner Secret — Data Quality יכול להיות Alpha Filter

‏ייתכן ש־signal עובד רק כאשר:

```text
fresh coverage high
flow confidence high
quotes stable
```

‏כלומר quality itself יכול להיות conditioning variable.

---

# ‏166. Checklist לפני שמאמינים ל־Signal

‏שואלים:

1. ‏מה מקור כל field?
2. ‏בן כמה כל field?
3. ‏האם היה gap?
4. ‏האם ordering אמין?
5. ‏האם conditions ידועים?
6. ‏האם universe coverage מספיק?
7. ‏האם candidate עצמו fresh?
8. ‏האם quote internally consistent?
9. ‏האם provider changed/reconnected?
10. ‏האם אותה תוצאה קיימת ב־Replay point-in-time?

---

# ‏167. מה חייבים לזכור בעל־פה

‏ארבעה משפטים:

```text
Timestamp precision is not timestamp accuracy.
Missing is not zero.
Historical truth is not always live-known truth.
Fast stale data is economically slow data.
```

---

# ‏168. יישום לרובוט הקצר שלנו

‏לרובוט שמנסה למצוא מומנטום בין מילישניות לשניות:

‏Market Data צריך לענות על חמש שאלות לפני כל Entry:

```text
What happened?
When did it happen?
When did we learn it?
Can we trust this view?
Is it still fresh enough to trade?
```

‏אם אחת מהן חסרה:

```text
NO TRADE
```

‏היא תוצאה מקצועית לגיטימית.

---

# ‏169. מסקנת הפרק

‏Market Data מקצועי אינו אוסף prices.

‏הוא מערכת Evidence.

‏ה־Strategy שלנו תלויה לא רק במה שהמספר אומר, אלא גם:

```text
where it came from
when it was true
when we received it
whether anything was missing
whether it was later corrected
whether it is still relevant now
```

‏לכן Data Quality, Freshness, Ordering ו־Provenance הם חלק מה־Trading Model עצמו.

---

# ‏170. מעבר לשלב הבא

‏השלב הבא הוא `60 — Scanner and Ranking Subtleties`.

‏שם נרד לעומק של:

- ‏cross-sectional bias.
- ‏rank churn.
- ‏winner instability.
- ‏top-K construction.
- ‏tie-breaking.
- ‏score compression.
- ‏candidate persistence.
- ‏stale winners.
- ‏ranking artifacts.
- ‏השאלה מתי `Rank #1` הוא באמת המניה הטובה ביותר לפעולה ולא רק המספר הגבוה ביותר בטבלה.
