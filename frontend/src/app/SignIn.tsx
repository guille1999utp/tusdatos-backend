import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "@/services/authService";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, LockPasswordIcon } from "@hugeicons/core-free-icons";

// schema con zod (mejor que yup para shadcn)
const schema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginFormInputs = z.infer<typeof schema>;

const Login = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectAfterLogin = searchParams.get("redirect");

  const form = useForm<LoginFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    setFormError(null);

    try {
      const resp = await authService.login(data.email, data.password);

      const dest =
        redirectAfterLogin &&
        redirectAfterLogin.startsWith("/") &&
        !redirectAfterLogin.startsWith("//")
          ? redirectAfterLogin
          : undefined;

      login(resp.access_token, dest);
    } catch (error: any) {
      setFormError(error?.response?.data?.detail || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="mb-6 md:mb-10 text-center flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl text-center font-extrabold text-secondary">
          Bienvenido a{" "}
        </h2>
        <span className="text-white border border-secondary text-3xl py-2 md:text-4xl xl:text-5xl text-center font-extrabold  rounded-full bg-primary">
          TUSDATOS.CO
        </span>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 md:space-y-4 mt-4"
        >
          {/* EMAIL */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <HugeiconsIcon
                      icon={Mail01Icon}
                      strokeWidth={2}
                      className={`size-10 ${
                        field.value
                          ? "text-primary"
                          : "text-muted-foreground/70"
                      } p-2`}
                    />
                  </div>

                  <FormControl>
                    <Input
                      type="email"
                      placeholder="correo electrónico"
                      className="pl-14 py-6 rounded-full"
                      {...field}
                    />
                  </FormControl>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* PASSWORD */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <HugeiconsIcon
                      icon={LockPasswordIcon}
                      strokeWidth={2}
                      className={`size-10 ${
                        field.value
                          ? "text-primary"
                          : "text-muted-foreground/70"
                      } p-2`}
                    />
                  </div>

                  <FormControl>
                    <Input
                      type="password"
                      placeholder="contraseña"
                      className="pl-14 py-6 rounded-full"
                      {...field}
                    />
                  </FormControl>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* ERROR */}
          {formError && <div className="text-sm text-red-500">{formError}</div>}

          {/* BUTTON */}
          <Button
            type="submit"
            variant={"main"}
            disabled={loading}
            className={cn("w-full py-6 mt-4 font-bold text-lg")}
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </Button>

          {/* REGISTER */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-sm md:text-base underline cursor-pointer"
            >
              ¿No tienes cuenta? Regístrate
            </button>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default Login;
