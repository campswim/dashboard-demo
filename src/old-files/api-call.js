import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Staged from '../pages/home/staged/staged';

const Api = props => {
  const [staged, setStaged] = useState([]);
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
          setStaged(res.data);
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
    return () => (mounted = false);
  }, [props.path]);

  return (
    <>
      <Staged
        data={staged}
        error={error}
        isLoaded={isLoaded}
        path={props.path}
        subheader={props.subheader}
      />
    </>
  );
};

export default Api;
