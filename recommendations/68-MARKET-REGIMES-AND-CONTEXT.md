# ‏68 — Recommendation Sheet: Market Regimes and Context

> ‏מקור לימודי עיקרי: `../68-MARKET-REGIMES-AND-CONTEXT.md`.
>
> ‏מטרת הקובץ: להרחיב את מסגרת `Market Regime Analysis` ממקטע 25 למודל Context מלא עבור מערכת `Short-Horizon Momentum`: לא Label יחיד כמו “High Vol” או “Trend Day”, אלא Snapshot סיבתי, point-in-time, versioned ומוסבר של Market, Sector, Symbol ו־Execution context. ה־Context מוצדק רק כאשר הוא משנה באופן אינקרמנטלי Prediction, Feasibility, Costs, Uncertainty או Decision Quality.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו מניח ש־Regime מסוים מייצר Edge.

---

## ‏1. Decision

‏השאלה אינה:

```text
Which market regime should we trade?
```

‏אלא:

```text
What context was observable at decision time,
what role does each context variable play,
and does conditioning on it improve the decision
beyond the existing baseline after costs, latency and uncertainty?
```

‏שרשרת ההכרעה המומלצת:

```text
Point-in-Time Market State
→ Context Vector
→ Freshness / Coverage / Confidence
→ Existing Signal / Rank
→ Context Interaction Evaluation
→ Prediction / Feasibility / Cost Attribution
→ Shadow Context-Aware Decision
→ Promote / Reject
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Context הוא Vector, לא Label יחיד

‏ברירת המחדל:

```text
MarketContext
SectorContext
SymbolContext
ExecutionContext
```

‏עם dimensions כגון:

```text
VolatilityState
LiquidityState
BreadthState
CorrelationState
DispersionState
SessionState
StressState
TrendState
TransitionState
```

‏Label יחיד מותר כ־derived view בלבד; Raw/continuous context נשאר מקור האמת.

### ‏`P0 — Required`: כל Context שמשפיע על Decision חייב להיות Point-in-Time

‏לכל ערך נדרוש:

```text
AsKnownAt <= DecisionTime
```

‏אין להשתמש ב־full-day volatility, ‏future breadth, ‏final daily high/low, ‏full-session VWAP, ‏post-event classification או normalization שמכילה עתיד.

### ‏`P0 — Required`: ‏`UNKNOWN`, ‏`STALE` ו־`DEGRADED` הם States חוקיים

‏אין forced classification כאשר context אינו אמין.

‏מינימום:

```text
KNOWN
UNKNOWN
STALE
DEGRADED
```

‏ל־Data Quality קריטי נשאר Safety Gate נפרד; לא ממירים failure ל־Regime רגיל.

### ‏`P1 — Preferred Default`: Continuous First, Buckets Later

‏נשמור תחילה:

```text
raw_value
normalized_value
percentile
as_of_time
age
coverage
status
```

‏ורק אחר כך derived buckets או labels.

### ‏`P1 — Preferred Default`: Strategy אחת Context-Aware לפני Strategies נפרדות

‏ברירת המחדל:

```text
one baseline strategy
+ context observation
+ small number of validated interactions
```

‏ולא:

```text
one strategy per regime
```

---

## ‏3. Why

‏אותו Signal יכול לקבל משמעות כלכלית שונה כאשר:

- ‏ה־market כולו נע יחד מול move idiosyncratic.
- ‏spread/depth/fill probability משתנים.
- ‏volatility עולה בלי directional persistence.
- ‏cross-sectional dispersion יורדת ו־Rank #1 כמעט אינו נבדל מ־#2–#5.
- ‏המערכת נמצאת במעבר `QUIET → BURST` או `NORMAL → STRESS`.
- ‏signal half-life מתקצר בזמן שה־latency נשארת קבועה.

‏Context חשוב משום שהוא יכול לשנות לא רק Prediction אלא גם Executability, Costs ו־Uncertainty.

---

## ‏4. Use When

‏נשתמש ב־Context Research כדי לבדוק:

- ‏האם Signal quality משתנה לפי volatility/liquidity/breadth.
- ‏האם Candidate היא market-driven, sector-driven או idiosyncratic.
- ‏האם `Rank #1` משמעותי יותר כאשר dispersion/rank gap גבוהים.
- ‏האם Costs, fills, markout או exit feasibility משתנים לפי state.
- ‏האם transitions מסוכנים יותר מ־steady states.
- ‏האם Context עוזר בעיקר לבחור טוב יותר או דווקא להחליט `NO TRADE` במחקר/Shadow.
- ‏האם same prediction דורש margin כלכלי שונה בגלל uncertainty או execution conditions.

