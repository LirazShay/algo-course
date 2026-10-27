# ‏חלק 9 — `IBKR` Capability Matrix: מ־Availability ל־Production Enablement

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, ‏Capability אינה `Supported = Yes/No`. היא צירוף של **feature category + product/contract + route/destination + adapter/API + account/legal entity + session + implementation path + evidence + enablement state**. בנוסף, `Research Priority` היא החלטה שלנו ואינה הוכחה שה־feature זמינה או מותרת ב־Production.

## ‏9.1 מטרת החלק: להפסיק להשתמש ב־`Supported` בלי qualifier

‏השאלה:

```text
Does IBKR support X?
```

‏צרה מדי.

‏בפועל צריך לדעת לפחות:

```text
what capability?
for which product / contract?
through which adapter / API?
through which route / destination?
for which account / legal entity / permissions?
in which session?
where is the behavior implemented?
what evidence do we have?
is it merely available for research or actually production-enabled?
```

‏לכן:

```text
AVAILABLE
!=
RESEARCH_CANDIDATE
!=
PRODUCTION_ENABLED
```

> ‏`ENGINE RULE` — המילה `supported` לבדה אינה verdict קנוני. יש לציין תמיד **באיזה scope**, **על סמך איזה evidence**, ובאיזו רמת enablement.

---

## ‏9.2 Capability categories — לא כל מה שמופיע ב־Order Ticket הוא אותו סוג

‏ה־Capability Matrix משתמשת באותן שכבות של `00A`:

```text
BROKER ORDER PRIMITIVE
TIME / FILL POLICY
DISPLAY / LIQUIDITY ATTRIBUTE
TRIGGER / PREDICATE
COMPOSITE / DEPENDENCY RELATIONSHIP
ROUTING POLICY
BROKER ALGO
APPLICATION BEHAVIOR CANDIDATE
```

‏דוגמאות:

```text
Limit                 -> Broker Order Primitive
IOC                   -> Time / Fill Policy
Post Only             -> Liquidity Attribute
Bracket               -> Composite Structure
OCA                    -> Coordination Relationship
SMART / Direct        -> Routing Policy
Adaptive / MidPrice   -> Broker-managed execution mechanism / Algo
MARKETABLE_LIMIT_IOC  -> Behavior Candidate של המנוע
```

‏`Marketable Limit` נשארת לפי ההגדרה הקנונית **Limit שנמצאת כרגע במצב marketable**, לא Broker enum נפרד.

---

## ‏9.3 Capability היא Tuple, לא Checkbox

‏Capability key מקצועי נראה רעיונית כך:

```text
(
  capability_id,
  product,
  contract,
  region,
  adapter,
  route,
  destination,
  session,
  account_scope,
  legal_entity,
  permissions,
  parameter_combination
)
```

‏לכן:

```text
RELATIVE + SMART
```

‏אינה אותה Capability כמו:

```text
RELATIVE + DIRECT(destination)
```

‏ו־:

```text
PEGGED_MIDPOINT + DIRECT(destination)
```

‏אינה alias של:

```text
MIDPRICE + SMART
```

---

## ‏9.4 שלושה צירים שונים: Availability, Evidence, Enablement

### ‏`Availability`

‏האם feature מתועדת או נראית זמינה ב־scope מסוים.

```text
DOCUMENTED_AVAILABLE
DOCUMENTED_UNAVAILABLE
DOCUMENTED_CONDITIONAL
UNKNOWN
```

### ‏`Evidence`

‏מה ראינו בפועל:

```text
DOC_EVIDENCE
RUNTIME_EVIDENCE
PAPER_EVIDENCE
LIVE_EVIDENCE
REJECTION_EVIDENCE
```

### ‏`Enablement`

‏מה המערכת שלנו מרשה:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

‏אלה אינם synonyms.

‏לדוגמה:

```text
documented_availability = DOCUMENTED_AVAILABLE
runtime_state            = RUNTIME_CONFIRMED
enablement_state         = PAPER_ACCEPTED
```

‏משמעותו: ה־feature קיימת ונראית חוקית, אבל עדיין **אינה** Production capability של המערכת שלנו.

---

## ‏9.5 `Research Role` היא החלטת Product/Research נפרדת

‏נשתמש ב־classification כגון:

```text
CORE_BASELINE
CORE_SAFETY
RESEARCH_CHALLENGER
SPECIALIST_CONDITIONAL
REFERENCE_ONLY
OUT_OF_SCOPE
```

‏זהו ציר אחר לחלוטין מ־enablement.

‏אפשר לקבל:

```text
research_role    = CORE_BASELINE
enablement_state = PAPER_ACCEPTED
```

