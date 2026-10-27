# ‏53 — Recommendation Sheet: Testing Best Practices

> ‏מקור לימודי עיקרי: `../53-TESTING-BEST-PRACTICES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline לבדיקות של רובוט `Short-Horizon Momentum` כך שהמערכת תוכל להשתנות מהר בלי לאבד correctness, determinism, safety או recoverability; תוך הפרדה בין בדיקות מהירות, integration, replay, fault, performance ו־acceptance, ובלי להפוך את ה־test suite לצוואר בקבוק שמפתחים מפסיקים להריץ.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי ואינו מבטיח רווח.

---

## ‏1. Decision

‏מטרת Testing אצלנו אינה:

```text
maximize line coverage
```

‏אלא:

```text
Critical Behavior Coverage
+ Invariant Coverage
+ Timeline Coverage
+ Failure-Mode Coverage
+ Recovery Coverage
+ Economic Correctness
```

‏המערכת תיבדק לפי מה שעלול לשנות:

```text
market truth
candidate selection
financial exposure
broker side effects
position state
safety state
recovery state
net economic outcome
```

‏העיקרון המחייב:

```text
A test is valuable when it protects a meaningful contract.
```

‏לא כאשר הוא רק מעלה אחוז `coverage`.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Testing Pyramid שמותאם למערכת מסחר

‏ה־Baseline:

```text
Many Fast Unit / Property Tests
        ↓
Component Tests
        ↓
Deterministic Integration Tests
        ↓
Mini Replay / Golden Scenario Tests
        ↓
Large Replay / Fault / Performance Tests
        ↓
Broker Paper / Conformance Tests
        ↓
Small Number of End-to-End Acceptance Tests
```

‏כל behavior ייבדק בשכבה הנמוכה והזולה ביותר שיכולה להוכיח אותו.

‏לא מרימים:

```text
DB + WebSocket + Scanner + Broker + UI
```

‏כדי לבדוק rounding או state transition קטן.

### ‏`P0 — Required`: Fast suite הוא Gate לכל שינוי

‏`Fast` צריך להיות:

```text
deterministic
hermetic
parallel-friendly where isolated
free of real network
free of real broker
free of wall-clock sleeps
small enough to run constantly
```

‏המלצת Baseline לפרויקט שלנו:

```text
Preferred target: ~1–3 minutes
Investigate aggressively: >5 minutes
Architecture RCA required: sustained drift toward 10+ minutes
```

‏אלה יעדי Engineering התחלתיים, לא אמת אוניברסלית.

‏אם ה־suite גדל, קודם מחפשים:

```text
unnecessary integration setup
full-day fixtures used for tiny rules
real sleeps
serial bottlenecks
duplicated tests
heavy shared databases
expensive process startup
```

‏לפני שמקבלים את האיטיות כמצב קבוע.

### ‏`P0 — Required`: Time הוא Dependency מפורש

‏אין להשתמש ב־`DateTime.UtcNow`, ‏`Task.Delay` או `Thread.Sleep` כבסיס ל־correctness של בדיקה.

‏נזריק:

```text
Clock
Scheduler
EvaluationTime
Deadline / TTL context
```

‏ונוכל להזיז זמן דטרמיניסטית.

‏כך נבדוק:

```text
signal TTL
order TTL
cooldown
timeout
recovery delay
stale data
kill windows
reprice cadence
```

‏בלי להמתין לזמן אמיתי.

### ‏`P0 — Required`: ‏`Sleep` אינו Synchronization Strategy

‏אסור Baseline מסוג:

```text
sleep 1 second
hope callback happened
assert
```

‏נשתמש ב־:

```text
explicit signal
TaskCompletionSource
fake clock
virtual scheduler
bounded condition wait
controlled barrier
```

‏אם בדיקה נדרשת ל־real time מסיבה אמיתית, היא אינה שייכת כברירת מחדל ל־Fast suite.

### ‏`P0 — Required`: Invariants לפני Examples

‏Examples חשובים, אבל invariants הם שכבת ההגנה המרכזית.

‏לפחות:

```text
FilledQty <= AuthorizedQty

PotentialExposure
= ActualExposure + PotentiallyLiveExposure

SafetyBlockNewEntries
=> no new entry reaches broker submit

StaleRequiredData
=> no actionable candidate

UNKNOWN_EFFECT
=> no blind duplicate submit

CancelRequested
!= Canceled

Flat
=> Position == 0
   AND no potentially-live exposure
   AND no unresolved execution effect
