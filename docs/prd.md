# Product Requirements Document: Orcistrator Initiative Tracker

## Overview

The Orcistrator Initiative Tracker is a web-based application designed to streamline combat encounters in Dungeons & Dragons 5th Edition (D&D 5e) for Dungeon Masters. It allows you to manually input player characters (PCs), select monsters from a list sourced via the 5e System Reference Document (SRD) API, and create a full initiative order. Player turns are managed manually, while monster turns are fully automated, with the application determining and resolving their actions. You, as the DM, will report these monster actions to your players. The application prioritizes a simple, intuitive interface to minimize complexity during gameplay.

The primary goals are to accelerate combat pacing, reduce downtime, and maintain player engagement by automating repetitive tasks like monster initiative rolls and turn resolutions.

---

## Goals

- **Speed Up Combat:** Automate monster turns to reduce the time spent rolling dice and deciding actions, allowing combat to flow quickly.
- **Enhance Player Engagement:** Minimize delays between turns to keep players focused and immersed in the game.
- **Simplify DM Workflow:** Provide an easy-to-use interface for managing initiative and combat, reducing cognitive load during sessions.

---

## Features

### 1. Player Character (PC) Management
- **Description:** Enable the DM to manually add PCs to the combat encounter.
- **Details:**
  - Input fields for each PC:
    - **Name:** The character’s name (e.g., "Aragorn").
    - **Initiative Score:** The total initiative roll (d20 + initiative modifier), entered manually by the DM.
    - **Armor Class (AC):** The PC’s AC, required for resolving automated monster attacks.
  - PCs are added to the initiative order once entered.
- **Purpose:** Allows you to include your players’ characters with their specific initiative rolls and ACs.

