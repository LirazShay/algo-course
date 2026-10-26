# ‏שלב 53 — `Testing Best Practices`: לבדוק מערכת מסחר בלי להפוך את הבדיקות לצוואר בקבוק

> ‏מטרת הפרק: לבנות אסטרטגיית בדיקות מקצועית למערכת Algo שלמה — `Market Data`, ‏Features, Scanner, Ranking, Risk, Execution, Broker Integration, Recovery ו־Safety — כך שנוכל לשנות את המערכת במהירות בלי לפחד ששברנו invariant קריטי, ובלי ליצור test suite איטי שאנשים מפסיקים להריץ.
>
> ‏העיקרון המרכזי: **בדיקות אינן רק הוכחה שהקוד “עובד”. הן מנגנון שמוכיח שהמערכת שומרת על invariants גם כאשר הזמן, הסדר, הרשת, הנתונים והברוקר מתנהגים בצורה לא נוחה.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה Testing במערכת מסחר שונה מאפליקציה רגילה

‏במערכת CRUD רגילה אפשר לעיתים להסתפק בשאלה:

```text
Given input X
When method Y runs
Then output Z is returned
```

‏במערכת מסחר זה לא מספיק.

‏אנחנו צריכים לשאול גם:

```text
What did we know at that exact time?
What arrived late?
What arrived twice?
What was reordered?
What did the broker actually accept?
Was the order partially filled?
Did a cancel race with a fill?
Did a restart happen mid-position?
Was the quote stale?
Was the market halted?
Was the scanner overloaded?
Did the same event produce the same decision in replay?
```

‏לכן Testing אצלנו הוא גם בדיקת **זמן, סדר, state, side effects ואי־ודאות**.

---

# ‏2. המטרה אינה “100% Coverage”

‏`Code Coverage` יכול להיות שימושי.

‏אבל הוא אינו המטרה.

‏אפשר להגיע ל־100% line coverage ועדיין לא לבדוק:

- ‏duplicate order.
- ‏overfill.
- ‏stale signal.
- ‏partial fill בזמן cancel.
- ‏position mismatch אחרי reconnect.
- ‏future leakage ב־feature.
- ‏rank instability.
- ‏kill switch שלא באמת חוסם Entry.

‏המטרה האמיתית היא:

```text
Critical Behavior Coverage
+ Invariant Coverage
+ Failure-Mode Coverage
+ Timeline Coverage
+ Recovery Coverage
```

---

# ‏3. Testing Pyramid מותאם למערכת שלנו

‏לא כל בדיקה צריכה browser, broker simulator או replay של יום שלם.

‏מבנה מומלץ:

```text
Many fast unit/property tests
        ↓
Component tests
        ↓
Deterministic integration tests
        ↓
Replay / scenario tests
        ↓
Broker sandbox / paper tests
        ↓
Small number of end-to-end acceptance tests
```

‏ככל שעולים בפירמידה:

- ‏הבדיקה יקרה יותר.
- ‏איטית יותר.
- ‏רגישה יותר לסביבה.
- ‏קשה יותר לאבחן failure.

‏ולכן רוב החוקים צריכים להיבדק בשכבה הנמוכה ביותר שאפשר.

---

# ‏4. חלוקת Suites לפי מהירות

‏אצלנו כדאי להפריד לפחות:

### ‏`Fast`

‏רץ בכל commit/PR.

‏מטרת יעד:

```text
seconds to a few minutes
```

‏כולל:

- ‏unit tests.
- ‏property tests זולים.
- ‏pure feature calculations.
- ‏ranking determinism.
- ‏state-machine transitions.
- ‏invariants.
- ‏schema contracts.

### ‏`Integration`

‏רץ ב־CI או לפני merge כאשר צריך.

‏כולל:

- ‏DB.
- ‏event pipeline.
- ‏persistence.
- ‏broker adapter simulator.
- ‏reconciliation scenarios.

### ‏`Replay`

‏רץ על datasets נבחרים.

‏כולל:

- ‏canonical events.
- ‏scanner.
- ‏ranking.
- ‏execution simulation.
- ‏golden sessions.

### ‏`Slow / Nightly`

‏כולל:

- ‏יום מסחר גדול.
- ‏stress.
- ‏soak.
- ‏fault injection רחב.
- ‏cross-provider consistency.
- ‏performance regression.

‏כך שומרים Fast Feedback בלי לוותר על עומק.

---

# ‏5. כלל הזהב: Unit Tests צריכים להיות באמת Unit

‏Unit test טוב:

- ‏לא פותח רשת.
- ‏לא תלוי בשעה אמיתית.
- ‏לא תלוי ב־filesystem חיצוני אם אין צורך.
- ‏לא תלוי ב־broker.
- ‏לא תלוי ב־database אמיתי.
- ‏לא משתמש ב־sleep.
- ‏לא flaky.

‏הוא בודק חוק עסקי קטן בצורה דטרמיניסטית.

---

# ‏6. Time הוא Dependency

‏במערכת שלנו אסור לפזר:

```csharp
DateTime.UtcNow
```

‏בכל מקום.

‏במקום זאת משתמשים ב־clock abstraction.

```csharp
public interface IClock
{
    DateTimeOffset UtcNow { get; }
}
```

‏בבדיקה:

```csharp
var clock = new FakeClock(start);
clock.Advance(TimeSpan.FromMilliseconds(250));
```

‏כך אפשר לבדוק:

- ‏TTL.
- ‏timeouts.
- ‏order aging.
- ‏signal decay.
- ‏cooldowns.
- ‏retries.
- ‏kill-switch windows.

‏בלי `Thread.Sleep`.

---

# ‏7. אסור להשתמש ב־Sleep כדי “לתת למערכת זמן”

‏Anti-pattern:

```csharp
await Task.Delay(1000);
Assert.True(done);
```

‏זה יוצר:

- ‏בדיקות איטיות.
- ‏flakiness.
- ‏machine-dependent behavior.
- ‏CI failures אקראיים.

‏במקום זאת:

- ‏await על signal אמיתי.
- ‏`TaskCompletionSource`.
- ‏fake clock.
- ‏bounded polling עם condition מפורש.
- ‏virtual scheduler.

---

# ‏8. Determinism הוא דרישת יסוד

‏אותו:

```text
dataset
+ code version
+ config
+ seed
+ execution model
```

‏צריך להחזיר אותה תוצאה.

‏אם אותה Replay רצה פעמיים ומייצרת Top-1 שונה בלי סיבה מפורשת — יש בעיה.

---

# ‏9. מקורות נפוצים ל־Nondeterminism

- ‏thread scheduling.
- ‏unordered collections.
- ‏floating-point accumulation order.
- ‏current time.
- ‏random numbers ללא seed.
- ‏parallel aggregation.
- ‏database ordering ללא `ORDER BY`.
- ‏same-score tie ללא tie-breaker.
- ‏late events.
- ‏filesystem enumeration order.

---

# ‏10. Stable Tie-Breakers

‏אם שתי מניות מקבלות אותו Score:

```text
Score A = 7.42
Score B = 7.42
```

‏צריך כלל דטרמיניסטי.

‏למשל:

```text
score DESC
confidence DESC
freshness DESC
symbol ASC
```

‏והכלל הזה צריך בדיקה.

---

# ‏11. Property-Based Testing

‏במקום לבדוק רק מספר דוגמאות ידניות, מגדירים חוק.

‏לדוגמה:

```text
PositionSize must never be negative.
FilledQuantity must never exceed IntendedQuantity.
Exposure after flatten must be zero.
Rank ordering must be transitive.
```

‏ואז מייצרים הרבה inputs.

---

# ‏12. Invariants חשובים במיוחד אצלנו

‏דוגמאות:

```text
FilledQty <= RequestedQty
```

```text
OpenRisk = FilledExposure + PendingExposure
```

```text
If SafetyState >= BLOCK_NEW_ENTRIES
then no new entry intent may reach broker submission.
```

```text
If market data is stale
then candidate cannot become executable.
```

```text
One IntentId cannot create two independent live positions accidentally.
```

---

# ‏13. State Machine Tests

‏כל state machine צריכה transition table.

‏לדוגמה:

```text
NEW
→ SUBMITTING
→ WORKING
→ PARTIALLY_FILLED
→ FILLED
```

