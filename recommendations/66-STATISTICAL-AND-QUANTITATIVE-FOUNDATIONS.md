# ‏66 — Recommendation Sheet: Statistical and Quantitative Foundations

> ‏מקור לימודי עיקרי: `../66-STATISTICAL-AND-QUANTITATIVE-FOUNDATIONS.md`.
>
> ‏מטרת הקובץ: להגדיר את ברירת המחדל הסטטיסטית והכמותית למחקר של מערכת `Short-Horizon Momentum` שלנו, כך שלא נבלבל `Noise`, תלות בין observations, Winner's Curse, Multiple Testing או assumptions לא ריאליות עם `Edge` אמיתי.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו המלצה לבצע מסחר אמיתי ואינו הופך תוצאה סטטיסטית להבטחת רווח.

---

## ‏1. Decision

‏ההחלטה אינה:

```text
Did the experiment produce a good number?
```

‏אלא:

```text
Is the observed effect economically meaningful,
statistically credible,
point-in-time correct,
robust to dependence and search bias,
and likely to survive new data plus realistic execution?
```

‏ה־Baseline:

```text
Define Hypothesis
→ Define Population
→ Define Sample / Unit of Observation
→ Freeze Primary Metric + Baseline
→ Inspect Full Distribution
→ Estimate Effect + Uncertainty
→ Account for Dependence / Overlap
→ Account for Search Space / Selection
→ Validate OOS in Time Order
→ Stress Costs / Latency / Execution
→ Inspect Regimes / Groups
→ Run Null / Ablation Tests
→ Shadow
→ Update Belief
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: כל Experiment מתחיל בהגדרות לפני תוצאה

‏לפני הרצה מתועדת נכתוב לפחות:

```text
Hypothesis
Target Population
Sample Window
Unit of Observation
Prediction Target
Primary Metric
Baseline
Cost Assumptions
Execution Assumptions
Search Space
Stopping Rule
Promotion / Rejection Criteria
```

‏Threshold או metric שנבחרו לאחר inspection נחשבים חלק מה־fitting, לא validation חיצוני.

### ‏`P0 — Required`: ‏`N` אינו `Effective N`

‏ב־Market Data קיימים:

```text
autocorrelation
overlapping labels
same-symbol clustering
same-episode clustering
common market factor
same-regime clustering
```

‏לכן תמיד נשמור גם יחידת עצמאות שימושית:

```text
days
episodes
symbols
groups
regimes
```

‏Raw rows לעולם אינם מוצגים לבדם כעוצמת Evidence.

### ‏`P0 — Required`: התפלגות לפני ממוצע

‏לכל outcome מרכזי נציג לפחות:

```text
N
Mean
Median
P10 / P25 / P50 / P75 / P90
Tail observations
Time range
Regime mix
Gross / Net distinction
```

‏כאשר רלוונטי נוסיף:

```text
MFE
MAE
TimeToTarget
TimeToFirstProfit
TimeToFlat
Slippage distribution
Latency distribution
```

### ‏`P0 — Required`: Statistical Significance אינה Economic Significance

‏Promotion לא תתבסס על `p-value` בלבד.

‏נרצה:

```text
Effect Size
- Realistic Round-Trip Costs
- Latency / Execution Decay
- Uncertainty Buffer
> 0 with useful headroom
```

‏תוצאה זעירה ומובהקת סטטיסטית אך קטנה מהחיכוך הכלכלי היא `REJECT` מבחינת המערכת שלנו.

### ‏`P0 — Required`: Baseline קפוא

‏לכל Challenger יהיה Baseline פשוט, מתועד וקפוא.

‏דוגמאות:

```text
random among eligible candidates
simple multi-horizon momentum
current production/champion logic
```

‏שינוי Baseline אחרי שראינו תוצאה מחייב version חדש.

### ‏`P0 — Required`: OOS לפי סדר זמן

‏לא נשתמש ב־random shuffle כ־default ל־time-series decision data.

‏Preferred validation:

```text
Past → Future
```

‏כאשר labels חופפים נשתמש ב־purging/embargo או separation שקולה המתאימה ל־horizon.

### ‏`P0 — Required`: Holdout מוגן

‏כל inspection שמוביל להחלטת model/threshold משתמש ב־holdout ומחליש את עצמאותו.

‏אם holdout נבדק שוב ושוב:

```text
it becomes validation data
```

‏ולא נשאר final unbiased test.

### ‏`P0 — Required`: Search Space נרשם

‏נשמור לפחות:

```text
features tried
thresholds tried
horizons tried
subgroups tried
model variants tried
metrics inspected
```

‏כך Winner's Curse ו־Multiple Testing אינם נעלמים מהתיעוד.

### ‏`P0 — Required`: ‏`UNKNOWN` נשאר Unknown

‏אם sample קטן, data חסר, bucket דליל או uncertainty גבוהה:

```text
UNKNOWN
```

‏לא יהפוך ל־positive conclusion בגלל point estimate יפה.

---

## ‏3. Why

‏המערכת שלנו מחפשת winner מתוך universe רחב מאוד ובכמה horizons.

‏זה מגדיל במיוחד את הסיכון ל־:

```text
Multiple Testing
Ranking Winner's Curse
Extreme-Value Selection
Overlapping Labels
Clustered Outcomes
Post-Selection Bias
Data Snooping
```

‏לכן שכבת הסטטיסטיקה אינה קישוט אקדמי; היא control נגד `false edge`.

---

## ‏4. Unit of Observation

‏ברירת המחדל היא לא להניח ש־row הוא sample עצמאי.

‏נגדיר לכל מחקר מהי היחידה:

```text
Decision Snapshot
Candidate Episode
Entry Attempt
Fill
Round Trip
Day
```

‏למחקר Scanner עדיף לעיתים `Decision Snapshot` או `Candidate Episode`, בעוד למחקר Execution ייתכן `Order Intent` או `Fill Episode`.

---

## ‏5. Effective Sample Size

‏נציג:

```text
Raw N
Episode N
Day N
Symbol N
Regime N
```

‏כאשר אפשר נוסיף uncertainty estimate שמכבד clustering, למשל block/day/episode resampling.

‏המספר המדויק של `Effective N` יכול להיות model-dependent; העיקר הוא לא להציג Raw N כעצמאות מלאה.

---

## ‏6. Distribution-First Research

‏לפני threshold optimization נבדוק shape:

```text
histogram
empirical CDF
quantiles
skew
tail frequency
conditional distributions
```

‏נעדיף empirical distribution על Normality assumption לא מוצדקת.

---

## ‏7. Mean / Median / Tails

‏Mean שימושי ל־EV אך יכול להיות נשלט בידי מספר outliers.

‏לכן conclusion רציני דורש לפחות:

```text
Mean + Median + Quantiles + Tail inspection
```

‏במיוחד ב־short horizon שבו rare jumps יכולים להזיז average.

---

## ‏8. Expected Value

‏Metric מרכזי למחקר כלכלי:

```text
Expected Net Outcome
```

‏לא:

```text
Hit Rate alone
```

‏Hit Rate גבוה יכול להיות שלילי אם losses גדולים או costs גבוהים.

---

## ‏9. Conditional Expectation

‏השאלה המועדפת היא:

```text
E[NetOutcome | CurrentConditions]
```

‏ולא average גלובלי בלבד.

‏נבדוק conditioning לפי משתנים בעלי מנגנון סביר, למשל:

```text
momentum state
activity
spread
liquidity
regime
time of day
rank bucket
veto state
```

‏אבל מספר ה־conditions יישאר מוגבל כדי לא להפוך binning ל־search engine ל־Noise.

---

## ‏10. Base Rate

‏כל Signal חייב להיבדק מול baseline comparable.

‏נרצה לדעת:

```text
Outcome with signal
vs
Outcome without signal / simple baseline
```

‏שיפור של 60% מול base rate של 59% אינו שקול ל־60% מול 50%.

---

## ‏11. Precision / Recall / Decision Cost

‏במערכת שבה `NO_TRADE` חוקי, `Precision` של candidates יכול להיות חשוב יותר מ־Recall.

‏אבל נמדוד economics:

```text
False Positive Cost
False Negative Opportunity Cost
Net Decision Value
```

‏ל־Veto Engine במיוחד נרצה false-veto rate ומחיר missed opportunities.

---

## ‏12. Correlation Policy

‏`Correlation` הוא diagnostic, לא proof.

‏נשתמש ב־:

```text
Pearson
Spearman
conditional / subgroup relationships
```

‏לפי השאלה.

‏Correlation גבוהה בין features היא סימן לבדוק redundancy; correlation נמוכה אינה הוכחה לעצמאות או לערך אינקרמנטלי.

---

## ‏13. Incremental Information

‏הבדיקה המועדפת:

```text
Does feature X improve the decision
beyond the current baseline feature set?
```

‏כלומר:

```text
Full Model
vs
Ablation without X
```

‏ולא standalone correlation בלבד.

---

## ‏14. Non-Linearity and Interactions

‏נבדוק response curves ו־reasonable 2D slices כאשר mechanism מצדיק זאת.

‏לדוגמה:

```text
MomentumBucket × LiquidityBucket
```

‏אך cell עם sample קטן יסומן במפורש ולא יקבל סמכות זהה ל־cell עשיר ב־Evidence.

---

## ‏15. Statistical vs Economic Significance

‏לכל improvement נפריד:

```text
Is it statistically distinguishable?
Is it economically material?
Is it executable?
```

‏Promotion דורש את שלושת הרבדים במידה המתאימה לשלב.

---

## ‏16. Uncertainty

‏Point estimate יוצג עם uncertainty כאשר אפשר.

‏Preferred representations:

```text
confidence / uncertainty interval
bootstrap distribution
block-bootstrap distribution
sample-size warning
sensitivity envelope
```

‏לא נציג interval כאילו הוא certainty guarantee.

---

## ‏17. Multiple Testing and Winner's Curse

‏ככל ש־candidate נבחר מתוך search space גדול יותר, נדרוש יותר Evidence חיצוני.

‏במיוחד:

```text
best feature among many
best threshold among many
best horizon among many
Rank #1 among thousands of symbols
```

‏ה־winner observed צפוי להיות biased upward.

---

## ‏18. Ranking Winner's Curse

‏ב־4k-symbol scanner, maximum noisy score יהיה קיצוני גם בלי Edge חזק.

‏לכן Rank #1 חייב להיבדק מול:

```text
Top-2 / Top-3 / Top-5
rank gap
rank persistence
eligible-universe baseline
counterfactual outcomes
```

‏`Rank #1` לבדו אינו Evidence.

