require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Функция проверки данных от Telegram (Безопасность)
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

app.post('/api/get-fresh-avatar', async (req, res) => {
    const { user_id, initData } = req.body;

    // 1. Проверяем, что запрос реальный
    if (!validateInitData(initData, BOT_TOKEN)) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        // 2. Запрашиваем фото через API бота
        const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getUserProfilePhotos`, {
            params: { user_id, limit: 1 }
        });

        if (response.data.result.total_count > 0) {
            const fileId = response.data.result.photos[0][0].file_id;
            // 3. Получаем прямую ссылку на файл
            const fileResponse = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getFile`, {
                params: { file_id: fileId }
            });
            const filePath = fileResponse.data.result.file_path;
            const photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
            
            return res.json({ photo_url: photoUrl });
        }
        res.json({ photo_url: null });
    } catch (error) {
        console.error('Avatar fetch error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));