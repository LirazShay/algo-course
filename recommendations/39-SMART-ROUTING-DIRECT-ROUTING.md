# ‏39 — Recommendation Sheet: Smart Routing / Direct Routing

> ‏מקור לימודי עיקרי: `../39-SMART-ROUTING-VS-DIRECT-ROUTING.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי לשכבת Routing כך שהמערכת לא תבחר יעד לפי intuition, fee table או displayed size בלבד, אלא תמדוד כיצד Route Policy משפיעה על fill probability, time-to-fill, queue, price quality, fees/rebates, markout, missed opportunity, reliability ו־net execution quality.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי.

---

## ‏1. Decision

‏Routing הוא חלק מ־`ExecutionPolicy`, לא חלק מה־Prediction Strategy.

‏ה־Baseline:

```text
Strategy / Scanner
→ TradeIntent
→ Risk Approval
→ Safety Approval
→ ExecutionPolicy
→ RoutingIntent
→ RoutingPolicy
→ Broker Adapter
→ SMART / Directed Destination
→ Broker Events / Fills
→ Routing Attribution
→ RCA / Experiment
```

‏שאלת ההחלטה אינה:

```text
Which venue is best?
```

‏אלא:

```text
For this order,
at this time,
with this signal TTL,
price protection,
size,
urgency,
liquidity,
queue uncertainty,
and operational state,
which routing policy maximizes expected net execution quality?
```

‏העיקרון המחייב:

```text
SMART is the initial control.
Direct routing is a challenger, not a prestige feature.
Routing must prove incremental value after all costs and complexity.
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Intent נפרד מ־Destination

‏ה־Strategy לא תכתוב:

```text
route = EXCHANGE_X
```

‏אלא תייצר Intent קנוני:

```text
RoutingIntent
{
  side,
  quantity,
  urgency,
  passive_or_aggressive,
  max_price_or_min_price,
  signal_ttl,
  route_ttl,
  allow_split,
  price_protection,
  execution_budget,
  safety_epoch,
  policy_version
}
```

‏רק שכבת Routing רשאית לבחור destination strategy.

### ‏`P0 — Required`: ‏`SMART` הוא Control ראשון

‏בשלב המחקר הראשוני:

```text
R0 = SMART baseline
```

‏הסיבה:

- ‏פחות custom complexity.
- ‏פחות venue-specific assumptions.
- ‏פחות responsibility על queue/fallback logic.
- ‏Control ברור להשוואה.

‏זו אינה טענה ש־SMART תמיד אופטימלי.

‏זו טענה שהוא baseline חזק מספיק כדי לחייב כל custom router להוכיח incremental value מעליו.

### ‏`P0 — Required`: Direct Routing הוא Challenger מבוסס Failure Mode

‏Direct route לא נכנס משום ש־venue מסוים “נראה מהיר” או “נותן rebate”.

‏הוא נכנס למחקר רק אם יש Observation כמו:

```text
SMART passive fills too slowly in bucket X
SMART route has repeated adverse markout in context Y
specific venue capability is required
route transparency is necessary for a measured experiment
```

‏ואז:

```text
Observation
→ RCA
→ Routing Hypothesis
→ Direct Challenger
→ Shadow / Replay
→ Controlled Validation
→ Promotion or Rejection
```

### ‏`P0 — Required`: Routing Readiness Contract

‏Routing אינו רשאי לייצר Order חדש אלא אם:

```text
market_data_fresh == true
instrument_resolved == true
broker_ready == true
risk_authorized == true
safety_allows_new_order == true
signal_alive == true
price_protection_valid == true
routing_intent_not_expired == true
```

### ‏`P0 — Required`: Route Decision מקבל TTL

‏נשמור:

```text
routing_decision_time
routing_decision_age
route_ttl
```

‏Route שנבחר לפי snapshot ישן אינו optimization של השוק הנוכחי.

‏אם `routing_decision_age > route_ttl`:

```text
RE-EVALUATE
```

‏ולא Submit אוטומטי.

### ‏`P0 — Required`: Price Protection גובר על Routing

‏SMART, Direct, fallback או reroute אינם רשאים לעקוף price boundary.

```text
Routing optimization
< Price protection
< Risk
< Safety
```

### ‏`P0 — Required`: Unknown Effect חוסם Child נוסף

‏אם אחרי Submit אין ודאות אם Child Order קיים:

```text
UNKNOWN_EFFECT
```

‏אין ליצור Child חלופי באופן עיוור.

‏קודם:

```text
reconcile outstanding orders
→ resolve effect
→ recompute pending exposure
→ only then decide
```

---

## ‏3. Hierarchy

```text
Baseline
→ SMART control

Preferred Default
→ SMART + explicit urgency / price protection / TTL

Challenger
→ simple Direct policy for measured failure mode

Advanced Option
→ context-aware route selection
→ bounded re-routing
→ venue-aware passive policy

Specialist Option
→ multi-venue custom router
→ learned routing model
→ sophisticated venue-specific queue models

Avoid Unless Evidence
→ fee chasing
→ one-best-venue rules
→ rapid venue ping-pong
→ venue-specific logic without direct data
→ custom routing without a SMART benchmark
```

