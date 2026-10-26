# ‏41 — Recommendation Sheet: Advanced Broker Algos

> ‏מקור לימודי עיקרי: `../41-ADVANCED-BROKER-ALGOS.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי לשימוש ב־Broker Execution Algos כך שלא נבחר Algo לפי שם, branding או תחושת תחכום, אלא לפי התאמה בין `Execution Objective`, ‏Signal Horizon, ‏Order Size, ‏Liquidity, ‏Deadline, ‏Risk, ‏Safety ו־Evidence אמפירי.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי.

---

## ‏1. Decision

‏Broker Algo הוא כלי Execution לאחר החלטת Strategy, Risk ו־Safety.

‏ה־Baseline:

```text
Market Data
→ Scanner / Strategy
→ Decision
→ Risk Approval
→ Safety Approval
→ Execution Intent
→ Execution Objective
→ Execution Policy Selector
→ Simple Tactic or Broker Algo
→ Capability / Parameter Validation
→ Broker Adapter
→ Broker Events / Fills
→ Position Truth
→ Attribution / RCA / Experiment
```

‏השאלה אינה:

```text
Which broker algo is smartest?
```

‏אלא:

```text
What execution problem are we trying to solve,
and does this algo's objective fit the signal horizon,
size, liquidity, deadline and edge budget better than our simple baseline?
```

‏העיקרון המחייב:

```text
Algo != Alpha.
Objective first.
Signal TTL before execution sophistication.
Simple baseline before broker black box.
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Broker Algo לעולם אינו עוקף Strategy / Risk / Safety

‏ה־Broker אינו מחליט אם בכלל כדאי לבצע את ה־Trade.

‏הוא מקבל Intent שכבר עבר:

```text
Decision
→ Risk
→ Safety
→ Execution authorization
```

‏ולכן:

```text
Broker Algo
< Price Protection
< Risk
< Safety
```

### ‏`P0 — Required`: ‏Execution Objective לפני Product Name

‏ה־Domain לא יתחיל מ־string כגון:

```text
"ArrivalPx"
"PctVol"
"Twap"
"Vwap"
```

‏אלא מ־semantic objective:

```text
MINIMIZE_SHORT_HORIZON_DELAY
BALANCE_PRICE_AND_URGENCY
MINIMIZE_IMPLEMENTATION_SHORTFALL
FOLLOW_TIME_SCHEDULE
FOLLOW_VOLUME_SCHEDULE
LIMIT_PARTICIPATION
REDUCE_FOOTPRINT
```

‏רק ה־Adapter מתרגם Objective ל־Provider-specific capability.

### ‏`P0 — Required`: ‏Strategy Deadline גובר על Broker Algo Schedule

‏נשמור שלושה clocks נפרדים:

```text
decision_deadline
execution_deadline
broker_algo_end_time
```

‏אם:

```text
broker_algo_end_time > strategy_deadline
```

‏ה־Algo אינו מורשה להמשיך באופן אוטומטי מעבר ל־Strategy deadline.

‏ברגע שה־Signal אינו תקף:

```text
STOP_CREATING_NEW_EXPOSURE
```

‏גם אם ה־Broker Algo היה מעדיף להמשיך לעבוד.

### ‏`P0 — Required`: ‏Simple Protected Execution הוא ה־Control

‏ה־Control הראשי נשאר:

```text
Protected Marketable Limit
```

‏ובמקום שבו נדרש גם baseline פסיבי:

```text
Simple Passive + explicit TTL
```

‏כל Broker Algo חייב להראות incremental value מעל Control ברור.

### ‏`P1 — Preferred First Challenger`: ‏Adaptive

‏לרובוט Short-Horizon, ‏`Adaptive` הוא ה־Broker Algo הראשון הסביר למחקר משום שהבעיה שהוא מנסה לפתור קרובה יותר לבעיה שלנו:

```text
urgency
vs
price improvement
```

‏אבל הוא נשאר Challenger, לא Default אוטומטי.

‏נשווה אותו ל־Protected Marketable Limit תחת אותו Intent, אותו Risk, אותו Signal TTL ואותו Price Budget.

### ‏`P2/P3`: ‏Arrival-style רק כאשר Implementation Shortfall / Impact באמת בעיה

‏Arrival-style execution רלוונטי רק אם:

- ‏Order Size כבר משמעותי יחסית ל־liquidity.
- ‏Impact אמיתי נמדד.
- ‏Execution horizon ארוך מספיק.
- ‏ה־benchmark מתאים לבעיה.

‏לא נשתמש בו רק מפני ש־Arrival Price הוא benchmark מקצועי.

### ‏`P3/P4`: ‏TWAP / VWAP / POV הם Capacity Tools, לא Baseline ל־Signal של שניות

‏ברירת המחדל למחקר שלנו:

```text
TWAP = NOT BASELINE
VWAP = NOT BASELINE
POV  = NOT BASELINE
```

‏הם נכנסים רק כאשר size/capacity/impact הופכים לבעיה אמפירית.

### ‏`P4`: ‏Accumulate / Distribute רק אם footprint/size מצדיקים זאת

‏עבור order קטן יחסית לשוק:

```text
complexity tax > likely benefit
```

‏עד שיוכח אחרת.

### ‏`P0 — Required`: ‏No Silent Fallback

‏אם Algo אינו נתמך:

```text
UNSUPPORTED_EXECUTION_ALGO
```

‏או fallback מפורש ומאושר מראש.

‏לעולם לא:

```text
Requested VWAP
→ silently send Market Order
```

### ‏`P0 — Required`: ‏Capability הוא Runtime Truth

‏לפני שימוש:

```text
Instrument Resolution
→ Broker Algo Discovery
→ Parameter Schema
→ Local Validation
→ Broker Validation
→ Risk Recheck
→ Submit
```

‏UI availability, ‏API availability ו־instrument availability אינם אותו דבר.

---

## ‏3. Hierarchy

```text
Baseline
→ Protected Marketable Limit
→ Simple Passive when relevant

Preferred Challenger
→ Adaptive

Advanced Challenger
→ Arrival-style execution

Capacity / Size Challengers
→ TWAP
→ VWAP
→ POV

Specialist / Evidence Only
→ Accumulate / Distribute
→ custom participation variants
→ provider-specific advanced algos

Avoid Unless Evidence
→ long schedule for short-lived signal
→ broker algo with no explicit deadline
→ hidden fallback
→ algo selection by branding
→ algo selection by average fill price alone
```

---

## ‏4. Priority Map

| Priority | Recommendation |
|---|---|
| `P0` | ‏Broker Algo אחרי Risk/Safety בלבד |
| `P0` | ‏Strategy deadline dominates broker schedule |
| `P0` | ‏Capability + parameter validation לפני submit |
| `P0` | ‏No silent fallback |
| `P0` | ‏Partial Fill = real Position Truth |
| `P0` | ‏Unknown state = reconcile before retry/replacement |
| `P0` | ‏Working/Cancel-Pending quantity נשמרת כ־Pending Exposure |
| `P1` | ‏Protected Marketable Limit כ־Control |
| `P1` | ‏Adaptive כ־Broker Algo Challenger ראשון |
| `P1` | ‏Algo Decision Ledger + raw broker evidence |
| `P1` | ‏Scorecard לפי timing/fill/markout/net-edge, לא average price בלבד |
| `P2` | ‏Arrival-style רק עם measured impact / implementation shortfall problem |
| `P2` | ‏Empirical Broker Algo outcome model ל־Replay |
| `P3` | ‏TWAP/VWAP/POV למחקר capacity/size |
| `P3` | ‏Context-aware ExecutionPolicySelector |
| `P4` | ‏Accumulate/Distribute / learned algo selection |

---

## ‏5. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Broker Algo נמצא בשכבת Execution; הוא אינו מייצר Prediction Edge.
- ‏אלגוריתמים שונים מנסים לייעל Objectives שונים.
- ‏Schedule, participation, price benchmark ו־urgency אינם מטרות שקולות.
- ‏Partial Fill יוצר Position אמיתי.
- ‏Cancel request אינו Cancel confirmation.
- ‏Algo proprietary אינו ניתן לשחזור מלא מ־public market data בלבד.
- ‏Capabilities ופרמטרים יכולים להיות provider/instrument/interface specific.

### ‏Judgment

- ‏למערכת Short-Horizon שלנו עדיף Control פשוט ושקוף לפני Broker Algo.
- ‏Adaptive הוא ה־Broker Algo הראשון שכדאי לבדוק, לא הראשון שכדאי להאמין לו.
- ‏TWAP/VWAP/POV אינם ברירת מחדל כל עוד order size קטן וה־signal חי שניות.
- ‏Broker Algo evaluation חייב לכלול No-Fills, delay ו־markout.
- ‏Provider-specific names נשארים ב־Adapter.

### ‏Hypothesis

- ‏ייתכן ש־Adaptive שומר יותר Net Edge ב־spread buckets מסוימים.
- ‏ייתכן ש־Adaptive Patient משיג price improvement אך מפסיד יותר signals עקב delay.
- ‏ייתכן ש־Arrival/VWAP/POV יהפכו שימושיים כאשר RequestedQty/MarketVolume יגדל.
- ‏ייתכן שה־Broker Algo אינו bottleneck כלל וה־simple baseline מספיק.

‏כל Hypothesis דורש ניסוי מבוקר.

---

## ‏6. The Objective Registry

‏נבנה Registry סמנטי:

```text
ExecutionObjective
{
  objective_id,
  semantic_goal,
  natural_benchmark,
  required_horizon,
  size_sensitivity,
  required_market_data,
  broker_capabilities,
  failure_modes,
  recommended_priority
}
```

### ‏דוגמאות

| Objective | Natural Metric | Typical Relevance |
|---|---|---|
| ‏`BALANCE_PRICE_AND_URGENCY` | ‏Net Edge Retained | ‏Short-Horizon |
| ‏`MINIMIZE_IMPLEMENTATION_SHORTFALL` | ‏Arrival/Decision benchmark | ‏Larger / slower execution |
| ‏`FOLLOW_TIME_SCHEDULE` | ‏Schedule adherence | ‏Capacity / staged execution |
| ‏`FOLLOW_VOLUME_SCHEDULE` | ‏VWAP deviation | ‏Capacity / benchmark execution |
| ‏`LIMIT_PARTICIPATION` | ‏Participation error | ‏Market impact control |
| ‏`REDUCE_FOOTPRINT` | ‏Impact / visibility proxies | ‏Large orders |

---

## ‏7. `Adaptive` — First Broker Algo Challenger

