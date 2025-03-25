'use client';

import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { RotateCcw, ZoomIn, ZoomOut, Info, RefreshCw } from 'lucide-react';

// Define types for our substation components
interface ComponentInfo {
  id: string;
  name: string;
  description: string;
  modelPath: string;
  position: [number, number, number];
  scale?: [number, number, number];
  color: string;
}

// The substation components with adjusted Y positions
const substationComponents: ComponentInfo[] = [
  {
    id: 'transformer',
    name: 'Power Transformer',
    description: 'Transforms voltage between high and low levels. Essential for matching transmission voltages to distribution needs. The core consists of laminated steel sheets to reduce eddy current losses.',
    modelPath: '/models/transformer.glb',
    position: [2, 0.8, 1],
    color: '#3498db'
  },
  {
    id: 'control',
    name: 'Control House',
    description: 'Contains protective relays, batteries, monitoring systems and control equipment. Houses the SCADA systems, protection relays and communication equipment that ensure the safe operation of the substation.',
    modelPath: '/models/Control_Protection.glb',
    position: [-2, 0.4, 2],
    color: '#2ecc71'
  },
  {
    id: 'switchgear',
    name: 'Switchgear',
    description: 'Houses circuit breakers and switches that protect, control and isolate electrical equipment. These devices interrupt fault currents and provide isolation for maintenance work.',
    modelPath: '/models/Outgoing_Section.glb',
    position: [-2, 0.3, -2],
    color: '#e74c3c'
  },
  {
    id: 'yard',
    name: 'Substation Yard',
    description: 'The main yard containing various equipment including busbars, insulators, and connection elements. This area forms the backbone of the substation, connecting all equipment in a carefully designed layout.',
    modelPath: '/models/Substation_Yard.glb',
    position: [0, 0.7, 0],
    scale: [1.5, 1.5, 1.5],
    color: '#f39c12'
  }
];

