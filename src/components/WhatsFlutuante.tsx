import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { linkWhatsApp } from "../lib/contato";
import { IconeWhats } from "./Icones";

export function WhatsFlutuante() {
  const { scrollY } = useScroll();
  const [ver, setVer] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setVer(y > window.innerHeight * 0.8));
  return (
    <AnimatePresence>
      {ver && (
        <motion.a
          className="whats-flutuante"
          href={linkWhatsApp()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar no WhatsApp"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 90 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <IconeWhats size={28} />
          <span className="whats-pulso" aria-hidden="true" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
