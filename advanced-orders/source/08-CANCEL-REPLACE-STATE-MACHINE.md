# ‏חלק 8 — Cancel/Replace ו־Execution State Machine: להפוך פקודות למערכת אמינה

## ‏8.1 מכאן והלאה הבעיה המרכזית אינה `Order Type` — אלא אמת מערכתית

‏אפשר לבחור `Marketable Limit`, ‏`IOC`, ‏`Pegged`, ‏`Adaptive` או `Bracket` בצורה מושלמת, ועדיין להפסיד בגלל מנוע שחושב ש־Order בוטלה כאשר היא עדיין יכולה להתבצע.

‏לכן מערכת Production צריכה לענות בכל רגע:

```text
What did strategy want?
What commands did we send?
What did broker acknowledge?
What actually executed?
What is still potentially executable?
What is our real position now?
```

‏זה הלב של Execution State Machine.

---

## ‏8.2 ארבע שכבות אמת שאסור לערבב

‏נפריד בין:

```text
INTENT TRUTH
COMMAND TRUTH
BROKER-OBSERVED TRUTH
EXECUTION / POSITION TRUTH
```

‏`Intent Truth` אומרת מה האסטרטגיה רוצה עכשיו.

‏`Command Truth` אומרת אילו submit/modify/cancel requests שלחנו.

‏`Broker-Observed Truth` היא ה־state האחרון שה־Broker דיווח.

‏`Execution Truth` היא מה שבוצע בפועל — וממנה נגזרת Position.

‏הטעות המסוכנת היא להחליף אחת בשנייה.

---

## ‏8.3 Command אינה Fact

‏קריאה:

```text
placeOrder(...)
```

‏אינה עובדה שה־Order התקבלה.

‏קריאה:

```text
cancelOrder(...)
```

‏אינה עובדה שה־Order בוטלה.

‏קריאה:

```text
placeOrder(existingOrderId, modifiedOrder)
```

‏אינה עובדה שה־Modify נכנס לתוקף.

‏לכן כל command יוצרת `REQUESTED` state עד evidence מתאים.

---

## ‏8.4 מודל State בסיסי ל־Order יחידה

```text
LOCAL_CREATED
  ↓
SUBMIT_REQUESTED
  ↓
SUBMITTED / PRESUBMITTED / HELD
  ├── PARTIALLY_FILLED
  ├── MODIFY_REQUESTED
  ├── CANCEL_REQUESTED
  ├── FILLED
  ├── CANCELLED
  ├── REJECTED
  └── INACTIVE / UNKNOWN
```

‏לא כל Broker status חייב להפוך אחד־לאחד ל־state פנימי. המטרה היא לשמור semantics שאנחנו יכולים להגן עליהן.

---

## ‏8.5 `Terminal` אינה מילה נרדפת ל־"אני גמרתי לחשוב על Order"

‏גם אחרי status שנראה terminal, המנוע יכול עדיין לקבל מידע שדורש reconciliation — למשל Execution שטרם עובד אצלנו או תיקון Execution.

‏לכן אנחנו מפרידים:

```text
broker_order_terminal
execution_reconciliation_complete
position_reconciliation_complete
```

‏ורק השילוב ביניהם מאפשר לסגור lifecycle עסקי בביטחון.

---

## ‏8.6 מזהים: Order אחת צריכה יותר ממספר אחד

‏ב־IBKR רלוונטיים לפחות:

```text
internal_order_id
orderId
permId
clientId
orderRef
execId per execution
```

‏`internal_order_id` הוא שלנו וצריך להישאר יציב גם אם API binding או recovery משנים identifiers חיצוניים.

‏כך איננו הופכים מזהה של Broker ל־primary key העסקי של כל המערכת.

---

## ‏8.7 `orderId` הוא מזהה API — לא מזהה עסקי גלובלי

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־`orderId` הוא מזהה של ה־API client, וש־Order חדשה עם ID שכבר שימש אינה חוקית; reuse של אותו `orderId` נועד למעשה ל־modify של Order פתוחה.

‏לכן allocation של IDs צריך להיות רכיב מסודר, לא `counter++` שמאותחל שרירותית בכל restart.

---

## ‏8.8 `nextValidId` הוא חלק מ־connection readiness

> ‏אימות אחרון: `2026-10-27`.

‏ב־TWS API, ה־handshake מחזיר בין היתר את ה־next valid order identifier. IBKR מזהירה שבקשות שנשלחות לפני שהחיבור הושלם ו־`nextValidID` התקבל עלולות להיזרק.

‏לכן:

```text
socket connected
!=
execution engine ready to send orders
```

‏נרצה state כגון:

```text
DISCONNECTED
CONNECTING
HANDSHAKING
RECONCILING
READY
```

---

## ‏8.9 `permId` הוא עוגן חשוב ל־reconciliation

‏IBKR מתעדת את `permId` כ־Host order identifier; הוא שימושי במיוחד כאשר אותו Order מקבלת API `orderId` שונה אחרי binding/session אחר.

‏לכן mapping פנימי צריך להיות מסוגל לומר:

```text
internal_order_id
<-> permId
<-> clientId/orderId binding(s)
```

‏ולא להניח `orderId` אחד לכל חיי Order בכל session.

---

## ‏8.10 `execId` הוא מזהה Fill — וכל Partial Fill היא אירוע עצמאי

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שלכל partial fill יש `execId` נפרד. היא גם מתעדת Execution corrections באמצעות `execId` שונה בחלק שאחרי הנקודה האחרונה.

