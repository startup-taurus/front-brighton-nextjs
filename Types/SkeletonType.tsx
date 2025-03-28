export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  headerHeight?: number;
  rowHeight?: number;
  className?: string;
  cellWidths?: number[];
  animated?: boolean;
}

export interface CardSkeletonProps {
  height?: number;
  className?: string;
  colProps?: any;
  headerHeight?: number;
  bodyHeight?: number;
  showHeader?: boolean;
}
