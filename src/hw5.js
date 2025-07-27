import { OrbitControls } from "./OrbitControls.js";
// import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

// Texture configuration object
const TEXTURE_CONFIG = {
  court: {
    diffuse: "src/textures/court_diffuse.png",
    normal: "src/textures/court_normal.png", 
    roughness: "src/textures/court_roughness.png",
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
    repeat: [4, 2]
  },
  basketball: {
    diffuse: "src/textures/basketball_diffuse.png",
    normal: "src/textures/basketball_normal.png",
    roughness: "src/textures/basketball_roughness.png",
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    repeat: [1, 1]
  },
  ui: {
    lakersLogo: "src/textures/lakers_logo.png",
    scoreboardDisplay: "src/textures/scoreboard_display.png"
  }
};

// Generic texture loader
function loadTexture(path, config = {}) {
  const texture = textureLoader.load(
    path,
    undefined,
    undefined,
    function (err) {
      console.warn(`Could not load texture: ${path}`, err);
    }
  );
  
  // Apply configuration
  if (config.wrapS) texture.wrapS = config.wrapS;
  if (config.wrapT) texture.wrapT = config.wrapT;
  if (config.repeat) texture.repeat.set(config.repeat[0], config.repeat[1]);
  
  return texture;
}

// Material creation functions
const TextureManager = {
  // Load court textures
  loadCourtTextures() {
    const config = TEXTURE_CONFIG.court;
    return {
      diffuse: loadTexture(config.diffuse, config),
      normal: loadTexture(config.normal, config),
      roughness: loadTexture(config.roughness, config)
    };
  },

  // Load basketball textures
  loadBasketballTextures() {
    const config = TEXTURE_CONFIG.basketball;
    return {
      diffuse: loadTexture(config.diffuse, config),
      normal: loadTexture(config.normal, config),
      roughness: loadTexture(config.roughness, config)
    };
  },

  // Load UI textures
  loadUITextures() {
    const config = TEXTURE_CONFIG.ui;
    return {
      lakersLogo: loadTexture(config.lakersLogo),
      scoreboardDisplay: loadTexture(config.scoreboardDisplay)
    };
  },

  // Create material from texture set
  createPhysicalMaterial(textures, materialConfig = {}) {
    return new THREE.MeshPhysicalMaterial({
      map: textures.diffuse,
      normalMap: textures.normal,
      roughnessMap: textures.roughness,
      roughness: materialConfig.roughness || 0.7,
      metalness: materialConfig.metalness || 0.0,
      clearcoat: materialConfig.clearcoat || 0.1,
      clearcoatRoughness: materialConfig.clearcoatRoughness || 0.3,
      ...materialConfig
    });
  }
};

const COURT_LENGTH = 30;
const COURT_WIDTH = 15;
const COURT_THICKNESS = 0.2;
const LINE_Y = 0.001;
const CENTER_CIRCLE_RADIUS = 1.93;
const THREE_POINT_RADIUS = 7.24;
const RIM_OFFSET_FROM_BASE = 1.3;
const HOOP_HEIGHT_FROM_FLOOR = 3.05;
const LINE_COLOR = 0xffffff;
const LINE_MATERIAL = new THREE.MeshBasicMaterial({
  color: LINE_COLOR,
  side: THREE.DoubleSide,
});
const LINE_THICKNESS = 0.1;
const FREE_THROW_LINE_DISTANCE = 5.8; // Distance from baseline to free throw line
const KEY_WIDTH = 4.9; // Width of the key (free throw line)
const KEY_CIRCLE_RADIUS = 1.8; // Radius of the free throw circle
const BACKBOARD_WIDTH = 1.8;
const BACKBOARD_HEIGHT = 1.2;
const BACKBOARD_THICKNESS = 0.05;
const RIM_OFFSET_FROM_BOARD = 0.66;
const RIM_BELOW_BACKBOARD_BOTTOM = 0.05;

// Basketball Movement Controls
const MOVEMENT_SPEED = 0.12;
const COURT_BOUNDARY_X = (COURT_LENGTH - 3) / 2; // Keep ball within court boundaries
const COURT_BOUNDARY_Z = (COURT_WIDTH - 1) / 2;

// Shot Power System
const POWER_CHANGE_RATE = 2;
const MIN_POWER = 0;
const MAX_POWER = 100;
const DEFAULT_POWER = 50;

// Physics and Shooting
const GRAVITY = -9.8; // m/s²
const PHYSICS_SCALE = 1.4;
const SCALED_GRAVITY = GRAVITY * PHYSICS_SCALE;
const BASKETBALL_RADIUS = 0.12;
const GROUND_Y = BASKETBALL_RADIUS; // Basketball rests on ground
const HOOP_Y = HOOP_HEIGHT_FROM_FLOOR + COURT_THICKNESS / 2;
const RIM_AND_NET_OFFSET_FROM_BOARD = 0.17;

// Collision and Bouncing
const BOUNCE_DAMPING = 0.6;
const MIN_BOUNCE_VELOCITY = 0.1;
const RIM_RADIUS = 0.45;
const RIM_HEIGHT_TOLERANCE = 0.1;
const SCORE_DETECTION_RADIUS = 0.25;

// Rim collision physics
const RIM_COLLISION_DAMPING = 0.7;
const RIM_COLLISION_RANDOMNESS = 0.15;
const RIM_BOUNCE_MIN_VELOCITY = 0.05;
const RIM_COLLISION_SOUND_THRESHOLD = 0.5;

// Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

// Configure shadow properties for better quality
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Coordinate helper
// const axesHelper = new THREE.AxesHelper(20);
// scene.add(axesHelper);

