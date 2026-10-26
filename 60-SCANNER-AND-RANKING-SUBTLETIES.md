# ‏שלב 60 — `Scanner and Ranking Subtleties`: למה `Rank #1` לא תמיד המועמד הנכון לפעולה

> ‏מטרת הפרק: להבין לעומק את הכשלים העדינים של Scanner ו־Cross-Sectional Ranking — stale winners, rank churn, score compression, timing bias, unfair freshness, tie-breaking, candidate persistence, normalization, executability והפער בין “המניה עם הציון הגבוה ביותר” לבין “המניה שהכי נכון לפעול עליה עכשיו”.
>
> ‏העיקרון המרכזי: **`Rank #1` הוא תוצאה של מנגנון מדידה, לא אמת אובייקטיבית. לפני פעולה צריך להוכיח שה־winner fresh, יציב מספיק, מופרד מספיק מהמתחרים, בר־ביצוע ועדיין מחזיק Edge אחרי latency ועלויות.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. מה ה־Scanner באמת עושה

‏ה־Scanner אינו רק `sort()` על רשימת Symbols.

‏הוא מנסה לענות על:

```text
Given what is known right now,
which candidate is most worth acting on now?
```

‏המילה החשובה היא `now`.

---

# ‏2. `Prediction Rank` אינו `Execution Rank`

‏נפריד בין:

```text
Prediction Rank
```

‏מי נראה בעל הסיכוי הטוב ביותר להמשיך לנוע.

‏לבין:

```text
Execution Rank
```

‏מי עדיין ניתן לביצוע בצורה כלכלית עכשיו.

‏מועמד יכול להיות Predictive Winner אבל Execution Loser.

---

# ‏3. Ranking Chain מלאה

```text
Predictive Score
→ Freshness
→ Stability
→ Execution Feasibility
→ Expected Costs
→ Expected Adverse Selection
→ Exit Feasibility
→ Net Executable Edge
```

‏ה־winner הסופי צריך לשרוד את כל השרשרת.

---

# ‏4. `Rank #1` יכול להיות Winner מזויף

‏מניה יכולה להגיע למקום הראשון בגלל:

- ‏עדכון טרי במיוחד לעומת האחרות.
- ‏data stale אצל המתחרות.
- ‏trade חריג אחד.
- ‏burst זמני.
- ‏spread שנפתח.
- ‏quote שלא עודכן.
- ‏feature noisy.
- ‏timestamp skew.
- ‏provider batching.
- ‏normalization bug.

---

# ‏5. תמיד צריך לענות על `Why Rank #1?`

‏לא מספיק:

```text
Score = 0.91
```

‏צריך לדעת:

```text
Which features pushed it up?
Why did it beat #2?
How fresh are the inputs?
How stable is the rank?
```

---

# ‏6. `Rank Age`

```text
RankAge = Now - RankComputedAt
```

‏Rank ישן הוא חשוד במסחר קצר־טווח.

---

# ‏7. `Input Age`

```text
InputAge = Now - OldestCriticalInputTimestamp
```

‏Rank חדש על inputs ישנים אינו באמת fresh.

---

# ‏8. Fresh Rank מול Fresh Inputs

```text
Fresh Rank
!=
Freshly Computed Rank From Stale Inputs
```

‏זו הבחנה קריטית.

---

# ‏9. `Freshness Parity`

‏Cross-sectional ranking הוגן רק כאשר המועמדים מושווים על מידע עם freshness דומה מספיק.

‏נמדוד:

```text
max_input_age
median_input_age
fresh_coverage_ratio
freshness_skew
```

---

# ‏10. `Stale Winner`

‏Winner יכול להיות מי שה־score שלו עוד לא הספיק להגיב להידרדרות.

‏למשל:

```text
score high
ask moved away
spread widened
flow reversed
```

---

# ‏11. Candidate Revalidation

‏לפני Submit צריך לבדוק מחדש:

```text
still top enough?
still fresh?
still eligible?
still executable?
still enough net edge?
```

---

# ‏12. `Rank Churn`

‏אם המקום הראשון משתנה במהירות:

```text
A → B → A → C → B → A
```

‏זה יכול להצביע על signal חלש, noise גבוה או differences קטנים מדי.

---

# ‏13. Metrics ל־Rank Churn

```text
rank_changes_per_second
rank_1_changes_per_second
candidate_dwell_time
candidate_reentry_rate
top_n_turnover
```

