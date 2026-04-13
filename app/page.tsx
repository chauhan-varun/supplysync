import { 
  getReplenishmentAnalysis, 
  getDemandVelocityAnalysis, 
  getLogisticsConsolidation 
} from "@/lib/sql-optimization";

export default async function Home() {
  const replenishmentData: any = await getReplenishmentAnalysis();
  const velocityData: any = await getDemandVelocityAnalysis();
  const logisticsData: any = await getLogisticsConsolidation();

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950 font-sans">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          SupplySync Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Real-time Supply Chain Optimization powered by Raw MySQL.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Replenishment */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Inventory Replenishment Alerts
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="pb-3 px-2">Product</th>
                  <th className="pb-3 px-2">Entity</th>
                  <th className="pb-3 px-2 text-right">Stock</th>
                  <th className="pb-3 px-2 text-right">Recommended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {replenishmentData.map((row: any, i: number) => (
                  <tr key={i} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-2 font-medium text-zinc-900 dark:text-zinc-100">{row.product_name}</td>
                    <td className="py-4 px-2 text-zinc-500 uppercase text-[10px] tracking-wider">{row.entity_name}</td>
                    <td className="py-4 px-2 text-right text-red-600 font-semibold">{row.quantity_on_hand}</td>
                    <td className="py-4 px-2 text-right text-green-600">+{row.recommended_order_qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Demand Velocity / Stock-out Prediction */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Stock-out Prediction (30d Analysis)</h2>
          <div className="space-y-4">
            {velocityData.map((row: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{row.product_name}</h3>
                  <p className="text-xs text-zinc-500">Velocity: {Number(row.daily_velocity).toFixed(2)} units/day</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${row.days_until_stockout < 5 ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {row.days_until_stockout === 999 ? '∞' : Math.ceil(row.days_until_stockout)}
                  </span>
                  <p className="text-[10px] uppercase text-zinc-400">Days Remaining</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Logistics Consolidation */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Logistics Consolidation Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {logisticsData.map((row: any, i: number) => (
              <div key={i} className="p-4 rounded-xl border-l-4 border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-zinc-800">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase mb-1">Destination: {row.destination}</p>
                <p className="text-2xl font-bold">{row.pending_orders_count} Pending Orders</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{row.total_items} items total</p>
                <div className="mt-3 text-[10px] font-mono text-zinc-400">
                  ID: {row.order_ids}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-16 text-center text-sm text-zinc-500">
        <p>Built with Next.js, Raw MySQL & Playwright Tools.</p>
      </footer>
    </div>
  );
}