---

## ‏19. Top-K and Lift

‏נמדוד:

```text
Top1
Top3
Top5
Top10
```

‏וכן lift מול baseline.

‏אם Top1 אינו טוב יותר באופן יציב מה־Top-K הרחב, ranking precision דורשת שיפור.

---

## ‏20. Horizon Curve

‏במקום לבחור horizon יחיד לאחר inspection:

```text
Expected Outcome vs Horizon
```

‏נציג curve שיכולה לחשוף:

```text
onset
peak
decay
reversal
```

‏כך `Signal Half-Life` הופך תוצאה מדידה ולא assumption.

---

## ‏21. Time-to-Event

‏עבור רובוט קצר נמדוד גם זמן:

```text
TimeToFirstProfit
TimeToTarget
TimeToStop
TimeToFlat
```

‏Outcome טוב שמגיע אחרי שה־signal/order TTL כבר פג אינו actionable edge.

---

## ‏22. Overlapping Labels

‏Forward labels סמוכים כגון 5s return בכל 100ms חולקים כמעט את אותו future path.

‏לכן:

- ‏לא נספור אותם כעצמאיים.
- ‏validation יכבד חפיפה.
- ‏resampling ייעשה ב־blocks/episodes כאשר מתאים.

---

## ‏23. Null Models