---

## ‏4. Priority Map

| Priority | Recommendation |
|---|---|
| `P0` | ‏Intent/Destination separation |
| `P0` | ‏Routing Readiness Contract |
| `P0` | ‏Route TTL / stale-decision rejection |
| `P0` | ‏Price Protection dominance |
| `P0` | ‏Unknown-effect reconciliation before new Child |
| `P0` | ‏Parent quantity / pending-exposure invariants |
| `P1` | ‏SMART as first routing control |
| `P1` | ‏Routing Decision Ledger + Outcome Record |
| `P1` | ‏Net Execution Quality scorecard |
| `P1` | ‏Route/fallback reason codes |
| `P1` | ‏End-to-end latency attribution |
| `P2` | ‏Simple Direct challenger |
| `P2` | ‏Bounded fallback / reroute policy |
| `P2` | ‏Venue buckets and drift monitoring |
| `P3` | ‏Context-aware custom routing |
| `P3` | ‏Venue-specific queue/fill models |
| `P4` | ‏Learned router / exploration policy |

---

## ‏5. Fact / Judgment / Hypothesis

### ‏Fact

- ‏שוק המניות האמריקאי מפוצל בין מספר destinations.
- ‏Queue position היא venue-specific; אין Queue גלובלי יחיד של ה־NBBO.
- ‏Routing משפיע על Fill probability, Queue, latency, fees/rebates ו־price outcome.
- ‏Direct route יכול לשנות את destination שאליו Order נשלח.
- ‏Smart Router הוא component חיצוני שהלוגיקה הפנימית המלאה שלו אינה בהכרח observable לנו.
- ‏Cancel/Reroute יכול לגרום לאובדן queue priority.
- ‏Fill Rate גבוה לבדו אינו הוכחת routing quality.

### ‏Judgment

- ‏SMART צריך להיות control ראשון למחקר שלנו.
- ‏Direct routing צריך להיכנס רק לאחר bottleneck מדוד.
- ‏ה־Strategy לא צריכה לדעת venue names.
- ‏Routing evaluation צריך להתבסס על Net Execution Quality, לא על fee/rebate בלבד.
- ‏Router מותאם אישית חייב להיות deterministic, versioned ו־explainable לפני promotion.

### ‏Hypothesis

- ‏ייתכן ש־Direct routing ישפר execution בבuckets מסוימים.
- ‏ייתכן ש־SMART כבר טוב מספיק לרוב השימושים שלנו.
- ‏ייתכן ש־queue preservation חשוב יותר מ־small displayed-price advantage במצבים מסוימים.
- ‏ייתכן ש־Routing Edge קטן מדי ביחס למורכבות ולכן אינו research priority.

‏כל Hypothesis דורש Experiment.

---

## ‏6. Why SMART First

‏SMART הוא baseline סביר כאשר:

- ‏אין עדיין venue-level model מוכח.
- ‏אין direct-feed coverage שמאפשר selection עשיר.
- ‏sample קטן.
- ‏ה־priority הוא למדוד את מערכת הביצוע מקצה לקצה.
- ‏custom routing complexity עדיין לא מצדיקה את עצמה.

‏ה־baseline אינו:

```text
SMART forever
```

‏אלא:

```text
SMART until evidence identifies a routing-specific bottleneck
```

---

## ‏7. Smart Router as External Component

‏נתייחס ל־SMART כ־black-box operational component עם observable outputs.

‏נשמור:

```text
routing_instruction
broker_order_id
submitted_at
ack_at
first_fill_at
full_fill_or_terminal_at
fill_price
fill_qty
execution_venue_if_reported
fees
rebates_if_available
order_status_events
```

‏לא ננסה להמציא את האלגוריתם הפנימי שלו.

‏Replay של SMART משחזר את ה־outputs שנצפו; הוא אינו טוען ששיחזר internal routing logic.

---

## ‏8. Direct Routing Contract

‏Direct routing דורש לפחות:

```text
DestinationCapability
{
  destination_id,
  instrument_scope,
  order_types,
  tif_types,
  session_support,
  price_increment_rules,
  passive_capabilities,
  aggressive_capabilities,
  known_restrictions,
  verified_at,
  source
}
```

‏אם Capability אינה ידועה:

```text
DIRECT_ROUTE_NOT_ELIGIBLE
```

‏לא silent approximation.

---

## ‏9. RoutingIntent Contract

```text
routing_intent_id
parent_order_id
trade_intent_id
symbol
canonical_instrument_id
side
quantity
urgency
passive_or_aggressive
max_execution_price / min_execution_price
signal_time
signal_ttl
route_ttl
allow_split
execution_budget_bps
safety_epoch
strategy_version
execution_policy_version
routing_policy_version
created_at
```

---

## ‏10. RoutingDecision Ledger

‏לכל החלטה:

```text
routing_decision_id
routing_intent_id
parent_order_id
decision_time
selected_policy
selected_destination_or_smart
market_snapshot_id
quote_age_ms
spread
size_snapshot
queue_estimate_if_any
queue_confidence
signal_age_ms
score
rank
urgency
expected_execution_cost
reason_code
policy_version
config_hash
```

---

## ‏11. Routing Outcome Record

‏לכל Parent Order:

```text
routing_policy
route_or_routes
child_order_count
submit_latency
ack_latency
first_fill_latency
full_fill_latency
filled_quantity
remaining_quantity
average_fill_price
fees
rebates_if_known
slippage_bps
effective_spread_bps
markout_100ms
markout_500ms
markout_1s
markout_5s
missed_quantity
missed_opportunity
fallback_count
reroute_count
final_status
unknown_effect_count
```

---

## ‏12. Parent / Child Architecture

‏אם Route Policy מפצלת Order:

```text
ExecutionIntent
→ ParentOrder
   ├─ ChildOrder A
   ├─ ChildOrder B
   └─ ChildOrder C
→ BrokerOrder(s)
→ Fill(s)
```

‏נשמור separations בין:

```text
authorized parent quantity
working child quantity
filled child quantity
cancel-pending quantity
unknown-effect quantity
```

---

## ‏13. Hard Parent Invariants

### ‏No Overfill

```text
sum(realized_fills)
<= authorized_parent_quantity
```

### ‏Pending Exposure

```text
potential_exposure
= filled_qty
+ working_risk_increasing_qty
+ cancel_pending_risk_increasing_qty
+ unresolved_unknown_effect_qty
```

### ‏No Duplicate Child Under Unknown

‏אם Child קודם ב־`UNKNOWN`:

```text
new risk-increasing child = DENIED
```

‏עד reconciliation.

---

## ‏14. SMART vs Direct — מה באמת משווים

‏לא:

```text
SMART filled / Direct filled
```

‏אלא Scorecard מלא:

```text
Fill Probability
Partial Fill Rate
Time to First Fill
Time to Full Fill
Effective Spread
Implementation Shortfall
Slippage
Fees / Rebates
Post-Fill Markout
Missed Opportunity
Stale Fill Rate
Fallback Rate
Unknown-State Rate
Operational Failure Rate
Net Execution Outcome
```

---

## ‏15. Same-Intent Comparison

‏Experiment הוגן שומר קבוע:

```text
same signal
same decision timestamp
same quantity
same risk approval
same price protection
same signal TTL
same exit model
same cost accounting
```

‏ומשנה בעיקר:

```text
routing policy
```

---

## ‏16. Counterfactual Limitation

‏אם בפועל נשלחנו ל־A:

```text
actual_route = A
```

‏איננו יודעים בוודאות מה היה קורה אילו Order אמיתי נשלח ל־B.

‏לכן Shadow Direct Challenger מחזיר:

```text
counterfactual_estimate
confidence
optimistic
base
conservative
```

‏לא:

```text
would_have_filled = TRUE
```

---

## ‏17. Aggressive Routing

‏כאשר Order marketable:

‏ה־objective המרכזי:

```text
Immediate executable liquidity
+ price protection
+ completion probability
- slippage
- impact
- latency
```

‏ב־MVP לא ננסה לכתוב custom venue sweeper.

‏נשתמש ב־SMART control עם Protected Marketable Limit, ונמדוד.

---

## ‏18. Passive Routing

‏Passive routing שונה מהותית.

‏ה־objective:

```text
Queue quality
Fill-before-deadline probability
Spread capture
Fee/rebate economics
Adverse selection
Signal TTL
```

‏Direct passive challenger מצריך Queue evidence טוב יותר מאשר aggressive Direct challenger.

---

## ‏19. Queue Preservation vs Re-route

‏ל־Order פסיבי נשווה:

```text
EV(stay)
vs
EV(reroute)
vs
EV(cross)
vs
EV(cancel)
```

‏Queue priority שכבר נצברה היא input.

‏אבל היא אינה sunk-cost justification להישאר כאשר Signal מת.

---

## ‏20. Reroute Budget

‏נגדיר:

```text
max_reroutes
min_reroute_interval
reroute_reason_required
```

‏אין:

```text
reroute until filled
```

### ‏Reroute Preconditions

```text
signal still alive
route decision fresh
price protection still valid
pending exposure known
old child state reconciled enough
new destination supported
reroute budget available
```

---

## ‏21. Reroute Hysteresis

‏לא עוברים בין destinations על שינוי קטן.

‏נדרש deterioration / improvement מהותי לפי Experiment.

‏המטרה למנוע:

```text
A → B → A → B
```

‏ששורף queue, message budget ו־latency.

---

## ‏22. Routing Failure Reasons

‏Baseline registry:

