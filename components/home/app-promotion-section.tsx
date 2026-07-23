"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpenCheck,
  Camera,
  Check,
  Cloud,
  GraduationCap,
  ScanLine,
  Smartphone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

const ease = [0.22, 1, 0.36, 1] as const;

const mobileAppUrl =
  process.env.NEXT_PUBLIC_MOBILE_APP_URL?.trim() || "https://goneurova.com";

const benefits = [
  {
    icon: Camera,
    title: "Snap any question",
    description: "Get clear, guided help from a photo in seconds.",
  },
  {
    icon: BookOpenCheck,
    title: "Study sets on the go",
    description: "Review notes, flashcards, and quizzes wherever you are.",
  },
  {
    icon: Cloud,
    title: "Always in sync",
    description: "Pick up on mobile exactly where you left off.",
  },
];

function PhonePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34, rotate: 2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.8, ease }}
      className="relative mx-auto w-full max-w-[310px]"
    >
      <div className="relative rounded-[3.25rem] border-[9px] border-slate-900 bg-slate-900 p-1.5 shadow-[0_45px_100px_-35px_rgba(15,23,42,.55)]">
        <div className="relative min-h-[570px] overflow-hidden rounded-[2.55rem] bg-[#f7f9ff] sm:min-h-[630px]">
          <div className="absolute left-1/2 top-3 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-950" />

          <div className="flex items-center justify-between px-5 pb-4 pt-12">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-medium text-slate-400">Good morning</p>
                <p className="text-sm font-bold text-slate-900">Ready to learn?</p>
              </div>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-300 to-blue-600 ring-2 ring-white" />
          </div>

          <div className="mx-4 rounded-[1.6rem] bg-gradient-to-br from-primary via-blue-600 to-indigo-600 p-5 text-white shadow-xl shadow-blue-900/15">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]">
                Today&apos;s goal
              </span>
              <Sparkles className="h-4 w-4 text-blue-100" />
            </div>
            <p className="mt-8 text-3xl font-semibold tracking-tight">72%</p>
            <p className="mt-1 text-[11px] text-blue-100">Biology study set completed</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "72%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, delay: 0.5, ease }}
                className="h-full rounded-full bg-white"
              />
            </div>
          </div>

          <div className="px-4 pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">Quick practice</p>
              <span className="text-[10px] font-semibold text-primary">3 of 5</span>
            </div>
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold leading-5 text-slate-800">
                Which organelle produces energy for the cell?
              </p>
              <div className="mt-3 space-y-2">
                {["Nucleus", "Mitochondria", "Ribosome"].map((answer) => (
                  <div
                    key={answer}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[10px] font-medium ${
                      answer === "Mitochondria"
                        ? "border-primary/25 bg-primary/[0.06] text-primary"
                        : "border-slate-100 text-slate-500"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full ${
                        answer === "Mitochondria"
                          ? "bg-primary text-white"
                          : "border border-slate-200"
                      }`}
                    >
                      {answer === "Mitochondria" ? <Check className="h-2.5 w-2.5" /> : null}
                    </span>
                    {answer}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-x-4 bottom-4 flex items-center justify-around rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
            <BookOpenCheck className="h-4 w-4 text-primary" />
            <ScanLine className="h-4 w-4 text-slate-400" />
            <Smartphone className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 18 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6, ease }}
        className="absolute -right-8 top-28 hidden items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-3.5 py-3 text-xs font-semibold text-slate-700 shadow-xl backdrop-blur sm:flex"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Cloud className="h-4 w-4" />
        </span>
        Synced instantly
      </motion.div>
    </motion.div>
  );
}

function AppQrCode() {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_45px_rgba(15,23,42,.08)] sm:w-auto sm:gap-4">
      <div className="shrink-0 rounded-xl bg-white p-1.5">
        <QRCodeSVG
          value={mobileAppUrl}
          level="H"
          marginSize={1}
          bgColor="#ffffff"
          fgColor="#0f172a"
          className="h-20 w-20"
          imageSettings={{
            src: "/logo-icon.png",
            height: 18,
            width: 18,
            excavate: true,
          }}
        />
      </div>
      <div className="pr-3">
        <p className="text-xs font-semibold text-slate-900">Scan to get the app</p>
        <p className="mt-1 max-w-[130px] text-[10px] leading-4 text-slate-500">
          Open the camera on your phone and point it here.
        </p>
      </div>
    </div>
  );
}

export default function AppPromotionSection() {
  return (
    <section
      id="app"
      className="relative scroll-mt-20 overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(21,101,247,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(21,101,247,.035)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]" />
      <div className="pointer-events-none absolute -left-28 top-1/4 h-96 w-96 rounded-full bg-cyan-200/25 blur-[110px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="max-w-2xl"
        >
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3.5 py-1.5 text-xs font-semibold text-primary">
            <Smartphone className="h-3.5 w-3.5" />
            Neurova in your pocket
          </span>

          <h2 className="mt-6 text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-slate-950 min-[380px]:text-4xl sm:text-5xl lg:text-[3.5rem]">
            Study anywhere.
            <br />
            <span className="text-primary">Keep your momentum.</span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Take your AI study companion with you. Snap a difficult question,
            review a study set, or squeeze in a quick quiz between classes.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/[0.07] text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 sm:w-auto"
            >
              Start learning free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <AppQrCode />
          </div>
        </motion.div>

        <div className="relative mx-auto flex w-full max-w-[500px] items-center justify-center py-4 sm:min-h-[650px] sm:py-0">
          <div className="absolute aspect-square w-[min(420px,115vw)] rounded-full border border-primary/10 bg-gradient-to-br from-primary/[0.08] to-cyan-100/40" />
          <div className="absolute aspect-square w-[min(330px,92vw)] rounded-full border border-primary/10" />
          <PhonePreview />
        </div>
      </div>
    </section>
  );
}
