import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { auth } from "@/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAuthed = !!session?.user;

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      {!isAuthed && <Footer />}
    </>
  );
}
