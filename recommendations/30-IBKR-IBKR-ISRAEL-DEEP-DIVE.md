# ‏30 — Recommendation Sheet: IBKR / IBKR Israel Deep Dive

> ‏מקור לימודי עיקרי: `../30-IBKR-AND-IBKR-ISRAEL-DEEP-DIVE.md`.
>
> ‏מטרת הקובץ: לתרגם את ה־architecture של מקטע 29 להחלטת integration מעשית עבור `IBKR`, בלי לקשור את ה־Strategy לפרטי ספק ובלי להניח ש־IBKR הוא גם ה־whole-market data plane המתאים ביותר. המקטע נשאר בגבולות Engineering / Paper / Shadow / Research; כל שימוש עתידי בסביבה עם סיכון כספי דורש אימות חשבון, הרשאות ו־controls נפרדים ואינו חלק מה־Baseline כאן.
>
> ‏Current verification snapshot במסמך זה נבדק מחדש ב־2026-10-27 מול `IBKR Campus` ומול האתר הנוכחי של `Interactive Israel`. כל limit, capability, authentication rule או Paper behavior נשאר `time-sensitive` וחייב re-verification לפני שימוש תפעולי.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Which IBKR API is best?
```

‏אלא:

```text
Which IBKR surface best satisfies our execution requirements,
while keeping whole-market discovery, strategy logic,
risk, replay and research independent of broker-specific limits?
```

‏ה־Baseline שנבחר:

```text
Broad Market Data Provider
→ Full-Market Scanner
→ Top-N Candidate Set
→ Fresh Execution Feasibility Recheck
→ Risk Engine
→ Canonical Execution Intent
→ IBKR Execution Adapter
→ Broker Events / Fill Ledger
→ Position / Reconciliation
```

‏החלטת API ראשונית למחקר:

```text
Preferred execution POC: TWS API + IB Gateway/TWS
Challenger: Web API
Whole-market scanner feed: external or independently benchmarked
IBKR broad-scanner feed: challenger, not assumed baseline
```

‏זו `Judgment`, לא Fact של ביצועים. אין טענה ש־`TWS API` מהיר יותר. הבחירה נובעת מהתאמה ל־C# ול־event-driven execution path, בעוד latency ואמינות חייבים benchmark בפועל.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: `IBKR` הוא Adapter, לא Strategy

```text
Strategy
→ Risk
→ Execution Policy
→ Canonical Broker Contract
→ Ibkr Adapter
```

‏מחוץ ל־Adapter לא דולפים:

```text
EClient
EWrapper
IB Order object
conId semantics
IB-specific error codes
IB-specific session states
```

‏`conId` ו־broker identifiers נשמרים במיפוי instrument/provider, לא הופכים ל־domain identity הראשית.

### ‏`P0 — Required`: Source of Truth לפי Domain

```text
Strategy intent        → application
Risk policy            → Risk Engine
Whole-market ranking   → configured scanner feed
Order/fill truth       → broker evidence
Position truth         → broker fills/reconciliation
Broker capability      → verified capability snapshot
```

‏אין source אחד שאמור להיות “האמת על הכול”.

### ‏`P1 — Preferred Default`: `TWS API` כ־Execution POC ראשון

‏למה:

- ‏SDK רשמי ל־`C#`.
- ‏TCP/event model שמתאים ל־long-running state machine.
- ‏Order/Execution callbacks עשירים.
- ‏מתחבר ל־`TWS` או `IB Gateway` תחת אותו family של API.
- ‏אינו כפוף ל־global Web API pacing של `10 req/s`; יש לו pacing/limits אחרים שיש למדל בנפרד.

‏מחיר הבחירה:

- ‏תלות ב־`TWS`/`IB Gateway` process.
- ‏login/restart/reauthentication lifecycle.
- ‏callback/concurrency complexity.
- ‏Market Data Lines עדיין מגבילות broad subscription capacity.
- ‏headless/GUI-less operation אינו נתמך רשמית כ־daemon נטול UI.

### ‏`P2 — Challenger`: `Web API`

‏ה־Web API ראוי ל־POC נפרד אם נרצה service-oriented integration.

‏יתרונות:

- ‏HTTP + WebSocket.
- ‏market data/order/account surfaces באותו ecosystem.
- ‏נוח ל־service adapters.

‏trade-offs:

- ‏brokerage-session semantics.
- ‏single active brokerage session per username.
- ‏global request pacing + endpoint-specific pacing.
- ‏market-data subscription lease/renewal.
- ‏session keep-alive / authentication lifecycle.

‏Promotion של Web API מעל TWS ידרוש benchmark שמראה יתרון אמיתי עבור workload שלנו, לא העדפת syntax.

---

## ‏3. Why

‏הרובוט שלנו מבצע שתי עבודות שונות לחלוטין:

```text
A. discover/rank thousands of symbols
B. execute/manage one or a few active intents
```

‏ל־A צריך:

```text
coverage
freshness
cross-sectional completeness
throughput
historical/replay compatibility
```

‏ל־B צריך:

```text
order correctness
fill truth
reconciliation
recovery
low tail latency
reliable state transitions
```

‏לכן דרישה מאותו ספק להיות אופטימלי לשני התפקידים היא assumption מיותר.

---

## ‏4. Current Verification Snapshot — 2026-10-27

### ‏Fact — `TWS API`

‏`IBKR Campus` מתאר את `TWS API` כ־TCP socket protocol שמתחבר ל־`TWS` או `IB Gateway`, עם libraries רשמיים כולל `C#`.

‏`TWS` ו־`IB Gateway` נחשבים כמעט זהים מנקודת מבט של API; Gateway קל יותר ב־resources, אך גם הוא בעל UI ואינו officially supported כ־GUI-less headless daemon.

‏FAQ רשמי מציין auto-restart יומי ללא authentication מחדש Monday–Saturday, אך לאחר Saturday night server reset נדרש re-authentication ביום Sunday.

### ‏Fact — `Web API` Session

‏Brokerage session נדרשת ל־market data, orders ורוב `/iserver` functionality.

‏Username אחד יכול להחזיק brokerage session פעיל אחד בלבד בכל IB platforms.

‏Trading permissions ו־market-data subscriptions קשורים ל־username, לא רק ל־account.

‏ה־documentation הנוכחי מתאר inactivity timeout של בערך 5–6 דקות, וממליץ `/tickle` בערך פעם בדקה כאשר session צריכה להישאר פעילה.

### ‏Fact — `Web API` Pacing

‏ה־global limit המתועד כרגע הוא:

```text
10 requests / second / authenticated username
```

‏בנוסף קיימים endpoint limits, לדוגמה:

```text
/iserver/marketdata/history = 10 req/s OR 50 req/min
/iserver/scanner/run        = 1 req/s
/iserver/orders             = 1 req/5s
/iserver/trades             = 1 req/5s
```

‏חריגה יכולה להחזיר `HTTP 429`.

### ‏Fact — Web Market Data

‏`smd` מספק watchlist top-of-book / Level 1 market data.

‏התיעוד הנוכחי מציג:

```text
All Products = 500ms time-based snapshot interval
```

‏זה אינו raw exchange tick stream.

### ‏Fact — `smd` Documentation Conflict

‏עמוד Market Data הנוכחי אומר:

```text
renew after 10m
stream termination after 15m
```

‏אבל `Web API Changelog` מ־2026-04-14 מציין termination לאחר 10 דקות.

‏Recommendation:

```text
renew conservatively before 10m
monitor actual freshness
re-subscribe idempotently
never trust lease duration without health telemetry
```

### ‏Fact — Market Data Lines

‏IBKR מתעדת Market Data Lines כ־simultaneous data budget פר username, משותף ל־TWS/API תחת אותו user.

‏התיעוד מציג דוגמה של username provisioned ל־100 lines, אך הכמות האמיתית היא account/user-specific resource ואינה constant שאפשר hardcode.

‏Tick-by-tick ו־Market Depth מוגבלים בנפרד ותלויים בהקצאת lines.

### ‏Fact — Market Data Entitlement

‏מחיר שמופיע ב־TWS אינו הוכחה שה־API מורשה לקבל אותו off-platform.

‏Market data attached to usernames; Paper username עשוי להזדקק ל־subscription משלו או sharing configuration בהתאם ל־IBKR provisioning.

### ‏Fact — Paper

‏גם `TWS API` וגם `Web API` ניתנים לשימוש מול Paper account.

‏IBKR מבהירה ש־Paper הוא simulator ולא execution/clearing environment אמיתי.

