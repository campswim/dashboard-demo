import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useSort from '../../hooks/sort-data';
import Checkbox from '../../components/checkbox';
import getActions from '../../hooks/get-actions';
import OrderDetails from '../../components/order-details';
import Tabs from '../../components/tabs';
import formatHeaders from '../../hooks/format-headers';
import { userAction } from '../../hooks/get-order';

const Unprocessed = props => {
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
  const dismissedCount = useRef(0);
  const queryPath = useRef('');

  // The following two constants handle the sorting algorithm.
  const { items, requestSort, sortConfig } = useSort(props.jobs, 'jobs');
  const getClassNamesFor = name => {
    if (!sortConfig) return;
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };
  
  // Format the headers.
  const headers = items && items.length > 0 ? formatHeaders(Object.keys(items[0]), ['Id', 'Name']) : '';

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
  
  // Handles the action chosen by the user, if applicable.
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
        if (activeTabCount === isChecked.length) {
          if (path === 'reinstateJobError') dismissedCount.current = 0;
        }
        if (path === 'dismissJobError') dismissedCount.current = isChecked.length;
        
        userAction('failedProcesses', path, isChecked).then(
          res => {
            if (res?.data[path]) {
              setError(null);
              
              if (path === 'reinstateJobError') dismissedCount.current = dismissedCount.current - res.data[path].length;
              else if (path === 'dismissJobError') dismissedCount.current = dismissedCount.current + res.data[path].length;

            } else if (res.errors) {
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
    const tabItems = items.filter(item => formatHeaders(item.Name) === formatHeaders(activeTab));
    const dismissedTabItems = tabItems.filter(item => item.DismissedAt);
    const notDismissedTabItems = tabItems.filter(item => !item.DismissedAt);
    
    showMessage.current = false;
    dismissedCount.current = dismissedTabItems.length;

    if (displayDismissed && isChecked.length > 0 && toggleAll.current === 0) toggleAll.current = 1;
    if (displayDismissed && tabItems.length === dismissedTabItems.length && toggleAll.current === 2) toggleAll.current = 0;
    if (displayDismissed && tabItems.length === dismissedTabItems.length && !allChecked) toggleAll.current = 1;
    if (dismissedTabItems.length > 0 && displayDismissed) {
      toggleAll.current++;

      if (toggleAll.current === 2) {
        setIsChecked(dismissedTabItems.map(item => item.Id));
        setDismissed(dismissedTabItems.map(item => item.Id));
        setIsCheckedOrderNums(dismissedTabItems.map(item => item.OrderNumber));
      }
      else if (toggleAll.current === 1) {
        setIsChecked(notDismissedTabItems.map(item => item.Id));
        setIsCheckedOrderNums(notDismissedTabItems.map(item => item.Number));
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
        setIsChecked(dismissedTabItems.map(item => item.Id));
        setIsCheckedOrderNums(dismissedTabItems.map(item => item.OrderNumber));
      }
    } else {
      if (allChecked) {
        setIsChecked([]);
        setIsCheckedOrderNums([]);
      } else {
        setIsChecked(tabItems.filter(item => !item.DismissedAt).map(item => item.Id));
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
      else if (action === 'Reinstate') pastTenseVerb = 'reinstated';
    }
    return pastTenseVerb;
  };
  
  // Set the active tab, when it changes.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (props.activeTab && activeTab !== props.activeTab) {
        setActiveTab(props.activeTab);
      }
    }
    return () => mounted = false;
  }, [activeTab, props.activeTab]);
    
  // Create the page's tabs for each unique job.
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      if (props && props.jobs) {
        props.jobs.forEach(job => {
          const jobsName = formatHeaders(job.Name);
          if (!jobNamesUnique.includes(jobsName)) setJobNamesUnique([...jobNamesUnique, jobsName]);
        });
      }
    }

    return () => mounted = false;
  }, [jobNamesUnique, props, activeTab]);

  // Set the default active tab and each tab's count and tab's index.
  useEffect(() => {
    let mounted = true;
    const hiddenRowCount = document.getElementsByClassName('hide-dismissed').length;

    if (mounted) {
      if (!activeTab && jobNamesUnique && jobNamesUnique.length > 0) {
        setActiveTab(jobNamesUnique[0]);
      }
        
      if (props.jobs) {
        let counter = 0;

        props.jobs.forEach(job => {
          if (formatHeaders(job.Name) === formatHeaders(activeTab)) {
            counter++;
          }
        });
        
        setActiveTabCount(!displayDismissed ? counter - hiddenRowCount : counter);
      }
  
      const activeTabKeyValue = Object.entries(jobNamesUnique).filter(job => job[1] === formatHeaders(activeTab));
      if (activeTabKeyValue && activeTabKeyValue.length > 0) setActiveTabIndex(parseInt(activeTabKeyValue[0][0]));
    }

    return () => mounted = false;
  }, [activeTab, activeTabIndex, jobNamesUnique, props.jobs, displayDismissed]);
  
  // Update the vpWidth variable.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const handleResize = () => {
        setVpWidth(window.innerWidth);
      }
      window.addEventListener('resize', handleResize)
    }
    return () => mounted = false;
  }, [vpWidth]);
  
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
  
  // Manage the value of the allChecked state variable.
  useEffect(() => {
    let mounted = true;
    if (mounted) {

      if (isChecked.length === activeTabCount && activeTabCount > 0) setAllChecked(true);
      else setAllChecked(false);
    }
    return () => mounted = false;
  }, [isChecked, activeTabCount]);
  
  // Show or hide optional actions: toggle the activeLink state variable.
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
  
  // Hide the message of the action's result after a new tab has been chosen.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (click.current) {
        showMessage.current = false;
        click.current = false;
      }
    }
    return () => mounted = false;
  });
  
  return props.error ?
  (
    <div className="signin-error">{props.error.message}</div>
  ) 
  : !props.isLoaded ? 
  ( 
    <div className="loading unprocessed">Loading . . . </div>
  ) 
  : props ? 
  (
    <div className="unprocessed-jobs-container">
      <div className="order-actions unprocessed">
        <Tabs activeTab={activeTab} tabIndex={activeTabIndex} tabs={jobNamesUnique} handleClick={handleClick} caller='unprocessed' />
      </div>
      {dismissedCount.current > 0 ? 
      (
        <div className="toggle-link">
          <Link to='#' onClick={() => setDisplayDismissed(!displayDismissed)} >
            {displayDismissed ? 'Hide' : 'Show'} Dismissed Errors
          </Link>
        </div>
      )
      :
      (
        null
      )}
      <div className="order-info no-actions">
        {items.length > 0 ? 
        (
          <div className="stats">
            <p className="order-info-number-display">Selected: {isChecked.length}</p>
            {jobNamesUnique.length > 1 ? <p className="order-info-number-display">Tab: {`${activeTabIndex + 1} of ${jobNamesUnique.length}`}</p> : null}
            <p className="order-info-number-display">Row Count: {activeTabCount}</p>
          </div>
        )
        :
        (
          null
        )}
        {showDetails ? 
        (
          <OrderDetails details={orderDetails} closeModal={closeModal} getClassNamesFor={getClassNamesFor} /> 
        )
        :
        (
          null
        )
        }
        {activeLink && props.restrictedActions !== 'All' ?
        (
          <div className='action-links'>
            <form className='link'>
              {props && props.restrictedActions ? getActions('jobError', props.restrictedActions, isChecked, takeAction, isCheckedOrderNums, dismissed) : null}
            </form>
          </div>
        ) 
        : 
        (
          null
        )}
        {(showMessage.current) && !error ?
        (
          props.order && (typeof props.order === 'number' || (Array.isArray(props.order) && props.order?.length === 1)) ? 
          (
            <div className="retried-order-set" id="retried-order-message" ref={messageRef}>
              <p>The processing error of order "{Array.isArray(props.order) ? props.order[0] : props.order}" has been {message(props.action)}.</p>
            </div>
          ) 
          : 
          (
            <div className="retried-order-set" id="retried-order-message" ref={messageRef}>
              <p>The following orders' processing errors have been {message(props.action)}:&nbsp;</p>
              <div className='orders-in-array'>
                {props.order ? 
                (
                  props.order.map((id, key) => {
                    return props.order.length === 1 ? 
                    ( 
                      <p key={key}>{id}</p>
                    )
                    : key === props.order.length - 1 ?
                    (
                      <p key={key}>{id}.</p>
                    )
                    :
                    (
                      <p key={key}>{id},<span>&nbsp;</span></p>
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
        )
        :
        (
          null
        )}
        {error ?
        (
          props.order ? 
          (
            typeof props.order === 'number' || props.order.length === 1 ? (
            <div className="retried-order-set" id="retried-order-message" ref={messageRef}>
              The following error occurred when order "{Array.isArray(props.order) ? props.order[0] : props.order}" was {message(props.action)}: {error}
            </div>
          ) 
          : 
          (
            <div className="retried-order-set" id="retried-order-message" ref={messageRef}>
              <p>There was a '{error}' error when the following orders were {message(props.action)}:&nbsp;</p>
              <div className='orders-in-array'>
                {props.order.map((id, key) => (
                  props.order.length === 1 ? 
                  ( 
                    <p key={key}>{id}</p>
                  )
                  : key === props.order.length - 1 ?
                  (
                    <p key={key}>{id}.</p>
                  )
                  :
                  (
                    <p key={key}>{id},<span>&nbsp;</span></p>
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

      <table className="unprocessed-jobs-table">
        <thead>
          <tr className="header-row">
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
                  header !== 'Line Number' && header !== 'At' & header !== 'Message' && header !== 'Exception' && header !== 'Additional Data' && header !== 'Data Direction' && header !== 'Dismissed By' ?
                  (
                    <th
                      key={key}
                      onClick={() => requestSort(header.split(' ').join(''))}
                      className={getClassNamesFor(header.split(' ').join(''))}
                    >
                      {header === 'Order Number' ? 'Order' : header === 'Category' ? 'Cat' : header === 'External System' ? 'Sys' : header === 'Dismissed At' ? 'Dismissed' : header}
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
                    {header === 'Order Number' ? 'Order' : header === 'Line Number' ? 'Line' : header === 'External System' ? 'System' : header === 'Data Direction' ? 'Data' : header === 'Message' ? 'Error' : header === 'Additional Data' ? 'Additional' : header === 'Dismissed At' ? 'Dismissed' : header === 'Dismissed By' ? 'By' : header}
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
          {items.length > 0 ? (
            items.map((item, key) => {
              return formatHeaders(item.Name) === formatHeaders(activeTab) ? 
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
                        value={item.Id}
                        dismissed={item.DismissedAt}
                        handleClick={handleSelect}
                        isChecked={isChecked.includes(item.Id)}
                      />
                    </td>
                    )}
                  <td className="order-number order-link">
                    {vpWidth < 1280 ?
                    (
                      <Link to='#' onClick={() => takeAction('showDetails', item)} >
                        {item.OrderNumber ? item.OrderNumber : 'None'}
                      </Link>
                    )
                    :
                    (
                      item.OrderNumber ? item.OrderNumber : 'None'
                    )}
                  </td>
                  <td className="line-number desktop">{item.LineNumber ? item.LineNumber : 'N/A'}</td>
                  <td className="order-category">{item.Category ? item.Category : 'N/A'}</td>
                  <td className="external-system">{item.ExternalSystem}</td>
                  <td className="data-direction desktop">{item.DataDirection}</td>
                  <td className="order-date desktop">{new Date(parseInt(item.At)).toISOString().split('T')[0]}</td>
                  <td className="order-message desktop">{item.Message ? item.Message : 'None'}</td>
                  <td className="order-exception desktop">{item.Exception ? item.Exception : 'None'}</td>
                  <td className="order-additional-data desktop">{item.AdditionalData ? item.AdditionalData : 'None'}</td>
                  <td className="order-error-dismissed-at">
                    {item.DismissedAt ? new Date(parseInt(item.DismissedAt)).toISOString().split('T')[0] : 'N/A'}
                  </td>
                  <td className="order-error-dismissed-by desktop">{item.DismissedBy ? item.DismissedBy : 'N/A'}</td>
                </tr>
              ) : 
              (
                null
              )
              })
          ) : (
            <tr>
              <td className="hidden-checkbox"></td>
              <td>None</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ) : (
    ''
  )
};

export default Unprocessed;
