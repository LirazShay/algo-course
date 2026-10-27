# ‏60A — Recommendation Sheet: Negative Evidence, Veto and Disqualification Engine

> ‏מקור לימודי עיקרי: `../60A-NEGATIVE-EVIDENCE-VETO-AND-DISQUALIFICATION-ENGINE.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, ארכיטקטוני ותפעולי ל־`Negative Evidence Engine` של רובוט `Short-Horizon Momentum`, כך ש־Candidate בעל Score גבוה לא יהפוך ל־Trade רק משום שה־Evidence החיובי חזק; אלא יעבור ערוץ החלטה שלילי עצמאי שמזהה `Hard Veto`, ‏`Soft Penalty`, ‏`Cooldown`, ‏`Negative Memory` ו־Unknown state, תוך הגנה מ־Veto Overfitting, Leakage, Rule Explosion ו־False Vetoes.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי, אינו מגדיר Exposure אמיתי ואינו מבטיח רווח.

---

## ‏1. Decision

‏ה־`Negative Evidence Engine` לא יהיה “עוד Feature עם משקל שלילי” בתוך Score אחד.

‏הוא יהיה **ערוץ Decision Evidence מקביל ונפרד**.

‏ה־Baseline:

```text
Market / System State
        ↓
Positive Evidence
→ Features / Score / Rank
        ↓
Top-N Candidates
        ↓
Negative Evidence Engine
→ Hard Vetoes
→ Soft Penalties
→ Cooldowns
→ Negative Memory
→ Warnings / Unknowns
        ↓
Execution Feasibility
        ↓
Risk / Safety
        ↓
Final Revalidation
        ↓
TRADE_CANDIDATE / NO_TRADE
```

‏העקרונות המחייבים:

```text
High Score != Actionable Candidate
Negative Evidence != Negative Score
Validity/Safety evidence is non-compensable
Behavioral veto = hypothesis until validated
Unknown != False
Veto != Risk Engine
Entry Veto != Exit Signal
RCA != permission to add a rule
More selectivity != more edge
```

‏המטרה אינה למנוע הפסדים בכל מחיר.

‏המטרה היא:

```text
maximize risk-adjusted net executable outcome
while preserving explainability, sample size and opportunity set
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: הפרדה בין ארבע שכבות Evidence

‏המערכת תשמור בנפרד:

```text
Positive Evidence
Negative Evidence
Execution Feasibility
Risk / Safety State
```

‏לא נבנה נוסחה אחת שבה:

```text
great momentum
+
stale data
+
unknown broker state
+
wide spread
=
moderate score
```

‏מצב כזה מוחק semantics.

‏במקום זאת:

```text
positive_score = strong
negative_context = explicit
execution_feasibility = explicit
risk_state = explicit
```

‏וה־Decision Aggregator יקבע את התוצאה לפי Policy versioned.

### ‏`P0 — Required`: שלושה סוגי פעולה שונים

‏כל Negative Evidence יסווג קודם לפי Policy type:

```text
HARD_VETO
SOFT_PENALTY
COOLDOWN
```

‏ונוכל לשמור גם:

```text
WARNING
UNKNOWN
```

‏המשמעות:

```text
HARD_VETO
→ candidate cannot create new entry risk now

SOFT_PENALTY
→ candidate remains eligible but attractiveness/economic confidence is reduced

COOLDOWN
→ candidate temporarily blocked until time/event/state reset

WARNING
→ evidence retained for observability/research only

UNKNOWN
→ the engine cannot establish the negative condition reliably
```

### ‏`P0 — Required`: Hard Vetoes ראשוניים יהיו קטנים וברורים

‏ל־Baseline הראשון נתחיל רק מ־Validity/Economics חזקים:

```text
DATA_NOT_TRUSTWORTHY
TRADING_STATUS_NOT_ACTIONABLE
SIGNAL_EXPIRED
EXIT_NOT_FEASIBLE
REMAINING_NET_EDGE_NOT_POSITIVE
```

‏אלה אינם “trading tricks”.

‏הם guards נגד פעולה כאשר:

```text
we cannot trust the observation
or
we cannot establish actionable market state
or
there is no remaining economic edge
```

### ‏`P0 — Required`: Evidence שאינו בר־פיצוי

‏יש Evidence שאסור ל־Score גבוה לקזז.

‏Baseline non-compensable examples:

```text
critical data invalid / unknown
trading status not actionable
signal expired
execution state unknown where new risk could duplicate exposure
exit feasibility below required contract
remaining net edge <= required floor
system/risk safety state blocks new risk
```

‏כלל:

```text
NonCompensableFailure
=> no amount of positive score can restore entry eligibility
```

### ‏`P1 — Preferred Default`: Evidence כלכלי מתון מתחיל כ־Penalty

‏מצבים כגון:

```text
rank churn elevated
score separation weak
spread moderately worse
recent giveback pattern
recent liquidity deterioration
moderate toxicity evidence
```

‏לא יקבלו `Hard Veto` אוטומטי.

‏ברירת המחדל:

```text
detect
→ log
→ shadow penalty
→ validate
→ decide whether penalty / cooldown / veto is justified
```

### ‏`P1 — Preferred Default`: Behavioral Vetoes ב־Shadow בלבד בתחילה

‏המועמדים הראשונים למחקר:

```text
RECENT_GIVEBACK
FAILED_BREAKOUT
RANK_CHURN
SPREAD_SHOCK_MEMORY
LIQUIDITY_WITHDRAWAL_MEMORY
TOXIC_MARKOUT_MEMORY
```

‏בשלב הראשון:

```text
ShadowVeto = true
ActualDecisionUnchanged = true
```

‏ונמדוד מה היה משתנה אילו Rule היה פעיל.

### ‏`P0 — Required`: Candidate-local מול Global Veto

‏כל Rule חייב להגדיר Scope.

```text
CANDIDATE_LOCAL
MARKET_WIDE
SYSTEM_WIDE
ACCOUNT / EXECUTION_WIDE
```

‏דוגמה:

```text
XYZ spread exploded
→ candidate-local
→ #2 may still be evaluated
```

‏לעומת:

```text
fresh coverage collapsed
→ market-wide
→ BLOCK_NEW_ENTRIES
```

‏אין “fallback ל־#2” כאשר הסיבה גלובלית.

### ‏`P0 — Required`: Candidate הבא עובר Evaluation מלא מחדש

‏אם #1 נפסל:

```text
#2
→ current-time revalidation
→ negative evidence pass
→ execution feasibility
→ risk / safety
→ final decision
```

‏לא:

```text
#1 vetoed
→ automatically promote #2
```