---

# ‏14. `Candidate Dwell Time`

```text
CandidateDwellTime = time continuously spent in eligible top set
```

‏Persistence יכולה להיות informative, אבל היא לא guarantee.

---

# ‏15. `Score Compression`

‏דוגמה:

```text
A = 91.2
B = 91.1
C = 91.0
D = 90.9
```

‏יש סדר, אבל אולי אין separation כלכלית אמיתית.

---

# ‏16. `Score Gap`

```text
ScoreGap1_2 = Score1 - Score2
```

‏נבדוק גם:

```text
NormalizedRankGap
PercentileGap
ExpectedEdgeGap
```

---

# ‏17. Absolute Quality מול Relative Rank

‏Rank הוא יחסי.

‏Candidate יכול להיות הכי טוב בשוק גרוע.

‏לכן:

```text
Trade = RelativeBest AND AbsoluteGoodEnough
```

---

# ‏18. `Rank Gap` לבדו אינו מספיק

‏פער גדול עם Score חלש עדיין לא אומר Trade.

‏פער קטן עם שני Candidates חזקים עדיין יכול להיות מעניין.

---

# ‏19. `Rank Confidence`

‏אפשר לחשוב עליו כשילוב של:

```text
signal strength
+ input freshness
+ score separation
+ candidate persistence
+ data quality
+ execution feasibility
```

---

# ‏20. `Top-1 Winner's Curse`

‏כאשר בוחרים את הערך הגבוה ביותר מתוך אלפי Symbols, בוחרים גם את ה־noise החיובי הקיצוני ביותר.

‏לכן observed top score נוטה להיות אופטימי.

---

# ‏21. Top-K Analysis

‏נשווה:

```text
Top 1
Top 3
Top 5
Top 10
```

‏לפי:

- ‏forward return.
- ‏hit rate.
- ‏time to target.
- ‏MAE/MFE.
- ‏execution feasibility.
- ‏costs.

---

# ‏22. `Rank Buckets`

```text
Rank 1
Ranks 2-5
Ranks 6-10
Ranks 11-50
Rest
```

‏כך אפשר לבדוק אם Ranking באמת ממיין future outcomes.

---

# ‏23. `Rank Monotonicity`

‏אידיאלית:

```text
ExpectedOutcome(rank 1)
>
ExpectedOutcome(rank 10)
>
ExpectedOutcome(rank 100)
```

‏לא בכל sample, אבל לאורך זמן.

---

# ‏24. Raw Score יכול להיות לא comparable

‏אותו Score יכול להיות בעל משמעות שונה לפי:

- ‏מחיר.
- ‏liquidity.
- ‏volatility.
- ‏spread.
- ‏market cap.
- ‏time of day.
- ‏regime.

---

# ‏25. Normalization

‏אפשרויות:

```text
percentile
z-score
cohort normalization
regime-aware scaling
```

‏אבל normalization עצמו יכול ליצור bugs ו־leakage.

---

# ‏26. Cohort Ranking

‏לפעמים נרצה להשוות קודם בתוך קבוצות דומות.

‏אבל ברירת מחדל מחקרית טובה:

```text
start simple
measure bias
add cohorts only if evidence requires it
```

---

# ‏27. Time-of-Day Bias

‏Score distribution יכול להשתנות מאוד בין open, midday ו־close.

‏נבדוק:

```text
score distribution by session segment
rank outcome by session segment
```

---

# ‏28. Universe Selection Bias

‏ה־winner תלוי במי שהשתתף בתחרות.

‏נשמור:

```text
UniverseVersion
EligibleCount
ExcludedCount
ExclusionReasons
```

---

# ‏29. Eligibility לפני Ranking

‏מבנה טוב:

```text
Universe
→ Hard Eligibility
→ Features
→ Score
→ Rank
```

---

# ‏30. `Trade / No Trade` אחרי Ranking

‏גם אם יש Rank #1, לא תמיד יש Trade.

```text
if BestCandidateExpectedNetEdge <= threshold:
    NO TRADE
```

---

# ‏31. Tie-Breaking חייב להיות דטרמיניסטי

‏אסור שהבחירה תהיה תלויה ב:

```text
Dictionary enumeration order
thread timing
incidental arrival order
```

---

# ‏32. Stable Tie-Breakers

‏דוגמה אפשרית:

