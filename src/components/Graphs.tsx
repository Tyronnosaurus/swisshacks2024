"use client";

import React from 'react';
import { Bar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartData, ChartOptions } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const Graphs: React.FC = () => {
  // Dummy data for the last 3 years for two companies
  const barData: ChartData<'bar'> = {
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
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Siemens',
        data: [
          1000, 1300, 1700, 2000, 2300, 2000, 2100, 2500, 2700, 2800, 2900, 3100,
          1300, 1500, 1800, 2200, 2500, 2100, 2200, 2600, 2400, 2900, 3000, 3200,
          1500, 1600, 1900, 2300, 2600, 2200, 2300, 2700, 2900, 3000, 3100, 3300
        ],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Net Sales Evolution Over the Last 3 Years (Bar Chart)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const polarData: ChartData<'polarArea'> = {
    labels: ['UBS', 'Siemens', 'Other'],
    datasets: [
      {
        label: 'Sales Distribution',
        data: [3000, 4000, 2000],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const polarOptions: ChartOptions<'polarArea'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Distribution Over the Last 3 Years (Polar Area Chart)',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mt-4 mb-2">Net Sales Evolution</h1>
      <Bar data={barData} options={barOptions} />
      <h1 className="text-3xl font-bold mt-10 mb-2">Sales Distribution</h1>
      <PolarArea data={polarData} options={polarOptions} />
    </div>
  );
};

export default Graphs;
