import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useSort from '../../hooks/sort-data';
import formatCurrency from '../../hooks/format-currency';

const RenderDetails = ({ order, payment, currency, orderId, shipping, shippingTax, path, error, renderLinks, status }) => {
  const [width, setWidth] = useState(window.innerWidth);
  const [toggleOrderDetails, setToggleOrderDetails] = useState(false);
  const [detailsIcon, setDetailsIcon] = useState('+');

  let totalQuantity = 0;
  let totalTax = 0;
  // let totalUnitPrices = 0;
  let subTotalArray = [];
  let orderSubTotal = 0;
  let paymentTotal = 0;

  if (order) {
    subTotalArray = order.reduce((acc, val) => {
      acc = [...acc, (val.extTaxAmount ? val.extTaxAmount + (val.quantity * val.unitPrice) : (val.unitTaxAmount * val.quantity)  + (val.quantity * val.unitPrice))];
      return acc;
    }, []);
    order.map((item, idx) => item.subtotal = subTotalArray[idx]);
     // Determine the totals for the quantity, tax, and unit prices.
     for (let i = 0; i <= order.length; i++) {
      if (order[i]) {
        totalQuantity += order[i].quantity;
        // totalUnitPrices += order[i].unitPrice;
        totalTax += order[i].extTaxAmount && order[i].extTaxAmount > 0 ? order[i].extTaxAmountorder : order[i].quantity * order[i].unitTaxAmount;
      }
    }
  }

  // Append the subtotals to each item object.
  if (subTotalArray) {
    orderSubTotal = subTotalArray.reduce((acc, val) => {
      return acc = acc + val;
    }, 0);
  }

  if (payment) {
    paymentTotal = payment.reduce((acc, val) => {
      acc = acc + val.paymentAmount;
      return acc;
    }, 0);
  }
 
  const { items, requestSort, sortConfig } = useSort(order ? order : payment ? payment : null, order ? 'order-details' : payment ? 'payment-details' : 'null');
  const getClassNamesFor = name => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  const showOrderDetails = () => {
      setToggleOrderDetails(!toggleOrderDetails);
      if (detailsIcon === '+') setDetailsIcon('–');
      else setDetailsIcon('+');
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const handleResize= () => setWidth(window.innerWidth);
      window.onresize = handleResize;
      const paymentHeader = document.getElementsByClassName('payment-header-text');
  
      const shortHeaderText = () => {
        for (let text of paymentHeader) {
          if (text.innerHTML === 'Payment Type') text.innerHTML = 'Type';
          if (text.innerHTML === 'Card Number') text.innerHTML = 'Card';
          if (text.innerHTML === 'Payment Date') text.innerHTML = 'Date';
          if (text.innerHTML === 'Total Paid') text.innerHTML = 'Paid';
        } 
      }
  
      const longHeaderText = () => {
        for (let text of paymentHeader) {
          if (text.innerHTML === 'Type') text.innerHTML = 'Payment Type';
          if (text.innerHTML === 'Card') text.innerHTML = 'Card Number';
          if (text.innerHTML === 'Date') text.innerHTML = 'Payment Date';
          if (text.innerHTML === 'Paid') text.innerHTML = 'Total Paid';
        }
      };
    
      if (width > 955) {
        longHeaderText();
      } else shortHeaderText()
    }

    return () => mounted = false;
  }, [width, currency, orderSubTotal, totalQuantity]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const apiCall = path => {
        axios({
          method: 'POST',
          baseURL: process.env.REACT_APP_API,
          url: path,
          data: [orderId.toString()],
        }).then(
          res => {
          },
          err => {
            throw new Error(err);
          }
        );
      }
    
      const action = path => {
        if (path) apiCall(path);
      };

      const actionLinks = (
        status === 200 ? (
          path === 'CrmOrders' ? (
          <div className='action-links'>
            <form onClick={() => action('CrmOrders/Repull')} className='link'>
              <Link 
                to={{
                  pathname: '/failed-orders',
                  state: {
                    order:orderId,
                    defaultPath: path,
                    action: 'Pull',
                    id: 'order-details',
                  }
                }}
              >
                Pull to Staging
              </Link>
            </form>
          </div>
          ) : path === 'StagingOrders' ? (
          <div className='action-links'>
            <form onClick={() => action('StagingOrders/Retry')} className='link'>
              <Link 
                to={{
                  pathname: '/failed-orders',
                  state: {
                    order:orderId,
                    defaultPath: path,
                    action: 'Push',
                    id: 'order-details',
                  }
                }}
              >
                Push to GP
              </Link>
            </form>
          </div>
          ) : (
            null
          )
        ) : (
          null
        )
      );

      const errorLinks = (
        error ? (
          path === 'CrmOrders' ? (
            <div className='action-links'>
              <form onClick={() => action('CrmOrders/Repull')} className='link'>
                <Link
                  to={{
                    pathname: '/failed-orders',
                    state: {
                      order: orderId,
                      postPath: path,
                      action: 'Repull',
                      id: 'order-details',
                    },
                  }}
                >
                  Repull
                </Link>
              </form>
              <form onClick={() => action('CrmOrders/RepullAllowMismatch')} className='link'>
                <Link
                  to={{
                    pathname: '/failed-orders',
                    state: {
                      order: orderId,
                      postPath: path,
                      action: 'RepullAllowMismatch',
                      id: 'order-details',
                    },
                  }}
                >
                  Repull with Mismatch
                </Link>
              </form>
            </div>
          ) : path === 'StagingOrders' ? (
            <div className='action-links'>
              <form onClick={() => action('StagingOrders/Retry')} className='link'>
                <Link
                  to={{
                    pathname: '/failed-orders',
                    state: {
                      order: orderId,
                      postPath: path,
                      action: 'Repush',
                      id: 'order-details',
                    },
                  }}
                >
                  Repush
                </Link>
              </form>
            </div>
          ) : (
            ''
          )
        ) : (
          ''
        )
      );
    
      if (error) renderLinks(errorLinks, 'error', path);
      else renderLinks(actionLinks, 'action', path);
    }
    
    return () => mounted = false;
  }, [error, orderId, path, renderLinks, status]);
  
  return order && payment ? (
    <div className="order-details-container">
      <div className="order-details-table-header" onClick={showOrderDetails}>
        <h4 className="expand-order-details-icon">{detailsIcon}</h4>
        <div className={`expand-order-details-header ${toggleOrderDetails}`}>
          <h4 id="od">Order Details: </h4>
          <h4>Line Count ({order.length}) &#8594;</h4>
          <h4>Subtotal ({formatCurrency(orderSubTotal, currency)}) &#8594;</h4>
          <h4>Paid ({formatCurrency(paymentTotal, currency)}) </h4>
        </div>
      </div>
      <div className={`order-details-tables ${toggleOrderDetails}`}>
        <table className="order-details-table-1">
          <thead>
            <tr className="header-row">
              <th               
                onClick={() => requestSort('lineNumber')}
                className={`order-details-header ${getClassNamesFor('lineNumber')}`}
              >
                {' '} Details ({order.length})
              </th>
              <th               
                onClick={() => requestSort('sku')}
                className={`order-details-header ${getClassNamesFor('sku')}`}
              >
                SKU
              </th>
              <th               
                onClick={() => requestSort('quantity')}
                className={`order-details-header ${getClassNamesFor('quantity')}`}
              >
                Quantity ({totalQuantity})
              </th>
            </tr>
          </thead>
          <tbody className="order-details-lineitems">
            {items.map((item, key) => (
              <tr key={key}>
                <td>{item.lineNumber}</td>
                <td id="sku">{item.sku}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="order-details-table-2">
          <thead>
            <tr className="header-row">
            <th               
                onClick={() => requestSort('lineNumber')}
                id="line-number"
                className={`order-details-header ${getClassNamesFor('lineNumber')}`}
              >
                Details ({order.length})
              </th>
              <th               
                onClick={() => requestSort('unitPrice')}
                className={`order-details-header ${getClassNamesFor('unitPrice')}`}
              >
                Price
              </th>
              <th               
                onClick={() => requestSort('unitTaxAmount')}
                className={`order-details-header ${getClassNamesFor('unitTaxAmount')}`}
              >
                Ext. Tax ({formatCurrency(totalTax, currency)})
              </th>
              <th               
                onClick={() => requestSort('subtotal')}
                className={`order-details-header ${getClassNamesFor('subtotal')}`}
              >
                Subtotal ({formatCurrency(orderSubTotal, currency)})
              </th>
            </tr>
          </thead>
          <tbody className="order-details-lineitems">
            {items.map((item, key) => (
              <tr key={key}>
                <td id="line-number">{item.lineNumber}</td>
                <td className="money">
                  {formatCurrency(
                    item.unitPrice,
                    currency
                  )}
                </td>
                <td className="money">
                  {formatCurrency(
                    item.extTaxAmount ? item.extTaxAmount : item.unitTaxAmount ? item.unitTaxAmount * item.quantity : 0,
                    currency
                  )}
                </td>
                <td className="money">
                  {formatCurrency(item.subtotal, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payment.length > 0 ? (
        <table className={`payment-details ${toggleOrderDetails}`}>
          <thead className="payment-header">
            <tr className='header-row'>
              <th className="payment-header-text">Payment Type</th>
              <th className="payment-header-text">Card Number</th>
              <th className="payment-header-text">Payment Date</th>
              <th className="money payment-header-text">Total Paid</th>
            </tr>
          </thead>
          <tbody>
            {payment.map((item, key) => (
              <tr key={key}>
                <td>{item.paymentType}</td>
                <td>{item.cardNumber ? item.cardNumber : 'N/A'}</td>
                <td className="payment-date">
                  {item.paymentDate.split('T')[0]}
                </td>
                <td className="money">
                  {formatCurrency(
                    item.paymentAmount,
                    currency
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
      <table>
        <thead>
          <tr>
          <th className="payment-header-text">Payment Type</th>
              <th className="payment-header-text">Card Number</th>
              <th className="payment-header-text">Payment Date</th>
              <th className="payment-header-text">Total Paid</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>N/A</td>
            <td>N/A</td>
            <td>N/A</td>
            <td>N/A</td>
          </tr>
        </tbody>
        </table>
      )
    }
  </div>
  ) : (
  <div className='no-order-details'>
    {' '}
    No order or payment details are available. If you see this message in all
    three categories, check the order number for accuracy.{' '}
  </div>
  );
};

export default RenderDetails;
