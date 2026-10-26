# ‏שלב 14 — `Score` ודירוג כל השוק: איך מחברים Features להחלטה אחת

> ‏מטרת הפרק: להבין איך לוקחים הרבה `Features` שונים — מומנטום, האצה, פעילות, נזילות, טריות ועוד — והופכים אותם למנגנון דירוג עקבי שמאפשר להשוות אלפי מניות באותו רגע.
>
> ‏העיקרון המרכזי: **`Score` הוא כלי להשוואה, לא קסם ולא הבטחה.** אם מניה קיבלה 92 ומניה אחרת 84, אנחנו צריכים לדעת למה, מה המשמעות של הפער, והאם מקום גבוה באמת מוביל לתוצאות טובות יותר בהמשך.

---

# ‏1. למה בכלל צריך `Score`?

‏אחרי שלבי ה־`Filters`, נשארות לנו מניות שאפשר לשקול.

‏לכל אחת יש הרבה נתונים:

```text
change_1s
change_5s
change_10s
change_30s
acceleration
trade_rate
volume_rate
spread_pct
quote_age_ms
liquidity
...
```

‏אבל בסוף הרובוט צריך לענות על שאלה פשוטה:

> ‏מי המועמדת הטובה ביותר כרגע?

‏`Score` הוא אחת הדרכים להפוך הרבה מדדים לדירוג אחד.

---

# ‏2. ההבדל בין `Feature`, ‏`Score` ו־`Rank`

## ‏`Feature`

‏מדד בודד שמתאר משהו.

```text
change_10s = +0.24%
```

## ‏`Score`

‏ערך שמחבר או מסכם כמה Features.

```text
score = 87.4
```

## ‏`Rank`

‏המיקום ביחס לכל שאר המניות באותו רגע.

```text
Rank #1
Rank #2
Rank #3
```

‏חשוב:

> ‏`Score` הוא המספר. `Rank` הוא המקום שנוצר כאשר משווים את המספרים.

---

# ‏3. `Score` אינו הסתברות

‏אם קיבלנו:

```text
Score = 92
```

‏זה **לא** אומר בהכרח:

```text
92% chance of profit
```

‏אלא אם בנינו במפורש מודל מכויל שמייצג הסתברות.

‏במערכת פשוטה יותר, 92 יכול רק לומר:

> ‏המניה קיבלה ציון גבוה לפי נוסחת הדירוג שלנו.

‏זו הבחנה חשובה מאוד.

---

# ‏4. המטרה האמיתית של הדירוג

‏אצלך המטרה אינה למצוא מניה “טובה” באופן כללי.

‏המטרה היא:

> ‏מבין כל המניות הזמינות עכשיו — מי מציגה את השילוב הטוב ביותר של תנועה, פעילות, נזילות ואיכות אות, כדי שתהיה לה הסתברות טובה יחסית לתת מהלך חיובי מהר לאחר הכניסה.

‏כלומר הדירוג הוא:

`Cross-sectional ranking`

‏בפשטות:

> ‏השוואה בין כל המניות באותו רגע.

---

# ‏5. הדרך הפשוטה ביותר — `Weighted Score`

‏אפשר להתחיל מנוסחה כמו:

```text
score =
    0.30 * momentum
  + 0.20 * acceleration
  + 0.20 * activity
  + 0.15 * liquidity
  + 0.15 * consistency
```

‏כל Feature מקבל משקל.

‏המשקל אומר כמה הוא משפיע על התוצאה.

---

# ‏6. הבעיה הראשונה: אי אפשר לחבר יחידות שונות בצורה גולמית

‏נניח:

```text
change_10s   = 0.25
trades_10s   = 180
spread_pct   = 0.03
quote_age_ms = 25
```

‏אם נחבר את המספרים ישירות:

```text
0.25 + 180 + 0.03 + 25
```

‏מספר העסקאות ישתלט על הכול רק בגלל היחידה שבה הוא נמדד.

‏לכן לפני חיבור צריך לבצע:

`Normalization`

‏או להשתמש ב־Rank/Percentile.

---

# ‏7. דרך פשוטה וחזקה: `Percentile Score`

‏נניח שיש 2,000 מניות פעילות.

‏עבור כל Feature אפשר לשאול:

> ‏באיזה אחוזון המניה נמצאת ביחס לאחרות?

‏לדוגמה:

```text
momentum_percentile     = 98
activity_percentile     = 95
liquidity_percentile    = 82
consistency_percentile  = 91
```

‏עכשיו כל המדדים נמצאים בערך באותה סקאלה:

```text
0..100
```

‏ואפשר לשלב אותם בצורה הגיונית יותר.

---

# ‏8. למה Rank/Percentile מתאים במיוחד לסריקה של כל השוק

‏המערכת שלך היא מערכת יחסית.

‏אם כל השוק שקט מאוד, תנועה של +0.08% בעשר שניות אולי יוצאת דופן.

‏ביום סוער, אותו מספר אולי בינוני בלבד.

‏Percentile עונה על השאלה:

> ‏כמה חריגה המניה ביחס למה שקורה בשוק עכשיו?

‏זה יכול להיות שימושי מאוד.

---

# ‏9. אבל גם Percentile אינו מושלם

‏אם כולן גרועות, עדיין תהיה מניה ב־100th percentile.

‏לכן:

```text
Rank #1
```

‏לא אומר:

```text
Good enough to trade
```

‏לכן נצטרך בהמשך גם:

`Trade / No Trade threshold`

---

# ‏10. דירוג יחסי + דרישת איכות מוחלטת

‏שילוב טוב יכול להיות:

```text
Rank = #1
AND
absolute_quality >= minimum
```

‏לדוגמה:

```text
Rank #1
Score = 74
Minimum trade score = 82
```

‏התוצאה:

```text
NO TRADE
```

‏המערכת לא חייבת לסחור רק משום שתמיד יש מקום ראשון.

---

# ‏11. מהו `Sub-Score`?

‏במקום ציון אחד ענק, אפשר לבנות כמה ציוני משנה.

‏לדוגמה:

```text
MomentumScore
ActivityScore
LiquidityScore
ExecutionScore
DataQualityScore
```

‏ואז:

```text
FinalScore = combination(SubScores)
```

‏זה קל יותר להבנה ול־debugging.

---

# ‏12. דוגמה ל־Sub-Scores

```text
MomentumScore  = 93
ActivityScore  = 88
LiquidityScore = 97
ExecutionScore = 91
```

‏לעומת מניה אחרת:

```text
MomentumScore  = 99
ActivityScore  = 45
LiquidityScore = 32
ExecutionScore = 40
```

‏המניה השנייה זזה מהר יותר, אבל אולי היא הרבה פחות סחירה.

‏ציון מפורק עוזר לראות את ההבדל.

---

# ‏13. למה פירוק חשוב לך במיוחד

‏נניח שמניה קיבלה מקום ראשון ולא עלתה אחרי הקנייה.

‏אם יש לנו רק:

```text
Score = 91
```

‏קשה להבין למה.

‏אבל אם שמרנו:

```text
Momentum   = 98
Activity   = 95
Liquidity  = 52
Consistency= 41
Execution  = 47
```

‏כבר יש כיוון לחקירה.

‏אולי המודל נתן משקל גדול מדי למומנטום והזניח איכות תנועה או ביצוע.

---

# ‏14. `Score Decomposition`

‏לכל החלטה כדאי לשמור:

```text
feature_value
normalized_value
weight
contribution_to_score
```

