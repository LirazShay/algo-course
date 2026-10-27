# ‏Cross-Cutting 10 — Recommended Risk Controls

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Position Sizing, Risk Management, Safety, Recovery, Execution, Exit, Costs, Readiness ו־Compliance למדיניות `Risk Controls` אחת deterministic, explainable, recoverable ו־replayable עבור `Research / Replay / Shadow / Paper`.
>
> ‏המסמך אינו קובע סכום כסף, אחוז סיכון, מינוף או חשיפה למסחר אמיתי ואינו מעניק הרשאת `Live`. הוא מגדיר את החוזה המחקרי והארכיטקטוני שלפיו exposure ניסויי יכול להיווצר, להישמר, להצטמצם או להיחסם.

---

## ‏1. Decision

‏`Risk` אינו:

```text
score is high
→ allow larger position
```

‏ואינו:

```text
stop loss exists
→ risk is controlled
```

‏אלא:

```text
Candidate / Intent
→ Position + Pending Exposure Truth
→ Data / Execution / Account Truth
→ Risk Limits
→ Safety / Compliance Constraints
→ Approved Maximum Exposure
→ Execution Reservation
→ Continuous Recalculation
→ Reduce / Pause / Exit-Only / Lock when needed
→ Reconcile before Resume
→ Evidence / RCA
```

‏העיקרון המחייב:

```text
Scanner proposes opportunity.
Risk decides whether new exposure is allowed,
and the maximum defensible exposure under current truth.
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Risk Engine עצמאי מה־Scanner ומה־Score

‏`Rank #1`, ‏Score גבוה או expected edge חיובי אינם יכולים לעקוף Risk.

‏Output קנוני:

```text
ALLOW
ALLOW_CLAMPED
REJECT
PAUSE_NEW_RISK
EXIT_ONLY
LOCKED
UNKNOWN
```

‏`P0 FAIL` או `P0 UNKNOWN` ב־Risk truth חוסמים יצירת exposure חדש.

### ‏`P0 — Required`: ‏Exposure Truth כולל יותר מ־Position Filled

‏Risk מחשב לפחות:

```text
ActualFilledExposure
+ WorkingOrderPotentialExposure
+ PendingSubmitExposure
+ CancelPendingExposure
+ ReplaceOverlapExposure
+ UnknownEffectConservativeExposure
= PotentialTotalExposure
```

‏`CancelRequested` אינו מפחית exposure עד שניתן להוכיח שהפקודה אינה יכולה עוד להתמלא.

### ‏`P0 — Required`: ‏`UNKNOWN != SAFE`

‏מצבים כגון:

```text
unknown order effect
unknown position quantity
unknown broker synchronization
unknown account/environment identity
unknown pending exposure
unknown critical data freshness
unknown compliance conflict
```

‏מובילים ל־:

```text
NO NEW RISK
→ reconcile / refresh / validate
```

‏לא ל־default optimistic.

### ‏`P0 — Required`: ‏Sizing לפי `Min of Constraints`

‏ה־baseline המחקרי:

```text
ApprovedQty = min(
    QtyByResearchBudget,
    QtyByTradeRisk,
    QtyByLiquidity,
    QtyByExecutionCost,
    QtyByExitCapacity,
    QtyByStrategyLimit,
    QtyByEnvironmentLimit
)
```

‏כל constraint רשאי להקטין או להחזיר `0`.

‏שום constraint אינו רשאי להגדיל מעבר לאחרים.

### ‏`P1 — Preferred Default`: ‏Fixed Small Research Size לפני Dynamic Sizing

‏ב־Champion הראשוני עדיף להפריד בין:

```text
signal quality
and
sizing quality
```

‏לכן נתחיל ב־research size פשוט ו־bounded, ואז נחיל caps של liquidity, execution ו־risk.

‏Volatility sizing, confidence sizing ו־portfolio allocation נשארים Challengers עד Evidence.

### ‏`P0 — Required`: ‏Planned Risk אינו Worst-Case Loss

‏נשמור בנפרד:

```text
PlannedRisk
StressRisk
ExecutionRisk
TailRisk
OperationalUncertainty
```