‏המגבלות המתועדות כוללות:

- ‏fills simulated from top-of-book, ללא deep-book execution.
- ‏order types מסוימים אינם נתמכים.
- ‏stops/complex orders מסוימים simulated.
- ‏Paper behavior יכול להיות שונה מ־Live.

‏לכן Paper מוכיח integration/state/recovery, לא microstructure realism.

### ‏Fact — `TWS API` Order Rate

‏FAQ רשמי מתעד order-rate limitation של:

```text
50 orders / second
```

‏זה `broker technical ceiling`, לא system target ולא Strategy budget.

### ‏Fact — `Interactive Israel`

‏האתר הנוכחי של `Interactive Israel` מציין שהמותג הוא של `MEXEM LTD`, ומפרסם גישה ל־API/FIX של Interactive Brokers דרך `TWS` או `Gateway`.

‏Recommendation: לא להסיק entity/account terms משם בלבד. החשבון הספציפי, entity, permissions ו־agreements הם metadata שצריך לאמת מתוך מסמכי החשבון בפועל.

---

## ‏5. TWS API Baseline Contract

### ‏Session State

```text
DISCONNECTED
→ CONNECTING
→ API_CONNECTED
→ ORDER_ID_READY
→ RECONCILING
→ READY
```

‏Failure path:

```text
READY
→ DEGRADED
→ RECONNECTING
→ RECONCILING
→ READY
```

‏ה־Core לא רואה `READY` רק בגלל שה־socket נפתח.

### ‏Readiness minimum

```text
transport connected
API handshake complete
account identity known
order-id allocator ready
broker snapshot loaded
fills/open orders/positions reconciled
critical subscriptions healthy
risk state restored
```

### ‏Order Identity

‏שומרים לפחות:

```text
trade_workflow_id
intent_id
client_order_id
ib_order_id
ib_perm_id
execution_id(s)
```

‏אין מפתח יחיד שמחליף את כולם.

### ‏Event pipeline

```text
IB Callback
→ raw capture
→ IBKR Adapter
→ CanonicalBrokerEvent
→ Order State Machine
→ Fill Ledger
→ Position Projection
→ Risk / Exit management
```

### ‏Fill truth

```text
requested_qty != position_qty
```

‏Position משתנה רק מ־fills/reconciliation.

‏כל partial fill מקבל `execId`/stable execution identity ככל שזמין ועובר deduplication.

---

## ‏6. Web API Baseline Contract

‏אם Web API נבחר כ־Challenger:

### ‏Session readiness

```text
authenticated transport/context
→ initialize brokerage session
→ verify brokerage session readiness
→ account accessible
→ market/order streams healthy
→ reconcile
→ READY
```

‏ה־provider-specific documented startup delay אינו מתורגם ל־`Thread.Sleep` בתוך core logic; הוא נשאר בתוך session adapter ואז נבדקת readiness בפועל.

### ‏Request Budget

‏כל request מקבל:

```text
request_class
deadline
priority
endpoint_budget
global_budget
```

‏Priority baseline:

```text
P0 reconciliation / risk-reducing operations
P1 active-position state
P2 active candidate validation
P3 discovery/support queries
P4 analytics/history
```

‏Request שפג תוקפו בזמן queue נזרק:

```text
expired != delayed submission
```

### ‏WebSocket subscriptions

‏Subscriptions מקבלים lease state:

```text
subscribed_at
renew_before
last_update_at
freshness_state
resubscribe_count
```

‏Renewal חייב להיות idempotent.

---

## ‏7. Market Data Recommendation

### ‏`P1 — Preferred Default`: External/Independent Broad Market Feed

‏ל־whole-market scanner, ה־Baseline אינו 4,000 persistent IBKR streams.

‏המודל:

```text
Broad Provider
→ canonical whole-market state
→ rank/filter
→ Top-N
→ optional IBKR execution-side validation
```

‏למה:

- ‏Market Data Lines הם simultaneous-capacity budget.
- ‏Web API watchlist data מתועד ב־500ms interval.
- ‏whole-market cross-sectional completeness הוא requirement שונה מעבודה על candidate יחיד.

### ‏`P2 — Challenger`: IBKR-only discovery

‏לא נפסול מראש.

‏Promotion דורש POC שמודד:

```text
coverage
freshness distribution
missing/stale symbols
subscription churn
resource limits
rank completeness
latency under burst
```

