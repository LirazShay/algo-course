# ‏Cross-Cutting 01 — Recommended MVP

> ‏מטרת המסמך: לסנתז את כל Recommendation Sheets שכבר הושלמו ל־MVP אחד קטן, עקבי ומדיד עבור מערכת `Short-Horizon Momentum` מחקרית — בלי לחתוך את שכבות ה־Evidence שמאפשרות לדעת אם ה־Hypothesis אמיתית, executable וניתנת לשחזור.
>
> ‏המסמך מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי, אינו אישור `Live`, ואינו מגדיר מינוף, חשיפה כספית או דרך לעקוף מגבלות חשבון/Broker/רגולציה.

---

## ‏1. Decision

‏ה־MVP המומלץ אינו:

```text
The smallest amount of code
```

‏ואינו:

```text
The fastest path to sending orders
```

‏אלא:

```text
The smallest end-to-end system
that can produce credible evidence about:

1. predictive ranking value
2. executable net economics
3. decision reproducibility
4. failure/recovery correctness
5. explainability
```

‏ברירת המחדל:

```text
Point-in-Time Universe
→ Canonical Market State
→ Small Versioned Features
→ Eligibility
→ Simple Explainable Rank
→ Hard Vetoes
→ TRADE / NO_TRADE / UNKNOWN
→ Pre-Effect Revalidation
→ Conservative Execution Simulation / Paper
→ Versioned Exit
→ Costs + Outcomes
→ Decision/Episode Evidence
→ Deterministic Replay
→ Daily Review
→ Research Queue
```

‏העיקרון המנחה:

```text
Reduce business scope.
Do not reduce evidence correctness.
```

---

## ‏2. Scope — Recommended Baseline

```text
Modes:
REPLAY + SHADOW + PAPER

Direction:
Long-only research baseline

Exposure model:
Single position episode at a time

Universe:
Broad point-in-time US equities universe

Architecture:
Modular Monolith

Persistence:
Local durable DB
+ append-only journal
+ periodic snapshots
+ SQL-friendly research surface

Decision model:
Simple deterministic eligibility + score/rank + veto pipeline

Execution model:
Versioned conservative simulator
→ one Paper adapter

Learning:
Daily Review → Research Queue
No auto-tuning
No auto-promotion
```

‏`Long-only`, ‏Single Position, ‏Local DB ו־Modular Monolith הם `Judgment` של baseline לצמצום complexity ו־attribution ambiguity — לא טענה שהם תמיד אופטימליים.

---

## ‏3. Precedence Rule

### ‏`P0 — Required`: MVP simplification אינו עוקף Correctness

‏כאשר יש מתח בין “פשוט יותר” לבין invariant שכבר הוגדר ב־Recommendation Sheet ספציפי, ה־invariant גובר.

‏בפרט אי־אפשר להסיר מה־MVP בשם KISS:

```text
Point-in-Time semantics
Critical freshness/quality state
UNKNOWN semantics
Decision identity
Strategy/version identity
Durable intent before external paper effect
Replayability
Cost accounting
Exit path
Recovery tests
Auditability
Compliance hard checks
```

### ‏`P0 — Required`: אין Silent Conflict בין Recommendations

‏אם Cross-Cutting pack מאוחר יותר משנה default של שכבה מסוימת:

```text
Old recommendation
→ explicit diff
→ rationale
→ evidence requirement
→ versioned replacement
```

‏לא משנים baseline בשקט.

---

## ‏4. MVP Question Set

‏ה־MVP צריך להיות מסוגל לענות על חמש שאלות ללא hand-waving:

1. ‏האם Rank גבוה מנבא outcome טוב יותר מ־Rank נמוך יותר?
2. ‏האם היתרון נשאר אחרי spread, slippage, latency, no-fill/partial-fill assumptions ועלויות?
3. ‏האם `NO_TRADE` ו־Vetoes מוסיפים ערך לעומת forced selection?
4. ‏האם ניתן לשחזר את אותה decision sequence מאותם Point-in-Time inputs ואותה version?
5. ‏כאשר משהו נכשל, האם ניתן לזהות את `First Divergence` ולהחזיר truth בצורה מבוקרת?

