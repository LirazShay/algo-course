# ‏שלב 54 — `Performance Best Practices`: להיות מהירים מספיק בלי להפוך את הקוד למעבדת HFT

> ‏מטרת הפרק: לבנות מערכת Algo מהירה, יציבה וצפויה שמתאימה ל־momentum של מילישניות עד שניות — באמצעות measurement, profiling, hot-path design, allocations/GC control, concurrency, efficient data structures, batching, backpressure ו־tail-latency discipline — בלי לרדוף אחרי microseconds שאינם משנים את ה־Edge בפועל.
>
> ‏העיקרון המרכזי: **Optimize only after measurement. Performance טוב נמדד ב־end-to-end effect על freshness, decision latency ו־execution, לא ב־micro-benchmark מבודד.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. מה אנחנו באמת מנסים לייעל

‏במערכת שלנו היעד אינו:

```text
lowest possible nanoseconds
```

‏אלא:

```text
fresh market state
→ fast enough feature update
→ fast enough ranking
→ timely decision
→ timely submit
→ timely fill
→ timely exit
```

‏כל optimization צריך להיות קשור למסלול הזה.

---

# ‏2. Performance הוא חלק מה־Edge

‏אם signal חי `500ms`, עיכוב של `300ms` יכול למחוק את רוב הערך.

‏אם signal חי `10s`, אותו עיכוב עשוי להיות זניח.

‏לכן Performance אינו יעד אבסולוטי.

‏הוא פונקציה של:

```text
signal_half_life
market_speed
execution_latency
queue_age
freshness
```

---

# ‏3. ארבעת המדדים המרכזיים

‏נמדוד לפחות:

1. ‏`Latency`.
2. ‏`Throughput`.
3. ‏`Queue Age`.
4. ‏`Freshness`.

‏מערכת יכולה להיות בעלת throughput גבוה ועדיין גרועה אם היא מעבדת data ישן.

---

# ‏4. `P50` אינו מספיק

‏במסחר קצר חשוב במיוחד לראות:

- ‏`P50`.
- ‏`P90`.
- ‏`P95`.
- ‏`P99`.
- ‏`P99.9` כאשר יש מספיק samples.
- ‏`MAX` בזהירות.

‏ה־tail הוא המקום שבו לעיתים נוצרים stale decisions.

---

# ‏5. Tail Latency חשוב יותר מהממוצע

‏Average של `5ms` יכול להסתיר spikes של `300ms`.

‏אם דווקא בזמן market burst אנחנו נופלים ל־tail, הממוצע כמעט חסר משמעות.

---

# ‏6. `Latency Pressure`

‏נשתמש שוב במדד:

```text
LatencyPressure = EndToEndLatency / SignalHalfLife
```

‏המספר הזה עוזר להחליט האם optimization מסוים באמת שווה מאמץ.

---

# ‏7. Break-Even Performance

‏במקום לשאול:

```text
How fast can we go?
```

‏נשאל:

```text
How fast must we be for edge to remain positive?
```

---

# ‏8. Budget לכל שלב

‏אפשר להגדיר:

```text
feed_receive_budget
parse_budget
state_update_budget
feature_budget
rank_budget
risk_budget
submit_budget
```

‏אבל ה־budget חייב להתחבר ל־end-to-end.

---

# ‏9. Profiling לפני Optimization

‏לפני שינוי performance:

1. ‏מודדים.
2. ‏מוצאים bottleneck.
3. ‏משנים דבר אחד.
4. ‏מודדים שוב.
5. ‏בודקים effect על end-to-end.

---

# ‏10. CPU Profile

‏CPU profiler עונה על:

```text
Where is execution time actually spent?
```

‏לא על:

```text
Which code looks slow to me?
```

---

# ‏11. Allocation Profile

‏ב־`.NET`, allocations יכולים לגרור:

- ‏GC pressure.
- ‏pause variance.
- ‏cache pressure.
- ‏memory bandwidth.

‏לכן allocation rate חשוב במיוחד ב־hot path.

---

# ‏12. GC אינו “בעיה” כשלעצמו

‏GC הוא מנגנון נורמלי.

‏הבעיה היא כאשר:

```text
allocation_rate
× burst load
→ unpredictable pauses
→ stale data
```

---

# ‏13. Gen0/Gen1/Gen2

‏צריך לדעת לפחות רעיונית:

- ‏מה נכנס ל־Gen0.
- ‏מתי objects שורדים.
- ‏למה long-lived objects יכולים להגיע ל־Gen2.
- ‏למה full collections עלולות ליצור tail latency.

---

# ‏14. LOH

‏`Large Object Heap` חשוב כאשר נוצרים buffers גדולים.

‏Allocations גדולים חוזרים ב־hot path הם warning.

---

# ‏15. Object Pooling

‏Pooling מתאים כאשר:

- ‏ה־object יקר ליצירה.
- ‏הוא מופיע בתדירות גבוהה.
- ‏אפשר לאפס אותו בצורה בטוחה.

‏Pooling לא צריך להפוך complexity ברירת מחדל.

---

# ‏16. `ArrayPool<T>`

‏במקומות המתאימים אפשר להשתמש ב־`ArrayPool<T>` כדי להפחית allocations של buffers.

‏אבל חייבים:

- ‏להחזיר buffer.
- ‏לא להשתמש אחרי return.
- ‏לא להניח שה־buffer נקי.

---

# ‏17. `Span<T>` ו־`ReadOnlySpan<T>`

‏יכולים לעזור להפחית copying ו־allocations בפרסור ובחישוב.

