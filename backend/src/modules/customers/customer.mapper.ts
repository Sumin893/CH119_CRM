import type { Customer } from "@prisma/client";
import { decryptText } from "../../utils/crypto.js";

export function toCustomerResponse(customer: Customer) {
  const { phoneEncrypted, phoneHash, addressEncrypted, ...safeCustomer } = customer;

  return {
    ...safeCustomer,
    phone: decryptText(phoneEncrypted),
    address: decryptText(addressEncrypted),
  };
}
