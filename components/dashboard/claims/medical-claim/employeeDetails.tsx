import formatDate from '@/utils/formatDate'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const EmployeeDetails = ({
  empId,
  employees,
}: {
  empId: number
  employees: any[]
}) => {
  if (!empId) return null

  const employee = employees.find((e) => e.id === empId)
  if (!employee) return null

  return (
    <div className="mt-4 border rounded-md bg-gray-50 p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Basic Salary</TableHead>
            <TableHead>Gross Salary</TableHead>
            <TableHead>Date of Joining</TableHead>
            <TableHead>Date of Confirmation</TableHead>
            <TableHead>Employee Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{employee.companyName || '-'}</TableCell>
            <TableCell>{employee.designationName || '-'}</TableCell>
            <TableCell>{employee.departmentName || '-'}</TableCell>
            <TableCell>{employee.basicSalary || '-'}</TableCell>
            <TableCell>{employee.grossSalary || '-'}</TableCell>
            <TableCell>{formatDate(employee.dateOfJoining) || '-'}</TableCell>
            <TableCell>
              {formatDate(employee.dateOfConfirmation) || '-'}
            </TableCell>
            <TableCell>{employee.empType || '-'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