```text
1. higher expected net edge
2. fresher state
3. lower execution drag
4. stronger persistence
5. stable symbol key
```

---

# ‏33. Tie-Breaker יכול ליצור Leakage

‏אם tie-breaker משתמש במידע שלא היה זמין בזמן ההחלטה, גם detail טכני הופך לבאג מחקרי.

---

# ‏34. Event-Driven Ranking Bias

‏Symbol שזה עתה קיבל update יכול לקבל יתרון זמני על פני Symbols שלא קיבלו event חדש.

---

# ‏35. שלוש אפשרויות תזמון

```text
rank on every event
rank on watermark
rank on controlled cadence
```

‏לכל אחת trade-off בין freshness, fairness ו־latency.

---

# ‏36. Snapshot Ranking

‏יתרון:

```text
better cross-sectional comparability
```

‏חיסרון:

```text
extra wait / compute latency
```

---

# ‏37. Continuous Incremental Ranking

‏יתרון:

```text
low latency
```

‏חיסרון:

```text
states are not updated at exactly the same time
```

---

# ‏38. `Decision As-Of Time`

‏לכל החלטה נשמור:

```text
DecisionAsOfTime
FeatureAsOfTime
QuoteAsOfTime
TradeAsOfTime
BookAsOfTime
```

---

# ‏39. Watermark Thinking

‏Watermark עוזר לחשוב על:

```text
what we believe has been processed up to time T
```

‏ולבדוק אם comparison מספיק complete.

---

# ‏40. `Rank Stability Window`

‏נמדוד כמה זמן Candidate נשאר Top N או Rank #1.

‏אבל לא נהפוך זאת אוטומטית ל־gate לפני Validation.

---

# ‏41. `Rank Velocity`

```text
50 → 20 → 7 → 2
```

‏שונה מ:

```text
1 → 12 → 2 → 18
```

‏אפשר לחקור:

```text
rank_velocity
rank_acceleration
rank_volatility
```

---

# ‏42. `Score Velocity`

‏גם trajectory של Score חשוב.

```text
0.40 → 0.55 → 0.72 → 0.88
```

‏שונה מ:

```text
0.91 → 0.89 → 0.84
```

---

# ‏43. Peak Score Trap

‏Candidate יכול להיות Rank #1 כי הוא כבר הגיע לשיאו.

‏נבדוק:

```text
current_score
recent_peak_score
score_slope
price_response
```

---

# ‏44. Persistence מול Signal Decay

‏Persistence גבוהה יכולה להעיד על consistency — או על signal שכבר התיישן.

‏נבדוק:

```text
time_since_first_top_rank
→ forward net outcome
```

---

# ‏45. Freshness קיימת בכל שכבה

```text
data freshness
feature freshness
score freshness
rank freshness
execution freshness
```

---

# ‏46. `Feature Ready` מול `Feature Present`

‏Feature יכול להיות קיים בזיכרון אך לא valid בגלל:

- ‏insufficient history.
- ‏feed gap.
- ‏session reset.
- ‏post-halt warmup.

---

# ‏47. Missing אינו Zero

‏נבדיל בין:

```text
KNOWN
MISSING
STALE
INVALID
INFERRED
```

---

# ‏48. Cross-Sectional Leakage

‏Percentile, z-score ו־relative momentum חייבים להשתמש רק במידע שהיה זמין באותו רגע.

---

# ‏49. Future Universe Leakage

‏Historical ranking חייב להשתמש ב־historical point-in-time universe.

---

# ‏50. `Rank Attribution`

‏לכל winner נרצה לדעת:

```text
which features contributed
which filters passed
which adjustments applied
why it beat #2
```

---

# ‏51. Winner Explanation Snapshot

```text
symbol
rank
raw_score
adjusted_score
rank_gap
feature_values
feature_contributions
freshness
spread
liquidity
expected_cost
expected_net_edge
reasons
```

---

# ‏52. `Why Not #2?`

‏אם המערכת אינה יכולה להסביר למה A נבחרה ולא B, ה־Ranking אינו מספיק diagnosable.

---

# ‏53. Counterfactual Candidate Analysis

‏אחרי החלטה נבדוק גם מה קרה ל־Rank #2 ו־#3.

---

# ‏54. Opportunity Cost של בחירה

```text
OpportunityCost = Outcome(B) - Outcome(A)
```

