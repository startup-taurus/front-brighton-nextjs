import React from 'react';
import { Card, CardBody, Col } from 'reactstrap';
import styles from './CardSkeleton.module.css';

interface CardSkeletonProps {
  height?: number;
  className?: string;
  colProps?: any;
  headerHeight?: number;
  bodyHeight?: number;
  showHeader?: boolean;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  height = 300,
  className = '',
  colProps,
  headerHeight = 50,
  bodyHeight,
  showHeader = true,
}) => {
  const calculatedBodyHeight =
    bodyHeight || height - (showHeader ? headerHeight : 0);

  const CardComponent = (
    <Card
      className={className}
      style={{ height }}
    >
      {showHeader && (
        <div
          className={styles.headerContainer}
          style={{ height: headerHeight }}
        >
          <div
            className={styles.skeletonElement}
            style={{ height: headerHeight * 0.6 }}
          />
        </div>
      )}
      <CardBody
        className='pt-0 rounded'
        style={{ height: calculatedBodyHeight }}
      >
        <div className={styles.skeletonElement} />
      </CardBody>
    </Card>
  );

  return colProps ? <Col {...colProps}>{CardComponent}</Col> : CardComponent;
};

export default CardSkeleton;
