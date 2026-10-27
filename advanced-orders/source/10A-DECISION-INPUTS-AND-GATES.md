# ‏חלק 10 — Engine Decision Guide

## ‏10A — Decision Inputs ו־Elimination Gates

## ‏10A.1 המנוע לא מתחיל מ־Order Type

‏אחרי כל החלקים הקודמים אפשר לנסח את העיקרון המרכזי של ה־Execution Engine:

```text
Do not ask:
Which order type should I send?

Ask first:
Is execution allowed at all?
What constraints must any execution obey?
Which behaviors remain legal after those constraints?
```

‏כלומר סדר החשיבה הוא:

```text
observe
→ validate
→ eliminate
→ derive boundaries
→ generate candidates
→ choose behavior
→ materialize broker order
```

‏ה־Order Type היא כמעט סוף התהליך, לא תחילתו.

---

## ‏10A.2 אין אצלנו `Master Score` שמחליט הכול

‏בגלל אופי המערכת שלנו, אני מעדיף שהחלטת Execution תיבנה בעיקר מ־**Elimination Gates** ולא מציון יחיד שמחבר דברים שאינם בני־השוואה.

‏לדוגמה, לא נרצה:

```text
strong momentum +10
stale quote -4
broker unreconciled -5
final score = +1
=> BUY
```

‏זה מסוכן, משום ש־`broker unreconciled` אינו חסרון קטן שאפשר "לפצות" עליו במומנטום חזק.

‏נרצה:

```text
if broker state is unreconciled:
    ENTRY = FORBIDDEN
```

‏אותו דבר לגבי Data stale, capability לא מאומתת, hard risk limit וכדומה.

‏Scores יכולים להיות שימושיים בתוך Strategy או למחקר, אבל **Safety ו־Execution Eligibility הן קודם כול predicates**.

---

## ‏10A.3 תוצאת Decision אינה רק `BUY / NO BUY`

‏המנוע צריך להחזיר Decision עשירה יותר:

```text
DecisionResult {
  permission
  purpose
  elimination_reasons
  allowed_behavior_families
  forbidden_behavior_families
  max_qty
  hard_price_boundary
  max_wait_ms
  max_signal_age_ms
  partial_fill_policy
  protection_requirement
  capability_requirements
  reevaluate_at
}
```

‏כלומר אפילו אם Entry מותרת, Decision Engine עדיין קובעת את גבולות הפעולה שבתוכם חלק 10B יבחר את ההתנהגות המדויקת.

---

## ‏10A.4 שש משפחות State שהחלטה חייבת לראות

‏לא מספיק Signal + Quote.

‏ה־Decision Context המלא מתחלק לפחות ל־:

```text
1. SIGNAL STATE
2. MARKET STATE
3. EXECUTION / ORDER STATE
4. POSITION / RISK STATE
5. CAPABILITY STATE
6. SYSTEM HEALTH STATE
```

‏כל אחת יכולה לבדה לפסול Entry.

---

## ‏10A.5 `SignalState` — מה האסטרטגיה חושבת עכשיו

‏ה־Execution Engine אינה צריכה לדעת את כל המתמטיקה של האסטרטגיה, אבל היא כן צריכה לקבל Contract ברור:

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

‏אפשר להוסיף features נוספים לפי Strategy, אבל Execution לא אמורה לקרוא ישירות עשרות אינדיקטורים ולהמציא Signal מחדש.

---

## ‏10A.6 `Signal validity` עדיפה על ניחוש מתוך strength

‏נרצה ש־Strategy תאמר באופן מפורש למשל:

```text
VALID
WEAKENING
INVALIDATED
EXPIRED
UNKNOWN
```

‏כך Execution אינה צריכה להסיק:

```text
score dropped from 8.3 to 7.9
=> maybe still valid?
```

‏במנוע של שניות, semantic state מפורש חשוב יותר מ־floating score שאין לו גבול ברור.

---

## ‏10A.7 `Signal Age` הוא Input מדרגה ראשונה

‏נחשב:

```text
signal_age_ms = decision_ts - signal_created_ts
remaining_signal_life_ms = signal_expires_at - decision_ts
```

‏אותה מניה עם אותו מחיר יכולה לקבל Decision שונה כאשר:

```text
remaining life = 1800 ms
```

‏לעומת:

```text
remaining life = 120 ms
```

‏הסיבה: משפחות execution שמצריכות waiting כבר אינן רלוונטיות אם כמעט לא נשארו חיי Signal.

---

## ‏10A.8 `Urgency` אינה Strength

