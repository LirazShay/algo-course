# ‏חלק 10 — Engine Decision Guide

## ‏10A — Decision Inputs ו־Elimination Gates

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, חלק 10A אינו בוחר Broker Order. הוא קובע אם פעולה מותרת, אילו constraints חלים עליה, ואילו Behavior Candidates רשאים בכלל להגיע לשלב הבחירה של 10B.

---

## ‏10A.1 המנוע לא מתחיל מ־Order Type

‏השאלה הראשונה אינה:

```text
Which order type should I send?
```

‏אלא:

```text
Is execution allowed at all?
What constraints must any execution obey?
Which behaviors remain legal after those constraints?
```

‏סדר העבודה הקנוני הוא:

```text
observe
→ validate
→ eliminate
→ derive boundaries
→ generate candidates
→ choose behavior
→ materialize concrete broker order
```

> ‏`ENGINE RULE` — Broker Order Primitive הוא כמעט סוף התהליך, לא תחילתו.

---

## ‏10A.2 אין `Master Score` שמבטל Safety Gates

‏Safety, truth ו־eligibility אינם נקודות שאפשר לפצות עליהן באמצעות Signal חזק.

‏לא נרצה:

```text
strong momentum +10
stale quote -4
broker unreconciled -5
final score = +1
=> BUY
```

‏אלא:

```text
if broker state is unreconciled:
    NEW_ENTRY = FORBIDDEN
```

‏Scores יכולים לשמש למחקר או ל־ranking בתוך קבוצת survivors, אבל לא לעקוף hard gates.

---

## ‏10A.3 תוצאת Decision אינה רק `BUY / NO BUY`

‏נשתמש ב־dispositions מובחנים:

```text
ALLOW_ENTRY
NO_TRADE
DEFER
EXIT_ONLY
CANCEL_EXISTING
NO_ACTION
```

### ‏`ALLOW_ENTRY`

‏מותר ליצור Entry חדשה בתוך constraints שהוחזרו.

### ‏`NO_TRADE`

‏Opportunity שנבחנה אינה עומדת כעת בדרישות Entry. זו מסקנה מקצועית מלאה, לא error.

### ‏`DEFER`

‏אין מספיק certainty זמנית לקבל החלטה סופית; מחכים ל־event או snapshot חדש ואז מריצים Decision חדשה.

### ‏`EXIT_ONLY`

‏אסור להגדיל Risk, אבל פעולות שמקטינות Exposure או משקמות Protection עדיין מותרות.

### ‏`CANCEL_EXISTING`

‏Entry קיימת כבר אינה תקפה וצריך לבקש את ביטולה; אין implication שחייבים ליצור replacement.

### ‏`NO_ACTION`

‏ה־Decision הסתיימה ואין side effect חדש לבצע במחזור הזה. זה אינו synonym ל־`NO_TRADE`: ייתכן שכבר קיימת Order תקפה שצריך פשוט להשאיר כפי שהיא.

> ‏`ENGINE RULE` — `NO_TRADE`, ‏`DEFER` ו־`NO_ACTION` מתארים מצבים שונים ואסור להשתמש בהם כאותו enum value.

---

## ‏10A.4 `DecisionResult` מחזיר Constraints, לא Broker Payload

```text
DecisionResult {
  disposition
  purpose
  elimination_reasons
  allowed_behavior_candidates
  forbidden_behavior_candidates

  max_qty
  economic_price_bound
  max_application_order_ttl_ms
  max_signal_age_ms

  partial_fill_policy
  protection_requirement
  capability_requirements
  reevaluate_at
}
```

‏`economic_price_bound` הוא המונח הקנוני. ב־Entry אפשר לממש אותו כ־`entry_max_price`; ב־Exit כ־`exit_min_price` או boundary מתאים לכיוון הפעולה.

‏לא נשתמש במקביל ב־`hard_cap`, ‏`hard_price_boundary`, ‏`max_price` ו־`economic cap` כאילו הם מושגים שונים.

---

## ‏10A.5 שש משפחות State שהחלטה חייבת לראות

