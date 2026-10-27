# ‏00C — Canonical Glossary: מילון Advanced Orders למתחיל

> ‏מטרת הפרק: לתת מקום אחד שבו אפשר לעצור על מונח מקצועי, להבין קודם **מה הוא אומר בעולם האמיתי**, ורק אחר כך לראות את ההגדרה הקנונית שבה הקורס והמנוע משתמשים.
>
> ‏זהו Glossary קצר־יחסית. ההסבר המלא וההשוואות נשארים בפרקי המשפחות. כאשר יש סתירה, `00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md` קובע את שכבת ה־taxonomy וה־contracts המאוחרים קובעים את ה־lifecycle/safety.

---

## ‏00C.1 איך להשתמש במילון

‏לכל מונח נשמור את הסדר:

```text
במילים פשוטות
→ המונח המקצועי
→ מה הוא לא
→ לאן ממשיכים בקורס
```

‏המטרה אינה לשנן את הרשימה מראש. חוזרים לכאן כאשר מונח עוצר את הקריאה.

---

# ‏A — שכבות ההחלטה והפקודה

## ‏`Trade Intent`

‏**במילים פשוטות:** מה אנחנו רוצים להשיג כלכלית — למשל להיכנס כל עוד ה־Signal תקפה, לצאת מהר, או להקטין Risk.

‏**קנוני:** שכבת Strategy/Purpose. היא אינה Order Type ואינה אומרת עדיין איך הברוקר יבצע.

‏**לא להתבלבל עם:** `Application Execution Mode` או `Behavior Candidate`.

‏**המשך:** `00A`, `10A`.

## ‏`Application Execution Mode`

‏**במילים פשוטות:** איזה אופי ביצוע אנחנו רוצים — פסיבי, מחפש שיפור מחיר, midpoint, מנוהל בידי Broker, או אגרסיבי אבל מוגבל במחיר.

‏**קנוני:** אחת מן ה־modes כגון `PASSIVE`, ‏`PRICE_IMPROVING`, ‏`MIDPOINT_SEEKING`, ‏`BROKER_MANAGED`, ‏`AGGRESSIVE_CAPPED`, וכן Modes של Exit.

‏**לא להתבלבל עם:** `LMT`, ‏`IOC`, ‏`SMART` או `Adaptive`.

‏**המשך:** `00A`, `09B`, `10B`, `10C`.

## ‏`Behavior Candidate`

‏**במילים פשוטות:** דרך ביצוע קונקרטית שהמנוע יכול להשוות מול דרכים אחרות.

‏**דוגמאות:** `PASSIVE_JOIN`, ‏`MIDPRICE`, ‏`SNAP_MIDPOINT`, ‏`MARKETABLE_LIMIT_IOC`.

‏**קנוני:** Candidate עדיין אינה בהכרח Broker Order אחת; היא צריכה לעבור materialization ו־Capability checks.

‏**המשך:** `09B`, `10B`.

## ‏`Broker Order Primitive`

‏**במילים פשוטות:** הוראת הבסיס שה־Broker/API מקבלים, למשל Market, Limit, Stop או Stop Limit.

‏**קנוני:** primitive היא שכבה אחרת מ־Mode, TIF, Route או Broker Algo.

‏**המשך:** `00A`, `01`, `02`.

## ‏`Materialization`

‏**במילים פשוטות:** להפוך החלטה מופשטת כמו “בצע אגרסיבי אבל אל תעבור מחיר מסוים” לשדות Broker ממשיים.

‏**קנוני:** המעבר מ־Mode/Candidate אל primitive, ‏TIF, attributes, routing, algo ו־parameters.

‏**לא להתבלבל עם:** בחירת ה־winner. Materialization מתרגמת החלטה; היא אינה אמורה לשנות אותה.

‏**המשך:** `09B`.

## ‏`Concrete Order Plan`

‏**במילים פשוטות:** התכנית הסופית לפני Adapter/API — quantity, גבולות, primitive, ‏TIF, route, algo ו־capability evidence.

‏**קנוני:** הגבול שבו ה־Decision Engine כבר הכריעה, וה־Adapter רשאי רק לתרגם payload בלי לשנות semantics.

‏**המשך:** `09B`.

---

# ‏B — מחיר, זמן ו־Fill

## ‏`Economic Price Boundary`

