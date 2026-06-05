import { api } from "../../api/http";
import { Schedule } from "./scheduleTypes";

export function fetchSchedules(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, String(value));
  });

  return api<{ schedules: Schedule[] }>(`/api/schedules${query.size ? `?${query}` : ""}`);
}

export function fetchUpcomingSchedules(days = 7) {
  return api<{ schedules: Schedule[] }>(`/api/schedules/upcoming?days=${days}`);
}
