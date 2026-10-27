# ‏76 — Recommendation Sheet: Continuous Improvement Loop

> ‏מקור לימודי עיקרי: `../76-CONTINUOUS-IMPROVEMENT-LOOP.md`.
>
> ‏מטרת הקובץ: להגדיר לולאת שיפור מבוקרת שמחברת `Daily Review`, ‏`Scanner Diagnostics`, ‏RCA, ‏Feature Retirement, ‏Experiments, ‏Replay, ‏Shadow ו־Champion/Challenger — כך שהמערכת תלמד מהר יותר ממה שהיא צוברת Complexity, בלי להפוך `Continuous Improvement` ל־`Continuous Overfitting`.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture ו־Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי, אינו אישור Production למסחר אמיתי ואינו מניח ששינוי שנראה טוב בחלון קצר מוכיח Edge.

---

## ‏1. Decision

‏השאלה המרכזית היא:

```text
Given new evidence,
what is the smallest falsifiable improvement candidate
that can be tested against a stable baseline,
with predefined guardrails and rejection criteria,
without contaminating the production decision path?
```

‏ברירת המחדל:

```text
Observe
→ Explain
→ Hypothesize
→ Prioritize
→ Experiment
→ Validate OOS
→ Replay / Stress
→ Shadow Challenger
→ Promotion Review
→ Versioned Change
→ Monitor
→ Reassess
```

‏העיקרון המחייב:

```text
Continuous Improvement != Continuous Change
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: להפריד `Production Loop` מ־`Learning Loop`

```text
Production / Decision Loop
Market State
→ Features
→ Rank
→ Veto
→ Decision
→ Execution Simulation / Paper Outcome

Learning Loop
Outcome + Counterfactuals + Diagnostics
→ Evidence
→ Hypothesis
→ Experiment
→ Validation
→ Shadow Challenger
→ Promotion / Rejection
```

‏ה־Decision Loop צריך להיות יציב, versioned ו־deterministic ככל האפשר.

‏ה־Learning Loop רשאי להיות exploratory, אבל אינו משנה את ה־Decision Loop אוטומטית.

### ‏`P0 — Required`: יחידת העבודה היא `Improvement Candidate`

‏כל שינוי מוצע מקבל identity וחוזה מפורש:

```text
ImprovementId
ProblemStatement
ObservedEvidence
Hypothesis
Baseline
ExpectedDecisionImpact
ExpectedEconomicImpact
AffectedComponents
ComplexityCost
KnownRisks
ExperimentPlan
ValidationPlan
PrimaryMetric
GuardrailMetrics
PromotionCriteria
RejectionCriteria
KillCriteria
RollbackPlan
Status
```

‏רעיון שלא ניתן לנסח כך נשאר Observation/Research Note — לא Change.

### ‏`P0 — Required`: ‏`Observation != Hypothesis != Change Request`

```text
Observation
Fill latency p95 increased.

Hypothesis
Queue backlog is causing decision-path delay.

