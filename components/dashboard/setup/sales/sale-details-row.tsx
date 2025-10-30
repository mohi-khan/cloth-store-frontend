'use client'

import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGetAvailableItem } from '@/hooks/use-api'
import { CustomCombobox } from '@/utils/custom-combobox'
import { GetItemType, GetSaleDetailsType } from '@/utils/type'
import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'

interface SaleDetailRowProps {
  detail: GetSaleDetailsType & { saleDetailsId?: number; rowId: string }
  index: number
  items: GetItemType[]
  handleItemSelect: (index: number, itemId: number) => void
  handleDetailChange: (
    index: number,
    field: keyof GetSaleDetailsType,
    value: string | number
  ) => void
  handleRemoveRow: (index: number) => void
  saleDetailsLength: number
  isEditing: boolean
  saleMasterId?: number
  userData?: any
}

export const SaleDetailRow: React.FC<SaleDetailRowProps> = ({
  detail,
  index,
  items,
  handleItemSelect,
  handleDetailChange,
  handleRemoveRow,
  saleDetailsLength,
}) => {
  // Local state to store available quantity for this specific row
  const [availableQuantity, setAvailableQuantity] = useState<number>(0)

  // Only fetch when itemId is valid
  const shouldFetch = detail.itemId > 0
  const { data: availableItemData, refetch } = useGetAvailableItem(
    shouldFetch ? detail.itemId : 0
  )

  // Update local state when data arrives
  useEffect(() => {
    if (availableItemData?.data?.availableQuantity !== undefined) {
      setAvailableQuantity(availableItemData.data.availableQuantity)
    } else if (!shouldFetch) {
      setAvailableQuantity(0)
    }
  }, [availableItemData, shouldFetch])

  // Refetch when itemId changes
  useEffect(() => {
    if (shouldFetch) {
      refetch()
    } else {
      setAvailableQuantity(0)
    }
  }, [detail.itemId, shouldFetch, refetch])

  return (
    <TableRow>
      <TableCell>
        <CustomCombobox
          items={
            items?.map((i) => ({
              id: i?.itemId?.toString() || '0',
              name: i.itemName || 'Unnamed item',
            })) || []
          }
          value={
            detail.itemId > 0
              ? {
                  id: detail.itemId.toString(),
                  name: detail.itemName || '',
                }
              : null
          }
          onChange={(value) =>
            handleItemSelect(index, value ? Number(value.id) : 0)
          }
          placeholder="Select item"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          disabled
          value={availableQuantity}
          className="w-20 bg-gray-100"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="0"
          step="1"
          value={detail.quantity || ''}
          onChange={(e) =>
            handleDetailChange(index, 'quantity', e.target.value)
          }
          placeholder="0"
          className="w-20"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={detail.unitPrice || ''}
          onChange={(e) =>
            handleDetailChange(index, 'unitPrice', e.target.value)
          }
          placeholder="0.00"
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <span className="font-semibold">{detail.amount.toFixed(2)}</span>
      </TableCell>
      <TableCell>
        {saleDetailsLength > 1 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => handleRemoveRow(index)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