‏לדוגמה:

```text
change_10s:
raw          = +0.31%
percentile   = 97
weight       = 0.25
contribution = 24.25
```

‏כך אפשר לשחזר בדיוק למה המניה קיבלה את הציון.

---

# ‏15. `Score Explainability`

‏המערכת צריכה להיות מסוגלת לומר משהו בסגנון:

```text
XYZ ranked #1 because:
+ very strong 5s/10s momentum
+ activity accelerated sharply
+ spread remained small
+ quotes were fresh
- 30s consistency was only medium
```

‏לא חייבים לייצר משפט בעברית בזמן אמת.

‏אבל הנתונים צריכים לאפשר אותו.

---

# ‏16. משקלים אינם “אמת”

‏קל לכתוב:

```text
momentum = 40%
activity = 30%
liquidity = 20%
other = 10%
```

‏אבל למה דווקא כך?

‏אם המשקלים נבחרו רק כי “זה נשמע הגיוני”, זו השערה.

‏צריך לבדוק אותה על נתונים.

---

# ‏17. Baseline פשוט קודם

‏לפני מודל מורכב, בנה Baseline.

‏למשל:

```text
Score v1 = rank(change_10s)
```

‏ואז גרסה מעט עשירה יותר:

```text
Score v2 =
0.6 * percentile(change_10s)
+ 0.4 * percentile(trades_10s)
```

‏אם מודל מורכב עם 25 Features לא מנצח Baseline פשוט — המורכבות לא הצדיקה את עצמה.

---

# ‏18. למה Baseline הוא כלי מקצועי

‏בלי Baseline אין לנו תשובה לשאלה:

> ‏האם כל החוכמה שהוספנו באמת שיפרה משהו?

‏כל גרסת Score צריכה להיבדק מול גרסה פשוטה יותר.

---

# ‏19. `Rank Aggregation`

‏לא חייבים לחבר ערכים מספריים.

‏אפשר לחבר דירוגים.

‏לדוגמה:

```text
Momentum Rank  = 2
Activity Rank  = 5
Liquidity Rank = 3
```

‏ואז ליצור ציון מהדירוגים.

‏זה יכול להיות עמיד יותר להבדלים גדולים ביחידות.

---

# ‏20. `Borda`-style idea בפשטות

‏אפשר לתת יותר נקודות ככל שהמניה מדורגת גבוה יותר בכל קטגוריה.

‏לדוגמה:

```text
Rank 1 -> 100 points
Rank 2 -> 99 points
Rank 3 -> 98 points
...
```

‏ואז לחבר בין כמה קטגוריות.

‏זו רק משפחת שיטות אחת, לא המלצה אוטומטית.

---

# ‏21. למה לפעמים Rank עדיף על ערך גולמי

‏נניח:

```text
AAA change_5s = +0.40%
BBB change_5s = +0.20%
CCC change_5s = +0.18%
```

‏AAA כפולה כמעט מ־BBB.

‏אבל ביום אחר:

```text
AAA = +0.12%
BBB = +0.11%
CCC = +0.10%
```

‏המקומות דומים אבל הפער המוחלט שונה מאוד.

‏לכן טוב לשמור גם:

```text
Rank
Absolute value
```

‏ולא לבחור רק אחד מהם.

---

# ‏22. `Separation Gap` — כמה מקום ראשון באמת בולט

‏זה Feature חשוב מאוד אצלך.

‏נניח:

```text
#1 Score = 92
#2 Score = 91.8
#3 Score = 91.6
```

‏המקום הראשון כמעט לא מובחן.

‏לעומת:

```text
#1 Score = 92
#2 Score = 78
#3 Score = 75
```

‏כאן המוביל בולט הרבה יותר.

‏אפשר לחשב:

```text
gap_1_2 = score_rank1 - score_rank2
```

‏וגם:

```text
gap_1_5
gap_1_median_top10
```

---

# ‏23. למה `Separation` יכול להיות חשוב

‏אם מקום ראשון מוביל רק ב־0.1 נקודה, הבחירה יכולה להיות כמעט מקרית.

‏אם הוא מוביל בפער גדול, אולי מדובר בהזדמנות חריגה יותר.

‏אבל גם כאן:

> ‏לא מניחים. בודקים בנתונים אם Separation גדול באמת מנבא תוצאה טובה יותר.

---

# ‏24. `Score Stability`

‏עוד שאלה חשובה:

> ‏כמה יציב הדירוג לאורך כמה שניות?

‏לדוגמה:

```text
T0      XYZ rank 1
T+1s    XYZ rank 1
T+2s    XYZ rank 2
T+3s    XYZ rank 1
```

‏לעומת:

```text
T0      XYZ rank 1
T+1s    XYZ rank 31
T+2s    XYZ rank 80
```

‏המצב השני יכול להעיד שהאות היה קצר מאוד או רועש.

---

# ‏25. `Rank Persistence`

‏אפשר למדוד:

```text
time_in_top_1
ntime_in_top_3
ntime_in_top_10
```

‏או באופן נכון יותר בשם:

```text
time_in_top_1
time_in_top_3
time_in_top_10
```

‏למשל:

```text
XYZ was Top-3 for 4.2 seconds
```

‏זה יכול להפוך ל־Feature נוסף או לכלל כניסה.

---

# ‏26. אבל יציבות רבה מדי יכולה להיות איחור

‏יש trade-off.

‏אם נחכה שמניה תהיה מקום ראשון 20 שניות כדי “לאשר” אותה, ייתכן שכבר פספסנו את התנועה.

‏לכן צריך לבדוק:

```text
confirmation quality
vs
signal delay
```

---

# ‏27. `Score Velocity`

‏לא רק מה הציון עכשיו, אלא האם הוא עולה.

‏לדוגמה:

```text
T-3s  Score 61
T-2s  Score 70
T-1s  Score 82
NOW   Score 91
```

‏זה שונה ממניה:

```text
T-3s  Score 96
T-2s  Score 94
T-1s  Score 92
NOW   Score 91
```

‏לשתיהן Score 91 עכשיו.

‏אבל הכיוון שונה.

---

# ‏28. `Score Acceleration`

‏אפשר גם למדוד אם העלייה בציון עצמו מאיצה.

‏זה כבר Feature נגזר מה־Score.

‏צריך להיזהר לא ליצור מעגל של Features מורכבים ללא ערך, אבל במחקר זה יכול להיות מעניין.

---

# ‏29. `Nonlinear Scoring`

‏לא תמיד השפעה היא ליניארית.

‏לדוגמה Spread:

```text
0.01% -> מצוין
0.03% -> טוב
0.05% -> סביר
0.20% -> גרוע מאוד
```

‏לא בהכרח נכון שכל עלייה של 0.01% מורידה בדיוק אותה כמות נקודות.

‏אפשר להשתמש בפונקציה לא־ליניארית.

---

# ‏30. `Threshold Function`

‏דוגמה פשוטה:

```text
if spread_pct <= 0.02:
    liquidity_score = 100
elif spread_pct <= 0.05:
    liquidity_score = 70
elif spread_pct <= 0.10:
    liquidity_score = 30
else:
    liquidity_score = 0
```

‏זה יותר קריא לפעמים מנוסחה מתמטית מורכבת.

---

# ‏31. `Piecewise Scoring`

‏אפשר להגדיר טווחים.

‏לדוגמה Trade Rate:

```text
0-5 trades/s     -> weak
5-20 trades/s    -> medium
20-50 trades/s   -> strong
50+ trades/s     -> very strong
```

