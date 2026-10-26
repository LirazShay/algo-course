# ‏שלב 71 — `Account Mechanics and Regulations`: להבין מה באמת מותר, זמין וניתן לביצוע בחשבון

> ‏מטרת הפרק: להבין את שכבת החשבון והרגולציה שמתווכת בין Strategy לבין Order אמיתי — `Cash`, ‏`Margin`, ‏settlement, settled cash, buying power, maintenance margin, intraday margin, freeriding, broker house rules, permissions, liquidation risk, short eligibility ו־account state. המטרה אינה לשנן כלל בודד, אלא לבנות מודל נכון של השאלה: **האם העסקה חוקית, מותרת בחשבון, ממומנת, בת־ביצוע ובטוחה מבחינה תפעולית כרגע?**
>
> ‏העיקרון המרכזי: **`Signal != Permission != Buying Power != Settled Cash != Executable Trade`. מערכת מקצועית מפרידה בין כל השכבות האלה ואינה מניחה ש־Order שאפשר לחשב הוא Order שמותר או אפשר לשלוח.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו ייעוץ משפטי, מס, השקעות או המלצה לבצע מסחר אמיתי. כללי Broker, חשבון, גיל/זכאות, מדינה, מוצר ורגולציה משתנים; לפני שימוש מעשי יש לאמת אותם מול המקורות הרשמיים וה־Broker הספציפי.

---

# ‏1. למה Account Mechanics הוא חלק מה־Trading System

‏קל לחשוב שהשרשרת היא:

```text
Signal
→ Order
→ Fill
```

‏בפועל חסרות שכבות קריטיות:

```text
Signal
→ Candidate
→ Account Eligibility
→ Regulatory Eligibility
→ Product Permission
→ Funding / Buying Power
→ Settlement State
→ Margin State
→ Broker House Rules
→ Order Validation
→ Submission
→ Broker Acceptance
→ Fill
```

‏כל שכבה יכולה להפוך החלטת `TRADE` ל־`NO TRADE`.

---

# ‏2. ארבעה סוגי “אפשר” שאסור לערבב

‏כאשר מערכת אומרת “אפשר לקנות”, צריך לדעת לאיזה `אפשר` היא מתכוונת:

```text
StrategyCanTrade
RegulationAllows
AccountAllows
BrokerWillAccept
```

‏אלה אינם אותו דבר.

‏לדוגמה:

- ‏ה־Strategy רוצה לפתוח Position.
- ‏החשבון אינו מורשה למוצר.
- ‏או אין settled cash.
- ‏או יש margin deficit.
- ‏או ה־Broker החמיר זמנית את דרישות ה־Margin.

‏מבחינת Execution התוצאה זהה: אין Entry.

---

# ‏3. `Cash Account`

‏ב־Cash Account אין Borrowing רגיל מה־Broker לצורך רכישת ניירות ערך.

‏צריך להבין לפחות:

```text
CashBalance
SettledCash
UnsettledProceeds
AvailableToTrade
AvailableToWithdraw
```

‏הם עלולים להיות שונים.

---

# ‏4. Cash Balance אינו Settled Cash

‏אחרי מכירה אפשר לראות Cash חשבונאי, אבל חלק ממנו עדיין יכול להיות בתהליך Settlement.

‏לכן:

```text
CashDisplayed != NecessarilySettledCash
```

‏ולעיתים:

```text
TradingAvailability != WithdrawalAvailability
```

---

# ‏5. `Trade Date` מול `Settlement Date`

‏`Trade Date` הוא היום שבו העסקה בוצעה.

‏`Settlement Date` הוא היום שבו החלפת הכסף והנייר אמורה להסתיים במערכת הסליקה.

‏אלה שני timestamps כלכליים שונים.

---

# ‏6. מצב ארה״ב נכון ל־26 באוקטובר 2026 — `T+1`

‏מאז 28 במאי 2024, מחזור ה־Settlement הסטנדרטי עבור רוב עסקאות ניירות הערך בארה״ב הוא:

```text
T+1
```

‏כלומר בדרך כלל יום עסקים אחד אחרי Trade Date.

‏זה אינו אומר שכל שוק, מוצר, Currency leg או Broker workflow זהים.

---

# ‏7. למה `T+1` חשוב לרובוט קצר־טווח

‏Strategy יכול להחזיק Position רק שניות.

‏אבל ה־Cash lifecycle יכול להימשך מעבר ל־Trade עצמו.

‏לכן:

```text
PositionHoldingTime ≠ CashSettlementTime
```

‏אלו שני horizons שונים לחלוטין.

---

# ‏8. Cash Account יכול לבצע Buy ואז Sell באותו יום — בתנאים הנכונים

‏טעות נפוצה היא לחשוב ש־Cash Account אוסר אוטומטית Buy+Sell באותו יום.

‏אם הרכישה שולמה בכסף שכבר היה זמין ומסולק כנדרש, עצם המכירה באותו יום אינה בהכרח הבעיה.

‏הבעיה נוצרת כאשר משתמשים ב־cash flows שטרם הוסדרו באופן שאינו עומד בכללי החשבון/Regulation T.

---

# ‏9. `Freeriding`

‏Freeriding הוא מצב שבו רכישה אינה משולמת כנדרש מכספים מתאימים, ובפועל המכירה של אותו נייר משמשת למימון הרכישה עצמה.

‏זה אינו “עוד Fee”.

‏זו בעיית Credit/Settlement compliance.

---

# ‏10. `Good Faith Violation`

‏Broker-ים משתמשים לעיתים במונח `Good Faith Violation` למצבים שבהם נייר נרכש על בסיס proceeds שעדיין לא הוסדרו ואז נמכר לפני שהכספים שמימנו אותו הוסדרו.

‏היישום המדויק וה־restrictions יכולים להשתנות בין Broker-ים.

‏לכן מנוע אוטומטי לא צריך להסתמך על שם violation בלבד, אלא על:

```text
FundingSource
SettlementState
BrokerPolicy
```

---

# ‏11. Broker restrictions אחרי Cash violations

‏Broker יכול להגביל חשבון בעקבות violations.

‏לכן רובוט מקצועי צריך להכיר גם:

```text
AccountRestrictionState
```

‏ולא רק Cash Balance.

---

# ‏12. Cash Account אינו Short Account

‏בדרך כלל Short Selling של מניות דורש חשבון Margin והרשאות מתאימות.

‏לכן:

```text
ShortCandidate
→ MarginEligibility
→ BorrowEligibility
→ ShortPermission
```

‏לפני Execution.

---

# ‏13. `Margin Account`

‏Margin Account מאפשר שימוש במסגרת אשראי/Collateral בהתאם לכללים ול־Broker.

‏אבל “Margin Account” אינו אומר:

```text
UnlimitedLeverage
```

