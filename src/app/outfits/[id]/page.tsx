import { notFound } from "next/navigation";
import { getOutfit } from "@/lib/data";
import { OutfitDetailClient } from "@/components/outfits/OutfitDetailClient";

export const dynamic = "force-dynamic";

export default async function OutfitDetailPage({ params }: { params: { id: string } }) {
  const result = await getOutfit(params.id);
  if (!result.ok) notFound();
  return <OutfitDetailClient outfit={result.data} />;
}
