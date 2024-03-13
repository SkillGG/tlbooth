export const cssIf = (condidion: unknown, onTrue?: string, onFalse = "") => {
    return !!condidion ? (onTrue ?? onFalse) : onFalse;
}