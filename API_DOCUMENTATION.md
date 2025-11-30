# API 명세서 (API Documentation)

## 개요

도서관 예약 시스템의 API 엔드포인트 및 데이터 구조를 설명합니다.

## Firebase Cloud Functions API

### 1. sendNotification

사용자에게 푸시 알림을 전송합니다.

**트리거**: HTTP 요청 또는 내부 호출

**파라미터**:
```typescript
{
  userId: string,    // 필수: 사용자 ID
  title: string,     // 필수: 알림 제목
  body: string       // 필수: 알림 내용
}
```

**응답**:
```typescript
{
  success: boolean,
  message?: string
}
```

**예시**:
```javascript
// 클라이언트에서 호출
const result = await functions().httpsCallable('sendNotification')({
  userId: 'user123',
  title: '예약 승인',
  body: '예약이 승인되었습니다.'
});
```

### 2. promoteWaitlist

예약 취소 시 자동으로 대기자를 승급시키고 알림을 전송합니다.

**트리거**: Firestore `reservations/{reservationId}` 문서 업데이트

**동작**:
1. 예약 상태가 'approved'로 변경되면 대기열 확인
2. 다음 대기자를 찾아 새 예약 생성
3. 승급된 사용자에게 알림 전송
4. 대기열에서 제거

**자동 생성되는 데이터**:
```typescript
// 새로운 예약
{
  spaceId: string,
  userId: string,  // 승급된 사용자
  startTime: string,
  endTime: string,
  status: 'approved',
  createdAt: string
}
```

### 3. processNoShows

승인된 예약 중 체크인하지 않은 경우를 자동으로 노쇼 처리합니다.

**트리거**: Cloud Scheduler (매 10분)

**동작**:
1. 현재 시간 기준 10분 전까지 승인된 예약 조회
2. 체크인되지 않은 예약을 'no_show'로 변경

**조건**:
- `status === 'approved'`
- `startTime <= 현재시간 - 10분`
- `status !== 'checked_in'`

### 4. updateStats

예약 상태 변경 시 통계를 자동으로 업데이트합니다.

**트리거**: Firestore `reservations/{reservationId}` 문서 생성/업데이트

**업데이트되는 통계**:
- 일별 예약 수
- 체크인 수
- 노쇼 수
- 평균 평점

### 5. submitFeedback

사용자의 만족도 조사를 제출합니다.

**트리거**: HTTP 요청 (클라이언트 호출)

**파라미터**:
```typescript
{
  programId: string,  // 필수: 프로그램/공간 ID
  rating: number,     // 필수: 평점 (1-5)
  comment: string     // 선택: 코멘트
}
```

**유효성 검사**:
- 사용자 인증 필요
- 동일 프로그램에 대한 중복 피드백 방지
- 평점 범위: 1-5

**응답**:
```typescript
{
  success: boolean,
  message?: string
}
```

## Firestore 데이터베이스 구조

### Collections

#### users
사용자 정보 컬렉션

**문서 구조**:
```typescript
interface User {
  uid: string;           // Firebase Auth UID
  email: string;         // 이메일 주소
  displayName: string;   // 표시 이름
  isAdmin: boolean;      // 관리자 권한
  fcmToken?: string;     // 푸시 알림 토큰
  createdAt: string;     // 가입 일시 (ISO 8601)
  lastLoginAt?: string;  // 마지막 로그인 일시
}
```

**인덱스**:
- `email` (단일 필드)

#### spaces
예약 가능한 공간 정보

**문서 구조**:
```typescript
interface Space {
  id: string;           // 문서 ID
  name: string;         // 공간 이름
  type: 'program' | 'room' | 'studyroom';  // 공간 유형
  capacity: number;     // 최대 정원
  description: string;  // 상세 설명
  location: string;     // 위치 정보
  imageUrl: string;     // 이미지 URL
  isActive: boolean;    // 활성화 상태 (기본값: true)
  createdAt: string;    // 생성 일시
  updatedAt?: string;   // 수정 일시
}
```

**인덱스**:
- `type` (단일 필드)
- `isActive` (단일 필드)
- 복합 인덱스: `type + isActive`

#### reservations
예약 정보

**문서 구조**:
```typescript
interface Reservation {
  id: string;           // 문서 ID
  spaceId: string;      // 공간 ID
  userId: string;       // 사용자 ID
  startTime: string;    // 시작 시간 (ISO 8601)
  endTime: string;      // 종료 시간 (ISO 8601)
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'checked_in' | 'no_show';
  qrCode?: string;      // QR 코드 데이터
  createdAt: string;    // 생성 일시
  updatedAt?: string;   // 수정 일시
  approvedAt?: string;  // 승인 일시
  checkedInAt?: string; // 체크인 일시
}
```

