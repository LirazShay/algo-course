# ‏Cross-Cutting 11 — Recommended Backtest Policy

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Timeline Integrity, Execution Backtest, Leakage/Validation, Backtest Subtleties, Research Stack, Costs, Risk ו־Replay למדיניות `Backtest` אחת causal, point-in-time, execution-aware, reproducible ו־explicit לגבי uncertainty עבור `Research / Replay / Shadow / Paper`.
>
> ‏המסמך אינו תחזית רווח ואינו אישור `Live`. ‏Backtest משמש כאן כמכשיר ליצירת Evidence, להפרכת Hypotheses ולבדיקת התנהגות המערכת תחת היסטוריה ידועה — לא כהבטחה למה שיקרה בעתיד.

---

## ‏1. Decision

‏`Backtest` אצלנו אינו:

```text
Historical Prices
→ Buy at a convenient price
→ Sell at a convenient price
→ Report PnL
```

‏אלא:

```text
Historical Market Reality
→ What Was Knowable As-Known-At
→ Point-in-Time Universe
→ Canonical State
→ Strategy State
→ Features / Eligibility / Ranking / Vetoes
→ TRADE / NO_TRADE / UNKNOWN
→ Execution Assumptions
→ Fill / Partial / No Fill / Cancel / Unknown
→ Position / Exit / TimeToFlat
→ Costs / Slippage / Impact / Markout
→ Net Executable Outcome
→ Validation / Stress / Attribution / RCA
→ Immutable Evidence Artifact
```

‏ה־Backtest צריך לענות לשתי שאלות נפרדות:

```text
Predictive question:
Did the information available at T predict useful future outcomes?

Executable question:
Could the resulting decision have produced acceptable net outcome
under a defensible execution model?
```

‏העיקרון המחייב:

```text
Backtest credibility
>
Backtest profitability
```

‏Run רווחי עם leakage, survivorship bias, impossible fills או cost assumptions חלשים הוא Evidence חלש יותר מ־Run שלילי אבל causal ו־reproducible.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Point-in-Time / `As-Known-At` הוא החוק העליון

‏בכל `DecisionTime = T` המערכת רשאית להשתמש רק במידע שהיה מותר לה לדעת עד `T` לפי availability semantics של ה־Dataset.

```text
FeatureInputAvailableAt <= T
UniverseFactAvailableAt <= T
EligibilityFactAvailableAt <= T
NormalizationFitData <= T where applicable
DecisionInputAvailableAt <= T
```

‏אין להשתמש ב־:

```text
future nearest observation
future-aware cleanup
end-of-day statistic intraday
future universe membership
future corporate-action knowledge
future label in feature path
later corrected data as if known earlier
```

‏אם causal ordering אינו ניתן להוכחה:

```text
RUN_INVALID_FOR_EVIDENCE
```

### ‏`P0 — Required`: ‏Historical Reality נפרדת מ־Observed Reality

‏נשמור ארבע שכבות Truth:

```text
HistoricalMarketReality
ObservedOrAvailableReality
StrategyDecisionReality
ExecutionReality
```

‏אירוע שאכן התרחש בשוק אינו בהכרח אירוע שהמערכת הייתה יכולה לדעת עליו בזמן.

‏ומחיר שהיה קיים בשוק אינו בהכרח מחיר שבו Order שלנו הייתה יכולה להתמלא.

### ‏`P0 — Required`: ‏Point-in-Time Universe אמיתי ככל האפשר

‏בכל `T` נשתמש ב־:

```text
Universe(T)
```

‏ולא ב־Universe של היום.

‏ה־Universe ההיסטורי צריך לשקף ככל שהנתונים מאפשרים:

```text
listing state
security identity
symbol mapping
tradability
session state
halts / pauses
eligibility facts
```

‏מניה שנעלמה בהמשך אינה נמחקת מהעבר.

### ‏`P0 — Required`: ‏Timestamp Semantics מפורשים

‏כאשר קיימים, נפריד:

```text
ExchangeEventTime
ProviderTime
ReceiveTime
ProcessTime
FeatureReadyTime
RankingTime
DecisionTime
SubmitTime
ArrivalTime
FillTime
```

‏כאשר ה־Dataset אינו מכיל אחד מהם, לא ממציאים precision.

‏במקום זאת נשמור:

```text
AvailableTimeSemantics
MissingTimeSemantics
AssumedDelayModel
FidelityLimitations
```

### ‏`P0 — Required`: ‏Deterministic Event Ordering

