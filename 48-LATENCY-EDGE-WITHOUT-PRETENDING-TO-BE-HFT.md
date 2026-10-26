# ‏שלב 48 — `Latency Edge without pretending to be HFT`: להיות מהיר מספיק ל־Edge שלנו

> ‏מטרת הפרק: להבין איפה `latency` באמת משנה לרובוט שמחפש מומנטום קצר בסדרי גודל של מילישניות עד שניות, איך לפרק את זמן התגובה מקצה לקצה, איך לזהות jitter ו־tail latency, אילו אופטימיזציות תוכנה/רשת/ארכיטקטורה שוות את העלות, ומתי מרדף אחרי microseconds אינו רלוונטי למודל שלנו.
>
> ‏העיקרון המרכזי: **המטרה אינה להיות המערכת המהירה ביותר בשוק. המטרה היא להיות מהירים, יציבים וצפויים מספיק כדי שה־signal עדיין יהיה חי כאשר אנחנו מזהים אותו, מקבלים החלטה, שולחים Order ומקבלים Fill.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. קודם מגדירים את המשחק שאנחנו משחקים

‏אנחנו לא מנסים לבנות `HFT` שמתחרה על microseconds או nanoseconds.

‏אנחנו לא מניחים:

```text
co-location
FPGA
custom NIC
kernel bypass
exchange-native feed handlers in hardware
sub-microsecond reaction time
```

‏אלה תחומים אמיתיים ומקצועיים, אבל אינם היעד של המערכת שלנו.

‏היעד שלנו הוא:

```text
millisecond-to-seconds momentum
```

‏כלומר signals שעשויים לחיות:

- ‏עשרות מילישניות במקרים מסוימים.
- ‏מאות מילישניות.
- ‏שנייה או שתיים.
- ‏מספר שניות.
- ‏לעיתים עשרות שניות ועד בערך דקה.

‏הפרק כולו בנוי סביב השאלה:

> ‏האם אנחנו מספיק מהירים כדי ללכוד Edge כזה בצורה עקבית ורווחית נטו?

---

# ‏2. `Fastest Possible` אינו היעד

‏קל מאוד להפוך latency לפרויקט אינסופי.

‏אפשר תמיד לשאול:

```text
Can we save another 5 microseconds?
```

‏אבל זו אינה השאלה העסקית.

‏השאלה העסקית היא:

```text
Would saving those 5 microseconds materially improve:
- candidate selection?
- fill probability?
- slippage?
- adverse selection?
- missed opportunity?
- net PnL?
```

‏אם התשובה לא מוכחת — זו אופטימיזציה טכנית, לא `Edge`.

---

# ‏3. המדד החשוב: latency ביחס ל־Signal Half-Life

‏נגדיר בקירוב:

```text
Latency Pressure = EndToEndLatency / SignalHalfLife
```

‏לדוגמה:

```text
signal half-life = 2,000 ms
end-to-end latency = 80 ms
latency pressure = 4%
```

‏זה שונה מאוד מ־:

```text
signal half-life = 120 ms
end-to-end latency = 80 ms
latency pressure = 67%
```

‏אותו `80ms` הוא פעם אחת מצוין ופעם אחת בעייתי מאוד.

---

# ‏4. `Signal Half-Life`

‏`Signal Half-Life` אינו חייב להיות זמן פיזיקלי מדויק כמו מחצית חיים בפיזיקה.

‏בהקשר שלנו זהו כלי למדידת decay:

> ‏כמה מהר ה־predictive/executable edge של signal יורד לאחר הופעתו.

‏אפשר למדוד למשל:

```text
edge_at_0ms
edge_at_50ms
edge_at_100ms
edge_at_250ms
edge_at_500ms
edge_at_1s
edge_at_2s
edge_at_5s
```

‏ואז לקבל `Latency Sensitivity Curve`.

---

# ‏5. Latency אינו מספר אחד

‏אסור לומר רק:

```text
our latency is 100 ms
```

‏יש כמה latency domains:

```text
Market Event Latency
Data Transport Latency
Decode Latency
Canonicalization Latency
Feature Latency
Ranking Latency
Decision Latency
Risk Latency
Order Construction Latency
Broker Transport Latency
Broker Processing Latency
Venue Latency
Fill Latency
Callback Latency
Exit Detection Latency
Exit Submission Latency
Time To Flat
```

‏כל אחד מהם יכול להיות bottleneck אחר.

---

# ‏6. End-to-End Timeline

‏נרצה timeline מפורש:

```text
exchange_event_time
→ provider_receive_time
→ app_receive_time
→ normalized_time
→ feature_ready_time
→ rank_ready_time
→ decision_time
→ risk_approved_time
→ intent_created_time
→ broker_send_time
→ broker_ack_time
→ first_fill_time
→ complete_fill_time
```

‏ליציאה:

```text
exit_signal_time
→ exit_decision_time
→ exit_send_time
→ exit_ack_time
→ exit_first_fill_time
→ flat_time
```

---

# ‏7. `Market-to-Decision Latency`

‏מדד חשוב:

```text
market_to_decision = decision_time - market_event_time
```

‏אבל יש כאן מלכודת.

‏אם `market_event_time` מגיע משעון של מערכת אחרת שאינו מסונכרן היטב, התוצאה יכולה להיות שגויה.

‏לכן צריך להפריד:

```text
provider/exchange timestamps
local receive timestamps
monotonic durations
```

---

# ‏8. `Decision-to-Submit Latency`

```text
decision_to_submit = broker_send_time - decision_time
```

‏זה latency שנמצא יחסית בשליטתנו.

‏הוא כולל למשל:

- ‏Risk checks.
- ‏Sizing.
- ‏Order construction.
- ‏Serialization.
- ‏Locks/queues.
- ‏Thread scheduling.
- ‏Logging אם עשינו אותו לא נכון.

---

# ‏9. `Submit-to-ACK Latency`

```text
submit_to_ack = broker_ack_time - broker_send_time
```

‏הוא כולל בדרך כלל:

- ‏Network.
- ‏Broker gateway/session.
- ‏Broker-side validation.
- ‏Routing path.
- ‏עומס.

‏חלק גדול ממנו אינו בשליטתנו הישירה.

---

# ‏10. `Submit-to-Fill` אינו רק Latency

```text
submit_to_fill
```

‏מושפע גם מ־:

- ‏Order aggressiveness.
- ‏Queue position.
- ‏Liquidity.
- ‏Spread.
- ‏Routing.
- ‏Market movement.

‏לכן `time_to_fill` אינו מדד latency טהור.

---

# ‏11. `Time-to-Flat`

‏לרובוט קצר שלנו זה אחד המדדים הקריטיים ביותר.

```text
time_to_flat = flat_time - exit_decision_time
```

‏אפשר להיות מהירים בכניסה ועדיין להפסיד אם היציאה איטית.

---

# ‏12. Mean Latency כמעט חסר משמעות לבדו

‏ממוצע יכול להסתיר spikes.

‏למשל:

```text
99 requests = 20 ms
1 request   = 2,000 ms
```

‏הממוצע אינו מספר את הסיפור החשוב.

‏במערכת קצרה צריך לפחות:

```text
P50
P90
P95
P99
P99.9 when enough data exists
MAX
```

---

# ‏13. Tail Latency

‏`Tail Latency` הוא latency בקצה ההתפלגות.

‏במסחר קצר הוא חשוב במיוחד כי:

> ‏האירועים שבהם המערכת הכי איטית עלולים להתרחש בדיוק כאשר השוק הכי עמוס וה־Edge הכי מעניין.

‏לכן tail אינו רק inconvenience.

‏הוא עלול להיות correlated עם market stress.

---

# ‏14. `Jitter`

‏Jitter הוא חוסר היציבות בזמן התגובה.

‏שתי מערכות:

```text
System A: 40–50 ms almost always
System B: 10–300 ms unpredictably
```

‏למרות של־B אולי ממוצע טוב יותר, A יכולה להיות טובה יותר למסחר כי היא צפויה.

---

# ‏15. Determinism חשוב כמעט כמו Speed

‏במערכת שלנו יעד נכון הוא:

```text
fast enough
+ low jitter
+ measurable
+ reproducible
+ safe
```

‏ולא:

```text
fast in benchmark demo
```

---

# ‏16. Latency Budget

‏במקום “תהיה מהיר”, נגדיר budget.

‏דוגמה מחקרית בלבד:

```text
Market data receive    10 ms
Normalize               2 ms
Features                8 ms
Rank                    5 ms
Decision                2 ms
Risk                    2 ms
Order build             1 ms
Send                   10 ms
Broker ACK             30 ms
----------------------------
Decision path          70 ms
```

‏המספרים אינם targets אוניברסליים.

‏הם חייבים להיגזר מה־signal שלנו ומהתשתית בפועל.

---

# ‏17. Budget לפי Stage

‏לכל stage נשמור:

```text
budget_ms
p50_ms
p95_ms
p99_ms
max_ms
budget_breach_count
```

‏כך יודעים איפה הזמן נעלם.

---

# ‏18. Budget Burn

‏אפשר להגדיר:

```text
budget_usage = observed_latency / latency_budget
```

‏אם:

```text
budget_usage > 1
```

‏יש breach.

‏אבל breach יחיד אינו בהכרח incident.

‏צריך frequency/context.

---

# ‏19. Latency Attribution

‏כל latency spike צריך להיות מיוחס ככל האפשר ל־layer:

```text
DATA_PROVIDER
NETWORK
INGESTION
NORMALIZATION
FEATURES
RANKING
DECISION
RISK
QUEUE
SERIALIZATION
BROKER
EXECUTION
UNKNOWN
```

---

# ‏20. Unknown Latency הוא Category אמיתי

