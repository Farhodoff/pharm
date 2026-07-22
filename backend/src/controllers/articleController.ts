import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createAuditLog } from '../utils/auditLogger';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `article-${Date.now()}`;
}

export const getArticles = async (req: Request, res: Response) => {
  try {
    const { search, published, page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (published !== undefined && published !== '') {
      filter.published = published === 'true';
    }
    if (search) {
      filter.OR = [
        { title: { contains: String(search) } },
        { excerpt: { contains: String(search) } },
        { content: { contains: String(search) } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.article.count({ where: filter }),
    ]);

    res.json({
      data: articles,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Fetch articles error:', error);
    res.status(500).json({ message: 'Error fetching articles' });
  }
};

export const getArticleBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const article = await prisma.article.findUnique({
      where: { slug: String(slug) },
    });

    if (!article) {
      res.status(404).json({ message: 'Maqola topilmadi' });
      return;
    }

    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    res.json(article);
  } catch (error) {
    console.error('Fetch article by slug error:', error);
    res.status(500).json({ message: 'Error fetching article' });
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, image, author, published } = req.body;

    let baseSlug = slugify(title);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.article.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug: uniqueSlug,
        excerpt: excerpt || title,
        content,
        image: image || null,
        author: author || 'BIO NEX STAR Farmatsevt',
        published: published === undefined ? true : Boolean(published),
      },
    });

    const adminUser = (req as any).user?.username || 'Admin';
    await createAuditLog(adminUser, 'CREATE_ARTICLE', { id: article.id, title: article.title });

    res.status(201).json(article);
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ message: 'Maqola yaratishda xatolik' });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { title, excerpt, content, image, author, published } = req.body;

    const article = await prisma.article.update({
      where: { id: Number(id) },
      data: {
        title,
        excerpt,
        content,
        image,
        author,
        published: published !== undefined ? Boolean(published) : undefined,
      },
    });

    const adminUser = (req as any).user?.username || 'Admin';
    await createAuditLog(adminUser, 'UPDATE_ARTICLE', { id: article.id, title: article.title });

    res.json(article);
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ message: 'Maqolani yangilashda xatolik' });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const article = await prisma.article.delete({
      where: { id: Number(id) },
    });

    const adminUser = (req as any).user?.username || 'Admin';
    await createAuditLog(adminUser, 'DELETE_ARTICLE', { id: article.id, title: article.title });

    res.json({ message: 'Maqola o\'chirildi' });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: 'Maqolani o\'chirishda xatolik' });
  }
};
