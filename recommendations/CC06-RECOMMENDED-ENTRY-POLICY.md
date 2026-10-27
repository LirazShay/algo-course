# ‏Cross-Cutting 06 — Recommended Entry Policy

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Candidate Selection, Entry/Execution, Costs, Risk, Negative Evidence, State, Recovery ו־Compliance למדיניות `Entry` אחת deterministic, explainable ו־replayable עבור `Research / Replay / Shadow / Paper`.
>
> ‏המסמך אינו הוראה לבצע מסחר בכסף אמיתי, אינו אישור `Live`, ואינו מגדיר מינוף, חשיפה אמיתית או פרטי הפעלה מול ברוקר. הוא מגדיר את החוזה המחקרי שלפיו Candidate יכולה או אינה יכולה להפוך ל־simulated/paper exposure.

---

## ‏1. Decision

‏`Entry` אינו:

```text
Rank #1
→ buy
```

‏וגם אינו:

```text
TRADE_CANDIDATE
→ submit immediately
```

‏אלא:

```text
TRADE_CANDIDATE
→ Candidate still valid?
→ Data still valid?
→ Negative Evidence / Veto clear?
→ Execution feasibility still acceptable?
→ Remaining Net Edge still sufficient?
→ Risk / Safety / Compliance allow?
→ Entry Intent frozen
→ Final pre-effect revalidation
→ Paper / Simulation execution attempt
→ Fill / No Fill / Partial Fill
→ Position truth from fills
→ Reconciliation / Exit ownership
```

‏העיקרון המנחה:

