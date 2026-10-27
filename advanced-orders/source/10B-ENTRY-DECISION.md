## ‏10B — Entry Decision: בחירת `Execution Mode` ו־`Behavior Candidate`

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, חלק 10B אינו בוחר "Order Type" מתוך רשימה שטוחה. הוא מקבל `EntryEnvelope` מ־10A, בוחר `Application Execution Mode`, בוחר מתוכו `Behavior Candidate`, ורק לאחר מכן נבנה `Concrete Broker Order Plan`.

---

## ‏10B.1 הקלט של 10B הוא `EntryEnvelope`, לא Signal גולמי

‏10B מתחילה רק אחרי ש־10A כבר קבעה שה־Opportunity כשירה עקרונית ל־Entry.

```text
EntryEnvelope {
  disposition              // ALLOW_ENTRY
  side
  max_qty
  economic_price_bound
  max_application_order_ttl_ms
  remaining_signal_life_ms
  partial_fill_policy
  required_protection
  allowed_behavior_candidates
  capability_requirements
  economic_constraints
  liquidity_constraints
}
```

> ‏`ENGINE RULE` — 10B אינה רשאית לחרוג מ־`economic_price_bound`, ‏`max_qty`, ‏Risk או Capability constraints שנקבעו ב־10A.

---

## ‏10B.2 הפלט הוא `EntryPlan`, לא Broker Order אחת

```text
EntryPlan {
  application_execution_mode
  behavior_candidate
  quantity
  economic_price_bound
  price_policy
  liquidity_intent
  routing_plan
  broker_algo_plan
  broker_tif
  application_order_ttl_ms
  partial_fill_policy
  escalation_policy
  cancel_conditions
  protection_policy
  selection_reason_code
}
```

‏ה־Adapter מתרגם את ה־Plan ל־Broker Primitive, attributes, TIF, route ו־algo parameters.

‏דוגמה:

```text
ApplicationExecutionMode = AGGRESSIVE_CAPPED
BehaviorCandidate        = MARKETABLE_LIMIT_IOC
Broker Primitive         = LMT
Broker TIF               = IOC
Routing Policy           = SMART
Limit                    = Economic Price Bound
```

---

## ‏10B.3 `Application Execution Mode` ו־`Behavior Candidate` אינם אותו דבר

‏ה־Mode מתאר את אופי הביצוע ברמה סמנטית:

```text
PASSIVE
PRICE_IMPROVING
MIDPOINT_SEEKING
BROKER_MANAGED
AGGRESSIVE_CAPPED
```

‏ה־Behavior Candidate מתאר דרך קונקרטית יותר לממש את ה־Mode:

```text
PASSIVE_JOIN
PASSIVE_POST_ONLY
IMPROVE_ONE_TICK
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
ADAPTIVE_LIMIT_URGENT
ADAPTIVE_LIMIT_NORMAL
MARKETABLE_LIMIT_IOC
```

‏לדוגמה, `MIDPOINT_SEEKING` יכול להתממש באמצעות `MIDPRICE`, ‏`SNAP_MIDPOINT` או `PEGGED_MIDPOINT_DIRECT` בהתאם ל־Context ול־Capabilities.

---

## ‏10B.4 Candidate Set אינו Ranking

‏הרשימה לעיל אינה סדר עדיפויות. כל Candidate פותרת trade-off אחר.

‏10B נשארת elimination-first:

```text
remaining life too short
=> remove long-wait candidates

passive-only economics required
=> remove taker candidates

midpoint capability unavailable
=> remove midpoint candidates

economic_price_bound cannot reach executable ask
=> remove immediately marketable candidates
```

‏רק לאחר elimination בוחרים מבין survivors.

---

## ‏10B.5 שלושת צירי הבחירה המרכזיים

```text
1. PRICE IMPROVEMENT DESIRE
2. FILL URGENCY
3. CONTROL DELEGATION
```

‏דוגמה:

```text
PASSIVE_JOIN
mode = PASSIVE
price improvement = high
urgency = low
control = client

MARKETABLE_LIMIT_IOC
mode = AGGRESSIVE_CAPPED
price improvement = low
urgency = very high
control = explicit/client-defined

ADAPTIVE_LIMIT_URGENT
mode = BROKER_MANAGED
price improvement = medium
urgency = high
control = partially delegated to broker
```

---

## ‏10B.6 ארבעת ה־clocks נשארים נפרדים

‏ב־Entry selection אסור לערבב:

```text
signal_ttl
application_order_ttl
broker_tif
working_order_age
```

‏`signal_ttl` קובע כמה זמן ה־Alpha תקפה.

‏`application_order_ttl` קובע כמה זמן Behavior/Order מסוימת רשאית להישאר חיה לפני re-decision.