‏המחקר של `Adaptive` יתחיל רק לאחר שיש Control יציב.

### ‏ה־Control

```text
Protected Marketable Limit
```

### ‏ה־Treatment

```text
Adaptive
```

### ‏Priority classes

‏נשמור את broker parameter כחלק מ־ExecutionPolicyVersion:

```text
PATIENT
NORMAL
URGENT
```

‏לא נערבב את שלושתם כניסוי אחד.

### ‏השאלה המחקרית

```text
Does Adaptive preserve more net edge
than our protected marketable-limit baseline
for this pre-declared bucket?
```

### ‏ה־Scorecard

```text
fill_rate
partial_fill_rate
time_to_first_fill_p50/p95/p99
time_to_full_fill_p50/p95/p99
price_improvement_bps
implementation_shortfall_bps
post_fill_markout
missed_opportunity
signal_age_at_fill
rank_at_fill
net_edge_retained
unknown_state_rate
operational_failure_rate
```

### ‏Rejection

‏Adaptive נדחה אם השיפור במחיר מגיע יחד עם:

- ‏signal survival נמוך יותר.
- ‏P95/P99 fill latency גרועים מדי.
- ‏יותר No-Fills עם missed move.
- ‏יותר stale fills.
- ‏יותר operational ambiguity.

---

## ‏8. `Arrival Price` — Implementation Shortfall Tool

‏Arrival-style execution אינו “Adaptive משופר”.

‏ה־Objective שונה:

```text
balance market impact
vs
timing / opportunity risk
relative to an arrival benchmark
```

### ‏Baseline recommendation

‏לא Baseline ל־Short-Horizon small order.

### ‏מתי לחקור

‏כאשר Evidence מראה:

```text
requested_qty / displayed_depth ↑
requested_qty / recent_volume ↑
market_impact ↑
```

### ‏Benchmarks שיש לשמור בנפרד

```text
signal_reference_price
decision_reference_price
intent_reference_price
broker_submit_reference_price
arrival_reference_price
fill_price
```

‏אסור לקרוא לכולם `entry_price`.

---

## ‏9. `TWAP` — Schedule Tool

‏`TWAP` פותר בעיית זמן/פריסה, לא בעיית Alpha.

### ‏למה הוא בדרך כלל mismatch אצלנו

```text
signal half-life = seconds
TWAP horizon = potentially much longer
```

‏אם Schedule ממשיך אחרי signal death:

```text
execution correctness = false
```

### ‏מתי כן לחקור

- ‏כאשר order size גדול יותר.
- ‏כאשר completion horizon ארוך משמעותית.
- ‏כאשר timing schedule עצמו הוא part of execution objective.

### ‏Metrics

```text
schedule_adherence
fill_ratio
time_to_first_fill
time_to_complete
implementation_shortfall
market_impact_proxy
signal_survival
```

---

## ‏10. `VWAP` — Benchmark / Volume-Profile Tool

‏`VWAP Algo` אינו רק חישוב VWAP.

‏הוא Execution Policy שמתזמנת quantity ביחס ל־volume profile/benchmark.

### ‏Baseline recommendation

‏לא Baseline ל־seconds-to-minute momentum.

### ‏מחקר רק אם

- ‏order size כבר מספיק גדול כדי להפוך impact לבעיה.
- ‏execution horizon מתאים.
- ‏VWAP benchmark באמת רלוונטי ל־objective שלנו.

### ‏בעיה מרכזית

‏Volume profile עתידי אינו ידוע בוודאות.

‏לכן נמדוד גם:

```text
forecast_error_context
unusual_volume_regime
schedule_deviation
completion_risk
```

---

## ‏11. `POV` — Participation Tool

‏`POV` מודד את execution שלנו ביחס ל־Market Volume.

```text
participation_rate
= our_executed_volume / observed_market_volume
```

### ‏Baseline recommendation

‏לא Baseline עבור order זעיר יחסית לשוק.

### ‏ה־Trigger האמיתי למחקר

```text
RequestedQty / RecentMarketVolume
```

‏אם היחס זניח:

```text
POV complexity likely unnecessary
```

### ‏Metrics

```text
actual_participation
target_participation
participation_error
fill_ratio
impact_proxy
completion_time
markout
net_edge_retained
```

---

## ‏12. `Accumulate / Distribute`

‏זהו כלי ל־staged execution / footprint reduction.

‏הוא מתאים בעיקר לבעיה שונה משלנו:

```text
large parent quantity
→ small child increments
→ long execution horizon
→ footprint / impact management
```

### ‏Baseline recommendation

```text
P4 — Specialist / Evidence Only
```

### ‏לא להשתמש כ־default

‏אם:

- ‏ה־order קטן.
- ‏ה־signal קצר.
- ‏אין measured market impact.
- ‏אין need אמיתי להסתרת footprint.

### ‏Operational note

‏כל state שנוצר client-side / TWS-side חייב להיות חלק מ־Recovery Contract; אין להניח ש־Parent workflow “נעלם” רק כי client process נפל.

---

## ‏13. `AlgoIntent` Contract

```text
algo_intent_id
trade_intent_id
parent_order_id
semantic_objective
urgency
requested_qty
filled_qty
remaining_qty
signal_time
signal_deadline
execution_deadline
provider_algo_end_time
price_protection
max_slippage_budget
max_spread_cost_budget
participation_target?
benchmark_type?
fallback_policy
risk_reservation
safety_epoch
strategy_version
execution_policy_version
broker_capability_version
created_at
```