‏והוא אינו מבטל Risk Controls.

---

# ‏14. Initial Margin מול Maintenance Margin

‏שני מושגים שונים:

```text
Initial Margin
→ מה נדרש כדי לפתוח/להגדיל Exposure

Maintenance Margin
→ מה נדרש כדי להמשיך להחזיק Exposure
```

‏מערכת צריכה לעקוב אחרי שניהם.

---

# ‏15. `House Margin`

‏Broker רשאי במקרים רבים לדרוש יותר מהמינימום הרגולטורי.

‏לכן:

```text
RegulatoryMinimum != BrokerHouseRequirement
```

‏וה־House Requirement יכול להשתנות לפי:

- ‏Security.
- ‏Volatility.
- ‏Concentration.
- ‏Liquidity.
- ‏Event risk.
- ‏Account state.

---

# ‏16. Margin Rules יכולים להשתנות בזמן אמת

‏מניה שהייתה marginable בבוקר אינה בהכרח זהה בצהריים מבחינת requirement.

‏לכן אין לקודד:

```text
MarginRate = constant
```

‏כ־assumption קשיח.

---

# ‏17. `Buying Power`

‏Buying Power אינו יתרת המזומן.

‏הוא נגזר מ־account equity, margin requirements, current positions, pending orders וכללי Broker.

‏לכן:

```text
BuyingPower != Cash
```

---

# ‏18. `Available Funds`

‏בחשבונות Margin יש לעיתים מדדים כגון:

```text
AvailableFunds
ExcessLiquidity
InitialMarginRequirement
MaintenanceMarginRequirement
NetLiquidationValue
```

‏כל אחד עונה על שאלה אחרת.

---

# ‏19. `Excess Liquidity`

‏זהו אחד המדדים החשובים להבנת cushion מול Maintenance Margin.

‏כאשר הוא נשחק, הסיכון ל־liquidation גדל.

‏לכן Strategy אינה צריכה לחשוב רק:

```text
CanIEnter?
```

‏אלא גם:

```text
HowMuchSafetyBufferRemainsAfterEntry?
```

---

# ‏20. Broker יכול לבצע Liquidation בלי לחכות ל־Strategy

‏בחשבון Margin, Broker עשוי להיות רשאי לסגור Positions כדי להחזיר את החשבון לעמידה בדרישות.

‏מכאן:

```text
StrategyExitLogic
```

‏אינה בהכרח הגורם היחיד שיכול לסגור Position.

---

# ‏21. Broker Liquidation היא External State Transition

‏ב־State Machine צריך לטפל ב:

```text
BROKER_LIQUIDATION_DETECTED
```

‏כאירוע חיצוני.

‏אסור להניח שכל Fill נוצר מ־Order שה־Strategy שלחה.

---

# ‏22. Margin Call אינו Contract לחכות לך

‏אסור לבנות מערכת על ההנחה:

```text
If margin is low,
broker will warn first,
and we will have time.
```

‏המערכת צריכה להישאר בטווח בטוח מראש.

---

# ‏23. Intraday Margin

‏Margin risk אינו רק End-of-Day.

‏Exposure תוך־יומי יכול ליצור Requirement תוך כדי היום.

‏לכן צריך למדוד:

```text
IntradayExposure
IntradayRequirement
IntradayDeficit
```

---

# ‏24. שינוי חשוב ב־2026 — מעבר מ־`PDT` ל־Intraday Margin

‏FINRA אימצה מסגרת חדשה שמחליפה את כללי ה־Pattern Day Trader הישנים במודל Intraday Margin מבוסס Risk.

‏ה־effective date הוא 4 ביוני 2026.

‏אבל יש Transition Period.

---

# ‏25. תקופת המעבר חשובה מאוד

‏Broker-ים יכולים לעבור למסגרת החדשה בזמנים שונים במהלך תקופת המעבר, שמותרת עד 20 באוקטובר 2027.

‏לכן נכון ל־26 באוקטובר 2026:

```text
Some Accounts/Brokers → New Intraday Margin Framework
Other Accounts/Brokers → Legacy PDT Framework During Transition
```

‏אסור להניח מה חל על חשבון מסוים בלי לבדוק.

---

# ‏26. במסגרת החדשה אין `PDT` trade-count gate באותה צורה

‏במסגרת החדשה FINRA מסירה את מנגנון ה־Pattern Day Trader המבוסס על ספירת day trades ואת רף ה־$25,000 שהיה קשור אליו.

‏במקומו מודדים Intraday Margin ביחס ל־positions וה־risk.

---

# ‏27. אבל `$25,000` לא “נעלם מהעולם באותו יום”

‏בגלל תקופת המעבר, Broker שעדיין פועל תחת המסגרת הישנה יכול להמשיך להחיל את כללי PDT הישנים.

‏זו דוגמה קלאסית לכך ש:

```text
RuleEffectiveDate != EveryBrokerMigrationDate
```

---

# ‏28. Legacy PDT

‏במסגרת הישנה, Pattern Day Trader הוגדר בדרך כלל לפי מספר Day Trades בחשבון Margin בפרק זמן נתון, והיה קשור בין היתר לדרישת equity של $25,000.

‏ב־2026 יש להתייחס לזה כ־legacy framework שעדיין יכול לחול בתקופת המעבר.

---

# ‏29. New Intraday Margin

‏במסגרת החדשה הדגש הוא על:

```text
Actual Intraday Exposure
Required Equity
Intraday Margin Deficit
```

‏ולא על counting rule בלבד.

---

# ‏30. `$2,000` ומסחר ממונף

‏FINRA מציינת שבמסגרת Margin, מינימום equity של $2,000 נדרש בדרך כלל כדי להשתמש ב־margin leverage.

‏Broker יכול לדרוש יותר.

‏חשבון Margin מתחת לרמה המתאימה אינו בהכרח רשאי להשתמש במינוף רק משום שהוא מוגדר `Margin`.

---

# ‏31. Cash Account אינו כפוף ל־PDT באותה צורה

‏כללי PDT ההיסטוריים נגעו ל־Margin Accounts.

‏אבל Cash Account כפוף למגבלות Funding/Settlement משלו.

‏לכן מעבר ל־Cash אינו “ביטול מגבלות”.

‏הוא מחליף סוג אחד של constraints בסוג אחר.

---

# ‏32. Regulatory Rule מול Broker Rule

‏מנוע מקצועי צריך להפריד:

```text
RegulatoryRule
BrokerHouseRule
AccountSpecificRestriction
```

‏Broker יכול להיות מחמיר יותר מהרגולטור.

---

# ‏33. Exchange Rule מול Broker Rule

‏גם Exchange/venue יכול להכניס restrictions שונים.

‏לכן:

```text
MarketAllows
BrokerAllows
AccountAllows
```

