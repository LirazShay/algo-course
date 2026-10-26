# ‏17 — Recommendation Sheet: Trade Exit Logic

> ‏מקור לימודי עיקרי: `../17-TRADE-EXIT-LOGIC.md`.
>
> ‏מטרת הקובץ: לקבוע איך Position פתוחה עוברת בצורה מדידה, מהירה ודטרמיניסטית ל־`FLAT`, תוך התאמה ל־Short-Horizon Momentum, שימוש במחיר בר־ביצוע ולא רק ב־`Last`, והפרדה בין Exit Decision לבין Exit Execution.

---

## ‏1. Decision

‏Exit אינו רק “מכור ב־+X% או ב־-Y%”.

‏המערכת צריכה לענות בכל רגע על שתי שאלות שונות:

```text
Exit Decision:
Should this position still be held?

Exit Execution:
If not, how should we get flat now?
```

‏לכן ה־Exit contract שלנו צריך להגדיר:

```text
profit logic
risk logic
thesis / signal logic
no-progress logic
time logic
emergency logic
exit urgency
execution policy
partial-exit behavior
reconciliation / flat confirmation
```

‏ה־Baseline צריך להתאים לתזה שלנו:

```text
short-lived momentum edge
→ expected follow-through quickly after fill
→ absence of progress is information
→ capital should not remain trapped in dead positions
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Exit Plan קיים לפני Entry Submit

‏לפני שנשלחת פקודת Entry, המערכת חייבת לדעת לפחות:

```text
profit policy
hard risk boundary
max holding time
no-progress policy status
emergency exit policy
exit execution modes
partial-fill protection policy
```

‏אין חובה שכל פקודות ה־Exit כבר יהיו resting אצל הברוקר.

‏אבל אסור להגיע ל־Fill ואז להחליט לראשונה מה עושים.

### ‏`P0 — Required`: Position מתחילה ב־Fill, ו־Exit Logic נדרך מיד

‏ברגע שיש אפילו Partial Fill:

```text
actual_filled_qty > 0
```

‏קיימת Position אמיתית.

‏לכן:

```text
first entry fill
→ position state begins
→ exit protection / monitoring begins immediately
```

‏לא מחכים ל־full fill ולא למחזור Scanner הבא.

### ‏`P0 — Required`: Exit Decision ו־Exit Execution הם מנגנונים נפרדים

‏`Exit Decision Engine` מחליט:

```text
HOLD
or
EXIT(reason, urgency)
```

‏`Exit Execution Engine` מחליט:

```text
order type
price cap / floor
aggressiveness
TTL
cancel / replace policy
partial-fill handling
```

‏הפרדה זו מאפשרת לשפר Logic ו־Execution בנפרד ולעשות RCA אמיתי.

### ‏`P1 — Preferred Default`: Competing Exit Conditions פשוטים

‏Baseline המחקרי הראשוני יהיה שילוב קטן וברור:

```text
1. Emergency / operational exit
2. Hard risk boundary
3. Profit target
4. No-progress / thesis decay rule
5. Maximum holding time
```

‏כל אחד מחזיר `exit_reason` קודי.

‏לא מתחילים עם:

```text
complex trailing
regime-specific trees
symbol-specific rules
ML exit
many overlapping thresholds
```

### ‏`P0 — Required`: Priority מפורש בין Exit Conditions

‏כאשר כמה תנאים מתקיימים יחד, ההחלטה חייבת להיות דטרמיניסטית.

‏Baseline:

```text
EMERGENCY / SYSTEM / RISK
        ↓
HARD RISK
        ↓
THESIS FAILURE / NO PROGRESS
        ↓
MAX HOLD TIME
        ↓
