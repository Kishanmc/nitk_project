import Session from '../models/Session.js';
import User from '../models/User.js';

export const uploadSession = async (req, res) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({ message: 'Only patients can upload' });
  }

  const { filename, data, metrics } = req.body;

  const session = await Session.create({
    user_id: req.user.id,
    filename,
    sample_count: data.length,
    duration_sec: metrics.duration,
    metrics,
    data
  });

  res.json(session);
};

export const getSessions = async (req, res) => {
  if (req.user.role === 'patient') {
    const sessions = await Session.find({
      user_id: req.user.id
    }).sort({ uploaded_at: -1 });

    return res.json(sessions);
  }

  if (req.user.role === 'doctor') {
    const patients = await User.find({ doctor_id: req.user.id });
    const ids = patients.map(p => p._id);

    const sessions = await Session.find({
      user_id: { $in: ids }
    })
      .populate('user_id', 'name email')
      .sort({ uploaded_at: -1 });

    return res.json(sessions);
  }

  res.status(403).json({ message: 'Access denied' });
};
