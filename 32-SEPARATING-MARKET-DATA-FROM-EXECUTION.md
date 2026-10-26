# ‏שלב 32 — הפרדה מלאה בין `Market Data` ל־`Execution`

> ‏מטרת הפרק: לבנות מערכת שבה ספק נתוני השוק והברוקר המבצע הם שני רכיבים בלתי־תלויים. ה־Scanner יכול לקבל נתונים מספק A, בעוד הפקודה נשלחת לברוקר B — בלי שה־Strategy תהיה תלויה באחד מהם ובלי להסתיר פערי מחיר, זמן או זהות מכשיר.
>
> ‏העיקרון המרכזי: **`Market Data` אומר לנו מה אנחנו חושבים שקורה בשוק; `Execution Broker` אומר לנו מה באמת קרה לפקודות ולפוזיציות שלנו. אסור לערבב בין שתי האמיתות האלה.**

---

# ‏1. למה בכלל להפריד?

‏מערכת פשוטה מתחילה לעיתים כך:

```text
Broker API
  ├─ market data
  └─ orders
```

‏זה נוח, אבל יוצר coupling.

‏אם בהמשך מתברר שהברוקר מצוין לביצוע אך מוגבל בסריקת אלפי מניות, כל ה־Strategy כבר תלויה בו.

‏הפרדה נכונה נראית כך:

```text
MarketDataProvider
        ↓
Canonical Market Events
        ↓
Scanner / Feature Engine / Ranking
        ↓
Trade Decision
        ↓
Risk Engine
        ↓
Execution Engine
        ↓
ExecutionBroker
```

---

# ‏2. שני חוזים שונים

‏ה־`MarketDataProvider` צריך לענות על שאלות כמו:

- ‏מה ה־`Bid`?
- ‏מה ה־`Ask`?
- ‏מה ה־`Last`?
- ‏מתי הגיע האירוע?
- ‏מה מקורו?
- ‏האם הוא טרי?

‏ה־`ExecutionBroker` צריך לענות על שאלות שונות:

- ‏האם Order התקבל?
- ‏האם הוא עובד?
- ‏האם התמלא?
- ‏באיזה מחיר?
- ‏באיזו כמות?
- ‏מה הפוזיציה האמיתית כרגע?

---

# ‏3. כלל ברזל

‏אסור להניח:

```text
MarketDataPrice == ExecutableBrokerPrice
```

‏גם אם בדרך כלל הם קרובים.

‏ייתכנו פערים בגלל:

- ‏Latency.
- ‏Feed coverage שונה.
- ‏Venue coverage שונה.
- ‏Aggregation rules שונים.
- ‏Timestamps שונים.
- ‏Clock skew.
- ‏Delayed/stale data.
- ‏Quote update שהגיע לספק אחד לפני השני.

---

# ‏4. `Canonical Market Event`

‏כל Provider צריך להיות מתורגם למבנה פנימי אחיד.

```text
CanonicalMarketEvent
- instrument_id
- symbol
- event_type
- bid
- ask
- last
- bid_size
- ask_size
- trade_size
- event_time
- received_time
- provider
- venue
- sequence
- quality_flags
```

‏ה־Strategy עובדת מול המבנה הזה — לא מול DTO של ספק מסוים.

---

# ‏5. `Canonical Instrument ID`

‏`AAPL` אינו מזהה מספיק טוב כמפתח פנימי יחיד.

‏צריך זהות פנימית יציבה, למשל:

```text
instrument_id = internal canonical id
```

‏ומולה mappings:

```text
MarketDataProvider A → provider symbol/id
ExecutionBroker B     → broker contract/id
```

---

# ‏6. למה Symbol Mapping קשה יותר ממה שנראה

‏יש מקרים של:

- ‏Class shares.
- ‏Ticker changes.
- ‏Delist/relist.
- ‏Corporate actions.
- ‏Same ticker on multiple venues.
- ‏Different contract identifiers.
- ‏Primary exchange requirements.
- ‏Currency differences.

‏לכן mapping צריך להיות entity מפורש ולא `string.Replace()`.

---

# ‏7. `Instrument Master`

‏כדאי להחזיק שכבת `Instrument Master` מרכזית.

‏היא יכולה לכלול:

```text
internal_id
symbol
asset_type
currency
primary_exchange
market_data_provider_id
broker_contract_id
valid_from
valid_to
status
```

---

# ‏8. Mapping הוא Point-in-Time

‏גם mapping משתנה בזמן.

‏Ticker שהיה נכון היום אינו בהכרח הטיקר שהיה קיים לפני שנה.

‏לכן למחקר היסטורי נדרש mapping בעל `valid_from` ו־`valid_to`.

---

# ‏9. `Provider Timestamp`

‏לכל Event צריך לשמור לפחות שני זמנים:

```text
Event Time
Received Time
```

‏הראשון אומר מתי האירוע התרחש לפי מקור הנתונים.

‏השני אומר מתי המערכת שלנו ראתה אותו.

---

# ‏10. למה שני הזמנים חשובים

‏נניח:

```text
Market event time = 10:00:00.100
Received time     = 10:00:00.180
```

‏ל־Scanner בזמן אמת הייתה Latency של 80ms לפחות.

‏אסור ל־Backtest להתנהג כאילו ידענו על האירוע ב־100ms.

---

# ‏11. `Broker Timestamp`

‏גם בצד הברוקר יש כמה זמנים:

```text
intent_created_at
order_submitted_at
broker_ack_at
fill_at
```

‏אלה אינם אותם timestamps של ספק הנתונים.

---

# ‏12. Clock Domains

‏במערכת יש כמה שעונים:

```text
Market data source clock
Local machine clock
Broker/API clock
Exchange/venue timestamps
Replay virtual clock
```

‏צריך לדעת מאיזה clock הגיע כל timestamp.

---

# ‏13. `Clock Skew`

‏אם שעון המכונה מפגר ב־150ms, ניתוח Latency יכול להפוך לחסר משמעות.

‏לכן מודדים ומנטרים clock synchronization.

---

# ‏14. לא מתקנים Clock Skew בצורה עיוורת

‏אסור פשוט “להזיז timestamps” עד שהם נראים הגיוניים.

‏צריך לשמור:

- ‏Raw timestamp.
- ‏Corrected/normalized timestamp אם יש.
- ‏ה־offset שנמדד.
- ‏מקור האומדן.

---

# ‏15. `Freshness`

‏לכל Snapshot צריך להיות גיל.

```text
age = now - received_time
```

‏אבל גם `event_time` חשוב.

---

# ‏16. Fresh לפי Received Time אינו תמיד Fresh בשוק

‏Provider יכול לשלוח עכשיו נתון שכבר בן שנייה.

