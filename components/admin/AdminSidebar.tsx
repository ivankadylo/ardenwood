"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Globe,
  Users,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: Tag, label: "Discounts", href: "/admin/discounts" },
  { icon: Globe, label: "Currencies", href: "/admin/currencies" },
  { icon: Users, label: "Users", href: "/admin/users" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-charcoal text-cream h-screen sticky top-0 flex flex-col border-r border-warm-mid/20">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-oak-light hover:text-oak transition-colors mb-8">
          <ChevronLeft size={16} />
          <span className="font-sans text-sm font-medium">Back to Shop</span>
        </Link>
        <h1 className="font-serif text-2xl mb-8">ArdenWood <span className="text-oak-light">Admin</span></h1>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-sans",
                  pathname === item.href
                    ? "bg-oak text-cream shadow-lg shadow-oak/20"
                    : "hover:bg-warm-mid/10 text-cream/70 hover:text-cream"
                )}
              >
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 border-t border-warm-mid/10">
        <p className="text-xs text-cream/40 font-sans">© 2024 ArdenWood Admin</p>
      </div>
    </aside>
  );
}
