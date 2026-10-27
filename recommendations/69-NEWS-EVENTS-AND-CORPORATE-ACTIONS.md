# ‏69 — Recommendation Sheet: News, Events and Corporate Actions

> ‏מקור לימודי עיקרי: `../69-NEWS-EVENTS-AND-CORPORATE-ACTIONS.md`.
>
> ‏מטרת הקובץ: להגדיר Event Awareness ו־Corporate-Action Correctness כחלק מתשתית המחקר של מערכת `Short-Horizon Momentum`, בלי להניח שכל תנועה חריגה היא Signal רגיל ובלי להפוך headline interpretation למנוע החלטה מוקדם מדי.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו מניח שאירוע או קטליזטור כלשהו מייצרים רווח.

---

## ‏1. Decision

‏השאלה אינה:

```text
What news should the strategy trade?
```

‏אלא:

```text
Was this price/volume move produced under normal market conditions,
under a known or inferred event state,
or across a mechanical corporate-action boundary;
and does that distinction materially change prediction,
comparability, execution feasibility, costs or uncertainty?
```

‏שרשרת ההכרעה המומלצת:

```text
Canonical Security Identity
→ Point-in-Time Event / Corporate-Action State
→ Raw-vs-Adjusted Data Contract
→ KNOWN / INFERRED / UNKNOWN
→ Market Reaction + Execution Context
→ Candidate Revalidation
→ Shadow Event-Aware Decision
→ Incremental Value / False-Veto Analysis
→ Promote or Reject
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Corporate-Action Correctness לפני Signal Research

‏אירועים מכניים כגון split, reverse split, dividend, spin-off, merger/reorganization או symbol change יכולים לשבור השוואת מחירים, volume, share count ו־security identity.

‏לכן נשמור תמיד:

```text
SecurityId
SymbolAsOfTime
RawPrice
AdjustedResearchPrice
AdjustmentVersion
CorporateActionType
EffectiveAt
KnownAt
Source
CorporateActionState
```

‏ה־Raw truth אינו נדרס על ידי adjusted history.

### ‏`P0 — Required`: ‏`RawPriceReturn != EconomicReturn`

‏כל feature שחוצה event boundary חייב להוכיח שההשוואה הכלכלית תקפה.

‏אין להריץ momentum/acceleration/gap logic על boundary לא פתור כאילו מדובר ב־normal market move.

### ‏`P0 — Required`: Point-in-Time Event Semantics

‏לכל Event נרצה להבחין לפחות בין:

```text
PublishedAt
ProviderReceivedAt
OurReceivedAt
ProcessedAt
KnownAt
EffectiveAt
RevisionAt
DecisionAt
```

‏Backtest/Replay משתמשים רק בגרסה שהייתה ידועה עד `DecisionAt`.

### ‏`P0 — Required`: ‏`KNOWN / INFERRED / UNKNOWN`

```text
KNOWN    = verified event metadata available in time
INFERRED = market behavior indicates event-like state
UNKNOWN  = insufficient/conflicting evidence
```

‏`No Event Record` אינו הוכחה שאין Event.

### ‏`P0 — Required`: Event Data ו־Market Data הם Streams נפרדים

‏Join מתבצע לפי:

```text
AsOfDecisionTime
```

‏ולא לפי timestamp מאוחר או normalized final record שנוח בדיעבד.

### ‏`P1 — Preferred Default`: Awareness לפני Prediction

‏הגרסה הראשונה של Event layer אינה מנסה להבין כל headline.

‏Baseline:

```text
known scheduled-event proximity
corporate-action state
halt / resume / auction / abnormal trading state
event-like shock detection from market data
market reaction metrics
execution deterioration metrics
```

‏NLP/Sentiment/LLM נשארים Challengers מאוחרים.

### ‏`P1 — Preferred Default`: Event State משפיע קודם על Context ו־Readiness

‏השלב הראשון:

```text
observe
log
classify confidence
revalidate candidate
measure execution impact
compare counterfactually
```

‏לא מתחילים מ־event-specific strategy או dozens of rules.

---

## ‏3. Why

‏אירוע יכול ליצור בדיוק את pattern שה־Scanner מחפש:

```text
large move
high velocity
high acceleration
trade-rate burst
volume burst
```

‏אבל באותו זמן גם:

```text
spread widening
depth withdrawal
higher adverse selection
lower fill reliability
shorter signal half-life
harder exit
```

‏לכן `strongest move` ו־`best executable opportunity` יכולים להתפצל דווקא בזמן Event.

---

## ‏4. Event Taxonomy — Baseline

‏לא נתחיל מעשרות קטגוריות. ארבע משפחות יספיקו:

```text
SCHEDULED_INFORMATION
UNSCHEDULED_INFORMATION
CORPORATE_ACTION
TRADING_STATE_EVENT
```

‏Derived categories יתווספו רק כאשר יש sample ו־Decision Value.

---

## ‏5. Event State Machine

‏Baseline state machine מחקרי:

```text
NORMAL
PRE_EVENT
EVENT_DETECTED
PRICE_DISCOVERY
STABILIZING
NORMALIZED
UNKNOWN
```

‏אין חובה להפעיל policy שונה בכל state. בתחילה state נועד ל־logging, replay ו־analysis.

‏Transition חייב להתבסס על observable conditions ולא על hindsight.

---

## ‏6. Event Clock

‏ל־scheduled או known event נשמור:

```text
TimeUntilEvent
TimeSinceEvent
EventAgeAtDecision
InformationAgeAtDecision
```

‏בנוסף נמדוד כאשר אפשר:

```text
MarketReactionAge
```

‏מפני ש־fresh-to-us אינו בהכרח fresh-to-market.

---

## ‏7. Event Windows

‏למחקר נפריד רעיונית:

```text
PreEvent
ImmediateReaction
PriceDiscovery
Stabilization
PostEvent
```

‏הגבולות אינם constants אוניברסליים. הם Challengers שדורשים empirical validation.

---

## ‏8. Scheduled Events

‏הערך הראשוני של Scheduled Event אינו לחזות את התוצאה אלא לדעת מראש שה־distribution עלול להשתנות.

‏Baseline features:

```text
KnownEventType
TimeUntilKnownEvent
CalendarFreshness
CalendarCoverage
```

‏`EventProximity` מתחיל כ־Context/Shadow feature. Hard Veto דורש Evidence נפרד ו־false-veto accounting.

---

## ‏9. Unscheduled / Unknown Events

‏כאשר אין source מאומת אך השוק משתנה בחדות, נוכל לשמור:

```text
EventLikeState = INFERRED
```

‏מתוך signals כגון:

```text
trade_rate_shock
volume_shock
spread_shock
volatility_shock
depth_withdrawal
gap-like discontinuity
halt_resume
```

‏אין להפוך inferred catalyst לעובדה.

---

## ‏10. Corporate Actions — Data Contract

‏לכל action:

```text
CorporateActionId
SecurityId
ActionType
KnownAt
EffectiveAt
RawValueBefore
RawValueAfter
AdjustmentFactor
AdjustmentVersion
Source
Revision
ResolutionState
```

‏`CorporateActionState`:

```text
RESOLVED
PENDING
CONFLICTED
UNKNOWN
```

‏Feature שחוצה boundary לא פתור נשאר `NOT_READY` למחקר הדורש continuity.

---

## ‏11. Security Identity

‏ברירת המחדל:

```text
SecurityId != Symbol
```

‏Ticker הוא label בזמן מסוים, לא identity היסטורית יציבה.

‏Symbol changes, reorganizations, mergers ו־relistings חייבים lineage.

---

## ‏12. Raw vs Adjusted Data

‏שתי שכבות נשמרות בנפרד:

```text
Raw Market Truth     → execution/replay/tape semantics
Adjusted Research    → economic continuity where appropriate
```

‏אין transformation שקטה בין השתיים.

‏כל research artifact מציין באיזה basis השתמש.

---

## ‏13. Duplicate / Revision Handling

‏אותו Event יכול להגיע בכמה messages או providers.

‏Canonical model:

```text
EventId
EventType
PrimarySecurityId
RelatedSecurityIds
PublishedAt
KnownAt
Source
SourceLineage
Revision
SupersedesRevision
Confidence
```

‏`SourceCount != IndependentSourceCount`.

---

## ‏14. Provider Boundary

‏נפריד לוגית:

```text
EventDataProvider
CorporateActionProvider
MarketDataProvider
ExecutionBroker
```

‏גם אם vendor אחד מספק כמה שכבות.

‏Strategy core מקבלת canonical event contract ולא provider payload.

---

## ‏15. Event Adapter Contract

‏Adapter אחראי ל:

```text
parsing
timestamp semantics
deduplication
revision lineage
source identity
unknown-field handling
taxonomy version
```

‏Provider swap אמור להחליף Adapter ולא לשנות Strategy semantics ללא שינוי מפורש.

---

## ‏16. Event Generation / Candidate Invalidation

‏כאשר Event מהותי נכנס למערכת:

```text
EventGeneration++
```

‏Candidate/Decision שנבנו לפני generation החדש אינם מקבלים trust אוטומטי.

‏ב־Replay/Shadow נבדוק:

```text
old decision
→ event arrives
→ invalidate / revalidate
→ recompute rank / feasibility / veto context
```

---

## ‏17. Halt / Resume / Auction

‏אלה `Trading-State Events`, לא normal continuous trading.

‏לאחר halt/resume או discontinuity משמעותי:

```text
old signal = stale candidate
old queue assumptions = invalid
warmup / revalidation required
```

‏Auction prints אינם מושווים אוטומטית ל־continuous prints בלי semantics מתאימים.

---

## ‏18. Event Reaction Metrics

‏במקום לנסות להבין story, נמדוד:

```text
Gap
Velocity
Acceleration
TradeRateShock
VolumeShock
SpreadShock
DepthWithdrawal
Continuation
Giveback
```

‏נוסיף curves:

```text
outcome vs event age
spread vs event age
liquidity vs event age
```

---

## ‏19. Recovery Metrics

‏Metrics שימושיים:

```text
TimeToFirstStableQuote
TimeToNormalSpread
TimeToLiquidityRecovery
TimeToTarget
TimeToFlat
PostFillMarkout
PostTargetGiveback
```

‏כך Event layer מודדת גם מתי execution חוזר להיות comparable, לא רק כיוון מחיר.

---

## ‏20. Event Half-Life

‏נפריד:

```text
Information relevance half-life
Continuation-signal half-life
Execution-recovery half-life
```

‏אירוע יכול להישאר חשוב זמן רב גם כאשר short-horizon continuation edge כבר נעלם.

---

## ‏21. Latency

‏Event-awareness דורשת latency decomposition:

```text
Publication
→ Provider ingestion
→ Distribution
→ Receive
→ Parse
→ Classify
→ Decision
```

‏נמדוד:

```text
InformationAgeAtDecision
LatencyPressure = EndToEndLatency / MeasuredSignalHalfLife
```

‏לא מניחים ש־headline שקיבלנו עכשיו עדיין actionable.

---

## ‏22. Execution Attribution

‏לכל Event State נפריד:

```text
PREDICTION
continuation / giveback
MFE / MAE
rank quality

