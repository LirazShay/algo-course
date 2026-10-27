# ‏Taxonomy ו־Vocabulary קנוניים ל־`Advanced Order Mastery`

> ‏הפרק הזה הוא מילון המבנה של הקורס. כאשר פרק מאוחר משתמש במונח בצורה שנראית רחבה או עמומה יותר, ההגדרות כאן קובעות את שכבת ה־abstraction שאליה המונח שייך.

---

## ‏0A.1 למה צריך Taxonomy לפני שלומדים עוד שמות של פקודות

‏בעולם ה־Execution קל לקרוא לכל דבר `Order Type`, אבל `Limit`, ‏`IOC`, ‏`Post Only`, ‏`Bracket`, ‏`SMART`, ‏`Adaptive` ו־`PASSIVE_JOIN` אינם אובייקטים מאותו סוג.

‏אם מערבבים ביניהם, קשה להבין מה באמת בחרה האסטרטגיה, מה הברוקר קיבל, מה ה־Venue מנהל ומה המנוע שלנו עדיין חייב לנהל בעצמו.

‏לכן הקורס משתמש בשכבות הבאות:

```text
STRATEGY / TRADE INTENT
APPLICATION EXECUTION MODE
BEHAVIOR CANDIDATE
BROKER ORDER PRIMITIVE
TIME / FILL POLICY
DISPLAY / LIQUIDITY ATTRIBUTE
TRIGGER / DEPENDENCY / COMPOSITE STRUCTURE
ROUTING POLICY
BROKER ALGO
OWNERSHIP / IMPLEMENTATION DIMENSIONS
CAPABILITY / ENABLEMENT STATE
```

---

## ‏0A.2 `Strategy / Trade Intent`

‏זו השכבה שאומרת **מה אנחנו רוצים להשיג**, לא איך הברוקר יבצע זאת.

‏דוגמאות:

```text
enter long while signal is valid
exit current position quickly
reduce risk immediately
protect an open position if client process disappears
```

‏Intent אינה `Order Type`.

---

## ‏0A.3 `Application Execution Mode`

‏`Execution Mode` היא החלטה סמנטית של המערכת שלנו על **אופי הביצוע**.

‏היא אינה אמורה לערבב בתוכה שדות API ספציפיים.

‏ה־vocabulary הקנוני ברמת mode הוא:

```text
PASSIVE
PRICE_IMPROVING
MIDPOINT_SEEKING
BROKER_MANAGED
AGGRESSIVE_CAPPED
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
```

‏Mode עונה על שאלות כמו:

```text
Do we intend to provide or take liquidity?
How much price improvement are we seeking?
How urgent is the fill?
How much execution control are we delegating?
Is the purpose entry, normal exit or emergency risk reduction?
```

---

## ‏0A.4 `Behavior Candidate`

‏`Behavior Candidate` היא implementation strategy קונקרטית יותר שה־Decision Engine יכולה להשוות, אך היא עדיין אינה בהכרח Broker Order יחידה.

‏לדוגמה, ב־Entry:

```text
PASSIVE_JOIN
PASSIVE_POST_ONLY
IMPROVE_ONE_TICK
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
ADAPTIVE_LIMIT_URGENT
ADAPTIVE_LIMIT_NORMAL
MARKETABLE_LIMIT_IOC
```

‏השמות האלה נשמרים משום שהם שימושיים למחקר ולהשוואת outcomes, אבל הקורס לא יקרא להם "Order Types" בלי qualifier.

‏דוגמה:

```text
Execution Mode      = AGGRESSIVE_CAPPED
Behavior Candidate  = MARKETABLE_LIMIT_IOC
Concrete Broker Plan:
    orderType = LMT
    tif       = IOC
    route     = SMART
    limit     = hard economic price boundary
```

---

## ‏0A.5 `Broker Order Primitive`

‏זו הוראת הבסיס שה־Broker/API מבינים כ־order semantics.

‏דוגמאות נפוצות בקורס:

```text
Market
Limit
Stop
Stop Limit
Trailing Stop
Trailing Stop Limit
MIT
LIT
Market-to-Limit
Relative / Pegged variants
Snap variants
```

‏השם והמימוש המדויקים תלויים Broker, Product, Route ו־API.

### ‏כלל קנוני: `Marketable Limit`

‏`Marketable Limit` אינה בהכרח primitive נפרדת.

‏המשמעות הקנונית בקורס היא:

```text
Limit order
whose current price allows immediate execution
against available contra liquidity
```

‏לכן:

```text
Broker primitive = Limit
Current marketability = marketable
```

‏אם מוסיפים `IOC`, ‏SMART ו־hard cap כחלק מה־policy שלנו, אפשר לקבל את ה־Behavior Candidate ‏`MARKETABLE_LIMIT_IOC`.

---

## ‏0A.6 `Time / Fill Policy`

‏השכבה הזו מגדירה כמה זמן הפקודה יכולה לחיות ואילו תנאי Fill היא מקבלת.

‏דוגמאות:

```text
DAY
GTC
GTD
IOC
FOK
AON
Minimum Quantity
```

