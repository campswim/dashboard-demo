import React, { useState, useEffect, useRef } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { getAllFailedPayments } from '../../hooks/get-payments';
import FailedPayment from './failed-payment';

const FailedPayments = () => {
  const [failedPayments, setFailedPayments] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [loggedIn, setloggedIn] = useState(localStorage.getItem('loggedIn') ? parseInt(localStorage.getItem('loggedIn')) : 0);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const [currentTab, setCurrentTab] = useState(null);
  const restrictedActions = useRef(loggedInUser?.restrictions?.actions);

  // Get the state values passed on the user's clicking of a redirect link.
  const params = useLocation();
  const state = params?.state;
  const { type, action, orderNum } = state ? state : '';

  // Handle the user choosing another tab on this page.
  const handleClick = (callerId) => {
    if (callerId === currentTab) {
      setCurrentTab(null);
      // setIsLoaded(false);
    } else setCurrentTab(callerId);
  };

  const reload = (tab) => {
    setCurrentTab(null);
    setCurrentTab(tab);
  };

  // Get the failed payments from the DB.
  useEffect(() => {
    let mounted = true;
    if (mounted) {      
      getAllFailedPayments().then(
        res => {          
          if (res?.errors) {
            const errors = Object.values(res.errors);
            errors.forEach(error => setError(`${error}\n`));
          } else {            
            setFailedPayments(res);
            setError(null);
            setIsLoaded(true);
          }
        },
        err => {
          setError(`Error: ${err.message}`);
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
    loggedInUser && (loggedInUser.restrictions.pages === 'None' || !loggedInUser.restrictions.pages.includes('Failed Payments')) ?
    (
      <FailedPayment
        payments={failedPayments}
        error={error}
        isLoaded={isLoaded}
        handleClick={handleClick}
        activeTab={currentTab ? currentTab : type ? type : null} 
        restrictedActions={restrictedActions.current}
        order={orderNum}
        action={action}
        reload={reload}
      />
    )
    :
    (
      <div className="role-denied">Your profile's assigned role of "{loggedInUser.role}" does not allow you to access this page.</div>
    )
  )
};

export default FailedPayments;
