import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle } from 'lucide-react';
import Seo from '@/components/Seo';
import { Button } from '@/components/ui/button';

const TARGET_NEIGHBORHOODS = [
  {
    name: 'Santo Amaro',
    slug: 'santo-amaro',
    description: 'Infraestrutura completa, mobilidade e opções de médio e alto padrão.'
  },
  {
    name: 'Adolfo Pinheiro',
    slug: 'adolfo-pinheiro',
    description: 'Região estratégica com alta demanda e excelente liquidez.'
  },
  {
    name: 'Brooklin',
    slug: 'brooklin',
    description: 'Perfil corporativo e residencial premium, ideal para morar e investir.'
  },
  {
    name: 'Campo Belo',
    slug: 'campo-belo',
    description: 'Bairro valorizado, ruas arborizadas e imóveis de alto padrão.'
  },
  {
    name: 'Chácara Santo Antônio',
    slug: 'chacara-santo-antonio',
    description: 'Praticidade, acesso fácil e oportunidades em condomínios modernos.'
  }
];

const NeighborhoodHubPage = () => {
  const whatsappPhone = '5511971157373';
  const whatsappText = encodeURIComponent('Olá! Quero sugestões de imóveis na Zona Sul (Santo Amaro, Brooklin, Campo Belo...) para compra/investimento.');
  const whatsappHref = `https://wa.me/${whatsappPhone}?text=${whatsappText}`;

  return (
    <>
      <Seo
        title="Bairros da Zona Sul SP | Santo Amaro, Brooklin, Campo Belo e mais"
        description="Conheça os bairros estratégicos da Zona Sul de São Paulo onde atuo com foco em imóveis de médio e alto padrão, lançamentos e oportunidades de investimento."
        canonical="/bairros"
        type="website"
        keywords={[
          'bairros zona sul são paulo',
          'imóveis santo amaro',
          'imóveis brooklin',
          'imóveis campo belo',
          'imóveis chácara santo antônio',
          'imóveis adolfo pinheiro',
          'investimento imobiliário zona sul'
        ]}
      />

      <main className="min-h-screen bg-[#f5f7fa] pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-[#1a3a52]">
                Bairros estratégicos da Zona Sul
              </h1>
              <p className="text-gray-600 mt-3 max-w-2xl">
                Conteúdo local e imóveis selecionados para quem busca compra de médio e alto padrão — com foco em lançamentos e oportunidades de investimento.
              </p>
            </div>

            <Button asChild className="bg-green-600 hover:bg-green-700 text-white font-bold">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" /> Falar no WhatsApp
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {TARGET_NEIGHBORHOODS.map((n) => (
              <Link
                key={n.slug}
                to={`/neighborhood/${n.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-center gap-2 text-[#0d5a7a]">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Zona Sul SP</span>
                </div>
                <h2 className="mt-3 text-xl font-extrabold text-[#1a3a52] group-hover:text-[#0d5a7a] transition-colors">
                  {n.name}
                </h2>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{n.description}</p>
                <div className="mt-5 text-sm font-bold text-[#0d5a7a]">
                  Ver imóveis e guia do bairro
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-gray-100 bg-white p-8">
            <h3 className="text-2xl font-extrabold text-[#1a3a52]">Não encontrou o que procura?</h3>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Me diga o bairro, faixa de preço e tipo de imóvel. Eu filtro as melhores oportunidades e te envio sugestões.
            </p>
            <div className="mt-6">
              <Button asChild className="bg-[#0d5a7a] hover:bg-[#0b4a65] text-white font-bold">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" /> Pedir curadoria no WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default NeighborhoodHubPage;