```text
1. SIGNAL STATE
2. MARKET STATE
3. EXECUTION / ORDER STATE
4. POSITION / RISK STATE
5. CAPABILITY STATE
6. SYSTEM HEALTH STATE
```

‏כל אחת מהן יכולה לפסול Entry לבדה.

---

## ‏10A.6 `SignalState`

```text
SignalState {
  signal_id
  side
  created_at
  expires_at
  validity
  urgency
  expected_gross_edge_bps
  expected_holding_ms
  target_qty
  max_position_qty
  partial_fill_tolerance
  reversal_state
  source_data_version
}
```

‏Execution אינה אמורה להמציא Signal מחדש מתוך עשרות indicators. היא מקבלת Contract סמנטי מה־Strategy.

---

## ‏10A.7 `Signal validity`, ‏Age ו־Urgency הם dimensions נפרדים

‏`validity` יכולה להיות למשל:

```text
VALID
WEAKENING
INVALIDATED
EXPIRED
UNKNOWN
```

‏ונחשב:

```text
signal_age_ms = decision_ts - signal_created_ts
remaining_signal_life_ms = signal_expires_at - decision_ts
```

‏Urgency אינה Signal Strength. Signal חזקה יכולה להיות לא דחופה; Signal בינונית יכולה להיות דחופה משום שכמעט לא נשארו לה חיים.

---

## ‏10A.8 ארבעה clocks שאסור לערבב

‏הקורס משתמש בארבעה מושגים שונים:

```text
signal_ttl
application_order_ttl
broker_tif
working_order_age
```

### ‏`signal_ttl`

‏כמה זמן ה־Signal עצמו תקף.

### ‏`application_order_ttl`

‏כמה זמן האפליקציה מוכנה להשאיר Order מסוימת או behavior מסוים בחיים לפני re-decision.

### ‏`broker_tif`

‏`DAY`, ‏`IOC`, ‏`GTC`, ‏`GTD` וכדומה — semantics שמועברות ל־Broker/Venue.

### ‏`working_order_age`

‏כמה זמן Order מסוימת עובדת בפועל מאז submit/ack הרלוונטיים.

> ‏`ENGINE RULE` — `application_order_ttl` אינה `broker_tif`, ו־Order יכולה להיות חוקית לפי TIF אך stale לפי ה־Signal או לפי TTL האפליקטיבי.

---

## ‏10A.9 Momentum features נשארות ב־Strategy

‏Execution יכולה לקבל summary כגון:

```text
last_change_10s
last_change_30s
last_change_60s
last_change_120s
recent_up_sequence
trade_count_10s
trade_count_30s
time_since_last_trade
quote_velocity
reversal_detected
```

‏אבל השימוש הוא להבין validity, decay ו־execution feasibility — לא להחליף את Scanner/Strategy.

---

## ‏10A.10 `Expected Edge` חייב להיות Executable Edge

```text
expected_net_edge =
    expected_gross_move
  - expected_entry_cost
  - expected_exit_cost
  - commissions
  - venue_fees
  - slippage_allowance
  - safety_margin
```

‏אם אין net edge מספק תחת assumptions סבירות לביצוע, Entry נפסלת לפני בחירת Behavior Candidate.

---

## ‏10A.11 `Expected Entry Cost` אינו רק Spread

```text
spread_component
expected_slippage
expected_depth_cost
expected_fee_component
expected_adverse_selection
missed_opportunity_cost_when_relevant
```

‏Passive ואגרסיבי מחלקים את העלויות אחרת. 10A אינה בוחרת מי עדיף; היא רק קובעת את הגבולות שבתוכם בחירה כזו יכולה להיות חוקית.

---

## ‏10A.12 `Exit Feasibility` נבדקת לפני Entry

‏לפני Entry שואלים:

```text
If we get filled now,
can we plausibly reduce or exit the resulting position
within the required risk / holding horizon?
```

‏נבדוק לפחות:

```text
current exit-side depth
spread
recent trade activity
short-horizon liquidity stability
expected exit cost
position size relative to executable liquidity
protection capability
```

