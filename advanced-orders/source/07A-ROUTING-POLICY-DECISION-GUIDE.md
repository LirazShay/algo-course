# ‏חלק 7A — Routing Policy Decision Guide: ‏`SMART` מול Direct, ו־Routing מול Broker Algo

> ‏הפרק הזה הוא שכבת Decision מעל Part 7. הוא אינו מוסיף Routing mechanisms חדשים; הוא עונה על שתי שאלות שקל מאוד לערבב: **מי בוחר Destination**, ו־**מי מנהל את טקטיקת הביצוע בתוך ה־Route שנבחרה**.

---

## ‏7A.1 שני צירים שונים

```text
Routing Policy
= where may / should the order be routed?

Broker Algo
= how does the broker manage execution tactics after receiving the intent?
```

‏דוגמאות קנוניות:

```text
SMART
DIRECT
```

‏הן `Routing Policy`.

```text
Adaptive
MidPrice
```

‏הם Broker-managed execution mechanisms/algos.

```text
ADAPTIVE_LIMIT_URGENT
MIDPRICE
PEGGED_MIDPOINT_DIRECT
```

‏הם `Behavior Candidate` של המנוע.

> ‏`ENGINE RULE` — Route אינה Execution Mode, ו־Broker Algo אינה Routing Policy. הן dimensions נפרדים של `ConcreteOrderPlan`.

---

## ‏7A.2 משפט הזיכרון

```text
SMART vs Direct
= who owns destination selection?

Broker Algo vs no Broker Algo
= who owns execution tactics within the allowed path?
```

‏לכן אפשר עקרונית לקבל combinations כגון:

```text
BehaviorCandidate = ADAPTIVE_LIMIT_URGENT
RoutingPolicy     = SMART
BrokerAlgo        = Adaptive
```

‏או:

```text
BehaviorCandidate = PEGGED_MIDPOINT_DIRECT
RoutingPolicy     = DIRECT
Destination       = validated venue
BrokerAlgo        = none
```

‏אבל רק אם Capability evidence מאשרת את השילוב המדויק.

---

## ‏7A.3 Comparison Matrix — `SMART` מול Direct

| Dimension | `SMART` | Direct |
|---|---|---|
| מי בוחר Destination | IBKR router | Client / execution engine |
| Venue model מקומי נדרש | נמוך יותר | גבוה משמעותית |
| יכולת לנצל כמה מקורות נזילות | broker-managed לפי policy | תלויה ב־destination שנבחר |
| Determinism של destination | נמוך יותר | גבוה יותר |
| Venue-specific feature access | רק כאשר SMART/path תומך | יכול להיות הכרחי לפיצ'רים מסוימים |
| Operational responsibility | יותר אצל Broker | יותר אצל Client |
| failure מרכזי | broker path פחות שקוף/דטרמיניסטי | בחירת Venue שגויה או stale |

‏אין בטבלה מנצחת כללית. השאלה היא איזה ownership model מתאים ל־Behavior ול־evidence שיש לנו.

---

## ‏7A.4 `SMART` — Decision Card

### ‏What

‏Routing Policy שבה IBKR מחזיקה את destination-selection logic בתוך universe הנתמך שלה ומנתבת/מנתבת מחדש לפי תנאי execution.

### ‏Why

‏כדי להשתמש ב־broker venue model במקום לבנות בעצמנו routing engine מלא.

### ‏When

```text
behavior does not require an explicit destination
we want broker-managed venue selection
our local venue model is incomplete
multi-venue / hidden-liquidity access may add value
SMART capability is validated for the concrete order plan
```

### ‏Why Not

‏כאשר research question דורשת destination determinism, כאשר primitive מסוים דורש Direct, או כאשר אנחנו חייבים route-level control שאינו מיוצג ב־SMART plan.

### ‏Closest Alternative

‏Direct Routing כאשר destination עצמה היא חלק מן ה־execution hypothesis או requirement של ה־Behavior.

### ‏Main Failure Mode

```text
same logical candidate
→ broker chooses different execution paths across opportunities
→ local analysis attributes result only to candidate name
→ route/path effect is hidden inside the aggregate metric
```

### ‏For Our Engine

```text
DEFAULT ROUTING BASELINE
```

‏זהו baseline policy למחקר, לא universal truth ולא Execution Mode.

---

## ‏7A.5 Direct Routing — Decision Card

### ‏What

‏Routing Policy שבה המנוע מציין Destination מסוים במקום להאציל את destination selection ל־SMART router.

### ‏Why

‏כדי לקבל destination-specific semantics, attribution, queue behavior או access ל־feature שמחייב route מסוים.

