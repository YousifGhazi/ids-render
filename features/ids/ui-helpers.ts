import { PaymentStatus } from "./types";

export function PaymentStatusLabel(
  type: PaymentStatus,
  t: (key: string) => string
) {
  return t(`payments.paymentStatus.${type}`);
}
