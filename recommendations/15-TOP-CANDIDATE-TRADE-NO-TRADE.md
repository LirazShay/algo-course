# ‏15 — Recommendation Sheet: Top Candidate / Trade No Trade

> ‏מקור לימודי עיקרי: `../15-TOP-CANDIDATE-TRADE-NO-TRADE.md`.
>
> ‏מטרת הקובץ: לקבוע את חוזה ההחלטה שבין Ranking לבין Execution — מתי Top Candidate באמת טובה מספיק כדי להפוך ל־Trade Candidate, מתי צריך לבדוק Candidate הבאה, ומתי הפלט הנכון הוא `NO TRADE`.

---

## ‏1. Decision

‏מקטע 14 ענה על:

```text
Who is best among the eligible candidates now?
```

‏מקטע 15 צריך לענות על שאלה אחרת:

```text
Is any candidate good enough, fresh enough,
executable enough and economically attractive enough
for a trade decision now?
```

‏המערכת חייבת להפריד בין:

```text
RANKING
SELECTION
TRADE READINESS
EXECUTION READINESS
RISK / SYSTEM READINESS
FINAL PRE-TRADE RECHECK
```

‏והפלט חייב להיות מפורש:

```text
TRADE_CANDIDATE
or
NO_TRADE
```

‏`Rank #1` הוא קלט להחלטה — לא ההחלטה עצמה.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Decision Engine נפרד מה־Ranking Engine

‏ה־Baseline יהיה:

```text
Eligible Ranked Candidates
        ↓
Top-N Candidate Set
        ↓
Candidate Decision Engine
        ↓
TRADE_CANDIDATE / NO_TRADE
        ↓
Fresh Pre-Trade Recheck
        ↓
Execution
```

‏Ranking שואל מי עדיפה יחסית.

‏Decision שואל האם קיימת Opportunity אמיתית שמצדיקה Trade.

### ‏`P0 — Required`: Rank #1 לעולם אינו מספיק לבדו

‏מועמדת ראשונה חייבת לעבור לפחות:

```text
absolute quality
signal freshness / TTL
critical data health
execution readiness
minimum economic viability
risk/system readiness
final pre-trade recheck
```

‏אם אחד התנאים הקריטיים נכשל:

```text
NO_TRADE
```

‏או, כאשר הכשל Candidate-local בלבד:

```text
consider next candidate in the ladder
```

### ‏`P1 — Preferred Default`: Top-N Candidate Set, לא Top-1 יחיד

‏ה־Ranking Engine ישמור לפחות:

```text
Top 5 or Top N
```

‏ולכל Candidate:

```text
scanner_rank
score
subscores
absolute feature values
separation context
signal age
execution snapshot
```

‏כך Decision Engine יכול לבדוק Candidate אחרת אם #1 נופלת מסיבה מקומית.

### ‏`P0 — Required`: Candidate Ladder עם Reason-Aware Fallback

‏Fallback ל־#2/#3 מותר רק כאשר הפסילה שייכת ל־Candidate המסוימת.

‏דוגמה:

```text
#1 rejected: SPREAD_TOO_WIDE
#2 passes all gates
=> #2 may become selected candidate
```

‏אבל אם הסיבה היא גלובלית:

```text
MARKET_DATA_DEGRADED
BROKER_DISCONNECTED
CLOCK_UNHEALTHY
ACCOUNT_STATE_UNKNOWN
RISK_ENGINE_UNAVAILABLE
```

‏התוצאה היא:

```text
NO_TRADE
```

‏לא עוברים אוטומטית למועמדת אחרת.

### ‏`P1 — Preferred Default`: Absolute Quality Gate

‏Relative Rank לבדו אינו מספיק.

‏נדרש גם תנאי מוחלט כגון:

```text
prediction_quality >= validated_minimum
```

‏או בעתיד:

```text
expected_net_edge >= validated_minimum_edge
```

