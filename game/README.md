# Kyoto Snake Game - Roblox Implementation

## Installation
1. Clone the repository
2. Open Roblox Studio
3. Import the project using `default.project.json`
4. Configure Developer Products in the Developer Portal

## Game Mechanics
### Player Controls
- Arrow keys or WASD for movement
- Collect food to grow and earn points
- Avoid self-collision
- Earn Primeagems for purchases

### Multiplayer Features
- Real-time player synchronization
- Shared food spawning
- Global leaderboard
- Player collision avoidance

## Monetization Setup
1. Developer Portal Configuration
   - Create 100 Primeagems pack (ID: 1234567)
   - Create 500 Primeagems pack (ID: 1234568)
   - Set pricing tiers

2. In-Game Store
   - Access via store button
   - Purchase Primeagems
   - View transaction history
   - Redeem rewards

## Project Structure
```
game/
├── src/
│   ├── client/
│   │   ├── SnakeClient.lua    # Client-side game logic
│   │   └── ui/
│   │       └── GameUI.lua     # User interface components
│   ├── server/
│   │   ├── GameState.lua      # Game state management
│   │   ├── MonetizationService.lua  # Purchase handling
│   │   ├── NetworkManager.lua # Multiplayer networking
│   │   └── SnakeServer.lua    # Server-side logic
│   └── shared/
│       ├── Constants.lua      # Game constants
│       ├── Snake.lua         # Snake entity logic
│       └── Food.lua          # Food entity logic
└── default.project.json      # Roblox project configuration
```

## Testing
See [TESTING.md](TESTING.md) for detailed testing procedures.

## Performance Optimization
- Use client-side prediction
- Implement efficient state synchronization
- Optimize network packet size
- Follow Roblox's performance guidelines

## Security Considerations
- Server-side validation for all actions
- Secure monetization handling
- Anti-cheat measures
- Data persistence safety

## Troubleshooting
1. Network Issues
   - Check server connectivity
   - Verify RemoteEvent setup
   - Monitor latency

2. Monetization Problems
   - Verify Developer Product IDs
   - Check MarketplaceService configuration
   - Review purchase logs

## Contributing
1. Fork the repository
2. Create a feature branch
3. Submit a pull request
4. Follow coding standards

## License
All rights reserved. Copyright © 2025 ThePrimeagen
