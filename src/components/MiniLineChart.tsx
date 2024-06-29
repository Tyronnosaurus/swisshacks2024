"use client"

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { ChartData, ChartOptions } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const MiniLineChart: React.FC = () => {
  // Dummy data for the last 3 years for two companies
  const data: ChartData<'line'> = {
    labels: [
      'Jan 2021', 'Feb 2021', 'Mar 2021', 'Apr 2021', 'May 2021', 'Jun 2021',
      'Jul 2021', 'Aug 2021', 'Sep 2021', 'Oct 2021', 'Nov 2021', 'Dec 2021',
      'Jan 2022', 'Feb 2022', 'Mar 2022', 'Apr 2022', 'May 2022', 'Jun 2022',
      'Jul 2022', 'Aug 2022', 'Sep 2022', 'Oct 2022', 'Nov 2022', 'Dec 2022',
      'Jan 2023', 'Feb 2023', 'Mar 2023', 'Apr 2023', 'May 2023', 'Jun 2023',
      'Jul 2023', 'Aug 2023', 'Sep 2023', 'Oct 2023', 'Nov 2023', 'Dec 2023'
    ],
    datasets: [
      {
        label: 'UBS',
        data: [
          1200, 1500, 1800, 2000, 2500, 2100, 2300, 2400, 2800, 2900, 3000, 3200,
          2000, 1600, 1900, 2300, 2600, 2000, 2400, 2700, 2900, 3000, 3100, 3300,
          1900, 1700, 2000, 2400, 2700, 2300, 2500, 2800, 3000, 3100, 3200, 3400
        ],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
      {
        label: 'Siemens',
        data: [
          1000, 1300, 1700, 2000, 2300, 2000, 2100, 2500, 2700, 2800, 2900, 3100,
          1300, 1500, 1800, 2200, 2500, 2100, 2200, 2600, 2400, 2900, 3000, 3200,
          1500, 1600, 1900, 2300, 2600, 2200, 2300, 2700, 2900, 3000, 3100, 3300
        ],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true,
      },
    ],
  };


  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Net Sales Evolution Over the Last 3 Years',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default MiniLineChart;
