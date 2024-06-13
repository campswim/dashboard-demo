import React, { useState, useEffect } from 'react';
import { getAllUnpushedPayments } from '../../../hooks/get-dashboard';
import UnpushedPayments from './unpushed-payment';

const UnpushedPaymentsSummary = props => {
  const [unpushedPayments, setUnpushedPayments] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Query the db for all unpushed payments.
  useEffect(() => {
    getAllUnpushedPayments().then(
      res => {
        if (res?.errors) {
          const errors = Object.values(res.errors);
          errors.forEach(error => setError(`${error}\n`));
        } else {
          setUnpushedPayments(res);
          setIsLoaded(true);
        }
      },
      err => {
        setError(`Error: ${err.message}`);
        setIsLoaded(false);
      }
    )
  }, []);

  return error ? 
  (
    <div className="signin-error">{error}</div>
  )
  :
  (
    <div id='unpushed-payments-section'>
      <h3 className='section-title'>Unpushed Payments</h3>
      <UnpushedPayments data={unpushedPayments} isLoaded={isLoaded} error={error} />
    </div>
  )
}

export default UnpushedPaymentsSummary;