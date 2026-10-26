# ‏שלב 29 — `Broker API Architecture`: לבנות שכבת ביצוע אמינה שאינה תלויה בברוקר אחד

> ‏מטרת הפרק: להבין איך מחברים מערכת Algo לברוקר בצורה מקצועית, כך שה־`Strategy` לא תהיה תלויה בפרטי API ספציפיים, שה־`Risk Engine` לא יעקף בטעות, ושכל Order, Fill, Cancel, Reject, Reconnect ו־Recovery ינוהלו במפורש.
>
> ‏העיקרון המרכזי: **הברוקר הוא מקור האמת ל־Orders, Fills ו־Positions; האפליקציה היא מקור האמת ל־Intent ולמדיניות.** החיבור ביניהם דורש reconciliation, idempotency ו־state machine — לא רק קריאת API.

---

# ‏1. למה שכבת Broker היא מערכת בפני עצמה

‏קל להתחיל כך:

```text
if buySignal:
    broker.buy(symbol, quantity)
```

‏אבל מערכת אמיתית צריכה להתמודד עם:

- ‏בקשה שנשלחה אבל לא התקבל עליה ACK.
- ‏ACK שהתקבל אבל Fill עוד לא הגיע.
- ‏Partial Fill.
- ‏Cancel שנשלח בזמן ש־Fill כבר בדרך.
- ‏Reconnect.
- ‏Duplicate callback.
- ‏Out-of-order events.
- ‏Order rejected.
- ‏Position שנראית שונה אצלנו ואצל הברוקר.
- ‏API throttling.
- ‏Session expiration.
- ‏Unknown state.

‏לכן שכבת Broker אינה helper קטן. היא boundary קריטי של המערכת.

---

# ‏2. ארבע שכבות שאסור לערבב

```text
Strategy
↓
Risk Engine
↓
Execution Engine
↓
Broker Adapter
```

‏לכל אחת אחריות שונה.

---

# ‏3. `Strategy`

‏ה־Strategy עונה על שאלות כמו:

- ‏איזה Symbol מעניין?
- ‏האם יש Signal?
- ‏מה ה־Score?
- ‏מה ה־Rank?
- ‏האם ההיגיון אומר Entry או Exit?

‏היא **לא** אמורה לדעת:

- ‏איך נראה order ID אצל הברוקר.
- ‏איזה callback מגיע ראשון.
- ‏איך reconnect עובד.
- ‏איך rate limit מיוצג.

---

# ‏4. `Risk Engine`

‏ה־Risk Engine מחליט:

- ‏האם בכלל מותר לבצע.
- ‏מה הכמות המקסימלית.
- ‏מה החשיפה הקיימת.
- ‏האם המערכת במצב `ACTIVE`, ‏`PAUSED`, ‏`EXIT_ONLY` או `LOCKED`.
- ‏האם מגבלת יום/עסקה/חשיפה נחצתה.

‏הוא חייב להיות authority עצמאי.

---

# ‏5. `Execution Engine`

‏ה־Execution Engine מתרגם Intent למדיניות ביצוע.

‏למשל:

```text
Intent:
BUY 200 shares of XYZ
max acceptable price = 25.13
TTL = 800ms
urgency = HIGH
```

‏הוא מחליט:

- ‏איזה סוג Order.
- ‏באיזה Price.
- ‏כמה Aggressive להיות.
- ‏כמה זמן להמתין.
- ‏מתי Cancel/Replace.
- ‏מה לעשות ב־Partial Fill.

---

# ‏6. `Broker Adapter`

‏ה־Adapter יודע לדבר עם API מסוים.

‏הוא מתרגם:

```text
CanonicalOrder
→ BrokerSpecificRequest
```

‏ובחזרה:

```text
Broker callback
→ CanonicalBrokerEvent
```

‏כך שאר המערכת אינה יודעת אם הברוקר הוא A, B או C.

---

# ‏7. למה `Adapter` עדיף על Broker-specific code בכל המערכת

‏בלי Adapter נקבל מהר מאוד:

```text
if broker == X
if broker == Y
if broker == Z
```

‏בתוך Strategy, Risk, UI, tests ו־replay.

‏זה יוצר coupling חזק וקשה לבדיקה.

---

# ‏8. חוזה Canonical פנימי

‏כדאי שהמערכת תגדיר מודלים פנימיים כמו:

```text
OrderIntent
OrderRequest
BrokerOrder
ExecutionReport
Fill
Position
AccountSnapshot
BrokerHealth
```

‏וה־Adapter בלבד יתרגם אותם לפורמט החיצוני.

---

# ‏9. `OrderIntent` אינו `OrderRequest`

‏`OrderIntent` מתאר מה אנחנו רוצים להשיג.

‏לדוגמה:

```text
BUY
symbol = XYZ
quantity = 200
maxPrice = 25.13
reason = TOP_RANKED_ENTRY
```

‏`OrderRequest` הוא מה שנשלח בפועל לברוקר.

---

# ‏10. למה לשמור את שניהם

‏אם נכשלנו, אנחנו רוצים לדעת:

```text
What did strategy want?
What did execution decide?
What did broker receive?
What did broker acknowledge?
What actually filled?
```

‏בלי ההפרדה הזאת RCA נהיה קשה מאוד.

---

# ‏11. `Client Order ID`

‏לכל Intent/Order צריך מזהה פנימי יציב.

‏לדוגמה:

```text
clientOrderId = 20261026-XYZ-0001842
```

‏המזהה מאפשר לקשור יחד:

- ‏Intent.
- ‏Submit.
- ‏ACK.
- ‏Fill.
- ‏Cancel.
- ‏Replace.
- ‏Reconnect.
- ‏Replay.

---

# ‏12. Broker Order ID אינו תחליף ל־Client Order ID

‏מזהה ברוקר מתקבל לעיתים רק לאחר Submit או ACK.

‏לכן צריך mapping:

```text
clientOrderId ↔ brokerOrderId
```

---

# ‏13. `Correlation ID`

‏בנוסף ל־Order ID אפשר לשמור מזהה לתהליך כולו:

```text
tradeIntentId
```

‏אותו Trade יכול ליצור כמה Orders:

```text
entry submit
entry replace
exit submit
exit replace
```

---

# ‏14. `Idempotency`

‏מערכת חייבת להתמודד עם מצב שבו אותה פעולה נשלחת פעמיים.

‏לדוגמה:

```text
network timeout
↓
לא ברור אם הבקשה התקבלה
↓
retry
```

‏אם retry ייצור Order שני, נוצר סיכון אמיתי.

---

# ‏15. כלל Idempotency

‏לפני retry צריך לשאול:

```text
Did broker already accept this intent?
```

‏ולא:

```text
Did my HTTP/TCP call return success?
```

---

# ‏16. Delivery Semantics

‏במערכות מבוזרות חשוב להבין:

```text
at-most-once
at-least-once
exactly-once illusion
```

‏ברוב המקרים לא כדאי להניח שיש Exactly Once אמיתי מקצה לקצה.

