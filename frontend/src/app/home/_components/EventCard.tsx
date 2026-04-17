"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Calendar01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(SplitText);

const STROKE_COLORS = ["#583cd6", "#defd99", "#defd99"];

const BASE_STROKE = "#aea3e4";

interface EventCardProps {
  event: any;
  index: number;
  onClick: () => void;
  isFull: boolean;
  isExpired: boolean;
}

export default function EventCard({
  event,
  index,
  onClick,
  isFull,
  isExpired,
}: EventCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const isBlocked = isFull || isExpired;

  useEffect(() => {
    if (!cardRef.current) return;

    const cardContainer = cardRef.current;
    const cardPaths =
      cardContainer.querySelectorAll<SVGPathElement>(".svg-stroke path");
    const cardTitle = cardContainer.querySelector("h3");
    const actionBtn = cardContainer.querySelector(".action-btn");

    if (!cardTitle || !actionBtn) return;

    const split = SplitText.create(cardTitle, {
      type: "words",
      mask: "words",
      wordsClass: "word",
    });

    // Title is always visible now
    gsap.set(split.words, { yPercent: 0 });
    gsap.set(actionBtn, { opacity: 0, y: 20 });

    cardPaths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    });

    let tl: gsap.core.Timeline | null = null;

    const handleEnter = () => {
      if (tl) tl.kill();
      tl = gsap.timeline();

      cardPaths.forEach((path) => {
        tl!.to(
          path,
          {
            strokeDashoffset: 0,
            attr: { "stroke-width": 750 },
            duration: 1,
            ease: "power2.out",
          },
          0,
        );
      });

      if (!isBlocked) {
        tl.to(
          actionBtn,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "back.out(1.7)",
          },
          0.2, // Start a bit earlier since title doesn't animate
        );
      }
    };

    const handleLeave = () => {
      if (tl) tl.kill();
      tl = gsap.timeline();

      cardPaths.forEach((path) => {
        const length = path.getTotalLength();
        tl!.to(
          path,
          {
            strokeDashoffset: length,
            attr: { "stroke-width": 200 },
            duration: 1,
            ease: "power2.out",
          },
          0,
        );
      });

      tl.to(
        actionBtn,
        {
          opacity: 0,
          y: 20,
          duration: 0.3,
        },
        0,
      );
    };

    cardContainer.addEventListener("mouseenter", handleEnter);
    cardContainer.addEventListener("mouseleave", handleLeave);

    return () => {
      cardContainer.removeEventListener("mouseenter", handleEnter);
      cardContainer.removeEventListener("mouseleave", handleLeave);
      split.revert();
    };
  }, [isBlocked]);

  const color = STROKE_COLORS[index % STROKE_COLORS.length];

  return (
    <div
      ref={cardRef}
      id={`card-${event.id}`}
      onClick={() => !isBlocked && onClick()}
      className={`group relative aspect-square border-2 border-white rounded-[3rem] overflow-hidden shadow-[12px_12px_24px_#d3d1ca,-12px_-12px_24px_#ffffff] transition-all duration-700 ${
        isBlocked ? "cursor-not-allowed opacity-80" : "cursor-pointer"
      }`}
    >
      {/* Background Layer */}
      <div
        className="absolute inset-0 transition-all duration-1000 group-hover:scale-110 group-hover:rotate-3 bg-background"
        // style={{
        //   background: isBlocked
        //     ? "radial-gradient(circle at 20% 20%, #262626, #0a0a0a)"
        //     : `radial-gradient(circle at 20% 20%, ${color}44, #000000)`,
        // }}
      />

      {/* Glassmorphism Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Content Overlay */}
      <div className="relative h-full w-full p-6 md:p-8 flex flex-col justify-between z-20">
        <div className="flex justify-between items-center">
          <Badge className="bg-tertiary text-balck border-2 border-white backdrop-blur-xl px-4 py-5 rounded-full font-semibold tracking-tight text-2xl">
            <HugeiconsIcon icon={UserGroupIcon} className="mr-2 w-9 inline" />
            {event.registered_count} / {event.capacity}
          </Badge>
          <div className="flex items-center gap-2 text-black text-xs md:text-sm  xl:text-base font-semibold tracking-widest uppercase">
            <HugeiconsIcon
              icon={Calendar01Icon}
              strokeWidth={2}
              className="mr-2 inline fill-black/5"
            />
            {event.date}
          </div>
        </div>

        <div className="space-y-2">
          <div className="event-details space-y-0">
            <div className="flex flex-col md:flex-row gap-2 items-end">
              {isExpired && (
                <Badge
                  variant="destructive"
                  className="bg-red-500/20 py-3 font-semibold text-red-500 border-red-500/30 backdrop-blur-xl"
                >
                  Expirado
                </Badge>
              )}
              {isFull && (
                <Badge className="bg-orange-500/20 font-semibold  py-3 text-orange-500 border-orange-500/30 backdrop-blur-xl">
                  Cupo Lleno
                </Badge>
              )}
            </div>
            <h3
              className={`text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.9] tracking-tighter ${isBlocked ? "text-primary" : "text-white"}`}
            >
              {event.title}
            </h3>
          </div>

          <div className="card-title overflow-hidden"></div>
          <p className="text-sm md:text-base text-black line-clamp-2 leading-relaxed max-w-[85%] font-medium italic">
            "{event.description}"
          </p>

          {!isBlocked && (
            <Button
              variant={"main"}
              className="action-btn group/btn flex items-center gap-3 bg-primary text-white border-2 border-white px-8 py-7 rounded-full font-bold text-sm md:text-base xl:text-lg transition-all duration-500 hover:pr-10 shadow-xl "
            >
              Inscribirme
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="transition-transform duration-500 size-6 group-hover/btn:translate-x-2"
              />
            </Button>
          )}
        </div>
      </div>

      {/* Animated Strokes */}

      {!isBlocked && (
        <>
          <div className="svg-stroke svg-stroke-1 absolute inset-0 -translate-y-10 scale-[1.6] pointer-events-none">
            <svg viewBox="0 0 2453 2273" fill="none" className="w-full h-full">
              <path
                d="M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262"
                strokeWidth="200"
                strokeLinecap="round"
                fill="none"
                style={{ stroke: color }}
              />
            </svg>
          </div>

          <div className="svg-stroke svg-stroke-2 absolute inset-0 translate-y-10 scale-[1.4] pointer-events-none">
            <svg viewBox="0 0 2250 2535" fill="none" className="w-full h-full">
              <path
                d="M1661.28 2255.51C1661.28 2255.51 2311.09 1960.37 2111.78 1817.01C1944.47 1696.67 718.456 2870.17 499.781 2255.51C308.969 1719.17 2457.51 1613.83 2111.78 963.512C1766.05 313.198 427.949 2195.17 132.281 1455.51C-155.219 736.292 2014.78 891.514 1708.78 252.012C1437.81 -314.29 369.471 909.169 132.281 566.512C18.1772 401.672 244.781 193.012 244.781 193.012"
                strokeWidth="200"
                strokeLinecap="round"
                fill="none"
                style={{ stroke: BASE_STROKE }}
              />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}
