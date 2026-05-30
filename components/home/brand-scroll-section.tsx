"use client"

import React, { useRef } from "react";
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useScroll,
    useSpring,
    useTransform,
    useVelocity,
} from "framer-motion";

const wrap = (min: number, max: number, v: number) => {
    const range = max - min;
    return ((((v - min) % range) + range) % range) + min;
};

function BrandRow({
    brands,
    baseVelocity = 4,
    direction = 1,
}: {
    brands: string[];
    baseVelocity?: number;
    direction?: number;
}) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 100,
        stiffness: 100,
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false,
    });

    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
    const directionFactor = useRef(direction);

    useAnimationFrame((_, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
        const vf = velocityFactor.get();

        if (vf < 0) directionFactor.current = -1;
        else if (vf > 0) directionFactor.current = 1;

        moveBy += directionFactor.current * moveBy * Math.abs(vf);
        baseX.set(baseX.get() + moveBy);
    });

    return (
        <motion.div
            className="overflow-hidden whitespace-nowrap py-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
        >
            <motion.div className="flex w-max gap-4 sm:gap-6" style={{ x }}>
                {Array.from({ length: 4 }).map((_, groupIndex) => (
                    <div key={groupIndex} className="flex shrink-0 gap-4 sm:gap-6">
                        {brands.map((brand, index) => (
                            <motion.div
                                key={`${groupIndex}-${brand}-${index}`}
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="group relative rounded-full border border-white/20 bg-gradient-to-br from-white/10 to-white/5 px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:from-white/20 hover:to-white/10 shadow-lg hover:shadow-xl"
                            >
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-button via-thirdary to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-lg" />
                                <span className="relative">{brand}</span>
                            </motion.div>
                        ))}
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}

export default function BrandScrollVelocitySection() {
    const brandsTop = [
        "Apple",
        "Google",
        "Spotify",
        "Netflix",
        "Adobe",
        "Notion",
        "Figma",
        "Slack",
    ];

    const brandsBottom = [
        "Stripe",
        "Framer",
        "Linear",
        "Airbnb",
        "Vercel",
        "Webflow",
        "Shopify",
        "OpenAI",
    ];

    return (
        <section className="relative bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 py-20 sm:py-24 text-white overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/3 bg-thirdary/25 rounded-full blur-3xl" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    className="mb-12 sm:mb-14 max-w-2xl mx-auto text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.p
                        className="mb-4 text-xs sm:text-sm uppercase tracking-[0.35em] text-white/50 font-semibold"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Trusted by Industry Leaders
                    </motion.p>
                    <motion.h2
                        className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-[-0.03em] mb-5"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Trusted by thousands of learners worldwide
                    </motion.h2>
                    <motion.p
                        className="text-sm sm:text-base md:text-lg text-white/60 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        Join thousands of students already learning smarter with our AI-powered platform.
                    </motion.p>
                </motion.div>

                <div className="space-y-3 sm:space-y-4 mt-10 hero-marquee-mask">
                    <BrandRow brands={brandsTop} baseVelocity={-1} direction={-1} />
                    <BrandRow brands={brandsBottom} baseVelocity={1} direction={1} />
                </div>
            </div>
        </section>
    );
}
