'use client'

export default function AdminPortalPage() {
  return (
    <section className="p-4 md:p-6">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Admin Portal
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
          Admin UI is pending.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Role-based navigation is active. Admin users are routed here from the session endpoint.
        </p>
      </div>
    </section>
  )
}