‏אם אחת מהשאלות האלה אינה ניתנת לבדיקה, ה־MVP עדיין חסר Evidence גם אם הוא “עובד”.

---

## ‏5. Market Data Baseline

### ‏`P0 — Required`: Minimum useful market state

```text
InstrumentId
LastPrice
BestBid
BestAsk
BidSize
AskSize
TradeTimestamp
QuoteTimestamp
ReceiveTimestamp
DataQualityState
Generation
```

‏`Last-only` יכול להתאים ל־exploration ראשוני של price behavior, אך אינו מספיק ל־MVP שמבקש להעריך executability ו־net economics.

### ‏`P0 — Required`: Canonical State

‏Provider payload אינו Domain Model.

‏ה־adapter מנרמל ל־state פנימי עם semantics מפורשים:

```text
READY
STALE
GAPPED
INVALID
NOT_READY
UNKNOWN
```

‏`missing`, ‏`unknown` ו־`0` אינם synonyms.

### ‏`P0 — Required`: Freshness היא data, לא תחושה

‏לכל input קריטי נשמור age/freshness ביחס ל־Decision Epoch.

‏ה־MVP חייב להבדיל:

```text
Fast update
Fresh state
Complete cross-section
```

‏אלה שלושה דברים שונים.

---

## ‏6. Universe Baseline

### ‏`P0 — Required`: Universe רחב ו־Point-in-Time

‏מאחר שה־Hypothesis היא Cross-Sectional selection, ה־MVP לא יחליף את הבעיה ברשימת symbols ידנית שנבחרה מראש.

‏נשמור:

```text
UniverseId
UniverseVersion
AsOfTimestamp
IncludedSymbols
ExcludedSymbols
ExclusionReasonCodes
```

### ‏`P1 — Preferred`: Eligibility זולה לפני feature work יקר

‏Candidate שאינו eligible מסיבה קשיחה לא צריך לצרוך Deep Path מיותר.

‏דוגמאות ל־eligibility state:

- ‏sufficient history.
- ‏critical data ready.
- ‏market/session state valid.
- ‏instrument supported by the research universe contract.

---

## ‏7. Feature Baseline

### ‏`P0 — Required`: Small, explainable, versioned

‏משפחות ה־Features הראשונות:

```text
Price return
Momentum consistency
Basic acceleration / shape
Trade activity / relative activity
Spread
Freshness
Liquidity / executability
```

### ‏`P1 — Preferred`: מעט Horizons

‏Baseline התחלתי:

```text
10s
30s
60s
```

‏זהו `Judgment` שנועד לצמצם degrees of freedom; הרחבה דורשת Evidence.

### ‏`P0 — Required`: Feature identity

‏כל Feature מקבל לפחות:

```text
FeatureId
DefinitionVersion
Inputs
Window/Horizon
Normalization semantics
Readiness state
Age
```

‏שינוי formula אינו נשמר תחת אותה version.

### ‏`P0 — Required`: Online/Replay parity

‏אותו Domain Logic של feature computation צריך לשמש Replay ו־runtime research path ככל האפשר.

---

## ‏8. Ranking Baseline

### ‏`P0 — Required`: Score פשוט שניתן לפרק

```text
Eligibility
→ small feature vector
→ simple score
→ deterministic cross-sectional rank
→ Top-K
```

‏ה־Score הראשון אינו צריך להיות ML model ואינו חייב לייצג Expected PnL.

### ‏`P0 — Required`: deterministic tie-breaking

‏אותם inputs + אותה version צריכים לתת אותו ordering.

### ‏`P0 — Required`: לשמור Top-K, לא רק Winner

‏לכל `DecisionEpoch` נשמור לפחות:

```text
TopK
Scores / components
Rank
RankGap
RankAge
DataAges
Eligibility
Veto state
```

‏כך ניתן לבדוק Rank1 מול Rank2-N, Winner's Curse ו־counterfactual selection.

---

## ‏9. Negative Evidence / Veto Baseline

### ‏`P0 — Required`: Hard Vetoes אינם penalty ב־Score

‏Baseline קטן:

```text
CRITICAL_DATA_STALE
INVALID_MARKET_STATE
MISSING_CRITICAL_STATE
ECONOMICALLY_INFEASIBLE
UNKNOWN_CRITICAL_STATE
DUPLICATE_INTENT
UNKNOWN_EFFECT
ENVIRONMENT_MISMATCH
RELATED_OPPOSING_INTENT_CONFLICT
```

‏כל veto מקבל `ReasonCode`, evidence pointer ו־policy/version identity.

### ‏`P1 — Preferred`: Behavioral vetoes מורכבים מתחילים ב־Shadow

‏לפני שמוסיפים hard rule חדש יש למדוד:

```text
DecisionImpactRate
FalseVetoCost
MissedWinners
NetDecisionValue
```

‏המטרה היא למנוע `Rule Explosion`.

---

## ‏10. Decision Contract

### ‏`P0 — Required`: שלושה outputs שונים

```text
TRADE
NO_TRADE
UNKNOWN
```

‏במסגרת ה־MVP המחקרי:

- ‏`TRADE` = Candidate עבר את gates של המחקר/Shadow/Paper.
- ‏`NO_TRADE` = יש מידע אמין מספיק ואף Candidate אינו עומד בתנאים.
- ‏`UNKNOWN` = truth קריטי אינו אמין מספיק להחלטה.

‏`UNKNOWN` אינו `NO_TRADE` ואינו `0`.

### ‏`P0 — Required`: Full Decision Snapshot

```text
DecisionId
DecisionEpoch
StrategyVersionId
ConfigFingerprint
UniverseVersion
TopK
SelectedCandidate
FeatureSnapshot
Scores
Eligibility
Vetoes
DataAges
MarketContext
CostAssumptions
Decision
ReasonCodes
```

### ‏`P1 — Preferred`: `Why This? / Why Not?`

‏המערכת צריכה להיות מסוגלת לענות:

```text
Why Rank1?
Why not Rank2?
Why NO_TRADE?
Which veto changed the decision?
Which critical inputs were stale/unknown?
```

---

## ‏11. Pre-Effect Revalidation

### ‏`P0 — Required`: Decision אינו permission נצחי

‏לפני simulated/Paper side effect נבדוק מחדש:

```text
Decision age / TTL
Critical freshness
Eligibility
Executable quote state
Economic feasibility
Risk invariants
Compliance conflicts
Environment identity
```

‏`DecisionTTL` המדויק הוא Hypothesis שצריך measurement ביחס ל־`SignalHalfLife`.

---

## ‏12. OrderIntent / Execution Baseline

### ‏`P0 — Required`: Durable Intent לפני Paper/Simulator effect

```text
OrderIntentId
DecisionId
StrategyVersionId
Environment
SymbolId
Side
Purpose
QuantityPolicy
PricePolicy
CreatedAt
IntentTTL
```

‏ל־MVP מספיק `Purpose` קטן וברור, למשל `ENTRY`, ‏`EXIT`, ‏`REDUCE_RISK`, ‏`RECOVERY`, ‏`SHADOW_ONLY`.

### ‏`P0 — Required`: `UNKNOWN_EFFECT` אינו Retry signal

```text
Unknown effect
→ reconcile
→ restore truth
→ only then decide whether another action is valid
```

### ‏`P0 — Required`: Conservative simulator

‏אין `Touch == Fill` כברירת מחדל.

‏נריץ לפחות:

```text
Optimistic
Base
Stress
```

‏Decision Replay נשאר נפרד מ־Execution Simulation.

### ‏`P1 — Preferred`: Paper adapter יחיד

‏אין צורך ב־multi-broker או multi-paper abstraction מורכב כדי להוכיח את ה־Hypothesis הראשונית.

---

## ‏13. Entry / Exit Baseline

### ‏`P0 — Required`: Policy אחת פשוטה לכל צד

‏ה־MVP אינו מעבדת עשרה Order Tactics במקביל.

‏נרצה:

```text
one versioned entry policy
one versioned exit policy
```

‏Exact order tactic ו־thresholds נשארים ל־Cross-Cutting packs הייעודיים ולניסויים.

### ‏`P0 — Required`: Exit מהיום הראשון

‏Entry בלי Exit אינו episode מלא.

