import { type ExtendedRecordMap, type PageBlock } from 'notion-types'
import { getBlockTitle, getPageProperty } from 'notion-utils'

export interface LearningResourceSchema {
  '@context': string
  '@type': string
  '@id': string
  educationalLevel?: string
  teaches?: string[]
  learningResourceType?: string
  name: string
  description?: string
  url?: string
  author?: {
    '@type': string
    name: string
  }
  image?: string
}

export async function generateLearningResourceSchema(
  block: PageBlock,
  recordMap: ExtendedRecordMap,
  site: any,
  pageUrl: string
): Promise<LearningResourceSchema | null> {
  const title = getBlockTitle(block, recordMap)
  if (!title) return null

  // Extract URL path from full URL
  let urlPath = pageUrl
  try {
    const url = new URL(pageUrl)
    urlPath = url.pathname
  } catch {
    // If pageUrl is already a path, use it as is
    urlPath = pageUrl.startsWith('/') ? pageUrl : '/' + pageUrl
  }

  // Dynamically import schema config loader (server-side only)
  const { getSchemaConfigForPath } = await import('./schema-config-loader')
  const yamlConfig = getSchemaConfigForPath(urlPath)

  if (!yamlConfig) {
    // No config found for this page
    return null
  }

  // Build schema from YAML config
  const schema: LearningResourceSchema = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': `${pageUrl}#LearningResource`,
    educationalLevel: yamlConfig.educationalLevel,
    teaches: yamlConfig.topics,
    learningResourceType: yamlConfig.learningResourceType,
    name: title,
    description: yamlConfig.description,
    url: pageUrl
  }

  // Add author if site info available
  if (site?.author) {
    schema.author = {
      '@type': 'Organization',
      name: site.author
    }
  }

  // Add image if available
  const image =
    getPageProperty<string>('Social Image', block, recordMap) ||
    (block as PageBlock).format?.page_cover
  if (image) {
    schema.image = image
  }

  return schema
}

export async function generateStructuredDataJson(
  block: PageBlock,
  recordMap: ExtendedRecordMap,
  site: any,
  pageUrl: string,
  isBlogPost: boolean
): Promise<string> {
  const schemas: any[] = []

  // Add LearningResource schema for educational content
  const learningResourceSchema = await generateLearningResourceSchema(
    block,
    recordMap,
    site,
    pageUrl
  )

  if (learningResourceSchema) {
    schemas.push(learningResourceSchema)
  }

  // Add BlogPosting schema for blog posts (existing functionality)
  if (isBlogPost) {
    const title = getBlockTitle(block, recordMap) || site?.name
    const description =
      getPageProperty<string>('Description', block, recordMap) ||
      site?.description
    const image =
      getPageProperty<string>('Social Image', block, recordMap) ||
      (block as PageBlock).format?.page_cover

    const blogSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${pageUrl}#BlogPosting`,
      mainEntityOfPage: pageUrl,
      url: pageUrl,
      headline: title,
      name: title,
      description,
      author: {
        '@type': 'Person',
        name: site?.author || 'Anonymous'
      },
      image
    }
    schemas.push(blogSchema)
  }

  return JSON.stringify(schemas.length === 1 ? schemas[0] : schemas)
}
