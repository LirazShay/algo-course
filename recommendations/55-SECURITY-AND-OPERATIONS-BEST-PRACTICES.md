# ‏55 — Recommendation Sheet: Security and Operations Best Practices

> ‏מקור לימודי עיקרי: `../55-SECURITY-AND-OPERATIONS-BEST-PRACTICES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline הנדסי ותפעולי ל־Security ו־Operations של רובוט `Short-Horizon Momentum`, כך שהיכולת ליצור side effects אצל Broker תהיה מוגבלת, מזוהה, versioned, auditable ו־fail-safe; תוך הפרדה חזקה בין סביבות, identities, permissions, build/config provenance, execution ownership, operator actions ו־incident/recovery controls.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו מאשר הפעלה בכסף אמיתי, אינו מגדיר Exposure אמיתי ואינו מבטיח רווח.

---

## ‏1. Decision

‏Security ו־Operations אצלנו אינם שכבת IT נפרדת מן המערכת הכלכלית.

‏הם חלק מ־Risk Control Plane.

‏ה־Baseline:

```text
Strategy Decision
→ Risk Permission
→ Security Readiness
→ Operational Readiness
→ Execution State Known
→ Entry Capability
→ Execution Engine
→ Broker
```

‏במקביל:

```text
Safety Control Plane
→ Block New Risk
→ Cancel Where Safe
→ Preserve Reconciliation
→ Preserve Risk-Reducing Capability
```

‏העקרונות המחייבים:

```text
Authenticated != Authorized
Authorized != Trading Ready
Process Alive != Safe To Trade
Connected != Reconciled
Config Present != Config Verified
Build Running != Build Approved
Unknown External State != Permission To Continue
```

‏כאשר Security/Operations state אינו `KNOWN_GOOD`, ברירת המחדל היא:

```text
BLOCK_NEW_ENTRIES
```

‏אך לא:

```text
BLOCK_ALL_RISK_REDUCTION
```

‏Security design שאינו מאפשר לצמצם Risk בזמן תקלה הוא design מסוכן.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏SecurityReadiness מפורש

‏נחזיק state מפורש:

```text
SecurityReadiness
{
  environment_verified,
  account_verified,
  credentials_healthy,
  authorization_known,
  build_verified,
  config_verified,
  execution_ownership_verified,
  safety_controls_healthy,
  audit_pipeline_healthy_or_degraded_known
}
```

‏ה־state אינו boolean נאיבי.

‏נרצה לפחות:

```text
GOOD
DEGRADED
BLOCKED
UNKNOWN
```

‏`UNKNOWN` אינו `GOOD`.

### ‏`P0 — Required`: ‏OperationalReadiness מפורש

```text
OperationalReadiness
{
  market_data_healthy,
  broker_healthy,
  reconciliation_complete,
  persistence_healthy,
  clock_healthy,
  queues_healthy,
  telemetry_state_known,
  no_unresolved_critical_incident
}
```

‏גם כאן:

```text
GOOD
DEGRADED
BLOCKED
UNKNOWN
```

### ‏`P0 — Required`: ‏Final Entry Gate

```text
CanEnter =
    StrategySaysTrade
 && RiskAllows
 && SecurityReadiness == GOOD
 && OperationalReadiness == GOOD
 && ExecutionState == KNOWN
 && SafetyState allows new risk
```

‏אם אחד התנאים אינו מתקיים:

```text
NO_TRADE
```

‏עם Reason Code מפורש.

### ‏`P0 — Required`: ‏Risk-Reduction Capability נפרדת

‏לא נשתמש בהרשאה אחת בשם:

```text
trading_allowed
```

‏אלא נפריד לפחות רעיונית:

```text
can_create_new_risk
can_cancel_working_risk
can_reduce_existing_risk
can_flatten_authorized_scope
```

‏כך failure ב־Entry readiness אינו הופך אוטומטית לאובדן יכולת ניהול Position קיימת.

### ‏`P0 — Required`: ‏Environment Isolation חזקה

‏לפחות:

```text
DEV
TEST
PAPER
LIVE
```

‏ההפרדה אינה flag יחיד.

‏היא צריכה לכלול, ככל שניתן:

```text
endpoint
credential
account identity
data store
telemetry labels
config namespace
artifact policy
```

‏Test process אינו אמור להיות מסוגל להגיע במקרה ל־Live execution capability.

### ‏`P0 — Required`: ‏Live אינו Default

‏ברירת המחדל:

```text
live_authorized = false
```

‏מעבר ל־Live אינו side effect של startup.

‏הוא דורש proof של readiness ו־explicit activation לפי policy.

### ‏`P0 — Required`: ‏Account Fingerprint

‏Startup/Recovery חייבים לאמת account/environment identity.

‏דוגמה רעיונית:

```text
environment = LIVE
expected_account_fingerprint = X
reported_account_fingerprint = Y

if X != Y:
    BLOCK_NEW_ENTRIES
