# ‏82 — Recommendation Sheet: Production v1 Design

> ‏מקור לימודי עיקרי: `../82-PRODUCTION-V1-DESIGN.md`.
>
> ‏מטרת הקובץ: להכריע כיצד להפוך את `Evidence MVP` למערכת `Production v1` אמינה מבחינת state, durability, reconciliation, recovery, observability, deployment, security ו־failure containment — בלי להפוך את הגרסה הראשונה לפלטפורמת HFT/Distributed מורכבת ובלי לבלבל `Production Ready` עם הרשאה למסחר בכסף אמיתי.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו אישור `Live`.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
How do we add more features to the MVP?
```

‏אלא:

```text
Can the same decision chain preserve truth,
contain failures,
recover deterministically,
remain observable,
and keep every critical external effect attributable
under realistic operational faults?
```

‏ברירת המחדל:

```text
Evidence MVP
+ Durable State
+ Explicit State Machines
+ Durable Intent
+ Idempotent External Effects
+ Broker/Simulator Reconciliation
+ Position-First Safety
+ Degraded / Safe Modes
+ Deterministic Recovery
+ Versioned Deployment / Rollback
+ Full Observability
+ Fault Acceptance Tests
= Production v1 Candidate
```

‏העיקרון המנחה:

```text
Operational Truth
> Recoverability
> Exit Capability
> Safety / Correctness
> Evidence Completeness
> Performance
> Feature Richness
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏`Production v1` הוא operational hardening של ה־MVP

‏השדרוג העיקרי יהיה:

- ‏Durability.
- ‏State ownership.
- ‏Reconciliation.
- ‏Recovery.
- ‏Failure containment.
- ‏Explicit degraded modes.
- ‏Observability.
- ‏Deployment / rollback discipline.
- ‏Security boundaries.
- ‏Versioned evidence.

‏לא נשתמש ב־`v1` כתירוץ להוסיף Signals, ML, providers או order tactics שאינם נדרשים לבשלות התפעולית.

### ‏`P0 — Required`: ‏`Modular Monolith` כברירת מחדל

‏למערכת אישית מומלץ להתחיל עם logical boundaries חזקים בתוך process אחד או מספר קטן של processes:

```text
MarketData
CanonicalState
Feature / Scanner
Decision
Risk / Eligibility
Execution
Position / Exit
Reconciliation
Journal
Observability
Replay
Control
```

‏פיצול פיזי יתווסף רק אם failure isolation, security, provider constraints או measured scaling מצדיקים אותו.

### ‏`P0 — Required`: Truth Sources מפורשים

| Domain | Source of Truth |
|---|---|
| Market state | Canonical state שנבנה מ־validated provider events |
| Active config | Immutable `ResolvedConfig` + fingerprint |
| Active strategy | Immutable `StrategyManifest` |
| Decision | Immutable `DecisionPacket` |
| Internal intent | Durable `OrderIntent` record |
| External orders / fills / positions | Broker/Simulator truth לאחר reconciliation |
| Current position projection | Fills + reconciliation |
| Recovery history | Snapshot + append-only journal |

‏אין `last writer wins` אקראי ל־state קריטי.

### ‏`P0 — Required`: ‏`UNKNOWN_EFFECT` הוא state מפורש

‏בכל external action:

```text
Durable Intent
→ Attempt External Effect
→ ACK / REJECT / UNKNOWN_EFFECT
```

‏ב־`UNKNOWN_EFFECT`:

```text
do not retry blindly
→ query external truth
→ reconcile
→ resolve
→ only then continue
```

### ‏`P0 — Required`: Position/Exit path עצמאי ובעל עדיפות

‏כאשר קיימת חשיפה בסימולציה/Paper:

```text
Position / Exit
> Active Orders
> New Entry Decisions
> Deep Candidate Analysis
> Research / Diagnostics
```

‏תקלה ב־Scanner או Learning אינה רשאית לבטל יכולת ניהול Position קיימת.

### ‏`P0 — Required`: ‏`UNKNOWN` חוסם new risk

