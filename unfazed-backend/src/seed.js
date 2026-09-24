require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const Therapist = require('./models/Therapist');
const generateSlug = require('./utils/generateSlug');


const THERAPISTS = [
  {
    email: 'ananya.sharma@unfazed.test',
    password: 'Passw0rd!123',
    name: 'Dr. Ananya Sharma',
    bio: 'Clinical Psychologist with 8+ years of experience helping clients manage anxiety, stress, and life transitions using evidence-based CBT.',
    specializations: ['Anxiety', 'CBT', 'Stress Management'],
    languages: ['English', 'Hindi'],
    photoUrl: '',
  },
  {
    email: 'rohan.mehta@unfazed.test',
    password: 'Passw0rd!123',
    name: 'Dr. Rohan Mehta',
    bio: 'Psychiatrist (M.D.) specializing in mood disorders and medication management, with 12 years of clinical practice.',
    specializations: ['Mood Disorders', 'Psychopharmacology', 'Depression'],
    languages: ['English', 'Hindi', 'Marathi'],
    photoUrl: '',
  },
  {
    email: 'kavya.iyer@unfazed.test',
    password: 'Passw0rd!123',
    name: 'Kavya Iyer',
    bio: 'Counseling Psychologist (M.A.) certified in Trauma-Focused CBT, focused on relationship counseling and trauma recovery.',
    specializations: ['Relationship Counseling', 'Trauma', 'TF-CBT'],
    languages: ['English', 'Tamil'],
    photoUrl: '',
  },
];

async function seed() {
  await connectDB();

  for (const t of THERAPISTS) {
    const existing = await Therapist.findOne({ email: t.email });
    if (existing) {
      console.log(`Skipping ${t.email} — already exists.`);
      continue;
    }

    const password_hash = await bcrypt.hash(t.password, 10);
    const slug = await generateSlug(t.name);

    await Therapist.create({
      email: t.email,
      password_hash,
      name: t.name,
      slug,
      bio: t.bio,
      specializations: t.specializations,
      languages: t.languages,
      photoUrl: t.photoUrl,
    });

    console.log(`Created ${t.name} → /${slug} (login: ${t.email} / ${t.password})`);
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});