‏Entry קלה אינה מספיקה אם Exit צפויה להיות בלתי סבירה.

---

## ‏10A.13 `MarketState`

```text
MarketState {
  market_ts
  bid
  bid_size
  ask
  ask_size
  midpoint
  spread_abs
  spread_bps
  last
  last_size
  last_trade_ts
  quote_ts
  visible_depth_within_entry_bound
  visible_depth_within_exit_bound
  short_horizon_volatility
  quote_velocity
  trade_activity
  session
  halt_state
}
```

‏Top of Book לבדה אינה מספקת לכל החלטה, אך לא נדרוש Data שאינה זמינה בלי להגדיר Missing Data Policy מפורשת.

---

## ‏10A.14 לכל Fact יש Value וגם Freshness

‏לדוגמה:

```text
ask = 20.00
quote_ts = ...
quote_age_ms = ...
```

‏אותו עיקרון חל על Signal, Position, Open Orders, Capabilities ו־Account/System state.

---

## ‏10A.15 `Data Freshness Gate`

```text
if quote_age_ms > max_quote_age_ms:
    deny new entry
```

‏המספרים הם config/versioned research parameters.

> ‏`ENGINE RULE` — Market Data ישנה אינה סיבה לבחור Order אגרסיבית יותר.

---

## ‏10A.16 Freshness תלויה ב־regime

‏Threshold יכול להשתנות לפי:

```text
symbol activity regime
quote update rate
trade rate
volatility
session
```

‏ב־V1 אפשר להשתמש ב־conservative limits קבועים, אבל יש לסמן אותם `POLICY DEFAULT`, לא Fact אוניברסלי.

---

## ‏10A.17 `Spread Gate` היא Gate כלכלית

```text
spread_bps <= allowed_spread_bps?
spread_cost <= allowed_fraction_of_edge?
```

‏Spread רחבה אינה אוטומטית `NO_TRADE`: היא יכולה להפוך midpoint/passive behavior לרלוונטי יותר.

‏השאלה הקנונית היא:

```text
Can any allowed behavior preserve required net edge
inside the Economic Price Bound?
```

---

## ‏10A.18 `Depth Feasibility Gate`

```text
requested_qty
visible_qty_within_economic_bound
visible_qty_at_best
requested_qty / visible_qty_within_economic_bound
```

‏תוצאות אפשריות:

```text
PASS
REDUCE_SIZE
NO_TRADE
```

‏מה שלא עושים הוא להרחיב `Economic Price Bound` אוטומטית רק כדי להשיג Fill.

---

## ‏10A.19 Size היא Decision, לא רק Budget

```text
capital_based_qty
risk_based_qty
liquidity_based_qty
strategy_max_qty
position_limit_qty
exit_feasible_qty
```

```text
max_allowed_qty = min(all applicable bounds)
```

---

## ‏10A.20 `Volatility / Market-State / Session Gates`

‏Volatility גבוהה אינה בהכרח פסילה, אבל היא משנה execution risk.

‏נבדוק למשל:

```text
short_horizon_range
quote_jump_size
recent_gap_ticks
spread_instability
depth_instability
```

‏Market state יכול להיות:

```text
NORMAL_CONTINUOUS
PRE_OPEN
AUCTION
HALTED
RESUMING
UNKNOWN
```

‏ו־Session יכולה להיות:

```text
REGULAR
PRE_MARKET
AFTER_HOURS
OVERNIGHT
```

‏רק states/sessions שה־Policy וה־Capability Matrix מכירות נכנסות למסלול הרגיל.

---

## ‏10A.21 `PositionState` משתמשת ב־Position Truth הקנונית

```text
PositionState {
  symbol
  side
  execution_ledger_position
  broker_reported_position
  reconciled_position
  avg_price
  protection_state
  exit_state
  externally_changed
  last_reconciled_at
}
```

> ‏`ENGINE RULE` — Decision שמגדילה Risk נשענת על `reconciled_position` כאשר קיים סיכון ל־drift, manual activity או recovery.

---

## ‏10A.22 `OrderState` ו־Potential Exposure

