# ‏שלב 22 — איך יודעים שה־Scanner באמת מנבא

> ‏מטרת הפרק: לבדוק בצורה מקצועית האם ה־`Scanner` באמת מזהה מניות שסביר יותר שימשיכו בכיוון הרצוי בזמן הקצר שאנחנו מחפשים — ולא רק מייצר `Score` שנראה משכנע.
>
> ‏העיקרון המרכזי: **Scanner טוב צריך להוכיח שלמיקום גבוה בדירוג יש קשר עקבי לתוצאה עתידית טובה יותר, בטווח הזמן הרלוונטי, לפני עלויות וגם אחריהן.**
>
> ‏כמו בכל הקורס: קודם נלמד את הידע המקצועי הכללי, אחר כך את ה־Best Practices ורזי המקצוע, ולבסוף נתאים אותו לרובוט שלך — סריקה של כל השוק, בחירת Top Candidate והחזקה של שניות בודדות ועד בערך דקה.

---

# ‏1. השאלה שאנחנו מנסים לענות עליה

‏אחרי שבנינו:

```text
Universe
→ Filters
→ Features
→ Score
→ Rank
→ Top Candidate
```

‏אנחנו חייבים לבדוק:

> ‏האם המניה שקיבלה Rank גבוה באמת נוטה להתנהג טוב יותר בעתיד הקרוב?

‏לא מספיק לבדוק כמה עסקאות הרוויחו.

‏צריך לבדוק את **איכות החיזוי של הדירוג עצמו**.

---

# ‏2. שלוש שכבות שונות של הצלחה

‏חשוב להפריד בין:

1. ‏`Prediction Quality` — האם הדירוג מנבא תנועה עתידית?
2. ‏`Decision Quality` — האם הבחירה לבצע או לא לבצע טובה?
3. ‏`Execution Quality` — האם הצלחנו לממש את ההזדמנות בפועל?

‏Scanner יכול להיות מצוין בשכבה הראשונה אבל להפסיד בגלל ביצוע גרוע.

‏ולהפך — ביצוע טוב לא יכול להציל Scanner שאין לו Edge.

---

# ‏3. למה לא להתחיל מ־PnL בלבד

‏אם מסתכלים רק על:

```text
Total PnL
```

‏אנחנו מערבבים יחד:

- ‏איכות Signal.
- ‏איכות Ranking.
- ‏החלטת Trade/No Trade.
- ‏Entry.
- ‏Exit.
- ‏Position Sizing.
- ‏Costs.
- ‏Execution.

‏אם התוצאה גרועה, לא נדע איפה הבעיה.

‏לכן בשלב הזה אנחנו רוצים לבודד קודם את ה־Scanner.

---

# ‏4. מהו `Forward Return`

‏`Forward Return` הוא השינוי במחיר **אחרי** זמן ההחלטה.

‏לדוגמה:

```text
Signal time = 10:15:00
Price at signal = 100.00
Price after 10s = 100.08
Forward Return 10s = +0.08%
```

‏זה מאפשר לשאול:

> ‏מה קרה אחרי שה־Scanner דירג את המניה גבוה?

---

# ‏5. צריך כמה Horizons

‏לרובוט שלך אין Horizon אחד בלבד.

‏נרצה למשל:

```text
1s
2s
5s
10s
30s
60s
```

‏למה?

‏כי Strategy יכולה להיות מצוינת ב־5 שניות אבל גרועה ב־60 שניות.

---

# ‏6. `Forward Return Curve`

‏במקום מספר אחד, אפשר לבנות עקומה:

```text
t+1s   +0.01%
t+2s   +0.03%
t+5s   +0.06%
t+10s  +0.09%
t+30s  +0.04%
t+60s  -0.02%
```

‏זה מספר לנו **מתי** ה־Edge מופיע ומתי הוא דועך.

---

# ‏7. למה זה חשוב במיוחד אצלך

‏אם התזה היא:

> ‏"המניה החזקה ביותר עכשיו אמורה להמשיך כמעט מיד"

‏אז הצלחה אחרי 10 דקות אינה בהכרח מעניינת.

‏אנחנו צריכים לראות אם התגובה מופיעה בטווח של שניות.

---

# ‏8. `Hit Rate`

‏`Hit Rate` שואל:

> ‏באיזה אחוז מהמקרים התוצאה עמדה בתנאי הצלחה שהגדרנו?

‏לדוגמה:

```text
Forward Return 10s > 0
```

‏או:

```text
Reached +0.10% before -0.05%
```

---

# ‏9. Hit Rate לבדו אינו מספיק

‏נניח:

```text
80% wins of +0.01%
20% losses of -0.20%
```

‏Hit Rate גבוה מאוד.

‏אבל Expected Value יכול להיות שלילי.

---

# ‏10. `Expected Value`

‏בצורה פשוטה:

```text
EV = P(win) × AvgWin - P(loss) × AvgLoss
```

‏צריך לחשב אותו:

- ‏לפני עלויות.
- ‏אחרי עלויות.

---

# ‏11. `Expected Net Value`

‏למערכת שלנו חשוב יותר:

```text
Expected Net Value
```

‏כלומר:

```text
Forward Opportunity
- Spread
- Slippage
- Fees
- Other Costs
```

---

# ‏12. `MFE` — Maximum Favorable Excursion

‏`MFE` מודד:

> ‏מה היה הרווח המקסימלי הזמין אחרי Signal בתוך חלון מסוים?

‏לדוגמה:

```text
Within 30s:
Best move = +0.18%
MFE = +0.18%
```

---

# ‏13. `MAE` — Maximum Adverse Excursion

‏`MAE` מודד:

> ‏כמה רחוק המחיר הלך נגדנו בתוך אותו חלון?

‏לדוגמה:

```text
Within 30s:
Worst move = -0.07%
MAE = -0.07%
```

---

# ‏14. למה MFE ו־MAE חשובים יותר מסוף החלון

‏נניח:

```text
MFE = +0.20%
Final Return at 30s = 0.00%
```

‏ה־Scanner אולי מצא הזדמנות טובה.

‏אבל Exit לא ניצל אותה.

‏אם נסתכל רק על המחיר אחרי 30 שניות, נחשוב בטעות שה־Scanner נכשל.

---

# ‏15. `Time to First Profit`

‏מדד מרכזי אצלך:

```text
time_to_first_profit
```

‏השאלה:

> ‏כמה זמן עבר מה־Signal עד שהמחיר עבר לראשונה מעל מחיר הייחוס?

---

# ‏16. `Time to Target`

‏מדד נוסף:

```text
time_to_target
```

‏לדוגמה:

```text
Target = +0.10%
Time to target = 7.4s
```

---

# ‏17. `Target Hit Rate`

‏אפשר לשאול:

```text
What % reached +0.05% within 10s?
What % reached +0.10% within 30s?
```

‏זה שימושי יותר מ־"עלה או ירד" בלבד.

---

# ‏18. `Stop Before Target`

‏מדד חשוב:

```text
Target = +0.10%
Adverse threshold = -0.05%
```

‏נבדוק:

> ‏מה הגיע קודם?

