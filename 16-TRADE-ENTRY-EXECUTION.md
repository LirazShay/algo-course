# ‏שלב 16 — כניסה לעסקה: להפוך החלטה ל־Fill בלי לאבד את ה־Edge

> ‏מטרת הפרק: להבין מה קורה מהרגע שבו הסורק החליט `TRADE` ועד שהפוזיציה באמת קיימת בחשבון. נלמד איך לבחור את אופן הכניסה, איך לקבוע מחיר, מתי לבטל, איך לטפל ב־Partial Fill, ואיך למדוד אם מנגנון הביצוע שיפר או הרס את היתרון שה־Scanner מצא.
>
> ‏העיקרון המרכזי: **Signal טוב אינו עסקה טובה אם הביצוע גרוע.** בין החלטת המסחר לבין ה־Fill יש שכבת Execution שלמה, והיא יכולה ליצור או למחוק את כל ה־Net Edge.

---

# ‏1. `Signal` אינו `Fill`

‏נניח שה־Scanner אומר:

```text
XYZ = Rank #1
Decision = TRADE
```

‏עדיין לא קנינו כלום.

‏יש עכשיו רצף נוסף:

```text
Signal
↓
Pre-Trade Recheck
↓
Order Intent
↓
Order Submit
↓
Broker Ack
↓
Exchange / Venue
↓
Partial Fill / Fill / No Fill
↓
Position
```

‏כל שלב לוקח זמן ויכול לשנות את התוצאה.

---

# ‏2. ארבעה מחירים שונים שחייבים להפריד

‏במערכת מקצועית לא שומרים רק `entry_price` אחד.

‏צריך להבדיל בין:

```text
signal_price
```

‏המחיר כאשר ה־Scanner החליט שהמניה מעניינת.

```text
decision_price
```

‏המחיר כאשר החלטנו בפועל לבצע.

```text
order_reference_price
```

‏המחיר שעל בסיסו בנינו את הפקודה.

```text
fill_price
```

‏המחיר שבו באמת קנינו.

‏הפערים ביניהם מספרים לנו איפה ה־Edge נעלם.

---

# ‏3. `Signal-to-Order Latency`

‏זה הזמן בין:

```text
TRADE decision
```

‏לבין:

```text
order sent
```

‏למשל:

```text
Decision:   12:00:00.000
Order sent: 12:00:00.180
```

‏אז:

```text
signal_to_order = 180ms
```

‏למסחר של שעות זה כמעט כלום.

‏למסחר של שניות זה יכול להיות משמעותי.

---

# ‏4. `Order-to-Fill Latency`

‏זה הזמן מהרגע שהפקודה נשלחה ועד שהתקבל Fill.

```text
Order sent: 12:00:00.180
Fill:       12:00:00.520
```

‏כלומר:

```text
order_to_fill = 340ms
```

‏נרצה למדוד גם:

```text
time_to_first_fill
time_to_full_fill
```

‏כי Partial Fill ראשון ו־Fill מלא אינם אותו דבר.

---

# ‏5. `Signal-to-Fill`

‏המדד החשוב ביותר למסחר שלך הוא לעיתים:

```text
signal_to_fill
```

‏בדוגמה:

```text
520ms
```

‏זו השהיה האמיתית בין "זיהיתי הזדמנות" לבין "יש לי מניות".

‏אם ה־Edge מחזיק רק 700ms, מערכת עם 520ms Signal-to-Fill נמצאת בבעיה גם אם החישוב עצמו מהיר מאוד.

---

# ‏6. לפני שליחת Order — `Pre-Trade Recheck`

‏אסור להניח שהמניה עדיין נראית כמו לפני 300ms או שנייה.

‏לפני Submit צריך לבצע בדיקה קצרה מאוד.

‏לדוגמה:

```text
candidate still Rank #1 or acceptable?
score still above threshold?
bid/ask fresh?
spread still acceptable?
price not already escaped?
no halt?
position/risk state still valid?
```

‏אם המצב השתנה מהותית:

```text
ABORT ENTRY
```

‏זה אינו כישלון.

‏זו הגנה מפני Signal ישן.

---

# ‏7. `Signal Age`

‏לכל Signal צריך להיות גיל.

```text
signal_age_ms
```

‏אם האסטרטגיה מחפשת מהלך מיידי, Signal בן כמה שניות עלול להיות כבר חסר משמעות.

‏לכן אפשר להגדיר:

```text
if signal_age > max_signal_age:
    reject entry
```

‏הסף עצמו צריך להיבדק במחקר ולא להיבחר סתם.

---

# ‏8. שלושה מצבי כניסה עיקריים

‏אפשר לחשוב על Execution בשלושה מצבים רעיוניים:

## ‏`Passive`

‏אנחנו מנסים לקבל מחיר טוב ולא ממהרים לחצות את ה־Spread.

## ‏`Balanced`

‏אנחנו מוכנים לשלם חלק מה־Spread או להתקרב לצד הנגדי כדי להגדיל Fill Probability.

## ‏`Aggressive`

‏אנחנו מעדיפים Fill מהיר גם במחיר פחות טוב, כל עוד הוא נשאר בתוך מגבלת מחיר ברורה.

‏אין מצב אחד שהוא תמיד נכון.

---

# ‏9. `Market Order`

‏פקודת Market אומרת בקירוב:

> ‏בצע עכשיו במחיר הזמין הטוב ביותר.

‏היתרון:

- ‏סיכוי גבוה יותר לביצוע מהיר.

‏החיסרון:

- ‏אין לך שליטה מלאה על מחיר הביצוע.
- ‏בשוק מהיר המחיר יכול להשתנות בין ההחלטה ל־Fill.
- ‏במניה דלילה אפשר לצרוך כמה רמות בספר.

‏לכן `Market` אינה "פקודה בטוחה כי היא מהירה".

‏היא מחליפה Price Certainty ב־Execution Certainty.

---

# ‏10. `Limit Order`

‏בפקודת Limit לקנייה אנחנו אומרים:

```text
Buy up to X
```

‏למשל:

```text
Buy 100 @ Limit 50.03
```

‏לא נשלם מעל 50.03.

‏אבל אין הבטחה שנקבל Fill בכלל.

‏זו החלפה הפוכה:

```text
better price control
vs
lower fill certainty
```

---

# ‏11. `Passive Limit`

‏נניח:

```text
Bid = 50.00
Ask = 50.02
```

‏ואנחנו שולחים:

```text
Buy Limit = 50.00
```

‏אנחנו מצטרפים לצד הקונים.

‏יתרון אפשרי:

- ‏לא חצינו את ה־Spread.
- ‏אם נתמלא, קיבלנו מחיר טוב יותר.

‏החיסרון:

- ‏אולי לא נתמלא בכלל.
- ‏המחיר יכול לברוח ל־50.10 בזמן שאנחנו עדיין מחכים ב־50.00.

‏במערכת Momentum מהירה, Opportunity Cost של No Fill יכול להיות גדול מאוד.

---

# ‏12. `Marketable Limit`

‏זו אחת הפקודות החשובות ביותר לרובוט שלך.

‏נניח:

```text
Bid = 50.00
Ask = 50.02
```

‏אנחנו רוצים לקנות מהר, אבל לא בכל מחיר.

‏אפשר לשלוח למשל:

```text
Buy Limit = 50.03
```

‏הפקודה Marketable כי היא יכולה לפגוש את ה־Ask הקיים.

‏אבל יש לנו Ceiling:

```text
Do not pay above 50.03
```

‏כלומר היא משלבת:

```text
aggressive execution
+
price protection
```

---

# ‏13. למה `Marketable Limit` יכולה להתאים למסחר קצר

‏כאשר ה־Edge קטן, אנחנו רוצים לפעמים Fill מיידי אך לא רוצים להיכנס למצב שבו Market Order רודפת אחרי ספר שמתפרק.

‏לכן `Marketable Limit` יכולה להיות Baseline טוב למחקר:

```text
cross the spread
but cap the worst acceptable price
```

‏אבל גם כאן אין הבטחה ל־Fill מלא אם הכמות הזמינה אינה מספיקה בתוך ה־Limit.

---

# ‏14. `Midpoint` ו־Price Improvement

‏אם:

```text
Bid = 50.00
Ask = 50.02
Mid = 50.01
```

‏במקום לקנות ב־50.02 אפשר לנסות ביצוע סביב:

```text
50.01
```

‏זו Price Improvement אפשרית.

‏אבל:

- ‏לא תמיד יש נזילות במיד.
- ‏לא תמיד Fill יגיע מהר מספיק.
- ‏מימוש הפקודה תלוי ב־Venue/Router/Broker.

‏לכן Midpoint הוא Trade-off בין מחיר למהירות, לא מתנה חינם.

---

# ‏15. `IOC` — Immediate-Or-Cancel

‏`IOC` אומר:

> ‏בצע עכשיו את מה שאפשר, ואת השאר בטל.

‏לדוגמה:

```text
Buy 100 shares IOC @ 50.03
```

‏אם רק 60 זמינות:

```text
60 filled
40 canceled
```

‏זה יכול להתאים ל־Signal קצר מאוד שבו אין טעם להשאיר פקודה ישנה בספר.

---

# ‏16. `DAY` מול Order Lifetime קצר משלנו

‏גם אם הפקודה עצמה מוגדרת `DAY`, אנחנו לא חייבים להשאיר אותה יום שלם.

‏הרובוט יכול להחליט:

```text
order_ttl = 300ms
```

‏או:

```text
order_ttl = 2s
```

‏ואם אין Fill:

```text
cancel
re-evaluate
```

‏חשוב: `Order TTL` הוא כלל של האסטרטגיה שלנו, לא בהכרח Time-in-Force של הבורסה.

---

# ‏17. `Order Aging`

‏פקודה שנשלחה לפני 2 שניות יכולה להיות מבוססת על Signal שכבר לא קיים.

‏לכן צריך למדוד:

```text
order_age_ms
```

‏ולשאול שוב ושוב:

```text
Would I still place this order now?
```

‏אם התשובה לא — מבטלים.

---

# ‏18. `Cancel/Replace`

‏אם המחיר זז, אפשר לבטל פקודה ולהגיש אחרת.

‏לדוגמה:

```text
Buy @ 50.00
↓ market moves
Cancel
Buy @ 50.01
```

‏אבל זה לא בחינם.

‏אפשר:

- ‏לאבד זמן.
- ‏לאבד מקום בתור.
- ‏לגרום ליותר Messages/API traffic.
- ‏לרדוף אחרי המחיר.

