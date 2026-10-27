# ‏Final Gap List — `Advanced Order Mastery`

> ‏מסמך זה מאחד את Reviews ‏1–7 לרשימת פערים קנונית אחת.
>
> ‏מטרתו אינה לבצע תיקונים, אלא לקבוע **מה בדיוק צריך לתקן, באיזו עדיפות, ובאיזה Repair Wave**.
>
> ‏Scope: Advanced Orders וה־Execution שלהן בלבד. אין כאן הרחבה מחדש לקורס הכללי על Market Data, Scanner, Auctions או Microstructure, אלא רק כאשר נושא כזה משנה ישירות את semantics, lifecycle, routing, protection או failure behavior של Order מתקדמת.

---

# ‏1. Executive Conclusion

‏הקורס כבר עמוק וחזק מקצועית. אין צורך ב־rewrite מאפס ואין צורך להפוך אותו לאנציקלופדיה של כל Order Type שקיימת בעולם.

‏הפערים שנותרו מתחלקים לחמישה סוגים:

```text
A. SOURCE / STRUCTURE
B. TAXONOMY / TERMINOLOGY
C. MISSING ADVANCED-ORDER CONCEPTS
D. DECISION / PRACTITIONER CLARITY
E. FAILURE / PRODUCTION COMPLETENESS
```

‏החלטת העבודה הסופית:

```text
split master into chapter files
→ repair chapter-by-chapter
→ cross-chapter consistency pass
→ canonical manifest
→ deterministic assembler
→ generated master document
→ compact print viewer
→ final print verification
```

‏הקובץ הגדול `ADVANCED-ORDER-MASTERY.md` צריך להפוך בסוף ל־**generated artifact**, לא למסמך שממשיכים לערוך ידנית.

---

# ‏2. Priority Definition

## ‏`P0 — Must Fix`

‏פער שפוגע במקור האמת, יוצר ambiguity מקצועית מהותית, חסר concept מרכזי בעולם Advanced Orders, או עלול לגרום ל־misunderstanding תפעולי/בטיחותי.

## ‏`P1 — Should Fix`

‏פער שאינו שובר את המודל, אך פוגע משמעותית ביכולת ללמוד, לבחור בין Orders או ליישם את הידע בצורה מקצועית.

## ‏`P2 — Polish / Compression`

‏פער של usability, חזרתיות, presentation, navigation או print efficiency.

---

# ‏3. `P0` Gaps

## ‏`AO-GAP-P0-01` — מקור האמת מפוצל בין master ישן לבין 10C/10D החדשים

**מקור:** Reviews 1, 4.

‏ה־master עדיין משקף סוף `10B`, בעוד `10C` ו־`10D` נמצאים בקבצים נפרדים.

**תיקון:** לפצל את כל הקורס לפרקים עצמאיים, להכניס את `10C`/`10D` כחלקים קנוניים, ולבנות `manifest` שמגדיר סדר חד־משמעי.

**Repair Wave:** `R1 — Source Split and Canonical Manifest`.

---

## ‏`AO-GAP-P0-02` — Front Matter / Roadmap אינם מקור אמת

**מקור:** Review 1.

‏ה־status וה־roadmap בראש ה־master מתארים workflow שכבר אינו נכון.

**תיקון:** להחליף אותם ב־final lifecycle map שמתאר את המבנה הסופי של הקורס, לא את היסטוריית העבודה.

**Repair Wave:** `R2 — Structure and Taxonomy`.

---

## ‏`AO-GAP-P0-03` — חסרה Taxonomy אחידה לשכבות Order שונות

**מקור:** Reviews 1, 4.

‏כיום concepts מסוגים שונים עלולים להיראות כאילו הם כולם "Order Types" מאותה שכבה.

‏נדרש להפריד במפורש בין:

```text
PRICE / EXECUTION PRIMITIVE
TIF / ORDER ATTRIBUTE
DISPLAY / LIQUIDITY ATTRIBUTE
TRIGGER POLICY
COMPOSITE ORDER STRUCTURE
ROUTING POLICY
BROKER ALGO
APPLICATION EXECUTION MODE
```

‏דוגמאות:

```text
Marketable Limit = behavior/state of a Limit
IOC = TIF
Post Only = passive constraint / attribute
Bracket = composite structure
SMART = routing policy
Adaptive = broker algo
PASSIVE_JOIN = application execution mode
```

**Repair Wave:** `R2`.

---

## ‏`AO-GAP-P0-04` — Vocabulary Drift ב־Execution Modes

**מקור:** Review 4.

‏קיימים שמות שונים לרעיונות דומים בין חלקים מוקדמים, 10B ו־10C:

```text
PASSIVE_PROBE
PASSIVE_JOIN
MARKETABLE_CAPPED
MARKETABLE_LIMIT_IOC
EXIT_FAST
FAST_EXIT
AGGRESSIVE_CAPPED_LIMIT
```

**תיקון:** להגדיר vocabulary קנוני אחד ולהשתמש בו בכל הקורס. שמות ישנים יופיעו רק אם נדרש alias זמני.

**Repair Wave:** `R2`.

---

## ‏`AO-GAP-P0-05` — חסרה `Sweep-to-Fill`

**מקור:** Review 2.

‏זהו החוסר המקצועי המשמעותי ביותר ברשימת ה־Advanced Orders הקיימת.

**תיקון:** פרק/section ייעודי עם:

```text
What
Why
When
Why Not
hard limit behavior
multi-venue implications
remainder behavior
telemetry requirements
```

‏וחובה להשוות ל־:

```text
Marketable Limit + IOC
plain SMART marketable Limit
Adaptive Urgent
```

**Repair Wave:** `R3 — Missing Advanced Orders`.

---

## ‏`AO-GAP-P0-06` — חסרה `Discretionary Order`

**מקור:** Review 2.

‏חסר distinction חשוב בין:

```text
hidden quantity
```

‏לבין:

```text
hidden execution discretion beyond displayed price
```

**תיקון:** להוסיף section ולמקם אותו לצד Hidden / Reserve / Pegged comparisons.

**Repair Wave:** `R3`.

---

## ‏`AO-GAP-P0-07` — חסרה Trigger Taxonomy מלאה

**מקור:** Review 2.

‏הקורס מכסה Stops לעומק, אבל צריך mental model מפורש שמפריד בין:

```text
WHEN does the order activate?
WHAT execution behavior happens after activation?
```

**תיקון:** להוסיף `MIT`, ‏`LIT` וההשוואה הישירה:

```text
Stop Market
Stop Limit
MIT
LIT
```

‏`Trailing MIT/LIT` יקבלו extension קצר בלבד.

**Repair Wave:** `R3`.

---

## ‏`AO-GAP-P0-08` — חסרה `Market-to-Limit` כ־execution transformation

**מקור:** Review 2.

‏הקורס צריך להראות במפורש את המעבר:

```text
market-style initial execution
→ partial fill
→ remaining quantity becomes Limit
```

‏עם דגש על stale remainder ו־application TTL.

**Repair Wave:** `R3`.

---

## ‏`AO-GAP-P0-09` — אין Label אחיד ל־Fact / Engine Rule / Hypothesis / Test Requirement

**מקור:** Reviews 1, 4.

‏צריך להבדיל חזותית ומושגית בין:

```text
FACT
ENGINE RULE
RESEARCH HYPOTHESIS
ACCEPTANCE TEST REQUIRED
```

‏זה קריטי במיוחד ב־IBKR capabilities, routing, partial-fill semantics ו־Bracket behavior.

**Repair Wave:** `R2`.

---

## ‏`AO-GAP-P0-10` — Bracket Partial-Fill Semantics חייבים להישאר uncertainty מפורשת