‏כך אנחנו מתקרבים לתוצאה שימושית יותר למסחר אמיתי.

---

# ‏19. `Path Matters`

‏שתי מניות יכולות לסיים אחרי 30 שניות ב־+0.10%.

‏אבל:

```text
AAA: +0.10% כמעט ישר
BBB: -0.30% ואז +0.10%
```

‏אלה הזדמנויות שונות לחלוטין.

---

# ‏20. לכן לא מודדים רק End Point

‏נרצה למדוד גם:

- ‏MFE.
- ‏MAE.
- ‏Time to First Profit.
- ‏Time to Target.
- ‏Time to MFE.
- ‏Path volatility.
- ‏Target-before-stop.

---

# ‏21. בדיקת `Rank Buckets`

‏אחת הבדיקות החזקות ביותר היא לחלק את הדירוג לקבוצות.

‏לדוגמה:

```text
Rank 1-10
Rank 11-50
Rank 51-100
Rank 101-500
Rest
```

---

# ‏22. מה אנחנו מצפים לראות

‏אם Ranking טוב, באופן כללי נצפה:

```text
Top bucket > Next bucket > Next bucket > Market baseline
```

‏לא בכל Sample קטן — אלא לאורך זמן ובאופן סטטיסטי יציב.

---

# ‏23. `Rank Monotonicity`

‏`Rank Monotonicity` שואלת:

> ‏האם ככל שה־Rank טוב יותר, התוצאה העתידית משתפרת בצורה עקבית?

‏זה מבחן חזק יותר מאשר לבדוק רק את מקום #1.

---

# ‏24. למה Monotonicity חשובה

‏נניח:

```text
Rank 1      +0.03%
Rank 2-10   +0.08%
Rank 11-50  +0.07%
```

‏יכול להיות שה־Scanner מזהה קבוצה טובה — אבל ה־Score לא יודע למיין אותה נכון.

---

# ‏25. `Top 1` מול `Top N`

‏אנחנו צריכים להשוות:

```text
Top 1
Top 3
Top 5
Top 10
```

‏אם Top 10 מצוין אבל Top 1 לא טוב יותר ממנו, בעיית Ranking קיימת.

---

# ‏26. `Top 1 Premium`

‏אפשר להגדיר:

```text
Top1Premium = Outcome(Top1) - AvgOutcome(Top2..Top10)
```

‏אם אין Premium עקבי, מקום #1 אולי לא באמת מיוחד.

---

# ‏27. `Separation Gap`

‏משלב 14 כבר יש לנו:

```text
Score #1 - Score #2
```

‏עכשיו נבדוק:

> ‏האם Gap גדול יותר באמת קשור לתוצאה טובה יותר?

---

# ‏28. Bucket לפי Separation

‏לדוגמה:

```text
Gap < 1
Gap 1-3
Gap 3-5
Gap > 5
```

‏ואז משווים:

- ‏Forward Return.
- ‏MFE.
- ‏Hit Rate.
- ‏Net EV.

---

# ‏29. `Score Calibration`

‏אם Score גבוה יותר אמור לייצג איכות גבוהה יותר, צריך לבדוק זאת.

‏לדוגמה:

```text
Score 70-75
Score 75-80
Score 80-85
Score 85-90
Score 90+
```

‏האם התוצאות באמת משתפרות?

---

# ‏30. Score אינו הסתברות אוטומטית

‏אם Score = 92, זה לא אומר:

```text
92% chance of success
```

‏אלא אם ביצענו Calibration מפורש שמצדיק פירוש כזה.

---

# ‏31. `Rank Percentile`

‏בגלל שמספר המניות משתנה, לעיתים נוח להשתמש ב־Percentile.

‏לדוגמה:

```text
99.9th percentile
99th percentile
95th percentile
```

‏זה מאפשר השוואה טובה יותר בין רגעים שונים.

---

# ‏32. Cross-Sectional Baseline

‏צריך להשוות את Top Candidate לשוק שהיה זמין באותו רגע.

‏למשל:

```text
Top1 forward return
vs
Median survivor forward return
```

---

# ‏33. Random Baseline

‏בדיקה פשוטה וחזקה:

> ‏מה היה קורה אילו בכל רגע היינו בוחרים באקראי מניה שעברה את אותם Filters?

‏Scanner טוב צריך לנצח את זה באופן עקבי.

---

# ‏34. `Naive Baseline`

‏אפשר להשוות גם למודל פשוט מאוד.

‏לדוגמה:

```text
Rank only by 10s momentum
```

‏אם Score מורכב לא טוב יותר מה־Baseline הזה, המורכבות כנראה לא מוצדקת.

---

# ‏35. Baseline הוא חובה

‏בלי Baseline, קשה לדעת אם המודל באמת מוסיף ערך.

‏מערכת מורכבת שנראית טובה בפני עצמה יכולה להיות גרועה ממדד פשוט אחד.

---

# ‏36. `Counterfactual Top-N`

‏בכל רגע נשמור לא רק את הבחירה האמיתית.

‏נשמור גם:

```text
Rank #1
Rank #2
Rank #3
Rank #5
Rank #10
```

‏ונבדוק את התוצאה העתידית של כולם.

---

# ‏37. למה Counterfactual חשוב

‏אם #1 נכשל אבל #2 ו־#3 הצליחו שוב ושוב, ייתכן שהבעיה אינה באסטרטגיית Momentum עצמה.

‏ייתכן שהבעיה היא בפונקציית הדירוג.

---

# ‏38. `Selection Regret`

‏אפשר למדוד:

```text
BestOutcomeAmongTopN - OutcomeOfChosenCandidate
```

‏זהו סוג של Regret.

---

# ‏39. Regret נמוך

‏אם Regret בדרך כלל קטן:

‏גם כשהבחירה אינה הטובה ביותר, היא קרובה לטובה ביותר.

‏זה סימן טוב למנגנון Ranking.

---

# ‏40. Regret גבוה

‏אם שוב ושוב:

```text
#1 fails
#3 explodes upward
```

‏צריך לחקור Feature weights, interactions או ranking noise.

---

# ‏41. `Opportunity Set Quality`

‏יש שתי שאלות:

1. ‏האם Top N מכיל הזדמנויות טובות?
2. ‏האם Ranking יודע לבחור את הטובה מתוכן?

‏אלה שתי בעיות שונות.

---

# ‏42. Scanner Recall של הזדמנויות

‏אפשר גם לשאול הפוך:

> ‏מבין המניות שהצליחו מאוד בעתיד, איפה הן היו בדירוג בזמן Signal?

---

# ‏43. `Future Winner Recall`

‏לדוגמה:

‏נגדיר Future Winner:

```text
MFE_30s >= +0.20%
```

‏ואז נבדוק:

```text
% winners in Top 10
% winners in Top 50
% winners in Top 100
```

---

# ‏44. למה זה חשוב

‏יכול להיות Scanner עם Precision גבוה אבל Recall נמוך מאוד.

‏כלומר הוא מוצא מעט הזדמנויות טובות, אבל מפספס רוב גדול מהן.

---

# ‏45. Precision מול Recall

‏במונחי Scanner:

- ‏`Precision` — כמה מהמועמדות שבחרנו באמת היו טובות.
- ‏`Recall` — כמה מההזדמנויות הטובות שהיו בשוק הצלחנו לזהות.

---

# ‏46. אצל רובוט Top-1 Precision חשובה במיוחד

‏אם בכל רגע אנחנו קונים רק מניה אחת, Precision בראש הדירוג חשובה מאוד.

‏אבל עדיין כדאי למדוד Recall כדי להבין אם המודל מפספס משפחות של הזדמנויות.

---

# ‏47. `Lift`

‏אפשר למדוד:

```text
Lift = HitRate(TopBucket) / HitRate(Baseline)
```

‏לדוגמה:

```text
Top bucket hit rate = 60%
Baseline = 40%
Lift = 1.5x
```

---

# ‏48. Lift מאפשר להבין ערך יחסי

‏לפעמים 55% נשמע לא מרשים.

‏אבל אם Baseline הוא 35%, זה יכול להיות Edge משמעותי.

---

# ‏49. `Information Coefficient`

‏ברמה המקצועית, אפשר לבדוק Correlation בין:

```text
Score/Rank
```

‏לבין:

```text
Future Return
```

‏זה נקרא לעיתים `Information Coefficient`.

---

# ‏50. IC אינו כל הסיפור

‏Correlation יכול להיות קטן ועדיין שימושי.

‏במיוחד בשוק רועש מאוד.

‏מה שחשוב הוא יציבות, Net EV ויכולת ביצוע.

---

# ‏51. Spearman Rank Correlation

‏כאשר מעניינת אותנו איכות הסדר יותר מאשר קשר ליניארי, `Spearman` יכול להיות שימושי.

‏השאלה:

> ‏האם Score גבוה יותר נוטה להתאים ל־Future Return גבוה יותר?

---

# ‏52. מדידה בכל Snapshot

‏אפשר לחשב Rank correlation בכל נקודת זמן.

‏ואז לנתח את ההתפלגות לאורך ימים ושעות.

---

# ‏53. לא לערבב Snapshots ללא מחשבה

‏אלפי observations מאותה דקה אינם בהכרח אלפי דוגמאות עצמאיות.

‏יש dependence חזק בין Samples קרובים בזמן.

---

# ‏54. `Overlapping Labels`

‏אם מחשבים `Forward Return 30s` כל שנייה:

‏חלונות רבים חופפים.

‏לכן observations אינם עצמאיים.

---

# ‏55. למה זה משנה

‏אפשר לקבל תחושת Sample Size ענקית:

```text
1,000,000 rows
```

‏אבל כמות המידע העצמאי קטנה בהרבה.

---

# ‏56. Event Sampling

‏לעיתים כדאי לבדוק גם Samples המבוססים על אירועים:

- ‏Candidate promotion.
- ‏Rank #1 change.
- ‏Trade decision.
- ‏Score threshold crossing.

‏ולא רק כל Tick.

---

# ‏57. `Candidate Episode`

‏מניה יכולה להיות Rank #1 במשך 12 שניות.

‏במקום לספור 12 Signals נפרדים, אפשר להגדיר Episode אחד.

---

# ‏58. למה Episodes מועילים

‏הם מונעים ניפוח מלאכותי של Sample Size.

‏והם תואמים יותר להחלטה אמיתית של המערכת.

---

# ‏59. `First Entry Opportunity`

‏בכל Episode אפשר לשמור:

```text
first_time_rank1
first_trade_eligible_time
best_score
episode_duration
```

---

# ‏60. Rank Churn

‏נרצה למדוד כמה מהר מקום #1 מתחלף.

```text
AAA → BBB → CCC → AAA
```

‏בתוך כמה שניות יכול להעיד על Ranking רועש.

---

# ‏61. `Rank Persistence`

‏אפשר למדוד:

```text
seconds_in_top1
seconds_in_top3
seconds_in_top10
```

‏ואז לבדוק אם Persistence קשורה לתוצאות טובות יותר.

---

# ‏62. `Rank Velocity`

‏מניה שעלתה:

```text
Rank 300 → 80 → 12 → 1
```

‏יכולה להיות שונה ממניה שנמצאת #1 כבר זמן רב.

---

# ‏63. Rank Acceleration

‏גם קצב השיפור בדירוג יכול להיות Feature מחקרי.

‏אבל שוב — צריך להוכיח אותו בנתונים.

---

# ‏64. `Fresh Rank #1` מול `Aged Rank #1`

‏נשווה:

```text
Just became #1
```

‏מול:

```text
Has been #1 for 20s
```

‏ייתכן שה־Edge שונה.

---

# ‏65. `Signal Decay`

‏נבדוק כמה התוצאה העתידית משתנה כפונקציה של גיל ה־Signal.

‏לדוגמה:

```text
Age 0-1s
Age 1-3s
Age 3-5s
Age 5-10s
```

---

# ‏66. Half-Life של Signal

‏אפשר לחשוב על:

```text
Signal Half-Life
```

‏כמשך הזמן שבו חלק משמעותי מה־Predictive Edge כבר נעלם.

---

# ‏67. Scanner טוב צריך להיבדק לפי זמן

‏אין מספיק לומר:

> ‏"ה־Score עובד."

‏צריך לומר:

> ‏"ה־Score מנבא בעיקר ב־5–20 השניות הראשונות."

---

# ‏68. Intraday Segmentation

‏נבדוק בנפרד:

- ‏Open.
- ‏Morning.
- ‏Midday.
- ‏Afternoon.
- ‏Close.

---

# ‏69. למה Segment לפי שעה

‏אותו Score יכול לעבוד מצוין בפתיחה ולהיות חסר ערך באמצע היום.

---

# ‏70. Regime Segmentation

‏נבדוק גם לפי:

- ‏High volatility.
- ‏Low volatility.
- ‏Broad market up/down.
- ‏High activity.
- ‏Low activity.

---

# ‏71. Symbol Segmentation

‏אפשר לחלק לפי:

- ‏Price buckets.
- ‏Liquidity buckets.
- ‏Market cap buckets.
- ‏Average activity.
- ‏Spread buckets.

---

# ‏72. מטרת Segmentation

‏לא כדי למצוא בכוח תת־קבוצה מנצחת.

‏אלא כדי להבין **איפה ה־Edge קיים ואיפה הוא נשבר**.

---

# ‏73. סכנת Data Mining

‏אם חותכים את הנתונים לעשרות קבוצות עד שאחת נראית מדהים, קל מאוד למצוא False Positive.

‏לכן Segmentation צריך להיות מתוכנן ומאומת Out-of-Sample.

---

# ‏74. Sample Size לכל Bucket

‏לכל תוצאה צריך להציג גם:

```text
N
```

‏לא רק Average.

---

# ‏75. Distribution ולא רק Mean

‏נרצה לראות:

- ‏Median.
- ‏P25/P75.
- ‏P10/P90.
- ‏Tail losses.
- ‏Positive rate.

---

# ‏76. למה Mean יכול להטעות

‏מניה אחת עם מהלך ענק יכולה להרים Average של Bucket שלם.

---

# ‏77. Median

‏Median מספר לנו מה קרה ל־Observation טיפוסי יותר.