```

‏אין fallback אוטומטי לחשבון “האחר שמצאנו”.

### ‏`P0 — Required`: ‏Single Active Execution Owner

‏לכל execution scope:

```text
one active owner
```

‏ה־scope יכול להיות:

```text
account
account + strategy
account + instrument set
```

‏לפי הארכיטקטורה.

‏שני processes אינם רשאים לחשוב בו־זמנית שהם owner של אותו side-effect scope.

### ‏`P0 — Required`: ‏Fencing נגד stale owner

‏Leader election לבדו אינו מספיק.

‏כאשר יש סיכון ל־split brain, נשתמש ב־generation/fencing semantics:

```text
execution_epoch
owner_token
lease_generation
```

‏Command מדור ישן אינו מקבל authority להגדיל Risk.

### ‏`P0 — Required`: ‏Broker Reconciliation לפני Entry

‏לאחר:

```text
startup
restart
reconnect
deployment
ownership transfer
manual broker action
```

‏אין Entry חדש לפני שנקבע:

```text
open orders
positions
fills
pending exposure
unknown effects
```

‏מול Broker truth.

### ‏`P0 — Required`: ‏Secrets אינם Config רגיל

‏Secret לא ייכנס ל־:

```text
source code
README
sample config with real value
logs
exception payloads
replay fixture
build artifact metadata
```

‏ה־Baseline הוא secret store מוגבל ככל שהתשתית מאפשרת.

### ‏`P0 — Required`: ‏Credential Scope מינימלי

‏נפריד identities לפי תפקיד:

```text
human_operator
machine_execution
market_data_reader
ci_pipeline
monitoring_reader
```

‏והרשאות לפי capability:

```text
read_market_data
read_account
place_orders
change_config
operate_deployment
```

‏אין credential אחד שמקבל הרשאות רחבות “כי זה פשוט”.

### ‏`P0 — Required`: ‏Credential Inventory + Rotation

‏לכל credential נשמור לפחות:

```text
credential_id_or_alias
service
scope
environment
owner
created_at
last_rotated_at
expiry_if_any
revocation_procedure
```

‏תהליך Rotation חייב להיות מתורגל לפני Incident.

### ‏`P0 — Required`: ‏Secret Redaction אוטומטי

‏נגדיר registry לשדות רגישים:

```text
api_key
access_token
refresh_token
session_token
account_identifier_if_sensitive
authorization_header
cookie_or_session_secret
```

‏Redaction מתבצע ברמת logging infrastructure ככל האפשר.

### ‏`P0 — Required`: ‏Config הוא Risk Artifact

‏Config משנה behavior ולכן הוא versioned artifact.

‏לכל Decision משמעותי נוכל לדעת:

```text
config_version
strategy_version
risk_version
feature_version
execution_version
```

‏Runtime mutation ללא provenance אינה מותרת.

### ‏`P0 — Required`: ‏Safe Config Defaults

‏חסר ערך מסוכן:

```text
missing_limit
```

‏לא הופך ל־:

```text
unlimited
```

‏אלא:

```text
INVALID_CONFIG
→ BLOCK_NEW_ENTRIES
```

### ‏`P0 — Required`: ‏Explicit Units ב־Config

‏נעדיף:

```text
max_notional_usd
max_hold_ms
max_loss_bps
quote_freshness_ms
```

‏על שמות עמומים.

### ‏`P0 — Required`: ‏Cross-Field Validation

‏Validation אינו רק field-by-field.

‏נבדוק גם יחסים:

```text
entry_enabled => risk_engine_enabled
live_authorized => verified_live_account
entry_timeout_ms <= signal_ttl_ms
max_position <= account_cap
```

### ‏`P0 — Required`: ‏Immutable Deploy Artifact

‏ה־artifact שנבדק הוא ה־artifact שנפרס.

‏נשמור:

```text
commit_sha
build_id
artifact_hash
build_time
runtime_version
dependency_lock_version
```

‏Production אינה rebuild אקראי של אותו commit.

### ‏`P0 — Required`: ‏Deploy מתחיל Trading Disabled

‏ה־flow:

```text
build
→ verify
→ deploy with trading disabled
→ health checks
→ reconcile
→ readiness proof
→ explicit activation
```

‏`process started` אינו authorization.

### ‏`P0 — Required`: ‏Audit Trail ל־Privileged Actions

‏לפחות:

```text
login / privileged session
permission change
secret rotation
deployment
config activation
risk-limit change
live enable / disable
manual broker action
kill switch
manual reconciliation override
ownership transfer
```

‏Audit record יכיל:

```text
actor
action
resource
environment
result
timestamp
source
correlation_id
reason_if_applicable
```

### ‏`P0 — Required`: ‏Manual Action מחייב Reconciliation

‏אם Operator פועל ישירות מול Broker:

```text
manual cancel
manual close
manual order
```

‏המערכת אינה “ממשיכה כאילו לא קרה דבר”.

‏נדרש:

```text
record manual action
→ reconcile broker truth
→ rebuild local state
→ validate invariants
→ only then consider resume
```

### ‏`P0 — Required`: ‏Incident Priority

```text
Protect Existing Exposure
→ Establish External Truth
→ Block New Risk
→ Preserve Evidence
→ Reconcile / Recover
→ Prove Readiness
→ Resume
→ Restore Alpha Generation
```

‏Alpha generation היא האחרונה בשרשרת בזמן Incident.

### ‏`P0 — Required`: ‏No Blind Retry During Uncertainty

‏ב־execution/security incident:

```text
timeout
unknown effect
auth transition
reconnect
```

‏לא שולחים שוב פעולה שעלולה להכפיל side effect לפני reconciliation/idempotency proof.

### ‏`P0 — Required`: ‏Resume הוא Operation מפורש

‏היעלמות trigger אינה Resume.

‏Resume דורש לפחות:

```text
orders_known
positions_known
pending_exposure_known
risk_state_restored
data_fresh
clock_sane
correct_build
correct_config
correct_account
safety_controls_healthy
```

### ‏`P0 — Required`: ‏Latching ל־Critical Safety State

‏אירוע חמור אינו מתאפס משום שמדד אחד חזר לנורמה לרגע.

‏נשתמש ב־latched state כאשר failure semantics מצדיקים זאת.

### ‏`P0 — Required`: ‏Safety Control Plane נפרד רעיונית

```text
Trading Data Plane
!=
Safety Control Plane
```

‏אם Scanner תקוע, Kill Switch/Block-New-Risk path עדיין צריך להיות זמין ככל שניתן.

### ‏`P0 — Required`: ‏Kill/Flatten Path פשוט

‏Emergency control אינו צריך להיות תלוי בעשרות רכיבים לא־קשורים.

‏הוא צריך להיות:

```text
simple
well-known
audited
tested
```

### ‏`P1 — Preferred`: ‏Minimal Network Exposure

‏Service מקומי:

```text
bind only where required
```

‏לא נחשוף network interface ציבורי רק כי `localhost` bridge היה נוח בפיתוח.

### ‏`P1 — Preferred`: ‏Separation of Market Data and Execution Credentials

‏Market Data process אינו צריך execution credential.

‏Research process אינו צריך trading permission.

‏Execution component צריך להיות קטן ובעל dependency surface מצומצם ככל האפשר.

### ‏`P1 — Preferred`: ‏Dedicated Execution Runtime כשמבשיל הצורך

‏ככל שהמערכת נעשית קריטית יותר, עדיף שה־execution runtime לא ישתף blast radius עם:

```text
browser experimentation
notebooks
large research jobs
untrusted plugins
random desktop workloads
```

‏זה אינו requirement ל־POC, אבל הוא יעד ארכיטקטוני סביר.

### ‏`P1 — Preferred`: ‏Operational Dashboard אחד ברור

‏צריך לענות מהר:

```text
Current environment?
Current account fingerprint?
Current build/config?
Open positions?
Open/unknown orders?
Pending exposure?
Market data health?
Broker health?
Risk/Safety state?
Execution owner?
Last reconciliation?
```

### ‏`P1 — Preferred`: ‏Read-Only by Default

‏Observation permission אינה Control permission.

‏Dashboard יכול להיות read-only כברירת מחדל.

### ‏`P1 — Preferred`: ‏Visible Environment Identity

‏`LIVE` חייב להיות קשה לבלבול.

‏Environment/account identity הם חלק מה־UI contract, לא decoration.

### ‏`P1 — Preferred`: ‏Change Management פשוט

‏לשינוי משמעותי נשמור:

```text
what_changed
why
risk
validation_plan
rollback_or_forward_recovery_plan
owner
```

### ‏`P1 — Preferred`: ‏One Major Change at a Time

‏לא נחליף יחד בלי צורך:

```text
strategy
broker adapter
market-data provider
deployment model
capital assumptions
```

‏אחרת attribution/RCA כמעט בלתי אפשריים.

### ‏`P1 — Preferred`: ‏Post-Deploy Observation Window

‏אחרי שינוי behavior משמעותי נרצה period של Observation/Shadow/Paper evidence לפני הרחבת scope.

‏ה־Sheet אינו מאשר Live ramp; הוא רק מגדיר את עקרון ההפרדה בין deploy validation לבין expansion of risk.

### ‏`P1 — Preferred`: ‏Runbooks קצרים ומתורגלים

‏Runbook טוב עונה:

```text
what happened?
what do I check first?
how do I block new risk?
how do I establish broker truth?
how do I preserve risk reduction?
how do I preserve evidence?
how do I prove readiness?
```

### ‏`P1 — Preferred`: ‏Incident Packet

‏בעת Incident נשמור:

```text
incident_id
started_at
detected_at
contained_at
recovered_at
severity
build_version
config_version
account_fingerprint
execution_owner
broker_state
orders/fills/positions
pending_exposure
market-data health
queue age
clock health
alerts
operator actions
```

### ‏`P1 — Preferred`: ‏Severity Model

‏דוגמה:

```text
SEV1 — uncontrolled / unknown exposure
SEV2 — trading blocked or broker state uncertain
SEV3 — degraded data/performance with safety intact
SEV4 — noncritical tooling issue
```

‏המספרים/שמות יכולים להשתנות; עצם ההבחנה חשובה.

### ‏`P1 — Preferred`: ‏Operational SLOs

‏נמדוד למשל:

```text
time_to_detect
time_to_block_new_entries
time_to_reconcile
time_to_known_state
time_to_flat_when_authorized_and_possible
time_to_revoke_credential
restart_to_reconciled
restart_to_ready
```

### ‏`P1 — Preferred`: ‏External Dependency Health Matrix

```text
CONNECTED
DEGRADED
STALE
DISCONNECTED
UNKNOWN
```

‏ננהל זאת לפחות עבור:

```text
market_data
broker
persistence
telemetry/control_plane
clock_sync
```

### ‏`P1 — Preferred`: ‏Graceful Degradation

‏Failure ב־Telemetry אינו בהכרח אותו דבר כמו Failure ב־Broker.

‏לכל dependency נגדיר blast radius.

‏אבל אם המידע הנדרש ליצירת Risk חדש אינו אמין:

```text
BLOCK_NEW_ENTRIES
```

### ‏`P1 — Preferred`: ‏Operational Resource Guards

‏ננטר:

```text
disk space
memory pressure
CPU saturation
queue age
network degradation
reconnect frequency
message lag
```

‏Resource exhaustion הוא גם Risk event כאשר הוא פוגע ב־freshness או persistence.

### ‏`P1 — Preferred`: ‏Daily Self-Check כרעיון תפעולי

‏ב־Paper/Shadow/Production-design נוכל להפעיל health proof אוטומטי:

```text
identity
account
data
broker
risk
state
build
config
execution ownership
```

‏הוא אינו מחליף runtime monitoring.

### ‏`P2 — High Value`: ‏Secret Scanning

‏נוסיף בדיקות repository/CI לזיהוי accidental secrets.

### ‏`P2 — High Value`: ‏Dependency Inventory / SBOM Concept

‏נרצה לדעת אילו packages/versions רצים כדי לזהות blast radius של vulnerability.

### ‏`P2 — High Value`: ‏Production Diff

‏לפני activation נציג:

```text
build diff
config diff
risk-rule diff
feature-flag diff
```

‏לעומת ה־approved production state.

### ‏`P2 — High Value`: ‏Two-Step Activation לשינוי מסוכן

‏נפריד:

```text
edit
→ validate
→ activate
```

‏גם במערכת אישית.

### ‏`P2 — High Value`: ‏Temporary Override Expiry

‏Override זמני מקבל:

```text
reason
owner
created_at
expires_at
scope
```

‏אין override “עד שמישהו יזכור”.

### ‏`P2 — High Value`: ‏Watchdog חיצוני פשוט

‏אם evidence מצדיק, Watchdog נפרד יכול לבדוק:

```text
process heartbeat
progress heartbeat
queue age
control-plane reachability
```

‏Heartbeat אינו proof של correctness.

### ‏`P2 — High Value`: ‏Security/Operations Drills

‏נבדוק ב־Paper/Test:

```text
credential revoked
wrong account
wrong environment
second execution instance
broker disconnect
feed stale
config invalid
disk pressure
clock drift
restart with existing state
```

### ‏`P3 — Advanced`: ‏Stronger Artifact Provenance

‏Signed/trusted artifacts, attestation ו־stronger supply-chain controls ייכנסו כאשר deployment path וה־risk מצדיקים.

### ‏`P3 — Advanced`: ‏Outbound Network Restrictions

‏Allow-listing של destinations יכול להפחית blast radius, אך מוסיף Operations complexity.

### ‏`P3 — Advanced`: ‏More Formal Fencing / Lease Infrastructure

‏אם עולים ל־multi-process/HA execution, נבחן fencing חזק יותר.

### ‏`P4 — Specialist`: ‏Enterprise IAM / SIEM / Zero-Trust Platform

‏לא Baseline למערכת אישית.

‏יוכנס רק אם scale, users, infrastructure או regulatory context יצדיקו.

---

## ‏3. Why

‏ה־Strategy יכולה להיות נכונה ועדיין להפסיד correctness ברגע האחרון בגלל:

```text
wrong account
wrong environment
wrong build
wrong config
stale process
duplicate process
expired credential
manual action not reconciled
unknown broker state
unsafe deploy
```

‏אלה אינם “Operational annoyances”.

‏הם יכולים לשנות ישירות את ה־economic side effect.

‏לכן Security/Operations הם חלק מהשרשרת:

```text
Signal
→ Decision
→ Risk
→ Authorization
→ Operational Readiness
→ Execution
→ Position
→ Net Outcome
```

---

## ‏4. Use When

‏ה־Baseline נדרש כאשר המערכת:

- ‏מחזיקה Broker/Data credentials.
- ‏יכולה ליצור side effect חיצוני.
- ‏מריצה Paper/Shadow/Execution simulator שצריך parity ל־Production.
- ‏עוברת בין environments.
- ‏מאפשרת operator controls.
- ‏מבצעת restart/reconnect/recovery.
- ‏משתמשת ב־browser/local bridge.
- ‏מקבלת config/version changes.
- ‏מחזיקה audit/replay evidence.

---

## ‏5. Do Not Use When

‏לא נשתמש ב־Enterprise complexity כאשר:

- ‏אין external side effects.
- ‏אין multi-user permission model.
- ‏אין צורך ב־HA/multi-instance execution.
- ‏control פשוט ונבדק פותר את הבעיה.

‏לא נכניס security mechanism כבד למסלול החם אם אפשר לקבל אותו proof מראש ולשמור state מקומי versioned.

---

## ‏6. Alternatives

### ‏חלופה A — Config Flag בלבד

```text
live=true
```

‏יתרון:

- ‏פשוט.

‏חסרונות:

- ‏קל מדי לטעות.
- ‏אין account proof.
- ‏אין readiness proof.
- ‏אין ownership proof.

‏מסקנה:

```text
REJECT AS PRIMARY SAFETY MODEL
```

### ‏חלופה B — Manual Checklist בלבד

‏יתרון:

- ‏קל להתחיל.

‏חסרונות:

- ‏שביר תחת לחץ.
- ‏לא machine-verifiable.
- ‏אין guarantee ששלב לא נשכח.

‏מסקנה:

‏Checklist תומך ב־automated gates; הוא לא מחליף אותם.

### ‏חלופה C — Fully Automated Auto-Resume

‏יתרון:

- ‏זמינות גבוהה.

‏חסרונות:

- ‏עלול להחזיר Risk לפני שנבנתה truth מלאה.

‏מסקנה:

```text
AVOID UNTIL RECOVERY EVIDENCE IS STRONG
```

### ‏חלופה D — Full Enterprise Security Stack

‏יתרון:

- ‏יכולות רחבות.

‏חסרונות:

- ‏complexity.
- ‏operational burden.
- ‏יותר failure surface.

‏מסקנה:

```text
SPECIALIST OPTION
```

---

## ‏7. Trade-offs

### ‏Security vs Latency

‏לא נבצע remote authorization round-trip לכל candidate אם authorization state יכול להיות prevalidated locally.

‏אך לא נסיר control מהותי רק כדי לחסוך latency זניח.

### ‏Security vs Availability

‏Fail-closed ל־Entry יכול להקטין זמן פעילות.

‏זה trade-off מכוון כאשר state חיצוני אינו ידוע.

### ‏Auditability vs Logging Cost

‏Privileged actions ו־Order/Fill truth חייבים traceability.

‏Noncritical telemetry יכולה להיות sampled.

### ‏Isolation vs Complexity

‏Process isolation מפחית blast radius אך מוסיף network/process complexity.

‏לכן baseline הוא modular/simple ורק אחר כך פיצול לפי Evidence.

### ‏Automatic Recovery vs Safety

‏Auto-reconnect מועיל.

‏Auto-resume של new risk הוא decision אחר ודורש proofs נוספים.

---

## ‏8. What I Would Avoid Initially

‏לא להתחיל עם:

- ‏Enterprise IAM hierarchy גדולה.
- ‏עשרות microservices.
- ‏SIEM מורכב.
- ‏Dynamic policy engine מרוחק לכל Order.
- ‏remote admin exposure ציבורי.
- ‏multi-active execution.
- ‏automatic live enable after restart.
- ‏auto-resume אחרי incident ללא reconciliation.
- ‏shared human accounts.
- ‏shared DEV/LIVE credential.
- ‏secrets בקוד browser.
- ‏unbounded feature flags ב־Live.
- ‏dependency auto-update ישירות ל־Production.
- ‏rollback assumptions שמתעלמים מ־Broker state.

---

## ‏9. What to Add Later

‏לפי Evidence:

1. ‏Stronger artifact signing/attestation.
2. ‏Automated secret rotation.
3. ‏External watchdog.
4. ‏Outbound allow lists.
5. ‏Formal lease/fencing service.
6. ‏Stronger dependency/SBOM automation.
7. ‏Independent alert path.
8. ‏Security event analytics.
9. ‏More formal incident game-days.
10. ‏HA/failover only if required.

---

## ‏10. Required Data / Evidence

‏נשמור לפחות:

### ‏Identity / Authorization

```text
actor_id
service_identity
environment
account_fingerprint
authorization_state
authorization_version
credential_alias
credential_health
```

### ‏Build / Config

```text
commit_sha
build_id
artifact_hash
config_version
risk_version
strategy_version
feature_version
execution_version
```

### ‏Ownership

```text
execution_owner_id
execution_epoch
ownership_acquired_at
ownership_status
```

### ‏Readiness

```text
security_readiness
operational_readiness
execution_state_known
safety_state
readiness_reason_codes
```

### ‏Privileged Changes

```text
actor
action
resource
before_version
after_version
reason
approved_at
activated_at
result
correlation_id
```

### ‏Incident

```text
incident_id
severity
started_at
detected_at
contained_at
recovered_at
exposure_at_risk
orders_state
positions_state
broker_state
build/config
operator_actions
root_causes
preventive_actions
```

---

## ‏11. Promotion Criteria

‏Operational architecture מתקדמת רק כאשר היא מוכיחה:

- ‏Wrong environment/account נחסמים deterministic.
- ‏Secret leakage tests עוברים.
- ‏Unauthorized privileged actions נדחים.
- ‏Duplicate execution instance אינו יכול ליצור side effects.
- ‏Restart/reconnect אינם מאפשרים Entry לפני reconciliation.
- ‏Manual broker action מתגלה ומסונכרנת.
- ‏Credential revoke/expiry מובילים ל־safe degraded state.
- ‏Audit trail מלא מספיק ל־RCA.
- ‏Kill/Block-New-Risk path עובד גם תחת dependency degradation.
- ‏Restore/runbook drill עבר.
- ‏Build/config provenance ניתנים לאימות.
- ‏Operational controls אינם מוסיפים latency מהותי ללא צורך.

---

## ‏12. Rejection Criteria

‏Reject design אם:

- ‏Live/Paper נבדלים רק ב־boolean.
- ‏Test יכול להגיע ל־Live credential.
- ‏Account אינו verified לפני execution.
- ‏שני instances יכולים לבצע Orders באותו scope.
- ‏Restart מתחיל Entries לפני reconciliation.
- ‏Unknown broker state אינו חוסם Risk חדש.
- ‏Cancel/Flatten emergency path תלוי ב־noncritical services רבים.
- ‏Secret יכול להגיע ללוגים ללא redaction.
- ‏Config production משתנה ללא version/audit.
- ‏Deployment rebuild שונה מה־artifact שנבדק.
- ‏Manual broker action אינה נכנסת ל־reconciliation.
- ‏Incident evidence נדרס בזמן recovery.
- ‏Auto-resume מסתמך רק על metric שחזר ל־green.

---

## ‏13. Metrics

### ‏Security

```text
auth_failure_rate
unauthorized_action_rejects
credential_age
credential_rotation_failures
secret_redaction_failures
environment_mismatch_count
account_mismatch_count
unverified_build_attempts
unverified_config_attempts
```

### ‏Operations

```text
restart_to_reconciled
restart_to_ready
time_to_detect
time_to_block_new_entries
time_to_known_state
time_to_reconcile
time_to_revoke_credential
manual_override_count
unknown_execution_state_duration
duplicate_instance_reject_count
```

### ‏Audit

```text
privileged_actions_without_audit = 0
audit_correlation_coverage
config_change_traceability
build_provenance_coverage
```

### ‏Safety

```text
entries_blocked_due_to_security_readiness
entries_blocked_due_to_ops_readiness
risk_reduction_capability_available_when_entries_blocked
```

---

## ‏14. Failure Modes / RCA Taxonomy

```text
SEC_SECRET_EXPOSED
SEC_SECRET_LOGGED
SEC_SECRET_EXPIRED
SEC_SECRET_REVOKED
SEC_ENV_MISMATCH
SEC_ACCOUNT_MISMATCH
SEC_UNAUTHORIZED_ACTION
SEC_AUTH_STATE_UNKNOWN
SEC_BUILD_UNVERIFIED
SEC_CONFIG_UNVERIFIED
SEC_EXEC_OWNER_UNKNOWN
SEC_DUPLICATE_EXEC_OWNER
SEC_FENCING_FAILURE
SEC_AUDIT_GAP
SEC_UNTRUSTED_ARTIFACT
SEC_DEPENDENCY_RISK_UNKNOWN
SEC_PUBLIC_EXPOSURE_UNINTENDED
SEC_REDACTION_FAILURE
OPS_DEPLOY_DRIFT
OPS_CONFIG_DRIFT
OPS_RECONCILIATION_FAILED
OPS_STALE_PROCESS
OPS_DUPLICATE_INSTANCE
OPS_MANUAL_ACTION_UNRECONCILED
OPS_AUTO_RESUME_UNSAFE
OPS_DISK_PRESSURE
OPS_MEMORY_PRESSURE
OPS_CPU_SATURATION
OPS_CLOCK_DRIFT
OPS_NETWORK_DEGRADED
OPS_TELEMETRY_DEGRADED
OPS_RUNBOOK_DRIFT
OPS_RESTORE_FAILED
OPS_UNKNOWN
```

‏לכל incident נשאל:

```text
What was the first divergence?
What detected it?
What failed to detect it?
What contained it?
What allowed blast radius?
What recovery path was used?
What evidence was preserved?
What control should prevent recurrence?
Which similar boundaries may share the same defect?
```

---

## ‏15. User-Specific Application

‏למערכת שלנו יש כמה boundary risks בולטים:

### ‏Browser / Local Bridge

‏אם browser collector או local bridge משמשים Data path:

```text
browser/data collection
!=
execution permission
```

‏נעדיף:

- ‏No broker secret ב־browser code כאשר אינו הכרחי.
- ‏Local service bind מצומצם.
- ‏Explicit origin/client policy כאשר רלוונטי.
- ‏Data connector שאינו יכול לבצע Order.

### ‏Research / Execution Separation

‏Notebooks, experiments ו־bulk analysis אינם צריכים לרוץ תחת execution credential.

### ‏Millisecond-to-Seconds Horizon

‏Security checks במסלול החם יהיו:

```text
local
prevalidated
versioned
fast
```

‏לדוגמה:

```text
SecurityReadiness == GOOD
```

‏ולא remote auth call עבור כל candidate.

### ‏KISS

‏המערכת האישית שלנו מרוויחה מפחות moving parts.

‏לכן baseline:

```text
minimal services
minimal credentials
minimal network exposure
strict environment separation
single execution owner
versioned config/build
clear safety plane
full audit
```

---

## ‏16. Concrete Baseline Contract

```text
SecurityContract
{
  environment,
  expected_account_fingerprint,
  current_account_fingerprint,

  credential_state,
  authorization_state,

  build_id,
  artifact_hash,
  config_version,

  execution_owner_id,
  execution_epoch,

  security_readiness,
  operational_readiness,
  safety_state,

  live_authorized,
  can_create_new_risk,
  can_reduce_risk,

  last_reconciliation_at,
  last_reconciliation_result,

  active_incident_id?,
  readiness_reason_codes[]
}
```

‏Final Entry Gate:

```text
if environment/account mismatch:
    NO_TRADE(SEC_ACCOUNT_OR_ENV_MISMATCH)

