import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pushed from './pushed';

const Api = (props) => {
  const [pushed, setPushed] = useState([]);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    axios({
      method: 'get',
      baseURL: process.env.REACT_APP_API,
      url: props.path,
    }).then(
      res => {
        if (mounted) {
          setPushed(res.data);
          setIsLoaded(true);
        }
      },
      err => {
        if (mounted) {
          setError(err);
          setIsLoaded(true);
        }
      }
    );
    return () => mounted = false;
  }, [props.path]);

  return (
    <>
      <Pushed
        data={pushed}
        error={error}
        isLoaded={isLoaded}
        path={props.path}
      />
    </>
  );
};

export default Api;
