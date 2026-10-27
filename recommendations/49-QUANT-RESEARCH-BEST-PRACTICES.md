# ‏49 — Recommendation Sheet: Quant Research Best Practices

> ‏מקור לימודי עיקרי: `../49-QUANT-RESEARCH-BEST-PRACTICES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, הנדסי וממשלי ל־`Quant Research` עבור רובוט `Short-Horizon Momentum`, כך שכל Hypothesis, Dataset, Feature, Experiment, Result ו־Decision יהיו ניתנים לשחזור, ביקורת והשוואה; כך שהמערכת תספור גם ניסויים שנכשלו, תגן על Holdouts, תשמור Point-in-Time correctness, ותדרוש Evidence executable ו־economic לפני Promotion.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו המלצה להפעלה בכסף אמיתי ואינו מבטיח רווח.

---

## ‏1. Decision

‏ננהל Research כ־**מערכת Audit-able נגד הונאה עצמית**, לא כאוסף Notebooks, גרפים או ניסויים שנזכרים רק כאשר הצליחו.

‏ה־Baseline:

```text
Observation
→ Hypothesis
→ Pre-Registration Lite
→ Frozen Baseline
→ Point-in-Time Dataset
→ Controlled Experiment
→ OOS / Walk-Forward
→ Robustness / Stress / RCA
→ Immutable Result Artifact
→ Decision Record
→ Replay
→ Shadow
→ Recalibration
```

‏העיקרון המחייב:

```text
Exploration != Validation
Best Result != True Edge
Backtest != Reality
Reproducibility is a gate, not documentation polish
```

‏כל שינוי משמעותי יקבל Evidence Chain:

```text
Hypothesis
→ exact code/data/config
→ exact experiment
→ exact result
→ exact decision
→ exact production/shadow version if promoted
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ארבעת המצבים נשמרים בנפרד

‏בכל מחקר נבדיל בין:

```text
OBSERVATION
HYPOTHESIS
EXPERIMENT
CONCLUSION
```

‏Observation אינו Hypothesis, ו־Hypothesis אינה Conclusion.

‏Narrative שנבנה לאחר התוצאה אינו Evidence חדש.

### ‏`P0 — Required`: Experiment ID יציב

‏כל Experiment משמעותי יקבל מזהה יציב, לדוגמה:

```text
EXP-2026-0042
```

‏ה־ID יופיע ב־:

```text
manifest
config
results
charts
logs
artifact directory
decision record
code/commit reference
```

‏צריך להיות אפשרי לעבור מכל Chart חזרה ל־Experiment המדויק שיצר אותו.

### ‏`P0 — Required`: Experiment Manifest מלא

‏לכל Experiment נשמור לפחות:

```text
experiment_id
created_at
status
hypothesis
rationale
baseline_version
challenger_version
code_commit
dataset_version
universe_version
feature_set_version
config_version
cost_model_version
latency_model_version
fill_model_version
queue_model_version?
start_time
end_time
train_window
validation_window
test_window
primary_metric
secondary_metrics
guardrails
planned_variants
acceptance_criteria
rejection_criteria
known_limitations
random_seed?
environment_version
```

‏שינוי באחד מה־inputs המהותיים יוצר Experiment חדש או Run חדש תחת Experiment עם lineage מפורש.

### ‏`P0 — Required`: Pre-Registration Lite לפני Run מכריע

‏לפני Experiment confirmatory נכתוב לפחות:

```text
hypothesis
baseline
challenger
primary_metric
guardrails
sample window
planned variants
acceptance rule
rejection rule
```

‏לא נבחר אחרי התוצאה Metric אחר שבו ה־Challenger במקרה ניצח.

### ‏`P0 — Required`: Frozen Baseline

‏ה־Champion/Control קפוא למשך הניסוי.

‏ברירת המחדל:

```text
Baseline = frozen
Challenger = one intentional change
```

‏אם נדרש package של כמה שינויים, הוא יסומן במפורש כ־`Treatment Package` וה־causal attribution יקבל Confidence נמוך יותר.

### ‏`P0 — Required`: Planned Diff == Actual Diff

‏לפני Run נשמור Config/Version diff בין Baseline ל־Challenger.

‏אם השתנו ללא תכנון:

```text
dataset
universe
costs
execution model
provider
broker assumptions
preprocessing
feature definition
latency model
```

‏הניסוי מסווג מחדש ולא מוצג כניסוי על שינוי יחיד.

### ‏`P0 — Required`: Primary Metric מראש

‏לכל Experiment יש Primary Metric אחד או מספר קטן מאוד.

‏Metrics אחרים הם Guardrails/Diagnostics.

‏עבור המערכת שלנו Primary Metric צריך להיות קרוב ככל האפשר לשאלה הכלכלית, למשל:

```text
net executable forward outcome
```

‏ב־horizon שהוגדר מראש.

### ‏`P0 — Required`: Point-in-Time correctness

‏לכל Decision time `T`:

```text
feature_available_time <= T
universe_fact_available_time <= T
normalization_fit_time <= T
joined_event_available_time <= T
```

‏כאשר אפשר נשמור בנפרד:

```text
exchange_event_time
provider_time
received_time
processed_time
decision_time
```

‏Feature timestamped לפי הזמן שבו ניתן היה לחשב אותו בפועל, לא רק לפי זמן האירוע האחרון.

### ‏`P0 — Required`: Raw → Canonical → Derived lineage

‏Pipeline המחקר:

```text
Raw Events
→ Canonical Events
→ Features
→ Candidate Snapshots
→ Labels
→ Experiment Dataset
→ Metrics
→ Result Artifact
```

‏כל שכבה ניתנת לשחזור מהקודמת או נושאת provenance שמסביר למה לא.

‏Notebook אינו רשאי “לתקן” Raw Data בשקט.

### ‏`P0 — Required`: Versioned Data

‏Dataset identity יכלול לפי הצורך:

```text
data_source
capture_version
schema_version
normalization_version
correction_version
symbol_mapping_version
calendar_version
corporate_action_version
provider_version
```

‏Data היא dependency versioned בדיוק כמו Code.

### ‏`P0 — Required`: Train / Validation / Test לפי זמן

‏Baseline:

```text
Earlier Past  → Train / Discovery
Later Past    → Validation
Latest Locked → Test
```

‏אין Random Shuffle פשוט בין עבר ועתיד כ־default ל־time series.

### ‏`P0 — Required`: Holdout contamination מתועדת

‏ברגע שראינו Test ושינינו בעקבותיו:

```text
feature
threshold
weight
filter
horizon
cost assumption
entry/exit logic
```

‏ה־Test מסומן `USED_FOR_DEVELOPMENT` ואינו Final Holdout יותר.

‏Holdout חדש נדרש ל־claim חדש של untouched evidence.

### ‏`P0 — Required`: Exploration ו־Confirmation נפרדים

‏Exploration חופשי מותר ומועיל.

‏אבל:

```text
Exploration found pattern
!=
Pattern validated
```

‏Pattern שנמצא ב־Exploration הופך Hypothesis חדשה ונבדק על Data שלא שימש לגילוי.

### ‏`P0 — Required`: Count Every Trial

‏נשמור לפחות:

```text
experiment_count
parameter_variant_count
feature_variant_count
horizon_count
subgroup_count
manual_retry_count
```

‏גם ניסוי שנכשל הוא חלק מ־Multiple-Testing history.

### ‏`P1 — Preferred Default`: Research Budget

‏לכל Hypothesis משמעותית נגדיר מראש Budget של:

```text
maximum variants
maximum sweeps
maximum manual retries
maximum subgroup splits
```

‏חריגה אינה אסורה, אבל נרשמת ומחלישה Confidence.

### ‏`P0 — Required`: Negative Results נשמרים

‏Experiment שנכשל אינו נמחק.

‏נשמור:

```text
hypothesis
what was tested
result
why rejected
known limitations
what would justify reopening
```

‏כך לא מריצים שוב ושוב את אותו רעיון ומודדים את search history האמיתי.

### ‏`P0 — Required`: Immutable Results

‏Result קיים אינו “מתעדכן” כדי להתאים לקוד חדש.

‏Run חדש מייצר Result Artifact חדש.

‏Artifact Bundle מומלץ:

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

### ‏`P0 — Required`: Reproducibility Gate

