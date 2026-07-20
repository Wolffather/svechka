import { apiClient } from "./client";
import type { PageResponse, WeeklyInsight } from "../types";

export const insightsApi = {
  list: (page = 0, size = 20) => apiClient.get<PageResponse<WeeklyInsight>>(`/insights?page=${page}&size=${size}`),
};
