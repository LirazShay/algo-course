# ‏שלב 64 — `Professional Checklist Before Real Money`: מה חייב להיות נכון לפני מעבר מעבר ל־Paper/Shadow

> ‏מטרת הפרק: להפוך את המעבר מ־Research/Paper/Shadow לסביבה עם כסף אמיתי מתהליך רגשי של “נראה מוכן” לתהליך מקצועי, מתועד ומבוסס Evidence. נבנה `Go/No-Go Checklist` שמכסה Research, Data, Scanner, Ranking, Vetoes, Execution, Risk, Recovery, Operations, Security ו־Live Calibration.
>
> ‏העיקרון המרכזי: **מערכת אינה מוכנה לכסף אמיתי רק מפני שה־Strategy נראית טובה. היא מוכנה רק כאשר כל שכבות השרשרת מסוגלות להוכיח שהן שומרות על correctness, controllability ו־risk containment גם כאשר העולם החיצוני מתנהג רע.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח. לפני כל שימוש בכסף אמיתי יש לוודא גם זכאות חוקית, הרשאות חשבון ותנאי Broker רלוונטיים; כאשר אין זכאות/הרשאה מתאימה נשארים ב־Paper/Shadow.

---

# ‏1. למה צריך `Go/No-Go` ולא “תחושת מוכנות”

‏במערכת מסחר קצרה אפשר לטעות בכמה שכבות במקביל:

```text
Signal good
Data stale
Rank unfair
Execution unrealistic
Exit too slow
Risk incomplete
Recovery broken
Operator confused
```

‏לכן `Go` אינו החלטה של רכיב אחד.

‏הוא החיתוך של כמה סוגי מוכנות:

```text
Research Ready
AND Data Ready
AND Scanner Ready
AND Execution Ready
AND Risk Ready
AND Recovery Ready
AND Operations Ready
AND Security Ready
AND Eligibility Ready
```

‏אם אחד מהם אינו `PASS`, אין הצדקה מקצועית להתייחס למערכת כ־Live-ready.

---

# ‏2. דרגות חומרה

‏נשתמש בשלוש דרגות:

```text
P0 = blocker; failure means NO-GO
P1 = important; must have explicit disposition before promotion
P2 = improvement; may be deferred if risk is understood and bounded
```

‏חשוב: `P0` אינו “משהו חשוב מאוד”.

‏הוא תנאי שאם אינו מתקיים, אסור למערכת להגדיל סיכון חדש.

---

# ‏3. `Research Readiness`

## ‏3.1 Thesis

- [ ] ‏`P0` קיימת `Edge Thesis` כתובה.
- [ ] ‏`P0` ברור מה ה־mechanism המשוער, לא רק correlation.
- [ ] ‏`P0` מוגדר מהו `Prediction Target`.
- [ ] ‏`P0` מוגדר מהו `Executable Outcome`.
- [ ] ‏`P0` מוגדר מהו failure של ה־thesis.
- [ ] ‏`P0` מוגדר מה אמור לגרום לנו לעצור/להשעות את ה־Strategy.

## ‏3.2 Evidence

- [ ] ‏`P0` ה־result שרד `Out-of-Sample`.
- [ ] ‏`P0` ה־result שרד realistic costs.
- [ ] ‏`P0` ה־result שרד realistic latency assumptions.
- [ ] ‏`P0` ה־result שרד realistic fill assumptions.
- [ ] ‏`P0` בוצע לפחות `Ablation` בסיסי לרכיבים מרכזיים.
- [ ] ‏`P0` אין תלות ברורה ב־single lucky period.
- [ ] ‏`P1` נבדקו multiple regimes.
- [ ] ‏`P1` נבדקו sensitivity surfaces ולא רק parameter point אחד.
- [ ] ‏`P1` נבדק null/naive baseline.
- [ ] ‏`P1` תוצאות שליליות נשמרו ולא נמחקו מההיסטוריה המחקרית.

---

# ‏4. `Point-in-Time Correctness`

- [ ] ‏`P0` כל Feature משתמש רק במידע שהיה זמין בזמן ההחלטה.
- [ ] ‏`P0` כל Label מופרד לחלוטין מה־Feature timeline.
- [ ] ‏`P0` ה־Universe הוא historical point-in-time ולא רשימה מודרנית שהוחלה אחורה.
- [ ] ‏`P0` Corporate actions מטופלים במפורש.
- [ ] ‏`P0` Trade corrections/backfills אינם מוזרקים כאילו היו ידועים בזמן אמת.
- [ ] ‏`P0` אין future joins.
- [ ] ‏`P0` אין use-after-correction שמייצר historical truth “נקייה מדי”.
- [ ] ‏`P1` בוצעו `Time-Shift` ו־Leakage Canary tests.

---

# ‏5. `Market Data Readiness`

## ‏5.1 Provenance

- [ ] ‏`P0` ידוע עבור כל stream מי ה־provider וה־source.
- [ ] ‏`P0` נשמרים `EventTime` ו־`ReceiveTime` כאשר זמינים.
- [ ] ‏`P0` sequence/gap semantics ידועים.
- [ ] ‏`P0` trade/quote condition semantics מתועדים.
- [ ] ‏`P0` units, price precision ו־size semantics מוגדרים.

## ‏5.2 Quality

