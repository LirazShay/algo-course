# ‏שלב 55 — `Security and Operations Best Practices`: להגן על מערכת שמסוגלת להזיז כסף אמיתי

> ‏מטרת הפרק: לבנות שכבת Security ו־Operations מקצועית סביב מערכת Algo שמסוגלת להתחבר ל־Market Data, לברוקר ולחשבון אמיתי — כך ש־credentials, הרשאות, deployments, production access, audit trail, incident response ו־operational controls יהיו חלק אינטגרלי ממערכת הסיכון.
>
> ‏העיקרון המרכזי: **Security ו־Operations אינם שכבת IT שמגיעה אחרי ה־Strategy. כל טעות בהרשאה, secret, deployment, environment או operator action יכולה להפוך ישירות ל־Order או Exposure שלא התכוונו אליהם.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה Security כאן שונה מאפליקציה רגילה

‏באפליקציה רגילה תקלה יכולה לגרום ל־downtime.

‏במערכת מסחר תקלה יכולה לגרום גם ל־financial side effect.

```text
Bad credential handling
→ unauthorized access
→ unintended order capability
→ real exposure
```

‏לכן אנחנו מתייחסים ל־Security כאל חלק מ־Risk Management.

---

# ‏2. ארבעת הנכסים שעליהם מגנים

1. ‏`Credentials` ו־Tokens.
2. ‏יכולת לבצע Orders.
3. ‏Market/Account Data.
4. ‏Integrity של Strategy, Config ו־Deployment.

‏הנכס הכי מסוכן אינו בהכרח “מידע סודי”.

‏לעיתים הוא פשוט:

```text
permission_to_trade = true
```

---

# ‏3. Threat Model פשוט לפני הכול

‏אנחנו שואלים:

- ‏מי יכול לקרוא secrets?
- ‏מי יכול לשנות config?
- ‏מי יכול להפעיל Live mode?
- ‏מי יכול לשנות Risk Limits?
- ‏מי יכול לפרוס production build?
- ‏מי יכול לשלוח Order ידנית?
- ‏מה קורה אם machine נגנב/נפרץ?
- ‏מה קורה אם token דולף?
- ‏מה קורה אם CI/CD נפגע?
- ‏מה קורה אם Dependency זדונית נכנסת?

---

# ‏4. Principle of Least Privilege

‏לכל identity נותנים רק את מה שהוא חייב.

```text
read market data
!=
read account
!=
place orders
!=
withdraw funds
```

‏אם provider/broker מאפשר הפרדת הרשאות — משתמשים בה.

---

# ‏5. Trading Permission אינה הרשאה כללית

‏גם בתוך execution צריך לצמצם scope:

- ‏חשבון מסוים.
- ‏סוגי נכסים מותרים.
- ‏סביבות מותרות.
- ‏פעולות מותרות.
- ‏Position/Notional caps.

---

# ‏6. Human Account מול Machine Identity

‏עדיף להפריד בין:

```text
human_operator
machine_service
ci_pipeline
monitoring_reader
```

‏כך לא כל credential מאפשר כל פעולה.

---

# ‏7. Secrets אינם Config רגיל

‏Secret לא נכנס ל־source code.

‏Secret לא נכנס ל־README.

‏Secret לא נכנס ל־sample config אמיתי.

‏Secret לא נכנס ל־logs.

‏Secret לא נכנס ל־exception message.

---

# ‏8. Environment Variables — שימושי אבל לא קסם

‏`Environment Variable` עדיף על hard-code, אבל עדיין יכול להיחשף דרך:

- ‏process inspection.
- ‏diagnostics.
- ‏crash dump.
- ‏misconfigured CI.
- ‏shell history.

‏לכן Secret Store ייעודי עדיף כאשר התשתית מאפשרת.

---

# ‏9. Secret Store

‏אפשרויות כלליות:

- ‏OS credential store.
- ‏Cloud secret manager.
- ‏Vault-like system.
- ‏encrypted local store.

‏הבחירה פחות חשובה מהעקרונות:

```text
encrypted_at_rest
restricted_access
audited_access
rotation_supported
```

---

# ‏10. Secret Rotation

‏כל credential צריך להיות ניתן להחלפה בלי redesign.

‏נרצה לדעת:

- ‏מי תלוי בו.
- ‏איך מחליפים.
- ‏איך מבטלים את הישן.
- ‏איך בודקים שהחדש עובד.
- ‏איך חוזרים אחורה אם נדרש.

---

# ‏11. Secret Expiry

‏Credential ללא expiry יכול להישאר תקף שנים אחרי ששכחנו ממנו.

‏כאשר אפשר:

```text
shorter_lifetime > permanent_secret
```

---

# ‏12. Credential Inventory

‏צריך רשימה ברורה של:

- ‏איזה credentials קיימים.
- ‏לאיזה service הם שייכים.
- ‏מה ההרשאה שלהם.
- ‏מתי נוצרו.
- ‏מתי rotated.
- ‏מי owner.

---

# ‏13. Never Log Secrets

‏Redaction צריכה להיות אוטומטית.

‏לא לסמוך על מפתח שיזכור בכל log statement.

---

# ‏14. Sensitive Fields Registry

‏רשימת שדות שמסומנים רגישים:

```text
apiKey
accessToken
refreshToken
sessionToken
accountIdentifier
```

‏ולא מודפסים raw.

---

# ‏15. Masking אינו Encryption

‏להדפיס:

```text
ABCD****WXYZ
```

‏יכול להיות שימושי לזיהוי לוגי, אבל אינו הופך את הנתון לבטוח לאחסון בכל מקום.

---

# ‏16. Separate Environments

‏לפחות:

```text
DEV
TEST
PAPER
LIVE
```

‏לא רק config flag אחד.

---

# ‏17. Different Credentials Per Environment

‏אסור ש־test accidentally יוכל להשתמש ב־live token.

‏עדיף ש־credentials עצמם יהיו בלתי תואמים בין הסביבות.

---

# ‏18. Different Endpoints Per Environment

‏הפרדה צריכה להיות ברמת:

- ‏endpoint.
- ‏credential.
- ‏account.
- ‏data store.
- ‏telemetry labels.

---

# ‏19. Live Mode חייב להיות מפורש

‏ברירת המחדל:

```text
live_trading = false
```

‏מעבר ל־Live לא קורה במקרה.

---

# ‏20. Live Mode אינו משתנה Boolean בלבד

‏עדיף מספר תנאים:

```text
correct environment
+ correct credentials
+ risk engine healthy
+ broker reconciled
+ data fresh
+ explicit live authorization
```