‏אבל משתמשים בהם במקום שבו profile מוכיח שזה רלוונטי.

---

# ‏18. Strings ב־Hot Path

‏בעיבוד אלפי symbols, יצירת strings חוזרת יכולה להיות יקרה.

‏דוגמאות:

- ‏formatting.
- ‏concatenation.
- ‏logging.
- ‏parsing identifiers.

---

# ‏19. Logging יכול להיות Bottleneck

‏לוג מפורט לכל event יכול לעלות יותר מהחישוב עצמו.

‏לכן מפרידים:

```text
hot-path telemetry
full diagnostic payload
```

---

# ‏20. Structured Logging

‏עדיף events מובנים עם IDs ומספרים על פני בניית message string גדול בכל tick.

---

# ‏21. Sampling של Telemetry

‏אפשר לדגום telemetry שאינו קריטי.

‏אסור לדגום אירועי safety/order/fill קריטיים באופן שמונע reconstruction.

---

# ‏22. Data Structures לפני Micro-Optimization

‏בחירת מבנה נתונים שגוי יכולה לעלות הרבה יותר מאלף optimizations קטנים.

---

# ‏23. Array מול Dictionary

‏אם symbol universe מקבל dense integer ID, אפשר לעיתים להחזיק arrays לפי `SymbolId` במקום dictionary lookup בכל event.

‏זו דוגמה ל־structural optimization.

---

# ‏24. Canonical Symbol ID

‏מיפוי symbol string ל־integer פעם אחת מאפשר hot path פשוט יותר.

---

# ‏25. Cache Locality

‏גישה רציפה לזיכרון בדרך כלל ידידותית יותר ל־CPU cache מגישה מפוזרת.

---

# ‏26. Array of Structs מול Struct of Arrays

‏שתי צורות:

```text
AoS
SoA
```

‏הבחירה תלויה בדפוס הגישה.

‏אם ranking משתמש רק בכמה fields מתוך כל symbol, `SoA` יכול להיות יעיל יותר.

---

# ‏27. Benchmark אמיתי צריך לייצג Production

‏Benchmark של loop מלאכותי אינו מספיק.

‏צריך לבדוק:

- ‏מספר symbols.
- ‏event rate.
- ‏burstiness.
- ‏feature mix.
- ‏ranking frequency.
- ‏logging.

---

# ‏28. Microbenchmarks שימושיים אך מסוכנים

‏הם טובים כדי להשוות שתי implementations של operation מקומי.

‏הם לא מוכיחים ש־system latency השתפר.

---

# ‏29. End-to-End Benchmark

‏נרצה מסלול:

```text
raw event
→ canonical update
→ feature update
→ ranking
→ decision
```

‏עם timestamps בכל תחנה.

---

# ‏30. Burst Test

‏הממוצע של market data אינו מספיק.

‏צריך לבדוק bursts גדולים משמעותית מהממוצע.

---

# ‏31. Correlated Bursts

‏האירועים הקשים ביותר הם כאשר הרבה symbols מתעדכנים ביחד.

‏זה קורה דווקא כשהשוק נע מהר.

---

# ‏32. Queue Depth

‏נמדוד:

```text
queue_depth
queue_age
oldest_item_age
```

‏Queue depth לבדו אינו מספיק.

---

# ‏33. Queue Age הוא Metric עסקי

‏אם oldest event הוא בן `700ms`, המערכת כבר עלולה לקבל החלטות על עבר.

---

# ‏34. Backpressure

‏Backpressure הוא מנגנון שמונע מהמערכת להעמיד פנים שהיא עומדת בקצב כאשר היא לא.

---

# ‏35. Load Shedding

‏כאשר capacity נגמר, לא כל עבודה שווה אותו דבר.

‏אפשר להוריד קודם:

- ‏deep diagnostics.
- ‏expensive candidate enrichment.
- ‏non-critical analytics.

‏לא מורידים safety reconciliation או position handling.

---

# ‏36. Priority Classes

‏דוגמה:

```text
P0 safety / exits
P1 positions / working orders
P2 top candidates
P3 full-universe features
P4 diagnostics
```

---

# ‏37. Scanner Fast Path

‏לכל universe:

- ‏state update.
- ‏cheap features.
- ‏eligibility.
- ‏coarse ranking.

---

# ‏38. Deep Path

‏רק ל־Top N:

- ‏L2 analysis.
- ‏complex flow.
- ‏capacity estimate.
- ‏execution enrichment.

---

# ‏39. Complexity Budget

‏כל feature צריך לשלם על עצמו גם ב־predictive value וגם ב־compute cost.

---

# ‏40. Feature Cost Metric

‏אפשר למדוד:

```text
feature_cpu_ns
feature_alloc_bytes
feature_update_rate
feature_predictive_gain
```

---

# ‏41. Cheap Feature עם Value קטן

‏לפעמים cheap feature חלש עדיף על feature מעט חזק יותר אך יקר מאוד, כי הוא שומר freshness לכל universe.

---

# ‏42. Rank Frequency

‏אין הכרח למיין 4,000 symbols אחרי כל tick.

‏אפשר להשתמש:

- ‏dirty set.
- ‏incremental score updates.
- ‏periodic top-k refresh.

‏בהתאם ל־signal horizon.

---

# ‏43. Full Sort מול Top-K

‏אם צריך רק Top 20, full sort של כל universe בכל update עשוי להיות בזבוז.

---

# ‏44. Heap / Selection Structures

‏`heap`, ‏partial selection או structures אינקרמנטליים יכולים לעזור.

‏אבל correctness ודטרמיניזם קודמים.

