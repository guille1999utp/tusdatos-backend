"use client";

import { Separator } from "@/components/ui/separator";
import {
  House,
  LayoutDashboard,
  LogOut,
  CalendarCog,
  CalendarSearch,
  UserCircle,
  Shield,
  Users,
  UserCheck,
  PanelsTopLeft,
  Ticket,
} from "lucide-react";
import React, { useContext } from "react";
import { Dock, DockIcon } from "../magicui/dock";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ModeToggle } from "../mode-toggle";
import { AuthContext } from "@/auth/AuthContext";
import { Link } from "react-router-dom";

export type IconProps = React.HTMLAttributes<SVGElement>;

export function DockDemo() {
  const { logout, user } = useContext(AuthContext)!;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 mx-auto flex origin-bottom h-full max-h-14">
      <div className="fixed top-0 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,transparent,transparent)] dark:bg-background"></div>
      <Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1 bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] ">
        <DockIcon>
          <Link to="/" className="flex h-full items-center justify-center" title="Inicio">
            <Icons.home className="size-6" />
          </Link>
        </DockIcon>
        <DockIcon>
          <Link to="/dashboard" className="flex h-full items-center justify-center" title="Panel">
            <Icons.panel className="size-6" />
          </Link>
        </DockIcon>
        <DockIcon>
          <Link to="/events" className="flex h-full items-center justify-center">
            <Icons.events className="size-6" />
          </Link>
        </DockIcon>
        <DockIcon>
          <Link to="/all-events" className="flex h-full items-center justify-center" title="Explorar eventos">
            <Icons.allevents className="size-6" />
          </Link>
        </DockIcon>
        <DockIcon>
          <Link to="/my-registrations" className="flex h-full items-center justify-center" title="Mis inscripciones">
            <Icons.registrations className="size-6" />
          </Link>
        </DockIcon>
        <DockIcon>
          <Link to="/assistant-events" className="flex h-full items-center justify-center" title="Como asistente">
            <Icons.assistant className="size-6" />
          </Link>
        </DockIcon>
        <DockIcon>
          <Link to="/profile" className="flex h-full items-center justify-center">
            <Icons.profile className="size-6" />
          </Link>
        </DockIcon>
        {user?.role === "admin" ? (
          <>
            <DockIcon>
              <Link to="/admin" className="flex h-full items-center justify-center" title="Panel administración">
                <Icons.adminPanel className="size-6" />
              </Link>
            </DockIcon>
            <DockIcon>
              <Link to="/admin/events" className="flex h-full items-center justify-center" title="Admin eventos">
                <Icons.adminEvents className="size-6" />
              </Link>
            </DockIcon>
            <DockIcon>
              <Link to="/admin/users" className="flex h-full items-center justify-center" title="Admin usuarios">
                <Icons.adminUsers className="size-6" />
              </Link>
            </DockIcon>
          </>
        ) : null}

        {/* <DockIcon>
          <a href="/dashboard/three-fiber" className="flex h-full items-center justify-center">
            <Icons.threejs className="size-6" />
          </a>
        </DockIcon>
        <DockIcon>
          <Icons.googleDrive className="size-6" />
        </DockIcon>
        <DockIcon>
          <Icons.notion className="size-6" />
        </DockIcon>
        <DockIcon>
          <Icons.whatsapp className="size-6" />
        </DockIcon> */}

        <Separator orientation="vertical" className="h-full py-2" />
        <DockIcon>
          <button className="cursor-pointer flex h-full items-center justify-center" onClick={() => logout()}>
            <Icons.logout className="size-6" />
          </button>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <ModeToggle />
            </TooltipTrigger>
            <TooltipContent>
              <p>Theme</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </div>
  );
}

const Icons = {
  home: (props: IconProps) => (
    <House {...props} />
  ),
  panel: (props: IconProps) => (
    <LayoutDashboard {...props} />
  ),
  events: (props: IconProps) => (
    <CalendarCog {...props} />
  ),
  allevents: (props: IconProps) => (
    <CalendarSearch {...props} />
  ),
  assistant: (props: IconProps) => (
    <UserCheck {...props} />
  ),
  registrations: (props: IconProps) => (
    <Ticket {...props} />
  ),
  profile: (props: IconProps) => (
    <UserCircle {...props} />
  ),
  logout: (props: IconProps) => (
    <LogOut {...props} />
  ),
  adminPanel: (props: IconProps) => (
    <PanelsTopLeft {...props} />
  ),
  adminEvents: (props: IconProps) => (
    <Shield {...props} />
  ),
  adminUsers: (props: IconProps) => (
    <Users {...props} />
  ),

};