‏Exit policy פשוטה יכולה להתבסס על שילוב versioned של:

```text
time expiry
signal decay
adverse move
reversal
```

‏הפרמטרים עצמם הם Hypotheses, לא Facts.

### ‏`P0 — Required`: Existing episode priority

‏Position/episode פתוח מקבל priority על Opportunity חדש.

---

## ‏14. Economics Baseline

### ‏`P0 — Required`: Net evidence, לא gross movement

‏נשמור לפחות:

```text
ArrivalBenchmark
QuotedSpread
EntrySlippage
ExitSlippage
Fees
Execution uncertainty / safety buffer
PredictedGrossEdge where applicable
RemainingNetEdge
Net simulated/paper outcome
```

‏Cost unknown אינו `0`.

### ‏`P1 — Preferred`: Outcomes רחבים מה־Strategy target

‏Labels שימושיים למחקר:

```text
ForwardReturn1s
ForwardReturn2s
ForwardReturn5s
ForwardReturn10s
ForwardReturn30s
ForwardReturn60s
TimeToFirstProfit
MFE
MAE
Giveback
TimeToFlat
```

‏Labels נוצרים רק לאחר הזמן הרלוונטי ואינם זולגים ל־Features.

---

## ‏15. Risk / Safety / Compliance Baseline

### ‏`P0 — Required`: Minimal invariants

```text
No new paper entry on critical stale data
No new paper entry on critical UNKNOWN state
Single-position invariant for this MVP
Existing exposure/episode > new opportunity
No blind retry after UNKNOWN_EFFECT
No environment escalation
Every effect has one authoritative intent lineage
One authoritative writer per controlled scope where required
```

### ‏`P0 — Required`: Compliance sibling, not Score

‏`ComplianceDecision` נשאר נפרד:

```text
ALLOW
BLOCK
REVIEW_REQUIRED
EXIT_ONLY
```

‏Score גבוה אינו עוקף ownership/conflict/environment veto.

### ‏`P0 — Required`: Exit capability אינה תלויה ב־Scanner opportunity path

‏כשל ב־Scanner או Entry Gate אינו מוחק את יכולת ניהול ה־episode הקיים.

---

## ‏16. State / Persistence Baseline

### ‏`P1 — Preferred`: Modular Monolith

```text
Market Data module
Decision module
Execution Simulation/Paper module
Position/Exit module
Control/Safety/Compliance module
Evidence/Replay module
Learning/Review module
```

‏אלה boundaries לוגיים; אין צורך להפוך כל אחד ל־service.

### ‏`P0 — Required`: Truth ownership מפורש

‏לכל state קריטי יש owner אחד ומקור truth ברור.

### ‏`P1 — Preferred`: Persistence פשוטה

```text
Local durable DB
+ append-only Event Journal
+ explicit schemas
+ periodic snapshots
```

### ‏`P0 — Required`: Runtime health state מפורש

```text
WARMING_UP
READY
DEGRADED
SAFE_MODE
STOPPED
```

‏`READY` דורש לפחות config valid, provider/data path healthy, sufficient fresh coverage ו־feature warmup.

---

## ‏17. Replay Baseline

### ‏`P0 — Required`: Replay הוא חלק מה־MVP

‏נשמור מספיק Evidence לשחזר:

```text
Market context
→ canonical state
→ features
→ eligibility
→ rank
→ vetoes
→ decision
```

### ‏`P0 — Required`: same Decision Core

‏Replay ו־Shadow/Paper ישתמשו באותו Domain Logic ככל האפשר.

### ‏`P0 — Required`: deterministic decision path

‏אותם inputs + אותה Strategy/Config צריכים לייצר אותה decision sequence כאשר אין stochastic component.

‏Execution simulator stochastic מותר, אך model version ו־seed נשמרים.

---

## ‏18. Versioning Baseline

### ‏`P0 — Required`: Composite identity

‏לפחות:

```text
StrategyVersionId
GitCommit / BuildIdentity
ConfigFingerprint
FeatureSetVersion
VetoPolicyVersion
ExecutionPolicyVersion
RiskPolicyVersion
DataContractVersion
UniverseDefinitionVersion
CostModelVersion
```

