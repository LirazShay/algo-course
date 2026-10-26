# ‏18 — Recommendation Sheet: True Trading Costs / Net Edge

> ‏מקור לימודי עיקרי: `../18-TRUE-TRADING-COSTS-AND-NET-EDGE.md`.
>
> ‏מטרת הקובץ: לקבוע Cost Model אחיד שמתרגם `Gross Opportunity` ל־`Executable Net Edge`, מפריד בין עלויות נצפות וממודלות, משתמש ב־Round Trip מלא, נשען על Fee Schedules מתוארכים, ומאפשר ל־Scanner/Decision/Entry/Exit להחליט על בסיס כלכלה אמיתית ולא על תנועת מחיר תאורטית.

---

## ‏1. Decision

‏המערכת צריכה לענות על השאלה:

```text
How much economic edge remains
from the original signal
once realistic entry, holding and exit friction are included?
```

‏ולא רק:

```text
How much did the market price move?
```

‏נדרש להפריד בין:

```text
Theoretical Gross Opportunity
Executable Gross Opportunity
Explicit Costs
Implicit Costs
Execution Uncertainty
Executable Net Edge
Realized Net PnL
```

‏כך נוכל לדעת האם Strategy באמת בעלת Edge, ואם לא — איפה בדיוק הוא נעלם.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Round-Trip Cost Model מלא

‏כל Candidate, Trade ו־Backtest חייבים לחשוב על:

```text
ENTRY
+
EXIT
```

‏ולא רק על עלות הקנייה.

‏Baseline Cost Decomposition:

```text
Explicit observed / scheduled costs
-----------------------------------
entry commission
exit commission
exchange / venue fees
clearing / pass-through fees
regulatory fees
routing fees when applicable
currency-conversion cost when relevant

Implicit / execution costs
--------------------------
quoted-spread exposure
effective spread
entry slippage
exit slippage
market impact
latency / decision-to-fill drift
partial-fill friction
adverse selection
missed-opportunity cost
```

‏לא כל רכיב יחול בכל Trade, אבל כל רכיב חייב להיות מיוצג במודל כ־`applicable / not_applicable / unknown` ולא להיעלם בשקט.

### ‏`P0 — Required`: שלוש שכבות PnL נפרדות

‏נשמור תמיד:

```text
TheoreticalPnL
ExecutableGrossPnL
ExecutableNetPnL
```

‏פירוש:

```text
TheoreticalPnL
= outcome under a theoretical market reference

ExecutableGrossPnL
= outcome using realistic executable entry/exit prices
  before explicit fees

ExecutableNetPnL
= executable outcome after all applicable costs
```

‏כך Backtest או Dashboard לא יוכלו להסתיר את הפער בין `Last-to-Last` לבין כסף שניתן היה לממש בפועל.

### ‏`P0 — Required`: Cost Engine עצמאי ומפורש

‏Cost logic לא יהיה מפוזר בתוך Scanner, Entry, Exit ו־PnL code.

‏Baseline:

```text
Market / Fill State
        ↓
Cost Engine
        ↓
Cost Breakdown
        ↓
Net Economics
```

‏ה־Cost Engine יקבל Input מפורש ויחזיר Output מפורש.

‏Contract בסיסי:

```text
CostInput
---------
trade_id / decision_id
instrument_id
side / round-trip context
quantity
notional
entry_reference
entry_fills
exit_reference
exit_fills
execution_mode
venue / route when known
broker / account pricing profile
cost_schedule_version
market-state snapshot

CostOutput
----------
commission
regulatory_fees
exchange_fees
clearing_fees
routing_fees
spread_cost
entry_slippage
exit_slippage
impact_estimate
adverse_selection_measure
opportunity_cost_measure
fixed_cost_allocation_if_used
currency_cost_if_relevant
total_observed_cost
total_modeled_cost
total_cost
cost_bps
cost_confidence
```

### ‏`P0 — Required`: `Observed`, `Scheduled`, `Estimated`, `Modeled` אינם אותו דבר

‏כל Cost Component חייב לקבל `measurement_type`:

```text
OBSERVED
SCHEDULED
ESTIMATED
MODELED
UNKNOWN
```

‏דוגמאות:

```text
broker-reported commission → OBSERVED
published regulatory schedule → SCHEDULED
future exit slippage before trade → ESTIMATED
queue/impact simulation → MODELED
missing fee breakdown → UNKNOWN
```

‏אסור להציג `EstimatedCost` כאילו נצפה בפועל.

### ‏`P0 — Required`: Fee Schedule מתוארך ומגרוס

‏כל רכיב עלות תלוי־זמן יגיע מ־configuration/data עם:

```text
cost_schedule_id
provider / broker
account_entity
pricing_plan
instrument_scope
fee_type
formula
minimum
maximum / cap
currency
valid_from
valid_to
source_reference
verified_at
version
```

