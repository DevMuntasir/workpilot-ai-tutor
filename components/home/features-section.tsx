"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import {
    FileText,
    Languages,
    ListChecks,
    Copy,
    FlaskConical,
    BookOpen,
    BrainCircuit,
    MessageSquare,
    Lightbulb,
    ArrowRight,
    Sparkles,
} from "lucide-react";

const features = [
    {
        title: "Smart Summaries",
        description:
            "Upload any document and receive concise, smart summaries and free study guide concepts in seconds.",
        href: "/summary",
        gradient: "from-emerald-400 to-emerald-600",
        Icon: FileText,
    },
    {
        title: "AI Language Tutor",
        description:
            "Gamified lessons tracking your XP. The best japanese study app and an engaging alternative to a brain rot study tool.",
        href: "/language-tutor",
        gradient: "from-rose-400 to-rose-600",
        Icon: Languages,
    },
    {
        title: "AI Quiz Generator",
        description:
            "Creates custom practice quizzes for any subject—even niche topics like the f5 application study tool.",
        href: "/quiz",
        gradient: "from-violet-400 to-violet-600",
        Icon: ListChecks,
    },
    {
        title: "Smart Flashcards",
        description:
            "A faster, free alternative to the anki study tool. Automatically create digital flashcards to boost memory.",
        href: "/flashcards",
        gradient: "from-amber-400 to-amber-600",
        Icon: Copy,
    },
    {
        title: "Research Analysis",
        description:
            "Deconstruct dense academic papers into easy-to-digest summaries using our turbo ai study tool engine.",
        href: "/research-analysis",
        gradient: "from-indigo-400 to-indigo-600",
        Icon: FlaskConical,
    },
    {
        title: "Learning Paths",
        description:
            "Get a step-by-step learning plan from your AI study tool for students, tailored to your specific goals.",
        href: "/path",
        gradient: "from-orange-400 to-orange-600",
        Icon: BookOpen,
    },
    
    {
        title: "AI-Powered Chat",
        description:
            "Have a conversational study session with your AI tutor, recognized as the best ai study tool for real-time help.",
        href: "/chat",
        gradient: "from-lime-400 to-lime-600",
        Icon: MessageSquare,
    },
    {
        title: "Ask Any Question",
        description:
            "Stuck? Get instant answers from the best free study apps 2026 partner right at your fingertips.",
        href: "/ask",
        gradient: "from-fuchsia-400 to-fuchsia-600",
        Icon: Lightbulb,
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

function FeatureCard({ title, description, href, gradient, Icon, index }:{
    title: string;
    description: string;
    href: string;
    gradient: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    index: number;
}) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative h-full"
        >
            <a
                title={`Learn more about ${title}`}
                href={href}
                className="block h-full"
            >
                <div className="relative h-full rounded-3xl overflow-hidden bg-white border border-slate-200/70 p-6 sm:p-7 shadow-[0_10px_35px_rgba(15,23,42,0.05)] transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-[0_25px_60px_rgba(15,23,42,0.10)]">
                    <div
                        className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br ${gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
                    />

                    <motion.div
                        className={`relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
                        whileHover={{ scale: 1.08, rotate: -4 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </motion.div>

                    <h3 className="relative z-10 text-lg sm:text-xl font-semibold mb-2 text-slate-900 tracking-tight">
                        {title}
                    </h3>
                    <p className="relative z-10 text-slate-600 text-sm leading-relaxed">
                        {description}
                    </p>

                    <div className="relative z-10 mt-5 flex items-center gap-1 text-sm font-semibold text-thirdary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                        Learn more
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </div>
            </a>
        </motion.div>
    );
}

export default function FeaturesSection() {
    return (
        <section
            id="features"
            className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden"
        >
            <div className="absolute left-[-6rem] top-24 h-72 w-72 rounded-full bg-thirdary/10 blur-3xl" />
            <div className="absolute right-[-4rem] bottom-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative max-w-7xl mx-auto">
                <motion.div
                    className="text-center mb-14 sm:mb-16 max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.span
                        className="inline-flex items-center gap-2 rounded-full border border-thirdary/15 bg-white/85 px-4 py-1.5 text-xs sm:text-sm font-medium text-thirdary shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur mb-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Sparkles className="h-4 w-4" />
                        Powerful Features
                    </motion.span>
                    <motion.h2
                        className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-5 text-slate-950 tracking-[-0.03em] leading-[1.1]"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Everything you need to{" "}
                        <span className="bg-gradient-to-r from-button via-thirdary to-primary bg-clip-text text-transparent">
                            master any subject
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-slate-600 text-base sm:text-lg leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        From AI-powered summaries to interactive quizzes, WorkPilot provides all the tools you need to learn smarter, not harder.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {features.map((feature, index) => (
                        <FeatureCard key={feature.title} {...feature} index={index} />
                    ))}

                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-2 lg:col-span-3 xl:col-span-4"
                    >
                        <div className="relative group h-full rounded-3xl overflow-hidden bg-gradient-to-r from-button via-thirdary to-primary p-8 sm:p-12 flex flex-col justify-center items-center text-center shadow-[0_25px_60px_rgba(81,0,167,0.25)]">
                            <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:22px_22px]" />
                            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                            <motion.div
                                className="relative z-10 text-white"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 tracking-tight">
                                    Ready to transform your learning?
                                </h3>
                                <p className="text-white/85 mb-8 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                                    Join thousands of students already learning smarter with WorkPilot. Start your free trial today and unlock your full potential.
                                </p>
                                <motion.a
                                    title="Sign up for WorkPilot"
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-white text-thirdary hover:bg-white/90 px-8 sm:px-10 py-3.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                    href="/signup"
                                    whileHover={{ scale: 1.04, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Get Started Free
                                    <ArrowRight className="h-4 w-4" />
                                </motion.a>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
