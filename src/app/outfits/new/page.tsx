import { getItems } from "@/lib/data";
import { DEMO_ITEMS } from "@/lib/demo";
import { getImg } from "@/lib/utils";
import { OutfitNewClient } from "@/components/outfits/OutfitNewClient";

export const dynamic = "force-dynamic";

export default async function NewOutfitPage() {
  const result = await getItems();
  const items  = (result.ok ? result.data : DEMO_ITEMS).map((i) => ({
    id: i.id, name: i.name, category: i.category as string,
    colours: i.colours as string[], brand: i.brand ?? null,
    image_url: getImg(i as Parameters<typeof getImg>[0]),
  }));
  return <OutfitNewClient items={items} />;
}
