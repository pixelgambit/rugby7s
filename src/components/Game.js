import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/game.css';
import { 
    CANVAS_DIMENSIONS,
    FIELD_COLORS,
    PLAYER,
    TEXT_SETTINGS
} from '../utils/constants';

const CONTROLLER_MAPPING = {
    ANALOG_LEFT_X: 0,
    ANALOG_LEFT_Y: 1,
    BUTTON_RT: 7,
};

let frameCount = 0;
let lastFPSUpdate = 0;
let currentFPS = 0;

const Game = () => {
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    const [debug, setDebug] = useState({
        fps: 0,
        position: { x: 0, y: 0 },
        speed: 0
    });
    
    const [playerPosition, setPlayerPosition] = useState({
        x: 0,
        y: 0
    });
    
    const [movement, setMovement] = useState({
        up: false,
        down: false,
        left: false,
        right: false,
        sprint: false
    });

    const gamepadRef = useRef(null);
    const DEAD_ZONE = 0.1;

    const handleGamepadConnected = useCallback((e) => {
        console.log("Gamepad connected:", e.gamepad);
        gamepadRef.current = e.gamepad;
    }, []);

    const handleGamepadDisconnected = useCallback((e) => {
        console.log("Gamepad disconnected:", e.gamepad);
        gamepadRef.current = null;
    }, []);

    const handleAnalogInput = useCallback((value) => {
        return Math.abs(value) < DEAD_ZONE ? 0 : value;
    }, []);

    const handleKeyDown = useCallback((e) => {
        e.preventDefault();
        if (e.key === '`') {
            setDebug(prev => ({ ...prev, show: !prev.show }));
            return;
        }

        switch(e.key.toLowerCase()) {
            case 'w': setMovement(prev => ({ ...prev, up: true })); break;
            case 's': setMovement(prev => ({ ...prev, down: true })); break;
            case 'a': setMovement(prev => ({ ...prev, left: true })); break;
            case 'd': setMovement(prev => ({ ...prev, right: true })); break;
            case 'shift': setMovement(prev => ({ ...prev, sprint: true })); break;
            default: break;
        }
    }, []);

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

    const updatePlayerPosition = useCallback(() => {
        setPlayerPosition(prev => {
            let newX = prev.x;
            let newY = prev.y;
            let isSprinting = movement.sprint;
            let currentSpeed = isSprinting ? PLAYER.SPRINT_SPEED : PLAYER.MOVEMENT_SPEED;
            let dx = 0;
            let dy = 0;

            // Get all connected gamepads
            const gamepads = navigator.getGamepads();
            const gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

            // Handle gamepad input first
            if (gamepad) {
                const horizontalInput = handleAnalogInput(gamepad.axes[CONTROLLER_MAPPING.ANALOG_LEFT_X]);
                const verticalInput = handleAnalogInput(gamepad.axes[CONTROLLER_MAPPING.ANALOG_LEFT_Y]);
                
                isSprinting = movement.sprint || gamepad.buttons[CONTROLLER_MAPPING.BUTTON_RT].pressed;
                currentSpeed = isSprinting ? PLAYER.SPRINT_SPEED : PLAYER.MOVEMENT_SPEED;
                
                dx = horizontalInput;
                dy = verticalInput;
            }

            // Add keyboard input
            if (movement.up) dy -= 1;
            if (movement.down) dy += 1;
            if (movement.left) dx -= 1;
            if (movement.right) dx += 1;

            // Normalize diagonal movement to prevent faster diagonal speed
            if (dx !== 0 && dy !== 0) {
                const magnitude = Math.sqrt(dx * dx + dy * dy);
                dx = dx / magnitude;
                dy = dy / magnitude;
            }

            // Apply speed after normalization
            newX += dx * currentSpeed;
            newY += dy * currentSpeed;

            // Apply boundaries
            newX = Math.max(PLAYER.RADIUS, Math.min(newX, CANVAS_DIMENSIONS.WIDTH - PLAYER.RADIUS));
            newY = Math.max(PLAYER.RADIUS, Math.min(newY, CANVAS_DIMENSIONS.HEIGHT - PLAYER.RADIUS));

            setDebug(prev => ({
                ...prev,
                position: { x: Math.round(newX), y: Math.round(newY) },
                speed: currentSpeed
            }));

            return { x: newX, y: newY };
        });
    }, [movement, handleAnalogInput]);

    const drawPlayer = useCallback((ctx) => {
        ctx.beginPath();
        ctx.arc(playerPosition.x, playerPosition.y, PLAYER.RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = PLAYER.TEAM1.COLOR;
        ctx.fill();
        ctx.strokeStyle = PLAYER.TEAM1.STROKE_COLOR;
        ctx.stroke();
    }, [playerPosition]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        let frameCount = 0;
        let lastFPSUpdate = 0;
        let currentFPS = 0;

        const updateFPS = () => {
            const now = performance.now();
            frameCount++;
            
            if (now - lastFPSUpdate >= 1000) {
                setDebug(prev => ({ ...prev, fps: frameCount }));
                frameCount = 0;
                lastFPSUpdate = now;
            }
        };

        const drawField = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = FIELD_COLORS.OUTER_GRASS;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = FIELD_COLORS.GRASS;
            ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
            
            ctx.strokeStyle = FIELD_COLORS.LINES;
            ctx.lineWidth = 2;
            
            ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
            
            ctx.beginPath();
            
            ctx.moveTo(50, 150);
            ctx.lineTo(canvas.width - 50, 150);
            ctx.moveTo(50, canvas.height - 150);
            ctx.lineTo(canvas.width - 50, canvas.height - 150);
            
            ctx.moveTo(50, 250);
            ctx.lineTo(canvas.width - 50, 250);
            ctx.moveTo(50, canvas.height - 250);
            ctx.lineTo(canvas.width - 50, canvas.height - 250);
            
            const halfwayY = canvas.height / 2;
            ctx.moveTo(50, halfwayY);
            ctx.lineTo(canvas.width - 50, halfwayY);
            
            ctx.stroke();
            
            ctx.fillStyle = FIELD_COLORS.LINES;
            ctx.font = TEXT_SETTINGS.FONT;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.fillText('50', 25, halfwayY);
            ctx.fillText('50', canvas.width - 25, halfwayY);
            ctx.fillText('22', 25, 250);
            ctx.fillText('22', canvas.width - 25, 250);
            ctx.fillText('22', 25, canvas.height - 250);
            ctx.fillText('22', canvas.width - 25, canvas.height - 250);

            if (playerPosition.x === 0 && playerPosition.y === 0) {
                setPlayerPosition({
                    x: canvas.width / 2,
                    y: halfwayY + PLAYER.DISTANCE_BELOW_HALFWAY
                });
            }

            drawPlayer(ctx);
        };
        
        let animationFrameId;
        
        const gameLoop = () => {
            updatePlayerPosition();
            drawField();
            updateFPS();
            animationFrameId = window.requestAnimationFrame(gameLoop);
        };

        // Start the game loop
        animationFrameId = window.requestAnimationFrame(gameLoop);

        // Event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener("gamepadconnected", handleGamepadConnected);
        window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener("gamepadconnected", handleGamepadConnected);
            window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
            cancelAnimationFrame(animationFrameId);
        };
    }, [updatePlayerPosition, handleKeyDown, handleKeyUp, 
        handleGamepadConnected, handleGamepadDisconnected, drawPlayer, playerPosition]);

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