‏**במילים פשוטות:** המחיר הגרוע ביותר שאנחנו עדיין מוכנים לקבל מבחינה כלכלית.

‏**קנוני:** boundary כלכלית של המנוע. `broker_limit_price` הוא שדה טכני שנגזר ממנה, אך אינו בהכרח אותו concept.

‏**המשך:** `00A`, `02`, `10A`.

## ‏`Marketable Limit`

‏**במילים פשוטות:** Limit שהמחיר שלה מאפשר לבצע מיד מול liquidity זמינה, אבל עדיין יש לה גבול מחיר.

‏**קנוני:** לרוב `Limit` primitive במצב marketable, לא primitive חדשה בפני עצמה.

‏**המשך:** `02`, `02B`.

## ‏`TIF — Time in Force`

‏**במילים פשוטות:** כמה זמן ומה תנאי החיים שה־Broker נותן ל־Order.

‏**דוגמאות:** `DAY`, ‏`GTC`, ‏`GTD`, ‏`IOC`.

‏**לא להתבלבל עם:** כמה זמן ה־Signal שלנו תקפה.

‏**המשך:** `03`.

## ‏`signal_ttl`

‏**במילים פשוטות:** כמה זמן הסיבה העסקית/Signal עדיין שווה משהו.

‏**קנוני:** clock של ה־Intent, לא של ה־Broker Order.

‏**המשך:** `00A`, `10A`.

## ‏`application_order_ttl`

‏**במילים פשוטות:** כמה זמן המנוע שלנו מוכן להשאיר ניסיון execution מסוים חי.

‏**חשוב:** כשהוא פג, Order מרוחקת אינה נעלמת מעצמה; צריך Cancel/Reconciliation לפי ה־state.

‏**המשך:** `00A`, `08B`, `09C`.

## ‏`working_order_age`

‏**במילים פשוטות:** כמה זמן Order כבר חיה/עובדת בפועל.

‏**שימוש:** Queue, staleness ו־decision telemetry.

‏**המשך:** `00A`, `08A`, `10G`.

## ‏`Fill`

‏**במילים פשוטות:** כמות שבוצעה בפועל.

‏**קנוני:** execution משנה Position Truth; היא אינה רק שינוי ב־Order status.

‏**המשך:** `01`, `02`, `09C`.

## ‏`Partial Fill`

‏**במילים פשוטות:** רק חלק מן הכמות בוצע.

‏**קנוני:** Position השתנתה ולכן זו Decision State חדשה; אסור להמשיך אוטומטית כאילו לא קרה דבר.

‏**המשך:** `08`, `09C`, `10E`.

## ‏`NO_FILL`

‏**במילים פשוטות:** הניסיון הסתיים בלי ביצוע מן ה־Order attempt הזה.

‏**קנוני:** outcome, לא authorization אוטומטי לרדוף אחרי המחיר או להרחיב גבולות.

‏**המשך:** `09C`, `10G`.

## ‏`REJECT`

‏**במילים פשוטות:** ה־Broker/route לא קיבלו את ה־Order כפי שנשלחה.

‏**קנוני:** צריך classification של capability/parameter/permission/risk וכו'; Reject אינה No-Fill.

‏**המשך:** `09C`.

---

# ‏C — Liquidity, Queue ו־Execution Quality

## ‏`Post Only`

‏**במילים פשוטות:** דרישה לא להפוך ל־liquidity taker בזמן ההגעה.

‏**קנוני:** constraint, לא “Limit טובה יותר”. יכולה לגרום reject/reprice/no-fill לפי route semantics.

‏**המשך:** `04`, `04B`, `10H`.

## ‏`Hidden`

‏**במילים פשוטות:** להסתיר את הנוכחות/הכמות המוצגת.

‏**לא להתבלבל עם:** `Discretionary`, שמסתירה willingness במחיר ולא רק quantity/display.

‏**המשך:** `04`, `10I`.

## ‏`Reserve / Iceberg`

‏**במילים פשוטות:** להציג רק חלק מן הכמות הכוללת ולהחזיק remainder כ־reserve לפי semantics של המסלול.

‏**המשך:** `04`, `10I`.

## ‏`Discretionary`

‏**במילים פשוטות:** להציג מחיר אחד אבל להיות מוכנים לבצע בטווח נוסף שאינו מוצג.