```text
RF_DATA_STALE
RF_ROUTE_UNAVAILABLE
RF_ROUTE_UNSUPPORTED
RF_CAPABILITY_MISMATCH
RF_ROUTING_DECISION_STALE
RF_QUEUE_MIS_ESTIMATE
RF_FILL_TOO_SLOW
RF_PRICE_PROTECTION_FAILED
RF_EXCESS_SLIPPAGE
RF_ADVERSE_MARKOUT
RF_REROUTE_CHURN
RF_FALLBACK_FAILURE
RF_BROKER_REJECT
RF_UNKNOWN_EFFECT
RF_ROUTING_BUDGET_EXHAUSTED
RF_NO_EXECUTABLE_LIQUIDITY
```

---

## ‏23. Routing Success Reasons

```text
RS_PRICE_IMPROVEMENT
RS_FAST_FILL
RS_LOW_NET_COST
RS_LOW_ADVERSE_MARKOUT
RS_QUEUE_CAPTURE
RS_GOOD_NO_FILL
RS_SAFE_FALLBACK
```

‏גם `GOOD_NO_FILL` חשוב: Route שלא התמלא לפני מהלך נגדנו יכול להיות Success.

---

## ‏24. Fees / Rebates

‏Fees ו־rebates הם Input ל־Net Economics, לא objective בפני עצמו.

‏לא:

```text
max rebate
```

‏אלא:

```text
Net Routing Economics
= price outcome
+ rebate
- fee
- slippage
- adverse selection
- missed opportunity
```

‏Fee schedules משתנים בזמן ולכן נשמרים versioned עם `verified_at`.

---

## ‏25. Effective Spread / Arrival Benchmark

‏נבחר benchmark עקבי לכל routes.

‏לדוגמה מחקרית:

```text
arrival_mid = midpoint at routing_decision_time
```

‏או benchmark אחר שנקבע מראש.

‏העיקר:

```text
same benchmark for all policies
```

---

## ‏26. Routing Latency Decomposition

```text
signal_time
→ decision_time
→ routing_decision_time
→ submit_time
→ ack_time
→ first_fill_time
→ full_fill_or_terminal_time
```

‏נמדוד:

```text
signal_to_route
route_to_submit
submit_to_ack
submit_to_first_fill
submit_to_full_fill
signal_to_first_fill
```

‏`signal_to_first_fill` קריטי במיוחד ל־short horizon.

---

## ‏27. Tail Latency

‏לא נסתפק ב־Average.

‏נמדוד:

```text
P50
P90
P95
P99
max
```

‏בפרט:

```text
routing_queue_oldest_age
submit_to_ack
submit_to_first_fill
cancel_to_confirm
reroute_to_ack
```

---

## ‏28. Routing Backpressure

‏Routing intelligence יכולה להפוך לבעיה אם היא מוסיפה backlog.

‏נמדוד:

```text
routing_queue_depth
routing_queue_oldest_age_ms
routing_decision_compute_ms
expired_intents_before_route
```

‏Intent ישן אינו נשמר כדי “להשלים עבודה”.

```text
expired intent → DROP / NO_TRADE
```

---

## ‏29. Message Budget

‏Cancel / Replace / Reroute צורכים message capacity.

‏לכן RoutingPolicy מקבלת גם operational budget:

```text
message_budget_remaining
broker_health
request_queue_age
```

‏Policy שאינה יכולה להתבצע בזמן אינה Policy ישימה.

---

## ‏30. Fallback Policy

‏Fallback חייב להיות explicit.

‏דוגמה מחקרית:

```text
DIRECT_CHALLENGER
→ destination unavailable
→ recheck intent
→ if still valid and safe: SMART fallback
→ else NO_TRADE
```

‏אין silent fallback.

‏Outcome נשמר עם:

```text
fallback_reason
fallback_time
old_route
new_route
remaining_signal_ttl
price_protection_status
```

---

## ‏31. No Trade הוא Routing Outcome תקף

‏אם אין Route שעומד ב־:

```text
price protection
signal TTL
safety
risk
capabilities
execution budget
```

‏התוצאה הנכונה היא:

```text
NO_TRADE
```

‏לא chasing.

---

## ‏32. Routing and Signal Decay

‏נשמור:

```text
score_at_signal
rank_at_signal
score_at_submit
rank_at_submit
score_at_first_fill
rank_at_first_fill
```

‏אם Candidate #1 הפך ל־#80 לפני Fill, routing outcome מנותח יחד עם Signal decay.

---

## ‏33. Routing and Market-Data Provider Separation

‏Market Data יכול להגיע מספק A והביצוע מ־Broker B.

‏לפני Routing:

```text
canonical instrument resolved
provider quote fresh
broker capable
cross-provider comparison semantics valid
```

‏Final Broker recheck מותר ל־Top Candidate כאשר הוא מוסיף certainty, אבל latency שלו נמדדת כחלק מה־execution path.

---

## ‏34. Cross-Provider Divergence

‏כאשר Provider quote ו־Broker quote אינם מתיישבים:

‏לא:

```text
pick the one we like
```

‏אלא reasoned policy:

```text
refresh
block entry
reduce urgency
NO_TRADE
```

‏ההשוואה חייבת להיות side-aware ו־time-aligned.

---

## ‏35. Routing Data Parity