### ‏`P0 — Required`: IDs אינם interchangeable

```text
StrategyVersionId = exact behavior identity
RunId             = one concrete run
ExperimentId      = one research comparison/question
```

‏כל Decision ו־Run מקושרים לזהויות האלה.

---

## ‏19. Observability Baseline

‏ה־MVP אינו צריך NOC גדול, אבל הוא חייב להראות אם ה־Evidence בריא.

### ‏Minimum health metrics

```text
FreshCoverage
CriticalStaleRate
DataGapCount
Top1Age
RankGap
RankChurn
DecisionLatency p50/p95/p99
QueueAge
VetoCount by ReasonCode
TRADE / NO_TRADE / UNKNOWN counts
ReplayParity
MissingCriticalTelemetry
```

### ‏Episode/economics metrics

```text
NoFill / PartialFill
EntrySlippage
ExitSlippage
RemainingNetEdge
MFE / MAE
Giveback
TimeToFlat
Outcome by Rank bucket
```

‏`Healthy NO_TRADE` חייב להיות מובחן מ־`Broken NO_TRADE`.

---

## ‏20. Testing Baseline

### ‏`P0 — Required`

- ‏Unit tests ל־Features, costs ו־state transitions.
- ‏Determinism tests.
- ‏Replay parity tests.
- ‏State-machine tests.
- ‏Recovery tests.
- ‏Property tests ל־invariants.
- ‏Golden Decision/Replay scenarios.
- ‏Golden Failure scenarios.
- ‏Duplicate/out-of-order/gap tests.
- ‏Disconnect/reconnect tests.
- ‏Environment isolation tests.
- ‏Duplicate intent / unknown-effect tests.

### ‏`P1 — Preferred`: Fast vs Deep CI

```text
Fast CI:
small deterministic tests on every change

Deep CI:
large replay
stress / burst / soak
fault scenarios
large-data checks
```

‏Performance optimization מגיע אחרי correctness measurement.

---

## ‏21. Daily Review / Learning Baseline

### ‏`P1 — Preferred`: Daily Review הוא evidence producer

‏נשמור לפחות:

```text
Decision counts
TRADE / NO_TRADE / UNKNOWN distribution
Top-K outcome by rank
Veto impact
Costs
Latency
Replay/parity issues
Incidents
Known unknowns
```

### ‏`P0 — Required`: אין auto-tuning

```text
Observation
→ Hypothesis
→ Research Queue
→ controlled experiment
→ evidence
```

‏לא:

```text
bad day
→ change threshold
```

### ‏`P1 — Preferred`: Champion אחד + Challenger אחד מרכזי

‏כך מצמצמים multiple testing ומקבלים attribution ברור יותר.

---

## ‏22. What Is Intentionally Out of MVP

‏ברירת המחדל היא לא להכניס:

- ‏Short selling / borrow workflow.
- ‏Multiple simultaneous positions.
- ‏Multiple brokers.
- ‏Multiple primary market-data providers.
- ‏Advanced broker algos.
- ‏Direct-routing optimization.
- ‏Rich L2/depth dependency.
- ‏Black-box ML dependency.
- ‏News/NLP pipeline.
- ‏Complex regime engine.
- ‏Options/Futures/Crypto.
- ‏Portfolio optimization.
- ‏Microservices/Kubernetes/distributed consensus.
- ‏Automatic strategy promotion.
- ‏Automatic feature tuning.
- ‏Large UI platform before evidence schema.
- ‏Large behavioral-veto library.
- ‏Many entry/exit tactics in parallel.

‏כל אחד מהם יכול להפוך ל־Challenger מאוחר יותר אם Evidence מראה bottleneck אמיתי.

---

## ‏23. Alternatives

### ‏A. Last-only prototype

‏מהיר וזול ל־exploration של price behavior.

‏לא מספיק ל־execution/cost conclusion.

### ‏B. Evidence MVP — Recommended

‏המסמך הזה.

‏שומר את chain המלא מה־market state עד outcome ו־Replay בלי production platform כבדה.

### ‏C. Production-shaped MVP

