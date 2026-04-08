import { NavLink, useSearchParams } from 'react-router-dom';
import { Package, ShoppingCart, BarChart3, Menu, X } from 'lucide-react';
import { clsx } from '../utils';
import { isFeatureEnabled } from '../utils/featureFlags';
import { useUIStore } from '../store/uiStore';

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [searchParams] = useSearchParams();

  const navItems = [
    { path: '/products', icon: Package, label: 'Inventory', params: Object.fromEntries(searchParams) },
    { path: '/orders', icon: ShoppingCart, label: 'Orders', params: Object.fromEntries(searchParams) },
  ];

  if (isFeatureEnabled('enableAnalyticsView')) {
    navItems.push({ path: '/analytics', icon: BarChart3, label: 'Analytics', params: Object.fromEntries(searchParams) });
  }

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-transform duration-300 z-40',
          'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Inventory & Analytics</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={{ pathname: item.path, search: new URLSearchParams(item.params).toString() }}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      )
                    }
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}