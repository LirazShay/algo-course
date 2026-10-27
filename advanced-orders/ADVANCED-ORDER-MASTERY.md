# ‏Advanced Order Mastery — פקודות מסחר וביצוע ברמה מקצועית

> ‏מיני־קורס עומק משלים ל־`04-ORDER-TYPES-FOR-PERSONAL-ALGO.md`.
>
> ‏התוצר הסופי של המיני־קורס הוא **הקובץ היחיד הזה**. בכל שלב נרחיב ונעדכן אותו עד שיהפוך למסמך ארוך, רציף וניתן להדפסה.
>
> ‏המיקוד המרכזי: `Short-Horizon Momentum` — כניסה ויציאה בשניות ועד בערך דקה כאשר ה־Edge עדיין חי. פקודות שרלוונטיות בעיקר ל־market making, institutional execution ארוך או order sizes גדולים מאוד יוסברו, אבל יקבלו פחות עומק אלא אם יש להן השלכה ממשית על המערכת שלנו.

---

## ‏סטטוס המסמך

- ‏מצב: `IN PROGRESS`.
- ‏שלב נוכחי: `3 — Time in Force and immediate-execution semantics`.
- ‏מקור אמת: הקובץ הזה.
- ‏עובדות תלויות־זמן על Broker/Venue/API נבדקות מול תיעוד עדכני ונושאות תאריך אימות.
- ‏אין להניח ש־Order Type הנתמך במוצר אחד, Venue אחד או UI אחד נתמך אוטומטית בכל מוצר, בכל Routing mode ובכל API.

---

# ‏מפת המיני־קורס

‏המסמך ייבנה בהדרגה סביב השאלות שאיש Execution מקצועי צריך לדעת לענות עליהן לפני שהוא מכניס פקודה למנוע מסחר.

## ‏חלק 1 — השפה המקצועית של פקודה

‏מה באמת מרכיב Order, מי מחזיק אותה בכל שלב, מה ההבדל בין `native`, ‏`broker-simulated` ו־`client-managed`, ומה המשמעות של `submitted`, ‏`working`, ‏`partially filled`, ‏`pending cancel`, ‏`cancelled`, ‏`filled`, ‏`rejected` ועוד.

## ‏חלק 2 — Core execution

‏`Market`, ‏`Limit`, ‏`Marketable Limit`, ‏Passive Limit, ‏price caps, ‏aggressiveness, ‏crossing the spread, ‏partial fills, ‏slippage, ‏fill probability ו־opportunity cost.

## ‏חלק 3 — Time in Force ופקודות מיידיות

‏`DAY`, ‏`GTC`, ‏`GTD`, ‏`IOC`, ‏`FOK`, ‏`AON`, ‏Minimum Quantity וההבדל בין "אני רוצה Fill עכשיו" לבין "אני רוצה שכל הכמות תתבצע עכשיו".

## ‏חלק 4 — Liquidity control

‏`Post Only`, ‏`Hidden`, ‏`Reserve/Iceberg`, ‏display size, ‏queue priority, ‏maker/taker behavior, ‏adverse selection, ‏order aging והאם בכלל כדאי לנו להיות passive כאשר חיי ה־Signal קצרים.

## ‏חלק 5 — Pegged, Relative, Midpoint ו־Snap families

‏`Relative/Pegged-to-Primary`, ‏`Pegged-to-Market`, ‏`Pegged-to-Midpoint`, ‏`MidPrice`, ‏`Snap to Market`, ‏`Snap to Midpoint`, ‏`Snap to Primary`, ‏IBKR ATS pegged orders והבדלים קריטיים בין שמות דומים.

## ‏חלק 6 — Stops, Trailing, Bracket, OCA/OCO ו־Conditional

‏מנגנוני הגנה ויציאה, parent/child orders, ‏transmit sequencing, ‏race conditions, ‏orphan orders, ‏double exits ומה באמת קורה כאשר Fill ו־Cancel חוצים זה את זה.

## ‏חלק 7 — Routing ו־Broker Algos

‏`SMART` מול Direct Routing, ‏venue selection, ‏fees/rebates, ‏hidden liquidity, ‏price improvement, ‏IBKR algos כגון `Adaptive` ו־`MidPrice`, ומתי Broker Algo עוזר לעומת מתי הוא מוסיף התנהגות שקשה יותר לחזות במנוע קצר־טווח.

## ‏חלק 8 — Cancel/Replace ו־Execution State Machine

‏למה `cancel()` אינו מחיקה, מהו `cancel/replace`, מתי שינוי פקודה מאבד queue priority, איך עובדים נכון עם partial fills, duplicate events, reconnects, late fills ו־broker reconciliation.

## ‏חלק 9 — `IBKR` capability matrix

‏לכל Order Type חשוב נבדוק:

```text
What it does
Why it exists
Best use case
Bad use case
Who normally uses it
Fill semantics
Queue implications
Adverse-selection implications
Latency implications
TWS support
IBKR Desktop support
Mobile / Client Portal support when relevant
TWS API support
Client Portal API support when relevant
SMART / Direct routing requirements
US-stock relevance
Account / venue caveats
Relevance to our < 1 minute momentum engine
```

## ‏חלק 10 — Engine decision guide

‏בסוף נתרגם הכול ל־Execution Policy ממשי עבור המנוע שלנו:

```text
signal state
+ urgency
+ spread
+ displayed depth
+ expected edge
+ remaining signal life
+ position state
+ fill state
+ exit feasibility
=> choose order behavior
```

‏המטרה אינה לבחור "פקודה הכי טובה" אחת, אלא לדעת **איזו התנהגות נכונה לכל מצב**.

## ‏חלק 11 — Print Optimization Pass

‏רק לאחר שכל התוכן המקצועי יושלם, נעבור על הקובץ כולו להכנה יעילה להדפסה: צפיפות מידע גבוהה אך קריאה, צמצום רווחים מיותרים, טיפול בכותרות ובטבלאות, שבירות עמוד הגיוניות ו־RTL יציב.

## ‏חלק 12 — Final Gap Review וסגירה

‏השלב האחרון יהיה מעבר על חוסרים, כפילויות, עובדות תלויות־זמן, התאמה ל־IBKR ולמנוע שלנו, ורק לאחריו המסמך ייחשב גמור.

---

# ‏חלק 1 — השפה המקצועית של פקודה

## ‏1.1 פקודה אינה `BUY` או `SELL`

‏פקודת מסחר מקצועית היא חוזה ביצוע קטן. כאשר המנוע שולח Order הוא אינו אומר רק "קנה"; הוא מגדיר סט של אילוצים והעדפות לגבי מחיר, זמן, כמות, Routing והתנהגות במקרה שהשוק אינו נותן בדיוק את מה שרצינו.

‏אפשר לחשוב עליה כך:

```text
Order =
    Instrument
  + Side
  + Quantity
  + Price policy
  + Time policy
  + Fill policy
  + Display policy
  + Routing policy
  + Trigger / dependency policy
  + Session policy
  + Failure / cancel policy
```

‏אם אחד מהחלקים האלה נשאר לא מוגדר, בפועל נתנו לברוקר או ל־Venue לקבל החלטה במקומנו.

### ‏דוגמה

‏שתי הפקודות הבאות הן שתיהן `BUY 100`, אבל ההתנהגות שלהן שונה כמעט לחלוטין:

```text
A:
BUY 100
LIMIT 50.00
DAY
SMART
```

```text
B:
BUY 100
LIMIT 50.05
IOC
DIRECT
```

‏`A` יכולה לנוח ב־Book, לצבור גיל ותור, להתבצע בחלקים ולהישאר חיה זמן רב יחסית.

‏`B` אומרת למעשה: נסה לקחת עכשיו נזילות שניתנת לביצוע עד מחיר 50.05, ומה שלא בוצע מייד — אל תשאיר מאחור.

‏מבחינת מנוע מומנטום קצר, ההבדל הזה הוא לעיתים חשוב יותר מההבדל בין שני Signals.

---

## ‏1.2 שלוש שכבות שצריך להפריד: Strategy, Execution Policy, Order

‏טעות ארכיטקטונית נפוצה היא שה־Strategy עצמה מחליטה ישירות:

```text
BUY MARKET
```

‏עדיף להפריד:

```text
Strategy
    ↓
Intent
    ↓
Execution Policy
    ↓
Concrete Order
```

### ‏`Strategy`

‏אומרת:

> ‏"מצאתי הזדמנות שבה אני רוצה להיות Long עכשיו."

### ‏`Intent`

‏מתאר את מטרת העסקה:

```text
side = BUY
max_position = 100 shares
signal_expiry = 4.0 sec
expected_edge = 0.18%
urgency = high
```

### ‏`Execution Policy`

‏מתרגמת את המטרה להתנהגות:

```text
Do not pay more than X
Try immediate liquidity first
Accept partial fill above Y shares
Do not leave remainder after signal expiry
Cancel if quote deteriorates
```

### ‏`Concrete Order`

‏רק כאן מתקבלת למשל החלטה:

```text
BUY 100
LMT 50.03
IOC
SMART
```

‏ההפרדה הזאת קריטית אצלנו משום שאותו Signal יכול להצדיק Order שונה לפי Spread, ‏Depth, ‏volatility, ‏time-to-expiry והאם אנחנו נכנסים לפוזיציה או כבר מנסים לצאת ממנה.

---

## ‏1.3 `Order Type` אינו מספר לנו את כל הסיפור

‏כאשר כתוב `Limit`, עדיין איננו יודעים:

- ‏האם היא Passive או Marketable.
- ‏האם היא `DAY`, ‏`IOC` או `GTC`.
- ‏האם היא Routed דרך `SMART` או ישירות ל־Venue.
- ‏האם היא גלויה במלואה.
- ‏האם יש לה parent/child relationship.
- ‏האם היא מותנית ב־Trigger.
- ‏האם הברוקר שולח אותה Native או מדמה חלק מההתנהגות.
- ‏כמה זמן המנוע עצמו מוכן להשאיר אותה בחיים.

‏לכן במנוע שלנו אסור להשתמש ב־`order_type` בתור תיאור מלא של execution behavior.

‏עדיף לחשוב על אובייקט עשיר יותר:

```text
ExecutionInstruction {
  side
  quantity
  order_type
  limit_price
  stop_price
  tif
  route
  display_size
  allow_partial
  minimum_useful_fill
  signal_expiry
  application_ttl
  chase_policy
  cancel_policy
  parent_id
  oca_group
}
```

‏השמות המדויקים בקוד יכולים להיות שונים; העיקר הוא שהמשמעות תהיה מפורשת.

---

# ‏1.4 `Native`, ‏`Broker-Simulated`, ‏`Client-Managed`

‏זה אחד ההבדלים החשובים ביותר בעולם הפקודות המתקדמות.

## ‏`Native`