‏אבל צריך לבדוק גם:

```text
WORKING
→ CANCEL_REQUESTED
→ PARTIALLY_FILLED
→ CANCELED
```

‏וגם:

```text
SUBMITTING
→ UNKNOWN_EFFECT
→ RECONCILING
→ WORKING
```

---

# ‏14. Illegal Transition Tests

‏לא בודקים רק מה מותר.

‏בודקים גם מה אסור.

‏לדוגמה:

```text
FILLED → NEW
```

‏צריך להיכשל.

‏כך גם:

```text
CANCELED → WORKING
```

‏אלא אם התקבל event מאוחר שמוכיח שהמודל המקומי היה שגוי ואז עוברים דרך reconciliation מוגדר.

---

# ‏15. Model-Based Testing

‏אפשר להגדיר model פשוט שמייצג את החוקים.

‏ואז להריץ sequence אקראי של:

```text
submit
ack
partial fill
cancel
fill
reject
reconnect
```

‏ולהשוות בין המודל הפשוט לבין implementation אמיתי.

‏זה שימושי במיוחד ל־Execution Engine.

---

# ‏16. Golden Scenario Tests

‏אנחנו שומרים תרחישים חשובים כ־fixture קבוע.

‏לדוגמה:

### ‏`GS-001`

‏Entry רגיל → Fill מלא → Exit → Flat.

### ‏`GS-002`

‏Partial fill → Cancel → Remaining canceled.

### ‏`GS-003`

‏Cancel requested → Fill arrives before cancel confirmation.

### ‏`GS-004`

‏Disconnect אחרי submit ולפני ACK.

### ‏`GS-005`

‏Restart כאשר יש Position ו־Order פתוח.

### ‏`GS-006`

‏Market Data stale בזמן Candidate.

### ‏`GS-007`

‏Halt בדיוק בזמן Entry.

---

# ‏17. Golden Tests אינם Snapshot Worship

‏Snapshot גדול של JSON שאף אחד לא קורא הוא לא בהכרח בדיקה טובה.

‏Golden test טוב בודק outcome בעל משמעות.

‏לדוגמה:

```text
selected_symbol = ABC
trade_decision = NO_TRADE
reason = STALE_DATA
```

‏ולא dump של אלפי fields שמשתנים בכל refactor.

---

# ‏18. Replay Tests

‏Replay הוא אחד הכלים החזקים ביותר שלנו.

‏אותו stream של market events צריך לאפשר לבדוק:

- ‏Feature state.
- ‏Filters.
- ‏Ranking.
- ‏Top Candidate.
- ‏Decision.
- ‏Execution simulation.

---

# ‏19. Replay צריך להיות Point-in-Time Correct

‏אסור ל־Replay להשתמש ב־event שהגיע בעתיד כדי לשנות state בעבר.

‏לדוגמה:

```text
EventTime = 10:00:00.100
ReceiveTime = 10:00:00.450
```

‏אם Live היה רואה אותו רק ב־450ms, גם Replay שמדמה Live צריך לכבד את זה.

---

# ‏20. Two Replay Modes

‏כדאי להחזיק שני modes:

### ‏`Exchange-Time Replay`

‏למחקר microstructure.

### ‏`As-Received Replay`

‏לשחזור מה המערכת שלנו באמת יכלה לדעת.

‏ההבדל ביניהם יכול לחשוף latency/data-quality edge cases.

---

# ‏21. Data Contract Tests

‏כל feed adapter צריך בדיקות contract.

‏לדוגמה:

- ‏price units.
- ‏timezone.
- ‏sequence semantics.
- ‏nullable fields.
- ‏trade conditions.
- ‏quote ordering.
- ‏duplicate IDs.

---

# ‏22. Schema Evolution Tests

‏כאשר schema משתנה:

```text
v1 → v2
```

‏צריך לבדוק:

- ‏backward compatibility.
- ‏migration.
- ‏old replay files.
- ‏missing fields.
- ‏new enum values.

---

# ‏23. Unknown Enum Test

‏Provider מוסיף value חדש.

‏מערכת לא צריכה לקרוס רק כי הופיע:

```text
status = NEW_PROVIDER_STATUS_17
```

‏צריך:

```text
Known
Unknown
Unsupported
```

‏ולהגיב במפורש.

---

# ‏24. Duplicate Event Tests

‏אותו trade/quote/order update יכול להגיע פעמיים.

‏הבדיקה צריכה להוכיח:

```text
apply(event)
apply(event again)
```

‏לא מייצר state כפול.

---

# ‏25. Out-of-Order Tests

‏לדוגמה:

```text
seq 101
seq 103
seq 102
```

‏צריך לבדוק policy:

- ‏buffer?
- ‏reject?
- ‏rebuild?
- ‏degrade?

‏לא להשאיר התנהגות מקרית.

---

# ‏26. Gap Tests

```text
101
102
105
```

‏המערכת צריכה לזהות gap.

‏צריך לבדוק ש־gap:

- ‏מסומן.
- ‏מוריד confidence.
- ‏יכול לחסום trading כאשר critical.
- ‏נרשם ל־observability.

---

# ‏27. Freshness Tests

‏לדוגמה:

```text
quote age = 80 ms
threshold = 100 ms
→ valid
```

```text
quote age = 130 ms
threshold = 100 ms
→ stale
```

‏אבל חשוב לבדוק boundaries בדיוק.

---

# ‏28. Boundary Tests

‏כל threshold צריך בדיקות:

```text
threshold - epsilon
threshold
threshold + epsilon
```

‏זה נכון ל־:

- ‏spread.
- ‏price.
- ‏volume.
- ‏TTL.
- ‏latency.
- ‏risk limit.
- ‏position size.

---

# ‏29. Scanner Ranking Tests

‏צריך לבדוק:

- ‏Top-1 נכון.
- ‏Top-N נכון.
- ‏ties.
- ‏invalid features.
- ‏missing values.
- ‏stale symbols.
- ‏filtered symbols.
- ‏same inputs → same rank.

---

# ‏30. Ranking Metamorphic Tests

‏Metamorphic testing בודק יחסים במקום מספר exact.

‏לדוגמה:

‏אם מעלים רק את Feature החיובי של Candidate A וכל השאר זהה:

```text
rank(A) must not become worse
```

‏אם Feature אכן מוגדר monotonic.

---

# ‏31. Filter Tests

‏לכל filter:

- ‏positive case.
- ‏negative case.
- ‏boundary.
- ‏missing input.
- ‏stale input.
- ‏reason code.

‏Reason Code הוא חלק מה־contract.

---

# ‏32. `NO TRADE` Tests

‏צריך לבדוק ש־`NO TRADE` מתקבל כאשר:

- ‏אין candidate מספיק טוב.
- ‏ה־edge קטן מהעלות.
- ‏הנתונים stale.
- ‏ה־spread גדול מדי.
- ‏execution infeasible.
- ‏risk gate חוסם.
- ‏market state לא תקין.

---

# ‏33. Execution Tests

‏Execution Engine צריך suite משלו.

‏תרחישים:

- ‏full fill.
- ‏partial fill.
- ‏reject.
- ‏cancel.
- ‏cancel/fill race.
- ‏timeout.
- ‏duplicate callback.
- ‏late callback.
- ‏disconnect.
- ‏unknown effect.

---

# ‏34. Idempotency Tests

‏אותו command נשלח פעמיים.

```text
SubmitIntent(X)
SubmitIntent(X)
```

‏המערכת צריכה להוכיח שלא נוצרו שתי חשיפות בלתי־תלויות.

---

# ‏35. Pending Exposure Tests

‏נבדוק:

```text
Filled = 30
WorkingRemaining = 70
```

‏Risk צריך לראות 100 יחידות של potential exposure בהתאם ל־semantics.

‏אסור להסתכל רק על Position הנוכחי.

---

# ‏36. Overfill Tests

‏Invariant:

```text
TotalFilled <= AllowedTarget
```

‏גם כאשר:

- ‏שני callbacks מגיעים יחד.
- ‏cancel race.
- ‏retry.
- ‏restart.

---

# ‏37. Reconciliation Tests

‏Local state אומר:

```text
No open orders
Position = 0
```

‏Broker אומר:

```text
OpenOrder = BUY 100
Position = 30
```

‏המערכת חייבת לבחור broker/account truth ולשחזר state בבטחה.

---

# ‏38. Restart Tests

‏צריך לבצע automated restart בתוך states שונים:

- ‏SCANNING.
- ‏ENTERING.
- ‏PARTIALLY_FILLED.
- ‏POSITION.
- ‏EXITING.
- ‏UNKNOWN_EFFECT.

‏ולבדוק recovery.

---

# ‏39. Crash-Point Testing

‏מכניסים crash מלאכותי בין פעולות.

‏לדוגמה:

```text
persist intent
CRASH
send order
```

‏או:

```text
send order
CRASH
persist acknowledgement
```

‏המטרה היא לחשוף חלונות consistency.

---

# ‏40. Fault Injection

‏Fault injection צריך להיות חלק מה־suite.

‏תקלות לדוגמה:

- ‏network timeout.
- ‏connection reset.
- ‏late broker response.
- ‏duplicate response.
- ‏bad sequence.
- ‏disk full.
- ‏slow DB.
- ‏clock jump.
- ‏stale feed.
- ‏provider disconnect.

---

# ‏41. Safety Tests

‏Kill switch אינו feature שאפשר לבדוק ידנית פעם אחת.

‏צריך להוכיח אוטומטית:

```text
trigger safety
→ block new entries
→ allow risk-reducing exit
→ cancel required working entries
→ persist state
→ survive restart
```

---

# ‏42. Safety Dominates Strategy

‏אם Strategy אומר:

```text
BUY
```

‏ו־Safety אומר:

```text
BLOCK_NEW_ENTRIES
```

‏התוצאה חייבת להיות:

```text
NO SUBMIT
```

‏תמיד.

---

# ‏43. Kill Switch Race Tests

‏מה קורה אם:

```text
KillSwitch fires
and
Fill arrives simultaneously
```

‏המערכת חייבת לעדכן exposure ולבצע פעולה בטוחה בהתאם למצב החדש.

---

# ‏44. Halt Tests

‏צריך לבדוק:

- ‏halt לפני Entry.
- ‏halt אחרי submit.
- ‏halt עם Position פתוח.
- ‏reopening.
- ‏stale quote בזמן halt.

---

# ‏45. Fast Market Tests

‏מייצרים burst של events.

‏בודקים:

- ‏queue growth.
- ‏fresh coverage.
- ‏load shedding.
- ‏priority.
- ‏decision staleness.

---

# ‏46. Backpressure Tests

‏לא מספיק למדוד throughput ממוצע.

‏צריך לבדוק:

```text
arrival_rate > processing_rate
```

‏ולראות:

- ‏מה נזרק.
- ‏מה נשמר.
- ‏מה מקבל priority.
- ‏מתי trading נחסם.

---

# ‏47. Performance Tests אינם רק Benchmark

‏Benchmark של פונקציה אחת שימושי.

‏אבל אנחנו צריכים גם:

- ‏whole-scanner cycle.
- ‏burst processing.
- ‏Top-N enrichment.
- ‏decision-to-submit.
- ‏recovery time.

---

# ‏48. Performance Regression Gates

‏אפשר לקבוע budget.

‏לדוגמה:

```text
P99 scanner cycle <= X ms
P99 decision path <= Y ms
allocations per event <= Z
```

‏אבל thresholds צריכים להגיע ממדידות ומיעדי המערכת שלנו.

---

# ‏49. אל תבדוק Performance על מחשב אחד בלבד

‏CI machine יכול להיות רועש.

‏לכן performance gates צריכים:

- ‏margin.
- ‏repeated runs.
- ‏trend.
- ‏dedicated benchmark environment כאשר צריך.

---

# ‏50. Flaky Test הוא Bug

‏אם test נכשל פעם בשבוע “סתם”, הוא לא סתם.

‏יש אחת משתי בעיות:

1. ‏הבדיקה nondeterministic.
2. ‏המערכת nondeterministic.

‏שתיהן ראויות ל־RCA.

---

# ‏51. לא לעשות Retry אוטומטי שמסתיר Flakiness

‏Anti-pattern:

```text
Fail
→ rerun
→ pass
→ green CI
```

‏כך מאבדים signal חשוב.

‏אם יש retry תשתיתי, הכישלון הראשון עדיין צריך להישמר ולסווג.

---

# ‏52. Test Failure RCA

‏כאשר CI נכשל:

‏לא מסתפקים ב־“תיקנתי את השורה”.

‏שואלים:

- ‏למה זה קרה?
- ‏איזה invariant נשבר?
- ‏האם יש מקרים דומים?
- ‏האם test חסר במקום אחר?
- ‏האם ה־design איפשר class שלם של bugs?

---

# ‏53. Test Taxonomy

‏לכל test כדאי label ברור:

```text
unit
property
component
integration
replay
golden
fault
performance
acceptance
broker-paper
```

‏כך CI יכול להריץ subsets נכונים.

---

# ‏54. Fast CI

‏Fast CI צריך להיות gate לכל שינוי.

‏הוא אמור לתת feedback מהיר.

‏אם Fast CI הופך ל־20–30 דקות, צריך RCA על ה־test architecture.

---

# ‏55. Parallelization

‏אפשר להריץ בדיקות במקביל רק כאשר isolation אמיתי.

‏בעיות נפוצות:

- ‏shared DB.
- ‏shared ports.
- ‏shared static state.
- ‏shared temp files.
- ‏global clock.

---

# ‏56. Hermetic Tests

‏בדיקה hermetic לא תלויה ב:

- ‏internet אמיתי.
- ‏clock אמיתי.
- ‏broker אמיתי.
- ‏API צד שלישי.
- ‏סדר הרצה של test אחר.

---

# ‏57. Contract Tests מול Provider/Broker

‏Mock יכול להיות שגוי.

‏לכן צריך גם contract/conformance suite שבודקת adapter מול semantics שאנחנו מצפים להם.

‏לדוגמה:

```text
Can order status arrive before acknowledgement?
Can partial fill arrive after cancel request?
What IDs remain stable after reconnect?
```

---

# ‏58. Mocks צריכים להיות “רעילים” מספיק

‏Mock שמחזיר תמיד success מלמד מעט מאוד.

‏Fake broker טוב צריך לדעת לייצר:

- ‏reject.
- ‏partial fill.
- ‏delayed fill.
- ‏duplicate callbacks.
- ‏reordered callbacks.
- ‏disconnect.
- ‏unknown effect.

---

# ‏59. Test Double Fidelity

‏כדאי להגדיר רמות:

```text
Fake
Simulator
Recorded Replay
Paper Broker
Live Small-Size Observation
```

‏כל רמה עונה על שאלות אחרות.

---

# ‏60. Mutation Testing

‏Mutation testing משנה בכוונה תנאי בקוד.

‏למשל:

```text
>
```

‏ל־:

```text
>=
```

‏אם כל הבדיקות עדיין ירוקות, ייתכן שה־suite לא באמת מגן על החוק.

---

# ‏61. Differential Testing

‏אפשר להריץ שתי implementations מול אותו dataset.

‏לדוגמה:

```text
OldScanner
NewScanner
```

‏ולבדוק:

- ‏rank deltas.
- ‏decision deltas.
- ‏feature deltas.

---

# ‏62. Shadow Comparison

‏ב־Live אפשר להריץ גרסה חדשה בלי לשלוח orders.

‏משווים:

```text
Champion decision
vs
Challenger decision
```

‏ומודדים `Decision Impact Rate`.

---

# ‏63. Test Data חייב להיות Versioned

‏Fixture משמעותי צריך:

```text
DatasetId
Source
TimeRange
SchemaVersion
ParserVersion
ExpectedProperties
```

---

# ‏64. Tiny Synthetic Fixtures

‏ל־unit tests עדיף dataset קטן שממחיש בדיוק את החוק.

‏לדוגמה 8 events שמייצרים:

```text
momentum → candidate → stale → reject
```

‏קל להבין failure כזה.

---

# ‏65. Real Recorded Fixtures

‏בנוסף צריך דוגמאות אמת.

‏כי synthetic data לא תמיד מכיל quirks אמיתיים.

---

# ‏66. Incident-to-Test Rule

