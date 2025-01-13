import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
// import Checkbox from '../../components/checkbox';
import useSort from '../../hooks/sort-data';
import formatCurrency from '../../hooks/format-currency';
import formatHeaders from '../../hooks/format-headers';
// import { userAction } from '../../hooks/get-order';
// import getActions from '../../hooks/get-actions';
import OrderDetails from '../../components/order-details';

const UnPushed = (props) => {
  // const [allChecked, setAllChecked] = useState(false);
  // const [isChecked, setIsChecked] = useState([]);
  // const [status, setStatus] = useState(null);
  // const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [unpushed, setUnpushed] = useState([]);
  // const [activeLink, setActiveLink] = useState(false);
  // const [chars, setChars] = useState(999);
  // const [width, setWidth] = useState(window.innerWidth);
  const [orderDetails, setOrderDetails] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [vpWidth, setVpWidth] = useState(window.innerWidth);
  const showMessage = useRef(false);
  const messageRef = useRef(null);
  const clickCount = useRef(0);

  // Call the sorting hook.
  const { items, requestSort, sortConfig } = useSort(unpushed, 'unpushed');
  
  // Determine class is ascending or descending.
  const getClassNamesFor = name => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  // Format the headers.
  const headers = unpushed && unpushed.length > 0 ? formatHeaders(Object.keys(unpushed[0]), 'CurrencyCode') : '';

  // Handle the user's selected action.
  const takeAction = (path, item) => {
    // Store a flag in storage to indicate that a new action has been initiated.
    sessionStorage.setItem('action', true);

    if (path === 'showDetails') {
      setOrderDetails(item);
      setShowDetails(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } 
    // else if (isChecked.length !== 0) {
    //   if (path) {
    //     userAction('unpushed', path, isChecked)
    //     .then(
    //       res => {
    //         if (res) {
    //           setResponse(res.data[path]);
    //           setStatus(res.status);
    //           setError(null);
    //           showMessage.current = true;
    //         }
    //       },
    //       err => {
    //         if (err) {
    //           console.error(err);
    //           setError(err.message);
    //           showMessage.current = false;
    //         }
    //       }
    //     );
    //     setIsChecked([]);
    //     setAllChecked(false);
    //     props.recall('failedPushes');
    //   }
    // } else alert('Please tick an order.');
    
    // Deactivate action buttons if a user's profile has restrictions that match.
    if (props?.restrictedActions === 'All' || path.includes(props.restrictedActions.toLowerCase())) {
      setError('This feature is inaccessible for your user type');
      props.recall('failedPushes');
    }  
  };
  
  // const handleSelectAll = () => {
  //   setAllChecked(!allChecked);
  //   setIsChecked(unpushed.map(item => item.OrderNumber));
  //   if (allChecked) setIsChecked([]);
  //   sessionStorage.clear();
  // };

  // const handleSelect = event => {
  //   const { value, checked } = event.target;
  //   setIsChecked([...isChecked, value]);
  //   if (!checked) setIsChecked(isChecked.filter(item => item !== value));
  //   sessionStorage.clear();
  // };

  const clickSniffer = useCallback((event) => {
    let id;
    const errorElement = document.getElementById('show-error');
    if (errorElement && !event.target.attributes.name) {
      id = errorElement.attributes.name.nodeValue;
      errorElement.setAttribute('id', id);
    } 
    return () => document.removeEventListener("mousedown", clickSniffer);
  }, []);

  // Display a message to the user indicating which action has been taken and on what ID number.
  const message = (action) => {
    let pastTenseVerb = null;
    if (action) {
      if (action === 'Repush') pastTenseVerb = 'repushed';
      if (action === 'Ignore') pastTenseVerb = 'ignored';
      if (action === 'Delete') pastTenseVerb = 'deleted';
    }
    return pastTenseVerb;
  };

  // Close the modal on click of the X.
  const closeModal = () => {
    setShowDetails(false);
    clickCount.current = 0;
  };
  
  // Set the unpushed state variable.
  useEffect(() => {
    if (props.data) setUnpushed(props.data.unpushedNoFail);
  }, [props.data]);

  // Toggle allChecked.
  // useEffect(() => {
  //   let mounted = true;
  //   if (mounted) {
  //     if (unpushed && unpushed.length !== 0 && isChecked.length === unpushed.length) setAllChecked(true);
  //     else setAllChecked(false);
  //   }
  //   return () => mounted = false;
  // }, [isChecked, unpushed]);

  // // Show or hide optional actions.
  // useEffect(() => {
  //   let mounted = true;
  //   if (mounted) {
  //     const element = document.getElementById('retried-order-message');
  //     if (isChecked.length > 0) {
  //       const className = element ? element.getAttribute('class') : '';  
  //       if (className && !className.includes('hidden')) element.setAttribute('class', `${className}-hidden`);
  //       setActiveLink(true);
  //     } else {
  //       const className = element ? element.getAttribute('class').replace('-hidden', '') : ''; 
  //       if (className) element.setAttribute('class', className);
  //       setActiveLink(false);
  //     }
  //   }
  //   return () => mounted = false;
  // }, [isChecked]);

  // Bind the event listener.
  useEffect(() => {
    document.addEventListener("mousedown", clickSniffer);
    return () => document.removeEventListener("mousedown", clickSniffer);
  }, [clickSniffer]);

  // Hide the message of the action's result after a new tab has been chosen.
  useEffect(() => {
    if (props.click) showMessage.current = false;
  }, [props.click]);

  // Hide checkboxes if a user is not allowed any actions.
  useEffect(() => {
    if (props?.restrictedActions === 'All') { // Hide the checkboxes, so that a user can't choose any items, thereby blocking her from taking any action on the items.      
      const headerCheckbox = document.getElementsByClassName('checkbox-th');
      const rowCheckbox = document.getElementsByClassName('select-one');

      Array.from(headerCheckbox).forEach(checkbox => checkbox.classList.add('hidden-checkbox'));
      Array.from(rowCheckbox).forEach(checkbox => checkbox.classList.add('hidden-checkbox'));
    } 
  }, [props?.restrictedActions, items]);  
  
  // Update the vpWidth variable.
  useEffect(() => {
    const handleResize = () => setVpWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [vpWidth]);
  
  // // Determine the width of the browser window and set toggles accordingly.
  // useLayoutEffect(() => {
  //   const handleResize = () => setWidth(window.innerWidth);
  
  //   setChars(width < 768 ? 7 : width < 1023 ? 24 : width < 1280 ? 48 : 999);  
  //   window.addEventListener('resize', handleResize);
    
  //   return () => window.removeEventListener('resize', handleResize);  
  // }, [width]);

  // Conditionals for rendering the component.
  if (props.getQuery !== 'unpushedNoFail') return null;
  if (props.error) return <div className="signin-error">{props.error.message}</div>;
  if (!props.isLoaded) return <div className="loading">Loading . . .</div>;

  return (
    <>
      <div className='order-info'>
        {items.length > 0 ? 
        (
          <div className='order-info__stats'>
            {/* <p className='order-info__stats__paragraph'>Selected: {isChecked.length}</p> */}
            <p className='order-info__stats__paragraph'>Count: {items.length}</p>
          </div>
        )
        :
        (
          null
        )}
        {/* {activeLink ? (
          <div className='action-links'>
            <form className='link'>
              {props && props.restrictedActions ? getActions('unpushed', props.restrictedActions, isChecked, takeAction) : null}
            </form>
          </div>
        ) : status && status !== 200 && response ? (
          <div>Error: {error}</div>
        ) : (
          ''
        )} */}
        {props.callerId === 'unpushed' ? 
        (
          !error ? 
          (
            props.order ? (
              showMessage.current 
                && props.action 
                  // && !activeLink 
                    && (props.action === 'Repush' || props.action === 'Ignore' || props.action === 'Delete') ? (
                typeof props.order === 'number' || props.order.length === 1 ? (
                  <div className='order-info__retried-order-set' id='retried-order-message' ref={messageRef}>
                    <p className='order-info__retried-order-set__pagaraph'>Order {props.order} has been {message(props.action)}.</p>
                  </div>
                ) : (
                  <div className="order-info__retried-order-set" id="retried-order-message" ref={messageRef}>
                    <p className='order-info__retried-order-set__pagaraph'>
                      The following orders have been {message(props.action)}:&nbsp;
                    </p>
                    <div className='order-info__retried-order-set__orders-in-array'>
                      {props.order.map((id, key) => (
                        props.order.length === 1 ? 
                        ( 
                          <p className='order-info__retried-order-set__orders-in-array__paragraph' key={key}>
                            {id}
                          </p>
                        )
                        : key === props.order.length - 1 ?
                        (
                          <p className='order-info__retried-order-set__orders-in-array__paragraph' key={key}>
                            {id}.
                          </p>
                        )
                        :
                        (
                          <p className='order-info__retried-order-set__orders-in-array__paragraph' key={key}>
                            {id},<span>&nbsp;</span>
                          </p>
                        )                          
                      ))}
                    </div>
                  </div>
                )
              ) : (
                ''
              )
            ) : (
              ''
            )
          ) 
          : 
          (
            props.order ? (
              typeof props.order === 'number' || props.order.length === 1 ? 
              (
                <div className='order-info__retried-order-set' id='retried-order-message' ref={messageRef}>
                  <p className='order-info__retried-order-set__paragraph'>
                    The following error occurred when order {props.order} was {message(props.action)}: {error}.
                  </p>
                </div>
              ) 
              : 
              (
                  <div className='order-info__retried-order-set' id='retried-order-message' ref={messageRef}>
                    <p className='order-info__retried-order-set__paragraph'>
                      There was a "{error}" error when the following orders were {message(props.action)}:&nbsp;
                    </p>
                  <div className='order-info__retried-order-set__orders-in-array'>
                    {props.order.map((id, key) => (
                      props.order.length === 1 ? 
                      ( 
                        <p className='order-info__retried-order-set__orders-in-array__paragraph' key={key}>
                          {id}
                        </p>
                      )
                      : key === props.order.length - 1 ?
                      (
                        <p className='order-info__retried-order-set__orders-in-array__paragraph' key={key}>
                          {id}.
                        </p>
                      )
                      :
                      (
                        <p className='order-info__retried-order-set__orders-in-array__paragraph' key={key}>
                          {id},<span>&nbsp;</span>
                        </p>
                      )                          
                    ))}
                  </div>
                </div>
              )
            ) : (
              null
            )
          )
        ) : (
          null
        )}
      </div>
        
      <table className="unpushed-table">
        <thead>
          <tr className='header-row'>
            {/* {items.length !== 0 ? (
              <th className='checkbox-th'>
                <Checkbox
                  type='checkbox'
                  name='selectAll'
                  handleClick={handleSelectAll}
                  isChecked={allChecked}
                />
              </th>
            ) : (
              <th className='hidden-checkbox'></th>
            )} */}
            {headers ? 
            (
              headers.map((header, key) => {
                return vpWidth < 1280 ?
                (
                  header !== 'Market' && header !== 'Error Code' && header !== 'Staging Import Date' && header !== 'Customer Number' && header !== 'Order Type Description' ?
                  (
                    <th
                      key={key}
                      onClick={() => requestSort(header.split(' ').join(''))}
                      className={getClassNamesFor(header.split(' ').join(''))}
                    >
                      {header === 'Order Number' ? header.replace('Number', '') : header === 'Customer Number' ? header.replace('Number', '') : header === 'Warehouse' ? 'WHouse' : header.replace('Order', '').replace('Amount', '').replace('Description', '').replace('Message', '')}
                    </th>
                  )
                  :
                  (
                    null
                  )
                )
                :
                (
                  header !== 'Error Code' ?
                  (
                    <th
                      key={key}
                      onClick={() => requestSort(header.split(' ').join(''))}
                      className={getClassNamesFor(header.split(' ').join(''))}
                    >
                      {header === 'Order Number' ? header.replace('Number', '') : header === 'Customer Number' ? header.replace('Number', '') : header.replace('Order', '').replace('Amount', '').replace('Description', '').replace('Message', '').replace('Staging', '')}
                    </th>
                  )
                  :
                  (
                    null
                  )
                )
              })
            )
            : 
              null
            }
          </tr>
        </thead>
        <tbody>
        {props && items.length > 0 ? (
          items.map((item, key) => (
              <tr key={key}>
                {/* <td className='select-one'>
                  <Checkbox
                    type='checkbox'
                    name={item.OrderNumber}
                    value={item.OrderNumber}
                    handleClick={handleSelect}
                    isChecked={isChecked.includes(item.OrderNumber)}
                  />
                </td> */}
                <td className='order-number order-link'>
                  {vpWidth < 1280 ?
                  (
                    <Link
                      to='#'
                      onClick={() => takeAction('showDetails', item, key)}
                    >
                      {item.OrderNumber ? item.OrderNumber : 'None'}
                    </Link>
                  )
                  :
                  (
                    <Link
                      to={{
                        pathname: '/order-summary',
                        state: {
                          order: item.OrderNumber
                        },
                      }}
                    >
                      {item.OrderNumber}
                    </Link>
                  )}
                </td>
                <td className="reduceable-td desktop">{item.Market ? item.Market : 'N/A'}</td>
                {/* <td className="warehouse mobile">{item.Warehouse ? item.Warehouse.split('-')[0] : 'None'}-<br />{item.Warehouse.split('-')[1]}</td> */}
                <td className="warehouse">{item.Warehouse ? item.Warehouse : 'None'}</td>
                <td>{item.OrderTotalAmount && item.CurrencyCode ? formatCurrency(item.OrderTotalAmount, item.CurrencyCode) : 'N/A'}</td>
                <td className="order-type desktop">{item.OrderTypeDescription ? item.OrderTypeDescription : 'None'}</td>
                <td className="reduceable-td desktop">{item.CustomerNumber ? item.CustomerNumber : 'N/A'}</td>
                <td className="order-date">{item.OrderDate ? new Date(parseInt(item.OrderDate)).toISOString().split('T')[0] : 'N/A'}</td>
                <td className={`unpushed order-dates desktop`}>
                  {item.StagingImportDate ? new Date(parseInt(item.StagingImportDate)).toISOString().split('T')[0] : 'N/A'}
                </td>
              </tr>
          ))
        ) : (
            <tr>
              <td className='hidden-checkbox'></td>
              <td>None</td>
            </tr>
        )}
        </tbody>
      </table>

      {showDetails ? <OrderDetails details={orderDetails} closeModal={closeModal} getClassNamesFor={getClassNamesFor} /> : null}
    </>
  );
};

export default UnPushed;
