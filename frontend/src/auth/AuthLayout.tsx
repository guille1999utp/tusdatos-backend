import Grainient from "@/components/ui/grainient";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* lado izquierdo bonito */}
      <div className="hidden xl:block relative h-screen w-1/2  p-6  ">
        <div className="relative h-full w-full">
          {/* Card con texto y fondo, SIN overflow-hidden */}
          <div className="relative h-full w-full shadow-lg border border-secondary dark:border dark:border-white/40 rounded-[3rem]">
            {/* Grainient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none ">
              <Grainient
                className=" inset-0 rounded-[3rem]"
                color1="#583cd6"
                color2="#313260"
                color3="#583cd6"
                timeSpeed={1}
                colorBalance={0}
                warpStrength={1}
                warpFrequency={5.5}
                warpSpeed={3}
                warpAmplitude={50}
                blendAngle={0}
                blendSoftness={0.05}
                rotationAmount={500}
                noiseScale={2}
                grainAmount={0.1}
                grainScale={2}
                grainAnimated={false}
                contrast={1.1}
                gamma={1}
                saturation={1}
                centerX={0}
                centerY={0}
                zoom={0.9}
              />
            </div>
            <p className="text-white md:text-2xl z-10 relative lg:text-3xl xl:text-5xl 2xl:text-7xl font-extrabold leading-tight text-center 2xl:mx-20 mt-24">
              &quot;TUS EVENTOS, EN UN SOLO LUGAR&quot;
            </p>

            {/* Capa que SOLO controla los círculos con overflow-hidden */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[3rem]">
              <div className="absolute bottom-0 left-0 size-74 rounded-tr-[300px] bg-linear-to-r from-white/50 via-white to-white/50"></div>{" "}
              <div className="absolute bottom-0 left-0 size-72 rounded-tr-[300px] bg-secondary"></div>{" "}
              <div className="absolute bottom-0 left-0 size-52 rounded-tr-[200px] bg-tertiary"></div>{" "}
              <div className="absolute bottom-0 left-0 size-32 rounded-tr-[100px] bg-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* lado derecho */}
      <div className="w-full xl:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <Outlet /> {/* 👈 aquí entra SignIn */}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
