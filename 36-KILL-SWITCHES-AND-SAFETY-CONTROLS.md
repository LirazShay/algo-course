# ‏שלב 36 — `Kill Switches` ו־Safety Controls: לעצור סיכון לפני שהוא הופך לנזק

> ‏מטרת הפרק: לבנות שכבת Safety עצמאית שמסוגלת לעצור או לצמצם פעילות מסחר גם כאשר ה־Strategy עצמה טועה, כאשר הנתונים אינם אמינים, כאשר הברוקר במצב חלקי, כאשר latency מתדרדר או כאשר מצב החשבון אינו ברור.
>
> ‏העיקרון המרכזי: **מנגנון בטיחות טוב אינו רק כפתור STOP. הוא מערכת של Gates, Circuit Breakers, מצבי Safety ו־Recovery Contracts שמחליטה אילו פעולות מותרות כאשר רמת הוודאות יורדת.**
>
> ‏הפרק הוא ארכיטקטוני והנדסי. אין כאן הבטחה לרווח או המלצה לבצע מסחר אמיתי; המטרה היא להקטין סיכונים תפעוליים במערכת אוטומטית.

---

# ‏1. למה `Kill Switch` הוא רכיב נפרד

‏אם ה־Strategy היא זו שמחליטה גם מתי לעצור את עצמה, אנחנו מניחים שהרכיב שעלול להיות שגוי גם יזהה את הטעות שלו בזמן.

‏זו הנחה חלשה.

‏לכן Safety צריך להיות לפחות חלקית בלתי־תלוי ב־Strategy.

```text
Market Data
    ↓
Strategy
    ↓
Risk Engine
    ↓
Safety Gate
    ↓
Execution Engine
    ↓
Broker
```

‏גם אם ה־Strategy אומרת `BUY`, ה־Safety Gate יכול לומר `DENIED`.

---

# ‏2. Safety אינו רק Risk Management

‏`Risk Management` עוסק בדרך כלל בשאלות כמו:

- ‏כמה הון מותר להקצות.
- ‏כמה Position Size מותר.
- ‏מה החשיפה הכוללת.
- ‏מהו Daily Loss Limit.

‏Safety Controls רחבים יותר.

‏הם שואלים גם:

- ‏האם הנתונים אמינים?
- ‏האם הברוקר מסונכרן?
- ‏האם ה־clock תקין?
- ‏האם queues תקועים?
- ‏האם אנחנו יודעים מה מצב ה־orders?
- ‏האם המערכת רצה בגרסה שאושרה?
- ‏האם יש split brain?
- ‏האם מותר בכלל ליצור risk חדש כרגע?

---

# ‏3. ארבעה סוגי Safety בסיסיים

‏נוח לחשוב על Safety בארבע שכבות:

```text
Prevent
Detect
Contain
Recover
```

‏`Prevent` מונע פעולה מסוכנת מראש.

‏`Detect` מזהה הידרדרות.

‏`Contain` מצמצם blast radius.

‏`Recover` מחזיר את המערכת לפעולה רק אחרי שהמצב הוכח מחדש.

---

# ‏4. לא כל עצירה צריכה להיות `FULL_HALT`

‏עצירה בינארית היא גסה מדי.

‏במערכת מסחר אנחנו צריכים דרגות.

```text
NORMAL
BLOCK_NEW_ENTRIES
CANCEL_PENDING_ENTRIES
EXIT_ONLY
CANCEL_ALL
FLATTEN
FULL_HALT
```

---

# ‏5. `BLOCK_NEW_ENTRIES`

‏במצב זה אסור ליצור חשיפה חדשה.

‏אבל מותר:

- ‏לעדכן state.
- ‏לקבל market data.
- ‏לעקוב אחרי positions.
- ‏לנהל exits.
- ‏לבטל entry orders קיימים לפי policy.

‏זה בדרך כלל safety action ראשון וזול יחסית.

---

# ‏6. `CANCEL_PENDING_ENTRIES`

‏כאן לא רק חוסמים entries חדשים.

‏גם מנסים לבטל orders קיימים שעדיין עלולים להגדיל exposure.

‏חשוב:

> ‏`Cancel requested` אינו `Cancel confirmed`.

‏Order יכול להתמלא בזמן שהביטול בדרך.

---

# ‏7. `EXIT_ONLY`

‏זה מצב חשוב במיוחד.

‏המערכת:

- ‏לא מגדילה exposure.
- ‏לא פותחת trades חדשים.
- ‏כן ממשיכה לנהל positions קיימים.
- ‏כן יכולה לשלוח פעולות שמקטינות risk.

‏במקרים רבים זה בטוח יותר מ־`FULL_HALT`.

---

# ‏8. למה `FULL_HALT` אינו תמיד הפעולה הבטוחה ביותר

‏אם יש Position פתוח ו־`FULL_HALT` פשוט מפסיק את כל הלוגיקה, Position עלול להישאר ללא ניהול.

‏לכן צריך להבדיל בין:

```text
Stop taking new risk
```

‏לבין:

```text
Stop all software activity
```

‏אלה אינם אותו דבר.

---

# ‏9. `CANCEL_ALL`

‏`CANCEL_ALL` מנסה לבטל working orders.

‏אבל הוא אינו מבטיח שאין fills חדשים בדרך.

‏לכן אחרי הפעולה צריך:

1. ‏לקבל acknowledgements.
2. ‏למשוך open orders מהברוקר.
3. ‏למשוך positions.
4. ‏למשוך executions/fills.
5. ‏לבצע reconciliation.

---

# ‏10. `FLATTEN`

‏`FLATTEN` פירושו ניסיון להקטין positions לאפס.

‏זו פעולה חזקה מאוד.

‏היא אינה שקולה ל־“שלח Market Sell לכולם”.

‏צריך לשקול:

- ‏Market status.
- ‏Liquidity.
- ‏Halt.
- ‏Spread.
- ‏Partial fills.
- ‏Order restrictions.
- ‏Existing working exits.
- ‏Duplicate exit risk.

---

# ‏11. `FULL_HALT`

‏`FULL_HALT` מתאים כאשר גם המשך ניהול אוטומטי עצמו אינו אמין.

‏לדוגמה:

- ‏state corruption.
- ‏בלבול בזהות account.
- ‏duplicate active executor.
- ‏credentials/environment mismatch.
- ‏critical invariant violation.

‏במצב כזה ייתכן שנדרשת התערבות ידנית.

---

# ‏12. Safety Level צריך להיות explicit

‏לא כדאי לייצג Safety באמצעות עשרה booleans:

```text
isPaused
isKilled
isBlocked
isRiskOff
isBrokerBad
...
```

‏במקום זאת עדיף מודל מפורש.

```text
SafetyMode
  NORMAL
  BLOCK_NEW_ENTRIES
  EXIT_ONLY
  FULL_HALT
```

‏לצדו אפשר להחזיק reasons ו־capabilities מפורטים.

---

# ‏13. `Safety Reason Codes`

‏כל מעבר Safety צריך סיבה קבועה.

```text
DATA_STALE
DATA_COVERAGE_LOW
BROKER_DISCONNECTED
BROKER_STATE_UNKNOWN
POSITION_MISMATCH
ORDER_STATE_UNKNOWN
DAILY_LOSS_LIMIT
LATENCY_BREACH
CLOCK_DRIFT
QUEUE_BACKLOG
PROCESS_DUPLICATE
MANUAL_KILL
CONFIG_MISMATCH
```

---

# ‏14. Primary ו־Secondary Reasons

‏אירוע אחד יכול לגרום לכמה תקלות.

