import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  dts: true,
  sourcemap: true,
  format: ['esm', 'cjs']
})