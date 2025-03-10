const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Начало подготовки проекта для Render...');

// Проверяем наличие папки dist
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
  console.log('Папка dist не найдена, создаем...');
  fs.mkdirSync(path.join(__dirname, 'dist'));
}

// Устанавливаем webpack-cli
try {
  console.log('Устанавливаем webpack-cli...');
  execSync('npm install -D webpack-cli --no-save', { stdio: 'inherit' });
} catch (error) {
  console.error('Ошибка при установке webpack-cli:', error);
}

// Сборка проекта
try {
  console.log('Сборка проекта...');
  execSync('npx webpack --mode production', { stdio: 'inherit' });
} catch (error) {
  console.error('Ошибка при сборке проекта:', error);
  
  // В случае ошибки создаем минимальный index.html в dist
  if (!fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
    console.log('Создание аварийного index.html...');
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
            <p>Приложение в настоящее время обновляется. Пожалуйста, проверьте позже.</p>
        </div>
    </body>
    </html>
    `;
    fs.writeFileSync(path.join(__dirname, 'dist', 'index.html'), fallbackHtml);
  }
}

console.log('Подготовка завершена');