‏לכן Cancel/Replace צריך להיות Strategy מוגדרת ולא תגובה עצבנית לכל Tick.

---

# ‏19. `Queue Position`

‏אם אתה שולח Limit ב־Bid הקיים, ייתכן שכבר יש לפניך אלפי מניות.

‏לדוגמה:

```text
Bid = 50.00 × 12,000
```

‏ואתה מצטרף עם:

```text
100 shares
```

‏ייתכן שאתה בסוף תור ארוך.

‏גם אם מחיר העסקאות מגיע ל־50.00, זה לא אומר בהכרח שהפקודה שלך תתמלא מיד.

---

# ‏20. מחיר טוב יותר יכול להיות Fill גרוע יותר

‏זו אחת הסתירות החשובות בביצוע.

‏נניח אפשרות א':

```text
Buy 50.00 passive
```

‏ואפשרות ב':

```text
Buy 50.02 aggressive
```

‏א' נראית זולה יותר.

‏אבל אם היא אינה מתמלאת והמניה עולה ל־50.15, החיסכון של 2 סנט עלה לנו בהחמצת כל ההזדמנות.

‏לכן צריך למדוד גם:

`Missed Opportunity Cost`

---

# ‏21. אסור גם לרדוף בלי גבול

‏הטעות ההפוכה היא:

```text
50.02 missed
→ 50.04
→ 50.07
→ 50.11
→ finally filled
```

‏ייתכן שקיבלנו Fill דווקא אחרי שה־Edge נגמר.

‏לכן צריך:

```text
max_chase_distance
max_entry_price
max_signal_age
```

‏אם עברנו אותם:

```text
ABORT
```

---

# ‏22. `Entry Price Budget`

‏נניח שהמחקר מעריך מהלך צפוי של:

```text
+0.12%
```

‏אבל עלויות צפויות הן:

```text
spread            0.03%
slippage          0.02%
commission/fees   0.01%
exit friction     0.03%
```

‏נשאר:

```text
0.03%
```

‏אם אנחנו רודפים עוד 0.05%, העסקה כבר אינה אותה עסקה שהמודל בדק.

‏לכן כניסה צריכה להשתמש ב־Edge Budget.

---

# ‏23. `Edge Budget`

‏אפשר לחשוב על:

```text
Expected Gross Move
- Entry Cost
- Exit Cost
- Fees
- Safety Margin
= Executable Net Edge
```

‏ה־Execution Engine צריך לדעת כמה "מותר" לו לבזבז בשביל Fill.

‏אם עלות הכניסה חוצה את התקציב:

```text
NO ENTRY
```

---

# ‏24. `Execution Recheck` ממש לפני Submit

‏רגע לפני Submit אפשר לצלם:

```text
current_bid
current_ask
spread
latest_trade
score
rank
signal_age
quote_age
expected_net_edge
```

‏ואז להחליט:

```text
SUBMIT
or
ABORT
```

‏זו נקודת ביקורת חשובה מאוד.

---

# ‏25. `Partial Fill`

‏נניח שרצינו:

```text
100 shares
```

‏אבל קיבלנו:

```text
37 shares filled
63 remaining
```

‏עכשיו כבר יש Position אמיתית.

‏הרובוט חייב לדעת מה לעשות.

‏אפשרויות כוללות:

- ‏להמשיך לנסות להשלים.
- ‏לבטל את היתרה ולהישאר עם 37.
- ‏לבטל ולהתחיל לצאת מה־37.

‏ההתנהגות חייבת להיות מוגדרת מראש.

---

# ‏26. Partial Fill משנה גם את ניהול היציאה

‏אם קיבלנו 37 מניות, אסור שמנגנון Exit יחשוב שיש לנו 100.

‏לכן:

```text
position_qty = actual_filled_qty
```

‏ולא:

```text
requested_qty
```

‏כל Exit Order חייב להתבסס על הכמות שבאמת נרכשה.

---

# ‏27. יציאה מותנית מיד עם Fill

‏במערכת שלך יכול להיות הגיוני שה־Entry וה־Exit יהיו מתוכננים יחד.

‏למשל:

```text
Parent BUY
↓ filled
Child TAKE-PROFIT / STOP / TIME logic becomes active
```

‏זה יכול להיות ממומש באמצעות Parent/Child, Bracket/OCA או Logic פנימי — בהתאם לברוקר ול־API.

‏אבל העיקרון הוא:

> ‏אסור שתיווצר Position בלי שהמערכת יודעת כבר איך היא אמורה לצאת ממנה.

‏את פרטי ה־Exit נלמד בשלב 17.

---

# ‏28. `Entry State Machine`

‏מצבים אפשריים:

```text
READY_TO_ENTER
SUBMITTING
SUBMITTED
PARTIALLY_FILLED
FILLED
CANCEL_PENDING
CANCELED
REJECTED
ENTRY_ABORTED
```

‏המערכת צריכה לדעת באיזה State היא נמצאת בכל רגע.

‏אחרת קל מאוד לשלוח פקודה כפולה או לחשוב שאין Position כאשר כבר התקבל Fill.

---

# ‏29. `Order Intent`

‏לפני ששולחים Order לברוקר כדאי ליצור אובייקט פנימי שמתאר **מה רצינו לעשות**.

‏לדוגמה:

```text
symbol = XYZ
side = BUY
target_qty = 100
entry_mode = AGGRESSIVE
max_price = 50.03
signal_id = abc123
score_version = v17
signal_time = ...
```

‏אחרי זה אפשר להשוות:

```text
Intent
vs
Actual Execution
```

---

# ‏30. למה Order Intent חשוב ל־RCA

‏נניח העסקה הפסידה.

‏אנחנו רוצים לדעת:

```text
Was the signal wrong?
Was the order sent too late?
Was the price cap too aggressive?
Was there slippage?
Was the fill partial?
Did the market move while waiting?
```

‏בלי Intent ו־timestamps קשה לענות.

---

# ‏31. `Decision Price` מול `Fill Price`

‏אפשר לחשב:

```text
entry_slippage = fill_price - decision_reference_price
```

‏בקנייה, מספר חיובי בדרך כלל אומר שקנינו במחיר גרוע יותר מה־reference.

‏אבל צריך לבחור Reference ברור:

- ‏Mid בזמן החלטה.
- ‏Ask בזמן החלטה.
- ‏NBBO בזמן שליחת Order.

‏ולשמור איזה Benchmark השתמשנו.

---

# ‏32. `Implementation Shortfall`

‏מושג מקצועי חשוב:

`Implementation Shortfall`

‏בפשטות:

> ‏הפער בין התוצאה שהייתה לנו אילו יכולנו לבצע מיד במחיר ההחלטה לבין מה שקיבלנו בפועל.

‏הוא יכול לכלול:

- ‏Delay.
- ‏Slippage.
- ‏Partial/No Fill.
- ‏Fees.
- ‏Missed Move.

‏זה כלי חזק למדידת Execution Quality.

---

# ‏33. `Fill Rate`

‏נמדוד:

```text
fill_rate = filled_orders / submitted_orders
```

‏או ברמת כמות:

```text
quantity_fill_rate = filled_qty / requested_qty
```

‏אסטרטגיה Passive יכולה להיראות מעולה במחיר הביצוע, אבל גרועה מאוד אם Fill Rate נמוך.

---

# ‏34. `Time to First Fill`

‏למסחר קצר מאוד זה Metric חשוב.

```text
time_to_first_fill
```

‏יכול להיות שממוצע הוא 100ms אבל P95 הוא 2.5s.

‏לכן לא מסתכלים רק על Average.

‏נרצה:

```text
P50
P90
P95
P99
```

---

# ‏35. `No Fill` הוא תוצאה שצריך למדוד

‏אם שלחנו Limit ולא נתמלאנו, אסור פשוט למחוק את האירוע.

‏צריך לבדוק:

```text
What happened after no fill?
```

‏אם רוב ה־No Fills היו דווקא עסקאות שהיו מרוויחות, ה־Execution פספס Edge.

‏אם רובם היו מהלכים שנכשלו, ייתכן שההמתנה אפילו הצילה אותנו.

---

# ‏36. `Adverse Selection`

‏נניח Limit Passive מתמלא רק כאשר המחיר מתחיל לרדת נגדנו.

‏אז אנחנו מקבלים מחיר "טוב" — אבל Fill רע.

‏זה נקרא רעיונית:

`Adverse Selection`

‏לכן לא מספיק למדוד:

```text
Did I get price improvement?
```

‏צריך לבדוק גם:

```text
What happened 1s / 5s / 10s after the fill?
```

---

# ‏37. `Markout`

‏Markout מודד מה קרה למחיר אחרי Fill.

‏למשל:

```text
fill_price = 50.02
mid_after_1s = 50.00
```

‏בקנייה זה Markout שלילי.

‏נרצה אולי:

```text
markout_1s
markout_2s
markout_5s
markout_10s
```

‏כך נדע אם סוג Entry מסוים גורם לנו להתמלא בדיוק לפני תנועה נגדנו.

---

# ‏38. `Price Improvement` אינו בהכרח ניצחון

‏אם קיבלנו:

```text
midpoint fill
```

‏חסכנו אולי סנט.

‏אבל אם חיכינו 3 שניות וה־Signal איבד את כוחו, ייתכן שהחיסכון היה חסר משמעות.

‏לכן:

```text
Execution Quality != Cheapest Fill
```

‏אלא:

```text
Execution Quality = Net outcome relative to decision
```

---

# ‏39. התאמת אגרסיביות לעוצמת Signal

‏רעיון למחקר:

```text
weak / slow signal → passive
strong / short-lived signal → more aggressive
```

‏למשל:

```text
High score + accelerating + tiny spread + fresh quote
→ marketable limit
```

‏לעומת:

```text
Moderate score + stable movement + wider spread
→ passive / wait
```

‏זה רעיון לבדיקה, לא חוק מוכח.

---

# ‏40. `Urgency`

‏אפשר ליצור Feature/State שנקרא:

```text
execution_urgency
```

‏והוא יכול להיות תלוי ב:

```text
signal_strength
signal_decay
acceleration
rank_gap
spread
liquidity
expected_holding_time
```

‏המטרה היא שה־Order Type יהיה תוצאה של מצב השוק ולא קבוע שרירותי.

---

# ‏41. כניסה לפי Holding Horizon

‏אם המודל מצפה שה־Edge יגיע בתוך:

```text
2 seconds
```

‏אין היגיון להמתין 5 שניות ב־Bid.

‏אם המודל מצפה מהלך של 45 שניות:

‏אולי יש יותר זמן לנסות Price Improvement.

‏לכן:

```text
entry policy should match signal horizon
```

---

# ‏42. `Entry Window`

‏אפשר להגדיר חלון שבו עדיין מותר להיכנס.

‏לדוגמה:

```text
signal at T0
entry allowed until T0 + 800ms
```

‏אחרי זה:

```text
signal expired
```

‏הסף צריך להיבדק מול Forward Returns וה־Signal Half-Life.

---

# ‏43. `Price Escape`

‏גם אם הזמן לא עבר, המחיר יכול לברוח.

‏למשל Signal נוצר ב־:

```text
50.00
```

‏וכעת Ask הוא:

```text
50.18
```

‏ייתכן שה־Expected Move כבר התרחש.

‏לכן כדאי למדוד:

```text
price_move_since_signal
```

‏ולהגדיר Max Entry Drift.

---

# ‏44. `Revalidate Expected Edge`

‏לפני Entry אפשר לחשב מחדש:

```text
expected_move_remaining
-
current_entry_cost
-
expected_exit_cost
-
fees
```

‏אם התוצאה אינה מספיקה:

```text
ABORT
```

‏זה הרבה יותר טוב מאשר לבצע כי "כבר החלטנו קודם".

---

# ‏45. `Sunk Cost` פסיכולוגי ברובוט

‏גם רובוט יכול לקבל Sunk Cost אם הקוד כתוב לא נכון.

‏לדוגמה:

```text
we already spent 700ms trying to enter
so keep chasing
```

‏זו לוגיקה גרועה.

‏כל רגע צריך לשאול:

> ‏אם לא הייתה כרגע שום פקודה פתוחה, האם הייתי עדיין רוצה להיכנס במחיר הנוכחי?

‏אם לא — מבטלים.

---

# ‏46. מחיר הכניסה צריך להיות חלק מה־Strategy

‏אסור שה־Scanner יגיד רק:

```text
BUY XYZ
```

‏החלטה מלאה יותר היא:

```text
BUY XYZ
up to price X
for qty Y
with mode Z
valid until T
```

‏כלומר Signal ו־Execution צריכים לדבר באותה שפה.

---

# ‏47. `Execution Policy`

‏אפשר להגדיר Policy:

```text
PASSIVE
BALANCED
AGGRESSIVE
```

‏לכל Policy נגדיר:

```text
initial price
max price
order ttl
cancel/replace behavior
max chase
partial fill rule
```

‏כך הביצוע נעשה מדיד וניתן ל־Backtest.

---

# ‏48. למה לא לקודד אלף `if`-ים סביב Entry

‏קל להגיע ל:

```text
if spread < ...
if rank == 1 ...
if acceleration > ...
if bidSize > ...
if time < ...
```

‏עד שאי אפשר להבין למה פקודה נשלחה.

‏עדיף:

```text
Decision Gate
Execution Policy
Order State Machine
```

‏שלושה מנגנונים ברורים ונפרדים.

---

# ‏49. Broker Ack אינו Fill

‏כאשר הברוקר אומר:

```text
Submitted
```

‏זה לא אומר שקנינו.

‏מצבים שונים יכולים להיות:

```text
PendingSubmit
Submitted
PartiallyFilled
Filled
PendingCancel
Canceled
Rejected
Inactive
```

‏אסור לעבור ל־Position State לפני שיש Fill אמיתי.

---

# ‏50. Reject הוא מידע מחקרי

‏פקודה יכולה להידחות בגלל:

- ‏הרשאות.
- ‏מחיר לא חוקי.
- ‏גודל.
- ‏מצב חשבון.
- ‏Session.
- ‏סוג פקודה שאינו נתמך.
- ‏בעיה זמנית.

‏צריך לשמור:

```text
reject_reason
```

‏ולנתח Reject Rate כמו כל Metric אחר.

---

# ‏51. `Unknown Order State`

‏תרחיש מסוכן:

```text
send order
network drops
```

‏אנחנו לא יודעים אם הפקודה התקבלה.

‏אסור פשוט לשלוח אותה שוב.

‏קודם:

```text
reconcile with broker
```

‏ולברר האם קיימת פקודה או Position.

‏זה ימנע Duplicate Entry.

---

# ‏52. `Idempotency`

‏המטרה היא שאותו Intent לא ייצור בטעות שתי פקודות קנייה.

‏אפשר להשתמש ב:

```text
internal_order_id
signal_id
client_order_id
```

‏ולבנות מערכת שמזהה ניסיון Submit כפול.

‏הפרטים תלויים ב־API, אבל העיקרון אוניברסלי.

---

# ‏53. Entry ו־Risk חייבים להיפגש

‏לפני Submit:

```text
position_size_valid?
buying_power_valid?
max_open_positions_valid?
daily_loss_limit_valid?
no duplicate symbol position?
```

‏ה־Scanner אינו מוסמך לעקוף Risk Engine.

---

# ‏54. Entry ו־Market Data חייבים להיפגש

‏אם:

```text
quote_age = 3 seconds
```

‏ואנחנו סוחרים בטווח של שניות:

‏המחיר כמעט חסר משמעות.

‏לכן Entry Gate צריך לכלול:

```text
max_quote_age
max_trade_age
feed_health
```

---

# ‏55. Entry ו־Broker Health חייבים להיפגש

