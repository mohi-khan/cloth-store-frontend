import { format } from 'date-fns'

export const formatDate = (date: Date | null | undefined) => {
  if (!date) return '-'
  return format(new Date(date), 'MMM dd, yyyy')
}

export const formatNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return "-"

  const num = Number(value)
  if (isNaN(num)) return "-"

  return num.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