‏ה־Venue עצמו מכיר את סוג הפקודה או את התכונה שלה ומנהל אותה.

‏לדוגמה עקרונית, אם Venue תומך בפקודה מסוימת Native, הברוקר שולח אליו הוראה שה־matching engine של אותו Venue יודע לנהל.

### ‏למה זה טוב?

- ‏פחות תלות בלוגיקה מקומית של ה־Broker.
- ‏לעיתים reaction מהיר יותר לשינויי Market State.
- ‏הסמנטיקה יכולה להיות מוגדרת היטב על ידי ה־Venue.

### ‏מה הבעיה?

- ‏לא כל Venue תומך באותו דבר.
- ‏אותו שם מסחרי יכול להתנהג אחרת בין Venues.
- ‏Direct Routing עשוי להיות דרוש.

## ‏`Broker-Simulated`

‏הברוקר מציג לך Order Type מסוים, אבל בפועל שומר לוגיקה אצלו ומשגר/משנה Orders בסיסיות יותר לפי הצורך.

‏זה לא אומר שהפקודה "לא אמיתית". זה אומר שמי שמחזיק את ה־state machine שלה הוא הברוקר ולא בהכרח ה־Exchange.

### ‏למה זה חשוב לנו?

‏כאשר Signal חי רק שניות, צריך להבין:

```text
Where is the logic running?
What market data drives it?
When does it reprice?
What happens during disconnects?
What happens outside supported sessions?
Can the behavior differ by destination?
```

## ‏`Client-Managed`

‏המנוע שלנו עצמו מחזיק את הלוגיקה.

‏למשל:

```text
place passive limit
wait 300 ms
if not filled and signal still valid:
    cancel
    wait for cancel/fill reconciliation
    submit more aggressive limit
```

‏כאן אנחנו מקבלים שליטה מקסימלית, אבל גם אחריות מקסימלית.

‏צריך לטפל ב־latency, ‏late fills, ‏duplicate events, ‏reconnects, ‏race conditions ו־state recovery.

### ‏כלל עבודה

> ‏לפני שמכניסים Order Type מתקדם למנוע, צריך לדעת **מי מנהל את ההתנהגות: Venue, Broker או אנחנו**.

---

# ‏1.5 פקודה היא State Machine, לא קריאת פונקציה

‏מבחינת קוד קל לחשוב:

```text
placeOrder()
```

‏ואז:

```text
cancelOrder()
```

‏אבל מבחינת מערכת מסחר חיה, Order עוברת מצבים ואירועים אסינכרוניים.

‏מודל מפושט:

```text
CREATED
  ↓
SUBMIT_REQUESTED
  ↓
ACKNOWLEDGED / WORKING
  ↓
PARTIALLY_FILLED ───────────────┐
  ↓                             │
FILLED                          │
                                │
WORKING → CANCEL_REQUESTED      │
               ↓                │
          CANCELLED             │
               │                │
               └── but a late fill may have crossed in flight
```

‏במציאות יש עוד מצבים: Validation, ‏Held, ‏PendingSubmit, ‏Inactive, ‏Rejected, ‏PendingCancel ועוד, והשם המדויק תלוי API/Broker.

‏העיקרון החשוב:

> ‏`cancel requested` אינו שווה ל־`cancel confirmed`.

‏ובוודאי שאינו שווה ל־"אי אפשר יותר לקבל Fill".

---

## ‏1.6 ה־Race החשוב ביותר: Fill מול Cancel

‏נניח:

```text
12:00:00.000  order is working
12:00:00.120  our signal weakens
12:00:00.121  engine sends cancel
12:00:00.123  venue matches the order
12:00:00.127  broker processes cancel request
12:00:00.130  fill event reaches us
```

‏אם המנוע מניח שברגע שקראנו `cancelOrder()` הפקודה נעלמה, הוא יכול לשלוח Order חלופית ולהגיע לפוזיציה כפולה.

‏לכן State נכון צריך להפריד לפחות:

```text
local cancel intent
broker cancel acknowledgement
terminal order state
executed quantity
remaining quantity
position quantity
```

‏זה אינו edge case תיאורטי. במנוע מהיר זו אחת מנקודות הכשל המרכזיות שצריך לתכנן לפני Live.

---

# ‏1.7 Partial Fill הוא מצב רגיל, לא תקלה

‏נניח שרצינו 100 מניות וקיבלנו:

```text
37 filled
63 remaining
```

‏מכאן יש כמה מדיניות אפשריות:

1. ‏לקבל את ה־37 ולבטל את השאר.
2. ‏להמשיך להמתין על ה־63.
3. ‏לבטל ולהגיש מחדש את ה־63 בצורה אגרסיבית יותר.
4. ‏להחליט ש־37 קטן מדי ולכן לצאת מהפוזיציה.
5. ‏להתאים את Exit לגודל שבוצע בפועל בלבד.

‏אין תשובה אוניברסלית.

‏אצלנו השאלות יהיו:

```text
How much signal life remains?
Is 37 shares economically meaningful after commissions/costs?
Did the partial fill occur because liquidity disappeared?
Did the fill itself indicate adverse selection?
Can the remaining quantity still enter without destroying net edge?
```

‏לכן `minimum useful fill` צריך להיות חלק מה־Execution Policy ולא תגובת חירום מאוחרת.

---

# ‏1.8 מחיר טוב ללא Fill אינו בהכרח ביצוע טוב

‏פקודה Passive יכולה להיראות מצוין:

```text
Bid = 50.00
Ask = 50.02
we join Bid at 50.00
```

‏אם המחיר מיד עולה ל־50.10 ואיננו מתבצעים, "חסכנו" שני סנטים אבל הפסדנו את כל ההזדמנות.

‏לעומת זאת, פקודה אגרסיבית ב־50.02 שילמה Spread אבל אולי תפסה את המהלך.

‏לכן איכות Execution אינה:

```text
lowest entry price
```

‏אלא משהו קרוב יותר ל־:

```text
expected realized net edge
=
probability of fill
× value if filled
- spread/slippage
- adverse selection
- missed-opportunity cost
- fees
- exit cost
```

‏זו הסיבה שהמסמך הזה יבחן כל Order Type דרך השאלה **איזה trade-off הוא משנה**, ולא רק דרך ההגדרה הטכנית שלו.

---

# ‏1.9 Queue position היא נכס — אבל נכס מתכלה

‏כאשר אנחנו מצטרפים ל־Bid או ל־Ask, ייתכן שיש לפנינו Orders אחרות.

‏במודל Price-Time Priority טיפוסי:

```text
better price wins first
then earlier order at same price wins first
```

‏לכן אם אנחנו מבטלים ומגישים מחדש באותו מחיר, אנו עלולים לאבד מקום בתור.

‏אבל אצלנו יש קונפליקט:

```text
queue priority
vs
signal freshness
```

‏פקודה בתור מצוין שאין מאחוריה יותר Edge אינה נכס. היא סיכון.

‏ב־holding horizon של שניות, לעיתים עדיף לאבד Queue Position מאשר להישאר עם Order שהסיבה לקיומה כבר נעלמה.

---

# ‏1.10 `Time in Force` אינו רק שדה טכני

‏`TIF` מגדיר כמה זמן Broker/Venue רשאים להשאיר את הפקודה חיה, אבל אצל מנוע קצר־טווח צריך בדרך כלל גם Lifetime אפליקטיבי משלנו.

‏לדוגמה:

```text
tif = DAY
application_ttl = 750 ms
```

‏אין סתירה.

‏`DAY` אומר שהברוקר יכול להחזיק אותה עד סוף היום אם לא נבטל; `application_ttl` אומר שהאסטרטגיה שלנו כבר אינה רוצה אותה אחרי 750 מילישניות.

‏במנוע שלנו חשוב לא לבלבל:

```text
broker order lifetime
with
signal lifetime
```

‏אלה שני שעונים שונים.

---

# ‏1.11 Support הוא רב־ממדי

‏השאלה "האם IBKR תומך בפקודה X?" אינה מספיק מדויקת.

‏צריך לשאול לפחות:

```text
Which product?
Which region?
Which venue?
SMART or direct?
Which trading session?
Which IBKR platform?
Which API?
Which account permissions?
Native or simulated?
```

‏לדוגמה, IBKR מתעדת Order Types שבהם מצוין במפורש `TWS Only`, אחרים זמינים גם ב־`IBKR Desktop`, ‏`Mobile` או `Client Portal`, וחלקם דורשים Direct Routing במקום `SMART`.

‏לכן בסוף המסמך לא תהיה עמודה אחת בשם `IBKR = YES/NO`. תהיה Capability Matrix מפורטת.

---

# ‏1.12 איך המנוע יכול לבדוק תמיכה במקום לנחש

‏`IBKR TWS API` מספק ב־`ContractDetails` שדה בשם:

```text
orderTypes
```

‏שמתאר את סוגי הפקודות הנתמכים עבור אותו Contract, ולצדו:

```text
validExchanges
```

‏לכן עיקרון הנדסי טוב הוא:

```text
static capability knowledge
+ runtime contract capability discovery
+ broker rejection handling
```

‏ולא:

```text
hard-code once and assume forever
```

‏זה חשוב במיוחד כאשר אנחנו סורקים אלפי מניות ורוצים שה־Execution Engine יהיה robust לשינויים במוצר, Venue או Broker configuration.

---

# ‏1.13 עובדות `IBKR` שאומתו למסגרת הקורס

> ‏אימות אחרון: `2026-10-27`. אלה עובדות תיעוד כלליות של IBKR; לפני Live נבדוק גם את החשבון, המוצר וה־routing בפועל.

### ‏עובדה: `TWS API` חושף Order Object עשיר

‏ה־API כולל בין היתר `orderType`, ‏`lmtPrice`, ‏`auxPrice`, ‏`tif`, ‏`displaySize`, ‏`allOrNone`, ‏parent relationships ושדות מתקדמים נוספים. כלומר ה־API אינו מוגבל ל־Market/Limit בסיסיות.

### ‏עובדה: IBKR מפרידה בין פקודות דומות לפי Routing

‏לדוגמה, התיעוד הנוכחי של `Pegged-to-Midpoint` מציין שלפקודות מניות אמריקאיות נדרש Direct Routing, בעוד `MidPrice` מתועד כ־IBKR Algo עם `SMART` routing. לכן שני שמות שנשמעים דומים יכולים לעבור execution path שונה לגמרי.

### ‏עובדה: לא כל Order Type מופיע בכל UI

‏לדוגמה, `Iceberg / Reserve` מתועד כיום כ־`TWS Only`, בעוד `MidPrice` מתועד ב־`TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`.

### ‏עובדה: OCA אינה מבטיחה ביטול אטומי בבורסה

‏IBKR מציינת במפורש שאין הבטחה שבקשת Cancel/Modify של OCA תגיע ל־Exchange לפני Order שכבר מתבצעת. זה בדיוק סוג ה־race שמנוע מקומי חייב לדעת להתמודד איתו.

