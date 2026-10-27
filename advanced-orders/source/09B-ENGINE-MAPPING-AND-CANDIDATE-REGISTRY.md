# ‏חלק 9B — Engine Mapping & Candidate Registry: מ־Intent ל־Broker Materialization

> ‏הפרק הזה הוא שכבת החיבור בין ה־taxonomy של הקורס, ה־Capability Matrix של Part 9 וה־Decision Engine של Part 10. מטרתו אינה לבחור איזו Candidate "טובה יותר", אלא להגדיר באופן machine-readable **איך Candidate מותרת למנוע יכולה להפוך ל־Concrete Broker Order Plan** — ורק לאחר שכל שכבות ה־Capability וה־enablement עברו.

---

## ‏9B.1 הבעיה שה־Registry פותר

‏בלי שכבת mapping מפורשת קל מאוד להגיע לקוד מסוג:

```text
if order_type == "MIDPRICE": ...
if order_type == "ADAPTIVE": ...
if route == "SMART": ...
```

‏ואז Order Type, ‏Execution Mode, ‏Route ו־Broker Algo הופכים בפועל ל־enum שטוח אחד.

‏ה־contract הקנוני הוא:

```text
Trade Intent
→ Application Execution Mode
→ Behavior Candidate
→ Materialization Requirements
→ Capability Resolver
→ Concrete Broker Order Plan
```

> ‏`ENGINE RULE` — `Capability Resolver` רשאית להסיר Candidates שאינן כשירות. היא אינה רשאית לבחור את ה־winner מבין Candidates שנותרו.

---

## ‏9B.2 ארבע שכבות שאסור לאחד

```text
Application Execution Mode
Behavior Candidate
Broker Materialization
Capability / Enablement
```

‏לדוגמה:

```text
ApplicationExecutionMode = AGGRESSIVE_CAPPED
BehaviorCandidate        = MARKETABLE_LIMIT_IOC
BrokerPrimitive          = LMT
BrokerTIF                = IOC
RoutingPolicy            = SMART
```

‏כאן `LMT`, ‏`IOC` ו־`SMART` אינם Mode.

‏בדוגמה אחרת:

```text
ApplicationExecutionMode = BROKER_MANAGED
BehaviorCandidate        = ADAPTIVE_LIMIT_URGENT
BrokerPrimitive          = LMT
RoutingPolicy            = SMART
BrokerAlgo               = Adaptive
AlgoPriority             = Urgent
```

‏גם כאן `Adaptive` אינה Route ו־`SMART` אינה Algo.

---

## ‏9B.3 `Candidate Registry` הוא Contract, לא Ranking Table

‏Registry מתאר Candidate; הוא אינו נותן לה Score ואינו מצהיר שהיא עדיפה על Candidate אחרת.

```text
CandidateDefinition {
  candidate_id
  supported_purposes[]
  allowed_execution_modes[]
  research_role
  rollout_state

  materialization_requirements {
    base_broker_primitive
    allowed_broker_tif[]
    required_attributes[]
    optional_attributes[]
    routing_requirement
    destination_requirement
    broker_algo_requirement
    parameter_requirements[]
  }

  policy_requirements {
    economic_price_bound_required
    application_order_ttl_required
    local_validity_watchdog_required
    partial_fill_requires_fresh_decision
  }

  capability_requirements[]
  failure_destination_profile
  telemetry_profile
}
```

‏ה־Registry עונה:

```text
How can this behavior be materialized safely?
```

‏הוא אינו עונה:

```text
Which surviving behavior should win now?
```

---

## ‏9B.4 Capability Enablement ו־Candidate Rollout הם שני צירים נפרדים

‏Capability enablement נשארת בדיוק כפי שנקבע ב־Part 9:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

‏Candidate rollout נשאר:

```text
DISABLED
SHADOW_ONLY
LIVE_ENABLED
```

‏אלה אינם אותו state machine.

‏דוגמה:

```text
capability.enablement_state = PRODUCTION_ENABLED
candidate.rollout_state     = SHADOW_ONLY
```

‏משמעותה:

```text
broker/path capability has enough evidence for production use
but our policy still evaluates this candidate without allowing live side effects
```

