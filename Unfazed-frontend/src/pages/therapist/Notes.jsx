import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useToast } from '../../context/ToastContext'
import { useEntitlement } from '../../hooks/useEntitlement'
import { initialClients, initialNotes, noteTemplates } from '../../data/mock'
import { stripHtml } from '../../utils/format'
import { Badge, Button, Field, Modal, PageHeader, UpgradePrompt } from '../../components/common/ui'
import NoteEditor from '../../components/notes/NoteEditor'
import { C, S, font } from '../../components/common/theme'

const typeStyle = {
  private: { bg: 'rgba(193,122,232,0.15)', color: C.purple },
  shared: { bg: 'rgba(45,143,106,0.15)', color: C.mint },
}

export default function Notes() {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { canAccess } = useEntitlement()

  const [notes, setNotes] = useState(initialNotes)
  const [selectedId, setSelectedId] = useState(initialNotes[0].id)
  const [draft, setDraft] = useState(initialNotes[0].html)
  const [draftType, setDraftType] = useState(initialNotes[0].type)
  const [creating, setCreating] = useState(false)
  const [newClient, setNewClient] = useState(initialClients[0].name)
  const [upgrade, setUpgrade] = useState(false)

  const selected = notes.find((n) => n.id === selectedId)
  const dirty = selected && (draft !== selected.html || draftType !== selected.type)
  const templatesAllowed = canAccess('notes.templates')

  // Opened from a quick action elsewhere
  useEffect(() => {
    if (location.state?.newNote) {
      if (location.state.client) setNewClient(location.state.client)
      setCreating(true)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])

  const select = (n) => {
    if (dirty && !window.confirm('You have unsaved changes. Discard them?')) return
    setSelectedId(n.id)
    setDraft(n.html)
    setDraftType(n.type)
  }

  const save = () => {
    setNotes((list) => list.map((n) => (n.id === selectedId ? { ...n, html: draft, type: draftType } : n)))
    toast.success(draftType === 'shared' ? 'Note saved and shared with the client' : 'Private note saved')
  }

  const createNote = () => {
    const note = { id: Date.now(), client: newClient, date: format(new Date(), 'd MMM yyyy'), type: 'private', html: '<p></p>' }
    setNotes((list) => [note, ...list])
    setSelectedId(note.id)
    setDraft(note.html)
    setDraftType('private')
    setCreating(false)
  }

  const remove = () => {
    if (!window.confirm('Delete this note? This cannot be undone.')) return
    const rest = notes.filter((n) => n.id !== selectedId)
    setNotes(rest)
    if (rest[0]) { setSelectedId(rest[0].id); setDraft(rest[0].html); setDraftType(rest[0].type) }
    toast.success('Note deleted')
  }

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 24 }}>
        <div style={S.eyebrow}>SESSION DOCUMENTATION</div>
        <h1 style={S.h1}>Clinical Notes</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 'calc(100vh - 210px)', minHeight: 420 }}>
        <div style={{ ...S.card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>Recent notes</span>
            <button onClick={() => setCreating(true)} aria-label="New note" style={{ width: 26, height: 26, borderRadius: 6, background: C.green, border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>+</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {notes.map((n) => (
              <div key={n.id} onClick={() => select(n)} style={{ padding: '14px 16px', borderBottom: `1px solid ${C.line}`, cursor: 'pointer', background: selectedId === n.id ? 'rgba(45,143,106,0.1)' : 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>{n.client}</span>
                  <Badge bg={typeStyle[n.type].bg} color={typeStyle[n.type].color}>{n.type}</Badge>
                </div>
                <div style={{ fontSize: 10, color: C.faint, fontFamily: font.mono, marginBottom: 6 }}>{n.date}</div>
                <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.5 }}>{stripHtml(n.html).slice(0, 80)}{stripHtml(n.html).length > 80 ? '...' : ''}</div>
              </div>
            ))}
          </div>
        </div>

        {selected ? (
          <div style={{ ...S.card, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>{selected.client}</div>
                <div style={{ fontSize: 11, color: C.dim }}>{selected.date} · Session note{dirty ? ' · unsaved changes' : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['private', 'shared'].map((t) => {
                  const on = draftType === t
                  const col = t === 'private' ? C.purple : C.green
                  return (
                    <button key={t} onClick={() => setDraftType(t)} aria-pressed={on}
                      style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${on ? col : C.line}`, background: on ? `${col}26` : 'transparent', color: on ? (t === 'private' ? C.purple : C.mint) : C.dim, fontSize: 11, cursor: 'pointer' }}>
                      {t === 'private' ? 'Private' : 'Shared'}
                    </button>
                  )
                })}
              </div>
              <Button variant="ghost" onClick={remove}>Delete</Button>
              <Button onClick={save} disabled={!dirty}>Save</Button>
            </div>

            <div style={{ padding: '8px 20px', fontSize: 11, borderBottom: `1px solid ${C.line}`, background: draftType === 'private' ? 'rgba(193,122,232,0.08)' : 'rgba(45,143,106,0.08)', color: draftType === 'private' ? C.purple : C.mint }}>
              {draftType === 'private' ? 'Private: this note is never visible to the client.' : 'Shared: the client can read this note in their portal.'}
            </div>

            <NoteEditor key={selected.id} content={selected.html} onChange={setDraft} templates={templatesAllowed ? noteTemplates : undefined} />
            {!templatesAllowed && (
              <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.line}` }}>
                <Button variant="ghost" onClick={() => setUpgrade(true)}>Use SOAP and DAP templates</Button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim, fontSize: 13 }}>
            No notes yet. Use the + button to write your first one.
          </div>
        )}
      </div>

      {creating && (
        <Modal title="New session note" onClose={() => setCreating(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="CLIENT">
              <select style={S.input} value={newClient} onChange={(e) => setNewClient(e.target.value)}>
                {initialClients.map((c) => <option key={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
              <Button onClick={createNote}>Create note</Button>
            </div>
          </div>
        </Modal>
      )}
      {upgrade && <UpgradePrompt feature="Note templates" onClose={() => setUpgrade(false)} />}
    </div>
  )
}
