export const cssIf = (condidion: unknown, onTrue?: string, onFalse = ""): string => {
    return !!condidion ? (`${onTrue}` ?? onFalse) : onFalse;
}

export const cssDef = (condidion?: string) => {
    return cssIf(condidion, condidion);
}