‏מוסיף מוקדם deployment isolation, broker reconciliation רחב, distributed components ו־operational machinery.

‏מוצדק רק אם Hypothesis עצמה דורשת אותם.

### ‏D. Notebook/backtest בלבד

‏טוב ל־exploration.

‏חלש יותר ב־runtime timing, state machine, failure recovery ו־decision-path parity.

---

## ‏24. Trade-offs

| החלטה | מה מרוויחים | מה מפסידים |
|---|---|---|
| Feature set קטן | Attribution ופחות overfitting | פחות hypotheses במקביל |
| 10s/30s/60s baseline | degrees of freedom קטנים | ייתכן ש־horizon טוב אחר נדחה |
| Broad universe | שומר Cross-Sectional thesis | יותר data/compute |
| Long-only | state פשוט יותר | short thesis לא נבדקת |
| Single position | episode attribution פשוט | portfolio interaction לא נבדק |
| Top-K snapshots | counterfactual evidence | storage נוסף |
| Conservative simulator | פחות false edge | עשוי להיות pessimistic |
| Local durable DB | KISS ותפעול פשוט | scale מוגבל יותר |
| Modular Monolith | boundaries בלי infra tax | פחות process isolation |
| One main challenger | attribution טוב | exploration איטי יותר |

---

## ‏25. Required Evidence

‏לפני הרחבת Scope צריך להיות אפשר להפיק Evidence Packet שמכיל לפחות:

```text
RunId
ExperimentId
StrategyVersionId
ConfigFingerprint
BuildIdentity
Environment
UniverseVersion
DataContractVersion
Coverage/Freshness summary
Top-K decision snapshots
Veto/ReasonCode summary
ExecutionSimulatorVersion
CostModelVersion
Episode outcomes
Replay parity
Failure/recovery results
KnownUnknowns
OpenP0
OpenP1
```

‏`OpenP0` הנוגע ל־correctness של שלב המחקר הרלוונטי אינו משהו שמכסים בעזרת metric ממוצע טוב.

---

## ‏26. Promotion Criteria

‏ה־MVP מוכן לעבור לשלב Design רחב יותר כאשר מתקיימים יחד:

1. ‏Universe/coverage/freshness ניתנים למדידה ולשחזור.
2. ‏Features הם Point-in-Time, versioned ו־Replay-compatible.
3. ‏Top-K נשמר ב־Decision Epochs הרלוונטיים.
4. ‏Rank deterministic ומוסבר.
5. ‏`TRADE / NO_TRADE / UNKNOWN` מובחנים בפועל.
6. ‏Hard Vetoes בסיסיים עובדים עם ReasonCodes.
7. ‏Decision Snapshot מאפשר RCA ו־counterfactual analysis.
8. ‏Costs ו־execution assumptions אינם אופטימיים בשקט.
9. ‏Entry ו־Exit יוצרים episode מלא ומדיד.
10. ‏Deterministic Replay מגיע ל־parity SLO שהוגדר מראש.
11. ‏Restart/gap/duplicate/disconnect scenarios עוברים.
12. ‏Version/Config/Build/Environment identity מלאים.
13. ‏Daily Review מסוגל להפוך observations ל־Research Queue.
14. ‏אפשר לקבוע האם ה־Hypothesis התחזקה, נחלשה או נדחתה.
15. ‏אין צורך להוסיף complexity רק כדי להסביר result קיים.

‏Promotion כאן פירושו `Eligible for next research/design stage` בלבד.

---

## ‏27. Rejection / Redesign Criteria

‏אין להרחיב את ה־MVP לפני תיקון אם:

- ‏Decision אינו replayable.
- ‏Universe historical state אינו Point-in-Time.
- ‏Winner נשמר בלי alternatives.
- ‏Critical stale/unknown יכול להפיק new paper entry.
- ‏Fill model נשען על `Touch == Fill` ללא הצדקה.
- ‏Cost unknown הופך ל־0.
- ‏Feature/Config behavior משתנה ללא version.
- ‏Restart או reconnect מייצרים state שאינו ניתן להסבר.
- ‏אין הבחנה בין Healthy ו־Broken `NO_TRADE`.
- ‏Paper success מפורש כהוכחת fill realism.
- ‏רוב ה־Edge קיים רק בתרחיש execution אופטימי.
- ‏Complexity גדלה מהר יותר מיכולת attribution.
- ‏Compliance/ownership/environment invariants אינם ניתנים להוכחה.

