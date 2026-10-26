# ‏שלב 67 — `Machine Learning for Algo Trading`: מתי ML באמת מוסיף Edge ומתי הוא רק מוסיף Complexity

> ‏מטרת הפרק: ללמוד להשתמש ב־Machine Learning ככלי מחקר והחלטה בעולם Algo — לא כקיצור דרך ל־Alpha. נבין איך להגדיר Targets, לבנות Dataset סיבתי, למנוע Leakage, לבחור Model מתאים, לבצע Validation נכון, לפרש Feature Importance, להתמודד עם Class Imbalance ו־Concept Drift, ולבדוק אם ML באמת מוסיף Decision Value מעבר ל־baseline פשוט.
>
> ‏העיקרון המרכזי: **ML אינו Edge. הוא מנגנון שמנסה למפות Inputs להחלטה או תחזית. הוא מוצדק רק כאשר הוא משפר באופן יציב את ההחלטה הכלכלית נטו, מחוץ למדגם, תחת execution ריאלי, ביחס ל־baseline פשוט וזול יותר.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. איפה ML נכנס בשרשרת

‏במערכת שלנו ML יכול לשבת בכמה נקודות:

```text
Raw Market Data
→ Features
→ Model
→ Prediction / Score / Probability
→ Ranking
→ Veto / Feasibility
→ Execution
→ Outcome
```

‏אבל אפשר גם להשתמש בו ל:

- ‏Feature selection.
- ‏Regime classification.
- ‏Fill probability estimation.
- ‏Adverse-selection estimation.
- ‏Exit timing.
- ‏Anomaly detection.
- ‏Cost estimation.
- ‏Ranking.

‏כל שימוש כזה הוא Problem Definition שונה.

---

# ‏2. קודם מגדירים Problem, רק אחר כך Model

‏לפני בחירת algorithm צריך לנסח:

```text
Input available at time t
→ Target that happens after t
→ Decision that will use the prediction
→ Economic objective
```

‏אם אחד מארבעת אלה אינו ברור, עדיין מוקדם לבחור Model.

---

# ‏3. שלוש משפחות בעיה בסיסיות

## ‏Classification

‏דוגמה:

```text
Will net return exceed threshold within 5 seconds?
```

## ‏Regression

‏דוגמה:

```text
Expected net forward return over 5 seconds
```

## ‏Ranking

‏דוגמה:

```text
Which symbols are most attractive relative to the rest of the current universe?
```

‏לרובוט cross-sectional, Ranking יכול להיות טבעי יותר מ־classification בינארי.

---

# ‏4. Target Design הוא החלק הכי חשוב

‏Target גרוע יוצר Model מצוין לבעיה הלא נכונה.

‏Targets אפשריים:

- ‏Forward return.
- ‏Net forward return.
- ‏Probability of target hit.
- ‏`time_to_first_profit`.
- ‏`time_to_target`.
- ‏MFE.
- ‏MAE.
- ‏Post-target giveback.
- ‏Fill probability.
- ‏Post-fill markout.
- ‏Exit feasibility.

‏Target צריך להיות aligned עם ההחלטה הכלכלית שאנחנו רוצים לשפר.

---

# ‏5. מחיר עתידי לבדו אינו תמיד Target טוב

‏אם המודל מנבא:

```text
Future Last > Current Last
```

‏אבל Spread + Slippage + Fees מוחקים את כל התנועה, התחזית נכונה אך חסרת ערך.

‏לכן כדאי לשקול Targets כמו:

```text
future_executable_exit_price
- realistic_entry_price
- round_trip_costs
```

‏או לפחות למדוד אותם במקביל.

---

# ‏6. Multi-Horizon Targets

‏במקום horizon יחיד:

```text
1s
2s
5s
10s
30s
60s
```

‏אפשר לבחון vector של outcomes.

‏כך ניתן ללמוד גם:

- ‏מהירות ההזדמנות.
- ‏Signal decay.
- ‏Timing של Exit.
- ‏האם edge קצר או מתמשך.

---

# ‏7. Label Leakage

‏Leakage קורה כאשר Feature כולל מידע שלא באמת היה זמין בזמן ההחלטה.

‏דוגמאות:

- ‏Using finalized bar before it closed.
- ‏Corrected trade data שלא היה ידוע בזמן אמת.
- ‏Future universe membership.
- ‏Future normalization statistics.
- ‏Feature calculated using future samples.

‏ML מנצל leakage בצורה אגרסיבית מאוד ולכן הוא מסוכן במיוחד בהקשר הזה.

---

# ‏8. Point-in-Time Dataset

‏לכל sample צריך להיות ברור:

```text
DecisionTime
FeatureCutoff
LabelStart
LabelEnd
```

‏כל Feature חייב להשתמש רק במידע עד `FeatureCutoff`.

---

# ‏9. Purging בין Train ל־Validation

‏אם labels חופפים בזמן, דגימות סמוכות יכולות לחלוק Future Information.

‏לכן ב־time-series ML צריך לעיתים:

- ‏Purge.
- ‏Embargo.
- ‏Non-overlapping evaluation windows.

‏Random Shuffle רגיל עלול להיות שגוי.

---

# ‏10. למה Random Train/Test Split מסוכן

‏Random split מניח IID בקירוב.

‏שוק הוא:

- ‏Temporal.
- ‏Non-stationary.
- ‏Regime-dependent.
- ‏Autocorrelated.

‏לכן ברירת המחדל במחקר Trading היא time-aware validation.

---

# ‏11. Walk-Forward Validation

‏מבנה אפשרי:

```text
Train A → Validate B
Train A+B → Validate C
Train A+B+C → Validate D
```

‏המטרה היא לבדוק האם המודל עובד גם כאשר העתיד באמת מגיע אחרי העבר.

---

# ‏12. Frozen Final Holdout