‏אבל הספים צריכים להיבדק מול נתונים אמיתיים.

---

# ‏32. Saturation — יותר אינו תמיד טוב יותר

‏נניח ש־Trade Rate גבוה הוא טוב.

‏יכול להיות:

```text
20 trades/s  = good
50 trades/s  = better
200 trades/s = not necessarily 4x better
```

‏בשלב מסוים השיפור יכול להתיישר.

‏זה נקרא `Saturation`.

---

# ‏33. לפעמים יותר מדי Momentum דווקא מסוכן

‏גם מומנטום אינו בהכרח “כמה שיותר יותר טוב”.

‏מניה שעשתה:

```text
+0.15% in 5s
```

‏אולי במצב טוב.

‏מניה שעשתה:

```text
+5% in 5s
```

‏יכולה להיות במצב חריג, עם Spread, halt risk, חדשות או exhaustion.

‏לכן Score טוב יכול להיות לא־מונוטוני בחלק מהFeatures.

---

# ‏34. `Interaction` בין Features

‏Feature אחד יכול לשנות משמעות של Feature אחר.

‏למשל:

```text
Strong Momentum + High Activity
```

‏יכול להיות שונה מ־:

```text
Strong Momentum + 2 trades
```

‏או:

```text
Strong Momentum + Tiny Spread
```

‏לעומת:

```text
Strong Momentum + Huge Spread
```

‏זה נקרא `Feature Interaction`.

---

# ‏35. Score עם Gates

‏לפעמים נכון להשתמש בשילוב:

```text
Hard Filters
    ↓
Sub-Scores
    ↓
Final Score
```

‏לדוגמה:

```text
if data_bad:
    reject

if spread_too_large:
    reject

otherwise:
    calculate score
```

‏לא צריך לתת Score לכל מצב אפשרי.

---

# ‏36. `Penalty` במקום פסילה

‏במקום Hard Filter אפשר לעיתים להוריד נקודות.

‏לדוגמה:

```text
score -= stale_penalty
score -= wide_spread_penalty
```

‏זה מתאים יותר למצבים שבהם הגורם רע אבל לא בהכרח פוסל לחלוטין.

---

# ‏37. למה יותר מדי Penalties יכול להיות בעייתי

‏אם הנוסחה הופכת ל:

```text
+ 12 points
- 7.3 points
+ 4.2 points
- 18.7 points
+ 2.9 points
...
```

‏אף אחד כבר לא מבין אותה.

‏זה `Score Spaghetti`.

‏Best Practice:

> ‏שמור Score פשוט מספיק כדי להבין אותו ולהוכיח כל רכיב.

---

# ‏38. כמה Features צריך?

‏אין מספר קסם.

‏אבל 5 Features טובים יכולים להיות עדיפים על 50 בינוניים.

‏כל Feature חדש צריך להצדיק את עצמו.

‏שאל:

```text
Does this add independent information?
```

‏לא:

```text
Can I calculate it?
```

---

# ‏39. כפילות Features

‏נניח שיש לנו:

```text
change_10s
velocity_10s
```

‏אם החלון תמיד 10 שניות:

```text
velocity_10s = change_10s / 10
```

‏כמעט אותו מידע.

‏אם ניתן לשניהם משקל גדול, אנחנו למעשה סופרים אותו אות פעמיים.

---

# ‏40. `Correlation` בין Features

‏אפשר לבדוק עד כמה Features נעים יחד.

‏אם שני Features כמעט תמיד זהים מבחינת דירוג, אולי אין צורך בשניהם.

‏אבל Correlation אינו כל הסיפור — ייתכן שFeature דומה מוסיף מידע דווקא במצבים מסוימים.

---

# ‏41. Score הוא מודל — גם אם אין Machine Learning

‏נוסחה ידנית כמו:

```text
0.4*A + 0.3*B + 0.3*C
```

‏היא מודל.

‏יש לה:

- ‏הנחות.
- ‏פרמטרים.
- ‏טעויות.
- ‏צורך בולידציה.

‏לא צריך `AI` או `ML` כדי להסתבך ב־Overfitting.

---

# ‏42. `Calibration`

‏נניח Score נע בין 0 ל־100.

‏אפשר לבדוק מה קרה היסטורית:

| Score Bucket | Forward +5s avg | Hit Rate |
|---|---:|---:|
| 60–69 | +0.01% | 51% |
| 70–79 | +0.03% | 55% |
| 80–89 | +0.06% | 61% |
| 90–100 | +0.10% | 69% |

‏אם ככל שהScore עולה התוצאה משתפרת — זה סימן טוב.

‏אם אין סדר ברור, ייתכן שהScore לא באמת מדרג איכות.

---

# ‏43. `Monotonicity` של Score

‏Score טוב לדירוג אמור בדרך כלל ליצור קשר כמו:

```text
higher score
→ better future outcome
```

‏לא חייב באופן מושלם.

‏אבל אם:

```text
Score 70 performs better than Score 95
```

‏שוב ושוב, צריך לבדוק למה.

---

# ‏44. `Rank Buckets`

‏במקום להסתכל רק על מקום ראשון, מחלקים לפי מקום:

```text
Rank 1
Ranks 2-5
Ranks 6-10
Ranks 11-25
Ranks 26-100
Rest
```

‏ואז מודדים Forward Results.

‏אם המערכת טובה, נצפה לראות ירידה הדרגתית באיכות כאשר יורדים בדירוג.

---

# ‏45. הבדיקה הכי חשובה אצלך: `Top 1` באמת מיוחד?

‏השיטה שלך בוחרת את המניה הטובה ביותר בכל מחזור.

‏לכן צריך לבדוק:

```text
Top 1 vs Top 2
Top 1 vs Top 5 average
Top 1 vs Top 10 average
Top 1 vs random eligible stock
```

‏אם Top 1 אינו טוב באופן עקבי יותר — מנגנון הדירוג לא עושה מספיק עבודה.

---

# ‏46. לא מספיק לבדוק ממוצע

‏נניח Top 1 נותן בממוצע:

```text
+0.08%
```

‏זה נשמע טוב.

‏אבל אולי:

```text
99 trades = -0.01%
1 trade   = +9%
```

‏הממוצע מטעה.

‏לכן צריך גם:

```text
median
percentiles
hit rate
loss distribution
MFE
MAE
```

---

# ‏47. המדדים המיוחדים לאופי המסחר שלך

‏אצלך חשוב במיוחד לבדוק לכל Rank:

```text
forward_return_1s
forward_return_2s
forward_return_5s
forward_return_10s
forward_return_30s
forward_return_60s
```

‏וגם:

```text
time_to_first_profit
time_to_target
MFE_5s
MFE_10s
MFE_30s
MAE_5s
MAE_10s
MAE_30s
```

---

# ‏48. למה `time_to_first_profit` קריטי אצלך

‏שתי מניות יכולות לסיים אחרי דקה באותו רווח.

‏אבל:

```text
AAA: became profitable after 1.2s
BBB: became profitable after 47s
```

‏למערכת שלך אלה עסקאות שונות מאוד.

‏אתה מעדיף שהאות יעבוד כמעט מיד.

---

# ‏49. יעד Score צריך להתאים ל־Holding Horizon

‏אם אתה מחזיק 5–30 שניות, אין היגיון אוטומטי לבנות Score שמנבא תשואה בעוד שעה.

‏צריך להגדיר Target שמתאים למטרה.