‏כל incident משמעותי ב־Production צריך להפוך ל־test.

```text
Incident
→ RCA
→ minimal reproducer
→ regression test
```

‏כך מערכת הבדיקות צוברת זיכרון.

---

# ‏67. Near-Miss-to-Test Rule

‏גם near miss חשוב.

‏אם kill switch הציל אותנו מ־duplicate submit, כדאי לשמור את התרחיש גם אם לא נגרם נזק.

---

# ‏68. Bug Reproduction לפני Fix

‏כאשר אפשר:

1. ‏כותבים test שנכשל.
2. ‏מאמתים שהוא משחזר את הבעיה.
3. ‏מתקנים.
4. ‏מוודאים שה־test עבר.

---

# ‏69. Test Naming

‏שם טוב מתאר behavior.

‏לדוגמה:

```text
CancelRequested_WhenLateFillArrives_UpdatesPositionAndDoesNotResubmitExit
```

‏עדיף על:

```text
TestCancel2
```

---

# ‏70. Arrange / Act / Assert

‏מבנה פשוט עוזר לקריאות.

```csharp
// Arrange

// Act

// Assert
```

‏אבל אין צורך להפוך אותו לדוגמה דוגמטית בכל test קטן.

---

# ‏71. Assertions על Behavior, לא Implementation

‏עדיף לבדוק:

```text
No duplicate broker command emitted
```

‏ולא:

```text
private field _counter == 3
```

‏אלא אם ה־field עצמו הוא contract.

---

# ‏72. Over-Mocking

‏יותר מדי mocks גורמים לבדיקה לאמת את ה־mock graph במקום את ההתנהגות.

‏במערכות stateful לעיתים Fake פשוט עדיף.

---

# ‏73. Test the Seams

‏הבאגים היקרים נמצאים הרבה פעמים בגבולות:

```text
Data → Scanner
Scanner → Risk
Risk → Execution
Execution → Broker
Broker → Local State
```

‏לכן integration tests מתמקדים ב־seams.

---

# ‏74. Arithmetic Tests

‏Financial arithmetic צריך בדיקות מפורשות:

- ‏rounding.
- ‏tick size.
- ‏quantity rounding.
- ‏fees.
- ‏PnL.
- ‏average fill price.
- ‏partial fills.

---

# ‏75. Floating Point Tests

‏לא עושים תמיד:

```csharp
Assert.Equal(0.1, actual);
```

‏בלי לחשוב על representation.

‏צריך decimal/integerized prices או tolerances בהתאם ל־contract.

---

# ‏76. Tick-Aware Tests

‏מחיר שנוצר על ידי Strategy חייב להיות valid tick בהתאם ל־instrument rules.

‏בדיקות צריכות לוודא rounding direction נכון.

---

# ‏77. Fees Tests

‏עלויות צריכות להיבדק גם בגבולות:

- ‏minimum commission.
- ‏per-share.
- ‏fixed fee.
- ‏round-trip.

‏אם התעריף משתנה חיצונית, ה־test בודק את ה־configured model ולא hard-coded מידע היסטורי.

---

# ‏78. Execution Cost Tests

‏נבדוק:

```text
GrossEdge - Spread - Fees - Slippage - Impact - AdverseSelection
```

‏ולא רק Gross PnL.

---

# ‏79. Label Tests

‏Forward-return labels צריכים להיות causal.

‏צריך לבדוק שה־label builder לעולם לא משתמש בעתיד בתוך feature set.

---

# ‏80. Leakage Canary

‏אפשר להכניס בכוונה feature מהעתיד ולוודא שמנגנון validation מזהה אותו.

‏אם לא — מערכת המחקר רגישה ל־leakage שקט.

---

# ‏81. Time-Shift Test

‏מזיזים feature קדימה/אחורה בזמן.

‏אם performance “קסום” מופיע דווקא בהיסט לא חוקי, זו נורת אזהרה.

---

# ‏82. Shuffle Test

‏אם מערבבים labels והמודל עדיין “מנבא” מצוין, יש בעיה ב־pipeline או leakage.

---

# ‏83. Null Strategy Tests

‏Strategy ריקה צריכה להתנהג כצפוי:

```text
no entries
no unexpected orders
zero strategy PnL except configured costs = zero
```

---

# ‏84. Naive Baseline Tests

‏משווים למודלים פשוטים.

‏אם Strategy מורכבת לא עוברת baseline פשוט, המורכבות לא מוצדקת.

---

# ‏85. Cross-Environment Tests

‏צריך לוודא שה־config בין:

```text
Research
Replay
Paper
Live
```

‏אינו משתנה בלי traceability.

---

# ‏86. Environment Safety Tests

‏Production credentials לא צריכים להיות זמינים בטעות ב־unit/integration suite.

‏Test process לא אמור להיות מסוגל לבצע live order במקרה.

---

# ‏87. Dry-Run Enforcement

‏ב־test environment:

```text
LiveSubmissionAllowed = false
```

‏צריך להיות invariant קשיח.

---

# ‏88. Secrets Tests

‏Logs ובדיקות snapshot לא צריכים להכיל:

- ‏API keys.
- ‏tokens.
- ‏passwords.
- ‏account secrets.

---

# ‏89. Observability Tests

‏אם אירוע קריטי קורה, צריך לוודא שנוצר:

- ‏reason code.
- ‏metric.
- ‏structured log.
- ‏correlation ID.

‏Observability היא contract.

---

# ‏90. Alert Tests

‏אפשר לבדוק alert rules על streams סינתטיים.

‏לדוגמה:

```text
reject_rate spikes
→ alert fires
```

‏אבל:

```text
single expected reject
→ no noisy alert
```

---

# ‏91. Acceptance Scenarios

‏Acceptance test צריך לבדוק journey עסקי מלא.

‏למשל:

```text
fresh data
→ candidate selected
→ risk approved
→ order submitted
→ partial fill
→ signal decays
→ cancel remainder
→ exit filled quantity
→ flat
→ complete audit trail
```

---

# ‏92. Acceptance Test Count צריך להיות קטן

‏לא צריך מאות E2E tests.

‏מספיק סט קטן של critical journeys.

‏את כל הקומבינטוריקה דוחפים למטה ל־unit/property/component tests.

---

# ‏93. Browser E2E רק אם Browser הוא חלק מהמערכת

‏אם UI רק מציג state, לא כל חוק עסקי צריך browser.

‏Browser tests מיועדים ל־:

- ‏critical workflows.
- ‏rendering/interaction.
- ‏operator controls.
- ‏pause/resume/kill switch UI.

---

# ‏94. Avoid Full-System Setup לכל Test

‏אם test בודק rounding של price, אין סיבה להרים:

```text
DB + WebSocket + Scanner + Broker + UI
```

‏זה הורס מהירות ואבחון.

---

# ‏95. Test Runtime Budget

‏לכל suite כדאי budget מפורש.

‏לדוגמה:

```text
Unit: very fast
Fast CI: minutes, not tens of minutes
Replay smoke: bounded
Nightly: may be heavier
```

‏המספר המדויק נקבע לפי הפרויקט, אבל עצם ה־budget הוא contract.

---

# ‏96. Slow-Test Report

‏CI צריך להראות tests איטיים ביותר.

‏כך אפשר לזהות regression בזמן.

---

# ‏97. Quarantine הוא פתרון זמני בלבד

‏אם test flaky נכנס ל־quarantine:

- ‏owner.
- ‏reason.
- ‏deadline.
- ‏RCA.

‏אחרת quarantine הופך לבית קברות.

---

# ‏98. Test Duplication

‏100 tests שמוכיחים אותו invariant כמעט באותו input אינם בהכרח ערך.

‏עדיף coverage של failure modes שונים.

---

# ‏99. Test Data Builders

‏במקום constructor ענק:

```csharp
new Quote(... 18 args ...)
```

‏משתמשים builders עם defaults חוקיים.

```csharp
QuoteBuilder.Valid()
    .WithBid(...)
    .WithAsk(...)
    .Build();
```

---

# ‏100. Invalid Builders

‏כדאי שיהיו helpers לתרחישים לא חוקיים:

```text
WithStaleTimestamp
WithCrossedMarket
WithSequenceGap
WithMissingAsk
```

---

