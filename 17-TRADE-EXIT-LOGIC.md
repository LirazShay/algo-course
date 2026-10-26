# ‏שלב 17 — יציאה מעסקה: איך לסגור מהר, עקבי ובצורה שתואמת את ה־Thesis

> ‏מטרת הפרק: להבין איך מתכננים יציאה מעסקה בצורה מקצועית — לא רק `Take Profit` ו־`Stop Loss`, אלא מערכת מלאה שמחליטה מתי הסיבה לכניסה כבר התממשה, נכשלה או פשוט פגה בזמן.
>
> ‏כמו בכל הקורס: קודם נלמד את הידע הכללי, אחר כך את רזי המקצוע וה־Best Practices, ולבסוף נתאים אותו לרובוט שלך — אסטרטגיה שמצפה לתגובה מהירה מאוד ומחזיקה שניות בודדות ועד בערך דקה.

---

# ‏1. למה Exit הוא חלק מהאסטרטגיה ולא פעולה טכנית

‏טעות נפוצה היא לחשוב:

```text
ה־Scanner בוחר מניה
ה־Entry קונה
וה־Exit פשוט מוכר ברווח או בהפסד
```

‏בפועל:

> ‏ה־Exit קובע במידה רבה איזה סוג Edge אתה בכלל מנסה ללכוד.

‏אותו Entry עם Exit שונה יכול להפוך למערכת אחרת לחלוטין.

‏לדוגמה:

```text
Entry זהה
Exit A: אחרי 2 שניות
Exit B: אחרי 60 שניות
Exit C: רק ב־+1%
Exit D: כשהמומנטום נחלש
```

‏אלה ארבע אסטרטגיות שונות מבחינת התפלגות תוצאות, עלויות, סיכון ויכולת מימוש.

---

# ‏2. שלוש שאלות שכל Exit צריך לענות עליהן

1. ‏מה נחשב הצלחה?
2. ‏מה נחשב כישלון?
3. ‏מתי אנחנו מפסיקים לחכות?

‏שלוש השאלות האלה יוצרות בדרך כלל שלוש משפחות:

```text
Profit Exit
Risk Exit
Time / Thesis Exit
```

---

# ‏3. `Take Profit`

‏`Take Profit` הוא יעד רווח מוגדר מראש.

‏למשל:

```text
Entry = 50.00
Target = 50.08
```

‏אם המחיר מגיע ליעד, יוצאים.

‏הרעיון פשוט, אבל הבחירה ביעד אינה פשוטה.

‏יעד קטן מדי יכול:

- ‏להגדיל Win Rate.
- ‏אבל להיחתך חזק על ידי Spread, Slippage ועמלות.

‏יעד גדול מדי יכול:

- ‏לתת יותר רווח לעסקה מוצלחת.
- ‏אבל להקטין מאוד את אחוז העסקאות שמגיעות אליו בזמן.

---

# ‏4. יעד באחוזים מול יעד בסנטים

‏אפשר להגדיר:

```text
+0.10%
```

‏או:

```text
+$0.05 per share
```

‏לרוב, אחוזים מאפשרים השוואה טובה יותר בין מניות במחירים שונים.

‏אבל כאשר Tick Size, Spread וגודל הפוזיציה חשובים, גם סנטים למניה יכולים להיות שימושיים.

---

# ‏5. יעד Gross אינו יעד Net

‏נניח:

```text
Gross move = +0.10%
Round-trip friction = 0.07%
```

‏נשאר:

```text
Net ≈ +0.03%
```

‏לכן יעד ה־Exit חייב להיבדק מול:

- ‏Entry slippage.
- ‏Exit slippage.
- ‏Spread.
- ‏Commission.
- ‏Exchange/regulatory fees.
- ‏Routing fees/rebates אם יש.

‏היעד האמיתי הוא:

```text
Net P&L
```

‏לא רק כמה המחיר זז.

---

# ‏6. `Stop Loss`

‏`Stop Loss` אומר:

> ‏אם העסקה זזה נגדנו מעבר לרמה מסוימת — מפסיקים את הניסוי.

‏לדוגמה:

```text
Entry = 100.00
Stop = 99.85
```

‏המטרה אינה “למנוע הפסד”.

‏אין מנגנון שמבטיח זאת.

‏המטרה היא להגביל את משך החשיפה או את גודל הנזק בתרחיש שהמודל טעה.

---

# ‏7. Stop Price אינו בהכרח Fill Price

‏חשוב להבין את ההבדל:

```text
Trigger condition
```

‏מול:

```text
Actual execution price
```

‏בשוק מהיר, המחיר יכול לעבור מהר דרך הרמה.

‏לכן Backtest שמניח:

```text
Stop triggered at 99.90
Fill exactly at 99.90
```

‏עלול להיות אופטימי מדי.

---

# ‏8. `Stop Market` מול `Stop Limit`

## ‏`Stop Market`

‏כשה־trigger מופעל, המטרה היא לצאת מהר יחסית.

‏יתרון:

- ‏עדיפות ליציאה.

‏חיסרון:

- ‏מחיר הביצוע אינו מובטח.

## ‏`Stop Limit`

‏לאחר ה־trigger נוצרת פקודת Limit.

‏יתרון:

- ‏שליטה טובה יותר במחיר המינימלי/מקסימלי שאתה מוכן לקבל.

‏חיסרון קריטי:

- ‏ייתכן שלא תצא בכלל אם השוק בורח מעבר למחיר ה־Limit.

‏זו דוגמה קלאסית ל־trade-off:

```text
Price certainty vs Execution certainty
```

---

# ‏9. `Time Stop`

‏`Time Stop` הוא כלל שאומר:

> ‏אם העסקה לא עשתה את מה שציפינו בתוך פרק זמן מסוים — יוצאים.

‏לדוגמה:

```text
Max holding time = 30s
```

‏אפילו אם:

```text
PnL = +0.01%
```

‏או:

```text
PnL = -0.02%
```

‏העסקה נסגרת כי הזמן עצמו הפך לחלק מה־Thesis.

---

# ‏10. למה Time Stop חשוב במיוחד במסחר שלך

‏ה־Thesis שלך בקירוב הוא:

> ‏המניה שדורגה הכי טוב אמורה להמשיך כמעט מיד.

‏אם עברו:

```text
5s
10s
20s
```

‏והמשך התנועה לא הופיע, זו אינפורמציה.

‏הבעיה אינה רק:

```text
"עוד לא הרווחנו"
```

‏אלא אולי:

```text
"המודל שבחר אותה כבר אינו נכון ברגע הזה"
```

‏לכן אצלך `Time Stop` אינו רק Risk Control.

‏הוא יכול להיות חלק מה־Signal Logic עצמו.

---

# ‏11. `Signal Exit`

‏אפשר לצאת לא בגלל מחיר או זמן, אלא כי האות שהכניס אותנו נעלם.

‏לדוגמה:

```text
Momentum score drops sharply
Acceleration turns negative
Rank falls from #1 to #200
Spread widens
Activity collapses
```

‏כלומר:

> ‏אם הסיבה לכניסה כבר אינה קיימת — למה להישאר?

---

# ‏12. `Thesis Exit`

‏מונח שימושי יותר הוא:

`Thesis Exit`

‏כלומר:

> ‏אנחנו יוצאים כאשר ההנחה שבגללה פתחנו את העסקה אינה נכונה עוד.

‏זו יכולה להיות:

- ‏שבירת Momentum.
- ‏ירידה בפעילות.
- ‏היעלמות Liquidity.
- ‏היפוך Order Flow.
- ‏התרחבות חריגה של Spread.
- ‏Candidate חדש שמציג Edge גבוה משמעותית.

---

# ‏13. `Trailing Stop`

‏`Trailing Stop` עוקב אחרי המחיר כשהוא מתקדם לטובתנו.

‏לדוגמה:

```text
Entry = 50.00
Price rises to 50.20
Trail = 0.10
Exit if price falls to 50.10
```

‏המטרה:

> ‏לאפשר לרווח לרוץ, אבל להגן על חלק ממנו כאשר המהלך מתחיל להתהפך.

---

# ‏14. למה Trailing Stop יכול להיות בעייתי בטווח של שניות

‏במסחר מהיר מאוד יש הרבה micro-noise.

‏Trail הדוק מדי יכול:

```text
Exit on noise
```

‏Trail רחב מדי יכול:

```text
give back most of the small edge
```

‏לכן אצלך Trail אינו “ברירת מחדל טובה”.

‏צריך לבדוק אותו אמפירית מול:

- ‏Fixed target.
- ‏Time stop.
- ‏Signal exit.
- ‏Hybrid exit.

---

# ‏15. `Break-Even Stop`

‏רעיון נפוץ:

> ‏אחרי שהעסקה זזה מספיק לטובתנו, מזיזים את רמת היציאה לאזור Entry.

‏זה נשמע בטוח.

‏אבל חשוב להבין:

```text
Break-even price ≠ true break-even
```

‏כי יש:

- ‏Spread.
- ‏Slippage.
- ‏עמלות.

‏לכן True Break-Even צריך להיות מחושב ב־Net terms.

---

# ‏16. `Profit Lock`

‏במקום Break-Even אפשר להגדיר:

```text
Once MFE >= X
protect at least Y
```

‏למשל:

```text
If trade reaches +0.20%
Do not allow realized result below +0.05% net target
```

‏זו משפחה כללית של:

`Profit Protection Logic`

---

# ‏17. `MFE` ו־`MAE`

‏שני מדדים חשובים מאוד ל־Exit research:

## ‏`MFE` — Maximum Favorable Excursion

‏כמה העסקה הייתה הכי הרבה ברווח במהלך חייה.

## ‏`MAE` — Maximum Adverse Excursion

‏כמה העסקה הייתה הכי הרבה בהפסד במהלך חייה.

‏לדוגמה:

```text
Final PnL = +0.03%
MFE       = +0.28%
MAE       = -0.04%
```

‏העסקה אמנם הסתיימה כמעט ללא רווח, אבל הייתה הזדמנות לנעול הרבה יותר.

‏זה מידע חשוב לשיפור Exit.

---

# ‏18. Exit Efficiency

‏אפשר להגדיר מדד רעיוני:

```text
Exit Efficiency = Realized Profit / MFE
```

‏לדוגמה:

```text
MFE = +0.30%
Realized = +0.06%
```

‏הצלחנו לממש רק חלק קטן מהמהלך האפשרי.

‏אבל גם כאן צריך זהירות:

> ‏אי אפשר לדעת בזמן אמת מה יהיה ה־MFE העתידי.

‏לכן זה מדד מחקר בדיעבד — לא Feature שמשתמש בעתיד.

