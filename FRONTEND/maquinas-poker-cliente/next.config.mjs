//** @type {import('next').NextConfig} */
//const nextConfig = {
  // experimental: {  // Comenta o elimina esta línea si no usas server actions
  //   serverActions: true  // Esto estaba causando el error
  // },
  // O si realmente necesitas serverActions:
  //experimental: {
    //serverActions: {
      //enabled: true
   // }
  //}
//}

//export default nextConfig


// next.config.mjs
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el equivalente a __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true
    }
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src')
    };
    return config;
  }
};

export default nextConfig;
