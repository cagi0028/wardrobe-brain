import { getInsights } from "@/lib/data";
import { InsightsDashboard } from "@/components/insights/InsightsDashboard";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const result = await getInsights();
  const data = result.ok ? result.data : {
    total_items: 0, total_outfits: 0, total_wears: 0,
    total_value: 0, items_with_price: 0,
    never_worn: [], unworn_60d: [], most_worn: [],
    recently_added: [], category_breakdown: [],
    duplicate_groups: [], cost_per_wear: [],
  };
  return <InsightsDashboard data={data} />;
}