‏לדוגמה:

```text
primary: BROKER_DISCONNECTED
secondary:
  - ORDER_STATE_UNKNOWN
  - POSITION_FRESHNESS_EXCEEDED
```

‏זה חשוב ל־RCA.

---

# ‏15. Safety State צריך להיות `latched`

‏בחלק מהאירועים אסור לחזור ל־`NORMAL` אוטומטית ברגע שהmetric משתפר.

‏לדוגמה:

```text
POSITION_MISMATCH
UNKNOWN_ORDER_EFFECT
DUPLICATE_EXECUTOR
```

‏אלה צריכים להישאר latched עד reconciliation ואישור מתאים.

---

# ‏16. מהו `Latched Safety`

‏מצב latched אומר:

```text
triggered once
→ remains active
→ explicit recovery required
```

‏גם אם הטריגר המקורי נעלם.

---

# ‏17. מתי אפשר Auto-Recover

‏יש אירועים שבהם auto-recovery סביר יותר.

‏לדוגמה:

- ‏קפיצת latency קצרה.
- ‏ירידה זמנית ב־coverage.
- ‏queue spike קצר.

‏אבל גם אז צריך hysteresis.

---

# ‏18. Hysteresis

‏אם threshold הוא:

```text
trip if freshness > 2s
```

‏לא כדאי לחזור מיד כש־freshness יורד ל־1.99s.

‏אפשר להגדיר:

```text
trip: > 2.0s
recover candidate: < 1.0s continuously for 10s
```

‏כך נמנעים מ־flapping.

---

# ‏19. Cooldown

‏אחרי אירוע Safety אפשר לחייב תקופת יציבות.

```text
healthy continuously for N seconds
```

‏לפני שחוזרים לפעילות.

---

# ‏20. Safety Precedence

‏אם כמה מנגנונים דורשים מצבים שונים, המצב המחמיר גובר.

```text
NORMAL
< BLOCK_NEW_ENTRIES
< EXIT_ONLY
< FULL_HALT
```

‏אבל precedence צריך להיות מוגדר במפורש.

---

# ‏21. Scope של Kill Switch

‏לא כל אירוע צריך להשבית את כל המערכת.

‏אפשר להגדיר scope:

```text
GLOBAL
ACCOUNT
STRATEGY
SYMBOL
VENUE
DATA_PROVIDER
BROKER
```

---

# ‏22. Symbol-Level Block

‏אם Symbol מסוים סובל מ־data corruption או halt, אפשר לחסום רק אותו.

‏אין צורך לעצור 4,000 symbols אם הבעיה מקומית.

---

# ‏23. Strategy-Level Block

‏אם אסטרטגיה אחת חורגת מהתנהגות הצפויה, אפשר לעצור אותה בלי לעצור strategy אחרת.

‏גם אם כרגע יש לנו strategy אחת, כדאי שהמודל יהיה נכון.

---

# ‏24. Account-Level Block

‏אם יש uncertainty לגבי account positions או buying power, אפשר לחסום activity לכל החשבון.

---

# ‏25. Global Block

‏אירועים כמו:

- ‏duplicate execution process.
- ‏config corruption.
- ‏clock failure חמור.
- ‏database consistency failure.

‏עשויים להצדיק global safety mode.

---

# ‏26. Manual Kill Switch

‏צריך להיות למפעיל מנגנון ידני ברור.

‏הוא צריך להיות:

- ‏מהיר.
- ‏פשוט.
- ‏observable.
- ‏auditable.
- ‏idempotent.

---

# ‏27. Manual Kill אינו Toggle יפה ב־UI בלבד

‏ה־UI הוא רק דרך להוציא command.

‏הפקודה עצמה צריכה לעבור דרך שכבת control אמינה.

```text
Operator
  ↓
Safety Command
  ↓
Durable Safety State
  ↓
Execution Gate
```

---

# ‏28. Manual Action חייב Audit

‏נרשום לפחות:

```text
who
when
command
scope
reason
previous_state
new_state
correlation_id
```

---

# ‏29. Resume צריך להיות קשה יותר מ־Stop

‏Stop צריך להיות קל ומהיר.

‏Resume צריך לדרוש יותר ראיות.

‏זה intentional asymmetry.

---

# ‏30. למה Resume מסוכן

‏כאשר עוצרים, מצמצמים risk.

‏כאשר חוזרים, מתחילים שוב ליצור risk.

‏לכן `Resume` הוא החלטת risk-increasing.

---

# ‏31. `Resume Contract`

‏אפשר להגדיר:

```text
CanResume =
    marketDataHealthy
    && brokerHealthy
    && reconciliationClean
    && noUnknownOrders
    && positionTruthKnown
    && riskWithinLimits
    && clockHealthy
    && noCriticalLatch
```

---

# ‏32. Resume אינו `connected == true`

‏Connection אינו הוכחת readiness.

‏אחרי reconnect צריך synchronization.

---

# ‏33. Safety Gate לפני כל Entry

‏כל entry חייב לעבור gate ברגע האחרון.

```text
Strategy Intent
   ↓
Risk Approval
   ↓
Safety Approval
   ↓
Execution
```

---

# ‏34. למה בדיקה אחת בתחילת loop לא מספיקה

‏מצב Safety יכול להשתנות בין:

```text
signal generation
```

‏לבין:

```text
order submit
```

‏לכן צריך pre-submit recheck.

---

# ‏35. Safety Epoch

‏אפשר לשמור מספר גרסה למצב Safety.

```text
safety_epoch = 42
```

‏Order Intent שנוצר תחת epoch ישן יכול להיפסל אם מצב Safety השתנה.

---

# ‏36. Stale Intent Protection

‏אם Intent נוצר לפני kill event, אסור לו “לזלוג” לביצוע אחרי שהמערכת נעצרה.

‏לכן כל queue item צריך זמן ו־epoch.

---

# ‏37. Queue Draining

‏כאשר עוברים ל־`BLOCK_NEW_ENTRIES`, צריך להחליט מה קורה ל־queued intents.

‏ברוב המקרים entry intents ישנים צריכים להידחות.

---

# ‏38. Safety Enforcement קרוב ל־Execution

‏ככל שה־Safety Gate קרוב יותר ל־broker adapter, קשה יותר לעקוף אותו בטעות.

‏ה־Strategy לבדה אינה enforcement point מספיק טוב.

---

# ‏39. Defense in Depth

‏אפשר לבדוק safety בכמה שכבות:

```text
Strategy
Risk Engine
Execution Engine
Broker Adapter
```

‏אבל צריך Source of Truth אחד למצב Safety כדי שלא יהיו סתירות.

---

# ‏40. Data Safety

‏ה־Scanner תלוי בנתונים.

‏אם הנתונים אינם אמינים, prediction אינו אמין.

‏לכן Data Health הוא חלק מה־Safety System.

---

# ‏41. Freshness Gate

‏Entry חדש יכול להיחסם אם data age גדול מדי.

‏ה־threshold צריך להתאים ל־holding horizon.

‏לרובוט של שניות, 5 שניות stale אינן “קצת ישנות”.

---

# ‏42. Coverage Gate

‏Whole-market Scanner דורש תמונת שוק רחבה.

‏אם רק 45% מה־Universe fresh, Rank #1 אינו בהכרח Rank #1 אמיתי.

‏לכן נמדוד:

```text
Fresh Coverage Ratio
```

---

# ‏43. Partial Data Failure

‏לא כל outage הוא disconnect מלא.

‏אפשר לקבל:

- ‏stream חי לחלק מה־symbols.
- ‏quotes בלי trades.
- ‏trades בלי quotes.
- ‏subscription silently dropped.

‏Safety חייב לזהות degradation חלקי.

---

# ‏44. Sequence Gap

‏פער ב־sequence יכול להעיד שאירועים אבדו.

‏במערכת שתומכת sequence tracking, gap משמעותי יכול לחייב resync או block.

---

# ‏45. Out-of-Order Burst

‏כמות חריגה של out-of-order events יכולה להעיד על feed degradation.

‏גם אם connection עדיין פתוח.

---

# ‏46. Cross-Provider Divergence

‏אם Data Provider והברוקר מציגים מחירים שונים מאוד, אפשר להפעיל safety gate.

‏אבל divergence צריך להיות:

- ‏side-aware.
- ‏time-aligned.
- ‏aware of feed semantics.

---

# ‏47. Market Data Warm-Up

‏אחרי reconnect אי אפשר בהכרח לפתוח trades מיד.

‏Rolling features צריכים history.

‏לכן:

```text
feed healthy
```

‏אינו זהה ל־:

```text
features warmed up
```

---

# ‏48. Broker Safety

‏Broker Health הוא תנאי עצמאי.

‏נבדוק יותר מ־socket connectivity.

---

# ‏49. Broker Ready Matrix

‏אפשר לדרוש:

```text
session_authenticated
orders_snapshot_fresh
positions_snapshot_fresh
executions_synced
account_state_fresh
no_unknown_effects
```

---

# ‏50. Unknown Order Effect

‏אם שלחנו request ואיננו יודעים אם הברוקר קיבל אותו, מצב הבטיחות צריך להשתנות.

‏אין לשלוח retry עיוור של order שעלול להיות קיים.

---

# ‏51. Position Mismatch

‏אם local position שונה מה־broker position:

```text
local != broker
```

‏אין לפתוח risk חדש עד reconciliation.

---

# ‏52. Open Order Mismatch

‏אותו כלל לגבי working orders.

‏Order שהברוקר מכיר והמערכת לא מכירה הוא `orphan order`.

---

# ‏53. Duplicate Executor

‏שני processes שיכולים לשלוח orders לאותו account הם סיכון קריטי.

‏זיהוי duplicate active writer צריך בדרך כלל לגרום ל־hard safety action.

---

# ‏54. Heartbeat אינו מספיק

‏שני processes יכולים להיות “חיים”.

‏צריך ownership/fencing mechanism ברור.

---

# ‏55. Fencing Token

‏אפשר להשתמש ב־monotonic ownership epoch.

```text
executor_epoch = 128
```

‏רק owner של epoch הנוכחי רשאי לבצע actions.

---

# ‏56. Risk Safety

‏חריגה מגבולות risk היא trigger טבעי ל־Safety.

‏אבל גם כאן צריך דרגות.

---

# ‏57. Per-Trade Risk Limit

‏אם position size המבוקש חורג מהמותר, חוסמים את ה־order הספציפי.

‏אין צורך בהכרח לעצור את כל המערכת.

---

# ‏58. Exposure Limit

‏אם gross/net exposure חורג מהתקציב, נחסום risk-increasing actions.

---

# ‏59. Daily Loss Limit

‏אפשר להגדיר daily loss trigger.

‏חשוב שהחישוב יגדיר במפורש:

- ‏Realized PnL.
- ‏Unrealized PnL.
- ‏Fees.
- ‏Currency conversion.
- ‏reset boundary.

---

# ‏60. Loss Velocity

‏לא רק הפסד מצטבר חשוב.

‏סדרה מהירה מאוד של הפסדים יכולה להעיד על תקלה או regime mismatch.

---

# ‏61. Drawdown Safety

‏אפשר לחבר drawdown thresholds למצב safety.

‏אבל threshold אינו תחליף ל־RCA.

---

# ‏62. Loss Streak

‏Loss streak יכול לשמש signal לבדיקה.

‏הוא לא בהכרח אומר שהמערכת שבורה.

‏צריך להיזהר מ־overreaction ל־variance טבעי.

---

# ‏63. Execution Safety

‏גם Execution metrics יכולים להפעיל Safety.

---

# ‏64. Fill Latency Breach

‏אם `submit→fill` מתארך משמעותית, edge קצר יכול להיעלם.

‏אפשר לחסום entries חדשים עד בירור.

---

# ‏65. Ack Latency Breach

‏אם broker ACK נהיה איטי באופן חריג, uncertainty window גדל.

---

# ‏66. Slippage Breach

‏אם realized slippage חורג משמעותית מהמודל, אפשר להוריד exposure או לעצור entries.

---

# ‏67. Fill Ratio Collapse

‏אסטרטגיה שתלויה ב־passive fills יכולה להפוך ללא רלוונטית אם fill rate קורס.

---

# ‏68. Reject Rate Spike

‏עלייה חדה ב־broker rejects יכולה להעיד על:

- ‏API issue.
- ‏contract mismatch.
- ‏account restriction.
- ‏invalid order parameters.
- ‏market-state change.

‏לא ממשיכים לירות retries.

---

# ‏69. Cancel Failure Rate

‏אם cancellations אינם מאושרים בזמן, pending exposure גדל.

---

# ‏70. Unknown-State Rate

‏מספר גבוה של orders במצב `UNKNOWN` הוא trigger חשוב יותר לעיתים ממספר errors רגילים.

---

# ‏71. Latency Safety

‏Latency אינו רק metric performance.

‏ב־short horizon הוא יכול להיות risk factor.

---

# ‏72. End-to-End Decision Latency

‏נמדוד:

```text
market event
→ feature update
→ ranking
→ decision
→ risk
→ safety
→ submit
```

---

# ‏73. Tail Latency

‏P50 טוב אינו מספיק.

‏P99 רע יכול לגרום דווקא לטריידים הכי מסוכנים.

---

# ‏74. Queue Age

‏Queue depth לבדו אינו מספיק.

‏Intent בן 500ms יכול להיות stale גם אם התור קצר.

---

# ‏75. Backpressure Safety

‏כאשר pipeline אינו עומד בקצב, עדיף לעיתים לדחות עבודה ישנה מאשר לבצע החלטות stale.

---

# ‏76. Clock Safety

‏Clock drift יכול לשבור:

- ‏freshness.
- ‏latency measurement.
- ‏ordering.
- ‏TTL.
- ‏reconciliation.

---

# ‏77. Clock Drift Trigger

‏אם clock offset חורג מהטווח המותר, אפשר לחסום entries.

---

# ‏78. Monotonic Clock

‏Timers פנימיים צריכים להשתמש במקור monotonic כאשר מתאים.

‏Wall clock ו־elapsed time אינם אותו דבר.

---

# ‏79. Infrastructure Safety

‏גם מערכת בריאה עסקית יכולה להיות בסיכון בגלל infrastructure.

---

# ‏80. Memory Pressure

‏Memory pressure קיצוני יכול לגרום pauses, GC spikes או crash.

‏אפשר להפחית פעילות לפני failure מוחלט.

---

# ‏81. Disk Pressure

‏אם disk כמעט מלא, persistence/logging עלולים להיכשל.

‏מערכת שאינה יכולה לכתוב state קריטי לא צריכה להמשיך ליצור risk כאילו הכול תקין.

---

# ‏82. Database Failure

‏אם durability layer אינה זמינה, צריך להחליט במפורש האם entries מותרים.

‏ברוב המערכות conservative answer יהיה לא.

---

# ‏83. Event Bus Failure

‏אם events קריטיים אינם עוברים בין components, local health checks אינם מספיקים.