‏`IOC` אינה Order Type מתחרה ב־`Limit`; אפשר למשל לשלוח `Limit + IOC`.

---

## ‏0A.7 `Display / Liquidity Attribute`

‏השכבה הזו משנה כיצד הפקודה מוצגת או איזה liquidity intent היא כופה.

‏דוגמאות:

```text
Post Only
Hidden
Display Size
Reserve / Iceberg
Discretionary amount
```

‏`Post Only` היא constraint על liquidity behavior, לא "Limit טובה יותר".

‏`Hidden` ו־`Reserve` עוסקות בעיקר בכמות/נראות.

‏`Discretionary` עוסקת ביכולת execution מעבר למחיר המוצג, ולכן אינה synonym של Hidden.

---

## ‏0A.8 `Trigger Policy`

‏Trigger עונה על השאלה:

```text
WHEN does another execution behavior become active?
```

‏צריך תמיד להפריד אותה מהשאלה:

```text
WHAT happens after activation?
```

‏לדוגמה:

```text
Stop Market -> trigger, then market-style execution
Stop Limit  -> trigger, then limit execution
MIT         -> opposite trigger direction, then market-style execution
LIT         -> opposite trigger direction, then limit execution
```

‏להשוואה המקצועית המלאה של trigger direction מול post-trigger execution ראו `06A` ו־`06B`.

---

## ‏0A.9 `Dependency / Composite Structure`

‏מבנים אלה מקשרים כמה Orders או הוראות זו לזו.

‏דוגמאות:

```text
Bracket
parent / child
OCA / OCO
Conditional Order
```

‏הם אינם primitive יחיד ואינם מבטיחים transaction אטומית.

‏כלל קנוני:

```text
coordination semantics
!=
transactional atomic guarantee
```

---

## ‏0A.10 `Routing Policy`

‏Routing עונה על השאלה **לאן מותר או רצוי לשלוח את הפקודה**.

‏דוגמאות:

```text
SMART
Direct Routing
specific destination / venue
```

‏`SMART` אינה Order Type.

‏אותו Broker primitive יכול לקבל semantics או capabilities שונות לפי route/destination.

---

## ‏0A.11 `Broker Algo`

‏Broker Algo מקבלת מן הלקוח intent וגבולות, ומנהלת חלק מה־execution policy אצל הברוקר.

‏דוגמאות בקורס:

```text
Adaptive
MidPrice
```

‏כלל קנוני:

```text
Broker Algo may optimize HOW
but our engine still owns WHETHER, limits, lifetime and risk.
```

‏כלומר delegated execution אינה delegated strategy.

---

## ‏0A.12 שלושה ממדים שאסור לערבב: Residency, Behavior Owner, Native Semantics

‏המונחים הבאים אינם synonyms:

```text
client-managed
broker-managed
broker-simulated
broker-resident
venue-native
```

‏נפריד שלוש שאלות:

### ‏א. איפה ה־state שיכול להמשיך לחיות?

```text
local client
broker
venue
```

### ‏ב. מי מעריך Trigger / Reprice / Algo rule?

```text
client
broker
venue
```

### ‏ג. האם ה־Venue עצמו מכיר את semantics?

```text
venue-native
or
simulated / synthesized upstream
```

‏לכן Order יכולה להיות:

```text
broker-resident
+
broker-simulated
```

‏באותו זמן.

‏ו־`broker-resident` משמש בקורס רק כאשר רוצים לומר שהוראה מסוימת יכולה להמשיך להתקיים ללא process המקומי; הוא אינו אומר אוטומטית שהפקודה Native בבורסה.

---

## ‏0A.13 Vocabulary קנוני של זמן

‏המילה `TTL` לבדה אינה מספיקה.

‏נשתמש ב־:

```text
signal_ttl
application_order_ttl
broker_tif
working_order_age
```

‏המשמעות:

- ‏`signal_ttl` — כמה זמן ה־Alpha/Intent עדיין תקפים.
- ‏`application_order_ttl` — כמה זמן המנוע שלנו מוכן להשאיר ניסיון execution מסוים חי.
- ‏`broker_tif` — מדיניות הזמן שהוגדרה אצל הברוקר/venue, כגון `DAY`, ‏`GTC`, ‏`IOC`.
- ‏`working_order_age` — כמה זמן Order חיה בפועל מאז שהפכה ל־working/relevant.

‏אף אחד מארבעת השעונים אינו תחליף לאחר.

---

## ‏0A.14 Vocabulary קנוני של מחיר

‏המושג האב הוא:

```text
Economic Price Boundary
```

‏וממנו נגזרים לפי lifecycle:

```text
entry_max_price
exit_min_price when applicable
emergency_price_boundary
broker_limit_price
```

‏`broker_limit_price` היא הוראה טכנית שנשלחת; היא אינה בהכרח זהה למודל הכלכלי שממנו נגזרה.

‏המונח `hard cap` יכול להישאר כקיצור מקומי כאשר ברור שמדובר בגבול מחיר כלכלי שאסור ל־execution לעבור.