---

# ‏19. `Time to MFE`

‏לא מספיק לדעת כמה המחיר עלה.

‏חשוב גם לדעת מתי.

‏לדוגמה:

```text
Trade A: MFE +0.20% after 3s
Trade B: MFE +0.20% after 48s
```

‏לרובוט שלך אלה אירועים שונים לחלוטין.

‏אפשר למדוד:

```text
time_to_mfe
```

‏וגם:

```text
time_to_first_profit
time_to_target
```

---

# ‏20. `No Progress Exit`

‏זה Exit שימושי במיוחד לרובוט שלך.

‏הרעיון:

> ‏לא מספיק שהעסקה לא הפסידה. היא צריכה להתקדם.

‏לדוגמה:

```text
After 8s:
MFE < +0.03%
```

‏ייתכן שנחליט שהעסקה “מתה”.

‏זה שונה מ־Stop Loss.

‏היא לא בהכרח שלילית.

‏פשוט לא עושה את מה שהמודל ציפה.

---

# ‏21. `Stagnation Exit`

‏אפשר להגדיר מצב:

```text
price stays within tiny range
activity drops
momentum disappears
```

‏ואז לצאת בגלל קיפאון.

‏במערכת קצרה מאוד, זמן הון הוא משאב.

‏פוזיציה תקועה גם מונעת מעבר להזדמנות חדשה.

---

# ‏22. Opportunity Cost של להישאר בפוזיציה

‏נניח שאתה מחזיק `AAA`.

‏היא שטוחה.

‏בינתיים `BBB` הופכת למועמדת #1 חזקה בהרבה.

‏העלות של להישאר ב־`AAA` אינה רק PnL אפס.

‏יש גם:

```text
Opportunity Cost
```

‏כלומר:

> ‏הזדמנות אחרת שאי אפשר לקחת כי ההון או מנגנון המסחר עסוקים.

---

# ‏23. `Replacement Exit`

‏אפשר לחקור כלל:

> ‏אם Candidate חדש מציג Edge צפוי גבוה משמעותית מהפוזיציה הקיימת, לצאת ולהחליף.

‏אבל זה מסוכן אם עושים זאת בצורה נאיבית.

‏כי Frequent switching יוצר:

- ‏עוד Spread.
- ‏עוד Slippage.
- ‏עוד Commission.
- ‏יותר Churn.
- ‏יותר Noise Trading.

‏לכן צריך להשוות:

```text
Expected benefit of switching
>
Round-trip switching cost + safety margin
```

---

# ‏24. Exit אינו חייב להיות כלל אחד

‏אפשר להשתמש במערכת משולבת:

```text
Take Profit
OR Stop Loss
OR Time Stop
OR Signal Failure
OR Emergency Exit
```

‏הראשון שמופעל סוגר את העסקה.

‏זה נקרא לעיתים:

`Competing Exit Conditions`

---

# ‏25. Priority בין Exit Conditions

‏אם כמה תנאים מופיעים כמעט יחד, צריך לדעת מי חזק יותר.

‏לדוגמה:

```text
Emergency risk exit
> Broker/system exit
> Hard stop
> Signal exit
> Time stop
> Profit optimization
```

‏אין סדר אוניברסלי שחייב להיות נכון.

‏אבל צריך סדר מפורש ודטרמיניסטי.

---

# ‏26. `Bracket Order`

‏`Bracket` מחבר בדרך כלל:

```text
Entry
Take Profit
Stop Loss
```

‏כאשר צד אחד של ה־Exit מבוצע, הצד האחר אמור להתבטל בהתאם למנגנון הברוקר/הפקודה.

‏הרעיון המרכזי:

> ‏כבר בזמן הכניסה אפשר לתכנן מנגנון יציאה מגן.

‏אבל חייבים להבין מי מנהל את הלוגיקה:

```text
Exchange?
Broker?
Client application?
```

‏כי ההתנהגות בזמן disconnect יכולה להשתנות.

---

# ‏27. `OCO` / `OCA`

‏`One Cancels Other` / `One Cancels All` מאפשרים לקשור כמה פקודות כך שביצוע אחת מבטל אחרות.

‏זה שימושי למשל עבור:

```text
Take Profit + Stop
```

‏אבל צריך לבדוק אצל הברוקר בפועל:

- ‏האם המנגנון Native או Simulated.
- ‏מה קורה ב־Partial Fill.
- ‏מה קורה אם יש disconnect.
- ‏מה קורה אם אחת הפקודות נדחית.

---

# ‏28. Exit מיד לאחר Entry Fill

‏במערכת שלך ייתכן שנרצה:

```text
Entry Fill
→ immediately arm exit logic
```

‏ולא:

```text
Entry Fill
→ wait for next scanner cycle
→ then create exit
```

‏כי גם שניות בודדות של gap יכולות להיות משמעותיות.

---

# ‏29. אבל לא ליצור Exit לפני שיודעים את הכמות האמיתית

‏אם ביקשת:

```text
100 shares
```

‏וקיבלת:

```text
37 shares filled
```

‏אסור להניח שיש לך 100.

‏Exit quantity חייב להיות מבוסס על:

```text
Actual position
```

‏ולא רק:

```text
Requested order quantity
```

---

# ‏30. Partial Fill בכניסה יוצר Exit מורכב יותר

‏לדוגמה:

```text
Requested = 100
Filled = 40
Remaining = 60
```