**인덱스**:
- `userId` (단일 필드)
- `spaceId` (단일 필드)
- `status` (단일 필드)
- `startTime` (단일 필드)
- 복합 인덱스: `spaceId + startTime`
- 복합 인덱스: `userId + status`

#### waitlists
대기열 정보

**문서 구조**:
```typescript
interface Waitlist {
  id: string;           // 문서 ID
  spaceId: string;      // 공간 ID
  userId: string;       // 사용자 ID
  createdAt: string;    // 등록 일시
  position: number;     // 대기 순번
}
```

**인덱스**:
- `spaceId` (단일 필드)
- `userId` (단일 필드)
- 복합 인덱스: `spaceId + createdAt`

#### feedback
사용자 피드백

**문서 구조**:
```typescript
interface Feedback {
  id: string;           // 문서 ID
  programId: string;    // 프로그램/공간 ID
  userId: string;       // 사용자 ID
  rating: number;       // 평점 (1-5)
  comment?: string;     // 코멘트
  createdAt: string;    // 제출 일시
}
```

**인덱스**:
- `programId` (단일 필드)
- `userId` (단일 필드)
- 복합 인덱스: `programId + userId` (중복 방지용)

#### stats
일별 통계 데이터

**문서 구조** (문서 ID: YYYY-MM-DD 형식):
```typescript
interface DailyStats {
  date: string;         // 날짜 (YYYY-MM-DD)
  totalReservations: number;     // 총 예약 수
  approvedReservations: number;  // 승인된 예약
  checkedInCount: number;        // 체크인 수
  noShowCount: number;          // 노쇼 수
  cancelledCount: number;       // 취소 수
  averageRating?: number;       // 평균 평점
  spaceStats: {                 // 공간별 통계
    [spaceId: string]: {
      reservations: number;
      checkIns: number;
      noShows: number;
    }
  };
  createdAt: string;    // 생성 일시
  updatedAt: string;    // 수정 일시
}
```

## 클라이언트 API 사용 예시

### React 컴포넌트에서 Firebase Functions 호출

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

// Functions 인스턴스
const functions = getFunctions();

// 알림 전송
const sendNotification = httpsCallable(functions, 'sendNotification');
const result = await sendNotification({
  userId: 'user123',
  title: '예약 알림',
  body: '예약이 승인되었습니다.'
});

// 피드백 제출
const submitFeedback = httpsCallable(functions, 'submitFeedback');
const feedbackResult = await submitFeedback({
  programId: 'space123',
  rating: 5,
  comment: '매우 만족했습니다!'
});
```

### Firestore 데이터 조회

```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';

// 사용자의 예약 조회
const userReservationsQuery = query(
  collection(db, 'reservations'),
  where('userId', '==', currentUser.uid)
);
const reservationsSnapshot = await getDocs(userReservationsQuery);

// 공간별 예약 조회
const spaceReservationsQuery = query(
  collection(db, 'reservations'),
  where('spaceId', '==', 'space123'),
  where('status', '==', 'approved')
);
const spaceReservations = await getDocs(spaceReservationsQuery);
```

## 에러 처리

### Firebase Functions 에러 코드

- `unauthenticated`: 사용자 인증 필요
- `permission-denied`: 권한 없음
- `not-found`: 리소스를 찾을 수 없음
- `already-exists`: 중복 데이터
- `failed-precondition`: 전제 조건 불충족

### 클라이언트 에러 처리 예시

```typescript
try {
  const result = await submitFeedback(feedbackData);
  console.log('피드백 제출 성공:', result.data);
} catch (error) {
  console.error('피드백 제출 실패:', error);

  if (error.code === 'functions/already-exists') {
    alert('이미 이 프로그램에 대한 피드백을 제출하셨습니다.');
  } else if (error.code === 'functions/unauthenticated') {
    alert('로그인이 필요합니다.');
  } else {
    alert('오류가 발생했습니다. 다시 시도해주세요.');
  }
}
```

## 보안 규칙 (Firestore Security Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 자신의 데이터만 접근 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 관리자는 모든 사용자 데이터 읽기 가능
    match /users/{userId} {
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // 예약 규칙
    match /reservations/{reservationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null &&
        (request.resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }

    // 공간 정보는 모두 읽기 가능
    match /spaces/{spaceId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // 피드백은 본인만 작성, 모두 읽기 가능
    match /feedback/{feedbackId} {
      allow read: if true;
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## 성능 고려사항

### 쿼리 최적화
- 복합 인덱스 활용
- 필요한 필드만 조회
- 페이지네이션 구현

### 캐싱 전략
- 자주 조회되는 데이터 캐싱
- 실시간 리스너 적절한 사용

### 제한 및 할당량
- Firebase Functions 호출 제한
- Firestore 읽기/쓰기 제한
- 실시간 모니터링 필요