# ‏Advanced Order Mastery — פקודות מסחר וביצוע ברמה מקצועית

> ‏מיני־קורס עומק משלים ל־`04-ORDER-TYPES-FOR-PERSONAL-ALGO.md`.
>
> ‏התוצר הסופי של המיני־קורס הוא **הקובץ היחיד הזה**. בכל שלב נרחיב ונעדכן אותו עד שיהפוך למסמך ארוך, רציף וניתן להדפסה.
>
> ‏המיקוד המרכזי: `Short-Horizon Momentum` — כניסה ויציאה בשניות ועד בערך דקה כאשר ה־Edge עדיין חי. פקודות שרלוונטיות בעיקר ל־market making, institutional execution ארוך או order sizes גדולים מאוד יוסברו, אבל יקבלו פחות עומק אלא אם יש להן השלכה ממשית על המערכת שלנו.

---

## ‏סטטוס המסמך

- ‏מצב: `IN PROGRESS`.
- ‏שלב נוכחי: `6 — Stops, Trailing, Bracket, OCA/OCO and Conditional Orders`.
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

---

# ‏חלק 4 — Liquidity Control: ‏`Post Only`, ‏`Hidden`, ‏`Reserve/Iceberg` ו־Queue Behavior

## ‏4.1 השאלה האמיתית: האם אנחנו רוצים **לספק** נזילות או **לקחת** נזילות?

‏לפני `Post Only`, ‏`Hidden` או `Iceberg`, צריך להבין שהמנוע מקבל החלטה עמוקה יותר:

```text
Provide liquidity
or
Consume liquidity
```

‏בקנייה לדוגמה:

```text
join Bid / improve Bid
=> usually provide liquidity

cross to Ask
=> consume liquidity
```

‏זו אינה הבחנה אסתטית. היא משנה:

```text
fill probability
fill timing
spread paid/captured
queue exposure
adverse selection
fees/rebates
signal decay
```

‏למנוע שלנו, ש־Edge שלו קטן וחי שניות, כל אחד מהמרכיבים האלה יכול להיות גדול יותר מהרווח שאנחנו מנסים להשיג.

---

## ‏4.2 `Maker` ו־`Taker` הם תיאור של הביצוע, לא זהות קבועה של Order

‏קל לחשוב:

```text
Limit = maker
Market = taker
```

‏אבל זה פשטני מדי.

‏`Limit` שחוצה את ה־Ask יכולה לקחת נזילות. `Limit` שנחה ב־Bid יכולה לספק נזילות. אותה פקודה יכולה אפילו להתחיל אגרסיבית, להתמלא חלקית, ואז remainder שלה יהפוך resting/passive.

‏לכן המנוע צריך לתעד בפועל:

```text
was_liquidity_added?
was_liquidity_removed?
venue
fee_or_rebate
```

‏ולא להסיק זאת רק מ־`order_type`.

---

## ‏4.3 מה `Post Only` מנסה להבטיח

‏`Post Only` היא בקשה בסגנון:

> ‏אל תהפוך אותי ל־liquidity taker. אם הייתי מתבצע מיד נגד Order קיימת, טפל בי לפי כללי ה־Venue/Broker במקום לקחת אותה.

‏המטרה יכולה להיות:

- ‏להבטיח שנישאר Passive.
- ‏להימנע מתשלום spread/taker economics במצב שבו התכוונו לספק נזילות.
- ‏למנוע bug שבו price calculation שלנו חצה בטעות את השוק.
- ‏ליצור Execution Mode ברור: `PASSIVE_OR_NOTHING`.

‏זה שימוש רובוטי חשוב מאוד: `Post Only` יכולה להיות **guardrail**, לא רק פקודה למי שעושה Market Making.

---

## ‏4.4 למה `Post Only` מעניינת דווקא אותנו

‏נניח שהמנוע רוצה להצטרף ל־Bid:

```text
Bid = 20.00
Ask = 20.01
```

‏הוא מחשב:

```text
BUY LMT 20.00
```

‏אבל בין החישוב לשליחה ה־Ask יורד ל־20.00.

‏Limit רגילה יכולה להפוך marketable ולהתבצע מיד. אם הכוונה של ה־Mode הייתה "רק Passive", קיבלנו execution שונה ממה שתכננו.

‏`Post Only` יכולה, כאשר הנתיב תומך בסמנטיקה המתאימה, למנוע את המעבר השקט הזה מ־maker intent ל־taker execution.

‏מבחינת קוד זה מאפשר invariant שימושי:

```text
if execution_mode == PASSIVE_ONLY:
    never intentionally take displayed liquidity
```

---

## ‏4.5 אבל `Post Only` אינה אומרת "אני אקבל Fill טוב"

‏היא מגינה על **סוג הנזילות**, לא על איכות האסטרטגיה.

‏פקודת Post Only יכולה:

- ‏להידחות או לעבור התאמה לפי כללי Venue/Broker.
- ‏לא להתמלא בכלל.
- ‏להישאר בתור בזמן שהמחיר בורח.
- ‏להתמלא בדיוק כאשר הצד השני נהיה אגרסיבי נגדנו.
- ‏להפוך stale בזמן שה־Signal נחלש.

‏לכן:

```text
post_only_success != profitable_execution
```

‏היא רק אומרת שהצלחנו לשמור על passive intent.

---

## ‏4.6 `Post Only` וה־Venue Semantics

‏אין להניח ש־Post Only מתנהגת זהה בכל Destination.

‏כאשר Order הייתה חוצה את השוק, Venue מסוים יכול לדחות אותה; אחר יכול לבצע price-slide/reprice לפי כללים; Broker יכול להפעיל logic משלו; ובחלק מהנתיבים התכונה כלל לא זמינה.

‏לכן מנוע לא צריך לקודד:

```text
post_only = always rejected if marketable
```

‏אלא:

```text
post_only_behavior = capability_and_route_specific
```

‏ונדרש למדוד `reject/reprice/ack` בפועל.

---

## ‏4.7 `Queue Priority` — מחיר זהה אינו מעמד זהה

‏נניח:

```text
Bid = 50.00 x 10,000
```

‏ואנחנו מצטרפים עם 100 מניות.

‏גם אם המחיר שלנו הוא ה־Best Bid, אין משמעות לכך שאנחנו "ראשונים". במודל price-time נפוץ יש לפנינו כמות שקדמה לנו.

‏מכאן:

```text
best_price != best_queue_position
```

‏לרובוט צריך להיות מושג של:

```text
queue_ahead_estimate
order_age
executed_volume_at_level_since_join
level_size_change
```

‏גם אם Queue Position אמיתי אינו ידוע בדיוק.

---

## ‏4.8 למה Queue Position קשה למדידה

‏ה־Depth שאנחנו רואים אינו אמת מלאה על התור:

- ‏יש hidden/reserve liquidity.
- ‏Orders מתבטלות ומתווספות במהירות.
- ‏לא כל feed נותן אותה רמת פירוט.
- ‏Trades יכולים להגיע ממספר Venues.
- ‏ה־Router יכול לפצל את Order שלנו.
- ‏Priority rules משתנים בין Venues וסוגי Orders.

‏לכן לא נבנה מודל שאומר:

```text
queue_ahead = displayed_size_before_us
```

‏כאמת מוחלטת.

‏עדיף להתייחס אליו כ־estimate עם uncertainty.

---

## ‏4.9 `Order Aging` — לפעמים Order ישנה נהיית דווקא מסוכנת יותר

‏פקודה Passive שיושבת זמן רב צוברת שני דברים שונים:

```text
queue age
signal age
```

‏הראשון יכול להיות טוב — אולי התקדמנו בתור.

‏השני יכול להיות רע — ה־Signal שעליו התבססנו כבר התיישן.

‏לכן צריך להימנע מכלל פשטני:

> ‏"חיכינו כבר הרבה, חבל לבטל עכשיו."

‏זו יכולה להיות `sunk-cost` thinking.

‏השאלה הנכונה היא:

```text
If this order did not exist right now,
would we still want to place it at this price?
```

‏אם התשובה לא — Queue Position אינה סיבה להשאיר אותה.

---

## ‏4.10 Queue Toxicity — מתי Fill פסיבי הוא חדשות רעות

‏נניח שהצטרפנו ל־Bid והמניה עולה לאט. אנחנו לא מתמלאים.

