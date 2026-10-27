# ‏Cross-Cutting 17 — Recommended Learning Loop

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של `Daily Review`, ‏Continuous Improvement, Quant Research, Controlled Experiments, RCA, Feature Retirement, Strategy Versioning, Champion/Challenger, Replay ו־Research Stack ללולאת למידה אחת evidence-driven, reproducible ו־resistant-to-overfitting עבור `Research / Replay / Shadow / Paper` ותכנון Architecture/Governance.
>
> ‏המסמך אינו אישור `Live`, אינו מגדיר מסחר בכסף אמיתי ואינו מאפשר למערכת לשנות Strategy אוטומטית. המטרה היא להפוך Evidence חדש לידע אמין ולשינויים מבוקרים בלבד.

---

## ‏1. Decision

‏`Learning Loop` אצלנו אינה:

```text
Yesterday was bad
→ tweak parameter
→ deploy today
```

‏ואינה:

```text
run many experiments
→ keep the best chart
```

‏אלא:

```text
Runtime / Research Evidence
→ Daily Review / Diagnostics
→ First Divergence / RCA Triage
→ Observation
→ Ranked Research Queue
→ Falsifiable Hypothesis
→ Versioned Improvement Candidate
→ Frozen Baseline / Champion
→ Controlled Experiment
→ OOS / Walk-Forward Validation
→ Deterministic Replay / Stress
→ Shadow Challenger
→ Promotion / Rejection / Retirement Review
→ New StrategyVersion when justified
→ Post-change Monitoring
→ New Evidence
```

‏העקרונות המחייבים:

```text
Continuous Improvement != Continuous Change

Observation != Hypothesis != Change Request

Learning Quality > Change Count

Negative Result = Knowledge

RCA before Optimization
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: להפריד `Decision Loop` מ־`Learning Loop`

```text
Decision Loop
Market State
→ Features
→ Eligibility
→ Rank
→ Veto
→ Decision
→ Simulated / Paper Execution
→ Outcome

