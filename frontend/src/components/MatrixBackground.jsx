import React from "react";

const MatrixBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      
      {/* Matrix Image */}
      <img
        src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop"
        alt="Matrix Background"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />

      {/* Green Glow Orbs */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-green-500/10 blur-[140px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full mix-blend-screen" />

      {/* Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.035)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Noise */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15" />
    </div>
  );
};

export default MatrixBackground;