‏צריכים כולם להיות true.

---

# ‏34. Product Permission

‏חשבון יכול להיות פתוח ועדיין לא להיות מורשה לכל מוצר.

‏לדוגמה, Broker יכול לדרוש permissions נפרדים עבור:

- ‏Stocks.
- ‏Options.
- ‏Futures.
- ‏Complex products.
- ‏Short selling.
- ‏Markets/regions מסוימים.

---

# ‏35. Jurisdiction Matters

‏אותו Broker brand יכול להחזיק לקוחות דרך entities משפטיים שונים.

‏לכן:

```text
BrandName != LegalEntity
```

‏וכללי eligibility/account protection/product access יכולים להשתנות לפי entity ומדינת הלקוח.

---

# ‏36. Account Type הוא חלק מה־Configuration Fingerprint

‏בכל החלטה שנשמרת ל־Replay כדאי לדעת:

```text
AccountType
BrokerEntity
PermissionSetVersion
MarginMode
RegulatoryMode
```

‏אחרת Replay עתידי עלול לשחזר Strategy אבל לא את Eligibility האמיתי.

---

# ‏37. `AccountEligibilityEngine`

‏בארכיטקטורה שלנו כדאי לחשוב על רכיב נפרד:

```text
AccountEligibilityEngine
```

‏שמטרתו אינה לחזות מחיר.

‏הוא מחזיר האם פעולה מסוימת מותרת ואפשרית בחשבון הנוכחי.

---

# ‏38. Contract אפשרי

```text
AccountEligibilityResult
- IsEligible
- ReasonCodes[]
- BuyingPowerAvailable
- SettledCashAvailable
- ExcessLiquidity
- MarginRequirement
- AccountRestrictionState
- ProductPermissionState
- RegulatoryMode
- ObservedAt
- Freshness
```

---

# ‏39. `Eligibility != Risk Approval`

‏גם אם החשבון מאפשר Trade, ה־Risk Engine יכול לדחות אותו.

‏לכן:

```text
AccountEligible
AND RiskApproved
AND StrategyApproved
```

‏נדרשים יחד.

---

# ‏40. `Eligibility != Economic Edge`

‏אפשרי טכנית אינו אומר כדאי כלכלית.

‏לדוגמה:

```text
Broker accepts
but
margin usage + spread + fees + latency
make RemainingNetEdge <= 0
```

‏התוצאה צריכה להיות `NO TRADE`.

---

# ‏41. Settled Cash הוא State שצריך Timestamp

‏לא מספיק לשמור:

```text
SettledCash = 1000
```

‏צריך גם:

```text
ObservedAt
Source
Currency
AccountSegment
```

---

# ‏42. Currency Matters

‏Cash זמין ב־ILS אינו בהכרח settled USD זמין לרכישת מניה אמריקאית בחשבון Cash.

‏Conversion ו־FX settlement הם חלק מה־funding state.

---

# ‏43. Multi-Currency Account

‏צריך להבדיל בין:

```text
BaseCurrency
CashByCurrency
SettledCashByCurrency
FXExposure
```

‏Base Currency היא בעיקר reporting concept.

‏היא אינה אומרת שכל הכסף מוחזק פיזית במטבע הזה.

---

# ‏44. `Available To Trade` אינו Universal Field

‏Broker UI/API יכול לחשב את המדד אחרת לפי Account Type.

‏לכן Adapter צריך לתרגם אותו ל־domain concepts שלנו, לא להעתיק label עיוור.

---

# ‏45. `Available To Withdraw`

‏כסף שזמין למסחר לא תמיד זמין למשיכה.

‏יכולות להיות סיבות כגון:

- ‏Settlement.
- ‏Deposit hold.
- ‏Margin collateral.
- ‏Pending obligations.

---

# ‏46. Pending Orders צורכים Resources

‏Order שעדיין לא התמלא יכול לתפוס Buying Power.

‏לכן:

```text
AvailableBeforeOrder
!=
AvailableAfterSubmit
```

‏גם בלי Fill.

---

# ‏47. Cancel אינו משחרר Buying Power בהכרח מיד

‏עד שה־Broker מאשר את ה־Cancel ואת מצב ה־Order, resource reservation יכול להישאר.

‏זה מתחבר ל:

```text
CancelRequested != Canceled
```

---

# ‏48. Partial Fill משנה Account State

‏ב־Partial Fill חלק מה־capital כבר הפך ל־Position וחלק אולי עדיין Reserved ל־Order.

‏לכן צריך לחשב:

```text
FilledExposure
PendingExposure
ReservedBuyingPower
RemainingIntent
```

---

# ‏49. Account State הוא Dynamic Input

‏הוא אינו Configuration סטטי.

‏הוא משתנה בגלל:

- ‏Fills.
- ‏Price movement.
- ‏Margin requirement changes.
- ‏Cash settlement.
- ‏FX.
- ‏Fees.
- ‏Corporate actions.
- ‏Broker restrictions.

---

# ‏50. `Pre-Trade Account Snapshot`

‏לפני Order רצוי snapshot עקבי של:

```text
NetLiquidation
Cash
SettledCash
BuyingPower
AvailableFunds
ExcessLiquidity
InitialMargin
MaintenanceMargin
OpenOrders
Positions
Restrictions
Permissions
```

---

# ‏51. Freshness של Account Snapshot

‏Account state ישן יכול להיות מסוכן בדיוק כמו stale quote.

‏לכן:

```text
AccountStateAge
```

‏צריך להיות observable.

---

# ‏52. Account Feed Gap

‏אם market data עובד אבל account stream הפסיק:

```text
MarketHealthy = true
AccountStateHealthy = false
```

‏זה לא מצב רגיל.

‏ל־new risk בדרך כלל נכון fail closed.

---

# ‏53. New Entry מול Exit

‏אם Account State degraded:

```text
BlockNewEntry
```

‏לא חייב להיות שווה ל:

```text
BlockExit
```

‏Exit בדרך כלל צריך להישאר אפשרי ככל שניתן.

---

# ‏54. Risk Reservation לפני Submit

‏לפני Order חדש אפשר לשמור Reservation פנימית כדי למנוע שני workers מלצרוך את אותו Buying Power במקביל.

```text
Reserve
→ Validate
→ Submit
→ Reconcile
→ Release/Convert
```

---

# ‏55. Double Spend של Buying Power

‏במערכת concurrent, שני Candidates יכולים לראות אותה יתרה בו־זמנית.

‏אם כל אחד מניח שהכול פנוי:

```text
Candidate A consumes 80%
Candidate B consumes 80%
```

‏נוצר overcommit.

---

# ‏56. Account State צריך Single Writer או Atomic Reservation

‏זו בעיית Concurrency, לא Strategy.

‏הפתרון צריך להיות deterministic.

---

