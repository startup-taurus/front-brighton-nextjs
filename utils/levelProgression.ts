// levelProgression.ts

// Secuencia de progresión para adultos
export const ADULT_LEVEL_PROGRESSION = [
  { id: '7', full_level: 'PRE-A1 STARTERS', short_level: 'PRE-A1' },
  { id: '1', full_level: 'A1 BEGINNER', short_level: 'A1' },
  { id: '2', full_level: 'A2 ELEMENTARY', short_level: 'A2' },
  { id: '3', full_level: 'B1 PRE-INTERMEDIATE', short_level: 'B1' },
  { id: '4', full_level: 'B1+ INTERMEDIATE', short_level: 'B1+' },
  { id: '6', full_level: 'B2 FIRST', short_level: 'B2' },
  { id: '5', full_level: 'B2 UPPERINTERMEDIATE', short_level: 'B2' },
  { id: '14', full_level: 'Private Classes', short_level: 'Private Cl' },
];

// Secuencia de progresión para niños
export const KIDS_LEVEL_PROGRESSION = [
  { id: '7', full_level: 'PRE-A1 STARTERS', short_level: 'PRE-A1' },
  { id: '8', full_level: 'A1.1 MOVERS', short_level: 'A1.1' },
  { id: '12', full_level: 'A1.2 MOVERS', short_level: 'A1.2' },
  { id: '13', full_level: 'A2.1 FLYERS', short_level: 'A2.1' },
  { id: '9', full_level: 'A2.2 FLYERS', short_level: 'A2.2' },
  { id: '10', full_level: 'B1.1 PREINTERMEDIATE', short_level: 'B1.1' },
  { id: '11', full_level: 'B1.2 PRE-INTERMEDIATE', short_level: 'B1.2' },
  { id: '14', full_level: 'Private Classes', short_level: 'Private Cl' },
];

/**
 * Obtiene el siguiente nivel en la secuencia de progresión (como string).
 * @param currentLevel - El nivel actual del estudiante (por ej. "A1.1 MOVERS").
 * @param isKid - Indica si el estudiante es niño (true) o adulto (false).
 * @returns El siguiente nivel en texto. Si es el último o no se encuentra, retorna el mismo nivel.
 */
export const getNextLevel = (
  currentLevel: string,
  isKid: boolean = false
): string => {
  const progression = isKid ? KIDS_LEVEL_PROGRESSION : ADULT_LEVEL_PROGRESSION;

  // Buscar el índice del nivel actual
  const currentIndex = progression.findIndex(
    (level) =>
      level.full_level === currentLevel || level.short_level === currentLevel
  );

  // Si no se encuentra o ya es el último, devolvemos el mismo
  if (currentIndex === -1 || currentIndex === progression.length - 1) {
    return currentLevel;
  }

  // Obtener el siguiente nivel
  const nextLevelObj = progression[currentIndex + 1];
  if (nextLevelObj && typeof nextLevelObj === 'object') {
    // Preferimos `full_level` si está definido, de lo contrario `short_level`
    return nextLevelObj.full_level || nextLevelObj.short_level || currentLevel;
  }

  return currentLevel;
};
/**
 * Verifica si un nivel es válido en la secuencia de progresión
 * @param level - El nivel (texto) a verificar
 * @param isKid - True si queremos validar en la secuencia de niños
 * @returns true si el nivel existe en la secuencia, false en caso contrario
 */
export const isValidLevel = (
  level: string,
  isKid: boolean = false
): boolean => {
  const progression = isKid ? KIDS_LEVEL_PROGRESSION : ADULT_LEVEL_PROGRESSION;
  return progression.some(
    (lvl) => lvl.full_level === level || lvl.short_level === level
  );
};