---

# ‏78. Tail Analysis

‏במיוחד חשוב לבדוק:

```text
Worst 1%
Worst 5%
```

‏כי Strategy עם Average טוב יכולה עדיין להכיל Tail Risk קשה.

---

# ‏79. Winsorization — בזהירות

‏אפשר להשתמש ב־Winsorization למחקר סטטיסטי מסוים.

‏אבל אסור למחוק Extreme Events מהערכת הסיכון האמיתית.

---

# ‏80. `Net Forward Return`

‏בנוסף ל־Raw Forward Return, נרצה גרסה שמפחיתה עלות ביצוע משוערת.

‏לדוגמה:

```text
NetForward10s = Forward10s - EstimatedRoundTripCost
```

---

# ‏81. למה חשוב להחזיק שתי גרסאות

‏`Gross Forward Return` עוזר לבודד Prediction.

‏`Net Forward Return` עוזר להבין Tradability.

‏לא לערבב ביניהם.

---

# ‏82. `Executable Forward Return`

‏אפשר ללכת צעד נוסף ולהשתמש במחירי:

- ‏Ask לכניסה Long.
- ‏Bid ליציאה.

‏במקום Last/Mid.

---

# ‏83. כך מפרידים שלבים

‏נחזיק למשל:

```text
MidForwardReturn
ExecutableForwardReturn
SimulatedNetReturn
```

‏שלוש שכבות שונות.

---

# ‏84. `Prediction Edge` מול `Execution Edge`

‏אם Mid Forward Return מצוין אבל Executable Return חלש:

‏ה־Scanner אולי מנבא נכון, אבל ההזדמנות אינה ניתנת למימוש ברווח.

---

# ‏85. `Time to Net Profit`

‏לא מספיק לדעת מתי המחיר עבר מעל Entry.

‏נרצה לדעת מתי הוא עבר מעל:

```text
Entry + expected round-trip cost
```

---

# ‏86. זה מדד חשוב במיוחד אצלך

‏כי תנועה של +0.03% אינה מעניינת אם העלות הכוללת היא 0.05%.

---

# ‏87. `Net MFE`

‏אפשר לחשב:

```text
NetMFE = MFE - EstimatedRoundTripCost
```

‏כדי לראות כמה Edge באמת נשאר.

---

# ‏88. `Rank-to-Net-MFE`

‏מבחן חזק:

> ‏האם Rank גבוה יותר מוביל גם ל־Net MFE גבוה יותר?

---

# ‏89. `Winner's Curse`

‏כאשר בוחרים את הערך הקיצוני ביותר מתוך אלפי מניות, הוא עלול להיראות מצוין partly בגלל רעש.

‏לכן מקום #1 צריך להיבדק בזהירות מיוחדת.

---

# ‏90. Regression to the Mean

‏מניה שהגיעה ל־Score קיצוני יכולה לחזור במהירות לממוצע.

‏זה בדיוק מה שאנחנו צריכים לבדוק ולא להניח.

---

# ‏91. Top-1 Diagnostics

‏לכל Rank #1 נשמור לפחות:

```text
score
score_gap
rank_age
score_velocity
price_momentum
activity
spread
liquidity
forward_returns
MFE
MAE
time_to_first_profit
time_to_target
```

---

# ‏92. Why Did #1 Fail?

‏לכל כישלון של מקום #1 נרצה לשאול:

- ‏האם המומנטום האט?
- ‏האם הפעילות נעלמה?
- ‏האם Spread התרחב?
- ‏האם #2 היה טוב יותר?
- ‏האם Signal היה ישן?
- ‏האם זה היה Noise Spike?

---

# ‏93. Failure Taxonomy

‏כדאי לסווג כישלונות.

‏למשל:

```text
REVERSAL
NO_FOLLOW_THROUGH
LOW_LIQUIDITY
LATE_SIGNAL
RANK_CHURN
COST_TOO_HIGH
DATA_ISSUE
```

---

# ‏94. למה Taxonomy חשובה

‏אם 60% מהכישלונות הם `NO_FOLLOW_THROUGH`, זה מוביל למחקר אחר מאשר אם 60% הם `COST_TOO_HIGH`.

---

# ‏95. Success Taxonomy

‏גם הצלחות כדאי לסווג:

```text
IMMEDIATE_CONTINUATION
DELAYED_CONTINUATION
BURST
STEADY_TREND
```

---

# ‏96. Compare Winners vs Losers

‏נשווה Feature distributions בזמן Signal בין:

```text
successful rank1
failed rank1
```

‏זה יכול להוליד Features חדשים.

---

# ‏97. אבל בזהירות מ־Leakage

‏כל Feature חדש חייב להשתמש רק במה שהיה ידוע בזמן Signal.

---

# ‏98. `Ablation by Feature Family`

‏נריץ את Scanner בלי משפחת Features אחת.

‏למשל:

```text
without activity features
without liquidity features
without acceleration features
```

---

# ‏99. מה מודדים ב־Ablation

‏לא רק PnL.

‏גם:

- ‏Rank monotonicity.
- ‏Top1 premium.
- ‏Hit Rate.
- ‏MFE/MAE.
- ‏Net EV.
- ‏Rank stability.

---

# ‏100. Feature Contribution

‏אם הסרת Feature אינה משנה דבר לאורך זמן, ייתכן שהוא מיותר.

---

# ‏101. Redundant Features

‏שני Features יכולים למעשה למדוד כמעט אותו דבר.

‏Score מורכב יותר אינו בהכרח Score טוב יותר.

---

# ‏102. `Marginal Edge`

‏השאלה הנכונה היא:

> ‏כמה Edge נוסף Feature מעבר למה שכבר קיים?

---

# ‏103. Stability Across Days

‏נבדוק Results לפי יום.

‏לא מספיק Average על שנה שלמה.

---

# ‏104. Stability Across Weeks/Months

‏Edge אמיתי צריך לשרוד לפחות חלק משמעותי מתקופות שונות.

‏לא להיות תלוי בשבוע יחיד חריג.

---

# ‏105. `Edge Concentration`

‏נבדוק:

> ‏כמה מהתוצאה הכוללת מגיעה מהימים הטובים ביותר?

---

# ‏106. Concentration גבוהה

‏אם 90% מה־Edge מגיע מ־2 ימים:

‏זה סימן אזהרה משמעותי.

---

# ‏107. `Breadth of Edge`

‏Edge חזק יותר כאשר הוא מופיע:

- ‏בימים רבים.
- ‏בסמלים רבים.
- ‏בשעות שונות.
- ‏בתנאים שונים.

‏גם אם לא באותה עוצמה.

---

# ‏108. Symbol Concentration

‏נבדוק אם Strategy עובדת רק על 3 מניות מסוימות.

---

# ‏109. Excluding Top Symbols

‏בדיקה מעניינת:

> ‏מה קורה אם מסירים את 5 הסמלים שתרמו הכי הרבה?

‏אם כל ה־Edge נעלם, צריך להבין למה.

---

# ‏110. Excluding Best Days

‏אותו דבר ברמת ימים.

---

# ‏111. `Leave-One-Group-Out`