# ‏57. Settlement Ledger

‏כדאי לחשוב על Settlement כ־Ledger:

```text
Trade
→ Obligation
→ SettlementDate
→ Settled
```

‏ולא כ־boolean מקרי ב־UI.

---

# ‏58. Weekend/Holiday Effects

‏`T+1` מתייחס ל־Business Day.

‏לכן Friday trade אינו שקול ל־Monday trade מבחינת calendar distance.

---

# ‏59. Market Calendar הוא חלק מ־Settlement

‏חישוב Settlement צריך calendar תקין ולא:

```text
tradeDate + 24h
```

---

# ‏60. Cross-Market Settlement

‏אם Strategy בעתיד תשתמש בניירות משווקים שונים, Settlement convention יכול להיות שונה.

‏אין להחיל `T+1` אמריקאי באופן אוניברסלי.

---

# ‏61. Cash Recycling

‏במערכת קצרה, השאלה אינה רק כמה Capital יש אלא כמה ממנו ניתן למחזר תחת כללי החשבון.

‏מדד שימושי:

```text
CapitalTurnoverCapacity
```

---

# ‏62. Capital Turnover אינו רק Strategy Metric

‏הוא פונקציה של:

```text
HoldingTime
SettlementRules
AccountType
MarginAvailability
Fees
BrokerPolicy
```

---

# ‏63. Settlement-Aware Backtest

‏Backtest לחשבון Cash צריך לעקוב גם אחרי funds settlement.

‏אחרת הוא עלול לבצע יותר Trades ממה שהחשבון היה יכול לממן.

---

# ‏64. Margin-Aware Backtest

‏Backtest ל־Margin צריך לעקוב אחרי:

```text
Equity
InitialMargin
MaintenanceMargin
IntradayRequirements
OpenOrders
Concentration
```

‏לא רק PnL.

---

# ‏65. Historical Rule Versioning

‏Backtest היסטורי צריך לדעת אילו rules חלו בתקופה שנבדקת אם המטרה היא לשחזר eligibility היסטורי.

‏לדוגמה:

```text
PDTLegacyPeriod
TransitionPeriod
IntradayMarginPeriod
```

---

# ‏66. `RegulatoryMode`

‏ב־Domain Model אפשר להחזיק:

```text
RegulatoryMode = LEGACY_PDT | INTRADAY_MARGIN | OTHER
```

‏אבל הערך חייב להגיע מ־Broker/account truth, לא מהשערה.

---

# ‏67. Transition Risk

‏כאשר Broker משנה implementation:

- ‏Buying Power fields יכולים להשתנות.
- ‏Rejection reasons יכולים להשתנות.
- ‏Margin calculations יכולים להשתנות.
- ‏API semantics יכולים להשתנות.

‏זה Event תפעולי משמעותי.

---

# ‏68. Rule Change הוא `Data Change`

‏מבחינת מערכת Algo:

```text
Regulation Change
```

‏הוא למעשה שינוי ב־input domain.

‏צריך versioning ו־release readiness.

---

# ‏69. `RuleVersion`

‏Decision log יכול לכלול:

```text
RuleVersion
BrokerRuleVersion
AccountPolicyVersion
```

‏כדי להבין בעת RCA למה Trade היה מותר אז.

---

# ‏70. Broker Docs יכולים להיות לא עקביים

‏מסמכי Broker שונים יכולים להתעדכן בקצבים שונים.

‏לדוגמה, אפשר למצוא documentation כללי שמציג settlement convention ישן לצד מקור עדכני שמדבר על `T+1`.

‏מכאן כלל מקצועי:

> ‏כאשר Fact תפעולי משפיע על כסף או eligibility, מאמתים אותו ממקור רשמי עדכני ולא מסתמכים על snippet יחיד.

---

# ‏71. Source Hierarchy

‏ל־rules קריטיים כדאי סדר עדיפויות:

```text
Regulator / Exchange Official Rule
→ Broker Current Account-Specific Documentation
→ Broker API/Portal Actual State
→ Secondary Documentation
```

---

# ‏72. Actual Broker State מנצח Assumption

‏גם אם מסמך אומר ש־Trade “אמור” להיות מותר, אם ה־Broker מחזיר restriction אמיתי — המערכת צריכה לעצור ולחקור.

‏לא מנסים לעקוף restriction אוטומטית.

---

# ‏73. Rejection Reason הוא Data

‏כל Order Reject צריך להישמר עם:

```text
BrokerCode
BrokerMessage
IntentId
AccountSnapshot
RuleMode
Timestamp
```

---

# ‏74. Repeated Rejects הם System Signal

‏אם Rejection rate עולה, זה יכול לרמוז על:

- ‏Policy change.
- ‏Permission problem.
- ‏Margin change.
- ‏Bug.
- ‏Stale account state.

---

# ‏75. `EligibilityReasonCode`

‏Reason Codes לדוגמה:

```text
INSUFFICIENT_SETTLED_CASH
INSUFFICIENT_BUYING_POWER
MARGIN_BUFFER_TOO_LOW
PRODUCT_NOT_PERMITTED
ACCOUNT_RESTRICTED
REGULATORY_MODE_UNKNOWN
SHORT_NOT_PERMITTED
BORROW_NOT_AVAILABLE
ACCOUNT_STATE_STALE
```

---

# ‏76. `UNKNOWN` הוא מצב אמיתי

‏אם לא יודעים איזו מסגרת Margin חלה או אם ה־Account stream stale:

```text
UNKNOWN != ELIGIBLE
```

‏ל־new exposure ברירת המחדל המקצועית היא בדרך כלל fail closed.

---

# ‏77. Margin Buffer

‏לא כדאי לבנות מערכת שפועלת בדיוק על גבול requirement.

‏אפשר לחשוב על:

```text
MarginSafetyBuffer
```

‏בנפרד מ־minimum legal requirement.

---

# ‏78. Regulatory Minimum אינו Risk Target

‏זה שהרגולטור מאפשר מינימום מסוים אינו אומר שזה ה־operating target הנכון למערכת.

‏Risk policy יכולה להיות שמרנית יותר.

---

# ‏79. Concentration Risk

‏Broker יכול להחמיר Margin במניה מרוכזת או חריגה.

‏לכן capital availability תלוי גם במה שכבר מוחזק.

---

# ‏80. Pending Exposure + Margin

‏Risk calculation צריך לכלול:

```text
CurrentPositions
+ WorkingOrders
+ PartialFills
+ UnknownEffectOrders
```

---

# ‏81. `UNKNOWN_EFFECT` חשוב במיוחד לחשבון

‏אם Submit timeout קרה, אסור להניח שה־Order לא קיים ולשלוח שוב.

‏אחרת ניתן להכפיל Exposure ולחרוג מ־Buying Power.

---