### ‏When

```text
behavior explicitly requires Direct routing
venue-specific hypothesis is being tested
we have current capability evidence
venue data/telemetry is sufficient
failure and fallback behavior are explicit
```

### ‏Why Not

‏Direct מעבירה אלינו את בעיית בחירת Venue. אם המודל המקומי stale או חלקי, deterministic routing יכולה להיות deterministically wrong.

### ‏Closest Alternative

`SMART` כאשר אין reason מוכח לבחור destination מסוים ואנו מעדיפים broker-managed venue selection.

### ‏Main Failure Mode

```text
client selects venue X
→ liquidity / latency / capability changes
→ better opportunity exists elsewhere
→ order remains constrained to an inferior path
```

### ‏For Our Engine

```text
SPECIALIST / RESEARCH_CHALLENGER
```

‏למעט Behaviors שבהם Direct היא materialization requirement ולא בחירה אופציונלית.

---

## ‏7A.6 Route יכולה להיות Constraint שנגזרת מן ה־Behavior

‏לפעמים ה־flow אינו:

```text
choose route
→ choose order behavior
```

‏אלא:

```text
choose Behavior Candidate
→ materialization requirements constrain Routing Policy
```

‏לדוגמה, לפי Part 5/7:

```text
BehaviorCandidate = PEGGED_MIDPOINT_DIRECT
→ RoutingPolicy must be DIRECT
→ Destination must support the primitive
```

‏לעומת:

```text
BehaviorCandidate = MIDPRICE
→ BrokerAlgo = MidPrice
→ RoutingPolicy = SMART
```

‏לכן `RoutingPlan` נבנית אחרי Candidate selection ובשיתוף Capability Resolver.

> ‏`ENGINE RULE` — Routing constraint יכולה לסנן Candidate, אבל Route preference לבדה אינה ממציאה Candidate חדשה.

---

## ‏7A.7 `SMART` אינה “Broker Algo אחד גדול”

‏זו טעות taxonomy נפוצה.

```text
SMART
= destination-selection / routing layer

Adaptive
= broker execution algo

MidPrice
= broker-managed midpoint execution mechanism/algo
```

‏לכן המודל צריך לשמור בנפרד:

```text
routing_policy
broker_algo
behavior_candidate
broker_primitive
attributes
```

‏ולא:

```text
execution_type = SMART_ADAPTIVE
```

‏שמערבב שכבות וקשה לשחזר ממנו intent.

---

## ‏7A.8 Decision Example — אותה `LMT`, שתי Routes שונות

‏נניח:

```text
BehaviorCandidate = PASSIVE_JOIN
BrokerPrimitive   = LMT
EconomicPriceBound = valid
```

### ‏Case A — אין venue hypothesis

```text
we want passive execution
no destination-specific feature is required
venue model is incomplete
```

‏`SMART` היא baseline טבעית יותר למחקר.

### ‏Case B — בודקים Venue מסוימת

```text
research hypothesis = venue X improves queue/fill outcome
direct depth/telemetry is available
venue-specific capability is validated
```

‏Direct יכולה להיות Challenger לגיטימית.

‏ה־Behavior לא השתנתה:

```text
PASSIVE_JOIN
```

‏רק ה־Routing Plan השתנתה.

---

## ‏7A.9 Decision Example — אותה urgency, Broker Algo שונה

‏נניח:

```text
ApplicationExecutionMode = BROKER_MANAGED
BehaviorCandidate = ADAPTIVE_LIMIT_URGENT
```

‏כאן:

```text
RoutingPolicy = SMART
BrokerAlgo = Adaptive
```

‏ה־urgency אינה נובעת מן המילה `SMART`.

‏אם במקום זאת נבחר:

```text
MARKETABLE_LIMIT_IOC
```

‏אפשר עדיין להשתמש ב־SMART routing, אבל:

```text
BrokerAlgo = none
BrokerTIF  = IOC
```

‏כלומר אותה Routing Policy יכולה לשאת Behaviors שונים לחלוטין.

---

## ‏7A.10 Decision Example — Direct אינה synonym של low latency

‏נניח שיש שתי Venues:

```text
Venue A
current visible liquidity = small
observed latency = low

Venue B
current visible liquidity = larger
observed latency = slightly higher
```

‏בחירת `DIRECT -> Venue A` רק משום שהיא “מהירה יותר” אינה decision מספקת.

‏צריך לפחות לשקלל:

```text
useful executable quantity
fill probability
queue state
fees/rebates
reject/degrade state
expected opportunity cost
```

‏לכן:

```text
Direct
!=
fast mode
```

---

