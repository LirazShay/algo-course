# ‏Review 10 — R5 Closeout Audit: Engine Mapping & Capability Normalization

> ‏מטרת מסמך זה היא לאשר ש־`R5` סגר את פערי ה־Engine Mapping וה־Capability Normalization שהוגדרו ב־`08-FINAL-GAP-LIST.md`, בלי להקדים את שכבת ה־Failure/Survivability של `R6` ובלי לגלוש לשכבת ה־Practitioner של `R7`.

---

## ‏1. תוצאת ה־Audit

```text
AO-GAP-P0-17  PASS
AO-GAP-P1-10  PASS
AO-GAP-P1-11  PASS
AO-GAP-P1-12  PASS
AO-GAP-P1-13  PASS
AO-GAP-P1-14  PASS
AO-GAP-P1-15  PASS
AO-GAP-P1-16  PASS
AO-GAP-P1-18  PASS
```

‏לא נמצא פער `P0/P1` נוסף ששייך ל־`R5` ודורש Repair לפני המעבר ל־`R6`.

‏`AO-GAP-P1-17 — Execution Quality vs Trade Outcome` נשאר בכוונה ל־`R7`, כפי שנקבע ב־Final Gap List.

---

## ‏2. `AO-GAP-P0-17` — Capability Support מול Production Enablement

‏`09-IBKR-CAPABILITY-MATRIX.md` ו־`09B-ENGINE-MAPPING-AND-CANDIDATE-REGISTRY.md` מפרידים עכשיו שלושה דברים שונים:

```text
Availability / Documentation
Evidence
Enablement
```

‏ה־enablement ladder הקנוני הוא:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

‏Candidate live אינה מורשית רק משום ש־Broker capability מתועדת או נראתה ב־runtime.

‏בנוסף, Candidate rollout הוא ציר נפרד:

```text
DISABLED
SHADOW_ONLY
LIVE_ENABLED
```

‏Live materialization דורשת בו־זמנית `LIVE_ENABLED` וגם כל capability tuple נדרשת ב־`PRODUCTION_ENABLED`.

‏`PASS`.

---

## ‏3. `AO-GAP-P1-10` — Entry מול Exit

‏`10E-ENTRY-VS-EXIT-ASYMMETRY-DECISION-GUIDE.md` סוגר את האסימטריה במפורש:

```text
Entry no-fill
can end with NO_TRADE.

Exit no-fill
leaves reconciled_position exposed.
```

‏אותו Broker Primitive או `Behavior Candidate` יכול לשמש בשני הצדדים, אך Purpose, quantity truth, failure destination, TTL meaning ו־escalation policy אינם משותפים אוטומטית.

‏`PASS`.

---

## ‏4. `AO-GAP-P1-11` — Exit Feasibility כחלק מ־Entry

‏`10A` ו־`10E` הופכים Exit feasibility ל־Entry gate גלוי.

‏השאלה הקנונית היא:

```text
If this entry fills now,
can the resulting position plausibly be reduced / exited
within acceptable time, liquidity and price-risk constraints?
```

‏יכולת להיכנס אינה הוכחה שהכמות בטוחה ליצירה.

‏`PASS`.

---

## ‏5. `AO-GAP-P1-12` — Partial Fill היא Decision State חדשה

‏הכלל מופיע עכשיו לאורך 10A/10B/10C/10E וב־`09C`:

```text
PARTIAL
→ update execution truth
→ reconcile position / still-executable orders
→ refresh market / signal / protection state
→ fresh decision
```

‏אסור:

```text
remaining_qty
→ blindly resend previous order/candidate
```

‏ב־Entry ה־Partial Fill יוצרת Position שדורשת protection והחלטה חדשה על remainder; ב־Exit היא משאירה residual exposure שדורש החלטה חדשה.

‏`PASS`.

---

## ‏6. `AO-GAP-P1-13` — Mapping מ־Mode/Candidate ל־Broker Materialization

‏`09B` מגדיר pipeline קנוני:

```text
Trade Intent
→ Application Execution Mode
→ Behavior Candidate
→ Materialization Requirements
→ Capability Resolver
→ Concrete Broker Order Plan
```

‏`Candidate Registry` מחזיק במפורש:

```text
base broker primitive
broker TIF
attributes
routing requirement
broker algo requirement
application TTL requirement
Economic Price Bound requirement
capability requirements
failure destination profile
telemetry profile
```

‏וה־mapping אינו one-to-one: אותה `LMT` יכולה לממש Behaviors שונות, ואותה semantic family יכולה לקבל materialization שונה לפי route/path/capability.

