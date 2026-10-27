# ‏חלק 6C — Composite, Coordination & Conditional Decision Guide: ‏`Bracket`, ‏`OCA/OCO` ו־`Conditional`

> ‏הפרק הזה הוא שכבת Decision מעל Part 6. הוא אינו מוסיף Order Types חדשים; הוא מפריד בין שלושה מנגנונים שנראים לעיתים כאילו כולם פשוט “קושרים Orders יחד”, אך בפועל פותרים בעיות שונות לחלוטין: **Dependency / Composite Structure**, ‏**Mutual Exclusion / Quantity Coordination**, ו־**Predicate**.

---

## ‏6C.1 שלוש שאלות שונות

```text
A. Dependency / Composite Structure
Which orders exist because another order/position exists?

B. Mutual Exclusion / Quantity Coordination
What should happen to peer orders when one of them fills or changes quantity?

C. Predicate
Under what external/internal condition may an order become active or be canceled?
```

‏מיפוי קנוני:

```text
Bracket     -> Composite Order Structure + parent/child dependency
OCA / OCO   -> Mutual exclusion / quantity coordination relationship
Conditional -> Predicate / activation-cancellation policy
```

> ‏`ENGINE RULE` — שלושת המנגנונים אינם `Application Execution Mode`, אינם Routing Policy, ואינם aliases זה של זה.

---

## ‏6C.2 Comparison Matrix

| Mechanism | הבעיה העיקרית שהוא פותר | Relationship מרכזי | האם הוא אטומי? | failure מרכזי |
|---|---|---|---|---|
| `Bracket` | לקשור Entry ל־dependent exits/protection | Parent → Children | לא להניח atomicity | orphan/unprotected/double-exit סביב lifecycle ו־partial fills |
| `OCA/OCO` | לתאם peer orders כך ש־fill/quantity change באחת ישפיע על האחרות | Peer coordination | **לא** | multiple executions before coordination settles |
| `Conditional` | להפעיל/לבטל Order רק כאשר Predicate מתקיים | Predicate → Order action | לא transaction עם market | stale predicate, delayed observation, order still executable after local invalidation |

‏הטבלה מבהירה: `Bracket` עוסקת בעיקר ב־**dependency**, ‏`OCA/OCO` ב־**coordination**, ו־`Conditional` ב־**eligibility based on a predicate**.

---

# ‏חלק א — `Bracket`

## ‏6C.3 `Bracket` — Decision Card

### ‏What

‏Composite structure שבה Parent Entry ו־Child exits/protection מקושרות כך שה־Children תלויות ב־Parent וב־Position שנוצרת ממנה.

### ‏Why

‏כדי להעביר לברוקר חלק מה־dependency/protection graph במקום להסתמך על רצף מקומי בלבד:

```text
entry accepted/fills
→ dependent protection/exit structure becomes relevant
```

### ‏When

```text
position must receive broker-side protection architecture
parent/child semantics are validated for the exact API/path
protection survivability matters
child sizing and activation can be reconciled reliably
```

### ‏Why Not

‏Bracket מוסיפה lifecycle graph: Parent, Children, transmit/activation state, partial fills, cancel races ו־recovery. אם המנוע אינו יודע לשחזר את הגרף אחרי reconnect, ה־structure עלולה להסתיר יותר risk משהיא פותרת.

### ‏Closest Alternative

‏`HYBRID_PROTECTION` כאשר ה־client רוצה להחזיק dynamic Exit Authority אך להשאיר broker-resident backstop; או local-managed exits כאשר dependency פשוטה ו־client availability מקובלת מבחינת failure model.

### ‏Main Failure Mode

```text
parent partially fills
→ actual position exists
→ child/protection quantity or activation is not what local engine assumes
→ position is under-protected, over-protected, or coordination becomes ambiguous
```

### ‏For Our Engine

```text
PROTECTION_ARCHITECTURE / COMPOSITE_STRUCTURE
```

‏`Bracket` אינה Behavior Candidate של Entry ואינה Exit Mode.

