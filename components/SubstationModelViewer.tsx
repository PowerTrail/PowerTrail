import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  RotateCcw, 
  Info,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';

interface SubstationModelViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define component type
interface SubstationComponent {
  id: string;
  name: string;
  description: string;
  position: THREE.Vector3;
  color: string;
}

// Explicitly type the model paths object
const MODEL_PATHS: Record<string, string> = {
  transformer: '/models/transformer.glb',
  outgoing: '/models/Outgoing_Section.glb',
  control: '/models/Control_Protection.glb',
  yard: '/models/Substation_Yard.glb'
};


// Substation components with descriptions and positions
const SUBSTATION_COMPONENTS: SubstationComponent[] = [
  { 
    id: 'transformer',
    name: 'Power Transformer', 
    description: 'Transforms voltage between high and low levels.',
    position: new THREE.Vector3(3, 0.8, 0),
    color: '#3498db'
  },
  { 
    id: 'outgoing',
    name: 'Outgoing', 
    description: 'Combines switches, fuses or circuit breakers for protection.',
    position: new THREE.Vector3(-3, 0.5, 1),
    color: '#e74c3c'
  },
  { 
    id: 'control',
    name: 'Control House', 
    description: 'Contains protective relays, batteries and control equipment.',
    position: new THREE.Vector3(-4, 0.5, -2),
    color: '#2ecc71'
  },
  { 
    id: 'yard',
    name: 'Substation Yard', 
    description: 'The main yard of the substation with various equipment.',
    position: new THREE.Vector3(0, 0.9, 0),
    color: '#f39c12'
  }
];

