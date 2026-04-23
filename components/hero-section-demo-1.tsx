import { ThreeDMarquee, type MarqueeCard } from "@/components/ui/3d-marquee";
import { ArrowRight, BadgeCheck, Play, Sparkles } from "lucide-react";
import Image from "next/image";

const heroCards: MarqueeCard[] = [
  {
    eyebrow: "Instant Notes",
    title: "Turn any chapter into concise study notes",
    description:
      "Upload slides, PDFs, or pasted text and get structured notes with key takeaways in seconds.",
    metric: "3.2x faster revision",
    chip: "Notes AI",
    progress: "84%",
    accentClassName: "from-sky-400/30 via-blue-500/12 to-transparent",
    progressClassName: "from-sky-500 to-blue-600",
  },
  {
    eyebrow: "Exam Prep",
    title: "Adaptive quizzes that focus on weak topics",
    description:
      "Question difficulty shifts automatically so students spend time where it moves scores.",
    metric: "92% confidence",
    chip: "Quiz Mode",
    progress: "92%",
    accentClassName: "from-violet-400/28 via-indigo-500/12 to-transparent",
    progressClassName: "from-violet-500 to-indigo-600",
  },
  {
    eyebrow: "Paper Grading",
    title: "Detailed feedback before the real submission",
    description:
      "Run answer sheets through AI checks for clarity, structure, and missing concepts.",
    metric: "18 min saved",
    chip: "Grader",
    progress: "76%",
    accentClassName: "from-emerald-400/28 via-green-500/12 to-transparent",
    progressClassName: "from-emerald-500 to-green-600",
  },
  {
    eyebrow: "Flashcards",
    title: "Auto-generate memory cards from your content",
    description:
      "Long explanations become clean question-answer cards ready for rapid recall sessions.",
    metric: "126 cards created",
    chip: "Recall Boost",
    progress: "88%",
    accentClassName: "from-amber-400/30 via-orange-500/10 to-transparent",
    progressClassName: "from-amber-500 to-orange-600",
  },
  {
    eyebrow: "Study Plan",
    title: "Weekly roadmap built around your goals",
    description:
      "Tutora maps subjects, deadlines, and revision blocks into a practical, paced plan.",
    metric: "7-day plan ready",
    chip: "Planner",
    progress: "81%",
    accentClassName: "from-cyan-400/30 via-teal-500/10 to-transparent",
    progressClassName: "from-cyan-500 to-teal-600",
  },
  {
    eyebrow: "Concept Help",
    title: "Ask follow-up questions like a real tutor",
    description:
      "Break down formulas, definitions, and tricky passages without switching apps or tabs.",
    metric: "24/7 support",
    chip: "Chat Tutor",
    progress: "90%",
    accentClassName: "from-fuchsia-400/28 via-pink-500/12 to-transparent",
    progressClassName: "from-fuchsia-500 to-pink-600",
  },
  {
    eyebrow: "Language Learning",
    title: "Practice pronunciation and grammar together",
    description:
      "Get guided drills, corrections, and vocabulary refreshers in one focused flow.",
    metric: "1,400+ drills",
    chip: "Language AI",
    progress: "74%",
    accentClassName: "from-rose-400/26 via-red-500/10 to-transparent",
    progressClassName: "from-rose-500 to-red-600",
  },
  {
    eyebrow: "Research Support",
    title: "Summaries that preserve the academic context",
    description:
      "Dense research papers become scannable insight cards with methods and findings highlighted.",
    metric: "41% less overload",
    chip: "Research",
    progress: "79%",
    accentClassName: "from-slate-400/26 via-indigo-500/12 to-transparent",
    progressClassName: "from-slate-500 to-indigo-700",
  },
];

