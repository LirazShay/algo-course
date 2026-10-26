# ‏שלב 82 — `Production v1 Design`: להפוך Evidence MVP למערכת שאפשר להפעיל באופן אמין

> ‏מטרת הפרק: להגדיר את `Production v1` של רובוט ה־Short-Horizon שלנו — גרסה שמרחיבה את ה־MVP ממערכת שמוכיחה Hypothesis למערכת שמסוגלת לפעול לאורך זמן באופן deterministic, observable, recoverable ו־safe תחת תקלות אמיתיות, בלי לקפוץ מוקדם מדי ל־microservices או ל־HFT infrastructure.
>
> ‏העיקרון המרכזי: **`MVP` מוכיח שהרעיון ראוי למחקר. `Production v1` צריך להוכיח שאפשר להפעיל את אותה שרשרת החלטה כאשר נתונים מאחרים, חיבורים נופלים, Orders מתמלאים חלקית, תהליכים קורסים, state צריך להשתחזר, ו־Broker Truth אינו תואם מיד ל־Local Truth.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח. כל שימוש בכסף אמיתי מחייב זכאות והרשאה מתאימות, כללי חשבון ו־Broker עדכניים, ועמידה ב־Live Readiness Gate של שלב 64.

---

## ‏1. מה משתנה בין `MVP` ל־`Production v1`

‏ב־MVP שאלנו בעיקר:

```text
Can we measure the hypothesis correctly?
```

‏ב־Production v1 נוספות השאלות:

```text
Can the system preserve truth?
Can it fail safely?
Can it recover deterministically?
Can it explain every decision?
Can it detect degraded operation before exposure becomes unknown?
```

## ‏2. `Production v1` אינו “MVP עם יותר Features”

‏השדרוג העיקרי אינו עוד Signals.

‏הוא בעיקר:

- ‏Durability.
- ‏Reconciliation.
- ‏Failure containment.
- ‏Operational visibility.
- ‏Deployment discipline.
- ‏Recovery.
- ‏Security.
- ‏Versioned evidence.
- ‏Safety controls.

## ‏3. המטרה העסקית של v1

‏`v1` צריך לאפשר להריץ את המערכת באופן עקבי, לאסוף Evidence איכותי ולדעת בכל רגע:

```text
What do we know?
What do we believe?
What exposure exists?
What orders may exist?
What data is trustworthy?
What action is allowed now?
```

## ‏4. `v1` אינו יעד סופי

‏הוא אינו צריך לפתור מראש:

- ‏Multi-region active-active.
- ‏Microsecond optimization.
- ‏Custom exchange connectivity.
- ‏Dozens of strategies.
- ‏Distributed feature store.
- ‏Massive ML platform.
- ‏Complex smart-routing research.

## ‏5. ברירת המחדל הארכיטקטונית

‏למערכת אישית עדיף להתחיל ב־`Modular Monolith` עם boundaries ברורים.

‏זה נותן:

- ‏פשטות deployment.
- ‏פחות distributed failure modes.
- ‏transactions פשוטים יותר.
- ‏debugging קל יותר.
- ‏latency נמוך יותר.

## ‏6. boundaries כן — microservices לא בהכרח

‏נרצה interfaces נפרדים גם אם הכול באותו process.

```text
IMarketDataProvider
IScanner
IDecisionEngine
IExecutionBroker
IPositionService
IRiskGate
IEventJournal
IReplayEngine
```

## ‏7. ה־Production Planes

```text
Data Plane
Decision Plane
Execution Plane
Position / Exit Plane
Control Plane
Evidence / Replay Plane
Learning Plane
```

## ‏8. `Data Plane`

‏אחראי על:

- ‏connection ל־provider.
- ‏ingestion.
- ‏normalization.
- ‏deduplication.
- ‏ordering semantics.
- ‏freshness.
- ‏quality state.
- ‏canonical market state.

## ‏9. `Decision Plane`

‏אחראי על:

- ‏feature computation.
- ‏eligibility.
- ‏ranking.
- ‏negative evidence.
- ‏execution feasibility.
- ‏final decision.

## ‏10. `Execution Plane`

‏אחראי על:

- ‏OrderIntent.
- ‏submission.
- ‏acknowledgment tracking.
- ‏replace/cancel.
- ‏fill events.
- ‏unknown-effect handling.
- ‏broker reconciliation.

## ‏11. `Position / Exit Plane`

‏אחראי על exposure בפועל.

‏הוא מקבל עדיפות על entry logic כאשר יש Position פתוח.

## ‏12. `Control Plane`

‏אחראי על:

- ‏enable/disable.
- ‏mode.
- ‏kill switches.
- ‏quarantine.
- ‏config activation.
- ‏operator commands.

## ‏13. `Evidence / Replay Plane`

‏אחראי על שמירת evidence, event journal, snapshots ו־deterministic replay.

## ‏14. `Learning Plane`

‏אינו משנה Production ישירות.

‏הוא מפיק research candidates ל־Continuous Improvement Loop.

---

# ‏חלק א — Truth ו־State

## ‏15. צריך להגדיר `Truth Sources`

‏לכל domain צריך להיות source of truth מפורש.

## ‏16. Market State Truth

‏ה־canonical state נבנה מנתוני provider שעברו normalization ו־quality checks.

## ‏17. Order Truth

‏במצב ספק, ה־Broker הוא authority לגבי קיום Order חיצוני.

## ‏18. Position Truth

‏Position מקומי חייב להיות reconciled מול Broker.

## ‏19. Configuration Truth

‏רק `ResolvedConfig` versioned נחשב config פעיל.

## ‏20. Strategy Truth

‏`StrategyManifest` מגדיר את כל רכיבי הגרסה הפעילה.