‏Custom routing מותר רק כאשר fields ששימשו במחקר קיימים בזמן החלטת אמת.

‏אם experiment השתמש ב־venue depth שאינו זמין בזמן ההחלטה:

```text
research result = NOT DEPLOYABLE
```

---

## ‏36. Consolidated vs Venue Data

‏Consolidated feed הוא טוב ל־broad market observation.

‏אבל venue-specific routing יכול לדרוש destination-level evidence.

‏לכן:

```text
Do not claim venue optimization
without venue-relevant data.
```

---

## ‏37. Routing Confidence

‏אפשר לשמור:

```text
HIGH
MEDIUM
LOW
UNKNOWN
```

‏אבל confidence הוא classification explainable, לא pseudo-precision.

‏`UNKNOWN` ב־custom Direct selection יכול לגרום:

```text
fallback to SMART
or
NO_TRADE
```

‏לפי policy.

---

## ‏38. Custom Routing Policy Ladder

```text
R0 — SMART Control
R1 — SMART + explicit urgency / TTL / protection
R2 — Simple Direct Challenger
R3 — Small Context-Aware Rule Set
R4 — Venue-Specific Queue-Aware Policy
R5 — Learned Routing Model
```

‏Promotion רק אם כל רמה פותרת bottleneck מדוד ומצדיקה את complexity tax.

---

## ‏39. Why Not Start with Learned Routing

‏Learned routing סובל במיוחד מ־:

- ‏counterfactual missingness.
- ‏selection bias.
- ‏route-dependent observations.
- ‏sample fragmentation.
- ‏venue drift.
- ‏fee/capability drift.
- ‏data parity requirements.

‏לכן הוא `P4`.

---

## ‏40. Counterfactual Routing Problem

‏כאשר בחרנו A, אין Ground Truth מלא לגבי B.

‏לכן direct-router research צריך להיזהר מ־:

```text
best route in hindsight
```

‏ולהעדיף:

```text
observable market evolution
+ conservative fill model
+ confidence bounds
+ shadow decisions
```

---

## ‏41. Routing Experiment Contract

‏לפני Experiment:

```text
hypothesis
control_policy
challenger_policy
population
dataset
primary_metric
guardrails
cost_model
fill_model
routing_policy_version
expected_failure_mode
promotion_rule
```

---

## ‏42. Control / Treatment

‏Baseline experiment:

```text
Control   = SMART
Treatment = SIMPLE_DIRECT_POLICY_A
```

‏כל השאר קפוא ככל האפשר.

---

## ‏43. Primary Metric

‏Primary metric אינו Fill Rate.

‏נעדיף:

```text
incremental_net_execution_value
```

‏שמשלב ככל האפשר:

```text
price outcome
fees
slippage
markout
missed opportunity
```

---

## ‏44. Guardrails

‏Challenger לא מקודם אם הוא פוגע משמעותית ב־:

```text
P99 time-to-fill
P99 submit-to-ack
unknown-effect rate
cancel/fill race rate
stale-fill rate
operational failure rate
request pressure
worst-case execution cost
```

---

## ‏45. Economic Significance

‏גם שיפור סטטיסטי קטן צריך להצדיק:

```text
extra code
extra data
extra monitoring
extra operational failure modes
extra maintenance
```

‏אם לא:

```text
KEEP SMART
```

---

## ‏46. Routing Complexity Tax

‏ל־Direct/custom נחשב conceptually:

```text
Net Benefit
= measured execution improvement
- data cost
- operational complexity
- maintenance cost
- failure risk
- latency overhead
```

---

## ‏47. Stability Analysis

‏נפרק Outcomes לפי:

```text
time_of_day
spread_bucket
liquidity_bucket
size_bucket
side
signal_strength
rank_gap
regime
day / week
```

‏אבל לא ניצור rule לכל cross-product.

---

## ‏48. Avoid Context Explosion

‏לא:

```text
symbol × hour × spread × side × regime × size × venue
```

‏אלא מספר קטן של dimensions עם מספיק samples.

---

## ‏49. Route Distribution Drift

‏גם כאשר SMART הוא black box, ננטר outputs ככל שה־Broker מספק metadata.

‏לדוגמה:

```text
execution_venue_distribution
fill_rate_by_destination
markout_by_destination
fee_by_destination
```

‏שינוי חריג יכול לפתוח RCA.

---

## ‏50. Capability Drift

‏Routing capabilities משתנות בזמן.

‏Registry ישמור:

```text
capability
scope
source
verified_at
known_limitations
```

‏לא hardcode לנצח.

---

## ‏51. Fee Schedule Drift

‏Fee/Rebate schedule הוא time-sensitive input.

‏כל cost model צריך version/date.

‏שינוי fee אינו auto-promotion ל־venue אחר; הוא input ל־new experiment.

---

## ‏52. Routing State Machine

‏Parent-level state מינימלי:

```text
PLANNED
ROUTING
WORKING
PARTIALLY_FILLED
REROUTING
FILLED
CANCELLED
REJECTED
UNKNOWN
```

