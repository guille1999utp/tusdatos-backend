import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import TransitionLink from "@/providers/TransitionLink";

/**
 * Cabecera del sitio (home público, vista pública de evento/sesiones).
 */
export default function SiteMarketingHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 z-60 w-full max-md:px-2">
      <div className="mx-auto mt-3 flex h-16 max-w-xl items-center justify-between gap-4 rounded-full border-2 border-white bg-tertiary px-4 shadow-xl backdrop-blur-md">
        <Link
          to="/"
          className="text-base font-extrabold uppercase tracking-tight text-black md:text-xl xl:text-3xl"
        >
          MISEVENTOS
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-full px-1 py-1.5 text-base font-semibold text-black hover:bg-black/5 md:px-3 md:text-lg"
              >
                Panel
              </Link>
              <Link
                to="/all-events"
                className="rounded-full px-1 py-1.5 text-base font-semibold text-black hover:bg-black/5 md:px-3 md:text-lg"
              >
                Explorar
              </Link>
              <Button
                type="button"
                variant="main"
                className="border border-white font-semibold shadow-xl hover:shadow-none"
                onClick={() => logout()}
              >
                Salir
              </Button>
            </>
          ) : (
            <>
              <TransitionLink to="/login">
                <Button
                  variant="default"
                  className={cn(
                    "w-full bg-transparent py-5 text-sm font-bold text-black hover:bg-black/10 max-md:px-1 md:py-6 md:text-lg",
                  )}
                >
                  Iniciar sesión
                </Button>
              </TransitionLink>
              <TransitionLink to="/register">
                <Button
                  variant="main"
                  className={cn(
                    "w-full border border-white py-5 text-sm font-bold md:py-6 md:text-base",
                  )}
                >
                  Registrarse
                </Button>
              </TransitionLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