if credential/authorization not known-good:
    NO_TRADE(SEC_AUTH_NOT_READY)

if build/config not verified:
    NO_TRADE(SEC_ARTIFACT_NOT_VERIFIED)

if execution owner not proven:
    NO_TRADE(SEC_EXEC_OWNER_UNKNOWN)

if broker/execution state unknown:
    NO_TRADE(OPS_EXECUTION_STATE_UNKNOWN)

if reconciliation incomplete:
    NO_TRADE(OPS_RECONCILIATION_INCOMPLETE)

if safety blocks new risk:
    NO_TRADE(SAFETY_BLOCKED)

otherwise:
    continue to normal Risk/Execution gates
```

---

## ‏17. Confidence

### ‏High Confidence

- ‏Strong environment/account separation.
- ‏Least privilege.
- ‏No secrets in code/logs.
- ‏Versioned build/config.
- ‏Reconciliation before new risk.
- ‏Single execution owner.
- ‏Fail-closed new risk under unknown external state.
- ‏Auditability of privileged actions.
- ‏Runbooks/drills for recovery.

### ‏Medium Confidence / Context Dependent

- ‏Dedicated execution host timing.
- ‏Exact fencing implementation.
- ‏Outbound network restrictions.
- ‏Watchdog architecture.
- ‏Exact severity model.

### ‏Evidence-Only

- ‏Enterprise security platform.
- ‏Complex multi-region/multi-active execution.
- ‏Remote administration layer.
- ‏Advanced supply-chain attestation.

---

## ‏18. Time-Sensitive Facts

‏הפרק אינו מקבע כאן Broker-specific permissions, authentication methods, token lifetimes, provider security capabilities או regulatory requirements.

‏כל אחד מאלה הוא time-sensitive/provider-specific.

‏לפני שימוש תפעולי יש לאמת מול המקור הרשמי של ה־Broker/Provider:

```text
supported authentication
credential scopes
session/reconnect semantics
account permissions
API authorization boundaries
revocation behavior
paper/live separation
```

‏לכן אין במסמך מספרי expiry, permission names או broker-specific security claims hard-coded.

---

## ‏19. Current Verification Snapshot

‏לא נדרש Web verification חדש למקטע זה.

‏ה־Recommendation Sheet מתמקד ב־architecture/governance contracts ואינו טוען ל־current broker-specific capabilities.

‏כאשר אחד מה־contracts ימופה בפועל ל־IBKR או Provider אחר, אותו mapping יקבל verification עדכני/versioned.

---

## ‏20. Relationship to Earlier / Later Sheets

### ‏Segment 29 — Broker API Architecture

‏29 מגדיר Adapter/IDs/API semantics.

‏55 מוסיף identities, permissions, environment/account verification ו־security boundary סביב ה־Adapter.

### ‏Segment 32 — Separating Market Data from Execution

‏55 מחזק את ההפרדה גם ברמת credentials ו־blast radius.

### ‏Segment 33 — Production State Machine

‏`SecurityReadiness` ו־`OperationalReadiness` הן capabilities/states נוספים שמזינים את Production readiness.

### ‏Segment 34 — Failure Recovery / Safe Resume

‏34 הוא source of truth ל־Recovery sequence.

‏55 מוסיף Security/Operator/Deployment dimensions ל־Resume gate.

### ‏Segment 35 — Observability

‏35 נשאר source of truth ל־logs/metrics/traces/incidents.

‏55 דורש audit/correlation עבור privileged operations.

### ‏Segment 36 — Kill Switches / Safety Controls

‏36 נשאר source of truth ל־Safety control plane.

‏55 מחייב שה־Safety path יהיה operable גם כאשר Data Plane degraded.

### ‏Segment 51 — Execution Engine

‏51 נשאר source of truth ל־Order lifecycle, pending exposure ו־reconciliation.

‏55 מוסיף execution ownership, environment/account authorization ו־deploy/startup gates.

### ‏Segment 52 — Data Engineering

‏52 מגדיר provenance/quality של Market Data.

‏55 מוסיף retention/redaction/access considerations ל־operational evidence.

### ‏Segment 53 — Testing

‏55 מוסיף Security/Operations scenarios שחייבים להיות ב־test/fault corpus.

### ‏Segment 54 — Performance

‏54 מגדיר hot-path performance discipline.

‏55 קובע שה־security gate במסלול החם יהיה prevalidated/local ככל האפשר, בלי להסיר controls מהותיים.

### ‏Segment 56

‏56 יאחד anti-patterns נפוצים; failures של wrong environment, secret leakage, duplicate owner, unsafe resume ו־config drift צריכים להופיע שם כטעויות שניתן לזהות מוקדם.

---

## ‏21. Tests / Invariants

### ‏Environment / Identity

```text
TEST cannot use LIVE execution credential
```

```text
LIVE expected account != broker account
→ BLOCK_NEW_ENTRIES
```

```text
unknown environment/account
→ no new risk
```

### ‏Authorization

```text
authenticated && !authorized
→ no order submit
```

### ‏Ownership

```text
at most one active execution owner per scope
```

```text
old execution_epoch
→ cannot create new broker side effect
```

### ‏Restart / Reconnect

```text
restart
→ trading disabled
→ reconcile
→ readiness proof
→ optional activation
```

```text
reconnect
→ reverify identity/account/permissions/state
```

### ‏Manual Action

```text
manual broker action
→ local mismatch detectable
→ reconcile before resume
```

### ‏Secrets

```text
fake secret through every log/error path
→ plaintext secret absent
```

### ‏Audit

```text
privileged action
→ audit record exists
```

### ‏Config

```text
missing critical risk field
→ startup/readiness failure
```

```text
invalid cross-field combination
→ activation rejected
```

### ‏Deployment

```text
running artifact hash != approved artifact hash
→ BLOCK_NEW_ENTRIES
```

### ‏Safety

```text
security readiness degrades
→ new entries blocked
→ risk-reducing path preserved where possible
```

### ‏Incident

```text
critical incident cleared metric
!= automatic resume
```

### ‏Restore

```text
backup exists
```

‏אינו test מספיק.

‏נדרש:

```text
restore
→ state validation
→ reconciliation
→ readiness proof
```

---

## ‏22. Golden Scenarios

### ‏GS55-01 — Safe Startup

```text
correct build/config/account
+ broker connected
+ market data fresh

