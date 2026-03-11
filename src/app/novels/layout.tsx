import { auth } from "@/auth";
import { Navbar } from "@/components/layout/navbar";
import { redirect } from "next/navigation";

export default async function NovelsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={session.user} />
      {children}
    </div>
  );
}