---

# ‏45. Dirty Symbols

‏מחשב מחדש רק symbols שה־state הרלוונטי שלהם השתנה.

---

# ‏46. Dependency Graph

‏אם feature תלוי רק ב־trades, quote update לא חייב לחשב אותו מחדש.

---

# ‏47. Event-Type Selective Updates

‏דוגמה:

```text
Trade event → trade features
Quote event → quote/book features
Status event → tradability state
```

---

# ‏48. Batch Processing

‏Batching יכול להפחית overhead.

‏אבל batch גדול מדי מגדיל latency.

---

# ‏49. Batch Size הוא Trade-Off

```text
larger batch
→ better throughput
→ worse latency
```

---

# ‏50. Adaptive Batching

‏אפשר בעתיד להתאים batch size לעומס.

‏לא נתחיל בכך לפני שיש Evidence.

---

# ‏51. Event-Driven מול Polling

‏Event-driven מתאים כאשר provider שולח updates בזמן אמת.

‏Polling עלול להוסיף latency ועומס מיותר.

---

# ‏52. Busy Waiting

‏Busy wait יכול להפחית latency במערכות קיצוניות, אבל צורך CPU ומסבך operation.

‏אינו baseline לרובוט שלנו.

---

# ‏53. Thread-per-Symbol הוא Anti-Pattern

‏אלפי threads יוצרים scheduling overhead עצום.

---

# ‏54. Bounded Concurrency

‏מספר קטן ומכוון של workers עדיף בדרך כלל.

---

# ‏55. Single Writer per Partition

‏יכול לפשט:

- ‏ordering.
- ‏locking.
- ‏state ownership.

---

# ‏56. Partitioning לפי Symbol

‏Hash של symbol ל־partition מאפשר parallelism בלי concurrency בתוך אותו symbol.

---

# ‏57. Ordering Contract

‏Performance optimization שאובדת בו ordering correctness היא כישלון.

---

# ‏58. Lock Contention

‏צריך למדוד contention ולא לנחש.

---

# ‏59. Coarse Lock

‏קל ליישום אך עלול להגביל throughput.

---

# ‏60. Fine-Grained Locks

‏יכולים לשפר parallelism אך להגדיל complexity ו־deadlock risk.

---

# ‏61. Lock-Free אינו אוטומטית טוב יותר

‏Lock-free code יכול להיות:

- ‏קשה יותר לבדיקה.
- ‏קשה יותר ל־RCA.
- ‏רגיש ל־subtle races.

---

# ‏62. Concurrent Collections

‏נשתמש רק כשהן פותרות צורך אמיתי.

---

# ‏63. False Sharing

‏Threads שונים שכותבים fields סמוכים יכולים להילחם על cache lines.

‏זה advanced optimization — נבדוק רק אם profile מצביע עליו.

---

# ‏64. CPU Affinity

‏יכול להיות רלוונטי במערכות latency-sensitive מאוד.

‏אינו baseline אצלנו.

---

# ‏65. NUMA

‏בשרתים גדולים NUMA יכול להשפיע על memory access.

‏כנראה לא יעד ראשון לרובוט אישי.

---

# ‏66. Context Switches

‏יותר threads אינם בהכרח יותר performance.

---

# ‏67. Async אינו קסם

‏`async/await` טוב ל־I/O.

‏הוא לא מאיץ CPU-bound computation בעצמו.

---

# ‏68. Async Overhead

‏ב־hot path קטן מאוד גם state-machine allocations/continuations יכולים להיות רלוונטיים.

‏מודדים לפני שינוי.

---

# ‏69. Sync-over-Async

‏`.Result` / `.Wait()` יכולים ליצור blocking ובעיות scheduling.

---

# ‏70. I/O Separation

‏Market ingest, persistence ו־analytics אינם חייבים לרוץ באותו critical path.

---

# ‏71. Write-Ahead / Async Persistence

‏אפשר להפריד persistence מה־decision path כאשר durability contract מאפשר זאת.

‏אבל אסור לאבד order/fill journal קריטי.

---

# ‏72. Hot Path Definition

‏Hot path אצלנו הוא המסלול שעלול להשפיע על trade decision או execution בזמן אמת.

---

# ‏73. Cold Path

‏Cold path כולל למשל:

- ‏daily reports.
- ‏deep RCA.
- ‏historical aggregation.
- ‏offline research.

---

# ‏74. Keep Cold Work Off Hot Threads

‏זו אחת האופטימיזציות הכי פשוטות והכי יעילות.

---

# ‏75. JSON Parsing

‏אם feed גדול מגיע כ־JSON, parsing יכול להיות bottleneck.

---

# ‏76. Streaming Parser

‏Parser streaming יכול להפחית allocations לעומת בניית object tree מלא.

---

# ‏77. Binary Protocol

‏Binary feed יכול להיות יעיל יותר, אבל תלוי provider.

‏לא נבחר provider רק בגלל serialization speed.

---

# ‏78. Serialization Contracts

‏Benchmark חייב לכלול serialization אמיתי אם הוא חלק מהמסלול.

---

# ‏79. Copy Avoidance

‏Copying buffers גדולים שוב ושוב יכול לעלות זמן וזיכרון.

---

# ‏80. Zero-Copy

‏רעיון שימושי, אך לא יעד בפני עצמו.

---

# ‏81. Network RTT

‏לעיתים ה־bottleneck הוא בכלל provider/broker RTT, לא הקוד שלנו.

---

# ‏82. Local Optimization Ceiling