# ‏101. Replay Fixtures קטנים לפי Failure Mode

‏במקום יום שלם לכל bug, שומרים mini replay שמכיל רק את הרצף הדרוש.

‏זה מקצר מאוד CI.

---

# ‏102. Full-Day Replay נשאר חשוב

‏Mini fixtures לא מחליפים datasets גדולים.

‏הם משלימים אותם.

‏Full-day replay מגלה:

- ‏memory leaks.
- ‏state accumulation.
- ‏rare sequence combinations.
- ‏performance drift.

---

# ‏103. Soak Testing

‏מריצים pipeline לאורך זמן רב.

‏בודקים:

- ‏memory.
- ‏handles.
- ‏queue growth.
- ‏GC.
- ‏log volume.
- ‏storage growth.

---

# ‏104. Load Testing

‏לא מספיק average day.

‏צריך burst מעל הצפוי.

```text
1x
2x
5x
```

‏ולבדוק graceful degradation.

---

# ‏105. Chaos אינו Random Destruction

‏Fault injection מקצועי מתחיל בהשערה.

‏לדוגמה:

```text
If market-data connection drops for 2 seconds,
new entries must stop within X ms.
```

‏ואז בודקים.

---

# ‏106. Recovery Time Objective

‏לא מספיק שהמערכת “בסוף התאוששה”.

‏אפשר למדוד:

```text
Detection Time
Isolation Time
Reconciliation Time
Ready Again Time
```

---

# ‏107. Safety Recovery אינו Auto-Resume אוטומטי

‏Test צריך להוכיח שהיעלמות trigger לא בהכרח מחזירה מיד trading.

‏Resume דורש invariants ברורים.

---

# ‏108. Property: Restart Idempotence

‏אם עושים restart פעמיים רצוף, state הסופי צריך להיות זהה ל־restart אחד — כל עוד broker truth לא השתנה.

---

# ‏109. Property: Duplicate Event Idempotence

```text
State(E) == State(E, E)
```

‏כאשר E הוא event שנועד להיות idempotent לפי contract.

---

# ‏110. Property: No Future Knowledge

‏Decision בזמן `t` חייב להיות פונקציה רק של information עם availability time <= `t`.

---

# ‏111. Property: Safety Monotonicity

‏כאשר נכנס safety state מחמיר, פעולה רגילה של Strategy לא יכולה להחליש אותו.

---

# ‏112. Property: Exposure Conservation

‏כל fill צריך להיות מוסבר דרך ledger.

‏לא אמורות “להופיע” מניות ללא execution event או reconciliation event מתועד.

---

# ‏113. Property: Flat Means Flat

‏כאשר state אומר `FLAT`, צריך להיות:

```text
Position = 0
PendingExit = 0
UnknownExecutionEffect = false
```

‏או שהמערכת לא באמת Flat.

---

# ‏114. Property: One Winner, One Explanation

‏לכל Top-1 צריך להיות audit snapshot שמסביר:

- ‏מי היה universe.
- ‏מי נפסל.
- ‏מי דורג.
- ‏למה הוא ניצח.
- ‏מה היה freshness.

---

# ‏115. Property: `NO TRADE` Is Explainable

‏גם החלטה לא לסחור חייבת reason code.

---

# ‏116. Randomized Event Sequences

‏מייצרים אלפי sequences חוקיים/כמעט־חוקיים.

‏מחפשים:

- ‏exceptions.
- ‏deadlocks.
- ‏invalid state.
- ‏duplicate side effects.

---

# ‏117. Shrinking

‏כאשר property test מוצא sequence של 300 events שמפיל invariant, framework צריך לנסות לצמצם אותו לרצף מינימלי.

‏כך RCA נהיה אפשרי.

---

# ‏118. Concurrency Tests

‏במערכת multi-threaded צריך לבדוק races.

‏אבל test שמקווה שה־scheduler “במקרה” ייצור race אינו מספיק.

‏צריך coordination מכוון.

---

# ‏119. Deterministic Concurrency Harness

‏כאשר אפשר, מזריקים barriers/hooks שמכריחים interleavings מסוימים.

‏לדוגמה:

```text
Thread A reads order state
pause
Thread B processes fill
resume A
```

---

# ‏120. Deadlock Tests

‏Stress suite יכול לחפש deadlocks תחת:

- ‏high event rate.
- ‏broker callbacks.
- ‏shutdown.
- ‏reconnect.

---

# ‏121. Cancellation Tests

‏`CancellationToken` semantics צריכים בדיקות.

‏במיוחד shutdown:

```text
stop new work
finish/abort safely
persist required state
exit process
```

---

# ‏122. Shutdown Tests

‏Shutdown באמצע Position לא יכול להתנהג כמו shutdown בזמן Idle.

‏ה־policy חייב להיות מפורש ונבדק.

---

# ‏123. Persistence Tests

‏נבדוק:

- ‏atomicity.
- ‏duplicate writes.
- ‏crash between writes.
- ‏corrupt record.
- ‏partial file.
- ‏transaction rollback.

---

# ‏124. Migration Tests

‏Schema migration חייבת להיבדק על snapshot של גרסה קודמת.

‏לא רק DB ריק.

---

# ‏125. Retention Tests

‏Retention job לא צריך למחוק evidence שעדיין נדרש ל־RCA או replay.

---

# ‏126. Observed vs Inferred Data

‏בדיקות צריכות לשמור הבחנה בין:

```text
Observed
Inferred
Unknown
```

‏Inference לא צריך להפוך בטעות ל־fact לאחר serialization/replay.

---

# ‏127. Confidence Tests

‏אם data quality יורדת, confidence לא אמור לעלות.

‏זה invariant שימושי ל־derived signals.

---

# ‏128. Cross-Provider Tests

‏כאשר יש שני feeds:

- ‏compare timestamps.
- ‏compare prices.
- ‏compare gaps.
- ‏detect divergence.

‏לא מצפים לזהות מוחלטת.

---

# ‏129. Feed Failover Tests

‏צריך לבדוק מעבר:

```text
Provider A
→ degraded
→ Provider B
```

‏כולל generation change ו־stale-state invalidation.

---

# ‏130. Broker Failover הוא נושא אחר

‏לא מניחים שאפשר “להחליף broker” באמצע order כמו feed.

‏Execution ownership ו־account state דורשים semantics שונים.

---

# ‏131. Replay Determinism Hash

‏אפשר לחשב hash על ordered decision stream.

```text
DecisionHash(dataset, version, config)
```

‏אם hash משתנה, יודעים שיש behavioral change.

---

# ‏132. Behavioral Diff

‏כאשר hash משתנה, לא מסתפקים ב־red/green.

‏מציגים:

- ‏Top-1 changed count.
- ‏Trade/No-Trade flips.
- ‏entry price changes.
- ‏exit changes.
- ‏PnL attribution changes.

---

# ‏133. Approval Tests לשינויים מכוונים

‏אם change מכוון משנה 7% מההחלטות, שומרים approval מפורש.

‏כך שינוי התנהגות לא נכנס “בדרך”.

---

# ‏134. Strategy Version Tests

‏Decision צריך לשמור:

```text
StrategyVersion
FeatureVersion
ScoreVersion
ExecutionPolicyVersion
```

‏ואפשר לבדוק שהם קיימים.

---

# ‏135. Config Tests

‏Config invalid צריך להיכשל startup.

‏למשל:

```text
max_position < 0
```

‏או:

```text
signal_ttl <= 0
```

---

# ‏136. Config Cross-Field Validation

‏לא מספיק לבדוק כל field בנפרד.

‏לדוגמה:

```text
entry_timeout > signal_ttl
```

‏יכול להיות configuration לא הגיוני.

---

# ‏137. Production Defaults Tests

‏Default מסוכן לא צריך להחליק.

‏למשל Live mode בלי explicit account/environment confirmation צריך להיכשל.

---

# ‏138. Feature Flag Tests

‏Feature flag חדש צריך בדיקות לשני המצבים:

```text
OFF
ON
```

‏וגם rollback.

---

# ‏139. Kill-Switch Feature לא צריך להיות Feature Flag רגיל

‏Safety critical control צריך מסלול נפרד, לא toggle שאפשר בטעות להשבית כמו UI experiment.

---

# ‏140. Test Failures צריכים להיות Diagnostic