---

## ‏14. Provider-Agnostic Mapping

‏ה־Strategy אינה רשאית להחזיק Provider strings.

‏לא:

```text
strategy -> "ArrivalPx"
```

‏אלא:

```text
strategy
→ semantic execution objective
→ broker capability resolver
→ broker adapter mapping
→ provider-specific algo + params
```

‏אם שני providers מציעים products עם אותו שם אך semantics שונים:

```text
same name != same contract
```

---

## ‏15. Capability Discovery

‏לכל instrument / environment נשמור Snapshot:

```text
BrokerAlgoCapabilitySnapshot
{
  broker,
  environment,
  account_scope,
  instrument_id,
  available_algos,
  parameter_schemas,
  verified_at,
  source_version,
  adapter_version
}
```

### ‏Startup / Resolution

```text
Resolve Instrument
→ Discover Capabilities
→ Store Snapshot
→ Validate Requested Algo
```

### ‏Pre-submit

```text
Capability still valid?
Parameter schema valid?
Signal alive?
Risk reservation valid?
Safety epoch current?
```

---

## ‏16. Parameter Contract

‏כל parameter מקבל metadata:

```text
parameter_id
type
required
default_value
legal_values
min_value
max_value
units
compatibility
verified_at
```

‏`default` אינו “לא עשינו החלטה”.

‏Default הוא Execution decision ולכן נשמר.

---

## ‏17. Deadline Hierarchy

‏ה־Baseline:

```text
Signal Deadline
<= Execution Deadline
<= Broker Algo End Time only when explicitly authorized
```

‏בפועל ה־Strategy רשאית להיות קצרה יותר מכל schedule של הברוקר.

### ‏Rule

‏אם Signal מת לפני broker algo end time:

```text
cancel_remaining_risk_increasing_quantity
```

‏או מעבר ל־risk-reducing flow לפי state.

‏אין `continue because algo wants completion`.

---

## ‏18. Parent / Child / Position Truth

‏Broker Algo יכול להסתיר חלק מה־Child mechanics.

‏לכן ה־Domain לא יניח:

```text
1 intent = 1 exchange order
```

‏נשמור Parent truth:

```text
requested_qty
confirmed_filled_qty
remaining_authorized_qty
average_fill_price
broker_parent_status
cancel_status
unknown_effect_qty
risk_reservation
```

### ‏Position Truth

```text
Position = confirmed fills / reconciliation
```

‏לא schedule.

‏לא planned quantity.

‏לא requested quantity.

---

## ‏19. Pending Exposure

‏Risk reservation כוללת לפחות:

```text
confirmed_filled_qty
+ working_risk_increasing_qty
+ cancel_pending_risk_increasing_qty
+ unknown_effect_qty
```

‏לא משחררים reservation מלאה על `CancelRequested`.

---

## ‏20. Cancel / Unknown / Late Fill

‏כל Broker Algo חייב להשתלב ב־canonical order semantics משלב 29:

```text
CancelRequested != Cancelled
Timeout != Reject
Unknown != Safe
Partial Fill != Flat
```

### ‏אחרי Timeout

```text
UNKNOWN_EFFECT
→ reconcile
→ rebuild remaining exposure
→ then decide
```

‏לא Blind Retry.

---

## ‏21. Entry Algo מול Exit Decision

‏תרחיש חובה:

```text
Entry Broker Algo still working
→ Strategy produces exit / invalidation
```

‏ה־Baseline:

1. ‏לחסום risk-increasing child/future quantity.
2. ‏לבטל Remaining Parent quantity לפי canonical cancel flow.
3. ‏לנהל את ה־Position שכבר התמלא לפי Broker Truth.
4. ‏לא לחכות ל־Parent completion אם thesis כבר מת.

---

## ‏22. Native מול Synthetic

### ‏Native Broker Algo

‏יתרונות אפשריים:

- ‏לוגיקה רצה אצל broker.
- ‏פחות client timers.
- ‏גישה ל־routing/liquidity internal capabilities.

‏חסרונות:

- ‏פחות transparency.
- ‏proprietary behavior.
- ‏backtest fidelity נמוכה יותר.

### ‏Synthetic Algo שלנו

‏יתרונות:

- ‏control.
- ‏deterministic replayability.
- ‏explainability.

‏חסרונות:

- ‏יותר timers.
- ‏יותר child state.
- ‏יותר cancel/replace races.
- ‏יותר recovery burden.

### ‏Recommendation

‏Short-Horizon baseline נשאר simple client-controlled tactic.

‏Native Broker Algo נכנס כ־Challenger כאשר הוא פותר problem מדוד.

---

## ‏23. Replay / Backtest Model

‏לא ננסה לשחזר proprietary broker algo כאילו אנחנו יודעים את הלוגיקה הפנימית שלו.

‏במקום זאת:

```text
Empirical BrokerAlgo Model
```

‏מבוסס על distributions של:

```text
fill_probability
time_to_first_fill
time_to_full_fill
fill_ratio
slippage
price_improvement
markout
no_fill_outcome
partial_fill_behavior
```

### ‏Context buckets

```text
spread
liquidity
volatility
time_of_day
requested_qty / depth
requested_qty / recent_volume
signal_ttl
algo urgency
```

