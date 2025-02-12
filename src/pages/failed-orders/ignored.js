import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Checkbox from '../../components/checkbox';
import useSort from '../../hooks/sort-data';
import formatCurrency from '../../hooks/format-currency';
import { userAction } from '../../hooks/get-order';
import formatHeaders from '../../hooks/format-headers';
import getActions from '../../hooks/get-actions';
import OrderDetails from '../../components/order-details';

const Ignored = props => {  
  const [allChecked, setAllChecked] = useState(false);
  const [isChecked, setIsChecked] = useState([]);
  const [status, setStatus] = useState(null);
  const [response, setResponse] = useState([]);
  const [error, setError] = useState(null);
  const [ignored, setIgnored] = useState([]);
  const [activeLink, setActiveLink] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [noLink, setNoLink] = useState(false);
  const [chars, setChars] = useState(999);
  const [delayed, setDelayed] = useState(true);
  const [orderDetails, setOrderDetails] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [vpWidth, setVpWidth] = useState(window.innerWidth);
  const showMessage = useRef(false);
  const messageRef = useRef(null);
  const clickCount = useRef(0);

  // Call the sorting hook.
  const { items, requestSort, sortConfig } = useSort(ignored, 'ignored');

  // Determine whether the class is ascending or descending.
  const getClassNamesFor = name => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  // Format the headers.
  const headers = items && items.length > 0 ? formatHeaders(Object.keys(items[0]), 'CurrencyCode') : '';

  // Handle user actions.
  const takeAction = (path, item) => {
    // Store a flag in storage to indicate that a new action has been initiated.
    sessionStorage.setItem('action', true);
    
    if (path === 'showDetails') {
      setOrderDetails(item);
      setShowDetails(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (isChecked.length !== 0) {
      const ids = [];
      const filteredOrders = ignored.filter(order => isChecked.includes(order.OrderNumber));
      filteredOrders.forEach(order => ids.push({[order.Type]: order.OrderNumber}));

      userAction('ignored', path, ids).then(
        res => {
          setResponse(res?.data[path]);
          setStatus(res?.status);
          setError(null);
          showMessage.current = true;
        },
        err => {
          console.error({err});
          setError(err.message);
          showMessage.current = false;
        }
        );
        setIsChecked([]);
        setAllChecked(false);
        props.recall('ignoredOrders');
    } else alert('Please tick an order.');

    // Deactivate action buttons if a user's profile has restrictions that match.
    if (props?.restrictedActions === 'All' || path.includes(props.restrictedActions.toLowerCase())) {
      setError('This feature is inaccessible for your user type');
      props.recall('failedPushes');
    }    
  };
  
  // Handle the toggling of the select-all checkbox.
  const handleSelectAll = () => {
    setAllChecked(!allChecked);
    setIsChecked(ignored.map(item => item.OrderNumber));
    if (allChecked) setIsChecked([]);
  };

  // Handle the toggling of individual checkboxes.
  const handleSelect = event => {
    const { value, checked } = event.target;
    setIsChecked([...isChecked, value]);
    if (!checked) setIsChecked(isChecked.filter(item => item !== value));
  };

  const showError = event => {
    const id = event.target.attributes.name.nodeValue;
    const errorElement = document.getElementById(id);
    if (errorElement) errorElement.setAttribute('id', 'show-error');
  };

  const message = (action) => {
    let pastTenseVerb;
    if (action && action === 'Unignore') pastTenseVerb = 'unignored';
    return pastTenseVerb;
  };

  // Close the modal on click of the X.
  const closeModal = () => {
    setShowDetails(false);
    // setIsChecked([]);
    clickCount.current = 0;
  };
  
  // Set the ignored variable from props.data.ignoredOrders.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (props.data) setIgnored(props.data.ignoredOrders);
    }
    return () => mounted = false;
  }, [props.data]);

  // Toggle allChecked.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (ignored && ignored.length !== 0 && isChecked.length === ignored.length) setAllChecked(true);
      else setAllChecked(false);
    }
    return () => mounted = false;
  }, [isChecked, ignored]);

  // Show or hide optional actions.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
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
    }
    return () => mounted = false;
  }, [isChecked]);

  // Delay the loading message by a second to avoid flashes of the screen when the loading is quick but not enough to trick the eye.
  useEffect(() => {
    return () => setTimeout(() => {
      setDelayed(false);
    }, 300);
  });

  // Hide the message of the action's result after a new tab has been chosen.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (props.click) showMessage.current = false;
    }
    return () => mounted = false;
  });

  // Hide checkboxes if a user is not allowed any actions.
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      if (props?.restrictedActions) {
        if (props.restrictedActions === 'All') { // Hide the checkboxes, so that a user can't choose any items, thereby blocking her from taking any action on the items.      
          const headerCheckbox = document.getElementsByClassName('checkbox-th');
          const rowCheckbox = document.getElementsByClassName('select-one');
    
          for (let checkbox of headerCheckbox) {
            checkbox.classList.add('hidden-checkbox');
          }
    
          for (let checkbox of rowCheckbox) {
            checkbox.classList.add('hidden-checkbox');
          }
        } 
      }
    }

    return () => mounted = false;
  }, [props?.restrictedActions, items]);  
  
  // Update the vpWidth and vpHeight variables.
  useEffect(() => {
      const handleResize = () => {
        setVpWidth(window.innerWidth);
      };
      window.addEventListener('resize', handleResize)
  }, [vpWidth]);

  // Determine the width of the browser window and set toggles accordingly.
  useLayoutEffect(() => {
    let mounted = true;

    if (mounted) {
      const handleResize = () => {
        setWidth(window.innerWidth);
      };

      setChars(width < 768 ? 12 : width < 1023 ? 24 : width < 1280 ? 48 : 999);

      items.forEach(item => {
        if (item.ErrorMessage) setNoLink(item.ErrorMessage.length < chars ? true : false);
      });
  
      window.onresize = handleResize;
    }

    return () => mounted = false;
  }, [width, items, chars]);
  
  if (props.error) return <div>Error: {props.error.message}</div>;
  if (!props.isLoaded && !delayed) return <div className="loading">Loading . . .</div>
  
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
        {activeLink ? (
          <div className='order-info__action-links'>
            <form className='link order-info__action-links__form'>
              {props && props.restrictedActions ? getActions('ignored', props.restrictedActions, isChecked, takeAction) : null}
            </form>
          </div>
        ) : status && status !== 200 && response ? (
          <div>Error: {error}</div>
        ) : (
          null
        )}
        {props.callerId === 'ignored' ? 
        (
          !error ? 
          (
            props.order ? 
            (
              showMessage.current && props.action && !activeLink && (props.action === 'Unignore') ? 
              (
                typeof props.order === 'number' || props.order.length === 1 ? 
                (
                  <div className='order-info__retried-order-set' id='retried-order-message' ref={messageRef}>
                    <p className='order-info__retried-order-set__paragraph'>
                      Order {props.order} has been {message(props.action)}.
                    </p>
                  </div>
                ) 
                : 
                (
                  <div className='order-info__retried-order-set' id='retried-order-message' ref={messageRef}>
                    <p className='order-info__retried-order-set__paragraph'>
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
              ) 
              : 
              (
                null
              )
            ) 
            : 
            (
              null
            )
          ) 
          : 
          (
            props.order ? 
            (
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
                        <p className='order-info__retried-order-set__orders-in-array-paragraph' key={key}>
                          {id}
                        </p>
                      )
                      : key === props.order.length - 1 ?
                      (
                        <p className='order-info__retried-order-set__orders-in-array-paragraph' key={key}>
                          {id}.
                        </p>
                      )
                      :
                      (
                        <p className='order-info__retried-order-set__orders-in-array-paragraph' key={key}>
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
              null
            )
          )
        ) 
        : 
        (
          null
        )}
      </div>
        
      <table className="unpushed-table-large" id="tab">
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
              headers.map((header, key) => (
                vpWidth < 1280 ?
                (
                  header !== 'Order Date' && header !== 'Ignored By' && header !== 'Message' ?
                  (
                    <th
                      key={key}
                      onClick={() => requestSort(header.split(' ').join(''))}
                      className={getClassNamesFor(header.split(' ').join(''))}
                    >
                      {header === 'Ignored Date' ? 'Ignored' : header.replace('Order', '')}
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
                    className={getClassNamesFor(header.split(' ').join(''))}
                  >
                    {header === 'Ignored Date' ? 'Ignored' : header === 'Ignored By' ? 'By User' : header.replace('Order', '')}
                  </th>
                )
              ))
            )
            : 
              null
            }
          </tr>
        </thead>
        <tbody>
        {items.length !== 0 ? (
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
                <td>{item.Type}</td>
                <td className="order-number order-link">
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
                <td className="order-date desktop">{item.OrderDate ? new Date(parseInt(item.OrderDate)).toISOString().split('T')[0] : 'N/A'}</td>
                <td>{formatCurrency(item.OrderTotal, item.CurrencyCode)}</td>
                <td className="unpushed-error-message desktop">
                  <span className={`error-message ${noLink}`} title={item.Message.length > chars ? "Click to view the error." : null} onClick={item.Message.length > chars ? showError : null} name={item.OrderNumber}>
                    {item.Message.includes('\r\n') ? `${item.Message.split('\r\n').join(' ').slice(0, chars)}` : `${item.Message.slice(0, chars)}`}
                    {item.Message.length > chars ? ' (...)' : null}
                  </span>
                </td>
                <td>{item.IgnoredAt ? new Date(parseInt(item.IgnoredAt)).toISOString().split('T')[0] : 'N/A'}</td>
                <td className="ignored-by desktop">{item.IgnoredBy ? item.IgnoredBy : 'N/A'}</td>
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
  )
};

export default Ignored;