‏ה־Threshold עצמו אינו נקבע לפי אינטואיציה.

‏הוא מתקדם ל־Production רק לאחר:

```text
threshold sweep
sensitivity analysis
robust region
out-of-sample validation
walk-forward validation
```

### ‏`P0 — Required`: Freshness + Signal TTL

‏כל Decision חייב לדעת:

```text
signal_time
candidate_first_seen_time
candidate_age_ms
score_as_of_time
score_age_ms
quote_age_ms
trade_age_ms
feature_age_ms
```

‏אם ה־Signal או ה־Execution State עברו את התקציב המאומת:

```text
STALE
=> NO_TRADE / RECALCULATE
```

‏`TTL` חייב להיגזר מ־Signal Decay שנמדד, לא ממספר שרירותי.

### ‏`P0 — Required`: Execution Readiness הוא Gate נפרד

‏Prediction חזקה אינה מפצה על Execution גרוע.

‏לפני `TRADE_CANDIDATE` נדרש לפחות:

```text
quote fresh
bid/ask valid
spread acceptable for intended edge
planned size known
entry-side capacity acceptable
exit-side capacity acceptable
slippage estimate within budget
broker order state known
```

‏אם Execution אינו בר־אימות:

```text
NO_TRADE
```

### ‏`P1 — Preferred Default`: Expected Net Edge עדיף על Gross Opportunity כאשר ניתן לאמוד אותו אמין

‏הכיוון הכלכלי הוא:

```text
Expected Net Edge
= Expected Gross Opportunity
- Expected Entry Cost
- Expected Exit Cost
- Fees / Commissions
- Slippage
- Execution Uncertainty Allowance
```

‏אבל אם עדיין אין Cost Model אמין מספיק, לא נציג מספר מזויף כ־`Expected Net Edge`.

‏בשלב כזה נשתמש ב־components מפורשים וב־minimum economic gates שמוכחים בנפרד.

### ‏`P1 — Preferred Default`: Margin of Safety

‏Opportunity שה־edge המשוער שלה רק מעט מעל העלות אינה Baseline טוב למסחר חי.

‏לכן נדרש:

```text
expected_edge
> expected_cost
+ validated_safety_margin
```

‏ה־Safety Margin צריך להגן מפני:

```text
model error
quote movement
slippage variance
fill uncertainty
latency
cost estimation error
```

### ‏`P0 — Required`: `NO_TRADE` הוא First-Class Outcome

‏Decision Engine חייב להתייחס ל־`NO_TRADE` כאל החלטה תקינה ומלאה.

‏אין יעד מלאכותי של:

```text
capital always invested
trade every cycle
minimum trades per day
```

‏`CASH / FLAT` הוא State תקין כאשר אין Opportunity שעוברת את החוזה.

### ‏`P0 — Required`: Final Pre-Trade Recheck

‏גם Candidate שעברה את Decision Gate אינה Order עדיין.

‏ממש לפני Submit נבדוק מחדש לפחות:

```text
candidate identity still valid
critical signal state still valid
quote still fresh
spread / price cap still acceptable
candidate has not materially decayed
broker connected
account synchronized
position/open-order state known
risk permission still valid
```

‏אם Recheck נכשל:

```text
ABORT
NO_TRADE
```

### ‏`P1 — Preferred Default`: Deterministic Decision Contract

‏אותו Snapshot + אותן Versions חייבים לתת אותה תוצאה.

‏Decision צריך להיות ניתן לשחזור לפי:

```text
decision_version
feature_version
filter_version
score_version
cost_model_version
risk_policy_version
```

---

## ‏3. Why

### ‏Fact

‏Ranking תמיד מייצר Winner אם קיימת לפחות Candidate אחת.

‏זה אינו מוכיח שה־Winner טובה באופן מוחלט.

### ‏Judgment

‏במערכת קצרה מאוד, הפרדה בין Ranking לבין Trade Decision מפחיתה סיכון של מסחר כפוי ומאפשרת למדוד `NO_TRADE` באופן נקי.

