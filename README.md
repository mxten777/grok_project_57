# 도서관 예약 시스템 (Library Reservation System)

공공 도서관을 위한 종합 예약 시스템으로, 프로그램, 강의실, 스터디룸 예약을 지원합니다. QR 코드 체크인, 대기열 관리, 관리자 대시보드 등의 기능을 제공합니다.

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [배포](#배포)
- [사용 방법](#사용-방법)
- [API 문서](#api-문서)
- [개발 가이드](#개발-가이드)
- [라이선스](#라이선스)

## ✨ 주요 기능

### 사용자 기능
- **공간 검색 및 예약**: 실시간 검색과 필터링으로 원하는 공간을 쉽게 찾기
- **QR 코드 체크인**: 모바일에서 QR 코드를 스캔하여 빠른 체크인
- **내 예약 관리**: 예약 조회, 수정, 취소 기능
- **캘린더 뷰**: 날짜별 예약 현황 시각화
- **푸시 알림**: 예약 승인, 취소, 체크인 리마인더 알림

### 관리자 기능
- **예약 승인/반려**: 실시간 예약 관리
- **공간 관리**: 공간 추가, 수정, 삭제
- **통계 대시보드**: 상세한 사용 통계 및 차트
- **자동화 기능**: 노쇼 자동 처리, 대기자 승급

### 시스템 기능
- **대기열 관리**: 예약이 꽉 찼을 때 자동 대기열 등록
- **만족도 조사**: 체크인 후 별점과 코멘트 수집
- **PWA 지원**: 오프라인 사용 및 앱 설치 가능
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원

## 🛠 기술 스택

### 프론트엔드
- **React 18** - 사용자 인터페이스 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빠른 개발 서버와 빌드 도구
- **TailwindCSS** - 유틸리티 기반 CSS 프레임워크
- **Framer Motion** - 애니메이션 라이브러리
- **React Router** - 클라이언트 사이드 라우팅

### 백엔드 및 데이터베이스
- **Firebase Authentication** - 사용자 인증
- **Firestore** - NoSQL 데이터베이스
- **Firebase Cloud Functions** - 서버리스 백엔드 로직
- **Firebase Cloud Messaging** - 푸시 알림
- **Firebase Hosting** - 정적 파일 호스팅

### 추가 라이브러리
- **Recharts** - 데이터 시각화 차트
- **React Calendar** - 캘린더 컴포넌트
- **QRCode.js** - QR 코드 생성
- **Html5-QRCode** - QR 코드 스캔
- **Lucide React** - 아이콘 라이브러리

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Feedback.tsx     # 만족도 조사 컴포넌트
│   └── LoadingSpinner.tsx # 로딩 스피너
├── contexts/            # React Context
│   └── AuthContext.tsx  # 인증 컨텍스트
├── pages/               # 페이지 컴포넌트
│   ├── Home.tsx         # 메인 페이지 (공간 목록)
│   ├── Reservation.tsx  # 예약 생성 페이지
│   ├── CheckIn.tsx      # QR 체크인 페이지
│   ├── AdminDashboard.tsx # 관리자 대시보드
│   ├── Calendar.tsx     # 캘린더 뷰
│   ├── MyReservations.tsx # 내 예약 페이지
│   └── Login.tsx        # 로그인 페이지
├── firebase.ts          # Firebase 설정
├── App.tsx              # 메인 앱 컴포넌트
└── main.tsx             # 앱 진입점

functions/               # Firebase Cloud Functions
├── src/
│   └── index.ts         # 서버리스 함수들
└── package.json

public/                  # 정적 파일
├── manifest.json        # PWA 매니페스트
├── sw.js               # 서비스 워커
└── icons/              # 앱 아이콘들
```

## 🚀 설치 및 실행

### 사전 요구사항
- Node.js 18 이상
- npm 또는 yarn
- Firebase CLI (`npm install -g firebase-tools`)

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd library-reservation-system
```

### 2. 의존성 설치
```bash
# 메인 프로젝트
npm install

# Firebase Functions
cd functions
npm install
cd ..
```

### 3. Firebase 설정
1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication, Firestore, Functions, Hosting 활성화
3. `src/firebase.ts` 파일에 Firebase 설정 복사:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. 로컬 개발 서버 실행
```bash
# 메인 앱
npm run dev

# Firebase 에뮬레이터 (별도 터미널)
firebase emulators:start
```

### 5. Firebase Functions 배포 (선택사항)
```bash
firebase deploy --only functions
```

## 🌐 배포

### Vercel 배포 (권장)
1. [Vercel](https://vercel.com) 계정 생성
2. 프로젝트 연결 및 환경변수 설정
3. 자동 배포 실행

### Firebase Hosting 배포
```bash
# 빌드
npm run build

# Firebase Hosting 배포
firebase deploy --only hosting
```

### Firebase Functions 배포
```bash
cd functions
firebase deploy --only functions
```

## 📖 사용 방법

### 일반 사용자
1. **회원가입/로그인**: Firebase Authentication 사용
2. **공간 검색**: 이름, 설명, 위치로 검색 가능
3. **필터링**: 유형(프로그램/강의실/스터디룸), 정원으로 필터링
4. **예약하기**: 원하는 시간대 선택 후 예약
5. **QR 체크인**: 예약 당일 QR 코드 스캔
6. **내 예약 관리**: 예약 조회, 수정, 취소

### 관리자
1. **관리자 로그인**: 관리자 권한 필요
2. **예약 관리**: 대기중인 예약 승인/반려
3. **공간 관리**: 새 공간 추가 및 설정
4. **통계 확인**: 다양한 차트로 사용 통계 분석

## 🔌 API 문서

### Firebase Cloud Functions

#### `sendNotification`
사용자에게 푸시 알림 전송
```typescript
// 파라미터
{
  userId: string,    // 사용자 ID
  title: string,     // 알림 제목
  body: string       // 알림 내용
}
```

#### `promoteWaitlist`
예약 취소 시 대기자 자동 승급
- 트리거: reservations 문서 업데이트
- 자동으로 다음 대기자를 승급시키고 알림 전송

#### `processNoShows`
노쇼 자동 처리 (10분마다 실행)
- 승인된 예약 중 시작 시간 10분 경과 시 노쇼 처리

#### `updateStats`
통계 자동 업데이트
- 예약 상태 변경 시 통계 데이터 갱신

#### `submitFeedback`
사용자 피드백 제출
```typescript
// 파라미터
{
  programId: string,  // 프로그램 ID
  rating: number,     // 별점 (1-5)
  comment: string     // 코멘트
}
```

### Firestore 컬렉션 구조

#### `users`
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  isAdmin: boolean,
  fcmToken?: string,  // 푸시 알림 토큰
  createdAt: string
}
```

#### `spaces`
```typescript
{
  id: string,
  name: string,
  type: 'program' | 'room' | 'studyroom',
  capacity: number,
  description: string,
  location: string,
  imageUrl: string
}
```

#### `reservations`
```typescript
{
  id: string,
  spaceId: string,
  userId: string,
  startTime: string,
  endTime: string,
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'checked_in' | 'no_show',
  createdAt: string,
  qrCode?: string
}
```

#### `waitlists`
```typescript
{
  id: string,
  spaceId: string,
  userId: string,
  createdAt: string
}
```

#### `feedback`
```typescript
{
  id: string,
  programId: string,
  userId: string,
  rating: number,
  comment: string,
  createdAt: string
}
```

## 🛠 개발 가이드

### 코드 스타일
- **TypeScript**: 엄격한 타입 체크 사용
- **ESLint**: 코드 품질 유지
- **Prettier**: 일관된 코드 포맷팅

### 환경변수
```bash
# .env 파일
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### 테스트
```bash
# 단위 테스트 (준비중)
npm run test

# E2E 테스트 (준비중)
npm run test:e2e
```

### 빌드 최적화
- **코드 스플리팅**: 라우트별 청크 분리
- **트리 쉐이킹**: 사용하지 않는 코드 제거
- **압축**: Gzip/Brotli 압축

## 📊 성능 및 보안

### 성능 최적화
- **지연 로딩**: 컴포넌트 및 라우트 지연 로딩
- **이미지 최적화**: WebP 포맷 및 lazy loading
- **캐싱**: Firebase 캐싱 및 서비스 워커

### 보안
- **Firebase Security Rules**: 데이터베이스 접근 제어
- **인증**: Firebase Authentication 사용
- **HTTPS**: 강제 HTTPS 연결
- **CSP**: Content Security Policy 적용

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 기여 가이드라인
- 새로운 기능 추가 시 테스트 코드 작성
- 코드 리뷰 필수
- 커밋 메시지 규칙 준수
- 문서 업데이트

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙋‍♂️ 지원 및 문의

- **이슈**: [GitHub Issues](https://github.com/your-repo/issues)
- **토론**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **이메일**: your-email@example.com

## 🔄 버전 히스토리

### v1.0.0 (2025-11-30)
- ✅ MVP 완성
- ✅ 기본 예약 기능
- ✅ QR 체크인
- ✅ 관리자 대시보드
- ✅ 푸시 알림
- ✅ 통계 대시보드

### 예정 기능
- [ ] 모바일 앱 (React Native)
- [ ] 다국어 지원 (i18n)
- [ ] 고급 필터링 및 정렬
- [ ] 예약 템플릿
- [ ] 통합 캘린더 (Google Calendar 등)

---

**개발자**: GitHub Copilot & Claude  
**마지막 업데이트**: 2025년 11월 30일