# ‏חלק 8B — Failure Contracts & Order Survivability: מי ממשיך להחזיק את ה־Order כשהמערכת שלנו נופלת

> ‏הפרק הזה מוסיף את שכבת ה־Production Safety שחסרה מעל Part 8 ו־Part 9. הוא אינו מוסיף Order Types חדשים. הוא מגדיר לכל family את שאלת ה־survivability: **איפה ה־state החי נמצא, מי ממשיך לנהל אותו, מה עדיין יכול לקרות אחרי disconnect/restart, ומה חייבים לשחזר לפני שחוזרים לשליטה.**

---

## ‏8B.1 כלל העל: שם הפקודה אינו קובע Survivability

‏אין כלל חוקי מסוג:

```text
Stop survives restart
Pegged survives disconnect
Broker Algo is always server-resident
```

‏ה־survivability נקבעת על ידי ה־implementation path בפועל:

```text
implementation_owner
implementation_kind
residency_state
routing / destination
adapter / API
session
account / legal entity
parameter combination
broker acceptance evidence
```

> ‏`ENGINE RULE` — כאשר persistence/residency לא הוכחו עבור ה־Capability tuple המדויקת, המצב הקנוני הוא `UNKNOWN`, לא הנחה שה־Order תשרוד.

---

## ‏8B.2 Dimensions שאסור לאחד

```text
Execution Owner
Persistence Owner
Repricing Owner
Trigger Owner
Dependency / Coordination Owner
Cancel Authority
Recovery Source of Truth
Intent Validity
Residency State
```

‏לדוגמה, Order יכולה להיות:

```text
implementation_kind = BROKER_SIMULATED
residency_state      = VERIFIED_BROKER_RESIDENT
```

‏או:

```text
implementation_kind = BROKER_SIMULATED
residency_state      = UNKNOWN
```

‏`Broker-Simulated` אינו synonym ל־`Broker-Resident`.

‏באותה צורה:

```text
VENUE_NATIVE
```

‏מתאר איפה behavior מסוים מיושם, אבל אינו אומר שה־local engine יודעת אוטומטית לשחזר את כל ה־state לאחר restart.

---

## ‏8B.3 Failure Contract קנוני לכל Family

```text
FailureContract {
  family_id
  concrete_capability_scope

  execution_owner
  persistence_owner
  repricing_owner
  trigger_owner
  dependency_owner
  cancel_authority

  implementation_kind
  residency_state
  intent_validity_source

  recovery_sources[]
  potentially_executable_rule
  possible_late_effects[]
  unsafe_assumptions[]
  required_acceptance_tests[]

  stale_intent_obligation
  failure_destination_profile
  control_regain_condition
}
```

‏ה־Contract אינו מבטיח Broker semantics שלא אומתו. הוא אומר בדיוק **מה צריך להיות ידוע** כדי שנוכל להסתמך על ה־family ב־Production.

---

## ‏8B.4 Order Survivability Matrix

