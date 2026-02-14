import * as cheerio from 'cheerio';

/**
 * Generate JSON-LD structured data based on page analysis.
 */
export function generateJsonLd(url: string, html: string): string {
  const $ = cheerio.load(html);

  const title = $('title').text().trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('h1').first().text().trim() ||
    'Untitled';

  const description = $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';

  const author = $('meta[name="author"]').attr('content')?.trim() || '';
  const image = $('meta[property="og:image"]').attr('content')?.trim() || '';
  const lang = $('html').attr('lang') || 'en';

  // Detect page type
  const pageType = detectPageType($, html);

  const schemas: any[] = [];

  // Always add WebSite schema
  const websiteSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': title,
    'url': url,
    'inLanguage': lang,
  };
  if (description) websiteSchema.description = description;
  schemas.push(websiteSchema);

  // Add page-specific schema
  if (pageType === 'article') {
    const articleSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': title,
      'url': url,
      'inLanguage': lang,
    };
    if (description) articleSchema.description = description;
    if (author) articleSchema.author = { '@type': 'Person', 'name': author };
    if (image) articleSchema.image = image;
    articleSchema.datePublished = new Date().toISOString().split('T')[0];
    schemas.push(articleSchema);
  }

  if (pageType === 'organization') {
    const orgSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': title,
      'url': url,
    };
    if (description) orgSchema.description = description;
    if (image) orgSchema.logo = image;
    schemas.push(orgSchema);
  }

  // Generate FAQ schema if Q&A content detected
  const faqItems = extractFaqItems($);
  if (faqItems.length > 0) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqItems.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer,
        },
      })),
    };
    schemas.push(faqSchema);
  }

  // Add BreadcrumbList if nav structure exists
  const breadcrumbs = extractBreadcrumbs($, url);
  if (breadcrumbs.length > 0) {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url,
      })),
    };
    schemas.push(breadcrumbSchema);
  }

  return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas, null, 2);
}

function detectPageType($: cheerio.CheerioAPI, html: string): string {
  const text = html.toLowerCase();

  if ($('article').length > 0 || text.includes('blog') || text.includes('post')) {
    return 'article';
  }

  if (text.includes('about') || text.includes('company') || text.includes('team')) {
    return 'organization';
  }

  return 'website';
}

function extractFaqItems($: cheerio.CheerioAPI): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = [];

  // Look for question-like headings followed by content
  $('h2, h3, h4').each((_, el) => {
    const text = $(el).text().trim();
    if (text.endsWith('?') ||
      text.toLowerCase().startsWith('what') ||
      text.toLowerCase().startsWith('how') ||
      text.toLowerCase().startsWith('why')) {
      const nextEl = $(el).next();
      const answer = nextEl.text().trim();
      if (answer && answer.length > 10 && items.length < 10) {
        items.push({ question: text, answer: answer.substring(0, 500) });
      }
    }
  });

  // Look for details/summary
  $('details').each((_, el) => {
    const question = $(el).find('summary').text().trim();
    const answer = $(el).text().replace(question, '').trim();
    if (question && answer && items.length < 10) {
      items.push({ question, answer: answer.substring(0, 500) });
    }
  });

  // Look for dt/dd pairs
  $('dt').each((_, el) => {
    const question = $(el).text().trim();
    const answer = $(el).next('dd').text().trim();
    if (question && answer && items.length < 10) {
      items.push({ question, answer: answer.substring(0, 500) });
    }
  });

  return items;
}

function extractBreadcrumbs($: cheerio.CheerioAPI, baseUrl: string): { name: string; url: string }[] {
  const breadcrumbs: { name: string; url: string }[] = [];

  // Look for breadcrumb nav
  $('nav[aria-label*="breadcrumb"] a, [class*="breadcrumb"] a, ol[class*="breadcrumb"] a').each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr('href') || '';
    if (name && href && breadcrumbs.length < 5) {
      const url = href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
      breadcrumbs.push({ name, url });
    }
  });

  return breadcrumbs;
}