‏אם local processing הוא `2ms` וה־network הוא `150ms`, שיפור local ל־`1ms` אינו מהפכה.

---

# ‏83. Deployment Geography

‏מיקום השרת יכול להשפיע על latency הרבה יותר מ־micro-optimization בקוד.

---

# ‏84. DNS / TLS / Connection Setup

‏אסור להקים connection חדש לכל request במסלול חם.

---

# ‏85. Persistent Connections

‏`WebSocket`, ‏streaming connection או pooled connections עדיפים כשה־API מאפשר.

---

# ‏86. Reconnect Storm

‏Reconnect של כמה services בו־זמנית יכול ליצור load spike.

---

# ‏87. Warmup

‏ב־`.NET` יש:

- ‏JIT.
- ‏cache warmup.
- ‏connection warmup.

‏Benchmark cold start ו־steady state בנפרד.

---

# ‏88. Tiered Compilation

‏התנהגות JIT יכולה להשתנות לאורך זמן הריצה.

‏לכן benchmark קצר מדי עלול להטעות.

---

# ‏89. ReadyToRun / NativeAOT

‏יכולים להיות מעניינים במקרים מסוימים.

‏לא baseline בלי צורך מוכח.

---

# ‏90. Startup Latency

‏חשוב במיוחד ל־recovery.

‏מערכת שעולה תוך 500ms לעומת 20s יכולה לשנות outage exposure.

---

# ‏91. Recovery Performance

‏Performance אינו רק steady state.

‏צריך למדוד:

```text
restart_to_reconciled
restart_to_ready
```

---

# ‏92. Snapshot Restore

‏Restore state יעיל יכול לקצר startup.

---

# ‏93. Replay Catch-Up

‏אם צריך לעבד backlog אחרי restart, צריך לדעת כמה מהר המערכת סוגרת פער.

---

# ‏94. Catch-Up Ratio

```text
catch_up_rate / live_event_rate
```

‏צריך להיות גדול מ־1 כדי לסגור backlog.

---

# ‏95. Freshness During Catch-Up

‏בזמן catch-up אסור לערבב בקלות state ישן עם live state.

---

# ‏96. Load Shedding During Recovery

‏עבודות לא קריטיות יכולות להיחסם בזמן reconciliation.

---

# ‏97. Persistence Throughput

‏אם write path איטי, הוא עלול ליצור backpressure לכל המערכת.

---

# ‏98. Append-Only Journals

‏לעיתים append sequential פשוט ומהיר יותר מ־random updates.

---

# ‏99. Database Index Cost

‏יותר indexes = reads מהירים יותר לעיתים, writes יקרים יותר.

---

# ‏100. Hot Database Queries

‏Live path לא צריך לבצע queries כבדים שאפשר להחזיק ב־memory state.

---

# ‏101. In-Memory State

‏State חי של universe יכול לשבת בזיכרון כאשר זה מתאים ל־correctness/recovery design.

---

# ‏102. Persistence is not State Ownership

‏Database אינו חייב להיות hot-path owner של כל symbol state.

---

# ‏103. Snapshot Frequency

‏יותר snapshots מקלים recovery אך מגדילים I/O.

---

# ‏104. Compression Trade-Off

‏Compression חוסך I/O/storage אך צורך CPU.

---

# ‏105. Historical Storage אינו Live Store

‏אל תכריח OLAP workload על hot transactional path.

---

# ‏106. Metrics Cardinality

‏Metric לכל symbol×feature×venue יכול לפוצץ observability backend.

---

# ‏107. Metrics Aggregation

‏אפשר לשמור aggregate metrics ולתעד detail רק ל־Top N / anomalies.

---

# ‏108. Trace Sampling

‏Tracing מלא לכל market event כנראה יקר מדי.

---

# ‏109. Critical Trace

‏Decision → Order → Fill כן צריך correlation ID מלא.

---

# ‏110. GC Metrics

‏נעקוב לפחות אחרי:

- ‏allocation rate.
- ‏GC count.
- ‏pause duration.
- ‏heap size.

---

# ‏111. Thread Pool Metrics

‏נמדוד:

- ‏queue length.
- ‏available workers.
- ‏thread count.
- ‏starvation indicators.

---

# ‏112. CPU Saturation

‏`100% CPU` אינו בהכרח יעילות.

‏אם latency עולה, אנחנו saturated.

---

# ‏113. Headroom

‏Production לא צריך לפעול כל היום ב־99% capacity.

---

# ‏114. Burst Headroom

‏צריך מקום ל־bursts, reconnects ו־recovery.

---

# ‏115. Capacity Envelope

‏נגדיר:

```text
symbols
× events_per_second
× feature_cost
× ranking_rate
```

---

# ‏116. Stress Beyond Expected Peak

‏נבדוק מעל peak היסטורי סביר כדי לראות failure mode.

---

# ‏117. Graceful Degradation

‏עדיף:

```text
degraded but safe
```

‏על:

```text
fast until sudden collapse
```

---

# ‏118. Saturation Signal

‏המערכת צריכה לזהות בעצמה שהיא מפגרת.

---

# ‏119. Freshness Kill Gate

‏אם queue age עובר threshold, new entries יכולים להיחסם.

---

# ‏120. Performance Circuit Breaker

‏אפשר להגדיר guardrails על:

- ‏queue age.
- ‏coverage.
- ‏decision latency.
- ‏broker ACK latency.

---

# ‏121. Rank Staleness

‏Top candidate שנבחר לפני `300ms` יכול כבר לא להיות Top candidate.

---

# ‏122. Pre-Submit Revalidation

‏לכן recheck לפני submit הוא גם performance correctness.

