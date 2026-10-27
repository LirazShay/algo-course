# ‏58 — Recommendation Sheet: Order and Execution Subtleties

> ‏מקור לימודי עיקרי: `../58-ORDER-AND-EXECUTION-SUBTLETIES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, ארכיטקטוני ותפעולי ל־Order/Execution Policy עבור רובוט `Short-Horizon Momentum`, כך ש־Order Type לא יטעה אותנו לחשוב שהוא Execution Outcome; כל tactic תימדד לפי Queue, Latency, Fill/No-Fill, Partial Fills, Adverse Selection, Opportunity Cost, Price Bounds, Remaining Edge ו־Time-to-Flat.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי, אינו מגדיר Exposure אמיתי ואינו מבטיח רווח.

---

## ‏1. Decision

‏`Order Type` הוא syntax בלבד.

‏ה־Execution שלנו יוגדר כ־**stateful economic process under uncertainty**.

‏ה־Baseline:

```text
Prediction / Candidate
→ Economic Intent
→ Execution Feasibility
→ Execution Policy
→ Broker / Venue Semantics
→ Queue / Route / Order State
→ Fill / Partial / No Fill / Cancel / Reject / Unknown
→ Markout / Missed Opportunity
→ Exit / Flat
→ Net Edge Retained
→ RCA / Policy Learning
```

‏שלוש שכבות תמיד נשמרות בנפרד:

```text
Intent
!=
Broker / Venue Semantics
!=
Observed Outcome
```

‏העיקרון המחייב:

```text
Order Type != Execution Outcome
Fill != Good Execution
No Fill != Failure
Better Price != Better Execution
CancelRequested != Canceled
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Execution Policy נבחרת לפי Economics, לא לפי שם הפקודה

‏לפני כל tactic נשאל:

```text
What economic objective are we trying to preserve?
```

‏Baseline objectives:

```text
preserve remaining alpha
respect hard price bound
avoid stale execution
avoid duplicate / excess exposure
remain explainable
remain recoverable
become flat promptly when required
```

‏לא נבחר `Market`, ‏`Limit`, ‏`IOC`, ‏`Pegged` או Route מסוים רק משום שהוא קיים או “מקצועי”.

### ‏`P0 — Required`: ‏Intent Contract לפני Broker Primitive

‏`OrderIntent` נשאר semantic:

```text
intent_id
decision_id
instrument_id
side_or_target_position
requested_qty
target_position
signal_time
signal_ttl
execution_deadline
max_price_or_min_price
max_slippage
urgency
expected_edge
minimum_required_net_edge
market_generation
execution_policy_version
reason_code
```

‏Broker Order נגזר מה־Intent ומה־capabilities.

### ‏`P0 — Required`: ‏Hard Price Bound

‏Aggressive execution אינה הרשאה לרדוף ללא גבול.

‏Baseline:

```text
Economic Intent
→ Maximum Acceptable Price Deterioration
→ Hard Price Bound
```

‏ל־Buy:

```text
Do not pay above max_buy_price
```

‏ל־Sell:

```text
Do not sell below min_sell_price
```

‏ה־bound נגזר מ־Execution Budget, לא ממספר שרירותי.

### ‏`P0 — Required`: ‏Economic TTL

‏`Order TTL` אינו timeout טכני בלבד.

```text
Order Lifetime
<=
Economic Lifetime of Intent
```

‏נשמור:

```text
order_age
signal_age
time_since_last_revalidation
```

‏Intent שפג אינו רשאי ליצור Risk חדש רק משום שהוא עדיין Working.

### ‏`P0 — Required`: ‏Pre-Submit Revalidation

‏ממש לפני side effect שמגדיל Risk נבדוק מחדש לפחות:

```text
signal still valid?
rank still acceptable?
quote fresh?
market generation unchanged?
spread acceptable?
price bound still valid?
expected net edge still positive?
risk still approved?
execution state known?
```

### ‏`P0 — Required`: ‏Partial Fill הוא First-Class State

‏Partial Fill משנה מיד:

```text
actual_position
remaining_qty
pending_exposure
risk
exit_obligation
remaining_edge
execution_plan
```

‏לא ממשיכים אוטומטית “עד target quantity” בלי reevaluation.

### ‏`P0 — Required`: ‏Pending Exposure

‏Risk מחשב:

```text
Actual Filled Exposure
+
Potentially Live Exposure
```

‏Working, Cancel-Pending, Replace-overlap ו־Unknown Effect נכללים.

### ‏`P0 — Required`: ‏Asynchronous State Truth

```text
Sent != Accepted
Accepted != Working
Working != Filled
CancelRequested != Canceled
ReplaceRequested != Replaced
Timeout != Reject
```

‏Intermediate states נשמרים במפורש.