‏עד שלא הוכח — אין להניח שה־IBKR data plane מתאים לסריקת universe של אלפי symbols בקצב הרצוי.

### ‏Dynamic subscription set

‏ל־IBKR deep data:

```text
ACTIVE_POSITION > WORKING_ORDER > TOP_CANDIDATE > DIAGNOSTIC
```

‏Subscription reason נשמר במפורש.

‏נשתמש ב־hysteresis/cooldown כדי למנוע subscribe/unsubscribe storm סביב גבול Top-N.

---

## ‏8. Cross-Provider Contract

‏אם Scanner feed שונה מ־IBKR:

```text
canonical_instrument_id
scanner_provider_id
scanner_symbol
ibkr_conId
currency
asset_type
primary_exchange
mapping_version
valid_from
valid_to
```

‏Symbol string לבדו אינו mapping.

‏לפני execution validation נשמור:

```text
scanner_event_time
scanner_bid/ask/reference
ibkr_quote_time
ibkr_bid/ask
provider_disagreement_bps
validation_latency_ms
```

‏Cross-provider disagreement הוא diagnostic, לא bug אוטומטי.

---

## ‏9. Execution Feasibility Recheck

‏לפני יצירת Broker Order Request:

```text
signal alive?
candidate still eligible?
rank still acceptable?
scanner data fresh?
IBKR/broker health ready?
contract resolved?
quote usable?
spread/price within budget?
risk approval still valid?
no conflicting/unknown order?
```

‏Fail => `ABORT_ENTRY` / `NO_TRADE_BROKER_GATE`.

‏אין “Rank #1 → submit בכל מחיר”.

---

## ‏10. Session / Connectivity Policy

### ‏TWS / Gateway

‏System must expect restart/re-authentication lifecycle.

‏נדרש runbook ל־:

```text
daily restart/reconnect
weekly re-authentication requirement
competing login
Gateway/TWS process loss
network partition
```

‏Headless automation workaround שאינו officially supported אינו Baseline.

### ‏Web API

‏נדרש:

```text
brokerage_session_state
session_keepalive
competing_session_detection
session_expiry detection
re-init + reconciliation
```

‏Username אנושי/automation separation יכול לעזור אם account setup מאפשר, אבל אינו מבטל shared account truth או market-data licensing constraints.

---

## ‏11. Rate / Pacing Policy

‏כל limit external נשמר כ־versioned configuration:

```text
provider
api_surface
limit_name
value
unit
scope
valid_from
verified_at
source
```

‏לדוגמה current snapshot:

```text
WEB_GLOBAL_RPS = 10 / username
WEB_HISTORY_RPS = 10
WEB_HISTORY_RPM = 50
TWS_ORDER_RATE = 50 / sec
```

‏אבל business layer אינה מכירה constants אלה ישירות.

‏effective limit:

```text
min(
  provider_limit,
  adapter_safety_limit,
  system_limit,
  strategy_limit,
  risk_limit
)
```

‏Internal safety budget אמור להיות נמוך משמעותית מתקרת broker במקום שבו request storm עצמו הוא סימן לבאג.

---

## ‏12. Paper Recommendation

‏Paper משמש ל־`Broker Conformance`, לא להוכחת Alpha.

‏נבדוק:

```text
connect
session recovery
contract resolution
submit/ack
partial fill
cancel
cancel/fill race
reject
unknown effect
restart
reconciliation
manual external change
position truth
```

‏כל fill נשמר עם:

```text
execution_source = PAPER_BROKER
```

‏ולא מתערבב עם simulated או future live evidence.

‏Known Paper Limitations Registry יהיה versioned לפי documentation/account behavior.

---

## ‏13. Capability Matrix

‏לא נתחיל עם “כל מה ש־IBKR יודע”.

‏Baseline capabilities למחקר:

```text
LIMIT
price-capped aggressive limit / marketable-limit semantics
CANCEL
REPLACE if safely supported
ORDER STATUS
EXECUTION/FILL STREAM
POSITION SNAPSHOT
OPEN ORDERS
EXECUTION HISTORY sufficient for reconciliation
```

‏Capabilities נוספות:

```text
IOC
Bracket
OCA/OCO-like behavior
Stop
Midpoint/Pegged orders
Advanced broker algos
Outside-RTH variants
```