---

## ‏5. Do Not Use When

‏אין להשתמש ב־Regime/Context כדי:

- ‏להסביר Trade יחיד בדיעבד.
- ‏לכרות עשרות buckets אחרי שראינו תוצאה.
- ‏להפוך Time-of-Day לבדו ל־Regime.
- ‏להשתמש ב־future-aware labels.
- ‏להכניס אותו Context גם ל־Score, גם ל־Veto, גם ל־Size וגם ל־Exit ללא attribution.
- ‏להחליף Data Quality, Risk או Execution gates.
- ‏להפעיל Hard Veto רק כי label נשמע מסוכן.
- ‏לבנות HMM/Clustering/ML לפני Baseline explainable.

---

## ‏6. Baseline Context Vector

‏Baseline מומלץ למחקר:

```text
Market:
- short-horizon market returns
- breadth level + change
- realized volatility
- median spread / liquidity proxy
- cross-sectional dispersion
- cross-sectional synchronization / correlation proxy
- session phase

Sector:
- sector/peer return
- sector breadth
- relative strength vs market

Symbol:
- relative return vs market/sector
- relative activity
- symbol volatility
- spread/depth state
- signal persistence

Execution:
- current spread
- available depth / fill-feasibility proxy
- quote stability / churn
- latency pressure
- recent execution-quality / markout context
```

‏לא כל dimension חייב להיכנס לגרסה הראשונה; כל אחד הוא Feature Candidate.

---

## ‏7. Volatility Context

‏`VolatilityState` אינו Direction.

‏נפריד לפחות:

```text
VolatilityMagnitude
DirectionalPersistence
```

‏High volatility יכולה להיות trend, reversal, whipsaw או range רחב.

‏לכן לא נשתמש ב־volatility label כתיאור מלא של state.

---

## ‏8. Liquidity Context

‏Liquidity אינה Volume בלבד.

‏נבחן:

```text
spread
depth
trade_rate
quote_update_rate
top_of_book_stability
fill_feasibility
impact_proxy
```

‏Fast price move בתוך thin liquidity עלול להיראות חזק בזמן שה־Net Economics חלשים.

---

## ‏9. Breadth / Market Factor Context

‏נשמור Context שמבדיל:

```text
StockReturn
MarketReturn
SectorReturn
ResidualReturnCandidate
```

‏`ResidualReturnCandidate` הוא Hypothesis מחקרית, לא Fact.

‏Breadth עוזר לענות האם move רחב, sector-led או ייחודי.

---

## ‏10. Correlation / Synchronization / Dispersion

‏נפריד:

```text
Correlation / Synchronization
CrossSectionalDispersion
```

‏High synchronization יכולה לגרום להרבה Candidates להיראות חזקים מאותה סיבה.

‏Low dispersion יכולה ליצור `Score Compression` שבו Winner קיים טכנית אך separation נמוך.

---

## ‏11. Session Context

‏`TimeOfDay` הוא Context temporal, לא Regime בפני עצמו.

‏נשמור:

```text
seconds_since_open
seconds_to_close
session_phase
```

‏ונבדוק יחד עם activity, volatility ו־liquidity.

‏Opening/Closing transitions יקבלו analysis נפרד משום שמבנה ה־market state יכול להשתנות במהירות.

---

## ‏12. Intraday Seasonality

