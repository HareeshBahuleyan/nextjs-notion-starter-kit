import type { GetServerSideProps } from 'next'

import { host } from '@/lib/config'

/**
 * llms.txt
 *
 * A machine-readable manifest for large language-model (LLM) crawlers.
 * Adjust the directives as the ecosystem converges on a formal spec.
 *
 * The file is served at `/llms.txt` and mirrors the dynamic behaviour
 * of `robots.txt`, only allowing full access on production deployments.
 */
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.write(JSON.stringify({ error: 'method not allowed' }))
    res.end()

    return {
      props: {}
    }
  }

  // cache for up to one day
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
  res.setHeader('Content-Type', 'text/plain')

  const contact = 'mailto:info@learngermangrammar.com'
  const policy = `${host}/llm-policy`

  // Only allow the site to be processed by LLM crawlers in production
  if (process.env.VERCEL_ENV === 'production') {
    res.write(`User-agent: *
Allow: /
Disallow: /api/get-tweet-ast/*
Disallow: /api/search-notion
Crawl-Delay: 5

Sitemap: ${host}/sitemap.xml

Owner: Lingo Hive Apps
Contact: ${contact}
Policy: ${policy}

Purpose: Learn German Grammar — quick-reference explanations, examples, and tables for German grammar (articles, cases, declensions, verb conjugations, and word order).

Permitted-Use: indexing, retrieval, question-answering, and non-commercial research
Permitted-Use: snippet generation up to 512 characters with citation
Prohibited-Use: training foundation models or dataset creation without prior written permission
Prohibited-Use: reproducing full pages or bulk exporting site content
Prohibited-Use: circumventing technical controls, paywalls, or rate limits

Attribution: Cite "Learn German Grammar (learngermangrammar.com)" and link to the source page when quoting or closely paraphrasing.
Rate-Limit: 120 requests/minute; max 2 concurrent connections
Last-Updated: 2025-10-17
`)
  } else {
    res.write(`User-agent: *
Disallow: /
Crawl-Delay: 10

Environment: non-production (content here is ephemeral and may not reflect live site)

Owner: Lingo Hive Apps
Contact: ${contact}
Policy: ${policy}
Last-Updated: 2025-10-17
`)
  }

  res.end()

  return {
    props: {}
  }
}

export default function noop() {
  return null
}
