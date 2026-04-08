import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { getProducts, updateProduct, bulkUpdateProducts } from '../services/api';
import { useUIStore } from '../store/uiStore';
import { clsx, formatCurrency, getStockStatusLabel, getStockStatusColor, CATEGORIES, STOCK_STATUSES, debounce } from '../utils';
import { isFeatureEnabled } from '../utils/featureFlags';
import { Button, Checkbox } from '../components/UI';
import { TableSkeleton } from '../components/Skeleton';
import { Product } from '../types';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const stockStatus = searchParams.get('stockStatus') || '';
  const sortBy = searchParams.get('sortBy') || 'name';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  const [localSearch, setLocalSearch] = useState(search);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStockStatus, setEditStockStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set('search', value);
      else params.delete('search');
      params.set('page', '1');
      setSearchParams(params);
    }, 300),
    [searchParams, setSearchParams]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    debouncedSearch(value);
  };

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
    queryKey: ['products', page, search, category, stockStatus, sortBy, sortOrder],
    queryFn: () => getProducts({
      page,
      pageSize: 25,
      search: search || undefined,
      category: category || undefined,
      stockStatus: stockStatus || undefined,
      sortBy,
      sortOrder,
    }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      addToast('Product updated successfully', 'success');
      setEditingProduct(null);
    },
    onError: () => {
      addToast('Failed to update product', 'error');
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) => bulkUpdateProducts(ids, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      addToast(`Updated ${selectedIds.length} products`, 'success');
      setSelectedIds([]);
    },
    onError: () => {
      addToast('Failed to bulk update products', 'error');
    },
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      updateParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateParams({ sortBy: field, sortOrder: 'asc' });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditPrice(product.price.toString());
    setEditStockStatus(product.stockStatus);
  };

  const handleSaveEdit = (id: string) => {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) {
      addToast('Invalid price', 'error');
      return;
    }
    updateMutation.mutate({ id, data: { price, stockStatus: editStockStatus as Product['stockStatus'] } });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditPrice('');
    setEditStockStatus('');
  };

  const handleSelectAll = () => {
    if (selectedIds.length === data?.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data?.data.map(p => p.id) || []);
    }
  };

  const handleSelectId = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (isActive: boolean) => {
    bulkMutation.mutate({ ids: selectedIds, isActive });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  if (isError) {
    return <div className="p-6 text-red-500">Failed to load products</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
        <p className="text-gray-500">Manage your product inventory</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={localSearch}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="w-48">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
            <select
              value={category}
              onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Stock Status</label>
            <select
              value={stockStatus}
              onChange={(e) => updateParams({ stockStatus: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {STOCK_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {isFeatureEnabled('enableBulkActions') && selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
            <span className="text-sm text-gray-600 self-center">
              {selectedIds.length} selected
            </span>
            <Button variant="secondary" size="sm" onClick={() => handleBulkAction(true)}>
              Enable Selected
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleBulkAction(false)}>
              Disable Selected
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {isFeatureEnabled('enableBulkActions') && (
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedIds.length === data?.data.length && data?.data.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer" onClick={() => handleSort('name')}>
                  Name<SortIcon field="name" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer" onClick={() => handleSort('price')}>
                  Price<SortIcon field="price" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer" onClick={() => handleSort('stockStatus')}>
                  Stock Status<SortIcon field="stockStatus" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
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
                    No products found
                  </td>
                </tr>
              ) : (
                data?.data.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {isFeatureEnabled('enableBulkActions') && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds.includes(product.id)}
                          onChange={() => handleSelectId(product.id)}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className={clsx(!product.isActive && 'text-gray-400 line-through')}>
                        {product.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                    <td className="px-4 py-3">
                      {editingProduct === product.id ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        formatCurrency(product.price)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingProduct === product.id ? (
                        <select
                          value={editStockStatus}
                          onChange={(e) => setEditStockStatus(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        >
                          {STOCK_STATUSES.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getStockStatusColor(product.stockStatus))}>
                          {getStockStatusLabel(product.stockStatus)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingProduct === product.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleSaveEdit(product.id)} className="text-green-600 hover:text-green-700">
                            <Check size={18} />
                          </button>
                          <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-700">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * 25) + 1} to {Math.min(page * 25, data?.total || 0)} of {data?.total} products
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