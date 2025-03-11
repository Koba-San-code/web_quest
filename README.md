# Web Quest

Экспериментальный веб-сайт, на котором пользователи могут:
- Анонимно выбирать на 3D модели планеты (Пока что на простой карте) геометку для отправки сообщений. *(Временно разработка 3D отложена из-за того что я ленивый)*
- Оставлять свои метки на карте для связи с другими пользователями.

## Системные требования

- Node.js версии 14.0.0 или выше
- NPM или Yarn для управления зависимостями
- MongoDB (опционально, проект может работать с in-memory хранилищем)

## Идея проекта

Проект теперь ориентирован на использование современного стека технологий:
- Frontend реализован с помощью React, что упрощает создание интерактивного и масштабируемого интерфейса.
- *ОТЛОЖЕНО И УДАЛЕНО* Интеграция Three.js для 3D визуализации планеты, позволяющая создавать захватывающий пользовательский опыт.
- Для работы с картами применяются библиотеки *Mapbox GL JS (вырезано)* или Leaflet.
- Backend построен на Node.js с использованием Express (или NestJS) для создания REST API и поддержки WebSockets для обмена мгновенными сообщениями.
- Хранение данных осуществляется в MongoDB, а Redis используется для кэширования и обеспечения работы в реальном времени.


## Технологии

- Frontend: React, Three.js (временно отключен), Leaflet
- Backend: Express, MongoDB (опционально)
- Сборка: Webpack, Babel

## Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Режим разработки

Запуск одновременно frontend и backend серверов:

```bash
npm run dev
```

### Сборка для production

```bash
npm run build
```

### Запуск production сервера

```bash
npm start
```

## Подготовка к запуску

### 1. Клонирование репозитория

```bash
git clone <url_репозитория>
cd web_quest
```

### 2. Установка зависимостей

```bash
npm install
```

## Структура проекта

- `/src` - исходный код React-приложения
- `/public` - статические файлы
- `/models` - модели данных для MongoDB
- `/db` - настройки базы данных
- `/dist` - скомпилированное приложение (создаётся при сборке)


### 3. Создание конфигурационных файлов

Поскольку конфигурационные файлы не включены в репозиторий для безопасности, их необходимо создать вручную:

#### Создание файла .env

Создайте файл `.env` в корневом каталоге проекта со следующим содержимым:

MONGODB_URI=mongodb://localhost:27017/web_quest
PORT=10000
NODE_ENV=development

## Конфигурация

Настройки хранятся в файле `.env`:

- `PORT` - порт для Express-сервера (по умолчанию 10000)
- `MONGODB_URI` - путь к MongoDB
- `NODE_ENV` - окружение (`development` или `production`)

#### Создание файла .npmrc (опционально)
Если у вас возникают проблемы с установкой зависимостей, создайте файл `.npmrc` в корневом каталоге с настройками:

## Основные настройки
fund=false
audit=false
loglevel=error

## Для корректной установки зависимостей
legacy-peer-deps=true

## Настройки сети
registry=https://registry.npmjs.org/
prefer-offline=true
network-timeout=60000

save-exact=true
engine-strict=false


#### 4. Настройка MongoDB (опционально)
Если вы хотите использовать MongoDB для хранения данных:

Установите MongoDB с официального сайта - https://www.mongodb.com/try/download/community
Запустите MongoDB сервер
Укажите правильный URI в файле .env (или разверните локальную БД)
Если MongoDB не установлена или недоступна, проект автоматически переключится на in-memory хранилище.

## Примечания

MongoDB не является обязательной для запуска. Если подключение недоступно, проект автоматически переключится на in-memory хранилище.