---

## ‏24. Replay Fidelity Contract

‏כל result שומר:

```text
broker_algo_model_version
calibration_source
calibration_window
confidence
scenario
```

‏תרחישים:

```text
OPTIMISTIC
BASE
CONSERVATIVE
```

‏אם Strategy רווחית רק תחת optimistic broker-algo assumptions:

```text
FRAGILE
```

---

## ‏25. Paper / Shadow

‏Paper נועד כאן בעיקר ל־systems validation:

- ‏capability resolution.
- ‏parameter mapping.
- ‏reject handling.
- ‏Parent lifecycle.
- ‏partial fills.
- ‏cancel.
- ‏deadline.
- ‏restart/reconciliation.

‏Paper fill realism אינו הוכחת Live execution quality.

‏Shadow יכול להשוות Decision/Eligibility/Timing בלי להניח counterfactual Fill Truth.

---

## ‏26. Algo Scorecard

‏לכל Algo נשמור לפחות:

```text
eligible_intents
attempts
reject_rate
fill_rate
partial_fill_rate
no_fill_rate
time_to_first_fill_p50/p95/p99
time_to_full_fill_p50/p95/p99
fill_ratio
slippage_bps
price_improvement_bps
implementation_shortfall_bps
markout_1s
markout_2s
markout_5s
markout_10s
missed_opportunity
signal_age_at_first_fill
rank_at_first_fill
net_edge_retained
unknown_effect_rate
reconciliation_incidents
operational_failure_rate
```

‏אין single-metric winner.

---

## ‏27. `Net Edge Retained`

‏Metric מחקרי מרכזי:

```text
NetEdgeRetained
=
Executable Net Outcome
/
Expected Edge at Decision
```

‏היחס אינו truth אוניברסלי, אבל הוא מכריח אותנו לשאול:

```text
How much of the original edge survived execution?
```

‏וזה חשוב יותר מ־“האם קיבלנו fill יפה”.

---

## ‏28. Different Algo — Different Natural Metric

| Algo Family | Natural Diagnostic |
|---|---|
| ‏Adaptive | ‏Net Edge Retained / delay / price improvement |
| ‏Arrival | ‏Implementation Shortfall vs arrival/decision benchmark |
| ‏TWAP | ‏Schedule adherence + execution cost |
| ‏VWAP | ‏VWAP deviation + completion + impact |
| ‏POV | ‏Participation error + impact |
| ‏Accumulate/Distribute | ‏Impact / footprint proxies + completion |

‏אבל Promotion תמיד לפי full Net Execution Scorecard.

---

## ‏29. Experiment Design — Adaptive

### ‏Hypothesis

```text
Adaptive Normal preserves more net edge
than Protected Marketable Limit
in a predeclared spread/TTL bucket.
```

### ‏Control

```text
Protected Marketable Limit
```

### ‏Treatment

```text
Adaptive Normal
```

### ‏Hold Constant

```text
strategy version
risk version
candidate
quantity
signal threshold
exit policy
cost model
```

### ‏Primary Metric

```text
Net Edge Retained
```

### ‏Guardrails

```text
P95/P99 time-to-fill
stale-fill rate
partial-fill tail
unknown-effect rate
worst slippage
```

---

## ‏30. Changed-Decision Analysis

‏לא מסתכלים רק על aggregate PnL.

‏נבדוק במיוחד Intents שבהם:

```text
Control behavior != Algo behavior
```

‏לדוגמה:

- ‏Control היה מתמלא מיד ו־Algo המתין.
- ‏Algo קיבל price improvement אבל Signal נחלש.
- ‏Control היה No-Fill ו־Algo קיבל Fill.
- ‏Algo נשאר partial בזמן שה־Control כבר היה terminal.

---

## ‏31. Promotion Criteria

‏Broker Algo Challenger מתקדם רק אם:

- ‏ה־Objective שלו תואם לבעיה שנמדדה.
- ‏הוא מוסיף incremental value מעל Control.
- ‏השיפור נשמר OOS.
- ‏השיפור נשמר across meaningful regimes.
- ‏P95/P99 latency אינו פוגע ב־signal survival.
- ‏אין עלייה בלתי סבירה ב־partial/unknown/recovery incidents.
- ‏parameter/capability behavior יציב ומוסבר.
- ‏rollback פשוט.

---

## ‏32. Rejection Criteria

‏נדחה Algo אם:

- ‏השיפור קיים רק בממוצע ולא בזנבות.
- ‏השיפור קיים רק ב־in-sample.
- ‏הוא פוגע משמעותית ב־Signal Survival.
- ‏הוא מגדיל No-Fill opportunity loss יותר מה־price improvement.
- ‏הוא מוסיף operational ambiguity שאינה מוצדקת.
- ‏הוא דורש horizon ארוך יותר מה־signal.
- ‏הוא שימושי רק תחת size שאינו רלוונטי כרגע.
- ‏הוא דורש fallback שקט.
- ‏capability אינה ניתנת לאימות.

---

## ‏33. Failure Taxonomy

