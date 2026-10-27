# ‏71 — Recommendation Sheet: Account Mechanics and Regulations

> ‏מקור לימודי עיקרי: `../71-ACCOUNT-MECHANICS-AND-REGULATIONS.md`.
>
> ‏מטרת הקובץ: להגדיר את שכבת החשבון והרגולציה כ־Eligibility/State layer נפרדת בין Strategy לבין Execution. ‏Cash, settled cash, buying power, margin, permissions, restrictions, regulatory mode ו־broker state אינם פרטי UI — הם Inputs דינמיים שקובעים אם Candidate בכלל ניתן לפעולה.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture. הוא אינו ייעוץ משפטי/מס/השקעות ואינו הוראה לבצע מסחר בכסף אמיתי. Facts תלויי־Broker/מדינה/חשבון/רגולציה חייבים אימות עדכני לפני שימוש תפעולי.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Does the strategy want to trade?
```

‏אלא:

```text
At this exact decision time,
is the action permitted by regulation,
permitted by the account,
funded,
within margin / settlement constraints,
and supported by fresh broker/account state?
```

‏שרשרת ההכרעה המומלצת:

```text
Strategy Candidate
→ Regulatory Eligibility
→ Account Eligibility
→ Product / Side Permission
→ Funding / Settlement
→ Margin / Headroom
→ Risk Approval
→ Execution Feasibility
→ Pre-Submit Revalidation
→ Broker Acceptance
→ Reconciliation
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏`Signal != Permission != Buying Power != Settled Cash != Executable Trade`

‏אלה שכבות שונות ויש לשמור אותן בנפרד.

‏מינימום Domain states:

```text
StrategyCanTrade
RegulationAllows
AccountAllows
FundingAllows
RiskAllows
BrokerWillAccept
```

‏אין Boolean יחיד בשם `CanTrade` שמסתיר את המקור להחלטה.

### ‏`P0 — Required`: ‏`AccountEligibilityEngine` נפרד

‏הרכיב אינו מנבא מחיר.

‏תפקידו:

```text
Input:
- account type
- broker entity
- permissions
- regulatory mode
- cash / settled cash
- buying power
- margin state
- restrictions
- positions / open orders
- snapshot freshness

Output:
- ELIGIBLE | INELIGIBLE | UNKNOWN
- ReasonCodes[]
- ObservedAt
- AccountGeneration
```

### ‏`P0 — Required`: ‏`UNKNOWN` אינו Eligible

‏כאשר account stream stale, regulatory mode אינו ידוע, broker state אינו מסונכרן או snapshot חלקי:

```text
UNKNOWN_ACCOUNT_STATE
→ no new exposure
```

‏Exit/risk-reduction path נשאר נפרד ואינו נחסם אוטומטית.

### ‏`P0 — Required`: Cash ו־Margin הם Models שונים

‏אין לכתוב Strategy שמניחה:

```text
CashAccount == MarginAccount without leverage
```

‏Cash research צריך Settlement Ledger ו־settled-funds constraints.

‏Margin research צריך margin requirements, headroom, mark-to-market, working orders ו־broker liquidation risk.

### ‏`P0 — Required`: Regulatory/Broker rules הם Versioned Inputs

‏לכל Decision משמעותי נשמור:

```text
AccountType
BrokerEntity
RegulatoryMode
RuleVersion
BrokerRuleVersion
PermissionSetVersion
AccountPolicyVersion
VerifiedAt
```

‏אין hard-code של rule תלוי־זמן כ־universal truth.

---

## ‏3. Why

‏Strategy קצרה יכולה להיות Predictive לחלוטין ובכל זאת להיכשל תפעולית בגלל:

- ‏כסף שאינו settled.
- ‏Buying Power שכבר שמור ל־working order.
- ‏Margin requirement שהשתנה.
- ‏Permission חסר.
- ‏Restriction חשבוני.
- ‏Broker entity שונה מההנחה.
- ‏Regulatory framework שונה בזמן transition.
- ‏Account snapshot stale.
- ‏Submit timeout שהשאיר `UNKNOWN_EFFECT`.

‏לכן Account Mechanics אינם bureaucracy מסביב ל־Strategy. הם חלק מה־Execution Contract.

---

## ‏4. Use When

‏השכבה נדרשת בכל מחקר/Replay/Shadow שבו רוצים לדעת:

- ‏כמה Opportunities באמת היו Account-Eligible.
- ‏כמה Capital באמת היה שמיש באותו רגע.
- ‏האם Cash recycling/settlement מגביל throughput.
- ‏האם Margin מוסיף capacity או רק complexity/risk.
- ‏למה Order נדחה למרות Signal תקין.
- ‏האם Pending orders/partial fills יצרו overcommit.
- ‏האם Broker rule change שינה את distribution של trades.
- ‏האם Backtest מבצע יותר עסקאות ממה שהחשבון ההיסטורי היה יכול לממן.

---

## ‏5. Do Not Use When

‏אין להשתמש ב־Account layer כדי:

- ‏להפוך regulatory minimum ל־risk target.
- ‏לעקוף restriction.
- ‏לפרש `Available to Trade` כ־universal domain concept בלי mapping.
- ‏להניח `Cash = Settled Cash`.
- ‏להניח `Margin = Unlimited Buying Power`.
- ‏להניח שכל Margin account כפוף לאותו rule mode.
- ‏להשתמש ב־current broker policy כדי לשחזר תקופה היסטורית אחרת.
- ‏לבצע blind retry אחרי timeout/reject.

---

## ‏6. Account State Contract

‏Snapshot מומלץ:

```text
AccountSnapshot
- account_id_hash
- account_type
- broker_entity
- account_generation
- observed_at
- state_confidence
- base_currency
- cash_by_currency
- settled_cash_by_currency
- buying_power
- available_funds
- excess_liquidity
- net_liquidation
- initial_margin
- maintenance_margin
- margin_headroom
- open_order_reserve
- pending_exposure
- positions_summary
- restriction_state
- permission_state
- regulatory_mode
- rule_version
- broker_rule_version
```

‏Broker-specific labels נשמרים ב־adapter metadata, לא בתור semantics של ה־Strategy.

---

## ‏7. Static מול Dynamic Eligibility

### ‏Static-ish

```text
AccountType
BrokerEntity
Jurisdiction
ProductPermissions
ConfiguredMarginMode
```

### ‏Dynamic

```text
SettledCash
BuyingPower
AvailableFunds
ExcessLiquidity
MarginRequirements
Restrictions
OpenOrders
PartialFills
PendingExposure
```

‏לשני הסוגים TTL/cadence שונים.

---

## ‏8. Cash Account Baseline

‏ל־Cash research ננהל Ledger מפורש:

```text
CashLot / SaleProceeds
- amount
- currency
- source_trade_id
- trade_date
- settlement_date
- status = SETTLED | UNSETTLED | RESERVED
```

‏Capital state:

```text
Settled
Unsettled
Reserved
AvailableForNewRisk
```

‏`T+1` אינו `+24h`; settlement משתמש ב־business calendar הרלוונטי.

---

## ‏9. Capital Recycling

‏מדד מרכזי למחקר קצר־טווח:

```text
CapitalTurnoverCapacity
```

‏הוא תלוי ב:

```text
HoldingTime
SettlementRules
AccountType
AvailableMargin
BrokerPolicy
Fees
```

‏נמדוד גם:

```text
CapitalTime = CapitalAmount × TimeUnavailable
```

‏כך אפשר להשוות Strategy תיאורטית מול throughput אמיתי תחת Account mechanics.

---

## ‏10. Margin Account Baseline

‏Margin אינו Boolean.

‏נפריד:

```text
InitialMarginRequirement
MaintenanceMarginRequirement
AvailableFunds
ExcessLiquidity
BuyingPower
HouseRequirement
ConcentrationAdjustment
IntradayRequirement
```

‏Broker house requirements יכולים להיות מחמירים יותר מה־regulatory minimum ולהשתנות בזמן.

---

## ‏11. Margin Safety Buffer

‏אין לעבוד מחקרית כאילו maximum broker capacity הוא Strategy budget.

‏נגדיר domain quantity נפרד:

```text
CapitalAvailableForStrategy
= min(
    AccountConstraint,
    FundingConstraint,
    RiskConstraint,
    StrategyAllocationConstraint
  )
```

‏Diagnostic challengers אפשריים:

```text
MarginHeadroom
BuyingPowerUtilization
SettlementUtilization
```

‏הם אינם regulatory formulas אוניברסליים.

---

## ‏12. Working Orders ו־Partial Fills