‏גם אם `reconciled_position = 0`, יכולות להיות Orders שעדיין potentially executable.

```text
live_entry_qty
cancel_requested_entry_qty
cancel_pending_entry_qty
modify_unknown_qty
submit_unknown_qty
live_exit_qty
cancel_pending_exit_qty
```

‏Potential Exposure Gate:

```text
reconciled_position
+ potentially_executable_entry_qty
+ proposed_new_qty
<= allowed_position
```

> ‏`ENGINE INVARIANT` — Any order without terminal broker evidence remains potentially executable.

---

## ‏10A.23 `Position Protection Gate`

```text
POSITION_UNPROTECTED
=> forbid new unrelated risk
=> allow protection / exit / reconciliation actions
```

‏מצב כזה מוביל בדרך כלל ל־`EXIT_ONLY`, לא ל־Entry נוספת.

---

## ‏10A.24 `RiskState`

```text
RiskState {
  account_ready
  buying_power_state
  symbol_position_limit
  global_position_limit
  max_loss_state
  max_open_intents
  max_live_orders
  emergency_mode
  kill_switch
}
```

‏Hard Risk Limit אינו משהו ש־Signal Quality יכולה לעקוף.

---

## ‏10A.25 `CapabilityState` הוא Snapshot של Resolver, לא אוסף Booleans מקריים

‏10A מקבלת capability snapshot שמכיל לכל feature רלוונטית לפחות:

```text
capability_id
scope
runtime_evidence
enablement_state
disable_reason
last_verified_at
```

‏ב־Production:

```text
if enablement_state != PRODUCTION_ENABLED:
    eliminate candidate requiring that capability
```

‏ב־Research אפשר להגדיר Policy אחרת לפי סביבת הניסוי.

> ‏`ENGINE RULE` — Capability Resolver **מסנן** Candidates. הוא אינו בוחר את ה־winner ואינו מחליף את Decision Engine.

---

## ‏10A.26 `SystemHealthState`

```text
SystemHealthState {
  broker_connection
  broker_reconciled
  market_data_health
  clock_health
  event_loop_health
  persistence_health
  order_id_allocator_health
  capability_cache_health
  operating_mode
}
```

‏`operating_mode` משתמש ב־vocabulary הקנוני:

```text
BOOTING
RECOVERING
READY
ENTRY_DISABLED
EXIT_ONLY
DEGRADED
EMERGENCY
FROZEN
```

---

## ‏10A.27 `Clock Health` היא Safety Feature

‏נבדיל בין:

```text
wall_clock_time
monotonic_elapsed_time
source_exchange_or_feed_time
local_receive_time
```

‏TTL אפליקטיבי מקומי צריך להתבסס על monotonic elapsed time כאשר אפשר.

---

## ‏10A.28 Global Freeze / Entry Disable Gate

‏דוגמאות:

```text
kill_switch = ON
broker_state = UNKNOWN
reconciliation_in_progress
critical_position_mismatch
market_data_unhealthy
required persistence unavailable
order_id_allocator_invalid
```

‏התוצאה אינה תמיד "הכול כבוי". אפשר לקבל:

```text
ENTRY_DISABLED
```

‏או:

```text
EXIT_ONLY
```

‏כך פעולות שמקטינות Risk אינן נחסמות יחד עם Entries חדשות.

---

## ‏10A.29 סדר ה־Gates

```text
1. SYSTEM HEALTH GATE
2. BROKER RECONCILIATION GATE
3. OWNERSHIP / POTENTIAL EXPOSURE GATE
4. MARKET DATA QUALITY / FRESHNESS GATE
5. SIGNAL VALIDITY / AGE GATE
6. SESSION / MARKET-STATE GATE
7. ECONOMIC EDGE GATE
8. LIQUIDITY / DEPTH GATE
9. EXIT FEASIBILITY GATE
10. RISK LIMIT GATE
11. CAPABILITY GATE
12. CANDIDATE GENERATION
```

‏הסדר המדויק יכול להשתנות מעט במימוש, אבל Truth/Safety קודמות ל־Optimization.