‏וההפך אינו חוקי ל־Live execution:

```text
candidate.rollout_state = LIVE_ENABLED
capability.enablement_state = PAPER_ACCEPTED
```

‏אינו נותן authorization למסחר חי.

> ‏`ENGINE INVARIANT` — Live materialization דורשת גם `candidate.rollout_state == LIVE_ENABLED` וגם שכל Capability requirement הרלוונטית תהיה `PRODUCTION_ENABLED` ב־scope המדויק.

---

## ‏9B.5 `SHADOW_ONLY` — Candidate קיימת בהחלטה, אבל לא ב־Side Effects

‏ב־Shadow המנוע רשאי:

```text
generate candidate
apply elimination gates
compute hypothetical materialization
record whether it would have won
measure expected/observed opportunity outcome
```

‏אבל אסור:

```text
submit broker order
modify live order because shadow candidate won
cancel live order solely to follow shadow candidate
change protection ownership
```

‏כך אפשר לחקור Candidate חדשה בלי לערבב research telemetry עם production authority.

---

## ‏9B.6 Mapping קנוני — Entry Behavior Candidates

| `Behavior Candidate` | `Application Execution Mode` | Broker primitive / mechanism | `TIF / Attribute` עיקרי | Routing / Algo requirement | הערת materialization |
|---|---|---|---|---|---|
| `PASSIVE_JOIN` | `PASSIVE` | `LMT` | בדרך כלל resting TIF; app TTL נפרד | SMART או Direct לפי capability | Limit במחיר passive שנבחר לפי placement policy |
| `PASSIVE_POST_ONLY` | `PASSIVE` | `LMT` | `POST_ONLY` / path-specific passive constraint | route-specific | Candidate נפסלת אם Post Only אינה `PRODUCTION_ENABLED` במסלול |
| `IMPROVE_ONE_TICK` | `PRICE_IMPROVING` | `LMT` | resting/short-lived לפי policy | SMART או Direct לפי capability | מחיר משופר אך לעולם לא מעבר ל־`Economic Price Bound` |
| `RELATIVE_PRIMARY` | `BROKER_MANAGED` | Relative / Pegged-to-Primary variant | broker/path-specific | SMART/Direct/ATS לפי capability | continuous external repricing; local TTL/cancel authority נשארת |
| `MIDPRICE` | `MIDPOINT_SEEKING` | broker-managed MidPrice mechanism | path-specific | `SMART` + MidPrice mechanism | Broker מנהל midpoint-oriented execution path |
| `SNAP_MIDPOINT` | `MIDPOINT_SEEKING` | Snap-to-Midpoint variant | Limit-like remainder לפי path | capability-specific | one-shot derived price; לא continuous peg |
| `PEGGED_MIDPOINT_DIRECT` | `MIDPOINT_SEEKING` | Pegged-to-Midpoint variant | path-specific | `DIRECT` + validated destination | destination היא חלק מ־Capability key |
| `ADAPTIVE_LIMIT_URGENT` | `BROKER_MANAGED` | `LMT` | broker TIF לפי plan | `SMART` + Adaptive/Urgent | Broker Algo מנהלת tactics; app TTL נשאר local |
| `ADAPTIVE_LIMIT_NORMAL` | `BROKER_MANAGED` | `LMT` | broker TIF לפי plan | `SMART` + Adaptive/Normal | אותו Algo family, Candidate policy שונה |
| `MARKETABLE_LIMIT_IOC` | `AGGRESSIVE_CAPPED` | `LMT` | `IOC` | SMART/Direct לפי capability | marketable behavior + hard `Economic Price Bound`; אינה primitive נפרדת |

> ‏`ENGINE RULE` — הטבלה היא mapping של **materialization requirements**, לא רשימת עדיפות ולא recommendation שה־Candidate מתאימה בכל מצב.

---

## ‏9B.7 Mapping של Research Challengers שנוספו ב־R3/R4

