import * as swap from '../models/swapModel.js';

// POST /api/swaps — staff creates a swap request
export const createSwap = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { targetId, shiftId, targetShiftId } = req.body;
    
    if (!targetId || !shiftId) {
      return res.status(400).json({ message: 'targetId and shiftId are required' });
    }
    if (targetId === requesterId) {
      return res.status(400).json({ message: 'Cannot swap with yourself' });
    }

    const id = await swap.createSwapRequest({ requesterId, targetId, shiftId, targetShiftId });
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/swaps/incoming — target sees requests directed at them
export const getIncoming = async (req, res) => {
  try {
    res.json(await swap.getIncomingSwaps(req.user.id));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/swaps/mine — requester sees their own requests
export const getMine = async (req, res) => {
  try {
    res.json(await swap.getMySwapRequests(req.user.id));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/swaps — admin sees all historical and active swaps
export const getAll = async (req, res) => {
  try {
    res.json(await swap.getAllSwaps());
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/swaps/:id/respond — target accepts or rejects
export const respond = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' | 'rejected'
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or rejected' });
    }

    const s = await swap.getSwapById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Swap not found' });
    if (s.target_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (s.status !== 'pending') return res.status(409).json({ message: 'Swap already responded to' });

    await swap.respondSwap(req.params.id, status);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/swaps/:id/approve — admin approves trade
export const approve = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    const s = await swap.getSwapById(id);
    if (!s) return res.status(404).json({ message: 'Swap request not found' });
    
    // Status Guard Rails
    if (s.status === 'approved') return res.status(409).json({ message: 'This trade has already been approved' });
    if (s.status !== 'accepted') return res.status(409).json({ message: 'Trade must be accepted by target employee first' });

    await swap.approveSwap(id, adminNote);
    res.json({ success: true, message: 'Shift swap approved and roster updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server transaction failure while processing roster swap', error: err.message });
  }
};

// PATCH /api/swaps/:id/reject — admin rejects trade
export const reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    const s = await swap.getSwapById(id);
    if (!s) return res.status(404).json({ message: 'Swap request not found' });
    if (s.status !== 'accepted') return res.status(409).json({ message: 'Can only reject swap requests that are accepted by staff' });

    await swap.rejectSwap(id, adminNote);
    res.json({ success: true, message: 'Swap request denied' });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating swap record', error: err.message });
  }
};

// DELETE /api/swaps/:id — requester cancels their own pending request
export const cancel = async (req, res) => {
  try {
    await swap.cancelSwap(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/swaps/pending-admin — admin views actionable requests only
export const getPendingAdmin = async (req, res) => {
  try {
    const data = await swap.getPendingAdminSwaps();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching admin actionable list', error: err.message });
  }
};

export const getAdminAll = async (req, res) => {
  try {
    const data = await swap.getAllSwapsForAdmin();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching unified swap registry', error: err.message });
  }
};