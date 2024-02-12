Constants:

Defines various constants such as key codes for arrow keys, spacebar, and other game-related dimensions like game width, game height, cannon width, etc.
Game State Object (GAME_STATE):

Initializes an object to store the current state of the game including information such as timing, player input, cannon and alien positions, shots fired, score, lives, level, etc.
Utility Functions:

rectsIntersect: Checks if two rectangles intersect.
setPosition: Sets the position of an HTML element relative to its container.
clamp: Clamps a value within a specified range.
Timer-related Functions:

startTimer: Starts the game timer.
updateTimerDisplay: Updates the timer display on the UI.
Element Creation Functions:

createCannon: Creates the player's cannon.
createAlien: Creates an alien at a given position.
createCShot: Creates a shot fired by the cannon.
createAlienShot: Creates a shot fired by an alien.
Element Destruction Functions:

destroyCShot: Removes a cannon shot from the game.
destroyAlienShot: Removes an alien shot from the game.
destroyAlien: Removes an alien from the game when destroyed.
Update Functions:

updateCannon: Updates the cannon position based on user input.
updateCShots: Updates cannon shots' positions and checks for collisions with aliens.
updateAliens: Updates the position of aliens and manages level transitions.
updateAlienShots: Updates alien shots' positions and checks for collisions with the player's cannon.
Level Transition Function:

goToNextLevel: Handles transitioning to the next level by increasing difficulty and resetting the game state.
Miscellaneous Functions:

getOverlappingBullet: Checks if the player's cannon is hit by an alien shot.
createAlienShotInterval: Creates intervals for aliens to shoot.
End Game Function:

endGame: Ends the game, pausing the game loop and displaying a "Game Over" message.
Initialization Function (init):

Sets up the initial game state, including creating the cannon, aliens, starting timers, and initiating the game loop.
Event Listeners:

Listens for keyboard input to control the game, including movement, shooting, pausing, and restarting.
Initialization:

Calls the init function to start the game when the script is loaded.# space-invaders
