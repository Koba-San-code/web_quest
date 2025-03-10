const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Проверка наличия каталога dist
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.error('Ошибка: Каталог dist не найден!');
  console.log('Необходимо сначала собрать приложение командой npm run build');
  process.exit(1);
}

// Обслуживаем статические файлы из папки dist
app.use(express.static(path.join(__dirname, 'dist')));

// Для всех запросов возвращаем index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Запускаем сервер
app.listen(port, () => {
  console.log(`Web Quest сервер запущен на порту ${port}`);
  console.log(`Откройте http://localhost:${port} в браузере`);
});
