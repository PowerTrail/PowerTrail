'use client';

import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define component information with proper typing
const substationComponents = [
  {
    id: 'transformer',
    name: 'Power Transformer',
    title: 'The Heart of the Grid',
    description: 'Transforms voltage between transmission and distribution levels. The transformer is a critical component that facilitates the change in voltage levels across the power grid, enabling efficient power transmission over long distances while allowing for safe distribution to end users.',
    details: 'Power transformers manipulate electromagnetic fields to change voltage levels. Higher voltages are used for long-distance transmission to reduce energy loss, while lower voltages are safer for local distribution.',
    modelPath: '/models/transformer.glb',
    position: [1.5, 0.3, 0] as [number, number, number],
    color: '#3498db'
  },
  {
    id: 'control',
    name: 'Control House',
    title: 'The Brain Center',
    description: 'Contains protective relays and monitoring systems that manage the operation of the substation. The control house serves as the central nervous system, providing real-time data and allowing for remote operation and monitoring.',
    details: 'Modern control houses feature SCADA systems (Supervisory Control and Data Acquisition) that enable operators to monitor and control equipment from remote locations, improving efficiency and reducing response times during emergencies.',
    modelPath: '/models/Control_Protection.glb',
    position: [-1.5, 0.3, 0] as [number, number, number],
    color: '#2ecc71'
  },
  {
    id: 'switchgear',
    name: 'Switchgear',
    title: 'The Protection System',
    description: 'Houses circuit breakers and isolation switches that protect the grid from faults and overloads. Switchgear equipment is essential for safe operation and maintenance of the power distribution network.',
    details: 'Circuit breakers in switchgear equipment can detect faults and automatically disconnect affected sections of the grid in milliseconds, preventing widespread outages and potential equipment damage.',
    modelPath: '/models/Outgoing_Section.glb',
    position: [-1.5, 0.3, -1] as [number, number, number],
    color: '#e74c3c'
  },
  {
    id: 'yard',
    name: 'Substation Yard',
    title: 'The Foundation',
    description: 'Contains busbars, insulators, and connection elements that form the physical infrastructure of the substation. The yard is where power lines connect and where the actual voltage transformation and switching occur.',
    details: 'Substation yards are designed with safety clearances that account for voltage levels, with higher voltages requiring greater distances between components to prevent arcing and ensure maintenance safety.',
    modelPath: '/models/Substation_Yard.glb',
    position: [0, 0.3, 0] as [number, number, number],
    scale: [1.5, 1.5, 1.5] as [number, number, number],
    color: '#f39c12'
  }
];