---

# ‏17. Broker callbacks הם Events

‏אירועים אפשריים:

```text
ORDER_ACCEPTED
ORDER_WORKING
PARTIAL_FILL
FILLED
CANCEL_PENDING
CANCELLED
REJECTED
EXPIRED
UNKNOWN
```

‏הם צריכים לעבור pipeline מסודר.

---

# ‏18. אל תניח Event ordering מושלם

‏מערכת חזקה צריכה להיות מוכנה ל:

- ‏duplicate event.
- ‏delayed event.
- ‏event שהגיע אחרי reconnect.
- ‏event שמתייחס למצב שכבר השתנה.

---

# ‏19. `Order State Machine`

‏דוגמה כללית:

```text
CREATED
→ SUBMITTING
→ ACKNOWLEDGED
→ WORKING
→ PARTIALLY_FILLED
→ FILLED
```

‏או:

```text
WORKING
→ CANCEL_REQUESTED
→ CANCELLED
```

‏או:

```text
SUBMITTING
→ REJECTED
```

---

# ‏20. מצב `UNKNOWN`

‏זה אחד המצבים החשובים ביותר.

‏לדוגמה:

```text
submit sent
connection lost
no ack
```

‏אסור להניח:

```text
order does not exist
```

‏וגם אסור להניח:

```text
order definitely exists
```

‏המצב הנכון הוא:

```text
UNKNOWN
```

---

# ‏21. מה עושים ב־`UNKNOWN`

‏עוצרים פעולות שעלולות להכפיל Exposure ומבצעים reconciliation מול הברוקר.

---

# ‏22. Broker Truth

‏אחרי reconnect, מקור האמת צריך להיות:

```text
Open Orders from broker
Executions/Fills from broker
Positions from broker
Account state from broker
```

‏לא cache מקומי בלבד.

---

# ‏23. `Reconciliation`

‏Reconciliation משווה:

```text
local expected state
vs
broker actual state
```

---

# ‏24. ארבעה Reconciliation domains

```text
Orders
Executions
Positions
Cash / Buying Power
```

---

# ‏25. Startup Reconciliation

‏לפני שהמערכת מתחילה לפתוח עסקאות חדשות:

1. ‏התחברות.
2. ‏טעינת Orders פתוחים.
3. ‏טעינת Fills אחרונים.
4. ‏טעינת Positions.
5. ‏השוואה ל־state המקומי.
6. ‏פתרון פערים.
7. ‏רק אז מעבר ל־`ACTIVE`.

---

# ‏26. Reconnect Reconciliation

‏כל reconnect צריך להיחשב אירוע בטיחותי.

‏לא ממשיכים אוטומטית מה־cache כאילו דבר לא קרה.

---

# ‏27. Periodic Reconciliation

‏גם בלי disconnect אפשר לבצע reconciliation תקופתי.

‏המטרה:

- ‏לזהות callback שאבד.
- ‏לזהות Fill שלא נרשם.
- ‏לזהות Position drift.

---

# ‏28. `Position Truth`

‏אם המקומי אומר:

```text
XYZ = 0
```

‏והברוקר אומר:

```text
XYZ = +200
```

‏המערכת צריכה להתייחס לברוקר כמקור האמת לביצוע בפועל.

---

# ‏29. Intent Truth

‏לעומת זאת, הברוקר לא יודע למה רצינו את העסקה.

‏לכן:

```text
Intent reason
Score
Rank
Risk decision
Execution policy
```

‏נשמרים אצלנו.

---

# ‏30. Separation of Truth

```text
Broker truth = what actually exists
Application truth = why we wanted it
```

‏שניהם נחוצים.

---

# ‏31. Command מול Event

‏דוגמה:

```text
Command:
CancelOrder(ABC)
```

‏אינו אומר שה־Order בוטל.

‏רק Event מאומת כמו:

```text
ORDER_CANCELLED
```

‏מעדכן את ה־state הסופי.

---

# ‏32. Request Success אינו Business Success

‏תגובה טכנית מוצלחת מה־API אינה בהכרח:

- ‏Order accepted.
- ‏Order working.
- ‏Order filled.

---

# ‏33. ACK אינו Fill

‏המערכת חייבת לעקוב בנפרד אחר:

```text
submittedQty
acknowledgedQty
filledQty
remainingQty
```

---

# ‏34. Partial Fill

‏נניח ביקשנו 500 מניות וקיבלנו 130.

‏ה־Position האמיתי הוא 130.

‏Risk, Exit ו־PnL חייבים להתבסס על 130 — לא על 500.

---

# ‏35. Multiple Fills

‏Order אחד יכול ליצור כמה Fills.

‏לכן צריך:

```text
Fill Ledger
```

‏ולא רק `averageFillPrice` סופי.

---

# ‏36. Fill Ledger

‏לכל Fill נשמור לפחות:

```text
fillId
clientOrderId
brokerOrderId
symbol
side
quantity
price
executionTime
receivedTime
fees if available
```

---

# ‏37. Fill Deduplication

‏אם אותו Fill event מגיע פעמיים, אסור להכפיל Position.

‏לכן צריך deduplication לפי מזהה יציב ככל שה־API מאפשר.

---

# ‏38. Cancel/Fill Race

‏מצב קלאסי:

```text
T0 cancel requested
T1 market fills order
T2 cancel rejected / too late
T3 fill event arrives
```

‏המערכת חייבת לקבל את ה־Fill כאמת.

---

# ‏39. Replace הוא לא תמיד mutation פשוט

‏לוגית אפשר לחשוב:

```text
change price 25.10 → 25.12
```

‏אבל מבחינת execution זה עשוי להתנהג כמו cancel/replace.

‏ה־Adapter צריך להסתיר את הפרטים הספציפיים, אך ה־Execution Engine צריך להבין שיש latency ו־race risk.

---

# ‏40. Parent/Child Orders

‏מערכות מסוימות תומכות ביחסים בין Orders.

‏המודל הפנימי יכול לייצג:

```text
parentIntentId
parentOrderId
childRole
```

‏מבלי להתחייב למימוש ספציפי של ברוקר.

---

# ‏41. `Capabilities`

‏לא כל Broker תומך באותם דברים.

‏לכן Adapter יכול לפרסם capabilities:

```text
supportsMarketOrder
supportsLimitOrder
supportsStop
supportsBracket
supportsNativeOco
supportsOutsideRth
supportsFractionalQty
supportsModify
```

---

# ‏42. Capability Negotiation

‏Execution Engine לא צריך להניח שפיצ'ר קיים.

‏הוא צריך לשאול:

```text
brokerCapabilities
```

‏ולהשתמש ב־fallback בטוח או לדחות את ה־Intent.

---

# ‏43. Unsupported Capability

‏התנהגות טובה:

```text
REJECT_INTENT_UNSUPPORTED_CAPABILITY
```

‏ולא fallback שקט שמשנה semantics.

---

# ‏44. Rate Limits

‏API חיצוני כמעט תמיד מגיע עם מגבלות כלשהן.

