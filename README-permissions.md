# Role-Based Access Control System

Este documento describe la implementación del sistema de control de acceso basado en roles (RBAC) para el frontend de Brighton.

## Estructura de Permisos

El sistema de permisos está implementado en el archivo `utils/permissions.ts` y define:

1. **Permisos individuales**: Constantes que representan acciones específicas que un usuario puede realizar.
2. **Roles**: Conjuntos de permisos asignados a diferentes tipos de usuarios.
3. **Funciones auxiliares**: Para verificar si un usuario tiene permisos específicos.

## Roles Disponibles

El sistema soporta los siguientes roles, basados en la configuración existente en `constants.ts`:

- `admin_staff`: Acceso completo a todas las funcionalidades.
- `professor`: Acceso a funciones relacionadas con cursos, estudiantes, asistencia y calificaciones.
- `student`: Acceso limitado a ver información de cursos, asistencia y calificaciones.
- `financial`: Acceso a funciones financieras y pagos.
- `coordinator`: Acceso a funciones de coordinación académica.

## Componentes de UI para Control de Acceso

Se han creado los siguientes componentes para facilitar el control de acceso en la interfaz:

1. **PermissionGuard**: Componente que renderiza condicionalmente su contenido basado en permisos.
2. **PermissionBasedNavigation**: Componente de navegación que muestra solo los enlaces a los que el usuario tiene acceso.
3. **usePermission**: Hook personalizado para verificar permisos en componentes funcionales.

## Uso en Componentes

### Usando PermissionGuard

```tsx
import PermissionGuard from '../components/common/PermissionGuard';
import { PERMISSIONS } from '../utils/permissions';

// Verificar un solo permiso
<PermissionGuard permission={PERMISSIONS.VIEW_STUDENTS}>
  <StudentList />
</PermissionGuard>

// Verificar múltiples permisos (cualquiera de ellos)
<PermissionGuard
  anyPermissions={[
    PERMISSIONS.ADD_GRADES,
    PERMISSIONS.EDIT_GRADES
  ]}
>
  <GradeEditor />
</PermissionGuard>

// Verificar múltiples permisos (todos ellos)
<PermissionGuard
  allPermissions={[
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.CREATE_COURSE
  ]}
>
  <CourseManager />
</PermissionGuard>

// Con contenido alternativo
<PermissionGuard
  permission={PERMISSIONS.VIEW_FINANCIAL_REPORTS}
  fallback={<AccessDeniedMessage />}
>
  <FinancialReports />
</PermissionGuard>
```

### Usando el Hook usePermission

```tsx
import { usePermission } from '../hooks/usePermission';
import { PERMISSIONS } from '../utils/permissions';

const MyComponent = () => {
  const { can, canAny, canAll } = usePermission();

  return (
    <div>
      {can(PERMISSIONS.VIEW_STUDENTS) && <button>Ver Estudiantes</button>}

      {canAny([PERMISSIONS.ADD_GRADES, PERMISSIONS.EDIT_GRADES]) && (
        <button>Gestionar Calificaciones</button>
      )}

      {canAll([PERMISSIONS.VIEW_COURSES, PERMISSIONS.CREATE_COURSE]) && (
        <button>Administrar Cursos</button>
      )}
    </div>
  );
};
```

## Integración con Backend

Aunque esta implementación es para frontend, aquí se muestra cómo se integraría con un backend:

### Verificación de Permisos en el Frontend

Actualmente, la verificación de permisos se realiza localmente basada en el rol del usuario almacenado en localStorage. En una implementación completa, se podría hacer una petición al backend:

```typescript
// Ejemplo de cómo sería la petición al backend
const checkPermissionFromBackend = async (
  permission: string
): Promise<boolean> => {
  try {
    const userStr = localStorage.getItem('token');
    if (!userStr) return false;

    const user = JSON.parse(userStr);

    const response = await fetch('/api/check-permission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ permission }),
    });

    const data = await response.json();
    return data.hasPermission;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};
```

## Ejemplo de Implementación en el Backend

En el backend, la estructura de permisos podría almacenarse en una base de datos con tablas para:

1. **Permisos**: Almacena todos los permisos disponibles.
2. **Roles**: Define los roles del sistema.
3. **RolPermisos**: Relación muchos a muchos entre roles y permisos.
4. **Usuarios**: Incluye el rol asignado a cada usuario.

La API del backend podría incluir endpoints como:

- `POST /api/check-permission`: Verifica si el usuario tiene un permiso específico.
- `GET /api/user/permissions`: Obtiene todos los permisos del usuario actual.
- `GET /api/roles`: Obtiene todos los roles disponibles.
- `GET /api/roles/:id/permissions`: Obtiene todos los permisos de un rol específico.

## Conclusión

Esta implementación proporciona una estructura sólida para el control de acceso basado en roles en el frontend, que puede integrarse fácilmente con un backend cuando esté disponible. La estructura es flexible y puede expandirse para incluir más roles y permisos según sea necesario.