‏פתאום מגיע pressure למטה וה־sell flow מתחיל לפגוע ב־Bid. דווקא עכשיו אנחנו מקבלים Fill.

‏זה מצב טיפוסי שבו Fill probability עולה **בדיוק כאשר quality של ה־fill יכולה לרדת**.

‏לכן חשוב למדוד:

```text
fill_probability
and
post_fill_markout
```

‏ביחד.

‏Passive mode עם fill rate גבוה אבל markout רע יכול להיות גרוע יותר מ־aggressive mode עם מחיר כניסה פחות יפה.

---

## ‏4.11 `Join` מול `Improve`

‏בקנייה אפשר לבחור בין:

```text
join existing bid
```

‏לבין:

```text
improve bid by one tick
```

‏`Improve` יכולה להביא אותנו לראש מחיר חדש ולמשוך מוכרים, אבל היא גם:

- ‏מוותרת על חלק מה־spread.
- ‏יוצרת price level חדש.
- ‏עלולה לחשוף urgency.
- ‏יכולה להזיז את ה־NBBO אם אנחנו באמת הטובים ביותר.
- ‏עדיין אינה מבטיחה Fill.

‏לכן עבורנו `improve_one_tick` צריך להיות Execution Mode נפרד ולא fallback אוטומטי בכל פעם שלא התמלאנו.

---

## ‏4.12 `Hidden Order` — להסתיר את כל הכמות המוצגת

‏`Hidden` מבקשת שה־Order לא תופיע ככמות גלויה ב־market depth, בכפוף ל־Venue/Broker semantics.

‏הסיבה הקלאסית היא להימנע מחשיפת Order גדולה שעלולה לגרום למשתתפים אחרים להגיב אליה.

‏זה שימוש חשוב למוסדיים או לכמויות גדולות יחסית לנזילות.

‏אבל עבורנו צריך לשאול קודם:

> ‏האם הכמות שלנו בכלל גדולה מספיק כדי ש־display footprint יהיה בעיה?

‏אם אנחנו שולחים כמות קטנה יחסית לעומק, הסתרת הכמות יכולה להוסיף מורכבות בלי לפתור בעיה אמיתית.

---

## ‏4.13 `Hidden` אינה "בלתי נראית" במובן קסום

‏גם אם Order אינה מוצגת ב־book, היא עדיין יכולה להשפיע על execution ולהיחשף בעקיפין דרך fills והתנהגות שוק.

‏בנוסף, priority של hidden liquidity ותנאי eligibility יכולים להיות שונים לפי Venue.

‏לכן אין להניח:

```text
hidden = same fill probability as displayed + perfect secrecy
```

‏צריך לבדוק בפועל:

```text
hidden_fill_rate
hidden_time_to_fill
hidden_markout
hidden_vs_displayed_net_edge
```

---

## ‏4.14 פרט חשוב ב־IBKR: Hidden יכולה להיות Simulated

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שהיא תנסה לנתב Hidden Orders ל־Exchanges שתומכים בהן Native. אם אין Destination מתאים עם native support, היא עשויה לדמות Hidden Order בכך שהיא מחזיקה אותה אצלה ושולחת `IOC` לבורסה כאשר הפקודה נעשית marketable.

‏IBKR גם מזהירה שבמצב simulated execution יכול להתעכב או לא להתרחש, ושהטיפול הוא best-efforts.

‏למנוע שלנו זה משמעותי מאוד:

```text
Hidden native
!=
Hidden broker-simulated
```

‏אותו checkbox יכול להוביל ל־latency/fill path שונה.

---

## ‏4.15 `Reserve / Iceberg` — להציג חלק ולהסתיר את היתר

‏`Iceberg` או `Reserve` מאפשרת להחזיק Order כוללת גדולה יותר, אבל לפרסם לשוק רק `display size` קטן ממנה.

‏לדוגמה:

```text
total_qty   = 5000
display_qty = 200
```

‏לשוק מוצגת רק פרוסה, בעוד הכוונה הכוללת גדולה יותר.

‏המטרה:

- ‏להקטין מידע שאנחנו חושפים על גודל הכוונה.
- ‏להימנע מהצגת wall גדול.
- ‏לעבוד כמות גדולה בהדרגה.

‏זה כלי מקצועי מאוד — אבל הוא אינו אוטומטית שימושי למסחר קטן ומהיר.

---

## ‏4.16 איך `Display Size` עובד ב־IBKR

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת Iceberg/Reserve דרך שדה `Display Size`. בדוגמה הרשמית, Order של 5,000 מניות עם Display Size של 200 מציגה 200, ולאחר שהכמות המוצגת מתמלאת מוגשת פרוסה נוספת עד להשלמת הכמות הכוללת.

‏עוד פרט חשוב: IBKR מציינת שאם Order היא `Market` או אם Limit היא marketable, המערכת יכולה לשלוח עד הכמות הכוללת הזמינה ולהשתמש ב־`IOC` attribute במקום לעבוד כ־Iceberg פסיבית רגילה.

‏מכאן:

> ‏Iceberg אינה רק `total_qty` עם מספר קטן בשדה display; ההתנהגות תלויה גם בשאלה אם Order passive או marketable.

---

## ‏4.17 Replenishment ו־Queue Priority

‏כאשר displayed slice מתמלאת ופרוסה חדשה מופיעה, אסור להניח שהיא שומרת תמיד את אותה Priority כאילו כל הכמות הייתה גלויה מלכתחילה.

‏הכללים תלויים Venue וביישום Native/Simulated.

‏לכן במחקר שלנו צריך למדוד:

```text
slice_number
slice_submit_time
slice_fill_time
queue_delay_per_slice
```

‏ולא להתייחס ל־Iceberg כאל Order אחת הומוגנית מבחינת queue.

---

## ‏4.18 למה Iceberg בדרך כלל אינה Baseline טבעי עבורנו

‏אם ה־Position שלנו קטנה יחסית ל־displayed depth, אין הרבה מה להסתיר.

‏החסרונות האפשריים:

- ‏מורכבות execution נוספת.
- ‏replenishment latency/priority effects.
- ‏פחות שקיפות במחקר שלנו לגבי מה בדיוק היה working בכל רגע.
- ‏התנהגות שונה כאשר Order נעשית marketable.
- ‏capability תלויה Venue/Broker.

‏לכן `Reserve/Iceberg` היא מבחינתנו `Advanced Option`, לא baseline — אלא אם הנתונים יראו שהגודל שלנו באמת יוצר footprint או market impact.

---

## ‏4.19 מתי Iceberg כן יכולה להפוך לרלוונטית גם לרובוט אישי

‏לא צריך להיות מוסדי כדי שגודל יחסי יהיה גדול.

‏אם מניה דקה מאוד וב־Bid יש רק:

```text
300 shares displayed
```

‏ואנחנו רוצים 500, הכמות שלנו כבר משמעותית יחסית לרמה.

‏במצב כזה אפשר לחקור האם display קטן יותר:

- ‏מקטין signaling.
- ‏משפר markout.
- ‏מקטין תגובת שוק לכמות שלנו.

‏אבל אז עולה שאלה קודמת:

> ‏אם 500 מניות הן כבר גדולות ביחס לנזילות, האם בכלל נכון לבצע את העסקה במסגרת Edge קצר כל כך?

‏לפעמים התשובה המקצועית יותר היא `NO TRADE` או size קטן יותר, לא Order Type מתוחכם יותר.

---

## ‏4.20 `Hidden` מול `Iceberg`

| תכונה | `Hidden` | `Iceberg / Reserve` |
|---|---|---|
| כמות גלויה | ‏אפס, לפי semantics | ‏חלק מהכמות |
| מטרה | ‏להסתיר את קיום/גודל ה־Order | ‏להראות slice קטן בלבד |
| Fill behavior | ‏תלוי Venue/priority/simulation | ‏תלוי slices/replenishment |
| שימוש טיפוסי | ‏כמות גדולה/מידע רגיש | ‏כמות גדולה שרוצים לעבוד בהדרגה |
| התאמה ראשונית לנו | `Low/Challenger` | `Low/Advanced` |

‏אין כאן מנצח אוניברסלי. השאלה היא איזה מידע אנחנו מנסים לא לחשוף ומה המחיר בביצוע שאנחנו משלמים תמורת ההסתרה.

---

## ‏4.21 Maker/Taker Economics — לא לרדוף אחרי Rebate

‏ב־Venues מסוימים הוספת נזילות ולקיחת נזילות מקבלות fee/rebate economics שונים.