‏כלומר חשוב לנו מאוד לחקור אותו, אך עדיין אסור להפעילו Production.

‏ואפשר לקבל:

```text
research_role    = REFERENCE_ONLY
enablement_state = RUNTIME_CONFIRMED
```

‏כלומר Broker עשוי לתמוך בו, אבל הוא אינו חלק מה־roadmap של המנוע.

---

## ‏9.6 תאריך וגבולות האימות

> ‏`FACT` — אימות מטריצת המקור: `2026-10-27`.

‏העובדות המוצריות בפרק מבוססות על התיעוד הרשמי שכבר נאסף בקורס. הן אומרות מה IBKR מתעדת ברמת Product/Platform/API — **לא** שהחשבון, ה־contract, ה־route וה־adapter שלנו עברו acceptance test לכל combination.

‏אין להסיק:

```text
IBKR global docs say available
=> our account + contract + route + API accepts it
=> production safe
```

---

## ‏9.7 Core Price + Time/Fill Matrix

| Capability | שכבה קנונית | מניות US לפי התיעוד שנבדק | Routing / Scope | Caveat מרכזי | Research Role |
|---|---|---|---|---|---|
| `Market` | Broker Primitive | ‏כן | SMART / Direct לפי scope | ‏Price certainty נמוכה יותר; broker protections יכולים להשפיע | `SPECIALIST_CONDITIONAL` |
| `Limit` | Broker Primitive | ‏כן | SMART / Direct | ‏Fill אינו מובטח | `CORE_BASELINE` |
| `Marketable Limit` | Limit behavior | ‏כן דרך `Limit` | SMART / Direct | ‏אינה primitive נפרדת; remainder יכולה לנוח בלי `IOC` | `CORE_BASELINE` |
| `DAY` | TIF | ‏כן | לפי Order/path | ‏אינה `application_order_ttl` | `CORE_BASELINE` |
| `GTC` | TIF | ‏כן | לפי scope | ‏stale/recovery risk | `REFERENCE_ONLY` ל־core entry |
| `GTD` | TIF | ‏כן לפי scope | לפי Order/path | ‏Broker expiry אינה sub-second app TTL | `SPECIALIST_CONDITIONAL` |
| `IOC` | TIF / Fill Policy | ‏כן | SMART / Direct לפי scope | ‏Partial-now + cancel remainder | `CORE_BASELINE` |
| `FOK` | Fill Policy | ‏לא baseline למניות US לפי התיעוד שנבדק | Product-dependent | ‏לא להניח stock availability בגלל enum כללי | `OUT_OF_SCOPE` כרגע |
| `AON` | Fill/Quantity Constraint | ‏כן לפי scope | SMART בתרחיש המתועד | ‏יכולה להיות Broker-Simulated | `SPECIALIST_CONDITIONAL` |
| `MinQty` | Fill/Quantity Constraint | ‏תלוי Contract/Route | Venue/path-dependent | ‏דורש runtime + acceptance validation | `RESEARCH_CHALLENGER` |
| `Market-to-Limit` | Broker Primitive / Transforming behavior | ‏כן לפי התיעוד שנבדק | SMART / Direct לפי scope | ‏remainder הופכת ל־Limit לאחר execution ראשוני | `RESEARCH_CHALLENGER` |

---

## ‏9.8 `FOK` — Concept יכול להיות מקצועי גם אם Product path אינו Core

‏הטעות היא להפוך:

```text
concept exists
```

‏ל־:

```text
US-stock adapter may use it
```

‏לכן Adapter מניות לא יציע:

```text
stock_execution_mode = FOK
```

‏רק מפני שהמונח או enum קיימים בעולם המסחר.

‏ה־concept נשאר בקורס; Product capability עוברת Gate נפרד.

---

## ‏9.9 `AON` — Availability אינה אומרת Venue-Native

‏בתרחיש המתועד למניות US, IBKR יכולה לנהל/לדמות `AON` כאשר ה־primary exchange אינה מספקת native behavior מתאים.

‏לכן Capability Record חייב לשמור בנפרד:

```text
available = true
implementation_owner = BROKER_MANAGED_OR_SIMULATED
venue_native = false_or_unknown
```

‏עמודת `Supported` יחידה הייתה מוחקת מידע קריטי על failure domain, latency ו־market-data dependency.

---

## ‏9.10 Liquidity / Price-Adaptive Matrix

