# 배포 가이드 (Deployment Guide)

도서관 예약 시스템의 배포 방법을 단계별로 안내합니다.

## 목차

- [배포 전략](#배포-전략)
- [사전 요구사항](#사전-요구사항)
- [Firebase 설정](#firebase-설정)
- [Vercel 배포](#vercel-배포)
- [Firebase Hosting 배포](#firebase-hosting-배포)
- [수동 배포](#수동-배포)
- [환경별 설정](#환경별-설정)
- [모니터링 및 유지보수](#모니터링-및-유지보수)
- [문제 해결](#문제-해결)

## 배포 전략

### 권장 배포 방식

1. **프론트엔드**: Vercel (또는 Netlify) - **현재 사용중**
2. **백엔드**: Firebase Cloud Functions
3. **데이터베이스**: Firestore
4. **파일 저장소**: Firebase Storage
5. **호스팅**: Firebase Hosting (대안)

### 현재 배포 상태

- **Vercel 프로덕션 URL**: https://grok-project-57-lqa8nv0ah-dongyeol-jungs-projects.vercel.app
- **Firebase 프로젝트**: grok-project-57
- **마지막 배포**: 2025년 11월 30일
- **UI/UX 버전**: v1.1.0 (프리미엄 고도화 적용)

### CI/CD 파이프라인

```yaml
# GitHub Actions 예시
name: Deploy
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 사전 요구사항

### 시스템 요구사항

- Node.js 18.0 이상
- npm 8.0 이상
- Firebase CLI 설치
- Git

### 계정 준비

- [Firebase Console](https://console.firebase.google.com/) 계정
- [Vercel](https://vercel.com/) 계정 (권장)
- [GitHub](https://github.com/) 저장소

### 도메인 설정 (선택사항)

- 커스텀 도메인 (선택사항)
- SSL 인증서 (자동 발급)

## Firebase 설정

### 1. Firebase 프로젝트 생성

```bash
# Firebase CLI 설치 (아직 설치하지 않은 경우)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 새 프로젝트 생성
firebase projects:create your-project-name

# 프로젝트 선택
firebase use your-project-name
```

### 2. Firebase 서비스 활성화

Firebase Console에서 다음 서비스를 활성화하세요:

1. **Authentication**
   - Sign-in method: Email/Password 활성화
   - Authorized domains: 배포 도메인 추가

2. **Firestore Database**
   - 데이터베이스 생성 (테스트 모드 또는 프로덕션 모드)

3. **Storage**
   - 기본 버킷 생성

4. **Functions**
   - Node.js 18 런타임 선택

5. **Hosting**
   - 사이트 생성

### 3. 보안 규칙 설정

#### Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 데이터
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // 예약 데이터
    match /reservations/{reservationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null &&
        (request.resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }

    // 공간 데이터
    match /spaces/{spaceId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // 기타 컬렉션...
  }
}
```

#### Storage Security Rules (`storage.rules`)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.token.admin == true;
    }
  }
}
```

### 4. Firebase Functions 배포

```bash
# Functions 디렉토리로 이동
cd functions

# 의존성 설치
npm install

# 로컬 테스트 (선택사항)
npm run serve

# 프로덕션 배포
firebase deploy --only functions
```

### Vercel 배포 (현재 사용중)

#### 프로젝트 정보
- **프로젝트 ID**: grok-project-57
- **소유자**: dongyeol-jungs-projects
- **프로덕션 URL**: https://grok-project-57-lqa8nv0ah-dongyeol-jungs-projects.vercel.app
- **마지막 배포**: 2025년 11월 30일 (v1.1.0)

#### 배포 히스토리
- **v1.1.0** (2025-11-30): UI/UX 프리미엄 고도화, 다크 모드, 토스트 알림
- **v1.0.0** (2025-11-30): 초기 MVP 런칭

#### 자동 배포 설정
GitHub 저장소와 연동되어 `main` 브랜치 푸시 시 자동 배포됩니다.

### 2. 환경변수 설정

Vercel Dashboard에서 환경변수 설정:

```bash
# 필수 환경변수
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. 빌드 설정

`vercel.json` 파일 생성:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 4. 배포 실행

```bash
# 프로덕션 배포
vercel --prod

# 또는 GitHub 연동 시 자동 배포
```

## Firebase Hosting 배포

### 1. Firebase Hosting 설정

```bash
# Hosting 초기화
firebase init hosting

# 빌드 설정
echo '{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.css",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}' > firebase.json
```

### 2. 빌드 및 배포

```bash
# 빌드
npm run build

# Firebase Hosting 배포
firebase deploy --only hosting
```

## 수동 배포

### 1. 빌드 생성

```bash
# 프로덕션 빌드
npm run build

# 빌드 파일 확인
ls -la dist/
```

### 2. 웹 서버에 업로드

빌드된 `dist` 폴더의 파일들을 웹 서버에 업로드하세요.

**Apache 설정 예시** (`.htaccess`):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx 설정 예시**:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 환경별 설정

### 개발 환경

```bash
# .env.development
VITE_APP_ENV=development
VITE_FIREBASE_PROJECT_ID=your-dev-project
VITE_DEBUG=true
```

### 스테이징 환경

```bash
# .env.staging
VITE_APP_ENV=staging
VITE_FIREBASE_PROJECT_ID=your-staging-project
VITE_DEBUG=true
```

### 프로덕션 환경

```bash
# .env.production
VITE_APP_ENV=production
VITE_FIREBASE_PROJECT_ID=your-prod-project
VITE_DEBUG=false
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 모니터링 및 유지보수

### Firebase Console 모니터링

1. **Functions**: 실행 로그 및 성능 모니터링
2. **Firestore**: 데이터베이스 사용량 및 쿼리 성능
3. **Hosting**: 트래픽 및 오류 모니터링
4. **Crashlytics**: 앱 크래시 및 오류 보고

### 로그 확인

```bash
# Functions 로그
firebase functions:log

# Hosting 로그
firebase hosting:channel:deploy

# 전체 로그
firebase logs
```

### 성능 모니터링

```bash
# Functions 성능
firebase functions:list

# Firestore 인덱스 확인
firebase firestore:indexes

# 사용량 통계
firebase projects:list
```

### 백업 및 복원

```bash
# Firestore 데이터 내보내기
gcloud firestore export gs://your-backup-bucket --project=your-project

# Firestore 데이터 가져오기
gcloud firestore import gs://your-backup-bucket --project=your-project
```

## 문제 해결

### 일반적인 배포 문제

#### 빌드 실패

**증상**: `npm run build` 실패
**해결**:
```bash
# 캐시 클리어
npm run clean
rm -rf node_modules package-lock.json
npm install

# TypeScript 에러 확인
npx tsc --noEmit

# 다시 빌드
npm run build
```

#### Firebase Functions 배포 실패

**증상**: Functions 배포 오류
**해결**:
```bash
# Functions 디렉토리에서
cd functions

# 로그 확인
firebase functions:log --only your-function-name

# 재배포
firebase deploy --only functions:your-function-name
```

#### 환경변수 문제

**증상**: Firebase 설정 오류
**해결**:
```bash
# 환경변수 확인
firebase use

# 프로젝트 설정 확인
firebase projects:list

# 재인증
firebase logout
firebase login
```

#### CORS 오류

**증상**: API 호출 실패
**해결**:
Firebase Functions에서 CORS 설정:
```javascript
const cors = require('cors')({ origin: true });

// 또는 특정 도메인만 허용
const cors = require('cors')({
  origin: ['https://your-domain.com', 'http://localhost:3000']
});
```

### 성능 문제

#### 느린 로딩

**해결**:
- 코드 스플리팅 적용
- 이미지 최적화
- CDN 사용
- 캐싱 전략 개선

#### 높은 비용

**해결**:
- Functions 최적화
- 데이터베이스 쿼리 최적화
- 캐싱 레이어 추가
- 사용량 모니터링

### 보안 문제

#### 인증 문제

**해결**:
- Firebase Security Rules 검토
- 토큰 만료 확인
- CORS 정책 확인

#### 데이터 유출

**해결**:
- 환경변수 암호화
- 민감한 데이터 암호화
- 접근 로그 모니터링

## 롤백 전략

### 빠른 롤백

```bash
# 이전 버전으로 롤백 (Vercel)
vercel rollback

# Firebase Functions 롤백
firebase functions:rollback your-function-name

# Git을 이용한 롤백
git revert HEAD~1
git push origin main
```

### 백업 전략

- 정기적인 데이터 백업
- 코드 버전 관리
- 설정 파일 백업
- 재해 복구 계획 수립

## 지원 및 문의

배포 관련 문제 발생 시:

1. **공식 문서** 확인
2. **커뮤니티** 검색
3. **이슈 생성**: GitHub Issues
4. **지원팀 문의**: deploy-support@library-system.com

---

**배포 성공을 기원합니다!** 🚀

**최종 업데이트**: 2025년 11월 30일