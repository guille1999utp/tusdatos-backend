import EventDetail from "./EventDetail";
import SiteMarketingHeader from "@/components/layout/SiteMarketingHeader";

/** Detalle + sesiones accesible sin login (cabecera de marketing). */
export default function PublicEventDetailPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteMarketingHeader />
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-24 md:px-6 md:pt-28">
        <EventDetail variant="public" />
      </main>
    </div>
  );
}
