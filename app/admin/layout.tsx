import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cream selection:bg-oak/20">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
