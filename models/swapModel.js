import db from '../db/connection.js';

const SELECT_SWAP = `
  SELECT
    r.id, r.status, r.admin_note, r.created_at, r.updated_at,
    req.id AS requester_id, req.fullName AS requester_name,
    tgt.id AS target_id,   tgt.fullName AS target_name,
    sr.id AS shift_id, sr.startTime AS shift_start, sr.endTime AS shift_end, sr.shiftType AS shift_type,
    ts.id AS target_shift_id, ts.startTime AS target_shift_start, ts.endTime AS target_shift_end, ts.shiftType AS target_shift_type
  FROM shift_swap_request r
  JOIN user req ON req.id = r.requester_id
  JOIN user tgt ON tgt.id = r.target_id
  JOIN shift_assignment sr ON sr.id = r.shift_id
  LEFT JOIN shift_assignment ts ON ts.id = r.target_shift_id
`;

export const createSwapRequest = async ({ requesterId, targetId, shiftId, targetShiftId }) => {
  const [result] = await db.query(
    'INSERT INTO shift_swap_request (requester_id, target_id, shift_id, target_shift_id) VALUES (?, ?, ?, ?)',
    [requesterId, targetId, shiftId, targetShiftId ?? null]
  );
  return result.insertId;
};

export const getSwapById = async (id) => {
  const [rows] = await db.query(`${SELECT_SWAP} WHERE r.id = ?`, [id]);
  return rows[0];
};

// Swaps where I am the target (incoming requests for me to respond)
export const getIncomingSwaps = async (userId) => {
  const [rows] = await db.query(
    `${SELECT_SWAP} WHERE r.target_id = ? AND r.status = 'pending' ORDER BY r.created_at DESC`,
    [userId]
  );
  return rows;
};

// All my swap requests (as requester)
export const getMySwapRequests = async (userId) => {
  const [rows] = await db.query(
    `${SELECT_SWAP} WHERE r.requester_id = ? ORDER BY r.created_at DESC`,
    [userId]
  );
  return rows;
};

// Admin: all swaps awaiting admin approval (target accepted)
export const getPendingAdminSwaps = async () => {
  const [rows] = await db.query(
    `${SELECT_SWAP} WHERE r.status = 'accepted' ORDER BY r.created_at DESC`
  );
  return rows;
};

// All swaps (admin view)
export const getAllSwaps = async () => {
  const [rows] = await db.query(`${SELECT_SWAP} ORDER BY r.created_at DESC`);
  return rows;
};

// Target responds: accept or reject
export const respondSwap = async (id, status) => {
  await db.query(
    'UPDATE shift_swap_request SET status = ? WHERE id = ?',
    [status, id]
  );
};

// Admin approves: swap the userIDs on both shift_assignment rows
export const approveSwap = async (id, adminNote) => {
  const swap = await getSwapById(id);
  if (!swap) throw new Error('Swap request not found');

  await db.query('UPDATE shift_swap_request SET status = ?, admin_note = ? WHERE id = ?', ['approved', adminNote ?? null, id]);

  // Swap requester into target's shift, target into requester's shift
  await db.query('UPDATE shift_assignment SET userID = ? WHERE id = ?', [swap.target_id,    swap.shift_id]);
  if (swap.target_shift_id) {
    await db.query('UPDATE shift_assignment SET userID = ? WHERE id = ?', [swap.requester_id, swap.target_shift_id]);
  }

  // Update attendance logs too
  await db.query('UPDATE shift_attendance_log SET userID = ? WHERE shiftID = ?', [swap.target_id,    swap.shift_id]);
  if (swap.target_shift_id) {
    await db.query('UPDATE shift_attendance_log SET userID = ? WHERE shiftID = ?', [swap.requester_id, swap.target_shift_id]);
  }
};

export const rejectSwap = async (id, adminNote) => {
  await db.query(
    'UPDATE shift_swap_request SET status = ?, admin_note = ? WHERE id = ?',
    ['rejected', adminNote ?? null, id]
  );
};

export const cancelSwap = async (id, requesterId) => {
  await db.query(
    `UPDATE shift_swap_request SET status = 'cancelled'
     WHERE id = ? AND requester_id = ? AND status = 'pending'`,
    [id, requesterId]
  );
};
