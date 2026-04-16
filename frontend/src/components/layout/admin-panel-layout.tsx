import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export default function AdminPanelLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 md:p-4 xl:p-6 ">
          <div className="p-4 sm:p-6 md:p-8 xl:p-10 min-h-[calc(100vh-3rem)] bg-white flex flex-col gap-10 md:rounded-4xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
