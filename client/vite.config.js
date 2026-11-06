// Plugins
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // nodePolyfills({
    //   // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
    //   include: ['path'],
    //   // To exclude specific polyfills, add them to this list. Note: if include is provided, this has no effect
    //   exclude: [
    //     'http', // Excludes the polyfill for `http` and `node:http`.
    //   ],
    //   // Whether to polyfill specific globals.
    //   globals: {
    //     Buffer: true, // can also be 'build', 'dev', or false
    //     global: true,
    //     process: true,
    //   },
    //   // Override the default polyfills for specific modules.
    //   overrides: {
    //     // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
    //     fs: 'memfs',
    //   },
    //   // Whether to polyfill `node:` protocol imports.
    //   protocolImports: true,
    // })
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 9000,
    proxy: {
        '/api/': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
            ws: true,
        },
        '/uploads/': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
        },
        '/socket.io': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,      
          ws: true,
      }
    },
    cors: false
  },

})
