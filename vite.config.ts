import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ScatterLeaf',
      fileName: (format) => (format === 'es' ? 'scatterleaf.js' : 'scatterleaf.umd.cjs'),
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // Como é zero-dependências no cliente, tudo é embutido limpo
      external: [],
      output: {
        globals: {
          // Globais se houvesse libs externas
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
  },
});