---

## ‏28. Metrics That Decide What to Add Next

### ‏Data bottleneck

```text
FreshCoverage
CriticalStaleRate
GapRate
CrossSectionCompleteness
```

### ‏Ranking bottleneck

```text
OutcomeByRank
Rank1VsRank2ToKDelta
RankGap
RankChurn
MissedWinnerRate
```

### ‏Execution bottleneck

```text
NoFillRate
PartialFillRate
Slippage
AdverseMarkout
ExecutionLatency
```

### ‏Exit bottleneck

```text
Giveback
TimeToFlat
ExitSlippage
PostExitOpportunityCost
```

### ‏Economics bottleneck

```text
GrossToNetEdgeRetention
CostRatio
RemainingNetEdge
```

### ‏System bottleneck

```text
ReplayMismatchRate
RecoveryFailureRate
MissingTelemetryRate
LatencyPressure
ComplexityTax
```

‏ה־next feature נקבע לפי bottleneck מדוד, לא לפי novelty.

---

## ‏29. Failure Modes

1. ‏`Tiny Scope, No Evidence` — קיצוץ Bid/Ask, costs, Top-K או Replay בשם MVP.
2. ‏`Feature Creep` — הרחבת Features לפני baseline.
3. ‏`Winner-Only Logging` — אין counterfactuals.
4. ‏`UNKNOWN Collapse` — unknown הופך ל־0/false/default.
5. ‏`Execution Fantasy` — touch נחשב fill.
6. ‏`Paper Overconfidence` — Paper נתפס כהוכחת real execution.
7. ‏`No Exit Research` — Entry נמדד, Exit הוא cleanup.
8. ‏`Mutable Experiment` — config משתנה באמצע run.
9. ‏`Versionless Evidence` — אין לדעת מה יצר outcome.
10. ‏`Healthy/Broken NO_TRADE Confusion`.
11. ‏`Happy-Path MVP` — אין restart/reconnect/failure tests.
12. ‏`Microservices First` — infra לפני evidence.
13. ‏`UI First` — dashboard לפני schema/replay.
14. ‏`Daily PnL Tuning` — threshold changes בלי experiment.
15. ‏`Safety by Score` — Veto קריטי נהפך ל־penalty.
16. ‏`Blind Retry` — effect unknown יוצר action נוסף.
17. ‏`Environment Drift` — Replay/Paper path יכול להגיע ל־external authority לא מתוכננת.
18. ‏`Complexity Without Decision Impact`.

---

## ‏30. User-Specific Application

‏עבור מערכת שמבקשת להשוות אלפי מניות ולבחור Candidate קצר־אופק במהירות, שלושה דברים נשארים בלתי־ניתנים לקיצוץ:

1. ‏**Cross-sectional breadth** — כדי שהבחירה תהיה באמת יחסית לשוק ולא לרשימה שנבחרה בדיעבד.
2. ‏**Decision-level evidence** — כדי לדעת למה Candidate ניצח ומה היה קורה לחלופות.
3. ‏**Replayability** — כדי להפריד בין bug, timing artifact, market regime ושינוי Strategy.

‏ה־KISS המתאים כאן הוא:

```text
one modular process
small feature set
simple rank
few hard vetoes
one simulated/paper execution path
one entry policy
one exit policy
one durable evidence store
one deterministic replay path
```

‏לא:

```text
many strategies
many tactics
many services
many providers
many tunable parameters
```

---

## ‏31. Confidence

### ‏High

- ‏`Evidence MVP` עדיף על Feature-count MVP.
- ‏Replay, timestamps, versioning ו־Top-K הם Core ולא polish.
- ‏Execution/cost realism נדרש לפני מסקנת Net Edge.
- ‏`UNKNOWN` חייב להישאר explicit state.
- ‏Scope קטן משפר attribution ומקטין complexity/overfitting.
- ‏P0 safety/compliance/correctness אינם ניתנים לפישוט באמצעות Score.

