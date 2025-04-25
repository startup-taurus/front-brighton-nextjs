import Cookies from 'js-cookie';

/**
 * Obtiene el rol del usuario desde las cookies o localStorage
 * @returns {string | null} El rol del usuario o null si no está disponible
 */
export const getUserRoleFromLocalStorage = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    // Intentar obtener el token de las cookies usando js-cookie
    const cookieToken = Cookies.get('token');

    if (cookieToken) {
      const user = JSON.parse(cookieToken);
      return user.role;
    }

    // Si no está en cookies, intentar con localStorage como fallback
    const userStr = localStorage.getItem('token');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si el usuario está autenticado, false en caso contrario
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    return !!Cookies.get('token') || !!localStorage.getItem('token');
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};