‏`UNKNOWN`, ‏`NO_TRADE` ו־`TRADE` נשארים states שונים.

```text
Critical Unknown
→ EntryDisabled
→ Reconcile / Recover
→ Resume only after readiness is restored
```

### ‏`P0 — Required`: Startup אינו Ready

‏Startup sequence מומלץ:

```text
Load + Validate Config
→ Restore Snapshot
→ Replay Journal Tail
→ Connect Data
→ Connect Broker/Simulator
→ Reconcile Orders
→ Reconcile Positions
→ Warm Market State
→ Validate Freshness / Clock / Storage / Versions
→ READY for Shadow/Paper Decisions
```

### ‏`P0 — Required`: כל deployment הוא immutable identity

‏כל run מקושר ל־:

```text
BuildId
StrategyVersion
ConfigFingerprint
DataContractVersion
BrokerAdapterVersion
SchemaVersion
Environment
```

‏Config משמעותי הוא code מבחינת risk; שינויו יוצר identity חדש.

### ‏`P0 — Required`: ‏`Production Ready != Live Authorized`

‏הגדרת `Production v1 Ready` בקובץ זה פירושה:

```text
production-grade engineering baseline
for Replay / Shadow / Paper operation
```

‏היא אינה הרשאה למסחר בכסף אמיתי ואינה משנה את ה־scope של הפרויקט.

### ‏`P1 — Baseline`: Explicit operational modes

‏סט מינימלי:

```text
REPLAY
SHADOW
PAPER
ENTRY_DISABLED
EXIT_ONLY
RECONCILING
SAFE_MODE
STOPPED
```

‏מעברים בין modes הם events audited, לא booleans חבויים.

### ‏`P1 — Baseline`: Capability-based health

‏Health אינו boolean אחד.

‏נשמור לפחות:

```text
CanObserveMarket
CanRank
CanOpenNewExposure
CanManageExistingExposure
CanExit
CanReconcile
CanPersistCriticalState
CanRecover
```

‏כך failure ברכיב אחד אינו מחייב בהכרח השבתת כל capability.

### ‏`P1 — Baseline`: Bounded queues + backpressure

‏לכל queue ב־hot path:

```text
Capacity
OldestItemAge
OverflowPolicy
PriorityPolicy
```

‏`QueueAge` חשוב לפחות כמו queue length.

### ‏`P1 — Baseline`: Candidate / Feature / Score / Rank TTL

‏עבודה שפגה אינה נכנסת בחזרה ל־decision path רק מפני שהחישוב הסתיים.

‏Deep work late:

```text
expired candidate → discard result for current decision
```

### ‏`P1 — Baseline`: Pre-submit revalidation

‏לפני כל simulated/Paper external effect משמעותי נבדקים מחדש לפחות:

```text
freshness
eligibility
critical vetoes
position state
account/simulator state
cost/executability state
decision TTL
```

### ‏`P1 — Baseline`: Observability לפי domain

‏נפריד:

```text
System Health
Data Health
Decision Health
Execution Health
Position Health
Safety Health
Economic Research Health
```

‏PnL או outcome אינם Health Check יחיד.

### ‏`P1 — Baseline`: Fault-oriented acceptance

‏`Happy Path` אינו מספיק.

‏Acceptance כולל לכל הפחות:

- ‏provider disconnect/reconnect.
- ‏partial universe after reconnect.
- ‏stale Top-1.
- ‏duplicate/out-of-order events.
- ‏broker disconnect סביב submit.
- ‏partial fill + restart.
- ‏cancel/fill race.
- ‏unknown external effect.
- ‏orphan order/position.
- ‏disk-full/critical persistence failure.
- ‏clock drift.
- ‏queue backlog / CPU saturation / long pause.
- ‏second process / split-brain attempt.
- ‏rollback with persisted state.

### ‏`P1 — Baseline`: `Single Writer` / fencing

‏רכיב יחיד מחזיק authority לכל external execution domain נתון.