---

## ‏10A.30 למה Reconciliation קודמת ל־Signal

```text
unknown execution state
=> no new entry
```

‏Signal מצוין אינו מתיר Risk חדש כאשר איננו יודעים אם Order קודמת עדיין חיה.

---

## ‏10A.31 `Signal Gate`

‏Entry יכולה להיפסל כאשר:

```text
signal.validity != VALID
signal_age_ms > max_signal_age_ms
remaining_signal_life_ms <= minimum_execution_window_ms
reversal_detected = true
```

‏אין להסיק מכך ש־Order קיימת תמיד חייבת להתבטל באותו threshold; לכך יש `ORDER_STILL_VALID` evaluation נפרד.

---

## ‏10A.32 `Economic Gate`

```text
expected_net_edge_at_allowed_execution
>=
minimum_required_net_edge
```

‏הבדיקה משתמשת assumptions שמרניות ומתאימות ל־Behavior Candidate האפשרית, לא במחיר תיאורטי שאינו executable.

---

## ‏10A.33 `Exit Feasibility Gate` יכולה להקטין Size

‏לדוגמה:

```text
entry-side liquidity supports = 500
exit-feasible qty = 180
```

‏תוצאה אפשרית:

```text
max_allowed_qty = 180
```

‏ולא בהכרח `NO_TRADE`.

---

## ‏10A.34 `Capability Gate` לא בוחר Winner

```text
pre-capability candidates:
PASSIVE_JOIN
PASSIVE_POST_ONLY
MIDPRICE
MARKETABLE_LIMIT_IOC
ADAPTIVE_LIMIT_URGENT

runtime:
POST_ONLY path = not production-enabled
ADAPTIVE path = runtime conflict

survivors:
PASSIVE_JOIN
MIDPRICE
MARKETABLE_LIMIT_IOC
```

‏רק 10B משווה בין survivors.

---

## ‏10A.35 Fallback ו־Escalation חוזרים דרך Decision חדשה

‏אם Candidate נדחתה או לא עבדה:

```text
new market snapshot
new signal age
new position/order state
new capability state
run gates again
```

‏`Fallback` פירושו שה־path הקודם נכשל או אינו זמין.

‏`Escalation` פירושה ש־urgency/risk השתנו.

‏שניהם דורשים re-decision; אף אחד מהם אינו synonym ל־"שלח משהו יותר אגרסיבי".

---

## ‏10A.36 `UNKNOWN` הוא Epistemic State אמיתי

```text
YES
NO
UNKNOWN
```

‏לדוגמה:

```text
broker_reconciled = UNKNOWN
exit_protection_active = UNKNOWN
quote_fresh = UNKNOWN
```

‏ב־Entry, `UNKNOWN` קריטי מתנהג בדרך כלל כ־deny/defer.

‏ב־Exit, `UNKNOWN` יכול להעלות עדיפות ל־risk reduction או reconciliation.

---

## ‏10A.37 Missing Data Policy

‏לכל field נגדיר:

```text
REQUIRED_FOR_ENTRY
OPTIONAL_WITH_FALLBACK
DIAGNOSTIC_ONLY
```

‏אם Required חסר — Gate מחזיר `UNKNOWN`/`FAIL` עם reason code מפורש. שפת התכנות אינה מחליטה עבורנו כיצד לפרש `null`.

---

## ‏10A.38 Data Quality היא יותר מ־Freshness

‏בדיקות לדוגמה:

```text
bid <= ask
sizes >= 0
timestamps coherent
symbol identity matches
price increment valid
no impossible jump without regime flag
```

‏Snapshot טרייה אך לא עקבית אינה Market Truth מספקת.

---

## ‏10A.39 Hysteresis ו־`NEW_ENTRY_ELIGIBLE` מול `ORDER_STILL_VALID`

‏Threshold ליצירת Order חדשה אינו חייב להיות זהה ל־threshold שמחליט אם להשאיר Order קיימת.

```text
NEW_ENTRY_ELIGIBLE
ORDER_STILL_VALID
```