- [ ] ‏`P0` קיימת detection ל־stale data.
- [ ] ‏`P0` קיימת detection ל־gaps.
- [ ] ‏`P0` קיימת detection ל־duplicates/out-of-order.
- [ ] ‏`P0` קיימת handling ל־snapshot reset/reconnect.
- [ ] ‏`P0` קיימת `Data Quality State` ולא רק Boolean `connected`.
- [ ] ‏`P0` Data degradation יכולה לחסום Entries חדשים.
- [ ] ‏`P1` קיימת cross-provider validation כאשר מוצדק.
- [ ] ‏`P1` feed batching/burstiness נמדדו.

---

# ‏6. `Scanner Readiness`

- [ ] ‏`P0` ה־Scanner דטרמיניסטי תחת אותו input.
- [ ] ‏`P0` tie-breaking מפורש.
- [ ] ‏`P0` freshness נמדדת per symbol.
- [ ] ‏`P0` `Fresh Coverage Ratio` קיים.
- [ ] ‏`P0` winner לא יכול לנצח רק בגלל stale competitors.
- [ ] ‏`P0` rank timestamp נשמר.
- [ ] ‏`P0` candidate revalidation מתבצעת סמוך ל־submit.
- [ ] ‏`P0` `NO TRADE` הוא output חוקי ומלא.
- [ ] ‏`P1` נמדדים `RankGap`, ‏`RankChurn`, ‏candidate persistence.
- [ ] ‏`P1` קיימת visibility ל־Top-N, לא רק Top-1.
- [ ] ‏`P1` scanner overload אינו מעכב Position/Exit path.

---

# ‏7. `Negative Evidence / Veto Readiness`

- [ ] ‏`P0` Safety/Data-status vetoes אינם תלויים ב־Score.
- [ ] ‏`P0` לכל `Hard Veto` יש `ReasonCode`.
- [ ] ‏`P0` כל veto הוא point-in-time correct.
- [ ] ‏`P0` `Cooldown` ו־TTL הם explicit state.
- [ ] ‏`P0` veto state survives/reconstructs correctly after restart אם הוא נדרש לבטיחות/נכונות.
- [ ] ‏`P1` Behavioral vetoes נבדקו OOS.
- [ ] ‏`P1` נמדדת `False Veto Rate`.
- [ ] ‏`P1` נמדד missed-opportunity cost של vetoes.
- [ ] ‏`P1` בוצע ablation כדי לוודא ש־veto rules לא רק curve-fit.

---

# ‏8. `Execution Readiness`

## ‏8.1 Order semantics

- [ ] ‏`P0` לכל Order Intent יש stable identity.
- [ ] ‏`P0` `Sent != Accepted != Working != Filled` מיוצג ב־state model.
- [ ] ‏`P0` `CancelRequested != Canceled` מיוצג במפורש.
- [ ] ‏`P0` partial fills הם first-class state.
- [ ] ‏`P0` duplicate-submit protection קיים.
- [ ] ‏`P0` retry אינו נעשה בעיוורון כאשר effect לא ידוע.
- [ ] ‏`P0` `UNKNOWN_EFFECT` מוביל ל־reconciliation.
- [ ] ‏`P0` hard price protection קיימת כאשר סוג ה־order דורש זאת.
- [ ] ‏`P0` signal/order TTL קיימים כאשר ה־edge קצר.

## ‏8.2 Fill economics

- [ ] ‏`P0` נמדד `ArrivalPrice`.
- [ ] ‏`P0` נמדד effective spread/slippage.
- [ ] ‏`P0` נמדד post-fill markout.
- [ ] ‏`P0` partial-fill outcome נמדד בנפרד.
- [ ] ‏`P0` no-fill opportunity cost נמדד.
- [ ] ‏`P1` venue/route/order-type attribution קיים כאשר data מאפשר.
- [ ] ‏`P1` queue assumptions calibrated ולא מומצאים.

---

# ‏9. `Exit Readiness`

‏במערכת קצרה Exit הוא `P0` בפני עצמו.

- [ ] ‏`P0` קיימת Position-specific monitoring path.
- [ ] ‏`P0` Exit אינו תלוי בהשלמת full-universe scan.
- [ ] ‏`P0` `TimeToFlat` נמדד.
- [ ] ‏`P0` exit-trigger → submit latency נמדד.
- [ ] ‏`P0` submit → fill latency נמדד.
- [ ] ‏`P0` partial exit מטופל נכון.
- [ ] ‏`P0` duplicate exit protection קיים.
- [ ] ‏`P0` cancel/fill races נבדקו.
- [ ] ‏`P0` exit under degraded market-data/broker conditions נבדק.
- [ ] ‏`P0` emergency flatten semantics מוגדרים.
- [ ] ‏`P1` Giveback אחרי target/peak נמדד.

---

# ‏10. `Risk Readiness`

## ‏10.1 Exposure

- [ ] ‏`P0` Position + Working Orders + Pending Exposure מחושבים יחד.
- [ ] ‏`P0` partial fills מתעדכנים מיד ב־risk state.
- [ ] ‏`P0` open-order exposure אינו נעלם בגלל reconnect.
- [ ] ‏`P0` limits נאכפים גם בזמן recovery.
- [ ] ‏`P0` stale local state אינו יכול לאפשר over-exposure.