‏לכל Strategy/Feature Candidate יהיה Null/Baseline פשוט.

‏בנוסף נשתמש לפי הצורך ב־:

```text
permutation test
time-shift test
label shuffle canary
naive rank baseline
```

‏אם pipeline “מוצא Edge” גם אחרי שבירת הקשר הסיבתי, עוצרים ועושים RCA.

---

## ‏24. Train / Validation / Test

‏נשתמש בהפרדה סמנטית:

```text
Train      = fit/discover
Validation = choose/tune
Test       = final untouched evaluation
```

‏אם Test משמש לבחירה, הוא מפסיק להיות Test.

---

## ‏25. Walk-Forward

‏Preferred baseline ל־time series:

```text
fit on past
validate on later period
roll forward
```

‏נשמור versioned windows כדי שניתן יהיה לשחזר כל conclusion.

---

## ‏26. Regime and Non-Stationarity

‏לא נניח relationship קבוע לנצח.

‏נבדוק:

```text
effect by calendar period
effect by volatility regime
effect by liquidity regime
effect by time of day
```

‏אבל regime taxonomy תוגדר מראש ככל האפשר ותישאר קטנה מספיק למנוע sparse-cell mining.

---

## ‏27. Distribution Shift

‏ב־Shadow/Production נפריד לפחות:

```text
Input / Covariate Shift
Conditional Outcome / Concept Drift
Execution Shift
Cost Shift
Regime-Mix Shift
```

‏כך drift אינו metric יחיד ולא PnL alert מאוחר.

---

## ‏28. Missing Data

‏`Missing != 0`.

‏ב־realtime default state יהיה:

```text
NOT_READY
UNKNOWN
DEGRADED
```

‏לפי המשמעות.

‏לא נבצע imputation אגרסיבי שממציא market state שלא נצפה.

---

## ‏29. Outliers

‏Outlier יסווג קודם כ־:

```text
Bad Data
Real Market Event
Rare Regime
Unknown
```

‏רק אחר כך נחליט אם להסיר/להגביל/לשמור.

‏הסרה אוטומטית של tails עלולה למחוק בדיוק את הסיכון או ה־Edge שאנו צריכים להבין.

---

## ‏30. Normalization

‏כל normalization יהיה `point-in-time correct`.

‏נשווה לפי הצורך:

```text
raw return
bps move
rank / percentile
volatility-normalized move
spread-normalized move
robust z-score
```

‏ונבדוק אם normalization משפרת decision economics, לא רק chart aesthetics.

---

## ‏31. Ratio Guards

‏לכל ratio נבדוק denominator risk.

‏לדוגמה:

```text
momentum / spread
```

‏דורש guard כאשר spread קטן/לא אמין/לא קוהרנטי.

---

## ‏32. Cost Distribution

‏Costs אינם constant.

‏נמדוד לפחות:

```text
SpreadCost distribution
Slippage distribution
Fees
Impact when material
AdverseSelection / markout
```

‏ועדיף conditional costs:

```text
E[Cost | SignalState, LiquidityState, Regime]
```

---

## ‏33. Latency Distribution

‏נציג לפחות:

```text
P50
P95
P99
```

‏למסלולים מרכזיים.

‏אם latency מחמירה דווקא ב־bursts, backtest/replay צריכים לשמר את coupling הזה ולא לדגום delay עצמאי אקראי.

---

## ‏34. Statistical Power

‏לפני Experiment יקר ננסה להעריך:

```text
What effect size can this sample realistically detect?
```

‏מחקר שאין לו power להבחין ב־effect בעל משמעות כלכלית לא יקבל conclusion חזק רק משום שלא נמצא difference.

---

## ‏35. Minimum Detectable Effect

‏ה־MDE יושווה ל־minimum economically relevant effect.

‏אם:

```text
MDE >> useful edge size
```

‏ה־experiment אינו מספיק רגיש לשאלה העסקית.

---

## ‏36. Sequential Peeking

‏לא נעצור experiment רק ברגע שהתוצאה נעשתה יפה.

‏ברירת המחדל:

```text
predefined stopping rule
```

‏או method שמיועד במפורש ל־sequential analysis.

---

## ‏37. Curves Over Points

‏נעדיף לעיתים:

```text
Edge vs Horizon
Edge vs Score
Edge vs Spread
Edge vs Latency
Edge vs Size
```

‏על פני optimum יחיד.

‏Curves חושפות plateau, threshold, decay ו־fragility.

---

## ‏38. Parameter Stability

‏Promotion מעדיף:

```text
broad stable region
```

‏על פני:

```text
single sharp optimum
```

‏Parameter spike הוא warning ל־overfitting.

---

## ‏39. Conditional Performance Tables

‏Research UI מומלץ יציג:

```text
N
Mean / Median
Quantiles
NetAfterCosts
ScoreBucket
SpreadBucket
LiquidityBucket
VolatilityBucket
TimeOfDay
Regime
```

‏כל table תציג גם time range, selection rule ו־cost model.

---

## ‏40. Counterfactual Logging

‏ל־Scanner נשמור Top-N outcomes גם כאשר בפועל candidate יחיד נבחר.

‏כך ניתן לבדוק:

```text
Rank #1 vs #2/#3/#5
winner's curse
rank gap value
ranking counterfactuals
```

‏בלי לבצע עסקאות נוספות.

---

## ‏41. Selection Funnel Statistics

‏נמדוד כל transition:

```text
Universe
→ Eligible
→ Filtered
→ Ranked
→ Vetoed
→ Executable
→ Submitted
→ Filled
→ Closed
```

‏לכל transition נשמור count, reason codes ו־conditional outcomes.

---

## ‏42. Decision Impact

‏לכל Feature/Rule נשאל:

```text
How often did it change the final decision?
Did those changed decisions improve net economic outcome?
```

‏Component שלא משנה החלטה או economics הוא candidate להסרה גם אם correlation שלו מרשימה.

---

## ‏43. Research Dataset Baseline

‏לכל `Decision Snapshot` נרצה, ככל שרלוונטי:

```text
DecisionTime
Symbol
UniverseState
FeatureVector
FeatureVersions
Score
Rank
RankGap
TopN
VetoReasons
DataQuality
Spread
LiquidityState
PredictedEdge
ExecutionFeasibility
ForwardLabels
MFE
MAE
TimeToFirstProfit
TimeToTarget
CounterfactualTopN
Regime
CostModelVersion
```

---

## ‏44. Experiment Report Contract

‏כל Experiment משמעותי יענה על:

```text
Hypothesis
Population
Sample
Unit of Observation
Raw N
Cluster / Episode / Day counts
Baseline
Primary Metric
Effect Size
Uncertainty
Search Space
OOS Method
Cost / Execution Assumptions
Regime Coverage
Null / Ablation Results
Decision Impact
Conclusion
```

---

## ‏45. Observed / Estimated / Assumed / Unknown

‏נפריד ארבע קטגוריות:

```text
OBSERVED
ESTIMATED
ASSUMED
UNKNOWN
```

‏כך coefficient, probability estimate או fill model אינם מוצגים כ־Fact רק משום שהם מספריים.

---

## ‏46. Use When

‏ה־Baseline הזה חל על:

- ‏Feature research.
- ‏Scanner/ranking experiments.
- ‏Veto evaluation.
- ‏Entry/exit rule comparison.
- ‏Execution calibration.
- ‏Cost/slippage research.
- ‏Regime analysis.
- ‏Shadow/Live calibration.
- ‏Model/ML comparison בהמשך.

---

## ‏47. Do Not Use When

‏אין להשתמש ב־statistical machinery כדי “להציל”:

- ‏Data לא נכון.
- ‏Timeline עם leakage.
- ‏Universe survivorship-biased.
- ‏Execution fantasy.
- ‏Unresolved broker/data semantics.

‏Data correctness ו־causal timeline קודמים inference.

---

## ‏48. Alternatives

### ‏Alternative A — Simple Descriptive Research

```text
counts + distributions + baseline + OOS
```

‏יתרון: explainable ועמיד יחסית.

‏חיסרון: מוגבל ב־complex interactions.

‏שימוש: **Preferred Baseline**.

### ‏Alternative B — Classical Statistical Models

```text
linear/logistic regression
regularization
block bootstrap
formal tests
```

‏יתרון: inference ו־interpretability טובים יותר כאשר assumptions סבירות.

‏חיסרון: assumptions יכולים להיות שגויים בשוק.

‏שימוש: `P2/P3` לפי צורך.

### ‏Alternative C — Complex ML / Hierarchical Models

