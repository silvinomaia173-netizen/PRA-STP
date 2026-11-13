import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CartDrawer } from './components/CartDrawer';
import { CatalogView } from './components/CatalogView';
import { DeliveryPanel } from './components/DeliveryPanel';
import { SellerPanel } from './components/SellerPanel';
import { StoresView } from './components/StoresView';
import { TopNav } from './components/TopNav';
import {
  COURIERS,
  DELIVERY_ZONES,
  DEMO_SAMPLE_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
} from './data/seedData';
import {
  ActiveTab,
  CartItem,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  SellerSummary,
} from './types/marketplace';

const STORAGE_KEYS = {
  products: 'praca_stp_products_v2',
  orders: 'praca_stp_orders_v2',
  cart: 'praca_stp_cart_v2',
  zone: 'praca_stp_zone_v2',
  sellerProfile: 'praca_stp_seller_profile_v2',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalogo');
  const [products, setProducts] = useState<Product[]>(() =>
    readStorage<Product[]>(STORAGE_KEYS.products, INITIAL_PRODUCTS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    readStorage<Order[]>(STORAGE_KEYS.orders, INITIAL_ORDERS)
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    readStorage<CartItem[]>(STORAGE_KEYS.cart, [])
  );
  const [selectedZoneId, setSelectedZoneId] = useState<string>(() =>
    readStorage<string>(STORAGE_KEYS.zone, 'centro')
  );
  const [lastSellerProfile, setLastSellerProfile] = useState<{
    storeName: string;
    sellerPhone: string;
    sellerZone: string;
  }>(() =>
    readStorage(STORAGE_KEYS.sellerProfile, {
      storeName: '',
      sellerPhone: '',
      sellerZone: DELIVERY_ZONES[0].name,
    })
  );

  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
    } catch {
      // Ignore storage quota errors
    }
  }, [products]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
    } catch {
      // Ignore storage quota errors
    }
  }, [orders]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.zone, JSON.stringify(selectedZoneId));
    } catch {
      // Ignore storage quota errors
    }
  }, [selectedZoneId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.sellerProfile,
        JSON.stringify(lastSellerProfile)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [lastSellerProfile]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const sellers = useMemo<SellerSummary[]>(() => {
    const map = new Map<string, SellerSummary>();
    for (const product of products) {
      const existing = map.get(product.sellerId);
      if (!existing) {
        map.set(product.sellerId, {
          id: product.sellerId,
          name: product.storeName,
          phone: product.sellerPhone,
          zoneName: product.sellerZone,
          categories: [product.category],
          productCount: 1,
          previewImage: product.imageUrl,
        });
      } else {
        existing.productCount += 1;
        if (!existing.categories.includes(product.category)) {
          existing.categories.push(product.category);
        }
      }
    }
    return Array.from(map.values());
  }, [products]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
    showToast(`${product.name} adicionado ao carrinho`);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = item.quantity + delta;
          const maxQty = product ? product.stock : nextQty;
          return { ...item, quantity: Math.min(nextQty, maxQty) };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handlePlaceOrder = (payload: {
    customerName: string;
    customerPhone: string;
    zoneId: string;
    addressDetail: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Order | null => {
    const zone =
      DELIVERY_ZONES.find((z) => z.id === payload.zoneId) || DELIVERY_ZONES[0];

    const orderItems = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          productId: product.id,
          name: product.name,
          storeName: product.storeName,
          priceDb: product.priceDb,
          quantity: Math.min(item.quantity, product.stock),
          unit: product.unit,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null && x.quantity > 0);

    if (orderItems.length === 0) return null;

    const subtotalDb = orderItems.reduce(
      (sum, item) => sum + item.priceDb * item.quantity,
      0
    );
    const totalDb = subtotalDb + zone.feeDb;

    const now = new Date();
    const createdAt = now.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const corridorActiveCount = orders.filter(
      (o) => o.corridor === zone.corridor && o.status !== 'entregue'
    ).length;

    const newOrder: Order = {
      id: `STP-${Math.floor(4100 + Math.random() * 5800)}`,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      zoneId: zone.id,
      zoneName: zone.name,
      corridor: zone.corridor,
      addressDetail: payload.addressDetail,
      paymentMethod: payload.paymentMethod,
      items: orderItems,
      subtotalDb,
      deliveryFeeDb: zone.feeDb,
      totalDb,
      status: 'pendente',
      courierName: COURIERS[corridorActiveCount % COURIERS.length],
      routeSequence: corridorActiveCount + 1,
      createdAt,
      notes: payload.notes,
    };

    setProducts((prev) =>
      prev.map((product) => {
        const ordered = orderItems.find((i) => i.productId === product.id);
        if (!ordered) return product;
        return {
          ...product,
          stock: Math.max(0, product.stock - ordered.quantity),
        };
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    return newOrder;
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    showToast(`Pedido #${orderId} atualizado`);
  };

  const handleAssignCourier = (orderId: string, courierName: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, courierName } : o))
    );
  };

  const handleReorderRoute = (orderId: string, direction: 'up' | 'down') => {
    setOrders((prev) => {
      const target = prev.find((o) => o.id === orderId);
      if (!target) return prev;

      const corridorOrders = prev
        .filter((o) => o.corridor === target.corridor && o.status !== 'entregue')
        .sort((a, b) => a.routeSequence - b.routeSequence);

      const idx = corridorOrders.findIndex((o) => o.id === orderId);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (idx === -1 || swapIdx < 0 || swapIdx >= corridorOrders.length) {
        return prev;
      }

      const reordered = [...corridorOrders];
      const [moved] = reordered.splice(idx, 1);
      reordered.splice(swapIdx, 0, moved);

      const sequenceMap = new Map<string, number>();
      reordered.forEach((o, i) => sequenceMap.set(o.id, i + 1));

      return prev.map((o) =>
        sequenceMap.has(o.id)
          ? { ...o, routeSequence: sequenceMap.get(o.id)! }
          : o
      );
    });
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id' | 'createdAt'>) => {
    const created: Product = {
      ...newProduct,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setProducts((prev) => [created, ...prev]);
    showToast(`${created.name} publicado na lista`);
  };

  const handleUpdateStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  const handleUpdatePrice = (productId: string, newPriceDb: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, priceDb: newPriceDb } : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((c) => c.productId !== productId));
    showToast('Artigo removido da lista');
  };

  const handleClearAllProducts = () => {
    setProducts([]);
    setCart([]);
    setSelectedSellerId(null);
    showToast('Lista de produtos limpa');
  };

  const handleLoadDemoExamples = () => {
    setProducts(DEMO_SAMPLE_PRODUCTS);
    showToast('2 exemplos carregados para testar');
  };

  const handleSelectSellerFromDirectory = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    setActiveTab('catalogo');
  };

  const goToTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900">
      <TopNav
        activeTab={activeTab}
        onSelectTab={goToTab}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1">
        {activeTab === 'catalogo' && (
          <CatalogView
            products={products}
            cart={cart}
            selectedZoneId={selectedZoneId}
            onChangeZone={setSelectedZoneId}
            selectedSellerId={selectedSellerId}
            onClearSellerFilter={() => setSelectedSellerId(null)}
            onAddToCart={handleAddToCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            onOpenCart={() => setIsCartOpen(true)}
            onGoToSell={() => goToTab('vendedor')}
            onLoadDemoExamples={handleLoadDemoExamples}
          />
        )}

        {activeTab === 'lojas' && (
          <StoresView
            sellers={sellers}
            onSelectSeller={handleSelectSellerFromDirectory}
            onGoToSell={() => goToTab('vendedor')}
          />
        )}

        {activeTab === 'entregas' && (
          <DeliveryPanel
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAssignCourier={handleAssignCourier}
            onReorderRoute={handleReorderRoute}
            onGoToCatalog={() => goToTab('catalogo')}
          />
        )}

        {activeTab === 'vendedor' && (
          <SellerPanel
            sellers={sellers}
            products={products}
            lastSellerProfile={lastSellerProfile}
            onSaveSellerProfile={setLastSellerProfile}
            onAddProduct={handleAddProduct}
            onUpdateStock={handleUpdateStock}
            onUpdatePrice={handleUpdatePrice}
            onDeleteProduct={handleDeleteProduct}
            onClearAllProducts={handleClearAllProducts}
            onViewCatalog={() => goToTab('catalogo')}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-semibold text-slate-900 text-sm">
              Praça STP
            </span>
            <span aria-hidden="true">·</span>
            <span>Comércio Local e Entregas em São Tomé e Príncipe (Dobras - Db)</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => goToTab('catalogo')}
              className="hover:text-slate-900 transition-colors"
            >
              Catálogo
            </button>
            <button
              type="button"
              onClick={() => goToTab('entregas')}
              className="hover:text-slate-900 transition-colors"
            >
              Entregas
            </button>
            <button
              type="button"
              onClick={() => goToTab('vendedor')}
              className="hover:text-slate-900 transition-colors"
            >
              Colocar produto à venda
            </button>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        products={products}
        selectedZoneId={selectedZoneId}
        onChangeZone={setSelectedZoneId}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onPlaceOrder={handlePlaceOrder}
        onGoToDeliveries={() => goToTab('entregas')}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
