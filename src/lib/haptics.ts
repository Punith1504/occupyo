"use client";

/**
 * Triggers device haptic vibration (on supported devices like phones).
 * Falls back silently on desktop browsers.
 */
export function haptic(pattern: number | number[] = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

/** Light tap - like pressing a button */
export function hapticTap() {
  haptic(8);
}

/** Medium feedback - like a toggle switch */
export function hapticMedium() {
  haptic(15);
}

/** Success feedback - like completing an action */
export function hapticSuccess() {
  haptic([10, 50, 10]);
}

/** Error feedback */
export function hapticError() {
  haptic([30, 50, 30, 50, 30]);
}
