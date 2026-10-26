# ‏שלב 30 — `IBKR / IBKR Israel` לעומק: API, Sessions, Market Data, Orders ו־Recovery

> ‏מטרת הפרק: להבין כיצד שכבת הברוקר שבנינו בשלב 29 מתממשת בפועל מול `Interactive Brokers`, אילו מסלולי API קיימים, מהן מגבלות ה־session וה־market data, איך מנהלים Orders/Fills/Reconnect בצורה אמינה, ומה המשמעות עבור רובוט שסורק אלפי מניות ומחזיק פוזיציות שניות בודדות ועד בערך דקה.
>
> ‏העיקרון המרכזי: **`IBKR` הוא Execution Broker חזק, אבל אסור לעצב את כל המערכת סביב ההנחה שהוא גם מקור הנתונים האידאלי לכל משימה.** את התאמת ה־Market Data ואת התאמת ה־Execution צריך למדוד בנפרד.
>
> ‏הערת עדכניות: פרטי API, pacing, session behavior, market-data entitlements ויכולות Paper/Live משתנים. המספרים בפרק זה משקפים את התיעוד הרשמי שנבדק באוקטובר 2026; לפני Production צריך לאמת אותם שוב מול התיעוד הרשמי והחשבון הספציפי.

---

# ‏1. קודם כל: מה בדיוק הוא `IBKR` בתוך הארכיטקטורה שלנו?

‏במערכת שלנו `IBKR` אינו ה־Strategy.

‏הוא גם אינו ה־Scanner.

‏הוא ספק יכולות.

```text
Strategy
   ↓
Risk Engine
   ↓
Execution Engine
   ↓
Broker Adapter
   ↓
IBKR
```

‏במקביל יכול להיות:

```text
External Market Data Provider
   ↓
Market Data Adapter
   ↓
Scanner / Features / Ranking
```

‏כלומר:

> ‏אפשר להשתמש ב־`IBKR` לביצוע פקודות גם אם נתוני הסריקה מגיעים מספק אחר.

---

# ‏2. למה ההפרדה הזאת חשובה במיוחד לרובוט שלנו?

‏הרובוט שלנו רוצה:

- ‏Universe של אלפי מניות.
- ‏עדכון תכוף.
- ‏Ranking cross-sectional.
- ‏תגובה מהירה.
- ‏Entry/Exit קצרים מאוד.

‏אלו צרכים שונים מהצורך:

> ‏“שלח BUY על מניה אחת ועקוב אחרי ה־Fill.”

‏לכן לא שואלים:

> ‏“האם `IBKR API` טוב?”

‏שואלים:

```text
Is IBKR suitable for execution?
Is IBKR suitable for whole-market discovery?
Is IBKR suitable for deep data on Top-N candidates?
```

‏אלה שלוש שאלות שונות.

---

# ‏3. שלושת מסלולי ה־API העיקריים שצריך להכיר

‏לצורך הקורס נפריד בין:

1. ‏`TWS API`.
2. ‏`Web API`.
3. ‏`FIX` / פתרונות מוסדיים.

‏לרובוט אישי, שני הראשונים הם הרלוונטיים ביותר למחקר.

---

# ‏4. `TWS API`

‏`TWS API` הוא API מבוסס socket שמתחבר אל:

- ‏`Trader Workstation (TWS)`.
- ‏או `IB Gateway`.

‏התהליך הוא בערך:

```text
Our Process
   ↓ TCP socket
TWS / IB Gateway
   ↓
IBKR backend
```

‏ה־API הרשמי כולל תמיכה בין היתר ב־:

- ‏`C#`.
- ‏Java.
- ‏Python.
- ‏C++.
- ‏Visual Basic.

‏מבחינתנו `C#` הוא מסלול טבעי במיוחד.

---

# ‏5. `IB Gateway`

‏`IB Gateway` נועד בעיקר לחיבורי API ואינו סביבת מסחר מלאה כמו `TWS`.

‏מבחינת ה־API, התיעוד הרשמי מתאר את `TWS` ואת `IB Gateway` כדומים מאוד ביכולות החיבור.

‏היתרון המעשי של Gateway הוא שהוא קל יותר מבחינת UI/resources וממוקד בחיבור.

---

# ‏6. אבל `IB Gateway` אינו daemon headless מושלם

‏טעות נפוצה:

> ‏“Gateway = שירות שרת בלי UI ובלי Authentication.”

‏לא.

‏התיעוד הרשמי מציין ש־`TWS` ו־`IB Gateway` מתוכננים עם UI לצורך credentials/authentication, ולכן headless/GUI-less operation אינו נתמך באופן רשמי בצורה של daemon חסר ממשק לחלוטין.

‏זה חשוב מאוד לתכנון Production.

---

# ‏7. Auto Restart אינו Authentication אינסופי

‏ל־`TWS` ול־`IB Gateway` קיימת יכולת restart אוטומטי.

‏אבל אין להסיק מזה:

> ‏“המערכת יכולה לרוץ לנצח בלי שאדם ייגע בה.”

‏התיעוד הרשמי מציין שיש מצבים שבהם נדרש authentication מחדש, ובפרט סביב מחזורי server reset שבועיים.

‏לכן צריך:

```text
Session Monitoring
+ Restart Detection
+ Reauthentication Runbook
```

---

# ‏8. `Web API`

‏המסלול השני הוא `IBKR Web API`.

‏הוא כולל:

- ‏HTTP endpoints.
- ‏WebSocket.
- ‏Market Data.
- ‏Orders.
- ‏Trades.
- ‏Account information.
- ‏Scanners.

‏ארכיטקטונית:

```text
Our App
  ↓ HTTPS / WebSocket
IBKR Web API session
  ↓
IBKR backend
```

---

# ‏9. `Web API` אינו רק REST

‏לנתונים חיים חשוב במיוחד ה־WebSocket.

‏התיעוד הרשמי מציג Topics כמו:

```text
smd = live market data
sbd = price ladder
sor = order updates
str = trades
sts = session status
```

‏כלומר מערכת Event-driven לא צריכה לבצע polling לכל דבר.

---

# ‏10. Session Model ב־Web API

‏זה נושא קריטי.

‏ב־Web API קיימת הבחנה בין:

- ‏Session בסיסי / read-only authentication context.
- ‏`Brokerage Session` שמאפשר functionality של `/iserver`.

‏לפעולות כמו:

- ‏Market Data.
- ‏Trading.
- ‏חלק גדול מפונקציות brokerage.

‏נדרש Brokerage Session פעיל.

---

# ‏11. Username אינו Account

‏ב־IBKR חשוב להפריד:

```text
Account
Username
Session
```

‏Username מקבל:

- ‏permissions.
- ‏market-data subscriptions.
- ‏גישה לחשבון/חשבונות.

‏ה־Account הוא מאגר הנכסים/הכסף.

‏אלה אינם אותו דבר.

---

# ‏12. כלל חשוב: Brokerage Session יחיד ל־Username

‏לפי התיעוד הרשמי של Web API:

> ‏Username יחיד יכול להחזיק Brokerage Session פעיל אחד בכל זמן נתון.

‏לכן Login במקום אחר יכול להיות אירוע תפעולי משמעותי.

‏לדוגמה:

```text
Robot Web API session
        ↓
User opens another trading platform
        ↓
Potential session competition/change
```

‏מכאן נולד requirement:

```text
SessionStatusMonitor
```

---

# ‏13. למה צריך username ייעודי לאוטומציה

‏כאשר broker/account configuration מאפשר זאת, הפרדה בין משתמש אנושי לבין משתמש אוטומציה יכולה להפחית התנגשות sessions.

‏אבל אין להניח ש־username נוסף הוא “חינם לחלוטין” מבחינת כל משאב.

‏בפרט Market Data subscriptions הן username-specific.

---

# ‏14. Market Data subscription שייכת ל־Username

‏זה אחד הדברים החשובים ביותר להבין.

‏אם Live username מחזיק subscription מסוים, אין להסיק אוטומטית שכל username אחר יקבל אותו.

‏גם Paper username עשוי להזדקק ל־subscription משלו או ל־sharing configuration בהתאם למה ש־IBKR מאפשרת.

---

# ‏15. Data ב־TWS לא בהכרח שווה Data ב־API

‏IBKR מזהירה מפורשות:

> ‏Data שניתן ללא תשלום בתוך `TWS` לא בהכרח מורשה לשימוש off-platform דרך API.

‏הסיבה היא רישוי Exchange.

‏לכן:

```text
I see the price in TWS
```

‏אינו מוכיח:

```text
My API is entitled to that live feed
```

---

# ‏16. Market Data Availability היא Feature שצריך לבדוק

‏אין להניח שכל symbol מחזיר תמיד Real-Time.

‏צריך לזהות מצב כמו:

```text
REALTIME
DELAYED
FROZEN
NOT_SUBSCRIBED
INCOMPLETE_AGREEMENT
```

‏ולשמור אותו כחלק מ־Data Quality.

---

# ‏17. ל־Web API יש pacing גלובלי

‏נכון לאוקטובר 2026, התיעוד הרשמי של Web API מציין מגבלה גלובלית של:

```text
10 requests / second / authenticated username
```

‏בנוסף קיימות מגבלות endpoint-specific.

---

# ‏18. `429` אינו “שגיאת רשת רגילה”

‏כאשר עוברים pacing limit, Web API יכול להחזיר:

```text
HTTP 429 Too Many Requests
```

‏לכן אסור לכתוב retry loop אגרסיבי שמיד שולח שוב.

‏צריך:

```text
RateLimiter
Backoff
RequestBudget
Telemetry
```

---

# ‏19. Endpoint pacing יכול להיות נמוך משמעותית

‏לדוגמה, בתיעוד העדכני קיימות מגבלות נפרדות על endpoints מסוימים של:

- ‏Orders.
- ‏Trades.
- ‏PnL.
- ‏Portfolio.
- ‏Historical data.
- ‏Scanner.

‏לכן global `10/s` אינו המספר היחיד שצריך להכיר.

---

# ‏20. דוגמה קריטית: Historical Data

‏נכון לאוקטובר 2026, התיעוד של `/iserver/marketdata/history` מציין:

