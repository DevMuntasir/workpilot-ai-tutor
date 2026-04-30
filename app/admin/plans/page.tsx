'use client'

import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle, PanelsTopLeft, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetchAdminPlans, getApiClientErrorMessage, type AdminPlan } from '@/lib/api'

function formatDateTime(value: string | null) {
  if (!value) {
    return 'N/A'
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

function formatPrice(value: number | null) {
  if (value === null) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const abortController = new AbortController()

    async function loadPlans() {
      setErrorMessage('')
      setIsLoading(true)

      try {
        const result = await fetchAdminPlans(abortController.signal)
        setPlans(result)
      } catch (error) {
        if (abortController.signal.aborted) {
          return
        }

        setPlans([])
        setErrorMessage(getApiClientErrorMessage(error, 'Failed to load plans.'))
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    void loadPlans()

    return () => {
      abortController.abort()
    }
  }, [reloadKey])

  const activePlansCount = useMemo(
    () => plans.filter((plan) => plan.isActive).length,
    [plans],
  )

  const handleRefresh = () => {
    setIsRefreshing(true)
    setReloadKey((current) => current + 1)
  }

  return (
    <section className="p-4 md:p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Plans
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {plans.length} total plans, {activePlansCount} active.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={handleRefresh} disabled={isLoading || isRefreshing}>
            {isRefreshing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-sm">


          {errorMessage ? (
            <div className="border-b border-destructive/20 bg-destructive/5 px-5 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          <div className="p-5">
            {isLoading ? (
              <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading plans...
              </div>
            ) : plans.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
                No plans found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Monthly Credits</TableHead>
                    <TableHead>Monthly Price</TableHead>
                    <TableHead>Status</TableHead>
              
                    {/* <TableHead>Stripe Price</TableHead> */}
       
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{plan.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs uppercase">{plan.code}</TableCell>
                      <TableCell>{plan.monthlyCreditAllotment ?? 'N/A'}</TableCell>
                      <TableCell>{formatPrice(plan.priceMonthly)}</TableCell>
                      <TableCell>
                        <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    
                      {/* <TableCell className="max-w-48 truncate font-mono text-xs">
                        {plan.stripeMonthlyPriceId ?? 'N/A'}
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