‏`broker_tif` היא semantics כגון `DAY` או `IOC`.

‏`working_order_age` היא מדידה של כמה זמן Order כבר עובדת בפועל.

---

## ‏10B.7 `Remaining Signal Life` הוא Budget עליון — לא TTL של Order

```text
entry_time_budget_ms = min(
    envelope.max_application_order_ttl_ms,
    envelope.remaining_signal_life_ms - safety_reserve_ms
)
```

‏Behavior שאין לה סיכוי סביר לתת Useful Fill בתוך ה־budget נפסלת.

‏אבל כל Candidate יכולה לקבל `application_order_ttl` קצר יותר מה־budget הכולל.

---

## ‏10B.8 לא כל הזמן שנותר מיועד ל־Entry

‏צריך להשאיר זמן ל־:

```text
fill processing
protection activation
exit observation
cancel/reconciliation
```

‏לכן `safety_reserve_ms` הוא חלק מה־Execution Policy ולא slack מקרי.

---

## ‏10B.9 `Expected Time to Useful Fill` הוא Feature מחקרי

‏לכל Candidate נרצה להעריך:

```text
expected_time_to_first_fill
expected_time_to_useful_fill
probability_of_useful_fill_within_budget
```

‏לפי לפחות:

```text
symbol/activity regime
spread
queue/depth
quote velocity
behavior candidate
routing policy
session
```

‏Histogram אמין עדיף על model מורכב ללא Evidence.

---

## ‏10B.10 Candidate שאינה יכולה לתת `Useful Fill` בזמן — נפסלת

‏השאלה אינה:

```text
can it fill anything?
```

‏אלא:

```text
can it plausibly produce at least minimum_useful_fill
within its application_order_ttl
and within the remaining signal life?
```

---

## ‏10B.11 `PASSIVE_JOIN` — ה־baseline הפסיבי

```text
ApplicationExecutionMode = PASSIVE
BehaviorCandidate = PASSIVE_JOIN
```

‏בקנייה, הכוונה היא להצטרף ל־best bid קיים בלי ליצור אוטומטית רמת מחיר חדשה.

‏היא מתאימה כאשר:

```text
there is enough time to wait
spread saving matters
queue is not obviously hopeless
signal is not escaping rapidly
passive markout history is acceptable
```

‏והיא נחלשת כאשר missed-move cost גבוה.

---

## ‏10B.12 `JOIN_EXISTING_LEVEL` היא Placement Policy, לא Order Type

‏העדפה לא ליצור Price Level חדש מיוצגת למשל כ־:

```text
placement_policy = JOIN_EXISTING_LEVEL
avoid_being_sole_displayed_order = true/false
```

‏זו Policy שנבדוק אמפירית, לא חוק שוק.

‏אם אנחנו נשארים לבד ברמה, האפשרויות הן למשל:

```text
keep briefly
cancel
move to another existing level
switch behavior after fresh decision
```

‏עצם היותנו היחידים אינה Hard Reject אוטומטי.

---

## ‏10B.13 `PASSIVE_POST_ONLY` — כאשר Passive היא Constraint

```text
ApplicationExecutionMode = PASSIVE
BehaviorCandidate = PASSIVE_POST_ONLY
Liquidity Attribute / Constraint = POST_ONLY
```

‏ה־semantic intent:

```text
add liquidity or do not execute
```

‏היא Candidate רק לאחר route-specific capability validation.

---

## ‏10B.14 Plain Passive Limit ו־Post Only אינן אותו דבר

‏Plain Limit שהייתה Passive בזמן Decision יכולה להגיע marketable.

‏Post Only מנסה לשמור על passive intent לפי semantics של route/venue.

‏כאשר accidental crossing יהרוס את economics, Post Only היא guardrail. כאשר taking liquidity כבר מוצדקת, Candidate של Post Only צריכה להיעלם ולא "להתכופף".

---

## ‏10B.15 `IMPROVE_ONE_TICK` — `PRICE_IMPROVING`, לא Modify סמוי

```text
ApplicationExecutionMode = PRICE_IMPROVING
BehaviorCandidate = IMPROVE_ONE_TICK
```

‏שיפור מחיר ב־tick קונה עדיפות פוטנציאלית במחיר של concession.

‏נבחן:

```text
price_paid_for_priority
estimated_queue_improvement
remaining_edge_after_improvement
```

‏אם concession פוגעת ב־Economic Price Bound או מוחקת Edge, Candidate נפסלת.

---

## ‏10B.16 `RELATIVE_PRIMARY` — Broker-managed Repricing בתוך Bound

```text
ApplicationExecutionMode = BROKER_MANAGED
BehaviorCandidate = RELATIVE_PRIMARY
```

‏Candidate רלוונטית כאשר:

```text
we still want liquidity-providing behavior
quote moves enough that static join becomes stale
client-side cancel/replace churn is undesirable
economic_price_bound is clear
signal has enough life
```

‏היתרון הוא delegation של repricing. החיסרון הוא שה־Broker אינה יודעת שה־Signal שלנו נחלשה.

---

## ‏10B.17 Broker-managed Repricing דורשת Local Validity Watchdog

‏גם כאשר המחיר מנוהל אצל Broker:

```text
signal invalidated
quote stale
remaining edge below floor
economic price bound no longer valid
system degraded
application_order_ttl expired
```

‏מפעילים fresh decision / cancel path.

> ‏`ENGINE RULE` — Broker-managed repricing אינה Broker-managed strategy.

---

## ‏10B.18 SMART Relative מקבלת Guard נוסף

‏כיוון ש־SMART Relative יכולה לקבל route-specific/asymmetric repricing semantics, deterioration של Intent או economics צריך להיות cancel/re-decision condition מפורש. אין להניח שה־Order תמיד תחזור לבדה למחיר פחות אגרסיבי.

---

## ‏10B.19 משפחת Midpoint היא Trade על זמן מול Spread

```text
ApplicationExecutionMode = MIDPOINT_SEEKING
```

‏Candidates מרכזיות:

```text
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
```

‏המטרה היא price improvement בתוך ה־spread; המחיר הוא uncertainty ב־fill probability וב־time-to-fill.

---

## ‏10B.20 `MIDPRICE`

‏Candidate שורדת כאשר:

```text
spread is economically meaningful
remaining life is sufficient
half-spread saving matters
SMART path is allowed
historical midpoint fill probability is non-trivial
```

‏היא נפסלת כאשר expected useful-fill time אינו מתאים ל־`application_order_ttl`/Signal life.

---

## ‏10B.21 `SNAP_MIDPOINT`

‏מתאימה כאשר:

```text
midpoint-derived initial price is attractive
continuous repricing is undesirable
short application_order_ttl can be enforced
```

‏היתרון הוא יותר determinism לאחר creation; הסיכון הוא fixed price שמתיישן.

---

## ‏10B.22 `PEGGED_MIDPOINT_DIRECT`

‏Candidate שורדת רק כאשר:

```text
direct destination is validated
venue-specific semantics are accepted
midpoint opportunity is meaningful
remaining life supports waiting
```

‏אם אין Venue hypothesis מוכחת, `MIDPRICE` יכולה להישאר baseline פשוטה יותר למחקר.

---

## ‏10B.23 `MIDPRICE` ו־`PEGGED_MIDPOINT_DIRECT` אינן aliases

‏`MIDPRICE` בודקת Broker-managed midpoint-oriented execution דרך path מתאים.

‏`PEGGED_MIDPOINT_DIRECT` בודקת mechanism directed ו־destination-specific.

‏לכן הן מושוות רק ב־contexts שבהם שתיהן חוקיות.

---

## ‏10B.24 `ADAPTIVE_LIMIT_URGENT`

```text
ApplicationExecutionMode = BROKER_MANAGED
BehaviorCandidate = ADAPTIVE_LIMIT_URGENT
BrokerAlgo = Adaptive(Urgent)
EconomicPriceBound = required
```

‏היא מעניינת כאשר רוצים price improvement אם אפשר, אבל אין הרבה זמן ורוצים שה־Broker ינהל חלק מה־search.

‏היא אינה synonym ל־IOC.

---

## ‏10B.25 `ADAPTIVE_LIMIT_NORMAL`

‏Candidate שורדת רק כאשר signal life ו־time budget גדולים מספיק ביחס להתנהגות שנמדדה.

‏`Adaptive Patient` נשארת כרגע `REFERENCE / RESEARCH ONLY` עבור ה־core horizon שלנו, אלא אם Evidence עתידי מצדיק פתיחתה.

---

## ‏10B.26 `MARKETABLE_LIMIT_IOC` — אגרסיביות תחומה

```text
ApplicationExecutionMode = AGGRESSIVE_CAPPED
BehaviorCandidate = MARKETABLE_LIMIT_IOC
BrokerPrimitive = LMT
BrokerTIF = IOC
```

‏ה־intent:

```text
execute available liquidity now
within Economic Price Bound
accept allowed partial
leave no resting remainder from this attempt
```

‏זו Candidate מרכזית כאשר missed-move cost גבוה ויש נזילות מספקת בתוך ה־Bound.

---

## ‏10B.27 `MARKETABLE_LIMIT_IOC` אינה תמיד Winner

‏גם אם היא מהירה:

```text
spread may consume too much edge
depth may be thin
quote may move before arrival
partial fill may be too small
```

‏Urgency אינה מבטלת economics, depth או exit-feasibility constraints.

---