function addCourtLines() {
  const group = new THREE.Group();

  const LINE_HEIGHT = 0.02;
  const BORDER_MARGIN_X = 1.5;
  const BORDER_MARGIN_Z = 0.5;
  const INNER_LENGTH = COURT_LENGTH - 2 * BORDER_MARGIN_X;
  const INNER_WIDTH = COURT_WIDTH - 2 * BORDER_MARGIN_Z;

  // Center line
  const middleLineGeometry = new THREE.BoxGeometry(
    LINE_THICKNESS,
    LINE_HEIGHT,
    INNER_WIDTH
  );
  const middleLine = new THREE.Mesh(middleLineGeometry, LINE_MATERIAL);
  middleLine.position.set(0, LINE_Y, 0);
  middleLine.receiveShadow = true;
  group.add(middleLine);

  // Top sideline
  const sidelineGeometry = new THREE.BoxGeometry(
    INNER_LENGTH,
    LINE_HEIGHT,
    LINE_THICKNESS
  );
  const topSideline = new THREE.Mesh(sidelineGeometry, LINE_MATERIAL);
  topSideline.position.set(0, LINE_Y, -INNER_WIDTH / 2);
  topSideline.receiveShadow = true;
  group.add(topSideline);

  // Bottom sideline
  const bottomSideline = topSideline.clone();
  bottomSideline.position.z = INNER_WIDTH / 2;
  group.add(bottomSideline);

  // Left baseline
  const baselineGeometry = new THREE.BoxGeometry(
    LINE_THICKNESS,
    LINE_HEIGHT,
    INNER_WIDTH
  );
  const leftBaseline = new THREE.Mesh(baselineGeometry, LINE_MATERIAL);
  leftBaseline.position.set(-INNER_LENGTH / 2, LINE_Y, 0);
  leftBaseline.receiveShadow = true;
  group.add(leftBaseline);

  // Right baseline
  const rightBaseline = leftBaseline.clone();
  rightBaseline.position.x = INNER_LENGTH / 2;
  group.add(rightBaseline);

  // Center circle
  const innerR = CENTER_CIRCLE_RADIUS - LINE_THICKNESS / 2;
  const outerR = CENTER_CIRCLE_RADIUS + LINE_THICKNESS / 2;
  const ringGeom = new THREE.RingGeometry(innerR, outerR, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: LINE_COLOR,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.rotation.x = degrees_to_radians(-90);
  ring.position.y = LINE_Y;
  ring.receiveShadow = true;
  group.add(ring);


  function addSideElements(side) {
    const dir = side === "right" ? 1 : -1;
    const baselineX = dir * (INNER_LENGTH / 2);
    const hoopX = dir * (INNER_LENGTH / 2 - RIM_OFFSET_FROM_BASE);
    const freeThrowGroup = new THREE.Group();

    // Key side lines
    const keySideLineGeometry = new THREE.BoxGeometry(
      FREE_THROW_LINE_DISTANCE,
      LINE_HEIGHT,
      LINE_THICKNESS
    );

    // Left & right side of key (from court center perspective)
    [-1, 1].forEach((laneDir) => {
      const keySideLine = new THREE.Mesh(keySideLineGeometry, LINE_MATERIAL);
      keySideLine.position.set(
        dir * (FREE_THROW_LINE_DISTANCE / 2),
        0,
        (laneDir * KEY_WIDTH) / 2
      );
      keySideLine.receiveShadow = true;
      freeThrowGroup.add(keySideLine);
    });

    // Free throw line
    const freeThrowLineGeometry = new THREE.BoxGeometry(
      KEY_WIDTH,
      LINE_HEIGHT,
      LINE_THICKNESS
    );
    const freeThrowLine = new THREE.Mesh(freeThrowLineGeometry, LINE_MATERIAL);
    freeThrowLine.position.set(dir * FREE_THROW_LINE_DISTANCE, 0, 0);
    freeThrowLine.receiveShadow = true;
    freeThrowGroup.add(freeThrowLine);
    freeThrowLine.rotation.y = degrees_to_radians(90);

    // Free throw circle
    const ftInnerR = KEY_CIRCLE_RADIUS - LINE_THICKNESS / 2;
    const ftOuterR = KEY_CIRCLE_RADIUS + LINE_THICKNESS / 2;
    const ftArcGeometry = new THREE.RingGeometry(ftInnerR, ftOuterR, 32, 8, 0, degrees_to_radians(180));

    const ftArc = new THREE.Mesh(ftArcGeometry, ringMat);
    ftArc.rotation.x = degrees_to_radians(-90);
    ftArc.position.set(dir * FREE_THROW_LINE_DISTANCE, 0, 0);
    ftArc.rotation.z = -dir * degrees_to_radians(90);

    ftArc.receiveShadow = true;
    freeThrowGroup.add(ftArc);

    // Lane markings (hash marks)
    for (let i = 1; i <= 4; i++) {
      const distance = i * (FREE_THROW_LINE_DISTANCE / 5);

      // Hash marks on both sides of the lane
      [-1, 1].forEach((laneDir) => {
        const hashMarkGeometry = new THREE.BoxGeometry(
          0.4,
          LINE_HEIGHT,
          LINE_THICKNESS
        );
        const hashMark = new THREE.Mesh(hashMarkGeometry, LINE_MATERIAL);
        hashMark.position.set(
          dir * distance,
          0,
          (laneDir * (KEY_WIDTH + 0.2)) / 2
        );
        hashMark.receiveShadow = true;
        freeThrowGroup.add(hashMark);
      });
    }

    // Position the entire free throw group
    freeThrowGroup.position.set(baselineX, LINE_Y, 0);
    freeThrowGroup.rotation.y = degrees_to_radians(180);
    group.add(freeThrowGroup);

    // THREE POINT LINE
    const r = THREE_POINT_RADIUS;
    // Calculate the angles that correspond to the start and end points
    const startA = degrees_to_radians(-90) + degrees_to_radians(35.7);
    const endA = degrees_to_radians(90) - degrees_to_radians(35.7);
    
    // Calculate arc points to determine firstPt and lastPt for connecting lines
    const firstPt = new THREE.Vector3(
      hoopX - dir * r * Math.cos(startA), 
      LINE_Y, 
      r * Math.sin(startA)
    );
    const lastPt = new THREE.Vector3(
      hoopX - dir * r * Math.cos(endA), 
      LINE_Y, 
      r * Math.sin(endA)
    );
    
    // Create the three-point arc using RingGeometry
    const arcInnerR = r - LINE_THICKNESS / 2;
    const arcOuterR = r + LINE_THICKNESS / 2;
    
    // Convert our angles to be compatible with RingGeometry's expectations
    // RingGeometry uses angles in the XY plane, we need to adjust for our XZ plane
    const thetaStart = startA + degrees_to_radians(90);
    const thetaLength = endA - startA;
    
    const arcGeom = new THREE.RingGeometry(
      arcInnerR,
      arcOuterR,
      32,
      1,
      thetaStart,
      thetaLength
    );
    const arcMaterial = new THREE.MeshBasicMaterial({ 
      color: LINE_COLOR,
      side: THREE.DoubleSide
    });
    
    const arcRing = new THREE.Mesh(arcGeom, arcMaterial);
    
    // Position and rotate the ring to match our three-point line
    arcRing.position.set(hoopX, LINE_Y, 0);
    arcRing.rotation.x = degrees_to_radians(-90);
    arcRing.rotation.y = dir < 0 ? degrees_to_radians(180) : 0;
    arcRing.rotation.z = degrees_to_radians(90);
    
    group.add(arcRing);

    // Helper function to create line from point to baseline
    function createLineFromPoints(pt) {
      const dx = Math.abs(baselineX - pt.x);
      const geom = new THREE.BoxGeometry(dx, LINE_HEIGHT, LINE_THICKNESS);
      const mesh = new THREE.Mesh(geom, LINE_MATERIAL);
      mesh.position.set((baselineX + pt.x) / 2, LINE_Y, pt.z);
      mesh.receiveShadow = true;
      group.add(mesh);
    }

    createLineFromPoints(firstPt);
    createLineFromPoints(lastPt);
  }

  // Apply the function to both sides
  ["left", "right"].forEach(addSideElements);

  scene.add(group);
}

// Create basketball court
function createBasketballCourt() {
  // Load court textures
  const courtTextures = TextureManager.loadCourtTextures();
  
  const courtGeometry = new THREE.BoxGeometry(COURT_LENGTH, COURT_THICKNESS, COURT_WIDTH);

  // Court material with all texture maps
  const courtMaterial = TextureManager.createPhysicalMaterial(courtTextures, {
    clearcoatRoughness: 0.1,
    roughness: 0.3,
    metalness: 0.0
  });

  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  court.position.y = -COURT_THICKNESS / 2;

  return court;
}

// Create basketball hoops
function createBasketballHoops() {
  const group = new THREE.Group();
  const uiTextures = TextureManager.loadUITextures(); // Load UI textures once
  
  // --- HOOP CONSTANTS ---
  const HOOP_Y = HOOP_HEIGHT_FROM_FLOOR + COURT_THICKNESS / 2;
  const RIM_RADIUS = 0.45;
  const RIM_TUBE_RADIUS = 0.03;
  const RIM_OFFSET_FROM_BASE = 0.66;
  const RIM_AND_NET_OFFSET_FROM_BOARD = 0.17;
  const RIM_BELOW_BACKBOARD_BOTTOM = 0.05;
  const NET_HEIGHT = 0.45;
  const SUPPORT_POLE_RADIUS = 0.1;
  const SUPPORT_POLE_EXTRA = 1.0;
  const BORDER_MARGIN_X = 1.5;
  
  [-1, 1].forEach((side) => {
    // X position for the hoop
    const xPos = side * ((COURT_LENGTH - 2 * BORDER_MARGIN_X) / 2 - RIM_OFFSET_FROM_BASE);

    // Calculate backboard position based on rim height
    const backboardBottomY = HOOP_Y + RIM_BELOW_BACKBOARD_BOTTOM;
    const backboardY = backboardBottomY + BACKBOARD_HEIGHT / 2;

    // Rim
    const rimGeometry = new THREE.TorusGeometry(
      RIM_RADIUS,
      RIM_TUBE_RADIUS,
      16,
      32
    );
    const rimMaterial = new THREE.MeshPhongMaterial({
      color: 0xff7700,
      shininess: 100,
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.set(xPos + side * RIM_AND_NET_OFFSET_FROM_BOARD, HOOP_Y, 0);
    rim.rotation.x = degrees_to_radians(90);
    rim.castShadow = true;
    group.add(rim);

    
    // Realistic net
    const netMaterial = new THREE.LineBasicMaterial({ 
      color: 0xf0f0f0,
      linewidth: 2
    });
    
    // Increase segments for more detail's
    const NET_DETAIL = 16;
    const HORIZ_RINGS = 6;
    
    // Create the net cords (vertical lines)
    for (let i = 0; i < NET_DETAIL; i++) {
      const angle = degrees_to_radians((i / NET_DETAIL) * 360);
      const verticalPoints = [];
      
      // Add point at rim
      verticalPoints.push(
        new THREE.Vector3(
          xPos + RIM_RADIUS * Math.cos(angle) + side * RIM_AND_NET_OFFSET_FROM_BOARD,
          HOOP_Y,
          RIM_RADIUS * Math.sin(angle)
        )
      );
      
      // Add intermediate points with natural curve and slight randomness
      const numPoints = 8; // More points for smoother curve
      for (let p = 1; p < numPoints; p++) {
        const t = p / numPoints;
        
        // Create a natural curve
        const catenary = 1 - Math.pow(2 * t - 1, 2);
        
        // Radius gradually decreases as we go down
        const radius = RIM_RADIUS * (1 - 0.75 * t);
        
        // Add slight randomness (0.005 units)
        const jitter = 0.005 * (Math.random() - 0.5);
        
        verticalPoints.push(
          new THREE.Vector3(
            xPos + (radius + jitter) * Math.cos(angle) + side * RIM_AND_NET_OFFSET_FROM_BOARD,
            HOOP_Y - NET_HEIGHT * t - catenary * 0.05,
            (radius + jitter) * Math.sin(angle)
          )
        );
      }
      
      // Add enlarged bottom opening
      const bottomRadius = RIM_RADIUS * 0.33;
      verticalPoints.push(
        new THREE.Vector3(
          xPos + bottomRadius * Math.cos(angle) + side * RIM_AND_NET_OFFSET_FROM_BOARD,
          HOOP_Y - NET_HEIGHT,
          bottomRadius * Math.sin(angle)
        )
      );
      
      const vertLineGeom = new THREE.BufferGeometry().setFromPoints(verticalPoints);
      const vertLine = new THREE.Line(vertLineGeom, netMaterial);
      group.add(vertLine);
    }

    // Horizontal net rings
    for (let j = 1; j <= HORIZ_RINGS; j++) {
      const t = Math.pow(j / HORIZ_RINGS, 1.2);
      const y = HOOP_Y - t * NET_HEIGHT;
      
      const circleRadius = RIM_RADIUS * (1 - 0.67 * t);
      
      const circlePoints = [];
      for (let i = 0; i <= NET_DETAIL; i++) {
        const angle = degrees_to_radians((i / NET_DETAIL) * 360);
        
        // Add small random variation
        const jitter = 0.003 * (Math.random() - 0.5);
        
        circlePoints.push(
          new THREE.Vector3(
            xPos + (circleRadius + jitter) * Math.cos(angle) + side * RIM_AND_NET_OFFSET_FROM_BOARD,
            y + jitter * 2,
            (circleRadius + jitter) * Math.sin(angle)
          )
        );
      }
      
      const circleGeom = new THREE.BufferGeometry().setFromPoints(circlePoints);
      const circle = new THREE.Line(circleGeom, netMaterial);
      group.add(circle);
    }
    const backboardGeom = new THREE.BoxGeometry(
      BACKBOARD_THICKNESS,
      BACKBOARD_HEIGHT,
      BACKBOARD_WIDTH
    );

    // Create solid white backboard material
    const backboardMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      shininess: 100,
    });

    const backboard = new THREE.Mesh(backboardGeom, backboardMat);
    backboard.position.set(
      xPos + side * RIM_OFFSET_FROM_BOARD,
      backboardY - 0.25,
      0
    );
    backboard.rotation.y = side > 0 ? degrees_to_radians(180) : 0;
    backboard.castShadow = true;
    backboard.receiveShadow = true;
    group.add(backboard);
    // Create Lakers logo as a separate plane on top of the backboard
    const logoGeometry = new THREE.PlaneGeometry(
      BACKBOARD_WIDTH * 0.6, // Smaller than backboard
      BACKBOARD_HEIGHT * 0.6
    );
    const logoMaterial = new THREE.MeshBasicMaterial({
      map: uiTextures.lakersLogo,
      transparent: true,
      alphaTest: 0.01, // Lower alpha test to show more of the texture
    });

    const logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
    // Position logo clearly in front of the backboard
    logoMesh.position.set(
      xPos + side * (RIM_OFFSET_FROM_BOARD - 0.08),
      backboardY - 0.25,
      0
    );
    // Same rotation as backboard to face the court
    logoMesh.rotation.y =
      side == -1 ? degrees_to_radians(90) : degrees_to_radians(-90);
    group.add(logoMesh); // Support pole

    const poleHeight = HOOP_Y + SUPPORT_POLE_EXTRA;
    const poleGeometry = new THREE.CylinderGeometry(
      SUPPORT_POLE_RADIUS,
      SUPPORT_POLE_RADIUS,
      poleHeight
    );
    const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(xPos + side * 2, poleHeight / 2, 0);
    pole.castShadow = true;
    group.add(pole);

    // Support arm - top (connected to upper part of backboard)
    const armTopGeometry = new THREE.BoxGeometry(1.3, 0.1, 0.1);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
    const armTop = new THREE.Mesh(armTopGeometry, armMaterial);
    armTop.position.set(xPos + side * 1.3, backboardY, 0);
    armTop.castShadow = true;
    group.add(armTop);

    // Support arm - bottom (connected to the rim level)
    const armBottomGeometry = new THREE.BoxGeometry(1.4, 0.1, 0.1);
    const armBottom = new THREE.Mesh(armBottomGeometry, armMaterial);
    armBottom.position.set(xPos + side * 1.32, HOOP_Y, 0);
    armBottom.rotation.z = -side * 0.3;
    armBottom.castShadow = true;
    group.add(armBottom);
  });

  scene.add(group);
}

// Create basketball
function createBasketball() {
  // Load basketball textures
  const basketballTextures = TextureManager.loadBasketballTextures();

  // Create basketball material
  const basketballMaterial = TextureManager.createPhysicalMaterial(basketballTextures, {
    roughness: 0.7,
    metalness: 0.0,
    clearcoat: 0.1,
    clearcoatRoughness: 0.3
  });

  const basketballGeometry = new THREE.SphereGeometry(0.12, 64, 64);
  const basketball = new THREE.Mesh(basketballGeometry, basketballMaterial);
  basketball.position.set(0, 0.18, 0);
  basketball.castShadow = true;

  return basketball;
}

// Create scoreboard
function createScoreboard() {
  const uiTextures = TextureManager.loadUITextures();

  // Create cube geometry for the scoreboard
  const scoreboardGeometry = new THREE.BoxGeometry(8, 4, 8);

  // Create materials array for the cube faces
  const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const displayMaterial = new THREE.MeshBasicMaterial({
    map: uiTextures.scoreboardDisplay,
  });

  const materials = [
    displayMaterial,   // right side
    displayMaterial,   // left side
    blackMaterial,     // top
    blackMaterial,     // bottom
    displayMaterial,   // front
    displayMaterial,   // back
  ];

  const scoreboard = new THREE.Mesh(scoreboardGeometry, materials);
  scoreboard.position.set(0, 12, 0);

  return scoreboard;
}

const court = createBasketballCourt();
scene.add(court);

addCourtLines();

createBasketballHoops();

const basketball = createBasketball();
scene.add(basketball);

const scoreboard = createScoreboard();
scene.add(scoreboard);

const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

const startCameraPosition = new THREE.Vector3(-0.110, 12.436, 21.125); // Initial camera position
camera.position.set(startCameraPosition.x, startCameraPosition.y, startCameraPosition.z);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Instructions display
const instructionsElement = document.createElement('div');
instructionsElement.style.position = 'absolute';
instructionsElement.style.bottom = '20px';
instructionsElement.style.left = '20px';
instructionsElement.style.width = '240px';
instructionsElement.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
instructionsElement.style.color = 'white';
instructionsElement.style.fontSize = '14px';
instructionsElement.style.fontFamily = 'Tahoma, Verdana, sans-serif';
instructionsElement.style.textAlign = 'left';
instructionsElement.style.padding = '16px';
instructionsElement.style.borderRadius = '12px';
instructionsElement.style.border = '2px solid rgba(255, 255, 255, 0.1)';
instructionsElement.style.backdropFilter = 'blur(10px)';
instructionsElement.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
instructionsElement.innerHTML = `
  <div style="text-align: center; margin-bottom: 16px;">
    <h2 style="margin: 0; color: #ff7700; font-size: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">🏀 Basketball Game</h2>
    <div style="height: 2px; background: linear-gradient(90deg, #ff7700, #ffaa00); margin: 6px 0; border-radius: 1px;"></div>
  </div>
  
  <div style="background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 8px; border-left: 3px solid #4CAF50; margin-bottom: 12px;">
    <h4 style="margin: 0 0 6px 0; color: #4CAF50; font-size: 14px;">🎮 Movement</h4>
    <div style="font-size: 12px; line-height: 1.4;">
      <span style="color: #ccc;">Arrow Keys</span><br>
      <span style="color: #aaa;">↑/↓</span> Forward/Backward<br>
      <span style="color: #aaa;">←/→</span> Left/Right
    </div>
  </div>
  
  <div style="background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 8px; border-left: 3px solid #2196F3; margin-bottom: 12px;">
    <h4 style="margin: 0 0 6px 0; color: #2196F3; font-size: 14px;">⚡ Power</h4>
    <div style="font-size: 12px; line-height: 1.4;">
      <span style="color: #ccc;">W/S Keys</span> - Adjust power<br>
      <span style="color: #aaa;">W</span> Increase power<br>
      <span style="color: #aaa;">S</span> Decrease power
    </div>
  </div>
  
  <div style="background: rgba(255, 119, 0, 0.1); padding: 10px; border-radius: 8px; border: 1px solid rgba(255, 119, 0, 0.3); margin-bottom: 12px;">
    <h4 style="margin: 0 0 6px 0; color: #ff7700; font-size: 14px;">🎯 Actions</h4>
    <div style="font-size: 12px; line-height: 1.5;">
      <span style="color: #ffaa00; font-weight: bold;">Spacebar</span> - Shoot basketball<br>
      <span style="color: #ffaa00; font-weight: bold;">R Key</span> - Reset basketball position
    </div>
  </div>

  <div style="background: rgba(255, 255, 255, 0.03); padding: 10px; border-radius: 6px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
    <h4 style="margin: 0 0 6px 0; color: #757575; font-size: 14px;">📷 Camera Controls</h4>
    <div style="font-size: 12px; line-height: 1.4; color: #bbb;">
      <span style="color: #aaa;">O</span> - Toggle orbit camera<br>
      <span style="color: #aaa;">1/2/3</span> - Switch to predefined views
    </div>
  </div>
`;
document.body.appendChild(instructionsElement);

// Score display container
const scoreContainer = document.createElement('div');
scoreContainer.id = 'score-container';
scoreContainer.style.position = 'absolute';
scoreContainer.style.top = '20px';
scoreContainer.style.left = '50%';
scoreContainer.style.transform = 'translateX(-50%)';
scoreContainer.style.color = 'white';
scoreContainer.style.fontSize = '18px';
scoreContainer.style.fontFamily = 'Tahoma, Verdana, sans-serif';
scoreContainer.style.fontWeight = 'bold';
scoreContainer.style.textAlign = 'center';
scoreContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
scoreContainer.style.padding = '15px 25px';
scoreContainer.style.borderRadius = '12px';
scoreContainer.style.border = '2px solid rgba(255, 119, 0, 0.3)';
scoreContainer.style.backdropFilter = 'blur(10px)';
scoreContainer.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
scoreContainer.style.minWidth = '300px';
scoreContainer.innerHTML = `
  <div style="margin-bottom: 10px;">
    <span style="color: #ff7700; font-size: 24px;">🏀 SCORE: <span id="player-score" style="color: #ffaa00;">0</span></span>
  </div>
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; font-size: 14px;">
    <div style="text-align: center;">
      <div style="color: #4CAF50; font-weight: bold;">SHOTS MADE</div>
      <div id="shots-made" style="font-size: 20px, color: #66BB6A;">0</div>
    </div>
    <div style="text-align: center;">
      <div style="color: #2196F3; font-weight: bold;">ATTEMPTS</div>
      <div id="shot-attempts" style="font-size: 20px, color: #42A5F5;">0</div>
    </div>
    <div style="text-align: center;">
      <div style="color: #9C27B0; font-weight: bold;">ACCURACY</div>
      <div id="shooting-percentage" style="font-size: 20px, color: #BA68C8;">--%</div>
    </div>
  </div>
`;
document.body.appendChild(scoreContainer);

// Shot feedback message container
const feedbackContainer = document.createElement('div');
feedbackContainer.id = 'feedback-container';
feedbackContainer.style.position = 'absolute';
feedbackContainer.style.top = '25%';
feedbackContainer.style.left = '50%';
feedbackContainer.style.transform = 'translate(-50%, -50%)';
feedbackContainer.style.fontSize = '48px';
feedbackContainer.style.fontFamily = 'Tahoma, Verdana, sans-serif';
feedbackContainer.style.fontWeight = 'bold';
feedbackContainer.style.textAlign = 'center';
feedbackContainer.style.pointerEvents = 'none';
feedbackContainer.style.zIndex = '1000';
feedbackContainer.style.opacity = '0';
feedbackContainer.style.transition = 'all 0.8s ease';
feedbackContainer.style.textShadow = '3px 3px 6px rgba(0, 0, 0, 0.8)';
document.body.appendChild(feedbackContainer);

// Power indicator UI
const powerContainer = document.createElement('div');
powerContainer.style.position = 'absolute';
powerContainer.style.top = '20px';
powerContainer.style.right = '20px';
powerContainer.style.width = '200px';
powerContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
powerContainer.style.padding = '10px';
powerContainer.style.borderRadius = '5px';
powerContainer.style.color = 'white';
powerContainer.style.fontFamily = 'Arial, sans-serif';

// Power text
const powerText = document.createElement('div');
powerText.style.marginBottom = '5px';
powerText.style.fontSize = '14px';
powerText.textContent = `Shot Power: ${DEFAULT_POWER}%`;

// Power bar background
const powerBarBackground = document.createElement('div');
powerBarBackground.style.width = '100%';
powerBarBackground.style.height = '20px';
powerBarBackground.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
powerBarBackground.style.borderRadius = '10px';
powerBarBackground.style.overflow = 'hidden';

// Power bar fill
const powerBarFill = document.createElement('div');
powerBarFill.style.height = '100%';
powerBarFill.style.backgroundColor = '#4CAF50';
powerBarFill.style.width = DEFAULT_POWER + '%';
powerBarFill.style.transition = 'width 0.1s ease';

powerBarBackground.appendChild(powerBarFill);
powerContainer.appendChild(powerText);
powerContainer.appendChild(powerBarBackground);
document.body.appendChild(powerContainer);

// Basketball movement state
const basketballMovement = {
  velocity: new THREE.Vector3(0, 0, 0),
  targetPosition: new THREE.Vector3(0, 0.18, 0),
  isMoving: false
};

// Shot power state
const shotPower = {
  current: DEFAULT_POWER,
  isIncreasing: false,
  isDecreasing: false
};

// Basketball physics state
const basketballPhysics = {
  velocity: new THREE.Vector3(0, 0, 0),
  isInFlight: false,
  isGrounded: true,
  isBouncing: false,
  bounceCount: 0,
  lastFrameTime: 0
};

// Basketball rotation state
const basketballRotation = {
  angularVelocity: new THREE.Vector3(0, 0, 0),
  currentRotation: new THREE.Vector3(0, 0, 0),
  lastPosition: new THREE.Vector3(0, 0.18, 0),
  rotationScale: 2.0 // How much the ball rotates relative to movement
};

// Hoop positions for targeting
const hoopPositions = [
  new THREE.Vector3(
    -((COURT_LENGTH - 2 * 1.5) / 2 - 0.66) - RIM_AND_NET_OFFSET_FROM_BOARD, // Match visual rim X position
    HOOP_HEIGHT_FROM_FLOOR + COURT_THICKNESS / 2,
    0
  ), // Left hoop
  new THREE.Vector3(
    ((COURT_LENGTH - 2 * 1.5) / 2 - 0.66) + RIM_AND_NET_OFFSET_FROM_BOARD, // Match visual rim X position
    HOOP_HEIGHT_FROM_FLOOR + COURT_THICKNESS / 2,
    0
  )  // Right hoop
];

// Calculate backboard positions for collision detection
const backboardPositions = [
  {
    x: -((COURT_LENGTH - 2 * 1.5) / 2 - 0.66) - RIM_OFFSET_FROM_BOARD, // Match visual backboard X position
    y: (HOOP_HEIGHT_FROM_FLOOR + COURT_THICKNESS / 2) + RIM_BELOW_BACKBOARD_BOTTOM + BACKBOARD_HEIGHT / 2 - 0.25, // Match visual backboard Y position
    z: 0,
    width: BACKBOARD_THICKNESS,
    height: BACKBOARD_HEIGHT,
    depth: BACKBOARD_WIDTH
  }, // Left backboard
  {
    x: ((COURT_LENGTH - 2 * 1.5) / 2 - 0.66) + RIM_OFFSET_FROM_BOARD, // Match visual backboard X position
    y: (HOOP_HEIGHT_FROM_FLOOR + COURT_THICKNESS / 2) + RIM_BELOW_BACKBOARD_BOTTOM + BACKBOARD_HEIGHT / 2 - 0.25, // Match visual backboard Y position
    z: 0,
    width: BACKBOARD_THICKNESS,
    height: BACKBOARD_HEIGHT,
    depth: BACKBOARD_WIDTH
  }  // Right backboard
];

// Key state tracking for smooth movement
const keyStates = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false,
  KeyW: false,
  KeyS: false
};