‏יתרון: יכולים ללכוד interactions ו־shared structure.

‏חיסרון: complexity, leakage surface, tuning/search space ו־RCA קשים יותר.

‏שימוש: Challenger מתקדם בלבד לאחר 67 והוכחת incremental value.

---

## ‏49. Trade-offs

| בחירה | יתרון | מחיר |
|---|---|---|
| ‏פחות bins | ‏יותר sample לכל cell | ‏פחות detail |
| ‏יותר bins | ‏יותר context | ‏sparse/noisy cells |
| ‏simple baseline | ‏קל לשחזור/RCA | ‏פחות flexibility |
| ‏complex model | ‏יכול ללכוד nonlinearity | ‏יותר overfitting/search risk |
| ‏aggressive smoothing | ‏curve נקייה יותר | ‏יכול להסתיר discontinuities |
| ‏rank transform | ‏robust ל־outliers | ‏מאבד magnitude |
| ‏raw scale | ‏שומר magnitude | ‏פחות comparable בין symbols |

---

## ‏50. What I Would Avoid Initially

‏לא הייתי מתחיל ב־:

- ‏Hundreds of hypothesis tests בלי registry.
- ‏Random time-series split ללא justification.
- ‏p-value driven feature mining.
- ‏עשרות regime definitions.
- ‏symbol-specific models עם מעט observations.
- ‏annualized Sharpe כמדד יחיד.
- ‏Normality assumption אוטומטית.
- ‏imputation אגרסיבי ל־market-data gaps.
- ‏threshold optimization לפני distribution inspection.
- ‏complex causal claims מנתונים observational בלבד.
- ‏dashboard שמציג point estimates בלי `N` ובלי time range.

---

## ‏51. What to Add Later

‏רק לאחר Baseline ו־Evidence:

- ‏Cluster-aware uncertainty estimates פורמליים יותר.
- ‏Block bootstrap systematic.
- ‏Hierarchical models across symbols/groups.
- ‏Shrinkage estimates.
- ‏Quantile regression.
- ‏Sequential testing methods.
- ‏Formal multiple-testing controls.
- ‏Calibration monitoring/control charts.
- ‏Contextual cost models.
- ‏ML models משלב 67.

---

## ‏52. Required Data / Evidence

‏לפני conclusion רציני נרצה:

```text
point-in-time correct data
historical universe correctness
selection funnel logs
feature/version lineage
forward labels with timing semantics
cost model
latency observations/model
execution outcomes or realistic replay
regime/time-of-day context
counterfactual Top-N outcomes when possible
experiment registry
untouched OOS evidence
```

---

## ‏53. Promotion Criteria

‏Challenger מתקדם רק אם:

- ‏ה־Hypothesis וה־Primary Metric הוגדרו לפני final evaluation.
- ‏ה־effect חיובי כלכלית אחרי costs ו־execution assumptions.
- ‏ה־effect שורד OOS chronologically.
- ‏התוצאה אינה נשלטת על ידי single day/symbol/outlier.
- ‏ה־parameter surface אינה spike יחיד.
- ‏יש Evidence סביר מעבר ל־baseline.
- ‏dependence/overlap קיבלו טיפול מפורש.
- ‏search-space/winner's-curse risk מתועד.
- ‏Ablation/Null tests אינם מצביעים על pipeline artifact.
- ‏Decision Impact אמיתי ומועיל.

---

## ‏54. Rejection Criteria

‏דוחים או מחזירים למחקר אם:

```text
OOS collapse
holdout repeatedly reused
only one narrow parameter works
effect smaller than realistic friction
effect driven by a few outliers
result disappears under reasonable grouping
null/shuffle/time-shift also works
sample too small for useful conclusion
leakage or point-in-time uncertainty
winner selected from huge search space without external validation
result depends on unrealistic independence assumptions
```

---

## ‏55. Metrics

### ‏Primary Economic Metrics

```text
Expected Net Outcome
Net Edge / Headroom
Outcome by Rank Bucket
Lift over Baseline
Decision Impact Value
```

### ‏Distribution Metrics

```text
Mean
Median
Quantiles
MFE / MAE
Tail frequency
Time-to-event distributions
```