| Family / path | Owner של behavior אחרי submit | Persistence / residency שצריך להוכיח | local process death | TWS / session restart | Late effects עיקריים | Recovery requirement |
|---|---|---|---|---|---|---|
| Static transmitted `Limit` / passive Limit | Broker/Venue לאחר acceptance | Broker/Venue לפי path | יכולה להישאר executable אם accepted | capability-specific | fill, partial, reject, cancel ack | open orders + executions + position |
| `Post Only` / `Hidden` / `Reserve` / `Discretionary` | Broker/Venue לפי attribute/path | capability-specific | יכולה להישאר executable אם accepted | capability-specific | fill/partial, attribute/path reject, replenishment effects | full effective exposure, לא רק displayed state |
| `Relative / Pegged-to-Primary` | Broker/Venue repricing path | Broker/Venue + route-specific residency | repricing עשוי להמשיך | capability-specific | late reprice, fill, partial, reject | current working price + order state + executions + intent validity |
| `MIDPRICE` | Broker-managed algo/mechanism | Broker path; residency חייבת evidence | broker behavior עשוי להמשיך | capability-specific | route/algo reprice, fill, reject | broker algo state observable ככל האפשר + executions + position |
| Directed `Pegged-to-Midpoint` | Venue/Broker path | destination-specific | יכול להמשיך לפי path | capability-specific | late reprice/fill | route/destination identity + working state + executions |
| `Snap Midpoint` | Broker derives once; remainder Limit-like | capability-specific | fixed derived order עשויה להישאר | capability-specific | fill/partial/cancel/reject | recover actual derived working price, לא recompute היסטורית |
| `Adaptive` | Broker Algo | Broker-managed path | algo עשוי להמשיך לבצע | capability-specific | fill/partial/reprice/routing/reject | current broker state + executions + local stale-intent check |
| `Sweep-to-Fill` | Broker/router during aggressive attempt | path-specific | in-flight/accepted effects יכולים להמשיך | usually short-lived but never assume terminal | partial/full fill, reject, correction | executions + final order state + position |
| `Market-to-Limit` | Broker; לאחר fill ראשון remainder משנה צורה | transformed remainder residency | remainder עשויה להישאר executable | capability-specific | initial fill + transformation + remainder fill | reconstruct transformation state + actual remainder + position |
| `Stop / Stop Limit / MIT / LIT` | Trigger owner לפי path; post-trigger execution owner לפי plan | native/broker-simulated/resident לפי capability | trigger יכול עדיין לקרות אם resident | capability-specific | late trigger, fill, partial, reject | trigger state + post-trigger order state + executions + position |
| `Trailing` families | Broker/Venue moving-trigger owner לפי path | path-specific dynamic trigger state | moving trigger עשוי להמשיך | capability-specific | late trigger, trigger repricing/update, fill | recover broker-observed trigger/order state; לא rebuild רק ממחיר נוכחי |
| Transmitted `Bracket` | Broker/Venue + dependency semantics | parent/children acceptance/residency | children/parent יכולים להמשיך לפי accepted graph | capability-specific | parent fill, child activation, sibling cancel, child fill | rebuild protection graph + executions + position + protected qty |
| **Untransmitted** staged Bracket component | TWS/session-local staging לפי path | **לא Broker protection** | local process/TWS dependency גבוהה | עלולה לא לשרוד | missing transmit / local staged state loss | treat as not protected until broker acceptance evidence |
| `OCA/OCO` | Broker coordination path | group state capability-specific | siblings יכולים להמשיך | capability-specific | sibling fill, cancel, partial, reject | reconstruct every member + group relationship + worst-case exposure |
| `Conditional` | Predicate evaluator לפי path | broker/session/path-specific | predicate evaluation עשויה להמשיך רק אם path resident | capability-specific | late activation/cancel/fill | recover predicate/order state + activation evidence |
| Local dynamic exit before submit | Client | Local only | **לא שורדת** | לא רלוונטי | none at broker until submit | rebuild from position/risk truth; old local intent אינה authority |

> ‏`ENGINE RULE` — המילים “יכולה”, “עשויה” ו־“capability-specific” בטבלה הן intentional. ‏Survivability אינה מקבלת `true` עד evidence ל־scope המדויק.

---

## ‏8B.5 Canonical Residency Values

‏נשתמש ב־residency states מפורשים:

```text
VERIFIED_VENUE_NATIVE
VERIFIED_BROKER_RESIDENT
VERIFIED_SESSION_LOCAL
CLIENT_DEPENDENT
UNKNOWN
```

‏אלה מתארים persistence/residency בלבד. הם אינם מחליפים:

```text
implementation_kind
= VENUE_NATIVE | BROKER_SIMULATED | BROKER_ALGO | COMPOSITE | CLIENT_MANAGED | MIXED
```

‏לדוגמה, `Broker Algo` יכולה להיות `BROKER_ALGO` מבחינת implementation, אך residency עדיין צריכה evidence נפרד.

---

## ‏8B.6 Universal Submit Failure Contract

```text
send submit
!=
broker accepted
```

‏לאחר submit request יכולים להיות לפחות:

```text
accepted + acknowledgement observed
accepted + acknowledgement lost
rejected + rejection delayed
transport failure before receipt
receipt / acceptance unknown
```

‏במצב האחרון:

```text
SUBMIT_UNKNOWN
```

‏וה־destination היא:

```text
RECONCILE_ORDER_AND_POSITION
```

‏לא:

```text
blind retry
```

> ‏`ENGINE INVARIANT` — retry של submit כאשר ה־effect הקודם אינו ידוע עלול ליצור duplicate executable exposure.

---

## ‏8B.7 Universal Cancel Failure Contract

```text
CANCEL_REQUESTED
!=
CANCEL_CONFIRMED
!=
TERMINAL_NON_EXECUTABLE
```

‏עד terminal broker evidence, ה־Order נשארת:

```text
POTENTIALLY_EXECUTABLE
```

‏ולפי family היא עדיין יכולה לייצר:

```text
fill
partial fill
trigger
reprice
child activation
sibling coordination effect
reject / correction
```

‏כל הכמות הרלוונטית נשארת ב־worst-case executable exposure.

---

## ‏8B.8 Intent Validity היא State נפרדת מ־Broker Lifecycle

