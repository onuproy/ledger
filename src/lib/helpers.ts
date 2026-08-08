import type { AnalyticsPeriod, DateRange, ExportPeriod } from '../types'

export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function getRangeForPeriod(period: 'today' | '7d' | 'month' | 'year'): DateRange {
  const now = new Date()
  const end = toDateOnly(now)

  if (period === 'today') {
    return { start: end, end }
  }

  if (period === '7d') {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    return { start: toDateOnly(start), end }
  }

  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start: toDateOnly(start), end }
  }

  const start = new Date(now.getFullYear(), 0, 1)
  return { start: toDateOnly(start), end }
}

export function getLast7DaysRange(): DateRange {
  return getRangeForPeriod('7d')
}

export function getRangeForAnalyticsPeriod(period: AnalyticsPeriod): DateRange {
  const now = new Date()
  const end = toDateOnly(now)

  if (period === 'week') {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    return { start: toDateOnly(start), end }
  }

  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start: toDateOnly(start), end }
  }

  if (period === '3months') {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    return { start: toDateOnly(start), end }
  }

  const start = new Date(now.getFullYear(), 0, 1)
  return { start: toDateOnly(start), end }
}

export function getRangeForExportPeriod(period: ExportPeriod, customRange?: DateRange): DateRange {
  const now = new Date()
  const end = toDateOnly(now)

  if (period === 'thisMonth') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start: toDateOnly(start), end }
  }

  if (period === 'lastMonth') {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return { start: toDateOnly(d), end: toDateOnly(new Date(d.getFullYear(), d.getMonth() + 1, 0)) }
  }

  if (period === 'last3Months') {
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    return { start: toDateOnly(start), end }
  }

  if (period === 'allTime') {
    return { start: '1970-01-01', end }
  }

  return customRange ?? { start: end, end }
}