‏לפני Promotion חייב להיות אפשרי לבצע Independent Re-run מתוך תהליך נקי:

```text
fresh process
fresh output directory
frozen code
frozen data
frozen config
```

‏ולקבל אותה semantic result בתוך tolerance מוגדר.

‏אם לא — אין Promotion.

### ‏`P1 — Preferred Default`: One-command rerun

‏היעד:

```text
run-experiment EXP-2026-0042
```

‏או command מקביל שמוצא את כל ה־versions מתוך Registry/Manifest.

‏No Manual Magic הוא Design Goal.

### ‏`P0 — Required`: Randomness versioned

‏כאשר יש sampling, randomized search או ML:

```text
random_seed
search_seed
split_version
```

‏נשמרים.

‏כאשר seed משפיע מהותית, נבדוק מספר seeds ולא winner יחיד.

### ‏`P0 — Required`: Environment versioning כאשר רלוונטי

‏נשמור:

```text
runtime_version
library_versions
OS/container
build_mode
performance_flags when material
```

‏Performance/Latency experiment ללא Environment identity אינו reproducible מספיק.

### ‏`P1 — Preferred Default`: Walk-Forward למחקרים מהותיים

‏לא נסתפק ב־split יחיד כאשר ה־claim הוא temporal robustness.

‏Baseline רעיוני:

```text
Train A       → Test B
Train A+B     → Test C
Train A+B+C   → Test D
```

‏Rolling מול Expanding נקבע לפי hypothesis על relevance decay.

### ‏`P1 — Preferred Default`: Episode-level analysis

‏למנוע sample inflation, נגדיר יחידת Opportunity/Episode ולא נספור עשרות Snapshots מאותו Burst כ־opportunities עצמאיות.

‏Episode contract כולל:

```text
episode_id
symbol
direction
start
end
trigger_reason
membership_rule
dedup_rule
```

### ‏`P1 — Preferred Default`: Robustness לפני Peak

‏נעדיף Plateau סביר על Sharp Optimum.

‏נציג:

```text
parameter surface
threshold curve
coverage curve
regime breakdown
period breakdown
```

‏ולא רק `best_parameter`.

### ‏`P1 — Preferred Default`: Conservative / Base / Optimistic

‏Execution-sensitive Experiments יציגו לפחות:

```text
optimistic
base
conservative
```

‏במיוחד עבור:

```text
fills
latency
slippage
impact
queue assumptions
```

### ‏`P0 — Required`: Gross ו־Net נפרדים

‏כל Result משמעותי יראה לפחות:

```text
Gross Predictive Edge
Spread
Fees
Slippage
Latency Loss
Expected Adverse Selection
Impact
Opportunity Cost
Net Executable Edge
```

‏שיפור Gross שמוחק יותר Net אינו Promotion.

### ‏`P0 — Required`: Counterfactual Confidence

‏Counterfactual שאינו observed יקבל:

```text
fidelity
confidence
model_version
```

‏לא נציג hypothetical fill כ־Fact.

### ‏`P1 — Preferred Default`: Null / Naive Baselines

‏לצד Champion נריץ לפי השאלה Baselines פשוטים כגון:

```text
simple momentum
no-flow
no-book
random valid candidate
fixed small execution policy
```

‏מודל מורכב שבקושי מנצח Baseline פשוט דורש הצדקה מיוחדת.

### ‏`P1 — Preferred Default`: Ablation

‏כאשר Challenger כולל כמה רכיבים, נבדוק לפי הצורך:

```text
Full
Full - Flow
Full - Book
Full - Regime
```

‏כך נזהה Redundancy ו־Complexity ללא incremental value.

### ‏`P1 — Preferred Default`: Decision Impact Rate

‏Feature/Model חדש חייב להראות כמה פעמים הוא באמת שינה:

```text
rank
trade/no-trade
entry timing
execution mode
exit timing
size/capacity outcome
```

‏Feature predictive שאינו משנה החלטה יכול להיות Research Insight בלי הצדקה ל־Production complexity.

### ‏`P1 — Preferred Default`: Complexity Tax בתוך ה־Result

‏נמדוד גם:

```text
compute latency
memory
state complexity
failure modes
monitoring burden
maintenance
```

‏השאלה היא:

```text
Does incremental production value justify incremental complexity?
```

### ‏`P0 — Required`: Research → Production Contract

‏Feature/Rule שמקודם מגיע עם:

```text
definition
version
expected range
input contracts
availability time
staleness rule
missing-data semantics
failure behavior
monitoring metrics
rollback behavior
assumptions
known failure envelope
```

### ‏`P0 — Required`: Production/Research semantic parity

‏ככל האפשר:

```text
same feature semantics
same decision semantics
same cost definitions
same execution contracts
```

‏משמשים Research ו־Production.

‏Replay הוא הגשר המועדף להפעלת Production-like logic על historical event streams.

### ‏`P0 — Required`: Provider / Broker / Infrastructure change = Research Event

‏שינוי ב־:

```text
market-data provider
broker
routing path
runtime
latency profile
execution model
fill semantics
```

‏יכול לשנות את ה־Edge גם ללא שינוי Strategy logic.

‏לא משווים לפני/אחרי כ־same experiment בלי version boundary מפורש.

### ‏`P0 — Required`: Research Result חייב Decision Record

‏סטטוסים:

```text
PROMOTE
REJECT
RESEARCH_MORE
SHADOW_ONLY
INSUFFICIENT_EVIDENCE
```

‏עם reason codes ו־Next Action.

### ‏`P1 — Preferred Default`: Stop Rules

‏רעיון צריך להיסגר כאשר Evidence מצדיק זאת, למשל:

```text
repeated OOS failure
no material effect
high complexity tax
unstable parameter surface
poor calibration
execution destroys edge
```

‏אין אינסוף tuning לרעיון מת.

---

## ‏3. Why

‏במערכת עם אלפי Symbols, horizons קצרים והמון דרגות חופש, אפשר ליצור Backtest “טוב” גם בלי Edge אמיתי.

‏מקורות הסיכון כוללים:

```text
look-ahead
survivorship
selection bias
multiple testing
winner's curse
metric shopping
parameter hunting
execution fantasy
test contamination
manual data cleaning
sample duplication
```

‏Research Governance הופך את השאלה מ־:

```text
Can I find something that looks good?
```

‏ל־:

```text
Can a controlled, reproducible process produce evidence
that survives attempts to falsify it?
```

---

## ‏4. Use When

‏ה־Baseline חל על כל שינוי שעשוי להשפיע על:

- ‏Features.
- ‏Filters.
- ‏Ranking/Score.
- ‏Candidate Gate.
- ‏Entry/Exit.
- ‏Execution mode.
- ‏Risk/Sizing.
- ‏Market Data Provider.
- ‏Broker/Routing.
- ‏Latency/Infrastructure.
- ‏Cost/Fill/Queue models.

‏ככל שהשינוי קרוב יותר ל־Production risk, כך נדרשת Evidence חזקה יותר.

---

## ‏5. Do Not Use When

‏אין צורך ב־full confirmatory workflow לכל exploratory query זעירה.

‏מותר:

```text
quick exploration
ad-hoc visualization
rough diagnostic
```

‏בתנאי שהם מסומנים `EXPLORATORY` ואינם משמשים Promotion Evidence.

‏גם Bug Fix שמחזיר semantics מתועדת אינו בהכרח Strategy Experiment, אבל הוא עדיין דורש regression/reproducibility verification.

---

## ‏6. Alternatives

### ‏Alternative A — Notebook-first research

‏מהיר ל־Exploration, חלש כ־Source of Truth.

‏מתאים ל־Discovery בלבד.

### ‏Alternative B — Lightweight Registry + versioned pipeline

‏זה ה־Preferred Default.

‏נותן Auditability בלי להקים MLOps Platform כבדה.

### ‏Alternative C — Full experiment-tracking / MLOps platform

‏יכול להיות שימושי כאשר:

```text
many models
many datasets
many parallel researchers
large automated search
```

‏אינו נדרש ל־MVP אישי.

### ‏Alternative D — Fully automated optimizer

‏`P4` בלבד.

‏Automation מגדילה Multiple Testing ולכן דורשת Guardrails קשיחים יותר, לא פחות.

---

## ‏7. Trade-offs

### ‏Discipline מול Speed