‏Holdout סופי צריך להישאר לא נגע עד מאוחר.

‏אם משתמשים בו שוב ושוב לקבלת החלטות, הוא מפסיק להיות holdout.

---

# ‏13. Baseline לפני ML

‏לפני מודל מתקדם צריך baseline פשוט:

- ‏Rule-based filters.
- ‏Linear score.
- ‏Logistic Regression.
- ‏Simple tree.

‏אם ML מורכב לא מנצח baseline באופן יציב, אין סיבה להכניס Complexity.

---

# ‏14. למה Logistic Regression חשובה

‏היא:

- ‏מהירה.
- ‏קלה לפרשנות.
- ‏קלה ל־debug.
- ‏נותנת probabilities.
- ‏מהווה baseline חזק.

‏מודל פשוט שמפסיד מעט metric אך יציב יותר יכול להיות עדיף Production-wise.

---

# ‏15. Decision Trees

‏Trees טובים ללמידת thresholds ו־interactions.

‏אבל Tree בודד יכול להיות לא יציב.

‏הוא שימושי במיוחד להבנת structure ראשוני של הבעיה.

---

# ‏16. Random Forest

‏Random Forest מפחית variance של Trees.

‏יתרונות:

- ‏Nonlinear interactions.
- ‏Robust יחסית.
- ‏מעט preprocessing.

‏חסרונות:

- ‏Model גדול יותר.
- ‏Latency גבוהה יותר.
- ‏Interpretability חלקית.
- ‏Probability calibration לא תמיד טובה.

---

# ‏17. Gradient Boosted Trees

‏משפחות כמו:

- ‏XGBoost.
- ‏LightGBM.
- ‏CatBoost.

‏יכולות להיות חזקות מאוד ל־tabular features.

‏אבל הן גם מסוכנות ל־Overfit כאשר:

- ‏Features רבים.
- ‏Samples highly correlated.
- ‏Validation חלש.
- ‏Hyperparameter search רחב מדי.

---

# ‏18. Neural Networks

‏Deep Learning אינו default לבעיה שלנו.

‏הוא עשוי להיות שימושי כאשר יש:

- ‏Raw sequences גדולים.
- ‏Order-book states.
- ‏Complex temporal interactions.
- ‏Large clean dataset.

‏אבל העלות היא:

- ‏Complexity.
- ‏Training cost.
- ‏Interpretability.
- ‏Drift sensitivity.
- ‏Deployment complexity.

---

# ‏19. Sequence Models

‏LSTM/GRU/Temporal CNN/Transformer יכולים ללמוד sequence patterns.

‏אבל לפני שימוש צריך לשאול:

```text
Does explicit engineered state already capture most useful information?
```

‏ב־short horizon, raw sequence models יכולים ללמוד artifacts של feed או batching במקום market behavior.

---

# ‏20. Online Learning

‏Online Learning מעדכן model בזמן אמת או כמעט בזמן אמת.

‏יתרון:

- ‏Adaptation מהירה.

‏סיכון:

- ‏Model corruption.
- ‏Feedback loops.
- ‏Unstable behavior.
- ‏Hard-to-reproduce decisions.

‏לרוב עדיף להתחיל עם retraining מבוקר ולא adaptation רציף.

---

# ‏21. Incremental Retraining

‏אפשר לעדכן מודל בתדירות קבועה:

```text
Daily
Weekly
Monthly
```

‏התדירות צריכה להיקבע לפי measured drift, לא לפי נוחות.

---

# ‏22. Feature Scaling

‏מודלים לינאריים ו־Neural Networks רגישים ל־scale.

‏Trees פחות.

‏אבל scaling חייב להיות Point-in-Time Correct.

‏אסור להשתמש ב־mean/std של כל dataset אם הם כוללים עתיד.

---

# ‏23. Cross-Sectional Scaling

‏אפשר לנרמל Feature יחסית ל־Universe באותו רגע:

```text
z-score
percentile
rank
robust z-score
```

‏זה שימושי ל־Ranking, אבל דורש Fresh Coverage הוגן.

---

# ‏24. Missing Values

‏Missing אינו אפס.

‏צריך להבחין בין:

```text
0
Missing
NotReady
Stale
Unavailable
```

‏המשמעות יכולה להיות predictive בפני עצמה, אך צריך להיזהר מ־provider artifact.

---

# ‏25. Feature Engineering עדיין חשוב ב־ML

‏ML אינו מבטל צורך להבין Market Microstructure.

‏Features טובים יכולים לכלול:

- ‏Multi-horizon returns.
- ‏Velocity/acceleration.
- ‏Trade rate.
- ‏Volume imbalance.
- ‏Spread state.
- ‏Book imbalance.
- ‏Microprice deviation.
- ‏Liquidity depletion.
- ‏Signal age.

---

# ‏26. Raw Features מול Derived Features

‏Raw:

```text
Bid
Ask
Last
Size
Trade count
```

‏Derived:

```text
SpreadBps
Return1s
Return5s
TradeRate
Imbalance
Acceleration
```

‏Derived Features יכולים להקל מאוד על model קטן.

---

# ‏27. Feature Redundancy

‏Features רבים יכולים להיות וריאציות של אותו signal.

‏זה יכול:

- ‏להגדיל overfit.
- ‏להקשות attribution.
- ‏להעלות latency.

‏לכן חשוב לבצע correlation/ablation/importance analysis.

---

# ‏28. Feature Importance אינו אמת סיבתית

‏Feature Importance אומר שהמודל משתמש ב־feature.

‏הוא לא אומר:

- ‏שה־feature סיבתי.
- ‏שהוא יציב.
- ‏שהוא usable live.

---

# ‏29. Permutation Importance

‏מערבבים Feature ורואים כמה performance נפגע.

‏זה נותן אינדיקציה ל־incremental predictive value.

‏אבל Features correlated יכולים להסתיר importance אחד של השני.

