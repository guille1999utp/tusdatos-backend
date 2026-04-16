import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useAuth } from "../hooks/useAuth";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import authService from "@/services/authService";
import { useNavigate, useSearchParams } from "react-router-dom";

type LoginFormInputs = {
  email: string;
  password: string;
};

const schema = Yup.object({
  email: Yup.string()
    .email("Correo inválido")
    .required("Este campo es requerido"),
  password: Yup.string()
    .min(6, "Mínimo 6 caracteres")
    .required("Este campo es requerido"),
});

const Login = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectAfterLogin = searchParams.get("redirect");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    setFormError(null);

    try {
      const resp = await authService.login(data.email, data.password); // Axios login
      const dest =
        redirectAfterLogin &&
        redirectAfterLogin.startsWith("/") &&
        !redirectAfterLogin.startsWith("//")
          ? redirectAfterLogin
          : undefined;
      login(resp.access_token, dest);
    } catch (error: unknown) {
      setFormError(
        (error as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail || "Error al iniciar sesión",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-3xl bg-white p-4 md:p-8 dark:bg-black">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Bienvenido a Tusdatos.co
      </h2>
      <p className="my-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        Ingresa tus datos para iniciar sesión y acceder a tu cuenta.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Dirección correo</Label>
          <Input
            id="email"
            type="email"
            placeholder="projectmayhem@fc.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </LabelInputContainer>

        {formError && (
          <div className="mb-4 text-sm text-red-600">{formError}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "group/btn relative block h-10 w-full rounded-md font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]",
            "bg-gradient-to-br from-black to-neutral-600 dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900",
            loading && "opacity-60 cursor-not-allowed",
          )}
        >
          {loading ? "Cargando..." : "Iniciar sesión →"}
          <BottomGradient />
        </button>

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />
      </form>

      <button
        className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
        type="button"
        onClick={() => navigate("/register")}
      >
        <span className="text-sm text-neutral-700 dark:text-neutral-300 w-full justify-center">
          Registrarse
        </span>
        <BottomGradient />
      </button>
    </div>
  );
};

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex w-full flex-col space-y-2", className)}>
    {children}
  </div>
);

export default Login;
