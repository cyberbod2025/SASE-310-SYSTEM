import React from 'react';
import { Sasito } from './components/Sasito';

export default function App() {
  return (
    <div className="min-h-screen bg-[#020202] overflow-hidden relative">
      {/* Ambient background effects to highlight Sasito */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[150px]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      {/* 
        Sasito is fixed positioned within its component. 
        Pointer events are disabled on the root div but enabled on Sasito itself.
      */}
      <div className="relative z-10">
        <Sasito />
      </div>
    </div>
  );
}
