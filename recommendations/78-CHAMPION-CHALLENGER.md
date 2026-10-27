# ‏78 — Recommendation Sheet: Champion / Challenger

> ‏מקור לימודי עיקרי: `../78-CHAMPION-CHALLENGER.md`.
>
> ‏מטרת הקובץ: להגדיר מסגרת מחקרית שבה `Champion` יציב מושווה ל־`Challenger` מוגדר היטב על אותם מצבי שוק ככל האפשר, כך ש־Promotion יישען על `Incremental Decision Value`, ‏Disagreement analysis, ‏Execution realism, ‏costs, ‏latency, ‏tails, ‏regime coverage ו־operational guardrails — ולא על PnL יחיד או חלון מוצלח.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו אישור Production למסחר אמיתי.

---

## ‏1. Decision

‏ה־Champion/Challenger process לא ישאל רק:

```text
Which version made more PnL?
```

‏אלא:

```text
On the same comparable decision contexts,
where did Challenger behavior diverge from Champion,
why did it diverge,
was the incremental decision value positive after execution/cost/latency,
and did it preserve all critical guardrails across relevant regimes?
```

‏ברירת המחדל:

```text
Stable Champion
+ One Primary Change
→ Comparable Inputs
→ Decision Twins
→ Disagreement Set
→ First Divergence Attribution
→ Realistic Counterfactual / Observed Outcome
→ Incremental Net Value
→ Guardrails / Tails / Regimes / Complexity
→ Replay / Shadow Evidence
→ Promotion Packet
→ PROMOTE / REJECT / KEEP_RESEARCHING
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Champion ו־Challenger הם `StrategyVersion` מלאים

‏Recommendation 77 נשאר מקור האמת לזהות גרסה.

‏לכל experiment נדרש לפחות:

```text
ChampionStrategyVersion
ChallengerStrategyVersion
ChampionConfigFingerprint
ChallengerConfigFingerprint
ExperimentId
RunIds
EvidenceWindow
```

‏אם identity אינה חד־משמעית, אין comparison אמין.

### ‏`P0 — Required`: ‏`One Primary Change`

‏Challenger צריך thesis צר ככל האפשר:

```text
What changed?
Why should it help?
Which decisions should change?
What should improve?
What must not degrade?
```

‏אם Feature, threshold, veto, execution ו־exit משתנים יחד, attribution חלש מדי כברירת מחדל.

### ‏`P0 — Required`: Comparable Inputs / Context Parity

‏כאשר המשתנה הנבדק אינו data/provider/execution simulator, שתי הגרסאות צריכות לקבל אותו context ככל האפשר:

```text
AsKnownAt market state
Universe
Clock domain
Data generation
Failure semantics
Cost model
Execution simulator
Reference data
Session/calendar state
```

‏הבדל בלתי מתוכנן ב־input מבטל או מפצל את evidence.

### ‏`P0 — Required`: ‏`Decision Twin`

‏ב־Replay/Shadow נייצר זוג החלטות על אותו Decision Epoch:

```text
DecisionEpoch
├─ ChampionDecision
└─ ChallengerDecision
```

‏עם snapshots מלאים מספיק כדי לשחזר את שתיהן.

### ‏`P0 — Required`: ‏`Disagreement Set` הוא dataset ראשי

‏נשמור וננתח בנפרד:

```text
Different Candidate
TRADE vs NO_TRADE
Different Veto
Different Entry Timing
Different Execution Tactic
Different Exit Timing
Different Size / Scope when applicable
```

‏Agreement מועיל למדידת parity, אבל רוב ה־incremental information נמצא ב־disagreements.

### ‏`P0 — Required`: ‏`First Divergence`

‏לכל disagreement משמעותי נזהה את הגבול הראשון שבו behavior התפצל:

```text
Data / Feature
→ Eligibility
→ Score
→ Rank
→ Veto
→ Decision
→ Execution
→ Exit
```

‏לא מייחסים Outcome ל־“Challenger” באופן כללי כאשר אפשר לזהות את ה־mechanism הראשון.

### ‏`P0 — Required`: Counterfactual quality label

‏לכל outcome נשמור provenance:

```text
OBSERVED
SIMULATED
ESTIMATED
UNKNOWN
```

‏Counterfactual אינו Truth. ‏`UNKNOWN` קריטי אינו PASS.

### ‏`P0 — Required`: Promotion criteria מוקפאים מראש

‏לפני פתיחת evidence window נגדיר:

```text
PrimaryMetric
MinimumMeaningfulImprovement
Guardrails
NonInferiorityBounds
P0Blockers
RejectionCriteria
StoppingRule
RequiredRegimeCoverage
RequiredEffectiveDisagreementSample
```

‏לא משנים criteria אחרי שרואים תוצאות.

### ‏`P0 — Required`: ‏P0 blocker אינו מתקזז ב־aggregate score

‏Correctness/safety regression קריטי פוסל Challenger גם אם primary economic metric השתפר.

```text
No Aggregate Override
```

### ‏`P0 — Required`: ‏Relative + Absolute gates

‏Challenger אינו promoted רק כי Champion הידרדר.

‏נדרש:

```text
Relative improvement vs Champion
AND
Absolute quality floor
```

### ‏`P1 — Preferred Default`: Economic comparison הוא net executable value

‏לא raw return ולא signal-price PnL.

‏נכלול לפי הרלוונטיות:

```text
Gross Opportunity
- Spread
- Slippage
- Fees
- Impact
- Borrow / financing where modeled
- Latency decay
= Net Executable Outcome
```

‏ונמדוד גם:

```text
EdgeRetention
CaptureRatio
CostRatio
LatencyTax
```

### ‏`P1 — Preferred Default`: ‏Decision-quality metrics לפי סוג השינוי

‏Ranking challenger:

```text
Top1 outcome
TopK ordering
RankGap
RankStability
Candidate switches
```

‏Veto challenger:

```text
Bad decisions avoided
Good decisions blocked
FalseVetoRate
FalseAllowRate
DecisionImpactRate
```

‏Execution challenger:

```text
ArrivalToFill economics
Fill probability model
Slippage
Latency
Partial-fill behavior
```

‏Exit challenger:

```text
TimeToFlat
Giveback
Exit slippage
Residual risk
```

### ‏`P1 — Preferred Default`: ‏Disagreement metrics

```text
DecisionParity
DisagreementRate
UsefulDisagreementRate
HarmfulDisagreementRate
NeutralDisagreementRate
DisagreementDensity
```

‏`NeutralDisagreement` מתמשך הוא סימן אפשרי ל־complexity ללא value.

### ‏`P1 — Preferred Default`: ‏Effective sample size לפי Episodes

‏לא נספור אלפי ticks מאותו market episode כאילו היו observations עצמאיים.

‏Promotion evidence יתבסס על:

```text
DisagreementCount
EffectiveDisagreementSampleSize
EpisodeCount
RegimeCoverage
SparseCoverageCells
```

### ‏`P1 — Preferred Default`: ‏Distribution / Tail analysis

‏מעבר ל־mean נמדוד לפחות:

```text
p50 / p90 / p95 / p99 where relevant
WorstDecileDelta
BestDecileDelta
TailLoss / TailOutcome
```

‏Average gain קטן אינו מצדיק tail regression מהותי.

### ‏`P1 — Preferred Default`: ‏Regime Coverage Matrix

‏נחלק evidence לפי dimensions שימושיים כגון:

```text
Volatility
Liquidity
Session state
Event state
Provider / data-health state
Load / burst state
```

‏Bucket דל evidence נשאר confidence נמוך.

### ‏`P1 — Preferred Default`: ‏Stress Advantage

‏נבדוק advantage תחת assumptions מחמירים יותר:

```text
Fill sensitivity
Cost sensitivity
Latency sensitivity
Data degradation
Burst / backlog
```

‏Challenger שמנצח רק בתרחיש אופטימי אינו robust challenger.

### ‏`P1 — Preferred Default`: ‏Complexity Guardrail

‏נמדוד:

```text
Extra compute
Extra latency
Extra allocations
Extra dependencies
Extra monitoring
Extra failure modes
Extra operational burden
```

‏ונשאל:

```text
Incremental Decision Value / Complexity Tax
```

### ‏`P1 — Preferred Default`: ‏Shadow isolation

‏Challenger ב־Shadow חייב להיות side-effect free ביחס ל־Champion:

```text
No production-state mutation
No competing broker side effects
No shared mutable decision state
Bounded resource budget
```

‏ה־experiment עצמו לא אמור להאט את path הראשי.

### ‏`P1 — Preferred Default`: ‏Challenger Resource Budget

‏לכל Challenger נגדיר budget ל־CPU, memory, queueing ו־telemetry.

‏חישוב כבד יעבור ל־async/deep path או sample מתוכנן כאשר אפשר.

### ‏`P1 — Preferred Default`: ‏Experiment Registry מלא

‏נרשום גם Challengers שנכשלו:

```text
ExperimentId
Hypothesis
Versions
Scope
Evidence window
Results
Decision
Reason
```

‏כך נמנע `Challenger Zoo`, ‏Winner's Curse וחזרה לרעיונות שכבר נכשלו.

### ‏`P2 — Useful Improvement`: ‏Win/Loss taxonomy

‏במקום “Challenger won/lost” בלבד, נשמור mechanism categories.

‏דוגמאות Win:

```text
AVOIDED_STALE_WINNER
SELECTED_FRESHER_CANDIDATE
REDUCED_ADVERSE_SELECTION
REDUCED_GIVEBACK
IMPROVED_NO_TRADE
```

‏דוגמאות Loss:

```text
OVER_FILTERED
LATE_DECISION
LATENCY_REGRESSION
FALSE_VETO
NOISE_OVERREACTION
```

### ‏`P2 — Useful Improvement`: ‏Coverage-aware sampling

‏אם אי־אפשר להריץ Challenger בכל Decision Epoch, נשתמש ב־sampling מתוכנן ומסומן, רצוי stratified לפי regime/liquidity/event state.

### ‏`P2 — Useful Improvement`: ‏Post-Promotion Watch

‏אם Challenger עובר review והופך baseline חדש, ממשיכים לנטר במיוחד את metrics וה־guardrails שהכריעו את ההחלטה.

‏Promotion אינו סוף experiment history.

### ‏`P3 — Advanced Challenger`: ‏Multiple Challengers עם budget קשיח

‏אפשר לבחון מספר Challengers במקביל רק כאשר:

- ‏Experiment registry מלא.
- ‏multiple-testing risk מנוהל.
- ‏resource isolation קיימת.
- ‏comparison scope ברור.

‏ברירת המחדל שלנו נשארת מספר קטן מאוד של Challengers.

### ‏`P4 — Specialist`: ‏Canary / controlled exposure architecture

‏אפשר לתכנן יכולת canary רק כאשר versioning, state compatibility, rollback ו־observability כבר בשלים.

‏בפרויקט הנוכחי אין צורך בכך כדי להשלים Research/Replay/Shadow/Paper validation.

---

## ‏3. Why

‏בלי Champion/Challenger disciplined, קל לבחור גרסה לפי:

- ‏יום מוצלח.
- ‏PnL aggregate.
- ‏Backtest peak.
- ‏Metric יחיד.
- ‏sophistication.
- ‏narrative שנבנה בדיעבד.

‏המסגרת המומלצת הופכת את ההשוואה לשאלה סיבתית: **איפה behavior השתנה, מה היה הערך של השינוי, ומה המחיר ששולם עבורו.**

---

## ‏4. Use When

‏נשתמש במסגרת לכל שינוי שיכול לשנות decisions או economics, למשל:

- ‏Feature חדש/מוסר.
- ‏Ranking/threshold/veto.
- ‏Data provider או data semantics.
- ‏Execution/exit policy.
- ‏Model.
- ‏Cost model משמעותי.
- ‏Risk/control policy במחקר.

---

## ‏5. Do Not Use When

‏לא צריך full Challenger campaign לכל שינוי שאינו behavior-affecting, למשל שינוי documentation או observability טהור שהוכח שאינו משנה decision path.

‏עם זאת גם שינוי “PerformanceOnly” צריך benchmark מתאים אם הוא עלול להשפיע timing.

---

## ‏6. Alternatives

### ‏A. Before/After period comparison

‏פשוט, אבל חלש בגלל regime/nonstationarity.

### ‏B. Aggregate backtest leaderboard

‏שימושי ל־discovery, לא מספיק ל־promotion.

### ‏C. Full A/B split

‏יכול להיות קשה או לא הוגן בשוק משותף ודינמי; Shadow twins לרוב נקיים יותר למחקר.

### ‏D. Single-version evaluation

‏נדרש לפעמים, אבל לא נותן incremental attribution מול incumbent.

---

## ‏7. Trade-offs

‏המסגרת דורשת יותר storage, telemetry, replay compute ו־discipline. בתמורה היא מקטינה narrative drift, winner's curse, accidental complexity ו־promotion של שינויים שלא באמת משפרים decisions.

‏Incumbent advantage מכוון: tie לא מצדיק החלפת מערכת שכבר מוכרת וניתנת לשחזור.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל מ־:

- ‏עשרות Challengers במקביל.
- ‏Tournament אוטומטי.
- ‏Auto-promotion.
- ‏A/B production מורכב.
- ‏Composite score אחד שמסתיר blocker.
- ‏Promotion לפי PnL בלבד.
- ‏Sampling לא מתועד.
- ‏Challenger שמקבל data טוב יותר בלי להגדיר זאת כ־experiment variable.
- ‏Shadow שמחלק shared mutable state עם Champion.

---

## ‏9. What to Add Later

‏לאחר baseline אפשר להוסיף:

- ‏Coverage Matrix אוטומטית.
- ‏Disagreement explorer.
- ‏First-Divergence classifier.
- ‏StrategyDiff → Challenger scope generator.
- ‏Win/Loss taxonomy reports.
- ‏Stress scenario automation.
- ‏Post-promotion drift comparison.
- ‏Limited multi-challenger scheduling עם multiple-testing controls.

---

## ‏10. Required Data / Evidence

‏לכל comparison נדרשים לפחות:

```text
ChampionVersion
ChallengerVersion
ExperimentId
DecisionEpoch
Comparable input references
Champion decision snapshot
Challenger decision snapshot
TopK snapshots when relevant
Veto / eligibility snapshots
Execution assumptions / simulator version
Outcome provenance
Cost assumptions
Latency measurements
Regime/context labels
Guardrail states
Telemetry completeness
```

‏ל־Promotion Packet נדרש לפחות:

```text
Hypothesis
PrimaryMetric
MinimumMeaningfulImprovement
Guardrails
EvidenceWindow
DisagreementCount
EffectiveSampleSize
RegimeCoverage
EconomicDelta
LatencyDelta
CostDelta
TailDelta
ComplexityDelta
KnownRisks
Unknowns
RollbackTarget
Decision
```

---

## ‏11. Promotion Criteria

‏Challenger יהיה רק **Eligible for Promotion Review** כאשר:

1. ‏ה־Change Thesis ברורה וקפואה.
2. ‏שתי הגרסאות מזוהות ב־StrategyVersion מלא.
3. ‏input/context parity מספקת או שההבדל הוא המשתנה המוצהר.
4. ‏יש `Disagreement Set` אפקטיבי מספיק.
5. ‏השיפור ב־Primary Metric עובר `MinimumMeaningfulImprovement`.
6. ‏השיפור נשאר חיובי אחרי costs ו־latency ריאליסטיים.
7. ‏אין P0 correctness/safety regression.
8. ‏Guardrails עומדים בתנאי non-inferiority/limits שנקבעו.
9. ‏tail behavior מקובל.
10. ‏regime coverage מספקת או scope מוגבל מפורש.
11. ‏stress evidence אינו מוחק את היתרון.
12. ‏complexity tax מוצדק.
13. ‏telemetry/evidence completeness מספקת.
14. ‏Replay/Shadow evidence עקבי מספיק.
15. ‏rollback target וה־artifacts הנדרשים ניתנים לשחזור.

‏גם אז אין הבטחה שהגרסה טובה בכל מצב; זו רק הרשאה ל־review הבא.

---

## ‏12. Rejection Criteria

‏נפסול או נחזיר למחקר כאשר מתקיים אחד מהבאים:

- ‏P0 regression.
- ‏אין comparison parity מספיק.
- ‏Outcome קריטי הוא `UNKNOWN`.
- ‏Primary improvement קטן מהסף שנקבע מראש.
- ‏היתרון נעלם אחרי realistic costs/latency.
- ‏tail regression מהותי.
- ‏היתרון מרוכז ב־regime צר שלא הוגדר מראש כ־scope.
- ‏Effective disagreement sample קטן מדי.
- ‏Complexity/latency/operational burden אינו מוצדק.
- ‏Challenger contaminates Champion path.
- ‏Out-of-scope config/version change התרחש באמצע experiment.
- ‏Promotion criteria שונו בדיעבד.

‏כאשר evidence פשוט אינו מספיק:

```text
KEEP_RESEARCHING
```

‏היא תוצאה תקינה.

---

## ‏13. Metrics

### ‏Comparison

```text
DecisionParity
DisagreementRate
UsefulDisagreementRate
HarmfulDisagreementRate
NeutralDisagreementRate
DisagreementDensity
```

### ‏Economics

```text
IncrementalNetDecisionValue
EdgeRetentionDelta
CaptureRatioDelta
CostRatioDelta
LatencyTaxDelta
OpportunityEfficiency
TurnoverCostDelta
```

### ‏Ranking / Veto

```text
Top1Delta
TopKOverlap
RankGapDelta
RankChurnDelta
FalseVetoDelta
FalseAllowDelta
```

### ‏Execution / Exit

```text
FillRateDelta
SlippageDelta
TimeToFlatDelta
GivebackDelta
AdverseSelectionDelta
```

### ‏Robustness

```text
WorstDecileDelta
TailOutcomeDelta
RegimeCoverage
SparseCoverageCells
StressAdvantage
```

### ‏Operations

```text
p50/p95/p99 LatencyDelta
ComputeDelta
AllocationDelta
QueueAgeDelta
ErrorRateDelta
TelemetryCompleteness
```

---

## ‏14. Failure Modes

### ‏`Different Inputs Masquerading as Better Logic`

‏Challenger נראה טוב יותר בגלל data/context אחר.

### ‏`Tournament Winner's Curse`