‏Activity, volume, volatility ו־spread אינם stationary לאורך session.

‏לכן relative context יכול להיות עדיף על raw level:

```text
CurrentActivity / ExpectedActivityAtComparableTime
```

‏כל baseline כזה חייב להיות Point-in-Time, versioned ועם warm-up ברור.

---

## ‏13. Fast Context מול Slow Context

‏נפריד TTLs וחלונות:

```text
Fast Context:
spread shock
quote churn
current breadth shock
liquidity withdrawal

Slow Context:
session volatility state
persistent breadth
sector trend
market synchronization regime
```

‏אין `ContextTTL` יחיד לכל המערכת.

---

## ‏14. Transition State הוא First-Class

‏מעברים כגון:

```text
QUIET → BURST
NORMAL → STRESS
STRESS → RECOVERY
```

‏יישמרו כ־Context בפני עצמו.

‏נמדוד:

```text
TransitionDetectedAt
DetectionDelay
TransitionConfidence
DwellTime
FalseTransitionRate
```

‏ה־Transition אינו אוטומטית Block; הוא מעלה uncertainty עד שיש Evidence לפעולה אחרת.

---

## ‏15. Hysteresis / Dwell

‏אם Derived Regime משמש Policy בעתיד, נבחן:

```text
entry_threshold != exit_threshold
minimum_dwell
transition_band
```

‏המטרה היא למנוע flip-flop סביב boundary מלאכותי.

‏Hysteresis עצמו הוא Challenger שדורש validation.

---

## ‏16. Context Hierarchy

‏ברירת המחדל:

```text
Market
→ Sector / Peer Group
→ Symbol
→ Execution
```

‏אין חוק אוניברסלי מי “מנצח” כאשר השכבות סותרות זו את זו.

‏Context collision הוא Research Question, לא Rule מוכן.

---

## ‏17. Shared Context Snapshot

‏כל Candidates באותו Decision Cycle צריכים להשתמש ב־Market Context קוהרנטי ככל האפשר.

‏נוסיף:

```text
ContextSnapshotId
ContextAsOf
ContextGeneration
```

‏כדי להימנע מ־cross-sectional timing bias שבו Symbol אחד מדורג מול market snapshot חדש ואחר מול ישן.

---

## ‏18. Freshness / Coverage / Confidence

‏לכל Context family נשמור לפחות:

```text
ComputedAt
SourceAge
WindowEnd
Coverage
DataQuality
Status
OptionalConfidence
```

‏Breadth ללא Coverage אינו מספיק.

‏אם broad metrics מבוססים על subset קטן או stale של ה־Universe, ה־Context חייב להיחשב degraded/unknown בהתאם לחוזה.

---

## ‏19. MarketGeneration / DataGeneration

‏אחרי discontinuity מהותי, halt/resume, reconnect או resync, נשקול generation boundary:

```text
MarketGeneration
DataGeneration
```

‏המטרה היא למנוע ערבוב state ישן וחדש ללא warm-up/reconciliation.

---

## ‏20. Novel / Out-of-Distribution Context

‏Context שאינו דומה ל־historical support יקבל State נפרד או uncertainty מוגברת.

‏לא:

```text
Novel == Bad
```

‏אלא:

```text
Novel == Less Supported by Evidence
```

‏ב־Research/Shadow נמדוד אם baseline predictions נשארים calibrated במצבים כאלה.

---

## ‏21. Separate Roles — חוק נגד Double Counting

‏לכל Context variable נגדיר Role אחד או יותר במפורש:

```text
Predictive
Feasibility
Risk
Execution
Monitoring
```

‏דוגמה:

- ‏Breadth עשויה להיות Predictive Context.
- ‏Spread הוא קודם כול Feasibility/Economic Context.
- ‏Critical data gap הוא Safety State.
- ‏Session phase יכול להיות Monitoring/Normalization Context.

‏אם אותו Context משפיע בכמה שכבות, נדרוש attribution שמראה שאין double/triple counting לא מוצדק.

