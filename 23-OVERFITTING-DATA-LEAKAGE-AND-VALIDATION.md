# ‏שלב 23 — `Overfitting` ו־`Data Leakage`: איך לא לשכנע את עצמנו שיש Edge כשאין

> ‏מטרת הפרק: להבין איך מחקר כמותי יכול להיראות מצוין על נתוני עבר ובכל זאת להיכשל בעתיד, ואיך בונים תהליך Validation שמקטין את הסיכוי שאנחנו פשוט מתאימים את המודל לרעש.
>
> ‏העיקרון המרכזי: **אסטרטגיה שלא שרדה בדיקה הוגנת מחוץ לנתונים שעליהם פותחה — עדיין לא הוכיחה Edge.**
>
> ‏כמו בכל הקורס: קודם נלמד את הידע המקצועי הכללי, אחר כך את ה־Best Practices ורזי המקצוע, ולבסוף נתאים אותו לרובוט שלך — סריקה של כל השוק, בחירת Top Candidate והחזקה של שניות בודדות ועד בערך דקה.

---

# ‏1. מה זה `Overfitting`?

‏`Overfitting` קורה כאשר המודל מתאים את עצמו יותר מדי לפרטים הספציפיים של נתוני העבר.

‏במקום ללמוד חוק כללי, הוא לומד רעש.

---

# ‏2. הדוגמה הפשוטה

‏נניח שבדקנו:

```text
Momentum window = 7 seconds
Activity window = 13 seconds
Spread max = 0.17%
Score weight A = 0.37
Score weight B = 0.63
Entry delay = 420 ms
Exit after = 23 seconds
```

‏והשילוב הזה יצא מצוין.

‏השאלה היא:

> ‏האם גילינו חוק אמיתי — או פשוט את השילוב שהתאים במקרה לנתונים שכבר ראינו?

---

# ‏3. למה Overfitting קל במיוחד באלגו

‏כי מחשב יכול לנסות אלפי וריאציות במהירות.

‏כל ניסיון נוסף מגדיל את הסיכוי למצוא משהו שנראה טוב רק במקרה.

---

# ‏4. `Data Leakage`

‏`Data Leakage` הוא מצב שבו מידע שלא היה אמור להיות זמין בזמן ההחלטה נכנס בדרך כלשהי למודל או למחקר.

‏זה יכול להיות ישיר או עקיף.

---

# ‏5. Leakage ישיר

‏לדוגמה:

```text
Feature at 10:00:00
uses trade from 10:00:01
```

‏זה Future Data.

‏ה־Backtest יודע משהו שהמערכת האמיתית לא הייתה יכולה לדעת.

---

# ‏6. Leakage עקיף

‏הסוג המסוכן יותר הוא מידע עתידי שנכנס בעקיפין.

‏לדוגמה:

- ‏Normalization שחושב על כל החודש כולל ימים עתידיים.
- ‏בחירת Symbols לפי מי ששרד עד סוף השנה.
- ‏Feature שנבנה מתוך Label עתידי בלי לשים לב.
- ‏Threshold שנבחר אחרי שראינו את ביצועי Test Set.

---

# ‏7. `Look-Ahead Bias`

‏`Look-Ahead Bias` הוא שימוש במידע עתידי בתוך החלטה היסטורית.

‏זה תת־סוג חשוב של Leakage.

---

# ‏8. חוק הזהב

‏בזמן `t` מותר להשתמש רק במידע שהיה ידוע עד `t`.

```text
feature_time <= decision_time
```

‏ולא:

```text
feature_time > decision_time
```

---

# ‏9. Event Time מול Processing Time

‏גם אם אירוע קרה בזמן מסוים, ייתכן שהמערכת קיבלה אותו מאוחר יותר.

‏לכן לפעמים צריך להבחין בין:

```text
exchange_time
received_time
processed_time
```

---

# ‏10. מידע שהגיע מאוחר לא היה זמין בזמן אמת

‏אם ב־Backtest אנחנו ממיינים הכול מושלם לפי `exchange_time`, אבל ב־Live המידע הגיע באיחור, אנחנו עלולים ליצור יתרון מלאכותי.

---

# ‏11. `Feature Leakage`

‏Feature יכול לדלוף עתיד גם אם הנוסחה שלו נראית לגיטימית.

‏הבעיה היא בדרך שבה חישבנו אותו.

---

# ‏12. דוגמה: Rolling Window שגוי

‏נניח שאנחנו רוצים:

```text
return_10s at t
```

‏הנוסחה הנכונה משתמשת בנתונים עד `t` בלבד.

‏אם בטעות ה־window ממורכז סביב `t`, הוא משתמש גם בעתיד.

---

# ‏13. `Centered Window` הוא מלכודת

‏במחקר Signal, window ממורכז הוא בדרך כלל בלתי־חוקי עבור Features בזמן החלטה.

‏הוא יכול להיות לגיטימי לניתוח בדיעבד — אבל לא כקלט להחלטה.

---

# ‏14. Leakage דרך Interpolation

‏נניח שחסר Tick ב־10:00:00.

‏אם ממלאים אותו על ידי interpolation בין:

```text
09:59:59
10:00:01
```

‏הערך ב־10:00:00 משתמש למעשה בעתיד.

---

# ‏15. Forward Fill מול Backfill

‏`Forward Fill` יכול להיות תקין אם הערך באמת היה ידוע קודם ועדיין תקף.

‏`Backfill` בדרך כלל מסוכן מאוד למחקר זמן, כי הוא מביא ערך עתידי אחורה.

---

# ‏16. Leakage דרך Daily Statistics

‏נניח שב־10:15 אנחנו משתמשים ב־“Daily Average Volume” של אותו יום שחושב מכל היום עד 16:00.

‏זה עתיד.

---

# ‏17. Intraday Baseline חייב להיות Point-in-Time

‏ב־10:15 מותר להשתמש רק במידע שהצטבר עד 10:15, או בפרופיל היסטורי מימים קודמים.

---

# ‏18. Leakage דרך High/Low יומי

‏אם Feature של 10:30 משתמש ב־Daily High הסופי של היום — הוא יודע את העתיד.

‏צריך להשתמש ב־`high_so_far`.

---

# ‏19. Leakage דרך VWAP סופי

‏אותו דבר עם `VWAP`.

‏בזמן אמת מותר להשתמש רק ב־VWAP שנצבר עד הרגע הנוכחי.

---

# ‏20. Leakage דרך Closing Price

‏כל Feature תוך־יומי שמשתמש ב־Close של אותו יום לפני שהיום הסתיים הוא פסול.

---

# ‏21. Leakage דרך Corporate Actions

‏נתונים מתואמים יכולים להיות שימושיים, אבל צריך להבין מתי ההתאמה נעשתה ומה המערכת הייתה יודעת אז.

---

# ‏22. `Point-in-Time Universe`

‏Universe חייב לייצג את מה שהיה קיים וזמין באותו תאריך.

---

# ‏23. `Survivorship Bias`

‏אם בודקים רק מניות שקיימות היום, אנחנו מוחקים מההיסטוריה:

- ‏מניות שנמחקו.
- ‏חברות שהתמזגו.
- ‏חברות שנכשלו.
- ‏Symbols שהשתנו.

‏זה יכול לייפות את התוצאה.

---

# ‏24. “כל מניות Nasdaq היום” אינו Universe היסטורי

‏אם Backtest של 2024 משתמש ברשימת 2026, הוא כבר מוטה.

---

# ‏25. Point-in-Time Membership

‏לכל Timestamp רצוי לדעת:

```text
which symbols were eligible then?
```

---

# ‏26. Delisted Securities

‏גם ניירות שנעלמו צריכים להיכלל אם היו חלק מה־Universe בזמן הבדיקה.

---

# ‏27. IPOs

‏מניה לא הייתה זמינה לפני תאריך ההנפקה שלה.

