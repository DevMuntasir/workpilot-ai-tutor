'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Folder,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Layers,
  ListChecks,
  Menu,
  NotebookPen,
  PenSquare,
  LogOut,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  X,
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { getStoredStudySetById, getStoredStudySets, type StudySet } from '@/components/study-sets/utils'
import SettingsModal, { type SettingsTab } from '@/components/settings/settings-modal'
import { deleteCurrentSession } from '@/lib/api/auth.service'
import { clearAuthBrowserState } from '@/lib/api/session-storage'
import { auth } from '@/lib/firebase'

const sectionIconMap: Record<string, any> = {
  notes: FileText,
  multipleChoice: ListChecks,
  flashcards: Layers,
  podcast: Headphones,
  tutorLesson: GraduationCap,
  writtenTests: PenSquare,
  fillInTheBlanks: NotebookPen,
  content: BookOpen,
}

function DashboardLayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  )
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>('personalizedAi')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeStudySet, setActiveStudySet] = useState<StudySet | null>(null)
  const billingState = searchParams.get('billing')

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    await deleteCurrentSession().catch(() => null)

    if (auth) {
      await signOut(auth).catch(() => null)
    }

    clearAuthBrowserState()
    router.replace('/')
    setIsLoggingOut(false)
  }

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Study Sets',
      href: '/dashboard/study-sets',
      icon: BookOpen,
    },
    {
      label: 'Syllabus Intelligence',
      href: '/dashboard/syllabus-intelligence',
      icon: Sparkles,
    },
    {
      label: 'Paper Grader',
      href: '/dashboard/paper-grader',
      icon: ClipboardCheck,
    },
    
  ]

  const studySetId = useMemo(() => {
    const matches = pathname.match(/^\/dashboard\/study-sets\/([^/]+)$/)
    return matches?.[1] ? decodeURIComponent(matches[1]) : null
  }, [pathname])

  const isStudySetDetail = Boolean(studySetId)

  useEffect(() => {
    if (!isStudySetDetail || !studySetId) {
      setActiveStudySet(null)
      return
    }

    const stored = getStoredStudySetById(studySetId)
    if (stored) {
      setActiveStudySet(stored)
      return
    }

    const fallback = getStoredStudySets().find((set) => set.id === studySetId) ?? null
    setActiveStudySet(fallback)
  }, [isStudySetDetail, studySetId])

  useEffect(() => {
    if (isStudySetDetail) {
      setSidebarOpen(true)
    }
  }, [isStudySetDetail])

  useEffect(() => {
    if (!billingState) {
      return
    }

    setSettingsInitialTab('billing')
    setShowSettingsModal(true)
  }, [billingState])

  const currentMode = searchParams.get('mode')
  const defaultMode =
    activeStudySet?.sections.find((section) => section.type === 'notes')?.type ??
    activeStudySet?.sections[0]?.type ??
    null
  const activeMode = currentMode || defaultMode
  const activeStudySetId = activeStudySet?.id ?? studySetId ?? ''

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={`${
          sidebarOpen ? 'w-[300px]' : 'w-0'
        } bg-sidebar transition-all duration-300 overflow-hidden flex flex-col border-r border-sidebar-border`}
      >
        <div className="h-[70px] items-center px-6 flex items-center border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="text-3xl font-bold text-primary">WorkPilot</div>
          </Link>
          {/* {isStudySetDetail && activeStudySet && (
            <p className="mt-2 line-clamp-2 text-xs font-medium text-sidebar-foreground/80">
              {activeStudySet.title}
            </p>
          )} */}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-auto">
          {isStudySetDetail ? (
            <>
              <Link
                href="/dashboard/study-sets"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">All Study Sets</span>
              </Link>

              {activeStudySet?.sections.map((section) => {
                const Icon = sectionIconMap[section.type] ?? Sparkles
                const sectionHref = `/dashboard/study-sets/${encodeURIComponent(activeStudySetId)}?mode=${encodeURIComponent(section.type)}`
                const isActive = section.type === activeMode

                return (
                  <Link
                    key={section.type}
                    href={sectionHref}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </Link>
                )
              })}

              <button
                type="button"
                onClick={() => {
                  setSettingsInitialTab('personalizedAi')
                  setShowSettingsModal(true)
                }}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </>
          ) : (
            <>
              {navItems.map((item) => {
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}

              <button
                type="button"
                onClick={() => {
                  setSettingsInitialTab('personalizedAi')
                  setShowSettingsModal(true)
                }}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <button
            type="button"
            onClick={() => {
              setSettingsInitialTab('billing')
              setShowSettingsModal(true)
            }}
            className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Upgrade to Unlimited
          </button>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
              M
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">Muntasir</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border px-4 py-2.5 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {!isStudySetDetail && (
          <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between h-[70px]">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded-lg transition-colors text-sm font-medium">
                <Folder className="w-4 h-4" />
                Folders
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>

      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} initialTab={settingsInitialTab} />
      )}
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<DashboardLayoutShell>{children}</DashboardLayoutShell>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}
