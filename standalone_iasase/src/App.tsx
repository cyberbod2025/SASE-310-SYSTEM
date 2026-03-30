import { useState } from 'react'
import { SaseNeuralCore, CoreState } from './components/SaseNeuralCore'
import { motion } from 'framer-motion'

function App() {
  const [state, setState] = useState<CoreState>('normal')
  const [isInteracting, setIsInteracting] = useState(false)

  return (
    <div className="min-h-screen w-full bg-[#050510] flex flex-col items-center justify-center p-8 font-sans selection:bg-amber-500/30">
      
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#1e1e38_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-2">
          IA SASE
        </h1>
        <p className="text-amber-200/50 font-mono text-sm tracking-widest uppercase">
          Neural Core Standalone Interface
        </p>
      </motion.div>

      <div className="relative group z-10" 
           onMouseEnter={() => setIsInteracting(true)}
           onMouseLeave={() => setIsInteracting(false)}>
        <SaseNeuralCore 
          state={state} 
          isInteracting={isInteracting} 
          size="w-72 h-72 md:w-96 md:h-96"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 z-10"
      >
        {(['normal', 'thinking', 'warning', 'alert'] as CoreState[]).map((s) => (
          <button
            key={s}
            onClick={() => setState(s)}
            className={`px-6 py-2 rounded-full border transition-all duration-300 capitalize font-medium text-sm
              ${state === s 
                ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20'
              }`}
          >
            {s}
          </button>
        ))}
      </motion.div>

      <div className="mt-12 text-white/20 font-mono text-[10px] tracking-[0.2em] uppercase z-10">
        Institutional Intelligence System v3.1.0
      </div>

    </div>
  )
}

export default App
