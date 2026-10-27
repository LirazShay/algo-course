# ‏81 — Recommendation Sheet: MVP Design

> ‏מקור לימודי עיקרי: `../81-MVP-DESIGN.md`.
>
> ‏מטרת הקובץ: להגדיר את ה־`MVP` הקטן ביותר שמסוגל לייצר Evidence אמין ברמת החלטה עבור Hypothesis של `Short-Horizon Momentum`, בלי להפוך את ה־MVP ל־Production platform מוקדם מדי ובלי לחתוך דווקא את הרכיבים שמאפשרים לדעת אם התוצאה אמיתית.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו אישור Production למסחר אמיתי.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
What is the smallest robot we can code?
```

‏אלא:

```text
What is the smallest system
that can produce credible, replayable, decision-level evidence
about predictive value, executability and net economics?
```

‏ברירת המחדל:

```text
Broad Point-in-Time Universe
→ Fresh Canonical Market State
→ Small Versioned Feature Set
→ Eligibility
→ Simple Explainable Rank
→ Basic Hard Vetoes
→ TRADE / NO_TRADE / UNKNOWN
→ Pre-Submit Revalidation
→ Conservative Simulation / Paper
→ Versioned Exit
→ Costs + Outcome Labels
→ Decision Snapshots + Top-K
→ Deterministic Replay
→ Daily Evidence Review
```

‏כל רכיב שאינו נדרש כדי להכריע Hypothesis מרכזית, לשמור correctness או לאפשר attribution נשאר מחוץ ל־MVP כברירת מחדל.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: לבנות `Evidence MVP`, לא `Feature MVP`

‏ה־MVP צריך לענות בצורה אמינה על שלוש שאלות:

1. ‏האם Candidates גבוהים בדירוג מפגינים outcome עתידי טוב יותר מ־Candidates חלשים יותר?
2. ‏האם ההבדל נשאר אחרי spread, slippage, latency, no-fill/partial-fill assumptions ועלויות?
3. ‏האם אותה החלטה ניתנת לשחזור מאותם Point-in-Time inputs ואותה `StrategyVersion`?

‏אם המערכת אינה יכולה לענות על שלושתן, עוד Feature או UI אינם מתקנים את הבעיה.

### ‏`P0 — Required`: ברירת המחדל היא `Replay → Shadow → Paper`

‏ה־MVP יתקדם Evidence-wise:

```text
Historical / Replay Evidence
→ Shadow Decision Evidence
→ Paper Integration Evidence
```

‏`Paper` אינו הוכחה ל־live fill quality; הוא בעיקר Evidence על integration, state, timing ו־workflow.

### ‏`P0 — Required`: `Whole-Universe` נשאר חלק מה־Hypothesis

‏אם מטרת המחקר היא בחירה Cross-Sectional מתוך שוק רחב, אין לצמצם את ה־MVP לרשימת Symbols ידנית רק כדי להקל על המימוש.

‏נשמור:

```text
UniverseId
UniverseVersion
AsOfTimestamp
IncludedSymbols
ExcludedSymbols
ExclusionReasons
```

‏ה־Universe צריך להיות Point-in-Time וניתן לשחזור.

### ‏`P0 — Required`: נתוני שוק מינימליים אך מספקים למחקר Execution

‏Baseline:

```text
Last
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

‏`Last-only` יכול לשמש מחקר Price Momentum מוקדם, אך אינו Evidence MVP מלא ל־executability או costs.

### ‏`P0 — Required`: Canonical State לפני Features

‏Provider DTOs אינם Domain Model.

‏כל feed עובר normalization ל־Canonical State עם semantics אחידים, quality, freshness ו־generation.

```text
READY
STALE
GAPPED
INVALID
NOT_READY
UNKNOWN
```

‏Missing state אינו מומר בשקט ל־0.

### ‏`P0 — Required`: Time Model מפורש

‏נשמור לפחות:

```text
Event/SourceTime
ReceiveTime
DecisionTime
Simulated/Paper SubmitTime
Simulated/Paper FillTime
FlatTime where applicable
```

‏בלי time domains מפורשים אין latency attribution אמין ואין Replay אמין.

### ‏`P0 — Required`: Feature Set קטן, מוסבר ו־versioned

‏Baseline מחקרי צריך מספר קטן של משפחות Features:

- ‏Price return.
- ‏Momentum consistency.
- ‏Acceleration/shape בסיסי.
- ‏Trade activity / relative activity.
- ‏Spread.
- ‏Freshness.
- ‏Liquidity / executability.

‏כל Feature מקבל definition/version מפורש, לדוגמה `return_10s_v1`.

‏שינוי formula הוא שינוי behavior-bearing ואינו נשמר תחת אותו ID.

### ‏`P1 — Preferred`: מעט Horizons מייצגים בתחילת הדרך

‏ברירת מחדל מחקרית סבירה:

```text
10s
30s
60s
```

‏המטרה היא להקטין degrees of freedom. הרחבת horizons תיעשה רק אם Evidence מצדיק אותה.

### ‏`P0 — Required`: Score פשוט ומוסבר

‏ה־Score הראשון צריך להיות inspectable ולא “חכם” ככל האפשר.

```text
Small explainable feature set
→ simple score
→ cross-sectional rank
→ Top-K
```

‏משקלים מדויקים הם `Hypothesis`, לא Fact.

### ‏`P0 — Required`: לשמור `Top-K`, לא רק Winner

‏בכל `DecisionEpoch` נשמור לפחות:

```text
Top-K
Scores
RankGap
RankAge
DataAges
Eligibility
Veto state
```

‏כך ניתן למדוד Rank1 מול Rank2-5, Winner's Curse, alternatives ו־counterfactuals.

### ‏`P0 — Required`: Eligibility לפני Rank במקום שבו failure אינו “ציון נמוך”

‏מצבים כגון:

```text
Invalid data
Critical stale data
Insufficient history
Impossible market state
```

‏אינם רק Feature שלילי; הם יכולים להפוך את ה־Candidate ל־ineligible.

### ‏`P0 — Required`: Negative Evidence MVP קטן

‏Baseline hard vetoes:

- ‏Critical stale data.
- ‏Invalid market state.
- ‏Economic/spread infeasibility.
- ‏Missing critical state.

‏Behavioral vetoes מורכבים יתחילו כ־Shadow evidence כדי למדוד false-veto cost לפני שהם משנים decisions.

### ‏`P0 — Required`: `TRADE / NO_TRADE / UNKNOWN` הם שלושה Outputs שונים

```text
TRADE     = candidate passed the research/paper decision gates
NO_TRADE  = enough trustworthy information exists and no candidate qualifies
UNKNOWN   = critical information is not trustworthy enough to decide
```

‏`UNKNOWN` חוסם simulated/paper new entry.

### ‏`P0 — Required`: Full `DecisionSnapshot`

‏כל decision צריך להיות explainable לאחר מעשה:

```text
DecisionId
DecisionEpoch
Timestamp
StrategyVersion
ConfigFingerprint
UniverseVersion
TopK
SelectedSymbol
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

‏Decision שלא ניתן להסביר אינו Evidence טוב גם אם outcome שלו נראה חיובי.

### ‏`P0 — Required`: Pre-Submit Revalidation + `DecisionTTL`

‏לפני simulated/paper external effect נבדוק מחדש:

```text
Freshness
Eligibility
Spread / executable state
Decision age
Critical veto state
```

‏הערך המספרי של TTL אינו נקבע כאן; הוא דורש measurement ביחס ל־signal half-life.

### ‏`P0 — Required`: `OrderIntent` durable לפני external effect

‏גם ב־Paper נתרגל contract נכון:

```text
IntentId
DecisionId
SymbolId
Side
QuantityPolicy
PricePolicy
CreatedAt
StrategyVersion
```

‏ה־Intent נשמר לפני הקריאה ל־simulator/Paper adapter.

### ‏`P0 — Required`: Execution Simulator שמרני ו־versioned

‏אסור להניח `Touch == Fill`.

‏נשמור לפחות שלושה תרחישים:

```text
Optimistic
Base
Stress
```

‏ונפריד בין:

```text
Decision Replay
Execution Simulation
```

‏Decision path צריך להיות deterministic ככל האפשר; fill model יכול להיות stochastic, אבל seed/model version נשמרים.

### ‏`P0 — Required`: Cost Model הוא חלק מה־MVP

‏נמדוד לפחות:

```text
QuotedSpread
ArrivalBenchmark
EntrySlippage
ExitSlippage
Fees
SafetyBuffer / uncertainty range
RemainingNetEdge
```

‏אין להמיר cost unknown ל־0 ואין להשתמש ב־gross return כתחליף ל־net executable evidence.

### ‏`P0 — Required`: Entry Policy אחת פשוטה + Exit מהיום הראשון

‏אין לבדוק Entry בלי Exit.

‏Baseline צריך policy versioned אחד לכל צד של ה־episode, לא עשרה order tactics במקביל.

‏Exit יכול להשתמש ב־policy פשוטה המשלבת time, signal decay, adverse move או reversal; הפרמטרים עצמם נשארים Hypotheses.

### ‏`P1 — Preferred`: Outcome labels רחבים יותר מה־Strategy

‏Baseline useful labels:

```text
ForwardReturn1s
ForwardReturn2s
ForwardReturn5s
ForwardReturn10s
ForwardReturn30s
ForwardReturn60s
TimeToFirstProfit
TimeToTarget
MFE
MAE
Giveback
TimeToFlat
```

‏Labels נוצרים רק לאחר הזמן הרלוונטי ואסור שיזלגו ל־features.

### ‏`P0 — Required`: Replay הוא Core MVP

‏ה־MVP חייב לשמור append-only evidence מספיק כדי לשחזר:

```text
Market context
→ Features
→ Rank
→ Decision
```

‏אותם inputs + אותה version צריכים לייצר אותה decision sequence כאשר אין stochastic component.

### ‏`P1 — Preferred`: Persistence פשוטה אך durable

‏Baseline:

```text
Local durable DB
+ explicit schema
+ append-only journal
+ periodic snapshots
+ SQL-friendly research surface
```

‏אין צורך ב־distributed storage או external event bus כברירת מחדל.

### ‏`P0 — Required`: Scanner Health נפרד מ־Market Opportunity

‏נבדיל בין:

```text
Healthy NO_TRADE
Broken NO_TRADE
```

‏Diagnostics מינימליים:

- ‏`FreshCoverage`.
- ‏`Top1Age`.
- ‏Decision latency.
- ‏Rank churn.
- ‏Queue age.
- ‏Veto counts.
- ‏Data quality state.

### ‏`P0 — Required`: Correlation IDs ו־Episode Identity

```text
MarketEvent
→ DecisionId
→ IntentId
→ OrderId
→ FillId
→ PositionEpisodeId
```

‏כך ניתן לבצע attribution מלא מהחלטה עד outcome.

### ‏`P1 — Preferred`: Scope ראשוני `Long-only` ו־Single Position

‏זוהי החלטת Scope מחקרית, לא טענה כלכלית.

‏היא מפחיתה:

- ‏Borrow/locate dependencies.
- ‏Simultaneous exposure state.
- ‏PnL attribution ambiguity.
- ‏Exit/recovery complexity.

‏הרחבה ל־Short או multi-position דורשת Evidence שהיא עונה על צורך שה־MVP הנוכחי אינו מסוגל לבדוק.

### ‏`P0 — Required`: Risk invariants גם ב־Paper

‏Risk ב־MVP כולל state/data/execution/operational correctness.

‏Baseline invariants:

```text
No new entry on critical stale data
No new entry on UNKNOWN critical state
Existing Exposure > New Opportunity
Every external order effect has durable intent identity
Every decision references StrategyVersion
At most one active position in single-position MVP
```

### ‏`P0 — Required`: Restart ו־Failure Scenarios הם חלק מ־Definition of Done

‏חובה לבדוק לפחות:

- ‏Restart.
- ‏Crash בזמן pending simulated/paper order.
- ‏Duplicate event.
- ‏Out-of-order event.
- ‏Data gap.
- ‏Provider disconnect/reconnect.
- ‏Generation rollover.
- ‏Stale data.

‏Happy Path לבדו אינו Evidence MVP מלא.

### ‏`P0 — Required`: כל Run מזוהה

```text
RunId
ExperimentId
StrategyVersion
ConfigFingerprint
BuildIdentity
Environment = REPLAY / SHADOW / PAPER
```

‏אין fallback שקט בין environments.

### ‏`P1 — Preferred`: UI קטן שמשרת Explainability

‏ה־UI הראשון צריך להציג:

- ‏System health.
- ‏Top-K.
- ‏Selected Candidate.
- ‏`Why This Candidate?`.
- ‏`Why No Trade?`.
- ‏Current episode state.
- ‏Recent decisions/incidents.

‏UI עשיר אינו תנאי למחקר; structured evidence כן.

### ‏`P1 — Preferred`: Research Query Surface פשוט

‏צריך להיות קל לענות על שאלות כגון:

```text
How did Rank1 perform vs Rank2-5?
How often did NO_TRADE avoid poor outcomes?
How much predicted edge remained after modeled costs?
Which vetoes changed decisions?
```

### ‏`P1 — Preferred`: Baseline קפוא + Challenger יחיד בכל פעם

‏לפני tuning נדרש baseline פשוט.

‏Feature flags יכולים לעזור ל־ablation ו־Shadow compute, אך resolved flags הם חלק מה־`StrategyVersion`.

### ‏`P1 — Preferred`: Daily Review מייצר Evidence בלבד

‏בסוף session נשמור לפחות:

- ‏Decision count.
- ‏Trade/Paper episode count.
- ‏`NO_TRADE` count.
- ‏Top-K outcome by rank.
- ‏Costs.
- ‏Latency.
- ‏Vetoes.
- ‏Incidents.

‏אין auto-tuning על בסיס session יחיד.

### ‏`P0 — Required`: Minimum Viable Tests

‏לפחות:

- ‏Unit tests לחישובי Features ו־Costs.
- ‏Determinism tests.
- ‏Replay parity tests.
- ‏State-machine tests.
- ‏Recovery tests.
- ‏Property tests ל־invariants.
- ‏Golden Replay scenarios.
- ‏Golden Failure scenarios.

### ‏`P1 — Preferred`: Fast CI ו־Deep CI נפרדים

‏`Fast CI` צריך לרוץ בכל שינוי.

‏Replay עמוק, soak, stress ו־large-data checks יכולים להיות stage נפרד.

### ‏`P1 — Preferred`: Performance Budgets אחרי Correctness

‏נמדוד:

```text
Ingestion
Feature update
Ranking
Decision
Pre-submit validation
```

‏עם לפחות `p50/p95/p99` ו־tail incidents.

‏Optimization מתבצע רק אחרי measurement.

### ‏`P0 — Required`: Explicit Runtime Health States

‏Baseline קטן:

```text
WARMING_UP
READY
DEGRADED
SAFE_MODE
STOPPED
```

‏`READY` מגיע רק אחרי config validity, provider health, sufficient fresh coverage ו־feature warmup.

### ‏`P0 — Required`: Success מוגדר כ־Evidence, לא כ־daily PnL

‏תוצאה מוצלחת של MVP יכולה להיות גם:

- ‏Hypothesis נדחית.
- ‏Signal קיים אך אינו executable.
- ‏Edge קיים רק ב־regime צר.
- ‏Costs מוחקים את edge.
- ‏Ranking עובד אך Exit חלש.

‏המטרה היא להגיע למסקנה אמינה, לא להצדיק מראש את האסטרטגיה.

### ‏`P1 — Preferred`: `Modular Monolith` כברירת מחדל

‏לרובוט אישי מחקרי:

```text
One process where practical
+ clear module contracts
+ local durable persistence
+ in-process bounded queues
```

‏Process boundary חדש מוצדק רק על ידי isolation, security, provider constraint, scaling או fault containment מוכח.

---

## ‏3. Why

‏ה־MVP חייב להיות קטן כדי לצמצם degrees of freedom, זמן מימוש ו־failure surface, אבל לא קטן באופן שמוחק Evidence.

‏החלקים שהכי קל לדחות — timestamps, Replay, versioning, Top-K, rejected candidates, NO_TRADE ו־failure scenarios — הם בדיוק החלקים שמאפשרים לדעת אם Scanner או Strategy באמת טובים.

‏לכן אנו מצמצמים **Business/Feature scope**, לא **Evidence correctness**.

---

## ‏4. Use When

‏ההמלצה מתאימה כאשר:

- ‏רוצים לבדוק Hypothesis Cross-Sectional קצר־אופק בצורה אמינה.
- ‏עדיין לא ידוע האם predictive edge שורד execution/costs.
- ‏רוצים להגיע מהר ל־Replay/Shadow/Paper שמפיקים Evidence ברמת החלטה.
- ‏רוצים architecture קטנה שניתן להרחיב לפי bottleneck אמיתי.
- ‏רוצים למנוע premature ML, microservices או multi-broker complexity.

---

## ‏5. Do Not Use When

‏אין להשתמש ב־MVP הזה כ־:

- ‏אישור למסחר בכסף אמיתי.
- ‏הוכחה ש־Paper fills מייצגים fills בפועל.
- ‏הוכחה שה־Strategy רווחית מחוץ לחלון Evidence שנבדק.
- ‏תירוץ להחסיר Replay, state recovery או decision evidence.
- ‏תשתית אוטומטית ל־self-tuning/promotion.

---

## ‏6. Alternatives

### ‏חלופה A — `Last-only Research Prototype`

‏מתאים למחקר מוקדם מאוד של predictive price behavior בלבד.

‏יתרון: פשוט וזול.

‏חיסרון: אינו יכול להעריך spread, executability או realistic net edge.

### ‏חלופה B — `Evidence MVP` המומלץ

‏Market + quote context, ranking, Top-K, vetoes, cost/execution simulation, exit, Replay ו־versioned evidence.

‏זהו baseline מומלץ.

### ‏חלופה C — `Production-shaped MVP`

‏כולל מראש broker reconciliation מלא, multi-process deployment, broader operational controls ו־advanced execution infrastructure.

‏עשוי להיות מוצדק רק אם מטרת הניסוי דורשת אותם; אחרת הוא יוצר complexity לפני שיש Edge evidence.

### ‏חלופה D — Notebook/Backtest בלבד

‏טוב ל־exploration מוקדם.

‏חלש ב־timing, state-machine, integration, Replay parity ו־failure evidence.

---

## ‏7. Trade-offs

| בחירה | יתרון | מחיר |
|---|---|---|
| Feature set קטן | Attribution ו־RCA טובים | פחות hypotheses במקביל |
| Long-only | פחות broker/state complexity | אינו בודק short thesis |
| Single position | attribution פשוט | אינו בודק portfolio interaction |
| Broad universe | שומר cross-sectional thesis | עומס data/compute גבוה יותר |
| Full snapshots | explainability/replay | storage נוסף |
| Conservative simulator | פחות false edge | עלול להיות pessimistic |
| Modular monolith | KISS ומהירות פיתוח | isolation מוגבל יותר |
| Local DB | operational simplicity | scale מוגבל לעומת distributed stack |
| One challenger | פחות multiple testing | קצב exploration נמוך יותר |

---

## ‏8. What I Would Avoid Initially

‏לא להכניס כברירת מחדל:

- ‏Multiple brokers/providers ללא צורך ניסויי.
- ‏Short selling.
- ‏Multiple simultaneous positions.
- ‏Advanced broker algos.
- ‏Production ML dependency.
- ‏News/NLP pipeline.
- ‏Complex regime engine.
- ‏Microservices/Kubernetes/distributed consensus.
- ‏Auto-tuning או auto-promotion.
- ‏Options/Futures/Crypto.
- ‏Portfolio optimization.
- ‏עשרות horizons.
- ‏עשרות behavioral vetoes.
- ‏עשרה order tactics במקביל.
- ‏UI גדול לפני evidence schema.

---

## ‏9. What to Add Later

‏השלב הבא נקבע לפי Evidence ולא לפי roadmap קבוע:

- ‏אם Data הוא bottleneck — הרחבת/שיפור data.
- ‏אם Ranking הוא bottleneck — Feature/score challengers.
- ‏אם Execution הוא bottleneck — simulator calibration או tactic challengers.
- ‏אם Exit הוא bottleneck — exit research.
- ‏אם Costs מוחקים edge — אין טעם להוסיף intelligence לפני פתרון economics.
- ‏אם Latency היא bottleneck — optimize את ה־stage שנמדד כבעייתי.
- ‏אם Complexity היא bottleneck — retire/delete לפני שמוסיפים.

‏אפשרויות מאוחרות יותר כוללות multi-position, Short, richer depth/order-flow, ML, multi-provider failover ו־physical service separation — רק אם Decision Impact מצדיק אותן.

---

## ‏10. Required Data / Evidence

‏כדי להעריך MVP נדרש לשמור לפחות:

### ‏Market / Universe

```text
UniverseVersion
Point-in-Time membership
Market events / normalized state
Bid/Ask/Last/basic sizes
Source/receive timestamps
DataQualityState
Generation
Freshness
```

### ‏Decision

```text
DecisionEpoch
Top-K
FeatureSnapshot + versions
Score components
Rank / RankGap / churn context
Eligibility
Vetoes + ReasonCodes
Decision state
DecisionTTL
```

### ‏Execution / Episode

```text
OrderIntent
Arrival benchmark
Simulator/Paper version
Fill assumptions / fill events
Entry/Exit timestamps
Partial/no-fill state
PositionEpisodeId
TimeToFlat
```

### ‏Economics

```text
Spread assumptions/observations
Slippage
Fees
Cost model version
PredictedGrossEdge
RemainingNetEdge
Realized/simulated net outcome
```

### ‏Outcomes

```text
Forward returns
MFE
MAE
TimeToFirstProfit
TimeToTarget
Giveback
```

### ‏Identity / Reproducibility

```text
RunId
ExperimentId
StrategyVersion
ConfigFingerprint
BuildIdentity
Environment
Replay seed/model version where relevant
```

---

## ‏11. Promotion Criteria

‏ה־MVP יכול להתקדם לשלב תכנון רחב יותר רק כאשר מתקיימים יחד:

1. ‏Whole-universe scan או universe target שנבחר במפורש עובד באופן עקבי.
2. ‏Freshness ו־coverage נמדדים ולא מוסקים בעקיפין.
3. ‏Features Point-in-Time ו־versioned.
4. ‏Top-K נשמר בכל Decision Epoch רלוונטי.
5. ‏`TRADE / NO_TRADE / UNKNOWN` מתפקדים בצורה מובחנת.
6. ‏Hard vetoes בסיסיים עובדים עם ReasonCodes.
7. ‏Decision Snapshots שלמים מספיק ל־RCA.
8. ‏Simulation/Paper path מייצר state עקבי וניתן להסבר.
9. ‏Entry/Exit נמדדים עם costs ולא רק price direction.
10. ‏Outcome labels נוצרים ללא leakage.
11. ‏Deterministic Replay מחזיר parity גבוהה לפי SLO מוגדר.
12. ‏Restart/failure scenarios מרכזיים עוברים.
13. ‏כל run/decision מזוהים ב־version/config/build/environment.
14. ‏Daily Review מסוגל להפיק Evidence, לא רק logs.
15. ‏אפשר לקבוע אם Hypothesis הראשונית מתחזקת, נחלשת או נדחית.

‏גם אז המשמעות היא `Eligible for next design stage`, לא אישור למסחר אמיתי.

---

## ‏12. Rejection Criteria

‏אין לקדם את ה־MVP אם אחד מהבאים מתקיים:

- ‏לא ניתן לשחזר decisions.
- ‏Universe היסטורי אינו Point-in-Time.
- ‏Rank נשמר רק ל־winner בלי alternatives.
- ‏Critical stale/unknown state עדיין יכול להוביל Entry.
- ‏Fill model מניח `Touch == Fill` ללא הצדקה.
- ‏Costs חסרים או unknown costs הופכים ל־0.
- ‏Labels זולגים ל־features.
- ‏Config או Feature formulas משתנים ללא version.
- ‏Restart יוצר state לא ידוע שלא ניתן reconcile.
- ‏Decision snapshot חסר את הסיבות לבחירה/דחייה.
- ‏Paper success משמש כתחליף ל־execution evidence.
- ‏Scope גדל מהר יותר מהיכולת לבצע attribution.
- ‏התוצאה נראית טובה רק תחת תרחיש execution אופטימי.
- ‏אין מספיק Evidence כדי להבחין בין Healthy NO_TRADE ל־Broken NO_TRADE.

---

## ‏13. Metrics

### ‏Predictive / Ranking

- ‏Forward outcome by rank bucket.
- ‏Rank1 vs Rank2-5 delta.
- ‏RankGap.
- ‏Rank churn/persistence.
- ‏Top-K stability.
- ‏Missed-winner analysis.

### ‏Data / Scanner Health

- ‏FreshCoverage.
- ‏Critical stale rate.
- ‏Top1Age.
- ‏FeatureAge distribution.
- ‏Gap/duplicate/out-of-order counts.
- ‏Queue age.

### ‏Decision

- ‏`TRADE / NO_TRADE / UNKNOWN` rates.
- ‏Eligibility drop reasons.
- ‏Veto rates by ReasonCode.
- ‏Decision latency `p50/p95/p99`.
- ‏DecisionTTL expiry rate.
- ‏Pre-submit revalidation failure rate.

### ‏Execution / Economics

- ‏No-fill / partial-fill rates in simulator/Paper.
- ‏Arrival-to-fill delta.
- ‏Entry/Exit slippage.
- ‏Spread cost.
- ‏Fee cost.
- ‏RemainingNetEdge.
- ‏MFE/MAE.
- ‏Giveback.
- ‏TimeToFlat.
- ‏Outcome under Optimistic/Base/Stress assumptions.

### ‏Evidence Quality

- ‏Replay parity rate.
- ‏Decision explainability completeness.
- ‏Version identity completeness.
- ‏Missing critical telemetry rate.
- ‏Counterfactual coverage.
- ‏Golden Scenario pass rate.

### ‏Engineering

- ‏Restart/recovery success.
- ‏Invariant violation count.
- ‏Queue saturation.
- ‏Tail latency incidents.
- ‏CI duration and failure classification.

---

## ‏14. Failure Modes

### ‏1. `Tiny Scope, No Evidence`
‏המערכת קטנה, אך אין Bid/Ask, costs, Replay או Top-K ולכן אינה מסוגלת להכריע את Hypothesis.

### ‏2. `Feature Creep`
‏עוד Features מתווספים לפני שנבדק baseline פשוט.

### ‏3. `Last-Only Execution Illusion`
‏Price prediction נראית טובה אך spread/executability אינם ידועים.

### ‏4. `Touch = Fill`
‏Simulator מייצר fill fantasy.

### ‏5. `Winner-Only Logging`
‏אין alternative candidates ולכן selection bias ו־Winner's Curse אינם ניתנים לניתוח.

### ‏6. `Healthy vs Broken NO_TRADE Confusion`
‏מערכת שבורה נראית “זהירה”.

### ‏7. `UNKNOWN Collapse`
‏Critical unknown הופך ל־false/null/zero והמערכת ממשיכה.

### ‏8. `Mutable Experiment`
‏Parameters משתנים באמצע experiment והתוצאות מעורבבות.

### ‏9. `Paper Overconfidence`
‏Paper integration success מפורש כ־proof ל־execution realism.

### ‏10. `No Exit Research`
‏Entry נמדד היטב אך Exit מוגדר כ־cleanup שרירותי.

### ‏11. `Daily PnL Optimization`
‏Thresholds משתנים אחרי יום חלש/חזק במקום controlled research.

### ‏12. `Happy-Path MVP`
‏Restart, gaps, duplicates ו־disconnects לא נבדקים.

### ‏13. `Microservices First`
‏Infrastructure complexity מסתירה את שאלת המחקר.

### ‏14. `UI First`
‏זמן מושקע ב־dashboard לפני evidence schema ו־Replay.

### ‏15. `Premature Performance Work`
‏Optimization לפני correctness/parity measurement.

### ‏16. `Counterfactual Blindness`
‏לא נשמרים rejected candidates, no-fill cases ו־NO_TRADE moments.

### ‏17. `Versionless Evidence`
‏לא ניתן לדעת איזו נוסחה/config/build יצרו תוצאה.

### ‏18. `Success = Positive PnL`
‏ה־MVP נחשב הצלחה רק אם hypothesis “ניצחה”, ולכן מחקר שלילי נתפס בטעות ככישלון.

---

## ‏15. User-Specific Application

‏למערכת המחקרית הזו, שבה המטרה היא להשוות שוק רחב בטווחי זמן קצרים ולדעת מה באמת יצר את הבחירה, ה־MVP צריך לשמור דווקא על שלושה דברים שאסור לקצץ:

1. ‏**Cross-sectional breadth** — כדי שה־Rank יהיה באמת בחירה יחסית ולא רשימת symbols שנבחרה מראש.
2. ‏**Decision-level evidence** — Top-K, ages, ReasonCodes, costs ו־outcome labels.
3. ‏**Replayability** — כדי להבדיל בין שינוי שוק, bug, timing artifact ושינוי Strategy.

‏לעומת זאת, scope שאפשר לדחות בבטחה למחקר מאוחר יותר כולל Short, multi-position, richer models, advanced order tactics, ML ו־multi-provider architecture.

‏ל־KISS עדיף כאן `modular monolith` עם contracts ברורים ו־local durable persistence מאשר platform מבוזרת לפני שיש Evidence שמצדיק אותה.

---

## ‏16. Confidence

### ‏High

‏ב־principles הבאים:

- ‏Evidence MVP עדיף על Feature-count MVP.
- ‏Replay/versioning/timestamps הם חלק מה־MVP ולא “תוספת Production”.
- ‏Top-K ו־rejected decisions חיוניים ללמידה Cross-Sectional.
- ‏`UNKNOWN` חייב להישאר state מפורש.
- ‏Execution/cost realism נדרש לפני מסקנה על net edge.
- ‏Scope קטן משפר attribution ומפחית overfitting/complexity.

### ‏Medium

‏ב־defaults כגון:

- ‏Long-only ראשון.
- ‏Single position.
- ‏10s/30s/60s horizons.
- ‏Local DB + modular monolith.
- ‏היקף Top-K המדויק.

‏אלה Judgments טובים ל־baseline, אבל Evidence יכול להצדיק שינוי.

### ‏Low / Requires Experiment

‏בכל parameter מדויק של:

- ‏Score weights.
- ‏DecisionTTL.
- ‏Spread threshold.
- ‏Entry tactic.
- ‏Exit thresholds.
- ‏Feature weights/windows.
- ‏Target/hold duration.

---

## ‏17. Time-Sensitive Facts

‏ההמלצה הארכיטקטונית עצמה אינה תלויה ב־Broker או Provider מסוים.

‏לפני חיבור Paper/External Adapter יש לאמת מחדש כל Fact תלוי זמן הנוגע ל־:

- ‏Market data coverage/semantics.
- ‏Paper behavior.
- ‏API limits.
- ‏Order semantics.
- ‏Fees.
- ‏Account eligibility/permissions.

‏הפרטים האלה צריכים להיות versioned כחלק מה־experiment environment ולא hard-coded כעובדות קבועות.

---

## ‏18. Fact / Judgment / Hypothesis

### ‏Fact

- ‏ללא Bid/Ask אי־אפשר למדוד quoted spread ישירות.
- ‏ללא timestamps מפורשים אי־אפשר לבצע latency attribution אמין.
- ‏אם לא נשמרים Inputs/versions מספיקים, decision replay מדויק אינו אפשרי.
- ‏`Touch` לבדו אינו מוכיח fill.

### ‏Judgment

- ‏לבנות `Evidence MVP` לפני Production-shaped system.
- ‏להתחיל עם Feature set קטן, Score מוסבר ו־Top-K מלא.
- ‏להתחיל ב־Long-only/Single-position לצורך attribution פשוט יותר.
- ‏להעדיף modular monolith ו־local durable persistence בתחילת הדרך.
- ‏להכניס Replay, failure tests ו־Daily Review כבר ב־MVP.

### ‏Hypothesis

- ‏Cross-sectional short-horizon momentum עשוי לייצר rank ordering בעל predictive value.
- ‏ה־predictive value עשוי לשרוד costs/execution assumptions שמרניים.
- ‏מספר קטן של Features ישירים עשוי להספיק ל־baseline שימושי לפני models מורכבים.

---

## ‏19. Recommended MVP Baseline

```text
Mode:
Replay + Shadow + Paper