---

## ‏6C.4 Parent Partial Fill הוא Contract נפרד

‏הנקודה החשובה ביותר היא שלא מספיק לדעת:

```text
parent filled? yes/no
```

‏צריך לדעת:

```text
parent_filled_qty
current_child_active_qty
current_child_remaining_qty
reconciled_position
protection_coverage_qty
```

‏למשל:

```text
parent target = 100
parent actual fill = 40
```

‏אסור להסיק בלי evidence:

```text
both children now protect exactly 40
```

‏או:

```text
children remain inactive until 100 fills
```

‏ההתנהגות המדויקת היא `ACCEPTANCE TEST REQUIRED` לפי Broker/API/path.

> ‏`ENGINE INVARIANT` — Protection coverage נגזרת מ־broker-observed child state + `reconciled_position`, לא מה־intended parent quantity.

---

## ‏6C.5 `UNTRANSMITTED != PROTECTED`

‏Composite graph מקומי אינו הוכחת הגנה.

```text
parent object exists locally
children objects exist locally
transmit sequencing prepared
```

‏אינו שקול ל־:

```text
broker has accepted executable protection for actual position
```

‏לכן Protection State חייבת להיות observable מה־broker lifecycle.

---

## ‏6C.6 Bracket Decision Example

‏נניח:

```text
entry may fill partially
client can disconnect
position without protection is not allowed by policy
```

‏Bracket יכולה להיות architecture רלוונטית **רק אם** acceptance evidence מוכיחה כיצד child activation/quantity מתנהגות ב־partial fills וב־reconnect.

‏אם הראיות אינן קיימות:

```text
capability documented
!=
production-safe bracket architecture
```

‏והמנוע צריך להשאיר אותה מתחת ל־production enablement הנדרש.

---

# ‏חלק ב — `OCA / OCO`

## ‏6C.7 `OCA/OCO` — Decision Card

### ‏What

‏Relationship בין Orders שבו execution או שינוי quantity של member אחד אמורים לגרום לביטול/התאמה של peers לפי group semantics.

### ‏Why

‏כדי לתאם חלופות mutually exclusive או exits מתחרות בלי שה־client יצטרך לגלות Fill ואז להתחיל coordination מאפס.

### ‏When

```text
multiple live orders represent alternatives for the same exposure
one execution should reduce/cancel peer intent
broker-side coordination provides operational value
group behavior is acceptance-tested
```

### ‏Why Not

‏OCA/OCO אינה transaction אטומית. בתקופת race יותר מ־member אחד יכולה עדיין להיות potentially executable, במיוחד סביב fills/cancels/latency.

### ‏Closest Alternative

‏Client-managed mutual exclusion כאשר צריך policy/context מורכב יותר; `Bracket` כאשר הבעיה היא Parent→Child dependency ולא peer exclusion.

### ‏Main Failure Mode

```text
order A fills
→ broker begins peer coordination
→ order B is still executable during race
→ order B also fills
→ resulting position differs from intended target
```

### ‏For Our Engine

```text
COORDINATION_RELATIONSHIP
```

---

## ‏6C.8 `OCA/OCO` אינה Guarantee של “רק אחת תתבצע”

‏ה־mental model הבטוח הוא:

```text
coordination intent
!=
atomic market transaction
```

‏לכן worst-case exposure צריך להניח שבחלון מסוים כמה Members עדיין יכולים לבצע.

‏במנוע:

```text
for each non-terminal group member:
    include potentially executable quantity in exposure budget
```

‏עד שיש terminal evidence שמסירה אותו מן ה־risk set.

---

## ‏6C.9 Quantity Coordination אחרי Partial Fill

‏Partial Fill יכולה להפוך OCA מבעיה בינארית לבעיה כמותית.

‏נניח:

```text
position = 100
exit A = sell 100
exit B = sell 100
```

‏אם A מתמלאת חלקית ב־35, המצב החדש אינו:

```text
A won, cancel B, done
```

‏אלא:

```text
reconciled_position = 65
A remaining executable qty = ?
B remaining executable qty = ?
coordination update state = ?
```

‏ומכאן fresh Decision/Protection reconciliation.

> ‏`ENGINE RULE` — Partial Fill היא Position Fact חדשה; group semantics אינן תחליף ל־position reconciliation.

---

## ‏6C.10 OCA Decision Example

‏נניח Position קיימת ויש שתי דרכי Exit חלופיות, אבל רק אחת אמורה בסוף לסגור exposure.

‏`OCA` יכולה להיות שימושית כדי להעביר coordination בסיסית לברוקר.

‏אבל Risk Engine עדיין חייבת לשאול:

```text
What if both orders fill before cancellation settles?
What is the maximum temporary/worst-case position?
Can the account tolerate that state?
How is over-exit detected and repaired?
```

‏אם אין תשובה, OCA אינה “הגנה”; היא רק coordination feature.

---

# ‏חלק ג — `Conditional`

## ‏6C.11 `Conditional` — Decision Card

### ‏What

‏Order או action שה־eligibility שלה תלויה ב־Predicate מוגדרת — market, time, instrument, account/other supported condition בהתאם ל־capability.

### ‏Why

‏כדי להצמיד activation/cancellation ל־condition בלי שה־client יצטרך להיות היחיד שמנטר ומגיב בזמן אמת.

### ‏When

```text
predicate is simple and broker-supported
broker-side evaluation improves survivability/latency
condition semantics are explicit
post-condition order behavior remains independently valid
```

### ‏Why Not

‏Predicate אינה Strategy Engine. Broker יכול לדעת שהתנאי התקיים, אבל לא בהכרח שה־Signal שלנו עדיין תקפה או שה־Economic Price Bound לא השתנתה.

### ‏Closest Alternative

‏Client-managed fresh decision כאשר activation דורשת context עשיר; Triggered Orders כאשר ה־condition היא price-trigger semantics מובנית כמו Stop/MIT/LIT.

### ‏Main Failure Mode

```text
predicate becomes true
→ broker activates order
→ local signal/economics have already changed
→ activated order is legal by broker rule but stale by strategy intent
```

### ‏For Our Engine

```text
PREDICATE_POLICY / SPECIALIST
```

---

## ‏6C.12 Predicate אינה Execution Behavior

‏Conditional עונה קודם כול על:

```text
WHEN / WHETHER may this order become active?
```

‏היא אינה עונה לבדה על:

```text
HOW will it execute once active?
```

‏לכן model נכון מפריד:

```text
ConditionPlan
+
PostConditionConcreteOrderPlan
```

‏ולא:

```text
orderType = CONDITIONAL
```

‏כאילו כל ה־execution semantics מוכלים בשם אחד.

---

## ‏6C.13 Conditional Decision Example

‏נניח Order צריכה להתקיים רק כאשר Predicate חיצונית פשוטה מתקיימת.

‏אם ה־Broker יכולה להעריך אותה בעצמה, Conditional יכולה לשפר survivability.

‏אבל לאחר activation עדיין צריך לבדוק:

```text
signal still valid?
Economic Price Bound still valid?
position/exposure still compatible?
working order still wanted?
```

‏אם אין מנגנון invalidation/reconciliation, העברת Predicate לברוקר יכולה להפוך stale intent ל־broker-resident executable order.

---

# ‏חלק ד — איך בוחרים את המנגנון הנכון

## ‏6C.14 Decision Questions

```text
Is the problem parent-child dependency?
→ Bracket / composite architecture

Is the problem mutual exclusion or quantity coordination among peers?
→ OCA/OCO

Is the problem activation based on a predicate?
→ Conditional

Do we actually need more than one mechanism?
→ model each dimension separately; validate the exact combination
```

‏למשל Bracket יכולה להשתמש גם ב־coordination בין exit children, אבל זה אינו הופך `Bracket == OCA`.

‏Composite Structure יכולה **להכיל** coordination relationship ועדיין להישאר concept נפרד.

---

