import { useMemo, useState } from 'react';
import {
  MapPin,
  Minus,
  Phone,
  Plus,
  PlusCircle,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  DELIVERY_ZONES,
  HERO_IMAGE_URL,
  formatDb,
} from '../data/seedData';
import { CartItem, CategoryId, Product } from '../types/marketplace';
import { ProductImage } from './ProductImage';

interface CatalogViewProps {
  products: Product[];
  cart: CartItem[];
  selectedZoneId: string;
  onChangeZone: (zoneId: string) => void;
  selectedSellerId: string | null;
  onClearSellerFilter: () => void;
  onAddToCart: (productId: string) => void;
  onUpdateCartQuantity: (productId: string, delta: number) => void;
  onOpenCart: () => void;
  onGoToSell: () => void;
  onLoadDemoExamples: () => void;
}

export function CatalogView({
  products,
  cart,
  selectedZoneId,
  onChangeZone,
  selectedSellerId,
  onClearSellerFilter,
  onAddToCart,
  onUpdateCartQuantity,
  onOpenCart,
  onGoToSell,
  onLoadDemoExamples,
}: CatalogViewProps) {
  const [activeCategory, setActiveCategory] = useState<'todas' | CategoryId>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const selectedZone = useMemo(
    () => DELIVERY_ZONES.find((z) => z.id === selectedZoneId) || DELIVERY_ZONES[0],
    [selectedZoneId]
  );

  const cartQtyById = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cart) {
      map.set(item.productId, item.quantity);
    }
    return map;
  }, [cart]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (selectedSellerId && product.sellerId !== selectedSellerId) return false;
      if (activeCategory !== 'todas' && product.category !== activeCategory) return false;
      if (query) {
        const match =
          product.name.toLowerCase().includes(query) ||
          product.storeName.toLowerCase().includes(query) ||
          product.sellerZone.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [products, selectedSellerId, activeCategory, searchQuery]);

  const activeSellerName = useMemo(() => {
    if (!selectedSellerId) return null;
    return products.find((p) => p.sellerId === selectedSellerId)?.storeName || null;
  }, [products, selectedSellerId]);

  return (
    <div className="space-y-10 pb-16">
      {/* Storefront Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-wide text-teal-800">
                  São Tomé e Príncipe · Compra e venda local em Dobras (Db)
                </p>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-slate-900 leading-[1.12] tracking-tight text-balance">
                  Compre e venda produtos locais em São Tomé com entrega à porta.
                </h1>
                <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                  Qualquer comerciante ou vendedor particular pode publicar os seus produtos, definir o preço em Dobras e receber encomendas por zona.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-medium text-slate-600 mb-1.5">
                      Zona de entrega
                    </span>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-teal-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={selectedZoneId}
                        onChange={(e) => onChangeZone(e.target.value)}
                        className="w-full min-h-[42px] pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white"
                      >
                        {DELIVERY_ZONES.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name} ({formatDb(zone.feeDb)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="block">
                    <span className="block text-xs font-medium text-slate-600 mb-1.5">
                      Procurar produto ou vendedor
                    </span>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Pesquisar artigo, zona ou nome..."
                        className="w-full min-h-[42px] pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:bg-white"
                      />
                    </div>
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <span className="text-xs text-slate-600">
                    Taxa para <strong className="text-slate-900 font-semibold">{selectedZone.name}</strong>
                    {' · '}
                    <span className="font-mono-num">{formatDb(selectedZone.feeDb)}</span>
                    {' · '}
                    <span className="font-mono-num">{selectedZone.etaMin}–{selectedZone.etaMax} min</span>
                  </span>

                  <button
                    type="button"
                    onClick={onGoToSell}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Colocar produto à venda</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-64 sm:h-80 lg:h-full min-h-[260px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <ProductImage
                  src={HERO_IMAGE_URL}
                  alt="Mercado local de São Tomé e Príncipe"
                  title="Mercado Local de São Tomé"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
                  <p className="text-xs text-white/90 font-medium">
                    Lista aberta para comerciantes e vendedores locais
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    Centro · Campo Milho · Île Poule · Madamba · Pantufo · Príncipe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Controls & Grid */}
      <section id="catalogo-produtos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setActiveCategory('todas')}
              className={`px-3.5 py-2 min-h-[40px] text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                activeCategory === 'todas'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Todas
            </button>
            {CATEGORY_OPTIONS.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-2 min-h-[40px] text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-teal-700 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0">
            {activeSellerName && (
              <button
                type="button"
                onClick={onClearSellerFilter}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-md whitespace-nowrap"
              >
                <span>Vendedor: {activeSellerName}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="font-mono-num whitespace-nowrap">
              {filteredProducts.length}{' '}
              {filteredProducts.length === 1 ? 'artigo publicado' : 'artigos publicados'}
            </span>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-10 space-y-6">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Ainda não existem produtos publicados na lista
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Em vez de mostrar produtos fictícios, este catálogo é preenchido pelos próprios vendedores e comerciantes locais. Qualquer pessoa pode entrar, publicar os seus artigos com foto e preço em Dobras (Db) e começar a receber encomendas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <p className="font-mono-num text-xs font-semibold text-teal-800">
                  01. Identificação simples
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Escreva o seu nome ou loja
                </p>
                <p className="text-xs text-slate-600">
                  Indique o seu nome, telemóvel/WhatsApp e a sua zona em São Tomé.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-mono-num text-xs font-semibold text-teal-800">
                  02. Foto e preço em Dobras
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Adicione o artigo à lista
                </p>
                <p className="text-xs text-slate-600">
                  Carregue uma foto do telemóvel, defina o preço em Db, unidade e stock.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-mono-num text-xs font-semibold text-teal-800">
                  03. Venda e entrega local
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  Receba pedidos no painel
                </p>
                <p className="text-xs text-slate-600">
                  Os compradores adicionam ao carrinho e os pedidos aparecem em Entregas.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onGoToSell}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar o meu primeiro produto</span>
              </button>

              <button
                type="button"
                onClick={onLoadDemoExamples}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
              >
                Carregar 2 exemplos para testar
              </button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
            <p className="text-base font-semibold text-slate-900">
              Nenhum produto encontrado para esta pesquisa.
            </p>
            <p className="text-sm text-slate-600">
              Experimente limpar o filtro ou publique um novo artigo nesta categoria.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('todas');
                  setSearchQuery('');
                  onClearSellerFilter();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Limpar filtros
              </button>
              <button
                type="button"
                onClick={onGoToSell}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Colocar produto à venda
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const qtyInCart = cartQtyById.get(product.id) || 0;
              const isOutOfStock = product.stock <= 0;

              return (
                <article
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => setDetailProduct(product)}
                      className="block w-full aspect-[4/3] bg-slate-100 overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                    >
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        title={product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>

                    <div className="p-5 space-y-2.5">
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                        <span className="font-medium text-teal-800">
                          {CATEGORY_LABELS[product.category]}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{product.storeName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{product.sellerZone}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">
                          {isOutOfStock ? 'Esgotado' : `${product.stock} un.`}
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-semibold text-slate-900 leading-snug">
                        <button
                          type="button"
                          onClick={() => setDetailProduct(product)}
                          className="text-left hover:text-teal-800 transition-colors"
                        >
                          {product.name}
                        </button>
                      </h3>

                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono-num text-lg font-semibold text-slate-900">
                        {formatDb(product.priceDb)}
                      </p>
                      <p className="text-xs text-slate-500">{product.unit}</p>
                    </div>

                    {isOutOfStock ? (
                      <span className="text-xs font-semibold text-red-700 px-3 py-2 border border-red-200 bg-red-50 rounded-lg whitespace-nowrap">
                        Sem stock
                      </span>
                    ) : qtyInCart > 0 ? (
                      <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          type="button"
                          onClick={() => onUpdateCartQuantity(product.id, -1)}
                          aria-label={`Remover uma unidade de ${product.name}`}
                          className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/70 rounded-l-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-mono-num text-sm font-semibold text-slate-900 px-2.5">
                          {qtyInCart}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateCartQuantity(product.id, 1)}
                          disabled={qtyInCart >= product.stock}
                          aria-label={`Adicionar mais uma unidade de ${product.name}`}
                          className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-200/70 disabled:opacity-40 rounded-r-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAddToCart(product.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      {detailProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          onClick={() => setDetailProduct(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[4/3] md:aspect-auto md:h-full bg-slate-100">
              <ProductImage
                src={detailProduct.imageUrl}
                alt={detailProduct.name}
                title={detailProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-teal-800">
                      {CATEGORY_LABELS[detailProduct.category]}
                    </span>
                    {' · '}
                    <span>{detailProduct.storeName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailProduct(null)}
                    aria-label="Fechar detalhes"
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2
                  id="product-modal-title"
                  className="font-display text-2xl font-bold text-slate-900 leading-snug"
                >
                  {detailProduct.name}
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {detailProduct.description}
                </p>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                  <p>
                    Vendedor: <strong className="text-slate-900">{detailProduct.storeName}</strong>
                    {' · '}
                    <span>{detailProduct.sellerZone}</span>
                  </p>
                  {detailProduct.sellerPhone && (
                    <p className="inline-flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono-num text-slate-900">
                        {detailProduct.sellerPhone}
                      </span>
                    </p>
                  )}
                  <p>
                    Unidade: <strong className="text-slate-900">{detailProduct.unit}</strong>
                  </p>
                  <p>
                    Disponibilidade:{' '}
                    <strong className="font-mono-num text-slate-900">
                      {detailProduct.stock > 0
                        ? `${detailProduct.stock} unidades em stock`
                        : 'Esgotado'}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                <span className="font-mono-num text-2xl font-bold text-slate-900">
                  {formatDb(detailProduct.priceDb)}
                </span>
                <button
                  type="button"
                  disabled={detailProduct.stock <= 0}
                  onClick={() => {
                    onAddToCart(detailProduct.id);
                    setDetailProduct(null);
                    onOpenCart();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Adicionar ao carrinho</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