‏כאשר כמה Events חולקים אותו timestamp או שהרזולוציה אינה מספיקה, משתמשים ב־tie-breaker מפורש ו־versioned.

‏אותו:

```text
Dataset
+ Code
+ Config
+ Versions
+ Seed
```

‏חייב להפיק:

```text
Same Decisions
+ Same Simulated State
+ Same Results
```

‏אי־דטרמיניזם לא מתוכנן הוא failure של תשתית המחקר.

### ‏`P0 — Required`: ‏Features ו־Future Labels מופרדים ארכיטקטונית

```text
Raw / Canonical Historical Events
→ Point-in-Time Feature Builder
→ Decision Snapshot freezes
→ Future Label Builder
```

‏`Label Builder` רשאי לקרוא את העתיד של `T`.

‏`Feature Builder` לא.

### ‏`P0 — Required`: ‏Missing נשאר Missing

‏כאשר אין historical anchor תקין:

```text
feature_value = null
feature_valid = false
```

‏לא משתמשים ב־future observation כדי להשלים חור.

‏Interpolation או fallback, אם נחקרים, הם Modes מפורשים עם version ו־Evidence נפרד.

### ‏`P1 — Preferred Default`: ‏שלוש רמות Backtest

‏לא נבנה מיד simulator כבד לכל Hypothesis.

```text
Level 1 — Fast Causal Screening
Level 2 — Event-Level Realistic Execution Backtest
Level 3 — Stress / Uncertainty Envelope
```

#### ‏`Level 1 — Fast Causal Screening`

‏נועד לבדוק:

```text
Does the signal predict?
Does ranking order future outcomes?
Do filters / vetoes improve selection?
Is the candidate process coherent?
```

‏הוא מתאים ל־:

```text
feature screening
rank buckets
forward labels
ablation
candidate analysis
```

‏והוא **אינו** הוכחת profitability או execution.

#### ‏`Level 2 — Event-Level Realistic Execution Backtest`

‏נדרש עבור variants ששורדים `Level 1`.

‏יכלול לפחות לפי רמת הנתונים:

```text
Bid / Ask
DecisionToSubmitDelay
Arrival state
Signal / Intent / Order TTL
Hard price bounds
Pre-submit revalidation
Fill / Partial / No Fill
Cancel lifecycle
Position state
Exit lifecycle
Entry + Exit costs
TimeToFlat
Pending exposure where relevant
```

#### ‏`Level 3 — Stress / Uncertainty Envelope`

‏אותה Strategy נבדקת תחת assumptions פחות נוחים אך סבירים:

```text
latency higher
spread wider
slippage worse
depth lower
fill probability lower
exit friction higher
adverse selection worse
data degradation higher
```

‏המטרה היא לא לנחש worst case אינסופי, אלא לזהות:

```text
Edge Headroom
Break-Even Assumption
Fragility Cliff
```

### ‏`P0 — Required`: ‏`Last` אינו Fill Model

‏נשמור בנפרד:

```text
ReferencePrice
ExecutablePrice
SimulatedFillPrice
```

‏ל־Long aggressive entry, למשל, execution feasibility נשענת על הצד המוכר של ה־book ולא על `Last` בלבד.

‏ל־Exit נדרש side-aware executable state באותה רמת fidelity.

### ‏`P0 — Required`: ‏Arrival State, לא Signal State, קובע Execution

```text
Signal at T0
Decision at T1
Submit at T2
Arrival at T3
```

‏ה־Execution simulation משתמש ב־market state שהיה זמין סביב `T3` לפי ה־model.

‏לא קונים בדיעבד ב־quote שהיה ב־`T0` אם המחיר השתנה לפני arrival.

### ‏`P0 — Required`: ‏`Touch != Fill`

‏Passive Order אינה מתמלאת רק כי price touched.

‏אם אין Queue data איכותי, נשתמש ב־fill model שמרני יותר ונצהיר על uncertainty.

‏למחקר Passive רציני נשמור לפחות:

```text
FillModelVersion
FillConfidence
QueueModelVersion when used
```

### ‏`P0 — Required`: ‏Fill Fidelity Envelope

‏כאשר fill uncertainty מהותית, נריץ לפחות:

```text
Optimistic
Base
Conservative
```

‏Variant שחי רק ב־`Optimistic` אינו promotion candidate.

### ‏`P0 — Required`: ‏Partial Fill משנה Position מיד

‏כל Fill event מעדכן:

```text
FilledQty
AvgFillPrice
ActualPosition
RemainingWorkingQty
PotentiallyLiveQty
PendingExposure
ExitObligation
```