```text
Entry is a permissioned state transition,
not a consequence of ranking.
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏`TRADE_CANDIDATE != ENTRY_PERMISSION`

‏ה־Scanner ו־Ranking מספקים Evidence בלבד.

‏Entry מותרת רק לאחר שכל ה־gates הקריטיים עברו מחדש בנקודת הזמן של הכניסה.

‏נפריד לפחות:

```text
CandidateValid
DataValid
SignalFresh
ExecutionFeasible
EconomicsValid
RiskAllows
SafetyAllows
ComplianceAllows
StateKnown
```

‏כל `P0 FAIL` או `P0 UNKNOWN` חוסם יצירת simulated/paper exposure חדש.

### ‏`P0 — Required`: ‏`UNKNOWN` הוא חסם, לא ברירת מחדל אופטימית

‏מצבים כגון:

```text
unknown order state
unknown account / execution state
unknown data continuity
unknown critical cost input
unknown instrument mapping
unknown compliance conflict
```

‏אינם עוברים ל־`false` או `0`.

‏ה־baseline:

```text
critical UNKNOWN
→ ABORT / BLOCK ENTRY
→ reconcile / refresh / re-evaluate
```

### ‏`P0 — Required`: ‏Final Pre-Entry Revalidation

‏מיד לפני יצירת side effect מחקרי/ניסויי נבדוק מחדש לפחות:

```text
candidate not expired
signal still valid
critical market data fresh
critical features valid
trading/session status known
candidate still passes absolute gate
negative evidence still acceptable
execution feasibility still acceptable
expected remaining economics still acceptable
risk/safety/compliance state unchanged
no duplicate intent already active
```

‏החלטה טובה לפני זמן קצר אינה authorization קבוע.

### ‏`P0 — Required`: ‏Signal TTL ו־Candidate TTL נפרדים

‏לכל Candidate נשמור:

```text
SignalCreatedAt
SignalValidUntil
CandidateCreatedAt
CandidateExpiresAt
DecisionCreatedAt
DecisionExpiresAt
```

‏כך אפשר להבחין בין:

```text
fresh signal + stale candidate
stale signal + fresh decision object
fresh rank + stale inputs
```

‏אם אחד ה־contracts הקריטיים פג:

```text
ENTRY_ABORTED_STALE
```

### ‏`P0 — Required`: ‏Remaining Edge, לא Original Edge

‏ה־Entry Gate אינו מסתמך רק על ה־edge שהוערך בזמן detection.

‏נחשב/נאמוד מחדש לפי Evidence הזמין:

```text
RemainingNetEdge
=
UpdatedExpectedGrossOpportunity
- ExpectedEntryFriction
- ExpectedExitFriction
- Fees / modeled costs
- Latency / decay allowance
- Uncertainty allowance
```

‏אם אין מודל אמין מספיק, נשמור Components מפורשים במקום להציג מספר מדויק מזויף.

‏הכלל:

```text
OriginalEdge > 0
!=
RemainingEdge > 0 now
```

### ‏`P0 — Required`: ‏Negative Evidence נשאר ערוץ נפרד

‏Entry Policy אינה ממזגת הכול ל־Score אחד.

```text
Positive Evidence
Negative Evidence
Execution Feasibility
Risk / Safety
Compliance
```

‏נשארים domains נפרדים.

‏`Hard Veto` אינו ניתן לפיצוי באמצעות Score גבוה.

### ‏`P0 — Required`: ‏Entry Intent immutable לפני execution attempt

‏לפני Paper/Simulation attempt ניצור `EntryIntent` versioned:

```text
IntentId
DecisionId
CandidateId
InstrumentId
Direction
TargetSimulatedQuantity / ExposureUnit
ExecutionPolicyVersion
ReferencePriceSnapshot
EconomicBudget
SignalValidUntil
DecisionValidUntil
PartialFillPolicyVersion
CancelPolicyVersion
RiskSnapshotId
ComplianceSnapshotId
StrategyVersionId
ConfigFingerprint
CreatedAt
```

‏לא משנים בדיעבד את ה־Intent כדי להתאים ל־Outcome.

### ‏`P0 — Required`: ‏Intent identity ו־duplicate protection

‏אותו Decision אינו יוצר שני Entry attempts עקב retry או callback כפול.

‏נשמור לפחות:

```text
IntentId
AttemptId
ExecutionSimulationId / PaperOrderId
StateGeneration
```

‏כאשר ה־state אינו ודאי:

```text
UNKNOWN_EFFECT
→ reconcile
→ no blind retry
```

### ‏`P0 — Required`: ‏Partial Fill / Partial Simulated Fill הוא exposure אמיתי במודל

‏אם Simulation/Paper מחזיר fill חלקי, ה־position state נגזרת ממה שהתמלא בפועל במודל — לא מהכמות המבוקשת.

```text
Requested != Filled
```

‏מרגע שיש fill חלקי:

```text
Position / Exit ownership becomes active
```

‏Entry logic אינה רשאית להתייחס למצב כאילו עדיין `FLAT`.

### ‏`P0 — Required`: ‏Exit capability קיימת לפני Entry

‏לפני Entry attempt חייב להיות חוזה ברור ל־:

```text
full fill
partial fill
no fill
late fill
cancel/fill race in simulation
state uncertainty
```

‏העיקרון:

```text
No entry risk without an exit owner.
```

### ‏`P1 — Preferred Default`: ‏Policy אחת פשוטה כ־Champion

‏ב־MVP המחקרי נשמור Entry Policy אחת פשוטה ו־versioned.

‏המטרה אינה לבחור מראש את טקטיקת המחיר “הכי חכמה”, אלא למדוד באופן עקבי:

```text
Decision-to-attempt latency
Fill probability under model
Entry friction
Missed-opportunity rate
Post-fill markout
Net outcome
```

‏Policies חלופיות נשארות Challengers עד שיש Evidence OOS.

### ‏`P1 — Preferred Default`: ‏Entry Budget הוא Economic Contract

‏כל attempt מקבל budget מפורש כגון:

```text
maximum modeled entry friction
maximum tolerated signal decay
maximum modeled adverse-selection allowance
maximum candidate age
maximum number of policy transitions
```

‏המספרים אינם Truth אוניברסלי; הם parameters versioned שנקבעים במחקר.

### ‏`P1 — Preferred Default`: ‏No Infinite Chase

‏אין Policy מחקרית מסוג:

```text
keep changing the attempt until filled
```

‏כל attempt חייב להיות bounded בזמן, economic budget ו־state transitions.

‏כאשר התקציב נגמר:

```text
NO_FILL / ABORT
→ fresh decision required for another attempt
```

### ‏`P1 — Preferred Default`: ‏Candidate-local failure מול Global failure

‏אם Candidate נפסלה מסיבה מקומית:

```text
candidate-specific stale state
candidate-specific economics failure
candidate-specific veto
```

‏Decision Engine רשאי במחקר להעריך Candidate הבאה ב־ladder.

‏אם הכשל הוא גלובלי:

```text
market-wide data degraded
system state unknown
risk engine unavailable
compliance state unknown
execution environment degraded
```

‏התוצאה:

```text
NO_NEW_ENTRY
```

‏לא fallback ל־#2.

---

## ‏3. Entry State Machine מומלץ

```text
FLAT
→ CANDIDATE_SELECTED
→ ENTRY_REVALIDATING
→ ENTRY_APPROVED
→ INTENT_CREATED
→ ATTEMPT_PENDING
→ WORKING / SIMULATING
→ NO_FILL
or
→ PARTIAL_POSITION
or
→ POSITION_OPEN
or
→ ENTRY_ABORTED
or
→ ENTRY_STATE_UNKNOWN
```

‏מ־`ENTRY_STATE_UNKNOWN` אין מעבר ישיר ל־attempt חדש.

```text
ENTRY_STATE_UNKNOWN
→ RECONCILING
→ resolved state
→ fresh decision
```

---

## ‏4. Entry Evidence Packet

‏לכל Entry decision נשמור לפחות:

```text
DecisionId
CandidateId
IntentId
DecisionEpoch
StrategyVersionId
ConfigFingerprint
DataGeneration
RankGeneration
CandidateRank
TopKContext
SignalAge
FeatureAge
QuoteAge / relevant data ages
NegativeEvidenceSummary
ExecutionFeasibilitySummary
CostAssumptions
RemainingEdgeComponents
RiskState
SafetyState
ComplianceState
EntryDecision
ReasonCodes
```

‏ולכל attempt:

```text
AttemptId
PolicyVersion
AttemptCreatedAt
AttemptStartedAt
AttemptEndedAt
ModeledReferencePrice
ModeledFillState
ModeledAverageFillPrice
ModeledEntryFriction
FilledQuantityOrExposureUnit
NoFillReason
PartialFillReason
StateTransitions
```

---

## ‏5. Metrics

### ‏Decision Quality

```text
EntryApprovalRate
EntryAbortRate
AbortByReason
RevalidationFailureRate
CandidateAgeAtApproval
SignalAgeAtApproval
```

### ‏Execution-Simulation Quality

```text
FillRate
PartialFillRate
NoFillRate
DecisionToAttemptLatency
AttemptToFillLatency
ModeledEntrySlippage
ModeledImplementationShortfall
```

### ‏Economic Quality

```text
GrossOpportunityAtDetection
RemainingOpportunityAtEntry
ModeledEntryCost
ModeledExitCost
ModeledNetOutcome
EdgeRetention
```

### ‏Control Quality

```text
DuplicateIntentCount
UnknownEffectCount
BlindRetryCount = 0 target
LateFillHandlingPassRate
ReconciliationSuccessRate
```

---

## ‏6. Why

### ‏Fact

‏`Rank`, ‏`Decision`, ‏`Intent`, ‏`Attempt`, ‏`Fill` ו־`Position` הם states שונים.

### ‏Fact

‏Acknowledgement או simulated submission אינם Fill.

### ‏Fact

‏Cancel/abort request אינו בהכרח terminal truth אם execution model מאפשר race semantics.

### ‏Judgment

‏ב־short-horizon research, ה־Entry Gate צריך להיות strict לגבי freshness ו־remaining economics, כי decay קטן יכול למחוק Edge קטן.

### ‏Judgment

‏Policy פשוטה אחת כ־Champion עדיפה על adaptive entry engine לפני שיש telemetry שמאפשר attribution.

### ‏Hypothesis

‏Policy דינמית לפי signal half-life, liquidity ו־execution context עשויה לשפר Net Outcome, אך היא Challenger בלבד עד OOS/Replay/Shadow evidence.

---

## ‏7. Use When

‏ה־Policy מתאימה כאשר:

- ‏ה־Scanner כבר מספק `TRADE_CANDIDATE` versioned.
- ‏קיימים Data/Feature freshness contracts.
- ‏Cost/Execution assumptions versioned.
- ‏Risk/Safety/Compliance states זמינים.
- ‏אפשר ליצור immutable Decision/Intent evidence.
- ‏Execution simulation או Paper environment תומכים ב־fill/no-fill/partial-fill semantics.
- ‏Exit path מוכן לפני כל exposure מדומה.

---

## ‏8. Do Not Use When

‏אין לאשר Entry כאשר:

- ‏Critical state הוא `UNKNOWN`.
- ‏Candidate או Signal פגו.
- ‏Freshness/coverage אינם מוכחים.
- ‏Remaining economics אינם ניתנים להערכת baseline סבירה.
- ‏Risk/Safety/Compliance state חסר.
- ‏קיימת execution uncertainty לא reconciled.
- ‏Duplicate intent protection חסרה.
- ‏Partial fill אינו מיוצג נכון.
- ‏אין Exit owner.

---

## ‏9. What I Would Avoid Initially

‏לא להתחיל עם:

- ‏adaptive policy עם עשרות branches.
- ‏per-symbol Entry Policy שונה.
- ‏automatic chase behavior.
- ‏unbounded retry/reprice loops.
- ‏ML לבחירת Entry tactic.
- ‏queue/depth simulator מורכב לפני L1 baseline תקין.
- ‏automatic candidate switching בזמן state לא יציב.
- ‏Entry policy שמשנה Strategy semantics ללא version bump.
- ‏אופטימיזציה לפי fill rate בלבד.
- ‏מחיקת No-Fill attempts מה־dataset.

---

## ‏10. What to Add Later

‏לאחר Baseline יציב ומדוד אפשר לחקור:

```text
policy challengers
signal-half-life-aware urgency
liquidity-bucket policies
fill-probability models
modeled queue/depth effects
adaptive TTL
candidate switching with explicit switching cost
regime-aware policy selection
```

‏כל תוספת נכנסת דרך:

```text
Hypothesis
→ Replay
→ OOS
→ Shadow / Paper Challenger
→ Promotion Review
```

---

## ‏11. Promotion Criteria

‏Entry Policy חדשה יכולה להתקדם אם היא מוכיחה OOS/Replay/Shadow/Paper:

```text
higher net executable outcome
or
better edge retention
or
lower modeled friction
```

‏תוך שמירה על:

```text
no critical correctness regression
no duplicate exposure regression
no unknown-state regression
no unacceptable tail-cost regression
no material loss of replayability / explainability
```

‏בנוסף נדרש:

```text
DecisionImpactRate > trivial
robustness across relevant regimes
stable behavior under conservative assumptions
complexity justified by incremental value
```

---

## ‏12. Rejection Criteria

‏נפסול או נוריד דרגה ל־Entry Policy אם:

- ‏השיפור קיים רק תחת fill assumptions אופטימיים.
- ‏Fill Rate עולה אך Net Outcome יורד.
- ‏Tail friction מחמיר מהותית.
- ‏No-Fill/Partial-Fill semantics אינן reproducible.
- ‏נוצרים יותר `UNKNOWN_EFFECT` או reconciliation failures.
- ‏היא דורשת parameter point חד ולא robust region.
- ‏היא פוגעת ב־deterministic replay.
- ‏היא מוסיפה complexity בלי Decision Impact משמעותי.

---

## ‏13. Failure Modes

### ‏`Entry From Stale Winner`

‏Rank היה תקין בזמן detection אך Candidate פגה לפני attempt.

### ‏`Original-Edge Anchoring`

‏המערכת משתמשת ב־edge המקורי למרות שה־remaining edge נשחק.

### ‏`Score Overrides Invalidity`

‏Score גבוה מקזז stale/unknown/non-compliant state.

### ‏`Blind Retry`

‏State לא ידוע מוביל ל־attempt נוסף במקום reconciliation.

### ‏`Requested-Is-Position Bug`

‏Position נגזרת מהכמות המבוקשת ולא מה־fills.

### ‏`No-Fill Survivorship Bias`

‏מחקר שומר רק attempts שהתמלאו ומוחק missed opportunities.

### ‏`Entry Without Exit Owner`

‏נוצר exposure מדומה לפני שהמערכת יודעת לנהל אותו.

### ‏`Policy Creep`

‏עוד ועוד exceptions הופכים Entry Policy ל־unreplayable rule spaghetti.

---

## ‏14. User-Specific Application

‏למערכת המחקרית שלנו ברירת המחדל היא:

```text
Broad Scanner
→ Top-K
→ Absolute Candidate Gate
→ Negative Evidence
→ Entry Revalidation
→ Remaining Economics
→ Risk / Safety / Compliance
→ Immutable Entry Intent
→ Conservative Paper / Simulation attempt
→ Fill-derived Position
→ Exit ownership
```

‏בהתאם לעקרון KISS, נעדיף תחילה:

```text
one Entry Champion
few explicit gates
few reason codes
strong evidence logging
no hidden fallback
no blind retry
```

‏רק לאחר מכן נבדוק Challengers מורכבים יותר.

---

## ‏15. Confidence

### ‏High Confidence

- ‏הפרדת Rank / Decision / Intent / Fill / Position.
- ‏Critical `UNKNOWN` חוסם Entry חדש.
- ‏Pre-entry revalidation.
- ‏Immutable intent + idempotency.
- ‏Position truth מ־fills.
- ‏Exit ownership לפני exposure.
- ‏No blind retry לאחר unknown effect.

### ‏Medium Confidence

- ‏Policy Champion יחידה ופשוטה היא baseline טוב למחקר ראשוני.
- ‏Remaining-edge gate עדיף על Original-edge anchoring כאשר cost model סביר.

### ‏Low / Hypothesis

- ‏איזו Entry tactic ממקסמת Net Outcome.
- ‏TTL מספרי מדויק.
- ‏dynamic urgency.
- ‏fill-probability / queue-aware adaptation.
- ‏regime-specific execution policy.

---

## ‏16. Time-Sensitive Facts

‏כל Capability, order semantic, session behavior, provider/broker support, fee, entitlement או regulatory constraint הם `L3 Reference` תלויי־זמן.

‏הם אינם hard-coded ב־Entry Policy המחקרית.

‏לפני כל שימוש תפעולי עתידי נדרש:

```text
AuthoritativeSource
VerifiedAt
AppliesTo
Version / effective date
```

---

## ‏17. Final Recommendation

```text
Candidate
→ Revalidate
→ Confirm remaining evidence/economics
→ Confirm Risk / Safety / Compliance
→ Freeze immutable Entry Intent
→ Run bounded Paper / Simulation attempt
→ Derive exposure only from fills
→ Reconcile uncertainty
→ hand off immediately to Position / Exit ownership
```

‏זהו ה־Entry baseline המומלץ: קטן, bounded, auditable ו־replayable — עם עדיפות ל־correctness ול־known state על פני fill rate או sophistication.