---

## ‏22. Predictive Context

‏Predictive Context חייב להראות שינוי יציב ב־conditional outcome:

```text
E[Outcome | Signal, Context]
```

‏מעבר ל־:

```text
E[Outcome | Signal]
```

‏עם OOS, effective sample diagnostics ו־economic effect size.

---

## ‏23. Feasibility / Cost Context

‏Context יכול להיות חשוב גם אם Prediction אינו משתנה.

‏נמדוד לפי state:

```text
spread distribution
fill probability
slippage
adverse selection
exit feasibility
```

‏זהו אחד ההבדלים המרכזיים בין “Signal works” לבין “Decision remains economically useful”.

---

## ‏24. Signal Half-Life × Latency

‏נבחן:

```text
LatencyPressure = EndToEndLatency / SignalHalfLife
```

‏לפי Context.

‏אם Signal half-life מתקצר ב־state מסוים, אותה latency צורכת חלק גדול יותר מה־Edge גם בלי שינוי בקוד.

---

## ‏25. Context × Ranking

‏ל־Scanner cross-sectional נשמור במיוחד:

```text
candidate_count
eligible_count
rank_gap_1_2
rank_gap_1_3
score_dispersion_topN
market_breadth
cross_sectional_dispersion
```

‏המטרה היא להבחין בין Winner מבודד לבין Winner טכני בתוך cluster צפוף.

---

## ‏26. Context × `NO TRADE`

‏Hypothesis חשובה למחקר:

> ‏הערך הגדול של Context עשוי להיות בזיהוי מצבים שבהם אף Candidate אינו מספיק טוב, ולא רק בשיפור הבחירה של #1.

‏כל Gate כזה נמדד ב־Shadow/Replay לפי avoided bad decisions מול missed good decisions.

---

## ‏27. Context × Veto

‏Hard Veto יישמר ל־Evidence חזק או Safety State מפורש.

‏ברירת המחדל ל־Context predictive לא ודאי היא:

```text
observe
→ soft challenger
→ validate
```

‏ולא `Hard Veto` מיידי.

---

## ‏28. Context × Execution

‏אם Context משנה execution economics, נבדוק את שינוי ה־Execution Policy כניסוי נפרד משינוי Signal/Ranking.

‏כך נדע אם השיפור הגיע מ:

```text
better prediction
or
better execution behavior
```

---

## ‏29. Context × Exit

‏Exit Context יכול לכלול:

```text
market reversal
liquidity deterioration
spread shock
giveback acceleration
transition uncertainty
```

‏אבל Entry Context ו־Exit Context אינם חייבים להיות זהים.

---

## ‏30. Fast / Deep Context Architecture

‏Baseline ארכיטקטוני למחקר:

```text
Fast Shared Context
→ broad market metrics
→ freshness / coverage
→ basic symbol context

Top-N Deep Context
→ richer peer/sector comparison
→ book dynamics
→ execution feasibility
→ negative-memory context
```

‏המטרה היא לשמור cost/latency סבירים ולא לחשב Context כבד לכל Symbol בכל event.

---

## ‏31. Context as Challenger

‏ה־Champion נשאר ההחלטה הקיימת.

‏ה־Challenger:

```text
same opportunity set
same baseline features
+ context-aware adjustment
```

‏נשמור:

```text
DecisionWithContext
DecisionWithoutContext
```

‏כדי למדוד `Incremental Context Value`.

---

## ‏32. Promotion Ladder

‏סדר מומלץ:

```text
1. LOG ONLY
2. ANALYSIS / RCA
3. SHADOW RECOMMENDATION
4. ONE SIMPLE CONTEXT-AWARE CHALLENGER
5. EXECUTION OR THRESHOLD CHALLENGER
6. CONTEXT-CONDITIONED MODEL
7. SEPARATE REGIME MODELS — only with strong evidence
```

‏אין לדלג ישירות למערכת שמחליפה Strategy לפי Label.

---

## ‏33. Promotion Criteria

