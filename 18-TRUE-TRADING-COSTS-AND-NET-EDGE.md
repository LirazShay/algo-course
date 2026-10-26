# ‏שלב 18 — העלויות האמיתיות של העסקה: מ־`Gross Edge` ל־`Net Edge`

> ‏מטרת הפרק: להבין כמה העסקה באמת עולה מקצה לקצה, ואיך להימנע מהטעות הקלאסית שבה Backtest נראה רווחי רק מפני שלא ספרנו את כל החיכוכים שבדרך.
>
> ‏העיקרון המרכזי: **לא מעניין אותנו כמה המחיר זז לטובתנו. מעניין כמה כסף נשאר אחרי כל העלויות, בשני צדי העסקה, בתנאי ביצוע מציאותיים.**

---

# ‏1. `Gross` מול `Net`

‏נניח שקנינו מניה ב־100.00 ומכרנו ב־100.05.

```text
Gross move = +$0.05 per share
```

‏אם קנינו 100 מניות:

```text
Gross PnL = $5.00
```

‏אבל זה עדיין לא הרווח האמיתי.

‏צריך להפחית:

```text
Entry commission
Exit commission
Exchange / routing fees
Regulatory fees
Spread cost
Entry slippage
Exit slippage
Market impact
Partial-fill friction
Opportunity cost
Other broker/account charges if relevant
```

‏רק אחרי כל אלה נקבל:

```text
Net PnL
```

---

# ‏2. נוסחת הבסיס

```text
Net PnL
=
Gross PnL
- Explicit Costs
- Implicit Costs
```

‏`Explicit Costs` הן עלויות שמופיעות בדרך כלל בדוח או בחשבון:

```text
commission
exchange fee
clearing fee
regulatory fee
routing fee
```

‏`Implicit Costs` הן עלויות שמסתתרות בתוך איכות הביצוע:

```text
spread
slippage
market impact
adverse selection
missed opportunity
```

‏למסחר קצר מאוד, העלויות הסמויות יכולות להיות חשובות יותר מהעמלה עצמה.

---

# ‏3. למה העלויות קריטיות במיוחד לאסטרטגיה קצרה

‏אם האסטרטגיה מחפשת מהלך גדול של 10% לאורך שבוע, כמה סנטים של חיכוך יכולים להיות זניחים יחסית.

‏אבל אם אנחנו מחפשים למשל:

```text
+0.05%
+0.10%
+0.20%
```

‏תוך שניות, אז Spread של 0.05% כבר יכול לאכול חלק עצום מה־Edge.

‏כלומר:

> ‏ככל שה־Target קטן יותר וה־Holding Time קצר יותר, עלות הביצוע הופכת לחלק גדול יותר מהאסטרטגיה עצמה.

---

# ‏4. `Commission`

‏`Commission` היא העמלה שהברוקר גובה על ביצוע העסקה.

‏מודלים נפוצים:

```text
per-share
per-order
percentage of trade value
minimum per order
monthly tiers
```

‏לכן אסור לכתוב במערכת:

```text
commission = $1
```

‏כאילו זה חוק טבע.

‏צריך מודל שניתן להחלפה לפי:

```text
broker
account type
pricing plan
country / entity
venue
order route
share quantity
trade value
monthly volume tier
```

---

# ‏5. מינימום לעסקה יכול להיות חשוב יותר מהמחיר ל־Share

‏נניח מודל תמחור אומר:

```text
$0.0035 per share
minimum $0.35 per order
```

‏אם קנינו 50 מניות:

```text
50 × 0.0035 = $0.175
```

‏אבל בפועל המינימום יכול להפוך את העלות ל־:

```text
$0.35
```

‏אם יש גם מכירה:

```text
round-trip minimum ≈ $0.70
```

‏במסחר עם רווח יעד קטן, זה כבר משמעותי.

---

# ‏6. `Round Trip`

‏עסקה מלאה היא לא רק קנייה.

```text
BUY
+
SELL
```

‏לכן כשמחשבים עלות צריך לחשב את כל ה־Round Trip.

‏טעות נפוצה:

```text
Commission = $0.35
```

‏כאשר בפועל:

```text
Entry commission = $0.35
Exit commission  = $0.35
Total             = $0.70
```

‏וזה לפני Spread ו־Slippage.

---

# ‏7. `Spread Cost`

‏נניח:

```text
Bid = 100.00
Ask = 100.02
```

‏אם אנחנו קונים מיד ב־Ask:

```text
Buy = 100.02
```

‏ומיד יכולים למכור רק ב־Bid:

```text
Sell = 100.00
```

‏נוצר חיכוך מיידי של:

```text
$0.02 per share
```

‏ל־100 מניות:

```text
$2.00
```

‏זה קורה גם אם מחיר ה־Last בכלל לא השתנה.

---

# ‏8. `Half Spread` מול `Full Spread`

‏בניתוחים מסוימים משתמשים ב־Half Spread ביחס ל־Mid.

‏אם:

```text
Bid = 100.00
Ask = 100.02
Mid = 100.01
```

‏קנייה אגרסיבית ב־Ask עולה בערך:

```text
+0.01 מעל ה-Mid
```