## ‏7A.11 `SMART` אינה synonym של best execution guarantee

‏Delegating venue selection יכול לשפר execution path, אבל הוא אינו guarantee לתוצאת Trade או Fill מיטבית בכל Opportunity.

‏המנוע עדיין צריך למדוד:

```text
fill quality
fill latency
venue attribution when observable
fees
slippage
markout
missed move
```

‏ולא להסיק:

```text
SMART selected
→ optimal execution achieved
```

---

## ‏7A.12 Routing Decision מתחילה אחרי Eligibility

‏הסדר הקנוני:

```text
10A gates
→ eligible Behavior Candidates
→ choose behavior
→ derive materialization requirements
→ resolve eligible routing plans
→ choose routing plan
→ materialize concrete broker order
```

‏לא:

```text
pick favorite venue
→ force whatever order can run there
```

‏אלא אם ה־Strategy עצמה מגדירה destination-specific research hypothesis, וגם אז זו constraint מפורשת ולא hidden preference.

---

## ‏7A.13 Direct דורשת Venue Model מקומי

‏אם המנוע רוצה לבחור Direct באופן דינמי, הוא למעשה לוקח ownership על subset של routing intelligence.

‏Venue model מינימלי למחקר צריך להיות מסוגל לשמור לפחות:

```text
venue
capability scope
order-family support
recent reject rate
observed ack latency
observed fill latency
fill ratio
fees/rebates when relevant
queue/markout metrics
last_verified_at
health state
```

‏בלי זה, Direct selection אינה evidence-based decision אלא hard-coded destination preference.

---

## ‏7A.14 Route Freshness

‏Venue שהיה מתאים לפני שעה או אפילו לפני שניות אינו בהכרח מתאים עכשיו.

‏לכן Route evidence צריכה freshness משלה:

```text
routing_snapshot_ts
venue_health_ts
capability_last_verified_at
market_data_ts
```

‏אם ה־route-specific evidence stale:

```text
DIRECT candidate may be eliminated
```

‏אבל אין להסיק אוטומטית:

```text
fall back to SMART and submit immediately
```

‏התגובה הקנונית היא fresh decision עם survivor set חדש.

---

## ‏7A.15 `Fallback` מול Route Failure

‏תרחיש:

```text
DIRECT plan rejected by destination
```

‏תגובה שגויה:

```text
retry SMART immediately with more aggressive price
```

‏תגובה קנונית:

```text
record route/capability failure
→ update capability / health state
→ fresh decision
→ rebuild candidate + routing survivors
```

‏ייתכן שהחלטה חדשה תהיה:

```text
same behavior via SMART
same behavior via another validated direct venue
another behavior
DEFER
NO_TRADE
CANCEL_EXISTING
```

‏Route failure אינה escalation authorization.

---

## ‏7A.16 Broker Algo Failure אינה Route Failure

‏יש להפריד reason codes:

```text
ROUTE_REJECTED
DESTINATION_UNAVAILABLE
ROUTE_CAPABILITY_MISMATCH

BROKER_ALGO_REJECTED
BROKER_ALGO_PARAMETER_INVALID
BROKER_ALGO_NOT_PRODUCTION_ENABLED
```

‏אם `Adaptive` אינה מתקבלת, אין להסיק ש־SMART עצמה “נכשלה”.

‏אם Destination Direct מסוים אינו מקבל primitive, אין להסיק שה־Behavior concept כולה לא רלוונטית בכל path.

---

## ‏7A.17 Pairwise Decision — `SMART` מול Direct

### ‏`SMART` שורדת יותר כאשר

```text
no explicit destination is required
broker venue selection is acceptable
local venue model is weak or incomplete
multi-venue access is valuable
research wants simple routing baseline
```

### ‏Direct שורדת יותר כאשר

```text
candidate requires destination-specific semantics
research needs route-level determinism
venue-specific evidence exists
local engine can own route selection and failure handling
```

### ‏אל תכריע לפי

```text
SMART sounds smarter
Direct sounds faster
```

‏אלה slogans, לא Decision Criteria.

---

## ‏7A.18 Pairwise Decision — Routing Policy מול Broker Algo

‏השאלה הראשונה:

```text
Who chooses destination?
```

‏השאלה השנייה:

```text
Who manages execution tactics after submission?
```

‏אפשר למשל:

```text
SMART + no broker algo
SMART + Adaptive
SMART + MidPrice
DIRECT + venue-native primitive
```

‏לכן `BrokerAlgoPlan` ו־`RoutingPlan` חייבים להיות objects נפרדים.

---

## ‏7A.19 Counterexample — “אם `SMART` יודעת לבחור Venue, אין צורך ב־Behavior Engine”