**מקור:** Reviews 4, 6.

‏אין "לפתור" סתירה בתיעוד על ידי בחירת גרסה אחת ללא בדיקה.

**תיקון:** לסמן את הנושא כ־`ACCEPTANCE TEST REQUIRED` ולרכז בדיוק מה צריך לבדוק לכל adapter / product / route.

**Repair Wave:** `R6 — Failure Contracts and Safety`.

---

## ‏`AO-GAP-P0-11` — OCA/OCO עלולות להיקרא בטעות כ־atomic

**מקור:** Reviews 4, 6.

**תיקון:** normalization גלובלי:

```text
coordination primitive
!=
transactional atomic guarantee
```

‏ולהפנות תמיד ל־reconciliation / late-fill handling.

**Repair Wave:** `R6`.

---

## ‏`AO-GAP-P0-12` — חסר Failure Contract לכל משפחת Advanced Order

**מקור:** Review 6.

‏לכל משפחה משמעותית צריך להיות block קבוע:

```text
Where does it live?
Who manages it after submit?
Can it execute after local intent expires?
What survives disconnect/restart?
What can arrive late?
What becomes UNKNOWN?
What must be reconciled?
When is control safely regained?
```

**Repair Wave:** `R6`.

---

## ‏`AO-GAP-P0-13` — חסרה Order Survivability Matrix

**מקור:** Review 6.

‏הקורס צריך להשוות survivability בין:

```text
local-only / untransmitted
broker-resident
venue-native
broker-simulated
client-managed
```

‏ובמיוחד עבור Bracket, Stops, Pegged, broker algos ו־Conditional structures.

**Repair Wave:** `R6`.

---

## ‏`AO-GAP-P0-14` — `UNTRANSMITTED != PROTECTED` צריך להיות invariant לימודי מפורש

**מקור:** Review 6.

‏Order שקיימת ב־TWS עם `Transmit=false` אינה שקולה להגנה שנשלחה לברוקר.

**Repair Wave:** `R6`.

---

## ‏`AO-GAP-P0-15` — Recovery צריך להיות Position-First ו־Ownership-First

**מקור:** Reviews 6, 7.

‏ב־Recovery לא מתחילים משאלה "איזה Signal היה לנו" אלא:

```text
What position exists?
What orders can still execute?
Who currently owns exit/protection?
What is unknown?
```

**Repair Wave:** `R6`.

---

## ‏`AO-GAP-P0-16` — `READY` חייב להיות earned state

**מקור:** Review 6.

‏Reconnect לבדו אינו מחזיר את המערכת ל־READY.

**תיקון:** להציג invariant:

```text
connected
!=
reconciled
!=
safe to trade
```

**Repair Wave:** `R6`.

---

## ‏`AO-GAP-P0-17` — חסרה הבחנה קנונית בין Capability Support לבין Production Enablement

**מקור:** Reviews 4, 5.

‏`supported=true` אינו מספיק.

‏הקורס כבר בנה model טוב בחלק 9, אבל צריך להחיל אותו בכל מקום:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

**Repair Wave:** `R5 — Engine Mapping and Capability Normalization`.

---

# ‏4. `P1` Gaps

## ‏`AO-GAP-P1-01` — `Why / When / Why Not` אינו אחיד בכל משפחה

**מקור:** Reviews 1, 3.

**תיקון:** לכל family משמעותית mini-card:

```text
What
Why
When
Why Not
Closest Alternative
Main Failure Mode
For Our Engine
```

**Repair Wave:** `R4 — Comparisons and Learning Clarity`.

---

## ‏`AO-GAP-P1-02` — חסרות השוואות ישירות בין alternatives קרובות

**מקור:** Review 3.

‏חובה להוסיף לפחות:

```text
Marketable Limit + IOC vs Sweep-to-Fill vs Adaptive Urgent
Relative vs MidPrice vs Pegged-to-Midpoint vs Snap Midpoint
Passive Limit vs Post Only
Hidden vs Reserve/Iceberg vs Discretionary
Stop vs Stop Limit vs MIT vs LIT
Trailing Stop vs Adjustable Stop vs local dynamic exit
Bracket vs OCA/OCO vs Conditional
Market-to-Limit vs Marketable Limit vs IOC
SMART vs Direct
Modify vs Cancel+New vs broker-managed repricing
```

**Repair Wave:** `R4`.

---

## ‏`AO-GAP-P1-03` — חסרות Decision Examples אחידות

**מקור:** Reviews 1, 3.

‏לא מספיק להראות syntax או מחיר לדוגמה.

‏לכל family מרכזית צריך לפחות:

```text
Decision Example
Counterexample
Why the alternative loses here
What would change the answer
```

**Repair Wave:** `R4`.

---

## ‏`AO-GAP-P1-04` — חסרות Decision Questions בסוף families

**מקור:** Review 1.

‏למשל:

```text
Do I need price protection or fill certainty?
Can the signal survive waiting?
Can partial fill still be useful?
Who owns repricing?
Can this order remain live after local process death?
```

**Repair Wave:** `R4`.

---

## ‏`AO-GAP-P1-05` — חסר Practitioner Insight format עקבי

**מקור:** Review 7.

‏צריך שכבת "תיקון אינטואיציות" ולא עוד הגדרות.

‏פורמט מוצע:

```text
COMMON WRONG CONCLUSION
WHAT ACTUALLY MATTERS
WHAT PROFESSIONALS MEASURE
ENGINE IMPLICATION
```

**Repair Wave:** `R7 — Practitioner and Final Learning Layer`.

---

## ‏`AO-GAP-P1-06` — `MidPrice` עלולה להיתפס כ־free half-spread improvement

**מקור:** Review 7.

**תיקון:** להסביר במפורש no-fill, adverse selection, routing path ו־time cost.

**Repair Wave:** `R7`.

---

## ‏`AO-GAP-P1-07` — `Post Only` עלולה להיתפס כ־Passive "טוב יותר"

**מקור:** Review 7.

**תיקון:** להדגיש שהיא constraint שמונעת taking, ולכן יכולה להגדיל missed opportunity.

**Repair Wave:** `R7`.

---

## ‏`AO-GAP-P1-08` — Broker Algo עלול להיתפס כמי שמבין את ה־Signal שלנו

**מקור:** Reviews 5, 7.

**תיקון:** להדגיש:

```text
broker execution objective
!=
private alpha objective
```

‏ולכן application TTL / cancellation / urgency עדיין בבעלות המערכת שלנו.

**Repair Wave:** `R7`.

---

## ‏`AO-GAP-P1-09` — Queue position עלולה לקבל חשיבות יתר

**מקור:** Review 7.

**תיקון:** להבהיר ש־queue value כפופה ל־signal freshness ול־adverse-selection risk.

**Repair Wave:** `R7`.

---

## ‏`AO-GAP-P1-10` — Entry ו־Exit דורשות comparison מפורש

**מקור:** Reviews 3, 5, 7.

‏אותה primitive אינה בהכרח מתאימה סימטרית לכניסה וליציאה.

**Repair Wave:** `R5`.

---

## ‏`AO-GAP-P1-11` — Exit Feasibility צריך להיות חלק גלוי מה־Entry Decision

**מקור:** Review 5.

**Repair Wave:** `R5`.

---

## ‏`AO-GAP-P1-12` — Partial Fill צריך להיות מוצג כ־new decision state

**מקור:** Reviews 5, 6, 7.

‏לא "חצי הצלחה" ולא רק status update.

**Repair Wave:** `R5`.

---

## ‏`AO-GAP-P1-13` — חסר Mapping מלא מ־Order primitive ל־ExecutionMode

**מקור:** Reviews 4, 5.

‏למשל:

```text
ExecutionMode
→ base order primitive
→ TIF / attributes
→ routing
→ broker algo
→ application TTL
→ failure destination
```

**Repair Wave:** `R5`.

---

## ‏`AO-GAP-P1-14` — חסרים Lifecycle states `DISABLED / SHADOW_ONLY / LIVE_ENABLED`

**מקור:** Review 5.

‏Candidate יכול להיות מובן מקצועית אך עדיין לא מאושר למסחר חי.

**Repair Wave:** `R5`.

---

## ‏`AO-GAP-P1-15` — Capability Matrix מסננת, לא בוחרת Winner

**מקור:** Review 5.

**Repair Wave:** `R5`.

---

## ‏`AO-GAP-P1-16` — חסר Failure Destination לכל Execution Mode

**מקור:** Review 5.

‏למשל:

```text
NO_FILL → redecide
REJECT → capability/error classification
PARTIAL → new position decision
UNKNOWN → freeze/reconcile
STALE → cancel/reconcile
```

**Repair Wave:** `R5`.

---

## ‏`AO-GAP-P1-17` — חסרה הבחנה בין Execution Quality לבין Trade Outcome

**מקור:** Reviews 5, 7.

‏Trade רווחי לא מוכיח Execution טובה; Fill יפה לא מוכיח Trade טובה.

**Repair Wave:** `R7`.

---

## ‏`AO-GAP-P1-18` — חסרים Reason Codes אחידים לבחירה ולפסילה

**מקור:** Review 5.

**Repair Wave:** `R5`.

---

## ‏`AO-GAP-P1-19` — חסרה Aggressive Multi-Venue Family Comparison

**מקור:** Review 2.

‏`Sweep-to-Fill` צריך להיכנס בתוך comparison family ולא לעמוד לבד.

**Repair Wave:** `R4`.

---

## ‏`AO-GAP-P1-20` — חסרה Visible Price vs Hidden Willingness Taxonomy

**מקור:** Review 2.

‏להבדיל בין:

```text
Hidden quantity
Reserve quantity
Discretionary executable range
Pegged displayed price movement
```

**Repair Wave:** `R3` + `R4`.

---

## ‏`AO-GAP-P1-21` — חסר Product-Specific / Out-of-Scope table

**מקור:** Review 2.

‏Orders שאינן baseline ל־US stocks לא צריכות לקבל פרקים ארוכים, אבל כדאי שיהיה ברור שהן מוכרות ולא נשכחו.

**Repair Wave:** `R3`.

---

## ‏`AO-GAP-P1-22` — חסר Problem → Candidate Index

**מקור:** Review 1.

‏לדוגמה:

```text
Need immediate attempt, no stale remainder
→ Marketable Limit + IOC

Need dynamic same-side repricing
→ Relative / Pegged-to-Primary

Need broker-resident protection
→ Stop / Bracket / Hybrid
```

**Repair Wave:** `R8 — Reference and Navigation Layer`.

---

## ‏`AO-GAP-P1-23` — חסר Glossary קנוני של Advanced Orders

**מקור:** Review 1.

**Repair Wave:** `R8`.

---

## ‏`AO-GAP-P1-24` — חסרות Prerequisites / Cross-References עקביות

**מקור:** Review 1.

**Repair Wave:** `R8`.

---

## ‏`AO-GAP-P1-25` — Native / Simulated / Resident / Client-Managed אינם מנורמלים מספיק

**מקור:** Reviews 4, 6.

‏צריך vocabulary אחיד:

```text
venue-native
broker-native / broker-resident
broker-simulated
client-managed
local-only / untransmitted
```

**Repair Wave:** `R2` + `R6`.

---

## ‏`AO-GAP-P1-26` — Late Effect Taxonomy חסרה

**מקור:** Review 6.

‏לא רק `Late Fill`, אלא גם:

```text
late trigger
late child activation
late reprice
late cancellation acknowledgement
late algo completion
```

