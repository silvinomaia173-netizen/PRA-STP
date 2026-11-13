import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Eye,
  Minus,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  CATEGORY_PRESET_IMAGES,
  DELIVERY_ZONES,
  formatDb,
  slugifySeller,
} from '../data/seedData';
import { CategoryId, Product, SellerSummary } from '../types/marketplace';
import { readAndCompressImageFile } from '../utils/imageUpload';
import { ProductImage } from './ProductImage';

interface SellerPanelProps {
  sellers: SellerSummary[];
  products: Product[];
  lastSellerProfile: {
    storeName: string;
    sellerPhone: string;
    sellerZone: string;
  };
  onSaveSellerProfile: (profile: {
    storeName: string;
    sellerPhone: string;
    sellerZone: string;
  }) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateStock: (productId: string, delta: number) => void;
  onUpdatePrice: (productId: string, newPriceDb: number) => void;
  onDeleteProduct: (productId: string) => void;
  onClearAllProducts: () => void;
  onViewCatalog: () => void;
}

export function SellerPanel({
  sellers,
  products,
  lastSellerProfile,
  onSaveSellerProfile,
  onAddProduct,
  onUpdateStock,
  onUpdatePrice,
  onDeleteProduct,
  onClearAllProducts,
  onViewCatalog,
}: SellerPanelProps) {
  const [storeName, setStoreName] = useState(lastSellerProfile.storeName);
  const [sellerPhone, setSellerPhone] = useState(lastSellerProfile.sellerPhone);
  const [sellerZone, setSellerZone] = useState(
    lastSellerProfile.sellerZone || DELIVERY_ZONES[0].name
  );

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId>('comida');
  const [priceDb, setPriceDb] = useState('');
  const [unit, setUnit] = useState('Unidade');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [uploadedImageData, setUploadedImageData] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const [formFeedback, setFormFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [filterSellerId, setFilterSellerId] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (filterSellerId !== 'todos' && p.sellerId !== filterSellerId) return false;
      if (q) {
        return (
          p.name.toLowerCase().includes(q) ||
          p.storeName.toLowerCase().includes(q) ||
          p.sellerZone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, filterSellerId, searchQuery]);

  const inventoryStats = useMemo(() => {
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    return { totalProducts: products.length, totalStock, lowStock, outOfStock };
  }, [products]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImage(true);
    setFormFeedback(null);
    try {
      const compressed = await readAndCompressImageFile(file);
      setUploadedImageData(compressed);
      setCustomImageUrl('');
    } catch (err) {
      setFormFeedback({
        type: 'error',
        message:
          err instanceof Error ? err.message : 'Erro ao carregar a fotografia.',
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const trimmedStore = storeName.trim();
    const trimmedPhone = sellerPhone.trim();
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    const parsedPrice = Number(priceDb);
    const parsedStock = Number(stock);

    if (!trimmedStore) {
      setFormFeedback({
        type: 'error',
        message: 'Escreva o seu nome ou o nome da sua loja / barraca.',
      });
      return;
    }
    if (!trimmedPhone) {
      setFormFeedback({
        type: 'error',
        message: 'Indique o seu número de telemóvel ou WhatsApp (+239).',
      });
      return;
    }
    if (!trimmedName) {
      setFormFeedback({
        type: 'error',
        message: 'Escreva o nome do produto que quer vender.',
      });
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFormFeedback({
        type: 'error',
        message: 'Indique o preço do produto em Dobras (Db).',
      });
      return;
    }
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setFormFeedback({
        type: 'error',
        message: 'A quantidade em stock deve ser zero ou superior.',
      });
      return;
    }
    if (!trimmedDesc) {
      setFormFeedback({
        type: 'error',
        message: 'Escreva uma breve descrição para os compradores.',
      });
      return;
    }

    onSaveSellerProfile({
      storeName: trimmedStore,
      sellerPhone: trimmedPhone,
      sellerZone,
    });

    const finalImage =
      uploadedImageData ||
      customImageUrl.trim() ||
      CATEGORY_PRESET_IMAGES[category];

    onAddProduct({
      sellerId: slugifySeller(trimmedStore),
      storeName: trimmedStore,
      sellerPhone: trimmedPhone,
      sellerZone,
      category,
      name: trimmedName,
      description: trimmedDesc,
      priceDb: Math.round(parsedPrice),
      unit: unit.trim() || 'Unidade',
      stock: Math.round(parsedStock),
      imageUrl: finalImage,
    });

    setName('');
    setPriceDb('');
    setStock('10');
    setDescription('');
    setUploadedImageData('');
    setCustomImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    setFormFeedback({
      type: 'success',
      message: `"${trimmedName}" foi publicado e já está à venda no Catálogo.`,
    });
  };

  const commitPriceEdit = (productId: string) => {
    const num = Number(editingPriceValue);
    if (Number.isFinite(num) && num > 0) {
      onUpdatePrice(productId, Math.round(num));
    }
    setEditingPriceId(null);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-teal-800">
            Área aberta para vendedores e comerciantes
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Colocar Produto à Venda
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Preencha os seus dados, carregue uma foto do seu produto e publique diretamente na lista de vendas da Praça STP.
          </p>
        </div>

        <button
          type="button"
          onClick={onViewCatalog}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors self-start md:self-auto whitespace-nowrap"
        >
          <Eye className="w-4 h-4" />
          <span>Ver lista no Catálogo</span>
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500">Produtos publicados</p>
          <p className="font-mono-num text-2xl font-bold text-slate-900 mt-1">
            {inventoryStats.totalProducts}
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500">Vendedores ativos</p>
          <p className="font-mono-num text-2xl font-bold text-slate-900 mt-1">
            {sellers.length}
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500">Unidades em stock</p>
          <p className="font-mono-num text-2xl font-bold text-slate-900 mt-1">
            {inventoryStats.totalStock}
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500">Stock baixo / esgotado</p>
          <p className="font-mono-num text-2xl font-bold text-amber-700 mt-1">
            {inventoryStats.lowStock + inventoryStats.outOfStock}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Publish Product Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5"
        >
          <div className="space-y-3 border-b border-slate-100 pb-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              1. Os seus dados de vendedor
            </h2>

            {sellers.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500">
                  Preenchimento rápido (vendedores já registados):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sellers.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setStoreName(s.name);
                        setSellerPhone(s.phone);
                        setSellerZone(s.zoneName);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-md transition-colors"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1">
                Seu nome ou nome da sua loja / negócio
              </span>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ex: Maria Santos ou Quitanda do Riboque"
                className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">
                  Telemóvel / WhatsApp
                </span>
                <input
                  type="tel"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="+239 990 0000"
                  className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">
                  Zona onde se encontra
                </span>
                <select
                  value={sellerZone}
                  onChange={(e) => setSellerZone(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  {DELIVERY_ZONES.map((z) => (
                    <option key={z.id} value={z.name}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              2. Dados do produto à venda
            </h2>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1">
                Nome do produto
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Peixe seco, Bolo de banana, Telemóvel, Cesto..."
                className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">
                  Categoria
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryId)}
                  className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">
                  Unidade de venda
                </span>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Unidade, Kg, Dose, Saco..."
                  className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">
                  Preço (Dobras - Db)
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={priceDb}
                  onChange={(e) => setPriceDb(e.target.value)}
                  placeholder="Ex: 150"
                  className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-medium text-slate-700 mb-1">
                  Quantidade em stock
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono-num text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-1">
                Descrição do artigo
              </span>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explique o estado, tamanho, ingredientes ou detalhes do que está a vender..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </label>

            <div className="space-y-2">
              <span className="block text-xs font-medium text-slate-700">
                Foto do produto (do telemóvel ou computador)
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="product-photo-upload"
              />

              {uploadedImageData ? (
                <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <img
                    src={uploadedImageData}
                    alt="Pré-visualização do produto"
                    className="w-full h-44 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedImageData('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900/85 text-white text-xs font-medium rounded-md hover:bg-slate-900"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remover foto</span>
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="product-photo-upload"
                  className="flex items-center justify-center gap-2 w-full min-h-[48px] px-4 py-3 border border-dashed border-slate-300 hover:border-teal-700 bg-slate-50 hover:bg-teal-50/40 rounded-lg cursor-pointer text-xs font-medium text-slate-700 transition-colors"
                >
                  <Camera className="w-4 h-4 text-teal-700" />
                  <span>
                    {isProcessingImage
                      ? 'A preparar fotografia...'
                      : 'Escolher foto da galeria ou tirar fotografia'}
                  </span>
                </label>
              )}

              {!uploadedImageData && (
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Ou cole o link de uma imagem (opcional)"
                  className="w-full min-h-[38px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              )}
            </div>
          </div>

          {formFeedback && (
            <div
              className={`flex items-start gap-2 text-xs font-medium px-3 py-2.5 rounded-lg border ${
                formFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {formFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p>{formFeedback.message}</p>
                {formFeedback.type === 'success' && (
                  <button
                    type="button"
                    onClick={onViewCatalog}
                    className="underline font-semibold text-emerald-900"
                  >
                    Ver agora no Catálogo
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessingImage}
            className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Publicar produto na lista de vendas
          </button>
        </form>

        {/* Published Inventory List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterSellerId}
                onChange={(e) => setFilterSellerId(e.target.value)}
                className="min-h-[38px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                <option value="todos">Todos os vendedores ({products.length})</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.productCount})
                  </option>
                ))}
              </select>

              {products.length > 0 &&
                (confirmClear ? (
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onClearAllProducts();
                        setConfirmClear(false);
                      }}
                      className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md"
                    >
                      Confirmar limpeza
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1.5 bg-slate-100 text-slate-700 text-xs rounded-md"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-700 transition-colors"
                  >
                    Limpar lista
                  </button>
                ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar na lista..."
                className="w-full min-h-[38px] pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-900">
                Ainda não há produtos nesta lista
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Use o formulário ao lado para adicionar o seu primeiro artigo. Assim que publicar, poderá gerir o preço e o stock aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Produto e Vendedor</th>
                    <th className="py-3 px-3 text-right">Preço</th>
                    <th className="py-3 px-3 text-center">Stock</th>
                    <th className="py-3 px-4 text-right">Estado / Remover</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredProducts.map((product) => {
                    const isLow = product.stock > 0 && product.stock <= 5;
                    const isEmpty = product.stock === 0;
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div className="w-11 h-11 rounded-md overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                              <ProductImage
                                src={product.imageUrl}
                                alt={product.name}
                                title={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate max-w-[210px]">
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {product.storeName} · {CATEGORY_LABELS[product.category]} · {product.unit}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {editingPriceId === product.id ? (
                            <input
                              type="number"
                              min="1"
                              value={editingPriceValue}
                              onChange={(e) => setEditingPriceValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitPriceEdit(product.id);
                                if (e.key === 'Escape') setEditingPriceId(null);
                              }}
                              onBlur={() => commitPriceEdit(product.id)}
                              autoFocus
                              className="w-20 px-2 py-1 border border-teal-700 rounded text-right font-mono-num text-xs"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPriceId(product.id);
                                setEditingPriceValue(String(product.priceDb));
                              }}
                              title="Clique para alterar o preço"
                              className="font-mono-num font-semibold text-slate-900 hover:text-teal-700 underline decoration-dotted underline-offset-4"
                            >
                              {formatDb(product.priceDb)}
                            </button>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center border border-slate-200 rounded-md bg-white">
                            <button
                              type="button"
                              onClick={() => onUpdateStock(product.id, -1)}
                              disabled={product.stock <= 0}
                              aria-label={`Diminuir stock de ${product.name}`}
                              className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-35 rounded-l-md"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono-num text-xs font-semibold px-2.5 text-slate-900 min-w-[32px]">
                              {product.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateStock(product.id, 1)}
                              aria-label={`Aumentar stock de ${product.name}`}
                              className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-r-md"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-2">
                            {isEmpty ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                                <AlertTriangle className="w-3 h-3" />
                                Esgotado
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                <AlertTriangle className="w-3 h-3" />
                                Baixo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Ativo
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => onDeleteProduct(product.id)}
                              aria-label={`Remover ${product.name}`}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
