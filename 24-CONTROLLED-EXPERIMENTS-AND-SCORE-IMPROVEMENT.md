# ‏שלב 24 — ניסויים נכונים ושיפור ה־`Score`: איך לדעת ששינוי באמת מוסיף Edge

> ‏מטרת הפרק: ללמוד איך משפרים `Scanner`, ‏`Features`, ‏`Filters`, ‏`Score`, ‏Entry ו־Exit באמצעות ניסויים מבוקרים — בלי ליפול למלכודת שבה כל שינוי שנראה טוב על גרף אחד מקבל מיד מקום במערכת.
>
> ‏העיקרון המרכזי: **שיפור אמיתי הוא שינוי שמוסיף ערך מדיד מעל Baseline קבוע, שורד נתונים שלא שימשו לפיתוח, ושומר על היתרון גם אחרי עלויות וביצוע מציאותיים.**
>
> ‏כמו בכל הקורס: קודם נלמד את עקרונות המחקר הכלליים, אחר כך את ה־Best Practices ורזי המקצוע, ולבסוף נתאים אותם לרובוט שלך — סריקת כל השוק, דירוג מתמשך והחזקה של שניות בודדות ועד בערך דקה.

---

# ‏1. למה בכלל צריך ניסוי מבוקר?

‏נניח שהוספנו Feature חדש:

```text
activity_acceleration_5s
```

‏וה־Backtest השתפר.

‏עדיין לא הוכחנו שה־Feature עזר.

‏אולי:

- ‏שינינו במקביל גם Filter.
- ‏החלפנו Dataset.
- ‏שינינו עלויות.
- ‏שינינו Holding Time.
- ‏בדקנו תקופה אחרת.
- ‏ניסינו עשרים גרסאות ובחרנו בדיעבד את הטובה ביותר.
- ‏השיפור קיים רק בכמה מניות חריגות.
- ‏השיפור נובע מ־Data Leakage.

‏ניסוי מבוקר מנסה לבודד את הסיבה.

---

# ‏2. השאלה הנכונה

‏לא:

> ‏"האם הגרסה החדשה נראית טובה?"

‏אלא:

> ‏"כאשר כל שאר התנאים זהים, האם השינוי הספציפי הזה משפר את המדדים שאנחנו באמת רוצים?"

---

# ‏3. `Baseline`

‏`Baseline` הוא הגרסה שאותה אנחנו מנסים לנצח.

‏לדוגמה:

```text
Baseline v12
Features = momentum + activity + liquidity
Score = current production weights
Filters = current production filters
Execution model = F3
Dataset = 2026-Q1..Q3
```

‏בלי Baseline קבוע אי אפשר לדעת מה באמת השתנה.

---

# ‏4. `Control` ו־`Treatment`

‏במונחי ניסוי:

```text
Control   = המערכת הקיימת
Treatment = אותה מערכת + השינוי הנבדק
```

‏לדוגמה:

```text
Control:
score = momentum + activity

Treatment:
score = momentum + activity + acceleration
```

‏כל השאר צריך להישאר זהה ככל האפשר.

---

# ‏5. שינוי אחד בכל פעם

‏זהו אחד ה־Best Practices החשובים ביותר.

‏אם באותו ניסוי משנים:

- ‏Feature.
- ‏Filter.
- ‏Weight.
- ‏Holding Time.
- ‏Exit.

‏והתוצאה משתפרת — איננו יודעים למה.

‏לכן ברירת המחדל:

> ‏ניסוי אחד = שאלה אחת מרכזית.

---

# ‏6. לא תמיד אפשר לשנות רק דבר אחד

‏לפעמים Feature חדש דורש גם Normalization חדש.

‏לפעמים Entry חדש דורש TTL שונה.

‏במקרה כזה מגדירים את השינוי כחבילה מפורשת:

```text
Treatment Package A
- feature_x
- normalization_x
- weight_x
```

‏אבל לא מסתירים זאת תחת הכותרת "הוספנו Feature".

---

# ‏7. `Hypothesis`

‏לפני הרצת הניסוי כותבים מה אנחנו מצפים שיקרה.

‏לדוגמה:

> ‏מניות שהפעילות בהן מאיצה במקביל למומנטום חיובי צפויות להראות `Forward Return` טוב יותר ב־5–30 שניות לעומת מניות עם אותו מומנטום אך פעילות שאינה מאיצה.

‏זו Hypothesis שאפשר לבדוק.

---

# ‏8. Hypothesis טובה היא ספציפית

‏חלש:

> ‏"Acceleration אולי יעזור."

‏חזק יותר:

> ‏"הוספת `activity_acceleration_5s` צפויה לשפר את Median Net Forward Return של Top-1 ב־10 שניות בלי להוריד Fill Rate ביותר מ־X."

‏המספרים עצמם צריכים להיקבע לפי המחקר, לא להמציא מראש יעד שרירותי.

---

# ‏9. `Primary Metric`

‏לפני הניסוי צריך להגדיר מהו המדד המרכזי.

‏לדוגמה:

```text
Primary metric:
Top1 median net_forward_return_10s
```

‏בלי Primary Metric קל מאוד לבחור בדיעבד את המדד היחיד שנראה טוב.

---

# ‏10. `Secondary Metrics`

‏בנוסף למדד הראשי אפשר למדוד:

- ‏Hit Rate.
- ‏Expected Value.
- ‏MFE.
- ‏MAE.
- ‏Time to First Profit.
- ‏Time to Target.
- ‏Fill Rate.
- ‏Slippage.
- ‏Trade Frequency.
- ‏No-Trade Frequency.
- ‏Tail Loss.

‏אבל צריך לדעת מראש מי מהם Primary ומי Secondary.

---

# ‏11. `Guardrail Metrics`

‏שיפור במדד אחד לא צריך להרוס משהו חשוב אחר.

‏לדוגמה:

```text
Primary:
Net EV ↑

Guardrails:
P95 MAE must not worsen materially
Fill rate must remain acceptable
Trade frequency must not collapse
Tail loss must not worsen materially
```

---

# ‏12. למה Average בלבד מסוכן

‏שינוי יכול לשפר Average בגלל כמה עסקאות חריגות.

‏לכן בודקים גם:

- ‏Median.
- ‏Percentiles.
- ‏Distribution.
- ‏Worst buckets.
- ‏Tail losses.
- ‏Stability across days.

---

# ‏13. `Experiment Spec`

‏לכל ניסוי כדאי מסמך קצר עם:

```text
experiment_id
hypothesis
control_version
treatment_version
dataset_version
primary_metric
secondary_metrics
guardrails
holding_horizons
execution_model
cost_model
acceptance_rule
```

---

# ‏14. `Experiment Registry`

‏כל הניסויים צריכים להירשם במקום אחד.

‏המטרה:

- ‏לא לשכוח מה כבר ניסינו.
- ‏לא לחזור על ניסויים בלי סיבה.
- ‏לדעת כמה ניסויים בוצעו.
- ‏להקטין Multiple Testing סמוי.
- ‏ללמוד גם מכישלונות.

---

# ‏15. מזהה ניסוי

‏לדוגמה:

```text
EXP-2026-0042
```

‏צריך להופיע ב:

- ‏Config.
- ‏Results.
- ‏Plots.
- ‏Decision log.
- ‏Commit/branch אם רלוונטי.

---

# ‏16. Freeze לפני הרצה

‏לפני הרצת ניסוי רציני מקפיאים:

- ‏Code version.
- ‏Dataset version.
- ‏Universe definition.
- ‏Feature definitions.
- ‏Cost model.
- ‏Execution model.
- ‏Metrics.

‏אחרת התוצאה אינה ניתנת לשחזור.

---

# ‏17. `One Change at a Time`

‏זו ברירת המחדל הטובה ביותר בזמן בניית מערכת.

‏היא איטית יותר מאשר לשנות הכול יחד — אבל מייצרת ידע.

---

# ‏18. `Ablation Test`

‏Ablation שואל:

> ‏מה קורה אם מסירים רכיב אחד?

‏לדוגמה:

```text
Full score
minus momentum
minus activity
minus liquidity
minus acceleration
```

‏אם הסרת Feature לא פוגעת בתוצאה — ייתכן שהוא אינו מוסיף ערך.

---

# ‏19. למה Ablation חשוב במיוחד

‏Feature יכול להיראות חזק בפני עצמו אבל להיות מיותר בתוך המודל.

‏למשל:

```text
momentum_5s
momentum_10s
velocity_10s
```

‏שלושתם עשויים לתאר כמעט אותו מידע.

---

# ‏20. `Incremental Value`

‏אנחנו מחפשים:

```text
Value(new system) - Value(baseline)
```

‏ולא רק:

```text
Value(new feature alone)
```

---

# ‏21. Feature חזק לבד יכול להיות חסר ערך בתוך Score

‏אם Feature חדש מתואם מאוד ל־Feature קיים, הוא עשוי לא להוסיף מידע חדש.

‏זו סיבה לבדוק Incremental Value.

---

# ‏22. `Feature Contribution`

‏אפשר לבחון תרומה בכמה דרכים:

- ‏Ablation.
- ‏Permutation-like tests.
- ‏Marginal improvement.
- ‏Bucket analysis.
- ‏Rank movement.
- ‏Counterfactual ranking.

---

# ‏23. Rank Movement

‏מעניין לבדוק:

```text
rank_before
rank_after
```

‏לכל Candidate.

‏Feature שלא משנה כמעט דירוג כנראה משפיע מעט מאוד.

---

# ‏24. אבל שינוי Rank אינו מספיק

‏צריך לבדוק גם:

```text
rank_change → future outcome change
```

‏אם Feature משנה הרבה Rankings אבל לא משפר Outcomes — הוא אולי מוסיף רעש.

---

# ‏25. `Rank Flip Analysis`

‏במיוחד מעניין לבדוק מקרים שבהם:

```text
Control Top1 = AAA
Treatment Top1 = BBB
```

‏ואז לשאול:

> ‏איזו מהן באמת התנהגה טוב יותר לאחר מכן?

---

# ‏26. Counterfactual Selection

‏שומרים לכל Timestamp גם:

- ‏מי נבחר ב־Control.
- ‏מי נבחר ב־Treatment.
- ‏מה קרה לשניהם.

‏כך אפשר לחקור את החלטות ההחלפה עצמן.

---

# ‏27. `Selection Regret`

‏אפשר למדוד:

```text
best_available_future_outcome - selected_future_outcome
```

‏זה אינו מדד Live ישיר — כי בעת אמת לא יודעים את העתיד — אבל הוא שימושי למחקר.

---

# ‏28. `Rank Monotonicity`

‏אם Score טוב, נצפה בדרך כלל ש־Rank גבוה יותר יתאים לתוצאה עתידית טובה יותר בממוצע.

‏לדוגמה:

```text
Rank 1-5    > Rank 6-20
Rank 6-20   > Rank 21-100
```

‏לא חייב להיות מושלם, אבל צריך לחפש מבנה עקבי.

---

# ‏29. Score Calibration

‏אם Score עולה מ־70 ל־90, מה משתנה בתוצאה?

‏בודקים Buckets:

```text
60-70
70-80
80-90
90-100
```

‏ואת Outcomes בכל Bucket.

---

# ‏30. Score שאינו Calibrated עדיין יכול לדרג טוב

‏חשוב להפריד:

- ‏Ranking quality.
- ‏Probability calibration.

‏לא כל Score צריך להיות הסתברות.

---

# ‏31. `Weight Tuning`

‏נניח:

```text
score = 0.5 * momentum + 0.3 * activity + 0.2 * liquidity
```

‏אפשר לבדוק משקלים שונים.

‏אבל זו נקודת Overfitting קלאסית.

---

# ‏32. Grid Search אינו חף מסיכון

‏אם ננסה:

```text
100 combinations
```

‏ונבחר את הטובה ביותר — קיבלנו Winner's Curse.

‏לכן חייבים Validation מחוץ לאזור שבו בחרנו את המשקלים.

---

# ‏33. Coarse before Fine

‏Best Practice:

‏קודם לבדוק אזורים רחבים:

```text
momentum weight: low / medium / high
```

‏ורק אם יש אזור יציב — להתקרב.

---

# ‏34. `Robust Plateau`

‏עדיף אזור גדול שבו התוצאה טובה על פני נקודה אחת מושלמת.

‏לדוגמה:

```text
weight 0.35 → good
weight 0.40 → good
weight 0.45 → good
```

‏עדיף בדרך כלל על:

```text
0.4137 → amazing
0.41   → mediocre
0.42   → bad
```

---

# ‏35. למה Plateau חשוב

‏מערכת אמיתית פועלת תחת:

- ‏Noise.
- ‏Drift.
- ‏Latency.
- ‏Data differences.
- ‏Execution differences.

‏מערכת שתלויה במספר חד מאוד היא שברירית.

---

# ‏36. `Sensitivity Analysis`

‏משנים Parameter מעט למעלה ולמטה ובודקים:

```text
metric(parameter - Δ)
metric(parameter)
metric(parameter + Δ)
```

‏אם הכול קורס סביב נקודה אחת — זו נורת אזהרה.

---

# ‏37. Threshold Sensitivity

‏אותו רעיון תקף ל־Filters:

```text
min_trade_count
max_spread_bps
min_activity_rate
```

‏לא לבחור Threshold רק כי הוא נתן Backtest מקסימלי.

---

# ‏38. `Filter Ablation`

‏מסירים Filter אחד ובודקים:

- ‏כמה Candidates נוספים נכנסו.
- ‏מה הייתה איכותם.
- ‏כמה Winners ה־Filter חסם.
- ‏כמה Losers הוא מנע.

---

# ‏39. Filter יכול לשפר Precision ולהרוס Recall

‏זה trade-off.

‏לכן צריך למדוד את שניהם.

---

# ‏40. `Feature × Filter Interaction`

‏לפעמים Feature עובד רק אחרי Filter מסוים.

‏לכן Ablation לא תמיד מספר את כל הסיפור.

---

# ‏41. Interactions

‏לדוגמה:

```text
momentum alone = weak
activity alone = weak
momentum + high activity = strong
```

‏זו Interaction אפשרית.

---

# ‏42. איך בודקים Interaction

‏אפשר ליצור קבוצות:

```text
low momentum / low activity
low momentum / high activity
high momentum / low activity
high momentum / high activity
```

‏ולהשוות Outcomes.

---

# ‏43. לא להמציא Interaction רק כי אפשר

‏מספר האפשרויות גדל מהר מאוד.

‏כל Interaction נוסף מגדיל סיכון Overfitting.

---

# ‏44. `Factorial Experiment`

‏כאשר באמת חשוב לבדוק כמה רכיבים יחד, אפשר להשתמש בתכנון פקטוריאלי.

