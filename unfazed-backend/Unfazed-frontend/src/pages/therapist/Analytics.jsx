import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, startOfMonth, subMonths } from 'date-fns'

import { useEntitlement } from '../../hooks/useEntitlement'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/errors'
import { getAnalyticsSummary } from '../../api/analytics'
import { inr } from '../../utils/format'

import {
  Button,
  Card,
  PageHeader,
  Spinner,
  UpgradePrompt,
} from '../../components/common/ui'
import { C, S, chip, font } from '../../components/common/theme'

function Kpi({ label, value, sub }) {
  return (
    <div style={{ ...S.card, padding: '18px 20px' }}>
      <div style={{ fontSize: 10, color: C.dim, fontFamily: font.mono, letterSpacing: '0.06em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: font.serif, fontSize: 26, color: C.text }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
        {sub}
      </div>
    </div>
  )
}

const attendanceColor = {
  Completed: '#2d8f6a',
  Cancelled: '#9ab8f0',
  'No-show': '#f0a96e',
}

export default function Analytics() {
  const { canAccess } = useEntitlement()
  const toast = useToast()

  const [range, setRange] = useState(6)
  const [upgrade, setUpgrade] = useState(false)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)

  const advanced = canAccess('analytics.advanced')

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const data = await getAnalyticsSummary(range)
      setSummary(data)
    } catch (err) {
      console.error('Analytics error:', err)
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [range, toast])

  useEffect(() => {
    load()
  }, [load])

  const monthStarts = useMemo(
    () =>
      Array.from(
        { length: range },
        (_, i) => subMonths(startOfMonth(new Date()), range - 1 - i),
      ),
    [range],
  )

  const eyebrow = summary
    ? `${format(monthStarts[0], 'MMM').toUpperCase()} – ${format(monthStarts[monthStarts.length - 1], 'MMM yyyy').toUpperCase()}`
    : `${range} MONTHS`

  const revenueData = summary?.revenueByMonth || []

  const totalRevenue = revenueData.reduce(
    (sum, item) => sum + Number(item.revenue || 0),
    0,
  )

  const attendanceRows = summary
    ? [
        { label: 'Completed', value: summary.attendance.completed },
        { label: 'Cancelled', value: summary.attendance.cancelled },
        { label: 'No-show', value: summary.attendance.noShow },
      ]
    : []

  if (loading && !summary) {
    return <Spinner label="Loading analytics" />
  }

  return (
    <div style={S.page}>
      <PageHeader
        eyebrow={eyebrow}
        title="Practice Analytics"
        action={(
          <div style={{ display: 'flex', gap: 8 }}>
            {[3, 6].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                style={chip(range === r)}
              >
                {r} months
              </button>
            ))}
          </div>
        )}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Kpi
          label={`TOTAL REVENUE (${range}M)`}
          value={inr(totalRevenue)}
          sub="cumulative, billed"
        />
        <Kpi
          label="AVG SESSIONS/MONTH"
          value={String(summary?.avgSessionsPerMonth ?? 0)}
          sub={`real data, last ${range} months`}
        />
        <Kpi
          label="CLIENT RETENTION"
          value="—"
          sub="Not yet computed"
        />
        <Kpi
          label="LIFETIME VALUE"
          value="—"
          sub="Not yet computed"
        />
      </div>

      <Card title="Monthly revenue" style={{ marginBottom: 20 }} bodyStyle={{ padding: 24 }}>
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 16 }}>
          Billed revenue per month
        </div>

        <div style={{ width: '100%', height: 280 }}>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fill: C.dim, fontSize: 11 }}
                  axisLine={{ stroke: C.line }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: C.dim, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) =>
                    value >= 1000 ? `₹${value / 1000}k` : `₹${value}`
                  }
                  width={55}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  formatter={(value) => [inr(value), 'Revenue']}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{
                    background: C.card,
                    border: `1px solid ${C.line}`,
                    borderRadius: 8,
                    color: C.text2,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill={C.green}
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim, fontSize: 12 }}>
              No revenue data available yet.
            </div>
          )}
        </div>
      </Card>

      {advanced ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card title="Attendance" bodyStyle={{ padding: 20 }}>
            {attendanceRows.every((row) => row.value === 0) ? (
              <div style={{ fontSize: 12, color: C.dim, padding: '8px 0 16px' }}>
                No sessions recorded yet this month.
              </div>
            ) : (
              attendanceRows.map((row) => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: attendanceColor[row.label], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: C.text3 }}>{row.label}</span>
                  <span style={{ fontFamily: font.mono, fontSize: 14, fontWeight: 600, color: C.text2 }}>{row.value}</span>
                </div>
              ))
            )}

            <div style={{ padding: 14, background: 'rgba(240,169,110,0.08)', border: '1px solid rgba(240,169,110,0.15)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: C.amber, marginBottom: 2 }}>
                No-show rate: {summary?.noShowRatePct ?? 0}%
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>
                Based on recorded session statuses.
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card bodyStyle={{ padding: 28, textAlign: 'center' }}>
          <div style={{ fontFamily: font.serif, fontSize: 18, color: C.text2, marginBottom: 6 }}>
            Detailed analytics
          </div>
          <div style={{ fontSize: 12, color: C.dim, marginBottom: 14 }}>
            Session types and attendance breakdowns are part of a higher plan.
          </div>
          <Button onClick={() => setUpgrade(true)}>See plans</Button>
        </Card>
      )}

      {upgrade && (
        <UpgradePrompt
          feature="Detailed analytics"
          onClose={() => setUpgrade(false)}
        />
      )}
    </div>
  )
}
