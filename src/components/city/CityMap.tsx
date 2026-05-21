
'use client';

import React from 'react';
import { BuildingBox } from './BuildingBox';
import { DataCar } from './DataCar';
import { useCPUStore } from '@/store/use-cpu-store';
import { 
  Home, 
  Factory, 
  Warehouse, 
  Layers, 
  Clock,
  Navigation
} from 'lucide-react';

export const CityMap = () => {
  const { pc, registers, memory, stack, currentAnimations, speed } = useCPUStore();

  const RoadLabel = ({ x, y, rotate = 0, text }: { x: string, y: string, rotate?: number, text: string }) => (
    <div 
      className="absolute pointer-events-none text-[9px] font-medium text-muted uppercase tracking-[0.2em] opacity-60"
      style={{ left: x, top: y, transform: `rotate(${rotate}deg)` }}
    >
      {text}
    </div>
  );

  const RoadArrow = ({ x, y, rotate = 0 }: { x: string, y: string, rotate?: number }) => (
    <svg 
      className="absolute pointer-events-none opacity-40 fill-muted"
      width="8" height="8" viewBox="0 0 8 8"
      style={{ left: x, top: y, transform: `rotate(${rotate}deg)` }}
    >
      <path d="M0 8 L4 0 L8 8 L4 6 Z" />
    </svg>
  );

  return (
    <div className="relative flex-1 bg-map overflow-hidden bg-city-grid">
      {/* SVG Roads */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
        <defs>
          <pattern id="roadPattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <line x1="0" y1="5" x2="10" y2="5" stroke="#D4CFC5" strokeWidth="10" />
            <line x1="0" y1="5" x2="10" y2="5" stroke="#C2BDB3" strokeWidth="2" strokeDasharray="4 4" />
          </pattern>
        </defs>
        
        <path d="M400 100 L400 650" stroke="url(#roadPattern)" strokeWidth="12" fill="none" />
        <path d="M100 300 L700 300" stroke="url(#roadPattern)" strokeWidth="12" fill="none" />
        <path d="M100 450 L700 450" stroke="url(#roadPattern)" strokeWidth="12" fill="none" />
        <path d="M130 150 L130 650" stroke="url(#roadPattern)" strokeWidth="12" fill="none" />
        <path d="M600 100 L600 650" stroke="url(#roadPattern)" strokeWidth="12" fill="none" />
      </svg>

      {/* Road Labels */}
      <RoadLabel x="408px" y="200px" rotate={90} text="Data Bus Blvd" />
      <RoadLabel x="138px" y="220px" rotate={90} text="Address Lane" />
      <RoadLabel x="220px" y="292px" text="Control Highway" />
      <RoadLabel x="440px" y="442px" text="Stack Pointer Road" />

      {/* Road Arrows */}
      <RoadArrow x="396px" y="150px" rotate={180} />
      <RoadArrow x="396px" y="250px" rotate={180} />
      <RoadArrow x="410px" y="200px" rotate={0} />
      <RoadArrow x="250px" y="296px" rotate={90} />
      <RoadArrow x="500px" y="446px" rotate={90} />

      {/* Data Cars */}
      {currentAnimations.map(anim => (
        anim.type === 'move' && anim.startPos && anim.endPos && (
          <DataCar 
            key={anim.id}
            startPos={anim.startPos}
            endPos={anim.endPos}
            color={anim.color || '#1D9E75'}
            label={anim.label || ''}
            duration={1000 / speed}
          />
        )
      ))}

      {/* Program Counter */}
      <BuildingBox
        id="PC"
        title="PC Tower"
        description="The Program Counter tracks the current address of the instruction being executed."
        icon={<Clock className="w-3 h-3" />}
        style={{ top: '40px', left: '400px', transform: 'translateX(-50%)' }}
        width={140}
        height={60}
        color="bg-[#F1EFE8]"
        headerColor="bg-[#888780]"
        borderColor="border-[#888780]"
      >
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-[12px] font-code font-bold text-[#888780]">IP: 0x{pc.toString(16).padStart(4, '0')}</span>
        </div>
      </BuildingBox>

      {/* Register Apartments */}
      <div className="absolute top-[100px] left-[40px] flex flex-col gap-1.5">
        {['R0', 'R1', 'R2', 'R3'].map((reg) => (
          <BuildingBox
            key={reg}
            id={reg}
            title={reg}
            description={`General purpose register ${reg} used for fast data access and manipulation.`}
            icon={<Home className="w-3 h-3" />}
            width={88}
            height={50}
            color="bg-[#EBF4FD]"
            headerColor="bg-[#185FA5]"
            borderColor="border-[#185FA5]"
          >
            <div className="flex items-center justify-center h-full">
              <span key={registers[reg]} className="text-[14px] font-code font-semibold text-[#185FA5] number-flip-in">
                {registers[reg]}
              </span>
            </div>
          </BuildingBox>
        ))}
      </div>

      {/* ALU Factory */}
      <BuildingBox
        id="ALU"
        title="ALU Complex"
        description="The Arithmetic Logic Unit performs all mathematical and logical operations."
        icon={<Factory className="w-3.5 h-3.5" />}
        style={{ top: '270px', left: '400px', transform: 'translateX(-50%)' }}
        width={190}
        height={120}
        color="bg-[#E1F5EE]"
        headerColor="bg-[#0A5D48]"
        borderColor="border-[#0A5D48]"
        prominent
      >
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0F6E56] shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[9px] text-white font-bold uppercase tracking-wider">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-code font-bold text-[#0F6E56]">COMPUTING...</span>
          </div>
        </div>
      </BuildingBox>

      {/* Memory Warehouse */}
      <BuildingBox
        id="RAM"
        title="RAM Depot"
        description="Main system memory for storing program code and data variables."
        icon={<Warehouse className="w-3 h-3" />}
        style={{ top: '100px', right: '40px' }}
        width={124}
        height={180}
        color="bg-[#FEF3DC]"
        headerColor="bg-[#BA7517]"
        borderColor="border-[#BA7517]"
      >
        <div className="p-1.5 flex flex-col gap-1">
          {memory.slice(0, 6).map((val, i) => (
            <div key={i} className="flex justify-between items-center text-[9px] font-code border-b border-warning/10 pb-0.5">
              <span className="text-warning/70 font-bold">[{i}]</span>
              <span key={val} className="font-semibold number-flip-in">{val || 0}</span>
            </div>
          ))}
        </div>
      </BuildingBox>

      {/* Stack Garage */}
      <BuildingBox
        id="STACK"
        title="Stack Yard"
        description="LIFO (Last-In-First-Out) storage used for function calls and local state."
        icon={<Layers className="w-3 h-3" />}
        style={{ bottom: '80px', right: '40px' }}
        width={124}
        height={180}
        color="bg-[#FDF0F5]"
        headerColor="bg-[#993556]"
        borderColor="border-[#993556]"
        prominent={stack.length > 8}
      >
        <div className={cn("p-2 flex flex-col-reverse h-full justify-start gap-1.5", stack.length > 8 && "shake-anim")}>
          {stack.slice(0, 5).map((val, i) => (
            <div key={i} className="h-6 w-full rounded bg-white/60 border border-[#993556]/20 flex items-center justify-center shadow-sm animate-in slide-in-from-top-2 duration-300">
               <span className="text-[10px] font-code font-bold text-stack">{val}</span>
            </div>
          ))}
          {stack.length === 0 && <div className="text-[9px] text-dim text-center mt-4">Empty</div>}
        </div>
      </BuildingBox>

      {/* Compass Rose */}
      <div className="absolute bottom-6 right-48 flex flex-col items-center opacity-30 pointer-events-none">
        <Navigation className="w-6 h-6 text-muted-foreground rotate-45" />
        <div className="grid grid-cols-3 grid-rows-3 gap-0 text-[10px] font-bold text-muted-foreground">
          <span className="col-start-2 row-start-1 text-center">N</span>
          <span className="col-start-1 row-start-2 text-right mr-1">W</span>
          <span className="col-start-3 row-start-2 text-left ml-1">E</span>
          <span className="col-start-2 row-start-3 text-center">S</span>
        </div>
      </div>
    </div>
  );
};
