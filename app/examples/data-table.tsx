"use client"

import { LinkedChart } from "@/components/linked-chart"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  
  const chartAggregatorConfig = {
    amount: (transaction: any) => (transaction.amount > 0 ? transaction.amount : 0),
    largeAmount: (transaction: any) => (transaction.amount > 500 ? transaction.amount : 0),
  };


  return (
    <div>
      <div className="flex flex-col gap-4">
          <div className="flex-none mb-10">
            <LinkedChart 
              data={table.getFilteredRowModel().rows.map((row) => row.original)} 
              columns={columns}
              setColumnFilters={table.setColumnFilters}
              dateField="posting_date_unix" 
              aggregatorConfig={chartAggregatorConfig}
              chartType="area"  
              title="Linked Chart"
            />
          </div>
          
          <div className="flex items-center gap-5 ">
            <Input
              placeholder="Filter status..."
              value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
              onChange={(event: any) =>
                table.getColumn("status")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />

            <Input
              placeholder="Filter email..."
              value={
                (table.getColumn("email")?.getFilterValue() as string) ?? ""
              }
              onChange={(event: any) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />

            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <>
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
                </>
              )}
              
            </div>

            <Button onClick={() => table.resetColumnFilters()} variant="outline" className="h-9 ml-4">
              Clear Filters
            </Button>
          </div>
          <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
    </div>
    
    </div>
    
  </div>
  )
}