‏Backtest היסטורי חייב להשתמש ב־schedule שהיה תקף בתאריך ההיסטורי, ולא בהכרח ב־schedule הנוכחי.

### ‏`P0 — Required`: Unknown Cost State לא הופך אוטומטית לאפס

‏אם Cost Component מהותי אינו ידוע:

```text
unknown != 0
```

‏ל־Live-risk eligibility:

```text
material cost unknown
=> economic viability unknown
=> NO NEW TRADE / research-only state
```

‏ל־Research ניתן להריץ Scenario ranges, אבל חייבים לסמן זאת.

### ‏`P1 — Preferred Default`: Expected Net Edge ב־Decision Layer

‏לפני Entry, ברירת המחדל הכלכלית תהיה:

```text
ExpectedNetEdge
=
ExpectedGrossOpportunity
- ExpectedEntryCost
- ExpectedExitCost
- RequiredSafetyMargin
```

‏והחלטה לא תישען רק על:

```text
PredictionScore
```

‏אלא על:

```text
Prediction quality
+
execution feasibility
+
expected total friction
+
remaining net headroom
```

### ‏`P1 — Preferred Default`: לשמור Gross ו־Net בנפרד

‏גם אם Decision בסוף משתמשת ב־`ExpectedNetEdge`, נשמור:

```text
expected_gross_edge_bps
expected_entry_cost_bps
expected_exit_cost_bps
expected_total_cost_bps
required_safety_margin_bps
expected_net_edge_bps
```

‏כך אפשר להבין:

```text
bad prediction
vs
expensive execution
vs
wrong cost estimate
```

### ‏`P1 — Preferred Default`: `Cost-to-Edge Ratio`

‏נחשב:

```text
CostToEdgeRatio
=
ExpectedTotalCost / ExpectedGrossEdge
```

‏כאשר `ExpectedGrossEdge <= 0`, היחס אינו Metric כלכלי שימושי ויש לסמן אותו בהתאם.

‏ה־Metric אינו Gate מוכח עדיין, אבל הוא Diagnostic חשוב להבנת שבריריות ההזדמנות.

### ‏`P1 — Preferred Default`: `BreakEvenMove` ו־`CostHeadroom`

‏נשמור:

```text
BreakEvenMove
≈ expected round-trip cost required before net profit
```

‏וכן:

```text
CostHeadroom
= BreakEvenCostOfStrategy - ExpectedActualCost
```

‏`BreakEvenCostOfStrategy` הוא מדד מחקרי — העלות הכוללת שבה EV של Strategy מגיע בקירוב לאפס.

### ‏`P1 — Preferred Default`: Safety Margin מפורש

‏לא נבצע Decision כאילו:

```text
expected net = +0.1 bp
```

‏הוא Edge אמין.

‏נדרש Margin שמכסה לפחות חלק מהאי־ודאות ב־:

```text
slippage variance
fill uncertainty
latency
cost prediction error
spread movement
exit deterioration
```

‏הערך המספרי של ה־Margin חייב להילמד מנתונים, לא להיקבע לפי תחושת בטן.

### ‏`P1 — Preferred Default`: Cost Distribution, לא Average יחיד

‏לכל Component מהותי נמדוד לפחות:

```text
P50
P75
P90
P95
P99
mean
worst / tail sample
```

‏ובחתכים רלוונטיים:

```text
symbol / liquidity bucket
session / time of day
volatility regime
execution mode
order size bucket
spread bucket
winner / loser
entry vs exit
```

‏ב־Short-Horizon Strategy זנבות העלות יכולים להיות חשובים יותר מהממוצע.

### ‏`P1 — Preferred Default`: לפני Trade להשתמש Cost Estimate שמרני אך מדוד

‏Baseline ראשוני למחקר:

```text
P50 observed estimate
P75/P90 conservative challenger
stress multipliers
```

‏לא נבחר אוטומטית `worst case` קיצוני לכל Trade, אבל גם לא נניח ביצוע מושלם.

### ‏`P1 — Preferred Default`: Actual Cost לאחר Close חוזר לכייל את המודל

‏לכל Trade נשמור:

```text
ExpectedCostAtDecision
ActualObservedCost
ActualModeledResidualCost
ActualTotalCost
CostPredictionError
```

‏כאשר:

```text
CostPredictionError
= ActualTotalCost - ExpectedCostAtDecision
```

‏ננתח Bias ו־Calibration לפי Buckets.

### ‏`P1 — Preferred Default`: Net-Aware Labels

‏למחקר ניצור לצד Gross Labels גם:

```text
forward_1s_net_return
forward_2s_net_return
forward_5s_net_return
forward_10s_net_return
forward_30s_net_return
forward_60s_net_return
net_mfe
net_mae
time_to_first_net_profit
time_to_break_even_after_costs
```