‏עכשיו יש שתי החלטות:

1. ‏האם להמשיך לנסות להשלים את ה־Entry?
2. ‏איך להגן על 40 המניות שכבר קיימות?

‏אסור לחכות לפתרון של שאלה 1 לפני שמכירים בכך שכבר קיימת פוזיציה אמיתית.

---

# ‏31. Partial Fill ביציאה

‏גם Exit יכול להיות חלקי.

‏לדוגמה:

```text
Position = 100
Sell fill = 35
Remaining = 65
```

‏המערכת עדיין בפוזיציה.

‏לכן:

```text
Exit submitted
```

‏אינו:

```text
Position closed
```

---

# ‏32. Exit State Machine

‏מודל פשוט:

```text
POSITION_OPEN
    ↓
EXIT_DECISION
    ↓
EXIT_SUBMITTED
    ↓
PARTIALLY_EXITED
    ↓
EXITED
```

‏ומצבים חריגים:

```text
EXIT_REJECTED
EXIT_UNKNOWN
BROKER_DISCONNECTED
HALTED
```

---

# ‏33. `Position Truth`

‏מקור האמת ל־Exit הוא לא רק הזיכרון המקומי של האפליקציה.

‏צריך ליישב בין:

```text
Local State
Broker Orders
Broker Executions
Broker Positions
```

‏במיוחד אחרי reconnect או restart.

---

# ‏34. `Exit Intent`

‏כדאי לשמור אובייקט מפורש שמתאר למה אנחנו יוצאים.

‏לדוגמה:

```text
exitReason
exitTriggerTime
referencePrice
positionQty
expectedNetPnL
urgency
strategyVersion
```

‏כך אפשר אחר כך לבצע RCA אמיתי.

---

# ‏35. Exit Reasons צריכים להיות קודיים ולא טקסט חופשי בלבד

‏למשל:

```text
TAKE_PROFIT
HARD_STOP
TIME_STOP
NO_PROGRESS
SIGNAL_DECAY
RANK_REPLACED
LIQUIDITY_FAILURE
DATA_FAILURE
RISK_KILL
MANUAL_EXIT
```

‏זה מאפשר לנתח אלפי עסקאות בקבוצות.

---

# ‏36. Exit לפי `Last` מול Exit לפי Executable Price

‏אם אתה Long ורוצה למכור, המחיר החשוב אינו בהכרח:

```text
Last
```

‏אלא:

```text
Bid / executable sell price
```

‏יכול להיות:

```text
Last = 50.10
Bid  = 50.02
```

‏ולכן Backtest או Live logic שמפעיל Take Profit לפי Last בלבד עלול לחשוב שאפשר לממש רווח שלא באמת קיים.

---

# ‏37. `Mark-to-Market` מול `Executable PnL`

‏אפשר לחשב:

```text
PnL using Mid
PnL using Last
PnL using Bid
```

‏אבל לסוחר Long שרוצה לצאת עכשיו, המדד החשוב ביותר ליכולת מימוש הוא בדרך כלל מחיר מכירה בר־ביצוע.

‏לכן כדאי להפריד:

```text
theoretical_pnl
executable_pnl
```

---

# ‏38. `Exit Slippage`

‏נגדיר למשל:

```text
exit_decision_price
exit_fill_price
```

‏הפער ביניהם הוא חלק מ־Execution Quality.

‏במסחר שלך Exit Slippage יכול להיות משמעותי מאוד כי הרווח הרצוי קטן.

---

# ‏39. Exit Latency

‏כדאי למדוד:

```text
exit_signal_time
exit_decision_time
exit_submit_time
broker_ack_time
first_fill_time
final_fill_time
```

‏ואז:

```text
Signal → Submit
Submit → First Fill
Submit → Full Fill
Signal → Flat
```

---

# ‏40. `Time to Flat`

‏אחד המדדים החשובים ביותר:

```text
time_to_flat
```

‏לא:

```text
time_to_submit_exit
```

‏כי הסיכון נגמר רק כאשר הפוזיציה באמת נסגרה.

---

# ‏41. Exit Aggressiveness

‏כמו בכניסה, אפשר לחשוב על:

```text
Passive
Balanced
Aggressive
Emergency
```

‏ככל שהסיבה ליציאה דחופה יותר, בדרך כלל נכונותך לשלם Spread/Slippage עשויה לגדול.

---

# ‏42. Profit Exit ו־Risk Exit לא חייבים להשתמש באותה Execution Policy

‏לדוגמה:

## ‏Take Profit

‏אפשר אולי להיות סבלני יותר.

## ‏Hard Risk Exit

‏ייתכן שעדיפות היציאה גבוהה יותר משיפור של סנט במחיר.

‏זו הבחנה חשובה:

> ‏Exit reason צריך להשפיע על execution urgency.

---

# ‏43. `Exit Urgency`

‏אפשר לחשב או לסווג:

```text
LOW
MEDIUM
HIGH
EMERGENCY
```

‏על בסיס:

- ‏PnL.
- ‏Signal decay.
- ‏Momentum reversal.
- ‏Spread.
- ‏Volatility.
- ‏Time remaining.
- ‏Risk limit proximity.

---

# ‏44. למה “לחכות שיחזור למחיר הקנייה” מסוכן כמערכת

‏זו חשיבה אנושית נפוצה:

> ‏“אני אחכה רק שיחזור ל־Break Even.”