basketball.position.copy(basketballMovement.targetPosition);

// Update basketball position with boundary checking
function updateBasketballPosition() {
  if (!basketballPhysics.isInFlight) {
    // Store previous position for rotation calculation
    basketballRotation.lastPosition.copy(basketball.position);
    
    // Calculate movement direction based on key states
    const moveDirection = new THREE.Vector3(0, 0, 0);
    
    if (keyStates.ArrowLeft) moveDirection.x -= 1;
    if (keyStates.ArrowRight) moveDirection.x += 1;
    if (keyStates.ArrowUp) moveDirection.z -= 1;
    if (keyStates.ArrowDown) moveDirection.z += 1;
    
    // Normalize diagonal movement
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      basketballMovement.isMoving = true;
    } else {
      basketballMovement.isMoving = false;
    }
    
    // Apply movement speed
    moveDirection.multiplyScalar(MOVEMENT_SPEED);
    
    // Update target position
    basketballMovement.targetPosition.add(moveDirection);
    
    // Apply boundary checking
    basketballMovement.targetPosition.x = Math.max(
      -COURT_BOUNDARY_X, 
      Math.min(COURT_BOUNDARY_X, basketballMovement.targetPosition.x)
    );
    basketballMovement.targetPosition.z = Math.max(
      -COURT_BOUNDARY_Z, 
      Math.min(COURT_BOUNDARY_Z, basketballMovement.targetPosition.z)
    );
    
    // Smooth transition to target position
    const lerpFactor = 0.15;
    basketball.position.lerp(basketballMovement.targetPosition, lerpFactor);
    
    // Calculate rotation based on movement
    updateBasketballRotation();
  }
}

