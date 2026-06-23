import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewProduct() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/products" className="flex items-center gap-2 text-warm-mid hover:text-oak transition-colors mb-4 font-sans text-sm font-medium">
          <ChevronLeft size={16} />
          Back to Products
        </Link>
        <h1 className="font-serif text-4xl mb-2">Add New Product</h1>
        <p className="text-warm-mid font-sans">Create a new masterpiece for your collection.</p>
      </div>

      <ProductForm />
    </div>
  );
}
