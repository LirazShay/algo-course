# ‏חלק 6 — Stops, Trailing, Bracket, OCA/OCO ו־Conditional Orders

## ‏6.1 לפני השמות: שלושה מנגנונים שונים שחייבים להפריד

‏המשפחה הזו מערבבת שלושה רעיונות שונים:

```text
Trigger
Dependency
Mutual exclusion
```

‏`Stop` ו־`Trailing` עוסקות ב־Trigger: מתי Order משנה מצב או הופכת executable.

‏`Bracket` עוסקת ב־Dependency: children קשורות ל־parent ואמורות להגן על Position שנוצרה מה־parent.

‏`OCA/OCO` עוסקות ב־Mutual exclusion: ביצוע של Order אחת צריך לגרום לביטול או התאמה של האחרות.

‏`Conditional` מוסיפה שכבת Predicate: Order פעילה או מתבטלת רק כאשר תנאי מסוים מתקיים.

‏במנוע Production אסור להכניס את כולן למחלקה אחת בשם `advancedOrder`. כל מנגנון מייצר failure modes אחרים.

---

## ‏6.2 `Stop` — Trigger שמחליף Price Certainty ב־Execution Urgency

‏פקודת `Stop` רגילה אינה Order Market פעילה מהרגע הראשון. היא מחכה ל־trigger.

‏כאשר ה־trigger מתקיים, ההתנהגות הופכת בקירוב ל־Market execution.

‏לכן היא מפרידה בין:

```text
trigger price
```

‏לבין:

```text
actual execution price
```

‏והם אינם חייבים להיות זהים.

---

## ‏6.3 למה Stop Price אינה מחיר יציאה מובטח

‏נניח Position Long והגנה:

```text
stop trigger = 50.00
```

‏אם השוק עובר במהירות מ־50.03 ל־49.90, עצם העובדה שה־Stop הופעלה ב־50.00 אינה אומרת שנקבל Fill ב־50.00.

‏ה־Stop מגדירה **מתי להתחיל לחפש יציאה**, לא worst acceptable execution price.

‏לכן Stop רגילה מתאימה למצבים שבהם:

```text
position certainty > price certainty
```

‏אבל היא יכולה להיות יקרה במונחי slippage בזמן gap או burst של volatility.

---

## ‏6.4 `Trigger Method` הוא חלק מה־Order semantics

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שב־simulated stop orders ניתן להשתמש ב־default trigger methodology שלה או לבחור trigger methodology מותאמת, ושה־default עשוי להשתנות לפי Product.

‏מכאן ש־:

```text
stop_price = 50.00
```

‏אינו תיאור מלא.

‏המנוע צריך לדעת גם:

```text
what market event can trigger it?
last?
bid/ask?
double bid/ask?
other broker-defined trigger logic?
```

‏את ה־trigger הספציפי נוודא לפי Product/Route לפני Live.

---

## ‏6.5 Stop יכולה להיות Native או Broker-Simulated

‏IBKR מציינת שחלק מסוגי ה־Stop יכולים להיות Native בבורסה וחלקם simulated על ספרי IBKR, לפי Exchange ו־Order Type.

‏זה חשוב כי simulated trigger תלוי גם ב־market data וב־filters של Broker.

‏לכן מבחינת Reliability:

```text
stop exists at broker
```

‏אינו בהכרח זהה ל־:

```text
stop instruction exists natively inside venue matching engine
```

‏ועלינו לשמור Capability/Route metadata יחד עם ההגנה.

---

## ‏6.6 הסיכון הייחודי של Simulated Stop

‏IBKR מזהירה באופן כללי ש־simulated orders יכולות להיות מושפעות מ־:

```text
missing or inconsistent market data
data filters
erroneous trades
halts/interruption
third-party performance issues
```

‏לכן Stop אצל Broker היא שכבת הגנה חשובה, אבל אינה הצדקה למחוק מן המנוע:

```text
position monitoring
market-data health
broker connectivity health
reconciliation
```

---

## ‏6.7 `Stop Limit` — Trigger ואז Limit

‏`Stop Limit` מפרידה לשני מחירים:

```text
stop trigger
limit execution boundary
```

‏כאשר ה־trigger מתקיים, Order הופכת ל־Limit במקום Market.

‏כך אנחנו מגבילים price risk — אבל מקבלים סיכון חדש:

```text
triggered
but not filled
```

‏וזו נקודה קריטית במיוחד ביציאה מפוזיציה.

---

## ‏6.8 `Stop` מול `Stop Limit`: איזה סיכון אנחנו מעדיפים?

| כלי | הסיכון שאנחנו מקבלים | הסיכון שאנחנו מצמצמים |
|---|---|---|
| `Stop` | ‏Slippage / execution price לא ידוע | ‏סיכוי גבוה יותר לצאת לאחר trigger |
| `Stop Limit` | ‏Position יכולה להישאר פתוחה | ‏מונע execution מעבר ל־limit |

‏לכן אין "בטוח יותר" באופן מוחלט.

‏`Stop` מגינה יותר על **יציאה**.

‏`Stop Limit` מגינה יותר על **מחיר**.

‏במנוע קצר־טווח, זו החלטת Risk Policy — לא preference של UI.

---

## ‏6.9 Gap הוא מבחן האמת של Stop-Limit

‏נניח:

```text
stop = 50.00
limit = 49.95
```

‏והשוק קופץ ישירות ל־49.80.

‏ה־trigger יכול להתקיים, אבל Limit ב־49.95 אינה executable מול Bid נמוך יותר.

‏התוצאה האפשרית:

```text
risk detected
protection triggered
position still open
```

‏לכן Stop-Limit אינה disaster protection אוטומטית. היא compromise.

---

## ‏6.10 `Trailing Stop` — Stop עם Ratchet

‏Trailing Stop מזיזה את ה־trigger בכיוון המיטיב, אבל אינה מחזירה אותו לאחור כאשר השוק נסוג.

‏ב־SELL trailing stop על Position Long:

```text
market rises -> stop rises
market falls -> stop does not fall
```

‏זה מנגנון `ratchet`.

