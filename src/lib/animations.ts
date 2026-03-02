import type { Variants, Transition } from "framer-motion";

type AnimationConfig = {
  fadeIn: Variants;
  fadeInLeft: Variants;
  fadeInRight: Variants;
  staggerContainer: Variants;
  staggerItem: Variants;
  slideUp: Variants;
  scaleIn: Variants;
  section: {
    initial: Record<string, number>;
    animate: Record<string, number>;
    transition: Transition;
  };
};

const smoothCubic = [0.22, 1, 0.36, 1] as const;

const animations: AnimationConfig = {
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

/** React hook — returns animation variants */
export function useThemeAnimations(): AnimationConfig {
  return animations;
}

export const fadeIn: Variants = animations.fadeIn;
export const fadeInLeft: Variants = animations.fadeInLeft;
export const fadeInRight: Variants = animations.fadeInRight;
export const staggerContainer: Variants = animations.staggerContainer;
export const staggerItem: Variants = animations.staggerItem;
export const scaleIn: Variants = animations.scaleIn;
export const slideUp: Variants = animations.slideUp;
