import type { Variants, Transition } from "framer-motion";
import { useStyleTheme } from "@/components/StyleThemeProvider";
import type { StyleThemeId } from "@/lib/styleThemes";

/* =================================================================
   Theme-specific animation configs
   ================================================================= */

type ThemeAnimationConfig = {
  fadeIn: Variants;
  fadeInLeft: Variants;
  fadeInRight: Variants;
  staggerContainer: Variants;
  staggerItem: Variants;
  slideUp: Variants;
  scaleIn: Variants;
  /** initial/animate/transition for AnimatedSection */
  section: {
    initial: Record<string, number>;
    animate: Record<string, number>;
    transition: Transition;
  };
};

const smoothCubic = [0.22, 1, 0.36, 1] as const;

const midnightAnimations: ThemeAnimationConfig = {
  fadeIn: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  },
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
  slideUp: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [...smoothCubic] },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  },
  section: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const executiveAnimations: ThemeAnimationConfig = {
  fadeIn: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [...smoothCubic] },
    },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [...smoothCubic] },
    },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [...smoothCubic] },
    },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  },
  staggerItem: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [...smoothCubic] },
    },
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [...smoothCubic] },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: [...smoothCubic] },
    },
  },
  section: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [...smoothCubic] },
  },
};

const coastalSpring = { type: "spring" as const, stiffness: 300, damping: 25 };

const coastalAnimations: ThemeAnimationConfig = {
  fadeIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: coastalSpring,
    },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -30, scale: 0.97 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: coastalSpring,
    },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 30, scale: 0.97 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: coastalSpring,
    },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  },
  staggerItem: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: coastalSpring,
    },
  },
  slideUp: {
    hidden: { opacity: 0, scale: 0.93 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: coastalSpring,
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: coastalSpring,
    },
  },
  section: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: coastalSpring,
  },
};

const roseAnimations: ThemeAnimationConfig = {
  fadeIn: {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [...smoothCubic] },
    },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [...smoothCubic] },
    },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [...smoothCubic] },
    },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  },
  staggerItem: {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [...smoothCubic] },
    },
  },
  slideUp: {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [...smoothCubic] },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [...smoothCubic] },
    },
  },
  section: {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.7, ease: [...smoothCubic] },
  },
};

/* =================================================================
   Public API
   ================================================================= */

const themeMap: Record<StyleThemeId, ThemeAnimationConfig> = {
  midnight: midnightAnimations,
  executive: executiveAnimations,
  coastal: coastalAnimations,
  rose: roseAnimations,
};

/** Get animation variants for a specific theme */
export function getThemeAnimations(theme: StyleThemeId): ThemeAnimationConfig {
  return themeMap[theme];
}

/** React hook — reads current style theme from context */
export function useThemeAnimations(): ThemeAnimationConfig {
  const { styleTheme } = useStyleTheme();
  return themeMap[styleTheme];
}

/* =================================================================
   Backwards-compatible default exports (aliased to Midnight)
   ================================================================= */

export const fadeIn: Variants = midnightAnimations.fadeIn;
export const fadeInLeft: Variants = midnightAnimations.fadeInLeft;
export const fadeInRight: Variants = midnightAnimations.fadeInRight;
export const staggerContainer: Variants = midnightAnimations.staggerContainer;
export const staggerItem: Variants = midnightAnimations.staggerItem;
export const scaleIn: Variants = midnightAnimations.scaleIn;
export const slideUp: Variants = midnightAnimations.slideUp;