‏Account state כולל exposure שלא התממש כולו:

```text
CurrentPositions
+ WorkingOrders
+ PartialFills
+ UnknownEffectOrders
```

‏Cancel requested אינו canceled.

‏Partial fill יכול בו־זמנית:

- ‏להגדיל Position.
- ‏להשאיר Remaining Intent.
- ‏להשאיר reserved capital.

---

## ‏13. Atomic Reservation

‏כדי למנוע שני workers מלצרוך אותו capital:

```text
Reserve
→ Validate
→ Submit
→ Reconcile
→ Convert or Release
```

‏Reservation חייבת:

- ‏atomicity או single-writer semantics.
- ‏TTL.
- ‏owner/intent id.
- ‏recovery לאחר crash.
- ‏reconciliation מול Broker truth.

---

## ‏14. Time-of-Check / Time-of-Use

‏Eligibility check מוקדם אינו guarantee.

```text
Check at t0
→ state changes
→ Submit at t1
```

‏לכן נבצע revalidation קרוב ככל האפשר ל־submit במחקר/Shadow, ונמדוד:

```text
AccountCheckLatency
AccountStateAgeAtDecision
AccountStateAgeAtSubmit
```

---

## ‏15. Account Generation ו־Reconciliation

‏אחרי reconnect/startup:

```text
AccountGeneration++
→ Fetch Positions
→ Fetch Open Orders
→ Fetch Cash / Settlement
→ Fetch Buying Power / Margin
→ Fetch Restrictions / Permissions
→ Rebuild Local State
→ Compare
→ READY or BLOCKED
```

‏עד reconciliation, local state ישן הוא hypothesis.

---

## ‏16. `UNKNOWN_EFFECT`

‏Submit/Cancel timeout אינו אומר שהפעולה לא התרחשה.

```text
Timeout
→ Query Broker
→ Reconcile
→ Decide
```

‏לא:

```text
Timeout
→ Retry blindly
```

‏זה חשוב במיוחד מפני ש־double submission יכול להכפיל Exposure ולצרוך resources פעמיים.

---

## ‏17. Broker Liquidation / External Actions

‏State machine חייבת להכיר events שלא נוצרו מה־Strategy:

```text
BROKER_LIQUIDATION_DETECTED
MANUAL_ORDER_DETECTED
RESTRICTION_CHANGED
PERMISSION_CHANGED
MARGIN_REQUIREMENT_CHANGED
DEPOSIT_HOLD_CHANGED
```

‏RCA מבדיל:

```text
StrategyExit
RiskExit
BrokerLiquidation
CorporateAction
ManualAction
OperationalExit
```

---

## ‏18. Eligibility Funnel

```text
Observed Universe
→ Strategy Eligible
→ Regulatory Eligible
→ Account Eligible
→ Funding Eligible
→ Risk Eligible
→ Execution Eligible
→ Research Trade Candidate
```

‏לכל שלב נשמור count ו־Reason Codes.

‏לדוגמה:

```text
INSUFFICIENT_SETTLED_CASH
INSUFFICIENT_BUYING_POWER
MARGIN_BUFFER_TOO_LOW
PRODUCT_NOT_PERMITTED
ACCOUNT_RESTRICTED
REGULATORY_MODE_UNKNOWN
ACCOUNT_STATE_STALE
BROKER_STATE_UNKNOWN
```

‏Account constraint הוא Hard Veto, לא score penalty.

---

## ‏19. Cash vs Margin Research

‏נשווה Account modes לא רק לפי PnL per trade אלא גם לפי:

```text
eligible_opportunity_rate
capital_turnover_capacity
capital_time
account_rejection_rate
margin / settlement utilization
operational_failure_rate
net outcome after all costs
```

‏Margin שמגדיל throughput אך מוסיף forced-liquidation/tail/operational risk אינו אוטומטית עדיף.

---

## ‏20. Settlement-Aware Backtest

‏Backtest ל־Cash חייב לשחזר:

```text
trade date
settlement date
business calendar
cash currency
settled/unsettled state
working-order reservation
fees
```

‏אם הוא ממחזר proceeds מוקדם מדי, התוצאה היא infeasible.

---

## ‏21. Margin-Aware Backtest

‏Backtest ל־Margin חייב לשחזר לפחות:

```text
Equity
InitialMargin
MaintenanceMargin
IntradayRequirement
WorkingOrders
Concentration
HouseRule assumptions
External liquidation scenarios
```

‏לא מספיק לחשב PnL.

---

## ‏22. Historical Rule Versioning

‏כאשר מטרת Backtest היא feasibility היסטורי:

```text
HistoricalAccountRuleVersion
HistoricalRegulatoryMode
HistoricalBrokerPolicyAssumption
```

‏צריכים להיות חלק מה־Experiment Manifest.

‏אין להשתמש בכלל 2026 כאילו חל על כל ההיסטוריה.

---

## ‏23. Regulatory Mode

‏Domain model אפשרי:

```text
LEGACY_PDT
INTRADAY_MARGIN
OTHER
UNKNOWN
```

‏אבל הערך מגיע מ־broker/account truth או verification תפעולי — לא מהתאריך בלבד.

---

## ‏24. Time-Sensitive Verification Snapshot — `Verified 2026-10-27`

‏Facts שאומתו מחדש מול מקורות רשמיים/ראשוניים:

- ‏ה־SEC קבע `T+1` כ־standard settlement cycle לרוב עסקאות ניירות הערך הרלוונטיות בארה"ב החל מ־28 במאי 2024.
- ‏FINRA's new Intraday Margin Requirements נכנסו לתוקף ב־4 ביוני 2026.
- ‏ל־brokerage firms יש transition period עד 20 באוקטובר 2027; בתקופה זו broker מסוים עדיין יכול לפעול תחת legacy PDT או לעבור למסגרת החדשה מוקדם יותר.
- ‏במסגרת החדשה אין `Pattern Day Trader` designation המבוסס על trade-count ואין דרישת `$25,000` הייעודית ל־PDT; במקומן יש intraday margin requirements מבוססי exposure/equity.
- ‏FINRA מציינת `$2,000` כמינימום equity לשימוש ב־margin leverage; broker רשאי לדרוש יותר.
- ‏ב־Cash Account אין borrowing רגיל מה־broker לצורך רכישות; frequent trading עדיין כפוף ל־settled-funds / Regulation T constraints.
- ‏Same-day buy/sell ב־Cash אינו כשלעצמו הבעיה כאשר הרכישה מומנה במלואה בכספים מתאימים; free-riding / good-faith style violations קשורים למקור המימון ול־settlement.

‏כל ה־Facts האלה מסומנים `TIME_SENSITIVE`. לפני implementation או שימוש תפעולי יש לאמת מחדש מול regulator + broker/account הספציפי.

---

## ‏25. Source Hierarchy

‏ל־Account/Regulatory claims קריטיים:

```text
Regulator / Exchange official rule
→ Broker current account-specific documentation
→ Broker portal/API actual state
→ Secondary sources
```

‏כאשר documentation סותר את account state בפועל:

```text
Stop
→ Reconcile / Verify
→ Do not bypass restriction
```

---

## ‏26. Broker Adapter Boundary

‏Adapter ממפה:

```text
BrokerField
→ InternalMeaning
→ Unit
→ Currency
→ AccountSegment
→ Freshness
→ SourceTimestamp
```

‏ה־Strategy אינה יודעת מה פירוש label UI כמו `Available to Trade` ללא mapping מפורש.

---

## ‏27. Multi-Currency

‏נשמור:

```text
BaseCurrency
CashByCurrency
SettledCashByCurrency
FXExposure
```

‏Base Currency היא reporting concept ואינה אומרת שהכסף כולו זמין במטבע הדרוש.

‏FX/settlement assumptions צריכים להיות explicit במחקר.

---

## ‏28. Account State Quality

```text
KNOWN
PARTIAL
STALE
UNKNOWN
```

‏Metrics:

```text
AccountStateAge
AccountFeedGapDuration
ReconciliationSuccessRate
BrokerLocalMismatchCount
UnknownEffectCount
OrderRejectRate
UnexpectedRestrictionCount
```

---

## ‏29. Monitoring / Drift

‏Account metrics הם גם detectors ל־rule drift:

- ‏Buying Power semantics changed.
- ‏Margin requirement distribution shifted.
- ‏Reject reasons changed.
- ‏Account state latency increased.
- ‏Restriction frequency changed.
- ‏Broker migration to a new regulatory mode occurred.

‏RCA קודם ל־retuning.

---

