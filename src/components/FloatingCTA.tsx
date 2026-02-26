"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function FloatingCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show on the contact page itself
  if (pathname === "/contact") return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed right-6 bottom-6 z-50"
        >
          <Link
            href="/contact"
            className="group flex items-center gap-2 rounded-full gradient-btn px-5 py-3 text-sm font-medium shadow-lg"
          >
            <MessageSquare
              size={16}
              className="transition-transform group-hover:scale-110"
            />
            Let&apos;s Talk
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
