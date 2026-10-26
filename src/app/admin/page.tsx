'use client'

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/submissions", { cache: "no-store" });
        if (cancelled) return;
        if (res.ok) setAuthed(true);
        else setAuthed(false);
      } catch {
        if (!cancelled) setAuthed(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={() => setAuthed(false)} />;
}