// Type-safe function to create basic shape
const createBasicShape = (component: SubstationComponent): THREE.Mesh => {
  let geometry: THREE.BufferGeometry;
  
  switch(component.id) {
    case 'transformer':
      geometry = new THREE.BoxGeometry(2, 2, 2);
      break;
    case 'switchgear':
      geometry = new THREE.BoxGeometry(3, 1, 2);
      break;
    case 'control':
      geometry = new THREE.BoxGeometry(2, 2, 3);
      break;
    case 'yard':
    default:
      geometry = new THREE.BoxGeometry(10, 0.5, 10);
      break;
  }
  
  const material = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(component.color),
    metalness: 0.5,
    roughness: 0.3
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(component.position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

export function SubstationModelViewer({ isOpen, onOpenChange }: SubstationModelViewerProps) {
  // Strongly typed refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelMeshesRef = useRef<Record<string, THREE.Object3D>>({});
  const labelsRef = useRef<Record<string, HTMLDivElement>>({});
  const animationFrameRef = useRef<number | null>(null);
  
  // State
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [infoPanel, setInfoPanel] = useState<{
    visible: boolean, 
    component: SubstationComponent | null
  }>({
    visible: false,
    component: null
  });
  
  // Camera control state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });

  // Define updateLabelPositions with useCallback to fix dependency warnings
  const updateLabelPositions = useCallback(() => {
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const container = containerRef.current;
    
    if (!camera || !renderer || !container) return;
    
    SUBSTATION_COMPONENTS.forEach(component => {
      const labelElement = labelsRef.current[component.id];
      if (!labelElement) return;
      
      // Use model position if available, otherwise use predefined position
      const model = modelMeshesRef.current[component.id];
      let position;
      
      if (model) {
        // Calculate center of the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        position = new THREE.Vector3(center.x, center.y + 2, center.z);
      } else {
        position = new THREE.Vector3(
          component.position.x,
          component.position.y + 2,
          component.position.z
        );
      }
      
      // Project to screen coordinates
      const vector = position.clone().project(camera);
      
      // Convert to pixel coordinates
      const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
      const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
      
      // Only show if in front of camera
      if (vector.z < 1) {
        labelElement.style.display = showLabels ? 'block' : 'none';
        labelElement.style.left = `${x}px`;
        labelElement.style.top = `${y}px`;
        
        // Highlight if selected
        if (component.id === selectedComponent) {
          labelElement.style.transform = 'translate(-50%, -50%) scale(1.1)';
          labelElement.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.7)';
        } else {
          labelElement.style.transform = 'translate(-50%, -50%)';
          labelElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.7)';
        }
      } else {
        labelElement.style.display = 'none';
      }
    });
  }, [selectedComponent, showLabels]);

  // Clean up function as a callback to ensure consistent reference
  const cleanup = useCallback(() => {
    // Cancel animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clean up labels - create a copy to avoid modification during iteration
    const labels = { ...labelsRef.current };
    Object.values(labels).forEach(label => {
      if (label.parentNode) {
        label.parentNode.removeChild(label);
      }
    });
    labelsRef.current = {};
    
    // Clean up renderer
    if (rendererRef.current) {
      try {
        const container = containerRef.current;
        if (container && container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      } catch (e) {
        console.warn("Error removing renderer:", e);
      }
      
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    
    // Clean up Three.js resources
    if (sceneRef.current) {
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      sceneRef.current = null;
    }
    
    cameraRef.current = null;
    modelMeshesRef.current = {};
  }, []);

  // Focus on component function
  const focusOnComponent = useCallback((componentId: string) => {
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    
    if (!camera || !scene) return;
    
    setSelectedComponent(componentId);
    
    // Find the component
    const component = SUBSTATION_COMPONENTS.find(c => c.id === componentId);
    if (!component) return;
    
    // Show info panel
    setInfoPanel({
      visible: true,
      component
    });
    
    // Get focus position
    const model = modelMeshesRef.current[componentId];
    let targetPosition;
    
    if (model) {
      const box = new THREE.Box3().setFromObject(model);
      targetPosition = box.getCenter(new THREE.Vector3());
    } else {
      targetPosition = component.position.clone();
    }
    
    // Animate camera
    const currentPosition = camera.position.clone();
    const distance = currentPosition.length() * 0.7;
    
    // Create offset direction
    const direction = new THREE.Vector3(1, 0.8, 1).normalize();
    const targetCameraPosition = targetPosition.clone().add(direction.multiplyScalar(distance));
    
    // Animate move
    let startTime = 0;
    const duration = 800;
    
    const animateCamera = (timestamp: number) => {
      if (!cameraRef.current) return;
      
      if (startTime === 0) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easing = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate position
      cameraRef.current.position.lerpVectors(currentPosition, targetCameraPosition, easing);
      
      // Look at target
      cameraRef.current.lookAt(targetPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    
    requestAnimationFrame(animateCamera);
    
    // Highlight selected component
    Object.entries(modelMeshesRef.current).forEach(([id, model]) => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshStandardMaterial;
          
          if (material && material.emissive) {
            if (id === componentId) {
              const comp = SUBSTATION_COMPONENTS.find(c => c.id === id);
              if (comp) {
                material.emissive = new THREE.Color(comp.color);
                material.emissiveIntensity = 0.5;
              }
            } else {
              material.emissive = new THREE.Color(0x000000);
              material.emissiveIntensity = 0;
            }
          }
        }
      });
    });
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    
    // Clean up previous scene
    cleanup();
    
    // Only run initialization if we have a valid container
    const container = containerRef.current;
    if (!container) return;
    
    try {
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a1a);
      sceneRef.current = scene;
      
      // Add ground plane
      const groundGeometry = new THREE.PlaneGeometry(50, 50);
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x001a33,
        roughness: 0.7,
        metalness: 0.5
      });
      const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
      groundPlane.rotation.x = -Math.PI / 2;
      groundPlane.position.y = -0.1;
      groundPlane.receiveShadow = true;
      scene.add(groundPlane);
  
      // Add grid helper
      const grid = new THREE.GridHelper(50, 50, 0x0088ff, 0x001a33);
      grid.position.y = -0.09;
      scene.add(grid);
  
      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);
  
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
      directionalLight.position.set(5, 10, 7);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      scene.add(directionalLight);
      
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
      fillLight.position.set(-5, 5, -7);
      scene.add(fillLight);
      
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 0.5);
      scene.add(hemiLight);
  
      // Camera setup
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      const aspect = width / height;
      const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);
      camera.position.set(10, 8, 10);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;
  
      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        logarithmicDepthBuffer: true
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      
      // Create labels for components
      SUBSTATION_COMPONENTS.forEach(component => {
        const labelElement = document.createElement('div');
        labelElement.className = 'absolute';
        labelElement.style.backgroundColor = `${component.color}ee`;
        labelElement.style.color = 'white';
        labelElement.style.padding = '6px 12px';
        labelElement.style.borderRadius = '6px';
        labelElement.style.fontSize = '14px';
        labelElement.style.fontWeight = 'bold';
        labelElement.style.position = 'absolute';
        labelElement.style.transform = 'translate(-50%, -50%)';
        labelElement.style.cursor = 'pointer';
        labelElement.style.pointerEvents = 'auto';
        labelElement.style.zIndex = '100';
        labelElement.style.whiteSpace = 'nowrap';
        labelElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.7)';
        labelElement.style.display = showLabels ? 'block' : 'none';
        labelElement.textContent = component.name;
        
        // Need to create a stable function reference for the event listener
        const handleClick = () => focusOnComponent(component.id);
        labelElement.addEventListener('click', handleClick);
        // Store the handler for cleanup
        (labelElement as any).__clickHandler = handleClick;
        
        container.appendChild(labelElement);
        labelsRef.current[component.id] = labelElement;
      });
      
      // Add basic shapes
      SUBSTATION_COMPONENTS.forEach(component => {
        const mesh = createBasicShape(component);
        scene.add(mesh);
        modelMeshesRef.current[component.id] = mesh;
      });
      
      // Try to load actual models
      import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
        const loader = new GLTFLoader();
        
        SUBSTATION_COMPONENTS.forEach(component => {
          // Safely access model path
          const modelPath = MODEL_PATHS[component.id] || '';
          if (!modelPath) return;
          
          loader.load(
            modelPath,
            (gltf) => {
              // Safety check
              const currentScene = sceneRef.current;
              if (!currentScene) return;
              
              // Remove previous basic shape
              const existingModel = modelMeshesRef.current[component.id];
              if (existingModel && currentScene) {
                currentScene.remove(existingModel);
              }
              
              const model = gltf.scene;
              model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });
              
              model.position.copy(component.position);
              
              // Scale model appropriately
              if (component.id === 'yard') {
                model.scale.set(2, 2, 2);
              } else {
                model.scale.set(1, 1, 1);
              }
              
              currentScene.add(model);
              modelMeshesRef.current[component.id] = model;
            },
            undefined,
            (error) => {
              console.warn(`Could not load model for ${component.id}:`, error);
              // Model will remain as the basic shape
            }
          );
        });
      }).catch(err => {
        console.warn("Failed to load GLTFLoader:", err);
      });
      
      // Animation loop
      const animate = () => {
        const currentCamera = cameraRef.current;
        const currentRenderer = rendererRef.current;
        const currentScene = sceneRef.current;
        
        if (currentCamera && currentRenderer && currentScene) {
          // Update camera position based on rotation
          const radius = currentCamera.position.length();
          currentCamera.position.x = radius * Math.sin(rotationRef.current.y) * Math.cos(rotationRef.current.x);
          currentCamera.position.y = radius * Math.sin(rotationRef.current.x);
          currentCamera.position.z = radius * Math.cos(rotationRef.current.y) * Math.cos(rotationRef.current.x);
          
          // Look at center point
          currentCamera.lookAt(0, 0, 0);
          
          // Update labels
          updateLabelPositions();
          
          // Render scene
          currentRenderer.render(currentScene, currentCamera);
          
          // Continue animation
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };
      
      // Start animation loop
      animate();
      
      // Camera controls setup
      const onMouseDown = (event: MouseEvent) => {
        isDraggingRef.current = true;
        previousMousePositionRef.current = {
          x: event.clientX,
          y: event.clientY
        };
      };
      
      const onMouseMove = (event: MouseEvent) => {
        if (!isDraggingRef.current) return;
        
        const deltaMove = {
          x: event.clientX - previousMousePositionRef.current.x,
          y: event.clientY - previousMousePositionRef.current.y
        };
        
        rotationRef.current.y += deltaMove.x * 0.01;
        rotationRef.current.x = Math.max(
          -Math.PI/3, 
          Math.min(Math.PI/3, rotationRef.current.x - deltaMove.y * 0.01)
        );
        
        previousMousePositionRef.current = {
          x: event.clientX,
          y: event.clientY
        };
      };
      
      const onMouseUp = () => {
        isDraggingRef.current = false;
      };
      
      // Zoom handler
      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        
        const currentCamera = cameraRef.current;
        if (!currentCamera) return;
        
        const zoomSpeed = 0.1;
        const zoomFactor = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
        const distance = currentCamera.position.length();
        const newDistance = Math.max(5, Math.min(20, distance * zoomFactor));
        
        currentCamera.position.normalize().multiplyScalar(newDistance);
      };
      
      // Handle window resize
      const handleResize = () => {
        const currentCamera = cameraRef.current;
        const currentRenderer = rendererRef.current;
        const currentContainer = containerRef.current;
        
        if (!currentCamera || !currentRenderer || !currentContainer) return;
        
        const width = currentContainer.clientWidth;
        const height = currentContainer.clientHeight;
        
        if (width > 0 && height > 0) {
          currentCamera.aspect = width / height;
          currentCamera.updateProjectionMatrix();
          currentRenderer.setSize(width, height);
        }
      };
      
      // Add event listeners
      container.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      container.addEventListener('wheel', onWheel);
      window.addEventListener('resize', handleResize);
      
      // Return cleanup function
      return () => {
        // Remove event listeners
        container.removeEventListener('mousedown', onMouseDown);
        container.removeEventListener('wheel', onWheel);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('resize', handleResize);
        
        // Clean up other resources
        cleanup();
      };
    } catch (error) {
      console.error("Error initializing Three.js:", error);
      cleanup();
    }
  }, [isOpen, cleanup, focusOnComponent, showLabels, updateLabelPositions]);

  // Control handlers
  const handleZoomIn = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    
    const currentDistance = camera.position.length();
    const newDistance = Math.max(5, currentDistance * 0.8);
    camera.position.normalize().multiplyScalar(newDistance);
  }, []);
  
  const handleZoomOut = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    
    const currentDistance = camera.position.length();
    const newDistance = Math.min(20, currentDistance * 1.2);
    camera.position.normalize().multiplyScalar(newDistance);
  }, []);
  
  const handleRotate = useCallback(() => {
    rotationRef.current.y += Math.PI / 4; // Rotate 45 degrees
  }, []);
  
  const handleReset = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    
    // Reset camera position
    const currentPosition = camera.position.clone();
    const targetPosition = new THREE.Vector3(10, 8, 10);
    
    // Reset rotation
    rotationRef.current = { x: 0, y: 0 };
    
    // Animate reset
    let startTime = 0;
    const duration = 800;
    
    const animateReset = (timestamp: number) => {
      const currentCamera = cameraRef.current;
      if (!currentCamera) return;
      
      if (startTime === 0) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easing = 1 - Math.pow(1 - progress, 3);
      
      // Interpolate position
      currentCamera.position.lerpVectors(currentPosition, targetPosition, easing);
      
      // Look at center
      currentCamera.lookAt(0, 0, 0);
      
      if (progress < 1) {
        requestAnimationFrame(animateReset);
      }
    };
    
    requestAnimationFrame(animateReset);
    
    // Reset selection and info panel
    setSelectedComponent(null);
    setInfoPanel({ visible: false, component: null });
    
    // Reset all component highlights
    Object.values(modelMeshesRef.current).forEach((model) => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material && material.emissive) {
            material.emissive = new THREE.Color(0x000000);
            material.emissiveIntensity = 0;
          }
        }
      });
    });
  }, []);
  
  const handleToggleLabels = useCallback(() => {
    setShowLabels(prev => !prev);
  }, []);
  
  const handleCloseInfoPanel = useCallback(() => {
    setInfoPanel({ visible: false, component: null });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full h-4/5 bg-gray-900 text-white border-gray-700 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-800">
          <DialogTitle className="text-blue-400">
            Interactive Substation Model
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative h-full flex flex-col">
          {/* Control buttons */}
          <div className="flex justify-center p-4 space-x-2 z-10">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset}
              className="border-blue-500 text-blue-400 hover:bg-blue-900 flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToggleLabels}
              className={`border-blue-500 ${showLabels ? 'bg-blue-900 text-white' : 'text-blue-400'} hover:bg-blue-900 flex items-center`}
            >
              <Info className="w-4 h-4 mr-2" /> {showLabels ? "Hide" : "Show"} Labels
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomIn}
              className="border-blue-500 text-blue-400 hover:bg-blue-900 flex items-center"
            >
              <ZoomIn className="w-4 h-4 mr-2" /> Zoom In
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomOut}
              className="border-blue-500 text-blue-400 hover:bg-blue-900 flex items-center"
            >
              <ZoomOut className="w-4 h-4 mr-2" /> Zoom Out
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRotate}
              className="border-blue-500 text-blue-400 hover:bg-blue-900 flex items-center"
            >
              <RotateCw className="w-4 h-4 mr-2" /> Rotate
            </Button>
          </div>
          
          {/* Main view with sidebar */}
          <div className="relative flex-grow flex">
            {/* 3D container */}
            <div 
              ref={containerRef} 
              className="relative flex-grow border border-blue-800 rounded-l-md overflow-hidden"
            >
              {/* Info panel */}
              {infoPanel.visible && infoPanel.component && (
                <div className="absolute bottom-4 right-4 w-72 bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg border border-blue-500 text-white z-20">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold" style={{color: infoPanel.component.color}}>
                      {infoPanel.component.name}
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCloseInfoPanel}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-transparent"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{infoPanel.component.description}</p>
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs border-blue-500 text-blue-400 hover:bg-blue-900 inline-flex items-center"
                    >
                      More Details <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="absolute bottom-4 left-4 text-xs text-blue-400 bg-gray-800/80 p-2 rounded">
                <p>Click on components to explore | Use zoom and rotate controls above</p>
              </div>
            </div>
            
            {/* Component sidebar */}
            <div className="w-52 bg-gray-800/90 border-l border-blue-800 p-3 rounded-r-md">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Components</h3>
              <div className="space-y-2">
                {SUBSTATION_COMPONENTS.map(component => (
                  <Button
                    key={component.id}
                    variant={selectedComponent === component.id ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start text-left text-sm ${
                      selectedComponent === component.id 
                        ? 'bg-blue-700 hover:bg-blue-600' 
                        : 'hover:bg-gray-700'
                    }`}
                    onClick={() => focusOnComponent(component.id)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                      style={{ backgroundColor: component.color }} 
                    />
                    <span className="truncate">{component.name}</span>
                  </Button>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Electrical Specs</h3>
                <div className="space-y-2 text-xs text-gray-300">
                  <div>
                    <span className="text-gray-400">Primary:</span> 220kV
                  </div>
                  <div>
                    <span className="text-gray-400">Secondary:</span> 66kV
                  </div>
                  <div>
                    <span className="text-gray-400">Capacity:</span> 50 MVA
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span> <span className="text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}