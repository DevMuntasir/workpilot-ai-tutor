"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export const FlipWords = ({
    words,
    duration = 2600,
    className,
}: {
    words: string[];
    duration?: number;
    className?: string;
}) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, duration);
        return () => clearInterval(interval);
    }, [duration, words.length]);

    // Sizer reserves the width of the longest word so the line never reflows.
    const longest = words.reduce((a, b) => (a.length >= b.length ? a : b));

    return (
        <span className="relative inline-block overflow-hidden align-bottom">
            {/* invisible sizer */}
            <span aria-hidden className={cn("invisible whitespace-nowrap", className)}>
                {longest}
            </span>

            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-0 top-0 z-10"
                >
                    {/* inline-block so the underline below matches the word's width */}
                    <span className={cn("relative inline-block whitespace-nowrap pb-1", className)}>
                        {words[index]}
                        {/* underline scoped to this word's width */}
                        <motion.span
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                            className="absolute bottom-0 left-0 h-0.5 w-full origin-left rounded-full bg-linear-to-r from-primary via-thirdary to-button"
                        />
                    </span>
                </motion.span>
            </AnimatePresence>
        </span>
    );
};