Change Candidate
Modify scheduling policy and test whether latency improves
without reducing freshness or decision quality.
```

‏אין לדלג ישירות מ־Observation לשינוי.

### ‏`P0 — Required`: Hypothesis חייבת להיות falsifiable

‏Hypothesis תקינה מגדירה מראש מה אמור להשתנות ומה יפריך אותה.

‏לדוגמה מחקרית:

```text
Change X should improve PrimaryMetric by at least Δ
on predefined OOS populations,
while Guardrail A and Guardrail B remain within limits.
```

‏טענה כמו `this probably helps` אינה מספיקה.

### ‏`P0 — Required`: אין Improvement ללא Baseline

‏כל ניסוי מושווה ל־baseline קבוע ומזוהה:

```text
Champion
PreviousVersion
SimpleBaseline
AblatedBaseline
NoFeatureBaseline
NoRuleBaseline
```

‏נמדוד `Delta vs Baseline`, לא רק metric מוחלט של Challenger.

### ‏`P0 — Required`: ‏Primary Metric + Guardrails לפני התוצאה

‏לכל Experiment יהיה:

```text
One Primary Metric
+
Explicit Guardrail Metrics
+
Stopping Rule
+
Promotion Rule
+
Rejection Rule
```

‏כך מצמצמים cherry-picking לאחר שרואים תוצאות.

### ‏`P0 — Required`: ‏`RCA before Optimization`

‏כאשר behavior מידרדר:

```text
Drift
→ First Divergence
→ RCA
→ Root-Cause Classification
→ Improvement Candidate
```

‏לא:

```text
Drift
→ Tune Parameters
```

‏לפני שינוי Strategy צריך לשלול Data, Scanner, Execution, Cost, State או Infrastructure defect.

### ‏`P0 — Required`: אין Auto-Promotion / Auto-Tuning כברירת מחדל

‏מותר לאוטומט:

```text
Evidence collection
Metric computation
Anomaly detection
Experiment preparation
Research suggestions
Shadow comparisons
```

‏לא מותר כברירת מחדל:

```text
auto-promote model
auto-change threshold
auto-enable feature
auto-retire safety rule
auto-retrain after weak day
```

‏`Production Config` נשאר immutable per version.

### ‏`P0 — Required`: Critical correctness/safety issues במסלול נפרד

‏Correctness bug, state mismatch, replay non-determinism או critical safety failure אינם ממתינים ל־Research Queue רגיל.

‏הם עוברים:

```text
Contain / Quarantine
→ Minimal safe correction
→ Verification
→ RCA
→ Similar-area review
→ Regression protection
```

‏גם Emergency Change חייב audit, validation מינימלי ו־post-change review.

---

## ‏3. Why

‏מערכת Short-Horizon רגישה במיוחד ל־recency bias, Winner's Curse ו־parameter chasing.

‏כאשר משנים Feature, threshold או rule אחרי יום חלש, נוצרת לולאה:

```text
Noise
→ Story
→ Change
→ New Noise
→ New Story
```

‏לעומת זאת, לולאת שיפור מבוקרת שומרת attribution ו־reproducibility.

‏היא גם מכירה בכך ששיפור יכול להגיע מ:

```text
Prediction
Selection / Ranking
Data Quality
Execution
Costs
Safety
Recovery
Observability
Simplification
```

‏ולא רק מעוד Feature.

---

## ‏4. Use When

‏ה־Loop משמש כאשר יש לפחות אחד מאלה:

- ‏Finding חוזר מ־Daily Review.
- ‏Scanner/feature/execution drift עקבי.
- ‏Incident או near-miss שמצדיק RCA.
- ‏Challenger חדש.
- ‏Feature retirement candidate.
- ‏שינוי חיצוני ב־Data/Broker/API/Fees/Market Structure שמחייב revalidation.
- ‏פער עקבי בין Replay/Shadow assumptions לבין observed behavior.
- ‏Complexity, latency או operational burden שעולים ללא Decision Value ברור.

---

## ‏5. Do Not Use When

‏לא להפוך את ה־Loop לתירוץ לשינוי כאשר:

- ‏יש רק יום אחד חלש ללא correctness failure.
- ‏אין Baseline מזוהה.
- ‏אין Decision/Outcome linkage.
- ‏אין OOS/holdout נקי מספיק.
- ‏ה־primary metric נבחר אחרי צפייה בתוצאות.
- ‏בוצעו כמה changes יחד כך שאין attribution.
- ‏קיימים critical unknowns.
- ‏ה־telemetry חסרה ולכן אי אפשר לדעת מה קרה.

---

## ‏6. Alternatives

### ‏`P1 — Preferred Default`: One Primary Hypothesis at a Time

‏WIP קטן עדיף על backlog גדול של experiments מקבילים.

```text
Ranked Research Queue
→ one primary hypothesis
→ complete experiment
→ close with evidence
→ next hypothesis
```

### ‏`P2 — Useful`: Parallel independent tracks

‏אפשר להריץ במקביל ניסויים שאינם חולקים state/data contamination, למשל:

```text
Data-quality experiment
Execution-simulation experiment
Feature ablation experiment
```

‏רק אם attribution נשמר.

### ‏`P3 — Advanced`: Portfolio of Challengers

‏אפשר להחזיק כמה Challengers ב־Shadow כאשר קיימים budgets ברורים ל־compute, observability ו־analysis.

### ‏`P4 — Specialist`: automated research orchestration

‏Automation יכולה לייצר experiment matrices, sensitivity maps ו־candidate hypotheses, אך Promotion נשאר governance action נפרד.

---

## ‏7. Trade-offs

### ‏מהירות מול אמינות

‏יותר experiments יכולים לייצר יותר apparent winners, אבל גם יותר multiple-testing risk.

### ‏מורכבות מול Incremental Value

‏כל Change משלם:

```text
Code Tax
Test Tax
Latency Tax
Monitoring Tax
Dependency Tax
Failure-Surface Tax
Explainability Tax
```

### ‏Robustness מול Peak Backtest

‏נעדיף plateau יציב על optimum חד שתלוי בנקודת parameter אחת.

### ‏Evidence מול Reversibility

‏Change זול, מבודד וקל rollback יכול להיבדק במסלול קל יותר מ־stateful change שקשה להפוך.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל מ:

- ‏Auto-retuning כל ערב.
- ‏Auto-retraining בגלל weak session.
- ‏Auto-promotion של model/feature/rule.
- ‏שינוי כמה subsystems באותו Experiment.
- ‏Promotion על PnL או metric יחיד.
- ‏Research Queue ללא WIP limit.
- ‏Mega Changes שמערבבים Features, Vetoes, Entry ו־Exit.
- ‏Rule חדש לכל failure נקודתי.
- ‏Holdout שנבדק שוב ושוב עד שהוא הופך ל־training set סמוי.
- ‏Dashboard שמודד commits/promotions במקום learning quality.

---

## ‏9. What to Add Later

### ‏`P2`

- ‏Experiment Registry מלא עם negative results.
- ‏Golden Episodes ו־Golden Failures אוטומטיים.
- ‏Sensitivity maps סביב parameters.
- ‏Change Dependency Graph.
- ‏Research/Complexity budget tracking.

### ‏`P3`

- ‏Champion/Challenger disagreement analysis אוטומטי.
- ‏Shadow evidence aggregation לפי Regime.
- ‏Counterfactual execution simulator משופר.
- ‏Automatic recurrence detector ל־Findings/Incidents.
- ‏Rollback-readiness checks כחלק מ־CI.

### ‏`P4`

- ‏Automated experiment suggestion/ranking.
- ‏Meta-analysis של repeated experiments.
- ‏Adaptive research allocation לפי uncertainty reduction.

---

## ‏10. Required Data / Evidence

‏כל Improvement משמעותי צריך להיות מקושר ל:

```text
DecisionSnapshot
OutcomeSnapshot
CounterfactualSet
ConfigFingerprint
StrategyVersion
FeatureVersion
ModelVersion
DataSchemaVersion
ProviderVersion
ExperimentId
ReplayPointers
```

‏`DecisionSnapshot` צריך לכלול לפחות:

```text
inputs
features
rank / top-k
vetoes
context
latency
versions
```

‏`OutcomeSnapshot` צריך לכלול לפי ה־scope המחקרי:

```text
simulated/paper fills
markouts
MFE / MAE
time-to-target
time-to-flat
cost estimates / observed paper costs
```

‏אם linkage בין Decision ל־Outcome חסר, confidence יורד ולא משלימים נתונים בהשערה.

---

## ‏11. Promotion Criteria

‏Promotion כאן פירושו **Promotion בתוך מסלול המחקר/Shadow/Paper או readiness engineering**, לא אישור למסחר אמיתי.

‏Improvement Candidate זכאי ל־Promotion Review רק כאשר:

```text
Clear Problem Statement
+ Falsifiable Hypothesis
+ Stable Baseline
+ Versioned Experiment
+ OOS Evidence
+ Realistic Replay Evidence
+ Stress / Tail Evidence
+ Guardrails Pass
+ Shadow/Paper Evidence where applicable
+ Known Risks documented
+ Critical Unknowns = 0
+ Rollback Plan ready
+ Reproducibility proven
```

‏בנוסף:

- ‏ה־Decision Impact אינו רק cosmetic.
- ‏השיפור נשמר אחרי costs/latency הרלוונטיים.
- ‏אין regression ב־safety/correctness/readiness.
- ‏ה־Evidence מכסה conditions מגוונים מספיק ל־claim שנעשה.

---

## ‏12. Rejection Criteria

‏Reject/hold כאשר אחד מאלה מתקיים:

- ‏אין Incremental Decision Value מול baseline.
- ‏השיפור קיים רק in-sample.
- ‏Guardrail קריטי נכשל.
- ‏Latency/complexity מוחקים את הערך.
- ‏התוצאה תלויה בנקודת parameter צרה ושבירה.
- ‏ה־Challenger אינו replayable/deterministic מספיק.
- ‏אין realistic counterfactual execution.
- ‏קיימת contamination בין exploration ל־confirmation.
- ‏Regime coverage צר מדי ביחס לטענה.
- ‏Critical unknown נשאר פתוח.
- ‏Rollback אינו אפשרי או state compatibility אינה מובנת.

‏`NO-GO` ו־`KEEP RESEARCHING` הן תוצאות תקינות.

---

## ‏13. Metrics

### ‏Learning Metrics

```text
HypothesesCreated
ExperimentsCompleted
HypothesesRejected
HypothesesSupported
PromotionRate
RejectionRate
LearningPerExperiment
RepeatedIdeaRate
```

### ‏Decision Metrics

```text
DecisionImpactRate
ChampionChallengerDisagreementRate
TopKOverlap
RankCorrelation
NoTradeDecisionDelta
VetoDecisionDelta
```

### ‏Economic / Execution Metrics

```text
NetOutcomeDelta
EdgeRetentionDelta
FillQualityDelta
AdverseSelectionDelta
CostDelta
LatencyPressureDelta
TimeToFlatDelta
```

### ‏Reliability Metrics

```text
ChangeFailureRate
RollbackRate
TimeToDetectRegression
TimeToSafeState
TimeToExplain
UnknownEffectRate
```

### ‏Complexity Metrics

```text
ComputeCostDelta
p95LatencyDelta
p99LatencyDelta
DependencyCountDelta
FailureSurfaceDelta
OperationalBurdenDelta
```

‏אין `Improvement Score` יחיד שמחליף את התמונה הרב־ממדית.

---

## ‏14. Failure Modes

### ‏Recency Bias

‏שינוי על בסיס session אחרון.

### ‏Winner's Curse

‏בחירת הניסוי הטוב ביותר מתוך רבים בלי correction/confirmation.

### ‏Metric Shopping

‏החלפת Primary Metric לאחר צפייה בתוצאות.

### ‏Mega Change

‏מספר שינויים יחד ללא attribution.

### ‏Holdout Erosion

‏Repeated peeking עד שה־holdout מפסיק להיות independent.

### ‏Rule Explosion

‏exception חדש לכל incident במקום mechanism כללי.

### ‏Success Bias

‏promotion בעקבות הצלחה מקרית ללא explanation.

### ‏Telemetry Failure

‏ניסוי שאין עבורו evidence מספיק הוא Failed Experiment, לא “כנראה הצליח”.

### ‏Rollback Debt

‏Change שהמערכת אינה יודעת להפוך בבטחה.

### ‏Knowledge Debt

‏החלטה שלא תועדה חוזרת בעתיד כאילו היא רעיון חדש.

---

## ‏15. User-Specific Application

‏עבור Scanner רחב־שוק עם horizon קצר, ברירת המחדל המחקרית תהיה:

```text
Daily Review
→ Ranked Research Queue
→ One Primary Hypothesis
→ Offline Experiment
→ OOS Validation
→ Deterministic Replay
→ Shadow Challenger
→ Paper Comparison
→ Promotion Review
→ Versioned Research Baseline
→ Monitoring / Reassessment
```

‏הדגש הוא על שינויים שמשפיעים באמת על החלטות ולא על metrics דקורטיביים.

‏במיוחד נעדיף לבדוק לפי הסדר:

```text
Correctness / Data integrity
→ Scanner freshness / fairness
→ Execution realism
→ Cost / Edge retention
→ Ranking / Veto decision value
→ Feature/model complexity
```

‏כך נמנע מצב שבו מוסיפים עוד Signal כאשר הבעיה האמיתית היא stale data, latency או execution mismatch.

---

## ‏16. Confidence

### ‏High Confidence

- ‏הפרדת Learning Loop מ־Decision Loop.
- ‏Predefined baseline/primary metric/guardrails.
- ‏Versioning ו־reproducibility.
- ‏RCA לפני tuning.
- ‏Shadow/Replay לפני Promotion Review.
- ‏שמירת negative results.
- ‏Rollback plan לפני change משמעותי.

### ‏Medium Confidence

- ‏WIP קטן מאוד של Hypotheses יתאים לרובוט האישי יותר ממחקר מקביל רחב.
- ‏Golden Episodes/Failures יתנו ROI גבוה במיוחד ככל שהמערכת מתבגרת.
- ‏Simplification/retirement יתנו לעיתים יותר ערך Feature נוסף.

### ‏Hypotheses to Validate

- ‏איזה cadence של Weekly/Version Review מתאים בפועל לנפח evidence.
- ‏איזה Complexity Ceiling כדאי לקבוע לכל subsystem.
- ‏איזו כמות Shadow evidence מספיקה לכל class של שינוי.
- ‏אילו Regime buckets באמת נחוצים ולא overfit segmentation.

---

## ‏17. Time-Sensitive Facts

‏מקטע זה בעיקרו methodology ו־architecture ולכן רובו אינו תלוי תאריך.

‏עם זאת, Improvement Candidate שנובע משינוי חיצוני חייב לתעד:

```text
ExternalFact
Source
VerifiedAt
ValidFrom
AffectedComponents
RevalidationRequired
```

‏במיוחד עבור:

- ‏Broker/API capabilities.
- ‏Market-data semantics.
- ‏Fees.
- ‏Regulation.
- ‏Exchange behavior.
- ‏Corporate-action handling.

‏אין לקבע Fact חיצוני משתנה בתוך Strategy בלי version/source/date.

---

## ‏18. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Repeated tuning על אותו holdout מקטין את עצמאותו.
- ‏שינוי שאינו versioned/reproducible מקשה לייחס Outcome לגרסה מסוימת.
- ‏Metric improvement יכול להתקיים בלי Decision change.
- ‏Latency/cost regression יכול למחוק predictive improvement.

### ‏Judgment

- ‏ברירת המחדל שלנו היא One Primary Hypothesis at a Time.
- ‏Promotion דורש multi-dimensional evidence, לא metric יחיד.
- ‏Complexity/reversibility משפיעות על Evidence Threshold.
- ‏Improvement דרך simplification חשוב כמו improvement דרך addition.

### ‏Hypothesis

- ‏ה־highest-ROI improvements לרובוט שלנו עשויים להגיע בתחילה מ־data quality, scanner diagnostics ו־execution realism יותר מאשר ממודלים מורכבים יותר.
- ‏WIP קטן יפחית attribution ambiguity וישפר Learning Efficiency.

---

## ‏19. Priority Map

### ‏`P0`

```text
Separate Learning / Decision loops
Improvement Candidate contract
Baseline
Falsifiable hypothesis
Primary metric + guardrails
Promotion / rejection / kill criteria
RCA before optimization
Versioning
No auto-promotion
Critical-unknown NO-GO
Rollback plan
Reproducibility
```

### ‏`P1`

```text
Ranked Research Queue
One Primary Hypothesis
Experiment Registry
OOS / Replay
Shadow Challenger
Decision Impact
Complexity-adjusted evaluation
```

### ‏`P2`

```text
Golden Episodes / Failures
Sensitivity maps
Change dependency graph
Portfolio review
Research budgets
```

### ‏`P3`

```text
Parallel independent challengers
Automated disagreement analysis
Regime-aware evidence aggregation
Rollback readiness automation
```

### ‏`P4`

```text
Automated research suggestion
Meta-analysis across experiments
Adaptive research allocation
```

---

## ‏20. Definition of Done

‏מקטע Continuous Improvement נחשב מיושם היטב רק אם אפשר לענות על:

```text
1. What exact evidence created this improvement candidate?
2. What is the falsifiable hypothesis?
3. What is the baseline?
4. What is the single primary metric?
5. Which guardrails can veto promotion?
6. What OOS / replay / stress evidence exists?
7. Which decisions actually changed?
8. What is the economic and latency delta?
9. What complexity was added or removed?
10. Which known risks and unknowns remain?
11. Can the result be reproduced?
12. Is rollback prepared?
13. Was RCA completed before optimization?
14. Is the change a genuine improvement or merely a different parameterization of noise?
```

‏אם חלק מהתשובות אינן ידועות, ה־status נשאר `RESEARCH / HOLD`, לא Promotion.

---

## ‏סיכום

‏לולאת השיפור המומלצת אינה מערכת שמשנה את עצמה כל הזמן.

‏היא מערכת שמנהלת Evidence באופן קפדני:

```text
Evidence
→ Falsifiable Hypothesis
→ Controlled Experiment
→ Independent Validation
→ Replay / Stress
→ Shadow Comparison
→ Promotion or Rejection
→ Versioned Result
→ Monitoring
→ New Evidence
```

‏המבחן המרכזי הוא לא כמה Changes קידמנו, אלא כמה uncertainty הורדנו וכמה Decision Value אמיתי יצרנו ביחס ל־Complexity שהוספנו.