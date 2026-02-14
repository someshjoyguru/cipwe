import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

const RICH_SCHEMA_TYPES = [
  'Article', 'BlogPosting', 'NewsArticle', 'TechArticle',
  'Product', 'SoftwareApplication', 'MobileApplication',
  'WebSite', 'Organization', 'LocalBusiness',
  'Course', 'Event', 'Recipe', 'HowTo', 'VideoObject',
  'Service', 'Book', 'CreativeWork',
];

export const articleProductSchemaRule: Rule = {
  id: 'article-product-schema',
  name: 'Article/Product Schema',
  description: 'Check for rich content schemas (Article, Product, Organization, etc.)',
  category: 'structured-data',
  weight: 6,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);
    const jsonldScripts = $('script[type="application/ld+json"]');

    const richTypes: string[] = [];

    jsonldScripts.each((_, el) => {
      try {
        const content = $(el).html();
        if (content) {
          const parsed = JSON.parse(content);
          const extract = (obj: any) => {
            if (obj['@type'] && RICH_SCHEMA_TYPES.includes(obj['@type'])) {
              richTypes.push(obj['@type']);
            }
            if (obj['@graph'] && Array.isArray(obj['@graph'])) {
              obj['@graph'].forEach(extract);
            }
          };
          extract(parsed);
        }
      } catch {
        // Skip
      }
    });

    if (richTypes.length > 0) {
      return {
        ruleId: 'article-product-schema',
        ruleName: 'Article/Product Schema',
        category: 'structured-data',
        passed: true,
        score: 6,
        maxScore: 6,
        message: `Rich schema types found: ${[...new Set(richTypes)].join(', ')}`,
      };
    }

    return {
      ruleId: 'article-product-schema',
      ruleName: 'Article/Product Schema',
      category: 'structured-data',
      passed: false,
      score: 0,
      maxScore: 6,
      message: 'No Article, Product, or Organization schema found',
      suggestion: 'Add structured data for your primary content type (Article for blogs, Product for e-commerce, Organization for businesses)',
    };
  },
};
