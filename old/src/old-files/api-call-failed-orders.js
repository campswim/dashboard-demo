import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Unpulled from '../pages/failed-orders/unpulled';
import Unpushed from '../pages/failed-orders/unpushed';
import Ignored from '../pages/failed-orders/ignored';

const Api = props => {
  const [unpushed, setUnpushed] = useState([]);
  const [unpulled, setUnpulled] = useState([]);
  const [ignored, setIgnored] = useState([]);
  const [error, setError] = useState(null);
  const [unpulledIsLoaded, setUnpulledIsLoaded] = useState(false);
  const [unpushedIsLoaded, setUnpushedIsLoaded] = useState(false);
  const [ignoredIsLoaded, setIgnoredIsLoaded] = useState(false);
  const [query, setQuery] = useState(props.getQuery);
    
  const recallApi = newQuery => {
    if (newQuery === query) setQuery('');
    if (newQuery !== query) setQuery(newQuery);
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      let queryString = `query ${props.getQuery} {${props.getQuery} `;
      queryString += 'failedPushes' === props.getQuery ? `{OrderNumber Market Warehouse OrderTotalAmount CustomerNumber OrderDate StagingImportDate, ErrorCode, ErrorMessage}}` : 'failedPulls' === props.getQuery ? `{Id, OrderNumber, OrderDate, OrderTotal, CurrencyCode, Message, At, IgnoredAt, Exception}}` : `{Type OrderNumber OrderDate OrderTotal CurrencyCode IgnoredDate Message}}`;
      
      const graphQlQuery = {
        operation: props.getQuery,
        query: queryString,
        variables: {}
      };
    
      const options = {
        method: 'POST',
        url: process.env.REACT_APP_API,
        data: JSON.stringify(graphQlQuery),
        headers: {'Content-Type': 'application/json'}
      };
  
      axios.request(options).then(
        res => {
          if (props.getQuery === 'failedPushes') {
            setUnpushed(res.data);
            setUnpushedIsLoaded(true);
            setUnpulledIsLoaded(false);
            setIgnoredIsLoaded(false);
            setError(null);
          } else if (props.getQuery === 'failedPulls') {
            setUnpulled(res.data);
            setUnpulledIsLoaded(true);
            setUnpushedIsLoaded(false);
            setIgnoredIsLoaded(false);
            setError(null);
          } else if (props.getQuery === 'ignoredOrders') {
            setIgnored(res.data);
            setIgnoredIsLoaded(true);
            setUnpulledIsLoaded(false);
            setUnpushedIsLoaded(false);
            setError(null);
          }
        },
        err => {
          console.error({err});
          if (mounted) {
            setError(err);
            setUnpulledIsLoaded(true);
            setUnpushedIsLoaded(true);
            setIgnoredIsLoaded(true);
          }
        }
      );
      // setQuery(null);
    }

    return () => mounted = false;
  }, [props.getQuery, query]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (props.callerId === 'order-details' && props.getQuery !== 'failedPushes') 
        setQuery('failedPushes');
      else setQuery('failedPulls');
    }
    return () => mounted = false;
  }, [props.callerId, props.getQuery]);
  
  return (
    <>
      {props.getQuery === 'failedPulls' ? 
      (
        <Unpulled
          data={unpulled}
          error={error}
          isLoaded={unpulledIsLoaded}
          getQuery={props.getQuery}
          postPath={props.postPath}
          recall={recallApi}
          order={props.order}
          action={props.action}
          callerId={props.callerId}
        />
      ) : props.getQuery === 'failedPushes' ?
      (
        <Unpushed
          data={unpushed}
          error={error}
          isLoaded={unpushedIsLoaded}
          getQuery={props.getQuery}
          postPath={props.postPath}
          recall={recallApi}
          order={props.order}
          action={props.action}
          callerId={props.callerId}
        />
      ) : props.getQuery === 'ignoredOrders' ?
      (
        <Ignored
          data={ignored}
          error={error}
          isLoaded={ignoredIsLoaded}
          getQuery={props.getQuery}
          postPath={props.postPath}
          recall={recallApi}
          order={props.order}
          action={props.action}
          callerId={props.callerId}
        />
      ) : (
        ''
      )}
    </>
  );
};

export default Api;
