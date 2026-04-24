import { ArrowRight, Play, Sparkles } from "lucide-react";
import Image from "next/image";


export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-12">
      <div className="absolute left-[-6rem] top-16 h-52 w-52 rounded-full bg-thirdary/12 blur-3xl sm:h-64 sm:w-64 xl:left-[-4rem] xl:h-72 xl:w-72" />
      <div className="absolute right-[-3rem] top-10 h-60 w-60 rounded-full bg-primary/12 blur-3xl sm:h-72 sm:w-72 xl:right-0 xl:top-16 xl:h-80 xl:w-80" />

      <div className="relative mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-7xl flex-col justify-center gap-14 lg:min-h-[calc(100svh-7rem)] lg:flex-row lg:items-center lg:gap-10 xl:max-w-[82rem] xl:gap-14 2xl:max-w-[96rem]">
        <div className="w-full flex-1 lg:max-w-[40rem] 2xl:max-w-[44rem]">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-thirdary/15 bg-white/85 px-3 py-2 text-xs font-medium text-slate-700 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur sm:px-4 sm:text-sm">
            <Sparkles className="h-4 w-4 text-thirdary" />
            Personalized study workflows for modern students
          </div>

          <h1 className="mt-6 max-w-[12ch] text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-[4.4rem]">
            Learn{" "}
            <span className="mr-2 bg-gradient-to-r from-button via-thirdary to-primary bg-clip-text text-transparent sm:mr-3">
              Smarter
            </span>
            with
            <br />
            your personal
            <span className="ml-2 bg-gradient-to-r font-extrabold from-primary via-thirdary to-button bg-clip-text text-transparent sm:ml-3">
              AI Tutor
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8 lg:text-lg xl:max-w-2xl">
            Tutora combines smart summaries, guided quizzes, paper feedback, and
            real-time explanations into one focused workspace built to improve how
            students actually study.
          </p>
          <div className="mt-10">
            <div className="grid max-w-2xl grid-cols-1 gap-4 rounded-[2rem] border border-slate-200/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center sm:gap-0 sm:p-5">
              {/* Item 1 */}
              <div className="flex items-center gap-3 sm:pr-5 xl:pr-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff]">
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
              <div className="hidden h-10 w-px bg-[#d9def0] sm:block" />

              {/* Item 2 */}
              <div className="flex items-center gap-3 sm:justify-center sm:px-5 xl:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff]">
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
              <div className="hidden h-10 w-px bg-[#d9def0] sm:block" />

              {/* Item 3 */}
              <div className="flex items-center gap-3 sm:justify-end sm:pl-5 xl:pl-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff]">
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
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <button className="btn-primary w-full py-3 sm:w-auto sm:px-7">
              Start Free
              <ArrowRight className="h-4 w-4" />
            </button>

            <button className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white/85 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur transition-colors duration-300 hover:bg-slate-50 sm:w-auto sm:pl-3 sm:pr-6">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-thirdary/10 text-thirdary">
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              </span>
              Watch Demo
            </button>
          </div>
        </div>

        <div className="w-full flex-1 lg:max-w-[34rem] xl:max-w-[40rem] 2xl:max-w-[46rem]">
          <div className="relative mx-auto aspect-[29/26] w-full max-w-[24rem] sm:max-w-[30rem] lg:max-w-none">
            <Image
              src="/demo-1.png"
              fill
              priority
              sizes="(max-width: 639px) 92vw, (max-width: 1023px) 78vw, (max-width: 1279px) 42vw, 46vw"
              className="object-contain"
              alt="Tutora dashboard preview"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
