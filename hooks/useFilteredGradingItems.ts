import { useMemo } from 'react';
import { COMPONENTS_GRADEBOOK } from '../utils/constants';
import { ComponentsGradebook, GradingItem } from '../Types/GradingItem';

const useFilteredGradingItems = (gradingItems: any[] = []) => {
  return useMemo(() => {
    if (!gradingItems || gradingItems.length === 0) return [];

    const filteredItems = gradingItems.filter(
      (item) => !item.item_name.includes('(eliminado)')
    );

    const itemsByCategory: Record<string, GradingItem[]> = {};

    filteredItems.forEach((item) => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });

    Object.keys(itemsByCategory).forEach((category) => {
      const items = itemsByCategory[category];
      const itemCount = items.length;

      if (itemCount > 0) {
        const weightPerItem = (100 / itemCount).toFixed(2);

        items.forEach((item) => {
          item.weight = weightPerItem;
        });
      }
    });

    return filteredItems;
  }, [gradingItems]);
};

export const useFilteredGradebookComponents = (gradingItems: any = []) => {
  const filteredItems = useFilteredGradingItems(gradingItems);

  return useMemo(() => {
    const assignments = filteredItems.filter(
      (item: any) => item.category === COMPONENTS_GRADEBOOK.ASSIGNMENTS
    );

    const progressTest = filteredItems.filter(
      (item: any) => item.category === COMPONENTS_GRADEBOOK.PROGRESS_TESTS
    );

    const moversExam = filteredItems.filter(
      (item: any) => item.category === COMPONENTS_GRADEBOOK.MOVERS_EXAM
    );

    return {
      assignments,
      progressTest,
      moversExam,
    } as ComponentsGradebook;
  }, [filteredItems]);
};

export default useFilteredGradingItems;