‏לדוגמה:

```text
maximize expected net outcome within 10 seconds
```

‏או:

```text
maximize probability of reaching +X after costs within 30 seconds
```

---

# ‏50. Score אחד לכמה Horizons?

‏אפשר לבנות Score אחד כללי.

‏אבל אפשר גם לחשוב על:

```text
Score_5s
Score_10s
Score_30s
Score_60s
```

‏כי Feature שמנבא 5 שניות קדימה לא בהכרח מנבא דקה.

‏לא חייבים לעשות זאת, אבל כדאי לבדוק.

---

# ‏51. `Multi-Objective Score`

‏אצלך יש לפחות שתי מטרות:

```text
1. price should move in our favor
2. trade must be executable cheaply and quickly
```

‏לכן אפשר לחשוב על:

```text
PredictionScore
ExecutionScore
```

‏ואז לשלב ביניהם.

---

# ‏52. למה לפעמים עדיף לא לחבר הכול

‏ייתכן שעדיף:

```text
PredictionScore >= threshold
AND
ExecutionScore >= threshold
```

‏במקום:

```text
FinalScore = 0.8 Prediction + 0.2 Execution
```

‏למה?

‏כי Score גבוה מאוד במומנטום לא אמור “לפצות” על מצב שבו אי אפשר לבצע את העסקה במחיר סביר.

---

# ‏53. `Lexicographic Ranking`

‏עוד שיטה:

‏קודם מדרגים לפי קריטריון ראשי.

‏רק במקרה של קרבה משתמשים בקריטריון שני.

‏לדוגמה:

```text
1. strongest valid momentum
2. among close candidates, better liquidity
3. then better activity
```

‏זה נקרא רעיונית דירוג היררכי.

---

# ‏54. `Pareto` thinking בפשטות

‏לפעמים אין “הכי טוב” בכל דבר.

‏מניה A:

```text
Momentum excellent
Liquidity medium
```

‏מניה B:

```text
Momentum good
Liquidity excellent
```

‏אין תשובה מתמטית אחת בלי להגדיר trade-off.

‏לכן חשוב לדעת איזו פשרה Score מייצר.

---

# ‏55. Score לא חייב להיות 0–100

‏אפשר להשתמש ב:

```text
0..1
-10..+10
raw weighted sum
probability
expected dollars
expected basis points
```

‏הסקאלה עצמה לא חשובה.

‏המשמעות והעקביות חשובות.

---

# ‏56. `Expected Net Edge` כScore מתקדם

‏בטווח מתקדם יותר, במקום Score שרירותי אפשר לנסות להעריך:

```text
Expected gross move
- expected spread cost
- expected slippage
- commission/fees
= Expected Net Edge
```

‏זה כבר קרוב מאוד למה שבאמת מעניין אותנו.

---

# ‏57. למה זה קשה

‏כדי להעריך Expected Net Edge צריך לחזות גם:

- ‏תנועת מחיר.
- ‏Fill probability.
- ‏Slippage.
- ‏זמן מילוי.
- ‏Exit cost.

‏לכן בדרך כלל לא מתחילים כאן.

‏מתחילים מ־Score פשוט ומתקדמים לפי הוכחות.

---

# ‏58. `Expected Value`

‏באופן כללי:

```text
EV =
P(win) * AvgWin
-
P(loss) * AvgLoss
-
Costs
```

‏זה חשוב יותר מ־Hit Rate לבד.

‏מערכת יכולה לנצח 70% מהזמן ועדיין להפסיד אם ההפסדים גדולים יותר.

---

# ‏59. `Score Versioning`

‏כל שינוי בנוסחה צריך גרסה.

‏לדוגמה:

```text
score_v1
score_v2
score_v3
```

‏או:

```text
score_model_id = 2026-10-26-v3
```

‏בלי Versioning אי אפשר לדעת איזה Score יצר עסקה ישנה.

---

# ‏60. שמירת Snapshot של הדירוג

‏בכל החלטה חשובה כדאי לשמור לפחות:

```text
time
universe_size
eligible_count
rank
score
sub_scores
feature_version
score_version
rank_2_score
rank_5_score
separation_gap
```

‏כך אפשר לחקור את כל השוק כפי שנראה באותו רגע.

---

# ‏61. לא לשמור רק את הזוכה

‏אם נשמור רק Rank #1, נאבד מידע חשוב.

‏כדאי לשמור לפחות:

```text
Top 5 / Top 10 / Top N
```

‏כי אחר כך נוכל לשאול:

> ‏האם #2 הייתה טובה יותר מ־#1?

‏זו שאלה קריטית לשיפור המודל.

---

# ‏62. `Counterfactual Analysis`

‏בפשטות:

> ‏מה היה קורה אילו בחרנו מועמדת אחרת?

‏לדוגמה:

```text
#1 XYZ -> +0.01%
#2 ABC -> +0.14%
#3 DEF -> +0.09%
```

‏אם זה קורה לעיתים קרובות, אפשר לחקור מה #2/#3 ידעו ש־#1 לא ידע.

---

# ‏63. `Winner's Curse`

‏כאשר בוחרים את המקסימום מתוך אלפי מניות, המקום הראשון יכול לפעמים להיות פשוט המניה שקיבלה הכי הרבה רעש חיובי באותו רגע.

‏זו בעיה חשובה בסריקה רחבה.

‏ככל שבוחרים מתוך יותר מועמדות, הקיצון יכול להיות יותר מושפע מרעש.

---

# ‏64. איך נלחמים ב־Winner's Curse

‏אפשר לבדוק:

- ‏Stability.
- ‏Activity confirmation.
- ‏Liquidity.
- ‏Multi-window consistency.
- ‏Separation.
- ‏Forward validation.
- ‏Minimum absolute thresholds.

‏אבל שוב: כל מנגנון צריך להוכיח את עצמו.

---

# ‏65. `Noise Ranking`

‏אם Features רועשים מאוד, Rank #1 יכול להתחלף כל 100ms.

‏השאלה היא האם אנחנו רוצים:

```text
latest winner
```

‏או:

```text
stable high-quality winner
```

‏זו החלטת אסטרטגיה שצריך למדוד.

---

# ‏66. `Rank Churn`

‏אפשר למדוד כמה פעמים Top-1 מתחלף:

```text
rank1_changes_per_minute
```

‏אם הוא מתחלף 300 פעמים בדקה, אולי הScore רועש מדי.

‏או שהשוק באמת דינמי מאוד.

‏צריך להבין איזה מהם.

---

# ‏67. `Hysteresis`

‏אפשר למנוע החלפה על כל הבדל קטן.

‏לדוגמה:

```text
Keep current candidate
unless new candidate score >= current + 5
```

‏זה נקרא רעיונית `Hysteresis`.

‏הוא יכול להפחית Churn, אבל גם לעכב מעבר להזדמנות טובה יותר.

---

# ‏68. Score בזמן Position

‏גם אחרי שקנינו אפשר להמשיך לחשב את Score של המניה.

‏לדוגמה:

```text
Entry score = 94
Now score   = 61
```

‏הירידה יכולה להיות חלק מ־Signal Exit.

‏אבל אסור להניח אוטומטית שאותו Score שמתאים לכניסה מתאים גם ליציאה.

---

# ‏69. Score של Position מול Score של השוק

‏אפשר גם לשאול:

> ‏האם בזמן שאני מחזיק XYZ, נוצרה מניה הרבה יותר טובה?

