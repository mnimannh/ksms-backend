// controllers/shiftAssignmentController.js
import * as shiftModel from '../models/shiftAssignmentModel.js';

// ── Auto-generate algorithm ──────────────────────────────────────────────────
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate(); // month is 1-based here
}

function toDatetimeStr(dateStr, timeStr) {
  return `${dateStr} ${timeStr}:00`;
}

function hoursBetween(start, end) {
  const s = new Date(`2000-01-01T${start}`);
  const e = new Date(`2000-01-01T${end}`);
  return (e - s) / 3600000;
}

function autoGenerateAlgorithm({ year, month, staff, staffPerSlot, morningStart, morningEnd, eveningStart, eveningEnd, assignedBy, skipWeekends = true, blockedDates = [] }) {
  const days = getDaysInMonth(year, month);
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const morningHours = hoursBetween(morningStart, morningEnd);
  const eveningHours = hoursBetween(eveningStart, eveningEnd);
  const hoursPerSlot = { Morning: morningHours, Evening: eveningHours };
  const slots = ['Morning', 'Evening'];
  const blockedSet = new Set(blockedDates);

  // Count working days to calculate fair target
  let workingDays = 0;
  for (let d = 1; d <= days; d++) {
    const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`;
    const dow = new Date(`${dateStr}T00:00:00`).getDay();
    if (skipWeekends && (dow === 0 || dow === 6)) continue;
    if (blockedSet.has(dateStr)) continue;
    workingDays++;
  }

  const totalHours  = workingDays * slots.length * staffPerSlot * ((morningHours + eveningHours) / 2);
  const targetHours = staff.length > 0 ? totalHours / staff.length : 0;

  const assigned = {};
  const lastDate  = {};
  staff.forEach(s => { assigned[s.id] = 0; lastDate[s.id] = ''; });

  const assignments = [];

  for (let d = 1; d <= days; d++) {
    const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`;
    const dow = new Date(`${dateStr}T00:00:00`).getDay();

    // Skip weekends
    if (skipWeekends && (dow === 0 || dow === 6)) continue;
    // Skip blocked dates (public holidays / custom)
    if (blockedSet.has(dateStr)) continue;

    for (const slot of slots) {
      const startTime = toDatetimeStr(dateStr, slot === 'Morning' ? morningStart : eveningStart);
      const endTime   = toDatetimeStr(dateStr, slot === 'Morning' ? morningEnd   : eveningEnd);
      const hrs       = hoursPerSlot[slot];

      const sorted = [...staff].sort((a, b) => {
        const gapA = targetHours - assigned[a.id];
        const gapB = targetHours - assigned[b.id];
        if (Math.abs(gapA - gapB) > 0.01) return gapB - gapA;
        return lastDate[a.id].localeCompare(lastDate[b.id]);
      });

      let picked = 0;
      for (const s of sorted) {
        if (picked >= staffPerSlot) break;
        const alreadyToday = assignments.some(a => a.userID === s.id && a.startTime.startsWith(dateStr));
        if (alreadyToday) continue;
        assignments.push({ userID: s.id, assignedBy, startTime, endTime, shiftType: slot });
        assigned[s.id] += hrs;
        lastDate[s.id]  = dateStr;
        picked++;
      }
    }
  }

  return assignments;
}

// GET all shifts
export const getShifts = async (req, res) => {
  try {
    const shifts = await shiftModel.getAllShifts();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET shift by ID
export const getShift = async (req, res) => {
  try {
    const shift = await shiftModel.getShiftById(req.params.id);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });
    res.json(shift);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST create shift
export const createShift = async (req, res) => {
  try {
    const insertId = await shiftModel.createShift(req.body);
    res.status(201).json({ message: 'Shift created', id: insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update shift
export const updateShift = async (req, res) => {
  try {
    await shiftModel.updateShift(req.params.id, req.body);
    res.json({ message: 'Shift updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE shift
export const deleteShift = async (req, res) => {
  try {
    await shiftModel.deleteShift(req.params.id);
    res.json({ message: 'Shift deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// POST /api/shifts/auto-generate
export const autoGenerate = async (req, res) => {
  try {
    const { year, month, staffPerSlot = 2, morningStart = '08:00', morningEnd = '13:00', eveningStart = '14:00', eveningEnd = '18:00', skipWeekends = true, blockedDates = [] } = req.body;
    const assignedBy = req.user.id;

    if (!year || !month) return res.status(400).json({ message: 'year and month are required' });

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    const hasDraft = await shiftModel.hasDraftForMonth(monthStr);
    if (hasDraft) return res.status(409).json({ message: 'A draft already exists for this month. Discard it first.' });

    const staff = await shiftModel.getEligibleStaff(monthStr);
    if (!staff.length) return res.status(400).json({ message: 'No eligible active staff found for this month.' });

    const assignments = autoGenerateAlgorithm({ year, month, staff, staffPerSlot, morningStart, morningEnd, eveningStart, eveningEnd, assignedBy, skipWeekends, blockedDates });

    await shiftModel.bulkCreateDrafts(assignments);

    // Build hours distribution summary for admin preview
    const summary = {};
    staff.forEach(s => { summary[s.fullName] = 0; });
    assignments.forEach(a => {
      const s = staff.find(x => x.id === a.userID);
      if (s) {
        const hrs = (new Date(`2000-01-01T${a.endTime.slice(11)}`) - new Date(`2000-01-01T${a.startTime.slice(11)}`)) / 3600000;
        summary[s.fullName] = (summary[s.fullName] || 0) + hrs;
      }
    });

    res.json({ success: true, totalAssignments: assignments.length, hoursSummary: summary });
  } catch (err) {
    console.error('autoGenerate error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/shifts/publish
export const publishSchedule = async (req, res) => {
  try {
    const { month } = req.body; // 'YYYY-MM'
    if (!month) return res.status(400).json({ message: 'month is required' });
    await shiftModel.publishDrafts(month);
    res.json({ success: true, message: `Schedule for ${month} published.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/shifts/draft
export const discardDraft = async (req, res) => {
  try {
    const { month } = req.body; // 'YYYY-MM'
    if (!month) return res.status(400).json({ message: 'month is required' });
    await shiftModel.discardDrafts(month);
    res.json({ success: true, message: `Draft for ${month} discarded.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/shifts/staff — get shifts for logged-in user
export const getShiftsForStaff = async (req, res) => {
  try {
    const userID = req.user.id; // assuming your auth middleware sets req.user
    const shifts = await shiftModel.getShiftsByUser(userID);
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};