# ‏חלק 2 — Core Execution: ‏`Market`, ‏`Limit`, ‏marketable Limit ו־Passive Limit

> ‏ה־taxonomy הקנונית נמצאת ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`. בחלק הזה `Market` ו־`Limit` הם Broker Order Primitives; ‏marketable/passive מתארים את מצב הביצוע של ה־Limit ביחס לשוק; ו־`Application Execution Mode` נשאר שכבה נפרדת.

## ‏2.1 אותו Broker Order Primitive יכול להיות אגרסיבי או פסיבי

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

‏אותו `broker_order_primitive = LMT`, שלוש התנהגויות ביצוע שונות.

‏לכן מנוע מקצועי צריך לשמור בנפרד לפחות:

```text
broker_order_primitive
behavior_candidate
application_execution_mode
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
- ‏יש מצב `EMERGENCY_REDUCE` שבו price certainty משנית ל־position certainty.

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

> ‏`FACT` — אימות אחרון: `2026-10-27`.

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

## ‏2.8 Limit במצב `marketable` — אחד הכלים המרכזיים לרובוט קצר־טווח

> ‏`ENGINE RULE` — `Marketable Limit` אינה Broker Order Primitive נפרדת. זו `Limit` שמחירה, ביחס ל־snapshot הנוכחי, מאפשר execution מיידי מול הצד הנגדי.

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

‏ה־50.04 הוא ה־broker limit שמממש במקרה הזה את `Economic Price Bound`; הוא **אינו יעד תשלום**.

‏זה בדיוק מה שהופך את ההתנהגות הזו למעניינת אצלנו:

```text
try to execute now
but refuse execution beyond economic boundary
```

---

## ‏2.9 Marketability אינה קבועה ואינה מבטיחה Fill

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

> ‏Marketability היא state ביחס למצב השוק **ברגע מסוים**, לא תווית נצחית של הפקודה.

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

## ‏2.10 Limit marketable יכולה להפוך ל־Passive remainder

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

‏לכן בהמשך נלמד מדוע Behavior Candidate של:

```text
MARKETABLE_LIMIT_IOC
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

## ‏2.14 איך לבחור `Economic Price Bound` נכון ל־Limit אגרסיבית

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

‏ה־boundary צריך להיות קשור לכלכלה של העסקה.

‏מודל עקרוני:

```text
entry_max_price =
    expected_exit_price
  - required_net_edge
  - expected_exit_cost
  - commissions_and_fees
  - safety_margin
```

‏ובמכירה/יציאה אפשר להגדיר בהתאם `exit_min_price` כאשר יש bound כלכלי מתאים.

‏הנוסחה המדויקת תשתנה לפי המודל שלנו, אבל העיקרון הוא:

> ‏ה־Economic Price Bound הוא מושג ההחלטה; ה־broker limit price הוא הדרך הקונקרטית לממש אותו ב־Order מסוימת.

---

## ‏2.15 `Economic Price Bound` חייב להכיר גם Depth

‏נניח:

```text
Ask book:
100 @ 20.00
100 @ 20.01
100 @ 20.02
1000 @ 20.10
```

‏אם רוצים 250 מניות ו־entry bound הוא 20.02, יש displayed depth מספק לפי ה־snapshot.

‏אם רוצים 600 מניות, אין displayed depth מספק עד ה־bound.

‏מכאן שני דברים:

1. ‏הכמות היא חלק ממדיניות המחיר.
2. ‏גם אם ה־Top of Book נראה מצוין, full-size execution יכול להיות בלתי כלכלי.

‏לכן מנוע יכול לחשב לפני שליחה:

```text
visible_qty_within_bound
expected_vwap_within_bound
worst_visible_price_within_bound
requested_qty / visible_qty_within_bound
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

‏לכן `Application Execution Mode` צריך להיות פונקציה של מצב השוק ולא setting קבוע.

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
strict economic price bound
accept no-fill

Normal Exit:
price-capped but more aggressive