## ‏10.2 Boundaries

- [ ] ‏`P0` קיימים hard limits לכמות/Notional/Exposure המתאימים לסביבה.
- [ ] ‏`P0` קיימים limits ל־pending exposure.
- [ ] ‏`P0` קיימים limits ל־order rate/retry loops.
- [ ] ‏`P0` קיימת הגבלה על concurrent positions אם המודל מניח זאת.
- [ ] ‏`P0` `NO TRADE` מופעל כאשר economics או data אינם מספיקים.
- [ ] ‏`P1` liquidity/capacity limits נמדדים אמפירית.

---

# ‏11. `Kill Switch and Safety Readiness`

- [ ] ‏`P0` `BLOCK_NEW_ENTRIES` נבדק.
- [ ] ‏`P0` `CANCEL_PENDING_ENTRIES` נבדק.
- [ ] ‏`P0` `EXIT_ONLY` נבדק.
- [ ] ‏`P0` `CANCEL_ALL` נבדק.
- [ ] ‏`P0` `FLATTEN` נבדק בתרחישים מבוקרים/סימולטיביים.
- [ ] ‏`P0` `FULL_HALT` נבדק.
- [ ] ‏`P0` Safety state יכול לגבור על Strategy state.
- [ ] ‏`P0` Safety actions idempotent ככל הניתן.
- [ ] ‏`P0` resume אחרי halt דורש proof/readiness ולא toggle אוטומטי.
- [ ] ‏`P0` watchdog נבדק.
- [ ] ‏`P0` kill switch נשאר responsive תחת overload.

---

# ‏12. `Recovery Readiness`

- [ ] ‏`P0` startup reconciliation קיים.
- [ ] ‏`P0` reconnect reconciliation קיים.
- [ ] ‏`P0` orphan orders מזוהים.
- [ ] ‏`P0` position mismatch מזוהה.
- [ ] ‏`P0` local order-state mismatch מזוהה.
- [ ] ‏`P0` stale session/generation callbacks נדחים.
- [ ] ‏`P0` crash בזמן submit נבדק.
- [ ] ‏`P0` crash בזמן cancel נבדק.
- [ ] ‏`P0` crash בזמן partial fill נבדק.
- [ ] ‏`P0` restart עם existing position נבדק.
- [ ] ‏`P0` restart עם existing open orders נבדק.

---

# ‏13. `Latency Readiness`

- [ ] ‏`P0` נמדד end-to-end latency, לא רק function timing.
- [ ] ‏`P0` נשמרים p50/p95/p99 לפחות למסלולים מרכזיים.
- [ ] ‏`P0` `SignalAgeAtDecision` נמדד.
- [ ] ‏`P0` `SignalAgeAtSubmit` נמדד.
- [ ] ‏`P0` `SignalAgeAtFill` נמדד כאשר fill קיים.
- [ ] ‏`P0` latency נבחן ביחס ל־`SignalHalfLife`.
- [ ] ‏`P0` queue age נמדד.
- [ ] ‏`P0` stale queued work יכול להיפסל/להתאחד בהתאם לסמנטיקה.
- [ ] ‏`P1` latency distributions נמדדו גם בזמן burst/high activity.
- [ ] ‏`P1` cold-start/reconnect latency נמדדו.

---

# ‏14. `Cost Readiness`

- [ ] ‏`P0` commissions/fees נכללים.
- [ ] ‏`P0` spread נכלל.
- [ ] ‏`P0` slippage נכלל.
- [ ] ‏`P0` impact נכלל כאשר material.
- [ ] ‏`P0` adverse selection נמדד בנפרד ככל שניתן.
- [ ] ‏`P0` Entry + Exit נמדדים כ־round trip.
- [ ] ‏`P0` `NetEdge` חיובי רק אחרי כל הרכיבים הרלוונטיים.
- [ ] ‏`P1` cost drift מנוטר לאורך זמן.

---

# ‏15. `Capacity Readiness`

- [ ] ‏`P0` strategy אינו מניח infinite liquidity.
- [ ] ‏`P0` size sensitivity נבדקה.
- [ ] ‏`P0` entry capacity ו־exit capacity נבדקו בנפרד.
- [ ] ‏`P0` stress exit נבדק בסימולציה/replay.
- [ ] ‏`P1` `ImpactCurve`/capacity envelope קיימים כאשר יש מספיק Evidence.
- [ ] ‏`P1` `NetEdgeRetained` לפי size נמדד.

---

# ‏16. `Testing Readiness`

- [ ] ‏`P0` Fast CI ירוק ועקבי.
- [ ] ‏`P0` deterministic core tests קיימים.
- [ ] ‏`P0` replay tests קיימים.
- [ ] ‏`P0` property/invariant tests מכסים exposure/order state.
- [ ] ‏`P0` fault injection מכסה network/broker/data failures.
- [ ] ‏`P0` slow metrics pipeline אינו חוסם safety path.
- [ ] ‏`P0` overload tests כוללים 4k-symbol burst או עומס מייצג.
- [ ] ‏`P0` exit-under-load scenario נבדק.
- [ ] ‏`P0` restart/recovery tests קיימים.
- [ ] ‏`P1` performance-regression tests קיימים.
- [ ] ‏`P1` mutation/differential tests משמשים באזורים מתאימים.

---

# ‏17. `Observability Readiness`

