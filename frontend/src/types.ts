export interface AuthResponse {
  token: string;
}

export interface UserResponse {
  id: string;
  email: string;
  createdAt: string;
}

export type EntryStatus = "AWAITING_FOLLOW_UP" | "COMPLETE" | "CRISIS_SUPPORT";

export interface EntryCreateResponse {
  entryId: string;
  followUpQuestion: string | null;
  summary: string | null;
  status: EntryStatus;
}

export interface FollowUpResponse {
  entryId: string;
  summary: string;
  status: EntryStatus;
}

export interface EntrySummary {
  id: string;
  date: string;
  status: EntryStatus;
  summary: string | null;
}

export interface EntryDetail {
  id: string;
  date: string;
  status: EntryStatus;
  rawTranscript: string;
  aiFollowUpQuestion: string | null;
  aiFollowUpAnswer: string | null;
  aiSummary: string | null;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface WeeklyInsight {
  id: string;
  weekStartDate: string;
  insightText: string;
  createdAt: string;
}