| Capability | שכבה קנונית | Routing / Implementation | Caveat מרכזי | Research Role |
|---|---|---|---|---|
| `Post Only` | Liquidity Attribute | Route-specific Broker/Venue behavior | ‏field קיים אינו הוכחת acceptance לכל destination | `CORE_SAFETY` / passive guardrail |
| `Hidden` | Display Attribute | SMART/Direct; Native או Broker-Simulated לפי path | ‏priority/latency משתנים לפי venue/path | `SPECIALIST_CONDITIONAL` |
| `Iceberg / Reserve` | Display/Quantity Attribute | Broker/Venue managed | ‏slice/replenishment semantics | `SPECIALIST_CONDITIONAL` |
| `Relative / Pegged-to-Primary` | Dynamic Pricing Primitive/Variant | SMART / Direct / ATS לפי path | ‏SMART ו־Directed אינן semantics זהות | `RESEARCH_CHALLENGER` |
| `Pegged-to-Midpoint` | Dynamic Pricing Primitive/Variant | Direct / ATS לפי path | ‏destination capability היא חלק מה־feature | `RESEARCH_CHALLENGER` |
| `MidPrice` | Broker Algo / Mechanism | SMART | ‏execution path יכול להשתנות | `RESEARCH_CHALLENGER` |
| `Snap to Market` | One-shot Dynamic Pricing Primitive/Variant | Broker-Simulated לפי התיעוד שנבדק | ‏מחיר מחושב פעם אחת ועלול להתיישן | `SPECIALIST_CONDITIONAL` |
| `Snap to Midpoint` | One-shot Dynamic Pricing Primitive/Variant | Broker-Simulated | ‏stale fixed price / no-fill | `RESEARCH_CHALLENGER` |
| `Snap to Primary` | One-shot Dynamic Pricing Primitive/Variant | Direct לפי scope; Broker-Simulated | ‏destination + stale-price risk | `SPECIALIST_CONDITIONAL` |
| `IBKR ATS Pegged-to-Best` | ATS-specific Dynamic Pricing | Directed to IBKR ATS | ‏ATS-specific semantics | `SPECIALIST_CONDITIONAL` |
| `IBKR ATS Pegged-to-Midpoint` | ATS-specific Dynamic Pricing | Directed to IBKR ATS | ‏destination-specific semantics | `SPECIALIST_CONDITIONAL` |

---

## ‏9.11 `Relative` — Route היא חלק מה־Capability Key

‏Capability cache לא תכתוב:

```text
RELATIVE = true
```

‏אלא משהו בסגנון:

```text
RELATIVE:SMART
RELATIVE:DIRECT:<destination>
RELATIVE:IBKR_ATS
```

‏משום ש־route יכולה לשנות את repricing semantics עצמן, לא רק את מקום הביצוע.

---

## ‏9.12 `Pegged-to-Midpoint` מול `MidPrice` — אותו objective חלקי, Capability שונה

```text
PEGGED_TO_MIDPOINT:
    category = dynamic-pricing primitive/variant
    routing  = DIRECT / ATS path
    behavior = venue/path-specific

MIDPRICE:
    category = broker-managed algo/mechanism
    routing  = SMART
    behavior = broker-selected execution path
```

‏אם Adapter מתרגם את שתיהן ל־`MIDPOINT`, הוא מוחק route, control delegation ו־failure semantics.

---

## ‏9.13 `Snap` — Implementation Path חייב להיות Field

‏בתיעוד שנבדק, משפחת `Snap` מנוהלת כ־Broker-Simulated behavior.

‏לכן נשמור בנפרד:

```text
implementation_owner = BROKER
implementation_kind  = BROKER_SIMULATED
residency             = verify_per_path
```

‏ולא נסיק מ־`Broker-Simulated` שה־Order בהכרח `Broker-Resident` בכל failure scenario. ‏Simulation ו־Residency הם dimensions שונים.

---

## ‏9.14 Stops / Protection / Relationships Matrix

| Capability | שכבה קנונית | Implementation / Routing | Caveat מרכזי | Research Role |
|---|---|---|---|---|
| `Stop` | Trigger + Market-style post-trigger execution | Native או Broker-Simulated לפי path | ‏Trigger price אינה Fill price | `CORE_SAFETY` |
| `Stop Limit` | Trigger + Limit-style post-trigger execution | Path-dependent | ‏Triggered-but-unfilled risk | `SPECIALIST_CONDITIONAL` |
| `Trailing Stop` | Moving Trigger | Broker/Venue path-dependent | ‏noise / premature trigger | `RESEARCH_CHALLENGER` |
| `Trailing Stop Limit` | Moving Trigger + Limit post-trigger | Path-dependent | ‏Position יכולה להישאר לאחר trigger | `RESEARCH_CHALLENGER` |
| `Adjustable Stop` | Transforming Order | Broker-managed transformation | ‏one-time transition semantics | `SPECIALIST_CONDITIONAL` |
| `Conditional` | Predicate / Dependency | Broker-managed or simulated לפי path | ‏market-data / residency implications | `SPECIALIST_CONDITIONAL` |
| `Bracket` | Composite Order Structure | parent/children + transmit semantics | ‏partial/race/recovery semantics | `CORE_SAFETY` |
| `OCA/OCO` | Coordination Relationship | `ocaGroup` / `ocaType` path | ‏coordination is not atomic | `CORE_SAFETY` |