system starts
→ trading remains disabled
→ reconciliation completes
→ readiness becomes GOOD
→ only explicit authorized activation can enable entry path
```

### ‏GS55-02 — Wrong Account

```text
expected account A
broker reports B
→ BLOCK_NEW_ENTRIES
→ alert
→ no automatic fallback
```

### ‏GS55-03 — Wrong Environment

```text
TEST runtime
+ LIVE endpoint/config detected
→ startup/readiness failure
```

### ‏GS55-04 — Credential Revoked

```text
credential becomes invalid
→ auth state DEGRADED/BLOCKED
→ new entries blocked
→ existing exposure remains visible
→ reconciliation/re-auth path begins
```

### ‏GS55-05 — Duplicate Instance

```text
instance A owns scope epoch 7
instance B starts
→ B cannot create side effects
until ownership transfer/fencing proves epoch 8
```

### ‏GS55-06 — Manual Broker Cancel

```text
operator cancels order externally
→ broker truth changes
→ reconciliation detects drift
→ local state corrected
→ audit links manual action and reconciliation
```

### ‏GS55-07 — Manual Position Change

```text
operator changes position externally
→ local position mismatch detected
→ new risk blocked
→ broker truth adopted through reconciliation
```

### ‏GS55-08 — Unsafe Config

```text
critical limit missing
→ config INVALID
→ no permissive default
→ new risk blocked
```

### ‏GS55-09 — Deploy With Trading Disabled

```text
new artifact starts
→ process healthy
but readiness not proven
→ no entry
→ reconcile
→ readiness proof
```

### ‏GS55-10 — Incident Metric Recovers Briefly

```text
critical latch active
metric returns normal for 1 sample
→ latch remains
→ no auto-resume
```

### ‏GS55-11 — Secret Logging Attempt

```text
fake token enters exception/log path
→ redacted output
→ redaction test passes
```

### ‏GS55-12 — Safety Plane During Scanner Failure

```text
scanner deadlocked/degraded
→ safety block remains operable
→ no new risk
```

### ‏GS55-13 — Disk Pressure

```text
bulk analytics storage degraded
→ diagnostic degradation may occur
→ execution truth durability contract preserved or system blocks risk safely
```

### ‏GS55-14 — Clock Drift

```text
clock health becomes UNKNOWN/DEGRADED
→ audit/time-dependent readiness reflects state
→ new risk policy follows configured safety rule
```

### ‏GS55-15 — Restore Drill

```text
restore snapshot/journal
→ validate integrity
→ reconcile broker truth
→ prove readiness
```

---

## ‏23. Operational State Machine

‏Recommended conceptual lifecycle:

```text
BOOTING
→ VERIFYING_ENVIRONMENT
→ VERIFYING_IDENTITY
→ RECONCILING
→ READY_DISABLED
→ AUTHORIZED_ACTIVE
```

‏Failure paths:

```text
ANY ACTIVE STATE
→ BLOCK_NEW_RISK
→ INCIDENT
→ RECONCILING
→ READY_DISABLED
```

‏Critical rule:

```text
INCIDENT
!=
AUTO_RESUME_TO_ACTIVE
```

‏Resume חוזר קודם ל־`READY_DISABLED` ורק משם ל־authorized activation לפי policy.

---

## ‏24. Deployment Contract

```text
Source Commit
→ CI / Tests
→ Immutable Artifact
→ Artifact Verification
→ Deploy Disabled
→ Runtime Self-Identity
→ Broker/Data Connectivity
→ Reconciliation
→ Readiness Proof
→ Authorized Activation
→ Observation
```

‏Deployment rollback אינו מוחק Broker reality.

‏לכן:

```text
rollback code
!=
rollback orders/positions
```

‏כאשר state השתנה externally, Forward Recovery יכול להיות בטוח יותר.

---

## ‏25. Incident / Recovery Contract

```text
Detect
→ Latch / Block New Risk
→ Establish Broker Truth
→ Establish Build / Config / Owner Truth
→ Preserve Evidence
→ Contain
→ Reconcile
→ Validate Invariants
→ READY_DISABLED
→ Explicit Resume Decision
→ RCA
→ Regression Test / Preventive Control
```

‏אין:

```text
error
→ retry everything
→ continue
```

---

## ‏26. Operator Contract

‏כל privileged operator action צריכה להיות:

```text
identified
scoped
audited
reasoned
reconcilable
```

‏Override הוא Exception.

‏Temporary override:

```text
scope
reason
created_at
expires_at
actor
```

‏Override expired אינו נשאר hidden state.

---

## ‏27. Security / Operations Hierarchy

```text
Baseline
→ Minimal Services + Minimal Credentials + Strict Environment Separation

