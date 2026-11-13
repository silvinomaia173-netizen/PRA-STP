import { ArrowRight, MapPin, Phone, PlusCircle, Store } from 'lucide-react';
import { CATEGORY_LABELS } from '../data/seedData';
import { SellerSummary } from '../types/marketplace';
import { ProductImage } from './ProductImage';

interface StoresViewProps {
  sellers: SellerSummary[];
  onSelectSeller: (sellerId: string) => void;
  onGoToSell: () => void;
}

export function StoresView({
  sellers,
  onSelectSeller,
  onGoToSell,
}: StoresViewProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8 pb-16">
      <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-teal-800">
            Vendedores e lojas registadas
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Quem está a vender na Praça STP
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Esta lista é atualizada automaticamente sempre que um comerciante ou vendedor particular publica os seus produtos.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToSell}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publicar o meu produto</span>
        </button>
      </div>

      {sellers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4">
          <Store className="w-10 h-10 text-slate-300 mx-auto" strokeWidth={1.5} />
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Nenhum vendedor publicado ainda
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Assim que publicar o seu primeiro produto na aba Vender, o seu nome ou loja aparecerá automaticamente aqui.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToSell}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Começar a vender agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((seller) => (
            <article
              key={seller.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div>
                <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
                  <ProductImage
                    src={seller.previewImage}
                    alt={seller.name}
                    title={seller.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 space-y-3">
                  <div className="text-xs font-medium text-teal-800">
                    {seller.categories.map((c) => CATEGORY_LABELS[c]).join(' · ')}
                  </div>

                  <h2 className="font-display text-xl font-semibold text-slate-900">
                    {seller.name}
                  </h2>

                  <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {seller.zoneName}
                    </span>
                    {seller.phone && (
                      <span className="inline-flex items-center gap-1 font-mono-num">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {seller.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="font-mono-num text-xs text-slate-600">
                  {seller.productCount}{' '}
                  {seller.productCount === 1 ? 'produto à venda' : 'produtos à venda'}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectSeller(seller.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-teal-800 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Ver produtos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