‏**קנוני:** hidden executable willingness, לא hidden quantity.

‏**המשך:** `04A`, `04B`.

## ‏`Queue Position / Queue Value`

‏**במילים פשוטות:** המקום היחסי שלנו בתור של Orders שמחכות במחיר מסוים, והערך האפשרי של הזמן שכבר חיכינו.

‏**קנוני:** asset מותנה בלבד; Signal/Risk validity קודמים לה.

‏**המשך:** `08A`, `10G`.

## ‏`Adverse Selection`

‏**במילים פשוטות:** קיבלנו Fill דווקא ברגע שבו הצד השני היה שמח לבצע מולנו כי המחיר עומד לזוז נגדנו.

‏**קנוני:** צריך למדוד outcome אחרי ה־Fill, לא להניח ש־passive/price improvement בהכרח זולים.

‏**המשך:** `04B`, `10G`.

## ‏`Markout`

‏**במילים פשוטות:** איפה היה המחיר זמן קצר אחרי ה־Fill ביחס למחיר שבו ביצענו.

‏**שימוש:** מדד ל־execution quality/adverse selection בטווח שמתאים ל־signal horizon.

‏**לא להתבלבל עם:** PnL מלא של העסקה.

‏**המשך:** `10G`, `10H`.

---

# ‏D — Routing ו־Broker-managed behavior

## ‏`SMART Routing`

‏**במילים פשוטות:** לתת ל־Broker לבחור execution destination/path לפי מנגנון ה־routing שלו.

‏**קנוני:** Routing Policy, לא Order Type ולא Broker Algo.

‏**המשך:** `07`, `07A`.

## ‏`Direct Routing`

‏**במילים פשוטות:** לבחור destination מפורש במקום להעביר את בחירת ה־destination ל־SMART.

‏**קנוני:** route/destination יכול לשנות capabilities ו־semantics ולכן הוא חלק מ־Capability scope.

‏**המשך:** `07`, `07A`, `09B`.

## ‏`Broker Algo`

‏**במילים פשוטות:** אנחנו נותנים לברוקר גבולות ומטרה execution מסוימת והוא מנהל חלק מן הטקטיקה.

‏**דוגמאות בקורס:** `Adaptive`, ‏`MidPrice`.

‏**קנוני:** Broker יכול לייעל **איך** לבצע; המנוע שלנו עדיין מחזיק **האם**, lifetime, limits ו־risk.

‏**המשך:** `07`, `10H`.

---

# ‏E — Ownership, Residency ו־מי ממשיך לפעול

## ‏`implementation_owner`

‏**במילים פשוטות:** מי אחראי כרגע להעריך את הכלל שמזיז/מפעיל/מנהל את ה־Order — client, broker או venue.

‏**קנוני:** Behavior ownership הוא dimension נפרד מ־residency ומ־native semantics.

‏**המשך:** `00A`, `08B`.

## ‏`Client-Managed`

‏**במילים פשוטות:** התוכנה שלנו צריכה להמשיך לחשב/להחליט/לשלוח פעולות כדי שההתנהגות תמשיך.

‏**משמעות disconnect:** behavior מקומי עלול להפסיק; Orders שכבר נשלחו יכולות עדיין להישאר executable לפי ה־state שלהן.

‏**המשך:** `08B`, `08D`.

## ‏`Broker-Managed`

‏**במילים פשוטות:** Broker מנהל את behavior לאחר submit לפי הפרמטרים שקיבל.

‏**לא אומר:** שה־Broker יודע שה־Signal שלנו מתה או שה־Order בטוחה להשאיר ללא watchdog מקומי.

‏**המשך:** `07`, `08B`, `10H`.

## ‏`Broker-Resident`

‏**במילים פשוטות:** state/Order יכולה להמשיך להתקיים אצל Broker גם בלי process המקומי.

‏**קנוני:** residency בלבד. זה **לא** אומר שה־Venue מכיר את ה־semantics Native.

‏**המשך:** `00A`, `08B`.

## ‏`Broker-Simulated`

‏**במילים פשוטות:** Broker מחקה/מיישם behavior שאינה בהכרח native ב־Venue.

‏**קנוני:** simulation semantics. Order יכולה להיות גם `Broker-Resident` וגם `Broker-Simulated` באותו זמן.

‏**המשך:** `00A`, `08B`.

## ‏`Venue-Native`