**Repair Wave:** `R6`.

---

## ‏`AO-GAP-P1-27` — Manual Intervention צריכה לשנות Ownership

**מקור:** Review 6.

‏Manual action אינה רק log entry.

**Repair Wave:** `R6`.

---

## ‏`AO-GAP-P1-28` — Shutdown אינו `cancel everything`

**מקור:** Review 6.

‏Protective Orders עלולות להיות דווקא הדבר שאסור להסיר בעיוורון.

**Repair Wave:** `R6`.

---

## ‏`AO-GAP-P1-29` — Recovery לא מחייה Signal שפג

**מקור:** Review 6.

**Repair Wave:** `R6`.

---

# ‏5. `P2` Gaps

## ‏`AO-GAP-P2-01` — יותר מדי סעיפים קטנים ללא Chapter Map

**מקור:** Review 1.

**Repair Wave:** `R2`.

---

## ‏`AO-GAP-P2-02` — חזרות של מושגי TTL / hard cap / partial fill / broker truth

**מקור:** Reviews 1, 4.

**תיקון:** Define Once → Cross-reference → Extend Only When Needed.

**Repair Wave:** `R8`.

---

## ‏`AO-GAP-P2-03` — Checkpoint / workflow language היסטורית צריכה לצאת מהקורס הסופי

**מקור:** Review 1.

**Repair Wave:** `R8`.

---

## ‏`AO-GAP-P2-04` — טבלאות רחבות מדי להדפסה

**מקור:** Review 1 + Print requirement.

**Repair Wave:** `R9 — Deterministic Build and Print Viewer`.

---

## ‏`AO-GAP-P2-05` — חסרים anchors יציבים ל־cross-reference ול־Print Viewer

**Repair Wave:** `R8`.

---

## ‏`AO-GAP-P2-06` — תאריכי אימות של Broker Facts צריכים format אחיד

**Repair Wave:** `R8`.

---

## ‏`AO-GAP-P2-07` — צריך final consistency sweep ל־RTL + English identifiers

**Repair Wave:** `R8`.

---

# ‏6. Repair Waves — סדר התיקונים הקנוני

## ‏`R1 — Source Split and Canonical Manifest`

**מטרה:** להפסיק לערוך master ענק.

‏פעולות:

1. ‏לפצל את `ADVANCED-ORDER-MASTERY.md` לקבצי פרקים עצמאיים.
2. ‏לשמר סדר ותוכן ללא rewrite בשלב הפיצול.
3. ‏לשלב את `10C` ו־`10D` בתוך מבנה המקורות.
4. ‏ליצור manifest קנוני שמגדיר סדר.
5. ‏להשאיר את master הישן כ־reference עד שהassembler מוכן.

**Acceptance:** כל חלק ניתן לקריאה עצמאית, וסדר האיחוד deterministic.

---

## ‏`R2 — Structure, Taxonomy and Canonical Vocabulary`

‏מטפל ב־:

```text
P0-02
P0-03
P0-04
P0-09
P1-25
P2-01
```

‏כולל Chapter Maps, labels ו־canonical naming.

---

## ‏`R3 — Missing Advanced Orders`

‏מטפל ב־:

```text
Sweep-to-Fill
Discretionary
Market-to-Limit
MIT / LIT
Trailing MIT / LIT concise extension
Product-specific / Out-of-Scope table
Visible price vs hidden willingness taxonomy
```

---

## ‏`R4 — Why / When / Why Not + Direct Comparisons`

‏מוסיף mini-cards, comparison tables, Decision Examples ו־Counterexamples.

---

## ‏`R5 — Engine Mapping and Capability Normalization`

‏מטפל ב־:

```text
ExecutionMode Contract
Entry vs Exit mapping
Exit feasibility before entry
Partial-fill redecision
Capability enablement lifecycle
failure destinations
reason codes
DISABLED / SHADOW_ONLY / LIVE_ENABLED
```

