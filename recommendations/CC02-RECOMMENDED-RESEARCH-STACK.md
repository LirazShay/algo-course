# ‏Cross-Cutting 02 — Recommended Research Stack

> ‏מטרת המסמך: לסנתז את כל Recommendation Sheets המחקריים ל־Research Stack אחד פשוט, audit-able ו־reproducible עבור מערכת `Short-Horizon Momentum`, כך שכל Observation, Hypothesis, Experiment, Dataset, Result ו־Decision ניתנים לשחזור, השוואה וביקורת.
>
> ‏המסמך מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי, אינו אישור `Live`, ואינו מניח ש־Backtest או Paper result מוכיחים רווחיות עתידית.

---

## ‏1. Decision

‏ה־Research Stack המומלץ אינו:

```text
Notebook
→ Chart
→ Best Result
→ Change Strategy
```

‏אלא:

```text
Observation
→ Hypothesis
→ Experiment Manifest
→ Frozen Baseline
→ Point-in-Time Dataset
→ Controlled Run
→ Validation / OOS
→ Replay / Stress / RCA
→ Immutable Result Artifact
→ Decision Record
→ Research Queue
→ Shadow Challenger when justified
```

‏העיקרון המנחה:

```text
Research must make self-deception harder.
```

‏כל claim משמעותי צריך להיות ניתן למיפוי ל־:

```text
exact hypothesis
+ exact code
+ exact data
+ exact config
+ exact run
+ exact result
+ exact decision
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ארבעה states מחקריים נפרדים

```text
OBSERVATION
HYPOTHESIS
EXPERIMENT
CONCLUSION
```

‏אין לדלג מ־Observation ישירות לשינוי Strategy.

‏ממצא שנראה מעניין ב־Exploration נשאר:

```text
DISCOVERED_NOT_CONFIRMED
```

‏עד שהוא עובר Validation על Evidence שלא שימש לגילוי.

### ‏`P0 — Required`: ‏`Experiment Registry` הוא Source of Truth למחקר

‏לכל Experiment משמעותי יהיה `ExperimentId` יציב וחוזה כגון:

```text
ExperimentId
Status
Hypothesis
Rationale
BaselineStrategyVersion
ChallengerStrategyVersion
CodeCommit
DatasetVersion
UniverseVersion
FeatureSetVersion
ConfigFingerprint
CostModelVersion
ExecutionModelVersion
TrainWindow
ValidationWindow
TestWindow
PrimaryMetric
Guardrails
PlannedVariants
PromotionCriteria
RejectionCriteria
KnownLimitations
CreatedAt
```

‏גם ניסוי שנכשל נשאר ב־Registry.

### ‏`P0 — Required`: ‏Pre-Registration Lite לפני Run מכריע

‏לפני Validation/Confirmation נגדיר מראש לפחות:

```text
Hypothesis
Baseline
One Primary Change where feasible
Primary Metric
Guardrails
Evidence Window
Planned Variants
Acceptance Rule
Rejection Rule
Stopping Rule
```

‏Metric או criterion שמשתנים אחרי צפייה בתוצאה יוצרים Experiment חדש.

### ‏`P0 — Required`: ‏Frozen Baseline

‏Baseline/Champion נשאר קפוא למשך comparison.

```text
Champion = frozen
Challenger = intentional diff
```

‏אם כמה רכיבים משתנים יחד, נסמן זאת כ־`Treatment Package` ונוריד Confidence ב־causal attribution.

### ‏`P0 — Required`: ‏Point-in-Time Data Contract

‏לכל Decision time `T`:

```text
feature_available_time <= T
universe_fact_available_time <= T
normalization_fit_time <= T
joined_event_available_time <= T
```

‏Historical query ברירת המחדל היא semantics של:

```text
latest known at or before T
subject to freshness constraints
```

‏ולא “nearest snapshot”.

### ‏`P0 — Required`: ‏Raw → Canonical → Derived lineage

‏Baseline:

```text
Raw Events
→ Canonical Events / State
→ Feature Snapshots
→ Candidate / Decision Snapshots
→ Future Labels
→ Experiment Dataset
→ Metrics
→ Result Artifact
```

‏`Feature Builder` ו־`Label Builder` מופרדים כך שמידע עתידי אינו יכול לזלוג ל־Feature path.

### ‏`P0 — Required`: ‏Dataset הוא Artifact versioned

‏Dataset identity יכלול לפי הצורך:

```text
DatasetId
SourceProfile
CaptureVersion
SchemaVersion
NormalizationVersion
CorrectionVersion
UniverseVersion
SymbolMappingVersion
CalendarVersion
CorporateActionVersion
CoverageProfile
Checksum
```

‏תיקון Data אינו mutation שקט; הוא יוצר version חדש.

### ‏`P0 — Required`: ‏Chronological Validation

‏ברירת המחדל:

```text
Earlier Past  → Discovery / Train
Later Past    → Validation
Latest Locked → Test / Holdout
```

‏Random shuffle בין עבר ועתיד אינו baseline ל־time-series research.

### ‏`P0 — Required`: ‏Holdout discipline

‏ברגע שתוצאת Holdout גורמת לשינוי ב־:

```text
Feature
Threshold
Weight
Filter
Horizon
Cost assumption
Entry policy
Exit policy
```

‏החלון מסומן:

```text
USED_FOR_DEVELOPMENT
```

‏ואינו עוד Final Holdout ל־claim הבא.

### ‏`P1 — Preferred`: ‏Walk-Forward למחקרים מהותיים

‏לאחר split בסיסי נעדיף גם Evidence לאורך כמה תקופות:

```text
Train A       → Test B
Train A+B     → Test C
Train A+B+C   → Test D
```

‏`Rolling` מול `Expanding` הוא Judgment שתלוי ב־relevance decay ונבדק אמפירית.

### ‏`P0 — Required`: ‏Primary Metric אחד + Guardrails

‏Primary Metric יהיה קרוב לשאלה הכלכלית ולא רק ל־proxy סטטיסטי.

‏במחקר Execution-sensitive נעדיף concept כגון:

```text
Net Executable Outcome
```

‏לצד Guardrails של correctness, tails, latency, costs, coverage ו־operability.

### ‏`P0 — Required`: ‏Gross ו־Net נפרדים

‏כל Result משמעותי מפריד ככל שרלוונטי:

```text
Gross Predictive Edge
- Spread
- Fees
- Slippage
- Latency Loss
- Adverse Selection
- Impact
= Net Executable Edge
```

‏שיפור predictive שאינו שורד assumptions כלכליים אינו Promotion evidence.

### ‏`P0 — Required`: ‏`Replay != Backtest != Execution Simulation`

‏נשמור שלוש שכבות נפרדות:

```text
Decision / Strategy Replay
Execution Simulation
Statistical Analysis / Backtest Aggregation
```

‏Recorded market event הוא Fact.

‏Hypothetical fill הוא Simulation עם `ModelVersion` ו־confidence מפורשים.

### ‏`P0 — Required`: ‏אותו Decision Core ב־Replay

‏ככל האפשר:

```text
Recorded Canonical Events
→ ReplayClock
→ Same Market State
→ Same Features
→ Same Eligibility
→ Same Rank
→ Same Veto
→ Same Decision Core
```

‏Replay path מיוחד עם Strategy semantics שונות אינו baseline אמין.

### ‏`P0 — Required`: ‏Immutable Result Artifacts

‏כל Run מייצר artifact חדש, למשל:

```text
manifest.json
metrics.json
summary.md
charts/
logs/
samples/
failures/
decision.json
```

‏Result קיים אינו מתעדכן כדי להתאים לקוד חדש.

### ‏`P0 — Required`: ‏Run Identity נפרד מ־Experiment Identity

```text
ExperimentId = research question / comparison
RunId        = one concrete execution of that experiment
StrategyVersion = exact decision behavior
DatasetId    = exact evidence input
```

‏אין להשתמש באחד כתחליף לאחר.

### ‏`P0 — Required`: ‏Reproducibility Gate

‏Experiment משמעותי צריך להיות ניתן להרצה מחדש מתוך process נקי עם:

```text
frozen code
frozen data
frozen config
frozen versions
explicit seed when stochastic
```

‏ולקבל אותה semantic result בתוך tolerance מוגדר.

### ‏`P1 — Preferred`: ‏One-command rerun

‏Design Goal:

```text
run-experiment <ExperimentId>
```

‏או workflow מקביל שטוען את ה־manifest וה־versions ללא Manual Magic.

### ‏`P0 — Required`: ‏Count Every Trial

‏נשמור גם את search history:

```text
ExperimentCount
ParameterVariantCount
FeatureVariantCount
HorizonCount
SubgroupCount
ManualRetryCount
```

‏Failed experiments אינם נמחקים.

### ‏`P1 — Preferred`: ‏Research Budget

‏לכל Hypothesis נגדיר budget סביר ל־:

```text
Variants
Sweeps
Manual retries
Subgroup splits
```

‏חריגה אפשרית, אך נרשמת ומחלישה Confidence.

### ‏`P1 — Preferred`: ‏Episode-level statistics

‏לא נספור אלפי snapshots מאותו burst כאילו היו observations עצמאיים.

‏נגדיר `EpisodeId`, membership/dedup semantics ונחשב effective sample size ברמת episode כאשר מתאים.

### ‏`P1 — Preferred`: ‏Robustness surfaces לפני Best Parameter

‏נציג:

```text
Parameter surface
Threshold curve
Coverage curve
Period breakdown
Regime breakdown
Tail distribution
```

‏Plateau יציב עדיף כברירת מחקר על optimum חד ושביר.

### ‏`P1 — Preferred`: ‏Null / Naive Baselines

‏Challenger מורכב יושווה גם ל־baseline פשוט לפי השאלה:

```text
Simple momentum
No-feature / ablated version
Random valid candidate
Simple fixed policy
```

‏Complexity צריכה להוכיח Incremental Value.

### ‏`P1 — Preferred`: ‏Ablation + Decision Impact

‏Feature/Rule חדש ייבחן לא רק לפי predictive association אלא לפי:

```text
Did it change rank?
Did it change TRADE / NO_TRADE?
Did it change veto?
Did it change execution/exit behavior?
Did the changed decisions improve net outcomes?
```

‏`DecisionImpactRate` נמוך עם complexity גבוהה הוא candidate ל־rejection/retirement.

### ‏`P0 — Required`: ‏Champion / Challenger על אותם Contexts

‏כאשר אפשר:

```text
DecisionEpoch
├─ ChampionDecision
└─ ChallengerDecision
```

‏ה־`Disagreement Set` הוא dataset ראשי לניתוח Incremental Value.

‏לכל disagreement נזהה `First Divergence` ב־:

```text
Data
→ Feature
→ Eligibility
→ Score
→ Rank
→ Veto
→ Decision
→ Execution
→ Exit
```

### ‏`P0 — Required`: ‏Counterfactual provenance

‏Outcome מסומן:

```text
OBSERVED
SIMULATED
ESTIMATED
UNKNOWN
```

‏Counterfactual אינו Fact, ו־`UNKNOWN` קריטי אינו PASS.

### ‏`P0 — Required`: ‏Research Loop נפרד מה־Decision Loop

```text
Decision Loop
Market State → Features → Rank → Veto → Decision

