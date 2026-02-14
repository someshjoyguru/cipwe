import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

export const hasArticleSectionRule: Rule = {
  id: 'has-article-section',
  name: 'Has <article>/<section>',
  description: 'Check if the page uses semantic sectioning elements',
  category: 'semantic-html',
  weight: 5,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);
    const articleCount = $('article').length;
    const sectionCount = $('section').length;
    const navCount = $('nav').length;
    const headerCount = $('header').length;
    const footerCount = $('footer').length;

    const semanticElements = articleCount + sectionCount + navCount + headerCount + footerCount;

    if (articleCount > 0 && sectionCount > 0) {
      return {
        ruleId: 'has-article-section',
        ruleName: 'Has <article>/<section>',
        category: 'semantic-html',
        passed: true,
        score: 5,
        maxScore: 5,
        message: `Rich semantic structure: ${articleCount} <article>, ${sectionCount} <section>, and ${navCount + headerCount + footerCount} other semantic elements`,
      };
    }

    if (articleCount > 0 || sectionCount > 0) {
      return {
        ruleId: 'has-article-section',
        ruleName: 'Has <article>/<section>',
        category: 'semantic-html',
        passed: true,
        score: 4,
        maxScore: 5,
        message: `Semantic sectioning found: ${articleCount} <article>, ${sectionCount} <section>`,
      };
    }

    if (semanticElements > 0) {
      return {
        ruleId: 'has-article-section',
        ruleName: 'Has <article>/<section>',
        category: 'semantic-html',
        passed: false,
        score: 2,
        maxScore: 5,
        message: 'Has some semantic elements but missing <article> or <section>',
        suggestion: 'Use <article> for self-contained content and <section> for thematic groupings',
      };
    }

    return {
      ruleId: 'has-article-section',
      ruleName: 'Has <article>/<section>',
      category: 'semantic-html',
      passed: false,
      score: 0,
      maxScore: 5,
      message: 'No semantic sectioning elements found (using only <div>)',
      suggestion: 'Replace generic <div> containers with <article>, <section>, <nav>, <header>, <footer>. AI agents use semantic HTML to understand page structure',
    };
  },
};
