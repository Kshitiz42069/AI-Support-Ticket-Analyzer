import { api } from "./client";

export async function login(email, password) {
  const { data } = await api.post("/users/login", { email, password });
  return data; // { access_token, token_type, user: {id, name, email, role} }
}

export async function register({ name, email, password, role }) {
  const { data } = await api.post("/users/register", {
    name,
    email,
    password,
    role,
  });
  return data;
}

export async function me() {
  const { data } = await api.get("/users/me");
  return data; // user
}