‏Instance ישן אינו יכול להמשיך לפעול לאחר leadership/generation change.

### ‏`P1 — Baseline`: Storage failure יכול לחסום side effects

‏אם אי־אפשר לשמור durable intent או evidence קריטי שנדרש ל־recovery:

```text
new external side effects blocked
existing state management continues where possible
```

### ‏`P2 — Improvement`: Shadow smoke לאחר deployment

‏לפני הפעלת Paper side effects אפשר להריץ את build החדש ב־Shadow כדי לוודא:

- ‏Data semantics.
- ‏Version identity.
- ‏Decision stability.
- ‏latency tails.
- ‏reconciliation readiness.

### ‏`P2 — Improvement`: richer dependency/capability matrix

‏לכל dependency:

```text
Can Enter?
Can Exit?
Can Reconcile?
Can Observe?
Can Recover?
```

‏מטרתה להחליף “service down = everything down” במדיניות מדויקת.

### ‏`P2 — Improvement`: automated incident packet

‏Incident משמעותי יאסוף אוטומטית:

```text
Timeline
Build / Strategy / Config identities
Data generations
Decision packets
Orders / fills
Position state
Health state
Recent events
First Divergence hints
```

### ‏`P2 — Improvement`: performance budgets לפי plane

‏לא optimize לפי תחושה.

‏מודדים לפחות:

```text
Ingestion
Feature update
Ranking
Decision
Pre-submit validation
Execution round trip
Position/Exit work
```

‏עם `p50/p95/p99` ו־queue age.

### ‏`P3 — Challenger`: provider failover

‏Provider חלופי יתווסף רק אם availability/operations evidence מצדיקים אותו, עם validation מפורש של semantics, timestamps, coverage ו־generation boundaries.

### ‏`P3 — Challenger`: process isolation נוסף

‏אפשר להפריד Execution/Position authority אם evidence מראה יתרון ממשי ב־fault isolation או security.

### ‏`P4 — Specialist`: distributed platform

‏Microservices, external streaming platform, feature store, multi-broker routing או complex deployment topology ייכנסו רק לאחר bottleneck או failure-domain מוכח.

---

## ‏3. Why

‏ה־MVP עונה האם Hypothesis ראויה למחקר. ‏`Production v1` צריך לענות האם אפשר לסמוך על המערכת גם כשהמציאות אינה Happy Path.

‏ב־short-horizon system, state ambiguity יכולה להיות חמורה יותר מהבדל קטן ב־latency: אם לא ברור אם order התקבל, אם partial fill יצר exposure, אם callback ישן שייך ל־generation הנוכחי, או אם local position תואמת external truth — אין משמעות מקצועית ל־Score מהיר יותר.

‏לכן v1 צריכה להיות “משעממת”: פחות magic, יותר explicit contracts, identities, durable boundaries, state machines, reconciliation ו־failure evidence.

---

## ‏4. Use When

‏ה־Production v1 baseline מתאים לאחר ש־Evidence MVP כבר מסוגל:

- ‏לסרוק ולדרג באופן Point-in-Time.
- ‏לשמור Top-K ו־Decision Snapshots.
- ‏לחשב costs/outcomes.
- ‏להריץ Replay reproducible.
- ‏לזהות `TRADE / NO_TRADE / UNKNOWN`.

‏ומבקשים כעת להוכיח שהמערכת יכולה לפעול לאורך sessions ארוכים ב־Shadow/Paper בלי לאבד truth או recoverability.

---

## ‏5. Do Not Use When

‏אין הצדקה לקרוא למערכת `Production v1` כאשר:

- ‏אין durable intent לפני external effect.
- ‏restart מאבד orders/positions.
- ‏`UNKNOWN_EFFECT` הופך אוטומטית ל־retry.
- ‏critical telemetry יכולה להיעלם בלי לשנות readiness.
- ‏אין replay parity.
- ‏אין דרך לדעת איזו version קיבלה decision.
- ‏אין kill/entry-pause semantics בדוקים.
- ‏happy path הוא כמעט כל ה־acceptance suite.