### ‏Evidence Metrics

```text
Raw N
Episode N
Day N
Symbol N
Regime coverage
OOS windows
Search-space size
```

### ‏Execution / Reality Metrics

```text
Cost distribution
Latency P50/P95/P99
Fill / No-Fill / Partial-Fill outcomes
Markout
Edge Retention
```

---

## ‏56. Failure Modes

‏ה־Failure Modes המרכזיים:

1. ‏Raw N מוצג כאילו הוא independent N.
2. ‏Overlapping labels מנפחים confidence.
3. ‏Mean מסתיר skew/tails.
4. ‏Correlation מוצגת כ־causation.
5. ‏Multiple Testing יוצר winner מקרי.
6. ‏Test set הופך בפועל ל־Validation.
7. ‏Threshold נבחר אחרי data inspection ומוצג כקבוע מראש.
8. ‏Aggregate מסתיר Simpson's Paradox / regime effect.
9. ‏Missing rows נמחקים למרות שהם `MNAR` בזמן market stress.
10. ‏Cost/latency averages מסתירים deterioration ב־bursts.
11. ‏Top-1 selection bias נשכח.
12. ‏Normalization משתמשת בעתיד.
13. ‏Outliers אמיתיים מוסרים כ־bad data.
14. ‏Statistical significance גוברת בטעות על economic relevance.
15. ‏Complexity גדלה בלי incremental decision value.

---

## ‏57. User-Specific Application

‏לרובוט שלנו נמליץ על workflow שבו ה־Scanner אינו נמדד רק לפי “האם Rank #1 עלה”, אלא לפי:

```text
Top-1 / Top-K lift
+ rank gap value
+ rank persistence
+ conditional net outcome
+ cost / latency survival
+ veto decision value
+ robustness across days/symbols/regimes
+ uncertainty
```

‏ה־research question המרכזית:

> ‏האם selection/ranking שלנו מייצר שיפור כלכלי חוזר מעבר ל־baseline פשוט, לאחר תיקון סביר ל־selection bias, dependence, costs, latency ו־regime variation?

---

## ‏58. Recommended Baseline Research Table

```text
ExperimentId
StrategyVersion
DatasetVersion
TimeRange
RawN
EpisodeN
DayN
SymbolN
RegimeMix
PrimaryMetric
BaselineMetric
EffectSize
Uncertainty
Mean
Median
P10/P90
NetAfterCosts
LatencyEnvelope
OOSResult
NullResult
AblationResult
DecisionImpact
Conclusion
```

---

## ‏59. Recommended Hierarchy

```text
Baseline
→ Descriptive distributions + frozen baseline + chronological OOS

Preferred Default
→ dependence-aware grouping + effect/uncertainty + null/ablation + execution stress

Challenger
→ simple regression/logistic/regularized models

Advanced Option
→ block bootstrap + calibration/drift + richer conditional models

Specialist Option
→ hierarchical/shrinkage/sequential/multiple-testing frameworks

Avoid Unless Evidence
→ large search spaces, sparse slicing, opaque optimization, p-value hunting
```

---

## ‏60. Fact / Judgment / Hypothesis

### ‏Fact / statistical semantics

- ‏Repeated/overlapping observations אינם בהכרח independent.
- ‏Mean לבדו אינו מתאר distribution מלאה.
- ‏p-value אינו ההסתברות ש־`H0` נכונה.
- ‏Repeated use of a holdout weakens its role as unseen evidence.
- ‏Selection of an extreme winner creates upward-selection bias.
- ‏Statistical significance ו־economic significance הן שאלות שונות.

### ‏Judgment

- ‏למערכת שלנו נכון להתחיל descriptive/robust ופשוט לפני models סטטיסטיים מורכבים.
- ‏כל research UI צריך להציג `N`, time range, selection rule ו־cost assumptions.
- ‏OOS chronological + baseline + distributions + decision impact צריכים להיות default לכל Experiment.
- ‏Top-N counterfactual logging הוא בעל ערך גבוה במיוחד ל־Scanner רחב.

### ‏Hypothesis

