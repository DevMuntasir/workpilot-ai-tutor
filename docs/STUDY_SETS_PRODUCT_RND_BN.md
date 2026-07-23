# Study Sets Full Module — Canada-first Product R&D

**Product:** Neurova / WorkPilot / AI Tutora  
**Target market:** Canada  
**Research date:** 23 July 2026  
**Scope:** Canada-র student নিজে course materials ও নিজের performance ব্যবহার করে একটি living study system বানাবে; platform একজন ভালো private tutor/study coach-এর মতো diagnose, teach, test, adapt ও follow-up করবে।

---

## 1. Executive verdict

বর্তমান Study Sets module-এর foundation ভালো: PDF/text upload, parallel content generation, notes, MCQ, flashcards, fill-in-the-blanks, written test, tutor lesson, progress এবং personalization profile আছে। কিন্তু flow-টি এখনো মূলত:

> **source → একবারে অনেক content generate → student নিজে format বেছে study করে → score দেখে**

এই model-টি market-এ আর unique নয়। Quizlet, Knowt, StudyFetch, NotebookLM এবং Gemini—সবাই source থেকে notes, quizzes, flashcards বা guided learning তৈরি করছে। বিশেষ করে Gemini-এর 2026 Study Notebooks initial diagnostic, objective-level progress, strengths/focus areas এবং next lesson recommendation-ও দিচ্ছে।

প্রস্তাবিত নতুন model:

> **goal → source understanding → diagnostic → concept map → daily adaptive lesson → student response → misconception diagnosis → নতুন personalized content → delayed verification → next best action**

Product category-টিকে “AI content generator” থেকে **Personal Learning Operating System**-এ নিতে হবে।

### Recommended positioning

**“Neurova turns your course materials, exam goal, and every mistake into a private study coach that adapts as you learn.”**

বাংলায়:

**“তোমার lecture, class note, exam goal আর প্রতিটি ভুল থেকে Neurova নিজে তোমার জন্য পরের lesson ও practice বানায়।”**

### Defensible product wedge

সবচেয়ে শক্তিশালী wedge হবে:

1. **Performance-to-Content Loop:** প্রতিটি ভুল, hesitation ও confidence gap থেকে next explanation/question/revision তৈরি।
2. **Verified Mastery:** শুধু completion বা একই question repeat নয়; delayed recall, transfer question এবং teach-back দিয়ে mastery প্রমাণ।
3. **Source Truth:** প্রতিটি generated claim/question/explanation-এর source page/section citation।
4. **Course & Province Intelligence:** Student-এর institution/course outline এবং province-specific curriculum/assessment blueprint।
5. **Student Curriculum Compiler:** একাধিক source + course outline + practice assessment + নিজের performance মিলিয়ে living micro-course।

এগুলো একসঙ্গে build করলে copy করা কঠিন হবে, কারণ moat হবে শুধু UI বা prompt নয়—student-এর longitudinal learning data, misconception graph, source graph ও validated item bank।

---

## 2. বর্তমান implementation audit

### যা ইতিমধ্যে আছে এবং reuse করা যাবে

| Capability | Current state | Reuse value |
|---|---|---|
| Source ingestion | PDF ও pasted text upload | Core source pipeline হিসেবে রাখা যাবে |
| Multi-output generation | Notes, MCQ, flashcards, tutor lesson, written test, fill blanks | Content primitives হিসেবে reuse |
| Async generation | Batch jobs + WebSocket/polling | Long generation flow-এর ভালো base |
| Interactive attempts | MCQ, flashcard, fill-blank response ও response time backend-এ যায় | Adaptive engine-এর event foundation |
| Progress | unfamiliar / learning / familiar / mastered, accuracy, attempts | Concept-level model-এ evolve করা যাবে |
| Personalization | stage, goal, depth, note format, examples, pace, tutor approach, tone | Teaching preferences হিসেবে ব্যবহার করা যাবে |
| Notes editor | Rich editable notes | Gap notes, annotations, highlight-to-ask-এর base |
| Dashboard/history | Study set library, completion, recent activity | “Next best action” home-এ evolve করা যাবে |

### Code-level observations

- Creation flow fixed output formats/presets দিয়ে শুরু হয়; goal, exam date, available time বা diagnostic নেয় না (`components/study-sets/create-study-set-modal.tsx:17-30, 103-111`)।
- Upload card “Image, file” বলে, কিন্তু creation implementation কেবল PDF/text support করে (`app/dashboard/study-sets/page.tsx:384-390`, `components/study-sets/create-study-set-modal.tsx:14, 52-54`)।
- Study content আলাদা generated section card হিসেবে দেখানো হয়; system কোনো recommended learning sequence বানায় না (`app/dashboard/study-sets/[id]/overview.tsx:355-447`)।
- Tutor lesson interactive tutor নয়; static prompt, suggested response ও optional follow-up render করে (`app/dashboard/study-sets/[id]/page.tsx:1131-1152`)।
- Written answer client-side keyword overlap ও answer length দিয়ে grade হয়; এটি reliable semantic/rubric assessment নয় (`app/dashboard/study-sets/[id]/page.tsx:130-166, 1185-1199`)।
- Notes edit local React state update করে; backend save বা durable persistence দেখা যায় না (`app/dashboard/study-sets/[id]/page.tsx:643-656`)।
- Failed section-এর retry UI আছে, কিন্তু actual retry blocked কারণ unified API document metadata দেয় না (`app/dashboard/study-sets/[id]/page.tsx:662-668`)।
- MCQ, flashcard ও fill-blank answer backend-এ যায়—এটি closed-loop adaptation-এর সবচেয়ে মূল্যবান existing asset (`lib/api/study-sets.service.ts:705-735`)।
- Current UI unattempted item-কে “unfamiliar” ধরে। “No evidence yet” এবং “attempted but weak” আলাদা নয়; mastery confidence misleading হতে পারে।
- Mastery percentage fixed stage weighting দিয়ে তৈরি, কিন্তু delayed retention, question difficulty, hint use বা transfer evidence বিবেচনা করে না (`app/dashboard/study-sets/[id]/overview.tsx:85-96`)।
- Dashboard-এর subject performance, mastery demo এবং weekly activity-এর কিছু data hardcoded (`app/dashboard/page.tsx:41-60`)।
- Product identity WorkPilot, Neurova ও Tutora—তিন নামে ছড়িয়ে আছে। Public launch-এর আগে এক brand system দরকার।

