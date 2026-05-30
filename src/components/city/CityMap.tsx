'use client';

import React, { useEffect } from 'react';
import { BuildingBox } from './BuildingBox';
import { DataCar } from './DataCar';
import { CityCanvas } from './CityCanvas';
import { CityBackdrop } from './CityBackdrop';
import { AmbientTraffic } from './AmbientTraffic';
import { CarSprite } from './CarSprite';
import { useCPUStore } from '@/store/use-cpu-store';
import { cn } from '@/lib/utils';
import { BUILDINGS, CITY_ROADS, REGISTER_IDS } from '@/config/buildings';
import {
  Home,
  Factory,
  Warehouse,
  Layers,
  Clock,
  Navigation,
  Sun,
  Moon,
  TreeDeciduous,
} from 'lucide-react';

const ICONS = {
  PC: <Clock className="w-3 h-3" />,
  ALU: <Factory className="w-3.5 h-3.5" />,
  RAM: <Warehouse className="w-3 h-3" />,
  STACK: <Layers className="w-3 h-3" />,
};

export const CityMap = () => {
  const {
    pc,
    registers,
    memory,
    stack,
    currentAnimations,
    speed,
    theme,
    toggleTheme,
    introPhase,
    setIntroPhase,
    activeBuildings,
    errorFlashTarget,
    lastWrittenMemAddr,
    lastMemoryAccess,
  } = useCPUStore();

  const activeMemoryCount = memory.filter((value) => value !== null).length;
  const isMemoryIdle = activeMemoryCount === 0;

  useEffect(() => {
    if (introPhase >= 6) return;
    const timer = window.setTimeout(() => {
      setIntroPhase(Math.min(introPhase + 1, 6));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [introPhase, setIntroPhase]);

  const RoadLabel = ({ x, y, rotate = 0, text }: { x: number; y: number; rotate?: number; text: string }) => (
    <div
      className="absolute pointer-events-none text-[9px] font-medium text-muted uppercase tracking-[0.2em] opacity-40"
      style={{ left: `${x}px`, top: `${y}px`, transform: `rotate(${rotate}deg)` }}
    >
      {text}
    </div>
  );

  const RoadArrow = ({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) => (
    <svg
      className="absolute pointer-events-none opacity-20 fill-muted"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      style={{ left: `${x}px`, top: `${y}px`, transform: `rotate(${rotate}deg)` }}
    >
      <path d="M0 8 L4 0 L8 8 L4 6 Z" />
    </svg>
  );

  const DecorativeTree = ({ x, y }: { x: number; y: number }) => (
    <TreeDeciduous className="absolute text-emerald-600/30 w-4 h-4" style={{ left: `${x}px`, top: `${y}px` }} />
  );

  const ParkedCar = ({ x, y, color }: { x: number; y: number; color: string }) => (
    <div className="absolute z-[8] opacity-70" style={{ left: `${x}px`, top: `${y}px` }}>
      <CarSprite color={color} size="sm" muted />
    </div>
  );

  return (
    <div className={cn('relative flex-1 overflow-auto bg-map transition-all duration-700 city-frame', theme === 'night' && 'night-mode')}>
      <div className="relative mx-auto h-full min-h-[780px] w-[980px] px-5 py-4">
        <div className="absolute inset-[8px] rounded-[36px] bg-white/40 night-mode:bg-black/10 backdrop-blur-[2px] border border-white/30 night-mode:border-white/5 shadow-[0_24px_60px_rgba(116,82,32,0.16)]" />
        <div className="absolute inset-[18px] rounded-[30px] border border-[#DCCFB8]/70 night-mode:border-[#514539]/60 pointer-events-none" />

        <CityBackdrop theme={theme} />
        <CityCanvas theme={theme} />
        <AmbientTraffic />

        {CITY_ROADS.map((road, index) => (
          <React.Fragment key={`${road.from.x}-${road.from.y}-${index}`}>
            {road.label && <RoadLabel {...road.label} />}
            {road.arrow && <RoadArrow {...road.arrow} />}
          </React.Fragment>
        ))}

        <DecorativeTree x={220} y={120} />
        <DecorativeTree x={240} y={135} />
        <DecorativeTree x={500} y={180} />
        <DecorativeTree x={520} y={550} />
        <DecorativeTree x={540} y={565} />
        <DecorativeTree x={740} y={268} />
        <DecorativeTree x={206} y={590} />
        <DecorativeTree x={622} y={610} />

        <ParkedCar x={360} y={60} color="#185FA5" />
        <ParkedCar x={440} y={60} color="#1D9E75" />
        <ParkedCar x={650} y={150} color="#BA7517" />

        {currentAnimations.map((animation) => (
          animation.type === 'move' && animation.startPos && animation.endPos && (
            <DataCar
              key={animation.id}
              startPos={animation.startPos}
              endPos={animation.endPos}
              color={animation.color || '#1D9E75'}
              label={animation.label || ''}
              duration={1000 / speed}
            />
          )
        ))}

        {introPhase >= 1 && (
          <BuildingBox
            id="PC"
            title={BUILDINGS.PC.title}
            description={BUILDINGS.PC.description}
            icon={ICONS.PC}
            style={{ top: `${BUILDINGS.PC.y}px`, left: `${BUILDINGS.PC.x}px` }}
            width={BUILDINGS.PC.width}
            height={BUILDINGS.PC.height}
            color={BUILDINGS.PC.bodyClassName}
            headerColor={BUILDINGS.PC.headerClassName}
            borderColor={BUILDINGS.PC.borderClassName}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-[12px] font-code font-bold text-[#888780]">IP: 0x{pc.toString(16).padStart(4, '0')}</span>
            </div>
          </BuildingBox>
        )}

        {REGISTER_IDS.map((id, index) => {
          const building = BUILDINGS[id];
          if (introPhase < Math.min(2 + index, 6)) {
            return null;
          }

          return (
            <BuildingBox
              key={id}
              id={id}
              title={building.title}
              description={building.description}
              icon={<Home className="w-3 h-3" />}
              style={{ top: `${building.y}px`, left: `${building.x}px` }}
              width={building.width}
              height={building.height}
              color={building.bodyClassName}
              headerColor={building.headerClassName}
              borderColor={building.borderClassName}
              titleClassName="text-[11px] font-black tracking-[0.18em] text-[#113764] bg-[#D6E8FF] px-1.5 py-0.5 rounded-md shadow-sm"
              contentClassName="pt-1 bg-[#234D7F]"
            >
              <div className="flex items-center justify-center h-full">
                <span key={registers[id]} className="text-[17px] font-code font-extrabold text-[#F4F9FF] number-flip-in drop-shadow-[0_0_10px_rgba(127,177,237,0.35)]">
                  {registers[id] ?? '—'}
                </span>
              </div>
            </BuildingBox>
          );
        })}

        {introPhase >= 4 && (
          <BuildingBox
            id="ALU"
            title={BUILDINGS.ALU.title}
            description={BUILDINGS.ALU.description}
            icon={ICONS.ALU}
            style={{ top: `${BUILDINGS.ALU.y}px`, left: `${BUILDINGS.ALU.x}px` }}
            width={BUILDINGS.ALU.width}
            height={BUILDINGS.ALU.height}
            color={BUILDINGS.ALU.bodyClassName}
            headerColor={BUILDINGS.ALU.headerClassName}
            borderColor={BUILDINGS.ALU.borderClassName}
            prominent={BUILDINGS.ALU.prominent}
          >
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0F6E56] shadow-inner">
                <div className={cn('w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]', activeBuildings.ALU ? 'bg-emerald-400 animate-pulse' : 'bg-white/40')} />
                <span className="text-[9px] text-white font-bold uppercase tracking-wider">
                  {activeBuildings.ALU ? 'Processing' : 'Standing By'}
                </span>
              </div>
              <span className="text-[14px] font-code font-bold text-[#0F6E56]">
                {activeBuildings.ALU ? 'ALU BUSY' : 'ALU READY'}
              </span>
            </div>
          </BuildingBox>
        )}

        {introPhase >= 5 && (
          <BuildingBox
            id="RAM"
            title={BUILDINGS.RAM.title}
            description={BUILDINGS.RAM.description}
            icon={ICONS.RAM}
            style={{ top: `${BUILDINGS.RAM.y}px`, left: `${BUILDINGS.RAM.x}px` }}
            width={BUILDINGS.RAM.width}
            height={BUILDINGS.RAM.height}
            color={cn(BUILDINGS.RAM.bodyClassName, errorFlashTarget === 'RAM' && 'memory-error-flash')}
            headerColor={BUILDINGS.RAM.headerClassName}
            borderColor={BUILDINGS.RAM.borderClassName}
            prominent={BUILDINGS.RAM.prominent}
            titleClassName="text-[11px] font-extrabold tracking-[0.2em] text-[#FFF4DE]"
            contentClassName="px-2 py-1 bg-[#573B1B]"
          >
            <div className="flex h-full flex-col">
              <div className="mb-1 flex items-center justify-between px-0.5">
                <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#F7D9A4]">Live LOAD/STORE View</span>
                <span className="rounded-full bg-[#7B5324] px-1.5 py-0.5 text-[8px] font-bold text-[#FFE8B7] border border-[#D5A35A]/50">{activeMemoryCount}/16 used</span>
              </div>
              <div className="grid flex-1 grid-cols-4 gap-1.5">
                {memory.slice(0, 16).map((value, index) => {
                  const accessKind = lastMemoryAccess?.addr === index ? lastMemoryAccess.kind : null;
                  return (
                    <div
                      key={index}
                      className={cn(
                        'rounded-lg border border-[#D5A35A]/25 bg-[#FFF3E0] px-1 py-1.5 text-center shadow-sm transition-all duration-300',
                        value !== null && 'bg-[#F9D79F] border-[#E5B45E]',
                        lastWrittenMemAddr === index && 'ring-2 ring-amber-400 bg-amber-100/80',
                        accessKind === 'read' && 'ring-2 ring-sky-300 bg-sky-50/80',
                        accessKind === 'write' && 'ring-2 ring-amber-400 bg-amber-100/90'
                      )}
                    >
                      <div className="text-[7px] font-code font-bold text-[#9A681E]">[{index}]</div>
                      <div key={`${index}-${value}`} className={cn('mt-0.5 text-[10px] font-code font-extrabold number-flip-in', value === null ? 'text-[#C8A06B]' : 'text-[#A96A13]')}>
                        {value === null ? '--' : value}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-1 px-0.5 text-[8px] font-medium text-[#F0D0A2]">
                {isMemoryIdle ? 'No STORE instruction has written to memory yet.' : 'RAM Depot is the city-map view of memory slots.'}
              </div>
            </div>
          </BuildingBox>
        )}

        {introPhase >= 6 && (
          <BuildingBox
            id="STACK"
            title={BUILDINGS.STACK.title}
            description={BUILDINGS.STACK.description}
            icon={ICONS.STACK}
            style={{ top: `${BUILDINGS.STACK.y}px`, left: `${BUILDINGS.STACK.x}px` }}
            width={BUILDINGS.STACK.width}
            height={BUILDINGS.STACK.height}
            color={cn(BUILDINGS.STACK.bodyClassName, errorFlashTarget === 'STACK' && 'stack-error-flash')}
            headerColor={BUILDINGS.STACK.headerClassName}
            borderColor={BUILDINGS.STACK.borderClassName}
            prominent={BUILDINGS.STACK.prominent}
            titleClassName="text-[11px] font-extrabold tracking-[0.2em] text-[#FFE8F0]"
            contentClassName="px-2 py-1 bg-[#4D2E3D]"
          >
            <div className={cn('flex h-full flex-col', stack.length > 8 && 'shake-anim')}>
              <div className="mb-1 flex items-center justify-between px-0.5">
                <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#F7C7D8]">PUSH / POP Garage</span>
                <span className="rounded-full bg-[#6E3B53] px-1.5 py-0.5 text-[8px] font-bold text-[#FFDDEA] border border-[#C9839D]/50">{stack.length} parked</span>
              </div>
              <div className="flex flex-1 flex-col-reverse justify-start gap-1.5">
                {stack.slice(-6).map((value, index) => (
                  <div
                    key={`${value}-${index}`}
                    className="h-7 w-full rounded-lg bg-[#FFF2F6] border border-[#C9839D]/28 flex items-center justify-between px-2 shadow-sm animate-in slide-in-from-top-2 duration-300"
                  >
                    <span className="text-[8px] font-code font-semibold text-[#8C3E5D]">SP-{stack.length - index}</span>
                    <span className="text-[11px] font-code font-extrabold text-[#A13A61]">{value}</span>
                  </div>
                ))}
                {stack.length > 6 && (
                  <div className="text-[8px] text-[#F6C9D9] text-center font-semibold">+{stack.length - 6} lower levels</div>
                )}
                {stack.length === 0 && <div className="text-[9px] text-[#F2D4DE] text-center mt-4">No PUSH instruction has filled the garage yet.</div>}
              </div>
              <div className="mt-1 px-0.5 text-[8px] font-medium text-[#F1CAD8]">Stack Yard is the city-map view of the LIFO stack.</div>
            </div>
          </BuildingBox>
        )}

        <button
          onClick={toggleTheme}
          className="absolute top-8 right-8 z-50 p-2 rounded-full bg-white/85 night-mode:bg-white/10 border border-border shadow-md hover:scale-110 transition-transform"
        >
          {theme === 'day' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-yellow-400" />}
        </button>

        <div className="absolute bottom-20 right-52 flex flex-col items-center opacity-30 pointer-events-none">
          <Navigation className="w-6 h-6 text-muted-foreground rotate-45" />
          <div className="grid grid-cols-3 grid-rows-3 gap-0 text-[10px] font-bold text-muted-foreground">
            <span className="col-start-2 row-start-1 text-center">N</span>
            <span className="col-start-1 row-start-2 text-right mr-1">W</span>
            <span className="col-start-3 row-start-2 text-left ml-1">E</span>
            <span className="col-start-2 row-start-3 text-center">S</span>
          </div>
        </div>

        <div className="absolute left-8 bottom-8 z-[12] rounded-2xl border border-white/40 bg-white/75 px-4 py-3 shadow-lg backdrop-blur-sm night-mode:bg-[#1A1713]/70 night-mode:border-white/10">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-dim">City View</div>
          <div className="mt-1 text-[12px] font-semibold text-foreground">Live traffic shows data moving between CPU districts.</div>
        </div>
      </div>
    </div>
  );
};
