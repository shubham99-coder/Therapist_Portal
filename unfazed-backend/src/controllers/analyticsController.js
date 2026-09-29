const mongoose = require('mongoose');
const Session = require('../models/Session');
const Payment = require('../models/Payment');

function monthsAgoRange(months) {
  const end = new Date();
  end.setDate(1);
  end.setHours(0, 0, 0, 0);
  end.setMonth(end.getMonth() + 1);

  const start = new Date(end);
  start.setMonth(start.getMonth() - months);

  return { start, end };
}

function currentMonthRange() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  return { start, end };
}

function buildMonthLabels(start, months) {
  const result = [];

  for (let i = 0; i < months; i += 1) {
    const date = new Date(start);
    date.setMonth(start.getMonth() + i);

    result.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: date.toLocaleString('en-US', { month: 'short' }),
    });
  }

  return result;
}

// GET /api/analytics/summary?months=6
exports.getSummary = async (req, res, next) => {
  try {
    const months = Math.min(
      Math.max(Number(req.query.months) || 6, 1),
      12,
    );

    const therapistId = new mongoose.Types.ObjectId(req.user.id);

    // Current-month attendance.
    const { start: mStart, end: mEnd } = currentMonthRange();

    const attendanceAgg = await Session.aggregate([
      {
        $match: {
          therapist: therapistId,
          start: { $gte: mStart, $lt: mEnd },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const countOf = (status) =>
      attendanceAgg.find((item) => item._id === status)?.count || 0;

    const completed = countOf('completed');
    const noShow = countOf('no-show');
    const cancelled = countOf('cancelled');
    const confirmed = countOf('confirmed');

    const nonCancelledTotal = completed + noShow + confirmed;

    const noShowRatePct = nonCancelledTotal
      ? Number(((noShow / nonCancelledTotal) * 100).toFixed(1))
      : 0;

    // Sessions per month across the requested range.
    const { start, end } = monthsAgoRange(months);

    const trendAgg = await Session.aggregate([
      {
        $match: {
          therapist: therapistId,
          start: { $gte: start, $lt: end },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            y: { $year: '$start' },
            m: { $month: '$start' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSessions = trendAgg.reduce(
      (sum, item) => sum + item.count,
      0,
    );

    const avgSessionsPerMonth = Number(
      (totalSessions / months).toFixed(1),
    );

    // Paid revenue per month.
    // Payment.amount is the gross INR amount charged to the client.
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
          _id: {
            y: { $year: '$createdAt' },
            m: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
        },
      },
    ]);

    // Include zero-value months so the bar chart always has exactly
    // the requested number of monthly buckets.
    const monthLabels = buildMonthLabels(start, months);

    const revenueByMonth = monthLabels.map((month) => {
      const found = revenueAgg.find(
        (item) =>
          item._id.y === month.year &&
          item._id.m === month.month,
      );

      return {
        month: month.label,
        year: month.year,
        revenue: found?.revenue || 0,
      };
    });

    res.json({
      attendance: {
        completed,
        cancelled,
        noShow,
      },
      noShowRatePct,
      avgSessionsPerMonth,
      sessionsThisMonth: completed + noShow + confirmed,
      revenueByMonth,
    });
  } catch (err) {
    next(err);
  }
};
