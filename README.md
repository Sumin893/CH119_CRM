# CH119 CRM

에어컨, 세탁기, 건조기 분해세척 업체용 웹 기반 CRM입니다.

## 주요 기능

- 관리자 1인 로그인, 로그인 상태 확인, 로그아웃
- 관리자 페이지 공통 레이아웃과 왼쪽 사이드바
- 고객 관리 CRUD
- 고객 검색 및 필터
- 고객 전화번호, 작업주소 암호화 저장
- 관리자 비밀번호 bcrypt 해시 저장

## 기술 스택

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: SQLite
- ORM: Prisma
- Auth: Express Session

## 설치 방법

```bash
npm install
```

## 환경변수

`backend/.env.example`을 참고해 `backend/.env`를 생성합니다.

```txt
DATABASE_URL="file:./dev.db"
PORT=4000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin1234
SESSION_SECRET="change-this-session-secret"
ENCRYPTION_KEY=32-byte-or-longer-random-secret-key
FRONTEND_ORIGIN="http://localhost:5173"
```

실제 운영 전 `ADMIN_PASSWORD`, `SESSION_SECRET`, `ENCRYPTION_KEY`는 반드시 변경하세요.
`.env` 파일은 절대 GitHub에 올리면 안 됩니다.

## DB 초기화와 Seed

```bash
npm run db:reset
```

위 명령은 SQLite DB를 재생성하고 관리자 계정과 샘플 고객 데이터를 생성합니다.

```bash
npm run db:seed
```

seed만 다시 넣을 때 사용합니다.

```bash
npm run db:generate
```

Prisma Client를 재생성할 때 사용합니다.

`backend/prisma/migrations`에 Customer 추가 SQL을 포함했습니다. 현재 로컬 환경에서는 Prisma schema engine 이슈로 `prisma migrate deploy` 대신 `npm run db:reset`으로 DB를 재생성합니다.

## 실행 방법

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## 기본 관리자 계정

- 아이디: `admin`
- 비밀번호: `admin1234`

## 화면 경로

- 로그인: `/login`
- 대시보드: `/`
- 고객 목록: `/customers`
- 고객 추가: `/customers/new`
- 고객 상세: `/customers/:id`
- 고객 수정: `/customers/:id/edit`

## API

### 인증

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### 고객

- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id`

고객 API는 로그인된 관리자만 접근할 수 있습니다.

## 고객 검색과 필터

`GET /api/customers`는 다음 query를 지원합니다.

- `search`: 이름, 전체 전화번호, 주소 검색
- `productCategory`: 에어컨, 세탁기, 건조기, 기타
- `customerStatus`: 견적 문의, 예약 확정 등
- `paymentStatus`: 미결제, 결제 완료 등
- `workDateFrom`, `workDateTo`
- `revisitOnly=true`

주소는 암호화되어 DB 레벨 부분 검색이 어렵기 때문에 서버에서 복호화 후 메모리 필터링합니다. 데이터가 많아지면 성능 이슈가 생길 수 있습니다.

## 개인정보 보호 구조

- 고객 전화번호는 `phoneEncrypted`에 AES-256-GCM으로 암호화해 저장합니다.
- 고객 전화번호 검색용으로 숫자만 남긴 값을 HMAC-SHA256 처리해 `phoneHash`에 저장합니다.
- 고객 작업주소는 `addressEncrypted`에 AES-256-GCM으로 암호화해 저장합니다.
- API 응답에는 `phone`, `address`만 복호화해서 내려줍니다.
- API 응답에 `phoneEncrypted`, `phoneHash`, `addressEncrypted`는 노출하지 않습니다.
- 관리자 비밀번호는 bcrypt 해시로 저장합니다.

`ENCRYPTION_KEY`는 32바이트 이상이어야 합니다. 이 키를 잃어버리면 기존 고객 전화번호와 주소를 복호화할 수 없습니다.

## .gitignore 관리

다음 항목은 Git에 올리지 않습니다.

- `node_modules`
- `.env`, `.env.local`, `.env.*.local`
- `dist`, `build`, `.vite`, `coverage`
- 로그 파일
- Prisma Client 생성물
- 개발용 SQLite DB와 journal 파일

개발용 DB 파일은 커밋하지 않고 schema, migration SQL, seed로 재생성합니다.

## 에러가 날 때

- 로그인 실패: `backend/.env`의 `ADMIN_USERNAME`, `ADMIN_PASSWORD`를 확인하고 `npm run db:reset`을 실행하세요.
- 암호화 오류: `ENCRYPTION_KEY`가 없거나 32바이트보다 짧으면 서버가 명확한 에러를 출력합니다.
- Prisma Client 오류: `npx prisma generate -w backend`를 실행하세요.
- DB 오류: `npm run db:reset`으로 개발 DB를 재생성하세요.
- 포트 충돌: `backend/.env`의 `PORT` 또는 `frontend/vite.config.ts`의 포트를 변경하세요.