---

# ‏30. SHAP

‏SHAP יכול לעזור להבין contribution של Features.

‏אבל:

- ‏הוא diagnostic.
- ‏לא הוכחת causality.
- ‏יכול להיות יקר.
- ‏יכול להטעות עם correlated features.

---

# ‏31. Partial Dependence

‏מנסה להראות איך prediction משתנה עם Feature.

‏אבל אם combinations מסוימים אינם טבעיים בנתונים, הגרף עלול לייצר פרשנות שגויה.

---

# ‏32. Calibration

‏אם Model אומר:

```text
P(success)=0.70
```

‏אז לאורך זמן צריך לבדוק האם אירועים כאלה מצליחים בערך 70% מהזמן.

‏זה נקרא calibration.

---

# ‏33. Probability אינה Confidence מוחלטת

‏Prediction probability היא output של model.

‏היא אינה בהכרח uncertainty epistemic אמיתי.

‏Model יכול להיות confident ושגוי ב־regime חדש.

---

# ‏34. Reliability Curve

‏מחלקים predictions ל־bins:

```text
0.5-0.6
0.6-0.7
0.7-0.8
...
```

‏ומשווים predicted probability ל־actual frequency.

---

# ‏35. Brier Score

‏מודד quality של probability predictions.

‏הוא שימושי כאשר calibration חשוב.

---

# ‏36. ROC-AUC

‏ROC-AUC מודד ranking quality בין classes.

‏אבל הוא יכול להיות מטעה ב־class imbalance חזק.

---

# ‏37. Precision-Recall AUC

‏לעיתים רלוונטי יותר כאשר positive events נדירים.

‏אבל גם הוא metric סטטיסטי — לא metric כלכלי.

---

# ‏38. Accuracy כמעט אף פעם לא מספיקה

‏אם 95% מהדגימות הן `NO TRADE`, model שתמיד חוזה `NO TRADE` יקבל 95% accuracy.

‏אבל הוא חסר ערך.

---

# ‏39. Cost-Sensitive Metrics

‏False Positive ו־False Negative אינם שווים כלכלית.

‏לכן צריך למדוד:

```text
Expected Economic Value
```

‏ולא רק classification metric.

---

# ‏40. Ranking Metrics

‏ל־Scanner חשובים:

- ‏Top-K precision.
- ‏NDCG.
- ‏Rank correlation.
- ‏Top-1 lift.
- ‏Top-5 lift.
- ‏Rank stability.

---

# ‏41. Top-1 הוא Extreme Selection

‏כאשר בוחרים #1 מתוך ~4,000 symbols, אפילו noise קטן יכול לייצר extreme winner.

‏ML חייב להיבדק תחת exact selection process.

---

# ‏42. Winner's Curse ב־ML

‏המועמד עם prediction הכי גבוה נוטה להיות גם זה שבו prediction error הקיצוני ביותר.

‏לכן צריך לבדוק:

```text
Predicted Edge vs Realized Edge by Rank
```

---

# ‏43. Score Compression

‏אם Top-1 ו־Top-2 כמעט זהים, certainty של winner נמוכה.

‏אפשר למדוד:

```text
RankGap = Score1 - Score2
```

‏או normalized version.

---

# ‏44. Rank Stability

‏Candidate שקופץ:

```text
#1 → #20 → #2 → #35
```

‏שונה ממועמד שנשאר Top-3 במשך כמה updates.

‏Stability יכול להיות Feature או Gate.

---

# ‏45. Model Output Age

‏Prediction ישן מאבד ערך.

‏צריך לשמור:

```text
PredictionTime
DecisionTime
PredictionAge
```

---

# ‏46. Feature Freshness per Feature

‏Model prediction יכול להיות חדש אך להישען על Feature ישן.

‏לכן freshness צריך להיבדק גם ברמת Feature.

---

# ‏47. Model Latency

‏Inference latency הוא חלק מה־Signal Half-Life budget.

‏אם model מוסיף 100ms ו־signal חי 300ms, זו עלות משמעותית.

---

# ‏48. Batch Inference מול Streaming Inference

‏Batch יכול להיות יעיל CPU-wise.

‏אבל הוא יכול להוסיף waiting latency וליצור freshness unfairness.

---

# ‏49. Full-Universe ML

‏Inference על אלפי symbols בכל update יכול להיות יקר.

‏פתרון אפשרי:

```text
Fast Filter
→ Candidate Set
→ ML Deep Scoring
```

---

# ‏50. Fast Model / Deep Model

‏אפשר להחזיק:

```text
Fast Model
→ broad universe

Deep Model
→ Top-N candidates
```

‏אבל יש להיזהר שה־Fast Model לא מסנן החוצה opportunities שה־Deep Model היה מזהה.

---

# ‏51. Two-Stage Ranking

‏מבנה אפשרי:

```text
Stage 1: eligibility / basic ranking
Stage 2: expensive ML reranking
```

‏זה נפוץ במערכות ranking גדולות.

---

# ‏52. Veto Engine נשאר נפרד

‏לא כדאי להכניס כל Rule בטיחותי לתוך ML score.

‏למשל:

```text
Halt
Stale Data
Broken Feed
No Exit Liquidity
```

‏צריכים לעיתים להישאר Hard Veto מפורש.

---

# ‏53. ML יכול להציע Soft Penalty

‏לעומת Hard Veto, ML יכול להעריך:

- ‏Toxicity risk.
- ‏Giveback risk.
- ‏Fill risk.
- ‏Adverse-selection probability.

‏ואז לשלב אותם ב־Decision Aggregator.

---

# ‏54. Predictive Model ≠ Execution Model

‏אפשר להפריד:

```text
Price Movement Model
Fill Probability Model
Adverse Selection Model
Exit Feasibility Model
```

‏ואז לחשב Economic Decision.

---