‏לכן deduplication של Fills צריך להתבסס על Execution identity ולא רק על:

```text
orderId + price + qty
```

‏שני fills אמיתיים יכולים להיות זהים במחיר ובכמות.

---

## ‏8.11 `orderRef` — מקום טוב ל־correlation, לא ל־state היחיד

‏IBKR מאפשרת `orderRef` מותאם משתמש שנשאר מקושר ל־Order.

‏אנחנו יכולים להשתמש בו כדי לקשור Broker Order ל־:

```text
strategy_instance
signal_id
trade_intent_id
internal_order_id
```

‏אבל עדיין נשמור mapping מקומי מפורש; לא נבנה recovery שתלויה במחרוזת אחת בלבד.

---

## ‏8.12 ארבעה streams שצריך לעבד יחד

> ‏אימות אחרון: `2026-10-27`.

‏IBKR ממליצה במערכת Order robust לעקוב לפחות אחרי:

```text
error
openOrder
orderStatus
execDetails
```

‏כל אחד מספר חלק אחר של הסיפור.

‏`openOrder` נותנת snapshot עשיר של Order ו־OrderState.

‏`orderStatus` מתאר changes/status/filled/remaining.

‏`execDetails` מתאר executions בפועל.

‏`error` יכולה לשאת rejection, warning או operational failure שחייבים לשלב ב־state.

---

## ‏8.13 `orderStatus` יכולה להגיע כפול — וזה תקין

> ‏אימות אחרון: `2026-10-27`.

‏בחומר ההדרכה של IBKR מצוין שב־`orderStatus` יכולים להיות duplicate callbacks ושעל API client להיות מוכן לסנן אותם.

‏לכן event handler חייב להיות idempotent:

```text
same status twice
=> no second business action
```

‏בפרט, callback כפולה של `Filled` אסור שתייצר Exit כפולה.

---

## ‏8.14 אסור לבנות State Machine שתלויה במספר callbacks קבוע

‏מנוע לא יכתוב:

```text
submit
expect PreSubmitted
then Submitted
then Filled
```

‏כפרוטוקול קשיח.

‏המערכת צריכה לעבוד לפי facts שהתקבלו ולפי invariants, גם אם intermediate observation לא הגיע בצורה שציפינו.

‏`execDetails` של Fill הוא אירוע עסקי חשוב יותר מהנחה שהיינו חייבים קודם לראות כל status אפשרי.

---

## ‏8.15 Fills הם מקור האמת ל־Position

‏Order status יכולה לומר cumulative filled, אבל Position ledger שלנו צריך להיבנות מאירועי Execution מאומתים ולהיבדק מול Broker position state.

‏כל Execution מעדכנת:

```text
filled_qty
position_qty
average_entry_or_exit_price
remaining_intent_qty
protection_qty
```

‏ה־requested quantity אינה Position.

---

## ‏8.16 Invariant כמות בסיסי

‏ל־Order רגילה:

```text
filled_qty + remaining_qty <= current_order_quantity
```

‏ובהיעדר corrections/edge cases מיוחדים, expected relation היא:

```text
filled_qty + remaining_qty == total_quantity
```

‏אבל המנוע לא יתקן broker data בכוח כדי להתאים למשוואה; mismatch הוא trigger ל־reconciliation.

---

## ‏8.17 Modify ב־IBKR הוא `placeOrder` עם אותו `orderId`

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת Modify של API Order באמצעות קריאה נוספת ל־`placeOrder` עם אותו `orderId` של Order הפתוחה ועם השדות המעודכנים.

‏זו semantics חשובה:

```text
same orderId
+
changed allowed fields
=> modification request
```

‏ולא Order חדשה מבחינת ה־API intent.

---

## ‏8.18 IBKR ממליצה לצמצם In-Place Modify לשדות פשוטים

> ‏אימות אחרון: `2026-10-27`.

‏בתיעוד הנוכחי IBKR אומרת שבדרך כלל לא מומלץ לשנות שדות מעבר ל־price, size ו־`TIF` במעבר `DAY -> IOC`; לשינויים אחרים עדיף לעיתים לבטל וליצור Order חדשה.

‏לכן adapter שלנו יסווג:

```text
SAFE_MODIFY_CANDIDATE
vs
CANCEL_AND_NEW_CANDIDATE
```

‏ולא ינסה להפוך כל Order family לצורה אחרת באמצעות אותו ID.

---

## ‏8.19 Modify יכולה להידחות מפני שה־Order עדיין Processing

> ‏אימות אחרון: `2026-10-27`.

‏Error `2102` של IBKR מתאר מצב שבו מנסים לבצע Modify לפני שה־Order הקודמת סיימה processing.

‏מכאן כלל:

```text
MODIFY_REQUESTED
=> wait for appropriate broker progress
=> do not spam another modify immediately
```

‏לולאת repricing מהירה חייבת backpressure.

---

## ‏8.20 Modify אינה פעולה מקומית על Object

‏אם שינינו:

```text
localOrder.lmtPrice = 50.03
```

‏לא קרה דבר בשוק.

‏רק לאחר request + broker processing יש לנו evidence שהמחיר החדש שייך ל־Order החיה.

‏לכן נשמור:

```text
desired_price
last_submitted_price
last_acknowledged_price
```

‏כשלושה מושגים שונים.

---

## ‏8.21 Queue Priority היא חלק מהעלות של Modify

‏ב־Passive Order, שינוי מחיר/כמות או cancel/replacement יכול להשפיע על queue priority לפי Venue והפעולה.