‏לכן רצוי לעקוב אחר:

```text
transport_age
source_age
```

---

# ‏17. `Data Quality Flags`

‏אירוע יכול לקבל Flags כמו:

```text
STALE
GAP_DETECTED
OUT_OF_ORDER
DUPLICATE
CROSSED_MARKET
LOCKED_MARKET
MISSING_BID
MISSING_ASK
UNKNOWN_INSTRUMENT
```

---

# ‏18. Strategy לא צריכה לנחש Data Quality

‏במקום שכל Feature יחליט לבד אם quote תקין, שכבת Market Data צריכה לפרסם Quality אחיד.

---

# ‏19. `Data Health` מול `Broker Health`

‏אלה שני health states שונים.

```text
market_data_health
broker_health
```

‏יכול להיות:

```text
Data = HEALTHY
Broker = DEGRADED
```

‏או להפך.

---

# ‏20. ארבעה מצבים חשובים

```text
Data OK / Broker OK
Data OK / Broker Bad
Data Bad / Broker OK
Data Bad / Broker Bad
```

‏המערכת צריכה policy מפורש לכל מצב.

---

# ‏21. `NO TRADE` כשאין Data אמין

‏אם אין נתוני שוק טריים ואמינים, כניסה חדשה צריכה בדרך כלל להיחסם.

‏זה אינו אומר אוטומטית מה לעשות עם פוזיציה קיימת — זו החלטת Risk נפרדת.

---

# ‏22. Existing Position הוא מקרה שונה

‏כאשר כבר קיימת פוזיציה, `Data Bad` אינו מאפשר להתעלם מהמצב.

‏Risk Engine צריך policy ייעודי.

---

# ‏23. `Broker-Side Validation`

‏לפני Order אפשר לבצע validation מול נתונים זמינים מהברוקר, אם קיימים.

‏המטרה אינה להפעיל Scanner מחדש.

‏המטרה היא לבדוק שהשוק אצל הברוקר לא סטה בצורה קיצונית מאז החלטת ה־Scanner.

---

# ‏24. Broad Feed מול Execution Check

‏ארכיטקטורה שימושית:

```text
Broad Market Data Provider
        ↓
Scan thousands of symbols
        ↓
Top Candidate
        ↓
Broker-side / execution-side validation
        ↓
Order
```

---

# ‏25. למה לא להשתמש ב־Broker Validation על כל ה־Universe

‏אם לברוקר יש מגבלות subscriptions או request pacing, אין צורך לבזבז אותן על אלפי מניות.

‏אפשר להשתמש בו רק על Top-N מועמדים.

---

# ‏26. `Cross-Provider Price Divergence`

‏נגדיר:

```text
divergence = abs(provider_price - broker_price)
```

‏אבל חשוב לבחור איזה price משווים.

---

# ‏27. השוואה נכונה היא Side-Aware

‏לכניסה Long:

‏רלוונטי במיוחד ה־Ask שניתן לקנות ממנו.

‏ליציאה Long:

‏רלוונטי במיוחד ה־Bid שניתן למכור אליו.

---

# ‏28. `Last` מול `Ask` אינו Divergence תקין

‏אם Provider מספק `Last` והברוקר מציג `Ask`, ההפרש ביניהם אינו בהכרח Data disagreement.

‏אלה שדות בעלי משמעות שונה.

---

# ‏29. Compare Like With Like

‏השוואה נכונה דורשת:

```text
same instrument
same side
same field
similar timestamp
compatible session
```

---

# ‏30. `Divergence Threshold`

‏Threshold קבוע של X cents הוא בדרך כלל חלש.

‏עדיף לשקול יחס ל־:

- ‏מחיר.
- ‏Spread.
- ‏Tick size.
- ‏Volatility.
- ‏Age difference.

---

# ‏31. Divergence הוא גם Signal תפעולי

‏פער גדול בין ספקים יכול להעיד על:

- ‏Feed stale.
- ‏Mapping שגוי.
- ‏Clock issue.
- ‏Coverage שונה.
- ‏Fast market.
- ‏Provider degradation.

---

# ‏32. אבל Divergence אינו תמיד Bug

‏שני Feeds יכולים להיות תקינים ועדיין לראות שוק שונה מעט בגלל scope שונה.

---

# ‏33. `Consolidated` מול `Venue-Specific`

‏אם Provider A הוא consolidated ו־Provider B venue-specific, אין לצפות לשוויון מלא.

‏צריך להבין מה כל Feed מייצג.

---

# ‏34. `NBBO` אינו כל Order Book

‏גם אם שני ספקים מסכימים על NBBO, עומק הספר יכול להיות שונה.

---

# ‏35. Strategy Contract

‏ה־Strategy צריכה לבקש capabilities ולא provider names.

‏לדוגמה:

```text
Need:
- trade updates
- bid/ask
- freshness < threshold
- regular session
```

‏ולא:

```text
Need: ProviderXQuote
```

---

# ‏36. `Capability Contract`

‏Provider יכול לפרסם:

```text
supports_trades
supports_nbbo
supports_depth
supports_historical_ticks
supports_extended_hours
supports_sequence_numbers
supports_exchange_timestamps
```

---

# ‏37. Capability Validation בזמן Startup

‏ב־startup בודקים שה־environment הנוכחי באמת תומך בדרישות האסטרטגיה.

---

# ‏38. Fail Fast על Capability חסר

‏אם Strategy דורשת `Bid/Ask` וה־Provider מספק רק `Last`, אסור להמשיך כאילו הכול תקין.

---

# ‏39. `MarketDataProvider` Interface

‏ממשק רעיוני:

```text
Subscribe(universe)
Unsubscribe(symbols)
GetSnapshot(symbol)
GetHealth()
GetCapabilities()
```

---

# ‏40. `ExecutionBroker` Interface

‏ממשק רעיוני:

```text
Submit(orderIntent)
Cancel(orderId)
Replace(orderId, changes)
GetOpenOrders()
GetPositions()
GetExecutions()
GetHealth()
GetCapabilities()
```

---

# ‏41. `Execution Engine` אינו Broker Adapter

‏`Execution Engine` מחליט איך לבצע.

‏`Broker Adapter` יודע לדבר בפרוטוקול של הברוקר.

---

# ‏42. `Market Data Adapter` אינו Feature Engine

‏Adapter מתרגם data.

‏Feature Engine מחשב features.

‏הפרדה זו קריטית ל־Replay ולבדיקות.

---

# ‏43. Canonical Schema אחד

‏אם Live, Replay ו־Historical משתמשים באותו schema, קל יותר להשוות ביניהם.

---

# ‏44. `Source` חייב להישמר