‏אם אין לנו evidence מספיק, לא ממציאים attribution.

```text
cause = UNKNOWN
```

‏ואז משפרים instrumentation.

---

# ‏21. Provider Latency

‏ה־provider עצמו יכול להיות source מרכזי של delay.

‏לכן נרצה למדוד אם אפשר:

```text
provider_timestamp → app_received_at
```

‏אבל שוב — clock domains שונים יכולים להטעות.

---

# ‏22. Data Freshness חשובה יותר מ־Fast Compute על Data ישן

‏אפשר לחשב Score ב־`1ms` על quote בת `800ms`.

‏זה לא מהיר.

‏זה מהר על מידע ישן.

‏לכן:

```text
freshness first
compute latency second
```

---

# ‏23. Signal Age

‏בזמן החלטה:

```text
signal_age = now - evidence_time
```

‏בזמן Submit:

```text
signal_age_at_submit
```

‏ובזמן Fill:

```text
signal_age_at_fill
```

‏שלושת המדדים שונים.

---

# ‏24. Fill על Signal מת

‏אחד ה־failure modes המסוכנים:

```text
Signal strong at t0
Order waits
Signal decays
Fill occurs late
```

‏מבחינת broker:

```text
SUCCESSFUL FILL
```

‏מבחינת strategy:

```text
possibly terrible execution
```

---

# ‏25. `Signal TTL`

‏לכל signal קצר צריך להיות TTL רעיוני או אמפירי.

```text
if signal_age > signal_ttl:
    reject_or_cancel
```

‏TTL אינו מספר שרירותי.

‏הוא נלמד מה־decay curve.

---

# ‏26. Latency Sensitivity Experiment

‏ניסוי חשוב:

‏ניקח את אותה Strategy ונוסיף artificial delay:

```text
0 ms
25 ms
50 ms
100 ms
250 ms
500 ms
1 s
2 s
```

‏ונמדוד:

```text
net EV
hit rate
fill rate
slippage
markout
selection regret
```

---

# ‏27. Break-Even Latency

‏נחפש:

> ‏באיזה delay ה־Net Edge נעלם?

‏זה הרבה יותר שימושי מהשאלה:

> ‏כמה מהר המחשב שלנו יכול לרוץ?

---

# ‏28. Latency Margin

‏אם Break-Even הוא `500ms` ואנחנו בדרך כלל ב־`450ms`, אין הרבה margin.

‏אם אנחנו ב־`80ms`, יש יותר headroom.

‏אפשר להגדיר:

```text
latency_headroom = break_even_latency - observed_latency
```

---

# ‏29. Latency Distribution, לא Constant Delay

‏Backtest ריאליסטי לא צריך תמיד:

```text
latency = 100 ms
```

‏אלא distribution.

‏למשל:

```text
mostly 40–80 ms
sometimes 100–200 ms
rarely 500+ ms
```

‏הזנב חשוב מאוד.

---

# ‏30. Correlated Latency

‏אסור להניח latency עצמאי מהשוק.

‏בפועל latency יכול לגדול ב־:

- ‏Open.
- ‏Close.
- ‏News bursts.
- ‏Fast markets.
- ‏High-volume symbols.
- ‏Provider reconnects.

‏דווקא כשה־opportunity גדלה, המערכת יכולה להאט.

---

# ‏31. Event-Driven עדיף בדרך כלל על Polling איטי

‏אם provider מספק streaming events, event-driven processing חוסך המתנה מלאכותית.

‏Polling כל `1s` יוצר בממוצע בערך חצי שנייה של sampling delay עוד לפני computation.

‏אבל event-driven אינו קסם.

‏צריך להתמודד עם bursts ו־backpressure.

---

# ‏32. Sampling Delay

‏אם אנחנו דוגמים כל `100ms`, event יכול להגיע רגע אחרי sample ולהמתין כמעט `100ms`.

‏לכן latency כולל גם:

```text
sampling_phase_delay
```

---

# ‏33. Whole-Market Scanner Latency

‏ב־4,000 symbols לא מספיק שהחישוב של symbol יחיד מהיר.

‏צריך למדוד:

```text
cycle_start
cycle_end
cycle_duration
oldest_symbol_age
newest_symbol_age
coverage_at_rank_time
```

---

# ‏34. Cross-Sectional Fairness

‏אם symbol ראשון מחושב `200ms` לפני symbol אחרון, ה־ranking משווה זמנים שונים.

‏זו יכולה להיות בעיית correctness, לא רק performance.

---

# ‏35. `As-Of` Ranking

‏צריך להגדיר:

```text
rank_as_of_time
```

‏וכל candidate צריך לעמוד בתנאי freshness סביב אותו זמן.

---

# ‏36. Fresh Coverage לפני Rank

```text
fresh_coverage_ratio = fresh_symbols / expected_symbols
```

‏אם coverage נמוך מדי, Rank #1 יכול להיות “הטוב ביותר מתוך מי שהספיק להתעדכן”.

‏זו הטיה מסוכנת.

---

# ‏37. Incremental Ranking

‏במקום recompute מלא של כל universe בכל tick, אפשר לעיתים:

```text
update changed symbol
update affected features
update rank structure incrementally
```

‏אבל המורכבות עולה.

‏נשתמש בזה רק אם profiling מוכיח צורך.

---

# ‏38. Two-Stage Scanner

‏ארכיטקטורה שמתאימה לנו:

```text
Fast whole-market pass
→ Top-N
→ deeper expensive analysis
→ execution check
```

‏כך לא משלמים latency של feature כבד עבור 4,000 symbols בכל event.

---

# ‏39. Fast Path מול Deep Path

‏`Fast Path` צריך להכיל רק מידע שנדרש כדי לא לפספס candidate.

‏`Deep Path` יכול לחשב:

- ‏Order Flow עמוק.
- ‏Book dynamics.
- ‏Capacity.
- ‏Adverse-selection context.
- ‏Broker validation.

---

# ‏40. Complexity Tax

‏כל feature חדש מוסיף לא רק research complexity אלא גם runtime cost.

‏לכן Feature Registry צריך לכלול:

```text
predictive_value
compute_cost
latency_cost
memory_cost
freshness_requirement
```

---

# ‏41. Latency-Aware Feature Selection

‏שני features עם predictive value דומה:

```text
Feature A: 0.3 ms
Feature B: 40 ms
```

‏ייתכן ש־A עדיף ב־live גם אם B מעט יותר מנבא offline.

---

# ‏42. Prediction Edge מול Serving Cost

‏נמדוד:

```text
Incremental Net Edge
minus
Incremental Latency Cost
```

‏ולא רק feature importance.

---

# ‏43. Serialization

‏Serialization יכולה להיות bottleneck לא צפוי.

‏במיוחד אם כל event הופך ל־JSON גדול.

‏ב־hot path נעדיף representations קומפקטיים ופשוטים.

---

# ‏44. JSON אינו “רע” אוטומטית

‏למערכת שלנו אין צורך לפסול JSON אידיאולוגית.

‏אם throughput/latency עומדים ביעד, KISS מנצח.

‏רק profiling מצדיק מעבר לפורמט מורכב יותר.

---

# ‏45. Allocation Pressure

‏ב־`.NET`, allocation מיותר בקצב גבוה יכול לייצר GC pressure.

‏דוגמאות:

- ‏יצירת אובייקטים לכל tick.
- ‏LINQ כבד ב־hot loops.
- ‏string formatting תכוף.
- ‏temporary collections.

---

# ‏46. GC Pauses

‏Garbage Collection אינו “בעיה תמידית”.

‏אבל אם P99 latency מראה pauses מחזוריים, צריך לבדוק:

```text
allocation rate
Gen0/Gen1/Gen2 collections
LOH activity
pause duration
```

---

# ‏47. Measure before Pooling

‏Object pooling יכול לעזור.

‏הוא גם יכול להוסיף:

- ‏Complexity.
- ‏Leaks.
- ‏Stale state bugs.
- ‏Contention.

‏לכן לא משתמשים בו רק כי “Low Latency”.

---

# ‏48. `Span<T>` ו־Memory Efficiency

‏ב־C# מודרני אפשר להשתמש בכלים כמו:

```text
Span<T>
ReadOnlySpan<T>
ArrayPool<T>
Memory<T>
```

‏כאשר profiling מצדיק זאת.

‏המטרה אינה קוד מתוחכם.

‏המטרה היא לצמצם allocation/copy במקומות חמים.

---

# ‏49. LINQ ב־Hot Path

‏LINQ מצוין לקוד ברור.

‏אבל בלולאות בתדירות גבוהה צריך למדוד אותו.

‏לא מחליפים אוטומטית כל LINQ.

‏מחליפים bottleneck מוכח.

---

# ‏50. Data Structures Matter

‏ל־ranking מהיר אפשר לשקול מבנים מתאימים במקום sort מלא בכל event.

‏לדוגמה רעיונית:

```text
heap
ordered set
partial selection
incremental rank index
```

‏אבל שוב — רק כאשר N וקצב האירועים מצדיקים זאת.

---

# ‏51. `O(N log N)` יכול להיות מספיק

‏עם כ־4,000 symbols, sort מלא עשוי להיות מהיר מספיק בתדירויות מסוימות.

‏אין סיבה לבנות מערכת מתוחכמת לפני benchmark.

---

# ‏52. Benchmark אמיתי

‏Benchmark צריך להשתמש ב־:

- ‏מספר symbols אמיתי.
- ‏Event rates ריאליסטיים.
- ‏Bursts.
- ‏Feature count אמיתי.
- ‏Logging מופעל בצורה production-like.
- ‏אותה runtime/configuration.

---

# ‏53. Microbenchmark אינו End-to-End Benchmark