```text
BA_UNSUPPORTED
BA_INVALID_PARAMETER
BA_BROKER_REJECT
BA_NO_FILL
BA_LATE_FILL
BA_PARTIAL_TOO_LONG
BA_SIGNAL_EXPIRED
BA_CANCEL_PENDING_TOO_LONG
BA_FILL_AFTER_CANCEL_REQUEST
BA_UNKNOWN_EFFECT
BA_DEADLINE_CONFLICT
BA_EXCESS_SLIPPAGE
BA_ADVERSE_MARKOUT
BA_RECONCILIATION_MISMATCH
BA_CAPABILITY_DRIFT
BA_BROKER_BEHAVIOR_DRIFT
```

---

## ‏34. Success Taxonomy

```text
BA_PRICE_IMPROVEMENT_WITHIN_TTL
BA_FAST_FILL_WITHIN_BUDGET
BA_LOWER_IMPLEMENTATION_SHORTFALL
BA_REDUCED_IMPACT_PROXY
BA_GOOD_PARTIAL_COMPLETION
BA_HIGH_NET_EDGE_RETAINED
```

‏Success event אחד אינו Promotion evidence.

---

## ‏35. Observability

‏Dashboard מחקרי ל־Broker Algos יציג:

```text
active_algo_parents
algo_name / semantic objective
age
signal_age
execution_deadline_remaining
broker_end_time_remaining
requested_qty
filled_qty
remaining_qty
fill_ratio
risk_reservation
current_state
cancel_state
unknown_effect_count
P50/P95/P99 fill latency
slippage
markout
```

---

## ‏36. Alerts

‏Alert-worthy states:

```text
algo active after strategy deadline
algo active while system EXIT_ONLY
partial fill + expired signal
unknown parent state
cancel pending beyond budget
no fill despite expected active market
capability mismatch
broker behavior drift
```

‏Alert אינו enforcement.

‏Risk/Safety/State Machine חייבים containment גם אם monitoring נכשל.

---

## ‏37. Recovery

‏ב־startup/reconnect:

```text
fetch broker parent orders
fetch broker executions/fills
fetch broker positions
reconcile local parent state
rebuild remaining qty
rebuild risk reservation
resolve UNKNOWN
then restore readiness
```

‏לא משחזרים Parent Algo רק מהזיכרון המקומי.

---

## ‏38. Kill Switch / `EXIT_ONLY`

‏אם Safety עוברת ל־`EXIT_ONLY`:

- ‏אין Broker Algo חדש שמגדיל Exposure.
- ‏Parent Algo קיים שמוסיף Exposure נכנס ל־cancel workflow.
- ‏Cancel requested אינו מספיק לשחרר Risk reservation.
- ‏Position שכבר התמלא מנוהל כ־real exposure.
- ‏Risk-reducing path מקבל עדיפות על optimization.

---

## ‏39. Capacity Gates

‏לפני `TWAP/VWAP/POV/Arrival/Accumulate` נשמור ratios כמו:

```text
requested_qty / top_of_book_size
requested_qty / displayed_depth
requested_qty / recent_1m_volume
requested_qty / recent_market_volume
requested_notional / typical_liquidity
```

‏אין Hard Threshold בשלב זה.

‏מחפשים robust region שבו simple execution מתחיל להראות impact/partial/completion degradation.

---

## ‏40. Capacity Transition

‏ה־Research sequence:

```text
Small Size
→ Simple Execution
→ Measure impact / partial / slippage
→ Increase simulated size
→ Build capacity curve
→ Identify degradation region
→ Only then test impact-oriented Broker Algos
```

‏לא מתחילים מ־institutional execution לפני שה־data אומרת שאנחנו institutional-sized ביחס ל־liquidity הרלוונטית.

---

## ‏41. Current Verification Snapshot — 2026-10-27

‏הפרטים הבאים תלויי זמן ונבדקו מול תיעוד IBKR הרשמי ב־27 באוקטובר 2026.

### ‏Web API — Runtime Algo Discovery

‏IBKR מתעדת:

```text
GET /v1/api/iserver/contract/:conid/algos
```

‏כ־endpoint שמחזיר את ה־IB Algos הנתמכים עבור instrument מסוים, לאחר pre-flight מתאים.

‏בדוגמה הרשמית מופיעים בין היתר:

```text
Adaptive
ArrivalPx
ClosePx
DarkIce
PctVol
Twap
Vwap
```

‏מסקנה:

```text
Capability discovery > hard-coded universal support
```

### ‏Web API — Parameter Discovery

‏התיעוד הרשמי הנוכחי חושף גם parameter metadata כגון:

```text
id
required
defaultValue
legalStrings
valueClassName
```

‏עבור `Adaptive`, הדוגמה הרשמית מציגה:

```text
adaptivePriority
= Urgent / Normal / Patient
Default = Normal
```

### ‏TWS API

‏`Order` reference הרשמי מתעד `algoStrategy` ו־`algoParams`, עם אסטרטגיות כגון:

```text
ArrivalPx
DarkIce
PctVol
Twap
Vwap
```

‏מסקנה:

```text
UI catalog != Web API catalog != TWS API catalog
```

### ‏Adaptive

‏IBKR מתארת `Adaptive` כשילוב של Smart Routing עם priority/urgency שנבחרת על ידי המשתמש.

‏הקטגוריות המתועדות כיום:

```text
Urgent
Normal
Patient
```

‏המשמעות התפעולית היא trade-off בין מהירות fill לבין הזדמנות ל־price improvement, ולא הבטחה למחיר טוב יותר.

### ‏Arrival Price