‏הזמן השתנה, ה־state השתנה, וה־Candidate החדשה אינה “הבא בתור” באופן אוטומטי.

### ‏`P0 — Required`: Unknown נשאר Unknown

‏אם אין מספיק Data לחשב Rule:

```text
rule_state = UNKNOWN
```

‏לא:

```text
rule_state = false
```

‏Policy ל־Unknown תלויה בקטגוריה:

```text
Safety / validity critical
→ fail closed for new risk

Experimental behavioral rule
→ do not silently block production decision until validated
```

---

## ‏3. Why

‏ה־Strategy שלנו פועלת ב־short horizon שבו:

- ‏ה־Signal מתיישן מהר.
- ‏עלויות Execution יכולות למחוק Edge קטן.
- ‏Data/Quote/Spread/Depth יכולים להשתנות בתוך חלון קצר.
- ‏Fill טוב למראה יכול להיות toxic.
- ‏Rank #1 יכול להיות transient/noisy.
- ‏recent behavior יכול לשנות את האטרקטיביות לפני שה־Positive Score מספיק להגיב.

‏לכן המערכת צריכה לשאול שתי שאלות נפרדות:

```text
Who looks best?
```

‏וגם:

```text
What do we already know that argues against acting now?
```

‏אם מערבבים את שתיהן בתוך Score אחד, מאבדים את היכולת להבין:

```text
what blocked the trade
why it blocked it
whether it was validity, economics or hypothesis
whether the block was still active
whether it helped or harmed
```

---

## ‏4. Taxonomy של Negative Evidence

### ‏4.1 `DATA`

‏דוגמאות:

```text
DATA_STALE
DATA_GAP
SEQUENCE_UNCERTAIN
TORN_QUOTE
CROSS_PROVIDER_CONFLICT
FEATURE_NOT_READY
FRESH_COVERAGE_INSUFFICIENT
DATA_GENERATION_MISMATCH
```

‏המשמעות אינה בהכרח:

```text
candidate is bad
```

‏אלא:

```text
candidate cannot be evaluated reliably now
```

### ‏4.2 `TRADING_STATUS`

```text
HALTED
REOPEN_TRANSITION
AUCTION_CONTEXT_UNSUPPORTED
STATUS_UNKNOWN
MARKET_STATE_ABNORMAL
```

‏State מפורש עדיף על inference ממחיר.

### ‏4.3 `LIQUIDITY`

```text
SPREAD_TOO_LARGE_FOR_EDGE
DEPTH_INSUFFICIENT_FOR_REQUESTED_SIZE
EXIT_DEPTH_INSUFFICIENT
DEPTH_COLLAPSE
LIQUIDITY_WITHDRAWAL
```

‏Entry feasibility ללא Exit feasibility אינה מספיקה.

### ‏4.4 `EXECUTION`

```text
FILL_PROBABILITY_TOO_LOW
QUEUE_TOO_DEEP
EXPECTED_ADVERSE_SELECTION_TOO_HIGH
REQUIRED_AGGRESSION_CONSUMES_EDGE
PRICE_BOUND_INSUFFICIENT
EXECUTION_STATE_UNKNOWN
```

### ‏4.5 `SIGNAL`

```text
SIGNAL_EXPIRED
SIGNAL_TOO_CLOSE_TO_HALF_LIFE
MOMENTUM_DIRECTION_FLIPPED
ACCELERATION_COLLAPSED
PRICE_RESPONSE_NO_LONGER_CONFIRMS
```

### ‏4.6 `RECENT_BEHAVIOR`

```text
RECENT_FAILED_BREAKOUT
RECENT_GIVEBACK
RECENT_TOP_RANK_WITH_POOR_FOLLOW_THROUGH
RECENT_TOXIC_FILL
RECENT_SPREAD_SHOCK
RECENT_LIQUIDITY_WITHDRAWAL
RECENT_RANK_CHURN
```

‏אלה לרוב מתחילים כ־Research Evidence, לא Safety Truth.

### ‏4.7 `MICROSTRUCTURE`

```text
BOOK_DETERIORATION
FLOW_REVERSAL
REPLENISHMENT_FAILURE
HIGH_TOXICITY_CONTEXT
```

### ‏4.8 `COST`

```text
ROUND_TRIP_COST_TOO_HIGH
EXPECTED_IMPACT_TOO_HIGH
EXPECTED_SLIPPAGE_TOO_HIGH
REMAINING_EDGE_TOO_SMALL
```

### ‏4.9 `LATENCY`

```text
SIGNAL_TO_EXECUTION_GAP_TOO_LARGE
RANK_TOO_OLD
FEATURE_TOO_OLD
EXPECTED_SUBMIT_AGE_TOO_HIGH
QUEUE_AGE_DEGRADED
```

### ‏4.10 `RISK / BROKER / SYSTEM`

‏אלה נשארים בבעלות Risk/Safety/Execution layers, אך ה־Negative Decision Context צריך לשאת את Evidence:

```text
RISK_BLOCKED
BROKER_STATE_UNKNOWN
PENDING_EXPOSURE_UNRESOLVED
SYSTEM_EXIT_ONLY
ACCOUNT_STATE_UNKNOWN
```

### ‏4.11 `REGIME / CONTEXT`

```text
MARKET_WIDE_SPREAD_EXPANSION
SECTOR_CONTEXT_DETERIORATION
FAST_MARKET_CONTEXT
FEED_DEGRADATION_CONTEXT
```

‏Context rules ייכנסו רק לאחר Validation.

---

## ‏5. Negative Memory

### ‏`P1 — Preferred Default`: Negative Memory היא Event History, לא Boolean

‏לכל Evidence event נשמור:

```text
EvidenceId
Symbol
ReasonCode
Category
DetectedAt
SourceEventTime
ConfirmedAt
Severity
Confidence
Value
Threshold
InitialWeight
TTL
ExpiresAt
ResetCondition
PersistenceClass
EvidenceVersion
Source
DataGeneration
```

### ‏Evidence Persistence Classes

```text
EPHEMERAL
RECOVERABLE
DURABLE
STATE_BOUND
```

‏דוגמאות:

```text
short rank churn
→ EPHEMERAL

recent failed breakout with 2m relevance
→ RECOVERABLE

manual/system safety condition
→ DURABLE / STATE_BOUND
```

### ‏Restart אינו מוחק Memory בלי Contract

‏אם Rule תלוי באירוע שעדיין רלוונטי אחרי Restart, restart לא רשאי להפוך אותו ל־CLEAR במקרה.

‏לכן:

```text
memory persistence policy
```

‏היא חלק מה־Rule definition.

---

## ‏6. TTL, Decay ו־Reset

