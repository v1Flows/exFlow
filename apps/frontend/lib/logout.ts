"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function Logout() {
  const c = await cookies();

  c.delete("session");
  c.delete("user");

  redirect("/");
}
