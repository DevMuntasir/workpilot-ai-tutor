export default function Footer() {
    const pages = ["All Products", "Studio", "Clients", "Pricing", "Blog"];
    const socials = ["Facebook", "Instagram", "Twitter", "LinkedIn"];
    const legal = ["Privacy Policy", "Terms of Service", "Cookie Policy"];
    const register = ["Sign Up", "Login", "Forgot Password"];

    return (
        <footer className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-neutral-950">
                <div className="w-full rounded-lg">
                    <div className="relative flex min-h-[350px] w-full items-center justify-center p-2 sm:p-10">
                        <div className="relative w-full overflow-hidden border-t border-neutral-100 bg-white px-8 py-20 dark:border-white/[0.1] dark:bg-neutral-950">
                            <div className="mx-auto flex max-w-7xl flex-col items-start justify-between text-sm text-neutral-500 sm:flex-row md:px-8">
                                <div>
                                    <div className="mb-4 mr-0 md:mr-4 md:flex">
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
                                    </div>
                                    <div className="ml-2 mt-2">© copyright DevStudios 2024. All rights reserved.</div>
                                </div>

                                <div className="mt-10 grid grid-cols-2 items-start gap-10 sm:mt-0 md:mt-0 lg:grid-cols-4">
                                    <FooterColumn title="Pages" items={pages} />
                                    <FooterColumn title="Socials" items={socials} />
                                    <FooterColumn title="Legal" items={legal} />
                                    <FooterColumn title="Register" items={register} />
                                </div>
                            </div>

                            <p className="inset-x-0 mt-20 bg-gradient-to-b from-neutral-50 to-neutral-200 bg-clip-text text-center text-5xl font-bold text-transparent md:text-9xl lg:text-[12rem] xl:text-[13rem] dark:from-neutral-950 dark:to-neutral-800">
                                WorkPilot.AI
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, items }) {
    return (
        <div className="flex w-full flex-col justify-center space-y-4">
            <p className="font-bold text-neutral-600 transition-colors hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100">
                {title}
            </p>
            <ul className="list-none space-y-4 text-neutral-600 transition-colors dark:text-neutral-300">
                {items.map((item) => (
                    <li key={item} className="list-none">
                        <a href="#" className="transition-colors hover:text-neutral-800 dark:hover:text-neutral-100">
                            {item}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
