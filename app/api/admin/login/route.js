import { NextResponse } from "next/server";
import { getSupabaseConfig } from "../../../lib/supabase-admin";

export async function POST(request) {
  try {
    const { url, anonKey } = getSupabaseConfig();
    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) return NextResponse.json({ error: "Enter your admin email and password." }, { status: 400 });
    const authResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: { apikey: anonKey, "content-type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }), cache: "no-store",
    });
    const auth = await authResponse.json();
    if (!authResponse.ok || !auth.access_token || !auth.user?.id) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    const roleResponse = await fetch(`${url}/rest/v1/admin_roles?user_id=eq.${encodeURIComponent(auth.user.id)}&select=role`, {
      headers: { apikey: anonKey, authorization: `Bearer ${auth.access_token}` }, cache: "no-store",
    });
    const roles = roleResponse.ok ? await roleResponse.json() : [];
    if (!roles.some(row => row.role === "owner" || row.role === "admin")) return NextResponse.json({ error: "This account is not authorized to manage placement data." }, { status: 403 });
    const response = NextResponse.json({ ok: true });
    response.cookies.set("sn_admin_access_token", auth.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/",
      maxAge: Math.min(Number(auth.expires_in) || 3600, 3600),
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message || "Supabase sign-in is currently unavailable." }, { status: 503 });
  }
}