‏אפשר לבצע בדיקות שבהן מסירים:

- ‏יום.
- ‏שבוע.
- ‏Symbol group.
- ‏Regime.

‏ובודקים Robustness.

---

# ‏112. Confidence Intervals

‏ממוצע לבדו אינו מספיק.

‏נרצה גם להבין את אי־הוודאות סביבו.

---

# ‏113. Bootstrap — ברמה רעיונית

‏`Bootstrap` יכול לעזור להעריך Distribution של מדד.

‏אבל Samples תלויי־זמן דורשים זהירות.

---

# ‏114. Block Bootstrap

‏בנתוני זמן לעיתים עדיף לדגום בלוקים ולא observations בודדים.

‏המטרה היא לשמר חלק מהתלות בזמן.

---

# ‏115. Statistical Significance אינה מספיק

‏גם תוצאה "מובהקת" יכולה להיות קטנה מדי כדי לשרוד Costs.

---

# ‏116. Economic Significance

‏אנחנו רוצים:

```text
Statistically credible
AND
Economically meaningful
AND
Executable
```

---

# ‏117. Multiple Testing

‏אם בדקנו 1,000 וריאציות של Score, אחת מהן עלולה להיראות מצוין במקרה.

---

# ‏118. Experiment Registry

‏לכן לכל ניסוי נשמור:

```text
experiment_id
hypothesis
config
code_version
data_version
metrics
result
```

---

# ‏119. Predefine Metrics

‏לפני ניסוי, כדאי להחליט:

> ‏מה ייחשב הצלחה?

‏כך נמנעים מלהחליף מדד אחרי שרואים תוצאה.

---

# ‏120. Primary Metric

‏אפשר לבחור Primary Metric אחד או מעט מאוד.

‏לדוגמה:

```text
NetMFE_10s of Top1
```

‏או:

```text
Target-before-stop rate
```

---

# ‏121. Secondary Metrics

‏בנוסף:

- ‏MAE.
- ‏Time to target.
- ‏Rank stability.
- ‏Top1 premium.
- ‏Opportunity frequency.

---

# ‏122. Trade-Offs

‏מודל חדש יכול:

- ‏לשפר EV.
- ‏אבל להקטין הזדמנויות.
- ‏או לשפר Hit Rate.
- ‏אבל להגדיל Tail Loss.

‏לכן לא מסתכלים על Metric יחיד בלבד.

---

# ‏123. `Opportunity Frequency`

‏כמה פעמים ביום Scanner מוצא Candidate שעובר את הסף?

‏Edge נדיר מאוד יכול להיות פחות שימושי בפועל.

---

# ‏124. Frequency מול Quality

‏אין מטרה אוטומטית למקסם מספר עסקאות.

‏המטרה היא למצוא איזון בין:

```text
quality
frequency
cost
risk
```

---

# ‏125. `No Trade` Validation

‏צריך לבדוק גם רגעים שבהם המערכת החליטה `NO TRADE`.

‏מה קרה אחר כך?

---

# ‏126. למה זה חשוב

‏אם המערכת מסרבת לסחור, אבל שוב ושוב הייתה הזדמנות טובה מאוד מיד אחר כך, Thresholds אולי קשיחים מדי.

---

# ‏127. `Rejected Candidate Analysis`

‏ננתח גם Candidate שנפסלו על ידי Filter או Decision Gate.

---

# ‏128. Accepted vs Rejected

‏נשווה:

```text
Accepted candidates
Rejected candidates
```

‏באותם Forward Outcomes.

---

# ‏129. Filter Value

‏Filter טוב אמור לשפר את Distribution של המועמדות שעוברות.

---

# ‏130. Over-Filtering

‏אם Rejected candidates טובים כמעט כמו Accepted candidates, אולי Filter לא תורם.

---

# ‏131. `Decision Threshold Curve`

‏במקום לבדוק Threshold יחיד:

```text
80
```

‏נבדוק:

```text
70, 72, 74, ... 90
```

---

# ‏132. Robust Region

‏נחפש אזור שבו ביצועים טובים יחסית לאורך כמה Thresholds סמוכים.

‏לא נקודה קסומה אחת.

---

# ‏133. Threshold Cliff

‏אם:

```text
82 = amazing
81 = bad
83 = bad
```

‏זה סימן אפשרי ל־Overfitting או Noise.

---

# ‏134. Score Weight Surface

‏אותו רעיון אפשר לעשות למשקלים מרכזיים.

‏נבדוק Neighborhood, לא רק Best Point.

---

# ‏135. `Rank Stability Under Perturbation`

‏נשנה מעט Inputs או weights.

‏אם Top1 מתהפך לחלוטין בכל שינוי קטן, Ranking יכול להיות שברירי.

---

# ‏136. Stability היא Feature של המערכת

‏לא רק Accuracy חשובה.

‏מערכת יציבה יותר קלה יותר למסחר ולתפעול.

---

# ‏137. `Prediction at Signal` מול `Prediction at Fill`

‏במסחר מהיר חשוב לשמור:

```text
rank_at_signal
score_at_signal
rank_at_fill
score_at_fill
```

---

# ‏138. למה

‏יכול להיות שה־Scanner צדק בזמן Signal, אבל עד ה־Fill המניה כבר ירדה בדירוג.

‏זו בעיית Latency/Execution ולא בהכרח Prediction.

---

# ‏139. `Edge Decay During Execution`

‏נמדוד:

```text
ExpectedEdge_at_signal
ExpectedEdge_at_submit
ExpectedEdge_at_fill
```

---

# ‏140. זו מדידה חשובה מאוד אצלך

‏כי כמה שניות יכולות להיות חלק גדול מחיי ה־Signal.

---

# ‏141. `Scanner Latency Budget`

‏אם Edge Half-Life הוא 3 שניות, Pipeline של 4 שניות אינו מתאים גם אם Prediction טוב.

---

# ‏142. Prediction חייב להיות שימושי בזמן

‏Scanner שמנבא נכון אבל מאוחר מדי אינו שימושי למסחר הזה.

---

# ‏143. `Lead Time`

‏נרצה להבין האם Scanner מזהה את המהלך:

- ‏לפני שהוא קורה.
- ‏בדיוק כשהוא מתחיל.
- ‏או אחרי שכבר התרחש רובו.

---

# ‏144. Late Detection

‏מניה יכולה לקבל Rank #1 כי היא כבר זינקה.

‏אבל השאלה שלנו היא:

> ‏האם נשאר המשך אחרי זמן הבחירה?

---

# ‏145. `Already Moved` Feature

‏נוכל בעתיד לבדוק אם מהלך קודם גדול מדי קשור ל־Exhaustion.

‏אבל זו Hypothesis שצריך להוכיח.

---

# ‏146. Forward Return חייב להתחיל ב־t0 הנכון

‏`t0` הוא הזמן שבו ההחלטה הייתה זמינה.

‏לא זמן מוקדם יותר שנוח ל־Backtest.

---

# ‏147. Decision Time מול Snapshot Time

‏אם Feature computation לוקח זמן, צריך להבדיל בין:

```text
market_event_time
feature_ready_time
decision_time
```

---