### ‏`P0 — Required`: ‏UNKNOWN_EFFECT

‏כאשר Submit/Cancel/Replace עשוי היה להגיע ל־Broker אך אין Confirmation:

```text
UNKNOWN_EFFECT
→ RECONCILE
→ only then decide retry / recovery
```

‏אין Blind Retry ל־state-changing command.

### ‏`P0 — Required`: ‏Fill Quality לצד Fill Probability

‏לכל tactic נפריד:

```text
P(Fill)
Expected Outcome | Fill
Expected Outcome | No Fill
```

‏Primary execution comparison אינו Fill Rate בלבד.

### ‏`P0 — Required`: ‏Entry ו־Exit אינם סימטריים

‏ב־Entry אפשר:

```text
NO_TRADE
```

‏ב־Exit כבר קיימת Exposure.

‏לכן:

```text
Entry Policy != Exit Policy
```

‏Risk reduction מקבלת precedence כאשר נדרש.

### ‏`P0 — Required`: ‏Time To Flat

‏Exit success נמדד:

```text
Exit Intent
→ Submit
→ First Fill
→ Final Fill
→ Confirmed Flat
```

‏לא:

```text
Exit order sent
```

---

## ‏3. Champion Execution Policy

‏Champion ראשון צריך להיות פשוט, deterministic וקל ל־Replay/RCA.

‏Baseline מחקרי מומלץ:

```text
fresh signal
→ fresh execution context
→ bounded price protection
→ short economic TTL
→ pre-submit revalidation
→ simple order tactic
→ explicit pending exposure
→ fill/no-fill measurement
→ fast exit measurement
```

‏כאשר נדרשת Aggressive participation במחקר, benchmark טבעי הוא concept של:

```text
Simple Marketable Limit
+ Hard Bound
+ Short TTL
```

‏לא כפקודה “הכי טובה”, אלא כ־benchmark ברור שניתן למדוד מול Challengers.

---

## ‏4. Passive vs Aggressive

### ‏Passive

‏יתרונות אפשריים:

```text
lower immediate spread cost
possible price improvement
possible fee/rebate advantage
```

‏עלויות אפשריות:

```text
queue delay
no fill
partial fill
missed opportunity
signal decay
adverse selection
```

### ‏Aggressive

‏יתרונות אפשריים:

```text
higher immediacy
higher fill probability
better fit for short TTL
```

‏עלויות אפשריות:

```text
spread
slippage
impact
chase / exhaustion risk
```

‏השאלה הנכונה:

```text
Which policy preserves the most expected net edge now?
```

‏לא:

```text
Maker or Taker?
```

---

## ‏5. Execution Budget

‏נגדיר לפני Order:

```text
MaximumExecutionBudget
=
PredictedEdge
-
MinimumRequiredNetEdge
-
RiskMargin
```

‏התקציב יכול להיצרך על ידי:

```text
spread
fees
slippage
latency move
price deterioration
market impact
expected adverse selection
missed opportunity trade-off
```

‏כל tactic חייב להישאר בתוך budget.

---

## ‏6. Remaining Edge

‏בכל state transition נחזור לחשב:

```text
RemainingEdge
=
UpdatedExpectedMove
-
UpdatedExplicitCosts
-
UpdatedSpreadSlippage
-
UpdatedImpact
-
UpdatedAdverseSelection
-
UpdatedRiskMargin
```

‏אם:

```text
RemainingEdge <= RequiredThreshold
```

‏ה־Entry outcome יכול להיות:

```text
CANCEL
WAIT
NO_TRADE
```

‏אין sunk-cost justification להמשיך chase.

---

## ‏7. Market Order / Marketable Limit / Limit

### ‏Market Order

‏אין הנחה:

```text
Market Order = fill immediately at Last
```

‏ה־outcome תלוי ב־Depth, Latency, Routing, Hidden Liquidity, Size ו־market movement.

### ‏Marketable Limit

‏מייצג:

```text
Urgency
+
Hard Price Protection
```

‏אך גם הוא יכול לקבל Partial Fill או No Fill אם liquidity נעלמת/משתנה.

### ‏Limit Price

‏ה־Limit הוא Constraint:

```text
Do not execute worse than bound
```

‏לא target price.

---

## ‏8. Price Improvement אינו KPI עצמאי

‏נמדוד יחד:

```text
Execution Price
Effective Spread
Realized Spread
Post-Fill Markout
Net Edge Retained
```

‏הכלל:

```text
Price Improvement without Markout Analysis is incomplete.
```

---

## ‏9. Queue Contract

‏מקטע 38 נשאר Source of Truth ל־Queue modeling.

‏מקטע 58 משתמש ב־Queue כחלק מבחירת Execution Policy.

