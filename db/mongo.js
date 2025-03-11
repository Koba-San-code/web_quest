const mongoose = require('mongoose');

// URI для подключения к MongoDB (для продакшена следует использовать переменные окружения)
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/web_quest';

// Подключение к MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB подключена успешно');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