‏ומכירה אגרסיבית ב־Bid עולה בערך:

```text
-0.01 מתחת ל-Mid
```

‏יחד:

```text
Full spread ≈ 0.02
```

‏אם שני הצדדים מבוצעים אגרסיבית בלי שינוי בשוק.

---

# ‏9. אבל לא תמיד משלמים Full Spread

‏אם נכנסים Passive ב־Bid ומתמלאים, ייתכן שלא נשלם את ה־Ask.

‏אם יוצאים Passive ב־Ask ומתמלאים, אולי אפילו נלכוד חלק מה־Spread.

‏לכן העלות בפועל תלויה ב־Execution Policy.

‏אבל יש מחיר אחר:

```text
Fill risk
Missed move
Queue wait
Adverse selection
```

‏אין ארוחה חינם.

---

# ‏10. `Slippage`

‏`Slippage` הוא ההפרש בין המחיר שציפינו לקבל לבין המחיר שקיבלנו בפועל.

‏לדוגמה:

```text
Expected buy = 50.00
Actual fill  = 50.03
Entry slippage = +0.03
```

‏בצד המכירה:

```text
Expected sell = 50.10
Actual fill   = 50.07
Exit slippage = -0.03
```

‏סה"כ איבדנו:

```text
$0.06 per share
```

‏עוד לפני עמלה.

---

# ‏11. `Slippage` אינו מספר קבוע

‏טעות מסוכנת ב־Backtest:

```text
slippage = 0.01%
```

‏לכל מניה, בכל שעה ובכל מצב.

‏בפועל Slippage תלוי בין היתר ב־:

```text
spread
volatility
order size
available depth
urgency
order type
market regime
session
latency
venue
news / burst activity
```

‏לכן עדיף למדוד Distribution אמיתי של Slippage.

---

# ‏12. `Entry Slippage` ו־`Exit Slippage` הם שני דברים שונים

‏אסור להניח שהם סימטריים.

‏יכול להיות שבכניסה אנחנו רודפים אחרי מומנטום ולכן Slippage חיובי לרעתנו.

‏ביציאה, במיוחד כאשר Signal נשבר, אנחנו עלולים לצאת יחד עם הרבה מוכרים ולכן לקבל Slippage גרוע יותר.

‏לכן נשמור בנפרד:

```text
entry_slippage_bps
exit_slippage_bps
```

---

# ‏13. `Basis Points` — `bps`

‏`1 basis point` הוא:

```text
0.01%
```

‏כלומר:

```text
10 bps = 0.10%
```

‏זה נוח להשוואת עלויות בין מניות במחירים שונים.

‏למשל:

```text
commission_bps
spread_bps
slippage_bps
net_return_bps
```

---

# ‏14. `Market Impact`

‏`Market Impact` הוא מצב שבו הפקודה שלנו עצמה משפיעה על המחיר.

‏למשל אם ה־Ask נראה כך:

```text
100.00 × 50
100.01 × 100
100.02 × 300
```

‏ואנחנו קונים 400 מניות, אנחנו עלולים “לאכול” כמה רמות.

‏המחיר הממוצע שלנו יהיה גרוע יותר מהמחיר הראשון שראינו.

---

# ‏15. יתרון אפשרי לסוחר קטן

‏עם Position קטן, אנחנו עשויים לצרוך חלק קטן מאוד מה־Depth.

‏לכן Market Impact יכול להיות נמוך יותר מאשר אצל גוף גדול.

‏זה יתרון אפשרי משמעותי במסחר אישי.

‏אבל הוא לא מבטל:

```text
spread
latency
slippage
fees
adverse selection
```

---

# ‏16. `VWAP` של Fill

‏אם קיבלנו כמה Fills:

```text
50 shares @ 20.00
50 shares @ 20.02
```

‏מחיר הכניסה אינו 20.00 או 20.02.

‏הוא:

```text
VWAP = 20.01
```

‏כל חישוב PnL צריך לעבוד מול מחיר Fill ממוצע משוקלל אמיתי.

---

# ‏17. `Partial Fill Cost`

‏Partial Fill יכול ליצור עלויות מיוחדות.

‏לדוגמה:

```text
Wanted = 200 shares
Filled = 70 shares
```

‏עכשיו צריך להחליט:

```text
wait?
cancel?
replace?
chase?
trade smaller position?
```

‏כל אפשרות משנה את העלות ואת ה־Edge.

---

# ‏18. `Opportunity Cost`

‏עלות אינה רק כסף ששילמנו.

‏לפעמים אנחנו מחכים ל־Limit Order במחיר טוב יותר — אבל המניה ממשיכה בלעדינו.

‏לדוגמה:

```text
Signal price = 30.00
Passive bid  = 29.99
No fill
Price moves  = 30.20
```

‏עמלת הביצוע הייתה אפס.

‏אבל הפסדנו הזדמנות שלמה.

‏זו `Opportunity Cost`.

---

# ‏19. `Implementation Shortfall`

‏זה מושג מרכזי ב־Execution Analysis.

‏בפשטות:

> ‏כמה גרוע יותר הייתה התוצאה בפועל לעומת נקודת ההחלטה המקורית.