‏Position truth נגזרת מ־Fill Ledger, לא מה־requested quantity.

### ‏`P0 — Required`: ‏Cancel/Replace אינם Atomic Assumptions

‏Backtest execution-aware צריך לאפשר lifecycle כגון:

```text
CancelRequested
→ Fill
→ CancelConfirmed
```

‏וכאשר Replace עשוי ליצור overlap, המודל חייב לשמור potential exposure בצורה שמרנית.

### ‏`P0 — Required`: ‏Entry ו־Exit באותה רמת Realism

‏אסור:

```text
realistic entry
+
perfect exit
```

‏או ההפך.

‏אותם עקרונות חלים על שני הצדדים:

```text
latency
freshness
side-aware price
slippage
partial fills
fees
cancel state
```

### ‏`P0 — Required`: ‏Forward Return אינו PnL

‏נשמור בנפרד:

```text
ForwardReturn
ExecutableGrossOutcome
ExecutableNetOutcome
```

‏`ForwardReturn` מודד predictive quality.

‏הוא אינו הוכחה ל־Fill או ל־Net Edge.

### ‏`P1 — Preferred Default`: ‏Path Metrics, לא Endpoint בלבד

‏נמדוד לפי Hypothesis מספר horizons ו־path metrics כגון:

```text
ForwardReturn
MFE
MAE
ExecutableMFE
ExecutableMAE
TimeToFirstFavorableMove
TimeToFirstExecutableNetPositive
TimeToTarget
TimeToFlat
Giveback
```

‏`MFE` ו־`MAE` הם labels/diagnostics — לא מחירי Exit קסומים.

### ‏`P0 — Required`: ‏Stateful Portfolio / Capital Simulation

‏Backtest אינו אוסף signals בלתי־תלויים.

‏אם policy אומרת position אחת, capital אחד או pending exposure, ההיסטוריה חייבת לכבד זאת.

‏State יכלול לפי הצורך:

```text
FLAT
ENTERING
OPEN
EXITING
RECOVERING
```

‏Signal חדש בזמן exposure מטופל לפי policy versioned ולא מקבל capital דמיוני נוסף.

### ‏`P0 — Required`: ‏`NO_TRADE` ו־`UNKNOWN` הם Outcomes אמיתיים

‏Backtest אינו מכריח עסקה בכל decision epoch.

‏נשמור:

```text
TRADE
NO_TRADE
UNKNOWN / NOT_READY
```

‏ואת `ReasonCodes` שלהם.

‏כך ניתן להבחין בין:

```text
healthy no opportunity
```

‏לבין:

```text
insufficient evidence / broken data / unavailable decision
```

### ‏`P0 — Required`: ‏Whole-Market Ranking באמת Cross-Sectional

‏בכל Decision Epoch:

```text
build eligible historical cross-section
→ compute comparable features
→ rank all eligible symbols
→ persist Top-K
→ apply candidate gate
```

‏לא בוחרים בדיעבד symbols שכבר ידוע שהצליחו.

### ‏`P1 — Preferred Default`: ‏Top-K נשמר, לא רק Winner

‏נשמור מספיק candidates כדי למדוד:

```text
RankBucketOutcomes
Top1Premium
RankGap
SelectionRegret
CandidateRecall
MissedWinnerAnalysis
```

‏כך ה־Backtest יכול להסביר selection quality ולא רק final PnL.

### ‏`P0 — Required`: ‏Historical Data Quality הוא חלק מה־Timeline

‏נשמור statuses כמו:

```text
NO_EVENT
NO_CHANGE
MISSING_DATA
STALE_DATA
FEED_GAP
OUT_OF_ORDER
DUPLICATE
CORRECTED
```

‏`NoChange != NoData`.

‏Future-aware cleaning אינו רשאי לשנות historical decision כאילו התיקון היה ידוע בזמן אמת.

### ‏`P0 — Required`: ‏Costs הם Versioned Model

‏Net result משתמש ב־Cost Model מפורש, לא ב־commission constant מוסתר.

‏המודל יכול לכלול לפי fidelity:

```text
explicit fees
spread
slippage
market impact
adverse selection
opportunity cost as diagnostic
```

‏ה־Cost Model נשמר עם:

```text
CostModelVersion
Assumptions
CalibrationWindow
Provenance
```

### ‏`P0 — Required`: ‏Latency היא Model/Distribution, לא מספר קסם

‏Constant latency מותר ל־screening.

‏לפני Evidence חזק יותר נעדיף:

```text
p50 / p90 / p95 / p99
```

‏או empirical distribution כאשר היא קיימת.