# ‏82. Reconciliation לפני Retry

```text
Timeout
→ Query Broker
→ Reconcile Orders/Fills/Positions
→ Decide
```

‏לא:

```text
Timeout
→ Retry blindly
```

---

# ‏83. Account Reconciliation

‏ב־Startup/Reconnect:

```text
Fetch Positions
Fetch Open Orders
Fetch Cash
Fetch Buying Power
Fetch Margin
Fetch Restrictions
Rebuild Local State
```

---

# ‏84. Broker Truth

‏לאחר reconnect, ה־Broker הוא מקור האמת לגבי Orders/Positions שכבר קיימים.

‏State local ישן הוא hypothesis עד reconciliation.

---

# ‏85. `AccountGeneration`

‏אפשר להשתמש ב־generation identifier לאחר reconnect משמעותי:

```text
AccountGeneration++
```

‏וכך callbacks ישנים אינם contaminating state חדש.

---

# ‏86. Account Snapshot Atomicity

‏אם Cash נלקח בזמן אחד ו־Margin בזמן אחר, אפשר ליצור snapshot לא עקבי.

‏לכן צריך לדעת אם Broker מספק atomic snapshot או stream של fields נפרדים.

---

# ‏87. Torn Account Snapshot

‏לדוגמה:

```text
BuyingPower = new
MaintenanceMargin = old
```

‏יכול ליצור החלטה שגויה.

---

# ‏88. `AccountStateConfidence`

‏אפשר לייצג:

```text
KNOWN
PARTIAL
STALE
UNKNOWN
```

---

# ‏89. Account Data SLO

‏לדוגמה למדוד:

- ‏Age.
- ‏Gap duration.
- ‏Reconciliation success.
- ‏Reject rate.
- ‏Mismatch count.
- ‏Unknown-effect count.

---

# ‏90. Positions מול Settled Securities

‏Position display ו־settlement lifecycle אינם אותו דבר.

‏מערכת accounting צריכה להבין זאת במיוחד סביב transfer/withdrawal/cash constraints.

---

# ‏91. Fees משנות Cash State

‏Commission, regulatory fees, borrow fees ו־other charges יכולים לשנות את available funds.

‏אל תניח:

```text
CashAfterTrade = CashBeforeTrade - Notional
```

‏בלבד.

---

# ‏92. Interest on Margin

‏Borrowed cash יכול לשאת interest.

‏באופק של שניות העלות הישירה ל־trade בודד עשויה להיות קטנה, אבל accounting ו־overnight/failed-exit scenarios עדיין חשובים.

---

# ‏93. Unexpected Overnight Position

‏Strategy קצרה יכולה להישאר Position בגלל:

- ‏Halt.
- ‏Disconnect.
- ‏Reject.
- ‏Partial fill.
- ‏Market close.

‏ואז cost/risk model משתנה.

---

# ‏94. Day Strategy צריכה Overnight Contingency

‏גם אם הכוונה היא לעולם לא להחזיק overnight, צריך לדעת מה קורה אם בכל זאת נשאר Position.

---

# ‏95. Short + Account Rules

‏Short מוסיף:

```text
Margin
+ Borrow
+ Short Permission
+ Possible Restrictions
```

‏ולכן Eligibility pipeline מורכב יותר.

---

# ‏96. Options/Futures אינם “עוד מניה”

‏למוצרים אחרים יש settlement, margin, exercise/assignment ו־risk mechanics שונים.

‏אין למחזר אוטומטית Account Engine של equities לכל מוצר.

---

# ‏97. Securities Segment מול Commodities Segment

‏אצל Broker-ים מסוימים קיימת הפרדה חשבונאית/רגולטורית בין segments.

‏צריך להבין איזה field מתייחס לאיזה segment.

---

# ‏98. Net Liquidation Value

‏`NetLiquidationValue` הוא אומדן של ערך החשבון במונחי liquidation, לא “כסף חופשי למסחר”.

‏אין להשתמש בו במקום Buying Power.

---

# ‏99. Unrealized PnL יכול לשנות Margin

‏Position שמפסיד יכול להקטין equity ולהגדיל pressure גם לפני Exit.

‏לכן Account Risk הוא Mark-to-Market.

---

# ‏100. Fast Market יכול לפגוע בשתי שכבות יחד

‏באותו זמן:

```text
Price moves against you
AND
Margin requirement rises
```

‏זה nonlinear risk.

---

# ‏101. House Margin Shock

‏Stress test צריך לכלול החמרת requirements בזמן volatility.

‏לא רק שינוי מחיר.

---

# ‏102. `MarginHeadroom`

‏מדד שימושי:

```text
MarginHeadroom = ExcessLiquidity / NetLiquidationValue
```

‏הנוסחה היא diagnostic candidate, לא כלל רגולטורי אוניברסלי.

---

# ‏103. `BuyingPowerUtilization`

```text
BuyingPowerUtilization = ReservedOrUsed / AvailableBeforeDecision
```

‏עוזר להבין אם המערכת עובדת קרוב מדי לגבול.

---

# ‏104. `SettlementUtilization`

‏ל־Cash research אפשר למדוד כמה מה־capital כרגע:

```text
Settled
Unsettled
Reserved
```

---

# ‏105. Capital Fragmentation

‏Multi-currency, multiple account segments ו־unsettled proceeds יכולים ליצור מצב שבו Total Equity גבוה אבל capital usable נמוך.

---

# ‏106. `CapitalAvailableForStrategy`

‏זה צריך להיות Domain Value משלנו:

```text
CapitalAvailableForStrategy
= min(
    AccountPermissionConstraint,
    FundingConstraint,
    RiskConstraint,
    StrategyAllocationConstraint
  )
```

---

# ‏107. Strategy Allocation Limit

‏גם אם Broker מאפשר $X, Strategy יכולה להקצות פחות.

‏זה מונע coupling בין maximum broker capacity לבין risk budget.

---

# ‏108. Account Rules כ־Hard Veto

‏חיבור ל־60A:

```text
ACCOUNT_RESTRICTED
INSUFFICIENT_SETTLED_CASH
INSUFFICIENT_MARGIN
PERMISSION_MISSING
REGULATORY_STATE_UNKNOWN
```

‏הם `Hard Veto` ולא score penalty.

---

# ‏109. Why Not Soft Penalty?

‏אם Trade אסור או לא ממומן, “ציון נמוך יותר” אינו מתאים.

‏הוא פשוט לא Eligible.

---

# ‏110. `Eligibility Funnel`

```text
Observed Universe
→ Strategy Eligible
→ Regulatory Eligible
→ Account Eligible
→ Funding Eligible
→ Risk Eligible
→ Execution Eligible
→ Trade Candidate
```

---

# ‏111. Log כל Stage

‏כדי לדעת למה לא בוצע Trade צריך לשמור counts בכל שלב.