‏אפשר לחשוב:

```text
Decision Price
→ delays
→ execution
→ fees
→ actual result
```

‏ההפרש הכולל הוא סוג של Implementation Shortfall.

---

# ‏20. למה `Decision Price` חשוב

‏אם נמדוד Slippage רק מול ה־Quote שהיה בזמן שליחת הפקודה, אנחנו עלולים להסתיר Latency מוקדם יותר.

‏לכן כדאי לשמור:

```text
signal_price
trade_decision_price
order_send_price
broker_ack_price
fill_price
```

‏ואז למדוד איפה בדיוק ה־Edge נאכל.

---

# ‏21. `Effective Spread`

‏אפשר למדוד כמה רחוק ה־Fill היה מה־Mid בזמן המתאים.

‏לדוגמה בקנייה:

```text
Mid at decision = 100.00
Fill            = 100.02
```

‏קיבלנו ביצוע 2 סנטים מעל Mid.

‏זה נותן תמונה מדויקת יותר מאשר להסתכל רק על Quoted Spread.

---

# ‏22. `Realized Spread` ו־`Markout`

‏אחרי Fill אפשר לבדוק מה קרה למחיר מספר שניות אחר כך.

‏לדוגמה:

```text
Buy fill = 100.02
Mid after 5s = 99.98
```

‏קיבלנו Fill — אבל מיד לאחר מכן השוק זז נגדנו.

‏זה עשוי להעיד על `Adverse Selection`.

‏לכן עלות Execution אינה רק המחיר ששילמנו ברגע ה־Fill.

---

# ‏23. `Adverse Selection`

‏נניח שאנחנו שמים Buy Limit ב־Bid.

‏אנחנו מרוצים כשממלאים אותנו.

‏אבל למה מישהו הסכים למכור לנו עכשיו?

‏לפעמים משום שהשוק עומד לרדת.

‏כלומר:

> ‏Passive Fill יכול להיראות “זול”, אבל להיות Fill רע מבחינת המהלך שאחריו.

‏זו אחת מרזי המקצוע החשובים ב־Execution.

---

# ‏24. Maker / Taker Fees ו־Rebates

‏חלק מה־Venues משתמשים במודלים שבהם הוספת נזילות והסרת נזילות מתומחרות אחרת.

‏למשל רעיונית:

```text
Maker → rebate or lower fee
Taker → fee
```

‏אבל:

- ‏המודל משתנה בין Venues.
- ‏התעריפים משתנים.
- ‏הברוקר לא בהכרח מעביר אלינו כל Rebate.
- ‏Routing יכול לשנות את התוצאה.

‏לכן אין להניח `rebate = profit`.

---

# ‏25. Rebate אינו Edge

‏אם קיבלנו:

```text
+$0.002 per share rebate
```

‏אבל המחיר ירד:

```text
-$0.03 per share
```

‏לא ניצחנו.

‏ה־Execution Objective צריך להיות:

```text
maximize expected net trade value
```

‏לא:

```text
maximize rebate
```

---

# ‏26. Exchange Fees

‏בנוסף לעמלת הברוקר יכולים להיות:

```text
exchange fees
ECN fees
routing fees
clearing fees
```

‏התעריפים תלויים ב־Venue, ‏order type, ‏liquidity flag ותכנית התמחור.

‏לכן מערכת עלויות רצינית צריכה לקבל אותם כ־Configuration/Data ולא כקוד קשיח.

---

# ‏27. Regulatory Fees

‏בארה"ב קיימות גם עלויות רגולטוריות מסוימות, וחלקן עשויות לחול בעיקר בצד המכירה או לפי סוג העסקה.

‏המספרים עצמם יכולים להשתנות עם הזמן.

‏לכן נכון לשמור:

```text
regulatory_fee_schedule_version
valid_from
valid_to
source
```

‏ולא להעתיק מספר פעם אחת לתוך הקוד ולשכוח ממנו.

---

# ‏28. דוגמה אמיתית לחשיבות של Versioning

‏שיעור `SEC Section 31` משתנה מעת לעת.

‏לכן Backtest של 2024 ו־Live Trading של 2026 לא בהכרח צריכים להשתמש באותו שיעור.

‏אם אנחנו רוצים Backtest היסטורי מדויק, צריך להשתמש בתעריף שהיה תקף בזמן ההיסטורי.

---

# ‏29. Broker Pricing אינו אוניברסלי

‏גם אצל אותו Broker יכולים להיות:

```text
Fixed
Tiered
Lite / Pro
Introducing broker markup
country-specific entity
account-specific arrangement
```

‏לכן כאשר אומרים:

> ‏"IBKR עולה X"

‏זו בדרך כלל אמירה חלקית מדי.

‏צריך לדעת איזה חשבון, איזו ישות ואיזה Pricing Plan.

---

# ‏30. `Cost Model` צריך להיות Component עצמאי

‏ארכיטקטורה מומלצת:

```text
Signal
  ↓
Execution Simulator / Live Execution
  ↓
Fill(s)
  ↓
Cost Engine
  ↓
Gross PnL
  ↓
Net PnL
```