‏כך אפשר למנוע oscillation סביב noise, למשל מצב שבו spread עוברת את רף Entry לשבריר שנייה אבל Passive Order קיימת עדיין תקפה לעוד זמן קצר.

‏Signal invalidation, לעומת זאת, יכולה להיות Hard Cancel condition לפי Policy.

---

## ‏10A.40 Decision Revision ו־Deterministic Replay

‏כל evaluation מקבלת:

```text
decision_id
decision_revision
policy_version
config_snapshot_id
input_snapshot_ids
```

‏Config היא immutable בתוך Decision אחת.

‏אם נשמור את snapshots ואת policy version, אותה Decision צריכה להיות replayable באופן דטרמיניסטי.

---

## ‏10A.41 `DecisionTrace`

```text
DecisionTrace {
  decision_id
  signal_id
  revision
  evaluated_at
  policy_version
  gates[]
  eliminated_candidates[]
  surviving_candidates[]
  constraints
  disposition
}
```

‏זהו artifact מחקרי ותפעולי, לא רק log טקסטואלי.

---

## ‏10A.42 `GateResult`

```text
GateResult {
  gate_id
  outcome        // PASS | FAIL | UNKNOWN | REDUCE
  reason_code
  observed_value
  threshold
  input_ts
  action
}
```

‏`REDUCE` מאפשרת Gate להקטין Size בלי לפסול Opportunity כולה.

---

## ‏10A.43 Reason Codes יציבים

```text
SIGNAL_EXPIRED
SIGNAL_INVALIDATED
QUOTE_STALE
MARKET_DATA_INVALID
SPREAD_TOO_COSTLY
INSUFFICIENT_DEPTH
EXIT_NOT_FEASIBLE
POSITION_LIMIT
POTENTIAL_EXPOSURE_LIMIT
BROKER_UNRECONCILED
CAPABILITY_NOT_ENABLED
CAPABILITY_RUNTIME_CONFLICT
SYSTEM_DEGRADED
POSITION_UNPROTECTED
```

‏Reason codes מאפשרים מדידה, replay ו־RCA במקום מחרוזות חופשיות.

---

## ‏10A.44 דוגמה — Signal שעובר את ה־Gates

```text
signal_valid = true
remaining_signal_life = 1400ms
quote_age = 18ms
spread = economically acceptable
requested_qty = 100
visible_qty_within_bound = 500
exit_feasible_qty = 350
broker_reconciled = true
reconciled_position = 0
potentially_executable_entry_qty = 0
required capabilities = production-enabled
```

‏תוצאה:

```text
disposition = ALLOW_ENTRY
max_qty = 100
candidate_generation = allowed
```

‏עדיין לא נבחרו Passive, MidPrice או IOC.

---

## ‏10A.45 דוגמה — Spread הורסת את ה־Edge

```text
expected_gross_edge = 18 bps
conservative_round_trip_execution_cost = 24 bps
```

```text
ECONOMIC_EDGE_GATE = FAIL
disposition = NO_TRADE
```

---

## ‏10A.46 דוגמה — Quote ישנה

```text
signal_valid = true
quote_age = 900ms
activity = very high
```

```text
DATA_FRESHNESS_GATE = FAIL
disposition = DEFER or NO_TRADE according to policy
```

‏לא מגיבים ל־stale data באמצעות aggression גבוהה יותר.

---

## ‏10A.47 דוגמה — Entry ישנה ב־Cancel

```text
reconciled_position = 0
old_entry_remaining = 100
old_entry_state = CANCEL_REQUESTED
new_signal_target = 100
position_limit = 100
```

‏ה־Order הישנה עדיין potentially executable.

```text
potential_exposure = 100 old + 100 proposed
```

‏לכן Entry חדשה מלאה אינה עוברת Potential Exposure Gate.

---

## ‏10A.48 דוגמה — Partial Fill יוצרת Decision חדשה

```text
target = 100
filled = 37
remainder canceled
```

‏ה־Context הבא הוא:

```text
reconciled_position = 37
remaining_intent = 63
protection_state = current evidence
remaining_signal_life = new value
current_market = new snapshot
```