‏זה יכול להוביל בעתיד לרעיון של:

```text
opportunity switching
```

‏אבל זה מורכב, כי מעבר כרוך בעלויות ובסיכון.

---

# ‏70. Score צריך להיות `As-Of` אמיתי

‏כל Feature בתוך Score חייב להיות מבוסס רק על מידע שהיה קיים באותו רגע.

‏אם Feature אחד משתמש בטעות בנתון עתידי:

```text
entire score is contaminated
```

‏גם אם שאר הFeatures תקינים.

---

# ‏71. Score ו־Missing Data

‏אם Feature חסר, יש כמה אפשרויות:

```text
Reject candidate
Use default
Renormalize weights
Apply penalty
```

‏אין פתרון אחד שתמיד נכון.

‏אבל אסור ש־Missing יהפוך במקרה ל־0 אם 0 הוא ערך אמיתי.

---

# ‏72. `Dynamic Weights`

‏אפשר בעתיד לשנות משקלים לפי מצב שוק.

‏לדוגמה:

```text
Opening regime
Midday regime
High volatility regime
Low volatility regime
```

‏אבל זה מוסיף מורכבות גדולה.

‏לפני Dynamic Weights צריך להוכיח שScore קבוע באמת נכשל בצורה שיטתית ברג'ימים מסוימים.

---

# ‏73. Score לפי Session

‏יכול להיות שFeature חשוב בפתיחה ולא חשוב בצהריים.

‏לכן במחקר נבדוק תוצאות בנפרד לפי:

```text
pre-market
open
midday
close
after-hours
```

‏לא בהכרח נבנה Score שונה לכל אחד — קודם נבדוק.

---

# ‏74. Score לפי Price Bucket

‏מניה של $3 ומניה של $500 מתנהגות אחרת בהרבה מובנים.

‏אפשר לבדוק ביצועים לפי:

```text
$1-$5
$5-$20
$20-$100
$100+
```

‏כדי לראות אם אותו Score עובד בכל הקבוצות.

---

# ‏75. Score לפי Liquidity Bucket

‏אותו רעיון:

```text
very liquid
liquid
medium
thin
```

‏אם Score עובד רק במניות מאוד נזילות, חשוב לדעת זאת.

---

# ‏76. Score לפי Market Cap / סוג מניה

‏בהמשך אפשר לבדוק:

```text
large cap
mid cap
small cap
ETF
ADR
```

‏לא כדי ליצור עשרות מודלים מיד, אלא כדי לזהות איפה המודל יציב ואיפה לא.

---

# ‏77. `Out-of-Sample` חשוב יותר מ־Score יפה

‏אפשר לכוון משקלים עד שהעבר נראה מושלם.

‏זה קל.

‏השאלה היא:

> ‏האם אותו Score מדרג טוב גם ימים שלא השתמשנו בהם לבנייה?

‏זה נלמד לעומק בפרקי Backtest ו־Overfitting.

---

# ‏78. `Walk-Forward` thinking

‏במקום לבחור משקלים על כל ההיסטוריה ואז לבדוק על אותה היסטוריה:

```text
Past -> build
Future -> test
Move forward
Repeat
```

‏כך בודקים אם Score שורד לאורך זמן.

---

# ‏79. אל תכוון Score על Trade בודד

‏מניה אחת שקיבלה Rank #1 והפסידה אינה הוכחה שהScore גרוע.

‏וגם מניה אחת שהרוויחה אינה הוכחה שהוא טוב.

‏אנחנו צריכים:

```text
many observations
```

‏ואז לנתח התפלגות.

---

# ‏80. אבל כל כישלון עדיין שימושי ל־RCA

‏הגישה הנכונה היא:

```text
single failure -> investigate
many similar failures -> hypothesis
hypothesis -> measurable experiment
experiment -> score change only if validated
```

‏לא משנים נוסחה מיד אחרי עסקה אחת.

---

# ‏81. `Score Drift`

‏ייתכן Score שעבד חודשיים ופתאום מפסיק.

‏צריך לנטר:

```text
Top-1 forward return
Top-1 hit rate
score bucket outcomes
rank separation
trade frequency
cost-adjusted edge
```

‏ולראות אם הקשר בין Score לתוצאה משתנה.

---

# ‏82. Score Distribution

‏כדאי לדעת איך הציונים מתפלגים.

‏לדוגמה:

```text
Most stocks: 20-40
Top 10:      70-85
Top 1:       94
```

‏לעומת יום שבו:

```text
Most stocks: 60-70
Top 10:      75-78
Top 1:       79
```

‏אותו Score מוחלט יכול לקבל משמעות שונה בהקשר שוק אחר.

---

# ‏83. `Cross-Sectional Z-Score`

‏אפשר למדוד כמה חריגה המניה ביחס לשוק:

```text
z = (value - market_mean) / market_std
```

‏בפשטות:

> ‏כמה רחוק הנתון מהממוצע של שאר המניות.

‏זה יכול להיות שימושי, אבל Outliers יכולים להשפיע מאוד.

---

# ‏84. Robust Ranking

‏במקום Mean/Std אפשר להשתמש בשיטות עמידות יותר כמו:

```text
median
percentiles
winsorization
clipping
```

‏המטרה היא שמניה חריגה בטעות לא תשבור את כל הסקאלה.

---

# ‏85. `Clipping`

‏נניח Feature בדרך כלל 0–5, אבל פעם אחת הגיע 500 בגלל נתון בעייתי.

‏אפשר להגביל:

```text
normalized = min(value, cap)
```

‏או לפסול את הנתון.

‏זה מונע Outlier אחד להשתלט על Score.

---

# ‏86. Score צריך להיות דטרמיניסטי

‏אם נותנים בדיוק אותו Snapshot ואותה Version, צריך לקבל בדיוק אותו Score.

‏זה חשוב ל:

```text
Replay
Backtest
Debugging
RCA
```

---

# ‏87. Score מהיר

‏בסריקה של אלפי מניות, חישוב Score צריך להיות זול יחסית.

‏עדיף:

```text
precomputed features
+ simple aggregation
```

‏מאשר לבצע Query כבד או לחשב היסטוריה מחדש עבור כל מניה בכל מחזור.

---

# ‏88. `Fast Score` מול `Deep Score`

‏אפשר להשתמש בשתי שכבות:

```text
All stocks
    ↓
Fast Score
    ↓
Top 20
    ↓
Deep Score
    ↓
Top Candidate
```

‏Fast Score משתמש בFeatures זולים.

‏Deep Score יכול להשתמש בנתונים עשירים יותר.

---

# ‏89. למה זה מתאים למערכת שלך

‏אתה רוצה לסרוק את כל השוק בתדירות גבוהה.

‏אין הכרח לחשב Feature עמוק ויקר על 4,000 מניות בכל 100ms.

‏אפשר:

```text
cheap wide ranking
→ expensive narrow ranking
```

‏זה גם מהיר וגם גמיש.

---

# ‏90. `Candidate Promotion`

‏אפשר להגדיר:

```text
Fast Rank Top 20
→ promote to deep observation
```

‏ואז לקבל עבורן Feed עשיר יותר או לחשב Features נוספים.

‏זו המשך ישיר של Wide Scan / Deep Observation משלב 05.

---

# ‏91. `Candidate Demotion`

‏כאשר מניה כבר אינה Top Candidate:

```text
demote
unsubscribe deep feed
```

‏כך שומרים משאבים למועמדות החדשות.

---

