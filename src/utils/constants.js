// Scale factor to convert real-world meters to pixels (1m = 5 pixels)
export const SCALE = 5;

// Field dimensions in meters
export const FIELD_MEASUREMENTS = {
    WIDTH: 70,     // Field width
    LENGTH: 100,   // Main playing area
    DEAD_BALL: 22, // Dead ball area
    MARGIN: 10,    // Margin around field
};

// Text settings
export const TEXT_SETTINGS = {
    FONT_FAMILY: 'Press Start 2P',
    FONT_SIZE: 16,
    get FONT() { return `${this.FONT_SIZE}px "${this.FONT_FAMILY}"`; }
};

// Calculate canvas dimensions based on field size plus margins
export const CANVAS_DIMENSIONS = {
    WIDTH: (FIELD_MEASUREMENTS.WIDTH + (2 * FIELD_MEASUREMENTS.MARGIN)) * SCALE,
    HEIGHT: ((FIELD_MEASUREMENTS.LENGTH + (2 * FIELD_MEASUREMENTS.DEAD_BALL) + (2 * FIELD_MEASUREMENTS.MARGIN))) * SCALE
};

export const FIELD_DIMENSIONS = {
    // Real rugby field dimensions scaled to pixels
    PLAYING_AREA: FIELD_MEASUREMENTS.LENGTH * SCALE,
    DEAD_BALL_AREA: FIELD_MEASUREMENTS.DEAD_BALL * SCALE,
    WIDTH: FIELD_MEASUREMENTS.WIDTH * SCALE,
    TOTAL_LENGTH: (FIELD_MEASUREMENTS.LENGTH + (2 * FIELD_MEASUREMENTS.DEAD_BALL)) * SCALE,
    
    // Margins for display purposes
    DEAD_BALL_MARGIN: FIELD_MEASUREMENTS.MARGIN * SCALE,
    SIDE_MARGIN: FIELD_MEASUREMENTS.MARGIN * SCALE,
    HALFWAY_LINE: (FIELD_MEASUREMENTS.LENGTH/2) * SCALE,
    LINE_WIDTH: 2,
};

// Field colors
export const FIELD_COLORS = {
    GRASS: '#00BF00',
    OUTER_GRASS: '#009900',
    LINES: '#ffffff',
};

// Player settings
export const PLAYER = {
    RADIUS: 8,
    DISTANCE_BELOW_HALFWAY: 5 * SCALE,
    TEAM1: {
        COLOR: '#ffffff',
        STROKE_COLOR: '#000000'
    },
    TEAM2: {
        COLOR: '#808080',
        STROKE_COLOR: '#000000'
    },
    MOVEMENT_SPEED: 0.6,    // Base movement speed
    SPRINT_SPEED: 0.9       // Sprint movement speed
};