## ‏10B.28 `Market` רגילה אינה Core Entry Candidate

‏Entry יכולה להסתיים ב־`NO_TRADE`, ולכן כאשר Edge קטן אנו מעדיפים baseline אגרסיבי עם `Economic Price Bound` על פני intent ללא client-defined price boundary.

‏`Market` נשארת primitive מקצועית חשובה, בעיקר בהקשר Exit/Risk; היא אינה Entry default במנוע הזה.

---

## ‏10B.29 `Spread-to-Edge Ratio`

```text
spread_to_edge_ratio = spread_cost / expected_gross_edge
```

‏כאשר היחס גבוה, price-improving/midpoint/passive candidates עשויות לקבל הצדקה אם הזמן מאפשר.

‏כאשר היחס נמוך ו־missed-move cost גבוה, `AGGRESSIVE_CAPPED` יכולה לקבל עדיפות.

‏זה Feature למחקר, לא threshold אוניברסלי.

---

## ‏10B.30 `Qty-to-Depth Ratio`

```text
qty_to_visible_bound_depth = requested_qty / visible_qty_within_economic_bound
```

‏Ratio גבוה יכול להוביל ל־:

```text
reduce size
allow partial IOC
remove full-size aggressive candidate
NO_TRADE
```

‏הוא לעולם אינו מרחיב אוטומטית את Economic Price Bound.

---

## ‏10B.31 `Quote Velocity` משנה את ערך ה־Passive Wait

‏אם ה־Book נע מהר יותר מה־client repricing loop, Static Passive יכולה להתיישן כמעט מיד.

‏אז אפשר לשקול, לאחר Gates:

```text
RELATIVE_PRIMARY
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

‏הבחירה תלויה בכיוון, spread, remaining life, economics ו־Capabilities.

---

## ‏10B.32 Fill Probability אינה Objective יחידה

‏Behavior עם Fill Rate גבוה יכולה להיות גרועה אם היא מתמלאת בעיקר לפני adverse move.

‏נשווה:

```text
fill probability
conditional execution quality
post-fill markout
no-fill opportunity outcome
missed-move cost
```

‏ולא Fill Rate לבדה.

---

## ‏10B.33 Pairwise Dominance במקום Master Score

‏לאחר elimination, Candidate A יכולה להוציא את B אם היא אינה גרועה יותר בממדים הקריטיים וטובה יותר לפחות באחד:

```text
economic price bound preservation
expected net edge
useful-fill time
risk
capability confidence
state complexity
```

‏כך נמנעים ממשקלים שרירותיים בין safety, economics וזמן.

---

## ‏10B.34 כשאין Dominance — משתמשים ב־Policy Priority מפורשת

‏לדוגמה מחקרית:

```text
WIDE_SPREAD_WITH_TIME:
MIDPRICE
→ SNAP_MIDPOINT
→ PASSIVE_JOIN
→ MARKETABLE_LIMIT_IOC
```

‏לעומת:

```text
FAST_BREAKOUT_SHORT_LIFE:
MARKETABLE_LIMIT_IOC
→ ADAPTIVE_LIMIT_URGENT
→ NO_TRADE
```

‏הסדר הוא `POLICY DEFAULT / RESEARCH HYPOTHESIS`, לא Fact על השוק.

---

## ‏10B.35 Regime חייבת להיות נגזרת מ־Inputs מפורשים

```text
spread_bucket
remaining_life_bucket
quote_velocity_bucket
depth_bucket
volatility_bucket
urgency_bucket
```

‏כך Decision ניתנת לשחזור.

---

## ‏10B.36 `Fallback` ו־`Escalation` אינם אותו דבר

### ‏`Fallback`

‏ה־path שנבחר נכשל, נדחה או אינו זמין; מעדכנים Facts/Capability ומריצים Decision חדשה כדי למצוא חלופה.

### ‏`Escalation`

‏Urgency/Risk/Market state השתנו ולכן Decision חדשה עשויה לבחור Mode אגרסיבי יותר.

> ‏`ENGINE RULE` — אף אחד מהם אינו shortcut של `send a more aggressive order`.

---

## ‏10B.37 Escalation אינה Timer שמעלה מחיר אוטומטית

‏Anti-pattern:

```text
passive 200ms
then midpoint 200ms
then IOC automatically
```

‏המסלול הנכון:

```text
attempt/checkpoint ends
→ update fills and order state
→ fresh market snapshot
→ run 10A
→ run 10B
→ produce a new EntryPlan or NO_ACTION/NO_TRADE
```

---

## ‏10B.38 `Escalation Budget` הוא Bound מצטבר

```text
max_attempts_per_signal
max_total_entry_time_ms
max_cumulative_price_concession
max_cancel_replace_count
max_broker_algo_restarts
```

‏כך סדרה של Decisions חוקיות בנפרד אינה הופכת ל־chase בלתי מוגבל.

---

## ‏10B.39 `Price Concession` נמדדת מה־Reference המקורי

‏לא רק:

```text
new limit - previous limit
```

‏אלא גם:

```text
current_limit - initial_decision_reference
current_limit - original_bid_or_ask
current_limit - original_midpoint
```

‏עשרה צעדים קטנים עדיין יכולים ליצור concession מצטברת גדולה.

---

## ‏10B.40 `Economic Price Bound` נשאר Hard בכל ניסיון

‏אין:

```text
we already tried three times
=> allow one more tick beyond bound
```

‏Bound חדשה יכולה להגיע רק מ־fresh economic decision ב־10A, לא מ־retry counter.

---

## ‏10B.41 `No Chase after Signal Decay`

‏אם Signal עוברת:

```text
VALID -> WEAKENING
```

‏Policy יכולה לאפשר KEEP מוגבל ל־Order פסיבית, אך אינה חייבת לאשר escalation.

‏אם:

```text
VALID -> INVALIDATED
```

‏התגובה היא cancel/reconcile. אין price concession נוספת.

---

## ‏10B.42 Quote שמתרחקת אינה כשלעצמה אישור לרדוף

‏אם Ask עולה, בודקים מחדש:

```text
expected exit
remaining edge
signal validity
exit feasibility
Economic Price Bound
```

‏רק fresh decision יכולה לשנות price policy.

---

## ‏10B.43 `Partial Fill` היא Decision State חדשה

‏אחרי Fill חלקית יש שתי בעיות נפרדות:

```text
A. Position already owned
B. Remaining desired entry
```

‏ה־Position הקיימת עוברת מיד ל־Protection/Exit responsibility; ה־remainder חוזרת ל־10A/10B.

> ‏`ENGINE RULE` — אין "continue filling the original order" כפעולה סמנטית אוטומטית לאחר Partial Fill.

---

## ‏10B.44 ארבע מחלקות של Partial Fill

```text
FULL_FILL
USEFUL_PARTIAL
SUBMINIMUM_PARTIAL
DUST_PARTIAL
```

‏הסיווג תלוי economics, protection ו־minimum useful position — לא במספר קבוע של מניות.

‏`USEFUL_PARTIAL` יכולה להישאר Position תקפה; ‏`SUBMINIMUM_PARTIAL` או `DUST_PARTIAL` יכולות להצדיק אי־הוספה ואף Exit decision נפרדת.

---

## ‏10B.45 Retry של Remainder אינו אוטומטי

‏נניח:

```text
target = 100
IOC filled = 63
remainder = 37
```

‏אין:

```text
retry 37 immediately
```

‏יש:

```text
apply execution fact
update/reconcile position
verify protection responsibility
recompute remaining safe qty
refresh signal/market/capabilities
run 10A
run 10B if entry remains allowed
```

---

## ‏10B.46 `Zero Fill` ו־`Rejection` אינם אותו Outcome

‏Zero Fill אומרת שה־attempt לא יצר execution בתנאים הנתונים.

‏Rejection אומרת שה־Order לא נכנסה למסלול execution כפי שהתכוונו.

‏לכן:

```text
NO_FILL
=> update market/outcome evidence

