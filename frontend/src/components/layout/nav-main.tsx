import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function NavMain({ items, user, onNavigate }: any) {
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      {items.map((item: any) => {
        // 🔥 filtro por roles
        if (item.roles && !item.roles.includes(user?.role)) return null;

        const isActive = item.children
          ? item.children.some((c: any) => {
              const path = location.pathname;
              return path === c.to || path.startsWith(c.to + "/");
            })
          : location.pathname === item.to;

        // 👉 ITEM SIMPLE
        if (!item.children) {
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex w-[calc(100%-1rem)] items-center mx-2 text-lg font-semibold gap-2 p-2 pl-4 rounded-xl h-12 transition-all active:scale-95
    ${
      isActive
        ? "bg-primary text-white border-2 shadow-lg"
        : "hover:bg-black/10"
    }
  `}
            >
              {item.icon && <item.icon className="size-6 mr-1" />}
              {item.label}
            </Link>
          );
        }

        // 👉 ITEM CON SUBMENU
        const isOpen = openGroup === item.label;

        return (
          <div key={item.label}>
            <button
              onClick={() => setOpenGroup(isOpen ? null : item.label)}
              className={`flex w-[calc(100%-1rem)] cursor-pointer items-center mx-2 text-lg font-semibold gap-2 pl-4 rounded-xl h-12 transition-all
      ${
        isActive
          ? "bg-primary text-white border-2 shadow-lg"
          : "hover:bg-black/10"
      }
    `}
            >
              {item.icon && <item.icon className="size-6 mr-1" />}
              {item.label}

              <ChevronRight
                className={`ml-auto mr-4 transition-transform duration-300 ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
            </button>

            {/* 🔥 SUBMENU ANIMADO */}
            <div
              className={`ml-8 overflow-hidden transition-all duration-300 ease-in-out
      ${isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"}
    `}
            >
              <div className="flex flex-col gap-1 mt-1 md:mt-2 border-l border-black/10 pl-4">
                {item.children.map((sub: any) => {
                  const isSubActive = (() => {
                    const path = location.pathname;

                    if (path === sub.to) return true;

                    // Evitamos que items genéricos (ej. /admin) se activen si un hermano más específico (ej. /admin/users) coincide mejor
                    const hasBetterSiblingMatch = item.children.some(
                      (sibling: any) =>
                        sibling !== sub &&
                        (path === sibling.to ||
                          path.startsWith(sibling.to + "/")) &&
                        sibling.to.length > sub.to.length,
                    );

                    if (!hasBetterSiblingMatch && path.startsWith(sub.to + "/"))
                      return true;

                    return false;
                  })();

                  return (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      onClick={onNavigate}
                      className={`p-2 rounded-xl font-medium pl-3 mr-2 text-base md:text-lg transition-all duration-200 active:scale-95
              ${
                isSubActive
                  ? "bg-primary text-white border-2 border-white "
                  : "hover:bg-black/10"
              }
            `}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
