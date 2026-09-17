"use client";
import { useEffect, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { MathUtils } from "three";

// Interaction is independent of the render loop so each scene owns its motion.
export function useCanDrag(resetKey = 0) {
  const state = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startYaw: 0,
    startPitch: 0,
    yaw: 0,
    pitch: 0,
    velocity: 0,
    lastX: 0,
    lastTime: 0,
  });
  useEffect(() => {
    state.current.yaw = 0;
    state.current.pitch = 0;
    state.current.velocity = 0;
  }, [resetKey]);
  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );
  const release = (event: ThreeEvent<PointerEvent>) => {
    state.current.active = false;
    (event.target as unknown as Element).releasePointerCapture?.(
      event.pointerId,
    );
    document.body.style.cursor = "grab";
  };
  return {
    state,
    settle(delta: number) {
      const s = state.current;
      if (s.active) return;
      s.velocity = MathUtils.damp(s.velocity, 0, 9, delta);
      s.yaw = MathUtils.clamp(s.yaw + s.velocity * delta, -1.2, 1.2);
      s.yaw = MathUtils.damp(s.yaw, 0, 1.6, delta);
      s.pitch = MathUtils.damp(s.pitch, 0, 2, delta);
    },
    handlers: {
      onPointerDown(event: ThreeEvent<PointerEvent>) {
        event.stopPropagation();
        const s = state.current;
        s.active = true;
        s.startX = event.clientX;
        s.startY = event.clientY;
        s.startYaw = s.yaw;
        s.startPitch = s.pitch;
        s.lastX = event.clientX;
        s.lastTime = performance.now();
        s.velocity = 0;
        (event.target as unknown as Element).setPointerCapture?.(
          event.pointerId,
        );
        document.body.style.cursor = "grabbing";
      },
      onPointerMove(event: ThreeEvent<PointerEvent>) {
        const s = state.current;
        if (!s.active) return;
        event.stopPropagation();
        const now = performance.now();
        s.yaw = MathUtils.clamp(
          s.startYaw + (event.clientX - s.startX) * 0.009,
          -1.2,
          1.2,
        );
        s.pitch = MathUtils.clamp(
          s.startPitch + (event.clientY - s.startY) * 0.005,
          -0.42,
          0.42,
        );
        s.velocity = MathUtils.clamp(
          ((event.clientX - s.lastX) * 0.009) /
            Math.max((now - s.lastTime) / 1000, 0.016),
          -2,
          2,
        );
        s.lastX = event.clientX;
        s.lastTime = now;
      },
      onPointerUp: release,
      onPointerCancel: release,
      onPointerOver() {
        document.body.style.cursor = "grab";
      },
      onPointerOut() {
        if (!state.current.active) document.body.style.cursor = "";
      },
    },
  };
}