---

# ‏123. Fresh Coverage

‏לא מספיק שה־Scanner סיים cycle.

‏צריך לדעת כמה מה־universe באמת fresh.

---

# ‏124. Cross-Sectional Fairness

‏Symbol שמקבל יותר CPU בגלל event rate גבוה יכול לקבל יתרון ranking לא מוצדק.

---

# ‏125. Scheduling Bias

‏Processing order יכול להפוך בטעות ל־ranking bias.

---

# ‏126. Deterministic Tie-Breaking

‏Optimization לא צריך לשנות winner רק בגלל thread timing.

---

# ‏127. Parallel Reduction

‏אפשר לבצע parallel scoring ואז deterministic merge.

---

# ‏128. Floating-Point Reproducibility

‏Parallel aggregation יכול לשנות סדר חיבור ומעט את התוצאה.

‏צריך להבין האם זה משנה rank boundaries.

---

# ‏129. Precision vs Speed

‏לא מורידים precision בלי לבדוק business effect.

---

# ‏130. Integer Prices

‏מחירים ב־ticks/integers יכולים לעזור גם correctness וגם performance בחלק מהמערכת.

---

# ‏131. Avoid Decimal Everywhere by Habit

‏`decimal` מדויק פיננסית אך איטי יותר מ־`double` במקרים מסוימים.

‏הבחירה צריכה להיות domain-specific.

---

# ‏132. Money vs Features

‏אפשר להשתמש representations שונים ל־money accounting לעומת statistical features.

---

# ‏133. Branch Prediction

‏Advanced topic.

‏Hot loops עם branches לא צפויים יכולים להיות יקרים.

‏לא optimize בלי profile.

---

# ‏134. Vectorization

‏`SIMD` יכול לעזור בחישובים רחבים על arrays.

‏רלוונטי אולי לחישובי features batchיים.

---

# ‏135. SIMD אינו חובה

‏אם feature latency הוא כבר קטן, complexity אינה משתלמת.

---

# ‏136. Native Libraries

‏P/Invoke/native code יכול לשפר performance מסוים אבל מוסיף operational complexity.

---

# ‏137. GPU

‏GPU מצוין לחלק מעבודות batch/ML.

‏פחות טבעי למסלול event-by-event קטן עם latency נמוך.

---

# ‏138. GPU Transfer Cost

‏העברת data ל־GPU יכולה למחוק יתרון בחישוב קטן.

---

# ‏139. ML Inference Budget

‏אם בעתיד יהיה model, inference time הוא חלק מ־latency budget.

---

# ‏140. Model Complexity Tax

‏Model מדויק מעט יותר אבל פי 20 איטי יותר אינו בהכרח טוב יותר.

---

# ‏141. Feature Store Access

‏Remote feature lookup במסלול חם יכול להיות בעייתי.

---

# ‏142. Co-locate Hot State

‏Hot features עדיף לעיתים לחשב/להחזיק בתוך process או service קרוב.

---

# ‏143. Service Boundaries Cost Latency

‏כל network hop מוסיף:

- ‏serialization.
- ‏queueing.
- ‏failure mode.

---

# ‏144. Microservices אינם יעד

‏נשתמש בהם כשיש boundary אמיתי, לא כדי “להיות enterprise”.

---

# ‏145. KISS Architecture

‏לרובוט אישי, monolith מודולרי יכול להיות מהיר ופשוט יותר.

---

# ‏146. In-Process Calls

‏זולים משמעותית מ־RPC.

---

# ‏147. Process Isolation Trade-Off

‏Isolation טוב ל־fault containment אך עולה latency/complexity.

---

# ‏148. Bounded Queues

‏Queue בלתי מוגבל מסתיר overload עד שהמערכת כבר stale לחלוטין.

---

# ‏149. Drop Policy

‏אם queue מלאה, צריך policy מפורש.

‏לא `drop random`.

---

# ‏150. Latest-State Coalescing

‏ל־quotes מסוימים אפשר לעיתים לשמור latest state במקום לעבד כל intermediate update — רק אם strategy semantics מאפשרים.

---

# ‏151. Trades אינם תמיד Coalescible

‏Trade count/flow features יכולים לדרוש כל event.

---

# ‏152. Semantic Load Shedding

‏מה שאפשר לדלג עליו תלוי במשמעות, לא רק בגודל message.

---

# ‏153. Event Compression in Memory

‏אפשר לשמור rolling aggregates במקום raw events כאשר החישוב דורש רק aggregate.

---

# ‏154. Ring Buffers

‏מתאימים לחלונות זמן קצרים בגודל חסום.

---

# ‏155. Fixed-Size Buffers

‏יכולים להפחית allocations ולשמור latency צפוי.

---

# ‏156. Sliding Window Complexity

‏אל תחשב sum מחדש על כל window אם אפשר update אינקרמנטלי.

---

# ‏157. Rolling Sum

```text
new_sum = old_sum + new_value - expired_value
```

---

# ‏158. Rolling Count

‏אותו רעיון ל־trade count ו־volume.

---

# ‏159. Multiple Horizons

‏10 windows לא חייבים 10 full scans של history.

---

# ‏160. Prefix / Bucket Structures

‏אפשר להשתמש buckets או cumulative counters לפי הצורך.

---

# ‏161. Time Buckets

‏Buckets קטנים יכולים לתת update זול לחלונות רבים.

---

# ‏162. Bucket Resolution Trade-Off

‏Resolution גס חוסך CPU אך משנה feature semantics.

---

# ‏163. Exact vs Approximate

