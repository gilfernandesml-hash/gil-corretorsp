import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Building2, Award, Users, Loader2, MessageCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import ImageOptimizer from '@/components/ImageOptimizer';
import Seo from '@/components/Seo';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import LatestNewsSection from '@/components/home/LatestNewsSection';
import GoogleReviewsSection from '@/components/home/GoogleReviewsSection';
import { logBundleInfo } from '@/utils/performanceReporter';
import { trackWhatsAppClick } from '@/utils/analyticsEvents';

// Lazy load components below the fold
const PropertyCard = lazy(() => import('@/components/PropertyCard'));

const DEFAULT_CONTENT = {
  hero_title: 'Especialista em imóveis na Zona Sul de São Paulo',
  hero_subtitle: 'Atendimento consultivo e personalizado para compra de imóveis de médio e alto padrão — com foco em oportunidades e lançamentos em bairros estratégicos.',
  hero_image_url: 'https://gtfdrselcbogwzkrnqmg.supabase.co/storage/v1/object/public/home-page-images/9d594e28-d432-497d-b0a1-95d770893600/0.4540339297486412.png'
};

const TARGET_NEIGHBORHOODS = [
  { label: 'Santo Amaro', slug: 'santo-amaro' },
  { label: 'Adolfo Pinheiro', slug: 'adolfo-pinheiro' },
  { label: 'Brooklin', slug: 'brooklin' },
  { label: 'Campo Belo', slug: 'campo-belo' },
  { label: 'Chácara Santo Antônio', slug: 'chacara-santo-antonio' }
];

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loadingContent, setLoadingContent] = useState(true);
  
  // Search States
  const [searchType, setSearchType] = useState('sale');
  const [propertyType, setPropertyType] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => { 
    logBundleInfo('HomePage');
    fetchPageSettings();
    setTimeout(fetchProperties, 100); 
  }, []);

  const fetchPageSettings = async () => {
    try {
      const { data } = await supabase.from('home_page_settings').select('*').limit(1).maybeSingle();
      if (data) setContent(prev => ({ ...prev, ...data }));
    } catch (e) { console.error(e); } finally { setLoadingContent(false); }
  };

  const fetchProperties = async () => {
    try {
      const { data } = await supabase.from('properties').select('*').eq('featured', true).eq('status', 'active').limit(6);
      setFeaturedProperties(data || []);
    } catch (e) { console.error(e); } finally { setLoadingProperties(false); }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchType) params.append('businessType', searchType);
    if (propertyType) params.append('type', propertyType);
    if (neighborhood) params.append('location', neighborhood);
    navigate(`/imoveis?${params.toString()}`);
  };

  const whatsappPhone = '5511971157373';
  const whatsappText = encodeURIComponent('Olá! Vim pelo site. Quero comprar um imóvel na Zona Sul de São Paulo (médio/alto padrão) e gostaria de sugestões.');
  const whatsappHref = `https://wa.me/${whatsappPhone}?text=${whatsappText}`;

  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': ['RealEstateAgent', 'LocalBusiness'],
    name: 'Gil Fernandes Imóveis',
    url: 'https://gilcorretorsp.com.br/',
    email: 'gilfernandesml@gmail.com',
    telephone: '+55 11 97115-7373',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Av. Chucri Zaidan, 111',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR'
    },
    areaServed: {
      '@type': 'City',
      name: 'São Paulo'
    },
    knowsAbout: [
      'Imóveis na Zona Sul de São Paulo',
      'Santo Amaro',
      'Adolfo Pinheiro',
      'Brooklin',
      'Campo Belo',
      'Chácara Santo Antônio',
      'Lançamentos imobiliários',
      'Investimento imobiliário'
    ]
  };

  return (
    <>
      <Seo
        title={`${content.hero_title} | Gil Fernandes Imóveis SP`}
        description={content.hero_subtitle}
        canonical="/"
        type="website"
        keywords={[
          'imóveis em são paulo',
          'apartamento à venda em são paulo',
          'casa à venda em são paulo',
          'imóveis a venda zona sul sp',
          'imóveis a venda santo amaro',
          'imóveis a venda adolfo pinheiro',
          'imóveisa venda brooklin',
          'imóveis a venda campo belo',
          'imóveis a venda chácara santo antônio',
          'imóveis a venda zona oeste sp',
          'imóveis a venda vila mariana',
          'imóveis a venda pinheiros',
          'imóveis a venda moema',
          'lançamentos imobiliários zona sul sp',
          'investimento imobiliário zona sul sp'
        ]}
        schema={[businessSchema]}
      />

      <main className="min-h-screen">
        {/* HERO - CRITICAL LCP */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
             <ImageOptimizer 
                src={content.hero_image_url} 
                alt="São Paulo Skyline" 
                className="w-full h-full"
                priority={true}
                width={1920}
                height={1080}
                sizes="100vw"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center pt-24">
            <h1
              className="text-white drop-shadow-lg"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 500,
                lineHeight: 1.2,
                letterSpacing: '-0.5px',
                marginBottom: 16,
              }}
            >
              {loadingContent ? <Skeleton className="h-14 w-3/4 mx-auto bg-white/20" /> : content.hero_title}
            </h1>
            <p
              className="max-w-3xl mx-auto mb-10 drop-shadow-md"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(22px, 2.2vw, 24px)',
                fontWeight: 300,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.85)',
                maxWidth: 600,
              }}
            >
              {loadingContent ? <Skeleton className="h-8 w-2/3 mx-auto bg-white/20" /> : content.hero_subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {TARGET_NEIGHBORHOODS.map((n) => (
                <Link
                  key={n.slug}
                  to={`/neighborhood/${n.slug}`}
                  className="rounded-full bg-white/5 text-white border border-white/20 px-5 py-2 text-sm font-medium backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.22)] ring-1 ring-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.28)] hover:scale-[1.03]"
                >
                  {n.label}
                </Link>
              ))}
            </div>

            {/* SEARCH BOX */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 max-w-4xl mx-auto border border-white/40">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select value={searchType} onChange={e => setSearchType(e.target.value)} className="w-full bg-white/90 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d5a7a]/30 focus:border-[#0d5a7a] transition-all">
                  <option value="sale">Comprar</option>
                  <option value="rent">Alugar</option>
                </select>
                <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full bg-white/90 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d5a7a]/30 focus:border-[#0d5a7a] transition-all">
                  <option value="">Todos os Tipos</option>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="commercial">Comercial</option>
                </select>
                <input 
                  value={neighborhood} 
                  onChange={e => setNeighborhood(e.target.value)} 
                  placeholder="Bairro (ex: Pinheiros)" 
                  className="w-full bg-white/90 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d5a7a]/30 focus:border-[#0d5a7a] transition-all" 
                />
              </div>
              <Button onClick={handleSearch} className="w-full mt-6 bg-[#0d5a7a] hover:bg-[#0b4a65] text-white py-5 text-lg font-semibold rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
                <Search className="mr-2" /> Buscar Imóveis
              </Button>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button asChild className="bg-green-600/90 hover:bg-green-700 text-white py-5 text-base font-semibold rounded-xl transition-all duration-300">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2" /> Falar agora no WhatsApp
                  </a>
                </Button>
                <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-[#0d5a7a]" />
                  Atendimento consultivo e seguro
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PROPERTIES - Lazy Loaded */}
        <section className="py-20 bg-[#f5f7fa]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a52]">Imóveis em Destaque</h2>
                <p className="text-gray-500 mt-2">Seleção com alto potencial de valorização e liquidez.</p>
              </div>
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white font-bold">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 w-4 h-4" />
                  Pedir sugestões no WhatsApp
                </a>
              </Button>
            </div>

            {loadingProperties ? (
              <div className="flex flex-col gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl w-full" />)}
              </div>
            ) : (
              <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>}>
                <div className="flex flex-col gap-6" onClickCapture={(e) => {
                  if (e.target.closest('button') && e.target.closest('button').textContent.toLowerCase().includes('whatsapp')) {
                     trackWhatsAppClick({ page_path: window.location.pathname, deal_type: 'venda', source: 'featured_card' });
                  }
                }}>
                  {featuredProperties.map((p, i) => (
                    <PropertyCard key={p.id} property={p} index={i} layout="list" />
                  ))}
                </div>
                <div className="text-center mt-10">
                    <Link to="/imoveis">
                        <Button variant="outline" size="lg" className="border-gray-400 text-gray-700 hover:bg-white hover:text-[#1a3a52]">Ver todos os imóveis</Button>
                    </Link>
                </div>
              </Suspense>
            )}
          </div>
        </section>

        {/* STATS - Static Content */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center">
            <StatItem icon={Award} value="15+ anos" label="Experiência de Mercado" />
            <StatItem icon={Building2} value="100+" label="Imóveis Vendidos" />
            <StatItem icon={Users} value="500+" label="Clientes Satisfeitos" />
          </div>
        </section>

        <WhyChooseSection />
        <HowItWorksSection />
        <GoogleReviewsSection />
        <TestimonialsSection />
        <LatestNewsSection />
      </main>
    </>
  );
};

const StatItem = ({ icon: Icon, value, label }) => (
    <div className="p-6 rounded-xl hover:bg-gray-50 transition-colors">
        <Icon className="mx-auto text-[#0d5a7a] w-12 h-12 mb-4" />
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
        <p className="text-gray-600 font-medium">{label}</p>
    </div>
);

export default HomePage;