```text
10 requests/sec
or
50 requests/minute
```

‏כלומר burst קצר אולי עובר, אבל קצב ממושך מוגבל יותר.

---

# ‏21. אל תבנה Collector שמגלה pacing באמצעות Errors

‏Anti-pattern:

```text
send as fast as possible
if 429:
    slow down
```

‏גישה מקצועית:

```text
Known limits
→ Token bucket / leaky bucket
→ Priority classes
→ Backpressure
```

---

# ‏22. Priorities ב־Request Budget

‏לא כל request חשוב באותה מידה.

‏לדוגמה:

```text
P0: order/risk/reconciliation
P1: active-position market data
P2: Top-N candidate validation
P3: broad scanner refresh
P4: analytics/history
```

‏כאשר budget מצטמצם, P4 צריך להיפגע לפני P0.

---

# ‏23. `TWS API` משתמש במודל pacing אחר

‏אין לקחת את מגבלת `10 requests/sec` של Web API ולהעתיק אותה ל־TWS API.

‏אלו APIs שונים.

‏לפי FAQ רשמי של IBKR, `TWS API` מציין מגבלת order rate של:

```text
50 orders / second
```

‏זה אינו אומר שכל סוג request אחר מוגבל בדיוק באותו מספר.

---

# ‏24. למה “50 orders/sec” כמעט לא רלוונטי לרובוט שלנו

‏אם רובוט אישי מגיע למצב שבו 50 orders בשנייה הוא bottleneck, כנראה שיש בעיה אחרת חמורה יותר.

‏לדוגמה:

- ‏Order churn.
- ‏Duplicate submission.
- ‏Cancel/Replace storm.
- ‏Bug בלולאה.

‏לכן אנחנו צריכים internal safety limit נמוך בהרבה מהתקרה הטכנית.

---

# ‏25. Broker Limit אינו Risk Limit

‏אם הברוקר מאפשר X requests אין פירוש הדבר שהמערכת צריכה להשתמש ב־X.

‏אנחנו מגדירים:

```text
broker_limit
system_limit
strategy_limit
risk_limit
```

‏וה־effective limit הוא המינימום ביניהם.

---

# ‏26. Market Data Lines

‏IBKR משתמשת במושג:

```text
Market Data Lines
```

‏הוא מגביל כמה subscriptions יכולים להיות פעילים במקביל עבור username.

‏הקצאה זו משותפת גם ל־TWS וגם ל־API תחת אותו user.

---

# ‏27. למה זה משנה ל־Universe של ~4,000 מניות

‏אם יש לנו אלפי symbols, אין להסיק שאפשר לעשות:

```text
reqMktData(symbol1)
reqMktData(symbol2)
...
reqMktData(symbol4000)
```

‏ולהחזיק את כולם כ־streams רציפים.

‏Market Data Lines הן מגבלה ארכיטקטונית אמיתית.

---

# ‏28. ברירת המחדל המתועדת

‏בתיעוד הנוכחי IBKR מתארת הקצאה בסיסית טיפוסית של 100 Market Data Lines למשתמש.

‏הכמות בפועל יכולה להשתנות בהתאם לחשבון ולהקצאה.

‏לכן בקוד לעולם לא נכתוב:

```text
MAX_MARKET_DATA_LINES = 100
```

‏כאמת נצחית.

---

# ‏29. Level II ו־Tick-by-Tick מוגבלים עוד יותר

‏Market Depth ו־Tick-by-Tick צורכים משאבים יקרים יותר.

‏IBKR מתעדת limits ייעודיים התלויים במספר Market Data Lines.

‏לכן אסטרטגיה שרוצה Depth לכל 4,000 symbols אינה design assumption סביר בלי לבדוק capacity אמיתי.

---

# ‏30. ארכיטקטורת Two-Stage Data

‏לרובוט שלנו מתאימה במיוחד ארכיטקטורה כמו:

```text
Stage 1 — Broad Market Scan
    ↓
Top 20 / Top 50
    ↓
Stage 2 — Deep Market Data
    ↓
Top 1 / Trade / No Trade
```

‏Broad scan יכול להגיע מספק שמתאים ל־whole-market ingestion.

‏Deep validation יכול להגיע מ־IBKR או ממקור נוסף.

---

# ‏31. `IBKR` כ־Execution Broker, לא בהכרח Scanner Feed

‏זו אינה ביקורת על IBKR.

‏פשוט לכל מערכת יש design target.

‏IBKR מצוינת לתחומים רבים של execution/account/order lifecycle.

‏Whole-market high-frequency discovery הוא workload אחר.

---

# ‏32. `Web API` Market Data Update Frequency

‏בתיעוד Web API העדכני, watchlist market data מתואר כנגזר מ־time-based snapshot interval.

‏עבור המוצרים המתועדים כרגע מופיעה תדירות של:

```text
500 ms
```

‏זה לא אותו דבר כמו raw exchange tick stream.

---

# ‏33. למה 500ms משנה לנו?

‏כאשר האסטרטגיה מחזיקה 5–60 שניות, 500ms אינו בהכרח “איטי מדי”.

‏אבל צריך לבדוק:

```text
signal half-life
rank churn
latency budget
```

‏אם Edge נעלם ב־200ms, feed של 500ms לא יכול להציל אותו.

---

# ‏34. WebSocket עדיף על Polling כשצריך stream

‏אם משתמשים ב־Web API ל־live market data, WebSocket מתאים יותר מ־HTTP polling תכוף.

‏אבל גם כאן קיימים limits ו־subscription lifecycle.

---

# ‏35. Market Data WebSocket דורש Renewal

‏התיעוד העדכני של `smd` מציין ש־stream אינו perpetual.

‏העמוד הנוכחי אומר:

```text
renew request after 10 minutes
stream termination after 15 minutes
```

‏כלומר subscriber חייב להיות lease-aware.

---

# ‏36. כשמסמכים רשמיים לא עקביים

‏ב־2026 הופיע גם changelog רשמי שתיאר termination לאחר 10 דקות.

‏כאשר שני מקורות רשמיים אינם לגמרי מסונכרנים, אסור “לבחור את המספר שנוח לנו”.

‏הגישה הנכונה:

```text
refresh conservatively before 10m
monitor stream health
re-subscribe idempotently
alert on stale data
```

---

# ‏37. Documentation Conflict הוא Risk Class

‏במערכת Production נשמור גם:

```text
ExternalDependencyAssumption
```

‏למשל:

```text
IBKR_WEBAPI_SMD_RENEWAL_BEFORE = 9m
source_checked_at = 2026-10-26
```

‏כך יודעים שזו assumption חיצונית שניתנת לשינוי.

---

# ‏38. `TWS API` ו־Market Data

‏ב־TWS API קיימים flows שונים ל־:

- ‏Streaming market data.
- ‏Snapshots.
- ‏Historical data.
- ‏Tick-by-tick.
- ‏Market depth.

‏לכל אחד semantics ו־limits שונים.

---

# ‏39. אל תערבב Tick Type עם Timestamp בלי להבין מקור

‏Callback יכול להגיע בזמן שונה מזמן האירוע בשוק.

‏צריך לשמור ככל האפשר:

```text
provider_event_time
provider_receive_time
our_receive_time
our_process_time
```

‏גם אם חלקם אינם זמינים בכל API.

---

# ‏40. `nextValidId`

‏ב־TWS API קיים concept של Order ID שמסופק דרך callback כגון `nextValidId`.

‏אסור להניח שה־Order ID מוכן מיד לאחר פתיחת socket.

‏זה callback-driven lifecycle.

---

# ‏41. Sleep אינו Synchronization Primitive

‏Anti-pattern:

```text
connect();
Thread.Sleep(1000);
PlaceOrder();
```

‏העובדה שזה “עובד במחשב שלי” אינה proof.

‏צריך state/await שמחכה לאירוע הנכון.

---

# ‏42. C# connection gate

‏רעיון ארכיטקטוני:

```csharp
public interface IBrokerSession
{
    Task WaitUntilReadyAsync(CancellationToken ct);
    BrokerSessionState State { get; }
}
```

‏`Ready` צריך לכלול יותר מ־TCP connected.

---

# ‏43. מה פירוש `Ready`?

‏לדוגמה:

```text
Socket connected
+ API handshake completed
+ account known
+ order-id allocator initialized
+ subscriptions available
+ reconciliation complete
+ risk state restored
```

‏רק אז מותר לעבור ל־Trading Ready.

---

# ‏44. Connection ≠ Trading Ready

‏זה כלל חשוב במיוחד ב־IBKR.

‏אפשר להיות:

```text
TCP_CONNECTED
```

‏אבל עדיין לא:

```text
SAFE_TO_TRADE
```

---

# ‏45. State Machine מומלץ

```text
DISCONNECTED
CONNECTING
AUTHENTICATING
CONNECTED_NOT_READY
RECONCILING
READY
DEGRADED
EXIT_ONLY
DISCONNECTING
```

---

# ‏46. `ClientId` ב־TWS API

‏TWS API משתמש ב־Client IDs לחיבורים.

‏המערכת צריכה להבין מי יצר Order ומי רשאי לצפות/לשנות אותו לפי semantics של IBKR.

‏לא משתמשים ב־ClientId “אקראי כל restart” בלי להבין את ההשלכות.

---

# ‏47. `PermId`

‏ב־IBKR קיימים מזהים נוספים מעבר ל־Order ID המקומי.

‏ל־reconciliation כדאי לשמור broker identifiers כמו `PermId` כאשר הם זמינים.

‏המטרה:

```text
OurIntentId
OurClientOrderId
IBOrderId
IBPermId
ExecutionId
```

‏ולא מזהה יחיד שמנסה לייצג הכול.

---

# ‏48. Order identity graph

```text
TradeIntentId
   ↓
ClientOrderId
   ↓
BrokerOrderId
   ↓
PermanentBrokerId
   ↓
ExecutionId(s)
```

‏Fill אחד אינו בהכרח Order אחד.

---

# ‏49. Callback Architecture

‏ב־TWS API מידע מגיע דרך callbacks.

‏לכן architecture טבעית היא:

```text
IB Callback
  ↓
Adapter translates
  ↓
Canonical Broker Event
  ↓
Execution State Machine
```

