# ‏06 — Recommendation Sheet: Time / Sampling / Latency

> ‏מקור לימודי עיקרי: `../06-TIME-SAMPLING-LATENCY.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מעשי למודל הזמן של רובוט `Short-Horizon Momentum` — איזה קצב שייך ל־Feed, איזה ל־Feature updates, איזה ל־Ranking/Decision, איך מודדים Latency אמיתי מקצה לקצה, ומתי זמן ישן הופך Candidate ל־`NO TRADE`.

---

## ‏1. Decision

‏איך לבנות את מערכת הזמן כך שהרובוט לא רק יזהה Signal נכון, אלא יזהה אותו, יאמת אותו ויגיע לביצוע בזמן שבו ה־Edge עדיין קיים — בלי לבזבז משאבים על קצב שאין מאחוריו מידע חדש ובלי להפוך Backlog ל־"שוק נוכחי"?

---

## ‏2. Recommended Default

### ‏`P0 — Required Before Live Risk`: Timing Contract מלא לכל החלטה

‏לכל Candidate/Order חייבים להיות, ככל שהמקור מאפשר, timestamps נפרדים עבור:

```text
market_event_time
provider_time
receive_time
state_updated_time
features_ready_time
ranking_time
signal_time
execution_recheck_time
order_created_time
order_sent_time
broker_ack_time
first_fill_time
full_fill_or_terminal_time
```

‏אין להשתמש ב־timestamp יחיד כדי לייצג את כל השרשרת.

### ‏`P1 — Preferred Default`: להפריד בין Feed Rate, Feature Rate ו־Decision Rate

‏שלושת הקצבים אינם אותו דבר:

```text
Feed Rate
→ how often new information arrives

Feature Update Rate
→ how often per-symbol state/features are refreshed

Decision Rate
→ how often we compare candidates and allow TRADE / NO TRADE
```

‏Baseline:

```text
market events
→ update only affected symbol
→ maintain rolling/incremental features
→ rank at controlled cadence
→ trigger faster re-evaluation when material state changes
```

‏אין לבצע full-universe recomputation על כל Tick.

### ‏`P1 — Preferred Default`: Event-Driven ingestion, controlled ranking

‏כאשר הספק מאפשר Streaming/Event delivery, ה־Collector צריך להיות Event-Driven.

‏אבל Global Ranking צריך להיות נשלט:

```text
event-driven state updates
+
controlled ranking cadence
+
optional material-change trigger
+
periodic reconciliation
```

‏כך מקבלים freshness בלי `rank 4,000 symbols` על כל אירוע.

### ‏`P1 — Preferred Default`: Incremental computation לפני Full recomputation

‏כאשר אירוע מגיע ל־`XYZ`:

```text
update XYZ raw/current state
update XYZ rolling features
update XYZ eligibility/score inputs
```

‏לא:

```text
re-read/recompute all symbols
```

‏Global comparison משתמש ב־state שכבר חושב.

### ‏`P0 — Required Before Live Risk`: Freshness Gate לפי השדות שבאמת משנים החלטה

‏אין להסתפק ב־`symbol_updated_at` אחד.

‏לפי הצורך יש למדוד בנפרד:

```text
quote_age
last_trade_age
activity_age
scanner_cycle_age
candidate_age
execution_snapshot_age
```

‏לפני Entry:

```text
feed_healthy
AND quote_age <= supported_budget
AND signal_age <= supported_signal_lifetime
AND scanner/candidate state current enough
=> may continue