- [ ] ‏`P0` לכל Decision יש trace/correlation identity.
- [ ] ‏`P0` אפשר לשחזר למה Candidate ניצח.
- [ ] ‏`P0` אפשר לשחזר למה Candidate נפסל.
- [ ] ‏`P0` אפשר לשחזר כל Order transition.
- [ ] ‏`P0` אפשר לשחזר כל Fill.
- [ ] ‏`P0` אפשר לשחזר Position/Exposure timeline.
- [ ] ‏`P0` אפשר לזהות Data Quality degradation.
- [ ] ‏`P0` אפשר לזהות Broker degradation.
- [ ] ‏`P0` אפשר לזהות latency/backpressure degradation.
- [ ] ‏`P0` logging עצמו אינו מסכן hot/safety paths.
- [ ] ‏`P1` Incident Packet נוצר אוטומטית לאירועים חשובים.

---

# ‏18. `Security and Operations Readiness`

- [ ] ‏`P0` secrets אינם hard-coded.
- [ ] ‏`P0` least privilege מיושם.
- [ ] ‏`P0` Paper ו־Live מופרדים בצורה שאי אפשר להתבלבל בה בקלות.
- [ ] ‏`P0` Startup מציג/מאמת environment ו־account identity.
- [ ] ‏`P0` build/version/config מזוהים באופן חד־משמעי.
- [ ] ‏`P0` production changes auditable.
- [ ] ‏`P0` rollback/forward recovery מוגדרים.
- [ ] ‏`P0` single-active-trader/fencing קיים אם קיימת אפשרות להרצות יותר ממופע אחד.
- [ ] ‏`P0` backup/restore של state קריטי נבדקו.
- [ ] ‏`P0` operator action נרשם.
- [ ] ‏`P0` emergency procedure כתוב ונבדק בסביבה בטוחה.

---

# ‏19. `Eligibility and Account Readiness`

‏החלק הזה אינו Strategy logic, אבל הוא Gate אמיתי.

- [ ] ‏`P0` account type מאפשר את הפעולות שהמערכת מתכננת לבצע.
- [ ] ‏`P0` user/account holder עומד בדרישות החוקיות והחוזיות הרלוונטיות.
- [ ] ‏`P0` required trading permissions אכן קיימות.
- [ ] ‏`P0` market-data entitlements הנדרשים קיימים.
- [ ] ‏`P0` broker/API access מאושר לסביבה הרלוונטית.
- [ ] ‏`P0` מגבלות settlement/margin/day-trading/borrow הרלוונטיות מובנות ונבדקו עדכנית לפני שימוש.
- [ ] ‏`P0` אם אחד מהסעיפים אינו תקף — נשארים ב־Paper/Shadow.

‏פרטים רגולטוריים/ברוקריים משתנים בזמן ולכן יש לאמת אותם מול מקורות עדכניים כאשר עוברים מ־course design ליישום בפועל.

---

# ‏20. `Paper / Shadow Readiness`

- [ ] ‏`P0` Shadow רץ על live data לאורך תקופה מייצגת.
- [ ] ‏`P0` כל Decision נשמר גם כאשר לא נשלח Order.
- [ ] ‏`P0` `WouldTrade` מול `WouldNotTrade` ניתן לניתוח.
- [ ] ‏`P0` Paper execution gaps מול model מובנים.
- [ ] ‏`P0` Backtest/Replay/Paper output ניתן להשוואה על אותו episode.
- [ ] ‏`P0` drift בין model לבין live observation נמדד.
- [ ] ‏`P1` Champion/Challenger יכול לרוץ ב־Shadow.

---

# ‏21. `Pre-Live Acceptance Scenarios`

‏לפני כל promotion משמעותי צריך לעבור תרחישי קבלה מוגדרים מראש.

## ‏21.1 Normal path

- [ ] ‏Fresh universe.
- [ ] ‏Candidate qualifies.
- [ ] ‏No veto.
- [ ] ‏Order accepted.
- [ ] ‏Partial/full fill handled.
- [ ] ‏Position monitored.
- [ ] ‏Exit triggered.
- [ ] ‏Position reconciles to flat.

## ‏21.2 No-trade path

- [ ] ‏High score but stale data → `NO TRADE`.
- [ ] ‏High score but negative net edge → `NO TRADE`.
- [ ] ‏High score but veto → `NO TRADE`.
- [ ] ‏High score but insufficient exit feasibility → `NO TRADE`.

## ‏21.3 Failure paths

- [ ] ‏Broker disconnect during pending order.
- [ ] ‏Data disconnect while flat.
- [ ] ‏Data disconnect while holding position.
- [ ] ‏Partial fill then disconnect.
- [ ] ‏Cancel requested then fill arrives.
- [ ] ‏Restart with live position.
- [ ] ‏Restart with open order.
- [ ] ‏Unknown submit effect.
- [ ] ‏Scanner overload while exit needed.
- [ ] ‏Metrics/storage slowdown.
- [ ] ‏Duplicate callback.
- [ ] ‏Out-of-order broker event.
- [ ] ‏Stale session callback after reconnect.

---

# ‏22. `Capital Ramp` הוא Experiment, לא Reward

‏כאשר קיימת זכאות והרשאה חוקית לעבור מעבר ל־Paper, גודל החשיפה אינו צריך לגדול משום ש“המערכת עבדה שבוע”.