‏נבדוק גם sensitivity curve:

```text
NetOutcome(latency)
FillQuality(latency)
TimeToFlat(latency)
```

### ‏`P1 — Preferred Default`: ‏Correlated Stress

‏במצבי עומס, failures אינם תמיד בלתי־תלויים.

‏Stress חשוב יכלול episodes שבהם יחד:

```text
market activity rises
processing latency rises
spread widens
depth falls
queue / backlog grows
```

‏זו בדיקה חשובה במיוחד ל־short-horizon system.

### ‏`P0 — Required`: ‏Research Split כרונולוגי

‏ל־Confirmation:

```text
Discovery / Train
→ Validation
→ Locked Test
→ Walk-Forward
→ Shadow / Paper evidence later
```

‏`Random Split` אינו baseline ל־time-series decision process.

### ‏`P0 — Required`: ‏Locked Test אינו Sandbox

‏לפני Test מקפיאים לפחות:

```text
Hypothesis
FeatureSet
Eligibility / Vetoes
RankingPolicy
EntryPolicy
ExitPolicy
ExecutionModel
CostModel
PrimaryMetric
AcceptanceCriteria
```

‏שינוי לאחר צפייה ב־Test מזהם אותו ודורש version/holdout חדש.

### ‏`P0 — Required`: ‏Human Feedback יכול לזהם Test

‏גם אם הקוד לא קרא את העתיד, רצף כזה מזהם:

```text
see test result
→ invent change
→ rerun same test
```

‏לכן `Experiment Registry` שומר גם experiment history וכישלונות.

### ‏`P0 — Required`: ‏Primary Metric ו־Guardrails מוגדרים לפני Result

‏לא עושים metric shopping.

‏כל Experiment מגדיר:

```text
PrimaryMetric
SecondaryDiagnostics
Guardrails
PromotionCriteria
RejectionCriteria
```

‏שינוי ה־Primary Metric אחרי Result הוא Experiment חדש.

### ‏`P1 — Preferred Default`: ‏Walk-Forward אחרי Baseline Split

‏נבדוק stability על periods עוקבים ולא רק Holdout יחיד.

‏ניתן להשוות:

```text
Expanding Window
Rolling Window
```

‏אך הבחירה ביניהם נשארת hypothesis ולא dogma.

### ‏`P0 — Required`: ‏Immutable Dataset + Immutable Run Artifact

‏כל Run יקושר לפחות ל־:

```text
BacktestRunId
DatasetId
DatasetFingerprint
CodeCommit
ConfigFingerprint
StrategyVersion
UniverseVersion
FeatureVersion
RankingVersion
EntryPolicyVersion
ExitPolicyVersion
ExecutionModelVersion
CostModelVersion
RiskPolicyVersion
RandomSeed
RunMode
StartedAt
```

‏Result שהושלם אינו נערך בדיעבד.

‏שינוי Code/Data/Config יוצר Run חדש.

### ‏`P1 — Preferred Default`: ‏Historical/Replay/Shadow Parity

‏ככל האפשר נשתמש באותם:

```text
Canonical Event Schemas
Feature Code
Eligibility Code
Ranking Code
Decision Code
Exit Logic
Reason Codes
```

‏בין `Backtest`, ‏`Replay`, ‏`Shadow` ו־`Paper`.

‏Adapter ו־fill model יכולים להשתנות, אבל business semantics צריכות להישאר comparable.

---

## ‏3. Why

### ‏Fact

‏Backtest יכול להציג תוצאה מצוינת גם כאשר הוא משתמש במידע עתידי, Universe שגוי או execution assumptions שאינם אפשריים.

### ‏Fact

‏`Last`, ‏`Touch` ו־trigger price אינם guarantees למחיר Fill.

### ‏Fact

‏Partial fill, cancel race, latency ו־costs יכולים לשנות materially את outcome של short-horizon strategy.

### ‏Fact

‏אותו Test period מפסיק להיות holdout אמיתי לאחר שהוא משמש לבחירת model/rule/parameter.

### ‏Judgment

‏לפרויקט הזה עדיף Backtest ladder של שלוש שכבות מאשר simulator אחד כבד שמשמש לכל שאלה.

### ‏Judgment

‏Causal correctness ו־execution realism חשובים יותר מתוספת feature complexity כאשר בונים Evidence בסיסי.

### ‏Hypothesis

‏אם ה־Edge אמיתי ומתאים ל־seconds horizon, הוא צריך להישאר חיובי או לפחות informative תחת טווח סביר של latency, fill ו־cost assumptions — לא רק תחת cell אופטימי יחיד.