‏Context-aware component מתקדם רק אם:

1. ‏ה־Context causal ו־Point-in-Time.
2. ‏Definition/Version מלאים.
3. ‏Raw values נשמרים לצד labels.
4. ‏Freshness/Coverage מוגדרים.
5. ‏יש Effective Samples בכמה ימים/Episodes/Symbols.
6. ‏השיפור חוזר OOS/Walk-Forward.
7. ‏השיפור אינקרמנטלי ל־Baseline הקיים.
8. ‏Prediction/Execution/Cost attribution ברור.
9. ‏Thresholds אינם fragile peaks.
10. ‏Detection delay מתאים ל־horizon.
11. ‏Decision impact משמעותי.
12. ‏Complexity/latency cost מוצדקים.
13. ‏Shadow מאשר behavior עקבי.
14. ‏UNKNOWN/fallback/replay contracts עובדים.

---

## ‏34. Rejection Criteria

‏נשאיר Analysis-only או נדחה כאשר:

- ‏נדרש future information.
- ‏ה־effect קיים רק In-Sample.
- ‏הוא תלוי bucket זעיר, יום יחיד או event יחיד.
- ‏הוא נעלם אחרי Costs/Latency.
- ‏הוא רק duplicate של Feature קיים.
- ‏Policy אחידה פשוטה נותנת כמעט אותה תוצאה.
- ‏transition churn גבוה מדי.
- ‏detection מאוחר מדי.
- ‏ContextSnapshot אינו reproducible.
- ‏Coverage/freshness אינם אמינים.
- ‏המערכת דורשת יותר מדי rules/parameters כדי לשמור את ה־effect.

---

## ‏35. Metrics

### ‏Context quality

```text
ContextFreshness
ContextCoverage
UnknownRate
StaleRate
TransitionRate
DwellTime
DetectionDelay
FalseTransitionRate
NovelStateRate
```

### ‏Prediction / ranking

```text
OutcomeByContext
Top1PremiumByContext
RankMonotonicityByContext
RankGapCalibration
SignalHalfLifeByContext
```

### ‏Execution / economics

```text
SpreadByContext
FillRateByContext
SlippageByContext
MarkoutByContext
ExitFeasibilityByContext
NetEdgeByContext
LatencyPressureByContext
```

### ‏Decision impact

```text
ContextDecisionImpactRate
ChangedDecisionNetDelta
AvoidedBadDecisionRate
MissedGoodDecisionRate
```

---

## ‏36. Testing Strategy

### ‏Unit / contract

- ‏Future data cannot alter past Context.
- ‏`STALE` cannot become `KNOWN` without valid new data.
- ‏Missing input אינו הופך ל־zero/normal.
- ‏Bucket נגזר מה־raw value ומה־version הנכונים.
- ‏Coverage מחושב על Universe snapshot תואם.
- ‏Context generation אינו מערבב state משני epochs ללא rule מפורש.

### ‏Replay

- ‏אותו event stream מייצר אותו `ContextSnapshotId`/values.
- ‏Decision בזמן `T` נשאר זהה כאשר מוסיפים events אחרי `T`.
- ‏Transitions ו־hysteresis deterministic.
- ‏Shared context זהה לכל Candidates באותו cycle לפי contract.

### ‏Research

- ‏Champion ללא Context נשאר frozen.
- ‏Context challenger משנה רק את המשתנה שנבדק.
- ‏OOS/Walk-Forward preserved.
- ‏Sparse cells מסומנים `INSUFFICIENT_DATA`.
- ‏Ablation מבוצע לפי Context family.

---

## ‏37. Failure Modes

‏Failure modes מרכזיים:

- ‏Regime leakage.
- ‏Bucket explosion.
- ‏Hard labels סביב threshold שרירותי.
- ‏Cross-sectional timing bias.
- ‏Breadth ללא coverage.
- ‏Stale shared context.
- ‏Double counting בין Score/Veto/Risk/Execution.
- ‏Market/sector/symbol context collision בלי attribution.
- ‏Transition flicker.
- ‏Detection delay ארוך מה־signal half-life.
- ‏Unknown state שנכפה ל־Normal.
- ‏Novel state שמקבל confidence מזויף.
- ‏Cost regime ignored while prediction is analyzed.
- ‏Context drift mistaken for strategy failure.
- ‏Strategy retuning במקום RCA.

---

## ‏38. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏עשרות Regime labels.
- ‏Full Cartesian product של buckets.
- ‏HMM / clustering כ־source of truth.
- ‏ML regime switcher.
- ‏Strategy נפרדת לכל state.
- ‏Hard Veto לכל stress label.
- ‏Context-adjusted Score + Veto + Size + Exit בבת אחת.
- ‏Sector/peer complexity לפני Market-level baseline.
- ‏Auto-retuning על כל drift.

---

## ‏39. What to Add Later

‏רק לאחר Evidence:

- ‏Sector/peer relative context עשיר יותר.
- ‏Context normalization per time-of-day.
- ‏Transition/change-point challengers.
- ‏Soft probability regime models.
- ‏OOD/anomaly context detection.
- ‏Context-aware threshold challengers.
- ‏Context-aware execution challengers.
- ‏Context-conditioned predictive models.
- ‏Separate models per regime רק אם single model + context feature אינו מספיק.

---

## ‏40. Required Data / Evidence

‏לכל Claim תלוי־Context נדרש לפחות:

```text
ContextSnapshotId
AsKnownAt
Context definition/version
Raw continuous values
Freshness / coverage / status
Feature/rank/decision snapshot
Forward labels
Execution outcomes
Cost outcomes
Episode/day/symbol counts
OOS / walk-forward evidence
Counterfactual decision without context
```

‏Promotion ל־policy challenger דורש גם Shadow evidence.

---

## ‏41. Alternatives

### ‏Alternative A — Ignore Context

‏פשוט ביותר, אך aggregate metrics עלולים להסתיר conditional behavior.

### ‏Alternative B — Hard Regime Buckets

‏קל להסבר אך מייצר discontinuities, churn ו־sample fragmentation.

### ‏Alternative C — Continuous Context Features

‏**Preferred baseline.** שומר יותר מידע ומאפשר analysis לפני policy.

### ‏Alternative D — Regime Model / Clustering

‏מתאים רק כ־Challenger לאחר שיש baseline explainable ו־validation חזק.

---

## ‏42. User-Specific Application

‏למערכת המחקרית שלנו, שמדרגת Universe רחב ומחפשת תנועה קצרה, ה־Context הראשוני החשוב ביותר למדידה הוא:

```text
market_breadth
cross_sectional_dispersion
candidate_count
rank1_rank2_gap
market_volatility
market_liquidity / median_spread
session_phase
context_fresh_coverage
```

‏ברמת Symbol/Execution נוסיף:

```text
relative_return_vs_market
relative_activity
spread/depth state
signal persistence
latency pressure
```

‏המלצת ברירת המחדל: **ללוג ולנתח תחילה; לא לתת ל־Context לשנות החלטה לפני שהוא מוכיח Incremental Decision Value ב־Replay/Shadow.**

---

## ‏43. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Context שמשפיע בזמן `T` חייב להשתמש רק במידע שהיה זמין עד `T` כדי להיות Point-in-Time Correct.
- ‏Bucketization מרובת dimensions מפחיתה Sample Size בכל cell.
- ‏Spread, liquidity, latency ו־fill behavior יכולים להשתנות לאורך session ובמצבי market שונים.
- ‏Raw context values, labels ו־versions הם ישויות שונות ויש לשמור semantics ברורים.

### ‏Judgment

- ‏Continuous Context Vector הוא Baseline טוב יותר מ־Regime label יחיד.
- ‏Analysis/Shadow-first עדיף על policy switching מוקדם.
- ‏Market → Sector → Symbol → Execution היא hierarchy שימושית ל־RCA ול־feature organization.
- ‏Role separation הוא guard חשוב נגד double counting.