## ‏21. `Local Truth != Broker Truth`

‏אסור להניח ש־Order שנשלח קיים או לא קיים רק לפי local state.

## ‏22. `UNKNOWN_EFFECT`

‏כאשר לא ידוע אם פעולה חיצונית הצליחה, נכנסים למצב מפורש של `UNKNOWN_EFFECT`.

## ‏23. אסור retry עיוור

‏Retry של submit בזמן `UNKNOWN_EFFECT` יכול ליצור duplicate exposure.

## ‏24. Reconciliation קודם ל־Retry

‏קודם מבררים Broker Truth, ורק לאחר מכן מחליטים על פעולה נוספת.

## ‏25. Durable Intent

‏לפני external side effect נשמור durable `OrderIntent`.

## ‏26. Stable IDs

‏לכל intent/order/decision/run צריך להיות identifier יציב.

## ‏27. Idempotency

‏פעולות שניתן לבצע יותר מפעם אחת צריכות להיות idempotent ככל האפשר.

## ‏28. Event Journal

‏כל transition משמעותי נרשם append-only.

## ‏29. Snapshots

‏Snapshots מקצרים recovery אך אינם מחליפים את journal.

## ‏30. Rebuildability

‏צריך להיות אפשר לבנות מחדש state קריטי מ־snapshot + events.

## ‏31. `DecisionEpoch`

‏כל החלטה מקבלת epoch שמחבר את כל inputs שלה.

## ‏32. `DataGeneration`

‏שינוי provider/session/reconnect יכול לייצר generation חדש.

## ‏33. `BrokerGeneration`

‏Reconnect ל־Broker צריך למנוע callbacks ישנים מלהשפיע על state חדש.

## ‏34. `ConfigGeneration`

‏שינוי config אינו “עריכה במקום”; הוא activation של generation חדש.

## ‏35. State Machine מפורש

‏אין להחזיק trading lifecycle באמצעות booleans אקראיים.

## ‏36. Order State Machine

```text
CREATED
→ INTENT_PERSISTED
→ SUBMITTING
→ ACKNOWLEDGED / REJECTED / UNKNOWN_EFFECT
→ PARTIALLY_FILLED
→ FILLED / CANCELLED / EXPIRED
```

## ‏37. Position State Machine

```text
FLAT
→ ENTRY_PENDING
→ OPEN
→ EXIT_PENDING
→ FLAT
```

## ‏38. Degraded states

‏נוסיף states כגון:

```text
DATA_DEGRADED
BROKER_DEGRADED
RECONCILING
ENTRY_DISABLED
EXIT_ONLY
SAFE_MODE
```

## ‏39. State transition invariants

‏כל transition צריך להגדיר preconditions ו־postconditions.

## ‏40. Invalid transition = incident

‏Transition בלתי חוקי אינו warning זניח.

---

# ‏חלק ב — Data Productionization

## ‏41. Provider adapter

‏ה־business logic לא מכיר את API של provider ספציפי.

## ‏42. Canonical schema

‏Market events מתורגמים למבנה פנימי יציב.

## ‏43. Timestamp taxonomy

‏נבדיל בין:

- ‏exchange/event time.
- ‏provider time.
- ‏receive time.
- ‏process time.
- ‏decision time.

## ‏44. Clock health

‏NTP/clock drift צריך להיות observable.

## ‏45. Freshness policy

‏לכל datum קריטי יש freshness threshold לפי שימוש.

## ‏46. Stale data

‏Stale data אינו zero ולא missing רגיל.

## ‏47. `UNKNOWN`

‏כאשר אין מידע מספיק, state צריך לבטא `UNKNOWN`.

## ‏48. Duplicate events

‏ה־ingestion צריך לזהות duplicates כאשר provider semantics מאפשרים.

## ‏49. Out-of-order events

‏צריך להגדיר מה עושים עם event שמגיע מאוחר.

## ‏50. Corrections

‏Trade corrections לא מוחקים history בשקט.

## ‏51. Gap detection

‏המערכת צריכה לזהות gaps ולא רק להמשיך כאילו הכול תקין.

## ‏52. Provider disconnect

‏Disconnect הופך quality state, לא רק log message.

## ‏53. Reconnect warm-up

‏אחרי reconnect אין להפוך מיד ל־Ready.

## ‏54. Re-subscription verification

‏צריך לוודא בפועל שה־Universe חזר לקבל updates.

## ‏55. Fresh Coverage

‏נמדוד איזה אחוז מה־eligible universe באמת fresh.

## ‏56. Provider failover

‏אם מוסיפים provider חלופי, semantics שלו חייבים להיות מנורמלים ומאומתים.

## ‏57. Failover אינו seamless בהכרח

‏מעבר provider יכול לשנות timestamps, venue coverage, field semantics ו־latency.

## ‏58. `ProviderGeneration`

‏שינוי provider צריך להיות חלק מה־decision evidence.

## ‏59. Raw retention

‏נשמור raw enough data ל־RCA ול־replay, בהתאם לעלות האחסון.

## ‏60. Data SLO

‏נגדיר SLO ל־freshness, coverage, gaps ו־processing lag.

---

# ‏חלק ג — Scanner ו־Decision Productionization

## ‏61. Fast Path

‏ה־Fast Path מחשב only what is needed across the full universe.

## ‏62. Deep Path

‏חישובים יקרים מופעלים על Top-N קטן.

## ‏63. Bounded queues

‏אין queues אינסופיים.

## ‏64. Queue age חשוב יותר מ־queue length בלבד

‏Queue קצר של tasks ישנים יכול להיות מסוכן.

## ‏65. Backpressure policy