‏Stop/Exit trigger אינו Fill guarantee.

‏לכן מודל מסוג:

```text
quantity × stop_distance
```

‏אינו Risk model מלא.

### ‏`P0 — Required`: ‏Exit Capacity היא Risk Constraint

‏Risk אינו שואל רק:

```text
Can we enter this size?
```

‏אלא:

```text
Can we plausibly get flat fast enough under stressed but modeled conditions?
```

‏נשמור לפחות:

```text
ExpectedEntryFriction
ExpectedExitFriction
ExpectedTimeToFlat
LiquidityCapacity
SizeToExecutableLiquidity
StressExitCost
```

### ‏`P0 — Required`: ‏Risk Reservation לפני exposure-changing attempt

‏לפני simulated/paper attempt נגדיל reservation לפי worst plausible authorized exposure.

‏ה־reservation משתחרר רק לפי authoritative transition:

```text
fill applied
order confirmed terminal
cancel confirmed / reconciled
intent terminal
```

‏לא לפי timeout מקומי.

### ‏`P0 — Required`: ‏Risk Revalidation לפני כל פעולה שמגדילה Exposure

‏נבדוק מחדש לפחות:

```text
risk state
actual exposure
pending exposure
unknown exposure
market/data readiness
execution readiness
price/economic bound
liquidity/exit capacity
safety capability
compliance status
execution epoch
risk policy version
```

‏Intent ישן אינו authority לאחר שינוי Risk/Safety epoch.

### ‏`P0 — Required`: ‏Risk States קטנים וברורים

‏Baseline:

```text
NORMAL
REDUCED
PAUSED
EXIT_ONLY
LOCKED
```

‏Semantics:

```text
NORMAL
→ evaluate new exposure under normal research limits

REDUCED
→ tighter research caps

PAUSED
→ no new exposure; manage existing exposure

EXIT_ONLY
→ only actions that reduce verified exposure

LOCKED
→ explicit recovery / review required before re-arm
```

### ‏`P0 — Required`: ‏Safety ו־Risk הם siblings, לא אותו מנגנון

‏`Risk` עוסק ב־exposure budgets, sizing ו־loss/tail constraints.

‏`Safety` עוסק ב־system truth, capabilities, recovery state ו־hard invariants.

‏שניהם יכולים לחסום Intent.

‏אף אחד מהם אינו יכול לעקוף את השני.

### ‏`P0 — Required`: ‏Risk-Reducing נמדד לפי resulting exposure, לא לפי `Buy/Sell`

‏נחשב:

```text
CurrentPosition
PotentialLiveExposure
ProposedAction
ExpectedResultingExposure
```

‏כך Action נחשבת risk-reducing רק אם היא באמת מקרבת את ה־target exposure לכיוון בטוח יותר.

### ‏`P0 — Required`: ‏Existing Exposure קודם ל־New Opportunity

‏תחת contention/backpressure:

```text
Reconcile Unknown Exposure
→ Protect / Reduce Existing Exposure
→ Exit / Flatten Work
→ Cancel Stale Risk
→ New Entry Evaluation
→ Background Research Work
```

### ‏`P0 — Required`: ‏Risk State durable

‏Restart אינו מאפס:

```text
RiskState
RiskEpoch
Reservations
DailyResearchBudgetState
Loss / Drawdown State when used
Kill / Pause Reason
PendingExposure
UnknownExposure
Incident Links
RiskPolicyVersion
```

‏Resume דורש Evidence חדש; process restart אינו reset.

### ‏`P0 — Required`: ‏Broker/Simulator Truth + Reconciliation לפני Resume

‏לאחר restart/reconnect/unknown effect/mismatch:

```text
contain
→ fetch authoritative orders / fills / positions
→ rebuild local exposure state
→ validate reservations
→ validate risk invariants
→ validate safety/compliance readiness
→ explicit re-arm
```

‏`Connected == true` אינו Risk readiness.

### ‏`P1 — Preferred Default`: ‏מעט Hard Limits ברורים

‏ב־baseline נשתמש בקטלוג קטן כגון:

```text
MaxPositionQty / ResearchNotionalCap
MaxTotalExposure
MaxConcurrentPositions
MaxPendingExposure
MaxOrderRate
MaxStrategyLossBudget
MaxSessionLossBudget
MaxAcceptableDataAge
MaxExpectedTimeToFlat
NoNewRiskOnUnknownState
```

‏המסמך אינו קובע ערכים מספריים למסחר אמיתי.

### ‏`P1 — Preferred Default`: ‏One Position at a Time כ־Research Baseline

‏זה מפשט:

```text
attribution
reconciliation
capital allocation
execution concurrency
correlation analysis
```

‏זו המלצת baseline הנדסית, לא טענה שהיא אסטרטגית אופטימלית.

### ‏`P1 — Preferred Default`: ‏Risk Reasons ו־Evidence מפורשים

‏כל החלטת Risk תשמור:

```text
RiskDecisionId
IntentId
Status
ApprovedQty
ConstraintResults[]
PrimaryReasonCode
SecondaryReasonCodes[]
RiskEpoch
RiskPolicyVersion
EvidenceRefs[]
EvaluatedAt
```

‏לא מספיק לשמור `rejected=true`.

---

## ‏3. Why

### ‏Fact

‏Working, cancel-pending ו־unknown-effect orders יכולים להפוך ל־fills ולכן הם חלק מ־potential exposure.

### ‏Fact

‏Partial Fill יוצר exposure אמיתי מיד.

### ‏Fact

‏Stop/Exit trigger אינו מבטיח execution במחיר ה־trigger.

### ‏Fact

‏Local state לבדו אינו מקור סמכות מספק לאחר reconnect/restart או כאשר קיימת סתירה עם external execution truth.

### ‏Judgment

‏במערכת short-horizon צעירה, state correctness, exit capacity ו־recoverability חשובים יותר מ־dynamic sizing sophistication.

### ‏Judgment

‏Hard Risk Limits צריכים להיות deterministic, explainable ו־fail-closed כאשר truth קריטי חסר.

### ‏Hypothesis

‏`Loss Velocity`, ‏short-horizon volatility sizing ו־liquidity-aware sizing עשויים לשפר tail behavior, אך יש להוכיח incremental value ב־OOS/Replay לפני promotion.

---

## ‏4. Use When

‏ה־baseline חל על כל flow שבו simulated/paper exposure יכול להשתנות, במיוחד:

- ‏לפני Entry.
- ‏לאחר Partial Fill.
- ‏ב־Cancel/Replace overlap.
- ‏בעת Exit/Flatten.
- ‏אחרי reconnect/restart.
- ‏ב־Recovery או mismatch.
- ‏כאשר data/execution quality יורדת.
- ‏כאשר loss/tail guardrail מופעל.
- ‏כאשר strategy/config/risk version משתנה.

---

## ‏5. Do Not Use When

‏אין להשתמש ב־Risk Controls כדי:

- ‏לפצות על Scanner חלש באמצעות stop צפוף.
- ‏להסתיר Execution cost בעזרת Size קטן בלי attribution.
- ‏להגדיל Size לפי Score שאינו calibrated.
- ‏להסיק Exposure אמיתי מתוך Buying Power בלבד.
- ‏לפרש `UNKNOWN` כ־0.
- ‏לאפס Risk state על restart.
- ‏להפוך Loss Limit ל־auto-optimizer.
- ‏לעקוף Safety/Compliance בגלל expected PnL גבוה.
- ‏להכריז Live readiness מתוך Paper risk behavior.

---

## ‏6. Alternatives

### ‏Alternative A — Fixed Research Size

‏הכי פשוט ל־attribution ול־Replay.

‏סטטוס: `P1 Baseline`.

### ‏Alternative B — Liquidity-Aware Size

‏משתמש ב־executable liquidity, expected slippage ו־`TimeToFlat`.

‏סטטוס: `P2 Challenger`.

### ‏Alternative C — Short-Horizon Volatility Size

‏מנסה normalize risk לפי horizon תואם.

‏סטטוס: `P2 Challenger`.