‏לדוגמה:

```text
Feature A on/off
Feature B on/off
```

‏יוצר ארבע גרסאות.

---

# ‏45. למה Factorial טוב

‏הוא מאפשר לזהות:

- ‏Main Effect של A.
- ‏Main Effect של B.
- ‏Interaction בין A ל־B.

---

# ‏46. אבל לא להתחיל מ־Full Factorial ענק

‏עם עשרה Features נקבל יותר מדי קומבינציות.

‏KISS עדיין חשוב.

---

# ‏47. `Research Funnel`

‏אפשר לעבוד בשלבים:

```text
Idea
→ Cheap screening
→ Controlled experiment
→ Robustness
→ Out-of-sample
→ Shadow
→ Candidate for production
```

---

# ‏48. Cheap Screening

‏בשלב מוקדם אפשר להריץ בדיקה פשוטה ומהירה.

‏המטרה אינה להוכיח — אלא לפסול רעיונות חלשים בזול.

---

# ‏49. Confirmation יקר יותר

‏רעיון שעבר Screening מקבל:

- ‏Dataset רחב יותר.
- ‏Execution realism גבוה יותר.
- ‏Stress tests.
- ‏Walk-forward.
- ‏Shadow test.

---

# ‏50. `Discovery` מול `Confirmation`

‏ב־Discovery מותר לחקור.

‏ב־Confirmation צריך להיות הרבה יותר קשיח.

---

# ‏51. למה ההפרדה חשובה

‏אם אותו Dataset משמש שוב ושוב ל־Discovery, הוא כבר אינו Test אמיתי.

---

# ‏52. Fresh Holdout

‏רצוי לשמור חלק מהנתונים שלא נגעו בהם בזמן פיתוח.

‏רק מועמדים רציניים מגיעים אליו.

---

# ‏53. Holdout אינו קסם

‏אם מסתכלים עליו שוב ושוב ומשנים מודל בהתאם — הוא הופך ל־Training Data סמוי.

---

# ‏54. `Walk-Forward Experiment`

‏במקום Split אחד:

```text
Train → Validate next period
Move forward
Train → Validate next period
```

‏וכך שוב ושוב.

---

# ‏55. למה זה חשוב לרובוט שלך

‏Microstructure, activity ו־spread משתנים עם הזמן.

‏אנחנו רוצים Feature שעובד ביותר מתקופה אחת.

---

# ‏56. `Time Segmentation`

‏כל ניסוי חשוב כדאי לחתוך גם לפי:

- ‏Open.
- ‏Midday.
- ‏Close.
- ‏Pre-market אם רלוונטי.
- ‏After-hours אם רלוונטי.

---

# ‏57. Regime Segmentation

‏אפשר להשוות:

- ‏High volatility.
- ‏Low volatility.
- ‏High activity.
- ‏Quiet market.
- ‏Broad market up/down/flat.

---

# ‏58. Feature שעובד רק ב־Regime אחד

‏זה לא בהכרח רע.

‏אבל צריך לדעת זאת.

‏אולי הוא Feature מותנה Regime ולא Feature אוניברסלי.

---

# ‏59. `Segment Stability`

‏שואלים:

> ‏האם השיפור מגיע מהרבה Segments או רק מאחד?

---

# ‏60. Edge Concentration

‏שיפור יכול להגיע רק:

- ‏מכמה ימים.
- ‏מסמל אחד.
- ‏משעה מסוימת.
- ‏מאירוע חריג.

‏צריך לחשוף זאת.

---

# ‏61. `Leave-One-Day-Out`

‏בדיקה פשוטה:

‏מסירים כל יום בתורו ובודקים אם המסקנה עדיין עומדת.

---

# ‏62. `Leave-One-Symbol-Out`

‏אפשר לבדוק אם Feature תלוי בכמה Symbols חריגים.

---

# ‏63. `Leave-One-Regime-Out`

‏בודקים אם השיפור שורד גם בלי Regime מסוים.

---

# ‏64. `Bootstrap`

‏אפשר להשתמש ב־Bootstrap כדי להעריך אי־ודאות במדדים.

‏אבל צריך להיזהר מתלות בזמן ומ־overlapping samples.

---

# ‏65. Confidence Interval

‏מדד יחיד כמו:

```text
EV = +0.08%
```

‏אינו מספיק.

‏מעניין גם כמה אי־ודאות יש סביבו.

---

# ‏66. `Effect Size`

‏לא רק:

> ‏"האם יש הבדל?"

‏אלא:

> ‏"כמה גדול ההבדל, והאם הוא מספיק גדול כדי להיות שימושי אחרי עלויות?"

---

# ‏67. Statistical Significance אינה Economic Significance

‏אפשר לקבל הבדל סטטיסטי זעיר שאינו מכסה אפילו Spread.

‏לכן תמיד צריך גם משמעות כלכלית.

---

# ‏68. Economic Significance

‏במקרה שלנו נרצה לשאול:

```text
Δ predictive edge
- Δ execution cost
- Δ missed fills
- Δ infrastructure complexity
```

‏האם נשאר משהו שימושי?

---

# ‏69. `Minimum Useful Effect`

‏לפני ניסוי רציני כדאי להגדיר:

> ‏מהו שיפור קטן מדי מכדי להצדיק מורכבות נוספת?

---

# ‏70. Complexity Tax

‏כל Feature חדש מוסיף עלות:

- ‏חישוב.
- ‏Data dependency.
- ‏Testing.
- ‏Monitoring.
- ‏Debugging.
- ‏Failure modes.

‏גם לזה יש מחיר.

---

# ‏71. KISS כקריטריון מחקר

‏אם שתי גרסאות כמעט זהות בתוצאה:

‏עדיף בדרך כלל הפשוטה יותר.

---

# ‏72. `Complexity-adjusted Value`

‏אפשר לחשוב רעיונית:

```text
Value = performance improvement - complexity cost
```

‏לא חייבים להפוך זאת למספר אחד.

---

# ‏73. Feature שאינו מסביר את עצמו

‏Feature מורכב אינו פסול.

‏אבל ככל שהוא מורכב יותר, צריך יותר Evidence.

---

# ‏74. `Mechanistic Plausibility`

‏כדאי לשאול:

> ‏האם יש סיפור שוק סביר שמסביר למה Feature אמור לעזור?

‏זה לא מוכיח Edge, אבל עוזר לבחור רעיונות מחקר סבירים.

---

# ‏75. Story אינו Evidence

‏סיפור יפה לא מחליף נתונים.

‏זה כלל חשוב במיוחד במסחר.

---

# ‏76. `Causal Thinking`

‏אנחנו לא תמיד יכולים להוכיח סיבתיות.

‏אבל כדאי לחשוב:

- ‏מה גורם למה?
- ‏מה רק Correlated?
- ‏מה הוא Proxy?
- ‏מה יכול להיות Confounder?

---

# ‏77. דוגמה ל־Confounder

‏נניח ש־Trade Count גבוה מנבא המשך תנועה.

‏אולי הסיבה האמיתית היא:

```text
news/event → more trades + more momentum
```

‏ולא Trade Count עצמו.

---

# ‏78. למה זה עדיין יכול להיות שימושי

‏גם Proxy יכול להיות Predictive.

‏אבל חשוב להבין מה הוא מודד ומה יקרה כשהקשר ישתנה.

---

# ‏79. `Feature Redundancy`

‏אם שני Features כמעט זהים, אחד מהם עשוי להיות מיותר.

