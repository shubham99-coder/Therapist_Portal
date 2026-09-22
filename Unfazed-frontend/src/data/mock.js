// Mock data used until each backend module exists.
// When a module ships, replace the import in that page with an API call.

export const upcomingSessions = [
  { id: 1, time: '09:00', name: 'Arjun Mehta', type: 'Individual', duration: '60 min', status: 'confirmed' },
  { id: 2, time: '11:00', name: 'Sunita & Raj Patel', type: 'Couples', duration: '90 min', status: 'confirmed' },
  { id: 3, time: '14:30', name: 'Rahul Kapoor', type: 'Individual', duration: '45 min', status: 'pending' },
  { id: 4, time: '16:00', name: 'Neha Singh', type: 'Individual', duration: '60 min', status: 'confirmed' },
]

export const recentActivity = [
  { action: 'Invoice sent', detail: 'Arjun Mehta — ₹3,000', time: '2h ago', dot: '#7ecfae' },
  { action: 'Session completed', detail: 'Sunita Patel — Session 4/12', time: '4h ago', dot: '#7ecfae' },
  { action: 'New booking', detail: 'Kavya Reddy via branded link', time: '1d ago', dot: '#f0a96e' },
  { action: 'Note added', detail: 'Private note — Rahul Kapoor', time: '1d ago', dot: '#9ab8f0' },
  { action: 'Payment received', detail: '₹9,000 — 3-session package', time: '2d ago', dot: '#7ecfae' },
]

export const scheduleDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const scheduleHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
export const initialBlocks = [
  { id: 1, day: 0, hour: 1, name: 'Arjun Mehta', kind: 'session' },
  { id: 2, day: 0, hour: 3, name: 'Sunita & Raj Patel', kind: 'couples' },
  { id: 3, day: 1, hour: 2, name: 'Rahul Kapoor', kind: 'session' },
  { id: 4, day: 2, hour: 0, name: 'Kavya Reddy', kind: 'session' },
  { id: 5, day: 2, hour: 4, name: 'Group — Anxiety', kind: 'group' },
  { id: 6, day: 3, hour: 1, name: 'Meera Joshi', kind: 'session' },
  { id: 7, day: 3, hour: 3, name: 'Vikram Shah', kind: 'pending' },
  { id: 8, day: 4, hour: 2, name: 'Anita Desai', kind: 'session' },
  { id: 9, day: 4, hour: 5, name: 'Arjun Mehta', kind: 'session' },
]

export const initialClients = [
  { id: 1, name: 'Arjun Mehta', age: 29, since: 'Mar 2026', sessions: 18, status: 'active', concern: 'Anxiety & work stress', nextSession: 'Today, 09:00', balance: 0 },
  { id: 2, name: 'Sunita Patel', age: 44, since: 'Jan 2026', sessions: 24, status: 'active', concern: 'Couples counselling', nextSession: 'Today, 11:00', balance: 3000 },
  { id: 3, name: 'Rahul Kapoor', age: 35, since: 'Jun 2026', sessions: 9, status: 'active', concern: 'Depression, OCD', nextSession: 'Today, 14:30', balance: 6000 },
  { id: 4, name: 'Neha Singh', age: 27, since: 'Jul 2026', sessions: 6, status: 'active', concern: 'Grief & loss', nextSession: 'Today, 16:00', balance: 0 },
  { id: 5, name: 'Kavya Reddy', age: 31, since: 'Sep 2026', sessions: 2, status: 'intake', concern: 'Social anxiety', nextSession: 'Mon, 08:00', balance: 3000 },
  { id: 6, name: 'Meera Joshi', age: 52, since: 'Feb 2026', sessions: 31, status: 'active', concern: 'Life transitions', nextSession: 'Thu, 09:00', balance: 0 },
  { id: 7, name: 'Vikram Shah', age: 40, since: 'Apr 2026', sessions: 14, status: 'on-hold', concern: 'PTSD', nextSession: '—', balance: 0 },
  { id: 8, name: 'Anita Desai', age: 38, since: 'Aug 2026', sessions: 4, status: 'active', concern: 'Burnout', nextSession: 'Fri, 14:00', balance: 0 },
]