‏נשארות evidence-gated ו־environment-specific.

‏Unsupported capability => explicit reject.

‏אין silent semantic downgrade.

---

## ‏14. Error / Message Normalization

‏Canonical categories:

```text
INFO
WARNING
TRANSIENT
RATE_LIMITED
AUTH_SESSION
INVALID_CONTRACT
NO_PERMISSION
INVALID_ORDER
ORDER_REJECT
UNKNOWN_EFFECT
BROKER_FATAL
```

‏שומרים תמיד גם:

```text
raw_broker_code
raw_broker_message
api_surface
connection_session_id
intent_id
broker_order_id
received_at
```

‏`UNKNOWN_EFFECT` מוביל ל־reconciliation לפני retry.

---

## ‏15. Recovery Baseline

### ‏Disconnect workflow

```text
detect
→ block new exposure
→ mark health degraded
→ reconnect/reauthenticate
→ restore required streams
→ fetch authoritative broker state
→ reconcile orders/fills/positions/account
→ restore risk projection
→ validate invariants
→ READY
```

‏Reconnect אינו Recovery עד ש־reconciliation הסתיים.

### ‏Cold Start

```text
load durable journal
connect
identify account/environment
fetch broker state
reconcile
restore subscriptions
warm strategy features
pass freshness gates
READY
```

‏Broker readiness ו־Strategy readiness הן gates נפרדים.

---

## ‏16. Required Durable State

```text
intent journal
client↔broker order mappings
order event ledger
fill ledger
position projection + source timestamp
account snapshot + freshness
reconciliation log
broker capability snapshot
broker/session health history
rate-budget state where useful
risk state
```

‏Raw messages/log references נשמרים לפי privacy/security policy לצורך RCA.

---

## ‏17. Metrics

### ‏Session / Reliability

```text
connect_attempts
reconnect_count
session_invalidations
reconnect_to_ready_ms
reconciliation_time_ms
unknown_effect_count
position_mismatch_count
```

### ‏Execution

```text
intent_to_submit_ms
submit_to_ack_ms
ack_to_first_fill_ms
signal_to_first_fill_ms
fill_rate
partial_fill_rate
cancel_to_confirm_ms
reject_rate
```

### ‏Market Data / Cross-provider

```text
ibkr_quote_age_ms
active_data_lines
subscription_errors
stale_subscription_count
resubscribe_count
provider_disagreement_bps
candidate_validation_ms
```

### ‏Pacing

```text
request_rate
queue_wait_ms
throttled_count
429_count
expired_before_send
request_amplification_per_intent
```

### ‏Research-specific

```text
rank_at_signal
rank_at_submit
rank_at_first_fill
signal_survival_to_submit
signal_survival_to_fill
missed_opportunity_due_to_broker_gate
```

---

## ‏18. Conformance / Test Matrix

‏כל Adapter implementation חייב לעבור אותו contract suite:

```text
connect and become READY
normal submit/ack
reject
partial fill
multiple fills
cancel before fill
fill during cancel
unknown submit effect
reconnect with working order
reconnect with missed fill
process restart with open position
duplicate callback
out-of-order event
rate limit / pacing pressure
market-data subscription expiry
manual external order/change
position mismatch
```

‏Property invariants:

```text
same fill event twice does not double position
UNKNOWN blocks conflicting new entry
no exit quantity exceeds reconciled available position
no READY before reconciliation
no order without approved Intent/Risk snapshot
no silent capability downgrade
```

---

## ‏19. POC Recommendation

### ‏POC A — `TWS API`

‏Research/Paper scope בלבד:

```text
connect
wait for adapter READY
resolve one instrument
receive one quote
exercise one non-live order lifecycle in Paper
observe callbacks
cancel/reconcile
restart/reconcile
```

‏ה־POC מודד architecture; הוא אינו demo של רווחיות.

### ‏POC B — `Web API`

```text
authenticate
establish brokerage session
verify readiness
subscribe one market-data websocket
exercise one Paper order lifecycle
observe order/trade/session streams
force session/reconnect scenario
reconcile
```

### ‏Benchmark

‏נשווה:

```text
session stability
implementation complexity
submit→ack latency distribution
recovery complexity
state observability
pacing burden
market-data suitability for candidate validation
```

‏לא נבחר API לפי one-shot latency sample.