‏זה חשוב, אבל אצלנו אסור שהמנוע יהפוך ל־rebate strategy בלי שהתכוונו לכך.

‏אם חסכנו לדוגמה fee קטן אבל פספסנו מהלך של עשרות basis points, זו עסקה גרועה.

‏הסדר הנכון הוא:

```text
net executable edge
then execution quality
then fees/rebates as one component
```

‏לא:

```text
maximize maker rebate
```

---

## ‏4.22 `Post Only` כ־Safety Invariant ברובוט

‏יש שימוש שאני כן רואה כרלוונטי במיוחד למנוע שלנו:

```text
mode = PASSIVE_ONLY
=> require post-only capability when reliable
```

‏כלומר אם המנוע החליט שהעסקה כדאית **רק** אם אנחנו לא חוצים Spread, אז Post Only יכולה לאכוף את ההנחה ברמת Order path.

‏אם אין capability אמינה, המנוע צריך לפחות לבצע pre-submit check ולהתמודד עם race שבו השוק משתנה לפני arrival.

‏זו דוגמה שבה Order Type/attribute מתקדם אינו "טריק להשגת מחיר טוב" — אלא דרך להפוך החלטת Strategy ל־constraint תפעולי.

---

## ‏4.23 למה `Post Only` יכולה להיות מסוכנת למומנטום קצר

‏ב־Signal מהיר מאוד, refusal to take liquidity יכול להיות יקר.

‏תרחיש:

```text
signal edge = strong
spread = 1 tick
expected move = 12 ticks
```

‏אם Post Only גורמת לנו שוב ושוב להישאר מאחור, אנחנו "חוסכים" tick אחד ומפסידים 12.

‏לכן Post Only מתאימה יותר כאשר:

```text
passive fill economics are materially better
and
signal lifetime allows waiting
```

‏ופחות כאשר:

```text
missed-move cost >> spread cost
```

---

## ‏4.24 `IBKR ATS` — דוגמה מיוחדת ל־Liquidity Posting

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שה־ATS שלה זמין למניות ו־ETF אמריקאיים כ־Directed destination. Orders שמנותבות ל־IBKR ATS כדי להוסיף נזילות מתויגות אוטומטית כ־`not held` ומפורסמות ב־order book של IBKR ATS; הן יכולות להיפגש עם SmartRouted Orders שנעשות marketable נגדן.

‏בתיעוד `TWS API`, השדה `notHeld` מציין ש־Orders המנותבות ל־IBDARK מתויגות כ־`post only` ומוחזקות ב־IB order book.

‏זה מלמד אותנו שני דברים:

1. ‏`Post Only` יכולה להיות קשורה ל־Destination ספציפי ולא רק checkbox כללי.
2. ‏Routing ו־liquidity policy אינם נושאים נפרדים — הם חלק מאותה החלטת Execution.

‏נרד לזה עוד יותר בחלק Routing.

---

## ‏4.25 `TWS API` — ה־attributes הרלוונטיים

> ‏אימות אחרון: `2026-10-27`.

‏ב־`Order` object הנוכחי של `TWS API` קיימים בין היתר:

```text
displaySize
hidden
postOnly
notHeld
```

‏`displaySize` מוגדר ככמות שתיחשף לציבור.

‏`hidden` מסמן שה־Order לא תיראה ב־market depth; התיעוד של ה־API מציין במפורש שהשדה הזה חל על Orders שמנותבות ל־NASDAQ, ולכן שוב אסור להסיק availability כללית רק מכך שהשדה קיים באובייקט.

‏`postOnly` קיים כ־boolean ב־Order object, אך התיעוד הכללי אינו אומר שכל Contract/Route מקבל אותו.

‏מכאן הארכיטקטורה הנכונה:

```text
API field exists
+
contract/route capability
+
broker acceptance
+
observed live semantics
=
usable feature
```

---

## ‏4.26 `IBKR` — Hidden ו־Iceberg ב־UI

> ‏אימות אחרון: `2026-10-27`.

‏בדף Order Types הנוכחי של IBKR:

```text
Hidden:
Products: Stocks, ETFs, Options, Futures, FOPs, Bonds, Warrants
Platforms: TWS Only
Regions: US and Non-US Products
Routing: Smart, Directed
```

‏ו־Iceberg/Reserve מתועד כך:

```text
Products: Stocks, ETFs, Options, Futures, Warrants
Platforms: TWS Only
Regions: US and Non-US Products
Routing: Smart, Directed
```

‏לכן במסמך הסופי נסמן בנפרד:

```text
UI availability
vs
TWS API field availability
```

‏ולא נכתוב פשוט `IBKR supports Hidden = yes`.

---

## ‏4.27 Automation Modes שאני רוצה שנחקור

‏אחרי החלק הזה אפשר להגדיר כמה Modes חדשים למנוע:

### ‏`PASSIVE_DISPLAYED`

```text
join/improve displayed quote
short TTL
normal visible size
```

### ‏`PASSIVE_POST_ONLY`

```text
passive intent is mandatory
reject/reprice outcome is handled explicitly
```

### ‏`PASSIVE_HIDDEN`

```text
hide order when capability and economics justify it
```

### ‏`PASSIVE_RESERVE`

```text
large relative size
controlled display slice
```

### ‏`AGGRESSIVE_CAPPED`

```text
consume liquidity within economic cap
```

‏המנוע לא צריך לעבור אוטומטית בין המצבים. מעבר מ־Passive ל־Aggressive הוא **החלטה חדשה** שדורשת re-evaluation של Signal ו־Edge.

---

## ‏4.28 כלל חשוב: Passive Order חייבת `escape condition`

‏כל Passive Mode צריך לענות מראש:

```text
When do we give up?
```

‏לדוגמה:

```text
max_order_age_ms
max_signal_age_ms
max_queue_wait_ms
cancel_if_bid_weakens
cancel_if_ask_runs_away
cancel_if_expected_edge_below_threshold
cancel_if_market_data_stale
```

‏בלי escape condition, המנוע אינו "סבלני" — הוא פשוט נשאר עם Order ישנה.

---

## ‏4.29 Telemetry שחייבים להוסיף לחקר Liquidity

‏בנוסף למדדים הקודמים:

```text
liquidity_intent = add/remove
post_only_requested
post_only_outcome
hidden_requested
display_size
total_order_size
slice_number
queue_join_timestamp
price_level
visible_size_at_join
visible_size_ahead_estimate
executed_volume_at_level
cancel_replace_count
maker_taker_flag_if_available
venue_fee
venue_rebate
```

‏ומדדים נגזרים:

```text
passive_fill_rate
passive_time_to_fill
passive_markout_100ms
passive_markout_1s
passive_markout_5s
post_only_reject_rate
post_only_reprice_rate
hidden_vs_displayed_fill_delta
hidden_vs_displayed_markout_delta
iceberg_slice_fill_rate
queue_wait_cost
missed_move_after_passive_no_fill
net_edge_by_liquidity_mode
```

‏כך נוכל לדעת האם "הוספת נזילות" באמת מוסיפה לנו ערך או רק גורמת לנו לקבל fills רעילים.

---

## ‏4.30 מטריצת התאמה ראשונית למנוע שלנו

| כלי | התאמה ראשונית | מתי מועיל | הסיכון המרכזי |
|---|---|---|---|
| Passive displayed Limit | `High` כ־Challenger | ‏Spread חשוב ויש זמן קצר להמתין | ‏No-fill / adverse selection |
| `Post Only` | `High/Challenger` ל־Passive-only mode | ‏רוצים לאכוף שלא נהפוך ל־taker | ‏פספוס move / route semantics |
| `Hidden` | `Low/Challenger` | ‏גודל יחסי משמעותי ו־signaling הוא בעיה | ‏fill/priority/simulation uncertainty |
| `Reserve/Iceberg` | `Low/Advanced` | ‏Order גדול יחסית לעומק | ‏replenishment/priority/complexity |
| Improve Bid/Ask | `Medium` | ‏רוצים לקצר queue במחיר של tick | ‏מוותרים על spread וחושפים urgency |
| Aggressive capped | `High` ל־urgent mode | ‏Signal קצר וחזק | ‏spread/slippage |

‏זו עדיין מטריצת Research ולא החלטת Live.

---

## ‏4.31 Recommendation למנוע שלנו בשלב הזה

