'use client'

import Link from 'next/link'
import { Folder, LogOut, Menu, Search, Settings as SettingsIcon, type LucideIcon, X } from 'lucide-react'

export type PortalNavItem = {
  label: string
  href: string
  icon: LucideIcon
  isActive?: boolean
}

type PortalShellProps = {
  children: React.ReactNode
  brandHref: string
  brandLabel: string
  navItems: PortalNavItem[]
  sidebarOpen: boolean
  onSidebarToggle: () => void
  onLogout: () => void
  isLoggingOut?: boolean
  showHeader?: boolean
  onOpenSettings?: () => void
  onOpenBilling?: () => void
  footerPrimaryActionLabel?: string
  footerProfileName?: string
  footerProfileInitial?: string
  footerProfileSubtitle?: string
}

export function PortalShell({
  children,
  brandHref,
  brandLabel,
  navItems,
  sidebarOpen,
  onSidebarToggle,
  onLogout,
  isLoggingOut = false,
  showHeader = true,
  onOpenSettings,
  onOpenBilling,
  footerPrimaryActionLabel = 'Upgrade to Unlimited',
  footerProfileName = 'Muntasir',
  footerProfileInitial = 'M',
  footerProfileSubtitle,
}: PortalShellProps) {
  return (
    <div className="flex h-screen bg-background">
      <aside
        className={`${
          sidebarOpen ? 'w-[300px]' : 'w-0'
        } bg-sidebar transition-all duration-300 overflow-hidden flex flex-col border-r border-sidebar-border`}
      >
        <div className="h-[70px] items-center px-6 flex items-center border-b border-sidebar-border">
          <Link href={brandHref} className="flex items-center gap-2">
            <div className="text-3xl font-bold text-primary">{brandLabel}</div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-auto">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  item.isActive
                    ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}

          {onOpenSettings ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
          ) : null}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          {onOpenBilling ? (
            <button
              type="button"
              onClick={onOpenBilling}
              className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {footerPrimaryActionLabel}
            </button>
          ) : null}
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
              {footerProfileInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{footerProfileName}</p>
              {footerProfileSubtitle ? (
                <p className=" text-[11px] text-sidebar-foreground/70 truncate">{footerProfileSubtitle}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border px-4 py-2.5 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {showHeader ? (
          <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between h-[70px]">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onSidebarToggle}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button type="button" className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded-lg transition-colors text-sm font-medium"
              >
                <Folder className="w-4 h-4" />
                Folders
              </button>
            </div>
          </header>
        ) : null}

        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  )
}