‏**במילים פשוטות:** ה־Venue עצמו מכיר ומיישם את semantics של ה־Order/feature.

‏**לא אומר:** שה־feature מתאים לחשבון/route שלנו או Production-enabled אצלנו.

‏**המשך:** `00A`, `09`.

## ‏`Survivability`

‏**במילים פשוטות:** מה עדיין יכול להישאר חי ולבצע אם client מתנתק/קורס/מופעל מחדש.

‏**קנוני:** נקבעת לפי implementation path בפועל, לא לפי שם ה־Order בלבד.

‏**המשך:** `08B`.

---

# ‏F — Lifecycle, Uncertainty ו־Recovery

## ‏`CANCEL_REQUESTED`

‏**במילים פשוטות:** ביקשנו לבטל; עדיין אין הוכחה שה־Order אינה יכולה לבצע.

‏**Invariant:**

```text
CANCEL_REQUESTED
!= CANCEL_CONFIRMED
!= TERMINAL_NON_EXECUTABLE
```

‏**המשך:** `08`, `10H`.

## ‏`UNKNOWN`

‏**במילים פשוטות:** אנחנו באמת לא יודעים אם side effect קרה — למשל האם Submit הגיע, האם Cancel הצליח או האם Fill קרתה בזמן disconnect.

‏**קנוני:** state מקצועית. לא מנחשים certainty כדי להמשיך מהר.

‏**המשך:** `08B`, `08D`, `09C`, `10I`.

## ‏`STALE`

‏**במילים פשוטות:** ההחלטה/Intent כבר אינה תקפה, אף שה־Order עצמה אולי עדיין Working ויכולה לבצע.

‏**קנוני:** stale intent יוצרת cancellation/reconciliation obligation; היא אינה terminal broker state.

‏**המשך:** `08B`, `09C`.

## ‏`Late Effect`

‏**במילים פשוטות:** אירוע מגיע אחרי שהמנוע כבר שינה הנחה או state — למשל late fill אחרי Cancel request.

‏**דוגמאות:** late fill, late trigger, late reprice, late child activation, late cancel ACK.

‏**המשך:** `08B`, `08C`.

## ‏`Reconciliation`

‏**במילים פשוטות:** להשוות מחדש את מה שהמערכת חושבת עם מה שה־Broker/executions/position מראים שבאמת קרה.

‏**קנוני:** acquisition מחדש של external truth לפני החזרת authority מלאה למנוע.

‏**המשך:** `08D`.

## ‏`READY`

‏**במילים פשוטות:** המערכת לא רק מחוברת — היא הוכיחה שהיא מבינה מספיק טוב Position, Orders, ownership, protection ו־unknowns כדי לפעול שוב.

‏**Invariant:**

```text
CONNECTED != READY
```

‏**המשך:** `08D`.

---

# ‏G — Protection ו־Composite structures

## ‏`Bracket`

‏**במילים פשוטות:** מבנה של Parent/Entry עם children כגון Profit Taker ו־Protective Stop.

‏**קנוני:** כמה Orders ויחסים ביניהן, לא transaction אטומית אחת.

‏**המשך:** `06`, `06C`, `08C`.

## ‏`OCA / OCO`

‏**במילים פשוטות:** קבוצת Orders שבה event באחת אמור להשפיע על האחרות, למשל לבטל sibling.

‏**קנוני:** coordination primitive, לא atomic guarantee. Member שאינה terminal עדיין יכולה להיות executable.

‏**המשך:** `06C`, `08C`, `10H`.

## ‏`Protection Coverage`

‏**במילים פשוטות:** כמה מן ה־Position האמיתית מכוסה כרגע ב־protection שאומת אצל Broker.

‏**קנוני:** נגזרת מ־`reconciled_position` ו־verified executable protective quantity, לא מן הכמות שתכננו.

‏**המשך:** `08C`.

## ‏`UNTRANSMITTED != PROTECTED`

‏**במילים פשוטות:** Order שקיימת רק מקומית/במצב שלא נשלח אינה הגנה אמיתית על Position.

‏**המשך:** `08C`.

---

# ‏H — Capability, Evidence ו־Rollout

## ‏`Capability`

‏**במילים פשוטות:** האם behavior מסוימת באמת נתמכת במסלול המדויק שלנו.

