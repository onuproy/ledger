import type { TransactionWithCategory } from '../types'

const CSV_HEADER = 'Date,Type,Category,Account,Amount,Currency,Note'

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildTransactionsCsv(
  transactions: TransactionWithCategory[],
  currency: string
): string {
  const rows = transactions.map((t) =>
    [
      t.date.slice(0, 10),
      t.type,
      escapeCsvField(t.category?.name ?? 'Uncategorized'),
      escapeCsvField(t.account?.name ?? 'Unknown'),
      String(t.amount),
      currency,
      escapeCsvField(t.note ?? ''),
    ].join(',')
  )

  return [CSV_HEADER, ...rows].join('\n')
}

export interface ParsedCsvRow {
  date: string
  type: string
  categoryName: string
  accountName: string
  amount: number
  currency: string
  note: string
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        current += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields
}

export function parseTransactionsCsv(text: string): ParsedCsvRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return []

  const dataLines = lines[0].trim().toLowerCase().startsWith('date,') ? lines.slice(1) : lines

  return dataLines
    .map((line) => {
      const [date, type, categoryName, accountName, amount, currency, note] = parseCsvLine(line)
      return {
        date: (date ?? '').trim(),
        type: (type ?? '').trim().toLowerCase(),
        categoryName: (categoryName ?? '').trim(),
        accountName: (accountName ?? '').trim(),
        amount: parseFloat(amount ?? '0'),
        currency: (currency ?? '').trim(),
        note: (note ?? '').trim(),
      }
    })
    .filter((row) => row.date && (row.type === 'income' || row.type === 'expense') && row.amount > 0)
}

export function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
