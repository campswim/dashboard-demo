import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useSort from '../../hooks/sort-data';
import Checkbox from '../../components/checkbox';
import getActions from '../../hooks/get-actions';
import OrderDetails from '../../components/order-details';
import Tabs from '../../components/tabs';
import formatHeaders from '../../hooks/format-headers';
import formatCurrency from '../../hooks/format-currency';
import { userAction } from '../../hooks/get-order';

const FailedPayment = props => {  
  const [allChecked, setAllChecked] = useState(false);
  const [isChecked, setIsChecked] = useState([]);
  const [isCheckedOrderNums, setIsCheckedOrderNums] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [activeTab, setActiveTab] = useState(null); 
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [activeTabCount, setActiveTabCount] = useState(0);
  const [activeLink, setActiveLink] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [jobNamesUnique, setJobNamesUnique] = useState([]);
  const [vpWidth, setVpWidth] = useState(window.innerWidth);
  const [error, setError] = useState(null);
  const [displayDismissed, setDisplayDismissed] = useState(true);
  const showMessage = useRef(false);
  const messageRef = useRef(null);
  const click = useRef(false);
  const toggleAll = useRef(0);
  const dismissedCount = useRef({});
  const dismissedTabs = useRef([]);
  const queryPath = useRef('');
  const itemsFiltered = useRef([]);

  // The following two constants handle the sorting algorithm.
  const { items, requestSort, sortConfig } = useSort(props.payments, 'payments');  
  const getClassNamesFor = name => {
    if (!sortConfig) return;
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };
  
  // Format the headers.
  const headers = items && items.length > 0 ? formatHeaders(Object.keys(items[0]), ['CurrencyCode']) : '';
  
  // Handles the selection and formatting of the page's tabs.
  const handleClick = (event, next) => {
    let chosenButtonValue;
    click.current = true;
    setIsCheckedOrderNums([]);

    if (event) {
      event.preventDefault();
      chosenButtonValue = event.target.value;
    } else chosenButtonValue = next;
    setActiveTab(chosenButtonValue);
    setActiveLink(false);
    props.handleClick(chosenButtonValue);
  };
  
  // Handles the action chosen by the user.
  const takeAction = (path, item) => {
    //Store a flag in storage to indicate that a new action has been initiated.
    sessionStorage.setItem('action', true);
    queryPath.current = path;

    if (path === 'showDetails') {
      setShowDetails(true);
      setOrderDetails(item);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (isChecked.length > 0) {
      if (path) {
        userAction('failedPayments', path, isChecked).then(
          res => {
            if (res?.data[path]) {
              const result = res.data[path];

              setError(null);
              
              if (path === 'reinstatePaymentError') {
                item.forEach(id => {
                  const dismissedAtTableCell = document.getElementById(`${id}-dismissed-at`);
                  const dismissedByTableCell = document.getElementById(`${id}-dismissed-by`);

                  dismissedAtTableCell.textContent = 'N/A';
                  dismissedByTableCell.textContent = 'N/A';
                });

                dismissedCount.current = dismissedCount.current - result.length;

                props.reload(props.activeTab);
              } else if (path === 'dismissPaymentError') { // No longer displaying dismissed by or at, because it can't be reinstated.
                item.forEach(id => {                  
                  const dismissedAtTableCell = document.getElementById(`${id}-dismissed-at`);
                  const dismissedByTableCell = document.getElementById(`${id}-dismissed-by`);
                  const dismissed = result.filter(item => item.PaymentId === id);
                  
                  dismissedAtTableCell.textContent = new Date(parseInt(dismissed[0].DismissedAt)).toISOString().split('T')[0];
                  dismissedByTableCell.textContent = dismissed[0].DismissedBy;
                })

                dismissedCount.current = dismissedCount.current + result.length;
                props.reload(props.activeTab);
              }

            } else if (res?.errors) {
              let errorString = '';
              res.errors.forEach((error, idx) => {
                if (res.errors.length === 1) errorString = error.message;
                else {
                  if (idx === 0) errorString += error.message + '; ';
                  else if (idx === res.errors.length - 1) errorString += error.message;
                  else errorString += error.message + '; ';
                }
              });
              
              if (errorString) setError(errorString);
            }
          },
          err => {
            setError(err);
          }
        );

        showMessage.current = true;
        setIsChecked([]);
        setIsCheckedOrderNums([]);
        setDismissed([]);
        toggleAll.current = 0;
        props.handleClick(activeTab);
      }
    }
  };

  // Handle the toggling of the select-all checkbox.
  const handleSelectAll = () => {
    const tabItems = itemsFiltered.current.filter(item => formatHeaders(item.PaymentType) === formatHeaders(activeTab) || activeTab === 'All');
    const dismissedTabItems = tabItems.filter(item => item.DismissedAt);
    const notDismissedTabItems = tabItems.filter(item => !item.DismissedAt);
    
    showMessage.current = false;
    dismissedCount.current = dismissedTabItems.length;

    // Set the toggleAll reference variable.
    if (displayDismissed && isChecked.length > 0 && toggleAll.current === 0) toggleAll.current = 1;
    if (displayDismissed && tabItems.length === dismissedTabItems.length && toggleAll.current === 2) toggleAll.current = 0;
    if (displayDismissed && tabItems.length === dismissedTabItems.length && !allChecked) toggleAll.current = 1;

    if (dismissedTabItems.length > 0 && displayDismissed) {
      toggleAll.current++;

      if (toggleAll.current === 2) {
        setIsChecked(dismissedTabItems.map(item => item.PaymentId));
        setDismissed(dismissedTabItems.map(item => item.PaymentId));
        setIsCheckedOrderNums(dismissedTabItems.map(item => item.OrderNumber));
      }
      else if (toggleAll.current === 1) {
        setIsChecked(notDismissedTabItems.map(item => item.PaymentId));
        setIsCheckedOrderNums(notDismissedTabItems.map(item => item.OrderNumber));
      } else {
        setIsChecked([]);
        setDismissed([]);
        setIsCheckedOrderNums([]);
        toggleAll.current = 0;
      }
    } else if (dismissedTabItems.length === tabItems.length) {
      if (allChecked) {
        setIsChecked([]);
        setIsCheckedOrderNums([]);
      } else {
        setIsChecked(dismissedTabItems.map(item => item.PaymentId));
        setIsCheckedOrderNums(dismissedTabItems.map(item => item.OrderNumber));
      }
    } else {
      if (allChecked) {
        setIsChecked([]);
        setIsCheckedOrderNums([]);
      } else {
        setIsChecked(tabItems.filter(item => !item.DismissedAt).map(item => item.PaymentId));
        setIsCheckedOrderNums(tabItems.filter(item => !item.DismissedAt).map(item => item.OrderNumber));
      }
    }
  };
  
  // Handle the toggling of a single item's checkbox.
  const handleSelect = event => {    
    const { name, value, checked, dataset } = event.target;
    const isDismissed = dataset.dismissed ? true : false;

    setError(null);

    // Set the isChecked state variable based on whether the list is one of dismissed errors or not.
    if (!isDismissed) {
      if (dismissed.length > 0) {
        setIsChecked([]);
        setDismissed([]);
        setIsCheckedOrderNums([]);
        setIsChecked([value]);
        setIsCheckedOrderNums([name]);
      } else {
        setIsChecked([...isChecked, value]);
        setIsCheckedOrderNums([...isCheckedOrderNums, name]);
      }
    } else {
      if (dismissed.length <= 0) {
        setIsChecked([]);
        setIsCheckedOrderNums([]);
        setDismissed([{ [value]: isDismissed }]);
        setIsChecked([value]);
        setIsCheckedOrderNums([name]);
      } else {
        setDismissed([...dismissed, { [value]: isDismissed }]);
        setIsChecked([...isChecked, value]);
        setIsCheckedOrderNums([...isCheckedOrderNums, name]);
      }
    }
    if (!checked) setIsChecked(isChecked.filter(item => item !== value));
  };
  
  // Close the modal on click of the X.
  const closeModal = () => setShowDetails(false);
  
  // Set the verb to display in the message for the action links.
  const message = (action) => {
    let pastTenseVerb = null;
    if (action) {
      if (action === 'Dismiss') pastTenseVerb = 'dismissed';
      if (action === 'Reinstate') pastTenseVerb = 'reinstated';
      // else if (action === 'Reinstate') pastTenseVerb = 'reinstated';
    }
    return pastTenseVerb;
  };
  
  // Set the active tab, when it changes.
  useEffect(() => {
    if (props.activeTab && activeTab !== props.activeTab) {
      setActiveTab(props.activeTab);
    }
  }, [activeTab, props.activeTab]);
    
  // Create the page's tabs for each unique payment type.
  useEffect(() => {
    if (props && props.payments) {        
      props.payments.forEach(type => {          
        let paymentType = type.PaymentType.split(' ').join('');          
        const parenthetical = paymentType.includes('(') ? paymentType.split('(')[1] : '';          
        
        paymentType = formatHeaders(paymentType.split('(')[0]);
        paymentType += parenthetical ? ` (${parenthetical}` : '';
                
        if (!jobNamesUnique.includes(paymentType)) setJobNamesUnique([...jobNamesUnique, paymentType]);          
      });
    }
  }, [jobNamesUnique, props, activeTab]);

  // Set the default active tab and each tab's count and tab's index.
  useEffect(() => {
    const hiddenRowCount = document.getElementsByClassName('hide-dismissed').length;

    if (!activeTab && jobNamesUnique && jobNamesUnique.length > 0) {
      setActiveTab(jobNamesUnique[0]);
    }
      
    if (props.payments) {
      let counter = 0;

      if (itemsFiltered.current.length > 0) {
        itemsFiltered.current.forEach(payment => {
          if (formatHeaders(payment.PaymentType) === formatHeaders(activeTab) || activeTab === 'All') {
            counter++;
          }
        });

        setActiveTabCount(!displayDismissed ? counter - hiddenRowCount : counter);
      }
    }

    const activeTabKeyValue = Object.entries(jobNamesUnique).filter(job => job[1] === formatHeaders(activeTab));
    if (activeTabKeyValue && activeTabKeyValue.length > 0) setActiveTabIndex(parseInt(activeTabKeyValue[0][0]));
  }, [activeTab, activeTabIndex, jobNamesUnique, props.payments, displayDismissed]);
  
  // Update the vpWidth variable.
  useEffect(() => {
    const handleResize = () => setVpWidth(window.innerWidth);
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize);
  }, [vpWidth]);
  
  // Hide checkboxes if a user is not allowed any actions.
  useEffect(() => {
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
  }, [props?.restrictedActions, items]);
  
  // Manage the value of the allChecked state variable.
  useEffect(() => {
    if (isChecked.length === activeTabCount && activeTabCount > 0) setAllChecked(true);
    else setAllChecked(false);
  }, [isChecked, activeTabCount]);
  
  // Show or hide optional actions: toggle the activeLink state variable.
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
    if (click.current) {
      showMessage.current = false;
      click.current = false;
    }
  });
  
  // Filter out duplicate-payment errors. (This is mainly for the PaymentTrackingHistory, which is being used for development only.)
  useEffect(() => {
    if (items && items.length > 0) {
      itemsFiltered.current = items.filter((item, index, self) => 
        index === self.findIndex(t => t.PaymentId === item.PaymentId)
      );
    }
  }, [items]);
  
  // Automatically scroll the active tab into view.
  useEffect(() => {
    const activeButtonElements = document.getElementsByClassName('active-button');

    if (activeButtonElements) {
      Array.from(activeButtonElements).forEach(el => {
        el.scrollIntoView(true);
      });

      document.body.scrollTop = document.documentElement.scrollTop = 0;
    }
  });
  
  if (props.error) return <div className='signin-error'>{props.error.message}</div>;
  if (!props.isLoaded) return <div className='loading unprocessed'>Loading . . . </div>;
  if (!props) return '';

  return (
    <div className='unprocessed-jobs-container'>
      {items.length > 0 && 
      (
        <div className='order-actions unprocessed'>
          <Tabs 
            activeTab={activeTab} 
            tabIndex={activeTabIndex} 
            tabs={jobNamesUnique.sort()}
            handleClick={handleClick} 
            caller='payments' 
          />
        </div>
      )}
      {dismissedCount.current > 0 && (dismissedTabs.current.includes(activeTab) || activeTab === 'All') && 
      (
        <div className='toggle-link'>
          <button onClick={() => setDisplayDismissed(!displayDismissed)} >
            {displayDismissed ? 'Hide' : 'Show'} Dismissed Errors
          </button>
        </div>
      )}
      <div className='order-info no-actions'>
        {items.length > 0 && 
        (
          <div className='order-info__stats'>
            <p className='order-info__stats__paragraph'>
              Selected: {isChecked.length}
            </p>
            {jobNamesUnique.length > 1 ? <p className='order-info__stats__paragraph'>Tab: {`${activeTabIndex + 1} of ${jobNamesUnique.length}`}</p> : null}
            <p className='order-info__stats__paragraph'>Row Count: {activeTabCount}</p>
          </div>
        )}
        {showDetails &&  
        (
          <OrderDetails 
            details={orderDetails} 
            closeModal={closeModal} 
            getClassNamesFor={getClassNamesFor} 
          /> 
        )}
        {activeLink && props.restrictedActions !== 'All' &&
        (
          <div className='order-info__action-links'>
            <form className='link order-info_action-links__form'>
              {props && props.restrictedActions ? getActions('paymentError', props.restrictedActions, isChecked, takeAction, isCheckedOrderNums, dismissed) : null}
            </form>
          </div>
        )}
        {(showMessage.current) && !error &&
        (
          props.order && (typeof props.order === 'number' || (Array.isArray(props.order) && props.order?.length === 1)) ? 
          (
            <div className='order-info__retried-order-set' id='retried-order-message' ref={messageRef}>
              <p className='order-info__retried-order-set__paragraph'>
                The payment error of order "{Array.isArray(props.order) ? props.order[0] : props.order}" has been {message(props.action)}.
              </p>
            </div>
          ) 
          : 
          (
            <div className='order-info__retried-order-set' id='retried-order-message' ref={messageRef}>
              <p className='order-info__retried-order-set__paragraph'>
                The following orders' payment errors have been {message(props.action)}:&nbsp;
              </p>
              <div className='order-info__orders-in-array'>
                {props.order ? 
                (
                  props.order.map((id, key) => {
                    return props.order.length === 1 ? 
                    ( 
                      <p className='order-info__retried-order-set__orders-in-array__paragraph' key={key}>{id}</p>
                    )
                    : key === props.order.length - 1 ?
                    (
                      <p className='order-info__retried-order-set__orders-in-array__paragraph' key={key}>{id}.</p>
                    )
                    :
                    (
                      <p className='order-info__retried-order-set__orders-in-array__paragraph' key={key}>{id},<span>&nbsp;</span></p>
                    )                          
                    })
                  )
                  :
                  (
                    null
                  )}
              </div>
            </div>
          )
        )}
        {error ?
        (
          props.order ? 
          (
            typeof props.order === 'number' || props.order.length === 1 ? (
            <div className='order-info__retried-order-set' id='retried-order-message' ref={messageRef}>
              The following error occurred when order "{Array.isArray(props.order) ? props.order[0] : props.order}" was {message(props.action)}: {error}
            </div>
          ) 
          : 
          (
            <div className='order-info__retried-order-set' id='retried-order-message' ref={messageRef}>
              <p>There was a '{error}' error when the following orders were {message(props.action)}:&nbsp;</p>
              <div className='order-info__retried-order-set__orders-in-array'>
                {props.order.map((id, key) => (
                  props.order.length === 1 ? 
                  ( 
                    <p className='order-info__retried-order-set__orders-in-array__paragraph' key={key}>{id}</p>
                  )
                  : key === props.order.length - 1 ?
                  (
                    <p className='order-info__retried-order-set__orders-in-array__paragraph' key={key}>{id}.</p>
                  )
                  :
                  (
                    <p className='order-info__retried-order-set__orders-in-array__paragraph' key={key}>{id},<span>&nbsp;</span></p>
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
        )}
      </div>

      <table className='unprocessed-jobs-table'>
        <thead>
          <tr className='header-row'>
          {items.length !== 0 ? (
            props.restrictedActions && props.restrictedActions === 'All' ?
            (
              null
            )
            :
            (
              <th className='checkbox-th'>
                <Checkbox
                  type='checkbox'
                  name='selectAll'
                  handleClick={handleSelectAll}
                  isChecked={allChecked}
                />
              </th>
            )
              ) : (
                <th className='hidden-checkbox'></th>
              )}
            {headers ?
            (
              headers.map((header, key) => (
                vpWidth < 1280 ?
                (
                  header !== 'Payment Id' && header !== 'Payment Type' & header !== 'Attempted At' && header !== 'Card Number' && header !== 'Payment Date' && header !== 'Dismissed At' && header !== 'Dismissed By' ?
                  (
                    <th
                      key={key}
                      onClick={() => requestSort(header.split(' ').join(''))}
                      className={getClassNamesFor(header.split(' ').join(''))}
                    >
                      {header === 'Order Number' ? 'Order' : header === 'Payment Amount' ? 'Amount' : header === 'Error Reason' ? 'Error' : header}
                    </th>
                  )
                  : 
                  (
                    null
                  )
                )
                :
                (
                  activeTab === 'Credit Card' ?
                  (
                    header !== 'Payment Type' ?
                    (
                      <th
                        key={key}
                        onClick={() => requestSort(header.split(' ').join(''))}
                        className={getClassNamesFor(header.split(' ').join(''))}
                      >
                        {header}
                      </th>
                    )
                    :
                    (
                      null
                    )
                  )
                  : activeTab === 'All' ?
                  (
                    header !== 'Card Number' ?
                    (
                      <th
                        key={key}
                        onClick={() => requestSort(header.split(' ').join(''))}
                        className={getClassNamesFor(header.split(' ').join(''))}
                      >
                        {header}
                      </th>
                    )
                    :
                    (
                      null
                    )
                  )
                  :
                  (
                    header !== 'Card Number' && header !== 'Payment Type' ? 
                    (
                      <th
                        key={key}
                        onClick={() => requestSort(header.split(' ').join(''))}
                        className={getClassNamesFor(header.split(' ').join(''))}
                      >
                        {header}
                      </th>
                    )
                    :
                    (
                      null
                    )
                  )
                )
              ))
            )
            : 
              null
            }
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            itemsFiltered.current.map((item, key) => {
              if (!key) {
                dismissedCount.current = 0;
                dismissedTabs.current = [];
              }
              if (item.DismissedAt && item.DismissedBy) {
                dismissedCount.current += 1;
                dismissedTabs.current.push(item.PaymentType);
              }

              return formatHeaders(item.PaymentType) === formatHeaders(activeTab) || activeTab === 'All' ? 
              (
                <tr key={key} className={!displayDismissed && item.DismissedAt ? 'hide-dismissed' : '' }>
                  {props.restrictedActions && props.restrictedActions === 'All' ?
                  (
                    null
                  )
                  :
                  (
                    <td className='select-one'>
                      <Checkbox
                        type='checkbox'
                        name={item.OrderNumber}
                        value={item.PaymentId}
                        dismissed={item.DismissedAt}
                        handleClick={handleSelect}
                        isChecked={isChecked.includes(item.PaymentId)}
                      />
                    </td>
                    )}
                  <td className='order-number order-link'>
                    {vpWidth < 1280 ?
                    (
                      <Link to='#' onClick={() => takeAction('showDetails', item)} >
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
                  <td className='payment-id desktop'>{item.PaymentId ? item.PaymentId : 'N/A'}</td>
                  {activeTab === 'All' ?
                  (
                    <td className='payment-type desktop'>{item.PaymentType ? item.PaymentType : 'N/A'}</td>
                  )
                  :
                  (
                    null
                  )}
                  <td className='payment-amount'>{formatCurrency(item.PaymentAmount, item.CurrencyCode)}</td>
                  <td className='payment-date desktop'>{new Date(parseInt(item.PaymentDate)).toISOString().split('T')[0]}</td>
                  <td className='payment-attempt-date desktop'>{new Date(parseInt(item.AttemptedAt)).toISOString().split('T')[0]}</td>
                  {activeTab === 'Credit Card' ? <td className='payment-card-number desktop'>{item.CardNumber ? item.CardNumber : 'None'}</td> : null}
                  {vpWidth < 1280 ?
                  (
                    <td className='payment-error whitespace-prewrap'>{item.ErrorReason && item.ErrorReason.length > 24? item.ErrorReason.slice(0,25) + '...' : item.ErrorReason && item.ErrorReason.length <= 24 ? item.ErrorReason : 'None'}</td>
                  )
                  :
                  (
                    <td className='payment-error whitespace-prewrap'>{item.ErrorReason ? item.ErrorReason : 'None'}</td>
                  )}
                  <td className='order-error-dismissed-at desktop' id={`${item.PaymentId}-dismissed-at`}>
                    {item.DismissedAt ? new Date(parseInt(item.DismissedAt)).toISOString().split('T')[0] : 'N/A'}
                  </td>
                  <td className='order-error-dismissed-by desktop' id={`${item.PaymentId}-dismissed-by`}>{item.DismissedBy ? item.DismissedBy : 'N/A'}</td>
                </tr>
              ) : 
              (
                null
              )
              })
          ) : (
            <tr>
              <td className='hidden-checkbox'></td>
              <td>None</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FailedPayment;