# ‏55. Expected Executable Edge

‏מודל טוב יותר הוא כזה שעוזר להעריך:

```text
ExpectedExecutableEdge
= PredictedMovement
- ExpectedCosts
- ExpectedSlippage
- ExpectedAdverseSelection
- LatencyDecay
```

---

# ‏56. Fill Probability Model

‏Features אפשריים:

- ‏Queue depth.
- ‏Trade rate.
- ‏Distance to touch.
- ‏Order age.
- ‏Cancel rate.
- ‏Spread.
- ‏Short-term flow.

‏זה יכול להיות שימושי במיוחד ל־passive entry.

---

# ‏57. Adverse Selection Model

‏אפשר לנסות לנבא:

```text
Expected post-fill markout
```

‏כך Model יכול להבדיל בין fills “טובים” לבין fills שמגיעים בדיוק לפני תנועה נגדנו.

---

# ‏58. Exit Model

‏Model יכול להעריך:

- ‏Probability edge continues.
- ‏Giveback risk.
- ‏Time-to-target.
- ‏Probability of exit liquidity deterioration.

‏אבל Exit צריך לשמור fail-safe rules עצמאיים.

---

# ‏59. Regime Model

‏במקום לחזות Trade ישירות, Model יכול לסווג:

```text
High Volatility
Low Liquidity
Trending
Choppy
Fast Market
Normal
```

‏ואז לשנות strategy behavior.

---

# ‏60. Regime Labels יכולים להיות Circular

‏אם מגדירים regime לפי future volatility, יש leakage.

‏Regime בזמן decision חייב להיות ניתן לזיהוי בזמן אמת.

---

# ‏61. Class Imbalance

‏אירועים מעניינים יכולים להיות נדירים.

‏פתרונות אפשריים:

- ‏Class weights.
- ‏Resampling.
- ‏Threshold tuning.
- ‏Ranking formulation.

‏אבל resampling חייב לשמור temporal structure.

---

# ‏62. Synthetic Sampling

‏שיטות כמו SMOTE אינן default ל־market time series.

‏הן יכולות לייצר artificial samples שלא מייצגים market state אמיתי.

---

# ‏63. Threshold Tuning

‏Threshold של 0.5 הוא שרירותי בהרבה בעיות.

‏צריך לבחור threshold לפי:

```text
Net Economic Utility
```

‏ולא רק accuracy.

---

# ‏64. NO TRADE כ־Class חוקי

‏Model אינו חייב תמיד לבחור winner.

‏אפשר להגדיר:

```text
TRADE
NO TRADE
```

‏כאשר confidence/economics אינם מספיקים.

---

# ‏65. Abstention

‏Model יכול לומר:

```text
I don't know
```

‏באזורי uncertainty גבוהים.

‏זה יכול להיות יתרון משמעותי.

---

# ‏66. Confidence Gate

‏אפשר לדרוש:

```text
prediction > threshold
AND rank_gap > threshold
AND data_quality == GOOD
AND execution_feasible
```

‏אבל thresholds חייבים Validation.

---

# ‏67. Uncertainty Estimation

‏אפשרויות:

- ‏Ensemble disagreement.
- ‏Bootstrap models.
- ‏Prediction intervals.
- ‏Conformal methods.

‏המטרה היא להבין מתי prediction פחות אמין.

---

# ‏68. Ensemble Models

‏Ensemble יכול להקטין variance.

‏אבל מספר models אינו Evidence לעצמאות.

‏אם כולם לומדים אותו artifact, ensemble לא עוזר.

---

# ‏69. Diversity ב־Ensemble

‏Diversity יכולה להגיע מ:

- ‏Different feature sets.
- ‏Different model families.
- ‏Different windows.
- ‏Different seeds.

‏צריך לבדוק אם היא מוסיפה robustness אמיתי.

---

# ‏70. Model Stacking

‏Stacking משתמש ב־outputs של models אחרים.

‏הסיכון המרכזי הוא leakage אם meta-model רואה predictions שלא נוצרו Out-of-Fold.

---

# ‏71. Hyperparameter Search

‏כל ניסיון נוסף מגדיל Multiple Testing.

‏צריך לתעד:

```text
How many model variants were tested?
```

---

# ‏72. Bayesian Optimization

‏יכול להיות יעיל יותר מ־Grid Search.

‏אבל הוא עדיין יכול overfit validation אם מריצים מספיק ניסויים.

---

# ‏73. Early Stopping

‏עוזר למנוע overfit ב־boosting/NN.

‏אבל Validation set שנבחר לא נכון עדיין יכול להטעות.

---

# ‏74. Regularization

‏L1/L2/Tree depth/min samples וכו׳ שולטים complexity.

‏Regularization טוב אינו תחליף ל־proper validation.

---

# ‏75. Feature Selection

‏אפשר לבחור Features לפי:

- ‏Domain knowledge.
- ‏Ablation.
- ‏Regularization.
- ‏Importance.
- ‏Stability.

‏עדיף Feature set קטן ויציב על מאות Features חלשים.

---

# ‏76. Leakage דרך Feature Selection

‏אם בוחרים Features לפי performance על test set, test כבר אינו test.

---

# ‏77. Label Noise

‏Short-horizon labels רועשים מאוד.

‏רעש יכול להגיע מ:

- ‏Microstructure.
- ‏Spread bounce.
- ‏Feed artifacts.
- ‏Execution uncertainty.

‏Model יכול ללמוד noise אם label אינו מיושר טוב.

---

# ‏78. Robust Targets

‏לפעמים target מבוסס Mid/Microprice/Executable prices יציב יותר מ־Last.

‏אבל צריך לבדוק empirically.

---

# ‏79. Multi-Task Learning

‏Model אחד יכול לנבא יחד:

```text
1s return
5s return
fill probability
adverse selection
```

