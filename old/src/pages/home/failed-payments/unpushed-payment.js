import React from 'react';
import useSort from '../../../hooks/sort-data';
import formatHeaders from '../../../hooks/format-headers';
import formatCurrency from '../../../hooks/format-currency';

const UnpushedPayments = props => {
  const headers = props.data && JSON.stringify(props.data) !== '{}' ? formatHeaders(Object.keys(Object.values(props.data)[0]), 'CurrencyCode'): [];
  const { items, requestSort, sortConfig } = useSort(props.data && JSON.stringify(props.data) !=='{}' ? Object.values(props.data) : [], 'unpushed-payments');
  const getClassNamesFor = name => {
    if (!sortConfig) return;
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  return props.error ?
  (
    <div className='signin-error'>{props.error}</div>
  )
  : !props.isLoaded ?
  (
    <div className='loading'>Loading . . . </div>
  )
  :
  (
    <>
      <div className='dash-failed-processes desktop'>
        <table className='unprocessed-jobs-table'>
          <thead>
            <tr className='header-row'>
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
                  <td>{item.Type}</td>
                  <td>{item.Count}</td>
                  <td>
                    {formatCurrency(item.AggregateAmount, item.CurrencyCode)}
                  </td>
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
      <div className='dash-failed-processes mobile'>
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
                      {header === 'Aggregate Amount' ?
                      (
                        <td>
                          {formatCurrency(item.AggregateAmount, item.CurrencyCode)}
                        </td>
                      )
                      :
                      (
                        <td>{item[header.split(' ').join('')]}</td>
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
          null
        )
        }
      </div>
    </>
  )
}

export default UnpushedPayments;