```text
broker_order_state = WORKING
intent_state       = EXPIRED
```

‏הצירוף הזה חוקי במודל.

‏הוא אומר:

```text
broker may still execute
local strategy no longer authorizes continued exposure
```

‏במיוחד חשוב עבור:

```text
passive resting orders
Relative / Pegged
MidPrice
Adaptive
Market-to-Limit remainder
Bracket children
Conditional orders
```

> ‏`ENGINE RULE` — `WORKING` אינה הוכחה שה־Intent עדיין רצויה.

---

## ‏8B.9 Broker-managed behavior אחרי `application_order_ttl`

‏ב־broker-managed repricing / algo / trigger behavior:

```text
application_order_ttl expires
→ local cancellation obligation is created
```

‏אבל:

```text
local TTL expiry
!=
remote order termination
```

‏עד cancel terminal evidence:

```text
order remains POTENTIALLY_EXECUTABLE
broker-managed behavior may continue
late effects remain valid
```

‏לכן TTL היא local policy clock; היא אינה remote kill switch.

---

## ‏8B.10 Late Effect Taxonomy

```text
LATE_FILL
LATE_PARTIAL_FILL
LATE_TRIGGER
LATE_REPRICE
LATE_TRANSFORMATION
LATE_CHILD_ACTIVATION
LATE_SIBLING_CANCEL
LATE_REJECT
LATE_MODIFY_ACK
LATE_CANCEL_ACK
LATE_EXECUTION_CORRECTION
```

‏ה־prefix `LATE_` אינו אומר שהאירוע “לא חוקי”. הוא אומר שהוא הגיע אחרי שה־local engine כבר שינתה assumption, intent, mode או lifecycle expectation.

### ‏השפעה טיפוסית

```text
LATE_FILL / LATE_PARTIAL_FILL
→ execution truth changes
→ position changes
→ protection / exit sizing may change

LATE_TRIGGER
→ post-trigger executable state may now exist
→ risk/protection graph changes

LATE_REPRICE
→ effective executable price changed externally
→ stale-intent / Economic Price Bound checks rerun

LATE_TRANSFORMATION
→ order semantics/remainder changed
→ lifecycle reconstruction required

LATE_CHILD_ACTIVATION
→ potentially executable exit exposure changes
→ duplicate-exit guard reruns

LATE_SIBLING_CANCEL
→ group exposure changes
→ never infer atomicity retroactively

LATE_REJECT
→ capability/materialization evidence changes
→ position changes only if separate execution evidence says so

LATE_MODIFY_ACK
→ old/new parameter assumptions must reconcile

LATE_EXECUTION_CORRECTION
→ execution ledger and position truth must be recomputed
```

---

# ‏חלק ב — Failure Contracts לפי Family

## ‏8B.11 Static Limit / Passive / Post Only

```text
Execution owner:      Broker/Venue after acceptance
Persistence owner:    capability/path-specific
Repricing owner:      none unless client modifies
Trigger owner:        none
Cancel authority:     client, subject to broker lifecycle
Recovery truth:       broker open order + executions + position
Possible late effects: fill, partial fill, reject, cancel ack, execution correction
```

‏Unsafe assumptions:

```text
application TTL expired => order disappeared
cancel requested => no fill possible
Post Only => cannot be rejected/repriced under path-specific semantics
```

‏Control safely returns רק כאשר order state, executions ו־position reconciled מספיקים ל־fresh Decision.

---

## ‏8B.12 Hidden / Reserve / Discretionary

‏Failure Contract זהה ל־Limit בסיסית מבחינת command truth, אבל recovery חייבת לכלול **effective executable exposure**, לא רק מה שמוצג בשוק.

```text
Hidden:
  displayed absence != zero executable quantity

Reserve:
  displayed slice != total remaining executable quantity

Discretionary:
  displayed price != full executable willingness
```

‏לכן לאחר reconnect אסור לשחזר risk מתוך displayed view בלבד.

---

## ‏8B.13 Relative / Pegged

```text
Execution owner:      Broker/Venue path
Persistence owner:    capability-specific
Repricing owner:      Broker/Venue rule
Cancel authority:     client subject to lifecycle
Recovery truth:       broker state + current effective price + executions + position
Possible late effects: reprice, fill, partial, reject, cancel ack
```

‏הכשל הייחודי:

```text
local intent expires
while
external repricing continues
```

‏Unsafe assumption:

```text
no new client command
=> nothing changed
```

---

## ‏8B.14 `MIDPRICE` / `Adaptive`

‏ב־Broker-managed mechanisms צריך לשחזר לפחות:

```text
is the order still executable?
which broker algo/mechanism is active?
what quantity remains?
what Economic Price Bound still applies?
what executions occurred?
is local intent still valid?
```