# ‏92. Top-1 לא חייב להיות Trade

‏נחזור לעיקרון הכי חשוב:

```text
Ranking answers:
Who is best?

Trading decision answers:
Is the best good enough?
```

‏אלה שתי שאלות שונות.

---

# ‏93. Score אינו Risk Management

‏גם Score 99 אינו אומר:

```text
use all capital
ignore stop
ignore daily risk
```

‏Score מדרג הזדמנות.

‏Risk Engine מחליט כמה מותר לסכן.

‏אלה רכיבים שונים.

---

# ‏94. Score אינו Execution

‏Score יכול לומר:

```text
XYZ is best
```

‏אבל Execution Engine עדיין צריך לשאול:

```text
Is quote fresh?
What is current Ask?
Did spread widen?
Can we still get filled?
Is signal too old?
```

‏לכן יש Recheck לפני Order.

---

# ‏95. Score אינו Exit Logic

‏אותו דבר ביציאה.

‏המניה הייתה Rank #1 בזמן הכניסה.

‏זה לא אומר שמחזיקים אותה לנצח כל עוד היא “עדיין יחסית טובה”.

‏Exit Logic צריך להיות מוגדר בפני עצמו.

---

# ‏96. `Score Confidence`

‏אפשר להפריד בין:

```text
score
confidence
```

‏למשל Score גבוה על מעט נתונים אולי יקבל Confidence נמוך.

‏Confidence יכול לקחת בחשבון:

```text
data completeness
sample count
feature agreement
stability
```

---

# ‏97. Feature Agreement

‏נניח:

```text
Momentum says strong
Acceleration says strong
Activity says strong
Liquidity says strong
```

‏יש “הסכמה”.

‏לעומת:

```text
Momentum says extremely strong
Everything else says weak
```

‏יכול להיות שהScore הכולל דומה, אבל הסיפור שונה.

---

# ‏98. `Consensus Score`

‏אפשר למדוד כמה Sub-Scores חיוביים יחד.

‏לדוגמה:

```text
4/4 strong
```

‏לעומת:

```text
1/4 extremely strong
```

‏גם זה Feature מחקרי אפשרי.

---

# ‏99. Score Compression

‏אם רוב המניות מקבלות:

```text
82-84
```

‏הScore לא מפריד טוב.

‏אם הטווח רחב יותר:

```text
20-95
```

‏יכול להיות שקל יותר להבחין.

‏אבל טווח רחב לבדו אינו הוכחה לאיכות.

---

# ‏100. Score Separation צריך להיבדק מול Outcome

‏השאלה היא לא אם הפער יפה.

‏השאלה היא:

```text
When gap_1_2 is large,
does Top-1 perform better?
```

‏זו בדיקה אמפירית.

---

# ‏101. `Score Entropy` — רעיון מתקדם

‏בפשטות, אפשר למדוד אם הדירוג “מרוכז” במועמדת אחת או מפוזר על הרבה מועמדות דומות.

‏לא חייבים להשתמש במדד מתמטי מורכב.

‏הרעיון הוא:

```text
one obvious winner
vs
many almost-equal candidates
```

‏זה יכול להשפיע על Confidence.

---

# ‏102. Score ו־Opportunity Frequency

‏אם Score מחמיר מדי:

```text
0 trades per day
```

‏אין שימוש מעשי.

‏אם הוא מקל מדי:

```text
500 low-quality trades
```

‏גם בעיה.

‏לכן צריך למדוד:

```text
quality
AND
opportunity count
```

---

# ‏103. אצלך מספר עסקאות הוא לא יעד בפני עצמו

‏גם אם אתה מעוניין בהרבה עסקאות ביום, לא נכריח את המערכת לייצר אותן.

‏המטרה היא:

```text
many valid opportunities
```

‏לא:

```text
many trades at any cost
```

---

# ‏104. `Minimum Edge Threshold`

‏אפשר להגדיר שהמועמדת חייבת לעבור סף מינימלי.

‏לדוגמה:

```text
predicted gross edge > estimated round-trip cost + safety margin
```

‏זה מתקדם יותר מסף Score שרירותי.

---

# ‏105. `Safety Margin`

‏אם אנחנו מעריכים עלות של:

```text
$0.50
```

‏לא בהכרח מספיק לחזות:

```text
$0.51 profit
```

‏כי יש אי־ודאות.

‏אפשר לדרוש Margin נוסף.

---

# ‏106. `Confidence-adjusted Edge`

‏רעיון מתקדם יותר:

```text
expected_edge * confidence
```

‏או מנגנון אחר שמעניש תחזית לא ודאית.

‏לא חייבים להשתמש בנוסחה הזאת, אבל חשוב להבין שה־mean לבדו אינו כל התמונה.

---

# ‏107. Machine Learning אינו חובה

‏Score ידני טוב יכול להיות מצוין.

‏לא צריך לקפוץ מיד ל:

```text
XGBoost
Neural Network
Deep Learning
```

‏קודם צריך:

```text
correct data
correct labels
correct backtest
strong baseline
```

---

# ‏108. מתי `ML` כן יכול להיכנס בעתיד

‏אם יש לנו הרבה Features ויחסים לא־ליניאריים, מודל ML יכול ללמוד פונקציית דירוג.

‏לדוגמה:

```text
features -> predicted future return
```

‏או:

```text
features -> probability(target_hit_before_stop)
```

‏אבל כל בעיות ה־data leakage, overfitting והexecution נשארות.

---

# ‏109. `Learning to Rank`

‏יש גם משפחת מודלים שמטרתם לא לחזות מחיר ישירות, אלא ללמוד:

> ‏איזו מועמדת צריכה להיות מעל איזו מועמדת.

‏זה נקרא:

`Learning to Rank`

‏זה מתקדם, אבל רעיונית מתאים מאוד למערכת שכל מטרתה לבחור את הטובה ביותר מתוך קבוצה.

---

# ‏110. למה לא מתחילים שם

‏כי אם אין לנו Label טוב, Backtest אמין ונתונים נקיים — מודל מתקדם רק ילמד את הטעויות שלנו בצורה מתוחכמת יותר.

‏לכן:

```text
simple -> measurable -> validated -> more complex
```

---

# ‏111. Best Practice — ציון צריך להיות ניתן לשחזור

‏לכל Trade צריך להיות אפשר לשחזר:

```text
input snapshot
features
normalization state
weights
subscores
final score
rank
score version
```

‏אם לא ניתן לשחזר — קשה מאוד לבצע RCA אמיתי.

---

# ‏112. Best Practice — שמור גם את המתחרים

‏לכל החלטה שמור:

```text
Rank 1
Rank 2
Rank 3
...
Top N
```

‏כולל Features שלהם.

‏כך אפשר לגלות למה האלגוריתם בחר במניה הלא נכונה.

---

# ‏113. Best Practice — אל תערבב Signal ו־Execution בתוך אותו Score בלי סיבה

‏מומנטום ויכולת ביצוע הם שני דברים שונים.

‏טוב שהמערכת תדע לומר:

```text
Prediction strong
Execution weak
```

‏במקום רק:

```text
Final Score = 71
```

---

# ‏114. Best Practice — הפוך Score ל־Observable

‏ב־UI או Logs כדאי לראות:

```text
Symbol
Rank
Final Score
Momentum
Activity
Liquidity
Consistency
Gap to #2
Signal Age
```

‏זה עוזר מאוד בזמן Live.

---

# ‏115. Best Practice — שמור Reason Codes