‏Labels אלה חייבים להיות execution-aware ככל שהנתונים מאפשרים.

### ‏`P1 — Preferred Default`: Cost-aware Entry ו־Exit

‏Entry:

```text
remaining expected edge
- current entry friction
- expected exit friction
- safety margin
```

‏צריך להישאר חיובי מספיק לפני Chase/Submit.

‏Exit:

‏Profit Target ו־Break-Even צריכים להיות במונחי `realizable net result`, לא `Last` בלבד.

### ‏`P1 — Preferred Default`: Cost Stress Testing

‏כל Strategy/Policy צריכה לעבור לפחות:

```text
observed baseline
cost × 1.25
cost × 1.5
cost × 2.0
```

‏או תרחישים מבוססי Percentile.

‏המספרים הם Grid מחקרי, לא Claim שהעלויות באמת יוכפלו.

‏המטרה היא למדוד Fragility.

### ‏`P1 — Preferred Default`: Cost Drift Monitoring

‏ננטר:

```text
expected_cost_bps
actual_cost_bps
cost_prediction_error
entry_slippage
exit_slippage
spread_cost
fill latency
cost by execution policy
```

‏ועלייה מהותית מול Baseline היסטורי תפעיל Alert/Investigation.

---

## ‏3. Why

### ‏Fact

‏`Gross PnL` ו־`Net PnL` אינם אותו דבר.

‏ב־Round Trip קיימים לפחות שני צדי Execution, ובאסטרטגיה קצרה Spread, Slippage ו־Latency יכולים להיות material ביחס ל־Target.

### ‏Fact

‏`Limit` Passive יכול להפחית direct spread crossing אך להגדיל `No Fill`, ‏waiting time ו־adverse-selection risk.

### ‏Fact

‏Fill במספר Executions צריך להימדד לפי VWAP של ה־fills בפועל.

### ‏Fact

‏Fee schedules אינם קבועים לנצח; Regulatory/Broker/Venue pricing יכולים להשתנות לפי תאריך, ישות, תכנית, Route ו־liquidity treatment.

### ‏Judgment

‏עבור המערכת שלנו, Cost Model הוא חלק מ־Decision Architecture ולא שכבת Reporting שמופעלת רק לאחר שהעסקה הסתיימה.

### ‏Hypothesis

‏ייתכן ש־`ExpectedNetEdge`, ‏`CostToEdgeRatio`, ‏Cost Percentiles ו־Cost Headroom ישפרו Selection יותר מאשר Ranking על Gross Momentum בלבד.

‏כל טענה כזו דורשת OOS/Ablation.

---

## ‏4. Economic Chain

```text
Gross signal opportunity
→ decision latency
→ entry feasibility
→ entry execution
→ entry costs
→ holding path
→ exit decision
→ exit execution
→ exit costs
→ realized net outcome
```

‏לכן:

```text
Signal correct
```

‏אינו מספיק כדי להסיק:

```text
Trade economically successful
```

---

## ‏5. Cost Taxonomy

### ‏5.1 Explicit / Scheduled

```text
broker commission
minimum commission
exchange / ECN fees
clearing fees
regulatory fees
routing / pass-through fees
```

### ‏5.2 Execution / Implicit

```text
quoted spread exposure
effective spread
entry slippage
exit slippage
market impact
latency drift
partial-fill friction
adverse selection
```

### ‏5.3 Opportunity

```text
no-fill missed move
waiting while signal decays
capital tied in dead position
switching / replacement friction
```

### ‏5.4 System-Level Fixed Costs

```text
market-data subscriptions
infrastructure
storage / archive
monitoring
software subscriptions
```

‏אלה אינם בהכרח `per-trade execution cost`, ולכן יש לשמור אותם בנפרד ולא להעמיס אותם באופן שרירותי על Fill בודד.

### ‏5.5 Out-of-Scope for Execution Cost

‏מסים הם שכבת Accounting/After-Tax נפרדת.

‏לא מערבבים אותם בתוך `execution_cost_bps`.

---

## ‏6. Cost References

‏Slippage חייב להימדד מול Reference מוגדר.

‏נשמור למשל:

```text
signal_mid
signal_bid
signal_ask
decision_mid
decision_bid
decision_ask
submit_mid
submit_bid
submit_ask
fill_vwap
```

‏ואז נוכל לחשב בנפרד:

```text
signal_to_decision_drift
decision_to_submit_drift
submit_to_fill_slippage
effective_spread
implementation_shortfall
```

‏לא משתמשים במילה `slippage` עבור כל הפערים יחד בלי Attribution.

---

## ‏7. Spread Measurement

‏נשמור:

```text
quoted_spread_abs
quoted_spread_bps
half_spread_bps
```

‏אבל Cost בפועל ייגזר מה־Execution:

```text
aggressive buy at ask
passive fill at bid
midpoint / price improvement
multi-level fill
```

‏לכן:

```text
quoted spread
!= always realized spread cost
```

---

## ‏8. Slippage Measurement

‏Entry ו־Exit נשמרים בנפרד:

```text
entry_slippage_vs_decision_mid
entry_slippage_vs_decision_ask
entry_slippage_vs_submit_mid

exit_slippage_vs_exit_decision_mid
exit_slippage_vs_exit_decision_bid
exit_slippage_vs_submit_mid
```

‏לא כל Benchmark מתאים לכל שאלה.

‏ה־RCA צריך לדעת מהו ה־Reference.

---

## ‏9. Market Impact

‏ב־Baseline הראשוני, אם order size קטן ביחס ל־L1/depth observable, אפשר להתחיל ב־simple size-aware estimate.

‏אבל:

```text
impact = 0
```

‏אינו Default אוניברסלי.

‏Promotion למודל מורכב יותר יידרש אם:

```text
planned size materially consumes displayed liquidity
slippage grows with size
multi-level fills common
size scaling changes net outcome
```

---

## ‏10. Adverse Selection

‏Passive Fill שנראה זול יכול להיות יקר כלכלית אם השוק ממשיך נגדנו מיד אחרי Fill.

‏נמדוד:

```text
markout_1s
markout_2s
markout_5s
markout_10s
```

‏לפי Reference עקבי.

‏`price improvement` בלי post-fill outcome אינו מספיק כדי להכריז על Execution Quality טובה.

---

## ‏11. Opportunity Cost

‏No Fill הוא תוצאה מלאה.

‏נשמור:

```text
attempted_entry
fill_status
candidate outcome after no-fill
best executable outcome in horizon
missed_move
```

‏כך אפשר להשוות:

```text
cheap passive execution
vs
higher fill probability
```

‏במונחי Net Strategy Value ולא רק Commission.

---

## ‏12. Cost Schedule Versioning

‏נדרש store מרכזי:

```text
CostSchedule
```

‏עם לפחות:

```text
schedule_id
source_type
broker_or_regulator
account_entity
pricing_plan
fee_name
formula
minimum
maximum
unit
currency
side_applicability
instrument_scope
venue_scope
valid_from
valid_to
source_reference
verified_at
notes
```

‏Research Engine חייב לבחור Schedule לפי `trade_date`, לא לפי current date בלבד.

---

## ‏13. Current Verification Snapshot — 2026-10-26

### ‏SEC `Section 31`

‏ה־SEC פרסמה ב־27 בפברואר 2026 כי עבור FY2026, החל מ־4 באפריל 2026, שיעור ה־Section 31 הרלוונטי לרוב covered securities transactions הוא:

```text
$20.60 per $1,000,000
```

‏והודיעה שהשיעור יישאר בתוקף עד 60 ימים לאחר חקיקת ההקצבה ל־FY2027, אלא אם תפורסם הודעה מתאימה אחרת.

‏מסקנת Recommendation:

```text
SEC-related transaction charge
must be date-versioned
and re-verified before operational use
```

### ‏FINRA `TAF`

‏FINRA פרסמה ב־2026 את `SR-FINRA-2026-021` כ־rule filing ב־immediate-effectiveness track, המתאר הפסקה זמנית של assessment ה־Trading Activity Fee לעסקאות מ־:

```text
2026-10-01
through
2026-12-31
```

‏זהו בדיוק סוג השינוי שמוכיח כי:

```text
regulatory_fee = hardcoded constant
```

‏הוא Anti-Pattern.

### ‏IBKR US Stock Pricing

‏עמוד התמחור הרשמי של IBKR מציג כיום מסלולי `IBKR Pro Tiered`, ‏`IBKR Pro Fixed` ו־`IBKR Lite` ללקוחות זכאים, עם minimums/third-party treatment שונים.

‏IBKR גם מציינת שה־published direct-client rates עשויים לא לחול על לקוחות שמגיעים דרך introducing broker/advisor ושיכולות להיות עמלות נוספות.

‏לכן:

```text
IBKR public pricing page
!= automatically user's effective account schedule
```

‏לפני שימוש תפעולי יש לאמת את ה־entity, ‏pricing plan וה־actual statements של החשבון הרלוונטי.

### ‏Sources verified

- ‏SEC — `Section 31 Transaction Fee Rate Advisory for Fiscal Year 2026`, published 2026-02-27.
- ‏SEC — `Section 31 Transaction Fees: Basic Information for Firms`.
- ‏FINRA — Rule Filing Status for `SR-FINRA-2026-021`.
- ‏Interactive Brokers — official `Commissions Stocks` / pricing-structure documentation.

