import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { AdminNavClient } from "./AdminNavClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin-login");
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin-login" });
  }

  return (
    <div className="min-h-screen bg-[var(--color-soil-900)]">
      <AdminNavClient signOutAction={handleSignOut} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-white">
        {children}
      </main>
    </div>
  );
}
