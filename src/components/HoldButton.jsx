import { useEffect, useRef } from "react";
import "./HoldButton.css";

export default function HoldButton({
  children = "حذف",
  onClick,
  ariaLabel,
  backgroundColor = "#27272a",
  fillColor = "#ff0000",
  textColor = "#f5f5f5",
  fillTextColor = "#ffffff",
  size = "md",
  radius = 30,
  fillDirection = "up",
  releaseTime = 220,
  pressScale = 0.945,
  wave = true,
  waveAmplitude = 9,
  glow = true,
}) {
  const buttonRef = useRef(null);
  const rafRef = useRef(0);
  const timerRef = useRef(0);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    const measure = () => {
      button.style.setProperty("--hb-w", `${button.offsetWidth}px`);
      button.style.setProperty("--hb-h", `${button.offsetHeight}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(button);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, []);

  function animateFill() {
    const button = buttonRef.current;
    if (!button) return;
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);

    const start = performance.now();
    const duration = 300;
    button.dataset.animating = "true";

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      button.style.setProperty("--hb-p", eased.toFixed(4));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        timerRef.current = setTimeout(() => {
          const resetStart = performance.now();
          const reset = (now2) => {
            const t2 = Math.min(1, (now2 - resetStart) / releaseTime);
            const eased2 = 1 - Math.pow(1 - t2, 3);
            button.style.setProperty("--hb-p", (1 - eased2).toFixed(4));
            if (t2 < 1) {
              rafRef.current = requestAnimationFrame(reset);
            } else {
              button.dataset.animating = "false";
              button.style.setProperty("--hb-p", "0");
            }
          };
          rafRef.current = requestAnimationFrame(reset);
        }, 220);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`hold-button hold-button--${size}`}
      aria-label={ariaLabel}
      onClick={(event) => {
        animateFill();
        onClick?.(event);
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse" || event.button === 0) {
          buttonRef.current?.style.setProperty("--hb-pressed", "1");
        }
      }}
      onPointerUp={() => buttonRef.current?.style.setProperty("--hb-pressed", "0")}
      onPointerCancel={() => buttonRef.current?.style.setProperty("--hb-pressed", "0")}
      onPointerLeave={() => buttonRef.current?.style.setProperty("--hb-pressed", "0")}
      style={{
        "--hb-radius": `${radius}px`,
        "--hb-bg": backgroundColor,
        "--hb-fill": fillColor,
        "--hb-text": textColor,
        "--hb-fill-text": fillTextColor,
        "--hb-release": `${releaseTime}ms`,
        "--hb-press": pressScale,
        "--hb-wave": `${wave ? waveAmplitude : 0}px`,
      }}
    >
      <span className="hold-button__pulse" aria-hidden="true" />
      <span className="hold-button__label">{children}</span>
      <span className="hold-button__clip" aria-hidden="true">
        <span className="hold-button__fill">
          <span className="hold-button__label hold-button__label--fill">{children}</span>
        </span>
        <span className="hold-button__crest" />
      </span>
    </button>
  );
}