‏הוא מאפשר ל־risk boundary להתקרב למחיר תוך כדי תנועה חיובית בלי שהמנוע ישלח כל שינוי בעצמו.

---

## ‏6.11 Trailing Amount מול Trailing Percent

> ‏אימות אחרון: `2026-10-27`.

‏ב־`TWS API` קיימים `auxPrice`/trailing amount וגם `trailingPercent`; התיעוד מציין שהם mutually exclusive.

‏לכן במודל שלנו:

```text
trail_mode = ABSOLUTE | PERCENT
trail_value
```

‏ולא שני שדות שיכולים להיות פעילים יחד.

---

## ‏6.12 למה Trailing יכולה להיות מסוכנת במיקרו־מומנטום

‏ב־holding של שניות, normal microstructure noise יכול להיות גדול ביחס ל־trail קטן.

‏Trail צר מדי יכול לייצר:

```text
good entry
small favorable move
normal one-tick pullback
trigger
premature exit
```

‏Trail רחב מדי יכול להפוך את ההגנה ללא רלוונטית ביחס ל־Edge הקטן.

‏לכן trailing distance חייב להיות קשור לפחות ל־:

```text
spread
short-horizon volatility
quote noise
expected edge
position age
```

‏ולא percentage קבוע לכל המניות.

---

## ‏6.13 `Trailing Stop Limit` — Ratchet עם Price Boundary

‏Trailing Stop Limit מזיזה גם stop trigger וגם limit price לפי trailing amount ו־limit offset.

‏כאשר ה־trigger מופעל, נשלחת Limit לפי המחיר המחושב האחרון.

‏אנחנו שוב מקבלים trade-off:

```text
trail adapts automatically
+
explicit execution boundary
-
risk of triggered-but-unfilled exit
```

---

## ‏6.14 `Limit Offset` ב־Trailing Stop Limit דורש משמעת

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שב־`TRAIL LIMIT` יש `lmtPriceOffset`, ושלא שולחים במקביל גם explicit limit price וגם limit-price offset באותה צורה.

‏לכן adapter צריך validate combinations לפני שליחה ולא לתת ל־Strategy לייצר payload בלתי חוקי.

---

## ‏6.15 Trailing אינה תחליף למנוע Exit

‏Trailing יודעת לעקוב אחרי מחיר.

‏היא אינה יודעת:

```text
momentum reversed
spread exploded
order flow disappeared
signal score collapsed
market data became stale
```

‏לכן אצלנו Trailing תהיה Candidate ל־broker-resident guardrail או exit style מסוים, לא תחליף לכל ה־Exit Intelligence.

---

## ‏6.16 `Adjustable Stop` — שינוי חד־פעמי של Order במקום Trigger מיידי

‏Adjustable Stop מעניינת משום שה־trigger שלה אינו בהכרח אומר "צא עכשיו".

‏IBKR מתעדת שאפשר להגדיר trigger שגורם **לשינוי של ה־parent stop order** לסוג/מחיר אחר.

‏לדוגמה רעיונית:

```text
initial stop
when price reaches X:
    transform parent into tighter stop
```

‏זה סוג של state transition שמנוהל אצל Broker.

---

## ‏6.17 שדות API של Adjustable Stop

> ‏אימות אחרון: `2026-10-27`.

‏`TWS API Order` כולל בין היתר:

```text
adjustedOrderType
triggerPrice
adjustedStopPrice
adjustedStopLimitPrice
adjustedTrailingAmount
adjustableTrailingUnit
lmtPriceOffset
```

‏מבחינת מנוע, זו לא Order חדשה; זו policy של one-time transformation שחייבת להיות מתועדת ב־state.

---

## ‏6.18 מתי Adjustable Stop יכולה להיות שימושית לנו

‏תרחיש מחקר אפשרי:

```text
entry filled
price moves favorably by threshold
broker automatically tightens protection
```

‏היתרון: גם אם process מקומי נתקע בדיוק ברגע המעבר, לוגיקת ההתאמה כבר נמצאת ב־Broker.

‏החיסרון: היא פחות גמישה ממנוע שמעריך כל tick מחדש ויכול לשנות policy לפי signal state.

---

## ‏6.19 `Conditional Order` — Predicate שמקדים את ה־Order

‏Conditional Order אומרת בקירוב:

```text
Order may activate/cancel only if condition is satisfied
```

‏IBKR מתעדת תנאים כגון:

```text
Price
Time
Margin
Execution
Volume
PercentChange
```

‏וב־API אפשר לחבר תנאים עם `AND` או `OR`.

---

## ‏6.20 למה Conditions מעניינות לרובוט

‏אפשר להעביר Broker-side חלק מלוגיקת gating פשוטה, לדוגמה:

```text
submit only after time X
submit if another instrument crosses price Y
cancel if condition becomes true
```

‏היתרון הוא survivability מסוים מחוץ ל־process המקומי.

‏אבל Condition של Broker אינה יודעת להחליף Signal מורכב שמחושב אצלנו מזרם נתונים עשיר.

---

## ‏6.21 תנאים מרובים: `AND` ו־`OR`

‏ב־`OrderCondition` קיים `isConjunctionConnection` שמבדיל בין conjunction לבין alternative trigger.

‏לכן חשוב לא לייצג conditions כרשימה סתמית.

‏צריך Abstract Syntax ברור כגון:

```text
(price_condition AND volume_condition)
OR
time_condition
```

‏ולא להניח שכל הרשימה היא AND.

---

## ‏6.22 Conditional Order יכולה להיות Simulated

‏IBKR מציינת במפורש ש־simulated order types כוללות לדוגמה Stop או Conditional כאשר Exchange אינו מספק את ה־primitive.

‏לכן condition שמופעלת לפי Market Data יכולה לרשת את אותם סיכונים:

```text
missing data
filtered data
halt
delayed/inconsistent event
```

‏ב־safety-critical exit לא מסתמכים על condition מורכבת בלי להבין איפה היא מחושבת.

---

## ‏6.23 `OCA` — One Cancels All

‏`OCA` מקבצת Orders כך שביצוע Order אחת משפיע על האחרות.