‏זה מתקדם יותר ודורש הצדקה.

---

# ‏80. Ordinal / Ranking Labels

‏במקום return מדויק, אפשר ללמוד:

```text
Bottom
Middle
Top
```

‏או pairwise preference.

---

# ‏81. Pairwise Ranking

‏Model לומד:

```text
A better than B
```

‏זה יכול להתאים ל־cross-sectional selection.

---

# ‏82. Listwise Ranking

‏Model מתייחס לכל הרשימה יחד.

‏מורכב יותר, אך תואם ישירות ל־Ranking problem.

---

# ‏83. Data Leakage דרך Normalization

‏Normalization parameters חייבים להילמד רק מ־past/train.

---

# ‏84. Entity Leakage

‏אם אותה market episode מופיעה גם Train וגם Test דרך symbols שונים, עדיין יכולה להיות leakage משותפת.

---

# ‏85. Time-of-Day Leakage

‏Model יכול פשוט ללמוד שעות שבהן volatility גבוהה.

‏זה לא בהכרח רע — אבל צריך לדעת שזה מה שהוא עושה.

---

# ‏86. Symbol Identity Leakage

‏Ticker או symbol-specific constants יכולים לגרום למודל לזכור מניות במקום ללמוד behavior כללי.

---

# ‏87. Universe Shift

‏Universe בזמן Live יכול להיות שונה מ־Train.

‏צריך למדוד robustness ל:

- ‏New symbols.
- ‏Delisted symbols.
- ‏Different liquidity mix.

---

# ‏88. Cross-Validation by Time + Symbol

‏לפעמים צריך לבדוק גם generalization בזמן וגם across symbols.

---

# ‏89. Data Volume אינו Sample Size אמיתי

‏מיליוני rows מאותו market burst אינם מיליוני independent observations.

‏Effective Sample Size קטן יותר.

---

# ‏90. Event Clustering

‏דגימות סביב אותו news/event/regime הן correlated.

‏צריך לחשוב episode-wise.

---

# ‏91. Grouped Validation

‏אפשר לקבץ לפי:

- ‏Day.
- ‏Session.
- ‏Event episode.
- ‏Symbol-day.

‏כדי למנוע leakage בין דגימות קרובות מדי.

---

# ‏92. Concept Drift

‏הקשר בין Features ל־Target יכול להשתנות.

‏זה drift עמוק יותר משינוי distribution של Features בלבד.

---

# ‏93. Covariate Drift

‏Feature distribution משתנה, גם אם relationship ל־target אולי נשאר.

---

# ‏94. Label Drift

‏Base rate של outcomes משתנה.

---

# ‏95. Prediction Drift

‏Distribution של model outputs משתנה.

‏זה metric חשוב ל־Live monitoring.

---

# ‏96. Calibration Drift

‏Prediction 0.7 שהיה 70% בעבר יכול להפוך ל־55%.

‏זו בעיה גם אם ranking נשאר סביר.

---

# ‏97. Feature Drift Monitoring

‏אפשר לעקוב אחרי:

- ‏Mean/variance.
- ‏Quantiles.
- ‏PSI.
- ‏KS-like metrics.

‏אבל drift metric לבדו לא אומר שיש business impact.

---

# ‏98. Decision Drift

‏המדד החשוב יותר הוא:

```text
Did the change alter decisions and outcomes?
```

---

# ‏99. Model Versioning

‏כל prediction צריך להיות traceable ל:

```text
ModelVersion
FeatureSchemaVersion
TrainingDatasetVersion
ConfigFingerprint
```

---

# ‏100. Training Dataset Manifest

‏צריך לשמור:

- ‏Date range.
- ‏Universe.
- ‏Data provider/version.
- ‏Feature version.
- ‏Label version.
- ‏Exclusions.

---

# ‏101. Reproducible Training

‏Training run צריך להיות reproducible ככל האפשר:

- ‏Seed.
- ‏Code commit.
- ‏Config.
- ‏Dataset manifest.

---

# ‏102. Determinism אינו תמיד מלא

‏GPU/parallel algorithms יכולים להיות nondeterministic.

‏צריך לדעת איזה variation צפוי.

---

# ‏103. Model Registry

‏Model שעובר ל־Shadow/Live צריך registry עם:

- ‏Version.
- ‏Metrics.
- ‏Training date.
- ‏Approval status.
- ‏Rollback target.

---

# ‏104. Champion / Challenger

‏ה־Champion מפעיל החלטות.

‏Challenger רץ ב־Shadow ומייצר predictions להשוואה.

---

# ‏105. Shadow ML

‏Model חדש צריך לרוץ על live data בלי להשפיע על Trades.

‏כך אפשר לבדוק:

- ‏Latency.
- ‏Drift.
- ‏Calibration.
- ‏Decision difference.

---

# ‏106. Counterfactual Logging

‏שומרים:

```text
What would Challenger have selected?
What happened afterward?
```

‏בלי לבצע Trade אמיתי.

---

# ‏107. Promotion Criteria

‏לפני promotion צריך להגדיר מראש:

- ‏OOS improvement.
- ‏Economic improvement.
- ‏Latency budget.
- ‏No safety regression.
- ‏Shadow stability.

---

# ‏108. Rejection Criteria

‏גם Model שנראה מעניין צריך להידחות אם:

- ‏Improvement קטן מדי.
- ‏Fragile.
- ‏Too expensive.
- ‏Hard to operate.
- ‏Fails stress tests.

---

# ‏109. Rollback

‏כל production model צריך rollback פשוט ל־Champion הקודם.

---

# ‏110. Model Failure Modes

‏כשלי ML כוללים:

- ‏Schema mismatch.
- ‏Feature NaN storm.
- ‏Stale feature cache.
- ‏Model file mismatch.
- ‏Wrong normalization.
- ‏Corrupt model.

---

# ‏111. Safe Failure

