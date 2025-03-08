# Orcistrator Initiative Tracker

A web-based application designed to streamline combat encounters in Dungeons & Dragons 5th Edition (D&D 5e) for Dungeon Masters. This tool allows you to manually input player characters, select monsters from the D&D 5e SRD API, and manage initiative order with automated monster turns.

## Features

- **Player Character Management**: Manually add PCs with their initiative rolls and armor class.
- **Monster Selection**: Choose monsters from the D&D 5e SRD API with automatic initiative rolls.
- **Initiative Order**: Automatically sorts all participants by initiative score.
- **Turn Management**: 
  - PC turns are managed manually by the DM.
  - Monster turns provide action selection options for the DM.
  - Attack calculations (to-hit rolls, damage) are automated.
- **Monster HP Tracking**:
  - Automatically calculates and displays monster HP based on SRD data.
  - Allows DMs to manually apply damage or healing to monsters.
  - Visually indicates monster health with a health bar.
  - Defeated monsters (0 HP) are visually marked and skipped in the turn order.
- **Monster Stat Blocks**:
  - Simplified stat blocks for each monster with key information.
  - Displays size, type, alignment, CR, AC, HP, speed, and ability scores.
  - Shows available actions during the monster's turn.
  - Collapsible interface to save space when not needed.
- **Simple Interface**: Clean, intuitive design to minimize complexity during gameplay.

## How to Use

1. **Add Player Characters**:
   - Enter the PC's name, initiative roll, and armor class.
   - Click "Add PC" to add them to the initiative order.

2. **Add Monsters**:
   - Search for a monster by name.
   - Specify how many of that monster to add.
   - Click "Add Monsters" to add them to the initiative order with automatically rolled initiative and calculated HP.

3. **Start Combat**:
   - Once all participants are added, click "Start Combat" to begin.
   - The initiative order will be sorted with the highest initiative going first.

4. **Manage Turns**:
   - For PC turns, the DM manages the player's actions manually.
   - For monster turns:
     - The monster's stat block automatically expands.
     - Select an action from the available action buttons.
     - The application will automatically calculate attack rolls and damage.
     - Results are displayed in the turn information area.
   - Click "Next Turn" to advance to the next participant.

5. **Track Monster HP**:
   - When players deal damage to monsters, click the "Damage" button next to the monster.
   - Enter the damage amount in the prompt.
   - The monster's HP will be updated, and the health bar will reflect the current status.
   - If a monster reaches 0 HP, it will be marked as defeated and skipped in the turn order.
   - To heal a monster, click the "Heal" button and enter the healing amount.

6. **View Monster Stats**:
   - Click the "Show Stats" button to view a monster's stat block.
   - The stat block includes basic information like size, type, alignment, CR, AC, HP, speed, and ability scores.
   - During a monster's turn, its available actions are displayed as buttons in the stat block.
   - Click "Hide Stats" to collapse the stat block when not needed.

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript.
- Uses the [D&D 5e API](https://www.dnd5eapi.co/) to fetch monster data.
- No backend or database required - all data is stored in the browser session.

## Running the Application

### Method 1: Direct File Opening
Simply open the `index.html` file in a web browser. No server or installation required.

### Method 2: Using the Node.js Server
For a more robust experience, especially if you encounter CORS issues with the D&D 5e API:

1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Open a terminal in the project directory.
3. Install dependencies (optional, only needed for development):
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
   or
   ```
   node server.js
   ```
5. Open your browser and navigate to `http://localhost:3000`

For development with auto-restart:
```
npm run dev
```

## Limitations

- Monster actions are limited to those provided by the D&D 5e API.
- The application does not track PC hit points or conditions.
- Combat state is not saved across browser sessions.

## Future Enhancements

- PC hit point tracking
- Status condition management
- Save/load functionality for combat encounters
- Custom monster creation
- Initiative re-rolling

## Credits

- Monster data provided by the [D&D 5e API](https://www.dnd5eapi.co/)
- Developed as part of the Orcistrator Initiative Tracker project 