‏אני לא ממליץ להפוך `Hidden` או `Iceberg` לברירת מחדל רק מפני שהן מתקדמות ומעניינות.

‏כן הייתי מכניס מוקדם למחקר:

```text
A. Passive displayed Limit + short TTL
B. Passive Post-Only mode, כאשר capability מאומתת
C. Marketable Limit + IOC
```

‏ואז משווה לפי:

```text
net edge per signal
fill probability
fill latency
markout
missed opportunity
fees/rebates
exit feasibility
```

‏`Hidden` ו־`Reserve/Iceberg` יקודמו רק אם נראה שה־order size שלנו גדול יחסית לנזילות וש־display footprint פוגע בתוצאה.

---

## ‏4.32 Practitioner Secrets — הדברים שקל לפספס

### ‏1. `Post Only` היא Guardrail, לא Alpha

‏היא אוכפת passive intent; היא לא יוצרת Edge.

### ‏2. Queue Position בלי Signal תקף אינה נכס

‏אל תשאיר Order רעילה רק מפני שחיכית זמן רב בתור.

### ‏3. Fill Rate גבוה יכול להיות סימן רע

‏אם fills מגיעים בעיקר לפני תנועה נגדנו, יש adverse selection.

### ‏4. Hidden יכולה לשנות Execution Path

‏ב־IBKR היא עשויה להיות Native או simulated, ולכן latency/fill semantics יכולות להשתנות.

### ‏5. Iceberg אינה רק הסתרת מספר

‏Replenishment, priority ו־marketability משנים את ההתנהגות שלה.

### ‏6. Fee/Rebate הוא רק רכיב אחד

‏אין היגיון לחסוך fee קטן במחיר של missed move גדול.

### ‏7. `Improve by one tick` הוא Trade חדש

‏זו אינה "תחזוקה" של אותה החלטה; ויתרנו על מחיר כדי לקנות Priority טובה יותר.

### ‏8. Displayed Depth אינו כל הנזילות

‏Hidden/Reserve liquidity היא אחת הסיבות ש־visible queue estimate לעולם אינו אמת מוחלטת.

### ‏9. Passive-to-Aggressive transition חייב re-evaluation

‏אסור שהמנוע יתחיל Passive ואז יחצה Spread אוטומטית רק מפני שפג timer. לפני escalation מחשבים מחדש Edge, cap ו־signal validity.

---

# ‏מקורות רשמיים לחלק 4

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Hidden Order Handling using Simulated Hidden Orders: <https://www.interactivebrokers.com/en/trading/orders/hidden-order-handling-using-simulated.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — placing orders introduction: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>

---

# ‏Checkpoint — סוף חלק 4

‏בחלק הזה בנינו את שכבת ה־Liquidity Control: ההבדל בין maker/taker intent, למה `Post Only` יכולה לשמש guardrail רובוטי, איך Queue Position ו־Order Aging צריכים להימדד, ומה הסיכון של adverse selection דווקא ב־Passive fills. ירדנו גם לעומק של `Hidden` ו־`Reserve/Iceberg`, כולל העובדה שב־IBKR Hidden יכולה להיות broker-simulated וש־Iceberg דרך Display Size משנה את אופן חשיפת הכמות ועשויה להתנהג אחרת כאשר Order marketable.

‏המסקנה למנוע שלנו בשלב זה: **Passive displayed + TTL קצר, Post Only כאשר semantics מאומתות, ו־Marketable Limit + IOC הם שלושת מסלולי המחקר המרכזיים. Hidden/Iceberg נשארות Advanced עד שנוכיח שהגודל שלנו באמת יוצר footprint שמצדיק אותן.**

‏החלק הבא יהיה **Pegged, Relative, Midpoint ו־Snap families** — שם נרד לעומק בפקודות שהמחיר שלהן זז עם השוק, כולל ההבדלים בין `MidPrice`, ‏`Pegged-to-Midpoint`, ‏`Relative/Pegged-to-Primary`, ‏`Pegged-to-Market` ו־`Snap` ב־IBKR, ומה מהן באמת מתאים למנוע מומנטום של שניות.

---

# ‏חלק 5 — Pegged, Relative, Midpoint ו־Snap: פקודות שמזיזות את עצמן

## ‏5.1 למה המשפחה הזאת חשובה במיוחד לרובוט

‏ב־Limit רגילה המנוע בוחר מחיר. אם השוק זז, המנוע צריך לבחור האם להישאר, לבטל, להגיש מחדש, לשנות מחיר או לוותר על העסקה.

‏במשפחת `Pegged` אנחנו מוסרים חלק מהחלטת המחיר ל־Broker/Venue באמצעות כלל דינמי:

```text
reference price
+/- offset
bounded by hard cap
```

‏זה יכול להיות חזק במיוחד למנוע של שניות, כי הוא מצמצם `cancel/replace` מקומי ומאפשר לפקודה להתאים את עצמה לשוק מהר יותר מהלולאה שלנו.

‏אבל המחיר של האוטומציה הוא אובדן חלק מהשליטה. לכן כל כלי במשפחה נבחן אצלנו לפי חמש שאלות:

```text
What is the reference?
Does price move once or continuously?
Who performs the repricing?
What is the hard economic boundary?
What happens when the signal dies before the order does?
```

---

## ‏5.2 ארבע משפחות שנשמעות דומות אך פותרות בעיות שונות

‏צריך להפריד בין:

```text
Relative / Pegged-to-Primary
Pegged-to-Midpoint
MidPrice
Snap family
```

‏באופן רעיוני:

| משפחה | Reference | Repricing מתמשך? | מי מנהל | מטרה מרכזית |
|---|---|---:|---|---|
| `Relative/Pegged-to-Primary` | ‏הצד שלנו ב־NBBO | ‏כן | Broker/Venue | ‏להישאר liquidity provider אגרסיבי |
| `Pegged-to-Midpoint` | ‏אמצע ה־NBBO | ‏כן | Venue/Broker path | ‏לבקש midpoint price improvement |
| `MidPrice` | ‏midpoint-or-better | ‏כן, כחלק מ־IBKR algo/routing | IBKR | ‏SMART search ל־midpoint execution |
| `Snap` | ‏Bid/Ask/Midpoint ברגע ההגשה | ‏לא | IBKR computes once | ‏מחיר התחלתי חכם בלי continual chase |

‏אותו יעד כללי — מחיר חכם יותר — יכול להוביל ל־state machine שונה לחלוטין.

---

## ‏5.3 `Peg` היא נוסחת מחיר, לא מספר קבוע

‏נניח:

```text
Bid = 50.00
Ask = 50.04
```

‏Limit רגילה:

```text
BUY LMT 50.01
```

‏נשארת 50.01 עד שינוי מפורש.

‏Peg יכולה לומר רעיונית:

```text
BUY = NBB + 0.01
cap = 50.03
```

‏אם ה־NBB עולה ל־50.01, effective price יכולה לעלות ל־50.02. אם ה־NBB ממשיך לעלות, ה־cap אמור לעצור את האגרסיביות בנקודה שקבענו.

‏לכן ברמת המודל צריך לשמור בנפרד:

```text
reference
offset
hard_cap
current_effective_price
```

---

## ‏5.4 `Hard Cap` הוא לא תוספת — הוא תנאי בטיחות

‏Pegged Order ללא גבול כלכלי יכולה להפוך ל־automatic chase.

‏אצלנו ה־cap צריך להגיע מאותו מודל כלכלי של חלק 2:

```text
max_buy_price =
expected_exit
- required_net_edge
- expected_exit_cost
- fees
- safety_margin
```

‏ולא מתוך כלל כמו:

```text
keep following bid + 1 cent forever
```

‏ברובוט קצר־טווח, `offset` קובע **איך לנוע**; `cap` קובע **מתי אסור להמשיך לנוע**.

---

## ‏5.5 `Relative / Pegged-to-Primary` — Passive, אבל לא עצלנית

‏IBKR מתארת `Relative`, הידועה גם כ־`Pegged-to-Primary`, כפקודה שמנסה להיות אגרסיבית יותר מה־NBBO תוך כדי הוספת נזילות.

‏בקנייה הרעיון הוא בקירוב:

```text
NBB + offset
```

‏ובמכירה:

```text
NBO - offset
```

‏ה־offset מאפשר לנו לשפר את המחיר מול התור הקיים בלי לנהל כל שינוי Quote ידנית.

