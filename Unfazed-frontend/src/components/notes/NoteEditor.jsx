import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { C, S } from '../common/theme'
import './editor.css'

function ToolBtn({ active, onClick, label, children }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={!!active}
      style={{ minWidth: 30, height: 28, padding: '0 8px', borderRadius: 6, border: `1px solid ${active ? C.green : C.line}`, background: active ? 'rgba(45,143,106,0.18)' : 'transparent', color: active ? C.mint : C.dim, fontSize: 12, cursor: 'pointer' }}>
      {children}
    </button>
  )
}

export default function NoteEditor({ content, onChange, templates }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) return null
  const chain = () => editor.chain().focus()

  return (
    <div className="note-editor" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '8px 20px', borderBottom: `1px solid ${C.line}`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <ToolBtn label="Bold" active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()}><strong>B</strong></ToolBtn>
        <ToolBtn label="Italic" active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()}><em>I</em></ToolBtn>
        <ToolBtn label="Heading" active={editor.isActive('heading', { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()}>H</ToolBtn>
        <ToolBtn label="Bullet list" active={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()}>List</ToolBtn>
        <ToolBtn label="Numbered list" active={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()}>1.</ToolBtn>
        <ToolBtn label="Quote" active={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()}>Quote</ToolBtn>
        <ToolBtn label="Undo" onClick={() => chain().undo().run()}>Undo</ToolBtn>
        <ToolBtn label="Redo" onClick={() => chain().redo().run()}>Redo</ToolBtn>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>

      {templates && (
        <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.line}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: C.dim }}>Start from a template:</span>
          {Object.entries(templates).map(([name, html]) => (
            <button key={name} type="button" style={{ ...S.btnGhost, padding: '5px 12px', fontSize: 11 }}
              onClick={() => { editor.commands.setContent(html, { emitUpdate: true }); editor.commands.focus() }}>
              {name === 'Progress' ? 'Progress note' : `${name} template`}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