‏זה metric חשוב לאיכות ה־Ranking.

---

# ‏55. Rank #1 Failure RCA

‏נפריד בין:

```text
prediction failure
freshness failure
ranking failure
execution failure
latency failure
cost failure
exit failure
regime failure
```

---

# ‏56. `First Divergence`

‏ב־RCA נשאל:

```text
What was the first point at which reality diverged from the expected path?
```

---

# ‏57. `Rank-to-Trade Conversion`

```text
rank_1_count
eligible_rank_1_count
trade_gate_pass_count
submitted_count
filled_count
profitable_count
```

---

# ‏58. `Decision Impact Rate`

‏Feature או Rule חדש צריכים להראות כמה פעמים באמת שינו Candidate או `TRADE/NO TRADE`.

---

# ‏59. Rank Churn יכול לייצר Order Churn

```text
A top
→ submit A
B top
→ cancel A
→ submit B
A returns
```

‏התוצאה יכולה להיות latency, races ואובדן queue priority.

---

# ‏60. Hysteresis

‏אפשר לדרוש שמועמד חדש יהיה טוב מהנוכחי בפער משמעותי לפני switching.

```text
replace only if new_expected_edge > current_expected_edge + switch_cost
```

---

# ‏61. Switching Cost

‏החלפת Candidate יכולה לכלול:

```text
cancel latency
lost queue position
new submit latency
new spread
new uncertainty
```

---

# ‏62. State-Aware Ranking

‏Ranking policy תלויה גם במצב העסקי:

```text
Flat
Pending Entry
Partially Filled
Long
Pending Exit
```

---

# ‏63. `Position-Aware Opportunity`

‏אם כבר יש Position, מעבר ל־Candidate חדש צריך לכסות גם:

```text
exit cost from current
entry cost into new
latency
execution uncertainty
```

---

# ‏64. Position Monitoring קודם ל־Full Scan

‏Exit path לא צריך לחכות לסריקה מלאה של אלפי Symbols.

---

# ‏65. Score אינו Probability אלא אם Calibration מוכיח זאת

```text
Score = 0.82
```

‏לא אומר:

```text
82% probability of profit
```

---

# ‏66. Score Calibration

‏נבדוק:

```text
score bucket
→ observed future outcome
```

---

# ‏67. Score אינו Economic Value

‏Score גבוה יחסית יכול עדיין לתת `ExpectedNetEdge <= 0`.

---

# ‏68. `Expected Net Edge Rank`

‏בהמשך אפשר להשוות:

```text
raw_predictive_rank
```

‏מול:

```text
expected_net_edge_rank
```

‏שכולל costs, fill probability, adverse selection, latency decay ו־exit feasibility.

---

# ‏69. Ranking לפי Fill Probability בלבד מסוכן

‏Candidate שקל למלא יכול להיות דווקא toxic.

‏צריך לחשוב:

```text
Fill Probability × Post-Fill Quality
```

---

# ‏70. `No-Fill Quality`

‏גם no-fill צריך להימדד.

‏אם Candidates שלא התמלאו היו מצוינים, execution policy אולי שמרנית מדי.

---

# ‏71. Score Noise Floor

‏אם ההבדל בין A ל־B קטן מרמת ה־noise של המודל, אין משמעות אמיתית לסדר.

---

# ‏72. Confidence-Interval Thinking

‏במקום לראות שני מספרים כמדויקים לחלוטין, נחשוב על uncertainty סביבם.

---

# ‏73. Ranking under Regime Shift

‏Calibration יכול להשתנות ב:

- ‏high volatility.
- ‏low volatility.
- ‏fast market.
- ‏thin liquidity.
- ‏event-heavy sessions.

---

# ‏74. Market-Relative Context

‏נבדוק הבדל בין:

```text
absolute momentum
relative momentum
market-adjusted momentum
sector-relative momentum
```

---

# ‏75. Sector Crowding

‏אם Top 10 כולם מאותו sector, זה יכול להיות real move או shared factor/noise.

---

# ‏76. Candidate Quality Distribution

‏לא נמדוד רק winner.

‏נשמור:

```text
P50 score
P90
P95
P99
max
```

---

# ‏77. `Rank Gap Distribution`

‏נשמור לאורך זמן:

```text
Rank1-2 gap
Rank1-5 gap
```

‏ונבדוק אילו gaps באמת קשורים ל־outcome טוב יותר.