‏Child Orders משתמשים ב־Order State Machine של פרק 29.

‏אין צורך ב־giant combined state machine.

---

## ‏53. Partial Fill + Reroute

‏אחרי partial fill:

```text
filled_qty = real exposure
remaining_qty = candidate for policy decision
```

‏Reroute של remainder אינו יכול להתעלם מ־:

```text
current position
working children
cancel-pending children
unknown children
signal remaining TTL
remaining execution budget
```

---

## ‏54. Split Routing

‏Split routing אינו Baseline ראשון.

‏הוא מוסיף:

- ‏Child Order lifecycle.
- ‏partial combinations.
- ‏cancel races.
- ‏reconciliation complexity.
- ‏venue attribution complexity.

‏נוסיף רק אם quantity/capacity evidence מצדיק זאת.

---

## ‏55. Entry vs Exit Routing

‏אין הנחה שהם משתמשים באותה policy.

### ‏Entry

‏אפשר לבחור:

```text
NO_TRADE
```

‏ולכן cost of no-fill יכול להיות נמוך יותר.

### ‏Exit

‏כבר קיים Exposure.

‏לכן:

```text
risk-reduction priority
```

‏יכול לגבור על routing optimization.

---

## ‏56. Emergency Exit Routing

‏Emergency path צריך להיות פשוט יותר מ־normal route optimization.

```text
Safety / Risk requirement
→ minimal reliable execution path
→ price/risk protection as policy allows
→ broker truth
```

‏לא custom venue optimizer מורכב בזמן incident.

---

## ‏57. Safety Dominance

‏כאשר Safety Mode מגביל Entry:

```text
Routing cannot override it.
```

‏כאשר `EXIT_ONLY` פעיל:

‏Routing יכול לפעול רק בתוך risk-reducing capabilities שה־Safety layer התירה.

---

## ‏58. Restart / Reconnect

‏אחרי reconnect:

```text
broker sync
→ child-order reconciliation
→ pending-exposure rebuild
→ routing state rebuild
→ capability validation
→ only then new routing decisions
```

‏Route selection לא “ממשיך מאיפה שהיה” בלי authoritative state.

---

## ‏59. Observability

‏Routing Dashboard בסיסי:

```text
current parent orders
child orders by state
route distribution
fallback count
reroute count
routing queue age
submit-to-ack P50/P95/P99
first-fill P50/P95/P99
fill rate
partial-fill rate
slippage
markout
fees/rebates
unknown effects
route rejects
NO_TRADE routing reasons
```

---

## ‏60. Routing RCA

‏לכל bad execution:

```text
Was market data fresh?
Was route decision stale?
Was selected route supported?
Was price protection still valid?
Did queue deteriorate?
Did signal decay before fill?
Was fallback used?
Did rerouting help or hurt?
Was broker state known?
Did fees matter materially?
Was adverse markout destination-specific?
```

---

## ‏61. First Divergence

‏נאתר את הנקודה הראשונה שבה Champion ו־Challenger נבדלו:

```text
same intent
→ same market snapshot
→ different route decision
→ different child-order path
→ different fill / no-fill estimate
→ different net outcome
```

‏לא נסתפק ב־PnL הסופי.

---

## ‏62. Routing Failure → Hypothesis

‏דוגמה:

```text
Observation:
SMART passive orders in a specific broad liquidity bucket
show high time-to-fill and missed-opportunity cost.

Hypothesis:
A simple direct venue policy for this bucket
improves net capture without worsening adverse markout.
```

‏ואז experiment, לא patch.

---

## ‏63. No-Fill RCA

‏Reason candidates:

```text
QUEUE_NOT_REACHED
ROUTE_STALE
ROUTE_UNAVAILABLE
LIQUIDITY_MOVED
SIGNAL_EXPIRED
PRICE_PROTECTION_TOO_TIGHT
CANCELLED_BY_POLICY
GOOD_NO_FILL
```

---

## ‏64. Good Routing Outcome Does Not Require Fill

‏אם Route לא התמלא והמניה מיד זזה נגד ה־Intent:

```text
GOOD_NO_FILL
```

‏יכול להיות outcome חיובי.

---

## ‏65. Fill Rate Bias

‏לא ננתח רק filled orders.

‏Dataset כולל:

```text
fills
partial fills
no fills
cancels
reroutes
fallbacks
rejects
unknown effects
```

---

## ‏66. Routing Model Calibration

‏אם בעתיד נבנה fill/route prediction:

```text
predicted_fill_probability
predicted_time_to_fill
predicted_net_cost
```

‏נבדוק calibration מול outcomes, לא רק ranking.

---

## ‏67. Route-Specific Queue Models

‏`P3/P4` בלבד.

‏דרישות:

```text
sufficient venue attribution
sufficient samples
reliable timestamps
queue model confidence
stable routing semantics
OOS incremental value
```

‏אחרת segmentation מייצר noise.

---

## ‏68. Direct Routing Promotion Criteria

‏Custom/Direct policy מקודמת רק אם:

1. ‏יש failure mode ברור של SMART/control.
2. ‏ה־Challenger פותר אותו באופן explainable.
3. ‏השיפור הוא incremental מול SMART.
4. ‏הוא נשמר OOS.
5. ‏הוא נשמר בכמה ימים/regimes סבירים.
6. ‏P95/P99 latency לא נשברים.
7. ‏Tail slippage לא מחמיר באופן בלתי־סביר.
8. ‏Unknown/error rate לא גדל.
9. ‏Price protection נשמרת.
10. ‏Operational complexity מוצדקת על ידי value.
11. ‏Rollback ל־SMART פשוט.
12. ‏Shadow/Replay evidence תומך.

---

## ‏69. Rejection Criteria

‏נשאיר SMART אם:

- ‏Direct improvement קיים רק ב־sample קטן.
- ‏השיפור נובע בעיקר מ־rebate.
- ‏השיפור נעלם אחרי markout/opportunity cost.
- ‏הוא דורש data שאינו זמין בזמן אמת.
- ‏הוא תלוי ב־venue assumptions שלא ניתנים לאימות.
- ‏P99 latency/unknown states מחמירים.
- ‏reroute churn עולה.
- ‏benefit קטן מה־complexity tax.
- ‏הוא עובד רק ב־perfect hindsight fill model.

---

## ‏70. What I Would Avoid Initially

‏לא להתחיל עם:

- ‏Custom SOR מלא.
- ‏Direct venue לכל Symbol.
- ‏Fee/Rebate optimizer.
- ‏Learned router.
- ‏Multi-child sweeping engine.
- ‏Dark/lit route optimizer.
- ‏Venue-specific exceptions רבים.
- ‏Millisecond venue ping-pong.
- ‏L3-dependent custom route אם אין L3 אמין.

---

## ‏71. What to Add Later

‏רק לפי Evidence:

- ‏simple direct challenger.
- ‏bounded reroute rules.
- ‏route distribution drift.
- ‏venue bucket statistics.
- ‏queue-aware route challenger.
- ‏split routing for capacity.
- ‏route-specific cost models.
- ‏learned routing after strong dataset maturity.

---

## ‏72. Minimum Data Required

‏ל־SMART baseline:

```text
signal / decision timestamps
market snapshot
routing instruction
broker order events
fills
fill destination if reported
fees/costs if available
markout market data
signal/rank state at fill
```

‏ל־Direct challenger נוסף:

```text
destination capabilities
destination availability
venue-relevant market data
route-specific timing
queue assumptions if passive
```

---

## ‏73. Data Quality Requirements

‏Routing Experiment נפסל אם:

- ‏timestamps אינם מהימנים.
- ‏route/destination metadata חסר באופן שמונע attribution.
- ‏fill outcomes אינם deduplicated.
- ‏market snapshot אינו point-in-time.
- ‏signal state at fill אינו משוחזר.
- ‏cost model אינו versioned.
- ‏cross-provider clocks אינם מיושרים מספיק לניתוח.

---

## ‏74. Replay Contract

‏Custom Routing ב־Replay חייב להיות deterministic:

```text
same dataset
+ same routing policy version
+ same config
+ same seed if stochastic
= same route decisions
```

‏SMART replay מסמן:

```text
observed_broker_route
```

‏ולא טוען לשחזור internal algorithm.

---

## ‏75. Golden Scenarios

‏נשמור לפחות:

```text
SMART normal fill
DIRECT route unavailable
route decision expires before submit
partial fill then reroute candidate
cancel pending then late fill
fallback to SMART with price protection
cross-provider quote divergence
broker disconnect after child submit
route capability mismatch
reroute budget exhausted
GOOD_NO_FILL
```

---

## ‏76. Property Tests

### ‏Safety Dominance

```text
Safety denies new risk
=> no routing policy may emit risk-increasing child order
```

### ‏Parent Quantity

```text
sum(realized child fills)
<= authorized parent quantity
```

### ‏Stale Intent

```text
expired routing intent
=> no new child order
```

### ‏Unknown Effect

```text
unresolved child effect
=> no conflicting new child
```

### ‏Price Protection

```text
fallback / reroute
=> cannot expand price boundary silently
```

---

## ‏77. Fault Injection

‏נזריק:

- ‏destination unavailable.
- ‏broker reject.
- ‏slow ACK.
- ‏missing ACK.
- ‏late fill.
- ‏cancel/fill race.
- ‏quote stale.
- ‏spread jump.
- ‏routing queue backlog.
- ‏reconnect בזמן reroute.

---

## ‏78. Current Verification Snapshot — 2026-10-27

### ‏IBKR SmartRouting

‏לפי מסמכי IBKR הרשמיים שנבדקו בתאריך זה, SmartRouting מוצג כמנגנון proprietary שסורק execution venues מתחרים ומנסה לייעל מהירות וביצוע לפי מחיר או total consideration, בהתאם להגדרות ולמסגרת ה־account/platform הרלוונטית.