‏צריך להגדיר מה נדחה, מה נזרק ומה מקבל priority.

## ‏66. Open positions מקבלים priority

‏Monitoring ו־Exit של Position קיים חשובים יותר מחיפוש Entry חדש.

## ‏67. Candidate TTL

‏Candidate פג תוקף אם עבר יותר מדי זמן מה־observation שהוליד אותו.

## ‏68. Feature TTL

‏Feature יכול להיות stale גם אם ה־symbol עצמו קיבל update חדש.

## ‏69. Score TTL

‏Score ישן לא נשאר תקף לנצח.

## ‏70. Rank TTL

‏Top1 מלפני זמן משמעותי אינו בהכרח Top1 עכשיו.

## ‏71. Fairness

‏Ranking cross-sectional צריך למנוע יתרון עקבי ל־symbols שהתעדכנו מוקדם יותר במחזור.

## ‏72. Deterministic tie-break

‏אותם inputs צריכים להחזיר אותו order.

## ‏73. Top-K snapshot

‏נשמור לא רק Winner אלא גם context של המתחרים הקרובים.

## ‏74. Positive Evidence

‏ה־Score מסכם עדות חיובית בלבד לפי contract ברור.

## ‏75. Negative Evidence

‏Vetoes/Penalties/Cooldowns נשארים מנגנון נפרד.

## ‏76. Hard Veto

‏Rule בטיחותי/תקינותי קריטי אינו ניתן לביטול על ידי Score גבוה.

## ‏77. Soft Penalty

‏Penalty משפיע על כדאיות אבל אינו בהכרח חוסם.

## ‏78. Reason Codes

‏כל block/penalty מקבל ReasonCode.

## ‏79. Execution Feasibility

‏Candidate אינו Trade עד שבדקנו spread, liquidity, costs, latency ו־exit feasibility.

## ‏80. `RemainingNetEdge`

‏ה־decision gate צריך לחשוב על edge שנותר לאחר העלויות והאי־ודאות.

## ‏81. Pre-submit revalidation

‏לפני external side effect בודקים שה־Decision עדיין fresh.

## ‏82. `TRADE / NO_TRADE / UNKNOWN`

‏אלו שלוש תוצאות לגיטימיות.

## ‏83. `UNKNOWN` אינו `NO_TRADE`

‏`UNKNOWN` אומר שהמערכת חסרה certainty תפעולי/מידעי.

## ‏84. Decision Snapshot

‏כל decision שומר inputs מספיקים להסבר ול־replay.

## ‏85. Decision Fingerprint

‏אפשר hash של inputs/version כדי לזהות drift/reproducibility.

---

# ‏חלק ד — Execution Productionization

## ‏86. `IExecutionBroker`

‏Broker adapter הוא Port נפרד.

## ‏87. OrderIntent לפני send

‏נכתוב intent durable לפני ניסיון submit.

## ‏88. Client Order ID

‏נשתמש ב־ID יציב כאשר Broker תומך בכך.

## ‏89. Ack semantics

‏נגדיר בדיוק מה נחשב accepted.

## ‏90. `Sent != Accepted`

‏כתיבה socket/API success אינה Broker acceptance.

## ‏91. `Accepted != Working`

‏Broker יכול לקבל order אך עדיין לא להציב אותו כפי שאנחנו חושבים.

## ‏92. `Working != Filled`

‏אין להסיק exposure מתוכנית מקומית בלבד.

## ‏93. Partial fills

‏Position state מתעדכן על כל fill.

## ‏94. Cancel/fill race

‏Cancel acknowledgment לא מוחק fill שכבר התרחש.

## ‏95. Replace semantics

‏צריך לדעת האם replace שומר priority, משנה ID או מבצע cancel+new לפי Broker/venue semantics.

## ‏96. Order aging

‏Working order חייב TTL/aging policy.

## ‏97. Chase budget

‏אם יש repricing, הוא צריך להיות bounded.

## ‏98. Retry budget

‏Retry אינו infinite loop.

## ‏99. Reject classification

‏נבדיל בין:

- ‏invalid request.
- ‏permission/account issue.
- ‏temporary transport issue.
- ‏market-state issue.
- ‏unknown effect.

## ‏100. Broker rate limits

‏Rate limits נכנסים ל־capacity model.

## ‏101. Submission storm prevention

‏נמנע loop ששולח שוב ושוב orders.

## ‏102. Pending exposure

‏Order pending נחשב risk state גם לפני fill ודאי.

## ‏103. Broker open orders reconciliation

‏נשווה local orders מול broker open orders.

## ‏104. Broker positions reconciliation

‏נשווה local exposure מול broker positions.

## ‏105. Orphan order

‏Order ב־Broker ללא local owner הוא incident.

## ‏106. Orphan position

‏Position ב־Broker ללא local state הוא incident חמור.

## ‏107. Exit path עצמאי

‏יכולת Exit לא תלויה בכל Scanner path.

## ‏108. Exit under degraded data

‏צריך policy בטוחה למצבים שבהם Position קיים אך data quality נפגעה.

## ‏109. Exit priority

‏Exit traffic מקבל priority על research/entry tasks.

## ‏110. TimeToFlat

‏נמדוד זמן מרגע exit decision עד flat state מאומת.

---

# ‏חלק ה — Risk ו־Safety

## ‏111. Pre-trade risk gate

‏OrderIntent עובר gate לפני submission.

## ‏112. Max position

‏Limit מפורש לכמות/Notional לפי policy מאושרת.

## ‏113. Max pending exposure

‏כולל orders שעדיין לא resolved.

## ‏114. Max concurrent positions

‏v1 צריך limit פשוט וברור.

## ‏115. Entry disabled on stale critical data