‏אם Model unavailable:

```text
NO TRADE
```

‏או fallback פשוט שהוגדר מראש.

‏לא inference אקראי ולא default score מזויף.

---

# ‏112. Fallback Policy

‏Fallback חייב להיות explicit:

```text
Model unavailable
→ disable ML strategy
```

‏או:

```text
Model unavailable
→ use validated baseline
```

---

# ‏113. Model Timeout

‏Inference צריך deadline.

‏Prediction שמגיע מאוחר מדי יכול להיות גרוע מאי־Prediction.

---

# ‏114. Prediction TTL

‏Prediction צריך expire אחרי זמן שמתאים ל־Signal Half-Life.

---

# ‏115. Model Queue Age

‏אם inference queue גדל, prediction age גדל.

‏צריך למדוד queue age ולא רק queue length.

---

# ‏116. Bounded Inference Queue

‏עדיף לדחות stale work מאשר לעבד predictions שכבר לא רלוונטיות.

---

# ‏117. Coalescing

‏אם הגיעו כמה updates לאותו symbol, אפשר לעיתים לשמור רק state העדכני ל־prediction.

‏אבל לא מוחקים truth events הדרושים ל־audit/replay.

---

# ‏118. Hot Path Simplicity

‏Model inference ב־hot path צריך להיות predictable.

‏מורכבות training אינה חייבת להפוך למורכבות runtime.

---

# ‏119. ONNX / Native Runtime

‏אפשר לייצא models ל־runtime יעיל.

‏אבל parity בין training runtime ל־production runtime חייבת להיבדק.

---

# ‏120. Quantization

‏Quantization יכולה להקטין latency/memory.

‏אבל חייבים למדוד אם precision loss משנה Decisions.

---

# ‏121. Feature Serving

‏אחת הבעיות הקשות היא לא model אלא serving עקבי של Features בזמן אמת.

---

# ‏122. Online/Offline Feature Parity

‏אותו Feature צריך לתת אותה משמעות ב־training וב־live.

‏פער קטן יכול למחוק את כל model edge.

---

# ‏123. Training-Serving Skew

‏כאשר pipeline training ו־live שונים, Model מקבל inputs אחרים ממה שעליהם התאמן.

---

# ‏124. Feature Contract

‏לכל Feature:

```text
Name
Unit
Definition
Time semantics
Missing behavior
Freshness rule
Version
```

---

# ‏125. Model Contract

‏לכל Model:

```text
Inputs
Outputs
Expected ranges
Latency budget
TTL
Failure behavior
Version
```

---

# ‏126. Model Explainability בזמן Incident

‏לא תמיד צריך להסביר כל prediction בזמן אמת.

‏אבל צריך מספיק telemetry כדי לבצע RCA אחרי incident.

---

# ‏127. Prediction Journal

‏כדאי לשמור:

- ‏Prediction.
- ‏Top Features / explanation summary כאשר feasible.
- ‏Feature snapshot hash.
- ‏Model version.
- ‏Decision result.

---

# ‏128. Economic Attribution

‏צריך לדעת אם ML הוסיף:

```text
better selection
better timing
better fill quality
lower adverse selection
```

‏ולא רק PnL כולל.

---

# ‏129. Decision Impact Rate

‏שאלה חשובה:

```text
How often did ML change the actual decision compared with baseline?
```

‏אם כמעט אף פעם לא — אולי אין ערך.

---

# ‏130. Marginal Decision Value

‏מודד את התרומה של ML בדיוק במקרים שבהם הוא שינה החלטה.

---

# ‏131. Abstention Value

‏גם החלטה של ML לא לבצע יכולה להיות value.

‏צריך למדוד avoided losses מול missed winners.

---

# ‏132. False Confidence

‏Model יכול להיות מאוד confident דווקא מחוץ ל־training distribution.

‏לכן confidence לבדו אינו safety signal.

---

# ‏133. Out-of-Distribution Detection

‏אפשר לזהות states רחוקים מ־training data.

‏במקרים כאלה אפשר:

```text
NO TRADE
```

‏או להקטין trust.

---

# ‏134. Distance-to-Training-Distribution

‏אפשר למדוד similarity ב־feature space.

‏אבל high-dimensional distance metrics עצמם יכולים להיות לא יציבים.

---

# ‏135. Conformal Prediction

‏Conformal methods יכולים לתת uncertainty sets תחת הנחות מסוימות.

‏זה advanced tool, לא baseline חובה.

---

# ‏136. Model Drift ≠ Strategy Drift

‏Model יכול להיחלש גם אם underlying idea עדיין קיימת.

‏ולהפך.

‏צריך להפריד:

```text
Data drift
Feature drift
Model drift
Execution drift
Strategy drift
```

---

# ‏137. Retraining Trigger

‏Retraining יכול להיות triggered לפי:

- ‏Time.
- ‏Drift.
- ‏Performance degradation.

‏אבל automatic retraining + automatic promotion הוא מסוכן.

---

# ‏138. Human/Rule Approval Gate

‏Model חדש צריך לעבור predefined checks לפני promotion.

---

# ‏139. Continuous Training אינו Continuous Deployment

‏אפשר לאמן אוטומטית בלי לפרוס אוטומטית.

---

# ‏140. Backtest של ML חייב לכלול Training Process

‏אסור לאמן על כל התקופה ואז “לשחק” כאילו model היה קיים בעבר.

‏צריך simulate retraining timeline.

---

# ‏141. Model Vintage

‏בכל זמן היסטורי צריך להשתמש רק ב־model שהיה יכול להיות מאומן עד אותו זמן.

---

# ‏142. Feature Availability Timing

‏Feature calculated at `t+50ms` לא יכול להשפיע על decision at `t+10ms`.

---

# ‏143. Inference Timing in Backtest

‏צריך להוסיף realistic inference latency.

---

