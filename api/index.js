// Это точка входа для API-роутов на Vercel
const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Включаем CORS и JSON-парсинг
app.use(cors());
app.use(express.json());

// Подключаем соединение с MongoDB
let mongoose, connectDB, Message, Marker;
const uri = process.env.MONGODB_URI;

try {
  mongoose = require('mongoose');
  connectDB = require('../db/mongo');
  
  connectDB()
    .then(() => console.log('MongoDB подключена успешно'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));
  
  // Загружаем модели
  Message = require('../models/Message');
  Marker = require('../models/Marker');
} catch (err) {
  console.log('Работаем без MongoDB, используем in-memory хранилище');
}

// In-memory хранилище для fallback
const messages = [];
const markers = [];

// API эндпоинты для сообщений
app.post('/api/messages', async (req, res) => {
  try {
    const message = req.body;
    if (!message.text) {
      return res.status(400).json({ error: 'Текст сообщения не может быть пустым' });
    }
    
    let newMessage;
    
    if (mongoose && Message) {
      newMessage = new Message({ text: message.text });
      await newMessage.save();
    } else {
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

// API эндпоинты для маркеров
app.post('/api/markers', async (req, res) => {
  try {
    const { lat, lng, message } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Требуются координаты метки' });
    }
    
    let newMarker;
    
    if (mongoose && Marker) {
      newMarker = new Marker({
        lat,
        lng,
        message: message || 'Новая метка'
      });
      await newMarker.save();
    } else {
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

module.exports = app;