import React, { useState, useEffect } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { getOrderDetails, getCrmOrderDetails, getPushStatusById } from '../../hooks/get-order';
import { checkDbConnection } from './../../hooks/get-dashboard';
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
  const [connected, setConnected] = useState(false);
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
      
      if (submittedId !== orderId) setOrder({});
    }
  }

  // Set the order ID's state variable via click from the failed-orders page.
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
  
  // Get the order's details from the db.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (orderId) {
        getOrderDetails(orderId).then(
          res => {

            console.log({res});
            
            const orderObject = res?.data?.orderDetails;
            
            if (orderObject) {
              if (!orderObject?.Error) {
                const pushStatusId = orderObject?.PushStatusId;
                
                // Get the order's push status.
                if (pushStatusId) {
                  getPushStatusById(pushStatusId).then(
                    res => {

                      console.log({res});

                      const pushStatus = res?.data?.getPushStatusById?.Name;

                      if (pushStatus) orderObject.PushStatus = pushStatus;

                      setOrder(orderObject);
                      setError('');
                    }, 
                    err => {}
                  )
                } else {
                  setOrder(orderObject);
                  setError('');
                }
              } else {
                setError(orderObject?.Error);
              }

              setIsLoaded(true);
              setNewOrderNum(false);
            } else { // The order hasn't been staged, so check if it's stuck in the CRM for some reason.              
              getCrmOrderDetails(orderId).then(
                res => {                  
                  const orderObject = res?.data?.getCrmOrderDetails;

                  if (orderObject) { // The order exists in the CRM but failed the attempt to pull it into staging.
                    setOrder(orderObject);
                  } else { // The order doesn't exist.
                    setError('This order number doesn\'t exist; please check it for accuracy or enter a different number.');
                  }
                },
                err => {
                  console.error(err);
                  setError(err);
                }
              );
              
              setIsLoaded(true);
              setNewOrderNum(false);
            }
          },
          err => setError(err)
        )
      } else { // Check whether the API is up or not.
        checkDbConnection().then(
          res => {            
            const connected = res?.data?.checkDbConnection;
            
            if (connected) {              
              setConnected(connected.Connected);
              setError('');
            }
          },
          err => {
            console.error(err);
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
        setOrderNumberDisplay(orderId);
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
  : connected ?
  (
    loggedInUser && (loggedInUser.restrictions.pages === 'None' || !loggedInUser.restrictions.pages.includes('Order Summary')) ?
    (
      error ?
      (
        <>
          <div className="no-order-error">{error}</div>
          <form onSubmit={handleSubmit}>
            <input 
              className='order-detail-input'
              type="text" 
              placeholder="Order Number" 
              value={orderNumberDisplay ? orderNumberDisplay : ''} 
              onChange={handleChange} 
            />
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
          {/* <p className='order-id'>To see the details of an order that has made it through staging, enter its number.</p> */}
          <input 
            className='order-detail-input'
            type="text" 
            placeholder="Order Number" 
            value={orderNumberDisplay ? orderNumberDisplay : ''} 
            onChange={handleChange} 
          />
          <button>Go</button>
        </form>
      )
    )
    :
    (
      <div className="role-denied">Your profile's assigned role of "{loggedInUser.role}" does not allow you to access this page.</div>
    )
  )
  :
  (
    null
  )
};

export default OrderView;