---

## ‏4. Use When

‏המדיניות מתאימה ל־:

- ‏Feature ו־Ranking research.
- ‏Candidate/Veto validation.
- ‏Entry/Exit policy comparison.
- ‏Execution policy comparison.
- ‏Cost sensitivity.
- ‏Latency sensitivity.
- ‏Risk/state-machine research.
- ‏Champion/Challenger comparison.
- ‏RCA של historical episodes.
- ‏Promotion מ־Discovery ל־Validation/Replay/Shadow.

---

## ‏5. Do Not Use When

‏אין להתייחס ל־Backtest כ־Evidence חזק כאשר:

- ‏`as_of_time` או availability semantics אינם ידועים.
- ‏Historical universe אינו point-in-time.
- ‏Dataset fidelity נמוכה מה־claim.
- ‏Fill model מניח `touch = fill` ללא qualification.
- ‏Costs/latency chosen after seeing results.
- ‏Entry realistic אך Exit idealized.
- ‏Test set שימש tuning חוזר.
- ‏Capital/position constraints אינן משוחזרות.
- ‏Backtest רץ רק על winners שנבחרו בדיעבד.
- ‏Result אינו reproducible מ־immutable artifacts.

‏במקרים כאלה התוצאה יכולה לשמש Exploration בלבד, לא Promotion Evidence.

---

## ‏6. Alternatives

### ‏Alternative A — Signal-Only Vectorized Research

‏מהיר מאוד ל־screening.

‏שימוש מומלץ:

```text
P1 fast discovery tool
```

‏לא להציג אותו כ־execution evidence.

### ‏Alternative B — Event-Level Backtest

‏ברירת המחדל ל־surviving candidates כאשר path, latency או order state חשובים.

```text
P1 preferred confirmation tool
```

### ‏Alternative C — Full Microstructure / Queue Simulator

‏יכול להיות שימושי כאשר Passive/Depth/Queue sensitivity מוכחת כמהותית.

```text
P3/P4 specialist
```

‏לא Baseline לפני שיש Data ו־Evidence שמצדיקים את complexity.

### ‏Alternative D — Empirical Replay / Shadow Calibration

‏Backtest assumptions מתעדכנים על בסיס observed Replay/Shadow/Paper telemetry.

```text
P2 after baseline instrumentation exists
```

---

## ‏7. Trade-offs

### ‏Speed מול Fidelity

‏Fast screening מאפשר הרבה experiments, אך execution claims חלשים יותר.

‏Event-level fidelity משפרת credibility אך עולה יותר compute, data ו־engineering.

### ‏Conservatism מול Realism

‏Model שמרני מדי יכול לדחות Edge אמיתי; optimistic מדי יכול להמציא Edge.

‏לכן עדיף envelope של assumptions במקום מספר יחיד “נכון”.

### ‏Precision מול Data Semantics

‏רזולוציה גבוהה בקוד אינה משפרת Dataset גס.

‏False precision מזיק יותר מ־explicit limitation.

### ‏Parameter Coverage מול Multiple Testing

‏Sweep רחב יכול לחשוף robust region, אך גם מגדיל selection bias.

‏Experiment Registry ו־locked holdout מאזנים זאת.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏Full exchange simulator.
- ‏L3/order-level reconstruction ללא צורך מוכח.
- ‏ML fill model לפני baseline interpretable.
- ‏מאות latency/cost/fill parameters.
- ‏Auto-search שמקדם את ה־best PnL cell.
- ‏Current-universe historical tests.
- ‏Random time-series split כברירת מחדל.
- ‏Future-aware normalization/cleaning.
- ‏`Last` as fill.
- ‏`Touch = Fill` כ־production assumption.
- ‏MFE כ־exit price.
- ‏Zero-slippage / zero-latency benchmark כהמלצה.
- ‏Test period שחוזרים אליו עד שהתוצאה יפה.

---

## ‏9. What to Add Later

### ‏`P2`

- ‏Empirical latency distributions מ־Shadow/Paper.
- ‏Cost/Slippage calibration לפי symbol/regime/liquidity bucket.
- ‏Explicit uncertainty envelopes אוטומטיים.
- ‏Episode clustering כדי למנוע pseudo-sample inflation.
- ‏Historical data-quality stress.

### ‏`P3`

- ‏Queue/depth-aware fill models כאשר Passive execution מוכחת כמהותית.
- ‏Correlated failure/load scenarios.
- ‏Capacity curves לפי quantity/notional.
- ‏Regime-specific sensitivity analysis.