### Immediate product conclusion

Existing content types delete করতে হবে না। এগুলোকে student-facing “products” না বানিয়ে **AI teacher-এর teaching tools** বানাতে হবে। Student যেন প্রতিবার six format-এর মধ্যে decision না নেয়; system তার goal ও evidence দেখে right tool বেছে দেয়।

---

## 3. Market reality ও competitive gap

| Product | Current strength | Neurova কী copy করবে না | Opportunity |
|---|---|---|---|
| Quizlet | AI study guide, practice test, editable flashcards; Learn mode behavior দেখে targeted questions ও harder formats দেয় | আরেকটি flashcard-first clone | Source + performance থেকে cross-format adaptive lesson |
| Knowt | Free Learn mode, practice tests, spaced repetition, AI-generated flashcards | Price-only differentiation | Better diagnosis, verified mastery, course-level intelligence |
| StudyFetch / Spark.E | AI tutor, voice call, visuals, study plan, lecture capture, games, audio/video | Feature-count race | One coherent teacher loop ও evidence quality |
| RemNote | Strong spaced repetition, FSRS, exam-date scheduling | Complex power-user note system | Simple student UX + exam-aware adaptive scheduling |
| NotebookLM | Strong source grounding, citations, quizzes, flashcards, explain, audio/video | Generic source workspace | Longitudinal performance memory ও automatic remediation |
| Gemini Study Notebooks | Diagnostic, 100+ objectives, strength/focus tracking, next lesson ranking | Generic global assistant | Course-specific evidence trail, misconception fingerprint, instructor-assessment alignment |
| ChatGPT Study Mode | Socratic guidance, layered explanation, open-ended checking, file support, memory | Open-ended blank chat | Structured course, measurable progress, scheduled follow-through |
| Khanmigo | Patient step-by-step hints, one question at a time, context-aware support | Generic chat bubble | Same pedagogy tied to student’s own source and persistent mastery graph |

### Canada market structure

