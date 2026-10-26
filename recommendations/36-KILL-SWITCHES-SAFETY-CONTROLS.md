# ‏36 — Recommendation Sheet: Kill Switches / Safety Controls

> ‏מקור לימודי עיקרי: `../36-KILL-SWITCHES-AND-SAFETY-CONTROLS.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline לשכבת Safety עצמאית שמגבילה יצירת Exposure כאשר certainty יורדת, משמרת ככל האפשר יכולת להפחית Risk, מונעת stale intents ו־duplicate execution, ודורשת Evidence מפורש לפני Resume.
>
> ‏המקטע נשאר ברמת `Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי.

---

## ‏1. Decision

‏Safety אינה עוד תנאי בתוך ה־Strategy ואינה כפתור `STOP` יחיד.

‏ה־Baseline הוא `Safety Control Plane` עצמאי לוגית:

```text
Market Data / Broker / Risk / System Health
            ↓
        Safety Rules
            ↓
        Safety State
            ↓
    Capability Evaluation
            ↓
Risk / Execution Gate near broker boundary
```

‏כל Intent חדש עובר:

```text
Strategy Intent
→ Risk Approval
→ Safety Approval
→ Pre-submit Recheck
→ Execution
```

‏העיקרון המחייב:

```text
Unknown financial state => no new risk
Stopping risk is easier than resuming risk
Exit capability is evaluated separately from Entry capability
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Safety authority נפרדת מה־Strategy

‏ה־Strategy יכולה לבקש פעולה; היא אינה רשאית להעניק לעצמה permission לבצע אותה.

‏Safety קוראת Evidence מ־:

```text
Data Health
Broker Health
Position / Order Truth
Risk State
Clock Health
Queue / Persistence Health
Executor Ownership
Environment / Config Identity
```

‏ומחזירה capabilities בלבד.

### ‏`P0 — Required`: Capability-Based Safety

‏לא נסתפק ב־`isHealthy`.

‏נחשב לפחות:

```text
CanOpenNewPosition
CanIncreaseExposure
CanCancel
CanReduceExposure
CanExit
CanReconcile
CanResume
```

‏הפרדה זו חיונית משום ש־`fail closed` ל־Entry אינו צריך לחסום אוטומטית פעולה שמפחיתה Exposure.

### ‏`P0 — Required`: Safety modes קטנים וברורים

```text
NORMAL
BLOCK_NEW_ENTRIES
EXIT_ONLY
RECOVERING
FULL_HALT
```

‏פעולות כמו `CANCEL_PENDING_ENTRIES`, ‏`CANCEL_ALL` ו־`FLATTEN` הן Commands/Workflows — לא בהכרח permanent modes.

---

## ‏3. Why

‏במערכת short-horizon קטנה יחסית, נזק משמעותי יכול להגיע לא רק מ־Signal גרוע אלא מ־:

- ‏Market Data stale או partial universe.
- ‏Order effect שאינו ידוע.
- ‏Position mismatch.
- ‏Broker reconnect ללא reconciliation.
- ‏Queue backlog שמוציא Intent ישן.
- ‏Duplicate executor.
- ‏Config/environment mismatch.
- ‏Persistence failure.
- ‏Latency degradation שמוחק את ה־edge לפני execution.

‏לכן Safety צריכה להגן על correctness ו־risk boundaries גם כאשר ה־Strategy עצמה ממשיכה “לחשוב” שהכול תקין.

---

## ‏4. Use When

‏ה־Baseline חל על כל transition מ־Decision ל־Execution ובמיוחד כאשר:

- ‏המערכת ב־startup/restart/reconnect.
- ‏יש degradation ב־Data/Broker/System.
- ‏קיים `UNKNOWN_ORDER_EFFECT`.
- ‏קיים mismatch בין local ל־broker truth.
- ‏יש Position פתוחה או Pending Exposure.
- ‏ה־Safety state השתנה בזמן ש־Intent כבר בתור.
- ‏נעשית פעולה ידנית של Pause/Resume/Cancel/Recovery.

---

## ‏5. Do Not Use When

‏Safety אינה:

- ‏תחליף ל־Risk sizing.
- ‏תחליף ל־Execution policy.
- ‏תחליף ל־Recovery/Reconciliation.
- ‏מנגנון “להעניש” כל Trade מפסיד.
- ‏Optimizer לרווח.
- ‏דרך לעטוף Strategy גרועה בעשרות heuristics.

---

## ‏6. Safety Modes and Capabilities

| Safety Mode | New Entry | Increase Exposure | Cancel | Reduce/Exit | Reconcile |
|---|---:|---:|---:|---:|---:|
| `NORMAL` | כן | כן | כן | כן | כן |
| `BLOCK_NEW_ENTRIES` | לא | לא | כן | כן | כן |
| `EXIT_ONLY` | לא | לא | כן | כן | כן |
| `RECOVERING` | לא | לא | כן לפי Evidence | כן לפי Evidence | כן |
| `FULL_HALT` | לא | לא | לפי safe emergency path | לפי safe emergency path | כן/ידני |

‏הטבלה אינה אומרת שכל Exit תמיד מותר. גם פעולה שמקטינה Exposure דורשת שה־Execution path יהיה ידוע מספיק כדי לא ליצור duplicate או reversal.

---

## ‏7. Risk-Reducing ≠ Sell

‏`P0` — Safety מסווגת פעולה לפי Expected Resulting Exposure, לא לפי Buy/Sell.

‏נדרש Context:

```text
current_position
pending_exposure
working_orders
proposed_order
expected_resulting_position
```

‏לדוגמה, Buy יכול להפחית Short Exposure; Sell יכול להגדיל Short Exposure.

---

## ‏8. Safety Precedence

‏אם כמה Rules דורשים modes שונים, ה־mode המחמיר גובר:

```text
NORMAL
< BLOCK_NEW_ENTRIES
< EXIT_ONLY
< FULL_HALT
```

‏`RECOVERING` הוא lifecycle operational ולא בהכרח severity rank; capability evaluator הוא authority הסופי.

‏אין “last writer wins” בין Safety Rules.

---

## ‏9. Safety Scope

‏`P1` — כל Trigger מקבל scope מפורש:

```text
GLOBAL
ACCOUNT
STRATEGY
SYMBOL
DATA_PROVIDER
BROKER
```

‏ברירת המחדל היא blast radius מינימלי שמספיק כדי לשמור safety.

‏דוגמאות:

- ‏Symbol mapping בעייתי → `SYMBOL` block.
- ‏Provider-wide partial universe → `DATA_PROVIDER` או global Entry block.
- ‏Position truth לא ידוע בחשבון → `ACCOUNT`/global risk block.
- ‏Duplicate executor → `GLOBAL` hard safety.

---

## ‏10. Safety Reason Registry

‏כל Rule חייב `rule_id` יציב ו־reason code machine-readable.

‏Baseline reasons:

```text
DATA_STALE
DATA_COVERAGE_LOW
DATA_SEQUENCE_INTEGRITY_FAILED
FEATURE_WARMUP_INCOMPLETE
BROKER_DISCONNECTED
BROKER_UNSYNCED
ORDER_STATE_UNKNOWN
POSITION_MISMATCH
OPEN_ORDER_MISMATCH
DUPLICATE_EXECUTOR
PENDING_EXPOSURE_LIMIT
EXPOSURE_LIMIT
RISK_LIMIT
LATENCY_BREACH
QUEUE_STALE
CLOCK_UNHEALTHY
PERSISTENCE_UNAVAILABLE
CONFIG_MISMATCH
ENVIRONMENT_MISMATCH
INVARIANT_VIOLATION
MANUAL_SAFETY_COMMAND
```

‏אירוע יכול להכיל `primary_reason` ו־`secondary_reasons`.

---

## ‏11. Safety Rule Contract

```text
rule_id
purpose
scope
input_metric_or_invariant
trip_condition
trip_mode
latched
recovery_condition
manual_clear_required
hysteresis_policy
cooldown_policy
safety_policy_version
rationale
```

‏Threshold ללא rationale או Evidence הוא `magic number` ואינו Ready ל־promotion.

---

## ‏12. Hard Invariants First

‏לפני rules “חכמים”, נשתמש במספר קטן של invariants חזקים.

```text
No new risk when broker effect is unknown.
No new risk before broker reconciliation.
No new risk with unresolved position mismatch.
No entry from untrusted whole-market ranking.
No stale Intent may pass after a Safety epoch change.
No duplicate execution owner may create risk.
No duplicate exit may accidentally reverse exposure.
Restart may not clear a critical Safety latch.
Resume may not bypass Recovery validation.
```

‏Violation של invariant קריטי מוביל לפחות ל־latched Safety state.

---

## ‏13. Latched Safety

‏Critical causes אינם מתנקים רק כי metric חזר להיות ירוק.

‏Baseline latched reasons:

```text
UNKNOWN_ORDER_EFFECT
POSITION_MISMATCH
OPEN_ORDER_MISMATCH
DUPLICATE_EXECUTOR
STATE_CORRUPTION
ENVIRONMENT_MISMATCH
CRITICAL_INVARIANT_VIOLATION
```

‏המסלול:

```text
trip
→ latch remains active
→ reconcile / validate
→ explicit clear
→ re-arm
→ resume
```

---

## ‏14. Hysteresis and Cooldown

‏`P1` — transient health signals יכולים להשתמש ב־hysteresis/cooldown כדי למנוע flapping.

‏אין thresholds מספריים אוניברסליים.

‏הם צריכים להיגזר מ־:

- ‏Strategy horizon.
- ‏baseline distributions.
- ‏provider semantics.
- ‏observed false-positive / false-negative behavior.

‏Critical truth mismatches אינם נפתרים ב־hysteresis; הם דורשים reconciliation.

---

## ‏15. Safety Epoch

‏`P0` — כל שינוי Safety משמעותי מעלה `safety_epoch`.

‏כל risk-increasing Intent מחזיק:

```text
created_at
signal_expiry
safety_epoch_at_creation
```

‏לפני submit:

```text
intent.safety_epoch == current_safety_epoch
```

‏אינו מספיק לבדו, אך mismatch פוסל את ה־Intent ודורש החלטה חדשה.

‏כך Intent שנוצר לפני Kill event אינו “נוזל” ל־Broker לאחר מכן.

---

## ‏16. Safety Enforcement Point

‏Enforcement Point העיקרי צריך להיות קרוב ל־Execution/Broker boundary.

‏אפשר לבצע Defense in Depth ב־:

```text
Strategy
Risk
Execution
Broker Adapter
```

‏אבל `Safety State` אחד הוא authoritative; אין ארבע גרסאות שונות של אמת.

---

## ‏17. Data Safety

‏Entry חדש דורש לפחות:

```text
provider_health_known
fresh_coverage_ok
candidate_data_fresh
required_fields_present
feature_state_warmed
ranking_as_of_time_valid
no_material_sequence_integrity_fault
```

‏`connected=true` אינו Data Safety.

### ‏Whole-Market Rank Trust

‏Candidate טרי אינו מספיק אם שאר ה־Universe חלקי/stale.

‏Safety Gate משתמש ב־`fresh_coverage_ratio` וב־coverage/freshness contract מהפרקים 31–35.

### ‏Partial Data Failure

‏יש להבחין בין:

```text
quotes_missing
trades_missing
subset_symbols_stale
subscription_loss
full_provider_outage
```

‏התגובה יכולה להיות scoped, אך Rank whole-market שאינו trusted אינו רשאי ליצור Entry.

---

## ‏18. Broker Safety

‏Broker Ready דורש יותר מ־socket:

```text
session_authenticated
orders_snapshot_fresh
positions_snapshot_fresh
executions_synced
account_state_fresh
reconciliation_clean
no_unknown_effects
```

‏`UNKNOWN_ORDER_EFFECT` הוא Safety trigger מחייב.

‏אין Blind Retry של state-changing financial command.

---

## ‏19. Position / Order Safety

‏`P0` — broker truth מנצח לגבי actual execution state.

‏Triggers מחייבים:

- ‏Local/Broker Position mismatch.
- ‏Broker order ללא Local Intent מוכר.
- ‏Local Working Order שאינו תואם Broker snapshot.
- ‏Duplicate fill processing.
- ‏Late fill שמשנה Exposure אחרי Cancel request.

‏לא מבצעים silent repair; discrepancy נרשם כ־Incident/Recovery evidence.

---

## ‏20. Pending Exposure

‏Working orders נכללים ב־Exposure Safety.

‏Safety אינה יכולה להסתכל רק על `current_position`.

```text
current_exposure
+
pending_entry_exposure
+
unknown_effect_headroom
→ effective risk envelope
```

‏כאשר unknown effect אינו ניתן לכימות אמין, New Risk נחסם.

---

## ‏21. Risk Safety

‏Hard risk boundaries נשארים authority של Risk/Safety contracts ולא Strategy preferences.

‏Baseline classes:

- ‏Per-intent quantity/notional bounds.
- ‏Position/exposure limit.
- ‏Pending exposure limit.
- ‏Unexpected concurrent-position count.
- ‏Daily safety budget אם יוגדר בנפרד.

‏Loss streak או trade loss בודד אינם Hard Safety proof בפני עצמם.

---

## ‏22. Execution Safety

‏Execution-quality triggers מתחילים כ־Monitoring/Shadow עד שיש Evidence שמצדיק Trip behavior.

‏Candidates:

```text
ack_latency_tail_degradation
fill_latency_tail_degradation
reject_rate_spike
cancel_confirmation_degradation
slippage_distribution_shift
unknown_state_rate
```

‏ל־short horizon, latency יכולה להפוך מ־performance concern ל־risk concern כאשר ה־Signal TTL נצרך לפני execution.

---

## ‏23. Queue / Backpressure Safety

‏`queue_depth` אינו מספיק.

‏נמדוד גם:

```text
oldest_item_age
intent_age
signal_expiry_margin
processing_lag
```

‏כאשר Intent נהיה stale, עדיף בדרך כלל discard/re-decide מאשר execute “מאוחר אבל נכון פעם”.

---

## ‏24. Clock Safety

‏Freshness, TTL, ordering ו־latency תלויים ב־clock health.

‏נדרשים:

- ‏Monotonic clock ל־elapsed durations.
- ‏Wall-clock health ל־business timestamps/session state.
- ‏Explicit clock-health signal.

‏Clock uncertainty משמעותית חוסמת New Entries.

---

## ‏25. Infrastructure Safety

‏New Risk ייחסם כאשר רכיב קריטי שמאפשר durable/recoverable operation אינו אמין מספיק.

‏דוגמאות:

- ‏Durable store unavailable.
- ‏Critical write failure.
- ‏Disk/storage pressure שמאיים על durable state.
- ‏Internal event path שאינו מעביר Order/Fill truth.
- ‏Execution ownership לא חד־משמעי.

‏Telemetry exporter לבדו אינו critical truth store ולכן כשל בו אינו בהכרח Entry block; כשל ב־Order/Fill ledger כן.

---

## ‏26. Duplicate Executor / Split Brain

‏`P0` — execution owner יחיד.

‏Baseline:

```text
single execution process
+
ownership epoch / lease where needed
+
startup ownership validation
+
critical trip on duplicate owner suspicion
```

‏Heartbeat לבדו אינו proof של exclusivity.

‏Distributed consensus מלא אינו Baseline לרובוט אישי אלא אם architecture עתידית באמת דורשת אותו.

---

## ‏27. Manual Safety Commands

‏Operator commands הם חלק מ־Safety Control Plane, לא UI cosmetics.

‏Baseline controls:

```text
PAUSE_NEW_ENTRIES
EXIT_ONLY
CANCEL_PENDING_ENTRIES
CANCEL_ALL
RECOVER_RECONCILE
CLEAR_ELIGIBLE_LATCH
ARM_RESUME
```

‏`FLATTEN` נשאר workflow נפרד וחזק שדורש design/test מפורשים.

‏כל command מקבל:

```text
command_id
requested_at
requested_by
scope
reason
previous_state
result
correlation_id
```

---

## ‏28. Stop Easy, Resume Hard

‏ה־asymmetry מכוונת:

```text
Stop / Block = fast
Resume = evidence-heavy
```

‏`Resume` מגדיל שוב את ability ליצור Risk ולכן הוא עצמו risk-increasing decision.

---

## ‏29. Resume Contract

‏`CanResume` דורש Hard Gates:

```text
market_data_ready
broker_ready
reconciliation_clean
no_unknown_orders
positions_verified
working_orders_verified
risk_state_valid
clock_healthy
feature_warmup_complete
universe_trust_ok
executor_ownership_verified
no_critical_latch
config/environment identity verified
```

‏ואז:

```text
RECOVERY_VALIDATED
→ eligible latches cleared
→ ARM
→ NORMAL
```

‏Connection recovery לבדה אינה Resume.

---

## ‏30. Startup Default

‏Safe startup:

```text
STARTING
→ BLOCK_NEW_ENTRIES
→ broker sync / reconciliation
→ data warm-up / universe validation
→ safety validation
→ ARM
→ NORMAL
```

‏Restart אינו מחזיר `armed=true` אוטומטית כאשר policy דורשת explicit arming.

---

## ‏31. Safety State Durability

‏Critical latches ו־manual Safety state נשמרים durably.

‏Property מחייב:

```text
trip critical safety
→ process dies
→ restart
→ safety remains active
```

‏Restart אינו escape hatch.

---

## ‏32. Cancel Semantics

‏`Cancel requested != Cancel confirmed`.

‏אחרי Safety trip ייתכנו Fills בזמן cancel race.

‏לכן `CANCEL_PENDING_ENTRIES` workflow ממשיך לעקוב אחרי:

```text
cancel requests
broker acknowledgements
late fills
remaining working orders
resulting position
```

---

## ‏33. Flatten Safety

‏`FLATTEN` אינו “שלח Sell”.

‏אם יתווסף, הוא State Machine:

```text
FLATTEN_REQUESTED
→ inspect/reconcile position + working orders
→ handle conflicting orders
→ submit risk-reducing action per policy
→ process partial fills
→ reconcile
→ FLAT_CONFIRMED
```

‏`FLAT_CONFIRMED` דורש broker reconciliation, לא Local quantity=0.

‏אין Order Type חירום אוניברסלי שנקבע כאן.

---

## ‏34. FULL_HALT

‏`FULL_HALT` שמור למצבים שבהם גם automation שמנהלת Exit אינה אמינה מספיק.

‏דוגמאות:

- ‏State corruption.
- ‏Wrong account/environment identity.
- ‏Duplicate active executor.
- ‏Critical invariant failure ללא safe automated path.

‏אם Exposure קיים, `FULL_HALT` אינו “שכח מה־Position”; הוא מעביר ownership ל־explicit emergency/manual recovery path.

---

## ‏35. Safety Control Plane Independence

‏Safety path לא צריך להיות תלוי בדיוק באותו queue/path שהוא מנסה להגן מפניו.

‏`P2` — Watchdog/control path נפרד יותר כאשר Evidence מצדיק.

‏Baseline עדיין KISS:

- ‏מעט dependencies.
- ‏מעט moving parts.
- ‏Deterministic rules.
- ‏Durable Safety state.
- ‏Execution-side enforcement.

---

## ‏36. Broker-Native Protection

‏Broker-native safety mechanisms יכולים להיות שכבת Defense in Depth בלבד לאחר Current Verification של ה־broker semantics.

‏לא נקבע כאן capability ספציפית או order type ספציפי.

‏Client-side policy נשארת מודעת לכך שכל local logic נעלמת אם process מת.

---

## ‏37. Environment Permissions

‏Safety מגדירה permissions לפי Environment:

```text
REPLAY  → no external broker side effects
SHADOW  → no external broker side effects
PAPER   → paper adapter only
LIVE    → outside this segment; requires separate verified arming policy
```

‏Environment identity היא Hard Gate ולא Label לתצוגה בלבד.

---

## ‏38. Config Safety

‏כל run מחזיק:

```text
strategy_version
risk_policy_version
safety_policy_version
execution_policy_version
broker_adapter_version
config_hash
environment
```

‏שינוי Safety threshold בזמן Session הוא versioned/audited event.

‏Critical rule אינו משתנה “בשקט”.

---

## ‏39. Safety Telemetry

‏נמדוד לפחות:

```text
safety_trips_total
safety_mode_duration
blocked_entries_total
entry_intents_invalidated_by_epoch
latched_reasons_active
unknown_order_count
position_mismatch_count
resume_attempts
resume_denials
detection_latency
containment_latency
recovery_latency
```

‏Safety dashboard מציג:

```text
Current Safety Mode
Allowed Capabilities
Primary / Secondary Reasons
Latched Reasons
Positions
Working Orders
Pending Exposure
Data Health
Broker Health
Time Since Trigger
Recovery / Resume Blockers
```

---

## ‏40. Detection and Containment Latency

‏ל־short-horizon system חשוב למדוד:

```text
fault_time → detected_time
```

‏וגם:

```text
detected_time → new_risk_blocked_time
```

‏אלה מודדים Blast Radius תפעולי.

---

## ‏41. Safety Alerts

‏Alerts אינם enforcement.

‏State/Risk/Safety layer חייבים containment גם אם alerting אינו זמין.

‏Severity מתמקדת ב־:

- ‏Unknown financial state.
- ‏Exposure קיים.
- ‏יכולת להפחית Risk.
- ‏משך התקלה.
- ‏האם containment הצליח.

---

## ‏42. Safety Testing Strategy

### ‏Unit / Rule Tests

```text
stale data → no entry
position mismatch → latch
healthy metric alone → latch remains
reconciliation success + explicit clear → recovery allowed
```

### ‏Transition Tests

```text
NORMAL → BLOCK_NEW_ENTRIES
NORMAL → EXIT_ONLY
EXIT_ONLY → RECOVERING
RECOVERING → NORMAL only after gates
```

### ‏Invariant / Property Tests

```text
No risk-increasing order when safety denies it.
No stale Intent survives safety epoch change.
Critical latch survives restart.
Unknown order effect never creates blind retry.
Duplicate executor never creates intended new exposure.
```

### ‏Fault Injection

‏נזריק לפחות:

- ‏Broker disconnect.
- ‏Stale/partial data feed.
- ‏Lost ACK / unknown effect.
- ‏Partial fill during Kill.
- ‏Queue backlog.
- ‏Clock anomaly.
- ‏Persistence failure.
- ‏Duplicate process.
- ‏Position mismatch.

---

## ‏43. Golden Safety Scenarios

‏`P0` — scenario קטן וקבוע ב־CI/Replay:

1. ‏Stale whole-market coverage בזמן Candidate.
2. ‏Unknown order effect אחרי submit timeout.
3. ‏Partial fill בזמן `CANCEL_PENDING_ENTRIES`.
4. ‏Restart בזמן `EXIT_ONLY` — mode נשמר.
5. ‏Position mismatch — Entry חסום עד reconciliation.
6. ‏Duplicate executor — hard trip.
7. ‏Old queued Intent אחרי Safety epoch change — נדחה.
8. ‏Resume requested לפני recovery validation — נדחה.
9. ‏Broker healthy אבל Features עדיין warming — Entry נשאר חסום.
10. ‏Telemetry exporter נופל אך Truth Ledger פעיל — Safety path ממשיך.

---

## ‏44. Shadow Safety Calibration

‏לפני promotion של threshold חדש:

```text
Rule in Shadow
→ count would-block decisions
→ inspect true/false-positive-like cases
→ inspect missed hazards
→ Replay incidents
→ controlled policy comparison
→ promote only with rationale
```

‏Safety threshold אינו optimization target ל־PnL.

---

## ‏45. Compound Failures

‏`P2` — שני warnings יכולים להצדיק mode חזק יותר, אבל נמנע מ־rule explosion.

‏Baseline:

- ‏מעט composite rules.
- ‏Reason tree ברור.
- ‏אין expert system מסובך.

‏אם composite logic גדלה, נדרשת RCA/Experiment justification.

---

## ‏46. What I Would Avoid Initially

- ‏כפתור `STOP` יחיד ללא semantics.
- ‏Auto-Resume מיד כשהmetric “חזר לירוק”.
- ‏Retry-all policy.
- ‏`CANCEL_ALL` כאילו Cancel request = Gone.
- ‏`FLATTEN` שמסתמך רק על local Position.
- ‏עשרות Safety rules ללא rationale.
- ‏PnL-only Kill Switch.
- ‏Dynamic ML/anomaly Safety שמחליף hard invariants.
- ‏Distributed control plane מורכב ללא צורך.
- ‏Safety state שנשמר רק בזיכרון.
- ‏Manual override שמבטל את כל ה־Safety בבת אחת.

---

## ‏47. What to Add Later

### ‏`P2`
- ‏Watchdog independent יותר מה־Trading loop.
- ‏Baseline-relative latency/execution safety.
- ‏Scoped overrides עם expiry.
- ‏Automated Safety incident packets.
- ‏Policy version comparison ב־Replay/Shadow.

### ‏`P3`
- ‏Compound health rules לאחר מספיק evidence.
- ‏Provider/broker capability-specific defensive controls.
- ‏More independent control-plane deployment.
- ‏Advanced anomaly detection כ־advisory layer.

### ‏`P4`
- ‏Complex distributed fencing/control architecture רק אם architecture הופכת באמת multi-instance.

---

## ‏48. Required Data / Evidence

‏לקביעת thresholds אמפיריים צריך:

- ‏Freshness/coverage distributions לפי Session/Regime.
- ‏Queue age ו־decision latency tails.
- ‏Broker ack/fill/cancel distributions.
- ‏Reject/unknown-effect frequency.
- ‏Recovery incidents ו־near misses.
- ‏False-trip-like Safety events.
- ‏Cases שבהם rule לא הופעל אך היה צריך.
- ‏Signal TTL / edge decay evidence.
- ‏Fault-injection timings.

---

## ‏49. Promotion Criteria

‏Safety Rule מתקדם מ־Shadow/Research ל־enforced baseline רק אם:

1. ‏ה־hazard שהוא מגן מפניו מוגדר היטב.
2. ‏ה־input measurable ו־observable.
3. ‏ה־threshold/rule rationale מתועד.
4. ‏ה־scope נכון ואינו רחב ללא צורך.
5. ‏Trip behavior deterministic.
6. ‏Latching/recovery semantics מפורשים.
7. ‏Rule עבר Replay/Golden scenarios.
8. ‏Rule עבר Fault Injection רלוונטי.
9. ‏False-trip behavior נמדד.
10. ‏Resume Contract אינו ניתן לעקיפה.
11. ‏Rule versioned/audited.
12. ‏Safety action אינה שוברת Exit/Reconciliation path שלא לצורך.

---

## ‏50. Rejection Criteria

‏Rule נדחה/מוחזר למחקר אם:

- ‏הוא מבוסס על מספר קסם ללא Evidence.
- ‏הוא מגיב ל־PnL noise במקום hazard אמיתי.
- ‏הוא תלוי ב־Strategy internals בצורה שמונעת isolation.
- ‏הוא יוצר flapping משמעותי.
- ‏הוא מסתיר Cause תחת boolean כללי.
- ‏הוא מונע Risk reduction כשלא צריך.
- ‏הוא נשען על Local State שאינו authoritative.
- ‏הוא אינו testable/replayable.
- ‏הוא מגדיל complexity יותר מה־hazard שהוא פותר.

---

## ‏51. Metrics

### ‏Safety correctness

```text
risk_increase_after_critical_trip
stale_intent_executions_after_trip
resume_without_reconciliation
critical_latch_lost_on_restart
duplicate_executor_risk_events
```

‏ל־Hard invariants היעד הוא אפס violations, לא error budget.

### ‏Safety operations

```text
trip_count_by_rule
mode_duration
blocked_entry_count
resume_denial_count
recovery_success_count
manual_command_count
```

### ‏Latency / blast radius

```text
detection_latency
containment_latency
cancel_pending_duration
unknown_state_duration
recovery_latency
```

---

## ‏52. Failure Modes

- ‏Strategy bypasses Safety Gate.
- ‏Execution משתמש ב־cached stale Safety state.
- ‏Intent ישן נשלח אחרי trip.
- ‏Latch מתנקה אוטומטית ללא reconciliation.
- ‏Restart מאפס `EXIT_ONLY`/critical state.
- ‏Cancel race יוצר Position שלא מנוהלת.
- ‏Flatten יוצר reversal בגלל duplicate exit.
- ‏Manual override עוקף hard invariant.
- ‏Safety depends on failed telemetry path.
- ‏Too many rules hide the real reason.
- ‏Partial-universe ranking נחשב safe בגלל Candidate טרי.
- ‏Broker socket מחובר אך state אינו synchronized.

---

## ‏53. User-Specific Application

‏ל־whole-market short-horizon scanner, ה־Safety baseline חשוב במיוחד סביב ארבעה seams:

1. ‏`Market-wide rank trust` — Universe חלקי יכול ליצור Winner מזויף.
2. ‏`Signal age` — Queue/latency קצרה יחסית יכולה להפוך Intent ללא רלוונטי.
3. ‏`Broker uncertainty` — UNKNOWN אחד עלול להכפיל Exposure אם ממשיכים כרגיל.
4. ‏`Position-first recovery` — Signal אפשר לזרוק; Exposure קיימת חייבת להישאר מנוהלת.

‏לכן ה־MVP לא צריך מאות rules. הוא צריך מספר קטן של Gates חזקים שמונעים פעולה כאשר certainty בסיסית חסרה.

---

## ‏54. Concrete Baseline Contract

```text
1. Start BLOCK_NEW_ENTRIES by default
2. Reconcile broker truth
3. Warm and validate market-data universe
4. Validate risk / clock / persistence / executor ownership
5. Clear only eligible latches
6. Explicitly arm Safety NORMAL
7. Create Intent with safety_epoch
8. Run Risk approval
9. Run Safety approval near execution
10. Recheck safety_epoch + freshness before submit
11. On critical trigger: block new risk immediately
12. Invalidate queued stale entry intents
13. Cancel pending risk-increasing orders per policy
14. Keep callbacks / reconciliation / position management alive
15. Resolve UNKNOWN through broker truth, never blind retry
16. Restore capabilities gradually
17. Resume only after Recovery validation + explicit arm
18. Persist every trip, reason, command and transition
```

---

## ‏55. Recommended MVP Safety Rules

### ‏`P0`

```text
BROKER_UNSYNCED → BLOCK_NEW_ENTRIES
UNKNOWN_ORDER_EFFECT → latched BLOCK/RECOVERING
POSITION_MISMATCH → latched BLOCK/RECOVERING
DUPLICATE_EXECUTOR → FULL_HALT
PERSISTENCE_CRITICAL_FAILURE → BLOCK/EXIT_ONLY depending known exposure
ENVIRONMENT_MISMATCH → FULL_HALT
CRITICAL_INVARIANT_VIOLATION → latched safety
```

### ‏`P1`

```text
UNTRUSTED_WHOLE_MARKET_COVERAGE → BLOCK_NEW_ENTRIES
CANDIDATE_STALE → reject candidate
FEATURE_WARMUP_INCOMPLETE → BLOCK_NEW_ENTRIES
STALE_QUEUED_INTENT → reject intent
RISK_HARD_LIMIT → reject risk-increasing command
```

### ‏`P2`

```text
LATENCY_DEGRADATION
REJECT_SPIKE
SLIPPAGE_DEGRADATION
FILL_RATIO_COLLAPSE
```

‏`P2` מתחיל ב־Shadow עד שיש Evidence.

---

## ‏56. Confidence

- ‏**High** — fail-closed on unknown broker/position state; reconciliation-before-resume; durable latches; stale-intent invalidation; capability separation.
- ‏**High** — whole-market coverage/freshness as Entry safety for cross-sectional ranking.
- ‏**Medium** — exact degradation ladder/scope per incident; דורש testing/operational evidence.
- ‏**Low until measured** — numeric latency, coverage, slippage, reject or loss thresholds.

---

## ‏57. Time-Sensitive Facts

‏המקטע אינו מקבע Broker-specific numeric limits, Session semantics או native order capabilities.

‏כל שימוש עתידי ב־:

- ‏Broker-native protection.
- ‏Broker cancel-all.
- ‏Server-side conditional orders.
- ‏Specific API/session kill capability.

‏דורש Current Verification מול המקור הרשמי של אותו Broker בזמן המימוש.

---

## ‏58. Relationship to Earlier Sheets

- ‏`19` — Risk Management מגדיר risk boundaries; 36 אוכף safety/certainty boundaries סביבן.
- ‏`29` — Broker API Architecture מספק identifiers, state machine ו־reconciliation primitives.
- ‏`32` — Data/Execution separation מגדיר truth domains שבהם Safety משתמשת.
- ‏`33` — Production State Machine מספק system capabilities ו־state composition.
- ‏`34` — Failure Recovery מספק את מסלול החזרה מאירוע Safety.
- ‏`35` — Observability מספק detection/evidence, אך אינו enforcement.

---

## ‏59. Relationship to Later Sheets

‏`37–41` יעמיקו ב־Execution tactics, queue, routing ו־algo execution.

‏הם כפופים ל־Safety Contract של 36:

```text
Advanced execution tactic
cannot override
Risk / Safety / Broker truth
```

‏כל tactic חדשה צריכה להוכיח שאינה מרחיבה blast radius או מעקפת capabilities.

---

## ‏60. Recommendation Summary

‏ה־Baseline המומלץ:

```text
Independent Safety Authority
→ Few Strong Invariants
→ Explicit Safety Modes
→ Capability-Based Permissions
→ Fail Closed for New Risk
→ Preserve Risk-Reducing Paths when Safe
→ Durable Latches
→ Safety Epoch / Stale Intent Protection
→ Broker/Data/Risk/System Gates
→ Reconcile Before Trust
→ Explicit Arm / Resume
→ Replay + Fault Injection + Audit
```

‏המטרה אינה לבנות Safety “חכם”.

‏המטרה היא Safety משעמם במובן הטוב:

```text
simple
deterministic
observable
durable
testable
hard to bypass
```

‏כאשר certainty יורדת, המערכת מפסיקה ליצור Risk חדש לפני שהיא מנסה להיות “זמינה”.