‏ה־Cost Engine לא צריך להיות מפוזר בתוך עשרות נוסחאות.

---

# ‏31. מה צריך להיכנס ל־`Cost Engine`

‏לפחות:

```text
broker commission
minimum commission
exchange / ECN fees
clearing fees
regulatory fees
maker/taker adjustments
spread cost
entry slippage
exit slippage
market impact
currency conversion if relevant
borrow cost if shorting
financing if relevant
```

‏לא כל רכיב יחול בכל אסטרטגיה.

---

# ‏32. `Cost Schedule`

‏לכל רכיב משתנה נשמור גרסה.

‏לדוגמה:

```text
CostSchedule
------------
provider
pricing_plan
valid_from
valid_to
commission_rule
minimum_order_fee
exchange_fee_table
regulatory_fee_table
currency
source_reference
version
```

---

# ‏33. לא לערבב עלויות קבועות עם אומדנים

‏יש הבדל בין:

```text
Commission = known
```

‏לבין:

```text
Future slippage = estimate
```

‏לכן כדאי לסווג:

```text
Observed Cost
Estimated Cost
Modeled Cost
```

---

# ‏34. `Expected Net Edge`

‏לפני כניסה נוכל לחשב:

```text
Expected Net Edge
=
Expected Gross Move
- Expected Entry Cost
- Expected Exit Cost
- Safety Margin
```

‏אם:

```text
Expected Gross Move = 18 bps
Expected Total Cost = 12 bps
```

‏נשאר:

```text
Expected Net Edge = 6 bps
```

‏זו תמונה שונה מאוד מ־18 bps.

---

# ‏35. `Break-Even Move`

‏אפשר לחשב:

```text
BreakEvenMove = TotalRoundTripCost
```

‏אם העלות הכוללת הצפויה היא:

```text
0.08%
```

‏אז כל תנועה קטנה מ־0.08% עדיין אינה רווחית נטו.

---

# ‏36. `Cost-to-Edge Ratio`

‏Feature/Metric שימושי למחקר:

```text
CostToEdgeRatio = ExpectedCost / ExpectedGrossEdge
```

‏לדוגמה:

```text
Expected gross edge = 20 bps
Expected cost       = 5 bps
ratio               = 25%
```

‏לעומת:

```text
Expected gross edge = 10 bps
Expected cost       = 8 bps
ratio               = 80%
```

‏השנייה הרבה יותר שברירית.

---

# ‏37. `Edge Buffer`

‏לא כדאי לעבוד בדיוק על Break-Even.

‏אם:

```text
Expected edge = 10 bps
Expected cost = 9 bps
```

‏תיאורטית יש 1 bps רווח.

‏מעשית כל טעות קטנה באומדן מוחקת אותו.

‏לכן אפשר לדרוש:

```text
ExpectedNetEdge > MinimumBuffer
```

‏את ה־Buffer עצמו צריך לאמת במחקר.

---

# ‏38. למה Average Cost אינו מספיק

‏נניח ממוצע Slippage:

```text
2 bps
```

‏אבל ההתפלגות היא:

```text
P50 = 1 bp
P90 = 8 bps
P99 = 25 bps
```

‏במערכת קצרה, הזנב הזה יכול למחוק הרבה עסקאות.

‏לכן נמדוד:

```text
P50
P75
P90
P95
P99
```

‏ולא רק Average.

---

# ‏39. Cost Distribution לפי מצב שוק

‏עלויות יכולות להשתנות לפי:

```text
market open
midday
close
high volatility
low volatility
news burst
wide spread regime
thin book regime
```

‏לכן Cost Model טוב יכול להיות Conditional.

---

# ‏40. Cost Distribution לפי מניה

‏גם שתי מניות עם Score זהה יכולות להיות שונות מאוד בעלויות.

‏למשל:

```text
AAA expected gross = 15 bps
cost = 3 bps
net = 12 bps

BBB expected gross = 22 bps
cost = 15 bps
net = 7 bps
```

‏למרות ש־BBB נראית חזקה יותר ברוטו, AAA עדיפה נטו.

---

# ‏41. Scanner צריך לחשוב Net, לא רק Execution Layer

‏טעות ארכיטקטונית:

```text
Scanner ranks gross momentum
Execution later pays whatever it costs
```

‏גישה טובה יותר:

```text
Scanner estimates opportunity
Cost model estimates friction
Decision engine evaluates expected net opportunity
```

---

# ‏42. אבל לא לערבב הכול ל־Feature אחד מוקדם מדי

‏עדיין כדאי לשמור בנפרד:

```text
prediction quality
execution quality
cost estimate
risk
```

‏ואז לחבר אותם בהחלטה.

‏אחרת קשה להבין למה Trade נכשל.

---

# ‏43. `Gross Alpha` מול `Executable Alpha`

‏אפשר לחשוב על שתי שכבות:

```text
Gross Alpha
=
כמה התנועה צפויה להיות
```

```text
Executable Alpha
=
כמה צפוי להישאר אחרי חיכוך מציאותי
```

‏לרובוט אמיתי, השני הוא מה שקובע.

---

# ‏44. דוגמה מלאה

‏נניח:

```text
Capital used = $5,000
Entry = $50.00
Shares = 100
```

‏המניה עולה ל־:

```text
$50.08
```

‏Gross:

```text
$0.08 × 100 = $8.00
```

‏אבל:

```text
Entry commission   = $0.35
Exit commission    = $0.35
Spread/slippage    = $2.50
Other fees         = $0.20
```

‏אז:

```text
Net PnL = 8.00 - 0.35 - 0.35 - 2.50 - 0.20
        = $4.60
```

‏Gross של $8 הפך ל־Net של $4.60.

---

# ‏45. דוגמה שבה Trade “מנצח” אבל מפסיד נטו

```text
Gross PnL = +$1.20
Total costs = $1.60
```

‏אז:

```text
Net PnL = -$0.40
```

‏המחיר הלך בכיוון שחזינו.

‏אבל האסטרטגיה הפסידה כסף.

---

# ‏46. לכן Label של מחקר צריך להיות Net-aware

‏במקום רק:

```text
Did price rise after signal?
```

‏אפשר לבדוק:

```text
Was executable net return positive after realistic costs?
```

‏זה Label הרבה יותר קרוב למטרה האמיתית.

---

# ‏47. `Net Forward Return`

‏לדוגמה:

```text
forward_10s_gross_return
forward_10s_expected_cost
forward_10s_net_return
```

‏ואותו דבר ל־:

```text
1s
2s
5s
10s
30s
60s
```

‏כך נראה באיזה Horizon ה־Edge באמת חי.

---

# ‏48. `Net MFE`

‏גם `MFE` צריך לעבור דרך Cost Model.

‏Gross MFE יכול להיות:

```text
+15 bps
```

‏אבל אם Round Trip Cost היה 10 bps:

```text
Net MFE ≈ +5 bps
```

‏הבדל משמעותי.

---

# ‏49. `Time to Net Profit`

‏למסחר שלך כדאי למדוד:

```text
time_to_first_gross_profit
```

‏אבל גם:

```text
time_to_first_net_profit
```

‏כי המחיר יכול לעלות מעט מיד, ועדיין לא לכסות את עלות הכניסה/יציאה.

---

# ‏50. `Time to Break Even`

‏Metric חשוב:

```text
time_to_break_even_after_costs
```

‏אם רוב העסקאות צריכות 45 שניות רק כדי לכסות עלויות, זה מידע חשוב מאוד לאסטרטגיה שמנסה להרוויח בתוך שניות.

---

# ‏51. Cost-aware Take Profit

‏`Take Profit` לא צריך להיות רק:

```text
entry + X%
```

‏צריך להבין:

```text
net_target
+
expected_exit_cost
```

‏אם רוצים רווח נטו מסוים, המחיר צריך לנוע מספיק כדי לכסות גם את היציאה.

---

# ‏52. Cost-aware Stop

‏גם Stop צריך להסתכל על עלויות.

‏הפסד ברוטו של:

```text
-$3
```

‏יכול להפוך ל־:

```text
-$4.50 net
```

‏אחרי חיכוך.

‏Risk Model צריך לעבוד על Net Loss Distribution.

---

# ‏53. Frequent Trading Amplifies Costs

‏אם עסקה אחת עולה מעט, זה נראה זניח.

‏אבל אם יש מאות עסקאות:

```text
cost_per_trade × number_of_trades
```

‏יכול להפוך לסכום גדול מאוד.

‏לכן תדירות גבוהה אינה יתרון בפני עצמה.

---

# ‏54. `Turnover`

‏`Turnover` מודד כמה הון עובר דרך עסקאות שוב ושוב.

‏מערכת שמגלגלת אותו הון מאות פעמים ביום יכולה לשלם עלויות ביחס לסכום עסקאות מצטבר גדול בהרבה מההון בחשבון.

‏זה אחד המקומות שבהם Strategy עם Edge קטן עלולה להישחק.

---

# ‏55. `Cost per Trade` מול `Cost per Dollar Traded`

‏נשמור כמה מדדים:

```text
cost_usd
cost_bps
cost_per_share
cost_per_$1000_traded
```

‏כל אחד מספר משהו אחר.

---

# ‏56. `Cost per Winner` ו־`Cost per Loser`

‏מעניין לבדוק אם עלויות גבוהות יותר דווקא בעסקאות מפסידות.

‏למשל:

```text
winning trades average slippage = 2 bps
losing trades average slippage  = 9 bps
```

‏זה יכול להעיד ש־Execution עצמו מזהה מאוחר מדי שוק שנע נגדנו.

---

# ‏57. Cost Decomposition לכל Trade

‏לכל עסקה נשמור:

```text
trade_id
symbol
quantity
signal_price
entry_fill_vwap
exit_fill_vwap
entry_commission
exit_commission
exchange_fees
regulatory_fees
entry_slippage
exit_slippage
estimated_spread_cost
market_impact_estimate
gross_pnl
net_pnl
```

‏כך אפשר לבצע RCA אמיתי.

---

# ‏58. Cost Attribution

‏נרצה לדעת:

```text
How much edge lost to latency?
How much to spread?
How much to slippage?
How much to fees?
How much to exit delay?
```