---

# ‏21. Startup Safety Gate

‏לפני כניסה ל־Live:

- ‏Broker connected.
- ‏Account verified.
- ‏Positions reconciled.
- ‏Open orders reconciled.
- ‏Market data healthy.
- ‏Clock healthy.
- ‏Risk limits loaded.
- ‏Kill switch operational.

---

# ‏22. Fail Closed for New Risk

‏אם security/ops state אינו ברור:

```text
block_new_entries
```

‏זה לא בהכרח אומר שאסור לבצע Exit.

---

# ‏23. Exit Capability נשמרת

‏Security design גרוע עלול לחסום דווקא את היכולת לצאת מפוזיציה.

‏לכן צריך לחשוב בנפרד על:

```text
permission_to_enter
permission_to_reduce_risk
permission_to_flatten
```

---

# ‏24. Break Glass Access

‏במצב חירום יכול להיות צורך ב־manual intervention.

‏גישה כזו צריכה להיות:

- ‏מוגבלת.
- ‏מתועדת.
- ‏מאובטחת.
- ‏עם audit.
- ‏נבדקת מראש.

---

# ‏25. Operator Identity

‏כל פעולה אנושית משמעותית צריכה להיות קשורה ל־identity.

```text
who
what
when
from_where
why
```

---

# ‏26. Audit Trail

‏Audit event צריך להיות append-oriented.

‏לא “log שאפשר לערוך בשקט”.

---

# ‏27. מה נכנס ל־Audit

- ‏Login/Logout.
- ‏Permission change.
- ‏Secret rotation.
- ‏Deployment.
- ‏Config change.
- ‏Risk limit change.
- ‏Live enable/disable.
- ‏Manual order.
- ‏Kill switch.
- ‏Reconciliation override.

---

# ‏28. Config הוא קוד מסוכן

‏שינוי config יכול לשנות התנהגות יותר משינוי source.

‏לדוגמה:

```text
max_position
max_orders
entry_threshold
live_mode
broker_account
```

‏לכן config צריך versioning ו־review.

---

# ‏29. Configuration Provenance

‏כל Decision Record צריך לדעת:

```text
config_version
strategy_version
risk_version
feature_version
execution_version
```

---

# ‏30. No Silent Config Mutation

‏שינוי config בזמן runtime צריך להיות:

- ‏מוגדר.
- ‏מאומת.
- ‏מתועד.
- ‏versioned.
- ‏נראה ל־telemetry.

---

# ‏31. Immutable Deploy Artifact

‏ה־artifact שעבר בדיקות צריך להיות אותו artifact שעולה ל־production.

‏לא rebuild שונה בסביבה אחרת.

---

# ‏32. Build Provenance

‏נשמור:

```text
commit_sha
build_id
artifact_hash
build_time
dependency_lock_version
```

---

# ‏33. Dependency Locking

‏Production build לא צריך לקבל dependency שונה רק כי package חדש פורסם באותו יום.

---

# ‏34. Dependency Updates

‏מעדכנים dependencies באופן יזום ומבוקר.

‏לא:

```text
update everything automatically in production
```

---

# ‏35. Supply Chain Risk

‏Package קטן יכול לקבל הרשאות רחבות דרך process המסחר.

‏לכן dependency הוא חלק מה־threat model.

---

# ‏36. Minimize Dependency Surface

‏פחות dependencies קריטיים = פחות נקודות אמון.

---

# ‏37. Signed/Trusted Artifacts

‏כאשר התשתית מאפשרת, מאמתים provenance/integrity של artifacts לפני deploy.

---

# ‏38. Production Deploy אינו Copy-Paste

‏Deployment צריך להיות repeatable ומוגדר.

```text
build
→ verify
→ deploy
→ health check
→ reconcile
→ enable trading
```

---

# ‏39. Trading Disabled During Unsafe Transition

‏בזמן deploy/restart:

‏לא מניחים שהמערכת מוכנה ל־entry רק כי process עלה.

---

# ‏40. Readiness != Liveness

```text
process_running = true
```

‏אינו אומר:

```text
safe_to_trade = true
```

---

# ‏41. Readiness Conditions

‏למשל:

- ‏Feed synchronized.
- ‏Broker state reconciled.
- ‏No unknown orders.
- ‏Clock sane.
- ‏Risk engine ready.
- ‏Config verified.

---

# ‏42. Canary Deployment

‏כאשר מתאים, שינוי גדול נבדק תחילה ב־scope קטן.

‏במערכת מסחר scope יכול להיות:

- ‏Shadow only.
- ‏Paper.
- ‏Subset of symbols.
- ‏Tiny controlled live exposure.

---

# ‏43. Blue/Green אינו פשוט במסחר

‏אסור ששתי גרסאות יחשבו שתיהן שהן owner של אותו execution scope.

---

# ‏44. Single Active Trader

‏במערכת אישית פשוטה:

```text
one active execution owner
```

‏הוא invariant חשוב.

---

# ‏45. Fencing Token

‏אם קיימת אפשרות ל־split brain, צריך מנגנון שמונע instance ישן להמשיך לפעול לאחר שהוחלף.

---

# ‏46. Leader Election אינו מספיק לבדו

‏גם אחרי leader election יכול להיות process ישן שלא יודע שכבר איבד ownership.

‏לכן צריך fencing ברמת side effects כאשר אפשר.

---

# ‏47. Deployment Rollback

‏Rollback הוא feature שחייבים לבדוק.

‏אבל במערכת עם state, rollback של code אינו בהכרח rollback של:

- ‏Orders.
- ‏Positions.
- ‏Schema.
- ‏Config.

---

# ‏48. Forward Recovery

‏לעיתים הדרך הבטוחה אינה rollback אלא תיקון קדימה תוך שמירת state נכון.

---

# ‏49. Database Migration Discipline

‏Schema changes צריכים להיות backward/forward aware כאשר יש deployment rolling או restart באמצע.

---

# ‏50. Backup אינו Recovery

‏Backup שלא נבדק restore שלו אינו תוכנית recovery.

---

# ‏51. Recovery Point Objective

‏כמה state אנחנו יכולים להרשות לעצמנו לאבד?

‏ב־Execution Journal התשובה יכולה להיות קרובה מאוד ל־zero.

---

# ‏52. Recovery Time Objective

‏כמה זמן אפשר להיות offline לפני שהסיכון גדל מהותית?

‏זה שונה בין:

- ‏Flat system.
- ‏Working orders.
- ‏Open position.

---

# ‏53. Operational Priority