---

# ‏84. Dependency Budget

‏לכל dependency אפשר להגדיר:

```text
healthy
slow
stale
unavailable
unknown
```

‏ולמפות כל מצב ל־allowed capabilities.

---

# ‏85. Capability-Based Safety

‏במקום לשאול:

```text
Is system healthy?
```

‏עדיף לשאול:

```text
CanOpenNewPosition?
CanIncreasePosition?
CanCancel?
CanExit?
CanReconcile?
```

---

# ‏86. Safety Matrix

‏דוגמה:

| מצב | Entry | Increase | Cancel | Exit | Reconcile |
|---|---:|---:|---:|---:|---:|
| `NORMAL` | כן | כן | כן | כן | כן |
| `BLOCK_NEW_ENTRIES` | לא | לא | כן | כן | כן |
| `EXIT_ONLY` | לא | לא | כן | כן | כן |
| `FULL_HALT` | לא | לא | תלוי | תלוי | כן |

---

# ‏87. Risk-Reducing Action

‏לא כל Sell הוא risk-reducing.

‏אם יש Short Position, Buy יכול להקטין risk.

‏לכן ההחלטה צריכה להתבסס על שינוי exposure ולא על action name בלבד.

---

# ‏88. Position-Aware Safety

‏Safety Gate צריך לדעת:

```text
current_position
working_orders
proposed_order
expected_resulting_exposure
```

---

# ‏89. Pending Exposure

‏Working orders הם exposure פוטנציאלי.

‏אי אפשר לחשב safety רק לפי current positions.

---

# ‏90. Duplicate Exit Protection

‏במצב panic קל לשלוח כמה exit orders לאותו Position.

‏זה עלול להפוך Long ל־Short.

‏לכן flatten logic חייב להיות position/order aware.

---

# ‏91. Cancel Before Flatten?

‏לעיתים קודם מבטלים working orders ואז מחליטים איך להקטין Position.

‏אבל אין כלל אוניברסלי.

‏צריך להתחשב במצב השוק וב־unknown fills.

---

# ‏92. Flatten State Machine

‏Flatten עצמו צריך lifecycle.

```text
FLATTEN_REQUESTED
CANCELING_CONFLICTING_ORDERS
RECONCILING
SUBMITTING_EXIT
PARTIALLY_FLATTENED
FLAT_CONFIRMED
FAILED_OR_UNKNOWN
```

---

# ‏93. `FLAT_CONFIRMED`

‏המערכת אינה flat כי local quantity היא אפס.

‏צריך broker confirmation/reconciliation.

---

# ‏94. Halts

‏אם Symbol halted, flatten מיידי עשוי להיות בלתי־אפשרי.

‏Safety צריך לייצג:

```text
risk exists
but action currently constrained
```

---

# ‏95. Fast Market

‏ב־fast market aggressive emergency execution עלול להיות יקר.

‏Safety צריך לאזן בין execution cost לבין risk of remaining exposed.

---

# ‏96. No Universal Emergency Order Type

‏אין Order Type אחד שהוא תמיד “הבטוח ביותר”.

‏הבחירה תלויה ב:

- ‏urgency.
- ‏liquidity.
- ‏spread.
- ‏market status.
- ‏broker capabilities.

---

# ‏97. Broker-Native Safety

‏אם הברוקר תומך ביכולות native כמו server-side protective orders או cancel-all, אפשר להשתמש בהן כשכבת הגנה נוספת.

‏אבל לא מניחים שהן זהות בין brokers.

---

# ‏98. Client-Side Safety

‏Client-side stop logic מאפשר גמישות.

‏אבל הוא תלוי בכך שהאפליקציה והחיבור חיים.

---

# ‏99. Layered Protection

‏לעיתים נכון לשלב:

```text
client-side monitoring
+
broker-native protective mechanism
```

‏אם semantics ברורים ונבדקו.

---

# ‏100. Dead Man's Switch Concept

‏`Dead Man's Switch` הוא מנגנון שבו היעדר heartbeat צפוי מפעיל פעולה בטיחותית.

‏לדוגמה, אם execution controller מפסיק לחדש lease.

---

# ‏101. למה Heartbeat צריך להיות Meaningful

‏Heartbeat של process חי אינו מספיק.

‏עדיף heartbeat שמעיד שהרכיב:

- ‏מתקדם.
- ‏קורא state.
- ‏יכול לבצע reconciliation.
- ‏אינו stuck.

---

# ‏102. Watchdog

‏Watchdog יכול לזהות:

- ‏event loop stall.
- ‏queue frozen.
- ‏missing heartbeat.
- ‏state transition timeout.

---

# ‏103. Watchdog Independence

‏אם ה־watchdog רץ באותו thread שננעל, הוא עלול לא לזהות דבר.

‏לכן independence היא שאלה ארכיטקטונית חשובה.

---

# ‏104. Safety Control Plane

‏כדאי להפריד רעיונית בין:

```text
Trading Data Plane
```

‏לבין:

```text
Safety Control Plane
```

---

# ‏105. Control Plane Responsibilities

‏הוא יכול להחזיק:

- ‏Safety state.
- ‏manual commands.
- ‏latches.
- ‏reason codes.
- ‏operator authorization.
- ‏resume workflow.

---

# ‏106. Do Not Depend on the Failing Path

‏אם ה־Kill Switch תלוי בדיוק באותו queue שנתקע, הוא עלול לא לעבוד בזמן שצריך אותו.

---

# ‏107. Minimal Emergency Path

‏מסלול חירום צריך להיות פשוט ככל האפשר.

‏פחות dependencies.

‏פחות business logic.

‏פחות moving parts.

---

# ‏108. KISS חשוב במיוחד ב־Safety

‏Safety code מורכב מדי קשה לבדיקה וקשה להאמין לו.

‏המטרה אינה “חכם”.

‏המטרה היא predictable.

---

# ‏109. Config Safety

‏גם config שגוי יכול לגרום לנזק.

‏לכן deployment config צריך validation.

---

# ‏110. Config Version

‏כל run צריך לדעת באיזו גרסת config הוא משתמש.

```text
strategy_version
risk_config_version
safety_config_version
broker_adapter_version
```

---

# ‏111. Unsafe Config Change

‏שינוי thresholds בזמן session יכול להיות risk-increasing.

‏צריך audit ואולי approval policy.

---

# ‏112. Environment Guard

‏אחד הכשלים המסוכנים ביותר הוא בלבול בין:

```text
PAPER
LIVE
```

‏Environment צריך להיות explicit בכל שכבה.

---

# ‏113. Live Arming

‏אפשר לדרוש `arming` מפורש לפני שהמערכת רשאית לבצע live entries.

‏Restart לא חייב לחזור אוטומטית ל־armed state.

---

# ‏114. Startup Default

‏Default בטוח:

```text
STARTING
→ BLOCK_NEW_ENTRIES
→ SYNCING
→ validation
→ NORMAL
```

‏לא:

```text
process started
→ trade immediately
```

---

# ‏115. Session Boundary Safety

‏פתיחה וסגירה יכולות לשנות liquidity ו־order semantics.

‏Safety policy יכול להיות שונה לפי session state.

---

# ‏116. Trading Calendar Safety

‏אסור להסתמך על שעה קשיחה בלבד.

‏צריך calendar/session awareness.

---

# ‏117. Unexpected Market State

‏אם venue/session state אינו כפי שהמערכת מצפה, חוסמים entries עד clarification.

---

# ‏118. Halt Detection

‏Halt הוא לא רק “אין trades”.

