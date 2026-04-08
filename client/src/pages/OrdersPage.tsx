import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { getOrders } from '../services/api';
import { clsx, formatCurrency, formatDate, getOrderStatusColor, ORDER_STATUSES } from '../utils';
import { isFeatureEnabled } from '../utils/featureFlags';
import { Button } from '../components/UI';
import { TableSkeleton } from '../components/Skeleton';

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const updateParams = useCallback((updates: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', page, status, startDate, endDate],
    queryFn: () => getOrders({
      page,
      pageSize: 25,
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  const statusCounts = useMemo(() => {
    if (!data?.data) return {};
    const counts: Record<string, number> = { pending: 0, processing: 0, shipped: 0, delivered: 0 };
    data.data.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  }, [data?.data]);

  const handleExport = () => {
    if (!data?.data) return;
    const csv = [
      'Order ID,Customer Name,Items,Total,Status,Date',
      ...data.data.map(order => 
        `${order.id},${order.customerName},${order.items.length},${order.total},${order.status},${order.createdAt}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load orders</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-500">View and manage orders</p>
        </div>
        {isFeatureEnabled('enableOrderExport') && (
          <Button variant="secondary" onClick={handleExport}>
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-48">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
            <select
              value={status}
              onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => updateParams({ startDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-48">
            <label className="text-sm font-medium text-gray-700 mb-1 block">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => updateParams({ endDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(status || startDate || endDate) && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => updateParams({ status: '', startDate: '', endDate: '', page: 1 })}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {data?.total !== undefined && (
          <div className="mt-4 flex gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Filter results: </span>
            {Object.entries(statusCounts).map(([s, count]) => (
              <span key={s} className={clsx('px-2 py-1 rounded-full text-xs font-medium', getOrderStatusColor(s))}>
                {s.charAt(0).toUpperCase() + s.slice(1)}: {count}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8">
                    <TableSkeleton rows={5} />
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                data?.data.map((order) => (
                  <>
                    <tr 
                      key={order.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      <td className="px-4 py-3 font-mono text-sm">{order.id.slice(0, 12)}...</td>
                      <td className="px-4 py-3">{order.customerName}</td>
                      <td className="px-4 py-3">{order.items.length} items</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getOrderStatusColor(order.status))}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(order.createdAt)}</td>
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr key={`${order.id}-details`} className="bg-gray-50">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="ml-8">
                            <h4 className="font-medium mb-2">Order Items</h4>
                            <table className="w-full max-w-lg text-sm">
                              <thead>
                                <tr className="text-left text-gray-500">
                                  <th className="pb-2">Product</th>
                                  <th className="pb-2">Qty</th>
                                  <th className="pb-2">Price</th>
                                  <th className="pb-2">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items.map((item, idx) => (
                                  <tr key={idx} className="border-t border-gray-200">
                                    <td className="py-2">{item.name}</td>
                                    <td className="py-2">{item.quantity}</td>
                                    <td className="py-2">{formatCurrency(item.price)}</td>
                                    <td className="py-2">{formatCurrency(item.price * item.quantity)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * 25) + 1} to {Math.min(page * 25, data?.total || 0)} of {data?.total} orders
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: page - 1 })}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= (data?.totalPages || 1)}
              onClick={() => updateParams({ page: page + 1 })}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}