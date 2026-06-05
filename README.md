# CH119 CRM

에어컨, 세탁기, 건조기 분해세척 업체용 웹 기반 CRM 1차 기본 구조입니다.

## 기술 스택

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: SQLite
- ORM: Prisma
- Auth: 관리자 1인 로그인 세션 방식

## 폴더 구조

```txt
backend/
  prisma/
  src/config/
  src/middleware/
  src/modules/auth/
  src/utils/
frontend/
  src/api/
  src/components/
  src/features/auth/
  src/pages/
  src/routes/
  src/styles/
```

## 설치 방법

```bash
npm install
```

## DB 초기화 방법

```bash
npm run db:reset
```

위 명령은 SQLite DB를 새로 만들고 기본 관리자 계정을 생성합니다.

## 실행 방법

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## 기본 관리자 계정

- 이메일: `admin@homeclean119.kr`
- 비밀번호: `HomeClean119!`

## API

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## 에러가 날 때

- `DATABASE_URL` 오류: `backend/.env` 파일에 `DATABASE_URL="file:./dev.db"`가 있는지 확인하세요.
- Prisma Client 오류: `npm run db:push` 후 다시 실행하세요.
- 로그인 실패: 기본 계정 정보가 맞는지 확인하고 `npm run db:seed`를 실행하세요.
- 포트 충돌: `backend/.env`의 `PORT` 또는 `frontend/vite.config.ts`의 포트를 변경하세요.
