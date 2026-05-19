import { api } from "./client";

export async function listAgents() {
  // Backend exposes admin-only GET /users/agents (filtered to role=agent).
  const { data } = await api.get("/users/agents");
  return data;
}

export async function listAllUsers() {
  const { data } = await api.get("/users/");
  return data;
}
