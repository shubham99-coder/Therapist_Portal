const Therapist = require('../models/Therapist');

// Slugs that would collide with frontend routes
const RESERVED = ['login', 'register', 'dashboard', 'api', 'admin', 'settings'];

const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

module.exports = async function generateSlug(name) {
  let base = slugify(name) || 'therapist';
  if (RESERVED.includes(base)) base = `${base}-therapist`;

  let slug = base;
  let n = 1;
  while (await Therapist.exists({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
};