import PropertySearch from "@/components/search/PropertySearch";

export const metadata = {
  title: "AI Property Search | Occupyo",
  description: "Find your ideal commercial real estate space using natural language.",
};

export default function SearchDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <PropertySearch />
    </div>
  );
}