‏נשמור לפחות:

```text
estimated_volume_ahead
queue_confidence
expected_depletion_rate
expected_time_to_fill
queue_age
queue_model_version
```

‏העיקרון:

```text
Queue Depletion
vs
Signal Decay
```

‏הוא race כלכלי.

‏אם signal decay צפוי להקדים queue depletion, passive tactic יכולה להיות בלתי־שימושית גם כאשר spread קטן.

---

## ‏10. Queue Value

‏Queue Value אינו רק Fill Probability.

```text
QueueValue
≈
ExpectedFillBenefit
-
ExpectedAdverseSelection
-
ExpectedMissedOpportunity
-
ExpectedSignalDecay
```

‏Replace שמוחק priority טובה חייב להצדיק את אובדן Queue Value.

---

## ‏11. Trade at Our Price אינו Fill Proof

‏אין invariant:

```text
Trade at my price
=> I should have filled
```

‏סיבות אפשריות ל־apparent non-fill:

```text
other venue
volume ahead
late print
trade condition
hidden priority
feed mismatch
ordering mismatch
```

‏Broker execution report נשאר Fill Truth.

---

## ‏12. Printed Volume אינו Queue Depletion ישיר

‏אסור לעשות:

```text
volume_ahead -= all printed volume at price
```

‏בלי venue/condition/ordering model מתאים.

‏Queue estimate נשאר confidence-aware.

---

## ‏13. Hidden Liquidity / Replenishment

‏Displayed Depth:

```text
!= Total Executable Liquidity
!= Guaranteed Future Liquidity
```

‏Replenishment נשמר כ־Observation:

```text
observed_replenishment
confidence
alternative_explanations
```

‏לא כ־“Iceberg confirmed” ללא Evidence מתאים.

---

## ‏14. Book Half-Life

‏נחקור:

```text
BookHalfLife
```

‏כלומר הזמן שבו execution-relevant book state משתנה מהותית.

‏אם:

```text
BookHalfLife << DecisionToArrivalLatency
```

‏Book Feature יכולה להיות predictive אך לא execution-actionable.

‏נשמור, כאשר data מאפשר:

```text
DecisionBook
SubmitBook
ArrivalBook
FillBook
```

---

## ‏15. Order Aging / Toxicity

‏Order שהיה טוב בזמן `t0` יכול להפוך toxic בזמן `t1`.

‏Signals אפשריים:

```text
signal reversed
rank deteriorated
spread widened
book deteriorated
flow reversed
market generation changed
order age exceeded economic TTL
```

‏Stale Order הוא Failure Mode מפורש.

---

## ‏16. Cancel / Replace

### ‏Cancel

```text
CancelRequested
→ CANCEL_PENDING
→ broker / venue reality
→ terminal confirmation or reconciliation
```

### ‏Replace

‏Replace אינו assumed atomic.

‏Old order יכול:

```text
fill
partial fill
cancel
remain briefly live
be rejected
```

‏במקביל New attempt יכול להיווצר רק תחת Pending Exposure guard.

---

## ‏17. Reprice Decision

‏לפני Replace נמדוד רעיונית:

```text
ExpectedGainFromReprice
-
QueueValueLoss
-
LatencyCost
-
RaceRisk
-
AdditionalComplexity
```

‏Replace אינו free optimization.

---

## ‏18. Chase Budget

‏Chasing מקבל hard bound.

```text
InitialExpectedEdge
-
Costs
-
PriceDeterioration
-
LatencyDecay
-
RiskMargin
=
RemainingEdge
```

‏כל reprice נוסף מותר במחקר רק אם Remaining Edge נשאר חיובי עם margin.

‏אין “להמשיך כי כבר התחלנו”.

---

## ‏19. Hysteresis

‏Execution state לא תחליף:

```text
PASSIVE ↔ AGGRESSIVE
```

‏על noise קטן סביב threshold.

‏Hysteresis יכול לצמצם:

```text
thrashing
replace churn
queue loss
API pressure
race complexity
```

‏אך הוא Challenger עד Evidence.

---

## ‏20. Price Ladder

‏Short deterministic ladder יכול להיות Challenger:

```text
passive
→ slightly more aggressive
→ bounded aggressive
→ stop / no trade
```

‏אבל כל stage מוסיף state ו־races.

‏לא נכנס ל־Champion לפני incremental value.

---

## ‏21. IOC / FOK / AON / Post-Only

‏העיקרון:

```text
Name is not enough.
Capability + Exact Semantics + Recovery Model are required.
```

‏`IOC` יכול להתאים למחקר של:

```text
take available now
avoid stale remainder
```

‏`FOK`/`AON` אינם interchangeable.

‏`Post Only` יכול Reject/Reprice/Cancel לפי semantics של Broker/Venue.

