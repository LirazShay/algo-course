# ‏חלק 1 — השפה המקצועית של פקודה

> ‏הגדרות ה־taxonomy וה־vocabulary הקנוניות של הקורס נמצאות ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`. חלק זה מלמד את המודל; כאשר מונח נראה רחב מדי, `00A` קובע את שכבת ה־abstraction המדויקת שלו.

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

‏ב־taxonomy הקנונית יש עוד שכבה באמצע שכדאי לזכור:

```text
Trade Intent
→ Application Execution Mode
→ Behavior Candidate
→ Concrete Broker Order
```

‏כך `PASSIVE` או `FAST_EXIT` אינן מתחרות בשם עם `Limit`, ‏`IOC`, ‏`SMART` או `Adaptive`; הן נמצאות בשכבות שונות.

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

> ‏`ENGINE RULE` — בקורס הזה `Marketable Limit` אינה Broker primitive נפרדת. היא `Limit` שמחירה marketable מול snapshot השוק הנוכחי. ‏`MARKETABLE_LIMIT_IOC` הוא Behavior Candidate קונקרטי יותר שמשלב Limit marketable עם `IOC`.

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

‏השמות המדויקים בקוד יכולים להיות שונים; העיקר הוא שהמשמעות תהיה מפורשת ושלא נכניס Primitive, Attribute, Routing ו־Application Mode לאותו enum.

---

# ‏1.4 איפה ה־state חי, מי מנהל אותו, ומה Native

‏ה־taxonomy הקנונית מפרידה שלושה צירים שקל לערבב ביניהם:

```text
WHERE STATE LIVES
WHO EVALUATES / REPRICES / TRIGGERS
WHERE THE FINAL INSTRUCTION IS NATIVE
```

‏לכן המונחים הבאים אינם synonyms.

## ‏`Venue-Native`

‏ה־Venue עצמו מכיר את סוג הפקודה או את התכונה שלה ומנהל אותה בתוך ה־matching infrastructure שלו.

‏לדוגמה עקרונית, אם Venue תומך בפקודה מסוימת Native, הברוקר שולח אליו הוראה שה־Venue יודע לנהל.

### ‏למה זה טוב?

- ‏פחות תלות בלוגיקה מקומית של ה־Broker עבור אותה semantics.
- ‏לעיתים reaction מהיר יותר לשינויי Market State.
- ‏הסמנטיקה יכולה להיות מוגדרת היטב על ידי ה־Venue.

### ‏מה הבעיה?

- ‏לא כל Venue תומך באותו דבר.
- ‏אותו שם מסחרי יכול להתנהג אחרת בין Venues.
- ‏Direct Routing עשוי להיות דרוש.

## ‏`Broker-Managed / Broker-Simulated`

‏הברוקר מחזיק או מפעיל חלק מהלוגיקה ומגיש/משנה Orders או triggers לפי semantics שהוא מספק.

‏`Broker-Simulated` מתאר **איך ההתנהגות מיושמת**; הוא אינו אומר בהכרח אם instruction היא או אינה resident אצל הברוקר לאורך זמן.

‏זה לא אומר שהפקודה "לא אמיתית". זה אומר שמי שמחזיק חלק מן ה־state machine או evaluation logic הוא הברוקר ולא בהכרח ה־Exchange.

### ‏למה זה חשוב לנו?

‏כאשר Signal חי רק שניות, צריך להבין:

```text
Where is the state?
Who evaluates or reprices it?
What market data drives it?
When does it reprice or trigger?
What happens during disconnects?
What happens outside supported sessions?
Can the behavior differ by destination?
```

## ‏`Broker-Resident`

‏זהו dimension נפרד: האם instruction יכולה להישאר חיה אצל הברוקר גם אם ה־process המקומי שלנו נעלם.

‏לכן ייתכן concept שהוא:

```text
broker-resident
+
broker-simulated
```

‏ואין להסיק מ־`resident` שהוא Venue-native.

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

> ‏לפני שמכניסים Advanced Order למנוע, צריך לדעת לפחות: **איפה ה־state חי, מי מנהל את ההתנהגות, ומה ממשיך לחיות אם ה־client נעלם**.

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

> ‏`ENGINE RULE` — `CANCEL_REQUESTED != CANCEL_CONFIRMED != TERMINAL_NON_EXECUTABLE`.

‏כלומר `cancel requested` אינו שווה ל־`cancel confirmed`, וגם `cancel confirmed` צריך להיות מפורש לפי ה־evidence וה־state model של ה־adapter; אסור להסיק רק מה־intent המקומי שאי אפשר יותר לקבל Fill.

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
terminal order evidence
executed quantity
remaining quantity
position quantity
```

‏זה אינו edge case תיאורטי. במנוע מהיר זו אחת מנקודות הכשל המרכזיות שצריך לתכנן לפני Live.