‏זה הופך אותה לרלוונטית מאוד לרובוט שלנו, משום שהיא קרובה לטקטיקה של "להיצמד למוביל" — אבל ה־repricing rule חי אצל Broker/Venue ולא רק אצלנו.

---

## ‏5.6 `Relative` מול Join רגיל

‏נניח:

```text
Bid = 20.00
Ask = 20.04
```

‏Join רגיל:

```text
BUY LMT 20.00
```

‏Relative עם offset של tick:

```text
BUY near NBB + 0.01
```

‏היתרון הפוטנציאלי הוא Queue Position טובה יותר דרך price improvement.

‏המחיר:

- ‏מוותרים על חלק מה־spread.
- ‏עלולים לחשוף urgency.
- ‏עלולים להעלות את ה־NBBO.
- ‏ה־order יכולה להמשיך לזוז גם כאשר ה־Signal שלנו כבר נחלש.

‏לכן `Relative` היא Execution Policy אקטיבית, לא פשוט "Limit יותר חכמה".

---

## ‏5.7 פרט קריטי ב־IBKR: `SMART Relative` אינה סימטרית

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת:

```text
Directed Relative:
floats both ways with the market
```

‏אבל ב־`SMART`:

```text
BUY:
NBB up   -> order can move up
NBB down -> no automatic downward adjustment

SELL:
NBO down -> order can move down
NBO up   -> no automatic upward adjustment
```

‏זו אינה הערת שוליים. היא משנה את הסיכון.

‏BUY SMART Relative שעלתה עם ה־Bid יכולה להישאר במחיר אגרסיבי יותר גם אחרי שה־Bid נסוג. לכן מנוע שמניח "הפקודה תמיד צמודה ל־Bid" יכול לטעות בדיוק ברגע שבו המומנטום נחלש.

---

## ‏5.8 למה הא־סימטריה הזו יכולה להיות שימושית — ומסוכנת

‏היתרון האפשרי: היא לא נסוגה מיד מכל ירידה קטנה ב־Bid ולכן אינה מאבדת אגרסיביות/מיקום בכל noise.

‏הסיכון: היא יכולה להשאיר אותנו קרובים מדי לצד הנגדי אחרי deterioration אמיתי.

‏לכן ב־SMART Relative צריך guardrail מקומי:

```text
if current_reference_deteriorates materially:
    re-evaluate edge
    cancel if old effective price is no longer justified
```

‏כלומר גם כאשר Broker מנהל repricing, המנוע שלנו עדיין מנהל **validity**.

---

## ‏5.9 Zero Offset אינו אומר "Order רגילה"

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־Relative עם `0` offset יכולה להיות מוצבת ב־best bid/ask ולהמשיך לנוע עם ה־inside quote בהתאם ל־route semantics.

‏לכן:

```text
Relative(offset=0)
!=
static Limit at current Bid/Ask
```

‏הראשונה היא dynamic price rule; השנייה היא מחיר קבוע.

‏זה distinction מצוין ל־A/B test אצלנו.

---

## ‏5.10 Percentage Offset ו־Tick Rounding

‏IBKR מאפשרת גם offset באחוזים בחלק מהקשרים, ואז היא צריכה לעגל את המחיר ל־tick חוקי.

‏למניות אמריקאיות מעל $1, שינוי קטן מאוד בחישוב יכול להיתרגם ל־tick שלם.

‏מכאן ש־Execution Engine חייב לדעת:

```text
requested theoretical peg price
actual allowed tick price
rounding direction
```

‏ולא להשוות Backtest theoretical price ל־Live price כאילו הם תמיד זהים.

---

## ‏5.11 `Relative` ו־Queue Priority

‏יתרון אפשרי מול client-side chase הוא שפחות פעולות `cancel/replace` נעשות אצלנו.

‏אבל אסור להסיק מכך שה־queue age נשמר תמיד כאשר effective price משתנה.

‏Priority היא Venue-specific.

‏לכן נשמור:

```text
reprice_count
price_level_count
time_at_current_level
fill_after_reprice
```

‏ונמדוד במקום להניח.

---

## ‏5.12 `Relative` מול Client-Side Chase

‏Client-side chase נראה כך:

```text
read quote
place limit
quote moves
cancel
reconcile
replace
repeat
```

‏הוא נותן לנו שליטה מלאה, אבל יוצר:

- ‏יותר messages.
- ‏יותר cancel/fill races.
- ‏יותר חלונות שבהם quote כבר השתנה לפני replacement.
- ‏אפשרות לאיבוד queue priority.
- ‏יותר קוד recovery.

‏`Relative` מעבירה חלק מהלולאה הזאת החוצה.

‏אבל מבחינתנו היא עדיפה רק אם:

```text
broker semantics
+
route behavior
+
cap
+
TTL
```

‏תואמים בדיוק את ה־Execution Intent שלנו.

---

## ‏5.13 Pegged Automation אינה Signal Automation

‏זו אחת הנקודות החשובות ביותר בחלק הזה:

```text
Broker knows quote movement.
Broker does not know our alpha died.
```

‏ה־Order יכולה לבצע repricing מושלם מול NBBO ובכל זאת להיות עסקה גרועה מפני שה־Signal שלנו התהפך.

‏לכן כל Pegged mode דורש:

```text
application_ttl
signal_decay_cancel
market_data_freshness_guard
hard_cap
position_guard
```

---

## ‏5.14 `Pegged-to-Midpoint` — לעקוב אחרי אמצע ה־NBBO

‏ה־midpoint הוא:

```text
mid = (NBB + NBO) / 2
```

‏אם:

```text
Bid = 50.00
Ask = 50.04
```

‏אז:

```text
Mid = 50.02
```

‏מבחינת BUY, Fill ב־50.02 במקום 50.04 חוסך חצי Spread מול לקיחת ה־Ask.

‏כאשר Edge צפוי קטן, שתי אגורות כאלה יכולות לשנות מהותית את `round-trip net edge`.

---

## ‏5.15 למה Midpoint הוא לא "Bid משופר"

‏Midpoint liquidity היא עולם ביצוע שונה.

‏ב־displayed Bid אנחנו נחים בספר הגלוי.

‏ב־midpoint אנחנו מחפשים contra liquidity שמוכנה להיפגש בתוך ה־spread, לעיתים במסגרת non-displayed execution.

‏לכן יכול להיות:

```text
excellent price improvement
but low fill probability
```

‏וזה בדיוק trade-off שמנוע של שניות חייב למדוד.

---

## ‏5.16 `Pegged-to-Midpoint` ב־IBKR — Routing משנה הכול

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת את `Pegged-to-Midpoint` עבור Stocks, ETFs ו־Options ב־`TWS` וב־`IBKR Desktop`.

‏לפקודות מניה אמריקאיות, IBKR דורשת **Direct Routing** כדי להשתמש בפקודה הזו.

‏היא אינה שקולה ל־:

```text
SMART + midpoint preference
```

‏וזו בדיוק הסיבה שצריך להבדיל בינה לבין `MidPrice`.

---

## ‏5.17 Offset ב־Pegged-to-Midpoint אינו Capability אחידה

‏IBKR מציינת שרוב ה־venues, כולל דוגמאות כגון NASDAQ/ISLAND, אינם מקבלים offset מה־midpoint בפקודה הרגילה הזו.

‏ללא offset יש להזין `0`/`0.0` ב־TWS.

‏לכן המנוע לא צריך לבנות Policy שתלויה ב־:

```text
midpoint + arbitrary offset
```

‏בלי לבדוק Destination capability אמיתי.

---

## ‏5.18 Price Cap ב־Pegged-to-Midpoint

‏גם כאן ניתן להגדיר Limit Price כ־cap.

‏זה מאפשר שילוב מקצועי:

```text
follow midpoint
but never exceed economic boundary
```

‏עבור BUY:

```text
midpoint may rise
order may follow
but cap stops further aggressiveness
```

‏כך ה־Peg מנהלת micro-pricing וה־engine שומר את economics.

---

## ‏5.19 למה Midpoint יכולה לפספס בדיוק את המניה הכי חזקה

‏במומנטום חזק, הצד השני לא חייב להסכים לתת לנו midpoint.

‏נניח שה־Ask כל הזמן נלקחת והמחיר מטפס. Order שמחכה באמצע ה־spread יכולה להישאר ללא Fill בזמן שהמהלך בורח.

