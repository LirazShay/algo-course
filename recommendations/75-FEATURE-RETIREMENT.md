# ‏75 — Recommendation Sheet: Feature Retirement

> ‏מקור לימודי עיקרי: `../75-FEATURE-RETIREMENT.md`.
>
> ‏מטרת הקובץ: להגדיר Lifecycle מקצועי שבו Feature צריך להמשיך להצדיק את מקומו לפי `Incremental Decision Value`, עלות, יציבות, dependencies ו־failure surface — ולא להישאר במערכת רק בגלל sunk cost, היסטוריה או correlation ישן.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו מניח שיותר Features משמע מערכת טובה יותר.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Is this feature predictive?
```

‏אלא:

```text
Does this feature still add incremental decision value
beyond the current system,
at an acceptable latency, reliability, data-dependency,
complexity and operational cost,
without creating unresolved safety or reproducibility risk?
```

‏החלטות אפשריות:

```text
KEEP
WATCH
REDESIGN
REDUCE_SCOPE
MOVE_TO_DEEP_PATH
DEPRECATE
RETIRE
```

‏`RETIRE` אינו `DELETE`.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Feature Lifecycle מפורש

```text
IDEA
→ RESEARCH
→ SHADOW
→ ACTIVE
→ WATCH
→ DEPRECATED
→ RETIRED
→ ARCHIVED
```

‏כל מעבר State חייב Reason, Evidence, Version ו־timestamp.

### ‏`P0 — Required`: Feature Contract מלא

‏Recommendation 13 נשאר מקור האמת ל־Feature Engineering. מקטע 75 מוסיף Lifecycle/retirement מעל אותו Contract.

‏לכל Feature פעיל נשמור לפחות:

```text
FeatureId
Version
Definition
Role
Inputs
TimestampSemantics
FreshnessRule
MissingSemantics
WarmupRule
ComputeCost
Dependencies
Owner
ValidationEvidence
CurrentLifecycleState
ReviewDueAt
```

### ‏`P0 — Required`: `Incremental Value`, לא `Standalone Value`

‏Retention/retirement ייבחנו מול המערכת הנוכחית:

```text
Current System + Feature
vs
Current System - Feature
```

‏לא מספיק ש־Feature correlated עם outcome או נראה predictive לבדו.

### ‏`P0 — Required`: Ablation End-to-End

‏Ablation צריך למדוד לפחות:

```text
Predictive metrics
Rank changes
Top-K changes
Trade / NO TRADE changes
Veto changes
Entry / Exit changes
Execution outcomes
Net economic outcome
Latency / compute impact
Failure-surface impact
```

‏למודלים שדורשים retraining נפריד:

```text
Drop-Column Retraining
Frozen-Model Ablation
```

‏אלה עונות על שאלות שונות.

### ‏`P0 — Required`: Hard triggers עוברים Quarantine

‏דוגמאות:

```text
LEAKAGE
INCORRECT_DEFINITION
INVALID_PROVIDER_SEMANTICS
UNRESOLVED_TIMESTAMP_AMBIGUITY
CRITICAL_SAFETY_DEFECT
```

‏Feature כזה אינו נשאר `WATCH` וממשיך להשפיע על decisions; הוא יוצא מהמסלול הפעיל עד RCA/validation.

### ‏`P0 — Required`: Safety Features נמדדים אחרת

‏Feature של safety/veto אינו צריך לייצר Alpha כדי להצדיק קיום.

‏לפני retirement שלו נדרש:

```text
Safety role understood
Tail scenarios covered
Replacement proven if required
Missing-state policy understood
Open-position dependency reviewed
Rollback ready
```

### ‏`P1 — Preferred Default`: Shadow Retirement

‏לפני פרישה קבועה:

```text
Production/Champion path keeps feature
Counterfactual path behaves as if feature were absent
```

‏וכך מודדים Decision/Economic/Operational impact בלי למחוק Evidence.

### ‏`P1 — Preferred Default`: Reverse Shadow אחרי Retirement

‏למשך חלון מוגדר אפשר להמשיך לחשב Feature בלי להשתמש בו.

‏המטרה:

```text
detect unexpected deterioration
observe regime-specific recovery
validate retirement assumptions
support rollback evidence
```

### ‏`P1 — Preferred Default`: Scope reduction לפני delete

‏Feature useful אך יקר יכול לעבור:

```text
Full-universe fast path
→ Top-N deep path
```

‏או:

```text
All regimes
→ Evidence-backed regimes only
```

‏או Role מצומצם כגון Entry בלבד / Exit בלבד.

### ‏`P1 — Preferred Default`: Retirement Registry + Feature Graveyard

‏לכל Feature retired נשמור:

```text
FeatureId
Version
RetiredAt
PreviousRole
ReasonCode
EvidenceRefs
Dependencies
Replacement
RollbackPlan
HistoricalCompatibility
```

‏כך לא “ממציאים מחדש” Feature שכבר נבדק ונכשל ולא מאבדים reproducibility.

### ‏`P2 — Useful Improvement`: Family-Level Ablation

‏כאשר כמה Features מודדים אותו information family, נבדוק גם:

```text
Feature-level ablation
Family-level ablation
Canonical-feature replacement
```

‏Correlation/clustering משמשים discovery בלבד, לא retirement rule אוטומטי.

### ‏`P2 — Useful Improvement`: Runtime usage telemetry

‏Static dependency graph אינו מספיק.

‏נרצה:

```text
FeatureReadCount
FeatureDecisionImpactCount
ConsumersSeenAtRuntime
CriticalPathUsage
FallbackUsage
```

### ‏`P3 — Advanced Challenger`: Regime-scoped retirement

‏אם Feature מוסיף value רק בתנאים מסוימים, אפשר לבחון conditional activation.

‏אבל אם נדרשים הרבה buckets צרים כדי “להציל” אותו, זה red flag ל־regime overfitting.

### ‏`P4 — Specialist`: Automated redundancy discovery

‏אפשר להשתמש ב־correlation graphs, clustering, permutation importance או SHAP ליצירת candidates לפרישה.

‏אף אחד מהם אינו `Retirement Oracle`.

---

## ‏3. Why

‏Feature פעיל גובה מחיר גם כאשר הוא “קטן”:

```text
CPU
Memory
Latency
Allocations / GC
Data dependencies
Storage
Tests
Monitoring
Debugging
Incident surface
Research degrees of freedom
Explainability burden
```

‏לכן Feature צריך להצדיק את עצמו מול:

```text
IncrementalDecisionValue
+
EconomicValue
+
SafetyValue