‏פשוט — אבל חשוב.

---

# ‏28. Symbol Changes

‏צריך מיפוי היסטורי של Symbol/Identifier כדי לא לחבר בטעות היסטוריות לא נכונות.

---

# ‏29. `Train`, ‏`Validation`, ‏`Test`

‏שלוש קבוצות נתונים משרתות מטרות שונות.

---

# ‏30. Train

‏על `Train` מותר:

- ‏למציא Features.
- ‏לבדוק כיוונים.
- ‏לכוון פרמטרים.
- ‏לשנות Score.

---

# ‏31. Validation

‏`Validation` עוזר לבחור בין גרסאות שפותחו על Train.

‏אבל אם משתמשים בו שוב ושוב, גם אליו אפשר לעשות Overfit.

---

# ‏32. Test

‏`Test` אמור להיות נתון שכמעט לא נוגעים בו.

‏הוא נועד לענות:

> ‏איך המודל מתנהג על תקופה שלא השתמשנו בה כדי לבחור אותו?

---

# ‏33. Test Set אינו Sandbox

‏אם כל יום בודקים Test, משנים משהו, ובודקים שוב — הוא כבר לא Test אמיתי.

---

# ‏34. `Test Set Contamination`

‏ברגע שהחלטה על המודל מושפעת מתוצאות Test, המידע מה־Test דלף חזרה לתהליך.

---

# ‏35. Human-in-the-Loop Leakage

‏גם אם הקוד לא משתמש ב־Test, האדם יכול להשתמש בו.

‏אם ראינו תוצאה, שינינו רעיון, והרצנו שוב — המידע כבר השפיע עלינו.

---

# ‏36. `Holdout` סופי

‏כדאי לשמור תקופה אחרונה שלא נוגעים בה עד שהגרסה כמעט סופית.

---

# ‏37. למה Split אקראי בעייתי ב־Time Series

‏אם מערבבים Samples אקראית, מידע מאותו יום או מאותו Regime עלול להופיע גם ב־Train וגם ב־Test.

---

# ‏38. Split לפי זמן

‏בדרך כלל למחקר מסחר:

```text
Train = earlier
Validation = later
Test = latest
```

---

# ‏39. Walk-Forward

‏ב־`Walk-Forward` אנחנו מדמים תהליך אמיתי יותר:

```text
train on past
validate on next period
roll forward
repeat
```

---

# ‏40. Expanding Window

‏אפשר להרחיב את חלון האימון כל פעם:

```text
Train: Jan
Test: Feb

Train: Jan-Feb
Test: Mar

Train: Jan-Mar
Test: Apr
```

---

# ‏41. Rolling Window

‏אפשר גם לשמור חלון קבוע:

```text
Train: previous 3 months
Test: next week
```

‏ולהזיז אותו קדימה.

---

# ‏42. Expanding מול Rolling

‏`Expanding` שומר יותר היסטוריה.

‏`Rolling` נותן יותר משקל למשטרים חדשים.

‏אין תשובה אוניברסלית — צריך לבדוק.

---

# ‏43. `Regime Shift`

‏הקשר בין Features לתוצאה יכול להשתנות לאורך זמן.

‏לכן הצלחה בתקופה אחת לא מבטיחה הצלחה באחרת.

---

# ‏44. Out-of-Sample אמיתי

‏`Out-of-Sample` פירושו שהנתונים לא שימשו לבחור את המודל או את הפרמטרים.

---

# ‏45. `Parameter Hunting`

‏נניח שניסינו 500 ערכי Threshold.

‏גם אם אין Edge, סביר שאחד מהם ייראה טוב במקרה.

---

# ‏46. Grid Search הוא ניסויים רבים

‏לדוגמה:

```text
10 momentum windows
× 10 activity thresholds
× 10 spread limits
× 10 exit times
= 10,000 combinations
```

‏זה לא “ניסוי אחד”.

---

# ‏47. `Multiple Testing`

‏ככל שבודקים יותר Hypotheses, גדל הסיכוי למצוא Winner מקרי.

---

# ‏48. Research Degrees of Freedom

‏לא רק Parameters נחשבים.

‏גם החלטות כמו:

- ‏איזה Universe.
- ‏איזה ימים.
- ‏איזה Horizon.
- ‏איזה Metric.
- ‏איזה Filter.
- ‏איזה Cost Model.

‏מוסיפות חופש למחקר.

---

# ‏49. `Researcher Overfitting`

‏החוקר עצמו יכול לעשות Overfit דרך רצף ההחלטות שלו.

‏לכן צריך Experiment Log.

---

# ‏50. `Experiment Registry`

‏לכל ניסוי כדאי לשמור:

```text
experiment_id
hypothesis
code_version
data_version
parameters
train_period
validation_period
test_period
metrics
result
conclusion
```

---

# ‏51. למה לשמור גם ניסויים שנכשלו

‏אם נשמור רק Winners, נשכח כמה ניסיונות נעשו בדרך.

‏זה יגרום לנו להעריך יתר על המידה את ה־Winner.

---

# ‏52. `Winner's Curse`

‏הגרסה שנראית הכי טובה מתוך אלפי ניסויים נוטה להיות גם הגרסה שקיבלה הכי הרבה מזל.

---

# ‏53. התוצאה הטובה ביותר היא חשודה

‏אם 999 גרסאות בינוניות וגרסה אחת מדהימה — צריך לחשוד, לא לחגוג.

---

# ‏54. `Parameter Plateau`

‏Edge אמין יותר נראה לעיתים באזור רחב של פרמטרים סבירים, לא רק בנקודה אחת מושלמת.

---

# ‏55. Sharp Optimum

‏אם:

```text
threshold 0.119 = bad
threshold 0.120 = amazing
threshold 0.121 = bad
```

‏זו נורת אזהרה.

---

# ‏56. Robust Region

‏אנחנו מעדיפים:

```text
0.10 - 0.14 = consistently reasonable
```

‏על פני נקודת קסם יחידה.

---

# ‏57. Sensitivity Analysis

‏לכל Parameter חשוב לבדוק איך התוצאה משתנה סביב הערך שנבחר.

---

# ‏58. One-Parameter-at-a-Time

‏אפשר להתחיל בשינוי Parameter אחד בכל פעם כדי להבין את השפעתו.

---

# ‏59. אבל Interactions קיימים

‏שני Parameters יכולים להשפיע זה על זה.

‏לכן בהמשך צריך גם 2D/interaction analysis.

---

# ‏60. `Ablation Test`

‏מורידים Feature או Rule ובודקים מה קורה.

‏אם שום דבר לא משתנה — אולי הוא מיותר.

---

# ‏61. Feature Count הוא סיכון

‏כל Feature נוסף נותן למודל עוד דרך להתאים את עצמו לרעש.

---

# ‏62. KISS במחקר

‏אם שני מודלים נותנים תוצאה דומה, בדרך כלל יש יתרון למודל הפשוט יותר.

---

# ‏63. Complexity Budget

‏אפשר לחשוב על מורכבות כתקציב.

‏כל Rule/Feature/Parameter חדש צריך להצדיק את עצמו.

---

# ‏64. `Feature Selection Leakage`

‏אם בוחרים Features לפי הביצועים שלהם על Test — Test כבר לא נקי.

---

# ‏65. Feature Engineering חייב להישאר בתוך Train

‏כל החלטה שנלמדת מהנתונים צריכה להילמד רק מהחלק המתאים.

---

# ‏66. Leakage דרך Normalization

‏נניח שחישבנו:

```text
z = (x - global_mean) / global_std
```

‏כאשר `global_mean` כולל את Test.

‏זה Leakage.

---

# ‏67. נכון יותר

‏לומדים Mean/Std על Train בלבד ומיישמים אותם על Validation/Test.

---

# ‏68. Cross-Sectional Normalization

