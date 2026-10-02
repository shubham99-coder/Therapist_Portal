const mongoose = require('mongoose')
const Session = require('../models/Session')
const Payment = require('../models/Payment')
const Client = require('../models/Client')

function monthsAgoRange(months) {
  const end = new Date()
  end.setDate(1)
  end.setHours(0, 0, 0, 0)
  end.setMonth(end.getMonth() + 1)

  const start = new Date(end)
  start.setMonth(start.getMonth() - months)

  return { start, end }
}

function currentMonthRange() {
  const start = new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)

  return { start, end }
}

function buildMonthLabels(start, months) {
  const result = []

  for (let i = 0; i < months; i += 1) {
    const date = new Date(start)
    date.setMonth(start.getMonth() + i)
    result.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: date.toLocaleString('en-US', { month: 'short' }),
    })
  }

  return result
}

async function buildRevenueTrend(therapistId, start, end, months) {
  const revenueAgg = await Payment.aggregate([
    {
      $match: {
        therapist: therapistId,
        status: 'paid',
        createdAt: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
        revenue: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ])

  return buildMonthLabels(start, months).map((month) => {
    const found = revenueAgg.find(
      (item) => item._id.y === month.year && item._id.m === month.month,
    )

    return {
      month: month.label,
      year: month.year,
      revenue: found?.revenue || 0,
    }
  })
}

// Basic analytics: real MongoDB aggregations for revenue trend and active clients.
exports.getSummary = async (req, res, next) => {
  try {
    const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 12)
    const therapistId = new mongoose.Types.ObjectId(req.user.id)
    const { start, end } = monthsAgoRange(months)

    const [trendAgg, activeClients, revenueByMonth] = await Promise.all([
      Session.aggregate([
        {
          $match: {
            therapist: therapistId,
            start: { $gte: start, $lt: end },
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: { y: { $year: '$start' }, m: { $month: '$start' } },
            count: { $sum: 1 },
          },
        },
      ]),
      Client.countDocuments({ therapist: therapistId, status: 'active' }),
      buildRevenueTrend(therapistId, start, end, months),
    ])

    const totalSessions = trendAgg.reduce((sum, item) => sum + item.count, 0)

    res.json({
      activeClients,
      totalClients: await Client.countDocuments({ therapist: therapistId }),
      avgSessionsPerMonth: Number((totalSessions / months).toFixed(1)),
      revenueByMonth,
    })
  } catch (err) {
    next(err)
  }
}

// Advanced analytics is separately gated by the Entitlement Middleware.
exports.getAdvanced = async (req, res, next) => {
  try {
    const therapistId = new mongoose.Types.ObjectId(req.user.id)
    const { start, end } = currentMonthRange()

    const attendanceAgg = await Session.aggregate([
      {
        $match: {
          therapist: therapistId,
          start: { $gte: start, $lt: end },
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const countOf = (status) =>
      attendanceAgg.find((item) => item._id === status)?.count || 0

    const completed = countOf('completed')
    const noShow = countOf('no-show')
    const cancelled = countOf('cancelled')
    const confirmed = countOf('confirmed')
    const nonCancelledTotal = completed + noShow + confirmed
    const noShowRatePct = nonCancelledTotal
      ? Number(((noShow / nonCancelledTotal) * 100).toFixed(1))
      : 0

    res.json({
      attendance: { completed, cancelled, noShow },
      noShowRatePct,
      sessionsThisMonth: completed + noShow + confirmed,
    })
  } catch (err) {
    next(err)
  }
}
