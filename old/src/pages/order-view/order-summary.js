import React, { useState, useEffect } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { getOrderDetails } from '../../hooks/get-order';
import OrderDetails from './order-details';

const OrderView = props => {  
  const [orderNumberDisplay, setOrderNumberDisplay] = useState('');
  const [newOrderNum, setNewOrderNum] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [loggedIn, setloggedIn] = useState(localStorage.getItem('loggedIn') ? parseInt(localStorage.getItem('loggedIn')) : 0);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  const params = useLocation();
    
  // Populate the input field with the user's input.
  const handleChange = e => {
    if (!e) return;
    const orderNumber = e?.target?.value;

    setOrderNumberDisplay(orderNumber);
  }

  // Put user's input into a state variable.
  const handleSubmit = e => {
    if (!e) return;
    e.preventDefault();
    const submittedId = e?.target[0]?.value;
   
    if (submittedId) {
      setOrderId(submittedId);
      props.getId(null);
      setNewOrderNum(false);
    }
  }

  // Set the order ID's state variable via click from the failed-orders page: not in use, because if an order failed to pull, it's not in the orders DB and if it failed to push, it's not in BC.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const orderNum = params?.state?.order;

      if (orderNum && orderNum !== orderId) {
        props.getId(orderNum);
        setOrderId(orderNum);
      }
    }
    return () => mounted = false;
  }, [orderId, params.state, props]);
  
  // Get the order's details.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (orderId) {
        getOrderDetails(orderId).then(
          res => {            
            const orderObject = res?.data?.orderDetails;

            if (orderObject) {
              if (!orderObject.Error) {
                delete orderObject.Error;
                setOrder(orderObject);
                setError('');
              } else {
                setError(orderObject.Error);
              }
              setIsLoaded(true);
              setNewOrderNum(false);
            } else {
              setIsLoaded(false);
            }
          },
          err => {
            setError(err);
          }
        )
      }
    }
    return () => mounted = false;
  }, [orderId]);

  // Set the order ID from props when it hasn't been manually added, in order to persist the data across user-initiated page changes.
  useEffect(() => {
    let mounted = true;
    if (mounted) 
      if (!orderId && props.orderId) 
        setOrderId(props.orderId);
    return () => mounted = false;
  }, [orderId, props.orderId]);
  
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
  : 
  (
    loggedInUser && (loggedInUser.restrictions.pages === 'None' || !loggedInUser.restrictions.pages.includes('Failed Payments')) ?
    (
      error ?
      (
        <>
          <div className="no-order-error">{error} Please try again.</div>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Order Number" value={orderNumberDisplay} onChange={handleChange} />
            <button>Go</button>
          </form>
        </>
      )
      : orderId && !newOrderNum ?
      (
        !isLoaded ? 
        (
          <div className="loading">Loading . . .</div> 
        )
        :
        (
          <div className="order-view-parent">
            <div className='new-number'>
              <button onClick={() => setNewOrderNum(true)}>Submit a Different Number</button>
            </div>
            <OrderDetails
              order={order}
              orderId={orderId}
              getId={props.getId}
            />
          </div>
        )
      ) 
      :
      (
        <form onSubmit={handleSubmit}>
          <p className='order-id'>Enter an order number.</p>
          <input type="text" placeholder="Order Number" value={orderNumberDisplay} onChange={handleChange} />
          <button>Go</button>
        </form>
      )
    )
    :
    (
      <div className="role-denied">Your profile's assigned role of "{loggedInUser.role}" does not allow you to access this page.</div>
    )
  )
};

export default OrderView;
