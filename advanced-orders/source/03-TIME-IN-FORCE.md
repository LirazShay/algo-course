# ‏חלק 3 — Time / Fill Policy ופקודות מיידיות

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, ‏`DAY/GTC/GTD/IOC/FOK` שייכים לשכבת Time / Fill Policy; ‏`AON` ו־`Minimum Quantity` הם Fill/Quantity constraints. הם אינם Broker Order Primitives מקבילים ל־`Market` או `Limit`.

## ‏3.1 `Time in Force` הוא חלק מהאלגוריתם, לא שדה מנהלתי

‏ה־`TIF` עונה על שאלה שונה מ־Broker Order Primitive:

```text
Broker Order Primitive = מהו מנגנון המחיר/ביצוע הבסיסי
TIF / Fill Policy      = כמה זמן ובאילו תנאי fill הפקודה רשאית לעבוד
```

‏במנוע קצר־טווח יש לפחות ארבעה clocks נפרדים:

```text
signal_ttl
application_order_ttl
broker_tif
working_order_age
```

‏לדוגמה:

```text
signal_ttl             = 3.0 s
application_order_ttl  = 350 ms
broker_tif             = DAY
working_order_age      = 120 ms
```

‏זו אינה סתירה. ה־Broker רשאי להחזיק את הפקודה כ־`DAY`, אבל המנוע שלנו מחליט שאם לא קיבלנו את ההתנהגות הרצויה בתוך 350 מילישניות — אנחנו כבר לא רוצים את attempt הזה.

> ‏`ENGINE RULE` — `broker_tif`, ‏`signal_ttl`, ‏`application_order_ttl` ו־`working_order_age` הם מושגים שונים. המילה `TTL` בלי qualifier אינה vocabulary קנונית.

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

‏כאשר אנחנו רוצים Order רגילה שהמנוע עצמו מנהל לה `application_order_ttl` קצר, לדוגמה:

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
very long broker_tif
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
this order is valid until a known broker-clock time
```

‏למשל עד רגע מסוים בסשן.

‏לעומת זאת, אצלנו הרבה פעמים נכון יותר:

```text
submit
start local monotonic timer
observe fills and market state
cancel/reconcile when application_order_ttl expires
```

‏כלומר `GTD` הוא capability חשוב, אבל אינו מחליף application-level lifetime.

---

## ‏3.5 `IOC` — בדיוק השאלה: מה ניתן לבצע עכשיו?

‏`IOC` — ‏`Immediate or Cancel` — היא Time / Fill Policy שאומרת:

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

‏החלק החשוב הוא לא רק המהירות. הוא שה־remainder אינו נשאר מאחור כ־resting order.

---

## ‏3.6 `MARKETABLE_LIMIT_IOC` — Behavior Candidate, לא Order Primitive חדש

‏השילוב נותן semantics מאוד נקיות:

```text
Limit primitive
+
marketable price at current snapshot
+
IOC time/fill policy
+
Economic Price Bound
```

‏ברמת המנוע נשתמש בשם Behavior Candidate:

```text
MARKETABLE_LIMIT_IOC
```

‏שמשמעותו:

```text
price bound
+
try now
+
accept allowed partial fill
+
do not leave stale remainder
```

‏לדוגמה:

```text
signal says BUY now
entry_max_price = 50.04
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
wait application_order_ttl
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

‏אבל עדיין חייבים לקבל ולפרש execution reports; `IOC` אינה פוטרת אותנו מ־Partial Fill accounting.

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

‏נניח שה־Strategy תוכננה סביב 500 מניות, אבל רק 41 זמינות בתוך bound:

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

‏זו `RESEARCH HYPOTHESIS`, לא כלל מוחלט.

---

## ‏3.12 פרט קריטי ב־IBKR: `FOK` אינה כרגע כלי כללי למניות

> ‏`FACT` — אימות אחרון: `2026-10-27`.

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

## ‏3.13 `AON` — Fill/Quantity Constraint, לא `TIF`

‏`AON` — ‏`All or None` — פותרת בעיה אחרת מ־`FOK`.

‏הדרישה העקרונית היא:

```text
no partial fill
```

‏אבל הפקודה יכולה להמשיך לעבוד עד שהכמות המלאה זמינה, לפי ה־Broker Order Primitive וה־`broker_tif`.

‏כלומר:

```text
FOK = full size + immediate time/fill policy
AON = all-or-none quantity/fill constraint, waiting may still be allowed
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

‏אם לא ניהלנו `application_order_ttl` קצר, דווקא התכונה שנועדה להגן עלינו מ־Partial Fill עלולה לגרום ל־**stale full fill**.

‏לכן AON אצלנו דורשת לפחות:

```text
explicit signal_ttl
application_order_ttl
cancel policy
reconciliation after cancel
```

---

## ‏3.15 פרט מתקדם ב־IBKR: `AON` יכולה להיות Broker-Simulated

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏IBKR מתעדת `AON` עבור מניות, ETF, Options, Bonds ו־EFPs בארה״ב, דרך `SMART`, וב־`TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`.

‏אבל כאשר ה־primary exchange אינו תומך ב־AON באופן Native, IBKR יכולה **להחזיק את הפקודה ולדמות את ההתנהגות**.

‏למניות אמריקאיות, התיעוד הנוכחי אומר שבמצב simulated נדרש שה־NBBO יתאים ל־Limit ושגודל ה־NBBO יהיה לפחות:

```text
order size + 1000 shares
```

‏לפני ניסיון הביצוע.

‏לכן `AON` אינה רק "checkbox שמונע partial". היא יכולה לשנות:

- ‏מתי Order בכלל נעשית eligible.
- ‏איפה ה־state שלה מוחזק.
- ‏את fill probability.
- ‏את latency עד ניסיון Fill.

‏עבור מנוע קצר, זה caveat משמעותי מאוד.

---

## ‏3.16 `Minimum Quantity` — Fill/Quantity Constraint עם רף מינימלי

‏`Minimum Quantity` אומרת בקירוב:

> ‏אל תבצע Fill קטן מדי; אני רוצה שלפחות כמות מסוימת תהיה זמינה.

‏היא יכולה להיות יותר גמישה מ־AON.

‏לדוגמה רעיונית:

```text
requested_qty = 500
min_qty = 200
```

‏המטרה אינה לדרוש בהכרח 500 בבת אחת, אלא למנוע Fill זעיר שאינו כלכלי.

‏אבל התמיכה תלויה Product/Venue/Broker path, ולכן אסור לבנות עליה בלי capability check.

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
minimum acceptable execution = total requested quantity
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

## ‏3.18 ארבע שכבות שונות שאסור לערבב

| מנגנון | שכבה קנונית | השאלה שהוא עונה עליה |
|---|---|---|
| `DAY/GTC/GTD` | Time policy / `broker_tif` | ‏כמה זמן Order רשאית להישאר חיה? |
| `IOC` | Immediate time/fill policy | ‏מה אפשר לבצע מיד, ואז לבטל remainder? |
| `FOK` | Immediate full-fill policy | ‏האם אפשר לבצע את כל הכמות מיד? |
| `AON` | Fill/quantity constraint | ‏האם אפשר להימנע מכל Partial Fill גם אם צריך להמתין? |
| `MinQty` | Fill/quantity constraint | ‏מהו Fill קטן מדי מכדי שנרצה לקבל אותו? |

‏לכן אין משמעות לשאלה "איזו מהן הכי טובה" בלי להגדיר קודם את הבעיה ואת השכבה.

---

## ‏3.19 החלטה רובוטית נכונה מתחילה ב־Fill Policy

‏לפני שבוחרים materialization קונקרטי, המנוע צריך לענות:

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
=> IOC-compatible candidate

full size + now only
=> FOK conceptually, if supported for product

full size + waiting allowed
=> AON-compatible materialization

partial allowed + short local wait
=> DAY/GTD + application_order_ttl candidate
```

‏זו דרך מקצועית יותר מאשר להתחיל מרשימת Order Types ולחפש למי "יש שם יפה".

---

## ‏3.20 `IOC` כ־execution primitive-like behavior במנוע Event-Driven

‏ברמת המנוע נוח לחשוב על IOC כמו על attempt קצר וסגור:

```text
market state
→ compute Economic Price Bound
→ choose Behavior Candidate
→ materialize LMT + IOC
→ receive fill result
→ update position
→ recompute signal and remaining edge
→ decide next action
```