‏הוא צריך לגדול רק אם השלב הקודם סיפק Evidence חדש.

```text
Shadow
→ Controlled small exposure
→ Observe execution truth
→ Recalibrate simulator
→ Revalidate edge retention
→ Only then consider next bounded stage
```

‏העיקרון הוא `Evidence before Exposure`.

‏אין threshold אוניברסלי של כסף/ימים/מספר עסקאות שמתאים לכל מערכת.

---

# ‏23. תנאי Promotion

‏Promotion חייב להיות מבוסס על criteria שהוגדרו **לפני** שרואים את התוצאה.

‏דוגמאות לקטגוריות:

- ‏Data quality stays inside budget.
- ‏Latency stays inside budget.
- ‏Execution slippage stays inside expected envelope.
- ‏Post-fill markout אינו גרוע מהמודל מעבר לטולרנס שהוגדר.
- ‏Position reconciliation clean.
- ‏No unexplained duplicate/unknown-order incidents.
- ‏Risk invariants remain intact.
- ‏Kill/recovery drills pass.
- ‏Net-edge retention אינו קורס.

‏המספרים עצמם צריכים להגיע מהמחקר והמערכת, לא מחוק אצבע שרירותי.

---

# ‏24. תנאי `NO-GO`

‏דוגמאות ל־No-Go מיידי:

```text
Unknown account/environment identity
Stale or incomplete market data
Broken reconciliation
Unresolved exposure mismatch
Kill switch not verified
Unknown duplicate-order risk
Unbounded retry loop
Exit path not verified
Simulation/live mismatch unexplained
Costs exceed expected edge
Signal expires before realistic execution
Critical observability missing
Eligibility/permissions unresolved
```

‏אפילו Backtest חזק אינו גובר על אף אחד מאלה.

---

# ‏25. `Readiness Score` — למה לא להפוך הכול לציון יחיד

‏מפתה ליצור:

```text
ReadinessScore = 93/100
```

‏אבל זה מסוכן.

‏אם kill switch שבור, העובדה שעוד 93 דברים עובדים אינה רלוונטית.

‏לכן נשתמש במבנה:

```text
P0 Gates = all must pass
P1 Findings = explicit disposition required
P2 Improvements = backlog
```

‏אפשר להוסיף dashboard מספרי, אבל הוא לעולם לא יחליף Gate semantics.

---

# ‏26. `Evidence Pack` לפני Promotion

‏לפני מעבר stage שומרים snapshot של Evidence:

```text
StrategyVersion
FeatureVersion
VetoVersion
ExecutionPolicyVersion
RiskConfigVersion
DataProviderVersion
BrokerAdapterVersion
DatasetIds
ReplayResults
ShadowResults
LatencyReport
CostReport
FillReport
RecoveryTestReport
SafetyTestReport
KnownRisks
PromotionDecision
```

‏כך promotion אינו אירוע שאי אפשר לשחזר אחר כך.

---

# ‏27. `Known Risks Register`

‏אין מערכת ללא known risks.

‏לכל risk פתוח:

```text
RiskId
Description
Severity
Likelihood
Detection
Mitigation
ResidualRisk
Owner
Expiration/ReviewDate
```

‏`KnownRisk != IgnoredRisk`.

---

# ‏28. `Assumption Register`

‏לפני Live צריך לדעת אילו assumptions עדיין אינן Facts.

‏דוגמאות:

- ‏Expected fill probability.
- ‏Expected queue behavior.
- ‏Expected provider latency.
- ‏Expected broker latency.
- ‏Expected spread under bursts.
- ‏Expected adverse-selection rate.
- ‏Expected exit liquidity.

‏כל assumption צריכה Metric שיכול לאשש או להפריך אותה.

---

# ‏29. `Unknowns Budget`

‏לא כל unknown הוא blocker.

‏אבל אסור לאפשר יותר מדי unknowns מהותיים במקביל.

‏נבדיל בין:

```text
Known Safe Unknown
Bounded Unknown
Unbounded Unknown
Safety-Critical Unknown
```

‏`Safety-Critical Unknown` הוא `P0 NO-GO`.

---

# ‏30. `First Live Objective`

‏היעד הראשון של מערכת חדשה אינו “להרוויח”.

‏היעד המחקרי הוא:

```text
Measure the gap between modeled reality and actual reality.
```

‏נרצה ללמוד:

- ‏Actual latency.
- ‏Actual fills.
- ‏Actual costs.
- ‏Actual adverse selection.
- ‏Actual no-fill rate.
- ‏Actual exit behavior.
- ‏Actual operational failure rate.
- ‏Actual simulator error.

‏רק אחרי זה אפשר לשפר confidence.

---

# ‏31. `Edge Retention` לפני PnL

‏Metric חשוב:

```text
EdgeRetention = RealizedExecutableEdge / ExpectedExecutableEdge
```

‏הגדרה מדויקת תלויה במודל, אבל העיקרון חשוב:

‏אם expected edge גדול אבל retention נמוך, ייתכן שהבעיה Execution ולא Prediction.

‏אם retention טוב אבל prediction עצמו התדרדר, הבעיה Research/Regime.

---

# ‏32. `First Divergence RCA`

