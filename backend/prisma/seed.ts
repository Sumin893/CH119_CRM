import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createPrismaAdapter } from "../src/config/database.js";
import { revenueSourceTypes } from "../src/modules/finance/finance.constants.js";
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
  const now = new Date();
  const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 10);

  await prisma.admin.upsert({
    where: { email },
    update: { name: "관리자", passwordHash },
    create: { email, name: "관리자", passwordHash },
  });

  await prisma.revenue.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.customer.deleteMany();

  const createdCustomers = [];

  for (const { phone, address, ...sample } of samples) {
      const normalizedPhone = normalizePhone(phone);

    const customer = await prisma.customer.create({
      data: {
        ...sample,
        workDate: currentMonthDate,
        phoneEncrypted: encryptText(phone),
        phoneHash: hashPhone(normalizedPhone),
        addressEncrypted: encryptText(address),
      },
    });

    if (customer.paymentStatus === "결제완료") {
      await prisma.revenue.create({
        data: {
          date: customer.workDate ?? new Date(),
          customerId: customer.id,
          category: customer.productCategory === "세탁기" ? "세탁기 청소" : "기타 수입",
          amount: customer.finalPrice ?? customer.estimatePrice ?? 0,
          paymentMethod: customer.paymentMethod,
          memo: `${customer.name} 고객 결제 완료 자동 매출 등록`,
          sourceType: revenueSourceTypes.customerPayment,
          sourceCustomerId: customer.id,
        },
      });
    }
    createdCustomers.push(customer);
  }

  const [kim, lee] = createdCustomers;

  await prisma.revenue.createMany({
    data: [
      {
        date: currentMonthDate,
        customerId: kim.id,
        category: "에어컨 청소",
        amount: 80000,
        paymentMethod: "계좌이체",
        memo: "벽걸이 에어컨 청소",
        sourceType: revenueSourceTypes.manual,
      },
      {
        date: currentMonthDate,
        customerId: lee.id,
        category: "세탁기 청소",
        amount: 120000,
        paymentMethod: "카드",
        memo: "드럼세탁기 분해세척",
        sourceType: revenueSourceTypes.manual,
      },
      {
        date: currentMonthDate,
        category: "출장비",
        amount: 20000,
        paymentMethod: "현금",
        memo: "추가 출장비",
        sourceType: revenueSourceTypes.manual,
      },
    ],
  });

  await prisma.expense.createMany({
    data: [
      { date: currentMonthDate, category: "세제/소모품", amount: 30000, vendor: "청소용품몰", memo: "세척제 구매" },
      { date: currentMonthDate, category: "현수막 제작비", amount: 70000, vendor: "OO현수막", memo: "여름맞이 할인 이벤트 현수막 제작" },
      { date: currentMonthDate, category: "광고비", amount: 50000, vendor: "지역 광고", memo: "동네 홍보 광고비" },
      { date: currentMonthDate, category: "명함 제작비", amount: 25000, vendor: "인쇄소", memo: "업체 명함 제작" },
    ],
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
