import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { getErrorLogs } from '../../hooks/get-error-logs';
import ErrorLog from './error-log';
import Dropdown from '../../components/dropdown';

const ErrorLogs = () => {
  const [errorLogs, setErrorLogs] = useState([]);
  // const [filteredLogs, setFilteredLogs] = useState([]);
  const [numOfErrors, setNumOfErrors] = useState(100);
  // const [levels, setLevels] = useState([]);
  const [level, setLevel] = useState(null);
  const [selectedNumErrors, setSelectedNumErrors] = useState('');
  const [selectedErrorLevel, setSelectedErrorLevel] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [loggedIn, setloggedIn] = useState(localStorage.getItem('loggedIn') ? parseInt(localStorage.getItem('loggedIn')) : 0);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  // const restrictedActions = useRef(loggedInUser?.restrictions?.actions);

  // Handle the user choosing a different number of errors to view or to filter by the levels column.
  const handleChange = (val, path, selectedOption) => {
    if (path === 'num-of-errors') { 
      setNumOfErrors(val);
      setSelectedNumErrors(selectedOption);
    } else if (path === 'filter-by-level') {
      setLevel(val === 'All' ? null : val);
      setSelectedErrorLevel(selectedOption);
    }
  }
    
  // Get data from the DB.
  useEffect(() => {
    setIsLoaded(false); // Shows "loading..." when the db is slow or times out, a frequent occurrence for this query, because the error-logs table is huge.
    getErrorLogs(numOfErrors, level).then(
      res => {        
        if (res.data) {
          const data = res?.data?.getErrorLogs;
          const errors = res?.errors;

          if (errors) errors.forEach(error => setError(`Error | ${error.message}\n`));
          else {
            setErrorLogs(data);
            // setLevels([...new Set(data.filter(datum => datum.Level).map(value => value.Level))]);
            setError(null);
            setIsLoaded(true);
          }
        } else if (res.name) {
          setError({code: res.name, message: res.message});
        }
      },
      err => {
        setError(err.response.data.errors);
        setIsLoaded(false);
      }
    );
  }, [numOfErrors, level]);

  // Set the loggedIn variable.
  useEffect(() => {
    setloggedIn(localStorage.getItem('loggedIn') ? parseInt(localStorage.getItem('loggedIn')) : 0);
    setLoggedInUser(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  }, []);
  
  // useEffect(() => {
  //   if (level !== 'All') {
  //     setFilteredLogs(errorLogs.filter(log => log.Level === level));
  //   } else {
  //     setFilteredLogs([]);
  //   }

  // }, [level, errorLogs, numOfErrors]);

  return !loggedIn ?
  (
    <Redirect to={
        {
          pathname: '/login',
          state: {
            action: 'Sign In',
            message: 'Please sign in.'
          },
        }
      }
    />
  )
  : error ?
  (
    <div className="signin-error">{error?.message ? error.message : `${error.trim()}. Please refresh the browser and try your request again.`}</div>
  )
  : isLoaded ?
  (
    loggedInUser && (loggedInUser.restrictions.pages === 'None' || !loggedInUser.restrictions.pages.includes('Error Logs')) ?
    (
      <ErrorLog 
        // data={filteredLogs.length ? filteredLogs : errorLogs}
        data={errorLogs}
        error={error} 
        isLoaded={isLoaded}
        // restrictedActions={restrictedActions.current} 
        // level={level}
      >
        <div className='dropdown-wrapper'>
          <Dropdown path='filter-level' handleChange={handleChange} selectedOption={selectedErrorLevel} />
          <Dropdown path='filter-num-errors' numsBack={numOfErrors} handleChange={handleChange} selectedOption={selectedNumErrors} />
        </div>
      </ErrorLog>
    )
    :
    (
      <div className="role-denied">Your profile's assigned role of "{loggedInUser.role}" does not allow you to access this page.</div>
    )
  )
  :
  (
    <div className="loading">Loading . . . </div>
  )
};

export default ErrorLogs;