‏העיקרון:

```text
Rate limit is part of system design
```

‏ולא “בעיה שנפתור כשנקבל שגיאה”.

---

# ‏45. Rate Limit Budget

‏כדאי לנהל budget נפרד ל:

- ‏Orders.
- ‏Cancels.
- ‏Queries.
- ‏Market data requests.
- ‏Account refresh.

---

# ‏46. Priority תחת לחץ

‏אם budget API נמוך, סדר עדיפויות אפשרי:

```text
risk-reducing action
cancel dangerous order
exit management
reconciliation
new entry
noncritical diagnostics
```

‏המדיניות המדויקת צריכה להיות מפורשת.

---

# ‏47. Backpressure

‏אם האפליקציה מייצרת Intent מהר יותר ממה שה־Broker Adapter יכול לשלוח, צריך backpressure.

‏אסור לבנות queue בלתי מוגבל.

---

# ‏48. Stale Intent

‏אם Intent חיכה בתור זמן רב מדי, ייתכן שכבר אינו רלוונטי.

‏לכן לכל Intent יכול להיות:

```text
createdAt
expiresAt
maxAgeMs
```

---

# ‏49. Order Submission Budget

‏במסחר של שניות, queue פנימי של 2 שניות יכול להרוס את כל ה־Edge.

‏לכן צריך למדוד:

```text
intent_to_submit_ms
```

---

# ‏50. Latency Breakdown

‏כדאי לפרק:

```text
strategy_to_risk
risk_to_execution
execution_to_adapter
adapter_to_broker_ack
ack_to_first_fill
```

---

# ‏51. Percentiles

‏לא מספיק ממוצע.

‏נרצה:

```text
P50
P90
P95
P99
max
```

---

# ‏52. API Health

‏Broker Adapter צריך לפרסם health state.

‏לדוגמה:

```text
HEALTHY
DEGRADED
RECONNECTING
STALE
UNAVAILABLE
```

---

# ‏53. `BrokerHealth` אינו boolean

‏`isConnected = true` לא אומר שהמערכת באמת תקינה.

‏ייתכן:

- ‏socket פתוח.
- ‏callbacks תקועים.
- ‏account snapshot ישן.
- ‏orders לא מקבלים ACK.

---

# ‏54. Heartbeats

‏אפשר לעקוב אחר:

```text
lastMessageReceivedAt
lastBrokerAckAt
lastAccountRefreshAt
lastPositionRefreshAt
```

---

# ‏55. Freshness Thresholds

‏אם state מסוים התיישן, המערכת יכולה לעבור ל־`DEGRADED` או `EXIT_ONLY`.

---

# ‏56. Connection State Machine

```text
DISCONNECTED
→ CONNECTING
→ AUTHENTICATING
→ SYNCING
→ READY
```

‏ובתקלות:

```text
READY
→ DEGRADED
→ RECONNECTING
→ SYNCING
→ READY
```

---

# ‏57. `READY` רק אחרי Sync

‏התחברות socket בלבד אינה מספיקה.

‏צריך להשלים state sync לפני Entries חדשים.

---

# ‏58. Session Identity

‏בכל session נשמור:

```text
connectionSessionId
connectedAt
brokerSessionMetadata
```

‏כדי לנתח failures ו־reconnects.

---

# ‏59. Startup Safety

‏ברירת המחדל הבטוחה:

```text
NOT_READY
```

‏ולא:

```text
ACTIVE
```

---

# ‏60. `Fail Closed`

‏אם לא יודעים בבטחה אם מותר לפתוח Position — לא פותחים Position חדש.

---

# ‏61. Exit path שונה מ־Entry path

‏במצב תקלה ייתכן שנרצה:

```text
new entries blocked
risk-reducing exits allowed
```

‏זהו `EXIT_ONLY`.

---

# ‏62. Broker Adapter API לדוגמה

```text
ConnectAsync()
DisconnectAsync()
GetCapabilitiesAsync()
GetOpenOrdersAsync()
GetPositionsAsync()
GetExecutionsAsync()
SubmitOrderAsync(order)
CancelOrderAsync(orderId)
ReplaceOrderAsync(orderId, changes)
```

---

# ‏63. Event stream נפרד

‏בנוסף ל־Commands:

```text
OnConnectionStateChanged
OnOrderChanged
OnExecution
OnPositionChanged
OnAccountChanged
OnError
```

---

# ‏64. Commands ו־Events צריכים להיות נפרדים

‏הפרדה זו מקלה על:

- ‏testing.
- ‏replay.
- ‏mock broker.
- ‏paper adapter.
- ‏live adapter.

---

# ‏65. Async by default

‏Broker API הוא boundary אסינכרוני.

‏גם אם SDK מסוים מציג call סינכרוני, התוצאה העסקית בדרך כלל מתרחשת מאוחר יותר.

---

# ‏66. Cancellation Tokens פנימיים אינם Broker Cancel

‏ב־.NET לדוגמה, ביטול `Task` אינו אומר שה־Order אצל הברוקר בוטל.

‏אלה שני דברים שונים לחלוטין.

---

# ‏67. Timeouts

‏Timeout צריך לתאר:

```text
we did not receive confirmation in time
```

‏לא:

```text
the broker definitely did not process it
```

---

# ‏68. Retry Policy

‏לא כל פעולה בטוחה ל־retry אוטומטי.

‏לדוגמה:

- ‏read query — לרוב קל יותר.
- ‏new order submit — מסוכן ללא idempotency.
- ‏cancel — דורש state awareness.

---

# ‏69. Retry Classification

‏שגיאות אפשר לחלק ל:

```text
TRANSIENT
PERMANENT
UNKNOWN_EFFECT
RATE_LIMITED
AUTH_FAILURE
INVALID_REQUEST
```

---

# ‏70. Unknown Effect

‏זו קטגוריה קריטית:

```text
request may or may not have been applied
```

‏במצב כזה לא retry עיוור — קודם reconcile.

---

# ‏71. Error Normalization

‏כל Broker מחזיר errors בצורה שונה.

‏נרצה Canonical error model:

```text
code
category
retryable
unknownEffect
riskImpact
rawBrokerCode
rawMessage
```

---

# ‏72. לשמור Raw Broker Error

‏גם אחרי normalization כדאי לשמור את הקוד וההודעה המקוריים לצורך RCA.

---

# ‏73. Reject Reasons

‏Reject אינו רק `false`.

‏דוגמאות כלליות:

```text
INSUFFICIENT_BUYING_POWER
INVALID_PRICE
INVALID_QUANTITY
MARKET_CLOSED
UNSUPPORTED_ORDER_TYPE
RISK_REJECT
BROKER_REJECT_OTHER
```

---

# ‏74. No Silent Fallback

‏אם Marketable Limit נדחה, אסור להפוך אותו אוטומטית ל־Market בלי policy מפורשת.

---

# ‏75. Order Normalization

‏לפני submit צריך להתחשב ב:

- ‏tick size.
- ‏quantity step.
- ‏minimum quantity.
- ‏price precision.
- ‏session rules.