| Candidate / family | Mode / role | Materialization core | Requirement מרכזי | Rollout ברירת מחדל |
|---|---|---|---|---|
| `SWEEP_TO_FILL_LIMIT` | `AGGRESSIVE_CAPPED` challenger | Limit + Sweep-to-Fill behavior | SMART/path capability + Economic Price Bound | `SHADOW_ONLY` עד evidence |
| `MARKET_TO_LIMIT` | aggressive/transforming specialist | `MTL` transforming primitive | transformed remainder lifecycle + app TTL | `SHADOW_ONLY` |
| `DISCRETIONARY_LIMIT` | price-improving/liquidity specialist | Limit + discretionary executable range | exact route/API support + effective executable bound | `SHADOW_ONLY` |

‏ה־Registry יכולה להכיר Candidate גם כאשר היא אינה Live-enabled.

‏כך:

```text
known concept
!=
live production candidate
```

---

## ‏9B.8 Protection / Trigger / Composite אינם נדחסים ל־Entry Candidate Registry

‏משפחות כגון:

```text
Stop
Stop Limit
MIT
LIT
Trailing Stop
Bracket
OCA/OCO
Conditional
```

‏אינן כולן `Behavior Candidate` של Entry.

‏הן רשומות ב־Capability layer לפי הקטגוריה הקנונית שלהן:

```text
TRIGGER
TRANSFORMING ORDER
COMPOSITE STRUCTURE
COORDINATION RELATIONSHIP
PREDICATE POLICY
PROTECTION ARCHITECTURE
```

‏וה־Exit/Protection planner מחבר אותן ל־Concrete plans לפי Purpose ו־Ownership.

> ‏`ENGINE RULE` — לא מכניסים כל Broker feature ל־Candidate enum רק כדי שיהיה קל יותר לתכנת switch statement.

---

## ‏9B.9 `Capability Resolver` — Filter Pipeline בלבד

‏ה־Resolver מקבל Candidate + Context ומחזיר eligibility facts.

```text
CapabilityResolution {
  candidate_id
  eligible
  matched_capabilities[]
  unmet_capabilities[]
  elimination_reason_codes[]
  evidence_snapshot_ids[]
}
```

‏Pipeline טיפוסי:

```text
candidate known?
→ rollout state permits current environment?
→ product / contract scope matches?
→ adapter supports required materialization?
→ routing/destination requirement matches?
→ broker algo requirement matches?
→ TIF / attributes / parameter combination accepted?
→ session/account/legal-entity permissions match?
→ all required capabilities meet required enablement state?
→ eligible survivor
```

‏לאחר מכן Candidate חוזרת ל־Decision Engine להשוואה מול Survivors אחרים.

‏אסור ל־Resolver לבצע:

```text
eligible candidates = [A, B, C]
→ choose A because capability confidence is highest
```

‏Capability confidence יכולה להיות Gate או Evidence dimension; היא אינה execution objective.

---

## ‏9B.10 Production Gate — scope מדויק, לא feature name

‏הבדיקה אינה:

```text
is MIDPRICE production enabled?
```

‏אלא משהו בסגנון:

```text
is capability tuple for
MIDPRICE
+ US stock contract
+ selected adapter
+ SMART route
+ current session
+ current account/legal entity
+ required parameter combination
PRODUCTION_ENABLED?
```

‏כך נמנעת זליגה מסוכנת של enablement בין:

```text
paper → live
TWS API → Web API
SMART → Direct
regular session → overnight
one destination → another
one account/legal entity → another
```

---

## ‏9B.11 Mapping אינו One-to-One

‏אותה Broker primitive יכולה לממש Behaviors שונות.

```text
LMT
→ PASSIVE_JOIN
→ IMPROVE_ONE_TICK
→ MARKETABLE_LIMIT_IOC
→ ADAPTIVE_LIMIT_URGENT base primitive
```

‏ואותה semantic family יכולה לקבל materialization שונה לפי capability/path.

‏לכן אין function חוקית מסוג:

```text
ExecutionMode mapOrderTypeToMode(orderType)
```

‏ה־mapping צריך לקבל לפחות:

```text
purpose
behavior_candidate
market_state
policy
capability_resolution
```

‏וליצור `ConcreteOrderPlan` מפורש.

---

## ‏9B.12 `ConcreteOrderPlan` — הגבול לפני Adapter payload