- ‏חלק משמעותי מה־apparent edge ב־Top-1 עשוי להיות מוסבר ב־winner's curse אם אין validation מתאים.
- ‏Episode/day-level analysis עשוי לתת uncertainty ריאלית יותר מ־row-level counting.
- ‏Conditional cost/latency models עשויים לשנות אילו candidates נראים כלכליים.
- ‏Simple robust features עשויים להכליל טוב יותר מ־fine-tuned alternatives בחלק מה־regimes.

---

## ‏61. Confidence

### ‏High Confidence

‏ב־:

```text
need for chronological OOS
need to distinguish raw N from dependence
need to inspect distributions
need for economic significance after costs
multiple-testing / selection-bias risk
holdout discipline
point-in-time normalization
```

### ‏Medium Confidence

‏ב־Baseline workflow הספציפי של:

```text
descriptive distributions
+ episode/day grouping
+ simple nulls
+ Top-N counterfactuals
+ block-aware uncertainty
```

### ‏Empirical / Must Validate

‏כל מספר ספציפי על:

```text
minimum sample size
effective sample size
required confidence interval
minimum edge headroom
optimal block size
optimal regime buckets
minimum rank gap
minimum effect size
```

---

## ‏62. Time-Sensitive Facts

‏רוב המקטע הוא מתודולוגיה סטטיסטית שאינה תלויה ב־Broker או Regulation.

‏עם זאת, inputs כלכליים שמשפיעים על inference כן יכולים להשתנות:

```text
broker fees
routing behavior
market-data semantics
latency distributions
spread / liquidity regimes
execution capabilities
```

‏לכן cost/execution assumptions חייבים להישען על data/מקורות עדכניים כאשר משתמשים בהם להחלטה תפעולית.

---

## ‏63. Relationship to Earlier Sheets

### ‏22–24 — Validation / Controlled Experiments

‏66 נותן את הבסיס הסטטיסטי למה שהוגדר שם כתהליך validation.

### ‏25 — Regime

‏66 מגדיר כיצד לבדוק conditional performance בלי להפוך regime slicing ל־data mining.

### ‏49 — Quant Research Best Practices

‏49 הוא process discipline; ‏66 הוא toolkit סטטיסטי מפורש יותר.

### ‏60 / 60A — Ranking / Negative Evidence

‏66 מגדיר lift, Top-K, false-positive/false-negative economics ו־decision impact.

### ‏61 — Backtest Subtleties

‏66 מטפל ב־dependence, overlapping labels, holdout exhaustion ו־search-space bias שמסוגלים ליצור backtest confidence מזויף.

### ‏63 — Edge

‏63 דורש falsifiable robust edge; ‏66 מגדיר איך לכמת Evidence ו־uncertainty בלי להפוך point estimate ל־Fact.

### ‏65 — Classic Indicators

‏66 הוא המסגרת שבה indicator challenger צריך להוכיח incremental value.

---

## ‏64. Relationship to 67

‏66 קובע את חוקי המשחק לפני Machine Learning:

```text
clean target
point-in-time features
protected OOS
frozen baseline
search-space awareness
uncertainty
calibration
incremental value
```

‏67 יוכל לבחון ML רק בתוך המסגרת הזו, ולא כדרך לעקוף אותה.

---

## ‏65. Recommendation Summary

‏ברירת המחדל המומלצת היא **Quant workflow פשוט, שקוף וחשדן**:

```text
Define before measuring
→ Count the right unit
→ Show the distribution
→ Compare to a frozen baseline
→ Estimate effect + uncertainty
→ Respect dependence and selection
→ Protect OOS
→ Stress execution economics
→ Inspect regimes without mining
→ Challenge with nulls and ablations
→ Keep only repeatable incremental decision value
```

‏עבור הסורק שלנו, הכלל החשוב ביותר הוא:

> ‏`Rank #1` מתוך אלפי מניות אינו נקודת סיום סטטיסטית; הוא נקודת התחלה חשודה במיוחד שצריכה להוכיח Lift, robustness ו־Net Executable Edge מעבר למה שהיה מתקבל מבחירה רועשת מתוך universe גדול.

‏מקטע 67 ימשיך מכאן ל־`Machine Learning for Algo Trading`.