‏נבדקו הרבה גרסאות ורק המנצחת הוצגה.

### ‏`PnL Green / Guardrail Red`

‏Aggregate outcome מסתיר deterioration קריטי.

### ‏`Counterfactual as Fact`

‏Simulation מסומן כאילו היה observed fill.

### ‏`High Parity / No Value`

‏המערכת נעשתה מורכבת יותר אך כמעט לא שינתה decisions.

### ‏`Low Parity / Under-Tested Redesign`

‏שינוי עצום מקבל evidence קטן מדי.

### ‏`Shadow Interference`

‏Challenger צורך resources או state ופוגע ב־Champion.

### ‏`Regime Concentration`

‏היתרון מגיע כמעט כולו מ־bucket אחד.

### ‏`Silent Experiment Contamination`

‏Config/version השתנו באמצע החלון.

### ‏`Promotion Debt`

‏Promotion נעשה בלי telemetry שתוכל לזהות regression אחר כך.

---

## ‏15. User-Specific Application

‏ל־whole-market `Short-Horizon Momentum` research שלנו, ברירת המחדל תהיה:

```text
One stable Champion
→ One primary Challenger
→ Same DecisionEpoch / market snapshot
→ Preserve both Top-K snapshots
→ Analyze only meaningful disagreements first
→ Attribute First Divergence
→ Compare net executable outcome
→ Check p95/p99 latency and cost tails
→ Segment by activity/liquidity/session/regime
→ Replay + Shadow
→ Promotion Packet
```