‏בעת Incident:

```text
protect capital
→ establish truth
→ stop new risk
→ recover safely
→ restore alpha generation
```

---

# ‏54. Incident Severity

‏כדאי להגדיר רמות.

‏למשל:

```text
SEV1 = uncontrolled financial exposure
SEV2 = trading disabled / state uncertain
SEV3 = degraded data / performance
SEV4 = non-critical tooling issue
```

---

# ‏55. Incident Runbook

‏Runbook קצר עדיף על ידע בראש.

‏הוא צריך לענות:

- ‏מה בודקים ראשון.
- ‏איך עוצרים new risk.
- ‏איך מזהים broker truth.
- ‏איך מבטלים orders.
- ‏איך מאמתים flatness.
- ‏מתי מותר resume.

---

# ‏56. First Action During Uncertainty

‏לא “ללחוץ retry”.

‏קודם להבין האם retry יכול להכפיל side effect.

---

# ‏57. Establish External Truth

‏ב־execution incident:

```text
broker orders
broker fills
broker positions
```

‏הם מקור truth חשוב יותר מה־local cache.

---

# ‏58. Manual Intervention Must Be Logged

‏אם operator ביטל Order או סגר Position ידנית — המערכת חייבת לדעת.

---

# ‏59. Reconciliation After Manual Action

‏Manual action בלי reconciliation יוצר local state שקרי.

---

# ‏60. Resume Is a Controlled Operation

‏לא חוזרים מ־incident ישר ל־SCANNING.

‏צריך להוכיח:

```text
state_known
orders_known
positions_known
data_healthy
risk_healthy
```

---

# ‏61. Resume Checklist

- ‏No unknown working orders.
- ‏Positions match broker.
- ‏Risk counters restored.
- ‏Feed fresh.
- ‏Clock synchronized.
- ‏Correct build/config loaded.
- ‏Kill switch responsive.

---

# ‏62. Latching Safety States

‏אירוע חמור לא צריך להיעלם אוטומטית כי metric חזר לנורמה לשנייה אחת.

---

# ‏63. Manual Acknowledgement

‏אירועים מסוימים צריכים acknowledgement מפורש לפני resume.

---

# ‏64. Change Management

‏כל שינוי production משמעותי צריך לדעת:

- ‏מה משתנה.
- ‏למה.
- ‏מה הסיכון.
- ‏איך מאמתים.
- ‏איך משחזרים.

---

# ‏65. One Major Change at a Time

‏במערכת רגישה עדיף לא לשנות יחד:

```text
strategy
+ broker adapter
+ data provider
+ deployment model
```

‏ואז לגלות שאין דרך לדעת מה נשבר.

---

# ‏66. Maintenance Windows

‏שינוי תשתיתי כדאי לבצע בזמן שבו operational risk נמוך יותר כאשר זה אפשרי.

---

# ‏67. Freeze During Critical Market Periods

‏לא כדאי לפרוס שינוי לא הכרחי בדיוק כאשר השוק נמצא במצב שבו recovery קשה יותר.

---

# ‏68. Production Access

‏גישה ל־production צריכה להיות מוגבלת הרבה יותר מגישה ל־repository.

---

# ‏69. No Shared Accounts

‏Shared login הורס auditability.

---

# ‏70. Strong Authentication

‏לחשבונות רגישים משתמשים באמצעי authentication חזקים הנתמכים על ידי הספק.

---

# ‏71. Session Hygiene

‏Session ארוך מאוד הוא credential בפני עצמו.

‏צריך להבין expiry, revoke ו־logout semantics.

---

# ‏72. Local Machine Security

‏אם הרובוט רץ על workstation:

- ‏OS updates.
- ‏disk encryption.
- ‏screen lock.
- ‏restricted users.
- ‏minimal software.
- ‏backup.

---

# ‏73. Dedicated Runtime

‏ככל שהמערכת קריטית יותר, עדיף runtime ייעודי על מחשב שמשמש גם לכל דבר אחר.

---

# ‏74. Browser Automation Risk

‏אם browser נמצא במסלול, צריך לקחת בחשבון:

- ‏extension risk.
- ‏session cookies.
- ‏browser updates.
- ‏unexpected dialogs.
- ‏DOM changes.
- ‏profile corruption.

---

# ‏75. Localhost Is Not Automatically Safe

‏Service מקומי עדיין צריך לחשוב על:

- ‏bind address.
- ‏authentication.
- ‏allowed origins.
- ‏unexpected local clients.

---

# ‏76. Bind Narrowly

‏אם service מיועד רק למחשב המקומי, אין סיבה לחשוף אותו לכל interface בלי צורך.

---

# ‏77. Network Exposure Inventory

‏צריך לדעת אילו ports/services פתוחים ולמה.

---

# ‏78. Firewall as Defense in Depth

‏Application auth ו־firewall משלימים זה את זה.

---

# ‏79. TLS

‏כאשר traffic עובר ברשת שאינה trusted local path, encryption in transit הוא baseline חשוב.

---

# ‏80. Certificate Validation

‏Encryption בלי validation נכון יכול לתת ביטחון שגוי.

---

# ‏81. Outbound Restrictions

‏Process מסחר אינו צריך בהכרח לדבר עם כל האינטרנט.

‏צמצום outbound destinations מפחית blast radius.

---

# ‏82. Dependency Network Calls

‏Library צד ג' לא צריכה לבצע network call מפתיע מתוך hot path בלי שנדע.

---

# ‏83. Telemetry Data Sensitivity

‏Metrics/Traces יכולים להכיל מידע רגיש גם אם אין בהם password.

---

# ‏84. Account Identifiers

‏אין צורך לפרסם אותם בכל dashboard אם surrogate ID מספיק.

---

# ‏85. PII/Data Minimization

‏שומרים רק מה שצריך לתפעול, מחקר ו־audit.

---

# ‏86. Log Retention

‏Retention צריך לאזן בין:

- ‏RCA.
- ‏auditability.
- ‏storage cost.
- ‏data sensitivity.

---

# ‏87. Immutable Incident Evidence

‏ב־incident חשוב לשמור snapshot של evidence לפני שמתחילים “לתקן” דברים.

---

# ‏88. Incident Packet

‏יכול לכלול:

```text
build/config versions
market data health
broker state
orders/fills/positions
timeline
alerts
operator actions
```

---

# ‏89. Timeline Is Critical

‏ב־RCA צריך timeline אחד שמחבר:

```text
market
system
broker
operator
```

---

# ‏90. Clock Health Is Security/Operations Too

