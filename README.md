# Linked Chart & Table Component

A React component that synchronizes chart and DataTable (shadcn / Tanstack) views, built with  shadcn charts / Recharts. 

![Convert MOV to GIF demo (1)](https://github.com/user-attachments/assets/ebf820f2-f4a7-49a6-9ad1-48f243d27ae5)


## Features

- 📊 Synchronized chart and table views
- 🔍 Interactive chart selection filters table data
- 📅 Multiple date format options (Month, Quarter, Year, etc.)
- 📈 Configurable chart types (Area, Bar)


This project was built upon by the work done in [zoom-chart-demo](https://github.com/shelwinsunga/zoom-chart-demo) by @shelwin_

## Quick Start


1. Copy  [LinkedChart](https://github.com/ardasisbot/linked-chart/blob/main/components/linked-chart.tsx) to your repo and import in your DataTable component:
```tsx
import { LinkedChart } from '@/components/linked-chart'
```

2. Define how you want to aggregate your data for the chart:
```tsx
const chartAggregatorConfig = {
  amount: (transaction) => (transaction.amount > 0 ? transaction.amount : 0),
  largeAmount: (transaction) => (transaction.amount > 500 ? transaction.amount : 0),
};
```

3. Inside your  `<DataTable>`, call the `<LinkedChart>` component:
```tsx
<LinkedChart 
  data={table.getFilteredRowModel().rows.map((row) => row.original)} 
  columns={columns}
  setColumnFilters={table.setColumnFilters}
  dateField="posting_date_unix" 
  aggregatorConfig={chartAggregatorConfig}
  chartType="area"  
  title="Linked Chart"
/>
```

See https://github.com/ardasisbot/linked-chart/blob/main/app/examples/data-table.tsx for a complete example.

## Complete Example

Check out a [full implementation example](https://github.com/ardasisbot/linked-chart/blob/main/app/examples/data-table.tsx) with DataTable integration.

## Notes

You can also use the <LinkedChart> component without <DataTable> component. Useful for standalone charts.
```tsx
<LinkedChart 
  data={data} 
//   columns={columns}
//   setColumnFilters={table.setColumnFilters}
  dateField="posting_date_unix" 
  aggregatorConfig={chartAggregatorConfig}
  chartType="bar"  
  title="Linked Chart"
/>
```
## Dependencies

- shadcn/ui / Recharts
- date-fns


## License

MIT

## Author

[@asisbot](https://x.com/asisbot)
