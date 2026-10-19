import site from './site.json'

/**
 * The live site's contact form was a WordPress.com service and does not survive
 * the migration, so the contact exhibit and /pages/contact use a mailto link
 * instead. No email address appears anywhere in the captured site.
 *
 * Set `contactEmail` in site.json, then re-run `node scripts/build-rooms.mjs`
 * so the 3D exhibit picks it up too.
 */
export const CONTACT_EMAIL: string = site.contactEmail
export const INSTAGRAM_URL: string = site.instagramUrl
export const INSTAGRAM_HANDLE: string = site.instagramHandle