‏אבל מבחינת taxonomy, ‏`IOC` עדיין Time / Fill Policy — לא Broker Order Primitive.

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
Economic Price Bound
signal_ttl
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
IOC no-fill because bound too tight
IOC no-fill because market moved
IOC no-fill because visible size vanished
IOC partial because depth insufficient
IOC rejection because capability/rules
```

‏אחרת נאשים את ה־TIF במה שהוא בעצם latency או stale-data problem.

---

## ‏3.22 Entry ו־Exit שוב אינם סימטריים

### ‏Entry

‏Behavior עם `IOC` מתאימה מאוד למחקר כאשר:

```text
I want execution now
I accept partial
I reject stale remainder
I have a hard Economic Price Bound
```

### ‏Normal Exit

‏גם כאן `IOC` יכולה להיות שימושית, אך Partial Exit משאיר Position פתוחה ולכן צריך immediate follow-up policy.

### ‏Emergency Exit

‏אם הסיכון העיקרי הוא להישאר בפוזיציה, TIF שמבטלת remainder עלולה להיות פחות מתאימה בלי retry/escalation מהיר.

‏כלומר:

> ‏אותה `IOC` שיפה ב־Entry יכולה להיות רק materialization של attempt ראשון בתוך `FAST_EXIT` או `EMERGENCY_REDUCE`.

‏לדוגמה רעיונית:

```text
exit attempt 1: aggressive capped IOC
if partial and risk remains:
    recompute
    widen within emergency bounds
    retry
```

---

## ‏3.23 מתי `DAY + application_order_ttl` עדיפה דווקא על `IOC`

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
PASSIVE application mode
+
PASSIVE_JOIN behavior candidate
+
LMT primitive
+
DAY broker_tif
+
short application_order_ttl
```

‏לכן:

```text
IOC = no waiting
short passive TTL = deliberate waiting
```

‏אלה execution behaviors שונים לחלוטין.

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

‏זה חשוב במיוחד ל־GTC, אבל העיקרון חל על כל `broker-resident` Order שחיה מעבר לחיבור המקומי.

---

## ‏3.25 `TIF` ו־Outside RTH אינם אותו דבר

‏פקודה יכולה להיות `DAY`, `GTC` וכו', ובנפרד יש כללים לגבי eligibility מחוץ לשעות המסחר הרגילות.

‏לכן המנוע לא ישמור רק:

```text
broker_tif = DAY
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

> ‏`FACT` — אימות אחרון: `2026-10-27`.

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

> ‏עצם קיום השדה ב־API אינו הוכחה שהשילוב הספציפי נתמך בכל Product/Venue/Route ואינו מעביר אותו אוטומטית ל־`PRODUCTION_ENABLED`.

‏לכן ה־engine adapter צריך לטפל גם ב־capability discovery, acceptance evidence וב־broker rejection.

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

| מנגנון | שכבה | התאמה ראשונית | הסיכון העיקרי |
|---|---|---|---|
| `DAY` + `application_order_ttl` קצר | Time policy + local lifecycle | `High` ל־Passive | ‏Cancel race / stale order אם ה־TTL נכשל |
| `GTC` | Time policy | `Low` ל־Entry מומנטום | ‏stale fills / recovery complexity |
| `GTD` | Time policy | `Medium/Low` ל־core entry | ‏לא תחליף ל־sub-second/second signal TTL |
| `IOC` | Immediate time/fill policy | `High` למחקר אגרסיבי | ‏Partial Position / no-fill |
| `FOK` | Immediate full-fill policy | `Low` למניות שלנו | ‏ב־IBKR כרגע אינו stock baseline; no-fill גבוה |
| `AON` | Fill/quantity constraint | `Low` לרוב Signal קצר | ‏waiting + broker simulation + stale fill risk |
| `MinQty` | Fill/quantity constraint | `Challenger` | ‏support semantics תלויות Venue/Product |

‏זו מטריצת Research, לא configuration סופית ל־Live.

---

## ‏3.29 Recommendation — מה נכנס לגרסה הראשונה של Execution Research

‏למנוע מניות קצר־טווח אפשר להתחיל משלוש משפחות Behavior ברורות:

```text
1. PASSIVE_JOIN
   -> LMT + DAY + short application_order_ttl

2. MARKETABLE_LIMIT_IOC
   -> marketable LMT + IOC + Economic Price Bound

3. AGGRESSIVE_CAPPED attempt
   -> LMT + application-managed retry/exit policy
