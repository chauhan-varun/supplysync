import { 
  getReplenishmentAnalysis, 
  getDemandVelocityAnalysis, 
  getOrdersDetailed,
  getEntityPerformance,
  getLogisticsAdvanced
} from "@/lib/sql-optimization";
import Link from 'next/link';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  const orderStatus = typeof resolvedParams.status === 'string' ? resolvedParams.status : 'all';
  const activeView = typeof resolvedParams.view === 'string' ? resolvedParams.view : 'dashboard';

  const [replenishment, velocity, orders, performance, logistics] = await Promise.all([
    getReplenishmentAnalysis(),
    getDemandVelocityAnalysis(),
    getOrdersDetailed(search, orderStatus),
    getEntityPerformance(),
    getLogisticsAdvanced(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 p-4 md:p-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tighter mb-2 bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-600 bg-clip-text text-transparent">
            SupplySync <span className="text-indigo-600">Enterprise</span>
          </h1>
          <p className="text-zinc-500 font-medium">Global Supply Chain Intelligence & Fulfillment Engine</p>
        </div>
        
        <form className="flex item-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <input 
            type="text" 
            name="search"
            defaultValue={search}
            placeholder="Search products or SKU..." 
            className="bg-transparent px-4 py-2 outline-none w-64 text-sm"
          />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Analyze
          </button>
        </form>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* TAB NAVIGATION */}
        <nav className="col-span-12 flex gap-1 bg-zinc-200/50 dark:bg-zinc-900/50 p-1 rounded-2xl w-fit">
          <Link 
            href={{ query: { ...resolvedParams, view: 'dashboard' } }} 
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'dashboard' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-zinc-500 hover:bg-white/50'}`}
          >
            Dashboard
          </Link>
          <Link 
            href={{ query: { ...resolvedParams, view: 'inventory' } }} 
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'inventory' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-zinc-500 hover:bg-white/50'}`}
          >
            Inventory
          </Link>
          <Link 
            href={{ query: { ...resolvedParams, view: 'logistics' } }} 
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'logistics' ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'text-zinc-500 hover:bg-white/50'}`}
          >
            Logistics
          </Link>
        </nav>

        {/* LEFT COLUMN: Inventory & Velocity */}
        {(activeView === 'dashboard' || activeView === 'inventory') && (
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
              {/* ... (Replenishment Matrix content) */}
              <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
                Replenishment Matrix
                <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full uppercase tracking-widest">Action Required</span>
              </h2>
              <div className="space-y-4">
                {replenishment.map((row: any, i: number) => (
                  <div key={i} className="group relative overflow-hidden bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 transition-all hover:border-indigo-500/50">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-sm">{row.product_name}</p>
                          <p className="text-[10px] uppercase text-zinc-400 font-mono">{row.sku}</p>
                        </div>
                        <p className="text-red-500 font-mono text-sm">{row.quantity_on_hand} left</p>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full" style={{ width: `${(row.quantity_on_hand / row.reorder_level) * 100}%` }}></div>
                    </div>
                    <p className="mt-3 text-[10px] text-zinc-500">Suggested Order: <span className="text-green-600 font-bold">+{row.recommended_order_qty} units</span></p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-bold mb-6">Stock-out Prediction</h2>
              <div className="space-y-3">
                {velocity.map((row: any, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{row.product_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-zinc-400">{Number(row.daily_velocity).toFixed(2)} / day</span>
                            <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-black ${row.days_until_stockout < 5 ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`}>
                          {row.days_until_stockout === 999 ? '∞' : Math.ceil(row.days_until_stockout)}
                        </p>
                        <p className="text-[8px] uppercase font-bold text-zinc-400">Days</p>
                      </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* CENTER COLUMN: Orders & Logistics */}
        <div className={`col-span-12 space-y-6 ${activeView === 'dashboard' ? 'lg:col-span-8' : ''}`}>
          {(activeView === 'dashboard' || activeView === 'logistics') && (
            <>
              <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <h2 className="text-lg font-bold">Strategic Orders Management</h2>
                  <div className="flex gap-2">
                    <Link 
                      href={{ query: { ...resolvedParams, status: 'all' } }} 
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${orderStatus === 'all' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                    >
                      All
                    </Link>
                    <Link 
                      href={{ query: { ...resolvedParams, status: 'pending' } }} 
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${orderStatus === 'pending' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                    >
                      Pending
                    </Link>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-4 px-6">Order ID</th>
                        <th className="py-4 px-6">Product</th>
                        <th className="py-4 px-6">Route</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {orders.map((order: any) => (
                        <tr key={order.order_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="py-5 px-6 font-mono text-zinc-400">#ORD-{order.order_id}</td>
                          <td className="py-5 px-6">
                            <div className="font-bold">{order.product_name}</div>
                            <div className="text-[10px] text-zinc-400">{order.sku}</div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-zinc-500">{order.from_entity}</span>
                              <span className="text-indigo-600">→</span>
                              <span className="text-xs font-medium text-zinc-500">{order.to_entity}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-5 px-6 text-right font-black text-indigo-600">{order.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <h2 className="text-lg font-bold mb-6">Supplier Performance</h2>
                  <div className="space-y-4">
                    {performance.map((s: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold text-sm tracking-tight">{s.name}</h3>
                          <span className="text-[10px] font-bold text-indigo-600">{Number(s.rating).toFixed(1)} ★</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-medium text-zinc-500">
                          <span>Lead Time: <span className="text-zinc-900 dark:text-zinc-100">{s.avg_lead_time} days</span></span>
                          <span>Fulfillment: <span className="text-zinc-900 dark:text-zinc-100">{Math.round(s.fulfillment_rate)}%</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <h2 className="text-lg font-bold mb-6">Logistics Flow Tracking</h2>
                  <div className="space-y-4">
                    {logistics.map((l: any, i: number) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-1.5 h-12 bg-indigo-500 rounded-full"></div>
                        <div>
                          <h3 className="font-bold text-sm">{l.tracking_number}</h3>
                          <p className="text-[10px] text-zinc-500 mb-1">{l.carrier} • Cost: ${l.shipping_cost}</p>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 mb-0.5"></span>
                            <span className="text-[10px] font-black uppercase text-green-600">{l.shipping_status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
