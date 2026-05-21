import React from 'react';
import { BuildingBox } from './BuildingBox';
import { 
  Home, 
  Factory, 
  Warehouse, 
  Layers, 
  Clock 
} from 'lucide-react';

export const CityMap = () => {
  return (
    <div className="relative flex-1 bg-map overflow-hidden bg-dot-grid">
      {/* SVG Roads - Layered Behind Buildings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <defs>
          <pattern id="roadPattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <line x1="0" y1="5" x2="10" y2="5" stroke="#D4CFC5" strokeWidth="10" />
            <line x1="0" y1="5" x2="10" y2="5" stroke="#C2BDB3" strokeWidth="2" strokeDasharray="4 4" />
          </pattern>
        </defs>
        
        {/* Main Thoroughfares */}
        <path d="M400 100 L400 600" stroke="url(#roadPattern)" strokeWidth="10" fill="none" />
        <path d="M100 300 L700 300" stroke="url(#roadPattern)" strokeWidth="10" fill="none" />
        <path d="M100 450 L700 450" stroke="url(#roadPattern)" strokeWidth="10" fill="none" />
        <path d="M100 150 L200 150" stroke="url(#roadPattern)" strokeWidth="10" fill="none" />
        <path d="M100 150 L100 600" stroke="url(#roadPattern)" strokeWidth="10" fill="none" />
        <path d="M600 100 L600 600" stroke="url(#roadPattern)" strokeWidth="10" fill="none" />
      </svg>

      {/* Program Counter */}
      <BuildingBox
        title="PC"
        icon={<Clock className="w-3 h-3" />}
        style={{ top: '60px', left: '50%', transform: 'translateX(-50%)' }}
        width={140}
        height={60}
        color="bg-[#F1EFE8]"
        headerColor="bg-[#888780]"
        borderColor="border-[#888780]"
      >
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-[12px] font-code font-medium">Step: 0</span>
        </div>
      </BuildingBox>

      {/* Register Apartments */}
      <div className="absolute top-[120px] left-[40px] flex flex-col gap-2">
        {['R0', 'R1', 'R2', 'R3', 'R4'].map((reg) => (
          <BuildingBox
            key={reg}
            title={reg}
            icon={<Home className="w-3 h-3" />}
            width={92}
            height={58}
            color="bg-[#EBF4FD]"
            headerColor="bg-[#185FA5]"
            borderColor="border-[#185FA5]"
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-[16px] font-code">—</span>
            </div>
          </BuildingBox>
        ))}
      </div>

      {/* ALU Factory */}
      <BuildingBox
        title="ALU Factory"
        icon={<Factory className="w-3.5 h-3.5" />}
        style={{ top: '280px', left: '50%', transform: 'translateX(-50%)' }}
        width={180}
        height={110}
        color="bg-[#E1F5EE]"
        headerColor="bg-[#0F6E56]"
        borderColor="border-[#0F6E56]"
        prominent
      >
        <div className="flex flex-col items-center justify-center h-full gap-1">
          <span className="text-[11px] text-[#0F6E56] font-semibold uppercase tracking-wider">Idle</span>
          <div className="w-12 h-0.5 bg-[#0F6E56]/20 rounded-full" />
        </div>
      </BuildingBox>

      {/* Memory Warehouse */}
      <BuildingBox
        title="Memory"
        icon={<Warehouse className="w-3 h-3" />}
        style={{ top: '100px', right: '40px' }}
        width={120}
        height={170}
        color="bg-[#FEF3DC]"
        headerColor="bg-[#BA7517]"
        borderColor="border-[#BA7517]"
      >
        <div className="p-2 flex flex-col gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="flex justify-between items-center text-[9px] font-code opacity-70">
              <span>[{i}]</span>
              <span>—</span>
            </div>
          ))}
        </div>
      </BuildingBox>

      {/* Stack Garage */}
      <BuildingBox
        title="Stack"
        icon={<Layers className="w-3 h-3" />}
        style={{ bottom: '100px', right: '40px' }}
        width={120}
        height={170}
        color="bg-[#FDF0F5]"
        headerColor="bg-[#993556]"
        borderColor="border-[#993556]"
      >
        <div className="p-2 flex flex-col-reverse h-full justify-start gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 w-full rounded bg-[#993556]/10 border border-[#993556]/20 flex items-center justify-center">
               <div className="w-4 h-1 rounded-full bg-[#993556]/30" />
            </div>
          ))}
        </div>
      </BuildingBox>

      {/* Data Car - Animated Placeholder */}
      <div 
        className="absolute w-5 h-5 bg-[#E24B4A] border-2 border-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all duration-1000"
        style={{ top: '335px', left: '200px' }}
      >
        <span className="absolute top-full mt-1 text-[10px] font-code font-bold text-[#E24B4A]">7</span>
      </div>
    </div>
  );
};