‏לכן metric של reprice אינה רק:

```text
new price better/worse
```

‏אלא גם:

```text
queue_age_lost
new_level_join_time
fill_probability_change
```

‏לפעמים tick טוב יותר במחיר אינו מצדיק איבוד queue position שכבר הייתה משמעותית.

---

## ‏8.22 Binding של Order יכולה בעצמה לפגוע ב־Queue

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־binding של Order קיימת דרך API כרוך כיום ב־cancel/resubmit של Order העובדת ב־Exchange ועלול להשפיע על מקומה בתור.

‏זה פרט Production חשוב במיוחד: recovery/ownership operation שנראית "ניהולית" יכולה לשנות execution economics.

‏לכן לא עושים bind מיותר רק כדי שיהיה נוח לקוד.

---

## ‏8.23 `reqOpenOrders` ו־`reqAllOpenOrders` אינם אותו דבר

> ‏אימות אחרון: `2026-10-27`.

‏לפי IBKR, `reqOpenOrders` יכולה bind Orders פתוחות שלא קיבלו API order ID בהקשר המתאים; `reqAutoOpenOrders` יכולה bind Orders עתידיות; ואילו `reqAllOpenOrders` אינה מבצעת binding.

‏לכן recovery code חייב לדעת אם הוא רק **צופה** ב־Orders או גם משנה ownership/binding semantics.

---

## ‏8.24 Cancel הוא Request — לא Delete

‏כאשר המנוע מחליט שה־Signal מת:

```text
state = CANCEL_REQUESTED
```

‏ה־Order נשארת `potentially executable` עד שיש evidence שהיא כבר לא יכולה לבצע או עד reconciliation שמוכיח זאת.

‏זה invariant בסיסי לכל המנוע.

---

## ‏8.25 Late Fill אחרי Cancel Request אינו Contradiction

‏תרחיש:

```text
09:30:00.100 cancel sent
09:30:00.101 venue matches order
09:30:00.105 cancel processed
09:30:00.110 fill reaches client
```

‏מבחינת המנוע, ה־Fill היא אמת.

‏לא כותבים:

```text
if cancel_requested:
    ignore execution
```

‏אלא להפך: Fill בתקופת cancel-in-flight היא אירוע שחייב לעדכן Position מיד.

---

## ‏8.26 שגיאת Cancel אינה הוכחה שה־Order עדיין חיה

‏IBKR מתעדת errors כגון:

```text
135 = cannot find order
136 = order cannot be cancelled
```

‏תגובה נכונה אינה לנחש את ה־state מתוך error code בלבד.

‏נבקש/נבנה reconciliation של open orders + executions + position ונחליט לפי Broker truth.

---

## ‏8.27 `Cancel/Replace` בטוח הוא Two-Phase Protocol

‏כאשר אנחנו רוצים לעבור מ־Order A ל־Order B:

```text
Phase 1:
request cancel A
track A as potentially executable

Phase 2:
reconcile A fills/terminal state
compute true remaining intent
submit B only for safe remaining quantity
```

‏זה איטי יותר מ־"cancel ואז מיד new", אבל מונע overfill.

---

## ‏8.28 למה `Cancel then immediately New` מסוכן

‏נניח:

```text
want 100 shares
A remaining locally = 100
cancel A
immediately submit B for 100
```

‏אם A מקבלת late fill של 60:

```text
A fill = 60
B can fill = 100
=> total = 160
```

‏לכן replacement quantity נגזרת מ־**actual cumulative fills**, לא מ־מה שחשבנו לפני cancel.

---

## ‏8.29 Fast Reprice דורשת Policy מפורשת לסיכון Overlap

‏לפעמים waiting for terminal cancel יכול להיות יקר לסיגנל של מאות מילישניות.

‏אם נרצה deliberate overlap כדי לחסוך latency, זה צריך להיות mode מוגדר עם bound:

```text
max_possible_fill_across_old_and_new <= position_limit
```

‏לא bug שנוצר בגלל impatience.

‏זו החלטת Risk/Execution מתקדמת שתיכנס רק אחרי simulation ו־acceptance tests.

---

## ‏8.30 Revision Number מונע Modify ישן מלנצח חדש

‏לכל Order פנימית נשמור:

```text
revision = 0,1,2,...
```

‏כל intent לשינוי מקבל revision חדשה.

‏אם callback או timeout שייך ל־revision ישנה, הוא יכול לעדכן Broker observation אבל **לא** להחזיר את desired state לאחור.

‏כך נמנעת תופעה של stale asynchronous completion.

---

## ‏8.31 `Desired State` מול `Observed State`

‏מודל חשוב:

```text
desired:
  price = 50.03
  qty = 60
  should_be_live = true

observed:
  broker price = 50.02
  remaining = 73
  status = Submitted
```

‏הפער הוא לא bug אוטומטי; הוא אומר שיש פעולה in-flight או mismatch שדורש reconciliation.

‏State Machine צריכה לייצג את הפער במקום למחוק אותו.

---

## ‏8.32 Command Ledger — כל side effect מקבל זהות

‏נשמור לכל command:

```text
command_id
internal_order_id
revision
command_type
created_ts
sent_ts
result_observed_ts
status
reason
```

‏כך אפשר לענות אחרי crash:

> ‏האם שלחנו את ה־Cancel, או רק החלטנו לשלוח אותו?

‏במערכת כסף אמיתי זו שאלה מהותית.

---

## ‏8.33 Idempotency מתחילה לפני Broker API

