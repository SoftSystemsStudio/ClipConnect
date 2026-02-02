import { GetServerSideProps } from 'next';
import prisma from '../lib/prisma';

function generateSiteMap(
  baseUrl: string,
  professionals: { id: number; updatedAt: Date }[],
  posts: { id: number; createdAt: Date }[]
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/explore</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/signin</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/signup</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Professional profiles -->
  ${professionals
    .map(
      (pro) => `
  <url>
    <loc>${baseUrl}/profiles/${pro.id}</loc>
    <lastmod>${pro.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('')}

  <!-- Posts -->
  ${posts
    .map(
      (post) => `
  <url>
    <loc>${baseUrl}/posts/${post.id}</loc>
    <lastmod>${post.createdAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('')}
</urlset>`;
}

function SiteMap() {
  // This component doesn't render anything
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Fetch all professionals
  const professionals = await prisma.user.findMany({
    where: { role: 'PRO' },
    select: { id: true, updatedAt: true },
  });

  // Fetch all published posts
  const posts = await prisma.post.findMany({
    where: { isPublished: true },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 1000, // Limit to most recent 1000 posts
  });

  const sitemap = generateSiteMap(baseUrl, professionals, posts);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;