‏לכן לפני שימוש תפעולי נדרש Current Capability Verification.

---

## ‏22. Pegged / Midpoint / Reserve / Iceberg

‏כל אחד הוא `P3/P4` Challenger/Specialist בתחילת הדרך.

‏נדרשים:

```text
reference semantics
repricing semantics
priority impact
caps/floors
locked/crossed behavior
partial-fill behavior
recovery behavior
broker vs venue ownership
```

‏`Midpoint != Microprice`.

‏אין להניח ש־Pegged Order מתנהגת כמו Strategy שמחשבת Microprice.

---

## ‏23. Stop / Stop-Limit

‏Trigger:

```text
!= Fill Guarantee
```

‏`Stop Limit` מוסיף Price Protection אך יכול להישאר Unfilled לאחר trigger.

‏לכן בכל מחקר של exit trigger נפריד:

```text
Trigger Logic
Order Generated
Execution Outcome
Time To Flat
```

---

## ‏24. OCO / OCA / Bracket / Parent-Child

‏אין assume atomicity.

‏נדרשים:

```text
where relationship state lives
activation condition
quantity derivation
partial-fill behavior
cancel propagation
disconnect behavior
restart/recovery behavior
```

‏Child quantity תמיד נגזרת מ־Actual/Confirmed state, לא מה־original requested quantity בלבד.

---

## ‏25. Native / Broker-Synthetic / Client-Synthetic

‏כל capability תסווג:

```text
NATIVE_VENUE
BROKER_SYNTHETIC
CLIENT_SYNTHETIC
UNKNOWN
```

‏Failure model משתנה מהותית.

‏Client-synthetic behavior תלוי ב־process/data availability ולכן אינו שקול ל־Venue-native state.

---

## ‏26. Routing

‏מקטע 39 נשאר Source of Truth ל־SMART/Direct routing.

‏מקטע 58 מוסיף את execution objective:

```text
Best Nominal Price
!=
Best Expected Execution
```

‏נמדוד כאשר אפשר:

```text
fill probability
latency
fees/rebates
queue context
hidden liquidity evidence
markout
net edge retained
```

‏אין Route “הכי טוב” אוניברסלי.

---

## ‏27. Session / Instrument Semantics

‏Order semantics יכולה להשתנות לפי:

```text
session
instrument
listing / venue
price increment
authorized capabilities
```

‏לכן Intent נושא Session/Market context מתאים.

‏אין hard-code של universal tick/lot/order capability.

---

## ‏28. Tick / Precision / Quantity Rules

‏Price/Quantity representation חייבת להיות deterministic.

‏כאשר Intent אינו חוקי ביחס ל־increment:

```text
explicit safe rounding policy
or
reject intent
```

‏אין silent ambiguous rounding.

‏Precision bug נחשב Execution bug.

---

## ‏29. Halt / Resume / Market Generation

‏לאחר Halt/Resume, Resync או discontinuity משמעותי:

```text
market_generation++
```

‏Intent ישן אינו עובר אוטומטית generation boundary.

‏נדרש revalidation של:

```text
signal
price bound
position
working orders
market status
execution capability
```

---

## ‏30. Fast Market Degradation

‏כאשר:

```text
quote age rises
spread expands
depth collapses
queue confidence degrades
latency pressure rises
```

‏Execution Policy יכולה לעבור:

```text
NORMAL
→ CONSERVATIVE
→ ENTRY_BLOCKED
```

‏Risk-reducing capability נשמרת בהתאם ל־Safety policy.

---

## ‏31. Arrival Price / Decision Price / Fill Price

‏נשמור Benchmarks נפרדים:

```text
DecisionReference
ArrivalReference
FillPrice
PostFillReference(h)
```

‏כך RCA יכול להפריד:

```text
Decision→Arrival move = latency / staleness cost candidate
Arrival→Fill move = queue / execution evolution candidate
PostFill move = markout / selection candidate
```

‏אין attribution causal אוטומטי ללא Evidence.

---

## ‏32. Effective Spread / Realized Spread / Markout

‏כל מדד עונה על שאלה אחרת.

‏לא נאחד אותם ל־Execution Score מסתורי.

‏Baseline dashboard מציג אותם בנפרד לצד:

```text
fill rate
partial fill rate
missed opportunity
order age
signal age
net edge retained
```

---

## ‏33. Side-Aware Multi-Horizon Markout

‏מקטע 46 נשאר Source of Truth.

‏Baseline horizons:

```text
100ms
500ms
1s
2s
5s
10s
```

‏כאשר data fidelity מתאימה.

‏Positive normalized markout תמיד favorable לצד שלנו.

---

## ‏34. No-Fill / Missed Opportunity