```text
ConcreteOrderPlan {
  decision_id
  purpose
  application_execution_mode
  behavior_candidate

  quantity
  economic_price_bound
  application_order_ttl

  broker_primitive
  broker_tif
  attributes[]

  routing_plan
  broker_algo_plan

  capability_resolution_ids[]
  candidate_rollout_state
  failure_destination_profile
  reason_codes[]
}
```

‏ה־Adapter רשאי לתרגם Plan זה לשדות API קונקרטיים.

‏ה־Adapter אינו רשאי:

```text
change Behavior Candidate
widen Economic Price Bound
promote rollout state
replace SMART with Direct silently
add broker algo silently
turn rejection into a different aggressive order
```

‏שינויים כאלה חוזרים ל־Decision Engine.

---

## ‏9B.13 Reason Codes — Selection ו־Elimination נשמרים בנפרד

‏Reason Codes קנוניים בשכבה הזו מתחלקים לפחות ל־:

### ‏Eligibility / Capability

```text
CAPABILITY_NOT_PRODUCTION_ENABLED
CAPABILITY_SCOPE_MISMATCH
ROUTE_REQUIREMENT_UNMET
DESTINATION_REQUIREMENT_UNMET
BROKER_ALGO_REQUIREMENT_UNMET
TIF_REQUIREMENT_UNMET
ATTRIBUTE_REQUIREMENT_UNMET
PARAMETER_COMBINATION_UNVALIDATED
SESSION_SCOPE_MISMATCH
ACCOUNT_SCOPE_MISMATCH
ADAPTER_SCOPE_MISMATCH
```

### ‏Candidate rollout

```text
CANDIDATE_DISABLED
CANDIDATE_SHADOW_ONLY
CANDIDATE_NOT_ALLOWED_FOR_PURPOSE
```

### ‏Materialization

```text
MATERIALIZATION_UNRESOLVED
ECONOMIC_PRICE_BOUND_MISSING
APPLICATION_TTL_MISSING
LOCAL_WATCHDOG_REQUIRED
```

‏Reason Codes אלה מסבירים **למה Candidate אינה eligible**. הם אינם מחליפים את reason codes של selection economics ב־10A/10B/10C.

---

## ‏9B.14 Candidate Registry — example records

```text
CandidateDefinition {
  candidate_id = MARKETABLE_LIMIT_IOC
  supported_purposes = [ENTRY, EXIT]
  allowed_execution_modes = [AGGRESSIVE_CAPPED, NORMAL_EXIT, FAST_EXIT]
  research_role = CORE_BASELINE
  rollout_state = LIVE_ENABLED

  materialization_requirements = {
    base_broker_primitive = LMT
    allowed_broker_tif = [IOC]
    routing_requirement = ANY_VALIDATED
    broker_algo_requirement = NONE
  }

  policy_requirements = {
    economic_price_bound_required = true
    application_order_ttl_required = true
    local_validity_watchdog_required = true
    partial_fill_requires_fresh_decision = true
  }
}
```

‏ה־`LIVE_ENABLED` בדוגמה היא **schema example בלבד**, לא הצהרה שהחשבון או ה־adapter בפועל מאושרים כרגע. Live authorization עדיין תלויה ב־Capability tuples בזמן הריצה.

‏דוגמה נוספת:

```text
CandidateDefinition {
  candidate_id = PEGGED_MIDPOINT_DIRECT
  supported_purposes = [ENTRY, EXIT]
  allowed_execution_modes = [MIDPOINT_SEEKING]
  research_role = RESEARCH_CHALLENGER
  rollout_state = SHADOW_ONLY

  materialization_requirements = {
    routing_requirement = DIRECT
    destination_requirement = VALIDATED_DESTINATION
    broker_algo_requirement = NONE
  }
}
```

‏כאן Candidate יכולה להיות מוכרת ומחושבת במחקר, בלי יכולת ליצור Live side effect.

---

## ‏9B.15 Candidate Promotion אינה Capability Discovery

‏שני תהליכים נפרדים:

```text
Capability promotion:
DOC_ONLY
→ RUNTIME_CONFIRMED
→ PAPER_ACCEPTED
→ LIVE_SMALL_ACCEPTED
→ PRODUCTION_ENABLED
```