‏ה־Broker מנהלת execution tactics; היא אינה מקבלת ownership על private Signal validity.

‏Disconnect של ה־client אינו מבטל אוטומטית את ה־Algo.

---

## ‏8B.15 `Snap Midpoint`

‏`Snap Midpoint` שונה מ־continuous peg:

```text
reference sampled once
→ derived order price established
→ remainder behaves according to resulting order/path
```

‏Recovery לא תחשב “מה המחיר היה אמור להיות עכשיו” ותניח שזה המחיר working.

‏צריך broker-observed truth של המחיר/Order שנוצרה בפועל.

---

## ‏8B.16 `Sweep-to-Fill`

‏למרות שההתנהגות בדרך כלל short-lived/aggressive, failure contract אינה יכולה להניח:

```text
client timeout
=> sweep produced no fill
```

‏צריך reconcile:

```text
fills / partial fills
final order state
remaining executable state if any
position
```

‏Blind resubmit לאחר `SUBMIT_UNKNOWN` עלול להכפיל exposure.

---

## ‏8B.17 `Market-to-Limit`

‏ה־Failure Contract חייב לדעת באיזה phase נמצאת ה־Order:

```text
PRE_INITIAL_EXECUTION
INITIAL_EXECUTION_OBSERVED
TRANSFORMED_LIMIT_REMAINDER
TERMINAL
UNKNOWN_TRANSFORMATION_STATE
```

‏לאחר restart אסור להסיק את remainder רק מ־original quantity.

‏צריך:

```text
execution evidence
+
broker-observed transformed order state
+
reconciled position
```

‏`LATE_TRANSFORMATION` היא אירוע מהותי משום שהיא משנה את semantics של remainder.

---

## ‏8B.18 Trigger Families — Stop / Stop Limit / MIT / LIT

```text
Trigger owner:          capability/path-specific
Post-trigger execution: Market-style or Limit-style according to family
Persistence owner:      capability/path-specific
Recovery truth:         trigger/activation evidence + order state + executions + position
Possible late effects:  trigger, fill, partial, reject, cancel ack
```

‏אחרי disconnect קיימים לפחות שלושה states שונים:

```text
NOT_TRIGGERED
TRIGGERED_POST_ORDER_ACTIVE
UNKNOWN_TRIGGER_STATE
```

‏אסור להפוך `UNKNOWN_TRIGGER_STATE` ל־“לא הופעלה”.

---

## ‏8B.19 Trailing Families

‏Trailing state היא path-dependent.

‏Recovery אינה יכולה בהכרח לשחזר moving trigger רק מתוך:

```text
current market price
+
original trail amount
```

‏מפני שהמסלול ההיסטורי של reference יכול להיות חלק מה־state.

‏לכן source of truth צריך להיות broker-observed state/evidence לפי capability, ואם state קריטי אינו reconstructable:

```text
STATE_INCONSISTENT / UNKNOWN
→ safety reconciliation
```

‏ולא restart של trailing rule כאילו לא קרה דבר.

---

## ‏8B.20 Bracket — Failure Contract בסיסי

‏Bracket היא graph, לא שלוש Orders בלתי־קשורות:

```text
parent
├── take-profit child
└── protective-stop child
```

‏Recovery source of truth חייבת לכלול:

```text
parent executions
child lifecycle states
child quantities
sibling coordination state
reconciled position
protected quantity
potentially executable exit quantity
```

‏בשלב `R6A` נקבע ה־contract בלבד. ‏ה־deep safety של parent partial-fill, transmit sequencing ו־protection graph validation תטופל ב־`R6B`.

> ‏`ENGINE INVARIANT` — `UNTRANSMITTED != PROTECTED`.

---

## ‏8B.21 OCA/OCO — Failure Contract בסיסי

```text
mutual-cancel intent
!=
atomic execution guarantee
```

‏Recovery חייבת לשחזר **כל member** ולא רק את “ה־winner” המקומי:

```text
member lifecycle
member filled qty
member remaining qty
cancel state
potentially executable qty
group identity
```

‏עד terminal evidence על sibling, היא נשארת בתוך worst-case executable exposure.

‏ה־deep non-atomic safety matrix תטופל ב־`R6B`.

---

## ‏8B.22 Conditional Orders

‏Conditional contract מפריד:

```text
predicate evaluation state
!=
post-condition order lifecycle
```

‏לאחר reconnect צריך לדעת:

```text
Was the condition already satisfied?
Was the order activated?
Was it cancelled by condition semantics?
Can the predicate still be evaluated without our client?
Can the post-condition order still execute?
```