export default function SubstationExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [infoComponent, setInfoComponent] = useState<ComponentInfo | null>(null);
  const [loadingFailed, setLoadingFailed] = useState(false);
  
  // Store references for scene objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRefs = useRef<{[key: string]: THREE.Object3D}>({});
  const labelRefs = useRef<{[key: string]: HTMLDivElement}>({});
  const animationFrameId = useRef<number | null>(null);
  const labelContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Track loaded models
  const loadedModelsRef = useRef<Set<string>>(new Set());
  const totalModelsRef = useRef<number>(substationComponents.length);
  
  // Define focusComponent function at the component scope level (not inside useEffect)
  const focusComponent = (id: string) => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const model = modelRefs.current[id];
    if (!model) return;
    
    setActiveComponent(id);
    
    // Find the component data
    const component = substationComponents.find(c => c.id === id);
    if (component) {
      setInfoComponent(component);
    }
    
    // Get model world position
    const position = new THREE.Vector3();
    model.getWorldPosition(position);
    
    // Calculate new camera position - pull back from object
    const distance = 5; // Adjust as needed
    const direction = new THREE.Vector3(1, 0.8, 1).normalize();
    const newPosition = position.clone().add(direction.multiplyScalar(distance));
    
    // Animate camera movement
    gsap.to(cameraRef.current.position, {
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
      duration: 1.5,
      ease: "power2.inOut"
    });
    
    gsap.to(controlsRef.current.target, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        controlsRef.current?.update();
      }
    });
    
    // Highlight model
    Object.entries(modelRefs.current).forEach(([modelId, modelObj]) => {
      modelObj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (modelId === id) {
            // Create highlighted material
            const highlightMaterial = child.material.clone();
            if ('emissive' in highlightMaterial) {
              highlightMaterial.emissive = new THREE.Color(component?.color || '#ffffff');
              highlightMaterial.emissiveIntensity = 0.3;
              child.material = highlightMaterial;
            }
          } else {
            // Reset material
            if ('emissive' in child.material) {
              child.material.emissive = new THREE.Color(0x000000);
              child.material.emissiveIntensity = 0;
            }
          }
        }
      });
    });
  };

  // Function to retry loading all models
  const retryLoading = () => {
    // Reset states
    setLoading(true);
    setLoadingFailed(false);
    loadedModelsRef.current.clear();
    setLoadingProgress(0);
    
    // Clear existing models from scene
    if (sceneRef.current) {
      Object.values(modelRefs.current).forEach(model => {
        sceneRef.current?.remove(model);
      });
      modelRefs.current = {};
    }
    
    // Clear existing labels
    Object.values(labelRefs.current).forEach(label => {
      if (label.parentNode) {
        label.parentNode.removeChild(label);
      }
    });
    labelRefs.current = {};
    
    // Create a new label container
    if (labelContainerRef.current && labelContainerRef.current.parentNode) {
      labelContainerRef.current.parentNode.removeChild(labelContainerRef.current);
    }
    
    const newLabelContainer = document.createElement('div');
    labelContainerRef.current = newLabelContainer;
    document.body.appendChild(newLabelContainer);
    
    // Start loading models again
    if (sceneRef.current) {
      loadAllModels(sceneRef.current);
    }
  };
  
  // Function to load all models
  const loadAllModels = (scene: THREE.Scene) => {
    // Create central group for all components
    const substationGroup = new THREE.Group();
    scene.add(substationGroup);
    
    // Create loading manager
    const loadingManager = new THREE.LoadingManager();
    
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = Math.floor((itemsLoaded / itemsTotal) * 100);
      setLoadingProgress(progress);
    };
    
    loadingManager.onLoad = () => {
      // Check if all models were loaded
      if (loadedModelsRef.current.size === totalModelsRef.current) {
        setLoading(false);
        
        // Animate models when loading is complete
        Object.values(modelRefs.current).forEach((model, index) => {
          // Store original scale
          const originalScale = model.scale.clone();
          
          // Set initial scale to 0
          model.scale.set(0.001, 0.001, 0.001);
          
          // Animate to original scale with delay based on index
          gsap.to(model.scale, {
            x: originalScale.x,
            y: originalScale.y,
            z: originalScale.z,
            duration: 1.2,
            delay: 0.2 * index,
            ease: "elastic.out(1, 0.75)"
          });
        });
      } else {
        // Not all models loaded
        console.error("Not all models loaded correctly");
        setLoadingFailed(true);
      }
    };
    
    loadingManager.onError = (url) => {
      console.error("Error loading:", url);
      setLoadingFailed(true);
    };
    
    const loader = new GLTFLoader(loadingManager);
    
    // Create labels container if it doesn't exist
    if (!labelContainerRef.current) {
      const labelContainer = document.createElement('div');
      labelContainerRef.current = labelContainer;
      document.body.appendChild(labelContainer);
    }
    
    // Load each component
    substationComponents.forEach((component, index) => {
      // Create label
      const label = document.createElement('div');
      label.className = 'absolute px-3 py-1 text-white text-sm font-medium rounded-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 opacity-0';
      label.style.backgroundColor = component.color;
      label.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
      label.style.transition = 'all 0.3s ease';
      label.style.pointerEvents = 'auto';
      label.textContent = component.name;
      
      // Safe way to add click event
      const handleLabelClick = () => {
        focusComponent(component.id);
      };
      
      label.addEventListener('click', handleLabelClick);
      
      if (labelContainerRef.current) {
        labelContainerRef.current.appendChild(label);
        labelRefs.current[component.id] = label;
      }
      
      // Load model with retry logic
      const loadModel = (retryCount = 0) => {
        loader.load(
          component.modelPath,
          (gltf) => {
            const model = gltf.scene;
            
            // Position and scale
            model.position.set(...component.position);
            
            if (component.scale) {
              model.scale.set(...component.scale);
            }
            
            // Enable shadows
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            
            model.userData = { id: component.id };
            modelRefs.current[component.id] = model;
            substationGroup.add(model);
            
            // Mark as loaded
            loadedModelsRef.current.add(component.id);
            
            // Animate label appearance
            setTimeout(() => {
              gsap.to(label, {
                opacity: 1,
                duration: 0.5,
                delay: index * 0.1
              });
            }, 1000);
          },
          (xhr) => {
            // Progress callback
            const progress = Math.floor((xhr.loaded / xhr.total) * 100);
            console.log(`${component.id}: ${progress}% loaded`);
          },
          (error) => {
            console.error(`Error loading model ${component.id}:`, error);
            
            // Retry logic - try up to 3 times
            if (retryCount < 3) {
              console.log(`Retrying ${component.id}, attempt ${retryCount + 1}`);
              setTimeout(() => loadModel(retryCount + 1), 1000); // Wait 1 second before retry
            } else {
              setLoadingFailed(true);
            }
          }
        );
      };
      
      // Start loading
      loadModel();
    });
  };
  
  // Scene setup
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;
    
    // Add fog for depth effect
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(8, 5, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    
    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Limit vertical rotation
    controlsRef.current = controls;
    
    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);
    
    // Add fill light from opposite direction
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);
    
    // Add hemisphere light for better ambient illumination
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    scene.add(hemiLight);
    
    // Add ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0; // Keep ground at level 0
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add grid helper
    const grid = new THREE.GridHelper(50, 50, 0x555555, 0x333333);
    grid.position.y = 0.01; // Slightly above ground to prevent z-fighting
    scene.add(grid);
    
    // Start loading models
    loadAllModels(scene);
    
    // Function to update label positions
    const updateLabels = () => {
      // Make sure camera exists before using it
      if (!cameraRef.current) return;
      
      Object.entries(modelRefs.current).forEach(([id, model]) => {
        const label = labelRefs.current[id];
        if (!label) return;
        
        // Get world position
        const position = new THREE.Vector3();
        model.getWorldPosition(position);
        
        // Add offset for better positioning
        position.y += 2;
        
        // Project to screen coordinates - ensure camera exists
        const camera = cameraRef.current;
        if (!camera) return;  // Additional null check to satisfy TypeScript
        
        position.project(camera);  // Now TypeScript knows camera is not null
        
        // Convert to pixel coordinates
        if (!containerRef.current) return;
        const x = (position.x * 0.5 + 0.5) * containerRef.current.clientWidth;
        const y = (position.y * -0.5 + 0.5) * containerRef.current.clientHeight;
        
        // Only show if in front of camera
        if (position.z < 1) {
          label.style.display = showLabels ? 'block' : 'none';
          label.style.left = `${x}px`;
          label.style.top = `${y}px`;
          
          // Highlight if active
          if (id === activeComponent) {
            label.style.transform = 'translate(-50%, -50%) scale(1.1)';
            label.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.7)';
          } else {
            label.style.transform = 'translate(-50%, -50%)';
            label.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
          }
        } else {
          label.style.display = 'none';
        }
      });
    };
    
    // Create raycaster for model interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Handle mouse move
    const onMouseMove = (event: MouseEvent) => {
      // Calculate mouse position
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    
    // Handle click on models
    const onClick = (event: MouseEvent) => {
      // Update raycaster
      raycaster.setFromCamera(mouse, camera);
      
      // Get all models
      const models = Object.values(modelRefs.current);
      if (models.length === 0) return;
      
      // Check for intersections with all models and their children
      const intersects = raycaster.intersectObjects(models, true);
      
      if (intersects.length > 0) {
        // Find the top-level parent that has userData.id
        let currentObj: THREE.Object3D | null = intersects[0].object;
        
        while (currentObj && !currentObj.userData?.id) {
          currentObj = currentObj.parent;
        }
        
        if (currentObj && currentObj.userData?.id) {
          focusComponent(currentObj.userData.id);
        }
      }
    };
    
    // Register event listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    
    // Add window resize handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Update labels if they are visible
      if (showLabels) {
        updateLabels();
      }
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Continue animation loop
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationFrameId.current = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      
      // Cancel animation frame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      // Clean up all labels
      Object.values(labelRefs.current).forEach(label => {
        if (label.parentNode) {
          label.parentNode.removeChild(label);
        }
      });
      
      // Remove label container
      if (labelContainerRef.current && labelContainerRef.current.parentNode) {
        labelContainerRef.current.parentNode.removeChild(labelContainerRef.current);
      }
      
      // Dispose of geometries and materials
      if (sceneRef.current) {
        sceneRef.current.traverse(object => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      // Dispose of renderer and controls
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, []);
  
  // Update label visibility when showLabels changes
  useEffect(() => {
    Object.values(labelRefs.current).forEach(label => {
      label.style.display = showLabels ? 'block' : 'none';
    });
  }, [showLabels]);
  
  // Handle zoom in/out
  const handleZoom = (direction: 'in' | 'out') => {
    if (!controlsRef.current || !cameraRef.current) return;
    
    const controls = controlsRef.current;
    const currentDistance = controls.getDistance();
    const newDistance = direction === 'in' 
      ? Math.max(currentDistance * 0.8, controls.minDistance)
      : Math.min(currentDistance * 1.2, controls.maxDistance);
    
    // Calculate new position
    const dir = new THREE.Vector3().subVectors(
      cameraRef.current.position,
      controls.target
    ).normalize();
    
    const newPos = controls.target.clone().add(
      dir.multiplyScalar(newDistance)
    );
    
    // Animate to new position
    gsap.to(cameraRef.current.position, {
      x: newPos.x,
      y: newPos.y,
      z: newPos.z,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: function() {
        if (controlsRef.current) {
          controlsRef.current.update();
        }
      }
    });
  };
  
  // Reset view handler
  const handleReset = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    // Reset camera position
    gsap.to(cameraRef.current.position, {
      x: 8, y: 5, z: 8,
      duration: 1.5,
      ease: "power2.inOut"
    });
    
    // Reset target
    gsap.to(controlsRef.current.target, {
      x: 0, y: 0, z: 0,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: function() {
        if (controlsRef.current) {
          controlsRef.current.update();
        }
      }
    });
    
    // Reset materials
    Object.values(modelRefs.current).forEach(model => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh && 'emissive' in child.material) {
          child.material.emissive = new THREE.Color(0x000000);
          child.material.emissiveIntensity = 0;
        }
      });
    });
    
    setActiveComponent(null);
    setInfoComponent(null);
  };
  
  return (
    <div className="w-full h-full relative overflow-hidden bg-gray-900 text-white">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center">
          {loadingFailed ? (
            <div className="text-center">
              <p className="text-red-400 mb-4">Failed to load some models.</p>
              <Button 
                onClick={retryLoading}
                className="bg-blue-600 hover:bg-blue-700 flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Retry Loading
              </Button>
            </div>
          ) : (
            <>
              <div className="w-64 h-2 bg-gray-800 rounded-full mb-4 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-blue-400">Loading substation models... {loadingProgress}%</p>
            </>
          )}
        </div>
      )}
      
      {/* 3D container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
      >
        <canvas 
          ref={canvasRef}
          className="w-full h-full outline-none"
        />
      </div>
      
      {/* Controls overlay */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-black/50 backdrop-blur-sm border-gray-700 text-gray-200 hover:bg-gray-800"
          onClick={() => handleZoom('in')}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="bg-black/50 backdrop-blur-sm border-gray-700 text-gray-200 hover:bg-gray-800"
          onClick={() => handleZoom('out')}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="bg-black/50 backdrop-blur-sm border-gray-700 text-gray-200 hover:bg-gray-800"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={`bg-black/50 backdrop-blur-sm border-gray-700 ${showLabels ? 'text-blue-400' : 'text-gray-400'} hover:bg-gray-800`}
          onClick={() => setShowLabels(!showLabels)}
        >
          <Info className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Component list */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm p-3 rounded-lg max-w-xs">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Substation Components</h3>
        <div className="space-y-1">
          {substationComponents.map(component => (
            <button
              key={component.id}
              className={`w-full text-left px-3 py-2 rounded text-sm flex items-center space-x-2 transition-colors ${
                activeComponent === component.id 
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => focusComponent(component.id)}
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: component.color }}
              ></div>
              <span>{component.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Information panel */}
      {infoComponent && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md p-4 z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold" style={{ color: infoComponent.color }}>
              {infoComponent.name}
            </h2>
            <p className="mt-2 text-gray-200">
              {infoComponent.description}
            </p>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-black/50 backdrop-blur-sm p-2 rounded">
        <p>Drag to rotate | Scroll to zoom | Click components to explore</p>
      </div>
      
      {/* Hidden reload button - development only */}
      <button 
        className="absolute bottom-4 left-4 text-xs text-gray-400 bg-black/50 p-2 rounded flex items-center"
        onClick={retryLoading}
      >
        <RefreshCw className="w-3 h-3 mr-1" /> Reload Models
      </button>
    </div>
  );
}