Learning Loop
Evidence → RCA → Hypothesis → Experiment → Validation → Challenger
```

‏Research רשאי להציע שינוי; הוא אינו משנה thresholds/features/config אוטומטית.

### ‏`P0 — Required`: ‏RCA לפני Optimization

‏כאשר metric מידרדר:

```text
Drift
→ First Divergence
→ Data / Scanner / Execution / Cost / State / Infra RCA
→ Improvement Candidate
```

‏לא:

```text
Drift → tune parameters
```

### ‏`P1 — Preferred`: ‏Daily Review מזין Research Queue

‏Daily Review מפיק:

```text
Operational Summary
Economic Summary
Diagnostic Findings
Research Queue
```

‏יום יחיד אינו Trigger אוטומטי לשינוי Strategy, למעט correctness/safety issue דטרמיניסטי שדורש מסלול incident נפרד.

---

## ‏3. Recommended Technical Shape

‏למערכת אישית, ברירת המחדל היא Stack קטן ולא platform מחקר מבוזר:

```text
Versioned Raw/Canonical Data Store
        ↓
Point-in-Time Dataset Builder
        ↓
Feature + Label Builders with hard separation
        ↓
Experiment Runner
        ↓
Deterministic Replay Engine
        ↓
Execution / Cost Models
        ↓