‏לא נותנים ל־Strategy לטפל ישירות ב־callback של IBKR.

---

# ‏50. Canonical Broker Events

‏לדוגמה:

```text
OrderAccepted
OrderWorking
OrderPartiallyFilled
OrderFilled
OrderCancelled
OrderRejected
ExecutionReported
CommissionReported
ConnectionLost
ConnectionRestored
```

---

# ‏51. Preserve Raw Payload

‏לצד canonical event כדאי לשמור גם raw broker payload/log reference.

‏למה?

‏כי בעת RCA ייתכן שה־normalization שלנו הסתיר פרט חשוב.

---

# ‏52. `openOrder` אינו Fill

‏אירוע שמראה Order קיים אינו הוכחה שהוא התמלא.

‏Likewise:

```text
Submitted != Filled
Acknowledged != Filled
Accepted != Filled
```

---

# ‏53. Fill הוא Event פיננסי אמיתי

‏רק Fill משנה בפועל exposure.

‏לכן:

```text
position += executed_quantity
```

‏ולא:

```text
position += requested_quantity
```

---

# ‏54. Partial Fill

‏אם ביקשנו 100 shares וקיבלנו 35:

```text
requested = 100
filled = 35
remaining = 65
actual position = 35
```

‏Risk Engine צריך לעבוד עם 35.

---

# ‏55. Commission יכול להגיע בנפרד

‏Execution ו־commission reporting יכולים להיות אירועים שונים.

‏לכן trade PnL סופי לא תמיד ידוע בדיוק ברגע ה־fill הראשון.

---

# ‏56. Reconciliation אחרי Connect

‏לא מתחילים לסחור מיד.

‏צריך לקבל מהברוקר לפחות את המציאות הרלוונטית של:

- ‏Open orders.
- ‏Executions/fills רלוונטיים.
- ‏Positions.
- ‏Account state.

‏ואז להשוות ל־local state.

---

# ‏57. Startup Reconciliation

‏Scenario:

```text
Yesterday process crashed
Order remained working at broker
Today app restarts
```

‏אם האפליקציה מניחה שאין Order — היא עלולה לשלוח duplicate.

---

# ‏58. Broker Wins on Execution Truth

‏כאשר המקומי אומר:

```text
Position = 0
```

‏והברוקר אומר:

```text
Position = 100
```

‏אסור פשוט “לתקן את הברוקר” בזיכרון המקומי.

‏צריך לעבור ל־recovery state ולהבין מה קרה.

---

# ‏59. Reconciliation Result

‏אפשר לסווג:

```text
MATCH
BROKER_AHEAD
LOCAL_AHEAD
UNKNOWN_ORDER
UNKNOWN_EXECUTION
POSITION_MISMATCH
```

---

# ‏60. `LOCAL_AHEAD` מסוכן במיוחד

‏אם המקומי חושב שהיה Fill אבל הברוקר לא מכיר אותו, אסור להסיק אוטומטית שהברוקר טועה.

‏זה יכול להיות bug ב־state שלנו.

---

# ‏61. `BROKER_AHEAD`

‏הברוקר עשוי לדעת על Fill שהאפליקציה פספסה בזמן disconnect.

‏לכן reconnect חייב לכלול retrieval של state ולא רק resubscribe.

---

# ‏62. Network Partition

‏Scenario:

```text
PlaceOrder sent
network breaks
no response
```

‏המצב אינו:

```text
ORDER_FAILED
```

‏המצב הוא:

```text
ORDER_EFFECT_UNKNOWN
```

---

# ‏63. Never Blind Retry an Unknown Order

‏אם לא יודעים אם Order התקבל, retry עיוור יכול לייצר duplicate exposure.

‏קודם:

```text
reconcile
identify existing order
then decide
```

---

# ‏64. Idempotency מעל API שאינו idempotent בשבילך

‏גם אם broker API אינו נותן בדיוק primitive של idempotency כפי שהיינו רוצים, האפליקציה יכולה לבנות שכבה משל עצמה סביב Intent IDs, persistent state ו־reconciliation.

---

# ‏65. Persistent Order Journal

‏לפני side effect חשוב לשמור intent.

```text
IntentCreated
OrderSubmissionAttempted
BrokerAcknowledged
FillReceived
```

‏כך restart אינו מוחק את ההיסטוריה.

---

# ‏66. Outbox Pattern

‏אפשר לחשוב על Order submission כעל external side effect.

‏דפוס שימושי:

```text
transactionally persist intent
→ dispatcher submits
→ result persisted
```

‏המטרה אינה “Enterprise architecture” לשמה.

‏המטרה היא recovery.

---

# ‏67. Read-Only API Mode

‏ב־TWS קיימת setting של Read-Only API.

‏במצב זה פקודות API חסומות.

‏זה יכול להיות שימושי מאוד בשלבי:

```text
development
shadow
diagnostics
```

---

# ‏68. אל תבטל Precautions אוטומטית

‏TWS כולל precautionary checks.

‏קיימת אפשרות לעקוף חלק מהן עבור API Orders.

‏אבל זו אינה “הגדרת ביצועים”.

‏זו החלטת Risk/Operations שצריכה להיות מפורשת ומאומתת בסביבת Paper לפני Live.

---

# ‏69. `Transmit=false`

‏ב־TWS Order יכול להיווצר אבל לא להישלח אם `Transmit` אינו מופעל.

‏לכן:

```text
Order visible in TWS
```

‏אינו בהכרח:

```text
Order transmitted to IBKR
```

---

# ‏70. Order State חייב לכלול Transmission State

‏מומלץ להבדיל בין:

```text
LOCAL_INTENT
STAGED_AT_TWS
TRANSMITTED
ACKNOWLEDGED
WORKING
PARTIAL
FILLED
```

---

# ‏71. `Paper Trading`

‏IBKR מאפשרת שימוש ב־TWS API וב־Web API גם בחשבון Paper.

‏זה מצוין לבדיקת:

- ‏Connectivity.
- ‏Order lifecycle.
- ‏Callbacks.
- ‏State machine.
- ‏Error handling.

‏אבל לא להוכחת execution realism מלאה.

---

# ‏72. Paper אינו Exchange

‏IBKR מציינת שה־Paper environment הוא simulator ללא execution/clearing אמיתי.

‏לכן Fill ב־Paper אינו ראיה שהיינו מקבלים אותו Fill בשוק חי.

---

# ‏73. Top-of-book Simulation

‏התיעוד הרשמי מציין Paper fills שמבוססים על top-of-book ולא על deep book אמיתי.

‏עבור אסטרטגיה של שניות זה הבדל מהותי.

---

# ‏74. Paper Order Types אינם זהים ל־Live

‏יש Order Types שאינם נתמכים או מתנהגים אחרת ב־Paper.

‏לכן Capability Matrix חייבת להיות environment-specific.

```text
capability(orderType, PAPER)
capability(orderType, LIVE)
```

---

# ‏75. Stop behavior ב־Paper

‏IBKR מציינת ש־Stops ופקודות מורכבות מסוימות מסומלצים בסביבת Paper.

‏לכן אין להשתמש בתוצאת Paper למדידת microstructure accuracy.

---

# ‏76. Paper כן מעולה ל־Operational Testing

‏למרות המגבלות:

‏Paper מצוין לבדיקת:

- ‏Order mapping.
- ‏Parent/child relationships.
- ‏Cancel logic.
- ‏Partial state logic.
- ‏Reconnect.
- ‏Persistence.
- ‏Dashboard.
- ‏Risk gating.

---

# ‏77. Paper Acceptance Criteria

‏לדוגמה:

```text
No duplicate orders
No negative unintended position
Every fill reconciled
Every restart recovers state
Every exit uses actual filled quantity
No stale intent submitted
```

---

# ‏78. `Shadow + Paper` במקביל

‏אפשר להריץ:

```text
Live market data
→ Shadow Strategy
→ Paper Broker
```

‏ולשמור במקביל:

```text
Expected execution
Paper execution
```

‏כדי למדוד פער.

---

# ‏79. `TWS API` מול `Web API` — אין מנצח מוחלט

‏השאלה אינה:

> ‏“איזה API יותר טוב?”

‏אלא:

> ‏“איזה API מתאים יותר ל־requirements שלנו?”

---

# ‏80. יתרונות מבניים של `TWS API`

‏עבור מערכת C# אישית:

- ‏SDK רשמי ל־C#.
- ‏Socket/event model טבעי.
- ‏גישה עשירה לפונקציונליות TWS.
- ‏מתאים ל־long-running desktop/server-like process עם Gateway.

---

# ‏81. חסרונות מבניים של `TWS API`

- ‏תלות ב־TWS/Gateway process.
- ‏Lifecycle של login/restart.
- ‏Callback-heavy API.
- ‏Need for careful concurrency/state management.
- ‏Market Data Lines עדיין מגבילות broad streaming.

---

# ‏82. יתרונות מבניים של `Web API`

- ‏HTTP + WebSocket מודרניים.
- ‏קל יותר לאינטגרציה בשירותים קיימים.
- ‏Resource-oriented endpoints.
- ‏Order/market data/account interfaces באותו ecosystem.

---

# ‏83. חסרונות מבניים של `Web API`

- ‏Brokerage-session semantics.
- ‏Global pacing של requests.
- ‏Endpoint-specific pacing.
- ‏Streaming subscription lifecycle.
- ‏Session competition per username.

---

# ‏84. הבחירה לרובוט שלנו צריכה להיות Benchmark

‏ניצור POC לשני המסלולים אם צריך.

‏נמדוד:

```text
connect stability
order latency
callback latency
recovery complexity
market-data fit
operational burden
```

‏לא נבחר לפי syntax.

---

# ‏85. ה־C# Adapter שלנו

```csharp
public interface IExecutionBroker
{
    Task<BrokerOrderReceipt> SubmitAsync(
        OrderIntent intent,
        CancellationToken cancellationToken);

    Task CancelAsync(
        BrokerOrderKey order,
        CancellationToken cancellationToken);

    IAsyncEnumerable<BrokerEvent> Events(
        CancellationToken cancellationToken);

    Task<BrokerSnapshot> ReconcileAsync(
        CancellationToken cancellationToken);
}
```

