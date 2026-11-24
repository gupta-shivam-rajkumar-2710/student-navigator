import { cookies } from "next/headers";

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase is not configured. Set SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  return { url: url.replace(/\/$/, ""), anonKey };
}

export async function adminSession() {
  let config;
  try { config = getSupabaseConfig(); }
  catch (error) { return { error: error.message, status: 503 }; }
  const { url, anonKey } = config;
  const token = (await cookies()).get("sn_admin_access_token")?.value;
  if (!token) return { error: "Sign in with an authorized admin account.", status: 401 };
  const userResponse = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anonKey, authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!userResponse.ok) return { error: "Your admin session expired. Sign in again.", status: 401 };
  const user = await userResponse.json();
  const roleResponse = await fetch(`${url}/rest/v1/admin_roles?user_id=eq.${encodeURIComponent(user.id)}&select=role`, { headers: { apikey: anonKey, authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!roleResponse.ok) return { error: "Could not validate the admin role.", status: 403 };
  const roles = await roleResponse.json();
  if (!roles.some(row => row.role === "owner" || row.role === "admin")) return { error: "This account does not have an admin role.", status: 403 };
  return { url, anonKey, token, user };
}

export async function supabaseAdminRequest(path, { method = "GET", body, prefer } = {}) {
  const session = await adminSession();
  if (session.error) return { error: session.error, status: session.status };
  const headers = { apikey: session.anonKey, authorization: `Bearer ${session.token}`, accept: "application/json" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (prefer) headers.prefer = prefer;
  const response = await fetch(`${session.url}/rest/v1/${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }
  if (!response.ok) return { error: data?.message || `Supabase request failed (${response.status}).`, status: response.status, details: data };
  return { data, status: response.status };
}