‏**קנוני:** combination-specific — product, contract, adapter, route/destination, session, account/legal entity ו־parameter combination.

‏**המשך:** `09`, `09B`.

## ‏`PRODUCTION_ENABLED`

‏**במילים פשוטות:** יש מספיק evidence במסלול המדויק כדי לאשר שימוש Production לפי policy שלנו.

‏**לא להתבלבל עם:** “כתוב בתיעוד שה־feature קיימת”.

‏**המשך:** `09`, `09B`.

## ‏`SHADOW_ONLY`

‏**במילים פשוטות:** מותר למנוע לחשב מה Candidate הייתה עושה ולמדוד אותה, אבל אסור לה לתת live side effect.

‏**קנוני:** Candidate rollout state, נפרד מ־Capability enablement.

‏**המשך:** `09B`.

## ‏`LIVE_ENABLED`

‏**במילים פשוטות:** policy של המנוע מאפשרת Candidate במסלול חי — אבל זה עדיין לא מספיק בלי Capability requirements ב־`PRODUCTION_ENABLED`.

‏**המשך:** `09B`.

---

# ‏I — Labels של Evidence

## ‏`FACT`

‏עובדה תיעודית/מאומתת ב־scope שמצוין.

## ‏`ENGINE RULE`

‏כלל שאנחנו בוחרים לאכוף במערכת, גם אם אינו Broker fact.

## ‏`RESEARCH HYPOTHESIS`

‏השערה שצריך למדוד לפני שמקבלים אותה כיתרון execution.

## ‏`ACCEPTANCE TEST REQUIRED`

‏פרט שאין לנעול כהנחה עד שבדקנו את behavior במסלול המדויק שלנו.

‏**המשך:** `00A`, `09`.

---

## ‏00C.2 מפת “אל תבלבל בין”

| ‏מונח א' | ‏מונח ב' | ‏ההבדל הקצר |
|---|---|---|
| `Execution Mode` | `Broker Primitive` | ‏Intent execution מול הוראת Broker בסיסית |
| `Behavior Candidate` | `Concrete Order Plan` | ‏חלופה להשוואה מול materialization סופי |
| `IOC` | `signal_ttl` | ‏Broker fill/time policy מול חיי Signal |
| `Post Only` | `Passive Join` | ‏constraint מול placement behavior |
| `SMART` | `Adaptive` | ‏Routing Policy מול Broker Algo |
| `Broker-Resident` | `Broker-Simulated` | ‏איפה state חי מול מי מסנתז semantics |
| `Broker-Managed` | `Broker-Resident` | ‏מי מנהל behavior מול איפה state נמצא |
| `Venue-Native` | `PRODUCTION_ENABLED` | ‏Venue semantics מול authorization אצלנו |
| `NO_FILL` | `REJECT` | ‏attempt תקף ללא Fill מול Order שלא התקבלה כמתוכנן |
| `Partial Fill` | `NO_FILL` | ‏Position השתנתה מול Position שלא השתנתה מן attempt |
| `Cancel Requested` | `Cancelled` | ‏בקשה מול evidence terminal |
| `Connected` | `READY` | ‏חיבור transport מול state בטוח לפעולה |
| `Execution Quality` | `Trade Outcome` | ‏איכות הביצוע מול מה שקרה כלכלית אחר כך |
| `Bracket` | atomic transaction | ‏מבנה מתואם של Orders מול guarantee שאינה קיימת |

---

## ‏00C.3 Cross-Reference rule

‏כאשר Chapter משתמש לראשונה במונח שקשה להבין בלי prerequisite, ה־final cleanup צריך להפנות אל אחד משלושת סוגי המקור:

```text
definition / vocabulary → 00A or 00C
family semantics        → Parts 2–7
lifecycle / safety      → Parts 8–9
engine decision         → Parts 10A–10I
```

‏המטרה היא למנוע מצב שבו המתחיל נשלח לחפש הסבר בתוך Review, Audit או מסמך עבודה שאינו חלק מן הקורס.

---

## ‏00C.4 Checkpoint

‏הפרק סוגר את:

```text
AO-GAP-P1-23 — Canonical Advanced Orders Glossary
```

‏והוא מניח vocabulary reference אחיד ל־`AO-GAP-P1-24 — Prerequisites / Cross-References`, שייסגר כאשר cross-references יוטמעו באופן עקבי בפרקי המקור.