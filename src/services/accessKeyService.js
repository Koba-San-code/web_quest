// Универсальный тестовый ключ
export const UNIVERSAL_KEY = "WEBQUEST2023";

// База тестовых ключей (в будущем заменится на серверную БД)
const ACCESS_KEY_DB = [
  { key: 'ADMIN123', isAdmin: true, unlimited: true }, // Админский ключ
  { key: 'VIP456', isAdmin: false, unlimited: true },  // VIP-ключ 
  { key: 'PREMIUM789', isAdmin: false, unlimited: false }, // Одноразовый ключ
  { key: UNIVERSAL_KEY, isAdmin: false, unlimited: true, description: 'Тестовый универсальный ключ' }
];

// Локальное хранилище для используемых ключей
let usedKeys = new Set();

// Загружаем использованные ключи из localStorage при инициализации
try {
  const savedUsedKeys = localStorage.getItem('usedKeys');
  if (savedUsedKeys) {
    usedKeys = new Set(JSON.parse(savedUsedKeys));
  }
} catch (e) {
  console.error('Ошибка при загрузке использованных ключей:', e);
}

// Сервис для работы с ключами доступа
export const accessKeyService = {
  // Проверяет ключ на валидность
  validateKey(key) {
    const keyData = ACCESS_KEY_DB.find(k => k.key === key);
    if (!keyData) return false;
    
    // Если ключ одноразовый, проверяем, был ли он использован
    if (!keyData.unlimited && usedKeys.has(key)) {
      return false;
    }
    
    return true;
  },
  
  // Активирует ключ, помечая его как использованный
  activateKey(key) {
    const keyData = ACCESS_KEY_DB.find(k => k.key === key);
    if (!keyData) return false;
    
    // Если ключ одноразовый, сохраняем его как использованный
    if (!keyData.unlimited) {
      usedKeys.add(key);
      this.saveUsedKeys();
      
      // В будущем здесь будет API-запрос для сохранения информации на сервере
      console.log('Одноразовый ключ активирован:', key);
    }
    
    return true;
  },
  
  // Проверяет действительность ключа
  isKeyValid(key) {
    if (key === UNIVERSAL_KEY) return true; // Универсальный ключ всегда действителен
    
    const keyData = ACCESS_KEY_DB.find(k => k.key === key);
    if (!keyData) return false;
    
    return keyData.unlimited || !usedKeys.has(key);
  },
  
  // Сохраняет информацию о ключе в localStorage
  saveKey(key) {
    localStorage.setItem('accessKey', key);
    this.activateKey(key);
    return true;
  },
  
  // Сохраняет список использованных ключей в localStorage
  saveUsedKeys() {
    localStorage.setItem('usedKeys', JSON.stringify([...usedKeys]));
  },
  
  // Получает сохраненный ключ
  getSavedKey() {
    return localStorage.getItem('accessKey');
  },
  
  // Проверяет наличие действующего ключа доступа
  checkSavedKey() {
    const savedKey = this.getSavedKey();
    if (!savedKey) return false;
    
    return this.isKeyValid(savedKey);
  },
  
  // Сбрасывает текущий ключ доступа
  resetKey() {
    localStorage.removeItem('accessKey');
  }
};
