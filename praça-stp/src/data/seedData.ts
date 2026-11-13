import { CategoryId, DeliveryZone, Order, Product } from '../types/marketplace';

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  comida: 'Comida',
  mercearia: 'Mercearia',
  eletronica: 'Eletrónica',
  artesanato: 'Artesanato',
  vestuario: 'Vestuário',
  outros: 'Outros',
};

export const CATEGORY_OPTIONS: { id: CategoryId; label: string }[] = [
  { id: 'comida', label: 'Comida' },
  { id: 'mercearia', label: 'Mercearia' },
  { id: 'eletronica', label: 'Eletrónica' },
  { id: 'artesanato', label: 'Artesanato' },
  { id: 'vestuario', label: 'Vestuário' },
  { id: 'outros', label: 'Outros' },
];

export const COURIERS = [
  'Edson Mendes',
  'Cláudio Lima',
  'Nádia Sousa',
  'Helder Carvalho',
];

export const HERO_IMAGE_URL = '/src/assets/images/hero_sao_tome_market_1794594192302.jpg';

export const CATEGORY_PRESET_IMAGES: Record<CategoryId, string> = {
  comida: '/src/assets/images/cat_comida_calulu_1794594191780.jpg',
  mercearia: '/src/assets/images/cat_mercearia_cacau_1794594192708.jpg',
  eletronica: '/src/assets/images/cat_eletronica_audio_1794594192625.jpg',
  artesanato: '/src/assets/images/cat_artesanato_cesto_1794594193487.jpg',
  vestuario: '/src/assets/images/cat_vestuario_pano_1794594192492.jpg',
  outros: '/src/assets/images/prod_mel_cafe_1794594193653.jpg',
};

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'centro',
    name: 'Centro (Cidade de São Tomé)',
    district: 'Água Grande',
    corridor: 'Corredor Centro',
    feeDb: 25,
    etaMin: 15,
    etaMax: 25,
  },
  {
    id: 'riboque',
    name: 'Riboque',
    district: 'Água Grande',
    corridor: 'Corredor Centro',
    feeDb: 30,
    etaMin: 20,
    etaMax: 30,
  },
  {
    id: 'campo-milho',
    name: 'Campo Milho',
    district: 'Água Grande',
    corridor: 'Corredor Interior',
    feeDb: 35,
    etaMin: 20,
    etaMax: 35,
  },
  {
    id: 'ile-poule',
    name: 'Île Poule',
    district: 'Água Grande',
    corridor: 'Corredor Costa & Sul',
    feeDb: 40,
    etaMin: 25,
    etaMax: 35,
  },
  {
    id: 'madamba',
    name: 'Madamba',
    district: 'Mé-Zóchi',
    corridor: 'Corredor Interior',
    feeDb: 45,
    etaMin: 25,
    etaMax: 40,
  },
  {
    id: 'pantufo',
    name: 'Pantufo',
    district: 'Água Grande',
    corridor: 'Corredor Costa & Sul',
    feeDb: 45,
    etaMin: 25,
    etaMax: 40,
  },
  {
    id: 'guadalupe',
    name: 'Guadalupe',
    district: 'Lobata',
    corridor: 'Corredor Interior',
    feeDb: 55,
    etaMin: 30,
    etaMax: 45,
  },
  {
    id: 'trindade',
    name: 'Trindade',
    district: 'Mé-Zóchi',
    corridor: 'Corredor Interior',
    feeDb: 60,
    etaMin: 35,
    etaMax: 50,
  },
  {
    id: 'santana',
    name: 'Santana',
    district: 'Cantagalo',
    corridor: 'Corredor Costa & Sul',
    feeDb: 70,
    etaMin: 40,
    etaMax: 55,
  },
  {
    id: 'neves',
    name: 'Neves',
    district: 'Lembá',
    corridor: 'Corredor Interior',
    feeDb: 85,
    etaMin: 45,
    etaMax: 65,
  },
  {
    id: 'angolares',
    name: 'São João dos Angolares',
    district: 'Caué',
    corridor: 'Corredor Costa & Sul',
    feeDb: 95,
    etaMin: 50,
    etaMax: 70,
  },
  {
    id: 'principe',
    name: 'Santo António (Príncipe)',
    district: 'Região Autónoma do Príncipe',
    corridor: 'Corredor Costa & Sul',
    feeDb: 120,
    etaMin: 60,
    etaMax: 90,
  },
];

// A plataforma começa limpa para que cada vendedor publique os seus produtos reais
export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];

// Exemplos opcionais caso o utilizador queira simular compras e entregas sem criar do zero
export const DEMO_SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'exemplo-calulu',
    sellerId: 'vendedor-exemplo-1',
    storeName: 'Cozinha da Dona Elsa',
    sellerPhone: '+239 991 0001',
    sellerZone: 'Campo Milho',
    category: 'comida',
    name: 'Calulu de Peixe Fumado (Exemplo)',
    description: 'Exemplo ilustrativo de prato típico com peixe fumado, quiabo, óleo de palma e banana cozida.',
    priceDb: 200,
    unit: 'Dose',
    stock: 10,
    imageUrl: '/src/assets/images/cat_comida_calulu_1794594191780.jpg',
    createdAt: 'Exemplo',
  },
  {
    id: 'exemplo-cacau',
    sellerId: 'vendedor-exemplo-2',
    storeName: 'Roça Bela Vista',
    sellerPhone: '+239 992 0002',
    sellerZone: 'Madamba',
    category: 'mercearia',
    name: 'Cacau e Café Torrado Local (Exemplo)',
    description: 'Exemplo ilustrativo de produto agrícola local embalado para entrega ao domicílio.',
    priceDb: 150,
    unit: 'Pacote 250g',
    stock: 15,
    imageUrl: '/src/assets/images/prod_mel_cafe_1794594193653.jpg',
    createdAt: 'Exemplo',
  },
];

export function slugifySeller(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'vendedor-local'
  );
}

export function formatDb(amount: number): string {
  return `${new Intl.NumberFormat('pt-PT', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount))} Db`;
}