‏זה מתאים ליותר משני Orders, ולא חייב להיות קשור ל־Parent.

‏ה־use case הוא:

```text
multiple alternative executions
but do not want all of them to complete independently
```

‏זה primitive של mutual exclusion / quantity coordination.

---

## ‏6.24 שלושת `OcaType` ב־TWS API

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת:

```text
1 = Cancel all remaining orders with block
2 = Proportionately reduce remaining orders with block
3 = Proportionately reduce remaining orders with no block
```

‏`with block` מוסיף overfill protection בכך שרק Order אחת בקבוצה מנותבת בכל רגע לפי התיעוד.

‏זו semantics חשובה מאוד — OCA אינה Boolean בשם `cancelOthers=true`.

---

## ‏6.25 Partial Fill ב־OCA משנה את שאר הקבוצה

‏ב־OCA proportional modes, Partial Fill יכולה להקטין את הכמויות של Orders האחרות.

‏מכאן שה־engine צריך להקשיב ל־updated order states ולא להחזיק snapshot ישן של quantities.

‏אחרת הוא יכול לחשוב:

```text
remaining sibling qty = 100
```

‏כאשר Broker כבר rebalance אותה ל־63.

---

## ‏6.26 OCA אינה Transaction אטומית מול Exchanges

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מזהירה שאין הבטחה שבקשות cancel/modify של OCA יגיעו ל־Exchange לפני Order שכבר נמצאת בתהליך execution.

‏לכן:

```text
one filled
=> cancel requested for sibling
```

‏אינו שקול ל־:

```text
sibling can no longer fill
```

‏המנוע עדיין חייב להתמודד עם late fill ו־overfill reconciliation.

---

## ‏6.27 `OCO` מול `OCA`

‏`OCO` הוא בדרך כלל השם הרעיוני למצב של שתי Orders חלופיות — למשל Take Profit ו־Stop Loss — שבהן ביצוע אחת מבטל את השנייה.

‏`OCA` הוא ה־IBKR mechanism הכללי לקבוצה של Orders.

‏Bracket יכולה להציג התנהגות של OCO בין שני exits, אבל אסור לנו להניח שכל Bracket ממומשת פנימית בדיוק כ־OCA Group שאנחנו יצרנו ידנית.

‏ברמת המודל נשמור בנפרד:

```text
parent_child_dependency
sibling_exclusion_semantics
```

---

# ‏6.28 `Bracket` — לא Order אחת אלא מערכת קטנה

‏Bracket בסיסית היא:

```text
Parent Entry
    ├── Profit-Taker Child
    └── Protective Stop Child
```

‏אבל ברמת Production היא בעצם distributed state machine בין:

```text
our engine
TWS / Gateway
IBKR servers
router
venue(s)
market data
```

‏הערך הגדול שלה אינו רק נוחות. היא מאפשרת לשלוח מראש **תכנית הגנה שקשורה ל־Entry** במקום לחכות שהקוד המקומי יראה Fill ורק אז יתחיל ליצור exit protection.

---

## ‏6.29 למה Bracket רלוונטית מאוד למסחר של שניות

‏כאשר holding period קצר, חלון הזמן בין:

```text
entry fill
```

‏לבין:

```text
protective exit becomes active
```

‏יכול להיות חלק משמעותי מכל חיי העסקה.

‏Bracket יכולה לצמצם את הסיכון של:

```text
entry filled
process delayed/crashed
no protection sent yet
```

‏וזה בדיוק סוג הבעיה שרובוט צריך לפתור ארכיטקטונית, לא ידנית.

---

## ‏6.30 Parent ו־Children הם Orders נפרדות

‏ב־`TWS API`, כל רכיב מקבל `orderId` משלו.

‏ה־children מקבלות:

```text
parentId = parent.orderId
```

‏ולכל Order יש state, fills, quantity ו־events משלה.

‏לכן אסור למודל שלנו לשמור רק:

```text
bracket_status = ACTIVE
```

‏צריך לשמור את שלוש ה־Orders כישויות נפרדות עם קשרים ביניהן.

---

## ‏6.31 `Transmit` — החלק שאסור לטעות בו

> ‏אימות אחרון: `2026-10-27`.

‏הדוגמה הרשמית של `TWS API` משתמשת בתבנית:

```text
Parent:      transmit = false
Take Profit: transmit = false
Stop Loss:   transmit = true
```

‏כאשר ה־child האחרונה נשלחת עם `Transmit=true`, TWS מפרשת זאת כאות להעביר גם את ה־parent ואת ה־siblings שקדמו לה.

‏המטרה: לא לתת ל־Parent להגיע לביצוע לפני שכל מבנה ההגנה נבנה ב־TWS.

---

## ‏6.32 למה סדר השליחה הוא Safety Property

‏תרחיש שגוי:

```text
send Parent with transmit=true
Parent fills immediately
process pauses/crashes
Take Profit not sent
Stop not sent
```

‏עכשיו נוצרה Position ללא Bracket.

‏לכן `Transmit` אינו optimization — הוא חלק מה־correctness protocol של יצירת Bracket.

---

## ‏6.33 אבל `Transmit=false` יוצר סיכון אחר

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־untransmitted Orders נמצאות רק בתוך אותו TWS session, אינן נשלחות ל־IB server, ונמחקות בעת restart/logout של אותה session.

‏לכן אם process יצר Parent ו־TP עם `Transmit=false` אבל מעולם לא הצליח לשלוח את ה־child האחרונה:

```text
no broker-resident protection exists yet
```

‏זה מצב שחייב להופיע ב־state machine כ־`STAGING`, לא כ־`PROTECTED`.

---

## ‏6.34 ארבעה IDs שונים שצריך להכיר

‏במנוע נשמור לפחות:

```text
orderId
parentId
permId
clientId
```

‏`orderId` הוא identifier בהקשר ה־API client.

‏`parentId` יוצר את dependency.

‏`permId` הוא מזהה Host קבוע יותר של Order לפי IBKR.

‏`clientId` חשוב ל־ownership וליכולת modify/cancel דרך TWS API.

‏ב־reconnect לא מספיק לזכור רק מספר אחד.