‏No Fill הוא Outcome מלא.

‏נשמור:

```text
what happened after no fill?
```

‏אפשרויות:

```text
move continued strongly
move died
move reversed
execution context worsened
execution context improved
unknown
```

‏לכן:

```text
No Fill != 0 P&L assumption
No Fill != Lost Profit assumption
```

---

## ‏35. Fill Conditionality

‏Fills הם selected sample.

‏נשווה:

```text
Outcome | Submitted
Outcome | Filled
Outcome | Partial
Outcome | NoFill
Outcome | Canceled
```

‏על context דומה ככל האפשר.

‏אין להסיק מ־Fill Rate גבוה ש־Policy טובה יותר.

---

## ‏36. Prediction vs Execution vs Exit Failure

‏RCA חייב להפריד:

```text
Prediction Failure
Execution Entry Failure
Execution Exit Failure
Risk / Recovery Failure
```

‏דוגמאות:

```text
candidate never moved
→ prediction candidate

candidate moved but we did not enter
→ execution-entry candidate

entered well but became flat poorly
→ execution-exit candidate
```

---

## ‏37. Execution Decision Snapshot

‏בעת Intent נשמור לפחות:

```text
decision_id
intent_id
symbol
side
rank
score
signal_age
signal_ttl
bid
ask
spread
depth_summary
quote_age
expected_edge
expected_costs
execution_budget
remaining_edge
chosen_policy
reason_codes
versions
```

---

## ‏38. Fill Snapshot

‏לכל Fill:

```text
execution_id
fill_time
fill_price
fill_qty
order_age
signal_age
bid
ask
spread
current_rank
route
venue
liquidity_mode
remaining_qty
actual_position
pending_exposure
market_generation
```

‏Unknown fields נשמרים Missing/Unknown, לא zero.

---

## ‏39. Cancel / Replace Snapshot

‏נשמור:

```text
why change?
what changed?
remaining edge?
queue estimate/confidence?
signal/rank state?
risk state?
market generation?
expected queue-value loss?
```

‏כך Cancel/Replace הופכים decisions ניתנים ל־RCA.

---

## ‏40. Execution Policy State

‏Baseline state conceptual:

```text
IDLE
INTENT_READY
REVALIDATING
SUBMITTING
WORKING
PARTIAL
CANCEL_PENDING
REPLACE_PENDING
UNKNOWN_EFFECT
ENTRY_TERMINAL
POSITION_ACTIVE
EXITING
FLAT
BLOCKED
```

‏Strategy State אינה רשאית למחוק Execution State.

---

## ‏41. Intent Versioning / Target Position

‏כאשר signal/target משתנים:

```text
Intent vN
→ Target Position
```

‏נחשב:

```text
ResidualNeed
=
TargetPosition
-
ActualPosition
-
PotentiallyLiveExposure
```

‏גישה זו עדיפה על “שלח עוד 100” ללא ownership של total exposure.

---

## ‏42. Duplicate / Out-of-Order Broker Events

‏Handlers יהיו idempotent.

```text
Same Fill Event Twice
→ Position Changes Once
```

‏Out-of-order events אינם יכולים לשבור invariants.

‏Broker ID / Execution ID / Sequence/Time semantics נשמרים כאשר זמינים.

---

## ‏43. Rejection Taxonomy

‏Reject הוא Outcome מחקרי ותפעולי.

‏Baseline categories:

```text
INVALID_PRICE
INVALID_QUANTITY
UNSUPPORTED_CAPABILITY
SESSION_RESTRICTION
RISK_REJECT
ACCOUNT_CAPABILITY
INSTRUMENT_STATE
BROKER_ERROR
UNKNOWN
```

‏Reject rate לפי reason הוא metric.

---

## ‏44. Explainable Execution Reasons

‏Reason codes לדוגמה:

```text
ENTER_BOUNDED_AGGRESSIVE_SHORT_TTL
ENTER_PASSIVE_QUEUE_ACCEPTABLE
CANCEL_SIGNAL_EXPIRED
CANCEL_EDGE_DECAY
CANCEL_MARKET_GENERATION_CHANGED
REPRICE_REMAINING_EDGE_POSITIVE
NO_TRADE_COST_TOO_HIGH
NO_TRADE_STALE_CONTEXT
EXIT_EDGE_GONE
EXIT_RISK_PRIORITY
```

‏ה־Reason Code אינו מחליף raw evidence.

---

## ‏45. Primary Metrics

‏נשמור לפחות:

```text
DecisionToSubmitMs
SubmitToAckMs
AckToFirstFillMs
TimeToFullFillMs
OrderAgeAtFillMs
SignalAgeAtFillMs
FillRate
PartialFillRate
CancelFillRaceRate
RejectRate
EffectiveSpread
RealizedSpread
PostFillMarkout
MissedOpportunity
NetEdgeRetained
TimeToFlatMs
ExitGiveback
```