---

## ‏0A.15 Vocabulary קנוני של Cancel

‏ה־invariant הוא:

```text
CANCEL_REQUESTED
!=
CANCEL_CONFIRMED
!=
NO_LONGER_EXECUTABLE
```

‏כל Order שאינה terminal לפי Broker evidence נשארת חלק מ־potential exposure.

‏פרקים מאוחרים יכולים ליישם את הכלל, אך אינם צריכים להמציא לו משמעות חדשה.

---

## ‏0A.16 Vocabulary קנוני של Partial Fill

‏`Partial Fill` מוגדרת פעם אחת:

```text
executed_qty > 0
and
remaining_qty > 0
```

‏אבל המשמעות התפעולית תלויה בהקשר:

```text
Part 2  -> economics and fill quality
Part 3  -> IOC/FOK semantics
Part 6  -> protection and parent/child consequences
Part 8  -> broker truth and lifecycle
Part 10 -> fresh decision for position + remaining intent
```

‏אין להתייחס ל־partial fill כתקלה אוטומטית או כהרשאה אוטומטית להשלים את היתרה.

---

## ‏0A.17 Capability אינה Boolean

‏הקורס אינו משתמש ב־:

```text
supported = true
```

‏כראיה שמותר להשתמש ב־feature ב־Production.

‏ה־enablement ladder הקנוני הוא:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

‏וצריך לצרף context כגון:

```text
product
contract
route / destination
API adapter
account / legal entity
session
```

‏`Capability Gate` רשאית להסיר Candidate; היא אינה בוחרת Candidate חלופית ואינה מעניקה אוטומטית הרשאה להיות אגרסיביים יותר.

---

## ‏0A.18 ארבעה Labels של Evidence ו־Policy

‏כדי לא לערבב תיעוד, החלטת מערכת והשערת מחקר, הקורס משתמש בארבעה labels:

> **`FACT`**  
> ‏טענה עובדתית שנועדה להיות מגובה בתיעוד מתאים. כאשר היא תלויה Broker/API/Venue או זמן, יש לציין context ותאריך אימות במקום שבו הדבר מהותי.

> **`ENGINE RULE`**  
> ‏החלטת תכנון מחייבת של המנוע שלנו. זו אינה טענה ש"כך השוק עובד", אלא policy שאנחנו בוחרים לאכוף.

> **`RESEARCH HYPOTHESIS`**  
> ‏השערה שצריכה להיבדק ב־Replay/Paper/Live-small או בניסוי אחר. היא אינה מוצגת כעובדה.

> **`ACCEPTANCE TEST REQUIRED`**  
> ‏נקודה שבה תיעוד בלבד אינו מספיק עבור Production, או שה־semantics תלויים adapter/product/route ולכן צריך למדוד התנהגות בפועל לפני enablement.

---

## ‏0A.19 דוגמה אחת שמחברת את כל השכבות

‏נניח שהמנוע רוצה Entry מהירה אך תחומה במחיר.

```text
Trade Intent:
    enter long while signal is still valid

Execution Mode:
    AGGRESSIVE_CAPPED

Behavior Candidate:
    MARKETABLE_LIMIT_IOC

Broker Order Primitive:
    LIMIT

Time / Fill Policy:
    IOC

Routing Policy:
    SMART

Economic Price Boundary:
    entry_max_price = 50.05

Concrete Broker Limit:
    50.05

Lifecycle owner:
    client manages intent lifetime and post-fill decision
```

‏כך אפשר לדבר על אותה פעולה בלי לקרוא לכל השכבות "Order Type".

---

## ‏0A.20 כלל קריאה לכל שאר הקורס

‏בכל פעם שמופיע כלי מתקדם, הקורא צריך להיות מסוגל למקם אותו לפחות בארבע שאלות:

```text
1. What layer is this concept in?
2. Who owns its behavior after submit?
3. What constraints remain owned by our engine?
4. What evidence is required before Production enablement?
```

‏אם אחת מארבע התשובות אינה ברורה, ההסבר עדיין אינו שלם.

---

## ‏0A.21 כלל `Define Once → Cross-reference → Extend`

‏כדי שהקורס לא יחזור שוב ושוב על אותם contracts, ארבעה נושאים מוגדרים כאן פעם אחת ומשם מורחבים רק כאשר למשפחה מסוימת יש consequence ייחודי:

| נושא קנוני | מקור ההגדרה | מה מותר לפרק משפחה להוסיף |
|---|---|---|
| clocks / TTL | `00A.13` | רק איך השעונים משפיעים על אותה family |
| Economic Price Boundary / hard cap | `00A.14` | רק materialization או failure ייחודיים |
| cancel / broker truth | `00A.15` + Part `08` | רק race/late-effect ייחודי |
| Partial Fill | `00A.16` | רק economics, protection או lifecycle ייחודיים |

‏כאשר אין consequence חדש, מפנים להגדרה הקנונית במקום להגדיר אותה מחדש.

‏`00C` משמש quick-reference beginner-first לאותם מונחים; הוא אינו מקור semantics חלופי.