---

# ‏78. `Candidate Persistence Curve`

```text
persistence duration
→ forward net outcome
```

‏ייתכן sweet spot בין transient מדי ל־old מדי.

---

# ‏79. `Top-N Turnover`

```text
how many symbols enter/leave top N per second
```

‏Turnover גבוה יכול להעיד על market burst, score noise, stale asymmetry או bad normalization.

---

# ‏80. Rank Fairness תחת CPU Pressure

‏Processing order יכול להעניק freshness advantage עקבי לחלק מה־Universe.

---

# ‏81. Partition Bias

‏אם Universe מחולק ל־partitions, נבדוק שאין partition שמקבל יותר CPU, פחות backlog או יותר ranking opportunities.

---

# ‏82. Backpressure Bias

‏כאשר queues עמוסות, Ranking יכול להיראות תקין אבל להיות biased בגלל freshness שונה.

‏נמדוד:

```text
queue_age_by_partition
freshness_by_partition
rank_share_by_partition
```

---

# ‏83. Coalescing Semantics

‏Latest-state coalescing יכול להתאים ל־quotes, אך לא בהכרח ל־trade flow שבו כל event חשוב.

---

# ‏84. Event Loss משנה Rank

‏אובדן burst יכול לשנות:

```text
trade_count
volume_rate
flow_imbalance
```

‏ולכן Data Quality צריך להגיע ל־Ranking Gate.

---

# ‏85. Rank under Feed Failover

‏אחרי החלפת Provider ייתכן שינוי ב־timestamps, eligibility, quote coverage או aggregation.

‏לא משווים state חדש וישן בלי להבין semantics.

---

# ‏86. `Rank Generation`

‏נשמור generation/version כאשר משתנים:

```text
model
universe
data source
schema
feature definitions
```

---

# ‏87. Versioning בכל Decision

```text
ModelVersion
FeatureVersion
FilterVersion
RankingPolicyVersion
ExecutionPolicyVersion
```

---

# ‏88. Score Contribution אינו Causal Contribution

‏Feature שמוסיף הרבה ל־score לא בהכרח מוסיף הרבה performance.

‏צריך ablation.

---

# ‏89. Ablation של Ranking

```text
remove feature X
rerun ranking
compare selected candidates
compare net outcomes
```

---

# ‏90. Candidate Replacement Experiment

‏נשווה:

```text
actual Rank #1
vs hypothetical Rank #2
vs random eligible candidate
```

---

# ‏91. Random Baseline

‏אם Ranking אינו מנצח random eligible baseline אחרי costs, יש בעיה יסודית.

---

# ‏92. Naive Baseline

‏נשווה גם ל־simple rules:

```text
highest simple momentum
highest trade rate
highest volume acceleration
```

‏Model מורכב צריך להצדיק complexity.

---

# ‏93. Rank Stability אינו Profit Stability

‏Candidate יציב בדירוג עדיין יכול להפסיד.

---

# ‏94. High Score אינו Edge אם Exit גרוע

‏Candidate שקל להיכנס אליו אך קשה לצאת ממנו אינו בהכרח winner כלכלי.

---

# ‏95. `Entry Rank` ו־`Exit Logic` הם מערכות שונות

‏אין סיבה שה־Feature שמדרג Entry יהיה גם זה שמחליט Exit.

---

# ‏96. Ranking אינו עוקף Risk

‏Risk limits הם hard constraints, לא feature קטן בתוך Score.

---

# ‏97. Ranking אינו עוקף Safety

‏אם:

```text
MarketDataQuality = BAD
BrokerState = UNKNOWN
SystemMode = EXIT_ONLY
```

‏אין Entry גם אם Score מושלם.

---

# ‏98. Halt/Reopen Context

‏אחרי Halt/Reopen ה־book, spread ו־reference prices יכולים להיות חריגים.

‏Ranking צריך לכבד TradingStatus state machine.

---

# ‏99. Auctions הן Context שונה

‏Auction data אינה בהכרח comparable ל־continuous-market ranking.

---

# ‏100. Open Bias

‏בפתיחה יש price discovery, overnight gaps ו־activity גבוהה.

‏Score distribution שונה מ־midday.

---

# ‏101. Fast-Market Mode

‏ב־fast market אפשר לשקול:

```text
tighter freshness gates
less deep analysis
higher NO TRADE threshold
higher priority to active position
```