---

## ‏9.15 `Bracket` מקבלת Production Gate קשוח יותר

‏`Bracket` יכולה להיות documented available ובכל זאת להישאר:

```text
enablement_state = PAPER_ACCEPTED
```

‏עד שנבדקו במפורש לפחות:

```text
parent full fill
parent partial fill
parent cancel + late fill
child activation timing
child rejection
TP partial
stop trigger
sibling cancel race
double-exit prevention
manual position change
disconnect/reconnect
process restart
```

> ‏`ACCEPTANCE TEST REQUIRED` — Parent partial-fill child activation נשארת unresolved עבור ה־API/Product/Route הספציפיים עד evidence אמפירי. Availability בתיעוד אינה פותרת את ה־semantics הזו.

---

## ‏9.16 `OCA/OCO` — Coordination Capability, לא Atomic Guarantee

‏Capability Record צריך להיות מסוגל לשמור safety properties כגון:

```text
atomic_cancel = false
late_sibling_fill_possible = true
reconciliation_required = true
```

> ‏`ENGINE INVARIANT` — sibling שנמצא ב־pending cancel נשאר potentially executable עד terminal broker evidence.

‏כך אזהרה מקצועית הופכת לחלק מה־machine-readable contract.

---

## ‏9.17 Routing ו־Broker Algo — שתי קטגוריות נפרדות

| Capability | שכבה קנונית | מי מחזיק את ההחלטה | Research Role |
|---|---|---|---|
| `SMART` | Routing Policy | IBKR בוחרת destination במסגרת ה־router | `CORE_BASELINE` |
| Direct Routing | Routing Policy | המנוע בוחר destination | `SPECIALIST_CONDITIONAL` |
| `SMART DarkOnly` | Routing Variant | IBKR בתוך universe מוגבל | `SPECIALIST_CONDITIONAL` |
| `IBKR ATS` | Destination | destination ייעודי | `SPECIALIST_CONDITIONAL` |
| `Adaptive` | Broker Algo | IBKR מנהלת speed/price search | `RESEARCH_CHALLENGER` |
| `MidPrice` | Broker Algo / Mechanism | IBKR מנהלת midpoint-oriented path | `RESEARCH_CHALLENGER` |
| `VWAP/TWAP/POV` | Broker Algos | Broker scheduling/participation logic | `REFERENCE_ONLY` כרגע |
| `Accumulate/Distribute` | Broker Algo | Broker/TWS slicing logic | `REFERENCE_ONLY` כרגע |

‏אין enum קנוני כזה:

```text
route = SMART | DIRECT | IB_ALGO
```

‏`RoutingPlan` ו־`BrokerAlgoPlan` נשארים אובייקטים נפרדים כפי שנקבע בחלק 7.

---

## ‏9.18 `Adaptive` — Capability צריכה לתאר גם Parameters

‏רשומה בסגנון:

```text
ADAPTIVE = supported
```

‏אינה מספיקה.

‏נרצה dimensions כגון:

```text
base_order_primitive = MARKET | LIMIT
adaptive_priority    = URGENT | NORMAL | PATIENT
economic_price_bound_required_by_policy
application_order_ttl
routing_requirement
```

‏`ADAPTIVE_LIMIT_URGENT` ו־`ADAPTIVE_MARKET_PATIENT` אינן אותה Behavior Candidate רק משום שהן משתמשות באותו Algo.

---

## ‏9.19 `TWS API` Runtime Discovery

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏`ContractDetails` כולל בין היתר metadata כגון:

```text
orderTypes
validExchanges
```

‏זו evidence שימושית ל־runtime capability discovery.

‏אבל:

```text
orderTypes contains X
```

‏אינו מוכיח שכל combination של:

```text
X + TIF + attributes + route + session + account
```

‏יתקבל.

---

## ‏9.20 `Web API` Runtime Rules

> ‏`FACT` — אימות אחרון: `2026-10-27`.

‏ב־Contract Rules שתועדו ב־Web API קיימים metadata fields כגון:

```text
orderTypes
ibAlgoTypes
tifTypes
orderTypesOutside
algoEligible
allOrNoneEligible
displaySize
fraqTypes
cqtTypes
```

‏זה מאפשר Adapter שבונה capability view פר Contract במקום להניח feature flags גלובליים.

---

## ‏9.21 `TWS API` ו־Web API אינם אותו Capability Surface