‏צריך להשתמש ב־market-status semantics כאשר זמינים.

---

# ‏119. Corporate/Instrument Safety

‏שינוי symbol, split, delisting או instrument mapping issue יכול להצדיק block מקומי.

---

# ‏120. Price Sanity Checks

‏לפני order אפשר לבצע sanity checks.

‏לדוגמה:

- ‏price > 0.
- ‏spread finite.
- ‏price move אינו בלתי־אפשרי ביחס ל־reference בלי explanation.

‏אבל sanity checks אינם תחליף ל־market data correctness.

---

# ‏121. Quantity Sanity Checks

‏Quantity צריך לעבור bounds קשיחים.

```text
0 < qty <= max_qty
```

‏עם checks על notional ו־exposure.

---

# ‏122. Price Band Safety

‏אפשר להגדיר guard נגד limit price חריג מאוד ביחס ל־reference.

‏זה בעיקר מגן על bugs של units/decimal/sign.

---

# ‏123. Unit Errors

‏שגיאות כמו:

```text
cents vs dollars
shares vs notional
percent vs decimal
```

‏צריכות validation מפורש.

---

# ‏124. Fat-Finger Controls

‏גם רובוט יכול לעשות fat-finger.

‏למשל quantity פי 100 בגלל parsing או config.

---

# ‏125. Hard Limits מול Soft Limits

‏`Hard Limit` לא ניתן לעקוף אוטומטית.

‏`Soft Limit` יכול להפעיל alert או require confirmation.

‏ב־fully automated system עדיף לשמור מעט hard invariants ברורים.

---

# ‏126. Invariants

‏דוגמאות:

```text
Never open new risk while broker state is unknown.
Never send duplicate exit that can reverse the position.
Never resume with unresolved position mismatch.
Never trade from stale whole-market snapshot beyond policy.
```

---

# ‏127. Invariant Violation

‏Invariant violation הוא אירוע חמור.

‏לעיתים הוא צריך לעבור ישר ל־latched safety state.

---

# ‏128. Safety Event Journal

‏כל trigger צריך להישמר.

```text
trigger_time
trigger_type
scope
observed_value
threshold
state_before
state_after
source_component
```

---

# ‏129. Why Was I Blocked?

‏צריך להיות אפשר לענות על:

```text
Why was order X denied?
```

‏בלי לקרוא אלפי שורות log.

---

# ‏130. Decision Record

‏Order denied יכול לשמור:

```text
intent_id
risk_result
safety_mode
safety_reasons
health_snapshot
```

---

# ‏131. Alerts

‏לא כל Safety event צריך להעיר מפעיל.

‏יש להבדיל בין:

```text
INFO
WARNING
ACTION_REQUIRED
CRITICAL
```

---

# ‏132. Alert Fatigue

‏אם כל transient glitch הוא CRITICAL, המפעיל ילמד להתעלם.

‏זה עצמו סיכון.

---

# ‏133. Escalation

‏דוגמה:

```text
short transient → warning
persistent degradation → block entries
unresolved mismatch → exit-only/manual action
critical invariant → full halt
```

---

# ‏134. Safety Dashboard

‏Dashboard צריך להציג בראש ובראשונה:

- ‏Current Safety Mode.
- ‏Active reasons.
- ‏Latched reasons.
- ‏Allowed capabilities.
- ‏Positions.
- ‏Working orders.
- ‏Pending exposure.
- ‏Data/Broker health.
- ‏Time since trigger.

---

# ‏135. Safety Must Be Visible

‏מפעיל לא צריך לנחש שהמערכת ב־`EXIT_ONLY`.

‏זה צריך להיות מצב בולט וברור.

---

# ‏136. Manual Override

‏Override יכול להיות שימושי, אבל מסוכן.

‏הוא צריך להיות:

- ‏scoped.
- ‏time-limited.
- ‏audited.
- ‏reasoned.

---

# ‏137. Override אינו `ignore all safety`

‏עדיף לאפשר override ל־rule מסוים מאשר bypass לכל המערכת.

---

# ‏138. Two-Step Re-Arm

‏במצבים חמורים אפשר להפריד:

```text
recover health
→ clear latch
→ arm trading
```

‏כך recovery ו־permission to trade אינם אותה פעולה.

---

# ‏139. Human Error Safety

‏גם operator יכול לטעות.

‏לכן UI צריך להבדיל מאוד בין:

```text
PAUSE
EXIT_ONLY
CANCEL_ALL
FLATTEN
FULL_HALT
RESUME
```

---

# ‏140. Dangerous Button Design

‏פעולה חזקה כמו `FLATTEN` צריכה להיות מובחנת מפעולה כמו `PAUSE`.

‏אבל confirmation flow לא צריך להיות כה מסורבל שבחירום אי אפשר להשתמש בו.

---

# ‏141. Idempotent Safety Commands

‏אם `EXIT_ONLY` נשלח פעמיים, התוצאה צריכה להיות אותה תוצאה.

‏אותו עיקרון ל־`CANCEL_ALL` request orchestration.

---

# ‏142. Command IDs

‏Safety command יכול לקבל:

```text
command_id
requested_at
requested_by
scope
reason
```

‏כדי למנוע ambiguity.

---

# ‏143. Safety Command Acknowledgement

‏ה־UI צריך לדעת אם command רק נשלח או באמת התקבל/הוחל.

---

# ‏144. Distributed Systems Problem

‏במערכת עם כמה services, שינוי Safety state צריך להגיע לכולם.

‏צריך לחשוב על:

- ‏ordering.
- ‏durability.
- ‏duplicate delivery.
- ‏late subscribers.

---

# ‏145. Central Safety State

‏אפשר להחזיק authority אחד למצב Safety.

‏כל execution path חייב לקרוא או לקבל את הגרסה העדכנית.

---

# ‏146. Cached Safety State

‏Cache יכול לחסוך latency.

‏אבל stale cache מסוכן.

‏לכן צריך version/epoch ו־TTL או push semantics אמינים.

---

# ‏147. Fail-Safe Default

‏אם Execution Engine אינו יודע מה Safety state הנוכחי, ברירת המחדל צריכה להיות conservative.

‏כלומר לא ליצור risk חדש.

---

# ‏148. Fail Open מול Fail Closed

‏`Fail Open` אומר להמשיך למרות אי־ודאות.

‏`Fail Closed` אומר לחסום פעולה מסוכנת.

‏בנתיב יצירת exposure, ברירת המחדל בדרך כלל צריכה להיות `Fail Closed`.

---

# ‏149. Exit Path הוא מיוחד

‏אסור ש־Fail Closed יחסום אוטומטית גם את האפשרות להקטין risk.

‏לכן entry ו־exit capabilities נבדקים בנפרד.

---

# ‏150. Dependency Failure במהלך Exit

‏אם Data Provider נפל אבל Broker עדיין זמין, ייתכן שעדיין נוכל לנהל exit לפי policy חלופית.

‏זו החלטה שצריך לתכנן מראש ולא לאלתר בזמן אירוע.

---

# ‏151. Safety Degradation Ladder

‏דוגמה:

```text
NORMAL
↓
BLOCK_NEW_ENTRIES
↓
EXIT_ONLY
↓
FULL_HALT
```

‏לא כל fault קופץ ישר לתחתית.

---

# ‏152. Recovery Ladder

‏הכיוון ההפוך צריך להיות איטי יותר:

```text
FULL_HALT
→ RECOVERING
→ EXIT_ONLY
→ BLOCK_NEW_ENTRIES
→ NORMAL
```

‏רק אם יש evidence מתאים.

