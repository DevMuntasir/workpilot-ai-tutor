"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";

const navItems = [
  {
    name: "Features",
    link: "#features",
  },
  {
    name: "Pricing",
    link: "#pricing",
  },
  {
    name: "Contact",
    link: "#contact",
  },
];

export default function Nav({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className={cn("relative w-full", className)}>
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} onItemClick={closeMobileMenu} />
          <div className="flex items-center gap-4">
            <NavbarButton href="/login" variant="secondary">
              Login
            </NavbarButton>
            <NavbarButton href="#contact" variant="primary">
              Book a call
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            />
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu}>
            {navItems.map((item, idx) => (
              <motion.a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={closeMobileMenu}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.2 }}
                className="w-full rounded-md px-2 py-2 text-base font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                {item.name}
              </motion.a>
            ))}
            <div className="mt-2 flex w-full flex-col gap-3">
              <NavbarButton
                href="/login"
                onClick={closeMobileMenu}
                variant="secondary"
                className="w-full"
              >
                Login
              </NavbarButton>
              <NavbarButton
                href="#contact"
                onClick={closeMobileMenu}
                variant="primary"
                className="w-full"
              >
                Book a call
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      {children}
    </div>
  );
}