### ‏Alternative D — Loss Velocity / Drawdown Controls

‏מאפשרים לזהות deterioration לפני exhaustion של budget סטטי.

‏סטטוס: `P2/P3 Challenger`.

### ‏Alternative E — Confidence-Based Size

‏רלוונטי רק לאחר calibration יציב OOS.

‏סטטוס: `P3`.

### ‏Alternative F — Portfolio / Correlation Risk

‏רלוונטי כאשר multi-position עצמו הוכח כבעל ערך.

‏סטטוס: `P3/P4`.

### ‏Alternative G — Kelly-family sizing

‏רגיש מאוד לשגיאת Edge estimate.

‏סטטוס: `P4 / Avoid initially`.

---

## ‏7. Trade-offs

### ‏Strict Fail-Closed מול Research Velocity

‏יותר `UNKNOWN → BLOCK` מפחית false confidence אך יכול להגדיל no-trade/paused periods.

### ‏Fixed Size מול Adaptive Size

‏Fixed Size פשוט יותר להסבר; Adaptive Size עשוי לשפר normalization אך מוסיף model risk.

### ‏Conservative Pending Exposure מול Capital Efficiency

‏ספירה שמרנית של unknown/pending exposure יכולה “לנעול” capacity זמנית, אך מונעת double exposure כאשר state אינו ברור.

### ‏Single Position מול Multi-Position

‏Single Position מפשט truth ו־RCA; Multi-Position עשוי להגדיל opportunity capture במחיר complexity גבוה יותר.

### ‏Fast Resume מול Safe Resume

‏Resume מוקדם מגדיל availability; Resume מוכח מפחית risk של stale/unknown state.

---

## ‏8. What I Would Avoid Initially

‏לא להתחיל עם:

- ‏Kelly / Fractional Kelly.
- ‏Sizing לפי uncalibrated Score.
- ‏Martingale או הגדלת Size כדי “להחזיר” הפסד.
- ‏עשרות Dynamic Risk rules.
- ‏Portfolio optimizer לפני single-position baseline.
- ‏regime-specific limits לפני Evidence.
- ‏`StopDistance == WorstCaseLoss`.
- ‏`BuyingPower == RiskBudget`.
- ‏`CancelPending == NoExposure`.
- ‏Risk state שחי רק ב־UI או RAM.
- ‏auto-clear של critical latch.
- ‏AI שמאלתר Hard Limits בזמן runtime.

---

## ‏9. What to Add Later

### ‏`P2`

- ‏Liquidity/exit-capacity sizing.
- ‏Short-horizon volatility caps.
- ‏Loss Velocity.
- ‏Drawdown/Giveback hysteresis.
- ‏near-miss analysis.

### ‏`P3`

- ‏Multi-position exposure budget.
- ‏Correlation/common-factor controls.
- ‏Regime-aware research budgets.
- ‏event-aware research risk states.
- ‏Expected Shortfall / tail studies.

### ‏`P4`

- ‏Confidence-calibrated sizing.
- ‏learned risk model מעל Hard deterministic limits בלבד.
- ‏formal capital-allocation optimizer רק אם complexity מוצדקת ב־Evidence.

---

## ‏10. Required Data / Evidence

‏לכל Risk evaluation נשמור לפחות:

```text
RiskDecisionId
IntentId
DecisionId
InstrumentId
RequestedQty
ApprovedQty
ReferencePrice
ActualFilledExposure
WorkingExposure
PendingSubmitExposure
CancelPendingExposure
UnknownEffectExposure
PotentialTotalExposure
CurrentPositionCount
ResearchBudgetState
LossBudgetState
CurrentDrawdown when used
OrderRate
DataAge
MarketGeneration
ExpectedEntryFriction
ExpectedExitFriction
ExpectedTimeToFlat
LiquidityCapacity
PlannedRisk
StressRisk
ExecutionRisk
OperationalUncertainty
SafetyState
ComplianceState
RiskState
RiskEpoch
RiskPolicyVersion
ConstraintResults[]
ReasonCodes[]
EvidenceRefs[]
```

‏לאחר lifecycle נשמור:

```text
actual fills
actual max exposure
actual entry/exit friction
MAE / MFE
TimeToFlat
unknown-effect incidents
reconciliation duration
risk invariant violations
near misses
whether approved cap was respected
```

---

## ‏11. Promotion Criteria

‏Risk variant מתקדם רק אם:

- ‏הוא deterministic ב־Replay.
- ‏אותו Evidence מייצר אותה החלטת Risk.
- ‏Pending/Unknown exposure נספר נכון תחת fault tests.
- ‏Restart/reconnect אינם משנים limits או reservations באופן שקט.
- ‏Partial/late fills נשארים בתוך authorized exposure envelope.
- ‏State mismatches חוסמים new risk כמתוכנן.
- ‏Sizing challenger משפר OOS tail/net behavior מעבר ל־baseline פשוט.
- ‏השיפור שורד sensitivity/regime checks.
- ‏המורכבות נשארת explainable ו־observable.

---

## ‏12. Rejection Criteria

‏נדחה Risk variant אם:

- ‏הוא משפר average PnL אך מגדיל tail loss materially.
- ‏הוא תלוי בפרמטר צר או regime יחיד.
- ‏הוא מתעלם מ־pending/unknown exposure.
- ‏הוא מאפס state לאחר restart.
- ‏הוא מאפשר new risk לפני reconciliation.
- ‏הוא מניח stop fill מושלם.
- ‏הוא מגדיל size על בסיס uncalibrated confidence.
- ‏הוא מקשה על Exit/TimeToFlat.
- ‏הוא לא ניתן לשחזור ב־Replay.
- ‏הוא מאפשר Score/PnL לעקוף Hard Risk/Safety/Compliance gate.

---

## ‏13. Metrics

### ‏Exposure / State

```text
ActualExposure
PotentialExposure
PendingExposure
UnknownExposure
MaxObservedExposure
ReservationUtilization
PositionCount
```

### ‏Risk Behavior

```text
RiskRejectRate
ClampRate
PausedTime
ExitOnlyTime
LockedTime
RiskStateTransitions
ReasonCodeDistribution
```

### ‏Tail / Economics

```text
MAE
TailLoss
StressLossEstimateError
Drawdown when applicable
NetOutcome
TimeInDeadExposure
TimeToFlat
```

### ‏Correctness

```text
RiskInvariantViolationCount
ExposureEnvelopeBreachCount
UnknownEffectRate
ReconciliationSuccessRate
ReconciliationDuration
DuplicateExposureIncidents
RestartParityRate
```

### ‏Research

```text
IncrementalNetValueOfSizingVariant
TailImprovement
SensitivityStability
RegimeCoverage
ComplexityCost
```

---

## ‏14. Failure Modes

1. ‏`PositionOnly Risk` — working/unknown orders אינם נספרים.
2. ‏`Unknown Laundering` — unknown exposure נהפך ל־0.
3. ‏`Cancel Means Gone` — cancel-pending נשמט מה־budget.
4. ‏`Stop Equals Max Loss` — slippage/tail ignored.
5. ‏`Scanner Override` — Score גבוה עוקף limit.
6. ‏`Restart Reset` — process restart מנקה state קריטי.
7. ‏`Buying Power Confusion` — external capacity נחשבת risk budget.
8. ‏`Exit-Blind Sizing` — size ניתן לכניסה אך לא ליציאה סבירה.
9. ‏`Double Reservation` או reservation leak.
10. ‏`Partial Fill Blindness` — exposure בפועל שונה מהמודל.
11. ‏`Dynamic Rule Explosion` — עשרות rules לא ניתנים ל־RCA.
12. ‏`Premature Resume` — connection חזרה אך truth לא reconciled.
13. ‏`Safety/Risk Merge` — אין owner ברור ל־hard system invariant מול budget decision.
14. ‏`Live Inference From Paper` — Paper behavior נחשב הוכחת risk בעולם אמיתי.

---

## ‏15. User-Specific Application

‏עבור מערכת Short-Horizon אישית, ה־Risk baseline צריך להעדיף:

```text
simple research sizing
+ one position at a time initially
+ strict pending/unknown exposure accounting
+ exit-capacity awareness
+ deterministic risk states
+ no-new-risk on critical uncertainty
+ position/exit priority
+ explicit reconciliation before resume
```

‏הדגש אינו “איך להגדיל exposure”, אלא איך לייצר Evidence אמין לכך שכל transition מכבד envelope ידוע וניתן לשחזור.

---

## ‏16. Confidence

### ‏High Confidence

- ‏Risk חייב להיות עצמאי מה־Scanner.
- ‏Pending/Unknown exposure חייב להיספר.
- ‏Critical unknown blocks new exposure.
- ‏Partial Fill משנה Risk מיד.
- ‏Risk state חייב להיות durable.
- ‏Reconciliation נדרש לפני Resume לאחר uncertainty משמעותי.
- ‏Exit capacity היא חלק מ־Risk.

### ‏Medium Confidence

- ‏Fixed small research size הוא Champion טוב בתחילת המחקר.
- ‏One-position baseline מפשט בצורה מהותית את correctness וה־RCA.
- ‏Loss Velocity ו־liquidity-aware caps הם Challengers הגיוניים לאחר baseline.

### ‏Low / Unproven

- ‏Thresholds מספריים מדויקים.
- ‏Confidence sizing.
- ‏Regime-specific risk budgets.
- ‏Portfolio optimizer.
- ‏Learned risk controller.

---

## ‏17. Time-Sensitive Facts

‏אין במסמך זה capability חיצונית חדשה שדורשת אימות Web לצורך ההכרעה המחקרית.

‏לפני כל שימוש תפעולי עתידי יש לאמת מחדש מול סביבת ה־Broker/Provider/Account הרלוונטית כל fact משתנה כגון:

```text
account permissions
margin / buying-power semantics
order capability
session behavior
rate limits
broker risk controls
position / execution reporting semantics
```

‏ה־Playbook אינו משתמש בפרטים אלה כדי לקבוע Live limits.

---

## ‏18. Acceptance Tests

### ‏Test A — Unknown Submit Effect

```text
submit attempted
response lost
```

‏Expected:

```text
UnknownEffectExposure counted conservatively
No new risk
Reconciliation required
```

### ‏Test B — Cancel Pending

```text
working order
cancel requested
cancel not confirmed
```

‏Expected:

```text
potential exposure remains reserved
```

### ‏Test C — Partial Fill

```text
requested 100
filled 37
remainder still potentially live
```

‏Expected:

```text
ActualExposure = 37
PendingExposure includes remaining live quantity
Total authorized envelope is not exceeded
```

### ‏Test D — Restart

```text
restart with open/pending state
```

‏Expected:

```text
RiskState and reservations restored
new entries blocked until reconciliation
```

### ‏Test E — Safety Conflict

```text
Risk says ALLOW
Safety says EXIT_ONLY
```

‏Expected:

```text
new exposure blocked
```

### ‏Test F — Exit Capacity Failure

```text
candidate passes signal gate
modeled TimeToFlat / exit friction exceeds risk contract
```

‏Expected:

```text
quantity clamped or risk rejected
```

### ‏Test G — Replay Determinism

‏אותם inputs + versions:

```text
Expected:
same ApprovedQty
same RiskState
same ReasonCodes
```

---

## ‏19. Recommendation Summary

```text
Candidate / Intent
→ Reconstruct Actual + Potential Exposure
→ Apply Min-of-Constraints
→ Validate Exit Capacity
→ Apply Hard Risk Limits
→ Apply Safety + Compliance
→ Reserve Authorized Exposure
→ Revalidate before risk increase
→ Track fills / working / unknown states continuously
→ Reduce / Pause / Exit-Only / Lock when required
→ Reconcile before Resume
→ Measure tail, correctness and TimeToFlat
→ Promote complexity only with OOS evidence
```

‏ה־Champion המומלץ הוא **Risk פשוט, deterministic, conservative under uncertainty ו־versioned**. ‏Dynamic sizing, multi-position allocation ו־learned risk נכנסים רק לאחר שה־baseline מוכיח correctness, reproducibility ו־incremental value.