otherwise
=> NO TRADE
```

‏המספרים עצמם אינם נקבעים כאן; הם ייקבעו ממדידת Signal Half-Life ו־live-like latency.

### ‏`P0 — Required Before Live Risk`: Signal Expiry הוא State מפורש

‏לכל Signal/Recommendation צריכה להיות יכולת תפוגה:

```text
created_at
valid_until
```

‏אם עבר `valid_until` לפני Order submit או execution recheck:

```text
signal = expired
=> NO TRADE
```

‏אין לקנות Signal ישן רק מפני שהוא עדיין Rank #1 בטבלה.

### ‏`P1 — Preferred Default`: Execution Recheck לפני Order

‏Candidate שנבחר בסריקה חייב לעבור snapshot/recheck טרי באזור הביצוע:

```text
signal still valid?
quote fresh?
price drift acceptable?
spread still acceptable?
size still feasible?
trading state normal?
```

‏רק אז Order יכול להישלח.

### ‏`P1 — Preferred Default`: Logical Snapshot ל־cross-sectional ranking

‏כאשר משווים אלפי Symbols, צריך להימנע מהשוואה מקרית של המניה הראשונה בזמן `T` והמניה האחרונה בזמן `T+800ms` כאילו הן אותה תמונה.

‏Baseline למחקר/Replay ול־ranking deterministic ככל האפשר:

```text
cycle_id
cycle_cutoff_time
latest eligible state at-or-before cutoff
```

‏ב־Live אין צורך לעצור את ה־Feed; מדובר ב־logical cutoff.

### ‏`P0 — Required Before Live Risk`: Backpressure הוא מצב בטיחות

‏יש למדוד לפחות:

```text
incoming_rate
processing_rate
queue_depth
oldest_event_age
```

‏אם התור גדל והמערכת מעבדת עבר במקום הווה:

```text
block new entries
```

‏אין להמשיך לסחור רק משום שהתהליך עדיין "רץ".

### ‏`P1 — Preferred Default`: שני מסלולים — Raw Event Path ו־Current State Path

```text
RAW EVENT PATH
→ preserve events needed for research/replay/counts

