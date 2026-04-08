// api/send-gift.js
const axios = require('axios');
const crypto = require('crypto');

// Функция валидации (как у вас)
function validateInitData(initData, token) {
    try {
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');
        params.delete('hash');
        
        const dataCheckString = Array.from(params.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join('\n');
            
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
        const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
        
        return computedHash === hash;
    } catch (e) {
        return false;
    }
}

export default async function handler(req, res) {
    // Только POST запросы
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const { initData, username, userId, giftValue, giftImage, time } = req.body;
        
        // 🔐 Валидация (опционально, но рекомендуется)
        if (initData && !validateInitData(initData, process.env.BOT_TOKEN)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
        
        const message = `🎁 <b>НОВЫЙ ПОДАРОК</b>

👤 <b>Юзернейм:</b> ${username}
🆔 <b>ID:</b> <code>${userId}</code>
💎 <b>Стоимость:</b> ${giftValue} кристаллов
🕐 <b>Время:</b> ${time}

🖼 <b>Подарок:</b> <a href="${giftImage}">Смотреть</a>`;
        
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: ADMIN_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
        
        return res.status(200).json({ success: true });
        
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}