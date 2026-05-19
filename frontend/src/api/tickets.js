import { api } from "./client";

export async function createTicket({ title, description }) {
  const { data } = await api.post("/tickets/", { title, description });
  return data; // { id }
}

export async function listTickets({ status, priority, tag, skip = 0, limit = 20 } = {}) {
  const params = {};
  if (status) params.status = status;
  if (priority) params.priority = priority;
  if (tag) params.tag = tag;
  params.skip = skip;
  params.limit = limit;
  const { data } = await api.get("/tickets/", { params });
  return data; // { total, skip, limit, items }
}

export async function getTicket(id) {
  const { data } = await api.get(`/tickets/${id}`);
  return data;
}

export async function updateTicket(id, patch) {
  const { data } = await api.put(`/tickets/${id}`, patch);
  return data;
}

export async function deleteTicket(id) {
  const { data } = await api.delete(`/tickets/${id}`);
  return data;
}

export async function reanalyzeTicket(id) {
  const { data } = await api.post(`/tickets/${id}/reanalyze`);
  return data; // { message, ai }
}

export async function assignTicket(id, agentId) {
  const { data } = await api.patch(`/tickets/${id}/assign`, { agent_id: agentId });
  return data;
}

export async function getStats() {
  const { data } = await api.get("/tickets/stats");
  return data;
}
