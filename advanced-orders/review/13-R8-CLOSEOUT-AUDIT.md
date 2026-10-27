# ‏R8 Closeout Audit — Reference, Navigation and Final Learning Cleanup

> ‏מטרת המסמך: לאמת ששכבת ה־reference/navigation של `Advanced Order Mastery` שלמה, beginner-first, ואינה משאירה את הקורא תלוי ב־Review/Audit files. זהו מסמך עבודה זמני שיימחק בניקוי הסופי לאחר `R9`, בהתאם ל־`finalizationPolicy`.

---

## ‏1. תוצאת ה־Closeout

```text
R8 RESULT = PASS
R8_COMPLETE = YES
```

‏ה־closeout בדק את דרישות `R8` ואת שני פערי ה־P2 שנותרו בתחום presentation/navigation.

---

## ‏2. Final Gap List — R8

| Gap | Status | Canonical closure |
|---|---|---|
| `AO-GAP-P1-22` — Problem → Candidate Index | `PASS` | `00B-BEGINNER-NAVIGATION-AND-PROBLEM-INDEX.md` מאפשר להתחיל מהבעיה ולא משם ה־Order. |
| `AO-GAP-P1-23` — Canonical Advanced Orders Glossary | `PASS` | `00C-CANONICAL-GLOSSARY.md` נותן plain-language quick reference עם source hierarchy ברורה. |
| `AO-GAP-P1-24` — Prerequisites / Cross-References | `PASS` | `00D-PREREQUISITES-CROSS-REFERENCES-AND-OWNERSHIP-MAP.md` כולל prerequisite map, cross-reference types ו־family map. |
| `AO-GAP-P1-25` — Native / Resident / Simulated / Client-Managed normalization | `PASS` | `00A.12`, `00C` ו־`00D.4–00D.5` מפרידים residency, behavior evaluator ו־native semantics. |
| `AO-GAP-P2-01` — Chapter Map | `PASS` | `00-FRONT-MATTER.md` כולל beginner core path ומפת קורס מפורשת. |
| `AO-GAP-P2-02` — repeated TTL / hard cap / partial fill / broker truth | `PASS` | `00A.21` ו־`00D.8` קובעים `DEFINE ONCE → CROSS-REFERENCE → EXTEND ONLY WHEN THE FAMILY CHANGES THE CONSEQUENCE`. |

---

## ‏3. Beginner-First Learning Flow

‏המסלול הקנוני כעת הוא:

```text
00 Front Matter
→ 00B Problem-first navigation
→ Parts 1–7 semantics and advanced-order families
→ Part 8 lifecycle / safety
→ Part 9 capability / materialization
→ Part 10 decision engine / practitioner judgment
```

‏במקביל:

```text
00A = canonical taxonomy/contracts
00C = beginner-first quick glossary
00D = prerequisites / cross-references / ownership map
```

‏`00A`, ‏`00C` ו־`00D` הם references לאורך המסלול, לא מבחני כניסה למתחיל.

---

## ‏4. Construction-Prose Cleanup

‏ב־`00A–00D` הוסרו ניסוחים שנועדו רק לתהליך הבנייה כגון:

```text
Repair Wave
R8 will later...
Checkpoint that tells the next repair step
```

‏במקומם נשארו הפניות קבועות בין פרקי הקורס והיררכיית מקור אמת.

‏מסמכי `review/` עדיין נשמרים זמנית כי `R9` והניקוי הסופי עוד עשויים להשתמש בהם לאימות. הם אינם learner-facing ו־`finalizationPolicy` מחייב למחוק אותם לפני סיום הפרויקט.

---

## ‏5. Duplication Policy

‏ההגדרות הבאות אינן אמורות להיכתב מחדש בכל family:

```text
TTL / clocks             → 00A.13
Economic Price Boundary  → 00A.14
Cancel / broker truth    → 00A.15 + 08
Partial Fill             → 00A.16
Ownership dimensions     → 00D.4–00D.5
Capability enablement    → 00A.17 + 09/09B
```

‏פרק משפחה רשאי לחזור במשפט קצר לצורך teaching, אבל contract מלא חוזר רק אם יש consequence ייחודי לאותה family.

---

## ‏6. Boundary לפני R9

‏`R8_COMPLETE` אינו אומר שה־repository כבר נקייה סופית או שה־master כבר regenerated.

‏`R9` עדיין אחראית ל־:

```text
deterministic assembler
regenerated ADVANCED-ORDER-MASTERY.md
compact print viewer
print verification
final inventory / deletion of review and obsolete files
cleanliness verification
```

‏אין לבצע את `R9` כחלק מ־R8 closeout.