‏אם בזמן `t` מדרגים את כל המניות הזמינות באותו רגע, זה יכול להיות תקין.

‏אבל אסור להשתמש במידע של זמנים עתידיים.

---

# ‏69. Leakage דרך Percentiles

‏Percentile היסטורי צריך להיבנות רק מהיסטוריה שהייתה זמינה אז.

---

# ‏70. Leakage דרך Feature Thresholds

‏אם Threshold נבחר אחרי הסתכלות על כל התקופה, הוא חלק מהמודל שנלמד מהעתיד.

---

# ‏71. Label Leakage

‏`Label` הוא התוצאה העתידית שאנחנו מנסים לחזות.

‏אסור שהוא יזלוג לתוך Feature.

---

# ‏72. דוגמה ל־Label

```text
future_return_10s
```

‏זה Label לגיטימי למחקר.

‏אבל הוא לא יכול להיות חלק מ־Score בזמן אמת.

---

# ‏73. Derived Leakage

‏גם Feature שנגזר ממשהו שכולל את Label הוא Leakage.

---

# ‏74. Leakage דרך Dataset Preparation

‏לפעמים הבעיה אינה במודל אלא ב־SQL או ETL.

---

# ‏75. SQL עם Join לעתיד

‏דוגמה מסוכנת:

```text
JOIN nearest_snapshot
```

‏אם `nearest` יכול לבחור snapshot אחרי `t`, יש Leakage.

---

# ‏76. החוק הנכון ל־Historical Join

‏בדרך כלל:

```text
snapshot_time <= target_time
ORDER BY snapshot_time DESC
LIMIT 1
```

---

# ‏77. `As-Of Join`

‏זה pattern חשוב מאוד למחקר זמן.

‏מצמידים את הרשומה האחרונה שהייתה ידועה עד אותו רגע.

---

# ‏78. Tolerance

‏גם As-Of Join צריך מגבלת Freshness.

‏Snapshot בן 10 דקות אינו בהכרח מידע תקף לרגע נוכחי.

---

# ‏79. Missing Data אינו Future Fill

‏אם אין נתון, לא “מתקנים” אותו באמצעות העתיד.

‏או מסמנים Missing, או משתמשים במדיניות שניתנת להפעלה גם Live.

---

# ‏80. Leakage דרך Cleaning

‏אם מנקים outliers לפי Distribution של כל התקופה, כולל העתיד, יכול להיווצר Leakage עדין.

---

# ‏81. Fit / Transform

‏כל שלב שיש בו `fit` חייב להתבצע על Train בלבד.

‏אחר כך `transform` על Validation/Test.

---

# ‏82. Pipeline אחד

‏עדיף שכל Transform יהיה חלק מ־Pipeline versioned ולא Script ידני.

---

# ‏83. Overlap בין Labels

‏במסחר קצר, Samples סמוכים יכולים לשתף כמעט את אותו Future Window.

---

# ‏84. דוגמה

‏Signal ב־10:00:00 עם Label של 30 שניות ו־Signal נוסף ב־10:00:01 חולקים 29 שניות מתוך 30.

‏הם לא עצמאיים.

---

# ‏85. למה זה חשוב

‏אם מתייחסים אליהם כאל אלפי Samples עצמאיים, אפשר להפריז מאוד בכמות הראיות.

---

# ‏86. Candidate Episodes

‏אפשר לאגד רצף Signals של אותה מניה לאותו Episode במקום לספור כל Tick כהזדמנות עצמאית.

---

# ‏87. Event Clustering

‏גם Signals של מניות שונות יכולים להיות תלויים אם כולם מגיעים מאותו Market Event.

---

# ‏88. Day-Level Dependence

‏אלפי Signals ביום אחד אינם בהכרח אלפי ניסויים בלתי־תלויים.

---

# ‏89. Evaluate by Day

‏לכן חשוב לבדוק גם:

```text
PnL by day
hit rate by day
edge by day
```

‏ולא רק Aggregate Samples.

---

# ‏90. Leave-One-Day-Out

‏בדיקה שימושית:

‏מסירים יום אחד ובודקים אם כל ה־Edge נעלם.

---

# ‏91. Leave-One-Symbol-Out

‏אותו רעיון לפי Symbols.

‏אם כל ה־Edge מגיע ממניה אחת, זו בעיה אחרת מאשר Edge רחב.

---

# ‏92. Leave-One-Period-Out

‏אפשר לבדוק שבוע/חודש/Regime.

---

# ‏93. Edge Concentration

‏צריך למדוד כמה מהתוצאה מגיע מ־Top X% מהימים/המניות/אירועים.

---

# ‏94. Stable Edge מול Lucky Event

‏Edge שמגיע מאירוע נדיר אחד דורש הרבה יותר זהירות.

---

# ‏95. `Selection Bias`

‏אם בחרנו לבדוק רק ימים שנראו “מעניינים”, המחקר כבר מוטה.

---

# ‏96. `Cherry Picking`

‏אם מציגים רק Metrics או Periods שבהם המודל נראה טוב — זו הטיה.

---

# ‏97. Predefine Primary Metric

‏לפני הניסוי כדאי להחליט מה Metric העיקרי.

‏לדוגמה:

```text
Net EV at 10s
```

---

# ‏98. Secondary Metrics

‏אפשר למדוד גם:

- ‏Hit Rate.
- ‏MFE.
- ‏MAE.
- ‏Time to First Profit.
- ‏Time to Target.
- ‏Fill Rate.

‏אבל צריך לדעת מה היה היעד המקורי.

---

# ‏99. Metric Shopping

‏אם PnL לא טוב אז עוברים ל־Hit Rate; אם Hit Rate לא טוב עוברים ל־MFE — זו דרך קלאסית לשכנע את עצמנו.

---

# ‏100. Pre-registration פנימי

‏לא חייבים מערכת אקדמית.

‏מספיק לכתוב לפני הריצה:

```text
Hypothesis
Primary metric
Dataset
Parameters to vary
Acceptance criteria
```

---

# ‏101. `Baseline First`

‏לפני מודל מורכב בונים Baseline פשוט.

---

# ‏102. למה Baseline חשוב

‏אם מודל מורכב לא מנצח Baseline פשוט מחוץ למדגם — המורכבות לא הצדיקה את עצמה.

---

# ‏103. Baseline אפשרי לרובוט שלך

‏לדוגמה בלבד:

```text
Filter tradable + fresh + liquid
Rank by simple short-term momentum
No fancy interactions
```

‏ואז משווים כל שיפור אליו.

---

# ‏104. Random Baseline

‏אפשר גם לבחור אקראית מתוך Survivors.

‏זה עוזר למדוד כמה Ranking באמת מוסיף.

---

# ‏105. Naive Momentum Baseline

‏אם Score מורכב לא מנצח Momentum פשוט — צריך להבין למה.

---

# ‏106. `Incremental Improvement`

‏מודדים כל Feature/Rule חדש מול גרסה קודמת.

---

# ‏107. One Change at a Time

‏כשאפשר, שינוי אחד בכל ניסוי מקל מאוד על RCA.

---

# ‏108. Bundle Changes

‏אם משנים 12 דברים יחד והתוצאה משתפרת, לא יודעים מה עזר.

---

# ‏109. `Nested Validation`

‏כאשר יש הרבה Hyperparameters, אפשר להשתמש בשכבת Validation פנימית לבחירתם ושכבת Test חיצונית להערכה.

---

# ‏110. Time-Series Nested Logic

‏גם כאן אסור לשבור זמן.

‏ה־inner split וה־outer split צריכים לשמור סדר כרונולוגי.

---

# ‏111. `Purging`

‏כאשר Labels חופפים על פני גבולות Train/Test, אפשר להסיר Samples סמוכים לגבול כדי למנוע זליגת מידע דרך Future Windows.

---

# ‏112. `Embargo`