### ‏Hypothesis

‏ייתכן ש־Absolute Quality, ‏Separation, ‏Persistence, ‏Candidate Age ו־Expected Net Edge ישפרו את איכות ההחלטה.

‏כל אחד מהם חייב להיבדק אמפירית ולא להפוך מיד ל־Hard Rule.

### ‏Economic Chain

```text
Signal
→ Ranking
→ Candidate Selection
→ Trade Readiness
→ Execution Recheck
→ Fill
→ Exit
→ Costs
→ Net Outcome
```

‏Decision Engine קיים כדי למנוע ממועמדת טובה יחסית לעבור אוטומטית ל־Execution כאשר אין לה Edge כלכלי בר־ביצוע.

---

## ‏4. Use When

‏ה־Baseline מתאים כאשר:

- ‏יש Ranking אמין ו־Top-N זמינים.
- ‏יש Feature/Score snapshots point-in-time correct.
- ‏ניתן לבדוק freshness ו־signal age.
- ‏יש לפחות L1 execution state אמין.
- ‏אפשר להבחין בין Candidate-local failure לבין Global failure.
- ‏Risk/Broker/System state ניתנים לאימות.
- ‏קיימים Labels למחקר Decision Policy.

---

## ‏5. Do Not Use When

‏אין להפוך את Decision Engine ל־Live gate אם:

- ‏Score אינו reproducible.
- ‏אין point-in-time data.
- ‏אין Execution-aware labels.
- ‏אין תיעוד של NO_TRADE decisions.
- ‏Broker/account state אינו מסונכרן.
- ‏לא ניתן להבדיל בין stale data לבין market inactivity.
- ‏Thresholds נבחרו על אותו Dataset שעליו מציגים ביצועים.
- ‏Cost model אינו מובן אבל מוצג כאילו הוא מדויק.

---

## ‏6. Alternatives

### ‏Alternative A — Always Trade Rank #1

‏שימוש:

```text
research baseline only
```

‏יתרון:

- ‏פשוט מאוד.
- ‏מודד כמה ערך Ranking לבדו נותן.

‏חיסרון:

- ‏מכריח Trade גם ביום חלש.
- ‏מתעלם מ־absolute quality.
- ‏מסוכן כ־Production default.

### ‏Alternative B — Rank #1 + Single Score Threshold

‏פשוט וקל למדידה.

‏יכול להיות Baseline ראשון סביר, אבל אינו מספיק אם:

```text
execution quality varies materially
signal age varies
costs vary
```

### ‏Alternative C — Multi-Gate Rule Engine

‏זהו ה־Preferred Baseline.

```text
quality
freshness
execution
net economics
risk/system
recheck
```

### ‏Alternative D — Two-Stage Statistical Model

‏Stage 1:

```text
ranking model
```

‏Stage 2:

```text
trade-worthiness model
```

‏`P3 Challenger` לאחר Dataset מספיק ו־labels אמינים.

### ‏Alternative E — Expected Net Edge Model

‏מנסה לייצר ישירות:

```text
expected executable net outcome
```

‏מבטיח יותר מבחינה כלכלית, אך דורש:

```text
prediction
fill model
slippage model
cost model
exit model
```

‏ולכן אינו Baseline ראשון.

---

## ‏7. Trade-offs

### ‏יותר Gates

‏יתרון:

- ‏פחות עסקאות חלשות.
- ‏יותר explainability.

‏חיסרון:

- ‏יותר false negatives.
- ‏יותר complexity.
- ‏יותר latency אם הבדיקות כבדות.

### ‏יותר Confirmation / Persistence

‏יתרון:

- ‏יכול להפחית noise.

‏חיסרון:

- ‏מוסיף delay.
- ‏עלול להרוג Signal קצר.

### ‏Top-N Ladder

‏יתרון:

- ‏לא מאבד Opportunity רק כי #1 לא executable.