// Update basketball rotation based on movement or physics
function updateBasketballRotation() {
  const currentPosition = basketball.position.clone();
  const deltaPosition = currentPosition.clone().sub(basketballRotation.lastPosition);
  
  if (basketballPhysics.isInFlight) {
    // During flight, use velocity for rotation
    const velocity = basketballPhysics.velocity.clone();
    
    // Calculate angular velocity based on linear velocity
    // Right hand rule: velocity cross up vector gives rotation axis
    const ballRadius = 0.12; // Basketball radius
    const linearSpeed = velocity.length();
    
    if (linearSpeed > 0.001) {
      // Calculate rotation around appropriate axes
      basketballRotation.angularVelocity.x = velocity.z / ballRadius * basketballRotation.rotationScale;
      basketballRotation.angularVelocity.z = -velocity.x / ballRadius * basketballRotation.rotationScale;
      basketballRotation.angularVelocity.y = 0;
    }
  } else if (basketballMovement.isMoving) {
    // During manual movement, use position delta for rotation
    const deltaLength = deltaPosition.length();
    
    if (deltaLength > 0.001) {
      const ballRadius = 0.12;
      
      // Calculate rotation around appropriate axes based on movement direction
      basketballRotation.angularVelocity.x = deltaPosition.z / ballRadius * basketballRotation.rotationScale * 15;
      basketballRotation.angularVelocity.z = -deltaPosition.x / ballRadius * basketballRotation.rotationScale * 15;
      basketballRotation.angularVelocity.y = 0;
    }
  } else {
    // Ball is stationary, gradually reduce rotation
    basketballRotation.angularVelocity.multiplyScalar(0.95);
  }
  
  // Apply rotation to the basketball mesh
  const deltaTime = 1/60; // Assume 60 FPS for consistent rotation
  basketball.rotation.x += basketballRotation.angularVelocity.x * deltaTime;
  basketball.rotation.y += basketballRotation.angularVelocity.y * deltaTime;
  basketball.rotation.z += basketballRotation.angularVelocity.z * deltaTime;
  
  // Update last position for next frame
  basketballRotation.lastPosition.copy(currentPosition);
}