‏יותר Governance מאט Experiment בודד אבל משפר Learning Rate אמיתי ומפחית rework.

### ‏Immutability מול Storage

‏Artifacts immutable צורכים Storage, אבל משמרים audit trail.

### ‏One Change at a Time מול Interactions

‏שינוי יחיד משפר Attribution; interaction packages לפעמים הכרחיים אך מגדילים uncertainty.

### ‏Holdout Discipline מול Data Scarcity

‏ב־short-horizon data אפשר לצבור הרבה rows אבל מעט independent episodes. צריך להגן על Holdout בלי לבזבז Evidence.

### ‏Reproducibility מול Runtime Cost

‏Versioned artifacts, manifests ו־lineage מוסיפים overhead קטן אך מונעים ambiguity גדול.

---

## ‏8. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏AutoML רחב.
- ‏Bayesian/Genetic optimizer על מאות parameters.
- ‏אלפי feature interactions.
- ‏MLOps Platform מורכבת.
- ‏Auto-retuning live.
- ‏Per-symbol parameter tuning.
- ‏Metric shopping.
- ‏Manual exclusion של ימים אחרי צפייה ב־PnL.
- ‏Notebook state כ־Source of Truth.
- ‏Result files שנדרסים.
- ‏“Best run” ללא trial history.

---

## ‏9. What to Add Later

‏רק כאשר ה־Baseline עובד:

- ‏Content-addressed artifacts.
- ‏Automated lineage graph.
- ‏Block bootstrap / advanced uncertainty estimates.
- ‏Blind A/B review.
- ‏Automated red-team checks.
- ‏Research dashboard.
- ‏Automated drift-triggered revalidation.
- ‏Experiment queue prioritization לפי Expected Value of Research.
- ‏Advanced multiple-testing corrections.
- ‏Large-scale automated hypothesis generation עם budgets/holdouts קשיחים.

---

## ‏10. Required Data / Evidence

‏לפני שאנו מאמינים ל־Experiment צריך להיות ידוע:

```text
data provenance
point-in-time availability
universe provenance
sample unit / episode definition
train-validation-test boundaries
code commit
config version
feature versions
cost model
latency model
fill/queue model
trial count
primary metric
coverage
OOS result
robustness result
```

‏ל־short-horizon system נוסיף:

```text
signal age
rank age
fresh coverage
execution feasibility
markout
fill/no-fill outcomes
latency distribution
```

---

## ‏11. Promotion Criteria

‏Promotion דורש לפחות:

```text
reproducible clean rerun
point-in-time proof
frozen-baseline comparison
primary-metric improvement
material economic effect
OOS evidence
parameter robustness
regime analysis
realistic execution/cost model
latency feasibility
acceptable tails
acceptable coverage
acceptable complexity tax
replay pass
shadow evidence when decision-impacting
monitoring contract
rollback plan
```

‏Reason codes לדוגמה:

```text
PR_VALIDATED_OOS
PR_ROBUST_PARAMETERS
PR_EXECUTABLE_NET_EDGE
PR_STABLE_ACROSS_REGIMES
PR_REPRODUCIBLE
PR_REALTIME_FEASIBLE
PR_LOW_COMPLEXITY_COST
```

---

## ‏12. Rejection Criteria

‏Reject כאשר אחד מהבאים מהותי:

```text
RJ_NO_OOS_EDGE
RJ_LEAKAGE_RISK
RJ_TEST_CONTAMINATED
RJ_UNSTABLE_PARAMETERS
RJ_COSTS_ERASE_EDGE
RJ_LATENCY_ERASES_EDGE
RJ_EXECUTION_UNREALISTIC
RJ_LOW_COVERAGE
RJ_COMPLEXITY_TOO_HIGH
RJ_INSUFFICIENT_SAMPLE
RJ_NOT_REPRODUCIBLE
RJ_PROVIDER_DEPENDENT_UNPROVEN
RJ_REPEATED_OOS_FAILURE
```

‏`RESEARCH_MORE` כאשר ה־Evidence אינה שלילית אבל אינה מספיקה:

```text
RM_NEEDS_MORE_DAYS
RM_REGIME_DEPENDENT
RM_FILL_MODEL_UNCERTAIN
RM_DATA_QUALITY_UNCERTAIN
RM_LIVE_CALIBRATION_NEEDED
RM_EFFECT_TOO_SMALL_TO_RESOLVE
```