EXECUTION
spread
fill probability
slippage
post-fill markout
exit feasibility

ECONOMICS
expected gross move
conditional costs
net outcome
```

‏כך לא מאשימים את Signal כאשר הבעיה היא execution.

---

## ‏23. Conditional Cost / Fill Models

‏Costs ו־fills אינם constants בזמן אירוע.

‏נחקור:

```text
E[Cost | EventState, SpreadState, VolatilityState, LiquidityState]
P(Fill | EventState, ExecutionState)
E[PostFillMarkout | EventState]
```

‏זה Research/Replay contract, לא הוראת ביצוע.

---

## ‏24. Event + Ranking

‏`Rank #1` בזמן shock רחב דורש Context:

```text
EventBreadth
CrossSectionalDispersion
CorrelationShock
MarketReturn
SectorReturn
ResidualMove
RankGap
```

‏המטרה היא לבדוק האם Candidate באמת ייחודית או winner טכני בתוך shock משותף.

---

## ‏25. Event + Context Layer

‏מקטע 68 נשאר מקור האמת ל־Context architecture.

‏69 מוסיף אליו:

```text
EventState
EventAge
EventConfidence
EventSourceState
CorporateActionState
EventGeneration
```

‏בלי ליצור Context engine מקביל.

---

## ‏26. Event + Negative Evidence

