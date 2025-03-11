import axios from 'axios';

// Базовый URL для API
// В режиме разработки запросы будут проксироваться через webpack-dev-server
const API_URL = '/api';

export const sendMessage = async (message) => {
  try {
    const response = await axios.post(`${API_URL}/messages`, { text: message });
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    throw error;
  }
};

export const addMapMarker = async (lat, lng, message) => {
  try {
    const response = await axios.post(`${API_URL}/markers`, { lat, lng, message });
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании метки:', error);
    throw error;
  }
};

export const getMapMarkers = async () => {
  try {
    const response = await axios.get(`${API_URL}/markers`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении меток:', error);
    throw error;
  }
};