‏אין הצדקה להרחיב features לפני שהכשלים האלה נפתרו.

---

## ‏6. Alternatives

### ‏Baseline — Modular Monolith

‏העדפה הראשונית: deployment אחד פשוט עם contracts ו־ownership ברורים.

### ‏Option — Small Process Set

‏אפשר להפריד `Execution/Position` או persistence authority כאשר isolation/security מצדיקים זאת.

### ‏Advanced — Distributed Services

‏רק לאחר measurement של scaling, deployment independence או fault domains שאי־אפשר לפתור בפשטות.

---

## ‏7. Trade-offs

### ‏Durability מול Latency

‏Durable-before-effect מוסיף overhead, אך בלעדיו external side effects עלולים להפוך לבלתי ניתנים לשחזור. מודדים ומייעלים את ה־boundary; לא מסירים אותו בלי evidence.

### ‏Strict readiness מול Availability

‏Fail-closed יכול להפחית מספר decisions, אך מונע יצירת state חדש כאשר truth אינו אמין. יש להפריד `CanOpenNewExposure` מ־`CanManageExistingExposure`.

### ‏Monolith מול Isolation

‏Monolith פשוט יותר; process isolation יכול לשפר fault containment. ברירת המחדל היא logical separation, ואז physical separation רק בגלל evidence.

### ‏Rich telemetry מול Hot-path cost

‏Evidence מלא חיוני, אך observability עצמה צריכה bounded overhead, async export ו־cardinality discipline.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מכניס ל־v1 הראשוני:

- ‏Multi-broker orchestration.
- ‏Multi-provider active-active.
- ‏Microservices כיעד ארכיטקטוני.
- ‏External event bus ללא צורך מוכח.
- ‏Distributed feature store.
- ‏Complex ML ensembles.
- ‏Automatic retraining.
- ‏Automatic promotion.
- ‏מספר גדול של order tactics.
- ‏Complex smart-routing research.
- ‏Infrastructure שמכוונת ל־microseconds כאשר ה־signal אינו דורש זאת.

---

## ‏9. What to Add Later

‏מוסיפים רק לפי bottleneck/failure evidence:

- ‏provider failover אם availability היא bottleneck.
- ‏process isolation אם fault containment הוא bottleneck.
- ‏richer execution policies אם execution quality היא bottleneck.
- ‏capacity/scaling changes אם whole-universe load מוכיח צורך.
- ‏storage tiering אם retention cost הופך מהותי.
- ‏advanced security controls אם threat model/permissions מתרחבים.

---

## ‏10. Required Data / Evidence

‏לפני סימון `Production v1 Candidate` נדרש Evidence לפחות עבור:

### ‏State / Recovery

- ‏Snapshot + Journal rebuild.
- ‏restart עם Position/Open Order מדומים קיימים.
- ‏partial fill + restart.
- ‏unknown external effect + reconciliation.
- ‏orphan detection.

### ‏Data

- ‏FreshCoverage.
- ‏gap/duplicate/out-of-order rates.
- ‏reconnect generation behavior.
- ‏candidate/data/feature ages.

### ‏Execution / Position

- ‏submit/ack/fill/cancel timing.
- ‏partial-fill lifecycle.
- ‏cancel/fill races.
- ‏TimeToFlat.
- ‏pending exposure duration.

### ‏Safety

- ‏entry block under critical unknown.
- ‏kill/entry-pause semantics.
- ‏safe/degraded mode transitions.
- ‏single-writer/fencing behavior.

### ‏Evidence / Versions

- ‏ReplayParityRate.
- ‏EvidenceCompletenessRate.
- ‏StrategyManifest coverage.
- ‏ConfigFingerprint coverage.
- ‏correlation chain completeness.

### ‏Performance

- ‏representative whole-universe load.
- ‏burst load.
- ‏soak run.
- ‏p50/p95/p99 stage latency.
- ‏queue age/backpressure behavior.

---

## ‏11. Promotion Criteria