‏Signal יכולה להיות חזקה אבל לא דחופה, או בינונית אבל דחופה בגלל expiry קרוב.

‏לכן נשמור בנפרד:

```text
signal_quality
urgency
remaining_life
```

‏Urgency יכולה לנבוע מ־:

```text
fast price acceleration
short remaining life
rapid quote migration
competitive opportunity decay
position-risk state on exit
```

‏ולא רק מ־"כמה המניה חזקה".

---

## ‏10A.9 Features של מומנטום נשארות ב־Strategy — אבל חלקן מועברות כ־Context

‏למנוע שלנו רלוונטי לקבל summary של דברים שכבר נבנו בקורס הרחב, למשל:

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

‏אבל Execution משתמשת בהם בעיקר כדי להבין:

```text
how quickly opportunity is decaying
whether waiting is structurally plausible
whether quote state is moving faster than our execution loop
```

‏ולא כדי להחליף את Scanner/Strategy.

---

## ‏10A.10 `Expected Edge` חייב להיות Executable Edge

‏אין ערך ל־:

```text
expected_move = +0.30%
```

‏בלי לחשב מה באמת נשאר לאחר ביצוע.

‏נרצה לפחות מודל עקרוני:

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

‏אם התוצאה אינה חיובית מעל threshold שהוגדר למחקר, Entry נפסלת לפני בחירת Order Type.

---

## ‏10A.11 `Expected Entry Cost` אינו רק Spread

‏נפרק אותו ל־:

```text
spread_component
expected_slippage
expected_depth_cost
expected_fee_component
expected_adverse_selection
```

‏Passive יכולה להפחית spread component אבל להגדיל missed-opportunity או adverse-selection cost.

‏Aggressive יכולה לעשות את ההפך.

‏ב־10A עדיין איננו בוחרים מי עדיפה; אנחנו רק מחייבים שה־Decision Context יוכל להעריך את גבולות economics.

---

## ‏10A.12 `Exit Feasibility` נבדקת **לפני** Entry

‏זה אחד ה־Gates החשובים ביותר.

‏לפני קנייה אנחנו שואלים:

```text
If we get filled now,
can we plausibly get out within our risk/holding horizon?
```

‏נבדוק לפחות:

```text
current bid depth
spread
recent trade activity
short-horizon liquidity stability
expected exit cost
position size relative to depth
protection capability
```

‏אם Entry קלה אבל Exit צפויה להיות קשה, העסקה יכולה להיפסל למרות Signal מצוין.

---

## ‏10A.13 `MarketState` — Snapshot רחב יותר מ־Bid/Ask

‏Decision Context של השוק יכלול לפחות:

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
  visible_depth_within_entry_cap
  visible_depth_within_exit_bound
  short_horizon_volatility
  quote_velocity
  trade_activity
  session
  halt_state
}
```

‏Depth מלאה או features נוספות יתווספו כאשר data feed מאפשרת, אבל Top of Book בלבד אינה מספיקה לכל החלטה.

---

## ‏10A.14 לכל Input יש `timestamp`, לא רק Value

‏ערך בלי זמן יכול להיות מסוכן יותר מחוסר ערך.

‏לדוגמה:

```text
ask = 20.00
```

‏אינו מידע מלא.

‏צריך:

```text
ask = 20.00
quote_ts = ...
quote_age_ms = ...
```

‏אותו הדבר לגבי:

```text
signal
position
open orders
capabilities
account state
```

‏Decision Engine חייבת לדעת עד כמה כל Fact טרייה.

---

## ‏10A.15 `Data Freshness Gate`

‏אם Quote או Trade feed עברו את גבול ה־freshness שהוגדר למצב, Entry נפסלת.

‏לדוגמה רעיונית:

```text
if quote_age_ms > max_quote_age_ms:
    deny new entry
```

‏המספר המדויק אינו נקבע כאן; הוא parameter למחקר ולתשתית.

‏העיקרון הוא:

> ‏לא מפצים על Market Data ישנה באמצעות Order אגרסיבית יותר.

---

## ‏10A.16 Freshness אינה Threshold יחיד לכל השוק

‏מניה מאוד פעילה יכולה להפוך Quote של 400ms למיושנת לחלוטין.

‏במניה איטית יותר אותו גיל יכול להיות פחות חריג.

‏לכן נבחן בעתיד threshold לפי:

```text
symbol activity regime
quote update rate
trade rate
volatility
session
```

‏אבל בגרסה ראשונה אפשר להתחיל עם hard conservative thresholds ולהרחיב רק לפי Evidence.

---

## ‏10A.17 `Spread Gate`

‏Spread היא עלות פוטנציאלית, ולכן נשאל:

```text
spread_bps <= allowed_spread_bps?
spread_cost <= allowed_fraction_of_edge?
```

‏גישה טובה יותר מ־:

```text
spread <= 2 cents
```

‏משום ששני סנטים במניה של $5 ושני סנטים במניה של $500 אינם אותו דבר.

---

## ‏10A.18 Spread רחבה אינה תמיד `NO TRADE`

‏Spread רחבה יכולה דווקא ליצור מקום ל־Midpoint/Passive price improvement.

‏לכן Gate לא חייב להיות:

```text
if spread wide => reject
```

‏אלא:

```text
if no allowed execution family can preserve required net edge within this spread:
    reject
