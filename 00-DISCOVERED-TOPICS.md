# ‏Discovered Topics — נושאים שנוספו במהלך הקורס

> ‏מסמך זה הוא Registry של נושאים מהותיים שהתגלו במהלך הקורס ואינם צריכים להיעלם רק משום שלא הופיעו ב־Roadmap המקורי.

## ‏כלל עבודה

‏כל `Discovered Topic` שנרשם כאן חייב לקבל אחד משלושה סטטוסים:

```text
PLANNED
MERGED_INTO_EXISTING_CHAPTER
COMPLETED
```

‏אין למחוק נושא רק משום שה־Roadmap המקורי כבר התקדם מעבר לנקודה שבה הוא התגלה.

---

## ‏60A — `Negative Evidence, Veto and Disqualification Engine`

**Status:** `COMPLETED`

‏נוסף בעקבות ההבנה ש־Ranking חיובי לבדו אינו מספיק להחלטת מסחר.

‏המנגנון פועל במקביל ל־Score/Ranking ומרכז Evidence שלילי שיכול:

- ‏לפסול Candidate לחלוטין (`Hard Veto`).
- ‏להפחית אטרקטיביות (`Soft Penalty`).
- ‏להפעיל `Cooldown` או TTL לאחר אירוע שלילי.
- ‏לשמור `Negative Memory` רב־טווח: מילישניות, שניות, דקות ועד חלונות ארוכים יותר כאשר המחקר מצדיק זאת.
- ‏להפיק `Reason Codes` ברורים ולא Boolean סתום.
- ‏להבחין בין Safety/Data/Trading-Status/Execution/Liquidity/Signal/Recent-Behavior/Context vetoes.
- ‏להיות Point-in-Time Correct ולא ליצור leakage.
- ‏לעבור OOS validation, ablation ו־Decision Impact analysis כדי להימנע מ־Veto Overfitting.
- ‏להתחבר ל־`TRADE / NO TRADE` מבלי להפוך הכול ל־Score יחיד שמסתיר סיבת פסילה.

‏מבנה רעיוני:

```text
Positive Evidence Engine
→ Score / Rank

Negative Evidence Engine
→ Vetoes / Penalties / Cooldowns

Execution Feasibility
→ Entry / Exit / Costs / Fill / Latency

Decision Aggregator
→ TRADE / NO TRADE
```

‏הפרק הושלם ב־`60A-NEGATIVE-EVIDENCE-VETO-AND-DISQUALIFICATION-ENGINE.md`.

---

## ‏85A — `Market Conduct, Manipulation Prevention, Self-Trade Controls and Automated-Trading Compliance`

**Status:** `COMPLETED`

**Completion Blocking:** `RESOLVED`

‏נוסף בעקבות `Final Course Gap Review` לאחר השלמת שלבים 1–85.

‏הביקורת מצאה שהקורס כיסה היטב Market Microstructure, Orders, Execution, Risk, Account Regulations ו־Operational Safety, אך חסרה שכבה עצמאית שעוסקת בהתנהגות שהרובוט עצמו מייצר וב־Market Conduct controls.

‏הפרק הושלם ב־`85A-MARKET-CONDUCT-MANIPULATION-PREVENTION-SELF-TRADE-AND-COMPLIANCE.md` ומתמקד ב־Prevention, Governance, Detection ו־Auditability — לא בהוראות לביצוע מניפולציה.

‏הכיסוי כולל:

- ‏`Bona Fide Order Intent` ו־economic purpose.
- ‏`Spoofing` / `Layering` ברמת איסור, זיהוי ומניעה בלבד.
- ‏`Wash Trading` / non-bona-fide activity ברמת compliance.
- ‏`Self-Trade` / `Self-Match` prevention.
- ‏duplicate strategy instances ו־single-writer/fencing.
- ‏conflicts בין Entry, Exit, Replacement, Retry, Recovery ו־Manual orders.
- ‏auction-related conduct concepts כגון marking open/close ברמת מניעה.
- ‏`Momentum Ignition` כקטגוריית conduct risk ברמת זיהוי ואיסור בלבד.
- ‏cancel/order behavior כ־surveillance signal בלי threshold אוניברסלי.
- ‏pre-trade `Compliance Gate` עם `ALLOW / BLOCK / REVIEW_REQUIRED / EXIT_ONLY`.
- ‏post-trade surveillance metrics.
- ‏Reason Codes ו־audit lineage מלא.
- ‏broker/venue Self-Match Prevention כ־defense-in-depth.
- ‏safe retry/idempotency תחת `UNKNOWN_EFFECT`.
- ‏hard isolation בין Replay/Shadow/Paper/Live.
- ‏manual-vs-automated order conflict detection.
- ‏versioned regulatory/broker/venue references עם `VerifiedAt`.
- ‏Compliance incidents כחלק מ־RCA ו־Incident Packets.
- ‏`ComplianceMode` שחוסם New Risk תוך שמירה על יכולת להפחית Exposure.
- ‏Golden scenarios, fault tests ו־property invariants.
- ‏conduct metrics כחלק מ־Champion/Challenger ו־Continuous Improvement.

‏הנושא מתועד גם ב־`00-FINAL-COURSE-GAP-REVIEW.md`.

‏ה־Completion Blocking Gap שנמצא ב־Gap Review נפתר. הכרזת Completion סופית של הקורס וה־handoff לפרויקט ההמלצות נשארות שלב סגירה נפרד, כדי לאחד ולאמת את ה־authoritative state לפני המעבר לצ'אט חדש.
