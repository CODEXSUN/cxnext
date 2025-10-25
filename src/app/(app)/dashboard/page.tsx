import {SectionCards} from "@/components/menu/sidebar/section-cards";
import {ChartAreaInteractive} from "@/components/menu/sidebar/chart-area-interactive";
import {DataTable} from "@/components/menu/sidebar/data-table";
import data from "@/components/menu/app/data.json"

export default function Dashboard() {
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <SectionCards />
                    <div className="px-4 lg:px-6">
                        <ChartAreaInteractive />
                    </div>
                    <DataTable data={data} />
                </div>
            </div>
        </div>
    );
}