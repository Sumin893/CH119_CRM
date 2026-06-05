# CH119 CRM

에어컨, 세탁기, 건조기 분해세척 업체용 웹 기반 CRM입니다.

## 주요 기능

- 관리자 1인 로그인, 로그인 상태 확인, 로그아웃
- 관리자 페이지 공통 레이아웃과 왼쪽 사이드바
- 고객 관리 CRUD
- 고객 검색 및 필터
- 일정 달력
- 대시보드 작업 일정 카드
- 고객 전화번호, 작업주소 암호화 저장
- 관리자 비밀번호 bcrypt 해시 저장

## 기술 스택

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: MySQL
- ORM: Prisma
- Auth: Express Session

## MySQL 준비

MySQL Workbench 또는 MySQL CLI에서 프로젝트 전용 DB와 계정을 준비합니다.

```sql
CREATE DATABASE crm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'crm_password';

GRANT ALL PRIVILEGES ON crm_db.* TO 'crm_user'@'localhost';

FLUSH PRIVILEGES;
```

기본 권장 방식은 `crm_user` 같은 프로젝트 전용 계정을 사용하는 것입니다. 운영 환경에서 root 계정 사용은 권장하지 않습니다.

로컬 MySQL 접속 정보:

- host: `localhost`
- port: `3306`
- database: `crm_db`
- user: `crm_user`
- password: `crm_password`

## 설치 방법

```bash
npm install
```

## 환경변수

`backend/.env.example`을 참고해 `backend/.env`를 생성합니다.

```txt
DATABASE_URL="mysql://crm_user:crm_password@localhost:3306/crm_db"
# Optional: SHADOW_DATABASE_URL="mysql://crm_user:crm_password@localhost:3306/crm_shadow_db"
PORT=4000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin1234
SESSION_SECRET="change-this-session-secret"
ENCRYPTION_KEY=32-byte-or-longer-random-secret-key
FRONTEND_ORIGIN="http://localhost:5173"
```

`.env` 파일은 절대 GitHub에 올리면 안 됩니다. 실제 운영 전 `ADMIN_PASSWORD`, `SESSION_SECRET`, `ENCRYPTION_KEY`는 반드시 변경하세요.

## Prisma와 DB

Prisma Client 생성:

```bash
npm run db:generate
```

개발 migration:

```bash
npx prisma migrate dev --name init_mysql
```

현재 `crm_user`에 `crm_db.*` 권한만 있으면 `migrate dev`가 shadow database 생성 권한 부족으로 실패할 수 있습니다. 이 경우 root 또는 관리자 계정으로 shadow DB를 준비한 뒤 권한을 부여하세요.

```sql
CREATE DATABASE crm_shadow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON crm_shadow_db.* TO 'crm_user'@'localhost';

FLUSH PRIVILEGES;
```

그 다음 `backend/.env`에 아래 값을 추가하면 됩니다.

```txt
SHADOW_DATABASE_URL="mysql://crm_user:crm_password@localhost:3306/crm_shadow_db"
```

이미 생성된 migration을 적용할 때:

```bash
npm run db:deploy
```

Seed 데이터 생성:

```bash
npm run db:seed
```

Prisma Studio:

```bash
npm run db:studio
```

`npm run db:reset`은 MySQL 데이터 삭제 위험 때문에 비활성화되어 있습니다.

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
- 일정 달력: `/calendar`

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

### 일정

- `GET /api/schedules`
- `GET /api/schedules?month=YYYY-MM`
- `GET /api/schedules?date=YYYY-MM-DD`
- `GET /api/schedules/upcoming?days=7`

일정 API는 로그인된 관리자만 접근할 수 있습니다.

## 고객 검색과 필터

`GET /api/customers`는 다음 query를 지원합니다.

- `search`: 이름, 전체 전화번호, 주소 검색
- `productCategory`: 에어컨, 세탁기, 건조기, 기타
- `customerStatus`: 예약중, 예약 확정, 작업 완료, 재방문 예정, 취소
- `paymentStatus`: 결제전, 예약금결제, 결제완료, 환불
- `workDateFrom`, `workDateTo`
- `revisitOnly=true`

주소는 암호화되어 DB 레벨 부분 검색이 어렵기 때문에 서버에서 복호화 후 메모리 필터링합니다. 데이터가 많아지면 성능 이슈가 생길 수 있습니다.

## 일정 달력 구조

별도 `Schedule` 테이블은 만들지 않았습니다. 현재 일정은 `Customer` 테이블의 `workDate`, `workStartTime`, `workEndTime` 값을 기준으로 표시합니다.