‏גם אחרי normalization אסור לאבד את מקור הנתון.

```text
source_provider
source_feed
source_venue
```

---

# ‏45. למה Source Metadata חשוב

‏אם פתאום ביצועים נפגעו רק כאשר Feed מסוים שימש, אפשר לזהות זאת.

---

# ‏46. `Lineage`

‏כל Decision חשוב צריך להיות ניתן לקישור ל־market events שהובילו אליו.

---

# ‏47. `Decision Snapshot`

‏לפני Order נשמור:

```text
symbol
rank
score
provider_bid
provider_ask
provider_event_age
broker_bid_if_available
broker_ask_if_available
cross_provider_divergence
risk_state
```

---

# ‏48. Snapshot לפני Submit

‏ה־Snapshot הזה הוא Evidence חשוב ל־RCA.

---

# ‏49. `Broker Quote` הוא Validation Input, לא Truth מוחלט

‏גם הברוקר יכול לקבל Feed שונה.

‏לכן “הברוקר שונה” אינו בהכרח אומר שה־Provider שגוי.

---

# ‏50. Broker Truth מוגבל ל־Execution State

‏הברוקר הוא authoritative לגבי:

```text
orders
fills
positions
```

‏לא בהכרח לגבי “מחיר השוק האמיתי היחיד”.

---

# ‏51. `Order Price Budget`

‏Decision יכול לייצר:

```text
max_acceptable_entry_price
```

‏Execution Engine לא חייב להשתמש בדיוק במחיר Provider.

---

# ‏52. Price Budget מחבר Signal ל־Execution

‏אם השוק אצל הברוקר כבר חרג מה־budget, אפשר לוותר על העסקה.

---

# ‏53. `Signal TTL`

‏לכל Signal קצר צריך להיות זמן חיים.

‏אם validation מול הברוקר לוקח זמן רב מדי, ייתכן שה־Signal כבר פג.

---

# ‏54. `Age Budget`

‏אפשר לפרק:

```text
market_data_age
feature_compute_age
decision_age
broker_validation_age
```

---

# ‏55. End-to-End Decision Age

```text
now - latest_relevant_market_event_time
```

‏זה מדד חשוב במיוחד במסחר של שניות.

---

# ‏56. `Freshness Budget`

‏במקום threshold יחיד, אפשר להגדיר budget לכל שכבה.

---

# ‏57. Data Provider Failover

‏אם Primary Feed נופל, Secondary Feed יכול להיכנס.

‏אבל failover אינו רק switch טכני.

---

# ‏58. Failover משנה Semantics

‏Secondary יכול להיות:

- ‏פחות consolidated.
- ‏איטי יותר.
- ‏ללא Depth.
- ‏בעל timestamps שונים.

‏לכן צריך לדעת שה־Strategy עדיין תקפה תחת capabilities החדשות.

---

# ‏59. `Capability Degradation`

‏Health יכול להיות:

```text
FULL
DEGRADED
MINIMAL
UNUSABLE
```

---

# ‏60. Policy לפי Degradation

‏לדוגמה רעיונית:

```text
FULL      → normal operation
DEGRADED  → reduced universe / stricter filters
MINIMAL   → exits only or no new trades
UNUSABLE  → fail closed
```

‏ה־policy המדויק צריך להיבדק אמפירית ולהיות חלק מ־Risk Governance.

---

# ‏61. Failover דורש Warm State

‏אם Secondary מתחיל רק בעת תקלה, ייתכן שאין לו history מספיק לחישוב features.

---

# ‏62. `Warm Standby`

‏אפשר להזרים Secondary במצב shadow כדי לשמור state מוכן.

---

# ‏63. עלות Warm Standby

‏הוא צורך:

- ‏Bandwidth.
- ‏API capacity.
- ‏Storage.
- ‏Licensing.
- ‏Compute.

---

# ‏64. `Dual Feed Comparison`

‏ב־Shadow אפשר להשוות Feed A מול Feed B לאורך זמן.

---

# ‏65. Metrics ל־Dual Feed

```text
quote_divergence
trade_count_divergence
missing_event_rate
freshness_difference
rank_difference
winner_difference
```

---

# ‏66. החשוב ביותר: Decision Divergence

‏לא כל הבדל Tick חשוב.

‏השאלה החשובה יותר:

> ‏האם ההבדל בין הספקים שינה Decision?

---

# ‏67. `Decision Impact Rate`

```text
number of decisions changed by provider difference
--------------------------------------------------
number of comparable decisions
```

---

# ‏68. `Rank Impact`

‏אם Feed אחר משנה רק Rank #300, אולי אין לכך חשיבות.

‏אם הוא משנה Rank #1 ו־#2 — זו השפעה מהותית.

---

# ‏69. Full-Market Scanner רגיש במיוחד

‏כאשר משווים אלפי מניות, אפילו פערים קטנים יכולים לשנות מי במקום הראשון.

---

# ‏70. `Cross-Sectional Consistency`

‏צריך לבדוק שה־Provider נותן freshness דומה לכל ה־Universe.

---

# ‏71. Coverage Bias

‏אם 500 מניות מתעדכנות מהר יותר מהאחרות, Ranking עלול להעדיף אותן מסיבה טכנית.

---

# ‏72. `Freshness as Feature` מול `Freshness as Gate`

‏במקרים מסוימים freshness יכול להיות feature.

‏אבל data גרוע מדי צריך להיות gate — לא רק penalty קטן ב־Score.

---

# ‏73. Missing Symbols

‏Symbol שלא קיבל update אינו בהכרח “לא זז”.

‏יכול להיות שה־feed חסר.

---

# ‏74. `Silence != Zero`

‏זה כלל חשוב מאוד.

‏היעדר event אינו שווה לשינוי של 0%.

---

# ‏75. Heartbeats ו־Expected Activity

‏Provider Adapter צריך לדעת לזהות silence חריג.

---

# ‏76. Sequence Gaps

‏אם Feed מספק sequence numbers, gap צריך להפוך ל־quality event.

---

# ‏77. Recovery אחרי Gap

‏אפשרויות תלויות ספק:

- ‏Snapshot refresh.
- ‏Resubscribe.
- ‏Backfill.
- ‏Mark state unreliable.

---

# ‏78. אסור להמשיך עם State לא אמין בלי סימון

‏Feature Engine צריך לדעת שהיסטוריה מסוימת נשברה.

---

# ‏79. `State Rebuild`

‏לאחר reconnect אפשר לבנות מחדש rolling features מתוך history מספיק.

---

# ‏80. Rebuild Window

‏אם feature הארוך ביותר הוא 10 דקות, אי אפשר להכריז על state מלא אחרי שתי שניות של data.

