import api from "../services/api";

export async function getNotifications() {
  const res = await api.get("/api/notifications");
  return res.data;
}

export async function markNotificationsRead() {
  const res = await api.patch("/api/notifications/read");
  return res.data;
}