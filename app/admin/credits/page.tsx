'use client'

import { Suspense, type FormEvent, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Coins, LoaderCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adjustAdminCredits, getApiClientErrorMessage } from '@/lib/api'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default function AdminCreditsPage() {
  return (
    <Suspense fallback={<AdminCreditsPageFallback />}>
      <AdminCreditsPageContent />
    </Suspense>
  )
}

function AdminCreditsPageFallback() {
  return (
    <section className="p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Adjust Credits</h1>
        <Card className="border-border/70 shadow-[0_22px_70px_rgba(15,23,42,0.06)]">
          <CardContent className="py-6 text-sm text-muted-foreground">Loading credit adjustment form...</CardContent>
        </Card>
      </div>
    </section>
  )
}

function AdminCreditsPageContent() {
  const searchParams = useSearchParams()
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const queryUserId = searchParams.get('userId')?.trim() ?? ''

    if (queryUserId) {
      setUserId(queryUserId)
    }
  }, [searchParams])

  const resetForm = () => {
    const queryUserId = searchParams.get('userId')?.trim() ?? ''
    setUserId(queryUserId)
    setAmount('')
    setReason('')
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const trimmedUserId = userId.trim()
    const trimmedReason = reason.trim()
    const parsedAmount = Number(amount)

    setErrorMessage('')
    setSuccessMessage('')

    if (!UUID_PATTERN.test(trimmedUserId)) {
      setErrorMessage('Enter a valid user UUID.')
      return
    }

    if (!Number.isInteger(parsedAmount)) {
      setErrorMessage('Amount must be an integer.')
      return
    }

    if (!trimmedReason) {
      setErrorMessage('Reason is required.')
      return
    }

    setIsSubmitting(true)

    try {
      await adjustAdminCredits({
        user_id: trimmedUserId,
        amount: parsedAmount,
        reason: trimmedReason,
      })

      setSuccessMessage(`Credits updated for user ${trimmedUserId}.`)
      setAmount('')
      setReason('')
    } catch (error) {
      setErrorMessage(getApiClientErrorMessage(error, 'Failed to adjust credits.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">

              
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                Adjust Credits
              </h1>

      

        <Card className="border-border/70 shadow-[0_22px_70px_rgba(15,23,42,0.06)]">
  
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  autoComplete="off"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="100 or -100"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Integer only. Positive adds credits, negative removes credits.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Explain why this adjustment is being made."
                  disabled={isSubmitting}
                  rows={4}
                />
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-2xl border border-emerald-300/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
                  Apply Adjustment
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