‏Router יכולה לבחור **where**.

‏היא אינה יודעת לבדה:

```text
whether signal is still valid
how much quantity is still desired
Economic Price Bound
partial-fill policy
whether NO_TRADE is now better
protection responsibility
```

‏כלומר:

```text
routing intelligence
!=
strategy / execution-intent intelligence
```

---

## ‏7A.20 Counterexample — “Direct נותנת שליטה ולכן היא מקצועית יותר”

‏שליטה ללא מודל אינה יתרון.

‏אם אין לנו evidence עדכני על:

```text
liquidity
queue
venue health
fees
capability
```

‏Direct יכולה פשוט לקבע טעות מהר יותר ובצורה יותר deterministic.

---

## ‏7A.21 Counterexample — “Broker Algo פותרת Routing”

‏Broker Algo יכולה להשתמש ב־SMART path כחלק מה־implementation שלה, אבל conceptually היא עדיין execution mechanism נפרד.

‏אם נשמור רק:

```text
algo = Adaptive
```

‏ולא נשמור:

```text
routing_policy
broker_algo
concrete_order_plan
```

‏לא נוכל לבצע Replay מדויק של מה באמת נבחר.

---

## ‏7A.22 Telemetry

```text
behavior_candidate
application_execution_mode
routing_policy
destination
broker_algo
broker_primitive
routing_snapshot_ts
route_capability_id
route_health_state
route_decision_reason
broker_algo_decision_reason
submit_ts
ack_ts
first_fill_ts
fill_venue
fill_qty
fill_price
fees_or_rebates
reject_code
reject_scope
reroute_observed
application_order_ttl
signal_remaining_life_ms
post_fill_markout_100ms
post_fill_markout_500ms
post_fill_markout_1s
```

‏המטרה היא לא רק לדעת “SMART או Direct”, אלא לאפשר attribution של outcome ל־Behavior, Route ו־Algo בנפרד.

---

## ‏7A.23 Decision Record מומלץ

```text
RoutingDecision {
  decision_id
  behavior_candidate
  materialization_requirements[]
  eligible_routing_plans[]
  eliminated_routing_plans[] { route, reason_code }
  selected_routing_policy
  selected_destination
  broker_algo_plan
  capability_evidence[]
  routing_snapshot_ts
  decision_reason
  failure_destination
}
```

‏כך Replay יכול להסביר האם Route נבחרה בגלל feature requirement, venue hypothesis או baseline delegation.

---

## ‏7A.24 Acceptance Tests

```text
1. SMART and DIRECT remain Routing Policies, never Application Execution Modes.
2. Adaptive and MidPrice remain Broker Algos/mechanisms, never Routing Policies.
3. Route preference never creates a Behavior Candidate that failed 10A eligibility.
4. PEGGED_MIDPOINT_DIRECT materialization requires a validated DIRECT route.
5. MIDPRICE materialization remains distinct from directed midpoint peg.
6. Direct route selection requires current route/capability evidence.
7. Route failure triggers fresh decision; it never authorizes automatic price escalation.
8. Broker Algo failure and Routing failure produce different reason codes.
9. Same behavior may be compared under different routing plans without renaming the behavior.
10. Same route may carry different behaviors without becoming part of their Execution Mode name.
11. Research attribution records Behavior, Routing Policy and Broker Algo separately.
12. Same facts + same policy yield the same eligible routing set and selected plan.
```

---

## ‏7A.25 Practitioner Insight

> ‏`ENGINE RULE` — `SMART` ו־Direct אינן תשובות לשאלה “כמה אגרסיבי להיות?”. הן תשובות לשאלה **מי מחזיק את בחירת ה־Destination**.

‏הדרך לזכור:

```text
Behavior Candidate
= what execution behavior we want

Routing Policy
= who/where chooses destination

Broker Algo
= who manages execution tactics
```

‏ה־professional mistake היא למדוד רק Fill outcome ולייחס אותו ל־Order name אחד, כאשר בפועל outcome נוצר משילוב של Behavior + Route + Algo + Market State.

---

# ‏Checkpoint — סוף חלק 7A

‏יצרנו שכבת Decision אחידה ל־`SMART` מול Direct Routing והפרדנו Routing Policy מ־Broker Algo. ‏`SMART` היא baseline של delegated venue selection; Direct היא specialist/research path כאשר destination-specific semantics או route-level hypothesis מצדיקות ownership מקומי. Route אינה Execution Mode, Broker Algo אינה Route, ו־failure בכל אחת מן השכבות חוזר ל־fresh decision במקום ליצור fallback אגרסיבי אוטומטי.