‏Fail closed ל־new exposure.

## ‏116. Exit remains available

‏Fail closed אינו אומר לחסום פעולות שמקטינות exposure.

## ‏117. Kill switch

‏Control שאינו תלוי באותו hot path שעלול להיות תקול.

## ‏118. Symbol quarantine

‏אפשר להשבית symbol בעייתי בלי לעצור הכול.

## ‏119. Global entry pause

‏אפשר לעצור Entries חדשים ולתת ל־existing exposure להמשיך ל־exit handling.

## ‏120. `EXIT_ONLY`

‏מצב explicit.

## ‏121. `SAFE_MODE`

‏מצב שמרני שבו אין new risk.

## ‏122. Runaway detection

‏נזהה order rate חריג, cancel storm או rapid state oscillation.

## ‏123. Position mismatch breaker

‏Mismatch קריטי צריך לעצור Entries.

## ‏124. Data-quality breaker

‏Fresh coverage נמוך מדי יכול להשבית Scanner decisions.

## ‏125. Latency breaker

‏אם `LatencyPressure` חוצה threshold, Candidate edge עלול להיות לא רלוונטי.

## ‏126. Cost breaker

‏Spread/cost shock יכול לחסום Entries גם אם signal חזק.

## ‏127. Human override

‏כל override צריך להיות auditable.

## ‏128. Manual flatten

‏Procedure ברור, אך אינו מחליף recovery אוטומטי.

## ‏129. Fail-safe startup

‏מערכת לא מתחילה לסחור רק כי process עלה.

## ‏130. Readiness gate startup

‏צריך Data Ready + Broker Ready + Reconciled + Config Ready + Safety Ready.

---

# ‏חלק ו — Recovery ו־Resilience

## ‏131. Crash recovery

‏לאחר crash בונים state מחדש לפני Entries חדשים.

## ‏132. Broker-first reconciliation

‏כאשר יש ספק לגבי external exposure, Broker Truth קודם.

## ‏133. Startup sequence

```text
Load Config
→ Validate Version
→ Restore Snapshot
→ Replay Journal
→ Connect Data
→ Connect Broker
→ Reconcile Orders
→ Reconcile Positions
→ Warm Market State
→ Validate Readiness
→ Enable Decisions
```

## ‏134. Shutdown sequence

‏Shutdown orderly צריך לשמור state ולהפסיק new entries לפני סיום.

## ‏135. Unexpected shutdown

‏Recovery path צריך להניח ש־shutdown לא היה clean.

## ‏136. Network partition

‏אין להניח ש־disconnect = order לא הגיע.

## ‏137. Lost acknowledgment

‏מוביל ל־`UNKNOWN_EFFECT`.

## ‏138. Duplicate callback

‏Handlers צריכים להיות idempotent ככל האפשר.

## ‏139. Out-of-order broker events

‏צריך sequence/version logic ולא “last callback wins” עיוור.

## ‏140. Second instance

‏נדרש fencing/single-writer protection.

## ‏141. Lease/lock בלבד אינו תמיד מספיק

‏צריך לחשוב על split-brain ו־stale holder.

## ‏142. Recovery invariants

‏אחרי recovery:

```text
No unknown open orders
No unknown positions
No unresolved side effects
No trading until critical state is reconciled
```

## ‏143. Replay after incident

‏כל incident משמעותי צריך להיות replayable ככל האפשר.

## ‏144. Incident packet

‏נשמור relevant events, versions, states, timestamps ו־reason codes.

## ‏145. First Divergence

‏RCA מתחיל מהנקודה הראשונה שבה expected ו־actual נפרדו.

---

# ‏חלק ז — Observability

## ‏146. Metrics hierarchy

‏נמדוד System Health, Decision Health, Execution Health ו־Economic Health בנפרד.

## ‏147. Market data metrics

- ‏Fresh coverage.
- ‏event lag.
- ‏gap rate.
- ‏duplicate rate.
- ‏provider reconnects.

## ‏148. Scanner metrics

- ‏rank churn.
- ‏rank gap.
- ‏candidate age.
- ‏deep-path age.
- ‏NO_TRADE reasons.

## ‏149. Execution metrics

- ‏submit latency.
- ‏ack latency.
- ‏fill latency.
- ‏cancel latency.
- ‏reject rate.
- ‏unknown-effect rate.

## ‏150. Position metrics

- ‏TimeToFlat.
- ‏exit retries.
- ‏position mismatch.
- ‏pending exposure duration.

## ‏151. Economic metrics

- ‏predicted edge.
- ‏arrival edge.
- ‏fill edge.
- ‏net edge.
- ‏capture ratio.
- ‏cost ratio.
- ‏markout.

## ‏152. Safety metrics

- ‏kill-switch activations.
- ‏entry blocks.
- ‏reconciliation incidents.
- ‏orphan orders.
- ‏stale-state blocks.

## ‏153. p50 אינו מספיק

‏נמדוד p50/p95/p99.

## ‏154. Tail latency

‏ב־short horizon tail latency עלולה למחוק edge גם כאשר average נראה טוב.

## ‏155. Structured logs

‏Logs צריכים לכלול identifiers/version/context.

## ‏156. Correlation IDs

‏אפשר לעקוב:

```text
MarketEvent
→ Decision
→ OrderIntent
→ BrokerOrder
→ Fill
→ Position
→ Exit
```

## ‏157. Alerting על precursors

‏נעדיף alerts שמזהים degradation לפני PnL damage.

## ‏158. Alert fatigue

‏Alert שלא מוביל לפעולה ברורה הוא מועמד לשיפור/הסרה.

## ‏159. Dashboard אינו Truth Source