const trustPoints = [
  { label: "Trusted by", value: "50k+ Students" },
  { label: "Average rating", value: "4.9 / 5.0" },
  { label: "Reported boost", value: "98% exam readiness" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="absolute left-[-6rem] top-16 h-64 w-64 rounded-full bg-thirdary/12 blur-3xl" />
      <div className="absolute right-[-3rem] top-10 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:gap-8 xl:gap-12">
        <div className="w-4xl flex-1 ">
          <div className="inline-flex items-center gap-2 rounded-full border border-thirdary/15 bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur">
            <Sparkles className="h-4 w-4 text-thirdary" />
            Personalized study workflows for modern students
          </div>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.2] tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
            Learn{" "}
            <span className="bg-gradient-to-r mr-3 from-button via-thirdary to-primary bg-clip-text text-transparent">
              Smarter
            </span>
            with
            <br />
            your personal

            <span className="bg-gradient-to-r font-extrabold ml-3 from-primary via-thirdary to-button bg-clip-text text-transparent">
              AI Tutor
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Tutora combines smart summaries, guided quizzes, paper feedback, and
            real-time explanations into one focused workspace built to improve how
            students actually study.
          </p>
          <div className="mt-10 ">
            <div className="inline-flex items-center gap-6 ">
              {/* Item 1 */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2ff]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5 text-[#3b4a8a]"
                  >
                    <rect x="7" y="3" width="10" height="18" rx="2" />
                    <path d="M9.5 7h5M9.5 10h5M9.5 13h3" />
                  </svg>
                </div>
                <div className="leading-tight">
                  <p className="text-[13px] font-medium text-[#3b4a8a]">Trusted by</p>
                  <p className="text-[13px] font-semibold text-[#1f2a44]">50k+ Students</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-10 w-px bg-[#d9def0]" />

              {/* Item 2 */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2ff]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-[#3b4a8a]"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm6.93 9h-2.95a15.7 15.7 0 0 0-1.38-5.02A8.03 8.03 0 0 1 18.93 11ZM12 4.07A13.7 13.7 0 0 1 13.96 11h-3.92A13.7 13.7 0 0 1 12 4.07ZM9.4 5.98A15.7 15.7 0 0 0 8.02 11H5.07A8.03 8.03 0 0 1 9.4 5.98ZM5.07 13h2.95a15.7 15.7 0 0 0 1.38 5.02A8.03 8.03 0 0 1 5.07 13ZM12 19.93A13.7 13.7 0 0 1 10.04 13h3.92A13.7 13.7 0 0 1 12 19.93Zm2.6-1.91A15.7 15.7 0 0 0 15.98 13h2.95a8.03 8.03 0 0 1-4.33 5.02Z" />
                  </svg>
                </div>
                <div className="leading-tight">
                  <p className="text-[13px] font-semibold text-[#1f2a44]">4.9/5</p>
                  <p className="text-[13px] font-medium text-[#3b4a8a]">Rating</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-10 w-px bg-[#d9def0]" />

              {/* Item 3 */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2ff]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-[#3b4a8a]"
                  >
                    <path d="M12 2l2.4 2.2 3.2-.4 1.4 2.9 2.9 1.4-.4 3.2L22 14l-2.2 2.4.4 3.2-2.9 1.4-1.4 2.9-3.2-.4L12 22l-2.4 2.2-3.2.4-1.4-2.9-2.9-1.4.4-3.2L2 14l2.2-2.4-.4-3.2 2.9-1.4 1.4-2.9 3.2.4L12 2Zm-1 14 5-5-1.4-1.4L11 13.2l-1.6-1.6L8 13l3 3Z" />
                  </svg>
                </div>
                <div className="leading-tight">
                  <p className="text-[13px] font-semibold text-[#1f2a44]">98% Exam</p>
                  <p className="text-[13px] font-medium text-[#3b4a8a]">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button className="btn-primary py-3">
              Start Free
              <ArrowRight className="h-4 w-4" />
            </button>

            <button className="inline-flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white/85 pl-3 pr-6  py-3 text-sm font-semibold text-slate-700 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur transition-colors duration-300 hover:bg-slate-50">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-thirdary/10 text-thirdary">
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              </span>
              Watch Demo
            </button>
          </div>



        </div>

        <div>
          <Image src="/demo-1.png" width={580} height={520} alt="img" />
        </div>
        {/* <div className="relative flex flex-1 items-center justify-center lg:min-w-0 lg:justify-end"> */}

        {/* </div> */}
      </div>

    </section>
  );
}
