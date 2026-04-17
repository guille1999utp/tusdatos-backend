"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Badge } from "@/components/ui/badge";

gsap.registerPlugin(SplitText);

const STROKE_COLORS = ["#583cd6", "#defd99", "#f0ede6"];

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

    gsap.set(split.words, { yPercent: 100 });
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
            duration: 0.9,
            ease: "power2.out",
          },
          0,
        );
      });

      tl.to(
        split.words,
        {
          yPercent: 0,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.075,
        },
        0.35,
      );

      if (!isBlocked) {
        tl.to(
          actionBtn,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "back.out(1.7)",
          },
          0.5,
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
        split.words,
        {
          yPercent: 100,
          duration: 0.5,
          ease: "power3.out",
          stagger: { each: 0.05, from: "end" },
        },
        0,
      );

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

  return (
    <div
      ref={cardRef}
      id={`card-${event.id}`}
      onClick={() => !isBlocked && onClick()}
      className={`card-container relative aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 bg-black ${
        isBlocked
          ? "cursor-not-allowed opacity-90"
          : "cursor-pointer active:scale-95"
      }`}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 transition-transform duration-700 ${
          isBlocked ? "grayscale brightness-50" : "group-hover:scale-110"
        }`}
        style={{
          background: isBlocked
            ? "linear-gradient(45deg, #1f2937, #111827)"
            : `linear-gradient(135deg, ${STROKE_COLORS[index % STROKE_COLORS.length]}dd, #000000)`,
        }}
      />

      {/* Content Overlay */}
      <div className="relative h-full w-full p-8 flex flex-col justify-between z-20">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">
              {event.date}
            </span>
            <p className="text-sm text-white/80 line-clamp-2 max-w-[200px]">
              {event.description}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end text-sm">
            {isExpired && (
              <Badge
                variant="destructive"
                className="bg-red-500/20 text-red-400 border-red-500/50 backdrop-blur-md"
              >
                Expirado
              </Badge>
            )}
            {isFull && (
              <Badge
                variant="secondary"
                className="bg-amber-500/20 text-amber-400 border-amber-500/50 backdrop-blur-md"
              >
                Cupo Lleno
              </Badge>
            )}
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md">
              {event.registered_count} / {event.capacity}
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-title overflow-hidden">
            <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">
              {event.title}
            </h3>
          </div>

          <button
            className={`action-btn px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 shadow-xl ${
              isBlocked
                ? "bg-white/10 text-white/30 hidden"
                : "bg-white text-black hover:bg-tertiary hover:scale-105"
            }`}
          >
            Inscribirme ahora
          </button>
        </div>
      </div>

      {/* SVG 1 - Accent Stroke */}
      <div className="svg-stroke svg-stroke-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[1.5] w-full h-full pointer-events-none">
        <svg viewBox="0 0 2453 2273" fill="none" className="w-full h-full">
          <path
            d="M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262"
            strokeWidth="200"
            strokeLinecap="round"
            fill="none"
            style={{
              stroke: STROKE_COLORS[index % STROKE_COLORS.length],
            }}
          />
        </svg>
      </div>

      {/* SVG 2 - Base Stroke */}
      <div className="svg-stroke svg-stroke-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[1.3] w-full h-full pointer-events-none ">
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
    </div>
  );
}
