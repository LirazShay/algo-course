# ‏R6 Closeout Audit — Failure Contracts, Survivability and Safety

> ‏מטרת המסמך: לאמת שכל הפערים שהוקצו ל־`R6` ב־`08-FINAL-GAP-LIST.md` נסגרו במקור הקנוני, בלי להקדים עבודת `R7/R8/R9`.
>
> ‏Scope: Advanced Orders בלבד — failure semantics, survivability, protection graphs, reconciliation, ownership, recovery, shutdown ו־earned `READY`.

---

## ‏1. תוצאת ה־Closeout

```text
R6 RESULT = PASS
SOURCE CORRECTION REQUIRED DURING CLOSEOUT = NO
```

‏שלושת מקורות התיקון המרכזיים של `R6` הם:

```text
08B-FAILURE-CONTRACTS-AND-ORDER-SURVIVABILITY.md
08C-BRACKET-OCA-AND-PROTECTION-DEEP-SAFETY.md
08D-RECOVERY-OWNERSHIP-SHUTDOWN-AND-READY.md
```

‏Part 8, ‏8A, ‏9C, ‏10C ו־10D מספקים את ה־lifecycle / outcome / authority foundation שעליו שלושת הפרקים האלה נשענים.

---

## ‏2. `P0` Gaps של `R6`

| Gap | Status | Canonical closure |
|---|---|---|
| `AO-GAP-P0-10` — Bracket Parent Partial-Fill uncertainty | `PASS` | ‏`08C` משאירה Child activation/quantity semantics כ־`ACCEPTANCE TEST REQUIRED` ומגדירה Acceptance Matrix לפי capability tuple. |
| `AO-GAP-P0-11` — OCA/OCO עלולות להיקרא atomic | `PASS` | ‏`08C` קובעת `MUTUAL-CANCEL INTENT != ATOMIC EXECUTION GUARANTEE`, מוסיפה race matrix ו־worst-case concurrent executable exposure. |
| `AO-GAP-P0-12` — Failure Contract per family | `PASS` | ‏`08B` מגדירה `FailureContract` אחיד ומיישמת אותו על Static Limit, liquidity/display attributes, Pegged/Relative, MidPrice, Adaptive, Snap, Sweep, MTL, Trigger/Trailing, Bracket, OCA/OCO, Conditional ו־local dynamic exit. |
| `AO-GAP-P0-13` — Order Survivability Matrix | `PASS` | ‏`08B` כוללת matrix שמפרידה implementation owner, residency/persistence, process death, session restart, late effects ו־recovery requirement. |
| `AO-GAP-P0-14` — `UNTRANSMITTED != PROTECTED` | `PASS` | ‏`08B` ו־`08C` מקבעות זאת כ־invariant; `08C` דורשת remote acceptance evidence לפני `FULLY_PROTECTED_VERIFIED`. |
| `AO-GAP-P0-15` — Position-First / Ownership-First Recovery | `PASS` | ‏`08D` מגדירה סדר Recovery שמתחיל ב־Position, potentially executable Orders ו־Authority לפני Strategy intent. |
| `AO-GAP-P0-16` — `READY` חייב להיות earned | `PASS` | ‏`08D` מגדירה `CONNECTED != HANDSHAKE_READY != RECOVERED != READY` ו־READY gate קנוני המבוסס reconciliation + safety invariants. |

---

## ‏3. `P1` Gaps של `R6`

| Gap | Status | Canonical closure |
|---|---|---|
| `AO-GAP-P1-26` — Late Effect Taxonomy | `PASS` | ‏`08B` מגדירה `LATE_FILL`, ‏`LATE_PARTIAL_FILL`, ‏`LATE_TRIGGER`, ‏`LATE_REPRICE`, ‏`LATE_TRANSFORMATION`, ‏`LATE_CHILD_ACTIVATION`, ‏`LATE_SIBLING_CANCEL`, ‏`LATE_REJECT`, ‏`LATE_MODIFY_ACK`, ‏`LATE_CANCEL_ACK`, ‏`LATE_EXECUTION_CORRECTION`; `08C` מוסיפה late effects ייעודיים ל־Protection Graph. |
| `AO-GAP-P1-27` — Manual Intervention משנה Ownership | `PASS` | ‏`08C` ו־`08D` מבטלות ownership assumptions שנפגעו, חוסמות conflicting automation ומחייבות reconciliation לפני new risk. |
| `AO-GAP-P1-28` — Shutdown אינו `cancel everything` | `PASS` | ‏`08D` מגדירה policy לפי order/position category, Graceful Shutdown sequence, shutdown outcomes ו־persistent recovery obligations. |
| `AO-GAP-P1-29` — Recovery לא מחייה Signal שפג | `PASS` | ‏`08D` מפרידה `historical_signal_record` מ־`current_signal_validity`; Signal שפג אינה authority ל־Entry לאחר restart. |

