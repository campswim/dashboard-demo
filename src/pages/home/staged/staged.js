import React from 'react';
import useSort from '../../../hooks/sort-data';
import formatCurrency from '../../../hooks/format-currency';
import formatHeaders from '../../../hooks/format-headers';

const Staged = props => {
  const { items, requestSort, sortConfig } = useSort(props.data, 'staged');
  const headers = props && props.data && Array.isArray(props.data) && props.data.length > 0 ? formatHeaders(Object.keys(props.data[0])) : [];
  const getClassNamesFor = name => {
    if (!sortConfig || !name) return;
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  return props.error ? 
  (
    <div><p>{props.error.message}</p></div>
  ) 
  : 
  (
    <div className='dash-staged-tableset'>
      {!props.isLoaded ? <div className='loading'>Loading . . . </div> : <div className="subheader">{props.subheader}</div>}
      <table>
        <thead>
          <tr className="header-row">
            {headers.length > 0 ? 
            (
              headers.map((header, idx) => (
                <th
                  key={idx}
                  onClick={() => requestSort(header[0].toLowerCase() + header.split(' ').join('').slice(1))}
                  className={getClassNamesFor(header[0].toLowerCase() + header.split(' ').join('').slice(1))}
                >
                  {header}
                </th>
              ))
            ) : (
              <>
                <th></th>
              </>
            )}
          </tr>
        </thead>
          <tbody>
            {items.length !== 0 ? 
            (
              items.map((item, key) => (
                <tr key={key}>
                  <td>{item.market}</td>
                  <td>{item.orderCount}</td>
                  <td>
                    {item.market === 'CA'
                      ? formatCurrency(item.totalAmount, 'CAD')
                      : item.market === 'PH'
                      ? formatCurrency(item.totalAmount, 'PHP')
                      : item.market === 'MX'
                      ? formatCurrency(item.totalAmount, 'MXN')
                      : formatCurrency(item.totalAmount)}
                  </td>
                </tr>
              ))
            ) 
            : 
            (
              null
            )}
          </tbody>
      </table>
    </div>
  )
};

export default Staged;