# ‏148. No Free Latency

‏אסור ל־Backtest לתת למודל להשתמש בנתון ב־10:00:00.000 ולבצע גם ב־10:00:00.000 אם במציאות computation לוקח זמן.

---

# ‏149. Label Integrity

‏כל Outcome חייב להתחיל אחרי זמן ה־Decision הרלוונטי.

---

# ‏150. Scanner Evaluation Table

‏לכל Observation אפשר לשמור:

```text
as_of_time
symbol
rank
score
score_gap
rank_age
features...
forward_1s
forward_2s
forward_5s
forward_10s
forward_30s
forward_60s
mfe_10s
mae_10s
mfe_30s
mae_30s
time_to_first_profit
time_to_target
```

---

# ‏151. Outcome Table נפרד

‏Best Practice טוב הוא לשמור Inputs ו־Outcomes בצורה נפרדת לוגית.

‏כך קשה יותר להכניס Future Data בטעות ל־Feature computation.

---

# ‏152. Immutable Raw Data

‏הנתונים המקוריים למחקר צריכים להיות immutable ככל האפשר.

‏Derivations נוצרים מעליהם.

---

# ‏153. Dataset Version

‏כל תוצאה חייבת לדעת על איזו גרסת נתונים היא רצה.

---

# ‏154. Code Version

‏אותו דבר לגבי קוד Feature/Score/Filter.

---

# ‏155. Reproducibility

‏אנחנו רוצים להיות מסוגלים לומר:

> ‏"הרץ שוב Experiment 417 וקבל את אותה תוצאה."

---

# ‏156. `Scanner Version`

‏לכל גרסה:

```text
scanner_version
feature_version
filter_version
score_version
```

---

# ‏157. Never Compare Mixed Versions

‏אם אוספים נתוני Live במשך שבוע ובאמצע משנים Score, צריך לשמור Version בכל Observation.

---

# ‏158. Daily Scanner Report

‏בסוף כל יום אפשר להפיק:

- ‏Top1 count.
- ‏Trade eligible count.
- ‏No-trade count.
- ‏Top1 hit rate.
- ‏Forward returns.
- ‏MFE/MAE.
- ‏Time-to-target.
- ‏Top1 premium.
- ‏Rank monotonicity.

---

# ‏159. `Rank Bucket Report`

‏טבלה לדוגמה:

```text
Bucket     N      Fwd5s    Fwd10s   MFE10s   HitRate
1          ...    ...      ...      ...       ...
2-5        ...    ...      ...      ...       ...
6-20       ...    ...      ...      ...       ...
21-100     ...    ...      ...      ...       ...
```

---

# ‏160. `Time-to-Target Distribution`

‏לא רק Average.

‏נרצה Histogram או Quantiles.

---

# ‏161. Survival-Style Thinking

‏אפשר לחשוב על השאלה:

> ‏כמה Candidates עדיין לא הגיעו ל־Target אחרי X שניות?

‏זה נותן תמונה טובה של קצב התממשות ה־Signal.

---

# ‏162. `Failure by Time`

‏אפשר גם לבדוק:

> ‏אחרי כמה שניות חוסר הצלחה מתחיל לנבא שה־Trade כנראה לא יעבוד?

‏זה יחזור לפרק Exit.

---

# ‏163. Scanner ↔ Exit Feedback Loop

‏Scanner validation יכול ללמד אותנו על Exit.

‏לדוגמה:

```text
Most winners reach target within 8s
```

‏אז Time Stop של 60s אולי ארוך מדי.

---

# ‏164. Scanner ↔ Entry Feedback Loop

‏אם Edge חזק רק ב־2 השניות הראשונות:

‏Entry passive ארוך אולי אינו מתאים.

---

# ‏165. Scanner ↔ Infrastructure Feedback Loop

‏אם Signal decay מהיר מאוד:

‏Performance engineering הופך לחלק מה־Strategy.

---

# ‏166. `Predictive Edge Budget`

‏אפשר לחשוב על Edge כתקציב:

```text
Raw Predictive Edge
- Signal Decay
- Entry Friction
- Exit Friction
- Fees
= Net Edge
```

---

# ‏167. איפה Edge נעלם

‏אם Raw Edge גדול אבל Net Edge קטן, נבצע Attribution.

‏זה יעזור לדעת במה להשקיע פיתוח.

---

# ‏168. `Edge Attribution`

‏לדוגמה:

```text
Raw forward edge      +12 bps
Signal delay           -3 bps
Spread                 -2 bps
Slippage               -2 bps
Fees                   -1 bps
Net                     +4 bps
```

---

# ‏169. Scanner Quality Scorecard

‏אפשר לבנות Scorecard פנימי של המודל עצמו:

- ‏Predictive lift.
- ‏Monotonicity.
- ‏Top1 premium.
- ‏Stability.
- ‏Net EV.
- ‏Opportunity frequency.
- ‏Tail risk.
- ‏Robustness.

---

# ‏170. אין Metric קסם

‏מודל טוב הוא כזה שמציג **סט תוצאות עקבי**.

‏לא מספר בודד מרשים.

---

# ‏171. סימני אזהרה

‏חשוד אם:

- ‏Top1 טוב רק בתקופה אחת.
- ‏אין Monotonicity.
- ‏#2-#10 טובים יותר מ־#1.
- ‏התוצאה תלויה ב־Threshold מדויק מאוד.
- ‏רוב ה־Edge מגיע מסמל אחד.
- ‏Gross טוב אבל Net שלילי.
- ‏Live חלש בהרבה מ־Backtest.

---

# ‏172. סימנים טובים

‏נעדיף לראות:

- ‏Rank buckets מסודרים יחסית.
- ‏Top1 premium חיובי.
- ‏אותו כיוון בכמה Horizons.
- ‏Edge במספר תקופות.
- ‏Robustness לפרמטרים.
- ‏Net Edge חיובי.
- ‏Sim-to-Live gap סביר.

---

# ‏173. Scanner אינו צריך להיות מושלם

‏אין צורך ש־Rank #1 יעלה בכל פעם.

‏אנחנו מחפשים יתרון הסתברותי.

---

# ‏174. Edge קטן יכול להיות אמיתי

‏גם שיפור קטן ב־Probability או Expected Move יכול להיות משמעותי אם:

- ‏הוא עקבי.
- ‏ניתן לביצוע.
- ‏העלויות נמוכות ממנו.
- ‏יש מספיק הזדמנויות.

---

# ‏175. אבל Edge קטן רגיש מאוד

‏ככל שה־Edge קטן יותר:

- ‏Costs חשובים יותר.
- ‏Latency חשוב יותר.
- ‏Data Quality חשובה יותר.
- ‏Model error חשוב יותר.

---

# ‏176. `NO EDGE` היא תוצאה תקינה

‏המחקר יכול להראות:

> ‏אין כרגע הוכחה שה־Scanner מנבא.

‏זו תוצאה מקצועית טובה יותר מאשר לכפות Strategy רווחית על הנתונים.

---

# ‏177. תהליך חקירה נכון

‏אם אין Edge:

1. ‏בודקים Data Integrity.
2. ‏בודקים Label/Timeline.
3. ‏בודקים Baseline.
4. ‏בודקים Features.
5. ‏בודקים Ranking.
6. ‏בודקים Segments.
7. ‏מנסחים Hypothesis חדשה.

---

# ‏178. לא לשנות עשרה דברים יחד

‏שינוי גדול מדי מקשה לדעת מה באמת עזר.

‏נעדיף ניסוי מדיד וממוקד.

---

# ‏179. One Change at a Time

‏במיוחד בתחילת המחקר:

```text
Baseline
→ change one feature/filter/weight
→ compare
```

---

# ‏180. אבל לא להפוך לדוגמה קשיחה

‏בהמשך אפשר לבדוק גם Models שמבצעים interactions מורכבים.

‏אבל תמיד צריך Baseline והשוואה הוגנת.

---

# ‏181. `Champion / Challenger`

‏בהמשך נוכל להחזיק:

```text
Champion scanner
Challenger scanner
```

‏ולהשוות אותם על אותם Events.

---

# ‏182. Shadow Ranking

‏Challenger יכול לדרג את השוק בלי לשלוח פקודות.

‏כך נאסוף Evidence Live.

---

# ‏183. Why Shadow Matters

‏Backtest אינו יכול לדמות כל פרט של Live.

‏Shadow Mode נותן בדיקה חשובה בין Research ל־Money.

---

# ‏184. Scanner Diagnostic Snapshot

‏כאשר Rank #1 נוצר, נשמור Snapshot מספיק מלא כדי לשחזר:

```text
Why this symbol?
Why now?
Why not #2?
```

---

# ‏185. Explainability אינה קישוט

‏אם לא ניתן להסביר למה #1 ניצח, RCA נעשה קשה מאוד.

---

# ‏186. `Score Decomposition`

‏למשל:

```text
MomentumSubScore     31
ActivitySubScore     24
LiquiditySubScore    18
FreshnessSubScore    12
Other                8
Total                93
```

---

# ‏187. Compare Decomposition #1 vs #2

‏זה מאפשר להבין מה בדיוק הכריע את הדירוג.

---

# ‏188. Failed Decision Replay

‏לכישלון מעניין נרצה Replay של כמה שניות לפני ואחרי Signal.

---

# ‏189. Replay Questions

‏במהלך Replay נשאל:

- ‏מתי המניה נכנסה Top 10?
- ‏מתי הגיעה #1?
- ‏מה עשתה הפעילות?
- ‏מה עשה Spread?
- ‏מתי התחילה ההאטה?
- ‏מה עשה #2 באותו זמן?

---

# ‏190. RCA לפני שינוי Model

‏לא משנים Weight בגלל Trade בודד.

‏קודם מחפשים Pattern חוזר.

---

# ‏191. `Failure Cluster`

‏נחפש קבוצות כישלון דומות.

‏לדוגמה:

```text
High momentum
Low activity persistence
Wide spread
Fast reversal
```

---

# ‏192. Cluster יכול להפוך ל־Hypothesis

‏למשל:

> ‏"Momentum גבוה ללא acceleration בפעילות נוטה להיכשל."

‏ואז בודקים את זה פורמלית.

---

# ‏193. Hypothesis לפני Feature

‏עדיף:

```text
Observation → Hypothesis → Feature → Test
```

‏מאשר להמציא מאות Features אקראיים.

---

# ‏194. `Research Debt`

‏אם כל כישלון מוסיף עוד Filter/Feature, המודל נהיה קשה לתחזוקה וקל ל־Overfit.

---

# ‏195. Feature Retirement

‏Features שאינם מוסיפים Edge צריכים לצאת.

‏זה נושא שנעמיק בו בהמשך הקורס.

---

# ‏196. `Minimum Evidence Bar`

‏לפני Feature חדש ב־Production נרצה Evidence מוגדר.

‏למשל:

- ‏Out-of-sample improvement.
- ‏Robustness.
- ‏No material tail degradation.
- ‏Operational feasibility.

---

# ‏197. `Scanner Validation Pipeline`

‏תהליך מוצע:

```text
Historical Market Events
→ Point-in-Time Features
→ Filters
→ Score
→ Full Market Ranking
→ Snapshot Ledger
→ Forward Outcome Labels
→ Bucket/TopN Analysis
→ Net/Execution Adjustment
→ Robustness Tests
→ RCA
```

---

# ‏198. שלב ראשון במחקר

‏ראשית בודקים:

```text
Does rank predict future movement at all?
```

---

# ‏199. שלב שני

‏אחר כך:

```text
Is Top1 materially better than alternatives?
```

---

# ‏200. שלב שלישי

‏ואז:

```text
Does the edge survive executable prices and costs?
```

---

# ‏201. שלב רביעי

‏ואז:

```text
Does it survive out-of-sample and different regimes?
```

---

# ‏202. שלב חמישי

‏ולבסוף:

```text
Does live/shadow behavior resemble research?
```

---

# ‏203. Baseline ראשוני לרובוט שלך

‏בגרסה פשוטה, הייתי מתחיל Report עם:

```text
Top1 Forward Return: 1s/2s/5s/10s/30s/60s
Top1 MFE/MAE: 10s/30s/60s
Time to First Profit
Time to +5/+10/+20 bps
Top1 vs Top2-5
Top1 vs Top6-20
Top1 vs all survivors
Rank bucket monotonicity
Target-before-stop rate
Estimated Net EV
```

---

# ‏204. לא לבחור Thresholds עדיין לפי תחושת בטן

‏המטרה הראשונה היא להבין את Distribution.

‏רק אחר כך לקבוע Decision Thresholds.

---

# ‏205. Metric Dashboard מינימלי

‏לכל Scanner Version:

```text
N
Top1 avg/median forward returns
Top1 hit rate
Top1 net EV
Top1 premium
Rank monotonicity
MFE/MAE
Time-to-target
Opportunity frequency
Worst tail
```

---

# ‏206. Dashboard לפי Segment

‏אותו Dashboard גם לפי:

- ‏Hour.
- ‏Regime.
- ‏Price bucket.
- ‏Liquidity bucket.
- ‏Activity bucket.

---

# ‏207. אל תיתן ל־Dashboard להחליף מחקר

‏Dashboard מספר מה קרה.

‏מחקר מנסה להסביר למה.

---

# ‏208. שאלת הזהב של הפרק

‏בסוף כל גרסת Scanner אנחנו רוצים לענות:

> ‏אם הייתי מקבל רק את הדירוג, בלי לדעת את העתיד — האם Rank גבוה באמת היה נותן לי יתרון מדיד על בחירה חלופית?

---

# ‏209. שאלת הזהב השנייה

> ‏האם היתרון מופיע מספיק מהר בשביל אסטרטגיה שמחזיקה שניות?

---

# ‏210. שאלת הזהב השלישית

> ‏האם היתרון גדול מספיק כדי לשרוד Spread, Slippage, Fees ו־Latency?

---

# ‏211. שאלת הזהב הרביעית

> ‏האם התוצאה יציבה מספיק כדי שלא תהיה רק תאונה סטטיסטית של תקופה מסוימת?

---

# ‏212. Checklist — Prediction Quality

