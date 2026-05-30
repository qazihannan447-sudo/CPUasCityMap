export type BuildingId = 'PC' | 'R0' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'ALU' | 'RAM' | 'STACK';

export interface BuildingDefinition {
  id: BuildingId;
  title: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bodyClassName: string;
  headerClassName: string;
  borderClassName: string;
  prominent?: boolean;
}

export interface RoadSegment {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: { text: string; x: number; y: number; rotate?: number };
  arrow?: { x: number; y: number; rotate?: number };
}

export const CITY_VIEWPORT = {
  width: 960,
  height: 680,
};

export const REGISTER_IDS: BuildingId[] = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5'];

export const BUILDINGS: Record<BuildingId, BuildingDefinition> = {
  PC: {
    id: 'PC',
    title: 'PC Tower',
    description: 'Tracks the current instruction address during execution.',
    x: 330,
    y: 40,
    width: 140,
    height: 60,
    bodyClassName: 'bg-[#F1EFE8] night-mode:bg-[#3D362E]',
    headerClassName: 'bg-[#888780]',
    borderClassName: 'border-[#888780]',
  },
  R0: {
    id: 'R0',
    title: 'R0',
    description: 'Fast register apartment for temporary values.',
    x: 20,
    y: 102,
    width: 88,
    height: 50,
    bodyClassName: 'bg-[#E6F0FF] night-mode:bg-[#16263A]',
    headerClassName: 'bg-[#1F5FAF]',
    borderClassName: 'border-[#7FB1ED]',
  },
  R1: {
    id: 'R1',
    title: 'R1',
    description: 'Fast register apartment for temporary values.',
    x: 20,
    y: 156,
    width: 88,
    height: 50,
    bodyClassName: 'bg-[#E6F0FF] night-mode:bg-[#16263A]',
    headerClassName: 'bg-[#1F5FAF]',
    borderClassName: 'border-[#7FB1ED]',
  },
  R2: {
    id: 'R2',
    title: 'R2',
    description: 'Fast register apartment for temporary values.',
    x: 20,
    y: 210,
    width: 88,
    height: 50,
    bodyClassName: 'bg-[#E6F0FF] night-mode:bg-[#16263A]',
    headerClassName: 'bg-[#1F5FAF]',
    borderClassName: 'border-[#7FB1ED]',
  },
  R3: {
    id: 'R3',
    title: 'R3',
    description: 'Fast register apartment for temporary values.',
    x: 20,
    y: 264,
    width: 88,
    height: 50,
    bodyClassName: 'bg-[#E6F0FF] night-mode:bg-[#16263A]',
    headerClassName: 'bg-[#1F5FAF]',
    borderClassName: 'border-[#7FB1ED]',
  },
  R4: {
    id: 'R4',
    title: 'R4',
    description: 'Fast register apartment for temporary values.',
    x: 20,
    y: 318,
    width: 88,
    height: 50,
    bodyClassName: 'bg-[#E6F0FF] night-mode:bg-[#16263A]',
    headerClassName: 'bg-[#1F5FAF]',
    borderClassName: 'border-[#7FB1ED]',
  },
  R5: {
    id: 'R5',
    title: 'R5',
    description: 'Fast register apartment for temporary values.',
    x: 20,
    y: 372,
    width: 88,
    height: 50,
    bodyClassName: 'bg-[#E6F0FF] night-mode:bg-[#16263A]',
    headerClassName: 'bg-[#1F5FAF]',
    borderClassName: 'border-[#7FB1ED]',
  },
  ALU: {
    id: 'ALU',
    title: 'ALU Complex',
    description: 'Processes arithmetic operations and produces results.',
    x: 305,
    y: 270,
    width: 190,
    height: 120,
    bodyClassName: 'bg-[#E1F5EE] night-mode:bg-[#0F2D25]',
    headerClassName: 'bg-[#0A5D48]',
    borderClassName: 'border-[#0A5D48]',
    prominent: true,
  },
  RAM: {
    id: 'RAM',
    title: 'RAM Depot',
    description: 'Warehouse-style memory with 16 addressable slots.',
    x: 700,
    y: 92,
    width: 154,
    height: 226,
    bodyClassName: 'bg-[#5A3F1F] night-mode:bg-[#33240F]',
    headerClassName: 'bg-[#2D1D09]',
    borderClassName: 'border-[#D5A35A]',
    prominent: true,
  },
  STACK: {
    id: 'STACK',
    title: 'Stack Yard',
    description: 'LIFO parking garage for PUSH and POP operations.',
    x: 700,
    y: 384,
    width: 154,
    height: 206,
    bodyClassName: 'bg-[#503041] night-mode:bg-[#2D1B25]',
    headerClassName: 'bg-[#26121A]',
    borderClassName: 'border-[#C9839D]',
    prominent: true,
  },
};

export const CITY_ROADS: RoadSegment[] = [
  {
    from: { x: 400, y: 90 },
    to: { x: 400, y: 640 },
    label: { text: 'Data Bus Blvd', x: 408, y: 200, rotate: 90 },
    arrow: { x: 396, y: 150, rotate: 180 },
  },
  {
    from: { x: 130, y: 120 },
    to: { x: 130, y: 650 },
    label: { text: 'Address Lane', x: 138, y: 220, rotate: 90 },
  },
  {
    from: { x: 100, y: 300 },
    to: { x: 700, y: 300 },
    label: { text: 'Control Highway', x: 220, y: 292 },
    arrow: { x: 250, y: 296, rotate: 90 },
  },
  {
    from: { x: 100, y: 450 },
    to: { x: 700, y: 450 },
    label: { text: 'Stack Pointer Road', x: 440, y: 442 },
    arrow: { x: 500, y: 446, rotate: 90 },
  },
  {
    from: { x: 600, y: 100 },
    to: { x: 600, y: 650 },
  },
];

export function getBuildingCenter(id: string) {
  const building = BUILDINGS[id.toUpperCase() as BuildingId];
  if (!building) {
    return {
      x: CITY_VIEWPORT.width / 2,
      y: CITY_VIEWPORT.height / 2,
    };
  }

  return {
    x: building.x + building.width / 2,
    y: building.y + building.height / 2,
  };
}
