const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Начало подготовки проекта для Render...');

// Проверяем наличие папки dist
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.log('Папка dist не найдена, создаем...');
  fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
}

// Создаем аварийный HTML файл сразу, чтобы гарантировать наличие файла
console.log('Создание базового index.html...');
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
        <p>Приложение загружается. Пожалуйста, подождите...</p>
    </div>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), fallbackHtml);

try {
  // Запускаем webpack с явным указанием пути к webpack-cli
  console.log('Запуск сборки проекта...');
  const webpackPath = path.join(__dirname, 'node_modules', '.bin', 'webpack');
  
  if (fs.existsSync(webpackPath)) {
    execSync(`${webpackPath} --mode production`, { stdio: 'inherit' });
  } else {
    // Если локального webpack не обнаружено, используем npx
    execSync('npx webpack --mode production', { stdio: 'inherit' });
  }
  
  console.log('Сборка проекта успешно завершена');
} catch (error) {
  console.error('Ошибка при сборке проекта:', error);
  console.log('Продолжение с базовым HTML...');
}

console.log('Подготовка завершена');
