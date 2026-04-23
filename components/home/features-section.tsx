import React from "react";
import {
    ClipboardCheck,
    FileText,
    Languages,
    ListChecks,
    Copy,
    Mic,
    FlaskConical,
    Share2,
    BookOpen,
    BrainCircuit,
    Clock,
    MessageSquare,
    Lightbulb,
} from "lucide-react";

const features = [
    
    {
        title: "Smart Summaries",
        description:
            "Upload any document and receive concise, smart summaries and free study guide concepts in seconds.",
        href: "/summary",
        gradient: "from-green-400 to-green-600",
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
        gradient: "from-purple-400 to-purple-600",
        Icon: ListChecks,
    },
    {
        title: "Smart Flashcards",
        description:
            "A faster, free alternative to the anki study tool. Automatically create digital flashcards to boost memory.",
        href: "/flashcards",
        gradient: "from-yellow-400 to-yellow-600",
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
        title: "Explain Concepts",
        description:
            "Need explanations as simple as a brainrot study tool free or as strategic as a lebron ai study tool? We do it all.",
        href: "/explain",
        gradient: "from-teal-400 to-teal-600",
        Icon: BrainCircuit,
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

function FeatureCard({ title, description, href, gradient, Icon }:{
    title: string;
    description: string;
    href: string;
    gradient: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
    return (
        <div className="rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-border/50 bg-card/40 backdrop-blur-md" >
            <a
                title={`Learn more about ${title}`}
                className="group block p-8 relative hover:text-white transition-colors duration-500 h-full overflow-hidden"
                href={href}
            >
                <div
                    className={`absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br ${gradient} opacity-10 transition-transform duration-500 ease-in-out group-hover:scale-[15] group-hover:opacity-100`}
                />

                <div className="relative z-10 flex flex-col h-full" >
                    <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md bg-gradient-to-br ${gradient} text-white group-hover:scale-110 transition-transform duration-300`}
                    >
                        <Icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="text-xl font-bold mb-3" > {title} </h3>
                    <p className="text-muted-foreground group-hover:text-white/90 transition-colors duration-300 text-sm leading-relaxed flex-grow" >
                        {description}
                    </p>
                </div>
            </a>
        </div>
    );
}

export default function FeaturesSection() {
    return (
        <section
            id="features"
            className="py-28 max-w-7xl mx-auto bg-background bg-dot-pattern relative overflow-hidden"
        >
            <div className="container mx-auto px-4 relative" >
                <div className="text-center mb-20" >
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight" >
                        A Smart Study Partner with Every Tool You Need
                    </h2>
                    <p className="max-w-3xl mx-auto text-muted-foreground text-lg" >
                        STURIO is your ultimate free study partner.From a powerful quiz
                        generator to instant flashcards, our best ai study tool features
                        help you understand complex topics and ace any exam.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" >
                    {
                        features.map((feature) => (
                            <FeatureCard key={feature.title} {...feature} />
                        ))
                    }

                    <div className="rounded-3xl overflow-hidden md:col-span-2 lg:col-span-1 xl:col-span-3 relative group bg-gradient-to-br from-zinc-900 to-black flex flex-col justify-center items-center text-center p-12 transition-all duration-500 shadow-2xl border border-zinc-800" >
                        <div
                            className="absolute inset-0 opacity-[0.08] mix-blend-overlay bg-cover bg-center"
                            style={{
                                backgroundImage: "url('https://files.catbox.moe/t4r02z.jpg')",
                            }
                            }
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                        <div className="relative z-10 text-white" >
                            <h3 className="text-3xl md:text-4xl font-extrabold mb-5 tracking-tight" >
                                The Ultimate Free AI Study Tool
                            </h3>
                            <p className="text-white/80 mb-10 max-w-xl mx-auto text-lg leading-relaxed" >
                                Stop switching between apps.STURIO combines every study tool ai
                                you need into one smart platform.Change the way you learn,
                                forever.
                            </p>
                            < a
                                title="Sign up for STURIO"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 hover:from-yellow-500 hover:to-yellow-600 h-11 rounded-full font-bold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 px-10 py-7 text-lg hover:-translate-y-1 transition-all"
                                href="/signup"
                            >
                                Unlock All Features
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