```

### ‏`P0 — Required`: Property-Based Testing

‏Property tests יבדקו classes של states ולא רק ידנית 3 דוגמאות.

‏דוגמאות:

```text
Duplicate event idempotence
Restart idempotence
No future knowledge
Safety monotonicity
Exposure conservation
Deterministic ranking
No overfill
No duplicate economic effect
```

‏כאשר framework מוצא failure ברצף גדול, נשמור `seed` ונשתמש ב־shrinking כדי לקבל minimal reproducer.

### ‏`P0 — Required`: State Machine Transition Tests

‏כל state machine קריטית מקבלת:

```text
legal transition table
illegal transition table
late-event correction semantics
terminal-state semantics
```

‏לא בודקים רק Happy Path.

‏Execution לדוגמה חייב לכסות לפחות:

```text
CREATED
→ SUBMITTING
→ WORKING
→ PARTIALLY_FILLED
→ FILLED
```

‏וגם:

```text
WORKING
→ CANCEL_REQUESTED
→ PARTIALLY_FILLED
→ CANCELED
```

‏וגם:

```text
SUBMITTING
→ UNKNOWN_EFFECT
→ RECONCILING
→ WORKING / REJECTED / CANCELED / FILLED
```

### ‏`P0 — Required`: Deterministic Replay

‏אותו:

```text
dataset_id
code_version
config_version
feature_version
score_version
execution_model_version
random_seed
```

‏חייב להחזיר אותו semantic decision stream.

‏נשמור אפשרות ל־:

```text
DecisionHash(dataset, versions, config)
```

‏כאשר ה־Hash משתנה, לא מסתפקים ב־red/green.

‏מפיקים Behavioral Diff:

```text
Top1 changes
Top-N changes
TRADE ↔ NO_TRADE flips
entry changes
exit changes
quantity changes
execution-policy changes
```

### ‏`P0 — Required`: שני סוגי Replay

‏נשמור הבחנה בין:

```text
Exchange-Time Replay
As-Received Replay
```

‏`Exchange-Time` שימושי למחקר market/microstructure.

‏`As-Received` משחזר מה המערכת באמת יכלה לדעת בהתחשב ב־arrival timing.

‏לבדיקות Live parity, ‏`As-Received` הוא קריטי.

### ‏`P0 — Required`: Golden Scenarios קטנים ומשמעותיים

‏במקום יום שלם לכל bug, נשמור Mini Replay ממוקד.

‏Baseline corpus:

```text
GS-001 Full fill → exit → flat
GS-002 Partial fill → cancel remainder
GS-003 Cancel/fill race
GS-004 Submit → ACK lost / disconnect
GS-005 Restart with open order + position
GS-006 Stale data candidate rejection
GS-007 Halt during entry
GS-008 Duplicate execution callback
GS-009 Out-of-order broker callbacks
GS-010 Unknown effect → reconciliation
GS-011 Feed gap → data degraded → entry blocked
GS-012 Kill during partial fill
GS-013 Flat position with still-working order
GS-014 Provider failover generation change
GS-015 Top1 tie / deterministic tie-break
GS-016 NO_TRADE due to net-edge failure
```

‏Golden test טוב בודק semantic outcome, לא snapshot ענק שאף אחד אינו קורא.

### ‏`P0 — Required`: Incident-to-Test ו־Near-Miss-to-Test

‏כל incident משמעותי:

```text
Incident
→ RCA
→ Minimal Reproducer
→ Regression Test
→ Similar-Area Search
```

‏גם Near Miss חשוב.

‏אם duplicate submit נחסם בזמן, התרחיש מצטרף ל־corpus גם אם לא נוצר נזק.

### ‏`P0 — Required`: RCA לפני התקדמות לאחר Failure מהותי

‏כאשר CI מחזיר warning/error משמעותי, לא מסתפקים ב־local fix.

‏נדרשת שרשרת:

```text
What happened?
→ Why did it happen?
→ Which invariant was missing or violated?
→ Where else can the same class exist?
→ What design/test improvement prevents recurrence?
→ Add regression coverage
→ only then continue
```

‏זה חל במיוחד על:

```text
dropped events
sequence gaps
unknown-effect retries
reconciliation mismatch
duplicate side effects
performance regression
flaky concurrency failures
```

### ‏`P0 — Required`: Flaky Test הוא Bug

‏אם Test נכשל לסירוגין:

```text
either test is nondeterministic
or system is nondeterministic
```

‏שתיהן דורשות RCA.

‏אסור:

```text
fail
→ automatic retry
→ pass
→ pretend CI was green
```

‏אם infrastructure retry נדרש, failure הראשון נשמר ומסווג.

### ‏`P1 — Preferred Default`: Test Taxonomy מפורש

‏כל Test יקבל category כגון:

```text
unit
property
component
integration
replay
golden
fault
performance
acceptance
broker-conformance
paper
```

‏כך CI יכול לבחור רק את ה־suite הרלוונטי לפי Risk Class.

### ‏`P1 — Preferred Default`: Risk-Based Test Depth

‏לא כל שינוי מקבל אותו CI depth.

‏Priority בדיקה גבוה במיוחד ל־:

```text
Execution
Risk
Safety
Recovery
Position accounting
Point-in-time correctness
Data integrity
Broker boundaries
```

‏UI formatting אינו באותה רמת סיכון כמו `No Overfill`.

‏אפשר להשתמש במטריצה:

```text
RiskPriority
≈ Probability × Impact × LowDetectability
```

### ‏`P0 — Required`: Pre-Merge Gate לפי Change Risk

‏לשינוי קריטי:

```text
Fast green
+ relevant integration green
+ relevant mini replay/golden green
+ no unexplained warnings
```

‏לשינוי המשפיע על behavior economic/execution:

```text
+ Behavioral Diff reviewed
+ relevant fault/recovery scenarios green
```

### ‏`P1 — Preferred Default`: Larger suites מחוץ ל־Fast Path

‏`Nightly / On-demand / Release` כוללים:

```text
full-day replay
multi-regime replay
soak
stress
wide fault injection
cross-provider consistency
performance regression
broker paper smoke
```

‏כך מקבלים גם Fast Feedback וגם עומק.

---

## ‏3. Why

‏מערכת המסחר שלנו אינה פונקציה טהורה אחת.

‏היא מערכת שבה outcome יכול להשתנות בגלל:

```text
time
ordering
freshness
network ambiguity
broker callbacks
partial fills
state persistence
restarts
concurrency
market regime
load
```

‏לכן Happy Path אינו מספיק.

‏רוב failure modes המסוכנים נמצאים בדיוק בגבולות:

```text
before / after
fresh / stale
sent / not known
partial / full
connected / disconnected
flat / almost-flat
current / old generation
```

‏Testing צריך לבנות confidence בגבולות האלה.

---

## ‏4. Use When

‏ה־Baseline מתאים במיוחד למערכת שלנו משום שהיא כוללת:

```text
thousands of symbols
short signal half-life
cross-sectional ranking
market-data streaming
broker side effects
partial fills
recovery / reconciliation
strict risk controls
replay / research parity
```

‏הוא שימושי גם לפני Production אמיתי, משום שרוב החוקים הקריטיים ניתנים להוכחה ב־Fake/Replay/Paper בלי ליצור Risk חי.

---

## ‏5. Do Not Use When

‏אין להפוך את הפירמידה לדוגמה קשיחה.

‏אם subsystem הוא pure library, ייתכן שכמעט כל הכיסוי שלו יהיה Unit/Property.

‏אם Adapter תלוי בסמנטיקה חיצונית, Contract/Conformance tests יקבלו משקל גדול יותר.

‏אם UI הוא חלק קריטי מ־operator safety, נדרש מספר קטן של browser E2E flows.

‏העיקרון נשאר:

```text
use the cheapest layer that can prove the contract
```

---

## ‏6. Suite Architecture

### ‏6.1 `Fast`

‏רץ בכל שינוי.

‏כולל:

```text
feature math
filters
ranking
state reducers
risk rules
safety rules
execution invariants
serialization contracts
config validation
small property tests
mini golden scenarios where cheap
```

### ‏6.2 `Integration`

‏בודק seams:

```text
Data → State
State → Features
Scanner → Decision
Decision → Risk
Risk → Execution
Execution → Broker Adapter
Broker Events → Canonical Execution State
Persistence → Recovery
```

### ‏6.3 `Replay`

‏בודק:

```text
point-in-time correctness
determinism
ranking behavior
NO_TRADE behavior
decision stream
execution simulation
latency sensitivity
```

### ‏6.4 `Fault`

‏מזריק:

```text
timeout
dropped ACK
duplicate event
out-of-order event
sequence gap
disk failure
slow persistence
provider disconnect
broker disconnect
clock anomaly
process crash
queue overload
```

### ‏6.5 `Performance`

‏בודק:

```text
whole scanner cycle
feature update throughput
Top-N deep path
queue age
burst handling
decision path
recovery time
allocation / GC trends
```

### ‏6.6 `Acceptance`

‏מספר קטן של journeys end-to-end.

‏הם מוכיחים integration, לא כל permutation אפשרי.

### ‏6.7 `Broker Paper / Conformance`

‏נועד לבדוק semantics חיצוניים שה־Fake לא יכול להוכיח.

‏הוא אינו תחליף לבדיקות דטרמיניסטיות.

---

## ‏7. Time / Scheduler Testing Contract

‏כל רכיב שתלוי בזמן יקבל dependency מפורש.

‏Baseline contracts:

```text
IClock
ITimer / Scheduler abstraction where needed
EvaluationTime
Deadline / Expiry inputs
```

‏בדיקה לא תמתין שנייה אמיתית כדי להוכיח TTL של שנייה.

‏נבדוק boundaries:

```text
threshold - epsilon
threshold
threshold + epsilon
```

‏ל־:

```text
TTL
freshness
spread
latency
risk limits
price bounds
position size
```

---

## ‏8. Determinism Contract

‏מקורות nondeterminism שייאסרו או ינוהלו במפורש:

```text
wall-clock reads
unseeded random
unordered iteration
unstable sort
implicit DB ordering
parallel floating-point reduction
filesystem enumeration order
race-dependent state transition
```

‏לכל tie יש tie-breaker דטרמיניסטי/versioned.

‏דוגמה רעיונית בלבד:

```text
score DESC
confidence DESC
freshness DESC
instrument_id ASC
```

‏ה־Ranking policy עצמו נשאר Source of Truth של מקטע 14.

---

## ‏9. Property / Invariant Catalog

### ‏9.1 Data

```text
DuplicateEconomicEventDoesNotDoubleCount
UnknownNeverSilentlyBecomesZero
AsReceivedReplayNeverUsesFutureAvailability
GapChangesQualityPredictably
ProviderGenerationInvalidatesOldDependentState
```

### ‏9.2 Scanner

```text
SameStateSameConfigSameRank
InvalidCandidateCannotBecomeActionable
CoverageFailureBlocksActionableWholeMarketRank
NO_TRADEAlwaysAllowed
IterationOrderDoesNotCreateWinnerBias
```

### ‏9.3 Risk / Safety

```text
SafetyStateCannotBeWeakenedByStrategy
UnknownRiskStateCannotAuthorizeNewExposure
ReservationCannotBeDoubleSpent
KillBlocksNewEntry
RiskReducingPathRemainsAvailableWhenSafe
```

### ‏9.4 Execution

```text
DuplicateIntentDoesNotCreateDuplicateExposure
DuplicateFillDoesNotDoublePosition
CancelRequestedDoesNotReleaseRiskPrematurely
UnknownEffectCannotBecomeCanceledWithoutEvidence
PotentialExposureNeverExceedsAuthorization
```

### ‏9.5 Position

```text
PositionEqualsAuthoritativeExecutionLedgerAfterReconciliation
FlatMeansNoPositionAndNoPotentiallyLiveExposure
EveryPositionChangeHasExecutionOrReconciliationEvidence
```

### ‏9.6 Recovery

```text
RestartDoesNotEraseBrokerReality
RestartTwiceEqualsRestartOnceWhenExternalTruthUnchanged
ResumeRequiresReconciliationAndReadiness
OldEpochIntentCannotCreateNewRisk
```

### ‏9.7 Research

```text
FeatureAtTUsesAvailabilityTime<=T
LabelsNeverEnterFeatureInputs
SameDatasetManifestReproducesSemanticResult
ExperimentResultKeepsOriginalDatasetVersion
```

---

## ‏10. Execution Test Matrix

‏מקטע 51 נשאר Source of Truth ל־Execution semantics.

‏53 דורש automated coverage לפחות ל־:

```text
full fill
partial fill
multiple partial fills
reject
cancel
cancel/fill race
replace overlap
timeout before definitive response
ACK lost after broker acceptance
duplicate callback
out-of-order callback
late fill after cancel request
late fill after strategy abandonment
disconnect during entry
disconnect during exit
restart with working order
restart with unknown fill
orphan order
position mismatch
unknown effect
kill during partial fill
split-brain attempt
```

‏הבדיקה אינה מסתיימת ב־“לא נזרקה Exception”.

‏היא מוכיחה Position/Pending Exposure/Risk/Journal/Next Action.

---

## ‏11. Reconciliation / Recovery Tests

‏בכל recovery scenario נשווה:

```text
Local Journal
Open Broker Orders
Broker Executions
Broker Position
Risk Reservations
Pending Exposure
Safety State
Execution Epoch
```

‏ונדרוש convergence למצב explainable.

‏אין Resume רק מפני שה־socket התחבר מחדש.

‏נמדוד גם:

```text
Detection Time
Containment Time
Reconciliation Time
Ready Again Time
```

---

## ‏12. Safety Test Matrix

‏לפחות:

```text
kill while idle
kill during submit
kill during partial fill
kill while exit pending
feed stale with no position
feed stale with open position
broker disconnect with working entry
broker disconnect with working exit
clock unhealthy
position mismatch
unknown effect
recovery trigger disappears
restart while safety latch active
```

‏הבדיקות חייבות להוכיח:

```text
new risk blocked
existing risk still managed where possible
latch persistence
explicit resume requirements
```

---

## ‏13. Market-State / Data Tests

‏נבדוק:

```text
duplicate trades
same-timestamp distinct trades
out-of-order sequences
gaps
provider reset
reconnect backlog
stale quote
fresh trade + stale quote
torn bid/ask
locked/crossed market
unknown enum
schema drift
unit mismatch
provider divergence
failover generation change
```

‏ה־Expected Result כולל גם quality/reason codes, לא רק value.

---

## ‏14. Scanner / Ranking Tests

‏נבדוק:

```text
Top1
Top-N
ties
missing features
stale candidates
filtered candidates
low coverage
warm-up
rank drift during Deep Path
deep result expiry
NO_TRADE
iteration-order independence
```

‏Metamorphic test יכול לבדוק למשל:

```text
if a validated monotonic positive feature for A improves
while all else stays equal
A's rank must not worsen
```

‏רק עבור Features שבאמת מוגדרים monotonic.

---

## ‏15. Research / Leakage Tests

‏נחזיק tests מפורשים ל־:

```text
future timestamp assertion
availability-time assertion
feature/label separation
shifted-label canary
shuffle-label sanity
time-shift sanity
train/validation/test chronology
universe point-in-time correctness
cost-model version binding
```

‏`Leakage Canary` הוא Challenger בעל ערך: מכניסים בכוונה input בלתי־חוקי מהעתיד ומוודאים שמנגנון validation תופס אותו.

---

## ‏16. Economic Correctness Tests

‏בדיקות כספיות יקבלו contract מפורש ל־:

```text
price precision
tick rounding
quantity rounding
fees
minimum fee behavior
spread cost
slippage
impact estimate
adverse-selection component
average fill price
partial fills
realized PnL
net PnL
```

‏אין לקבע בתשתית Testing עובדות חיצוניות משתנות כמו fee schedule היסטורי.

‏הבדיקה משתמשת ב־configured/versioned model ומוכיחה את המתמטיקה שלו.

‏PnL Attribution צריך להיסגר:

```text
Gross Result
- Spread
- Fees
- Slippage
- Impact
- Other Modeled Costs
= Net Result
```

‏לפי החוזה הרלוונטי.

---

## ‏17. Latency / Performance Testing

‏המערכת שלנו רגישה ל־tails.

‏נמדוד:

```text
P50
P95
P99
max / worst incidents where useful
```

‏ל־:

```text
feature update
scanner cycle
ranking
Deep Path
decision-to-submit
submit-to-ack
exit-intent-to-flat
recovery-to-ready
queue age
```

‏Performance regression gate לא יתבסס על run יחיד במכונת CI רועשת.

‏נשתמש ב־:

```text
repeated measurements
trend
margin
dedicated benchmark environment where justified
```

### ‏Latency Injection

‏Replay יבדוק גם distributions ולא רק delay קבוע.

‏למשל:

```text
base distribution
higher-tail distribution
burst-correlated distribution
```

‏הערכים עצמם נגזרים ממדידות שלנו.

‏נשמור גם degradation curves לאורך delays מחקריים כדי לזהות latency cliff.

---

## ‏18. Load / Backpressure Tests

‏נבדוק לפחות:

```text
1x observed baseline
2x burst
5x stress
hot-symbol skew
provider reconnect flood
slow storage
slow logger
slow Deep Path
```

‏המטרה אינה רק “ה־process לא קרס”.

‏צריך להוכיח:

```text
queue age visible
no silent stale decisions
critical events preserved
optional work shed first
new entries blocked when trust lost
recovery returns only after freshness/readiness restored
```

---

## ‏19. Concurrency Testing

‏לא נסמוך על scheduler שייצר Race “במקרה”.

‏נשתמש ב־hooks/barriers כדי לכפות interleavings קריטיים.

‏למשל:

```text
A reads order state
PAUSE A
B processes fill
RESUME A
```

‏כך אפשר לבדוק races באופן reproducible.

‏Stress concurrency tests משלימים זאת, אבל אינם מחליפים controlled interleaving tests.

---

## ‏20. Test Doubles / Fidelity Ladder

```text
Pure Fake
→ Stateful Simulator
→ Recorded Replay
→ Broker Paper / Sandbox
→ Live Observation only after earlier gates
```

‏כל שכבה עונה על שאלה אחרת.

‏Fake Broker טוב אינו תמיד מחזיר success.

‏הוא יודע לייצר:

```text
reject
partial fill
delayed fill
duplicate callback
out-of-order callback
disconnect
unknown effect
```

‏Perfect Mock יוצר confidence מזויף.

---

## ‏21. Contract / Conformance Tests

### ‏Market Data Adapter

```text
required fields
units
timezone / timestamp semantics
sequence semantics
null handling
trade conditions
reconnect behavior
unknown enum behavior
```

### ‏Broker Adapter

```text
submit mapping
cancel semantics
replace semantics
partial fill
reconnect
ID stability
order lookup
position reconciliation
unsupported capability
late callbacks
```

‏כאשר capability חיצונית משתנה בזמן, test fixture/config חייב להיות versioned ואימות תפעולי נעשה מחדש לפני שימוש.

---

## ‏22. Acceptance Scenarios

‏מספר קטן של journeys מלאים:

### ‏A — Normal Lifecycle

```text
Fresh Market State
→ Candidate
→ Risk Approved
→ Protected Entry
→ Full Fill
→ Exit
→ Flat
→ Complete Audit Trail
```

### ‏B — Partial Fill + Signal Dies

```text
Candidate
→ Entry
→ Partial Fill
→ Signal Expires
→ Cancel Remainder
→ Exit Filled Quantity
→ Flat
```

### ‏C — NO_TRADE Success

```text
Rank #1 exists
→ spread/slippage/latency/cost consume edge
→ NO_TRADE
→ reason preserved
```

### ‏D — Unknown Effect Recovery

```text
Submit Attempt
→ Connection Loss
→ UNKNOWN_EFFECT
→ Duplicate Submit Blocked
→ Reconcile
→ Existing Working Order Found
→ State Rebuilt
```

### ‏E — Safety Degradation

```text
Feed Becomes Stale
→ Block Entries
→ Preserve Position Management
→ Restore Feed
→ Warm Required State
→ Prove Readiness
→ Explicit Resume Path
```

---

## ‏23. Browser / UI Tests

‏Browser E2E יישאר רק ל־operator workflows שבאמת תלויים ב־UI:

```text
pause / resume controls
kill / safety controls
mode visibility
critical diagnostics
manual acknowledgement where required
```

‏Business invariants אינם עוברים ל־Browser רק משום שיש UI.

‏הם נשארים Domain/Component tests מהירים.

---

## ‏24. Test Data Strategy

‏נחזיק שלושה סוגי Fixtures:

### ‏Tiny Synthetic

‏מינימליים וברורים עבור חוק אחד.

### ‏Recorded Real

‏Provider/Broker quirks אמיתיים.

### ‏Historical Regression Corpus

‏ימים/חלונות כגון:

```text
quiet market
open burst
high volatility
halts
provider degradation
reconnect flood
wide spreads
```

‏כל Fixture משמעותי מקבל:

```text
fixture_id
dataset_id / source
schema_version
parser_version
time_range
provenance
expected_properties
```

---

## ‏25. Failure Artifact Contract

‏Failure משמעותי שומר לפחות:

```text
test_id
seed
input fixture / event stream
config
versions
decision trace
state trace
reason codes
first divergence
```

‏ומספק Reproduction Command קצר.

‏המטרה:

```text
failure observed
→ reproducible locally
→ minimal reproducer
→ RCA
```

---

## ‏26. Flakiness Policy

‏Baseline:

```text
flaky == bug
```

‏Classification:

```text
PRODUCT_BUG
TEST_BUG
INFRA_FAILURE
FLAKY_NONDETERMINISM
PERFORMANCE_REGRESSION
DATA_CONTRACT_BREAK
```

‏אם Test נכנס זמנית ל־quarantine, חייבים:

```text
owner
reason
RCA link/reference
deadline / exit criteria
```

‏Quarantine אינו מצב קבוע.

---

## ‏27. Slow-Test Policy

‏CI יציג:

```text
slowest tests
slowest fixtures
suite duration trend
setup/teardown cost
```

‏Test איטי נשאל:

```text
Can this behavior move lower in the pyramid?
Can a full-day fixture become mini replay?
Can real time become fake time?
Can shared infrastructure become in-memory fake?
Can duplicated scenarios collapse into a property test?
```

‏אם כן — משפרים.

---

## ‏28. Required Evidence

‏לפני שנגדיר את Testing layer כיציב, נדרש Evidence של:

```text
Fast suite runtime trend
flaky rate
critical-invariant coverage
replay determinism
fault scenario coverage
recovery scenario coverage
incident-to-test conversion
performance regression detection
broker/data adapter conformance
failure reproduction success
```

---

## ‏29. Promotion Criteria

‏Testing architecture יכולה להיחשב Baseline מאושר כאשר:

- ‏Fast suite דטרמיניסטי ומהיר מספיק להרצה בכל שינוי.
- ‏אין `Sleep`-based synchronization ב־critical tests.
- ‏critical financial invariants מכוסים.
- ‏Execution boundary scenarios מכוסים.
- ‏Safety/Recovery fault tests קיימים.
- ‏Replay reproducible תחת manifest קבוע.
- ‏Point-in-time / leakage tests קיימים.
- ‏Data/Broker adapters מחזיקים contract suites.
- ‏CI failure מספק artifact שניתן לשחזור.
- ‏Flaky tests אינם מנורמלים כרעש.
- ‏Warnings משמעותיים עוברים triage/RCA.
- ‏Full-day/stress suites אינם חוסמים את Fast feedback loop.

---

## ‏30. Rejection Criteria

‏שינוי Testing נדחה אם הוא גורם לאחד מ־:

```text
Fast suite becomes materially slower without coverage value
new sleeps added to synchronize correctness
retries hide first failure
behavior asserted through implementation internals only
critical scenario exists only as manual test
fixture uses impossible future knowledge
paper test replaces deterministic regression
snapshot noise hides semantic assertion
shared state creates order-dependent tests
flaky failure becomes accepted normal state
warning/error is bypassed without RCA
```

---

## ‏31. Metrics

### ‏Suite Health

```text
fast_suite_duration
integration_suite_duration
replay_smoke_duration
nightly_duration
flaky_test_rate
quarantined_test_count
failure_reproduction_rate
```

### ‏Coverage Quality

```text
critical_invariant_coverage
critical_failure_mode_coverage
recovery_scenario_coverage
broker_contract_coverage
data_contract_coverage
incident_regression_coverage
```

### ‏Replay

```text
replay_determinism_failures
decision_hash_changes
behavioral_diff_count
unexplained_trade_flip_count
```

### ‏Performance

```text
slowest_test_duration
P50/P95 test duration by category
performance_regression_count
benchmark_variance
```

### ‏CI Quality

```text
PRODUCT_BUG failures
TEST_BUG failures
INFRA failures
FLAKY failures
unexplained_warning_count
mean_time_to_reproduce
mean_time_to_RCA
```

‏`line_coverage` יכול להישמר כ־guardrail, לא KPI עליון.

---

## ‏32. Failure Modes

```text
T53-01 COVERAGE_VANITY
T53-02 FAST_SUITE_TOO_SLOW
T53-03 SLEEP_BASED_SYNC
T53-04 FLAKY_RETRY_HIDDEN
T53-05 NONDETERMINISTIC_REPLAY
T53-06 FUTURE_KNOWLEDGE_FIXTURE
T53-07 PERFECT_MOCK_FALSE_CONFIDENCE
T53-08 INCIDENT_NOT_REGRESSED
T53-09 UNKNOWN_EFFECT_UNTESTED
T53-10 CANCEL_FILL_RACE_UNTESTED
T53-11 RECOVERY_PATH_UNTESTED
T53-12 SAFETY_PRIORITY_UNTESTED
T53-13 SHARED_STATE_TEST_INTERFERENCE
T53-14 PERFORMANCE_REGRESSION_UNDETECTED
T53-15 CONTRACT_DRIFT_UNDETECTED
T53-16 WARNING_NORMALIZED
T53-17 PAPER_AS_TEST_SUITE
T53-18 SNAPSHOT_WORSHIP
T53-19 IMPLEMENTATION_COUPLED_ASSERTION
T53-20 FAILURE_NOT_REPRODUCIBLE
```

---

## ‏33. Alternatives / Trade-offs

### ‏Very E2E-Heavy Suite

‏יתרון:

- ‏בודק wiring רחב.

‏חסרונות:

```text
slow
flaky
hard to diagnose
expensive to maintain
poor combinatorial coverage
```

‏לא Baseline.

### ‏Mostly Unit Tests

‏יתרון:

- ‏מהיר מאוד.

‏חיסרון:

- ‏יכול לפספס seams, persistence ו־external semantics.

‏לכן נדרש Integration/Replay layer קטן אך משמעותי.

### ‏Snapshot-Heavy Testing

‏קל לייצר אבל יכול להפוך לשינויי “approve all” ללא הבנת semantics.

‏נשתמש Snapshot רק כאשר ה־artifact עצמו הוא contract אמיתי.

### ‏Manual QA / Paper Only

‏מתאים ל־discovery, לא כ־Regression Strategy.

---

## ‏34. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏מאות Browser E2E tests.
- ‏יום מסחר מלא בכל commit.
- ‏real broker/network ב־Fast suite.
- ‏`Thread.Sleep` כדי לייצב tests.
- ‏snapshot JSON ענק לכל object.
- ‏test retry אוטומטי שמסתיר failure ראשון.
- ‏Mutation Testing על כל repository בכל commit.
- ‏Chaos רחב בלי Hypothesis.
- ‏Full-system setup ל־pure calculations.
- ‏100% coverage כ־release criterion.

---

## ‏35. What to Add Later

‏לאחר Baseline יציב:

```text
model-based execution testing
broader property generators
targeted mutation testing
deterministic concurrency harness
richer scenario DSL
automatic behavioral diff approval workflow
larger historical regression corpus
dedicated benchmark runners
fault-matrix automation
cross-provider conformance corpus
```

‏כל תוספת צריכה להקטין Risk או Feedback Time, לא רק להגדיל sophistication.

---

## ‏36. User-Specific Application

‏לפרויקט שלנו ההמלצה הקונקרטית:

```text
1. Keep Fast CI aggressively small.
2. Move waiting to fake clocks / explicit signals.
3. Keep feature/filter/ranking/risk/execution invariants in Fast.
4. Build mini replay fixtures for every important boundary bug.
5. Keep full-day replay out of the default developer loop.
6. Run relevant integration/replay based on changed subsystem.
7. Preserve first CI failure; do not hide it with retry.
8. Require RCA for material warnings/errors before continuing.
9. Convert every significant incident/near-miss into regression coverage.
10. Track slowest tests and remove duplicated low-value coverage.
```

‏בגלל שכבר ראינו בפרויקטים שלנו ש־long-running test suites פוגעים בקצב העבודה, Testing Performance הוא requirement מפורש ולא nice-to-have.

‏המטרה אינה פחות Testing.

‏המטרה היא:

```text
more protection per second of feedback
```

---

## ‏37. Concrete Baseline Contract

```text
TestPolicy
{
  fast_suite_required: true,
  no_real_network_in_fast: true,
  no_real_broker_in_fast: true,
  no_sleep_for_correctness: true,
  deterministic_clock_required: true,
  first_failure_preserved: true,
  flaky_requires_RCA: true,
  critical_warning_requires_triage: true,
  incident_to_regression_required: true,
  replay_manifest_required: true,
  failure_artifact_required: true
}
```

‏CI layer conceptual mapping:

```text
Fast
→ Required every change

