# CPU City

CPU City is an in-browser computer architecture visualizer that turns CPU execution into a bird's-eye city map. Registers act like apartment blocks, the ALU acts like a processing factory, memory is a warehouse district, and the stack is a parking garage. As instructions execute, animated data cars move between those landmarks so students can see where values come from, where they travel, and where they end up.

## What This Project Includes

- Custom assembly editor for the supported CPU City instruction set
- Animated city map with roads, buildings, and moving data cars
- Live register, stack, and memory panels
- Step-by-step execution log with color-coded instruction categories
- Adjustable step/play speed controls
- Built-in sample programs, including a deliberate stack underflow demo
- Parser and executor tests that do not change the main app behavior

## Supported Instructions

The simulator currently supports:

- `LOADI`
- `LOAD`
- `STORE`
- `ADD`
- `SUB`
- `MUL`
- `PUSH`
- `POP`
- `JUMP`
- `JUMPIF`
- `READ`
- `HLT`

## Tech Stack

- Framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS
- State Management: Zustand
- UI Primitives: Radix UI / shadcn-style components
- Rendering: React + HTML5 canvas for the city road layer

## Project Structure

Key folders and files:

- `src/app` - app shell and page entry
- `src/components/city` - city map, roads, buildings, and car animations
- `src/components/layout` - left panel, right panel, header, and footer controls
- `src/engine/parser.ts` - assembly parsing and validation
- `src/engine/executor.ts` - per-instruction execution behavior
- `src/engine/samples.ts` - default program and sample programs
- `src/store/use-cpu-store.ts` - central execution state and animation orchestration
- `tests` - parser, executor, and sample coverage tests

## Getting Started

### Prerequisites

- Node.js 20.x
- npm

### Install

```bash
npm install
```

### Run the App

```bash
npm run dev
```

Open `http://localhost:9002`.

### Type Check

```bash
npm run typecheck
```

### Run Tests

```bash
npm test
```

The test suite compiles only the engine and test files into a temporary `.test-dist` folder, then runs parser/executor/sample checks using Node's built-in test runner. It does not modify the working app.

## Demo-Oriented Sample Programs

The app includes multiple preloaded samples. Useful presentation picks:

- `Arithmetic District` for ALU operations
- `Memory Warehouse` for LOAD and STORE
- `Stack Garage` for PUSH and POP
- `Loop Junction` for branching
- `Input Signal` for READ-based input
- `Underflow Alert` for deliberate stack error demonstration

## Notes on Implementation

- This implementation is browser-only from the user perspective and does not require a backend server for the simulator itself.
- The editor is a lightweight custom code area rather than Monaco, which keeps the app simpler and easier to run for demo use.
- Execution traffic is now routed onto the visible road network for clearer animation during demonstrations.

## Current Submission Support

This repository now includes:

- Setup and run guidance
- Architecture-oriented file map
- Sample coverage for presentation use
- Basic automated verification for parser, executor, and sample programs

Report and presentation slide content can be prepared separately from this codebase.
