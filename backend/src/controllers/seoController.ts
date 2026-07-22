import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getSitemap = async (req: Request, res: Response) => {
  try {
    const host = req.headers.host || 'bionexstar.uz';
    const protocol = req.secure ? 'https' : 'http';
    const baseUrl = `${protocol}://${host.includes('localhost') ? host : 'bionexstar.uz'}`;

    const [medicines, articles] = await Promise.all([
      prisma.medicine.findMany({ select: { id: true, updatedAt: true } }),
      prisma.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    ]);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    const staticPages = ['', '/search', '/b2b', '/blog'];
    staticPages.forEach((page) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Medicines
    medicines.forEach((m) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/medicine/${m.id}</loc>\n`;
      xml += `    <lastmod>${m.updatedAt.toISOString().slice(0, 10)}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    // Blog Articles
    articles.forEach((a) => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/blog/${a.slug}</loc>\n`;
      xml += `    <lastmod>${a.updatedAt.toISOString().slice(0, 10)}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>\n';

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ message: 'Error generating sitemap' });
  }
};

export const getRobots = async (req: Request, res: Response) => {
  try {
    const host = req.headers.host || 'bionexstar.uz';
    const protocol = req.secure ? 'https' : 'http';
    const baseUrl = `${protocol}://${host.includes('localhost') ? host : 'bionexstar.uz'}`;

    let robots = 'User-agent: *\n';
    robots += 'Allow: /\n';
    robots += 'Disallow: /admin/\n';
    robots += 'Disallow: /api/\n';
    robots += `Sitemap: ${baseUrl}/sitemap.xml\n`;

    res.header('Content-Type', 'text/plain');
    res.status(200).send(robots);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    res.status(500).json({ message: 'Error generating robots.txt' });
  }
};
