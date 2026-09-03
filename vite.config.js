import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import decodeLessonImages from './plugins/decode-lesson-images.js'
import generateLessonDiagrams from './plugins/generate-lesson-diagrams.js'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    // Decodes assets-b64/**.b64 into real binary files under public/ before
    // dev and before build, so lesson diagram <img> paths resolve.
    decodeLessonImages(),
    // Draws the A2 lesson diagrams straight into public/ at build time, so the
    // 240 slide images are generated from code rather than stored as binaries.
    generateLessonDiagrams(),
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true'
    }),
    react(),
  ]
});
