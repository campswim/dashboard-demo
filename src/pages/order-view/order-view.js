import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Api from './api-call';

const OrderView = props => {
  const [orderId, setOrderId] = useState(null);
  const params = useLocation();
  const routes = ['CrmOrders', 'StagingOrders', 'GpOrders'];

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (params.state) {
        const order = parseInt(params.state.order);
        if (order !== orderId) {
          props.getId(order);
          setOrderId(order);
        }
      }
    }

    return () => mounted = false;
  }, [orderId, params.state, props]);

  return orderId ? (
    <div className="order-view-parent">
      {routes.map((route, key) => 
          <Api key={key} order={orderId} path={route} />
      )}
    </div>
  ) : (
    <p className='no-order-id'>Enter an order number or click on one from the list in Failed Orders.</p>
  );
};

export default OrderView;
