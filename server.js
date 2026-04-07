const express = require('express');
const app = express();

// ОБЯЗАТЕЛЬНО: обработчик для корневого пути
app.get('/', (req, res) => {
  res.send('OK');
});

// ОБЯЗАТЕЛЬНО: обработчик для health check (Railway использует его)
app.get('/health', (req, res) => {
  res.status(200).send('healthy');
});

// Правильный способ получить порт от Railway
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});;