---

# ‏86. למה אין `BuyAsync()`?

‏כי `Buy` הוא abstraction נמוך מדי.

‏אנחנו רוצים Order Intent שמכיל:

```text
symbol
side
quantity
order type
limit
TIF
urgency
signal id
strategy version
risk approval id
expiry
```

---

# ‏87. IBKR-specific Adapter

```text
IbkrExecutionBroker
```

‏אחראי לתרגם:

```text
Canonical OrderIntent
↔
IBKR Contract + Order
```

‏ולא יותר.

---

# ‏88. Contract Resolution

‏Symbol לבדו לא תמיד מספיק לזיהוי מכשיר.

‏צריך לזהות contract חד־משמעי.

‏נשמור broker-specific identifiers כמו `conId` לצד ה־canonical instrument id שלנו.

---

# ‏89. Instrument Mapping Table

```text
CanonicalInstrumentId
Symbol
SecurityType
Currency
PrimaryExchange
IBKRConId
ValidFrom
ValidTo
```

‏זה מגן משינויים ועמימות symbols.

---

# ‏90. Contract Discovery אינו Hot Path

‏לא נכון לפתור contract מחדש בכל order.

‏מומלץ:

```text
resolve/cache universe ahead of time
validate periodically
```

---

# ‏91. אבל Cache יכול להתיישן

‏Corporate actions, listing changes ו־symbol changes יכולים לשנות metadata.

‏לכן mapping צריך version/refresh policy.

---

# ‏92. Pre-Trade Broker Capability Check

‏לפני Order:

```text
session ready?
contract resolved?
market open/allowed?
permission available?
order type supported?
quantity valid?
```

---

# ‏93. Broker Reject הוא Data

‏לא מסתירים reject בתוך Exception כללית.

‏נשמור:

```text
broker error code
broker text
normalized category
intent id
order id
snapshot
```

---

# ‏94. Reject Taxonomy

```text
INVALID_CONTRACT
NO_PERMISSION
INVALID_PRICE
INVALID_SIZE
SESSION_NOT_READY
RISK/PRECAUTION
RATE_LIMIT
MARKET_STATE
UNKNOWN
```

---

# ‏95. Warning אינו Error

‏IBKR יכולה להחזיר warnings/informational messages לצד state changes.

‏ה־Adapter צריך להבחין בין:

```text
INFO
WARNING
RECOVERABLE_ERROR
ORDER_REJECT
SESSION_FATAL
```

---

# ‏96. Logging של IBKR

‏ל־TWS/Gateway קיימים API logs וכלי diagnostics.

‏ב־incident חשוב לשמור גם:

- ‏Our structured logs.
- ‏TWS/API logs.
- ‏Replay slice.
- ‏Broker snapshot.

---

# ‏97. “It happened at IBKR” אינו RCA

‏צריך לדעת:

```text
what we sent
when we sent it
what TWS/Gateway received
what IBKR acknowledged
what executions arrived
what our state machine inferred
```

---

# ‏98. Request Correlation

‏כל פעולה חיצונית צריכה correlation:

```text
trace_id
intent_id
order_id
broker_order_id
```

---

# ‏99. Latency Breakdown מול IBKR

‏נמדוד:

```text
t_signal
t_risk_approved
t_submit_called
t_broker_ack
t_first_fill
t_last_fill
```

‏ומכאן:

```text
app_decision_latency
broker_ack_latency
time_to_first_fill
time_to_complete_fill
```

---

# ‏100. Local Clock Discipline

‏מדידות latency דורשות clock עקבי.

‏ל־durations נעדיף monotonic clock בתוך process.

‏ל־cross-system timestamps נשמור UTC ו־source timestamp.

---

# ‏101. Reconnect אינו Exception Handler

‏Reconnect הוא workflow.

```text
detect disconnect
→ freeze new entries
→ reconnect
→ reauthenticate if needed
→ restore subscriptions
→ reconcile broker state
→ verify risk
→ resume
```

---

# ‏102. בזמן Disconnect

‏ברירת מחדל בטוחה למחקר Production:

```text
no new entries
```

‏אבל אם קיימת Position, צריך policy נפרדת ל־exit/recovery.

---

# ‏103. `EXIT_ONLY`

‏מצב שימושי:

```text
market data degraded
or broker partially degraded
or reconciliation pending
```

‏המערכת אינה פותחת exposure חדש.

---

# ‏104. Session Recovery SLA

‏נמדוד:

```text
time_to_detect_disconnect
time_to_reconnect
time_to_reconcile
time_to_ready
```

‏לא רק uptime.

---

# ‏105. Heartbeat

‏צריך heartbeat/state signal ברמת:

- ‏TCP/socket.
- ‏API protocol.
- ‏Brokerage session.
- ‏Market data freshness.
- ‏Order event flow.

‏`Connected=true` לבדו אינו מספיק.

---

# ‏106. Market Data Heartbeat

‏אם stream פתוח אבל אין updates, צריך להבדיל:

```text
quiet symbol
market closed
subscription dead
session degraded
network issue
```

---

# ‏107. Active Position מקבל Priority

‏כאשר resources מוגבלים:

```text
position market data
> working-order data
> top candidates
> broad universe
```

‏לא להפך.

---

# ‏108. Whole-Market Scanner — החלטת Architecture

‏עבור ~4,000 symbols יש שלושה מודלים אפשריים למחקר:

```text
A. IBKR-only
B. External data + IBKR execution
C. Hybrid IBKR broad + deep external/IBKR
```

‏לא מניחים מראש מי מנצח.

---

# ‏109. למה `External Data + IBKR Execution` אטרקטיבי

‏הוא מפריד שני bottlenecks:

```text
Discovery throughput
Execution reliability
```

‏אם provider חיצוני יכול לספק whole-market feed בצורה יעילה יותר, אין סיבה ארכיטקטונית שהברוקר יכתיב את scanner feed.

---

# ‏110. אבל Cross-Provider Data יוצר בעיה חדשה

‏ייתכן:

```text
Provider A says Ask = 10.02
IBKR sees Ask = 10.03
```

‏זה יכול לנבוע מ־:

- ‏Timestamp mismatch.
- ‏Venue coverage.
- ‏Consolidation rules.
- ‏Latency.
- ‏Entitlements.

---

# ‏111. Execution Recheck אצל IBKR

‏לכן לפני Order כדאי לבצע:

```text
fresh broker-side executable quote check
```

‏כאשר המגבלות וה־latency מאפשרות.

‏ה־Scanner יכול לבחור candidate ממקור A.

‏ה־Execution Engine מאשר feasibility מול מקור B.

---

# ‏112. Source-of-Truth by Domain

```text
Market-wide ranking truth → Scanner feed
Tradable order state → IBKR
Position truth → IBKR
Strategy intent → our database
Risk policy → our Risk Engine
```

---

# ‏113. Cross-Provider Symbol Mapping

‏צריך mapping יציב:

```text
scanner_symbol
provider_instrument_id
ibkr_conId
currency
exchange
```

‏Symbol string בלבד אינו מספיק.

---

# ‏114. Stale Candidate Gate

‏אם candidate נבחר ב־t0 אבל broker quote מגיע ב־t0+Δ:

‏נבדוק מחדש:

```text
score still valid?
rank still acceptable?
spread acceptable?
price escaped?
data fresh?
```

---

# ‏115. Price Budget

‏ה־Execution Engine אינו אומר:

> ‏“Rank #1 — buy בכל מחיר.”

‏הוא מקבל:

```text
max acceptable entry price
signal expiry
urgency
```

---

# ‏116. Marketable Limit כ־Research Primitive

‏כפי שלמדנו בשלב 16, Marketable Limit יכול להיות primitive שימושי למחקר execution:

- ‏מנסה fill מיידי.
- ‏אבל מציב price cap.

‏אין פירוש הדבר שזה Order Type נכון לכל מצב.

---

# ‏117. Native IBKR Order Types

‏IBKR תומכת במבחר גדול של Order Types.

‏אבל adapter לא צריך לחשוף את כולם ביום הראשון.

‏נבנה Capability Matrix.

---

# ‏118. Capability Matrix

```text
Canonical capability      TWS API      Web API      Paper      Live
LIMIT                      ?            ?            ?          ?
MARKET                     ?            ?            ?          ?
STOP                       ?            ?            ?          ?
BRACKET                    ?            ?            ?          ?
IOC                        ?            ?            ?          ?
PEGGED                     ?            ?            ?          ?
```

‏ה־`?` נפתר בבדיקה ותיעוד רשמי, לא בהנחה.

---

# ‏119. Capability Discovery לפני Production

‏לכל Order Type שנרצה:

1. ‏קרא תיעוד.
2. ‏בדוק ב־TWS ידנית.
3. ‏בדוק ב־Paper API.
4. ‏בדוק callbacks.
5. ‏בדוק cancel/replace.
6. ‏בנה regression test.

---

# ‏120. Native vs Client-Side Bracket

‏אם broker תומך ב־parent/child/native relationships, יש להם יתרון survivability מסוים מול client crash.

‏אבל צריך לבדוק בדיוק semantics של transmission, activation ו־cancellation.

---

# ‏121. אל תניח `OCO` semantics

‏שמות דומים אצל brokers שונים אינם contract זהה.

‏נבדוק:

```text
when sibling is cancelled
what happens on partial fill
what happens on disconnect
what persists server-side
```

---

# ‏122. Native Protective Order ≠ Guaranteed Exit

‏גם Order שקיים אצל broker אינו מבטיח fill במחיר מסוים.

‏Market conditions עדיין קובעים את היכולת להתבצע.

---

# ‏123. Position Reconciliation אחרי Partial Exit

‏אם exit התמלא חלקית:

```text
remaining_position = broker_position
```

‏לא:

```text
requested_exit_remaining
```

---

# ‏124. Oversell Protection

‏לפני כל Sell-to-close:

```text
intended_exit_qty <= reconciled_position_qty
```

‏אבל צריך גם לקחת בחשבון working exit orders.

---

# ‏125. Pending Exit Exposure

