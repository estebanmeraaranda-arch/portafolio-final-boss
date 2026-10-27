import React from 'react';
import HeroHeader from './components/HeroHeader/HeroHeader';

export default function App() {
  return (
    <main className="w-full min-h-screen bg-[#06080e] text-slate-100">
      <HeroHeader modelUrl="/models/Zorrito.glb" />
    </main>
  );
}