‏לכן midpoint אינה "כניסה זולה יותר" בלבד. היא wager על כך שה־fill probability וה־price improvement יחד עדיפים על missed-move cost.

‏נמדוד:

```text
midpoint_fill_rate
midpoint_time_to_fill
price_improvement
missed_move_on_no_fill
markout_after_fill
```

---

## ‏5.20 `MidPrice` — דומה בשם, שונה בארכיטקטורה

‏`MidPrice` היא IBKR Smart-routed execution mechanism שנועד לנסות לקבל את midpoint של ה־NBBO או מחיר טוב יותר, עם Price Cap אופציונלי.

‏כלומר:

```text
Pegged-to-Midpoint = directed order behavior
MidPrice            = IBKR SMART routing/algo behavior
```

‏זה הבדל גדול מאוד עבור המנוע.

---

## ‏5.21 מה IBKR עושה בתוך `MidPrice`

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־MidPrice מנסה לנתב ל־exchange בעל הסתברות גבוהה למלא כ־`Pegged-to-Midpoint`; ב־IEX היא יכולה להשתמש ב־`D-Peg`. אם אין exchange מתאים, היא יכולה לנתב כ־native או simulated `Relative` order.

‏כלומר `MidPrice` איננה primitive אחד.

‏היא policy של Broker שיכולה לבחור execution path שונה לפי מצב השוק והיעדים הזמינים.

---

## ‏5.22 למה זה טוב לרובוט

‏במקום שהמנוע שלנו יצטרך לבחור בעצמו:

```text
which venue?
which midpoint primitive?
when to use relative fallback?
```

‏אפשר לתת ל־IBKR לנהל את החיפוש.

‏זה מקטין routing logic מקומי ויכול לפתוח גישה ל־midpoint opportunities במספר venues.

‏המחיר הוא פחות determinism:

```text
same logical order
may take different execution paths
```

‏ולכן Telemetry חייבת לשמור venue/fill behavior ולא רק `order_type = MidPrice`.

---

## ‏5.23 `MidPrice` מול `Pegged-to-Midpoint`

| מאפיין | `MidPrice` | `Pegged-to-Midpoint` |
|---|---|---|
| Routing | `SMART` | ‏Directed למניות US |
| מי בוחר destination | IBKR | ‏אנחנו/route שנבחר |
| מטרה | ‏midpoint-or-better | ‏peg ל־midpoint ביעד |
| Fallback behavior | ‏יכול להשתנות לפי IBKR | ‏תלוי Destination |
| Control | ‏נמוך יותר | ‏גבוה יותר |
| Operational complexity אצלנו | ‏נמוכה יותר | ‏גבוהה יותר |
| Determinism למחקר | ‏פחות | ‏יותר לפי route |

‏שניהם ראויים למחקר. הם פשוט עונים על שאלה אחרת.

---

## ‏5.24 מתי `MidPrice` יכולה להיות Candidate מצוינת

‏תרחיש טבעי:

```text
spread is meaningful
signal still has some life
we prefer midpoint improvement
but do not want to direct-route manually
```

‏במקרה כזה `MidPrice + hard cap + short application TTL` היא Challenger רצינית.

‏היא פחות מתאימה כאשר:

```text
signal is expiring now
and
missed-fill cost dominates half-spread savings
```

---

## ‏5.25 `Snap` — לחשב מחיר פעם אחת ואז להפסיק לרדוף

‏`Snap` נראית כמו Pegged בזמן יצירתה, אבל ההבדל הוא קריטי:

```text
Pegged:
reference moves -> order price keeps changing

Snap:
reference sampled -> initial limit calculated -> price stays fixed
```

‏עבורנו זה יכול להיות בדיוק האמצע בין:

```text
static manually-calculated limit
```

‏לבין:

```text
continual broker-managed chase
```

---

## ‏5.26 `Snap to Market`

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת:

```text
SELL price = Bid + offset
BUY price  = Ask - offset
```

‏זו פקודה למניות/ETF ועוד, זמינה ב־`TWS` וב־`IBKR Desktop`, עם `SMART` או Direct Routing במוצרי US המתאימים.

‏המחיר מחושב בזמן ההגשה ואינו ממשיך להיצמד לשוק.

---

## ‏5.27 `Snap to Midpoint`

> ‏אימות אחרון: `2026-10-27`.

‏המחיר הראשוני:

```text
SELL = midpoint + offset
BUY  = midpoint - offset
```

‏והוא נשאר Limit לאחר החישוב הראשוני.

‏זה מעניין במיוחד אצלנו כ־Candidate ל־:

```text
get a midpoint-derived initial price
without continual repricing
```

---

## ‏5.28 `Snap to Primary`

> ‏אימות אחרון: `2026-10-27`.

‏המחיר הראשוני:

```text
SELL = Ask - offset
BUY  = Bid + offset
```

‏כלומר הוא מתחיל מהצד שלנו ב־NBBO ומשפר אותו לפי offset, אבל אינו ממשיך לעקוב אחרי השוק.

‏ב־IBKR הוא מתועד ל־US products וב־Directed routing.

---

## ‏5.29 כל משפחת `Snap` היא Broker-Simulated ב־IBKR

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מציינת ש־`Snap to Market`, ‏`Snap to Midpoint` ו־`Snap to Primary` מדומות על כל ה־exchanges.

‏זה אומר שה־Broker מחשב ומנהל את ה־initial transformation.

‏לכן צריך למדוד:

```text
quote_at_submit
snap_reference
computed_limit
ack_time
actual_first_working_price
```

‏כדי להבין מה קרה באמת בין Decision ל־Working Order.

---

## ‏5.30 `Snap` מול `Pegged` — הבחירה החשובה

‏השאלה אינה "איזו יותר חכמה".

‏השאלה היא:

> ‏האם אנחנו רוצים שהמחיר ימשיך להגיב לשוק בלי התערבות שלנו?

‏אם כן — Pegged יכולה להתאים.

‏אם לא — Snap יכולה לתת מחיר התחלתי מבוסס שוק ואז לעצור.

‏ב־Signal שחי שניות, דווקא העצירה הזו יכולה להיות יתרון: אין auto-chase אחרי שה־Order נוצרה.

---

## ‏5.31 `Snap` עדיין יכולה להפוך ל־Stale Order

‏העובדה שהיא לא רודפת אחרי השוק אינה אומרת שהיא בטוחה להשאיר.

‏אם:

```text
snap price calculated at t0
signal dies at t0 + 300ms
order still rests at old price
```

‏אפשר לקבל stale fill.

‏לכן Snap צריכה בדרך כלל:

```text
short application TTL
signal-aware cancel
fill/cancel reconciliation
```

---

## ‏5.32 `IBKR ATS Pegged-to-Best`

> ‏אימות אחרון: `2026-10-27`.

‏`Pegged-to-Best` היא פקודה ייחודית ל־IBKR ATS עבור Stocks/ETFs אמריקאיים ב־Directed routing.

‏היא אינה מסתכלת רק על near-side NBBO. היא יכולה להתחרות גם מול same-side liquidity שמונחת בתוך IBKR ATS.

‏IBKR מתעדת שהמחיר יכול להיות one tick יותר אגרסיבי מהטוב מבין:

```text
near-side NBBO
or
best same-side resting ATS liquidity
```

‏עד מגבלה הקשורה ל־midpoint ול־offsets שהמשתמש מגדיר.

---

## ‏5.33 `Minimum Competing Size` — רעיון מקצועי חשוב

‏ב־Pegged-to-Best אפשר להגדיר כמות מצטברת מינימלית של same-side orders שמצדיקה תחרות במחיר טוב יותר.

‏זה פותר בעיה מעניינת:

> ‏לא לרדוף אחרי Order קטנה וזניחה רק מפני שהיא קפצה לפנינו.

‏ברובוט זו יכולה להיות הגנה מפני over-reaction ל־tiny displayed/ATS liquidity.

‏זה אינו baseline אצלנו כרגע, אבל העיקרון עשוי להיות שימושי גם במדיניות client-side עתידית.

---

## ‏5.34 `IBKR ATS Pegged-to-Midpoint`

‏IBKR מציעה גם גרסת ATS של Pegged-to-Midpoint עבור Stocks/ETFs אמריקאיים, עם Directed routing, ובפלטפורמות רחבות יותר כולל `TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`.

‏היא מאפשרת resting midpoint liquidity בתוך IBKR ATS ויכולה לכלול offsets לפי כללי ATS.