---

# ‏1.14 המשמעות הישירה לרובוט שלנו

‏לפני שנדון בשמות המתקדמים, כבר אפשר לקבוע כמה עקרונות הנדסיים:

1. ‏ה־Strategy לא תשלח Order ישירות; היא תיצור `Trade Intent`.
2. ‏שכבת Execution נפרדת תבחר את ההתנהגות לפי Market State ו־Signal Lifetime.
3. ‏כל Order תחזיק Price Bound מפורש כאשר הדבר מתאים, ולא נניח ש־Market תמיד בטוחה מספיק.
4. ‏Partial Fill יהיה first-class state.
5. ‏Cancel יהיה תהליך אסינכרוני, לא Boolean.
6. ‏ה־Position יחושב מ־Fills בפועל, לא מ־requested quantity.
7. ‏Support של Order Type ייבדק גם לפי Contract/Route ולא רק לפי תיעוד סטטי.
8. ‏פקודה שלא מתאימה יותר ל־Signal תבוטל גם אם יש לה Queue Position טוב.
9. ‏לא נבחר Order Type לפי השם המרשים ביותר; נבחר לפי הבעיה שהוא פותר.
10. ‏כל Order Type מתקדם שייכנס למנוע יצטרך להראות שיפור ב־`net executable edge`, לא רק Fill Price יפה יותר.

---

# ‏1.15 שאלות מקצועיות שחייבות לקבל תשובה לפני Live

‏בסיום המיני־קורס נוכל לענות באופן מדויק על כל אחת מהשאלות הבאות:

- ‏מתי `Marketable Limit` עדיפה על `Market`?
- ‏מתי `IOC` עדיפה על Limit קצרה שאנחנו מבטלים בעצמנו?
- ‏מה ההבדל המעשי בין `IOC`, ‏`FOK`, ‏`AON` ו־Minimum Quantity?
- ‏מתי `Post Only` עוזרת ומתי היא גורמת לנו לפספס מומנטום?
- ‏האם Midpoint execution אמיתי מתאים לסיגנל שחי שניות?
- ‏מה ההבדל בין `MidPrice`, ‏`Pegged-to-Midpoint` ו־`Snap to Midpoint` ב־IBKR?
- ‏מתי כדאי להשתמש ב־`Reserve/Iceberg` גם אם הכמות שלנו אינה מוסדית?
- ‏מה `Hidden` עושה ל־queue ול־fill probability?
- ‏איזו פקודה שומרת מחיר אבל לא משאירה stale remainder?
- ‏מתי כדאי לנהל chase בעצמנו ומתי לתת ל־Broker Algo לעשות זאת?
- ‏איך מתכננים Exit כאשר Entry התמלאה חלקית?
- ‏איך מונעים parent/child race ב־Bracket Orders?
- ‏מה קורה בזמן reconnect כאשר Order עדיין חיה ב־Broker?
- ‏איך המנוע יודע מה באמת נתמך במניה וב־Venue מסוימים?
- ‏איזו התנהגות מתאימה ל־entry רגיל, aggressive entry, passive probe, fast exit ו־emergency exit?

---

# ‏מקורות רשמיים למסגרת חלק 1

‏הקישורים הבאים הם מקורות רשמיים של Interactive Brokers ונבדקו בעת כתיבת החלק הזה:

- ‏IBKR API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR API — `ContractDetails` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/contract-details>
- ‏IBKR API — placing orders introduction: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>
- ‏IBKR General/API order types introduction: <https://www.interactivebrokers.com/docs/general/order-types/introduction>
- ‏IBKR Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>

---

# ‏Checkpoint — סוף חלק 1

‏בשלב הזה בנינו את המודל שעליו כל שאר הפקודות יישבו: Order כ־Execution Contract וכ־State Machine, ההפרדה בין Strategy ל־Execution, ההבדל בין Native/Broker-Simulated/Client-Managed, והמשמעות של Fill/Cancel/Partial Fill/Queue/Support.

‏החלק הבא ירד לעומק של **`Market`, ‏`Limit`, ‏`Marketable Limit`, ‏Passive Limit ו־price caps** — לא כהגדרות בסיסיות שכבר למדנו, אלא ברמת execution mechanics: מה קורה מול ה־Book, אילו failure modes יש, איך מודדים slippage ו־fill quality, ומה צריך להיות ה־baseline למנוע מומנטום שמנסה להיכנס ולצאת בתוך שניות.

---

# ‏חלק 2 — Core Execution: ‏`Market`, ‏`Limit`, ‏`Marketable Limit` ו־Passive Limit

## ‏2.1 אותו `Order Type` יכול להיות אגרסיבי או פסיבי

‏הטעות הראשונה שצריך למחוק היא ההנחה:

```text
Market = aggressive
Limit = passive
```

‏החלק הראשון נכון בדרך כלל; השני אינו נכון.

‏`Limit` אומרת רק:

> ‏אל תבצע אותי במחיר גרוע יותר מהגבול שקבעתי.

‏היא אינה אומרת אם אנחנו לוקחים נזילות או מספקים נזילות.

‏נניח:

```text
Bid = 50.00
Ask = 50.02
```

‏שלוש פקודות `BUY LMT` שונות:

```text
BUY LMT 49.99   -> passive below bid
BUY LMT 50.00   -> passive at bid
BUY LMT 50.03   -> marketable / aggressive
```

‏אותו `orderType = LMT`, שלוש התנהגויות ביצוע שונות.

‏לכן מנוע מקצועי צריך לשמור בנפרד לפחות:

```text
order_type
aggressiveness
limit_price
reference_bid
reference_ask
reference_mid
```

---

## ‏2.2 מה `Market` באמת מבקשת

‏פקודת `Market` אומרת למעשה:

> ‏העדף ביצוע עכשיו על פני שליטה מפורשת במחיר.

‏היא לא אומרת:

> ‏"קנה בדיוק ב־Ask שאני רואה על המסך."

‏ה־Quote שאתה רואה הוא snapshot. בזמן שהפקודה עוברת דרך האפליקציה, ה־Broker, ה־Router וה־Venue, הספר יכול להשתנות.

‏נניח שבזמן ההחלטה ראינו:

```text
Ask book
100 @ 50.02
150 @ 50.03
300 @ 50.05
500 @ 50.08
```

‏ואנחנו רוצים 400 מניות.

‏אם הנזילות לא השתנתה, ביצוע אגרסיבי עשוי לקבל:

```text
100 @ 50.02
150 @ 50.03
150 @ 50.05
```

‏המחיר הממוצע הוא כבר גבוה מה־best ask.

‏זה נקרא בהקשר הזה `walking the book`: הכמות שלנו צורכת מספר רמות מחיר.

---

## ‏2.3 `Best Ask` אינו מחיר מובטח לכמות שלנו

‏כאשר רואים:

```text
Ask = 50.02 x 100
```

‏זה אומר שיש כמות מוצגת מסוימת במחיר הזה בזמן ה־snapshot.

‏זה אינו אומר:

```text
my full order will fill at 50.02
```

‏צריך להפריד בין:

```text
Top of Book
```

‏לבין:

```text
Executable depth for my requested quantity
```

‏במנוע שלנו, אם רוצים לקנות 800 מניות, אין משמעות מספקת לשאלה "מה ה־Ask?". השאלה הנכונה יותר היא:

> ‏מהו המחיר הממוצע והמחיר הגרוע ביותר שאני צפוי לשלם אם אקח עכשיו עד 800 מניות מתוך הנזילות הנראית — ומה הסיכון שהנזילות הזו תיעלם לפני שהפקודה תגיע?

---

## ‏2.4 `Market` — למה היא כן קיימת ולמי היא מועילה

‏ל־`Market` יש יתרון אמיתי: היא מבטאת `urgency` גבוהה מאוד.

‏היא יכולה להתאים כאשר:

- ‏חשוב יותר לצאת מהפוזיציה מאשר לשמור על מחיר יעד צר.
- ‏ה־instrument נזיל מאוד והכמות קטנה יחסית לעומק.
- ‏ה־spread צר וה־book יציב יחסית.
- ‏הסיכון מהישארות בפוזיציה גדול מהסיכון ל־slippage.
- ‏יש מצב `emergency exit` שבו price certainty משנית ל־position certainty.

‏מי משתמש בה? כמעט כל סוגי המשתתפים יכולים להשתמש בה, אבל מקצוענים לא מתייחסים אליה כאל "כפתור מהיר" בלבד. הם מתייחסים אליה כהצהרה:

```text
execution urgency > explicit price protection
```

---

## ‏2.5 למה `Market` מסוכנת במיוחד למנוע שלנו

‏המטרה שלנו היא Edge קטן וחיי עסקה קצרים. לכן כמה סנטים של execution loss יכולים להיות אחוז גדול מהרווח הצפוי.

‏הסיכונים המרכזיים:

1. ‏`Slippage` — המחיר בפועל גרוע מהמחיר שעליו התקבלה ההחלטה.
2. ‏`Depth consumption` — הכמות חוצה יותר מרמה אחת בספר.
3. ‏`Quote fade` — הנזילות שראינו נעלמת לפני שהפקודה מגיעה.
4. ‏`Volatility burst` — בזמן קצר מאוד המחיר יכול לעבור כמה ticks.
5. ‏`No explicit worst price` — המנוע לא הגדיר בעצמו נקודת "מכאן העסקה כבר לא כלכלית".
6. ‏`Round-trip amplification` — גם בכניסה וגם ביציאה אפשר לשלם execution cost.

‏לכן `Market` אינה baseline טבעי לכניסה רגילה אצלנו רק משום שהיא מהירה.

---

## ‏2.6 פרט חשוב ב־IBKR: `Market` לא בהכרח נשלחת כ־Market פשוטה

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שבדרך כלל היא מטפלת ב־Market Orders באמצעות **סדרה של marketable limit orders מדומות**, כחלק מהגנת מחיר, ובמקומות מתאימים יכולה להשתמש ב־`Market With Protection`.

‏המשמעות המקצועית:

- ‏השם שהלקוח שולח הוא `Market`.
- ‏אבל ה־execution path הפנימי של הברוקר עשוי להשתמש ב־price caps.
- ‏לכן אפילו `Market` אינה מבטיחה semantics של "כל מחיר, בלי שום מגבלה".
- ‏במצבים קיצוניים יכולה להיות גם השהיה או אי־ביצוע אם מנגנוני ההגנה אינם מאפשרים execution מיידי.

‏זה חשוב מאוד למנוע: לא בונים assumptions על השם בלבד; מודדים בפועל `ack latency`, ‏`fill latency`, ‏fills ו־rejections.

---

## ‏2.7 `Limit` — ההבטחה שהיא כן נותנת

‏בקנייה:

```text
BUY LMT 50.05
```