```

‏זו הבחנה חשובה: Gate בודקת economics, לא אסתטיקה של Book.

---

## ‏10A.19 `Depth Feasibility Gate`

‏נחשב למשל:

```text
requested_qty
visible_qty_within_hard_cap
visible_qty_at_best
requested_qty / visible_qty_within_cap
```

‏אם הכמות גדולה מדי ביחס לנזילות שניתן לראות עד הגבול הכלכלי שלנו, יש שלוש תוצאות אפשריות:

```text
reduce size
allow partial-only policy
NO TRADE
```

‏מה שלא נעשה הוא להרחיב price cap אוטומטית רק כדי "להצליח להיכנס".

---

## ‏10A.20 `Size` היא Decision, לא רק תוצר של Budget

‏הכמות המקסימלית הכלכלית יכולה להיות קטנה מהכמות שההון מאפשר.

‏נגדיר:

```text
capital_based_qty
risk_based_qty
liquidity_based_qty
strategy_max_qty
position_limit_qty
```

‏ואז:

```text
max_allowed_qty = min(all relevant bounds)
```

‏זה מונע מצב שבו "יש לי כסף לקנות 500" הופך בטעות ל־"השוק מסוגל לבצע 500 בלי לפגוע ב־Edge".

---

## ‏10A.21 `Volatility Gate`

‏Volatility גבוהה אינה תמיד שלילית למומנטום — לפעמים היא עצם ההזדמנות.

‏אבל היא משנה Execution Risk.

‏נבדוק למשל:

```text
short_horizon_range
quote_jump_size
recent_gap_ticks
spread_instability
depth_instability
```

‏המטרה אינה לחסום כל volatility, אלא לזהות מצב שבו worst plausible execution cost כבר אינו מתאים ל־Edge.

---

## ‏10A.22 `Halt / Auction / Abnormal State Gate`

‏אם instrument נמצאת במצב שאינו תואם את execution model שאימנו, Entry רגילה אינה מותרת.

‏נרצה states מפורשים כגון:

```text
NORMAL_CONTINUOUS
PRE_OPEN
AUCTION
HALTED
RESUMING
UNKNOWN
```

‏ורק states שה־Policy שלנו יודעת לטפל בהם נכנסות למסלול הרגיל.

---

## ‏10A.23 `Session Gate`

‏`Regular`, ‏pre-market ו־after-hours אינן אותו Regime.

‏Decision Context חייבת לכלול:

```text
session
allowed_session_policy
outside_rth_capability
session_specific_spread_limit
session_specific_liquidity_limit
```

‏אם Strategy נבנתה ל־RTH, אין להפעיל אותה אוטומטית ב־after-hours רק מפני שה־API מאפשר לשלוח Order.

---

## ‏10A.24 `PositionState` — Entry חדשה אינה עומדת לבד

‏נשמור לפחות:

```text
PositionState {
  symbol
  side
  confirmed_qty
  avg_price
  unrealized_pnl
  protection_state
  exit_state
  externally_changed
  last_reconciled_at
}
```

‏Signal חדש באותו Symbol צריך לראות Position קיימת לפני החלטה.

---

## ‏10A.25 `OrderState` חייב להיכנס ל־Decision Context

‏גם אם Position כרגע אפס, ייתכן שיש Order שעדיין יכולה להתבצע.

‏נחשב:

```text
live_entry_qty
cancel_pending_entry_qty
modify_pending_qty
submit_unknown_qty
live_exit_qty
cancel_pending_exit_qty
```

‏ולכן:

```text
position = 0
```

‏אינה הוכחה שאין Exposure פוטנציאלית.

---

## ‏10A.26 `Potential Exposure Gate`

‏לפני Entry חדשה:

```text
confirmed_position
+ potentially_executable_entry_qty
+ proposed_new_qty
<= allowed_position
```

‏אם Order ישנה נמצאת ב־`CANCEL_PENDING`, הכמות שלה עדיין נספרת עד terminal evidence.

‏זה מחבר ישירות את חלק 8 למנוע ההחלטה.

---

## ‏10A.27 `Position Protection Gate`

‏אם כבר יש Position שאינה מוגנת לפי המדיניות שלנו, עדיפות המערכת משתנה.

‏למשל:

```text
POSITION_UNPROTECTED
=> new unrelated entries forbidden
=> protection/exit actions allowed
```

‏כלומר Decision Engine אינה רק `entry selector`; היא קובעת איזה סוג Risk מותר למערכת לקחת עכשיו.

---

## ‏10A.28 `RiskState`

‏נרצה Snapshot מפורש:

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

‏אם אחד מה־hard limits נשבר, Signal quality אינה רלוונטית.

---

## ‏10A.29 `CapabilityState` — מה מותר לנו באמת לבצע עכשיו

‏Decision Engine אינה מניחה שכל המשפחות זמינות.

‏היא מקבלת למשל:

```text
CapabilityState {
  marketable_limit_ioc
  passive_limit
  post_only
  relative_primary
  midprice
  snap_midpoint
  pegged_midpoint_direct
  adaptive_urgent
  adaptive_normal
  stop
  bracket
  oca
}
```

‏ולכל capability יש `enablement_state` מחלק 9.

---

## ‏10A.30 Capability שאינה `PRODUCTION_ENABLED` אינה Candidate ב־Production

‏ב־Research mode אפשר לאפשר states אחרים לפי סביבת הניסוי.

‏ב־Production:

```text
if capability.enablement_state != PRODUCTION_ENABLED:
    eliminate capability