‏המסמכים גם מציינים ש־SmartRouting יכול להמשיך להעריך תנאי שוק ולבצע dynamic re-routing של כל הפקודה או חלק ממנה.

### ‏Direct Routing

‏IBKR מתעדת יכולת לתת specific routing instructions ליעד מסוים עבור מוצרים/מסלולים נתמכים.

‏במסמך execution policy רשמי מצוין ש־specific direct-routing instructions עשויות למנוע מהברוקר להפעיל את מנגנון SmartRouting שנועד להשגת best execution לפי המדיניות הרלוונטית.

### ‏Order-Type / Route Support

‏עמוד Order Types של IBKR מציג כיום order types רבים עם support שונה ל־`Smart`, ‏`Directed` או שניהם.

‏מכאן Recommendation מחייב:

```text
Do not infer route capability from order-type name.
Verify capability for the actual product / route / account / API path.
```

### ‏Time-Sensitive Rule

‏הפרטים הבאים נשארים time-sensitive:

```text
supported destinations
order-type support by route
fees / rebates
routing defaults
platform/API capabilities
session support
account/entity restrictions
```

‏לפני שימוש תפעולי יש לאמת שוב מול המקורות הרשמיים וה־account בפועל.

---

## ‏79. Confidence

| Recommendation | Confidence |
|---|---|
| ‏SMART כ־initial control | `HIGH` |
| ‏Direct רק אחרי failure mode מדוד | `HIGH` |
| ‏Intent/Destination separation | `HIGH` |
| ‏Net Execution Quality מעל fee/fill בלבד | `HIGH` |
| ‏Simple Direct challenger יכול להוסיף value | `MEDIUM` — empirical |
| ‏Venue-aware custom routing ישפר net result | `LOW/MEDIUM` עד Evidence |
| ‏Learned router נחוץ | `LOW` בשלב הנוכחי |

---

## ‏80. User-Specific Application

‏למערכת המחקרית שלנו:

```text
Broad external market data
→ Whole-market ranking
→ Top candidate
→ Fresh broker/execution recheck
→ Risk
→ Safety
→ ExecutionPlan
→ SMART routing control
→ Broker events / fills
→ Routing attribution
→ RCA
```

‏אין ניסיון להתחרות ב־microsecond venue arbitration.

‏המטרה היא edge ששורד latency מציאותי של מערכת אישית, עם Routing פשוט, explainable ומדיד.

### ‏Initial research question

```text
Does SMART preserve enough edge for our short-horizon candidate?
```

### ‏Only if not

```text
Where specifically does SMART lose value?
```

### ‏Then

```text
Can one simple Direct rule improve that failure mode?
```

---

## ‏81. Concrete Baseline Contract

```text
ON TRADE INTENT:
 validate signal alive
 validate canonical instrument
 validate fresh executable market state
 validate broker READY
 validate risk + safety
 compute ExecutionPlan
 create RoutingIntent

ROUTING:
 default = SMART control
 enforce price protection
 assign route TTL
 persist RoutingDecision
 submit via broker adapter

WHILE WORKING:
 track child/broker state
 track signal age
 track route decision age
 track fill / partial / no-fill
 do not reroute blindly
 reconcile UNKNOWN before conflicting action
 respect reroute/message budgets

ON TERMINAL:
 persist RoutingOutcome
 compute latency / slippage / markout / missed opportunity
 attribute fees and routing contribution
 feed RCA / experiment dataset

DIRECT CHALLENGER:
 only from measured SMART failure mode
 Shadow / Replay first
 capability-verified
 point-in-time data parity
 bounded reroute/fallback
 OOS validation
 promote only on incremental net value
```

---

## ‏82. Recommendation Summary

```text
P0:
Intent != Destination
Routing Readiness Contract
Route TTL
Price Protection dominates
Unknown Effect => reconcile first
Parent/Child exposure invariants

P1:
SMART as control
full Routing Decision Ledger
Outcome Record
net-quality scorecard
latency / fill / markout attribution

P2:
simple Direct challenger
bounded fallback
bounded reroute
route drift analysis

P3:
context-aware / venue-aware routing
venue queue models
split routing when capacity requires

P4:
learned/custom smart router
only after strong data and proven incremental edge
```

‏המשפט המסכם:

> ‏**Routing טוב אינו זה שבוחר את ה־venue שנראה הכי מהיר, הכי זול או עם ה־rebate הגבוה ביותר; הוא זה שמוסיף Net Execution Value מוכח מעל baseline פשוט, בלי לשבור price protection, safety, determinism ו־operational reliability.**

---

## ‏83. Relationship to Later Sheets

- ‏`40` — Hidden / Reserve / Midpoint / Pegged / ATS ירחיב את סוגי ה־liquidity וה־destinations שאינם נראים כ־lit top-of-book רגיל.
- ‏`41+` — יעמיקו execution algorithms ו־microstructure בהתאם לסדר הקורס.
- ‏`Recommended Order Policy` ו־`Recommended Execution Policy` יסנתזו בסוף את 37–41 עם Risk/Safety/Observability.
