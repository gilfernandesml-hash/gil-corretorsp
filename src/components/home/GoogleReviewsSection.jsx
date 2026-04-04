import React from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GoogleReviewsSection = ({ googleMapsUrl }) => {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a3a52]">Avaliações no Google</h2>
            <p className="text-gray-500 mt-2">
              Em breve você verá aqui as avaliações verificadas do Google Meu Negócio.
            </p>
          </div>

          {googleMapsUrl ? (
            <Button asChild variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" /> Ver no Google
              </a>
            </Button>
          ) : null}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-[#f5f7fa] p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex items-center gap-2 text-[#ff8c42]">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5" />
              ))}
            </div>

            <div className="flex-1">
              <p className="font-bold text-[#1a3a52]">Transparência e confiança</p>
              <p className="text-sm text-gray-600 mt-1">
                Assim que o perfil estiver com volume suficiente, vamos integrar e exibir as avaliações automaticamente.
              </p>
            </div>

            {googleMapsUrl ? (
              <Button asChild className="bg-[#0d5a7a] hover:bg-[#0b4a65] text-white font-bold">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  Escrever avaliação
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviewsSection;