‏חיסרון:

- ‏דורש שמירה והשוואה רחבה יותר.
- ‏עלול לעודד over-selection אם לא שומרים Absolute Gate.

### ‏Expected Net Edge

‏יתרון:

- ‏קרוב יותר למטרה הכלכלית האמיתית.

‏חיסרון:

- ‏רגיש לשגיאות מודל.
- ‏מספר יחיד עלול לתת false precision.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏Decision Model ML נפרד.
- ‏עשרות Thresholds.
- ‏Dynamic thresholds לפי כל שעה/סקטור/symbol.
- ‏Confidence score שאין לו Definition.
- ‏Hysteresis חזק לפני שמדדנו Candidate churn.
- ‏Cooldown קשיח בלי Evidence.
- ‏Expected Net Edge יחיד שמסתיר את components.
- ‏Fallback אוטומטי ל־#2 בכל rejection.
- ‏Trade frequency target.
- ‏Rule שמחייב להיות תמיד מושקע.

---

## ‏9. What to Add Later

‏לפי Evidence:

1. ‏Separation-aware trade gating.
2. ‏Rank persistence / dwell-time gating.
3. ‏Candidate churn / hysteresis.
4. ‏Signal decay-aware TTL.
5. ‏Decision confidence model.
6. ‏Expected Net Edge model.
7. ‏Regime-aware thresholds.
8. ‏Decision Surface optimization.
9. ‏Candidate ladder depth adaptation.
10. ‏Deep confirmation on shortlist.
11. ‏Shadow decision policies.
12. ‏Re-entry / cooldown policy.
13. ‏Two-stage statistical model.
14. ‏Opportunity regret analysis.

---

## ‏10. Required Data / Evidence

‏לכל Decision Cycle נשמור לפחות:

```text
decision_id
decision_time
as_of_time
universe_version
feature_version
filter_version
score_version
decision_version
cost_model_version
risk_policy_version

candidate_set_size
ranked_top_n

for each candidate:
  symbol
  scanner_rank
  score
  subscores
  absolute feature values
  separation_to_previous / next when relevant
  candidate_first_seen_time
  candidate_age_ms
  score_age_ms
  quote_age_ms
  trade_age_ms
  signal_state
  execution_state
  planned_qty
  bid
  ask
  bid_size
  ask_size
  spread
  estimated_slippage
  expected_gross_edge when modeled
  expected_cost when modeled
  expected_net_edge when modeled
  gate results
  rejection reasons

selected_symbol
selected_rank
trade_or_no_trade
selection_reasons
no_trade_reasons
system_health
broker_state
risk_state
```

### ‏Timestamps

‏נשמור לפחות:

```text
signal_time
decision_time
recheck_time
order_submit_time
broker_ack_time
first_fill_time
last_fill_time
```

### ‏Future Labels למחקר

```text
forward_executable_return_1s
forward_executable_return_2s
forward_executable_return_5s
forward_executable_return_10s
forward_executable_return_30s
forward_executable_return_60s

time_to_first_positive_net_mark
time_to_target
MFE_1s/2s/5s/10s/30s/60s
MAE_1s/2s/5s/10s/30s/60s
realistic_fill_available
realized_or_simulated_net_outcome
```

‏יש לשמור Labels גם ל־TRADE וגם ל־NO_TRADE / rejected candidates במידת האפשר.

---

## ‏11. Promotion Criteria

### ‏Absolute Quality Gate

‏מקודם רק אם:

- ‏קיים קשר יציב בין Threshold לבין executable future outcome.
- ‏קיים robust region ולא magic number יחיד.
- ‏התוצאה שורדת OOS ו־walk-forward.
- ‏Opportunity count נשאר שימושי.
- ‏Net outcome משתפר לאחר costs.

### ‏Separation Gate

‏מקודם רק אם:

- ‏פער גדול יותר מנבא תוצאה טובה יותר בצורה יציבה.
- ‏השיפור נשמר מעבר ל־Score עצמו.
- ‏אין פגיעה מוגזמת ב־opportunity capture.

### ‏Persistence / Stability Gate

‏מקודם רק אם:

- ‏ה־confirmation benefit גדול מה־latency cost.
- ‏Signal delay לא מוחק את ה־edge.
- ‏הקשר נשמר בכמה regimes.

### ‏Expected Net Edge Gate

‏מקודם רק אם:

- ‏Cost model calibrated מספיק.
- ‏Prediction + fill + slippage + exit assumptions ניתנים לבדיקה.
- ‏ה־estimate monotonic מספיק מול realized outcome.
- ‏אין false precision משמעותי.

### ‏Candidate Ladder

‏מקודם אם:

- ‏#2/#3 שנבחרו אחרי Candidate-local rejection משפרות capture בלי להוריד איכות נטו.
- ‏global failures עדיין מפסיקים את כל ה־Decision flow.

---

## ‏12. Rejection Criteria

‏נדחה Rule/Threshold אם:

- ‏עובד רק בנקודה מדויקת אחת.
- ‏נעלם OOS.
- ‏מעלה Hit Rate אך מוריד Net EV.
- ‏מקטין trades בצורה קיצונית בלי שיפור כלכלי.
- ‏מוסיף latency שגדולה מ־signal half-life.
- ‏מבוסס על labels לא executable.
- ‏דורש מידע שלא קיים live.
- ‏יוצר fallback מסוכן בזמן global degradation.
- ‏אינו explainable/replayable.
- ‏מספר ה־NO_TRADE false negatives הופך משמעותי בלי פיצוי באיכות.

---

## ‏13. Metrics

### ‏Decision Quality

```text
trade_rate
no_trade_rate
trade_count
no_trade_count
candidate_reject_rate_by_reason
selected_rank_distribution
```

### ‏Opportunity Quality

```text
avg / median net outcome
P5 / P50 / P95 outcome
hit_rate by horizon
time_to_first_positive_net_mark
time_to_target
MFE / MAE
```

### ‏Threshold Quality

```text
outcome by score bucket
outcome by separation bucket
outcome by age bucket
outcome by execution-quality bucket
threshold sensitivity
```

### ‏Selection Quality

```text
selected vs #2
selected vs Top-5 average
selected vs random eligible
selected vs momentum-only baseline
regret analysis
```

### ‏Operational Quality

```text
candidate_to_decision_ms
candidate_to_recheck_ms
candidate_to_submit_ms
P50/P95/P99 decision latency
recheck_abort_rate
stale-at-recheck rate
```

### ‏Classification View

‏כאשר קיים executable opportunity label:

```text
precision
recall
false_positive_rate
false_negative_rate
```

‏אבל לא נשתמש ב־classification metrics לבדם במקום Net Economics.

---

## ‏14. Failure Modes

### ‏Failure Mode A — Forced Trading

```text
Top 1 always becomes trade
```

‏תוצאה:

- ‏עסקאות חלשות בימים מתים.
- ‏NO_TRADE אינו אפשרי.

### ‏Failure Mode B — Candidate-Local vs Global Confusion

‏#1 נכשלת בגלל Broker disconnected, והמערכת בודקת #2.

‏זה Bug לוגי.

### ‏Failure Mode C — Stale Winner

‏Candidate הייתה #1 לפני רגע אבל decision/recheck פועל על Signal ישן.

### ‏Failure Mode D — Gross Edge Illusion

‏Prediction חיובי אבל spread/slippage/fees מוחקים אותו.

### ‏Failure Mode E — Threshold Overfit

‏ערך אחד מדויק נראה מושלם ומסביבו הכל קורס.

### ‏Failure Mode F — Confirmation Kills Edge

‏Persistence rule מוריד noise אך מאחר מעבר ל־signal half-life.

### ‏Failure Mode G — False Confidence