‏במיוחד בגלל horizon קצר, שיפור predictive קטן שאוכל יותר מדי מ־signal half-life דרך compute/queueing אינו שיפור מעשי.

‏נעדיף Challenger פשוט שמייצר delta ברור על redesign שמוסיף כמה Features, vetoes ו־execution changes יחד.

‏`NO_TRADE` טוב יותר נחשב שיפור לגיטימי אם הוא מפחית false allows בלי ליצור false-veto/opportunity-cost בלתי מתקבלים.

---

## ‏16. Confidence

‏**High** לגבי המסגרת ההנדסית והמחקרית: version parity, frozen criteria, disagreement analysis, realistic counterfactual labeling, guardrails, regime/tail evaluation ו־rollback readiness הם בסיס חזק להשוואת שינויים.

‏**Medium / Empirical** לגבי thresholds כמותיים ספציפיים כגון minimum disagreement sample, minimum meaningful improvement, allowable latency delta ו־regime coverage — אלה חייבים להיגזר מה־data, signal horizon והמערכת בפועל.

---

## ‏17. Fact / Judgment / Hypothesis

### ‏Fact

- ‏שתי גרסאות שאינן מקבלות אותו input/context אינן comparison נקי של logic בלבד.
- ‏Counterfactual simulated אינו observed outcome.
- ‏שינוי Config/Version באמצע experiment משנה את תנאי ההשוואה.
- ‏Latency, costs ו־execution יכולים להפוך predictive improvement ל־economic regression.