```

‏אין exception בגלל Signal חזק במיוחד.

---

## ‏10A.31 `SystemHealthState` — המצב שהכי קל לשכוח

‏אפילו Signal ושוק מושלמים אינם מספיקים אם המערכת עצמה אינה בריאה.

‏נרצה לפחות:

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
  recovery_mode
}
```

‏Execution היא distributed system; health היא Input עסקית.

---

## ‏10A.32 `Clock Health` היא Safety Feature

‏אצלנו גיל Signal, TTL, quote age ו־latency הם inputs מרכזיים.

‏אם Clock שלנו קופצת או timestamps מגיעים מ־domains שלא הומרו נכון, כל ההחלטות האלה יכולות להיות שגויות.

‏לכן נשמור distinction בין:

```text
wall_clock_time
monotonic_elapsed_time
source_exchange_or_feed_time
local_receive_time
```

‏TTL מקומי צריך להתבסס על monotonic time כאשר אפשר.

---

## ‏10A.33 Global Freeze Gate

‏יש מצבים שבהם לא בודקים שום Entry נוספת:

```text
kill_switch = ON
broker_state = UNKNOWN
reconciliation_in_progress
critical_position_mismatch
market_data_unhealthy
persistent_store_unavailable for required guarantees
order_id_allocator_invalid
```

‏התוצאה:

```text
ENTRY_PERMISSION = DENY_GLOBAL
```

‏Exit/Protection actions יכולות להישאר מותרות לפי Risk Policy.

---

## ‏10A.34 סדר ה־Gates חשוב

‏לא כדאי לבזבז חישוב על Order candidates כאשר המערכת ממילא אינה רשאית לבצע.

‏Pipeline ראשוני:

```text
1. SYSTEM HEALTH GATE
2. BROKER RECONCILIATION GATE
3. OWNERSHIP / EXPOSURE GATE
4. MARKET DATA FRESHNESS GATE
5. SIGNAL VALIDITY / AGE GATE
6. SESSION / MARKET-STATE GATE
7. ECONOMIC EDGE GATE
8. LIQUIDITY / DEPTH GATE
9. EXIT FEASIBILITY GATE
10. RISK LIMIT GATE
11. CAPABILITY GATE
12. CANDIDATE GENERATION
```

‏הסדר המדויק יכול להשתנות מעט במימוש, אבל Safety/Truth קודמות ל־Optimization.

---

## ‏10A.35 למה `Broker Reconciliation` מגיעה לפני Signal

‏אם איננו יודעים אם Order קודמת עדיין חיה, אסור לקחת Risk חדש רק מפני שה־Scanner מצא מניה מעולה.

‏לכן:

```text
unknown execution state
=> no new entry
```

‏זה בדיוק המקום שבו correctness מחלק 8 גוברת על latency.

---

## ‏10A.36 `Signal Gate`

‏Entry נפסלת כאשר למשל:

```text
signal.validity != VALID
signal_age_ms > max_signal_age_ms
remaining_signal_life_ms <= minimum_execution_window_ms
reversal_detected = true
```

‏ה־thresholds עצמם יהיו config/experiment parameters.

‏העיקרון הוא שהמנוע לא שולח Order רק מפני שה־Signal היה תקף לפני 900ms.

---

## ‏10A.37 `Economic Gate`

‏נחשב conservatively:

```text
expected_net_edge_at_allowed_execution
```

‏ונדרוש:

```text
expected_net_edge >= minimum_required_net_edge
```

‏אם רק תרחיש fill אופטימי משאיר Edge, העסקה אינה עוברת Gate.

‏ה־Decision Engine צריכה להשתמש ב־worst reasonable execution assumptions שמתאימות ל־Mode candidate, לא במחיר תיאורטי שלא ניתן לבצע.

---

## ‏10A.38 `Exit Feasibility Gate` יכולה להקטין Size במקום לפסול הכול

‏לדוגמה:

```text
entry depth supports 500
exit depth safely supports only 180
```

‏התוצאה יכולה להיות:

```text
max_allowed_qty = 180
```

‏ולא בהכרח `NO TRADE`.

‏זו אחת הסיבות ש־Sizing צריך להגיע אחרי Liquidity/Exit analysis ולא רק אחרי capital calculation.

---

## ‏10A.39 `Capability Gate` לא בוחר Winner

‏הוא רק מסיר את מה שאסור:

```text
allowed before capabilities:
PASSIVE
POST_ONLY
MIDPRICE
IOC
ADAPTIVE

runtime:
POST_ONLY = unsupported
ADAPTIVE = runtime conflict

survivors:
PASSIVE
MIDPRICE
IOC
```

‏רק בשלב הבא נבחר מבין survivors לפי Market/Signal trade-offs.

---

## ‏10A.40 Fallback לעולם חוזר דרך ה־Gates

‏אם Order נדחתה:

```text
MIDPRICE -> REJECTED
```

‏לא עוברים ישירות:

```text
MARKETABLE_LIMIT_IOC
```

‏אלא:

```text
new market snapshot
new signal age
new position/order state
new capability state
run gates again
```

‏Fallback הוא Decision חדשה בזמן חדש.

---

## ‏10A.41 `UNKNOWN` אינו False ואינו True

‏נרצה three-state thinking בהרבה inputs:

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

‏ב־Entry, `UNKNOWN` קריטי בדרך כלל צריך להתנהג כמו deny.

‏ב־Exit, `UNKNOWN` יכול דווקא לגרום ל־risk-reduction behavior.

---

## ‏10A.42 Missing Data Policy צריכה להיות מפורשת

‏אסור לתת לשפת התכנות להחליט במקרה:

```text
null spread
0 depth
missing signal expiry
```

‏לכל field נגדיר:

```text
REQUIRED_FOR_ENTRY
OPTIONAL_WITH_FALLBACK
DIAGNOSTIC_ONLY
```

‏אם Required חסר — Gate נכשל עם reason ברור.

---

## ‏10A.43 `Data Quality` היא יותר מ־Freshness

‏Feed יכולה להיות טרייה אך לא עקבית.

‏בדיקות לדוגמה:

```text
bid <= ask
sizes >= 0
timestamps monotonic enough
symbol identity matches
price increment valid
no impossible jump without regime flag
```

‏Market snapshot שנכשלה validation לא נכנסת ל־Decision Engine כאילו היא אמת.

---

## ‏10A.44 Hysteresis מונעת `ALLOW/DENY` flapping

‏אם spread נעה סביב threshold כל 20ms, מנוע בלי hysteresis יכול:

```text
allow
cancel
authorize again
cancel again
```

‏נרצה למשל:

```text
entry_allow_threshold
entry_keep_alive_threshold
```

‏או minimum dwell time כאשר מתאים.

‏המטרה אינה להאט; היא למנוע oscillation סביב noise.

---

## ‏10A.45 `Keep Alive Gate` שונה מ־`New Entry Gate`

‏Order שכבר חיה לא חייבת להשתמש בדיוק באותם thresholds שהיו בזמן creation.

‏אפשר להפריד:

```text
NEW_ENTRY_ELIGIBLE
ORDER_STILL_VALID
```

‏לדוגמה, spread עלתה מעט מעבר לרף Entry — אולי אין הצדקה לשלוח Order חדשה, אבל עדיין יש הצדקה להשאיר Passive Order קיימת לעוד 80ms.

‏מצד שני, Signal invalidation היא בדרך כלל Hard cancel condition.

---

## ‏10A.46 `Decision Revision`

