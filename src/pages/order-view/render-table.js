import React, {useCallback, useState } from 'react';
import RenderDetails from './order-details';
import formatCurrency from '../../hooks/format-currency';

const RenderOrderTable = props => {
  const [actionType, setActionType] = useState(null);
  const [actionLink, setActionLink] = useState(null);
  const [path, setPath] = useState(null);
  let order;

  // Because mongo sometimes returns the order in an array, the following logic:
  if (props.order)
    if (Object.prototype.toString.call(props.order) === '[object Object]')
      order = props.order;
    else order = props.order[0];
  
  let currency;
  if (order && order.currencyCode && props.status === 200) {
    if (order.currencyCode.includes('Z'))
    currency =
      order.currencyCode === 'Z-PHP'
        ? 'PHP'
        : order.currencyCode === 'Z-C$'
        ? 'CAD'
        : order.currencyCode === 'Z-MXN'
        ? 'MXN'
        : 'USD';
    else currency = order.currencyCode;
  }
  const renderLinks = useCallback((jsx, type, path) => {
    setActionType(type);
    setActionLink(jsx);
    if (jsx !== null) setPath(path);
  }, []);

  return !order && props.status !== 200 ? (
    <div className='order-view-container'>
      <div className='order-view-header'>
        <h3>{props.title} Order Summary: {props.orderId}</h3>
      </div>
      <RenderDetails
        order={order ? order.orderlines : null}
        payment={order ? order.payments : null}
        currency={currency}
        orderId={props.orderId}
        shipping={order ? order.freightAmount : null}
        shippingTax={order ? order.freightTaxAmount : null}
        path={props.path}
        error={order ? order.errorMessage : null}
        renderLinks={renderLinks}
        status={props.status}
      />
    </div>
    
    ) : (
    <div className='order-view-container'>
      <div className='order-view-header'>
      <h3>{props.title} Order Summary: {props.orderId}</h3>
        {actionType && actionType === 'action' ? (
          <>
            {path && path !== 'GpOrders' ? (
              <div className='action-links'>{actionLink}</div>
            ) : (
              ''
            )}
          </>
        ) : (
          ''
        )}
      </div>
      <div className="order-view-summary">
        <table className="order-summary-table-1">
          <thead>
            <tr className='header-row'>
              <th className="order-view-summary-col-header">Customer</th>
              <th className="order-view-summary-col-header">Market</th>
              <th className="order-view-summary-col-header">Warehouse</th>
              <th className="order-view-summary-col-header">Currency</th>
              <th className="order-view-summary-col-header">Order</th>
              <th className="order-view-summary-col-header">Payment</th>
            </tr>
          </thead>
          {props.status === 200 && order !== 'Request failed with status code 404' && order !== undefined ? (
            <tbody>
              <tr>
                <td>{order.customerNumber ? order.customerNumber : 'N/A'}</td>
                <td>{order.market ? order.market : 'N/A'}</td>
                <td>{order.warehouse ? order.warehouse : 'N/A'}</td>
                <td>{order.currencyCode ? order.currencyCode.toUpperCase() : null}</td>
                <td style={order.orderTotalAmount !== order.payments.reduce((acc,val) => ( acc + val.paymentAmount), 0) ? {color: 'orange'} : null}>
                  {formatCurrency(
                    order.orderTotalAmount,
                    currency
                  )}
                </td>
                <td style={order.orderTotalAmount !== order.payments.reduce((acc,val) => ( acc + val.paymentAmount), 0) ? {color: 'orange'} : null}>
                  {formatCurrency(order.payments.reduce((acc, val) => (
                    acc + val.paymentAmount
                  ), 0))}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td>None</td>
                <td>None</td>
                <td>None</td>
                <td>None</td>
                <td>None</td>
                <td>None</td>
              </tr>
            </tbody>
          )}
        </table>
        <div className="order-summary-table-2-container">
          <table className="order-summary-table-2">
            <thead>
              <tr className='header-row'>
                <th className="order-view-summary-col-header">Shipping</th>
                <th className="order-view-summary-col-header">Shipping Tax</th>
                <th className="order-view-summary-col-header">Ordered</th>
                <th className="order-view-summary-col-header">Shipped</th>
                <th className="order-view-summary-col-header">Created</th>
              </tr>
            </thead>
            {props.status === 200 && order && order !== 'Request failed with status code 404' ? (
            <tbody>
              <tr>
                <td>
                    {formatCurrency(
                      order.freightAmount,
                      currency
                    )}
                  </td>
                  <td>
                    {formatCurrency(
                      order.freightTaxAmount,
                      currency
                    )}
                  </td>
                  <td>
                    {order.orderDate ? order.orderDate.split('T')[0] : 'N/A'}
                  </td>
                  <td>
                    {order.shipDate ? order.shipDate.split('T')[0] : 'N/A'}
                  </td>
                  <td>
                    {order.createdDate ? order.createdDate.split('T')[0]: 'N/A'}{' '}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td>None</td>
                  <td>None</td>
                  <td>None</td>
                  <td>None</td>
                  <td>None</td>
                </tr>
              </tbody>
            )}
          </table>
          <table className="order-summary-table-2">
            <thead>
              <tr className='header-row'>
                <th className="order-view-summary-col-header">
                  <div className='error-actions'>
                    Error
                    {actionType && actionType === 'error' ? <span className='error-link-container'>{actionLink}</span> : ('')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="error-message">
                {props.status === 200 && order && order !== 'Request failed with status code 404' ? (
                  order.errorMessage && order.errorMessage.includes('\r\n') ? (
                    order.errorMessage.split('\r\n').join('')
                  ) : order.errorMessage && !order.errorMessage.includes('\r\n') ? (  
                    order.errorMessage
                  ) : (
                    'None'
                  ) 
                ) : (
                  'None'
                )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <RenderDetails
        order={order ? order.orderlines : null}
        payment={order ? order.payments : null}
        currency={currency}
        orderId={props.orderId}
        shipping={order ? order.freightAmount : null}
        shippingTax={order ? order.freightTaxAmount : null}
        path={props.path}
        error={order ? order.errorMessage : null}
        renderLinks={renderLinks}
        status={props.status}
      />
    </div>
  );
};

export default RenderOrderTable;