---

## ‏46. Segmentation

‏Metrics נחתכים לפחות לפי:

```text
execution_policy
liquidity bucket
spread bucket
signal age bucket
order age bucket
time of day
volatility regime
market status
route / venue when known
```

‏ממוצע כולל אינו Promotion Evidence מספיק.

---

## ‏47. Primary Economic KPI

‏ה־Primary KPI:

```text
Net Edge Retained
```

‏Secondary diagnostics:

```text
Fill Rate
Time To Fill
Markout
Missed Opportunity
Time To Flat
Complexity / Recovery Cost
```

‏Policy אינה promoted רק משום ש־Fill Rate עלה.

---

## ‏48. Champion / Challenger

```text
Champion
→ Simple, bounded, explainable execution policy

Challenger
→ One execution tactic change at a time
```

‏Challengers אפשריים:

```text
passive touch
marketable limit variation
short price ladder
IOC variation
midpoint participation
pegged logic
routing variation
queue-aware cancel/replace
```

‏כל Challenger מתחיל ב־Shadow/Replay/Paper evidence.

---

## ‏49. Promotion Criteria

‏Execution Challenger יכול להתקדם רק אם:

```text
NetEdgeRetained improves
changed-decision EV improves
markout does not worsen materially
missed opportunity acceptable
TimeToFlat acceptable
P95/P99 latency acceptable
order churn acceptable
reject/race rates acceptable
recovery model proven
OOS/regime stability acceptable
```

‏בנוסף:

```text
complexity_added
<
measured incremental value
```

---

## ‏50. Rejection Criteria

‏נדחה tactic אם:

```text
fill rate improves but net edge falls
works only with optimistic queue model
requires stale signal tolerance
increases duplicate/unknown exposure risk
creates unacceptable cancel/replace churn
worsens TimeToFlat
requires unsupported broker semantics
cannot be replayed/recovered deterministically
only works in one symbol/day/regime without robustness
```

---

## ‏51. Replay Fidelity Ladder

### ‏Level 0 — Naive / Diagnostic Only

```text
touch = fill
```

‏אינו Promotion Evidence.

### ‏Level 1 — Quote/Trade Aware

```text
latency
spread
trade-through evidence
partial/no-fill outcomes
```

### ‏Level 2 — Queue-Aware

```text
volume-ahead estimate
queue confidence
cancel/add/depletion model
```

### ‏Level 3 — Recorded Execution Calibration

```text
real broker fills
real order lifecycle
real latency distributions
real markout
real no-fill behavior
```

‏כל Result מציין fidelity level.

---

## ‏52. Counterfactual Limits

‏Shadow/Replay אינם יכולים לדעת בוודאות:

```text
what hidden liquidity would have interacted
our exact queue position
how our unsubmitted order would change the market
our true route under alternative policy
our own impact under alternative size/tactic
```

‏לכן Counterfactual מקבל Confidence.

‏אין “oracle execution”.

---

## ‏53. Golden Execution Scenarios

‏Baseline scenarios:

1. ‏Immediate full fill.
2. ‏Partial then cancel.
3. ‏Partial then signal reversal.
4. ‏Cancel/fill race.
5. ‏Replace while old attempt potentially live.
6. ‏Stale signal before ACK.
7. ‏Price moves through hard bound.
8. ‏Disconnect after Submit before ACK.
9. ‏Duplicate fill notification.
10. ‏Out-of-order broker events.
11. ‏Order rejection.
12. ‏Trade at our price without fill.
13. ‏Queue replenishment/hidden-liquidity inference.
14. ‏Fast-market spread expansion.
15. ‏Halt/resume generation change.
16. ‏No-fill then winner continues.
17. ‏No-fill then reversal.
18. ‏Good fill price / toxic markout.
19. ‏Entry easy / exit thin.
20. ‏Exit partials before Flat.

---

## ‏54. Property / Invariant Tests

```text
FilledQty <= MaximumAuthorizedQty
ActualPosition = Sum(EffectiveFills)
DuplicateFillEvent changes exposure once
CancelRequest alone never marks order Canceled
Unknown broker state blocks new entry risk
Hard intent price bound is never exceeded by our generated intent
Expired signal cannot generate new entry side effect
Partial fill immediately updates risk/exposure
PotentiallyLiveQty is counted before new size approval
Same state + same events + same versions => same canonical execution result
Flat => no position + no potentially-live exposure
```

---

## ‏55. Price Logic Golden Tests

‏נבדוק:

```text
tick rounding
marketable/non-marketable boundary
locked market
crossed market
wide spread
missing bid/ask
stale quote
price movement during submit
hard-bound rejection
```