---

## ‏6.35 Bracket אינה "מופעלת" ברגע ששלחנו אותה

‏צריך להבדיל:

```text
BRACKET_STAGED
BRACKET_TRANSMITTED
PARENT_WORKING
PARENT_PARTIAL
PARENT_FILLED
CHILDREN_HELD
CHILDREN_ACTIVE
EXIT_PARTIAL
EXIT_FILLED
SIBLING_CANCEL_PENDING
FLAT_CONFIRMED
```

‏המילים המדויקות בקוד יכולות להשתנות, אבל ההבחנות חייבות להיות קיימות.

---

## ‏6.36 Parent Partial Fill — הנקודה הכי חשובה לבדיקה אמפירית

‏מצאנו כאן nuance משמעותי בתיעוד IBKR.

‏מפרט FIX של IBKR מתאר Auto Stops/Brackets כך ש־partial executions של Parent מפעילות את **הכמות המקבילה** של Child orders.

‏לעומת זאת, חומר הדרכה עדכני של `TWS API` מתאר attached children כ־held עד שה־Parent מתמלא לחלוטין ואז נעשות active.

‏אין להתעלם מהפער הזה.

‏מסקנת Production שלנו:

> ‏לפני Live נבצע acceptance test מפורש על ממשק ה־API, Product ו־Route שבהם נשתמש, ונמדוד מה בדיוק קורה ל־children לאחר Parent partial fill.

---

## ‏6.37 ה־Invariant החשוב ביותר: `Protected Qty <= Actual Position Qty`

‏אסור ש־exit children יוכלו למכור יותר מה־Position שנוצרה בפועל — אלא אם אנחנו מתכוונים במפורש לפתוח Position הפוכה.

‏לכן בכל event:

```text
actual_position_qty
active_exit_qty
pending_exit_qty
```

‏צריכים לעבור reconciliation.

‏אם Parent התמלאה ב־37 מתוך 100, מנוע לא מניח אוטומטית ששתי children של 100 בטוחות.

---

## ‏6.38 וה־Invariant המשלים: `Protected Qty` לא יכולה להישאר קטנה מדי

‏הכשל ההפוך:

```text
parent gets another late fill
position grows from 37 to 63
protective child still covers 37
```

‏עכשיו 26 מניות לא מוגנות.

‏לכן quantity synchronization היא תהליך מתמשך עד שה־Parent terminal וה־Position ידועה.

---

## ‏6.39 Parent Cancel לפני שום Fill

‏המצב הפשוט:

```text
parent filled = 0
cancel confirmed
```

‏מבחינה עסקית אין Position שצריך להגן עליה.

‏אבל המנוע עדיין חייב לוודא:

```text
children are not independently live
no late parent fill arrived
no orphan child remains
```

‏לפני שהוא סוגר את ה־Bracket state.

---

## ‏6.40 Parent Cancel אחרי Partial Fill

‏זה כבר מצב מורכב:

```text
requested = 100
filled = 37
remaining parent = 63
cancel parent remainder
```

‏העסקה לא "בוטלה". יש Position של 37.

‏מכאן צריכים להיות exits המתאימים ל־37, גם אם Entry intent המקורי של 100 הסתיים.

‏לכן:

```text
cancel_parent_remainder
!=
cancel_trade
```

---

## ‏6.41 Late Fill אחרי `cancelOrder(parent)`

‏זה race קלאסי:

```text
cancel requested
fill crosses in flight
cancel acknowledgement arrives
fill event arrives
```

‏המנוע צריך לקבל כל Fill כאמת על Position, גם אם local intent כבר היה `CANCEL`.

‏התגובה הנכונה היא reconciliation — לא התעלמות מה־Fill כי "כבר ביטלנו".

---

## ‏6.42 Profit-Taker Child היא Execution Policy בפני עצמה

‏Take Profit אינה רק מספר יעד.

‏צריך להחליט:

```text
LMT passive?
marketable when target reached?
IOC?
Pegged?
modify dynamically?
partial exit allowed?
```

‏Bracket בסיסית משתמשת בדרך כלל ב־opposite-side Limit, אבל המנוע שלנו צריך לחשוב על exit behavior — לא רק target price.

---

## ‏6.43 Stop-Loss Child היא שכבת Risk, לא Forecast

‏Protective stop אינה אמורה לנבא שהמחיר בהכרח ימשיך לרדת.

‏תפקידה להגדיר:

```text
this market state is unacceptable while position is open
```

‏לכן צריך להפריד בין:

```text
signal reversal exit
```

‏לבין:

```text
protective disaster/risk stop
```

‏הראשון יכול להיות dynamic ומהיר יותר; השני יכול להישאר Broker-resident כ־backstop.

---

## ‏6.44 `Stop` או `Stop Limit` בתוך Bracket?

‏שוב זו לא שאלה של "איזו מקצועית יותר".

‏Protective `Stop`:

```text
better chance of reducing position
but price can slip
```

‏Protective `Stop Limit`:

```text
price boundary
but position can remain open after trigger
```

‏למנוע שמחזיק שניות, Stop-Limit צרה מדי עלולה להיות מסוכנת דווקא בזמן burst שבו הכי רצינו הגנה.

---

## ‏6.45 Trailing Stop כ־Child

‏אפשר להשתמש ב־Trailing behavior כחלק מ־exit structure כאשר capability תומכת בכך.

‏אבל אז state מורכב יותר:

```text
entry fill price
trail reference
current trail stop
position qty
manual/dynamic exit signal
```

‏והמנוע חייב לדעת מי "בעל הסמכות" לצאת ראשון: Trailing child או client-managed exit.

---

## ‏6.46 הבעיה של שתי מערכות Exit במקביל

‏נניח שיש:

```text
broker stop child
+
local momentum reversal exit
```

‏המנוע המקומי שולח SELL בדיוק כאשר Stop child מופעלת.

‏בלי coordination ניתן לקבל:

```text
local sell fills
broker stop also fills
=> position flips short
```

‏לכן hybrid architecture חייבת מנגנון `exit ownership` ו־reconciliation.

---

