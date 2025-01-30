"use client"

import { Code, Zap } from "lucide-react";
import * as React from "react";

const steps = [
	{
	  description: "Import LinkedChart in your DataTable component",
	  code: "import { LinkedChart } from '@/components/linked-chart'",
	  icon: Zap,
	},
	{
	  description: "Define how you want to aggregate the data for the chart",
	  code: `const chartAggregatorConfig = {
    amount: (transaction: any) => (transaction.amount > 0 ? transaction.amount : 0),
    largeAmount: (transaction: any) => (transaction.amount > 500 ? transaction.amount : 0),
  };`,
	  icon: Code,
	},
	{
	  description: "Call the LinkedChart component inside your DataTable",
	  code: `<LinkedChart 
	data={table.getFilteredRowModel().rows.map((row) => row.original)} 
	columns={columns}
	setColumnFilters={table.setColumnFilters}
	dateField="posting_date_unix" 
	aggregatorConfig={chartAggregatorConfig}
	chartType="area"  
	title="Linked Chart"
	/>`,
	  icon: Code,
	},
  ];

  export default function HowtoSteps() {
	return (
	  <section className="relative overflow-hidden">
		<div className="container relative z-10">
		  <div className="relative">
			{steps.map((step, index) => {
			  return (
				<div key={index} className="mb-12 last:mb-0 flex items-start relative">
				  {/* Vertical line */}
				  {index < steps.length - 1 && (
					<div className="absolute left-6 top-14 bottom-0 w-0.5 bg-primary"></div>
				  )}
				  {/* Icon */}
				  <div className="flex-shrink-0 mr-4 relative z-10">
					<div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-lg font-bold">
					  {index + 1}
					</div>
				  </div>
				  {/* Content */}
				  <div className="flex-grow">
					{/* <h3 className="text-2xl font-semibold mb-2">{step.title}</h3> */}
					<p className="text-muted-foreground mb-4">{step.description}</p>
					<div className="bg-muted p-4 rounded-lg">
					  <pre className="text-xs whitespace-pre-wrap break-words">
						<code className="text-left">{step.code}</code>
					  </pre>
					</div>
				  </div>
				</div>
			  );
			})}
		  </div>
		</div>
	  </section>
	);
  }