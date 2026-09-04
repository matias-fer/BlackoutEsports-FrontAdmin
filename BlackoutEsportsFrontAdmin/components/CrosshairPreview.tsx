import { Crosshair } from "@/lib/types";
import styles from "./CrosshairPreview.module.css";

export default function CrosshairPreview({ crosshair }: { crosshair: Crosshair }) {
  const armLength = crosshair.size * 2;
  const gap = crosshair.gap * 2;
  const thickness = crosshair.thickness * 2;

  const armStyle = {
    "--crosshair-color": crosshair.color,
    "--crosshair-opacity": crosshair.opacity,
    "--crosshair-outline": crosshair.outline ? "0 0 0 1px rgba(0,0,0,0.6)" : "none",
    "--crosshair-length": `${armLength}px`,
    "--crosshair-thickness": `${thickness}px`,
    "--crosshair-top": `${40 - gap - armLength}px`,
    "--crosshair-bottom": `${40 + gap}px`,
    "--crosshair-left": `${40 - gap - armLength}px`,
    "--crosshair-right": `${40 + gap}px`,
  } as React.CSSProperties;

  return (
    <div className={styles.preview}>
      <div className={styles.canvas}>
        <div className={`${styles.arm} ${styles.top}`} style={armStyle} />
        <div className={`${styles.arm} ${styles.bottom}`} style={armStyle} />
        <div className={`${styles.arm} ${styles.left}`} style={armStyle} />
        <div className={`${styles.arm} ${styles.right}`} style={armStyle} />
        {crosshair.centerDot && <div className={`${styles.arm} ${styles.centerDot}`} style={armStyle} />}
      </div>
    </div>
  );
}