‏לעיתים משאירים מרווח זמן בין Train ל־Test כדי לצמצם תלות בין Samples סמוכים.

---

# ‏113. למה זה רלוונטי אצלנו

‏אם Label הוא 60 שניות ו־Train מסתיים ב־10:00:00, Sample ב־09:59:50 משתמש בעתיד שחוצה את הגבול.

---

# ‏114. Label Horizon קובע Purge Width

‏צריך לחשוב על אורך ה־Label ועל חפיפות, לא לבחור Purge שרירותי.

---

# ‏115. `Leakage Audit`

‏כדאי לבצע Audit ייעודי לפני שמאמינים לתוצאות.

---

# ‏116. שאלת Audit ראשונה

> ‏האם כל Feature בזמן `t` משתמש רק בנתונים שהיו זמינים עד `t`?

---

# ‏117. שאלת Audit שנייה

> ‏האם כל Transform נלמד רק על Train?

---

# ‏118. שאלת Audit שלישית

> ‏האם Universe הוא Point-in-Time?

---

# ‏119. שאלת Audit רביעית

> ‏האם Test Set שימש פעם לקבלת החלטה על המודל?

---

# ‏120. שאלת Audit חמישית

> ‏כמה ניסויים שונים עשינו לפני שמצאנו את Winner?

---

# ‏121. שאלת Audit שישית

> ‏האם Labels חופפים בין Train/Test?

---

# ‏122. שאלת Audit שביעית

> ‏האם Missing Data טופל בצורה שניתנת לשחזור גם Live?

---

# ‏123. שאלת Audit שמינית

> ‏האם Backtest משתמש באותה Feature Logic כמו Live?

---

# ‏124. `Backtest / Live Parity`

‏ככל שיש יותר קוד נפרד בין Research ל־Production, גדל הסיכוי להבדל סמוי.

---

# ‏125. Shared Feature Engine

‏עדיף שאותה לוגיקת Features תשרת:

```text
Backtest
Replay
Shadow
Live
```

---

# ‏126. `Training/Serving Skew`

‏מודל יכול להיבדק על Feature מושלם היסטורית, אבל Live לקבל Feature באיכות אחרת.

---

# ‏127. דוגמה

‏Backtest משתמש ב־consolidated feed מלא.

‏Live משתמש ב־feed חלקי.

‏אותו Feature כבר אינו אותו Feature.

---

# ‏128. Data Contract

‏לכל Feature חשוב להגדיר:

```text
source
coverage
freshness
timestamp semantics
missing policy
normalization
version
```

---

# ‏129. `Feature Versioning`

‏שינוי נוסחה קטן יוצר Feature Version חדש.

---

# ‏130. `Dataset Versioning`

‏גם Dataset צריך Version.

‏אחרת אי אפשר לשחזר תוצאה.

---

# ‏131. Corrections to Historical Data

‏אם ספק תיקן נתוני עבר, אותו Backtest יכול להשתנות.

‏לכן חשוב לדעת על איזו גרסת Data הוא רץ.

---

# ‏132. Reproducibility

‏כל Run צריך לשמור לפחות:

```text
code_commit
config_version
dataset_version
feature_version
universe_version
cost_model_version
execution_model_version
random_seed
```

---

# ‏133. Random Seeds

‏אם יש רכיב אקראי, צריך Seed כדי לשחזר.

---

# ‏134. אבל Seed יחיד אינו מספיק

‏אם התוצאה משתנה דרמטית בין Seeds, צריך להבין את חוסר היציבות.

---

# ‏135. `Stability Across Seeds`

‏במודלים סטוכסטיים בודקים Distribution של תוצאות על כמה Seeds.

---

# ‏136. Overfitting ל־Execution Model

‏גם מודל ביצוע יכול לעבור Tuning עד שהוא “מוכיח” את מה שרצינו.

---

# ‏137. Conservative Execution Assumptions

‏עדיף להתחיל עם הנחות שמרניות ולהראות שה־Edge שורד.

---

# ‏138. Best/Base/Stress

‏אפשר להריץ:

```text
Best Case
Base Case
Stress Case
```

‏ולראות עד כמה המסקנה תלויה בהנחות.

---

# ‏139. Cost Overfitting

‏אם מכוונים Threshold בדיוק לפי עמלה היסטורית אחת, שינוי קטן בעלויות יכול למחוק את ה־Edge.

---

# ‏140. `Margin of Safety`

‏אסטרטגיה שהופכת משלילית לחיובית רק בגלל הנחה אופטימית קטנה אינה Robust.

---

# ‏141. Overfitting ל־Holding Time

‏אם 17 שניות מצוין ו־16/18 גרועות, צריך לחשוד.

---

# ‏142. Horizon Surface

‏בודקים תוצאה על:

```text
1s
2s
5s
10s
20s
30s
60s
```

‏ולא רק Horizon שנבחר בדיעבד.

---

# ‏143. Overfitting ל־Entry Delay

‏אותו דבר עם Delay.

‏Edge אמיתי יותר אמור להראות התנהגות הגיונית לאורך טווח Delay סביר.

---

# ‏144. Overfitting ל־Spread Filter

‏Threshold יחיד “מושלם” הוא חשוד.

‏עדיף לבדוק עקומה מלאה.

---

# ‏145. Overfitting ל־Liquidity Filter

‏גם כאן מחפשים Region יציב, לא מספר קסם.

---

# ‏146. Overfitting ל־Rank Threshold

‏אם רק Rank #1 עובד אבל #2 דומה לחלוטין ב־Score ולא עובד בכלל, צריך לחקור.

---

# ‏147. Rank Monotonicity כבדיקת Robustness

‏אנחנו רוצים לראות קשר הגיוני בין Rank לבין Outcome, לא רק Winner יחיד.

---

# ‏148. `Top-1 Premium`

‏אם Top-1 באמת מיוחד, צריך להיות לו Premium עקבי ביחס ל־Top-N.

---

# ‏149. Overfitting ל־Symbol

‏אסטרטגיה יכולה ללמוד התנהגות של כמה מניות ספציפיות.

---

# ‏150. Cross-Symbol Generalization

‏בודקים האם Edge קיים על קבוצות Symbols שונות.

---

# ‏151. Overfitting לשעה ביום

‏ייתכן שהאסטרטגיה עובדת רק ב־09:31–09:33.

‏זה לא בהכרח רע — אבל צריך לדעת אם זו תופעה אמיתית או Selection.

---

# ‏152. Overfitting ל־Regime

‏שוק עולה, יורד, תנודתי ושקט יכולים לתת תוצאות שונות מאוד.

---

# ‏153. Regime Generalization

‏בודקים במפורש באילו Regimes המודל עובד ובאילו לא.

---

# ‏154. Specialized Strategy אינו בהכרח Overfit

‏מותר למודל לעבוד רק ב־Regime מסוים — אם זה מוגדר מראש, ניתן לזהוי Live ומאומת מחוץ למדגם.

---

# ‏155. Post-Hoc Regime Story

‏אם אחרי כישלון אומרים “אה, זה היה Regime אחר” בלי שהגדרה הייתה קיימת מראש — זה מסוכן.

---

# ‏156. Data Snooping

‏הסתכלות חוזרת על אותם נתונים עד שמוצאים Pattern נקראת לעיתים `Data Snooping`.

---

# ‏157. Visual Overfitting

‏גם Chart יכול לגרום לנו להמציא Rule אחרי שראינו מה קרה.

---

# ‏158. Chart הוא כלי חקירה, לא הוכחה

‏רעיון שנולד מצפייה ב־Chart צריך לעבור Validation על נתונים אחרים.

---

# ‏159. `Discovery` מול `Confirmation`

‏חשוב להפריד בין:

```text
Discovery Data
Confirmation Data
```

---

# ‏160. Discovery יכול להיות יצירתי

‏בשלב Discovery מותר לחפש Patterns, לנסות Features ולחקור.

