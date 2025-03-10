import React from 'react';
import Globe from './components/Globe'; // Правильный регистр имени файла
import Map from './components/Map';   // Правильный регистр имени файла

const App = () => {
  return (
    <div className="container">
      <h1>Добро пожаловать в Web Quest</h1>

      <section>
        <h2>Глобальная карта пользователей</h2>
        <Globe />
      </section>

      <section>
        <h2>Отправить сообщение</h2>
        <div className="message-form">
          <form id="message-form">
            <div className="form-group">
              <label htmlFor="message">Ваше сообщение:</label>
              <textarea id="message" rows="4" placeholder="Введите ваше сообщение..."></textarea>
            </div>
            <button type="submit">Отправить</button>
          </form>
        </div>
      </section>

      <section>
        <h2>Карта меток</h2>
        <Map />
      </section>
    </div>
  );
};

export default App;