‏אסור להסיק:

```text
TWS field exists
=> identical Web API field
=> identical lifecycle
=> identical error behavior
```

‏לכן:

```text
adapter = TWS_API
```

‏ו־:

```text
adapter = WEB_API
```

‏הם חלק מ־Capability Key, ולא רק implementation detail.

---

## ‏9.22 `CapabilityRecord` קנוני

```text
CapabilityRecord {
  broker

  // identity / scope
  capability_id
  capability_category
  product
  sec_type
  region
  conid
  symbol
  adapter
  account_scope
  legal_entity
  permission_scope
  session

  // execution path
  routing_policy
  destination
  broker_algo
  parameter_constraints
  tif_values
  attributes
  outside_rth

  // implementation dimensions
  implementation_owner
  implementation_kind      // VENUE_NATIVE | BROKER_SIMULATED | BROKER_ALGO | COMPOSITE | CLIENT_MANAGED | MIXED
  residency_state          // VERIFIED_BROKER_RESIDENT | CLIENT_DEPENDENT | UNKNOWN

  // evidence
  documented_availability
  documented_platforms
  runtime_evidence
  acceptance_evidence
  rejection_history
  last_verified_at
  source_version

  // our policy
  research_role
  enablement_state
  disable_reason
  notes
}
```

‏ה־Record נראה עשיר יותר מ־`supportsIOC=true`, אבל הוא מונע בדיוק את סוג ה־false assumptions שמסוכנים ב־advanced orders.

---

## ‏9.23 Capability Key חייב לכלול Route כאשר Route משנה Semantics

‏דוגמאות:

```text
RELATIVE:SMART
RELATIVE:DIRECT:NASDAQ
PEGGED_MID:DIRECT:NASDAQ
PEGGED_MID:IBKR_ATS
MIDPRICE:SMART
```

‏אם route/destination משנות pricing, activation, support או ownership semantics — הן חלק מה־identity של capability.

---

## ‏9.24 Session היא חלק מה־Capability

‏לא מעתיקים enablement אוטומטית בין:

```text
REGULAR
PRE_MARKET
AFTER_HOURS
OVERNIGHT
```

‏Order שזמינה ב־RTH אינה בהכרח מקבלת אותם trigger, liquidity, route או outside-hours rules בסשן אחר.

‏`orderTypesOutside` ב־Web API היא דוגמה לכך שה־Broker עצמו מפריד את ה־scope הזה.

---

## ‏9.25 Account / Legal Entity / Permissions הם חלק מה־Scope

‏תיעוד מוצר גלובלי אינו תחליף ל־account-specific evidence.

‏Production gate כולל לפחות:

```text
account legal entity
trading permissions
contract eligibility
route eligibility
API adapter
paper behavior
small-live behavior
```

‏לכן ניסוח קנוני הוא:

```text
Documented available in IBKR product docs
```

‏ולא:

```text
Supported in our account
```

‏עד שיש evidence מתאימה.

---

## ‏9.26 Startup Capability Discovery

‏ב־startup או בתחילת session:

```text
1. identify account / adapter / environment
2. resolve contract
3. fetch runtime contract metadata
4. normalize broker primitives
5. normalize TIF / fill policies
6. normalize attributes
7. normalize routes / destinations
8. normalize broker algos
9. attach static documented caveats
10. compare with last-known snapshot
11. freeze features whose assumptions changed materially
```

‏Capability Discovery היא **validation layer**, לא Decision Engine.

---

## ‏9.27 Capability Cache צריכה Freshness ו־Version

‏לא נשמור:

```text
supports_midprice = true forever
```

‏אלא לפחות:

```text
verified_at
source_version
broker_software_version_if_relevant
adapter
account_scope
contract
route
session
```

‏Capabilities הן time-dependent operational data.

---

## ‏9.28 Broker Rejection היא Evidence, לא רק Log

‏אם runtime metadata צפתה שה־feature זמינה אבל submit נדחתה, נרשום:

```text
expected_availability
broker_result = REJECTED
reason_code
contract
route
destination
adapter
session
payload_shape
```

‏ואפשר להעביר את הרשומה למצב כגון:

```text
RUNTIME_CONFLICT
```

‏עד בירור.

‏Rejection אחת אינה בהכרח הוכחה שה־feature נעלמה גלובלית; היא evidence עבור scope מסוים.

---

## ‏9.29 `AVAILABLE` אינה `ENABLED`

‏זה ה־guard המרכזי של הפרק:

```text
Documented Available
    ↓
Runtime Confirmed
    ↓
Paper Accepted
    ↓
Live Small Accepted
    ↓
Production Enabled
```

‏Feature יכולה להיות זמינה לחלוטין אצל Broker ועדיין להיות:

```text
enablement_state = DOC_ONLY
```

‏משום שהמערכת שלנו עוד לא הוכיחה lifecycle, telemetry, recovery או safety semantics.

---

## ‏9.30 Fallback לעולם אינו `Unsupported -> More Aggressive`

‏אם Candidate נדחתה או אינה זמינה:

```text
capability failure
```

‏המנוע חוזר ל־fresh decision:

```text
is signal still valid?
what is current urgency?
what is current Economic Price Bound?
how much qty is already filled or potentially executable?
what alternatives are enabled now?
```

> ‏`ENGINE RULE` — Capability failure מפעיל elimination + re-decision. הוא אינו synonym ל־Market Order, אינו escalation אוטומטי ואינו עוקף את ה־Economic Price Bound.

---

## ‏9.31 Acceptance Gate לפי Family

| Family | Minimum acceptance evidence לפני Production |
|---|---|
| Core `MKT/LMT/IOC` | ‏full/partial/no-fill, rejection, cancel race, Economic Price Bound, reconnect |
| Passive / Post Only | ‏marketable-at-arrival behavior, reject/reprice path, route-specific semantics |
| Hidden / Reserve | ‏native/simulated owner, slice/remainder behavior, cancel/recovery |
| Pegged / Relative | ‏reference moves, bound reached, route semantics, broker-managed repricing אחרי stale signal |
| Midpoint / Snap | ‏midpoint movement, no-fill, stale Snap, route rejects, TTL cancel |
| Stops | ‏trigger method, gap, trigger-vs-fill, session behavior, implementation owner |
| Bracket / OCA | ‏partial parent, child rejection, sibling race, reconnect, double-exit defense, ownership |
| Broker Algos | ‏parameter behavior, app TTL, partial fills, cancel/reconnect, decision-return conditions |
| Direct / ATS | ‏destination acceptance, actual fill venue, fees, no-liquidity/reject handling |

---

## ‏9.32 `PAPER_ACCEPTED` אינה הוכחה ל־Live Microstructure

‏Paper environment שימושית ל־:

```text
payload validation
state machine
basic callbacks
rejection handling
reconciliation paths
```

‏אבל אינה מוכיחה במלואה:

```text
real queue position
real hidden liquidity
real venue latency
real maker/taker economics
real adverse selection
all production routing behavior
```

‏לכן `PAPER_ACCEPTED` היא Gate חשובה — לא סוף תהליך האימות.

---

## ‏9.33 `LIVE_SMALL_ACCEPTED` מאמתת Semantics, לא Profitability

‏המטרה היא לבדוק בסיכון מוגבל:

```text
broker acceptance
actual callbacks
actual routing behavior
fill decomposition
cancel/modify races
fee data
reconnect behavior
```

‏הצלחה אינה הוכחה שה־Signal רווחי. היא evidence שה־execution capability מתנהגת כפי שהמערכת מצפה.

---

## ‏9.34 Enablement Matrix ראשונית למנוע

| Capability / Behavior | Research Role | Production Gate מרכזי |
|---|---|---|
| Passive `LMT` + app TTL | `CORE_BASELINE` | ‏state machine + cancel race |
| `MARKETABLE_LIMIT_IOC` | `CORE_BASELINE` | ‏partial/no-fill + Economic Price Bound |
| `SMART` | `CORE_BASELINE` routing | ‏venue/fill telemetry |
| `Post Only` | `CORE_SAFETY` passive guardrail | ‏route-specific acceptance |
| `Stop` backstop | `CORE_SAFETY` | ‏trigger/gap/session/residency tests |
| `Bracket / Hybrid Protection` | `CORE_SAFETY` / challenger architecture | ‏Part 6 Failure Matrix |
| `Relative/Pegged-to-Primary` | `RESEARCH_CHALLENGER` | ‏SMART/Directed semantics בנפרד |
| `MidPrice` | `RESEARCH_CHALLENGER` | ‏fill/no-fill + TTL + path telemetry |
| Directed `Pegged-to-Midpoint` | `RESEARCH_CHALLENGER` | ‏destination-specific acceptance |
| `Snap to Midpoint` | `RESEARCH_CHALLENGER` | ‏stale-price + TTL |
| `Adaptive Limit Urgent/Normal` | `RESEARCH_CHALLENGER` | ‏algo availability + cancel/reconnect |
| Hidden / Reserve | `SPECIALIST_CONDITIONAL` | ‏רק עם footprint/display hypothesis |
| ATS-specific Pegged | `SPECIALIST_CONDITIONAL` | ‏ATS-specific evidence |
| AON / MinQty | `SPECIALIST_CONDITIONAL` | ‏רק אם partial-fill economics מצדיקות |
| FOK for US-stock core | `OUT_OF_SCOPE` כרגע | ‏לא להניח stock path |
| Long-horizon scheduling algos | `REFERENCE_ONLY` | ‏רק אם horizon/size משתנים |