---

## ‏14. Use When

‏ה־Baseline חל על:

- ‏Backtests.
- ‏Replay.
- ‏Shadow decisions.
- ‏Paper execution evaluation.
- ‏Live-observation telemetry.
- ‏Trade/No-Trade research.
- ‏Entry/Exit policy comparison.
- ‏Candidate comparison.
- ‏RCA.

‏בפרט הוא חיוני כאשר Gross targets קטנים ביחס ל־spread/slippage.

---

## ‏15. Do Not Use When

‏אין להציג `ExpectedNetEdge` כאמין אם:

- ‏Fee schedule לא ידוע.
- ‏Execution reference לא מוגדר.
- ‏אין Bid/Ask/Fill model מתאים.
- ‏Slippage מבוסס על constant שרירותי בלבד.
- ‏Partial fills נעלמים מהסימולציה.
- ‏Entry/Exit costs לא מופרדים.
- ‏Historical fees משתמשים ב־current schedule בלבד.
- ‏Broker statement אינו reconciled עם observed fills/fees.
- ‏Cost prediction error אינו נמדד.

---

## ‏16. Alternatives

### ‏Alternative A — Flat Constant Cost

```text
cost = X bps per round trip
```

‏שימוש:

- ‏Sanity baseline מוקדם בלבד.

‏יתרון:

- ‏פשוט.

‏חיסרון:

- ‏מסתיר regime/symbol/size/execution variation.

### ‏Alternative B — Spread + Fixed Commission

‏טוב יותר מ־zero-cost backtest, אך עדיין חסרים:

```text
slippage
fill risk
impact
latency
partial fills
```

### ‏Alternative C — Empirical Conditional Cost Model

‏זהו ה־Preferred direction לאחר שיש observations:

```text
cost conditioned on
spread
size
liquidity
session
execution mode
volatility
```

### ‏Alternative D — Full Microstructure Fill/Impact Model

‏`P3/P4` בלבד כאשר Dataset והצורך מצדיקים.

‏אין לבנות אותו לפני שמודל פשוט כבר מראה איפה החסר.

---

## ‏17. Trade-offs

### ‏More Conservative Cost Estimate

‏יתרון:

- ‏מפחית false-positive strategies.

‏מחיר:

- ‏עלול לפסול Opportunities אמיתיות אם ההנחה מוגזמת.

### ‏More Granular Cost Model

‏יתרון:

- ‏Attribution ו־accuracy טובים יותר.

‏מחיר:

- ‏יותר data, complexity ו־maintenance.

### ‏Passive Execution

‏עשויה להקטין direct spread/slippage.

‏אבל מגדילה:

```text
no-fill risk
signal decay
opportunity cost
adverse selection
```

### ‏Aggressive Execution

‏עשויה לשפר fill timing.

‏אבל מגדילה:

```text
spread crossing
slippage
impact
```

---

## ‏18. What I Would Avoid Initially

- ‏`Last-to-Last` PnL כמדד Strategy.
- ‏`commission = 0` בגלל כותרת שיווקית.
- ‏Fee constants ללא `valid_from/valid_to`.
- ‏Slippage constant יחיד לכל Symbols/Regimes.
- ‏Gross Return כ־optimization objective.
- ‏להתעלם מ־minimum commission.
- ‏להתעלם מ־Round Trip.
- ‏לספור only executed trades ולהעלים No-Fill opportunity cost.
- ‏לערבב fixed infrastructure cost עם execution cost בלי הבחנה.
- ‏לערבב tax בתוך execution quality.
- ‏להציג maker rebate כ־Edge בפני עצמו.
- ‏לכייל Cost Model על אותם trades שעליהם מודדים final performance בלבד.
- ‏Full-depth impact model לפני שיש evidence ש־L1/observed fills אינם מספיקים.

---

## ‏19. What to Add Later

### ‏`P2`

- ‏Conditional slippage model.
- ‏Cost percentiles by regime.
- ‏Cost-aware candidate selection.
- ‏No-fill opportunity-cost model.
- ‏Actual-vs-expected cost calibration.
- ‏Cost drift alerts.

### ‏`P3`

- ‏Venue/liquidity-flag attribution.
- ‏Maker/taker economics where operationally relevant.
- ‏Size-impact curves.
- ‏Separate passive/adverse-selection models.
- ‏Dynamic conservative percentile by regime.

### ‏`P4`

- ‏Full venue-specific routing economics.
- ‏Detailed queue/impact simulation.
- ‏Cost-sensitive learned execution policy.

---

## ‏20. Required Data / Evidence

### ‏Per Decision