## ‏6.47 Bracket אינה חייבת להיות Strategy Brain

‏עבורנו רעיון חזק הוא להפריד:

```text
Broker Bracket = safety envelope
Client Engine   = dynamic exit intelligence
```

‏ה־Broker מחזיק catastrophic protection ו־optional profit boundary.

‏המנוע יכול לצאת מוקדם יותר כאשר signal reverses.

‏אבל ברגע שהמנוע יוצא, הוא חייב לבטל/לעדכן את children ולחכות ל־terminal confirmation.

---

## ‏6.48 `Broker-Resident` מול `Client-Managed Exit`

| מודל | יתרון | חסרון |
|---|---|---|
| Broker-resident | ‏ממשיך להתקיים גם אם process המקומי נופל | ‏פחות יודע על ה־Signal הפרטי שלנו |
| Client-managed | ‏גמיש ומגיב לכל feature שלנו | ‏תלוי connectivity/process/data |
| Hybrid | ‏Backstop אצל Broker + intelligence מקומית | ‏state coordination מורכב יותר |

‏למנוע Production, Hybrid הוא Candidate חשוב למחקר — אבל רק אחרי בדיקות races קפדניות.

---

## ‏6.49 למה Bracket קבועה יכולה להיות איטית מדי למסחר שלנו

‏אם המערכת אומרת:

```text
TP = +0.30%
SL = -0.20%
```

‏ולא משנה דבר במשך 20 שניות, היא מתעלמת מ־:

```text
spread changes
bid weakness
trade velocity
wave reversal
new liquidity
signal decay
```

‏לכן Bracket לא בהכרח קובעת את ה־exit האופטימלי. הערך שלה יכול להיות קודם כול `protection that already exists`.

---

## ‏6.50 שינוי Child בזמן Position חיה

‏כאשר המנוע רוצה להזיז TP או Stop, זו Order modification — לא שינוי משתנה מקומי בלבד.

‏צריך לעקוב אחרי:

```text
modify requested
broker acknowledgement
old order still potentially executable during transition
new effective parameters
```

‏וחלק מהשינויים יכולים להשפיע על routing/priority או להידחות.

---

## ‏6.51 אסור לבצע Modify על Snapshot ישן

‏נניח שהמנוע קיבל state:

```text
child remaining = 100
```

‏באותו זמן הגיע partial fill של 20, אבל event עוד לא עובד אצלנו.

‏אם נשלח Modify ל־100 במקום ל־80, אפשר לייצר quantity mismatch.

‏לכן כל modify path צריך sequence/revision discipline ו־post-ack reconciliation.

---

## ‏6.52 `autoCancelParent` — capability שצריך להבין, לא להפעיל אוטומטית

‏`TWS API Order` כולל `autoCancelParent`, שמתועד כיכולת לבטל Parent אם Child בוטלה.

‏זו התנהגות חזקה שיכולה להתאים לחלק מה־workflows, אבל יכולה גם להפתיע אם cancellation של Child הייתה רק פעולה מקומית זמנית.

‏לכן לא נשתמש בה כברירת מחדל בלי state model מפורש.

---

## ‏6.53 `OCA` בתוך עולם ה־Bracket — לא להניח אטומיות

‏גם אם שני exits מתפקדים כ־one-cancels-other, צריך לזכור את אזהרת IBKR על cancellation latency.

‏תרחיש קיצון:

```text
profit child starts filling
stop child is being canceled
market jumps
stop child also executes
```

‏נדיר אינו שווה בלתי אפשרי.

‏המנוע חייב לדעת לטפל ב־Position הסופית, לא להניח שה־Broker תמיד מנע race.

---

## ‏6.54 `Double Exit` — הכשל שמסוכן יותר מ־Missed Exit

‏אם יש לנו Long 100 ושתי SELL orders של 100 מתבצעות, אנחנו לא רק flat — אנחנו Short 100.

‏לכן invariant:

```text
sum(potentially executable exit qty)
```

‏חייב להיות מובן בכל רגע, כולל Orders שנמצאות ב־pending cancel.

‏`pending cancel` עדיין נחשבת Potentially Executable עד terminal confirmation.

---

## ‏6.55 `Orphan Child`

‏Orphan היא Child שנשארה חיה כאשר ההנחה שמצדיקה אותה כבר אינה קיימת.

‏דוגמאות:

```text
position already closed manually
parent canceled without expected cleanup
local engine lost relationship metadata
child survived reconnect
```

‏ב־startup reconciliation, כל Child ללא Position/Parent relationship תקף צריכה להיות מסווגת כ־incident עד שיוכח אחרת.

---

## ‏6.56 Child Rejection היא אירוע Risk

‏אם Parent Fill יצר Position אבל Stop Child נדחתה, אין לנו Bracket תקינה.

‏זה לא `warning` רגיל.

‏State צריך לעבור למשל ל־:

```text
POSITION_UNPROTECTED
```

‏ואז policy מוגדרת מראש מחליטה אם לנסות protective order חלופית, לצמצם Position, או לעצור את המנוע.

---

## ‏6.57 System Cancel ו־User Cancel אינם אותו דבר

‏ב־OCA documentation קיימת הבחנה חשובה: cancellation מצד client יכולה להשפיע על הקבוצה באופן שונה מ־rejection/system cancellation.

‏לכן callback reason ו־terminal status צריכים להישמר.

‏אסור לתרגם כל `Cancelled` ל־:

```text
user intentionally canceled trade
```

---

## ‏6.58 Manual/External Position Change

‏אם אדם מוכר ידנית חלק מה־Position בזמן Bracket קיימת, quantities של children עלולות כבר לא להתאים ל־Position.

‏אותו דבר אם API client אחר משנה Order.

‏לכן Position היא source of truth שמחושב מ־broker executions/account state — לא רק מה־strategy ledger המקומי.

---

## ‏6.59 Reconnect: לא משחזרים Bracket מהזיכרון בלבד

‏אחרי reconnect עושים לפחות:

```text
request/open orders reconciliation
executions reconciliation
positions reconciliation
map orderId/permId/parentId
rebuild bracket graph
```