## ‏30. Stress / Replay Scenarios

‏Golden scenarios:

```text
Cash with settled funds
Cash with unsettled proceeds
Pending order consumes buying power
Partial fill + remaining reservation
Margin ample
Margin near maintenance threshold
House margin requirement increases
Broker liquidation occurs externally
Submit timeout → UNKNOWN_EFFECT
Reconnect with stale local position
Permission revoked
Restriction added
Deposit hold changes
Unexpected overnight position
Regulatory mode changes between versions
```

---

## ‏31. Core Invariants

```text
HardAccountVeto == true
→ NewExposureCreated == false
```

```text
UnknownAccountState
→ NoNewRisk
```

```text
Exit / RiskReduction
must not depend on permission to create new exposure
```

```text
BrokerPositionTruth after reconnect
wins over stale local assumptions
```

---

## ‏32. Failure Modes

‏Failure modes מרכזיים:

- ‏`Cash == SettledCash` bug.
- ‏Double-spend של Buying Power.
- ‏Torn account snapshot.
- ‏Stale permission/restriction state.
- ‏Blind retry after timeout.
- ‏Working-order reserve omitted.
- ‏Partial fill omitted from exposure.
- ‏Current rule applied to historical period.
- ‏Broker UI label copied as domain semantics.
- ‏Currency/unit mismatch.
- ‏Margin boundary calculations with no safety buffer.
- ‏Assuming warning before broker liquidation.
- ‏Strategy continuing after account stream failure.
- ‏Regulatory-mode guess based only on calendar date.
- ‏Using broker maximum capacity as strategy allocation target.

---

## ‏33. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏Broker-specific rules scattered through Strategy code.
- ‏automatic margin optimization.
- ‏dynamic leverage maximization.
- ‏multi-account capital routing.
- ‏complex cross-segment collateral logic.
- ‏automatic responses to unknown regulator/broker changes.
- ‏execution while account truth is stale.

‏קודם Eligibility, ledger, reservation, reconciliation ו־observability נכונים.

---

## ‏34. What to Add Later

‏לאחר Baseline יציב:

- ‏historical account-event replay.
- ‏capital-efficiency analytics.
- ‏point-in-time house-margin history כאשר זמין.
- ‏continuous headroom precomputation.
- ‏multi-currency funding model מדויק יותר.
- ‏broker/provider comparison adapters.
- ‏automated rule-drift alerts.
- ‏formal operational `RuleWatch` process.

---

## ‏35. Required Data / Evidence

‏לכל Account-aware experiment נדרש לפחות:

```text
account snapshot at decision time
positions
open orders
pending / unknown-effect exposure
cash by currency
settled cash by currency
buying power / available funds
margin requirements
restrictions / permissions
regulatory mode
rule versions
order accept/reject outcome
broker reason code
reconciliation result
```

‏כאשר data היסטורי חסר — limitation נרשמת במפורש ואין להציג account feasibility כאילו שוחזרה.

---

## ‏36. Promotion Criteria

‏Account layer מתקדם ל־Production Readiness רק אם:

1. ‏Account semantics ממופים ומתועדים.
2. ‏Static/Dynamic eligibility מופרדים.
3. ‏Unknown/stale state fail closed ל־new risk.
4. ‏Exit/risk-reduction path נפרד.
5. ‏Capital reservation atomic.
6. ‏Working orders/partial fills נכללים.
7. ‏`UNKNOWN_EFFECT` מוביל ל־reconciliation ולא retry עיוור.
8. ‏Startup/reconnect rebuild deterministic.
9. ‏Broker/local mismatches observable.
10. ‏Rule/account configuration versioned.
11. ‏Time-sensitive assumptions verified.
12. ‏Replay/stress scenarios עוברים.

‏זו readiness הנדסית בלבד, לא אישור לבצע מסחר אמיתי.

---

## ‏37. Rejection Criteria

‏Design נדחה אם:

- ‏הוא נשען על UI label לא מוגדר.
- ‏Account snapshot יכול להיות torn/stale בלי detection.
- ‏אין distinction בין settled cash ו־buying power.
- ‏אין reservation/reconciliation.
- ‏Broker reject מטופל כ־generic API failure.
- ‏regulatory mode hard-coded.
- ‏Margin assumptions אינן versioned.
- ‏Replay אינו יכול להסביר למה Candidate היה ineligible.
- ‏Entry block חוסם גם exit/risk reduction.

