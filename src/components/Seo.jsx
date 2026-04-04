import React from 'react';
import { Helmet } from 'react-helmet';

const DEFAULT_KEYWORDS = [
  'imóveis em são paulo',
  'imobiliária são paulo',
  'corretor de imóveis sp',
  'apartamento à venda são paulo',
  'apartamento para alugar são paulo',
  'casas à venda são paulo',
  'imóveis na zona sul sp',
  'imóveis na zona oeste sp',
  'imóveis vila mariana',
  'imóveis pinheiros',
  'imóveis moema',
  'imóveis brooklin',
  'lançamentos imobiliários são paulo',
  'mercado imobiliário são paulo',
  'investimento imobiliário sp'
];

const toArray = (val) => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

const getSiteUrl = () => {
  const envUrl = import.meta?.env?.VITE_SITE_URL;
  if (typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof document !== 'undefined') {
    const metaSiteUrl = document.querySelector('meta[name="site-url"]')?.getAttribute('content');
    if (typeof metaSiteUrl === 'string' && metaSiteUrl.trim()) {
      return metaSiteUrl.replace(/\/$/, '');
    }
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://gilcorretorsp.com.br';
};

const joinUrl = (base, path) => {
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

const Seo = ({
  title,
  description,
  canonical,
  keywords,
  image,
  type = 'website',
  noindex = false,
  schema,
  lang = 'pt-BR',
  siteName = 'Gil Imóveis SP',
  twitterSite,
  twitterCreator
}) => {
  const siteUrl = getSiteUrl();
  const canonicalUrl = canonical ? joinUrl(siteUrl, canonical) : siteUrl;
  const ogImage = image ? joinUrl(siteUrl, image) : joinUrl(siteUrl, '/og-default.jpg');

  const keywordList = [...DEFAULT_KEYWORDS, ...toArray(keywords).filter(Boolean)];
  const keywordsContent = [...new Set(keywordList.map(k => String(k).trim()).filter(Boolean))].join(', ');

  const robots = noindex ? 'noindex,nofollow' : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1';

  const schemas = toArray(schema).filter(Boolean);

  return (
    <Helmet htmlAttributes={{ lang }}>
      {title ? <title>{title}</title> : null}
      {description ? <meta name="description" content={description} /> : null}
      <meta name="robots" content={robots} />
      <meta name="keywords" content={keywordsContent} />
      <meta name="geo.region" content="BR-SP" />
      <meta name="geo.placename" content="São Paulo" />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:type" content={type} />
      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      {title ? <meta name="twitter:title" content={title} /> : null}
      {description ? <meta name="twitter:description" content={description} /> : null}
      <meta name="twitter:image" content={ogImage} />
      {twitterSite ? <meta name="twitter:site" content={twitterSite} /> : null}
      {twitterCreator ? <meta name="twitter:creator" content={twitterCreator} /> : null}

      {schemas.map((s, idx) => (
        <script key={idx} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
};

export default Seo;
