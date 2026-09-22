export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

export const initials = (name = '') =>
  name.replace(/^dr\.?\s+/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')

// Mirrors the backend slugify so the register page can preview the link
export const slugify = (str = '') =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

export const publicLink = (slug) => `${window.location.origin}/${slug}`