‏נניח שה־Scanner שולח אותו Signal פעמיים בגלל retry.

‏בלי `intent_id` יציב:

```text
signal retry
=> second BUY
```

‏לכן execution layer צריכה deduplication גם ברמת Trade Intent:

```text
(strategy_instance, signal_id, intent_version)
```

‏Broker order IDs לבדם אינם פותרים duplicate business intent.

---

## ‏8.34 `At-Least-Once` Thinking עדיפה על הנחת Exactly-Once

‏במערכת מבוזרת קל לקבל:

```text
request sent
connection drops
client did not see acknowledgement
```

‏אין לנו זכות להסיק שה־request לא הגיע.

‏לכן recovery philosophy היא:

```text
commands may be ambiguous
observations may repeat
facts must be reconciled
```

‏במקום לבנות על exactly-once illusion.

---

## ‏8.35 Ambiguous Submit הוא אחד המצבים המסוכנים ביותר

‏תרחיש:

```text
placeOrder sent
socket breaks
no callback seen
```

‏אסור לבצע מיד retry כ־Order חדשה.

‏ייתכן שהראשונה כבר חיה אצל IBKR.

‏נכנסים ל־:

```text
SUBMIT_UNKNOWN
```

‏ומבצעים reconciliation לפני יצירת exposure נוסף.

---

## ‏8.36 Ambiguous Cancel גם דורשת State משלה

‏אם:

```text
cancel sent
connection breaks
```

‏אין לנו מידע אם Order עדיין חיה.

‏State:

```text
CANCEL_UNKNOWN
```

‏דורשת open-orders/executions/positions reconciliation לפני fallback action שעלולה להתנגש ב־Order הישנה.

---

## ‏8.37 Reconnect אינו `onConnected -> resumeTrading()`

‏אחרי reconnect המנוע המקומי הוא potentially stale.

‏הזרימה הנכונה:

```text
CONNECTED
↓
HANDSHAKE_READY
↓
FREEZE_NEW_RISK
↓
FETCH / RECEIVE BROKER STATE
↓
RECONCILE
↓
VALIDATE INVARIANTS
↓
READY
```

‏רק אז חוזרים לקבל Entries חדשות.

---

## ‏8.38 Broker Truth אחרי Reconnect

‏נאסוף לפחות:

```text
open orders
recent executions
positions
account/order ownership metadata
```

‏ואז נשווה ל־local persisted ledger.

‏הזיכרון המקומי הוא hypothesis; broker executions ו־positions הם evidence שחייבים ליישב איתו.

---

## ‏8.39 `reqExecutions` / Execution History היא חלק מה־Recovery

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מאפשרת לבקש Executions לפי `ExecutionFilter`, כולל זמן, account, symbol, side ועוד; בתיעוד הנוכחי קיימים גם שדות לבקשת ימים/תאריכים אחרונים בטווח הנתמך.

‏זה מאפשר ל־recovery לחפש fills שקרו בזמן שה־client היה מנותק ולא להסתמך רק על live callbacks.

---

## ‏8.40 Unknown Broker Order היא Incident, לא משהו שמוחקים

‏אם Broker מחזירה Order חיה שאין לנו ב־local ledger:

```text
UNKNOWN_BROKER_ORDER
```

‏לא מבטלים אותה אוטומטית לפני שמבינים:

```text
manual order?
other client?
old process generation?
bracket child?
system-generated order?
```

‏Cancel אוטומטי עיוור יכול להסיר protection חשובה.

---

## ‏8.41 Missing Broker Order גם היא Incident

‏אם local state אומר:

```text
WORKING
```

‏אבל reconciliation לא מוצאת אותה ב־open orders, אין להסיק מיד `CANCELLED`.

‏ייתכן שהיא:

```text
filled
cancelled
rejected
expired
not visible in the queried scope
```

‏צריך לבדוק executions/position/terminal records המתאימים.

---

## ‏8.42 Manual Orders ו־API Orders חייבות Ownership Classification

‏מערכת יכולה לפגוש Order שנוצרה ב־TWS ידנית או מ־API client אחר.

‏נשמור למשל:

```text
ownership = OUR_ENGINE | MANUAL | OTHER_CLIENT | UNKNOWN
```

‏ורק `OUR_ENGINE` מקבלת אוטומציה מלאה כברירת מחדל.

---

## ‏8.43 `clientId=0` נותן כוח — ולכן דורש זהירות

‏IBKR מתעדת ש־binding של manual/TWS Orders לצורך modify/cancel נעשה דרך client ID 0, וש־`reqAutoOpenOrders` בהקשר הזה יכולה bind Orders עתידיות.

‏זה שימושי ל־recovery/control plane, אבל גם מרחיב את מה שהקוד מסוגל להשפיע עליו.

‏לכן ownership guard הוא חובה.

---

## ‏8.44 Multiple Clients: `permId` חשוב יותר מ־orderId בלבד

‏Order יכולה לקבל bindings שונים בהקשרי TWS users/clients, בעוד `permId` מסייע לזהות אותה ברמת Host.

‏לכן cross-client reconciliation לא ייעשה על:

```text
orderId alone
```

‏אלא על composite identity ומידע Broker נוסף.

---

## ‏8.45 State צריך להיות Persisted לפני Side Effects קריטיים

‏לפני submit/modify/cancel נשמור את ה־intent/command כך שאחרי crash נוכל לדעת שהיה side effect מתוכנן או נשלח.

‏רעיון:

```text
persist command intent
flush durable state
send broker command
persist observed result asynchronously
```

‏המימוש המדויק תלוי storage, אבל העיקרון הוא שלא נשמור רק RAM state.

---

## ‏8.46 Event Log עדיף על Snapshot יחיד בלבד

‏Snapshot אומר:

```text
status = PARTIALLY_FILLED
filled = 37
```

‏Event log יכול להסביר:

```text
submit
ack
fill 20
modify requested
fill 17 during modify
modify ack
cancel requested
cancel confirmed
```

‏ל־debug/replay/incident analysis זה הבדל עצום.

‏לכן נשמור גם Current State וגם append-only execution events.

---

## ‏8.47 Duplicate Event לא צריך ליצור Duplicate Side Effect

‏כל event processor צריך לענות:

```text
Have I already applied this fact?
```

‏לדוגמה:

```text
execId already applied
=> do not add quantity again
```

‏ו־status duplicate יכולה להישמר ב־raw telemetry בלי להפעיל שוב transition עסקי.

---

## ‏8.48 Out-of-Order Thinking

‏גם בלי להניח שה־Broker מבטיחה סדר שרירותי מסוים בין כל סוגי callbacks, המנוע צריך להיות מסוגל לעבד מידע אסינכרוני שלא הגיע בדיוק ברצף שה־UI היה מציג.

‏לדוגמה, אם Fill evidence מגיע לפני שעיבדנו snapshot חדש של `remaining`, אין סיבה להמתין כדי לעדכן Position.

‏ה־reducers שלנו צריכים לעבוד לפי identities, cumulative facts ו־invariants.

---

## ‏8.49 State Transition חייבת להיות Monotonic מבחינת Facts

‏Desired state יכולה להשתנות קדימה ואחורה, אך Fact שכבר התרחש לא נעלם:

```text
execution happened
=> cannot be "unfilled" later
```

‏אם מתקבלת Correction, היא אירוע חדש שמתקן Fact קודמת — לא מחיקה שקטה של היסטוריה.

‏זה עיקרון חשוב ל־auditability.

---

## ‏8.50 `Filled` Order יכולה עדיין לדרוש פעולות מערכת

‏אחרי Entry מלאה ייתכן שצריך:

```text
activate/verify protection
cancel competing entries
update position
start exit policy
record execution costs
```

‏לכן:

```text
ORDER_FILLED
!=
TRADE_LIFECYCLE_COMPLETE
```

‏זו הבחנה חשובה במיוחד ב־Bracket/Hybrid Exit.

---

## ‏8.51 Position היא Aggregation מעל Executions

‏Order State אינה Position State.

‏יכולות להיות מספר Orders שמשפיעות על אותה Position:

```text
entry A
entry B
manual fill
profit exit
protective stop
```

‏לכן Position service צריכה aggregate Executions ולבדוק מול Broker Position — לא לקרוא `filled` מ־Order אחת ולהכריז על exposure.

---

## ‏8.52 Quantity Budget מונע Overfill בין Orders מתחרות

‏לכל Trade Intent נגדיר:

```text
target_qty
confirmed_filled_qty
potential_fill_qty_from_live_orders
remaining_safe_qty
```

‏Invariant:

```text
confirmed_filled_qty
+ potentially_executable_entry_qty
<= allowed_max_qty
```

‏אלא אם policy מפורשת מרשה overlap מוגבל.

---

## ‏8.53 `Potentially Executable` היא קטגוריה קריטית

‏נכניס אליה לפחות:

```text
Submitted
PreSubmitted when eligible to progress
PartiallyFilled remainder
ModifyPending old/new uncertainty
CancelPending
SubmitUnknown after disconnect
```

‏כך risk calculation אינה מסתכלת רק על Orders שנראות "Working" בצורה נוחה.

---

## ‏8.54 Bracket יושבת מעל אותה State Machine — לא מערכת נפרדת

‏ה־parent, TP ו־Stop משתמשות באותם primitives:

```text
submit
modify
cancel
fill
reconcile
ownership
```

‏Bracket מוסיפה graph relationships ו־invariants, אבל אסור לבנות לה execution stack שני ונפרד.

‏אחרת יהיו לנו שני מנגנוני race-handling שונים עם bugs שונים.

---

## ‏8.55 Broker Algos גם הן Orders מבחינת lifecycle

‏`Adaptive`, ‏`MidPrice` ו־Pegged broker-managed orders אינן פטורות מה־state machine.

‏כאשר Signal מת:

```text
cancel requested
```

‏וה־Algo נשארת potentially executable עד confirmation/reconciliation.

‏Delegating `HOW` ל־Broker לא מעביר אליו ownership של `WHETHER`.

---

## ‏8.56 Market Data Health ו־Order State חייבים להתחבר

‏אם Data שלנו stale אבל Order broker-resident ממשיכה לעבוד, engine לא יכולה להעריך Signal validity.

‏Policy אפשרית:

```text
market_data_health = DEGRADED
=> block new entries
=> cancel vulnerable client-managed entries
=> preserve/verify safety exits according to risk policy
```

‏לא מבטלים protective orders אוטומטית רק מפני ש־data feed מקומי נפל.

---

## ‏8.57 Connectivity Error אינה בהכרח Order Error

‏Network/API disconnect אומר שהיכולת שלנו **לראות ולשלוט** ירדה.

‏הוא אינו אומר שכל broker-resident Orders נעלמו.

‏לכן `DISCONNECTED` מגדיל uncertainty; הוא לא מאפס State.

---