```text
decision_id
signal_time
decision_time
instrument_id
prediction_snapshot
planned_qty
expected_horizon
entry_execution_mode
expected_gross_edge
expected_entry_cost
expected_exit_cost
expected_total_cost
required_safety_margin
expected_net_edge
cost_model_version
cost_schedule_version
```

### ‏Per Entry Attempt

```text
order_intent_id
submit_time
entry_reference_bid
entry_reference_ask
entry_reference_mid
requested_qty
fills
fill_vwap
entry_slippage
commission / fees observed
fill latency
no-fill outcome
```

### ‏Per Position / Exit

```text
exit_reason
exit_decision_time
exit_reference_bid
exit_reference_ask
exit_reference_mid
exit_fills
exit_fill_vwap
exit_slippage
exit fees
hold time
time_to_flat
```

### ‏Per Closed Trade

```text
gross_pnl
executable_gross_pnl
net_pnl
all cost components
total_cost_usd
total_cost_bps
expected_cost
cost_prediction_error
mfe / mae
net_mfe / net_mae
time_to_first_net_profit
time_to_break_even_after_costs
```

### ‏Schedule Evidence

```text
source
verified_at
valid_from
valid_to
account_entity
pricing_plan
fee formula
minimum / cap
```

---

## ‏21. Metrics

### ‏Economics

```text
avg gross pnl
avg executable gross pnl
avg net pnl
median net pnl
net EV
cost as % of gross edge
break-even cost
cost headroom
```

### ‏Cost Components

```text
commission_bps
regulatory_fee_bps
exchange_fee_bps
spread_cost_bps
entry_slippage_bps
exit_slippage_bps
impact_bps
```

### ‏Distribution

```text
P50/P75/P90/P95/P99 total cost
P50/P95 entry slippage
P50/P95 exit slippage
worst-tail cost
```

### ‏Calibration

```text
expected_cost
actual_cost
cost_prediction_error
bias
MAE / RMSE when useful
coverage by confidence bucket
```

### ‏Operational

```text
missing_cost_component_rate
unknown_schedule_rate
schedule_age
reconciliation_mismatch_rate
cost_drift_alerts
```

---

## ‏22. Promotion Criteria

‏Cost Model/feature/policy מתקדם רק אם:

1. ‏הוא point-in-time correct.
2. ‏Fee schedules מתוארכים ונבחרים לפי trade date.
3. ‏Observed ו־Modeled מסומנים בנפרד.
4. ‏Round Trip מלא.
5. ‏Entry ו־Exit costs נמדדים בנפרד.
6. ‏המודל calibrated מול observed fills/fees כאשר קיימים.
7. ‏Error distribution יציבה מספיק OOS.
8. ‏Stress tests אינם מוחקים מיד את כל ה־Edge.
9. ‏Cost-aware selection משפר net outcome ולא רק fitted backtest.
10. ‏התוספת מצדיקה את data/compute/maintenance cost שלה.

---

## ‏23. Rejection Criteria

‏נדחה או נחזיר Research component אם:

- ‏הוא דורש future information.
- ‏הוא מניח fee schedule שאינו תקף לתאריך/ישות.
- ‏הוא מסתיר unknown as zero.
- ‏הוא משפר Gross אבל מחמיר Net.
- ‏הוא calibrated רק in-sample.
- ‏הוא רגיש מאוד לפרמטר יחיד.
- ‏הוא לא מנצח simple conservative baseline.
- ‏הוא דורש data שאינו זמין reliably ב־Live.
- ‏הוא אינו explainable מספיק ל־RCA.

---

## ‏24. Failure Modes

### ‏FM1 — `Zero Cost Fantasy`

‏Backtest רווחי רק כי עלויות חסרות.

### ‏FM2 — `Current Fee Applied to History`

‏Schedule נוכחי מוחל על שנים קודמות.

### ‏FM3 — `Last-to-Last Bias`

‏מחיר לא־בר־ביצוע הופך ל־PnL.

### ‏FM4 — `One Slippage Number`

‏המודל מסתיר tails/regimes.

### ‏FM5 — `Minimum Commission Missed`

‏עמלה לפי share מחושבת אך minimum per-order נשכח.

### ‏FM6 — `Entry Only Costing`

‏Exit cost חסר.

### ‏FM7 — `Passive Is Free`

‏Spread saving נמדד, No-Fill/Adverse Selection לא.

### ‏FM8 — `Aggressive Is Always Fast`

‏Marketable behavior נחשב Fill ודאי בלי depth/latency risk.

### ‏FM9 — `Rebate Optimization`

‏Routing רודף Rebate במקום Net Trade Value.

### ‏FM10 — `Observed/Estimated Mixing`

‏Forecast ו־actual מוצגים כאותה שכבה.

### ‏FM11 — `Cost Drift Ignored`

‏Regime/route/provider משתנים אך model נשאר קבוע.