Emergency Exit:
prioritize reducing position risk
```

‏זו סיבה חשובה לא להשתמש באותו Execution Policy אוטומטית ל־Entry ול־Exit.

---

## ‏2.20 להפריד `Application Execution Mode` מ־`Behavior Candidate`

‏המנוע לא צריך לבחור ישירות "Order Type". הוא צריך קודם לבחור **אופי ביצוע**, ורק אחר כך Candidate קונקרטית שמממשת אותו.

‏ה־Modes הקנוניים הרלוונטיים כאן:

```text
PASSIVE
PRICE_IMPROVING
AGGRESSIVE_CAPPED
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
```

‏ומתחתיהם יכולים להופיע Behavior Candidates כגון:

```text
PASSIVE_JOIN
IMPROVE_ONE_TICK
MARKETABLE_LIMIT_IOC
```

‏לדוגמה:

```text
ApplicationExecutionMode = PASSIVE
BehaviorCandidate = PASSIVE_JOIN
ConcreteOrder:
  primitive = LMT
  tif = DAY
  application_order_ttl = short
```

‏או:

```text
ApplicationExecutionMode = AGGRESSIVE_CAPPED
BehaviorCandidate = MARKETABLE_LIMIT_IOC
ConcreteOrder:
  primitive = LMT
  tif = IOC
  limit_price = derived from Economic Price Bound
```

‏כך `PASSIVE_JOIN`, ‏`MARKETABLE_LIMIT_IOC` ו־`FAST_EXIT` אינם מתחרים באותו enum ואינם מתערבבים עם `LMT`/`IOC` עצמם.

---

## ‏2.21 למה רובוט מונחה תוכנה יכול לנצל `Limit` טוב יותר מאדם

‏אדם יכול להסתכל על הספר ולשנות מחיר ידנית, אבל תוכנה יכולה לבצע את התהליך באופן עקבי ומהיר:

```text
recompute economic price bound
recompute visible depth
recompute signal age
recompute expected edge
choose application execution mode
choose behavior candidate
materialize concrete order
submit
observe fills
cancel/re-evaluate
```

‏היתרון אינו "ללחוץ מהר" בלבד.

‏היתרון הוא שהמנוע יכול להשתמש באותה מדיניות בדיוק אלפי פעמים ולמדוד את התוצאה.

‏זה מאפשר לבצע ניסוי אמיתי בין Behaviors כגון:

```text
PASSIVE_JOIN
MARKETABLE_LIMIT_IOC
MIDPRICE
RELATIVE_PRIMARY
ADAPTIVE_LIMIT_URGENT
```

‏במקום לבחור לפי תחושת בטן.

---

## ‏2.22 מתי Automation הופכת למסוכנת

‏אותה מהירות יכולה להגדיל טעויות.

‏דוגמאות:

- ‏Quote stale גורם ל־bound לא נכון.
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
economic_price_bound
max_chase_steps
application_order_ttl
signal_ttl
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
price <= economic price bound
chase_count < max_chase_steps
signal_age < signal_ttl
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

‏לכן "להיצמד למוביל" אינה אסטרטגיית ביצוע מלאה. היא initial placement rule בתוך Behavior Candidate כגון `PASSIVE_JOIN`.

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

‏כדי ללמוד איזה Mode ו־Behavior עובדים, נשמור לפחות:

```text
signal_id
order_id
symbol
side
requested_qty
filled_qty
application_execution_mode
behavior_candidate
broker_order_primitive
tif
limit_price
reference_bid
reference_ask
reference_mid
visible_depth_within_bound
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

‏בלי הנתונים האלה לא נוכל לדעת אם `Pegged`, ‏`Bracket`, ‏`IOC`, ‏`Adaptive` או כל Advanced Order באמת שיפרו את המערכת.

---

## ‏2.27 מטריצת החלטה ראשונית לחלק 2

| מצב | Behavior/Primitive בסיסי למחקר | למה | הסיכון המרכזי |
|---|---|---|---|
| ‏Signal חזק וקצר, Spread סביר | marketable `Limit` עם bound כלכלי | ‏מהירות עם price protection | ‏bound רחב מדי או שוק שבורח לפני arrival |
| ‏Signal תקף אך urgency נמוכה יותר | Passive `Limit` | ‏ניסיון לחסוך spread | ‏no-fill / adverse selection |
| ‏נזילות דקה או volatility גבוהה | `Limit` שמרנית / `NO TRADE` | ‏מונע runaway price | ‏פספוס הזדמנות |
| ‏יציאה רגילה | Aggressive price-capped `Limit` | ‏איזון בין מהירות להגנת מחיר | ‏position נשאר אם bound צר מדי |
| ‏מצב חירום | `EMERGENCY_REDUCE` + materialization מתאים | ‏position risk קודם | ‏slippage גבוה |
| ‏Edge קטן מה־round-trip execution cost | `NO TRADE` | ‏אין עסקה כלכלית | ‏FOMO בלבד |