‏אבל השוק אינו יודע מה מחיר הקנייה שלך.

‏אם ה־thesis נשבר, Entry Price אינו סיבה כלכלית להמשיך להחזיק.

---

# ‏45. `Anchoring Bias`

‏זה נקרא:

`Anchoring`

‏היצמדות למחיר קנייה כאילו הוא מידע על העתיד.

‏ברובוט צריך להחליף זאת בשאלה:

> ‏אם לא הייתי בפוזיציה כרגע — האם הייתי רוצה לפתוח אותה עכשיו?

‏אם התשובה שלילית מאוד, זו אינפורמציה חשובה ל־Exit.

---

# ‏46. `Re-entry` אחרי Exit

‏יציאה אינה אומרת שהמניה אסורה לנצח.

‏יכול להיות:

```text
Exit at T
new valid signal at T+20s
```

‏אבל Re-entry מהיר מדי עלול ליצור churn.

‏לכן אפשר לחקור:

```text
cooldown
minimum reset condition
new-high requirement
score recovery
```

---

# ‏47. `Cooldown`

‏`Cooldown` הוא זמן או תנאי שמונע כניסה חוזרת מיידית.

‏המטרה:

- ‏לא להיכנס ולצאת שוב ושוב על Noise.
- ‏לא לשלם Spread repeatedly.
- ‏לדרוש Evidence חדש לפני ניסיון נוסף.

---

# ‏48. `Exit then Re-rank`

‏אצלך תהליך טבעי יכול להיות:

```text
Exit
→ capital becomes available
→ re-rank entire market
→ choose best current opportunity
```

‏לא:

```text
Exit
→ automatically re-enter same symbol
```

---

# ‏49. Maximum Holding Time

‏למערכת שלך יש דרישה עסקית ברורה:

```text
seconds to roughly one minute
```

‏לכן `maxHoldingTime` צריך להיות פרמטר מפורש.

‏לא “אם שכחנו לצאת אז אולי דקה”.

‏אלא invariant:

```text
Position age must never silently exceed configured maximum
```

‏מלבד מצבי שוק שבהם אי אפשר לבצע, כמו Halt — ואז המערכת עוברת למצב חריג מפורש.

---

# ‏50. Hard Max Age מול Adaptive Time Stop

‏אפשר להחזיק שני כללים:

## ‏Adaptive

‏לצאת מוקדם אם אין התקדמות.

## ‏Hard Maximum

‏לא לעבור בשום מקרה את זמן ההחזקה המקסימלי המתוכנן, כל עוד השוק מאפשר ביצוע.

‏כך:

```text
Typical exit: 3–20s
Absolute planned cap: <= 60s
```

‏אלה רק דוגמאות מחקריות, לא ערכים שכבר הוכחו כנכונים.

---

# ‏51. `First Seconds Diagnostics`

‏כדאי במיוחד למדוד מה קורה מיד אחרי Fill:

```text
return_1s_after_fill
return_2s_after_fill
return_5s_after_fill
return_10s_after_fill
```

‏אם הרבה עסקאות מתחילות מיד לרדת, ייתכן שהבעיה אינה Exit.

‏אולי:

- ‏ה־Scanner מאוחר.
- ‏ה־Entry אגרסיבי מדי.
- ‏ה־Signal כבר exhausted.

‏כלומר Exit analysis צריך להתחבר ל־RCA של כל המערכת.

---

# ‏52. אל תתקן Scanner חלש רק עם Stop קשוח יותר

‏אם Rank #1 שוב ושוב אינו ממשיך אחרי הכניסה, אפשר להקטין הפסדים באמצעות Stop.

‏אבל זו לא בהכרח התשובה האמיתית.

‏צריך לשאול:

> ‏למה הוא נבחר מלכתחילה?

‏Stop טוב לא מחליף Signal טוב.

---

# ‏53. וגם ההפך: אל תאשים Scanner בכל Exit גרוע

‏יכול להיות שה־Scanner צדק.

‏אבל:

- ‏נכנסת מאוחר.
- ‏יצאת לאט.
- ‏ה־Spread התרחב.
- ‏פקודת ה־Exit לא התמלאה.

‏לכן RCA צריך להפריד:

```text
Signal Error
Entry Error
Exit Logic Error
Execution Error
Data Error
```

---

# ‏54. Exit Labels למחקר

‏לכל Trade כדאי לשמור:

```text
exit_reason
hold_time_ms
entry_fill_price
exit_fill_price
gross_pnl
net_pnl
mfe
mae
time_to_first_profit
time_to_target
time_to_mfe
rank_at_entry
rank_at_exit
score_at_entry
score_at_exit
```

---

# ‏55. `Counterfactual Exit Analysis`

‏אחרי העסקה אפשר לשאול:

```text
What if we exited after 2s?
5s?
10s?
20s?
30s?
60s?
```

‏או:

```text
What if target were 0.05%?
0.10%?
0.20%?
```

‏כך אפשר לבנות `Exit Surface`.

---

# ‏56. אבל Counterfactual חייב להיות ריאליסטי

‏אסור לבדוק רק Price Path.

‏צריך לשאול:

- ‏מה היה ה־Bid בזמן היציאה?
- ‏האם הייתה כמות?
- ‏מה היה ה־Spread?
- ‏כמה Slippage צפוי?
- ‏האם הייתה latency?

‏אחרת אתה בוחר Exit אופטימלי שלא ניתן היה לבצע באמת.