‏Dashboard הוא view על state, לא state עצמו.

## ‏160. Missing telemetry

‏Missing critical telemetry נחשב failure, לא neutral observation.

---

# ‏חלק ח — Deployment ו־Operations

## ‏161. Immutable build

‏כל deployment משתמש artifact מזוהה.

## ‏162. Strategy manifest pinned

‏Build + config + strategy identity נשמרים יחד.

## ‏163. DEV / PAPER / LIVE separation

‏הסביבות צריכות להיות ברורות גם בקוד וגם ב־credentials.

## ‏164. Wrong-environment protection

‏אסור ש־Paper config יוכל בטעות להגיע ל־Live endpoint ולהפך.

## ‏165. Secret management

‏Secrets אינם בקוד או logs.

## ‏166. Least privilege

‏Credentials מקבלים רק permissions נחוצים.

## ‏167. Deployment gate

‏אין deploy אוטומטי ל־live trading רק בגלל tests ירוקים.

## ‏168. Rollback artifact

‏הגרסה הקודמת נשארת זמינה ומאומתת.

## ‏169. Rollback compatibility

‏צריך לוודא שה־state schema מאפשר rollback.

## ‏170. Config rollback

‏גם config הוא versioned artifact.

## ‏171. Migration discipline

‏Schema migration צריך backward/forward plan מתאים.

## ‏172. Startup smoke checks

‏אחרי deployment בודקים connectivity, reconciliation, data freshness ו־health.

## ‏173. Shadow smoke period

‏אפשר להתחיל decisions ב־Shadow לפני enable של external actions.

## ‏174. Runbook

‏לכל failure class קריטי יש procedure קצר.

## ‏175. Operator commands

‏פקודות control צריכות להיות מעטות, חד־משמעיות ו־auditable.

## ‏176. No hidden manual state

‏מידע קריטי לא נשאר “בראש של המפעיל”.

## ‏177. Status endpoint

‏צריך להציג state אמיתי: readiness, mode, positions, orders, generations, versions.

## ‏178. Health != Ready

‏Process יכול להיות healthy אבל לא ready למסחר.

## ‏179. Liveness / Readiness separation

‏Liveness אומר שהתהליך חי; readiness אומר שהמערכת כשירה לבצע את התפקיד שלה.

## ‏180. Backup

‏ה־journal/config/evidence הקריטיים צריכים גיבוי מתאים.

---

# ‏חלק ט — Testing ו־Acceptance

## ‏181. Unit tests

‏לוגיקה deterministic ו־pure ככל האפשר.

## ‏182. Contract tests

‏Adapters נבדקים מול contracts של המערכת.

## ‏183. Integration tests

‏State transitions בין modules.

## ‏184. Replay tests

‏אותו event stream אמור להחזיר decisions זהים עבור אותה version.

## ‏185. Golden scenarios

‏שומרים תרחישים מוכרים עם expected outcomes.

## ‏186. Fault injection

‏מזריקים disconnect, timeout, duplicate, out-of-order ו־partial fill.

## ‏187. Crash-at-boundary tests

‏מקריסים process לפני ואחרי durable boundaries.

## ‏188. Reconciliation tests

‏מייצרים בכוונה mismatch ומוודאים recovery נכון.

## ‏189. Load tests

‏בודקים full-universe throughput.

## ‏190. Burst tests

‏בודקים market burst ולא רק average rate.

## ‏191. Soak tests

‏מריצים זמן ממושך כדי לזהות leaks ו־drift.

## ‏192. Tail-latency tests

‏מסתכלים על p95/p99 ולא רק mean.

## ‏193. Backpressure tests

‏בודקים מה קורה כאשר consumers איטיים מה־producer.

## ‏194. Load shedding tests

‏בודקים ש־low-priority work נזרק לפני exit-critical work.

## ‏195. Failure-path coverage

‏Happy path לבדו אינו Production acceptance.

## ‏196. Recovery acceptance

‏המערכת צריכה לחזור מ־restart עם Position/Open Order ידועים.

## ‏197. Unknown-state acceptance

‏כאשר state לא ידוע, Entries צריכים להיחסם.

## ‏198. Safe-mode acceptance

‏צריך להוכיח שהמעבר ל־safe mode באמת עוצר new risk.

## ‏199. Observability acceptance

‏כל incident חשוב צריך להשאיר evidence מספיק ל־RCA.

## ‏200. Version acceptance

‏כל run צריך להיות ניתן לקישור ל־StrategyManifest חד־משמעי.

---

# ‏חלק י — Performance Architecture

## ‏201. Measure first

‏לא עושים optimization לפי תחושה.

## ‏202. Allocation budget

‏ב־hot path נזהר מ־allocations מיותרים.

## ‏203. GC observability

‏GC pauses נכנסות למדדי latency.

## ‏204. Data structures

‏נבחר מבנים לפי access pattern, לא לפי אופנה.

## ‏205. Incremental computation

‏Features שמתאימים לכך מחושבים incremental.

## ‏206. Avoid full recompute

‏לא סורקים מחדש history שלם לכל tick אם אין צורך.

## ‏207. Batch carefully

‏Batching יכול לשפר throughput אך להוסיף latency/fairness bias.

## ‏208. Scheduler fairness

‏אין symbol שמקבל יתרון קבוע עקב סדר iteration.

## ‏209. CPU budget by plane

‏Data/Decision/Exit מקבלים budgets מפורשים.

## ‏210. Memory budget

‏History retention צריך להיות bounded.

## ‏211. Disk budget

‏Raw/event retention צריך policy.

## ‏212. Deep path budget

‏Heavy logic מקבל deadline.

## ‏213. Stale work cancellation

