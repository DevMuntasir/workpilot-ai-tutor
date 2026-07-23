"use client";

import React from "react";
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    type Variants,
} from "framer-motion";
import {
    FileText,
    Languages,
    ListChecks,
    Copy,
    FlaskConical,
    BookOpen,
    MessageSquare,
    Lightbulb,
    ArrowRight,
    Sparkles,
} from "lucide-react";

type Feature = {
    title: string;
    description: string;
    href: string;
    gradient: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    /** Tailwind grid span classes that drive the bento layout. */
    span: string;
    featured?: boolean;
};

// Order matters: it drives the bento tiling on the 6-column grid.
const features: Feature[] = [
    {
        title: "Smart Summaries",
        description:
            "Upload any document and receive concise, smart summaries and free study guide concepts in seconds.",
        href: "/summary",
        gradient: "from-button via-thirdary to-primary",
        Icon: FileText,
        span: "md:col-span-4 md:row-span-2",
        featured: true,
    },
    {
        title: "AI-Powered Chat",
        description:
            "Have a conversational study session with your AI tutor for real-time, context-aware help.",
        href: "/chat",
        gradient: "from-lime-400 to-emerald-600",
        Icon: MessageSquare,
        span: "md:col-span-2",
    },
    {
        title: "AI Quiz Generator",
        description:
            "Creates custom practice quizzes for any subject—even niche, specialized topics.",
        href: "/quiz",
        gradient: "from-violet-400 to-violet-600",
        Icon: ListChecks,
        span: "md:col-span-2",
    },
    {
        title: "Smart Flashcards",
        description:
            "A faster, free alternative to Anki. Automatically generate digital flashcards to boost memory.",
        href: "/flashcards",
        gradient: "from-amber-400 to-amber-600",
        Icon: Copy,
        span: "md:col-span-2",
    },
    {
        title: "AI Language Tutor",
        description:
            "Gamified lessons that track your XP—an engaging way to actually stick with a new language.",
        href: "/language-tutor",
        gradient: "from-rose-400 to-rose-600",
        Icon: Languages,
        span: "md:col-span-2",
    },
    {
        title: "Research Analysis",
        description:
            "Deconstruct dense academic papers into easy-to-digest summaries in moments.",
        href: "/research-analysis",
        gradient: "from-indigo-400 to-indigo-600",
        Icon: FlaskConical,
        span: "md:col-span-2",
    },
    {
        title: "Learning Paths",
        description:
            "Get a step-by-step learning plan tailored to your specific goals and current level.",
        href: "/path",
        gradient: "from-orange-400 to-orange-600",
        Icon: BookOpen,
        span: "md:col-span-3",
    },
    {
        title: "Ask Any Question",
        description:
            "Stuck? Get instant, reliable answers right at your fingertips, any time of day.",
        href: "/ask",
        gradient: "from-fuchsia-400 to-fuchsia-600",
        Icon: Lightbulb,
        span: "md:col-span-3",
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.15,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

/**
 * A bento card with a cursor-following spotlight glow (Aceternity "card spotlight"
 * pattern). The radial highlight tracks the pointer and only reveals on hover.
 */
function BentoCard({ feature }: { feature: Feature }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    // Hooks must run unconditionally, so build both spotlights up front.
    const featuredSpotlight = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.18), transparent 70%)`;
    const cardSpotlight = useMotionTemplate`radial-gradient(360px circle at ${mouseX}px ${mouseY}px, rgba(81,0,167,0.10), transparent 70%)`;

    const { title, description, href, gradient, Icon, span, featured } = feature;

    if (featured) {
        const spotlight = featuredSpotlight;

        return (
            <motion.div variants={itemVariants} className={`group h-full ${span}`}>
                <a
                    title={`Learn more about ${title}`}
                    href={href}
                    onMouseMove={handleMouseMove}
                    className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-button via-thirdary to-primary p-7 sm:p-9 text-white shadow-[0_25px_60px_rgba(81,0,167,0.30)]"
                >
                    {/* texture + ambient blobs */}
                    <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:22px_22px]" />
                    <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    {/* cursor spotlight */}
                    <motion.div
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ background: spotlight }}
                    />

                    <div className="relative z-10">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
                          
                            Most loved
                        </span>
                        <motion.div
                            className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur"
                            whileHover={{ scale: 1.08, rotate: -4 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Icon className="h-7 w-7" />
                        </motion.div>
                        <h3 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-tight">
                            {title}
                        </h3>
                        <p className="mt-3 max-w-md text-sm sm:text-base leading-relaxed text-white/85">
                            {description}
                        </p>
                    </div>

                    {/* faux summary preview to fill the large tile */}
                    <div className="relative z-10 mt-8 space-y-2.5">
                        {[
                            { w: "w-full", o: "bg-white/30" },
                            { w: "w-5/6", o: "bg-white/20" },
                            { w: "w-2/3", o: "bg-white/15" },
                        ].map((bar, i) => (
                            <div
                                key={i}
                                className={`h-2.5 ${bar.w} rounded-full ${bar.o}`}
                            />
                        ))}
                        <div className="flex items-center gap-1 pt-3 text-sm font-semibold text-white">
                            Learn more
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </div>
                </a>
            </motion.div>
        );
    }

    const spotlight = cardSpotlight;

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`group h-full ${span}`}
        >
            <a
                title={`Learn more about ${title}`}
                href={href}
                onMouseMove={handleMouseMove}
                className="relative flex h-full flex-col overflow-hidden rounded-sm border border-slate-200/70 bg-white p-6 sm:p-7 shadow-[0_10px_35px_rgba(15,23,42,0.05)] transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-[0_25px_60px_rgba(15,23,42,0.10)]"
            >
                {/* cursor spotlight */}
                <motion.div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: spotlight }}
                />
                {/* corner color bloom */}
                <div
                    className={`absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br ${gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
                />

                <motion.div
                    className={`relative z-10 mb-5 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-sm bg-gradient-to-br ${gradient} text-white shadow-lg transition-all duration-300 group-hover:shadow-xl`}
                    whileHover={{ scale: 1.08, rotate: -4 }}
                    transition={{ duration: 0.3 }}
                >
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </motion.div>

                <h3 className="relative z-10 mb-2 text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
                    {title}
                </h3>
                <p className="relative z-10 text-sm leading-relaxed text-slate-600">
                    {description}
                </p>

                <div className="relative z-10 mt-auto flex items-center gap-1 pt-5 text-sm font-semibold text-thirdary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    Learn more
                    <ArrowRight className="h-4 w-4" />
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
                        From AI-powered summaries to interactive quizzes, Neurova provides all the tools you need to learn smarter, not harder.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="grid grid-flow-row-dense auto-rows-[minmax(190px,1fr)] grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {features.map((feature) => (
                        <BentoCard key={feature.title} feature={feature} />
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mt-6 sm:mt-5"
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
                                Join thousands of students already learning smarter with Neurova. Start your free trial today and unlock your full potential.
                            </p>
                            <motion.a
                                title="Sign up for Neurova"
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
            </div>
        </section>
    );
}
