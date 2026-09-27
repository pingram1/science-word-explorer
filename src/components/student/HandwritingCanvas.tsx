"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface StrokePoint {
  x: number;
  y: number;
}

export interface Stroke {
  points: StrokePoint[];
}

export interface HandwritingCanvasProps {
  onChange: (strokes: Stroke[]) => void;
  className?: string;
  disabled?: boolean;
}

export function HandwritingCanvas({
  onChange,
  className,
  disabled = false,
}: HandwritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);
  const isDrawingRef = useRef(false);

  const redraw = useCallback(
    (strokeData: Stroke[], activePoints: StrokePoint[] = []) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#1a2e3b";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const drawPath = (points: StrokePoint[]) => {
        if (points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
      };

      for (const stroke of strokeData) {
        drawPath(stroke.points);
      }
      drawPath(activePoints);
    },
    [],
  );

  useEffect(() => {
    redraw(strokes, currentStroke);
  }, [strokes, currentStroke, redraw]);

  useEffect(() => {
    onChange(strokes);
  }, [strokes, onChange]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>): StrokePoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    isDrawingRef.current = true;
    canvasRef.current?.setPointerCapture(event.pointerId);
    setCurrentStroke([getPoint(event)]);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || disabled) return;
    setCurrentStroke((prev) => [...prev, getPoint(event)]);
  };

  const finishStroke = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentStroke.length > 0) {
      setStrokes((prev) => [...prev, { points: currentStroke }]);
    }
    setCurrentStroke([]);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="w-full touch-none rounded-xl border-2 border-border bg-white"
        aria-label="Handwriting canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={disabled || strokes.length === 0}
          aria-label="Undo last stroke"
        >
          <Undo2 className="size-4" aria-hidden="true" />
          Undo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={disabled || strokes.length === 0}
          aria-label="Clear canvas"
        >
          <Eraser className="size-4" aria-hidden="true" />
          Clear
        </Button>
      </div>
    </div>
  );
}