‏Clock drift יכול לפגוע גם ב־auditability וגם בהחלטות.

---

# ‏91. Time Source Monitoring

‏מודדים offset/health של clock synchronization.

---

# ‏92. Audit Timestamp Semantics

‏מבדילים בין:

```text
event_time
receive_time
system_action_time
broker_ack_time
```

---

# ‏93. Alerting Security Events

‏התראות אפשריות:

- ‏Repeated auth failure.
- ‏Unexpected credential use.
- ‏Live enable מחוץ לחלון צפוי.
- ‏Risk limit changed.
- ‏Unknown deployment artifact.
- ‏Unexpected account ID.

---

# ‏94. Alert Fatigue

‏Security alert שאף אחד לא קורא אינו control.

---

# ‏95. Actionable Alert

‏Alert טוב אומר:

```text
what happened
why it matters
current risk
next safe action
```

---

# ‏96. Operational SLOs

‏לא רק uptime.

‏למשל:

- ‏Time to detect feed degradation.
- ‏Time to block entries.
- ‏Time to reconcile.
- ‏Time to flat.
- ‏Time to revoke credential.

---

# ‏97. Kill Switch Path Must Be Simple

‏Emergency path לא צריך להיות תלוי ב־20 services בריאים.

---

# ‏98. Kill Switch Authentication

‏מצד אחד צריך למנוע abuse.

‏מצד שני צריך לאפשר שימוש מהיר במצב אמיתי.

---

# ‏99. Manual Flatten Path

‏צריך להיות מוכר ומתורגל, לא משהו שמחפשים בזמן אירוע.

---

# ‏100. Drill

‏מתרגלים:

```text
broker disconnect
feed stale
wrong config
unknown order
credential revoke
restart with open position
```

---

# ‏101. Game Day

‏Fault injection תפעולי מתוכנן מאפשר לבדוק runbooks לפני incident אמיתי.

---

# ‏102. Credential Leak Drill

‏המטרה אינה לדמות תקיפה מורכבת.

‏המטרה היא לבדוק:

- ‏כמה מהר מזהים.
- ‏כמה מהר revoke.
- ‏איך מחליפים.
- ‏איך יודעים שלא נשאר secret ישן פעיל.

---

# ‏103. Deployment Failure Drill

‏בודקים מה קורה אם deployment נכשל אחרי שחלק מהמערכת כבר הוחלף.

---

# ‏104. Config Corruption Drill

‏בודקים שהמערכת מזהה config invalid במקום “לנחש defaults”.

---

# ‏105. Safe Defaults

‏Default צריך להיות שמרני.

```text
missing risk limit
→ fail
```

‏לא:

```text
missing risk limit
→ unlimited
```

---

# ‏106. Explicit Units

‏Config מסוכן במיוחד אם היחידות אינן ברורות.

```text
maxNotionalUsd
maxHoldMs
maxLossBps
```

‏עדיף על שמות עמומים.

---

# ‏107. Config Validation

‏בודקים:

- ‏range.
- ‏units.
- ‏relationships.
- ‏required fields.
- ‏environment constraints.

---

# ‏108. Config Cross-Checks

‏למשל:

```text
max_position <= account_cap
entry_enabled implies risk_engine_enabled
live_mode implies live_account_verified
```

---

# ‏109. Dangerous Combination Detection

‏שדות בודדים יכולים להיות תקינים אבל השילוב מסוכן.

---

# ‏110. Two-Step Activation for High-Risk Changes

‏שינוי משמעותי יכול לדרוש staging + explicit activation.

---

# ‏111. Approval Boundaries

‏במערכת אישית אין צוות שלם, אבל עדיין אפשר להפריד לוגית בין:

```text
edit
validate
activate
```

---

# ‏112. Production Diff

‏לפני deploy/activation מציגים בדיוק מה השתנה לעומת production.

---

# ‏113. Strategy Version Pinning

‏Production לא “תמיד latest”.

‏היא version מסוים שאושר.

---

# ‏114. Risk Version Pinning

‏Risk rules גם הן versioned artifact.

---

# ‏115. Feature Flags

‏Feature flag יכול לעזור rollout, אבל הוא גם config מסוכן.

---

# ‏116. Flag Cleanup

‏Flags ישנים יוצרים state space שלא נבדק.

---

# ‏117. Observability Access

‏Dashboards צריכים להיות readable גם כאשר execution service נכשל.

---

# ‏118. Control Plane Separation

‏כדאי להפריד רעיונית בין:

```text
trading_data_plane
safety_control_plane
```

---

# ‏119. Safety Plane Independence

‏אם scanner תקוע, kill switch עדיין צריך לעבוד.

---

# ‏120. Heartbeat

‏Heartbeat הוא אות שהמערכת חיה, לא הוכחה שהיא נכונה.

---

# ‏121. External Watchdog

‏Watchdog חיצוני יכול לזהות שהמערכת הראשית אינה מתקדמת.

---

# ‏122. Dead-Man Controls

‏במערכות מסוימות אפשר לחשוב על מצב שבו חוסר heartbeat חוסם new risk.

---

# ‏123. Stale Process Detection

‏Process שרץ אבל אינו מעבד events הוא failure.

---

# ‏124. Queue Growth as Operational Signal

‏Queue age יכול להזהיר לפני שהמערכת מתחילה לקבל decisions על מידע stale.

---

# ‏125. Disk Space

‏בעיה פשוטה כמו disk full יכולה להשבית logging, journal או persistence.

---

# ‏126. Memory Pressure

‏Memory pressure יכול להפוך ל־tail latency ואז ל־stale execution.

---

# ‏127. CPU Saturation

‏CPU 100% בזמן burst הוא גם operational risk.

---

# ‏128. Network Health

‏לא מספיק connected/disconnected.

‏נרצה גם:

- ‏RTT.
- ‏packet loss indicators.
- ‏reconnect frequency.
- ‏message lag.

---

# ‏129. Provider Health Matrix

‏לכל external dependency:

```text
CONNECTED
DEGRADED
STALE
DISCONNECTED
UNKNOWN
```

---

# ‏130. Dependency Blast Radius

‏צריך לדעת מה נפגע אם:

- ‏Market Data נופל.
- ‏Broker נופל.
- ‏Database נופל.
- ‏Telemetry נופל.

---

# ‏131. Graceful Degradation

‏לא כל dependency failure חייב להוריד הכול.

‏אבל new risk צריך להיחסם אם information required אינו אמין.

---

# ‏132. Monitoring Failure

‏אם monitoring עצמו נפל, זה אירוע שצריך להיות visible.

