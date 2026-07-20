import { apiClient } from "./client";
import type { EntryCreateResponse, EntryDetail, EntrySummary, FollowUpResponse, PageResponse } from "../types";

export const entriesApi = {
  create: (date: string, audio: Blob, filename: string) => {
    const form = new FormData();
    form.append("date", date);
    form.append("audio", audio, filename);
    return apiClient.postForm<EntryCreateResponse>("/entries", form);
  },

  submitFollowUp: (entryId: string, answerText?: string, audio?: Blob, filename?: string) => {
    const form = new FormData();
    if (answerText) {
      form.append("answerText", answerText);
    }
    if (audio) {
      form.append("audio", audio, filename ?? "answer.webm");
    }
    return apiClient.postForm<FollowUpResponse>(`/entries/${entryId}/follow-up`, form);
  },

  list: (page = 0, size = 20) => apiClient.get<PageResponse<EntrySummary>>(`/entries?page=${page}&size=${size}`),

  get: (id: string) => apiClient.get<EntryDetail>(`/entries/${id}`),
};
