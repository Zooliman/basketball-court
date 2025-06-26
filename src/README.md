# Basketball Court WebGL Implementation

This is the source code for Exercise 5 - an interactive 3D basketball court scene using Three.js and WebGL.

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

- **O key**: Toggle orbit camera controls on/off
- **1, 2, 3 keys**: Switch between predefined camera views:
  - **1**: General court view
  - **2**: Close-up view of left hoop
  - **3**: Close-up view of right hoop

## Additional Features Implemented

1. **Enhanced Textures and Materials**: 
   - Realistic wood court texture with normal maps and roughness maps
   - Detailed basketball with texture, normal maps, and physical properties
   - Physical material properties for realistic rendering

2. **Branded Elements**:
   - Lakers logo on the backboard's
   - Custom scoreboard with game display

3. **Realistic Basketball Court**:
   - Complete court markings including three-point line, center circle, free throw areas
   - Free throw lane markings and hash marks
   - Detailed key areas on both sides

4. **Enhanced Visual Elements**:
   - Soft shadows for improved realism
   - Multiple camera presets with smooth transitions
   - Scoreboard floating above the court
   - Detailed net rendering with multiple segments

5. **Stadium Environment**:
   - Suspended scoreboard above the center of the court
   - UI overlay for future score display (currently hidden)

## Known Issues and Limitations

1. The UI score container is hidden, as scoring functionality is intended for future implementation.
2. Basketball physics, shooting mechanics, and interactive controls are not implemented in this version.
3. The three-point arc is created using RingGeometry and might need adjustment on some camera angles.
4. The net is rendered using line segments, which may appear thin on some displays.

## External Assets Used

1. **Textures**:
   - Court wood texture: `court_diffuse.png`, `court_normal.png`, `court_roughness.png`
   - Basketball texture: `basketball_diffuse.png`, `basketball_normal.png`, `basketball_roughness.png`
   - Lakers logo: `lakers_logo2.png`
   - Scoreboard display: `scoreboard_display.png`

2. **Libraries**:
   - Three.js for 3D rendering
   - OrbitControls.js for camera manipulation