‏Function שלוקחת `2µs` לא אומרת שהמערכת מגיבה ב־`2µs`.

‏צריך גם benchmark של pipeline שלם.

---

# ‏54. Warm-up

‏ב־managed runtime קיימים:

- ‏JIT compilation.
- ‏Cache warm-up.
- ‏Connection establishment.
- ‏DNS/TLS/session setup.

‏לכן first-run latency יכול להיות שונה מהמשך היום.

---

# ‏55. Pre-Warm

‏לפני session אפשר:

- ‏לפתוח connections.
- ‏לטעון config.
- ‏לטעון universe.
- ‏ליצור caches.
- ‏להפעיל critical code paths.
- ‏לוודא subscriptions.

‏בלי לבצע trades.

---

# ‏56. Cold Start הוא Failure Mode

‏Restart באמצע יום יכול להחזיר את המערכת למצב cold.

‏Recovery צריך לכלול readiness/warm-up gates.

---

# ‏57. Thread Pool Starvation

‏ב־`.NET` שימוש לא נכון ב־blocking work יכול לגרום Thread Pool starvation.

‏סימנים:

```text
queue growth
latency spikes
low CPU but slow progress
```

---

# ‏58. `async` אינו אוטומטית Faster

‏`async/await` מצוין ל־I/O concurrency.

‏אבל הוא לא הופך CPU work למהיר יותר.

‏צריך להשתמש בו לפי סוג העבודה.

---

# ‏59. Blocking I/O ב־Hot Path

‏אסור ש־decision path יחכה ל־:

- ‏Remote log server.
- ‏Slow database write.
- ‏Nonessential analytics.
- ‏UI update.

‏אלה צריכים להיות asynchronous/off-path כאשר בטוח לעשות זאת.

---

# ‏60. Critical Persistence Exception

‏יש events פיננסיים שאסור “לאבד בשקט”.

‏לכן צריך להבדיל בין:

```text
noncritical telemetry
critical order/fill journal
```

‏האחרון עשוי לדרוש durability חזקה יותר.

---

# ‏61. Bounded Queues

‏Queue לא bounded יכולה להפוך latency problem ל־memory problem.

‏לכן לכל async pipeline חשוב להבין:

```text
capacity
producer_rate
consumer_rate
overflow_policy
priority
```

---

# ‏62. Queue Age חשוב יותר מ־Queue Length לפעמים

‏Queue של `100` events יכולה להיות תקינה או גרועה.

‏אם oldest event בן `3ms` — אולי בסדר.

‏אם בן `2s` — ה־system stale.

---

# ‏63. Backpressure

‏כאשר input rate גדול מ־processing rate, המערכת צריכה policy מפורשת.

‏אפשרויות:

- ‏Coalescing.
- ‏Dropping noncritical intermediate states.
- ‏Priority queues.
- ‏Degrading expensive features.
- ‏Stopping new entries.

---

# ‏64. Never Drop Orders/Fills Silently

‏אפשר אולי לדלג על snapshot ישן.

‏אסור לדלג בשקט על:

```text
order ack
fill
cancel
position update
risk event
```

---

# ‏65. Coalescing Market Data

‏ל־state-based scanner לפעמים אין צורך לעבד כל intermediate quote אם חדש יותר כבר הגיע.

‏אבל זה תלוי ב־feature.

‏אם feature דורש path/order-flow events, coalescing יכול להרוס מידע.

---

# ‏66. Latest-State vs Event-History Features

‏צריך לסווג feature:

```text
state feature
path feature
flow feature
```

‏State feature עשוי לאפשר skip.

‏Flow feature בדרך כלל לא.

---

# ‏67. Priority by Economic Importance

‏בזמן עומס:

```text
Exit/Position Management
> Broker/Fills
> Risk
> Candidate Execution
> Scanner updates
> Diagnostics/UI
```

‏לא נותנים ל־UI לעכב Exit.

---

# ‏68. Single Writer

‏במקומות קריטיים single-writer architecture יכולה לצמצם locks ולשפר determinism.

‏אבל צריך לבדוק throughput.

---

# ‏69. Locks

‏Lock אינו רע בפני עצמו.

‏בעיה היא contention לא צפוי.

‏צריך למדוד:

```text
lock wait time
contention rate
critical section duration
```

---

# ‏70. Lock-Free אינו Free

‏מבנים lock-free יכולים להיות קשים יותר להוכחה ולתחזוקה.

‏אנחנו לא עוברים אליהם רק כדי להיראות HFT.

---

# ‏71. Concurrency Bugs יכולים להיות יקרים יותר מ־Latency

‏Race שמייצר duplicate order מסוכן בהרבה מחיסכון של `2ms`.

‏Correctness קודם.

---

# ‏72. False Sharing ו־CPU Cache

‏זה נושא אמיתי במערכות low latency.

‏אבל הוא נמצא בשכבה מתקדמת.

‏נוגעים בו רק אם profiler מוכיח contention/cache problem משמעותי.

---

# ‏73. CPU Affinity

‏Pinning threads ל־cores יכול להפחית jitter במערכות מסוימות.

‏למערכת שלנו זה `advanced optimization`, לא baseline.

---

# ‏74. Process Priority

‏שינוי OS priority יכול להשפיע.

‏אבל הוא יכול גם לפגוע ביציבות של המחשב.

‏לא משתמשים בו לפני measurement ו־controlled testing.

---

# ‏75. Dedicated Machine

‏ל־short-horizon system, מחשב שמריץ במקביל workloads כבדים יכול ליצור jitter.

‏לפני micro-optimizations, לפעמים isolation פשוט נותן שיפור גדול יותר.

---

# ‏76. Power Management

‏CPU power states ו־frequency scaling יכולים להשפיע על jitter.

‏זה practitioner detail אמיתי.

‏אבל שינויי OS/hardware צריכים להיבדק בזהירות ולא באופן עיוור.

---

# ‏77. Virtualization

‏VM/Cloud יכול להוסיף noisy-neighbor jitter.

‏מצד שני cloud קרוב גאוגרפית ל־provider/broker יכול להקטין network RTT.

‏צריך benchmark, לא אידיאולוגיה.

---

# ‏78. Geography

‏Network distance matters.

‏אם:

```text
user machine → provider region → broker region
```

‏עובר מרחק גדול, speed of light ו־routing מוסיפים latency שלא ניתן לפתור בקוד.

---

# ‏79. Cloud Region Placement

‏לפעמים מעבר מישראל לשרת בארה״ב קרוב לספקי השוק עשוי לחסוך הרבה יותר מאופטימיזציית קוד מקומית.

‏אבל צריך לבדוק:

- ‏Provider endpoint location.
- ‏Broker endpoint location.
- ‏Reliability.
- ‏Cost.
- ‏Operational complexity.

---

# ‏80. Network RTT

‏מדד בסיסי:

```text
round_trip_time
```

‏אבל application latency יכולה להיות גדולה יותר בגלל processing queues.

---

# ‏81. TCP

‏TCP מוסיף reliability/order semantics שימושיים.

‏אין צורך “להילחם” בו אוטומטית.

‏צריך להבין:

- ‏Connection reuse.
- ‏Nagle implications כאשר רלוונטי.
- ‏Packet loss.
- ‏Retransmits.
- ‏Keepalive.

---

# ‏82. WebSocket

‏Streaming WebSocket יכול להתאים היטב למערכת שלנו.

‏נמדוד:

```text
message arrival jitter
reconnect time
heartbeat delay
subscription restore time
```

---

# ‏83. HTTP Polling

‏Polling יכול להיות מספיק ל־research או signals איטיים.

‏ל־millisecond-to-seconds momentum הוא עלול להוסיף delay משמעותי.

‏החלטה אמפירית.

---

# ‏84. Reconnect Cost

‏לא מספיק למדוד normal latency.

‏צריך למדוד:

```text
time_to_detect_disconnect
time_to_reconnect
time_to_restore_subscriptions
time_to_rebuild_state
time_to_ready
```

---

# ‏85. Connection Alive != Data Fresh

‏Socket פתוח אינו הוכחה שהנתונים זורמים בזמן.

‏לכן freshness metric נפרד.

---

# ‏86. Heartbeat

‏Heartbeat צריך להוכיח לא רק process alive אלא גם work progress.

‏למשל:

```text
last_market_event_age
last_scanner_cycle_age
last_broker_message_age
```

---

# ‏87. Clock Domains

‏יכולים להיות לפחות:

```text
exchange clock
provider clock
server clock
broker clock
local machine clock
```

‏לא מחסרים timestamps משעונים שונים בלי להבין synchronization.

---

# ‏88. Wall Clock מול Monotonic Clock

‏Durations מקומיים צריכים בדרך כלל monotonic clock.

‏Wall clock יכול להשתנות בגלל synchronization adjustments.

---

# ‏89. NTP

‏NTP יכול להספיק להרבה מערכות millisecond-to-seconds.

‏אבל צריך למדוד offset/jitter בפועל.

---

# ‏90. PTP

‏`PTP` יכול לתת synchronization מדויק יותר בתשתיות מתאימות.

‏זה נושא שצריך להכיר.

‏אין סיבה להכניס אותו ל־MVP אם NTP והדרישות שלנו מספיקים.

---

# ‏91. Negative Latency

‏אם telemetry מראה:

```text
receive_time < event_time
```

‏זה לא אומר שעברנו את מהירות האור.

‏זה בדרך כלל clock issue או timestamp semantics שונים.

---

# ‏92. Timestamp Semantics

‏צריך לדעת מה provider timestamp אומר:

- ‏Exchange event.
- ‏SIP event.
- ‏Provider ingest.
- ‏Provider publish.
- ‏Message creation.