---

## ‏13. Metrics

### ‏Research Process Metrics

```text
experiments_started
experiments_completed
experiments_promoted
experiments_rejected
experiments_research_more
negative_result_count
reproducibility_pass_rate
holdout_contamination_count
trial_count_per_hypothesis
```

### ‏Research Quality Metrics

```text
OOS delta
walk-forward stability
parameter-surface stability
coverage delta
tail-risk delta
latency delta
execution-quality delta
complexity delta
```

### ‏Learning Metrics

```text
decision_impact_rate
hypothesis_reopen_rate
repeated_experiment_rate
live_vs_backtest_gap
prediction_to_execution_decay
```

### ‏Drift Metrics

```text
feature_distribution_shift
current_effect_size / historical_effect_size
live_markout_delta
latency_pressure_shift
spread_regime_shift
provider_version_change
broker_version/path change
```

---

## ‏14. Failure Modes

```text
LOOK_AHEAD_LEAKAGE
SURVIVORSHIP_BIAS
TEST_CONTAMINATION
METRIC_SHOPPING
PARAMETER_HUNTING
MULTIPLE_TESTING_BLINDNESS
WINNERS_CURSE
SAMPLE_DUPLICATION
UNREALISTIC_FILL_MODEL
UNMODELED_LATENCY
SILENT_DATA_CLEANING
STALE_CACHE_ARTIFACT
UNVERSIONED_FEATURE
UNVERSIONED_DATASET
NON_REPRODUCIBLE_RESULT
NEGATIVE_RESULT_LOST
HOLDOUT_REUSED
PROVIDER_CHANGE_UNACCOUNTED
BROKER_CHANGE_UNACCOUNTED
COMPLEXITY_WITHOUT_DECISION_VALUE
```

‏Failure mode שאינו מוסבר מקבל `UNKNOWN`, לא Narrative מומצא.

---

## ‏15. User-Specific Application

‏למערכת שלנו יש מאפיינים שמגדילים במיוחד Research Risk:

```text
~whole-market universe
cross-sectional Top candidate selection
short signal lifetime
many possible horizons
execution-sensitive edge
fast changing rank
provider/broker separation
many possible filters/features
```

‏לכן נקבעים חמישה כללים מיוחדים:

1. ‏`Top1` אינו נמדד לבד; תמיד נשמור `Top-K`, separation, churn ו־selection regret.
2. ‏Signal שנראה predictive חייב להוכיח שהוא עדיין executable אחרי realistic latency/cost/fill assumptions.
3. ‏`NO_TRADE` הוא Population מחקרית אמיתית, לא rows שנזרקים.
4. ‏כל Feature חדש חייב להראות `Decision Impact Rate`, לא רק correlation.
5. ‏RCA של failures יזין Research Queue לפי `Lost Edge`, לא לפי “רעיון מגניב”.

‏ה־Research question העליונה נשארת:

```text
Among all currently valid symbols,
which candidate has the best executable short-horizon opportunity now,
and can the system enter and exit before the edge decays?
```

---

## ‏16. Concrete Baseline Contracts

### ‏Experiment Manifest

```text
experiment_id
hypothesis
rationale
status
baseline_version
challenger_version
code_commit
dataset_version
universe_version
config_version
feature_set_version
cost_model_version
latency_model_version
fill_model_version
train_window
validation_window
test_window
primary_metric
secondary_metrics
guardrails
planned_variants
trial_budget
acceptance_criteria
rejection_criteria
known_limitations
environment_version
created_at
```

### ‏Result Record

```text
experiment_id
run_id
primary_metric_baseline
primary_metric_challenger
primary_metric_delta
coverage_delta
tail_delta
latency_delta
execution_quality_delta
complexity_delta
OOS_status
walk_forward_status
robustness_status
reproducibility_status
artifact_hash
completed_at
```

### ‏Decision Record

```text
experiment_id
decision:
  PROMOTE | REJECT | RESEARCH_MORE | SHADOW_ONLY | INSUFFICIENT_EVIDENCE
reason_codes
confidence
known_limitations
next_action
reviewed_at
```

