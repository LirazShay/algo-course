# ‏Cross-Cutting 05 — Recommended Ranking Process

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Features, Filters, Score/Ranking, Candidate Selection, Predictive Validation, Controlled Experiments, Scanner Subtleties ו־Champion/Challenger לתהליך Ranking אחד point-in-time correct, deterministic, explainable וניתן להפרכה עבור מערכת `Short-Horizon Momentum` מחקרית.
>
> ‏המסמך מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי, אינו אישור `Live`, ואינו מגדיר Exposure או מינוף.

---

## ‏1. Decision

‏ה־Ranking Process המומלץ אינו:

```text
compute one score
→ sort descending
→ take #1
→ act
```

‏אלא:

```text
Point-in-Time Eligible Set
→ Comparable Fresh Inputs
→ Small Explainable Predictive Features
→ Simple Versioned Normalization
→ Predictive Score / Ordering
→ Deterministic Cross-Sectional Rank
→ Top-K Snapshot
→ Separation / Stability / Confidence Diagnostics
→ Execution / Cost / Latency Evaluation
→ Economic Re-Rank where evidence supports it
→ Absolute Candidate Gate
→ TRADE_CANDIDATE / HEALTHY_NO_TRADE / UNKNOWN
→ Pre-Effect Revalidation
```

‏העקרונות המחייבים:

```text
Rank #1 != Decision
Relative Best != Absolute Good Enough
Score != Probability
Score != Economic Value
Prediction Rank != Execution Rank
Fresh Rank != Fresh Inputs
High Score cannot compensate for P0 invalidity
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Hard Eligibility לפני Actionable Ranking

‏Ranking actionable מתבצע רק על Candidates שעברו contracts קריטיים כגון:

```text
point-in-time universe membership valid
data quality acceptable
critical inputs sufficiently fresh
feature readiness proven
trading/session status known
instrument identity valid
required execution context available
risk / safety / compliance do not block new simulated/paper risk
```

‏Candidate שנכשלה ב־P0 אינה מקבלת “ציון נמוך”.

‏היא מקבלת:

```text
NOT_ELIGIBLE_FOR_ACTIONABLE_RANK
```

‏מותר לחשב לה Shadow/Research rank בנפרד לצורך counterfactual analysis, אך אסור להחזיר אותה למסלול actionable באמצעות Score גבוה.

### ‏`P0 — Required`: Comparison Context אחד לכל Rank Epoch

‏לכל Ranking Epoch נשמור לפחות:

```text
RankId
RankGeneration
DecisionAsOfTime
RankComputedAt
UniverseVersion
EligibleCount
FreshEligibleCount
FreshCoverageRatio
DataGeneration
FeatureSetVersion
NormalizationVersion
RankingPolicyVersion
ConfigFingerprint
```

‏והשוואה actionable דורשת שה־cross-section יהיה comparable מספיק ל־signal horizon.

‏Rank חדש על Inputs ישנים אינו Fresh Rank אמיתי.

### ‏`P1 — Preferred Default`: Baseline פשוט ומוסבר

‏ה־Champion הראשוני יהיה קטן:

```text
raw validated features
→ robust / percentile normalization
→ small sub-score set
→ fixed versioned weights or lexicographic policy
→ predictive rank
```

‏Baseline משפחות סביר:

```text
Momentum
Activity
Consistency / Stability only if validated
```

‏ו־Diagnostics נפרדים:

```text
DataQuality
Freshness
ExecutionQuality
CostContext
Confidence
```

‏לא כל Diagnostic חייב להשתתף ב־Prediction Score.

### ‏`P0 — Required`: Non-Compensable Evidence נשאר מחוץ ל־Score

‏לא נבנה נוסחה שבה:

```text
strong momentum
+ stale quote
+ unknown state
+ poor exit feasibility
=
medium score
```

‏במקום זאת:

```text
Positive Predictive Evidence
Negative Evidence / Veto
Execution Feasibility
Risk / Safety / Compliance
```

‏נשמרים כערוצים נפרדים.

### ‏`P1 — Preferred Default`: Prediction Rank קודם, Execution/Economic Evaluation אחריו

‏ה־baseline:

```text
Prediction Rank
→ Top-K
→ Execution / Cost / Latency evaluation
→ Candidate Gate
```

‏כאשר Cost/Execution models מספיק אמינים, אפשר להוסיף:

```text
ExpectedNetEdgeRank
```

‏כ־secondary/economic ranking.

‏אבל אין למהר למחוץ Prediction, fill probability, spread, slippage, latency ו־exit feasibility לציון יחיד שאי־אפשר לבצע לו RCA.

### ‏`P0 — Required`: Top-K הוא Evidence Artifact

‏לכל Rank Epoch משמעותי נשמור Top-K קטן לפחות, ובמחקר את כל eligible set כאשר העלות סבירה.

‏לכל Candidate ב־Top-K:

```text
InstrumentId
Rank
RawScore
NormalizedScore
SubScores
RawFeatures
NormalizedFeatures
FeatureContributions
InputAges
QualityStates
PredictionDiagnostics
ExecutionDiagnostics
ExpectedCosts when modeled
ExpectedNetEdge when modeled
RankGapToLeader
ReasonCodes
```

‏כך אפשר לענות:

```text
Why #1?
Why not #2?
Was #1 materially separated?
Did #2 later outperform?
```

### ‏`P0 — Required`: Deterministic Ranking ו־Tie-Breaking

‏אותו:

```text
Frozen Input State
+ Versions
+ AsOfTime
+ Config
```

‏חייב להפיק אותו:

```text
Eligibility
Scores
Ranks
TieBreaks
ReasonCodes
```

‏Tie-breaker אינו רשאי להיות תלוי ב־hash iteration, thread scheduling או arrival order מקרי.

‏Fallback סופי יכול להיות `CanonicalInstrumentId` יציב לאחר criteria מהותיים יותר.

### ‏`P1 — Preferred Default`: Rank Gap הוא Diagnostic לפני שהוא Rule

‏נשמור:

```text
Gap1To2
Gap1To5
PercentileGap
ExpectedEdgeGap when available
ScoreDistribution
```

‏אבל:

```text
large gap + weak absolute quality != actionable
small gap + strong opportunity set != automatic reject
```

‏Gap, compression ו־noise floor מקבלים Gate רק לאחר OOS calibration.

### ‏`P1 — Preferred Default`: Rank Stability / Churn נמדדים לפני Hysteresis

‏נמדוד:

```text
Rank1ChangesPerSecond
TopKTurnover
CandidateDwellTime
RankVolatility
CandidateReentryRate
ScoreVelocity when researched
```

‏Rank churn אינו יוצר Order churn אוטומטי.

‏Persistence אינה מקבלת threshold קשיח לפני Evidence שמראה incremental value.

### ‏`P0 — Required`: Relative Rank + Absolute Gate

‏תמיד יהיה Leader.

‏לכן:

```text
SelectedCandidate
=
RelativeBestEnough
AND
AbsoluteGoodEnough
AND
ExecutionFeasibleEnough
AND
CriticalStateKnown
```

‏Absolute gate יכול להשתמש, לפי maturity של evidence, ב־:

```text
minimum predictive quality
minimum data confidence
minimum executable quality
minimum remaining net edge
maximum staleness / cost / uncertainty
```

‏Thresholds מדויקים הם Hypotheses וצריכים sweep, sensitivity, OOS ו־walk-forward.

### ‏`P0 — Required`: Candidate Ladder היא Reason-Aware

‏אם #1 נפסלת מסיבה מקומית:

```text
CandidateLocalReject
→ evaluate #2
```

‏אם הכשל הוא global:

```text
CrossSectionNotTrusted
SystemNotReady
CriticalStateUnknown
→ no actionable candidate
```

‏אין “לרדת ברשימה” כדי לעקוף failure גלובלי.

### ‏`P0 — Required`: Revalidation אחרי Ranking

‏Rank הוא snapshot, לא הרשאה מתמשכת.

‏לפני מעבר ל־Entry/Execution Simulation נבדוק מחדש לפי policy:

```text
candidate still eligible?
critical inputs still fresh?
rank / score still within allowed state?
spread / liquidity context still valid?
negative evidence changed?
remaining edge still viable?
execution/risk/compliance state still known?
```

‏כשל כאן הוא:

```text
NO_TRADE_REVALIDATION
```

‏ולא “פספוס”.

---

## ‏3. Why

‏Cross-sectional ranking בוחר extreme מתוך אלפי observations ולכן חשוף במיוחד ל־:

```text
Winner's Curse
stale-input advantage
coverage bias
normalization artifacts
double-counted features
parameter overfit
scheduling bias
score compression
noise-driven leader switching
```

‏לכן תהליך Ranking טוב חייב להוכיח לא רק שהוא ממיין, אלא שהמיון עצמו מכיל מידע עתידי שימושי מעבר ל־baselines פשוטים.

‏הפרדה בין Prediction לבין Execution גם מאפשרת RCA:

```text
Weak gross predictive ordering
!=
Good prediction destroyed by costs
```

---

## ‏4. Use When

‏התהליך מתאים כאשר:

- ‏יש Universe רחב point-in-time.
- ‏קיים eligible set אמין.
- ‏Features timestamped ו־versioned.
- ‏רוצים להשוות Candidates באותו Decision Epoch.
- ‏נדרש Top-K evidence ולא Winner בלבד.
- ‏רוצים למדוד incremental value של Feature/Weight/Policy חדש.
- ‏נדרש Champion/Challenger comparison על אותם contexts.

---

## ‏5. Do Not Use When

‏Ranking אינו actionable כאשר:

```text
cross-sectional freshness insufficient
eligible set incomplete / unknown
feature readiness mixed unexpectedly
normalization population invalid
versions mixed unintentionally
rank generation stale after reconnect/change
critical execution/risk/compliance state unknown
```

‏במקרים אלה אפשר להמשיך diagnostics/research אם הם מסומנים בבירור, אך לא להציג Winner כאילו הוא comparable leader תקין.

---

## ‏6. Alternatives

### ‏`P1 — Baseline`: Single-Feature Rank

‏לדוגמה Feature momentum יחיד.

‏זה Baseline חשוב שכל Score מורכב צריך לנצח.

### ‏`P1 — Preferred`: Weighted Percentile / Robust Rank

‏פשוט, explainable ומתאים ל־Cross-Sectional baseline.

### ‏`P2 — Useful`: Lexicographic Ranking

‏מתאים כאשר חשוב לשמר priority ברור בין criteria בלי compensation מלא.

### ‏`P2/P3 — Challenger`: Expected Net Edge Ranking

‏מועיל כאשר Prediction, costs ו־execution models כבר calibrated מספיק.

### ‏`P3 — Advanced`: Cohort / Regime-aware Ranking

‏רק אם overall normalization מוכחת כלא הוגנת בין cohorts והרווח נשמר OOS.

### ‏`P4 — Specialist`: ML / Learning-to-Rank

‏רק לאחר strong simple baseline, labels אמינים, multiple-testing discipline ו־walk-forward תקין.

---

## ‏7. Trade-offs

### ‏Simplicity vs Expressiveness

‏Score פשוט מפספס interactions אפשריים, אך מקטין overfit ומקל על RCA.

### ‏Relative Rank vs Absolute Meaning

‏Percentile מצוין להשוואה אך תמיד מייצר winner; לכן Absolute Gate נדרש בנפרד.

### ‏Prediction Purity vs Economic Objective

‏Prediction Rank נקי מאפשר להבין Alpha signal; Expected Net Edge קרוב יותר ליעד הכלכלי אך תלוי בהרבה מודלי משנה.

### ‏Freshness vs Cross-Sectional Fairness

‏לא תמיד אפשר simultaneity מושלמת. צריך comparison cut מספיק הוגן ביחס ל־signal half-life, לא המתנה אינסופית ל־snapshot מושלם.

### ‏Stability vs Speed

‏Hysteresis יכול להפחית noise אך גם לעכב signal אמיתי. לכן אינו Baseline לפני measurement.

---

## ‏8. What I Would Avoid Initially

‏לא להתחיל עם:

- ‏עשרות Features ומשקלים.
- ‏dynamic weights לפי Symbol/שעה ללא Evidence.
- ‏Score יחיד שמערבב Prediction, Data Validity, Execution ו־Risk.
- ‏Confidence number שמתחזה להסתברות בלי calibration.
- ‏Hysteresis קשיח לפני מדידת churn.
- ‏aggressive candidate switching.
- ‏ML / Learning-to-Rank לפני baseline פשוט.
- ‏symbol-specific score formulas.
- ‏auto-tuning לפי יום אחרון.
- ‏thresholds שנבחרו כי “נראו טוב” על holdout שנפתח שוב ושוב.
- ‏Top-1-only logging.

---

## ‏9. What to Add Later

‏בסדר עדיפות משוער:

1. ‏Rank-gap calibration.
2. ‏Persistence / dwell-time research.
3. ‏Rank-churn diagnostics.
4. ‏Score/rank velocity אם מוסיף Decision Value.
5. ‏Expected Net Edge secondary rank.
6. ‏Cohort/regime-aware normalization.
7. ‏Uncertainty / empirical noise bands.
8. ‏Hysteresis רק לאחר validation.
9. ‏Pareto / lexicographic challengers.
10. ‏ML / Learning-to-Rank.

---

## ‏10. Required Data / Evidence

‏לכל Rank Epoch נשמור לפחות:

```text
RankId
DecisionEpoch
AsOfTime
RankComputedAt
UniverseVersion
ExpectedUniverseCount
EligibleCount
FreshEligibleCount
FreshCoverageRatio
DataGeneration
FeatureSetVersion
NormalizationVersion
RankingPolicyVersion
ConfigFingerprint
TopK
```

‏לכל Candidate רלוונטית:

```text
Rank
RawFeatures
NormalizedFeatures
SubScores
FinalScore
Contributions
FeatureAsOfTimes
InputAges
QualityStates
EligibilityState
NegativeEvidenceState
ExecutionDiagnostics
ExpectedCosts
ExpectedNetEdge when modeled
ReasonCodes
```

‏Labels/Outcomes למחקר:

```text
ForwardOutcomeByHorizon
MFE
MAE
TimeToFirstPositiveOutcome
TimeToTarget
ExecutableOutcome
SimulatedNetOutcome
CounterfactualTopKOutcomes
```

---

## ‏11. Promotion Criteria

‏Ranking challenger מתקדם רק אם:

- ‏ה־planned diff מול Champion ברור ומצומצם.
- ‏אותם comparable contexts משמשים את שתי הגרסאות.
- ‏Rank buckets מראים ordering signal OOS.
- ‏Top-1 / Top-K premium משתפר מול simple baselines.
- ‏השיפור נשמר ב־Executable/Net evaluation הרלוונטי.
- ‏אין P0 correctness/safety regression.
- ‏ה־disagreement set מראה incremental decision value.
- ‏השיפור שורד periods/regimes/liquidity buckets מספיקים.
- ‏אין תלות בנקודת weight/threshold חדה אחת.
- ‏Complexity/latency/monitoring tax מוצדקים.
- ‏Replay reproduces the result.

---

## ‏12. Rejection Criteria

‏נדחה או נחזיר למחקר Ranking change כאשר:

- ‏הוא מנצח רק in-sample.
- ‏אין monotonicity או premium מעבר ל־baseline פשוט.
- ‏Top-1 משתפר אך tails/guardrails נפגעים מהותית.
- ‏השיפור נעלם אחרי costs/execution realism.
- ‏רוב ה־gain מגיע מ־coverage/freshness artifact.
- ‏ה־Winner תלוי ב־iteration/scheduling nondeterminism.
- ‏נדרשים exceptions רבים כדי לשמר את התוצאה.
- ‏ה־disagreement set קטן או לא מייצג מספיק.
- ‏השיפור תלוי ב־holdout מזוהם.
- ‏ה־complexity tax גבוה מה־incremental value.

---

## ‏13. Metrics

### ‏Ranking Quality

```text
Top1Premium
TopKPremium
RankBucketMonotonicity
SpearmanIC when useful
SelectionRegret
PredictionLift
```

### ‏Separation / Stability

```text
Gap1To2
Gap1To5
ScoreCompression
Rank1ChangesPerSecond
TopKTurnover
CandidateDwellTime
RankVolatility
```

### ‏Correctness / Fairness

```text
FreshCoverageRatio
FreshnessSkew
RankParityReplay
IterationOrderInvariance
MixedVersionRate
UnknownEligibilityRate
```

### ‏Decision Impact

```text
DisagreementRate
UsefulDisagreementRate
HarmfulDisagreementRate
DecisionImpactRate
CandidateFallbackRate
RevalidationFailureRate
```

### ‏Economics

```text
GrossPredictiveOutcome
ExecutableOutcome
SimulatedNetOutcome
ExpectedCost
LatencyTax
AdverseSelectionEstimate
```

---

## ‏14. Failure Modes

### ‏`Winner's Curse`