Preferred Default
→ Verified Account/Artifact/Config + Single Execution Owner + Full Audit

Challenger
→ External Watchdog + Stronger Artifact Provenance + Automated Rotation

Advanced Option
→ Formal Fencing + Network Allow Lists + Enhanced Supply-Chain Controls

Specialist Option
→ Enterprise IAM/SIEM/Zero-Trust/HA Multi-Instance

Avoid Unless Evidence
→ Remote Admin Exposure / Multi-Active Execution / Auto-Resume Under Unknown State
```

---

## ‏28. Promotion Ladder

```text
DEV Isolation
→ TEST Isolation
→ Paper Operational Controls
→ Shadow Operational Monitoring
→ Deterministic Failure Drills
→ Recovery / Restore Proof
→ Production-Design Readiness Review
```

‏מקטע זה אינו מאשר מעבר לכסף אמיתי.

‏הוא מגדיר מה חייב להיות מוכח לפני שכל Production-risk stage עתידי בכלל יהיה מועמד לדיון.

---

## ‏29. Recommended MVP

‏לגרסה הראשונה מספיק:

1. ‏Secrets מחוץ לקוד וללוגים.
2. ‏DEV/TEST/PAPER separation אמיתית.
3. ‏Account fingerprint verification.
4. ‏`live_authorized=false` כברירת מחדל.
5. ‏Single execution owner.
6. ‏Reconciliation לפני Entry.
7. ‏Fail-closed new risk.
8. ‏Risk-reducing path נפרד.
9. ‏Versioned build/config.
10. ‏Append-oriented audit.
11. ‏Kill/block-new-risk path ברור.
12. ‏Incident runbook קצר.
13. ‏Restore/restart drill.
14. ‏Security/ops fault tests.
15. ‏Operational dashboard read-only by default.

‏זה נותן הרבה יותר ערך מ־security platform מורכבת שלא נבדקה.

---

## ‏30. Fact / Judgment / Hypothesis

### ‏Fact

‏לפי contracts שכבר נקבעו בפרויקט:

- ‏Broker truth ו־Market Data truth הם domains שונים.
- ‏Restart אינו מאפס Broker reality.
- ‏Unknown execution effect אינו Reject.
- ‏Safety יכול לחסום new risk בלי למחוק Position קיימת.
- ‏Config/version provenance נדרש ל־reproducibility.

### ‏Judgment

‏המלצת ה־Baseline שלנו:

```text
minimal attack/failure surface
+ explicit readiness
+ single execution ownership
+ fail-closed new risk
+ preserved risk-reduction path
+ versioned/audited changes
+ reconciliation-first recovery
```

### ‏Hypothesis

‏נדרש לבדוק אמפירית:

- ‏האם dedicated runtime משפר reliability מספיק להצדיק maintenance.
- ‏האם Watchdog חיצוני מפחית detection/recovery time.
- ‏האם stronger network restrictions מצדיקות את complexity.
- ‏איזה control plane split נותן יחס reliability/latency מיטבי.

---

## ‏31. Recommendation Summary

‏המלצת 55:

```text
Security / Operations
!=
afterthought

Security / Operations
=
Risk Control Plane around external side effects
```

‏ה־Baseline המחייב:

```text
Strict Environment Separation
+ Minimal Credentials
+ Verified Account
+ Verified Build/Config
+ Single Execution Owner
+ Reconciliation Before New Risk
+ Fail-Closed Entry
+ Preserved Risk Reduction
+ Full Privileged Audit
+ Tested Incident/Restore Paths
```

‏כלל הסיום:

> ‏`UNKNOWN` ב־identity, account, ownership, authorization, external execution state או critical readiness הוא סיבה לחסום יצירת Risk חדש — לא סיבה לנחש.
