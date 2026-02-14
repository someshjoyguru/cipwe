import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

const VALID_SCHEMA_TYPES = [
  'WebSite', 'WebPage', 'Article', 'BlogPosting', 'NewsArticle',
  'Product', 'Organization', 'Person', 'LocalBusiness', 'FAQPage',
  'HowTo', 'Recipe', 'Event', 'Course', 'SoftwareApplication',
  'MobileApplication', 'VideoObject', 'ImageObject', 'BreadcrumbList',
  'ItemList', 'Service', 'Offer', 'Review', 'AggregateRating',
  'CreativeWork', 'TechArticle', 'APIReference', 'Book',
];

export const jsonldValidTypeRule: Rule = {
  id: 'jsonld-valid-type',
  name: 'JSON-LD Valid Type',
  description: 'Check if JSON-LD uses a recognized Schema.org type',
  category: 'structured-data',
  weight: 8,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);
    const jsonldScripts = $('script[type="application/ld+json"]');

    if (jsonldScripts.length === 0) {
      return {
        ruleId: 'jsonld-valid-type',
        ruleName: 'JSON-LD Valid Type',
        category: 'structured-data',
        passed: false,
        score: 0,
        maxScore: 8,
        message: 'No JSON-LD found to validate type',
        suggestion: 'Add JSON-LD with a valid @type like WebSite, Article, Product, or Organization',
      };
    }

    const foundTypes: string[] = [];

    jsonldScripts.each((_, el) => {
      try {
        const content = $(el).html();
        if (content) {
          const parsed = JSON.parse(content);
          const extractTypes = (obj: any) => {
            if (obj['@type']) {
              const types = Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']];
              foundTypes.push(...types);
            }
            if (obj['@graph'] && Array.isArray(obj['@graph'])) {
              obj['@graph'].forEach(extractTypes);
            }
          };
          extractTypes(parsed);
        }
      } catch {
        // Skip invalid JSON
      }
    });

    const validFound = foundTypes.filter(t => VALID_SCHEMA_TYPES.includes(t));

    if (validFound.length > 0) {
      return {
        ruleId: 'jsonld-valid-type',
        ruleName: 'JSON-LD Valid Type',
        category: 'structured-data',
        passed: true,
        score: 8,
        maxScore: 8,
        message: `Valid Schema.org types found: ${validFound.join(', ')}`,
      };
    }

    if (foundTypes.length > 0) {
      return {
        ruleId: 'jsonld-valid-type',
        ruleName: 'JSON-LD Valid Type',
        category: 'structured-data',
        passed: false,
        score: 4,
        maxScore: 8,
        message: `JSON-LD types found but not standard: ${foundTypes.join(', ')}`,
        suggestion: `Use standard Schema.org types like: ${VALID_SCHEMA_TYPES.slice(0, 8).join(', ')}`,
      };
    }

    return {
      ruleId: 'jsonld-valid-type',
      ruleName: 'JSON-LD Valid Type',
      category: 'structured-data',
      passed: false,
      score: 0,
      maxScore: 8,
      message: 'No @type found in JSON-LD',
      suggestion: 'Add @type field to your JSON-LD structured data',
    };
  },
};
