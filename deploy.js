const { execSync } = require('child_process');

console.log('Сборка React-приложения...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Запуск сервера...');
execSync('npm start', { stdio: 'inherit' });