---

## ‏`R6 — Failure Contracts, Survivability and Safety`

‏מטפל ב־:

```text
Order Survivability Matrix
Failure Contract per family
Bracket partial-fill uncertainty
OCA/OCO non-atomic semantics
Late Effect Taxonomy
Manual ownership changes
Recovery invariants
Shutdown semantics
READY conditions
```

---

## ‏`R7 — Practitioner Judgment Layer`

‏מוסיף בצורה קומפקטית את שכבת:

```text
COMMON WRONG CONCLUSION
WHAT ACTUALLY MATTERS
WHAT PROFESSIONALS MEASURE
ENGINE IMPLICATION
```

‏בלי להפוך את הקורס לרשימת "סודות" מנותקת מה־semantics.

---

## ‏`R8 — Cross-References, Glossary and Final Course Cleanup`

‏מטפל ב־:

```text
Problem → Candidate Index
Glossary
Prerequisites
cross-references
anchor stability
remove workflow/checkpoint residue
remove unnecessary duplication
verification-date formatting
RTL / identifier consistency
```

---

## ‏`R9 — Deterministic Assembler and Compact Print Viewer`

‏לאחר שכל התיקונים הושלמו:

```text
chapter sources
→ manifest
→ deterministic assembler
→ generated ADVANCED-ORDER-MASTERY.md
→ print viewer
```

‏ה־Print Viewer צריך לתמוך לפחות ב־:

```text
A4 / A5
Comfortable / Compact / Ultra Compact
font-size control
margin control
line-height control
RTL
compact tables
wide-block handling
heading orphan prevention
break-inside control
UI hidden on print
print preview
```

‏ה־Viewer וה־assembler צריכים להשתמש באותם source files, כדי שלא יהיו שני מקורות אמת.

---

# ‏7. Definition of Done לכל Repair Wave

‏Wave אינו נחשב סגור רק כי "נכתב טקסט".

‏לכל Wave נדרש:

```text
1. target gaps resolved
2. no new terminology drift introduced
3. cross-references remain valid
4. chapter remains focused on Advanced Orders
5. no accidental expansion into general trading course
6. source files remain mergeable by manifest
```

---

# ‏8. What We Explicitly Will Not Do

‏כדי לשמור Scope:

- ‏לא נוסיף פרקים כלליים על Market Data.
- ‏לא נוסיף קורס שלם על Auctions.
- ‏לא נוסיף קורס LULD/Halts מחדש.
- ‏לא נוסיף Scanner/Ranking material שאינו נדרש ישירות לבחירת Order.
- ‏לא נוסיף כל Order Type שקיימת רק כדי להיות exhaustive.
- ‏לא נבחר Order אחת כ־"winner" ללא evidence.
- ‏לא נערוך את ה־master הענק ידנית בכל Wave.

---

# ‏9. Final Repair Order

```text
R1  Source Split + Manifest
R2  Structure + Taxonomy + Vocabulary
R3  Missing Advanced Orders
R4  Why/When/Why Not + Comparisons
R5  Engine Mapping + Capability Model
R6  Failure Contracts + Safety
R7  Practitioner Judgment
R8  Cross-References + Glossary + Cleanup
R9  Deterministic Assembler + Print Viewer + Print Verification
```

‏זהו סדר התיקונים הקנוני מעכשיו.

---

# ‏10. Checkpoint

‏Reviews ‏1–7 הומרו ל־Gap List קנוני אחד עם priorities ו־Repair Waves.

‏השלב הבא אינו עוד Review.

‏השלב הבא הוא:

```text
R1 — Source Split and Canonical Manifest
```

‏כלומר לפצל את הקורס הגדול לקבצי פרקים עצמאיים **ללא שינוי תוכן מהותי**, וליצור manifest שממנו נוכל אחר כך לתקן, לאחד ולהדפיס בצורה בטוחה.