---

# ‏57. `Exit Surface`

‏אפשר לבנות טבלה:

```text
Target × Stop × MaxTime
```

‏ולמדוד לכל שילוב:

```text
Net EV
Win Rate
Avg Winner
Avg Loser
MFE capture
Turnover
Fill quality
```

‏אבל צריך להיזהר מ־Overfitting.

---

# ‏58. לא לבחור את התא המושלם

‏אם שילוב אחד זעיר:

```text
Target = 0.13%
Stop   = 0.07%
Time   = 17s
```

‏נראה מדהים ורק הוא — זה חשוד.

‏עדיף לחפש:

```text
robust region
```

‏אזור של פרמטרים סמוכים שנותן תוצאה דומה.

---

# ‏59. Exit לפי Regime

‏ייתכן ש־Exit טוב בפתיחה אינו טוב באמצע היום.

‏למשל:

- ‏Volatility גבוהה יותר.
- ‏Spreads שונים.
- ‏מהלכים מהירים יותר.
- ‏Noise שונה.

‏לכן אפשר לבדוק Exit לפי:

```text
session
volatility regime
liquidity regime
```

‏אבל רק אחרי שיש Baseline פשוט.

---

# ‏60. Exit לפי Symbol Characteristics

‏אפשר לבדוק האם אותו Exit מתאים לכולם.

‏למשל:

```text
$5 stock
$50 stock
$500 stock
```

‏או:

```text
very liquid
medium liquidity
low liquidity
```

‏אין להניח מראש שאותו Threshold נכון בכל קבוצה.

---

# ‏61. `Volatility-normalized Exit`

‏במקום Stop קבוע באחוזים, אפשר לנרמל לפי תנודתיות קצרה.

‏למשל רעיונית:

```text
stop_distance = k × recent_volatility
```

‏זה יכול להתאים את הרגישות למצב השוק.

‏אבל זה מוסיף מורכבות וצריך להוכיח שהוא טוב מ־Baseline פשוט.

---

# ‏62. `Spread-normalized Exit`

‏אם ה־Spread עצמו הוא 0.08%, Stop של 0.05% עלול להיות חסר משמעות מבחינת executable price.

‏לכן Exit צריך להיות מודע ל־transaction friction.

---

# ‏63. `Minimum Realizable Profit`

‏אפשר לחשוב על יעד שבו:

```text
expected executable profit
>
round-trip friction + safety margin
```

‏לא מספיק שה־Last עבר את היעד.

‏צריך להיות אפשרי למכור בפועל ברווח נטו.

---

# ‏64. `Exit Hysteresis`

‏אם Signal oscillates סביב Threshold, בלי Hysteresis אתה עלול לקבל:

```text
hold
exit
re-enter
exit
re-enter
```

‏Hysteresis דורש שינוי משמעותי יותר לפני מעבר מצב.

‏זה יכול להפחית Churn.

---

# ‏65. Emergency Exit

‏יש מצבים שבהם אופטימיזציית מחיר מפסיקה להיות העיקר.

‏לדוגמה:

- ‏Data feed failure בזמן Position.
- ‏Broker state mismatch.
- ‏Risk limit breached.
- ‏Execution engine malfunction.
- ‏Unexpected duplicate exposure.

‏אז ייתכן שהמערכת תעבור ל:

```text
EMERGENCY_EXIT
```

‏מדיניות כזו צריכה להיות מפורשת ונבדקת מראש.

---

# ‏66. Halt בזמן Position

‏אם המסחר נעצר:

```text
You may want to exit
```

‏אבל:

```text
You may not be able to exit
```

‏לכן Halt אינו “Exit rule רגיל”.

‏הוא מצב סיכון מיוחד במכונת המצבים.

---

# ‏67. Disconnect בזמן Position

‏זה תרחיש שחייב להיות חלק מהתכנון:

```text
Position exists
Broker disconnects
```

‏צריך לדעת:

- ‏האם protective orders כבר קיימים אצל הברוקר.
- ‏האם הם תלויים בלקוח המקומי.
- ‏איך עושים reconnect.
- ‏איך משחזרים Position truth.
- ‏איך מונעים שליחת Exit כפול.

---

# ‏68. Exit Idempotency

‏אם שלחת Exit ולא קיבלת תשובה, אסור פשוט לשלוח שוב בלי לדעת מה קרה.

‏ייתכן שהפקודה הראשונה כבר בוצעה.

‏לכן:

```text
unknown != failed
```

‏זה עיקרון קריטי.

---

# ‏69. `Flat` הוא מצב עסקי שצריך לאמת

‏לא מספיק:

```text
sell order completed locally
```

‏צריך לוודא:

```text
broker position quantity = 0
```

‏או state authoritative מקביל.

---

# ‏70. `Exit Audit Trail`

‏לכל יציאה כדאי להיות מסוגלים לשחזר:

```text
Why did we exit?
What did market look like?
What rule fired?
What price did we expect?
What price did we get?
How long did it take?
Was the position fully closed?
```

‏אם אי אפשר לענות — קשה לשפר.

---

# ‏71. מדדי Exit חשובים

‏ברמת Strategy:

```text
Net PnL
Win Rate
Expected Value
Avg Hold Time
MFE
MAE
MFE Capture
Time to First Profit
Time to Target
```

‏ברמת Execution:

```text
Exit Slippage
Time to Ack
Time to First Fill
Time to Flat
Partial Fill Rate
Reject Rate
```

---

# ‏72. Win Rate אינו מספיק

‏מערכת יכולה להיות:

```text
90% winners
```

‏ועדיין להפסיד אם:

```text
small winners
rare huge losers
```

‏לכן Exit נמדד דרך:

```text
Expected Value
Distribution
Tail Risk
Net PnL
```

---

# ‏73. Profit Factor אינו מספיק לבדו

‏גם מדד שנראה מקצועי יכול להסתיר בעיות.

‏צריך לבדוק:

- ‏יציבות לאורך זמן.
- ‏Regimes.
- ‏מספר עסקאות.
- ‏Tail losses.
- ‏Execution realism.

‏אין Metric יחיד שמוכיח שה־Exit טוב.

---

# ‏74. Best Practice — Exit Plan קיים לפני Entry

‏לפני Submit של Entry, המערכת צריכה לדעת לפחות:

```text
max loss logic
max holding time
profit logic
emergency behavior
```

‏לא חייבים לשלוח את כל הפקודות מראש.

‏אבל ה־policy חייב להיות מוגדר מראש.

---

# ‏75. Best Practice — Signal Exit ו־Risk Exit נפרדים

‏Risk Exit שואל:

> ‏כמה נזק מותר לספוג?

‏Signal Exit שואל:

> ‏האם הסיבה להחזקה עדיין קיימת?

‏אלה שאלות שונות.

‏לא כדאי למזג אותן לכלל אחד לא ברור.

---

# ‏76. Best Practice — Time Stop הוא Parameter, לא Magic Number

‏אם בחרנו:

```text
10 seconds
```

‏צריך לדעת למה.

‏לבדוק מול:

```text
2s
5s
10s
20s
30s
60s
```

‏ולראות את ההתפלגות בפועל.

---

# ‏77. Best Practice — measure from Fill, not only Signal

‏יש שתי שעונים חשובים:

```text
Signal age
Position age
```

‏אם ה־Signal נוצר לפני 3 שניות וה־Fill התקבל אחרי 2 שניות, אז:

```text
signal_age_at_fill = 2s
position_age = 0s
```

‏שניהם חשובים.

---

# ‏78. Best Practice — Exit על מחיר בר־ביצוע

‏ל־Long:

> ‏אם ה־Take Profit מבוסס על מחיר שאי אפשר למכור בו, הוא אינו Take Profit אמיתי.

‏לכן במחקר קצר טווח כדאי לשלב לפחות Bid/Ask ולא רק Last.

---

# ‏79. Best Practice — Separate Decision from Execution

‏כמו ב־Entry:

```text
Exit Decision Engine
```

‏צריך לענות:

> ‏האם לצאת?

‏ו־

```text
Exit Execution Engine
```

‏צריך לענות:

> ‏איך לצאת?

‏כך אפשר לשפר כל שכבה בנפרד.

---

# ‏80. Best Practice — Exit Policy Versioning

‏שמור:

```text
exit_policy_version
```

‏לכל Trade.

‏אחרת אחרי שינוי Rule לא תדע אילו עסקאות השתמשו באיזו לוגיקה.

---

# ‏81. Best Practice — Simulate the actual order policy

‏Backtest של:

```text
if price >= target then exit at target
```

‏יכול להיות רחוק מהמציאות.

‏צריך לדמות ככל האפשר:

- ‏Trigger.
- ‏Decision latency.
- ‏Order type.
- ‏Available Bid/Ask.
- ‏Fill assumptions.
- ‏Partial fills.
- ‏Slippage.

---

# ‏82. Best Practice — Analyze losers and winners separately

‏לדוגמה:

## ‏Losers

‏האם הם ירדו מיד?

‏האם היו קודם ברווח ואז התהפכו?

## ‏Winners

‏כמה מהר הגיעו לרווח?

‏כמה MFE נשאר על השולחן?

‏כך אפשר לגלות אם צריך לשפר Entry, Stop או Profit Exit.

---

# ‏83. רז מקצוע — Fast Failure יכול להיות Feature טוב

‏אם במחקר רואים שעסקאות טובות כמעט תמיד נותנות סימן חיובי בתוך 2–5 שניות, אז:

```text
absence of early progress
```

‏יכול להפוך ל־Exit signal בפני עצמו.

‏זה הרבה יותר עמוק מ־“Stop של 0.1%”.

---

# ‏84. רז מקצוע — הזמן עצמו יכול לנבא

‏נניח:

```text
P(success | no progress after 3s) = X
P(success | no progress after 10s) = much lower
```

‏אז Position age אינו רק שעון.

‏הוא Feature.

---

# ‏85. רז מקצוע — Winners ו־Losers עשויים להיפרד מאוד מוקדם

‏במערכת מהירה, ההבדל בין Trade טוב לרע יכול להופיע כבר בשניות הראשונות דרך:

- ‏Return after fill.
- ‏Spread behavior.
- ‏Trade rate.
- ‏Acceleration.
- ‏Rank persistence.

‏לכן Exit יכול להשתמש ב־post-entry features ולא רק במחיר.

---

# ‏86. רז מקצוע — אל תתן ל־Exit להציל Model גרוע

‏אם Scanner חלש, אפשר “לכוון” Exit עד שה־Backtest נראה טוב.

‏זה מסוכן.