> ‏`ENGINE RULE` — Partial Fill היא Decision state חדשה, לא המשך אוטומטי של ההחלטה הישנה.

---

## ‏10A.49 דוגמה — Capability חסרה

```text
PASSIVE_POST_ONLY = RUNTIME_CONFLICT
PASSIVE_JOIN = PRODUCTION_ENABLED
MIDPRICE = PRODUCTION_ENABLED
```

‏Capability Gate מסירה את `PASSIVE_POST_ONLY` בלבד.

‏היא אינה בוחרת `PASSIVE_JOIN` או `MIDPRICE` אוטומטית.

---

## ‏10A.50 `DEFER` אינו Queue של Submit ישן

‏אם מחכים ל־fresh quote, reconciliation או capability refresh:

```text
disposition = DEFER
```

‏המשמעות היא **להחליט מחדש** כאשר מגיעה evidence חדשה.

‏אין להשאיר stale submit מתוזמן מראש רק משום שב־Decision הקודמת רצינו לבצע.

---

## ‏10A.51 `NO_ACTION` מונע Side Effects מיותרים

‏דוגמה:

```text
existing passive entry is still valid
application_order_ttl not expired
no material market change
no new risk action required
```

‏התוצאה יכולה להיות:

```text
disposition = NO_ACTION
```

‏כלומר להשאיר את ה־Order הקיימת כפי שהיא ולחכות ל־event הבא.

---

## ‏10A.52 Thresholds הם Versioned Config

```text
max_quote_age_ms
minimum_required_net_edge_bps
max_spread_fraction_of_edge
minimum_exit_depth_ratio
minimum_remaining_signal_life_ms
max_application_order_ttl_ms
```

‏כל Decision שומרת `policy_version` ו־`config_snapshot_id`.

---

## ‏10A.53 `DecisionContext`

```text
DecisionContext {
  decision_id
  evaluated_at
  policy_version

  signal_state
  market_state
  order_state
  position_state
  risk_state
  capability_state
  system_health_state

  requested_action
  current_trade_intent
}
```

‏זהו input טהור ככל האפשר. Side effects מתחילים רק לאחר Decision ולפני Dispatch מתבצעת stale-decision validation נוספת בחלק 10D.

---

## ‏10A.54 Output ל־10B: ‏`EntryEnvelope`

```text
EntryEnvelope {
  disposition = ALLOW_ENTRY
  side = BUY
  max_qty = 120
  entry_economic_price_bound = 50.04
  max_application_order_ttl_ms = 700
  remaining_signal_life_ms = 1100
  partial_fill_policy = ACCEPT_ABOVE_MINIMUM
  liquidity_budget = ...
  required_protection = ...
  allowed_behavior_candidates = [...]
}
```

‏10A אינה מחזירה Broker Order. ‏10B מקבלת את ה־Envelope ובוחרת Behavior Candidate חוקית.

---

## ‏10A.55 Telemetry

```text
decision_id
signal_id
decision_revision
policy_version
disposition
first_failed_gate
all_failed_gates
all_reducing_gates
signal_age_ms
remaining_signal_life_ms
quote_age_ms
spread_bps
expected_gross_edge_bps
expected_net_edge_bps
requested_qty
max_allowed_qty
visible_qty_within_economic_bound
exit_feasible_qty
reconciled_position
potential_entry_exposure
operating_mode
broker_reconciled
capability_snapshot_id
```

---

## ‏10A.56 Metrics של ה־Gating Layer

```text
opportunities_seen
allow_rate
no_trade_rate
defer_rate
no_action_rate
exit_only_rate
cancel_existing_rate
rejection_rate_by_gate
size_reduction_rate
avg_requested_vs_allowed_qty
stale_data_rejection_rate
economic_edge_rejection_rate
exit_feasibility_rejection_rate
broker_state_rejection_rate
capability_rejection_rate
```

---

## ‏10A.57 בדיקות בסיסיות