REJECTED
=> update capability/validation evidence
```

‏בשני המקרים fallback, אם בכלל, עובר דרך fresh decision.

---

## ‏10B.47 Capability Conflict מסירה Candidate — לא בוחרת אחרת

```text
MIDPRICE -> capability conflict
```

‏התגובה:

```text
record scoped capability evidence
remove MIDPRICE from eligible candidates
run 10A/10B again
```

‏לא שולחים Candidate אגרסיבית יותר מתוך error handler.

---

## ‏10B.48 Broker-managed Behavior עדיין מקבלת `application_order_ttl`

‏`Relative`, ‏`MidPrice` ו־`Adaptive` יכולות להמשיך לעבוד אצל Broker ללא local repricing.

‏לכן נשמור:

```text
signal_ttl
application_order_ttl
working_order_age
cancel_conditions
```

‏Delegation של HOW אינה delegation של WHETHER.

---

## ‏10B.49 TTL הוא Behavior-specific

‏אותו Signal יכול לתת TTL שונה ל־Candidates:

```text
PASSIVE_JOIN             = short
MIDPRICE                 = short-to-medium
ADAPTIVE_LIMIT_URGENT    = short
MARKETABLE_LIMIT_IOC     = immediate broker_tif attempt
```

‏אבל `application_order_ttl` לא יכולה לעבור את Signal lifetime או את ה־Envelope bound.

---

## ‏10B.50 Queue Age היא Economic Context, לא זכות להמשיך

‏אם Passive Order צברה queue context, הדבר יכול להשפיע על `KEEP` מול `CANCEL`.

‏אבל:

```text
signal validity
Economic Price Bound
expected net edge
risk/protection state
```

‏גוברים עליה תמיד. אין `sunk-cost exception`.

---

## ‏10B.51 Repricing Mechanism חייב להיות מפורש

‏אם אותה Behavior נשארת תקפה ורק allowed fields משתנים, ה־Adapter יכול לבחור:

```text
MODIFY_IN_PLACE
```

‏מעבר למשפחה אחרת בדרך כלל דורש:

```text
CANCEL_THEN_NEW
```

‏ורק Policy מחקרית מפורשת עם exposure budget יכולה להשתמש ב־:

```text
OVERLAPPED_REPLACEMENT
```

‏`BROKER_MANAGED_REPRICE` הוא mechanism אחר לגמרי ואינו local Modify loop.

---

## ‏10B.52 Candidate אחת בלבד אינה מחייבת Submit

‏גם אם נשארה Candidate יחידה, ה־Selector רשאי להחזיר:

```text
NO_TRADE
DEFER
NO_ACTION
```

‏לפי מצב ה־Intent וה־Order הקיים.

‏"Candidate survived" אינה הוראת שליחה.

---

## ‏10B.53 לא מריצים כמה Entry Candidates חיות כדי לראות מי תתמלא

‏אם target היא 100, המצב הבא מסוכן:

```text
PASSIVE 100
+
MIDPRICE 100
+
IOC 100
```

‏Research comparison נעשית ב־shadow/simulation או תחת exposure budget מפורש; לא באמצעות uncontrolled live race.

---

## ‏10B.54 Capital Reservation כוללת Exposure פוטנציאלית

‏נשמור:

```text
capital_reserved_for_potential_fill
```

‏ונכלול Orders ב־submit/cancel/modify uncertainty.

‏Capital אינה משתחררת רק מפני שה־Intent המקומית כבר רוצה Candidate אחרת.

---

## ‏10B.55 `Superseded Opportunity`

‏כאשר Opportunity חדשה מועדפת:

```text
old_intent = SUPERSEDED
```

‏ואז:

```text
cancel old entry if required
reconcile possible late fill
release only confirmed-safe exposure/capital
then evaluate new intent
```

‏Opportunity חדשה אינה מוחקת Broker state ישן.

---

## ‏10B.56 `Entry Ownership` — Single Decision Authority

‏לכל Entry Intent יש owner אחד של lifecycle decision:

```text
ENTRY_SELECTOR / DECISION ENGINE
```

‏Scanner יכול ליצור/expire/supersede Intent. Broker Adapter מדווח Facts. Error handler אינו מחליט עצמאית על fallback Order.

> ‏`ENGINE RULE` — side-effect callback לא בוחר Behavior חדשה; הוא מעדכן Facts ומפעיל re-decision.

---

## ‏10B.57 מטריצת התאמה ראשונית לפי Regime

| מצב | Candidates טבעיות | מה נחלש |
|---|---|---|
| ‏Spread צר מאוד + urgency גבוהה | `MARKETABLE_LIMIT_IOC`, `ADAPTIVE_LIMIT_URGENT` | ‏Passive savings קטנה |
| ‏Spread רחב + Signal צעיר | `MIDPRICE`, `SNAP_MIDPOINT`, `PASSIVE_JOIN` | ‏Immediate crossing יקר |
| ‏Quote זזה מהר + Passive intent | `RELATIVE_PRIMARY` | ‏Static join מתיישנת מהר |
| ‏Price improvement בלי continual reprice | `SNAP_MIDPOINT` | ‏Continuous pegging פחות רצוי |
| ‏Direct midpoint hypothesis מוכחת | `PEGGED_MIDPOINT_DIRECT` | ‏SMART path פחות deterministic |
| ‏Signal כמעט פג | `MARKETABLE_LIMIT_IOC` או `NO_TRADE` | ‏Waiting families |
| ‏Depth דקה בתוך Bound | ‏Size reduction / partial IOC / `NO_TRADE` | ‏Full-size aggression |

> ‏`RESEARCH HYPOTHESIS` — זו starting policy למחקר, לא חוק Production סופי.

---

## ‏10B.58 Decision Tree ראשוני ללא Score

```text
if envelope.disposition != ALLOW_ENTRY:
    return no_new_entry

candidates = envelope.allowed_behavior_candidates

remove candidates that cannot fit time budget
remove candidates that violate liquidity intent
remove candidates that cannot respect Economic Price Bound
remove candidates with unacceptable expected useful-fill size
remove candidates whose capabilities are not enabled for this scope
remove candidates that exceed complexity/risk policy

if no candidates:
    return NO_TRADE

apply pairwise dominance
apply explicit regime policy

