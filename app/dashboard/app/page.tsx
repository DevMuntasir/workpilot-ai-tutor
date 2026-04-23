'use client'

import { Settings } from 'lucide-react'

export default function AppPage() {
  return (
    <div className="w-full h-full flex items-center justify-center px-8">
      <div className="text-center">
        <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h1 className="text-2xl font-bold text-foreground mb-2">App Settings</h1>
        <p className="text-muted-foreground mb-6">
          Configure your app preferences and account settings
        </p>
        <p className="text-sm text-muted-foreground">
          App settings coming soon!
        </p>
      </div>
    </div>
  )
}