‏מכאן ואילך פרקים מאוחרים משתמשים ב־Cancel invariant הזה כהגדרה קנונית ואינם אמורים להגדיר מחדש מהו Cancel בכל פעם.

---

# ‏1.7 Partial Fill הוא מצב רגיל, לא תקלה

‏הגדרה קנונית:

```text
0 < cumulative_filled_qty < requested_qty
```

‏Partial Fill אינה Error ואינה "Order שלא הצליחה". היא Execution fact שמשנה את ה־Position, את ה־remaining intent ואת ה־risk.

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

‏הפרקים המאוחרים מרחיבים את אותה הגדרה לפי context במקום להגדיר תופעה חדשה:

```text
Part 2  -> economic meaning
Part 3  -> IOC/FOK fill semantics
Part 6  -> parent/child and protection consequences
Part 8  -> execution-state truth
Part 10 -> fresh decision after each partial fill
```

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

# ‏1.10 ארבעה שעונים שאסור לערבב

‏`TIF` הוא רק אחד מכמה clocks שונים.

‏ה־vocabulary הקנוני הוא:

```text
broker_tif
signal_ttl
application_order_ttl
working_order_age
```

### ‏`broker_tif`

‏כמה זמן Broker/Venue רשאים להשאיר את הפקודה חיה לפי הוראת הזמן שלה, למשל `DAY`, ‏`GTC` או `IOC`.

### ‏`signal_ttl`

‏כמה זמן ה־Trade Intent או Signal עדיין נחשבים תקפים מבחינת Strategy.

### ‏`application_order_ttl`

‏כמה זמן האפליקציה שלנו מוכנה להשאיר את ה־Order/attempt המסוים בחיים לפני cancel/re-decision.

### ‏`working_order_age`

‏כמה זמן ה־Order הקונקרטית כבר חיה ועובדת בפועל.

‏לדוגמה:

```text
broker_tif = DAY
signal_ttl = 1800 ms
application_order_ttl = 750 ms
working_order_age = 420 ms
```

‏אין סתירה: כל clock עונה על שאלה אחרת.

> ‏`ENGINE RULE` — כאשר הקורס אומר `TTL`, יש לציין איזה TTL. ‏`TTL` ללא qualifier אינה vocabulary קנונית.

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

‏אבל גם תשובה מלאה לשאלות האלה אומרת רק מה **מתועד או זמין**, לא בהכרח מה מותר למנוע שלנו ב־Production.

‏לכן הקורס משתמש ב־Capability/Enablement progression הקנונית:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

