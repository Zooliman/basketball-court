import { OrbitControls } from "./OrbitControls.js";
// import * as THREE from 'three';

// Initialize texture loader
const textureLoader = new THREE.TextureLoader();

// Function to load wood texture from PNG file
function loadWoodTexture() {
  const texture = textureLoader.load(
    "src/textures/court_diffuse.png", // Wooden floor texture
    undefined,
    undefined,
    function (err) {
      console.warn("Could not load wood texture:", err);
    }
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2); // Adjust repeat based on your texture scale
  return texture;
}

// Function to load wood normal map from PNG file
function loadWoodNormalMap() {
  const normalTexture = textureLoader.load(
    "src/textures/court_normal.png", // Wooden floor normal map
    undefined,
    undefined,
    function (err) {
      console.warn("Wood normal map not found:", err);
    }
  );
  normalTexture.wrapS = THREE.RepeatWrapping;
  normalTexture.wrapT = THREE.RepeatWrapping;
  normalTexture.repeat.set(4, 2);
  return normalTexture;
}

// Function to load wood roughness map
function loadWoodRoughnessMap() {
  const roughnessTexture = textureLoader.load(
    "src/textures/court_roughness.png", // Wooden floor roughness map
    undefined,
    undefined,
    function (err) {
      console.warn("Wood roughness map not found:", err);
    }
  );
  roughnessTexture.wrapS = THREE.RepeatWrapping;
  roughnessTexture.wrapT = THREE.RepeatWrapping;
  roughnessTexture.repeat.set(4, 2);
  return roughnessTexture;
}