### ‏Feature Registry

```text
feature_name
feature_version
definition
source_events
lookback
availability_time_semantics
normalization
missing_policy
staleness_rule
update_trigger
compute_cost
latency_cost
status
last_validation_experiment
```

### ‏Assumption Registry

```text
assumption_id
strategy_version
name
expected_range
source_experiment
last_validated_at
monitor_metric
invalidating_condition
confidence
```

---

## ‏17. Confidence

### ‏High Confidence

‏המלצות בעלות Confidence גבוה:

- ‏Point-in-Time correctness.
- ‏Frozen baseline.
- ‏Primary metric מראש.
- ‏Experiment/Data/Code/Config versioning.
- ‏Negative results retention.
- ‏Immutable result artifacts.
- ‏Train/Validation/Test temporal separation.
- ‏Reproducibility gate.
- ‏Trial counting.
- ‏Gross/Net separation.
- ‏Replay/Shadow before decision-impacting promotion.

### ‏Medium Confidence

‏תלויות בגודל המחקר:

- ‏Exact research budgets.
- ‏Exact number of Walk-Forward folds.
- ‏Episode dedup rules.
- ‏Artifact storage layout.
- ‏Specific bootstrap method.
- ‏Review cadence.

### ‏Evidence-Only

- ‏AutoML.
- ‏Large automated feature interaction search.
- ‏Live auto-retuning.
- ‏Fully automated AI research/promotion.
- ‏Advanced statistical multiple-testing corrections beyond baseline governance.

---

## ‏18. Time-Sensitive Facts

‏אין במקטע 49 תלות ב־Broker/Exchange rule חיצוני שמצריך Current Verification חדש.

‏עם זאת, Evidence חייבת להיחשב version-specific כאשר משתנים:

```text
provider
broker
fees
routing
market structure
runtime
execution semantics
latency profile
```

‏Evidence ישנה יכולה לאבד relevance ולכן לכל Assumption חשוב נשמור `last_validated_at` ו־revalidation trigger.

---

## ‏19. Relationship to Earlier / Later Sheets

### ‏מול 20–21

‏20–21 מגדירים Timeline Integrity ו־Execution Backtest realism. ‏49 הופך אותם ל־Research Governance מחייבת.

### ‏מול 22

‏22 מגדיר כיצד למדוד Predictive Quality. ‏49 קובע כיצד Evidence כזו נשמרת, מושווית ומקודמת.

### ‏מול 23

‏23 נשאר Source of Truth ל־Overfitting, Leakage, Test contamination ו־validation separation.

‏49 אינו מחליף אותו; הוא מוסיף Registry, manifests, memory ו־governance מסביב.

### ‏מול 24

‏24 נשאר Source of Truth ל־Controlled Champion/Challenger experiment.

‏49 הופך את הניסוי ל־durable artifact בתוך Research System.

### ‏מול 26

‏RCA מייצר Hypotheses חדשים; Research מחזיר Evidence חזרה ל־RCA ול־Monitoring.

### ‏מול 27–28

‏Replay ו־Shadow הם שכבות Evidence, לא קישוט לאחר Backtest.

### ‏מול 35

‏Assumptions חשובים במחקר הופכים Metrics/Alerts ב־Production.

### ‏מול 44–48

‏Flow, Book, Adverse Selection, Capacity ו־Latency חייבים לעבור אותו Research Contract; אף משפחה אינה “מקצועית מדי” כדי להיות פטורה מ־Holdout ו־Reproducibility.

### ‏מול 50

‏מקטע 50 ייקח את המשמעת הזו אל Scanner architecture ו־runtime behavior; הוא לא יתחיל מחדש את Governance.

---

## ‏20. Tests / Invariants

### ‏P0 Research Integrity Tests

```text
feature_available_time <= decision_time
label_data never enters feature path
train/validation/test do not overlap illegally
point-in-time universe only
cost model version present
latency model version present
fill model version present
experiment manifest complete
code commit present
result immutable
```

### ‏Leakage Canary

‏Pipeline צריך להיכשל או להתריע כאשר Feature מכוון בכוונה ל־future information.

### ‏Shuffle Sanity Test