---

# ‏133. Backup Communication Path

‏Alerting קריטי לא צריך להסתמך רק על אותה מערכת שנפלה.

---

# ‏134. Operational Dashboard

‏מסך אחד צריך לענות מהר:

- ‏האם Live?
- ‏איזה account?
- ‏מה positions?
- ‏מה open orders?
- ‏האם data fresh?
- ‏האם broker healthy?
- ‏האם risk healthy?
- ‏איזה build/config?

---

# ‏135. Environment Banner

‏`LIVE` צריך להיות בולט מאוד.

‏לא מצב שמגלים לפי URL קטן.

---

# ‏136. Account Fingerprint

‏UI צריך להציג account identity בצורה שמונעת בלבול בין Paper/Live.

---

# ‏137. Read-Only Dashboard by Default

‏Observation ו־control לא חייבים להיות באותה הרשאה.

---

# ‏138. Dangerous Buttons

‏פעולות כמו:

```text
ENABLE LIVE
FLATTEN
CANCEL ALL
```

‏צריכות להיות ברורות ולא נגישות בטעות.

---

# ‏139. Confirmation Design

‏Confirmation טוב אינו popup שאנשים לוחצים עליו אוטומטית.

‏הוא מראה action, scope ו־impact.

---

# ‏140. Automation vs Confirmation

‏ב־hot path אלגוריתמי לא מכניסים confirmation אנושי.

‏ה־control צריך להיות policy/risk gate.

---

# ‏141. Manual Trading Separation

‏אם מבצעים לפעמים Orders ידניים, המערכת חייבת לזהות שהם קיימים ולא להניח שכל position נוצרה על ידה.

---

# ‏142. Orphan State

‏Order או Position שאין להם ownership ברור מסומנים במפורש.

---

# ‏143. Operator Override

‏Override צריך להיות exception, לא workflow רגיל.

---

# ‏144. Override Reason

‏שומרים reason code/text לצורכי RCA.

---

# ‏145. Temporary Overrides Expire

‏Override זמני לא צריך להישאר פעיל לנצח במקרה ששכחנו.

---

# ‏146. Risk Limit Escalation

‏הגדלת limits צריכה להיות שינוי משמעותי ומבוקר.

---

# ‏147. Capital Increase Is Operational Change

‏גם אם Strategy זהה, העלאת Capital משנה blast radius.

---

# ‏148. Small-Live Ramp

‏מעבר ל־Live צריך להיות הדרגתי:

```text
shadow
→ paper
→ tiny live
→ calibrated live
```

---

# ‏149. Deployment vs Capital Ramp

‏לא כדאי להעלות גם version חדש וגם size משמעותית באותו רגע.

---

# ‏150. Post-Deploy Observation Window

‏אחרי deploy חשוב לראות behavior לפני שמרחיבים scope.

---

# ‏151. Success Criteria Before Deploy

‏מגדירים מראש מה נחשב healthy.

---

# ‏152. Rollback Criteria Before Deploy

‏מגדירים מראש מתי עוצרים/חוזרים.

---

# ‏153. Security Patch Priority

‏Patch security יכול להיות דחוף, אבל עדיין נדרש controlled validation כדי לא ליצור trading failure.

---

# ‏154. Vulnerability Inventory

‏יודעים אילו components חיצוניים קיימים ואילו versions רצים.

---

# ‏155. SBOM Concept

‏`Software Bill of Materials` עוזר לדעת מהר אם dependency פגיעה קיימת אצלנו.

---

# ‏156. Secret Scanning

‏Repository/CI יכולים לבדוק accidental secret commits.

---

# ‏157. Pre-Commit Guardrails

‏אפשר לחסום patterns מסוכנים לפני שהם מגיעים ל־main.

---

# ‏158. CI Permissions

‏CI job שבודק unit tests לא חייב credential של Live Broker.

---

# ‏159. Production Secrets Never in Pull Request CI

‏Untrusted code path לא מקבל secrets רגישים.

---

# ‏160. CI Artifact Trust

‏Production artifact מגיע מ־trusted pipeline בלבד.

---

# ‏161. Branch Protection Concept

‏שינויים ל־production path צריכים לעבור checks מוגדרים ולא bypass שגרתי.

---

# ‏162. Emergency Change

‏גם hotfix דחוף מתועד ומקבל post-incident review.

---

# ‏163. Operational Debt

‏Temporary manual workaround שנשאר חודשים הופך ל־risk.

---

# ‏164. Runbook Drift

‏Runbook שלא נבדק מול הגרסה הנוכחית יכול להיות מסוכן.

---

# ‏165. Runbook Testing

‏כל incident drill הוא גם test של documentation.

---

# ‏166. Ownership

‏לכל control/alert/runbook צריך owner, גם אם זה אותו אדם במערכת אישית.

---

# ‏167. On-Call Thinking למערכת אישית

‏גם אם אין צוות, צריך להגדיר:

```text
what happens if this breaks while I am away?
```

---

# ‏168. Unattended Trading Policy

‏צריך להחליט במפורש האם המערכת רשאית ליצור new risk כשאין operator זמין.

---

# ‏169. Auto-Halt Conditions

‏אם אין oversight בזמן שבו הוא נדרש — אפשר לחסום entries.

---

# ‏170. Daily Startup Checklist

‏לפני session:

- ‏Correct build.
- ‏Correct account.
- ‏Credentials valid.
- ‏Data subscriptions healthy.
- ‏Positions reconciled.
- ‏Risk limits correct.
- ‏Kill switch tested logically.

---

# ‏171. End-of-Day Checklist

- ‏Expected positions.
- ‏Unexpected open orders.
- ‏Execution mismatches.
- ‏Security/ops alerts.
- ‏Config changes.
- ‏Incidents/near misses.

---

# ‏172. Near Miss

‏אירוע שכמעט יצר exposure שגוי חשוב כמעט כמו incident אמיתי.

---

# ‏173. Near-Miss-to-Control

‏כל near miss שואל:

```text
what control should make this impossible next time?
```

---

# ‏174. RCA בלי אשמה

‏המטרה היא למצוא failure in system design, לא להסתפק ב־“operator טעה”.

---

# ‏175. Five Layers of RCA

1. ‏Trigger.
2. ‏Detection gap.
3. ‏Containment gap.
4. ‏Recovery gap.
5. ‏Prevention gap.

---

# ‏176. Security Incident vs Trading Incident

‏לעיתים הם אותו דבר.

‏Credential leak יכול להפוך ל־execution incident.

‏Execution anomaly יכול להצביע על credential misuse.

