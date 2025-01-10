import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Checkbox from '../../components/checkbox';
import useSort from '../../hooks/sort-data';
import formatCurrency from '../../hooks/format-currency';
import formatHeaders from '../../hooks/format-headers';
import { userAction } from '../../hooks/get-order';
import getActions from '../../hooks/get-actions';
import OrderDetails from '../../components/order-details';

const UnPulled = props => {
  const [allChecked, setAllChecked] = useState(false);
  const [isChecked, setIsChecked] = useState([]);
  const [status, setStatus] = useState(null);
  const [response, setResponse] = useState([]);
  const [error, setError] = useState(null);
  const [unpulled, setUnpulled] = useState([]);
  const [activeLink, setActiveLink] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [toggleShorterError, setToggleShorterError] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [vpWidth, setVpWidth] = useState(window.innerWidth);
  const showMessage = useRef(false);
  const messageRef = useRef(null);
  const clickCount = useRef(0);
  // Call the sorting algorithm and set the class as ascending or descending.
  const { items, requestSort, sortConfig } = useSort(unpulled, 'unpulled');
  
  // Determine whether the class is ascending or descending.
  const getClassNamesFor = name => {
    if (!sortConfig) {
      return '';
    }
    return sortConfig.key === name ? sortConfig.direction : '';
  };

  // Format the headers.
  const headers = unpulled?.length > 0 ? formatHeaders(Object.keys(unpulled[0]), ['Id', 'CurrencyCode', 'IgnoredAt']) : [];

  // Handle the user's selected action.
  const takeAction = (path, item) => {
    // Store a flag in storage to indicate that a new action has been initiated.
    sessionStorage.setItem('action', true);

    if (path === 'showDetails') {
      setOrderDetails(item);
      setShowDetails(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (isChecked.length === 0) {
      alert('Please tick an order.');
      return;
    }

    // Deactivate action buttons if a user's profile has restrictions that match.
    if (props?.restrictedActions === 'All' || path.includes(props.restrictedActions.toLowerCase())) {
      setError('This feature is inaccessible for your user type');
      props.recall('failedPushes');
      return;
    }    
    
    if (path) {
      userAction('unpulled', path, isChecked)
      .then(res => {
        if (!res?.data?.[path]) return;

          const data = res.data[path];

          if (Array.isArray(data) && data[0]?.Message) {
              setError(data[0].Message);
          } else {
            setResponse(res.data[path]);
            setStatus(res.status);
            setError(null);
            showMessage.current = true;
          }
        })
      .catch(err => {
        console.error({err});
        setError(err.message);
        showMessage.current = false;
      })
      .finally(() => {
        setIsChecked([]);
        setAllChecked(false);
        props.recall('failedPulls');
      });
    }
  };
  
  // Handle the toggling of the select-all checkbox.
  const handleSelectAll = () => {
    setAllChecked(!allChecked);
    setIsChecked(unpulled.map(item => item.OrderNumber));
    if (allChecked) setIsChecked([]);
  };

  // Handle the toggling of a single item's checkbox.
  const handleSelect = event => {
    const { value, checked } = event.target;    
    setIsChecked([...isChecked, value]);
    if (!checked) setIsChecked(isChecked.filter(item => item !== value));
  };

  // Set the verb to display in the message for the action links.
  const message = action => {
    const actionMessages = {
      'Repull': 'repulled',
      'RepullAllowMismatch': 'repulled with mismatch',
      'Ignore': 'ignored'
    };
    return actionMessages[action];
  };

  // Close the modal on click of the X.
  const closeModal = () => {
    setShowDetails(false);
    clickCount.current = 0;
  };

  // Handle the click to show a modal with the full error message.
  const toggleErrorMessage = id => {
    if (!toggleShorterError) return;
    const element = document.getElementById(id);
    if (element) element.classList.toggle('show-error');
  };

  // Set the unpulled state variable with props.
  useEffect(() => {
    if (props.data.failedPulls) setUnpulled(props.data.failedPulls);
  }, [props.data.failedPulls]);

  // Manage the value of the allChecked state variable.
  useEffect(() => {
    const allItemsChecked = unpulled?.length > 0 && isChecked.length === unpulled.length;
    setAllChecked(allItemsChecked);
  }, [isChecked.length, unpulled]);

  // Toggle the activeLink state variable.
  useEffect(() => {
    const element = document.getElementById('retried-order-message');

    if (isChecked.length > 0) {
      const className = element ? element.getAttribute('class') : '';  
      if (className && !className.includes('hidden')) element.setAttribute('class', `${className}-hidden`);
      setActiveLink(true);
    } else {
      const className = element ? element.getAttribute('class').replace('-hidden', '') : ''; 
      if (className) element.setAttribute('class', className);
      setActiveLink(false);
    }
  }, [isChecked]);
  
  // Hide the message of the action's result after a new tab has been chosen.
  useEffect(() => {
    if (props.click) showMessage.current = false;
  }, [props.click]);

  // Hide checkboxes if a user is not allowed any actions.
  useEffect(() => {
    if (props?.restrictedActions === 'All') { // Hide the checkboxes, so that a user can't choose any items, thereby blocking her from taking any action on the items.      
      ['checkbox-th', 'select-one'].forEach(className => {
        Array.from(document.getElementsByClassName(className))
          .forEach(el => el.classList.add('hidden-checkbox'));
      });
    } 
  }, [props?.restrictedActions, items]);
  
  // Update the vpWidth variable.
  useEffect(() => {
      const handleResize = () => setVpWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, [vpWidth]);
  
  // Determine the width of the browser window and set toggles accordingly.
  useLayoutEffect(() => {
    const handleResize = () => setWidth(window.innerWidth); 
    window.addEventListener('resize', handleResize);
    setToggleShorterError(window.innerWidth < 768);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  if (props.getQuery !== 'failedPulls') return null;
  if (props.error) return <div className="signin-error">{props.error.message}</div>;
  if (!props.isLoaded) return <div className="loading">Loading . . .</div>;
    
  return (
    <>
      <div className='order-info'>
        {items.length > 0 ? 
        (
          <div className='order-info__stats'>
            <p className='order-info__stats__paragraph'>Selected: {isChecked.length}</p>
            <p className='order-info__stats__paragraph'>Count: {items.length}</p>
          </div>
        )
        :
        (
          null
        )}
        {activeLink ? 
        (
          <div className='order-info__action-links'>
            <form className='link order-info__action-links__form'>
              {props && props.restrictedActions ? getActions('unpulled', props.restrictedActions, isChecked, takeAction) : null}
            </form>
          </div>
        ) : status && status !== 200 && response ? 
        (
          <div>Error: {error}</div>
        ) : (
          null
        )}
        {props.callerId === 'unpulled' ? (
          !error ? (
            props.order ? (
              showMessage.current && props.action && !activeLink && props.restrictedActions !== 'All' && (props.action === 'Repull' || props.action === 'Ignore' || props.action === 'Delete') ? 
              (
                typeof props.order === 'number' || props.order.length === 1 ? 
                ( 
                  <div className='order-info__retried-order-set' id='retried-order-message' ref={messageRef}>
                    <p>Order {props.order} has been {message(props.action)}.</p>
                  </div>
                ) 
                : 
                (
                  <div className='order-info__retried-order-set' id='retried-order-message' ref={messageRef}>
                    <p className='order-info__retried-order-set__paragraph'>The following orders have been {message(props.action)}:&nbsp;</p>
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
              ) 
              : 
              (
                ''
              ) 
            ) 
            : 
            (
              ''
            )
          ) 
          : 
          (
            props.order ? 
            (
              typeof props.order === 'number' || props.order.length === 1 ? (
              <div className="order-info__retried-order-set" id="retried-order-message" ref={messageRef}>
                The following error occurred when order {props.order} was {message(props.action)}: {error}.
              </div>
            ) 
            : 
            (
              <div className="order-info__retried-order-set" id="retried-order-message" ref={messageRef}>
                <p>There was a "{error}" error when the following orders were {message(props.action)}:&nbsp;</p>
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
            ) 
            : 
            (
              ''
            )
          )
        ) 
        : 
        (
          null
        )}
      </div>
      <table className="unpulled-table-large" id="tab">
        <thead>
          <tr className='header-row'>
            {items.length !== 0 ? (
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
            )}
            {headers ? 
            (
              <>
                {headers.map((header, key) => (
                  vpWidth < 1280 ?
                  (
                    header !== 'At' && header !== 'Exception' ?
                    (
                      <th
                        key={key}
                        onClick={() => requestSort(header.split(' ').join(''))}
                        className={`${getClassNamesFor(header.split(' ').join(''))}`}
                      >
                        {header === 'Message' ? 'Error' : header.replace('Order', '')}
                      </th>
                    )
                    :
                    (
                      null
                    )
                  )
                  :
                  (
                    <th
                      key={key}
                      onClick={() => requestSort(header.split(' ').join(''))}
                      className={`${getClassNamesFor(header.split(' ').join(''))}`}
                    >
                        {header === 'Message' ? 'Error' : header.replace('Order', '')}
                    </th>
                  )
                ))}
              </>
            )
            : 
              null
            }
          </tr>
        </thead>
        <tbody>
          {items.length !== 0 ? 
          (
            items.map((item, key) => (
              <tr key={key}>
                <td className='select-one'>
                  <Checkbox
                    type='checkbox'
                    name={item.OrderNumber}
                    value={item.OrderNumber}
                    handleClick={handleSelect}
                    isChecked={isChecked.includes(item.OrderNumber)}
                  />
                </td>
                <td className="order-number order-link">
                  {vpWidth < 1280 ?
                  (
                    <Link
                      to='#'
                      onClick={() => takeAction('showDetails', item, key)}
                    >
                      {item.OrderNumber}
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

                <td className={`unpulled order-dates mobile`}>
                  {item.OrderDate ? 
                  (
                    new Date(parseInt(item.OrderDate)).toISOString().split('T')[0]
                  ) : (
                    'None'
                  )}
                </td>
                {/* To-do: CSS this in at a certain screen width. */}
                <td className={`unpulled order-dates desktop`}>
                  {item.OrderDate ? 
                  (
                    new Date(parseInt(item.OrderDate)).toISOString().split('T')[0]
                  ) : (
                    'None'
                  )}
                </td>
                <td>{formatCurrency(item.OrderTotal, item.CurrencyCode)}</td>
                <td className={`attempted-dates desktop`}>
                  {item.At ? 
                  (
                    new Date(parseInt(item.At)).toISOString().split('T')[0]
                  ) : (
                    'None'
                  )}
                </td>
                <td 
                  name={item.OrderNumber} 
                  className={`error-message ${toggleShorterError}`} 
                  onClick={() => toggleErrorMessage(item.OrderNumber)}
                >
                  <p>{!toggleShorterError ? item.Message : `${item.Message.slice(0, 7)}...`}</p>
                </td>
                <td 
                  name={item.OrderNumber} 
                  id={item.OrderNumber} 
                  className='error-message-unpulled'
                >
                  <div className='x-close-container'>
                    <span className="x-close" onClick={() => toggleErrorMessage(item.OrderNumber)}>x</span>
                  </div>
                  <p>{item.Message}</p>
                </td>
                <td className='exception desktop'>{item.Exception ? item.Exception : 'None'}</td>
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

export default UnPulled;