‏זו אינה טבלת Live סופית. היא baseline מחקרי שיקבל refinement אחרי `IOC`, ‏Pegged/Midpoint, routing ו־broker algos.

---

## ‏2.28 `IBKR` — מה מתועד כרגע עבור `Market` ו־`Limit`

> ‏`FACT` — אימות אחרון: `2026-10-27`, לפי התיעוד הרשמי של IBKR. לפני שימוש אמיתי צריך לבדוק גם account/product/route בפועל ולהעביר Capability דרך שלבי ה־enablement הקנוניים.

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

### ‏Limit במצב marketable

‏אין צורך ב־Order Type נפרד כדי לקבל את ההתנהגות הבסיסית. זו `Limit` שמחירה חוצה או פוגש את הצד הנגדי בזמן שהיא ניתנת לביצוע.

### ‏Price filters ו־Price Management

‏IBKR מתעדת pre-trade price/size filters, ויכולה לדחות, להגביל או price-cap Orders במצבים מסוימים. בנוסף קיים `Price Management Algo` attribute למקרים שבהם מחיר Limit רחוק מה־reference price המותר.

‏מבחינתנו:

> ‏גם אם המנוע חושב שה־bound חוקי וכלכלי, צריך לטפל ב־broker rejection/price-cap behavior כחלק מה־state machine.

---

## ‏2.29 ה־baseline ההנדסי הראשוני למנוע שלנו

‏לפני שבודקים Advanced Orders, baseline טוב למחקר הוא לא "תמיד Market" ולא "תמיד Bid".

‏שלושה Behavior Candidates בסיסיים:

```text
A. PASSIVE_JOIN
   -> Limit + short application_order_ttl

B. AGGRESSIVE_CAPPED via marketable Limit
   -> Limit with economically derived bound

C. MARKETABLE_LIMIT_IOC
   -> marketable Limit + IOC
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

### ‏2. Limit marketable יכולה להפוך ל־resting

‏אם השוק זז או אם נשאר remainder ואין `IOC`, ההתנהגות משתנה באמצע חיי אותה Order.

### ‏3. Fill טוב יכול להיות Fill רע

‏מחיר שנראה טוב בזמן ה־Fill יכול להיות סימן ל־adverse selection אם השוק מיד ממשיך נגדנו.

### ‏4. No-fill חייב להיכנס למחקר

‏התעלמות מהזדמנויות שפספסנו גורמת ל־Passive להיראות טוב מדי.

### ‏5. `Last` אינו executable price

‏אסטרטגיה שמודדת Alpha על Last אבל מבצעת על Bid/Ask יכולה לדמיין Edge שלא ניתן למימוש.

### ‏6. Chase בלי Economic Price Bound הוא Market בתחפושת

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

‏בחלק הזה עברנו מהגדרות בסיסיות ל־execution mechanics תוך שמירה על ה־taxonomy הקנונית: `Market` ו־`Limit` הם Broker Order Primitives; marketability/passivity הן states של הביצוע; `Economic Price Bound` הוא constraint של ההחלטה; ו־`Application Execution Mode` נפרד מ־Behavior Candidate ומ־Concrete Broker Order.

‏ה־baseline שנוצר הוא: **לא לבחור Order לפי שם, אלא לבחור Mode ו־Behavior לפי urgency, economic price bound, depth, signal lifetime, fill state ו־exit feasibility — ורק אחר כך לממש אותם ב־primitive/attributes מתאימים.**

‏החלק הבא יהיה `Time in Force` ופקודות מיידיות — `DAY`, ‏`GTC`, ‏`GTD`, ‏`IOC`, ‏`FOK`, ‏`AON` ו־Minimum Quantity — עם דגש עמוק על השאלה מתי אנחנו רוצים partial fill עכשיו, full fill עכשיו, או בכלל לא להשאיר remainder.

---