‏אבל רק אחרי Validation.

---

# ‏102. Ranking Latency Budget

‏נמדוד:

```text
MarketEvent
→ FeatureReady
→ ScoreReady
→ RankReady
→ Decision
```

---

# ‏103. Fast Code on Stale Inputs is Slow Economically

‏Ranking מהיר מאוד אינו מועיל אם inputs כבר איבדו רלוונטיות.

---

# ‏104. `Signal Half-Life` מול `Rank Latency`

‏נרצה למדוד:

```text
RankLatency / SignalHalfLife
```

‏כדי להבין כמה מה־Edge נשרף לפני ההחלטה.

---

# ‏105. Rank at Detection מול Rank at Submit

‏נשמור:

```text
RankAtDetection
RankAtDecision
RankAtSubmit
RankAtFill
```

‏כדי למדוד drift.

---

# ‏106. Candidate Revalidation רגע לפני Submit

‏אם Rank הידרדר משמעותית, Score קרס, freshness נפגעה או economics השתנו — אפשר לבחור `NO TRADE`.

---

# ‏107. `Rank Decay Curve`

‏נבדוק:

```text
how predictive value changes with rank age
```

‏כך אפשר לגזור TTL אמפירי לדירוג.

---

# ‏108. Replay חייב לשחזר Ranking Deterministically

‏אותו Dataset, Versions ו־Config צריכים להפיק אותו sequence של winners.

---

# ‏109. Determinism Test

‏נריץ אותו Replay מספר פעמים ונדרוש:

```text
same ranks
same reasons
same decisions
```

---

# ‏110. Property Tests ל־Ranking

‏דוגמאות:

```text
ineligible symbol can never rank as tradable winner
stale critical input can never pass freshness gate
same state + same versions => same rank
```

---

# ‏111. Metamorphic Tests

‏לדוגמה:

‏אם מכפילים את כל quantities בקבוע אך feature אמור להיות scale-invariant, Ranking לא אמור להשתנות.

---

# ‏112. Shadow Ranking

‏אפשר להריץ Ranking policy חדשה בלי להשפיע על Orders ולהשוות:

```text
selected candidate
rank stability
future outcomes
decision impact
```

---

# ‏113. Champion / Challenger

‏ה־Champion הוא policy מוכח יותר.

‏Challenger נמדד בצד לפני promotion.

---

# ‏114. Ranking Metrics בסיסיים

```text
rank_compute_latency
rank_age
input_age
fresh_coverage
rank_gap
rank_churn
top_n_turnover
candidate_dwell_time
rank_to_trade_rate
```

---

# ‏115. Economic Ranking Metrics

```text
expected_net_edge_by_rank
realized_net_outcome_by_rank
fill_rate_by_rank
post_fill_markout_by_rank
opportunity_cost_vs_next_candidate
```

---

# ‏116. Diagnostics Snapshot

‏בכל Decision משמעותי נשמור Top-N ולא רק winner.

‏כך אפשר לראות אם winner היה ברור או כמעט tie.

---

# ‏117. Practitioner Secret — Top 1 Alone Hides the Shape

‏Top 1 בלי distribution מסביבו לא מספר אם הייתה הזדמנות חזקה או ניצחון מקרי בפער זעיר.

---

# ‏118. Practitioner Secret — Stale Competitors Inflate the Winner

‏Candidate fresh יכול להיראות מעולה רק משום שהאחרים עדיין לא עודכנו.

---

# ‏119. Practitioner Secret — Rank Churn Can Be More Important Than Rank

‏במערכת קצרה, Candidate שמחליף מקום ראשון עשרות פעמים יכול להיות קשה מאוד להפוך ל־execution יציב.

---

# ‏120. Practitioner Secret — Better Prediction Can Lose After Execution

‏Candidate עם prediction חזק יותר יכול להפסיד ל־#2 אחרי spread, slippage, fill probability ו־adverse selection.

---

# ‏121. Practitioner Secret — More Features Can Reduce Ranking Quality

‏עוד Features יכולים להוסיף noise, instability ו־overfitting גם כאשר backtest headline נראה טוב יותר.

---

# ‏122. Practitioner Secret — Fast Markets Expose Hidden Scheduling Bias

‏CPU pressure, queues ו־partition ordering עלולים לגרום ל־Ranking bias דווקא כשחשוב ביותר להיות fair.