‏אם קיימות שתי פקודות Sell עובדות על אותה Position, שתיהן יכולות ליצור race.

‏לכן Risk Engine רואה:

```text
position
+ pending buys
- pending sells
```

---

# ‏126. Broker Order Book פנימי

‏המערכת צריכה view פנימי של:

```text
Open broker orders
Working quantity
Filled quantity
Remaining quantity
Order status
Associated intent
```

---

# ‏127. Event Deduplication

‏Callbacks יכולים להיות repeated או להיראות repeated.

‏Consumer צריך להיות idempotent.

‏כל Event processing חייב לסבול replay.

---

# ‏128. Event Ordering

‏אין להניח שכל callbacks מגיעים בסדר “נוח”.

‏ה־State Machine צריכה להתמודד עם ordering חוקי ועם recovery snapshot.

---

# ‏129. Snapshot + Stream Pattern

‏גישה חזקה:

```text
initial snapshot
→ subscribe stream
→ apply events
→ periodic reconciliation snapshot
```

---

# ‏130. למה Periodic Reconciliation גם כשהכול נראה תקין?

‏כי stream loss יכול להיות silent.

‏Periodic comparison יכול לזהות:

- ‏Missed fill.
- ‏Missed cancel.
- ‏External manual order.
- ‏Manual position change.

---

# ‏131. Human + Robot באותו Account

‏אם אדם משנה order ידנית ב־TWS, המערכת צריכה לזהות זאת.

‏אסור להניח שכל state הגיע רק מהקוד שלנו.

---

# ‏132. External Action Classification

```text
KNOWN_AUTOMATION
MANUAL_USER_ACTION
UNKNOWN_EXTERNAL_ACTION
```

‏פעולה חיצונית יכולה להעביר את המערכת ל־reconciliation-required.

---

# ‏133. Separate Username לא פותר הכול

‏גם עם username אוטומציה נפרד עדיין קיימים:

- ‏אותו Account.
- ‏Positions משותפים.
- ‏Risk משותף.
- ‏Market data licensing.

‏לכן reconciliation עדיין חובה.

---

# ‏134. `IBKR Israel` — מה צריך להבין

‏השם המסחרי המקומי והישות שמספקת שירות ללקוח הישראלי אינם משהו שכדאי להסיק רק מהמילים “Interactive Brokers Israel”.

‏האתר הנוכחי של Interactive Israel מציין שהוא מותג של `MEXEM LTD`, ושאינו נשלט או מופעל על ידי Interactive Brokers עצמה.

‏לכן בכל נושא משפטי/חשבון/עמלות/הגנות:

> ‏בודקים את הישות וההסכם של החשבון הספציפי.

---

# ‏135. אבל מבחינת API המקומי

‏האתר הנוכחי של Interactive Israel מפרסם גישה ליכולות `API` ו־`FIX` של Interactive Brokers וחיבור דרך `TWS` או `Gateway`.

‏כלומר מבחינת architecture הטכנית, ה־IBKR stack רלוונטי גם ללקוח שפועל דרך המסלול הישראלי — בכפוף להרשאות ולמבנה החשבון בפועל.

---

# ‏136. אל תקודד Entity Assumptions

‏לא כותבים:

```text
if user_country == Israel:
    entity = X
```

‏במקום זאת שומרים account metadata שמגיע ממקור אמין ומאומת.

---

# ‏137. Trading Permissions

‏גישה ל־API אינה שווה permission לסחור בכל נכס.

‏יש להפריד:

```text
API enabled
asset-class permission
market permission
market-data entitlement
order-type capability
```

---

# ‏138. Market Data Agreement

‏ב־IBKR יש גם דרישות/אישורים הקשורים לשימוש ב־market data דרך API.

‏אם agreement חסר, יכול להיות שהמערכת מחוברת אך הנתונים אינם במצב Real-Time צפוי.

---

# ‏139. Automation Disclosure

‏בתיעוד הרשמי של IBKR קיימת הבחנה בין:

- ‏API messages שמאושרים ידנית.
- ‏API messages שנוצרים ונשלחים אוטומטית.

‏למערכת אוטומטית יש לוודא שהחשבון וההצהרות הרלוונטיות מוגדרים בהתאם לדרישות IBKR העדכניות.

---

# ‏140. זו לא רק Compliance Checkbox

‏אם automation status אינו נכון, זו בעיית Production configuration.

‏נכניס ל־Go-Live checklist:

```text
account permissions verified
API automation disclosure verified
market-data agreements verified
trading permissions verified
```

---

# ‏141. Secrets

‏לעולם לא שומרים credentials בקוד או ב־Git.

‏אם authentication flow מחייב user interaction, מתכננים runbook תפעולי במקום לעקוף אותו בצורה לא נתמכת.

---

# ‏142. Environment Guard

‏האפליקציה צריכה להציג בצורה בולטת:

```text
ENV = REPLAY
ENV = SHADOW
ENV = PAPER
ENV = LIVE
```

‏ו־LIVE צריך לדרוש configuration מפורש.

---

# ‏143. Port/Endpoint Safety

‏ב־TWS/Gateway Paper ו־Live יכולים להשתמש בהגדרות/ports שונים.

‏אין להסתמך רק על port כדי להחליט אם כסף אמיתי בסיכון.

‏נבדוק גם Account ID/environment metadata.

---

# ‏144. Hard Live Guard

‏לפני transmission:

```text
configured_env == LIVE
AND broker_account == approved_live_account
AND risk_engine == READY
AND reconciliation == CLEAN
```

---

# ‏145. Paper Guard

‏בדיקות אוטומטיות צריכות להיכשל אם test suite מתחברת לחשבון Live.

‏זה invariant.

---

# ‏146. `What-If` / Preview

‏כאשר API מציע preview/what-if capability מסוים, הוא יכול לעזור לבדוק validation/margin effects לפני transmission.

‏אבל הוא אינו תחליף ל־Risk Engine שלנו.

---

# ‏147. Margin/Buying Power

‏Broker values הם inputs חשובים.

‏אבל Strategy אינה אמורה “לנצל כל buying power פנוי”.

‏Risk Engine מגדיר exposure פנימי שמרני יותר.

---

# ‏148. Account Values יכולים להשתנות

‏Buying power, margin, cash ו־PnL הם streams/state.

‏לא קוראים פעם אחת בבוקר ומניחים שהם קבועים.

---

# ‏149. Broker Data Freshness

‏גם account state צריך timestamp.

```text
account_snapshot_age
position_snapshot_age
order_snapshot_age
```

---

# ‏150. כאשר Account Snapshot ישן

‏לא פותחים exposure חדש אם state קריטי ישן מעבר ל־threshold.

‏זה Fail Closed.

---

# ‏151. Reconciliation לפני Exit?

‏לא תמיד אפשר לחכות זמן רב כאשר צריך לצאת.

‏לכן system design צריך priority שונה ל־risk-reducing action לעומת new entry.

---

# ‏152. New Entry הוא Privilege

‏כדי לפתוח Position חדשה צריך שכל המערכות יהיו healthy.

‏כדי להפחית Position, לפעמים נרצה לאפשר פעולה גם במצב degraded — בהתאם למידע הזמין והמדיניות.

---

# ‏153. Health Dimensions

```text
connection_health
session_health
market_data_health
order_stream_health
account_state_health
reconciliation_health
```

---

# ‏154. Overall Broker Health

```text
HEALTHY
DEGRADED
UNSAFE_FOR_NEW_ENTRIES
EXIT_ONLY
OFFLINE
```

---

# ‏155. Data Provider Health נפרד

‏אם market data מגיע מספק חיצוני:

```text
MarketDataHealth != BrokerHealth
```

‏שניהם יכולים להיכשל בנפרד.

---

# ‏156. Split-Brain Scenario

```text
Scanner provider alive
IBKR disconnected
```

‏ה־Scanner ממשיך לראות signals.

‏אבל Execution חייב להיות חסום.

---

# ‏157. Scenario הפוך

```text
IBKR alive
Scanner feed stale
```

‏גם כאן אין new entries.

‏Connection לברוקר אינה תחליף ל־fresh signal data.

---

# ‏158. Broker-side Quote Recheck אינו Scanner Replacement

‏Quote אחד של candidate אינו מחליף cross-sectional universe ranking.

‏הוא רק execution validation.

---

# ‏159. Scanner API של IBKR

‏IBKR מציעה scanner functionality.

‏אבל scanner של broker אינו בהכרח זהה ל־custom full-universe scoring שלנו.

‏הוא יכול להיות useful discovery tool או benchmark, לא Source of Truth אוטומטי לאסטרטגיה שלנו.

---

# ‏160. למה לא לבנות Strategy על Broker Scanner Criteria

‏כי:

- ‏הקריטריונים יכולים להשתנות.
- ‏ה־ranking אינו בשליטתנו.
- ‏היסטוריזציה/replay קשה יותר.
- ‏קשה להבטיח parity עם המחקר שלנו.

---

# ‏161. Broker Scanner כ־Comparison Baseline

‏כן אפשר לשאול במחקר:

```text
Does our Top-1 outperform broker scanner candidates?
```

‏אבל זה Experiment נפרד.

---

# ‏162. Pacing-aware Scheduler

‏נבנה scheduler שיודע:

```text
request class
endpoint budget
next allowed time
priority
expiry
```

---

# ‏163. Expired Request לא נכנס לתור

‏אם quote request היה רלוונטי לפני 2 שניות אבל signal TTL עבר:

‏לא שולחים אותו רק כי “הגיע תורו”.

```text
if now > request.deadline:
    drop
```

---

# ‏164. Queue Latency היא חלק מה־Edge

‏Request throttling עצמו מוסיף delay.

‏לכן נמדוד:

```text
broker_request_queue_wait
```

---

# ‏165. Avoid Request Amplification

‏Signal אחד לא צריך לגרום ל־20 endpoints אם אפשר לקבל state מ־stream/cache.

‏זה חשוב במיוחד ב־Web API.

---

# ‏166. Cache with Freshness

‏Cache אינו “ערך אחרון לנצח”.

```text
value
source_time
received_time
expires_at
quality
```

---

# ‏167. Order Status Polling אינו Primary Model