Metrics + Statistical Analysis
        ↓
Immutable Artifact Store
        ↓
Experiment Registry + Decision Records
        ↓
SQL-friendly Query / Review Surface
```

‏Notebooks יכולים לשמש `Exploration / Visualization`, אבל אינם Source of Truth ל־transforms, metrics או promoted experiment logic.

‏Core transformations צריכים להיות callable, versioned ו־testable מחוץ ל־Notebook.

---

## ‏4. Why

‏הסיכון המרכזי במחקר קצר־אופק אינו רק bug בקוד. הוא שילוב של:

- ‏Look-ahead ו־Point-in-Time leakage.
- ‏Survivorship / universe bias.
- ‏Holdout contamination.
- ‏Metric shopping.
- ‏Parameter hunting ו־multiple testing.
- ‏Execution assumptions אופטימיים.
- ‏Winner-only logging.
- ‏Recency bias.
- ‏Human-in-the-loop contamination.
- ‏שינויים לא מתועדים ב־Data/Config/Provider.

‏Research Stack טוב לא מבטל את הסיכונים האלה; הוא הופך אותם לגלויים, versioned וניתנים לביקורת.

---

## ‏5. Use When

‏ה־Stack מתאים כאשר:

- ‏בוחנים Feature, filter, ranking, veto, execution או exit hypothesis.
- ‏משווים Champion ל־Challenger.
- ‏צריכים לשחזר result מלפני שבועות/חודשים.
- ‏צריכים להבדיל predictive value מ־execution/cost value.
- ‏מבצעים RCA ל־failed candidate או missed opportunity.
- ‏רוצים להחליט אם complexity חדשה מצדיקה את עצמה.
- ‏רוצים להתקדם מ־Replay ל־Shadow/Paper על בסיס Evidence ולא intuition.

---

## ‏6. Do Not Use When

‏אין להשתמש ב־Research Stack כדי:

- ‏להציג Exploration כ־Confirmation.
- ‏להשתמש שוב ושוב באותו Test set ולקרוא לו Holdout.
- ‏לשנות Primary Metric אחרי שהראשי נכשל.
- ‏להניח `Touch == Fill`.
- ‏למחוק negative results.
- ‏לכוון Strategy אוטומטית לפי Daily Review.
- ‏להסיק causality כאשר כמה רכיבים השתנו יחד ללא attribution.
- ‏להציג estimated/counterfactual outcome כ־Observed Fact.
- ‏להפוך notebook state ידני ל־dependency סמוי של experiment.

---

## ‏7. Alternatives

### ‏A — Notebook-only

‏טוב ל־exploration מהיר.

‏חלש ב־reproducibility, lineage, deterministic reruns ו־governance.

### ‏B — Recommended Local Research Stack

‏Versioned datasets + experiment runner + replay + immutable artifacts + registry + SQL-friendly analysis.

‏זהו baseline המומלץ.

### ‏C — Full MLOps / Distributed Research Platform

‏שימושי כאשר scale, collaboration או ML lifecycle מצדיקים אותו.

‏למערכת אישית הוא בדרך כלל Complexity מוקדמת ללא Incremental Decision Value מוכח.

### ‏D — Production DB as Research Workspace

‏פשוט לכאורה, אך מסוכן בגלל mutation, coupling ו־קושי לשמר historical evidence בדיוק כפי שנצפה בזמן הניסוי.

---

## ‏8. Trade-offs

| בחירה | יתרון | מחיר |
|---|---|---|
| Immutable datasets | reproducibility | storage נוסף |
| Experiment Registry | auditability | discipline/metadata overhead |
| Locked holdout | credibility | פחות data זמין ל־tuning |
| One primary hypothesis | attribution | exploration איטי יותר |
| Replay shared core | semantic parity | דורש architecture נקייה |
| Conservative execution models | פחות false edge | עלולים להחמיר יותר מדי |
| Episode analysis | פחות pseudo-sample | דורש episode definition |
| Local/simple stack | KISS ומהירות | scale/collaboration מוגבלים |
| Negative-result retention | multiple-testing honesty | artifact volume גדל |

---

## ‏9. What I Would Avoid Initially

‏לא הייתי מכניס כברירת מחדל:

- ‏Distributed feature store.
- ‏Large MLOps platform.
- ‏AutoML search רחב.
- ‏Automatic promotion.
- ‏Self-tuning thresholds.
- ‏עשרות simultaneous challengers.
- ‏Massive parameter sweeps.
- ‏Black-box model לפני strong simple baselines.
- ‏Notebook-only data cleaning.
- ‏Mutable “latest dataset”.
- ‏Result dashboard שאין ממנו lineage חזרה ל־Run.

---

## ‏10. What to Add Later

‏רק לאחר bottleneck מוכח אפשר להוסיף:

- ‏Parallel experiment workers.
- ‏Central artifact/object store.
- ‏Dedicated metadata DB.
- ‏Distributed query engine.
- ‏Feature registry / feature store.
- ‏Automated sensitivity maps.
- ‏Automated experiment matrices.
- ‏ML training registry.
- ‏Cross-strategy research graph.
- ‏Advanced statistical correction for broad multiple testing.

‏גם אז Promotion נשאר governance action מפורש.

---

## ‏11. Required Data / Evidence

‏לכל claim משמעותי צריך להיות אפשר לאתר:

```text
ExperimentId
RunId
StrategyVersion
ConfigFingerprint
CodeCommit
DatasetId
UniverseVersion
FeatureSetVersion
CostModelVersion
ExecutionModelVersion
Train/Validation/Test windows
PrimaryMetric
Guardrails
Trial counts
ResultArtifactId
DecisionRecord
```

‏ל־Decision-level analysis נשמור לפחות:

```text
DecisionEpoch
Top-K
Scores / ranks
Eligibility
Vetoes
Data ages / quality
Champion/Challenger decisions where relevant
Outcome provenance
Costs
EpisodeId
```

---

## ‏12. Promotion Criteria

‏מחקר יכול לעבור ל־Shadow/Paper Challenger רק כאשר:

1. ‏ה־Hypothesis וה־diff מוגדרים מראש.
2. ‏Data ו־Universe הם Point-in-Time ו־versioned.
3. ‏אין leakage ידוע.
4. ‏Primary Metric ו־Guardrails הוגדרו מראש.
5. ‏Result ניתן לשחזור מ־fresh run.
6. ‏ה־effect שורד Validation/OOS מתאים.
7. ‏Execution-sensitive claim שורד cost/latency/fill stress.
8. ‏אין P0 correctness/safety regression.
9. ‏ה־incremental value נמדד מול Baseline ברור.
10. ‏Sample/Episode coverage מספיקים לשאלה שנבדקת.
11. ‏Known Unknowns ו־limitations מתועדים.
12. ‏Promotion packet מקושר ל־immutable artifacts.

‏זו Promotion מחקרית בלבד; אינה הרשאה למסחר בכסף אמיתי.

---

## ‏13. Rejection Criteria

‏לא מקדמים claim אם:

- ‏אי־אפשר לשחזר את ה־Run.
- ‏Dataset או Config השתנו ללא version.
- ‏Holdout שימש שוב ל־tuning.
- ‏Primary Metric הוחלף אחרי התוצאה.
- ‏ה־win מופיע רק ב־subgroup שנבחר בדיעבד.
- ‏התוצאה תלויה ב־fill assumption אופטימי בלבד.
- ‏אין advantage מול Baseline פשוט.
- ‏Tail/guardrail regression משמעותי.
- ‏Disagreement sample דל מדי.
- ‏Complexity גדלה ללא Decision Impact ברור.
- ‏Counterfactual fidelity נמוכה מדי לשאלה.
- ‏Provider/Data change אינו מופרד מה־Strategy change.

---

## ‏14. Metrics

### ‏Research Integrity

- ‏Reproducible Run Rate.
- ‏Manifest Completeness.
- ‏Version Identity Completeness.
- ‏Holdout Contamination Count.
- ‏Future-Join Violations.
- ‏Failed/Negative Experiment Retention Rate.
- ‏Unregistered Trial Count.

### ‏Experiment Quality

- ‏OOS Delta vs Baseline.
- ‏Walk-Forward consistency.
- ‏Effective Episode Count.
- ‏Regime/period coverage.
- ‏Parameter sensitivity / plateau width.
- ‏DecisionImpactRate.
- ‏DisagreementRate / UsefulDisagreementRate.

### ‏Economic Realism

- ‏Gross-to-Net Edge Retention.
- ‏Cost Ratio.
- ‏Latency Tax.
- ‏Outcome under Base/Conservative assumptions.
- ‏Counterfactual provenance/confidence mix.

### ‏Research Efficiency

- ‏Time from Observation → closed Experiment.
- ‏Experiments closed with explicit conclusion.
- ‏Duplicate/repeated hypothesis rate.
- ‏Research Queue age.
- ‏Complexity added per promoted improvement.

---

## ‏15. Failure Modes

### ‏`Notebook Truth`
‏Result קיים רק ב־cell state שאינו reproducible.

### ‏`Holdout Recycling`
‏אותו Test משמש שוב ושוב לפיתוח.

### ‏`Metric Shopping`
‏מחליפים success criterion אחרי תוצאה.

### ‏`Trial Amnesia`
‏ניסויים כושלים נעלמים ולכן multiple-testing history מזויף.

### ‏`Mutable Dataset`
‏אותו `DatasetId` מייצג Data שונה לאורך זמן.

### ‏`Replay Fork`
‏Replay משתמש בלוגיקה שונה מה־Decision Core.

### ‏`Simulation as Fact`
‏Hypothetical fill מוצג כאילו observed.

### ‏`Daily Overfitting`
‏יום אחד יוצר parameter change מיידי.

### ‏`Complexity Winner`
‏Challenger מורכב מנצח metric קטן בלי להצדיק latency/maintenance/failure tax.

### ‏`Pseudo Sample Size`
‏אלפי ticks מאותו episode מוצגים כאלפי observations בלתי תלויים.

### ‏`RCA Bypass`
‏Performance הידרדרה ולכן עושים tuning לפני שבודקים Data/State/Execution defect.

---

## ‏16. User-Specific Application

‏למערכת הזו, שבה רוצים לבחור Candidate יחסי מתוך שוק רחב בטווחים קצרים, ה־Research Stack צריך להגן במיוחד על:

1. ‏**Cross-sectional evidence** — לשמור Top-K ו־alternatives, לא רק Winner.
2. ‏**Timeline integrity** — לדעת בדיוק מה היה ידוע בכל Decision Epoch.
3. ‏**Execution realism** — למדוד האם predictive advantage נשאר לאחר costs/latency/fills.
4. ‏**Replayability** — להבדיל market behavior, bug, timing artifact ושינוי Strategy.
5. ‏**Search-history honesty** — לשמור גם trials, failures ו־contaminated holdouts.

‏ל־KISS, ברירת המחדל היא Local/Single-user Research Stack עם datasets ו־artifacts versioned ו־SQL-friendly analysis, לא platform מבוזרת.

---

## ‏17. Confidence

### ‏High

- ‏Point-in-Time correctness.
- ‏Exploration/Confirmation separation.
- ‏Experiment Registry ו־immutable results.
- ‏Chronological validation ו־holdout discipline.
- ‏Replay/reproducibility כ־gates.
- ‏Negative-result retention.
- ‏Primary Metric + Guardrails מראש.
- ‏RCA לפני Optimization.

### ‏Medium

- ‏כמה Walk-Forward folds נדרשים.
- ‏Research Budget המדויק.
- ‏Episode definition המדויק.
- ‏היקף artifact retention.
- ‏איזה statistical correction מתקדם נדרש לאחר הרבה experiments.

‏אלה נקבעים לפי Evidence scale ולא לפי magic numbers.

---

## ‏18. Time-Sensitive Facts

‏ה־Research Stack עצמו אינו תלוי ב־Broker או Provider מסוים.

‏כל experiment שתלוי ב־:

```text
Provider semantics
Broker behavior
Fees
Exchange/session rules
API limits
Order capabilities
```

‏צריך לשמור Reference version + `VerifiedAt` ולהפעיל revalidation כאשר dependency משתנה.

---

## ‏19. Fact / Judgment / Hypothesis

### ‏Fact

- ‏שימוש במידע שלא היה זמין בזמן Decision פוגע ב־Point-in-Time validity.
- ‏אם Test result משפיע על tuning, הוא כבר אינו untouched evidence לאותו claim.
- ‏בלי versions ו־inputs מספיקים לא ניתן לשחזר Experiment באופן מדויק.
- ‏Counterfactual fill אינו observed market fact.

### ‏Judgment

- ‏Experiment Registry מרכזי ו־immutable artifacts הם baseline מומלץ.
- ‏Notebooks משמשים Exploration/Visualization אך לא Source of Truth.
- ‏Research Stack מקומי ופשוט עדיף לפני distributed platform.
- ‏One Primary Hypothesis/Change הוא default טוב ל־causal attribution.
- ‏Replay shared-core הוא הגשר המועדף בין historical evidence ל־Decision behavior.

### ‏Hypothesis

- ‏Signal/Ranking מסוים עשוי לספק Incremental Net Decision Value.
- ‏Challenger מסוים עשוי להיות robust יותר מה־Champion.
- ‏Complexity חדשה עשויה להצדיק את עצמה רק אם היא משנה decisions באופן מועיל אחרי costs.

---

## ‏20. Recommended Research Stack — Baseline

```text
Governance:
Experiment Registry
+ Research Queue
+ immutable Decision Records

