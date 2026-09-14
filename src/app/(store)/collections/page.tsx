import PageHeader from "@/components/PageHeader";
import CollectionCard from "@/components/CollectionCard";
import { getCollections } from "@/lib/catalog";

export const metadata = {
  title: "Collections · BIW",
  description: "Browse all BIW service collections.",
  alternates: { canonical: "/collections" },
};

export default function CollectionsPage() {
  // Single source of truth — only collections that actually have services.
  const cols = getCollections().filter((c) => c.count > 0);
  return (
    <div className="wrap py-16">
      <PageHeader title="Collections" className="mb-12" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {cols.map((c) => (
          <CollectionCard key={c.slug} slug={c.slug} title={c.title} caption={c.caption} cover={c.image} />
        ))}
      </div>
    </div>
  );
}