‏מודדים:

- ‏Correlation.
- ‏Rank correlation.
- ‏Ablation.
- ‏Incremental lift.

---

# ‏80. Correlation נמוך אינו מבטיח תרומה

‏שני Features יכולים להיות לא מתואמים ועדיין לא לשפר Prediction.

‏בסוף צריך Outcome test.

---

# ‏81. `Feature Family`

‏כדאי לקבץ Features:

```text
Momentum
Activity
Liquidity
Timing
Market Context
Data Quality
```

---

# ‏82. Family-level Ablation

‏לפעמים עדיף להסיר משפחה שלמה מאשר Feature בודד.

‏כך מבינים איזה סוג מידע באמת מועיל.

---

# ‏83. `Sub-Score Experiment`

‏אפשר לבדוק:

```text
MomentumScore
ActivityScore
LiquidityScore
```

‏בנפרד לפני שמשלבים אותם.

---

# ‏84. Score Architecture Experiment

‏לא רק המשקלים חשובים.

‏אפשר להשוות:

- ‏Weighted sum.
- ‏Rank aggregation.
- ‏Gated score.
- ‏Nonlinear score.
- ‏Separate prediction/execution scores.

---

# ‏85. Gated Score

‏לדוגמה:

```text
if execution_quality < minimum:
    candidate cannot win
else:
    rank by predictive score
```

‏זה שונה מהכנסת Liquidity כעוד Weight קטן.

---

# ‏86. למה ארכיטקטורת Score היא Hypothesis

‏גם הדרך שבה משלבים Features צריכה להיבדק — לא רק הערכים עצמם.

---

# ‏87. `PredictionScore` מול `ExecutionScore`

‏אפשר לבדוק האם עדיף:

```text
single combined score
```

‏או:

```text
prediction score
+ execution gate/score
```

---

# ‏88. `Score Separation`

‏ניסוי יכול לבדוק אם שינוי משפר:

```text
gap(rank1, rank2)
```

‏אבל Gap גדול אינו בהכרח טוב אם Top-1 עצמו אינו טוב יותר בעתיד.

---

# ‏89. `Rank Stability`

‏Feature חדש יכול לשפר Prediction אבל לגרום ל־Rank Churn קיצוני.

‏זה עלול לפגוע בביצוע.

---

# ‏90. ולכן מודדים גם Operational Side Effects

‏לדוגמה:

- ‏יותר Candidate switches.
- ‏יותר cancels.
- ‏יותר missed fills.
- ‏יותר CPU.
- ‏יותר data requirements.

---

# ‏91. `End-to-End Experiment`

‏אחרי שמוכיחים Predictive Lift, צריך לבדוק גם End-to-End.

```text
Scanner
→ Decision
→ Execution
→ Exit
→ Net PnL
```

---

# ‏92. למה לא להתחיל ישר End-to-End

‏אם התוצאה רעה, קשה לדעת איפה הבעיה.

‏לכן מפרקים:

```text
Prediction first
Execution second
Full system last
```

---

# ‏93. `Layered Evidence`

‏שינוי טוב עובר שכבות:

```text
Feature evidence
→ ranking evidence
→ selection evidence
→ execution evidence
→ net economic evidence
```

---

# ‏94. `Acceptance Criteria`

‏לפני הניסוי קובעים מה ייחשב הצלחה.

‏לדוגמה רעיונית:

```text
Primary metric improves
Guardrails do not materially worsen
Result survives OOS
Result survives stress execution
No critical data dependency added
```

---

# ‏95. ארבע תוצאות אפשריות

‏לא כל ניסוי הוא רק Pass/Fail.

```text
KEEP
REJECT
REWORK
NEEDS_MORE_DATA
```

---

# ‏96. `KEEP`

‏כאשר:

- ‏יש שיפור עקבי.
- ‏השיפור שימושי כלכלית.
- ‏הוא שורד OOS.
- ‏אין Guardrail regression מהותי.
- ‏המורכבות מוצדקת.

---

# ‏97. `REJECT`

‏כאשר:

- ‏אין Incremental Value.
- ‏השיפור אינו יציב.
- ‏הוא נעלם אחרי Costs.
- ‏הוא קיים רק ב־In-Sample.

---

# ‏98. `REWORK`

‏כאשר הרעיון נראה מבטיח אבל ההגדרה גרועה.

‏לדוגמה:

- ‏Window לא מתאים.
- ‏Normalization בעייתי.
- ‏Data quality חלשה.

---

# ‏99. `NEEDS_MORE_DATA`

‏כאשר Sample קטן מדי או אי־הוודאות גבוהה מדי.

‏זו תוצאה לגיטימית.

---

# ‏100. לא להפוך `NEEDS_MORE_DATA` ל־KEEP

‏חוסר ודאות אינו אישור.

---

# ‏101. `Experiment Decision Record`

‏בסוף כל ניסוי שומרים:

```text
experiment_id
result
why
primary_metric_delta
guardrail_deltas
important_segments
known_limitations
next_action
```

---

# ‏102. לתעד גם ניסויים שנכשלו

‏ניסוי שלילי הוא ידע.

‏אם לא שומרים אותו, בעתיד מישהו עלול לנסות אותו שוב.

---

# ‏103. `Negative Result Library`

‏אפשר לשמור קטגוריות:

- ‏No lift.
- ‏Too correlated.
- ‏Execution regression.
- ‏Overfit.
- ‏Data unreliable.
- ‏Too expensive computationally.

---

# ‏104. `Experiment Reproducibility`

‏כל ניסוי צריך להיות ניתן להרצה מחדש.

‏צריך לשמור:

- ‏Commit SHA.
- ‏Config hash.
- ‏Dataset version.
- ‏Random seed אם קיים.
- ‏Environment/version.

---

# ‏105. Determinism

‏אותו ניסוי על אותם נתונים צריך להחזיר אותה תוצאה, אלא אם קיימת Randomness מפורשת.

---

# ‏106. Golden Baseline

‏כדאי לשמור Baseline מוכר ולוודא שלא משתנה ללא סיבה.

---

# ‏107. `Regression Detection`

‏כל שינוי חדש צריך להראות לא רק מה השתפר אלא גם מה הורע.

---

# ‏108. Side-by-Side Report

‏דוח טוב מציג:

```text
Metric              Control      Treatment      Delta
Top1 Net EV         ...          ...            ...
Hit Rate            ...          ...            ...
P95 MAE             ...          ...            ...
Fill Rate           ...          ...            ...
Trade Count         ...          ...            ...
```

---

# ‏109. Delta חשוב יותר מהמספר האבסולוטי

‏כי אנחנו בודקים שינוי.

---

# ‏110. `Paired Comparison`

‏כאשר אפשר, משווים Control ו־Treatment על אותם Timestamps/Opportunities.

‏זה מפחית Noise לעומת השוואת תקופות שונות.

---

# ‏111. Same Opportunities

‏אם Treatment משנה Filters, קבוצת ההזדמנויות משתנה.

‏לכן כדאי לשמור גם ניתוח של:

- ‏Common candidates.
- ‏Added candidates.
- ‏Removed candidates.

---

# ‏112. `Added Set Analysis`

‏מה איכות המניות שהגרסה החדשה הוסיפה?

---

# ‏113. `Removed Set Analysis`

‏מה קרה למניות שהגרסה החדשה סילקה?

‏אולי היא פסלה Winners.

---

