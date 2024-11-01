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
    BORDER: '#333333'
};

// Team colors
export const TEAM_COLORS = {
    TEAM1: '#ffffff', // White for Team 1
    TEAM2: '#808080'  // Gray for Team 2
};

// Player settings
export const PLAYER = {
    RADIUS: 8,  // Player circle radius in pixels
    DISTANCE_BELOW_HALFWAY: 5 * SCALE, // 5 meters below halfway line
    TEAM1: {
        COLOR: TEAM_COLORS.TEAM1,
        STROKE_COLOR: '#000000' // Black outline to make white players more visible
    },
    TEAM2: {
        COLOR: TEAM_COLORS.TEAM2,
        STROKE_COLOR: '#000000' // Black outline for consistency
    }
};