### ‏לא כל Evidence מקבל TTL

‏חלק מה־states תקפים עד Transition אמין:

```text
TRADING_HALTED
DATA_GAPPED
EXECUTION_STATE_UNKNOWN
```

‏הם לא פגים רק משום שעברו `X` שניות.

### ‏Behavioral Memory יכולה להשתמש ב־TTL/Decay

‏אפשרויות מחקר:

```text
STEP_TTL
LINEAR_DECAY
EXPONENTIAL_DECAY
EVENT_BASED_RESET
HYBRID
```

‏אבל אין threshold/TTL אוניברסלי.

### ‏Event-Based Reset עדיף לעיתים על Timer

‏לדוגמה:

```text
FAILED_BREAKOUT
```

‏יכול להישאר פעיל עד:

```text
fresh base established
new local high with confirmation
new liquidity regime
new data generation / regime event
```

‏במקום:

```text
wait exactly 20 seconds
```

### ‏Cooldown expiry אינו Pass

```text
CooldownExpired
→ full revalidation
→ maybe CLEAR / PENALIZED / HARD_VETO / UNKNOWN
```

‏אין מעבר אוטומטי ל־Eligible.

### ‏Hysteresis נגד Flapping

‏כאשר Rule מבוסס threshold רציף:

```text
enter condition at A
clear condition at B
```

‏כאשר:

```text
B provides sufficient hysteresis from A
```

‏המספרים עצמם חייבים Validation.

---

## ‏7. Detection נפרד מ־Policy

‏ה־Detector צריך לומר מה קרה.

‏ה־Policy צריכה לומר מה לעשות עם זה.

‏דוגמה:

```text
Detection:
spread_shock_detected = true
severity = HIGH
confidence = HIGH

Policy:
if strategy_horizon = SHORT
and regime = FAST
then COOLDOWN
```

‏ההפרדה מאפשרת:

- ‏Replay של Policy אחרת על אותם Events.
- ‏Shadow rules.
- ‏Ablation.
- ‏Versioning.
- ‏פחות coupling בין Detection ל־Decision.

---

## ‏8. Severity, Confidence ו־Action

### ‏Severity

```text
INFO
LOW
MEDIUM
HIGH
CRITICAL
```

‏Severity אינה Action.

### ‏Confidence

```text
KNOWN
HIGH_CONFIDENCE_INFERENCE
INFERRED
WEAK_INFERENCE
UNKNOWN
```

‏Official trading status אינו שקול ל־Hidden-liquidity inference.

### ‏Action

```text
NONE
WARN
PENALIZE
COOLDOWN
HARD_VETO
BLOCK_NEW_ENTRIES
```

‏ה־mapping הוא Policy versioned.

---

## ‏9. Veto State Machine

‏Baseline state:

```text
CLEAR
PENALIZED
COOLDOWN
HARD_VETO
UNKNOWN
```

‏Transitions מגיעים מ־Evidence events ו־Policy versioned.

‏דוגמאות:

```text
CLEAR
→ spread shock detected
→ PENALIZED

PENALIZED
→ deterioration crosses validated hard boundary
→ HARD_VETO

COOLDOWN
→ expiry/reset event
→ REVALIDATE
→ CLEAR/PENALIZED/HARD_VETO/UNKNOWN
```

‏כל Transition נשמר ב־Event Journal.

---

## ‏10. Event Journal

‏נשמור לפחות:

```text
EvidenceDetected
VetoActivated
PenaltyActivated
PenaltyChanged
CooldownStarted
CooldownExtended
CooldownExpired
VetoCleared
EvidenceExpired
EvidenceReset
PolicyReevaluated
```

‏כל Event יכלול:

```text
decision_id if applicable
symbol
reason_code
policy_version
evidence_version
prior_state
new_state
timestamp
source evidence ids
```

---

## ‏11. Pre-Rank / Post-Rank / Pre-Submit

### ‏11.1 Pre-Rank Eligibility Vetoes

‏זולים ודטרמיניסטיים ככל האפשר:

```text
invalid critical data
trading status invalid/unknown
unsupported state
minimum baseline liquidity failure
system/broker/risk hard block
```

‏המטרה היא לא לבזבז Deep Compute על Candidate שאינה actionable.

### ‏11.2 Post-Rank Negative Pass

‏רק ל־Top-N:

```text
recent negative memory
rank instability
score compression
recent toxic markout
spread shock memory
liquidity withdrawal memory
context mismatch
edge decay
```

### ‏11.3 Pre-Submit Vetoes

‏הם חייבים להיות מהירים:

```text
freshness
status
spread/depth
signal age
rank drift
remaining edge
pending exposure
risk/safety state
```

‏הם revalidation של state נוכחי, לא rerun מלא של כל המחקר.

---

## ‏12. Fast Negative Path / Deep Negative Path

### ‏Whole-Universe Fast Path

```text
data validity
status
basic liquidity
signal age
feature readiness
```

### ‏Top-N Deep Path

```text
negative episode memory
toxic fill history
rank churn
score compression
complex microstructure context
context/regime evidence
```

‏כך Negative Engine עצמו אינו הופך לצוואר בקבוק בזמן Burst.

---

## ‏13. Remaining Edge Gate

‏ה־Decision הכלכלי הסופי יכול להשתמש ב־:

```text
RemainingNetEdge
=
PredictedEdgeAfterDecay
- ExplicitCosts
- SpreadAndSlippage
- ExpectedImpact
- ExpectedAdverseSelection
- OtherExecutionCosts
- RequiredSafetyMargin
```

‏אם:

```text
RemainingNetEdge <= RequiredMinimum
```

‏זה Candidate ל־Hard Economic Veto.

‏`RemainingNetEdge` חייב להיות versioned/confidence-aware; הוא אינו מספר “אמת” ללא model context.

---

## ‏14. Feature מול Penalty מול Veto

‏אותו signal שלילי יכול להיכנס למערכת בשלוש דרכים.

### ‏Feature

```text
smooth probabilistic relationship
→ contributes gradually to positive/negative score
```

### ‏Penalty

```text
condition raises risk/cost
but does not structurally invalidate opportunity
```

### ‏Veto

```text
condition invalidates state
or
strongly destroys executability/economics
```

‏אין להפוך Feature רציף ל־Hard Threshold רק כי קל לכתוב `if`.

---

## ‏15. Safety Veto מול Trading Veto מול Research Penalty

‏נשמור שלוש בעלויות:

```text
SAFETY_VETO
TRADING_VETO
RESEARCH_PENALTY
```

### ‏Safety Veto

‏דטרמיניסטי/חזק יחסית:

```text
critical unknown state
unreconciled execution state
system mode blocks new risk
```