‏Approximation מותר רק אם נמדד predictive impact.

---

# ‏164. Top-N Deep Enrichment

‏זו אחת האופטימיזציות החשובות לרובוט שלנו.

---

# ‏165. Full-Universe L2

‏יכול להיות יקר ב־CPU, memory ו־data cost.

‏לא נניח שהוא דרוש.

---

# ‏166. L1 Broad / L2 Narrow

‏Baseline פרקטי:

```text
L1 across universe
L2 for top candidates
```

---

# ‏167. Candidate Promotion Cost

‏Promotion ל־deep path צריך להיות מהיר ולא לייצר cold-start latency גדול.

---

# ‏168. Cache Warm Candidate State

‏אפשר לשמור subset מה־deep state גם למועמדים קרובים ל־Top N.

---

# ‏169. Hysteresis

‏Hysteresis ב־promotion/demotion יכול להפחית churn computational.

---

# ‏170. Churn Cost

‏Top-N churn יכול ליצור הרבה subscriptions, allocations ו־book rebuilds.

---

# ‏171. Subscription Rate Limits

‏Data provider עשוי להגביל subscription churn.

‏זה operational performance, לא רק CPU.

---

# ‏172. Broker Rate Limits

‏Execution path צריך budget נפרד ל־API pacing.

---

# ‏173. Performance vs Rate-Limit Safety

‏שליחה מהר יותר אינה מועילה אם API מתחיל לדחות.

---

# ‏174. Retry Storm

‏Retries בלתי מבוקרים בזמן latency spike עלולים להכפיל עומס.

---

# ‏175. Exponential Backoff אינו למסלול Exit קריטי באופן עיוור

‏Retry policy חייבת להיות operation-aware.

---

# ‏176. Idempotency Before Retry

‏Performance לעולם לא מצדיק duplicate orders.

---

# ‏177. Cancellation Priority

‏Cancel/Exit actions מקבלות קדימות על analytics.

---

# ‏178. Pending Exposure Priority

‏Symbols עם position/pending order חשובים יותר מסמל חדש שלא נכנסנו אליו.

---

# ‏179. Whole-System Scheduler

‏ה־scheduler צריך להבין business priority, לא רק FIFO.

---

# ‏180. FIFO אינו תמיד נכון

‏Event בן `2s` למניה לא רלוונטית לא צריך לעכב Exit event טרי.

---

# ‏181. Stale Work Cancellation

‏אם result כבר אינו שימושי, עדיף לפעמים לבטל עבודה יקרה.

---

# ‏182. Cancellation Tokens

‏ב־.NET אפשר להשתמש בצורה מבוקרת לביטול work שאיבד relevance.

---

# ‏183. Deadline-Aware Work

‏לכל task אפשר לחשוב על deadline עסקי.

---

# ‏184. Signal TTL as Scheduling Input

‏Task של signal שימות בעוד `50ms` שונה מ־task שחי `5s`.

---

# ‏185. Earliest Deadline First

‏רעיון מתקדם שיכול להיות רלוונטי בעתיד.

---

# ‏186. Preemption Complexity

‏לא מוסיפים scheduler מורכב לפני שיש צורך מוכח.

---

# ‏187. Benchmark Environment

‏Benchmark צריך להיות על environment דומה ל־production.

---

# ‏188. Debug vs Release

‏לא מודדים performance רציני ב־Debug.

---

# ‏189. Warm vs Cold Cache

‏צריך לדעת איזה scenario נמדד.

---

# ‏190. Background Noise

‏Process אחרים, antivirus, backup ו־browser יכולים לשנות latency במחשב אישי.

---

# ‏191. Dedicated Host

‏יכול לשפר יציבות יותר משיפור קוד קטן.

---

# ‏192. Virtualization Noise

‏Cloud VM יכול להוסיף jitter לפי instance/runtime.

---

# ‏193. Container Overhead

‏בדרך כלל קטן, אך networking/cgroup limits יכולים להשפיע.

---

# ‏194. CPU Throttling

‏Cloud/container quotas יכולים ליצור tail spikes.

---

# ‏195. Power Management

‏CPU frequency scaling יכול להשפיע latency.

‏נוגע בעיקר כאשר tail latency רגיש מאוד.

---

# ‏196. Thermal Throttling

‏במחשב מקומי עומס ממושך יכול להוריד clocks.

---

# ‏197. Performance Baseline

‏שומרים baseline versioned.

---

# ‏198. Regression Budget

‏לכל component אפשר להגדיר acceptable regression.

---

# ‏199. Performance CI

‏לא כל benchmark מתאים ל־PR CI.

‏חלק מהבדיקות יכולות להיות scheduled.

---

# ‏200. Fast Performance Smoke

‏ב־CI מהיר אפשר לבדוק catastrophic regressions בלבד.

---

# ‏201. Deep Performance Suite

‏Nightly/weekly יכול לכלול:

- ‏burst replay.
- ‏soak.
- ‏GC stress.
- ‏large-universe load.

---

# ‏202. Soak Test

‏Performance leak יכול להופיע אחרי שעות, לא דקות.

---

# ‏203. Memory Leak

‏נעקוב אחרי:

```text
heap_growth_over_time
retained_objects
subscription_count
```

---

# ‏204. Handle / Socket Leak

‏לא כל leak הוא managed memory.

---

# ‏205. Subscription Leak

‏Top-N churn יכול להשאיר subscriptions ישנות אם cleanup שגוי.

---

# ‏206. Timer Explosion

‏Timer לכל symbol יכול להיות anti-pattern.

---

# ‏207. Central Scheduler

