import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  profile?: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  noIndex?: boolean;
}

const defaultMeta = {
  title: 'ClipConnect - Find Your Perfect Hairstylist',
  description:
    'Connect with talented hairstylists in your area. Browse portfolios, read reviews, and book appointments with professionals who specialize in your hair type.',
  image: '/og-image.png',
  url: 'https://clipconnect.com',
};

export function SEO({
  title,
  description = defaultMeta.description,
  image = defaultMeta.image,
  url = defaultMeta.url,
  type = 'website',
  article,
  profile,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ClipConnect` : defaultMeta.title;
  const fullImage = image.startsWith('http') ? image : `${url}${image}`;

  return (
    <Head>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="ClipConnect" />
      <meta property="og:locale" content="en_US" />

      {/* Article specific */}
      {article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Profile specific */}
      {profile && (
        <>
          {profile.firstName && (
            <meta property="profile:first_name" content={profile.firstName} />
          )}
          {profile.lastName && (
            <meta property="profile:last_name" content={profile.lastName} />
          )}
          {profile.username && <meta property="profile:username" content={profile.username} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Additional meta tags */}
      <meta name="application-name" content="ClipConnect" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="ClipConnect" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#4f46e5" />
    </Head>
  );
}

export default SEO;