### ‏Judgment

- ‏ברירת המחדל שלנו תהיה `One Champion + One Primary Challenger`.
- ‏`Disagreement Set` יהיה dataset ראשי לניתוח incremental value.
- ‏Tie לא יצדיק Promotion.
- ‏P0 blocker לא יקוזז מול aggregate economic score.
- ‏Shadow יהיה שלב חובה כברירת מחדל לכל change decision-affecting משמעותי.

### ‏Hypothesis

- ‏ל־Short-Horizon scanner שלנו, analysis ממוקד disagreements יהיה יעיל יותר מחיפוש aggregate metric improvements בלבד.
- ‏Challengers פשוטים עם `One Primary Change` יניבו learning אמין יותר ו־RCA מהיר יותר מ־multi-change redesigns.
- ‏p95/p99 latency/cost guardrails יסבירו חלק מהפער בין offline predictive gains לבין net outcome.

---

## ‏18. Time-Sensitive Facts

‏אין במקטע הזה הנחת Broker/Exchange/Regulation שצריכה מספר עדכני כדי ליישם את המסגרת המחקרית.

‏אם Challenger בעתיד ישנה Provider, Broker capability, fee schedule, routing או regulatory behavior — העובדות החיצוניות הרלוונטיות ייבדקו מחדש בזמן הניסוי וייכללו ב־StrategyVersion/Evidence Packet המתאים.