export default function ImmersiveSubstationExplorer() {
  // State management
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const animationInProgressRef = useRef<boolean>(false);
  
  // THREE.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRefs = useRef<{[key: string]: THREE.Object3D}>({});
  const frameIdRef = useRef<number | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  
  // Initialize the scene
  useEffect(() => {
    if (showIntro) return;
    if (!canvasRef.current || !containerRef.current) return;
    
    // Create scene with transparent background
    const scene = new THREE.Scene();
    scene.background = null; // Make scene background transparent
    sceneRef.current = scene;
    
    // Create camera - position closer for better view
    const camera = new THREE.PerspectiveCamera(
      50, // narrower FOV for more focus
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 3, 5); // Closer position
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Create renderer with transparency to blend with background
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true // Enable transparency
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setClearColor(0x000000, 0); // Transparent background
    rendererRef.current = renderer;
    
    // Add enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Main directional light with better shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.bias = -0.0005;
    scene.add(directionalLight);
    
    // Blue accent light for atmosphere
    const blueLight = new THREE.PointLight(0x0066ff, 1.5, 20);
    blueLight.position.set(-5, 3, 5);
    scene.add(blueLight);
    
    // Green accent light for contrast
    const greenLight = new THREE.PointLight(0x00ff66, 1, 15);
    greenLight.position.set(5, 2, -5);
    scene.add(greenLight);
    
    // Add subtle reflective floor
    const floorGeometry = new THREE.CircleGeometry(10, 32);
    const floorMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
      roughness: 0.15,
      metalness: 0.7,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.2
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Add subtle ambient particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300; // Reduced count
    
    const posArray = new Float32Array(particlesCount * 3);
    const scaleArray = new Float32Array(particlesCount);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Position particles closer to the models
      const radius = 5 + Math.random() * 3; // Much smaller radius
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = (radius * Math.sin(phi) * Math.sin(theta) * 0.5) + 1; // Slightly higher
      posArray[i + 2] = radius * Math.cos(phi);
      
      // Smaller random sizes
      scaleArray[i / 3] = Math.random() * 0.5;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x4488ff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;
    
    // Animation loop with particle rotation
    const animate = () => {
      // Animate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0005;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    frameIdRef.current = requestAnimationFrame(animate);
    
    // Load models
    loadModels();
    
    // Window resize handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIntro]);
  
  // Load models
  const loadModels = async () => {
    try {
      // Dynamically import GLTFLoader
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      
      const loader = new GLTFLoader();
      let loadedCount = 0;
      
      // Create loading manager to properly track progress
      const manager = new THREE.LoadingManager();
      
      manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        // Avoid division by zero
        if (itemsTotal > 0) {
          const progressValue = Math.floor((itemsLoaded / itemsTotal) * 100);
          setProgress(progressValue);
        } else {
          setProgress(0);
        }
      };
      
      manager.onLoad = () => {
        setLoading(false);
        // Set up first model
        setTimeout(() => {
          animateModelIn(0);
        }, 500);
      };
      
      const customLoader = new GLTFLoader(manager);
      
      for (const component of substationComponents) {
        try {
          // Create placeholder for model
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const material = new THREE.MeshStandardMaterial({ 
            color: component.color,
            transparent: true,
            opacity: 0.1
          });
          const box = new THREE.Mesh(geometry, material);
          box.position.set(...component.position);
          box.scale.set(0.1, 0.1, 0.1); // Start small
          
          if (sceneRef.current) {
            sceneRef.current.add(box);
            modelRefs.current[`${component.id}_placeholder`] = box;
          }
          
          // Load actual model
          customLoader.load(
            component.modelPath,
            (gltf) => {
              const model = gltf.scene;
              
              // Initially position offscreen (will animate in later)
              model.position.set(
                component.position[0] + 20, 
                component.position[1], 
                component.position[2]
              );
              
              // Scale if needed
              if (component.scale) {
                model.scale.set(...component.scale);
              }
              
              // Setup shadows and materials
              model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  
                  // Create emissive materials for highlighting
                  if (child.material) {
                    const stdMaterial = new THREE.MeshStandardMaterial({
                      color: child.material.color || 0xffffff,
                      roughness: 0.7,
                      metalness: 0.3,
                      emissive: new THREE.Color(0x000000)
                    });
                    child.material = stdMaterial;
                  }
                }
              });
              
              // Add model to scene
              if (sceneRef.current) {
                sceneRef.current.add(model);
                modelRefs.current[component.id] = model;
                
                // Remove placeholder
                const placeholder = modelRefs.current[`${component.id}_placeholder`];
                if (placeholder) {
                  sceneRef.current.remove(placeholder);
                  delete modelRefs.current[`${component.id}_placeholder`];
                }
              }
              
              loadedCount++;
            },
            undefined,
            (error) => {
              console.error(`Error loading model ${component.id}:`, error);
              loadedCount++;
            }
          );
        } catch (err) {
          console.error(`Failed to load model ${component.id}:`, err);
          loadedCount++;
        }
      }
    } catch (error) {
      console.error("Error loading GLTFLoader:", error);
      setLoading(false);
    }
  };
  
  // Animate model into view
  const animateModelIn = (index: number) => {
    if (index < 0 || index >= substationComponents.length) return;
    if (animationInProgressRef.current) return;
    
    animationInProgressRef.current = true;
    
    const component = substationComponents[index];
    const model = modelRefs.current[component.id];
    
    if (!model || !cameraRef.current) {
      animationInProgressRef.current = false;
      return;
    }
    
    // Hide all other models by moving them off-screen
    Object.entries(modelRefs.current).forEach(([id, obj]) => {
      if (id !== component.id && !id.includes('_placeholder')) {
        // Move off-screen to the right
        const comp = substationComponents.find(c => c.id === id);
        if (comp) {
          obj.position.set(
            comp.position[0] + 20, 
            comp.position[1], 
            comp.position[2]
          );
        }
        
        // Reset material emissive
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.emissive.set(0x000000);
            child.material.emissiveIntensity = 0;
          }
        });
      }
    });
    
    // Animate text fade
    setTextOpacity(0);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentSection(index);
      setTextOpacity(1);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
    
    // Get target position
    const targetPosition = new THREE.Vector3(
      component.position[0],
      component.position[1],
      component.position[2]
    );
    
    // Get start position (off-screen)
    const startPosition = new THREE.Vector3(
      component.position[0] + 20,
      component.position[1],
      component.position[2]
    );
    
    // Only animate if not already at target
    if (model.position.distanceTo(targetPosition) > 0.1) {
      // Animate model coming into view
      const duration = 800; // ms
      const startTime = Date.now();
      
      const animateModel = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Cubic ease out
        const easing = 1 - Math.pow(1 - progress, 3);
        
        // Update position
        model.position.lerpVectors(startPosition, targetPosition, easing);
        
        // Continue animation if not complete
        if (progress < 1) {
          requestAnimationFrame(animateModel);
        } else {
          // Highlight model when animation completes
          model.traverse((child) => {
            if (child instanceof THREE.Mesh && 
                child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissive.set(component.color);
              child.material.emissiveIntensity = 0.5;
            }
          });
          
          // Animation finished
          setTimeout(() => {
            animationInProgressRef.current = false;
          }, 100);
        }
      };
      
      // Start animation
      animateModel();
    } else {
      // Already at target - just highlight
      model.traverse((child) => {
        if (child instanceof THREE.Mesh && 
            child.material instanceof THREE.MeshStandardMaterial) {
          child.material.emissive.set(component.color);
          child.material.emissiveIntensity = 0.5;
        }
      });
      
      // Animation finished
      setTimeout(() => {
        animationInProgressRef.current = false;
      }, 100);
    }
    
    // Update camera to focus on model - closer camera position
    const cameraPosition = new THREE.Vector3(
      targetPosition.x + 4, // Closer
      targetPosition.y + 2.5, // Slightly higher
      targetPosition.z + 4  // Closer
    );
    
    // Animate camera
    const cameraStartPosition = cameraRef.current.position.clone();
    const cameraDuration = 1000; // ms
    const cameraStartTime = Date.now();
    
    const animateCamera = () => {
      const elapsed = Date.now() - cameraStartTime;
      const progress = Math.min(elapsed / cameraDuration, 1);
      
      // Cubic ease out
      const easing = 1 - Math.pow(1 - progress, 3);
      
      // Update camera position
      cameraRef.current!.position.lerpVectors(cameraStartPosition, cameraPosition, easing);
      
      // Look at model
      cameraRef.current!.lookAt(targetPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    
    animateCamera();
  };
  
  // Start experience
  const startExperience = () => {
    setShowIntro(false);
  };
  
  // Handle scroll events
  useEffect(() => {
    if (showIntro) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Prevent rapid scrolling and only process if not already in transition
      const now = Date.now();
      if (now - lastScrollTimeRef.current < 800 || isTransitioning || loading || animationInProgressRef.current) {
        return;
      }
      
      lastScrollTimeRef.current = now;
      
      // Determine scroll direction
      const direction = e.deltaY > 0 ? 1 : -1;
      const nextSection = Math.min(
        substationComponents.length - 1,
        Math.max(0, currentSection + direction)
      );
      
      if (nextSection !== currentSection) {
        animateModelIn(nextSection);
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [showIntro, currentSection, isTransitioning, loading]);
  
  // Go to next section
  const goToNextSection = () => {
    if (isTransitioning || loading || animationInProgressRef.current) return;
    
    const nextSection = Math.min(currentSection + 1, substationComponents.length - 1);
    if (nextSection !== currentSection) {
      animateModelIn(nextSection);
    }
  };
  
  // Go to previous section
  const goToPrevSection = () => {
    if (isTransitioning || loading || animationInProgressRef.current) return;
    
    const prevSection = Math.max(currentSection - 1, 0);
    if (prevSection !== currentSection) {
      animateModelIn(prevSection);
    }
  };
  
  // Go to specific section
  const goToSection = (index: number) => {
    if (isTransitioning || loading || animationInProgressRef.current) return;
    
    if (index !== currentSection) {
      animateModelIn(index);
    }
  };
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Intro screen with stunning background */}
      {showIntro && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-white">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950 to-black overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-12 opacity-20">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="border-r border-blue-500 h-full"></div>
              ))}
            </div>
            <div className="absolute inset-0 grid grid-rows-12 opacity-20">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="border-b border-blue-500 w-full"></div>
              ))}
            </div>
            
            {/* Particle effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(100)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full bg-blue-500"
                  style={{
                    width: `${Math.random() * 4 + 1}px`,
                    height: `${Math.random() * 4 + 1}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.1,
                    animation: `pulse ${Math.random() * 5 + 2}s infinite`,
                    animationDelay: `${Math.random() * 5}s`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 text-center px-6">
            <h1 className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              POWER GRID EXPLORER
            </h1>
            <p className="text-xl text-center max-w-2xl mx-auto mb-12 text-blue-100">
              Discover the critical infrastructure that forms the backbone of modern electrical distribution through an immersive 3D experience
            </p>
            <Button 
              onClick={startExperience}
              className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 border border-blue-400 shadow-lg shadow-blue-900/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/60 hover:scale-105"
            >
              Begin Journey
            </Button>
          </div>
          
          {/* Subtle instruction */}
          <div className="absolute bottom-8 left-0 right-0 text-center text-blue-300 text-sm animate-bounce">
            Scroll to navigate between components
          </div>
        </div>
      )}
      
      {/* Main content */}
      {!showIntro && (
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2">
          {/* Left panel - text content */}
          <div className="relative bg-gradient-to-br from-gray-950 to-blue-950 text-white flex items-center overflow-hidden">
            {/* Background grid lines for decoration */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 border-r border-blue-500"></div>
              <div className="absolute inset-0 border-b border-blue-500"></div>
              <div className="grid grid-cols-4 h-full">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border-r border-blue-500 h-full"></div>
                ))}
              </div>
              <div className="grid grid-rows-4 w-full">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border-b border-blue-500 w-full"></div>
                ))}
              </div>
            </div>
            
            {/* Animated accent elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full filter blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500 rounded-full filter blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div 
              className="p-16 transition-opacity duration-500 ease-in-out z-10"
              style={{ opacity: textOpacity }}
            >
              <div className="max-w-xl">
                <div className="mb-6 text-blue-400 flex items-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-900 border border-blue-400 mr-3">
                    {currentSection + 1}
                  </div>
                  <div className="h-px flex-grow bg-gradient-to-r from-blue-400 to-transparent"></div>
                  <div className="ml-3 text-blue-300">{substationComponents.length}</div>
                </div>
                
                <h2 className="text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">
                  {substationComponents[currentSection].title}
                </h2>
                
                <h3 className="text-2xl text-blue-300 mb-8">
                  {substationComponents[currentSection].name}
                </h3>
                
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  {substationComponents[currentSection].description}
                </p>
                
                <p className="text-base text-gray-400 mb-12 leading-relaxed">
                  {substationComponents[currentSection].details}
                </p>
                
                <div className="flex space-x-4">
                  {currentSection > 0 && (
                    <Button
                      onClick={goToPrevSection}
                      className="bg-blue-800 hover:bg-blue-700 px-4 py-2 border border-blue-700"
                      disabled={isTransitioning || loading || animationInProgressRef.current}
                    >
                      Previous
                    </Button>
                  )}
                  
                  {currentSection < substationComponents.length - 1 && (
                    <Button
                      onClick={goToNextSection}
                      className="bg-blue-600 hover:bg-blue-500 group px-6 py-3 border border-blue-400 shadow-lg shadow-blue-900/30"
                      disabled={isTransitioning || loading || animationInProgressRef.current}
                    >
                      Next Component
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right panel - 3D model with enhanced background */}
          <div ref={containerRef} className="relative bg-gradient-to-br from-gray-950 via-blue-950 to-black overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden opacity-70">
              <div className="absolute w-full h-full opacity-20">
                {/* Subtle radial glow */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-blue-900/30 to-transparent blur-3xl"></div>
              </div>
            </div>
            
            {/* Canvas for Three.js */}
            <canvas ref={canvasRef} className="w-full h-full relative z-10" />
            
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-950 via-blue-950 to-black bg-opacity-90 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center">
                  <div className="relative w-20 h-20">
                    <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-blue-400 text-lg">
                      {progress}%
                    </div>
                  </div>
                  <p className="text-blue-400 mt-4">Loading Components</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation dots - enhanced */}
          {!loading && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
              {substationComponents.map((component, index) => (
                <button
                  key={component.id}
                  className={`relative h-3 rounded-full transition-all duration-300 overflow-hidden ${
                    isTransitioning || animationInProgressRef.current ? 'cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    currentSection === index 
                      ? 'w-12 bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50' 
                      : 'w-3 bg-white/20 hover:bg-white/40'
                  }`}
                  onClick={() => goToSection(index)}
                  disabled={isTransitioning || loading || animationInProgressRef.current}
                  aria-label={`View ${component.name}`}
                >
                  {/* Glowing effect for active dot */}
                  {currentSection === index && (
                    <span className="absolute inset-0 bg-blue-400 animate-pulse opacity-60"></span>
                  )}
                </button>
              ))}
            </div>
          )}
          
          {/* Instructions */}
          {!loading && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white/90 text-sm z-20 bg-blue-950/70 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-800/50 shadow-lg">
              Scroll or use navigation dots to explore components
            </div>
          )}
          
          {/* Section indicator (corners) */}
          <div className="absolute top-6 left-6 text-blue-400 font-mono z-20">
            {currentSection + 1}/{substationComponents.length}
          </div>
          
          {/* Hidden style for animations */}
          <style jsx>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.5); opacity: 0.4; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}