---

# ‏81. `Warm-Up State`

```text
COLD
WARMING
READY
DEGRADED
```

---

# ‏82. Ranking בזמן Warm-Up

‏מניה שעדיין לא צברה history מספק לא צריכה לקבל features מזויפים.

---

# ‏83. Broker Reconnect אינו Data Reconnect

‏שני החיבורים יכולים ליפול בנפרד.

---

# ‏84. Recovery Ordering

‏לאחר restart סדר בטוח רעיונית הוא:

```text
restore local state
connect broker
reconcile orders/positions
connect market data
warm market state
validate health
allow new decisions
```

---

# ‏85. Existing Positions מקבלות עדיפות

‏Recovery של פוזיציות קיימות קודם לפתיחת עסקאות חדשות.

---

# ‏86. `Execution Price Source`

‏PnL בפועל צריך להשתמש ב־fills מהברוקר.

‏לא במחיר ה־Provider בזמן ההחלטה.

---

# ‏87. `Reference Price Source`

‏ל־slippage analysis כן צריך לשמור reference price מה־Provider.

---

# ‏88. לכן צריכים שני מחירים לפחות

```text
reference_price
fill_price
```

---

# ‏89. ולעיתים גם Broker Reference

```text
provider_reference
broker_reference
fill_price
```

---

# ‏90. `Implementation Shortfall`

‏הפרדה זו מאפשרת למדוד כמה Edge אבד בין Decision ל־Fill.

---

# ‏91. Attribution

‏אפשר לפרק:

```text
signal move
provider→broker divergence
latency
slippage
fees
exit execution
```

---

# ‏92. Provider אינו אשם אוטומטית ב־Slippage

‏צריך להבדיל בין Data discrepancy לבין movement שקרה בזמן שהפקודה נשלחה.

---

# ‏93. First Divergence Analysis

‏ב־RCA נשאל:

1. ‏מתי Provider ו־Broker התחילו להציג תמונה שונה?
2. ‏האם ההבדל היה לפני Decision?
3. ‏אחרי Decision?
4. ‏אחרי Submit?
5. ‏רק בזמן Fill?

---

# ‏94. `Cross-Provider Timeline`

‏נשמור timeline משותף:

```text
provider quote
scanner decision
broker quote
order submit
ack
fill
```

---

# ‏95. Replay צריך להכיל Provider Identity

‏אחרת אי אפשר לבדוק האם אותה אסטרטגיה הייתה מתנהגת אחרת עם Feed אחר.

---

# ‏96. Historical Provider Swap

‏אם יש datasets מקבילים, אפשר להריץ:

```text
same strategy
same day
provider A dataset
provider B dataset
```

---

# ‏97. אבל Dataset Semantics צריכים להיות מתואמים

‏אסור להשוות בלי להבין:

- ‏session coverage.
- ‏venues.
- ‏timestamps.
- ‏trade conditions.
- ‏corrections/cancels.

---

# ‏98. `Normalized Data` אינו בהכרח Equivalent Data

‏שני Feeds יכולים להיכנס לאותו schema ועדיין לייצג מידע שונה.

---

# ‏99. Provider-Specific Metadata

‏אפשר לשמור extension metadata מחוץ ל־core schema.

---

# ‏100. Core Strategy לא תשתמש ב־Extension ישירות

‏אם היא זקוקה ליכולת כזו, עדיף להגדיר Feature/Capability פורמלי.

---

# ‏101. `Provider Lock-In`

‏Lock-in קורה כאשר:

- ‏DTOs של הספק זולגים ל־Strategy.
- ‏IDs שלו נשמרים כמפתח פנימי.
- ‏ה־Backtest משתמש בפורמט שלו בלבד.
- ‏Health logic מפוזר בקוד.

---

# ‏102. איך מונעים Lock-In

‏באמצעות:

```text
canonical schemas
interfaces
capabilities
instrument master
contract tests
provider adapters
```

---

# ‏103. `Anti-Corruption Layer`

‏במונחי DDD, Adapter הוא `Anti-Corruption Layer` בין המודל שלנו למודל של הספק.

---

# ‏104. Provider SDK אינו Domain Model

‏ספריית SDK היא dependency טכנית.

‏אסור שהיא תגדיר את השפה העסקית של המערכת.

---

# ‏105. Testing Strategy

‏לכל Market Data Adapter צריך Contract Tests.

---

# ‏106. דוגמאות Contract Tests

- ‏Bid לעולם אינו נשמר בשדה Ask.
- ‏timestamp אינו מאבד precision.
- ‏symbol mapping חד־משמעי.
- ‏duplicate handling עקבי.
- ‏disconnect מפיק health event.
- ‏reconnect אינו משכפל subscriptions ללא שליטה.

---

# ‏107. Broker Adapter Contract Tests

- ‏Submit map תקין.
- ‏Ack map תקין.
- ‏Partial Fill מצטבר נכון.
- ‏Cancel/Fill race נשמר.
- ‏reconciliation משווה state מלא.

---

# ‏108. Integration Contract

‏בנוסף נדרשת בדיקה בין Data ל־Execution:

```text
candidate instrument
→ broker contract resolution
→ quote validation
→ order construction
```

---

# ‏109. `Unknown Instrument` חייב לעצור

‏אם אין mapping ודאי לברוקר, אין לנחש contract.

---

# ‏110. Wrong Instrument הוא Failure חמור

‏זו תקלה תפעולית חמורה יותר מ־missed trade.

---

# ‏111. `Primary Exchange` ו־Contract Ambiguity

‏כאשר ברוקר דורש פרטים נוספים לזיהוי instrument, הם צריכים להגיע מ־Instrument Master.

---

# ‏112. `Session Alignment`

‏Provider וברוקר צריכים להסכים על איזה session אנחנו סוחרים.

---

# ‏113. Extended Hours

‏אם Provider מכסה extended hours אבל Order policy לא מאפשר אותה Session, Strategy חייבת לדעת זאת דרך session capability.

---

# ‏114. Session Policy היא Domain Rule

‏לא קוד חבוי ב־Broker Adapter.

---

# ‏115. `Market Calendar`

‏יש לשתף calendar canonical אחד בין Data, Strategy ו־Execution.

---

# ‏116. Calendar mismatch

‏אם ספק חושב שהשוק פעיל אבל broker session סגור, צריך להיכשל בצורה מוסברת.

---

# ‏117. `Trading State`

‏Instrument יכול להיות:

```text
TRADABLE
HALTED
CLOSED
RESTRICTED
UNKNOWN
```

---

# ‏118. Provider State מול Broker State

‏גם כאן יכולים להיות שני מקורות.