---

## ‏9.35 ה־Scanner לא צריך לדעת Broker Enums

‏Signal/Scanner layer מוציאה Intent כגון:

```text
urgency
signal_ttl
expected_edge
max_position
partial_fill_tolerance
```

‏Execution Engine משתמשת ב־Intent יחד עם Capability Matrix כדי לסנן implementation candidates.

‏כך שינוי ב־Broker capability אינו משנה את ה־Signal model.

---

## ‏9.36 `Capability Resolver` מסנן; הוא לא בוחר Winner

```text
Intent
  ↓
Application Execution Mode
  ↓
Behavior Candidates
  ↓
Capability Resolver
  ↓
eliminate unavailable / unaccepted combinations
  ↓
Decision Engine compares survivors
  ↓
Concrete Broker Plan
```

> ‏`ENGINE RULE` — Capability Resolver עונה **מה מותר לשקול**. הוא אינו עונה **מה עדיף כלכלית** ואינו מחליף את Decision Engine.

---

## ‏9.37 Capability Matrix היא Kill Switch ממוקד

‏אם feature מסוימת מתחילה להידחות:

```text
ADAPTIVE = DISABLED_RUNTIME_CONFLICT
MIDPRICE = PAPER_ACCEPTED
MARKETABLE_LIMIT_IOC = PRODUCTION_ENABLED
```

‏המערכת יכולה להסיר Candidate אחת בלי להעמיד פנים שכל Broker connectivity נשברה.

‏לעומת זאת, failure של capability safety-critical — למשל path של protective order שעליו נשענת הארכיטקטורה — יכולה לחסום Entries חדשות לחלוטין.

---

## ‏9.38 Telemetry קנונית ל־Capability

```text
capability_id
capability_category
adapter
account_scope
legal_entity
conid
route
destination
session
documented_availability
runtime_state
enablement_state
research_role
implementation_owner
implementation_kind
residency_state
last_verified_at
source_version
submit_attempts
accept_count
reject_count
last_reject_code
last_reject_message
paper_test_version
live_test_version
disable_reason
```

‏ומדדים:

```text
reject_rate_by_capability
runtime_doc_mismatch_rate
capability_change_events
fallback_rate
production_disable_events
```

---

## ‏9.39 Freshness Policy

‏Capabilities שתלויות ב־Broker אינן Specification פנימית נצחית.

‏נגדיר לפחות:

```text
verify docs before major release
refresh runtime contract capabilities at startup/session boundary
invalidate cache on relevant broker/config change
record last_verified_at
```

‏במקרה של conflict:

```text
fresh broker evidence > stale local cache
```

‏אבל evidence מקומית אינה מורחבת אוטומטית ל־scope אחר.

---

## ‏9.40 `UI Support` ו־`API Support` הן Evidence שונות

‏Order שמופיעה ב־TWS אינה הוכחה שה־Web API exposes אותה semantics.

‏ושדה API שקיים אינו הוכחה שה־UI, route או account שלנו מאפשרים אותו.

‏לכן נשמור בנפרד:

```text
manual_ui_evidence
tws_api_evidence
web_api_evidence
runtime_broker_evidence
```

‏ולא שדה יחיד בשם `IBKR_SUPPORTED`.

---

## ‏9.41 `API Field Exists` אינה Capability Proof

‏אם `Order` object מכיל:

```text
allOrNone
minQty
displaySize
hidden
postOnly
```

‏זה מוכיח שה־API model יודע לייצג שדה.

‏הוכחה חזקה יותר ל־Capability דורשת:

```text
documented applicability
+
runtime contract/route evidence
+
broker acceptance
+
observed semantics
```

‏וב־Production נדרשות גם telemetry/recovery/safety acceptance.

---

## ‏9.42 Implementation Owner ו־Residency אינם אותו שדה

‏נבדיל בין:

```text
implementation_kind:
  VENUE_NATIVE
  BROKER_SIMULATED
  BROKER_ALGO
  COMPOSITE_RELATIONSHIP
  CLIENT_MANAGED
  MIXED
```

‏לבין:

```text
residency_state:
  VERIFIED_BROKER_RESIDENT
  CLIENT_DEPENDENT
  UNKNOWN
```

‏פקודה יכולה להיות Broker-Simulated בלי שהקורס יניח אוטומטית survivability מסוים לאחר disconnect/restart.

‏זה משפיע על:

```text
latency
survivability
market-data dependency
cancel behavior
queue behavior
failure domain
recovery contract
```

