import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles, Box, Eye, Maximize2, RefreshCw } from 'lucide-react';

interface Jewelry3DViewerProps {
  orderTitle?: string;
  orderType?: 'Ring' | 'Bracelet' | 'Pendant' | 'Earring';
  initialMetal?: 'yellow-gold' | 'white-gold' | 'rose-gold' | 'platinum';
  initialStone?: 'diamond' | 'emerald' | 'sapphire' | 'ruby';
  height?: number | string;
}

const METALS = {
  'yellow-gold': { name: '18K Yellow Gold', color: 0xe6b04a, metalness: 0.95, roughness: 0.18 },
  'white-gold': { name: '18K White Gold', color: 0xd4d8df, metalness: 0.92, roughness: 0.15 },
  'rose-gold': { name: '18K Rose Gold', color: 0xe09b85, metalness: 0.93, roughness: 0.2 },
  'platinum': { name: '950 Platinum', color: 0xf1f3f5, metalness: 0.98, roughness: 0.1 }
};

const STONES = {
  'diamond': { name: 'Brilliant Diamond', color: 0xffffff, emissive: 0x334455, opacity: 0.88 },
  'emerald': { name: 'Colombian Emerald', color: 0x10b981, emissive: 0x054f35, opacity: 0.92 },
  'sapphire': { name: 'Royal Sapphire', color: 0x2563eb, emissive: 0x0f2b66, opacity: 0.9 },
  'ruby': { name: 'Pigeon Blood Ruby', color: 0xe11d48, emissive: 0x5a091d, opacity: 0.9 }
};

