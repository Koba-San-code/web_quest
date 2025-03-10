const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production', // Явно устанавливаем режим production
  entry: './src/index.js', // Изменено с index.jsx на index.js для соответствия файлу
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true // Очистка папки dist перед сборкой
  },
  resolve: { 
    extensions: ['.js', '.jsx'],
    // Добавим более строгое разрешение имен файлов
    enforceExtension: false
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // поддержка jsx
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'] // добавьте preset-react
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    compress: true,
    port: 3000,
    hot: true,
    // Перезагружать страницу при ошибках импорта
    client: {
      overlay: true
    }
  }
};