‏ורק אז המנוע מחליט אם מותר לו לשלוח Orders חדשות.

‏עד אז מצב בטוח הוא `RECOVERING`, לא `RUNNING`.

---

## ‏6.60 Crash אחרי Parent Fill הוא בדיוק הסיבה ל־Broker-Resident Protection

‏תרחיש:

```text
parent fills
local process dies 2 ms later
```

‏אם Stop כבר חלק מ־Bracket שהגיעה ל־Broker, יש סיכוי שההגנה ממשיכה להתקיים בלי התהליך המקומי.

‏אם ה־Exit כולו client-managed, אין שום לוגיקה מקומית פעילה עד restart.

‏זו אחת הסיבות החזקות ביותר לבחון Hybrid architecture.

---

## ‏6.61 Multiple API Clients ו־Ownership

‏IBKR מתעדת `clientId` כחלק מ־order ownership; modify/cancel capabilities תלויות במי placed/bound את Order.

‏לכן אם בעתיד יהיו:

```text
execution service
manual TWS session
recovery service
```

‏צריך ownership policy מפורשת ולא להניח שכל client יכול לנהל כל Order באותה דרך.

---

## ‏6.62 Outside RTH הוא חלק מההגנה

‏Stop/Bracket שמוגדרת ל־Regular Trading Hours בלבד אינה נותנת אותה הגנה ב־pre-market/after-hours.

‏מצד שני, execution outside RTH יכולה לפגוש spread ונזילות שונים מאוד.

‏לכן כל protective order צריכה לשמור:

```text
outsideRth
session_policy
```

‏וה־risk model צריך לדעת מתי protection אינה eligible.

---

## ‏6.63 Halts ו־Resumptions

‏ב־halt אין guarantee ש־protective order תבצע.

‏לאחר resume המחיר יכול להיפתח רחוק מה־trigger.

‏לכן Stop אינה insurance contract עם payout ידוע; היא instruction שתלויה במצב השוק וביכולת execution לאחר trigger.

‏ב־backtest שלנו חייבים להימנע מהנחה:

```text
stop touched => filled exactly at stop
```

---

## ‏6.64 Stop Trigger Price מול Actual Fill Price חייבים להיות שני שדות

‏Telemetry:

```text
stop_trigger_price
trigger_timestamp
market_at_trigger
first_executable_quote_after_trigger
fill_price
slippage_from_trigger
```

‏בלי ההפרדה הזו Backtest יכול לייחס ל־Risk Policy ביצועים שאי אפשר לקבל Live.

---

## ‏6.65 Failure Matrix של Bracket — מה המנוע חייב לדעת לענות

| מצב | מה עלול להיות חי אצל Broker | הסיכון | Recovery עקרוני |
|---|---|---|---|
| Parent לא התמלאה | Parent working, children held | stale entry | validate signal / cancel parent |
| Parent partial | Parent remainder + חלק/כל children לפי semantics בפועל | under/over protection | reconcile fills + child qty |
| Parent full | exits held/active | protection gap אם child rejected | verify both exit legs |
| TP partial | remaining TP + stop sibling | qty mismatch / OCA rebalance | recompute actual position |
| Stop triggered | stop execution in progress + TP cancel pending | double exit | treat sibling as potentially executable |
| Cancel in flight | old order עדיין יכולה להתבצע | late fill | wait for terminal + executions |
| Local connection lost | broker orders may remain live | local state stale | freeze new orders, reconcile |
| Process crash | broker-resident bracket may survive | unknown state on restart | rebuild from broker truth |
| Child rejected | Parent may already be Position | unprotected position | emergency protection policy |
| Child canceled unexpectedly | sibling/position may remain | asymmetric protection | classify reason, reconcile |
| Price gaps through Stop | triggered execution can slip | larger loss | emergency/risk accounting |
| Stop-Limit gaps | trigger but no fill | position remains | escalation policy |
| Manual position change | children no longer match Position | over-exit | resize/cancel after reconciliation |
| Second API client modifies | local assumptions stale | unexpected price/qty | ownership/version checks |
| Both exits fill | position may reverse | unintended exposure | detect immediately and neutralize per policy |

‏המטריצה הזו תהפוך בהמשך ל־acceptance tests, לא תישאר רק חומר קריאה.

---

## ‏6.66 State Machine מומלץ ל־Bracket

```text
CREATED
  ↓
STAGING
  ↓
TRANSMITTED
  ↓
PARENT_WORKING
  ├── PARENT_CANCEL_PENDING
  ├── PARENT_PARTIAL
  └── PARENT_FILLED
          ↓
     EXITS_VERIFYING
          ↓
     POSITION_PROTECTED
       ├── TP_WORKING
       ├── STOP_WORKING
       ├── EXIT_MODIFY_PENDING
       └── EXIT_CANCEL_PENDING
          ↓
     EXIT_PARTIAL
          ↓
     SIBLING_CANCEL_PENDING
          ↓
     FLAT_VERIFYING
          ↓
     FLAT_CONFIRMED
```

‏ובכל node יכולים להיות transitions ל־:

```text
REJECTED
RECOVERING
UNPROTECTED
INCONSISTENT
MANUAL_INTERVENTION_REQUIRED
```

‏השם האחרון אינו אומר שאדם חייב תמיד ללחוץ; הוא אומר שהאוטומציה אינה רשאית להעמיד פנים שהמצב תקין.

---

## ‏6.67 Invariants שצריכים להיבדק אחרי כל Event

```text
position_qty == broker_truth_after_reconciliation
no new entry while bracket state is inconsistent
no exit assumes pending-cancel sibling is dead
active protective qty never intentionally exceeds position qty
position qty never remains intentionally unprotected beyond allowed window
all live children map to a known parent/position
all modifications use latest known filled/remaining qty
```

‏אלה guardrails חזקים יותר מאלפי `if` נקודתיים.

---

## ‏6.68 Telemetry שחייבים לשמור ל־Stops/Bracket/OCA