CURRENT STATE PATH
→ latest valid per-symbol state
→ fast scanner/execution view
```

‏אפשר לבצע coalescing במסלול Current State כאשר semantics מאפשרים זאת, אך אסור לזרוק אירועים שנדרשים ל־trade count, volume, order-flow או replay fidelity.

### ‏`P0 — Required Before Live Risk`: Clock discipline

‏Baseline:

```text
UTC for persisted wall-clock timestamps
monotonic clock for durations
clock-sync health monitored
clock drift observable
```

‏ב־`.NET`, מדידות duration מקומיות צריכות להשתמש בכלי monotonic כגון `Stopwatch`, ולא בהפרש נאיבי בין wall-clock values בלבד.

### ‏`P1 — Preferred Default`: Percentiles, לא Average בלבד

‏לכל Latency משמעותי נמדוד:

```text
P50
P95
P99
max / extreme-tail incidents
```

‏Average טוב אינו מספיק כאשר occasional 3–10 second stalls יכולים לפגוע ב־short-horizon trade.

### ‏`P1 — Preferred Default`: Priority לפי state

‏בעת עומס:

```text
1. Open position / exit safety
2. Broker + order-state reconciliation
3. Working orders
4. Active candidate / execution recheck
5. Shortlist
6. Full-universe scan
7. UI / reporting / noncritical analytics
```

‏סריקה חדשה לעולם אינה גוברת על ניהול פוזיציה קיימת.

### ‏`P1 — Preferred Default`: לא להתחרות ב־microseconds

‏היעד הוא למצוא Signals שה־half-life שלהם ארוך מספיק כדי שמערכת אישית אמינה תוכל לנצל אותם:

```text
milliseconds
→ seconds
→ tens of seconds
```

‏לא לבנות סביב HFT/colocation race.

---

## ‏3. Why

### ‏Fact

‏`Sampling Interval` ו־`Latency` הם שני דברים שונים. Scanner שרץ כל שנייה עדיין יכול לעבוד על מידע בן כמה שניות.

### ‏Fact

‏כאשר Decision פועל במחזור של `X`, אירוע יכול להמתין כמעט `X` עד המחזור הבא; cadence מוסיף latency משל עצמו.

### ‏Fact

‏Event Time ו־Receive Time עונים על שאלות שונות. ללא שניהם, כאשר זמינים, קשה להפריד provider/network delay מעיבוד מקומי.

### ‏Fact

‏Backpressure גורם לכך שמערכת ממשיכה לעבוד אך state שהיא מעבדת הולך ומתיישן.

### ‏Fact

‏Wall-clock synchronization חשוב ל־timestamp correlation; duration בתוך process צריך monotonic time כדי לא להיות רגיש ל־clock adjustments.

### ‏Fact

‏Backtest של short-horizon strategy שאינו מכבד availability time יכול ליצור look-ahead bias גם אם אין שימוש מפורש בנתוני עתיד.

### ‏Fact — verified 2026-10-26

‏בתיעוד הנוכחי של `IBKR Web API`, Watchlist market data מתואר כ־time-based snapshots; דף Update Frequency מציין כיום `500ms` לכל המוצרים. תיעוד Web API גם מגביל בקשות רגילות בקצב גלובלי של `10 requests/sec` וממליץ להשתמש ב־WebSocket `smd` כאשר נדרש קצב החזר גבוה יותר.

### ‏Fact — verified 2026-10-26

‏`Alpaca Market Data API` מציעה WebSocket real-time stock streams; ה־feed יכול להיות `SIP`, ‏`IEX` או feed אחר בהתאם ל־subscription. לכן המילה `real-time` אינה מספיקה בלי coverage/entitlement metadata.

### ‏Judgment

‏עבור המערכת שלנו, האופטימיזציה הראשונה צריכה להיות elimination של avoidable delay ו־stale work — incremental state, bounded queues, no DB/UI on hot path — לפני low-level micro-optimizations.

### ‏Hypothesis

‏קצב Decision באזור sub-second עד seconds עשוי להספיק לרוב ה־Edge שאנחנו מחפשים, בתנאי שה־feed/feature state טריים וה־signal half-life ארוך מספיק.

‏זו אינה Fact. הקצב צריך להיבחר בניסוי.

---

## ‏4. Recommended Timing Model

```text
Market Event
→ Provider Timestamp
→ Local Receive
→ Normalize
→ Per-Symbol State Update
→ Incremental Feature Update
→ Eligibility/Score State
→ Rank Trigger/Cadence
→ Candidate Selected
→ Execution Recheck
→ Order Submit
→ Broker ACK
→ Fill / Terminal State
```

‏לכל גבול משמעותי נרצה timing measurement שניתן לנתח בנפרד.

---

## ‏5. Latency Budget Model

‏אין Budget מספרי קשיח בפרק הזה.

‏ה־Budget צריך להיגזר מ־:

```text
measured signal half-life
minus
required safety margin
```

‏ואז להתחלק ל־:

```text
provider/data delay
local receive/normalization
feature update
ranking/decision
execution recheck
order submit/network
broker/router
market waiting / fill
```

‏העיקרון:

> ‏אם `Signal-to-Fill` ארוך מדי ביחס לחיי ה־Signal, ה־strategy אינה executable גם אם prediction היה נכון בזמן המקורי.

---

## ‏6. Sampling / Decision Alternatives

| גישה | יתרון | סיכון | Recommendation |
|---|---|---|---|
| Fixed polling of whole universe | פשוט | network/compute waste, blind spots בין polls | `Avoid as primary live architecture` |
| Event-driven state + fixed ranking cadence | פשוט יחסית ויציב | עד cadence אחד של wait | `Preferred Default` |
| Event-driven state + material-change trigger | latency נמוך יותר | burst/load instability | `P2 Challenger` |
| Pure rank-on-every-event | reaction מהיר | explosive recomputation/noise | `Avoid Unless Evidence` |
| Adaptive sampling by activity | יעילות משאבים | bias מול symbols שהיו שקטים | `P2 Challenger` |
| Full tick-by-tick universe | fidelity מקסימלי | cost/scale/processing | `P4 Specialist` |

---

## ‏7. Candidate Cadence Hierarchy

‏Baseline רעיוני — לא מספרים סופיים:

```text
ALL UNIVERSE
→ controlled periodic ranking

SHORTLIST
→ faster refresh / event-sensitive re-ranking

CANDIDATE
→ very fresh execution context

