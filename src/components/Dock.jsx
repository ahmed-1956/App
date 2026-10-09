import "./Dock.css";
import "./dock-size.css";
import { useEffect, useRef, useState } from "react";
import {
  Calendar03Icon,
  Task01Icon,
  ChartLineData01Icon,
  Notebook01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const ITEMS = [
  { id: "today", label: "اليوم", icon: Calendar03Icon },
  { id: "tasks", label: "المهام", icon: Task01Icon },
  { id: "progress", label: "التقدم", icon: ChartLineData01Icon },
  { id: "journal", label: "اليوميات", icon: Notebook01Icon },
];

const BASE_SIZE = 48;
const MAX_SIZE = 68;
const INFLUENCE_DISTANCE = 125;

function Icon({ icon }) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={25}
      strokeWidth={1.7}
      aria-hidden="true"
    />
  );
}

export default function Dock({
  activeId = "today",
  onSelect = () => {},
}) {
  const dockRef = useRef(null);
  const itemRefs = useRef([]);
  const animationRef = useRef(null);
  const pointerX = useRef(null);
  const sizes = useRef(ITEMS.map(() => BASE_SIZE));

  const [renderSizes, setRenderSizes] = useState(sizes.current);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      const next = ITEMS.map((_, index) => {
        const element = itemRefs.current[index];
        if (!element || pointerX.current === null) {
          return BASE_SIZE;
        }

        const rect = element.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const distance = Math.abs(pointerX.current - center);
        const influence = Math.max(
          0,
          1 - distance / INFLUENCE_DISTANCE
        );

        return BASE_SIZE + (MAX_SIZE - BASE_SIZE) * influence;
      });

      sizes.current = next;
      setRenderSizes(next);
      return;
    }

    let running = true;

    const animate = () => {
      if (!running) return;

      const dockRect = dockRef.current?.getBoundingClientRect();
      if (!dockRect) return;

      const next = ITEMS.map((_, index) => {
        const element = itemRefs.current[index];

        if (!element || pointerX.current === null) {
          return BASE_SIZE;
        }

        const rect = element.getBoundingClientRect();
        const center =
          rect.left - dockRect.left + rect.width / 2;
        const distance = Math.abs(pointerX.current - center);
        const influence = Math.max(
          0,
          1 - distance / INFLUENCE_DISTANCE
        );

        return BASE_SIZE + (MAX_SIZE - BASE_SIZE) * influence;
      });

      let moving = false;

      const smoothed = next.map((target, index) => {
        const current = sizes.current[index];
        const value = current + (target - current) * 0.24;

        if (Math.abs(target - value) > 0.15) moving = true;

        return value;
      });

      sizes.current = smoothed;
      setRenderSizes(smoothed);

      if (moving) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        sizes.current = next;
        setRenderSizes(next);
      }
    };

    const startAnimation = () => {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    startAnimation();

    return () => {
      running = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [reducedMotion]);

  function updatePointer(event) {
    if (event.pointerType === "touch") return;

    const rect = dockRef.current?.getBoundingClientRect();
    if (!rect) return;

    pointerX.current = event.clientX - rect.left;

    if (reducedMotion) {
      const next = ITEMS.map((_, index) => {
        const element = itemRefs.current[index];
        if (!element) return BASE_SIZE;

        const itemRect = element.getBoundingClientRect();
        const center =
          itemRect.left - rect.left + itemRect.width / 2;
        const distance = Math.abs(pointerX.current - center);
        const influence = Math.max(
          0,
          1 - distance / INFLUENCE_DISTANCE
        );

        return BASE_SIZE + (MAX_SIZE - BASE_SIZE) * influence;
      });

      sizes.current = next;
      setRenderSizes(next);
      return;
    }

    cancelAnimationFrame(animationRef.current);

    const animate = () => {
      const dockRect = dockRef.current?.getBoundingClientRect();
      if (!dockRect) return;

      let moving = false;

      const next = ITEMS.map((_, index) => {
        const element = itemRefs.current[index];
        if (!element || pointerX.current === null) {
          const value =
            sizes.current[index] +
            (BASE_SIZE - sizes.current[index]) * 0.24;

          if (Math.abs(BASE_SIZE - value) > 0.15) moving = true;
          return value;
        }

        const itemRect = element.getBoundingClientRect();
        const center =
          itemRect.left - dockRect.left + itemRect.width / 2;
        const distance = Math.abs(pointerX.current - center);
        const influence = Math.max(
          0,
          1 - distance / INFLUENCE_DISTANCE
        );
        const target =
          BASE_SIZE + (MAX_SIZE - BASE_SIZE) * influence;
        const value =
          sizes.current[index] + (target - sizes.current[index]) * 0.24;

        if (Math.abs(target - value) > 0.15) moving = true;
        return value;
      });

      sizes.current = next;
      setRenderSizes(next);

      if (moving) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }

  function resetPointer() {
    pointerX.current = null;
    cancelAnimationFrame(animationRef.current);

    const animateBack = () => {
      const next = sizes.current.map(
        (current) => current + (BASE_SIZE - current) * 0.24
      );

      const moving = next.some(
        (value) => Math.abs(BASE_SIZE - value) > 0.15
      );

      sizes.current = moving
        ? next
        : ITEMS.map(() => BASE_SIZE);

      setRenderSizes(sizes.current);

      if (moving) {
        animationRef.current = requestAnimationFrame(animateBack);
      }
    };

    if (reducedMotion) {
      sizes.current = ITEMS.map(() => BASE_SIZE);
      setRenderSizes(sizes.current);
    } else {
      animationRef.current = requestAnimationFrame(animateBack);
    }
  }

  return (
    <nav
      ref={dockRef}
      className="dock"
      aria-label="التنقل الرئيسي"
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
    >
      {ITEMS.map((item, index) => {
        const active = activeId === item.id;

        return (
          <button
            key={item.id}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
            className={`dock-item${active ? " is-active" : ""}`}
            style={{
              width: `${renderSizes[index]}px`,
              height: `${renderSizes[index]}px`,
            }}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            onClick={() => onSelect(item.id)}
          >
            <span className="dock-icon">
              <Icon icon={item.icon} />
            </span>

      <span className="dock-label">{item.label}</span>

      {active && (
              <span className="dock-indicator" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
