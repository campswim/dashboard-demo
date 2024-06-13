import React from 'react';
import useSort from '../../hooks/sort-data';
import formatCurrency from '../../hooks/format-currency';

const Pushed = props => {
  const { items, requestSort, sortConfig } = useSort(
    props.data,
    'pushed'
  );
  
  const getClassNamesFor = name => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };
  
  return props.error ? (
    <div>{props.error.message}</div>
  ) : !props.isLoaded ? (
    <div className='loading'>Loading...</div>
  ) : props.isLoaded ? (
    <table className='dashboard-table'>
      <thead>
        <tr className='header-row'>
          <th
              onClick={() => requestSort('market')}
              className={getClassNamesFor('market')}
            >
              Market
            </th>
            <th
              onClick={() => requestSort('orderCount')}
              className={getClassNamesFor('orderCount')}
            >
              Count
            </th>
            <th
              onClick={() => requestSort('totalAmount')}
              className={getClassNamesFor('totalAmount')}
            >
              Total            
            </th>
        </tr>
      </thead>
      {items.length !== 0 ? (
        items.map((item, key) => (
          <tbody key={key}>
            <tr>
              <td>{item.market}</td>
              <td>{item.orderCount}</td>
              <td>
                {item.market === 'CAN'
                  ? formatCurrency(item.totalAmount, 'CAD')
                  : item.market === 'PHL'
                  ? formatCurrency(item.totalAmount, 'PHP')
                  : item.market === 'MEX'
                  ? formatCurrency(item.totalAmount, 'MXN')
                  : formatCurrency(item.totalAmount)}
              </td>
            </tr>
          </tbody>
        ))
      ) : (
        <tbody>
          <tr>
            <td>None</td>
            <td>None</td>
            <td>None</td>
          </tr>
        </tbody>
      )}
    </table>
  ) : (
    ''
  );
};

export default Pushed;