### ‏FM12 — `Cost Model Fixes Bad Signal`

‏מנסים להסביר gross move אפסי באמצעות fees.

### ‏FM13 — `Scanner Fixes Bad Execution`

‏משנים Features כאשר הבעיה האמיתית היא Slippage/Exit delay.

### ‏FM14 — `False Precision`

‏Expected Net Edge מוצג בדיוק של עשיריות bp כאשר uncertainty גדולה יותר.

---

## ‏25. User-Specific Application

‏למטרה שלנו — `Short-Horizon Momentum` שמחפש מהלך בר־ביצוע בתוך שניות ועד עשרות שניות — Cost Model הוא `P0` מחקרי.

‏ה־Baseline המומלץ:

```text
Candidate
→ estimate gross opportunity by target horizon
→ estimate entry friction
→ estimate exit friction
→ add schedule-based explicit fees
→ add conservative uncertainty margin
→ compute expected net edge
→ TRADE / NO TRADE research decision
```

‏דגש מיוחד:

```text
spread
entry slippage
exit slippage
time-to-fill / latency drift
no-fill opportunity cost
```

‏עשויים להיות material יותר מ־commission עצמה.

‏לכן לא ננסה “למצוא מניה שעולה הכי הרבה” בלבד.

‏המטרה היא:

```text
find the candidate with a repeatable
future executable net opportunity
```

‏ולא Candidate שמייצרת רק Gross movement על chart.

‏כל validation ראשוני צריך להיות ב־research/replay/shadow/paper conditions, עם promotion הדרגתי ורק תחת account/legal/safety readiness מתאים.

---

## ‏26. Concrete Baseline Contract

```text
CostModelInput
--------------
as_of_time
trade_date
instrument_id
side
planned_qty
entry_execution_mode
exit_execution_assumption
entry_bid
entry_ask
entry_mid
expected_horizon
expected_gross_edge_bps
broker_profile_id
cost_schedule_version
market_state

PreTradeCostEstimate
--------------------
expected_entry_spread_cost_bps
expected_entry_slippage_bps
expected_exit_spread_cost_bps
expected_exit_slippage_bps
expected_explicit_fees_bps
expected_impact_bps
uncertainty_margin_bps
expected_total_cost_bps
expected_net_edge_bps
cost_to_edge_ratio
cost_confidence

ClosedTradeCostResult
---------------------
entry_fill_vwap
exit_fill_vwap
observed_commission
observed_regulatory_fees
observed_exchange_fees
observed_other_fees
entry_slippage_bps
exit_slippage_bps
impact_estimate_bps
implementation_shortfall_bps
total_cost_bps
actual_net_pnl
cost_prediction_error_bps
```

---

## ‏27. Decision Contract

```text
if material_cost_state_unknown:
    NO_TRADE / RESEARCH_ONLY

elif expected_gross_edge <= 0:
    NO_TRADE

elif expected_net_edge < validated_minimum_net_edge:
    NO_TRADE

elif cost_to_edge_ratio exceeds validated boundary:
    NO_TRADE or SHADOW according to policy

else:
    candidate may continue to final execution recheck
```

‏ה־Thresholds עצמם אינם נקבעים במקטע 18; הם צריכים להגיע ממחקר OOS ו־robust regions.

---

## ‏28. Research Plan

### ‏Experiment A — Zero Cost vs Realistic Cost

```text
same signals
same horizons
same execution assumptions
compare gross vs realistic net
```

‏מטרה: למדוד כמה מה־apparent edge נעלם.

### ‏Experiment B — Cost Percentile Sensitivity

```text
P50
P75
P90
```

‏מטרה: למדוד robustness.

### ‏Experiment C — Policy Comparison

```text
PASSIVE
BALANCED
AGGRESSIVE
```

‏מטרה: להשוות:

```text
fill rate
cost
missed opportunity
net outcome
```

### ‏Experiment D — Gross Rank vs Net Rank

‏אותה Candidate set:

```text
rank by gross opportunity
vs
rank by expected net opportunity
```

‏בודקים OOS איזה ranking נותן Net Outcome טוב יותר.

### ‏Experiment E — Cost Calibration

```text
predicted cost bucket
vs
actual cost distribution
```

‏מטרה: למצוא Bias, underestimation ו־regime failures.

---

## ‏29. Testing Strategy

### ‏Unit Tests

- ‏Minimum/maximum fee formulas.
- ‏Round-trip aggregation.
- ‏VWAP calculation.
- ‏bps conversions.
- ‏date-based schedule selection.
- ‏Observed/Estimated classification.
- ‏Unknown propagation.

### ‏Property Tests

