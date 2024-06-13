import React, { useState, useEffect } from 'react';
import { getAllFailedProcesses } from '../../../hooks/get-dashboard';
import FailedJobs from './failed-jobs';

const FailedProcesses = () => {
  const [failedProcesses, setFailedProcesses] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  // Get the data from the db.
  useEffect(() => {
    getAllFailedProcesses().then(
      res => {
        if (res?.errors) {
          const errors = Object.values(res.errors);
          errors.forEach(error => setError(`${error}\n`));
        } else {
          setFailedProcesses(res);
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
      <h3 className='section-title'>Failed Processes</h3>
      <FailedJobs data={failedProcesses} isLoaded={isLoaded} error={error} />
    </>
  )
};

export default FailedProcesses;
