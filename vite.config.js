import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 프로젝트 사이트는 https://<user>.github.io/<repo>/ 로 서빙되므로
// 프로덕션 빌드에서만 base 경로를 저장소 이름으로 지정한다. (dev는 루트 유지)
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/sites-pet/' : '/',
  plugins: [react()],
}))
