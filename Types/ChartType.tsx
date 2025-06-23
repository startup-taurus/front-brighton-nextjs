
export  interface commonPropsType {
    data: any;
    title: string;
    colClass?: string;
  }

export  interface ChartDataLabelContext {
    chart: {
      data: {
        datasets: {
          label: string;
          data: number[];
        }[];
      };
    };
    dataset: {
      label: string;
      data: number[];
    };
    dataIndex: number;
    datasetIndex: number;
  }