‏לעיתים scheduler מרכזי יעיל יותר מאלפי timers.

---

# ‏208. Clock Calls Cost

‏קריאת זמן בכל inner-loop יכולה לעלות, אבל correctness קודם.

---

# ‏209. Timestamp Once Per Batch

‏לפעמים אפשר לשתף timestamp logical — רק אם semantics מאפשרים.

---

# ‏210. Monotonic Time

‏Duration measurement צריך monotonic clock.

---

# ‏211. Wall Clock אינו Duration Clock

‏NTP adjustment יכול לשנות wall clock.

---

# ‏212. Profiling in Production

‏Profiling מוגבל/sampled ב־production יכול לגלות bottleneck שלא מופיע במעבדה.

---

# ‏213. Low-Overhead Diagnostics

‏נעדיף counters/histograms זולים במסלול חם.

---

# ‏214. Performance Incident Packet

‏כאשר latency spike קורה נשמור:

- ‏event rates.
- ‏queue age.
- ‏CPU.
- ‏GC.
- ‏memory.
- ‏thread pool.
- ‏provider latency.
- ‏broker latency.
- ‏top symbols.

---

# ‏215. Correlation IDs

‏מאפשרים לקשור latency במסלול `decision → order → fill`.

---

# ‏216. First Divergence

‏ב־RCA נשאל באיזה שלב המסלול התחיל לחרוג מה־baseline.

---

# ‏217. Performance RCA Taxonomy

‏דוגמאות:

```text
PERF_FEED_DELAY
PERF_PARSE_CPU
PERF_GC_PAUSE
PERF_THREADPOOL_STARVATION
PERF_QUEUE_BACKLOG
PERF_RANKING_OVERLOAD
PERF_PROVIDER_RTT
PERF_BROKER_RTT
PERF_LOGGING_PRESSURE
PERF_PERSISTENCE_PRESSURE
```

---

# ‏218. Provider Latency vs Local Latency

‏אל תאשים את הקוד המקומי ב־delay שמגיע upstream.

---

# ‏219. Data Timestamp Decomposition

‏נרצה להפריד:

```text
EventTime
ReceiveTime
ReadyTime
DecisionTime
SubmitTime
AckTime
FillTime
```

---

# ‏220. Clock Confidence

‏אין טעם להשוות timestamps ממערכות שונות בלי להבין clock sync.

---

# ‏221. Performance Changes Require Replay

‏Optimization concurrency יכול לשנות event ordering.

‏לכן כל שינוי משמעותי צריך deterministic replay comparison.

---

# ‏222. Performance Changes Require Strategy Diff

‏נשווה:

- ‏Top candidates.
- ‏trade/no-trade decisions.
- ‏timing.
- ‏fills simulation.

---

# ‏223. Faster but Different Can Be a Bug

‏אם optimization משנה החלטות, צריך להבין למה.

---

# ‏224. Semantic Equivalence

‏המטרה היא לעיתים:

```text
same decision
faster
```

‏ולא:

```text
different decision
because timing changed accidentally
```

---

# ‏225. Timing Can Legitimately Change Decisions

‏אם המערכת החדשה רואה state fresh יותר, decision יכול להשתנות באופן מוצדק.

‏צריך לסווג זאת במפורש.

---

# ‏226. Performance A/B

‏אפשר להשוות versions על אותו replay workload.

---

# ‏227. Tail Comparison

‏נשווה distributions, לא רק averages.

---

# ‏228. Throughput vs Freshness Curve

‏נמדוד כיצד freshness יורדת כאשר load עולה.

---

# ‏229. Knee Point

‏נזהה את הנקודה שבה תוספת load קטנה גורמת ל־latency explosion.

---

# ‏230. Operate Below the Knee

‏Production צריך headroom לפני נקודת הקריסה.

---

# ‏231. Performance Headroom Metric

```text
Headroom = SustainableRate / CurrentPeakRate
```

---

# ‏232. Latency Headroom

‏נמדוד גם כמה אנחנו רחוקים מ־signal TTL.

---

# ‏233. Optimization ROI

‏נשאל:

```text
How much latency did we save?
How much complexity did we add?
Did net edge improve?
```

---

# ‏234. Complexity Tax

‏Optimization שקשה לתחזק, לבדוק ולשחזר חייב להצדיק את עצמו.

---

# ‏235. Readability Matters

‏קוד מעט איטי יותר אך נכון וברור יכול להיות עדיף עד שהפרופיילר מוכיח אחרת.

---

# ‏236. Premature Optimization

‏במערכת פיננסית הוא מסוכן במיוחד כי הוא יכול להסתיר correctness bug.

---

# ‏237. Optimization Theatre

‏דוגמאות:

- ‏להחליף API ברור ב־unsafe code בלי צורך.
- ‏להילחם על microseconds כאשר provider מוסיף 100ms.
- ‏להוסיף 20 threads כשהבעיה היא lock אחד.
- ‏להשתמש GPU לחישוב קטן.

---

# ‏238. Practitioner Secret — Stability Beats Peak Speed

‏מערכת `5ms ± 1ms` יכולה להיות שימושית יותר ממערכת `2ms` בממוצע עם spikes של `200ms`.

---

# ‏239. Practitioner Secret — Burst Behavior Matters Most

‏Performance צריך להיות טוב דווקא כשהשוק פעיל.

---

# ‏240. Practitioner Secret — Queue Age Often Tells the Truth

‏CPU usage יכול להיראות סביר בזמן שה־pipeline כבר stale.

---

