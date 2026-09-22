import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../utils/errors'
import { slugify } from '../../utils/format'

const QUOTES = [
  { text: 'The curious paradox is that when I accept myself just as I am, then I can change.', author: 'Carl Rogers' },
  { text: 'The privilege of a lifetime is to become who you truly are.', author: 'Carl Jung' },
]

const inputStyle = {
  width: '100%',
  padding: '0.8rem 1rem',
  borderRadius: '0.75rem',
  background: '#112825',
  border: '1px solid rgba(255,255,255,0.07)',
  color: '#e8f5f0',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'DM Sans, system-ui, sans-serif',
}

function Field({ label, id, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium mb-1.5 tracking-widest uppercase" style={{ color: '#4a7a6d', letterSpacing: '0.08em' }}>
        {label}
      </label>
      {children}
      {error && <div role="alert" style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 6 }}>{error}</div>}
    </div>
  )
}

function LogoMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2C6.686 2 4 4.686 4 8c0 2.21 1.13 4.15 2.84 5.29L6.5 15h7l-.34-1.71C14.87 12.15 16 10.21 16 8c0-3.314-2.686-6-6-6z" fill="white" fillOpacity="0.9" />
      <path d="M7.5 15v1a.5.5 0 00.5.5h4a.5.5 0 00.5-.5v-1h-5z" fill="white" fillOpacity="0.7" />
      <path d="M9 18h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Full-screen login / signup page.
 * mode = 'login' (route /login) or 'signup' (route /register)
 */
