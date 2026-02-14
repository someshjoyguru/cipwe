import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

export const hasStructuredSummaryRule: Rule = {
  id: 'has-structured-summary',
  name: 'Structured Summary',
  description: 'Check if the page provides a clear, machine-readable summary of its content',
  category: 'agent-signals',
  weight: 5,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);

    let signals = 0;
    const details: string[] = [];

    // Check meta description quality (> 50 chars = actually descriptive)
    const metaDesc = $('meta[name="description"]').attr('content')?.trim() || '';
    if (metaDesc.length > 50) {
      signals += 1;
      details.push('descriptive meta description');
    }

    // Check for application-name or site summary meta
    const appName = $('meta[name="application-name"]').attr('content')?.trim();
    if (appName) {
      signals += 1;
      details.push('application-name meta');
    }

    // Check for og:description quality
    const ogDesc = $('meta[property="og:description"]').attr('content')?.trim() || '';
    if (ogDesc.length > 50) {
      signals += 1;
      details.push('rich og:description');
    }

    // Check for language attribute
    const lang = $('html').attr('lang');
    if (lang) {
      signals += 1;
      details.push(`lang="${lang}"`);
    }

    // Check for author info
    const author = $('meta[name="author"]').attr('content')?.trim();
    if (author) {
      signals += 1;
      details.push('author meta');
    }

    // Check for keywords meta
    const keywords = $('meta[name="keywords"]').attr('content')?.trim();
    if (keywords) {
      signals += 1;
      details.push('keywords meta');
    }

    // Check for structured abstract or description in content
    const hasAbstract = $('[class*="abstract"], [class*="summary"], [class*="description"], [class*="intro"]').length > 0;
    if (hasAbstract) {
      signals += 1;
      details.push('content summary section');
    }

    if (signals >= 4) {
      return {
        ruleId: 'has-structured-summary',
        ruleName: 'Structured Summary',
        category: 'agent-signals',
        passed: true,
        score: 5,
        maxScore: 5,
        message: `Strong AI-readable summary signals: ${details.join(', ')}`,
      };
    }

    if (signals >= 2) {
      return {
        ruleId: 'has-structured-summary',
        ruleName: 'Structured Summary',
        category: 'agent-signals',
        passed: true,
        score: 3,
        maxScore: 5,
        message: `Some summary signals: ${details.join(', ')}`,
        suggestion: 'Add more metadata (lang attribute, author, keywords) to help AI agents quickly understand your content',
      };
    }

    return {
      ruleId: 'has-structured-summary',
      ruleName: 'Structured Summary',
      category: 'agent-signals',
      passed: false,
      score: signals > 0 ? 1 : 0,
      maxScore: 5,
      message: 'Weak page summary signals for AI agents',
      suggestion: 'Add comprehensive metadata: lang attribute on <html>, meta description > 50 chars, meta author, og:description. These help AI agents quickly summarize your page',
    };
  },
};
