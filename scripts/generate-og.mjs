import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public');

// OG 이미지 SVG (1200×630) — Coral→Violet 그라데이션 + 서비스 정보
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF4D6D"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(0,0,0,0)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.2)" />
    </linearGradient>
  </defs>

  <!-- 배경 그라데이션 -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#overlay)"/>

  <!-- 장식 원들 -->
  <circle cx="120" cy="120" r="180" fill="rgba(255,255,255,0.06)"/>
  <circle cx="1100" cy="520" r="220" fill="rgba(255,255,255,0.05)"/>
  <circle cx="1050" cy="80" r="100" fill="rgba(255,255,255,0.08)"/>
  <circle cx="80" cy="540" r="130" fill="rgba(255,255,255,0.05)"/>

  <!-- 서비스 아이콘 — 하트 + 번개 모티브 (브랜드 로고 컨셉) -->
  <g transform="translate(540, 155)">
    <!-- 큰 하트 실루엣 -->
    <path d="M60 90 C60 90 -20 40 -20 -5 C-20 -35 0 -50 20 -40 C35 -55 60 -55 60 -30 C60 -55 85 -55 100 -40 C120 -50 140 -35 140 -5 C140 40 60 90 60 90 Z"
          fill="rgba(255,255,255,0.25)" />
    <!-- 번개 -->
    <path d="M68 -15 L48 25 L62 25 L52 65 L80 15 L65 15 Z"
          fill="rgba(255,255,255,0.9)" />
  </g>

  <!-- 서비스명 -->
  <text x="600" y="350"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="88"
        font-weight="900"
        fill="white"
        text-anchor="middle"
        letter-spacing="-2">
    뜻밖의 여정
  </text>

  <!-- 서브 카피 -->
  <text x="600" y="430"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="36"
        font-weight="600"
        fill="rgba(255,255,255,0.85)"
        text-anchor="middle"
        letter-spacing="1">
    어디 갈지 고민 끝! 랜덤 데이트 코스
  </text>

  <!-- 키워드 태그들 -->
  <g transform="translate(600, 500)" text-anchor="middle">
    <!-- 태그 1 -->
    <rect x="-295" y="-20" width="170" height="38" rx="19" fill="rgba(255,255,255,0.2)"/>
    <text x="-210" y="5"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="22" font-weight="700" fill="white">
      # 랜덤 데이트 코스
    </text>
    <!-- 태그 2 -->
    <rect x="-110" y="-20" width="140" height="38" rx="19" fill="rgba(255,255,255,0.2)"/>
    <text x="-40" y="5"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="22" font-weight="700" fill="white">
      # 지하철 데이트
    </text>
    <!-- 태그 3 -->
    <rect x="50" y="-20" width="150" height="38" rx="19" fill="rgba(255,255,255,0.2)"/>
    <text x="125" y="5"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="22" font-weight="700" fill="white">
      # 커플 랜덤 여행
    </text>
  </g>

  <!-- 하단 구분선 -->
  <rect x="60" y="570" width="1080" height="2" fill="rgba(255,255,255,0.2)" rx="1"/>

  <!-- 도메인 힌트 -->
  <text x="600" y="605"
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        font-size="24"
        font-weight="500"
        fill="rgba(255,255,255,0.6)"
        text-anchor="middle"
        letter-spacing="2">
    지금 바로 뽑아보세요 &#x1F687;
  </text>
</svg>`;

// OG 이미지 생성
console.log('Generating og.png...');
await sharp(Buffer.from(ogSvg))
  .resize(1200, 630)
  .png()
  .toFile(join(publicDir, 'og.png'));
console.log('✓ public/og.png generated');

// Favicon PNG 생성 (favicon.svg → 다중 사이즈)
const faviconSvg = readFileSync(join(publicDir, 'favicon.svg'));

for (const [size, filename] of [
  [180, 'apple-touch-icon.png'],
  [192, 'favicon-192.png'],
  [512, 'favicon-512.png'],
]) {
  await sharp(faviconSvg)
    .resize(size, size)
    .png()
    .toFile(join(publicDir, filename));
  console.log(`✓ public/${filename} generated (${size}×${size})`);
}

console.log('All assets generated.');