‏לפני Submit:

```text
broker_connected?
account_state_fresh?
order_channel_healthy?
```

‏אם לא:

```text
NO NEW ENTRY
```

---

# ‏56. `Execution Benchmark`

‏כדי להשוות Policies צריך Benchmark.

‏למשל:

```text
Policy A = passive bid
Policy B = midpoint
Policy C = marketable limit
```

‏ונמדוד לכל אחת:

```text
fill_rate
time_to_fill
entry_slippage
missed_opportunity
markout
net_pnl
```

‏רק אז נדע מה באמת עדיף.

---

# ‏57. Backtest של Entry חייב לדמות No Fill

‏טעות נפוצה:

```text
if low <= limit_price:
    assume full fill
```

‏במסחר מהיר זה יכול להיות אופטימי מאוד.

‏מחיר שנגע ברמה לא מבטיח שהפקודה שלך הייתה ראשונה בתור או שהיה מספיק Volume.

‏לכן Backtest מתקדם צריך להתייחס ל־Fill Probability, Queue ו־Latency.

---

# ‏58. אבל לא חייבים להתחיל מסימולציה מושלמת

‏גישה נכונה:

```text
Model 1: optimistic
Model 2: realistic baseline
Model 3: conservative
```

‏אם האסטרטגיה עובדת רק ב־Model 1, זו נורת אזהרה.

---

# ‏59. `Paper Trading` אינו הוכחת Execution מלאה

‏Paper יכול לעזור לבדוק:

- ‏State Machine.
- ‏Order flow.
- ‏API.
- ‏חיבור Entry/Exit.

‏אבל Fill Simulation של Paper לא תמיד זהה ל־Live Market.

‏לכן לפני מסחר אמיתי צריך להשוות Shadow/Live Quotes ולמדוד פערים.

---

# ‏60. מה זה אומר במיוחד לרובוט שלך

‏הרובוט שלך מחפש מהלך קצר מאוד.

‏לכן יש ארבעה אויבים עיקריים בכניסה:

```text
1. stale signal
2. spread
3. no fill / slow fill
4. chasing after the move
```

‏ה־Entry Engine צריך למצוא איזון ביניהם.

---

# ‏61. Baseline הגיוני למחקר אצלך

‏לא המלצה למסחר אמיתי, אלא Baseline מחקרי:

```text
1. Candidate passes Trade/No-Trade
2. Recheck fresh Bid/Ask
3. Calculate max acceptable entry price
4. Send price-capped aggressive order
5. Short TTL
6. If no fill → cancel and re-evaluate
7. Never chase beyond edge budget
8. On any fill → position state starts immediately
```

‏אחר כך אפשר להשוות אותו ל־Passive, Midpoint ו־Policies אחרות.

---

# ‏62. למה `Marketable Limit` הוא Baseline מחקרי מעניין

‏לא משום שהוא תמיד הכי טוב.

‏אלא משום שהוא נותן ניסוי נקי:

```text
I want a quick fill
but never above X
```

‏זה מאפשר למדוד בנפרד:

- ‏כמה עסקאות התמלאו.
- ‏כמה לא.
- ‏כמה Slippage נחסך.
- ‏כמה מהלכים פספסנו.

---

# ‏63. בדיקה אחרי כל Entry

‏לכל ניסיון Entry כדאי לשמור:

```text
signal_time
decision_time
submit_time
ack_time
first_fill_time
full_fill_time
cancel_time

signal_price
bid_at_decision
ask_at_decision
mid_at_decision
limit_price
avg_fill_price

requested_qty
filled_qty

score
rank
rank_gap
signal_age
spread
quote_age
execution_policy
reject_reason
```

‏זו תשתית זהב ל־RCA.

---

# ‏64. Metrics של Entry Engine

‏נרצה Dashboard עם:

```text
Fill Rate
Partial Fill Rate
Reject Rate
Cancel Rate
Median Time to First Fill
P95 Time to First Fill
Median Slippage
P95 Slippage
Missed Opportunity Rate
Adverse Selection Rate
Markout 1s/5s/10s
Net PnL by Execution Policy
```

---

# ‏65. `RCA` של Entry גרוע

‏אם Rank #1 עלתה יפה אבל העסקה הפסידה, לא מאשימים מיד את ה־Scanner.

‏בודקים:

```text
Was the signal already old?
Did spread expand?
Did we chase?
Did fill take too long?
Did we get adverse selection?
Did partial fill change behavior?
Did exit logic fail?
```

‏כך מפרידים:

```text
Signal Failure
from
Execution Failure
```

---

# ‏66. `RCA` של No Fill

‏גם No Fill צריך חקירה.

‏לדוגמה:

```text
No Fill
→ price +0.25% in next 5s
```

‏אולי ה־Policy הייתה פסיבית מדי.

‏לעומת:

```text
No Fill
→ price -0.40%
```

‏ייתכן שה־No Fill הציל אותנו.

‏לא משנים Policy לפי אנקדוטה אחת — אוספים Distribution.

---

# ‏67. `RCA` של Chase

‏נשמור:

```text
initial_intended_price
final_fill_price
chase_distance
```

‏ונבדוק:

> ‏האם עסקאות עם Chase גדול עדיין רווחיות Net?

‏אם לא, צריך Hard Stop למרדף.

---

# ‏68. Best Practice — הפרדת Signal מ־Execution