---

# ‏123. Practitioner Secret — Candidate Recheck is Not Optional for Short Signals

‏ב־milliseconds-to-seconds, אפילו delay קצר בין rank ל־submit יכול לשנות את המציאות.

---

# ‏124. Practitioner Secret — Rank #1 Failure Is Often Not a Ranking Failure

‏הכשל יכול להתחיל ב־data, freshness, execution, latency או exit.

‏RCA חייב למצוא `First Divergence`.

---

# ‏125. Practitioner Secret — Explainability Is a Performance Tool

‏כאשר אפשר להסביר מהר למה Candidate ניצח, אפשר לבצע RCA מהר יותר ולשפר את המערכת בצורה ממוקדת.

---

# ‏126. Baseline Architecture לרובוט שלנו

```text
Canonical State
→ Hard Eligibility
→ Incremental Features
→ Predictive Score
→ Cross-Sectional Rank
→ Top-N Snapshot
→ Freshness / Executability Recheck
→ TRADE / NO TRADE Gate
→ Execution
```

‏מנגנון `Negative Evidence / Veto / Disqualification` יילמד בפרק 60A הנפרד שנוסף ל־`00-DISCOVERED-TOPICS.md`.

---

# ‏127. Baseline Metrics לרובוט שלנו

‏כדאי למדוד לפחות:

```text
rank_age
feature_age
fresh_coverage_ratio
rank_gap_1_2
candidate_dwell_time
rank_1_churn_rate
rank_at_detection
rank_at_submit
rank_at_fill
expected_net_edge
rank_to_trade_conversion
```

---

# ‏128. Baseline Research Questions

1. ‏האם Rank #1 מנצח Top 3/5 באופן עקבי?
2. ‏כמה מה־performance מגיע רק מה־Top 1?
3. ‏האם rank gap מנבא outcome?
4. ‏האם persistence מוסיפה signal?
5. ‏כמה מהר prediction decay אחרי rank creation?
6. ‏כמה winners הופכים stale לפני Submit?
7. ‏כמה פעמים #2 עדיף כלכלית אחרי execution costs?
8. ‏האם ranking fairness נפגעת ב־bursts?

---

# ‏129. מה לא לעשות בתחילת הדרך

‏לא הייתי מתחיל מיד עם:

- ‏עשרות normalization layers.
- ‏complex dynamic cohorts.
- ‏ML ranker כבד ללא baseline פשוט.
- ‏opaque score שאי אפשר להסביר.
- ‏switching policy אגרסיבית.
- ‏full-universe deep analysis בכל event.

‏קודם מוכיחים שה־Ranking הפשוט באמת מוסיף ערך.

---

# ‏130. Checklist לפני פעולה על Rank #1

```text
Is data fresh enough?
Are critical features ready?
Is fresh coverage good enough?
Is the candidate still eligible?
Is rank separation meaningful?
Has the candidate become stale?
Is expected net edge still positive?
Is entry executable?
Is exit plausible?
Did rank materially deteriorate before submit?
```

---

# ‏131. מה צריך לדעת בעל פה

- ‏Rank הוא יחסי, לא absolute quality.
- ‏Freshness fairness חשובה ב־cross-section.
- ‏Rank #1 יכול להיות noise extreme.
- ‏Top-K analysis חושף אם Top-1 באמת מוסיף ערך.
- ‏Score אינו Probability בלי calibration.
- ‏Prediction Rank אינו Execution Rank.
- ‏Rank churn ו־switching cost מחוברים.
- ‏Candidate חייב לעבור revalidation לפני Submit.
- ‏RCA צריך למצוא First Divergence.
- ‏`NO TRADE` הוא output תקין גם כשיש winner.

---

# ‏132. משפט הסיום

> ‏**המטרה אינה למצוא את המספר הגבוה ביותר בטבלה. המטרה היא לבחור, בזמן, את המועמד שה־Evidence שלו חזק מספיק, שההשוואה אליו הוגנת מספיק, ושעדיין אפשר להפוך את היתרון שלו ל־Net Edge אמיתי.**

---

## ‏המשך הקורס

‏ה־Discovered Topic הבא הוא:

```text
60A — Negative Evidence, Veto and Disqualification Engine
```

‏רק לאחר השלמתו נחזור לסדר המקורי ונעבור לשלב 61 — `Backtest Subtleties`.