---

## ‏20. Promotion Criteria

‏`TWS API` יישאר Preferred Default אם:

- ‏Paper/Shadow adapter conformance green.
- ‏reconnect + reconciliation deterministic וברור.
- ‏tail latency תואם signal half-life במחקר.
- ‏operational burden סביר.
- ‏C# integration נשאר פשוט יותר בפועל.

‏`Web API` יכול להחליף אותו אם benchmark מראה יתרון משמעותי ב־deployment/operations/reliability בלי לפגוע ב־latency, pacing safety או state correctness.

‏IBKR-only market-data discovery יכול להפוך Baseline רק אם POC מוכיח whole-universe coverage/freshness מספיקים תחת resource limits אמיתיים.

---

## ‏21. Rejection Criteria

‏אין Promotion אם אחד מאלה קיים:

```text
unexplained position mismatch
blind retry after unknown effect
session collision not understood
stale market data treated as realtime
capability silently downgraded
paper/live environment ambiguity
subscription renewal unreliable
reconnect resumes before reconciliation
order/fill IDs cannot be correlated reliably
pacing produces stale intents
```

---

## ‏22. Failure Modes

- ‏`connected == ready` assumption.
- ‏`submitted == filled` assumption.
- ‏`timeout == rejected` assumption.
- ‏retry storm אחרי 429/timeout.
- ‏4,000 persistent subscriptions בלי capacity proof.
- ‏TWS watchlist price assumed API-entitled.
- ‏Paper fill treated as live-realistic.
- ‏human login invalidates/competes with automation session.
- ‏subscription lease expires silently.
- ‏reconnect restores socket but misses fills.
- ‏contract mapping stale/wrong.
- ‏manual external action overwrites local assumptions.
- ‏Broker error swallowed into generic Exception.
- ‏hardcoded provider limits.
- ‏Strategy coupled to IB types.
- ‏API/TWS/Gateway upgrade without conformance rerun.

---

## ‏23. What I Would Avoid Initially

```text
IBKR as whole-market scanner by assumption
full Level-II across universe
advanced broker algos
complex brackets/OCA before state correctness
multiple broker adapters
custom unsupported headless automation hacks
aggressive polling
blind retry policies
hardcoded 100 market-data-line assumption
hardcoded 10m/15m stream semantics without health checks
```

---

## ‏24. What to Add Later

### ‏`P2`

- ‏Candidate-side dynamic IBKR subscription pool.
- ‏Cross-provider quote calibration.
- ‏periodic reconciliation policy tuning.
- ‏automated API changelog dependency review.
- ‏contract metadata drift detection.

### ‏`P3`

- ‏Web API challenger adapter.
- ‏native conditional/protective-order experiments in Paper.
- ‏advanced broker algorithm capability extensions.
- ‏provider failover only if operational need appears.

### ‏`P4`

- ‏Multi-broker execution.
- ‏venue/routing optimization.
- ‏specialized depth/tick capacity expansion.

---

## ‏25. User-Specific Application

‏עבור מערכת backend ב־`C#` עם Scanner רחב ואופק של שניות, ה־Baseline המחקרי המתאים ביותר הוא:

```text
external/canonical broad feed
→ full-market rank
→ shortlist
→ fresh IBKR-side validation when useful
→ canonical Risk/Execution
→ TWS API execution POC
→ Paper lifecycle + reconciliation
→ benchmark against Web API only if justified
```

‏אין צורך להתחרות ב־microseconds; כן צריך למדוד `P95/P99` של path אמיתי, כי מאות milliseconds יכולים להיות חלק משמעותי מ־signal half-life קצר.

---

## ‏26. Concrete Baseline Contract

```text
1. IBKR is execution provider, not Strategy dependency.
2. TWS API is first execution POC; Web API remains challenger.
3. Whole-market data comes from independently selected provider until IBKR-only coverage is proven.
4. Every broker capability is discovered/versioned; UNKNOWN is not TRUE.
5. Every session starts NOT_READY.
6. READY requires reconciliation and freshness, not socket connectivity.
7. Every order derives from durable canonical Intent + Risk approval.
8. Timeout/UNKNOWN_EFFECT never triggers blind retry.
9. Fills/reconciliation define position truth.
10. Market-data subscriptions are a managed budget with explicit reason/lease/freshness.
11. Paper validates lifecycle and recovery, not execution realism.
12. External limits and documentation assumptions are config with source + checked date.
13. Adapter upgrades require conformance + Paper/Shadow rerun.
14. No future environment with financial risk is enabled by this Recommendation Sheet.
```

