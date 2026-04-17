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
    const infoContainer = cardContainer.querySelector(".info-container");

    if (!cardTitle || !actionBtn || !infoContainer) return;

    const split = SplitText.create(cardTitle, {
      type: "words",
      mask: "words",
      wordsClass: "word",
    });

    gsap.set(split.words, { yPercent: 0 });
    gsap.set(actionBtn, { opacity: 0, y: 20 });
    gsap.set(cardTitle, { color: "#5d3fd3" }); // Direct primary color for initialization

    cardPaths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    });

    let tl: gsap.core.Timeline | null = null;

    const handleEnter = () => {
      if (tl) tl.kill();
      tl = gsap.timeline();

      // Strokes
      cardPaths.forEach((path) => {
        tl!.to(
          path,
          {
            strokeDashoffset: 0,
            attr: { "stroke-width": 750 },
            duration: 1.3,
            ease: "power2.out",
          },
          0,
        );
      });

      if (!isBlocked) {
        // Displacement up
        tl.to(
          infoContainer,
          {
            y: -100,
            duration: 0.7,
            ease: "power3.out",
          },
          0.1,
        );

        // Color transition at 50%
        tl.to(
          cardTitle,
          {
            color: "#ffffff",
            duration: 0.4,
          },
          0.3,
        );

        // Show Button
        tl.to(
          actionBtn,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.7)",
          },
          0.3,
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
            ease: "power2.inOut",
          },
          0,
        );
      });

      // Restore displacement
      tl.to(
        infoContainer,
        {
          y: 0,
          duration: 0.6,
          ease: "power3.inOut",
        },
        0,
      );

      // Restore color
      tl.to(
        cardTitle,
        {
          color: "#5d3fd3",
          duration: 0.4,
        },
        0.2,
      );

      tl.to(
        actionBtn,
        {
          opacity: 0,
          y: 50,
          duration: 0.4,
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
      className={`group relative aspect-square border-2 border-white rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-[12px_12px_24px_#d3d1ca,-12px_-12px_24px_#ffffff] transition-all duration-700 ${
        isBlocked ? "cursor-not-allowed opacity-80" : "cursor-pointer"
      }`}
    >
      <div className="absolute inset-0 transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1 bg-background" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none " />

      <div className="relative h-full w-full p-6 sm:p-8 flex flex-col justify-between z-20">
        {/* Header Badges */}
        <div className="flex justify-between items-center">
          <Badge className="bg-tertiary text-black border-2 border-white backdrop-blur-xl px-4 py-5 md:py-6 rounded-full font-bold tracking-tight text-2xl md:text-3xl shadow-sm">
            <HugeiconsIcon
              icon={UserGroupIcon}
              className="mr-3 size-12 inline-block text-black"
            />
            {event.registered_count} / {event.capacity}
          </Badge>
          <div className="flex items-center gap-2 text-black text-base md:text-lg font-bold tracking-widest uppercase">
            <HugeiconsIcon
              icon={Calendar01Icon}
              className="mr-1 sm:mr-2 inline size-5"
            />
            {event.date}
          </div>
        </div>

        {/* Info Container moved to bottom */}
        <div className="info-container space-y-4 absolute bottom-10 left-8 right-8">
          <div className="event-details space-y-1">
            <div className="flex flex-wrap gap-2 mb-3">
              {isExpired && (
                <Badge
                  variant="destructive"
                  className="bg-red-500/20 py-3 px-5 font-bold text-red-600 border-red-500/40"
                >
                  Expirado
                </Badge>
              )}
              {isFull && (
                <Badge className="bg-orange-500/20 font-bold py-3 px-5 text-orange-600 border-orange-500/40">
                  Cupo Lleno
                </Badge>
              )}
            </div>
            <h3 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.8] tracking-tighter">
              {event.title}
            </h3>
          </div>

          <p className="text-base text-black/80 line-clamp-2 leading-tight font-semibold ">
            "{event.description}"
          </p>

          {!isBlocked && (
            <div className="pt-6">
              <Button
                variant="main"
                className="action-btn group/btn flex items-center justify-center gap-4 bg-primary text-white border-4 border-white w-full h-24 rounded-[2.5rem] font-black text-2xl transition-all duration-500 hover:shadow-2xl shadow-xl"
              >
                Inscribirme ahora
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="transition-transform duration-500 size-8 group-hover/btn:translate-x-3"
                />
              </Button>
            </div>
          )}
        </div>
      </div>

      {!isBlocked && (
        <>
          <div className="svg-stroke svg-stroke-1 absolute inset-0 scale-[1.7] pointer-events-none ">
            <svg viewBox="0 0 2453 2273" fill="none" className="w-full h-full">
              <path
                d="M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262"
                strokeWidth="220"
                strokeLinecap="round"
                fill="none"
                style={{ stroke: color }}
              />
            </svg>
          </div>
          <div className="svg-stroke svg-stroke-2 absolute inset-0 scale-[1.5] pointer-events-none">
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