‏מבחינתנו זו Candidate מתקדמת רק לאחר שנבין אם IBKR ATS נותנת לנו fill quality עדיפה על SMART/venues אחרים.

---

## ‏5.35 `Pegged-to-Benchmark`

‏`Pegged-to-Benchmark` מזיזה את מחיר Order אחת לפי תנועת Contract אחר.

‏רעיון:

```text
primary order
tracks movement of
reference contract
```

‏IBKR מתעדת ששני ה־contracts צריכים להשתמש באותו מטבע, ושהפקודה יכולה להגיב לשינוי reference ביחס ל־starting reference price.

‏זו פקודה חשובה למי שעושה relative-value, hedging או pair logic.

‏ל־core momentum שלנו היא כרגע פחות טבעית, אבל אם בעתיד Signal יוגדר כ־:

```text
stock momentum relative to SPY
stock momentum relative to QQQ
stock momentum relative to sector ETF
```

‏היא יכולה להפוך רלוונטית הרבה יותר.

---

## ‏5.36 `Retail Price Improvement` כקרובת משפחה רעיונית

‏`RPI` אינה Peg רגילה, אבל ב־IBKR היא מתנהגת רעיונית כמו liquidity-adding order עם offset מול best bid/offer ו־limit cap, במסגרת תוכנית Retail Price Improvement של NASDAQ.

‏IBKR מתעדת אותה ל־US stocks/ETFs בתנאים הרלוונטיים, עם `SMART` routing, ול־NASDAQ-listed stocks בהקשר המתואר.

‏למנוע שלנו היא אינה Candidate ראשונה, אבל חשוב לדעת שהיא קיימת משום שהיא מחברת:

```text
relative pricing
+
hidden price improvement liquidity
+
venue/program-specific eligibility
```

---

## ‏5.37 מה פחות רלוונטי כרגע — אבל עדיין צריך להכיר

‏IBKR מחזיקה גם משפחות Pegged שמכוונות יותר ל־Options או multi-leg execution, כגון `Pegged-to-Stock` ו־`Relative + Market` בהקשרים מסוימים.

‏אותן נלמד ברמת זיהוי מקצועי, אבל לא נקדיש להן את אותו נפח כמו לפקודות שממש יכולות להיכנס למנוע המניות שלנו.

‏זה כלל העומק שלנו:

```text
relevant to US-stock short-horizon execution -> deep
adjacent but not actionable for our engine -> know it, do not overbuild around it
```

---

## ‏5.38 `API` — אסור לייצג את כל המשפחה במחרוזת אחת

‏ב־`TWS API`, ה־Order object מכיל `orderType`, ‏`lmtPrice` ושדות נוספים המשמשים Order families מתקדמות. `ContractDetails.orderTypes` ו־`validExchanges` מאפשרים לנו לבדוק capabilities של Contract.

‏מבחינת הארכיטקטורה, עדיף מודל כגון:

```text
PegPolicy {
  family
  reference
  offset
  cap
  route
  continuous_reprice
  application_ttl
  signal_expiry
}
```

‏ולא:

```text
orderType = PEG
```

‏כי `Relative SMART`, ‏`Relative Directed`, ‏`Pegged-to-Midpoint`, ‏`MidPrice` ו־`Snap` הן policies שונות לחלוטין.

---

## ‏5.39 למה Runtime Capability Discovery חשוב במיוחד כאן

‏משפחת Peg/Snap רגישה מאוד ל־:

```text
product
venue
route
region
platform
```

‏לכן נשתמש בשילוב:

```text
static verified matrix
+
ContractDetails.orderTypes
+
validExchanges
+
rejection handling
```

‏לא נניח שהעובדה ש־TWS מציגה Order Type מסוימת אומרת שכל מניה וכל destination יקבלו אותה דרך ה־API.

---

## ‏5.40 `Pegged` יכולה להפוך ל־Chase אוטומטי

‏זו אחת הסכנות המרכזיות.

‏אם:

```text
reference rises
peg follows
reference rises again
peg follows again
```

‏וה־cap רחב, יצרנו chase בלי לולאת chase מקומית.

‏לכן כל Pegged execution אצלנו תצטרך:

```text
hard_economic_cap
max_signal_age
max_effective_price_deviation
cancel_on_edge_decay
cancel_on_market_data_stale
```

‏אוטומציה במחיר אינה אישור אינסופי להמשיך לשלם יותר.

---

## ‏5.41 `Snap` פותרת חלק מהבעיה הזאת — אבל יוצרת אחרת

‏Snap אינה ממשיכה לרדוף.

‏לכן היא מגבילה auto-chase.

‏אבל המחיר שקפא יכול להפוך מיושן.

‏כלומר:

```text
Peg risk  = moving too far
Snap risk = staying too long at stale price
```

‏שניהם דורשים TTL; הסיבה שונה.

---

## ‏5.42 Midpoint Execution ו־Adverse Selection

‏גם Fill במידפוינט אינו אוטומטית "free half-spread".

‏צריך לבדוק markout לאחר Fill.

‏אם midpoint fills מגיעים בעיקר רגע לפני תנועה נגדנו, ה־price improvement יכול להיעלם מיד.

‏לכן:

```text
price improvement
without
post-fill markout
```

‏הוא מדד חלקי ומטעה.

---

## ‏5.43 Pegged Exit — האם זה בכלל מתאים?

‏ב־Entry אנחנו יכולים לקבל no-fill ולבחור `NO TRADE`.

‏ב־Exit יש Position קיימת.

‏לכן Pegged/Midpoint יכולה להתאים ל־normal exit כאשר:

```text
we still have time
position risk is controlled
spread savings matter
```

‏אבל ב־fast/emergency exit היא יכולה להיות איטית מדי.

‏מכאן ש־Execution Policy צריכה להפריד:

```text
ENTRY_PEGGED
NORMAL_EXIT_PEGGED
FAST_EXIT
EMERGENCY_EXIT
```

---

## ‏5.44 שילוב Pegged עם `IOC` אינו אוטומטי

‏Pegged Orders נועדו לעיתים לנוח ולהתעדכן.

‏`IOC` אומרת לא להשאיר remainder.

‏לכן צירוף כזה, כאשר בכלל נתמך, משנה מהותית את הרעיון.

‏אסור לייצר combinations על סמך שמות שדות בלבד. כל שילוב:

```text
order type
+
tif
+
route
+
attributes
```

‏צריך capability verification נפרד.

---

## ‏5.45 המבחן הנכון: `Broker-managed reprice` מול `Client-managed reprice`

‏אנחנו צריכים להשוות לא רק מחיר Fill אלא מערכת שלמה:

```text
fill_rate
first_fill_latency
full_fill_latency
reprice_count
cancel_replace_count
queue_outcome
price_improvement
adverse_selection
missed_move
broker_rejections
net_edge_per_signal
```

‏יכול להיות ש־Pegged מפחיתה latency ומעלה Fill Rate אבל מגדילה adverse selection.

‏יכול להיות ש־Client-side policy איטית יותר אבל מגיבה טוב יותר ל־Signal-specific information.

‏אין תשובה תיאורטית שתכריע בלי נתונים.

---

## ‏5.46 קבוצת ה־Challengers שהייתי מכניס למחקר מוקדם

‏אחרי חמשת החלקים הראשונים, יש לנו קבוצת ניסוי מעניינת:

```text
A. Passive displayed Limit + short TTL
B. Marketable Limit + IOC
C. Relative/Pegged-to-Primary + hard cap + short TTL
D. MidPrice + hard cap + short TTL
E. Snap to Midpoint + short TTL
F. Directed Pegged-to-Midpoint + hard cap + short TTL
```

‏לכל אחת יש תפקיד אחר:

```text
A = simple passive baseline
B = immediate capped aggression
C = continuously adaptive passive aggression
D = broker-managed midpoint search
E = midpoint-derived one-shot price
F = explicit directed midpoint peg
```

‏זה לא אומר שנשתמש בכולן ב־Live. המטרה היא לגלות איזה trade-off עובד בכל Market Regime.

---

## ‏5.47 מה הייתי משאיר כ־Advanced Challengers

```text
IBKR ATS Pegged-to-Best
IBKR ATS Pegged-to-Midpoint
RPI
Pegged-to-Benchmark
```

‏לא משום שהן פחות מקצועיות, אלא משום שהן מוסיפות destination/program/reference complexity שמוצדקת רק אם baseline המחקר מראה צורך.

