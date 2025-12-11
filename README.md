# TAP Game - 3D Isometric Grid Puzzle

## Live Demo

Play the game directly in your browser:
**[Click Here to Play](https://miya3333.github.io/tap-game/)**

---

A responsive web-based puzzle game built entirely with Vanilla JavaScript, HTML5, and CSS3. This project demonstrates advanced DOM manipulation, CSS 3D transforms, and complex game logic implementation without the use of external game engines or libraries.

## Project Overview

This application serves as a technical showcase of frontend development skills. It features a dual-mode gameplay system where users can navigate a player entity through an 8x8 grid to collect targets within a specific time limit. The game highlights the ability to manage state, handle complex asynchronous events, and render performant 3D visualizations using native web technologies.

## Key Features

### 1. Dual Gameplay Modes
* **Standard Mode:** Classic grid movement using keyboard arrow keys (with axis-locking for precision) or mouse click pathfinding.
* **Gravity Mode:** A physics-inspired puzzle mode where the player cannot move directly. Instead, the user rotates the board 90 degrees, causing the player to "fall" according to the new gravitational direction until it hits a wall or target.

### 2. Advanced Visuals
* **CSS 3D Environment:** The game board is rendered in a 3D space using `transform-style: preserve-3d` and `perspective`.
* **Dynamic Rotation:** The board rotates smoothly on the Z-axis while maintaining its 3D tilt perspective.
* **Responsive Design:** The game automatically adjusts grid sizes and controls for mobile, tablet, and desktop viewports using CSS Variables and Media Queries.

### 3. Game Logic & State Management
* **Time Attack System:** Configurable timer settings (10s to 60s) with persistent high-score tracking for each time category.
* **Interruptible Animations:** The gravity logic handles real-time interruptions, allowing users to rotate the board mid-fall to change the player's trajectory dynamically.
* **Pathfinding:** Simple automated movement logic when clicking on a target cell.
* **Game Loop Control:** Full support for Start, Pause, Resume, and Stop/Reset functionalities.

## Technology Stack

* **HTML5:** Semantic structure.
* **CSS3:** Flexbox, Grid Layout, 3D Transforms, Animations.
* **JavaScript (ES6+):** Game loop, logic, and state management.

## How to Play

1.  **Select Time Limit:** Choose a duration from the dropdown menu (10s - 60s).
2.  **Select Mode:** Choose between Standard or Gravity mode.
3.  **Start Game:** Click the "START GAME" button.
4.  **Objective:** Move the blue player circle to the red target circle to score points before time runs out.

**Controls:**
* **Standard Mode:** Use Arrow Keys to move, or click on a grid cell to auto-walk.
* **Gravity Mode:** Use the "Rotate Left" or "Rotate Right" buttons to spin the board. The player will fall downwards based on the board's current orientation.

## License

This project is open source and available under the MIT License.