‏הקיצון מתוך אלפי Symbols הוא Noise מוגבר.

### ‏`Relative-Best Trap`

‏#1 נבחר ביום שבו כולם חלשים.

### ‏`Fresh-Leader Bias`

‏Symbol שקיבל update אחרון מקבל יתרון לא מוצדק.

### ‏`Score Spaghetti`

‏bonuses/penalties/exceptions רבים ללא causal story.

### ‏`Execution Compensation`

‏Signal גבוה מסתיר execution state בלתי־קביל.

### ‏`Top-1 Blindness`

‏לא נשמרים losers ולכן אין counterfactual או RCA.

### ‏`Rank Churn → Action Churn`

‏כל החלפת Leader גורמת לשינוי פעולה למרות state durable קיים.

### ‏`Hidden Tie Bias`

‏Winner נקבע לפי ordering מקרי.

### ‏`Threshold Cliff`

‏תוצאה תלויה במספר קסם אחד ללא robust region.

### ‏`Holdout Shopping`

‏Weights/metrics משתנים שוב ושוב לאחר צפייה בתוצאות.

---

## ‏15. User-Specific Application

‏למערכת המחקרית הזו, שמטרתה לזהות במהירות Candidates חזקים יחסית מתוך Universe רחב, ההמלצה היא לשמור על Ranking **פשוט לאחר elimination קשיח**:

```text
Data / Freshness / Eligibility elimination
→ small explainable predictive ordering
→ Top-K
→ explicit negative evidence
→ execution/economic evaluation
→ absolute gate
```

‏אם רוצים להעדיף פילטרים על פני `Score` מורכב, אין צורך לשנות את כל הארכיטקטורה: אפשר לשמור את אותם contracts ולהשתמש ב־lexicographic / rule-based ordering בין ה־survivors כ־Champion או Challenger. מה שאסור לאבד הוא Top-K evidence, deterministic ordering, absolute gate ו־predictive validation.

‏ה־Ranking אינו צריך להתחרות ב־microseconds. הוא צריך לסיים בזמן שמותיר מספיק Signal Half-Life ל־revalidation ול־Paper/Simulation path, והערך של optimization נמדד לפי `Edge Retention`, לא לפי latency נמוכה כשלעצמה.

---

## ‏16. Confidence

### ‏High

‏ב־principles:

- ‏Hard Eligibility לפני Rank.
- ‏Top-K ולא Winner בלבד.
- ‏Relative Rank נפרד מ־Absolute Gate.
- ‏Prediction ו־Execution אינם אותו axis.
- ‏Deterministic ordering/versioning.
- ‏OOS predictive validation לפני complexity.
- ‏Critical invalid/unknown state אינו בר־פיצוי.

