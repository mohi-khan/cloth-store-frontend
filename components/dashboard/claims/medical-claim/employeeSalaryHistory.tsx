import formatDate from '@/utils/formatDate'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { GetEmployeeSalaryHistoryType } from '@/utils/type'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const EmployeeSalaryHistory = ({
  employeeSalaryHistory,
}: {
  employeeSalaryHistory: GetEmployeeSalaryHistoryType[]
}) => {
  return (
    <div className="mt-4">
      <Accordion type="single" collapsible>
        <AccordionItem value="salary-history">
          <AccordionTrigger className="text-sm font-semibold">
            Salary History
          </AccordionTrigger>
          <AccordionContent>
            <div className="border rounded-md bg-gray-50 p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeSalaryHistory.map((history, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{history.employeeName || '-'}</TableCell>
                      <TableCell>{history.designationName || '-'}</TableCell>
                      <TableCell>{history.departmentName || '-'}</TableCell>
                      <TableCell>{history.basicSalary || '-'}</TableCell>
                      <TableCell>{history.grossSalary || '-'}</TableCell>
                      <TableCell>{history.year || '-'}</TableCell>
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

export default EmployeeSalaryHistory
