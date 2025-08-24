import { api } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { LoginInput, LoginResponse, OTPInput } from "./types";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginInput): Promise<LoginResponse> => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
  });
};

export const useSendOTP = () => {
  return useMutation({
    mutationFn: async (phone: OTPInput): Promise<void> => {
      await api.post("/auth/send_otp", { phone });
    },
  });
};