Relevant Integration
→ Required by subsystem/risk class

Mini Replay / Golden
→ Required for behavior-changing critical code

Large Replay / Fault / Performance
→ Nightly / release / on-demand

Paper / External Conformance
→ Controlled validation stage
```

---

## ‏38. Fact / Judgment / Hypothesis

### ‏Fact / Established Engineering Principle

- ‏Real sleeps make tests slower and tend to increase nondeterminism.
- ‏Line coverage does not prove invariant/failure-mode coverage.
- ‏External side effects and asynchronous event ordering require explicit scenario testing.
- ‏Replay reproducibility requires deterministic time/order/config/data contracts.
- ‏A flaky test can originate from either test nondeterminism or product nondeterminism.
- ‏Slow feedback loops reduce practical test usage.

### ‏Judgment — Recommended Baseline

- ‏Aggressively small Fast suite.
- ‏Fake time and controlled scheduling.
- ‏Risk-based test depth.
- ‏Mini replay fixtures for regressions.
- ‏No automatic concealment of flaky failures.
- ‏RCA before continuing after material CI failure/warning.
- ‏Critical invariants in domain-level tests.
- ‏Full-day/stress suites outside the normal edit loop.

### ‏Hypothesis — Requires Measurement

- ‏Exact Fast-suite runtime budget.
- ‏Optimal division between Integration and Replay gates.
- ‏Which property tests provide enough incremental bug detection.
- ‏How much Mutation Testing is worth its runtime.
- ‏Which large historical days maximize regression value.
- ‏Whether dedicated benchmark hardware becomes necessary.

---

## ‏39. Confidence

### ‏High Confidence

‏גבוה לגבי:

- ‏Invariant-first testing.
- ‏Fake time instead of sleep.
- ‏Deterministic replay.
- ‏Fault/recovery coverage.
- ‏Incident-to-test rule.
- ‏Fast CI importance.
- ‏Flaky test RCA.
- ‏Risk-based coverage.
- ‏External conformance testing.

### ‏Medium Confidence

‏בינוני לגבי:

- ‏ה־runtime target המדויק של Fast suite לאורך חיי הפרויקט.
- ‏כמות ה־Replay fixtures שתרוץ בכל merge.
- ‏כמה Concurrency Model-Based Testing כדאי להוסיף בתחילת Production hardening.

### ‏Evidence-Only

‏לא נקדם אוטומטית:

- ‏large-scale mutation testing.
- ‏massive browser E2E suite.
- ‏chaos platform מורכב.
- ‏dedicated distributed test farm.

---

## ‏40. Time-Sensitive Facts

‏לא נוספו כאן Facts חיצוניים תלויי־זמן על Broker, Exchange או Regulation.

‏לכן לא נדרש Web verification חדש למקטע 53.

‏לעומת זאת, Broker/Provider Conformance fixtures חייבים להיבדק מחדש כאשר משתנים:

```text
API version
broker behavior
provider schema
session semantics
capabilities
fee/config model used by tests
```

---

## ‏41. Relationship to Earlier / Later Sheets

### ‏Earlier

- ‏`20–21` — Point-in-time Backtest ו־Execution simulation.
- ‏`23–24` — Leakage, OOS ו־Controlled Experiments.
- ‏`27` — Deterministic Replay.
- ‏`29` — Broker Adapter contracts.
- ‏`33–34` — State Machine, Recovery ו־Safe Resume.
- ‏`35` — Observability contracts.
- ‏`36` — Safety / Kill invariants.
- ‏`38–41` — Queue/order/routing/algo semantics שדורשים capability/fidelity tests.
- ‏`43` — Halt/Fast-Market fault scenarios.
- ‏`46–48` — Adverse Selection, Capacity ו־Latency sensitivity.
- ‏`49` — Experiment reproducibility/governance.
- ‏`50` — Scanner determinism, fairness ו־load tests.
- ‏`51` — Execution Engine boundary matrix.
- ‏`52` — Data contracts, provenance ו־Replay/Live equality.

### ‏Later

‏`54 — Performance Best Practices` יגדיר איך לייעל את המערכת באמצעות profiling, hot-path design, allocations/GC, concurrency ו־tail latency בלי לפגוע ב־correctness שה־Testing layer של 53 אמורה להגן עליו.

---

## ‏42. Recommendation Summary

### ‏Priority Map

```text
P0
- Fast deterministic suite on every change
- fake clock / no sleep-based correctness
- critical invariant/property tests
- execution boundary tests
- safety/recovery fault tests
- point-in-time / leakage tests
- deterministic replay
- incident-to-regression rule
- preserve first failure
- flaky test RCA
- meaningful warning/error RCA
- failure reproduction artifacts

P1
- risk-class CI depth
- mini replay / golden corpus
- data/broker contract suites
- component seam tests
- test taxonomy
- slow-test reporting
- behavior-oriented assertions
- small critical acceptance suite

P2
- controlled concurrency harness
- broader metamorphic/property tests
- shadow behavioral diff automation
- richer historical regression corpus

P3
- model-based testing
- targeted mutation testing
- dedicated benchmark infrastructure

P4
- large chaos platform
- massive browser E2E farm
- distributed testing infrastructure without measured need
```

### ‏Final Baseline

```text
Fast Domain / Property Tests
→ Component Seam Tests
→ Mini Golden Replay
→ Relevant Integration
→ Fault / Recovery Validation
→ Large Replay / Performance Outside Fast Loop
→ Paper / External Conformance
→ Small Acceptance Layer
```

‏ה־Testing layer שלנו צריך להיות **מהיר מספיק שאכן יריצו אותו, עמוק מספיק כדי להגן על Exposure ו־Truth, ודטרמיניסטי מספיק שכל Failure יהפוך ל־Evidence שניתן לשחזר ולתקן**.