# ‏114. `Changed Winner Analysis`

‏כאשר Top-1 השתנה — מי צדק?

‏זה אחד הניתוחים הכי שימושיים לרובוט שלך.

---

# ‏115. `No-Change Set`

‏אם שתי הגרסאות בחרו אותה מניה, השינוי אולי אינו משפיע על Decision ברוב הזמן.

---

# ‏116. Coverage

‏מודד באיזה אחוז מה־timestamps השינוי בכלל משנה משהו.

---

# ‏117. `Decision Impact Rate`

```text
timestamps_with_different_decision / total_decision_timestamps
```

‏Feature עם Impact Rate של 0.1% דורש בחינה אם הוא מצדיק מורכבות.

---

# ‏118. `Incremental EV per Changed Decision`

‏מדד מחקרי שימושי:

> ‏כאשר השינוי באמת שינה החלטה — האם ההחלטה החדשה הייתה טובה יותר?

---

# ‏119. `Time-to-Benefit`

‏אם Feature נועד למסחר של שניות, צריך לבדוק מתי השיפור מופיע.

‏לא מספיק שהוא משפר Return אחרי 10 דקות.

---

# ‏120. Horizon Matrix

‏לדוגמה:

```text
1s
2s
5s
10s
30s
60s
```

‏לכל ניסוי בודקים באילו Horizons הוא מועיל.

---

# ‏121. Horizon-specific Feature

‏Feature יכול להיות טוב ל־5 שניות ורע ל־60 שניות.

‏זה מידע חשוב, לא סתירה.

---

# ‏122. `Time to First Profit`

‏אם Treatment משפר Return אבל גורם לעסקה להגיע לרווח הרבה יותר מאוחר — אולי הוא פחות מתאים לרובוט שלך.

---

# ‏123. `Time to Target`

‏אותו דבר לגבי יעד.

---

# ‏124. MFE/MAE Profile

‏שינוי טוב יכול:

- ‏להגדיל MFE.
- ‏להקטין MAE.
- ‏או לשפר את היחס ביניהם.

---

# ‏125. `Path Quality`

‏לא רק התוצאה הסופית חשובה.

‏גם הדרך אליה.

---

# ‏126. Smooth Winner מול Violent Winner

‏שתי עסקאות יכולות להסתיים באותו רווח.

‏אבל אחת עברה קודם ירידה עמוקה.

‏מבחינת Risk ו־Execution הן שונות.

---

# ‏127. `Execution-aware Experiment`

‏Feature שמשפר Signal אבל בוחר מניות עם Spread רחב יותר עלול להוריד Net EV.

---

# ‏128. לכן מודדים תמיד גם Executability

‏למשל:

- ‏Spread at signal.
- ‏Depth.
- ‏Fill rate.
- ‏Entry slippage.
- ‏Exit slippage.

---

# ‏129. `Cost-normalized Lift`

‏אפשר לחשוב על:

```text
predictive improvement / additional trading cost
```

‏לא חייבים להשתמש בנוסחה רשמית — העיקר לא להתעלם מהחיכוך.

---

# ‏130. `Turnover Effect`

‏שינוי Score עלול לייצר יותר switches ויותר עסקאות.

‏יותר EV לעסקה לא תמיד אומר יותר Net PnL ליום.

---

# ‏131. Frequency × Edge

‏צריך לבדוק גם:

```text
opportunities_per_day × net_ev_per_opportunity
```

‏אבל בלי להפוך זאת להבטחת רווח.

---

# ‏132. `Trade / No Trade` Experiment

‏אפשר לשפר מערכת גם על ידי פחות עסקאות.

‏למשל Threshold חדש שמסנן מצבים חלשים.

---

# ‏133. Selectivity Curve

‏מציגים:

```text
threshold → trade frequency → net EV → hit rate
```

‏ומחפשים אזור יציב.

---

# ‏134. לא לבחור Threshold רק לפי Max PnL

‏זו דרך ישירה ל־Overfitting.

---

# ‏135. `Pareto Frontier`

‏לפעמים אין גרסה אחת שטובה בכל מדד.

‏למשל:

- ‏יותר EV אבל פחות Trades.
- ‏יותר Fill Rate אבל מעט פחות Edge.

‏אז בוחנים Trade-offs במפורש.

---

# ‏136. Pareto Thinking

‏גרסה נשלטת היא גרסה שגרסה אחרת טובה ממנה כמעט בכל ממד חשוב.

‏אין סיבה טובה לבחור בגרסה נשלטת.

---

# ‏137. `Champion / Challenger`

‏`Champion` = הגרסה המוכחת הנוכחית.

‏`Challenger` = גרסה חדשה שמנסה להחליף אותה.

---

# ‏138. למה זה עדיף על “latest is best”

‏Commit חדש יותר אינו בהכרח Strategy טובה יותר.

---

# ‏139. Promotion Rule

‏Challenger הופך ל־Champion רק אחרי שעבר את כל ה־gates שהוגדרו.

---

# ‏140. Rollback Rule

‏צריך להגדיר מראש מתי מחזירים גרסה אחורה.

---

# ‏141. Shadow Challenger

‏אפשר להריץ Challenger בלי לשלוח פקודות אמיתיות.

‏הוא מקבל Market Data אמיתי ומייצר Decisions להשוואה.

---

# ‏142. למה Shadow חשוב

‏הוא חושף:

- ‏Data timing differences.
- ‏Live latency.
- ‏Missing data.
- ‏Unexpected churn.
- ‏Sim-to-live divergence.

---

# ‏143. `Online Experiment` אינו תמיד A/B קלאסי

‏במסחר קשה לפצל שוק לשתי גרסאות בלתי־תלויות.

‏אותו Market Event משפיע על שתיהן.

---

# ‏144. לכן Shadow Comparison שימושי מאוד

‏שתי הגרסאות רואות אותו שוק.

‏אחת יכולה להיות Production והשנייה Observer.

---

# ‏145. `Execution Contamination`

‏אם שתי גרסאות שולחות פקודות אמיתיות באותו חשבון, הן עלולות להשפיע זו על זו.

‏לכן זה דורש תכנון זהיר.

---

# ‏146. `Research Budget`

‏גם זמן מחשוב וזמן אנושי הם משאב.

‏לא כל רעיון מצדיק Backtest של שבועות.

---

# ‏147. Expected Research Value

‏שאלה טובה:

> ‏אם הניסוי יצליח, כמה משמעותי השיפור עשוי להיות?

---

# ‏148. `Kill Bad Ideas Early`

‏רעיון שמפסיד בבדיקה פשוטה ועקרונית לא צריך מיד עשרים Optimization rounds.

---

# ‏149. אבל לא לפסול בגלל Bug

‏לפני דחיית רעיון צריך לוודא:

- ‏Data תקין.
- ‏Feature נכון.
- ‏Time alignment נכון.
- ‏No leakage.
- ‏No implementation bug.

---

# ‏150. RCA לניסוי מפתיע

‏אם התוצאה שונה מאוד מהצפוי:

‏לא משנים מיד Parameters.

‏קודם חוקרים למה.

---

# ‏151. `Sanity Checks`

‏לפני כל ניסוי גדול:

- ‏מספר Candidates סביר.
- ‏Feature ranges סבירים.
- ‏No NaN explosion.
- ‏Ranks תקינים.
- ‏Timestamps עולים.
- ‏Costs מופעלים.

---

# ‏152. `Null Test`

