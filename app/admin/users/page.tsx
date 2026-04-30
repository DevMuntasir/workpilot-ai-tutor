'use client'

import Link from 'next/link'
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchAdminUsers, getApiClientErrorMessage, type AdminUser, updateAdminUser } from '@/lib/api'

type ActiveFilterValue = 'all' | 'true' | 'false'

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Never'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [role, setRole] = useState('')
  const [plan, setPlan] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilterValue>('all')
  const [limit, setLimit] = useState('20')
  const [currentCursor, setCurrentCursor] = useState<string | null>(null)
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [updatingUserIds, setUpdatingUserIds] = useState<string[]>([])

  const deferredSearch = useDeferredValue(searchInput.trim())
  const hasActiveFilters =
    deferredSearch.length > 0 || role.trim().length > 0 || plan.trim().length > 0 || activeFilter !== 'all'

  useEffect(() => {
    const abortController = new AbortController()

    async function loadUsers() {
      setErrorMessage('')
      setIsLoading(true)

      try {
        const result = await fetchAdminUsers(
          {
            limit: Number(limit),
            cursor: currentCursor,
            role: role.trim() || undefined,
            plan: plan.trim() || undefined,
            isActive:
              activeFilter === 'all'
                ? undefined
                : activeFilter === 'true',
            search: deferredSearch || undefined,
          },
          abortController.signal,
        )

        setUsers(result.data)
        setNextCursor(result.nextCursor)
      } catch (error) {
        if (abortController.signal.aborted) {
          return
        }

        setUsers([])
        setNextCursor(null)
        setErrorMessage(getApiClientErrorMessage(error, 'Failed to load users.'))
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    void loadUsers()

    return () => {
      abortController.abort()
    }
  }, [activeFilter, currentCursor, deferredSearch, limit, plan, reloadKey, role])

  const totalActiveUsers = useMemo(
    () => users.filter((user) => user.is_active).length,
    [users],
  )

  const totalTokenBalance = useMemo(
    () => users.reduce((sum, user) => sum + user.token_balance, 0),
    [users],
  )

  const resetPagination = () => {
    startTransition(() => {
      setCurrentCursor(null)
      setCursorHistory([])
    })
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setReloadKey((current) => current + 1)
  }

  const handleNextPage = () => {
    if (!nextCursor || isLoading) {
      return
    }

    startTransition(() => {
      setCursorHistory((current) => [...current, currentCursor])
      setCurrentCursor(nextCursor)
    })
  }

  const handlePreviousPage = () => {
    if (cursorHistory.length === 0 || isLoading) {
      return
    }

    const previousCursor = cursorHistory[cursorHistory.length - 1] ?? null

    startTransition(() => {
      setCursorHistory((current) => current.slice(0, -1))
      setCurrentCursor(previousCursor)
    })
  }

  const handleToggleUserActive = async (userId: string, nextValue: boolean) => {
    setErrorMessage('')
    setUpdatingUserIds((current) => [...current, userId])
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, is_active: nextValue } : user)),
    )

    try {
      await updateAdminUser(userId, { is_active: nextValue })
    } catch (error) {
      setUsers((current) =>
        current.map((user) => (user.id === userId ? { ...user, is_active: !nextValue } : user)),
      )
      setErrorMessage(getApiClientErrorMessage(error, 'Failed to update user status.'))
    } finally {
      setUpdatingUserIds((current) => current.filter((id) => id !== userId))
    }
  }

  return (
    <section className="p-4 md:p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Users
        </h1>

        <div className="rounded-3xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <label className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Search
                  </span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchInput}
                      onChange={(event) => {
                        setSearchInput(event.target.value)
                        resetPagination()
                      }}
                      placeholder="Name or email"
                      className="pl-9"
                    />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Role
                  </span>
                  <Input
                    value={role}
                    onChange={(event) => {
                      setRole(event.target.value)
                      resetPagination()
                    }}
                    placeholder="student"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Plan
                  </span>
                  <Input
                    value={plan}
                    onChange={(event) => {
                      setPlan(event.target.value)
                      resetPagination()
                    }}
                    placeholder="free"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Status
                  </span>
                  <Select
                    value={activeFilter}
                    onValueChange={(value) => {
                      setActiveFilter(value as ActiveFilterValue)
                      resetPagination()
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Limit
                  </span>
                  <Select
                    value={limit}
                    onValueChange={(value) => {
                      setLimit(value)
                      resetPagination()
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="20" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchInput('')
                    setRole('')
                    setPlan('')
                    setActiveFilter('all')
                    setLimit('20')
                    startTransition(() => {
                      setCurrentCursor(null)
                      setCursorHistory([])
                    })
                  }}
                  disabled={!hasActiveFilters && limit === '20' && currentCursor === null}
                >
                  Reset
                </Button>
                <Button type="button" variant="outline" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}
          </div>

          <div className="p-5">
            <div className="rounded-2xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4">User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Last Login</TableHead>
                    {/* <TableHead>Created</TableHead> */}
                    <TableHead className="pr-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="px-4 py-12">
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                          <Users className="h-10 w-10 text-muted-foreground/60" />
                          <div>
                            <p className="font-medium text-foreground">No users found</p>
                            <p className="text-sm text-muted-foreground">
                              Adjust the current filters or refresh the list.
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="px-4 py-4">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {user.display_name?.trim() || 'Unnamed user'}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{user.plan || 'N/A'}</TableCell>
                        <TableCell>{user.token_balance}</TableCell>
                        <TableCell>{formatDateTime(user.last_login_at)}</TableCell>
                        {/* <TableCell>{formatDateTime(user.created_at)}</TableCell> */}
                        <TableCell className="pr-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={user.is_active}
                                onCheckedChange={(checked) => {
                                  void handleToggleUserActive(user.id, checked)
                                }}
                                disabled={updatingUserIds.includes(user.id)}
                                aria-label={`Set ${user.email} as ${user.is_active ? 'inactive' : 'active'}`}
                              />
                              <span className="text-xs font-medium text-muted-foreground">
                                {updatingUserIds.includes(user.id)
                                  ? 'Saving...'
                                  : user.is_active
                                    ? 'Active'
                                    : 'Inactive'}
                              </span>
                            </div>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/credits?userId=${user.id}`}>Credits</Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/users/${user.id}`}>View</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {users.length > 0
                  ? `Showing ${users.length} user${users.length === 1 ? '' : 's'} per page.`
                  : 'No user records are currently loaded.'}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={cursorHistory.length === 0 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={handleNextPage}
                  disabled={!nextCursor || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