if no side effect is currently required:
    return NO_ACTION

return EntryPlan
```

---

## ‏10B.59 `Selection Reason Code` הוא חלק מהתוצאה

‏לדוגמה:

```text
selected = MIDPRICE
reason = WIDE_SPREAD_WITH_TIME_FOR_MIDPOINT_SEARCH
```

‏או:

```text
selected = MARKETABLE_LIMIT_IOC
reason = SHORT_REMAINING_LIFE_AND_SUFFICIENT_DEPTH_WITHIN_BOUND
```

‏Reason code יציב עדיף על טקסט חופשי או score בלתי מוסבר.

---

## ‏10B.60 Telemetry של Candidate Elimination

```text
candidate_id
application_execution_mode
initially_allowed
eliminated
elimination_reason_code
expected_time_to_useful_fill
expected_useful_fill_probability
expected_entry_cost_bps
expected_price_improvement_bps
expected_missed_move_cost_bps
economic_bound_distance_bps
qty_to_depth_ratio
routing_policy
broker_algo
implementation_owner
```

‏גם Candidates שלא נבחרו נשמרות למחקר.

---

## ‏10B.61 Shadow Evaluation

‏ב־Paper/Live אפשר לבצע Candidate אחת ולחשב אחרות כ־shadow:

```text
chosen_behavior = A
shadow_candidates = B,C,D
```

‏Shadow candidate אינה שולחת Broker Order ואינה צורכת exposure budget אמיתי.

---

## ‏10B.62 Outcome Attribution

‏לאחר Entry attempt נשייך Outcome ל־Decision המקורית:

```text
application_execution_mode
selected_behavior
selection_reason_code
fill_result
fill_latency
execution_quality
entry_cost
markout
missed_move_if_no_fill
subsequent_exit_cost
```

‏`Execution Quality` ו־`Trade Outcome` נשמרים כמדדים שונים: ביצוע מצוין יכול להשתייך לעסקה שה־Signal שלה הפסידה, ולהפך.

---

## ‏10B.63 A/B Test הוגן הוא Opportunity-level

‏לא משווים רק fills של Candidate A מול fills של B.

‏משווים את כל ה־eligible opportunities שהוקצו לכל Policy, כולל:

```text
full fills
partial fills
no fills
missed moves
rejections
execution costs
subsequent trade outcomes
```

‏אחרת Candidate עם no-fill גבוה יכולה להיראות טובה באופן מלאכותי.

---

## ‏10B.64 Acceptance Tests ל־Entry Selector

```text
1. wide spread + sufficient life => midpoint/passive candidates survive
2. very short life => waiting candidates eliminated
3. passive-only economics => taker candidate eliminated
4. post-only unavailable => only post-only candidate removed
5. Economic Price Bound below executable ask => IOC not falsely treated as executable
6. thin depth => size reduced or aggressive candidate removed
7. quote velocity high => static passive can be eliminated
8. Relative chosen only with Bound + local TTL
9. MidPrice chosen only when time budget permits
10. Snap expires without automatic chase
11. IOC partial => remainder becomes new decision state
12. zero-fill IOC => classified, not blindly retried
13. broker reject => capability evidence + re-decision
14. signal invalidates during passive wait => cancel/reconcile
15. signal invalidates during Adaptive => cancel/reconcile
16. old entry cancel-pending prevents unsafe new entry
17. superseding opportunity waits for safe exposure reconciliation
18. cumulative escalation never exceeds concession budget
19. Economic Price Bound never violated across retries
20. identical replay snapshot => same EntryPlan
21. fallback never bypasses 10A
22. OVERLAPPED_REPLACEMENT impossible without explicit exposure budget
```

---

## ‏10B.65 Property Tests

```text
shorter remaining life must never make a slower-only candidate newly eligible
lower buy Economic Price Bound must never permit a higher executable price
higher potential exposure must never increase allowed entry qty
removing post-only capability must never create an automatic taker order
signal INVALIDATED must never produce a new entry plan
cumulative concession must never exceed configured maximum
capability rejection must never directly create a more aggressive order
partial fill must always change the next decision context
```

---

## ‏10B.66 V1 — Mode קטן, Candidate set קטן

> ‏`POLICY DEFAULT` — כדי לא לבנות מערכת ענקית לפני Evidence, V1 המחקרית יכולה להתחיל עם ארבע Candidates מבוצעות היטב:

```text
PASSIVE_JOIN
MIDPRICE
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

‏ואחר כך להוסיף:

```text
PASSIVE_POST_ONLY
RELATIVE_PRIMARY
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
```

‏הסיבה היא כיסוי ארבע פילוסופיות execution שונות, לא טענה שהקבוצה השנייה פחות מקצועית.

---

## ‏10B.67 Candidate lifecycle נפרד מ־Capability enablement