‏כאשר expected ו־actual שונים, לא מתחילים מה־PnL.

‏מחפשים את הנקודה הראשונה שבה המציאות סטתה:

```text
Market observation
→ Canonical data
→ Feature
→ Rank
→ Veto
→ Decision
→ Risk gate
→ Order intent
→ Submit
→ Broker state
→ Fill
→ Position
→ Exit
→ Flat
```

‏ה־First Divergence בדרך כלל נותן RCA הרבה יותר שימושי מהתוצאה הסופית.

---

# ‏33. `Stop Conditions` חייבים להיות כתובים מראש

‏דוגמאות לקטגוריות:

- ‏Unexplained order-state mismatch.
- ‏Repeated data gaps.
- ‏Latency outside envelope.
- ‏Unexpected cost increase.
- ‏Abnormal fill toxicity.
- ‏Risk invariant violation.
- ‏Recovery failure.
- ‏Safety control failure.
- ‏Edge-retention collapse.
- ‏Regime outside validated envelope.

‏כאשר stop condition מופעל, המערכת אינה “נותנת עוד צ׳אנס” אוטומטית.

---

# ‏34. `Resume Conditions`

‏Resume אינו ההפך האוטומטי של Stop.

‏צריך להוכיח:

```text
Cause understood
Mitigation applied
State reconciled
Tests pass
Readiness restored
Explicit resume decision recorded
```

---

# ‏35. `Daily Readiness` שונה מ־`Promotion Readiness`

‏מערכת יכולה להיות מאושרת עקרונית אך לא מוכנה היום.

‏לכן בתחילת session בודקים לפחות:

- [ ] ‏Correct environment/account.
- [ ] ‏Correct build/config.
- [ ] ‏Market-data quality.
- [ ] ‏Broker connectivity/readiness.
- [ ] ‏No unexpected positions/orders.
- [ ] ‏Clock health.
- [ ] ‏Risk config loaded.
- [ ] ‏Safety controls armed.
- [ ] ‏Storage/telemetry healthy.
- [ ] ‏No unresolved critical incident.

---

# ‏36. `Readiness State Machine`

‏במקום Boolean:

```text
OFFLINE
STARTING
RECONCILING
SHADOW_READY
ENTRY_BLOCKED
LIVE_READY
DEGRADED
EXIT_ONLY
HALTED
```

‏State transition חייבת להיות explainable ומגובה ב־reason codes.

---

# ‏37. `Live Permission Token`

‏רעיון ארכיטקטוני שימושי:

‏Strategy אינה שולחת Order ישירות.

‏לפני entry נדרש `LivePermission` זמני שמוכיח:

```text
DataReady
ScannerReady
RiskReady
BrokerReady
SafetyReady
EligibilityReady
SignalStillValid
```

‏אם token פג לפני submit — revalidate.

‏כך readiness אינה assumption גלובלי ישן.

---

# ‏38. `Fail Closed for New Risk`

‏במקרה של ambiguity:

```text
New Entry → blocked
Risk Reduction → preserved when safely possible
```

‏זה שונה מ־“הכול נעצר תמיד”.

‏מערכת בטוחה צריכה לנסות לשמר יכולת לצמצם exposure גם כאשר אסור להגדיל אותו.

---

# ‏39. `Operator Readiness`

‏גם מערכת אוטומטית צריכה operator discipline.

- [ ] ‏ברור איך לזהות environment.
- [ ] ‏ברור איך להפעיל safety state.
- [ ] ‏ברור איך לבדוק open orders/positions.
- [ ] ‏ברור איך לבצע reconciliation.
- [ ] ‏ברור מתי **לא** לבצע פעולה ידנית.
- [ ] ‏manual intervention מתועד.
- [ ] ‏אין reliance על memory בלבד בזמן incident.
- [ ] ‏Runbook זמין.

---

# ‏40. `Change Freeze` סביב Promotion

‏לא משנים Strategy, execution, risk ו־infrastructure כולם יחד רגע לפני promotion.

‏אחרת לא נוכל לדעת מה גרם להבדל.

‏עדיף:

```text
Freeze baseline
→ validate
→ promote bounded stage
→ observe
→ change one meaningful dimension
```

---

# ‏41. `Configuration Drift`

‏לפני session חשוב להשוות:

```text
Expected Config Hash
vs
Loaded Config Hash
```

‏Config drift יכול להיות מסוכן בדיוק כמו code drift.

---

# ‏42. `Clock Readiness`

- [ ] ‏Durations נמדדים ב־monotonic clock.
- [ ] ‏Wall-clock synchronization monitored.
- [ ] ‏Timestamp source semantics ידועים.
- [ ] ‏אין subtract בין clocks בלתי מסונכרנים כאילו הם clock אחד.
- [ ] ‏Clock anomaly יכולה לחסום time-sensitive entries אם היא פוגעת בנכונות.

---

# ‏43. `Broker Truth Reconciliation`

‏לפני readiness:

```text
Local Positions == Broker Positions
Local Working Orders == Broker Working Orders
Pending Exposure reconciled
No unexplained orphan state
```

‏כאשר אין התאמה — `ENTRY_BLOCKED`.

---

# ‏44. `Market Data vs Execution Broker Separation`

‏אם Market Data Provider שונה מה־Execution Broker:

- [ ] ‏symbol mapping verified.
- [ ] ‏session/trading-status semantics aligned.
- [ ] ‏price/tick conventions aligned.
- [ ] ‏corporate-action identity aligned.
- [ ] ‏staleness/divergence monitored.
- [ ] ‏execution precheck אינו מסתמך בעיוורון על feed אחר.

---

# ‏45. `Performance Readiness`

‏Performance אינו רק throughput.

- [ ] ‏p99 event→decision בתוך envelope.
- [ ] ‏p99 decision→submit בתוך envelope.
- [ ] ‏exit-trigger→submit בתוך envelope.
- [ ] ‏queue age bounded.
- [ ] ‏no unbounded task/queue growth.
- [ ] ‏GC/allocations monitored.
- [ ] ‏telemetry cannot block safety path.
- [ ] ‏burst test passed.
- [ ] ‏reconnect catch-up passed.

---

# ‏46. `Economic Readiness`

‏לפני promotion צריך להוכיח:

```text
ExpectedGrossEdge
- ExpectedEntryCost
- ExpectedExitCost
- ExpectedAdverseSelection
- ExpectedImpact
- ExpectedLatencyDecay
- ExpectedMiss/NoFillCost
> RequiredMarginOfSafety
```

‏לא מספיק `> 0` על הנייר.

‏צריך headroom נגד model error.

---

# ‏47. `Margin of Safety`

‏אם expected edge כמעט שווה ל־cost estimate, strategy רגישה מדי לטעות קטנה.

‏לכן נמדוד:

```text
EdgeHeadroom = ExpectedNetEdge - UncertaintyBuffer
```

‏אם `EdgeHeadroom <= 0`, ‏`NO TRADE` או `NO-GO` למחקר הנוכחי.

---

# ‏48. `Uncertainty Buffer`

‏Buffer יכול לשקף:

- ‏Latency uncertainty.
- ‏Fill uncertainty.
- ‏Cost uncertainty.
- ‏Data-quality uncertainty.
- ‏Model uncertainty.
- ‏Regime uncertainty.

‏המטרה אינה לנחש מספר “בטוח”, אלא להכיר בכך שה־estimate אינו exact.

---

# ‏49. `Live Calibration Loop`

‏לאחר observation אמיתי:

```text
Observe
→ Compare to model
→ Attribute gap
→ Recalibrate simulator
→ Re-run validation
→ Decide whether policy changes
```

‏אסור לכייל simulator כדי “להחזיר” PnL יפה.

‏מכיילים אותו כדי להתקרב למציאות.

---

# ‏50. `Practitioner Secrets`

## ‏50.1 ‏מערכת שלא יודעת להגיד `NO-GO` אינה מקצועית

‏אם כל checklist בסוף תמיד הופך ל־“כן”, הוא ceremony ולא control.

## ‏50.2 ‏ה־first live bug בדרך כלל נמצא ב־boundary

‏לא בהכרח ב־formula של Strategy.

‏לעיתים הוא ב־timestamp, state mapping, reconnect, order lifecycle או config.

## ‏50.3 ‏Positive PnL יכול להסתיר failure

‏אפשר להרוויח במקרה גם כאשר:

- ‏Order הוכפל.
- ‏Risk state היה שגוי.
- ‏Fill model היה שגוי.
- ‏Latency חרג.

‏Operational correctness נבדק בנפרד מ־PnL.

## ‏50.4 ‏Negative PnL אינו בהכרח Strategy failure

‏צריך attribution לפני conclusion.

## ‏50.5 ‏ה־Exit path צריך יותר אמון מה־Entry path

‏Entry failure יכול לגרום ל־missed opportunity.

‏Exit failure יכול להשאיר exposure לא רצוי.

## ‏50.6 ‏Recovery שלא נבדק אינו Recovery

‏“המערכת תתחבר מחדש” אינו test result.

## ‏50.7 ‏Small exposure אינו מחליף Safety

‏גם exposure קטן יכול לחשוף duplicate orders, broken reconciliation או unknown state.

## ‏50.8 ‏Paper אינו מודל מלא של Live

‏הוא שלב Evidence חשוב, לא proof מוחלט.

## ‏50.9 ‏יותר Monitoring אינו תמיד יותר Safety

‏Telemetry שמעמיס על hot path יכולה ליצור את התקלה שהיא מנסה למדוד.

## ‏50.10 ‏ה־Checklist צריך להתעדכן מאירועים אמיתיים

‏כל incident/near-miss משמעותי צריך לשאול:

```text
Which checklist item should have caught this earlier?
```

---

# ‏51. `Minimal P0 Gate` לרובוט שלנו

‏אם רוצים checklist קצר שצריך לזכור בעל־פה, זהו ה־minimum:

```text
1. Data fresh and trustworthy?
2. Universe/ranking fair and current?
3. No hard veto?
4. Signal still alive?
5. Entry and exit executable?
6. Net edge positive with headroom?
7. Pending exposure known?
8. Broker state reconciled?
9. Exit path healthy?
10. Kill/recovery controls healthy?
11. Correct account/build/config/environment?
12. Eligibility/permissions verified?
```

‏אם אחת התשובות אינה “כן, עם Evidence” — אין Entry חדש.

---

# ‏52. `Go/No-Go Record`

‏כל promotion משמעותי צריך להפיק record:

```text
DecisionId
Timestamp
StrategyVersion
Environment
Decision = GO | NO_GO | CONDITIONAL
P0GateResults
P1Findings
KnownRisks
EvidencePackId
Reviewer/Owner
Conditions
Expiration
```

‏`GO` אינו הרשאה נצחית.

‏הוא תקף לגרסה ולתנאים שנבדקו.

---

# ‏53. `Conditional GO`

‏לעיתים אפשר לאשר רק scope מוגבל:

```text
GO for Shadow
GO for specific symbols/universe
GO for specific session conditions
GO for bounded experimental exposure
GO with advanced features disabled
```

‏כך לא חייבים לבחור רק בין “הכול” ל־“כלום”.

---

# ‏54. `Automatic Downgrade`

‏אם readiness נפגעת:

```text
LIVE_READY
→ ENTRY_BLOCKED
→ EXIT_ONLY
→ HALTED
```

‏לפי severity.

‏המערכת צריכה להיות מסוגלת לרדת רמה אוטומטית כאשר Evidence נחלש.

---

# ‏55. `Readiness Expiration`

‏Evidence מתיישן.

‏שינוי משמעותי ב־:

- ‏Strategy.
- ‏Feature set.
- ‏Veto policy.
- ‏Execution tactic.
- ‏Broker adapter.
- ‏Market data provider.
- ‏Risk config.
- ‏Deployment/runtime.

‏יכול לפוג readiness קודמת ולדרוש revalidation.

---

# ‏56. `Change Classification`

‏נסווג שינוי ל־:

```text
No behavioral impact
Observability only
Model behavior change
Execution behavior change
Risk behavior change
Infrastructure behavior change
Safety-critical change
```

‏ככל שהשינוי קרוב יותר ל־Risk/Execution/Safety, promotion מחדש צריך להיות מחמיר יותר.

---

# ‏57. `RCA Before Resume`

‏אם CI/Live/Shadow מצביע על warning/error משמעותי:

‏לא מסתפקים בתיקון מקומי.

‏צריך לשאול:

1. ‏מה קרה?
2. ‏למה קרה?
3. ‏למה המערכת לא מנעה/זיהתה מוקדם יותר?
4. ‏האם אותו failure pattern קיים במקומות נוספים?
5. ‏איזה test/control/checklist item נוסיף?

‏רק אז ממשיכים promotion.

---

# ‏58. `Definition of Ready`

‏מערכת קצרה נחשבת `Ready for the next controlled stage` רק אם:

1. ‏ה־Research Thesis מתועדת ושרדה OOS.
2. ‏ה־Data point-in-time correct ו־quality monitored.
3. ‏ה־Scanner fresh/deterministic/revalidated.
4. ‏Negative Evidence יכול לעצור trade.
5. ‏Execution state machine מטפלת ב־unknowns/partials/races.
6. ‏Exit path עצמאי ומהיר מספיק.
7. ‏Risk כולל pending exposure.
8. ‏Kill/Recovery/Reconciliation עברו תרחישי כשל.
9. ‏Latency/cost/fill reality נמצאים בתוך envelope סביר.
10. ‏Observability מאפשרת RCA מקצה לקצה.
11. ‏Operations/Security/Environment מוכחים.
12. ‏Eligibility/permissions תקפים.
13. ‏Promotion criteria ו־stop criteria הוגדרו מראש.
14. ‏Known risks מתועדים.
15. ‏אין `P0` פתוח.

---

# ‏59. מה צריך לזכור בעל־פה

1. ‏`Good Backtest != Live Ready`.
2. ‏`Paper Success != Execution Proof`.
3. ‏`Connected != Ready`.
4. ‏`Sent != Filled`.
5. ‏`CancelRequested != Canceled`.
6. ‏`Local Truth != Broker Truth` עד reconciliation.
7. ‏Pending exposure הוא exposure.
8. ‏Exit readiness חשובה לפחות כמו Entry readiness.
9. ‏Safety gate גובר על Strategy score.
10. ‏`NO TRADE` ו־`NO-GO` הם outcomes תקינים.
11. ‏Promotion דורש Evidence, לא ביטחון.
12. ‏כל `GO` מוגבל לגרסה, scope ותנאים שנבדקו.

---

# ‏60. המשפט המסכם

> ‏**לפני כסף אמיתי לא שואלים “האם נראה שהרובוט עובד?”. שואלים האם כל שכבה שיכולה ליצור, להגדיל, להסתיר או להשאיר Exposure הוכיחה שהיא נשלטת, ניתנת לשחזור ויכולה להיכשל בצורה בטוחה. אם התשובה אינה כן — נשארים בשלב המחקר/Replay/Paper/Shadow המתאים וממשיכים ללמוד.**

---

# ‏61. מעבר לשלב הבא

‏הפרק הזה מסיים את מקטע `Practitioner Mastery` של ה־Roadmap.

‏השלב הבא הוא:

**65 — `Classic Indicators`**

‏שם נתחיל את מקטע הידע הרחב ונלמד Indicators קלאסיים בצורה מקצועית: מה הם באמת מודדים, אילו מהם רק transformations של אותו price series, מתי הם useful, מתי הם redundant, ואיך לחשוב עליהם בתוך מערכת short-horizon בלי להפוך רשימת Indicators ל־Strategy בפני עצמה.
