import React from 'react';
import { Canvas } from '@react-three/fiber';

const CyberGlobe = () => {
  return (
    <div className="relative w-full h-full">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {/* Globe elements go here */}
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-graphite-dark pointer-events-none" />
    </div>
  );
};

export default CyberGlobe;
