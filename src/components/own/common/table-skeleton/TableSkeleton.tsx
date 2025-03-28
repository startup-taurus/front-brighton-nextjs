import React from 'react';
import styles from './TableSkeleton.module.css';
import { TableSkeletonProps } from 'Types/SkeletonType';

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  headerHeight = 50,
  rowHeight = 40,
  className = '',
  cellWidths,
  animated = true,
}) => {
  const widths =
    cellWidths ||
    Array(columns)
      .fill(0)
      .map(() => {
        return Math.floor(Math.random() * (200 - 60) + 60);
      });

  return (
    <div className='table-responsive signal-table'>
      <div className={`${styles.tableSkeletonContainer} ${className}`}>
        <table className={styles.tableSkeleton}>
          {showHeader && (
            <thead>
              <tr style={{ height: `${headerHeight}px` }}>
                {Array(columns)
                  .fill(0)
                  .map((_, index) => (
                    <th
                      key={`header-${index}`}
                      style={{ width: `${widths[index]}px` }}
                    >
                      <div
                        className={`${styles.skeletonCell} ${animated ? styles.pulse : ''}`}
                        style={{ height: `${headerHeight * 0.6}px` }}
                      />
                    </th>
                  ))}
              </tr>
            </thead>
          )}
          <tbody>
            {Array(rows)
              .fill(0)
              .map((_, rowIndex) => (
                <tr
                  key={`row-${rowIndex}`}
                  style={{ height: `${rowHeight}px` }}
                >
                  {Array(columns)
                    .fill(0)
                    .map((_, colIndex) => {
                      const cellHeight =
                        rowHeight * (Math.random() * 0.3 + 0.5);

                      return (
                        <td
                          key={`cell-${rowIndex}-${colIndex}`}
                          style={{ width: `${widths[colIndex]}px` }}
                        >
                          <div
                            className={`${styles.skeletonCell} ${animated ? styles.pulse : ''}`}
                            style={{ height: `${cellHeight}px` }}
                          />
                        </td>
                      );
                    })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSkeleton;
