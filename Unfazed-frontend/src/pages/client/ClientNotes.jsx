import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSharedNotes } from '../../api/notes'
import { getErrorMessage } from '../../utils/errors'
import { Spinner } from '../../components/common/ui'
import { C, S, font } from '../../components/common/theme'
import NotFound from './NotFound'

function sanitizeHtml(html) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html || ''
  wrapper.querySelectorAll('script, style, iframe, object, embed, form').forEach((node) => node.remove())
  wrapper.querySelectorAll('*').forEach((node) => {
    for (const attr of [...node.attributes]) {
      const name = attr.name.toLowerCase()
      const value = attr.value || ''
      if (name.startsWith('on') || (name === 'href' || name === 'src') && /^\s*javascript:/i.test(value)) {
        node.removeAttribute(attr.name)
      }
    }
  })
  return wrapper.innerHTML
}

export default function ClientNotes() {
  const { clientId } = useParams()
  const [status, setStatus] = useState('loading')
  const [data, setData] = useState({ client: null, notes: [] })

  useEffect(() => {
    getSharedNotes(clientId)
      .then((result) => {
        setData(result)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [clientId])

  if (status === 'loading') return <Spinner label="Loading shared notes" />
  if (status === 'error') return <NotFound message={getErrorMessage({}) || 'We could not load your shared notes.'} />

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '48px 20px' }}>
      <div style={{ width: 760, maxWidth: '100%', margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={S.eyebrow}>CLIENT PORTAL</div>
          <h1 style={{ ...S.h1, fontSize: 28 }}>Shared notes</h1>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            Notes your therapist has chosen to share with you, {data.client?.name}.
          </p>
        </div>

        {data.notes.length === 0 ? (
          <div style={{ ...S.card, padding: 28, textAlign: 'center', color: C.dim, fontSize: 13 }}>
            Your therapist has not shared any notes with you yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.notes.map((note) => (
              <article key={note._id} style={{ ...S.card, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: C.dim, fontFamily: font.mono }}>
                    {new Date(note.createdAt).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  {note.format && note.format !== 'freeform' && (
                    <span style={{ fontSize: 10, color: C.mint, fontFamily: font.mono }}>{note.format}</span>
                  )}
                </div>
                <div
                  className="note-editor"
                  style={{ fontSize: 14, color: C.text3, lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(note.content) }}
                />
              </article>
            ))}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <Link to="/login" style={{ color: C.mint, fontSize: 12 }}>Therapist login</Link>
        </div>
      </div>
    </div>
  )
}