Data:
Versioned Raw/Canonical datasets
+ Point-in-Time Universe
+ explicit AsKnownAt semantics

Dataset building:
Deterministic builders
+ separate Feature / Label pipelines

Validation:
Discovery → Validation → Locked Test
+ Walk-Forward when material

Execution economics:
Versioned Cost / Latency / Fill models
+ Base / Conservative stress

Experiment execution:
Manifest-driven runner
+ RunId / ExperimentId separation
+ explicit random seeds where needed

Replay:
Deterministic ReplayClock
+ shared Decision Core
+ run diff / parity checks

Comparison:
Frozen Champion
+ focused Challenger
+ Decision Twins
+ Disagreement Set
+ First Divergence

Artifacts:
Immutable manifests / metrics / summaries / logs / samples / failures

Analysis:
SQL-friendly query surface
+ notebooks only for exploration/visualization

Learning:
Daily Review → RCA / Research Finding → Research Queue
No auto-tuning
No auto-promotion
```

---

## ‏21. Bottom Line

‏ה־Research Stack המומלץ הוא **מערכת לשימור שרשרת הראיות**:

```text
Know what was known
→ know what changed
→ know what was tested
→ know what failed
→ know what reproduced
→ know what remains unknown
```

‏רק לאחר שהשרשרת הזו יציבה כדאי להוסיף scale, automation או models מורכבים. Research velocity אמיתי הוא הקצב שבו נסגרות שאלות בצורה אמינה — לא מספר ה־backtests שמצליחים להריץ.