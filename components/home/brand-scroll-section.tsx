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

type BrandScrollerProps = {
    brands?: string[];
    baseVelocity?: number;
    className?: string;
};

function BrandRow({
    brands,
    baseVelocity = 4,
}: {
    brands: string[];
    baseVelocity?: number;
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
    const directionFactor = useRef(1);

    useAnimationFrame((_, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
        const vf = velocityFactor.get();

        if (vf < 0) directionFactor.current = -1;
        else if (vf > 0) directionFactor.current = 1;

        moveBy += directionFactor.current * moveBy * Math.abs(vf);
        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div className="overflow-hidden whitespace-nowrap py-4">
            <motion.div className="flex w-max gap-6" style={{ x }}>
                {Array.from({ length: 4 }).map((_, groupIndex) => (
                    <div key={groupIndex} className="flex shrink-0 gap-6">
                        {brands.map((brand, index) => (
                            <div
                                key={`${groupIndex}-${brand}-${index}`}
                                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white backdrop-blur-sm sm:px-8 sm:py-4 sm:text-base"
                            >
                                {brand}
                            </div>
                        ))}
                    </div>
                ))}
            </motion.div>
        </div>
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
        <section className="min-h-screen bg-neutral-950  py-20 text-white ">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 max-w-2xl">
                    <p className="mb-3 text-sm uppercase tracking-[0.35em] text-white/50">
                        Brand Showcase
                    </p>
                    <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
                        Scroll korle brand name gulo velocity-r sathe smoothly move korbe
                    </h2>
                    <p className="mt-4 text-base text-white/65 sm:text-lg">
                        Framer Motion er scroll velocity technique use kore ekta premium brand
                        ticker effect.
                    </p>
                </div>

            </div>
                <div className="space-y-2 ">
                    <BrandRow brands={brandsTop} baseVelocity={-1} />
                    <BrandRow brands={brandsBottom} baseVelocity={1} />
                </div>
        </section>
    );
}