### ‏Hypothesis

- ‏Breadth/dispersion/rank separation ישפרו אצלנו את זיהוי ה־Top Candidate האמיתי.
- ‏Transitions ידרשו uncertainty buffer גדול יותר מ־steady states.
- ‏Context עשוי להוסיף יותר ערך דרך Costs/NO-TRADE מאשר דרך Prediction.
- ‏Residual/peer-relative momentum עשוי להוסיף information מעבר ל־raw momentum.

---

## ‏44. Confidence

### ‏High

- ‏Point-in-Time Context הוא תנאי correctness.
- ‏UNKNOWN/STALE צריכים להיות explicit.
- ‏Context quality דורש freshness ו־coverage.
- ‏Continuous raw values צריכים להישמר לצד labels.
- ‏Prediction ו־Execution attribution צריכים להישאר נפרדים.

### ‏Medium

- ‏Breadth, volatility, liquidity, dispersion, session phase ו־rank competition הם Context families ראשוניים שימושיים למחקר.
- ‏Shared context snapshots ו־ContextSnapshotId מתאימים במיוחד ל־cross-sectional scanner.
- ‏Transition states ראויים למדידה מפורשת.

### ‏Low / Unproven

- ‏איזה Context יוסיף בפועל Net Edge.
- ‏אילו thresholds/buckets עדיפים.
- ‏האם residual momentum עדיף על raw momentum.
- ‏האם Regime-aware thresholds/execution יועילו.
- ‏האם ML regime classifier מוצדק בכלל.

---

## ‏45. Time-Sensitive Facts

‏רוב ההמלצות כאן מתודולוגיות ואינן תלויות Provider/Broker ספציפי.

‏אם Context נשען על:

```text
sector classifications
market breadth feed
halt/LULD status
depth data
news/event feed
provider-specific latency/coverage fields
```

‏יש לאמת מחדש source semantics, timestamps, coverage, entitlements ו־update behavior לפני שימוש תפעולי.

---

## ‏46. Relationship to Earlier Sheets

‏מקטע 25 נשאר בסיס ה־`Regime Analysis` ואינו מבוטל.

‏מקטע 68 מרחיב אותו בעיקר ב:

```text
Context Vector
Market/Sector/Symbol/Execution hierarchy
Fast vs Slow Context
Transition State
Shared Context Snapshot
Freshness + Coverage
Generation boundaries
Novel/OOD state
Role separation / double-counting guard
Context × Costs / Latency / Fill / Exit
```

‏מקטע 67 מוסיף את הכלל: Regime ML הוא Challenger בלבד; ML אינו prerequisite ל־Context Engine.

---

## ‏47. Relationship to Segment 69

‏מקטע 69 — `News, Events and Corporate Actions` — צריך להישען על Context Engine זה כדי להבדיל בין:

```text
normal market context
observed abnormal event state
known scheduled event context
mechanical corporate-action adjustment
```

‏אין להניח שכל abnormal move הוא “News” בלי source/evidence מתאים.

---

## ‏48. Recommendation Summary

```text
Baseline
→ represent context as a point-in-time vector
→ store continuous values before labels
→ separate market / sector / symbol / execution context
→ use one shared market snapshot per decision cycle
→ track freshness + coverage + UNKNOWN explicitly
→ measure fast and slow context with separate TTLs
→ treat transitions as first-class states
→ prevent context double counting across decision layers
→ analyze prediction, costs, fills and latency separately
→ compare Champion vs context-aware Challenger
→ promote one simple interaction at a time
→ reject fragile bucket mining and regime switching
```

> ‏**המלצה סופית:** Context טוב אינו “שם למצב השוק”. הוא Snapshot סיבתי, טרי ומדיד שהיה זמין בזמן ההחלטה, ושמוכיח שהוא משנה Decision Quality או Economics מעבר ל־Baseline. עד שהוכח אחרת, הוא שכבת Observability/Research — לא רישיון להוסיף Rules.**