```

‏ואת הבאים להשאיר כ־Challengers/Advanced עד Evidence:

```text
AON
MinQty
long-lived GTD/GTC behavior
```

‏`FOK` נשאר ידע מקצועי חשוב, אבל לפי support הנוכחי של IBKR אינו candidate בסיסי למנוע המניות שלנו.

‏הסיבה אינה פשטות לשמה. שלושת ה־baseline behaviors מכסים את שלוש השאלות המרכזיות שלנו:

```text
Can I get a better passive fill briefly?
Can I take what is available now without stale remainder?
Can I exit/retry under explicit price and risk bounds?
```

---

## ‏3.30 Telemetry שחייבים להוסיף עבור Time / Fill Policy

‏בנוסף למדדים מחלק 2, נשמור:

```text
broker_tif
application_order_ttl_ms
signal_ttl_ms
working_order_age_ms
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

### ‏1. `IOC` היא Time / Fill Policy, לא Price Policy

‏בלי Limit/price bound נכון, עצם ה־IOC לא מגינה על economics.

### ‏2. `IOC` יכולה לשפר state cleanliness

‏היתרון שלה אינו רק latency; היא מפחיתה resting remainder שממשיך לחיות אחרי attempt.

### ‏3. `FOK` ו־`AON` אינן מילים נרדפות — ואינן אותה שכבה

‏`FOK` דורשת full fill מיד; `AON` היא quantity/fill constraint שיכולה לאפשר waiting לפי ה־TIF.

### ‏4. `AON` יכולה להיות Simulated

‏לכן fill behavior אינו בהכרח matching-engine primitive פשוט.

### ‏5. `GTC` מוסיפה Operational Risk

‏כל Order ששורדת process restart הופכת reconciliation לדרישת בטיחות בסיסית.

### ‏6. `DAY` יכולה להיות נכונה גם לסיגנל של 200ms

‏אם `application_order_ttl` אמין, TIF ארוך יותר אינו אומר שהמנוע באמת מתכוון לחכות עד סוף היום.

### ‏7. `MinQty` עונה על שאלה כלכלית חשובה

‏לעיתים הבעיה אינה Partial Fill כשלעצמה אלא Fill קטן מדי מכדי להצדיק commissions, exit cost וניהול Position.

### ‏8. No-fill ב־IOC הוא מידע

‏הוא יכול להעיד על quote fade, latency, bound tightness או insufficient depth — ולכן צריך לסווג אותו, לא רק לספור אותו.

---

# ‏מקורות רשמיים לחלק 3

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — All or None: <https://www.interactivebrokers.com/en/trading/orders/aon_2.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR Web API — Contract rules / supported TIF: <https://www.interactivebrokers.com/docs/web-api/v1/endpoints/contract/find-all-info-and-rules-for-a-given-contract>
- ‏IBKR Web API — Modify Open Order: <https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/modify-open-order>

---

# ‏Checkpoint — סוף חלק 3

‏בחלק הזה הפרדנו בין שכבות שאסור לערבב: `broker_tif`, ‏Fill/Quantity constraints, ‏`application_order_ttl`, ‏`signal_ttl` ו־`working_order_age`. ירדנו לעומק של `DAY`, ‏`GTC`, ‏`GTD`, ‏`IOC`, ‏`FOK`, ‏`AON` ו־`Minimum Quantity`, אבל בלי להציג אותן כאילו כולן Order Types מאותה קטגוריה.

‏המסקנה הראשונית למנוע שלנו היא ש־`MARKETABLE_LIMIT_IOC` היא Behavior Candidate מרכזית ל־aggressive entry קצר, בעוד Passive Entry דורשת דווקא resting time קצר שמנוהל באפליקציה. `AON/FOK` אינן ברירות מחדל למנוע המניות שלנו: הן פותרות בעיות אחרות ועלולות לפגוע ב־fill probability או להוסיף waiting/simulation behavior.

‏החלק הבא יהיה **Liquidity Control** — `Post Only`, ‏`Hidden`, ‏`Reserve/Iceberg`, ‏display size, ‏maker/taker, queue priority ו־order aging — ושם נרד לעומק בשאלה מתי כדאי לרובוט שלנו לספק נזילות, מתי אסור לו בטעות להפוך ל־taker, ומתי הסתרת גודל באמת מועילה.

---