# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-02-19

### Breaking Changes
- Removed 2D game in favor of 3D hyperbolic version
- Moved all game files to docs/ directory for GitHub Pages deployment
- Removed legacy code from server/, game/, and src/ directories

### Added
- 3D hyperbolic geometry snake game with 6 degrees of freedom
- Autoplay mode that takes over after 5 deaths
- Light/dark theme toggle with localStorage persistence
- Vine boom sound effect on game over
- Cheese textures for snake segments
- Bot takeover functionality with pathfinding
- Comprehensive Jest testing setup
- Error handling for game initialization
- Support for vim-style movement (h,j,k,l)
- Proper snake segment rotation based on direction

### Changed
- Improved error handling and null checks
- Enhanced game initialization process
- Updated texture loading paths
- Cleaned up project structure
- Optimized collision detection in hyperbolic space

### Fixed
- Snake segment rotation (UP: -90°, DOWN: 90°, LEFT: 180°)
- Game initialization and script loading order
- Texture loading in 3D environment
- Sound effect triggering on game over
- Collision detection in hyperbolic space

### Added
- Autoplay mode after 5 deaths
- 3D hyperbolic geometry snake game
- Light/dark theme toggle with localStorage persistence
- Vine boom sound effect on game over
- Cheese textures for snake segments
- Bot takeover functionality
- Comprehensive Jest testing setup
- Error handling for game initialization
- Support for vim-style movement (h,j,k,l)
- Proper snake segment rotation based on direction
- 6 degrees of freedom movement (WASD + Q/E roll + R/F vertical)

### Changed
- Moved all game files to docs/ directory
- Improved error handling and null checks
- Enhanced game initialization process
- Updated texture loading paths
- Cleaned up project structure

### Fixed
- Snake segment rotation (UP: -90°, DOWN: 90°, LEFT: 180°)
- Game initialization and script loading order
- Texture loading in 3D environment
- Sound effect triggering on game over
- Collision detection in hyperbolic space
