import { useEffect, useState } from 'react'
import ChatWindow from '../../components/chat/ChatWindow'
import { listClients } from '../../api/clients'
import { C, S, font } from '../../components/common/theme'
import { useAuth } from '../../context/AuthContext'

export default function Chat() {
  const [clients, setClients] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const { therapist } = useAuth()
  const therapistId = therapist?._id || therapist?.id

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const data = await listClients()
        const rows = data.clients || data || []

        if (!cancelled) {
          setClients(rows)

          if (rows.length) {
            setSelected(rows[0])
          }
        }
      } catch (err) {
        console.error('Failed to load clients:', err)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.dim,
          fontSize: 12,
          fontFamily: font.mono,
        }}
      >
        Loading clients...
      </div>
    )
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 52px)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        overflow: 'hidden',
        background: C.bg,
      }}
    >
      {/* Page heading */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: font.serif,
              fontSize: 24,
              color: C.text,
            }}
          >
            Chat
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              color: C.dim,
              fontFamily: font.mono,
            }}
          >
            Real-time communication with your clients
          </div>
        </div>

        <div
          style={{
            fontSize: 10,
            color: C.dim,
            fontFamily: font.mono,
          }}
        >
          {clients.length} client{clients.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Chat container */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '250px minmax(0, 1fr)',
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          overflow: 'hidden',
          background: C.side,
        }}
      >
        {/* Client list */}
        <aside
          style={{
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: `1px solid ${C.line}`,
            background: C.side,
          }}
        >
          <div
            style={{
              padding: '16px 16px 12px',
              borderBottom: `1px solid ${C.line}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
              }}
            >
              Clients
            </div>

            <div
              style={{
                marginTop: 3,
                fontSize: 10,
                color: C.dim,
                fontFamily: font.mono,
              }}
            >
              Select a conversation
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 10,
            }}
          >
            {clients.length ? (
              clients.map((client) => {
                const id = client._id || client.id

                const name =
                  client.name ||
                  `${client.firstName || ''} ${
                    client.lastName || ''
                  }`.trim() ||
                  client.email ||
                  'Client'

                const isSelected =
                  String(selected?._id || selected?.id) ===
                  String(id)

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelected(client)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 11px',
                      marginBottom: 3,
                      cursor: 'pointer',
                      background: isSelected
                        ? 'rgba(45,143,106,0.16)'
                        : 'transparent',
                      color: isSelected
                        ? C.mint
                        : C.text2,
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        flexShrink: 0,
                        borderRadius: '50%',
                        background:
                          'rgba(45,143,106,0.18)',
                        color: C.mint,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>

                    <div
                      style={{
                        minWidth: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: isSelected ? 600 : 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {name}
                      </div>

                      {client.email && (
                        <div
                          style={{
                            marginTop: 2,
                            fontSize: 9,
                            color: C.dim,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {client.email}
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          width: 5,
                          height: 5,
                          flexShrink: 0,
                          borderRadius: '50%',
                          background: C.mint,
                        }}
                      />
                    )}
                  </button>
                )
              })
            ) : (
              <div
                style={{
                  padding: 12,
                  color: C.dim,
                  fontSize: 11,
                  lineHeight: 1.5,
                }}
              >
                No clients found.
              </div>
            )}
          </div>
        </aside>

        {/* Chat window */}
        <main
          style={{
            minWidth: 0,
            minHeight: 0,
            background: C.bg,
            overflow: 'hidden',
          }}
        >
          {selected ? (
            <ChatWindow
              therapistId={therapistId}
              clientId={selected._id || selected.id}
              currentUserId={therapistId}
            />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 7,
              }}
            >
              <div
                style={{
                  color: C.text2,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Select a client
              </div>

              <div
                style={{
                  color: C.dim,
                  fontSize: 11,
                }}
              >
                Choose a client to start chatting.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}