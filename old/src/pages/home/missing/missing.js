import React from 'react';
import useSort from '../../../hooks/sort-data';

const Missing = ({ data, error, market, count }) => {
  const reformattedData = data && Array.isArray(data) ? data.map(data => ({ itemCode: data})) : '';
  const { items, requestSort, sortConfig } = useSort(reformattedData, 'missing-items');
  const getClassNamesFor = name => {
    if (!sortConfig) return;
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };
  
  return error ? 
  (
    <div>{error}</div>
  ) : data ?
  (
    <div className="dash-staged-tableset">
      <div className="missing-items-subheader">
        <p>Market: {market}</p>
        <p>Count: {count}</p>
      </div>
      <table className="missing-items-table">
        <thead>
          <tr className="header-row">
            <th
              onClick={() => requestSort('itemCode')}
              className={getClassNamesFor('itemCode')}
            >Item Code</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? 
          (
            items.map((item, key) => (
              <tr key={key}>
                <td>{item.itemCode}</td>
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
  ) : '';
};

export default Missing;