Canada-কে একটি national curriculum market হিসেবে model করা যাবে না। Federal education department বা integrated national education system নেই; 10 provinces ও 3 territories নিজেদের curriculum, policy এবং assessment চালায়। [CMEC overview](https://www.cmec.ca/680/Overview.html), [Canada.ca education overview](https://www.canada.ca/en/immigration-refugees-citizenship/services/settle-canada/education.html)

এ কারণে “Canadian curriculum aligned” একটি অস্পষ্ট claim। Product data model-এ minimum dimension হওয়া উচিত:

> **country → province/territory → language program → grade/institution → course code → curriculum version → assessment blueprint**

Examples:

| Segment | Relevant assessment/context | Product implication |
|---|---|---|
| Ontario secondary | Grade 9 Math EQAO; Grade 10 OSSLT; course-specific OSSD requirements | MTH1W/EQAO ও OSSLT আলাদা packs; official expectations/version map |
| British Columbia secondary | Grade 10 Numeracy, Grade 10 Literacy, Grade 12 Literacy | Application, analysis ও communication-based task generation |
| Alberta secondary | Course-specific Grade 12 diploma exams | Diploma-exam blueprint, timing ও released-item style |
| Québec secondary | Subject-specific ministerial examinations in Secondary IV/V; French and English program differences | French-first content QA, Québec course/exam mapping, separate consent/compliance path |
| College/university | Instructor-defined syllabus, slides, rubrics, midterms/finals | Student-এর own course materials become primary curriculum |

Official references: [Ontario high-school assessment](https://www.ontario.ca/page/getting-ready-high-school), [B.C. provincial assessments](https://curriculum.gov.bc.ca/provincial/assessment), [Alberta 2025–26 diploma exam information](https://www.alberta.ca/system/files/custom_downloaded_images/edc-diploma-exam-schedule.pdf), [Québec ministerial examinations](https://www.quebec.ca/en/education/preschool-elementary-and-secondary-schools/programs-training-evaluation/ministerial-examinations-evaluation-learning/ministerial-examinations/preparatory-documents/information-documents)

**Implication:** Canada localization শুধু Canadian spelling বা CAD pricing নয়। Neurova-র local wedge হবে **student-এর exact course/instructor material + province/course assessment blueprint + citation-backed misconception repair + verified mastery**।

### Recommended initial Canadian ICP

**First wedge: Ontario college/university students, English-first.**

কারণ:

- Current PDF/text, syllabus intelligence, notes, quizzes, written feedback ও paper grader এই use case-এর সঙ্গে সবচেয়ে সরাসরি fit।
- Course outline, lecture slides ও instructor rubric-ই source of truth; 13 jurisdiction-এর curriculum একসঙ্গে build করতে হবে না।
- Adult learners দিয়ে launch করলে minors-specific account/consent complexity কম।
- Midterm/final cycle clear; “I have 9 days and these 6 lectures” high-intent job।
- পরে Ontario Grade 9–12, B.C., Alberta এবং French/Québec packs evidence ও content operations ready হলে add করা যাবে।

যদি business-এর fixed target K–12 হয়, first wedge Ontario Grade 9–12 রাখুন; পুরো Canada একসঙ্গে launch করবেন না।

### Market table-এর evidence

- [Quizlet AI tools](https://quizlet.com/features/ai-study-tools) এবং [Quizlet Learn](https://help.quizlet.com/hc/en-us/articles/360030986971-Studying-with-Learn)
- [Knowt Learn Mode](https://knowt.com/learn-mode)
- [StudyFetch Spark.E](https://www.studyfetch.com/features/sparke)
- [RemNote Exam Scheduler](https://www.remnote.com/feature/exam-scheduler)
- [NotebookLM student learning features](https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-student-features/)
- [Gemini Study Notebooks, June 2026](https://blog.google/innovation-and-ai/products/gemini-app/gemini-study-notebooks/)
- [ChatGPT Study Mode](https://help.openai.com/en/articles/11780217-using-study-mode-in-chatgpt)
- [Khanmigo learner experience](https://2023-2024.annualreport.khanacademy.org/khanmigo)

### Whitespace

Individual capabilities প্রায় সব competitor-এর আছে। এখন opportunity কোনো single feature নয়; **continuous closed loop**:

> One source → one quiz → one score  
> থেকে  
> every response → updated learner model → newly selected pedagogy → newly generated content → future verification

এই loop-এ student content বানানোর prompt লেখে না। Student শুধু goal, available time ও responses দেয়; platform teacher-এর planning কাজটি করে।

---

## 4. Learning science design principles

Product decision popularity বা “learning style” claim দিয়ে নয়, measurable learning behavior দিয়ে চালাতে হবে।

1. **Retrieval before reveal:** Answer দেখানোর আগে student-কে recall/attempt করতে হবে। Practice testing ও distributed practice-কে high-utility learning techniques হিসেবে পাওয়া গেছে। [Dunlosky et al., 2013](https://journals.sagepub.com/stoken/rbtfl/Z10jaVH/60XQM/full) এবং [Roediger & Karpicke, 2006](https://doi.org/10.1111/j.1467-9280.2006.01693.x)
2. **Spacing, not one-session completion:** “Completed” মানে mastered নয়। Forgetting risk অনুযায়ী future review schedule করতে হবে।
3. **Guidance fading:** প্রথমে worked example/hints; পরে hints কমিয়ে independent recall ও transfer।
4. **Self-explanation:** “কেন?” এবং “নিজের ভাষায় বোঝাও” prompt গুরুত্বপূর্ণ। Self-explanation prompting-এর meta-analysis-এ positive overall effect পাওয়া গেছে। [Bisra et al., 2018](https://eric.ed.gov/?id=EJ1186664)
5. **Confidence calibration:** Correct answer + low confidence এবং wrong answer + high confidence আলাদা intervention চাই। শুধু accuracy incomplete signal।
6. **Immediate explanatory feedback, later independent test:** Wrong answer-এর পর explanation, তারপর নতুন wording/context-এ test।
7. **Productive struggle:** AI সরাসরি answer দিলে short-term task completion বাড়লেও independent learning ক্ষতিগ্রস্ত হতে পারে। PNAS field experiment standard answer-giving AI ও safeguarded tutor-এর গুরুত্বপূর্ণ পার্থক্য দেখিয়েছে। [Bastani et al., 2025](https://doi.org/10.1073/pnas.2422633122)
8. **Purpose-built tutor, not a chat wrapper:** Harvard physics RCT-তে strong results expert-designed prompts, structured scaffolding, curated content ও pacing-এর সঙ্গে যুক্ত ছিল। [Kestin et al., 2025](https://www.nature.com/articles/s41598-025-97652-6)

### Personalization নিয়ে সতর্কতা

Current profile-এর note format, tone, example preference useful UX preference। কিন্তু system যেন “এই student visual learner, তাই শুধু visual content” ধরনের fixed label না দেয়। Pedagogy performance evidence দেখে বদলাবে; preference presentation বদলাবে।

---

## 5. Proposed product: “Adaptive Study Journey”

### North-star experience

Student Study Set খুলে “Notes / Flashcards / MCQ” grid দেখবে না। প্রথমে দেখবে:

> **Biology midterm in 12 days**  
> You have 18 minutes today.  
> **Best next step:** Cell respiration misconception repair  
> 1 short explanation · 3 guided questions · 2 independent checks  
> **Start today’s lesson**

Formats advanced/customize menu-তে থাকবে। Default experience teacher-directed।

### Full student journey: first to last

| Stage | Student does | AI teacher does | UX output |
|---|---|---|---|
| 1. Set the outcome | “Exam prep”, “Deep understanding”, “Assignment”, “Quick revision” | Goal-specific strategy নেয় | One-tap goal cards |
| 2. Add context | Exam date, subject, level, daily time, language | Study horizon ও workload estimate করে | “12 days · 20 min/day” |
| 3. Add sources | PDF, image, text, slides, URL, audio/video transcript, syllabus, past questions | Parse, deduplicate, quality-check, citation anchors তৈরি | Source health screen |
| 4. Confirm scope | Extracted topics দেখে edit/merge/exclude | Learning objectives ও prerequisite map তৈরি | Editable topic map |
| 5. Diagnostic | 8–12 adaptive questions; প্রতিটিতে confidence; 1 short teach-back | Prior knowledge, misconceptions, confidence gap ও speed diagnose | “Already know / Focus / Not started” |
| 6. Plan preview | Daily load accept/edit | Exam date, source importance, diagnostic ও forgetting risk দিয়ে plan | Week plan + “Why this first?” |
| 7. Daily mission | Start button চাপবে | 10–25 minute micro-lesson orchestrate | One focused session |
| 8. Learn | Short explanation/example দেখে attempt করবে | Hint ladder, Socratic question, pace ও language adapt | Interactive tutor surface |
| 9. Practice | MCQ, recall, written, teach-back | Response অনুযায়ী next item/format generate | No fixed quiz length |
| 10. Remediate | Mistake দেখে retry করবে | Mistake classify করে mini-note, worked example, simpler prerequisite বা harder variant বানায় | “Let’s repair this” card |
| 11. Verify | New context-এ independent question | Same answer memorization নয়, transfer check করে | Evidence badge |
| 12. Wrap | 30-second reflection/confidence | Mastery update, weak points, next review date | “What changed today” |
| 13. Return | Today queue খুলবে | Due reviews + new learning balance করে | Daily 3–5 tasks |
| 14. Exam rehearsal | Timed mock নেয় | Past-paper blueprint অনুযায়ী difficulty ও coverage | Exam simulator |
| 15. Post-exam loop | Answer sheet/feedback upload করে | Error pattern compare ও future misconception memory update | Longitudinal learner profile |

### First-session UX target

Upload থেকে প্রথম meaningful learning interaction **90 seconds-এর মধ্যে** হওয়া উচিত। Full notes/flashcards background-এ generate হতে পারে; diagnostic ও first micro-lesson progressive generation-এ আগে আসবে।

---

## 6. Core engine: Performance-to-Content Loop

### Loop

1. **Observe:** correctness, response time, hints, retries, confidence, answer text, skipped item।
2. **Diagnose:** knowledge gap, prerequisite gap, misconception, careless error, language issue, low confidence, overconfidence।
3. **Choose pedagogy:** re-explain, analogy, worked example, contrast case, retrieval, transfer, teach-back, spaced review।
4. **Generate:** ছোট targeted content; পুরো set regenerate নয়।
5. **Validate:** source citation, answer consistency, difficulty, ambiguity, duplication।
6. **Deliver:** one best next action।
7. **Verify later:** new question/context ও delay-এর পরে।
8. **Update learner model:** mastery, confidence calibration, forgetting risk, misconception history।

### Example

Student photosynthesis MCQ ভুল করল এবং 90% confident ছিল।

System শুধু “wrong” বলবে না:

1. Distractor থেকে misconception detect: “student thinks oxygen comes from CO₂”।
2. Source-এর relevant diagram/paragraph cite।
3. 45-second contrast explanation: CO₂ vs H₂O-এর role।
4. One guided labeling task।
5. One new real-world transfer question।
6. 48 hours পরে short recall schedule।
7. Same misconception অন্য study set-এ এলে prior history ব্যবহার।

এটাই teacher feel তৈরি করবে।

---

## 7. “AI Teacher Contract”

সব tutor response এবং content generation-এর ওপর একটি pedagogical policy layer থাকবে।

### Before teaching

- Student-এর goal, level, source scope ও prior evidence জানবে।
- Unknown হলে 1–2 diagnostic question করবে; assumption লুকাবে না।
- এক সময়ে একটি clear objective নিয়ে কাজ করবে।

### While teaching

- Default sequence: **Ask → Hint → Explain → Example → Student attempt → Feedback → New check**।
- First request-এ final answer না দিয়ে smallest useful hint।
- Student দুইবার genuine attempt করলে বা explicitly safety/accessibility reason থাকলে full walkthrough দিতে পারবে।
- Explanation ছোট layer-এ দেবে; “More detail” student-controlled।
- Answer না বলে student-এর reasoning নিয়ে প্রশ্ন করবে।
- Wrong answer-কে generic praise দিয়ে ঢাকবে না; exact misconception respectfully বলবে।
- Source-derived fact-এর citation দেখাবে; source-এর বাইরে inference হলে “AI explanation” label।
- English ও Canadian French-এ equivalent-quality tutoring দিতে পারবে; French immersion, French-first এবং English program context আলাদা রাখবে।

### After teaching

- একই wording repeat না করে fresh check দেবে।
- Student-কে confidence দিতে বলবে: Guess / Unsure / Fairly sure / Certain।
- Session শেষে তিনটি জিনিস: learned, still weak, next review।

### Anti-dependency guardrails

- “Show answer” সবসময় available, কিন্তু প্রথমে attempt/hint friction।
- Homework completion mode ও learning mode আলাদা।
- Copied long answer detect হলে oral/short verification।
- AI-generated assignment response-এর বদলে outline, rubric, critique ও revision coaching।
- Streak-এর জন্য easy question farming prevent।

---

## 8. Proposed unique features

### P0–P1: strongest differentiators

#### 8.1 Mistake-to-Material

প্রতিটি meaningful ভুল থেকে automatic:

- 1 misconception card
- 1 targeted explanation
- 1 worked example
- 2 variant questions
- 1 scheduled review

Student “Generate” চাপবে না। Mistake-ই generation trigger।

#### 8.2 Mastery Proof

একটি objective “Mastered” হবে না যতক্ষণ না:

- অন্তত দুই independent correct evidence আছে;
- তার মধ্যে একটি recognition-only MCQ-এর চেয়ে stronger evidence—short answer, transfer বা teach-back;
- একটি evidence delay-এর পরে এসেছে;
- excessive hint ব্যবহার হয়নি।

UI-তে badge:

- **Seen** — content দেখা হয়েছে
- **Practiced** — immediate success
- **Stable** — delayed recall
- **Transfer-ready** — new context-এ success

এটি current unfamiliar/learning/familiar/mastered labels-এর চেয়ে explainable।

#### 8.3 Confidence Gap Radar

চার quadrant:

| Result | Confidence | Teacher response |
|---|---|---|
| Correct | High | Harder/transfer |
| Correct | Low | Confirm reasoning + one quick success |
| Wrong | Low | Teach prerequisite |
| Wrong | High | Misconception repair priority |

“Wrong + high confidence” red priority; “correct + low confidence” encouragement ও evidence দরকার।

#### 8.4 Source Truth

Generated content-এর প্রতিটি item-এ:

- source title
- page/slide/timestamp
- supporting excerpt highlight
- “Report mismatch”
- source conflict warning

Question answer citation ছাড়া production item bank-এ যাবে না।

#### 8.5 Exam DNA

Student past questions, mark scheme ও syllabus upload করবে। System exact question copy না করে blueprint শিখবে:

- topic weight
- cognitive level
- command words
- marks/time
- common distractor style
- rubric expectations

তারপর personalized mock ও gap-specific mini-test তৈরি করবে।

### P2: Canada/product moat

নিচের Canada-specific features একা moat নয়; P0–P1 performance loop ও evidence system-এর সঙ্গে যুক্ত হলেই defensible হবে।

#### 8.6 Course Outline Contract

Student syllabus/course outline upload করলে system extract করবে:

- institution, term ও course code
- learning outcomes
- grading weights ও exam dates
- weekly lecture/topic scope
- instructor rubric/command words
- stated academic-integrity/AI-use policy

প্রতিটি plan ও generated assessment এই “contract”-এর against explainable হবে: “This is next because it is 20% of Midterm 2 and your confidence is high but transfer accuracy is low.”

#### 8.7 English/French Learning Layer

- Canadian English ও Canadian French-এ equivalent-quality content; শুধু word-for-word translation নয়।
- English, French-first এবং French immersion program আলাদা terminology/context।
- Source যে ভাষায়, citation original language-এ; student চাইলে explanation অন্য official language-এ।
- French quality review ছাড়া Québec launch নয়।

#### 8.8 Misconception Fingerprint

Study set-এর বাইরে persistent learning memory:

- “formula substitution without unit check”
- “correlation vs causation confusion”
- “definition remembers, application weak”
- “long answer lacks evidence”

System personal weakness label হিসেবে shame করবে না; strategy recommendation হিসেবে দেখাবে।

#### 8.9 Teach-back Voice Check

Student 30–60 seconds নিজের ভাষায় বুঝিয়ে বলবে। AI:

- covered concepts
- missing relation
- factual error
- clarity
- suggested retry

দেবে। Voice transcript source ও rubric-এর against evaluate হবে।

#### 8.10 Offline Commute Pack

আজকের lesson, due flashcards ও questions small offline package হিসেবে cache; response পরে sync। Transit, weak campus Wi‑Fi এবং rural/northern connectivity context-এ এটি useful fallback; core experience network failure-এ ভেঙে পড়বে না।

---

## 9. Existing feature-গুলোর recommended evolution

| Existing feature | Keep | Change |
|---|---|---|
| Notes | Editable rich notes | “Gap Notes” default; source citations; highlight-to-ask; auto-update from mistakes; student annotation আলাদা layer |
| Flashcards | Front/back interaction | Binary right/wrong-এর বদলে Again / Hard / Good / Easy; answer বলার/টাইপ করার prompt; FSRS-like schedule; reverse, image occlusion, context |
| MCQ | Immediate grading + explanations | Confidence capture; misconception-based distractors; difficulty control; variant retry; source proof; answer position randomization |
| Fill blanks | Active recall | Multiple blanks; accepted alternatives; spelling tolerance per subject; hint ladder; no “re-check” after answer revealed |
| Written test | Rubric/ideal answer | Client keyword heuristic বাদ; backend AI+rubric grading; claim-evidence structure; sentence-level feedback; improve-and-resubmit; source support |
| Tutor lesson | Generated prompt/response | Real stateful conversation; objective, hints, attempt history, source context, stop condition |
| Podcast/audio | Optional passive review | Active session-এর substitute নয়; preview বা post-study recap; embedded pause-and-answer moments |
| Overview | Mastery ring + format cards | Today’s mission, exam readiness, top 3 focus objectives, due reviews, “why this next”; formats secondary |
| Library cards | Four stage counts | Continue CTA, next action, due count, exam countdown, last learning gain |
| Personalization | Tone, format, pace | Setup 9 questions থেকে progressive learning; most settings infer করে student confirm করবে |

---

## 10. UX redesign

### 10.1 Create flow

বর্তমান দুই-step upload → formats flow বদলে:

#### Step 1 — What are you preparing for?

- Understand this topic
- Exam on a date
- Quick revision
- Solve an assignment with guidance

#### Step 2 — Add material

- PDF, image, slides, doc, paste, URL, audio/video
- Optional syllabus/past paper/mark scheme

#### Step 3 — Confirm the plan

AI preselect করবে:

> “You have 10 days. I recommend a 7-minute diagnostic now, then 18 minutes/day. I’ll create content as you need it.”

Primary CTA: **Build my plan**  
Secondary: **Customize formats**

### 10.2 Study Set home

Above the fold:

1. **Continue today — 14 min**
2. Exam readiness / learning goal
3. Due reviews
4. Top focus: “Mitosis vs meiosis”
5. “Why this is next”

Below:

- Knowledge map
- Sources
- Notes/resources
- Practice history
- Custom practice generator

### 10.3 Daily mission

একটি session-এ format switching invisible:

1. 30 sec recall warm-up
2. 2 min explanation
3. 1 guided item
4. 2 independent items
5. 1 teach-back/summary
6. session result

Student notes → MCQ → tutor section manually navigate করবে না। Orchestrator right component inline render করবে।

### 10.4 Feedback UX

Wrong answer feedback:

- **What happened:** exact issue
- **Why it is tempting:** distractor logic
- **One thing to remember:** concise rule
- **From your source:** citation
- **Try a new one:** variant

### 10.5 Progress UX

Completion graph বাদ দিয়ে:

- Objectives verified this week
- Retention forecast on exam day
- High-confidence misconceptions fixed
- Due reviews
- Time-to-readiness
- Source coverage gaps

Progress screen student-কে action দেবে, শুধু report নয়।

---

## 11. Learner model ও mastery logic

### Required concept-level state

প্রতি learning objective-এর জন্য:

- `status`: not_started / building / stable / transfer_ready
- `mastery_probability`
- `confidence_calibration`
- `last_evidence_at`
- `next_review_at`
- `forgetting_risk`
- `attempt_count`
- `hint_dependency`
- `evidence_types`
- `misconception_ids`
- `source_coverage`

### V1 rules-based mastery

শুরুতে complex ML দরকার নেই:

- MCQ correct: weak evidence
- short recall correct: medium evidence
- written/teach-back/transfer correct: strong evidence
- hint-heavy correct: reduced evidence
- fast wrong + high confidence: misconception priority
- unattempted: **unknown**, unfamiliar নয়
- two consecutive same-session correct: stable নয়
- delayed independent correct: stable

### V2 adaptive model

Sufficient attempt data হলে:

- item difficulty calibration / IRT
- Bayesian Knowledge Tracing বা equivalent
- FSRS-style retention scheduling
- contextual bandit for best next activity

ML launch করার আগে event quality ও ground truth দরকার। V1 explainable rules দিয়েই student value পাওয়া যাবে।

---

## 12. Content generation and quality architecture

### Pipeline

1. **Ingest:** OCR/transcript/parser।
2. **Normalize:** heading, page, paragraph, formula, table, figure anchors।
3. **Source health:** unreadable pages, duplicate content, missing sections, language।
4. **Concept extraction:** objectives, prerequisites, definitions, processes, examples।
5. **Curriculum alignment:** syllabus outcomes / exam blueprint।
6. **Generate candidate item:** objective + evidence type + difficulty + source anchors।
7. **Validate:**
   - answer supported?
   - question unambiguous?
   - distractors plausible but false?
   - duplicate?
   - appropriate difficulty?
   - no answer leakage?
8. **Deliver/collect attempt।**
9. **Post-attempt adaptation।**
10. **Version/audit:** model, prompt, source version, validator result।

### Quality gates

Production question-এর minimum:

- one objective
- one or more source anchors
- verified answer
- explanation
- difficulty
- evidence type
- generation version
- safety/quality score

Math/quantitative content-এ possible হলে deterministic calculation checker; written content-এ rubric-grounded dual-pass evaluation। Low-confidence generation student-কে না দেখিয়ে “Needs source clarification” দেখানো ভালো।

---

## 13. Backend/data changes

### New primary entities

- `course_goal`
- `source_document` + `source_anchor`
- `learning_objective`
- `objective_prerequisite`
- `diagnostic_session`
- `learning_session`
- `attempt`
- `attempt_evidence`
- `misconception`
- `learner_objective_state`
- `review_schedule`
- `generated_artifact`
- `tutor_turn`
- `exam_blueprint`
- `generation_quality_result`

### Existing API-তে priority additions

1. Unified study-set response-এ `document_id`, sources ও generation config।
2. Section retry/regenerate endpoint।
3. Durable notes save endpoint with autosave/version।
4. Written answer submit/grade endpoint।
5. Diagnostic create/submit/result endpoints।
6. `GET /next-actions` বা session plan endpoint।
7. Generic attempt event schema—MCQ/flashcard-specific silo নয়।
8. Objective progress endpoint।
9. Review queue endpoint।
10. Source citation anchors in every content response।

### Suggested generic attempt event

```json
{
  "study_set_id": "uuid",
  "objective_id": "uuid",
  "item_id": "uuid",
  "item_type": "short_answer",
  "response": "...",
  "is_correct": false,
  "confidence": 4,
  "response_time_ms": 18320,
  "hints_used": 1,
  "evidence_type": "independent_recall",
  "session_id": "uuid"
}
```

Backend response:

```json
{
  "diagnosis": {
    "category": "misconception",
    "misconception_id": "uuid",
    "summary": "Confuses water source with carbon dioxide source"
  },
  "mastery_update": {
    "previous": "building",
    "current": "building",
    "next_review_at": "2026-07-25T10:00:00Z"
  },
  "next_action": {
    "type": "contrast_example",
    "objective_id": "uuid",
    "reason": "High-confidence incorrect response"
  }
}
```

---

## 14. Canada launch requirements

এটি product/compliance checklist; specific legal advice নয়। Launch-এর আগে Canadian privacy counsel দিয়ে data flow, age model, province scope ও school contracts review করাতে হবে।

### 14.1 Privacy architecture

Commercial D2C operation-এ PIPEDA relevant হতে পারে; Alberta, B.C. ও Québec-এর substantially similar private-sector privacy laws আছে, এবং cross-border/interprovincial data flow-এ একাধিক law apply করতে পারে। [Office of the Privacy Commissioner of Canada](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/r_o_p/prov-pipeda/)

Product requirements:

- Student upload, answer, confidence, misconception inference ও tutor conversation আলাদা data category হিসেবে inventory।
- Uploaded course material বা learner data model training-এ defaultভাবে ব্যবহার নয়।
- Clear, specific consent; bundled “agree to everything” নয়।
- Data minimization, purpose limitation ও documented retention schedule।
- Self-serve download/export, source delete, account delete এবং generated learner profile reset।
- Subprocessor/model-provider list ও cross-border processing disclosure।
- Encryption in transit/at rest, tenant separation, least-privilege access এবং audit logs।
- School/institution edition-এর জন্য consumer tenant থেকে আলাদা data controls, DPA ও retention policy।
- Canadian data region procurement advantage হতে পারে; “data stays in Canada” claim শুধু infrastructure সত্য হলে।

Canadian privacy regulators generative AI-তে legal authority/meaningful consent, appropriate purposes, data minimization, safeguards, transparency ও accountability emphasize করে। [Canadian privacy principles for generative AI](https://www.priv.gc.ca/en/privacy-topics/technology/artificial-intelligence/gd_principles_ai)

### 14.2 Minors

- Québec-এ under-14 personal information collection-এর জন্য parent/tutor consent rule আছে, limited benefit exception ছাড়া। [Québec Commission d’accès à l’information — Law 25 changes](https://www.cai.gouv.qc.ca/protection-renseignements-personnels/sujets-et-domaines-dinteret/principaux-changements-loi-25)
- Canada-wide product default: high privacy, no targeted advertising, no public-by-default profile, no manipulative streak/nagging, precise age gate এবং guardian flow।
- Young users-এর best interests privacy-by-design-এর primary decision rule হওয়া উচিত। [Canadian privacy regulators’ joint resolution](https://www.priv.gc.ca/en/about-the-opc/what-we-do/provincial-and-territorial-collaboration/joint-resolutions-with-provinces-and-territories/res_231005_01/)
- Emotional dependency তৈরি করে এমন “I am your only teacher/friend” persona নয়; product “study coach” এবং human teacher complement।

### 14.3 Accessibility

WCAG 2.1 AA-কে product baseline ধরুন, আইনগত minimum যাই হোক। Ontario AODA-এর website requirement নির্দিষ্ট covered organization-এর public website-এ WCAG 2.0 Level AA reference করে। [Ontario accessibility guidance](https://www.ontario.ca/page/how-make-websites-accessible)

Minimum:

- Full keyboard navigation ও visible focus।
- Screen-reader labels/live regions।
- Colour-independent correct/incorrect states।
- Reduced motion; animation দিয়ে information lock নয়।
- Captions/transcripts for audio/video।
- Text resize/reflow ও adequate contrast।
- Timed practice-এ pause, extended-time/accommodation settings।
- Dyslexia-friendly display option, but no unsupported learning-style claim।
- Generated PDF/export accessible structure।

### 14.4 Academic integrity

- Create flow-এ **Learn a topic**, **Prepare for an assessment**, **Improve my draft**; “Do my assignment” নয়।
- Course outline থেকে instructor AI policy extract করে relevant reminder।
- Assignment mode-এ full submission-ready answer default নয়: outline → student attempt → rubric feedback → revision।
- Tutor hint ladder ও independent verification।
- Every generated answer/source claim traceable।
- Student-facing “AI can be wrong” report path।

### 14.5 Communications and launch operations

- Commercial email/SMS-এর জন্য consent records, sender identity এবং unsubscribe flow build করুন; CASL commercial electronic messages-এর consent requirements রাখে। [Government of Canada CASL guidance](https://ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email)
- Pricing CAD-এ; tax display/collection finance counsel-এর সঙ্গে configure।
- English support first launch হলে Québec/French-ready claim করবেন না।
- Public claims “guaranteed grade” নয়; measurable “verified practice/mastery” language।

### 14.6 Canada go-to-market

#### Initial promise

> **Upload this term’s course material. Know exactly what to study next.**

Generic “AI study tool” হিসেবে launch না করে **course-aware private study coach for Canadian postsecondary students** হিসেবে position করুন।

#### Beachhead

- Ontario-র 2–3 college/university campus।
- প্রথমে high-enrolment, material-heavy course: introductory biology, psychology, business/accounting এবং first-year science।
- Domestic ও international student—দুই group; কিন্তু learning outcome ও retention আলাদাভাবে measure।
- Exam-এর 3–5 সপ্তাহ আগে acquisition, exam শেষ হওয়ার পর retention/next-course transition।

#### Acquisition loop

- Campus ambassador ও student society partnership।
- Course-specific landing page: “Turn BIO101 lectures into a 7-day midterm plan.”
- Search/content around midterm study plan, lecture-to-practice এবং exam readiness।
- Referral reward study credits হতে পারে, কিন্তু public copyrighted note bank বা answer-sharing marketplace নয়।
- Instructor/disability-services pilot trust তৈরি করতে পারে; endorsement claim only with explicit permission।

#### Activation moment

Student:

1. course outline;
2. অন্তত তিনটি lecture/source;
3. exam date

দিলে diagnostic শেষে প্রথম targeted mission পাবে। **Activation event:** “first adaptive mission completed”, শুধু account created বা flashcards generated নয়।

#### Pricing hypothesis

- **Free:** one active course, diagnostic, limited weekly adaptive missions।
- **Student Pro:** multiple courses, unlimited adaptive missions, exam rehearsal, full review scheduler ও advanced written feedback।
- **Institution:** separate contract, admin/privacy controls ও aggregate learning insight; individual answer surveillance নয়।
- CAD monthly এবং term pass test করুন; per-generation credit surprise এড়ান।

### 14.7 90-day Canada pilot

| Period | Work | Decision evidence |
|---|---|---|
| Weeks 1–3 | 15–20 Ontario student interviews; 5 instructors/advisors; privacy and accessibility review | Exact exam-prep workflow, trust barriers, course-outline variation |
| Weeks 4–6 | Clickable prototype; current format grid বনাম adaptive mission usability test | Time-to-first-action, next-step clarity, teacher-feel rating |
| Weeks 7–10 | Closed-loop MVP in 2–3 courses | Mission completion, citation error, misconception repair |
| Weeks 11–12 | Delayed-learning test and pricing interviews | 7-day retention lift, repeat use, willingness to pay in CAD |

Pilot pass criteria আগে define করুন:

- Treatment-এর 7-day delayed score control-এর চেয়ে meaningfully higher।
- Generated factual claims-এর citation coverage at least 95%; unsupported critical claim near zero।
- At least 60% activated students week two-তে recommended session-এ ফিরে আসে।
- Accessibility-blocking issues zero।
- Students “what to do next” প্রশ্নের উত্তর 10 seconds-এর মধ্যে খুঁজে পায়।

---

## 15. Prioritized roadmap

Timelines একটি focused product squad-এর rough sequencing; estimation নয়। Backend readiness অনুযায়ী re-estimate করতে হবে।

### Phase 0 — Trustworthy foundation

**Goal:** current module-এর broken trust points fix।

- WorkPilot/Neurova/Tutora brand decision।
- Upload copy ও actual supported formats align।
- Create/Paste modal consolidate।
- Notes durable autosave।
- Retry/regenerate enable।
- Written grading backend-এ নেওয়া।
- Hardcoded dashboard performance remove।
- Attempt/session state reload-এর পর restore।
- Objective/source IDs response-এ যোগ।
- Personalization generation/tutor pipeline-এ সত্যিই প্রয়োগ।
- Canada privacy data map, consent/retention/delete flows।
- Accessibility baseline and automated/manual audit।

**Exit criteria:** no fake stats; no important student work lost; every visible action works।

### Phase 1 — Closed-loop MVP

**Goal:** system student-এর জন্য next step ঠিক করবে।

- Goal + exam date + daily time create flow।
- Topic extraction confirmation।
- 8–12 item diagnostic + confidence।
- Objective model।
- Today’s Mission।
- Rule-based next-action engine।
- Mistake-to-Material for MCQ/fill/short answer।
- Source citations।
- Unknown/building/stable/transfer-ready progress।
- Due review queue।
- Course Outline Contract।
- Ontario postsecondary course/exam terminology।

**Exit criteria:** at least 70% active students AI-recommended session শুরু করে; wrong answer-এর পরে targeted variant আসে; delayed review data collect হয়।

### Phase 2 — AI Teacher

**Goal:** static tutor lesson থেকে real tutoring।

- Stateful tutor with hint ladder।
- Interactive micro-lessons।
- Server-side written rubric feedback।
- Teach-back text।
- Guidance fading।
- Confidence gap radar।
- Knowledge map।
- Adaptive session length/difficulty।
- Exam readiness forecast।
- French architecture/content QA pilot; public Québec launch নয়।

**Exit criteria:** recommended flow current self-navigation-এর চেয়ে delayed test-এ better result দেয়।

### Phase 3 — Moat

**Goal:** difficult-to-copy local, longitudinal intelligence।

- Cross-set misconception fingerprint।
- Exam DNA / past-paper blueprint।
- Voice teach-back।
- Ontario secondary packs, then B.C./Alberta packs।
- Canadian French/Québec launch after product and compliance QA।
- Scan/OCR/image/slide/audio ingestion।
- Offline daily pack।
- Advanced retention scheduler।
- Optional parent/mentor weekly learning report।

---

## 16. What not to prioritize now

- More content formats শুধু feature list বড় করার জন্য।
- Podcast/video generation before active learning loop।
- Decorative gamification, coins বা streak punishment।
- “Learning style” classification।
- Open-ended tutor chat without objective/state/guardrails।
- Complex ML before reliable attempt and objective data।
- Social feed/classroom features before student loop works।
- Massive full-set regeneration when targeted micro-content যথেষ্ট।

---

## 17. Metrics

### North-star metric

**Weekly Verified Objectives Mastered (WVOM)**  
যে objectives independent + delayed evidence দিয়ে stable বা transfer-ready হয়েছে।

Generated cards, time in app বা number of clicks north star নয়।

### Funnel metrics

- Upload → source processed
- Source processed → diagnostic started
- Diagnostic → first mission completed
- First mission → day-2 return
- Weekly recommended sessions completed
- Due review completion

### Learning metrics

- Immediate accuracy
- 48-hour / 7-day delayed accuracy
- Transfer accuracy
- Hint dependency
- Confidence calibration error
- High-confidence misconception repair rate
- Exam readiness forecast error

### Quality metrics

- Citation coverage
- Unsupported claim rate
- Ambiguous question report rate
- Answer validation pass rate
- Duplicate item rate
- Written grade agreement with human rubric sample
- Tutor direct-answer leakage rate

### Business/engagement guardrails

- Credit surprise complaints
- Generation latency
- Cost per verified objective
- Session abandonment
- Student work loss/sync error
- Academic-integrity report rate

---

## 18. Validation plan

Desk research uniqueness guarantee করতে পারে না। Build-এর আগে তিনটি validation track চালানো উচিত।

### Track A — Student discovery

15–20 students:

- 6 Ontario college students
- 6 Ontario university students
- 3–4 international students enrolled in those institutions
- 2–4 Ontario Grade 9–12 students only if K–12 is in the next roadmap
- English-first launch cohort; separate French-language discovery before Québec entry
- Include learners who use accessibility accommodations or assistive technology

Questions:

- শেষ exam-এর জন্য কীভাবে plan করেছিল?
- কোন জায়গায় teacher দরকার হয়েছিল?
- AI output কখন trust করেনি?
- ভুল করার পরে কী করেছে?
- কোন app শুরু করে পরে ছেড়েছে এবং কেন?
- Course outline, lecture slides, rubric এবং instructor AI policy কীভাবে ব্যবহার করেছে?
- Campus commute, work schedule বা accommodation study routine-এ কী প্রভাব ফেলে?

“Would you use it?” নয়; last real behavior জানতে হবে।

### Track B — Prototype test

দুটি prototype:

- A: current format-selection overview
- B: goal → diagnostic → Today’s Mission → mistake repair

Measure:

- first action time
- decision errors
- task completion
- perceived teacher feeling
- next-step clarity

### Track C — Learning experiment

Same source/topic:

- Control: current generated notes + quizzes
- Treatment: diagnostic + adaptive lesson + delayed review

Pre-test, immediate post-test, 7-day delayed test, transfer items। Engagement uplift learning uplift-এর substitute নয়।

### First product hypothesis

> “If students receive a short diagnostic and one recommended adaptive session instead of choosing generated formats, first-session completion and 7-day delayed retention will increase.”

---

## 19. Recommended first build slice

সবকিছু একসঙ্গে না বানিয়ে এই vertical slice:

1. Ontario college/university student course code, exam goal/date ও available time দেয়।
2. Course outline + PDF/text lecture material upload করে।
3. AI outline থেকে assessment weight, scope ও 5 objectives দেখায়; student confirm করে।
4. Student 8 diagnostic item দেয় + confidence।
5. System one focus objective বেছে source-cited 10-minute mission বানায়।
6. Student একটি high-confidence mistake করে।
7. System targeted explanation + one fresh variant তৈরি করে।
8. Objective state এবং exam-readiness estimate update হয়।
9. 48-hour review scheduled হয়।
10. Home card বলে: “2-minute review due—this objective is 15% of your midterm scope.”

এই slice কাজ করলে product promise প্রমাণ হবে। এরপর flashcard scheduler, voice, exam DNA ইত্যাদি add করা যাবে।

---

## 20. Final recommendation

Current module-এর formats রাখুন, কিন্তু product hierarchy উল্টে দিন:

### Current

**Generate content → choose format → complete items**

### Target

**Set goal → diagnose → follow today’s lesson → learn from mistakes → prove mastery**

সবচেয়ে unique ও valuable promise হবে:

> **The study set is never finished generating. It keeps rebuilding itself as the student learns.**

বাংলায়:

> **Study Set একবার তৈরি হয়ে থেমে থাকবে না—student যত শিখবে ও ভুল করবে, সেটি তত নিজের lesson, question ও revision নতুন করে বানাবে।**

Canada launch-এর জন্য এক বাক্যে strategy:

> **Ontario postsecondary দিয়ে course-aware adaptive coach প্রমাণ করুন; তারপর province-specific secondary packs এবং fully reviewed Canadian French experience দিয়ে expand করুন।**

এটাই platform-কে content tool থেকে teacher-like learning system-এ রূপান্তর করবে এবং Canada-তে generic AI study generator-এর বাইরে defendable value তৈরি করবে।