‏אפשר ליצור שדות כמו:

```text
TOP_REASON_1 = MOMENTUM_ACCELERATION
TOP_REASON_2 = TRADE_RATE
TOP_REASON_3 = TIGHT_SPREAD
```

‏כך אפשר לנתח מאוחר יותר אילו סיבות נפוצות בעסקאות מוצלחות וכושלות.

---

# ‏116. Anti-pattern — “עוד Feature תמיד משפר”

‏לא נכון.

‏Feature חדש יכול:

- ‏להוסיף רעש.
- ‏לספור מידע קיים פעמיים.
- ‏לגרום Overfitting.
- ‏להאט את הסורק.
- ‏להקשות להבין כישלון.

---

# ‏117. Anti-pattern — כיוון משקלים לפי תחושת בטן בלבד

‏מותר להתחיל כך בשביל Baseline.

‏אבל אסור להישאר שם.

‏צריך לבדוק תוצאות ולבצע ניסוי מסודר.

---

# ‏118. Anti-pattern — אופטימיזציה לפי יום טוב אחד

‏יום אחד יכול להיות חריג.

‏צריך לבדוק תקופות רבות ומצבי שוק שונים.

---

# ‏119. Anti-pattern — ציון בלי `NO TRADE`

‏אם בכל מחזור חייבים לבחור Winner ולסחור בו, המערכת תסחור גם כשכולם גרועים.

‏לכן Ranking חייב להיות מופרד מ־Eligibility למסחר.

---

# ‏120. Anti-pattern — לחשוב שRank #1 חייב להצליח

‏Rank #1 אומר:

> ‏הכי טוב לפי המודל כרגע.

‏לא:

> ‏בטוח יעלה.

‏גם מודל טוב יחטיא פעמים רבות.

---

# ‏121. Anti-pattern — לשפר Score אחרי כל הפסד

‏אם כל הפסד גורם לשינוי נוסחה, נבנה מודל שתפור להיסטוריה.

‏במקום זאת:

```text
log
classify
aggregate
form hypothesis
test
then change
```

---

# ‏122. טבלת דוגמה מלאה

| Rank | Symbol | Final | Momentum | Activity | Liquidity | Consistency | Gap |
|---:|---|---:|---:|---:|---:|---:|---:|
| 1 | `AAA` | 92 | 95 | 91 | 89 | 94 | 7 |
| 2 | `BBB` | 85 | 90 | 84 | 92 | 76 | — |
| 3 | `CCC` | 81 | 87 | 93 | 65 | 79 | — |

‏כאן `AAA` אינה רק בעלת הציון הגבוה ביותר.

‏אפשר גם לראות **למה**.

---

# ‏123. דוגמה שבה מקום ראשון לא צריך להיסחר

```text
#1 AAA score 61
#2 BBB score 59
#3 CCC score 58

Minimum quality = 80
```

‏החלטה:

```text
NO TRADE
```

‏למרות שיש Rank #1.

---

# ‏124. דוגמה שבה Score גבוה אבל Execution לא תקין

```text
PredictionScore = 97
LiquidityScore  = 18
Spread          = huge
```

‏החלטה יכולה להיות:

```text
NO TRADE
```

‏אסור למומנטום “לקנות” זכות להתעלם מביצוע גרוע.

---

# ‏125. דוגמה שבה Rank #2 אולי חשוב למחקר

```text
#1 AAA = Score 92 -> forward 10s -0.05%
#2 BBB = Score 91 -> forward 10s +0.18%
```

‏במקרה אחד זה מקרי.

‏אם זה חוזר על עצמו, צריך לבדוק Feature שמבדיל בין BBB ל־AAA.

---

# ‏126. Score Research Table מומלצת

‏לכל Observation אפשר לשמור:

```text
timestamp
symbol
rank
score
subscores
features
score_version
universe_size
eligible_count
gap_1_2
rank_persistence
forward_1s
forward_2s
forward_5s
forward_10s
forward_30s
forward_60s
time_to_first_profit
time_to_target
MFE
MAE
```

‏זה בסיס מצוין למחקר.

---

# ‏127. בדיקות חובה לכל Score חדש

‏לפני שמאמינים בו, בדוק:

1. ‏האם Score גבוה יותר מוביל לתוצאה טובה יותר?
2. ‏האם Top-1 טוב יותר מ־Top-5/10?
3. ‏האם זה נשאר נכון אחרי עלויות?
4. ‏האם זה נשאר נכון בתקופות חדשות?
5. ‏האם זה עובד בכמה Regimes?
6. ‏האם התוצאה נשענת על כמה Outliers?
7. ‏האם Feature אחד שולט כמעט לבד?
8. ‏האם Rank #1 יציב מספיק?
9. ‏האם Separation מנבא איכות?
10. ‏האם המודל מספיק מהיר ל־Live?

---

# ‏128. סדר פיתוח מומלץ לScore

```text
1. Build a very simple baseline
2. Measure rank quality
3. Add one feature family
4. Run ablation
5. Check out-of-sample
6. Measure execution-adjusted result
7. Keep only proven improvements
8. Version everything
```

---

# ‏129. מה זה `Ablation` בהקשר הזה

‏נניח Score משתמש ב:

```text
Momentum
Acceleration
Activity
Liquidity
```

‏נבדוק:

```text
Score without Momentum
Score without Acceleration
Score without Activity
Score without Liquidity
```

‏אם הסרת Feature לא משנה כלום — ייתכן שהוא מיותר.

---

# ‏130. `Sensitivity Analysis`

‏אם משקל Activity הוא 20%, נבדוק גם:

```text
10%
15%
20%
25%
30%
```

‏אם רק 20.000% עובד וכל שינוי קטן הורס הכול — זה סימן חשוד ל־Overfitting.

---

# ‏131. `Robust Region`

‏מודל טוב עדיף שיעבוד סביר על טווח פרמטרים.

‏לדוגמה:

```text
Activity weight 15%-30%
all reasonably good
```

‏זה יותר משכנע ממודל שעובד רק בנקודה אחת מדויקת.

---

# ‏132. `Rank IC` — מושג מתקדם

‏בעולם Quant משתמשים לעיתים במדדים שבודקים קשר בין הדירוג של האות לבין התוצאה העתידית.

‏אחד הרעיונות הוא:

`Information Coefficient`

‏בפשטות:

> ‏האם מי שקיבל Rank גבוה נוטה באמת לקבל Outcome גבוה יותר?

‏אין חובה להשתמש בשם הזה במערכת, אבל חשוב להכיר את הרעיון.

---

# ‏133. Spearman Rank Correlation

‏מדד שימושי למחקר דירוג הוא קשר בין:

```text
predicted rank
```

‏לבין:

```text
future return rank
```

‏אם הקשר חיובי באופן יציב, זה סימן שהRanking נושא מידע.

‏נלמד סטטיסטיקה לעומק בפרקים המתאימים.

---

# ‏134. NDCG / Ranking Metrics

‏בעולם `Learning to Rank` קיימים מדדים כמו `NDCG`.

‏אין צורך להשתמש בהם בשלב הראשון.

‏אבל הרעיון החשוב הוא:

> ‏אפשר למדוד איכות דירוג עצמו, לא רק PnL.

---

# ‏135. למה עדיין PnL נטו הוא מבחן הסיום

‏Score יכול להיראות מצוין סטטיסטית אבל להיות בלתי סחיר בגלל עלויות.

‏לכן בסוף:

```text
Good ranking
+ executable trades
- all costs
= real value
```