‏רק `PRODUCTION_ENABLED` היא הרשאה של המערכת להשתמש ב־capability ב־Production.

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
documented capability knowledge
+ runtime contract capability discovery
+ acceptance evidence
+ broker rejection handling
```

‏ולא:

```text
hard-code once and assume forever
```

‏זה חשוב במיוחד כאשר אנחנו סורקים אלפי מניות ורוצים שה־Execution Engine יהיה robust לשינויים במוצר, Venue או Broker configuration.

> ‏`ENGINE RULE` — Capability discovery מסננת מה אפשר לשקול; היא אינה בוחרת את Execution Behavior המנצחת ואינה הופכת feature אוטומטית ל־`PRODUCTION_ENABLED`.

---

# ‏1.13 עובדות `IBKR` שאומתו למסגרת הקורס

> ‏אימות אחרון: `2026-10-27`. אלה עובדות תיעוד כלליות של IBKR; לפני Live נבדוק גם את החשבון, המוצר וה־routing בפועל.

### ‏`FACT` — `TWS API` חושף Order Object עשיר

‏ה־API כולל בין היתר `orderType`, ‏`lmtPrice`, ‏`auxPrice`, ‏`tif`, ‏`displaySize`, ‏`allOrNone`, ‏parent relationships ושדות מתקדמים נוספים. כלומר ה־API אינו מוגבל ל־Market/Limit בסיסיות.

### ‏`FACT` — IBKR מפרידה בין פקודות דומות לפי Routing

‏לדוגמה, התיעוד הנוכחי של `Pegged-to-Midpoint` מציין שלפקודות מניות אמריקאיות נדרש Direct Routing, בעוד `MidPrice` מתועד כ־IBKR Algo עם `SMART` routing. לכן שני שמות שנשמעים דומים יכולים לעבור execution path שונה לגמרי.

### ‏`FACT` — לא כל Order Type מופיע בכל UI

‏לדוגמה, `Iceberg / Reserve` מתועד כיום כ־`TWS Only`, בעוד `MidPrice` מתועד ב־`TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`.

### ‏`FACT` — OCA אינה מבטיחה ביטול אטומי בבורסה

‏IBKR מציינת במפורש שאין הבטחה שבקשת Cancel/Modify של OCA תגיע ל־Exchange לפני Order שכבר מתבצעת. זה בדיוק סוג ה־race שמנוע מקומי חייב לדעת להתמודד איתו.

---

# ‏1.14 המשמעות הישירה למנוע שלנו

‏לפני שנדון בשמות המתקדמים, כבר אפשר לקבוע כמה עקרונות הנדסיים:

1. ‏ה־Strategy לא תשלח Broker Order ישירות; היא תיצור `Trade Intent`.
2. ‏שכבת Execution נפרדת תבחר `Application Execution Mode`, אחר כך Behavior Candidate, ורק לבסוף Concrete Broker Order.
3. ‏כל Order תחזיק `Economic Price Bound` מפורש כאשר הדבר מתאים; ה־broker limit price הוא materialization של הגבול, לא המושג עצמו.
4. ‏Partial Fill יהיה first-class execution state.
5. ‏Cancel יהיה תהליך אסינכרוני הנשען על evidence, לא Boolean.
6. ‏ה־Position יחושב מ־Fills בפועל, לא מ־requested quantity.
7. ‏Capability תיבדק לפי Contract/Route/Adapter/Session וגם לפי enablement state, לא רק לפי תיעוד סטטי.
8. ‏פקודה שלא מתאימה יותר ל־Signal תבוטל גם אם יש לה Queue Position טוב.
9. ‏לא נבחר Primitive, Attribute או Algo לפי השם המרשים ביותר; נבחר Behavior לפי הבעיה שהוא פותר ואז נממש אותו בשכבות הנכונות.
10. ‏כל Advanced Order שתיכנס למנוע תצטרך להראות שיפור ב־`net executable edge` או ב־safety/reliability הרלוונטיים, לא רק Fill Price יפה יותר.

---

# ‏1.15 שאלות מקצועיות שחייבות לקבל תשובה לפני Live

‏בסיום המיני־קורס נוכל לענות באופן מדויק על כל אחת מהשאלות הבאות:

- ‏מתי Limit שהיא marketable עדיפה על `Market`, ומתי לבחור Behavior של `MARKETABLE_LIMIT_IOC`?
- ‏מתי `IOC` עדיפה על Limit קצרה שאנחנו מבטלים בעצמנו?
- ‏מה ההבדל המעשי בין `IOC`, ‏`FOK`, ‏`AON` ו־Minimum Quantity?
- ‏מתי `Post Only` עוזרת ומתי היא גורמת לנו לפספס מומנטום?
- ‏האם Midpoint execution אמיתי מתאים לסיגנל שחי שניות?
- ‏מה ההבדל בין `MidPrice`, ‏`Pegged-to-Midpoint` ו־`Snap to Midpoint` ב־IBKR?
- ‏מתי כדאי להשתמש ב־`Reserve/Iceberg` גם אם הכמות שלנו אינה מוסדית?
- ‏מה `Hidden` עושה ל־queue ול־fill probability?
- ‏איזו התנהגות שומרת מחיר אבל לא משאירה stale remainder?
- ‏מתי כדאי לנהל repricing/chase בעצמנו ומתי לתת ל־Broker Algo לעשות זאת?
- ‏איך מתכננים Exit כאשר Entry התמלאה חלקית?
- ‏איך מונעים parent/child race ב־Bracket Orders?
- ‏מה קורה בזמן reconnect כאשר Order עדיין חיה אצל Broker?
- ‏איך המנוע יודע מה מתועד, מה זמין runtime ומה באמת `PRODUCTION_ENABLED` במניה/Route מסוימים?
- ‏איזה `Application Execution Mode` מתאים ל־Entry פסיבית, Entry אגרסיבית תחומה, `FAST_EXIT` או `EMERGENCY_REDUCE`, ואיזה Broker Order מממש אותו בפועל?

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

‏בשלב הזה בנינו את המודל שעליו כל שאר הפקודות יישבו: Order כ־Execution Contract וכ־State Machine, ההפרדה בין Trade Intent, ‏Application Execution Mode, ‏Behavior Candidate ו־Concrete Broker Order, ההבחנה בין Venue-native / broker-managed / broker-resident / client-managed, והמשמעות הקנונית של Fill, Cancel, Partial Fill, clocks ו־Capability Enablement.

‏החלק הבא ירד לעומק של **`Market`, ‏`Limit`, ‏marketable Limit, ‏Passive Limit ו־price bounds** — לא כהגדרות בסיסיות שכבר למדנו, אלא ברמת execution mechanics: מה קורה מול ה־Book, אילו failure modes יש, איך מודדים slippage ו־fill quality, ומה צריך להיות ה־baseline למנוע מומנטום שמנסה להיכנס ולצאת בתוך שניות.

---