---

## ‏38. Metrics

### ‏Eligibility

```text
account_eligible_rate
funding_eligible_rate
permission_reject_rate
restriction_reject_rate
regulatory_unknown_rate
```

### ‏Capital

```text
settled_cash_utilization
buying_power_utilization
capital_turnover_capacity
capital_time
margin_headroom
open_order_reserve
```

### ‏Operations

```text
account_state_age_p95
account_query_latency_p95
reconciliation_success_rate
broker_local_mismatch_rate
unknown_effect_rate
order_reject_rate
```

### ‏Research impact

```text
predictive_candidates
account_eligible_candidates
execution_eligible_candidates
counterfactual_unavailable_opportunities
net_outcome_under_account_constraints
```

---

## ‏39. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Account type, settlement, permissions, margin, restrictions ו־broker state יכולים להגביל action גם כאשר Signal קיים.
- ‏Broker house rules יכולים להיות מחמירים יותר ממינימום רגולטורי.
- ‏Time-sensitive rules יכולים להשתנות.

### ‏Judgment

- ‏AccountEligibilityEngine נפרד הוא ה־Baseline הנכון.
- ‏Unknown/stale account state צריך לחסום new risk במחקר production-like.
- ‏Settlement/Buying Power צריכים להיכלל ב־realistic backtest.

### ‏Hypothesis

- ‏איזה Account mode נותן את ה־best net capital efficiency עבור Strategy מסוימת.
- ‏כמה Margin capacity מוסיפה value נטו לאחר complexity/risk.
- ‏כמה Account plumbing latency פוגע ב־short-horizon opportunities.

---

## ‏40. Confidence

### ‏High

- ‏הפרדת Signal / Eligibility / Funding / Risk / Execution.
- ‏Point-in-time account state.
- ‏Reconciliation לפני retry.
- ‏Versioning ל־rules.
- ‏Fail-closed ל־new risk כשה־state אינו אמין.

### ‏Medium

- ‏המבנה המוצע של `AccountSnapshot` ו־funnel מתאים ל־architecture שלנו.
- ‏`CapitalTime` ו־turnover capacity הם metrics שימושיים למחקר.

### ‏Low / Unproven

- ‏איזה Account Type עדיף אסטרטגית.
- ‏איזה safety buffer מספרי נכון.
- ‏כמה leverage, אם בכלל, מוסיף net value.

---

## ‏41. User-Specific Application

‏למערכת שסורקת Universe רחב ומחפשת הזדמנויות קצרות, Account layer צריך להיות מחוץ ל־ranking עצמו:

```text
Market Data
→ Filters / Features / Rank
→ Candidate
→ AccountEligibilityEngine
→ RiskEngine
→ ExecutionFeasibility
→ Research TRADE / NO TRADE
```

‏ה־Scanner רשאי לומר "זה Candidate חזק" גם כאשר ה־Account layer אומר:

```text
NO TRADE
Reason = ACCOUNT_CONSTRAINT
```

‏כך לא מזהמים את המחקר של Signal עם limitations תפעוליים, ובמקביל לא מציגים Opportunity בלתי־ממומנת כאילו הייתה executable.

---

## ‏42. Definition of Done

‏לפני שה־Account layer נחשב בשל למחקר production-like, המערכת צריכה לדעת לענות בכל Decision:

```text
What account type is active?
Which broker/legal entity owns the account relationship?
Which permissions are active?
Which regulatory mode is verified?
How much settled cash exists by currency?
What buying power / available funds exist?
What margin headroom remains?
What resources are reserved by working orders?
What pending / unknown-effect exposure exists?
How fresh is account state?
Which rule version produced eligibility?
What blocks new risk?
What still permits risk reduction?
How is broker truth reconciled after failure?
```

---

## ‏43. Recommendation Summary

```text
Do not model account state as one balance number.

Use:
Strategy Decision
→ Account Eligibility
→ Funding / Settlement
→ Margin / Permissions / Restrictions
→ Risk
→ Execution
→ Broker Acceptance
→ Reconciliation

Keep account truth point-in-time, fresh, versioned and explainable.
Treat UNKNOWN as not eligible for new risk.
Replay settlement and margin constraints in research.
Never hard-code time-sensitive broker/regulatory assumptions as universal truth.
```