---

## ‏9.43 Research Allowlist ראשונית

‏ל־Research Harness אפשר לשקול מוקדם, בכפוף ל־enablement המתאים:

```text
LIMIT
PASSIVE_JOIN
PASSIVE_POST_ONLY
MARKETABLE_LIMIT_IOC
SMART
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
ADAPTIVE_LIMIT_URGENT
ADAPTIVE_LIMIT_NORMAL
```

‏ול־Protection Research:

```text
STOP
STOP_LIMIT
BRACKET
OCA
HYBRID_PROTECTION
```

‏המילה `allowlist` כאן פירושה **מותר למחקר בשלב שה־environment מאפשר**, לא `PRODUCTION_ENABLED`.

---

## ‏9.44 מה לא נכנס אוטומטית ל־Allowlist

```text
FOK for stocks
AON as default
Hidden as default
Reserve/Iceberg as default
DarkOnly as default
ATS-specific pegged as default
long-horizon scheduling algos
```

‏לא משום שהן "גרועות", אלא משום שהן פותרות Problems אחרים או דורשות evidence נוספת.

---

## ‏9.45 Practitioner Secrets — מה שמטריצת Support רגילה מפספסת

### ‏1. `Support` הוא Tuple

```text
(feature, product, route, destination, session, adapter, account, parameters)
```

### ‏2. `AVAILABLE != PRODUCTION_ENABLED`

‏Broker availability אינה system readiness.

### ‏3. `Research Priority != Capability Evidence`

‏Candidate חשובה למחקר יכולה עדיין להיות `DOC_ONLY`.

### ‏4. `Marketable Limit` אינה Broker enum נפרד

‏זו marketability של Limit מול market snapshot.

### ‏5. `Bracket` אינה Primitive

‏היא graph ולכן ה־Gate שלה בודק relationships, quantities, races ו־recovery.

### ‏6. `SMART` היא Routing Policy

‏לא Price Order Type ולא Broker Algo.

### ‏7. `Adaptive` היא Delegation

‏Broker מנהל חלק מה־HOW; המנוע עדיין מחזיק את ה־WHETHER ואת ה־signal clock.

### ‏8. Broker-Simulated אינו בהכרח רע

‏אבל הוא משנה failure domain ואינו synonym של Broker-Resident.

### ‏9. UI אינה API

‏Manual availability אינה programmatic parity.

### ‏10. Runtime metadata אינה Truth מוחלטת

‏Combination/account/route אמיתי עדיין יכול להידחות.

### ‏11. Paper אינה Live

‏היא בודקת correctness רב, לא את כל ה־microstructure האמיתי.

### ‏12. Fallback הוא Fresh Decision

‏Capability failure אינה הרשאה להגדיל אגרסיביות.

### ‏13. Capability יכולה להשתנות בזמן

‏Cache חייבת freshness/versioning.

### ‏14. Feature Production היא יותר משם Order

```text
semantics
+ capability evidence
+ tests
+ telemetry
+ recovery
+ safety invariants
= production capability
```

---

# ‏מקורות רשמיים לחלק 9

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR TWS API — `ContractDetails` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/contract-details>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR Web API — Place Order: <https://www.interactivebrokers.com/docs/web-api/v1/endpoints/orders/place-order>
- ‏IBKR Web API — Contract Rules: <https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-contract-rules>
- ‏IBKR TWS API — Modifying Orders: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/modifying-orders>

---

# ‏Checkpoint — סוף חלק 9

‏בחלק הזה הפכנו את המושג `Supported` למודל מדויק יותר: **Capability היא Tuple עם scope, implementation dimensions, evidence ו־enablement state**. הפרדנו `Availability` מ־`Research Role` ומ־`Production Enablement`; יישרנו את המטריצה ל־taxonomy של Broker Primitive, TIF/Attribute, Trigger/Composite, Routing ו־Broker Algo; והבהרנו ש־Capability Resolver רק מסנן Candidates — הוא אינו בוחר את ה־Winner.

‏הכלל החשוב ביותר הוא:

```text
AVAILABLE != PRODUCTION_ENABLED
```

‏תיעוד אומר מה אפשר לבדוק; runtime metadata ו־Broker acceptance נותנים evidence לגבי ה־scope הנוכחי; ורק acceptance tests, telemetry, recovery ו־risk invariants מאפשרים לקדם feature ל־`PRODUCTION_ENABLED`.

‏החלק הבא יהיה **חלק 10 — Engine Decision Guide**: נחבר Signal state, urgency, spread/depth, expected edge, remaining signal life, position/fill state, exit feasibility ו־capabilities למנגנון החלטה שמסנן Candidates ובוחר Execution Behavior בהתאם ל־state.