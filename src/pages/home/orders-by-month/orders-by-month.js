import React, { useState, useEffect } from 'react';
import { getOrderSummaryByMonth } from '../../../hooks/get-dashboard';
import OrdersByMonth from './orders-by-month-component';
import Dropdown from '../../../components/dropdown';

const OrdersByMonthSummary = () => {
  const [ordersByMonth, setOrdersByMonth] = useState([]);
  const [monthsBack, setMonthsBack] = useState(4);
  const [selectedOption, setSelectedOption] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Handle the selection of the dropdown.
  const handleChange = (num, _, label) => {
    setMonthsBack(num);
    setSelectedOption(label);
  }
  
  // Get the data from the db.
  useEffect(() => {
    setIsLoaded(false);
    getOrderSummaryByMonth(monthsBack).then(
      res => {
        const data = res?.data?.getOrderSummaryByMonth;
        const errors = res?.errors;

        if (errors) errors.forEach(error => setError(`Error: ${error.message}\n`));
        else {
          if (res?.name && res?.message) setError(`${res.name}: ${res.message}`);
          else {
            setOrdersByMonth(data);
            setIsLoaded(true);
            setError(null);
          }
        }
      },
      err => {
        setError(`Error: ${err.message}`);
      }
    );
  }, [monthsBack]);

  return error ?
  (
    <div className='orders-by-month'>
      <div className="section-header">
        <h3 className='section-title'>Orders by Month</h3>
        <div className="signin-error">{error}</div>
      </div>
    </div>
  )
  : !isLoaded ? 
  (
    <div className='orders-by-month'>
      <div className="section-header">
        <h3 className='section-title'>Orders by Month</h3>
      </div>
      <div className="loading">Loading . . . </div>
    </div>
  )
  : !ordersByMonth.length ?
  (
    <div className='orders-by-month'>
      <div className="section-header">
        <h3 className='section-title'>Orders by Month</h3>
      </div>
      <div className="dash-failed-processes desktop">
        <table className="unprocessed-jobs-table">
          <thead>
          </thead>
          <tbody>
            <tr className='header-row'>
              <td>None</td>
            </tr>
            </tbody>
        </table>
      </div>
    </div>
  )
  :
  (
    <div className='orders-by-month'>
      <div className="section-header">
        <h3 className='section-title'>Orders by Month</h3>
        <Dropdown path='orders-by-month' numsBack={monthsBack} handleChange={handleChange} selectedOption={selectedOption} />
      </div>
      <OrdersByMonth data={ordersByMonth} />
    </div>
  );
}

export default OrdersByMonthSummary;
