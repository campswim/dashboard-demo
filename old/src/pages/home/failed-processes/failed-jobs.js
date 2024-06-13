import React from 'react';
import { Link } from 'react-router-dom';
import useSort from '../../../hooks/sort-data';
import formatHeaders from '../../../hooks/format-headers';

const FailedJobs = props => {
  // Get the table's headers from the data's keys.
  const headers = props.data && JSON.stringify(props.data) !== '{}' ? formatHeaders(Object.keys(Object.values(props.data)[0])) : [];
  // The following two constants handle the sorting algorithm.
  const { items, requestSort, sortConfig } = useSort(props.data && JSON.stringify(props.data) !== '{}' ? Object.values(props.data) : [], 'jobs-summary');
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

              {headers ? 
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
              items.map((item, key) => (
                <tr key={key}>
                  <td>
                    <Link
                      to={{
                        pathname: '/failed-processes',
                        state: { job: item.Name },
                      }}
                    >
                      {item.Name}
                    </Link>
                  </td>
                  <td>{item.Count}</td>
                  <td>{item.Direction}</td>
                  <td>{item.ExternalSystem}</td>
                  <td>{item.Categories}</td>
                </tr>
              )) 
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
        {items.length > 0 ? 
        (
          items.map((item, i) => (
            <table key={i}>
              <thead>
                {headers ?
                (
                  headers.map((header, j) => (
                    <tr key={j}>
                      <th>{header}</th>
                        {header !== 'Name' ? 
                      (
                        <td>
                          {item[header.split(' ').join('')]}
                        </td>
                      )
                      :
                      (
                        <td className='jobs-link'>
                          <Link
                            to={{
                              pathname: '/failed-processes',
                              state: { 
                                job: item.Name,
                              },
                            }}
                          >
                            {item.Name}
                          </Link>
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
          ))
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

export default FailedJobs;