Direction:
Long-only research baseline

Exposure:
Single position at a time

Universe:
Broad point-in-time US equities universe

Data:
Last + Bid/Ask + basic sizes + timestamps + quality/generation

Horizons:
10s / 30s / 60s initial baseline

Features:
Small, explainable, versioned set

Decision:
Eligibility + simple Score/Rank + basic hard vetoes
+ TRADE / NO_TRADE / UNKNOWN

Evidence:
Full Decision Snapshot + Top-K + ReasonCodes + outcome labels

Execution:
Versioned conservative simulator → one Paper adapter

Exit:
One simple versioned policy

Economics:
Arrival benchmark + spread + slippage + fees + uncertainty

Persistence:
Local durable DB + append-only journal + snapshots

Research:
SQL-friendly schema + deterministic decision replay

Operations:
WARMING_UP / READY / DEGRADED / SAFE_MODE / STOPPED
+ restart/failure tests

Learning:
Daily Review → Research Queue
No auto-tuning
```

---

## ‏20. Bottom Line

‏ה־MVP המומלץ אינו “רובוט קטן שעושה הרבה דברים מהר”.

‏הוא **מעבדת החלטות קטנה שמגינה על שרשרת Evidence מלאה**:

```text
Observe correctly
→ Compare fairly
→ Decide explicitly
→ Simulate realistically
→ Measure net economics
→ Replay exactly
→ Learn cautiously
```

‏הרחבה מעבר לזה צריכה להגיע רק כאשר ה־MVP מצביע על bottleneck אמיתי או Hypothesis חדשה שמצדיקה את ה־Complexity Tax.