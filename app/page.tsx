import { DataTable } from "@/app/examples/data-table";
import { columns } from "@/app/examples/columns";
import Link from "next/link";
import { promises as fs } from "fs"
import path from "path"
import HowtoSteps from "@/components/how-to"
async function getData() {
  const data = await fs.readFile(
    path.join(process.cwd(), "app/examples/data/sample.json")
  )

  const entries = JSON.parse(data.toString())
  return entries
}

export default async function Home() {

  // Simulate a database read for data-table entries.
  const data = await getData()

  return (
    <main className="flex min-h-screen flex-col items-center justify-start sm:justify-start md:justify-center p-4 sm:p-8 md:p-12 lg:p-24">
      {/* Reference readme.MDX here */}
      <div className="flex justify-center w-full">
        <div className="flex flex-col items-center max-w-[1500px] w-full">
          <div className="w-full  mb-12 lg:mb-0 lg:hidden">
            <DataTable data={data} columns={columns} />
          </div>
          <div className="flex flex-col lg:flex-row  w-full">
            <div className="w-full lg:w-2/5 mt-10  lg:pr-8 mb-6 lg:mb-0">
              <ul className="list-disc space-y-2 font-sans text-xs sm:text-sm pl-4">
                <li>Built with <p className="bg-muted p-1 rounded inline">shadcn charts</p> / <p className="bg-muted p-1 rounded inline">recharts</p></li>
                <li>Chart and table are synced: updated in one, reflected in the other</li>
                <li>Drag on the chart to filter the table</li>
                <li>Edit chart display from the menu</li>
                <li>Copy the single file <Link href="https://github.com/ardasisbot/linked-chart/blob/main/components/linked-chart.tsx"><u>source code</u></Link></li>
                <br/>
                <HowtoSteps />
              </ul>
              <div className="border-t mt-4 pt-4 text-left text-xs sm:text-sm text-foreground">
                made by <Link href="https://twitter.com/asisbot" target="_blank" rel="noopener noreferrer"><u>@asisbot</u></Link>
              </div>
            </div>
            <div className="w-full lg:w-3/5   hidden lg:block">
              <DataTable data={data} columns={columns} />
            </div>
          </div>
        </div>
      </div>
      
    </main>
  );
}