---

# ‏177. Evidence Preservation

‏לפני ניקוי incident שומרים מספיק evidence ל־RCA.

---

# ‏178. Do Not Destroy Audit Trail During Recovery

‏Recovery scripts צריכים לשמור traceability.

---

# ‏179. Red-Team Thinking בלי מורכבות מיותרת

‏אנחנו לא צריכים לבנות security lab.

‏מספיק לשאול באופן שיטתי:

```text
What if this identity is stolen?
What if this config is wrong?
What if this deployment is duplicated?
What if this instance is stale?
What if this operator is confused?
```

---

# ‏180. Operational Invariants

‏דוגמאות:

```text
LIVE implies verified live account
new entry implies risk engine healthy
new entry implies market data fresh
one execution owner per account scope
unknown broker state implies no new risk
all privileged changes are audited
```

---

# ‏181. Security Invariants as Tests

‏ה־invariants האלה צריכים בדיקות אוטומטיות ככל האפשר.

---

# ‏182. Production Access Tests

‏בודקים ש־unauthorized identity באמת לא יכולה לבצע פעולה.

---

# ‏183. Secret Redaction Tests

‏Test שולח fake secret דרך logging paths ומוודא שאינו נחשף.

---

# ‏184. Environment Isolation Tests

‏Test מוודא ש־TEST build אינו יכול לפנות בטעות ל־LIVE endpoint/config.

---

# ‏185. Wrong Account Test

‏Startup צריך להיכשל אם account fingerprint אינו תואם ל־expected environment.

---

# ‏186. Deployment Provenance Test

‏Production process מדווח איזה build/config הוא באמת מריץ.

---

# ‏187. Duplicate Instance Test

‏בודקים ששני instances לא יכולים לשלוט באותו execution scope בלי fencing.

---

# ‏188. Revoked Credential Test

‏בודקים behavior בטוח כאשר credential מפסיק לעבוד באמצע session.

---

# ‏189. Audit Completeness Test

‏פעולות privileged חייבות לייצר audit event.

---

# ‏190. Failover Security

‏Fallback provider/broker path צריך אותה רמת controls כמו primary.

---

# ‏191. Shadow Systems Are Still Sensitive

‏Shadow system שאין לו permission לבצע Orders עדיין יכול להכיל market/account data ו־credentials אחרים.

---

# ‏192. Paper Environment Is Not Throwaway

‏Paper יכול לשמש proving ground ל־operational controls.

---

# ‏193. Secrets in Local Development

‏Local dev צריך להשתמש credentials מוגבלים ככל האפשר.

---

# ‏194. Production Data in Dev

‏אם לא צריך, לא מעתיקים sensitive production datasets ל־dev.

---

# ‏195. Sanitized Replay

‏Replay datasets יכולים להסתיר identifiers שאינם דרושים למחקר.

---

# ‏196. Security vs Latency

‏לא מבטלים authentication או validation סתם כדי לחסוך latency זניח.

---

# ‏197. Hot Path Security

‏controls ב־hot path צריכים להיות מהירים ודטרמיניסטיים.

‏למשל precomputed authorization state במקום remote auth call לכל order.

---

# ‏198. Security Cache Expiry

‏אם authorization state cached, צריך לדעת מתי revoke נכנס לתוקף.

---

# ‏199. Broker Session State

‏Session authenticated אינו בהכרח session authorized לכל פעולה.

‏שומרים distinction בין:

```text
connected
authenticated
authorized
trading_ready
```

---

# ‏200. Account Capability Discovery

‏לא מניחים ש־account תומך בכל order type/permission רק כי API endpoint קיים.

---

# ‏201. Safety Before Convenience

‏Auto-login/auto-reconnect נוחים, אבל חייבים לשמר controls ולא לעקוף operator intent.

---

# ‏202. Reconnect Is a Security Boundary Too

‏אחרי reconnect מאמתים מחדש:

- ‏identity.
- ‏account.
- ‏permissions.
- ‏open orders.
- ‏positions.

---

# ‏203. Session Hijack Thinking

‏אם session token דולף, blast radius צריך להיות מוגבל ככל האפשר.

---

# ‏204. Remote Administration

‏אם בעתיד נרצה לשלוט מרחוק, זו capability שדורשת design נפרד ולא “לפתוח port”.

---

# ‏205. No Public Exposure by Accident

‏כל service פנימי צריך explicit decision לפני exposure חיצוני.

---

# ‏206. Security Budget

‏כמו latency budget, גם security צריך budget של מורכבות.

‏לא בונים enterprise labyrinth למערכת אישית אם control פשוט מספיק.

---

# ‏207. KISS Security

‏Baseline חזק יכול להיות:

```text
minimal services
minimal credentials
minimal network exposure
strict env separation
versioned config
strong startup gates
clear kill switch
full audit
```

---

# ‏208. Complexity Is a Risk

‏Security system מורכב מדי עלול ליצור bypasses ו־operator mistakes.

---

# ‏209. Practitioner Secret — Most Incidents Are Boundary Failures

‏לאו דווקא “האקר מתוחכם”.

‏לעיתים קרובות:

- ‏wrong account.
- ‏wrong environment.
- ‏stale process.
- ‏bad config.
- ‏duplicate instance.
- ‏expired token.
- ‏manual action שלא סונכרנה.

---

# ‏210. Practitioner Secret — Identity Confusion Is Dangerous

‏אם UI/operator אינו יודע בוודאות באיזה account/environment הוא נמצא, זה failure design.

---

# ‏211. Practitioner Secret — Recovery Paths Need More Testing Than Happy Path

‏כי הם מופעלים בדיוק כאשר pressure גבוה ו־state לא נקי.

---

# ‏212. Practitioner Secret — Audit Is a Debugging Superpower

‏Audit טוב אינו רק compliance.

‏הוא מאפשר לדעת מי שינה מה בדיוק לפני incident.

---

# ‏213. Practitioner Secret — Operational Simplicity Preserves Edge

‏מערכת עם 20 moving parts יכולה להיות “מתקדמת” אבל פחות אמינה, איטית וקשה לשחזור.

---

# ‏214. Practitioner Secret — False Safety Is Worse Than Visible Failure

‏עדיף state:

```text
UNKNOWN / BLOCKED
```

‏מאשר dashboard ירוק שמסתיר שהמערכת לא באמת יודעת מה מצב הברוקר.

---

# ‏215. Practitioner Secret — Security Controls Must Respect Trading Priorities

‏במצב emergency:

```text
reduce risk
```

‏יכול להיות חשוב יותר מ־normal workflow.

