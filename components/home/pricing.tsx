import React from "react";
import { Check } from "lucide-react";

const plans = [
    {
        name: "Starter",
        description: "For small businesses and startups",
        price: "$19",
        period: "Per month",
        featured: false,
        features: [
            "3M AI Credits",
            "20 Hours of platform credits",
            "10 Projects",
            "Access to all Pro Component Blocks",
            "Access to all Pro Templates",
        ],
    },
    {
        name: "Premium",
        description: "For growing businesses",
        price: "$49",
        period: "Per month",
        featured: true,
        features: [
            "8M AI Credits",
            "50 Hours of Platform Credits",
            "20 Projects",
            "Access to all Pro Component Blocks",
            "Access to all Pro Templates",
        ],
    },
    {
        name: "Business",
        description: "For established businesses",
        price: "$99",
        period: "Per month",
        featured: false,
        features: [
            "20M AI Credits",
            "75 Hours of Platform Credits",
            "Unlimited Projects",
            "Access to all Pro Component Blocks",
            "Access to all Pro Templates",
        ],
    },
];

const enterpriseFeatures = [
    "Unlimited projects",
    "No capping on tokens",
    "No capping on sandbox usage",
    "Team support",
    "Invite members",
    "Custom user roles",
    "Custom invoicing",
    "Standard security features",
];

function FeatureItem({ children }) {
    return (
        <div className="my-5 flex items-start justify-start gap-2">
            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-700">
                <Check className="h-3 w-3 stroke-[4px] text-neutral-300" />
            </div>
            <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {children}
            </div>
        </div>
    );
}

function PlanCard({ plan }) {
    return (
        <div
            className={[
                "rounded-sm p-1 sm:p-2 md:p-3",
                plan.featured
                    ? "border border-transparent bg-white shadow ring shadow-black/10 ring-black/5 dark:bg-neutral-800"
                    : "bg-transparent dark:bg-neutral-950",
            ].join(" ")}
        >
            <div className="flex h-full flex-col justify-start gap-1 p-4">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <p className="text-base font-medium text-black sm:text-lg dark:text-white">
                            {plan.name}
                        </p>
                    </div>
                </div>

                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {plan.description}
                </p>

                <div className="my-6">
                    <div className="flex items-end">
                        <div className="flex items-start gap-1">
                            <span className="text-3xl font-medium text-neutral-800 md:text-4xl dark:text-neutral-50">
                                {plan.price}
                            </span>
                        </div>
                    </div>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {plan.period}
                    </span>
                </div>

                <button
                    className={[
                        "mt-4 mb-2 w-full cursor-pointer rounded-sm px-2 py-1.5 transition duration-200 active:scale-[0.98] md:w-full border border-transparent shadow ring shadow-black/15 ring-black/10",
                        plan.featured
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white dark:bg-neutral-900",
                    ].join(" ")}
                >
                    Get Started
                </button>

                <div className="mt-1">
                    {plan.features.map((feature) => (
                        <FeatureItem key={feature}>{feature}</FeatureItem>
                    ))}
                </div>

                <div className="p-3" />
            </div>
        </div>
    );
}

export default function PricingSection() {
    return (
        <div className="relative mx-auto my-12 flex w-full max-w-7xl flex-1 flex-col px-4 py-0 sm:my-10 md:my-20 lg:px-4">
            <h1 className="pt-4 text-center text-2xl font-bold tracking-tight text-neutral-800 md:text-4xl dark:text-neutral-100">
                Choose your Pricing Plan
            </h1>

            <p className="mx-auto mt-4 max-w-md text-center text-base text-neutral-600 dark:text-neutral-300">
                Get started with our flexible pricing plans designed to scale with your
                business needs.
            </p>

            <div className="py-4 md:py-10">
                <div className="grid w-full grid-cols-1 gap-2 p-4 sm:gap-3 md:grid-cols-2 md:gap-4 md:p-8 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <PlanCard key={plan.name} plan={plan} />
                    ))}

                    <div className="col-span-1 mt-8 md:col-span-2 lg:col-span-3">
                        <div className="relative overflow-hidden rounded-sm border border-neutral-200 p-6 md:p-8 dark:border-neutral-800">
                            <div className="grid grid-cols-1 gap-20 lg:grid-cols-3">
                                <div className="lg:col-span-1">
                                    <h3 className="mb-2 text-base font-medium text-neutral-900 md:text-2xl dark:text-neutral-100">
                                        Plan for organizations
                                    </h3>
                                    <p className="mb-6 text-sm text-neutral-600 md:text-sm dark:text-neutral-400">
                                        Need custom solutions, dedicated support, or volume pricing?
                                        Let&apos;s discuss a plan tailored specifically for your
                                        organization.
                                    </p>
                                    <button className="w-full rounded-sm bg-white px-6 py-3 font-medium text-black shadow-lg ring-1 ring-black/10 transition-colors hover:bg-neutral-100 sm:w-auto dark:bg-white dark:text-black dark:ring-white/10 dark:hover:bg-neutral-200">
                                        Contact Sales
                                    </button>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-3">
                                        {enterpriseFeatures.map((feature) => (
                                            <div
                                                key={feature}
                                                className="my-2 flex items-start justify-start gap-2"
                                            >
                                                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-neutral-700">
                                                    <Check className="h-3 w-3 stroke-[4px] text-neutral-300" />
                                                </div>
                                                <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                                    {feature}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}