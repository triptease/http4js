import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/test/**/*Spec.ts'],
    fileParallelism: false,
    typecheck: {enabled: true}
  }
})