import React, { useState, useEffect } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
// import PushedOrders from './pushed/pushed-orders';
import StagedOrders from './staged/staged-orders';
import FailedProcessesSummary from './failed-processes/failed-processes';
import UnpushedPaymentsSummary from './failed-payments/unpushed-payments';
import FailedPaymentsSummary from './failed-payments/failed-payments';
import OrdersByMonthSummary from './orders-by-month/orders-by-month';
// import BcMissingItems from './missing/bc-missing-items';

const Home = (props) => {
  const [user, setUser] = useState({});
  const [loggedIn, setLoggedIn] = useState(props.loggedIn);
  // const [loggedIn, setLoggedIn] = useState(localStorage.getItem('loggedIn') && localStorage.getItem('loggedIn') !== 'null' ? parseInt(localStorage.getItem('loggedIn')) : 0);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const params = useLocation();
  const userFromState = params?.state?.user;

  // Remove the user from local storage.
  const deleteUser = () => {
    localStorage.setItem('loggedIn', 0);
    localStorage.setItem('user', null);
  };

  // Set the userFromState and loggedIn and loggedInUser variables.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setLoggedIn(localStorage.getItem('loggedIn') && localStorage.getItem('loggedIn') !== 'null' ? parseInt(localStorage.getItem('loggedIn')) : 0);
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
        <div className='unpushed-payments-summary-container'>
          <UnpushedPaymentsSummary />
          <FailedPaymentsSummary />
        </div>
        <OrdersByMonthSummary />
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
