import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'TravelGenie AI',
          short_name: 'TravelGenie',
          description: 'AI Intelligent Travel Planner',
          theme_color: '#FFFFFF',
          display: 'standalone', // 讓它像 App 一樣沒有網址列
          icons: [
            {
              src: 'https://cdn-icons-png.flaticon.com/512/826/826070.png', // 暫時指向一個測試圖示
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    define: {
      // 確保 process.env 在生產環境有效
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        // 重要：因為你 index.html 用了 importmap，必須告訴 Vite 不要打包這些套件 
        external: [
          'react',
          'react-dom',
          '@google/genai',
          'lucide-react',
          'react-markdown'
        ],
      }
    }
  };
});