WORKING ORDER / POSITION
→ event-driven highest priority
```

‏אין צורך באותו interval לכל state.

---

## ‏8. Rolling Windows and Anchors

### ‏`P1`: חלונות מבוססי זמן אמיתי

‏`change_10s` אינו:

```text
10 records back
```

‏אלא השוואה מול observation/event appropriate סביב `T-10s`, לפי contract מוגדר.

### ‏`P1`: מספר Anchors קטן ומכוון

‏כמה Anchors יכולים לתאר shape של Momentum טוב יותר מ־anchor אחד.

‏אבל כל חלון נוסף הוא Feature נוסף עם סיכון ל־overfitting.

‏לכן:

```text
add horizon
→ state hypothesis
→ test incremental value
→ keep/reject
```

### ‏`P0`: Availability-time correctness ב־Backtest

‏ב־Decision Time `T`, מותר להשתמש רק בנתון שהיה זמין למערכת עד `T`.

‏לא רק:

```text
event_time <= T
```

‏אלא, כאשר modeling permits:

```text
information_available_to_strategy <= T
```

---

## ‏9. Logical Snapshot Contract

‏כל Scan Cycle צריך לשמור לפחות:

```text
cycle_id
cycle_started_at
cycle_cutoff_time
ranking_started_at
ranking_completed_at
symbols_considered
symbols_rejected_stale
max/percentile_data_age
winner / no-trade reason
```

‏כך Replay יכול לשחזר את ההחלטה במקום להריץ על "המידע הכי חדש שיש עכשיו".

---

## ‏10. Hot Path

### ‏Baseline Hot Path

```text
receive market update
→ normalize
→ update current state
→ update incremental features
→ update candidate state
→ decision/execution recheck when needed
→ order action
```

### ‏לא ב־Hot Path

- ‏UI rendering.
- ‏chart generation.
- ‏synchronous historical database queries.
- ‏heavy analytics unrelated to current decision.
- ‏report generation.
- ‏blocking disk writes כאשר אפשר להפריד בבטחה.

‏Hot Path צריך להיות קטן, observable ו־benchmarkable.

---

## ‏11. Backpressure Policy

### ‏Required telemetry

```text
queue_depth
oldest_event_age_ms
incoming_events_per_sec
processed_events_per_sec
dropped/coalesced_events
processing_lag_ms
```

### ‏Required behavior

‏אם backlog חוצה threshold בטיחות:

```text
new entries = blocked
open-position handling = prioritized
health state = degraded/unhealthy
recovery/reconciliation required
```

### ‏Coalescing

‏מותר לשמור רק Latest State כאשר consumer צריך current state בלבד.

‏אסור לבצע coalescing כאשר הוא הורס semantics הנדרשים, למשל:

- ‏Trade Count.
- ‏Volume from events.
- ‏event ordering research.
- ‏fill/replay reconstruction.

---

## ‏12. Clock Policy

### ‏Persisted timestamps

```text
UTC
```

### ‏Durations

```text
monotonic clock
```

### ‏Health

‏לשמור:

```text
clock_sync_status
clock_offset_estimate when available
clock_drift incidents
```

‏Clock unhealthy יכול לחסום Live Entry אם אי אפשר לסמוך על freshness/latency measurements.

---

## ‏13. Metrics

### ‏Market-data latency

- ‏`event_to_receive_ms` כאשר Event Time אמין וזמין.
- ‏`receive_to_state_ms`.
- ‏`state_to_features_ms`.

### ‏Decision latency

- ‏`feature_ready_to_rank_ms`.
- ‏`ranking_duration_ms`.
- ‏`signal_age_at_selection_ms`.
- ‏`candidate_to_recheck_ms`.

### ‏Execution latency

- ‏`signal_to_order_submit_ms`.
- ‏`decision_to_order_submit_ms`.
- ‏`order_submit_to_ack_ms`.
- ‏`signal_to_first_fill_ms`.
- ‏`decision_to_first_fill_ms`.
- ‏`entry_signal_to_fill_ms`.
- ‏`exit_signal_to_fill_ms`.

### ‏System health

- ‏`P50/P95/P99 cycle latency`.
- ‏`P50/P95/P99 data age`.
- ‏queue depth / oldest event age.
- ‏stall count/duration.
- ‏GC/CPU/memory indicators where material.
- ‏feed disconnect/reconnect time.

### ‏Trading-time diagnostics

- ‏Execution drift during latency.
- ‏Time-to-profit.
- ‏Time-in-trade distribution.
- ‏Signal age at fill.
- ‏Expired-signal reject count.

---

## ‏14. Use When

‏ה־Baseline הזה מתאים כאשר:

- ‏ה־Universe גדול.
- ‏ה־Signals חיים מילישניות עד עשרות שניות/דקה.
- ‏המערכת צורכת Streaming או fast-updating feeds.
- ‏אנחנו רוצים separation בין Provider, Scanner ו־Broker.
- ‏נדרש Replay/Backtest קרוב ככל האפשר ל־live semantics.
- ‏צריך לשפר ביצועים בצורה evidence-driven ולא לפי micro-benchmark מבודד.

---

## ‏15. Do Not Use When

‏יש להתאים את ה־Baseline אם:

- ‏האסטרטגיה פועלת על horizon של שעות/ימים ולכן sub-second timing אינו כלכלי.
- ‏ה־Provider עצמו מספק רק coarse snapshots ואין ערך לריצה מהירה מהם.
- ‏ה־strategy דורשת full event ordering לכל ה־Universe וה־infrastructure נבנה לכך במפורש.
- ‏ה־Venue-specific microstructure strategy מחייבת latency regime אחר לגמרי.

---

## ‏16. Alternatives / Challengers

### ‏Triggered Ranking

‏Re-rank כאשר score/candidate state משתנה materially, עם cooldown ו־periodic full reconciliation.

### ‏Adaptive Sampling

‏Active symbols מקבלים יותר attention, אך Wide Scan מינימלי נשאר כדי לא לפספס symbol שמתחיל לזוז.

### ‏Multiple Market Data Providers

‏אפשר להשתמש ב־wide feed אחד ו־deep/execution feed אחר, אבל נדרש Cross-Feed Validation לפני Live.

### ‏Faster infrastructure / cloud proximity

‏רלוונטי רק אם measurement מראה שה־local/network segment הוא bottleneck כלכלי משמעותי.

---

## ‏17. What I Would Avoid Initially

### ‏`Avoid initially`: 100Hz global ranking רק כי אפשר

‏אם אין 100 updates משמעותיים לשנייה לכל decision context, זו עבודה ללא מידע חדש.

### ‏`Avoid initially`: Full recomputation לכל Tick

‏לעדכן symbol affected, לא universe שלם.

### ‏`Avoid initially`: Synchronous database dependency ב־decision path

‏Online state צריך להיות זמין בזיכרון/fast state path.

### ‏`Avoid initially`: Latency optimization בלי timeline

‏אין טעם לשפר 2ms ב־feature function אם provider delay הוא 800ms.

### ‏`Avoid unless measured`: Ultra-low-level micro-optimization

‏unsafe code, exotic networking, manual memory tricks או complexity דומה רק לאחר profiling שמראה bottleneck רלוונטי.

### ‏`Avoid entirely`: Trading through stale backlog

‏כאשר oldest-event age מראה שהמערכת נמצאת בעבר, אין כניסות חדשות.

---

## ‏18. What to Add Later

1. ‏Material-change triggered ranking.
2. ‏Adaptive cadence by symbol/state.
3. ‏Cross-feed latency comparison.
4. ‏Primary/fallback feed with validated failover.
5. ‏Replay with receive-time and processing-delay simulation.
6. ‏Latency-aware score/eligibility if Evidence shows predictive value.
7. ‏Provider/region placement experiments.
8. ‏GC/runtime tuning after profiling.
9. ‏Load shedding/coalescing policies by event type.
10. ‏Dynamic SLOs by session/regime.

---

## ‏19. Required Data / Evidence

‏כדי לבחור Cadence או לשנות Architecture צריך dataset שמקשר:

```text
signal opportunity
market event time
receive time
feature-ready time
rank/decision time
execution recheck time
order submit/ack/fill
price at each stage
signal outcome after 100ms/250ms/500ms/1s/2s/5s/... as relevant
system load
queue state
```

‏בנוסף צריך לתעד Opportunities שלא נשלחה בהן פקודה בגלל:

- ‏staleness.
- ‏expired signal.
- ‏backpressure.
- ‏execution drift.
- ‏cycle delay.

‏בלי rejected opportunities נקבל survivorship bias של trades בלבד.

---

## ‏20. Promotion Criteria

### ‏לקצב Decision מהיר יותר

‏קצב מהיר יותר יקודם רק אם:

- ‏הוא תופס הזדמנויות מוקדם יותר באופן מדיד.
- ‏Net outcome משתפר לאחר costs/slippage.
- ‏אין explosion של false signals/churn.
- ‏P95/P99 processing נשארים בתוך SLO.
- ‏queue/backpressure נשארים נשלטים.
- ‏היתרון שורד OOS/forward/replay-realism.

### ‏ל־Triggered Ranking

‏נדרוש:

- ‏ירידה משמעותית ב־signal-to-decision latency.
- ‏bounded trigger rate.
- ‏ללא starvation של full-universe reconciliation.
- ‏ללא instability כאשר market activity spikes.

### ‏ל־Adaptive Sampling

‏נדרוש:

- ‏אין ירידה משמעותית ב־discovery recall.
- ‏Wide Scan המינימלי עדיין מגלה new movers בזמן.
- ‏resource savings או latency improvement אמיתיים.

---

## ‏21. Rejection Criteria

‏נפסול שינוי timing/performance אם:

- ‏הוא משפר benchmark אך לא Net outcome.
- ‏הוא מוריד latency average אך מחמיר P99/tail stalls.
- ‏הוא גורם ל־queue growth תחת load אמיתי.
- ‏הוא מוסיף data loss שמשנה Features קריטיים.
- ‏הוא מגדיל operational complexity ללא economic benefit.
- ‏הוא יוצר discrepancy גדול יותר בין live ל־replay/backtest.
- ‏הוא מנצל מידע שבמציאות לא היה זמין בזמן ההחלטה.

---

## ‏22. Failure Modes

### ‏Fast scanner on stale feed

‏הרובוט מדרג 10 פעמים בשנייה את אותו מידע ישן.

### ‏Sampling aliasing

‏אירוע מהיר מתחיל ונגמר בין snapshots ונעלם מה־dataset.

### ‏Backlog masquerading as live processing

‏ה־process פעיל אבל oldest event age גדל.

### ‏Average latency hides tails

‏P50 מצוין בזמן ש־P99 מסוכן.

### ‏Cross-sectional time skew

‏Symbols מושווים על states מזמנים שונים בלי cutoff/age discipline.

### ‏Wall-clock jump corrupts durations

‏duration נמדד משעון שאינו monotonic.

### ‏Signal expires while order path continues

‏Order נשלח אחרי שה־edge כבר אינו תקף.

### ‏Backtest sees information before live could

‏look-ahead דרך availability timing.

### ‏UI/logging/database blocks hot path

‏עבודה לא קריטית מעכבת החלטת מסחר.

### ‏Adaptive sampling misses new mover

‏symbol שהיה quiet לא מקבל מספיק attention בדיוק כשהוא מתחיל לזוז.

---

## ‏23. Circuit Breaker / Safety Contract

‏לפני Entry חדש:

```text
feed healthy
AND clock healthy
AND backlog healthy
AND required fields fresh
AND signal not expired
AND scanner/candidate age acceptable
AND execution recheck fresh
=> entry may proceed

