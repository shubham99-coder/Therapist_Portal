import { C, font } from '../common/theme'

export default function MessageBubble({ message, currentUserId }) {
  const mine =
    String(message.sender) === String(currentUserId)

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: mine ? 'flex-end' : 'flex-start',
        marginBottom: 10,
      }}
    >
      <div
        style={{
          maxWidth: '72%',
          minWidth: 70,
          padding: '9px 12px',
          borderRadius: mine
            ? '12px 12px 3px 12px'
            : '12px 12px 12px 3px',

          background: mine
            ? 'rgba(45,143,106,0.18)'
            : C.side,

          border: `1px solid ${
            mine
              ? 'rgba(45,143,106,0.28)'
              : C.line
          }`,

          color: C.text,

          boxShadow: mine
            ? 'none'
            : '0 1px 2px rgba(0,0,0,0.12)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
          }}
        >
          {message.text}
        </div>

        {mine && (
          <div
            style={{
              marginTop: 4,
              textAlign: 'right',
              fontSize: 8,
              color: message.read ? C.mint : C.dim,
              fontFamily: font.mono,
            }}
          >
            {message.read ? '✓✓ Read' : '✓ Sent'}
          </div>
        )}
      </div>
    </div>
  )
}