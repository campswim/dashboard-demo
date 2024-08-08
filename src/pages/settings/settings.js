import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { getSettings } from '../../hooks/get-settings';
import Map from './map';
import Params from './params';

const SettingsPage = () => {
  const [path, setPath] = useState('maps');
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [maps, setMaps] = useState([]);
  const [params, setParams] = useState([]);
  const [loggedIn, setloggedIn] = useState(localStorage.getItem('loggedIn') ? parseInt(localStorage.getItem('loggedIn')) : 0);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const [mapsTab, setMapsTab] = useState('active-button');
  const [paramsTab, setParamsTab] = useState('inactive-button');
  const handleSubmit = event => event.preventDefault();

  // Click handler: which tab to show, maps or params.
  const handleClick = event => {    
    let chosenButton;

    // Set the chosen-button variable.
    if (typeof event === 'object') {
      event.preventDefault();
      if (event.target.value !== path) {
        setIsLoaded(false);
        setPath(event.target.value);
        chosenButton = event.target.id;
      }
    } else {
      if (event !== path) {
        setIsLoaded(false);
        setPath('');
        setPath(event);
        chosenButton = event;
      }
    }

    if (chosenButton) { // 'maps' or 'params'
      if (chosenButton === 'maps') {
        setMapsTab('active-button');
        setParamsTab('inactive-button');
      } else  {
        setMapsTab('inactive-button');
        setParamsTab('active-button');
      }
    }
  };

  // Rerender the page after an edit.
  const recall = (path) => {
    setPath(null);
    setPath(path)
  };

  // Get data from the db.
  useEffect(() => {
    let mounted = true;
    if (mounted && path) {
      getSettings(path).then(
        res => {
          if (res) {            
            if (!res.name) {
              const errors = res?.errors;
              
              if (errors && errors.length > 0) {
                path === 'maps' ? setMaps(res.errors) : setParams(res.errors);
              } else if (!res.errors && res?.data) {
                path === 'maps' ? setMaps(res.data[path]) : setParams(res.data[path]);
                setIsLoaded(true);
                setError(null);
              }
            } else {
              setError({code: res?.name, message: res?.message});
              setIsLoaded(false);
            }
          }
        },
        err => {
          if (mounted) {
            setError(err);
            setIsLoaded(false);
          }
        }
      );
    }
    return () => mounted = false;
  }, [path]);

  // Set the user from local storage.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setloggedIn(localStorage.getItem('loggedIn') ? parseInt(localStorage.getItem('loggedIn')) : 0);
      setLoggedInUser(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
    }
    return () => mounted = false;
  }, []);
  
  console.log({error});

  return !loggedIn ?
  (
    <Redirect to={
        {
          pathname: '/login',
          state: {
            action: 'Sign In',
            message: 'Please sign in.'
          },
        }
      }
    />
  )
  : error ?
  (
    <div className="signin-error">{error?.message ? error.message : error}</div>
  )
  : loggedInUser?.role !== 'Admin' ? 
  (
    <div className="role-denied">Your profile's assigned role of "{loggedInUser.role}" does not allow you to access this page.</div>
  )
  : isLoaded ?
  (
    loggedInUser && (loggedInUser.restrictions.pages === 'None' || !loggedInUser.restrictions.pages.includes('Settings')) ?
    (
      <>
        <div className='order-actions'>
          <form onSubmit={handleSubmit}>
            <button 
              // ref={mapsTab} 
              className={mapsTab} 
              id="maps" 
              value="maps" 
              onClick={handleClick}
            >
              Warehouse Map
            </button>
            <button 
              // ref={paramsTab} 
              className={paramsTab}
              id="params" 
              value="params" 
              onClick={handleClick}
            >
              Parameters
            </button>
          </form>
        </div>
        {path === 'params' ?
          <Params
            paramsData={params}
            error={error}
            isLoaded={isLoaded}
            path={path}
            role={loggedInUser?.role}
            recall={recall}
            user={loggedInUser}
          />
        : path === 'maps' ?
          <Map 
            mapData={maps} 
            error={error} 
            isLoaded={isLoaded} 
            path={path}
            role={loggedInUser?.role}
            recall={recall}
            user={loggedInUser}
          />
        : null
        }
      </>
    )
    :
    (
      <div className="role-denied">Your profile's assigned role of "{loggedInUser.role}" does not allow you to access this page.</div>
    )
  )
  :
  (
    null
  )
};

export default SettingsPage;