// Update shot power based on key states
function updateShotPower() {
  const POWER_CHANGE_RATE = 1.5; // Power change per frame
  
  if (shotPower.isIncreasing && shotPower.current < MAX_POWER) {
    shotPower.current = Math.min(MAX_POWER, shotPower.current + POWER_CHANGE_RATE);
  }
  
  if (shotPower.isDecreasing && shotPower.current > MIN_POWER) {
    shotPower.current = Math.max(MIN_POWER, shotPower.current - POWER_CHANGE_RATE);
  }
  
  // Update the power bar UI
  if (powerBarFill) {
    powerBarFill.style.width = shotPower.current + '%';
  }
  if (powerText) {
    powerText.textContent = `Shot Power: ${Math.round(shotPower.current)}%`;
  }
}

// Scoring System Functions
function updateScoreDisplay() {
  // Update score and statistics in the UI
  const scoreElement = document.getElementById('player-score');
  const shotsMadeElement = document.getElementById('shots-made');
  const attemptsElement = document.getElementById('shot-attempts');
  const percentageElement = document.getElementById('shooting-percentage');
  
  if (scoreElement) scoreElement.textContent = gameStats.score;
  if (shotsMadeElement) shotsMadeElement.textContent = gameStats.shotsMade;
  if (attemptsElement) attemptsElement.textContent = gameStats.shotAttempts;
  
  // Calculate and display shooting percentage
  if (gameStats.shotAttempts > 0) {
    gameStats.shootingPercentage = Math.round((gameStats.shotsMade / gameStats.shotAttempts) * 100);
    if (percentageElement) percentageElement.textContent = `${gameStats.shootingPercentage}%`;
  } else {
    gameStats.shootingPercentage = 0;
    if (percentageElement) percentageElement.textContent = '--%';
  }
}

function showShotFeedback(result) {
  const feedbackElement = document.getElementById('feedback-container');
  if (!feedbackElement) return;
  
  if (result === 'made') {
    feedbackElement.innerHTML = '🎯 SHOT MADE!';
    feedbackElement.style.color = '#4CAF50';
    feedbackElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
  } else if (result === 'missed') {
    feedbackElement.innerHTML = '❌ MISSED SHOT';
    feedbackElement.style.color = '#f44336';
    feedbackElement.style.transform = 'translate(-50%, -50%) scale(1.0)';
  }
  
  // Show feedback with animation
  feedbackElement.style.opacity = '1';
  
  // Hide feedback after 2 seconds
  setTimeout(() => {
    feedbackElement.style.opacity = '0';
    feedbackElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
  }, 2000);
}