‏IBKR מתעדת `Arrival Price` כ־Algo שמנסה לאורך חיי ה־Order להשיג את bid/ask midpoint שהיה בעת submit, תוך balancing של market impact ו־execution pace.

‏זה מחזק את ההמלצה שלנו:

```text
Arrival-style is naturally impact/timing oriented,
not a default seconds-momentum tactic.
```

### ‏TWAP

‏IBKR מתעדת `TWAP` כ־execution לאורך period מוגדר, ומציינת שאינו מובטח להתמלא במהלך התקופה אם התנאים אינם מתקיימים.

### ‏VWAP

‏IBKR מתעדת את `VWAP Best Efforts` כ־Algo שמנסה להשיג VWAP, עם אפשרויות כגון start/end time ו־maximum percentage of ADV; הוא עשוי לא להתמלא במלואו תחת constraints מסוימים.

### ‏Percentage of Volume

‏IBKR מתארת `POV` כ־Algo להשתתפות ב־volume בקצב שהמשתמש מגדיר, ומדגישה התאמה ל־larger orders / impact control.

### ‏Accumulate / Distribute

‏IBKR Traders' Academy מתארת `Accumulate/Distribute` ככלי לביצוע large volume orders לאורך זמן באמצעות increments קטנים, כולל randomization ו־conditions.

‏חשוב: availability ב־TWS educational material אינה הוכחה שהיכולת קיימת באותה צורה בכל API/interface.

### ‏Current-Fact Rule

‏כל אלה נשמרים כ־time-sensitive capability facts.

‏לפני כל שימוש תפעולי עתידי יש לבצע מחדש:

```text
runtime discovery
+ parameter validation
+ account/environment verification
```

---

## ‏42. Required Data / Evidence

‏לכל Broker Algo experiment נשמור:

```text
run_id
decision_id
trade_intent_id
algo_intent_id
parent_order_id
instrument_id
environment
semantic_objective
provider_algo_name
provider_algo_params
capability_snapshot_id
signal_time
signal_deadline
execution_deadline
broker_algo_end_time
submit_time
ack_time
first_fill_time
terminal_time
requested_qty
filled_qty
average_fill_price
risk_reservation
score_at_decision
rank_at_decision
score_at_fill
rank_at_fill
spread_at_decision
quote_age_ms
cost_model_version
execution_policy_version
strategy_version
```

---

## ‏43. Counterfactual Limits

‏כאשר Actual route השתמש ב־Adaptive, איננו יכולים לטעון בביטחון:

```text
Marketable Limit would definitely have filled at X
```

‏או להפך.

‏Counterfactual נשמר כ־Estimate עם:

```text
model_version
confidence
optimistic/base/conservative
```

---

## ‏44. RCA Packet

‏לכל כשל משמעותי:

```text
Decision Snapshot
Signal / Rank State
Execution Objective
Algo Intent
Capability Snapshot
Algo Parameters
Raw Broker Events
Normalized Order Events
Fills
Risk Reservation
Market Context
Deadline Timeline
Markout
Counterfactual Baseline
First Divergence
```

---

## ‏45. First-Divergence Order

‏כאשר execution נראה שגוי:

```text
Intent
→ Capability
→ Parameter Mapping
→ Risk / Safety
→ Submit
→ Broker Ack
→ Algo State
→ Fill / Partial
→ Cancel
→ Reconciliation
```

‏RCA מתחיל בנקודה הראשונה שבה Expected ו־Observed נפרדו.

---

## ‏46. Testing Strategy

### ‏Contract Tests

- ‏Capability mapping.
- ‏Parameter validation.
- ‏Unsupported Algo.
- ‏Explicit fallback.

### ‏State Tests

- ‏Parent submitted.
- ‏Partial fill.
- ‏No fill.
- ‏Deadline expiry.
- ‏Cancel pending.
- ‏Fill after cancel request.
- ‏Unknown effect.

### ‏Recovery Tests

- ‏Crash while Parent active.
- ‏Restart after partial fill.
- ‏Reconnect before cancel confirmation.
- ‏Broker/local remaining quantity mismatch.

### ‏Safety Tests

- ‏`EXIT_ONLY` while Algo active.
- ‏Risk reservation maintained under unknown state.
- ‏No overfill.
- ‏No silent fallback.

---

## ‏47. Golden Scenarios

```text
Adaptive Normal fast fill
Adaptive Patient no fill before signal expiry
Adaptive Urgent worse price but timely fill
Arrival deadline longer than signal deadline
TWAP still active after strategy invalidation
VWAP partial at broker end time
POV slow market -> insufficient completion
POV volume burst -> faster participation
Cancel request followed by late fill
Broker disconnect while parent active
Unsupported algo -> explicit reject
Capability drift between sessions
```

---

## ‏48. Hard Invariants

```text
Broker Algo never bypasses Risk.
Broker Algo never bypasses Safety.
Signal expiry blocks new risk-increasing execution.
Fallback is never silent.
Partial fill immediately changes Position Truth.
Cancel request does not free exposure reservation.
UNKNOWN is never treated as cancelled.
Provider-specific names never leak into Strategy.
Every execution is attributable to Decision + Intent + Policy Version + Broker Events.
Paper outcome is not proof of live execution realism.
```

---

## ‏49. What I Would Avoid Initially

‏לא להתחיל מ־:

- ‏`VWAP` רק כי הוא “מוסדי”.
- ‏`POV` בלי capacity problem.
- ‏`TWAP` שמאריך signal קצר.
- ‏`Accumulate/Distribute` עבור small fast entries.
- ‏Algo selector עם ML.
- ‏Broker-specific strings ב־Strategy.
- ‏defaults שאינם נרשמים.
- ‏fallback implicit.
- ‏Backtest שמעמיד פנים שהוא יודע proprietary child routing.
- ‏promotion לפי average fill price בלבד.

---

## ‏50. What to Add Later

### ‏`P2`

- ‏Adaptive Champion/Challenger by bucket.
- ‏Empirical Broker Algo replay models.
- ‏Capability drift monitor.

### ‏`P3`

- ‏Arrival-style capacity experiments.
- ‏TWAP/VWAP/POV capacity frontier.
- ‏Context-aware rule-based selector.

### ‏`P4`

- ‏Accumulate/Distribute research.
- ‏Learned execution selector.
- ‏Cross-broker semantic capability comparison.

---

## ‏51. Confidence

### ‏High

- ‏Broker Algo אינו Alpha.
- ‏Objective חייב להתאים ל־Signal Horizon.
- ‏Simple baseline נדרש להשוואה.
- ‏No Silent Fallback.
- ‏Runtime capability discovery עדיף כאשר הוא זמין.
- ‏Partial/Unknown/Cancel semantics נשארים canonical.
- ‏TWAP/VWAP/POV אינם baseline טבעי ל־small seconds-horizon execution.

### ‏Medium

- ‏Adaptive הוא Challenger ראשון המתאים ביותר למבנה המחקר שלנו.
- ‏Arrival-style יהפוך שימושי בעיקר כאשר impact/capacity יגדלו.

### ‏Low / To Validate

- ‏איזה Adaptive priority ינצח באיזה spread/TTL bucket.
- ‏ה־threshold שבו size מצדיק Arrival/VWAP/POV.
- ‏כמה Net Edge Broker Algo יכול להוסיף בפועל.

---

## ‏52. User-Specific Application — Research Scope

‏למערכת Short-Horizon Momentum שלנו סדר המחקר המומלץ הוא:

```text
1. Protected Marketable Limit control
2. Measure edge survival to fill
3. Measure spread / latency / missed opportunity
4. Adaptive Normal challenger in a predeclared bucket
5. Patient/Urgent only as separate experiments
6. Replay / Shadow / Paper systems validation
7. Capacity curve under larger simulated sizes
8. Arrival / TWAP / VWAP / POV only if capacity evidence justifies them
9. Accumulate/Distribute only if footprint becomes a measured problem
```

‏במסגרת המקטע הזה אין קידום להפעלה בכסף אמיתי; היעד הוא Evidence, Replay, Shadow ו־Paper validation בלבד.

---

## ‏53. Relationship to Later Sheets

‏המקטע הזה מזין בהמשך במיוחד:

- ‏Auction execution — שלב 42.
- ‏Trading halts / resumptions — שלב 43.
- ‏Execution Policy cross-cutting pack.
- ‏Recommended Order Policy.
- ‏Recommended Production Safety.
- ‏Final Recommended Baseline.

‏הוא גם תלוי בהחלטות שכבר נקבעו ב־:

- ‏16 — Entry / Execution.
- ‏18 — True Costs / Net Edge.
- ‏21 — Realistic Execution Backtest.
- ‏29 — Broker API Architecture.
- ‏33 — Production State Machine.
- ‏34 — Failure Recovery.
- ‏36 — Safety Controls.
- ‏37 — Advanced Order Tactics.
- ‏39 — Routing.
- ‏40 — Hidden / Midpoint / Pegged / ATS.

---

## ‏54. Concrete Baseline Contract

```text
Signal / Rank
→ Decision
→ Risk
→ Safety
→ Canonical Execution Intent
→ Explicit Signal Deadline
→ Protected Marketable Limit Control
→ Optional Adaptive Challenger
→ Runtime Capability Check
→ Explicit Algo Params
→ Parent Order Tracking
→ Broker Fill Truth
→ Partial / Unknown / Cancel-safe State Machine
→ Net Edge Retained Scorecard
→ Replay / Shadow / Paper Evidence
→ RCA
→ Promotion or Rejection
```

‏Capacity path נפרד:

```text
Simulated Size Increase
→ Capacity Curve
→ Impact / Partial / Slippage Degradation
→ Arrival / TWAP / VWAP / POV Experiment
→ Compare against Simple Control
→ Retain only if incremental value survives complexity tax
```

---

## ‏55. Recommendation Summary

‏ה־Recommendation של מקטע 41 היא לא “להשתמש ב־Broker Algos”.

‏היא:

```text
Use a Broker Algo only when its execution objective
matches a measured execution problem better
than a simple, protected, observable baseline.
```

‏לרובוט שלנו כרגע:

```text
Champion / Control
→ Protected Marketable Limit

First Broker-Algo Challenger
→ Adaptive

Capacity / Size Research Later
→ Arrival-style
→ TWAP
→ VWAP
→ POV

Specialist / Evidence Only
→ Accumulate / Distribute
```

‏המדד הסופי אינו “כמה מתוחכם ה־Algo”, אלא:

```text
How much net edge survived from decision to fill,
with acceptable timing, tail risk, state certainty and operational complexity?
```
