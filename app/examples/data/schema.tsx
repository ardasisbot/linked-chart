
export type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
    posting_date_unix: number // a unix timestamp is needed for the LinkedChart
  }
  