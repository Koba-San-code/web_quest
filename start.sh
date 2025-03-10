#!/bin/bash

# Установка необходимых зависимостей
echo "Установка зависимостей..."
npm install express leaflet react react-dom three

# Установка webpack-cli
echo "Установка webpack-cli..."
npm install -D webpack-cli

# Запуск сборки
echo "Запуск сборки..."
npx webpack --mode production

# Запуск сервера
echo "Запуск сервера..."
node server.js