‏כאשר קיימים unsolicited order updates/stream events, עדיף להשתמש בהם ולעשות polling/reconciliation כגיבוי ולא להפוך כל order ללולאת polling אגרסיבית.

---

# ‏168. Event Loss Detection

‏אם יש sequence/heartbeat information, נשתמש בו.

‏אם לא, periodic state comparison ממלא חלק מהפער.

---

# ‏169. Cold Start

‏כאשר process עולה באמצע המסחר:

1. ‏Connect.
2. ‏Authenticate.
3. ‏Load local journal.
4. ‏Fetch broker state.
5. ‏Reconcile.
6. ‏Restore subscriptions.
7. ‏Warm features.
8. ‏Wait freshness window.
9. ‏Enable new entries.

---

# ‏170. Warm-up Period

‏Scanner שמבוסס על 60 שניות history אינו Ready אחרי tick ראשון.

‏Broker connection ready אינה Strategy ready.

---

# ‏171. Independent Readiness Gates

```text
broker_ready
market_data_ready
features_ready
risk_ready
strategy_ready
```

‏`trading_ready` הוא AND של כולם.

---

# ‏172. Graceful Shutdown

‏Shutdown צריך לדעת:

- ‏האם יש open positions.
- ‏האם יש working orders.
- ‏האם מותר להשאיר orders אצל broker.
- ‏האם צריך cancel.
- ‏מה state שצריך לשמור.

---

# ‏173. Process Exit ≠ Broker Order Cancel

‏פקודה שכבר קיימת אצל broker יכולה להמשיך לחיות לאחר שהאפליקציה נסגרת, בהתאם לסוגה ולהגדרותיה.

‏אסור להניח שה־process owns lifetime פיזית.

---

# ‏174. Session Shutdown Runbook

‏לפני restart מתוכנן:

```text
pause new entries
reconcile
persist
handle working orders according to policy
restart
reconnect
reconcile again
```

---

# ‏175. Daily/Weekly Connectivity Reality

‏IBKR infrastructure ו־TWS/Gateway עוברים maintenance/restart cycles.

‏מערכת אמינה נבנית מתוך assumption של reconnect, לא assumption של socket נצחי.

---

# ‏176. Retry Matrix

‏לא כל failure מקבל retry.

```text
network timeout           → reconcile/retry carefully
rate limit                → backoff
invalid contract           → no blind retry
permission denied          → no retry
order reject               → classify
unknown submission effect  → reconcile first
```

---

# ‏177. Circuit Breaker

‏אם broker failures חוזרים:

```text
new entries disabled
```

‏לא ממשיכים “לנסות עד שיעבוד”.

---

# ‏178. Error Storm Protection

‏Bug שגורם ל־reject loop יכול לייצר מאות requests.

‏לכן:

```text
max retries per intent
max broker errors per minute
circuit breaker
```

---

# ‏179. Duplicate Order Detector

‏לפני submit:

```text
same intent already submitted?
same symbol/side/order semantics already working?
```

‏לא תמיד duplicate הוא זהה byte-for-byte.

---

# ‏180. Semantic Duplicate

‏שתי פקודות BUY שונות ב־Order ID יכולות עדיין להיות duplicate עסקי.

‏לכן dedup key יכול להתבסס על:

```text
strategy_id
signal_id
position_cycle_id
intent_type
```

---

# ‏181. Fill Before ACK

‏מערכת event-driven צריכה להיות מוכנה לסדרים לא אינטואיטיביים מבחינת application timing.

‏אין כותבים state machine שמניחה שהכול מגיע תמיד לפי סדר UI יפה.

---

# ‏182. Final State from Evidence

‏State משתנה רק על בסיס:

- ‏Broker event.
- ‏Reconciliation snapshot.
- ‏Explicit local intent event.

‏לא על בסיס timeout בלבד.

---

# ‏183. Timeout Means Unknown

```text
No ACK after 2 seconds
```

‏פירושו:

```text
ACK_TIMEOUT
```

‏לא בהכרח:

```text
ORDER_DOES_NOT_EXIST
```

---

# ‏184. IBKR Logs כ־Evidence

‏IBKR מספקת אפשרויות API logging/diagnostics ב־TWS/Gateway.

‏ב־Production Incident נשמור אותם עם correlation timestamps.

---

# ‏185. Version Everything

‏נשמור:

```text
IB API client version
TWS/Gateway version
adapter version
strategy version
config version
```

‏כי שינוי צד שלישי יכול לשנות behavior גם אם הקוד שלנו לא השתנה.

---

# ‏186. Upgrade Policy

‏לא מעדכנים TWS/Gateway באמצע Production בלי validation.

‏Flow:

```text
new version
→ paper/shadow
→ regression replay
→ broker conformance tests
→ controlled promotion
```

---

# ‏187. אבל גם לא נשארים לנצח על גרסה ישנה

‏IBKR ממליצה לעדכן TWS/Gateway תקופתית משום releases כוללים enhancements ותיקונים.

‏לכן צריך controlled upgrade cadence.

---

# ‏188. Contract Tests ל־Adapter

‏לכל Broker Adapter:

```text
connect
place limit
cancel
partial fill handling
full fill
reject
reconnect
reconcile
duplicate event
unknown order
```

---

# ‏189. Same Test Suite לכל Broker

‏זה היתרון של interface provider-agnostic.

```text
BrokerConformanceTests<TBroker>
```

‏אפשר להריץ מול:

- ‏IBKR Paper.
- ‏Simulator.
- ‏Broker עתידי.

---

# ‏190. Golden Broker Scenarios

‏נחזיק scenarios קבועים:

```text
G01 normal fill
G02 partial fill
G03 cancel before fill
G04 fill during cancel
G05 disconnect after submit
G06 reconnect with unknown fill
G07 reject
G08 stale quote
G09 duplicate callback
G10 manual external change
```

---

# ‏191. Fault Injection

‏ב־Simulator נזריק:

- ‏ACK delay.
- ‏Dropped callback.
- ‏Reconnect.
- ‏Duplicate event.
- ‏Partial fill.
- ‏429/rate-limit equivalent.
- ‏Session invalidation.

‏ונבדוק invariants.

---

# ‏192. Production Invariants

```text
No unapproved new exposure
No duplicate intent execution
No exit above reconciled position
No trading on stale critical state
No resume before reconciliation
Every fill belongs to an order
Every order belongs to an intent
```

---

# ‏193. Metrics — Connection

```text
connect_attempts
reconnect_count
session_invalidations
ready_time_ms
reconciliation_time_ms
```

---

# ‏194. Metrics — Orders

```text
submit_count
ack_latency
reject_rate
cancel_latency
partial_fill_rate
fill_latency
unknown_state_count
```

---

# ‏195. Metrics — Data

```text
active_market_data_lines
subscription_errors
stale_stream_count
reconnect_resubscribe_count
provider_disagreement
```

---

# ‏196. Metrics — Pacing

```text
requests/sec
throttled_requests
queue_wait_ms
429_count
expired_before_send
```

---

# ‏197. Metrics — Reconciliation

```text
position_mismatch
unknown_broker_order
unknown_local_order
missed_execution
manual_external_change
```

---

# ‏198. Dashboard

‏ב־Operations UI נרצה לראות:

```text
Broker session: READY
Market data: HEALTHY
Orders working: 1
Positions: 1
Last reconciliation: 4s ago
Pacing budget: 82%
Unknown states: 0
```

---

# ‏199. Alert Severity

```text
INFO     reconnect recovered
WARNING  market-data degradation
HIGH     reconciliation mismatch
CRITICAL unknown exposure / cannot determine position
```

---

# ‏200. Runbook: Cannot Connect

1. ‏Freeze entries.
2. ‏Check TWS/Gateway process.
3. ‏Check session/authentication.
4. ‏Check competing login/session.
5. ‏Check network.
6. ‏Inspect logs.
7. ‏Reconnect.
8. ‏Reconcile.
9. ‏Only then resume.

---

# ‏201. Runbook: Data Missing but Orders Work

1. ‏Freeze entries.
2. ‏Do not infer market state from stale cache.
3. ‏Keep position/risk state monitored.
4. ‏Attempt resubscribe.
5. ‏Verify entitlements/session.
6. ‏Resume only after freshness gate passes.

---

# ‏202. Runbook: Order Status Unknown

1. ‏Do not resend blindly.
2. ‏Mark intent `UNKNOWN_EFFECT`.
3. ‏Query/reconcile broker state.
4. ‏Inspect executions/open orders.
5. ‏Resolve position.
6. ‏Only then choose next action.

---

# ‏203. Runbook: Position Mismatch

```text
STOP NEW ENTRIES
```

‏ואז:

- ‏Fetch broker positions.
- ‏Fetch executions/orders.
- ‏Compare journal.
- ‏Classify cause.
- ‏Repair local projection.
- ‏RCA.

---

# ‏204. Runbook: Pacing Limit

- ‏Stop noncritical calls.
- ‏Honor backoff.
- ‏Inspect request amplification.
- ‏Check scheduler budget.
- ‏Do not start retry storm.

---

# ‏205. `IBKR` אינו המקום היחיד שבו צריך Rate Limiting

‏גם provider חיצוני יקבל rate limits.

‏לכן throttling הוא infrastructure capability כללית.

---

# ‏206. Abstract `IRateBudget`

```csharp
public interface IRateBudget
{
    ValueTask<bool> TryAcquireAsync(
        RequestClass requestClass,
        DateTimeOffset deadline,
        CancellationToken cancellationToken);
}
```

---

# ‏207. Broker Adapter לא מחליט Strategy Priority

‏ה־Execution Engine אומר מה חשוב.

‏ה־Adapter רק אוכף את מגבלות הספק ומדווח capacity.

---

# ‏208. Capability Snapshot

‏בתחילת session נרצה snapshot כמו:

```text
Broker = IBKR
API = TWS
Environment = PAPER
CanTradeStocks = true
MarketData = REALTIME/PARTIAL
MaxObservedDataLines = ...
SessionState = READY
```

---

# ‏209. Never Guess Account Capability

‏אם capability אינה ידועה:

```text
UNKNOWN
```

‏עדיף על `true` אופטימי.

---