‏הפרטים בפועל משתנים לפי מוצר/venue/broker ולכן נשמרים ב־instrument metadata וב־adapter.

---

# ‏76. Validation לפני Broker

‏עדיף לגלות locally:

```text
price invalid
qty invalid
unsupported field
```

‏לפני round-trip חיצוני.

---

# ‏77. אבל Local Validation אינה Broker Validation

‏גם request חוקי מקומית יכול להידחות חיצונית.

---

# ‏78. Symbol Mapping

‏Symbol אחד לא תמיד מספיק לזיהוי נכס.

‏מודל פנימי עדיף שיתמוך ב־instrument identity יציבה.

---

# ‏79. `InstrumentId`

‏אפשר לשמור:

```text
internalInstrumentId
symbol
exchange
currency
assetType
brokerSpecificIds
```

---

# ‏80. למה זה חשוב

‏Symbols יכולים להשתנות, להיות דו־משמעיים או להופיע בכמה venues.

---

# ‏81. Market Data Broker ≠ Execution Broker

‏המערכת צריכה לאפשר:

```text
MarketDataProvider A
ExecutionBroker B
```

‏בלי לשבור את Strategy.

---

# ‏82. Cross-provider Instrument Mapping

‏אם נתוני שוק מגיעים מספק A והביצוע מ־B, צריך mapping מפורש בין instrument identifiers.

---

# ‏83. Cross-provider Clock Differences

‏צריך למדוד גם:

```text
marketDataReceivedAt
orderSubmittedAt
brokerAckReceivedAt
```

‏ולא להניח שעוני המערכות זהים לחלוטין.

---

# ‏84. Account Adapter

‏מעבר ל־Orders, לעיתים נרצה abstraction ל:

```text
cash
buyingPower
positions
pendingOrders
accountRestrictions
```

---

# ‏85. Cached Account State

‏אפשר cache, אבל חייב להיות timestamped.

```text
value
asOf
receivedAt
```

---

# ‏86. Stale Account State

‏אם buying power ישן מדי, Risk Engine לא אמור להעמיד פנים שהוא עדכני.

---

# ‏87. Reserved Capital

‏Open Orders יכולים לצרוך הון גם לפני Fill.

‏לכן risk/accounting layer צריכה להתחשב ב־working exposure.

---

# ‏88. Pending Exposure

```text
current position
+
working buy orders
-
working sell reductions
```

‏החישוב המדויק תלוי semantics, אבל אסור להתעלם מ־working orders.

---

# ‏89. Duplicate Entry Prevention

‏לפני Entry חדש נבדוק לפחות:

```text
existing position?
working entry order?
unknown order state?
pending replace?
```

---

# ‏90. Per-Symbol Lock

‏אפשר להשתמש ב־logical single-flight per symbol כדי למנוע שני workflows מתחרים על אותו נכס.

---

# ‏91. אבל לא Lock גלובלי

‏Lock רחב מדי עלול להפוך את המערכת לאיטית.

‏צריך concurrency עם invariants ברורים.

---

# ‏92. Concurrency Model

‏אפשרויות כוללות:

- ‏actor per symbol.
- ‏partitioned queues.
- ‏single writer state machine.
- ‏event loop.

‏העיקרון חשוב יותר מהטכנולוגיה.

---

# ‏93. Single Writer Principle

‏ל־Order state מסוים עדיף שיהיה owner ברור שמעדכן אותו סדרתית.

‏זה מפחית races.

---

# ‏94. Event Sourcing Concept

‏במקום לשמור רק state סופי:

```text
SUBMITTED
ACKED
PARTIAL_FILL 100
CANCEL_REQUESTED
PARTIAL_FILL 20
CANCELLED
```

‏אפשר לשמור event log ולבנות state ממנו.

---

# ‏95. למה Event Log שימושי

- ‏RCA.
- ‏Replay.
- ‏Recovery.
- ‏Audit.
- ‏Testing.

---

# ‏96. Snapshot + Event Log

‏כדי לא לבנות state מהתחלה בכל restart:

```text
snapshot
+
events after snapshot
```

---

# ‏97. Durable State

‏מידע קריטי שצריך לשרוד process crash:

- ‏active intents.
- ‏known broker IDs.
- ‏fills.
- ‏positions snapshot.
- ‏unknown states.
- ‏risk state.

---

# ‏98. Write Ordering

‏צריך להחליט מה נרשם לפני ומה אחרי external call.

‏אין פתרון קסם שמבטל distributed-system ambiguity.

‏לכן reconciliation נשאר הכרחי.

---

# ‏99. Outbox Pattern — רעיון

‏אפשר לשמור Command intent durable לפני שליחה, ואז לעקוב אחרי delivery.

‏זה לא נותן Exactly Once מול Broker, אבל משפר recoverability.

---

# ‏100. Inbox Deduplication — רעיון

‏אירועים נכנסים יכולים להישמר עם מזהה ולעבור deduplication לפני side effects.

---

# ‏101. State Invariants

‏דוגמאות:

```text
filledQty <= orderedQty unless explicitly supported otherwise
position quantity derives from fills/reconciliation
no new entry while symbol is UNKNOWN
no position considered flat until broker truth confirms
```

---

# ‏102. Invariant Violation

‏אם invariant נשבר:

```text
alert
freeze affected symbol
reconcile
capture incident package
```

---

# ‏103. Incident Package

‏לשמור:

- ‏Intent.
- ‏Order events.
- ‏Broker raw messages.
- ‏market snapshot.
- ‏position before/after.
- ‏connection state.
- ‏timestamps.
- ‏code/config version.

---

# ‏104. Structured Logging

‏במקום:

```text
order failed
```

‏עדיף:

```text
clientOrderId
brokerOrderId
symbol
stateBefore
stateAfter
command
brokerCode
latencyMs
connectionSessionId
```

---

# ‏105. Trace ID

‏Trade workflow שלם יכול לקבל trace אחד:

```text
Signal → Risk → Order → Fill → Exit
```

---

# ‏106. Metrics בסיסיים

```text
submit_count
reject_count
cancel_count
replace_count
partial_fill_count
unknown_state_count
reconnect_count
reconciliation_mismatch_count
```

---

# ‏107. Latency Metrics

```text
submit_to_ack_ms
ack_to_first_fill_ms
cancel_to_confirm_ms
reconnect_to_ready_ms
```

---

# ‏108. Reliability Metrics

```text
order_ack_rate
fill_event_duplicate_rate
position_mismatch_rate
api_error_rate
rate_limit_rate
```

---

# ‏109. Alerts

‏Alert טוב הוא actionable.

‏לדוגמה:

```text
UNKNOWN order state > 0 for 2 seconds
```

‏עשוי להיות חשוב יותר מ־CPU גבוה.

---

# ‏110. Broker Disconnect בזמן Position פתוח

‏זה Scenario שחייבים לתרגל.

‏צריך לדעת:

- ‏מה מצב ה־Order הקיים.
- ‏האם exit order קיים אצל הברוקר.
- ‏מה ניתן לדעת כרגע.
- ‏איך המערכת עוברת ל־safe state.

---

# ‏111. Broker Disconnect ללא Position

‏גם כאן Entries חדשים צריכים להיחסם עד Recovery מלא.

---

# ‏112. Process Crash

‏בדיקת Recovery צריכה להתחיל ממצבים שונים:

```text
before submit
submit in-flight
working order
partial fill
open position
exit in-flight
```

---

# ‏113. Machine Restart

‏המערכת לא צריכה להניח שזיכרון process הוא האמת.

---

# ‏114. Network Partition

‏מצב שבו:

```text
our app cannot reach broker
broker still has working order
```

‏זו בדיוק הסיבה ל־Broker-native truth ו־reconciliation.

---

# ‏115. Broker-side Protective Orders

‏כאשר ברוקר תומך במנגנוני הגנה native, הם יכולים לשרוד תקלה מקומית בצורה שונה ממנגנון client-side.

‏אבל capabilities וה־semantics משתנים בין ברוקרים ולכן יש לאמת אותם בפרק הספציפי לברוקר.

---

# ‏116. Client-side Exit Logic

‏יתרון:

- ‏גמישות.

‏חיסרון:

- ‏תלוי ב־process, connection ו־fresh market data.

---

# ‏117. Native vs Client-side

‏זו החלטת architecture ו־risk, לא רק convenience.

---

# ‏118. Environment Separation

```text
REPLAY
SHADOW
PAPER
LIVE
```

‏צריכים להיות environments מפורשים.

---

# ‏119. Live Guard

‏מעבר ל־Live צריך לדרוש configuration מפורש שלא יכול לקרות בגלל default.

---

# ‏120. Credential Separation

‏Paper ו־Live צריכים credentials/config נפרדים ככל שהספק מאפשר.

---

# ‏121. Adapter Interface זהה בין Environments

‏המטרה:

```text
same Execution Engine
same Risk Engine
same Strategy
```

‏רק adapter משתנה.

---

# ‏122. `SimulatedBroker`

‏ל־Backtest/Replay אפשר לממש את אותו contract.

‏כך ניתן לבדוק parity.

---

# ‏123. `PaperBrokerAdapter`

‏אם לספק יש Paper API, adapter נפרד יכול להשתמש בו תוך שמירת אותו Canonical contract.

---

# ‏124. `LiveBrokerAdapter`

‏אותו contract, אך עם controls מחמירים יותר.

---

# ‏125. Contract Tests

‏כל Adapter צריך לעבור אותם tests בסיסיים.

‏לדוגמה:

```text
submit → ack
submit → reject
partial fill
cancel
cancel/fill race
reconnect
reconciliation
```

---

# ‏126. Adapter Conformance Suite

‏אם בעתיד מוסיפים Broker חדש, הוא לא נכנס למערכת לפני שהוא עובר suite משותף.

---

# ‏127. Mock Broker

‏Mock פשוט שימושי ל־unit tests, אבל אינו מספיק ל־execution semantics.

---

# ‏128. Fake Broker עם State Machine

‏לבדיקות טובות יותר נרצה fake שמדמה:

- ‏ACK delay.
- ‏partial fills.
- ‏rejects.
- ‏duplicates.
- ‏disconnects.

---

# ‏129. Chaos Tests

‏הזרקת תקלות:

```text
lose ack
repeat fill event
delay cancel response
disconnect after submit
reorder events
rate-limit requests
```

---

# ‏130. Golden Broker Scenarios

‏תרחישים קריטיים נשמרים כ־regression tests.

---

# ‏131. Happy Path אינו מספיק

‏מערכת Broker לרוב נשברת דווקא ב־rare transitions.

---

# ‏132. State Transition Coverage

‏נרצה לבדוק transitions ולא רק methods.

---

# ‏133. Property Tests

‏דוגמאות:

```text
position never becomes negative accidentally for long-only policy
same fill event twice does not double position
UNKNOWN blocks new entry
reconciliation converges local state to broker truth
```

---

# ‏134. Replay של Broker Events

‏אירוע Production מעניין צריך להיות ניתן לשחזור במעבדה.

---

# ‏135. Broker Event Recorder

‏כדאי לשמור canonical events וגם raw payload metadata לפי מגבלות פרטיות/אבטחה.

---

# ‏136. Schema Versioning

‏Broker event schema פנימי צריך להיות versioned.

---

# ‏137. API Version Changes

‏ספק חיצוני יכול לשנות semantics או endpoints.

‏לכן adapter boundary מצמצם blast radius.

---

# ‏138. Capability Drift

‏גם capability קיים יכול להשתנות.

‏לכן capabilities ותצורת provider הם versioned inputs.

---

# ‏139. Broker Configuration Snapshot

‏בכל run כדאי לדעת:

```text
broker adapter version
account/environment type
routing configuration
order defaults
capability snapshot
```

---

# ‏140. No Hidden Defaults

‏Execution-critical defaults צריכים להיות מפורשים.

‏לדוגמה:

```text
timeInForce
outsideSession
routing preference
```

‏כאשר רלוונטי.

---

# ‏141. Canonical Time-in-Force

‏מודל פנימי יכול לייצג מושגים כלליים, וה־Adapter יתרגם רק מה שנתמך.

---

# ‏142. Unsupported Mapping

‏אם אין mapping בטוח — Reject.

‏לא “בערך אותו דבר”.

---

# ‏143. Routing Abstraction

‏Strategy לא צריכה לדעת route ספציפי.

‏Execution Policy יכולה לבטא Intent כמו:

```text
prefer best executable price
prefer passive
prefer urgency
```

‏וה־Adapter ימפה לפי היכולות הזמינות.

---

# ‏144. Broker-specific Optimizations

‏אפשר להשתמש ביכולות מתקדמות בהמשך, אבל דרך extension point.

---

# ‏145. Core Path קודם

‏לפני אלגוריתמי Broker מתקדמים, צריך מסלול אמין של:

```text
Limit
Marketable Limit
Cancel
Replace
Fill
Reconcile
```

---

# ‏146. Feature Flags

‏יכולת חדשה ב־Adapter צריכה להיכנס מאחורי feature flag או capability gate.

---

# ‏147. Progressive Rollout

‏אפשר להפעיל פיצ'ר Execution חדש רק ב־Paper/Shadow לפני Live.

---

# ‏148. Canary Execution

‏ב־Live עתידי, שינוי Broker behavior יכול להתחיל בהיקף קטן ומוגבל.

---

# ‏149. Broker Migration

‏אם בנינו abstraction טוב, מעבר Broker אינו Rewrite של Strategy.

‏אבל הוא עדיין דורש:

- ‏conformance tests.
- ‏paper validation.
- ‏execution calibration.
- ‏cost recalibration.

---

# ‏150. Multi-Broker עתידי

‏ארכיטקטורה טובה יכולה בעתיד לתמוך בכמה execution venues/brokers, אבל אין צורך לבנות complexity מראש אם אין צורך עסקי.