---

# ‏161. Confirmation חייב להיות קשיח יותר

‏אחרי שנבחרה Hypothesis, בודקים אותה על Data שלא שימש ליצירה שלה.

---

# ‏162. `Research Lock`

‏לפני Confirmation רצוי לנעול:

```text
features
parameters
filters
score
entry
exit
cost assumptions
primary metric
```

---

# ‏163. אם משנים אחרי Lock

‏זה בסדר — אבל זו גרסה חדשה שצריכה Validation חדש.

---

# ‏164. Version the Hypothesis

‏לדוגמה:

```text
StrategyHypothesis v1.3
```

---

# ‏165. `Shadow Validation`

‏אחרי Historical Validation אפשר להריץ Shadow על Market חי בלי לשלוח עסקאות.

---

# ‏166. למה Shadow חשוב

‏הוא בודק:

- ‏Data אמיתי.
- ‏Latency אמיתי.
- ‏Feed Quality.
- ‏Signal frequency.
- ‏Rank behavior.
- ‏Execution opportunity.

‏בלי להסתמך רק על Historical Data.

---

# ‏167. Paper Trading אינו הוכחה מלאה

‏Paper Fill יכול להיות אופטימי או לעבוד אחרת מ־Live.

‏הוא שלב נוסף, לא אמת מוחלטת.

---

# ‏168. Canary Live

‏בהמשך, אם וכאשר עוברים ל־Live, אפשר להתחיל בהיקף קטן ומוגבל כדי למדוד Sim-to-Live Gap.

---

# ‏169. `Sim-to-Live Gap`

‏משווים:

```text
predicted fill
actual fill
predicted slippage
actual slippage
predicted latency
actual latency
predicted net edge
actual net result
```

---

# ‏170. Edge Decay אחרי Research

‏אם Edge נעלם מיד כשהוא עובר ל־Shadow/Live, צריך לחשוד ב־Overfitting או Simulation Error.

---

# ‏171. `Out-of-Sample Degradation`

‏ירידה מסוימת מ־Train ל־Test היא טבעית.

‏קריסה מוחלטת היא סימן אזהרה.

---

# ‏172. Train Result אינו יעד

‏המטרה אינה למקסם Train.

‏המטרה היא Generalization.

---

# ‏173. Generalization

‏יכולת לעבוד באופן סביר על נתונים חדשים שלא שימשו לפיתוח.

---

# ‏174. Bias-Variance Tradeoff

‏מודל פשוט מדי יכול לפספס Pattern אמיתי.

‏מודל מורכב מדי יכול ללמוד רעש.

---

# ‏175. `Regularization` רעיונית

‏גם בלי Machine Learning, אפשר לבצע Regularization דרך:

- ‏פחות Features.
- ‏פחות Parameters.
- ‏Thresholds פשוטים.
- ‏Weights מעוגלים.
- ‏Rules יציבים.

---

# ‏176. Rounded Parameters

‏אם `0.37` ו־`0.4` כמעט זהים, לעיתים עדיף `0.4`.

‏זה מפחית תחושת Precision מזויפת.

---

# ‏177. False Precision

‏פרמטר כמו:

```text
spread_max = 0.13741%
```

‏צריך הצדקה חזקה מאוד.

---

# ‏178. Stable Simplicity

‏מודל פשוט שמחזיק על פני כמה תקופות עשוי להיות עדיף על מודל מורכב שמנצח מעט ב־Train.

---

# ‏179. Robustness Matrix

‏אפשר לבנות Matrix:

```text
Period × Regime × Symbol Bucket × Liquidity Bucket × Horizon
```

‏ולבדוק איפה ה־Edge שורד.

---

# ‏180. Robustness אינה אחידות מוחלטת

‏לא צריך שכל Cell יהיה חיובי.

‏אבל צריך להבין את המבנה ולא להסתיר אזורים חלשים.

---

# ‏181. `Confidence Interval`

‏Average יחיד אינו מספיק.

‏צריך להבין חוסר ודאות סביב ההערכה.

---

# ‏182. Bootstrap

‏אפשר להשתמש ב־Bootstrap בזהירות כדי להעריך התפלגות Metrics.

‏ב־Time Series צריך לכבד תלות בזמן ולא להניח שכל Sample עצמאי.

---

# ‏183. Block Bootstrap

‏גישה אפשרית היא לדגום Blocks של זמן במקום Ticks בודדים.

---

# ‏184. Day Bootstrap

‏אצלנו לעיתים הגיוני לבחון Sampling ברמת ימים כדי לשמור מבנה תוך־יומי.

---

# ‏185. Sample Size

‏אלפי Rows אינם בהכרח אלפי Opportunities עצמאיות.

---

# ‏186. Effective Sample Size

‏מה שחשוב הוא כמות האירועים הבלתי־תלויים יחסית, לא מספר השורות במסד.

---

# ‏187. `Statistical Significance` אינה מספיק

‏גם אם תוצאה “מובהקת”, היא יכולה להיות קטנה מדי כלכלית אחרי עלויות.

---

# ‏188. Economic Significance

‏אנחנו צריכים גם:

```text
expected net edge > realistic costs + uncertainty buffer
```

---

# ‏189. `Practical Significance`

‏גם Edge חיובי צריך להיות בר־ביצוע בקיבולת, Latency ונזילות הרלוונטיות.

---

# ‏190. Overfitting ל־Cost Model

‏אם המודל עובד רק תחת Spread/Slippage אופטימיים — הוא שביר.

---

# ‏191. Stress the Costs

‏בודקים מה קורה אם:

```text
spread +25%
slippage +50%
latency +100ms
fill rate lower
```

---

# ‏192. Stress the Data

‏בודקים גם:

- ‏Missing events.
- ‏Stale quotes.
- ‏Delayed feed.
- ‏Out-of-order events.

---

# ‏193. Stress the Model

‏בודקים:

- ‏Threshold changes.
- ‏Weight changes.
- ‏Feature removal.
- ‏Horizon changes.

---

# ‏194. `Fragility Score`

‏אפשר למדוד עד כמה הביצועים נופלים כאשר משנים מעט את ההנחות.

---

# ‏195. Fragile Winner

‏גרסה עם PnL גבוה אבל Fragility גבוהה יכולה להיות פחות אמינה מגרסה מעט חלשה יותר ויציבה.

---

# ‏196. `Model Selection Rule`

‏לא בוחרים אוטומטית את Highest PnL.

‏אפשר לבחור לפי שילוב של:

```text
net edge
stability
simplicity
capacity
drawdown
execution realism
```

---

# ‏197. Research Scorecard

‏לכל Strategy Version אפשר לשמור Scorecard של:

- ‏In-sample.
- ‏Out-of-sample.
- ‏Walk-forward.
- ‏Stress.
- ‏Shadow.
- ‏Execution realism.

---

# ‏198. `No-Go Criteria`

‏כדאי להגדיר מראש תנאים שמפסילים Version.

---

# ‏199. דוגמאות ל־No-Go

‏לדוגמה:

- ‏Edge רק ב־Train.
- ‏Test שלילי.
- ‏תוצאה תלויה ביום אחד.
- ‏Sensitivity קיצונית.
- ‏Simulation unrealistic.
- ‏Leakage לא פתור.

---

# ‏200. `Promotion Criteria`

‏גם מעבר של Version לשלב הבא צריך להיות מוגדר.

---

# ‏201. Discovery → Validation → Shadow → Paper → Canary

‏זו שרשרת הוכחה מדורגת.

‏לא מדלגים ישר מ־Notebook ל־Live.

---

# ‏202. Model Governance

‏גם בפרויקט אישי כדאי לנהל:

```text
current champion
candidate versions
retired versions
reason for promotion
reason for rejection
```

---

# ‏203. `Champion / Challenger`

‏גרסה קיימת היא Champion.