versus

LatencyCost
+
OperationalCost
+
Fragility
+
ComplexityTax
+
ResearchTax
```

‏ב־Short-Horizon גם שיפור predictive קטן יכול להיות שלילי אם הוא מוסיף latency tail שמכלה את ה־Edge.

---

## ‏4. Use When

‏מפעילים Retirement Review כאשר לפחות אחד מתקיים:

- ‏Feature חדש עשוי להחליף Feature ישן.
- ‏`DecisionImpactRate` נמוך לאורך זמן.
- ‏Incremental value חלש או לא יציב.
- ‏p95/p99 compute latency עלו.
- ‏FeatureAvailability/Freshness יורדים.
- ‏יש persistent drift.
- ‏אותו Feature חוזר ב־incidents או RCA.
- ‏dependency חיצוני נהיה יקר/שביר.
- ‏Feature family נראה redundant.
- ‏ה־model/score השתנה ולכן תפקיד Feature הישן השתנה.

---

## ‏5. Do Not Use When

‏לא פורשים Feature רק משום ש:

- ‏היה יום/שבוע חלש.
- ‏correlation ירדה זמנית.
- ‏importance metric אחד נמוך.
- ‏SHAP נמוך.
- ‏Feature כמעט לא מופעל אך ייתכן שהוא safety/tail insurance.
- ‏Feature חדש נראה טוב על אותו dataset בלי OOS/Replay/Shadow.
- ‏ה־consumer graph עדיין לא ידוע.
- ‏יש positions/replay/models ישנים שתלויים בגרסה הפעילה ולא נבנתה compatibility plan.

---

## ‏6. Alternatives

‏במקום retirement מלא:

```text
KEEP
WATCH
REDESIGN implementation
REDUCE_SCOPE
REDUCE_FREQUENCY
USE_APPROXIMATION
MOVE_TO_DEEP_PATH
REPLACE_WITH_CANONICAL_FEATURE
DEPRECATE_ONLY
```

‏הבחירה תלויה בשאלה אם הבעיה היא Hypothesis, implementation, cost, dependency או scope.

---

## ‏7. Trade-offs

| בחירה | יתרון | מחיר / סיכון |
|---|---|---|
| `KEEP` | אין compatibility change | ממשיך לשלם complexity/cost |
| `WATCH` | צובר Evidence | החוב נשאר זמנית |
| `REDESIGN` | שומר Hypothesis | דורש validation מחדש |
| `REDUCE_SCOPE` | חוסך cost | מגדיל policy complexity |
| `MOVE_TO_DEEP_PATH` | מוריד hot-path cost | מאבד full-universe availability |
| `DEPRECATE` | transition בטוח | נשאר code/compat burden |
| `RETIRE` | מפשט runtime ומחקר | regression/hidden-dependency risk |

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל מ:

- ‏auto-retirement לפי importance threshold.
- ‏AI שמוחק Features לבד.
- ‏Regime-specific activation עם עשרות buckets.
- ‏מחיקה פיזית מיידית של code/history.
- ‏cascading dependency deletion בלי usage graph.
- ‏Feature Health Score יחיד שמסתיר critical defect.
- ‏החלטת retirement מתוך daily PnL.
- ‏safety feature removal ללא replacement/tail validation.

---

## ‏9. What to Add Later

‏לאחר Baseline יציב:

- ‏Feature Registry מלא עם lifecycle transitions.
- ‏runtime dependency/usage telemetry.
- ‏family-level ablation automation.
- ‏retirement queue עם deduplication.
- ‏automatic reverse-shadow comparison.
- ‏feature cost attribution לפי critical path.
- ‏dependency retirement cascade analysis.
- ‏resurrection workflow ל־archived features.
- ‏model/feature compatibility matrix אוטומטית.

---

## ‏10. Required Data / Evidence

‏Retirement Review Packet צריך לפחות:

```text
FeatureId
CurrentVersion
CurrentRole
LifecycleState
Hypothesis
StandaloneEvidence
IncrementalEvidence
DecisionImpactRate
RankImpact
VetoImpact
EntryImpact
ExitImpact
EconomicImpact
RegimeBreakdown
FeatureAvailability
FreshnessDistribution
p50/p95/p99ComputeCost
LatencyContribution
DependencyGraph
RuntimeConsumers
FailureHistory
DriftHistory
AblationResults
ShadowRetirementResults
OpenPositionDependency
ModelCompatibility
HistoricalReplayRequirement
RollbackPlan
```

‏וכן `AsOf` / dataset/version fingerprints לכל evidence.

---

## ‏11. Promotion Criteria

‏כדי לקדם:

```text
RETIREMENT_CANDIDATE
→ DEPRECATED
→ RETIRED
```

‏נדרש:

- ‏incremental value נמוך/replaceable across מספיק Evidence.
- ‏counterfactual/ablation ללא regression מהותי.
- ‏coverage של regimes רלוונטיים, כולל tail scenarios כשצריך.
- ‏dependencies מובנים.
- ‏אין unresolved safety role.
- ‏model/training-serving compatibility סגורה.
- ‏historical replay נשמר.
- ‏rollback path נבדק.
- ‏החיסכון הצפוי ב־latency/complexity אכן material או שה־Feature באמת redundant.

‏זו Promotion של **החלטת retirement הנדסית/מחקרית**, לא אישור להפעלה בכסף אמיתי.

---

## ‏12. Rejection Criteria

‏נדחה retirement אם:

- ‏Feature עדיין מוסיף OOS incremental decision/economic value.
- ‏יש regime חשוב שבו הוא קריטי ואין coverage מספיק.
- ‏הוא safety dependency ללא replacement מוכח.
- ‏Ablation פוגע ב־Rank/NO TRADE/Veto/Exit באופן מהותי.
- ‏אין dependency map אמין.
- ‏המודל עדיין מצפה ל־Feature.
- ‏retirement פוגע ב־historical reproducibility.
- ‏החיסכון התפעולי לא התממש.
- ‏evidence מבוסס על תקופה קצרה/correlated observations בלבד.

---

## ‏13. Metrics

### ‏Value

```text
DecisionImpactRate
MarginalDecisionValue
IncrementalNetOutcome
Rank1ChangeRate
TopKChangeRate
VetoDecisionImpact
EntryDecisionImpact
ExitDecisionImpact
```

### ‏Operational

```text
FeatureAvailability
MissingRate
StaleRate
p50/p95/p99FeatureAge
p50/p95/p99ComputeLatency
CPUTime
AllocationRate
MemoryFootprint
QueueImpact
```

### ‏Fragility / Quality

```text
DriftIncidentCount
ParityFailureCount
ProviderDependencyFailures
FeatureStrikeCount
UndefinedSemanticsCount
ManualFallbackCount
```

### ‏Retirement validation

```text
ShadowDisagreementRate
ReverseShadowRegressionRate
LatencySaved
ComplexityReduced
UnexpectedConsumerCount
RollbackTriggerCount
```

---

## ‏14. Failure Modes

- ‏פורשים Feature predictive בגלל metric importance מטעה.
- ‏משאירים Feature redundant כי “הוא עדיין עובד”.
- ‏Feature removal משנה Exit behavior של position שנפתח עם semantics קודמים.
- ‏hidden consumer נשבר לאחר retirement.
- ‏Drop-column evaluation לא retrained ולכן משווה לא נכון.
- ‏Missingness עצמה הייתה informative ולא נבדקה.
- ‏regime נדיר שבו Feature חשוב לא הופיע בחלון הניסוי.
- ‏scope reduction הופך ל־regime overfitting.
- ‏retired value חוזר silently כ־stale cached value.
- ‏data subscription נמחק למרות consumer אחר.
- ‏historical replay כבר לא reproducible.
- ‏Reverse Shadow לא קיים ולכן deterioration מזוהה מאוחר.
- ‏מערכת שומרת Feature בגלל sunk cost.

---

## ‏15. User-Specific Application

‏ל־`Short-Horizon Momentum` שלנו, ה־Feature set צריך להתכנס לאורך זמן לסט קטן וברור שמצדיק את latency/complexity שלו.

‏במיוחד חשוב להבחין בין:

```text
Fast-path features
Deep-path features
Veto/safety features
Exit-only features
Research-only features
```

‏Feature כבד אך useful אינו חייב להיעלם — אפשר להעביר אותו ל־Top-N Deep Path. Feature שמשנה כמעט אפס decisions ואינו מוסיף safety value הוא candidate טבעי ל־review. Feature שמוסיף prediction אך פוגע ב־p99 decision latency מעבר ל־Signal Half-Life עלול להיות שלילי נטו.

‏ה־Daily Review של 73 וה־Scanner Diagnostics של 74 צריכים להזין אוטומטית evidence ל־Retirement Queue, אך לא לשנות lifecycle state לבד.

---

## ‏16. Confidence

### ‏High confidence

- ‏`Retire != Delete`.
- ‏Incremental value חשוב יותר מ־standalone correlation לשאלת retirement.
- ‏Ablation/Counterfactual נדרשים כדי להבין contribution.
- ‏safety role חייב להיבדק בנפרד מ־Alpha value.
- ‏historical versions/evidence צריכים להישמר לצורך Replay/RCA.
- ‏latency/dependency/fragility הם חלק אמיתי מערך Feature במערכת Short-Horizon.

### ‏Medium confidence / empirical

- ‏איזה Feature ספציפי redundant.
- ‏איזו family ניתן לפרוש.
- ‏איזה scope/regime מצדיק activation.
- ‏כמה latency saving מספיק כדי להצדיק retirement.
- ‏כמה זמן reverse shadow צריך לרוץ.

‏אלה דורשים Evidence מהמערכת שלנו.

---

## ‏17. Time-Sensitive Facts

‏למקטע הזה אין תלות מרכזית בתקנה, Broker fee או API capability שדורשים snapshot חיצוני נוכחי.

‏כן קיימת תלות בזמן ב־internal reality:

```text
FeatureDefinitionVersion
ModelVersion
ProviderSemantics
ConfigVersion
DependencyGraph
RuntimeConsumers
```

‏לכן כל Retirement Decision חייב להיות versioned ו־As-Of ברור.

---

## ‏18. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Feature פעיל צורך resources ומוסיף dependencies/failure modes.
- ‏removal יכול לשבור consumers, models ו־historical replay.
- ‏Feature importance metrics אינם שקולים ל־counterfactual system value.

### ‏Judgment

- ‏ברירת המחדל שלנו היא `Ablation → Shadow Retirement → Deprecate → Retire → Reverse Shadow`.
- ‏Feature עם value אך cost גבוה ייבחן קודם ל־scope reduction / Deep Path.
- ‏Hard semantic/safety defects עוברים quarantine ולא WATCH בלבד.

### ‏Hypothesis

- ‏מערכת קטנה יותר של Features תשפר אצלנו latency, explainability ו־robustness בלי לפגוע ב־net decision value.
- ‏חלק מ־momentum-related features הקיימים עשויים להיות redundant ברמת family.
- ‏Retirement של low-impact features עשוי להפחית p99 latency ו־failure surface באופן measurable.

---

## ‏19. Minimal Retirement Workflow

```text
Daily Review / Scanner Diagnostics / RCA
→ Evidence accumulation
→ Retirement Candidate
→ Dependency + Role Review
→ End-to-End Ablation
→ Regime / Tail Validation
→ Shadow Retirement
→ Operational Validation
→ DEPRECATED
→ RETIRED
→ Reverse Shadow
→ Keep / Rollback / Archive
```

---

## ‏20. Definition of Done

‏Feature Retirement נחשב בשל כאשר אפשר לענות עבור כל Feature פעיל:

```text
Why does it exist?
What decisions does it change?
What value does it add incrementally?
What does it cost at p95/p99?
Which dependencies and consumers rely on it?
What happens if it is stale/missing?
Is it safety-critical?
Can the system reproduce old decisions without it in active runtime?
What evidence would cause KEEP, REDESIGN or RETIRE?
What is the rollback plan?
```

‏היעד אינו “כמה שפחות Features” בכל מחיר.

‏היעד הוא:

```text
Maximum justified information
with minimum unnecessary complexity.
```