### ‏`P4`

- ‏Order-level replay / learned fill models.
- ‏Synthetic market scenarios מעבר להיסטוריה.
- ‏Advanced causal estimation כאשר השאלה מצדיקה את complexity.

---

## ‏10. Required Data / Evidence

‏לכל Run נדרש לפחות:

```text
BacktestRunId
ExperimentId
DatasetId
DatasetFingerprint
CoveragePeriod
HistoricalUniverseVersion
CodeCommit
ConfigFingerprint
StrategyVersion
FeatureVersion
EligibilityVersion
RankingVersion
VetoVersion
EntryPolicyVersion
ExitPolicyVersion
OrderPolicyVersion
ExecutionModelVersion
FillModelVersion
CostModelVersion
RiskPolicyVersion
Seed
RunMode
FidelityLevel
TimeSemantics
KnownLimitations
```

‏לכל Decision Snapshot:

```text
DecisionId
AsOfTime
MarketStateCutoff
UniverseSnapshotId
DataQualityState
FeatureSnapshot
EligibilityState
TopK
Candidate
Decision
ReasonCodes
SignalAge
```

‏ל־Execution simulation:

```text
IntentId
SubmitTime
ArrivalTime
OrderStateTimeline
QuoteAtArrival
ReferencePrice
ExecutablePrice
SimulatedFillPrice
FillQty
RemainingQty
CancelTimeline
PartialFillTimeline
ExitTimeline
FlatTime
ExecutionConfidence
```

‏ל־Outcome:

```text
ForwardLabels
MFE / MAE
ExecutableMFE / ExecutableMAE
GrossOutcome
ExplicitCosts
SpreadCost
Slippage
ModeledImpact
NetOutcome
TimeToFirstExecutableNetPositive
TimeToFlat
Markouts
```

---

## ‏11. Promotion Criteria

‏Backtest variant יכול לשמש Promotion Evidence רק אם:

1. ‏אין known point-in-time leakage.
2. ‏Historical universe וה־identifier mapping מספיקים ל־claim.
3. ‏Dataset fidelity תואמת ל־decision/execution horizon.
4. ‏Run reproducible מ־immutable data/code/config.
5. ‏Discovery/Validation/Test separation נשמרה.
6. ‏Primary Metric ו־Guardrails הוגדרו מראש.
7. ‏Execution assumptions מפורשים ו־versioned.
8. ‏Entry ו־Exit נבדקו ברמת realism עקבית.
9. ‏Costs אינם מוסתרים או post-hoc.
10. ‏ה־variant אינו תלוי רק ב־optimistic fill/latency/cost cell.
11. ‏OOS / locked test אינו מציג collapse מהותי שאינו מוסבר.
12. ‏Stress envelope משאיר robustness סביר ביחס ל־Hypothesis.
13. ‏אין violation של Risk/State invariants בתוך simulation.
14. ‏ה־Evidence מספיק כדי לעבור לשלב `Replay / Shadow` — לא ל־Live authorization.

---

## ‏12. Rejection Criteria

‏נדחה או נחזיר למחקר אם:

- ‏Future join או future-aware cleaning מתגלים.
- ‏Survivorship bias מהותי אינו פתור.
- ‏Result נעלם כאשר עוברים מ־`Last` ל־executable side.
- ‏Result תלוי ב־instant/perfect fills.
- ‏Passive result חי רק ב־touch-fill optimistic assumption.
- ‏Exit realism מוריד materially את ה־Edge.
- ‏Net result נעלם תחת cost assumptions סבירים.
- ‏Latency sensitivity מציגה cliff קרוב מדי ל־assumption הבסיסי.
- ‏Test set זוהם על ידי tuning חוזר.
- ‏Best cell צר ואינו חלק מ־robust region.
- ‏Run אינו reproducible.
- ‏Position/capital state אינו עקבי.
- ‏Missing/Unknown data הומרו silently לערכים נוחים.
- ‏Outcome חיובי קיים רק ב־subset/regime שנבחר לאחר התוצאה ללא confirmation חדש.

---

## ‏13. Metrics

### ‏Causality / Data

```text
FutureJoinViolationCount
UnknownTimeSemanticsRate
HistoricalUniverseCoverage
MissingAnchorRate
StaleInputRate
DataGapRate
```

### ‏Prediction / Ranking

```text
RankBucketOutcome
Top1Premium
TopKRecall
SelectionRegret
NoTradeRate
HealthyNoTradeRate
UnknownDecisionRate
```

### ‏Execution