---

# ‏151. KISS

‏למערכת האישית שלנו עדיף להתחיל עם:

```text
one execution broker
one adapter
one canonical order model
one event pipeline
one reconciliation engine
```

‏ולהשאיר interfaces להחלפה עתידית.

---

# ‏152. מה לא לעשות

‏לא לבנות “universal broker framework” ענק לפני שיש Broker אחד שעובד היטב.

---

# ‏153. Security Boundary

‏Credentials של Broker הם secrets.

‏אסור:

- ‏להדפיס אותם ללוג.
- ‏לשמור אותם בקוד.
- ‏לכלול אותם ב־incident dumps.

---

# ‏154. Least Privilege

‏כאשר הספק מאפשר, עדיף להשתמש בהרשאות המינימליות הדרושות.

---

# ‏155. Secret Rotation

‏צריך להיות תהליך להחלפת credentials בלי לשנות קוד Strategy.

---

# ‏156. Audit Trail

‏לכל שינוי Execution משמעותי נשמור:

```text
who/what changed configuration
when
old value
new value
version
```

---

# ‏157. Manual Intervention

‏אם אדם מבטל Order ידנית בפלטפורמת הברוקר, המערכת צריכה לזהות את השינוי דרך events/reconciliation.

---

# ‏158. External State Change

‏גם Position יכולה להשתנות מחוץ לאפליקציה.

‏לכן local ownership אינו מוחלט.

---

# ‏159. External Change Policy

‏כשמזהים שינוי חיצוני:

```text
pause affected symbol
reconcile
record reason
require safe state before resume
```

---

# ‏160. Multiple Clients

‏אם כמה clients מחוברים לאותו account, צריך להבין שה־state משותף ועלול להשתנות מחוץ לתהליך שלנו.

---

# ‏161. Account Isolation

‏למערכת אישית עדיף, אם אפשר תפעולית, לצמצם ambiguity בין פעילות אוטומטית לפעילות אחרת.

---

# ‏162. Trading Calendar

‏Broker Adapter אינו תחליף ל־Market Calendar service, אבל הוא יכול לדווח rejects או session constraints.

---

# ‏163. Session State

‏Execution Engine צריך לקבל market/session state ממקור מוסמך ולא לנחש רק לפי שעון מקומי.

---

# ‏164. Clock Synchronization

‏למדדי latency של מאות מילישניות, clocks לא מסונכרנים יכולים להטעות.

---

# ‏165. Monotonic Clock

‏למדידת durations פנימיים עדיף clock monotonic, בעוד timestamps עסקיים נשמרים גם כ־wall-clock.

---

# ‏166. `sentAt` מול `brokerTime`

‏לא מערבבים ביניהם בלי מודל ברור.

---

# ‏167. Sequence Numbers

‏אם ה־API מספק sequence/order information, Adapter יכול לנצל אותה כדי לזהות gaps.

---

# ‏168. Gap Detection

‏אם חסר event range, המערכת עוברת ל־reconciliation במקום להמשיך בביטחון שגוי.

---

# ‏169. PnL Source

‏למחקר שלנו עדיף לחשב PnL מתוך Fill Ledger canonical.

‏Broker-reported PnL יכול לשמש reconciliation נוסף.

---

# ‏170. Fees

‏אם Fees מגיעות מאוחר יותר מה־Fill, המודל צריך לאפשר enrichment מאוחר.

---

# ‏171. Eventual Consistency

‏חלק מהמידע החיצוני עשוי להתעדכן לא מיד.

‏לכן state צריך לדעת להבדיל בין:

```text
confirmed
provisional
unknown
```

---

# ‏172. Trade Lifecycle Record

‏לכל Trade נשמור:

```text
signalId
tradeIntentId
entryOrderIds
entryFills
positionQty
exitOrderIds
exitFills
grossPnl
fees
netPnl
finalState
```

---

# ‏173. Broker-neutral Trade Lifecycle

‏אותו record צריך לעבוד ב־Replay, Paper ו־Live.

---

# ‏174. Execution Policy Snapshot

‏לכל order נשמור את policy בזמן ההחלטה:

```text
urgency
maxPrice
TTL
replacePolicy
exitReason
```

---

# ‏175. Why זה חשוב ל־RCA

‏בלי snapshot לא נדע אם הביצוע עקב אחרי המדיניות שהייתה אז.

---

# ‏176. `Decision → Intent → Order → Fill`

‏אלה ארבע ישויות שונות.

‏אסור לאחד אותן לשורה אחת בבסיס הנתונים.

---

# ‏177. Trade State Machine

```text
FLAT
→ ENTRY_INTENT
→ ENTRY_WORKING
→ PARTIALLY_LONG
→ LONG
→ EXIT_INTENT
→ EXIT_WORKING
→ FLAT
```

‏עם מצבי Error/Unknown ביניהם.

---

# ‏178. Partial Position State

‏`PARTIALLY_LONG` אינו חריג — הוא state אמיתי.

---

# ‏179. Exit Quantity

‏Exit תמיד צריך להתבסס על Position אמיתי/מאומת, לא רק על quantity המקורי שביקשנו לקנות.

---

# ‏180. Oversell Protection

‏לפני Exit נוסף צריך לקחת בחשבון:

```text
current position
working exit quantity
unknown exit orders
```

---

# ‏181. Close Intent Deduplication

‏שני triggers שונים יכולים לבקש Exit באותו זמן.

‏לדוגמה:

```text
TIME_STOP
SIGNAL_DEATH
```

‏צריך לאחד אותם ל־workflow אחד ולא לשלוח שתי פקודות Sell מלאות.

---

# ‏182. Reason Priority

‏אפשר לשמור:

```text
firstExitTrigger
highestPriorityExitReason
```

‏גם אם כמה תנאים הופעלו.

---

# ‏183. Broker Adapter אינו Risk Engine

‏ה־Adapter יכול לדווח מגבלות חיצוניות, אבל הוא לא המקום להחליט אסטרטגית כמה לסכן.

---

# ‏184. Broker Reject אינו Risk Control

‏אסור לסמוך על כך שהברוקר “יעצור אותנו” במקום Risk Engine פנימי.

---

# ‏185. Defense in Depth

‏מערכת טובה כוללת כמה שכבות:

```text
Strategy gate
Risk gate
Execution validation
Broker validation
Post-trade reconciliation
```

---

# ‏186. בדיקות לפני Submit

‏לפחות:

- ‏system state מאפשר Entry?
- ‏data fresh?
- ‏signal alive?
- ‏risk approved?
- ‏quantity valid?
- ‏price valid?
- ‏broker ready?
- ‏no conflicting order?

---

# ‏187. בדיקות אחרי Submit

- ‏ACK התקבל?
- ‏broker ID mapped?
- ‏state עקבי?
- ‏TTL עדיין תקף?

---

# ‏188. בדיקות אחרי Fill

- ‏Fill deduplicated?
- ‏Position updated?
- ‏Risk exposure updated?
- ‏Exit management armed?