‏אין טעם להשלים analysis של Candidate שכבר פג.

## ‏214. Priority inversion

‏נזהר ש־research/diagnostics לא יחסמו trading-critical work.

## ‏215. One process can still be concurrent

‏Modular monolith אינו single-thread-only.

## ‏216. Concurrency ownership

‏כל mutable state צריך ownership ברור.

## ‏217. Avoid shared mutable chaos

‏Cross-thread state ללא contract מייצר bugs שקשה לשחזר.

## ‏218. Message ordering semantics

‏צריך להגדיר ordering per symbol/domain.

## ‏219. Backpressure beats unbounded parallelism

‏עדיף לדחות עבודה מאשר לצבור latency בלתי מוגבלת.

## ‏220. Performance Definition of Ready

‏ה־v1 צריך לעמוד ב־latency/throughput budgets תחת עומס מייצג ולא רק בסביבת idle.

---

# ‏חלק יא — Data Persistence ו־Evidence

## ‏221. Operational DB

‏שומר state תפעולי durable.

## ‏222. Event Journal

‏שומר events משמעותיים append-only.

## ‏223. Research store

‏יכול להיות storage נפרד ל־snapshots/features/outcomes.

## ‏224. Hot vs Cold retention

‏לא כל נתון חייב storage יקר ומהיר לנצח.

## ‏225. Decision evidence

‏נשמור enough context להסביר decision.

## ‏226. Order evidence

‏נשמור intent, request, response, callbacks, fills ו־timestamps.

## ‏227. Position evidence

‏נשמור complete position lifecycle.

## ‏228. Version evidence

‏Strategy/config/provider/schema versions לכל episode.

## ‏229. Integrity

‏Records קריטיים לא משתנים בשקט.

## ‏230. Correction events

‏תיקון נשמר כ־event חדש.

## ‏231. Replay source

‏צריך להחליט איזה event stream הוא authoritative ל־replay.

## ‏232. Evidence completeness

‏נמדוד missing evidence rate.

## ‏233. Storage failure

‏אם אי אפשר לשמור durable intent קריטי, new external actions נחסמים.

## ‏234. Disk pressure

‏Disk-full scenario הוא failure mode אמיתי.

## ‏235. Retention policy

‏Retention נקבע לפי recovery/RCA/research needs ועלות.

---

# ‏חלק יב — Security

## ‏236. Live credentials isolated

‏Credentials של live אינם זמינים ל־research tooling שלא צריך אותם.

## ‏237. Secrets rotation

‏תהליך rotation בלי עריכה ידנית מסוכנת.

## ‏238. Sensitive logging

‏לא מדפיסים tokens/credentials.

## ‏239. Dependency hygiene

‏Dependencies נבדקות ומתעדכנות באופן מבוקר.

## ‏240. Supply-chain awareness

‏Build artifacts צריכים provenance בסיסי.

## ‏241. Operator authentication

‏Control actions רגישים דורשים authentication מתאים.

## ‏242. Audit trail

‏מי/מה הפעיל pause, resume, config change או kill switch.

## ‏243. Principle of least privilege

‏גם process עצמו מקבל רק מה שנחוץ.

## ‏244. Network exposure

‏אין לחשוף interfaces פנימיים החוצה ללא צורך.

## ‏245. Security failure → safe state

‏אירוע security שמשפיע על trust יכול להשבית Entries.

---

# ‏חלק יג — Operational Modes

## ‏246. `REPLAY`

‏אין external side effects.

## ‏247. `SHADOW`

‏מתקבלות decisions אמיתיות בלי orders אמיתיים.

## ‏248. `PAPER`

‏Orders נשלחים לסביבה מדומה/ייעודית.

## ‏249. `LIVE_DISABLED`

‏Production infrastructure פעיל אך new external trades חסומים.

## ‏250. `LIVE_ENABLED`

‏רק כאשר readiness conditions מתקיימים.

## ‏251. `ENTRY_DISABLED`

‏אין Entries חדשים.

## ‏252. `EXIT_ONLY`

‏רק פעולות שמפחיתות exposure.

## ‏253. `RECONCILING`

‏אין החלטות שמגדילות exposure עד completion.

## ‏254. `SAFE_MODE`

‏מצב שמרני בעקבות תקלה/אי־ודאות.

## ‏255. Mode transition audit

‏כל שינוי mode מתועד.

---

# ‏חלק יד — Production v1 Scope

## ‏256. מה חייב להיות בפנים

- ‏Reliable market-data ingestion.
- ‏Canonical state.
- ‏Freshness/quality.
- ‏Scanner.
- ‏Top-K ranking.
- ‏Hard vetoes.
- ‏Decision snapshots.
- ‏Execution adapter.
- ‏Durable intents.
- ‏Broker reconciliation.
- ‏Position/Exit state machine.
- ‏Risk gates.
- ‏Kill switch.
- ‏Event journal.
- ‏Replay.
- ‏Observability.
- ‏Versioning.
- ‏Recovery.

## ‏257. מה יכול להישאר בחוץ

- ‏Complex ML ensembles.
- ‏Many brokers.
- ‏Many data providers.
- ‏Direct-routing optimizer.
- ‏Sophisticated order slicing.
- ‏Multi-strategy portfolio engine.
- ‏Distributed services.
- ‏Automatic retraining.

## ‏258. One broker is enough for v1

‏ה־Port נשאר generic; implementation ראשונה יכולה להיות אחת.

## ‏259. One primary data provider is enough

‏Failover אפשר להוסיף כאשר evidence/operations מצדיקים זאת.

## ‏260. One strategy path

‏עדיף Strategy אחת מובנת מאשר framework כללי מדי.

## ‏261. One canonical position model