‏במקום להגיד:

> ‏"העסקה פשוט לא עבדה."

---

# ‏59. `Theoretical PnL` מול `Executable PnL`

‏אפשר לשמור שלוש שכבות:

```text
Theoretical PnL
Executable Gross PnL
Executable Net PnL
```

‏לדוגמה:

```text
Theoretical using Last = +$10
Using realistic Bid/Ask = +$7
After all costs = +$4
```

‏כך יודעים בדיוק איפה נעלם הכסף.

---

# ‏60. Backtest צריך Cost Model זהה ככל האפשר ל־Live

‏אם Backtest מניח:

```text
fills at Last
zero commissions
zero slippage
```

‏וה־Live משתמש:

```text
Bid/Ask
real commissions
real latency
partial fills
```

‏אנחנו בודקים שתי אסטרטגיות שונות.

---

# ‏61. Calibration מ־Live Data

‏לאחר Paper/Live אפשר למדוד:

```text
actual_slippage_distribution
actual_fill_rate
actual_commission
actual_exchange_fees
actual_time_to_fill
```

‏ואז להזין אותם חזרה ל־Backtest.

‏זה הופך את הסימולציה בהדרגה ליותר מציאותית.

---

# ‏62. `Shadow Cost Model`

‏אפשר להריץ כמה מודלים במקביל בלי להשפיע על מסחר אמיתי:

```text
model_A = optimistic
model_B = observed median
model_C = conservative P90
```

‏ואז לראות כמה האסטרטגיה רגישה לעלות.

---

# ‏63. Cost Stress Test

‏נבדוק:

```text
cost × 1.0
cost × 1.25
cost × 1.5
cost × 2.0
```

‏אם האסטרטגיה קורסת כבר ב־+10% Slippage, היא כנראה שברירית מדי.

---

# ‏64. `Break-Even Cost`

‏שאלה חזקה:

> ‏כמה עלויות האסטרטגיה מסוגלת לספוג לפני שה־EV שלה הופך לאפס?

‏זה נקרא כאן רעיונית:

```text
BreakEvenCost
```

‏ככל שהמרחק בין Actual Cost ל־BreakEvenCost גדול יותר, האסטרטגיה עמידה יותר.

---

# ‏65. `Cost Headroom`

```text
CostHeadroom = BreakEvenCost - ExpectedActualCost
```

‏זה נותן מדד ל־Margin of Safety מול טעויות באומדן.

---

# ‏66. מה זה אומר במיוחד למסחר שלך

‏אצלך אנחנו מצפים:

```text
small target
very short holding time
many possible decisions
potentially frequent trades
```

‏לכן ארבעה דברים מקבלים חשיבות חריגה:

1. ‏Spread.
2. ‏Slippage.
3. ‏Time-to-fill.
4. ‏Opportunity cost של Passive Entry.

‏עמלה חשובה — אבל לפעמים אינה אפילו העלות הגדולה ביותר.

---

# ‏67. לא לרדוף אחרי “עמלה אפס”

‏ברוקר עם:

```text
$0 commission
```

‏לא בהכרח נותן את העלות הכוללת הנמוכה ביותר.

‏ייתכן שיהיו הבדלים ב־:

```text
execution quality
routing
spread capture
price improvement
fill probability
market data quality
```

‏צריך למדוד `Total Cost`, לא כותרת שיווקית.

---

# ‏68. `Price Improvement`

‏לפעמים Fill מתקבל במחיר טוב יותר מה־Quote שציפינו לו.

‏זה יכול להקטין Effective Cost.

‏גם את זה צריך למדוד בפועל ולא להניח מראש.

---

# ‏69. עלות Data ו־Infrastructure

‏יש גם עלויות שאינן per-trade:

```text
market data subscription
server / cloud
VPS
logging/storage
monitoring
data archive
software subscription
```

‏אם המערכת אישית, העלויות האלה עשויות להיות קטנות — אבל הן עדיין חלק מכלכלת המערכת.

---

# ‏70. `Fixed Costs` מול `Variable Costs`

‏`Fixed Costs`:

```text
monthly data subscription
VPS
software
```

‏`Variable Costs`:

```text
commission
exchange fees
slippage
spread
```

‏כדי להבין רווחיות חודשית אמיתית צריך את שניהם.

---

# ‏71. Currency Conversion

‏אם ההון, הדוחות או ההפקדות נעשים במטבע אחר מהנכס, ייתכנו:

```text
FX conversion cost
spread on FX
conversion commission
```

‏זה לא בהכרח עלות לכל Trade, אבל יכול להשפיע על הרווח האמיתי בחשבון.

---

# ‏72. מסים אינם Execution Cost

‏מס הוא נושא נפרד מעלות ביצוע.

‏מבחינה אנליטית כדאי להפריד:

```text
Trading Net PnL before tax
Tax impact
After-tax result
```

‏כך לא מערבבים איכות Strategy עם מבנה מס אישי.

---

# ‏73. רז מקצוע: אל תייעל Commission לפני שאתה מודד Slippage

‏קל לראות Commission בדוח.

‏קשה יותר לראות Slippage.