### ‏Medium

‏ב־defaults:

- ‏percentile/robust normalization.
- ‏fixed-weight simple score.
- ‏Top-K size קטן.
- ‏Fast predictive rank ולאחריו economic evaluation.

### ‏Low / Requires Experiment

‏ב־:

- ‏משקלים מדויקים.
- ‏feature family composition.
- ‏rank-gap thresholds.
- ‏persistence/hysteresis thresholds.
- ‏expected-net-edge calibration.
- ‏regime-specific ranking.

---

## ‏17. Time-Sensitive Facts

‏ה־Ranking architecture עצמה אינה תלויה ב־Broker או Provider מסוים.

‏כל dependency שמשפיעה על Inputs או economics — למשל feed coverage/semantics, fees, execution capabilities, trading status semantics או API behavior — נשארת Reference versioned ודורשת אימות עדכני לפני שימוש תפעולי רלוונטי.

---

## ‏18. Fact / Judgment / Hypothesis

### ‏Fact

- ‏מיון של eligible set לא ריק מייצר Leader גם אם האיכות המוחלטת חלשה.
- ‏ללא Top-K/rejected candidates אי־אפשר למדוד היטב selection regret או winner-specific attribution.
- ‏אם Inputs/versions/as-of context אינם נשמרים, replay מדויק של Rank אינו אפשרי.
- ‏Score ידני עדיין מהווה model עם assumptions ו־parameters.