PROFIT OPTIMIZATION
```

‏הסדר המדויק ניתן לשינוי במחקר, אבל לא משאירים אותו כתוצאה מקרית של סדר `if`-ים.

### ‏`P1 — Preferred Default`: Fixed Maximum Holding Time

‏ה־Position חייבת לשאת:

```text
position_open_time
position_age_ms
max_holding_time_ms
```

‏עבור האסטרטגיה שלנו:

```text
seconds → tens of seconds → roughly one minute maximum where justified
```

‏המספר הסופי חייב להגיע מ־evidence.

‏אבל מבחינה הנדסית נדרשת invariant:

```text
position must not silently outlive configured strategy horizon
```

‏אם אי אפשר לצאת בגלל Halt/market state, עוברים ל־exception state מפורש — לא ממשיכים כאילו הכל רגיל.

### ‏`P1 — Preferred Default`: Early No-Progress Exit כ־Challenger ראשון

‏היפותזה חשובה במיוחד למערכת שלנו:

```text
if a good trade normally shows favorable executable progress quickly,
absence of such progress may itself predict failure
```

‏לכן נחקור Features כגון:

```text
position_age_ms
mfe_so_far
executable_pnl_now
return_since_fill
rank_change_since_entry
score_change_since_entry
activity_change_since_entry
spread_change_since_entry
```

‏אבל `No Progress` לא יהפוך ל־Hard Rule לפני validation.

### ‏`P1 — Preferred Default`: Profit Target נמדד ב־Net/Executable Terms

‏Take Profit אינו מופעל רק כי:

```text
Last >= target
```

‏עבור Long, נרצה לדעת אם ניתן למכור בפועל במחיר שמייצר רווח נטו.

‏נשמור לפחות:

```text
theoretical_pnl
mid_pnl
last_pnl
executable_pnl_using_bid
estimated_exit_cost
estimated_net_if_exit_now
```

‏ה־Baseline הכלכלי הוא:

```text
realizable / executable net outcome
```

‏לא movement תיאורטי.

### ‏`P0 — Required`: Hard Risk Exit אינו מבטיח מחיר

‏Stop trigger אינו Fill.

‏לכן אסור ל־Backtest או ל־Live accounting להניח:

```text
trigger_price == fill_price
```

‏ב־Risk Exit מודדים בנפרד:

```text
trigger_time
exit_decision_time
submit_time
first_fill_time
flat_time
trigger_reference_price
avg_exit_fill_price
slippage
```

### ‏`P1 — Preferred Default`: Exit Urgency נגזרת מסיבת ה־Exit

‏Baseline classifications:

```text
LOW
MEDIUM
HIGH
EMERGENCY
```

‏לדוגמה רעיונית:

```text
profit capture        → LOW/MEDIUM
no progress           → MEDIUM
thesis failure        → HIGH
hard risk             → HIGH
system/risk emergency → EMERGENCY
```

‏ה־urgency משפיעה על willingness לשלם Spread/Slippage כדי להגיע ל־`FLAT`.

### ‏`P0 — Required`: `Time to Flat` הוא מדד הסיום התפעולי

‏הסיכון לא הסתיים כאשר:

```text
exit order submitted
```

‏אלא כאשר:

```text
broker-authoritative position qty == 0
```

‏או מקור אמת מקביל ומאומת.

‏לכן אחד המדדים המרכזיים הוא:

```text
exit_signal_to_flat_ms
```

### ‏`P0 — Required`: Partial Exit הוא Position אמיתית

‏אם Position הייתה 100 וקיבלנו Sell Fill של 35:

```text
remaining_position = 65
```

‏המערכת נשארת ב־Position state.

‏כל risk protection, telemetry ו־Exit Execution ממשיכים על היתרה.

### ‏`P0 — Required`: Unknown Exit State דורש Reconciliation

‏אם:

```text
send exit
→ disconnect / timeout
```

‏אסור להניח:

```text
exit failed
```

‏ואסור לשלוח שוב אוטומטית.

‏הכלל:

```text
UNKNOWN != FAILED
```

‏קודם משחזרים:

```text
broker orders
executions
positions
```

‏ורק אז מחליטים מה חסר.

### ‏`P1 — Preferred Default`: Exit Reason Codes יציבים

‏Baseline reason taxonomy:

```text
TAKE_PROFIT
HARD_STOP
TIME_STOP
NO_PROGRESS
SIGNAL_DECAY
LIQUIDITY_FAILURE
RISK_KILL
DATA_FAILURE
BROKER_FAILURE
SYSTEM_FAILURE
MANUAL_EXIT
HALT_RECOVERY
```

‏אם בעתיד נוסיף Replacement:

```text
RANK_REPLACED
```

‏כל Reason חייב להיות machine-readable, versioned וניתן לניתוח קבוצתי.

### ‏`P1 — Preferred Default`: שני שעונים נשמרים בנפרד

‏חשוב להפריד:

```text
signal_age
position_age
```

‏לדוגמה:

```text
signal generated at T0
entry fill at T0 + 800ms
position age = 0 at fill
signal age at fill = 800ms
```

‏Exit research צריך לדעת את שניהם.

### ‏`P1 — Preferred Default`: Exit Policy Versioning

‏לכל Trade נשמור:

```text
exit_policy_version
exit_execution_policy_version
risk_policy_version
cost_model_version
feature_version
score_version
```

‏שינוי ב־Exit logic אינו מחליף בדיעבד את משמעות העסקאות הישנות.

---

## ‏3. Why

### ‏Fact

‏אותו Entry עם Exit שונה הוא אסטרטגיה כלכלית שונה.

### ‏Fact

‏Stop trigger אינו מבטיח Fill באותו מחיר.

### ‏Fact

‏Partial exit משאיר exposure אמיתי עד שהכמות שנותרה מגיעה לאפס.

### ‏Judgment

‏במערכת שבה Edge אמור להופיע בשניות הראשונות, `Time Stop` ו־`No Progress` חשובים לפחות כמו Fixed Stop קלאסי.

### ‏Hypothesis

‏ייתכן ש־fast-failure features כגון absence of executable progress, score decay, rank decay או activity collapse יאפשרו לצאת מוקדם יותר מעסקאות חלשות בלי לפגוע מהותית בעסקאות הטובות.

### ‏Economic Chain

```text
Entry Fill
→ Position Monitoring
→ Exit Decision
→ Exit Execution
→ Partial / Full Fill
→ Flat Confirmation
→ All-in Costs
→ Net Outcome
```

---

## ‏4. Use When

‏ה־Baseline מתאים כאשר:

- ‏יש Position truth אמין מבוסס fills.
- ‏Bid/Ask ו־freshness זמינים בזמן Position.
- ‏ניתן למדוד `executable_pnl`.
- ‏ניתן להבחין בין Signal/Thesis failure לבין Risk/System failure.
- ‏המערכת מסוגלת לשלוח Exit ולנטר Partial Fills.
- ‏קיים reconciliation מול broker state.
- ‏נשמר Timeline מלא למחקר MFE/MAE ו־counterfactual exits.

---

## ‏5. Do Not Use When

‏אין לקדם Exit policy ל־Live אם:

- ‏Position quantity המקומית אינה מסונכרנת עם fills/broker.
- ‏אין דרך לאמת `FLAT`.
- ‏Take Profit מבוסס רק על `Last` באסטרטגיה רגישה ל־spread.
- ‏Stop backtest מניח Fill מושלם ב־trigger.
- ‏אין טיפול ב־Partial Exit.
- ‏אין Emergency state מוגדר.
- ‏אין policy ל־disconnect בזמן Position.
- ‏Thresholds נבחרו על אותו Dataset שעליו מציגים ביצועים.

---

## ‏6. Alternatives

### ‏Alternative A — Fixed Target + Fixed Stop + Fixed Time

‏זה ה־Baseline הפשוט ביותר למחקר.

‏יתרונות:

- ‏קל להבין.
- ‏קל לשחזר.
- ‏קל לבצע parameter sweep.

‏חסרונות:

- ‏אינו משתמש במידע שמתפתח אחרי Fill.
- ‏עלול להיות קשיח מדי בין regimes.

### ‏Alternative B — Signal / Thesis Exit

```text
hold while thesis remains valid
exit when momentum/activity/rank/executability deteriorate
```

‏`P2 Challenger`.

### ‏Alternative C — No-Progress / Fast-Failure Exit

‏מותאם במיוחד ל־Short-Horizon Thesis.

‏`P2 Challenger` ראשון לאחר Baseline.

### ‏Alternative D — Trailing / Profit Lock

‏יכול לשמר חלק מ־MFE, אך מסוכן ל־micro-noise.

‏`P2/P3 Challenger`.

### ‏Alternative E — Volatility/Spread Normalized Exit

‏מתאים Thresholds למצב שוק.

‏`P3` לאחר שיש Baseline ו־regime evidence.

### ‏Alternative F — Replacement Exit

```text
exit current position
if a new opportunity has materially higher expected net value
```

‏`P3/P4` בלבד, משום שהוא מוסיף switching costs, churn ו־selection interaction.

### ‏Alternative G — ML / Learned Exit Policy

‏`P4 Specialist` בלבד.

‏נדרש dataset עשיר, causal point-in-time state, execution-aware labels ו־OOS validation חזק.

---

## ‏7. Trade-offs

### ‏Fixed Profit Target

‏יתרונות:

- ‏פשוט.
- ‏מדיד.
- ‏מייצר benchmark ברור.

‏חסרונות:

- ‏עלול לחתוך מהלכים חזקים מוקדם.
- ‏עלול להיות מתחת ל־true friction.

### ‏Hard Stop

‏יתרונות:

- ‏מגדיר גבול התנהגות.
- ‏מונע המתנה אינסופית לתיקון.

‏חסרונות:

- ‏trigger אינו fill guarantee.
- ‏Stop הדוק יכול להיפגע מ־noise/spread.

### ‏Time Stop

‏יתרונות:

- ‏מתאים ישירות ל־Signal Horizon.
- ‏משחרר Capital.

‏חסרונות:

- ‏עלול לצאת רגע לפני move מאוחר יותר.

### ‏Signal Exit

‏יתרונות:

- ‏מגיב לשינוי בתזה.

‏חסרונות:

- ‏אותו Signal שגרם ל־Entry לא בהכרח מותאם ל־Exit.
- ‏עלול להיות רועש.

### ‏Trailing

‏יתרונות:

- ‏יכול לשמור חלק ממהלך גדול.

‏חסרונות:

- ‏רגיש מאוד לפרמטרים ול־micro-noise.

### ‏Replacement

‏יתרונות:

- ‏מתייחס ל־opportunity cost.

‏חסרונות:

- ‏מגדיל turnover, spread/slippage ו־churn.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

```text
complex trailing ladders
multiple overlapping profit locks
regime-specific exit trees
symbol-specific exit parameters
online parameter adaptation
automatic replacement on every new Rank #1
ML exit
exit based on Last alone
hard-coded break-even at entry price
unbounded waiting for recovery
```

‏וגם לא עם עשרות Reason Codes שמייצגים אותו רעיון בשמות שונים.

---

## ‏9. What to Add Later

‏לפי Evidence אפשר להוסיף:

```text
validated no-progress rule
signal decay exit
profit lock
trailing logic
volatility-normalized thresholds
spread-normalized thresholds
regime-specific parameters
replacement / switching analysis
post-entry feature model
broker-native protective orders where semantics are verified
```

---

## ‏10. Required Data / Evidence

‏לכל Position נדרש Timeline מלא.

### ‏Entry state

```text
entry_signal_time
entry_decision_time
entry_fill_time
entry_avg_fill_price
entry_filled_qty
entry_execution_policy
signal_age_at_fill
```

### ‏Position timeline

```text
position_age_ms
bid
ask
mid
last
quote_age_ms
trade_age_ms
score
rank
activity
spread
executable_pnl
mfe_so_far
mae_so_far
```

### ‏Exit trigger

```text
exit_reason
exit_trigger_time
exit_decision_time
exit_reference_bid
exit_reference_ask
exit_reference_mid
exit_reference_last
remaining_qty
urgency
```

### ‏Execution

```text
exit_submit_time
ack_time
first_fill_time
final_fill_time
exit_avg_fill_price
filled_qty
remaining_qty
cancel_times
reject_reason
```

### ‏Outcome

```text
gross_pnl
all_in_costs
net_pnl
hold_time_ms
mfe
mae
time_to_first_profit
time_to_target
time_to_mfe
mfe_capture
exit_signal_to_flat_ms
```

---

## ‏11. Promotion Criteria

### ‏No-Progress Exit

‏לקדם מ־Shadow/Research רק אם:

- ‏הוא משפר OOS net EV או risk-adjusted outcome.
- ‏הוא מפחית dead-position time materially.
- ‏הוא אינו פוגע בצורה לא סבירה ב־best winners.
- ‏התוצאה שורדת כמה periods/regimes.
- ‏יש robust region לפרמטרים.

### ‏Signal Decay Exit

‏לקדם רק אם:

- ‏Post-entry signal deterioration מוסיף predictive information מעבר ל־price/time בלבד.
- ‏הוא משפר time-to-flat או tail losses בלי churn מוגזם.

### ‏Trailing / Profit Lock

‏לקדם רק אם:

- ‏MFE capture משתפר נטו.
- ‏turnover/extra spread אינם מוחקים את היתרון.
- ‏המדיניות אינה רגישה לפרמטר יחיד צר.

### ‏Replacement Exit

‏לקדם רק אם:

```text
incremental expected benefit
> switching friction + safety margin
```

‏וב־OOS נשאר שיפור אמיתי ב־capital efficiency.

---

## ‏12. Rejection Criteria

‏לדחות Exit variant אם:

- ‏השיפור קיים רק ב־in-sample.
- ‏הוא תלוי ב־exact target/stop/time cell.
- ‏הוא משפר Win Rate אך מוריד Net EV.
- ‏הוא מעלה tail losses.
- ‏הוא מייצר churn/re-entry loops.
- ‏הוא מניח fill לא מציאותי.
- ‏הוא מסתמך על `Last` כאשר executable side שונה מהותית.
- ‏הוא מגדיל time-to-flat במצבי Risk.
- ‏הוא פוגע ביכולת reconciliation.

---

## ‏13. Metrics

### ‏Strategy

```text
net_pnl
expected_value
median_trade
win_rate
avg_winner
avg_loser
P5 / P1 outcome
tail_loss
profit_factor as secondary metric
```

### ‏Timing

```text
hold_time_p50/p95/p99
time_to_first_profit
time_to_target
time_to_mfe
time_to_exit_decision
exit_signal_to_submit
exit_submit_to_first_fill
exit_submit_to_flat
exit_signal_to_flat
```

### ‏Excursions

```text
MFE
MAE
MFE capture
max giveback from MFE
```

### ‏Execution

```text
exit_slippage
partial_exit_rate
reject_rate
cancel_rate
unknown-state rate
emergency exit rate
```

### ‏Behavior

```text
exit_reason distribution
no-progress exit rate
time-stop rate
profit-exit rate
hard-stop rate
re-entry rate
churn per symbol
capital time in dead positions
```

---

## ‏14. Failure Modes

### ‏Failure 1 — `Last` Hit, Bid Never Did

‏Take Profit מופעל על מחיר תיאורטי שלא היה ניתן למימוש.

### ‏Failure 2 — Stop == Fill Assumption

‏Backtest מזייף Risk ביצוע.

### ‏Failure 3 — Position Flat Locally, Not at Broker

‏נוצר exposure לא ידוע.

### ‏Failure 4 — Exit Submitted == Exit Completed

‏Partial/No Fill נשכחים.

### ‏Failure 5 — Wait for Break-Even

‏Entry price הופך לעוגן פסיכולוגי במקום current expected value.

### ‏Failure 6 — Exit Too Complex

‏עשרות Rules מסתירים למה יצאנו.

### ‏Failure 7 — Fix Bad Scanner With Tight Stops

‏Selection failure מוסווה כ־Exit tuning.

### ‏Failure 8 — Blame Scanner for Slow Exit

‏Signal היה נכון אבל Execution מחק אותו.

### ‏Failure 9 — Overfit Exit Surface

‏Target/Stop/Time מדויקים מדי ואינם שורדים OOS.

### ‏Failure 10 — Re-entry Churn

‏אותו Symbol נכנס/יוצא שוב ושוב ומשלם friction.

### ‏Failure 11 — Disconnect Duplicate Exit

‏פקודה נשלחת שוב לפני reconciliation.

### ‏Failure 12 — No Hard Maximum

‏Short-Horizon Trade הופכת בטעות ל־Long Hold.

---

## ‏15. User-Specific Application

‏עבור המטרה שלנו — Edge קטן, מהיר, בשניות ולא HFT של microseconds — ברירת המחדל צריכה להעדיף **מהירות הוכחה של התזה** ולא רק “להגן על הפסד”.

‏כלומר המחקר הראשוני צריך לשאול:

```text
After a realistic fill,
how quickly do good trades show executable favorable progress?
```

‏ואז:

```text
How does success probability change
when no progress appears by 1s / 2s / 5s / 10s / ... ?
```

‏ה־Exit baseline יהיה:

```text
entry fill
→ immediately arm risk + max time
→ monitor executable progress
→ take profit when net realizable target exists
→ exit on hard risk
→ optionally exit early on validated no-progress / thesis failure
→ force planned exit by max holding time
→ verify broker-authoritative FLAT
→ re-rank market
```

‏אני לא ממליץ כרגע על:

```text
trail every profitable tick
switch on every new rank #1
hold until break-even
wait indefinitely because position is only slightly negative
```

---

## ‏16. Concrete / Baseline Contract

### ‏Position State

```text
POSITION_OPEN
EXIT_DECISION
EXIT_SUBMITTING
EXIT_WORKING
PARTIALLY_EXITED
FLAT_PENDING_RECONCILIATION
FLAT_CONFIRMED
EXIT_REJECTED
EXIT_UNKNOWN
HALTED_POSITION
RECOVERY
```

### ‏Decision Contract

```text
if system/risk emergency:
    EXIT with EMERGENCY urgency
