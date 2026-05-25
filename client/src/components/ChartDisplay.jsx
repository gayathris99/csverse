import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const chartColors = {
  backgrounds: [
    'rgba(127, 119, 221, 0.8)',
    'rgba(29, 158, 117, 0.8)',
    'rgba(216, 90, 48, 0.8)',
    'rgba(212, 83, 126, 0.8)',
    'rgba(99, 153, 34, 0.8)',
    'rgba(186, 117, 23, 0.8)',
  ],
  borders: [
    '#7F77DD',
    '#1D9E75',
    '#D85A30',
    '#D4537E',
    '#639922',
    '#BA7517',
  ]
}

const defaultOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: '#9ca3af',
        font: { size: 12 }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#9ca3af', font: { size: 11 } },
      grid: { color: '#2a2a3e' }
    },
    y: {
      ticks: { color: '#9ca3af', font: { size: 11 } },
      grid: { color: '#2a2a3e' }
    }
  }
}

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#9ca3af',
        font: { size: 12 },
        padding: 16
      }
    }
  }
}

export default function ChartDisplay({ chartType, chartData }) {
  if (!chartData) return null

  const coloredData = {
    ...chartData,
    datasets: chartData.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: chartColors.backgrounds,
      borderColor: chartColors.borders,
      borderWidth: 2,
      borderRadius: chartType === 'bar' ? 6 : 0,
    }))
  }

  if (chartType === 'bar') {
    return <Bar data={coloredData} options={defaultOptions} />
  }
  if (chartType === 'line') {
    return <Line data={coloredData} options={defaultOptions} />
  }
  if (chartType === 'pie') {
    return <Pie data={coloredData} options={pieOptions} />
  }

  return null
}