‏אבל bypass כזה צריך להיות מוגדר מראש ולא מאולתר.

---

# ‏216. Practitioner Secret — Every Convenience Feature Expands Attack/Failure Surface

‏Auto-restart, remote control, browser bridge, plugins, dynamic config — כולם שימושיים, אבל כל אחד מוסיף boundary שצריך להבין.

---

# ‏217. Practitioner Secret — Rotate Before Emergency

‏תהליך rotation שלא נוסה קודם נוטה להיכשל בדיוק כשצריך אותו.

---

# ‏218. Practitioner Secret — Test the Restore, Not the Backup

‏Backup נמדד לפי היכולת לשחזר state אמין.

---

# ‏219. Practitioner Secret — Production Truth Must Be Visible

‏Operator צריך לראות מהר:

```text
actual build
actual config
actual account
actual positions
actual orders
actual connectivity
```

---

# ‏220. Practitioner Secret — “Works on My Machine” Is Not an Operational Proof

‏Production conditions כוללים:

- ‏credentials שונים.
- ‏network שונה.
- ‏clock שונה.
- ‏load שונה.
- ‏data subscriptions שונות.

---

# ‏221. התאמה לרובוט שלנו

‏הרובוט שלנו מכוון ל־millisecond-to-seconds momentum.

‏לכן security control לא יכול להכניס remote network round-trip מיותר לכל candidate.

‏אבל גם לא נבטל controls מהותיים בגלל כמה milliseconds.

---

# ‏222. Hot-Path Controls אצלנו

‏לפני Entry:

```text
LiveAuthorized
RiskHealthy
DataFresh
BrokerReady
AccountVerified
NoSafetyLatch
```

‏הכול צריך להיות זמין locally/statefully ומהר.

---

# ‏223. Slow-Path Controls אצלנו

‏מחוץ ל־hot path:

- ‏secret rotation.
- ‏deployment verification.
- ‏dependency scanning.
- ‏backups.
- ‏audit review.
- ‏incident drills.

---

# ‏224. Browser/Localhost Architecture אצלנו

‏אם נשתמש ב־browser collector או local bridge:

- ‏bind רק למה שנדרש.
- ‏לא לחשוף public network בלי design מפורש.
- ‏לא לשמור broker secrets בקוד browser אם לא חייבים.
- ‏להפריד data collection מ־execution permissions.

---

# ‏225. Separation of Market Data and Execution Helps Security

‏`MarketDataProvider` לא צריך לקבל execution credential.

‏`ExecutionBroker` לא צריך בהכרח לדעת את כל research data.

---

# ‏226. Execution Host

‏ככל שהמערכת מתבגרת, execution component צריך להיות קטן, ברור ובעל מעט dependencies.

---

# ‏227. Research Host vs Live Host

‏Research code שמריץ notebooks/experiments לא חייב לרוץ באותו process בעל הרשאת מסחר.

---

# ‏228. No Dynamic Research Code in Live Path

‏Production strategy version צריכה להיות pinned ומאומתת.

---

# ‏229. Live Config Minimum

‏Production config צריך להכיל רק מה שנדרש למסחר, לא מאות experimental toggles.

---

# ‏230. Deployment Gate לרובוט שלנו

```text
CI green
→ replay green
→ safety tests green
→ config diff reviewed
→ deploy trading disabled
→ reconcile
→ readiness green
→ explicit enable
```

---

# ‏231. Operational Metrics לרובוט שלנו

- ‏Current mode.
- ‏Current account fingerprint.
- ‏Build/config version.
- ‏Open positions/orders.
- ‏Pending exposure.
- ‏Data freshness.
- ‏Broker state.
- ‏Queue age.
- ‏Kill-switch state.
- ‏Last successful reconciliation.

---

# ‏232. Security Metrics לרובוט שלנו

- ‏Auth failures.
- ‏Credential age.
- ‏Unauthorized action rejects.
- ‏Unexpected environment/account mismatch.
- ‏Privilege/config changes.
- ‏Secret redaction failures.

---

# ‏233. Daily Automated Self-Check

‏לפני מסחר אפשר להריץ health proof אוטומטי.

```text
identity
account
data
broker
risk
state
build
config
```

---

# ‏234. Pre-Trade Security Readiness

‏אם אחד מהדברים הקריטיים אינו `KNOWN_GOOD`, new entry לא יוצא.

---

# ‏235. Exit Readiness

‏במקביל, שומרים יכולת reduce-risk כאשר אפשר גם אם entry path חסום.

---

# ‏236. `NO TRADE` Security Reasons

‏Reason codes אפשריים:

```text
SEC_ENV_MISMATCH
SEC_ACCOUNT_MISMATCH
SEC_AUTH_DEGRADED
SEC_BUILD_UNVERIFIED
SEC_CONFIG_UNVERIFIED
SEC_SAFETY_LATCHED
SEC_EXEC_OWNER_UNKNOWN
```

---

# ‏237. Operational RCA Codes

```text
OPS_DEPLOY_DRIFT
OPS_DUPLICATE_INSTANCE
OPS_RECONCILIATION_FAILED
OPS_STALE_PROCESS
OPS_DISK_PRESSURE
OPS_CLOCK_DRIFT
OPS_NETWORK_DEGRADED
OPS_MANUAL_OVERRIDE
```

---

# ‏238. Incident Data Model

‏כל incident שומר:

```text
IncidentId
StartedAt
DetectedAt
ContainedAt
RecoveredAt
Severity
Trigger
ExposureAtRisk
BuildVersion
ConfigVersion
Actions
RootCauses
PreventiveControls
```

---

# ‏239. Security Event Model

```text
SecurityEventId
Actor
Action
Resource
Environment
Result
Timestamp
Source
CorrelationId
```

---

# ‏240. Correlation Across Systems

‏אותו `CorrelationId` יכול לחבר:

```text
operator action
→ config change
→ strategy decision
→ order intent
→ broker order
```

---

# ‏241. Tests שחייבים להיות לנו

- ‏Wrong environment blocked.
- ‏Wrong account blocked.
- ‏Missing secret fails closed.
- ‏Expired/revoked credential safe behavior.
- ‏Duplicate trader instance blocked.
- ‏Unauthorized config change rejected.
- ‏Audit event emitted.
- ‏Secrets not logged.
- ‏Restart reconciles before entry.
- ‏Kill switch works during degraded dependencies.

---

# ‏242. Fault Injection שחייבים לעשות

