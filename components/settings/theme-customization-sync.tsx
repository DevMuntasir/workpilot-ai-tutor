'use client'

import { useEffect } from 'react'
import { applyThemeCustomization, getStoredThemeCustomization } from '@/components/settings/theme-customization'

export default function ThemeCustomizationSync() {
  useEffect(() => {
    applyThemeCustomization(getStoredThemeCustomization())
  }, [])

  return null
}