# ‏210. `NO TRADE` בגלל Broker State הוא תוצאה חוקית

‏יכול להיות Scanner מושלם, אבל:

```text
BROKER_NOT_READY
```

‏לכן Decision log שומר:

```text
NO_TRADE_BROKER_GATE
```

---

# ‏211. אל תערבב Broker Failure עם Strategy Failure

‏אם Rank #1 עלה יפה אבל לא נכנסנו בגלל session failure:

‏זה אינו Prediction Failure.

‏זה Operational Failure.

---

# ‏212. Opportunity Cost של Broker Failure

‏נמדוד גם:

```text
missed_net_opportunity_due_to_broker
```

‏כדי לדעת האם reliability באמת פוגעת בתוצאות.

---

# ‏213. Execution Provider Comparison

‏בעתיד אפשר להשוות brokers לפי:

- ‏Fill rate.
- ‏Slippage.
- ‏Latency.
- ‏Order capabilities.
- ‏Operational stability.
- ‏Costs.

‏ולא לפי branding.

---

# ‏214. Market Data Provider Comparison

‏בנפרד נשווה:

- ‏Universe coverage.
- ‏Freshness.
- ‏Update frequency.
- ‏Completeness.
- ‏Historical availability.
- ‏Cost.
- ‏API limits.

---

# ‏215. Provider-Agnostic Strategy

‏אסור שב־Score יהיה:

```text
if broker == IBKR
```

‏אלא אם זה Feature עסקי מפורש ומוצדק.

‏Strategy צריכה לקבל canonical market state.

---

# ‏216. Provider-Specific Execution

‏לעומת זאת מותר ל־Execution Engine לבחור behavior לפי capabilities.

```text
if broker supports native IOC...
```

‏זו שכבת execution, לא alpha logic.

---

# ‏217. Configuration Example

```text
MarketDataProvider = ProviderA
ExecutionBroker = IBKR_TWS
AccountEnvironment = PAPER
ExecutionPolicy = Balanced
```

---

# ‏218. מעבר מ־Paper ל־Live

‏לא משנים גם API וגם Strategy וגם sizing באותו יום.

‏Promotion נכון:

```text
same code
same config logic
same broker adapter
small controlled exposure
```

‏ורק environment/account משתנים תחת guardrails.

---

# ‏219. Small Live אינו בדיקת Profit

‏המטרה הראשונה של small-live היא בעיקר למדוד:

- ‏Real fill behavior.
- ‏Latency.
- ‏Slippage.
- ‏Order semantics.
- ‏Operational reliability.

‏לא להסיק רווחיות ממספר קטן של עסקאות.

---

# ‏220. Paper-to-Live Calibration

‏נשמור לכל Trade:

```text
paper_expected_fill
live_fill
paper_latency
live_latency
paper_slippage
live_slippage
```

‏ואז נעדכן את Execution Model.

---

# ‏221. `IBKR` Paper Bias

‏אם Paper נראה טוב יותר מ־Live, אין “לתקן” את Live.

‏מתקנים את סימולטור המחקר כך שישקף את המציאות.

---

# ‏222. API Changelog הוא Dependency Feed

‏IBKR מפרסמת changelog ל־Web API.

‏זה מקור שצריך לעקוב אחריו לפני upgrades ו־Production changes.

---

# ‏223. External Dependency Review

‏פעם בתקופה:

```text
API docs changed?
pacing changed?
authentication changed?
market data behavior changed?
order fields changed?
paper limitations changed?
```

---

# ‏224. Documentation Snapshot

‏בכל Production release משמעותי נשמור:

```text
external_docs_checked_at
known_limits
known_exceptions
```

‏כדי שרטרוספקטיבה תדע מה חשבנו שהיה נכון אז.

---

# ‏225. Source Priority

‏בסוגיה טכנית של IBKR נעדיף:

1. ‏תיעוד רשמי `IBKR Campus`.
2. ‏API changelog רשמי.
3. ‏TWS/API logs והתנהגות בפועל.
4. ‏Support clarification אם קיימת סתירה.
5. ‏אתרי צד שלישי רק כרמז, לא כמקור contract.

---

# ‏226. Interactive Israel כמקור

‏האתר המקומי שימושי להבנת השירות המקומי והגישה ל־API.

‏אבל לפרטי protocol, pacing, callbacks ו־API contract — המקור הטכני הראשי צריך להישאר IBKR הרשמי.

---

# ‏227. מתי לפנות לתמיכה

‏כאשר:

- ‏התיעוד הרשמי סותר את עצמו.
- ‏behavior שונה בין Paper ל־Live ולא מוסבר.
- ‏entitlement אינו ברור.
- ‏API logs מראים מצב שלא מתועד.

‏לא “מנחשים ומקודדים workaround”.

---

# ‏228. Minimal POC — TWS API

‏ה־POC הראשון צריך לעשות מעט מאוד:

```text
connect
wait READY
read account
resolve one contract
subscribe one quote
submit one Paper limit order
observe lifecycle
cancel if needed
reconcile
shutdown
```

‏בלי Scanner של 4,000 מניות.

---

# ‏229. Minimal POC — Web API

```text
authenticate
establish brokerage session
read account
subscribe one websocket market stream
submit one Paper order
observe order stream
reconcile
logout/cleanup
```

---

# ‏230. Benchmark POC

‏אחרי ששני POCs עובדים:

‏נמדוד 100–1,000 cycles ב־Paper/Shadow של:

```text
connectivity
quote acquisition
order submit
ack
cancel
fill events
recovery
```

‏לא רק run אחד.

---

# ‏231. POC Failure Injection

‏בזמן Paper:

- ‏סגור Gateway.
- ‏נתק network.
- ‏פתח מחדש.
- ‏בצע manual order.
- ‏שנה order ידנית.

‏ובדוק שהמערכת אינה מאבדת state.

---

# ‏232. מה צריך להוכיח לפני Live

```text
zero unexplained position mismatches
zero duplicate intent executions
reliable reconnect
reliable reconciliation
known pacing behavior
market-data entitlement verified
order capabilities verified
paper/live config separation verified
```

---

# ‏233. מה לא צריך להוכיח עדיין

‏לא צריך בשלב זה להוכיח:

> ‏“IBKR הוא הברוקר הכי טוב בעולם לרובוט.”

‏צריך להוכיח:

> ‏“ה־Adapter שלנו יודע לעבוד מולו באופן בטוח, מדיד וניתן להחלפה.”

---

# ‏234. Best Practice — Thin Adapter

‏IBKR Adapter צריך להיות דק.

‏הוא מתרגם protocol.

‏Business logic נשאר בחוץ.

---

# ‏235. Best Practice — No IB Types in Strategy

‏Strategy assembly לא צריכה להכיר:

```text
EClient
EWrapper
conId
IB Order
```

‏אלו implementation details.

---

# ‏236. Best Practice — Persist Before Side Effect

‏לפני submit אמיתי:

‏שמור intent ורisk approval.

‏אחר כך side effect.

---

# ‏237. Best Practice — Reconcile Before Resume

‏Reconnect בלי reconciliation אינו recovery מלא.

---

# ‏238. Best Practice — Measure Real Broker Latency

‏לא משתמשים במספר “IBKR latency” מהאינטרנט.

‏מודדים מהמערכת שלנו, מהמיקום שלנו, בחשבון שלנו ובשעות הרלוונטיות.

---

# ‏239. Best Practice — Broker Limits as Config

```text
limits.web.globalRps
limits.web.historyPerMinute
limits.tws.orderRate
```

‏עם source/date.

‏לא magic numbers מפוזרים בקוד.

---

# ‏240. Best Practice — Conservative Documentation Handling

‏אם מסמך אחד אומר 10 דקות ואחד 15 דקות:

‏בחר policy שעובדת בשני המקרים עד שמתקבלת הבהרה.

---

# ‏241. Best Practice — Paper First

‏כל capability חדשה עוברת:

```text
unit
simulation
paper
shadow
small live
```

‏לפי הצורך.

---

# ‏242. Best Practice — Separate Account/Username Metadata

‏Market data ו־session behavior שייכים ל־username.

‏Positions/cash שייכים ל־account.

‏אל תערבב במודל.

---

# ‏243. Best Practice — Subscription Budget

‏Market Data Lines הן resource budget.

‏נהל אותן כמו connection pool.

---

# ‏244. Best Practice — Dynamic Subscription Set

‏במקום streams לכל universe:

```text
subscribe Top-N
unsubscribe stale candidates
always preserve active-position subscriptions
```

---

# ‏245. Best Practice — Hysteresis ב־Subscriptions

‏אם Rank #20/#21 מתחלפים בכל 100ms, לא רוצים subscribe/unsubscribe storm.

‏נשתמש ב־hysteresis/cooldown.

---

# ‏246. Best Practice — Subscription Reason

‏כל subscription יודע למה הוא חי:

```text
ACTIVE_POSITION
WORKING_ORDER
TOP_CANDIDATE
DIAGNOSTIC
```

---

# ‏247. Anti-Pattern — IBKR as Database

‏לא משתמשים ב־broker API כדי “לשאול שוב ושוב מה מצב העולם” במקום לשמור projection מקומי.

‏Stream + local state + reconciliation.

---

# ‏248. Anti-Pattern — Poll Everything

‏Polling מסיבי יוצר:

- ‏Latency.
- ‏Pacing pressure.
- ‏Complexity.
- ‏Rate-limit risk.

---

# ‏249. Anti-Pattern — One Giant IBKR Service

‏Class אחד שמבצע:

```text
market data
strategy
orders
risk
logging
reconnect
```

‏יהפוך מהר מאוד לבלתי ניתן לבדיקה.

---

# ‏250. Anti-Pattern — Ignore Paper Differences

‏Paper success אינו Production proof.

---

# ‏251. Anti-Pattern — Retry Every Error

‏Reject ל־invalid contract לא ייפתר ב־retry.

‏Unknown transmission לא נפתר ב־blind retry.

---

# ‏252. Anti-Pattern — Trust Local Position

‏לאחר disconnect, local position הוא hypothesis עד reconciliation.

---

# ‏253. Anti-Pattern — Assume TWS Price = API Price

‏Licensing/data mode יכולים להיות שונים.