‏Assertion טוב אומר:

```text
Expected no broker submit because quote_age=143ms exceeded max=100ms,
but command BUY ABC 100 was emitted.
```

‏לא רק:

```text
Expected false, got true.
```

---

# ‏141. Preserve Failure Artifacts

‏כאשר replay/fault test נכשל, שומרים:

- ‏seed.
- ‏input events.
- ‏config.
- ‏versions.
- ‏decision trace.

---

# ‏142. Repro Command

‏כל failure משמעותי צריך לאפשר משהו בסגנון:

```text
replay --dataset GS-017 --seed 42817 --version abc123
```

‏כדי לשחזר אותו בקלות.

---

# ‏143. Test Coverage לפי Risk

‏לא כל קוד שווה.

‏Priority גבוה במיוחד ל־:

1. ‏Execution.
2. ‏Risk.
3. ‏Safety.
4. ‏Recovery.
5. ‏Point-in-time correctness.
6. ‏Position accounting.

---

# ‏144. UI Formatting פחות קריטי מ־No-Overfill

‏זה נשמע טריוויאלי, אבל coverage percentage עלול לגרום להשקיע effort במקום הלא נכון.

---

# ‏145. Risk Matrix לבדיקות

‏אפשר לדרג failure לפי:

```text
Probability × Financial Impact × Detectability
```

‏תקלות בעלות impact גבוה ו־detectability נמוך מקבלות יותר בדיקות.

---

# ‏146. Negative Testing

‏צריך לנסות לגרום למערכת לסרב.

‏למשל:

- ‏invalid symbol.
- ‏negative quantity.
- ‏stale quote.
- ‏halt.
- ‏price outside protection.
- ‏risk exceeded.

---

# ‏147. Fuzzing Inputs

‏Parsers ו־API boundaries יכולים לקבל:

- ‏missing field.
- ‏extra field.
- ‏unexpected enum.
- ‏large number.
- ‏zero.
- ‏NaN/Infinity כאשר type מאפשר.

---

# ‏148. Fuzzing אינו Strategy Research

‏המטרה היא robustness של software, לא למצוא Edge אקראי.

---

# ‏149. Broker Message Corpus

‏כדאי לשמור corpus של broker callbacks אמיתיים ומנורמלים.

‏כך adapter changes נבדקים מול edge cases שכבר ראינו.

---

# ‏150. Market Data Corpus

‏שומרים cases כמו:

- ‏crossed market.
- ‏locked market.
- ‏zero size.
- ‏gap.
- ‏burst.
- ‏halt/resume.
- ‏late trade.

---

# ‏151. Incident Corpus

‏כל incident נהיה fixture.

‏זה אחד הנכסים החשובים ביותר של מערכת בוגרת.

---

# ‏152. Testing Research Code

‏Notebook/script מחקרי אינו פטור מבדיקות.

‏צריך לפחות:

- ‏label correctness.
- ‏feature correctness.
- ‏split correctness.
- ‏cost model correctness.
- ‏determinism.

---

# ‏153. Research/Production Parity

‏אם research מחשב feature בדרך אחת ו־live בדרך אחרת, צריך parity test.

---

# ‏154. Golden Feature Vectors

‏ל־event sequence ידוע שומרים expected feature vector.

‏זה מאפשר לזהות drift שקט.

---

# ‏155. Score Breakdown Tests

‏לא בודקים רק final score.

‏בודקים contribution של רכיבים מרכזיים.

---

# ‏156. Explainability Tests

‏Decision log צריך להיות מספיק כדי לענות:

```text
Why A over B?
Why trade?
Why this quantity?
Why this order type?
```

---

# ‏157. PnL Attribution Tests

‏Net PnL צריך להתפרק ל־:

```text
gross move
spread
fees
slippage
impact
other costs
```

‏והסכום צריך להיסגר.

---

# ‏158. Accounting Reconciliation Tests

‏Ledger local מול broker statements צריך להגיע להפרשים מוסברים.

---

# ‏159. Numerical Conservation

‏לדוגמה:

```text
OpeningCash
+ RealizedPnL
- Fees
+ Transfers
= ClosingCash
```

‏לפי model החשבון הרלוונטי.

---

# ‏160. Historical Regression Pack

‏שומרים מספר ימים מסוגים שונים:

- ‏שקט.
- ‏סוער.
- ‏פתיחה חריגה.
- ‏הרבה halts.
- ‏news-heavy.
- ‏provider degradation.

---

# ‏161. Regime Coverage

‏Test dataset אחד אינו מספיק.

‏Behavior צריך להיבחן בכמה regimes.

---

# ‏162. Extreme-but-Plausible Tests

‏לא רק random nonsense.

‏מייצרים מצבים קיצוניים אך אפשריים:

```text
spread widens 10x
volume bursts
quote age spikes
multiple partial fills
```

---

# ‏163. Small-Capital Assumptions

‏גם אם Position Size קטן, צריך לבדוק:

- ‏minimum fees.
- ‏odd lots.
- ‏minimum tick effects.
- ‏small-profit cost dominance.

---

# ‏164. Millisecond-to-Seconds Strategy Tests

‏עבורנו חשוב במיוחד לבדוק:

- ‏50ms delay.
- ‏100ms delay.
- ‏250ms delay.
- ‏500ms delay.
- ‏1s delay.

‏לא משום שכל מספר הוא יעד, אלא כדי לבנות degradation curve.

---

# ‏165. Latency Injection

‏ב־Replay מוסיפים latency distribution.

‏לא רק constant delay.

‏לדוגמה:

```text
P50 = 40ms
P95 = 120ms
P99 = 350ms
```

---

# ‏166. Correlated Latency Tests

‏Latency נוטה לגדול דווקא בזמן burst.

‏לכן test שבו latency independent מהשוק יכול להיות אופטימי.

---

# ‏167. Signal Decay Tests

‏בודקים איך outcome משתנה לפי decision delay.

‏זה מחבר Testing ישירות ל־research.

---

# ‏168. Exit Delay Tests

‏למטרה שלנו Exit latency קריטי.

‏צריך למדוד giveback תחת:

```text
+50ms
+100ms
+250ms
+500ms
```

---

# ‏169. Fee Sensitivity Tests

‏Strategy שמתה אם fee model גדל מעט אינה robust.

‏בודקים conservative scenarios.

---

# ‏170. Slippage Sensitivity Tests

‏כנ"ל ל־slippage.

---

# ‏171. Fill Model Sensitivity

‏מריצים:

```text
optimistic
base
conservative
```

‏אם רק optimistic מנצח — זו נורת אזהרה.

---

# ‏172. Queue Model Sensitivity

‏Passive strategy צריכה להיבדק תחת assumptions שונים ל־queue position.

---

# ‏173. Hidden Liquidity Uncertainty

‏לא בונים test שמניח hidden liquidity מדויקת אם data לא תומך בזה.

---

# ‏174. Venue-Specific Tests

‏רק כאשר strategy תלויה ב־venue behavior.

‏אחרת עדיף contract abstraction.

---

# ‏175. Capability Tests

‏Broker Adapter צריך להגיד במפורש אם capability קיימת.

‏למשל:

```text
supports_midpoint = false
```

‏המערכת לא צריכה silently להמיר semantics.

---

# ‏176. Fallback Tests

‏אם capability אינה זמינה:

- ‏reject intent.
- ‏explicit fallback.
- ‏NO TRADE.

‏לפי policy.

‏לא שינוי שקט.

---

# ‏177. Order Type Mapping Tests

‏Semantic intent צריך להישאר זהה אחרי mapping לברוקר.

---

# ‏178. Price Protection Tests

‏כל dynamic order צריך להיבדק מול:

- ‏cap.
- ‏floor.
- ‏max chase.
- ‏max slippage.

---

# ‏179. Stale Intent Test

‏Intent שנוצר ב־Generation ישן או signal שפג תוקפו לא צריך להישלח.

---

# ‏180. Decision-to-Submit Recheck Test

‏Candidate היה טוב ב־T0.

‏לפני submit ב־T1:

- ‏spread גדל.
- ‏price זז.
- ‏score נפל.

‏המערכת צריכה לפעול לפי policy הנוכחי, לא לפי snapshot ישן.

---