### 2. Monster Selection and Addition
- **Description:** Allow the DM to select monsters from a list and add them to the initiative order.
- **Details:**
  - Fetch a list of monsters from the D&D 5e SRD API (e.g., https://www.dnd5eapi.co/).
  - Provide a searchable dropdown or input field to select a monster (e.g., "Goblin," "Orc").
  - Allow specification of the number of instances of a selected monster (e.g., "Add 3 Goblins").
  - For each monster instance:
    - Automatically roll initiative: `d20 + Dexterity modifier` (Dex modifier derived from the monster’s stats via the API).
    - Assign a unique identifier (e.g., "Goblin 1," "Goblin 2") to distinguish multiple instances.
  - Add all monster instances to the initiative order.
- **Purpose:** Simplifies adding enemies to combat with automated initiative rolls, leveraging official 5e monster data.

### 3. Initiative Order Management
- **Description:** Build and display a sorted initiative order for all participants.
- **Details:**
  - Combine PCs and monsters into a single list.
  - Sort participants in **descending order** by initiative score.
  - Resolve ties by the order participants were added (first added goes first).
  - Display the initiative order in the interface, showing each participant’s name and initiative score.
- **Purpose:** Provides a clear, organized view of turn order for the DM to follow.

### 4. Turn Progression
- **Description:** Manage the flow of combat turns, with distinct handling for PCs and monsters.
- **Details:**
  - Track the current turn using an index or pointer within the initiative order.
  - **PC Turns:**
    - Display the current PC’s name and indicate it’s their turn (e.g., "Aragorn’s turn").
    - DM clicks a "Next Turn" button to proceed.
  - **Monster Turns:**
    - Automate the turn fully:
      1. **Target Selection:** Randomly select a PC from the list as the target.
      2. **Action Selection:** Choose a random attack from the monster’s "actions" (sourced from the API).
      3. **Attack Resolution:**
         - Roll to hit: `d20 + attack bonus` (from the monster’s attack stats).
         - Compare the result to the target PC’s AC.
         - If it hits, roll damage using the attack’s damage dice (e.g., `1d6 + 2`).
         - If it misses, indicate the miss.
      4. **Report:** Display the outcome (e.g., "Goblin 1 attacks Aragorn with a shortbow: rolled 15 vs. AC 14, hits for 5 piercing damage" or "rolled 12 vs. AC 14, misses").
    - DM clicks "Next Turn" to proceed after reviewing the automated action.
  - Loop back to the top of the initiative order after the last participant’s turn.
- **Purpose:** Speeds up combat by automating monster actions while allowing the DM to relay results to players.

### 5. User Interface
- **Description:** Provide a clean, simple interface for managing combat.
- **Details:**
  - **PC Input Section:**
    - Form with fields for Name, Initiative, and AC.
    - "Add PC" button to submit each entry.
  - **Monster Selection Section:**
    - Searchable dropdown or input to select a monster from the API list.
    - Field to enter the number of monsters to add.
    - "Add Monsters" button to process the selection.
  - **Initiative Order Display:**
    - List showing all participants, sorted by initiative (e.g., "Aragorn - 18," "Goblin 1 - 15").
  - **Current Turn Indicator:**
    - Highlight the current participant (e.g., bold text or a colored background).
    - For monster turns, show the automated action result below the initiative list.
  - **Control Buttons:**
    - "Next Turn" button to advance to the following participant.
    - Optional "Start Combat" button to finalize the initiative order and begin.
- **Purpose:** Ensures the DM can quickly set up and manage combat without a steep learning curve.

---

## Technical Requirements

- **Platform:** Web application.
- **Frontend:**
  - Built with **HTML**, **CSS**, and **JavaScript**.
  - Responsive design for use on desktops or tablets during sessions.
- **API Integration:**
  - Use the D&D 5e API (https://www.dnd5eapi.co/) to fetch monster data.
  - Retrieve at least: monster name, Dexterity score (for initiative), and actions (for attacks).
  - API calls made directly from the frontend (assuming CORS support).
- **State Management:**
  - Store combat state (PCs, monsters, initiative order, current turn) in the browser using **local storage** or **session storage**.
  - No backend or persistent database required for the initial version.
- **Development Tool:** Built using **Cursor**, an AI-powered code editor, to assist with coding tasks.

---

## Assumptions

- The DM provides accurate initiative scores and ACs for PCs based on their rolls and character sheets.
- Monster actions are limited to basic attacks (e.g., no spells or special abilities) for simplicity.
- The application does not track hit points, conditions, or other combat details beyond initiative and monster attacks.
- Combat state is not saved across browser sessions (resets on page refresh).

---

## Future Considerations

- **Manual Monster Actions:** Allow the DM to choose a monster’s action instead of random selection.
- **Advanced Automation:** Support spells, multiattack, or special abilities for monsters.
- **Combat Tracking:** Add hit point tracking and status conditions (e.g., unconscious, prone).
- **Persistence:** Implement save/load functionality for combat encounters using a backend or file export.

---

## Success Criteria

- **Functionality:** The application correctly builds an initiative order, progresses through turns, and automates monster actions.
- **Performance:** Combat rounds are noticeably faster compared to manual management, as reported by the DM.
- **Usability:** The interface is intuitive, requiring minimal explanation for the DM to use effectively during a session.
- **Engagement:** Players remain engaged with reduced downtime, based on DM observations.

---

## Implementation Notes

Since you’re using Cursor, here’s a suggested development roadmap:

1. **Setup:** Create the basic HTML structure, CSS for styling, and JavaScript skeleton.
2. **API Integration:** Fetch and display the monster list from the D&D 5e API.
3. **PC Input:** Build the form for adding PCs and store them in an array.
4. **Monster Input:** Implement monster selection, quantity input, and initiative rolling.
5. **Initiative Order:** Sort and display the combined participant list.
6. **Turn Logic:** Code the turn progression, including PC turn display and monster turn automation.
7. **UI Polish:** Add visual feedback (e.g., highlighting the current turn) and ensure responsiveness.
8. **Testing:** Test with sample combats (e.g., 3 PCs vs. 4 Goblins) to verify sorting, automation, and flow.