‏פירושו:

> ‏מותר לבצע ב־50.05 או טוב יותר; אסור לבצע במחיר גרוע מ־50.05.

‏במכירה:

```text
SELL LMT 50.05
```

‏פירושו:

> ‏מותר לבצע ב־50.05 או טוב יותר; אסור לבצע במחיר נמוך מ־50.05.

‏`Limit` נותנת `price protection`, אבל **אינה נותנת fill guarantee**.

‏זה trade-off בסיסי:

```text
Market:
more execution urgency
less explicit price certainty

Limit:
explicit worst acceptable price
less execution certainty
```

---

## ‏2.8 `Marketable Limit` — אחד הכלים המרכזיים לרובוט קצר־טווח

‏נניח:

```text
Bid = 50.00
Ask = 50.02
```

‏ואנחנו שולחים:

```text
BUY 100 LMT 50.04
```

‏זו עדיין `Limit Order`, אבל היא marketable מפני שהמחיר שלנו מספיק אגרסיבי כדי לפגוש את ה־Ask הקיים.

‏אם יש 100 מניות זמינות ב־50.02 והיא מגיעה בזמן, היא יכולה להתבצע ב־50.02 — לא חייבים לשלם 50.04 רק משום שזה ה־Limit.

‏ה־50.04 הוא:

> ‏`worst acceptable price`, לא יעד תשלום.

‏זה בדיוק מה שהופך את ההתנהגות הזו למעניינת אצלנו:

```text
try to execute now
but refuse execution beyond economic boundary
```

---

## ‏2.9 `Marketable Limit` אינה קסם ואינה מבטיחה Fill

‏נניח שהמנוע רואה:

```text
Ask = 50.02
```

‏ושולח:

```text
BUY LMT 50.04
```

‏בזמן ההגעה לשוק ייתכן שכבר יש:

```text
Bid = 50.04
Ask = 50.06
```

‏עכשיו ה־Limit שלנו אינה marketable יותר.

‏היא יכולה להישאר Working ב־50.04 אם ה־TIF וה־routing מאפשרים זאת.

‏כלומר:

> ‏Marketable היא תכונה ביחס למצב השוק **ברגע מסוים**, לא תווית נצחית של הפקודה.

‏מכאן נובע שמנוע חייב למדוד:

```text
decision_time
submit_time
ack_time
first_fill_time
last_fill_time
market_state_at_each_stage
```

---

## ‏2.10 הסיכון הסמוי: Marketable Limit יכולה להפוך ל־Passive remainder

‏נניח:

```text
Ask:
40 @ 50.02
30 @ 50.03
```

‏אנחנו שולחים:

```text
BUY 100 LMT 50.03
DAY
```

‏ייתכן שיתבצעו 70 מניות מיד:

```text
40 @ 50.02
30 @ 50.03
```

‏ויישארו:

```text
30 remaining @ 50.03
```

‏אם אין `IOC`, היתרה יכולה להפוך לפקודה נחה ב־50.03.

‏עבור Signal שחי שניות, זו יכולה להיות בעיה: הפקודה התחילה כאגרסיבית אבל סיימה כ־stale passive order.

‏לכן בהמשך נלמד מדוע השילוב:

```text
Marketable Limit + IOC
```

‏מעניין במיוחד כאשר רוצים "מה שניתן עכשיו — כן; שארית ישנה — לא".

---

## ‏2.11 Passive Limit — אנחנו מבקשים מהשוק להגיע אלינו

‏אם:

```text
Bid = 50.00
Ask = 50.02
```

‏ואנחנו שולחים:

```text
BUY LMT 50.00
```

‏אנחנו בדרך כלל מצטרפים לצד הקונים ולא משלמים מיד את ה־Ask.

‏היתרונות האפשריים:

- ‏חיסכון ב־spread.
- ‏מחיר כניסה טוב יותר.
- ‏ב־venues מסוימים ייתכנו maker economics שונים.
- ‏אפשרות ל־price improvement לעומת לקיחת ה־Ask.

‏אבל המחיר הכלכלי האמיתי הוא לא רק commission/rebate. הוא כולל:

```text
no-fill risk
queue delay
missed opportunity
adverse selection
signal decay
```

---

## ‏2.12 הבעיה המקצועית של Passive Fill: למה דווקא עכשיו מישהו מכר לי?

‏זה לב ה־`adverse selection`.

‏נניח שאנחנו ממתינים ב־Bid ב־50.00.

‏קיבלנו Fill.

‏מתחיל עלול לחשוב:

> ‏מעולה, קניתי זול יותר.

‏אבל איש execution שואל:

> ‏למה המוכר בחר לקחת את ה־Bid דווקא עכשיו?

‏אולי מיד אחרי ה־Fill השוק הופך:

```text
Bid = 49.97
Ask = 49.99
```

‏קיבלנו מחיר שנראה טוב ביחס ל־Ask הישן, אבל קיבלנו Fill בדיוק כאשר המידע החדש הפך את המחיר לפחות טוב.

‏לכן צריך למדוד לאחר Passive Fill:

```text
markout_100ms
markout_250ms
markout_500ms
markout_1s
markout_2s
markout_5s
```

‏כלומר: מה קרה למחיר אחרי שהתבצענו?

---

## ‏2.13 `No Fill` הוא גם תוצאה כלכלית

‏אם Passive Entry לא התמלאה והמניה עלתה בלעדינו, אין P&L של עסקה — אבל כן היה `opportunity cost`.

‏לכן השוואה לא הוגנת היא:

```text
passive filled trades
vs
aggressive filled trades
```

‏צריך לכלול גם Signals שבהם Passive לא התמלאה.

‏אחרת נקבל selection bias.

‏מדד מחקר טוב יותר צריך לכלול:

```text
fill rate
conditional P&L when filled
missed-move value when not filled
adverse-selection markout
net outcome per signal opportunity
```

---

## ‏2.14 איך לבחור `price cap` נכון ל־Marketable Limit

‏טעות קלה היא לומר:

```text
always cross by 2 cents
```

‏זה פשוט, אבל לא מקצועי מספיק.

‏שני סנטים יכולים להיות:

- ‏זניחים במניה של מאות דולרים עם spread רחב.
- ‏חלק עצום מה־Edge במניה זולה עם spread של tick אחד.
- ‏מספיק לעומק קטן אבל לא לכמות גדולה.
- ‏רחבים מדי בזמן volatility גבוהה.

‏ה־cap צריך להיות קשור לכלכלה של העסקה.

‏מודל עקרוני:

```text
max_buy_price =
    expected_exit_price
  - required_net_edge
  - expected_exit_cost
  - commissions_and_fees
  - safety_margin
```

‏ובמכירה:

```text
min_sell_price =
    expected_exit_value_floor
  + required_net_edge_adjustment
```

‏הנוסחה המדויקת תשתנה לפי המודל שלנו, אבל העיקרון הוא:

> ‏ה־Limit אינו offset קבוע; הוא גבול כלכלי שמעבר אליו העסקה כבר אינה שווה לנו.

---

## ‏2.15 `Price cap` חייב להכיר גם Depth

‏נניח:

```text
Ask book:
100 @ 20.00
100 @ 20.01
100 @ 20.02
1000 @ 20.10
```

‏אם רוצים 250 מניות ו־cap הוא 20.02, יש displayed depth מספק לפי ה־snapshot.

‏אם רוצים 600 מניות, אין displayed depth מספק עד ה־cap.

‏מכאן שני דברים:

1. ‏הכמות היא חלק ממדיניות המחיר.
2. ‏גם אם ה־Top of Book נראה מצוין, full-size execution יכול להיות בלתי כלכלי.

‏לכן מנוע יכול לחשב לפני שליחה:

```text
visible_qty_within_cap
expected_vwap_within_cap
worst_visible_price_within_cap
requested_qty / visible_qty_within_cap
```

‏זה עדיין לא מבטיח Fill, כי Book יכול להשתנות ויש hidden liquidity, אבל זו בדיקת feasibility טובה יותר מ־Ask בודד.

---

## ‏2.16 `Slippage` — חייבים להגדיר מול איזה Benchmark

‏המילה `slippage` לבדה אינה מספיקה.

‏אפשר למדוד:

```text
fill - decision ask
fill - submit ask
fill - arrival ask
fill - midpoint at decision
fill - midpoint at arrival
fill - last trade
```

‏כל אחד עונה על שאלה אחרת.

‏למנוע שלנו חשוב במיוחד להפריד:

### ‏`Decision slippage`

‏כמה הפסדנו מהרגע שבו האסטרטגיה החליטה עד הביצוע.

### ‏`Arrival slippage`

‏כמה הביצוע היה גרוע ביחס לשוק כשהפקודה הגיעה ל־execution layer / broker.

### ‏`Implementation shortfall`

‏העלות הכוללת של המעבר מהחלטה לתוצאה בפועל, כולל no-fills, partials, fees ותנועה בזמן.

‏כך אפשר לדעת אם הבעיה היא Signal איטי, תוכנה איטית, routing, order policy או שוק שברח.

---

## ‏2.17 למה `Last` הוא Benchmark חלש לביצוע

‏אם:

```text
Last = 49.98
Bid = 50.00
Ask = 50.02
```

‏קנייה ב־50.02 אינה בהכרח "slippage של 4 סנטים".

‏ה־Last יכול להיות עסקה ישנה, venue אחר, trade condition אחר או פשוט מחיר שאינו זמין יותר.

‏לצורך execution, בדרך כלל חשוב יותר לדעת:

```text
what was executable when we decided?
what was executable when we arrived?
what did we actually receive?
```

‏זו אחת הסיבות שבמנוע קצר אנחנו צריכים Quote/Depth timestamps ולא רק stream של Last trades.

---

## ‏2.18 Aggressive Entry מול Passive Entry — אין מנצח קבוע

‏אפשר לחשוב על זה כבעיה של Expected Value:

```text
Aggressive:
+ higher immediate fill probability
+ lower missed-move risk
- spread/taker cost
- more slippage/depth consumption

Passive:
+ potentially better price
+ possible spread capture
- lower fill probability
- queue risk
- adverse selection
- missed signal
```

‏אם Signal חזק מאוד וקצר, no-fill cost יכול להיות גדול יותר מה־spread.

‏אם Signal חלש יותר, spread רחב והזמן מאפשר, Passive יכולה להיות עדיפה.

‏לכן ה־execution mode צריך להיות פונקציה של מצב השוק ולא setting קבוע.

---

## ‏2.19 כניסה ויציאה אינן סימטריות

‏בכניסה אפשר תמיד לבחור:

```text
NO TRADE
```

‏אם המחיר נהיה גרוע מדי — לא נכנסים.

‏ביציאה, כבר יש Position. לפעמים אי־ביצוע הוא עצמו סיכון.

‏לכן יכול להיות שמדיניות נכונה תהיה:

```text
Entry:
strict price cap
accept no-fill

Normal Exit:
price-capped but more aggressive

Emergency Exit:
prioritize reducing position risk
```

‏זו סיבה חשובה לא להשתמש באותו `Order Policy` אוטומטית ל־Entry ול־Exit.

---

## ‏2.20 רובוט לא צריך לבחור "Order Type" — הוא צריך לבחור `Execution Mode`

‏במקום קוד מהסוג:

```text
if signal:
    BUY LMT
```

‏עדיף להגדיר Modes ברורים.

### ‏`PASSIVE_PROBE`

‏ניסיון קצר לקבל Fill בלי לחצות את ה־spread.

```text
join or improve bid
short application TTL
cancel on signal decay
```

### ‏`PASSIVE_JOIN`

‏הצטרפות ל־best bid/ask כאשר הזמן מאפשר ויש סיבה להעדיף queue exposure.

### ‏`MARKETABLE_CAPPED`

‏לקיחת נזילות מיידית עד worst acceptable price.

```text
LMT with economically derived cap
```

### ‏`AGGRESSIVE_STEP`

‏התחלה ב־cap צר והרחבה מבוקרת רק אם Signal עדיין תקף.

### ‏`EXIT_FAST`

‏מדיניות שמעדיפה סגירת Position מהר יותר מה־Entry baseline.

### ‏`EMERGENCY_REDUCE`

‏מצב חריג שבו המטרה הראשית היא הורדת Exposure; גם כאן צריך guardrails, אך סדר העדיפויות שונה.

‏המיפוי מ־Mode ל־Order Type יכול להשתנות לפי IBKR capability, Venue ו־TIF.

---

## ‏2.21 למה רובוט מונחה תוכנה יכול לנצל `Limit` טוב יותר מאדם

‏אדם יכול להסתכל על הספר ולשנות מחיר ידנית, אבל תוכנה יכולה לבצע את התהליך באופן עקבי ומהיר:

```text
recompute max acceptable price
recompute visible depth
recompute signal age
recompute expected edge
choose aggressiveness
submit
observe fills
cancel/re-evaluate
```

‏היתרון אינו "ללחוץ מהר" בלבד.

‏היתרון הוא שהמנוע יכול להשתמש באותה מדיניות בדיוק אלפי פעמים ולמדוד את התוצאה.

‏זה מאפשר לבצע ניסוי אמיתי בין:

```text
Passive
Marketable Limit
Marketable Limit + IOC
Midpoint/Pegged
Adaptive
```

‏במקום לבחור לפי תחושת בטן.

---

## ‏2.22 מתי Automation הופכת למסוכנת

‏אותה מהירות יכולה להגדיל טעויות.

‏דוגמאות:

- ‏Quote stale גורם ל־cap לא נכון.
- ‏כפל event גורם לשליחת Order פעמיים.
- ‏Cancel שלא אושר גורם ל־overfill.
- ‏לולאת chase מרחיבה מחיר שוב ושוב בלי לשים לב שה־Edge כבר נעלם.
- ‏Partial fill אינו מעדכן quantity ונשלחת יתרה גדולה מדי.
- ‏Market data נתקע אבל execution עדיין פעיל.
- ‏יחידות מחיר/tick size שגויות יוצרות Limit לא חוקית.
- ‏Reconnect מחזיר Orders חיות שהמנוע המקומי שכח.

‏לכן כל Mode אוטומטי חייב גבולות:

```text
max_total_qty
max_price_deviation
max_chase_steps
max_order_age
max_signal_age
max_position
max_outstanding_orders
kill_switch
```

---

## ‏2.23 `Chase` — המנגנון שמסוכן להפוך ל־Market מוסווית

‏נניח שהתחלנו:

```text
BUY LMT 50.02
```

‏לא התמלאנו, ואז:

```text
50.03
50.04
50.05
50.06
...
```

‏אם כל פעם אנחנו מעלים Limit בלי לחשב מחדש את Edge, בנינו למעשה Market Order איטית בלי לקרוא לה Market.

‏Chase מקצועי צריך תנאי עצירה:

```text
signal still valid
remaining edge > required threshold
price <= hard economic cap
chase_count < max_chase_steps
time_since_signal < max_signal_age
```

‏כאשר אחד נשבר — `NO MORE CHASE`.

---

## ‏2.24 האם כדאי "להצמיד למוביל" ב־Bid או Ask?

‏זו טקטיקה אפשרית, אבל צריך להבין מה היא באמת עושה.

‏בקנייה, הצטרפות ל־`Bid1` נותנת לנו מחיר פסיבי טוב יותר מלקיחת ה־Ask, אבל:

- ‏אנחנו נכנסים לתור.
- ‏לא ידוע כמה כמות לפנינו באמת, במיוחד עם hidden liquidity.
- ‏אם ה־Bid זז, צריך להחליט אם לעקוב.
- ‏כל cancel/replace יכול לפגוע ב־queue priority.
- ‏אם המחיר עולה מהר, אנחנו עלולים להישאר מאחור.

‏לכן "להיצמד למוביל" אינה אסטרטגיית ביצוע מלאה. היא רק initial placement rule.

‏צריך להוסיף:

```text
max_wait
cancel trigger
reprice trigger
max chase
signal expiry
partial-fill policy
```

---

## ‏2.25 האם להיות לבד ברמת מחיר זה בהכרח רע?

‏לא בהכרח.

‏אם אנחנו היחידים ב־Bid מסוים, ייתכן שאנחנו פשוט מציעים מחיר טוב יותר מהשאר.

‏אבל עבור המנוע שלנו זה יכול להיות Diagnostic שימושי:

- ‏האם אנחנו יוצרים price level חדש שלא התכוונו ליצור?
- ‏האם אנחנו הופכים גלויים מדי ביחס לכמות שלנו?
- ‏האם price improvement קטן באמת שווה אובדן של queue context קיים?
- ‏האם order book השתנה מאז החישוב?

‏לכן אפשר להחזיק Policy שמעדיפה להצטרף לרמה קיימת, אבל לא להפוך זאת לחוק שוק אוניברסלי. צריך לבדוק אמפירית אם זה משפר Fill/Markout/Net Edge.

---

## ‏2.26 מדדי Telemetry שחייבים לכל Order

‏כדי ללמוד איזה Mode עובד, נשמור לפחות:

```text
signal_id
order_id
symbol
side
requested_qty
filled_qty
order_type
execution_mode
limit_price
reference_bid
reference_ask
reference_mid
visible_depth_within_cap
signal_timestamp
decision_timestamp
submit_timestamp
ack_timestamp
first_fill_timestamp
last_fill_timestamp
cancel_request_timestamp
cancel_ack_timestamp
avg_fill_price
worst_fill_price
commission
fees
route
venue when available
```

‏ומדדים נגזרים:

```text
submit_latency
ack_latency
time_to_first_fill
time_to_full_fill
fill_ratio
decision_slippage
arrival_slippage
spread_paid_or_captured
markout_100ms
markout_500ms
markout_1s
markout_5s
missed_move_if_no_fill
net_edge_after_execution
```

‏בלי הנתונים האלה לא נוכל לדעת אם `Pegged`, ‏`Bracket`, ‏`IOC`, ‏`Adaptive` או כל Order מתקדם באמת שיפרו את המערכת.

---

## ‏2.27 מטריצת החלטה ראשונית לחלק 2

| מצב | כלי בסיסי למחקר | למה | הסיכון המרכזי |
|---|---|---|---|
| ‏Signal חזק וקצר, Spread סביר | `Marketable Limit` עם cap כלכלי | ‏מהירות עם price bound | ‏cap רחב מדי או שוק שבורח לפני arrival |
| ‏Signal תקף אך urgency נמוכה יותר | Passive `Limit` | ‏ניסיון לחסוך spread | ‏no-fill / adverse selection |
| ‏נזילות דקה או volatility גבוהה | `Limit` שמרנית / `NO TRADE` | ‏מונע runaway price | ‏פספוס הזדמנות |
| ‏יציאה רגילה | Aggressive price-capped `Limit` | ‏איזון בין מהירות להגנת מחיר | ‏position נשאר אם cap צר מדי |
| ‏מצב חירום | Policy ייעודית להפחתת Exposure | ‏position risk קודם | ‏slippage גבוה |
| ‏Edge קטן מה־round-trip execution cost | `NO TRADE` | ‏אין עסקה כלכלית | ‏FOMO בלבד |

‏זו אינה טבלת Live סופית. היא baseline מחקרי שיקבל refinement אחרי `IOC`, ‏Pegged/Midpoint, routing ו־broker algos.

---

## ‏2.28 `IBKR` — מה נתמך כרגע עבור `Market` ו־`Limit`

> ‏אימות אחרון: `2026-10-27`, לפי התיעוד הרשמי של IBKR. לפני שימוש אמיתי צריך לבדוק גם account/product/route בפועל.

### ‏`Market`

‏IBKR מתעדת `Market` עבור מניות ומוצרים נוספים, עם תמיכה ב־`TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`, וב־Smart או Directed routing לפי המוצר/מסלול.

### ‏`Limit`

‏IBKR מתעדת `Limit` עבור מניות ומוצרים נוספים, גם ב־`TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`, עם Smart ו־Directed routing.

### ‏`TWS API`

‏ב־Order object קיימים בין היתר:

```text
orderType
lmtPrice
tif
```

‏ולכן `MKT` ו־`LMT` הם חלק מה־API automation path הרגיל.

### ‏`Marketable Limit`

‏אין צורך ב־Order Type נפרד כדי לקבל את ההתנהגות הבסיסית. זו `Limit` שמחירה חוצה או פוגש את הצד הנגדי בזמן שהיא ניתנת לביצוע.

### ‏Price filters ו־Price Management

‏IBKR מתעדת pre-trade price/size filters, ויכולה לדחות, להגביל או price-cap Orders במצבים מסוימים. בנוסף קיים `Price Management Algo` attribute למקרים שבהם מחיר Limit רחוק מה־reference price המותר.

‏מבחינתנו:

> ‏גם אם המנוע חושב שה־cap חוקי וכלכלי, צריך לטפל ב־broker rejection/price-cap behavior כחלק מה־state machine.

---

## ‏2.29 ההמלצה ההנדסית הראשונית למנוע שלנו

‏לפני שבודקים Order Types מתקדמים, baseline טוב למחקר הוא לא "תמיד Market" ולא "תמיד Bid".

‏הייתי מגדיר שלושה Challengers בסיסיים:

```text
A. Passive Limit with short application TTL
B. Marketable Limit with economically derived cap
C. Marketable Limit + immediate-expiry behavior
   (IOC יילמד לעומק בחלק הבא)
```

‏ולכל אחד למדוד:

```text
fill rate
fill speed
entry markout
missed opportunity
round-trip net edge
exit feasibility
failure rate
```

