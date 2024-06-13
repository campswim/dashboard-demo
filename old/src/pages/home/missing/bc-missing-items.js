import React, { useState, useEffect, useRef } from 'react';
import { getAllActiveItems, getAllErpItems } from '../../../hooks/get-dashboard';
import Missing from './missing';

const BcMissingItems = () => {
  const [daysBack, setDaysBack] = useState(0);
  const [missing, setMissing] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [render, setRender] = useState(false);
  const markets = useRef(['US', 'PH', 'CA']);

  const handleSubmit = event => {
    event.preventDefault();

    const daysBackInt = !isNaN(parseInt(daysBack)) ? parseInt(daysBack) : '';

    if (daysBackInt && daysBack > 0) {
      setRender(true);
      setError(null);
      document.getElementById('get-missing-bc-items').setAttribute('hidden', true);
    } else setError('You must enter a positive whole number.');
  };

  // Retrieve the items missing from BC.
  useEffect(() => {    
    let mounted = true;

    if (mounted && render) {
      // Get all items from the CRM.
      getAllActiveItems(daysBack, markets.current).then( // args => days back, country.
        res => {
          const allItems = res?.data?.getAllActiveItems;
          const allItemsCount = allItems && Array.isArray(allItems) ? allItems.length : 0;
          
          if (allItems && allItems.length > 0) {
            const environment = null; // => 'Production'

            getAllErpItems(allItems, markets.current, environment).then(
              res => {                
                const erpItems = res?.data?.getAllErpItems;
                const erpItemsCount = erpItems ? erpItems.length : 0;
                let error;
                if (erpItemsCount === 1) error = erpItems[0]?.Error;
                if (error) {
                  setError(error);
                  setIsLoaded(true);
                } else {
                  let allItemsByMarket = {}, erpItemsByMarket = {}, theMissing = {};

                  markets.current.forEach(market => {
                    allItemsByMarket[market] = [];
                    erpItemsByMarket[market] = [];
                    theMissing[market] = [];
                  });
  
                  allItems.forEach(item => allItemsByMarket[item.Country].push(item.ItemCode.toUpperCase()));
    
                  if (erpItemsCount && erpItemsCount !== allItemsCount) {                  
                    erpItems.forEach(item => erpItemsByMarket[item.Country].push(item.ItemCode.toUpperCase()));
                    markets.current.forEach(market => theMissing[market] = allItemsByMarket[market].filter(item => !erpItemsByMarket[market].includes(item)));
                  }
    
                  if (theMissing) {
                    setMissing(theMissing);
                    setIsLoaded(true);
                  }
                }

              },
              err => {
                console.error(err);
                setError(err);
              }
            );
          }
        },
        err => {
          console.error(err);
        }
      );
    }

    return () => mounted = false;
  }, [daysBack, render]);
    
  return (
    <div className="missing-items-container">
      <h3 className='section-title'>CRM Items Missing in the ERP</h3>
      {isLoaded && missing ?
      (
        <>
          <p className='days-back'>Days Back: {daysBack}</p>
          <div className="missing-items-cards">
            {markets.current.map((market, key) => (
              <div key={key} className="missing-items-card">
                <Missing market={market} count={!error && missing && missing[market].length > 0 ? missing[market].length: 0} data={missing[market]} error={error} />
              </div>
            ))}
          </div>
        </>
      ) 
      : render && !isLoaded ? 
      (
        <div className="loading">Loading . . .</div> 
      ) 
      : isLoaded && !missing ?
      (
        null
      )
      :
      (
        <>
          <form className="get-missing-bc-items" id="get-missing-bc-items" onSubmit={(e) => handleSubmit(e)}>
            {/* <p>To see a list of items missing in Business Central, indicate the number of days back you'd like to pull item numbers from Exigo and click "Submit."</p> */}
            <input type='text' id="days-back" placeholder="Number of Days Back" onChange={(e) => setDaysBack(e.target.value)} />
            <button className="inactive-button" type="submit">Submit</button>
          </form>
          {error ? <p className="error">{error}</p> : null}
        </>
      )}
    </div>
)};

export default BcMissingItems;
