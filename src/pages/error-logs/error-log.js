import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import OrderDetails from '../../components/order-details';
import useSort from '../../hooks/sort-data';
import formatHeaders from '../../hooks/format-headers';

const ErrorLog = ({ data, error, isLoaded, children }) => {
  const [vpWidth, setVpWidth] = useState(window.innerWidth);
  const [orderDetails, setOrderDetails] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const queryPath = useRef('');

  const { items, requestSort, sortConfig } = useSort(data, 'error-logs');

  const getClassNamesFor = (name) => {
    if (!sortConfig) return;
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const headers = items && items.length > 0 ? formatHeaders(Object.keys(items[0]), ['Id', 'Name']) : '';

  const takeAction = (path, item) => {
    sessionStorage.setItem('action', true);
    queryPath.current = path;

    if (path === 'showDetails') {
      setShowDetails(true);
      setOrderDetails(item);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeModal = () => setShowDetails(false);

  useEffect(() => {
    const handleResize = () => setVpWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (error) {
    return <div className="signin-error">{error.message}</div>;
  }

  if (!isLoaded) {
    return <div className="loading unprocessed">Loading . . . </div>;
  }
  
  return items && items.length ? 
  (
    <div className="unprocessed-jobs-container">
      <p className='count'>Count: {items.length}</p>
      {children}
      {showDetails && 
        <OrderDetails details={orderDetails} closeModal={closeModal} getClassNamesFor={getClassNamesFor} />
      }
      <table className="unprocessed-jobs-table">
        <thead>
          <tr className="header-row">
            {items.length > 0 && headers && headers.map((header, key) => {
              const isMobileView = vpWidth < 1280;
              const showColumn = !isMobileView || (header !== 'Exception' && header !== 'Message');

              return showColumn && (
                <th
                  key={key}
                  onClick={() => requestSort(header.replace(/\s+/g, ''))}
                  className={getClassNamesFor(header.replace(/\s+/g, ''))}
                >
                  {header === 'Machine Name' ? 'Machine' : header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {items.map((item, key) => (
            <tr key={key}>
              {Object.keys(item).map((val, i) => {
                const isMobileView = vpWidth < 1280;
                const isMessageOrException = val === 'Message' || val === 'Exception';
                const dateTime = val === 'TimeStamp' ? new Date(Number(item[val])) : '';
                let time = '', date = '';

                if (dateTime) {
                  date = dateTime.toISOString().split('T')[0];
                  time = dateTime.toISOString().split('T')[1].split('.')[0];
                } 

                if (isMobileView && isMessageOrException) return null;

                return (
                  <td key={i} className={val === 'Message' || val === 'Exception' ? 'error-message' : isMobileView ? 'truncate' : undefined}>
                    {item[val] === null ? 'N/A' : 
                      val === 'TimeStamp' && dateTime ? 
                      (
                        !isMobileView ? <>{date}<br/>({time})</> : date
                      )
                      :
                      (
                        val === 'JobName' ? 
                        (
                          <Link to='#' onClick={() => takeAction('showDetails', item)}>
                            {item[val]}
                          </Link>
                        ) : item[val]
                      )
                    }
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
  :
  (
    <div className="unprocessed-jobs-container">
      {children}
      <table className="unprocessed-jobs-table">
        <thead></thead>
        <tbody>
          <tr>
            <td>None</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
};

export default ErrorLog;