‏Score 87 מוצג כ־87% הצלחה בלי Calibration.

### ‏Failure Mode H — No-Trade Blindness

‏המערכת שומרת רק Trades ולכן אינה יודעת אם פסלה Opportunities טובות.

### ‏Failure Mode I — Candidate Churn

‏Top Candidate מתחלפת מהר והמערכת רודפת אחרי rank noise.

### ‏Failure Mode J — Cost Model False Precision

‏Expected Net Edge מוצג ב־basis points מדויקים בעוד slippage/fill uncertainty גבוהה.

### ‏Failure Mode K — Recheck Bypass

‏Decision עבר, אבל Order נשלח בלי Refresh של state קריטי.

### ‏Failure Mode L — Decision Non-Determinism

‏אותו Snapshot יוצר החלטות שונות בגלל ordering/concurrency לא מבוקר.

---

## ‏15. User-Specific Application

‏למערכת קצרה מאוד של broad-universe momentum, ה־Baseline המומלץ הוא:

```text
Wide universe
→ hard eligibility filters
→ feature engine
→ prediction ranking
→ Top-N
→ candidate ladder
→ absolute quality gate
→ signal age / TTL gate
→ fresh L1 execution gate
→ economic viability gate
→ broker/account/risk/system gate
→ final pre-trade recheck
→ TRADE_CANDIDATE / NO_TRADE
```

### ‏Initial Candidate Decision Contract

```text
candidate exists
AND candidate is still eligible
AND absolute prediction quality passes validated minimum
AND critical data is fresh
AND signal age is within validated TTL
AND execution state is known
AND entry/exit economics remain acceptable
AND expected edge has sufficient margin over friction
AND broker/account state is synchronized
AND risk policy permits new entry
AND final recheck still passes
=> TRADE_CANDIDATE

otherwise
=> NO_TRADE or evaluate next candidate only if rejection is candidate-local
```

### ‏Candidate-local Rejections

‏דוגמאות שעשויות לאפשר מעבר ל־#2:

```text
SPREAD_TOO_WIDE
INSUFFICIENT_VISIBLE_CAPACITY
LOW_ABSOLUTE_QUALITY
SIGNAL_TOO_OLD
LOW_EXPECTED_NET_EDGE
CANDIDATE_SPECIFIC_DATA_INVALID
```

### ‏Global Rejections

‏דוגמאות שחוסמות את כל Cycle:

```text
MARKET_DATA_FEED_DEGRADED
BROKER_DISCONNECTED
ACCOUNT_STATE_UNKNOWN
CLOCK_UNHEALTHY
GLOBAL_RISK_LOCK
SYSTEM_RECOVERY
MARKET_WIDE_UNSUPPORTED_STATE
```

---

## ‏16. Concrete Baseline Contract

### ‏Decision State Machine

```text
RANKED
  ↓
CANDIDATE_SELECTED
  ↓
DECISION_GATES_RUNNING
  ↓
TRADE_CANDIDATE
  ↓
PRE_TRADE_RECHECK
  ↓
READY_FOR_EXECUTION
```

‏או בכל שלב:

```text
REJECTED
→ NO_TRADE / NEXT_CANDIDATE / GLOBAL_ABORT
```

### ‏Decision Result

```text
decision_id
result = TRADE_CANDIDATE | NO_TRADE
selected_symbol
selected_rank
primary_reason_code
all_reason_codes
decision_version
snapshot_id
```

### ‏Candidate Gate Results

```text
absolute_quality = PASS/FAIL
freshness        = PASS/FAIL
signal_ttl       = PASS/FAIL
execution        = PASS/FAIL
economics        = PASS/FAIL
risk             = PASS/FAIL
system           = PASS/FAIL
final_recheck    = PASS/FAIL
```

---

## ‏17. Confidence

### ‏High Confidence