export const initialNotes = [
  { id: 1, client: 'Arjun Mehta', date: '18 Sep 2026', type: 'private', html: '<p>Session 18. Client arrived 5 minutes early, a positive sign of engagement.</p><p>Discussed workplace dynamics and cognitive reframing. The pattern of catastrophising before Monday meetings was explored in depth. Client identified the thought "I will definitely fail this presentation" and we worked through cognitive defusion techniques.</p><p><strong>Homework:</strong> complete a thought record for at least one anxiety-provoking situation before next session.</p><p>Overall mood: 6/10 at start, 8/10 at end.</p>' },
  { id: 2, client: 'Sunita Patel', date: '18 Sep 2026', type: 'shared', html: '<p>Summary of couples session. Communication exercises assigned. Both partners committed to daily check-ins.</p>' },
  { id: 3, client: 'Rahul Kapoor', date: '17 Sep 2026', type: 'private', html: '<p>OCD symptoms reduced from 7/10 to 4/10 on subjective scale. ERP exercises continuing well.</p>' },
  { id: 4, client: 'Meera Joshi', date: '15 Sep 2026', type: 'private', html: '<p>Explored grief related to career transition. Normalizing feelings of loss while holding space for growth.</p>' },
  { id: 5, client: 'Kavya Reddy', date: '14 Sep 2026', type: 'shared', html: '<p>Intake note. Presenting concern: social anxiety since college. Avoidance behaviours documented.</p>' },
]

export const noteTemplates = {
  SOAP: '<h3>Subjective</h3><p></p><h3>Objective</h3><p></p><h3>Assessment</h3><p></p><h3>Plan</h3><p></p>',
  DAP: '<h3>Data</h3><p></p><h3>Assessment</h3><p></p><h3>Plan</h3><p></p>',
  Progress: '<h3>Progress since last session</h3><p></p><h3>Interventions used</h3><p></p><h3>Next steps</h3><p></p>',
}

export const revenueData = [
  { month: 'Apr', revenue: 82000 },
  { month: 'May', revenue: 97000 },
  { month: 'Jun', revenue: 110000 },
  { month: 'Jul', revenue: 105000 },
  { month: 'Aug', revenue: 124000 },
  { month: 'Sep', revenue: 141000 },
]

export const sessionTypes = [
  { label: 'Individual (60 min)', count: 34, pct: 72 },
  { label: 'Individual (90 min)', count: 8, pct: 17 },
  { label: 'Couples', count: 4, pct: 9 },
  { label: 'Group', count: 1, pct: 2 },
]

export const attendance = [
  { label: 'Completed', value: 43, color: '#2d8f6a' },
  { label: 'Cancelled (24h+ notice)', value: 2, color: '#9ab8f0' },
  { label: 'No-show', value: 2, color: '#f0a96e' },
]

export const initialInvoices = [
  { id: 'INV-047', client: 'Arjun Mehta', amount: 3000, date: '18 Sep', status: 'paid', type: 'Per session' },
  { id: 'INV-046', client: 'Sunita Patel', amount: 9000, date: '17 Sep', status: 'pending', type: '3-session pkg' },
  { id: 'INV-045', client: 'Rahul Kapoor', amount: 15000, date: '15 Sep', status: 'pending', type: '6-session pkg' },
  { id: 'INV-044', client: 'Kavya Reddy', amount: 3000, date: '14 Sep', status: 'paid', type: 'Per session' },
  { id: 'INV-043', client: 'Meera Joshi', amount: 3000, date: '12 Sep', status: 'paid', type: 'Per session' },
  { id: 'INV-042', client: 'Anita Desai', amount: 3000, date: '10 Sep', status: 'overdue', type: 'Per session' },
]

export const packages = [
  { sessions: 3, rate: 3000, label: 'Starter', popular: false },
  { sessions: 6, rate: 2800, label: 'Regular', popular: true },
  { sessions: 12, rate: 2600, label: 'Deep Work', popular: false },
]

export const plans = [
  { tier: 'Starter', price: 999, clients: '10 clients', features: ['Profile page', 'Basic scheduling', 'Manual billing'] },
  { tier: 'Pro', price: 2499, clients: '25 clients', features: ['Everything in Starter', 'Razorpay payments', 'Clinical notes', 'Analytics'] },
  { tier: 'Practice', price: 5999, clients: 'Unlimited', features: ['Everything in Pro', 'Multi-therapist', 'API access', 'Priority support'] },
]