### ‏Trading Veto

‏Hypothesis כלכלי עם Evidence חזק יחסית:

```text
remaining edge non-positive
validated exit infeasibility
```

### ‏Research Penalty

‏Shadow-first:

```text
recent giveback
rank churn
failed breakout
spread shock memory
```

---

## ‏16. Veto Overfitting

‏ה־anti-pattern המרכזי:

```text
losing trade
→ invent rule
→ backtest improves
→ add rule
→ repeat
```

‏זה Parameter Hunting בינארי.

‏לכן:

```text
RCA
→ hypothesis
→ pre-registration
→ controlled experiment
→ OOS
→ shadow
→ decision-impact review
→ promotion/rejection
```

‏ולא:

```text
RCA
→ production veto
```

---

## ‏17. Pre-Registration Lite לכל Behavioral Rule

‏לפני תוצאה סופית נשמור:

```text
rule_id
hypothesis
observable trigger definition
reason_code
category
candidate scope
hard/soft/cooldown hypothesis
threshold family
TTL/reset family
primary metric
guardrails
validation windows
promotion criteria
rejection criteria
```

‏כך Rule אינו משתנה רטרואקטיבית עד שהוא “עובד”.

---

## ‏18. Point-in-Time Correctness

‏Negative Evidence חייב להיות observable בזמן ההחלטה.

‏אסור להשתמש ב־:

```text
future correction
future markout
future price reversal
future episode completion
final session label
```

‏לפני הזמן שבו הם נהיו ידועים.

### ‏Episode Boundaries

‏ל־behavioral episodes נשמור:

```text
EpisodeStart
EpisodeConfirmedAt
EpisodeEnd
```

‏Rule רשאי לפעול רק מ־`EpisodeConfirmedAt` ואילך.

‏דוגמה:

```text
failed breakout
```

‏אינו קיים בזמן breakout; הוא קיים רק כאשר Failure condition נעשתה observable.

---

## ‏19. Decision Impact / False Veto / Opportunity Cost

### ‏Decision Impact Rate

```text
DecisionImpactRate
=
DecisionsChangedByRule / EligibleDecisions
```

### ‏Avoided Bad Trades

```text
avoided_bad_trades
avoided_negative_net_edge
```

### ‏Blocked Good Trades

```text
blocked_good_trades
missed_winner_rate
missed_positive_net_edge
```

### ‏Net Value of Veto

```text
NetVetoValue
=
AvoidedNegativeOutcome
- MissedPositiveOutcome
- Complexity / latency cost
```

‏המספר המדויק תלוי Counterfactual fidelity; confidence נשמר.

### ‏Win Rate אינו KPI מספיק

‏Rule יכול להעלות Win Rate ולמחוק את Total Edge.

‏Primary metric צריך להיות Economic:

```text
incremental net executable outcome
```

---

## ‏20. Veto Precision ו־False Veto

‏מדד Diagnostic אפשרי:

```text
VetoPrecision
=
EconomicallyBadOutcomesAmongVetoed
/
AllVetoed
```

‏אבל `BadOutcome` חייב להיות מוגדר point-in-time וכלכלית.

‏`FalseVeto` הוא מקרה שבו Rule חסם opportunity שהייתה חיובית לפי contract המחקרי.

‏False Veto אינו Side Metric; הוא חלק מרכזי מה־Evaluation.

---

## ‏21. Fallback Candidate

‏כאשר #1 נפסל מסיבה Candidate-local:

```text
#2 may be evaluated
```

‏אבל:

```text
#2 is not inherited decision
```

‏הוא מקבל:

```text
new as_of
freshness check
veto evaluation
execution feasibility
risk/safety
remaining edge
```

‏נמדוד גם:

```text
fallback_frequency
fallback_net_outcome
fallback_vs_no_trade
fallback_vs_original_candidate_counterfactual
```

---

## ‏22. Negative Memory Patterns למחקר

### ‏22.1 Failed Breakout Memory

```text
breakout trigger
→ no continuation
→ observable retrace
→ episode confirmed
→ temporary negative memory candidate
```

### ‏22.2 Giveback Memory

```text
small fast gain
→ rapid giveback
```

‏נבדוק האם episodes חוזרים מנבאים follow-through חלש.

### ‏22.3 Toxic Fill Memory

```text
recent fills
→ negative side-aware markout
```

‏נבדוק אם toxicity מקומית נמשכת מספיק זמן כדי להיות actionable.

### ‏22.4 Spread Shock Memory

```text
spread expands materially
→ partially normalizes
→ residual uncertainty
```

### ‏22.5 Liquidity Withdrawal Memory

```text
depth disappears
→ book later looks normal
→ does withdrawal remain predictive?
```

### ‏22.6 Rank Churn Memory

```text
#1 → #14 → #2 → #20 → #1
```

‏ברירת המחדל: Penalty/diagnostic, לא Hard Veto.

### ‏22.7 Score Compression

```text
#1 ≈ #2 ≈ #3
```

‏יכול להוריד confidence; `NO_TRADE` רק אם Validation מצדיק.

---

## ‏23. Cross-Sectional Negative Evidence

‏Negative Engine לא בוחן רק Candidate בודד.

‏נמדוד:

```text
freshness mismatch
coverage degradation
rank distribution compression
market-wide spread expansion
partition/backpressure bias
context concentration
```

‏Candidate fresh מתוך Universe stale יכולה להיות winner מזויף.

---

## ‏24. Veto Concentration

‏ננטר:

```text
% candidates hard-vetoed
% penalized
% cooled down
% decisions changed
```

‏אם Rule אחד פוסל 80% מה־Universe:

‏צריך RCA.

‏זה יכול להיות:

```text
bad threshold
data bug
regime change
fundamental validity rule
```

‏לא מניחים שזה improvement.

### ‏Symbol Concentration

‏אם Rule פוגע שוב ושוב באותם Symbols, ייתכן שהוא צריך להפוך ל־Universe/Eligibility rule במקום Dynamic Veto.

---

## ‏25. NO_TRADE Frequency ו־Opportunity Rate

‏יותר `NO_TRADE` אינו בהכרח טוב יותר.

‏נמדוד:

```text
no_trade_rate
actionable_opportunities_per_hour
net_edge_per_opportunity
net_edge_per_unit_time
```

‏ונשאל:

```text
Did selectivity improve quality?
Or did the engine become afraid of the opportunity set?
```

---

## ‏26. Effective Sample Size

‏יותר Vetoes מורידים Sample Size.

‏לכן כל Experiment שומר:

```text
eligible_count
vetoed_count
acted_count
effective_sample_size
```