```text
bracket_id
parent_order_id
parent_perm_id
take_profit_order_id
stop_order_id
parent_filled_qty
position_qty
protected_qty
tp_remaining_qty
stop_remaining_qty
transmit_state
parent_status
tp_status
stop_status
oca_group
oca_type
stop_trigger_method
stop_trigger_price
stop_limit_price
trail_mode
trail_value
trail_stop_price
condition_types
condition_state
last_reconciliation_timestamp
reconnect_generation
```

‏ואירועים:

```text
parent_first_fill_ts
parent_full_fill_ts
child_activation_ts
stop_trigger_ts
exit_first_fill_ts
sibling_cancel_request_ts
sibling_cancel_ack_ts
flat_confirmed_ts
unprotected_window_ms
double_exit_incident
orphan_detected
```

---

## ‏6.69 Metrics שמעניינות במיוחד אותנו

```text
entry_fill_to_protection_active_ms
percentage_time_position_unprotected
stop_slippage_bps
stop_limit_nonfill_rate
trailing_premature_exit_rate
bracket_child_reject_rate
late_fill_after_cancel_rate
double_exit_rate
orphan_order_rate
recovery_success_rate
reconnect_to_consistent_state_ms
```

‏אם Bracket נראית יפה ב־UI אבל `entry_fill_to_protection_active_ms` גבוה או recovery fragile — היא לא Production-ready עבורנו.

---

## ‏6.70 Acceptance Tests שחייבים לפני שימוש אמיתי

‏לפחות:

```text
1. Parent no-fill then cancel
2. Parent instant full fill
3. Parent partial fill then wait
4. Parent partial fill then cancel remainder
5. Parent fill racing with cancel
6. TP full fill
7. TP partial fill
8. Stop trigger and fill
9. Stop trigger with gap
10. Stop-Limit trigger without fill
11. Modify TP while active
12. Modify Stop while active
13. Cancel one child
14. Child rejection
15. Disconnect before Parent fill
16. Disconnect after Parent fill
17. Process restart with bracket live
18. Manual partial close while bracket live
19. Late fill after sibling cancel request
20. Verify exact partial-fill child activation semantics
```

‏הבדיקה ה־20 היא Mandatory אצלנו בגלל ההבדל שמצאנו בין מסמכי IBKR.

---

## ‏6.71 `IBKR` — תמיכה נוכחית ברמת UI

> ‏אימות אחרון: `2026-10-27`.

‏לפי Order Types של IBKR:

| כלי | Products רלוונטיים | Platforms מתועדות | Routing |
|---|---|---|---|
| `Stop` | Stocks, ETFs ועוד | `TWS`, `IBKR Desktop`, `IBKR Mobile`, `Client Portal` | Smart, Directed |
| `Stop Limit` | Stocks, ETFs ועוד | כל הפלטפורמות המרכזיות | Smart, Directed |
| `Trailing` | Stocks, ETFs ועוד | `TWS`, `IBKR Desktop`, `IBKR Mobile`, `Client Portal` | Smart, Directed |
| `Trailing Limit` | Stocks, ETFs ועוד | `TWS`, `IBKR Desktop`, `IBKR Mobile`, `Client Portal` | Smart, Directed |
| `Adjustable Stop` | Stocks, ETFs ועוד | `TWS`, `IBKR Desktop`, `IBKR Mobile`, `Client Portal` | Smart, Directed |
| `Bracket` | Stocks, ETFs ועוד | `TWS`, `IBKR Desktop`, `IBKR Mobile` | Smart, Directed |
| `OCA` | Stocks, ETFs ועוד | `TWS` | Smart, Directed |
| `Conditional` | Stocks, ETFs ועוד | `TWS` ו־`IBKR Mobile` לפי הדף הנוכחי | Smart, Directed |

‏זו תמיכת Product/Platform כללית של IBKR, לא הבטחה שכל combination נתמך בכל Legal Entity/Contract/Route.

---

## ‏6.72 `TWS API` — מה באמת קיים באובייקט

‏`Order` הנוכחי כולל בין היתר:

```text
parentId
transmit
ocaGroup
ocaType
triggerMethod
trailingPercent
trailStopPrice
adjustedOrderType
triggerPrice
adjustedStopPrice
adjustedStopLimitPrice
adjustedTrailingAmount
conditions
conditionsCancelOrder
conditionsIgnoreRth
autoCancelParent
```

‏כלומר ה־API נותן primitives אמיתיים לבניית המנגנונים של החלק הזה.

‏אבל IBKR עצמה ממליצה לבדוק Order Type ידנית ב־TWS לפני שמקודדים tactic מורכבת, משום שלא כל combination של advanced features נתמך.

---

## ‏6.73 `Web API` — Bracket קיימת גם שם, אבל semantics אינן זהות ל־TWS API

‏בתיעוד Web API, parent מקבל `cOID` וה־children משתמשות באותו ערך ב־`parentId`; אפשר לשלוח Bracket יחד ב־request מתאים.

‏כלומר Bracket אינה מוגבלת ל־TWS API.

‏אבל אין להניח parity מלאה ב־fields, lifecycle ו־error handling.

‏אם נבחר Web API ל־Execution Adapter, נכתוב בדיקות קבלה נפרדות.

---

## ‏6.74 דרך נוספת ב־TWS API: Preset-based Profit Taker ו־Stop Loss

‏IBKR מתעדת גם fields:

```text
ptOrderId
ptOrderType = PRESET
slOrderId
slOrderType = PRESET
```

‏שמאפשרים לבקש children על בסיס TWS Presets.

‏זה יכול לפשט setup אחיד, אבל יוצר dependency על configuration חיצונית ב־TWS.

‏למנוע reproducible אני מעדיף במחקר הראשון parameters מפורשים בקוד, ורק אחר כך להשוות Preset-driven workflow אם יש לו ערך תפעולי.

---

## ‏6.75 Recommendation ארכיטקטונית ראשונית למנוע שלנו

‏לא הייתי בוחר עכשיו "Bracket מלאה מנהלת הכול" או "הכול client-side".

‏הייתי חוקר שלוש architectures:

```text
A. CLIENT_MANAGED_EXIT
   entry at broker
   engine manages all exits

B. BROKER_BRACKET
   parent + TP + protective stop at broker
   minimal local intervention

C. HYBRID_PROTECTION
   broker-resident protective stop/backstop
   engine manages dynamic normal exit
   broker child is canceled/reconciled when local exit succeeds
```

‏עבור holding של שניות, `C` היא Candidate חשובה במיוחד מפני שהיא משלבת survivability עם signal-aware exit — אבל היא גם דורשת את ה־race handling הקשוח ביותר.

---

## ‏6.76 איך נחליט מי מנצחת

‏לא לפי תחושה ולא לפי מספר שורות קוד.

‏נמדוד:

```text
protection activation latency
normal exit quality
stop slippage
number of broker modifications
race incidents
reconnect behavior
unprotected time
operational complexity
net edge after execution
```

‏ה־architecture הטובה היא זו שנותנת Risk Control אמין בלי להרוס את execution economics של ה־Signal הקצר.

---

## ‏6.77 Bracket לא יוצרת Edge

‏חשוב במיוחד לא להתאהב במבנה.

‏Bracket יכולה:

```text
reduce operational risk
pre-stage protection
enforce relationships
simplify some failure handling
```

‏אבל היא לא גורמת ל־entry Signal להיות רווחי.

‏ה־Edge עדיין צריך להגיע מ־Signal + Execution quality + costs.

---

## ‏6.78 Practitioner Secrets — הדברים שהופכים Bracket מ־UI Feature למערכת Production

### ‏1. `Transmit` הוא פרוטוקול Commit קטן

‏הוא נועד למנוע מצב שבו חלק מהמבנה חי וחלק עוד לא הגיע.

### ‏2. `Transmit=false` אינו Broker Protection

‏עד שהקבוצה באמת transmitted, Orders יכולות להיות רק בתוך ה־TWS session.

### ‏3. Partial Fill היא לא Edge Case

‏היא משנה Position Qty, protection qty ו־exit state.

### ‏4. Pending Cancel היא עדיין Order מסוכנת

‏עד שאין terminal state, היא יכולה לקבל Fill.

### ‏5. OCA אינה Atomic Transaction

‏צריך לתכנן כאילו rare double executions אפשריות.

### ‏6. Stop Price אינה Fill Price

‏Backtests שממלאים תמיד בדיוק ב־Stop אופטימיים מדי.

### ‏7. Stop-Limit יכולה "להגן" על מחיר ולהיכשל בהגנה על Position

‏זה trade-off, לא שדרוג אוטומטי.

### ‏8. Broker-Resident Protection שווה הרבה דווקא בזמן תקלה

‏הערך שלה נמדד כשמחשב/Process/Data נופלים — לא רק כשהכול עובד.

### ‏9. Dynamic Exit + Broker Stop הם שתי רשויות ביצוע

‏בלי ownership/reconciliation הן יכולות להילחם זו בזו.

### ‏10. Flat אינו State מקומי — הוא עובדה שצריך לאמת מול Broker

‏רק לאחר positions + executions + live orders reconciliation אפשר להכריז `FLAT_CONFIRMED`.

### ‏11. Documentation mismatch הוא Signal לבדיקה, לא הזמנה לניחוש

‏כאשר מקורות IBKR מתארים partial-parent behavior בצורה שונה, אנחנו לא בוחרים גרסה שנוחה לנו; אנחנו כותבים acceptance test.

### ‏12. Bracket טובה היא מערכת שמצליחה גם כשמשהו משתבש

‏Happy Path הוא רק תחילת הבדיקה.

---

# ‏מקורות רשמיים לחלק 6

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — placing orders introduction / `Transmit`: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>
- ‏IBKR TWS API — Adding a Profit Taker and Stop Loss: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/adding-a-profit-taker-and-stop-loss>
- ‏IBKR API — Order Types / Bracket / OCA examples: <https://www.interactivebrokers.com/campus/?p=195739&post_type=ibkr-api-page>
- ‏IBKR — Trailing Stop Limit documentation: <https://www.interactivebrokers.com/docs/general/order-types/trailing-stop-limit>
- ‏IBKR TWS API — Order Conditions reference: <https://www.interactivebrokers.com/docs/tws-api/protobuf/order-condition>
- ‏IBKR Web API — Modify Open Order / `parentId`: <https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/modify-open-order>
- ‏IBKR — Bracket Orders for IBKR Desktop: <https://www.interactivebrokers.com/campus/trading-lessons/bracket-orders-for-ibkr-desktop/>
- ‏IBKR FIX Specification — Auto Stops / Bracket partial-execution semantics: <https://www.interactivebrokers.com/campus/wp-content/uploads/sites/2/2023/07/IBKR-FIX-Specification.pdf>

---

# ‏Checkpoint — סוף חלק 6

‏בחלק הזה הפכנו Stops ו־Bracket מ־"פקודות יציאה" למערכת Risk/Execution מלאה. הפרדנו בין Trigger, Dependency ו־Mutual Exclusion; ירדנו לעומק של `Stop`, ‏`Stop Limit`, ‏`Trailing`, ‏`Trailing Limit`, ‏`Adjustable Stop`, ‏`Conditional` ו־`OCA`; ובנינו ל־Bracket מודל Production עם `parentId`, ‏`Transmit`, partial fills, quantity invariants, pending-cancel races, orphan/double exits, reconnect/recovery, Failure Matrix ו־acceptance tests.

‏הנקודה החשובה ביותר למנוע שלנו היא ש־Bracket יכולה להיות **שכבת survivability מצוינת**, אבל היא אינה תחליף ל־Signal-aware Exit. לכן שלוש architectures — client-managed, broker-bracket ו־hybrid protection — ייבחנו אמפירית ולא ייבחרו לפי אינטואיציה.

‏החלק הבא יהיה **חלק 7 — Routing ו־Broker Algos**: `SMART` מול Direct Routing, בחירת Venue, fees/rebates, hidden liquidity, price improvement, ‏`Adaptive`, ‏`MidPrice` ושאלת המפתח למנוע של שניות — מתי כדאי למסור לברוקר החלטת execution ומתי אנחנו צריכים לשמור אותה אצלנו.