‏Event layer רשאית לייצר Reason Codes למחקר/Shadow:

```text
EVENT_PROXIMITY_HIGH
EVENT_STATE_UNKNOWN
CORPORATE_ACTION_UNRESOLVED
POST_HALT_WARMUP
SPREAD_SHOCK
NEWS_AGE_TOO_HIGH
DATA_CONFLICT_EVENT
DEGRADED_EVENT_AWARENESS
```

‏Hard Veto מוגדר רק לאחר Evidence חזק או כאשר מדובר ב־data/readiness invariant ברור, לא בגלל label דרמטי.

---

## ‏27. Entry / Exit / Existing State Separation

‏Event State אינו Boolean יחיד.

‏יש להפריד:

```text
NewEntryReadiness
PendingDecisionValidity
ExistingPositionMonitoring
ExitFeasibility
```

‏במחקר/Replay אירוע חדש יכול לבטל Decision ישן גם אם Rank נשאר גבוה.

---

## ‏28. Event Source Health

‏נמדוד לפחות:

```text
coverage
freshness
duplicate_rate
revision_rate
unknown_type_rate
provider_divergence
calendar_completeness
```

‏Source outage אינו שקוף. המערכת מציגה למשל:

```text
DEGRADED_EVENT_AWARENESS
```

---

