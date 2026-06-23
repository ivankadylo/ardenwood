import ProductForm from "@/components/admin/ProductForm";
import { createClient } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditProduct({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/products" className="flex items-center gap-2 text-warm-mid hover:text-oak transition-colors mb-4 font-sans text-sm font-medium">
          <ChevronLeft size={16} />
          Back to Products
        </Link>
        <h1 className="font-serif text-4xl mb-2">Edit Product</h1>
        <p className="text-warm-mid font-sans">Update details for "{product.name_en}".</p>
      </div>

      <ProductForm initialData={product} />
    </div>
  );
}