---

# ‏189. בדיקות אחרי Cancel

- ‏Cancel confirmed?
- ‏האם היה Fill נוסף בדרך?
- ‏remaining quantity נכון?

---

# ‏190. בדיקות אחרי Reconnect

- ‏Orders synced?
- ‏Fills synced?
- ‏Positions synced?
- ‏unknown states resolved?
- ‏Risk Engine agrees?

---

# ‏191. Best Practice — Stable Internal Contract

‏ה־Broker Adapter יכול להשתנות, אבל ה־Strategy contract צריך להשתנות מעט ככל האפשר.

---

# ‏192. Best Practice — Raw + Canonical Events

‏שמור canonical event לשימוש המערכת, ו־raw metadata לצורך debugging לפי הצורך.

---

# ‏193. Best Practice — Persist Before Forgetting

‏אירוע Fill משמעותי צריך להיכנס ל־durable state לפני שהמערכת מתקדמת רחוק מדי.

---

# ‏194. Best Practice — Reconcile Often Enough

‏לא להסתמך רק על callbacks לנצח.

---

# ‏195. Best Practice — Explicit Unknown

‏`UNKNOWN` עדיף על state שקרי שנראה “נקי”.

---

# ‏196. Best Practice — One Canonical Position Model

‏UI, Risk ו־Execution צריכים להסתכל על אותה Position truth, לא לחשב כל אחד בנפרד.

---

# ‏197. Best Practice — Version Everything Critical

- ‏Adapter.
- ‏Execution policy.
- ‏Risk config.
- ‏Capability map.
- ‏Canonical schema.

---

# ‏198. Anti-pattern — Fire-and-Forget Orders

‏שליחת Order בלי lifecycle tracking היא טעות יסודית.

---

# ‏199. Anti-pattern — Retry on Timeout Blindly

‏יכול ליצור duplicate orders.

---

# ‏200. Anti-pattern — Position from Intended Quantity

‏Position מגיע מ־Fills/Broker truth.

---

# ‏201. Anti-pattern — `isConnected` כ־Health

‏חיבור socket אינו הוכחה למערכת בריאה.

---

# ‏202. Anti-pattern — Broker SDK Objects בכל הקוד

‏זה הופך migration/testing לקשים מאוד.

---

# ‏203. Anti-pattern — Swallow Broker Errors

‏כל reject/unknown צריך להיות observable.

---

# ‏204. Anti-pattern — Magic Retries

‏Retry count ו־delay צריכים להיות policy מפורשת ותלויה ב־error category.

---

# ‏205. Anti-pattern — Resume Trading Immediately After Reconnect

‏קודם sync ו־reconciliation.

---

# ‏206. Anti-pattern — Local Cache Wins

‏כאשר יש conflict ב־actual execution state, הברוקר הוא מקור האמת.

---

# ‏207. Anti-pattern — Silent Capability Downgrade

‏אין להחליף semantics בלי שה־Execution Engine יודע.

---

# ‏208. Anti-pattern — One Giant Broker Service

‏שירות אחד שמטפל ב־Strategy, Risk, Broker, PnL ו־UI ייצור coupling וקושי בבדיקה.

---

# ‏209. Practitioner Subtlety — ACK latency יכולה להיות Signal תפעולי

‏אם `submit_to_ack` מתדרדר, גם אם שום request עוד לא נכשל, איכות הביצוע עלולה להיפגע.

---

# ‏210. Practitioner Subtlety — Unknown state מסוכן יותר מ־Reject

‏Reject ברור: העסקה לא התקבלה.

‏Unknown משאיר ambiguity של Exposure.

---

# ‏211. Practitioner Subtlety — Duplicate events הם נורמליים במערכות מבוזרות

‏המערכת צריכה להיות tolerant להם, לא להיות מופתעת מהם.

---

# ‏212. Practitioner Subtlety — Reconciliation הוא feature, לא patch

‏הוא חלק מהארכיטקטורה מהיום הראשון.

---

# ‏213. Practitioner Subtlety — Order lifecycle משפיע על Alpha

‏אם Strategy מחזיקה 20 שניות, עוד 700ms ב־submit/replace יכולים להיות חלק משמעותי מה־holding horizon.

---

# ‏214. Practitioner Subtlety — Broker abstraction לא חייב למחוק את כל ההבדלים

‏Abstraction טוב חושף common contract וגם capabilities ספציפיות בצורה מפורשת.

---

# ‏215. Practitioner Subtlety — “Portable” אינו “identical behavior”

‏אותו Intent אצל שני ברוקרים עשוי לקבל execution behavior שונה.

---

# ‏216. Practitioner Subtlety — Paper Adapter אינו הוכחה ל־Live Adapter

‏ה־contracts יכולים להיות זהים, אבל latency, fills ו־reject semantics עדיין צריכים calibration.

---

# ‏217. Practitioner Subtlety — Broker UI יכול לעזור ב־RCA

‏אבל המערכת לא אמורה להיות תלויה ב־UI כדי לדעת state בסיסי.

---

# ‏218. Practitioner Subtlety — Broker API הוא Distributed System

‏צריך לחשוב במושגים של:

```text
partial failure
retries
idempotency
ordering
consistency
reconciliation
```

‏ולא רק REST/WebSocket syntax.

---

# ‏219. התאמה לרובוט שלך

‏הרובוט שלנו:

- ‏סורק כמעט את כל השוק.
- ‏בוחר Top Candidate.
- ‏מצפה ל־Edge בטווח שניות.
- ‏עשוי להחליף מועמד מהר.

‏לכן Broker path חייב להיות קצר, מדיד ודטרמיניסטי ככל האפשר.

---

# ‏220. מסלול בסיס מומלץ למחקר שלנו

```text
Scanner Decision
→ Risk Approval
→ Execution Intent
→ Pre-submit recheck
→ Broker Adapter Submit
→ ACK tracking
→ Fill tracking
→ Position reconciliation
→ Exit lifecycle
```

---

# ‏221. `Pre-submit Recheck`

‏ממש לפני Submit:

```text
candidate still valid?
rank still acceptable?
price still inside budget?
data still fresh?
risk still valid?
broker healthy?
```

---

# ‏222. `Pre-fill Awareness`

‏בזמן שה־Order עובד, המערכת ממשיכה לעקוב אחרי:

```text
signal age
rank decay
price escape
spread expansion
```

‏כדי להחליט אם Cancel נדרש.

---

# ‏223. `Rank at Submit`

‏נשמור:

```text
rankAtSignal
rankAtRiskApproval
rankAtSubmit
rankAtFirstFill
```

---

# ‏224. למה זה קריטי

‏אם Rank #1 נהיה Rank #47 לפני Fill, ייתכן שהבעיה אינה ב־Scanner אלא בזמן הביצוע.

---

# ‏225. Execution Deadline

‏לכל Intent קצר־טווח צריך deadline.

‏Order שהגיע מאוחר מדי אינו “עדיין אותה הזדמנות”.

---