‏גרסה חדשה צריכה להוכיח שהיא טובה יותר כ־Challenger.

---

# ‏204. Challenger לא מחליף Champion בגלל Backtest אחד

‏צריך רצף Evidence.

---

# ‏205. `Rollback`

‏אם Version חדש נכשל ב־Shadow/Live, צריך יכולת לחזור לגרסה קודמת.

---

# ‏206. Learning from Failure

‏כישלון Out-of-Sample הוא מידע חשוב.

‏לא “מתקנים אותו” מיד עד שהוא נעלם.

---

# ‏207. RCA לפני Retuning

‏לפני שינוי Parameters בודקים:

```text
Was the hypothesis wrong?
Was the data wrong?
Was execution wrong?
Was regime different?
Was there leakage?
```

---

# ‏208. Retuning Risk

‏אם כל כישלון מוביל לעוד Parameter, המודל הופך ל־Patchwork שמתאים להיסטוריה.

---

# ‏209. `Rule Accumulation`

‏זה Anti-pattern נפוץ:

```text
If X failed, add rule A
If Y failed, add rule B
If Z failed, add rule C
```

‏עד שהמערכת “מסבירה” את כל העבר.

---

# ‏210. Exception Hell

‏אסטרטגיה עם עשרות חריגים יכולה להיות סימן ל־Overfit.

---

# ‏211. Prefer General Rules

‏עדיף Rule שמסביר קבוצה רחבה של מקרים מאשר Exception לכל כישלון.

---

# ‏212. `Post-Mortem Bias`

‏בדיעבד קל מאוד להמציא הסבר לכל Trade.

‏אבל הסבר טוב צריך להיות ניתן לזיהוי מראש.

---

# ‏213. Predictable Feature

‏אם “הסיבה” לכישלון ניתנת לזיהוי רק אחרי שהמחיר כבר ירד, היא לא Feature שימושי לכניסה.

---

# ‏214. Causal Story אינה Evidence

‏סיפור הגיוני עוזר לחשוב, אבל לא מחליף בדיקה אמפירית.

---

# ‏215. `Hypothesis → Test → Result`

‏הסדר חשוב.

‏לא:

```text
Result → Story → Hypothesis
```

---

# ‏216. Data Mining יכול לייצר Hypothesis

‏מותר להשתמש ב־Data Mining לגילוי רעיונות.

‏אבל אחר כך חייבים Confirmation על Data אחר.

---

# ‏217. Separate Research Phases

‏מומלץ לשמור סטטוס:

```text
DISCOVERY
VALIDATION
LOCKED_TEST
SHADOW
PAPER
CANARY
LIVE
```

---

# ‏218. Locked Test Means Locked

‏אם פותחים אותו ומשנים את המודל, צריך להתייחס אליו מעכשיו כ־Validation ולא כ־Final Test.

---

# ‏219. Fresh Holdout

‏אם זיהמנו Test, עדיף למצוא תקופה חדשה מאשר להעמיד פנים שהוא עדיין נקי.

---

# ‏220. Time Is a Natural Holdout

‏במערכת חיה, העתיד שמגיע מחר הוא תמיד Out-of-Sample אמיתי.

---

# ‏221. Shadow Forward Test

‏לכן Forward Test בזמן אמת הוא כלי חזק מאוד נגד Overfitting.

---

# ‏222. Stop Changing During Forward Test

‏אם משנים Strategy כל יום, אי אפשר לדעת מה נבדק.

---

# ‏223. Fixed Evaluation Window

‏קובעים תקופה או מספר Opportunities מינימלי לפני מסקנה, אלא אם יש Failure Safety שמחייב עצירה.

---

# ‏224. Avoid Peeking

‏בדיקה יומית של Metric ואז שינוי Threshold היא צורה של Peeking.

---

# ‏225. Monitoring מול Tuning

‏מותר לנטר Safety ו־Data Quality.

‏אבל שינוי Model Logic צריך לעבור Experiment חדש.

---

# ‏226. `Data Drift`

‏Distribution של Features יכולה להשתנות עם הזמן.

---

# ‏227. `Concept Drift`

‏גם הקשר בין Feature ל־Outcome יכול להשתנות.

---

# ‏228. Drift אינו הוכחת Overfit

‏מודל יכול להיות אמיתי ובכל זאת להיחלש כי השוק השתנה.

---

# ‏229. Distinguish Overfit from Drift

‏שאלה חשובה:

```text
Did the model never generalize?
or
Did it generalize and later decay?
```

---

# ‏230. Versioned Time Performance

‏שומרים ביצועים לפי Version לאורך זמן כדי לזהות דעיכה.

---

# ‏231. `Feature Drift Dashboard`

‏בהמשך נוכל לנטר:

- ‏Mean/median.
- ‏Percentiles.
- ‏Missing rate.
- ‏Freshness.
- ‏Correlation to outcome.

---

# ‏232. `Score Drift`

‏גם Distribution של Score צריך מעקב.

---

# ‏233. `Rank Drift`

‏אם Rank #1 היום נראה סטטיסטית שונה מהעבר, צריך להבין למה.

---

# ‏234. `Outcome Drift`

‏גם Forward Returns/Hit Rate/Time-to-Target יכולים להשתנות.

---

# ‏235. Edge Decay

‏Edge יכול לדעוך בהדרגה.

‏לכן Validation אינו אירוע חד־פעמי.

---

# ‏236. Continuous Validation

‏גם Production צריך להמשיך למדוד Out-of-Sample Performance.

---

# ‏237. אבל Production אינו Research Playground

‏לא משנים Model בלי Versioning, Testing ו־Promotion Process.

---

# ‏238. `Leakage Test Cases`

‏כדאי לכתוב בדיקות אוטומטיות שמנסות להוכיח שאין Future Access.

---

# ‏239. Test: Future Event Invisible

‏מריצים Feature Engine בזמן `t` ומוודאים שהוספת אירוע ב־`t+1` אינה משנה את Feature של `t`.

---

# ‏240. Test: Historical Join

‏מוודאים שכל Joined Timestamp:

```text
joined_time <= target_time
```

---

# ‏241. Test: Train-only Fitting

‏מוודאים ש־Scaler/Normalizer אינו מקבל Rows של Validation/Test בזמן `fit`.

---

# ‏242. Test: Point-in-Time Universe

‏מוודאים ש־Symbol לא מופיע לפני תאריך eligibility שלו.

---

# ‏243. Test: Label Isolation

‏מוודאים שעמודות Label אינן נכנסות ל־Feature Pipeline.

---

# ‏244. Test: Reproducible Run

‏אותו Run עם אותם Inputs צריך להחזיר אותה תוצאה.

---

# ‏245. `Golden Dataset`

‏Dataset קטן ידני שבו אנחנו יודעים בדיוק מה אמור לקרות הוא כלי מצוין נגד Leakage.

---

# ‏246. Manual Timeline Audit

‏לוקחים Trade אחד ומציגים:

```text
all events before signal
features
score
rank
decision
future events hidden
label computed only afterward
```

---

# ‏247. Explain One Candidate

‏אם אי אפשר להסביר מאיפה כל Feature הגיע בזמן נתון, המחקר קשה לאמון.

---

# ‏248. `Lineage`

‏לכל Feature חשוב לדעת:

```text
source rows
source timestamps
formula
version
```

---

# ‏249. Feature Lineage Debugging

‏במקרה של תוצאה חשודה אפשר להגיע עד הנתונים הגולמיים שיצרו אותה.

---

# ‏250. `Decision Lineage`

‏אותו רעיון עבור:

```text
Filter → Feature → Score → Rank → Decision
```

---

# ‏251. Best Practice: Keep Raw Data Immutable

‏עדיף לא לשנות את Raw Data במקום.

‏מייצרים שכבות Derived versioned.

---

# ‏252. Best Practice: Separate Labels