else if hard risk condition:
    EXIT with HIGH urgency
else if validated thesis/no-progress condition:
    EXIT with configured urgency
else if position_age >= max_holding_time:
    EXIT
else if executable net profit >= validated target:
    EXIT / profit policy
else:
    HOLD
```

‏הסדר בפועל versioned וניתן לשינוי, אבל חייב להיות deterministic.

### ‏Execution Contract

```text
exit reason
→ map to urgency
→ select exit execution policy
→ submit for actual remaining qty
→ monitor fills
→ reconcile unknown states
→ continue until authoritative flat
```

### ‏Profit Contract

```text
profit target must be assessed against executable sell side
and all-in expected/realized costs
```

### ‏Time Contract

```text
position_age measured from actual fill
signal_age tracked separately
max holding time explicit
no silent overstay
```

---

## ‏17. Confidence

### ‏High Confidence

- ‏Exit plan צריך להיות מוגדר לפני Entry.
- ‏Actual fills קובעים Position quantity.
- ‏Exit decision ו־execution צריכים להיות נפרדים.
- ‏`FLAT` צריך להיות מאומת.
- ‏Partial Exit הוא State אמיתי.
- ‏`Last` לבדו אינו מספיק לרווח בר־מימוש.
- ‏Unknown broker state מחייב reconciliation.

### ‏Medium Confidence

- ‏Fixed Target + Hard Risk + Max Time הוא Baseline מחקרי טוב.
- ‏No-Progress הוא Challenger בעל התאמה חזקה ל־Short-Horizon Thesis.
- ‏Exit urgency לפי reason עדיפה על policy אחידה לכל exits.

### ‏Low / Unproven

- ‏Thresholds מדויקים.
- ‏Trailing superiority.
- ‏Replacement exit.
- ‏Dynamic regime-specific exits.
- ‏ML exit.

---

## ‏18. Time-Sensitive Facts

‏לפני Production צריך לאמת מחדש מול ה־Broker/API:

```text
stop order semantics
stop trigger source
stop-limit behavior
bracket support
OCA/OCO semantics
native vs simulated protection
behavior during disconnect
partial-fill child-order behavior
supported sessions / routes
```

‏אין להסתמך על שם Order בלבד כדי להסיק מי מחזיק את ה־logic או מה קורה בעת disconnect.

---

## ‏19. Current Verification Snapshot

‏לא נוסף במקטע זה Broker capability חדש מעבר למה שכבר נבדק במקטע 04.

‏לכן ה־Baseline כאן הוא ארכיטקטוני ומחקרי, וכל סמנטיקת Stop/Bracket/OCA תלויה־Broker נשארת מסומנת ל־re-verification לפני שימוש חי.

---

## ‏20. Relationship to Later Sheets

‏מקטע 17 מגדיר את ה־Exit contract, אך אינו סוגר נושאים מאוחרים יותר:

- ‏`18` — True Trading Costs / Net Edge יקבע את מודל העלויות המלא שמשפיע על target ו־break-even.
- ‏`19` — Position Sizing / Risk ירחיב את Risk boundaries.
- ‏`20+` — Backtest/Replay יגדירו סימולציה ריאליסטית של trigger, latency ו־fills.
- ‏פרקי Execution המאוחרים יבדקו advanced order tactics ו־capacity.
- ‏פרקי RCA/Observability ישתמשו ב־Exit telemetry שהוגדרה כאן.

---

## ‏21. Acceptance Tests

### ‏Test A — Profit Exists Only in Last

```text
Last above target
Bid below realizable target
```

‏Expected:

```text
profit condition does not falsely claim executable target reached
```

### ‏Test B — Partial Entry

```text
requested = 100
filled = 37
```

‏Expected:

```text
exit protection starts for 37 immediately
```

### ‏Test C — Partial Exit

```text
position = 100
exit fill = 35
```

‏Expected:

```text
remaining position = 65
state != FLAT
```

### ‏Test D — Exit Timeout / Unknown

```text
exit sent
network response unknown
```

‏Expected:

```text
no blind duplicate exit
reconciliation required
```

### ‏Test E — Max Hold

```text
position age exceeds configured max
market executable
```

‏Expected:

```text
exit decision generated
```

### ‏Test F — Halt

```text
position open
trading halted
```

‏Expected:

```text
explicit HALTED_POSITION state
no assumption that exit can fill
```

### ‏Test G — Replay Determinism

‏אותו market/position timeline + אותן versions:

```text
same exit reason
same trigger time
same intended policy
```

### ‏Test H — Emergency Precedence

‏אם Profit Target ו־system/risk emergency מתקיימים יחד:

```text
emergency reason/policy wins according to configured precedence
```

---

## ‏22. Recommendation Summary

```text
ENTRY FILL
→ start position truth
→ arm exit policy immediately
→ monitor executable state, not Last alone
→ evaluate competing exit conditions
→ classify exit reason + urgency
→ execute remaining actual quantity
→ handle partial/unknown states explicitly
→ verify authoritative FLAT
→ measure net outcome, MFE/MAE, slippage and time-to-flat
→ feed evidence back into research
```

‏ה־Baseline המומלץ הוא **פשוט, דטרמיניסטי וניתן להסבר**: Profit, Hard Risk, Time, optional validated No-Progress, ו־Emergency behavior. ‏Trailing, replacement ו־dynamic exits נכנסים רק אם הם מוכיחים incremental value נטו.