---

## ‏19. Recommended MVP

‏אין צורך ב־platform כבד.

‏Baseline מספיק:

1. ‏Champion ו־Challenger עם `StrategyVersionId` מלא.
2. ‏`ExperimentId` אחד ו־Change Thesis קפואה.
3. ‏Decision Twin לכל sampled/comparable epoch.
4. ‏`DecisionDelta` לכל disagreement.
5. ‏Top-K, Veto, Context ו־Outcome provenance.
6. ‏Primary Metric + Guardrails + rejection criteria מראש.
7. ‏Replay comparison.
8. ‏Shadow comparison side-effect free.
9. ‏Promotion Packet אחד.
10. ‏Experiment Registry ששומר גם REJECT.

---

## ‏20. Final Recommendation

‏ה־Champion הוא baseline, לא אמת נצחית; ה־Challenger הוא hypothesis, לא שדרוג עד שהוכיח אחרת.

‏המסגרת המומלצת היא:

```text
Same Context
→ Two Versioned Decisions
→ Disagreement Set
→ First Divergence
→ Incremental Net Value
→ Guardrails + Tails + Regimes + Complexity
→ Replay / Shadow Evidence
→ Promotion Review or Rejection
```

‏כך השיפור נמדד לפי **החלטות שהשתנו והערך שהן יצרו**, ולא לפי סיפור בדיעבד על גרסה שנראתה מוצלחת.