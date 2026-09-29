import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useToast } from '../../context/ToastContext'
import { useEntitlement } from '../../hooks/useEntitlement'
import { listClients } from '../../api/clients'
import { createNote, deleteNote, listNotes, updateNote } from '../../api/notes'
import { getErrorMessage } from '../../utils/errors'
import { noteTemplates } from '../../data/mock'
import { stripHtml } from '../../utils/format'
import { Badge, Button, Field, Modal, PageHeader, Spinner, UpgradePrompt } from '../../components/common/ui'
import NoteEditor from '../../components/notes/NoteEditor'
import { C, S, font } from '../../components/common/theme'

const typeStyle = {
  private: { bg: 'rgba(193,122,232,0.15)', color: C.purple },
  shared: { bg: 'rgba(45,143,106,0.15)', color: C.mint },
}

const emptyContent = '<p></p>'

function noteDate(note) {
  const value = note.createdAt || note.date
  if (!value) return '—'
  try {
    return format(new Date(value), 'd MMM yyyy')
  } catch {
    return String(value)
  }
}

export default function Notes() {
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { canAccess } = useEntitlement()

  const [notes, setNotes] = useState([])
  const [clients, setClients] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [draft, setDraft] = useState(emptyContent)
  const [draftType, setDraftType] = useState('private')
  const [draftFormat, setDraftFormat] = useState('freeform')
  const [creating, setCreating] = useState(false)
  const [newClientId, setNewClientId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [upgrade, setUpgrade] = useState(false)

  const templatesAllowed = canAccess('notes.templates')
  const selected = notes.find((n) => n._id === selectedId)
  const dirty = selected && (
    draft !== selected.content ||
    draftType !== selected.type ||
    draftFormat !== (selected.format || 'freeform')
  )

  const selectNote = (note) => {
    if (dirty && !window.confirm('You have unsaved changes. Discard them?')) return
    setSelectedId(note._id)
    setDraft(note.content || emptyContent)
    setDraftType(note.type)
    setDraftFormat(note.format || 'freeform')
  }

useEffect(() => {
  let cancelled = false

  const loadNotes = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await listNotes()

      if (!cancelled) {
        setNotes(data.notes || data || [])
      }
    } catch (err) {
      if (!cancelled) {
        console.error('Failed to load notes:', err)
        setError(getErrorMessage(err))
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }
  }

  loadNotes()

  return () => {
    cancelled = true
  }
}, [])

useEffect(() => {
  let cancelled = false

  const loadClients = async () => {
    try {
      const data = await listClients()

      if (!cancelled) {
        setClients(data.clients || data || [])
      }
    } catch (err) {
      if (!cancelled) {
        console.error('Failed to load clients:', err)
      }
    }
  }

  loadClients()

  return () => {
    cancelled = true
  }
}, [])

  useEffect(() => {
    if (!location.state?.newNote || loading) return

    const requestedName = location.state.client
    const matched = clients.find((c) => c.name === requestedName)
    setNewClientId(matched?._id || clients[0]?._id || '')
    setCreating(true)
    navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate, clients, loading])

  const save = async () => {
    if (!selectedId || !dirty) return
    setSaving(true)
    try {
      const updated = await updateNote(selectedId, {
        content: draft,
        type: draftType,
        format: draftFormat,
      })
      setNotes((list) => list.map((n) => (n._id === updated._id ? updated : n)))
      toast.success(updated.type === 'shared' ? 'Note saved and shared with the client' : 'Private note saved')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const create = async () => {
    if (!newClientId) {
      toast.error('Select a client')
      return
    }

    setSaving(true)
    try {
      const note = await createNote({
        clientId: newClientId,
        type: 'private',
        format: 'freeform',
        content: emptyContent,
      })
      setNotes((list) => [note, ...list])
      setSelectedId(note._id)
      setDraft(note.content || emptyContent)
      setDraftType(note.type)
      setDraftFormat(note.format || 'freeform')
      setCreating(false)
      toast.success('New private note created')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!selectedId) return
    if (!window.confirm('Delete this note? This cannot be undone.')) return

    setDeleting(true)
    try {
      await deleteNote(selectedId)
      const rest = notes.filter((n) => n._id !== selectedId)
      setNotes(rest)
      const next = rest[0]
      if (next) {
        setSelectedId(next._id)
        setDraft(next.content || emptyContent)
        setDraftType(next.type)
        setDraftFormat(next.format || 'freeform')
      } else {
        setSelectedId(null)
        setDraft(emptyContent)
        setDraftType('private')
        setDraftFormat('freeform')
      }
      toast.success('Note deleted')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Spinner label="Loading clinical notes" />
  if (error) {
  return (
    <div style={S.page}>
      <PageHeader
        eyebrow="SESSION DOCUMENTATION"
        title="Clinical Notes"
      />

      <div style={{ ...S.card, padding: 24, color: C.red }}>
        {error}
      </div>
    </div>
  )
}

  return (
    <div style={S.page}>
      <PageHeader
        eyebrow="SESSION DOCUMENTATION"
        title="Clinical Notes"
        action={<Button onClick={() => { setNewClientId(clients[0]?._id || ''); setCreating(true) }}>+ New note</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 'calc(100vh - 210px)', minHeight: 420 }}>
        <div style={{ ...S.card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>Recent notes</span>
            <button onClick={() => { setNewClientId(clients[0]?._id || ''); setCreating(true) }} aria-label="New note" style={{ width: 26, height: 26, borderRadius: 6, background: C.green, border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>+</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {notes.length === 0 ? (
              <div style={{ padding: 20, color: C.dim, fontSize: 12 }}>No notes yet.</div>
            ) : notes.map((n) => (
              <div key={n._id} onClick={() => selectNote(n)} style={{ padding: '14px 16px', borderBottom: `1px solid ${C.line}`, cursor: 'pointer', background: selectedId === n._id ? 'rgba(45,143,106,0.1)' : 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text2 }}>{n.client?.name || 'Client'}</span>
                  <Badge bg={typeStyle[n.type].bg} color={typeStyle[n.type].color}>{n.type}</Badge>
                </div>
                <div style={{ fontSize: 10, color: C.faint, fontFamily: font.mono, marginBottom: 6 }}>{noteDate(n)}</div>
                <div style={{ fontSize: 11, color: C.dim, lineHeight: 1.5 }}>{stripHtml(n.content || '').slice(0, 80)}{stripHtml(n.content || '').length > 80 ? '...' : ''}</div>
              </div>
            ))}
          </div>
        </div>

        {selected ? (
          <div style={{ ...S.card, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text2 }}>{selected.client?.name || 'Client'}</div>
                <div style={{ fontSize: 11, color: C.dim }}>{noteDate(selected)} · Session note{dirty ? ' · unsaved changes' : ''}</div>
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
              <select value={draftFormat} onChange={(e) => setDraftFormat(e.target.value)} style={{ ...S.input, width: 130, padding: '7px 9px', fontSize: 11 }}>
                <option value="freeform">Freeform</option>
                <option value="SOAP" disabled={!templatesAllowed}>SOAP</option>
                <option value="DAP" disabled={!templatesAllowed}>DAP</option>
                <option value="Progress" disabled={!templatesAllowed}>Progress</option>
              </select>
              <Button variant="ghost" onClick={remove} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
              <Button onClick={save} disabled={!dirty || saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>

            <div style={{ padding: '8px 20px', fontSize: 11, borderBottom: `1px solid ${C.line}`, background: draftType === 'private' ? 'rgba(193,122,232,0.08)' : 'rgba(45,143,106,0.08)', color: draftType === 'private' ? C.purple : C.mint }}>
              {draftType === 'private' ? 'Private: this note is never visible to the client.' : 'Shared: the client can read this note in their portal.'}
            </div>

            <NoteEditor
              key={selected._id}
              content={selected.content || emptyContent}
              onChange={setDraft}
              templates={templatesAllowed ? noteTemplates : undefined}
            />

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
        <Modal title="New session note" onClose={() => !saving && setCreating(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {clients.length === 0 ? (
              <div style={{ fontSize: 13, color: C.muted }}>Add a client before creating a clinical note.</div>
            ) : (
              <Field label="CLIENT">
                <select style={S.input} value={newClientId} onChange={(e) => setNewClientId(e.target.value)}>
                  {clients.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="ghost" onClick={() => setCreating(false)} disabled={saving}>Cancel</Button>
              <Button onClick={create} disabled={saving || clients.length === 0}>{saving ? 'Creating...' : 'Create note'}</Button>
            </div>
          </div>
        </Modal>
      )}
      {upgrade && <UpgradePrompt feature="Note templates" onClose={() => setUpgrade(false)} />}
    </div>
  )
}
