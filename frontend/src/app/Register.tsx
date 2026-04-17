import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
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
import {
  Mail01Icon,
  LockPasswordIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";

// schema
const schema = z
  .object({
    name: z.string().min(3, "Mínimo 3 caracteres"),
    email: z.string().email("Correo inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterFormInputs = z.infer<typeof schema>;

const Register = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<RegisterFormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    setFormError(null);

    try {
      const resp = await authService.register({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      login(resp.access_token);
    } catch (error: any) {
      setFormError(error?.response?.data?.detail || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      {/* TITLE */}
      <div className="mb-6 md:mb-10 text-center flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl text-center font-extrabold text-secondary">
          Regístrate en{" "}
        </h2>
        <span className="text-white border border-secondary text-3xl py-2 md:text-4xl xl:text-5xl text-center font-extrabold  rounded-full bg-primary">
          TUSDATOS.CO
        </span>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 md:space-y-4"
        >
          {/* NAME */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                    <HugeiconsIcon
                      icon={UserIcon}
                      className={`size-10 ${
                        field.value
                          ? "text-primary"
                          : "text-muted-foreground/70"
                      } p-2`}
                    />
                  </div>

                  <FormControl>
                    <Input
                      placeholder="Tu nombre"
                      className="pl-14 py-6 rounded-full"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* EMAIL */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                    <HugeiconsIcon
                      icon={Mail01Icon}
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
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                    <HugeiconsIcon
                      icon={LockPasswordIcon}
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

          {/* CONFIRM PASSWORD */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                    <HugeiconsIcon
                      icon={LockPasswordIcon}
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
                      placeholder="confirmar contraseña"
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
            variant="main"
            disabled={loading}
            className={cn("w-full py-6 mt-4 font-bold text-lg")}
          >
            {loading ? "Cargando..." : "Registrarse"}
          </Button>

          {/* LOGIN */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm md:text-base underline cursor-pointer"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default Register;