‏Rule שנראה מצוין על מעט מאוד Events אינו מקבל Confidence גבוה אוטומטית.

---

## ‏27. Multiple Testing

‏אם ננסה 100 Rules ונשמור 3 winners, קיבלנו `Winner's Curse` מחקרי.

‏לכן:

- ‏Trial count נשמר.
- ‏Rule families מוגדרות מראש.
- ‏OOS נפרד נשמר.
- ‏Promotion אינו מתבסס על best in-sample variant.
- ‏Threshold × TTL × Regime נבדק כ־Sensitivity Surface.

‏מחפשים:

```text
stable region
```

‏לא:

```text
magic point
```

---

## ‏28. Champion / Challenger

### ‏Champion

```text
current decision policy
+ baseline validity/economic hard vetoes
```

### ‏Challenger

```text
Champion
+ exactly one new veto family or clearly defined bundle
```

‏כל comparison נעשה על אותם Episodes.

‏נשמור:

```text
decision diff
net outcome diff
false vetoes
missed winners
latency cost
rule interactions
```

---

## ‏29. Ablation

‏אם קיימים Rules:

```text
V1 V2 V3 V4
```

‏נריץ:

```text
all
all - V1
all - V2
all - V3
all - V4
```

‏כדי לגלות:

- ‏Rule redundant.
- ‏Rule harmful.
- ‏Rules correlated.
- ‏Rule useful only through interaction.

---

## ‏30. Interaction Effects

‏דוגמה:

```text
SPREAD_SHOCK
LIQUIDITY_WITHDRAWAL
```

‏עשויים לתפוס כמעט אותו Episode.

‏אין לתת לשניהם “קרדיט” עצמאי ללא Analysis.

‏נשמור:

```text
first_veto
all_vetoes
unique_contribution
joint_contribution
```

---

## ‏31. Complexity Budget

‏לכל Rule חדש נשאל:

```text
Does it materially change decisions?
Does it improve incremental net outcome?
Is it explainable?
Can it be replayed deterministically?
Can it be monitored live?
Can it be removed safely?
What state does it add?
What latency does it add?
```

‏אפשר להחזיק:

```text
max_active_research_vetoes
```

‏כדי למנוע Rule Explosion.

---

## ‏32. Interaction עם Score / Calibration

‏Veto Engine משנה את distribution של Candidates שמגיעים ל־Decision/Execution.

‏לכן אחרי Promotion משמעותי נבדוק מחדש:

```text
score calibration
rank outcome distribution
fill distribution
markout distribution
cost distribution
```

‏אין להניח שמודל שכיילנו לפני Vetoes נשאר calibrated.

---

## ‏33. Interaction עם Position Sizing

‏Penalty עשויה בעתיד להשפיע על Size:

```text
reduce size under negative context
```

‏אבל זו אינה Baseline recommendation.

‏היא Experiment נפרד שחייב לעבור Validation.

‏Risk Engine נשאר authority על Exposure.

---

## ‏34. Interaction עם Order Tactic

‏Negative Evidence יכול אולי לשנות Execution Mode במקום לפסול Candidate.

‏דוגמה מחקרית:

```text
moderate adverse-selection risk
→ less passive waiting
```

‏זו Challenger hypothesis.

‏ה־Veto Engine אינו שולח Order ואינו בוחר Broker primitive לבדו.

---

## ‏35. Entry Veto מול Exit Urgency

‏חובה להפריד:

```text
EntryEligibility
ExitUrgency
```

‏אפשר:

```text
EntryEligibility = BLOCKED
ExitUrgency = NORMAL
```

‏או:

```text
EntryEligibility = ALLOWED
ExitUrgency = HIGH
```

‏Negative Evidence שמונע Entry אינו Stop rule אוטומטי.

‏Negative Evidence על Position פעיל חייב להגיע ל־Position Monitor בעדיפות גבוהה.

---

## ‏36. Position-Specific Priority

‏בעת עומס:

```text
Active Position Negative Evidence
>
Top-N Candidate Negative Evidence
>
Whole-Universe Research Negative Evidence
```

‏Exit-liquidity collapse או Safety state של Position פעיל אינם מחכים לסריקה עמוקה של כל ה־Universe.

---

## ‏37. Decision Aggregator Contract

‏Input:

```text
CandidateSnapshot
PositiveScoreContext
RankContext
NegativeDecisionContext
ExecutionAssessment
RiskState
SafetyState
```

‏Output:

```text
TRADE_CANDIDATE
NO_TRADE
BLOCK_NEW_ENTRIES
```

‏עם:

```text
primary_reason
all_reason_codes
policy_version
as_of
confidence
```

‏Baseline evaluation order:

```text
1. Validity / Safety
2. Cheap Eligibility
3. Positive Rank
4. Deep Negative Evidence
5. Execution Feasibility
6. Risk
7. Final Revalidation
8. Decision
```

---

## ‏38. NegativeDecisionContext Contract

```text
NegativeDecisionContext
- candidate_id
- symbol
- as_of
- data_generation
- hard_vetoes[]
- soft_penalties[]
- cooldowns[]
- warnings[]
- unknown_rules[]
- negative_context_vector
- effective_until
- next_required_revalidation
- policy_version
- evidence_version
- confidence
```

‏`hard_vetoes[]` ו־`cooldowns[]` אינם Boolean יחיד כדי לא לאבד Attribution.

---

## ‏39. EvidenceRecord Contract

```text
EvidenceRecord
- evidence_id
- symbol
- reason_code
- category
- detected_at
- source_event_time
- confirmed_at
- severity
- confidence
- value
- threshold
- ttl
- expires_at
- reset_condition
- persistence_class
- evidence_version
- source
- data_generation
- provenance
```

‏ה־Record צריך להיות reproducible ב־Replay ככל האפשר.

---

## ‏40. Negative Context Vector

‏לצורכי Diagnostics/Research אפשר לשמור:

```text
data_risk
liquidity_risk
execution_risk
signal_decay_risk
recent_behavior_risk
context_risk
```

‏אין חובה לאגד אותם ל־Score אחד.

‏המטרה היא Explainability, segmentation ו־research.

---

## ‏41. Reason Codes

‏Baseline taxonomy:

```text
VETO_DATA_STALE
VETO_DATA_GAP
VETO_DATA_UNTRUSTWORTHY
VETO_STATUS_INVALID
VETO_SIGNAL_EXPIRED
VETO_EXIT_NOT_FEASIBLE
VETO_REMAINING_EDGE_NEGATIVE
VETO_EXECUTION_STATE_UNKNOWN
VETO_CONTEXT_INVALID
VETO_UNKNOWN_STATE

PENALTY_RANK_CHURN
PENALTY_SCORE_COMPRESSION
PENALTY_RECENT_GIVEBACK
PENALTY_SPREAD_SHOCK
PENALTY_TOXIC_MARKOUT
PENALTY_LIQUIDITY_WITHDRAWAL

COOLDOWN_FAILED_BREAKOUT
COOLDOWN_LIQUIDITY_WITHDRAWAL
COOLDOWN_SPREAD_SHOCK
```