- ‏יש Forward Returns בכמה Horizons.
- ‏יש Rank Buckets.
- ‏יש Baseline.
- ‏יש Top1 vs TopN.
- ‏יש MFE/MAE.
- ‏יש Time-to-target.
- ‏יש Sample Size.
- ‏יש Distribution ולא רק Mean.

---

# ‏213. Checklist — Ranking Quality

- ‏יש Rank Monotonicity.
- ‏יש Top1 Premium.
- ‏יש Separation analysis.
- ‏יש Counterfactual #2/#3/#5/#10.
- ‏יש Regret analysis.
- ‏יש Rank Persistence/Churn.

---

# ‏214. Checklist — Economic Quality

- ‏יש Gross Edge.
- ‏יש Executable Edge.
- ‏יש Cost-adjusted Edge.
- ‏יש Break-even analysis.
- ‏יש Tail outcomes.
- ‏יש Opportunity Frequency.

---

# ‏215. Checklist — Research Quality

- ‏אין Look-Ahead.
- ‏יש Point-in-Time Universe.
- ‏יש versioning.
- ‏יש reproducibility.
- ‏יש Out-of-Sample plan.
- ‏יש experiment registry.
- ‏יש RCA.

---

# ‏216. Checklist — התאמה לרובוט שלך

- ‏נמדדים 1/2/5/10/30/60 שניות.
- ‏נמדד Time to First Profit.
- ‏נמדד Time to Target.
- ‏נבדק Top1 מול המתחרים בזמן אמת.
- ‏נבדק Edge decay עד Fill.
- ‏נבדק Net Edge אחרי friction.
- ‏נבדק האם No-Trade decisions הגיוניים.

---

# ‏217. Anti-Pattern — לבדוק רק Trades שבוצעו

‏זה מסתיר את כל המידע על Candidate שלא נבחרו.

‏כך אי אפשר לדעת אם Ranking טוב.

---

# ‏218. Anti-Pattern — רק Win Rate

‏Win Rate בלי גודל Win/Loss אינו מספיק.

---

# ‏219. Anti-Pattern — רק Average Return

‏Average בלי Distribution, Sample Size ו־Tail risk יכול להטעות.

---

# ‏220. Anti-Pattern — רק Top1

‏בלי TopN/Buckets אי אפשר להבין אם Score באמת מדרג.

---

# ‏221. Anti-Pattern — לערבב Prediction ו־Execution

‏אם Fill גרוע, לא להסיק מיד שה־Scanner גרוע.

---

# ‏222. Anti-Pattern — לחפש Slice מנצח

‏אם עוברים על עשרות Segments עד שאחד נראה מדהים, קל מאוד ל־Overfit.

---

# ‏223. Anti-Pattern — לשנות Score אחרי כל הפסד

‏Trade יחיד כמעט אף פעם אינו Evidence מספיק.

---

# ‏224. Anti-Pattern — להאמין ל־Backtest ללא Shadow

‏מחקר היסטורי הוא שלב, לא סוף התהליך.

---

# ‏225. Best Practice — לשמור כל Rank Snapshot חשוב

‏כך אפשר לבצע RCA אמיתי ולא לנחש בדיעבד.

---

# ‏226. Best Practice — לשמור גם את המפסידים בדירוג

‏#2/#3/#10 הם קבוצת ביקורת טבעית מעולה.

---

# ‏227. Best Practice — למדוד לפני לשפר

‏לא מוסיפים Feature כי הוא “נשמע נכון”.

‏מוסיפים כי יש Hypothesis ומבחן.

---

# ‏228. Best Practice — Gross → Executable → Net

‏כל תוצאה חשובה צריכה לעבור את שלוש השכבות האלה.

---

# ‏229. Best Practice — Report קבוע

‏אם כל Experiment משתמש ב־Metrics אחרים, קשה להשוות גרסאות.

‏נחזיק Scorecard קבוע.

---

# ‏230. Best Practice — Negative Results נשמרים

‏Experiment שלא עבד הוא ידע.

‏אם לא נשמור אותו, נחזור עליו בעתיד.

---

# ‏231. Best Practice — להפריד Discovery מ־Validation

‏אפשר להשתמש בתקופה אחת לגילוי Pattern.

‏אבל צריך תקופה אחרת לאימות.

---

# ‏232. Best Practice — Simplicity Wins Until Proven Otherwise

‏אם Scanner פשוט נותן אותה תוצאה כמו Scanner מורכב, הפשוט עדיף.

---

# ‏233. Best Practice — Edge לפני Automation

‏לא משקיעים מערכת Production ענקית לפני שהוכחנו Predictive Edge בסיסי.

---

# ‏234. Best Practice — Automation אחרי Evidence

‏כאשר Edge מתחיל להיראות אמיתי, אז משקיעים יותר ב־Replay, Paper, Shadow ו־Live Infrastructure.

---

# ‏235. מסקנת הפרק

‏Scanner אינו טוב כי הוא מחזיר רשימה מסודרת.

‏הוא טוב רק אם:

1. ‏Rank גבוה מנבא Outcomes טובים יותר.
2. ‏מקום #1 עדיף באופן מדיד על החלופות.
3. ‏ה־Edge מופיע בזמן שמתאים לאסטרטגיה.
4. ‏ה־Edge שורד Costs ו־Execution.
5. ‏התוצאה יציבה מספיק לאורך זמן ו־Regimes שונים.

---

# ‏236. המשפט שצריך לזכור

> ‏**Ranking יפה הוא לא Evidence. Evidence הוא קשר עקבי, מדיד וניתן לשחזור בין מה שה־Scanner ידע אז לבין מה שקרה אחר כך.**

---

# ‏237. מה למדנו בשלב 22

‏עכשיו אנחנו יודעים:

- ‏איך למדוד Forward Returns.
- ‏איך להשתמש ב־MFE/MAE.
- ‏איך למדוד Time-to-first-profit ו־Time-to-target.
- ‏איך לבדוק Rank Buckets ו־Monotonicity.
- ‏איך להשוות Top1 ל־TopN.
- ‏איך לבצע Counterfactual ו־Regret analysis.
- ‏איך למדוד Precision/Recall/Lift.
- ‏איך להפריד Gross, Executable ו־Net Edge.
- ‏איך לזהות Signal Decay.
- ‏איך לבצע RCA ל־Rank #1 שנכשל.
- ‏איך לבנות Scanner Validation Pipeline ו־Scorecard קבוע.

---

# ‏238. מעבר לשלב הבא

‏עד עכשיו הנחנו שאנחנו יודעים למדוד את ה־Scanner בצורה נכונה.

‏אבל יש סכנה עצומה נוספת:

> ‏אולי בנינו מודל שמתאים בצורה מדהימה לעבר — מפני שהתאמנו אותו יותר מדי לעבר.

‏בשלב הבא נלמד:

# ‏שלב 23 — `Overfitting` ו־`Data Leakage`

‏ושם נעמיק ב־Train/Test לפי זמן, Walk-Forward, Parameter Hunting, Multiple Testing, Look-Ahead, Survivorship Bias והדרכים שבהן מחקר יכול לשקר לנו בלי שנשים לב.