‏שומרים Labels במבנה לוגי נפרד מ־Features כדי להקטין סיכון Leakage.

---

# ‏253. Best Practice: Time-aware APIs

‏API מחקרי טוב יכול לדרוש מפורשות:

```text
as_of_time
```

‏במקום “תן לי את המידע הכי קרוב”.

---

# ‏254. Best Practice: Default to Past-only

‏פונקציות Historical Lookup צריכות כברירת מחדל להחזיר רק זמן עבר.

---

# ‏255. Best Practice: Fail on Future Join

‏אם Join מחזיר Timestamp עתידי — עדיף Exception מאשר תיקון שקט.

---

# ‏256. Best Practice: Record Every Experiment

‏גם ניסוי קטן.

‏זה עוזר להבין כמה Hypotheses באמת ניסינו.

---

# ‏257. Best Practice: Keep a Simple Champion

‏אל תמחק את Baseline כאשר נולד מודל מורכב.

‏תמיד צריך Reference.

---

# ‏258. Best Practice: Promote Slowly

‏הוכחה טובה נבנית בשלבים.

---

# ‏259. Best Practice: Prefer Evidence Across Periods

‏תוצאה סבירה ועקבית בכמה תקופות עדיפה לעיתים על תוצאה מדהימה בתקופה אחת.

---

# ‏260. Best Practice: Test the Rejected Candidates

‏אם Filter חדש “משפר” PnL, בדוק גם מה קרה למניות שהוא זרק.

---

# ‏261. Best Practice: Counterfactual Ranking

‏בדוק #2/#3/#5 ולא רק #1.

‏זה עוזר להבין אם Ranking אמיתי או מקרי.

---

# ‏262. Best Practice: Separate Prediction from Execution

‏אם Prediction עובד אבל PnL לא — הבעיה אולי Execution.

‏אל תשנה Score לפני שמבינים זאת.

---

# ‏263. Best Practice: Separate Costs from Signal

‏אם Gross Edge קיים ו־Net לא, זו בעיה כלכלית/Execution — לא בהכרח Prediction Failure.

---

# ‏264. Best Practice: Keep Failure Taxonomy

‏כל Failure יכול להיות מסווג:

```text
prediction
ranking
filter
entry
fill
exit
cost
data
latency
risk
operations
```

---

# ‏265. למה זה מונע Overfit

‏כי אנחנו לא מגיבים לכל Loss על ידי שינוי ה־Signal.

---

# ‏266. Anti-pattern: Tune after Every Loss

‏Loss בודד אינו Evidence מספיק.

---

# ‏267. Anti-pattern: Optimize for Win Rate Only

‏אפשר להעלות Win Rate ולפגוע ב־Expected Value.

---

# ‏268. Anti-pattern: Optimize for PnL Only

‏PnL יכול להיות מונע מכמה Outliers.

---

# ‏269. Anti-pattern: Pick Best Day

‏יום מצוין אינו Strategy.

---

# ‏270. Anti-pattern: Remove Bad Days without Rule

‏אם מסירים ימים רק כי הפסידו — זו Cherry Picking.

---

# ‏271. Anti-pattern: Ignore No-Trade Periods

‏גם תקופות בלי עסקה הן חלק מהמערכת.

---

# ‏272. Anti-pattern: Use Current Universe for All History

‏זה Survivorship Bias קלאסי.

---

# ‏273. Anti-pattern: Normalize on Full Dataset

‏זה Leakage נפוץ במיוחד.

---

# ‏274. Anti-pattern: Reuse Final Test Repeatedly

‏אחרי מספיק פעמים הוא Validation Set בתחפושת.

---

# ‏275. Anti-pattern: Thousands of Parameters

‏מערכת אישית אינה צריכה להיות Optimizer שמחפש מיליוני Combinations לפני שיש Hypothesis ברור.

---

# ‏276. Anti-pattern: Perfect Historical Fill

‏זה Execution Overfitting.

---

# ‏277. Anti-pattern: Assume Every Top-1 Fillable

‏במיוחד באסטרטגיה קצרה, Winners יכולים לברוח לפני ה־Fill.

---

# ‏278. Anti-pattern: Explain Every Failure with a New Feature

‏זה מסלול מהיר ל־Feature Explosion.

---

# ‏279. Anti-pattern: Delete Failed Experiments

‏אז מאבדים את ה־Multiple Testing Context.

---

# ‏280. Anti-pattern: Change Metric after Seeing Result

‏זה Metric Shopping.

---

# ‏281. רז מקצוע: Overfitting לא נראה תמיד “מורכב”

‏גם Rule פשוט יכול להיות Overfit אם בחרנו אותו אחרי אלפי ניסיונות.

---

# ‏282. רז מקצוע: Simplicity אינה חסינות

‏`Momentum > 0.173%` יכול להיות Overfit בדיוק כמו Neural Network אם המספר נבחר בדיעבד מתוך המון אפשרויות.

---

# ‏283. רז מקצוע: Process חשוב כמו Model

‏מודל טוב עם Research Process גרוע אינו אמין.

---

# ‏284. רז מקצוע: Evidence Trail

‏יכולת לענות “למה אנחנו מאמינים לגרסה הזאת?” היא נכס בפני עצמו.

---

# ‏285. רז מקצוע: Boring Results יכולים להיות טובים

‏Edge קטן ועקבי מחוץ למדגם יכול להיות מעניין יותר מ־Backtest מדהים ושביר.

---

# ‏286. רז מקצוע: Uncertainty היא חלק מהתוצאה

‏לא רק:

```text
EV = +0.08%
```

‏אלא גם:

```text
How uncertain is that estimate?
```

---

# ‏287. רז מקצוע: Negative Evidence חשוב

‏אם Feature לא עובד ב־OOS — זו למידה חשובה, לא כישלון שצריך להסתיר.

---

# ‏288. רז מקצוע: “לא יודע” הוא מצב תקין

‏לפעמים Data עדיין לא מספיק כדי להחליט אם יש Edge.

---

# ‏289. רז מקצוע: More Data אינו תמיד More Information

‏עוד מיליוני Ticks מאותו אירוע אינם כמו עוד מאות ימים בלתי־תלויים.

---

# ‏290. רז מקצוע: Stability before Optimization

‏קודם מחפשים Pattern יציב.

‏רק אחר כך מנסים לסחוט שיפור קטן.

---

# ‏291. התאמה לרובוט שלך: מה במיוחד מסוכן

‏הרובוט שלך סורק אלפי מניות ומחפש Winner כל כמה שניות.

‏לכן יש הרבה מאוד הזדמנויות ל־Selection Bias.

---

# ‏292. Cross-Sectional Winner's Curse

‏גם אם לכל מניה Noise אקראי, מתוך 4,000 אחת תהיה קיצונית.

‏Top-1 תמיד נראה “מיוחד” יחסית לאחרים.

---

# ‏293. לכן Rank #1 דורש Baseline

‏צריך להשוות ל:

```text
Top-2
Top-5
Top-10
random survivor
simple momentum winner
```

---

# ‏294. Short Horizon מגדיל רגישות

‏כשמחפשים Edge של שניות, טעות Timestamp קטנה יכולה להפוך Past ל־Future.

---

# ‏295. Seconds-level Leakage

‏גם 500ms של Future Data יכולים להיות מהותיים.

---

# ‏296. Timestamp Precision

‏צריך לשמור Precision שמתאימה למקור.

‏אסור להעמיד פנים שיש Microseconds אם הנתונים בפועל ברזולוציה של שנייה.

---

# ‏297. Ties

‏אם הרבה Events חולקים אותו Timestamp, צריך Policy עקבית לסדר ביניהם.

---

# ‏298. Ambiguous Ordering

‏אם לא יודעים מי קדם למי, אסור לבחור סדר שתמיד מיטיב עם האסטרטגיה.

---

