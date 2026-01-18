import fs from 'node:fs'
import path from 'node:path'

import { load } from 'js-yaml'

export interface PageSchemaConfig {
  path: string
  educationalLevel: string
  topics: string[]
  learningResourceType: string
  description: string
}

export interface SchemaConfigFile {
  pages: PageSchemaConfig[]
}

let cachedSchemaConfig: SchemaConfigFile | null = null

export function loadSchemaConfig(): SchemaConfigFile {
  if (cachedSchemaConfig) {
    return cachedSchemaConfig
  }

  try {
    const configPath = path.join(
      process.cwd(),
      'public',
      'config',
      'schema.yaml'
    )
    const fileContents = fs.readFileSync(configPath, 'utf8')
    const config = load(fileContents) as SchemaConfigFile

    cachedSchemaConfig = config
    return config
  } catch (err) {
    console.error('Error loading schema config:', err)
    return { pages: [] }
  }
}

export function getSchemaConfigForPath(
  urlPath: string
): PageSchemaConfig | null {
  const config = loadSchemaConfig()

  // Normalize the path - remove trailing slashes and ensure leading slash
  let normalizedPath = urlPath.trim()
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath
  }
  if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1)
  }

  // Find exact match first
  const exactMatch = config.pages.find((page) => page.path === normalizedPath)
  if (exactMatch) {
    return exactMatch
  }

  // Try without leading slash
  const pathWithoutSlash = normalizedPath.slice(1)
  const matchWithoutSlash = config.pages.find(
    (page) =>
      page.path === pathWithoutSlash || page.path === '/' + pathWithoutSlash
  )

  return matchWithoutSlash || null
}

export function getAllSchemaConfigs(): PageSchemaConfig[] {
  const config = loadSchemaConfig()
  return config.pages
}
