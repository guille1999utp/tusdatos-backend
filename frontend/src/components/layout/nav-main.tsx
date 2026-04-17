"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NavMain({ items, user, onNavigate }: any) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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

        // =============================
        // 👉 ITEM SIMPLE
        // =============================
        if (!item.children) {
          return (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className={`flex items-center transition-all duration-300 active:scale-95
                  ${
                    isCollapsed
                      ? "size-12 mx-auto justify-center rounded-lg mb-2"
                      : "w-[calc(100%-1rem)] mx-2 h-12 pl-4 rounded-xl mb-1 gap-3"
                  }
                  ${
                    isActive
                      ? "bg-primary text-white shadow-xl border-2 border-white scale-105"
                      : "text-black/70 hover:bg-black/5 "
                  }
                `}
                >
                  {item.icon && (
                    <item.icon
                      className={`${isCollapsed ? "size-7" : "size-6"} transition-all fill-black/10`}
                    />
                  )}

                  {!isCollapsed && (
                    <span className="text-lg font-semibold">{item.label}</span>
                  )}
                </Link>
              </TooltipTrigger>

              {isCollapsed && (
                <TooltipContent side="right" sideOffset={12}>
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        }

        // =============================
        // 👉 ITEM CON SUBMENU
        // =============================
        const isOpen = openGroup === item.label;

        return (
          <div key={item.label}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() =>
                    !isCollapsed && setOpenGroup(isOpen ? null : item.label)
                  }
                  className={`flex items-center cursor-pointer transition-all duration-300
                  ${
                    isCollapsed
                      ? "size-11 mx-auto justify-center rounded-2xl mb-2"
                      : "w-[calc(100%-1rem)] mx-2 h-12 pl-4 rounded-xl mb-1 gap-3"
                  }
                  ${
                    isActive
                      ? "bg-primary text-white shadow-xl border-2 border-white scale-105"
                      : "text-black/70 hover:bg-black/5"
                  }
                `}
                >
                  {item.icon && (
                    <item.icon
                      className={`${isCollapsed ? "size-7" : "size-6"} transition-all fill-black/10`}
                    />
                  )}

                  {!isCollapsed && (
                    <span className="text-lg font-semibold">{item.label}</span>
                  )}

                  {!isCollapsed && (
                    <ChevronRight
                      className={`ml-auto mr-4 transition-transform duration-300 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </button>
              </TooltipTrigger>

              {isCollapsed && (
                <TooltipContent side="right" sideOffset={12}>
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>

            {/* 🔥 SUBMENU SOLO SI NO ESTÁ COLAPSADO */}
            {!isCollapsed && (
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

                      const hasBetterSiblingMatch = item.children.some(
                        (sibling: any) =>
                          sibling !== sub &&
                          (path === sibling.to ||
                            path.startsWith(sibling.to + "/")) &&
                          sibling.to.length > sub.to.length,
                      );

                      if (
                        !hasBetterSiblingMatch &&
                        path.startsWith(sub.to + "/")
                      )
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
                            ? "bg-primary text-white border-2 border-white shadow-md"
                            : "hover:bg-black/5"
                        }
                      `}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
