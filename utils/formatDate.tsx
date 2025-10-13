import { format } from 'date-fns'

const formatDate = (date: Date | null | undefined) => {
  if (!date) return '-'
  return format(new Date(date), 'MMM dd, yyyy')
}
export default formatDate