---

# ‏136. Score והעמלה שלך

‏אם אתה מחפש רווח קטן מאוד, Score צריך בסופו של דבר להעדיף הזדמנויות שבהן:

```text
expected move
>> round-trip friction
```

‏לא רק מניות “מרשימות”.

---

# ‏137. `Net Edge Ranking`

‏יעד עתידי חזק יכול להיות לדרג לפי:

```text
Expected Net Edge
```

‏במקום:

```text
Raw Momentum
```

‏כלומר מניה מעט פחות מהירה אבל הרבה יותר זולה לביצוע יכולה לנצח.

---

# ‏138. `Opportunity Cost`

‏כאשר בחרנו AAA, ויתרנו זמנית על BBB, CCC ושאר השוק.

‏לכן Ranking הוא גם החלטת הקצאת הון.

‏במערכת עם הון קטן ופוזיציה אחת עיקרית, זה משמעותי במיוחד.

---

# ‏139. `Capital Efficiency`

‏בעתיד אפשר להסתכל גם על:

```text
expected net profit per dollar
```

‏או:

```text
expected net profit per second of capital usage
```

‏כי עסקה שתוקעת הון לדקה עשויה להיות פחות מעניינת מעסקה שמחזירה אותו אחרי 5 שניות.

---

# ‏140. `Edge per Unit Time`

‏רעיון שמתאים במיוחד למטרה שלך:

```text
Expected Net Edge / Expected Holding Time
```

‏למשל:

```text
Trade A: +$1 expected in 5s
Trade B: +$2 expected in 60s
```

‏Trade B מרוויח יותר לעסקה, אבל A עשויה להיות יעילה יותר בזמן.

‏כמובן שההשוואה חייבת לכלול סיכון ועלויות.

---

# ‏141. אסור למקסם `Edge per second` בלי סיכון

‏אם עסקה נותנת:

```text
+$1 often
-$100 occasionally
```

‏היא לא טובה רק כי רוב הזמן היא מהירה.

‏תמיד צריך לחבר:

```text
return
risk
cost
frequency
time
```

---

# ‏142. Score טוב הוא מערכת השערות

‏כל רכיב אומר:

> ‏אני חושב שהדבר הזה עוזר לזהות Opportunity טובה יותר.

‏והמחקר צריך לענות:

> ‏האם זה באמת נכון?

‏זו צורת החשיבה המקצועית.

---

# ‏143. Score הוא לא המקום האחרון בשיפור

‏אם Rank #1 נכשל, הסיבה לא תמיד Score.

‏ייתכן:

```text
bad data
latency
bad entry
spread widening
partial fill
market regime
exit logic
```

‏לכן RCA תמיד בודק את כל השרשרת.

---

# ‏144. איך Score מתחבר לכל המערכת

```text
Market Data
    ↓
Features
    ↓
Filters
    ↓
Sub-Scores
    ↓
Final Score
    ↓
Cross-Sectional Ranking
    ↓
Top Candidates
    ↓
Trade / No Trade
    ↓
Execution Recheck
    ↓
Order
```

‏ה־Score הוא חלק אחד בשרשרת, לא כל האלגוריתם.

---

# ‏145. מבנה גרסה ראשונה מומלץ למחקר

‏לא כהמלצת מסחר, אלא כBaseline מחקרי פשוט:

```text
MomentumScore
ActivityScore
LiquidityScore
ConsistencyScore
```

‏עם:

```text
percentile normalization
simple fixed weights
full score decomposition
Top-N logging
```

‏ואז בודקים אם כל רכיב מוסיף משהו.

---

# ‏146. מה לא להכניס מיד לגרסה הראשונה

‏אין צורך להתחיל עם:

- ‏50 Features.
- ‏Deep Learning.
- ‏Dynamic weights לכל שעה ביום.
- ‏עשרות Exceptions.
- ‏Score שונה לכל Symbol.
- ‏Auto-tuning בזמן Live.

‏כל אלה יכולים להגיע רק אם הנתונים מוכיחים צורך.

---

# ‏147. השאלות שהמערכת צריכה לענות בכל רגע

```text
Who is #1?
Why is it #1?
How far ahead of #2?
Is #1 good enough?
How stable is #1?
Is the data fresh?
Is it executable now?
What did #2/#3 look like?
Which score version produced this?
```

‏אם אין תשובות — הדירוג אינו מספיק Observable.

---

# ‏148. מה צריך לזכור משלב 14

‏אם תזכור רק 12 נקודות:

1. ‏`Score` ו־`Rank` אינם אותו דבר.
2. ‏Score 90 אינו 90% הצלחה אלא אם בנו אותו כהסתברות מכוילת.
3. ‏צריך לנרמל Features לפני שמחברים יחידות שונות.
4. ‏Percentile/Rank מתאימים מאוד להשוואה של כל השוק.
5. ‏Top-1 אינו בהכרח טוב מספיק למסחר.
6. ‏Sub-Scores ו־Score decomposition מאפשרים להבין למה מניה ניצחה.
7. ‏מקום ראשון צריך להוכיח שהוא טוב יותר סטטיסטית מ־Top 5/10 ומשאר השוק.
8. ‏`Separation Gap`, ‏Rank Stability ו־Rank Churn יכולים להיות מידע שימושי.
9. ‏הScore צריך להיות מותאם ל־Holding Horizon שאנחנו באמת סוחרים בו.
10. ‏כל גרסת Score חייבת להיות Versioned, reproducible וניתנת ל־RCA.
11. ‏מורכבות נוספת נכנסת רק אם היא מנצחת Baseline פשוט על מידע חדש.
12. ‏מבחן הסיום אינו Score יפה אלא `Net Edge` אמיתי אחרי Execution ועלויות.

---

# ‏149. בדיקת הבנה עצמית

‏נסה לענות בלי לחזור למעלה:

1. ‏מה ההבדל בין Feature, Score ו־Rank?
2. ‏למה Score 95 אינו בהכרח 95% הצלחה?
3. ‏למה אי אפשר לחבר Trade Count ו־Spread גולמיים בלי Normalization?
4. ‏למה מקום ראשון עדיין יכול להוביל ל־NO TRADE?
5. ‏מהו Separation Gap?
6. ‏למה חשוב לשמור Top-N ולא רק את הזוכה?
7. ‏מהו Rank Persistence?
8. ‏למה אותו Score יכול לעבוד אחרת ב־5 שניות וב־60 שניות?
9. ‏מהו Score Decomposition?
10. ‏למה Baseline פשוט חשוב?
11. ‏מהו Winner's Curse בסריקה של אלפי מניות?
12. ‏מה מבחן הסיום האמיתי של Score?

---

# ‏Checkpoint

‏שלב 14 הגדיר איך עוברים מ־Features רבים למערכת דירוג ברורה, מדידה וניתנת להסבר. למדנו Weighted Scores, Percentiles, Sub-Scores, Rank Buckets, Separation, Stability, Calibration, Expected Edge, Versioning, RCA ו־Best Practices — ובעיקר למה `Rank #1` הוא רק תחילת החלטת המסחר ולא סופה.

‏בשלב 15 נעבור ל־**בחירת Top Candidate והחלטת `Trade / No Trade`**: מתי המקום הראשון באמת מספיק טוב כדי להצדיק עסקה, איך משתמשים ב־minimum quality, confidence, separation, signal age ו־execution readiness, ומתי ההחלטה הנכונה היא פשוט לא לסחור.