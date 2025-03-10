try {
  const express = require('express');
  const path = require('path');
  const fs = require('fs');
  const app = express();
  const port = process.env.PORT || 3000;

  // Проверка наличия каталога dist
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('Каталог dist не найден. Создание базового HTML...');
    try {
      fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
      
      const fallbackHtml = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Web Quest</title>
          <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .container { max-width: 800px; margin: 0 auto; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Web Quest</h1>
              <p>Приложение запускается. Если эта страница не обновляется, возможно, возникли проблемы при сборке.</p>
          </div>
      </body>
      </html>
      `;
      
      fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), fallbackHtml);
      console.log('Базовый HTML-файл создан.');
    } catch (err) {
      console.error('Ошибка при создании базового HTML:', err);
    }
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
} catch (error) {
  console.error('Критическая ошибка при запуске сервера:', error);
  console.log('Создаем простой сервер на http...');
  
  // Резервный сервер на случай отсутствия Express
  const http = require('http');
  const fs = require('fs');
  const path = require('path');
  
  const fallbackHtml = `
  <!DOCTYPE html>
  <html lang="ru">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Web Quest - Аварийный режим</title>
      <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .container { max-width: 800px; margin: 0 auto; }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>Web Quest</h1>
          <p>Аварийный режим работы. Возникла проблема при запуске основного сервера.</p>
      </div>
  </body>
  </html>
  `;
  
  const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(fallbackHtml);
  });
  
  server.listen(process.env.PORT || 3000, () => {
    console.log('Аварийный сервер запущен на порту ' + (process.env.PORT || 3000));
  });
}
