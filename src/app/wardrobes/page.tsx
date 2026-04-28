import { getWardrobes } from "@/lib/data";
import { WardrobesClient } from "@/components/wardrobes/WardrobesClient";

export const dynamic = "force-dynamic";

export default async function WardrobesPage() {
  const result = await getWardrobes();
  return <WardrobesClient initialWardrobes={result.ok ? result.data : []} />;
}