---

## ‏56. Queue Logic Golden Tests

‏נבדוק:

```text
large volume ahead
queue depletion
cancels ahead
replace resets/reduces queue confidence
trade at price without fill
hidden/replenishment observation
sequence gap destroys queue confidence
```

---

## ‏57. Partial Fill Golden Tests

```text
one partial
multiple partials
partial then cancel
partial during cancel race
partial then signal reversal
partial then exit
partial plus target resize
```

---

## ‏58. Unknown Effect Golden Test

```text
Submit
→ connection loss
→ no ACK
→ restart
→ broker reconciliation
→ prove no duplicate exposure
```

‏זה Promotion Blocker לכל Execution Engine.

---

## ‏59. Exit Golden Tests

```text
signal decay while position open
thin exit liquidity
partial exit
exit order rejected
exit timeout with unknown effect
risk-priority exit during scanner overload
confirmed flat only after reconciliation
```

---

## ‏60. Performance / Latency Relationship

‏Execution analysis ישמור:

```text
DecisionToArrival
ArrivalToFill
CancelDecisionToSend
CancelSendToConfirm
ExitDecisionToFlat
```

‏ונשווה ל־:

```text
SignalHalfLife
BookHalfLife
```

‏Policy מהירה מקומית אך stale end-to-end אינה low-latency economically.

---

## ‏61. Fast Path / Deep Path

‏Fast feasibility לכל Candidate רלוונטי:

```text
quote freshness
spread
basic depth
hard-bound feasibility
signal age
risk state
```

‏Deep execution analysis ל־Top-N:

```text
multi-level depth
queue estimate
flow/book context
expected markout
routing context
capacity
missed-opportunity model
```

‏Deep Path אינו רשאי לעכב מעבר ל־Signal TTL.

---

## ‏62. Failure Modes / RCA Taxonomy

```text
EX58_STALE_SIGNAL
EX58_STALE_QUOTE
EX58_PRICE_MOVED
EX58_HARD_BOUND_HIT
EX58_QUEUE_TOO_DEEP
EX58_QUEUE_UNKNOWN
EX58_NO_FILL
EX58_PARTIAL_ONLY
EX58_CANCEL_FILL_RACE
EX58_REPLACE_OVERLAP
EX58_CHASE_TOO_FAR
EX58_ORDER_REJECTED
EX58_BROKER_UNKNOWN_EFFECT
EX58_DUPLICATE_EVENT
EX58_ROUTE_UNFAVORABLE
EX58_PRICE_IMPACT
EX58_ADVERSE_SELECTION
EX58_HIDDEN_LIQUIDITY_ASSUMPTION
EX58_MARKET_GENERATION_MISMATCH
EX58_SESSION_CAPABILITY_MISMATCH
EX58_EXIT_GIVEBACK
EX58_EXIT_NOT_FLAT
EX58_LATENCY_TOO_HIGH
EX58_DATA_STALE
EX58_UNKNOWN
```

‏RCA שומר:

```text
primary cause
contributing causes
confidence
first divergence
evidence ids
```

---

## ‏63. First Divergence

‏במקום “למה העסקה הפסידה?”:

```text
Prediction?
Data Freshness?
Rank?
Execution Feasibility?
Routing?
Queue?
Fill?
Markout?
Exit?
Recovery?
```

‏נבחר את ה־first divergence הנתמך ב־Evidence.

---

## ‏64. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Order lifecycle הוא asynchronous.
- ‏Partial Fill יוצר Exposure אמיתי.
- ‏Cancel request לבדו אינו Confirmation.
- ‏Displayed liquidity אינה guarantee של future executable liquidity.
- ‏Fill price לבדו אינו מודד Post-Fill outcome.

### ‏Judgment

- ‏Champion ראשון צריך להיות פשוט, bounded ו־explainable.
- ‏Hard price bound + short economic TTL + revalidation הם Baseline חזק למחקר שלנו.
- ‏TimeToFlat ו־NetEdgeRetained חשובים יותר מ־FillRate לבדו.
- ‏Advanced Order Types צריכים להתחיל כ־Challengers.

### ‏Hypothesis

- ‏Marketable-limit benchmark עשוי לשמר יותר edge מ־passive touch בחלק מ־short-TTL regimes.
- ‏Queue-aware cancellation עשויה לשפר NetEdgeRetained.
- ‏Short ladder/hysteresis עשויים להפחית missed opportunity בלי excessive chase.
- ‏Route/venue differences עשויים להיות regime-dependent.

‏כל Hypothesis מחייב Experiment/OOS evidence.

---

## ‏65. Time-Sensitive Facts

‏הפרק אינו מקבע כאן semantics ספציפיים של Broker/Venue.