‏בלי זה latency calculation יכול להיות חסר משמעות.

---

# ‏93. Timestamp Precision != Timestamp Accuracy

‏Timestamp עם nanoseconds לא אומר שהזמן מדויק ל־nanosecond.

‏זו subtlety מקצועית חשובה.

---

# ‏94. Queueing Theory בסיסית

‏כאשר utilization מתקרב ל־100%, queue latency יכולה לעלות בצורה לא לינארית.

‏לכן capacity planning צריך headroom.

---

# ‏95. Throughput vs Latency

‏מערכת יכולה לעבד מיליון events בשנייה בממוצע ועדיין לתת latency גרוע ל־individual event בזמן burst.

‏שני המדדים נפרדים.

---

# ‏96. Batching

‏Batching משפר throughput לעיתים קרובות.

‏אבל מוסיף waiting latency.

‏Trade-off:

```text
larger batch
→ higher throughput
→ potentially higher latency
```

---

# ‏97. Micro-Batching

‏למערכת שלנו micro-batching קטן יכול להיות compromise טוב במקומות מסוימים.

‏צריך לבדוק sensitivity.

---

# ‏98. Batch by Time or Count

‏אפשר flush כאשר:

```text
count >= N
OR
age >= T
```

‏כך latency מקבלת upper bound.

---

# ‏99. Cache Design

‏Caching יכול לחסוך חישובים.

‏אבל cache stale יכול להיות גרוע ממערכת איטית.

‏לכן כל cache צריך freshness/version semantics.

---

# ‏100. Precompute

‏דברים שלא תלויים ב־tick הנוכחי אפשר לחשב מראש:

- ‏Static instrument metadata.
- ‏Risk limits.
- ‏Tick sizes.
- ‏Session configuration.
- ‏Symbol mappings.

---

# ‏101. Avoid Repeated Broker Metadata Calls

‏אסור שה־scanner של 4,000 symbols יבקש broker metadata מחדש בכל cycle.

‏זה latency + pacing problem.

---

# ‏102. Broker רק ל־Top Candidates

‏הארכיטקטורה שלנו נשארת:

```text
MarketDataProvider scans broad market
→ Strategy ranks
→ Top-N
→ Broker validation/execution
```

‏לא משתמשים ב־broker execution API כ־whole-market scanner.

---

# ‏103. Rate Limits as Latency

‏כאשר חורגים מ־rate limits, requests יכולים:

- ‏להידחות.
- ‏להמתין.
- ‏להיות throttled.

‏זו latency תפעולית לכל דבר.

---

# ‏104. Request Scheduler

‏Broker/API requests צריכים priority.

‏למשל:

```text
EXIT
CANCEL
RECONCILIATION
ENTRY
DIAGNOSTICS
```

---

# ‏105. No Entry behind Diagnostics

‏אסור שקריאת metadata לא חשובה תעכב Exit או Cancel.

---

# ‏106. Logging Latency

‏Structured logging יכול להיות יקר אם:

- ‏כותבים synchronous disk/network.
- ‏serializing huge payloads.
- ‏logging every 4,000 symbols every tick.

---

# ‏107. Hot-Path Logging Policy

‏ב־hot path:

```text
small structured event
stable IDs
critical timestamps
reason codes
```

‏Enrichment יכול לקרות asynchronously.

---

# ‏108. Trace Sampling

‏אפשר sample traces של candidates רגילים.

‏אבל לא sample away:

- ‏Real trades.
- ‏Incidents.
- ‏Unknown order states.
- ‏Risk breaches.

---

# ‏109. UI אינו Hot Path

‏Dashboard refresh לא צריך לשלוט בקצב Strategy.

‏ה־UI צורך projections/asynchronous snapshots.

---

# ‏110. Database Writes

‏אל תכתוב transaction synchronous לכל market tick אם אין לכך צורך.

‏הפרד:

```text
market-data persistence
trade journal
telemetry
research store
```

---

# ‏111. WAL / Durable Journal

‏Order/fill state עשוי להצדיק journal durable.

‏אבל data pipeline high-volume יכול להשתמש במדיניות אחרת.

---

# ‏112. Storage Backpressure

‏אם storage איטי, אסור שהוא יפיל את trading loop בצורה לא נשלטת.

‏צריך:

- ‏buffers bounded.
- ‏alerts.
- ‏degradation policy.
- ‏critical/noncritical separation.

---

# ‏113. Allocation-Free Dream

‏מערכת ללא allocations לחלוטין היא יעד מורכב.

‏לנו אין צורך להתחיל משם.

‏נוריד allocations במקומות שבהם הם מוכחים כבעיה.

---

# ‏114. Copy Cost

‏העתקת arrays/objects גדולים אלפי פעמים יכולה לעלות latency.

‏אבל shared mutable state יכול לייצר bugs.

‏האיזון הוא correctness + profiling.

---

# ‏115. Immutable Snapshot Trade-off

‏Immutable snapshots פשוטים ובטוחים יותר.

‏המחיר יכול להיות allocation/copy.

‏אפשר להשתמש ב־structural sharing או compact state כאשר נדרש.

---

# ‏116. Data-Oriented Layout

‏כאשר profiler מצדיק, arrays של primitive values יכולים להיות יעילים יותר מאלפי object graphs.

‏זה advanced optimization שימושי לסורק רחב.

---

# ‏117. False Precision

‏אין טעם לדווח:

```text
latency = 12.483917 ms
```

‏אם timestamp source מדויק רק בערך ל־`10ms`.

---

# ‏118. Measure Measurement Overhead

‏Instrumentation עצמו עולה זמן.

‏צריך לבדוק שהמדידה לא משנה משמעותית את מה שאנחנו מודדים.

---

# ‏119. Latency Histogram

‏Histogram עדיף על average בלבד.

‏Buckets צריכים להתאים ל־horizon שלנו.

‏למשל:

```text
<10ms
10-25ms
25-50ms
50-100ms
100-250ms
250-500ms
0.5-1s
1-2s
>2s
```

---

# ‏120. Latency by Stage

‏Dashboard צריך להציג לפחות:

```text
market_to_receive
receive_to_feature
feature_to_rank
rank_to_decision
decision_to_submit
submit_to_ack
submit_to_fill
exit_to_flat
```

---

# ‏121. Latency by Regime

‏נפלח לפי:

- ‏Open.
- ‏Midday.
- ‏Close.
- ‏High volatility.
- ‏High activity.
- ‏Fast market.
- ‏Provider degraded.

---

# ‏122. Latency by Symbol Liquidity

‏ייתכן שה־broker execution latency/fill time שונה במניות:

- ‏Highly liquid.
- ‏Thin.
- ‏Wide spread.
- ‏High price.
- ‏High volatility.

---

# ‏123. Latency by Outcome

‏שאלה חשובה:

> ‏האם trades גרועים הגיעו מ־latency גבוה יותר?

‏נשווה:

```text
latency vs markout
latency vs MFE
latency vs MAE
latency vs net PnL
```

---

# ‏124. Selection Regret due to Latency

‏Rank #1 ב־decision time יכול כבר לא להיות Rank #1 ב־submit time.

‏נמדוד:

```text
rank_at_signal
rank_at_decision
rank_at_submit
rank_at_fill
```

‏כאשר ניתן.

---

# ‏125. Candidate Churn

‏אם Top1 משתנה כל `50ms`, architecture של `500ms` decision loop כנראה לא מתאימה.

‏זו דרך ללמוד את latency requirement מתוך data.

---

# ‏126. Stability Window

‏לפעמים candidate יציב במשך `1–3s` למרות quote noise במילישניות.

‏במקרה כזה אין צורך להתחרות על microseconds.

---

# ‏127. Hysteresis יכולה לחסוך Churn

‏לא תמיד נכון להחליף candidate על כל שינוי Rank זעיר.

‏Hysteresis יכולה:

- ‏להפחית order churn.
- ‏להפחית cancel/replace.
- ‏לשמור queue.
- ‏להקטין broker traffic.

---

# ‏128. Latency vs Stability Trade-off

‏תגובה מיידית לכל noise אינה תמיד יתרון.

‏לפעמים עיכוב קטן לצורך confirmation משפר Net EV.

‏זה ניסוי מחקרי.

---

# ‏129. `Debounce` ו־`Confirmation Window`

‏אפשר לבדוק:

```text
0 ms confirmation
25 ms
50 ms
100 ms
250 ms
```

‏ולמדוד trade-off בין false positives לבין missed move.

---

# ‏130. Latency Is Part of Strategy

‏אם Strategy פותחה עם `500ms` delay, היא Strategy שונה מאותה נוסחה עם `0ms` delay.

‏לכן latency assumptions הם חלק מ־strategy version.

---

# ‏131. Version Latency Assumptions

‏Run manifest צריך לכלול:

```text
provider latency model
processing latency model
broker latency model
fill latency model
queue model
```

---

# ‏132. Replay with Real Latency Trace

‏דרך מתקדמת:

‏לוקחים latency traces מ־live/shadow ומזריקים אותם ל־Replay.

‏כך simulation מקבלת distribution אמיתית יותר.

---

# ‏133. Latency Bootstrap

‏אפשר sample latency היסטורי לפי regime במקום constant delay.

‏זה עדיף כאשר יש מספיק data.

---

# ‏134. Counterfactual Latency

‏נריץ:

```text
actual latency
50% faster
2x slower
fixed 50ms
fixed 100ms
stress tail
```

‏ונראה כמה Edge רגיש.

---

# ‏135. `Latency Elasticity`

‏מדד רעיוני:

> ‏כמה Net EV משתנה כאשר latency משתנה באחוז מסוים.

‏Strategy עם elasticity גבוהה היא fragile יותר.

---

# ‏136. Latency Cliff

