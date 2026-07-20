import { apiClient } from "./client";
import type { AuthResponse, UserResponse } from "../types";

export const authApi = {
  register: (email: string, password: string) =>
    apiClient.postJson<AuthResponse>("/auth/register", { email, password }),
  login: (email: string, password: string) =>
    apiClient.postJson<AuthResponse>("/auth/login", { email, password }),
  me: () => apiClient.get<UserResponse>("/auth/me"),
  updateEmail: (newEmail: string, currentPassword: string) =>
    apiClient.putJson<UserResponse>("/auth/email", { newEmail, currentPassword }),
  updatePassword: (currentPassword: string, newPassword: string) =>
    apiClient.putJson<void>("/auth/password", { currentPassword, newPassword }),
};
