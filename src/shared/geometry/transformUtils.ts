import type { EditorBounds, ResizeLimits } from "../../features/manager-hub/floor-editor/domain/layoutTypes";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function clampPosition(x: number, y: number, bounds: EditorBounds): { x: number; y: number } {
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, y)),
  };
}

export function clampSize(
  width: number,
  height: number,
  limits: ResizeLimits,
): { width: number; height: number } {
  return {
    width: Math.min(limits.maxWidth, Math.max(limits.minWidth, width)),
    height: Math.min(limits.maxHeight, Math.max(limits.minHeight, height)),
  };
}

export function clampRectToBounds(rect: Rect, bounds: EditorBounds): Rect {
  const x = Math.min(bounds.maxX - rect.width, Math.max(bounds.minX, rect.x));
  const y = Math.min(bounds.maxY - rect.height, Math.max(bounds.minY, rect.y));
  return { ...rect, x, y };
}

export function normalizeRotation(degrees: number): number {
  const normalized = degrees % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}