‏ה־Risk/Execution policy צריך להכריע בצורה שמרנית במקרה של conflict.

---

# ‏119. `Conflict Policy`

‏Conflict צריך להיות event מפורש.

‏לא `if` קטן שאף אחד לא רואה.

---

# ‏120. Decision Reason Codes

‏למשל:

```text
NO_TRADE_DATA_STALE
NO_TRADE_PROVIDER_BROKER_DIVERGENCE
NO_TRADE_INSTRUMENT_MAPPING_FAILED
NO_TRADE_BROKER_NOT_READY
NO_TRADE_SESSION_MISMATCH
```

---

# ‏121. Reason Codes הם Gold ל־RCA

‏אחר כך אפשר למדוד כמה עסקאות נחסמו מכל סיבה.

---

# ‏122. False Safety

‏אם threshold שמרני מדי חוסם עסקאות רבות, גם זו עלות.

---

# ‏123. `Blocked Opportunity Cost`

‏צריך למדוד מה קרה למועמדים שנחסמו בגלל divergence/freshness.

---

# ‏124. זה מאפשר לכייל Gates

‏לא לפי תחושה, אלא לפי trade-off בין safety ל־missed edge.

---

# ‏125. `Data Cost` ו־`Execution Cost` נפרדים

‏עלות ספק הנתונים היא fixed/operational cost.

‏עלות הביצוע היא transaction-dependent.

---

# ‏126. לא לערבב Cost Models

‏שתי העלויות חשובות, אבל הן משפיעות אחרת על economics.

---

# ‏127. `Provider Benchmark`

‏לפני בחירה נמדוד:

```text
coverage
freshness
latency
message rate
missing rate
reconnect behavior
historical/live parity
cost
licensing
```

---

# ‏128. `Broker Benchmark`

‏בנפרד נמדוד:

```text
submit latency
ack latency
fill behavior
cancel latency
reject behavior
recovery
fees
order capabilities
```

---

# ‏129. Selection Matrix נפרדת

‏Provider טוב אינו בהכרח Broker טוב.

‏Broker טוב אינו בהכרח Provider טוב.

---

# ‏130. Architecture מאפשרת Best-of-Breed

‏אפשר לבחור כל רכיב לפי תפקידו.

---

# ‏131. אבל Best-of-Breed מוסיף מורכבות

‏צריך לשלם ב:

- ‏mapping.
- ‏clock reconciliation.
- ‏cross-provider diagnostics.
- ‏licensing.
- ‏more failure modes.

---

# ‏132. לכן לא מפרידים “כי זה מגניב”

‏מפרידים כי הדרישות מצדיקות זאת.

---

# ‏133. `KISS` Baseline

‏אם Broker Feed מספיק ל־POC, אפשר להתחיל בו.

‏אבל הארכיטקטורה עדיין צריכה לאפשר החלפה מאוחר יותר.

---

# ‏134. `One Interface, One Adapter` בתחילת הדרך

‏זו דרך טובה למנוע over-engineering.

---

# ‏135. אחר כך מוסיפים Provider שני

‏רק כאשר יש צורך מוכח.

---

# ‏136. Baseline לרובוט שלנו

‏Baseline מחקרי סביר:

```text
External broad-market provider
        ↓
Whole-market scanner
        ↓
Top-N shortlist
        ↓
Freshness + quality gate
        ↓
Broker-side contract/market validation
        ↓
Risk Engine
        ↓
Execution Engine
        ↓
IBKR or another broker
```

---

# ‏137. למה Top-N ולא רק Top-1

‏אפשר לבדוק כמה מועמדים מובילים מול הברוקר לפני בחירה סופית.

---

# ‏138. `Late Validation` יכול לשנות Winner

‏אם #1 כבר התדרדר ו־#2 עדיין תקין, אפשר למדוד האם fallback כזה מוסיף ערך.

---

# ‏139. אבל זה כבר שינוי Strategy

‏לכן צריך Backtest/Replay/Shadow נפרד.

---

# ‏140. `Broker Validation` אינו Shortcut למחקר

‏לא מכניסים fallback חדש ל־Live רק כי הוא נשמע הגיוני.

---

# ‏141. Feed Rotation

‏אם Primary Provider משתנה, יש להתייחס לכך כ־strategy-environment change.

---

# ‏142. Version Everything

‏נשמור:

```text
provider_name
feed_name
provider_adapter_version
schema_version
broker_name
broker_adapter_version
instrument_master_version
```

---

# ‏143. `Run Manifest`

‏כל Replay/Shadow/Live run צריך לכלול את הגרסאות האלה.

---

# ‏144. Reproducibility

‏אחרת אי אפשר לדעת אם שינוי תוצאה הגיע מ־Strategy או מ־Data Provider.

---

# ‏145. Provider Change הוא Experiment

‏החלפת Feed צריכה לעבור:

```text
benchmark
replay
shadow
comparison
promotion
```

---

# ‏146. Broker Change הוא Experiment אחר

‏לא משנים Provider ו־Broker באותו ניסוי אם אפשר להימנע מכך.

---

# ‏147. `First Divergence` בין גרסאות

‏כאשר תוצאה משתנה, מחפשים את האירוע הראשון שבו state השתנה.

---

# ‏148. Observability בסיסי

‏Dashboard צריך להציג לפחות:

```text
provider health
provider freshness
coverage
broker health
broker connectivity
open orders
positions
cross-provider divergence
blocked decisions
```

---

# ‏149. Metrics לפי Symbol בלבד אינם מספיקים

‏צריך גם cross-sectional metrics לכל ה־Universe.

---

# ‏150. `Fresh Coverage Ratio`

```text
symbols with fresh valid data
-----------------------------
eligible universe size
```

---

# ‏151. Coverage Gate

‏אם היחס יורד מתחת לרמה שנבדקה, דירוג כל השוק עלול להיות מוטה.

---

# ‏152. Top-1 Confidence תלוי Coverage

‏Rank #1 מתוך 4,000 symbols אינו אותו דבר כמו Rank #1 מתוך 900 symbols שקיבלו update.

---

# ‏153. `Universe Completeness` הוא Feature מערכת

‏לא Feature של מניה.

---

# ‏154. System-level Features

‏לדוגמה:

```text
fresh_coverage_ratio
provider_lag_p95
provider_error_rate
broker_quote_divergence_p95
```

---

# ‏155. Strategy יכולה להשתמש ב־System Context בזהירות

‏למשל לחסום Trade כאשר איכות השוק הנצפה ירדה.

---

# ‏156. Failover Testing

‏צריך לבדוק Replay/Fault Scenarios של:

- ‏Primary disconnect.
- ‏Secondary takeover.
- ‏Primary recovery.
- ‏split-brain feeds.
- ‏mapping mismatch.
- ‏clock drift.

---

# ‏157. `Split Brain`

‏מצב שבו שני Feeds פעילים אך מספרים סיפורים שונים מאוד.

---

# ‏158. אין לבחור Feed לפי “מי מהיר יותר עכשיו” בלי policy

‏זה יכול לגרום flapping.

---

# ‏159. Hysteresis ל־Provider Failover

‏כמו Regime switching, גם failover צריך stability rules.

---

# ‏160. Manual Override

‏Operations צריכה יכולת להעביר:

```text
PRIMARY_A
PRIMARY_B
NO_NEW_TRADES
```

‏באופן מבוקר ומתועד.

---

# ‏161. Audit Trail

‏כל provider switch צריך להירשם עם:

```text
when
why
from
to
who/what triggered it
```

---

# ‏162. `Provider Quarantine`

‏אם ספק מציג anomalies חוזרים, אפשר להוציאו זמנית מהחלטות.

---

# ‏163. Quarantine אינה Delete

‏עדיין אפשר להמשיך להקליט אותו לצורכי RCA.

---

# ‏164. Multi-Provider Consensus

‏מערכות מתקדמות יכולות להשתמש ביותר מספק אחד בו־זמנית.

---

# ‏165. אבל Consensus אינו חובה

‏הוא מעלה משמעותית מורכבות ועלות.

---

# ‏166. מתי Consensus עשוי להיות שימושי

‏בעיקר כאשר Data integrity קריטית והפערים עצמם מספקים מידע תפעולי.

---

# ‏167. לא להפוך Data Architecture ל־Alpha בלי מחקר

‏פער בין Providers אינו אוטומטית signal מסחרי.

---

# ‏168. `Provider Drift`

‏גם ללא outage, איכות provider יכולה להשתנות עם הזמן.

---

# ‏169. Metrics ל־Provider Drift

- ‏Latency percentiles.
- ‏Missing event rate.
- ‏Coverage.
- ‏Cross-provider divergence.
- ‏Decision impact rate.

---

# ‏170. `Broker Drift`

‏גם execution quality יכולה להשתנות.

---

# ‏171. End-to-End Drift

‏המטרה היא לזהות איפה נעלם Edge:

```text
prediction
→ data
→ decision
→ broker path
→ fill
```

---

# ‏172. `Data-to-Decision Latency`

‏מודד מהגעת data עד Decision.

---

# ‏173. `Decision-to-Broker Latency`

‏מודד מהחלטה עד submit.

---

# ‏174. `Broker-to-Fill Latency`

‏מודד מה־submit/ack עד Fill.

---

# ‏175. End-to-End Latency

‏רק סכום כל החלקים מספר את הסיפור המלא.

---

# ‏176. `Latency Budget`

‏לכל רכיב אפשר להקצות budget.

---

# ‏177. Budget Violation

‏חריגה חוזרת צריכה להיות observable event.

---

# ‏178. לא כל חריגה מחייבת עצירה

‏Policy תלויה באסטרטגיה וברמת הסיכון.

---

# ‏179. אבל Short-Horizon Strategy רגישה במיוחד

‏כאשר horizon הוא 10–60 שניות, שנייה יכולה להיות חלק גדול מחיי ה־Signal.

---

# ‏180. `Signal Half-Life`

‏אם ה־Signal מתדרדר מהר, גם Provider latency קטן יחסית עשוי להיות מהותי.

---

# ‏181. Data Provider Evaluation צריך להיות Strategy-Aware

‏“מהיר” אינו מדד אבסולוטי.

‏השאלה היא מהיר מספיק ל־Signal שלנו.

---

# ‏182. Execution Broker Evaluation גם Strategy-Aware

‏Order types, fill quality ו־latency צריכים להתאים ל־holding horizon.

---

# ‏183. `Economic Fit`

‏Feed מצוין יכול להיות יקר מדי ביחס ל־Edge הצפוי.

---

# ‏184. `Operational Fit`

‏API מצוין יכול להיות מורכב מדי לתפעול אישי.

---

# ‏185. ארבעה Dimensions לבחירה

```text
Data Quality
Execution Quality
Economics
Operational Complexity
```

---

# ‏186. KISS בהחלטה

‏בחר את המינימום שמספק את הדרישות — לא את המקסימום הטכני האפשרי.

---

# ‏187. Best Practice — Separation of Concerns

‏כל רכיב יודע רק את מה שהוא צריך לדעת.

---

# ‏188. Best Practice — Canonical Types

‏Domain logic עובד רק מול types פנימיים.

---

# ‏189. Best Practice — Preserve Raw Data

‏כאשר אפשר, שומרים raw events או לפחות raw payload references לצורכי forensic analysis.

---

# ‏190. Best Practice — Every Decision Has Provenance

‏אפשר לענות:

> ‏מאיזה Provider הגיע המידע שעליו החלטנו?

---

# ‏191. Best Practice — Every Fill Has Broker Provenance

‏אפשר לענות:

> ‏איזה Broker/Account/Order יצר את ה־Fill?

---

# ‏192. Best Practice — Explicit Uncertainty

‏`UNKNOWN` עדיף על assumption שקט.

---

# ‏193. Best Practice — Compare Before Switching

‏Provider חדש רץ קודם ב־Shadow.

---

# ‏194. Best Practice — Measure Decision Impact

‏לא רק packet latency.

---

# ‏195. Best Practice — Keep Strategy Portable

‏Strategy source code לא מכיל provider SDK calls.

---

# ‏196. Best Practice — Broker Validation Near Submit

‏כאשר הדבר אפשרי ושימושי, מבצעים validation קרוב ככל האפשר ל־Order.

---

# ‏197. Best Practice — Reconcile After Recovery

‏לא סומכים על local cache אחרי reconnect.

---

# ‏198. Best Practice — Separate Health States

‏Data health, Strategy health, Risk health ו־Broker health אינם אותו דבר.

---

# ‏199. Anti-Pattern — `broker.getLastPrice()` בתוך Strategy

‏זה coupling ישיר לברוקר.

---

# ‏200. Anti-Pattern — `providerSymbol` כמפתח Domain

‏Provider ID אינו canonical identity.

---

# ‏201. Anti-Pattern — השוואת Prices בלי timestamps

‏מחירים מזמנים שונים אינם comparison אמיתי.

---

# ‏202. Anti-Pattern — `Last` של Provider מול `Ask` של Broker

‏זו השוואה של שדות שונים.

---

# ‏203. Anti-Pattern — Fallback שקט ל־Feed חלש יותר

‏ה־Strategy חושבת שהיא עדיין מקבלת אותה איכות.