- 고객 추가 시 작업 날짜와 시간이 있으면 달력에 자동 표시됩니다.
- 고객 수정에서 작업 날짜를 바꾸면 달력 위치도 바뀝니다.
- 고객 삭제 시 달력에서도 사라집니다.
- 고객 상태가 `취소`인 고객은 기본 일정 조회에서 제외됩니다.
- 달력 일정 클릭 시 `/customers/:id` 고객 상세 페이지로 이동합니다.

월간 달력은 `/calendar`에서 확인합니다. 날짜 클릭 시 해당 날짜의 작업 목록을 보여주며, 전화번호는 마스킹된 값으로 표시하고 주소는 요약 형태로 표시합니다.

## 대시보드 일정 연동

대시보드는 일정 API를 사용해 다음 값을 표시합니다.

- 오늘 작업 일정 수
- 이번 주 작업 일정 수
- 다가오는 작업 일정 5개

매출/비용/통계 값은 다음 단계에서 별도 기능으로 연결합니다.

## 개인정보 보호 구조

- 고객 전화번호는 `phoneEncrypted`에 AES-256-GCM으로 암호화해 저장합니다.
- 고객 전화번호 검색용으로 숫자만 남긴 값을 HMAC-SHA256 처리해 `phoneHash`에 저장합니다.
- 고객 작업주소는 `addressEncrypted`에 AES-256-GCM으로 암호화해 저장합니다.
- API 응답에는 `phone`, `address`만 복호화해서 내려줍니다.
- API 응답에 `phoneEncrypted`, `phoneHash`, `addressEncrypted`는 노출하지 않습니다.
- 일정 API 응답에도 `phoneEncrypted`, `phoneHash`, `addressEncrypted`는 노출하지 않습니다.
- 일정 API는 `phoneMasked`, `addressSummary`만 제공합니다.
- 관리자 비밀번호는 bcrypt 해시로 저장합니다.

`ENCRYPTION_KEY`는 32바이트 이상이어야 합니다. 이 키를 잃어버리면 기존 고객 전화번호와 주소를 복호화할 수 없습니다.

## SQLite에서 MySQL 전환

현재 datasource provider는 `mysql`입니다. 기존 SQLite migration은 삭제하지 않고 `backend/prisma/migrations_sqlite_backup`에 보존했습니다.

기존 SQLite DB 파일의 데이터는 MySQL로 자동 이전되지 않습니다. 데이터 이전이 필요하면 별도 마이그레이션 스크립트 작업으로 진행해야 합니다.

## 날짜 처리

`workDate`는 날짜 기준 필드로 사용하고, `workStartTime`, `workEndTime`은 `HH:mm` 문자열로 관리합니다. 달력과 일정 API는 `YYYY-MM-DD` 문자열을 기준으로 표시해 MySQL DateTime과 JavaScript Date 변환 과정에서 하루 밀림을 줄입니다.

## 테스트 체크리스트

- 로그인 가능 여부
- 고객 목록 조회
- 고객 추가
- 고객 상세 조회
- 고객 수정
- 고객 삭제
- 일정 달력에서 작업 일정 표시
- 날짜 클릭 시 작업 목록 표시
- 일정 클릭 시 고객 상세 이동
- 취소 상태 고객이 일정 조회에서 제외되는지 확인
- 대시보드 오늘/이번 주 작업 일정 수 확인
- 서버 재시작 후 MySQL 데이터 유지 확인
- 다른 브라우저 또는 다른 기기에서 같은 서버 접속 시 데이터 확인 가능 여부
- MySQL Workbench 또는 Prisma Studio에서 테이블과 데이터 확인

## .gitignore 관리

다음 항목은 Git에 올리지 않습니다.

- `node_modules`
- `.env`, `.env.local`, `.env.*.local`
- `dist`, `build`, `.vite`, `coverage`
- 로그 파일
- Prisma Client 생성물
- 개발용 SQLite DB와 journal 파일

## 에러가 날 때

- `DATABASE_URL`이 `file:./dev.db`로 남아 있으면 MySQL이 아니라 SQLite를 바라봅니다.
- `migrate dev`에서 P3014가 나면 shadow DB 권한을 준비하세요.
- MySQL 접속 실패 시 `crm_db`, `crm_user`, 비밀번호, 3306 포트를 확인하세요.
- 로그인 실패 시 `backend/.env`의 `ADMIN_USERNAME`, `ADMIN_PASSWORD`를 확인하고 `npm run db:seed`를 실행하세요.
- 암호화 오류는 `ENCRYPTION_KEY`가 없거나 32바이트보다 짧을 때 발생합니다.
- Prisma Client 오류는 `npm run db:generate`를 실행하세요.
- 포트 충돌 시 `backend/.env`의 `PORT` 또는 `frontend/vite.config.ts`의 포트를 변경하세요.