‏אפשר לבדוק שהמערכת אינה מוצאת Edge כאשר אין סיבה למצוא אותו.

‏למשל באמצעות permutation/shuffle זהיר במחקר.

---

# ‏153. למה Null Test חשוב

‏אם pipeline “מוצא Edge” גם לאחר שבירת הקשר בין Feature ל־Outcome, כנראה יש בעיית Validation או Leakage.

---

# ‏154. `Random Baseline`

‏משווים גם לבחירה אקראית מתוך ה־eligible universe.

‏Scanner מקצועי צריך לנצח Baseline טיפש באופן עקבי.

---

# ‏155. `Naive Baseline`

‏לדוגמה:

```text
rank only by 10s return
```

‏אם Score מורכב אינו מנצח אותו — צריך לשאול למה.

---

# ‏156. Simpler Baseline is a Strong Opponent

‏מודל פשוט הוא Benchmark מצוין.

‏הוא מכריח מורכבות להוכיח את עצמה.

---

# ‏157. `Incremental Complexity Gate`

‏כל רכיב חדש צריך לענות:

> ‏מה הוא מוסיף שהמערכת הקיימת אינה יודעת?

---

# ‏158. Data Dependency Gate

‏Feature חדש שדורש Feed חדש צריך להצדיק גם:

- ‏עלות.
- ‏Latency.
- ‏Reliability.
- ‏Licensing.
- ‏Operational complexity.

---

# ‏159. `Compute Budget`

‏Whole-market scanner צריך לעמוד בזמן.

‏Feature מעולה שמגיע מאוחר מדי אינו Feature שימושי.

---

# ‏160. Latency Regression

‏כל Experiment חשוב צריך למדוד גם:

```text
feature_compute_latency
ranking_latency
decision_latency
```

---

# ‏161. Predictive gain מול latency loss

‏במסחר קצר מאוד, שיפור Prediction קטן יכול להימחק אם החישוב מוסיף עיכוב משמעותי.

---

# ‏162. `Staleness Impact`

‏Feature כבד יכול לגרום לכך שה־Score מייצג שוק שכבר השתנה.

---

# ‏163. לכן Performance הוא חלק מהמחקר

‏לא רק Engineering concern.

---

# ‏164. `Experiment Dataset Contract`

‏כל ניסוי צריך להצהיר איזה Data מותר לו לצרוך.

---

# ‏165. Point-in-Time Requirement

‏כל נתון חייב להיות זמין ב־`as_of_time` של ההחלטה.

---

# ‏166. `Feature Availability Time`

‏לא מספיק לדעת Timestamp של האירוע.

‏צריך לדעת מתי המערכת הייתה יכולה להשתמש בו.

---

# ‏167. Same Code Path

‏ככל האפשר, Feature logic במחקר וב־Live צריך להיות אותו קוד.

---

# ‏168. `Training/Serving Skew`

‏אם Feature מחושב אחרת במחקר וב־Production, תוצאות הניסוי יכולות להיות חסרות משמעות.

---

# ‏169. `Version Everything`

‏לגרסה צריך להיות:

```text
feature_version
filter_version
score_version
cost_model_version
execution_model_version
universe_version
```

---

# ‏170. Experiment Lineage

‏צריך לדעת בדיוק מאיזה Baseline כל Challenger נולד.

---

# ‏171. `Parent Experiment`

‏אפשר לשמור:

```text
parent_experiment_id
```

‏כך נוצר עץ מחקר.

---

# ‏172. למה עץ מחקר שימושי

‏הוא מאפשר לראות:

- ‏איזה רעיון הוליד איזה שיפור.
- ‏איפה הסתעפנו.
- ‏אילו כיוונים נכשלו.

---

# ‏173. `Research Debt`

‏אם מוסיפים Features בלי להבין אותם, מצטבר חוב מחקרי.

‏אחרי זמן כבר לא יודעים למה כל רכיב קיים.

---

# ‏174. Feature Owner / Rationale

‏לכל Feature כדאי לשמור:

- ‏Purpose.
- ‏Definition.
- ‏Evidence.
- ‏Known limitations.
- ‏Version introduced.

---

# ‏175. `Feature Retirement`

‏Feature שאינו מוסיף ערך צריך להיות מועמד להסרה.

‏נעמיק בכך בהמשך הקורס.

---

# ‏176. Drift Revalidation

‏Feature שאושר בעבר אינו מקבל רישיון נצחי.

‏צריך לבדוק אותו מחדש לאורך זמן.

---

# ‏177. `Experiment Freshness`

‏Evidence ישן מאוד עלול לא לתאר את השוק הנוכחי.

---

# ‏178. Rolling Re-evaluation

‏מערכת Production יכולה להריץ דוחות תקופתיים:

```text
champion metrics
feature lift
rank monotonicity
cost drift
execution drift
```

---

# ‏179. `Do Not Auto-Optimize Production`

‏מערכת שמעדכנת משקלים אוטומטית רק לפי התוצאות האחרונות עלולה לרדוף Noise.

---

# ‏180. Research Loop מבוקר

```text
Observe
→ Hypothesize
→ Design experiment
→ Run
→ Validate
→ Decide
→ Shadow
→ Promote or reject
```

---

# ‏181. לא להפוך את הלולאה ל־Optimization ללא סוף

‏אם כל יום משנים Score, לעולם אין לנו גרסה יציבה למדידה.

---

# ‏182. `Change Budget`

‏Best Practice אפשרי:

‏לאפשר מספר מוגבל של שינויים משמעותיים במקביל.

‏כך יודעים מה השפיע.

---

# ‏183. `Freeze Window`

‏אחרי Promotion אפשר להשאיר גרסה ללא שינוי זמן מסוים כדי לאסוף Evidence נקי.

---

# ‏184. `Post-Promotion Review`

‏אחרי Promotion משווים:

```text
expected lift
vs
observed live/shadow lift
```

---

# ‏185. Sim-to-Live Attribution

‏אם השיפור לא הופיע ב־Live, מפרקים:

- ‏Prediction gap.
- ‏Data gap.
- ‏Latency gap.
- ‏Fill gap.
- ‏Cost gap.
- ‏Regime gap.

---

# ‏186. `Experiment Failure` אינו Strategy Failure

‏ניסוי יכול להיכשל בגלל Infrastructure או Data.

‏צריך לסווג נכון.

---

# ‏187. Failure Taxonomy

```text
NO_PREDICTIVE_LIFT
OVERFIT
EXECUTION_REGRESSION
DATA_QUALITY_FAILURE
LATENCY_REGRESSION
COST_REGRESSION
INSUFFICIENT_SAMPLE
IMPLEMENTATION_BUG
```

---

# ‏188. RCA לפני שינוי נוסף

‏אם Experiment נכשל מסיבה לא ברורה — עושים RCA לפני עוד Optimization.

---

# ‏189. `Experiment Dashboard`

‏כדאי להציג:

- ‏Champion.
- ‏Active challengers.
- ‏Recent experiments.
- ‏Win/loss/rework counts.
- ‏Top metric deltas.

---

# ‏190. אין Score “מושלם”

‏המטרה אינה למצוא נוסחה סופית.

‏המטרה היא לבנות תהליך שמסוגל לשפר את המודל בלי לרמות את עצמו.

---

# ‏191. המבחן החשוב לרובוט שלך

‏עבור כל שינוי נשאל:

> ‏האם הוא מגדיל את ההסתברות שמקום #1 ימשיך לטובתנו **במהירות**, ובצורה שנשארת חיובית אחרי Execution ו־Costs?

