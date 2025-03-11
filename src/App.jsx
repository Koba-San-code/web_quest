import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import { sendMessage, getMapMarkers } from './services/api';

const App = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [activeSection, setActiveSection] = useState('map');

  // Загрузка существующих меток при монтировании
  useEffect(() => {
    async function loadMarkers() {
      try {
        console.log('Fetching markers from API...');
        const data = await getMapMarkers();
        console.log('Markers received:', data);
        setMarkers(data || []); // Гарантируем, что markers всегда будет массивом
      } catch (err) {
        console.error('Ошибка загрузки меток:', err);
        setMarkers([]); // В случае ошибки устанавливаем пустой массив
      }
    }
    
    loadMarkers();
  }, []);

  // Обработчик отправки сообщения
  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Введите сообщение перед отправкой');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await sendMessage(message);
      alert('Сообщение успешно отправлено!');
      setMessage('');
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      setError('Не удалось отправить сообщение. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик добавления новой метки
  const handleMarkerAdded = (newMarker) => {
    if (!newMarker) return;
    console.log('New marker added:', newMarker);
    setMarkers(prevMarkers => [...(prevMarkers || []), newMarker]);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Web Quest</h1>
        <nav>
          <ul>
            <li>
              <button 
                className={activeSection === 'map' ? 'active' : ''} 
                onClick={() => setActiveSection('map')}
              >
                Карта
              </button>
            </li>
            <li>
              <button 
                className={activeSection === 'messages' ? 'active' : ''} 
                onClick={() => setActiveSection('messages')}
              >
                Сообщения
              </button>
            </li>
            <li>
              <button 
                className={activeSection === 'about' ? 'active' : ''} 
                onClick={() => setActiveSection('about')}
              >
                О проекте
              </button>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        {activeSection === 'map' && (
          <section className="map-section">
            <h2>Интерактивная карта мира</h2>
            <Map onMarkerAdded={handleMarkerAdded} markers={markers} />
            <div className="map-info">
              <p>
                <strong>Как использовать карту:</strong>
              </p>
              <ul>
                <li>Нажмите на карту, чтобы добавить новую метку вручную</li>
                <li>Используйте кнопку "Моё местоположение" для автоматического определения вашего местоположения</li>
                <li>Добавлено меток: {markers.length}</li>
              </ul>
            </div>
          </section>
        )}

        {activeSection === 'messages' && (
          <section className="message-section">
            <h2>Отправить сообщение</h2>
            <div className="message-form-container">
              <form id="message-form" onSubmit={handleSubmitMessage}>
                <div className="form-group">
                  <label htmlFor="message">Ваше сообщение:</label>
                  <textarea 
                    id="message" 
                    rows="6" 
                    placeholder="Введите ваше сообщение..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                  ></textarea>
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? 'Отправка...' : 'Отправить'}
                </button>
              </form>
            </div>
          </section>
        )}

        {activeSection === 'about' && (
          <section className="about-section">
            <h2>О проекте Web Quest</h2>
            <div className="about-content">
              <p>
                Web Quest — это экспериментальный веб-сайт, на котором пользователи могут:
              </p>
              <ul>
                <li>Анонимно отправлять сообщения другим пользователям</li>
                <li>Оставлять свои метки на карте для связи с другими пользователями</li>
              </ul>
              <p>
                Проект реализован с использованием современного стека технологий:
              </p>
              <ul>
                <li>Frontend: React, Leaflet</li>
                <li>Backend: Express, MongoDB</li>
                <li>Сборка: Webpack, Babel</li>
              </ul>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Web Quest &copy; {new Date().getFullYear()}. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default App;
