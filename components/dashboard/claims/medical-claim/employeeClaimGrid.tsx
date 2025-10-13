import { useGetEmployeeClaim } from '@/hooks/use-api'
import formatDate from '@/utils/formatDate'
import type { Claims } from '@/utils/type'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const EmployeeClaimsGrid = ({
  employeeClaim
}: {
  employeeClaim: Claims[]
}) => {
  console.log("🚀 ~ EmployeeClaimsGrid ~ employeeClaim:", employeeClaim)

  // if (!employeeId || !claimType) return null
  // if (isLoading)
  //   return <p className="text-sm text-gray-500 mt-2">Loading claims...</p>
  // if (isError)
  //   return <p className="text-sm text-red-500 mt-2">Failed to load claims.</p>
  // if (!data || data?.data?.length === 0) {
  //   return (
  //     <p className="text-sm text-gray-500 mt-2">No previous claims found.</p>
  //   )
  // }

  const totalClaims = employeeClaim?.reduce(
    (sum: number, claim: Claims) => sum + (claim.claimAmount || 0),
    0
  )

  return (
    <div className="mt-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="claims">
          <AccordionTrigger className="text-sm font-semibold">
            <p className='bg-yellow-200'>Reimbursement Till Date {totalClaims ? `(${totalClaims})` : ''}</p>
          </AccordionTrigger>
          <AccordionContent>
            <div className="border rounded-md bg-gray-50 p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Bill Date</TableHead>
                    <TableHead>Posting Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeClaim?.map((claim: Claims, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{claim.claimType}</TableCell>
                      <TableCell>{formatDate(claim.claimDate)}</TableCell>
                      <TableCell>{formatDate(claim.createdAt)}</TableCell>
                      <TableCell>{claim.claimAmount}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            claim.approved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {claim.approved ? 'Approved' : 'Pending'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default EmployeeClaimsGrid