‏`PASS`.

---

## ‏7. `AO-GAP-P1-14` — Candidate Rollout Lifecycle

‏ה־lifecycle הקנוני קיים עכשיו כציר policy נפרד:

```text
DISABLED
SHADOW_ONLY
LIVE_ENABLED
```

‏ב־`SHADOW_ONLY` מותר לבצע generation, elimination, hypothetical materialization ו־telemetry, אך אסור ליצור live Broker side effects.

‏זה נפרד לחלוטין מ־Capability enablement.

‏`PASS`.

---

## ‏8. `AO-GAP-P1-15` — Capability Matrix מסננת, לא בוחרת Winner

‏ה־contract מופיע ב־Part 9, `09B`, `10A` ו־`10D`:

```text
Capability Resolver
→ filters ineligible candidates
→ returns capability facts / evidence

Decision Engine
→ compares surviving candidates
→ chooses semantic winner
```

‏Capability confidence יכולה להיות Gate/Evidence dimension, אך אינה execution objective ואינה Score סמוי.

‏`PASS`.

---

## ‏9. `AO-GAP-P1-16` — Failure Destination לכל Execution Mode

‏`09C-FAILURE-DESTINATIONS-AND-OUTCOME-CONTRACTS.md` מגדיר מטריצה מפורשת עבור:

```text
PASSIVE
PRICE_IMPROVING
MIDPOINT_SEEKING
BROKER_MANAGED
AGGRESSIVE_CAPPED
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
```

‏מול:

```text
NO_FILL
PARTIAL
REJECT
UNKNOWN
STALE
```

‏Failure Destination אינה Order הבאה. היא המקום שאליו השליטה חוזרת, למשל:

```text
REDECIDE_ENTRY
REDECIDE_EXIT
RECONCILE_ORDER
RECONCILE_POSITION
RECONCILE_ORDER_AND_POSITION
REFRESH_CAPABILITY
CANCEL_AND_RECONCILE
PROTECTION_REVIEW
RECOVERY_RECONCILIATION
NO_NEW_SIDE_EFFECT
```

‏`PASS`.

---

## ‏10. `AO-GAP-P1-18` — Reason Codes אחידים

‏`09C` מגדיר namespaces קנוניים:

```text
ELIM_*
CAPABILITY_*
MATERIALIZATION_*
EXEC_*
STATE_*
STALE_*
RISK_*
SYSTEM_*
SELECT_*
```

‏Broker raw error code/message נשמרים בנפרד מן `normalized_reason_code`.

‏Reason Code מסבירה למה Candidate נפסלה/נבחרה או איזה Outcome נצפה; היא אינה Score ואינה Side Effect.

‏`PASS`.

---

## ‏11. Guardrails שנבדקו ב־R5 closeout

```text
AVAILABLE != PRODUCTION_ENABLED
CORE != LIVE_ENABLED
LIVE_ENABLED != capability authorization
SHADOW_ONLY != permission to submit
Capability Resolver != winner selector
NO_FILL != capability failure
REJECT != automatic fallback
PARTIAL != automatic continuation
UNKNOWN != retry signal
STALE != broker terminal state
Failure Destination != next order type
Reason Code != score
Broker error code != normalized semantic reason
```

‏כל אחד מן ה־contracts האלה מופיע ב־canonical source ואינו תלוי ב־legacy master.

---

## ‏12. מה בכוונה נשאר ל־R6

‏`R5` אינו סוגר את פערי production-safety הבאים:

```text
per-family Failure Contract
Order Survivability Matrix
Late Effect Taxonomy across families
Bracket partial-fill acceptance evidence
OCA/OCO non-atomic safety handling
UNTRANSMITTED != PROTECTED deep safety contract
position-first / ownership-first recovery
manual intervention ownership
shutdown semantics
READY earned after full reconciliation
```

‏אלה נשארים ל־`R6 — Failure Contracts, Survivability and Safety`.

---

## ‏13. Closeout Verdict

```text
R5 = COMPLETE

P0-17 = PASS
P1-10 = PASS
P1-11 = PASS
P1-12 = PASS
P1-13 = PASS
P1-14 = PASS
P1-15 = PASS
P1-16 = PASS
P1-18 = PASS
```

‏`09B` הוא ה־canonical bridge מ־Decision semantics ל־Broker materialization, ו־`09C` הוא ה־canonical bridge מ־execution outcome חזרה ל־fresh Decision.

‏השלב הבא לאחר closeout זה הוא `R6 — Failure Contracts, Survivability and Safety`; אין לבצע אותו כחלק מ־`R5`.