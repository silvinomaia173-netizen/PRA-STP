import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  PackageCheck,
  Phone,
  Search,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react';
import { COURIERS, formatDb } from '../data/seedData';
import { DeliveryZone, Order, OrderStatus } from '../types/marketplace';

interface DeliveryPanelProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onAssignCourier: (orderId: string, courierName: string) => void;
  onReorderRoute: (orderId: string, direction: 'up' | 'down') => void;
  onGoToCatalog: () => void;
}

const STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    colorClass: string;
    nextStatus?: OrderStatus;
    nextActionLabel?: string;
  }
> = {
  pendente: {
    label: 'Pendente',
    colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
    nextStatus: 'em_preparacao',
    nextActionLabel: 'Aceitar e preparar',
  },
  em_preparacao: {
    label: 'Em preparação',
    colorClass: 'text-sky-800 bg-sky-50 border-sky-200',
    nextStatus: 'pronto_entrega',
    nextActionLabel: 'Marcar pronto para entrega',
  },
  pronto_entrega: {
    label: 'Pronto para entrega',
    colorClass: 'text-teal-800 bg-teal-50 border-teal-200',
    nextStatus: 'em_rota',
    nextActionLabel: 'Iniciar rota de entrega',
  },
  em_rota: {
    label: 'Em rota',
    colorClass: 'text-indigo-800 bg-indigo-50 border-indigo-200',
    nextStatus: 'entregue',
    nextActionLabel: 'Confirmar entrega',
  },
  entregue: {
    label: 'Entregue',
    colorClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  },
};

const CORRIDORS: DeliveryZone['corridor'][] = [
  'Corredor Centro',
  'Corredor Interior',
  'Corredor Costa & Sul',
];

function StatusIcon({ status }: { status: OrderStatus }) {
  switch (status) {
    case 'pendente':
      return <Clock className="w-3.5 h-3.5" />;
    case 'em_preparacao':
      return <UtensilsCrossed className="w-3.5 h-3.5" />;
    case 'pronto_entrega':
      return <PackageCheck className="w-3.5 h-3.5" />;
    case 'em_rota':
      return <Bike className="w-3.5 h-3.5" />;
    case 'entregue':
      return <CheckCircle2 className="w-3.5 h-3.5" />;
  }
}

