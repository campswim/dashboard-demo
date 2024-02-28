import React, { useState, useEffect } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
// import PushedOrders from './pushed/pushed-orders';
import StagedOrders from './staged/staged-orders';
import FailedProcessesSummary from './failed-processes/failed-processes';
import FailedPaymentsSummary from './failed-payments/failed-payments';
// import BcMissingItems from './missing/bc-missing-items';

const Home = () => {
  const [user, setUser] = useState({});
  const [loggedIn, setloggedIn] = useState(localStorage.getItem('loggedIn') && localStorage.getItem('loggedIn') !== 'null' ? parseInt(localStorage.getItem('loggedIn')) : 0);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const params = useLocation();
  const userFromState = params?.state?.user;
  
  const deleteUser = () => {    
    localStorage.setItem('loggedIn', 0);
    localStorage.setItem('user', null);
  };

  // Set the userFromState and loggedIn and loggedInUser variables.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setloggedIn(localStorage.getItem('loggedIn') && localStorage.getItem('loggedIn') !== 'null' ? parseInt(localStorage.getItem('loggedIn')) : 0);
      setLoggedInUser(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
      if (userFromState?.action !== user?.action) setUser(userFromState);
    }
    return () => mounted = false;
  }, [user?.action, userFromState]);
  
  return loggedIn && loggedInUser ?
  (
    loggedInUser && (loggedInUser?.restrictions?.pages === 'None' || !loggedInUser?.restrictions?.pages.includes('Dashboard')) ?
    (
      <div className='dashboard-container'>
        <h3 className='welcome-user'>{`${loggedInUser.name ? `Welcome, ${loggedInUser.name}` : ''}`}</h3>
        {/* <PushedOrders /> */}
        <StagedOrders loggedIn={loggedIn} deleteUser={deleteUser}/>
        <FailedProcessesSummary />
        <FailedPaymentsSummary />
        {/* <BcMissingItems /> */}
      </div>
    )
    :
    (
      <div className="role-denied">Your profile's assigned role of "{loggedInUser.role}" does not allow you to access this page.</div>
    )
  )
  : 
  (
    // <div className="signin-error">{user?.name ? `${user.name}, you're not logged in; please try signing in again.` : 'You must sign in to access this resource.'}</div>
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
}

export default Home;