‏לפעמים אין decay חלק.

‏לדוגמה:

```text
0-100 ms: fine
100-180 ms: moderate
>180 ms: edge collapses
```

‏זה `Latency Cliff`.

---

# ‏137. Headroom against the Cliff

‏Production target צריך להיות רחוק מספיק מה־cliff גם ב־P99, לא רק P50.

---

# ‏138. Tail Stress Test

‏נבדוק:

```text
P99 x 2
network stall
GC pause
provider burst
broker delay
```

‏ונראה מה המערכת עושה.

---

# ‏139. Latency Breach Action

‏אם latency גבוה מה־threshold:

```text
BLOCK_NEW_ENTRIES
```

‏עשוי להיות נכון יותר מלהמשיך לסחור עם signal ישן.

---

# ‏140. Existing Positions Still Need Management

‏Latency gate על entries לא אומר שמפסיקים exits.

‏כמו שלמדנו ב־Safety:

```text
risk reducing actions > risk increasing actions
```

---

# ‏141. Dynamic Latency Gate

‏Threshold יכול להיות מותאם ל־signal:

```text
max_latency = fraction_of_signal_half_life
```

‏במקום מספר global אחד.

---

# ‏142. Confidence-Aware Latency

‏Signal חזק יותר אולי יכול לסבול latency מעט גדול יותר.

‏אבל זו hypothesis שצריך לבדוק, לא כלל.

---

# ‏143. Execution Urgency and Latency

‏כאשר signal decay מהיר:

- ‏Passive waiting יקר יותר.
- ‏Aggressive entry יכולה להיות מוצדקת יותר.

‏אבל spread/adverse selection עולים.

---

# ‏144. Slow Signal ≠ Free Delay

‏גם signal שחי `30s` יכול להיפגע מ־latency אם:

- ‏Spread מתרחב.
- ‏Queue משתנה.
- ‏Rank #1 מתחלף.
- ‏Capacity נעלמת.

---

# ‏145. Fast Signal ≠ Must Trade

‏אם signal חי `50ms` ואיננו יכולים להיכנס בזמן בצורה ריאלית:

```text
NO TRADE
```

‏הוא תשובה נכונה.

---

# ‏146. Do Not Backtest Impossible Speed

‏Backtest שמניח:

```text
observe tick
→ decide instantly
→ fill at same tick
```

‏עלול ליצור Operational Alpha Leakage.

---

# ‏147. Minimum Reaction Delay

‏Simulation צריכה לכלול לפחות:

```text
observation delay
compute delay
submit delay
execution delay
```

---

# ‏148. Same-Timestamp Events

‏כאשר resolution נמוכה, כמה events יכולים לקבל אותו timestamp.

‏אסור להניח שהסדר ביניהם ידוע אם dataset אינו מספק sequence.

---

# ‏149. Latency and Data Resolution

‏אין טעם לדמות `5ms` latency על data ברזולוציית `1s` ולהאמין שקיבלנו realism של milliseconds.

---

# ‏150. Data Fidelity Ceiling

‏רמת ה־latency שניתן לחקור מוגבלת על ידי fidelity של data.

‏אם רוצים ללמוד 50ms signals, צריך data שמאפשרים לראות אותם.

---

# ‏151. Snapshot Data Limitation

‏Snapshots כל `1s` לא יכולים לשחזר queue/order-flow dynamics ב־`100ms`.

‏זו מגבלת evidence.

---

# ‏152. Provider Timestamp Resolution

‏נבדוק:

```text
timestamp precision
timestamp semantics
sequence IDs
received-time availability
```

‏לפני research של millisecond signals.

---

# ‏153. Milliseconds vs Microseconds

‏זה הגבול התכנוני שלנו:

```text
We care about milliseconds when they materially affect a signal that lives milliseconds-to-seconds.
We do not optimize for microsecond races as a business objective.
```

---

# ‏154. מה כן נלמד מ־HFT

‏לא ננסה להתחרות בהם, אבל נלמד מהם עקרונות:

- ‏Measure everything.
- ‏Tail latency matters.
- ‏Clock discipline.
- ‏Queue awareness.
- ‏Avoid unnecessary copies.
- ‏Hot-path isolation.
- ‏Deterministic state machines.
- ‏Backpressure control.
- ‏Data provenance.

---

# ‏155. מה לא נעתיק אוטומטית מ־HFT

‏לא נכניס סתם:

- ‏FPGA.
- ‏Kernel bypass.
- ‏Custom network stacks.
- ‏Co-location.
- ‏Nanosecond timestamp obsession.
- ‏Lock-free everything.
- ‏Manual memory management everywhere.

---

# ‏156. Engineering ROI

‏כל אופטימיזציה עוברת מבחן:

```text
Expected Economic Benefit
-------------------------
Engineering + Operational Complexity
```

---

# ‏157. Optimization Ladder

‏סדר בריא:

```text
1. Measure
2. Fix correctness
3. Remove obvious blocking
4. Reduce avoidable work
5. Improve algorithms/data structures
6. Reduce allocations/copies
7. Improve deployment/network placement
8. Advanced runtime/OS tuning
9. Exotic low-latency techniques only if proven necessary
```

---

# ‏158. Biggest Wins First

‏חיסכון של `100ms` network path חשוב יותר מחיסכון של `2µs` loop.

‏חיסכון של `300ms` polling delay חשוב יותר מ־custom allocator.

---

# ‏159. Profile End-to-End First

‏לפני profiler function-level, נבנה waterfall של pipeline.

‏רק אחר כך יורדים פנימה.

---

# ‏160. CPU Profiling

‏נבדוק:

- ‏Hot methods.
- ‏CPU time.
- ‏Allocations.
- ‏Contention.
- ‏GC.
- ‏Threading.

---

# ‏161. Allocation Profiling

‏Allocation rate חשוב יותר מספירת allocations בלבד.

‏נבדוק peak/burst behavior.

---

# ‏162. Network Profiling

‏נמדוד:

```text
DNS
connect
TLS
RTT
packet loss
reconnect
message arrival gaps
```

---

# ‏163. Broker Profiling

‏נמדוד בנפרד:

```text
send_to_ack
ack_to_first_fill
send_to_first_fill
cancel_to_confirm
exit_to_flat
```

---

# ‏164. Provider Profiling

‏נבדוק:

```text
message rate
burst rate
gap rate
receive jitter
freshness distribution
coverage lag
```

---

# ‏165. Scanner Profiling

‏נמדוד:

```text
feature time
ranking time
cycle time
candidate validation time
Top-N deep-analysis time
```

---

# ‏166. Risk Engine Profiling

‏Risk checks צריכים להיות מהירים אך לא מדולגים.

‏`Fast` אינו תירוץ לעקוף Risk.

---

# ‏167. Precomputed Risk State

‏אפשר לשמור state עדכני:

```text
current exposure
pending exposure
remaining limits
positions
working orders
```

‏כדי שהחלטת Risk לא תבצע queries איטיים בכל Entry.

---

# ‏168. Broker Truth Reconciliation אינו Hot Query

‏לא צריך לבקש full account snapshot לפני כל Order.

‏שומרים local reconciled state ומעדכנים events.

‏אבל אם state stale/unknown — חוסמים entry.

---

# ‏169. Cache Invalidation in Trading

‏Cache מהיר עם Position שגוי מסוכן.

‏לכן cache חייב מקור אמת ו־reconciliation semantics.

---

# ‏170. Fast Path Invariants

‏גם hot path צריך לשמור:

```text
no duplicate order intent
no entry on stale data
no entry when risk unknown
no entry when broker not ready
no exit quantity above position
```

---

# ‏171. Safety Cost is Not Waste

‏אם Risk check מוסיף `1ms` ומונע duplicate exposure, הוא עשוי להיות שווה הרבה יותר מה־millisecond.

---

# ‏172. Pre-Trade Validation Budget

‏נגדיר אילו checks חייבים לפני submit ואילו יכולים להיות precomputed.

---

# ‏173. Signal Snapshot

‏Order Intent צריך לשמור את ה־decision snapshot:

```text
signal_time
signal_age
rank
score
market_state_version
risk_state_version
execution_context
```

---

# ‏174. Recheck before Submit

‏כאשר latency משמעותי, כדאי לבדוק לפני submit:

- ‏Signal still valid?
- ‏Symbol still tradable?
- ‏Spread still acceptable?
- ‏Candidate still competitive?
- ‏Risk still valid?

---

# ‏175. Recheck Cost

‏Recheck עצמו עולה latency.

‏צריך שיהיה incremental ומהיר, לא recompute מלא אם אין צורך.

---

# ‏176. `Decision TTL`

‏Order Intent יכול לקבל expiration:

```text
valid_until
```

‏Execution Engine מסרב לשלוח Intent שפג.

---

# ‏177. Stale Queue Message

‏גם אם Intent היה תקין ביצירה, הוא יכול להזדקן בתור פנימי.

‏לכן בודקים age בזמן dequeue.

---

# ‏178. Priority Queue by Intent Type

```text
EXIT
CANCEL
RISK_REDUCING
ENTRY
LOW_PRIORITY
```

---

# ‏179. Latency and Cancel

‏Cancel command אינו instantaneous.

‏בזמן ה־cancel latency עדיין אפשר לקבל Fill.

---

# ‏180. Cancel-to-Fill Race

‏ככל latency גבוהה יותר, חלון race גדל.

‏State machine חייב לתמוך בזה.

---

# ‏181. Repricing Latency

‏Cancel/replace תכוף יכול לגרום לנו תמיד לרדוף אחרי המחיר.

‏צריך למדוד:

```text
reprice decision
→ cancel
→ confirmation/replace
→ new queue
```

---

# ‏182. Queue Reset Cost