## ‏29. Event Data ≠ Safety Truth

‏גם feed איכותי יכול לפספס Event.

‏לכן:

```text
NoKnownEvent != GuaranteedNormalState
```

‏Market anomaly detector נשאר secondary detector עצמאי.

---

## ‏30. Baseline Research Dataset

‏לכל Candidate snapshot נשמור, כאשר זמין:

```text
DecisionTime
SecurityId
SymbolAsOfTime
EventState
EventType
EventPublishedAt
EventKnownAt
EventAge
EventConfidence
EventSourceState
CorporateActionState
EventGeneration
MarketGeneration
DataGeneration
SpreadState
LiquidityState
VolatilityState
EventBreadth
Rank
RankGap
VetoReasons
ForwardLabels
MFE
MAE
TimeToTarget
PostFillMarkout
```

---

## ‏31. Replay Requirements

‏Replay משחזר causally:

```text
Market events
+ Event metadata arrivals
+ Revisions / corrections
+ Corporate-action metadata
+ Trading-state transitions
```

‏אירוע שנודע מאוחר אינו משנה Decision היסטורי מוקדם.

---

## ‏32. Golden Scenarios

‏נבנה לפחות:

```text
scheduled event approaches
unexpected event while candidate is top-ranked
event arrives after decision before simulated submit
event arrives while simulated order is pending
halt / resume
corporate-action boundary
provider conflict
source outage
revision after initial event
```

‏המטרה היא deterministic state transition ו־auditability.

---

## ‏33. Counterfactuals

‏ב־Shadow/Replay נשמור:

```text
DecisionWithoutEventContext
DecisionWithEventContext
```

‏ונמדוד:

```text
AvoidedBadCandidates
MissedGoodCandidates
DecisionImpactRate
MarginalDecisionValue
```

‏False veto cost הוא metric חובה לכל event gate.

---

## ‏34. Event Ablation Ladder

‏נבדוק בהדרגה:

```text
Baseline
→ + Corporate-Action Correctness
→ + Event Logging
→ + Scheduled-Event Proximity
→ + Inferred Event-Like State
→ + Soft Event Penalty / Threshold Challenger
→ + Hard Gate only if justified
→ + Event-Specific Model only if strongly justified
```

---

## ‏35. NLP / Sentiment / LLM

‏לא Baseline.

‏אם נבדקים מאוחר יותר:

```text
point-in-time source
latency measured
versioned parser/model
calibration
metadata-only baseline
ablation
shadow
```

‏`Sentiment != Surprise`, ו־positive/negative text אינו קיצור דרך ל־short-horizon outcome.

---

## ‏36. Alternatives

### ‏Alternative A — No Event Awareness

‏פשוט אך מסוכן למחקר: corporate actions יכולים לייצר fake moves, ו־event shocks יכולים להתערבב עם normal momentum.

### ‏Alternative B — Metadata + Market Reaction Baseline

‏**Preferred Default.**

```text
corporate-action correctness
+ scheduled-event metadata
+ abnormal market-state detection
+ execution context
```

### ‏Alternative C — Event-Specific Rules

‏`P2/P3` בלבד לאחר OOS/Shadow.

### ‏Alternative D — NLP / Specialized Event Models

‏`P3/P4`, רק אם metadata/reaction baseline מפסיד Decision Value משמעותי.

---

## ‏37. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏LLM על כל headline ב־hot path.
- ‏hard sentiment rules.
- ‏עשרות event categories.
- ‏מודל נפרד לכל event type.
- ‏vendor-specific payload בתוך Strategy core.
- ‏forced mapping של unknown event.
- ‏final corrected event history כאילו היה known historically.
- ‏adjusted prices בלי raw lineage.
- ‏Ticker בתור security identity.
- ‏Event veto בלי missed-good accounting.

---

## ‏38. What to Add Later

‏לאחר Evidence:

- ‏Event-type stratification.
- ‏calibrated event-risk probability.
- ‏event-conditioned cost/fill models.
- ‏event-aware threshold challenger.
- ‏secondary-move continuation research.
- ‏NLP/surprise extraction.
- ‏multi-source lineage/independence scoring.
- ‏event-specific execution challenger.
- ‏specialized models רק כאשר sample ו־incremental value מצדיקים.

---

## ‏39. Required Data / Evidence

‏לכל claim Event-aware נדרש:

```text
point-in-time event metadata
source + revision lineage
security identity history
corporate-action effective/known times
raw market data
adjustment version
context snapshot
forward labels
execution/cost outcomes
episode counts
unique days / symbols / event episodes
OOS or walk-forward evidence
```

---

## ‏40. Promotion Criteria

‏Event-aware component מתקדם רק אם:

1. ‏המידע causal ו־point-in-time.
2. ‏Corporate-action handling אינו משנה raw truth.
3. ‏Security identity ו־symbol lineage ברורים.
4. ‏Deduplication/revision semantics שחזורים.
5. ‏ה־effect שורד OOS/Walk-Forward.
6. ‏הוא אינו תלוי במספר קטן של episodes.
7. ‏השיפור נשאר אחרי realistic costs/execution assumptions.
8. ‏Decision Impact מהותי.
9. ‏False-veto cost מקובל ביחס ל־avoided bad outcomes.
10. ‏Latency/InformationAge תואמים ל־signal half-life.
11. ‏Shadow/Replay יציבים.
12. ‏Fallback/UNKNOWN/source-outage behavior מפורשים.

---

## ‏41. Rejection Criteria

‏נפסול או נשאיר Analysis-only כאשר:

- ‏ה־feature משתמש במידע עתידי או correction מאוחר.
- ‏הערך נעלם OOS.
- ‏הוא נשען על few event episodes.
- ‏הוא תלוי quirks של provider אחד ללא contract.
- ‏הוא משנה מעט מאוד decisions.
- ‏False-veto cost גדול מהתועלת.
- ‏execution wipes the predictive gain.
- ‏taxonomy fragmentation יוצרת sparse buckets.
- ‏event detection מאוחר יחסית ל־signal half-life.
- ‏baseline של metadata + market reaction נותן כמעט אותה תוצאה.

---

## ‏42. Metrics

### ‏Data / Source

```text
EventCoverage
CalendarCoverage
Freshness
DuplicateRate
RevisionRate
ProviderDivergence
UnknownTypeRate
```

### ‏Event State

```text
KnownRate
InferredRate
UnknownRate
EventAge
StateDwellTime
TransitionRate
```

### ‏Prediction

```text
ContinuationProbability
GivebackProbability
MFE
MAE
TimeToTarget
OutcomeByEventAge
```

### ‏Execution

```text
SpreadShock
FillRate
Slippage
PostFillMarkout
TimeToStableQuote
TimeToNormalSpread
TimeToLiquidityRecovery
TimeToFlat
```

### ‏Decision Value

```text
DecisionImpactRate
AvoidedBadCandidates
MissedGoodCandidates
MarginalDecisionValue
NetOutcomeDelta
```

### ‏Robustness

```text
EventEpisodeCount
UniqueDays
UniqueSymbols
OOSDelta
ThresholdSensitivity
ProviderSensitivity
```

---

## ‏43. Failure Modes

‏Failure modes מרכזיים:

- ‏Corporate-action fake alpha.
- ‏Adjusted-data leakage.
- ‏Wrong effective date.
- ‏Ticker identity break.
- ‏Duplicate event treated as multiple shocks.
- ‏Revision overwrites historical knowledge.
- ‏Fresh-to-us assumed fresh-to-market.
- ‏Event feed outage interpreted as no event.
- ‏Unknown forced into known taxonomy.
- ‏Headline sentiment treated as economic surprise.
- ‏Market-wide shock mistaken for idiosyncratic candidate strength.
- ‏Event model ignores execution deterioration.
- ‏Rank remains high while candidate intent is stale.
- ‏Halt/resume reuses stale state.
- ‏Event class explosion.
- ‏Provider-specific semantics leak into Strategy core.
- ‏False vetoes hidden from reports.
- ‏Rows counted instead of independent EventEpisodes.

---

## ‏44. User-Specific Application

‏למערכת מחקרית שסורקת Universe רחב ומחפשת תנועות קצרות מאוד, Event layer חשובה במיוחד לא בגלל ניסיון “לנצח חדשות”, אלא כדי להגן על semantics של ה־Scanner:

```text
Is the move economically real?
Is it comparable to prior history?
Is it broad-market or security-specific?
Is the candidate decision still fresh?
Has execution deteriorated faster than predicted movement improved?
```

‏לכן סדר העדיפות הוא:

```text
P0  Corporate-action correctness + security identity + causal timestamps
P1  Event/Trading-state awareness + logging + source health
P1  Market-reaction / execution shock measurements
P2  Scheduled-event proximity as challenger
P2  Soft event-risk / threshold challenger
P3  Event-specific model
P4  NLP / LLM / complex content classification
```

---

## ‏45. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Corporate actions יכולים לשנות price/share-count/security identity semantics.
- ‏News/Event data ו־Market Data מגיעים ב־streams וב־clocks נפרדים.
- ‏Revisions ו־duplicate messages יכולים לשנות event history אם לא שומרים lineage.

### ‏Judgment

- ‏Event Awareness צריך להתחיל כתשתית Data/Context, לא כ־headline strategy.
- ‏Metadata + market reaction + execution context הם Baseline טוב יותר מ־NLP-first.
- ‏`UNKNOWN` עדיף על classification שקרי.

