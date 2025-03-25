import React from 'react';
import { Card, CardBody, Col } from 'reactstrap';

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

  const skeletonStyle = {
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    width: '100%',
    height: '100%',
    opacity: 0.7,
    animation: 'pulse 1.5s ease-in-out infinite',
  };

  const pulseKeyframes = `
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.3; }
      100% { opacity: 0.6; }
    }
  `;

  const CardComponent = (
    <Card
      className={className}
      style={{ height }}
    >
      {showHeader && (
        <div style={{ height: headerHeight, padding: '12px 30px' }}>
          <div style={{ ...skeletonStyle, height: headerHeight * 0.6 }} />
        </div>
      )}
      <CardBody
        className='pt-0 rounded'
        style={{ height: calculatedBodyHeight }}
      >
        <div style={{ ...skeletonStyle }} />
      </CardBody>
    </Card>
  );

  return (
    <>
      <style>{pulseKeyframes}</style>
      {colProps ? <Col {...colProps}>{CardComponent}</Col> : CardComponent}
    </>
  );
};

export default CardSkeleton;