‏חיסכון ב־price freshness יכול לעלות loss of queue priority.

‏Latency optimization לבדה אינה מספיק.

---

# ‏183. Latency and Adverse Selection

‏איחור יכול לגרום לנו:

- ‏להיכנס אחרי move.
- ‏להיות filled passive בדיוק כשהשוק נשבר נגדנו.
- ‏לצאת אחרי giveback.

‏לכן latency ו־adverse selection קשורים.

---

# ‏184. `Markout by Signal Age`

‏נפלח:

```text
0-50ms
50-100ms
100-250ms
250-500ms
500ms-1s
>1s
```

‏ונראה אם fills מאוחרים toxic יותר.

---

# ‏185. `PnL by Decision-to-Fill`

‏אותו רעיון:

‏האם profitability יורדת ככל `decision_to_fill` עולה?

---

# ‏186. Exit Giveback by Latency

‏נבדוק:

```text
exit_signal_to_flat
vs
giveback_from_mfe
```

‏זה חשוב במיוחד למטרה “לקחת מהר לפני הירידה”.

---

# ‏187. Time-to-Profit vs Latency

‏אם רוב העסקאות הטובות מגיעות לרווח בתוך `500ms`, latency של `400ms` בכניסה בעייתית.

---

# ‏188. Opportunity Decay Curve

‏לכל candidate episode:

```text
expected_net_edge(age)
```

‏זה הבסיס ל־latency-aware decision.

---

# ‏189. Latency-Adjusted Score

‏אפשר בעתיד לבדוק feature כמו:

```text
adjusted_edge = predicted_edge * decay_factor(signal_age)
```

‏אבל רק אחרי validation.

---

# ‏190. Candidate Replacement

‏אם בזמן שאנחנו מכינים Order candidate אחר הפך עדיף משמעותית, צריך policy.

‏אבל החלפות תכופות יכולות ליצור churn.

---

# ‏191. Selection Stability

‏נמדוד:

```text
Top1 persistence
TopN persistence
rank gap
rank velocity
```

‏כדי להבין כמה מהר צריך להגיב.

---

# ‏192. Latency Threshold by Rank Gap

‏Hypothesis אפשרית:

‏Candidate עם separation גדול עשוי להישאר valid יותר זמן.

‏לא מניחים — בודקים.

---

# ‏193. Local vs Remote Components

‏כל network hop מוסיף:

- ‏Latency.
- ‏Failure modes.
- ‏Serialization.
- ‏Operational complexity.

‏ב־hot path KISS לעיתים קרובות מנצח microservices.

---

# ‏194. Microservices Tax

‏Microservices טובים לבידוד וסקייל.

‏אבל לרובוט אישי יחיד הם יכולים להוסיף overhead מיותר.

‏נעדיף modular monolith/process separation רק כשיש הצדקה.

---

# ‏195. In-Process Strategy Core

‏Baseline טוב:

```text
Market ingest
→ canonical state
→ features
→ ranking
→ decision
→ risk
→ order intent
```

‏בתהליך אחד או במספר קטן של processes.

---

# ‏196. Broker Adapter Separate but Nearby

‏אפשר לשמור separation ארכיטקטוני בלי remote RPC יקר.

‏Interface boundary לא חייב להיות network boundary.

---

# ‏197. IPC

‏אם מפרידים processes, יש trade-offs בין:

- ‏TCP localhost.
- ‏Unix/domain equivalents.
- ‏Named pipes.
- ‏Shared memory.

‏לנו baseline פשוט עדיף עד measurement.

---

# ‏198. WebSocket localhost

‏ל־POC/מערכת אישית, local WebSocket יכול להיות מספיק מהיר ונוח.

‏לא מחליפים אותו רק כי יש טכנולוגיה “מהירה יותר”.

---

# ‏199. Latency Budget includes Browser if Browser is in Path

‏אם חלק מהמערכת רץ באתר/browser:

- ‏DOM updates.
- ‏JavaScript event loop.
- ‏tab throttling.
- ‏browser scheduling.

‏יכולים להוסיף jitter.

---

# ‏200. Browser is not Deterministic Runtime

‏ל־research/collector הוא יכול להיות מצוין.

‏ל־execution path millisecond-sensitive יש לבדוק האם הוא מספיק יציב.

---

# ‏201. JavaScript Event Loop

‏Long task יכול לעכב callback.

‏לכן נמדוד event-loop lag אם browser נמצא ב־critical path.

---

# ‏202. Background Tab Throttling

‏Browsers יכולים לשנות scheduling של tabs ברקע.

‏זה failure mode שצריך להכיר.

---

# ‏203. Native/Local Service Advantage

‏Local service ב־`.NET` יכול לתת:

- ‏Lifecycle נשלט יותר.
- ‏Timers יציבים יותר.
- ‏Better observability.
- ‏Control over concurrency.

‏אבל עדיין תלוי ב־OS/network.

---

# ‏204. Timer Accuracy

‏`Task.Delay(1)` אינו הבטחה ל־1ms exact.

‏Schedulers וטיימרים אינם real-time guarantees.

---

# ‏205. Busy Waiting

‏Busy-wait יכול להקטין latency במערכות מסוימות.

‏אבל הוא שורף CPU ומוסיף complexity.

‏אצלנו אינו baseline.

---

# ‏206. Real-Time OS

‏מערכת הפעלה real-time היא נושא מקצועי אמיתי.

‏אבל אין צורך בו אוטומטי למסחר של milliseconds-to-seconds.

---

# ‏207. Linux vs Windows

‏שניהם יכולים להריץ מערכת מהירה מספיק ליעד שלנו.

‏הבחירה תיעשה לפי ecosystem, broker support, operational simplicity ו־benchmarks.

---

# ‏208. Runtime Updates

‏שינוי version של runtime יכול לשנות performance.

‏לכן production benchmark צריך להיות versioned.

---

# ‏209. Debug vs Release

‏Benchmarks חייבים production-like build/config.

‏Debug timings אינם evidence מספיק.

---

# ‏210. Logging Build Differences

‏Feature flags ו־diagnostic logging יכולים לשנות latency.

‏Benchmark config צריך לשקף live.

---

# ‏211. Synthetic Benchmark אינו Market Replay

‏שניהם נחוצים:

```text
microbenchmark
load benchmark
historical replay
live shadow measurement
```

---

# ‏212. Burst Test

‏נזרים burst גדול מהרגיל ונבדוק:

```text
queue growth
P99 latency
fresh coverage
GC
CPU
memory
recovery time
```

---

# ‏213. Soak Test

‏מערכת יכולה להיות מהירה 10 דקות ולהידרדר אחרי שעות בגלל:

- ‏Memory growth.
- ‏Fragmentation.
- ‏Log buildup.
- ‏Resource leaks.

---

# ‏214. Performance Regression Tests

‏נשמור baselines ל־:

```text
scanner cycle
feature compute
rank compute
order intent creation
serialization
```

‏ונזהה regressions משמעותיים.

---

# ‏215. Do Not Make CI Flaky with Tight Timing

‏CI shared runners אינם real-time benchmark environment.

‏Performance tests שם צריכים tolerances רחבים או dedicated environment.

---

# ‏216. Latency Acceptance Test

‏Acceptance test טוב בודק behavior תחת delay, לא רק מספר זמן מדויק.

‏למשל:

```text
when signal is older than TTL
then no entry order is emitted
```

---

# ‏217. Fault Injection: Slow Feature Engine

‏נוסיף deliberate delay ונראה:

- ‏Does queue grow?
- ‏Does stale candidate get rejected?
- ‏Does system degrade safely?

---

# ‏218. Fault Injection: Slow Broker

‏נבדוק:

- ‏Unknown order effect.
- ‏Duplicate-submit prevention.
- ‏Entry blocking.
- ‏Exit priority.

---

# ‏219. Fault Injection: Slow Storage

‏נבדוק שה־telemetry אינה חוסמת hot path בצורה מסוכנת.

---

# ‏220. Fault Injection: GC/CPU Stall

‏אפשר לדמות pauses ולבדוק stale-signal defenses.

---

# ‏221. Recovery after Latency Spike

‏לא מספיק שה־latency חזרה לנורמה.

‏צריך לבדוק:

- ‏Queues drained?
- ‏Old intents removed?
- ‏Market state fresh?
- ‏Positions reconciled?
- ‏Scanner warm?

---

# ‏222. Latency Circuit Breaker

‏אפשר להפעיל safety כאשר:

```text
P99 latency too high
OR
queue age too high
OR
fresh coverage too low
```

---

# ‏223. Hysteresis on Recovery

‏לא חוזרים מיד ל־entries אחרי sample טוב יחיד.

‏צריך stable recovery window.

---

# ‏224. Latency SLI

‏SLIs אפשריים:

```text
market_to_decision_p95
market_to_decision_p99
decision_to_submit_p95
signal_age_at_submit_p95
signal_age_at_fill_p95
exit_to_flat_p95
queue_age_p99
```

---

# ‏225. Latency SLO

‏SLO לא נקבע כי “100ms נשמע טוב”.

‏הוא נגזר מ־:

```text
signal decay
execution feasibility
observed production distribution
safety margin
```

---

# ‏226. Economic SLO

‏אפשר להגדיר גם:

> ‏X% מה־entries נשלחים כאשר signal age קטן מ־Y% מה־estimated signal half-life.

‏זה מחבר performance לכלכלה.

---

# ‏227. Latency Budget Breach ≠ Trade Loss

‏Breach הוא operational warning.

‏לא כל breach מפסיד.

‏אבל אם הוא correlates עם net deterioration, הוא הופך economic signal.

---

# ‏228. Latency RCA

‏לכל incident:

```text
when did degradation start?
which stage slowed first?
what market regime?
what queue grew first?
what trades were affected?
what was first divergence from baseline?
```

---

# ‏229. First Divergence

‏במקום לחפש “למה הכל איטי”, נשאל:

> ‏מה היה timestamp הראשון שבו pipeline deviate מה־baseline?

‏זה מקצר RCA.

---

# ‏230. Latency Incident Packet

‏נשמור:

- ‏Timeline.
- ‏Stage histograms.
- ‏CPU/GC.
- ‏Queue depths/ages.
- ‏Provider freshness.
- ‏Broker RTT.
- ‏Top candidates.
- ‏Orders/fills.
- ‏Versions/config.

---

# ‏231. Latency by Deployment Version

‏אחרי deployment חדש נשווה:

```text
old version
vs
new version
```

‏באותם regimes ככל האפשר.

---

# ‏232. Champion/Challenger for Architecture

‏אפשר להריץ shadow pipeline חדש ולמדוד latency ו־decision parity בלי לסכן execution.

---

# ‏233. Faster but Different Decisions

‏Optimization שמשנה event ordering יכולה לשנות החלטות.

‏לכן performance improvement חייב לעבור correctness diff.

---

# ‏234. Deterministic Replay after Optimization

‏אותם inputs צריכים להפיק אותה semantics, אלא אם השינוי מכוון.

---

# ‏235. Performance Optimization Can Create Leakage

‏Precompute שמשתמש בטעות בנתון עתידי יכול להיות מהיר ומזויף.

‏Correctness קודם.

---

# ‏236. Precompute Point-in-Time Correctly

‏כל cache/aggregate צריך version/as-of semantics.

---

# ‏237. Latency and Feature Windows

‏Window של `100ms` דורש ingestion/timing הרבה יותר מדויק מ־window של `10s`.

‏לא משתמשים ב־fine-grained feature כאשר data path לא תומך בו.

---

# ‏238. Millisecond Features Need Millisecond Evidence

‏אם provider/data resolution אינם מתאימים, נעדיף feature של שניות ולא נעמיד פנים.

---

# ‏239. Multi-Horizon Architecture

‏המערכת יכולה להחזיק במקביל:

```text
100ms-ish context
500ms context
1s
2s
5s
10s
30s
60s
```

‏לפי fidelity שזמין.

---

# ‏240. Fast Horizon as Optional Layer

‏לא כל provider חייב לתמוך ב־100ms features.

‏Capability-aware Strategy יכולה להשבית horizons שאין להם evidence טוב.

---

# ‏241. Latency Confidence

‏נוכל לשמור:

```text
latency_confidence
```

‏אם timestamp provenance חלש או clock skew גבוה, לא נותנים למודל precision מזויפת.

---

# ‏242. Time Uncertainty

‏במקום timestamp יחיד, לפעמים נכון לחשוב על uncertainty interval.

‏זה מתקדם, אבל מקצועי.

---

# ‏243. Provider-to-Broker Asymmetry

‏ייתכן שה־market-data provider מהיר מאוד אבל broker איטי יותר.

‏ה־bottleneck האמיתי הוא המסלול כולו.

---

# ‏244. Faster Data Can Increase False Urgency

‏Feed מהיר יותר יכול לחשוף noise שלא היה נראה קודם.

‏Signal צריך להיבדק מחדש ולא רק “לקבל data מהר יותר”.

---

# ‏245. Latency Edge vs Information Edge

‏שני דברים שונים:

```text
Information Edge
Latency Edge
```

‏אם אין information edge, מהירות לבדה לא יוצרת בהכרח רווח.

---

# ‏246. Latency as Edge Preservation

‏למערכת שלנו, התפקיד העיקרי של latency הוא:

> ‏לשמור על Edge שכבר זיהינו, לפני שהוא נרקב.

‏זו נקודת המבט הנכונה.

---

# ‏247. Do Not Confuse Reaction with Prediction

‏מערכת מהירה יכולה להגיב מהר למה שכבר קרה.

‏אבל אם אין predictive content, היא רק רודפת אחרי המחיר מהר יותר.

---

# ‏248. Momentum Chase Risk

‏במומנטום קצר, latency גבוהה יכולה לגרום:

```text
observe move
→ enter late
→ become liquidity for earlier traders exiting
```

‏זו סכנת `late chase`.

---

# ‏249. Entry Delay Surface

‏נמדוד outcome כפונקציה של:

```text
signal age
rank
spread
flow
book imbalance
latency
```

‏ולא latency לבד.

---

# ‏250. Exit Delay Surface

‏אותו דבר ליציאה:

```text
exit signal strength
current PnL
MFE giveback
liquidity
latency
```

---

# ‏251. Fast Profit Goal Requires Fast Exit Evidence

‏אם המטרה היא רווח קטן ומהיר, מחקר חייב לענות:

```text
How often does a small favorable move appear?
How quickly?
How long does it persist?
How much is lost between exit decision and flat?
```

---

# ‏252. `Time-to-Target` Distribution

‏לא רק average.

‏נרצה quantiles והתפלגות מלאה.

---

# ‏253. Giveback after Target

‏נמדוד:

> ‏אחרי שהמחיר הגיע לרווח קטן, כמה פעמים וכמה מהר הוא מחזיר אותו?

‏זה מחבר latency ישירות ל־Exit design.

---

# ‏254. Exit Trigger Latency

‏אם exit signal מחושב כל `1s`, אין טעם לדבר על exit engine של `5ms` בלבד.

‏ה־slowest relevant stage קובע.

---

# ‏255. Bottleneck Principle

```text
End-to-end latency is dominated by the slowest meaningful bottleneck,
not the fastest component.
```

---

# ‏256. Optimize the Right Boundary

‏אם provider מוסיף `300ms`, אופטימיזציית feature מ־`8ms` ל־`4ms` כמעט לא תשנה את העסקה.

---

# ‏257. Provider Choice Can Be a Latency Decision

‏בחירת MarketDataProvider היא גם החלטת latency/freshness, לא רק price/coverage.

---

# ‏258. Broker Choice Can Be a Latency Decision

‏ExecutionBroker משפיע על:

- ‏Ack latency.
- ‏Routing.
- ‏Fill quality.
- ‏Cancel behavior.
- ‏Recovery.

‏אבל לא נבחר ברוקר רק לפי speed.

---

# ‏259. Fast but Unsafe Broker Path is Not Better

‏Reliability, reconciliation ו־order semantics חשובים לא פחות.

---

# ‏260. Latency and Cost

‏לפעמים execution מהיר יותר דורש aggression גדולה יותר ולכן cost גבוה יותר.

‏היעד:

```text
maximize net edge retained
```

‏לא minimize milliseconds בכל מחיר.

---

# ‏261. Latency and Market Impact

‏ב־size גדול, aggressive fast execution יכול להגדיל impact.

‏לכן latency, urgency ו־capacity קשורים.

---

# ‏262. Latency and Queue Position

‏Passive order איטי להגשה מגיע מאוחר לתור.

‏גם `20ms` יכולים להיות משמעותיים בשוק מסוים, ובשוק אחר לא.

‏נמדוד.

---

# ‏263. Latency and Routing

‏Route מהיר יותר אינו בהכרח route טוב יותר אם fill quality גרועה.

‏נמדוד `net execution quality`.

---

# ‏264. Latency and Hidden Liquidity

‏גישה ל־hidden/midpoint venue יכולה להוסיף routing complexity/latency אבל אולי לשפר price.

‏זה trade-off אמפירי.

---

# ‏265. Latency and Halts

‏ב־halt/reopen אין משמעות להמשיך “להיות מהיר” על market state ישן.

‏TradingStatus קודם.

---

# ‏266. Latency and Recovery

‏לאחר reconnect, מנסים להיות correct לפני fast.

‏הסדר:

```text
reconcile
→ rebuild
→ validate freshness
→ warm up
→ resume
```

---

# ‏267. Latency and Observability

‏אם instrumentation לא מאפשר להסביר spike, אין לנו latency engineering אמיתי.

---

# ‏268. Latency and Safety

‏Latency breach יכול להיות reason code ל־:

```text
BLOCK_NEW_ENTRIES
DEGRADED
EXIT_ONLY
```

‏בהתאם לחומרה.

---

# ‏269. Latency and NO TRADE

‏אם הזדמנות טובה תיאורטית אבל אנחנו כבר מאוחרים מדי:

```text
NO TRADE
```

‏הוא output מקצועי.

---

# ‏270. Latency Is Not a Vanity Metric

‏Dashboard עם `3ms` נראה יפה.

‏אם Net EV לא משתפר — הוא לא היעד.

---

# ‏271. Practitioner Secret: Stability Often Beats Peak Speed

‏מערכת עם P50 `20ms` ו־P99 `2s` יכולה להיות גרועה ממערכת עם P50 `60ms` ו־P99 `90ms`.

‏במיוחד כאשר stale decisions מסוכנות.

---

# ‏272. Practitioner Secret: The Queue You Cannot See Can Dominate

‏לפעמים ה־largest latency אינו CPU אלא backlog פנימי שלא מדדנו.

‏לכן `queue age` בכל boundary הוא metric קריטי.

---

# ‏273. Practitioner Secret: Fast Data + Slow Decisions Can Be Worse

‏Feed מהיר מגדיל event rate.

‏אם processing אינו עומד בו, freshness בפועל יכולה להידרדר.

---

# ‏274. Practitioner Secret: Logging Can Break the System at the Worst Time

‏High-volume burst מייצר יותר logs בדיוק כאשר המערכת עמוסה.

‏אם logging synchronous, הוא מגביר את התקלה.

---

# ‏275. Practitioner Secret: Latency Bugs Look Like Strategy Bugs

