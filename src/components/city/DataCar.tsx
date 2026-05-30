
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CarSprite } from './CarSprite';

const ROAD_VERTICALS = [130, 400, 600] as const;
const ROAD_HORIZONTALS = [300, 450] as const;
const ROAD_BOUNDS = {
  minX: 100,
  maxX: 700,
  minY: 100,
  maxY: 650,
} as const;

interface DataCarProps {
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  color: string;
  label: string;
  duration: number;
}

export const DataCar = ({ startPos, endPos, color, label, duration }: DataCarProps) => {
  const path = useMemo(() => buildRoadPath(startPos, endPos), [endPos, startPos]);
  const [state, setState] = useState(() => ({
    pos: path[0] ?? startPos,
    angle: getSegmentAngle(path[0] ?? startPos, path[1] ?? endPos),
    visible: false,
  }));

  useEffect(() => {
    let frameId = 0;
    let startTime = 0;
    const segments = createSegments(path);
    const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);

    setState({
      pos: path[0] ?? startPos,
      angle: getSegmentAngle(path[0] ?? startPos, path[1] ?? endPos),
      visible: true,
    });

    const step = (timestamp: number) => {
      if (startTime === 0) {
        startTime = timestamp;
      }

      const elapsed = Math.min(timestamp - startTime, duration);
      const distanceTravelled = totalLength === 0 ? 0 : (elapsed / duration) * totalLength;

      let covered = 0;
      let nextState = {
        pos: endPos,
        angle: getSegmentAngle(path[path.length - 2] ?? startPos, path[path.length - 1] ?? endPos),
        visible: true,
      };

      for (const segment of segments) {
        const segmentEnd = covered + segment.length;
        if (distanceTravelled <= segmentEnd) {
          const localProgress = segment.length === 0 ? 1 : (distanceTravelled - covered) / segment.length;
          nextState = {
            pos: {
              x: segment.from.x + (segment.to.x - segment.from.x) * localProgress,
              y: segment.from.y + (segment.to.y - segment.from.y) * localProgress,
            },
            angle: getSegmentAngle(segment.from, segment.to),
            visible: true,
          };
          break;
        }
        covered = segmentEnd;
      }

      setState(nextState);

      if (elapsed < duration) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [duration, endPos, path, startPos]);

  return (
    <div
      className="absolute z-[100] flex items-center justify-center"
      style={{
        left: `${state.pos.x}px`,
        top: `${state.pos.y}px`,
        transform: `translate(-50%, -50%) rotate(${state.angle}deg)`,
        opacity: state.visible ? 1 : 0,
      }}
    >
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-code font-bold text-white shadow-md">
        {label}
      </div>
      <CarSprite color={color} label="" />
    </div>
  );
};

function buildRoadPath(startPos: { x: number; y: number }, endPos: { x: number; y: number }) {
  const startAccess = getRoadAccessPoint(startPos);
  const endAccess = getRoadAccessPoint(endPos);
  const roadPoints: { x: number; y: number }[] = [startPos, startAccess.point];

  if (startAccess.kind === 'vertical' && endAccess.kind === 'vertical') {
    const viaY = getNearestValue(
      ROAD_HORIZONTALS,
      (startAccess.point.y + endAccess.point.y) / 2
    );
    roadPoints.push(
      { x: startAccess.line, y: viaY },
      { x: endAccess.line, y: viaY }
    );
  } else if (startAccess.kind === 'horizontal' && endAccess.kind === 'horizontal') {
    const viaX = getNearestValue(
      ROAD_VERTICALS,
      (startAccess.point.x + endAccess.point.x) / 2
    );
    roadPoints.push(
      { x: viaX, y: startAccess.line },
      { x: viaX, y: endAccess.line }
    );
  } else if (startAccess.kind === 'vertical' && endAccess.kind === 'horizontal') {
    roadPoints.push({ x: startAccess.line, y: endAccess.line });
  } else {
    roadPoints.push({ x: endAccess.line, y: startAccess.line });
  }

  roadPoints.push(endAccess.point, endPos);

  return roadPoints.filter((point, index, points) => {
    if (index === 0) return true;
    const previous = points[index - 1];
    return previous.x !== point.x || previous.y !== point.y;
  });
}

function createSegments(points: { x: number; y: number }[]) {
  return points.slice(0, -1).map((point, index) => ({
    from: point,
    to: points[index + 1],
    length: Math.hypot(points[index + 1].x - point.x, points[index + 1].y - point.y),
  }));
}

function getSegmentAngle(from: { x: number; y: number }, to: { x: number; y: number }) {
  return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
}

function getRoadAccessPoint(pos: { x: number; y: number }) {
  const verticalLine = getNearestValue(ROAD_VERTICALS, pos.x);
  const horizontalLine = getNearestValue(ROAD_HORIZONTALS, pos.y);

  const verticalPoint = {
    x: verticalLine,
    y: clamp(pos.y, ROAD_BOUNDS.minY, ROAD_BOUNDS.maxY),
  };
  const horizontalPoint = {
    x: clamp(pos.x, ROAD_BOUNDS.minX, ROAD_BOUNDS.maxX),
    y: horizontalLine,
  };

  const verticalDistance = Math.abs(pos.x - verticalLine);
  const horizontalDistance = Math.abs(pos.y - horizontalLine);

  if (verticalDistance <= horizontalDistance) {
    return {
      kind: 'vertical' as const,
      line: verticalLine,
      point: verticalPoint,
    };
  }

  return {
    kind: 'horizontal' as const,
    line: horizontalLine,
    point: horizontalPoint,
  };
}

function getNearestValue(values: readonly number[], target: number) {
  return values.reduce((closest, current) =>
    Math.abs(current - target) < Math.abs(closest - target) ? current : closest
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