‏`Production v1` יכול לעבור מ־candidate ל־accepted architecture for Shadow/Paper רק כאשר:

1. ‏כל P0 truth sources ו־state machines מוגדרים ונבדקים.
2. ‏אין retry עיוור לאחר unknown external effect.
3. ‏restart/reconnect reconstructs critical state deterministically.
4. ‏reconciliation מטפל ב־mismatch/orphan scenarios.
5. ‏critical unknown חוסם new side effects שמגדילים exposure.
6. ‏position/exit handling ממשיך גם כאשר entry/scanner path degraded ככל שניתן.
7. ‏Replay parity עומדת ביעד שנקבע מראש.
8. ‏critical evidence completeness עומדת ביעד.
9. ‏failure scenarios עוברים לפי expected invariants, לא רק “לא קרס”.
10. ‏latency/throughput budgets עומדים בעומס מייצג וב־tails.
11. ‏deployment, rollback, schema compatibility ו־runbook נבדקו.
12. ‏אין P0/P1 operational blockers פתוחים לפי policy שנקבעה מראש.

‏Promotion זה אינו Live approval.

---

## ‏12. Rejection Criteria

‏נדחה `Production v1` או נחזיר אותו ל־Shadow/Research אם אחד מאלה מתקיים:

- ‏state קריטי יכול להפוך ambiguous ללא block מתאים.
- ‏duplicate submit אפשרי לאחר lost acknowledgment.
- ‏local order/position state אינו ניתן ל־reconciliation.
- ‏restart/reconnect משנה silently behavior או state.
- ‏stale generation events יכולים לזהם state חדש.
- ‏critical persistence failure אינו חוסם external effects מתאימים.
- ‏exit handling תלוי ב־scanner healthy.
- ‏split-brain/single-writer failure אינו מזוהה.
- ‏build/config/version identity חסרים בהחלטות.
- ‏critical telemetry חסרה בזמן incident.
- ‏replay אינו מסביר production-like behavior.
- ‏p95/p99/queue age חורגים באופן שמאבד decision relevance.
- ‏rollback אינו בטוח מול persisted schema/state.

---

## ‏13. Metrics

### ‏State / Reliability

```text
UnknownEffectRate
ReconciliationMismatchRate
OrphanOrderCount
OrphanPositionCount
RecoveryTime
InvalidTransitionCount
```

### ‏Data / Decision

```text
FreshCoverage
CandidateAgeAtDecision
RankAge
HealthyNoTradeRate
BrokenNoTradeRate
ReplayParityRate
```

### ‏Execution / Position

```text
SubmitLatencyP50/P95/P99
BrokerRoundTripP50/P95/P99
FillLatency
PendingExposureDuration
TimeToFlat
ExitGiveback
```

### ‏Safety

```text
EntryBlockedBySafetyRate
SafeModeActivations
KillSwitchActivations
DuplicateEffectPreventedCount
SingleWriterViolationCount
```

### ‏Evidence / Operations

```text
EvidenceCompletenessRate
IncidentPacketCompleteness
RollbackTestPassRate
RecoveryScenarioPassRate
FalseAlertRate
```

### ‏Economic Research

```text
EdgeAtDetection
EdgeAtSubmit
EdgeAtFill
NetEdgeRetained
CostRatio
PostFillMarkout
```

‏Economic metrics אינם תחליף ל־operational readiness.

---

## ‏14. Failure Modes