# ‏226. No Infinite Queueing

‏אם Broker path congested, עדיף לפספס Intent מאשר לבצע אותו אחרי שפג.

---

# ‏227. No Infinite Repricing

‏Cancel/Replace צריך להיות מוגבל ב־TTL וב־Price Budget.

---

# ‏228. Safety over FOMO

‏אם state לא ברור, לא רודפים אחרי השוק כדי “להספיק”.

---

# ‏229. Metrics לרובוט שלנו

```text
intent_to_submit_ms
submit_to_ack_ms
ack_to_fill_ms
signal_to_fill_ms
rank_decay_to_fill
unknown_state_count
reconnect_count
position_mismatch_count
late_intent_drop_count
```

---

# ‏230. Broker-path Edge Budget

‏אפשר לחשוב על:

```text
Expected Net Edge
- execution deterioration caused by broker path
```

‏אם נשאר מעט מדי Edge, ה־Trade אינו מספיק robust.

---

# ‏231. Baseline Architecture

```text
Scanner
  ↓
Decision Engine
  ↓
Risk Engine
  ↓
Execution Engine
  ↓
Canonical Broker Interface
  ↓
Broker Adapter
  ↓
External Broker API
```

‏ובחזרה:

```text
Broker Events
  ↓
Broker Adapter
  ↓
Canonical Event Bus
  ↓
Order State Machine
  ↓
Position / Risk / Execution
```

---

# ‏232. Persistent Components

```text
Intent Store
Order Event Store
Fill Ledger
Position Snapshot
Reconciliation Log
Risk State
```

---

# ‏233. Observability Components

```text
Metrics
Structured Logs
Traces
Alerts
Incident Packages
```

---

# ‏234. Test Components

```text
Mock Broker
Stateful Fake Broker
Paper Adapter
Replay Adapter
Conformance Suite
Fault Injection
Golden Scenarios
```

---

# ‏235. שלבי Implementation עתידיים

‏סדר פשוט:

1. ‏Canonical models.
2. ‏Broker interface.
3. ‏Paper/Fake adapter.
4. ‏Order state machine.
5. ‏Fill ledger.
6. ‏Position reconciliation.
7. ‏Health/reconnect.
8. ‏Live adapter.
9. ‏Conformance suite.
10. ‏Fault injection.

---

# ‏236. לא להתחיל מ־SDK

‏טעות נפוצה:

```text
install broker SDK
then design architecture around it
```

‏עדיף:

```text
define internal contract
then adapt SDK to contract
```

---

# ‏237. API-specific details יבואו בפרק הבא

‏בשלב הזה בנינו architecture כללית.

‏בשלב 30 נרד ל־IBKR/IBKR Israel ונבדוק בפועל:

- ‏איזה APIs קיימים.
- ‏איך session/connectivity עובדים.
- ‏Order IDs.
- ‏callbacks/events.
- ‏market data constraints.
- ‏paper/live differences.
- ‏rate limits / pacing.
- ‏order support.
- ‏reconnect/recovery behavior.

‏שם נצטרך לאמת מידע עדכני מול המקורות הרשמיים.

---

# ‏238. Checklist — Architecture

- ‏Strategy לא מכירה SDK של Broker.
- ‏Risk Engine עצמאי.
- ‏Execution Engine עצמאי.
- ‏Broker Adapter מבודד.
- ‏Canonical order/event models קיימים.
- ‏Client Order ID קיים.
- ‏Broker ID mapping קיים.

---

# ‏239. Checklist — Reliability

- ‏Idempotency קיימת.
- ‏Duplicate events לא משנים state פעמיים.
- ‏Unknown state מפורש.
- ‏Reconnect מחייב Sync.
- ‏Reconciliation קיים.
- ‏Position truth נבדק מול הברוקר.

---

# ‏240. Checklist — Safety

- ‏Fail Closed.
- ‏`EXIT_ONLY` נתמך.
- ‏Entries חסומים כשהברוקר לא Ready.
- ‏Working orders נספרים ב־Exposure.
- ‏Oversell protection קיים.
- ‏Live environment דורש opt-in מפורש.

---

# ‏241. Checklist — Observability

- ‏Order lifecycle מלא בלוג.
- ‏Raw broker codes נשמרים.
- ‏Latency percentiles קיימים.
- ‏Reconciliation mismatches נמדדים.
- ‏Unknown states מייצרים Alert.
- ‏Trace מחבר Signal עד Fill.

---

# ‏242. Checklist — Testing

- ‏Happy Path.
- ‏Reject.
- ‏Partial Fill.
- ‏Cancel/Fill race.
- ‏Timeout with unknown effect.
- ‏Duplicate callback.
- ‏Disconnect after submit.
- ‏Reconnect with open order.
- ‏Restart with open position.
- ‏Rate limit.
- ‏External/manual state change.

---

# ‏243. שאלת השליטה

‏אם עכשיו החיבור לברוקר נופל מיד אחרי Submit, האם המערכת יודעת לענות על כל השאלות הבאות?

```text
Did an order exist?
Was it filled?
How much was filled?
What position do we actually own?
Is another entry safe?
What must happen before ACTIVE resumes?
```

‏אם לא — שכבת Broker עדיין אינה production-ready.

---

# ‏244. מה צריך לזכור בעל פה

1. ‏`Intent != Order != Fill != Position`.
2. ‏ACK אינו Fill.
3. ‏Timeout אינו Reject.
4. ‏Unknown הוא state אמיתי.
5. ‏Broker הוא source of truth לביצוע בפועל.
6. ‏Reconciliation הוא חלק מהארכיטקטורה.
7. ‏Retry ללא idempotency מסוכן.
8. ‏Reconnect אינו Ready.
9. ‏Strategy לא תלויה ב־Broker SDK.
10. ‏במסחר של שניות גם latency תפעולי הוא חלק מה־Edge.

---

# ‏245. סיכום

‏חיבור לברוקר הוא לא פונקציה ששולחת Buy/Sell. הוא מערכת מבוזרת קטנה שצריכה להתמודד עם ambiguity, retries, duplicate events, partial fills, reconnects ו־state drift.

‏הארכיטקטורה המקצועית מפרידה:

```text
Strategy
Risk
Execution
Broker Adapter
```

‏ומחזיקה שני סוגי אמת במקביל:

```text
Application Intent Truth
Broker Execution Truth
```

‏החיבור ביניהם נעשה באמצעות:

```text
State Machine
Idempotency
Event Ledger
Reconciliation
Observability
```

‏זו התשתית שעליה אפשר אחר כך לחבר Broker אמיתי בלי לזהם את כל שאר המערכת בפרטים שלו.

---

# ‏השלב הבא

‏שלב 30 ירד מהארכיטקטורה הכללית לפרטים המעשיים של `IBKR` / `IBKR Israel`: APIs זמינים, session/connectivity, order lifecycle, pacing/rate constraints, market-data behavior, paper/live differences, reconnect ו־capabilities — תוך אימות מול מקורות רשמיים ועדכניים.
