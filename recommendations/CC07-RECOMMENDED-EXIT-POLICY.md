# ‏Cross-Cutting 07 — Recommended Exit Policy

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Exit Logic, Execution, Risk, Costs, Position State, Recovery, Observability ו־Replay למדיניות `Exit` אחת deterministic, explainable ו־replayable עבור `Research / Replay / Shadow / Paper`.
>
> ‏המסמך אינו הוראה לבצע מסחר בכסף אמיתי, אינו אישור `Live`, ואינו מגדיר חשיפה אמיתית. הוא מגדיר את החוזה המחקרי שלפיו simulated/paper position עוברת מ־`OPEN` ל־`FLAT_CONFIRMED` תחת תנאי זמן, signal, risk, execution ו־system state מפורשים.

---

## ‏1. Decision

‏`Exit` אינו:

```text
price >= target
→ sell
```

‏וגם אינו:

```text
scanner found something better
→ abandon current position
```

‏אלא:

```text
Actual Fill Creates Position
→ Arm Exit Policy Immediately
→ Monitor Executable Position State
→ Evaluate Competing Exit Conditions
→ Select Exit Reason + Urgency
→ Create Exit Intent for Actual Remaining Qty
→ Execute / Observe Partial Fills
→ Reconcile Unknown Effects
→ Continue Until Authoritative Flat
→ Record Outcome / MFE / MAE / Giveback / TimeToFlat
→ Feed Evidence Back to Research
```

‏העקרונות המחייבים:

```text
Entry Fill starts exit responsibility
Exit Decision != Exit Execution
Last != realizable exit price
Exit Submitted != Flat
Partial Exit != Flat
UNKNOWN != Failed
Current expected value matters more than entry-price anchoring
Existing exposure has priority over new opportunity scanning
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Exit Plan קיים לפני Entry Permission

‏לפני ש־Entry Policy רשאית ליצור simulated/paper exposure, חייבים להיות ידועים לפחות:

```text
exit_policy_version
exit_execution_policy_version
hard_risk_behavior
max_holding_time policy
profit policy
no-progress policy state
emergency behavior
partial-fill behavior
reconciliation behavior
```

‏אין צורך שכל מנגנון Exit יהיה מורכב.

‏כן נדרש שהמערכת לעולם לא תגיע ל־Fill ואז תשאל לראשונה:

```text
What do we do now?
```

### ‏`P0 — Required`: Exit Protection נדרכת ב־First Fill

‏ברגע ש־:

```text
actual_filled_qty > 0
```

‏נוצרה Position.

‏לכן:

```text
first fill
→ position ownership established
→ exit monitoring armed
→ risk / safety state active
```

‏לא מחכים ל־full fill, לא ל־next scanner cycle, ולא ל־order terminal state.

### ‏`P0 — Required`: Position Truth נגזרת מ־Authoritative Execution Facts

‏ה־Exit Engine עובד על:

```text
actual_position_qty
remaining_position_qty
actual_avg_fill_price
confirmed executions
reconciled position state
```

‏ולא על:

```text
requested_qty
intended_qty
local assumption
```

‏כאשר local state ו־authoritative execution evidence סותרים זה את זה, נכנסים ל־reconciliation ולא ממשיכים כאילו הכול ידוע.

### ‏`P0 — Required`: Exit Decision ו־Exit Execution נפרדים

‏`Exit Decision Engine` מחזיר:

```text
HOLD
or
EXIT(reason, urgency)
```

‏`Exit Execution Engine` אחראי על:

```text
remaining_qty
execution policy
price protection / bounds
TTL
cancel / replace semantics
partial-fill handling
state transitions
reconciliation
```

‏כך אפשר להפריד במחקר בין:

```text
bad exit timing
vs
bad exit execution
```

### ‏`P1 — Preferred Default`: Baseline קטן של Exit Conditions

‏ה־Champion הראשוני יהיה פשוט:

```text
1. SYSTEM / SAFETY / EMERGENCY
2. HARD RISK
3. VALIDATED THESIS FAILURE / NO PROGRESS when promoted
4. MAX HOLD TIME
5. PROFIT CAPTURE
6. otherwise HOLD
```

‏הסדר הוא versioned ו־deterministic.

‏לא מתחילים עם עשרות overlapping rules.

### ‏`P0 — Required`: Emergency / Risk Exit אינו בר־פיצוי

‏כאשר `Risk`, ‏`Safety` או system state מחייבים הקטנת exposure:

```text
high score
high rank
unrealized profit
new candidate
```

‏אינם יכולים לבטל את ה־Exit.

‏זהו non-compensable path.

### ‏`P1 — Preferred Default`: Max Holding Time הוא Invariant

‏לכל Position נשמור:

```text
position_open_time
position_age
max_holding_time
```

‏כאשר `position_age >= max_holding_time`:

```text
EXIT decision required
```

‏אלא אם execution עצמו אינו אפשרי עקב market state, ובמקרה כזה עוברים ל־exception state מפורש כגון:

```text
HALTED_POSITION
EXIT_BLOCKED_BY_MARKET_STATE
RECOVERY
```

‏אין silent conversion מ־short-horizon thesis ל־long hold.

### ‏`P1 — Preferred Default`: Profit נמדד ב־Executable / Net Terms

‏Profit condition אינה מבוססת על `Last` בלבד.

‏ל־long research position נמדוד לפחות:

```text
last_pnl
mid_pnl
executable_pnl_using_bid
estimated_exit_friction
estimated_net_if_exit_now
```

‏ה־decision contract צריך לשאול:

```text
Can the modeled position be flattened now
with a validated net outcome?
```

‏ולא:

```text
Did one print touch a target?
```

### ‏`P1 — Preferred Default`: No-Progress הוא Challenger ראשון, לא Hard Truth

‏עבור short-horizon momentum קיימת Hypothesis סבירה:

```text
if favorable executable progress normally appears quickly,
absence of progress may contain negative information
```

‏לכן נמדוד:

```text
position_age
MFE_so_far
MAE_so_far
executable_return_since_fill
score_change_since_entry
rank_change_since_entry
activity_change_since_entry
spread_change_since_entry
```

‏אבל בתחילה:

```text
ShadowNoProgress = true
ActualExitDecisionUnchanged = true
```

‏עד שיוכח incremental OOS value.

### ‏`P1 — Preferred Default`: Signal Decay ו־Thesis Failure נפרדים מ־Price Stop

‏Post-entry deterioration יכולה להיות Evidence גם אם המחיר טרם הגיע ל־hard risk boundary.

‏אבל היא דורשת validation נפרד.

‏נשמור:

```text
entry_signal_state
current_signal_state
delta_since_entry
as_of_times
feature validity
```

‏כדי לבדוק אם post-entry state באמת מוסיף מידע מעבר ל־price/time בלבד.

### ‏`P0 — Required`: Exit Urgency נגזרת מה־Reason

‏Baseline urgency classes:

```text
LOW
MEDIUM
HIGH
EMERGENCY
```

‏לדוגמה ארכיטקטונית:

```text
profit capture        → LOW / MEDIUM
max hold              → MEDIUM / HIGH depending on policy
validated thesis fail → HIGH
hard risk             → HIGH
system emergency      → EMERGENCY
```

‏Urgency היא input ל־Execution Policy; היא אינה guarantee ל־fill.

### ‏`P0 — Required`: `TimeToFlat` הוא מדד התפעולי המרכזי

‏Exit אינו מסתיים ב־:

```text
exit_intent_created
order_sent
ack_received
```

‏הוא מסתיים רק כאשר authoritative position state מוכיח:

```text
position_qty == 0
```

‏ולכן נשמור:

```text
exit_signal_to_submit
exit_submit_to_first_fill
exit_submit_to_flat
exit_signal_to_flat
```

### ‏`P0 — Required`: Partial Exit נשאר Exposure

‏אם Position של 100 קיבלה Exit fill של 35:

```text
remaining_qty = 65
```

‏המערכת נשארת ב־Position/Exit state.

‏Risk protection, telemetry, execution ownership ו־reconciliation ממשיכים על היתרה.

### ‏`P0 — Required`: Unknown Exit Effect → Reconcile Before New Side Effect

‏תרחיש:

```text
exit attempt
→ timeout / disconnect
```

‏התגובה אינה:

```text
send exit again blindly
```

‏אלא:

```text
UNKNOWN_EFFECT
→ freeze conflicting action
→ reconcile orders / executions / position
→ establish remaining quantity
→ continue from authoritative truth
```

### ‏`P0 — Required`: Exit Priority מעל Broad Scanner Opportunity

‏כאשר קיימת Position או unknown pending exit:

```text
Position / Exit / Reconciliation work
>
new broad-market opportunity work
```

‏Rank חדש אינו רשאי למחוק durable execution reality.

### ‏`P1 — Preferred Default`: Stable Reason Codes

‏Baseline taxonomy:

```text
TAKE_PROFIT
HARD_RISK
TIME_STOP
NO_PROGRESS
SIGNAL_DECAY
LIQUIDITY_FAILURE
DATA_FAILURE
RISK_KILL
SYSTEM_FAILURE
HALT_RECOVERY
MANUAL_RESEARCH_EXIT
```

‏כל Reason הוא machine-readable, versioned וניתן ל־RCA.

---

## ‏3. Why

### ‏Fact

‏Fill ראשון יוצר Position גם אם Entry order עדיין working.

### ‏Fact

‏Stop/trigger decision אינו מבטיח execution באותו מחיר.

### ‏Fact

‏Partial Exit משאיר exposure עד שהכמות שנותרה מגיעה לאפס ומאומתת.

### ‏Fact

‏Broker/order timeout אינו מוכיח שה־side effect נכשל.

### ‏Judgment

‏למערכת short-horizon עדיף baseline פשוט של `Hard Risk + Max Time + Profit + Emergency`, עם No-Progress/Signal-Decay כ־challengers מדודים, על פני Exit tree מורכב מהיום הראשון.

### ‏Judgment

‏`TimeToFlat`, ‏MFE/MAE ו־Giveback חשובים יותר מ־Win Rate לבדו להבנת איכות Exit.

### ‏Hypothesis

‏Validated fast-failure signals עשויים לשפר capital efficiency ולהקטין tail loss בלי לפגוע באופן מהותי ב־best winners.

---

## ‏4. Use When

‏ה־Baseline מתאים כאשר:

- ‏Position truth נגזרת מ־fills/reconciliation.
- ‏יש market state טרי מספיק למדידת executable outcome.
- ‏קיים Exit Execution Engine עם state machine מפורש.
- ‏Partial fills ו־unknown effects מיוצגים במודל.
- ‏ניתן למדוד timeline מלא מ־entry fill עד authoritative flat.
- ‏Replay מסוגל לשחזר Exit reason ו־trigger timing.

---

## ‏5. Do Not Use When

‏אין להתייחס ל־Exit Policy כ־מוכנה כאשר:

```text
local position can diverge from authoritative position silently
flat cannot be verified
partial exit is not modeled
profit is based on Last only
stop trigger is treated as guaranteed fill
unknown external effect becomes automatic retry
position can outlive strategy horizon silently
exit logic and exit execution are mixed into one opaque function
```

---

## ‏6. Alternatives

### ‏Alternative A — Fixed Target + Hard Risk + Fixed Time

‏`P1 Baseline`.

‏פשוט, deterministic וקל ל־Replay/ablation.

### ‏Alternative B — Validated No-Progress Exit

‏`P2 Challenger`.

‏מתאים במיוחד אם short-horizon winners מוכיחים favorable progress מוקדם.

### ‏Alternative C — Signal / Thesis Decay Exit

‏`P2 Challenger` לאחר שמוכח ש־post-entry signal state מוסיף information beyond price/time.

### ‏Alternative D — Profit Lock / Trailing

‏`P2/P3 Challenger`.

‏יכול לשפר MFE capture אך רגיש ל־micro-noise ול־extra execution friction.

### ‏Alternative E — Volatility / Spread Normalized Exit

‏`P3` לאחר שיש Evidence יציב across regimes.

### ‏Alternative F — Replacement / Switching Exit

‏`P3/P4` בלבד.

‏דורש להוכיח:

```text
incremental expected benefit
> switching friction + uncertainty + safety margin
```

### ‏Alternative G — Learned / ML Exit

‏`P4 Specialist` בלבד לאחר dataset עשיר, execution-aware labels ו־strong OOS evidence.

---

## ‏7. Trade-offs

### ‏Fast Exit vs Premature Exit

‏תגובה מהירה מגינה מ־decay, אך יכולה לחתוך winners עקב noise.

### ‏Profit Capture vs Continuation

‏Target פשוט סוגר outcome בר־מדידה, אך יכול לוותר על continuation.

### ‏Time Stop vs Late Move

‏Time Stop מתאים ל־thesis קצר, אך עלול לצאת לפני move מאוחר.

### ‏Dynamic Exit vs Explainability

‏Adaptivity יכולה להוסיף value, אך גם להגדיל overfitting, churn ו־RCA cost.

### ‏Aggressive Flattening vs Friction

‏Urgency גבוהה יכולה לקצר `TimeToFlat`, אך להגדיל modeled spread/slippage cost.

---

## ‏8. What I Would Avoid Initially

‏לא להתחיל עם:

- ‏Exit על בסיס `Last` בלבד.
- ‏Wait-until-break-even logic.
- ‏Unbounded holding.
- ‏Complex trailing ladders.
- ‏Symbol-specific exit trees.
- ‏Dynamic regime-specific thresholds בלי Evidence.
- ‏Automatic switching על כל Rank #1 חדש.
- ‏Exit logic שמשנה את Position quantity לפני Fill.
- ‏Blind duplicate exit לאחר timeout.
- ‏Threshold tuning על אותו dataset שבו מדווחים performance.

---

## ‏9. What to Add Later

‏לאחר baseline יציב:

```text
validated no-progress exit
signal-decay exit
profit lock / trailing challenger
spread-normalized thresholds
volatility-normalized thresholds
regime-aware policy
replacement analysis
post-entry feature model
broker-native protective mechanics only after capability verification
```

---

## ‏10. Required Data / Evidence

### ‏Position Identity

```text
PositionEpisodeId
EntryIntentId
EntryDecisionId
InstrumentId
ActualQty
EntryAvgFillPrice
EntryFirstFillTime
SignalAgeAtFill
```

### ‏Position Timeline

```text
PositionAge
SignalAge
Bid / Ask / Mid / Last
QuoteAge / TradeAge
ExecutablePnL
MFE / MAE
MaxGiveback
Score / Rank when applicable
Activity
Spread
DataQuality
```

### ‏Exit Decision

```text
ExitDecisionId
ExitReason
ExitUrgency
ExitTriggerTime
ExitDecisionTime
RemainingQty
ReferencePrices
DataAge
PolicyVersions
ReasonCodes
```

### ‏Execution Timeline

```text
ExitIntentCreated
SubmitAttempted
AckObserved
FirstFillObserved
FinalFillObserved
CancelRequested
CancelConfirmed
UnknownEffectStarted
ReconciliationStarted
ReconciliationCompleted
FlatConfirmedAt
```

### ‏Outcome

```text
GrossOutcome
AllInCosts
NetOutcome
HoldTime
MFE
MAE
MfeCapture
MaxGiveback
TimeToFirstProfit
TimeToTarget
ExitSignalToFlat
PartialExitCount
UnknownStateCount
```

---

## ‏11. Promotion Criteria

‏Exit variant מתקדם רק אם:

- ‏משפר OOS net / risk-adjusted outcome מול Champion קפוא.
- ‏אינו מסתמך על optimistic fill assumptions.
- ‏משפר או שומר `TimeToFlat` במצבי risk.
- ‏אינו מגדיל tail loss באופן לא מקובל.
- ‏שומר Replay determinism ו־reason explainability.
- ‏הערך שורד periods/regimes/liquidity buckets רלוונטיים.
- ‏קיים robust parameter region, לא magic cell יחיד.
- ‏השיפור נותר לאחר modeled exit friction.

---

## ‏12. Rejection Criteria

‏נפסול/נוריד דרגה ל־Exit variant אם:

- ‏השיפור קיים רק in-sample.
- ‏Win Rate עולה אבל Net EV יורד.
- ‏הוא תלוי ב־trigger/target/time מדויקים מדי.
- ‏הוא פוגע משמעותית ב־best winners ללא compensation.
- ‏הוא מייצר re-entry churn.
- ‏הוא מעלה unknown/reconcile rate.
- ‏הוא מגדיל `TimeToFlat` במצבי emergency/risk.
- ‏הוא מניח `trigger == fill`.
- ‏הוא נשען על stale/non-executable price.

---

## ‏13. Metrics

### ‏Economic / Strategy

```text
NetOutcome
MedianEpisodeOutcome
TailLoss
MFE
MAE
MfeCapture
MaxGiveback
CapitalTimeInDeadPositions
```

### ‏Timing

```text
HoldTimeP50/P95/P99
TimeToFirstProfit
TimeToTarget
TimeToMFE
ExitSignalToSubmit
ExitSubmitToFirstFill
ExitSubmitToFlat
ExitSignalToFlat
```

### ‏Execution

```text
ExitSlippage
PartialExitRate
RejectRate
CancelRate
UnknownEffectRate
ReconciliationRate
EmergencyExitRate
```

### ‏Behavior

```text
ExitReasonDistribution
TimeStopRate
NoProgressShadowRate
ProfitExitRate
HardRiskRate
ReentryRate
ChurnPerInstrument
```

---

## ‏14. Failure Modes

1. ‏`Last` נגע ב־target אבל executable side לא.
2. ‏Trigger נחשב בטעות ל־Fill.
3. ‏Partial Exit מסומן `FLAT` מוקדם מדי.
4. ‏Local state חושב `FLAT` בעוד authoritative state לא.
5. ‏Timeout גורם ל־duplicate exit.
6. ‏Position outlives configured horizon ללא explicit exception.
7. ‏Entry price הופך לעוגן של “נחכה ל־break-even”.
8. ‏Scanner tuning מנסה לתקן Execution failure, או להפך.
9. ‏Exit tree מורכב מדי להסבר.
10. ‏Emergency path מתחרה עם Profit logic במקום לגבור עליו.
11. ‏Re-entry churn מוחק את ה־edge דרך friction.
12. ‏Data degradation בזמן Position מטופלת כמו מצב רגיל במקום capability degradation.

---

## ‏15. User-Specific Application

‏למערכת שלנו, שבה ה־Hypothesis הוא short-lived momentum ולא microsecond HFT, ה־Exit research צריך לשאול קודם:

```text
After a realistic fill,
how quickly do successful episodes show executable favorable progress?
```

‏ולאחר מכן:

```text
How does outcome change
when favorable progress does not appear by each measured horizon?
```

‏לכן Baseline המחקרי המומלץ הוא:

```text
first fill
→ arm hard risk + max time immediately
→ monitor executable progress
→ profit capture only on realizable/net basis
→ emergency/risk paths take precedence
→ keep no-progress / signal-decay in Shadow until validated
→ continue exit execution until authoritative flat
→ measure MFE / MAE / Giveback / TimeToFlat
```

---

## ‏16. Confidence

### ‏High Confidence

- ‏Exit plan חייב להיות קיים לפני Entry.
- ‏First fill מתחיל Position ו־Exit responsibility.
- ‏Position truth מבוססת fills/reconciliation.
- ‏Exit Decision ו־Exit Execution צריכים להיות נפרדים.
- ‏Partial Exit אינו `FLAT`.
- ‏Unknown effect מחייב reconciliation.
- ‏`FLAT` צריך להיות authoritative ומאומת.
- ‏Executable price עדיף על `Last` למדידת realizable outcome.

### ‏Medium Confidence

- ‏Fixed Risk + Max Time + simple Profit הוא Champion מחקרי טוב.
- ‏No-Progress הוא Challenger בעל התאמה חזקה ל־short-horizon thesis.
- ‏Urgency לפי exit reason עדיפה על policy אחת לכל exits.

### ‏Low / Unproven

- ‏Exact thresholds.
- ‏Trailing superiority.
- ‏Replacement/switching exits.
- ‏Regime-specific dynamic exits.
- ‏ML exit.

---

## ‏17. Time-Sensitive Facts

‏אין במסמך זה בחירה ב־Broker-specific Stop/Bracket/OCA behavior.

‏לפני כל שימוש תפעולי ביכולת חיצונית יש לאמת מחדש:

```text
stop trigger source
stop / stop-limit semantics
native vs simulated protection
bracket / OCA behavior
partial-fill child-order behavior
disconnect behavior
supported sessions / routes
```

‏Capability name לבדו אינו מספיק כדי להסיק מי מחזיק את ה־logic ומה קורה בזמן disconnect.

---

## ‏18. Recommended Baseline

```text
ACTUAL FIRST FILL
→ POSITION OPEN
→ ARM EXIT POLICY
→ MONITOR EXECUTABLE STATE
→ EVALUATE DETERMINISTIC EXIT PRECEDENCE
→ HOLD or EXIT(reason, urgency)
→ CREATE EXIT INTENT FOR ACTUAL REMAINING QTY
→ EXECUTE / OBSERVE PARTIAL FILLS
→ RECONCILE UNKNOWN EFFECTS
→ CONTINUE UNTIL AUTHORITATIVE FLAT
→ STORE EXIT EVIDENCE PACKET
→ REPLAY / RCA / CONTROLLED EXPERIMENT
```

‏ה־Champion הראשוני נשאר קטן וברור:

```text
Emergency / Safety
Hard Risk
Max Hold
Simple realizable Profit
+ No-Progress / Signal-Decay in Shadow until validated
```

‏הצלחה בשלב זה אינה “למכור תמיד בשיא”, אלא להוכיח Exit policy שניתנת לשחזור, מדידה, attribution ו־שיפור מבוקר.