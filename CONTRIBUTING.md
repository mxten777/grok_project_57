# 기여 가이드 (Contributing Guide)

도서관 예약 시스템 프로젝트에 기여하는 방법을 안내합니다.

## 목차

- [시작하기](#시작하기)
- [개발 환경 설정](#개발-환경-설정)
- [코드 기여](#코드-기여)
- [풀 리퀘스트](#풀-리퀘스트)
- [코딩 표준](#코딩-표준)
- [테스트](#테스트)
- [문서화](#문서화)
- [버그 리포트](#버그-리포트)
- [기능 요청](#기능-요청)

## 시작하기

### 사전 요구사항

프로젝트에 기여하기 전에 다음 요구사항을 충족하는지 확인하세요:

- **Git**: 버전 관리 시스템
- **Node.js**: 18.0 이상
- **npm**: 8.0 이상 또는 yarn
- **Firebase CLI**: `npm install -g firebase-tools`
- **코드 에디터**: VS Code 권장 (확장 프로그램 설치)

### 저장소 복제

```bash
# 저장소 복제
git clone https://github.com/your-username/library-reservation-system.git
cd library-reservation-system

# 의존성 설치
npm install

# Firebase Functions 의존성 설치
cd functions
npm install
cd ..
```

## 개발 환경 설정

### 1. Firebase 프로젝트 설정

```bash
# Firebase 로그인
firebase login

# 새 프로젝트 생성 또는 기존 프로젝트 선택
firebase use --add
# 프로젝트 ID 입력

# 환경변수 설정
cp .env.example .env
# .env 파일에 실제 Firebase 설정 입력
```

### 2. 로컬 개발 서버 실행

```bash
# 메인 앱 개발 서버
npm run dev

# Firebase 에뮬레이터 (새 터미널)
firebase emulators:start
```

### 3. VS Code 확장 프로그램 (권장)

- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅
- **TypeScript Importer**: 자동 import
- **Firebase**: Firebase 관련 기능
- **GitLens**: Git 히스토리 및 blame

## 코드 기여

### 브랜치 전략

```bash
# 메인 브랜치에서 새 브랜치 생성
git checkout -b feature/your-feature-name
# 또는
git checkout -b fix/bug-description
# 또는
git checkout -b docs/update-documentation
```

### 브랜치 네이밍 규칙

- **기능 추가**: `feature/feature-name`
- **버그 수정**: `fix/bug-description`
- **문서화**: `docs/document-name`
- **리팩토링**: `refactor/component-name`
- **스타일**: `style/component-update`

### 커밋 메시지 규칙

커밋 메시지는 다음 형식을 따르세요:

```
type(scope): description

[optional body]

[optional footer]
```

**타입 (type)**:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서화
- `style`: 스타일 변경 (코드 동작 영향 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 등 기타 변경

**예시**:
```
feat(auth): add Google OAuth login

- Add Google sign-in button
- Implement OAuth flow
- Update user profile with Google data

Closes #123
```

## 풀 리퀘스트

### PR 생성 전 체크리스트

- [ ] 코드가 정상적으로 빌드되는지 확인 (`npm run build`)
- [ ] 모든 테스트가 통과하는지 확인 (`npm test`)
- [ ] ESLint 오류가 없는지 확인 (`npm run lint`)
- [ ] TypeScript 타입 에러가 없는지 확인
- [ ] 관련 문서가 업데이트되었는지 확인
- [ ] 변경 사항이 CHANGELOG.md에 반영되었는지 확인

### PR 템플릿

풀 리퀘스트를 생성할 때 다음 정보를 포함하세요:

```markdown
## 변경 사항

### 변경 유형
- [ ] 버그 수정
- [ ] 새로운 기능
- [ ] 코드 리팩토링
- [ ] 문서화
- [ ] 스타일 변경
- [ ] 기타

### 설명
변경 사항에 대한 자세한 설명

### 관련 이슈
Closes #123

### 테스트
- [ ] 단위 테스트 추가/수정
- [ ] 통합 테스트 실행
- [ ] 수동 테스트 완료

### 스크린샷 (UI 변경 시)
UI 변경 사항이 있다면 스크린샷을 첨부하세요.
```

## 코딩 표준

### TypeScript 규칙

- **엄격 모드 사용**: `strict: true`
- **모든 변수 타입 명시**: 암시적 `any` 타입 금지
- **인터페이스 사용**: 객체 형태 데이터에 인터페이스 정의
- **유틸리티 타입 활용**: `Partial<T>`, `Pick<T>`, `Omit<T>` 등

### React 규칙

- **함수형 컴포넌트**: 클래스 컴포넌트 대신 함수형 컴포넌트 사용
- **Hooks**: 커스텀 훅을 활용한 로직 분리
- **컴포넌트 분리**: 200줄 이상의 컴포넌트는 분리 고려
- **Props 타입**: 모든 props에 타입 정의

### 파일 구조

```
src/
├── components/     # 재사용 가능한 컴포넌트
│   ├── ui/        # 기본 UI 컴포넌트
│   └── features/  # 기능별 컴포넌트
├── pages/         # 페이지 컴포넌트
├── hooks/         # 커스텀 훅
├── contexts/      # React Context
├── utils/         # 유틸리티 함수
├── types/         # TypeScript 타입 정의
└── constants/     # 상수 정의
```

### 네이밍 규칙

- **컴포넌트**: PascalCase (`UserProfile.tsx`)
- **함수/변수**: camelCase (`getUserData`)
- **파일**: kebab-case (`user-profile.tsx`)
- **폴더**: kebab-case (`user-management`)

## 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 특정 파일 테스트
npm test -- UserProfile.test.tsx

# 커버리지 리포트
npm run test:coverage

# watch 모드
npm run test:watch
```

### 테스트 작성 가이드

```typescript
// UserProfile.test.tsx
import { render, screen } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  it('renders user name correctly', () => {
    render(<UserProfile user={{ name: 'John Doe' }} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### 테스트 커버리지 목표

- **구문 커버리지**: 80% 이상
- **브랜치 커버리지**: 75% 이상
- **함수 커버리지**: 85% 이상
- **라인 커버리지**: 80% 이상

## 문서화

### 코드 문서화

- **함수/컴포넌트**: JSDoc 주석 사용
- **복잡한 로직**: 인라인 주석 추가
- **API 변경**: API 문서 업데이트

```typescript
/**
 * 사용자 프로필을 업데이트합니다.
 * @param userId - 사용자 ID
 * @param updates - 업데이트할 필드
 * @returns 업데이트된 사용자 데이터
 */
async function updateUserProfile(userId: string, updates: Partial<User>) {
  // 구현
}
```

### 문서 업데이트

코드를 변경할 때 다음 문서를 함께 업데이트하세요:

- `README.md`: 프로젝트 개요 및 설치 방법
- `API_DOCUMENTATION.md`: API 변경 사항
- `USER_MANUAL.md`: 사용자 영향 기능
- `CHANGELOG.md`: 버전별 변경 사항

## 버그 리포트

### 버그 리포트 템플릿

```markdown
## 버그 설명
버그에 대한 명확한 설명

## 재현 방법
1. '...' 페이지로 이동
2. '...' 버튼 클릭
3. '...' 입력
4. 오류 발생

## 예상 동작
예상했던 정상 동작 설명

## 스크린샷
가능하다면 스크린샷 첨부

## 환경 정보
- OS: [예: Windows 10]
- 브라우저: [예: Chrome 91.0]
- 버전: [예: v1.0.0]

## 추가 정보
기타 관련 정보
```

## 기능 요청

### 기능 요청 템플릿

```markdown
## 기능 요약
추가하고 싶은 기능에 대한 간단한 설명

## 상세 설명
기능에 대한 자세한 설명과 사용 사례

## 대안
현재 사용할 수 있는 대안이 있다면 설명

## 추가 정보
디자인, API, 구현 아이디어 등
```

## 행동 강령 (Code of Conduct)

### 우리의 약속

개방적이고 친근한 환경을 조성하기 위해, 우리는 기여자로서 다음을 약속합니다:

- **존중**: 모든 사람을 존중하고 차별하지 않음
- **협력**: 건설적인 피드백 제공
- **책임**: 자신의 행동에 대한 책임
- **포용**: 다양한 배경과 경험 환영

### 허용되지 않는 행동

- 차별적 언어 또는 행동
- 괴롭힘 또는 위협
- 부적절한 콘텐츠
- 다른 사람의 기여 무시

## 라이선스

이 프로젝트에 기여함으로써 귀하는 귀하의 기여가 MIT 라이선스 하에 제공된다는 데 동의합니다.

## 연락처

기여 관련 문의: contribute@library-system.com

---

**감사합니다!** 🎉 프로젝트에 관심 가져주셔서 감사합니다.