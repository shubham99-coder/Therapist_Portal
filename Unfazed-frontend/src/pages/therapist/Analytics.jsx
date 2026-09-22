import { useMemo, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useEntitlement } from '../../hooks/useEntitlement'
import { attendance, revenueData, sessionTypes } from '../../data/mock'
import { inr } from '../../utils/format'
import { Button, Card, PageHeader, UpgradePrompt } from '../../components/common/ui'
import { C, S, chip, font } from '../../components/common/theme'

function Kpi({ label, value, sub }) {
  return (
    <div style={{ ...S.card, padding: '18px 20px' }}>
      <div style={{ fontSize: 10, color: C.dim, fontFamily: font.mono, letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: font.serif, fontSize: 26, color: C.text }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>
    </div>
  )
}

export default function Analytics() {
  const { canAccess } = useEntitlement()
  const [range, setRange] = useState(6)
  const [upgrade, setUpgrade] = useState(false)
  const advanced = canAccess('analytics.advanced')

  // Mock data. In Module 7 this comes from a MongoDB aggregation endpoint.
  const data = useMemo(() => revenueData.slice(-range), [range])
  const total = data.reduce((sum, d) => sum + d.revenue, 0)
  const lastIdx = data.length - 1

  return (
    <div style={S.page}>
      <PageHeader eyebrow={`${data[0].month.toUpperCase()} – ${data[lastIdx].month.toUpperCase()} 2026`} title="Practice Analytics"
        action={<div style={{ display: 'flex', gap: 8 }}>{[3, 6].map((r) => <button key={r} onClick={() => setRange(r)} style={chip(range === r)}>{r} months</button>)}</div>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Kpi label={`TOTAL REVENUE (${range}M)`} value={inr(total)} sub="cumulative, billed" />
        <Kpi label="AVG SESSIONS/MONTH" value="41.5" sub="trending up" />
        <Kpi label="CLIENT RETENTION" value="87%" sub="after session 4" />
        <Kpi label="LIFETIME VALUE" value="₹38,200" sub="avg per client" />
      </div>

      <Card title="Monthly revenue" style={{ marginBottom: 20 }} bodyStyle={{ padding: 24 }}>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 16 }}>Billed per month</div>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: C.dim, fontSize: 11 }} axisLine={{ stroke: C.line }} tickLine={false} />
              <YAxis tick={{ fill: C.dim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} width={40} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(v) => [inr(v), 'Revenue']}
                contentStyle={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 8, color: C.text2, fontSize: 12 }} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {data.map((d, i) => <Cell key={d.month} fill={i === lastIdx ? C.green : 'rgba(45,143,106,0.3)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {advanced ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card title="Session types (Sep)" bodyStyle={{ padding: 20 }}>
            {sessionTypes.map((row) => (
              <div key={row.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: C.text3 }}>{row.label}</span>
                  <span style={{ fontSize: 11, color: C.muted, fontFamily: font.mono }}>{row.count} ({row.pct}%)</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ height: '100%', width: `${row.pct}%`, borderRadius: 2, background: C.green }} />
                </div>
              </div>
            ))}
          </Card>

          <Card title="Attendance (Sep)" bodyStyle={{ padding: 20 }}>
            {attendance.map((row) => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: C.text3 }}>{row.label}</span>
                <span style={{ fontFamily: font.mono, fontSize: 14, fontWeight: 600, color: C.text2 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ padding: 14, background: 'rgba(240,169,110,0.08)', border: '1px solid rgba(240,169,110,0.15)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: C.amber, marginBottom: 2 }}>No-show rate: 4.2%</div>
              <div style={{ fontSize: 11, color: C.muted }}>Turn on 24h SMS reminders to bring this down.</div>
            </div>
          </Card>
        </div>
      ) : (
        <Card bodyStyle={{ padding: 28, textAlign: 'center' }}>
          <div style={{ fontFamily: font.serif, fontSize: 18, color: C.text2, marginBottom: 6 }}>Detailed analytics</div>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 14 }}>Session types and attendance breakdowns are part of a higher plan.</div>
          <Button onClick={() => setUpgrade(true)}>See plans</Button>
        </Card>
      )}
      {upgrade && <UpgradePrompt feature="Detailed analytics" onClose={() => setUpgrade(false)} />}
    </div>
  )
}
