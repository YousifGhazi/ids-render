import { api } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { LoginInput, LoginResponse } from "./types";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginInput): Promise<LoginResponse> => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
  });
};