---

# ‏204. Anti-Pattern — Continue Trading During Partial Universe

‏בלי לבדוק אם Ranking עדיין תקף.

---

# ‏205. Anti-Pattern — שימוש ב־Broker Positions מה־cache בלבד

‏אחרי reconnect חייבים reconciliation.

---

# ‏206. Anti-Pattern — Retry Blind

‏ב־orders retry ללא idempotency יכול ליצור כפילות.

---

# ‏207. Anti-Pattern — Merge Data and Order Threads

‏Burst גדול ב־market data לא צריך לחסום callback קריטי של Fill.

---

# ‏208. Backpressure Domains נפרדים

‏Market data queue ו־broker event queue צריכים policy נפרד.

---

# ‏209. Priority

‏Fill/Position/Risk events בדרך כלל קריטיים יותר מעוד Tick ל־symbol רחוק מה־Top.

---

# ‏210. Load Shedding

‏במצב עומס, אפשר לשקול להפחית enrichment של מועמדים חלשים במקום לאבד broker events.

---

# ‏211. `Hot Set`

‏אפשר לשמור טיפול עשיר יותר ל־Top-N symbols.

---

# ‏212. `Cold Universe`

‏שאר ה־Universe יכול לקבל features זולים יותר.

---

# ‏213. Separation מאפשר Multi-Stage Scanner

```text
Broad cheap feed processing
→ shortlist
→ richer data
→ broker validation
```

---

# ‏214. אבל Stages חייבים לשמור Temporal Integrity

‏אי אפשר לתת ל־deep stage מידע שהגיע אחרי decision timestamp ולייחס אותו אחורה.

---

# ‏215. `Candidate Age` בין Stages

‏נמדוד כמה זמן עבר מה־broad rank עד validation.

---

# ‏216. Candidate יכול למות בדרך

‏אם ה־Signal כבר אינו תקף, אין חובה לבצע רק משום שהוא היה #1 לפני רגע.

---

# ‏217. `Re-Rank Before Execution`

‏זה רעיון אפשרי למחקר, לא ברירת מחדל.

---

# ‏218. Re-Rank משנה semantics

‏צריך לבדוק אם זו אותה strategy או strategy חדשה.

---

# ‏219. `Source of Truth Matrix`

```text
Market observation → Market Data Provider
Trade intent       → Strategy/Execution policy
Risk permission    → Risk Engine
Order state        → Broker
Fill state         → Broker
Position state     → Broker reconciled truth
PnL realized       → Broker fills + fee model
```

---

# ‏220. Matrix זו מונעת ויכוחים בקוד

‏כאשר שני רכיבים חלוקים, יודעים מי authoritative לכל סוג מידע.

---

# ‏221. `Event Provenance`

‏כל Event canonical צריך לשמור provenance.

---

# ‏222. `Decision Provenance`

‏כל Decision צריך לשמור IDs של inputs מרכזיים.

---

# ‏223. `Execution Provenance`

‏כל Order/Fill צריך לשמור correlation ל־Decision.

---

# ‏224. End-to-End Trace ID

‏מומלץ לקשר:

```text
market_event
→ candidate
→ decision
→ intent
→ order
→ fill
→ exit
```

---

# ‏225. למה זה חשוב

‏כי במסחר מהיר Failure בלי trace מלא כמעט בלתי־ניתן לחקירה.

---

# ‏226. `Provider Incident RCA`

‏כשיש Data failure נשאל:

1. ‏מה היה ה־first bad event?
2. ‏כמה symbols נפגעו?
3. ‏האם Top-N נפגע?
4. ‏האם Decision השתנה?
5. ‏האם Order נשלח?
6. ‏האם gate היה צריך לחסום?

---

# ‏227. `Cross-Provider RCA`

‏נשווה את אותו timestamp בין feeds.

---

# ‏228. `Broker Incident RCA`

‏נפרד מנתוני השוק.

---

# ‏229. אל תאשים Strategy לפני Data/Broker RCA

‏כמו שלמדנו בשלב 26, שכבות צריכות להיחקר לפי evidence.

---

# ‏230. Security Boundary

‏Market-data credentials אינם חייבים להיות באותו process או secret store scope של trading credentials.

---

# ‏231. Least Privilege

‏רכיב Data לא צריך הרשאת מסחר.

---

# ‏232. Execution Credentials

‏רק Broker Adapter/Execution boundary צריך גישה אליהם.

---

# ‏233. Environment Separation

```text
REPLAY
SHADOW
PAPER
LIVE
```

‏כל environment צריך Data/Execution wiring מפורש.

---

# ‏234. Wiring Example

```text
SHADOW:
MarketData = LiveProvider
Execution  = NullBroker

PAPER:
MarketData = LiveProvider
Execution  = PaperBroker

LIVE:
MarketData = LiveProvider
Execution  = LiveBroker
```

---

# ‏235. `NullBroker`

‏ב־Shadow, Adapter שלא מסוגל לשלוח Order בפועל הוא שכבת בטיחות טובה.

---

# ‏236. Environment Guard

‏Live credentials לא נטענים ב־Shadow/Paper.

---

# ‏237. `Config Validation`

‏Startup צריך לבדוק שה־wiring תואם environment.

---

# ‏238. Provider/Broker Compatibility Matrix

‏אפשר לתעד אילו שילובים נבדקו.

---

# ‏239. Unsupported Combination

‏שילוב שלא נבדק לא צריך להיחשב אוטומטית תקין.

---

# ‏240. Testing Pyramid

```text
Unit tests
Contract tests
Replay tests
Shadow tests
Paper tests
Small-live validation
```

---

# ‏241. Golden Cross-Provider Scenario

‏שומרים תרחיש שבו Provider ו־Broker שונים מעט אך העסקה עדיין תקינה.

---

# ‏242. Golden Stale Scenario

‏Provider stale → Trade blocked.

---

# ‏243. Golden Mapping Failure

‏Candidate קיים ב־Provider אך broker contract resolution נכשל → אין Order.

---

# ‏244. Golden Divergence Scenario

‏פער גדול לפני submit → Decision blocked/re-evaluated לפי policy.

---

# ‏245. Golden Reconnect Scenario

‏Broker disconnects אחרי submit → recovery + reconciliation לפני retry.

---

# ‏246. Golden Failover Scenario

‏Primary Data נכשל → Secondary warm → capability check → controlled transition.

---

# ‏247. `Chaos` ברמת Data

‏מזריקים:

- ‏delay.
- ‏duplicates.
- ‏gaps.
- ‏out-of-order.
- ‏disconnect.

---

# ‏248. `Chaos` ברמת Broker

‏מזריקים:

- ‏slow ack.
- ‏partial fill.
- ‏reject.
- ‏lost connection.
- ‏unknown state.

---

# ‏249. מטרת Chaos

‏לוודא שהמערכת נכשלת בצורה מבוקרת, לא “להוכיח שהיא אף פעם לא נכשלת”.

---

# ‏250. Baseline Production Contract

‏לפני Production צריך לפחות:

- ‏Canonical instrument mapping.
- ‏Canonical market events.
- ‏Data freshness gates.
- ‏Provider health.
- ‏Broker health.
- ‏Broker reconciliation.
- ‏Decision snapshot.
- ‏Cross-provider validation policy.
- ‏Trace IDs.
- ‏Fail-closed behavior.

---

# ‏251. Baseline לרובוט שלך — גרסה מינימלית

```text
1. Receive whole-market data from external provider.
2. Normalize into canonical events.
3. Maintain fresh-coverage metrics.
4. Compute features/rank.
5. Select Top-N.
6. Resolve canonical instrument to broker contract.
7. Validate candidate freshness and optional broker-side quote.
8. Re-check risk and signal TTL.
9. Submit through Execution Engine.
10. Treat broker orders/fills/positions as execution truth.
11. Record provider→decision→broker→fill timeline.
```

---

# ‏252. מה לא לעשות בגרסה הראשונה

‏לא צריך מיד:

- ‏שלושה providers פעילים.
- ‏Consensus engine.
- ‏Automatic failover מורכב.
- ‏L3 מכל venue.
- ‏Dynamic source blending.

---

# ‏253. מה כן חשוב כבר מהיום הראשון

‏ה־interfaces וה־data model צריכים לאפשר את הדברים האלה בעתיד בלי לשכתב Strategy.

---

# ‏254. רז מקצוע — Data Provider הוא חלק מהאסטרטגיה בפועל

‏גם אם הארכיטקטורה מפרידה אותו, איכות ותזמון הנתונים משפיעים על ה־Edge.

---

# ‏255. רז מקצוע — Execution Broker הוא חלק מה־P&L בפועל

‏גם אם ה־Signal זהה, fill behavior שונה יכול לשנות Net EV.

---

# ‏256. רז מקצוע — Portability אינה אומרת Equivalence

‏אפשר להחליף Provider טכנית תוך שעה ועדיין להזדקק לשבועות של validation כלכלי.

---

# ‏257. רז מקצוע — Divergence צריך להיות מדד, לא הפתעה

‏אם משתמשים בשני מקורות, פער ביניהם הוא משהו שמנטרים מראש.

---

# ‏258. רז מקצוע — Whole-Market Completeness חשובה יותר מ־Single-Symbol Perfection

‏ל־ranking cross-sectional, feed מעולה ל־AAPL בלבד לא עוזר אם מאות symbols אחרים stale.

---

# ‏259. רז מקצוע — Execution Validation חייב להיות מהיר

‏Validation שנמשך זמן רב עלול להרוס את ה־Signal שאותו הוא מנסה להגן עליו.

---

# ‏260. רז מקצוע — אין Source of Truth אחד לכל המערכת

‏יש Source of Truth לפי Domain.

---

# ‏261. Checklist — Market Data Layer

- ‏האם schema canonical?
- ‏האם source נשמר?
- ‏האם event/receive time נשמרים?
- ‏האם freshness נמדד?
- ‏האם gaps מזוהים?
- ‏האם universe coverage נמדד?

---

# ‏262. Checklist — Instrument Mapping

- ‏האם יש internal ID?
- ‏האם mapping versioned?
- ‏האם ambiguity נכשלת סגור?
- ‏האם broker contract resolution נבדק?

---

# ‏263. Checklist — Cross-Provider Validation

- ‏האם משווים אותו field?
- ‏האם timestamps קרובים?
- ‏האם session זהה?
- ‏האם divergence normalized?
- ‏האם יש reason code לחסימה?

---

# ‏264. Checklist — Broker Boundary

- ‏האם broker הוא truth ל־orders/fills/positions?
- ‏האם יש idempotency?
- ‏האם reconciliation קיים?
- ‏האם unknown state מטופל?

---

# ‏265. Checklist — Recovery

- ‏האם existing positions מתאוששות ראשונות?
- ‏האם market state מתחמם מחדש?
- ‏האם new trades חסומים עד readiness?
- ‏האם failover נבדק?

---

# ‏266. Checklist — Observability

- ‏Fresh coverage.
- ‏Provider lag percentiles.
- ‏Broker latency percentiles.
- ‏Cross-provider divergence.
- ‏Decision impact rate.
- ‏Blocked-trade counts.
- ‏Mapping failures.

---

# ‏267. Checklist — Research

‏לפני שינוי Provider או Broker:

1. ‏הקפא Baseline.
2. ‏הרץ Replay.
3. ‏הרץ Shadow במקביל.
4. ‏מדוד Decision differences.
5. ‏מדוד Execution/economic differences.
6. ‏בצע RCA לפערים.
7. ‏רק אז שקול Promotion.

---

# ‏268. מבחן עצמי

‏אם מחר נחליף את ספק הנתונים אבל נשאיר את אותו Broker, אילו קבצים ב־Strategy צריכים להשתנות?

‏התשובה הרצויה:

> ‏אף אחד.

---

# ‏269. מבחן עצמי נוסף

‏אם מחר נחליף Broker אבל נשאיר את אותו Provider, אילו Features צריכים להשתנות?

‏התשובה הרצויה:

> ‏אף אחד — אלא אם המחקר מראה שיכולת ביצוע שונה מחייבת שינוי אסטרטגי מפורש.

---

# ‏270. הסיכום החשוב ביותר

‏הפרדה נכונה אינה אומרת שה־Market Data וה־Execution אינם משפיעים זה על זה.

‏היא אומרת שההשפעה ביניהם **מפורשת, נמדדת ונשלטת**.

‏ה־Scanner רואה שוק דרך Provider.

‏ה־Execution Engine פועל דרך Broker.

‏ה־Risk Engine מחליט אם מותר לחבר ביניהם כרגע.

‏וה־Observability מחזיקה את כל שרשרת ה־Evidence.

---

# ‏271. לאן ממשיכים מכאן

‏בשלבים 29–32 בנינו את גבולות המערכת מול העולם החיצוני:

```text
Replay / Shadow
Market Data Provider
Execution Broker
Cross-provider consistency
```

‏השלב הבא הוא להפוך את החלקים האלה למכונה אחת שמנהלת lifecycle מלא בצורה מפורשת.

‏בשלב 33 נלמד את **`Production State Machine`** — states, transitions, invariants ו־failure paths של הרובוט כולו.