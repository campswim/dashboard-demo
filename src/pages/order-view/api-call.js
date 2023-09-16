import React, { useEffect, useState } from 'react';
import RenderOrderTable from './render-table';
import axios from 'axios';

const Api = props => {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (props.order && props.path) {
      axios({
        method: 'get',
        baseURL: process.env.REACT_APP_API,
        url: `${props.path}/${props.order}`,
      }).then(
        res => {
          if (mounted) {
              setOrder(res.data);
              setStatus(res.status);
              setIsLoaded(true);
          }
        },
        err => {
          if (mounted) {
              setError(err.message);
              if (err.status) setStatus(err.response.status);
              else if (err.message.includes('network')) setStatus(500);
              else if (err.message.includes('404')) setStatus(404);
              setIsLoaded(true);
          }
        }
      );
    }
    return () => mounted = false;
  }, [props]);
  
  return !isLoaded ? (
    <div>Loading...</div>
  ) : (
    <RenderOrderTable
      order={order}
      status={status}
      path={props.path}
      orderId={props.order}
      title={props.path === 'CrmOrders' ? 'CRM' : props.path === 'StagingOrders' ? 'Staged' : props.path === 'GpOrders' ? 'GP' : null}
      error={error}
    />
  );
};

export default Api;