function recordShotAttempt() {
  gameStats.shotAttempts++;
  gameStats.lastShotResult = null; // Reset until we know the result
  gameStats.ballHitBackboard = false; // Reset backboard tracking
  gameStats.ballHitRim = false; // Reset rim tracking
  gameStats.shotStartTime = performance.now(); // Track when shot started
  
  // Reset trajectory tracking for new shot
  gameStats.ballTrajectory.wasAboveRim = false;
  gameStats.ballTrajectory.maxHeight = basketball.position.y;
  gameStats.ballTrajectory.passedThroughRim = false;
  
  updateScoreDisplay();
}

function recordSuccessfulShot() {
  gameStats.shotsMade++;
  gameStats.score += 2; // Each basket is worth 2 points
  gameStats.lastShotResult = 'made';

  // Logging with shot details
  let shotDescription = "";
  if (gameStats.ballHitBackboard) {
    shotDescription = "BANK SHOT!";
  } else {
    shotDescription = "CLEAN SHOT!";
  }
  
  updateScoreDisplay();
  showShotFeedback('made');
}

function recordMissedShot() {
  gameStats.lastShotResult = 'missed';
  showShotFeedback('missed');
}

// Update event listeners
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function handleKeyDown(e) {
  // Arrow key movement
  if (e.key === "ArrowLeft") keyStates.ArrowLeft = true;
  if (e.key === "ArrowRight") keyStates.ArrowRight = true;
  if (e.key === "ArrowUp") keyStates.ArrowUp = true;
  if (e.key === "ArrowDown") keyStates.ArrowDown = true;
  
  // Power adjustment
  if (e.key === "w" || e.key === "W") {
    shotPower.isIncreasing = true;
    keyStates.KeyW = true;
  }
  if (e.key === "s" || e.key === "S") {
    shotPower.isDecreasing = true;
    keyStates.KeyS = true;
  }
  
  // Shooting
  if (e.key === " ") {
    e.preventDefault(); // Prevent page scrolling
    shootBasketball();
  }
  
  // Reset basketball (R key)
  if (e.key === "r" || e.key === "R") {
    resetBasketball();
  }
  
  // Toggle orbit camera
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
  
  // View switching
  if (e.key === "1") switchView(0);
  if (e.key === "2") switchView(1);
  if (e.key === "3") switchView(2);
}

function handleKeyUp(e) {
  if (e.key === "ArrowLeft") keyStates.ArrowLeft = false;
  if (e.key === "ArrowRight") keyStates.ArrowRight = false;
  if (e.key === "ArrowUp") keyStates.ArrowUp = false;
  if (e.key === "ArrowDown") keyStates.ArrowDown = false;
  
  if (e.key === "w" || e.key === "W") {
    shotPower.isIncreasing = false;
    keyStates.KeyW = false;
  }
  if (e.key === "s" || e.key === "S") {
    shotPower.isDecreasing = false;
    keyStates.KeyS = false;
  }
}

// Reset basketball function
function resetBasketball() {
  // Reset position
  basketballMovement.targetPosition.set(0, 0.18, 0);
  basketball.position.copy(basketballMovement.targetPosition);
  
  // Reset physics
  basketballPhysics.velocity.set(0, 0, 0);
  basketballPhysics.isInFlight = false;
  basketballPhysics.isGrounded = true;
  basketballPhysics.isBouncing = false;
  basketballPhysics.bounceCount = 0;
  
  // Reset rotation
  basketballRotation.angularVelocity.set(0, 0, 0);
  basketballRotation.lastPosition.copy(basketball.position);
  basketball.rotation.set(0, 0, 0);
  
  // Reset shot power
  shotPower.current = DEFAULT_POWER;
  // Update power indicator UI
  if (powerBarFill) {
    powerBarFill.style.width = shotPower.current + '%';
  }
  if (powerText) {
    powerText.textContent = `Shot Power: ${Math.round(shotPower.current)}%`;
  }
  
  // Reset movement state
  basketballMovement.isMoving = false;
  
  console.log("Basketball reset to center court");
}

// Find nearest hoop to basketball
function findNearestHoop() {
  const ballPos = basketball.position;
  let nearestHoop = hoopPositions[0];
  let minDistance = ballPos.distanceTo(hoopPositions[0]);
  
  for (let i = 1; i < hoopPositions.length; i++) {
    const distance = ballPos.distanceTo(hoopPositions[i]);
    if (distance < minDistance) {
      minDistance = distance;
      nearestHoop = hoopPositions[i];
    }
  }
  
  return nearestHoop;
}

// Find nearest hoop to a given position
function getNearestHoop(position) {
  let nearestHoop = hoopPositions[0];
  let minDistance = position.distanceTo(hoopPositions[0]);
  
  for (let i = 1; i < hoopPositions.length; i++) {
    const distance = position.distanceTo(hoopPositions[i]);
    if (distance < minDistance) {
      minDistance = distance;
      nearestHoop = hoopPositions[i];
    }
  }
  
  return nearestHoop;
}

// Calculate shot trajectory toward target hoop
function calculateShotTrajectory(targetHoop, power) {
  const startPos = basketball.position.clone();
  const endPos = targetHoop.clone();
  
  // Calculate horizontal distance and direction
  const horizontalDistance = Math.sqrt(
    Math.pow(endPos.x - startPos.x, 2) + 
    Math.pow(endPos.z - startPos.z, 2)
  );
  
  const heightDifference = endPos.y - startPos.y;
  
  // Power directly affects initial velocity with increased range for long shots
  const baseVelocity = 4 + (power / 100) * 12;
  
  // Calculate direction vector (normalized)
  const direction = new THREE.Vector3(
    endPos.x - startPos.x,
    0,
    endPos.z - startPos.z
  ).normalize();
  
  // Calculate shooting angle based on power
  const minAngle = Math.PI / 6; // 30 degrees
  const maxAngle = Math.PI / 2.5;  // 72 degrees
  const shootingAngle = minAngle + (maxAngle - minAngle) * (power / 100);
  
  // Calculate velocity components
  const horizontalVelocity = baseVelocity * Math.cos(shootingAngle);
  const verticalVelocity = baseVelocity * Math.sin(shootingAngle);
  
  // Apply velocity in the direction of the target
  const velocity = new THREE.Vector3(
    direction.x * horizontalVelocity,
    verticalVelocity,
    direction.z * horizontalVelocity
  );
  
  return velocity;
}

// Shoot basketball
function shootBasketball() {
  if (!basketballPhysics.isInFlight) {
    const nearestHoop = findNearestHoop();
    const trajectory = calculateShotTrajectory(nearestHoop, shotPower.current);
    
    // Set physics state
    basketballPhysics.velocity.copy(trajectory);
    basketballPhysics.isInFlight = true;
    basketballPhysics.isGrounded = false;
    basketballPhysics.isBouncing = false;
    basketballPhysics.bounceCount = 0;
    basketballPhysics.lastFrameTime = performance.now();
    
    // Record the shot attempt
    recordShotAttempt();
  }
}