‏לדוגמה:

```text
4000 observed
120 strategy eligible
80 account eligible
35 execution eligible
3 top candidates
0 traded
```

---

# ‏112. Rejection Funnel

‏אפשר למדוד:

```text
NotEnoughSettledCash
NotEnoughBuyingPower
PermissionDenied
MarginBufferRejected
BrokerRejected
```

---

# ‏113. Cash vs Margin Research חייב להיות נפרד

‏אותה Strategy יכולה לקבל throughput שונה לחלוטין בכל Account Type.

‏לכן performance comparison צריך לכלול Account Mechanics.

---

# ‏114. PnL per Trade אינו מספיק

‏ל־Capital constrained system חשוב גם:

```text
PnL per unit of locked capital-time
```

‏כי Settlement יכול להגביל turnover.

---

# ‏115. `CapitalTime`

‏אפשר לחשוב על:

```text
CapitalTime = CapitalAmount × TimeUnavailable
```

‏כמדד מחקרי.

---

# ‏116. Settlement Delay יכול להפוך Edge ללא Scalable

‏Strategy עם הרבה opportunities יכולה להיות טובה תאורטית אבל מוגבלת בחשבון Cash בגלל capital recycling.

---

# ‏117. Margin אינו “פתרון חינם” ל־Settlement

‏הוא מוסיף:

- ‏Leverage risk.
- ‏Margin requirements.
- ‏Liquidation risk.
- ‏Interest.
- ‏House-rule risk.

---

# ‏118. Capital Efficiency מול Risk

‏אלו שני צירים:

```text
CapitalEfficiency
RiskContainment
```

‏לא מטרה אחת.

---

# ‏119. Broker Auto-Liquidation צריך Test

‏ב־simulation/fault drills צריך לשאול:

- ‏האם local state מזהה liquidation חיצוני?
- ‏האם outstanding orders מבוטלים/מותאמים?
- ‏האם Position Monitor מסנכרן מחדש?

---

# ‏120. Margin Change באמצע Position

‏זה Scenario שצריך להופיע ב־Replay/Stress.

---

# ‏121. Regulatory Change באמצע גרסת מערכת

‏שינוי rule משמעותי צריך trigger ל:

```text
Revalidation
Backtest Assumption Review
Adapter Review
Runbook Update
```

---

# ‏122. `RuleWatch`

‏במערכת Production ניתן להחזיק תהליך תפעולי שבודק שינויים במקורות רשמיים.

‏לא חייב להיות auto-trading logic.

‏המטרה היא למנוע silent rule drift.

---

# ‏123. Time-Sensitive Facts

‏כל fact כגון:

- ‏Settlement cycle.
- ‏PDT/intraday margin.
- ‏Margin minimum.
- ‏Broker permission.
- ‏Fee.

‏צריך להיות מסומן כ־time-sensitive documentation.

---

# ‏124. `VerifiedAt`

‏במסמך תפעולי:

```text
VerifiedAt = 2026-10-26
```

‏עוזר לדעת מתי צריך לבדוק מחדש.

---

# ‏125. API Contract ל־Account Adapter

```text
interface AccountProvider
{
    GetAccountSnapshot()
    GetPositions()
    GetOpenOrders()
    GetRestrictions()
    GetPermissions()
    GetMarginState()
    GetSettlementState()
}
```

‏זה conceptual contract, לא API ספציפי.

---

# ‏126. Separation of Concerns

‏`ExecutionBroker` לא צריך להחביא Account Rules בתוך `PlaceOrder()` בלבד.

‏רצוי שהמערכת תוכל לבדוק Eligibility לפני submit.

---

# ‏127. אבל Pre-Check אינו Guarantee

‏גם אחרי Eligibility check:

```text
BrokerMayReject
```

‏כי state יכול להשתנות.

---

# ‏128. Time-of-Check / Time-of-Use

‏בעיה קלאסית:

```text
Check at t0
Submit at t1
```

‏בין t0 ל־t1 Account State יכול להשתנות.

---

# ‏129. Pre-Submit Revalidation

‏לכן Order path צריך revalidation קרוב ככל הניתן ל־submit.

---

# ‏130. Account State TTL

‏אפשר להגדיר TTL קצר ל־snapshot.

‏אם עבר:

```text
Now - SnapshotTime > TTL
```

‏מבצעים refresh או `NO TRADE`.

---

# ‏131. Account Query Latency

‏גם account validation מוסיף latency.

‏באסטרטגיה קצרה צריך למדוד אותו.

---

# ‏132. Cache vs Freshness

‏אפשר cache לחלק מה־fields היציבים יותר, אבל לא לשדות שמשתנים עם every fill/price move.

---

# ‏133. Static Eligibility מול Dynamic Eligibility

```text
Static:
- account type
- product permission
- jurisdiction

Dynamic:
- settled cash
- buying power
- excess liquidity
- restrictions
- open orders
```

---

# ‏134. Fail Closed for New Risk

‏אם Dynamic Eligibility אינו אמין:

```text
No New Entry
```

‏עד reconciliation.

---

# ‏135. Exit Path צריך Priority

‏Account service degraded לא צריך לגרום למערכת להתעלם מ־existing exposure.

‏Position safety קודמת לפתיחת trades חדשים.

---

# ‏136. Account State Monitoring

‏Dashboard מקצועי יכול להציג:

```text
NetLiquidation
SettledCash
BuyingPower
ExcessLiquidity
MarginUtilization
OpenOrderReserve
RestrictionState
AccountStateAge
RegulatoryMode
```

---

# ‏137. Alerts

‏Alerts אפשריים:

- ‏Margin buffer below threshold.
- ‏Account state stale.
- ‏Unexpected restriction.
- ‏Buying power mismatch.
- ‏Broker/local position mismatch.
- ‏Settlement mismatch.

---

# ‏138. Account Metrics מול Strategy Metrics

‏אל תערבב:

```text
SignalQuality
```

‏עם:

```text
AccountHealth
```

‏שניהם משפיעים על Trade, אבל מסיבות שונות.

---

# ‏139. RCA של Trade Rejected

‏שרשרת אפשרית:

```text
Signal valid?
→ Candidate valid?
→ Account eligible?
→ Funding valid?
→ Risk valid?
→ Order valid?
→ Broker accepted?
```

---

# ‏140. RCA של Forced Exit

```text
StrategyExit?
RiskExit?
MarginLiquidation?
BrokerAction?
CorporateAction?
ManualAction?
```

‏צריך להבחין ביניהם.

---

# ‏141. Manual Account Changes

‏Deposit, withdrawal, permission change או manual order צריכים להיכנס ל־audit trail אם הם משנים system state.

---

# ‏142. Deposits אינם תמיד מיד Available

‏Funding method יכול לכלול hold או restriction.