# ‏241. Practitioner Secret — Slow Diagnostics Can Cause Trading Bugs

‏Observability מוגזם במסלול חם יכול לגרום בדיוק לבעיה שהוא מנסה למדוד.

---

# ‏242. Practitioner Secret — More Parallelism Can Reduce Determinism

‏Parallelism צריך להיות bounded ו־partition-aware.

---

# ‏243. Practitioner Secret — Performance Bug Can Masquerade as Strategy Decay

‏אם signal age עלה, PnL יכול לרדת גם כשה־model לא השתנה.

---

# ‏244. Practitioner Secret — Strategy Can Masquerade as Performance Problem

‏אם signal half-life קצר מדי, שום local optimization סביר לא יציל אותו.

---

# ‏245. Practitioner Secret — Fast Scanner + Slow Broker Still Loses

‏End-to-end הוא מה שקובע.

---

# ‏246. Practitioner Secret — Fast Entry + Slow Exit Is Dangerous

‏`time_to_flat` חשוב לפחות כמו `time_to_entry`.

---

# ‏247. Practitioner Secret — Data Freshness Is a Performance Feature

‏Freshness אינו רק data quality.

---

# ‏248. Practitioner Secret — Performance Regression Can Be Regime-Specific

‏שוק שקט לא חושף burst bottleneck.

---

# ‏249. Practitioner Secret — Profile the Worst Minute

‏לא רק את היום הממוצע.

---

# ‏250. Practitioner Secret — Optimize the Critical 5%

‏רוב הקוד אינו hot path.

---

# ‏251. Baseline לרובוט שלנו

‏נתחיל פשוט:

```text
single canonical state per symbol
bounded partitions
incremental rolling features
cheap full-universe ranking
Top-N deep path
bounded queues
per-stage latency metrics
freshness gates
pre-submit recheck
```

---

# ‏252. מה לא נבנה ב־v1

‏לא נתחיל עם:

```text
FPGA
kernel bypass
custom NIC stack
lock-free everything
NUMA tuning
CPU pinning everywhere
GPU scanner
sub-microsecond targets
```

---

# ‏253. מטרות Performance ראשוניות

‏המטרות צריכות להגיע ממדידות אמיתיות של signal half-life.

‏לא נקבע מספרי ms שרירותיים לפני data.

---

# ‏254. Metrics לרובוט שלנו

‏נשמור לפחות:

```text
feed_receive_to_ready_ms
ready_to_rank_ms
rank_to_decision_ms
decision_to_submit_ms
submit_to_ack_ms
submit_to_fill_ms
fill_to_exit_decision_ms
exit_decision_to_flat_ms
queue_age_ms
fresh_coverage_ratio
```

---

# ‏255. `P99` לפי Market Regime

‏ננתח latency בנפרד בזמן:

- ‏quiet market.
- ‏normal market.
- ‏burst.
- ‏open/close.
- ‏fast market.

---

# ‏256. Performance Acceptance Scenario

‏Golden load scenario צריך להוכיח:

```text
full universe remains fresh
ranking stays deterministic
queue age stays bounded
positions/exits keep priority
no safety invariant breaks
```

---

# ‏257. Performance Regression Gate

‏שינוי שמחמיר materially tail latency צריך הסבר או rollback.

---

# ‏258. Performance + Economics

‏לבסוף נמדוד:

```text
latency improvement
→ better fills?
→ lower adverse selection?
→ lower giveback?
→ better net edge?
```

---

# ‏259. Performance שאינו משנה Economics

‏אם optimization לא משנה freshness, decisions, execution או operating cost באופן משמעותי — הוא כנראה אינו priority.

---

# ‏260. כלל עליון

> ‏**המערכת שלנו צריכה להיות מהירה מספיק כדי שה־Edge של מילישניות–שניות עדיין יהיה חי, אבל גם פשוטה, דטרמיניסטית, ניתנת לבדיקה ויציבה מספיק כדי שנוכל לסמוך עליה בזמן אמת.**

---

# ‏Checklist

- ‏האם מדדנו end-to-end ולא רק method קטן?
- ‏האם יש P50/P95/P99?
- ‏האם queue age נמדד?
- ‏האם freshness נמדד?
- ‏האם יש burst test?
- ‏האם allocations/GC נבדקו?
- ‏האם hot path ידוע?
- ‏האם cold work מופרד?
- ‏האם backpressure bounded?
- ‏האם priorities עסקיים נשמרים?
- ‏האם deterministic replay נשאר זהה?
- ‏האם optimization באמת שיפר economics?

---

# ‏מה צריך לזכור בעל פה

1. ‏`Optimize only after measurement`.
2. ‏Tail latency חשוב יותר מהממוצע.
3. ‏Queue age ו־freshness הם metrics מרכזיים.
4. ‏Incremental computation לפני micro-optimization.
5. ‏Cheap full-universe path + deep Top-N path.
6. ‏More threads אינם בהכרח יותר מהירות.
7. ‏GC/allocations חשובים רק ביחס ל־hot path ול־tail.
8. ‏Performance optimization לא יכול לשבור determinism/correctness.
9. ‏Entry latency ו־Exit latency שניהם חשובים.
10. ‏Microseconds אינם היעד שלנו; `edge capture` הוא היעד.

---

# ‏מעבר לשלב הבא

‏אחרי שבנינו בסיס performance נכון, השלב הבא הוא **55 — `Security and Operations Best Practices`**: הגנה על credentials, least privilege, secret rotation, environment separation, production access, deployment safety, auditability, incident response ו־operational controls למערכת שמסוגלת לשלוח פקודות אמיתיות.