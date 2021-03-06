import constants from 'namespace-constants';

// Modal
export const {
    MODAL_NONE,
    MODAL_SETTINGS
} = constants('widgets/Control', [
    'MODAL_NONE',
    'MODAL_SETTINGS'
]);

// mm (or in)
export const DISTANCE_MIN = 0;
export const DISTANCE_MAX = 10000;
export const DISTANCE_STEP = 1;

// Control
export const DEFAULT_AXES = ['x', 'y', 'z'];