‏לא מוסיפים מראש תמיכה בכל סוגי המוצרים.

## ‏262. Fewer order tactics

‏Order tactics מתווספות לפי evidence.

## ‏263. No premature microservices

‏נשמור boundaries בקוד בלי לשלם distributed-systems tax.

## ‏264. No premature streaming platform

‏Message broker פנימי נכנס רק אם יש צורך אמיתי.

## ‏265. No premature feature store

‏נשמור feature contracts/versioning בלי פלטפורמה כבדה.

---

# ‏חלק טו — Release Gates

## ‏266. Gate 1 — Functional

‏כל critical path עובד end-to-end.

## ‏267. Gate 2 — Deterministic Replay

‏Decisions ניתנות לשחזור.

## ‏268. Gate 3 — Recovery

‏Restart/reconnect scenarios עוברים.

## ‏269. Gate 4 — Reconciliation

‏Broker mismatch scenarios מטופלים נכון.

## ‏270. Gate 5 — Safety

‏Kill switches ו־entry blocking מאומתים.

## ‏271. Gate 6 — Observability

‏כל critical state observable.

## ‏272. Gate 7 — Performance

‏Throughput/latency עומדים budgets.

## ‏273. Gate 8 — Stress

‏Burst/degraded scenarios אינם שוברים invariants.

## ‏274. Gate 9 — Versioning

‏כל run מזוהה חד־משמעית.

## ‏275. Gate 10 — Operations

‏Runbook, deployment ו־rollback נבדקו.

## ‏276. Gate 11 — Evidence

‏Shadow/Paper evidence מספיק לבחינת ההשערה.

## ‏277. Gate 12 — Eligibility

‏כל external use כפוף לזכאות והרשאה עדכניות.

## ‏278. Critical unknown = no-go

‏לא ממוצעים score על blocker קריטי.

## ‏279. `Production Ready != Live Authorized`

‏מערכת יכולה להיות Production-grade ועדיין לפעול רק ב־Shadow/Paper.

## ‏280. Live הוא gate נפרד

‏Live permission שייך ל־Step 64 ולגורם המורשה בחשבון.

---

# ‏חלק טז — Failure Scenarios שחייבים לעבור

## ‏281. Data provider disconnect.

## ‏282. Data provider reconnect עם partial universe.

## ‏283. Stale data ל־Top1.

## ‏284. Duplicate market events.

## ‏285. Out-of-order market events.

## ‏286. Broker disconnect לפני acknowledgment.

## ‏287. Broker disconnect אחרי fill אך לפני local callback.

## ‏288. Partial fill ואז restart.

## ‏289. Cancel/fill race.

## ‏290. Order reject.

## ‏291. Unknown order state.

## ‏292. Orphan broker order.

## ‏293. Orphan broker position.

## ‏294. Process crash לפני durable intent.

## ‏295. Process crash אחרי durable intent ולפני submit.

## ‏296. Process crash אחרי submit ולפני acknowledgment.

## ‏297. Disk full בזמן critical write.

## ‏298. Clock drift.

## ‏299. Queue backlog.

## ‏300. CPU saturation.

## ‏301. GC pause.

## ‏302. Provider semantic change.

## ‏303. Config mismatch.

## ‏304. Second process starts accidentally.

## ‏305. Manual operator action בזמן pending order.

## ‏306. Exit בזמן data degraded.

## ‏307. Kill switch בזמן partial fill.

## ‏308. Restart בזמן Position פתוח.

## ‏309. Version rollback עם state קיים.

## ‏310. כל תרחיש חייב expected invariant

‏לא מספיק “המערכת לא קרסה”.

---

# ‏חלק יז — Production v1 Metrics

## ‏311. `FreshCoverage`.

## ‏312. `DecisionLatencyP50/P95/P99`.

## ‏313. `BrokerRoundTripP50/P95/P99`.

## ‏314. `FillLatency`.

## ‏315. `TimeToFlat`.

## ‏316. `UnknownEffectRate`.

## ‏317. `ReconciliationMismatchRate`.

## ‏318. `EntryBlockedBySafetyRate`.

## ‏319. `HealthyNoTradeRate`.

## ‏320. `BrokenNoTradeRate`.

## ‏321. `RankChurn`.

## ‏322. `RankGap`.

## ‏323. `CandidateAgeAtDecision`.

## ‏324. `EdgeAtDetection`.

## ‏325. `EdgeAtSubmit`.

## ‏326. `EdgeAtFill`.

## ‏327. `NetEdgeRetained`.

## ‏328. `CostRatio`.

## ‏329. `PostFillMarkout`.

## ‏330. `ExitGiveback`.

## ‏331. `ReplayParityRate`.

## ‏332. `EvidenceCompletenessRate`.

## ‏333. `RecoveryTime`.

## ‏334. `IncidentRate`.

## ‏335. `FalseAlertRate`.

---

# ‏חלק יח — `Practitioner Secrets`

## ‏336. הסיכון הגדול הראשון הוא state ambiguity

‏לפני latency ולפני alpha, מערכת שלא יודעת אם יש לה Position היא מערכת לא מוכנה.

## ‏337. Recovery path הוא חלק מה־main path

‏אם לא בדקת אותו, הוא אינו קיים.

## ‏338. Happy path כמעט תמיד נראה טוב

‏Production quality נמדדת בעיקר ב־unhappy paths.

## ‏339. `UNKNOWN` הוא feature בטיחותי

‏מערכת שמסוגלת לומר “לא יודע” בטוחה יותר ממערכת שמכריחה boolean.

## ‏340. Broker callback אינו transaction log מושלם

‏צריך correlation, ordering ו־reconciliation.