# ‏299. Conservative Tie Policy

‏במקרה של ספק, עדיף הנחה שמרנית או לסמן את האירוע Ambiguous.

---

# ‏300. Scanner Evaluation Unit

‏אצלנו יחידת המחקר אינה רק Trade.

‏היא יכולה להיות:

```text
scanner snapshot
candidate episode
trade decision
executed trade
```

---

# ‏301. Snapshot Leakage

‏כאשר מחשבים Rank לכל השוק, כל Symbol חייב להיות מיוצג רק על ידי State שהיה ידוע באותו `as_of_time`.

---

# ‏302. Cross-Symbol Timing

‏אסור להשוות Symbol A עם quote מ־10:00:00 ו־Symbol B עם quote מ־10:00:01 כאילו שניהם “עכשיו” בלי לתעד את ה־staleness.

---

# ‏303. Freshness is Part of the Feature State

‏גם גיל הנתון צריך להישמר.

---

# ‏304. Full-Market Leakage Risk

‏Pipeline שמחשב Feature “אחרי שכל batch הגיע” עלול בטעות להשתמש בנתונים של סוף ה־batch עבור Symbols בתחילת ה־batch.

---

# ‏305. Batch Boundary Audit

‏צריך לבדוק איך Sampling/Batching משפיע על `as_of_time`.

---

# ‏306. Strict Snapshot Contract

‏כל snapshot צריך לענות:

```text
What exactly was known at this timestamp?
```

---

# ‏307. Expected Outcome Horizons

‏לרובוט שלך נרצה Labels כמו:

```text
forward_1s
forward_2s
forward_5s
forward_10s
forward_30s
forward_60s
```

---

# ‏308. Label Creation תמיד אחרי Feature Freeze

‏קודם מקפיאים State בזמן `t`.

‏רק אחר כך מסתכלים קדימה כדי לייצר Labels.

---

# ‏309. `Feature Snapshot` Immutable

‏Feature Snapshot בזמן `t` לא משתנה אחרי שהעתיד הגיע.

---

# ‏310. If It Changes, There Is a Bug

‏אם חישוב מחדש אחרי יום המסחר משנה Feature היסטורי בגלל נתונים עתידיים שלא היו זמינים בזמן אמת — צריך להבין למה.

---

# ‏311. Research Architecture מומלצת

```text
Raw Events
  ↓
Point-in-Time Market State
  ↓
Feature Snapshot
  ↓
Filter + Score + Rank
  ↓
Decision Snapshot
  ↓
Future Label Builder
  ↓
Validation
```

---

# ‏312. הפרדה פיזית/לוגית

‏הפרדה בין `Feature Builder` ל־`Label Builder` מקטינה את הסיכוי לזליגה.

---

# ‏313. Validation Pipeline

```text
Discovery Train
→ Validation
→ Locked Test
→ Walk-Forward
→ Shadow Forward Test
```

---

# ‏314. Promotion Gate לרובוט שלך

‏Version לא מתקדם רק כי:

```text
Backtest PnL > 0
```

---

# ‏315. Promotion Gate צריך לכלול

‏למשל:

- ‏No known leakage.
- ‏Point-in-time universe.
- ‏OOS positive evidence.
- ‏Rank monotonicity reasonable.
- ‏Top-1 premium not isolated accident.
- ‏Net edge survives realistic costs.
- ‏Sensitivity acceptable.
- ‏No single-day domination.
- ‏Shadow behavior plausible.

---

# ‏316. Failure Gate

‏אם מתגלה Leakage — כל התוצאות שתלויות בו חשודות עד להרצה מחדש.

---

# ‏317. אין “לתקן רק את המספר”

‏Leakage הוא RCA של Pipeline, לא Adjustment קטן ל־PnL.

---

# ‏318. Recompute from Source

‏אחרי תיקון Leakage מריצים מחדש מה־Raw Data אם צריך.

---

# ‏319. Compare Before/After

‏שומרים Diff:

```text
old result
fixed result
reason
affected runs
```

---

# ‏320. Leakage Incident Log

‏גם טעות מחקרית צריכה Incident Log כדי שלא תחזור.

---

# ‏321. Best Practice לסיום: המטרה אינה Backtest יפה

‏המטרה היא מערכת שבה קשה לעצמנו לרמות את עצמנו בטעות.

---

# ‏322. Checklist — Time Integrity

- ‏כל Feature משתמש רק בעבר?
- ‏כל Join הוא Past-only?
- ‏אין Backfill עתידי?
- ‏אין centered windows?
- ‏timestamps ברזולוציה אמיתית?
- ‏tie policy מוגדרת?

---

# ‏323. Checklist — Data Integrity

- ‏Universe היסטורי?
- ‏delisted/IPO/symbol changes מטופלים?
- ‏Missing policy Live-compatible?
- ‏Dataset versioned?
- ‏Raw data immutable?

---

# ‏324. Checklist — Split Integrity

- ‏Train לפני Validation?
- ‏Validation לפני Test?
- ‏Test לא שימש Tuning?
- ‏overlapping labels טופלו?
- ‏purge/embargo נשקלו?

---

# ‏325. Checklist — Research Integrity

- ‏Hypothesis נכתבה לפני הניסוי?
- ‏Primary Metric הוגדר מראש?
- ‏כל הניסויים נשמרו?
- ‏Failed experiments נשמרו?
- ‏Multiple testing נלקח בחשבון?

---

# ‏326. Checklist — Robustness

- ‏Parameter sensitivity?
- ‏Ablation?
- ‏Leave-one-day-out?
- ‏Leave-one-symbol-out?
- ‏Regime analysis?
- ‏Cost stress?
- ‏Latency stress?

---

# ‏327. Checklist — Generalization

- ‏Out-of-sample?
- ‏Walk-forward?
- ‏Fresh holdout?
- ‏Shadow forward test?
- ‏Sim-to-live comparison בהמשך?

---

# ‏328. Checklist — Complexity

- ‏כל Feature מצדיק את עצמו?
- ‏כל Rule מצדיק את עצמו?
- ‏כל Parameter נחוץ?
- ‏יש Baseline פשוט?
- ‏ה־Champion נשמר להשוואה?

---

# ‏329. Checklist — Robot-specific

- ‏Top-1 באמת עדיף על Top-N?
- ‏ה־Edge קיים ב־1/2/5/10/30/60s?
- ‏ה־Edge עדיין קיים בזמן Fill?
- ‏ה־Edge נשאר אחרי Costs?
- ‏הוא לא נובע מיום/מניה אחת?
- ‏אין Leakage בין Symbols בתוך Batch?

---

# ‏330. מודל עבודה מומלץ

```text
1. Discover on Train
2. Freeze hypothesis
3. Validate on later data
4. Reject or refine
5. Lock version
6. Run untouched Test
7. Walk-forward
8. Shadow forward test
9. Only then consider further promotion
```

---

# ‏331. המשפט שצריך לזכור

> ‏**ה־Backtest אינו מבחן של כמה טוב אנחנו יודעים להסביר את העבר; הוא מבחן של כמה טוב תהליך המחקר שלנו מגן עלינו מפני שימוש בעבר כדי לנחש את העתיד.**

---

# ‏332. מה עדיין לא עשינו

‏בפרק הזה לא ניסינו לשפר את ה־Score.

‏בכוונה.

‏קודם בנינו כללים שמבטיחים שהשיפור הבא יהיה ניתן לאמון.

---

# ‏333. החיבור לשלב הבא

‏בשלב 24 נלמד איך לבצע **ניסויים נכונים ולשפר את ה־Score** בתוך המסגרת שבנינו כאן:

```text
Baseline
→ Hypothesis
→ Controlled Experiment
→ Ablation
→ Validation
→ Decision
```

‏כך נוכל לנסות לשפר את הרובוט בלי להפוך כל שיפור לכיוון נוסף של Overfitting.
