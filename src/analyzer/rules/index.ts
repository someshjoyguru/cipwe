import type { Rule } from '../../types/index.js';

// Structured Data rules (30 points)
import { jsonldPresenceRule } from './jsonld-presence.js';
import { jsonldValidTypeRule } from './jsonld-valid-type.js';
import { faqSchemaRule } from './faq-schema.js';
import { articleProductSchemaRule } from './article-product-schema.js';

// Semantic HTML rules (20 points)
import { singleH1Rule } from './single-h1.js';
import { headingHierarchyRule } from './heading-hierarchy.js';
import { hasMainRule } from './has-main.js';
import { hasArticleSectionRule } from './has-article-section.js';

// Metadata rules (15 points)
import { hasTitleRule } from './has-title.js';
import { hasMetaDescriptionRule } from './has-meta-description.js';
import { hasOpengraphRule } from './has-opengraph.js';

// Crawl Signals rules (15 points)
import { hasRobotsRule } from './has-robots.js';
import { hasSitemapRule } from './has-sitemap.js';
import { hasCanonicalRule } from './has-canonical.js';

// Content Clarity rules (10 points)
import { contentLengthRule } from './content-length.js';
import { hasListsTablesRule } from './has-lists-tables.js';
import { hasQaStructureRule } from './has-qa-structure.js';

// Agent Signals rules (10 points)
import { hasLlmsTxtRule } from './has-llms-txt.js';
import { hasStructuredSummaryRule } from './has-structured-summary.js';

/**
 * All CIPWE rules — ordered by category.
 * Total max score: 100 points
 */
export const allRules: Rule[] = [
  // Structured Data (30 pts)
  jsonldPresenceRule,         // 10
  jsonldValidTypeRule,        // 8
  faqSchemaRule,              // 6
  articleProductSchemaRule,   // 6

  // Semantic HTML (20 pts)
  singleH1Rule,              // 5
  headingHierarchyRule,       // 5
  hasMainRule,                // 5
  hasArticleSectionRule,      // 5

  // Metadata (15 pts)
  hasTitleRule,               // 5
  hasMetaDescriptionRule,     // 5
  hasOpengraphRule,           // 5

  // Crawl Signals (15 pts)
  hasRobotsRule,              // 5
  hasSitemapRule,             // 5
  hasCanonicalRule,           // 5

  // Content Clarity (10 pts)
  contentLengthRule,          // 3
  hasListsTablesRule,         // 3
  hasQaStructureRule,         // 4

  // Agent Signals (10 pts)
  hasLlmsTxtRule,             // 5
  hasStructuredSummaryRule,   // 5
];
