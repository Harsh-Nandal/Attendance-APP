import FormData from 'form-data';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, role, userId, imageData } = req.body;

  const BOT_TOKEN = '7898870624:AAFrTSIpeNNLJ4pv9s3y83KyBry4iuTkCAs'; // 🔐 Replace with .env in production
  const CHAT_ID = '6693681914'; // 🆔 Replace this with your group or user ID

  try {
    // Get current date & time
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    // Decode base64 image
    const buffer = Buffer.from(imageData.split(',')[1], 'base64');

    // Create form data
    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    form.append(
      'caption',
      `🧑‍🎓 *Name:* ${name}\n📌 *Role:* ${role}\n🆔 *ID:* ${userId}\n🗓️ *Date:* ${date}\n⏰ *Time:* ${time}`
    );
    form.append('photo', buffer, {
      filename: `${name}_photo.jpg`,
      contentType: 'image/jpeg',
    });

    // Send to Telegram
    const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: form,
    });

    if (!telegramRes.ok) {
      const errorText = await telegramRes.text();
      console.error('Telegram Error:', errorText);
      throw new Error('Failed to send photo to Telegram');
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Telegram send error:', err);
    res.status(500).json({ error: 'Failed to send to Telegram' });
  }
}
