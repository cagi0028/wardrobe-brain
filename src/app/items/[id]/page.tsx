import { notFound } from "next/navigation";
import { getItem } from "@/lib/data";
import { ItemDetailClient } from "@/components/items/ItemDetailClient";

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const result = await getItem(params.id);
  if (!result.ok) notFound();
  const { item, wearCount, lastWorn, recentLogs } = result.data;
  return <ItemDetailClient item={item} wearCount={wearCount} lastWorn={lastWorn} recentLogs={recentLogs} />;
}