## ‏8.58 `maintainAndResubmitOrdersOnReconnect` היא Capability שדורשת Policy

> ‏אימות אחרון: `2026-10-27`.

‏ב־API settings הנוכחיים של IBKR קיים `maintainAndResubmitOrdersOnReconnect`, שמתואר כיכולת להגיש Orders שניסו להישלח בזמן ניתוק לאחר reconnect.

‏זו התנהגות שיכולה להיות נוחה, אבל בסיגנל קצר היא מסוכנת אם Order שהייתה נכונה בזמן הניתוק כבר stale בזמן החיבור מחדש.

‏לכן לא מפעילים semantics כאלה בלי להבין כיצד הן משתלבות עם Signal TTL ו־generation guards שלנו.

---

## ‏8.59 Recovery Generation מונעת מתהליך ישן להמשיך לפעול

‏בכל startup/reconnect cycle נגדיר:

```text
recovery_generation
```

‏Orders/commands מקומיות יקושרו לדור שבו נוצרו.

‏אם callback ישנה מופיעה אחרי recovery, היא עדיין יכולה להכיל Fact אמיתי, אבל אסור לה להפעיל logic של generation קודמת בלי validation.

---

## ‏8.60 `READY` הוא State שצריך להרוויח

‏מנוע לא עובר ל־READY רק מפני שיש socket.

‏לפחות:

```text
connection handshake complete
order-id allocator valid
open orders reconciled
recent executions reconciled
positions reconciled
unknown orders classified
critical invariants pass
market data healthy enough
```

‏רק אז Entry חדשה מותרת.

---

## ‏8.61 Retry Policy צריכה להבדיל בין Failure Classes

‏לא כל failure מקבל retry זהה.

```text
transport failure
validation rejection
unsupported order type
price increment error
order still processing
order already terminal
venue unavailable
```

‏תגובה של:

```text
retry immediately forever
```

‏היא anti-pattern.

‏חלק דורשים backoff, חלק recompute, חלק capability fallback, וחלק stop מוחלט.

---

## ‏8.62 Error `134` מלמד את עקרון ה־Reconciliation

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתארת `134 — Modify order failed` ומציינת שה־Order אולי כבר executed או cancelled ושיש לבקש open orders כדי לאמת current status.

‏זו בדיוק הפילוסופיה שלנו:

```text
unexpected broker response
=> observe truth
=> reconcile
=> decide
```

‏ולא:

```text
unexpected response
=> blindly retry command
```

---

## ‏8.63 Order Efficiency ו־Message Churn הם Constraint תפעולי

‏IBKR מלמדת גם על Order Efficiency Ratio בהקשר של submissions/modifications/cancellations לעומת executions.

‏עבור client-side chase מהיר, זו סיבה נוספת לא לייצר:

```text
modify every quote tick
```

‏בלי threshold משמעותי.

‏מעבר לסיכון queue/races, message churn עצמו צריך telemetry ו־limits.

---

## ‏8.64 Reprice Policy נכונה משתמשת ב־Hysteresis

‏במקום:

```text
if bid changed by 1 tick:
    modify immediately
```

‏נרצה תנאים כגון:

```text
minimum_price_improvement
minimum_time_since_last_modify
signal_still_valid
expected_gain_from_reprice > queue_loss_cost
revision not already in flight
```

‏כך נמנעת oscillation סביב quote noise.

---

## ‏8.65 State Machine מוצעת ל־Order יחידה

```text
CREATED
  ↓
SUBMIT_REQUESTED
  ├── SUBMIT_UNKNOWN
  ├── REJECTED
  └── WORKING
       ├── PARTIAL
       ├── MODIFY_REQUESTED
       │    ├── MODIFY_UNKNOWN
       │    ├── MODIFY_REJECTED
       │    └── WORKING(new revision)
       ├── CANCEL_REQUESTED
       │    ├── CANCEL_UNKNOWN
       │    ├── PARTIAL / FILLED
       │    └── CANCELLED
       └── FILLED
```

‏ומעליה global modes:

```text
NORMAL
RECOVERING
DEGRADED
FROZEN
```

---

## ‏8.66 Events שאנחנו רוצים לנרמל בתוך המנוע

‏Broker adapter יתרגם API-specific callbacks ל־events פנימיים כגון:

```text
ORDER_ACCEPTED
ORDER_WORKING
ORDER_REJECTED
ORDER_MODIFIED
ORDER_CANCEL_REQUESTED
ORDER_CANCELLED
EXECUTION_RECORDED
EXECUTION_CORRECTED
ORDER_HELD
CONNECTION_LOST
CONNECTION_RESTORED
RECONCILIATION_STARTED
RECONCILIATION_COMPLETED
```

‏כך Strategy אינה מכירה `EWrapper` או codes של IBKR.

---

## ‏8.67 Commands שאנחנו רוצים לנרמל

```text
SUBMIT_ORDER
MODIFY_ORDER
CANCEL_ORDER
CANCEL_GROUP
REQUEST_OPEN_ORDERS
REQUEST_EXECUTIONS
REQUEST_POSITIONS
```

‏Command handler אחראי ל־validation, capability, sequencing ו־persistence לפני side effect.

---

## ‏8.68 Invariants שחייבים לעבור אחרי כל Event

```text
filled quantity never applied twice
position derives from executions, not requested orders
no new entry while execution state is UNKNOWN/RECOVERING
no replacement assumes cancel is final before evidence
potential entry exposure <= configured max
potential exit exposure cannot silently reverse position
all live orders have ownership classification
all bracket children map to valid trade/position state
all command revisions are monotonic
```