---

# ‏153. Safety Budget

‏אפשר להגדיר tolerance זמני לחלק מהתקלות.

‏לדוגמה:

```text
brief data jitter tolerated
persistent stale coverage not tolerated
```

---

# ‏154. Error Budget אינו License להתעלם

‏המטרה היא להבחין בין transient noise לבין degradation אמיתי.

---

# ‏155. Rate-of-Change Triggers

‏לפעמים השינוי חשוב יותר מהערך.

‏לדוגמה:

```text
reject rate jumped 20x
```

‏גם אם המספר האבסולוטי עדיין קטן.

---

# ‏156. Compound Failure

‏שני warnings יחד יכולים להצדיק פעולה חזקה יותר.

‏לדוגמה:

```text
high latency
+
low fresh coverage
```

‏עשויים להיות מסוכנים יותר מכל אחד לבד.

---

# ‏157. Avoid Rule Explosion

‏אבל אסור להפוך Safety ל־expert system בלתי־ניתן להבנה.

‏עדיף מספר קטן של rules עם rationale ברור.

---

# ‏158. Safety Rule Registry

‏לכל rule נשמור:

```text
rule_id
purpose
scope
metric
threshold
trip_behavior
latching_policy
recovery_policy
owner
version
```

---

# ‏159. Threshold Rationale

‏Threshold ללא rationale נוטה להפוך ל־magic number.

‏צריך להסביר למה הוא קיים.

---

# ‏160. Research מול Safety Thresholds

‏Safety thresholds אינם optimization target לרווח.

‏הם נועדו להגן על correctness ו־risk boundaries.

---

# ‏161. Safety Must Survive Strategy Changes

‏החלפת Score weights לא צריכה לשבור Kill Switch.

‏Safety הוא contract סביב strategy, לא חלק פנימי שלה.

---

# ‏162. Champion/Challenger

‏Challenger ב־Shadow לא אמור לקבל permission לבצע Live רק כי הוא מחושב לצד Champion.

‏Permissions נפרדים.

---

# ‏163. Environment Permissions

‏אפשר להגדיר capability כמו:

```text
REPLAY: no broker actions
SHADOW: no broker actions
PAPER: paper broker only
LIVE: live adapter allowed only when armed
```

---

# ‏164. Secrets אינם Safety Mode

‏הסתרת credentials אינה תחליף ל־execution permissions.

‏שניהם נחוצים מסיבות שונות.

---

# ‏165. Testability

‏Kill Switch שלא ניתן לבדיקה אינו מנגנון שאפשר לסמוך עליו.

---

# ‏166. Unit Tests

‏נבדוק rules כמו:

```text
stale data → entries denied
position mismatch → latch
healthy again alone → latch remains
reconciliation success + clear → can recover
```

---

# ‏167. Transition Tests

‏כל transition חשוב צריך test.

```text
NORMAL → EXIT_ONLY
EXIT_ONLY → RECOVERING
RECOVERING → NORMAL
```

---

# ‏168. Invariant Tests

‏דוגמה:

```text
When SafetyMode != NORMAL,
no risk-increasing order may be emitted.
```

---

# ‏169. Property Tests

‏אפשר לבדוק sequences אקראיים של events ולוודא שאין state שבו forbidden command יוצא.

---

# ‏170. Fault Injection

‏נזריק בכוונה:

- ‏broker disconnect.
- ‏stale feed.
- ‏lost ACK.
- ‏partial fill.
- ‏clock jump.
- ‏queue backlog.
- ‏database failure.

---

# ‏171. Kill Switch Drill

‏כדאי לתרגל ידנית את מנגנון העצירה בסביבה בטוחה.

‏מערכת חירום שלא נוסתה היא assumption.

---

# ‏172. Drill Questions

‏נבדוק:

- ‏כמה זמן לוקח לחסום entries?
- ‏האם queued intents נעצרים?
- ‏האם working entries מבוטלים?
- ‏האם open positions ממשיכים להיות מנוהלים?
- ‏האם המצב נשמר אחרי restart?

---

# ‏173. Restart While Killed

‏אם המערכת הופעלה מחדש בזמן `EXIT_ONLY`, אסור לה לחזור ל־`NORMAL` רק בגלל restart.

‏Safety state צריך להיות durable כאשר נדרש.

---

# ‏174. Persistence Test

‏נבדוק:

```text
trip safety
kill process
restart
verify safety remains active
```

---

# ‏175. Network Partition Test

‏נבדוק מצב שבו האפליקציה אינה יודעת אם broker action בוצע.

‏התגובה צריכה להיות reconciliation, לא retry עיוור.

---

# ‏176. Duplicate Process Test

‏נפעיל בטעות שני executors ונבדוק שרק owner אחד יכול ליצור risk.

---

# ‏177. Slow Consumer Test

‏נאט את Feature/Ranking pipeline ונבדוק ש־stale decisions אינם מגיעים ל־broker.

---

# ‏178. Data Gap Test

‏נגרום לחלק מה־Universe להפסיק להתעדכן ונבדוק coverage gate.

---

# ‏179. Broker Reject Storm Test

‏נדמה rejects רבים ונבדוק שהמערכת אינה נכנסת ל־retry storm.

---

# ‏180. Partial Fill During Kill Test

‏תרחיש קריטי:

1. ‏Entry order עובד.
2. ‏Kill trigger מופעל.
3. ‏Cancel נשלח.
4. ‏Partial fill מגיע.
5. ‏המערכת חייבת להבין שנוצר Position.
6. ‏ה־Position עובר לניהול מתאים.

---

# ‏181. Fill After Cancel ACK?

‏גם event ordering ו־broker semantics צריכים להיבדק.

‏לא מניחים יותר ממה שהAPI מבטיח.

---

# ‏182. Unknown Fill Test

‏אם reconciliation מגלה Position שלא היה ידוע, זה incident.

‏לא ממשיכים כאילו זה “תוקן”.

---

# ‏183. Golden Safety Scenarios

‏ניצור datasets קבועים של תרחישים מסוכנים ונריץ אותם ב־CI.

---

# ‏184. Replay Safety

‏אותו Safety Engine צריך להיות ניתן להרצה ב־Replay ככל האפשר.

‏כך ניתן לשחזר incident.

---

# ‏185. Shadow Safety

‏ב־Shadow אפשר להפעיל rules ולראות מתי הם היו חוסמים מסחר, בלי לבצע פעולות.

‏זה שימושי לכיול thresholds.

---

# ‏186. Paper Safety

‏Paper מתאים לבדיקת command flow, state transitions ו־operator workflow.

‏אבל אינו מוכיח behavior זהה ל־Live.

---

# ‏187. Live Canary

‏אם בעתיד מגיעים ל־Live, מעבר הדרגתי עם exposure קטן מאפשר למדוד safety behavior בעולם האמיתי עם blast radius מוגבל.

---

# ‏188. Safety Telemetry

‏נמדוד:

```text
safety_trips_total
safety_mode_duration
blocked_entries_total
cancel_all_duration
reconciliation_duration
unknown_order_count
position_mismatch_count
resume_attempts
resume_denials
```

---

# ‏189. False Positives

‏Safety rule שמופעל כל הזמן פוגע בזמינות.

‏צריך למדוד false-positive-like behavior.

---

# ‏190. False Negatives

‏חמור יותר: מצב מסוכן שלא הפעיל שום הגנה.

‏Near misses חשובים לניתוח.

---

# ‏191. Safety RCA

‏אחרי trip נשאל:

```text
Was the trigger correct?
Was the severity correct?
Did containment work?
Did any risk increase after trip?
Was recovery safe?
Was operator guidance sufficient?
```

---

# ‏192. Near-Miss Review

‏גם אם לא נגרם loss, אירוע שבו safety כמעט נכשל הוא חומר לימוד חשוב.

---

# ‏193. Blast Radius

‏נמדוד כמה exposure יכול להיווצר לפני שה־safety action נכנס לתוקף.

---

# ‏194. Detection Latency

‏זמן:

```text
fault occurs
→ detected
```

---

# ‏195. Containment Latency

‏זמן:

```text
detected
→ new risk blocked
```

---

# ‏196. Recovery Latency

‏זמן:

```text
fault resolved
→ system safely usable again
```

---

# ‏197. Safety SLO

‏אפשר להגדיר SLO פנימי, למשל כמה מהר entry gate חייב להגיב ל־critical trip.

‏המספר תלוי בארכיטקטורה וב־horizon.

---

# ‏198. Do Not Optimize Safety for Pretty Uptime

‏מערכת שנעצרת נכון לעיתים יכולה להיות בטוחה יותר ממערכת עם 99.999% “uptime” שממשיכה לסחור על state שגוי.

---

# ‏199. Availability מול Correctness

‏במערכת פיננסית אוטומטית correctness של state ו־risk בדרך כלל קודם ל־availability של entries חדשים.

---

# ‏200. Safety Ownership

‏צריך להיות ברור מי “בעלים” של כל safety rule.

‏גם בפרויקט אישי, הכוונה היא שלכל rule יש rationale ותיעוד.

---

# ‏201. Runbook לכל Critical Trigger

‏לכל trigger קריטי נרשום:

```text
what it means
what the system does automatically
what the operator should inspect
what evidence is required to resume
```

---

# ‏202. Runbook אינו תחליף לאוטומציה

‏פעולות שחייבות לקרות בתוך מילישניות/שניות לא צריכות לחכות לאדם.

‏Runbook נועד לחקירה, recovery ו־escalation.

---

# ‏203. Operator Cannot Watch Everything

‏מערכת whole-market מייצרת יותר אירועים מאדם יכול לעקוב אחריהם.

‏לכן safety בסיסי חייב להיות אוטומטי.

---

# ‏204. But Automation Must Be Explainable

‏כל automated trip צריך reason code, evidence ו־timestamp.

---

# ‏205. Safety Versioning

‏שינוי safety policy צריך version.

```text
safety_policy_version = 12
```

---

# ‏206. Compare Policy Versions

‏ב־Replay/Shadow נוכל להשוות:

```text
v11 would allow
v12 would block
```

‏ולמדוד impact.

---

# ‏207. Safety Policy Drift

‏אם מוסיפים exceptions לאורך זמן, policy יכולה להפוך למסובכת ושבירה.

‏צריך review תקופתי.

---

# ‏208. Delete Dead Rules

‏Rule שאין לו rationale, owner או evidence צריך להיבחן מחדש.

‏Safety clutter הוא בעיה אמיתית.

---

# ‏209. Small Number of Strong Rules

‏עדיף להתחיל עם מעט invariants חזקים:

- ‏no unknown broker state.
- ‏no stale broad-market ranking.
- ‏no unresolved position mismatch.
- ‏no exposure above hard limit.
- ‏no duplicate executor.

---

# ‏210. Then Add Evidence-Based Controls

‏כל rule נוסף צריך להגיע מ:

- ‏RCA.
- ‏near miss.
- ‏observed production degradation.
- ‏validated engineering requirement.

---

# ‏211. Avoid Profit-Based Kill Alone

‏PnL הוא lagging and noisy signal.

‏Safety צריך להסתכל גם על correctness, health ו־execution quality.

---

# ‏212. Loss Can Be Legitimate

‏אסטרטגיה יכולה להפסיד trade תקין.

‏Kill Switch אינו אמור להעניש כל loss.

---

# ‏213. Profit Can Hide Failure

‏Trade יכול להרוויח למרות:

- ‏duplicate order.
- ‏stale data.
- ‏position mismatch.

‏רווח אינו הוכחת correctness.

---

# ‏214. Safety Before PnL

‏ב־RCA תפעולי שואלים קודם:

```text
Was the system correct?
```

‏ורק אחר כך:

```text
Did it make money?
```

---

# ‏215. User-Specific Baseline — המטרה

‏לרובוט שלך יש מאפיין חשוב:

- ‏סורק אלפי מניות.
- ‏בוחר candidate אחד או מעט candidates.
- ‏Edge צפוי להופיע מהר.
- ‏החזקה קצרה מאוד.

‏לכן stale data ו־latency degradation חשובים במיוחד.

---

# ‏216. Baseline Safety Modes לרובוט

‏ל־MVP הייתי מגדיר לפחות:

```text
NORMAL
BLOCK_NEW_ENTRIES
EXIT_ONLY
RECOVERING
FULL_HALT
```

---

# ‏217. Baseline Data Triggers

‏מחקר ראשוני צריך לכלול:

- ‏Fresh Coverage נמוך מדי.
- ‏Top Candidate data stale.
- ‏sequence/data-quality fault משמעותי.
- ‏feature warm-up incomplete.

---

# ‏218. Baseline Broker Triggers

‏לפחות:

- ‏Disconnected.
- ‏Orders snapshot stale.
- ‏Positions snapshot stale.
- ‏Unknown order effect.
- ‏Position mismatch.
- ‏Repeated rejects.

---

# ‏219. Baseline Risk Triggers

‏לפחות:

- ‏Position/notional hard limit.
- ‏Pending exposure limit.
- ‏Daily safety loss budget אם יוגדר.
- ‏Unexpected number of concurrent positions.

---

# ‏220. Baseline System Triggers

‏לפחות:

- ‏Duplicate executor.
- ‏Critical queue age.
- ‏Clock drift.
- ‏Persistence failure.
- ‏Unhandled invariant violation.

---

# ‏221. Baseline Execution Triggers

‏בהמשך, אחרי שיש Live/Paper evidence:

- ‏Ack latency degradation.
- ‏Fill latency degradation.
- ‏Reject spike.
- ‏Slippage distribution deterioration.

---

# ‏222. Baseline Entry Contract

‏לפני Entry:

```text
SystemState == READY
SafetyMode == NORMAL
MarketDataReady == true
BrokerReady == true
RiskApproved == true
CandidateFresh == true
ReconciliationClean == true
```

---

# ‏223. Baseline Exit Contract

‏Exit צריך להיות מותר גם כאשר entries חסומים, כל עוד broker execution path עצמו מספיק אמין.

---

# ‏224. Baseline Unknown Contract

‏אם איננו יודעים בוודאות:

```text
position
working orders
broker effect of last command
```

‏לא יוצרים exposure חדש.

---

# ‏225. Baseline Recovery Contract

```text
Detect
→ Block Entries
→ Reconcile Broker Truth
→ Rebuild Local State
→ Warm Data/Features
→ Validate Invariants
→ Clear Eligible Latches
→ Arm
→ Resume
```

---

# ‏226. Baseline Operator Controls

‏UI בסיסי צריך להציג לפחות:

```text
PAUSE NEW ENTRIES
EXIT ONLY
CANCEL PENDING ENTRIES
CANCEL ALL
RECOVER / RECONCILE
ARM / RESUME
```

‏`FLATTEN` הוא action נפרד שצריך לעצב ולבדוק בזהירות.

---

# ‏227. Baseline Audit

‏כל שינוי state וכל command ידני נרשמים עם reason ו־correlation id.

---