---

## ‏27. Confidence

### ‏High

- ‏Provider-agnostic broker boundary.
- ‏TWS/Web session and state must be modeled explicitly.
- ‏fill/reconciliation as execution truth.
- ‏Paper limitations require separation from execution evidence.
- ‏whole-market data and execution are separable responsibilities.
- ‏limits/capabilities must be versioned, not magic constants.

### ‏Medium

- ‏`TWS API` as Preferred first execution POC for this C# architecture.
- ‏External broad feed + IBKR execution as preferred research architecture.

### ‏Low / must measure

- ‏Which API has lower latency in our environment.
- ‏Exact operational burden after implementation.
- ‏Whether IBKR-only data can satisfy the final scanner SLA.
- ‏Whether any advanced native order capability improves net outcome.

---

## ‏28. Time-Sensitive Facts — Reverify Before Operational Use

‏חובה לאמת מחדש:

```text
Web API global and endpoint pacing
brokerage-session exclusivity
session timeout/keepalive behavior
smd lease/renewal behavior
market-data update frequency
market-data line allocation
specialized depth/tick limits
TWS order-rate limits
TWS/Gateway restart + authentication requirements
Paper order-type limitations
market-data entitlement/sharing rules
automation disclosure requirements
API/TWS/Gateway versions
specific account/entity permissions
Interactive Israel / account servicing structure
```

‏כאשר official documentation סותר את עצמו:

```text
choose conservative behavior
instrument it
record assumption with source/date
seek clarification if material
```

---

## ‏29. Current Verified Sources

‏נבדק מחדש ב־2026-10-27 מול:

- ‏`IBKR Campus — TWS API Introduction`.
- ‏`IBKR Campus — General Third Party FAQ`.
- ‏`IBKR Campus — Web API Trading Session Management`.
- ‏`IBKR Campus — Web API Session Authentication FAQ`.
- ‏`IBKR Campus — Web API Pacing Limitations`.
- ‏`IBKR Campus — Web API Market Data Request`.
- ‏`IBKR Campus — Web API Market Data Update Frequency`.
- ‏`IBKR Campus — Web API Changelog`.
- ‏`IBKR Campus — Market Data Lines / Specialized Market Data Lines`.
- ‏`IBKR Campus — Paper Trading Account`.
- ‏`IBKR Campus — Automation and Software Disclosure`.
- ‏`IBKR Campus — TWS Order / Execution references`.
- ‏`Interactive Israel — About / API pages`.

‏המסמך אינו מקבע URL/API contract לצמיתות; ה־verified-at date הוא חלק מה־Evidence.

---

## ‏30. Relationship to Later Sheets

‏מקטע 30 קובע את provider-specific boundary וה־POC choice.

‏הוא אינו מחליף:

- ‏Production state machine / recovery sheets מאוחרים יותר.
- ‏Kill switches and safety controls.
- ‏observability and deployment architecture.
- ‏latency/performance engineering.
- ‏final provider comparison.

‏בכל מקום שיש סתירה עתידית בין lesson ישן לבין current official provider documentation, Current Verification הוא שמכריע fact תלוי־זמן; ההמלצה עצמה עוברת שינוי רק דרך controlled evidence.

---

## ‏31. Recommendation Summary

```text
Baseline
→ Provider-agnostic core
→ External/independent broad market feed
→ TWS API first execution POC
→ Paper + Shadow + conformance
→ Explicit session/readiness/reconciliation
→ Managed market-data/rate budgets
→ Versioned provider assumptions

Preferred Default
→ TWS API for first C# execution adapter POC
→ IBKR as execution broker, not assumed whole-market scanner

Challenger
→ Web API
→ IBKR-only discovery after measured capacity/freshness proof

Advanced
→ dynamic deep-data subscription pool
→ cross-provider calibration
→ native protective/advanced order capabilities after Paper evidence

Avoid Unless Evidence
→ 4,000 persistent IBKR streams
→ blind retry
→ connected==ready
→ paper fill==live fill
→ hardcoded limits
→ strategy coupled to IBKR SDK
```