export const Jewelry3DViewer: React.FC<Jewelry3DViewerProps> = ({
  orderTitle,
  orderType = 'Ring',
  initialMetal = 'yellow-gold',
  initialStone = 'diamond',
  height = 320
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedMetal, setSelectedMetal] = useState<keyof typeof METALS>(initialMetal);
  const [selectedStone, setSelectedStone] = useState<keyof typeof STONES>(initialStone);
  const [isRotating, setIsRotating] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [prongCount, setProngCount] = useState<4 | 6>(4);

  // Three.js object references for reactive material updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const bandMeshRef = useRef<THREE.Mesh | null>(null);
  const gemMeshRef = useRef<THREE.Mesh | null>(null);
  const prongsGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const canvasHeight = typeof height === 'number' ? height : container.clientHeight || 320;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / canvasHeight, 0.1, 1000);
    camera.position.set(0, 3.2, 5.5);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.4);
    fillLight.position.set(-5, 4, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffd599, 2.5, 20);
    rimLight.position.set(0, -3, 3);
    scene.add(rimLight);

    // Jewelry Group
    const jewelryGroup = new THREE.Group();
    scene.add(jewelryGroup);

    // 1. Ring Shank / Band (Torus)
    const metalSpec = METALS[selectedMetal];
    const bandMat = new THREE.MeshStandardMaterial({
      color: metalSpec.color,
      metalness: metalSpec.metalness,
      roughness: metalSpec.roughness,
      wireframe: isWireframe
    });
    const bandGeo = new THREE.TorusGeometry(1.6, 0.22, 24, 72);
    const bandMesh = new THREE.Mesh(bandGeo, bandMat);
    bandMesh.rotation.x = Math.PI / 2;
    jewelryGroup.add(bandMesh);
    bandMeshRef.current = bandMesh;

    // 2. Solitaire Gemstone (Precision Faceted Brilliant)
    const stoneSpec = STONES[selectedStone];
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: stoneSpec.color,
      emissive: stoneSpec.emissive,
      metalness: 0.05,
      roughness: 0.02,
      transmission: 0.85,
      thickness: 1.2,
      ior: 2.417, // Diamond refraction index
      transparent: true,
      opacity: stoneSpec.opacity,
      wireframe: isWireframe
    });

    const gemGeo = new THREE.OctahedronGeometry(0.72, 1);
    gemGeo.scale(1, 1.25, 1);
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    gemMesh.position.set(0, 1.85, 0);
    jewelryGroup.add(gemMesh);
    gemMeshRef.current = gemMesh;

    // 3. Setting Crown & Prongs
    const prongsGroup = new THREE.Group();
    const count = 4;
    const prongGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.9, 16);
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count + Math.PI / 4;
      const prong = new THREE.Mesh(prongGeo, bandMat);
      const radius = 0.58;
      prong.position.set(Math.cos(angle) * radius, 1.62, Math.sin(angle) * radius);
      prong.rotation.z = -Math.cos(angle) * 0.18;
      prong.rotation.x = Math.sin(angle) * 0.18;
      prongsGroup.add(prong);
    }
    jewelryGroup.add(prongsGroup);
    prongsGroupRef.current = prongsGroup;

    // Mouse Interaction (Orbiting)
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      jewelryGroup.rotation.y += deltaX * 0.01;
      jewelryGroup.rotation.x += deltaY * 0.01;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(3.5, Math.min(10, camera.position.z + e.deltaY * 0.005));
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Render loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating && !isDragging) {
        jewelryGroup.rotation.y += 0.008;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, canvasHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      bandGeo.dispose();
      gemGeo.dispose();
      prongGeo.dispose();
      bandMat.dispose();
      gemMat.dispose();
    };
  }, [height]);

  // Reactive updates for Metal selection
  useEffect(() => {
    if (!bandMeshRef.current || !prongsGroupRef.current) return;
    const spec = METALS[selectedMetal];
    const mat = bandMeshRef.current.material as THREE.MeshStandardMaterial;
    mat.color.setHex(spec.color);
    mat.metalness = spec.metalness;
    mat.roughness = spec.roughness;
    mat.wireframe = isWireframe;
    mat.needsUpdate = true;
  }, [selectedMetal, isWireframe]);

  // Reactive updates for Gemstone selection
  useEffect(() => {
    if (!gemMeshRef.current) return;
    const spec = STONES[selectedStone];
    const mat = gemMeshRef.current.material as THREE.MeshPhysicalMaterial;
    mat.color.setHex(spec.color);
    mat.emissive.setHex(spec.emissive);
    mat.opacity = spec.opacity;
    mat.wireframe = isWireframe;
    mat.needsUpdate = true;
  }, [selectedStone, isWireframe]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900/90 via-black to-zinc-950 border border-white/10 shadow-2xl">
      {/* 3D WebGL Canvas */}
      <div 
        ref={mountRef} 
        className="w-full cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      />

      {/* Top Floating Badge & Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider font-semibold text-zinc-200">
            FOSS 3D CAD ENGINE: {orderType.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 pointer-events-auto">
          <button
            onClick={() => setIsRotating(!isRotating)}
            title={isRotating ? 'Pause rotation' : 'Start rotation'}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isRotating ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RotateCw size={14} className={isRotating ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsWireframe(!isWireframe)}
            title="Toggle Wireframe CAD topology"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isWireframe ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Box size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Floating Material & Stone Toolbar */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2 bg-black/70 backdrop-blur-md rounded-xl border border-white/10">
        {/* Metal Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-zinc-400 pl-1">Alloy:</span>
          {(Object.keys(METALS) as Array<keyof typeof METALS>).map((metal) => (
            <button
              key={metal}
              onClick={() => setSelectedMetal(metal)}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all ${
                selectedMetal === metal
                  ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80'
              }`}
            >
              {metal === 'yellow-gold' ? 'YG 18K' : metal === 'white-gold' ? 'WG 18K' : metal === 'rose-gold' ? 'RG 18K' : 'PT 950'}
            </button>
          ))}
        </div>

        {/* Stone Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-zinc-400">Gem:</span>
          {(Object.keys(STONES) as Array<keyof typeof STONES>).map((stone) => (
            <button
              key={stone}
              onClick={() => setSelectedStone(stone)}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all ${
                selectedStone === stone
                  ? 'bg-emerald-400 text-black font-bold shadow-md shadow-emerald-400/20'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80'
              }`}
            >
              {stone.charAt(0).toUpperCase() + stone.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
