export type CategoryId =
  | 'comida'
  | 'mercearia'
  | 'eletronica'
  | 'artesanato'
  | 'vestuario'
  | 'outros';

export type OrderStatus =
  | 'pendente'
  | 'em_preparacao'
  | 'pronto_entrega'
  | 'em_rota'
  | 'entregue';

export type PaymentMethod =
  | 'Dinheiro na Entrega'
  | 'Dobra24 / Transferência'
  | 'Pagamento Móvel Local';

export type ActiveTab = 'catalogo' | 'lojas' | 'entregas' | 'vendedor';

export interface DeliveryZone {
  id: string;
  name: string;
  district: string;
  corridor: 'Corredor Centro' | 'Corredor Interior' | 'Corredor Costa & Sul';
  feeDb: number;
  etaMin: number;
  etaMax: number;
}

export interface SellerSummary {
  id: string;
  name: string;
  phone: string;
  zoneName: string;
  categories: CategoryId[];
  productCount: number;
  previewImage: string;
}

export interface Product {
  id: string;
  sellerId: string;
  storeName: string;
  sellerPhone: string;
  sellerZone: string;
  category: CategoryId;
  name: string;
  description: string;
  priceDb: number;
  unit: string;
  stock: number;
  imageUrl: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  storeName: string;
  priceDb: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  zoneId: string;
  zoneName: string;
  corridor: DeliveryZone['corridor'];
  addressDetail: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotalDb: number;
  deliveryFeeDb: number;
  totalDb: number;
  status: OrderStatus;
  courierName: string;
  routeSequence: number;
  createdAt: string;
  notes?: string;
}