---

# ‏192. לא מספיק לשפר Return אחרי 60 שניות

‏אם האסטרטגיה מצפה לתגובה תוך 5–10 שניות, שיפור מאוחר בלבד יכול להיות לא רלוונטי.

---

# ‏193. לכן לכל Experiment יש Horizon Profile

```text
1s
2s
5s
10s
30s
60s
```

---

# ‏194. `Fast Edge` מול `Slow Edge`

‏אפשר לגלות ש־Feature מנבא תנועה — אבל לא מספיק מהר לסגנון שלך.

‏זה עדיין ידע שימושי, אבל לא בהכרח Feature לרובוט הנוכחי.

---

# ‏195. `Rank #1 RCA`

‏לכל ניסוי חשוב לבדוק במיוחד:

- ‏מתי Treatment החליף את Top-1.
- ‏למה.
- ‏מה קרה מיד אחר כך.
- ‏האם השיפור נמשך עד Fill.

---

# ‏196. `Feature Attribution Snapshot`

‏בעת Decision שומרים:

```text
feature_values
sub_scores
weights
final_score
rank
```

‏גם ל־Control וגם ל־Treatment.

---

# ‏197. Explainability למחקר

‏אנחנו רוצים לדעת:

> ‏איזה Feature גרם לגרסה החדשה לבחור BBB במקום AAA?

---

# ‏198. `Decision Diff`

‏דוח שימושי:

```text
Control selected AAA
Treatment selected BBB

Main score deltas:
activity +12
momentum -2
liquidity +4
```

---

# ‏199. Decision Diff חוסך שעות RCA

‏במקום להסתכל על אלפי מספרים ידנית.

---

# ‏200. `Experiment Unit Tests`

‏גם מחקר צריך בדיקות.

‏לדוגמה:

- ‏Control באמת זהה ל־Baseline.
- ‏Treatment משנה רק מה שתוכנן.
- ‏Dataset זהה.
- ‏Costs זהים.
- ‏Timestamps זהים.

---

# ‏201. Configuration Diff

‏לפני הרצה מציגים Diff בין Control ל־Treatment.

‏אם מופיעים שינויים לא צפויים — עוצרים.

---

# ‏202. `Hidden Change` הוא אויב

‏שינוי dependency, default או data preprocessing יכול לשנות תוצאה בלי שנשים לב.

---

# ‏203. Environment Lock

‏במחקרים חשובים שומרים גם גרסאות ספריות/Runtime לפי הצורך.

---

# ‏204. `Random Seed`

‏אם יש Randomness, שומרים Seed.

‏ועדיף לבדוק כמה Seeds כשזה רלוונטי.

---

# ‏205. Sample Size

‏מעט מאוד החלטות אינן בסיס טוב למסקנה חזקה.

---

# ‏206. אבל מספר Rows אינו Sample Size אמיתי

‏אם אלפי Rows מגיעים מאותו Episode, הם אינם בהכרח אלפי הזדמנויות עצמאיות.

---

# ‏207. `Independent Opportunities`

‏כדאי לחשוב ברמת:

- ‏Candidate episodes.
- ‏Trade opportunities.
- ‏Distinct days.
- ‏Distinct regimes.

---

# ‏208. Decision Frequency Bias

‏Scanner שמחשב Rank כל 100ms יכול ליצור הרבה Observations כמעט זהים.

‏זה עלול לתת תחושת Sample ענק מזויפת.

---

# ‏209. Episode Aggregation

‏אפשר לאגד רצף של Signals דומים לאותו Candidate Episode לצורכי ניתוח מסוימים.

---

# ‏210. `False Discovery` Risk

‏ככל שמנסים יותר רעיונות, עולה הסיכוי שאחד ייראה טוב במקרה.

---

# ‏211. לכן Registry הוא לא אדמיניסטרציה

‏הוא חלק ממנגנון ההגנה מפני Multiple Testing.

---

# ‏212. `Researcher's Degrees of Freedom`

‏כל בחירה בדיעבד מוסיפה חופש:

- ‏Window.
- ‏Threshold.
- ‏Universe.
- ‏Metric.
- ‏Period.
- ‏Filter.

‏צריך לצמצם ולתעד זאת.

---

# ‏213. Pre-commit to Metrics

‏ככל שהניסוי חשוב יותר, כדאי לכתוב מראש את המדדים והקריטריונים לפני שרואים תוצאה.

---

# ‏214. `Post-hoc Finding`

‏מותר לגלות משהו מעניין בדיעבד.

‏אבל מסמנים אותו כ־Hypothesis חדשה — לא כהוכחה.

---

# ‏215. Discovery creates next experiment

‏אם מצאנו:

> ‏"זה עובד מצוין רק בין 10:00 ל־10:30"

‏זה הופך לניסוי חדש שצריך Validation חדש.

---

# ‏216. לא לשכתב את Hypothesis אחרי התוצאה

‏זו מלכודת אנושית נפוצה.

---

# ‏217. `Research Notes`

‏כדאי לשמור לפני הריצה:

- ‏למה חשבנו שזה יעבוד.
- ‏מה ציפינו לראות.
- ‏מה יפתיע אותנו.

---

# ‏218. Surprise הוא מידע

‏אם Feature שאמור לעזור פוגע דווקא במניות נזילות — זה רמז למחקר נוסף.

---

# ‏219. `RCA by Cluster`

‏אפשר לקבץ Failures לפי:

- ‏wide spread.
- ‏low activity.
- ‏late signal.
- ‏fast reversal.
- ‏rank churn.

---

# ‏220. Cluster-specific Hypothesis

‏מתוך RCA נולד ניסוי חדש.

‏כך משפרים מערכת בצורה מדעית יותר.

---

# ‏221. Feedback Loop נכון

```text
Failure
→ RCA
→ Hypothesis
→ Experiment
→ Validation
→ Decision
```

‏ולא:

```text
Failure
→ tweak random weight
→ rerun
```

---

# ‏222. רז מקצוע: שיפור קטן ויציב עדיף על קפיצה חשודה

‏אם שינוי פשוט פתאום מכפיל תוצאות Backtest, קודם חושדים ב:

- ‏Leakage.
- ‏Bug.
- ‏Data issue.
- ‏Cost omission.

‏רק אחר כך מתלהבים.

---

# ‏223. רז מקצוע: Best Backtest אינו Best Model

‏מודל מעט פחות טוב In-Sample אך יציב יותר OOS יכול להיות עדיף משמעותית.

---

# ‏224. רז מקצוע: אל תתאהב ב־Feature

‏Feature הוא כלי.

‏אם Evidence אומר שהוא מיותר — מסירים אותו.

---

# ‏225. רז מקצוע: אל תנסה להציל כל רעיון

‏אם Feature נכשל, לא חייבים לחפש 40 קומבינציות שיגרמו לו להצליח.

---

# ‏226. רז מקצוע: Negative Knowledge הוא נכס

‏לדעת מה **לא** עובד מצמצם את מרחב החיפוש בעתיד.

---

# ‏227. רז מקצוע: Complexity צריכה לשלם שכירות

‏כל שכבת מורכבות חייבת להצדיק את קיומה במדד אמיתי.

---

# ‏228. רז מקצוע: Trade Frequency יכולה להטעות

‏יותר עסקאות יכולות להעלות Gross PnL אבל להוריד איכות והגדיל Costs.

---

# ‏229. רז מקצוע: אין Metric יחיד שמספר הכול