// Update basketball physics
function updateBasketballPhysics() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - basketballPhysics.lastFrameTime) / 1000;
  basketballPhysics.lastFrameTime = currentTime;
  
  if (basketballPhysics.isInFlight) {
    // Store position before update for rotation calculation
    basketballRotation.lastPosition.copy(basketball.position);
    
    // Apply gravity
    basketballPhysics.velocity.y += SCALED_GRAVITY * deltaTime;
    
    // Track ball trajectory for scoring validation
    const nearestHoop = getNearestHoop(basketball.position);
    gameStats.ballTrajectory.maxHeight = Math.max(gameStats.ballTrajectory.maxHeight, basketball.position.y);
    if (basketball.position.y > nearestHoop.y) {
      gameStats.ballTrajectory.wasAboveRim = true;
    }
    
    // Use sub-stepping to prevent tunneling through backboards at high speeds
    const speed = basketballPhysics.velocity.length();
    const maxSubSteps = Math.max(1, Math.min(8, Math.ceil(speed / 3))); // More steps for faster balls
    const subDeltaTime = deltaTime / maxSubSteps;
    
    for (let step = 0; step < maxSubSteps; step++) {
      // Update position for this sub-step
      const deltaPos = basketballPhysics.velocity.clone().multiplyScalar(subDeltaTime);
      basketball.position.add(deltaPos);
      
      // Check for collisions after each sub-step
      let collisionOccurred = false;
      
      // Check for backboard collision first (highest priority)
      if (checkBackboardCollision()) {
        collisionOccurred = true;
        // Don't break - let other collisions be checked too
      }
      
      // Check for rim collision
      if (checkRimCollision()) {
        collisionOccurred = true;
      }
      
      // Ground collision detection with bouncing
      if (basketball.position.y <= GROUND_Y) {
        basketball.position.y = GROUND_Y;
        
        // Calculate bounce
        const bounceVelocity = Math.abs(basketballPhysics.velocity.y) * BOUNCE_DAMPING;
        
        if (bounceVelocity > MIN_BOUNCE_VELOCITY) {
          basketballPhysics.velocity.y = bounceVelocity;
          basketballPhysics.isBouncing = true;
          basketballPhysics.bounceCount++;
          
          // Dampen horizontal velocity slightly on bounce
          basketballPhysics.velocity.x *= 0.95;
          basketballPhysics.velocity.z *= 0.95;
        } else {
          // Ball has stopped bouncing
          basketballPhysics.velocity.set(0, 0, 0);
          basketballPhysics.isInFlight = false;
          basketballPhysics.isGrounded = true;
          basketballPhysics.isBouncing = false;
          basketballPhysics.bounceCount = 0;
          
          // Fallback: Only record miss when ball comes to rest if no other detection triggered
          if (gameStats.lastShotResult === null && gameStats.shotAttempts > 0) {
            const currentTime = performance.now();
            const timeSinceShot = currentTime - gameStats.shotStartTime;
            
            // Only mark as miss if sufficient time has passed and ball is clearly not near any hoop
            if (timeSinceShot > 5000) { // At least 5 seconds
              let nearAnyHoop = false;
              for (let i = 0; i < hoopPositions.length; i++) {
                const hoop = hoopPositions[i];
                const distance = basketball.position.distanceTo(hoop);
                if (distance <= RIM_RADIUS * 2) {
                  nearAnyHoop = true;
                  break;
                }
              }
              
              if (!nearAnyHoop) {
                recordMissedShot();
              }
            }
          }
          
          basketballMovement.targetPosition.copy(basketball.position);
          break; // Exit sub-stepping
        }
        collisionOccurred = true;
      }
    }
    
    // Update rotation based on flight velocity (after all sub-steps)
    updateBasketballRotation();
    
    // Check for missed shots during flight
    checkForMissedShot();
    
    // Check for shot timeout (fallback mechanism)
    checkShotTimeout();
    
    // Boundary collision detection
    if (basketball.position.x < -COURT_BOUNDARY_X || basketball.position.x > COURT_BOUNDARY_X) {
      basketballPhysics.velocity.x *= -0.5;
      basketball.position.x = Math.max(-COURT_BOUNDARY_X, Math.min(COURT_BOUNDARY_X, basketball.position.x));
    }
    
    if (basketball.position.z < -COURT_BOUNDARY_Z || basketball.position.z > COURT_BOUNDARY_Z) {
      basketballPhysics.velocity.z *= -0.5;
      basketball.position.z = Math.max(-COURT_BOUNDARY_Z, Math.min(COURT_BOUNDARY_Z, basketball.position.z));
    }
  }
}

// Rim collision detection
function checkRimCollision() {
  for (let i = 0; i < hoopPositions.length; i++) {
    const hoop = hoopPositions[i];
    const ballPos = basketball.position;
    const ballRadius = BASKETBALL_RADIUS;
    
    // Horizontal distance to rim center
    const horizontalDistance = Math.sqrt(
      Math.pow(ballPos.x - hoop.x, 2) + 
      Math.pow(ballPos.z - hoop.z, 2)
    );
    
    // Check if ball is near rim height
    const heightDifference = Math.abs(ballPos.y - hoop.y);
    const verticalDistance = ballPos.y - hoop.y;
    
    // PRIORITY 1: Check for successful shot first (ball passing through rim cleanly)
    if (gameStats.lastShotResult === null && basketballPhysics.velocity.y < 0) {
      // Clean shot through the rim - ball passes through center with downward velocity
      if (horizontalDistance <= SCORE_DETECTION_RADIUS && 
          ballPos.y <= hoop.y + 0.1 && ballPos.y >= hoop.y - 0.2) {
        
        // Check if ball was above the rim before passing through
        if (gameStats.ballTrajectory.wasAboveRim && 
            ballPos.y >= hoop.y - 0.05 && 
            basketballPhysics.velocity.y < -0.5 &&
            !gameStats.ballTrajectory.passedThroughRim) {
          
          gameStats.ballTrajectory.passedThroughRim = true;
          recordSuccessfulShot();
          return true;
        }
      }
    }
    
    // PRIORITY 2: rim collision detection
    // Check if ball is colliding with the rim (outer edge)
    if (horizontalDistance > SCORE_DETECTION_RADIUS && 
        horizontalDistance <= RIM_RADIUS + ballRadius && 
        heightDifference <= RIM_HEIGHT_TOLERANCE + ballRadius) {
      
      // Ball is hitting the rim
      const speed = basketballPhysics.velocity.length();
      
      if (speed > RIM_BOUNCE_MIN_VELOCITY) {
        // Mark that ball hit the rim for tracking
        gameStats.ballHitRim = true;
        
        // Calculate collision normal (direction from rim center to ball)
        const collisionNormal = new THREE.Vector3(
          ballPos.x - hoop.x,
          0, // Rim collision is primarily horizontal
          ballPos.z - hoop.z
        ).normalize();
        
        // If ball is hitting from above, add some upward component to normal
        if (verticalDistance > 0 && Math.abs(verticalDistance) < 0.15) {
          collisionNormal.y = 0.3; // Slight upward deflection
          collisionNormal.normalize();
        }
        
        // Calculate velocity component along collision normal
        const velocityAlongNormal = basketballPhysics.velocity.dot(collisionNormal);
        
        // Only reflect if moving towards the rim
        if (velocityAlongNormal < 0) {
          // Reflect velocity along normal with damping
          const reflectedVelocity = collisionNormal.clone()
            .multiplyScalar(-velocityAlongNormal * RIM_COLLISION_DAMPING);
          
          // Apply reflection to velocity
          basketballPhysics.velocity.add(reflectedVelocity.multiplyScalar(2));
          
          // Add small random component for realistic bounces
          const randomFactor = (Math.random() - 0.5) * RIM_COLLISION_RANDOMNESS;
          basketballPhysics.velocity.x += randomFactor;
          basketballPhysics.velocity.z += randomFactor;
          
          // Reduce overall energy
          basketballPhysics.velocity.multiplyScalar(RIM_COLLISION_DAMPING);
          
          // Move ball outside rim collision area to prevent sticking
          const penetration = (RIM_RADIUS + ballRadius) - horizontalDistance;
          if (penetration > 0) {
            const separation = collisionNormal.clone().multiplyScalar(penetration + 0.01);
            basketball.position.add(separation);
          }
          
          return true;
        }
      }
    }
    
    // PRIORITY 3: Soft shot detection - ball rolls around rim
    if (horizontalDistance <= RIM_RADIUS + ballRadius * 1.5 && 
        heightDifference <= 0.08 && 
        basketballPhysics.velocity.length() < 2.0 &&
        gameStats.lastShotResult === null) {
      
      // Ball is rolling slowly on/around rim
      if (horizontalDistance <= SCORE_DETECTION_RADIUS * 1.1 && 
          basketballPhysics.velocity.y < 0 &&
          gameStats.ballTrajectory.wasAboveRim &&
          !gameStats.ballTrajectory.passedThroughRim) {
        
        // Soft shot that drops in after rim contact
        gameStats.ballTrajectory.passedThroughRim = true;
        recordSuccessfulShot();
        return true;
      }
    }
    
    // PRIORITY 4: Miss detection - only for clear misses
    if (gameStats.lastShotResult === null && basketballPhysics.velocity.y < 0) {
      // Ball is clearly moving away from rim and below rim level
      const distanceFromRim = horizontalDistance;
      const timeSinceShot = performance.now() - gameStats.shotStartTime;
      
      // Miss detection - only if ball is clearly past the rim
      if (distanceFromRim > RIM_RADIUS * 2.5 && 
          ballPos.y < hoop.y - 0.5 && 
          timeSinceShot > 1500) { // Give more time for rim bounces
        recordMissedShot();
        return false;
      }
    }
  }
  return false;
}