‏כל Reason Code מקבל Definition ו־Version, לא רק string.

---

## ‏42. Metrics

### ‏Primary Economic Metrics

```text
incremental_net_executable_outcome
net_edge_delta_vs_champion
missed_positive_net_edge
avoided_negative_net_edge
```

### ‏Decision Metrics

```text
veto_count_by_reason
penalty_count_by_reason
cooldown_count_by_reason
veto_rate
penalty_rate
cooldown_rate
decision_impact_rate
fallback_candidate_rate
no_trade_rate
```

### ‏Quality Metrics

```text
false_veto_estimate
missed_winner_rate
avoided_bad_trade_rate
veto_precision
unknown_rule_rate
```

### ‏State Metrics

```text
veto_duration
cooldown_duration
cooldown_inventory
rules_active_per_candidate
```

### ‏Drift Metrics

```text
rule_frequency_drift
economic_impact_drift
false_veto_drift
regime_drift
```

### ‏Operational Metrics

```text
negative_path_latency_p50
negative_path_latency_p95
negative_path_latency_p99
fast_path_queue_age
deep_path_queue_age
```

---

## ‏43. Monitoring / Alerts

‏Dashboard בסיסי:

```text
Top veto reasons
Veto rate over time
Penalty rate over time
Cooldown inventory
Decision impact rate
Missed winner estimate
Net edge delta
Rule drift
Unknown-rule rate
```

### ‏Veto Explosion Alert

```text
veto rate suddenly spikes
```

‏דורש RCA; ייתכן Data bug או threshold problem.

### ‏Veto Silence Alert

‏Rule שהיה פעיל באופן סביר ונעלם לחלוטין יכול להעיד ש־Detection path נשבר.

---

## ‏44. Failure Modes

```text
NE_VETO_OVERFIT
NE_FALSE_VETO_HIGH
NE_RULE_EXPLOSION
NE_RULE_REDUNDANCY
NE_THRESHOLD_FRAGILE
NE_TTL_FRAGILE
NE_COOLDOWN_FLAPPING
NE_COOLDOWN_SELF_LOCKOUT
NE_MEMORY_NOT_PERSISTED
NE_MEMORY_STALE_AFTER_REGIME_CHANGE
NE_FUTURE_LEAKAGE
NE_EPISODE_CONFIRMED_TOO_EARLY
NE_UNKNOWN_TREATED_FALSE
NE_GLOBAL_VETO_TREATED_LOCAL
NE_FALLBACK_NOT_REVALIDATED
NE_VETO_HIDES_DATA_BUG
NE_VETO_HIDES_WEAK_ALPHA
NE_SAMPLE_SIZE_COLLAPSE
NE_MULTIPLE_TESTING
NE_VETO_DRIFT
NE_NEGATIVE_PATH_LATENCY
NE_REASON_CODE_MISSING
NE_POLICY_DETECTION_COUPLED
NE_CONFIG_DRIFT
NE_RESTART_STATE_LOSS
NE_DUPLICATE_EVIDENCE_DOUBLE_PENALTY
NE_OUT_OF_ORDER_REACTIVATION
NE_ENTRY_EXIT_COUPLED
NE_UNKNOWN
```

---

## ‏45. RCA

‏כאשר Candidate נכשל נבדוק:

```text
Was negative evidence already observable but ignored?
```

‏אם כן:

```text
RCA finding
→ hypothesis
```

‏לא:

```text
RCA finding
→ immediate veto
```

‏כאשר Veto עצמו נכשל:

```text
First Divergence
```

‏יכול להיות:

```text
wrong detection
wrong timing
wrong confidence
wrong policy action
wrong TTL/reset
wrong scope
counterfactual assumption wrong
```

---

## ‏46. Avoided Loser Review / Missed Winner Review

‏כל Rule מהותי יקבל שתי ביקורות סימטריות.

### ‏Avoided Loser Review

```text
Which bad candidates did this rule correctly block?
```

### ‏Missed Winner Review

```text
Which strong opportunities did this rule incorrectly block?
```

‏Rule שמקבל רק “סיפורי הצלחה” של avoided losers אינו מספיק למחקר רציני.

---

## ‏47. Use When

‏ה־Negative Engine מתאים כאשר:

- ‏קיימת כבר Positive Ranking/Selection pipeline ברורה.
- ‏יש Evidence quality מספיק כדי לנסח Reason Codes בזמן אמת.
- ‏יש Replay/Shadow שמאפשר Counterfactual decision analysis.
- ‏ניתן לשמור `NO_TRADE` ו־vetoed candidates כחלק מה־dataset.
- ‏יש יכולת למדוד Missed Winners ולא רק Avoided Losses.
- ‏יש Versioning ל־Rules/Config.

---

## ‏48. Do Not Use When

‏לא להפוך אותו למרכז המערכת כאשר:

- ‏אין Core predictive edge בסיסי.
- ‏Data quality עצמה עדיין לא trustworthy.
- ‏אין point-in-time replay.
- ‏אין יכולת להסביר why a rule fired.
- ‏אין OOS sample מספיק.
- ‏מנסים “לתקן” כל Trade מפסיד.
- ‏המערכת כבר עמוסה בעשרות filters בלי Ownership ברור.

‏Veto Engine אינו תחליף ל־Strategy.

---

## ‏49. Alternatives

### ‏Alternative A — הכול בתוך Score

‏יתרון:

```text
simple single ranking value
```

‏חסרון:

```text
invalid/safety states become compensable
reason semantics disappear
hard to audit
```

‏לא Baseline.

### ‏Alternative B — Hard Filters בלבד

‏יתרון:

```text
simple and deterministic
```

‏חסרון:

```text
continuous/probabilistic negative evidence becomes brittle thresholds
```

‏מתאים רק ל־Validity/Safety boundaries.

### ‏Alternative C — Learned Veto Model

‏אפשר בעתיד להעריך:

```text
P(candidate becomes economically bad | negative context)
```

‏אבל זה:

```text
P3/P4 Challenger
```

‏בגלל Explainability, Calibration ו־Overfitting risk.

---

## ‏50. Trade-offs

### ‏יותר Selectivity

‏יתרון אפשרי:

```text
fewer bad actions
```

‏מחיר:

```text
fewer samples
missed winners
lower opportunity rate
```

### ‏יותר Memory

‏יתרון:

```text
context persistence
```

‏מחיר:

```text
state complexity
restart/replay burden
self-lockout risk
```

### ‏יותר Rules

‏יתרון:

```text
more failure patterns can be expressed
```

‏מחיר:

```text
multiple testing
interaction explosion
fragility
```

---

## ‏51. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏עשרות Behavioral Vetoes.
- ‏per-symbol TTLs.
- ‏adaptive learned cooldowns.
- ‏ML veto classifier.
- ‏automatic size changes from penalties.
- ‏automatic order-tactic switching from every penalty.
- ‏cross-symbol graph of negative memory.
- ‏rules שנולדו מ־single bad trade.
- ‏Vetoes שקשה לשחזר ב־Replay.
- ‏Boolean אחד בשם `isBadCandidate`.

---

## ‏52. What to Add Later

‏רק לאחר Evidence:

```text
validated behavioral cooldowns
regime-conditioned rules
adaptive but bounded TTLs
toxicity-conditioned execution mode
size challenger based on negative context
learned veto probability
cross-symbol/sector context
rule-family ensemble with attribution
```

---

## ‏53. Required Data / Evidence

‏ל־Baseline:

```text
point-in-time data quality
trading status
signal age / TTL
rank history
spread/depth
exit feasibility
execution assessment
remaining edge
risk/safety state
```

‏ל־Behavioral Memory:

```text
episode timestamps
recent rank history
recent price path
recent fill markouts
recent spread/depth path
reason-code events
```

‏ל־Counterfactual evaluation:

```text
actual decision
shadow veto decision
forward outcome
execution model / real fill context
counterfactual confidence
```

---

## ‏54. Promotion Criteria

‏Rule חדש מתקדם רק אם:

- ‏ה־trigger observable בזמן אמת.
- ‏אין Leakage.
- ‏Reason Code ברור.
- ‏TTL/Reset semantics מפורשים.
- ‏Decision Impact אינו זניח.
- ‏Incremental net executable outcome משתפר OOS.
- ‏Missed Winners נשארים בתוך guardrail.
- ‏False Veto rate מתקבל.
- ‏התוצאה יציבה לאורך regimes רלוונטיים.
- ‏Sensitivity surface אינה נקודת קסם.
- ‏Rule אינו redundant עם Rules אחרים.
- ‏Latency/complexity cost מתקבל.
- ‏Replay deterministic.
- ‏Shadow/Paper behavior תואם מספיק למחקר.

---

## ‏55. Rejection Criteria

‏נזרוק/נשאיר Rule ב־Research אם:

- ‏הוא עובד רק in-sample.
- ‏הוא נולד מ־Trade בודד.
- ‏Threshold קטן משנה הכול.
- ‏TTL קטן משנה הכול.
- ‏הוא חוסם יותר Net Edge משהוא מציל.
- ‏הוא מעלה Win Rate אך מוריד net outcome.
- ‏הוא מוחק Sample Size.
- ‏הוא מגדיל `NO_TRADE` בלי value.
- ‏הוא redundant.
- ‏הוא מוסיף latency משמעותי.
- ‏אי אפשר להסביר או לשחזר אותו.
- ‏הוא מסתיר bug upstream במקום לתקן אותו.
- ‏הוא תלוי ב־future knowledge.

---

## ‏56. Tests

### ‏Unit Tests

```text
rule detection
severity mapping
confidence mapping
TTL activation/expiry
reset condition
reason code
scope
```

### ‏Property Tests

```text
invalid critical data => cannot create new entry risk
expired signal => cannot create new entry risk
unknown critical validity => cannot silently pass
candidate-local veto does not become market-wide block
market-wide block cannot be bypassed by fallback candidate
duplicate evidence cannot double-penalize
same state + same versions => same negative decision context
```

### ‏TTL / Reset Tests

```text
activation
expiry
state-based reset
regime reset
restart restore
full revalidation after expiry
```

### ‏Ordering Tests

```text
out-of-order evidence
late event
older clear after newer veto
older veto after newer clear
```

‏Event ordering אינו רשאי להחזיר State לא נכון בשקט.

### ‏Replay Tests

```text
same replay
→ same veto transitions
→ same reason codes
→ same final decisions
```

### ‏Counterfactual Tests

```text
with negative engine
vs
without negative engine
```

‏Decision-by-decision, לא רק Aggregate PnL.

### ‏Burst / Load Tests

‏ב־whole-market burst:

```text
Fast Negative Path remains fresh
Position path is not starved
Deep negative analysis can degrade before safety/validity gates
```

### ‏Failure Injection

```text
stale quote
sequence gap
spread explosion
liquidity disappearance
latency spike
rank churn
broker degradation
provider reconnect
```

---

## ‏57. Golden Scenarios

```text
G60A-01 high score + stale quote
G60A-02 high score + global fresh-coverage collapse
G60A-03 candidate-local spread shock + valid #2 fallback
G60A-04 market-wide veto + #2 must not bypass
G60A-05 signal expires between rank and submit
G60A-06 remaining edge crosses below zero
G60A-07 failed breakout starts cooldown only when episode observable
G60A-08 cooldown expires but revalidation still fails
G60A-09 rank churn produces penalty but not hard veto
G60A-10 toxic recent fills shadow-veto candidate
G60A-11 duplicate negative event does not double penalty
G60A-12 restart restores durable memory
G60A-13 regime transition clears only configured memories
G60A-14 behavioral rule blocks strong winner
G60A-15 rule correctly avoids bad candidate
G60A-16 veto explosion caused by data bug
G60A-17 veto silence caused by detector break
G60A-18 #1 vetoed; #2 revalidated at current time
G60A-19 entry blocked while exit urgency remains independent
G60A-20 unknown experimental rule does not silently become hard block
```

---

## ‏58. Invariants

```text
High score never overrides a non-compensable veto.
Unknown critical validity never silently becomes pass.
Candidate-local veto cannot masquerade as global block.
Global block cannot be bypassed by candidate fallback.
Cooldown expiry never implies automatic eligibility.
Duplicate evidence cannot multiply penalty unless explicitly modeled.
Older evidence cannot silently overwrite newer state.
Behavioral veto cannot use future outcome before observable confirmation.
Restart cannot silently erase durable active negative memory.
Same frozen inputs + same versions => same NegativeDecisionContext.
Entry veto does not automatically imply exit action.
Risk Engine remains authority over exposure.
Veto Engine never sends broker side effects.
```

---

## ‏59. User-Specific Application