- ‏Broker auth expires.
- ‏Feed healthy אבל broker down.
- ‏Broker healthy אבל feed stale.
- ‏Config malformed.
- ‏Disk nearly full.
- ‏Clock offset grows.
- ‏Process restarts עם open position.
- ‏Second instance starts accidentally.

---

# ‏243. Acceptance Scenario — Safe Startup

```text
Given correct build/config/account
And no open unknown state
And fresh market data
And broker reconciled
When system starts
Then trading remains disabled until readiness is proven
And only then can explicit live enable succeed
```

---

# ‏244. Acceptance Scenario — Wrong Account

```text
Given LIVE environment expects account A
When broker session reports account B
Then new entries are blocked
And alert is raised
And no automatic fallback chooses B
```

---

# ‏245. Acceptance Scenario — Credential Expired Mid-Position

```text
Given an open position
When broker credential becomes invalid
Then system blocks new entries
Marks execution capability degraded
Raises high-priority alert
And begins controlled recovery/re-authentication without assuming flatness
```

---

# ‏246. Acceptance Scenario — Duplicate Instance

```text
Given instance A owns execution scope
When instance B starts
Then B cannot place orders
Until ownership transfer is explicitly proven
```

---

# ‏247. Acceptance Scenario — Manual Broker Action

```text
Given operator changes position outside the robot
When reconciliation detects mismatch
Then local state is corrected from broker truth
And trading does not resume until invariants hold
```

---

# ‏248. What We Do Not Need Initially

‏למערכת אישית אין צורך להתחיל עם:

- ‏ארכיטקטורת IAM ענקית.
- ‏עשרות microservices.
- ‏SIEM enterprise מורכב.
- ‏zero-trust platform מלא.

‏אם control פשוט, ברור ונבדק פותר את הבעיה — זה עדיף.

---

# ‏249. מה כן חובה כבר מהתחלה

1. ‏No secrets in code/logs.
2. ‏Paper/Live separation חזקה.
3. ‏Account verification.
4. ‏Fail-closed new entries.
5. ‏Risk/kill controls.
6. ‏Broker reconciliation.
7. ‏Versioned build/config.
8. ‏Audit trail.
9. ‏Safe restart.
10. ‏Clear incident procedure.

---

# ‏250. Baseline Architecture

```text
[Market Data]
     ↓
[Scanner]
     ↓
[Risk + Security Readiness Gate]
     ↓
[Execution Engine]
     ↓
[Broker]

       ↑
[Safety Control Plane]
       ↑
[Operator / Audit / Monitoring]
```

---

# ‏251. Baseline Security State

```text
SecurityReadiness
{
  environmentVerified,
  accountVerified,
  credentialsHealthy,
  buildVerified,
  configVerified,
  executionOwnershipVerified,
  safetyControlsHealthy
}
```

---

# ‏252. Baseline Operational State

```text
OperationalReadiness
{
  marketDataHealthy,
  brokerHealthy,
  reconciliationComplete,
  persistenceHealthy,
  clockHealthy,
  queuesHealthy,
  telemetryHealthy
}
```

---

# ‏253. Final Entry Gate

```text
CanEnter =
    StrategySaysTrade
 && RiskAllows
 && SecurityReadiness == GOOD
 && OperationalReadiness == GOOD
 && ExecutionState == KNOWN
```

---

# ‏254. Why This Matters for Millisecond-to-Seconds Momentum

‏ה־Edge שלנו קצר.

‏לכן אנחנו צריכים operations שלא מכניסים latency מיותר.

‏אבל edge קצר גם אומר שטעות state קטנה הופכת מהר מאוד ל־trade שגוי.

‏לכן המטרה היא:

```text
simple
local
prevalidated
observable
fail-safe
```

---

# ‏255. שאלות שחייבים לדעת לענות עליהן לפני Live

1. ‏איפה secrets נשמרים?
2. ‏איך מבטלים credential שנחשף?
3. ‏איך יודעים איזה account מחובר?
4. ‏איך יודעים איזה build/config רץ?
5. ‏מי רשאי enable live?
6. ‏מה קורה אם שני instances עולים?
7. ‏מה קורה אם broker state לא ידוע?
8. ‏איך מבטלים כל Orders?
9. ‏איך מוודאים flatness?
10. ‏איך חוזרים לפעילות אחרי incident?

---

# ‏256. Checklist לפני כל Deployment משמעותי

- ‏CI ירוק.
- ‏Security/Safety tests ירוקים.
- ‏Artifact מזוהה.
- ‏Config diff ברור.
- ‏No secret exposure.
- ‏Rollback/forward recovery ידועים.
- ‏Trading disabled during transition.
- ‏Reconciliation after startup.
- ‏Readiness proof.
- ‏Post-deploy observation.

---

# ‏257. Checklist ל־Incident

1. ‏עצור creation של new risk.
2. ‏קבע broker truth.
3. ‏קבע orders/positions/pending exposure.
4. ‏הגן על ability to reduce risk.
5. ‏שמור evidence.
6. ‏תקן/reconcile.
7. ‏הוכח invariants.
8. ‏רק אז resume.
9. ‏בצע RCA.
10. ‏הוסף control/test שמונע recurrence.

---

# ‏258. מה לזכור בעל פה

1. ‏Secret אינו config רגיל.
2. ‏Paper ו־Live חייבים להיות קשים לבלבול.
3. ‏`Process Alive` אינו `Safe To Trade`.
4. ‏`Authenticated` אינו `Trading Ready`.
5. ‏Unknown external state חוסם new risk.
6. ‏Broker truth קודם ל־local belief.
7. ‏Config ו־deployments הם חלק מ־Risk.
8. ‏Recovery חייב להיות מתורגל.
9. ‏Audit עוזר גם ל־Security וגם ל־RCA.
10. ‏Operational simplicity היא יתרון מקצועי.

---

# ‏259. משפט המחויבות של הפרק

> ‏**מערכת מסחר מקצועית אינה בטוחה משום שאין בה bugs ידועים. היא בטוחה יותר משום שהיא מצמצמת הרשאות, מפרידה סביבות, מוכיחה state לפני יצירת risk, מתעדת כל שינוי משמעותי, ויודעת לעצור ולהתאושש כאשר משהו אינו ידוע.**

---

# ‏260. מעבר לשלב הבא

‏אחרי שהבנו איך להגן ולהפעיל את המערכת, נעבור לשלב 56 — אוסף שיטתי של טעויות נפוצות במסחר אלגוריתמי קצר, כדי להפוך את כל הידע עד כאן לרשימת anti-patterns מעשית שקל לזהות לפני שהם מגיעים ל־Live.