‏ה־Scanner אומר:

```text
XYZ is attractive
```

‏ה־Execution Engine אומר:

```text
Can I still enter XYZ under acceptable conditions?
```

‏הפרדה זו מאפשרת להחליף Execution Policy בלי לשנות את ה־Signal Model.

---

# ‏69. Best Practice — Execution Policy כגרסה

‏לכל Policy:

```text
execution_policy_version
```

‏למשל:

```text
entry_v1_passive
entry_v2_marketable_limit
entry_v3_dynamic_urgency
```

‏כך אפשר להשוות תוצאות היסטורית.

---

# ‏70. Best Practice — אל תערבב שינויי Signal ו־Execution

‏אם באותו ניסוי שינית:

```text
score weights
+
entry order type
```

‏ואז התוצאה השתפרה — לא תדע למה.

‏לכן:

```text
one major variable at a time
```

---

# ‏71. Best Practice — בדוק Distribution, לא רק Average

‏ממוצע Slippage של 0.01% יכול להסתיר:

```text
95% trades = 0.00%
5% trades  = disastrous slippage
```

‏לכן בודקים:

```text
P50
P90
P95
P99
worst cases
```

---

# ‏72. Best Practice — שמור את Market Snapshot של הכניסה

‏בזמן Signal ובזמן Submit כדאי לשמור לפחות:

```text
Bid
Ask
Sizes
Last
Spread
Recent activity
Score components
Rank
```

‏כך אפשר לשחזר את ההחלטה בדיוק.

---

# ‏73. Best Practice — Entry חייב להיות Reproducible

‏אם אנחנו מריצים Replay על אותם Events ואותה גרסה, Entry Engine אמור לקבל אותה החלטה.

‏אם לא — קשה מאוד לבצע Research אמין.

---

# ‏74. Anti-Pattern — `Always Market`

‏"ה־Signal טוב אז פשוט Market" היא מדיניות גסה מדי.

‏לפעמים זה יעבוד.

‏לפעמים Spread/Depth יהרסו את העסקה.

‏צריך לבדוק מחיר, נזילות ו־Edge Budget.

---

# ‏75. Anti-Pattern — `Always Passive`

‏גם "תמיד Bid כדי לחסוך Spread" אינה בהכרח חכמה.

‏ב־Momentum קצר ייתכן שתישאר בחוץ בדיוק בעסקאות הטובות ביותר.

---

# ‏76. Anti-Pattern — Infinite Chase

‏אין דבר כזה:

```text
Keep repricing until filled
```

‏בלי Max Price ו־Signal Expiry.

‏זה יכול להפוך Signal טוב לכניסה גרועה מאוד.

---

# ‏77. Anti-Pattern — Assume Fill

‏לא פותחים Position פנימית בזמן Submit.

‏פותחים לפי:

```text
actual execution events
```

‏אחרת State המערכת יתנתק מהברוקר.

---

# ‏78. Anti-Pattern — Ignore Partial Fills

‏Partial Fill הוא State מלא בפני עצמו.

‏הוא אינו "כמעט Fill".

‏הוא יוצר Exposure אמיתי ודורש Exit Protection.

---

# ‏79. Anti-Pattern — Benchmark מול `Last`

‏למדוד Slippage רק מול Last יכול להטעות.

‏ל־Execution לרוב יותר שימושי לשמור גם:

```text
Bid
Ask
Mid
NBBO
```

‏בזמן ההחלטה ובזמן ה־Order.

---

# ‏80. Anti-Pattern — להשתמש בפקודה שלא נבדקה בחשבון האמיתי

‏Broker יכול לתמוך בסוג Order בפלטפורמה אחת ולא ב־API אחר, או ב־Venue/Region מסוים בלבד.

‏לכן לפני Production:

```text
verify broker + API + product + route support
```

‏ולא מסתמכים רק על שם Order שמופיע באתר.

---

# ‏81. רז מקצוע — `Best Fill` אינו בהכרח `Best Trade`

‏מנוסים מפרידים בין:

```text
execution price quality
```

‏לבין:

```text
strategy outcome
```

‏אפשר לקבל Fill מצוין במניה שלא הייתה צריכה להיקנות.

‏ואפשר לקבל Fill פחות מושלם במניה שנתנה Edge חזק.

‏צריך למדוד את שתי השכבות בנפרד.

---

# ‏82. רז מקצוע — Opportunity Cost הוא Cost אמיתי

‏אם Limit זולה יותר פספסה 40% מהעסקאות הטובות ביותר, היא אינה באמת "זולה".

‏עלות שלא מופיעה בדוח הברוקר עדיין יכולה להיות עלות אסטרטגית.

---

# ‏83. רז מקצוע — Entry צריך להיות תלוי ב־Decay

‏אם האות שלך מתכלה מהר, זמן הוא Cost.

‏אם האות יציב, מחיר הוא Cost חשוב יותר.

‏לכן `signal decay` צריך בסופו של דבר להשפיע על Execution Urgency.

---

# ‏84. רז מקצוע — אל תנסה לנצח HFT במשחק שלהם

‏רובוט אישי בבית אינו צריך לבנות תזה על ניצחון במיקרו־שניות.

‏היתרון האפשרי שלך הוא אחר:

- ‏כמות קטנה.
- ‏גמישות.
- ‏יכולת לוותר על רוב ההזדמנויות.
- ‏יכולת לעבוד בנישות שאין להן Capacity מוסדי גדול.
- ‏יכולת לבחור Horizon שבו Latency ביתי עדיין נסבל.

‏אם Edge נעלם בגלל 2ms, כנראה זה Edge שקשה מאוד לנצל מהבית.

---

# ‏85. התאמה מפורשת לאופי המסחר שלך

‏אצלך המטרה אינה להחזיק שעות.

‏לכן Entry טוב צריך לענות מהר על ארבע שאלות:

```text
1. Is the signal still alive?
2. Can I get filled quickly?
3. Is the price still inside my edge budget?
4. If filled now, can I immediately manage the exit?
```

‏אם אחת התשובות היא לא:

```text
NO ENTRY
```

---

# ‏86. מה נרצה ללמוד מהנתונים שלך בעתיד

‏נוכל להשוות למשל:

```text
Passive Bid
vs
Midpoint
vs
Marketable Limit
vs
Dynamic Urgency
```

‏לכל Rank Bucket ולכל Signal Type.

‏ייתכן שסוג Entry אחד טוב ל־Burst ואחר ל־Stable Momentum.

‏לא מניחים מראש.

---

# ‏87. סדר מחקר מומלץ

```text
1. Build one simple entry baseline
2. Measure fill/slippage/latency
3. Add one alternative
4. Replay same signals
5. Compare net result
6. Segment by signal type
7. Keep only improvements that survive out-of-sample testing
```

‏כך Execution עצמו הופך למחקר מדעי.

---

# ‏88. Checklist לפני Submit

‏לפני כל Entry:

```text
Signal valid?
Signal fresh?
Candidate still acceptable?
Data fresh?
Spread acceptable?
Liquidity sufficient?
Expected edge still positive net?
Price within max entry?
Risk checks pass?
Broker healthy?
No duplicate order?
Exit path ready?
```

‏רק אז:

```text
SUBMIT
```

---

# ‏89. Checklist אחרי Submit

```text
Ack received?
Order status known?
Any partial fill?
Signal still valid?
Order age acceptable?
Price still inside budget?
Cancel needed?
Position qty synchronized?
Exit protection ready for filled qty?
```

---

# ‏90. מה צריך לזכור משלב 16

1. ‏`Signal` ו־`Fill` הם שני דברים שונים.
2. ‏כניסה היא Strategy בפני עצמה.
3. ‏Market נותנת יותר Execution Certainty ופחות Price Certainty.
4. ‏Limit נותנת יותר Price Control ופחות Fill Certainty.
5. ‏Marketable Limit יכולה לשלב אגרסיביות עם Price Cap.
6. ‏No Fill ו־Missed Opportunity הם Cost אמיתי.
7. ‏Cancel/Replace יכול לאבד זמן ו־Queue Priority.
8. ‏Partial Fill יוצר Position אמיתית ומחייב טיפול מיידי.
9. ‏Signal צריך Expiry ו־Entry צריך Max Price/Max Chase.
10. ‏Execution נמדד לפי Net Outcome, לא רק לפי מחיר Fill.
11. ‏RCA חייב להפריד Signal Failure מ־Execution Failure.
12. ‏למסחר שלך Entry חייב להיות מותאם לאורך החיים הקצר של ה־Edge.

---

# ‏91. בדיקת הבנה עצמית

‏נסה לענות בלי לחזור למעלה:

1. ‏מה ההבדל בין Signal Price ל־Fill Price?
2. ‏למה Marketable Limit שונה מ־Market?
3. ‏מהו Opportunity Cost של Passive Limit?
4. ‏למה Cancel/Replace יכול לפגוע בך גם אם המחיר החדש טוב יותר?
5. ‏מהו Signal-to-Fill?
6. ‏מהו Edge Budget?
7. ‏מה עושים כאשר מתקבל Partial Fill?
8. ‏למה Price Improvement לא בהכרח אומר Execution טוב?
9. ‏מהו Markout?
10. ‏מה צריך לקרות אם Signal כבר ישן מדי בזמן Submit?

---

# ‏92. מקורות רשמיים שנבדקו לפרק

‏נבדקו מקורות רשמיים עדכניים בנושאי Order Execution ו־Order Types, ובהם:

- ‏`SEC` — Limit Orders ו־Trade Execution.
- ‏`Nasdaq Trader` — Price/Time Priority, Order Types ו־Order Functionality.
- ‏`Interactive Brokers` — Order Types, MidPrice, Pegged Orders ויכולות Routing.

‏פרטי תמיכה בסוג Order מסוים יכולים להשתנות לפי ברוקר, API, מוצר, Venue, Region והרשאות החשבון, ולכן לפני שימוש חי יש לאמת את היכולת בפועל.

---

# ‏Checkpoint

‏שלב 16 הגדיר את שכבת הכניסה לעסקה: כיצד הופכים Signal ל־Order, כיצד מגינים על המחיר בלי לאבד Fill, כיצד מודדים Latency/Slippage/No-Fill, וכיצד מונעים מ־Execution גרוע למחוק Signal טוב.

‏בשלב 17 נלמד את הצד השני: **יציאה מעסקה** — Take Profit, Stop, Time Stop, Signal Exit, trailing, conditional exits, ומה עושים כאשר העסקה לא מתנהגת כפי שה־Scanner ציפה.