‏רק אחר כך אפשר להחליט מהו Default לפי Regime.

‏הסיבה היא שכל פקודה "יפה" על הנייר יכולה להפסיד בממד אחר:

```text
better price but no fill
faster fill but too much slippage
high fill rate but adverse selection
cheap entry but expensive exit
```

---

## ‏2.30 Practitioner Secrets — הדברים שקל לפספס

### ‏1. `Limit` אינה בהכרח פסיבית

‏אגרסיביות היא יחס בין ה־Limit ל־Book, לא שם הפקודה.

### ‏2. `Marketable` יכולה להפוך ל־resting

‏אם השוק זז או אם נשאר remainder ואין `IOC`, ההתנהגות משתנה באמצע חיי אותה Order.

### ‏3. Fill טוב יכול להיות Fill רע

‏מחיר שנראה טוב בזמן ה־Fill יכול להיות סימן ל־adverse selection אם השוק מיד ממשיך נגדנו.

### ‏4. No-fill חייב להיכנס למחקר

‏התעלמות מהזדמנויות שפספסנו גורמת ל־Passive להיראות טוב מדי.

### ‏5. `Last` אינו executable price

‏אסטרטגיה שמודדת Alpha על Last אבל מבצעת על Bid/Ask יכולה לדמיין Edge שלא ניתן למימוש.

### ‏6. Chase בלי hard cap הוא Market בתחפושת

‏השם `Limit` אינו מציל אותנו אם הקוד ממשיך להעלות את המחיר עד שמתבצע.

### ‏7. Exit economics חשובים כבר בזמן Entry

‏אסור לחשב "יש לי 0.20% upside" בלי לשאול באיזה מחיר נוכל לצאת ומה יהיה round-trip cost.

### ‏8. Broker protection משנה semantics

‏ב־IBKR, Market יכולה להיות מטופלת באמצעות simulated marketable limits. לכן telemetry אמיתי חשוב יותר מהנחה פשטנית על order name.

---

# ‏מקורות רשמיים לחלק 2

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Market Order Handling using Simulated Market Orders: <https://www.interactivebrokers.com/en/trading/simulated-market-orders.php>
- ‏IBKR — Price Management Algo: <https://www.interactivebrokers.com/en/trading/orders/pricemanagementalgo.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — `ContractDetails` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/contract-details>
- ‏IBKR General — Order Types introduction: <https://www.interactivebrokers.com/docs/general/order-types/introduction>

---

# ‏Checkpoint — סוף חלק 2

‏בחלק הזה עברנו מהגדרות בסיסיות ל־execution mechanics: למה Top of Book אינו מחיר מובטח, איך Market יכולה ללכת בתוך ה־Book, למה Marketable Limit היא התנהגות של Limit ולא קסם נפרד, איך remainder יכול להפוך ל־stale passive order, למה no-fill ו־adverse selection חייבים להיכנס למחקר, ואיך לתרגם את כל זה ל־Execution Modes עבור רובוט.

‏ה־baseline שנוצר הוא: **לא לבחור Order לפי שם, אלא לפי urgency, economic price cap, depth, signal lifetime, fill state ו־exit feasibility.**

‏החלק הבא יהיה `Time in Force` ופקודות מיידיות — `DAY`, ‏`GTC`, ‏`GTD`, ‏`IOC`, ‏`FOK`, ‏`AON` ו־Minimum Quantity — עם דגש עמוק על השאלה מתי אנחנו רוצים partial fill עכשיו, full fill עכשיו, או בכלל לא להשאיר remainder.

---

# ‏חלק 3 — Time in Force ופקודות מיידיות

## ‏3.1 `Time in Force` הוא חלק מהאלגוריתם, לא שדה מנהלתי

‏ה־`TIF` עונה על שאלה שונה מ־Order Type:

```text
Order Type = איך לבצע
TIF        = כמה זמן מותר לפקודה להמשיך לנסות
```

‏אבל במנוע קצר־טווח, ההפרדה הזו אפילו יותר עמוקה. יש לפחות שלושה שעונים:

```text
signal_lifetime
application_order_ttl
broker_or_venue_tif
```

‏לדוגמה:

```text
signal_lifetime       = 3.0 s
application_order_ttl = 350 ms
broker_tif            = DAY
```

‏זו אינה סתירה. ה־Broker רשאי להחזיק את הפקודה כ־`DAY`, אבל המנוע שלנו מחליט שאם לא קיבלנו את ההתנהגות הרצויה בתוך 350 מילישניות — אנחנו כבר לא רוצים אותה.

‏המסקנה:

> ‏`TIF` של הברוקר אינו תחליף ל־signal-aware expiry בתוך המנוע.

---

## ‏3.2 `DAY` — ברירת מחדל טכנית, לא החלטה אסטרטגית

‏`DAY` אומר שהפקודה תקפה לסשן המסחר הרלוונטי של אותו יום, אלא אם התמלאה או בוטלה קודם.

‏למסחר ידני זו ברירת מחדל טבעית בהרבה מקרים.

‏לרובוט שלנו היא מסוכנת אם מתייחסים אליה כאילו משמעותה:

```text
valid while my signal is valid
```

‏היא לא.

‏אם Signal חי 700 מילישניות והפקודה היא `DAY`, אז ללא ביטול אפליקטיבי היא יכולה להישאר עובדת הרבה אחרי שהסיבה המקורית לעסקה נעלמה.

### ‏מתי `DAY` כן שימושית לנו?

‏כאשר אנחנו רוצים Order רגילה שהמנוע עצמו מנהל לה TTL קצר, לדוגמה:

```text
place passive DAY limit
wait 250 ms
re-evaluate signal
cancel if stale
```

‏כאן `DAY` היא מעטפת תפעולית בלבד; ה־policy האמיתי נמצא אצלנו.

---

## ‏3.3 `GTC` — פקודה שחיה עד Fill או Cancel

‏`GTC` — ‏`Good-Til-Canceled` — ממשיכה לעבוד עד שהיא מתבצעת או מבוטלת, בכפוף לכללי הברוקר/בורסה ולחריגים כגון corporate actions.

‏זו תכונה מצוינת לאסטרטגיות שבהן הכוונה עצמה יכולה להישאר תקפה לאורך זמן.

‏אבל אצלנו, Signal של שניות יוצר כמעט את ההפך:

```text
very short information half-life
+
very long order lifetime
=
stale-order risk
```

‏לכן `GTC` אינה baseline טבעי ל־Entry קצר.

### ‏איפה בכל זאת אפשר לפגוש אותה?

- ‏Orders תפעוליות ארוכות שאינן קשורות ישירות ל־momentum signal.
- ‏מנגנוני הגנה מסוימים כאשר deliberately רוצים שהפקודה תשרוד session boundaries.
- ‏תרחישים עתידיים שבהם strategy אחרת חיה זמן רב.

‏אבל כל שימוש כזה צריך להיות מופרד לחלוטין מ־short-lived entry intent.

---

## ‏3.4 `GTD` — תאריך/שעה שהברוקר מנהל

‏`GTD` — ‏`Good-Til-Date/Time` — מאפשר להגדיר expiration time שבו פקודה שלא התמלאה אמורה להפסיק לעבוד.

‏זה נשמע כאילו זו בדיוק התשובה ל־Signal קצר, אבל צריך להיזהר.

‏אם אנחנו רוצים TTL של מאות מילישניות, מנגנון expiration ברמת Broker/UI אינו בהכרח הכלי הנכון או המדויק מספיק לכל use case.

‏`GTD` מתאים יותר כאשר רוצים לומר:

```text
this order is valid until a known clock time
```

‏למשל עד רגע מסוים בסשן.

‏לעומת זאת, אצלנו הרבה פעמים נכון יותר:

```text
submit
start local monotonic timer
observe fills and market state
cancel/reconcile when application TTL expires
```

‏כלומר `GTD` הוא capability חשוב, אבל אינו מחליף application-level lifetime.

---

## ‏3.5 `IOC` — בדיוק השאלה: מה ניתן לבצע עכשיו?

‏`IOC` — ‏`Immediate or Cancel` — אומר:

> ‏נסה לבצע מיד את מה שניתן; כל יתרה שלא התמלאה מיידית מתבטלת.

‏נניח:

```text
Ask:
40 @ 20.00
30 @ 20.01
200 @ 20.05
```

‏ואנחנו שולחים:

```text
BUY 100 LMT 20.01 IOC
```

‏אם המצב עדיין קיים כאשר הפקודה ניתנת לביצוע, אפשר לקבל:

```text
40 @ 20.00
30 @ 20.01
70 filled
30 canceled
```

‏החלק החשוב הוא לא רק המהירות.

‏הוא שה־remainder אינו נשאר מאחור כ־resting order.

---

## ‏3.6 למה `Marketable Limit + IOC` כל כך מעניין למנוע שלנו

‏השילוב נותן semantics מאוד נקיות:

```text
price bound
+
try now
+
accept partial fill
+
do not leave stale remainder
```

‏זו בדיוק בעיה שמנוע של שניות פוגש שוב ושוב.

‏לדוגמה:

```text
signal says BUY now
max economically acceptable price = 50.04
requested qty = 200
```

‏במקום:

```text
BUY 200 LMT 50.04 DAY
```

‏שעלולה להפוך אחרי partial fill לפקודה נחה, אפשר לחקור:

```text
BUY 200 LMT 50.04 IOC
```

‏ואז אחרי התוצאה:

```text
filled_qty = 73
remaining = 0 because remainder canceled
```

‏המנוע מחליט מחדש מה לעשות עם ה־127 שלא נכנסו — מתוך Market State חדש, ולא מפני שפקודה ישנה עדיין יושבת שם.

---

## ‏3.7 למה `IOC` עדיפה לפעמים על `DAY + cancel after 200ms`

‏שתי האפשרויות אינן זהות.

### ‏`DAY + client cancel`

```text
submit
order becomes working
wait local TTL
send cancel
wait for cancel acknowledgement
```

‏בחלון הזה Order יכולה:

- ‏להישאר נחה.
- ‏לקבל Fill מאוחר יותר.
- ‏להיכנס ל־Fill-vs-Cancel race.
- ‏להמשיך להיות חשופה לשוק עד שהביטול אכן אפקטיבי.

### ‏`IOC`

‏ה־intent הוא מראש:

```text
execute immediately if possible
cancel unfilled remainder immediately
```

‏אין צורך שהמנוע ינסה לייצר בעצמו semantics של immediate expiry בעזרת timer + cancel.

### ‏היתרון הרובוטי

‏אנחנו מעבירים חלק מה־state machine ל־Broker/Venue path ומקטינים את משך חיי ה־stale remainder.

‏אבל עדיין חייבים לקבל ולפרש את execution reports; `IOC` אינה פוטרת אותנו מ־partial-fill accounting.

---

## ‏3.8 `IOC` אינה אומרת `ALL OR NONE`