export default function AuthPage({ mode }) {
  const navigate = useNavigate()
  const { login, register: signUp } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [serverError, setServerError] = useState('')
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)])
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()

  const isLogin = mode === 'login'
  const previewSlug = slugify(watch('name')) || 'your-name'

  const onSubmit = async (values) => {
    setServerError('')
    try {
      if (isLogin) await login(values.email, values.password)
      else await signUp(values.name.trim(), values.email, values.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  const switchTo = (t) => navigate(t === 'login' ? '/login' : '/register')

  return (
    <div className="auth-page min-h-screen flex" style={{ fontFamily: 'DM Sans, system-ui, sans-serif', background: '#0a1a19' }}>
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden" style={{ width: '52%', background: '#0d2320' }}>
        <img
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=1600&fit=crop&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.18 }}
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(61,155,111,0.08) 0%, transparent 70%), linear-gradient(135deg, rgba(10,26,25,0.6) 0%, rgba(13,35,32,0.4) 100%)' }} />
        <svg className="absolute bottom-0 right-0 opacity-10" width="480" height="480" viewBox="0 0 480 480" fill="none" aria-hidden="true">
          <circle cx="480" cy="480" r="360" stroke="#4db882" strokeWidth="1" />
          <circle cx="480" cy="480" r="260" stroke="#4db882" strokeWidth="0.6" />
          <circle cx="480" cy="480" r="160" stroke="#4db882" strokeWidth="0.4" />
        </svg>

        <div className="relative z-10 flex flex-col h-full p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#3d9b6f' }}><LogoMark /></div>
            <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.35rem', fontWeight: 500, color: '#e8f5f0', letterSpacing: '-0.01em' }}>Unfazed</span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <div className="mb-6 text-xs font-medium tracking-widest uppercase" style={{ color: '#4db882' }}>Therapist Portal</div>
            <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 300, color: '#e8f5f0', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Your practice,<br />
              <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#6ed09a' }}>beautifully</em><br />
              managed.
            </h1>
            <p className="mt-5 leading-relaxed" style={{ color: '#7aada0', fontSize: '0.95rem', maxWidth: '28ch' }}>
              Schedules, session notes, client progress, and billing, all in one calm workspace built for therapists.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {['Session notes', 'Client portal', 'Billing', 'Scheduling', 'Your own link'].map((f) => (
                <span key={f} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(61,155,111,0.12)', color: '#6ed09a', border: '1px solid rgba(61,155,111,0.2)' }}>{f}</span>
              ))}
            </div>
          </div>

          <div className="relative pl-5" style={{ borderLeft: '2px solid rgba(78,185,132,0.3)' }}>
            <p className="italic leading-relaxed" style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#7aada0', fontSize: '0.9rem' }}>"{quote.text}"</p>
            <p className="mt-2 text-xs font-medium" style={{ color: '#4db882' }}>{quote.author}</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden" style={{ background: '#0a1a19' }}>
        <div className="absolute top-0 right-0 pointer-events-none" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(61,155,111,0.06) 0%, transparent 65%)', transform: 'translate(30%, -30%)' }} />

        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#3d9b6f' }}><LogoMark size={18} /></div>
          <span style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.25rem', fontWeight: 500, color: '#e8f5f0' }}>Unfazed</span>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* tab switcher */}
          <div className="flex rounded-xl p-1 mb-8" style={{ background: '#112825' }} role="tablist">
            {['login', 'signup'].map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={mode === t}
                onClick={() => switchTo(t)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ background: mode === t ? '#1e4540' : 'transparent', color: mode === t ? '#e8f5f0' : '#5a8a7d', boxShadow: mode === t ? '0 1px 4px rgba(0,0,0,0.3)' : 'none', border: 'none', cursor: 'pointer' }}
              >
                {t === 'login' ? 'Log in' : 'Create account'}
              </button>
            ))}
          </div>

          <div className="mb-8">
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 400, color: '#e8f5f0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {isLogin ? 'Welcome back' : 'Join Unfazed'}
            </h2>
            <p className="mt-2" style={{ color: '#5a8a7d', fontSize: '0.9rem' }}>
              {isLogin ? 'Log in to manage your practice.' : 'Set up your practice page in a minute.'}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {!isLogin && (
              <Field label="Full name" id="name" error={errors.name?.message}>
                <input id="name" type="text" autoComplete="name" placeholder="Dr. Sarah Chen" style={inputStyle}
                  {...register('name', { required: 'Enter your name' })} />
                <div style={{ color: '#3d5f57', fontSize: '0.75rem', marginTop: 6 }}>Your link: unfazed.in/{previewSlug}</div>
              </Field>
            )}

            <Field label="Email address" id="email" error={errors.email?.message}>
              <input id="email" type="email" autoComplete="email" placeholder="you@example.com" style={inputStyle}
                {...register('email', { required: 'Enter your email', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
            </Field>

            <Field label="Password" id="password" error={errors.password?.message}>
              <div className="relative">
                <input id="password" type={showPass ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder={isLogin ? '••••••••' : 'At least 8 characters'} style={{ ...inputStyle, paddingRight: '3rem' }}
                  {...register('password', isLogin
                    ? { required: 'Enter your password' }
                    : { required: 'Choose a password', minLength: { value: 8, message: 'Use at least 8 characters' } })} />
                <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#4a7a6d', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </Field>

            {serverError && (
              <div role="alert" style={{ color: '#f87171', fontSize: '0.8rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '0.7rem 0.9rem' }}>
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-150 mt-2"
              style={{ background: '#3d9b6f', color: '#fff', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, letterSpacing: '0.01em', boxShadow: '0 4px 20px rgba(61,155,111,0.3)' }}
              onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = '#4db882' }}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#3d9b6f')}
            >
              {isSubmitting ? (isLogin ? 'Logging in...' : 'Creating account...') : (isLogin ? 'Log in to portal' : 'Create your account')}
            </button>
          </form>

          <p className="text-center mt-8 text-sm" style={{ color: '#4a7a6d' }}>
            {isLogin ? 'New here? ' : 'Already have an account? '}
            <button type="button" onClick={() => switchTo(isLogin ? 'signup' : 'login')} className="font-semibold"
              style={{ color: '#4db882', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {isLogin ? 'Create your account' : 'Log in'}
            </button>
          </p>
        </div>

        <div className="absolute bottom-6 flex items-center gap-2 text-xs" style={{ color: '#3d5f57' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Private notes are never shown to clients
        </div>
      </div>
    </div>
  )
}
