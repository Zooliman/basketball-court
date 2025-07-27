# Basketball Court WebGL Implementation

This is the source code for Exercise 5 - an interactive 3D basketball court scene using Three.js and WebGL.

## Group Members
- Bar Azulay

## How to Run the Implementation

1. Navigate to the project root directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   node ./index.js
   ```
4. Open your browser and go to `http://localhost:8000`

## Controls

### Basketball Movement
- **Arrow Keys**: Move basketball around the court
  - **↑/↓**: Forward/Backward movement
  - **←/→**: Left/Right movement

### Shooting System
- **W/S Keys**: Adjust shot power (0-100%)
  - **W**: Increase power
  - **S**: Decrease power
- **Spacebar**: Shoot basketball with current power
- **R Key**: Reset basketball to center court position

### Camera Controls
- **O Key**: Toggle orbit camera controls on/off
- **1, 2, 3 Keys**: Switch between predefined camera views:
  - **1**: General court view
  - **2**: Close-up view of left hoop
  - **3**: Close-up view of right hoop

## Physics System Implementation

The basketball game features a comprehensive physics system built on realistic parameters:

### Core Physics
- **Gravity**: Realistic gravity simulation (-9.8 m/s² with physics scaling)
- **Projectile Motion**: Accurate trajectory calculation for basketball shots
- **Collision Detection**: Advanced collision system for ball-rim and ball-ground interactions

### Basketball Physics
- **Bouncing**: Realistic bounce mechanics with damping factors
- **Rim Collisions**: Specialized collision handling for rim interactions with randomness
- **Ground Physics**: Ball bouncing off court surface with energy loss
- **Boundary Detection**: Ball stays within court boundaries during movement

### Shot Mechanics
- **Power System**: Variable shot power (0-100%) affecting trajectory
- **Angle Calculation**: Automatic angle calculation for optimal shot trajectory
- **Score Detection**: Automatic scoring when ball passes through hoop
- **Physics Scaling**: Tuned physics parameters for optimal gameplay experience

## Additional Features Implemented

### Enhanced Visual Elements
1. **Texture System**: 
   - Centralized texture management with `TextureManager` class
   - Realistic wood court texture with diffuse, normal, and roughness maps
   - Detailed basketball texture with physical material properties
   - Configuration-based texture loading system

2. **Branded Court Elements**:
   - Lakers logo displayed on both backboards
   - Custom scoreboard with game display texture
   - Professional court markings and three-point lines

3. **Realistic Basketball Court**:
   - Complete NBA regulation court markings
   - Three-point arc with proper geometry
   - Free throw areas with lane markings and hash marks
   - Center circle and detailed sideline/baseline boundaries

4. **Advanced Lighting and Shadows**:
   - Soft shadows with PCF (Percentage Closer Filtering)
   - High-resolution shadow maps (2048x2048)
   - Realistic ambient and directional lighting setup
   - Shadow casting for all court elements

5. **Detailed 3D Models**:
   - Realistic basketball hoops with support structures
   - Detailed nets with multiple segments and natural curves
   - Professional backboards with proper dimensions
   - Support poles and connecting arms

6. **Interactive UI System**:
   - Comprehensive on-screen instructions with styled layout
   - Real-time power indicator system
   - Score tracking display
   - Responsive design with backdrop blur effects

### Technical Improvements
1. **Code Architecture**:
   - Modular texture loading system
   - Centralized material creation functions
   - Clean separation of concerns
   - Optimized performance with texture reuse

2. **Physics Integration**:
   - Realistic ball physics with proper damping
   - Advanced collision detection algorithms
   - Boundary constraint system
   - Smooth trajectory calculations

## Known Issues and Limitations

1. **Physics Limitations**: 
   - Ball-to-ball collisions are not implemented (single ball system)
   - Advanced spin physics are simplified for gameplay
   - Net collision is visual only (no physical interaction)

2. **Rendering Considerations**:
   - Net rendering uses line geometry which may appear thin on some displays
   - Three-point arc uses RingGeometry which may need adjustment at certain camera angles
   - Texture loading may cause brief delays on slower connections

3. **Control System**: 
   - No gamepad support (keyboard only)
   - Camera transitions could be smoother
   - Power adjustment is linear (no acceleration curves)

## Sources of External Assets Used

### Texture Assets
- **Court Textures**: 
  - `court_diffuse.png` - Wood court surface texture
  - `court_normal.png` - Normal map for wood surface detail
  - `court_roughness.png` - Roughness map for realistic material properties

- **Basketball Textures**:
  - `basketball_diffuse.png` - Basketball surface texture with standard orange color and lines
  - `basketball_normal.png` - Normal map for basketball surface bumps and details
  - `basketball_roughness.png` - Roughness map for realistic leather/rubber material

- **UI and Branding**:
  - `lakers_logo.png` - Los Angeles Lakers team logo for backboard branding
  - `scoreboard_display.png` - Electronic scoreboard display texture

### Code Libraries
- **Three.js**: Primary 3D rendering library
- **OrbitControls.js**: Camera control system for user interaction

### Development Tools
- **Node.js**: Development server for local hosting
- **NPM**: Package management for dependencies