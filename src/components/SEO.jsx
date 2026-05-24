import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Reusable, Dynamic SEO Component for Artlor
 * Automatically sets page titles, meta descriptions, keywords, canonical URLs,
 * Open Graph, Twitter Cards, and injects multi-layered Schema.org JSON-LD structured data.
 */
export default function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = 'website',
  ogImage = '/brand/artlor-logo.png',
  schemaData,
  robots = 'index, follow',
  breadcrumbPaths = [], // array of { name: string, path: string }
}) {
  const location = useLocation()

  useEffect(() => {
    const origin = window.location.origin
    const currentHref = origin + location.pathname + location.search

    // 1. Update Document Title
    const baseTitle = 'Artlor — Custom Handpainted Art Commissions'
    document.title = title ? `${title} | ${baseTitle}` : baseTitle

    // 2. Update Meta Description
    const finalDescription = description || 'Artlor connects you with talented local artists to commission fully custom, wall-ready handpainted artwork delivered right to your door.'
    updateMetaTag('name', 'description', finalDescription)

    // 3. Update Keywords
    const finalKeywords = keywords || 'custom paintings, commission art, local artists, handpainted artwork, wall art, custom calligraphy, abstract art painting, original landscapes, still life painting'
    updateMetaTag('name', 'keywords', finalKeywords)

    // 4. Update Robots Tag
    updateMetaTag('name', 'robots', robots)

    // 5. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl || currentHref)

    // 6. Open Graph / Facebook Meta Tags
    updateMetaTag('property', 'og:title', title ? `${title} | ${baseTitle}` : baseTitle)
    updateMetaTag('property', 'og:description', finalDescription)
    updateMetaTag('property', 'og:type', ogType)
    updateMetaTag('property', 'og:url', canonicalUrl || currentHref)
    updateMetaTag('property', 'og:site_name', 'Artlor')
    updateMetaTag('property', 'og:locale', 'en_US')
    
    const absoluteImageUrl = ogImage.startsWith('http')
      ? ogImage
      : origin + ogImage
    updateMetaTag('property', 'og:image', absoluteImageUrl)
    updateMetaTag('property', 'og:image:secure_url', absoluteImageUrl)
    updateMetaTag('property', 'og:image:type', 'image/png')
    updateMetaTag('property', 'og:image:width', '1200')
    updateMetaTag('property', 'og:image:height', '630')
    updateMetaTag('property', 'og:image:alt', title || baseTitle)

    // 7. Twitter Card Meta Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', title ? `${title} | ${baseTitle}` : baseTitle)
    updateMetaTag('name', 'twitter:description', finalDescription)
    updateMetaTag('name', 'twitter:image', absoluteImageUrl)
    updateMetaTag('name', 'twitter:image:alt', title || baseTitle)

    // 8. Inject Multiple JSON-LD Schema.org Structured Data blocks
    let jsonLdScript = document.getElementById('json-ld-seo')
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script')
      jsonLdScript.id = 'json-ld-seo'
      jsonLdScript.type = 'application/ld+json'
      document.head.appendChild(jsonLdScript)
    }

    // Default schemas loaded on all indexable pages to build strong authority
    const orgSchema = {
      '@context': 'https://schema.org',
      '@type': 'OnlineStore',
      '@id': `${origin}/#organization`,
      'name': 'Artlor',
      'url': origin,
      'logo': `${origin}/brand/artlor-logo.png`,
      'image': `${origin}/brand/hero-painting-bg.png`,
      'description': 'Artlor connects you with handpicked local art talent to commission bespoke, high-quality handpainted wall art.',
      'telephone': '+91-XXXXXXXXXX',
      'priceRange': '$$',
      'sameAs': [
        'https://instagram.com/artlor.co',
        'https://facebook.com/artlor',
        'https://linkedin.com/company/artlor'
      ],
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'IN',
        'addressLocality': 'Local Artists Network'
      }
    }

    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      'name': 'Artlor',
      'url': origin,
      'description': 'Commission custom art and handpainted masterpieces from local artists.',
      'publisher': {
        '@id': `${origin}/#organization`
      },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${origin}/gallery?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }

    const schemas = [orgSchema, websiteSchema]

    // Append breadcrumb list if paths are specified
    if (breadcrumbPaths.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${currentHref}/#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'item': {
              '@id': origin,
              'name': 'Home'
            }
          },
          ...breadcrumbPaths.map((bp, index) => ({
            '@type': 'ListItem',
            'position': index + 2,
            'item': {
              '@id': bp.path.startsWith('http') ? bp.path : origin + bp.path,
              'name': bp.name
            }
          }))
        ]
      }
      schemas.push(breadcrumbSchema)
    }

    // Append custom schema if provided
    if (schemaData) {
      if (Array.isArray(schemaData)) {
        schemas.push(...schemaData)
      } else {
        schemas.push(schemaData)
      }
    }

    jsonLdScript.text = JSON.stringify(schemas)

    // Helper function to create/update meta tags safely
    function updateMetaTag(keyName, keyValue, contentValue) {
      if (!contentValue) return
      let el = document.querySelector(`meta[${keyName}="${keyValue}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(keyName, keyValue)
        document.head.appendChild(el)
      }
      el.setAttribute('content', contentValue)
    }

    // Clean up or reset page-specific meta tags on unmount to prevent bleeding
    return () => {
      // Clean up dynamic schema script content if needed
      if (jsonLdScript) {
        jsonLdScript.text = ''
      }
    }
  }, [
    title,
    description,
    keywords,
    canonicalUrl,
    ogType,
    ogImage,
    schemaData,
    robots,
    breadcrumbPaths,
    location,
  ])

  return null
}
