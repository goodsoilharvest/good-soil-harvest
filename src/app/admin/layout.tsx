import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[var(--color-parchment)]">
      {/* Admin nav */}
      <header className="bg-[var(--color-soil-800)] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-serif font-bold text-[var(--color-harvest-400)]">
              Good Soil CMS
            </Link>
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              <Link href="/admin" className="px-3 py-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/drafts" className="px-3 py-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                Drafts
              </Link>
              <Link href="/admin/posts" className="px-3 py-1.5 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                Posts
              </Link>
            </nav>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button type="submit" className="text-sm text-white/60 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
