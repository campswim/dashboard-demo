import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LogarithmicScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Modal from './modal';
import useSortByMonth from '../hooks/sort-data-by-month';
import insertionSort from '../hooks/insertion-sort';
import { getOrdersByMonthDay } from '../hooks/get-dashboard';

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const OrdersChart = ({ data }) => { 
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [orderCountByMonth, setOrderCountByMonth] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  
  const monthMap =  {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec'
  };

  // Prepare datasets for Chart.js.
  const dataByMonth = useSortByMonth(data);
  const monthsSorted = insertionSort(Object.keys(dataByMonth.months));
  const monthsFormatted = monthsSorted.map(month => {
    const monthTemp = month.split('-')[1];
    const yearTemp = month.split ('-')[0];
    const order = Number(monthTemp.trim());
    const dateFormatted = `${monthMap[monthTemp]} ${yearTemp}`;

    return { order, dateFormatted };

  });
  const labels = monthsSorted;
  const labelsFormatted = monthsFormatted.map(month => month.dateFormatted);
  const orderTypes = [...new Set(Object.values(dataByMonth.months).flatMap(items => Object.keys(items)))];
  const datasets = orderTypes.map(orderType => {
    return {
      label: orderType,
      data: labels.map(month => dataByMonth.months[month][orderType] || 0),
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`,
      borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
      borderWidth: 1
    };
  });

  // Handle click on the chart by determining the month clicked, getting the required data, and sending it to the modal.
  const handleClick = (_, elements) => {
    if (elements.length > 0) {
      const clickedLabelIndex = elements[0].index;
      const clickedMonth = labels[clickedLabelIndex];

      // Get the orders by day from the db.
      getOrdersByMonthDay(clickedMonth).then(
        res => {
          const data = res?.data?.getOrdersByMonthDay;
          const errors = res?.errors;

          if (errors) errors.forEach(error => setError(`Error: ${error.message}\n`));
          else {
            setOrderCountByMonth(data);
          }
        },
        err => {
          console.error({err});
        }
      )

      setSelectedMonth(clickedMonth);
      setIsModalOpen(true);
    }
  };

  const onClose = () => {
    setSelectedMonth(null);
    setIsModalOpen(false);
  };

  // Chart data.
  const chartData = {
    labels: labelsFormatted,
    datasets: datasets
  };

  // Chart options.
  const options = {
    responsive: true,
    scales: {
      y: {
        type: 'logarithmic', // Change to logarithmic scale
        position: 'left',
        min: 1,
        ticks: {
          callback: function(value) {
            return value >= 1 ? value : ''; // Only show values >= 1
          }
        }
      }
    },
    plugins: {
      datalabels: {
        display: false,
        color: 'white',
        anchor: 'end',
        align: 'end'
      }
    },
    onClick: (event, elements) => handleClick(event, elements)
  };
  
  return (
    <div className='chart-container'>
      <Bar data={chartData} options={options} />
      {!error && orderCountByMonth && selectedMonth && (
        <Modal isOpen={isModalOpen} onClose={onClose}>
          <h3>Orders by Day | {monthMap[selectedMonth.split('-')[1]]} {selectedMonth.split('-')[0]}</h3>
          <ul>
            {orderCountByMonth.map((value, key) => {
              return <li key={key}>{value.Day}: {value.OrderCount}</li>
            })}
          </ul>
        </Modal>
      )}
    </div>
  );
};

export default OrdersChart;
