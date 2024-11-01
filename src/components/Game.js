import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/game.css';
import { 
    CANVAS_DIMENSIONS, 
    PLAYER,
    FIELD_COLORS 
} from '../utils/constants';

const Game = () => {
    //=====================================================
    // 1. COMPONENT SETUP & STATE MANAGEMENT
    //=====================================================
    // Canvas reference for drawing
    const canvasRef = useRef(null);
    
    // Player position state
    const [playerPosition, setPlayerPosition] = useState({
        x: 0,
        y: 0
    });
    
    // Movement state for tracking active movement directions
    const [movement, setMovement] = useState({
        up: false,
        down: false,
        left: false,
        right: false,
        sprint: false
    });

    //=====================================================
    // 2. CONTROLLER CONFIGURATION
    //=====================================================
    // Reference to store connected gamepad
    const gamepadRef = useRef(null);

    // Movement speed constants
    const MOVEMENT_SPEED = 0.6;  // Base movement speed
    const SPRINT_SPEED = 0.8;    // Sprint movement speed
    const DEAD_ZONE = 0.1;       // Analog stick dead zone to prevent drift

    // Controller button mapping
    const CONTROLLER_MAPPING = {
        ANALOG_LEFT_X: 0,    // Left stick horizontal axis
        ANALOG_LEFT_Y: 1,    // Left stick vertical axis
        BUTTON_RT: 7,        // Right trigger for sprint
    };

    //=====================================================
    // 3. EVENT HANDLERS (KEYBOARD & CONTROLLER)
    //=====================================================
    // Handle gamepad connection
    const handleGamepadConnected = useCallback((e) => {
        console.log("Gamepad connected:", e.gamepad);
        gamepadRef.current = e.gamepad;
    }, []);

    // Handle gamepad disconnection
    const handleGamepadDisconnected = useCallback((e) => {
        console.log("Gamepad disconnected:", e.gamepad);
        gamepadRef.current = null;
    }, []);

    // Process analog stick input with dead zone
    const handleAnalogInput = useCallback((value) => {
        return Math.abs(value) < DEAD_ZONE ? 0 : value;
    }, []);

    // Handle keyboard key press
    const handleKeyDown = useCallback((e) => {
        e.preventDefault();
        switch(e.key.toLowerCase()) {
            case 'w': setMovement(prev => ({ ...prev, up: true })); break;
            case 's': setMovement(prev => ({ ...prev, down: true })); break;
            case 'a': setMovement(prev => ({ ...prev, left: true })); break;
            case 'd': setMovement(prev => ({ ...prev, right: true })); break;
            case 'shift': setMovement(prev => ({ ...prev, sprint: true })); break;
            default: break;
        }
    }, []);

    // Handle keyboard key release
    const handleKeyUp = useCallback((e) => {
        switch(e.key.toLowerCase()) {
            case 'w': setMovement(prev => ({ ...prev, up: false })); break;
            case 's': setMovement(prev => ({ ...prev, down: false })); break;
            case 'a': setMovement(prev => ({ ...prev, left: false })); break;
            case 'd': setMovement(prev => ({ ...prev, right: false })); break;
            case 'shift': setMovement(prev => ({ ...prev, sprint: false })); break;
            default: break;
        }
    }, []);

    //=====================================================
    // 4. PLAYER MOVEMENT & PHYSICS
    //=====================================================
    // Update player position based on input
    const updatePlayerPosition = useCallback(() => {
        setPlayerPosition(prev => {
            let newX = prev.x;
            let newY = prev.y;
            let isSprinting = movement.sprint;

            // Handle gamepad input
            const gamepads = navigator.getGamepads();
            const gamepad = gamepads[0];

            if (gamepad) {
                // Process analog stick input
                const horizontalInput = handleAnalogInput(gamepad.axes[CONTROLLER_MAPPING.ANALOG_LEFT_X]);
                const verticalInput = handleAnalogInput(gamepad.axes[CONTROLLER_MAPPING.ANALOG_LEFT_Y]);
                
                // Apply analog movement
                if (Math.abs(horizontalInput) > 0) newX += horizontalInput * MOVEMENT_SPEED;
                if (Math.abs(verticalInput) > 0) newY += verticalInput * MOVEMENT_SPEED;

                // Check controller sprint
                if (gamepad.buttons[CONTROLLER_MAPPING.BUTTON_RT].pressed) {
                    isSprinting = true;
                }
            }

            // Calculate current movement speed
            const currentSpeed = isSprinting ? SPRINT_SPEED : MOVEMENT_SPEED;
            
            // Apply keyboard movement
            if (movement.up) newY -= currentSpeed;
            if (movement.down) newY += currentSpeed;
            if (movement.left) newX -= currentSpeed;
            if (movement.right) newX += currentSpeed;

            // Apply canvas boundaries
            newX = Math.max(PLAYER.RADIUS, Math.min(newX, CANVAS_DIMENSIONS.WIDTH - PLAYER.RADIUS));
            newY = Math.max(PLAYER.RADIUS, Math.min(newY, CANVAS_DIMENSIONS.HEIGHT - PLAYER.RADIUS));

            return { x: newX, y: newY };
        });
    }, [movement, handleAnalogInput, CONTROLLER_MAPPING.ANALOG_LEFT_X, CONTROLLER_MAPPING.ANALOG_LEFT_Y, CONTROLLER_MAPPING.BUTTON_RT]);

    //=====================================================
    // 5. CANVAS DRAWING & RENDERING
    //=====================================================
    // Draw player on canvas
    const drawPlayer = useCallback((ctx) => {
        ctx.beginPath();
        ctx.fillStyle = PLAYER.TEAM1.COLOR;
        ctx.strokeStyle = PLAYER.TEAM1.STROKE_COLOR;
        ctx.lineWidth = 1;
        ctx.arc(playerPosition.x, playerPosition.y, PLAYER.RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }, [playerPosition]);

    //=====================================================
    // 6. GAME LOOP & ANIMATION
    //=====================================================
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set up gamepad event listeners
        window.addEventListener("gamepadconnected", handleGamepadConnected);
        window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);
        
        // Draw the rugby field and lines
        const drawField = () => {
            // Clear previous frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw field layers
            ctx.fillStyle = FIELD_COLORS.OUTER_GRASS;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = FIELD_COLORS.GRASS;
            ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
            
            // Set up line properties
            ctx.strokeStyle = FIELD_COLORS.LINES;
            ctx.lineWidth = 2;
            
            // Draw field boundaries
            ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
            
            // Draw field lines
            ctx.beginPath();
            
            // Try lines
            ctx.moveTo(50, 150);
            ctx.lineTo(canvas.width - 50, 150);
            ctx.moveTo(50, canvas.height - 150);
            ctx.lineTo(canvas.width - 50, canvas.height - 150);
            
            // 22m lines
            ctx.moveTo(50, 250);
            ctx.lineTo(canvas.width - 50, 250);
            ctx.moveTo(50, canvas.height - 250);
            ctx.lineTo(canvas.width - 50, canvas.height - 250);
            
            // Halfway line
            const halfwayY = canvas.height / 2;
            ctx.moveTo(50, halfwayY);
            ctx.lineTo(canvas.width - 50, halfwayY);
            
            ctx.stroke();

            // Draw field text
            ctx.fillStyle = FIELD_COLORS.LINES;
            ctx.font = '16px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw distance markers
            ctx.fillText('50', 25, halfwayY);
            ctx.fillText('50', canvas.width - 25, halfwayY);
            ctx.fillText('22', 25, 250);
            ctx.fillText('22', canvas.width - 25, 250);
            ctx.fillText('22', 25, canvas.height - 250);
            ctx.fillText('22', canvas.width - 25, canvas.height - 250);

            // Set initial player position
            if (playerPosition.x === 0 && playerPosition.y === 0) {
                setPlayerPosition({
                    x: canvas.width / 2,
                    y: halfwayY + 50
                });
            }

            // Draw player
            drawPlayer(ctx);
        };

        // Set up keyboard event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Game loop setup
        let lastTime = 0;
        const targetFPS = 60;
        const frameInterval = 1000 / targetFPS;

        // Main game loop
        const render = (currentTime) => {
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= frameInterval) {
                updatePlayerPosition();
                drawField();
                lastTime = currentTime;
            }

            animationFrameId = window.requestAnimationFrame(render);
        };
        
        let animationFrameId = window.requestAnimationFrame(render);

        //=====================================================
        // 7. CLEANUP & EVENT MANAGEMENT
        //=====================================================
        return () => {
            // Remove event listeners
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener("gamepadconnected", handleGamepadConnected);
            window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
            
            // Stop animation loop
            window.cancelAnimationFrame(animationFrameId);
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, [playerPosition, drawPlayer, handleKeyDown, handleKeyUp, updatePlayerPosition, 
        handleGamepadConnected, handleGamepadDisconnected]);

    // Render canvas element
    return (
        <div className="game-container">
            <canvas 
                ref={canvasRef}
                width={CANVAS_DIMENSIONS.WIDTH}
                height={CANVAS_DIMENSIONS.HEIGHT}
                className="game-canvas"
                tabIndex={0}
                onFocus={(e) => e.target.style.outline = 'none'}
            />
        </div>
    );
};

export default Game;