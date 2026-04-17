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

    if (!cardTitle || !infoContainer) return;

    const split = SplitText.create(cardTitle, {
      type: "words",
      mask: "words",
      wordsClass: "word",
    });

    gsap.set(split.words, { yPercent: 0 });
    gsap.set(cardTitle, { color: "#5d3fd3" });

    // Button starts hidden below the card (clipped by overflow-hidden)
    if (actionBtn) {
      gsap.set(actionBtn, { opacity: 0, y: 150 });
    }

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
            duration: 1.5,
            ease: "power2.out",
          },
          0,
        );
      });

      if (!isBlocked) {
        // Info container and button move simultaneously — button pushes content up
        tl.to(
          infoContainer,
          {
            y: -90,
            duration: 0.7,
            ease: "power3.out",
          },
          0.1,
        );

        // Color transition
        tl.to(
          cardTitle,
          {
            color: "#ffffff",
            duration: 0.4,
          },
          0.3,
        );

        // Button rises from below in sync with content — same start time, same ease
        if (actionBtn) {
          tl.to(
            actionBtn,
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
            },
            0.1,
          );
        }
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

      // Button drops down first, then content follows back
      if (actionBtn) {
        tl.to(
          actionBtn,
          {
            opacity: 0,
            y: 150,
            duration: 0.5,
            ease: "power3.in",
          },
          0,
        );
      }

      tl.to(
        infoContainer,
        {
          y: 0,
          duration: 0.6,
          ease: "power3.inOut",
        },
        0.1,
      );

      tl.to(
        cardTitle,
        {
          color: "#5d3fd3",
          duration: 0.4,
        },
        0.2,
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
      onClick={() => !isBlocked}
      className={`group relative min-h-[320px] md:aspect-square 2xl:aspect-5/4 border-2 border-white rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-[12px_12px_24px_#d3d1ca,-12px_-12px_24px_#ffffff] transition-all duration-700 ${
        isBlocked ? "cursor-not-allowed opacity-80" : "cursor-pointer"
      }`}
    >
      <div className="absolute inset-0 transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1 bg-background" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none " />

      <div className="relative h-full w-full p-5 sm:p-6 lg:p-8 flex flex-col justify-between z-20">
        {/* Header Badges */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-black text-base md:text-lg 2xl:text-xl font-bold tracking-widest uppercase">
            <HugeiconsIcon
              icon={Calendar01Icon}
              className="mr-1 lg:mr-2 inline size-5 md:size-7"
            />
            {event.date}
          </div>
          <div className="inline-flex items-center gap-3 bg-tertiary text-black border-2 border-white backdrop-blur-xl px-4 py-2 2xl:px-6 2xl:py-3 rounded-full font-bold tracking-tight text-xl sm:text-2xl xl:text-3xl shadow-sm">
            <HugeiconsIcon
              icon={UserGroupIcon}
              className="shrink-0 size-6 sm:size-8 text-black"
            />
            {event.registered_count} / {event.capacity}
          </div>
        </div>

        {/* Info Container moved to bottom */}
        <div className="info-container space-y-4 absolute  bottom-7 sm:bottom-10 left-8 right-8">
          <div className="event-details space-y-1">
            <div className="flex flex-wrap gap-2 mb-3">
              {isExpired && (
                <Badge
                  variant="destructive"
                  className="bg-red-500/20 py-4 px-5 font-bold text-red-600 border-red-500/40 backdrop-blur-md uppercase"
                >
                  Expirado
                </Badge>
              )}
              {isFull && (
                <Badge className="bg-orange-500/20 font-bold py-4 px-5 text-orange-600 border-orange-500/40 backdrop-blur-md uppercase">
                  Cupo Lleno
                </Badge>
              )}
            </div>
            <h3 className="text-[clamp(2rem,6vw,4.5rem)] font-black leading-[0.8] tracking-tighter">
              {event.title}
            </h3>
          </div>

          <p className="text-sm sm:text-base text-black line-clamp-2 leading-tight font-semibold ">
            {event.description}
          </p>
        </div>

        {!isBlocked && (
          <div
            className="action-btn absolute bottom-8 left-8 right-8"
            style={{ opacity: 0, transform: "translateY(150px)" }}
          >
            <Button
              variant="main"
              onClick={() => !isBlocked && onClick()}
              className="group/btn flex items-center justify-center gap-4 bg-primary text-white border-2 border-white w-full h-16 md:h-20 rounded-[2.5rem] font-bold text-xl  xl:text-2xl transition-all duration-500 hover:shadow-2xl shadow-xl"
            >
              Inscribirme ahora
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="transition-transform duration-500 size-7 group-hover/btn:translate-x-3"
              />
            </Button>
          </div>
        )}
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