```text
1. valid signal + healthy system => passes early gates
2. expired signal => NO_TRADE
3. stale quote => deny/defer by policy
4. unreconciled broker => no new entry
5. cancel-requested old entry consumes exposure budget
6. expected net edge below threshold => NO_TRADE
7. insufficient depth => REDUCE or NO_TRADE
8. exit infeasible => REDUCE or NO_TRADE
9. missing required field => UNKNOWN/deny
10. capability unavailable => candidate removed, not automatic aggression
11. kill switch => forbid new risk
12. unprotected position => EXIT_ONLY
13. same input snapshot + policy version => same Decision
14. existing valid order + no material change => NO_ACTION
15. partial fill => fresh DecisionContext
```

---

## ‏10A.58 Property / Invariant Tests

```text
increasing potential exposure must never increase allowed new qty
making quote older must never make stale-data gate pass
removing a capability must never create automatic aggressive fallback
making expected costs larger must not improve economic eligibility
setting kill switch must always forbid new entry
partial fill must never preserve the old quantity decision blindly
non-terminal cancel state must remain in potential exposure
```

---

## ‏10A.59 Practitioner Principles

### ‏1. Eliminate לפני Rank

‏Safety ו־truth gates אינן score components.

### ‏2. `NO_TRADE` היא Decision מקצועית

‏בסורק רחב, ויתור מהיר הוא Feature.

### ‏3. `NO_ACTION` אינה `NO_TRADE`

‏לפעמים המצב הנכון הוא להשאיר Order תקפה בלי side effect חדש.

### ‏4. `DEFER` דורשת re-decision

‏היא אינה הרשאה לשמור Intent ישן בתור ולשלוח אותו מאוחר יותר בעיוורון.

### ‏5. `UNKNOWN` היא State אמיתית

‏לא מתרגמים חוסר ידיעה ל־False.

### ‏6. Exit מתחילה לפני Entry

‏Exit feasibility היא חלק מ־entry eligibility.

### ‏7. Size נגזרת גם מ־Liquidity ו־Exit

‏Buying Power לבדה אינה sizing policy.

### ‏8. Stale Data אינה סיבה לאגרסיביות

‏היא סיבה לעצור, להקטין confidence או להיכנס ל־DEFER/NO_TRADE לפי Policy.

### ‏9. Capability Failure אינה Signal Failure

‏היא מסירה implementation path; היא אינה בוחרת replacement.

### ‏10. Fallback ו־Escalation הן Decisions חדשות

‏הזמן, ה־Signal, ה־Book וה־Exposure כבר השתנו.

### ‏11. Partial Fill היא State חדשה

‏Quantity, Protection, economics ו־remaining intent חייבים להיבחן מחדש.

### ‏12. Decision Trace היא חלק מהמערכת

‏בלעדיה אי אפשר להסביר או לשחזר למה פעולה אושרה.

---

# ‏Checkpoint — סוף חלק 10A

‏בחלק הזה בנינו את מעטפת ההחלטה לפני בחירת Entry Behavior: שש משפחות State, ‏`DecisionContext`, ארבעת ה־clocks, ‏`Economic Price Bound`, executable economics, Data Quality/Freshness, Spread/Depth/Volatility/Session, Exit Feasibility, reconciled Position, Potential Exposure, Risk, Capability ו־System Health.

‏הגדרנו Pipeline של Elimination Gates ואת ה־dispositions `ALLOW_ENTRY`, ‏`NO_TRADE`, ‏`DEFER`, ‏`EXIT_ONLY`, ‏`CANCEL_EXISTING` ו־`NO_ACTION`; קיבענו ש־Capability Resolver מסנן בלבד; וש־Partial Fill, Fallback ו־Escalation תמיד מחזירים ל־fresh Decision.

‏העיקרון המרכזי נשאר: **המנוע מסלק קודם מצבים ו־behaviors שאינם חוקיים, בטוחים או כלכליים; רק מתוך survivors מותר לבחור Execution Behavior.**

‏החלק הבא הוא **10B — Entry Decision**: בחירה בפועל בין Behavior Candidates חוקיות, תוך שמירה על ה־Envelope וה־Economic Price Bound שנקבעו כאן.