‏צריך תמיד לשמור Baseline שבו אפשר לראות בנפרד:

```text
Selection quality
Entry quality
Exit quality
```

---

# ‏87. רז מקצוע — Exit יכול ליצור Selection Bias

‏אם אתה בוחן Features רק על Trades ששרדו מספיק זמן, אתה עלול להשמיט Trades שיצאו מוקדם.

‏במחקר צריך לשמור Timeline מלא לכל Candidate/Trade.

---

# ‏88. רז מקצוע — “לא הפסדתי” אינו יעד

‏מערכת עם Edge קצר צריכה למדוד:

```text
capital efficiency
opportunity utilization
time in dead positions
```

‏פוזיציה שלא הפסידה אבל תפסה 50 שניות ללא סיבה יכולה להיות Trade גרוע מבחינת המערכת שלך.

---

# ‏89. רז מקצוע — Exit טוב צריך להתאים ל־Horizon של ה־Signal

‏אם Feature נועד לחזות 5 שניות קדימה, Exit שמחכה 5 דקות כבר מערבב אסטרטגיות שונות.

‏Signal Horizon ו־Exit Horizon צריכים להיות קוהרנטיים.

---

# ‏90. Baseline Exit מומלץ למחקר

‏לא כהמלצה למסחר אמיתי, אלא כנקודת התחלה מחקרית פשוטה:

```text
1. Fixed maximum holding time
2. Simple hard loss boundary
3. Simple profit target
4. Optional early no-progress rule
5. Exit on major data/risk failure
```

‏בלי:

- ‏עשרות תנאים.
- ‏Trailing מורכב.
- ‏Regime-specific rules.
- ‏ML Exit.

‏קודם מוכיחים Baseline.

---

# ‏91. אחר כך עושים Ablation

‏לדוגמה:

```text
Baseline
+ No Progress Exit
+ Signal Decay Exit
+ Trailing
+ Replacement Logic
```

‏וכל פעם בודקים:

```text
Did Net EV improve?
Did tail risk improve?
Did turnover explode?
Did results survive out-of-sample?
```

---

# ‏92. מודל Exit שמתאים במיוחד לרובוט שלך

‏אפשר לחשוב על סדר כזה:

```text
ENTRY FILLED
    ↓
ARM RISK + MAX TIME
    ↓
MONITOR FAST POST-ENTRY FEATURES
    ↓
[PROFIT TARGET?] ───────→ EXIT
[HARD RISK?] ───────────→ EXIT
[NO PROGRESS?] ─────────→ EXIT
[SIGNAL DECAY?] ─────────→ EXIT
[MAX HOLD TIME?] ────────→ EXIT
    ↓
POSITION CONTINUES
```

‏זו ארכיטקטורה רעיונית, לא פרמטרים סופיים.

---

# ‏93. ומה קורה אחרי Exit?

‏מיד לאחר `Flat`:

```text
record result
release capital
update metrics
re-rank market
```

‏אבל לא לשנות את המודל Online בצורה אימפולסיבית אחרי כל הפסד יחיד.

---

# ‏94. שיפור Scanner בעקבות Exit data

‏אחרי מספיק Trades אפשר לגלות למשל:

```text
Rank #1 with weak 2s follow-through fails often
```

‏ואז אולי לשפר את Scanner באמצעות Feature חדש.

‏זו הלולאה:

```text
Trade
→ Exit
→ Diagnose
→ Research
→ Validate
→ Improve Scanner
```

‏לא:

```text
Trade lost
→ immediately tweak parameters
```

---

# ‏95. שאלות שאתה צריך לדעת לענות עליהן אחרי הפרק

1. ‏מה ההבדל בין `Take Profit`, ‏Stop, ‏Time Stop ו־Signal Exit?
2. ‏למה Exit הוא חלק מה־Strategy ולא רק Risk Management?
3. ‏למה Stop trigger אינו מבטיח Fill במחיר ה־Stop?
4. ‏מה ההבדל בין `MFE` ל־`MAE`?
5. ‏מהו `No Progress Exit`?
6. ‏למה Position Age יכול להיות Feature?
7. ‏למה `Last` אינו מספיק לחישוב רווח בר־מימוש?
8. ‏מה ההבדל בין Exit Decision ל־Exit Execution?
9. ‏למה Partial Fill מחייב State Machine אמיתי?
10. ‏למה `Flat` צריך להיות מאומת מול מקור אמת?
11. ‏איך בודקים Exit בלי Overfitting?
12. ‏איך Exit data חוזר ומשפר את Scanner?

---

# ‏96. סיכום

‏מערכת Exit טובה אינה אומרת:

> ‏“מכור ב־+X% או ב־-Y%.”

‏היא אומרת:

> ‏“כל עוד ה־Thesis תקף והעסקה מתקדמת כפי שציפינו, אפשר להישאר; כאשר היעד הושג, הסיכון חרג, האות נשבר, הזמן נגמר או המערכת איבדה ודאות — עוברים לתהליך יציאה מדיד, מהיר ומאומת.”

‏ובמקרה של הרובוט שלך יש דגש נוסף:

> ‏אם אנחנו מצפים ל־Edge שמופיע תוך שניות, אז **אי־הופעת המהלך בזמן הצפוי היא עצמה מידע חשוב**. Exit נכון לא רק מגביל הפסד — הוא גם משחרר הון מהר ומייצר נתונים שיעזרו לשפר את ה־Scanner הבא.