---

## ‏5.48 איך המנוע יבחר Family בזמן אמת

‏לא לפי שם הפקודה, אלא לפי state:

```text
signal_strength
signal_age
expected_edge
spread_ticks
spread_bps
quote_velocity
visible_depth
max_wait_ms
liquidity_intent
position_state
route_capability
```

‏דוגמת מחקר:

```text
if urgency is extreme:
    marketable_limit_ioc
elif spread is wide and signal still has life:
    midpoint_family
elif passive intent and quote is moving:
    relative_primary
elif want market-derived initial price without chase:
    snap_family
else:
    simple_passive_limit
```

‏זו לא לוגיקת Production סופית; זו taxonomy נקייה לניסויים.

---

## ‏5.49 Telemetry ייעודית למשפחה

‏נוסיף:

```text
peg_family
peg_reference
offset_type
offset_value
hard_cap
route
destination
continuous_reprice
initial_effective_price
current_effective_price
reprice_count
reprice_up_count
reprice_down_count
midpoint_at_decision
midpoint_at_submit
midpoint_at_fill
price_improvement_vs_near_side
price_improvement_vs_mid
snap_reference
snap_fixed_price
broker_algo_name
```

‏ומדדים נגזרים:

```text
fill_rate_by_family
time_to_fill_by_family
reprice_to_fill_ratio
price_improvement_bps
missed_move_after_no_fill
markout_100ms
markout_500ms
markout_1s
markout_5s
net_edge_by_family
```

---

## ‏5.50 Failure Modes שחייבים לבדוק לפני Live

```text
unsupported route
order rejected because destination does not support type
offset invalid for venue
price rounded unexpectedly
cap reached and order stops following
SMART Relative remains high after bid falls
midpoint moves beyond economic value
Snap price becomes stale
partial fill while peg continues
cancel crosses with fill
broker reconnect returns live pegged order
market data stale while order still reprices externally
```

‏כל אחד מהתרחישים האלה צריך להפוך בעתיד לבדיקת קבלה או סימולציית failure.

---

## ‏5.51 מטריצת התאמה ראשונית למנוע שלנו

| כלי | התאמה ראשונית | יתרון מרכזי | סיכון מרכזי |
|---|---|---|---|
| `Relative/Pegged-to-Primary` | `High/Challenger` | ‏repricing פסיבי אוטומטי | ‏SMART asymmetry / auto-chase |
| `Pegged-to-Midpoint` | `High/Challenger` | ‏midpoint price improvement | ‏Direct routing / no-fill |
| `MidPrice` | `High/Challenger` | ‏SMART midpoint search | ‏execution path פחות deterministic |
| `Snap to Market` | `Medium/High` | ‏initial price מבוסס opposite side | ‏stale fixed limit |
| `Snap to Midpoint` | `High/Challenger` | ‏midpoint initial price בלי continual chase | ‏no-fill / stale order |
| `Snap to Primary` | `Medium/High` | ‏near-side improvement חד־פעמי | ‏Directed routing / stale price |
| `IBKR ATS Pegged-to-Best` | `Advanced Challenger` | ‏מתחרה גם מול ATS same-side liquidity | ‏ATS-specific complexity |
| `IBKR ATS Pegged-to-Midpoint` | `Advanced Challenger` | ‏midpoint בתוך IBKR ATS | ‏destination dependence |
| `Pegged-to-Benchmark` | `Low now / Future` | ‏relative-value execution | ‏לא תואם core signal כיום |
| `RPI` | `Advanced/Future` | ‏program-specific price improvement | ‏eligibility/program dependence |

---

## ‏5.52 Recommendation למנוע בשלב הזה

‏המשפחה הזו מספיק רלוונטית כדי שלא נסתפק ב־Marketable Limit ו־Passive Limit בלבד.

‏הייתי בונה ב־Research Harness תמיכה מפורשת לפחות ב־:

```text
RELATIVE_PRIMARY
MIDPRICE
SNAP_MID
PEGGED_MID_DIRECT
```

‏ומשווה אותם ל־:

```text
PASSIVE_LIMIT
MARKETABLE_LIMIT_IOC
```

‏אבל שום Peg לא מקבלת פטור מ־:

```text
hard cap
TTL
signal validity
fill reconciliation
runtime capability checks
```

---

## ‏5.53 Practitioner Secrets — הדברים שקל מאוד לפספס

### ‏1. `Pegged` אינה "Limit שמתעדכנת"

‏ה־reference, route והכיוון שבו המחיר רשאי לזוז הם חלק מה־Order semantics.

### ‏2. `SMART Relative` יכולה להיות חד־כיוונית

‏זה הבדל מהותי מ־Directed Relative.

### ‏3. `MidPrice` אינה פשוט `Pegged-to-Midpoint + SMART`

‏היא Broker Algo שיכול לבחור execution paths שונים.

### ‏4. `Snap` אינה Peg איטית

‏היא חישוב חד־פעמי של מחיר ואז Limit קבועה.

### ‏5. Midpoint Fill אינו בהכרח Fill איכותי

‏חצי Spread שנחסך יכול להימחק ב־adverse markout רגע לאחר הביצוע.

### ‏6. `Cap` אינו optional מבחינה כלכלית

‏גם אם ה־UI מאפשר להשאיר התנהגות רחבה יותר, המנוע צריך לדעת את worst acceptable economics שלו.

### ‏7. Routing הוא חלק מה־Order Type

‏במשפחה הזו במיוחד, `SMART` מול Directed יכול לשנות את ההתנהגות עצמה — לא רק את היעד.

### ‏8. Fewer cancels אינם אוטומטית better execution

‏Peg יכולה לחסוך message churn אבל עדיין להיות גרועה יותר מבחינת Fill quality.

### ‏9. Repricing חיצוני לא פוטר אותנו מ־Market Data Monitoring

‏גם אם IBKR/Venue מזיזים את המחיר, המנוע חייב לדעת מתי ה־Signal או ה־Edge כבר אינם תקפים.

### ‏10. ה־Order הכי "אוטומטית" אינה בהכרח הטובה ביותר לרובוט

‏לפעמים דווקא `Snap + TTL` נותנת state machine פשוטה וצפויה יותר מ־continual peg.

---

# ‏מקורות רשמיים לחלק 5

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Relative / Pegged-to-Primary בתוך Order Types and Algos: <https://investors.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Pegged-to-Midpoint בתוך Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php?menu=B>
- ‏IBKR — Snap to Market / Midpoint / Primary בתוך Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — MidPrice Order Type release/documentation: <https://www.interactivebrokers.com/en/general/tws-notes-975.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — `ContractDetails` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/contract-details>
- ‏IBKR API — Order Types introduction: <https://www.interactivebrokers.com/docs/general/order-types/introduction>

---

# ‏Checkpoint — סוף חלק 5

‏בחלק הזה הפרדנו בין ארבעה כלים שנראים במבט ראשון דומים אבל מעבירים אחריות שונה בין המנוע, IBKR וה־Venue: `Relative/Pegged-to-Primary`, ‏`Pegged-to-Midpoint`, ‏`MidPrice` ו־`Snap`.

‏למדנו שהשאלה המקצועית אינה רק "באיזה מחיר Order נמצאת עכשיו", אלא **מי רשאי לשנות אותו, לפי איזה reference, באיזה כיוון, עד איזה cap, ובאיזה route**. עבור מנוע של שניות זה משנה את latency, queue behavior, missed-fill risk, adverse selection ואת כמות ה־cancel/replace logic שאנחנו צריכים לכתוב בעצמנו.

‏ה־Challengers המרכזיים שנכנסים כעת למחקר הם `Relative/Pegged-to-Primary`, ‏`MidPrice`, ‏`Snap to Midpoint` ו־Directed `Pegged-to-Midpoint`, לצד baselines של Passive Limit ו־Marketable Limit + IOC.

‏החלק הבא יהיה **חלק 6 — Stops, Trailing, Bracket, OCA/OCO ו־Conditional Orders**. שם `Bracket` תקבל טיפול עמוק במיוחד ברמת Production: parent/child lifecycle, partial fills, transmit sequencing, OCA races, orphan children, double exits, reconnect/recovery, broker-resident protection מול client-managed exits ו־Failure Matrix מלא — בלי לגרוע מהעומק של Stop, Stop-Limit, Trailing, Adjustable ו־Conditional Orders הרלוונטיות למנוע.

---

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