‏לרובוט שלנו, שמחפש momentum קצר על Universe רחב, הסכנה המרכזית היא לא רק לבחור Candidate חלשה.

‏הסכנה היא לבחור Candidate שנראית חזקה לפי Positive Score בזמן שבו:

```text
its evidence is stale
its competitors are stale
its execution context deteriorated
its recent behavior suggests poor follow-through
its remaining edge was already consumed by time/cost
```

‏לכן ה־Baseline המעשי למחקר:

```text
Whole Universe
→ cheap validity / safety negative path
→ positive ranking
→ Top-N
→ deep negative evidence pass
→ execution feasibility
→ risk
→ pre-submit revalidation
→ TRADE_CANDIDATE / NO_TRADE
```

‏לא נכניס Behavioral Vetoes למסלול blocking לפני שהוכיחו incremental OOS value.

---

## ‏60. Recommended Research Order

```text
Stage 1
Validity / Safety Hard Vetoes only

Stage 2
Shadow behavioral detections

Stage 3
Counterfactual decision analysis

Stage 4
OOS + ablation + sensitivity

Stage 5
One promoted behavioral policy at a time

Stage 6
Monitor drift / false veto / missed winners
```

‏כך אפשר לדעת איזה Rule באמת הוסיף value.

---

## ‏61. Recommended MVP

```text
Hard Vetoes:
- DATA_NOT_TRUSTWORTHY
- TRADING_STATUS_NOT_ACTIONABLE
- SIGNAL_EXPIRED
- EXIT_NOT_FEASIBLE
- REMAINING_NET_EDGE_NOT_POSITIVE

Shadow Detections:
- RANK_CHURN
- SCORE_COMPRESSION
- RECENT_GIVEBACK
- FAILED_BREAKOUT
- SPREAD_SHOCK
- TOXIC_MARKOUT

State:
- reason codes
- evidence records
- TTL/reset
- policy version
- deterministic replay

Metrics:
- decision impact
- avoided bad trades
- blocked good trades
- net veto value
```

---

## ‏62. Confidence

### ‏High Confidence

‏ב־:

- ‏הצורך להפריד Hard Validity/Safety from Score.
- ‏הצורך ב־Unknown explicit.
- ‏הצורך ב־Reason Codes, Versioning ו־point-in-time correctness.
- ‏הצורך ב־Shadow/OOS עבור behavioral rules.
- ‏הצורך למדוד false veto/missed winners.
- ‏הצורך ב־revalidation אחרי cooldown/fallback.

### ‏Medium Confidence

‏בכך ש־Recent Behavioral Memory תוסיף value משמעותי לרובוט שלנו.

‏זו Hypothesis שדורשת Data.

### ‏Low / Unknown Confidence

‏ב־:

```text
exact TTLs
exact thresholds
exact penalty weights
exact regime-specific policies
learned veto model value
```

‏אלה ייקבעו רק במחקר.

---

## ‏63. Time-Sensitive Facts

‏מקטע 60A הוא בעיקר מתודולוגי ואינו מקבע capability, fee, regulatory threshold או Broker/Venue rule תלוי־זמן.

‏לכן לא נדרש Web verification חדש למקטע זה.

‏כאשר Veto מסתמך בעתיד על:

```text
broker capability
venue status semantics
provider condition code
market status field
session/auction semantics
```

‏ה־Fact החיצוני ייבדק מול תיעוד רשמי עדכני לפני שימוש תפעולי.

---

## ‏64. Relationship to Earlier Sheets

### ‏12 — Filters Before Ranking

‏12 נשאר Source of Truth ל־cheap hard filters לפני Ranking.

‏60A מוסיף:

```text
post-rank negative evidence
negative memory
cooldowns
shadow behavioral veto research
```

### ‏15 — Trade / No Trade

‏15 נשאר Source of Truth ל־Decision Engine.

‏60A מספק לו:

```text
NegativeDecisionContext
```

### ‏26 — RCA

‏26 נשאר Source of Truth ל־First Divergence ול־:

```text
RCA → Hypothesis
```

‏60A אינו מקצר את הדרך ל־Production rule.

### ‏46 — Adverse Selection

‏46 מספק Markout/Toxicity evidence.

‏60A יכול להשתמש בו כ־Shadow Negative Memory, אך Toxic Fill אחד אינו Hard Veto אוטומטי.

### ‏50 — Scanner Best Practices

‏50 נשאר Runtime Scanner architecture.

‏60A מתחבר ל־Fast/Deep funnel בלי להפוך את כל ה־Universe ל־behavioral rule engine כבד.

### ‏60 — Scanner and Ranking Subtleties

‏60 שואל:

```text
Who ranks best and how trustworthy is the ordering?
```

‏60A שואל:

```text
What current negative evidence argues against acting on that candidate?
```

---

## ‏65. Relationship to 61

‏60A עוסק ב־Decision Policy וב־Negative Evidence.

‏61 — `Backtest Subtleties` יצטרך לוודא שה־Backtest אינו נותן ל־Veto Engine יתרון דמיוני באמצעות:

```text
future episode confirmation
future corrections
perfect fill knowledge
perfectly ordered data
unrealistic counterfactuals
clean historical state unavailable live
```

‏כל Behavioral Veto חייב להיות testable תחת אותם point-in-time constraints כמו ה־Positive Strategy.

---

## ‏66. Recommendation Summary

‏ההמלצה הסופית למקטע 60A:

```text
Do not bury negative evidence inside one score.
```

‏במקום זאת:

```text
Positive Rank
+
Negative Decision Context
+
Execution Feasibility
+
Risk / Safety
→ Decision
```

‏ה־Baseline יתחיל מחמישה Hard Vetoes ברורים:

```text
DATA_NOT_TRUSTWORTHY
TRADING_STATUS_NOT_ACTIONABLE
SIGNAL_EXPIRED
EXIT_NOT_FEASIBLE
REMAINING_NET_EDGE_NOT_POSITIVE
```

‏וה־Behavioral layer יתחיל כ־Shadow בלבד:

```text
RANK_CHURN
RECENT_GIVEBACK
FAILED_BREAKOUT
SPREAD_SHOCK_MEMORY
TOXIC_MARKOUT_MEMORY
```

‏Promotion ידרוש:

```text
point-in-time correctness
OOS value
false-veto accounting
missed-winner review
ablation
stable sensitivity
acceptable complexity/latency
replay determinism
```

‏המטרה אינה “לפסול יותר”.

‏המטרה היא שהמערכת תדע להסביר באופן מדיד:

```text
why this candidate is strong
why it may still be wrong to act now
what evidence caused that conclusion
how long the conclusion remains valid
and whether that negative evidence actually improves net executable outcomes
```