```text
FillRate
PartialFillRate
NoFillRate
SignalAgeAtFill
ImplementationShortfall
Slippage
Markout
NetEdgeRetained
TimeToFill
TimeToFlat
```

### ‏Robustness

```text
OOSDelta
WalkForwardStability
LatencySensitivity
CostSensitivity
FillModelSensitivity
StressOutcomeDistribution
RobustRegionWidth
```

### ‏Research Integrity

```text
ReproducibilityRate
ContaminatedHoldoutCount
ExperimentCount
RejectedExperimentCount
PrimaryMetricChangeAfterRunCount
```

---

## ‏14. Failure Modes

### ‏Failure 1 — Look-Ahead Leakage

‏Future information נכנס ל־feature, join, cleaning, normalization או universe.

### ‏Failure 2 — Survivorship Bias

‏Historical test משתמש ב־survivors של היום.

### ‏Failure 3 — `Last = Fill`

‏PnL מחושב על מחיר שלא היה executable.

### ‏Failure 4 — Touch Fill Illusion

‏Passive fill מונח בכל נגיעה במחיר.

### ‏Failure 5 — Perfect Exit

‏Entry realistic אך Exit מקבלת future-best או instantaneous price.

### ‏Failure 6 — Test Set Mining

‏אותו Holdout הופך ל־development dataset דרך feedback אנושי חוזר.

### ‏Failure 7 — Cost Afterthought

‏Gross edge נראה טוב אך costs נוספו רק בסוף או כ־constant אופטימי.

### ‏Failure 8 — False Precision

‏Dataset של שנייה משמש להסיק behavior של 100ms.

### ‏Failure 9 — Independent-Signal Illusion

‏אותו opportunity episode נספר שוב ושוב כ־samples עצמאיים.

### ‏Failure 10 — Stateless Capital

‏כל Signal מקבל capital כאילו אין position/pending exposure אחר.

### ‏Failure 11 — Happy-Path Execution

‏אין partials, cancel races, unknown state או recovery scenarios.

### ‏Failure 12 — Best-Cell Selection

‏Parameter sweep רחב מסתיים בבחירת cell יחיד בלי robustness/confirmation.

### ‏Failure 13 — Optimistic-Only Edge

‏Strategy חיובית רק תחת fill/latency/cost model האופטימי.

### ‏Failure 14 — Mutable Evidence

‏Dataset או Run artifact משתנים לאחר התוצאה ואין דרך לשחזר אותה.

---

## ‏15. User-Specific Application

‏למערכת `Short-Horizon Momentum` האישית, Backtest צריך להישאר מחובר לשאלה שהמערכת באמת מנסה לענות עליה:

```text
Can the scanner identify a better candidate than alternatives,
soon enough,
with enough executable edge remaining,
under realistic short-horizon friction?
```

‏לכן סדר המחקר המומלץ הוא:

```text
1. Whole-market causal signal/ranking screening
2. Top-K + NO_TRADE diagnostics
3. Event-level candidate simulation
4. Entry/Exit realism
5. Cost + latency sensitivity
6. Stress envelope
7. Locked chronological validation
8. Deterministic replay / shadow follow-up
```

‏אין צורך להתחיל מ־queue simulator עמוק אם עדיין לא הוכח שה־Ranking predictive.

‏ומנגד, אין להכריז Edge כלכלי רק משום ש־forward return אחרי `Rank #1` חיובי.

‏השלב המחקרי החשוב הוא להראות שה־Edge שורד את המעבר:

```text
Prediction
→ Decision
→ Arrival
→ Fill / No Fill
→ Exit
→ All-in Costs
→ Net Outcome
```

---

## ‏16. Confidence

### ‏High Confidence

- ‏Point-in-Time correctness הוא תנאי יסוד.
- ‏Historical universe חייב להיות point-in-time ככל האפשר.
- ‏Feature/Label separation הכרחית.
- ‏`Last` ו־`Touch` אינם fill truth.
- ‏Backtest חייב להיות reproducible ו־versioned.
- ‏Locked holdout מזדהם כאשר משתמשים בו ל־tuning.
- ‏Entry ו־Exit חייבים fidelity עקבית.
- ‏Stress/sensitivity עדיפים על assumption יחיד כאשר uncertainty מהותית.

### ‏Medium Confidence

- ‏שלוש רמות Backtest הן חלוקה טובה לפרויקט הזה.
- ‏`Level 2` סביב top-of-book + latency + partials הוא baseline מתאים לפני queue-heavy modeling.
- ‏Optimistic/Base/Conservative envelope הוא דרך יעילה להציג fill uncertainty.

