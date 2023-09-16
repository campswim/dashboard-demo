import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSort from '../../hooks/sort-data';
// import Checkbox from '../../components/checkbox';
import OrderDetails from '../../components/order-details';
import Tabs from '../../components/tabs';
import formatHeaders from '../../hooks/format-headers';

const Unprocessed = props => {
  const [activeTab, setActiveTab] = useState(null); 
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [activeTabCount, setActiveTabCount] = useState(0);
  const [activeLink, setActiveLink] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [jobNamesUnique, setJobNamesUnique] = useState([]);
  const [vpWidth, setVpWidth] = useState(window.innerWidth);

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

    if (event) {
      event.preventDefault();
      chosenButtonValue = event.target.value;
    } else chosenButtonValue = next;
    setActiveTab(chosenButtonValue);
    setActiveLink(false);
    props.handleClick(chosenButtonValue);
  };
  
  // Handles the action chosen by the user, if applicable.
  const action = (path, item) => {
    if (path === 'showDetails') {
      setShowDetails(true);
      setOrderDetails(item);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    //Store a flag in storage to indicate that a new action has been initiated.
    sessionStorage.setItem('action', true);
  };

  // Close the modal on click of the X.
  const closeModal = () => setShowDetails(false);
    
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

        setActiveTabCount(counter);
      }
  
      const activeTabKeyValue = Object.entries(jobNamesUnique).filter(job => job[1] === formatHeaders(activeTab));
      if (activeTabKeyValue && activeTabKeyValue.length > 0) setActiveTabIndex(parseInt(activeTabKeyValue[0][0]));
    }

    return () => mounted = false;
  }, [activeTab, activeTabIndex, jobNamesUnique, props.jobs]);
  
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
    
  return props.error ? 
  (
    <div className="signin-error">{props.error.message}</div>
  ) : !props.isLoaded ? 
  ( 
    <div className="loading unprocessed">Loading . . . </div>
  ) : props ? (
    <div className="unprocessed-jobs-container">
      <div className="order-actions unprocessed">
        <Tabs activeTab={activeTab} tabIndex={activeTabIndex} tabs={jobNamesUnique} handleClick={handleClick} caller='unprocessed' />
      </div>
      <div className="order-info no-actions">
        {items.length > 0 ? 
        (
          <div className="stats">
            {jobNamesUnique.length > 1 ? <p className="order-info-number-display">Tab: {`${activeTabIndex + 1} of ${jobNamesUnique.length}`}</p> : null}
            <p className="order-info-number-display">Order Count: {activeTabCount}</p>
          </div>
        )
        :
        (
          null
        )}
        {activeLink ? 
        (
          <div className="action-links">
            <form className="link">
              <Link to='#' onClick={() => action('showDetails')}>
                Details
              </Link>
            </form>
          </div>
        ) 
        : 
        (
          null
        )}
        {showDetails ? <OrderDetails details={orderDetails} closeModal={closeModal} getClassNamesFor={getClassNamesFor} /> : null}
      </div>

      <table className="unprocessed-jobs-table">
        <thead>
          <tr className="header-row">
            {headers ? 
            (
              headers.map((header, key) => (
                vpWidth < 1280 ?
                (
                  header !== 'Line Number' && header !== 'At' & header !== 'Message' && header !== 'Exception' && header !== 'Additional Data' ?
                  (
                    <th
                      key={key}
                      onClick={() => requestSort(header.split(' ').join(''))}
                      className={getClassNamesFor(header.split(' ').join(''))}
                    >
                      {header === 'Order Number' ? 'Order' : header === 'Category' ? 'Cat' : header === 'External System' ? 'Sys' : header === 'Data Direction' ? 'Data' : header === 'Message' ? 'Error' : header}
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
                    {header === 'Order Number' ? 'Order' : header === 'Line Number' ? 'Line' : header === 'External System' ? 'System' : header === 'Data Direction' ? 'Data' : header === 'Message' ? 'Error' : header === 'Additional Data' ? 'Additional': header}
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
                <tr key={key}>
                  <td className="order-number order-link">
                    {vpWidth < 1280 ?
                    (
                      <Link to='#' onClick={() => action('showDetails', item)} >
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
                  <td className="data-direction">{item.DataDirection}</td>
                  <td className="order-date desktop">{new Date(parseInt(item.At)).toISOString().split('T')[0]}</td>
                  <td className="order-message desktop">{item.Message ? item.Message : 'None'}</td>
                  <td className="order-exception desktop">{item.Exception ? item.Exception : 'None'}</td>
                  <td className="order-additional-data desktop">{item.AdditionalData ? item.AdditionalData : 'None'}</td>
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
