require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 10000;

// Включаем CORS для разработки
app.use(cors());

// Настройка парсинга JSON
app.use(express.json());

// Попытка подключения к MongoDB
let mongoose, connectDB, Message, Marker;
try {
  mongoose = require('mongoose');
  connectDB = require('./db/mongo');
  
  if (process.env.NODE_ENV !== 'test') {
    connectDB()
      .then(() => console.log('MongoDB подключена успешно'))
      .catch(err => console.error('Ошибка подключения к MongoDB:', err));
  }
  
  // Загружаем модели для MongoDB
  Message = require('./models/Message');
  Marker = require('./models/Marker');
} catch (err) {
  console.log('Работаем без MongoDB, используем in-memory хранилище');
}

// In-memory хранение для демонстрации
const messages = [];
const markers = [];

// Проверка наличия каталога dist
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.log('Каталог dist не найден. Создание базового HTML...');
  fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  
  const fallbackHtml = `
  <!DOCTYPE html>
  <html lang="ru">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Web Quest</title>
      <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #121212; color: #e0e0e0; }
          .container { max-width: 800px; margin: 0 auto; background-color: #1e1e1e; padding: 20px; border-radius: 8px; }
          h1 { color: #bb86fc; }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>Web Quest</h1>
          <p>Приложение запускается. Пожалуйста, соберите проект командой npm run build.</p>
      </div>
  </body>
  </html>
  `;
  
  fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), fallbackHtml);
}

// API Routes - Сообщения
app.post('/api/messages', async (req, res) => {
  try {
    const message = req.body;
    if (!message.text) {
      return res.status(400).json({ error: 'Текст сообщения не может быть пустым' });
    }
    
    let newMessage;
    
    if (mongoose && Message) {
      // Если MongoDB доступна
      newMessage = new Message({
        text: message.text
      });
      await newMessage.save();
    } else {
      // Иначе используем in-memory
      newMessage = {
        id: Date.now(),
        text: message.text,
        createdAt: new Date()
      };
      messages.push(newMessage);
    }
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Ошибка при создании сообщения:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    let result;
    
    if (mongoose && Message) {
      result = await Message.find().sort({ createdAt: -1 });
    } else {
      result = messages.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Ошибка при получении сообщений:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// API Routes - Маркеры
app.post('/api/markers', async (req, res) => {
  try {
    const { lat, lng, message } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Требуются координаты метки' });
    }
    
    let newMarker;
    
    if (mongoose && Marker) {
      // Если MongoDB доступна
      newMarker = new Marker({
        lat,
        lng,
        message: message || 'Новая метка'
      });
      await newMarker.save();
    } else {
      // Иначе используем in-memory
      newMarker = {
        id: Date.now(),
        lat,
        lng,
        message: message || 'Новая метка',
        createdAt: new Date()
      };
      markers.push(newMarker);
    }
    
    res.status(201).json(newMarker);
  } catch (error) {
    console.error('Ошибка при создании метки:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/markers', async (req, res) => {
  try {
    let result;
    
    if (mongoose && Marker) {
      result = await Marker.find().sort({ createdAt: -1 });
    } else {
      result = markers;
    }
    
    res.json(result);
  } catch (error) {
    console.error('Ошибка при получении меток:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обслуживаем статические файлы из папки dist
app.use(express.static(path.join(__dirname, 'dist')));

// Для всех оставшихся запросов возвращаем index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Запускаем сервер
app.listen(port, () => {
  console.log(`Web Quest сервер запущен на порту ${port}`);
  console.log(`Открыть в браузере: http://localhost:${port}`);
});
