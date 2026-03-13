import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  DashboardErrorState,
  DashboardLoadingState,
  DashboardPageHeader,
  DashboardSection,
} from "~/component/dashboard-ui";
import { useTRPC } from "~/lib/trpc";
import { useActiveClient } from "~/lib/use-active-client";

export const Route = createFileRoute("/dashboard/products/$productId")({
  component: ProductEditPage,
});

function ProductEditPage() {
  const { productId } = Route.useParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { activeClientId } = useActiveClient();

  const productQuery = useQuery(
    trpc.products.getById.queryOptions({
      clientId: activeClientId,
      productId,
    }),
  );

  const updateMutation = useMutation(
    trpc.products.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.getById.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.products.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
        navigate({ to: "/dashboard/products" });
      },
    }),
  );

  if (productQuery.isLoading) {
    return <DashboardLoadingState label="product" />;
  }

  if (productQuery.isError) {
    return (
      <DashboardErrorState description="Could not load this product. It may have been deleted." />
    );
  }

  const product = productQuery.data?.product;
  const client = productQuery.data?.client;

  if (!product) {
    return <DashboardErrorState description="Product not found." />;
  }

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        title={product.name}
        description={`Editing product: ${product.slug}`}
        meta={client?.name ?? client?.email ?? "No active client"}
      />

      <ProductForm
        product={product}
        onSubmit={async (data) => {
          await updateMutation.mutateAsync({
            productId: product.id,
            ...data,
          });
        }}
        onDelete={async () => {
          if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
            await deleteMutation.mutateAsync({ productId: product.id });
          }
        }}
        isPending={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
        error={updateMutation.error?.message}
      />
    </div>
  );
}

interface ProductFormData {
  name?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  price?: string;
  comparePrice?: string | null;
  currency?: string;
  sku?: string | null;
  status?: "draft" | "active" | "archived";
  category?: string | null;
  tags?: string[];
  images?: Array<{ url: string; alt?: string; position?: number }>;
  isVisible?: boolean;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: string | null;
  comparePrice: string | null;
  currency: string | null;
  sku: string | null;
  status: string | null;
  category: string | null;
  tags: string[] | null;
  images: Array<{ url: string; alt?: string; position?: number }> | null;
  isVisible: boolean | null;
  views: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

function ProductForm({
  product,
  onSubmit,
  onDelete,
  isPending,
  isDeleting,
  error,
}: {
  product: ProductData;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onDelete: () => Promise<void>;
  isPending: boolean;
  isDeleting: boolean;
  error?: string;
}) {
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [shortDescription, setShortDescription] = useState(
    product.shortDescription ?? "",
  );
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(product.price ?? "");
  const [comparePrice, setComparePrice] = useState(product.comparePrice ?? "");
  const [currency, setCurrency] = useState(product.currency ?? "USD");
  const [sku, setSku] = useState(product.sku ?? "");
  const [status, setStatus] = useState<"draft" | "active" | "archived">(
    (product.status as "draft" | "active" | "archived") ?? "draft",
  );
  const [category, setCategory] = useState(product.category ?? "");
  const [tagsStr, setTagsStr] = useState((product.tags ?? []).join(", "));
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<
    Array<{ url: string; alt?: string; position?: number }>
  >(product.images ?? []);
  const [isVisible, setIsVisible] = useState(product.isVisible ?? true);

  useEffect(() => {
    setName(product.name);
    setSlug(product.slug);
    setShortDescription(product.shortDescription ?? "");
    setDescription(product.description ?? "");
    setPrice(product.price ?? "");
    setComparePrice(product.comparePrice ?? "");
    setCurrency(product.currency ?? "USD");
    setSku(product.sku ?? "");
    setStatus((product.status as "draft" | "active" | "archived") ?? "draft");
    setCategory(product.category ?? "");
    setTagsStr((product.tags ?? []).join(", "));
    setImages(product.images ?? []);
    setIsVisible(product.isVisible ?? true);
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await onSubmit({
      name,
      slug,
      shortDescription: shortDescription || undefined,
      description: description || undefined,
      price: price || undefined,
      comparePrice: comparePrice || null,
      currency,
      sku: sku || null,
      status,
      category: category || null,
      tags,
      images,
      isVisible,
    });
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, { url: imageUrl.trim(), position: images.length }]);
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main content — 2 columns */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <DashboardSection title="Product details">
            <div className="space-y-4 p-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Product name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Slug
                </label>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="shortDescription"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Short description
                </label>
                <textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Full description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-2"
                />
              </div>
            </div>
          </DashboardSection>

          <DashboardSection title="Images">
            <div className="space-y-3 p-5">
              {images.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-4">
                  {images.map((img, i) => (
                    <div
                      key={`${img.url}-${i}`}
                      className="group relative overflow-hidden rounded-lg border bg-muted/20"
                    >
                      <img
                        src={img.url}
                        alt={img.alt ?? "Product image"}
                        className="aspect-square w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute right-1 top-1 rounded-full bg-destructive/90 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                />
                <button
                  type="button"
                  onClick={addImage}
                  disabled={!imageUrl.trim()}
                  className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </DashboardSection>
        </div>

        {/* Sidebar — 1 column */}
        <div className="flex flex-col gap-5">
          <DashboardSection title="Status & visibility">
            <div className="space-y-4 p-5">
              <div>
                <label
                  htmlFor="status"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "draft" | "active" | "archived")
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="size-4 rounded border-input"
                />
                <label htmlFor="isVisible" className="text-sm font-medium">
                  Visible on storefront
                </label>
              </div>
            </div>
          </DashboardSection>

          <DashboardSection title="Pricing">
            <div className="space-y-4 p-5">
              <div>
                <label
                  htmlFor="price"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Price
                </label>
                <input
                  id="price"
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="comparePrice"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Compare-at price
                </label>
                <input
                  id="comparePrice"
                  type="text"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="0.00"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Currency
                </label>
                <input
                  id="currency"
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  maxLength={3}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                />
              </div>
            </div>
          </DashboardSection>

          <DashboardSection title="Organization">
            <div className="space-y-4 p-5">
              <div>
                <label
                  htmlFor="sku"
                  className="mb-1.5 block text-xs font-medium"
                >
                  SKU
                </label>
                <input
                  id="sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="sale, featured, new"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                />
              </div>
            </div>
          </DashboardSection>

          <DashboardSection title="Meta">
            <div className="space-y-2 p-5 text-xs text-muted-foreground">
              <p>Views: {product.views ?? 0}</p>
              <p>
                Created:{" "}
                {product.createdAt
                  ? new Date(product.createdAt).toLocaleString()
                  : "--"}
              </p>
              <p>
                Updated:{" "}
                {product.updatedAt
                  ? new Date(product.updatedAt).toLocaleString()
                  : "--"}
              </p>
            </div>
          </DashboardSection>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4">
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-lg border border-destructive/25 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete Product"}
        </button>
      </div>
    </form>
  );
}