‏לכל Candidate מחקרית אפשר להחזיק:

```text
DISABLED
SHADOW_ONLY
LIVE_ENABLED
```

‏זה אינו מחליף את Capability enablement:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

‏Capability אומרת האם ה־implementation path חוקי/מאומת; Candidate lifecycle אומרת האם Policy המחקר שלנו רשאית להשתמש בו בפועל.

---

## ‏10B.68 Research Harness צריך להיות Extensible

```text
EntryBehaviorCandidate {
  id
  application_execution_mode
  eligibility(context, envelope)
  derive_constraints(context, envelope)
  estimate_outcome(context)
  materialization_requirements
  failure_destination
  cancel_policy
}
```

‏`failure_destination` אומר האם failure מובילה למשל ל־`DEFER`, ‏`NO_TRADE`, ‏fresh candidate selection, ‏`EXIT_ONLY` או recovery — ולא לאיזה Broker Order לשלוח אוטומטית.

---

## ‏10B.69 Practitioner Insights — Entry Selection

### ‏1. Order Name אינה Execution Behavior מלאה

‏אותו `LMT` יכול להיות Passive או Marketable; Routing, TIF, attributes ו־market state משנים את ההתנהגות.

### ‏2. הפקודה המהירה ביותר אינה תמיד Entry הכלכלית הטובה ביותר

‏Fill מיידית במחיר שמוחק את ה־Edge אינה הצלחה.

### ‏3. Passive אינה ברירת מחדל חסכונית

‏No-fill ו־adverse selection יכולים לעלות יותר מה־spread שנחסך.

### ‏4. Midpoint אינה "חצי Spread בחינם"

‏משלמים ב־fill uncertainty ובזמן.

### ‏5. `Post Only` היא Constraint

‏כאשר urgency משתנה, Candidate יכולה להיעלם במקום לשנות משמעות.

### ‏6. `Relative` חוסכת Client Reprice Loop — לא Signal Monitoring

‏Validity ו־TTL נשארות אצלנו.

### ‏7. `Snap` מפחיתה Auto-Chase — לא Staleness

‏`application_order_ttl` עדיין חובה.

### ‏8. `Adaptive` היא Delegation מבוקרת

‏ה־Broker יכולה לייעל HOW; אנחנו מחזיקים WHETHER, Bound ו־TTL.

### ‏9. `IOC` היא Attempt תחומה, לא Trade lifecycle מלא

‏Partial Fill משנה מיד Position ו־remaining intent.

### ‏10. Escalation היא סדרה של Decisions

‏לא staircase אוטומטי עד Fill.

### ‏11. Chase נמדד מצטבר

‏צעדים קטנים אינם מעלימים concession כוללת.

### ‏12. Queue position היא Asset מותנה

‏היא בעלת ערך רק כל עוד Signal, economics ו־Risk עדיין מצדיקים אותה.

### ‏13. Better Opportunity אינה מוחקת Exposure ישנה

‏Capital/Risk משתחררים רק לאחר reconciliation.

### ‏14. No Fill יכולה להיות Outcome טובה

‏אם האלטרנטיבה הייתה Fill רעילה או מעבר ל־Bound, אי־ביצוע שמר על ה־Edge/Risk.

### ‏15. Candidate שלא נבחרה עדיין חשובה למחקר

‏Shadow telemetry מאפשרת להשוות Policies בלי exposure כפול.

---

# ‏Checkpoint — סוף חלק 10B

‏10B מקבלת `EntryEnvelope` מ־10A ובוחרת בשתי שכבות נפרדות: `Application Execution Mode` ואחריה `Behavior Candidate`. רק לאחר הבחירה נוצר `Concrete Broker Order Plan` שמכיל Primitive, TIF, Routing, Broker Algo ו־attributes.

‏הבחירה נשארת elimination-first: זמן, liquidity intent, ‏`Economic Price Bound`, ‏size, capability ו־risk מסירים Candidates; אחר כך pairwise dominance ו־explicit regime policy בוחרים survivor. ‏`Fallback`, ‏`Escalation`, ‏retry ו־Partial Fill תמיד חוזרים ל־fresh decision. ‏`application_order_ttl`, ‏`signal_ttl`, ‏`broker_tif` ו־`working_order_age` נשארים clocks שונים.

‏העיקרון המכריע הוא: **Order attempt אינה הבטחה להמשיך עד Fill. כל שינוי מהותי ב־Market, Signal, Position, Capability או lifecycle מחזיר את המנוע להחלטה חדשה תחת אותם safety/economic bounds.**

‏השלב הבא יהיה **חלק 10C — Exit Decision**: ננרמל את Exit modes, ‏Protection ownership, ‏Position truth ו־handoff semantics מול אותו vocabulary קנוני.
