import React, { useState, useEffect } from 'react';
import Staged from './staged';
import { getUnpushedOrders } from '../../../hooks/get-order';

const StagedOrders = props => {
  const [unpushed, setUnpushed] = useState(null);
  const [unpushedError, setUnpushedError] = useState(null);
  const [unpushedIsLoaded, setUnpushedIsLoaded] = useState(false);
  const [failedPushes, setFailedPushes] = useState(null);
  const [failedPushesError, setFailedPushesError] = useState(null);
  const [failedPushesIsLoaded, setFailedPushesIsLoaded] = useState(false);
  const [ignored, setIgnored] = useState(null);
  const [ignoredError, setIgnoredError] = useState(null);
  const [ignoredIsLoaded, setIgnoredIsLoaded] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Get the unpushed orders from the DB.
  useEffect(() => {    
    let mounted = true;
    if (mounted) {
      getUnpushedOrders('unpushed').then(
        res => {          
          const results = res?.data?.unpushed;
          const errors = res?.errors;
                    
          if (results) {
            const error = results[0]?.Error;
            
            if (error) {
              console.error({error});
              setApiError(error);
            } else {
              let unpushedArray = [], failedPushArray = [], ignoredOrdersArray = [], toReturn = [];
              // let unpushedObject = {}, failedPushObject = {}, ignoredOrdersObject = {};
              
              if (results) {
                results.forEach(order => {
                  if (order.Type === 'Unpushed') unpushedArray.push(order);
                  else if (order.Type === 'Push Failed') failedPushArray.push(order);
                  else if (order.Type === 'Ignored') ignoredOrdersArray.push(order);
                });
              }
              
              // Set the unpushed orders.
              if (unpushedArray) {
                unpushedArray.forEach(val => {
                  toReturn.push({market: val.Market, orderCount: val.Count, totalAmount: val.OrderTotalAmount });
                });

                setUnpushed(toReturn);
                setUnpushedError(null);
                toReturn = [];
                setUnpushedIsLoaded(true);
              }

              // if (unpushedArray) {
              //   unpushedArray.forEach(order => {        
              //     if (!unpushedObject[order.Market]) unpushedObject[order.Market] = { orderCount: 1, totalAmount: order.OrderTotalAmount };
              //     else {
              //       const count = unpushedObject[order.Market].orderCount;
              //       const total = unpushedObject[order.Market].totalAmount;
              //       unpushedObject[order.Market] = { orderCount: count + 1, totalAmount: total + order.OrderTotalAmount };
              //     }
              //   });
              //   Object.keys(unpushedObject).forEach(key => toReturn.push({market: key, orderCount: unpushedObject[key].orderCount, totalAmount: unpushedObject[key].totalAmount}));
              //   setUnpushed(toReturn);
              //   setUnpushedError(null);
              //   toReturn = [];
              //   setUnpushedIsLoaded(true);
              // }
              
              // Set the failed-push orders.
              if (failedPushArray) {
                failedPushArray.forEach(val => {
                  toReturn.push({market: val.Market, orderCount: val.Count, totalAmount: val.OrderTotalAmount });
                });

                setFailedPushes(toReturn);
                setFailedPushesError(null);
                toReturn = [];
                setFailedPushesIsLoaded(true);
              }
              
              // Set the ingored orders.
              if (ignoredOrdersArray) {
                ignoredOrdersArray.forEach(val => {
                  toReturn.push({market: val.Market, orderCount: val.Count, totalAmount: val.OrderTotalAmount });
                });
                setIgnored(toReturn);
                setIgnoredError(null);
                toReturn = [];
                setIgnoredIsLoaded(true);
              }
            }
          } else if (res.name) {
            setApiError(res.message);

            // If the token has expired or for whatever reason no longer exists, delete the user in storage and redirect to the sign-in page.
            if (res.message === 'You must sign in to access this resource.' && props.loggedIn) props.deleteUser();
          } else if (errors) {
            if (Array.isArray(res.errors)) {
              res.errors.forEach(error => setApiError(`${error.message}\n`));
            } else console.error(res.error);
          }
        },
        err => { 
          setApiError(err);
          setUnpushedIsLoaded(false);
          setFailedPushesIsLoaded(false);
          setIgnoredIsLoaded(false);
        }
      );
    }
    return () => mounted = false;
  }, [props]);
  
  return apiError ? 
    (
      <div className="signin-error">{apiError}</div> 
    )
    :
    (  
      <>
        <h3 className='section-title'>Staged Orders</h3>
        <div className='dash-staged'>
          <Staged data={unpushed} error={unpushedError} isLoaded={unpushedIsLoaded} subheader='Unpushed' />
          <Staged data={failedPushes} error={failedPushesError} isLoaded={failedPushesIsLoaded} subheader='Failed Pushes' />
          <Staged data={ignored} error={ignoredError} isLoaded={ignoredIsLoaded} subheader='Ignored Pushes' />
        </div>
        <p style={{textIndent:'1rem', fontSize:'1rem'}}>*Reflects the last 30 days only.</p>
      </>
    )
};

export default StagedOrders;
