import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/quests', '/settings', '/api/'],
    },
    sitemap: 'https://life-rpg-os.com/sitemap.xml',
  }
}