‏כל הרצה של Decision Engine על אותו Intent תקבל:

```text
decision_revision
```

‏ונשמור:

```text
input_snapshot_ids
gate_results
output_constraints
```

‏כך אפשר לדעת אחרי Fill:

> ‏איזו Decision בדיוק אישרה את ה־Order הזאת?

---

## ‏10A.47 `Decision Trace` — לא רק Log טקסטואלי

‏נרצה structure כגון:

```text
DecisionTrace {
  decision_id
  signal_id
  revision
  evaluated_at
  gates[]
  eliminated_candidates[]
  surviving_candidates[]
  constraints
  final_permission
}
```

‏זה מאפשר Debug, Backtest replay ו־explainability בלי לקרוא אלפי שורות logs.

---

## ‏10A.48 `GateResult` מוצע

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

‏`REDUCE` שימושית ל־Gates שלא חייבות לפסול הכול, למשל Liquidity Gate שמקטינה Size.

---

## ‏10A.49 Reason Codes צריכים להיות יציבים

‏במקום:

```text
"trade not good enough"
```

‏נשמור:

```text
SIGNAL_EXPIRED
QUOTE_STALE
SPREAD_TOO_COSTLY
INSUFFICIENT_DEPTH
EXIT_NOT_FEASIBLE
POSITION_LIMIT
BROKER_UNRECONCILED
CAPABILITY_UNAVAILABLE
SYSTEM_DEGRADED
```

‏כך אפשר למדוד כמה Opportunities נפסלו בגלל כל סיבה.

---

## ‏10A.50 דוגמה — Signal חזק שעובר את ה־Gates

```text
signal_valid = true
remaining_signal_life = 1400ms
quote_age = 18ms
spread = acceptable
requested_qty = 100
visible_qty_within_cap = 500
exit_feasible_qty = 350
broker_reconciled = true
position = 0
potential_live_entry_qty = 0
capabilities = healthy
```

‏תוצאה:

```text
permission = ALLOW_ENTRY
max_qty = 100
candidate_generation = allowed
```

‏עדיין **לא** החלטנו אם לבחור Passive, MidPrice או IOC. זה חלק 10B.

---

## ‏10A.51 דוגמה — Signal מצוין אבל Spread הורסת את ה־Edge

```text
expected_gross_edge = 18 bps
conservative_round_trip_execution_cost = 24 bps
```

‏גם אם Momentum יפה:

```text
ECONOMIC_EDGE_GATE = FAIL
permission = NO_TRADE
```

‏Order Type מתקדמת אינה פטור מאריתמטיקה.

---

## ‏10A.52 דוגמה — Quote ישנה

```text
signal_valid = true
quote_age = 900ms
activity = very high
```

‏תוצאה:

```text
DATA_FRESHNESS_GATE = FAIL
```

‏לא שולחים Market כדי "לפצות על זה שהמידע ישן".

‏קודם חוזרים למצב שבו יש לנו Market Truth מספקת.

---

## ‏10A.53 דוגמה — Order קודמת ב־Cancel Pending

```text
confirmed_position = 0
old_entry_remaining = 100
old_entry_state = CANCEL_PENDING
new_signal_target = 100
position_limit = 100
```

‏מבחינת risk:

```text
potential_exposure = 100 old + 100 new
```

‏לכן Entry חדשה מלאה נכשלת ב־Potential Exposure Gate.

‏זה נכון גם אם UI כרגע מציגה Position אפס.

---

## ‏10A.54 דוגמה — Partial Fill משנה את כל ההחלטה

```text
target = 100
filled = 37
remainder canceled
```

‏הרצה הבאה אינה עוד "Entry של 100".

‏ה־Context הוא:

```text
position = 37
remaining_intent = 63
protection_state = ?
remaining_signal_life = new value
current_market = new snapshot
```

‏ולכן Gates רצות מחדש לפני retry.

---

## ‏10A.55 דוגמה — Capability חסרה אבל העסקה עדיין יכולה לשרוד

‏נניח Strategy רצתה Candidate של Post Only, אך:

```text
post_only = DISABLED_RUNTIME_CONFLICT
plain_passive_limit = PRODUCTION_ENABLED
midprice = PRODUCTION_ENABLED
```

‏Capability Gate מסירה רק Post Only.

‏היא **לא** בוחרת Plain Limit אוטומטית.

‏חלק 10B ישווה את survivors מחדש לפי intent וה־Market State.

---

## ‏10A.56 `NO_TRADE` היא Output מקצועית, לא כישלון

‏אם לאחר ה־Gates אין behavior שמסוגל לשמור על:

```text
required edge
risk limits
price boundary
signal lifetime
exit feasibility
```

‏ה־Decision הטובה ביותר היא:

```text
NO_TRADE
```

‏במערכת שסורקת אלפי מניות, היכולת לוותר מהר היא Feature מרכזית.

---

## ‏10A.57 `DEFER` שונה מ־`NO_TRADE`

‏יש מצב שבו Opportunity עדיין לא פסולה, אבל חסרה עובדה זמנית:

```text
waiting for fresh quote
waiting for reconciliation
waiting for capability refresh
waiting for transient order state to settle
```

‏אפשר להחזיר:

```text
DEFER
```

‏עם `reevaluate_at` או trigger לאירוע חדש.

‏אבל `DEFER` אינה הרשאה להשאיר stale submit queued באופן עיוור.

---

## ‏10A.58 `EXIT_ONLY` הוא Mode מערכת חשוב

‏כאשר:

```text
new risk forbidden
but existing position exists
```

‏נרצה:

```text
permission = EXIT_ONLY
```

‏לדוגמה בזמן:

```text
market data degraded
capability issue in entry path
global loss limit reached
manual freeze
```

‏המערכת יכולה לחסום Entries חדשות ועדיין לאפשר פעולות שמקטינות Exposure.

---

## ‏10A.59 `CANCEL_EXISTING` יכולה להיות תוצאה בפני עצמה

‏Decision Engine יכולה לקבוע:

```text
signal invalidated
existing entry order still working
=> cancel existing entry
```

‏בלי להציע Order חלופית.

‏זה חשוב כדי לא להפוך כל Cancel ל־prelude ל־replacement.

---

## ‏10A.60 Thresholds הם Config, לא קוד קבוע

‏דברים כמו:

```text
max_quote_age_ms
minimum_required_net_edge_bps
max_spread_fraction_of_edge
minimum_exit_depth_ratio
minimum_remaining_signal_life_ms
```

‏צריכים להיות versioned configuration עם experiment context.

‏כך Backtest, Paper ו־Live יודעים איזה policy בדיוק הופעלה.

---

## ‏10A.61 Config צריכה להיות Immutable בתוך Decision אחת

‏אם config משתנה באמצע evaluation, אפשר לקבל decision שאינה ניתנת לשחזור.

‏לכן כל Decision מקבלת:

```text
policy_version
config_snapshot_id
```

‏ורק Decision הבאה תשתמש בגרסה החדשה.

---

## ‏10A.62 Deterministic Replay

‏אם נשמור:

```text
signal snapshot
market snapshot
position/order snapshot
capability snapshot
risk snapshot
system-health snapshot
policy version
```

‏נוכל להריץ מחדש את Decision ולצפות לאותה תוצאה.

‏זה קריטי כדי להבין:

```text
why did we trade?
why did we not trade?
why did we reduce size?
why did we cancel?
```

---

## ‏10A.63 `DecisionContext` מוצע

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

‏המבנה הזה הוא input טהור ככל האפשר; side effects מתבצעים רק לאחר שה־Decision הסתיימה וה־Command Dispatcher קיבל Instruction חוקית.

---

## ‏10A.64 Output של 10A לחלקים הבאים

‏אם כל ה־Gates עברו, 10A לא מחזירה Broker Order.

‏היא מחזירה משהו בסגנון:

```text
EntryEnvelope {
  permission = ALLOW_ENTRY
  side = BUY
  max_qty = 120
  hard_max_price = 50.04
  max_wait_ms = 700
  remaining_signal_life_ms = 1100
  partial_fill_policy = ACCEPT_ABOVE_MINIMUM
  liquidity_budget = ...
  required_protection = ...
  allowed_capabilities = [...]
}
```

‏זה ה־contract שחלק 10B יקבל כדי לבחור Entry behavior.

---

## ‏10A.65 Telemetry של Decision Gates

‏נשמור לפחות:

```text
decision_id
signal_id
decision_revision
policy_version
permission
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
visible_qty_within_cap
exit_feasible_qty
position_qty
potential_entry_exposure
system_health_state
broker_reconciled
capability_snapshot_id
```

‏כך אפשר לנתח לא רק עסקאות שבוצעו, אלא גם Opportunities שנפסלו.

---

## ‏10A.66 Metrics של ה־Gating Layer