---

# ‏254. Anti-Pattern — Hardcode 100 Data Lines

‏זה documented baseline, לא universal immutable contract.

---

# ‏255. Anti-Pattern — 4,000 Persistent Streams בלי Capacity Design

‏Universe גדול דורש data architecture.

‏הוא אינו for-loop בלבד.

---

# ‏256. Anti-Pattern — Strategy waits synchronously for Broker

‏Scanner לא צריך להיחסם על callback של broker.

‏Use asynchronous pipeline/state machines.

---

# ‏257. Anti-Pattern — Fire-and-Forget Order

```text
broker.PlaceOrder(...)
return
```

‏בלי journal/state/correlation הוא Production bug שמחכה לקרות.

---

# ‏258. Practitioner Insight — Most Broker Bugs Are State Bugs

‏הרבה “API bugs” הם בפועל:

- ‏Race condition.
- ‏Wrong state assumption.
- ‏Duplicate handling.
- ‏Reconnect mistake.
- ‏Missing persistence.

---

# ‏259. Practitioner Insight — Happy Path הוא החלק הקל

‏הקושי אינו:

```text
BUY → Filled
```

‏הקושי הוא:

```text
BUY → timeout → disconnect → partial fill → reconnect
```

---

# ‏260. Practitioner Insight — Market Data Capacity Can Shape Strategy

‏אם feed infrastructure אינו יכול לראות את כל ה־Universe בזמן הרצוי, זה משנה את מה שהאסטרטגיה באמת מסוגלת לדעת.

‏זו לא “רק בעיית Infra”.

---

# ‏261. Practitioner Insight — Data and Execution Need Different SLAs

‏Scanner data יכול אולי לסבול gap קטן.

‏Position management לעיתים לא.

‏לכן SLA לפי domain.

---

# ‏262. Practitioner Insight — Broker API Is an Eventually Consistent Distributed System

‏מבחינת האפליקציה:

- ‏Messages יכולים להתעכב.
- ‏Connections נופלים.
- ‏State נצפה דרך כמה channels.
- ‏External actor יכול לשנות state.

‏צריך לחשוב כמו distributed systems engineer.

---

# ‏263. Practitioner Insight — `Unknown` הוא מצב מקצועי

‏מערכת בוגרת אומרת:

```text
I do not currently know whether this order exists.
```

‏מערכת מסוכנת מנחשת.

---

# ‏264. Practitioner Insight — Reconciliation Beats Clever Retry

‏כאשר side effect חיצוני אינו ידוע:

> ‏קודם גלה את האמת, אחר כך פעל.

---

# ‏265. Practitioner Insight — Keep IBKR Replaceable

‏גם אם נבחר בסוף IBKR ל־Production, abstraction טוב נותן:

- ‏Testability.
- ‏Replay.
- ‏Paper simulator.
- ‏Future broker option.
- ‏Less vendor lock-in.

---

# ‏266. התאמה לרובוט שלנו — Baseline מוצע למחקר

‏לא כהמלצת מסחר אלא כ־architecture baseline:

```text
Broad market feed
→ Full-market scanner
→ Top-N shortlist
→ IBKR-side executable quote validation
→ Risk Engine
→ IBKR Execution Adapter
→ Fill/Position reconciliation
```

---

# ‏267. למה לא להתחיל מ־IBKR-only Scanner

‏אפשר לבדוק אותו.

‏אבל עבור 4,000 symbols צריך קודם להוכיח:

- ‏Coverage.
- ‏Freshness.
- ‏Subscription capacity.
- ‏Pacing.
- ‏Latency.

‏לפני שמחליטים שזה data plane מתאים.

---

# ‏268. POC Metric — Coverage

```text
% universe fresh within 1s
% universe fresh within 5s
missing symbols
stale symbols
```

---

# ‏269. POC Metric — Candidate Validation

```text
scanner_price
ibkr_bid
ibkr_ask
price_difference
quote_age
validation_latency
```

---

# ‏270. POC Metric — Execution

```text
signal_to_submit
submit_to_ack
ack_to_first_fill
signal_to_first_fill
slippage
```

---

# ‏271. POC Metric — Reliability

```text
session interruptions/day
reconnect success
subscription recovery
state mismatches
unknown-order incidents
```

---

# ‏272. החלטת API ראשונה אינה קבועה לנצח

‏ייתכן MVP עם `TWS API` ובהמשך מעבר ל־Web API או להפך.

‏אם abstraction נכון, זה project ולא rewrite של Strategy.

---

# ‏273. בחירת `TWS API` עבור C# — Hypothesis

‏מאחר שיש SDK רשמי ל־C# והמערכת שלנו backend-oriented, `TWS API` הוא מועמד טבעי ל־POC execution.

‏אבל זו Hypothesis שצריכה benchmark, לא החלטת אמונה.

---

# ‏274. בחירת `Web API` — Hypothesis

‏Web API יכול להתאים יותר אם נרצה service-oriented integration ו־WebSocket/REST stack.

‏גם כאן צריך למדוד session lifecycle וה־pacing תחת workload שלנו.

---

# ‏275. Decision Record עתידי

‏אחרי POC נכתוב ADR:

```text
ADR: IBKR API choice
Context
Alternatives
Measurements
Decision
Consequences
Revisit conditions
```

---

# ‏276. Checklist — Account

- ‏ה־Account הספציפי מזוהה.
- ‏ה־Username הספציפי מזוהה.
- ‏Environment ברור.
- ‏Trading permissions ידועים.
- ‏Automation disclosure תקין.
- ‏Market-data agreements תקינים.

---

# ‏277. Checklist — Session

- ‏Authentication עובד.
- ‏Competing session behavior נבדק.
- ‏Restart behavior נבדק.
- ‏Reconnect נבדק.
- ‏Reauthentication runbook קיים.

---

# ‏278. Checklist — Market Data

- ‏Real-Time/Delayed mode מזוהה.
- ‏Subscriptions ידועות.
- ‏Market Data Lines נמדדות.
- ‏Staleness gate קיים.
- ‏Renewal/resubscribe נבדק.
- ‏Cross-provider mapping נבדק.

---

# ‏279. Checklist — Orders

- ‏IDs נשמרים.
- ‏Partial fills עובדים.
- ‏Cancel race עובד.
- ‏Rejects מנורמלים.
- ‏Unknown state נתמך.
- ‏Duplicate protection קיים.

---

# ‏280. Checklist — Recovery

- ‏Process restart.
- ‏Gateway restart.
- ‏Network disconnect.
- ‏Missed event.
- ‏Manual external order.
- ‏Position mismatch.
- ‏Pacing error.

---

# ‏281. Checklist — Promotion

- ‏Replay green.
- ‏Shadow green.
- ‏Paper green.
- ‏Conformance suite green.
- ‏Operational invariants green.
- ‏No unexplained mismatches.

---

# ‏282. מה צריך לזכור בעל־פה

```text
IBKR execution != whole-market data assumption
username != account
connected != ready
submitted != filled
timeout != failed
local state != broker truth
paper fill != live fill
reconnect != recovery
```

---

# ‏283. השאלה המרכזית עבור הרובוט שלנו

‏לא:

> ‏“איך שולחים BUY ב־IBKR?”

‏אלא:

> ‏“האם אנחנו יכולים לזהות Opportunity, לאמת אותה, לשלוח Intent אחד בלבד, לדעת בוודאות מה קרה לו, ולשחזר את כל הסיפור גם אחרי תקלה?”

---

# ‏284. תרגיל מסכם

‏תכנן sequence הבא:

```text
09:45:00.000 Scanner ranks XYZ #1
09:45:00.120 Risk approves
09:45:00.150 Order submit starts
09:45:00.170 network disconnects
09:45:00.400 broker receives order
09:45:00.600 40 shares fill
09:45:01.000 app reconnects
```

‏ענה:

1. ‏מה ה־local state בכל נקודה?
2. ‏מה אנחנו יודעים ומה איננו יודעים?
3. ‏מתי אסור לשלוח retry?
4. ‏איזה broker data צריך לבקש אחרי reconnect?
5. ‏מה ה־actual position?
6. ‏מתי מותר לפתוח עסקה חדשה?

‏אם התשובה כוללת “פשוט שולחים שוב” — צריך לחזור לפרק.

---

# ‏285. סיכום

‏`IBKR` נותנת לנו stack עשיר מאוד לביצוע, account state ו־market data, עם `TWS API`, ‏`Web API` וכלים נוספים.

‏אבל מערכת מקצועית אינה “מחוברת ל־IBKR”.

‏היא בנויה כך ש־IBKR הוא Adapter אחד בתוך architecture עם:

```text
explicit sessions
explicit pacing
explicit data entitlements
explicit order lifecycle
explicit reconciliation
explicit recovery
```

‏עבור הרובוט שלנו, המסקנה החשובה ביותר היא:

> ‏**אין סיבה לדרוש מאותו ספק לפתור גם Whole-Market Discovery וגם Execution. נבחר כל רכיב לפי ה־SLA וה־capacity שהוא צריך לספק, ונשמור את ה־Strategy עצמאית מהספק.**

---

# ‏מקורות רשמיים שנבדקו — 2026-10-26

‏המספרים וההתנהגויות התלויות־ספק בפרק זה נבדקו מול מקורות רשמיים/ראשוניים:

- ‏IBKR Campus — `TWS API Introduction`.
- ‏IBKR Campus — `Web API Session Authentication` ו־Trading Session Management.
- ‏IBKR Campus — `Web API Pacing Limitations`.
- ‏IBKR Campus — `Web API Market Data Request` ו־Market Data Update Frequency.
- ‏IBKR Campus — `Market Data Lines` ו־Specialized Market Data Lines.
- ‏IBKR Campus — `TWS Data vs API Data`.
- ‏IBKR Campus — `Paper Trading Account`.
- ‏IBKR Campus — `General Third Party FAQ`.
- ‏IBKR Campus — Automation and Software Disclosure.
- ‏IBKR Campus — API Changelog.
- ‏Interactive Israel — דף `API` המקומי והבהרת מבנה השירות המקומי.

‏לפני Production יש לאמת מחדש כל limit או behavior מספרי.