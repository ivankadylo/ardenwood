import { PRODUCTS } from '@/lib/constants';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ardenwood.eu';

  const urls = [
    { loc: baseUrl, lastmod: new Date().toISOString() },
    { loc: `${baseUrl}/login`, lastmod: new Date().toISOString() },
    { loc: `${baseUrl}/register`, lastmod: new Date().toISOString() },
    ...PRODUCTS.map(p => ({
      loc: `${baseUrl}/product/${p.slug}`,
      lastmod: new Date().toISOString()
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`).join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