### ‏Hypothesis

- ‏Event proximity עשוי לשפר candidate gating.
- ‏Secondary move עשוי להיות שימושי יותר מהתגובה הראשונה.
- ‏Event-conditioned cost/fill models עשויים להוסיף Net Decision Value.
- ‏איזה Event type או state מוסיף Edge בפועל אינו ידוע ללא Validation.

---

## ‏46. Confidence

### ‏High confidence

- ‏Point-in-time event/corporate-action semantics הם תנאי למחקר אמין.
- ‏Raw truth ו־adjusted research data צריכים contract נפרד.
- ‏Security identity חייבת להיות יציבה יותר מ־Ticker.
- ‏Event source outage/missing metadata אינם equivalent ל־normal state.
- ‏Execution ו־Prediction צריכים attribution נפרד בזמן Event.

### ‏Medium confidence

- ‏Scheduled-event proximity, event-like shock state ו־recovery metrics הם Contexts שימושיים למחקר.
- ‏Shadow-first + counterfactual false-veto accounting הוא מסלול promotion טוב.

### ‏Low / Unproven

- ‏איזה event category מועיל בפועל.
- ‏האם hard event gate עדיף על soft penalty.
- ‏האם NLP/LLM מוסיפים ערך אינקרמנטלי.
- ‏האם secondary continuation עקבי מספיק לשימוש עתידי.

---

## ‏47. Time-Sensitive Facts

‏המקטע המתודולוגי עצמו אינו תלוי ב־Broker מסוים.

‏לפני שימוש עתידי ב־Event Provider, Corporate Action feed, exchange halt feed, calendar, taxonomy או provider-specific timestamps יש לאמת מחדש:

```text
coverage
entitlements
latency
timestamp semantics
revision behavior
corporate-action conventions
symbol mapping
provider availability
```

---

## ‏48. Relationship to Earlier Sheets

‏69 נשען על:

- ‏05/59 — Market Data semantics/freshness.
- ‏07 — Point-in-time Universe/security lifecycle.
- ‏18 — Cost-aware economics.
- ‏20/21/61 — causal backtest/replay realism.
- ‏23/24 — leakage and controlled experiments.
- ‏43 — Halts/LULD/Fast Markets.
- ‏46 — Adverse Selection.
- ‏60A — Negative Evidence/Veto semantics.
- ‏68 — Context Vector architecture.

‏69 אינו מחליף אותם; הוא מוסיף Event/Corporate-Action lineage אל אותה decision chain.

---

## ‏49. Definition of Done

‏Event/Corporate-Action awareness נחשבת מוכנה למחקר רציני רק כאשר יש:

```text
point-in-time canonical event model
security identity lineage
raw + adjusted data contract
corporate-action lineage
effective / known / published / revision timestamps
deduplication
revision history
KNOWN / INFERRED / UNKNOWN semantics
source-health metrics
replay support
event-aware RCA
counterfactual event-policy comparison
false-veto accounting
OOS validation
```

---

## ‏50. Recommendation Summary

```text
Baseline
→ make security identity and corporate actions correct
→ preserve raw truth + explicit adjusted research view
→ ingest event metadata causally with revisions and deduplication
→ keep KNOWN / INFERRED / UNKNOWN separate
→ detect abnormal market state even when no catalyst is known
→ record EventState on every candidate snapshot
→ invalidate/revalidate stale decisions after meaningful events
→ measure prediction, execution and recovery separately
→ start event policy in Shadow
→ account for false vetoes
→ promote only incremental OOS net decision value
→ add NLP/event-specific models only after simpler awareness proves insufficient
```

> ‏**המלצת ברירת המחדל: קודם לבנות Event Awareness ו־Corporate-Action Correctness שאפשר לשחזר ולהוכיח בזמן אמת; רק אחר כך לבדוק אם תוכן האירוע עצמו מוסיף מידע מעבר למה שכבר רואים במחיר, בנזילות ובביצוע.**