1. ‏**Local-truth illusion** — המערכת מאמינה ל־memory במקום ל־reconciliation.
2. ‏**Blind retry** — lost acknowledgment יוצר effect כפול.
3. ‏**Zombie generation** — callbacks ישנים מעדכנים session חדש.
4. ‏**Partial-fill blindness** — exposure קיים אך state עדיין מתייחס ל־order כלא מלא.
5. ‏**Cancel certainty illusion** — cancel request נתפס כ־cancelled למרות race.
6. ‏**Orphan effect** — order/position חיצוני ללא owner פנימי.
7. ‏**Restart amnesia** — process עולה בלי reconstruct מלא.
8. ‏**Safe-mode theater** — mode קיים בשם אך אינו חוסם new risk בפועל.
9. ‏**Exit dependency inversion** — exit דורש scanner/entry stack healthy.
10. ‏**Telemetry blindness** — incident קורה אך אין evidence מספיק ל־RCA.
11. ‏**Queue-age blindness** — throughput נראה טוב אך decisions מבוססים על עבודה ישנה.
12. ‏**Version ambiguity** — לא ברור איזה build/config/strategy פעל.
13. ‏**Rollback trap** — artifact ישן אינו תואם state/schema חדש.
14. ‏**Split brain** — שני executors מחזיקים authority במקביל.
15. ‏**Premature distribution** — complexity של infrastructure מגדילה failures בלי לפתור bottleneck.
16. ‏**PnL-as-health** — outcome טוב מסתיר state corruption.
17. ‏**Feature creep before hardening** — signal work דוחה תיקוני correctness/recovery.

---

## ‏15. User-Specific Application

‏למערכת האישית שנבנית סביב short-horizon whole-universe research, ההמלצה היא לשמור על אותו core שנבדק ב־MVP ולהקשיח סביבו את המעטפת, במקום לשכתב אותו לפלטפורמה חדשה:

```text
Modular Monolith
+ Broad Fast Scan
+ Small Top-N Deep Path
+ One Canonical Decision Pipeline
+ Hard Validity / Economic Vetoes
+ Full Decision Snapshots
+ Durable Intent
+ Reconciliation
+ Position-First Scheduling
+ Deterministic Replay
+ Shadow/Paper Operational Soak
```

‏ההתקדמות הנכונה לאחר MVP אינה “עוד אלגוריתם”, אלא הוכחה שהמערכת יודעת לשמור truth כאשר connections, timing ו־state אינם מושלמים.

---

## ‏16. Confidence

### ‏High Confidence

‏עקרונות אלה יציבים הנדסית:

- ‏explicit truth sources.
- ‏durable-before-effect.
- ‏idempotency/reconciliation.
- ‏explicit unknown state.
- ‏position-first recovery/safety.
- ‏versioned config/build identity.
- ‏fault-oriented acceptance.
- ‏logical boundaries לפני distribution.

### ‏Medium Confidence

‏הפרטים הבאים תלויים implementation/workload ולכן דורשים measurement:

- ‏process boundaries מדויקים.
- ‏queue capacities.
- ‏TTL thresholds.
- ‏latency budgets.
- ‏retention horizons.
- ‏failover topology.
- ‏מספר worker partitions.

---

## ‏17. Time-Sensitive Facts

‏המלצה זו אינה מקבעת APIs, Broker capabilities, account permissions, fee schedules, rate limits או provider semantics כעובדות נצחיות.

‏כל integration חיצוני יישמר כ־versioned contract וייבדק מחדש כאשר משתנים:

```text
Broker / Simulator Adapter
Market Data Provider
API Version
Account Permissions
Rate Limits
Session Semantics
Data Coverage
Schema / Status Codes
```

‏אין צורך בעובדה חיצונית עדכנית כדי לקבל את החלטת הארכיטקטורה של המקטע; לפני שימוש תפעולי בממשק חיצוני ספציפי יש לאמת את החוזה הנוכחי שלו.

---

## ‏סיכום Baseline

```text
Keep the MVP decision core.
Harden truth, state and recovery around it.
Persist before external effects.
Reconcile instead of guessing.
Treat UNKNOWN as a real state.
Prioritize existing exposure over new opportunity.
Make failures replayable.
Make deployments/version changes explicit.
Measure tails and queue age.
Add infrastructure only when evidence demands it.
```

‏`Production v1` נחשב הצלחה כאשר הוא יכול להיכשל באופן מפורש, להישאר explainable ולהתאושש באופן deterministic ב־`Replay / Shadow / Paper` — לא כאשר הוא פשוט מכיל יותר Features.