# ‏144. Latency Stress Test

‏בודקים:

```text
+10ms
+25ms
+50ms
+100ms
+250ms
```

‏או טווחים שמתאימים ל־system שלנו.

---

# ‏145. Model Complexity Tax

‏Complexity עולה ב:

- ‏Training.
- ‏Deployment.
- ‏Monitoring.
- ‏RCA.
- ‏Recovery.
- ‏Latency.

‏השיפור צריך לכסות את כל העלויות האלה.

---

# ‏146. Simple Model Advantage

‏למפתח אישי יש יתרון אם הוא יכול להבין את המערכת מקצה לקצה.

‏Model פשוט יכול להיות competitive בגלל:

- ‏Faster iteration.
- ‏Lower operational risk.
- ‏Better RCA.
- ‏Lower latency.

---

# ‏147. Low Capacity Advantage

‏מערכת קטנה יכולה לפעול באזורים שבהם capacity נמוכה מדי לגופים גדולים.

‏זו Hypothesis אסטרטגית, לא הבטחה.

---

# ‏148. ML לא מחליף Market Microstructure

‏Model שלא מבין דרך Features את:

- ‏Spread.
- ‏Liquidity.
- ‏Queue.
- ‏Flow.
- ‏Execution.

‏עלול לנבא תנועה שאינה tradable.

---

# ‏149. ML לא מחליף Risk

‏Risk limits, Kill Switches, Hard Vetoes ו־position controls נשארים מחוץ למודל.

---

# ‏150. ML לא מחליף NO TRADE

‏Prediction גבוה אינו authorization למסחר.

---

# ‏151. ML לא מחליף RCA

‏“המודל אמר” אינו explanation מספיק.

‏צריך לדעת איפה השרשרת סטתה.

---

# ‏152. Negative Results חשובים במיוחד

‏אם מודל מתקדם לא מנצח baseline — זה Result חשוב.

‏הוא חוסך Complexity עתידית.

---

# ‏153. Research Ledger ל־ML

‏לכל experiment:

```text
Hypothesis
Dataset
Features
Target
Model
Validation
Primary Metric
Economic Metric
Result
Decision
```

---

# ‏154. Multiple Models = Multiple Testing

‏100 model variants מגדילים chance ל־false winner.

---

# ‏155. Seeds Matter

‏אם result משתנה דרמטית בין random seeds, הוא fragile.

---

# ‏156. Stability Across Seeds

‏Performance distribution across seeds הוא metric בפני עצמו.

---

# ‏157. Stability Across Time

‏Model טוב צריך להיבדק על כמה periods/regimes.

---

# ‏158. Stability Across Symbols

‏אם כל edge מגיע מ־3 tickers, צריך לדעת זאת.

---

# ‏159. Stability Across Liquidity Buckets

‏Performance יכול להיות שונה דרמטית בין liquid/illiquid symbols.

---

# ‏160. Stability Across Volatility

‏Model יכול לעבוד רק ב־high-vol regimes.

‏זה לא רע אם זה ידוע ומנוהל.

---

# ‏161. Model Specialization

‏אפשר model נפרד לפי regime.

‏אבל זה מוסיף complexity ו־sample fragmentation.

---

# ‏162. Mixture of Experts

‏Model routing בין specialists הוא advanced architecture.

‏לא baseline מומלץ בלי Evidence.

---

# ‏163. Transfer Learning

‏יכול לעזור כאשר data מוגבל.

‏אבל domain mismatch יכול להזיק.

---

# ‏164. Self-Supervised Learning

‏יכול ללמוד representations מ־unlabeled market data.

‏זה מתקדם ודורש dataset משמעותי.

---

# ‏165. Representation Learning

‏במקום hand-crafted features, model לומד embedding של market state.

‏שוב — complexity חייבת להיות justified.

---

# ‏166. Clustering

‏Unsupervised clustering יכול לעזור לזהות regimes או market states.

‏אבל clusters אינם בהכרח economically meaningful.

---

# ‏167. Anomaly Detection

‏יכול לשמש לזיהוי:

- ‏Feed anomalies.
- ‏Abnormal volatility.
- ‏Liquidity shocks.

‏לעיתים שימוש בטיחותי כזה בטוח יותר משימוש ישיר ל־Entry.

---

# ‏168. Reinforcement Learning

‏RL נשמע טבעי ל־trading, אבל הוא קשה במיוחד בגלל:

- ‏Non-stationarity.
- ‏Sparse/biased rewards.
- ‏Simulation mismatch.
- ‏Exploration risk.

‏אינו baseline מומלץ לרובוט שלנו.

---

# ‏169. Reward Design ב־RL

‏Reward שגוי יוצר policy שמנצלת simulator artifacts.

‏זו אחת הבעיות הגדולות ב־RL trading.

---

# ‏170. Offline RL

‏גם Offline RL רגיש ל־distribution shift ול־counterfactual uncertainty.

---

# ‏171. Causal ML

‏Causal methods מנסים לענות “מה היה קורה אילו”.

‏ב־trading זה קשה כי פעולה שלנו יכולה להשפיע על execution עצמו.

---

# ‏172. Meta-Labeling

‏Model שני יכול להחליט אם signal ראשוני ראוי לביצוע.

‏זה יכול להשתלב יפה עם:

```text
Rule/Signal Generator
→ ML Meta-Filter
→ Veto/Execution Gate
```

---

# ‏173. Meta-Labeling יכול Overfit

‏אם label תלוי ב־same historical assumptions, אין קסם.

---

# ‏174. Practitioner Secret — Model Selection הוא קטן מה־Problem Definition

‏בפועל, Target, Data, Validation ו־Execution assumptions בדרך כלל חשובים יותר מהבדל בין algorithms מודרניים.

---

# ‏175. Practitioner Secret — Better Features Often Beat Bigger Models