- ‏Ranking ו־Trade Decision צריכים להיות נפרדים.
- ‏`Rank #1` אינו מספיק.
- ‏`NO_TRADE` חייב להיות outcome מפורש.
- ‏Freshness, broker/account/risk/system readiness הם Gates קריטיים.
- ‏Pre-trade recheck נחוץ למסחר קצר.
- ‏Decision snapshots ו־reason codes חיוניים ל־RCA.
- ‏Global failure אסור להפוך ל־fallback ל־#2.

### ‏Medium Confidence

- ‏Top-N ladder הוא Baseline טוב יותר מ־Top-1 יחיד.
- ‏Absolute Quality Gate ישפר Trade quality לאחר tuning נכון.
- ‏Margin of Safety מעל costs חיוני כלכלית.

### ‏Low / Evidence Required

- ‏Separation as hard gate.
- ‏Persistence confirmation.
- ‏Hysteresis.
- ‏Cooldown / re-entry restrictions.
- ‏Confidence composite score.
- ‏Expected Net Edge model superiority.
- ‏Dynamic / regime-aware thresholds.
- ‏Two-stage statistical decision model.

---

## ‏18. Time-Sensitive Facts

‏המקטע מתודולוגי בעיקרו.

‏לפני Production יש לאמת מחדש כל פרט תלוי־Broker/Provider/Account, לרבות:

1. ‏Broker connectivity semantics.
2. ‏Account state freshness.
3. ‏Buying-power semantics.
4. ‏Order-state reconciliation behavior.
5. ‏Market-data freshness/coverage semantics.
6. ‏Fee/commission schedule.
7. ‏Session/order support.
8. ‏Any broker-side risk restrictions.

‏אין להקשיח ערכים נוכחיים לתוך Decision Contract כאילו הם קבועים לנצח.

---

## ‏19. Current Verification Snapshot

‏לא נדרש במקטע זה אימות Web חדש כדי לקבע את ה־Decision architecture.

‏ה־Sheet נשען על:

- ‏הפרדות שכבר נקבעו במקטעים 02–14.
- ‏עקרונות point-in-time, freshness, execution feasibility ו־risk/system gating.
- ‏הדרישה שכל capability חיצונית תעבור אימות עדכני לפני Production.

---

## ‏20. Relationship to Later Sheets

### ‏16 — Entry / Execution

‏מקבל רק Candidate שעברה את Decision Contract ואת ה־final recheck.

### ‏17 — Exit

‏ישתמש ב־actual fills ובמצב Position, לא ב־Decision request המקורי.

### ‏18 — Costs

‏יעמיק את Cost Model שעליו נשען economic viability gate.

### ‏19 — Position Sizing / Risk

‏יחזק את Risk Gate והקצאת ההון.

### ‏20+ — Backtest / Replay / Validation

‏יבדקו האם Thresholds ו־Decision surfaces שורדים point-in-time simulation, OOS ו־walk-forward.

### ‏26 — RCA

‏ישתמש ב־Decision snapshots, Top-N ו־Reason Codes כדי להסביר selection failures ו־false rejections.

### ‏60 — Scanner / Ranking Subtleties

‏יעמיק Candidate churn, dwell time, rank persistence ו־Top-N turnover.

---

# ‏Recommendation Summary

‏ההמלצה למערכת שלנו היא:

```text
Do not trade the winner because it is the winner.
Trade only when a candidate is:

relatively strong
AND absolutely good enough
AND fresh enough
AND executable enough
AND economically worthwhile enough
AND allowed by risk/system state
AND still valid at final recheck.
```

‏ה־Baseline המעשי:

```text
Top-N Ranking
→ Reason-aware Candidate Ladder
→ Absolute Quality
→ Signal TTL
→ Execution Readiness
→ Economic Viability
→ Risk/System Readiness
→ Final Recheck
→ TRADE_CANDIDATE / NO_TRADE
```

‏כל Threshold חדש מתחיל כ־Research/Shadow hypothesis ומקודם רק לאחר sensitivity, OOS, walk-forward ו־execution-aware validation.