## ‏6C.15 Direct Comparison — `Bracket` מול `OCA/OCO`

### ‏`Bracket`

```text
entry/position dependency is central
children exist because parent/position exists
protection coverage matters
```

### ‏`OCA/OCO`

```text
peer orders already represent competing alternatives
one peer's execution should affect the others
```

‏השאלה המקצועית:

```text
Are these orders dependent children,
or independent peers that need coordination?
```

---

## ‏6C.16 Direct Comparison — `OCA/OCO` מול `Conditional`

‏`OCA/OCO` מגיבה בעיקר ל־state של peer orders/fills.

‏`Conditional` מגיבה ל־Predicate.

```text
OCA:
peer A executed
→ coordinate peer B/C

Conditional:
predicate became true/false
→ activate/cancel target order
```

‏שניהם event-driven, אך האירוע וה־relationship שונים.

---

## ‏6C.17 Direct Comparison — `Bracket` מול `Conditional`

‏Bracket מייצגת lifecycle dependency סביב Parent/Position.

‏Conditional מייצגת eligibility rule.

‏אפשר תיאורטית לשלב dependency ו־predicate, אבל Capability + lifecycle חייבות להיות מאומתות לשילוב המדויק.

> ‏`ENGINE RULE` — אל תבנה “mega advanced order” שמחברת Bracket + OCA + Conditions רק מפני שה־API מכיל fields לכל אחד מהם.

---

## ‏6C.18 Counterexample — “Bracket אומרת שה־Position מוגנת”

‏לא בהכרח.

```text
parent partial fill exists
children not yet confirmed for actual quantity
```

‏או:

```text
local bracket objects exist
but transmit/acceptance state is incomplete
```

‏בשני המקרים:

```text
STRUCTURE_DEFINED
!=
PROTECTION_CONFIRMED
```

---

## ‏6C.19 Counterexample — “OCO מבטיחה שאי אפשר לקבל Double Exit”

‏לא.

‏Non-atomic coordination משמעותה שה־risk model חייב לכלול race שבו שתי Orders עדיין executable.

```text
cancel requested on peer
!=
peer terminal
```

‏ולכן over-exit/position flip הם failure cases שיש לבדוק במפורש.

---

## ‏6C.20 Counterexample — “Conditional אצל Broker מחליפה את ה־Decision Engine”

‏Broker Predicate יכולה להחליף monitoring של תנאי מסוים.

‏היא אינה מחליפה:

```text
signal validity
position truth
risk state
Economic Price Bound
exit feasibility
system health
```

‏כלומר:

```text
broker evaluates condition
!=
broker owns strategy intent
```

---

## ‏6C.21 Ownership Model

‏נפריד לפחות:

```text
DependencyOwner
CoordinationOwner
PredicateEvaluator
ExitAuthority
ProtectionAuthority
PositionTruthOwner
```

‏אותו Broker יכול לבצע כמה מהתפקידים, אבל המודל לא מאחד אותם לשדה אחד בשם:

```text
broker_managed = true
```

‏כי failure handling שונה לכל responsibility.

---

## ‏6C.22 Partial Fill — Fresh Decision בכל שלושת המנגנונים

‏לאחר Partial Fill:

```text
apply execution fact
→ update execution ledger
→ reconcile broker position
→ derive reconciled_position
→ recompute protection coverage
→ recompute group executable exposure
→ inspect predicate/dependency state
→ fresh decision
```

‏אסור לבצע:

```text
remaining_qty = original_qty - fill_qty
→ blindly continue original composite/group/conditional plan
```

‏כי Position, protection, timing ו־Signal state כבר השתנו.

---

## ‏6C.23 Late Effects

‏גם לאחר local invalidation/cancel יכולים להגיע:

```text
parent fill
child activation
child fill
OCA peer fill
OCA cancellation acknowledgement
condition activation
post-condition order acknowledgement
partial fill
full fill
reject/inactive
```

‏ולכן invariant של Part 8 נשאר:

```text
Any order without terminal broker evidence remains potentially executable.
```

---