‏Invariant failure מעבירה את המנוע ל־`FROZEN/RECOVERING`, לא ל־"log warning and continue".

---

## ‏8.69 Failure Matrix כללית

| מצב | מה איננו יודעים | הסיכון | תגובה עקרונית |
|---|---|---|---|
| Submit נשלחה, אין Ack | האם Order חיה | duplicate entry | `SUBMIT_UNKNOWN` + reconcile |
| Modify נשלח, connection נפל | איזה revision חיה | stale price/qty | freeze modifications + reconcile |
| Cancel נשלח, אין Ack | האם יכולה להתבצע | late fill/overlap | treat as executable + reconcile |
| Duplicate `orderStatus` | האם זה אירוע חדש | duplicate side effect | dedupe/reducer idempotent |
| Duplicate `execDetails` | האם Fill כבר הוחלה | double position | dedupe by execution identity |
| Partial Fill בזמן Modify | quantity changed mid-flight | over-order | recompute from executions |
| Partial Fill בזמן Cancel | remainder changed | wrong replacement qty | wait/reconcile |
| Unknown broker order | ownership unknown | cancel protection/manual order | classify before action |
| Local working order missing | terminal reason unknown | hidden fill/position mismatch | executions + positions check |
| Restart with live orders | local memory stale | duplicate orders | recovery gate |
| Manual trade during runtime | position changed externally | bracket mismatch | broker position reconciliation |
| Market data stale | signal validity unknown | stale live entry | block/cancel by policy |

---

## ‏8.70 Telemetry שחייבים להוסיף

```text
internal_order_id
trade_intent_id
signal_id
order_ref
broker_order_id
perm_id
client_id
revision
command_id
command_type
command_created_ts
command_sent_ts
command_result_ts
observed_status
observed_price
observed_qty
filled_qty
remaining_qty
last_exec_id
cancel_requested_ts
cancel_terminal_ts
modify_requested_ts
modify_terminal_ts
recovery_generation
ownership_class
state_uncertainty_reason
```

‏ולכל raw event נשמור payload מתומצת/מקור ו־receive timestamp לצורכי replay.

---

## ‏8.71 Metrics תפעוליים

```text
submit_to_ack_ms
modify_to_ack_ms
cancel_to_terminal_ms
late_fill_after_cancel_rate
fill_during_modify_rate
duplicate_status_rate
duplicate_execution_rate
unknown_order_incidents
reconciliation_duration_ms
reconciliation_mismatch_rate
reconnect_to_ready_ms
orders_per_signal
modifies_per_order
cancels_per_order
message_to_execution_ratio
```

‏אלה Metrics של correctness ו־operations, לא רק P&L.

---

## ‏8.72 Acceptance Tests לפני Live

```text
1. submit -> normal ack -> cancel
2. submit -> instant fill before normal ack path
3. duplicate orderStatus
4. duplicate execDetails
5. two identical-price partial fills with distinct execIds
6. partial fill then modify remaining price
7. partial fill during modify request
8. modify rejected because order still processing
9. modify after order already filled
10. cancel before any fill
11. partial fill during cancel
12. full fill during cancel
13. cancel error then reconciliation
14. cancel-and-new with safe remaining quantity
15. connection drop after submit send before ack
16. connection drop after cancel send before ack
17. restart with one broker-resident order
18. restart with partial position and live exit
19. unknown manual order discovered
20. order from another client discovered
21. binding an external/manual order and observing queue implications
22. stale market data while broker order remains live
23. nextValidId readiness gate
24. old-generation callback after reconnect
25. execution correction handling
26. bracket child + local exit race through common state machine
```

‏בלי הבדיקות האלה, Order Type מתקדמת אינה Production capability — היא רק API call שעובדת ב־Happy Path.

---

## ‏8.73 Recommendation ארכיטקטונית למנוע שלנו

‏הייתי בונה את Execution Core סביב חמישה רכיבים:

```text
1. Intent Store
2. Order State Reducer
3. Command Dispatcher
4. Execution / Position Ledger
5. Reconciliation Service
```

‏ומעליהם:

```text
Execution Policy
Routing Policy
Risk / Invariant Guard
```

‏כך `Marketable Limit`, ‏`IOC`, ‏`Pegged`, ‏`Adaptive` ו־`Bracket` הן plugins/policies מעל lifecycle משותף — לא איים נפרדים של קוד.

---

## ‏8.74 למה `Reducer` הוא מודל טוב

‏במקום שכל callback תעשה side effects ישירות:

```text
callback -> place/cancel something immediately
```

‏נעדיף:

```text
broker event
-> normalize
-> persist
-> reduce current state
-> validate invariants
-> derive next commands
```

‏זה הופך duplicate/replay/reconnect לבעיה הרבה יותר נשלטת.

---

## ‏8.75 `Reconciliation` אינה רק מנגנון חירום

‏גם במערכת בריאה כדאי לבצע reconciliation תקופתי/אירועי:

```text
after reconnect
after ambiguous error
after unknown order
after position mismatch
after bracket anomaly
before resuming from degraded state
```

‏המטרה היא למנוע drift בין local model ל־Broker reality.

---

## ‏8.76 למה זה קריטי במיוחד למסחר של שניות

‏ככל שה־TTL קצר יותר, temptation לעשות:

```text
cancel faster
replace faster
retry faster
```

‏גדלה.

‏אבל אותה מהירות מגדילה:

```text
in-flight overlap
message churn
queue resets
state races
ambiguous outcomes
```

‏לכן מנוע מהיר צריך State Machine **חזקה יותר**, לא פחות.

---

## ‏8.77 כלל המפתח שלנו: קודם Correctness, אחר כך Latency Optimization

‏אין ערך לחסוך 20ms אם פעם באלף ניסיונות אנחנו קונים פעמיים או הופכים Position בטעות.

‏סדר העבודה יהיה:

```text
correct
observable
recoverable
measurable
then faster
```

‏רק לאחר שה־state machine מוכחת, נחקור deliberate overlap או aggressive asynchronous techniques.

---

## ‏8.78 Practitioner Secrets — הדברים שקל מאוד לפספס

### ‏1. `cancelOrder()` אינה מחיקה

‏עד terminal evidence, Order נשארת potentially executable.

### ‏2. `placeOrder()` היא גם Submit וגם Modify

‏אותו API call משנה משמעות לפי `orderId` וה־state הקיים.

### ‏3. Binding היא פעולה Execution-sensitive

‏ב־IBKR היא יכולה לבצע cancel/resubmit ולפגוע בתור.

### ‏4. Duplicate callbacks הן חלק מהחיים

‏Idempotency אינה optimization אלא requirement.

### ‏5. Fill identity חשובה יותר מ־status count

‏`execId` מונעת מאיתנו להחיל אותה Execution פעמיים.

### ‏6. Lost Ack אינו Failed Order

‏זה `UNKNOWN` עד reconciliation.

### ‏7. Restart אינו Reset

‏Broker-resident Orders ו־Positions יכולות לשרוד את ה־process שלנו.

### ‏8. Queue Priority היא State כלכלי

‏Modify/Bind/Cancel-Replace יכולים לשנות אותה, גם אם price בסוף זהה.

### ‏9. `orderId` אינו Global Business ID

‏Internal ID + `permId` + binding metadata נותנים מודל אמין יותר.

### ‏10. Error Message אינה Truth מלאה

‏ב־ambiguous modify/cancel failure, בודקים Broker state במקום לנחש.

### ‏11. Safety Exit ו־Entry stale order אינן מטופלות אותו דבר בזמן Data Failure

‏לעיתים צריך לבטל Entry, אבל דווקא לשמר/לאמת protective Stop.

### ‏12. Fast Engine חייב Backpressure

‏אם Modify עדיין processing, עוד Modify אינה בהכרח "מהירה יותר" — היא יכולה להידחות או לייצר churn.

### ‏13. State Machine אחת לכל Order families

‏אם Bracket, Pegged ו־Adaptive מקבלות lifecycle engines שונים, bugs של reconciliation יתרבו.

### ‏14. `READY` היא מסקנה, לא socket state

‏רק אחרי reconciliation ו־invariants המנוע רשאי לקחת Risk חדש.

### ‏15. ה־Broker הוא מקור Evidence, לא תחליף ל־Ledger שלנו

‏אנחנו צריכים גם durable local history כדי להבין intents, revisions והחלטות שלא קיימות אצל Broker.

---

# ‏מקורות רשמיים לחלק 8

- ‏IBKR TWS API — Modifying Orders: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/modifying-orders>
- ‏IBKR TWS API — Placing Orders / Introduction: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>
- ‏IBKR TWS API — Order Placement Considerations: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/order-placement-considerations>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — `Execution` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/execution>
- ‏IBKR TWS API — Verify API Connection: <https://www.interactivebrokers.com/docs/tws-api/doc/connectivity/verify-api-connection>
- ‏IBKR TWS API — Error Codes: <https://www.interactivebrokers.com/docs/tws-api/doc/error-handling/error-codes>
- ‏IBKR TWS API — Open Orders sync reference: <https://www.interactivebrokers.com/docs/tws-api/sync-doc/open-orders>
- ‏IBKR TWS API — Executions sync reference: <https://www.interactivebrokers.com/docs/tws-api/sync-doc/executions>
- ‏IBKR Campus — Placing Orders using TWS Python API: <https://www.interactivebrokers.com/campus/trading-lessons/python-placing-orders/>

---

# ‏Checkpoint — סוף חלק 8

‏בחלק הזה חיברנו את כל משפחות הפקודות שלמדנו למנוע Execution אחד: הפרדנו Intent מ־Command ומ־Broker Observation ומ־Execution Truth; בנינו identity model עם `internal_order_id`, ‏`orderId`, ‏`permId`, ‏`clientId` ו־`execId`; ירדנו לעומק של submit/modify/cancel races, duplicate events, queue loss, ambiguous outcomes, binding, reconnect ו־reconciliation; והגדרנו State Machine, invariants, telemetry ו־acceptance tests ברמת Production.

‏המסקנה למנוע שלנו היא שאופטימיזציית latency מתחילה **רק לאחר** correctness: Order שנמצאת ב־cancel/modify/unknown נשארת חלק מחישוב ה־potential exposure עד ש־Broker evidence מוכיחה אחרת, וכל restart/reconnect עובר Recovery Gate לפני Entry חדשה.

‏החלק הבא יהיה **חלק 9 — `IBKR` Capability Matrix**: נאחד את כל מה שנבדק עד עכשיו למטריצה שיטתית לכל Order Type חשוב — Products, Platforms, `TWS API`, ‏Web API, ‏SMART/Direct, native/simulated, caveats, relevance למניות US ולמנוע שלנו, ומה דורש acceptance test לפני שנרשה אותו ב־Production.