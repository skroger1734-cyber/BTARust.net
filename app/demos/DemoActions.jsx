"use client";

import { useState } from "react";
import styles from "./demos.module.css";

export default function DemoActions({
  videoUrl,
  videoSize,
  playerName,
  eventName
}) {
  const [status, setStatus] = useState("");

  async function shareVideo() {
    const title = `${eventName} · ${playerName || "BTA player"}`;
    setStatus("Preparing share…");
    try {
      if (
        navigator.share &&
        navigator.canShare &&
        Number(videoSize || 0) <= 200 * 1024 * 1024
      ) {
        const response = await fetch(videoUrl);
        if (response.ok) {
          const file = new File(
            [await response.blob()],
            `${title.replace(/[^a-z0-9._-]+/gi, "_")}.mp4`,
            { type: "video/mp4" }
          );
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ title, files: [file] });
            setStatus("");
            return;
          }
        }
      }

      if (navigator.share) {
        await navigator.share({
          title,
          text: "BTA Rust event demo video",
          url: videoUrl
        });
        setStatus("");
        return;
      }

      await navigator.clipboard.writeText(videoUrl);
      setStatus("Video link copied.");
    } catch (error) {
      if (error?.name === "AbortError") {
        setStatus("");
        return;
      }
      try {
        await navigator.clipboard.writeText(videoUrl);
        setStatus("Video link copied.");
      } catch {
        setStatus("Use Download MP4 to share this video.");
      }
    }
  }

  return (
    <div className={styles.videoActions}>
      <a
        className={styles.capcut}
        href="https://www.capcut.com/tools/online-video-editor"
        target="_blank"
        rel="noreferrer"
      >
        Edit in CapCut
      </a>
      <button type="button" onClick={shareVideo}>
        Share video
      </button>
      {status ? <span role="status">{status}</span> : null}
    </div>
  );
}
