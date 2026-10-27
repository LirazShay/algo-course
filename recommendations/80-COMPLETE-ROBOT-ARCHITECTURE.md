# ‏80 — Recommendation Sheet: Complete Robot Architecture

> ‏מקור לימודי עיקרי: `../80-COMPLETE-ROBOT-ARCHITECTURE.md`.
>
> ‏מטרת הקובץ: להכריע כיצד לחבר את שכבות ה־Data, ‏Decision, ‏Execution, ‏Position/Exit, ‏Control, ‏Evidence/Replay ו־Learning לארכיטקטורה אחת, עם Truth Sources, ‏Contracts, ‏State Machines ו־Failure Boundaries מפורשים — בלי להפוך רובוט אישי ל־distributed/HFT platform מיותרת.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו אישור Production למסחר אמיתי.

---

## ‏1. Decision

‏השאלה המרכזית היא:

```text
What is the smallest architecture
that preserves correct state, recoverability, exit capability,
point-in-time evidence, reproducibility and failure containment
while keeping the short-horizon decision path fast enough to study honestly?
```

‏ברירת המחדל:

```text
Provider-Agnostic Data
→ Canonical State
→ Fresh / Versioned Features
→ Eligibility
→ Fair Cross-Sectional Ranking
→ Negative Evidence
→ Execution / Economic Feasibility
→ Explicit Decision
→ Durable Order Intent
→ Broker/Simulator-Reconciled Execution
→ Position-First Exit Control
→ Immutable Evidence
→ Replay / RCA / Learning
```

‏העיקרון המנחה:

```text
Correct State
> Recoverability
> Exit Capability
> Freshness
> Economic Realism
> Latency Optimization
> Architectural Elegance
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: שבעה Planes עם authority ברור

```text
Data Plane
Decision Plane
Execution Plane
Position / Exit Plane
Control Plane
Evidence / Replay Plane
Learning Plane
```

‏הרכיבים יכולים להתחיל באותו process, אבל האחריות וה־contracts נשארים נפרדים.

‏`Learning Plane` אינו מקבל Production authority ואינו משנה Strategy פעילה אוטומטית.

### ‏`P0 — Required`: Truth Source מפורש לכל State

‏לא משתמשים ב־“מי שעדכן אחרון” כמנגנון אמת.

| State | Source of Truth מומלץ |
|---|---|
| Market state | Canonical projection של validated market events |
| Feature state | Versioned Feature Engine output |
| Decision | Immutable `DecisionPacket` |
| Order intent | Durable internal intent journal |
| Orders/Fills/Positions | Broker/Simulator truth לאחר reconciliation |
| Account eligibility | Account State Service עם freshness |
| Active strategy | Immutable `StrategyManifest` / registry |
| Research result | Versioned evidence artifacts |

### ‏`P0 — Required`: ‏`UNKNOWN` הוא State אמיתי

‏אסור למפות `UNKNOWN` ל־`false`, ‏`0`, ‏empty collection או `NO_TRADE`.

```text
Unknown critical state
→ block new simulated/paper exposure
→ keep reconciliation alive
→ keep position/exit capability alive where possible
```

### ‏`P0 — Required`: Exit path עצמאי מה־Scanner

‏`Position / Exit Plane` ממשיך לפעול גם כאשר Scanner, Ranking או Learning מושבתים.

‏בעת resource pressure:

```text
Open Positions / Exit
> Active Orders
> Top Candidates
> Broad Exploration
```

### ‏`P0 — Required`: Decision אינו Order

‏השרשרת המחייבת:

```text
Decision
→ Pre-Submit Revalidation
→ Durable OrderIntent
→ Idempotent Submit
→ Broker/Simulator Reconciliation
→ Position State
```

‏אין network call לפני ש־intent משמעותי ניתן לשחזור.

### ‏`P0 — Required`: ‏`UNKNOWN_EFFECT` אינו Retry

‏אם submit/cancel/replace נקטע באמצע:

```text
UNKNOWN_EFFECT
→ query external truth
→ reconcile
→ resolve state
→ only then continue
```

### ‏`P0 — Required`: Immutable Events + Mutable Projections

‏Market events, decisions, intents, execution events, transitions ו־operator actions נשמרים append-only ככל האפשר.

‏Current state הוא projection שניתן לבנייה מחדש.

---

## ‏3. Why

‏Short-horizon system נכשל לעיתים לא בגלל signal חלש אלא בגלל ambiguity: stale data, duplicate submit, split brain, partial fill שלא נחשב exposure, callback מדור ישן, config שהשתנה בשקט או restart שלא reconciled.

‏לכן Architecture צריכה להקטין ambiguity לפני שהיא ממקסמת throughput.

‏הפרדת planes מאפשרת failure containment: תקלה ב־Daily Review אינה משביתה Exit; תקלה ב־research warehouse אינה משנה Broker truth; תקלה ב־Scanner אינה הופכת Position קיימת לבלתי ניתנת לניהול.

---

## ‏4. Use When

‏הארכיטקטורה הזו מתאימה כאשר המערכת צריכה בו־זמנית:

- ‏לסרוק universe רחב בקצב גבוה יחסית.
- ‏להחזיק state point-in-time ומדיד.
- ‏לשמור Top-K ו־counterfactual evidence.
- ‏לדמות lifecycle של orders/fills באופן ריאליסטי.
- ‏להתאושש מ־restart/reconnect ללא ניחוש.
- ‏להריץ Replay/Shadow על אותו Domain Core.
- ‏להשוות StrategyVersions בלי לזהם את ה־Champion.

---

## ‏5. Do Not Use When

‏אין הצדקה לבנות את כל השכבות כמיקרו־שירותים עצמאיים רק מפני שה־diagram מאפשר זאת.

‏אין הצדקה ל־co-location, ‏FPGA, ‏kernel bypass או nanosecond stack כאשר ה־hypothesis נבחנת בטווחים ארוכים משמעותית.

‏אם אין עדיין event journal, state machine ברור, reconciliation ו־replayability — פיצול נוסף של processes בדרך כלל מגדיל complexity לפני שהוא פותר את הבעיה העיקרית.

---

## ‏6. Alternatives

### ‏Baseline — Modular Monolith / Small Process Set

‏מומלץ להתחיל מ־process קטן או מספר קטן של processes עם logical boundaries חזקים.

```text
MarketDataAdapter
CanonicalMarketState
FeatureEngine
Scanner / Ranker
NegativeEvidenceEngine
DecisionEngine
Risk / Eligibility
ExecutionEngine
PositionManager
ReconciliationService
Journal
Observability
ReplayEngine
```

### ‏Advanced — Separate Execution/Position Authority

‏כאשר failure isolation או lifecycle ownership מצדיקים זאת, ניתן להפריד authority של orders/positions מה־scanner process.

### ‏Specialist — Distributed Services

‏רק כאשר scaling, independent deployment או fault domains מוכיחים צורך ממשי.

---

## ‏7. Trade-offs

### ‏KISS מול Isolation

‏Process אחד פשוט יותר לתפעול ול־debugging; הפרדת authority משפרת failure containment. ברירת המחדל: **logical separation first, physical separation only with evidence**.

### ‏Freshness מול Throughput

‏עיבוד כל event יכול להעמיס; `work coalescing` יכול להיות נכון ל־derived state, כל עוד raw evidence נשמר ו־semantics ברורים.

### ‏Latency מול Evidence

‏לא מכניסים persistence/analytics כבדים ל־Hot Path, אבל גם לא מסירים את ה־minimum evidence שנדרש לשחזור החלטה.

### ‏Caching מול Correctness

‏Cache stale יכול להיות מסוכן יותר מחישוב איטי. Cache נמדד על correctness ו־freshness, לא רק hit rate.

---

## ‏8. What I Would Avoid Initially

- ‏Microservices רבים.
- ‏Global distributed consensus למערכת אישית.
- ‏Custom ultra-low-latency infrastructure לפני measurement.
- ‏Hot reload חופשי של behavior-changing config.
- ‏Unbounded queues.
- ‏Shared mutable globals שמשפיעים על decision path.
- ‏Hidden retries ל־broker actions.
- ‏Dashboard כ־truth source.
- ‏Research jobs עם trading credentials.
- ‏Complex orchestration כאשר modular monolith מספיק.

---

## ‏9. What to Add Later

### ‏`P1`

- ‏Dependency capability matrix: `CanEnter / CanExit / CanReconcile / CanObserve / CanRecover`.
- ‏Per-stage latency budgets ו־tail histograms.
- ‏Feature dependency graph ו־TTL enforcement.
- ‏Golden restart/reconnect/partial-fill scenarios.
- ‏Version-aware Decision/Intent/Position packets.

### ‏`P2`

- ‏Symbol partitioning/sharding אם measurement מצדיק.
- ‏Deep-path cancellation כאשר candidate expired.
- ‏Schema compatibility automation.
- ‏Cross-component trace stitching.
- ‏Automated replay smoke on deploy.

### ‏`P3`

- ‏Isolated shadow challenger workers.
- ‏Fault injection רחב יותר.
- ‏Automatic `StrategyDiff → ValidationScope` integration.

### ‏`P4`

- ‏Physical service decomposition, specialized low-latency transport או advanced deployment topology — רק אם bottleneck נמדד.

---

## ‏10. Required Data / Evidence

‏לפני קבלת החלטה ארכיטקטונית משמעותית נדרש לפחות:

```text
Per-stage p50/p95/p99 latency
Queue age / depth / overflow behavior
FreshCoverage
Data gap / duplicate / out-of-order rates
Decision age and expiry rate
Submit/Ack/Fill/Cancel timelines
UNKNOWN_EFFECT count and resolution time
Reconciliation mismatch rate
TimeToFlat
Restart / reconnect recovery evidence
Resource usage and allocation pressure
Replay determinism rate
Decision snapshot completeness
```

‏יש למדוד גם `LatencyPressure = EndToEndLatency / SignalHalfLife`, משום שמספר latency אבסולוטי ללא signal horizon אינו מספיק.

---

## ‏11. Promotion Criteria

‏רכיב או פיצול ארכיטקטוני מתקדם רק אם הוא:

1. ‏משפר correctness, isolation, recoverability, evidence quality או latency בצורה מדידה.
2. ‏אינו שובר State Machine או Truth Source קיימים.
3. ‏שומר Exit capability תחת failure רלוונטי.
4. ‏עובר replay ו־fault scenarios מתאימים.
5. ‏אינו יוצר `UNKNOWN` חדש ללא handling מפורש.
6. ‏מגיע עם observability ו־rollback path.
7. ‏מצדיק את Complexity Tax שלו.

---

## ‏12. Rejection Criteria

‏נפסול שינוי אם:

- ‏הוא משפר benchmark אבל פוגע ב־recovery או reconciliation.
- ‏הוא מוסיף network/process boundary ללא failure/scaling benefit מדיד.
- ‏הוא דורש silent shared mutable state.
- ‏הוא הופך Exit לתלוי ב־Scanner.
- ‏הוא מסתיר broker/provider semantics במקום לנרמל אותם במפורש.
- ‏הוא מקטין latency ממוצעת אך מגדיל tails קריטיים.
- ‏הוא מונע deterministic replay או version attribution.
- ‏אי־אפשר להסביר מה קורה בזמן partial failure.

---

## ‏13. Metrics

### ‏Data

- ‏`FreshCoverage`.
- ‏event lag.
- ‏gap/duplicate/out-of-order rate.
- ‏generation mismatch count.

### ‏Decision

- ‏decision latency.
- ‏decision age.
- ‏Top1 age.
- ‏rank churn/gap.
- ‏`NO_TRADE` / `UNKNOWN` rate by reason.

### ‏Execution / Position

- ‏submit/ack/fill/cancel latency.
- ‏partial-fill rate.
- ‏`UNKNOWN_EFFECT` rate.
- ‏reconciliation mismatches.
- ‏`TimeToFlat`.
- ‏exit giveback.

### ‏Safety / Recovery

- ‏unknown exposure count.
- ‏duplicate prevention events.
- ‏split-brain/fencing violations.
- ‏recovery success rate.
- ‏time to reconciled state.

### ‏Evidence

- ‏Decision Packet completeness.
- ‏Replay determinism.
- ‏version attribution completeness.
- ‏incident reproducibility.

---

## ‏14. Failure Modes

### ‏Stale Generation Callback

‏Event מדור ישן מעדכן state חדש.

‏מניעה: `DataGeneration` + reject cross-generation mutation.

### ‏Duplicate Submit

‏Retry לאחר timeout יוצר order נוסף.

‏מניעה: durable intent + stable client ID + idempotency + reconciliation.

### ‏Cancel/Fill Race

‏המערכת מסמנת cancelled לפני external truth.

‏מניעה: explicit state machine; cancel request אינו cancellation confirmation.

### ‏Partial Fill Hidden as Order State

‏נוצר exposure אך Position Plane אינו יודע עליו.

‏מניעה: כל fill מעדכן position truth מיד.

### ‏Scanner Failure Blocks Exit

‏Boundary שגוי בין Decision ל־Position/Exit.

‏מניעה: dedicated position authority ו־resource priority.

### ‏Unbounded Queue

‏Latency עולה בשקט עד שה־signal כבר expired.

‏מניעה: bounded queues, age metrics, shedding ו־expiry.

### ‏Silent Config Mutation

‏Behavior משתנה ללא StrategyVersion חדש.

‏מניעה: canonical config fingerprint + transition event.

### ‏False Healthy State

‏Metrics/PnL נראים תקינים בזמן שחסר telemetry קריטי.

‏מניעה: observability health הוא חלק מ־readiness.

---

## ‏15. User-Specific Application

‏למערכת ה־Short-Horizon המחקרית שלנו ההמלצה היא להתחיל **פשוט אך לא נאיבי**:

```text
P0 Canonical market state + time/freshness semantics
P0 Decision / Order / Position explicit state machines
P0 durable event journal and decision snapshots
P0 idempotent intent + reconciliation
P0 position-first exit authority
P0 risk / eligibility / account-state gates
P0 strategy/config/version identity
P0 replayable domain logic
P1 whole-universe fast scan + Top-N deep path
P1 bounded queues + backpressure + priorities
P1 structured metrics/logs/traces
P1 startup/reconnect recovery gates
P2 fault injection / soak / burst testing
P2 challenger isolation and counterfactual store
P3 physical process separation where evidence supports it
P4 HFT-specific infrastructure only if the research horizon ever proves a real need
```

‏ה־MVP הבא צריך לחתוך מתוך הארכיטקטורה הזו את **המינימום שמספיק לייצר Evidence אמין**, ולא לנסות לממש מראש כל service אפשרי.

---

## ‏16. Confidence

- ‏**High** — Truth Sources מפורשים, State Machines, idempotency, reconciliation, Exit independence, bounded queues, immutable evidence ו־versioning הם בסיס חזק ל־correctness/reproducibility.
- ‏**High** — logical separation before premature distribution מתאים לרובוט אישי.
- ‏**Medium** — הגבול המדויק בין processes, worker counts, queue capacities ו־latency budgets תלוי measurement אמיתי.
- ‏**Hypothesis** — אילו optimizations ספציפיים ישמרו יותר short-horizon edge דורש benchmark ו־Replay/Shadow evidence.

---

## ‏17. Time-Sensitive Facts

‏ההמלצה הארכיטקטונית עצמה כמעט אינה תלויה בעובדות רגולטוריות משתנות.

‏עם זאת, `BrokerAdapter`, ‏`AccountStateService`, ‏permissions, ‏order capabilities, ‏market-data semantics ו־session/calendar data הם external dependencies שצריך version ולבדוק מחדש כאשר משתמשים בהם בפועל.

---

## ‏18. Relationship to Existing Recommendations

- ‏29/32 — Broker API boundaries והפרדת Market Data מ־Execution.
- ‏33 — Production State Machine.
- ‏34 — Recovery / Safe Resume.
- ‏35 — Observability.
- ‏36 — Safety / Kill Switches.
- ‏50/51/52/53/54/55 — Scanner, Execution, Data, Testing, Performance ו־Operations best practices.
- ‏60/60A — Ranking fairness ו־Negative Evidence.
- ‏71 — Account mechanics כ־eligibility dependency.
- ‏73/74 — Daily Review ו־Scanner Diagnostics כ־Evidence consumers.
- ‏76/77/78 — Improvement governance, Strategy identity ו־Champion/Challenger.
- ‏79 — ה־Personal Playbook הוא doctrine; 80 הוא המבנה שמיישם אותו.

---

## ‏19. Definition of Done

‏נוכל לומר שהארכיטקטורה מוכנה לעבור ל־MVP Design כאשר אפשר לענות חד־משמעית:

```text
What is the truth source for every critical state?
Who may create new exposure in research/paper modes?
Who owns existing exposure and exit authority?
What happens on UNKNOWN_EFFECT?
How is state rebuilt after restart/reconnect?
How are stale inputs rejected?
How is ranking fairness defined?
How are duplicate intents/orders prevented?
How can entries stop while exit remains available?
Which exact strategy/config/data versions made each decision?
Can the same decision be replayed?
Can a local failure be contained without destroying critical safety paths?
Can every critical state be observed and tested?
```

```text
Clear Truth Sources
+ Explicit State Machines
+ Provider-Agnostic Contracts
+ Idempotent Execution
+ Reconciliation
+ Position-First Safety
+ Full Observability
+ Durable Evidence
+ Deterministic Replay
+ Versioned Governance
= Architecture Ready for MVP Design
```

‏זהו architecture-ready state — לא הוכחת profitability ולא אישור למסחר אמיתי.