‏צריך Scorecard מאוזן.

---

# ‏230. Scorecard מומלץ לניסוי

```text
Prediction:
- Top1 forward return
- Rank monotonicity
- Hit rate
- time_to_first_profit
- MFE / MAE

Execution:
- Fill rate
- slippage
- signal_to_fill
- missed opportunity

Economics:
- Net EV
- cost-to-edge
- trade frequency
- tail loss

Robustness:
- OOS
- walk-forward
- regime stability
- parameter sensitivity
```

---

# ‏231. `Experiment Summary` טוב

‏בסוף לא צריך 200 גרפים ללא מסקנה.

‏צריך Summary ברור:

```text
Question
Evidence
Risks
Decision
Next step
```

---

# ‏232. דוגמה לניסוי מלא

‏Hypothesis:

```text
activity acceleration improves very-short-horizon continuation
```

‏Control:

```text
Score v12
```

‏Treatment:

```text
Score v12 + activity_acceleration_5s
```

‏Primary:

```text
Top1 net forward return @ 10s
```

‏Guardrails:

```text
P95 MAE
Fill rate
Trade frequency
Latency
```

‏Validation:

```text
walk-forward + fresh holdout
```

‏Decision:

```text
KEEP / REJECT / REWORK / NEEDS_MORE_DATA
```

---

# ‏233. דוגמה ל־Ablation

```text
A = full model
B = without activity family
C = without liquidity family
D = without acceleration family
```

‏משווים את כל ארבעתן על אותו Dataset ואותו Execution Model.

---

# ‏234. דוגמה ל־Weight Sensitivity

```text
activity_weight = 0.20
activity_weight = 0.30
activity_weight = 0.40
activity_weight = 0.50
```

‏מחפשים אזור יציב — לא את הנקודה היחידה עם Max PnL.

---

# ‏235. דוגמה ל־Threshold Curve

```text
min_score → trade_count → net_ev → p95_mae
```

‏כך רואים את ה־trade-off בין Selectivity לאיכות.

---

# ‏236. דוגמה ל־Changed Winner Table

```text
Time     Control#1   Treatment#1   Control10s   Treatment10s
10:01    AAA         BBB           +0.01%       +0.08%
10:02    CCC         CCC           +0.04%       +0.04%
10:03    DDD         EEE           -0.05%       +0.02%
```

‏זו דרך חזקה להבין אם השינוי באמת שיפר Selection.

---

# ‏237. דוגמה ל־Decision Impact

```text
Total decision timestamps = 100,000
Different Top1            = 8,200
Decision impact rate      = 8.2%
```

‏עכשיו בודקים מה קרה דווקא ב־8.2% האלה.

---

# ‏238. דוגמה ל־Incremental Value

```text
Changed decisions only:
Control median 10s return   = 0.01%
Treatment median 10s return = 0.05%
```

‏זה לעיתים הרבה יותר אינפורמטיבי מהשוואה כללית.

---

# ‏239. דוגמה לשינוי שלא מצדיק את עצמו

‏נניח:

```text
Net EV improvement = tiny
Compute latency     = +40ms
Data dependency     = new paid feed
Operational risk    = higher
```

‏ייתכן שנחליט `REJECT` למרות ש־Backtest השתפר מעט.

---

# ‏240. דוגמה לשינוי שנראה מבטיח אבל צריך עוד נתונים

```text
Strong lift
Only 18 independent episodes
Wide confidence interval
```

‏החלטה:

```text
NEEDS_MORE_DATA
```

---

# ‏241. Baseline מעשי לרובוט שלנו

‏בשלב ראשון, תהליך המחקר יכול להיות פשוט:

```text
1. Freeze current champion
2. Define one hypothesis
3. Change one thing
4. Run same historical periods
5. Compare predictive metrics
6. Compare execution metrics
7. Compare net metrics
8. Run OOS / walk-forward
9. Inspect changed Top1 decisions
10. Decide KEEP / REJECT / REWORK / NEEDS_MORE_DATA
```

---

# ‏242. מה לא צריך לעשות עדיין

‏לא צריך בשלב זה:

- ‏AutoML ענק.
- ‏אלפי Hyperparameters.
- ‏Auto-promote ל־Production.
- ‏מערכת Reinforcement Learning.
- ‏Optimization אינסופי.

‏קודם נבנה תהליך מחקר אמין.

---

# ‏243. Checklist לפני Experiment

- ‏יש Hypothesis ברורה?
- ‏יש Baseline קפוא?
- ‏מוגדר השינוי היחיד?
- ‏מוגדר Primary Metric?
- ‏מוגדרים Guardrails?
- ‏Dataset קבוע?
- ‏Execution Model קבוע?
- ‏Cost Model קבוע?
- ‏יש OOS plan?
- ‏נרשם Experiment ID?

---

# ‏244. Checklist אחרי Experiment

- ‏השיפור קיים גם ב־Median?
- ‏השיפור קיים בכמה תקופות?
- ‏השיפור שורד OOS?
- ‏השיפור שורד Costs?
- ‏השיפור שורד realistic execution?
- ‏אין Tail regression חריג?
- ‏אין Latency regression חריג?
- ‏השיפור אינו תלוי בכמה Symbols?
- ‏ה־Decision impact ברור?
- ‏תועדה החלטה?

---

# ‏245. Checklist לפני Promotion

- ‏`Champion` ו־`Challenger` הושוו על אותם נתונים?
- ‏עבר Walk-Forward?
- ‏עבר Holdout?
- ‏עבר Stress execution?
- ‏עבר Shadow אם נדרש?
- ‏יש Rollback path?
- ‏יש Versioning מלא?
- ‏יש Monitoring למדדים שאמורים להשתפר?

---

# ‏246. מה צריך לזכור בעל פה

1. ‏Baseline קבוע.
2. ‏Hypothesis לפני תוצאה.
3. ‏שינוי אחד בכל פעם ככל האפשר.
4. ‏Incremental Value מעל Baseline.
5. ‏Ablation.
6. ‏OOS / Walk-Forward.
7. ‏Costs ו־Execution זהים בין גרסאות.
8. ‏Robust Plateau עדיף על Magic Number.
9. ‏Changed-decision analysis חשוב במיוחד.
10. ‏`KEEP` רק כשיש Evidence מספיק.

---

# ‏247. משפט הסיכום של הפרק

> ‏**הדרך המקצועית לשפר אלגוריתם אינה “לשחק עם המשקלים עד שה־Backtest נראה טוב”, אלא להפוך כל רעיון לניסוי שניתן להפריך.**

‏אם השינוי באמת טוב, הוא צריך לנצח Baseline, לשרוד בדיקות מחוץ לנתוני הפיתוח, להישאר שימושי אחרי Costs/Execution, ולהוסיף מספיק ערך כדי להצדיק את המורכבות שהוא מכניס.

---

# ‏248. החיבור לשלב הבא

‏עד עכשיו בדקנו אם שינוי עובד בממוצע.

‏אבל השוק אינו מצב אחד קבוע.

‏ייתכן שאותו Score:

```text
מצוין בפתיחה
בינוני באמצע היום
גרוע בזמן volatility קיצונית
```

‏לכן השלב הבא הוא:

> ‏**שלב 25 — `Regime Analysis`: להבין באילו סוגי שוק האסטרטגיה עובדת, באילו היא נחלשת, והאם צריך Filters/Scores/Policies שונים לפי מצב השוק.**