## ‏341. PnL ירוק יכול להסתיר מערכת שבורה

‏Operational correctness קודם לפרשנות של PnL.

## ‏342. Missing telemetry הוא failed experiment

‏אם אי־אפשר להסביר מה קרה, אי־אפשר ללמוד ממנו כראוי.

## ‏343. Entry קל יותר מ־Exit

‏Production readiness נבחן במיוחד ביכולת להגיע ל־flat.

## ‏344. Queue age הוא killer שקט

‏מערכת יכולה להיראות “מהירה” לפי CPU ועדיין לעבוד על מידע ישן.

## ‏345. Provider reconnect הוא regime תפעולי חדש

‏אל תניח שהכול חזר בדיוק למצב הקודם.

## ‏346. Config הוא code מבחינת risk

‏שינוי threshold יכול להיות משמעותי כמו שינוי algorithm.

## ‏347. Version identity חייב להיכנס לכל decision

‏אחרת RCA בין deployments הופך לניחוש.

## ‏348. `NO_TRADE` תקין הוא output חשוב

‏אל תמדוד הצלחה לפי מספר trades.

## ‏349. Production v1 צריך להיות boring

‏פשטות, invariants ו־recovery עדיפים על feature richness.

## ‏350. הרחבה רק אחרי evidence

‏כל complexity חדשה צריכה לפתור bottleneck או failure mode מוכח.

---

# ‏חלק יט — Baseline מוצע לרובוט שלנו

> ‏הסעיפים הבאים הם `Judgment / Hypothesis`, לא Recommendation סופית. ה־Recommendation Playbook יגיע בפרויקט הנפרד לאחר סיום הקורס.

## ‏351. `Modular Monolith`

‏ברירת מחדל טובה ל־v1 אישי.

## ‏352. Single primary strategy

‏פחות state interactions.

## ‏353. Single primary broker adapter

‏עם Port נקי להחלפה עתידית.

## ‏354. Single primary data provider

‏עם provider abstraction ו־quality instrumentation.

## ‏355. Whole-market fast scan

‏עם Deep Path ל־Top-N קטן.

## ‏356. Hard validity/economic vetoes first

‏Behavioral vetoes מתקדמים רק אחרי evidence.

## ‏357. Single-position initial mode

‏עשוי לפשט exposure/recovery/learning; צריך לאמת שהוא מתאים למטרת המחקר.

## ‏358. Position-first scheduling

‏כאשר יש exposure, monitoring ו־exit מקבלים priority.

## ‏359. Durable order intent

‏לא מוותרים עליו ב־v1.

## ‏360. Full decision snapshots

‏לא sampling בלבד להחלטות critical.

## ‏361. Deterministic replay

‏חלק חובה מ־v1.

## ‏362. Shadow/Paper first

‏ברירת המחדל גם כאשר ה־software עצמו Production-grade.

## ‏363. Limited order tactics

‏מתחילים במספר קטן של policies מובנות היטב.

## ‏364. No automatic retraining

‏Learning Plane מייצר research candidates בלבד.

## ‏365. No automatic promotion

‏Champion promotion נשאר evidence-gated.

---

# ‏חלק כ — Definition of Done ל־`Production v1`

## ‏366. ה־Data Plane שומר freshness ו־quality מפורשים.

## ‏367. ה־Scanner עומד ב־coverage/latency budgets.

## ‏368. כל Decision ניתן לשחזור ולהסבר.

## ‏369. כל external action מתחיל מ־durable intent.

## ‏370. `UNKNOWN_EFFECT` מטופל באמצעות reconciliation.

## ‏371. Partial fills ו־cancel/fill races מכוסים.

## ‏372. Position/Open Orders משוחזרים אחרי restart.

## ‏373. מערכת עם state לא ידוע אינה פותחת exposure חדש.

## ‏374. Exit path נשאר זמין ככל האפשר גם במצב degraded.

## ‏375. Kill switch ו־entry pause עברו fault tests.

## ‏376. כל deployment מזוהה ב־StrategyManifest חד־משמעי.

## ‏377. Replay parity נמדדת.

## ‏378. Critical telemetry מלאה.

## ‏379. Incident packet ניתן להפקה.

## ‏380. Performance עבר burst/soak/tail tests.

## ‏381. Security boundaries בסיסיים קיימים.

## ‏382. Runbook ו־rollback נבדקו.

## ‏383. Shadow/Paper run ארוך מספיק כדי לחשוף operational failures רלוונטיים.

## ‏384. אין P0/P1 blockers פתוחים לפי policy שנקבעה.

## ‏385. כל מעבר ל־Live נשאר החלטה נפרדת

‏`Production v1 Done` אינו אומר “מוכן או מורשה לכסף אמיתי”. הוא אומר שהמערכת עצמה עומדת ב־production engineering baseline שמאפשר להמשיך ל־Live Readiness Review באופן אחראי.

---

# ‏סיכום

‏ה־MVP שלנו נועד להוכיח שיש Hypothesis ששווה למדוד.

‏`Production v1` נועד להוכיח שאפשר להפעיל את אותה Hypothesis בתוך מערכת ששומרת Truth, מגבילה exposure, מזהה uncertainty, מתאוששת מתקלות, מסבירה כל החלטה ומייצרת Evidence שאפשר לסמוך עליו.

```text
Evidence MVP
+ Durable State
+ Broker Reconciliation
+ Position-First Safety
+ Failure Recovery
+ Observability
+ Versioned Evidence
+ Operational Discipline
= Production v1 Candidate
```

‏רק לאחר שכל ה־gates הקריטיים עוברים, המערכת זכאית להיבחן בשער ה־Live Readiness — לא לקבל אישור אוטומטי למסחר אמיתי.