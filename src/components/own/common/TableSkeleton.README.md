# Componente TableSkeleton

Este componente proporciona un esqueleto de carga para tablas que es completamente dinámico y personalizable.

## Características

- Número personalizable de filas y columnas
- Alturas personalizables para encabezados y filas
- Anchos de celda personalizables o generados aleatoriamente
- Animación de pulso opcional
- Completamente responsivo
- Variación en los tamaños de las celdas para simular contenido real

## Uso básico

```jsx
import TableSkeleton from '@/components/own/common/TableSkeleton';

<TableSkeleton />

<TableSkeleton
  rows={8}
  columns={5}
  showHeader={true}
  headerHeight={60}
  rowHeight={45}
  cellWidths={[100, 150, 200, 180, 120]}
  animated={true}
/>
```

## Props

| Prop         | Tipo     | Valor predeterminado | Descripción                                                                        |
| ------------ | -------- | -------------------- | ---------------------------------------------------------------------------------- |
| rows         | number   | 5                    | Número de filas en el esqueleto                                                    |
| columns      | number   | 4                    | Número de columnas en el esqueleto                                                 |
| showHeader   | boolean  | true                 | Mostrar u ocultar la fila de encabezado                                            |
| headerHeight | number   | 50                   | Altura en píxeles de la fila de encabezado                                         |
| rowHeight    | number   | 40                   | Altura base en píxeles de las filas de datos                                       |
| className    | string   | ''                   | Clase CSS adicional para el contenedor                                             |
| cellWidths   | number[] | undefined            | Array de anchos para cada columna. Si no se proporciona, se generan aleatoriamente |
| animated     | boolean  | true                 | Activar o desactivar la animación de pulso                                         |

## Integración con DataTable

Puede usar este componente como un indicador de carga personalizado para react-data-table-component:

```jsx
import DataTable from 'react-data-table-component';
import TableSkeleton from '@/components/own/common/TableSkeleton';

const MyTable = ({ data, columns, loading }) => {
  return (
    <>
      {loading ? (
        <TableSkeleton
          rows={5}
          columns={columns.length}
        />
      ) : (
        <DataTable
          data={data}
          columns={columns}
          // ... otras props
        />
      )}
    </>
  );
};
```
