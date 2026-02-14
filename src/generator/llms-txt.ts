import * as cheerio from 'cheerio';

/**
 * Generate an llms.txt file based on page analysis.
 * Following the llms.txt proposed standard.
 */
export function generateLlmsTxt(url: string, html: string): string {
  const $ = cheerio.load(html);

  const title = $('title').text().trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('h1').first().text().trim() ||
    'Untitled Site';

  const description = $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';

  const author = $('meta[name="author"]').attr('content')?.trim() || '';
  const lang = $('html').attr('lang') || 'en';

  // Extract key headings for content overview
  const headings: string[] = [];
  $('h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text && headings.length < 10) {
      headings.push(text);
    }
  });

  // Extract nav links for key pages
  const navLinks: { text: string; href: string }[] = [];
  $('nav a, header a').each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href') || '';
    if (text && href && !href.startsWith('#') && navLinks.length < 8) {
      navLinks.push({ text, href });
    }
  });

  let output = `# ${title}\n\n`;

  if (description) {
    output += `> ${description}\n\n`;
  }

  output += `This file provides information about ${title} for AI agents and LLMs.\n\n`;

  if (author) {
    output += `- **Author**: ${author}\n`;
  }
  output += `- **Language**: ${lang}\n`;
  output += `- **URL**: ${url}\n`;
  output += `- **AI Usage**: Allowed with attribution\n`;
  output += `- **Last Updated**: ${new Date().toISOString().split('T')[0]}\n\n`;

  if (navLinks.length > 0) {
    output += `## Key Pages\n\n`;
    for (const link of navLinks) {
      const fullUrl = link.href.startsWith('http') ? link.href : `${url}${link.href.startsWith('/') ? '' : '/'}${link.href}`;
      output += `- [${link.text}](${fullUrl})\n`;
    }
    output += '\n';
  }

  if (headings.length > 0) {
    output += `## Content Overview\n\n`;
    for (const heading of headings) {
      output += `- ${heading}\n`;
    }
    output += '\n';
  }

  output += `## Optional\n\n`;
  output += `For detailed documentation, visit: ${url}\n`;

  return output;
}