‏Rank #1 שנכשל שוב ושוב יכול להיות:

```text
model error
OR
stale decision
OR
late fill
OR
slow exit
```

‏RCA חייב להפריד ביניהם.

---

# ‏276. Practitioner Secret: Faster Entry Can Worsen Selection

‏אם אתה נהיה aggressive יותר כדי להיות מהיר, אתה עשוי לקחת liquidity בדיוק כשה־move כבר priced in.

‏לכן speed ו־adverse selection אינם תמיד בכיוון אחד.

---

# ‏277. Practitioner Secret: Faster Exit Can Be Worth More than Faster Entry

‏ב־small-profit strategy, שמירה על רווח קיים יכולה להיות רגישה מאוד ל־exit latency.

‏צריך למדוד Entry ו־Exit בנפרד.

---

# ‏278. Practitioner Secret: HFT Knowledge Is Useful Even If We Are Not HFT

‏לא כדי להעתיק תשתיות יקרות.

‏אלא כדי ללמוד discipline:

- ‏מדידה.
- ‏time semantics.
- ‏queue awareness.
- ‏tail control.
- ‏minimal hot path.
- ‏determinism.

---

# ‏279. Practitioner Secret: Latency Budget Should Be Economic

‏Budget אמיתי נגזר מ־:

```text
how much edge decays per millisecond
```

‏ולא רק מהנדסה.

---

# ‏280. Practitioner Secret: There Is a Point of Diminishing Returns

‏אחרי bottlenecks הגדולים, כל שיפור נוסף יקר יותר ומוסיף פחות Net Edge.

‏שם עוצרים.

---

# ‏281. Baseline Architecture לרובוט שלנו

```text
Streaming Market Data
        ↓
Canonical State
        ↓
Fast Incremental Features
        ↓
Whole-Market Rank
        ↓
Top-N Deep Checks
        ↓
Decision + Risk
        ↓
Freshness / Signal-TTL Recheck
        ↓
Order Intent
        ↓
Execution Broker
        ↓
ACK / Fill / Position
```

‏בכל boundary timestamp ו־queue-age measurement.

---

# ‏282. Baseline Runtime Goals

‏לא נקבע עדיין מספרי יעד קשיחים.

‏קודם נאסוף:

```text
signal decay curves
live/shadow latency distributions
provider freshness
broker latency
scanner cycle latency
```

‏ורק אז נקבע SLOs.

---

# ‏283. Baseline Optimization Priority

‏למערכת שלנו סדר העדיפויות:

1. ‏Streaming במקום polling איטי כאשר אפשר.
2. ‏Market data freshness.
3. ‏ללא synchronous I/O לא חיוני ב־hot path.
4. ‏Whole-market scanner יעיל.
5. ‏Top-N deep path.
6. ‏Risk state precomputed ועדכני.
7. ‏Broker connection/session warm.
8. ‏Signal TTL ו־stale rejection.
9. ‏P95/P99 instrumentation.
10. ‏רק אחר כך low-level tuning.

---

# ‏284. Baseline C# Guidance

‏מתחילים בקוד ברור ומהיר מספיק:

- ‏`Release` build.
- ‏Async ל־I/O.
- ‏Avoid blocking hot path.
- ‏Bounded channels/queues.
- ‏Compact state.
- ‏Avoid accidental huge allocations.
- ‏Incremental calculations כאשר פשוט.
- ‏Measure GC/contention.
- ‏No premature unsafe/lock-free complexity.

---

# ‏285. Baseline Deployment Guidance

‏בודקים שלוש חלופות לפחות:

```text
local machine in Israel
cloud/server near market-data provider
cloud/server near broker/provider region
```

‏ומשווים end-to-end, לא ping בלבד.

---

# ‏286. Baseline Research Matrix

‏לכל candidate strategy נריץ:

| Delay | Net EV | Fill Rate | Slippage | Markout | Selection Regret |
|---:|---:|---:|---:|---:|---:|
| `0ms` model | | | | | |
| `25ms` | | | | | |
| `50ms` | | | | | |
| `100ms` | | | | | |
| `250ms` | | | | | |
| `500ms` | | | | | |
| `1s` | | | | | |
| `2s` | | | | | |

‏ה־grid בפועל יותאם לרזולוציית data ול־signal.

---

# ‏287. Baseline Live Dashboard

‏נציג לפחות:

```text
fresh coverage
market_to_decision p50/p95/p99
decision_to_submit p50/p95/p99
signal_age_at_submit
submit_to_ack
submit_to_fill
exit_to_flat
queue age
GC pauses
CPU
broker readiness
```

---

# ‏288. Baseline Alerts

‏דוגמאות:

```text
signal_age_at_submit too high
scanner cycle exceeds horizon
queue age exceeds threshold
fresh coverage collapses
broker latency spikes
exit_to_flat spikes
GC pause abnormal
processing backlog growing
```

---

# ‏289. Baseline Safety Rule

‏כאשר איננו בטוחים שה־signal עדיין חי:

```text
DO NOT CREATE NEW RISK
```

‏עדיף לפספס עסקה מאשר לבצע החלטה ישנה כאילו היא חדשה.

---

# ‏290. שאלות שאנחנו חייבים לענות מהנתונים שלנו

1. ‏מה distribution של `time_to_first_profit`?
2. ‏מה distribution של `time_to_target`?
3. ‏כמה מהר Rank #1 מתחלף?
4. ‏מה half-life של score advantage?
5. ‏כמה Edge נשאר אחרי `50/100/250/500ms`?
6. ‏מה P95/P99 של scanner?
7. ‏מה P95/P99 של broker submit/ack?
8. ‏כמה latency עולה בזמן bursts?
9. ‏כמה PnL/markout מושפעים מ־signal age?
10. ‏כמה giveback נגרם מ־exit latency?

---

# ‏291. מה לא נעשה כרגע

‏לא נבנה baseline שמניח צורך ב־:

```text
FPGA
kernel bypass
co-location
custom exchange protocol stack
nanosecond optimization
```

‏אלה יישארו ידע כללי להשוואה, לא דרישת מערכת.

---

# ‏292. מה כן עשוי להיות חשוב כבר מוקדם

‏לעומת זאת ייתכן שכבר מוקדם יהיו חשובים:

```text
streaming feed
low-jitter processing
correct timestamps
bounded queues
fast Top-N selection
warm broker connection
stale-signal rejection
fast exit path
```

---

# ‏293. Definition of Success לשלב הזה

‏אנחנו לא צריכים לומר:

```text
Our system is low latency.
```

‏אנחנו צריכים להיות מסוגלים לומר:

```text
For the signals we actually trade,
our P95/P99 end-to-end latency is known,
its relationship to signal decay is measured,
and net edge remains positive under realistic latency stress.
```

---

# ‏294. Checklist לפני Production

- ‏יש timestamps בכל boundary קריטי.
- ‏יש monotonic durations מקומיים.
- ‏מבינים semantics של provider timestamps.
- ‏יש P50/P95/P99/MAX.
- ‏יש queue age metrics.
- ‏יש fresh coverage metrics.
- ‏יש signal age at decision/submit/fill.
- ‏יש latency distribution ב־Replay/Shadow/Live.
- ‏יש artificial-delay experiments.
- ‏יש Break-Even Latency estimate.
- ‏יש stale-signal rejection.
- ‏יש latency safety gate.
- ‏Exit path מקבל priority.
- ‏אין synchronous diagnostics ב־hot path.
- ‏יש GC/contention visibility.
- ‏יש burst/soak/fault tests.
- ‏Optimization decisions מגובות ב־measurement.

---

# ‏295. שאלות ידע

‏אם הבנת את הפרק, אתה אמור לדעת לענות:

1. ‏למה `80ms` אינו “מהיר” או “איטי” בלי לדעת Signal Half-Life?
2. ‏למה P99 חשוב יותר מממוצע במערכת קצרה?
3. ‏מה ההבדל בין Data Freshness ל־Compute Latency?
4. ‏למה faster feed יכול דווקא להגדיל backlog?
5. ‏מתי batching משפר throughput אבל פוגע ב־latency?
6. ‏למה `async` לא הופך CPU computation למהיר?
7. ‏איך GC יכול להופיע כ־tail latency?
8. ‏למה same-tick fill ב־Backtest יכול להיות לא ריאלי?
9. ‏למה fast entry ו־fast exit צריכים להימדד בנפרד?
10. ‏למה אין סיבה לרדוף אחרי microseconds אם ה־signal חי שניות?
11. ‏מתי כן מילישניות בודדות הופכות קריטיות?
12. ‏איך latency מתחברת ל־adverse selection?
13. ‏איך latency מתחברת ל־queue position?
14. ‏איך latency מתחברת ל־capacity?
15. ‏מתי `NO TRADE` הוא הפתרון הנכון בגלל latency?

---

# ‏296. משפט הסיכום

> ‏**הרובוט שלנו אינו צריך לנצח HFT במרוץ למהירות. הוא צריך לדעת כמה זמן ה־Edge שלו חי, כמה זמן באמת לוקח לו להגיע מ־Market Event עד Fill ועד Flat, ולוודא שגם ב־P95/P99 ובתנאי עומס הוא עדיין פועל בתוך חלון הזמן שבו ה־Edge ניתן למימוש.**

---

# ‏297. לאן ממשיכים

‏השלב הבא בקורס הוא **49 — `Quant Research Best Practices`**.

‏שם נעבור מהנדסת microstructure/execution למשמעת מחקר מקצועית: experiment design, research notebooks/artifacts, dataset/version lineage, hypothesis registry, reproducibility, evidence hierarchy, negative results, review gates, ומנגנון שמונע מהמחקר להפוך ל־parameter hunting.