# ‏181. Duplicate Exit Tests

‏שני triggers ל־Exit לא צריכים ליצור שתי מכירות מעבר ל־Position.

---

# ‏182. Fill-After-Exit-Intent Test

‏Entry partial fill נוסף מגיע בזמן שכבר התחלנו Exit.

‏ה־target position logic חייב להישאר עקבי.

---

# ‏183. Flat-but-Working-Order Test

‏Position = 0 אבל נשאר Buy Order פתוח.

‏זו לא באמת Flat state.

‏הבדיקה צריכה לתפוס זאת.

---

# ‏184. Unknown Effect Test

‏Submit timeout.

‏אסור מיד לשלוח שוב.

‏המערכת נכנסת reconciliation.

---

# ‏185. Broker Says Filled, Local Says Canceled

‏Broker truth גובר.

‏Test צריך להוכיח התאוששות בטוחה.

---

# ‏186. Risk Reservation Release Tests

‏Reservation משתחררת רק כאשר outcome ידוע מספיק.

‏לא מיד ב־cancel request.

---

# ‏187. Order-ID Collision Tests

‏IDs חייבים להיות unique לפי scope הנדרש.

---

# ‏188. Reconnect Subscription Tests

‏אחרי reconnect:

- ‏market subscriptions restored.
- ‏broker state reconciled.
- ‏old generation invalidated.

---

# ‏189. Startup Safety Test

‏Startup לא מתחיל Entries לפני reconciliation complete.

---

# ‏190. Warm-Up Tests

‏Rolling features דורשים history.

‏לפני מספיק samples:

```text
feature_valid = false
```

‏או confidence נמוך.

---

# ‏191. Warm-Up אחרי Gap

‏Gap משמעותי יכול לדרוש rebuild/warm-up מחדש.

---

# ‏192. Cold Start vs Resume

‏אלו שני paths שונים וצריכים tests שונים.

---

# ‏193. Test Ownership

‏לכל critical suite צריך owner או subsystem ברור.

‏אחרת failures נשארים יתומים.

---

# ‏194. CI Failure Classification

‏כדאי לסווג:

```text
PRODUCT_BUG
TEST_BUG
INFRA_FAILURE
FLAKY
PERFORMANCE_REGRESSION
DATA_CONTRACT_BREAK
```

---

# ‏195. Warning אינו “ירוק עם רעש”

‏Warning משמעותי צריך triage.

‏במיוחד:

- ‏dropped events.
- ‏sequence gaps.
- ‏timeout retries.
- ‏reconciliation mismatch.

---

# ‏196. RCA לפני התקדמות

‏כאשר CI מגלה warning/error מהותי:

1. ‏מבינים מה קרה.
2. ‏למה קרה.
3. ‏איך למנוע recurrence.
4. ‏מחפשים אזורים דומים שעלולים להיפגע.
5. ‏מוסיפים regression coverage.
6. ‏רק אז ממשיכים.

---

# ‏197. Testing Debt

‏Test איטי, flaky או לא מובן הוא debt אמיתי.

‏לא משאירים אותו ללא owner.

---

# ‏198. Delete Bad Tests

‏Test שלא מגן על behavior, תמיד flaky ואין לו ערך — לפעמים נכון למחוק או להחליף.

‏כמות tests אינה מטרה.

---

# ‏199. Prefer One Strong Test over Ten Weak Tests

‏תרחיש שמוכיח invariant משמעותי עדיף על duplication מכני.

---

# ‏200. Test Architecture צריכה להיות Product

‏Builders, simulators, replay engine, fake clock ו־scenario DSL הם תשתית מוצרית.

‏כדאי להשקיע בהם design טוב.

---

# ‏201. Scenario DSL

‏אפשר לכתוב תרחיש בצורה קריאה:

```text
GivenFreshQuote
GivenCandidateRank1
WhenSubmitEntry
BrokerPartialFills(40)
WhenSignalExpires
BrokerCancelsRemainder
ThenExitFilledQuantity
ThenSystemIsFlat
```

‏כך test מספר סיפור עסקי ברור.

---

# ‏202. Do Not Hide Complexity in Helpers

‏Helper שמבצע 20 פעולות נסתרות הופך test לא קשה להבנה.

‏DSL צריך להיות expressive אבל שקוף.

---

# ‏203. Test Logs צריכים להיות קצרים ב־Success

‏אבל עשירים ב־Failure.

‏אין צורך במגה־לוג בכל CI ירוק.

---

# ‏204. Seeded Randomness

‏אם משתמשים random:

```text
seed = 42817
```

‏נשמר בכל failure.

---

# ‏205. Reproduction First-Class

‏Failure שלא ניתן לשחזר הוא failure שקשה ללמוד ממנו.

---

# ‏206. Test Isolation לפי Symbol

‏Symbol A לא צריך להשפיע על Symbol B אלא אם ה־test בודק cross-sectional behavior.

---

# ‏207. Cross-Sectional Tests

‏Scanner חייב גם tests שבהם שינוי ב־A משפיע על rank של B.

‏כי Ranking הוא יחסי.

---

# ‏208. Universe Mutation Tests

‏Symbol נכנס/יוצא מה־Universe באמצע session.

‏המערכת צריכה להגיב בצורה עקבית.

---

# ‏209. Corporate-Action Fixtures

‏אם historical research כולל splits/corporate actions, צריך fixtures שמונעים false jumps.

---

# ‏210. Session Boundary Tests

‏Pre-market → Regular → After-hours transitions צריכים tests כאשר המערכת תומכת בהם.

---

# ‏211. DST Tests

‏US market time מול local timezone יכול להשתנות בתקופות שבהן שעוני הקיץ אינם מתחלפים באותו יום.

‏לכן משתמשים exchange timezone/calendar ולא offsets קשיחים.

---

# ‏212. Market Calendar Tests

‏Half-days, holidays ו־special sessions צריכים להגיע מ־calendar abstraction.

---

# ‏213. Auction Tests

‏אם בעתיד נשתמש Auctions:

- ‏cutoff.
- ‏late modification.
- ‏imbalance.
- ‏cross.

‏צריכים fixtures exchange-specific versioned.

---

# ‏214. Halt/Reopen Generation Tests

‏Signal שנוצר לפני halt לא אמור בהכרח להיות valid אחרי reopen.

---

# ‏215. Test Metrics

‏כדאי למדוד:

- ‏suite duration.
- ‏flaky rate.
- ‏failure frequency.
- ‏slowest tests.
- ‏mutation score כאשר משתמשים.
- ‏replay coverage.

---

# ‏216. Coverage Metrics בזהירות

‏Line coverage יכול להיות guardrail.

‏לא KPI יחיד.

---

# ‏217. Critical Path Coverage

‏חשוב יותר לדעת:

```text
Have we tested every path that can create, increase or fail to remove financial exposure?
```

---

# ‏218. Test Review

‏Code Review צריך לבדוק גם:

- ‏איזה behavior חדש נוסף?
- ‏איזה invariant השתנה?
- ‏האם צריך test חדש?
- ‏האם test ישן עכשיו מטעה?

---

# ‏219. Change Risk Classification

‏שינוי UI קטן אינו כמו שינוי ב־execution ledger.

‏CI depth יכול להשתנות לפי risk class.

---

# ‏220. Pre-Merge Gates

‏לפני merge של שינוי critical:

```text
Fast green
Relevant integration green
Relevant replay green
No unexplained warnings
```

---

# ‏221. Release Gates

‏לפני Production version:

- ‏replay pack.
- ‏recovery scenarios.
- ‏safety scenarios.
- ‏config validation.
- ‏broker conformance smoke.

---

# ‏222. Paper אינו תחליף ל־Tests

‏Paper Trading יכול לחשוף integration gaps.

‏אבל הוא לא מחליף deterministic regression suite.

---

# ‏223. Live Small-Size אינו תחליף ל־Tests

‏Live validation בודק realism.

‏לא משתמשים בכסף אמיתי כדי למצוא bugs שהיה אפשר למצוא ב־unit test.

---

# ‏224. Backtest אינו Test Suite

‏Backtest ירוק אינו אומר software correct.

‏הוא experiment.

‏Testing ו־Research הם disciplines שונים אך מחוברים.

---

# ‏225. Test Strategy לרובוט שלנו

