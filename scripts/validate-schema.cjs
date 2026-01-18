#!/usr/bin/env node

/**
 * Pre-commit hook to validate schema.yaml matches sitemap
 * Fails commit if pages in sitemap are missing from schema.yaml
 */

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const https = require('https')

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

// Get project root directory
const projectRoot = path.resolve(__dirname, '..')

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`)
}

async function fetchSitemapPages() {
  // Read sitemap.xml from public folder (generated at build time)
  const sitemapPath = path.join(projectRoot, 'public', 'sitemap.xml')
  
  if (!fs.existsSync(sitemapPath)) {
    log('⚠️  No sitemap.xml found. Fetching from live site...', YELLOW)
    
    return new Promise((resolve, reject) => {
      https.get('https://www.learngermangrammar.com/sitemap.xml', (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          const pages = extractPagesFromSitemap(data)
          resolve(pages)
        })
      }).on('error', reject)
    })
  }
  
  const content = fs.readFileSync(sitemapPath, 'utf8')
  return extractPagesFromSitemap(content)
}

function extractPagesFromSitemap(xmlContent) {
  const pages = []
  const regex = /<loc>([^<]+)<\/loc>/g
  let match
  
  while ((match = regex.exec(xmlContent)) !== null) {
    const url = match[1]
    // Extract path from URL
    const urlObj = new URL(url)
    pages.push(urlObj.pathname)
  }
  
  return pages
}

function getPagesFromSchema() {
  const schemaPath = path.join(projectRoot, 'public', 'config', 'schema.yaml')
  
  if (!fs.existsSync(schemaPath)) {
    return []
  }
  
  const content = fs.readFileSync(schemaPath, 'utf8')
  const config = yaml.load(content)
  
  return config.pages?.map(p => p.path) || []
}

async function validate() {
  log('🔍 Validating schema.yaml against sitemap...\n', YELLOW)
  
  const sitemapPages = await fetchSitemapPages()
  const schemaPages = getPagesFromSchema()
  
  // Normalize paths
  const normalizePath = (p) => p.replace(/\/+$/, '') || '/'
  
  const sitemapSet = new Set(sitemapPages.map(normalizePath))
  const schemaSet = new Set(schemaPages.map(normalizePath))
  
  // Find missing pages (in sitemap but not in schema)
  const missingPages = []
  
  for (const page of sitemapSet) {
    if (!schemaSet.has(page)) {
      missingPages.push(page)
    }
  }
  
  // Find extra pages (in schema but not in sitemap) - just warn
  const extraPages = []
  
  for (const page of schemaSet) {
    if (!sitemapSet.has(page)) {
      extraPages.push(page)
    }
  }
  
  // Report results
  if (missingPages.length > 0) {
    log('❌ FAIL: Missing pages in schema.yaml\n', RED)
    log('The following pages are in your sitemap but missing from schema.yaml:\n')
    
    for (const page of missingPages) {
      log(`   - ${page}`, RED)
    }
    
    log('\n📝 Add these pages to public/config/schema.yaml', YELLOW)
    log('Example entry:', RESET)
    log(`  - path: "${missingPages[0]}"`, YELLOW)
    log('    educationalLevel: "A1-A2"', YELLOW)
    log('    topics: ["Topic", "Grammar"]', YELLOW)
    log('    learningResourceType: "Lesson"', YELLOW)
    log('    description: "Description here"\n', YELLOW)
    
    process.exit(1)
  }
  
  if (extraPages.length > 0) {
    log('⚠️  Warning: Extra pages in schema.yaml (not in sitemap)\n', YELLOW)
    for (const page of extraPages) {
      log(`   - ${page}`, YELLOW)
    }
    log('')
  }
  
  log(`✅ All ${sitemapPages.length} pages have schema configuration`, GREEN)
  process.exit(0)
}

validate().catch(err => {
  log(`Error: ${err.message}`, RED)
  process.exit(1)
})