## ‏6C.24 Failure Contracts — Summary

### ‏Bracket

```text
primary failure destination = RECONCILE_POSITION_AND_PROTECTION_GRAPH
```

### ‏OCA/OCO

```text
primary failure destination = RECONCILE_GROUP_AND_WORST_CASE_EXPOSURE
```

### ‏Conditional

```text
primary failure destination = RECONCILE_PREDICATE_AND_ORDER_LIFECYCLE
```

‏בשלושתם failure אינה authorization ל־fallback אגרסיבי.

---

## ‏6C.25 Telemetry

```text
relationship_type
parent_order_id
child_order_ids[]
parent_filled_qty
child_active_qty
protection_coverage_qty
oca_group_id
oca_group_members[]
oca_member_state
oca_group_potential_exposure
predicate_id
predicate_type
predicate_state
predicate_observed_ts
broker_activation_ts
execution_ledger_position
broker_reported_position
reconciled_position
exit_authority
protection_authority
cancel_request_ts
terminal_ts
late_effect_type
```

‏ה־telemetry צריכה לאפשר Reconstruction של **graph + group + predicate**, לא רק רשימת Orders שטוחה.

---

## ‏6C.26 Decision Record מומלץ

```text
CompositeCoordinationDecision {
  decision_id
  snapshot_id
  purpose
  dependency_plan
  coordination_plan
  condition_plan
  reconciled_position
  protection_requirement
  worst_case_executable_exposure
  exit_authority
  protection_authority
  capability_requirements[]
  acceptance_evidence_required[]
  failure_destination
}
```

‏כך אפשר להסביר איזה mechanism נבחר עבור איזו בעיה, במקום להסתמך על Broker order labels.

---

## ‏6C.27 Acceptance Tests

```text
1. Bracket, OCA/OCO and Conditional remain distinct taxonomy categories.
2. Bracket parent partial fill never assumes child coverage without broker-observed evidence.
3. UNTRANSMITTED never counts as protected.
4. Protection coverage is checked against reconciled_position, not intended parent quantity.
5. OCA/OCO is never treated as atomic mutual exclusion.
6. Every non-terminal OCA member contributes to worst-case potentially executable exposure.
7. OCA partial fill triggers quantity/group reconciliation before any new order side effect.
8. Conditional predicate state and post-condition order lifecycle are persisted separately.
9. Predicate activation never proves strategy intent is still valid.
10. Cancel-requested peer/child/conditional order remains potentially executable until terminal evidence.
11. Reconnect reconstructs dependency graph, OCA group state, predicate state, fills and position before READY.
12. Failure in any mechanism returns to reconciliation/fresh decision; it never auto-escalates aggression.
13. Same broker facts + same policy produce the same reconstructed ownership and semantic decision.
```

---

## ‏6C.28 Practitioner Insight

> ‏`ENGINE RULE` — “Orders קשורות” אינה category מקצועית מספקת.

‏הדרך לזכור:

```text
Bracket
= who depends on whom

OCA/OCO
= which peers must coordinate after execution

Conditional
= what predicate controls eligibility
```

‏והשאלה החשובה ביותר ב־Production היא לא “האם הברוקר תומך בזה?”, אלא:

```text
What can still execute concurrently
if messages, fills, cancels and activations cross in flight?
```

‏שם נמצאת ה־risk האמיתית של composite/coordination orders.

---

# ‏Checkpoint — סוף חלק 6C

‏יצרנו שכבת Decision אחידה ל־`Bracket`, ‏`OCA/OCO` ו־`Conditional`. ‏Bracket נשארת Composite/Dependency Structure; ‏OCA/OCO נשארת non-atomic mutual-exclusion/quantity-coordination relationship; ‏Conditional נשארת Predicate Policy שמופרדת מן ה־post-condition execution. ‏Partial Fill, reconnect ו־late effects מובילים תמיד ל־reconciliation ול־fresh decision, ו־Protection נמדדת מול `reconciled_position` ו־broker-observed executable state — לא מול graph מקומי או intended quantity.