‏Feature שמייצג טוב יותר Market Mechanism יכול להיות שווה יותר מעוד 10 layers.

---

# ‏176. Practitioner Secret — Calibration יכול להיות חשוב יותר מ־AUC

‏כאשר החלטה תלויה ב־threshold כלכלי, probability אמינה יכולה להיות שימושית יותר מ־ranking improvement קטן.

---

# ‏177. Practitioner Secret — Model Age הוא Feature

‏Model שאומן לפני חודשים יכול להתנהג אחרת ב־regime חדש.

‏`ModelAge` ו־training period צריכים להיות traceable.

---

# ‏178. Practitioner Secret — Model Disagreement הוא Signal

‏אם ensemble models מתפצלים מאוד, uncertainty גבוהה.

‏אפשר להשתמש בזה כ־abstention input.

---

# ‏179. Practitioner Secret — Feature Drift בלי Decision Drift יכול להיות Noise

‏לא כל שינוי distribution מצדיק retraining.

‏צריך לחבר drift ל־business impact.

---

# ‏180. Practitioner Secret — Shadow First

‏ML חדש צריך כמעט תמיד להתחיל ב־Shadow מול Champion פשוט.

---

# ‏181. Recommended Baseline לרובוט שלנו — Research Stage

‏Baseline מומלץ למחקר ראשוני:

```text
Hand-engineered causal features
→ simple linear/logistic model
→ gradient-boosted tree as challenger
→ time-aware validation
→ economic evaluation
→ shadow comparison
```

‏זו Recommendation מחקרית, לא Fact ולא הבטחת רווח.

---

# ‏182. Recommended Baseline — Decision Architecture

```text
Fast deterministic filters
→ ML score/rank
→ Negative Evidence Engine
→ Execution Feasibility
→ TRADE / NO TRADE
```

‏ML אינו safety authority.

---

# ‏183. מה לא הייתי עושה בהתחלה

‏לא הייתי מתחיל מ:

- ‏Deep Transformer.
- ‏RL.
- ‏AutoML על מאות Features.
- ‏Continuous online self-training.
- ‏Auto-deploy של retrained models.

‏אלא אם Evidence מראה צורך ברור.

---

# ‏184. מה כן הייתי מודד מהיום הראשון

- ‏Prediction distribution.
- ‏Calibration.
- ‏Rank performance.
- ‏Decision impact.
- ‏Latency.
- ‏Feature freshness.
- ‏Drift.
- ‏Net outcome after costs.

---

# ‏185. Promotion Gate ל־ML

‏ML מתקדם ל־Shadow רק אם:

```text
OOS > baseline
AND economic value > baseline
AND latency acceptable
AND stable across regimes
AND no leakage found
```

---

# ‏186. Promotion Gate ל־Live Influence

‏אחרי Shadow:

```text
Decision delta understood
Calibration acceptable
No operational instability
Execution-aware edge remains
```

‏ורק אז שוקלים השפעה על החלטה אמיתית.

---

# ‏187. ML Failure RCA

‏כאשר Model נכשל, בודקים לפי סדר:

```text
Data
→ Feature generation
→ Model input
→ Prediction
→ Rank
→ Decision gate
→ Execution
→ Outcome
```

‏לא מתחילים ב־“צריך retrain”.

---

# ‏188. שאלת המפתח לכל מודל

```text
What specific decision does this model improve,
compared with the current baseline,
after all costs and operational complexity?
```

‏אם אין תשובה — המודל עדיין אינו מוצדק.

---

# ‏189. Definition of Done ל־ML Experiment

‏ניסוי ML אינו שלם עד שיש:

- ‏Target ברור.
- ‏Feature cutoff ברור.
- ‏Leakage review.
- ‏Baseline.
- ‏Time-aware validation.
- ‏Economic metric.
- ‏Latency estimate.
- ‏Ablation/importance.
- ‏Stability checks.
- ‏Decision impact.
- ‏Promotion/Rejection decision.

---

# ‏190. משפט הסיום

> ‏**ה־Model הטוב ביותר אינו זה שמנצח leaderboard פנימי. הוא זה שמשפר החלטה אמיתית, בזמן אמת, מחוץ למדגם, אחרי עלויות וביצוע — ועדיין פשוט מספיק כדי שנוכל להבין, למדוד, לשחזר ולעצור אותו כשהמציאות משתנה.**

---

# ‏Checklist קצר לפני הכנסת ML לרובוט

- [ ] ‏יש Problem Definition ברור.
- [ ] ‏יש Baseline פשוט.
- [ ] ‏אין Leakage ידוע.
- [ ] ‏Validation מבוסס זמן.
- [ ] ‏Target כלכלי מתאים.
- [ ] ‏Model latency נכנסת לתקציב.
- [ ] ‏Feature freshness נמדדת.
- [ ] ‏Prediction calibration נבדקת.
- [ ] ‏Rank/Top-K performance נבדקים.
- [ ] ‏Decision Impact נמדד.
- [ ] ‏Drift monitoring קיים.
- [ ] ‏Model versioning קיים.
- [ ] ‏Fallback/NO TRADE מוגדר.
- [ ] ‏Challenger רץ ב־Shadow.
- [ ] ‏Promotion criteria הוגדרו מראש.

---

# ‏Know by Heart

1. ‏`ML != Edge`.
2. ‏Target/Data/Validation חשובים לעיתים יותר מה־Algorithm.
3. ‏Random split אינו default ל־market time series.
4. ‏Prediction חייב להיות Point-in-Time Correct.
5. ‏Baseline פשוט הוא חובה.
6. ‏Accuracy אינה Economic Value.
7. ‏Model output חייב לעבור Execution/Veto/Risk gates.
8. ‏Drift הוא expected behavior, לא exception.
9. ‏Shadow לפני Promotion.
10. ‏Complexity חייבת להחזיר ערך מדיד.