### ‏Medium

- ‏Long-only baseline.
- ‏Single-position baseline.
- ‏`10s/30s/60s` baseline horizons.
- ‏Local DB.
- ‏Modular Monolith.
- ‏Top-K size המדויק.

### ‏Low / Experiment-dependent

- ‏Score weights.
- ‏DecisionTTL.
- ‏Spread/liquidity thresholds.
- ‏Entry tactic parameters.
- ‏Exit thresholds.
- ‏Feature weights/windows.
- ‏Target/holding duration.

---

## ‏32. Time-Sensitive Facts

‏הליבה הארכיטקטונית של ה־MVP אינה תלויה ב־Broker או Provider מסוים.

‏לפני חיבור Adapter חיצוני כל Fact תלוי זמן נשאר Reference שדורש אימות מחודש, לרבות:

- ‏market-data coverage ו־semantics.
- ‏Paper/simulator behavior של ספק חיצוני.
- ‏API limits.
- ‏order semantics/capabilities.
- ‏fees.
- ‏market calendars/session rules.
- ‏account eligibility/permissions.
- ‏broker/venue safety or self-match capabilities.

‏אין להעתיק Fact כזה ל־core logic כ־eternal constant.

---

## ‏33. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Bid/Ask נדרשים כדי למדוד quoted spread ישירות.
- ‏Timestamps נדרשים ל־latency attribution.
- ‏Replay מדויק דורש שמירת inputs/versions מספקים.
- ‏`Touch` אינו הוכחת fill.
- ‏בלי alternatives אי־אפשר לנתח באופן מלא Winner selection ו־counterfactual ranking.

### ‏Judgment

- ‏להתחיל ב־Replay/Shadow/Paper בלבד.
- ‏להתחיל Long-only/Single-position.
- ‏להשתמש ב־10s/30s/60s כ־baseline קטן.
- ‏להתחיל ב־simple score, few hard vetoes ו־Top-K.
- ‏להעדיף Local DB + Modular Monolith.
- ‏להכניס Exit, Replay, failure tests, versioning ו־Daily Review כבר ל־MVP.

### ‏Hypothesis

- ‏Cross-sectional short-horizon momentum יוצר ordering בעל predictive value.
- ‏ה־ordering שורד realistic execution/cost assumptions.
- ‏Feature set קטן ומוסבר מספיק ל־baseline שימושי לפני models מורכבים.

---

## ‏34. Canonical MVP Blueprint

```text
REPLAY / SHADOW / PAPER

Point-in-Time Broad Universe
        ↓
Canonical BBO + Last + Sizes + Timestamps + Quality
        ↓
Small Versioned Features
10s / 30s / 60s baseline
        ↓
Eligibility
        ↓
Simple Deterministic Score / Rank
        ↓
Top-K Snapshot
        ↓
Hard Vetoes
        ↓
TRADE / NO_TRADE / UNKNOWN
        ↓
Decision Snapshot
        ↓
TTL + Freshness + Risk + Compliance Revalidation
        ↓
Durable OrderIntent
        ↓
Conservative Execution Simulator / One Paper Adapter
        ↓
Single Position Episode
        ↓
Simple Versioned Exit
        ↓
Costs + MFE/MAE + Giveback + TimeToFlat
        ↓
Append-Only Evidence
        ↓
Deterministic Replay
        ↓
Daily Review
        ↓
Research Queue
```

---

## ‏35. Bottom Line

‏ה־MVP המומלץ הוא **מעבדת החלטות אמינה**, לא “רובוט קטן שמצליח לשלוח הוראות מהר”.

‏הוא צריך להיות קטן מספיק כדי להבין כל החלטה, אבל שלם מספיק כדי לבדוק את כל השרשרת:

```text
Observe correctly
→ Compare fairly
→ Decide explicitly
→ Reject when evidence is insufficient
→ Simulate conservatively
→ Close the episode
→ Measure net economics
→ Replay exactly
→ Learn cautiously
```

‏כל הרחבה מעבר ל־baseline צריכה לענות על שאלה אחת:

```text
Which measured bottleneck or falsifiable hypothesis
justifies the added Complexity Tax?
```
