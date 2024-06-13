import React from 'react';

const StagedOne = props => {
  return props.error ? (
    <div>Error: {props.error.message}</div>
  ) : !props.isLoaded ? (
    <div>Loading...</div>
  ) : props.path && props.path.includes('stagingOrders/summary/1') ? (
    <table>
      <thead>
        <tr>
          <th>Market</th>
          <th>Order Count</th>
          <th>Order Title</th>
        </tr>
      </thead>
      {props.stagedOrders.map((item, key) => (
        <tbody key={key}>
          <tr>
            <td>{item.market}</td>
            <td>{item.orderCount}</td>
            <td>{item.totalAmount}</td>
          </tr>
        </tbody>
      ))}
    </table>
  ) : (
    ''
  );
};

export default StagedOne;
