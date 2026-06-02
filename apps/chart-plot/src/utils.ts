export const MATH_ML_XMLNS: string = "http://www.w3.org/1998/Math/MathML";
export const SVG_XMLNS: string = "http://www.w3.org/2000/svg";
export const MIN_BOUND_ALLOWED: number = -1e10;
export const MAX_BOUND_ALLOWED: number = 1e10;

/** If true, a "Parse Formula" button will be added that logs parsing information to the console. */
export const DEBUG: boolean = false;

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error == 'string') {
        return error;
    } else if (
        error != null && typeof error == 'object' && 'message' in error
        && typeof error.message == 'string'
    ) {
        return error.message;
    }
    return 'Unknown error';
}