‏זו אחת הטעויות הנפוצות ביותר.

‏`IOC` אומרת:

```text
partial fill now = acceptable
remainder later = not acceptable
```

‏כלומר:

```text
requested = 100
available now = 37
result = 37 filled + 63 canceled
```

‏אם 37 מניות אינן Position שימושית מבחינת economics, צריך להגדיר זאת בנפרד.

‏`IOC` לבדה לא יודעת מהו `minimum useful fill` שלנו.

---

## ‏3.9 הסיכון של `IOC`: Partial Position שאולי לא רצינו

‏היתרון שלה הוא גם הסיכון שלה.

‏נניח שה־Strategy תוכננה סביב 500 מניות, אבל רק 41 זמינות בתוך cap:

```text
BUY 500 LMT X IOC
=> 41 filled
=> 459 canceled
```

‏עכשיו יש לנו Position של 41.

‏המנוע חייב להחליט מראש:

```text
accept_any_partial?
minimum_useful_fill?
scale_exit_to_actual_fill?
retry_remainder?
re-evaluate_signal_before_retry?
```

‏אסור שההחלטות האלה יוולדו אחרי האירוע.

---

## ‏3.10 `FOK` — כל הכמות עכשיו או כלום

‏`FOK` — ‏`Fill or Kill` — מקשיחה את הדרישה:

```text
full quantity
immediately
or
zero
```

‏בניגוד ל־`IOC`, partial fill אינו התוצאה הרצויה.

‏תיאור רעיוני:

```text
requested = 100
available immediately = 100
=> full fill
```

‏אבל:

```text
requested = 100
available immediately = 99
=> no fill / cancel
```

‏זה כלי חזק כאשר partial position היא בעיה אמיתית.

---

## ‏3.11 למה `FOK` לרוב פחות טבעית למומנטום שלנו

‏אצל מנוע שמנסה לתפוס Signal קצר, `FOK` יכולה להגדיל מאוד את no-fill rate.

‏אם 80% מהכמות זמינה עכשיו ועדיין יש Edge, `IOC` יכולה לקחת אותה.

‏`FOK` תוותר על הכול אם לא ניתן להשלים full size באופן מיידי.

‏לכן צריך לשאול:

> ‏האם Position חלקית באמת חסרת ערך, או שהיא פשוט פחות גדולה ממה שתכננו?

‏במקרה שלנו, ברוב עסקאות מניה קצרות, סביר יותר לבדוק `IOC + minimum useful fill policy` מאשר לדרוש full-size atomicity בכל מצב.

‏זו Recommendation למחקר, לא כלל מוחלט.

---

## ‏3.12 פרט קריטי ב־IBKR: `FOK` אינה כרגע כלי כללי למניות

> ‏אימות אחרון: `2026-10-27`.

‏בדף Order Types הנוכחי של IBKR, `Fill or Kill` מתועד עבור:

```text
Products: Options Only
Regions: US Products Only
Platforms: TWS, IBKR Desktop
Routing: Smart, Directed
```

‏לכן עבור מנוע המניות האמריקאיות שלנו אסור לתכנן ארכיטקטורה שמניחה ש־`FOK` היא capability כללית של stock orders ב־IBKR.

‏זו דוגמה מצוינת לעיקרון:

> ‏מושג קיים בעולם המסחר אינו אומר שה־Broker שלנו מאפשר אותו עבור המוצר שלנו.

---

## ‏3.13 `AON` — כל הכמות, אבל לא בהכרח עכשיו

‏`AON` — ‏`All or None` — פותרת בעיה אחרת מ־`FOK`.

‏הדרישה העקרונית היא:

```text
no partial fill
```

‏אבל הפקודה יכולה להמשיך לעבוד עד שהכמות המלאה זמינה, לפי Order Type ו־TIF.

‏כלומר:

```text
FOK = full size + immediate
AON = full size, but may wait
```

‏הבדל קטן בניסוח — הבדל עצום בהתנהגות.

---

## ‏3.14 למה `AON` מסוכנת במיוחד לסיגנל קצר

‏נניח שה־Signal היה חזק בזמן 0:

```text
BUY 500 AON LMT 20.00
```

‏אבל רק 300 מניות זמינות.

‏הפקודה אינה מתבצעת חלקית.

‏אחרי שתי שניות מופיעות 500 מניות — אבל ה־Signal כבר מת.

‏אם לא ניהלנו application TTL קצר, דווקא התכונה שנועדה להגן עלינו מ־partial fill עלולה לגרום ל־**stale full fill**.

‏לכן AON אצלנו דורשת לפחות:

```text
very explicit signal expiry
application cancel policy
reconciliation after cancel
```

---

## ‏3.15 פרט מתקדם ב־IBKR: `AON` יכולה להיות Broker-Simulated

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת `AON` עבור מניות, ETF, Options, Bonds ו־EFPs בארה״ב, דרך `SMART`, וב־`TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`.

‏אבל כאשר ה־primary exchange אינו תומך ב־AON באופן Native, IBKR יכולה **להחזיק את הפקודה ולדמות את ההתנהגות**.

‏למניות אמריקאיות, התיעוד הנוכחי אומר שבמצב simulated נדרש שה־NBBO יתאים ל־Limit ושגודל ה־NBBO יהיה לפחות:

```text
order size + 1000 shares
```

‏לפני ניסיון הביצוע.

‏לכן `AON` אינה רק "checkbox שמונע partial". היא יכולה לשנות:

- ‏מתי Order בכלל נעשית eligible.
- ‏איפה היא מוחזקת.
- ‏את fill probability.
- ‏את latency עד ניסיון Fill.

‏עבור מנוע קצר, זה caveat משמעותי מאוד.

---

## ‏3.16 `Minimum Quantity` — לא הכול או כלום, אלא רף מינימלי

‏`Minimum Quantity` הוא רעיון ביניים:

> ‏אל תבצע Fill קטן מדי; אני רוצה שלפחות כמות מסוימת תהיה זמינה.

‏הוא יכול להיות יותר גמיש מ־AON.

‏לדוגמה רעיונית:

```text
requested_qty = 500
min_qty = 200
```

‏המטרה אינה לדרוש בהכרח 500 בבת אחת, אלא למנוע Fill זעיר שאינו כלכלי.

‏אבל התמיכה תלויה Product/Venue/Broker path, ולכן אסור לבנות עליו בלי capability check.

‏ב־`TWS API` קיים שדה:

```text
minQty
```

‏וב־Order reference הוא מוגדר כזיהוי של minimum quantity order behavior.

---

## ‏3.17 `AON` מול `MinQty` — מה ההבדל הרעיוני למנוע

‏אפשר לחשוב כך:

```text
AON:
minimum acceptable immediate/full execution = total requested quantity
```

‏לעומת:

```text
MinQty:
minimum acceptable execution chunk < total requested quantity
```

‏אם כל Fill קטן מ־100 מניות אינו שווה לנו בגלל commissions/exit economics, אבל 100–500 כן שימושי — `MinQty` היא רעיון טבעי יותר מ־AON.

‏אם Position של 499 מתוך 500 אינה מקובלת מבחינה לוגית — AON/FOK מתאימות יותר רעיונית.

‏אצלנו בדרך כלל הבעיה היא **economic minimum**, לא atomic portfolio construction, ולכן חשוב למדוד לפני שבוחרים semantics קשיחה.

---

## ‏3.18 ארבע שאלות שונות שאסור לערבב

‏המשפחה הזו נראית דומה, אבל כל מנגנון עונה על שאלה אחרת:

| מנגנון | השאלה שהוא עונה עליה |
|---|---|
| `DAY/GTC/GTD` | ‏כמה זמן Order רשאית להישאר חיה? |
| `IOC` | ‏מה אפשר לבצע מיד, ואז לבטל remainder? |
| `FOK` | ‏האם אפשר לבצע את כל הכמות מיד? |
| `AON` | ‏האם אפשר להימנע מכל partial fill גם אם צריך להמתין? |
| `MinQty` | ‏מהו Fill קטן מדי מכדי שנרצה לקבל אותו? |

‏לכן אין משמעות לשאלה "איזו מהן הכי טובה" בלי להגדיר קודם את הבעיה.

---

## ‏3.19 החלטה רובוטית נכונה מתחילה ב־Fill Policy

‏לפני שבוחרים TIF, המנוע צריך לענות:

```text
Do we accept partial fills?
If yes, what is the minimum useful fill?
Do we accept waiting?
If yes, for how long?
Do we want unfilled remainder to rest?
Do we want a fresh re-evaluation after every attempt?
```

‏מכאן אפשר לתרגם:

```text
accept partial + now only
=> IOC candidate

full size + now only
=> FOK conceptually, if supported for product

full size + waiting allowed
=> AON conceptually

partial allowed + short local wait
=> DAY/GTD + application TTL candidate
```

‏זו דרך מקצועית יותר מאשר להתחיל מרשימת Order Types ולחפש למי "יש שם יפה".

---

## ‏3.20 `IOC` כ־Execution Primitive למנוע Event-Driven

‏במנוע Event-Driven, אפשר להתייחס ל־IOC כמו לשאילתת ביצוע עם כסף אמיתי:

```text
market state
→ compute economic cap
→ send IOC
→ receive fill result
→ update position
→ recompute signal and remaining edge
→ decide next action
```

‏המודל הזה מעניין במיוחד כי כל ניסיון קצר ומוגדר.

‏אין resting remainder שצריך לזכור שעות; כל attempt מסתיים מהר יחסית ב־fill/partial/no-fill ואפשר לבצע re-evaluation.

‏אבל יש מחיר:

- ‏יותר order attempts.
- ‏יותר messages.
- ‏אפשרות ל־rejections/throttling/rate constraints.
- ‏סיכון ל־overtrading אם loop לא מוגבל.
- ‏כל attempt עדיין צריך reconciliation.

‏לכן גם כאן צריך:

```text
max_attempts_per_signal
min_recheck_interval
max_total_filled_qty
hard_price_cap
signal_expiry
```

---

## ‏3.21 `IOC` אינה פותרת את בעיית Latency

‏אם Quote היה:

```text
Ask = 20.00
```

‏ואנחנו מחשבים:

```text
BUY IOC LMT 20.01
```

‏אבל עד שהפקודה מגיעה:

```text
Ask = 20.04
```

‏ה־IOC יכולה פשוט לחזור עם `0 fill`.

‏זה טוב מבחינת price protection, אבל הפסדנו את ההזדמנות.

‏לכן צריך למדוד בנפרד:

```text
IOC no-fill because cap too tight
IOC no-fill because market moved
IOC no-fill because visible size vanished
IOC partial because depth insufficient
IOC rejection because capability/rules
```

‏אחרת נאשים את Order Type במה שהוא בעצם latency או stale-data problem.

---

## ‏3.22 Entry ו־Exit שוב אינם סימטריים