export function DeliveryPanel({
  orders,
  onUpdateOrderStatus,
  onAssignCourier,
  onReorderRoute,
  onGoToCatalog,
}: DeliveryPanelProps) {
  const [viewMode, setViewMode] = useState<'fila' | 'rotas'>('fila');
  const [statusFilter, setStatusFilter] = useState<'todos' | OrderStatus>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = useMemo(() => {
    return {
      pendente: orders.filter((o) => o.status === 'pendente').length,
      em_preparacao: orders.filter((o) => o.status === 'em_preparacao').length,
      prontosOuRota: orders.filter(
        (o) => o.status === 'pronto_entrega' || o.status === 'em_rota'
      ).length,
      entregue: orders.filter((o) => o.status === 'entregue').length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== 'todos' && order.status !== statusFilter) return false;
      if (q) {
        const match =
          order.id.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.zoneName.toLowerCase().includes(q) ||
          order.addressDetail.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const activeRoutesByCorridor = useMemo(() => {
    return CORRIDORS.map((corridor) => {
      const list = orders
        .filter((o) => o.corridor === corridor && o.status !== 'entregue')
        .sort((a, b) => a.routeSequence - b.routeSequence);
      return { corridor, orders: list };
    });
  }, [orders]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-teal-800">
            Operações e despachos locais
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Painel de Gestão de Entregas
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Acompanhe encomendas feitas pelos clientes, atualize o estado de preparação e organize as paragens por zona.
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('fila')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'fila'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fila de pedidos
          </button>
          <button
            type="button"
            onClick={() => setViewMode('rotas')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              viewMode === 'rotas'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Organizar rotas locais
          </button>
        </div>
      </div>

      {/* 4-column flat summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500">Pedidos pendentes</p>
          <p className="font-mono-num text-2xl font-bold text-slate-900 mt-1">
            {counts.pendente}
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500">Em preparação</p>
          <p className="font-mono-num text-2xl font-bold text-slate-900 mt-1">
            {counts.em_preparacao}
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500">Prontos / Em rota</p>
          <p className="font-mono-num text-2xl font-bold text-teal-800 mt-1">
            {counts.prontosOuRota}
          </p>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-xs text-slate-500">Entregues hoje</p>
          <p className="font-mono-num text-2xl font-bold text-slate-900 mt-1">
            {counts.entregue}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" strokeWidth={1.5} />
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Ainda não existem pedidos na fila de entregas
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Quando um cliente finalizar uma compra no carrinho com a sua zona de São Tomé, a encomenda aparecerá aqui para preparação e envio.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToCatalog}
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Ir para o Catálogo
          </button>
        </div>
      ) : viewMode === 'fila' ? (
        <div className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter('todos')}
                className={`px-3 py-2 min-h-[38px] text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  statusFilter === 'todos'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Todos ({orders.length})
              </button>
              {(Object.keys(STATUS_META) as OrderStatus[]).map((statusKey) => {
                const count = orders.filter((o) => o.status === statusKey).length;
                return (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setStatusFilter(statusKey)}
                    className={`px-3 py-2 min-h-[38px] text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                      statusFilter === statusKey
                        ? 'bg-teal-700 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {STATUS_META[statusKey].label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar #STP, zona ou cliente..."
                className="w-full min-h-[38px] pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-600">
              Nenhum pedido corresponde ao filtro selecionado.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const meta = STATUS_META[order.status];
                return (
                  <article
                    key={order.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono-num text-sm font-bold text-slate-900">
                          #{order.id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-md ${meta.colorClass}`}
                        >
                          <StatusIcon status={order.status} />
                          <span>{meta.label}</span>
                        </span>
                        <span className="text-xs text-slate-500 font-mono-num">
                          Registado às {order.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          {order.paymentMethod}
                        </span>
                        <span className="font-mono-num text-base font-bold text-slate-900">
                          {formatDb(order.totalDb)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-5 space-y-2 text-sm">
                        <p className="font-semibold text-slate-900">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-slate-600 inline-flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono-num">{order.customerPhone}</span>
                        </p>
                        <p className="text-xs text-slate-700 flex items-start gap-1.5 leading-relaxed">
                          <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                          <span>
                            <strong>{order.zoneName}</strong> — {order.addressDetail}
                          </span>
                        </p>
                        {order.notes && (
                          <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
                            Nota: {order.notes}
                          </p>
                        )}
                      </div>

                      <div className="lg:col-span-4 space-y-1.5 text-xs">
                        <p className="font-semibold text-slate-700">
                          Artigos do pedido
                        </p>
                        <ul className="space-y-1 text-slate-600">
                          {order.items.map((item) => (
                            <li
                              key={`${order.id}-${item.productId}`}
                              className="flex justify-between gap-2"
                            >
                              <span className="truncate">
                                <strong className="font-mono-num text-slate-900">
                                  {item.quantity}x
                                </strong>{' '}
                                {item.name} ({item.storeName})
                              </span>
                              <span className="font-mono-num text-slate-800 shrink-0">
                                {formatDb(item.priceDb * item.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="pt-1 text-slate-500 flex justify-between border-t border-slate-100">
                          <span>Taxa de entrega ({order.corridor})</span>
                          <span className="font-mono-num">{formatDb(order.deliveryFeeDb)}</span>
                        </p>
                      </div>

                      <div className="lg:col-span-3 flex flex-col justify-between gap-3 lg:items-end">
                        <label className="w-full">
                          <span className="block text-xs font-medium text-slate-600 mb-1">
                            Estafeta atribuído
                          </span>
                          <select
                            value={order.courierName}
                            onChange={(e) => onAssignCourier(order.id, e.target.value)}
                            disabled={order.status === 'entregue'}
                            className="w-full min-h-[38px] px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-teal-700"
                          >
                            {COURIERS.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </label>

                        {meta.nextStatus && meta.nextActionLabel ? (
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateOrderStatus(order.id, meta.nextStatus!)
                            }
                            className="w-full px-3.5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                          >
                            {meta.nextActionLabel}
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-emerald-700">
                            Entrega concluída
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeRoutesByCorridor.map(({ corridor, orders: corridorOrders }) => (
            <div
              key={corridor}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
            >
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">
                    {corridor}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ordem de paragens para estafetas
                  </p>
                </div>
                <span className="font-mono-num text-xs font-semibold text-slate-700">
                  {corridorOrders.length}{' '}
                  {corridorOrders.length === 1 ? 'paragem' : 'paragens'}
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1">
                {corridorOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    Sem entregas ativas neste corredor.
                  </p>
                ) : (
                  corridorOrders.map((order, idx) => {
                    const meta = STATUS_META[order.status];
                    return (
                      <div
                        key={order.id}
                        className="border border-slate-200 rounded-lg p-3.5 space-y-2.5 bg-white"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-semibold text-teal-800 font-mono-num">
                              Paragem {idx + 1} · #{order.id}
                            </p>
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {order.zoneName}
                            </p>
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {order.addressDetail}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => onReorderRoute(order.id, 'up')}
                              aria-label="Subir na rota"
                              className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-30"
                            >
                              <ArrowUp className="w-3.5 h-3.5 text-slate-700" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === corridorOrders.length - 1}
                              onClick={() => onReorderRoute(order.id, 'down')}
                              aria-label="Descer na rota"
                              className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-30"
                            >
                              <ArrowDown className="w-3.5 h-3.5 text-slate-700" />
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                          <span className="text-slate-600 truncate">
                            Estafeta: <strong className="text-slate-900">{order.courierName}</strong>
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 font-semibold border rounded ${meta.colorClass}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
