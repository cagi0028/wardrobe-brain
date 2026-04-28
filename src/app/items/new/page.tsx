import { PageHeader } from "@/components/layout/PageHeader";
import { AddItemForm } from "@/components/items/AddItemForm";

export const dynamic = "force-dynamic";

export default function NewItemPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader title="Add item" back backHref="/items" />
      <AddItemForm />
    </div>
  );
}