// Function to create a basketball texture
function createBasketballTexture() {
  const texture = textureLoader.load(
    "src/textures/basketball_diffuse.png", // Unwrapped basketball texture
    undefined,
    undefined,
    function (err) {
      console.warn("Could not load basketball texture:", err);
    }
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Function to create basketball normal map
function createBasketballNormalMap() {
  const normalTexture = textureLoader.load(
    "src/textures/basketball_normal.png", // Basketball normal map
    undefined,
    undefined,
    function (err) {
      console.warn("Basketball normal map not found:", err);
    }
  );
  normalTexture.wrapS = THREE.RepeatWrapping;
  normalTexture.wrapT = THREE.RepeatWrapping;
  return normalTexture;
}

// Function to create basketball roughness map
function createBasketballRoughnessMap() {
  const roughnessTexture = textureLoader.load(
    "src/textures/basketball_roughness.png", // Basketball roughness map
    undefined,
    undefined,
    function (err) {
      console.warn(
        "Basketball roughness map not found:",
        err
      );
    }
  );
  roughnessTexture.wrapS = THREE.RepeatWrapping;
  roughnessTexture.wrapT = THREE.RepeatWrapping;
  return roughnessTexture;
}

// Function to load Lakers backboard logo
function loadLakersLogo() {
  const logoTexture = textureLoader.load(
    "src/textures/lakers_logo.png",
    undefined,
    undefined,
    function (err) {
      console.warn("Lakers logo not found:", err);
    }
  );
  return logoTexture;
}

// Function to load scoreboard texture
function loadScoreboardTexture() {
  const scoreboardTexture = textureLoader.load(
    "src/textures/scoreboard_display.png",
    undefined,
    undefined,
    function (err) {
      console.warn("Scoreboard texture not found:", err);
    }
  );
  return scoreboardTexture;
}

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
  // Load all court textures
  const woodTexture = loadWoodTexture();
  const woodNormalMap = loadWoodNormalMap();
  const woodRoughnessMap = loadWoodRoughnessMap();

  const courtGeometry = new THREE.BoxGeometry( COURT_LENGTH, COURT_THICKNESS, COURT_WIDTH );


  // Create enhanced court material with all maps
  const courtMaterial = new THREE.MeshPhysicalMaterial({
    map: woodTexture,
    clearcoatRoughness: 0.1,
  });


  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  court.position.y = -COURT_THICKNESS / 2;

  return court;
}

// Create basketball hoops
function createBasketballHoops() {
  const group = new THREE.Group();
  // --- HOOP CONSTANTS ---
  const HOOP_Y = HOOP_HEIGHT_FROM_FLOOR + COURT_THICKNESS / 2; // Rim y-position (3.05 + 0.1 = 3.15)
  const BACKBOARD_WIDTH = 1.8;
  const BACKBOARD_HEIGHT = 1.2;
  const BACKBOARD_THICKNESS = 0.05;
  const RIM_RADIUS = 0.45;
  const RIM_TUBE_RADIUS = 0.03;
  const RIM_OFFSET_FROM_BOARD = 0.66;
  const RIM_AND_NET_OFFSET_FROM_BOARD = 0.17;
  const RIM_BELOW_BACKBOARD_BOTTOM = 0.05;
  const NET_HEIGHT = 0.45; // Slightly deeper for realism
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
    const lakersLogo = loadLakersLogo();
    const logoGeometry = new THREE.PlaneGeometry(
      BACKBOARD_WIDTH * 0.6, // Smaller than backboard
      BACKBOARD_HEIGHT * 0.6
    );
    const logoMaterial = new THREE.MeshBasicMaterial({
      map: lakersLogo,
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
  return group;
}

// Create basketball
function createBasketball() {
  // Load all basketball textures
  const basketballTexture = createBasketballTexture();
  const basketballNormalMap = createBasketballNormalMap();
  const basketballRoughnessMap = createBasketballRoughnessMap();

  // Create enhanced basketball material
  const basketballMaterial = new THREE.MeshPhysicalMaterial({
    map: basketballTexture,
    normalMap: basketballNormalMap,
    roughnessMap: basketballRoughnessMap,
    roughness: 0.7,
    metalness: 0.0,
    clearcoat: 0.1,
    clearcoatRoughness: 0.3,
  });

  const basketballGeometry = new THREE.SphereGeometry(0.12, 32, 32);
  const basketball = new THREE.Mesh(basketballGeometry, basketballMaterial);
  basketball.position.set(0, 0.18, 0);
  basketball.castShadow = true;

  return basketball;
}

// Create scoreboard
function createScoreboard() {
  const scoreboardTexture = loadScoreboardTexture();

  // Create cube geometry for the scoreboard
  const scoreboardGeometry = new THREE.BoxGeometry(8, 4, 8);

  // Create materials array for the cube faces
  const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const displayMaterial = new THREE.MeshBasicMaterial({
    map: scoreboardTexture,
    emissive: 0x222222,
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

// Create all elements
const court = createBasketballCourt();
scene.add(court);

addCourtLines(); // Add the court lines

createBasketballHoops(); // This function adds objects directly to the scene

const basketball = createBasketball();
scene.add(basketball);

const scoreboard = createScoreboard();
scene.add(scoreboard);

// Set camera position for better view
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
instructionsElement.style.color = 'white';
instructionsElement.style.fontSize = '16px';
instructionsElement.style.fontFamily = 'Arial, sans-serif';
instructionsElement.style.textAlign = 'left';
instructionsElement.innerHTML = `
  <h3>Controls:</h3>
  <p>O - Toggle orbit camera</p>
  <p>1/2/3 - Switch to predefined views</p>
`;
document.body.appendChild(instructionsElement);

// Score display container (for future HW06 functionality)
const scoreContainer = document.createElement('div');
scoreContainer.id = 'score-container';
scoreContainer.style.position = 'absolute';
scoreContainer.style.top = '20px';
scoreContainer.style.left = '50%';
scoreContainer.style.transform = 'translateX(-50%)';
scoreContainer.style.color = 'white';
scoreContainer.style.fontSize = '24px';
scoreContainer.style.fontFamily = 'Arial, sans-serif';
scoreContainer.style.fontWeight = 'bold';
scoreContainer.style.textAlign = 'center';
scoreContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
scoreContainer.style.padding = '10px 20px';
scoreContainer.style.borderRadius = '10px';
scoreContainer.innerHTML = `
  <div id="score-display">
    <span>Score: <span id="player-score">0</span></span>
  </div>
`;
document.body.appendChild(scoreContainer);
scoreContainer.style.display = 'none'; // Hide for now, will be shown in HW06

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
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

// Key listener for switching views
document.addEventListener("keydown", function (e) {
  if (e.key === "1") switchView(0);
  if (e.key === "2") switchView(1);
  if (e.key === "3") switchView(2);
});
