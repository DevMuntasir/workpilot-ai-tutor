import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const DEFAULT_LOCALE = 'en-US'
const DEFAULT_TIME_ZONE = 'UTC'

const defaultDateFormatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
  dateStyle: 'medium',
  timeZone: DEFAULT_TIME_ZONE,
})
const defaultNumberFormatter = new Intl.NumberFormat(DEFAULT_LOCALE)

type DateInput = Date | string | number | null | undefined
type NumberInput = number | string | null | undefined

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUTCDate(
  input: DateInput,
  options?: Intl.DateTimeFormatOptions,
  locale: string = DEFAULT_LOCALE,
) {
  const date = normalizeDateInput(input)
  if (!date) return ''

  if (!options && locale === DEFAULT_LOCALE) {
    return defaultDateFormatter.format(date)
  }

  return new Intl.DateTimeFormat(locale, {
    timeZone: DEFAULT_TIME_ZONE,
    ...options,
  }).format(date)
}

export function formatNumber(
  input: NumberInput,
  options?: Intl.NumberFormatOptions,
  locale: string = DEFAULT_LOCALE,
) {
  const value = normalizeNumberInput(input)
  if (value === null) return ''

  if (!options && locale === DEFAULT_LOCALE) {
    return defaultNumberFormatter.format(value)
  }

  return new Intl.NumberFormat(locale, options).format(value)
}

function normalizeDateInput(input: DateInput): Date | null {
  if (input === null || input === undefined) {
    return null
  }

  const date =
    typeof input === 'string' || typeof input === 'number'
      ? new Date(input)
      : input

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

function normalizeNumberInput(input: NumberInput): number | null {
  if (input === null || input === undefined) {
    return null
  }

  const value = typeof input === 'string' ? Number(input) : input
  return typeof value === 'number' && !Number.isNaN(value) ? value : null
}
