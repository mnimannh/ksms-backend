import * as analyticsModel from '../models/analyticsModel.js';

export const runRules = async (req, res) => {
  try {
    let newCount = 0;

    // INV-002: Slow-moving stock (no sales in 30 days)
    const slowMoving = await analyticsModel.getSlowMovingVariants();
    for (const v of slowMoving) {
      const exists = await analyticsModel.insightExists('INV-002', v.id);
      if (!exists) {
        await analyticsModel.insertInsight(
          'INV-002', v.id,
          `Slow-moving stock: "${v.variant_name}" has not been sold in 30 days (${v.quantity} units remaining).`,
          'warning'
        );
        newCount++;
      }
    }

    // INV-003: High sell-through rate (> 90% in last 7 days)
    const highSellThrough = await analyticsModel.getHighSellThroughVariants();
    for (const v of highSellThrough) {
      const exists = await analyticsModel.insightExists('INV-003', v.id);
      if (!exists) {
        await analyticsModel.insertInsight(
          'INV-003', v.id,
          `Fast-moving item: "${v.variant_name}" has a ${v.sell_through_rate}% sell-through rate this week. Consider restocking soon.`,
          'info'
        );
        newCount++;
      }
    }

    // INV-004: Revenue drop > 20% week-over-week
    const revenueDrop = await analyticsModel.getRevenueDroppingVariants();
    for (const v of revenueDrop) {
      const exists = await analyticsModel.insightExists('INV-004', v.id);
      if (!exists) {
        const drop = Math.round((v.last_week - v.this_week) / v.last_week * 100);
        await analyticsModel.insertInsight(
          'INV-004', v.id,
          `Revenue drop: "${v.variant_name}" revenue fell ${drop}% this week (RM${v.this_week} vs RM${v.last_week} last week).`,
          'critical'
        );
        newCount++;
      }
    }

    res.json({ newInsights: newCount });
  } catch (err) {
    console.error('Rule engine error:', err);
    res.status(500).json({ error: 'Failed to run rules' });
  }
};

export const getInsights = async (req, res) => {
  try {
    const insights = await analyticsModel.getAllInsights();
    res.json(insights);
  } catch (err) {
    console.error('Failed to fetch insights:', err);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const affected = await analyticsModel.markInsightAsRead(req.params.id);
    if (!affected) return res.status(404).json({ error: 'Insight not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to mark insight as read:', err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};
