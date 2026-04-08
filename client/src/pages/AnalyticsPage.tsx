import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingCart, DollarSign, Award, Calendar } from 'lucide-react';
import { getAnalytics } from '../services/api';
import { formatCurrency } from '../utils';
import { CardSkeleton, ChartSkeleton } from '../components/Skeleton';
import { isFeatureEnabled } from '../utils/featureFlags';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

export function AnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const { data: analytics, isLoading: analyticsLoading, isError: analyticsError } = useQuery({
    queryKey: ['analytics', startDate, endDate],
    queryFn: () => getAnalytics({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  if (!isFeatureEnabled('enableAnalyticsView')) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Analytics view is disabled</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500">Track your business performance</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => updateParams({ startDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => updateParams({ endDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => updateParams({ startDate: '', endDate: '' })}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {analyticsError ? (
        <div className="text-red-500">Failed to load analytics data</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="text-blue-600" size={20} />
                </div>
                <span className="text-sm text-gray-500">Total Revenue</span>
              </div>
              {analyticsLoading ? (
                <CardSkeleton />
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="text-green-600" size={20} />
                </div>
                <span className="text-sm text-gray-500">Total Orders</span>
              </div>
              {analyticsLoading ? (
                <CardSkeleton />
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {analytics?.totalOrders || 0}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="text-purple-600" size={20} />
                </div>
                <span className="text-sm text-gray-500">Avg Order Value</span>
              </div>
              {analyticsLoading ? (
                <CardSkeleton />
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics?.avgOrderValue || 0)}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="text-orange-600" size={20} />
                </div>
                <span className="text-sm text-gray-500">Top Category</span>
              </div>
              {analyticsLoading ? (
                <CardSkeleton />
              ) : (
                <div className="text-2xl font-bold text-gray-900">
                  {analytics?.topCategory || 'N/A'}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Over Time</h3>
              {analyticsLoading ? (
                <ChartSkeleton />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.ordersByDay || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Orders']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Orders"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Revenue"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
              {analyticsLoading ? (
                <ChartSkeleton />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.revenueByCategory || []}
                      dataKey="revenue"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {(analytics?.revenueByCategory || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category (Bar Chart)</h3>
            {analyticsLoading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.revenueByCategory || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                  <YAxis dataKey="category" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}