‏Baseline מומלץ:

```text
1. Fast deterministic tests on every change
2. Component/integration for data + execution boundaries
3. Small golden replay pack on every important change
4. Larger replay/performance/fault suites separately
5. Paper/shadow before behavior-changing live release
6. Small-live only after all previous gates pass
```

---

# ‏226. מה חייב להיות מהיר במיוחד

‏ב־Fast suite:

- ‏feature math.
- ‏filters.
- ‏ranking.
- ‏state machines.
- ‏risk rules.
- ‏execution invariants.
- ‏serialization contracts.

---

# ‏227. מה מותר להיות איטי יותר

- ‏full-day replay.
- ‏soak.
- ‏large stress.
- ‏paper broker flows.
- ‏cross-provider comparisons.

---

# ‏228. Acceptance Scenario מרכזי לרובוט שלנו

```text
Market event arrives
→ state becomes fresh
→ scanner ranks candidate
→ pre-submit recheck passes
→ protected entry intent emitted
→ broker partially fills
→ price reaches small favorable move
→ exit intent emitted immediately
→ remaining entry canceled safely
→ exit completes
→ system flat
→ net PnL and costs reconciled
→ complete audit trail exists
```

---

# ‏229. Acceptance Scenario של NO TRADE

```text
candidate ranks first
but spread + slippage + latency budget consume expected edge
→ NO TRADE
→ reason preserved
```

‏זה תרחיש הצלחה, לא כישלון.

---

# ‏230. Acceptance Scenario של Failure

```text
submit sent
connection drops
effect unknown
→ block duplicate submit
→ reconcile broker
→ discover working order
→ continue state safely
```

---

# ‏231. Acceptance Scenario של Safety

```text
feed becomes stale
→ block entries
→ preserve existing position management
→ recover feed
→ rebuild freshness
→ require readiness before resume
```

---

# ‏232. Practitioner Secret — Bugs אוהבים Boundaries

‏ה־happy path בדרך כלל עובד מוקדם.

‏הבעיות האמיתיות נמצאות בין:

```text
before/after
sent/not-known
partial/full
fresh/stale
connected/disconnected
flat/almost-flat
```

---

# ‏233. Practitioner Secret — “Rare” × Money = Important

‏Race שקורה פעם בחצי שנה אבל יכול להכפיל Position הוא critical.

‏Frequency נמוך אינה סיבה להתעלם.

---

# ‏234. Practitioner Secret — Perfect Mocks Create False Confidence

‏אם mock broker תמיד מחזיר ACK בסדר יפה, ה־Execution Engine לא באמת נבדק.

---

# ‏235. Practitioner Secret — Test Data Can Leak Future Too

‏גם test fixture יכול לבנות state בלתי־אפשרי מבחינה כרונולוגית.

‏לכן synthetic fixtures צריכים causal review.

---

# ‏236. Practitioner Secret — Slow Tests Change Human Behavior

‏כאשר suite איטי מדי:

```text
developers run fewer tests
→ feedback arrives later
→ failures become harder to localize
→ confidence drops
```

‏Performance של tests הוא חלק מ־engineering quality.

---

# ‏237. Practitioner Secret — Flaky Test Normalizes Ignoring Red

‏ברגע שאנשים מאמינים ש־“CI לפעמים אדום סתם”, מערכת ההגנה נשברת.

---

# ‏238. Practitioner Secret — Assertions Need Economic Meaning

‏במערכת מסחר assertion כמו:

```text
result.Count == 3
```

‏פחות חשוב לעיתים מ־:

```text
No order exceeds remaining allowed exposure.
```

---

# ‏239. Practitioner Secret — Reproduce Production Timing, Not Just Inputs

‏אותם events עם timing אחר יכולים לתת outcome אחר.

‏לכן incident replay שומר גם temporal behavior.

---

# ‏240. Practitioner Secret — “Works in Replay” Is Not Final Proof

‏Replay יכול לפספס:

- ‏broker latency.
- ‏hidden liquidity.
- ‏queue uncertainty.
- ‏provider jitter.
- ‏real partial-fill behavior.

‏לכן Evidence עולה בשלבים.

---

# ‏241. Practitioner Secret — Safety Tests Need Priority Semantics

‏בעת overload:

```text
exit > cancel > reconcile > risk > new entry
```

‏לפי policy שלנו.

‏לא מספיק שכל message “בסוף” מעובד.

---

# ‏242. Practitioner Secret — Compare Non-Fills Too

‏אם משווים execution tactic רק על trades שמולאו, יש selection bias.

‏צריך לכלול missed opportunities.

---

# ‏243. Practitioner Secret — Test the Rejected Path

‏מערכת טובה צריכה להיות מצוינת גם בלהגיד “לא”.

‏Reject path הוא חלק מרכזי מה־strategy.

---

# ‏244. Practitioner Secret — Invariants Survive Refactors

‏Implementation tests נשברים בכל refactor.

‏Invariant tests מגנים על behavior גם כשהמבנה הפנימי משתנה.

---

# ‏245. Practitioner Secret — Historical Bugs Are Gold

‏רשימת bugs ישנים היא בסיס מצוין ל־regression corpus.

---

# ‏246. Practitioner Secret — Test Suite Itself Needs Observability

‏צריך לדעת:

- ‏למה הוא איטי.
- ‏איפה flakiness.
- ‏אילו suites כמעט לא נכשלות כי אינן בודקות מספיק.

---

# ‏247. Definition of Done לשינוי

‏שינוי משמעותי אינו Done עד ש:

- ‏behavior הוגדר.
- ‏tests מתאימים קיימים.
- ‏fast suite ירוק.
- ‏relevant integration/replay ירוק.
- ‏אין warning לא מוסבר.
- ‏RCA נעשה אם התגלה כשל משמעותי.

---

# ‏248. Definition of Done ל־Testing Layer

‏שכבת הבדיקות עצמה נחשבת בריאה כאשר:

- ‏Fast suite מהיר.
- ‏flaky tests כמעט לא קיימים.
- ‏critical invariants מכוסים.
- ‏replay reproducible.
- ‏fault scenarios קיימים.
- ‏production incidents הופכים ל־tests.
- ‏failure output diagnostic.

---

# ‏249. Checklist קצר לפני Merge

- ‏האם behavior חדש קיבל test?
- ‏האם failure path נבדק?
- ‏האם boundary נבדק?
- ‏האם test deterministic?
- ‏האם הוא מהיר מספיק לשכבה שבה הוא נמצא?
- ‏האם הוא בודק behavior ולא implementation detail?
- ‏האם warning חדש מוסבר?
- ‏האם יש צורך ב־replay/fault scenario נוסף?

---

# ‏250. מה לזכור בעל פה

1. ‏`Coverage != Confidence`.
2. ‏Critical invariants חשובים יותר מ־line count.
3. ‏זמן וסדר הם inputs של מערכת מסחר.
4. ‏`Sleep` אינו synchronization strategy.
5. ‏Replay חייב להיות deterministic ו־point-in-time correct.
6. ‏Partial fills, duplicates ו־unknown effect הם normal cases.
7. ‏Safety ו־recovery חייבים fault tests.
8. ‏Fast CI הוא requirement, לא luxury.
9. ‏כל incident חשוב צריך להפוך ל־regression test.
10. ‏בדיקה טובה מגינה על כסף, state ו־truth — לא רק על פונקציה.

---

# ‏251. החיבור לרובוט שלנו

‏הרובוט שלנו רגיש במיוחד ל־latency, freshness ו־small net edge.

‏לכן test suite שלו חייב להוכיח שוב ושוב:

```text
fresh enough
fast enough
correct rank
safe execution
no duplicate exposure
fast exit
realistic costs
complete recovery
```

‏אם אחד מהחלקים האלה אינו מוכח, תוצאת Strategy יפה לבדה אינה מספיקה.

---

# ‏252. המעבר לשלב הבא

‏אחרי שבנינו דרך לבדוק correctness, failure modes, performance ו־recovery, אפשר לעבור לשאלה הבאה:

> ‏איך בונים את המערכת עצמה כך שתהיה מהירה ויעילה בלי optimization theatre ובלי לפגוע ב־correctness?

‏זה יהיה שלב 54 — `Performance Best Practices`.
