import React from 'react';
import { Link } from 'react-router-dom';
import useSort from '../../../hooks/sort-data';
import formatHeaders from '../../../hooks/format-headers';
import formatCurrency from '../../../hooks/format-currency';

const FailedPayments = props => {
  // Get the table's headers from the data's keys.
  const headers = props.data && Array.isArray(props.data) && props.data.length > 0 ? formatHeaders(Object.keys(Object.values(props.data[0])[0]), 'CurrencyCode') : {};
  
  // The following two expressions handle the sorting algorithm.
  const { items, requestSort, sortConfig } = useSort(props.data ? props.data : [], 'failed-payments');
  const getClassNamesFor = name => {
    if (!sortConfig) return;
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };
  
  return props.error ? 
  (
    <div className="signin-error">{props.error}</div>
  )
  : !props.isLoaded ?
  (
    <div className="loading">Loading . . . </div>
  )
  :
  (
    <>
      <div className="dash-failed-processes desktop">
        <table className="unprocessed-jobs-table">
          <thead>
            <tr className="header-row">
              {headers && headers.length > 0 ? 
              (
                headers.map((header, key) => (
                  <th
                    key={key}
                    onClick={() => requestSort(header.split(' ').join(''))}
                    className={getClassNamesFor(header.split(' ').join(''))}
                  >
                    {header}
                  </th>
                ))
              )
              :
              (
                null
              )}
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ?
            (
              items.map((val, key) => {
                const item = Object.values(val)[0];
                return <tr key={key}>
                  <td>
                    <Link
                      to={{
                        pathname: '/failed-payments',
                        state: { type: item.Type },
                      }}
                    >
                      {item.Type}
                    </Link>
                  </td>
                  <td>{item.Count}</td>
                  <td>{formatCurrency(item.AggregateAmount, item.CurrencyCode)}</td>
                  <td className='whitespace-prewrap'>
                    {item.ErrorReasons.map((reason, idx) => {
                      return item.ErrorReasons.length === 1 || idx === item.ErrorReasons.length - 1 ? reason : `${reason}, `;
                    }
                  )}</td>
                </tr>
              }) 
            )
            :
            (
              <tr><td>None</td></tr>
            )}
          </tbody>
        </table>
      </div>

      { /* Display the table vertically for mobile. */ }
      <div className="dash-failed-processes mobile">
        {items && items.length > 0 ? 
        (
          items.map((val, i) => {
            const item = Object.values(val)[0];
            return <table key={i}>
              <thead>
                {headers && headers.length > 0 ? 
                (
                  headers.map((header, j) => (
                    <tr key={j}>
                      <th>{header}</th>
                      {header === 'Type' ?
                      (
                        <td className='jobs-link'>
                          <Link
                            to={{
                              pathname: '/failed-payments/',
                              state: { 
                                type: item.Type,
                              },
                            }}
                          >
                            {item.Type}
                          </Link>
                        </td>
                      )
                      : header === 'Aggregate Amount' ?
                      (
                        <td>
                          {formatCurrency(item.AggregateAmount, item.CurrencyCode)}
                        </td>
                      )
                      :
                      (
                        <td>
                          {item[header.split(' ').join('')]}
                        </td>
                      )}
                    </tr>
                  ))
                )
                :
                (
                  null
                )}
              </thead>
            </table>
          })
        )
        :
        (
          <table>
            <tbody>
              <tr><td>None</td></tr>
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

export default FailedPayments;
