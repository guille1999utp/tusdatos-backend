import { Outlet } from "react-router-dom";

// Utilities
import { cn } from "@/lib/utils";
import { DockDemo } from "@/components/dock/DockMagic";
// import type { RootState } from "@/redux/store";

export default function AdminPanelLayout() {
  // const settings = useSelector((state: RootState) => state.sidebar.settings);
  // const getOpenState = useSelector(selectSidebarOpenState);

  return (
      <div className="overflow-hidden relative">
        <DockDemo />
        <main
          className={cn(
            "min-h-[100vh] pb-[22%] lg:pb-0 transition-[margin-left] ease-in-out duration-300"
          )}
        >
          <Outlet />
        </main>
      </div>

  );
}