```text
Candidate rollout:
DISABLED
→ SHADOW_ONLY
→ LIVE_ENABLED
```

‏Promotion של Candidate דורשת policy/research decision משלנו.

‏Promotion של Capability דורשת evidence על Broker/API/path.

‏אף אחד מהם אינו גורר את השני אוטומטית.

---

## ‏9B.16 `CORE` אינו `LIVE_ENABLED`

‏Research role כגון:

```text
CORE_BASELINE
CORE_SAFETY
RESEARCH_CHALLENGER
REFERENCE_ONLY
```

‏מגדירה חשיבות למחקר/מימוש.

‏היא אינה authorization.

‏לכן חוקי לחלוטין:

```text
research_role = CORE_BASELINE
rollout_state = SHADOW_ONLY
```

‏בשלב מוקדם של adapter חדש.

‏ולעומת זאת Candidate `REFERENCE_ONLY` יכולה להיות Broker-supported, אך לא להשתתף כלל ב־production decision set.

---

## ‏9B.17 Deterministic Resolution

‏אותם Inputs צריכים להחזיר אותו eligibility result:

```text
same candidate definition
+ same capability snapshot
+ same product/contract
+ same adapter/route/session/account
+ same environment
= same capability resolution
```

‏אם Capability evidence משתנה בזמן אמת, נוצר snapshot חדש ו־Decision חדשה.

‏כך Replay יכול להסביר:

```text
Candidate X was eliminated
because requirement Y was not PRODUCTION_ENABLED
under capability snapshot Z
```

---

## ‏9B.18 Acceptance Tests

```text
1. Broker primitive is never treated as Application Execution Mode by itself.
2. Routing Policy is never treated as Broker Algo.
3. Broker Algo is never treated as Behavior Candidate without an explicit candidate definition.
4. MARKETABLE_LIMIT_IOC materializes through LMT + IOC and is never modeled as a separate broker primitive.
5. Candidate Registry describes materialization and policy requirements; it never ranks survivors.
6. Capability Resolver can eliminate candidates but cannot select the winner.
7. Live side effects require candidate rollout LIVE_ENABLED plus all required capability tuples PRODUCTION_ENABLED.
8. SHADOW_ONLY may be evaluated and logged but cannot cause broker side effects.
9. Capability enablement and candidate rollout remain separate state machines.
10. Route/destination constraints are part of capability identity when they change semantics.
11. Adapter cannot silently change Behavior Candidate, Routing Policy, Broker Algo or Economic Price Bound.
12. One broker primitive may map to multiple Behavior Candidates without ambiguity because candidate identity is explicit.
13. Every eliminated candidate receives a machine-readable reason code.
14. Same definitions + same capability snapshot + same scope yield deterministic eligibility.
15. Product-specific out-of-scope capabilities never enter the live candidate set merely because broker documentation lists them.
```

---

## ‏9B.19 Practitioner / Engine takeaway

> ‏`ENGINE RULE` — Broker capabilities answer **what can be expressed on this path**. Decision policy answers **what behavior we want now**. Candidate Registry is the contract that connects the two without letting either layer impersonate the other.

‏הדרך לזכור:

```text
Decision Engine chooses behavior.
Candidate Registry defines how behavior may be materialized.
Capability Resolver removes impossible / unauthorized materializations.
Adapter serializes the already-approved plan.
```

‏אם Candidate אינה ניתנת ל־materialization כרגע, התוצאה היא elimination + reason code — לא hidden fallback ל־Order אחרת.

---

# ‏Checkpoint — סוף חלק 9B

‏נוצר mapping קנוני מ־`Application Execution Mode` ו־`Behavior Candidate` אל Broker Primitive, ‏TIF/Attributes, ‏Routing ו־Broker Algo, עם `Candidate Registry` מפורש. Capability Enablement הופרדה מ־Candidate Rollout; ‏`SHADOW_ONLY` הוגדרה ללא Side Effects; וה־Capability Resolver הוגדרה כ־Filter בלבד. בכך נסגר הבסיס ל־R5 בלי להפוך Broker support או research priority ל־winner selector.