Learning Loop
Evidence
→ Attribution / RCA
→ Hypothesis
→ Experiment
→ Validation
→ Challenger
→ Governance Decision
```

‏ה־Decision Loop נשאר versioned, deterministic ויציב בזמן שה־Learning Loop חוקר חלופות.

‏ה־Learning Loop רשאי להציע שינוי; הוא אינו משנה thresholds, Features, Risk, Execution או Config אוטומטית.

### ‏`P0 — Required`: ‏Daily Review הוא Intake, לא Optimizer

‏ה־Daily Review מפיק ארבעה outputs נפרדים:

```text
Operational Summary
Economic Summary
Diagnostic Findings
Research Queue Candidates
```

‏יום יחיד הוא בדרך כלל Evidence חלש למחקר Strategy.

‏חריגים הם defects דטרמיניסטיים או violations קריטיים כגון:

```text
correctness bug
state mismatch
replay non-determinism
critical safety invariant failure
unresolved UNKNOWN_EFFECT
```

‏אלה עוברים למסלול Containment/RCA ולא מחכים ל־sample גדול.

### ‏`P0 — Required`: ‏First Divergence לפני Story

‏לפני שמציעים שיפור נזהה את הגבול הראשון שבו Expected ו־Actual נפרדו:

```text
DATA
→ FEATURE
→ SCANNER
→ ELIGIBILITY
→ RANKING
→ VETO
→ DECISION
→ EXECUTION
→ EXIT
→ COST
→ RISK / SAFETY
→ INFRA / STATE
→ EXTERNAL
→ UNKNOWN
```

‏אם ה־Root Cause הוא Data או Execution defect, לא “מתקנים” אותו בעזרת Feature חדש.

### ‏`P0 — Required`: ‏Research Queue מדורג עם `WIP` קטן

‏כל Candidate למחקר יקבל לפחות:

```text
HypothesisId
Observation
EvidenceRefs
ProblemStatement
WhyItMatters
ExpectedDecisionImpact
RequiredDataset
ProposedTest
Priority
Confidence
FirstSeen
LastSeen
Occurrences
Status
```

‏ברירת המחדל לרובוט האישי:

```text
Ranked Research Queue
→ One Primary Hypothesis
→ close it with evidence
→ then move to the next
```

‏Parallel tracks מותרים רק כאשר attribution ו־resource isolation נשמרים.

### ‏`P0 — Required`: יחידת העבודה היא `Improvement Candidate`

‏כל שינוי משמעותי מקבל identity וחוזה:

```text
ImprovementId
HypothesisId
ProblemStatement
ObservedEvidence
FalsifiableHypothesis
BaselineStrategyVersion
ChallengerStrategyVersion
PrimaryChange
ExpectedDecisionImpact
ExpectedEconomicImpact
AffectedComponents
ComplexityCost
KnownRisks
PrimaryMetric
Guardrails
ExperimentPlan
ValidationPlan
PromotionCriteria
RejectionCriteria
KillCriteria
RollbackPlan
Status
```

‏רעיון שאינו ניתן לניסוח כזה נשאר Observation או Research Note.

### ‏`P0 — Required`: ‏Hypothesis חייבת להיות falsifiable

‏לפני run מכריע נגדיר:

```text
What should improve?
By how much is meaningful?
On which population?
What must not degrade?
What result rejects the idea?
When do we stop testing?
```

‏`This seems better` אינו Hypothesis מחקרית.

### ‏`P0 — Required`: ‏Frozen Baseline + One Primary Change

‏ברירת המחדל:

```text
Frozen Champion
+
One intentional primary diff
=
Attributable Challenger
```

‏אם כמה subsystems משתנים יחד, יש לסמן את השינוי כ־`Treatment Package` ולהוריד Confidence ב־causal attribution.

### ‏`P0 — Required`: ‏Primary Metric + Guardrails נקבעים מראש

‏לכל Experiment משמעותי:

```text
One Primary Metric
+ Guardrail Metrics
+ Minimum Meaningful Improvement
+ Stopping Rule
+ Promotion Rule
+ Rejection Rule
```

‏Metric חדש שנבחר לאחר צפייה בתוצאה אינו מציל את הניסוי; הוא מייצר Hypothesis/Experiment חדש.

### ‏`P0 — Required`: ‏Experiment Registry הוא Source of Truth

‏נשמור גם successes וגם failures:

```text
ExperimentId
Hypothesis
Versions
DatasetId
Evidence Window
Planned Variants
Actual Trials
Primary Metric
Guardrails
Results
Decision
Reason
Limitations
```

‏כך נשמרים:

```text
negative results
trial count
parameter search history
holdout usage
rejected ideas
```

‏ולא חוזרים שוב ושוב לרעיון שכבר נכשל בלי Evidence חדש.

### ‏`P0 — Required`: ‏Point-in-Time + Holdout Discipline

‏כל Evidence מחקרי משמעותי נשען על `As-Known-At` semantics.

‏ברירת המחדל:

```text
Discovery / Train
→ Later Validation
→ Locked Test / Holdout
→ Walk-Forward when material
```

‏אם Holdout השפיע על Feature, threshold, weight, horizon, cost assumption או policy:

```text
USED_FOR_DEVELOPMENT
```

‏ואינו עוד Final Holdout לאותו claim.

### ‏`P0 — Required`: ‏Replay, Backtest ו־Execution Simulation נשארים נפרדים

```text
Backtest / Statistical Analysis
!=
Deterministic Decision Replay
!=
Execution Simulation
```

‏Recorded market evidence הוא Fact.

‏Counterfactual fill או outcome מסומן:

```text
OBSERVED
SIMULATED
ESTIMATED
UNKNOWN
```

‏`UNKNOWN` אינו PASS.

### ‏`P0 — Required`: ‏Champion/Challenger על Comparable Contexts

‏כאשר אפשר:

```text
DecisionEpoch
├─ ChampionDecision
└─ ChallengerDecision
```

‏ה־dataset החשוב ביותר הוא `Disagreement Set`:

```text
Different Candidate
TRADE vs NO_TRADE
Different Veto
Different Timing
Different Execution / Exit behavior
```

‏לכל disagreement נשמור `First Divergence` ונמדוד Incremental Decision Value ולא רק aggregate PnL.

### ‏`P0 — Required`: ‏Relative Improvement + Absolute Floor

‏Challenger אינו promoted רק כי Champion היה חלש יותר.

‏נדרש:

```text
Relative improvement vs Champion
AND
Absolute quality floor
AND
P0 guardrails pass
```

‏Correctness, Safety, Reproducibility או critical readiness failure אינם ניתנים לקיזוז באמצעות metric כלכלי טוב.

### ‏`P0 — Required`: ‏Strategy Versioning מלא

‏`GitCommit != StrategyVersion`.

‏כל Experiment/Decision/Replay/Shadow result חייב להיות traceable לפחות ל־:

```text
StrategyVersionId
RunId
ExperimentId
DatasetId
ResolvedConfigFingerprint
FeatureSetVersion
ModelVersion
VetoPolicyVersion
RiskPolicyVersion
ExecutionPolicyVersion
DataContractVersion
CostModelVersion
```

‏שינוי behavior יוצר Manifest/Version חדש; אין silent mutation.

### ‏`P0 — Required`: ‏Critical defects במסלול נפרד

‏כאשר נמצא correctness/safety defect:

```text
Contain / Quarantine
→ Minimal Safe Correction
→ Verify
→ RCA
→ Similar-Area Review
→ Regression Protection
→ Post-change Review
```

‏אין צורך להמתין ל־Research Queue רגיל, אבל גם Emergency Change אינו פטור מ־audit ו־verification.

### ‏`P1 — Preferred`: ‏Evidence Ladder מפורש

‏Findings יכולים לקבל רמת Evidence:

```text
ANECDOTAL
WEAK
MODERATE
STRONG
REPEATED
```

‏רמת Evidence אינה נקבעת רק לפי raw sample count; נבדוק גם:

```text
EffectiveSampleSize
EpisodeCount
RegimeCoverage
CounterfactualQuality
Reproducibility
Independence from Discovery Data
```

### ‏`P1 — Preferred`: ‏Episode-aware statistics

‏אלפי ticks מאותו burst אינם אלפי ניסויים בלתי תלויים.

‏נגדיר `EpisodeId` לפי event/regime/incident context כאשר רלוונטי ונחשב effective sample size בהתאם.

### ‏`P1 — Preferred`: ‏Complexity Tax הוא Guardrail

‏כל שינוי משלם:

```text
Code Tax
Test Tax
Latency Tax
Monitoring Tax
Dependency Tax
Failure-Surface Tax
Explainability Tax
Operational Tax
```

‏נמדוד:

```text
Incremental Decision Value / Complexity Tax
```

‏שינוי Neutral שחוזר שוב ושוב ב־Disagreement Set הוא Candidate ל־rejection או simplification.

### ‏`P1 — Preferred`: ‏Retirement הוא חלק מהלמידה

‏Learning אינו רק Addition.

‏Feature/Rule/Model יכולים לעבור:

```text
KEEP
WATCH
REDESIGN
REDUCE_SCOPE
MOVE_TO_DEEP_PATH
DEPRECATE
RETIRE
```

‏החלטה תתבסס על `Incremental Decision Value`, ‏Latency, reliability, dependencies, failure surface ו־operational cost.

‏`RETIRE != DELETE` — נשמר Registry/Graveyard עם Evidence, compatibility ו־rollback/resurrection context.

### ‏`P1 — Preferred`: ‏Shadow Retirement / Reverse Shadow

‏לפני retirement משמעותי:

```text
Champion path keeps component
Counterfactual path omits it
```

‏ולאחר retirement אפשר לחשב אותו לזמן מוגבל בלי להשתמש בו, כדי לזהות regression בלתי צפוי.

### ‏`P1 — Preferred`: ‏Post-Promotion Watch

‏Promotion אינו סוף הניסוי.

‏לאחר Version change נמשיך למדוד במיוחד:

```text
PrimaryMetric
Guardrails
Disagreement mechanisms
Latency / Cost deltas
Safety / Reliability
Regime coverage
Unexpected side effects
```

‏אם Evidence משתנה, ה־Version החדשה יכולה לעבור `WATCH`, ‏`SUSPENDED` או Rollback review.

---

## ‏3. Why

‏מערכת Short-Horizon רגישה ל־:

```text
Recency Bias
Winner's Curse
Parameter Chasing
Holdout Erosion
Metric Shopping
Selection Bias
Narrative Drift
Complexity Creep
```

‏בלי Learning Loop מופרד, תוצאה מקרית יכולה להפוך מהר לשינוי Strategy ולייצר לולאה של overfitting.

‏לולאה מבוקרת שומרת על causal attribution:

```text
What changed?
Why did it change decisions?
Did those changed decisions improve net outcomes?
What complexity/risk was added?
Can we reproduce and reverse it?
```

---

## ‏4. Use When

‏ה־Loop מתאים כאשר קיים לפחות אחד מהבאים:

- ‏Finding חוזר מ־Daily Review.
- ‏Drift ב־Data/Scanner/Execution/Costs.
- ‏Incident או near-miss.
- ‏Challenger חדש.
- ‏Feature/Rule retirement candidate.
- ‏פער בין Replay/Simulation assumptions לבין Shadow/Paper observations.
- ‏Complexity או latency שעולים ללא Decision Value ברור.
- ‏שינוי חיצוני ב־Provider/API/Fees/Market Structure שמחייב revalidation.
- ‏Version חדשה שדורשת Post-Promotion Watch.

---

## ‏5. Do Not Use When

‏אין לקדם Change כאשר:

- ‏יש רק Session חלש אחד ללא defect.
- ‏אין Baseline מזוהה.
- ‏אין linkage בין Decision ל־Outcome.
- ‏אין Point-in-Time evidence אמין.
- ‏Primary Metric נבחר אחרי התוצאה.
- ‏כמה changes שולבו בלי attribution.
- ‏Holdout נשחק מרוב peeking.
- ‏critical unknowns פתוחים.
- ‏telemetry/replay חסרים.
- ‏השינוי משפר proxy אך אינו משנה Decisions.
- ‏Complexity עולה בלי Incremental Value ברור.

---

## ‏6. Alternatives

### ‏`P1 — Preferred`: ‏One Primary Hypothesis at a Time

‏הכי מתאים ל־KISS ולמערכת אישית.

### ‏`P2 — Useful`: ‏Parallel Independent Tracks

‏למשל Data-quality ו־Execution-model experiment במקביל, רק כאשר contamination ו־resource coupling נשלטים.

### ‏`P3 — Advanced`: ‏Small Challenger Portfolio

‏מספר קטן של Challengers ב־Shadow עם budgets קשיחים ל־compute, telemetry ו־analysis.

### ‏`P4 — Specialist`: ‏Automated Research Orchestration

‏מערכת יכולה להציע experiments, sensitivity maps ו־hypotheses — אך Promotion נשאר governance action מפורש.

---

## ‏7. Trade-offs

| בחירה | יתרון | מחיר / סיכון |
|---|---|---|
| ‏WIP קטן | attribution חזק | פחות ניסויים במקביל |
| ‏Pre-registration | פחות metric shopping | פחות flexibility תוך כדי run |
| ‏Frozen Champion | comparison נקי | baseline משתנה לאט יותר |
| ‏OOS / Holdout discipline | confidence גבוה יותר | פחות data לפיתוח |
| ‏Shadow comparison | evidence מציאותי יותר | compute/analysis cost |
| ‏Strict versioning | reproducibility | metadata/process overhead |
| ‏Retirement discipline | simplification | compatibility/rollback work |
| ‏Complexity guardrail | מערכת יציבה יותר | רעיון מתוחכם צריך להוכיח יותר ערך |

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏Auto-retuning כל ערב.
- ‏Auto-retraining אחרי Session חלש.
- ‏Auto-promotion של Feature/Model/Rule.
- ‏Research Queue ללא `WIP` limit.
- ‏Mega Change שמשנה Features, Ranking, Entry ו־Exit יחד.
- ‏בחירת winner לפי PnL aggregate בלבד.
- ‏Repeated holdout peeking.
- ‏Rule חדש לכל failure נקודתי.
- ‏Challenger Zoo.
- ‏Auto-retirement לפי importance threshold יחיד.
- ‏מחיקת negative experiments.
- ‏Dashboard שמודד commits/promotions במקום uncertainty reduction.

---

## ‏9. What to Add Later

### ‏`P2`

- ‏Golden Episodes ו־Golden Failures.
- ‏Sensitivity surfaces.
- ‏Change Dependency Graph.
- ‏Research / Complexity budgets.
- ‏Automated recurrence detection.
- ‏Feature/Rule lifecycle registry מלא.

### ‏`P3`

- ‏Automated Champion/Challenger disagreement analysis.
- ‏Regime-aware evidence aggregation.
- ‏Counterfactual execution simulator משופר.
- ‏Rollback-readiness automation.
- ‏Version-aware experiment dashboards.

### ‏`P4`

- ‏Automated experiment suggestion/ranking.
- ‏Meta-analysis across repeated experiments.
- ‏Adaptive research allocation לפי uncertainty reduction.
- ‏Automated revalidation planning מתוך `StrategyDiff`.

---

## ‏10. Required Data / Evidence

‏כל Learning cycle משמעותי צריך להיות מקושר ל־:

```text
Observation / Finding
DecisionSnapshot
OutcomeSnapshot
CounterfactualSet
FirstDivergence
RCA classification
HypothesisId
ImprovementId
ExperimentId
RunIds
DatasetId
StrategyVersions
ConfigFingerprints
ReplayPointers
Shadow/Paper evidence
Promotion / Rejection DecisionRecord
```

‏נשמור גם:

```text
TrialCount
VariantCount
HoldoutUsage
EpisodeCount
EffectiveSampleEstimate
RegimeCoverage
KnownUnknowns
ComplexityDelta
RollbackTarget
```

---

## ‏11. Promotion Criteria

‏Promotion כאן פירושו קידום בתוך `Research / Replay / Shadow / Paper` או שינוי baseline מחקרי/versioned; הוא אינו אישור למסחר אמיתי.

‏Improvement Candidate זכאי ל־Promotion Review רק כאשר קיימים:

```text
Clear Problem Statement
+ Falsifiable Hypothesis
+ Frozen Baseline
+ Exact StrategyVersion identities
+ Point-in-Time dataset
+ Predefined Primary Metric
+ Guardrails
+ OOS / Walk-Forward evidence appropriate to claim
+ Deterministic Replay
+ Stress / Tail evidence
+ Shadow/Paper evidence when applicable
+ Meaningful Decision Impact
+ Net value after relevant costs / latency
+ Complexity justified
+ P0 blockers = 0
+ Critical Unknowns = 0
+ Reproducibility
+ Rollback Plan
```

‏לאחר Promotion נדרש Post-Promotion Watch.

---

## ‏12. Rejection Criteria

‏`REJECT` או `KEEP_RESEARCHING` כאשר:

- ‏אין Incremental Decision Value.
- ‏השיפור קיים רק `in-sample`.
- ‏התוצאה תלויה בנקודת parameter צרה.
- ‏Guardrail קריטי נכשל.
- ‏Latency/Cost/Complexity מוחקים את הערך.
- ‏Counterfactual fidelity חלש מדי.
- ‏Regime coverage צר ביחס ל־claim.
- ‏Experiment contamination התרחשה.
- ‏Reproducibility נכשלת.
- ‏Version identity אינה מלאה.
- ‏Rollback/state compatibility אינם מובנים.
- ‏P0 correctness/safety/readiness regression קיים.

‏תוצאה שלילית נרשמת ב־Registry ולא נמחקת.

---

## ‏13. Metrics

### ‏Learning Quality

```text
HypothesesCreated
ExperimentsCompleted
HypothesesRejected
HypothesesSupported
ResearchQueueAge
ExperimentCycleTime
RepeatedIdeaRate
NegativeResultRetentionRate
LearningPerExperiment
```

### ‏Decision Value

```text
DecisionImpactRate
DisagreementRate
UsefulDisagreementRate
HarmfulDisagreementRate
TopKOverlap
RankCorrelation
NoTradeDecisionDelta
VetoDecisionDelta
```

### ‏Economic / Execution

```text
NetOutcomeDelta
EdgeRetentionDelta
CostDelta
LatencyPressureDelta
FillQualityDelta
AdverseSelectionDelta
TimeToFlatDelta
```

### ‏Robustness

```text
EffectiveSampleSize
EpisodeCount
RegimeCoverage
WorstDecileDelta
TailOutcomeDelta
StressScenarioPassRate
```

### ‏Reliability / Governance

```text
ReproducibilityPassRate
ChangeFailureRate
RollbackRate
TimeToDetectRegression
TimeToExplain
UnknownEffectRate
HoldoutContaminationCount
```

### ‏Complexity

```text
ComputeCostDelta
P95LatencyDelta
P99LatencyDelta
DependencyCountDelta
FailureSurfaceDelta
OperationalBurdenDelta
RetiredComplexity
```

‏אין `Learning Score` יחיד שמחליף את התמונה הרב־ממדית.

---

## ‏14. Failure Modes

### ‏Recency Bias

‏שינוי בעקבות Session אחרון.

### ‏Winner's Curse

‏בחירת ה־best result מתוך חיפוש רחב ללא confirmation עצמאי.

### ‏Metric Shopping

‏החלפת metric אחרי תוצאה.

### ‏Holdout Erosion

‏Repeated peeking עד שה־holdout נהיה training set סמוי.

### ‏Mega Change

‏אין attribution כי כמה mechanisms השתנו יחד.

### ‏Research / Decision Coupling

‏Experiment משנה את ה־Decision path תוך כדי מדידה.

### ‏Challenger Zoo

‏יותר גרסאות ממה שאפשר להבין ולנתח.

### ‏Complexity Creep

‏שינויים קטנים מצטברים ללא retirement.

### ‏Success Bias

‏שומרים רק winners ומאבדים failed experiments.

### ‏Narrative Drift

‏לא ניתן לדעת איזו Version באמת יצרה Result.

### ‏Telemetry Blindness

‏אין Evidence מספיק אך מסיקים מסקנה בכל זאת.

### ‏Rollback Debt

‏Promotion בלי מסלול חזרה אמין.

---

## ‏15. User-Specific Application

‏ל־whole-market short-horizon scanner שלנו, סדר הלמידה המומלץ:

```text
Correctness / Data Integrity
→ Scanner Freshness / Cross-Section Fairness
→ Execution Realism
→ Cost / Edge Retention
→ Ranking / Veto Decision Value
→ Entry / Exit hypotheses
→ Feature / Model sophistication
```

‏כלומר, לפני שמוסיפים Signal נוסף צריך לוודא שהבעיה אינה למעשה stale data, unfair ranking, latency, fill model או cost attribution.

‏ברירת המחדל המחקרית:

```text
Daily Review
→ Ranked Research Queue
→ One Primary Hypothesis
→ Offline Controlled Experiment
→ OOS Validation
→ Deterministic Replay
→ Shadow Challenger
→ Paper Comparison where appropriate
→ Promotion / Rejection Review
→ Versioned Baseline
→ Post-Promotion Watch
```

‏המדד המרכזי אינו “כמה שינויים קידמנו”, אלא:

```text
How much uncertainty did we remove?
How much real Decision Value did we add?
How much Complexity did we pay for it?
```

---

## ‏16. Confidence

### ‏High

- ‏הפרדת `Learning Loop` מ־`Decision Loop`.
- ‏RCA לפני tuning.
- ‏Frozen baseline ו־One Primary Change.
- ‏Primary Metric + Guardrails לפני result.
- ‏Versioning / reproducibility.
- ‏OOS / Replay / Shadow לפני Promotion Review.
- ‏שמירת negative results.
- ‏Retirement/simplification כחלק מהלמידה.
- ‏Rollback plan לפני שינוי משמעותי.

### ‏Medium

- ‏`One Primary Hypothesis at a Time` מתאים במיוחד למערכת אישית קטנה.
- ‏Golden Episodes/Failures יתנו ROI גבוה ככל שהמערכת תתבגר.
- ‏Complexity budget מפורש ישפר discipline.

### ‏Low / Evidence Required

- ‏מספר מדויק של Sessions/episodes הדרוש לכל class של שינוי.
- ‏cadence אידיאלי ל־Weekly/Version Review.
- ‏Regime buckets אופטימליים.
- ‏Automation של experiment prioritization.

---

## ‏17. Time-Sensitive Facts

‏המקטע בעיקרו Methodology ולכן אינו דורש Web verification חדש.

‏כאשר Hypothesis נוצרת משינוי חיצוני, ה־Improvement Candidate חייב לשמור:

```text
ExternalFact
Source
VerifiedAt
ValidFrom
AffectedComponents
RevalidationRequired
```

‏במיוחד עבור:

```text
Broker / API capabilities
Market-data semantics
Fees
Regulation
Exchange behavior
Provider limits
```

‏Fact משתנה אינו נכנס ל־Strategy כקבוע בלתי־מתועד.

---

## ‏18. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Repeated tuning על אותו holdout פוגע בעצמאות שלו.
- ‏שינוי שאינו versioned/reproducible מקשה על causal attribution.
- ‏Metric יכול להשתפר בלי Decision change.
- ‏Counterfactual simulation אינו Fact observed.
- ‏Latency/Cost regression יכול למחוק predictive improvement.

### ‏Judgment

- ‏נעדיף `One Primary Hypothesis at a Time` כברירת מחדל.
- ‏Promotion ידרוש multi-dimensional Evidence, לא metric יחיד.
- ‏Simplification/retirement חשובים כמו Addition.
- ‏Complexity ו־reversibility ישפיעו על Evidence threshold.

### ‏Hypothesis

- ‏בשלבים הראשונים, improvements בעלי ROI גבוה עשויים להגיע יותר מ־Data Quality, Scanner Diagnostics ו־Execution Realism מאשר ממודל מורכב יותר.
- ‏WIP קטן עשוי לשפר Learning Efficiency ולהקטין attribution ambiguity.

---

## ‏19. Priority Map

### ‏`P0`

```text
Separate Decision / Learning loops
Daily Review as evidence intake
First Divergence / RCA
Ranked Research Queue
Improvement Candidate contract
Falsifiable hypothesis
Frozen baseline
One primary change
Primary metric + guardrails
Experiment registry
Point-in-time / holdout discipline
Versioning
Reproducibility
No auto-promotion
Critical unknown NO-GO
Rollback plan
```

### ‏`P1`

```text
One Primary Hypothesis
Episode-aware evidence
OOS / Replay / Stress
Shadow Challenger
Disagreement analysis
Complexity guardrail
Feature / Rule retirement
Post-Promotion Watch
```

### ‏`P2`

```text
Golden Episodes / Failures
Sensitivity surfaces
Change dependency graph
Research budgets
Recurrence detection
```

### ‏`P3`

```text
Small portfolio of independent Challengers
Automated disagreement analysis
Regime-aware evidence aggregation
Rollback readiness automation
```

### ‏`P4`

```text
Automated research suggestion
Meta-analysis
Adaptive research allocation
Automatic validation-scope planning
```

---

## ‏20. Definition of Done

‏Learning Loop נחשב בשל כאשר לכל שינוי משמעותי ניתן לענות:

```text
1. Which exact Evidence created this candidate?
2. Where was the First Divergence?
3. What is the falsifiable Hypothesis?
4. What exact Champion/Baseline is frozen?
5. What is the one primary change?
6. What Primary Metric and Guardrails were defined before the run?
7. What Point-in-Time / OOS evidence exists?
8. Can Replay reproduce the relevant decisions?
9. Where do Champion and Challenger disagree?
10. Did the changed decisions add net value after costs/latency?
11. What Complexity was added or removed?
12. Which critical unknowns remain?
13. Can the result be reproduced from exact versions/data/config?
14. Is rollback prepared?
15. Was the final decision PROMOTE / REJECT / KEEP_RESEARCHING recorded?
16. Are negative results and retirement decisions preserved?
```

‏אם תשובה קריטית חסרה:

```text
RESEARCH / HOLD
```

‏ולא Promotion.

---

## ‏21. Recommendation Summary

‏ה־Learning Loop המומלץ:

```text
Observe
→ Review
→ First Divergence / RCA
→ Rank Research Queue
→ Falsifiable Hypothesis
→ Frozen Champion
→ Controlled Experiment
→ OOS
→ Replay / Stress
→ Shadow Challenger
→ Disagreement Analysis
→ Promote / Reject / Retire
→ Versioned Result
→ Post-Promotion Watch
→ New Evidence
```

‏השורה התחתונה:

```text
Do not optimize for number of changes.
Optimize for uncertainty removed
and incremental decision value
per unit of complexity.
```