### ‏Judgment

- ‏להתחיל ב־simple explainable ranking לאחר hard elimination.
- ‏לשמור Prediction Rank ו־Execution/Economic evaluation בנפרד.
- ‏להשתמש ב־Top-K, deterministic tie-breaks ו־absolute gate כבר ב־baseline.
- ‏לא להכניס Hysteresis, ML או regime-specific weights לפני Evidence.

### ‏Hypothesis

- ‏Cross-sectional short-horizon features יכולים ליצור ordering בעל predictive value.
- ‏Top-ranked Candidates יכולים להציג premium עקבי על פני ranks נמוכים יותר.
- ‏ה־premium יכול לשרוד costs, latency ו־execution assumptions שמרניים.

---

## ‏19. Recommended Ranking Baseline

```text
Point-in-Time Eligible Set
→ Freshness / Fairness Gate
→ Small Versioned Feature Set
→ Robust / Percentile Normalization
→ Simple Predictive Ordering
→ Deterministic Tie-Break
→ Top-K Snapshot
→ Rank Gap / Churn / Persistence Diagnostics
→ Negative Evidence
→ Execution / Cost / Latency Evaluation
→ Absolute Quality Gate
→ Candidate Ladder
→ TRADE_CANDIDATE / HEALTHY_NO_TRADE / UNKNOWN
→ Revalidation
→ Outcome Labels
→ OOS / Replay / Champion-Challenger Review
```

---

## ‏20. Bottom Line

‏ה־Ranking Process המומלץ אינו נועד “למצוא תמיד מקום ראשון”.

‏הוא נועד ליצור **השוואה הוגנת, מוסברת וניתנת להפרכה** בין Candidates, ולשמור מספיק Evidence כדי לדעת האם המקום הראשון באמת היה טוב יותר, האם ההבדל היה מהותי, והאם היתרון נשאר לאחר friction.

```text
Rank to compare.
Gate to decide.
Replay to verify.
Experiment to improve.
```