import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="mb-8 font-display text-5xl">Edit product</h1>
      <ProductForm productId={id} />
    </div>
  );
}
