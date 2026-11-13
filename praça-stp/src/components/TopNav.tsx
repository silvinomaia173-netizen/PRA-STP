import { ShoppingBag } from 'lucide-react';
import { ActiveTab } from '../types/marketplace';

interface TopNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  cartCount: number;
  onOpenCart: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'lojas', label: 'Vendedores' },
  { id: 'entregas', label: 'Entregas' },
  { id: 'vendedor', label: 'Vender' },
];

export function TopNav({
  activeTab,
  onSelectTab,
  cartCount,
  onOpenCart,
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => onSelectTab('catalogo')}
            className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded"
          >
            Praça STP
          </button>

          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-7"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                    isActive
                      ? 'border-teal-700 text-slate-900'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.75} />
              <span>Carrinho</span>
              <span className="font-mono-num text-xs bg-teal-900/50 px-1.5 py-0.5 rounded">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        <nav
          aria-label="Navegação móvel"
          className="flex md:hidden items-center justify-between border-t border-slate-100 -mx-4 px-4 overflow-x-auto"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex-1 min-h-[44px] px-2 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                  isActive
                    ? 'border-teal-700 text-teal-800'
                    : 'border-transparent text-slate-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
