import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
  DashboardMetric,
  DashboardPageHeader,
  DashboardSection,
  formatDate,
} from "~/component/dashboard-ui";
import { useTRPC } from "~/lib/trpc";
import { useActiveClient } from "~/lib/use-active-client";

export const Route = createFileRoute("/dashboard/products")({
  component: ProductsPage,
});

type StatusFilter = "all" | "draft" | "active" | "archived";

function ProductsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { activeClientId } = useActiveClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const productsQuery = useQuery(
    trpc.products.list.queryOptions({
      clientId: activeClientId,
      limit: 100,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
  );

  const createMutation = useMutation(
    trpc.products.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
        setShowCreateForm(false);
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.products.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.products.list.queryKey(),
        });
      },
    }),
  );

  if (productsQuery.isLoading) {
    return <DashboardLoadingState label="products" />;
  }

  if (productsQuery.isError) {
    return (
      <DashboardErrorState description="The products request failed. Try refreshing this page." />
    );
  }

  const client = productsQuery.data?.client ?? null;
  const rows = productsQuery.data?.rows ?? [];
  const total = productsQuery.data?.total ?? 0;
  const activeCount = rows.filter((r) => r.status === "active").length;
  const draftCount = rows.filter((r) => r.status === "draft").length;

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        title="Products"
        description="Manage your product catalog. Products are served to WordPress via the SaaS API."
        meta={client?.name ?? client?.email ?? "No active client"}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <DashboardMetric label="Total" value={total.toLocaleString()} />
        <DashboardMetric label="Active" value={activeCount.toLocaleString()} />
        <DashboardMetric label="Draft" value={draftCount.toLocaleString()} />
        <DashboardMetric
          label="Archived"
          value={(total - activeCount - draftCount).toLocaleString()}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1">
          {(["all", "active", "draft", "archived"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {showCreateForm ? "Cancel" : "Create Product"}
          </button>
        </div>
      </div>

      {showCreateForm && (
        <CreateProductForm
          onSubmit={async (data) => {
            await createMutation.mutateAsync({
              clientId: activeClientId,
              ...data,
            });
          }}
          isPending={createMutation.isPending}
          error={createMutation.error?.message}
        />
      )}

      {rows.length ? (
        <DashboardSection
          title="Product catalog"
          description={`${total} products total`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id} className="group">
                    <td className="px-4 py-3">
                      <Link
                        to="/dashboard/products/$productId"
                        params={{ productId: row.id }}
                        className="font-medium text-primary hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.slug}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status ?? "draft"} />
                    </td>
                    <td className="px-4 py-3">
                      {row.price ? (
                        <span>
                          {row.currency ?? "USD"} {row.price}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.sku ?? "--"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.views ?? 0}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                          to="/dashboard/products/$productId"
                          params={{ productId: row.id }}
                          className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `Delete "${row.name}"? This cannot be undone.`,
                              )
                            ) {
                              deleteMutation.mutate({ productId: row.id });
                            }
                          }}
                          className="rounded px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardSection>
      ) : (
        <DashboardEmptyState
          title="No products found"
          description={
            statusFilter !== "all"
              ? `No ${statusFilter} products. Try a different filter or create a product.`
              : "Create your first product to get started."
          }
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    draft: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    archived: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  };

  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        styles[status] ?? styles.draft
      }`}
    >
      {status}
    </span>
  );
}

function CreateProductForm({
  onSubmit,
  isPending,
  error,
}: {
  onSubmit: (data: {
    name: string;
    slug?: string;
    shortDescription?: string;
    price?: string;
    status?: "draft" | "active" | "archived";
    category?: string;
    sku?: string;
  }) => Promise<void>;
  isPending: boolean;
  error?: string;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "active">("draft");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      slug: slug || undefined,
      shortDescription: shortDescription || undefined,
      price: price || undefined,
      sku: sku || undefined,
      category: category || undefined,
      status,
    });
  };

  return (
    <DashboardSection title="Create new product">
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        {error && (
          <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-medium">
              Product name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Premium Widget"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="slug" className="mb-1.5 block text-xs font-medium">
              Slug (auto-generated if empty)
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="premium-widget"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="price" className="mb-1.5 block text-xs font-medium">
              Price
            </label>
            <input
              id="price"
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="29.99"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="sku" className="mb-1.5 block text-xs font-medium">
              SKU
            </label>
            <input
              id="sku"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="PREM-001"
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
              placeholder="e.g. Electronics"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
            />
          </div>
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
            placeholder="Brief product summary..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-primary/20 transition focus:ring-2"
          />
        </div>

        <div className="flex items-center gap-4">
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
              onChange={(e) => setStatus(e.target.value as "draft" | "active")}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div className="ml-auto self-end">
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </DashboardSection>
  );
}