‏לכן:

```text
DepositRecorded != FundsImmediatelyUsable
```

---

# ‏143. Withdrawals משפיעים על Risk

‏Withdrawal יכול לשנות Margin cushion.

‏במערכת Live צריך להחליט האם בכלל מותר withdrawal בזמן strategy active — זו policy תפעולית, לא Signal logic.

---

# ‏144. External Transfers

‏Transfer of securities/cash יכול ליצור transient states.

‏בזמן כזה `NO NEW RISK` עשוי להיות policy סביר עד reconciliation.

---

# ‏145. Tax אינו Buying-Power Rule

‏Tax consequences ו־account mechanics הם נושאים שונים.

‏אין להסיק מהיכולת לבצע Trade מה תהיה חבות המס עליו.

‏נושא המס יקבל טיפול נפרד בשלב הבא של המודעות ל־fees/tax/accounting.

---

# ‏146. Regulation אינו Strategy Edge

‏אסור לבנות Thesis שמסתמך על “מצאתי דרך לעקוף restriction”.

‏Restriction הוא constraint שצריך לכבד.

---

# ‏147. Compliance by Design

‏הגישה הנכונה:

```text
Rules are inputs to the system
not obstacles to bypass
```

---

# ‏148. Eligibility Test Suite

‏בדיקות חשובות:

```text
Cash with settled funds
Cash with unsettled proceeds
Margin with ample buffer
Margin near maintenance threshold
Restricted account
Permission missing
Stale account state
Pending order consumes buying power
Partial fill changes margin
Reconnect changes account generation
```

---

# ‏149. Property Test

‏Invariant:

```text
If HardAccountVeto == true
then NewExposureCreated == false
```

---

# ‏150. Another Invariant

```text
UnknownAccountState
→ no new risk
```

‏עד reconciliation.

---

# ‏151. Replay

‏Replay מלא צריך לכלול Account events אם רוצים לשחזר למה Candidate לא הפך ל־Trade.

---

# ‏152. Account Events

```text
CashSettled
BuyingPowerChanged
MarginRequirementChanged
RestrictionAdded
RestrictionRemoved
PermissionChanged
DepositHoldChanged
BrokerLiquidation
```

---

# ‏153. Account Event Time

‏כמו Market Data, גם כאן צריך:

```text
BrokerEventTime
ReceiveTime
ProcessTime
```

‏כאשר זמינים.

---

# ‏154. Why This Matters for Seconds

‏אם Eligibility refresh לוקח יותר זמן מה־Signal Half-Life, Account plumbing עצמו יכול להפוך bottleneck.

---

# ‏155. Precomputed Headroom

‏אפשר לחשב continuously risk/account headroom במקום להתחיל חישוב כבד רק אחרי Signal.

---

# ‏156. אבל Final Check נשאר

‏Precompute אינו מחליף revalidation לפני order.

---

# ‏157. Capital Reservation TTL

‏Reservation פנימית צריכה TTL/reconciliation כדי שלא תישאר “תקועה” אחרי failure.

---

# ‏158. Orphan Reservation

‏אם process נפל אחרי reserve ולפני submit, recovery צריך לדעת לשחרר reservation שלא הפך לחשיפה אמיתית.

---

# ‏159. Reservation מול Broker Truth

‏אחרי restart:

```text
LocalReservation
```

‏אינה אמת עד שבודקים Orders/Positions אצל Broker.

---

# ‏160. Account Domain צריך להיות Provider-Agnostic

‏אל תקרא ל־domain field בשם UI ספציפי אם המשמעות העסקית כללית.

‏לדוגמה:

```text
AvailableCapitalForNewRisk
```

‏עדיף לפעמים על העתקת label Broker לא ברור.

---

# ‏161. Adapter Mapping חייב להיות מתועד

```text
BrokerField
→ InternalMeaning
→ Unit
→ Segment
→ Freshness
```

---

# ‏162. Unit Bugs מסוכנים

‏Currency, percentage ו־absolute dollars יכולים להתבלבל.

‏Margin 25% אינו `25` ולא `0.25` בלי contract מפורש.

---

# ‏163. Currency Conversion Bugs

‏Risk engine חייב לדעת באיזה מטבע כל field נמדד.

---

# ‏164. Rounding ו־Minimums

‏Broker יכול ליישם rounding/minimums שונים.

‏אל תבנה local eligibility בדיוק על boundary.

---

# ‏165. Safety Buffer גם נגד Model Error

‏Margin buffer אינו רק נגד market move.

‏הוא גם נגד:

- ‏stale account state.
- ‏rounding.
- ‏fee changes.
- ‏unexpected partial fills.
- ‏house requirement changes.

---

# ‏166. Regulatory State כ־Production Dependency

‏כמו Market Data provider, גם Rule/Account semantics הם dependency חיצוני.

‏צריך owner, verification cadence ו־runbook.

---

# ‏167. `Known Rule` מול `Assumed Rule`

‏ב־diagnostics כדאי להבדיל:

```text
VERIFIED
INFERRED
UNKNOWN
```

---

# ‏168. Never Promote on `UNKNOWN`

‏Account/Regulatory unknown מהותי הוא blocker לפני Live risk.

---

# ‏169. `Rule Drift`

‏אם Broker משנה policy בלי שינוי code אצלנו, behavior יכול להשתנות.

‏לכן Rejection/BuyingPower/Margin metrics הם גם drift detectors.

---

# ‏170. Broker Transition ב־PDT Reform הוא דוגמה אמיתית ל־Rule Drift

‏ב־2026–2027 שני לקוחות יכולים לחוות התנהגות שונה לפי migration timing של ה־Broker.

‏מערכת קשיחה שמניחה כלל אחד לכל העולם תהיה שגויה.

---

# ‏171. Practitioner Secret — “Margin Account” הוא Capability Set, לא Boolean

‏שני Margin Accounts יכולים לקבל:

- ‏Permissions שונים.
- ‏House requirements שונים.
- ‏Borrow availability שונה.
- ‏Regulatory mode שונה בזמן transition.

---

# ‏172. Practitioner Secret — UI Labels אינם Domain Model

‏`Available to Trade`, ‏`Buying Power`, ‏`Cash`, ‏`Settled Cash` ו־`Available Funds` אינם מילים נרדפות.

---

# ‏173. Practitioner Secret — Settlement Bugs נראים כמו Strategy Bugs

‏אם מערכת “פתאום מפסיקה למצוא trades”, ייתכן שה־Strategy בסדר וה־capital פשוט locked/unsettled.

---

# ‏174. Practitioner Secret — Margin Bugs יכולים להיראות כמו Broker Bugs

‏Order reject יכול להיות תוצאה נכונה של changed account state, לא תקלה ב־API.

---

