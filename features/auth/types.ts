import { User } from "@/features/users/types";

export type OTPInput = {
  phone: string;
};
export type LoginInput = {
  phone: string;
  otp: string;
};

export type LoginResponse = {
  accessToken: string;
  user: User;
};