- ‏Increasing an applicable positive cost cannot improve Net PnL.
- ‏If all applicable costs are zero, Net equals Executable Gross.
- ‏Changing current schedule must not alter historical trade using older version.
- ‏Splitting a fill into identical-price sub-fills must preserve VWAP/PnL.

### ‏Replay Tests

- ‏Same events + same policy versions + same schedules ⇒ same cost result.

### ‏Integration Tests

- ‏Broker-reported fills/fees reconcile to stored trade breakdown.
- ‏Partial fills aggregate correctly.
- ‏Entry/Exit timestamps feed correct benchmark references.

---

## ‏30. Observability

‏Dashboard בסיסי:

```text
Expected gross edge
Expected total cost
Expected net edge
Actual total cost
Actual net pnl
Cost prediction error

Entry slippage P50/P95/P99
Exit slippage P50/P95/P99
Spread cost P50/P95/P99
Total cost P50/P95/P99

Cost by:
- hour
- symbol/liquidity bucket
- execution mode
- spread bucket
- volatility bucket
- winner/loser
```

‏Alert candidates:

```text
cost prediction bias drifts
unknown schedule appears
actual cost tail worsens
P95/P99 slippage jumps
cost-to-edge ratio rises materially
broker fee reconciliation breaks
```

---

## ‏31. Confidence

### ‏High Confidence

- ‏Net must be measured after full Round Trip costs.
- ‏Observed and modeled costs must remain distinct.
- ‏Fee schedules require versioning.
- ‏Gross movement alone is insufficient for short-horizon economics.
- ‏Unknown material cost cannot safely be assumed zero.

### ‏Medium Confidence

- ‏A conditional empirical cost model will outperform a single flat slippage constant once enough data exists.
- ‏Cost-aware Candidate decisions are likely more economically aligned than Gross-only decisions.

### ‏Low / Unproven

- ‏Exact minimum net-edge threshold.
- ‏Exact cost-to-edge threshold.
- ‏Which percentile should drive pre-trade estimate.
- ‏Whether Net Ranking should replace Prediction Ranking or remain a second-stage decision.
- ‏Whether venue-specific optimization adds value at our scale.

---

## ‏32. Time-Sensitive Facts

‏הפרטים הבאים חייבים להיבדק מחדש לפני כל Production use:

- ‏SEC Section 31 schedule.
- ‏FINRA TAF schedule/status.
- ‏Broker commission plan.
- ‏Introducing-broker/advisor markup.
- ‏Exchange/ECN fees and rebates.
- ‏Clearing/pass-through fees.
- ‏Routing-specific charges.
- ‏FX conversion pricing.
- ‏Any account-specific fee arrangement.

‏אין להניח שה־snapshot של 2026-10-26 יישאר נכון בעתיד.

---

## ‏33. Relationship to Later Sheets

- ‏`19` — Position Sizing/Risk ישתמש ב־Net Loss/Cost distributions ולא רק Gross Stop distance.
- ‏`20/21` — Backtesting חייב להשתמש ב־Cost Engine וב־execution-aware fills.
- ‏`22–24` — Scanner validation/experiments צריכים labels של executable net outcomes.
- ‏`25` — Regime analysis יבדוק Cost distributions לפי regime.
- ‏`26` — RCA יפריד prediction failure מ־cost/execution failure.
- ‏פרקי Execution מתקדמים ישפרו fill/impact/adverse-selection modeling.
- ‏Cross-Cutting `Recommended Execution Policy`, ‏`Backtest Policy`, ‏`Risk Controls` ו־`Production Safety` יישענו על Cost Model זה.

---

## ‏34. Recommendation Summary

```text
P0
- Full round-trip cost accounting
- Separate theoretical / executable gross / executable net PnL
- Independent Cost Engine
- Observed vs Scheduled vs Estimated vs Modeled classification
- Date-versioned fee schedules
- Unknown material cost != zero
- Entry and exit costs separated
- Actual fills/VWAP as execution truth

P1
- ExpectedNetEdge in decision layer
- Gross and net kept separately
- Safety margin
- CostToEdgeRatio diagnostics
- BreakEvenMove / CostHeadroom research
- Percentile cost distributions
- Net-aware labels
- Cost stress testing
- Actual-vs-expected calibration
- Cost drift monitoring

P2
- Conditional empirical cost model
- Cost-aware ranking challenger
- Opportunity-cost model
- Regime-specific percentiles

P3/P4
- Venue-specific fee/routing economics
- Detailed impact/queue model
- learned cost-sensitive execution policy
```

‏ה־Baseline המנטלי:

```text
Prediction says what might move.
Execution says what can fill.
Cost says what survives economically.
Risk says whether the remaining opportunity is acceptable.
```

‏לכן ההמלצה המעשית של מקטע 18 היא:

```text
Never promote a gross edge to a trade thesis
until it survives a realistic, versioned,
round-trip executable cost model.
```