# ‏175. Practitioner Secret — Broker Documentation Drift הוא Risk אמיתי

‏אם שני דפי documentation סותרים זה את זה, זה לא פרט שולי.

‏זו סיבה לבצע verification מול source authoritative/current ולתעד מה אומת.

---

# ‏176. Practitioner Secret — Capital Efficiency צריך להימדד נטו

‏Margin שמאפשר יותר turnover אינו בהכרח משפר strategy אם הוא מגדיל:

```text
Risk
Costs
Forced-Liquidation Probability
Operational Complexity
```

---

# ‏177. Practitioner Secret — Account Constraints יכולים ליצור Selection Bias

‏אם Backtest מניח שכל Candidate ניתן למסחר אבל Live account מסנן רבים, distribution של trades משתנה.

---

# ‏178. Practitioner Secret — Eligibility הוא Feature של ה־Decision Process, לא Feature של המחיר

‏הוא לא מנבא שוק.

‏הוא קובע האם Prediction בכלל ניתן לפעולה.

---

# ‏179. Practitioner Secret — לא מספיק לדעת כמה כסף יש

‏צריך לדעת:

```text
What is settled?
What is reserved?
What is marginable?
What is withdrawable?
What is legally/permissibly usable?
What remains safe after entry?
```

---

# ‏180. Baseline לרובוט שלנו

‏למחקר והארכיטקטורה שלנו, baseline סביר הוא:

```text
1. Keep AccountType explicit.
2. Read account state continuously.
3. Separate settled cash from buying power.
4. Track positions + working orders + pending exposure.
5. Maintain AccountState freshness.
6. Resolve regulatory mode from broker truth.
7. Apply hard eligibility vetoes before execution.
8. Reserve capital atomically.
9. Revalidate immediately before submit.
10. Reconcile after reject/timeout/reconnect.
11. Fail closed for new exposure when account state is unknown.
12. Keep exits operational whenever possible.
13. Version rule assumptions.
14. Replay account constraints in realistic backtests.
15. Monitor account/rejection drift in production.
```

---

# ‏181. מה לא לעשות בגרסה הראשונה

‏לא להתחיל עם:

- ‏Broker-specific spaghetti rules בכל Strategy.
- ‏Assumption ש־Cash = Settled Cash.
- ‏Assumption ש־Margin = unlimited buying power.
- ‏Hard-coded `$25K PDT` כעובדה אוניברסלית ב־2026.
- ‏Blind retry אחרי Order rejection/timeout.
- ‏Trading כאשר Account State stale.
- ‏Using maximum broker leverage as strategy default.

---

# ‏182. Architecture Summary

```text
Market Data
→ Signal
→ Ranking
→ Veto Engine
→ AccountEligibilityEngine
→ RiskEngine
→ ExecutionFeasibility
→ PreSubmitRevalidation
→ Broker
→ Reconciliation
```

---

# ‏183. `NO TRADE` בגלל Account הוא Outcome תקין

‏אם Candidate מצוין אבל אינו Account Eligible:

```text
NO TRADE
Reason = ACCOUNT_CONSTRAINT
```

‏זו אינה תקלה.

---

# ‏184. Definition of Done ל־Account Layer

‏לפני Live risk צריך להיות מסוגלים לענות בכל רגע:

1. ‏מה Account Type?
2. ‏איזו legal/broker entity מחזיקה את החשבון?
3. ‏אילו permissions פעילים?
4. ‏מה ה־Regulatory Mode הנוכחי?
5. ‏כמה Settled Cash קיים בכל Currency?
6. ‏מה Buying Power?
7. ‏מה Excess Liquidity?
8. ‏מה Initial/Maintenance Margin?
9. ‏אילו Orders תופסים resources?
10. ‏מה Pending Exposure?
11. ‏האם קיימת restriction?
12. ‏בן כמה ה־Account Snapshot?
13. ‏מה יקרה אם Order יתקבל חלקית?
14. ‏מה יקרה אם Broker ינתק?
15. ‏מה יקרה אם requirement יחמיר?
16. ‏איך עושים Reconciliation?
17. ‏מה חוסם New Entry?
18. ‏מה עדיין מאפשר Exit?

---

# ‏185. Snapshot רגולטורי עדכני — `Verified 2026-10-26`

‏להלן Facts שאומתו בזמן כתיבת הפרק:

- ‏רוב עסקאות ניירות הערך בארה״ב עברו ל־`T+1` ב־28 במאי 2024.
- ‏FINRA אימצה Intraday Margin framework חדש שנכנס לתוקף ב־4 ביוני 2026.
- ‏קיימת תקופת מעבר שמאפשרת ל־Broker-ים להמשיך זמנית במסגרת PDT הישנה עד 20 באוקטובר 2027.
- ‏במסגרת החדשה ה־PDT trade-count designation ורף ה־$25,000 הקשור אליו מוחלפים במודל Intraday Margin מבוסס Exposure.
- ‏במהלך תקופת המעבר אין להניח מה חל על חשבון מסוים בלי לאמת את ה־Broker/account state.
- ‏FINRA מציינת מינימום equity של $2,000 לשימוש ב־margin leverage, כאשר Broker רשאי להחמיר.
- ‏Cash Accounts אינם משתמשים ב־margin borrowing רגיל, ו־Short stock אינו baseline permission שלהם.

‏הפרטים האלה הם `Time-Sensitive Facts` וצריכים אימות מחדש לפני שימוש מעשי.

---

# ‏186. מקורות רשמיים שנבדקו עבור Snapshot 2026-10-26

- ‏FINRA — `Understanding the New Intraday Margin Requirements`.
- ‏FINRA — `Frequent Intraday Trading: Understanding the Basics`.
- ‏SEC — `Shortening the Securities Transaction Settlement Cycle`.
- ‏SEC — `Trading in Cash Accounts` / Regulation T investor material.
- ‏Interactive Brokers — current account configuration/account documentation, כולל הציון שבתקופת phase-out חלק מהחשבונות עדיין כפופים ל־PDT הישן.

‏כאשר המקורות אינם עקביים, יש לאמת את ה־rule בפועל מול המקור הרשמי העדכני וה־Broker/account הספציפי.

---

# ‏187. סיכום

‏Account Mechanics ו־Regulations אינם “בירוקרטיה מסביב לאלגוריתם”.

‏הם חלק מה־Execution Contract.

‏השרשרת האמיתית היא:

```text
Prediction
→ Decision
→ Account Eligibility
→ Regulatory Eligibility
→ Funding
→ Risk
→ Execution
→ Settlement
→ Reconciliation
```

‏והעיקרון שצריך לזכור:

> ‏**עסקה שאינה ממומנת, מורשית, מסולקת כנדרש או עומדת בדרישות Margin אינה Candidate חלש — היא אינה Candidate לביצוע בכלל.**
