const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Функция для проверки и создания директории dist, если её нет
function ensureDistDirectory() {
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
}

// Запуск команды в зависимости от режима
async function runWebpack(mode) {
  ensureDistDirectory();

  console.log(`Запуск webpack в режиме: ${mode}`);
  
  let command = 'npx';
  let args;
  const env = { ...process.env };
  
  if (mode === 'dev') {
    args = ['webpack', 'serve', '--mode', 'development', '--open'];
  } else if (mode === 'build') {
    env.NODE_ENV = 'production';
    args = ['webpack', '--mode', 'production'];
  } else {
    console.error(`Неизвестный режим: ${mode}`);
    process.exit(1);
  }
  
  console.log(`Выполнение: ${command} ${args.join(' ')}`);
  
  const result = spawnSync(command, args, { 
    stdio: 'inherit', 
    env,
    shell: true
  });
  
  if (result.error || result.status !== 0) {
    console.error(`Ошибка при запуске webpack`);
    return false;
  }
  
  console.log(`Webpack успешно выполнил команду в режиме: ${mode}`);
  return true;
}

// Получаем режим из аргументов командной строки
const mode = process.argv[2];
if (!mode) {
  console.error('Режим не указан. Используйте: node webpack-runner.js [dev|build]');
  process.exit(1);
}

// Запускаем webpack
runWebpack(mode).catch(error => {
  console.error('Произошла непредвиденная ошибка:', error);
  process.exit(1);
});