# ‏228. Baseline Tests

‏לפני Live אמיתי, לכל הפחות:

- ‏disconnect בזמן entry.
- ‏partial fill בזמן kill.
- ‏restart בזמן open position.
- ‏stale data בזמן candidate selection.
- ‏duplicate executor.
- ‏unknown order effect.
- ‏position mismatch.
- ‏manual exit-only.
- ‏resume denied עד reconciliation.

---

# ‏229. Anti-Pattern — כפתור `STOP` אחד

‏כפתור בודד בלי semantics ברורים משאיר שאלות:

- ‏האם הוא מבטל orders?
- ‏האם הוא סוגר positions?
- ‏האם הוא מפסיק exits?
- ‏האם הוא persistent?
- ‏מה קורה אחרי restart?

‏זה מסוכן.

---

# ‏230. Anti-Pattern — Auto Resume מהיר

‏ה־metric חזר לנורמה לשנייה אחת ולכן חוזרים למסחר.

‏זה יוצר flapping וסיכון חוזר.

---

# ‏231. Anti-Pattern — Retry Everything

‏Retry אוטומטי על כל error יכול ליצור duplicate orders.

---

# ‏232. Anti-Pattern — Cancel Means Gone

‏בקשת cancel אינה הוכחה שה־order אינו יכול עוד להתמלא.

---

# ‏233. Anti-Pattern — Local State Is Truth

‏אחרי תקלה, local state יכול להיות ישן.

‏Broker reconciliation קודם ל־resume.

---

# ‏234. Anti-Pattern — Stop Monitoring After Kill

‏דווקא אחרי kill צריך observability חזקה.

‏צריך לדעת אם orders בוטלו, אם fills הגיעו ואם exposure השתנה.

---

# ‏235. Anti-Pattern — Safety Depends on PnL Only

‏Operational failure יכול להיות חמור גם ביום רווחי.

---

# ‏236. Anti-Pattern — Thresholds Without Evidence

‏מספרים אקראיים יוצרים false trips או missed faults.

---

# ‏237. Anti-Pattern — Safety Hidden Inside Strategy Code

‏אם צריך לקרוא Score logic כדי להבין למה system stopped, coupling גבוה מדי.

---

# ‏238. Anti-Pattern — One Giant State Machine

‏Safety, broker, market data ו־position lifecycle הם axes שונים.

‏אפשר לקשר ביניהם באמצעות capabilities ו־guards בלי לייצר אלפי combined states.

---

# ‏239. Anti-Pattern — Human Memory as Runbook

‏בחירום לא רוצים לזכור בעל פה מה לבדוק.

‏המערכת והתיעוד צריכים להוביל את התהליך.

---

# ‏240. Best Practice — Stop Risk Before Stopping Compute

‏כאשר אפשר, קודם חוסמים יצירת risk חדש.

‏אחר כך מטפלים בשירותים, queues ותהליכים.

---

# ‏241. Best Practice — Preserve Exit Capability

‏Degraded mode צריך לנסות לשמור יכולת להקטין risk כאשר היא עדיין אמינה.

---

# ‏242. Best Practice — Make Unknown Explicit

‏`UNKNOWN` אינו error message.

‏הוא state שצריך policy.

---

# ‏243. Best Practice — Safety State Is Durable

‏Restart אינו אמור למחוק latch קריטי.

---

# ‏244. Best Practice — Reconcile Before Resume

‏חזרה של connection אינה מספיקה.

---

# ‏245. Best Practice — Version Everything

‏Policy, config, code ו־environment חייבים להיות ניתנים לזיהוי ב־incident.

---

# ‏246. Best Practice — Test the Emergency Path Regularly

‏המסלול שאף פעם לא מופעל הוא המסלול שהכי קל שיישבר בלי שנדע.

---

# ‏247. Best Practice — Keep Safety Boring

‏Safety אמין עדיף על Safety מתוחכם.

‏פשוט, deterministic, observable ו־testable.

---

# ‏248. Best Practice — RCA Every Serious Trip

‏לא רק “נפתח alert ונגמר”.

‏כל critical trip צריך להוסיף ידע למערכת.

---

# ‏249. Checklist — לפני שמאפשרים Entries

- ‏האם Safety Mode הוא `NORMAL`?
- ‏האם אין latches קריטיים?
- ‏האם Broker State ידוע ומסונכרן?
- ‏האם Positions ו־Orders reconciled?
- ‏האם Market Data fresh ובכיסוי מספיק?
- ‏האם Features warmed up?
- ‏האם clocks בריאים?
- ‏האם queues אינם stale?
- ‏האם Risk Limits תקינים?
- ‏האם executor ownership חד־משמעי?

---

# ‏250. Checklist — אחרי Trigger

- ‏מה הפעיל את ה־Safety?
- ‏מה היה ה־scope?
- ‏האם entries נחסמו בזמן?
- ‏האם queued intents נוקו?
- ‏האם working orders ידועים?
- ‏האם נוצרו fills אחרי trigger?
- ‏האם positions ידועים?
- ‏האם exposure גדל לאחר trigger?
- ‏האם נדרש reconciliation?
- ‏האם האירוע latched?

---

# ‏251. Checklist — לפני Resume

- ‏האם root fault באמת נפתר?
- ‏האם broker truth נמשך מחדש?
- ‏האם כל mismatch נפתר?
- ‏האם unknown orders נפתרו?
- ‏האם data warm-up הושלם?
- ‏האם health יציב לאורך cooldown?
- ‏האם invariants עברו validation?
- ‏האם נדרש manual clear?
- ‏האם trading armed מחדש?

---

# ‏252. השאלה המקצועית הנכונה

‏לא:

```text
Do we have a kill switch?
```

‏אלא:

```text
When something becomes uncertain,
what risk can still be created,
how quickly is it contained,
and what evidence is required before risk creation resumes?
```

---

# ‏253. החיבור לשלבים הקודמים

‏הפרק הזה מחבר יחד:

- ‏שלב 19 — Risk Management.
- ‏שלב 29 — Broker API Architecture.
- ‏שלב 32 — Data/Execution separation.
- ‏שלב 33 — Production State Machine.
- ‏שלב 34 — Failure Recovery.
- ‏שלב 35 — Observability.

‏Safety אינו שכבה חדשה שמודבקת בסוף.

‏הוא הדרך שבה כל השכבות האלה מגיבות כאשר certainty יורדת.

---

# ‏254. מסקנה

‏מערכת מסחר בטוחה אינה מערכת שלא מתקלקלת.

‏מערכת כזו לא קיימת.

‏מערכת בטוחה היא מערכת שמניחה מראש שדברים ייכשלו, מגבילה את ה־blast radius, מפסיקה ליצור risk כשאין מספיק ודאות, שומרת יכולת להקטין risk כאשר אפשר, ואינה חוזרת לפעולה עד שהעולם החיצוני וה־state המקומי שוב מיושרים.

‏במילים קצרות:

> ‏**Fail safely, reconcile before trust, and make resuming risk harder than stopping it.**

---

# ‏255. המעבר לשלב הבא

‏אחרי שיש לנו Safety Controls בסיסיים, אפשר לעבור ממשמעת Production אל שכבה עמוקה יותר של Execution.

‏בשלב הבא נלמד **`Advanced Order Tactics`**: איך Orders שונים מתנהגים בפועל, איך לחשוב על urgency, price protection, passive מול aggressive execution, cancel/replace, marketable limits, IOC/FOK ושיטות ביצוע מתקדמות — בלי לאבד את עקרונות ה־Risk וה־Safety שבנינו עד כאן.