‏לפני שימוש ב־capability כגון:

```text
Post Only
IOC
FOK
AON
Pegged
Midpoint
Reserve/Iceberg
OCO/OCA/Bracket
Direct Routing
Session-specific order type
Fractional quantity
```

‏נבצע Current Verification של:

```text
support
exact semantics
priority/reprice behavior
session restrictions
quantity/tick rules
cancel/replace lifecycle
paper/live differences
```

‏לא נדרש Web verification חדש למקטע 58 עצמו משום שה־Recommendation נשאר provider/broker-neutral ולא מקבע capability משתנה בזמן.

---

## ‏66. What I Would Avoid Initially

‏לא נתחיל עם:

```text
complex dynamic price ladders
multi-route optimization
venue-specific learned policies
pegged logic with many branches
reserve/iceberg tactics
client-side synthetic bracket tree
per-symbol execution thresholds
ML fill/toxicity router
rapid cancel/replace loops
```

‏לפני שיש Champion פשוט ו־measurement יציב.

---

## ‏67. What to Add Later

‏לאחר Evidence:

```text
queue-aware policy
expected markout model
route/venue conditioning
short deterministic ladder
midpoint challenger
pegged challenger
adaptive order TTL
adaptive urgency
partial-fill remainder policy
capacity-aware execution
regime-conditioned execution policy
```

---

## ‏68. Relationship to Earlier Sheets

### ‏38 — Queue Position

‏38 מגדיר איך Queue נאמדת ומה Confidence שלה.

‏58 משתמש ב־Queue בהחלטת tactic.

### ‏39 — Routing

‏39 מגדיר SMART/Direct evidence requirements.

‏58 מודד Route כחלק מ־Execution Outcome.

### ‏40 — Hidden / Midpoint / Pegged / ATS

‏40 מגדיר capability classes.

‏58 מגדיר מתי complexity כזו בכלל מצדיקה כניסה ל־Execution Policy.

### ‏41 — Broker Algos

‏41 מגדיר advanced broker algo discipline.

‏58 משמר simple-policy benchmark נגדם.

### ‏46 — Adverse Selection

‏46 הוא Source of Truth ל־Markout/Fill Conditionality.

‏58 מכניס אותם ל־tactic selection.

### ‏47 — Capacity

‏47 מגדיר impact/capacity constraints.

‏58 כולל אותם ב־Execution Budget.

### ‏48 — Latency

‏48 מגדיר signal-half-life / tail-latency contract.

‏58 משתמש בו ל־Order aging, Chase ו־TTL.

### ‏51 — Execution Engine

‏51 הוא Source of Truth ל־durable state, IDs, reconciliation ו־pending exposure.

‏58 הוא Source of Truth ל־economic execution-policy subtleties מעל המנוע.

### ‏57 — Operating Habits

‏57 מקבע revalidation, TimeToFlat, NO_TRADE ו־simple Champion כהרגלים.

‏58 מפרט את ה־Execution mechanics שמאחוריהם.

---

## ‏69. Relationship to 59

‏58 שואל:

```text
Given the market evidence we have,
how should an order behave and how do we judge execution?
```

‏59 יעבור לשאלה הקודמת בשרשרת:

```text
Can we trust the market evidence itself,
and what subtle feed semantics can create false signals?
```

‏לכן 59 — `Market Data Subtleties` — הוא המשך ישיר: execution correctness תלויה ב־data semantics נכונים.

---

## ‏70. Confidence

### ‏High Confidence

```text
async order-state modeling
partial-fill/pending-exposure handling
hard-bound discipline
signal TTL/revalidation
markout/no-fill measurement
TimeToFlat
simple Champion first
```

### ‏Medium Confidence / Requires Calibration

```text
queue-value estimates
chase budgets
hysteresis
short price ladder
route conditioning
adaptive TTL
```

### ‏Low / Specialist Until Evidence

```text
precise hidden-liquidity inference
exact queue reconstruction without MBO truth
venue-specific predictive routing
complex synthetic order trees
ML execution router
```

---

## ‏71. Recommendation Summary

‏המלצת 58 היא:

```text
Signal Validity
→ Execution Feasibility
→ Bounded Simple Policy
→ Durable Async State
→ Queue / Route / Fill Evidence
→ Remaining Edge Recheck
→ Exit / Flat
→ Net Edge Retained
→ RCA
```

‏במשפט אחד:

> ‏**נבחר Execution Policy שמרנית, bounded וניתנת להסבר, נשפוט אותה לפי `NetEdgeRetained + TimeToFlat + Markout + MissedOpportunity`, ונוסיף Order/Route complexity רק כאשר היא מנצחת Champion פשוט באופן יציב וניתן לשחזור.**
