"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}


function formatDate(dateUnix: number) {
  // Create a Date object from the string
  const date = new Date(dateUnix * 1000);
  // Format the date to 'YYYY-MM-DD' format
  const formattedDate = date.toISOString().split("T")[0];

  return formattedDate;
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "posting_date_unix",
    header: "Posting Date",
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue<number>(columnId); // Timestamp from the cell
      if (!filterValue || !filterValue.start || !filterValue.end) return true; // Allow all if no filter is set
      return cellValue >= filterValue.start && cellValue <= filterValue.end;
    },
    cell: ({ row }) => {
      return (
        <div className="w-[90px] flex items-center justify-center">
          {formatDate(row.getValue("posting_date_unix"))}
        </div>
      );
    },
  }
]
