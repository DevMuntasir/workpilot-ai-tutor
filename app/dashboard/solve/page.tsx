'use client'

import { FileText } from 'lucide-react'

export default function SolvePage() {
  return (
    <div className="w-full h-full flex items-center justify-center px-8">
      <div className="text-center">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Solve Mode</h1>
        <p className="text-muted-foreground mb-6">
          Practice and solve problems from your study sets
        </p>
        <p className="text-sm text-muted-foreground">
          This feature is coming soon. Create a study set first to get started!
        </p>
      </div>
    </div>
  )
}