‏כאשר שוברים את הקשר Feature/Label בכוונה, performance אמורה להיעלם.

### ‏Time Shift Test

‏הזזת Feature בזמן צריכה לחשוף sensitivity הגיונית; שיפור חריג כאשר Feature “מגיע מוקדם מדי” הוא leakage warning.

### ‏Golden Experiments

‏נחזיק Experiments קטנים עם expected semantic outputs כדי לזהות Infrastructure drift.

### ‏Data Lineage Test

‏עבור Sample נבחר נוכל לעקוב:

```text
raw event
→ canonical event
→ feature
→ score
→ rank
→ decision
→ label
→ metric
```

### ‏Reproducibility Property

```text
same frozen data
+ same code
+ same config
+ same seed/environment contract
=> same semantic result
```

### ‏Result Immutability Property

```text
existing result artifact cannot be silently overwritten
```

### ‏Trial Memory Property

```text
failed experiment remains queryable
```

### ‏Promotion Invariant

```text
PROMOTE
requires
reproducible_result
AND OOS_pass
AND execution_feasible
AND monitoring_ready
AND rollback_ready
```

---

## ‏21. Research Governance / Source of Truth

‏ה־Source of Truth יהיה Repository/Registry, לא Chat, notebook memory או local screenshot.

‏מבנה KISS אפשרי:

```text
research/
  experiments/
    EXP-2026-0042/
      manifest.yaml
      decision.yaml
      summary.md
  registry.yaml
  features.yaml
  assumptions.yaml
```

‏Artifacts כבדים יכולים להישמר מחוץ ל־Git, אבל Registry חייב להצביע אליהם ב־ID/hash/version יציב.

---

## ‏22. Recommended Research Queue

‏רעיונות יקבלו Priority לפי Lost Edge / Learning Value:

```text
P0 correctness / leakage / execution realism
P1 common failure mode / large lost edge
P2 measurable opportunity-cost reduction
P3 feature refinement
P4 speculative complexity
```

‏Expected Value of Research באופן רעיוני:

```text
Probability of meaningful learning
× Value of learning
÷ Cost / complexity of experiment
```

‏כך לא משקיעים את רוב הזמן ב־Feature עשירי כאשר RCA מראה שהבעיה העיקרית היא Exit latency או execution loss.

---

## ‏23. Evidence Ladder

‏Confidence עולה בערך כך:

```text
Intuition
< Exploration
< Controlled Backtest
< OOS Validation
< Walk-Forward
< Replay
< Shadow
< Paper lifecycle evidence
< Controlled real-execution calibration where applicable
< Repeated evidence
```

‏אין שלב יחיד שמוכיח הכול.

‏במסגרת המקטע הנוכחי Promotion נשאר ברמת Research/Replay/Shadow/Paper; כל מעבר נוסף כפוף ל־Safety/Risk/eligibility constraints נפרדים.

---

## ‏24. Definition of Done

### ‏Experiment

‏Experiment אינו Done עד שיש:

```text
manifest
result
primary metric
baseline comparison
OOS/robustness status
decision
limitations
next action
```

### ‏Feature

‏Feature אינו Done כי הוא computed.

‏נדרש:

```text
definition
tests
point-in-time proof
predictive evaluation
decision impact
latency/complexity cost
monitoring contract
```

### ‏Strategy Change

‏נדרש:

```text
validated evidence
execution feasibility
risk/safety review
replay/shadow evidence
observability
rollback
```

---

## ‏25. Recommendation Summary

‏למערכת שלנו מומלץ Research Baseline פשוט אך קשיח:

```text
Hypothesis First
→ Experiment ID
→ Pre-Registration Lite
→ Frozen Baseline
→ Versioned Data / Universe / Code / Config
→ Point-in-Time Dataset
→ One Primary Metric
→ Count Every Trial
→ OOS / Walk-Forward
→ Execution + Cost + Latency Realism
→ Robustness / Stress / RCA
→ Immutable Artifact
→ Reproducible Clean Rerun
→ Decision Record
→ Replay / Shadow
→ Monitor Assumptions
→ Revalidate or Retire
```

‏המסר המרכזי:

```text
Research speed != Learning speed
Pretty backtest != Evidence
Reproducible, falsifiable, executable evidence wins
```