### ‏Low / Hypothesis

- ‏ה־fidelity המדויק שנדרש לכל strategy version.
- ‏איזו latency distribution מייצגת ביותר את העתיד.
- ‏כמה queue/depth fidelity יוסיף incremental decision value.
- ‏ה־stress ranges המדויקים לכל regime.

---

## ‏17. Time-Sensitive Facts

‏ה־Backtest policy עצמה כמעט ואינה תלויה בעובדה רגולטורית/ברוקרית נוכחית.

‏אבל Inputs חיצוניים שמשתנים בזמן חייבים להיות versioned או re-verified כאשר הם נכנסים למודל, למשל:

```text
Broker order semantics
Venue capabilities
Fee schedules
Market-data semantics
Trading-session rules
Corporate-action/reference-data conventions
```

‏אין להעתיק capability או fee של היום לתקופה היסטורית או ל־future operational claim ללא source/version מתאים.

---

## ‏18. Priority Map

### ‏`P0`

- ‏Point-in-Time / As-Known-At correctness.
- ‏Historical universe correctness.
- ‏Feature/Label isolation.
- ‏Deterministic ordering.
- ‏Executable-price semantics.
- ‏Partial/cancel lifecycle כאשר execution נמדד.
- ‏Entry/Exit realism parity.
- ‏Chronological validation / locked holdout discipline.
- ‏Immutable datasets/runs.
- ‏Explicit costs/latency/fidelity assumptions.

### ‏`P1`

- ‏Three-level backtest ladder.
- ‏Top-K persistence.
- ‏Path metrics.
- ‏Walk-forward.
- ‏Historical/Replay parity.
- ‏Stress envelope בסיסי.

### ‏`P2`

- ‏Empirical latency/cost calibration.
- ‏Episode-aware sampling.
- ‏Automated uncertainty envelope.
- ‏Historical quality stress.

### ‏`P3`

- ‏Queue/depth-aware modeling.
- ‏Correlated load/failure scenarios.
- ‏Capacity curves.

### ‏`P4`

- ‏Order-level simulation.
- ‏Learned fill models.
- ‏Advanced synthetic/causal simulation.

---

## ‏19. Definition of Done

‏`CC11 — Recommended Backtest Policy` נחשב מיושם כאשר ניתן להראות:

1. ‏כל Decision historical נושא `AsOfTime` ו־availability semantics.
2. ‏Historical universe אינו נבנה מרשימת survivors נוכחית.
3. ‏Feature path אינו יכול לקרוא future labels.
4. ‏Event ordering deterministic.
5. ‏Missing data נשאר explicit ולא מקבל future fallback.
6. ‏יש separation בין signal outcome ל־execution outcome.
7. ‏Execution-aware runs אינם משתמשים ב־`Last` או `touch` כ־fill truth אוטומטי.
8. ‏Entry ו־Exit מקבלים fidelity עקבית.
9. ‏Partial fills ו־position state נכנסים ל־simulation כאשר רלוונטי.
10. ‏Costs/latency/fill assumptions versioned.
11. ‏`TRADE / NO_TRADE / UNKNOWN` נשמרים כולם.
12. ‏Validation chronological ו־holdout contamination tracked.
13. ‏כל Run ניתן לשחזור מ־immutable fingerprinted artifacts.
14. ‏Stress/sensitivity מראה אם התוצאה robust או assumption-fragile.
15. ‏Backtest promotion מוביל רק ל־`Replay / Shadow / Paper` Evidence נוסף, לא להרשאת `Live`.

---

## ‏20. Recommendation Summary

```text
Historical Events
→ Reconstruct As-Known-At Reality
→ Build Point-in-Time Universe + State
→ Run Same Decision Semantics
→ Persist TRADE / NO_TRADE / UNKNOWN
→ Separate Prediction from Execution
→ Simulate Entry + Exit with Explicit Fidelity
→ Apply Costs / Latency / Fill Uncertainty
→ Preserve Stateful Capital / Risk
→ Validate Chronologically
→ Stress Assumptions
→ Store Immutable Reproducible Evidence
→ Promote only to Replay / Shadow / Paper investigation
```

‏ברירת המחדל היא **Backtest causal, layered ו־skeptical**: קודם להוכיח שה־Signal וה־Ranking יודעים משהו, אחר כך להוכיח שההחלטה executable, ואז לבדוק כמה מה־Edge נשאר תחת assumptions פחות נוחים. ‏Complexity נוספת נכנסת רק כאשר היא משנה materially את ההחלטה או את confidence ב־Evidence.