---

## ‏4. Safety requirements מ־Review 6 שאינם Gap ID עצמאי

‏גם הדרישות הבאות נבדקו ונמצאו מכוסות:

```text
submit request != broker acceptance
cancel request != terminal non-executable
working order != valid current intent
application TTL expiry != remote termination
broker-managed repricing may continue after local signal expiry
unknown trigger state != not triggered
Market-to-Limit transformation state must be recovered
Trailing state is path-dependent
Bracket recovery rebuilds a protection graph, not only order IDs
OCA/OCO recovery reconstructs every member
manual external change invalidates local authority assumptions
shutdown residue must be reconciled on next startup
execution correction can invalidate previously derived position/protection truth
FLAT now != FLAT_CONFIRMED
```

‏אין צורך ב־Source repair נוסף עבור `R6D`.

---

## ‏5. Acceptance evidence נשארת Requirement — לא Knowledge claim

‏`R6_COMPLETE` אינו אומר שכל Broker path כבר עבר Live acceptance.

‏הוא אומר שהקורס מלמד נכון **מה חייב להיבדק** לפני `PRODUCTION_ENABLED`.

‏במיוחד נשארים evidence-driven:

```text
Bracket child activation after parent partial fill
Bracket child quantity evolution
OCA/OCO sibling timing and quantity behavior
residency / survivability per capability tuple
trigger state recovery
broker-algo / peg survivability
TWS/session restart semantics
manual-intervention behavior
late-event handling
```

> ‏`ENGINE RULE` — Course repair completion אינה מחליפה Capability acceptance evidence.

---

## ‏6. Cross-wave boundary

‏הנושאים הבאים **אינם** blockers של `R6` ונשארים ל־waves שלהם:

```text
R7 — Practitioner Judgment Layer
R8 — Cross-References, Glossary and Final Course Cleanup
R9 — Deterministic Assembler and Compact Print Viewer
```

‏בפרט `AO-GAP-P1-25` — normalization presentation של `Native / Simulated / Resident / Client-Managed` — נשאר ל־`R8`, אף שה־safety semantics עצמן כבר הופרדו ב־`08B`.

---

## ‏7. Final R6 Invariants

```text
Order name != survivability guarantee
Capability path determines persistence assumptions
Broker-Simulated != Broker-Resident
Submit request != broker acceptance
Cancel request != terminal non-executable
Non-terminal order remains potentially executable until evidence says otherwise
Working order != valid current intent
Application TTL expiry != remote kill switch
UNTRANSMITTED != PROTECTED
OCA/OCO coordination != atomic execution
Protected target qty = abs(reconciled_position)
Partial fill => fresh position/protection decision
Recovery != resume old decision
Position truth precedes strategy intent
Ownership truth precedes new side effects
Manual intervention invalidates affected ownership assumptions
Shutdown != cancel everything
Expired signal is never revived by recovery
CONNECTED != READY
READY must be earned
FLAT now != FLAT_CONFIRMED
```

---

## ‏8. Closeout Decision

```text
AO-GAP-P0-10  PASS
AO-GAP-P0-11  PASS
AO-GAP-P0-12  PASS
AO-GAP-P0-13  PASS
AO-GAP-P0-14  PASS
AO-GAP-P0-15  PASS
AO-GAP-P0-16  PASS

AO-GAP-P1-26  PASS
AO-GAP-P1-27  PASS
AO-GAP-P1-28  PASS
AO-GAP-P1-29  PASS

R6_COMPLETE = YES
```

‏השלב הבא לאחר checkpoint זה הוא `R7 — Practitioner Judgment Layer`. אין להתחיל אותו במסגרת `R6D`.