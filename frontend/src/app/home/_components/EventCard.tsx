import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(SplitText);

type CardType = {
  id: string;
  title: string;
  image: string;
};

const cards: CardType[] = [
  { id: "card-1", title: "Synthetic Silhouette", image: "/img1.jpg" },
  { id: "card-2", title: "Red Form Study", image: "/img2.jpg" },
  { id: "card-3", title: "Material Pause", image: "/img3.jpg" },
  { id: "card-4", title: "Obscured Profile", image: "/img4.jpg" },
  { id: "card-5", title: "Muted Presence", image: "/img5.jpg" },
  { id: "card-6", title: "Spatial Balance", image: "/img6.jpg" },
];

function chunkArray<T>(arr: T[], size: number) {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function Cards() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const cardContainers =
      containerRef.current.querySelectorAll(".card-container");

    cardContainers.forEach((cardContainer) => {
      const cardPaths =
        cardContainer.querySelectorAll<SVGPathElement>(".svg-stroke path");
      const cardTitle = cardContainer.querySelector("h3");

      if (!cardTitle) return;

      const split = SplitText.create(cardTitle, {
        type: "words",
        mask: "words",
        wordsClass: "word",
      });

      gsap.set(split.words, { yPercent: 100 });

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
              attr: { "stroke-width": 700 },
              duration: 1.5,
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
      };

      cardContainer.addEventListener("mouseenter", handleEnter);
      cardContainer.addEventListener("mouseleave", handleLeave);

      return () => {
        cardContainer.removeEventListener("mouseenter", handleEnter);
        cardContainer.removeEventListener("mouseleave", handleLeave);
      };
    });
  }, []);

  const rows = chunkArray(cards, 2);

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      {rows.map((row, i) => (
        <div
          className="row w-full px-4 mb-4 flex flex-col min-[1001px]:flex-row gap-4"
          key={i}
        >
          {row.map((card) => (
            <div
              className="card-container relative flex-1 aspect-square rounded-2xl overflow-hidden cursor-pointer"
              id={card.id}
              key={card.id}
            >
              <div className="card-img w-full h-full">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* SVG 1 */}
              <div className="svg-stroke svg-stroke-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[1.5] w-full h-full pointer-events-none">
                <svg viewBox="0 0 2453 2273" fill="none" className="w-full h-full">
                  <path
                    d="M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262"
                    strokeWidth="200"
                    strokeLinecap="round"
                    fill="none"
                    style={{
                      stroke: `var(--card-${card.id.split("-")[1]}-stroke)`,
                    }}
                  />
                </svg>
              </div>

              {/* SVG 2 */}
              <div className="svg-stroke svg-stroke-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[1.5] w-full h-full pointer-events-none">
                <svg viewBox="0 0 2250 2535" fill="none" className="w-full h-full">
                  <path
                    d="M1661.28 2255.51C1661.28 2255.51 2311.09 1960.37 2111.78 1817.01C1944.47 1696.67 718.456 2870.17 499.781 2255.51C308.969 1719.17 2457.51 1613.83 2111.78 963.512C1766.05 313.198 427.949 2195.17 132.281 1455.51C-155.219 736.292 2014.78 891.514 1708.78 252.012C1437.81 -314.29 369.471 909.169 132.281 566.512C18.1772 401.672 244.781 193.012 244.781 193.012"
                    strokeWidth="200"
                    strokeLinecap="round"
                    fill="none"
                    style={{ stroke: "var(--card-base-stroke)" }}
                  />
                </svg>
              </div>

              <div className="card-title absolute bottom-8 left-8 text-[var(--card-copy)]">
                <h3 className="text-[clamp(1.5rem,2.5vw,2.5rem)] font-[450] leading-tight tracking-tight">
                  {card.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
