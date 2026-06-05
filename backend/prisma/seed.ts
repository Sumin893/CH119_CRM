import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createPrismaAdapter } from "../src/config/database.js";
import { encryptText, hashPhone, normalizePhone } from "../src/utils/crypto.js";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient({
  adapter: createPrismaAdapter(),
});

const email = process.env.ADMIN_USERNAME ?? "admin";
const password = process.env.ADMIN_PASSWORD ?? "admin1234";

const samples = [
  {
    name: "김민수",
    phone: "010-1234-5678",
    address: "서울시 성북구 정릉동",
    productCategory: "에어컨",
    productType: "벽걸이",
    productBrand: "LG",
    productCount: 1,
    customerStatus: "예약 확정",
    paymentStatus: "결제전",
    paymentMethod: "계좌이체",
    estimatePrice: 80000,
    finalPrice: 80000,
    memo: "실외기 주변 확인 필요",
  },
  {
    name: "이지은",
    phone: "010-2222-3333",
    address: "서울시 종로구 혜화동",
    productCategory: "세탁기",
    productType: "드럼",
    productBrand: "삼성",
    productCount: 1,
    customerStatus: "작업 완료",
    paymentStatus: "결제완료",
    paymentMethod: "카드",
    estimatePrice: 120000,
    finalPrice: 120000,
    memo: "배수 필터 오염 심함",
  },
  {
    name: "박철호",
    phone: "010-4444-5555",
    address: "서울시 강북구 미아동",
    productCategory: "에어컨",
    productType: "천장형",
    productBrand: "캐리어",
    productCount: 2,
    customerStatus: "예약중",
    paymentStatus: "결제전",
    paymentMethod: "현금",
    estimatePrice: 220000,
    finalPrice: 220000,
    specialNote: "사무실 작업, 평일 오전 선호",
  },
];

async function main() {
  const passwordHash = await hashPassword(password);

  await prisma.admin.upsert({
    where: { email },
    update: { name: "관리자", passwordHash },
    create: { email, name: "관리자", passwordHash },
  });

  await prisma.customer.deleteMany();

  await prisma.customer.createMany({
    data: samples.map(({ phone, address, ...sample }) => {
      const normalizedPhone = normalizePhone(phone);

      return {
        ...sample,
        phoneEncrypted: encryptText(phone),
        phoneHash: hashPhone(normalizedPhone),
        addressEncrypted: encryptText(address),
      };
    }),
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
