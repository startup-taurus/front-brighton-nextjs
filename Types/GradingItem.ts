export interface ComponentsGradebook {
  assignments: GradingItem[];
  progressTest: GradingItem[];
  moversExam: GradingItem[];
}

export interface GradingItem {
  item_id: number;
  item_name: string;
  category: string;
  weight: string;
}

export interface GradingPercentage {
  id: number;
  syllabus_id: number;
  assig_percentage: string;
  test_percentage: string;
  exam_percentage: string;
}
