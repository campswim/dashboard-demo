import React, { useState, useEffect, useRef } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import apiCall from '../../hooks/api-call';
import Unprocessed from './unprocessed';

const FailedProcesses = () => {
  const [failedProcesses, setFailedProcesses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [loggedIn, setloggedIn] = useState(localStorage.getItem('loggedIn') ? parseInt(localStorage.getItem('loggedIn')) : 0);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const [currentTab, setCurrentTab] = useState(null);
  const restrictedActions = useRef(loggedInUser?.restrictions?.actions);

  // Get the state values passed on the user's clicking of a redirect link.
  const params = useLocation();
  const state = params?.state;
  let job, action, orderNum;  
  if (state) ({ job, action, orderNum } = state);

  // Handle the user choosing another tab on this page.
  const handleClick = (callerId) => {
    if (callerId === currentTab) {
      setCurrentTab(null);
      // setIsLoaded(false);
    } else setCurrentTab(callerId);
  }

  // Get the unprocessed jobs from the DB.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const operation = 'getAllProcessingErrors';
      const query = `query ${operation} {${operation} {Id Name OrderNumber LineNumber Category ExternalSystem DataDirection At Message Exception AdditionalData DismissedAt DismissedBy}}`;
      const variables = {};
      
      apiCall(operation, query, variables)
      .then(
        res => {
          if (res.data) {
            setFailedProcesses(res.data.getAllProcessingErrors);
            setError(null);
            setIsLoaded(true);
          } else if (res.name) {
            setError({code: res.name, message: res.message});
            setIsLoaded(true);
          }
        },
        err => {
          setError(err.response.data.errors);
          setIsLoaded(false);
        }
      );
    }
    
    return () => mounted = false;
  }, [currentTab]);

  // Set the loggedIn variable.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setloggedIn(localStorage.getItem('loggedIn') ? parseInt(localStorage.getItem('loggedIn')) : 0);
      setLoggedInUser(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
    }
    return () => mounted = false;
  }, []);
  
  return !loggedIn ?
  (
    // <div className="signin-error">You must sign in to access this resource.</div>
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
    <div className="signin-error">{error?.message}</div>
  )
  :
  (
    loggedInUser && (loggedInUser.restrictions.pages === 'None' || !loggedInUser.restrictions.pages.includes('Failed Processes')) ?
    (
      <Unprocessed 
        jobs={failedProcesses} 
        error={error} 
        isLoaded={isLoaded} 
        handleClick={handleClick} 
        activeTab={currentTab ? currentTab : job ? job : null} 
        restrictedActions={restrictedActions.current} 
        order={orderNum} 
        action={action} 
      />
    )
    :
    (
      <div className="role-denied">Your profile's assigned role of "{loggedInUser.role}" does not allow you to access this page.</div>
    )
  )
};

export default FailedProcesses;