```text
opportunities_seen
allow_rate
deny_rate
defer_rate
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

‏מדדים אלה יראו אם Gate מסוימת חוסמת כמעט הכול או כמעט כלום — שני מצבים שדורשים בדיקה.

---

## ‏10A.67 בדיקות יחידה בסיסיות ל־Gates

```text
1. valid signal + healthy system => passes early gates
2. expired signal => denied
3. stale quote => denied
4. unreconciled broker => denied
5. cancel-pending old entry consumes exposure budget
6. expected net edge below threshold => denied
7. insufficient depth => size reduced or denied by policy
8. exit infeasible => size reduced or denied
9. missing required field => UNKNOWN/deny
10. capability unavailable => candidate removed, not automatic aggression
11. kill switch => deny new risk
12. existing unprotected position => EXIT_ONLY
13. same input snapshot replay => same decision
```

---

## ‏10A.68 בדיקות Property / Invariant שכדאי להוסיף

‏מעבר לתרחישים קבועים:

```text
increasing potential exposure must never increase allowed new qty
making quote older must never make stale-data gate pass
removing a capability must never create a more aggressive fallback automatically
making expected costs larger must not improve economic eligibility
setting kill switch must always forbid new entry
```

‏בדיקות כאלה מגנות על הלוגיקה גם כאשר נוסיף features חדשות.

---

## ‏10A.69 Practitioner Secrets — מה שקל לפספס במנוע החלטה

### ‏1. Decision טובה מתחילה ב־Elimination

‏לא כל constraint צריך להיכנס לציון. Safety ו־truth gates הן Boolean/tri-state rules.

### ‏2. `NO_TRADE` היא פעולה

‏בסורק גדול, רוב המצבים צריכים כנראה להסתיים בלי Order.

### ‏3. `UNKNOWN` היא State אמיתית

‏מערכת שאינה יודעת אם Order חיה אינה רשאית להתנהג כאילו היא מתה.

### ‏4. Exit מתחילה לפני Entry

‏Entry שאי אפשר לצאת ממנה בצורה סבירה אינה Opportunity מלאה.

### ‏5. Size היא תוצר של Liquidity ו־Risk, לא רק Capital

‏יותר Buying Power אינו אומר שמותר להשתמש בו.

### ‏6. Stale Data אינה סיבה להיות אגרסיבי יותר

‏היא סיבה להקטין confidence או לעצור.

### ‏7. Capability Failure אינה Signal Failure

‏היא מסירה implementation candidate; היא לא הופכת אוטומטית את ה־Trade ללא חוקי או ל־Market Order.

### ‏8. Fallback היא Decision חדשה

‏הזמן עבר, ה־Signal הזדקן וה־Book השתנה.

### ‏9. Gate שיכולה להקטין Size לא חייבת לפסול הכול

‏`REDUCE` היא Output חשובה בדיוק כמו PASS/FAIL.

### ‏10. Decision Trace היא נכס מחקרי

‏בלעדיה נדע מה קרה, אבל לא למה המנוע חשב שזה חוקי.

### ‏11. Thresholds חייבים Versioning

‏אחרת אי אפשר להשוות Backtest/Live או לשחזר החלטה.

### ‏12. Health היא חלק מה־Execution Alpha Preservation

‏מערכת לא בריאה יכולה למחוק Edge טוב יותר מכל Order Type גרועה.

---

# ‏Checkpoint — סוף חלק 10A

‏בחלק הזה בנינו את מעטפת ההחלטה לפני בחירת Entry Order: שש משפחות State, מודל `DecisionContext`, חישוב signal age ו־remaining life, executable economics, Data Freshness, Spread/Depth/Volatility/Session, Exit Feasibility, Position/Order exposure, Risk, Capability ו־System Health. הגדרנו Pipeline של Elimination Gates, מצבי `ALLOW_ENTRY`, ‏`NO_TRADE`, ‏`DEFER`, ‏`EXIT_ONLY` ו־`CANCEL_EXISTING`, יחד עם reason codes, decision revisions, deterministic replay ו־telemetry.

‏העיקרון המרכזי הוא: **המנוע לא מחפש את הפקודה עם הציון הגבוה ביותר. הוא מסלק קודם כל מצבים ו־behaviors שאינם חוקיים, בטוחים או כלכליים; ורק מתוך ה־survivors בוחר Execution Behavior.**

‏השלב הבא יהיה **חלק 10B — Entry Decision**: נבנה את הבחירה בפועל בין `PASSIVE_LIMIT`, ‏`POST_ONLY`, ‏`RELATIVE`, ‏`MIDPRICE`, ‏`SNAP`, ‏`PEGGED_MIDPOINT`, ‏`ADAPTIVE` ו־`MARKETABLE_LIMIT_IOC`, כולל TTL, escalation, partial fills ומתי לא לרדוף אחרי המחיר.

---