‏אם evaluator residency אינה מוכחת, היא `UNKNOWN` ב־Capability Contract.

---

## ‏8B.23 Local Dynamic Exit

‏Local dynamic exit היא `CLIENT_MANAGED` עד שנשלחת Concrete Order.

‏לכן:

```text
process death before submit
→ local exit intent disappears
→ no broker protection magically appears
```

‏Recovery מתחילה מ־Position/Protection truth, לא מניסיון “להמשיך את האלגוריתם מאותה שורה”.

---

# ‏חלק ג — Regaining Control

## ‏8B.24 `CONNECTED != CONTROL_REGAINED`

‏חיבור תקשורת חדש אינו מוכיח שהמנוע שוב יודע מה קורה.

‏Control נחשב safely regained רק לאחר שה־family הרלוונטית סיפקה מספיק evidence ל־:

```text
order identity reconciled
lifecycle reconciled
epistemic uncertainty resolved or explicitly bounded
executions ingested
position reconciled
potentially executable exposure rebuilt
dynamic trigger/reprice/transformation state recovered when relevant
ownership reconstructed
intent validity evaluated
protection adequacy evaluated when position exists
```

‏רק לאחר מכן אפשר להעביר control ל־fresh Decision.

‏`READY` המלא יטופל לעומק בשלב Recovery של `R6`; כאן נקבע רק ש־survivability evidence היא prerequisite.

---

## ‏8B.25 Manual Action היא Failure-Domain Event

‏פעולה ידנית ב־Broker/TWS יכולה לשנות:

```text
order parameters
quantity
cancel state
position
protection graph
ownership assumptions
```

‏לכן כאשר evidence מצביעה על שינוי שאינו תואם command stream שלנו:

```text
ownership_assumption = INVALIDATED
system_mode = RECOVERING or EXIT_ONLY as policy requires
→ reconcile before new risk
```

‏אין לנסות “לנצח” פעולה ידנית באמצעות auto-resubmit.

---

## ‏8B.26 Acceptance Tests משותפים לכל Family

‏כל family שמועמדת ל־`PRODUCTION_ENABLED` צריכה להוכיח לפחות את התרחישים הרלוונטיים:

```text
submit accepted + normal ack
submit accepted + ack delayed/lost
submit rejected
client disconnect while working
client restart while working
TWS/session restart when relevant
application TTL expires while still working
cancel requested + late fill
cancel acknowledgement delayed
partial fill before disconnect
partial fill during recovery window
manual modification/cancel
late broker event after local intent superseded
execution correction when supported by path
```

‏ול־dynamic/composite families נוספים:

```text
reprice while client disconnected
trigger while client disconnected
transformation while client disconnected
child activation while client disconnected
sibling cancel/fill crossing
```

> ‏`ACCEPTANCE TEST REQUIRED` — אין לקדם family ל־Production על סמך happy-path בלבד כאשר survivability משנה את risk semantics שלה.

---

## ‏8B.27 Telemetry Contract

```text
family_id
capability_scope_id
implementation_kind
residency_state
execution_owner
persistence_owner
repricing_owner
trigger_owner
intent_state
broker_order_state
epistemic_uncertainty
potentially_executable_qty
late_effect_type
late_effect_latency_ms
recovery_started_at
control_regained_at
manual_intervention_detected
```

‏כך אפשר למדוד לא רק Fill Quality אלא גם האם ה־survivability assumptions שלנו נכונות בפועל.

---

## ‏8B.28 Invariants של `R6A`

```text
Order name != survivability guarantee
Broker-Simulated != Broker-Resident
Client disconnect != remote cancellation
Application TTL expiry != remote termination
Submit request != broker acceptance
Cancel request != terminal non-executable
Working order != valid current intent
Displayed state != total executable exposure
Unknown trigger state != not triggered
Untransmitted != protected
Non-terminal order => potentially executable until evidence says otherwise
Recovery must reconstruct external state before new risk
```

---

## ‏8B.29 Checkpoint

‏`R6A` סוגר את שני פערי הבסיס:

```text
AO-GAP-P0-12 — Failure Contract per advanced-order family
AO-GAP-P0-13 — Order Survivability Matrix
```

‏הוא גם מקבע את ה־universal late-effect vocabulary ואת `UNTRANSMITTED != PROTECTED`, אך אינו טוען עדיין שסגר את ה־deep Bracket/OCA/Recovery contracts של `R6`.

‏השלב הבא הוא `R6B`: ‏Bracket/OCA/Protection deep safety — parent partial fills, transmit sequencing, non-atomic sibling races, protected-quantity invariants ו־Protection Graph Recovery.