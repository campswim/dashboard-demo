import React, { useState, useEffect } from 'react';
import { getAllFailedPaymentsSummary } from '../../../hooks/get-dashboard';
import FailedPayments from './failed-payment';

const FailedPaymentsSummary = () => {
  const [failedPayments, setFailedPayments] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  // Get the data from the db.
  useEffect(() => {
    getAllFailedPaymentsSummary().then(
      res => {        
        if (res?.errors) {
          const errors = Object.values(res.errors);
          errors.forEach(error => setError(`${error}\n`));
        } else {
          setFailedPayments(res);
          setIsLoaded(true);
        }
      },
      err => {
        setError(`Error: ${err.message}`);
        setIsLoaded(false);
      }
    );
  }, []);
  
  return error ? 
  (
    <div className="signin-error">{error?.message}</div>
  )
  :
  (
    <>
      <h3 className='section-title'>Failed Payments</h3>
      <FailedPayments data={failedPayments} isLoaded={isLoaded} error={error} />
    </>
  )
};

export default FailedPaymentsSummary;
