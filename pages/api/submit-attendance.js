// pages/api/submit-attendance.js

import connectDB from '../../lib/mongodb';
import Attendance from '../../models/Attendance';
import User from '../../models/User';
import dayjs from 'dayjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectDB();

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Missing userId' });
    }

    const user = await User.findOne({ userId: String(userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const now = dayjs();
    const date = now.format('YYYY-MM-DD');
    const time = now.format('HH:mm:ss');

    let record = await Attendance.findOne({ userId: String(userId), date });

    if (!record) {
      record = await Attendance.create({
        userId: String(userId),
        name: user.name,
        role: user.role,
        date,
        punchIn: time,
      });

      return res.status(200).json({ message: '✅ Punched In Successfully' });
    } else if (!record.punchOut) {
      record.punchOut = time;
      await record.save();

      return res.status(200).json({ message: '📤 Punched Out Successfully' });
    } else {
      return res.status(200).json({ message: '✅ Already Punched In & Out' });
    }
  } catch (err) {
    console.error('[Attendance API Error]', err);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: err.message,
    });
  }
}