‏לכן אנשים נוטים להתמקד בעמלה שנראית לעין.

‏אבל באסטרטגיה מהירה ייתכן ש־Slippage ו־Spread חשובים הרבה יותר.

---

# ‏74. רז מקצוע: Fill זול אינו בהכרח Fill טוב

‏אם חיכינו Passive וקיבלנו מחיר טוב — אבל עד אז ה־Signal הזדקן — ייתכן שחסכנו סנט והפסדנו את ה־Edge.

‏לכן צריך למדוד:

```text
execution price quality
+
signal quality at fill time
```

---

# ‏75. רז מקצוע: Cost Model צריך להיות Conservative בתחילת הדרך

‏בשלב מחקר עדיף לעיתים להניח עלות מעט מחמירה מאשר מודל אופטימי מדי.

‏אם האסטרטגיה עובדת רק תחת הנחות ביצוע מושלמות, זו אזהרה.

---

# ‏76. רז מקצוע: אבל גם לא להעניש בצורה לא מציאותית

‏גם מודל שמניח Slippage עצום בכל Trade יכול לפסול Strategy טובה.

‏המטרה היא:

> ‏Realistic, measured, regime-aware cost model.

‏לא אופטימיות ולא פסימיות שרירותית.

---

# ‏77. Best Practice — Source of Truth לעלויות

‏נשמור טבלה/קובץ רשמי עם:

```text
broker
account entity
pricing plan
fee type
formula
valid_from
valid_to
source URL / document
verified_at
```

‏כך שינוי עמלה לא עובר מתחת לרדאר.

---

# ‏78. Best Practice — הפרדת `Observed` ו־`Modeled`

‏ב־Live:

```text
Observed commission
Observed fills
Observed fees
```

‏ב־Research:

```text
Modeled slippage
Modeled market impact
Modeled fill probability
```

‏אסור לערבב ביניהם בלי סימון.

---

# ‏79. Best Practice — תמיד Round Trip

‏כל בדיקת רווחיות קצרה צריכה לחשוב:

```text
Entry + Exit
```

‏ולא רק כמה עולה להיכנס.

---

# ‏80. Best Practice — Cost-aware Ranking

‏בשלב מתקדם אפשר להשוות מועמדות לפי:

```text
ExpectedNetEdge
```

‏ולא רק:

```text
ExpectedGrossMove
```

‏אבל עדיין נשמור את שני הערכים בנפרד לצורכי הסבר ו־RCA.

---

# ‏81. Best Practice — Cost Dashboard

‏נרצה לראות לאורך זמן:

```text
avg commission/trade
avg spread cost
avg entry slippage
avg exit slippage
P95 slippage
avg total cost bps
cost by symbol
cost by hour
cost by execution mode
cost by venue
cost by winner/loser
```

---

# ‏82. Best Practice — Alert על Cost Drift

‏אם בדרך כלל:

```text
avg cost = 5 bps
```

‏ופתאום:

```text
avg cost = 14 bps
```

‏צריך Alert.

‏זה יכול להעיד על:

```text
wider market spreads
provider issue
routing change
broker issue
strategy entering worse symbols
new market regime
```

---

# ‏83. Anti-pattern — `Last-to-Last PnL`

‏Backtest שאומר:

```text
buy at Last
sell at Last
```

‏בלי Bid/Ask ובלי Fill Model עלול להיות אופטימי בצורה חמורה.

---

# ‏84. Anti-pattern — עמלה אחת קבועה לנצח

‏Fees משתנים.

‏Pricing plans משתנים.

‏Account arrangements משתנים.

‏צריך Versioning.

---

# ‏85. Anti-pattern — לא לשמור עלויות לכל Trade

‏אם נשמור רק:

```text
net_pnl
```

‏לא נדע אם הבעיה הייתה:

```text
bad prediction
bad entry
bad exit
high spread
high slippage
fees
```

---

# ‏86. Anti-pattern — לבחור Strategy לפי Gross Return

‏שתי אסטרטגיות:

```text
A gross = +20 bps, cost = 15 bps, net = 5 bps
B gross = +12 bps, cost = 3 bps,  net = 9 bps
```

‏B עדיפה כלכלית למרות שה־Gross שלה קטן יותר.

---

# ‏87. Cost-aware RCA

‏כאשר Trade נכשל, נשאל בסדר:

```text
1. Did prediction fail?
2. Was entry too late?
3. Was spread too wide?
4. Was slippage abnormal?
5. Did order wait too long?
6. Did exit execution destroy remaining edge?
7. Were fees modeled correctly?
```

‏כך לא “מתקנים את ה־Scanner” כאשר הבעיה בכלל הייתה Execution.

---

# ‏88. Cost-aware Scanner RCA

‏גם ההפך נכון.

‏אם Execution היה מצוין אבל:

```text
forward gross move ≈ 0
```

‏הבעיה אינה Commission.

‏ה־Scanner פשוט בחר מניה שלא המשיכה.

‏זו בדיוק ההפרדה שאנחנו רוצים לשמור לאורך כל המערכת.

---

# ‏89. מסגרת עבודה למחקר

‏לכל Candidate נחשב:

```text
ExpectedGrossMove
ExpectedEntryCost
ExpectedExitCost
ExpectedNetEdge
CostToEdgeRatio
BreakEvenMove
CostHeadroom
```

‏ואז נבדוק מה מהם באמת מנבא Net PnL.

---

# ‏90. מסגרת עבודה ל־Live

‏לכל Trade נשמור:

```text
ExpectedCostAtDecision
ActualCostAfterClose
CostError
```

‏כך אפשר לשפר את Cost Model עצמו.

---

# ‏91. `Cost Prediction Error`

```text
CostPredictionError
=
ActualCost - ExpectedCost
```

‏אם הוא חיובי באופן עקבי, המודל אופטימי מדי.

‏אם שלילי מאוד, המודל אולי שמרני מדי.

---

# ‏92. Calibration לפי Percentiles

‏אפשר לבנות:

```text
Expected cost P50
Expected cost P75
Expected cost P90
```

‏ואז לבחור Safety Level לפי מצב האסטרטגיה.

---

# ‏93. שילוב עם `Trade / No Trade`

‏לפני Trade:

```text
if ExpectedNetEdge <= 0
    NO TRADE
```

‏אבל במערכת אמיתית נרצה Margin נוסף:

```text
if ExpectedNetEdge < MinimumRequiredNetEdge
    NO TRADE
```

‏את הסף צריך ללמוד מהנתונים, לא לנחש.

---

# ‏94. שילוב עם Entry Mode

‏אם Edge גדול יחסית לעלות:

```text
more aggressive execution may be justified
```

‏אם Edge קטן מאוד:

```text
crossing spread may destroy it
```

‏כלומר Cost Model יכול להשפיע על Execution Urgency.

---

# ‏95. שילוב עם Exit

‏אם נותר Expected Upside קטן מעל העלות הצפויה ליציאה, ייתכן שאין טעם להמשיך להחזיק.

‏כלומר גם Exit Engine יכול להיות Cost-aware.

---

# ‏96. מה לא נעשה עדיין

‏בשלב הזה אנחנו לא קובעים:

```text
"העמלה שלנו תהיה בדיוק X"
"Slippage תמיד Y"
"Target תמיד Z"
```

‏אנחנו בונים את השפה והארכיטקטורה שמאפשרות למדוד אותם נכון.

---

# ‏97. Checklist למחקר

‏לפני שמאמינים לתוצאה של Backtest:

- ‏האם חושב Round Trip?
- ‏האם Entry ו־Exit משתמשים במחיר בר־ביצוע?
- ‏האם Spread כלול?
- ‏האם Slippage כלול?
- ‏האם Partial Fills מטופלים?
- ‏האם עמלה כוללת Minimum?
- ‏האם Fee Schedule מתאים לתאריך?
- ‏האם העלות משתנה לפי Liquidity/Regime?
- ‏האם נבדק Stress Test?
- ‏האם התוצאה עדיין חיובית Net?

---

# ‏98. Checklist ל־Live

‏לכל Trade:

- ‏האם נשמר `decision_price`?
- ‏האם נשמר כל Fill?
- ‏האם נשמר VWAP?
- ‏האם נשמרה Commission אמיתית?
- ‏האם נשמרו Fees?
- ‏האם חושב Entry Slippage?
- ‏האם חושב Exit Slippage?
- ‏האם חושב Net PnL?
- ‏האם העלות הושוותה לתחזית?
- ‏האם חריגה יוצרת Alert?

---

# ‏99. המודל המנטלי הנכון

‏אל תחשוב:

```text
המניה עלתה 0.10%, אז הרווחתי 0.10%
```

‏תחשוב:

```text
Observed market move
- inability to enter at signal price
- entry friction
- exit friction
- explicit fees
= executable net result
```

---

# ‏100. סיכום

‏מהפרק הזה צריך לזכור:

1. ‏`Gross PnL` אינו `Net PnL`.
2. ‏יש עלויות גלויות ועלויות סמויות.
3. ‏Spread ו־Slippage יכולים להיות חשובים יותר מהעמלה.
4. ‏צריך לחשב Round Trip מלא.
5. ‏Fee schedules משתנים ולכן צריכים Versioning.
6. ‏Backtest חייב להשתמש ב־Cost Model מציאותי.
7. ‏יש למדוד Distribution של עלויות ולא רק Average.
8. ‏ה־Scanner צריך להיבחן לפי `Executable Net Edge`.
9. ‏צריך לשמור Cost Decomposition לכל Trade.
10. ‏במסחר של שניות, אפילו כמה bps יכולים להכריע אם יש Strategy או אשליה.

---

# ‏תרגיל מחשבתי

‏נניח ששתי מניות קיבלו אותו Score:

```text
AAA expected move = +12 bps
AAA expected round-trip cost = 3 bps

BBB expected move = +20 bps
BBB expected round-trip cost = 15 bps
```

‏אל תשאל רק:

> ‏מי צפויה לעלות יותר?

‏שאל:

> ‏איפה נשאר יותר `Net Edge` אחרי שהופכים תחזית לעסקה אמיתית?

‏זו השאלה הכלכלית שהרובוט צריך ללמוד לענות עליה.