### ‏Entry

‏`IOC` מתאימה מאוד למחקר כאשר:

```text
I want execution now
I accept partial
I reject stale remainder
I have a hard price cap
```

### ‏Normal Exit

‏גם כאן `IOC` יכולה להיות שימושית, אך partial exit משאיר Position פתוחה ולכן צריך immediate follow-up policy.

### ‏Emergency Exit

‏אם הסיכון העיקרי הוא להישאר בפוזיציה, TIF שמבטלת remainder עלולה להיות פחות מתאימה בלי retry/escalation מהיר.

‏כלומר:

> ‏אותה `IOC` שיפה ב־Entry יכולה להיות רק שלב ראשון ב־Exit ladder.

‏לדוגמה רעיונית:

```text
exit attempt 1: aggressive capped IOC
if partial and risk remains:
    recompute
    widen within emergency bounds
    retry
```

‏לא משאירים את זה ל־human intervention במקרה של מנוע אוטומטי.

---

## ‏3.23 מתי `DAY + application TTL` עדיפה דווקא על `IOC`

‏אם רוצים להיות Passive לזמן קצר ולתת לשוק להגיע אלינו, `IOC` אינה מתאימה — כי היא תנסה לבצע מיד ואז תיעלם.

‏למשל:

```text
join Bid
wait up to 300 ms
cancel if not filled
```

‏כאן אנחנו **רוצים resting time קצר**.

‏זה use case טבעי ל־:

```text
passive LIMIT + DAY
+
application-managed TTL
```

‏או מנגנון Broker אחר אם יוכח שהוא נותן semantics מתאימות יותר.

‏לכן:

```text
IOC = no waiting
short passive TTL = deliberate waiting
```

‏אלה שני Execution Modes שונים לחלוטין.

---

## ‏3.24 `GTC` ו־`GTD` ברובוט — סכנת Recovery

‏Order שחיה מעבר לחיי process המקומי דורשת תשומת לב מיוחדת.

‏נניח:

```text
local process crashes
order remains active at broker
process restarts
```

‏אם המנוע מניח שאין Orders כי הזיכרון המקומי ריק, הוא יכול לשלוח Order חדשה ולהכפיל exposure.

‏לכן לכל Order שיכולה לשרוד מעבר ל־session/process lifecycle צריך:

```text
startup reconciliation
open-order download
position reconciliation
ownership identification
unknown-order handling
```

‏זה חשוב במיוחד ל־GTC, אבל העיקרון חל על כל broker-resident order שחיה מעבר לחיבור המקומי.

---

## ‏3.25 `TIF` ו־Outside RTH אינם אותו דבר

‏פקודה יכולה להיות `DAY`, `GTC` וכו', ובנפרד יש כללים לגבי eligibility מחוץ לשעות המסחר הרגילות.

‏לכן המנוע לא ישמור רק:

```text
tif = DAY
```

‏אלא גם session policy מפורשת:

```text
regular_hours_only
allow_outside_rth
pre_market_policy
after_hours_policy
```

‏הסיבה היא שנזילות, spread, routing והתנהגות Order יכולים להשתנות דרמטית בין sessions.

‏במנוע קצר־טווח, session regime הוא חלק מה־execution model ולא feature קוסמטי.

---

## ‏3.26 `IBKR TWS API` — השדות הרלוונטיים

> ‏אימות אחרון: `2026-10-27`.

‏ב־Order object של `TWS API` קיימים בין היתר:

```text
tif
allOrNone
minQty
goodTillDate
goodAfterTime
```

‏כלומר הממשק התכנותי מאפשר לייצג את משפחת החלטות הזמן והכמות ברמת Order object.

‏עם זאת:

> ‏עצם קיום השדה ב־API אינו הוכחה שהשילוב הספציפי נתמך בכל Product/Venue/Route.

‏לכן ה־engine adapter צריך לטפל גם ב־capability discovery וב־broker rejection.

---

## ‏3.27 `Client Portal / Web API` — לא מניחים parity עם `TWS API`

‏בתיעוד ה־Web API הנוכחי, endpoints של Orders חושפים ערכי `tif` כגון `DAY`, ‏`IOC`, ‏`GTC` ועוד לפי endpoint/context, ו־contract rules יכולים להחזיר `tifTypes` נתמכים.

‏זו נקודה ארכיטקטונית חשובה:

```text
TWS API capability set
!= automatically
Web API capability set
```

‏אם בעתיד נבחר Broker Adapter דרך Web API, נבנה capability matrix נפרדת ולא נעתיק assumptions מ־TWS API.

---

## ‏3.28 מטריצת התאמה ראשונית למנוע שלנו

| מנגנון | התאמה ראשונית | למה | הסיכון העיקרי |
|---|---|---|---|
| `DAY` + TTL מקומי קצר | `High` ל־Passive modes | ‏מאפשר resting קצר בשליטת המנוע | ‏Cancel race / stale order אם ה־TTL נכשל |
| `GTC` | `Low` ל־Entry מומנטום | ‏חיים ארוכים מדי ביחס ל־Signal | ‏stale fills / recovery complexity |
| `GTD` | `Medium/Low` ל־core entry | ‏expiration מנוהל Broker | ‏לא תחליף ל־sub-second/second signal TTL |
| `IOC` | `High` למחקר אגרסיבי | ‏partial-now + cancel remainder | ‏partial position / no-fill |
| `FOK` | `Low` למניות שלנו | ‏full-now-or-zero | ‏ב־IBKR כרגע אינו stock baseline; no-fill גבוה |
| `AON` | `Low` לרוב Signal קצר | ‏מונע partial fills | ‏waiting + broker simulation + stale fill risk |
| `MinQty` | `Challenger` | ‏מונע fills זעירים | ‏support semantics תלויות Venue/Product |

‏זו מטריצת Research, לא configuration סופית ל־Live.

---

## ‏3.29 Recommendation — מה הייתי מכניס לגרסה הראשונה של Execution Research

‏למנוע מניות קצר־טווח הייתי מתחיל משלוש משפחות ברורות:

```text
1. Passive Limit + short application TTL
2. Marketable Limit + IOC
3. Aggressive Limit + application-managed retry/exit policy
```

‏ואת הבאים משאיר כ־Challengers/Advanced עד Evidence:

```text
AON
MinQty
long-lived GTD/GTC behavior
```

‏`FOK` נשאר ידע מקצועי חשוב, אבל לפי support הנוכחי של IBKR אינו candidate בסיסי למנוע המניות שלנו.

‏הסיבה אינה פשטות לשמה. שלושת ה־baseline modes מכסים את שלוש השאלות המרכזיות שלנו:

```text
Can I get a better passive fill briefly?
Can I take what is available now without stale remainder?
Can I exit/retry under explicit price and risk bounds?
```

---

## ‏3.30 Telemetry שחייבים להוסיף עבור TIF/Fill Policy

‏בנוסף למדדים מחלק 2, נשמור:

```text
tif
application_ttl_ms
signal_ttl_ms
all_or_none
min_qty
attempt_number
immediate_fill_qty
canceled_remainder_qty
no_fill_reason
retry_reason
retry_delay_ms
order_terminal_reason
```

‏ומדדים נגזרים:

```text
IOC_fill_rate
IOC_partial_rate
IOC_zero_fill_rate
avg_IOC_fill_ratio
value_of_canceled_remainder
retry_conversion_rate
late_fill_after_cancel_request_rate
stale_fill_rate
partial_position_exit_cost
```

‏רק כך נדע אם IOC באמת עוזרת או פשוט מייצרת הרבה ניסיונות קטנים ורעש.

---

## ‏3.31 Practitioner Secrets — הדברים שקל לפספס

### ‏1. `IOC` היא Fill Policy בזמן, לא Price Policy

‏בלי Limit/price cap נכון, עצם ה־IOC לא מגינה על economics.

### ‏2. `IOC` יכולה לשפר state cleanliness

‏היתרון שלה אינו רק latency; היא מפחיתה resting remainder שממשיך לחיות אחרי attempt.

### ‏3. `FOK` ו־`AON` אינן מילים נרדפות

‏אחת דורשת full fill מיד; השנייה יכולה להמתין.

### ‏4. `AON` יכולה להיות Simulated

‏לכן fill behavior אינו בהכרח matching-engine primitive פשוט.

### ‏5. `GTC` מוסיפה Operational Risk

‏כל Order ששורדת process restart הופכת reconciliation לדרישת בטיחות בסיסית.

### ‏6. `DAY` יכולה להיות נכונה גם לסיגנל של 200ms

‏אם application TTL אמין, TIF ארוך יותר אינו אומר שהמנוע באמת מתכוון לחכות עד סוף היום.

### ‏7. `MinQty` עונה על שאלה כלכלית חשובה

‏לעיתים הבעיה אינה Partial Fill כשלעצמה אלא Fill קטן מדי מכדי להצדיק commissions, exit cost וניהול Position.

### ‏8. No-fill ב־IOC הוא מידע

‏הוא יכול להעיד על quote fade, latency, cap tightness או insufficient depth — ולכן צריך לסווג אותו, לא רק לספור אותו.

---

# ‏מקורות רשמיים לחלק 3

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — All or None: <https://www.interactivebrokers.com/en/trading/orders/aon_2.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR Web API — Contract rules / supported TIF: <https://www.interactivebrokers.com/docs/web-api/v1/endpoints/contract/find-all-info-and-rules-for-a-given-contract>
- ‏IBKR Web API — Modify Open Order: <https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/modify-open-order>

---

# ‏Checkpoint — סוף חלק 3

‏בחלק הזה הפרדנו בין שלוש שאלות שאסור לערבב: כמה זמן Order חיה, האם Partial Fill מקובל, והאם אנחנו דורשים ביצוע מיידי. ירדנו לעומק של `DAY`, ‏`GTC`, ‏`GTD`, ‏`IOC`, ‏`FOK`, ‏`AON` ו־`Minimum Quantity`, כולל ההבדלים בין Broker-managed expiry לבין application TTL.

‏המסקנה הראשונית למנוע שלנו היא ש־`Marketable Limit + IOC` היא Challenger מרכזית ל־aggressive entry קצר, בעוד Passive Entry דורשת דווקא resting time קצר שמנוהל באפליקציה. `AON/FOK` אינן ברירות מחדל למנוע המניות שלנו: הן פותרות בעיות אחרות ועלולות לפגוע ב־fill probability או להוסיף waiting/simulation behavior.

‏החלק הבא יהיה **Liquidity Control** — `Post Only`, ‏`Hidden`, ‏`Reserve/Iceberg`, ‏display size, ‏maker/taker, queue priority ו־order aging — ושם נרד לעומק בשאלה מתי כדאי לרובוט שלנו לספק נזילות, מתי אסור לו בטעות להפוך ל־taker, ומתי הסתרת גודל באמת מועילה.