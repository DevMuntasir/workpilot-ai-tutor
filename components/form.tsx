import React from "react";

export default function SignInForm() {
    return (
        <form className="mx-auto flex h-screen max-w-lg flex-col items-center justify-center">
            <a
                href="/"
                className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black dark:text-white"
            >
                <img
                    src="https://assets.aceternity.com/logo-dark.png"
                    alt="logo"
                    width={30}
                    height={30}
                />
                <span className="font-medium">DevStudio</span>
            </a>

            <h1 className="my-4 text-xl font-bold text-neutral-800 dark:text-neutral-100 md:text-4xl">
                Sign in to your account
            </h1>

            <div className="flex w-full flex-col gap-4 sm:flex-row">
                <SocialButton icon={<GitHubIcon />} label="Login with GitHub" />
                <SocialButton icon={<GoogleIcon />} label="Login with Google" />
            </div>

            <div className="my-6 h-px w-full bg-neutral-100 dark:bg-neutral-800" />

            <input
                type="email"
                placeholder="support@aceternity.com"
                className="shadow-input mb-[10px] block h-10 w-full rounded-md border-0 bg-white px-4 py-1.5 pl-4 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:bg-neutral-900 dark:text-white sm:text-sm sm:leading-6"
            />

            <button
                type="submit"
                className="group/btn relative w-full rounded-lg bg-black px-4 py-3 text-white dark:bg-white dark:text-black"
            >
                <div className="absolute inset-0 h-full w-full transform opacity-0 transition duration-200 group-hover/btn:opacity-100">
                    <div className="absolute -left-px -top-px h-4 w-4 rounded-tl-lg border-l-2 border-t-2 border-black bg-transparent transition-all duration-200 group-hover/btn:-left-4 group-hover/btn:-top-4 dark:border-white" />
                    <div className="absolute -right-px -top-px h-4 w-4 rounded-tr-lg border-r-2 border-t-2 border-black bg-transparent transition-all duration-200 group-hover/btn:-right-4 group-hover/btn:-top-4 dark:border-white" />
                    <div className="absolute -bottom-px -left-px h-4 w-4 rounded-bl-lg border-b-2 border-l-2 border-black bg-transparent transition-all duration-200 group-hover/btn:-bottom-4 group-hover/btn:-left-4 dark:border-white" />
                    <div className="absolute -bottom-px -right-px h-4 w-4 rounded-br-lg border-b-2 border-r-2 border-black bg-transparent transition-all duration-200 group-hover/btn:-bottom-4 group-hover/btn:-right-4 dark:border-white" />
                </div>
                <span className="text-sm">Continue with Email</span>
            </button>
        </form>
    );
}

function SocialButton({ icon, label }) {
    return (
        <button
            type="button"
            className="flex flex-1 items-center justify-center space-x-2 rounded-md border border-neutral-200 bg-gray-100 px-4 py-3 text-neutral-700 shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)_inset] transition duration-200 hover:bg-gray-100/80 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 dark:shadow-[0px_1.5px_0px_0px_rgba(255,255,255,0.05)_inset]"
        >
            {icon}
            <span className="text-sm">{label}</span>
        </button>
    );
}

function GitHubIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-neutral-700 dark:text-neutral-300"
        >
            <path
                d="M5.315 2.1c.791 -.113 1.9 .145 3.333 .966l.272 .161l.16 .1l.397 -.083a13.3 13.3 0 0 1 4.59 -.08l.456 .08l.396 .083l.161 -.1c1.385 -.84 2.487 -1.17 3.322 -1.148l.164 .008l.147 .017l.076 .014l.05 .011l.144 .047a1 1 0 0 1 .53 .514a5.2 5.2 0 0 1 .397 2.91l-.047 .267l-.046 .196l.123 .163c.574 .795 .93 1.728 1.03 2.707l.023 .295l.007 .272c0 3.855 -1.659 5.883 -4.644 6.68l-.245 .061l-.132 .029l.014 .161l.008 .157l.004 .365l-.002 .213l-.003 3.834a1 1 0 0 1 -.883 .993l-.117 .007h-6a1 1 0 0 1 -.993 -.883l-.007 -.117v-.734c-1.818 .26 -3.03 -.424 -4.11 -1.878l-.535 -.766c-.28 -.396 -.455 -.579 -.589 -.644l-.048 -.019a1 1 0 0 1 .564 -1.918c.642 .188 1.074 .568 1.57 1.239l.538 .769c.76 1.079 1.36 1.459 2.609 1.191l.001 -.678l-.018 -.168a5.03 5.03 0 0 1 -.021 -.824l.017 -.185l.019 -.12l-.108 -.024c-2.976 -.71 -4.703 -2.573 -4.875 -6.139l-.01 -.31l-.004 -.292a5.6 5.6 0 0 1 .908 -3.051l.152 -.222l.122 -.163l-.045 -.196a5.2 5.2 0 0 1 .145 -2.642l.1 -.282l.106 -.253a1 1 0 0 1 .529 -.514l.144 -.047l.154 -.03z"
                fill="currentColor"
                strokeWidth="0"
            />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-neutral-700 dark:text-neutral-300"
        >
            <path
                d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z"
                fill="currentColor"
                strokeWidth="0"
            />
        </svg>
    );
}
