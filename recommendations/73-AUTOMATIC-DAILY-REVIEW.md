# ‏73 — Recommendation Sheet: Automatic Daily Review

> ‏מקור לימודי עיקרי: `../73-AUTOMATIC-DAILY-REVIEW.md`.
>
> ‏מטרת הקובץ: להגדיר Daily Review כמערכת Evidence, Attribution, RCA Triage ו־Research Prioritization — לא כמנגנון שמכוון Strategy אוטומטית לפי היום האחרון.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו מניח ש־PnL יומי מוכיח Edge.

---

## ‏1. Decision

‏השאלה המרכזית היא:

```text
Did the system behave as designed,
where did Expected diverge from Actual,
which divergences are correctness / safety incidents,
which are statistical observations only,
and which deserve controlled research rather than an immediate change?
```

‏שרשרת הלמידה המומלצת:

```text
Runtime Evidence
→ Daily Review
→ First Divergence / Attribution
→ Incident Triage or Research Finding
→ Evidence Packet
→ Accumulated Evidence
→ Controlled Experiment
→ Replay / OOS
→ Shadow Challenger
→ Promotion / Rejection
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Daily Review אינו Daily Optimization

‏אסור להפוך:

```text
Yesterday result
→ Production parameter change today
```

‏ל־default workflow.

‏ה־default הוא:

```text
Observation
→ Evidence accumulation
→ Hypothesis
→ Test
→ OOS / Replay
→ Shadow
→ Promotion Gate
```

‏יום יחיד הוא בדרך כלל `ANECDOTAL`, למעט correctness bug דטרמיניסטי או safety violation.

### ‏`P0 — Required`: ארבע שכבות פלט נפרדות

```text
Operational Summary
Economic Summary
Diagnostic Findings
Research Queue
```

‏כך לא מערבבים PnL, בריאות מערכת, incidents והיפותזות מחקר.

### ‏`P0 — Required`: ‏`First Divergence` לפני “למה הפסדנו”

‏בכל Decision/Trade חריג מחפשים את הנקודה הראשונה שבה ה־actual path סטה מה־expected path:

```text
DATA
FEATURE
SCANNER
RANKING
VETO
EXECUTION
EXIT
RISK
BROKER
INFRA
CONFIG
OPERATOR
EXTERNAL
UNKNOWN
```

‏`UNKNOWN` הוא Root Cause state תקין; אין להמציא explanation כדי לסגור דוח.

### ‏`P0 — Required`: ‏Decision Epoch הוא יחידת Evidence מרכזית

‏אין ללמוד רק מ־Trades שבוצעו.

‏יש לשמור גם:

```text
Top-K
Rank #1
RankGap
RankPersistence
Veto state
NO TRADE reason
Execution feasibility
Counterfactual outcome
```

‏כך נמנעת Selection Bias של “לומדים רק ממה שסחרנו”.

### ‏`P0 — Required`: Configuration Fingerprint בכל Review

```text
StrategyVersion
FeatureVersion
ScoreVersion
VetoVersion
ExecutionPolicyVersion
ConfigHash
BuildCommit
ReviewVersion
```

‏Deployment באמצע Session יוצר boundary ברור לפני/אחרי.

---

## ‏3. Why

‏למערכת קצרה יש הרבה יותר Observations מאשר Trades. בלי Review שיטתי, אפשר לייחס כשל ל־Signal כאשר מקורו ב־stale data, latency, spread, fill, exit, broker state או configuration drift.

‏מצד שני, Review שמגיב לכל יום בשינוי פרמטרים מייצר Recency Bias ו־overfitting.

‏לכן ה־Daily Review צריך להיות שכבת Measurement ו־Evidence Governance.

---

## ‏4. Use When

‏ה־Daily Review מומלץ כאשר יש מספיק telemetry כדי לקשור:

```text
Decision
→ Candidate state
→ Rank / Veto
→ Order / Fill
→ Position / Exit
→ Cost
→ Outcome
→ Runtime / Data state
```

‏הוא שימושי במיוחד לאחר:

- ‏Session רגיל.
- ‏deployment/config change.
- ‏reconnect/recovery.
- ‏provider/broker anomaly.
- ‏latency tail.
- ‏unusual rank churn.
- ‏large NO TRADE episode.
- ‏safety or near-miss event.

---

## ‏5. Do Not Use When

‏אין להשתמש ב־Daily Review כדי:

- ‏לשנות threshold אוטומטית על סמך יום אחד.
- ‏להדליק/לכבות Features אוטומטית.
- ‏להגדיל capital/risk בגלל יום טוב.
- ‏למחוק Veto בגלל missed winner בודד.
- ‏להכריז על Edge חדש מתוך sample קטן.
- ‏לנחש Root Cause כאשר data חסר.
- ‏לשכתב היסטוריה אחרי late/corrected data.

---

## ‏6. Recommended Review Contract

### ‏`P0`: Decision Funnel

```text
Observed
→ Data Valid
→ Feature Ready
→ Eligible
→ Ranked
→ Top-K
→ Passed Veto
→ Executable
→ Submitted
→ Filled
→ Exited
→ Net Positive
```

‏נשמור counts ו־rates בכל stage, כולל drop-off reason.

### ‏`P0`: Expected vs Actual

‏לכל Candidate/Trade משמעותי:

```text
ExpectedEdge
ExpectedCost
ExpectedFillProbability
ExpectedLatency
ExpectedHoldingTime
ExpectedExitFeasibility
```

‏מול:

```text
ActualFill
ActualCost
ActualLatency
ActualHoldingTime
ActualExit
ActualNetOutcome
```

### ‏`P0`: Operational Health

```text
Startup / Warmup
MarketDataUptime
BrokerConnectivity
ReconnectCount
QueueLag
ProcessingLag
DroppedOrCoalescedUpdates
GenerationChanges
OrderStateMismatch
KillSwitchEvents
ManualInterventions
RecoveryEvents
```

### ‏`P0`: Economic Attribution

```text
Gross Predictive Edge
- Signal Decay
- Spread
- Slippage
- Fees
- Impact
- Adverse Selection
- Exit Giveback
- Borrow / Financing when relevant
= Net Realized Outcome
```

‏Recommendation 18 נשאר מקור האמת ל־Cost Model; 73 רק מסכם ומייחס את התוצאה.

---

## ‏7. Scanner / Ranking Review

### ‏Baseline metrics

```text
FreshCoverage
EligibleCount
Top1Age
TopKAge
RankChurn
RankGap
TopKPersistence
RankHalfLife
DeepPathLag
QueueAge
ScannerCycleLatency
```

‏נשווה גם:

```text
PredictiveRank
ExecutableRank
FinalActionRank
```

‏כדי לדעת אם Candidate הידרדר בגלל Prediction, eligibility או Execution.

### ‏Top-K counterfactual

‏נבדוק Rank buckets כגון:

```text
1
2-3
4-5
6-10
```

‏אבל רק לאורך Evidence מצטבר, לא כדי לשנות policy על בסיס יום אחד.

---

## ‏8. Veto / NO TRADE Review

‏לכל ReasonCode:

```text
TriggeredCount
WouldHaveLostCount
WouldHaveWonCount
UnknownCount
EstimatedDamageAvoided
EstimatedOpportunityMissed
```

‏נשמור בנפרד:

```text
FalseVeto
FalseAllow
NO_TRADE_Value
```

‏ReasonCode semantics חייבים versioning.

‏ההשוואה counterfactual נעשית רק מול Candidate שהיה observable, eligible ובר־השוואה בזמן אמת; לא מול winner שנבחר בדיעבד.

---

## ‏9. Execution / Exit Review

### ‏Timeline

```text
DecisionTime
SubmitTime
AckTime
FirstFillTime
FinalFillTime
CancelRequestTime
CancelAckTime
ExitDecisionTime
FlatTime
```

### ‏Latency decomposition

```text
DataLatency
FeatureLatency
DecisionLatency
SubmitLatency
BrokerAckLatency
FillLatency
ExitLatency
```

‏לכל component נשמור לפחות:

```text
p50 / p90 / p95 / p99 / max
```

‏Average בלבד אינו מספיק.

### ‏Fill / markout

```text
FillRate
PartialFillRate
TimeToFirstFill
TimeToFullFill
CanceledUnfilledRate
MarkoutByHorizon
```

‏No-fill נחשב גם הוא Evidence לצורך opportunity cost.

### ‏Exit

```text
ExitTriggerReason
ExitDecisionLatency
ExitExecutionLatency
TimeToFlat
ExitSlippage
MFE
MAE
TimeToFirstProfit
TimeToTarget
PostTargetGiveback
ActualHoldingTime
```

---

## ‏10. Data / Context Review

‏נמדוד:

```text
GapRate
DuplicateRate
OutOfOrderRate
StaleRate
SchemaErrorRate
UnknownConditionRate
DecisionImpactCount
```

‏Data anomaly אחת ששינתה Decision חשובה יותר ממאה anomalies שלא השפיעו.

‏לכל issue משמעותי נשמור lineage:

```text
Provider
Feed
SchemaVersion
DataGeneration
EventTime
ReceiveTime
ProcessingTime
```

‏Regime/Event/Session context נשמר כפי שהיה observable בזמן ההחלטה; retrospective labels לא הופכים ל־historical features.

---

## ‏11. Episode / Effective Sample Logic

‏Trades ו־Decisions אינם תמיד independent.

‏יש לקבץ Episodes סביב:

```text
Shared market event
Shared symbol burst
Shared reconnect
Shared latency incident
Shared regime transition
```

‏ובדוח לשמור:

```text
RawSampleCount
EffectiveSampleEstimate
```

‏כדי לא להציג 30 observations correlated כאילו היו 30 ניסויים בלתי תלויים.

---

## ‏12. Evidence Levels

```text
ANECDOTAL
WEAK
MODERATE
STRONG
REPEATED
```

‏ברירת מחדל ל־finding של יום יחיד היא `ANECDOTAL`.

‏חריגים:

```text
Deterministic correctness bug
Safety invariant violation
Broker/local position mismatch
UNKNOWN_EFFECT unresolved
```

‏אלה אינם זקוקים ל־sample גדול כדי לקבל חומרה גבוהה.

---

## ‏13. Research Queue

‏כל Research Candidate יקבל:

```text
HypothesisId
Observation
Evidence
Hypothesis
WhyItMatters
RequiredDataset
ProposedTest
ExpectedDecisionImpact
Priority
Confidence
FirstSeen
LastSeen
Occurrences
Status
```

‏Lifecycle:

```text
OBSERVED
→ PROPOSED
→ UNDER_TEST
→ SUPPORTED | REJECTED
→ PROMOTED | RETIRED
```

‏Negative result נשמר ולא נמחק, כדי שלא נחזור שוב על אותו רעיון.

---

## ‏14. Incident Triage

‏Daily Review עושה triage, לא RCA מלא לכל anomaly.

‏Priority framework מועדף:

```text
Severity × Frequency × DecisionImpact
```

‏דוגמאות:

```text
P0 safety invariant violation
P1 broker/local mismatch
P1 unresolved unknown effect
P2 severe latency tail
P2 data gap with decision impact
P3 unusual rank churn
```

‏Repeated near-miss נחשב incident candidate גם אם טרם נגרם נזק.

---

## ‏15. Report Structure

‏מבנה מומלץ:

```text
1 Executive Summary
2 Data Health
3 Scanner / Ranking
4 Vetoes
5 Decisions / NO TRADE
6 Orders / Fills
7 Exit
8 Costs / Edge Retention
9 Risk / Safety
10 Incidents
11 Drift
12 Counterfactuals
13 Research Findings
14 Open Unknowns
15 Next-Session Readiness
```

‏ה־UI צריך להיות:

```text
Summary
→ Ranked Findings
→ Drill-down
→ Evidence / Replay
```

‏ולא report עצום ללא prioritization.

---

## ‏16. Evidence Packet / Replay Linkage

‏לכל Finding משמעותי:

```text
FindingId
TimeRange
Symbols
DecisionIds
OrderIds
RelevantMetrics
ConfigVersion
ReplayPointers
Hypothesis
Confidence
```

‏Replay של אותו Evidence Packet צריך להיות deterministic באותה data/config/review version.

---

## ‏17. Report Versioning and Late Data

‏Review logic עצמו מקבל version.

‏כאשר יש late data:

```text
Preliminary Report
Finalized Report
```

‏אפשר להציג במקביל:

```text
AsObservedAtRuntime
AsLaterCorrected
```

‏הפער הוא Evidence; אין לשכתב בשקט את runtime truth.

‏Review completeness:

```text
COMPLETE
PARTIAL
DEGRADED
UNKNOWN
```

‏`No Data != Zero`.

---

## ‏18. Rolling Baselines and Drift

‏כל metric מהותי יושווה ל־baseline, למשל:

```text
Today
Last 5 Sessions
Last 20 Sessions
Last 60 Sessions
Previous Version
Shadow Challenger
```

‏Drift אינו Root Cause. הוא Trigger לחקירה.

‏Alert threshold צריך לקחת בחשבון:

- ‏normal variation.
- ‏economic impact.
- ‏safety severity.

---

## ‏19. Champion / Challenger Review

‏כאשר Challenger רץ ב־Shadow:

```text
ChampionDecision
ChallengerDecision
DifferenceReason
CounterfactualOutcome
```

‏Metrics מרכזיים:

```text
DecisionDisagreementRate
DecisionImpactRate
NetCounterfactualDifference
SafetyDifference
CostDifference
```

‏שיפור metric שלא משנה Decisions יכול להיות חסר Decision Value.

---

## ‏20. Alternatives

### ‏A. PnL-only report

‏פשוט, אך אינו מסביר Prediction/Execution/Data/Risk ולכן נדחה כ־baseline.

### ‏B. Manual review בלבד

‏שימושי ל־deep dives, אך אינו scalable ואינו reproducible כ־default.

### ‏C. Automated evidence review + human/research governance

‏זו ברירת המחדל המומלצת.

### ‏D. Fully autonomous self-tuning

‏`P4 / Avoid Unless Evidence and Governance`.

‏אינו baseline לפרויקט.

---

## ‏21. What I Would Avoid Initially

‏לא להתחיל עם:

- ‏ML שמחליט לבד מה “לתקן”.
- ‏auto-threshold tuning כל ערב.
- ‏auto feature retirement.
- ‏auto risk/capital increase.
- ‏מאות alert rules ללא baseline.
- ‏report ללא drill-down/evidence.
- ‏hindsight best-symbol comparisons.
- ‏root-cause text שנוצר ללא data lineage.

---

## ‏22. What to Add Later

‏אחרי baseline יציב:

1. ‏repeat-pattern detector.
2. ‏episode clustering.
3. ‏cross-provider drift attribution.
4. ‏Champion/Challenger counterfactual reports.
5. ‏precursor detection.
6. ‏review-rule quality calibration.
7. ‏automated Evidence Pack generation.
8. ‏research-queue deduplication and lifecycle UI.
9. ‏statistically calibrated anomaly thresholds.
10. ‏cross-session causal investigation tooling.

---

## ‏23. Required Data / Evidence

‏לפני שטוענים שה־Daily Review אמין, צריך לפחות:

- ‏Decision IDs ו־timestamps.
- ‏Top-K snapshots.
- ‏Rank/score/veto state.
- ‏ReasonCodes.
- ‏Data freshness / generation.
- ‏Order/fill/cancel/exit timeline.
- ‏Cost attribution.
- ‏NO TRADE decisions.
- ‏counterfactual labels.
- ‏runtime incidents.
- ‏risk/safety events.
- ‏config/build fingerprints.
- ‏replay pointers.
- ‏data-quality flags.
- ‏forward-label completeness.

---

## ‏24. Promotion Criteria

‏Daily Review baseline נחשב מוכן למחקר שוטף רק אם:

1. ‏אותו יום + אותה גרסה מפיקים אותו report.
2. ‏כל Finding מהותי ניתן לקישור ל־raw evidence/replay.
3. ‏`NO DATA` אינו הופך ל־0.
4. ‏PnL, process quality ו־research findings נפרדים.
5. ‏Top-K/NO TRADE/veto counterfactuals קיימים.
6. ‏Expected-vs-Actual attribution קיים.
7. ‏tail latency/cost metrics קיימים.
8. ‏review completeness/confidence מפורשים.
9. ‏deployment/config boundaries נראים בדוח.
10. ‏Unknown findings נשמרים ולא נסגרים בכוח.
11. ‏Hypothesis אינה משנה Production אוטומטית.
12. ‏review suggestions עוברים Research/Replay/OOS/Shadow לפני Promotion.

---

## ‏25. Rejection Criteria

‏יש לעצור/לשכתב את ה־Daily Review אם:

- ‏הוא משנה Strategy אוטומטית לפי יום יחיד.
- ‏הוא מתבסס רק על Trades שבוצעו.
- ‏Counterfactuals כוללים hindsight leakage.
- ‏אין configuration fingerprint.
- ‏אין distinction בין deterministic bug ל־statistical finding.
- ‏אין replay/evidence linkage.
- ‏late data משכתב report היסטורי בשקט.
- ‏missing values מוצגים כאפס.
- ‏הוא מייצר יותר noise מ־actionable evidence לאורך זמן.

---

## ‏26. Metrics

### ‏Operational

```text
Uptime
ReconnectCount
RecoveryTime
ManualActionCount
SafetyEventCount
UnknownEffectCount
```

### ‏Data

```text
FreshCoverage
GapRate
StaleRate
DuplicateRate
OutOfOrderRate
DecisionImpactingDataIssues
```

### ‏Scanner

```text
EligibleCount
RankChurn
RankGap
Top1Age
TopKPersistence
DeepPathLag
```

### ‏Execution

```text
SubmitLatency
AckLatency
FillLatency
FillRate
PartialFillRate
CancelLatency
ExitLatency
TimeToFlat
```

### ‏Economics

```text
GrossEdge
NetEdge
EdgeRetention
CostRatio
FillMarkout
ExitGiveback
NO_TRADE_Value
```

### ‏Research

```text
NewFindings
RepeatedFindings
HypothesesCreated
HypothesesStrengthened
HypothesesWeakened
UnknownCount
```

### ‏Review Quality

```text
UsefulFindingRate
FalseAlarmRate
RCAConversionRate
RepeatedUnknownRate
ResearchPromotionRate
```

---

## ‏27. Failure Modes

1. ‏PnL-only thinking.
2. ‏Recency bias.
3. ‏Auto-tuning from one day.
4. ‏Learning only from executed trades.
5. ‏Hindsight benchmark leakage.
6. ‏Average-only latency/cost reporting.
7. ‏Correlated trades counted as independent evidence.
8. ‏No configuration fingerprint.
9. ‏No ReasonCode versioning.
10. ‏Silent late-data rewrite.
11. ‏Invented Root Cause.
12. ‏Alert fatigue.
13. ‏Research queue duplication.
14. ‏Ignoring near misses.
15. ‏Ignoring winners with unsafe process.
16. ‏No link from finding to replay/raw evidence.
17. ‏Review complexity so high that nobody reads it.

---

## ‏28. User-Specific Application

‏למערכת Short-Horizon Momentum שלנו, סדר העדיפויות הוא:

```text
P0 Data / runtime correctness
P0 Decision + Top-K + NO TRADE evidence
P0 Veto and reason-code attribution
P0 Decision-to-fill / exit timeline
P0 Cost / edge-retention attribution
P0 Risk / safety / near-miss capture
P1 Rank persistence / gap / churn
P1 Counterfactual Top-K outcomes
P1 Rolling drift baselines
P1 Evidence packets + replay links
P2 Episode clustering / effective N
P2 Champion / Challenger daily comparison
P3 Precursors / anomaly calibration
P4 Autonomous learning or self-modification
```

‏זה מתאים למערכת קצרה במיוחד משום ש־latency, freshness, rank churn, fill quality ו־exit giveback יכולים למחוק Signal טוב גם כאשר ה־prediction עצמו לא השתנה.

---

## ‏29. Fact / Judgment / Hypothesis

### ‏Facts

- ‏Daily PnL לבדו אינו מזהה Root Cause.
- ‏Counterfactual learning דורש לשמור Candidates שלא נבחרו.
- ‏Configuration/Version drift יכול לשנות behavior בלי שינוי בשם Strategy.
- ‏Late/corrected data יכול לשנות retrospective interpretation.

### ‏Judgments

- ‏Daily Review צריך להיות evidence-first ולא optimization-first.
- ‏Decision Epoch הוא יחידת Review חשובה יותר מ־Trade בלבד.
- ‏Deterministic bugs ו־safety violations מקבלים מסלול Incident נפרד מ־statistical findings.
- ‏Summary → Ranked Findings → Drill-down הוא UX baseline טוב יותר מדוח שטוח ענק.

### ‏Hypotheses

‏דורשות Validation:

- ‏Rank persistence משפרת outcomes נטו.
- ‏Rank Gap גבוה מנבא Decision quality טובה יותר.
- ‏Rank churn גבוה + spread רחב מנבאים outcomes חלשים יותר.
- ‏LatencyPressure גבוה מסביר Edge decay.
- ‏precursor metrics יכולים לזהות incidents לפני failure מלא.

---

## ‏30. Confidence

‏**High** לגבי Architecture, evidence separation, versioning, replay linkage, first-divergence analysis והאיסור על auto-tuning יומי.

‏**Medium** לגבי metric thresholds, anomaly thresholds, Evidence-Level cutoffs ו־episode grouping — אלה דורשים calibration על הנתונים שלנו.

---

## ‏31. Time-Sensitive Facts

‏אין במקטע זה dependency מרכזי על כלל רגולטורי/ברוקר נקודתי.

‏עם זאת, אם Daily Review מציג fields תלויי Broker/Data Provider/API, semantics שלהם חייבים להיות versioned ומאומתים מול ה־integration בפועל.

---

## ‏32. Relationship to Existing Recommendations

- ‏`26` — ‏RCA של Candidates; 73 עושה triage ו־evidence packaging, לא מחליף RCA מלא.
- ‏`27` — ‏Replay; כל Finding משמעותי צריך pointer ל־Replay.
- ‏`35` — ‏Observability; 73 צורך telemetry ולא מגדיר מחדש את instrumentation layer.
- ‏`60A` — ‏Veto; 73 מודד false-veto/false-allow ו־decision impact.
- ‏`61` — ‏Backtest subtleties; repeated simulation/live mismatch הופך Research Finding.
- ‏`62` — ‏Live subtleties/drift; 73 מסכם אותם בדוח יומי.
- ‏`63` — ‏Edge; 73 מודד Edge Health ולא רק PnL.
- ‏`64` — ‏Readiness; Review יכול להמליץ `NO-GO`, אבל enforcement שייך ל־Readiness/Safety.
- ‏`72` — ‏Accounting/Costs; 73 צורך reconciled costs/ledger outputs ולא מחליף אותם.

---

## ‏33. Definition of Done

‏מקטע 73 נחשב מיושם מחקרית כאשר בסוף כל Session ניתן לענות באופן reproducible על:

```text
Did the system operate correctly?
Was the data trustworthy?
Did ranking select sensible candidates?
Did vetoes help or hurt?
Did execution preserve predicted edge?
Where was edge consumed?
Were exits timely?
Were safety assumptions violated?
What materially drifted?
What is a deterministic bug?
What is only a statistical observation?
Which hypotheses deserve research?
What remains unknown?
Is next-session readiness affected?
```

‏והמערכת יכולה גם לומר במפורש:

```text
No material findings today.
```

‏בלי לייצר “תובנה” מלאכותית.

---

## ‏34. Summary

‏ברירת המחדל המומלצת היא:

```text
Observe honestly
→ Compare Expected vs Actual
→ Find First Divergence
→ Preserve Top-K / NO TRADE Counterfactuals
→ Attribute Prediction / Data / Execution / Risk separately
→ Package Evidence
→ Accumulate across sessions
→ Research offline
→ Replay / OOS / Shadow
→ Promote only with evidence
```

‏ה־Daily Review צריך לגרום למערכת ללמוד טוב יותר — **בלי לאפשר לה לשנות את עצמה אוטומטית בגלל רעש של יום אחד**.