otherwise
=> NO TRADE
```

‏בעת Position פתוחה, degraded timing state מפעיל Risk/Exit policy ייעודי שייקבע בפרקי Risk/Production Safety; הוא אינו מצדיק התעלמות מהבעיה.

---

## ‏24. Benchmark Policy

‏Performance benchmark צריך לדמות לפחות:

```text
realistic universe size
realistic event rate
burst periods
incremental feature updates
ranking
logging path
candidate promotion
position priority
```

‏ולמדוד:

```text
throughput
P50/P95/P99 latency
queue behavior
oldest-event age
CPU
memory
GC/runtime pauses where relevant
```

‏בדיקה על 10 Symbols אינה הוכחה ל־4,000 Symbols.

---

## ‏25. User-Specific Application

‏למטרה שלנו:

```text
not microsecond HFT
but
fast enough to exploit seconds-scale momentum before decay
```

‏לכן סדר ההשקעה המומלץ הוא:

```text
1. correct timestamps
2. fresh data
3. incremental state
4. bounded queues
5. measured decision cadence
6. execution recheck
7. end-to-end latency telemetry
8. only then deeper optimization
```

‏אם Signal מסוים מוכיח Half-Life של `10–30s`, אין ערך עסקי אוטומטי לחסוך עוד `20µs`.

‏אם Signal אחר מוכיח Half-Life של `500ms`, צריך לשאול האם המערכת וה־feed יכולים לנצל אותו באופן אמין — ואם לא, לדחות את ה־Signal במקום להעמיד פנים שה־backtest executable.

---

## ‏26. Confidence

### ‏High

- ‏הפרדת Feed/Feature/Decision rates.
- ‏event-driven ingestion + incremental state.
- ‏freshness and expiry gates.
- ‏backpressure as safety state.
- ‏P50/P95/P99 measurement.
- ‏UTC + monotonic duration measurement.
- ‏open-position priority.
- ‏availability-time correctness in backtest.

### ‏Medium

- ‏ה־exact decision cadence שמתאים לנו.
- ‏מתי Triggered Ranking עדיף על fixed cadence.
- ‏כמה aggressive Adaptive Sampling צריך להיות.

### ‏Low / Unproven

- ‏Signal Half-Life של האסטרטגיה עצמה.
- ‏ה־economic value של sub-second ranking לעומת 1s/2s/5s.
- ‏הצורך ב־specialized low-latency infrastructure.

---

## ‏27. Time-Sensitive Facts

‏לפני Implementation חי יש לאמת מחדש:

1. ‏Market-data update cadence של כל Provider/API ספציפי.
2. ‏WebSocket lifecycle/reconnect behavior.
3. ‏API pacing/rate limits.
4. ‏subscription/coverage entitlement.
5. ‏Broker order-ack/fill event semantics.
6. ‏cloud/region/network topology אם היא חלק מה־Latency Budget.
7. ‏clock-sync mechanism/environment.

‏אין לקבע בקוד מספר כגון `250ms` או `500ms` רק משום שהיה נכון לתיעוד של API מסוים בזמן מסוים.

---

## ‏28. Current Verification Snapshot — 2026-10-26

‏לצורך ה־Sheet הזה בוצע אימות נקודתי מול תיעוד רשמי עדכני:

- ‏`IBKR Web API — Market Data Update Frequency`: התיעוד הנוכחי מציין `500ms` עבור Watchlist market data בכל המוצרים.
- ‏`IBKR Web API — Pacing Limitations`: קיימת מגבלה גלובלית של `10 requests/sec` לכל authenticated username/session; עבור market data frequency גבוהה יותר התיעוד מפנה ל־WebSocket `smd` במקום polling HTML endpoints.
- ‏`IBKR — Market Data Lines`: מספר הזרמים הסימולטניים מוגבל לפי user/account entitlement ומשותף ל־TWS/API לפי התיעוד.
- ‏`Alpaca — Real-time Stock Data / WebSocket`: קיימים Streams מסוג `SIP`, ‏`IEX` ועוד, בהתאם ל־subscription; לכן coverage חייב להיות חלק מה־data contract.

‏הפרטים האלה הם snapshot תפעולי, לא Constants אסטרטגיים.

---

## ‏29. Relationship to Later Recommendation Sheets

‏ה־Sheet הזה קובע את מודל הזמן וה־performance boundaries, אך אינו קובע לבדו:

- ‏`07` — איזה Universe נכנס לסריקה.
- ‏`08–10` — אילו Momentum/velocity/activity horizons שווים מחקר.
- ‏`12–15` — Filters, Features, Ranking ו־Trade Gate.
- ‏`16–17` — Entry/Exit timing policy.
- ‏`20–23` — Backtest/realism/leakage validation.
- ‏Architecture/Performance chapters — implementation topology, queues, concurrency ו־runtime tuning.
- ‏Production Safety — SLOs, failover, incident behavior ו־kill switches.

---

# ‏Recommendation Summary

```text
P0  Complete timing telemetry for data → decision → order → fill
P0  Freshness + signal-expiry gates
P0  Backpressure / stale backlog => block new entries
P0  Clock health + UTC + monotonic durations
P1  Event-driven ingestion
P1  Incremental per-symbol state/features
P1  Controlled global ranking cadence
P1  Logical snapshot/cutoff for cross-sectional consistency
P1  Execution recheck before submit
P1  P50/P95/P99 latency, not average only
P1  Open position outranks new scanning under load
P2  Triggered ranking / adaptive cadence as measured challengers
P3  Faster infrastructure only after bottleneck + economic evidence
P4  Ultra-low-latency/HFT-style optimization only for a proven need
```

> ‏**המלצת ה־Baseline: אל תנסה להריץ הכול הכי מהר שאפשר. קבל מידע מהר, עדכן רק מה שהשתנה, דרג בקצב שנמדד כמשתלם, חסום Signal ישן או Queue מפגרת, ומדוד את כל הדרך מ־Market Event עד Fill. המטרה היא להיות מהיר מספיק ביחס ל־Signal Half-Life — לא לנצח מירוץ microseconds שלא שייך לאסטרטגיה שלנו.**