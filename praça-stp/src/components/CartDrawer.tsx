import { FormEvent, useMemo, useState } from 'react';
import {
  CheckCircle2,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { DELIVERY_ZONES, formatDb } from '../data/seedData';
import {
  CartItem,
  Order,
  PaymentMethod,
  Product,
} from '../types/marketplace';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  selectedZoneId: string;
  onChangeZone: (zoneId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: (payload: {
    customerName: string;
    customerPhone: string;
    zoneId: string;
    addressDetail: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => Order | null;
  onGoToDeliveries: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Dinheiro na Entrega',
  'Dobra24 / Transferência',
  'Pagamento Móvel Local',
];

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  products,
  selectedZoneId,
  onChangeZone,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onGoToDeliveries,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Dinheiro na Entrega');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const selectedZone = useMemo(
    () => DELIVERY_ZONES.find((z) => z.id === selectedZoneId) || DELIVERY_ZONES[0],
    [selectedZoneId]
  );

  const cartLines = useMemo(() => {
    return cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          ...item,
          product,
          lineTotalDb: product.priceDb * item.quantity,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [cart, products]);

  const subtotalDb = useMemo(
    () => cartLines.reduce((sum, item) => sum + item.lineTotalDb, 0),
    [cartLines]
  );

  const deliveryFeeDb = cartLines.length > 0 ? selectedZone.feeDb : 0;
  const totalDb = subtotalDb + deliveryFeeDb;

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (cartLines.length === 0) {
      setFormError('Adicione pelo menos um artigo antes de finalizar.');
      return;
    }
    if (!customerName.trim()) {
      setFormError('Indique o seu nome para o estafeta.');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Indique um número de telemóvel de contacto.');
      return;
    }
    if (!addressDetail.trim()) {
      setFormError('Descreva a morada ou ponto de referência da entrega.');
      return;
    }

    const created = onPlaceOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      zoneId: selectedZone.id,
      addressDetail: addressDetail.trim(),
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    if (created) {
      setConfirmedOrder(created);
      setCustomerName('');
      setCustomerPhone('');
      setAddressDetail('');
      setNotes('');
    }
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    setFormError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Carrinho de compras e checkout"
      onClick={handleClose}
    >
      <aside
        className="w-full max-w-lg bg-white h-full flex flex-col border-l border-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-teal-700" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              {confirmedOrder ? 'Pedido Confirmado' : 'Carrinho e Entrega'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar carrinho"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {confirmedOrder ? (
            <div className="space-y-6 py-4">
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Pedido #{confirmedOrder.id} registado com sucesso</span>
                </div>
                <p className="text-sm text-emerald-900 leading-relaxed">
                  Enviado para preparação e atribuído ao corredor{' '}
                  <strong>{confirmedOrder.corridor}</strong> ({confirmedOrder.zoneName}).
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Destinatário</span>
                  <span className="font-medium text-slate-900">
                    {confirmedOrder.customerName}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Zona</span>
                  <span className="font-medium text-slate-900">
                    {confirmedOrder.zoneName}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Morada</span>
                  <span className="font-medium text-slate-900 text-right max-w-[240px]">
                    {confirmedOrder.addressDetail}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pagamento</span>
                  <span className="font-medium text-slate-900">
                    {confirmedOrder.paymentMethod}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between font-semibold text-slate-900">
                  <span>Total a pagar</span>
                  <span className="font-mono-num text-base">
                    {formatDb(confirmedOrder.totalDb)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onGoToDeliveries();
                  }}
                  className="flex-1 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Acompanhar no Painel de Entregas
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium rounded-lg transition-colors"
                >
                  Continuar a comprar
                </button>
              </div>
            </div>
          ) : cartLines.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" strokeWidth={1.5} />
              <p className="text-base font-semibold text-slate-900">
                O seu carrinho está vazio
              </p>
              <p className="text-sm text-slate-600 max-w-xs mx-auto">
                Adicione pratos, produtos de mercearia, eletrónica ou artesanato do catálogo local.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {cartLines.map(({ product, quantity, lineTotalDb }) => (
                  <div
                    key={product.id}
                    className="flex items-start gap-3.5 pb-3.5 border-b border-slate-100"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        title={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 truncate">
                        {product.storeName}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {product.name}
                      </p>
                      <p className="font-mono-num text-xs text-slate-600 mt-0.5">
                        {formatDb(product.priceDb)} · {product.unit}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center border border-slate-200 rounded-md bg-slate-50">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, -1)}
                            aria-label="Diminuir quantidade"
                            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-200/70 rounded-l-md"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono-num text-xs font-semibold px-2 text-slate-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, 1)}
                            disabled={quantity >= product.stock}
                            aria-label="Aumentar quantidade"
                            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-200/70 disabled:opacity-40 rounded-r-md"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono-num text-sm font-semibold text-slate-900">
                            {formatDb(lineTotalDb)}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(product.id)}
                            aria-label={`Remover ${product.name}`}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Dados de entrega em São Tomé
                </h3>

                <label className="block">
                  <span className="block text-xs font-medium text-slate-700 mb-1">
                    Zona / Bairro de entrega
                  </span>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-teal-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedZone.id}
                      onChange={(e) => onChangeZone(e.target.value)}
                      className="w-full min-h-[40px] pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    >
                      {DELIVERY_ZONES.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} — {formatDb(zone.feeDb)} ({zone.etaMin}–{zone.etaMax} min)
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-medium text-slate-700 mb-1">
                      Nome completo
                    </span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Maria Sacramento"
                      className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs font-medium text-slate-700 mb-1">
                      Telemóvel
                    </span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+239 990 0000"
                      className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="block text-xs font-medium text-slate-700 mb-1">
                    Morada e ponto de referência
                  </span>
                  <textarea
                    rows={2}
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    placeholder="Ex: Rua principal de Campo Milho, perto do chafariz, casa verde"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-medium text-slate-700 mb-1">
                      Método de pagamento
                    </span>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="block text-xs font-medium text-slate-700 mb-1">
                      Observações (opcional)
                    </span>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Troco para 500 Db"
                      className="w-full min-h-[40px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
                    />
                  </label>
                </div>

                {formError && (
                  <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}
              </form>
            </>
          )}
        </div>

        {!confirmedOrder && cartLines.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal dos artigos</span>
                <span className="font-mono-num text-slate-900">{formatDb(subtotalDb)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxa de entrega ({selectedZone.name})</span>
                <span className="font-mono-num text-slate-900">{formatDb(deliveryFeeDb)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-base">
                <span>Total</span>
                <span className="font-mono-num">{formatDb(totalDb)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Confirmar Pedido ({formatDb(totalDb)})
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