// Backboard collision detection
function checkBackboardCollision() {
  const ballPos = basketball.position;
  const ballRadius = BASKETBALL_RADIUS;
  
  for (let i = 0; i < backboardPositions.length; i++) {
    const backboard = backboardPositions[i];
    
    // Distances to backboard center
    const dx = ballPos.x - backboard.x;
    const dy = ballPos.y - backboard.y;
    const dz = ballPos.z - backboard.z;
    
    // Check if ball is penetrating the backboard using proper overlap detection
    const overlapX = (backboard.width / 2 + ballRadius) - Math.abs(dx);
    const overlapY = (backboard.height / 2 + ballRadius) - Math.abs(dy);
    const overlapZ = (backboard.depth / 2 + ballRadius) - Math.abs(dz);
    
    // Only collide if ball is overlapping in ALL dimensions
    if (overlapX > 0 && overlapY > 0 && overlapZ > 0) {
      // Find the axis with the smallest overlap (most recent collision)
      let normal = new THREE.Vector3(0, 0, 0);
      let separationDistance = 0;
      
      if (overlapX <= overlapY && overlapX <= overlapZ) {
        // X-axis has smallest overlap - collision from side
        normal.x = dx > 0 ? 1 : -1;
        separationDistance = overlapX;
      } else if (overlapY <= overlapZ) {
        // Y-axis has smallest overlap - collision from top/bottom
        normal.y = dy > 0 ? 1 : -1;
        separationDistance = overlapY;
      } else {
        // Z-axis has smallest overlap - collision from front/back
        normal.z = dz > 0 ? 1 : -1;
        separationDistance = overlapZ;
      }
      
      // Only process collision if ball is moving toward the backboard
      const velocityDotNormal = basketballPhysics.velocity.dot(normal);
      if (velocityDotNormal < 0) {
        const speed = basketballPhysics.velocity.length();
        
        // Mark that ball hit backboard for bank shot consideration
        gameStats.ballHitBackboard = true;
        
        // Separate the ball from the backboard
        basketball.position.add(normal.clone().multiplyScalar(separationDistance + 0.01));
        
        // Backboard collision - reflect velocity
        const backboardDamping = 0.75; // Backboards absorb some energy
        const backboardRandomness = 0.05; // Small random factor for realism
        
        // Reflect velocity with damping
        const reflectedComponent = normal.clone().multiplyScalar(2 * velocityDotNormal * backboardDamping);
        basketballPhysics.velocity.sub(reflectedComponent);
        
        // Add small random component for realistic deflection
        const randomOffset = new THREE.Vector3(
          (Math.random() - 0.5) * backboardRandomness,
          (Math.random() - 0.5) * backboardRandomness * 0.5, // Less randomness in Y
          (Math.random() - 0.5) * backboardRandomness
        );
        basketballPhysics.velocity.add(randomOffset);
        
        // Reduce overall energy
        basketballPhysics.velocity.multiplyScalar(backboardDamping);
        
        return true;
      }
    }
  }
  return false;
}

// Miss detection
function checkForMissedShot() {
  // Only check if we haven't determined the shot result yet
  if (gameStats.lastShotResult !== null || !basketballPhysics.isInFlight) {
    return;
  }
  
  const ballPos = basketball.position;
  const currentTime = performance.now();
  
  // Give bank shots more time to potentially score
  const timeSinceShot = currentTime - gameStats.shotStartTime;
  const minTimeForBankShot = gameStats.ballHitBackboard ? 4000 : 3000; // Even more time: 4s for backboard shots, 3s for direct shots
  
  // If ball is still in flight, give it time to potentially score
  if ((gameStats.ballHitBackboard || gameStats.ballHitRim) && timeSinceShot < minTimeForBankShot) {
    return;
  }
  
  // Check if ball has passed significantly below any rim without scoring
  for (let i = 0; i < hoopPositions.length; i++) {
    const hoop = hoopPositions[i];
    const horizontalDistance = Math.sqrt(
      Math.pow(ballPos.x - hoop.x, 2) + 
      Math.pow(ballPos.z - hoop.z, 2)
    );

    // Only call miss when ball is clearly far away
    const missThreshold = gameStats.ballHitBackboard ? 3.0 : 2.0; // Even more lenient
    
    // Only call miss if ball is far below rim AND moving away from it
    if (horizontalDistance <= RIM_RADIUS * 3 && 
        ballPos.y < hoop.y - missThreshold && 
        basketballPhysics.velocity.y < -1) {
      recordMissedShot();
      return;
    }
  }
  
  // Miss detection for bank shots
  if (timeSinceShot > minTimeForBankShot) {
    // Ball moving away from all hoops and dropping significantly
    if (basketballPhysics.velocity.y < -4 && ballPos.y < HOOP_Y - 3.5) {
      let nearAnyHoop = false;
      for (let i = 0; i < hoopPositions.length; i++) {
        const hoop = hoopPositions[i];
        const distance = ballPos.distanceTo(hoop);
        if (distance <= RIM_RADIUS * 5) {
          nearAnyHoop = true;
          break;
        }
      }
      
      if (!nearAnyHoop) {
        recordMissedShot();
      }
    }
  }
}

// Fallback timeout-based shot detection
function checkShotTimeout() {
  if (gameStats.lastShotResult === null && gameStats.shotAttempts > 0) {
    const currentTime = performance.now();
    const timeSinceShot = currentTime - gameStats.shotStartTime;
    
    // Maximum time allowed for any shot (including complex bank shots)
    const maxShotTime = 15000;
    
    if (timeSinceShot > maxShotTime) {
      recordMissedShot();
    }
  }
}

// Game statistics object to track score and shots
const gameStats = {
  score: 0,
  shotsMade: 0,
  shotAttempts: 0,
  shootingPercentage: 0,
  lastShotResult: null,     // 'made', 'missed', or null
  ballHitBackboard: false,  // Track if ball hit backboard for bank shots
  ballHitRim: false,        // Track if ball hit rim
  shotStartTime: 0,         // Track when shot was initiated
  ballTrajectory: {
    wasAboveRim: false,     // Track if ball was ever above rim level during this shot
    maxHeight: 0,           // Highest point reached during shot
    passedThroughRim: false // Track if ball has already passed through rim area
  }
};

updateScoreDisplay();

function animate() {
  requestAnimationFrame(animate);
  
  updateBasketballPosition();
  
  updateShotPower();
  
  updateBasketballPhysics();
  
  // Basketball rotation is handled within position and physics updates
  controls.enabled = isOrbitEnabled;
  controls.update();
  
  renderer.render(scene, camera);
}

animate();

// Predefined viewpoints
const viewpoints = [
  { pos: [startCameraPosition.x, startCameraPosition.y, startCameraPosition.z], target: [0, 0, 0] }, // General view
  { pos: [-10.230, 3.109, 11], target: [-10, 3, 1] }, // Close-up view of left hoop
  { pos: [10.230, 3.109, 11], target: [10, 3, 1] }, // Close-up view of right hoop
];

let currentView = 0;

function switchView(viewIndex) {
  if (viewIndex >= 0 && viewIndex < viewpoints.length) {
    const view = viewpoints[viewIndex];
    camera.position.set(...view.pos);
    controls.target.set(...view.target);
    controls.update();
    currentView = viewIndex;
  }
}