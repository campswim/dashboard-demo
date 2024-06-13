import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import { getOrders } from '../../hooks/get-order';
import Unpulled from './unpulled';
import Unpushed from './unpushed';
import Ignored from './ignored';

const FailedOrders = () => {
  // Get state when passed from a link or redirect component.
  const params = useLocation();
  const state = params?.state;
  const { order, postPath, action, id, type } = state; // This is for user-initiated actions, not the get-all-failed called.
  
  const [getQuery, setGetQuery] = useState('failedPulls');
  const [click, setClick] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [tab, setTab] = useState('');
  const [unpushed, setUnpushed] = useState([]);
  const [unpulled, setUnpulled] = useState([]);
  const [ignored, setIgnored] = useState([]);
  const [error, setError] = useState(null);
  const [unpulledIsLoaded, setUnpulledIsLoaded] = useState(false);
  const [unpushedIsLoaded, setUnpushedIsLoaded] = useState(false);
  const [ignoredIsLoaded, setIgnoredIsLoaded] = useState(false);
  const [query, setQuery] = useState(getQuery);
  const [loggedIn, setloggedIn] = useState(localStorage.getItem('loggedIn') ? parseInt(localStorage.getItem('loggedIn')) : 0);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const restrictedActions = useRef(loggedInUser?.restrictions?.actions);

  const recallApi = newQuery => {
    if (newQuery === query) setQuery('');
    if (newQuery !== query) setQuery(newQuery);
  };

  // Handle the clicking of a tab.
  const handleClick = event => {
    event.preventDefault();
    const chosenPage = event.target.value;
    let activeButton, inactiveButton;

    setClick(true);    
    setCurrentPage(chosenPage);

    if (chosenPage) {
      if (chosenPage === getQuery) setGetQuery(null);
      else setGetQuery(chosenPage);
  
      activeButton = document.getElementById(chosenPage);
      activeButton.setAttribute('class', 'active-button');

      if (chosenPage === 'failedPulls') {
        inactiveButton = document.getElementById('failedPushes');
        inactiveButton.setAttribute('class', 'inactive-button');
        inactiveButton = document.getElementById('ignoredOrders');
        inactiveButton.setAttribute('class', 'inactive-button');
      } else if (chosenPage === 'failedPushes') {
        inactiveButton = document.getElementById('failedPulls');
        inactiveButton.setAttribute('class', 'inactive-button');
        inactiveButton = document.getElementById('ignoredOrders');
        inactiveButton.setAttribute('class', 'inactive-button');
      } else if (chosenPage === 'ignoredOrders') {
        inactiveButton = document.getElementById('failedPulls');
        inactiveButton.setAttribute('class', 'inactive-button');
        inactiveButton = document.getElementById('failedPushes');
        inactiveButton.setAttribute('class', 'inactive-button');
      }
    }
  };

  // Set the active and inactive tabs.
  useEffect(() => {
    let mounted = true;
    if (mounted && loggedIn) {
      // Set the active tab.
      if (!click) {
        if (tab && tab !== getQuery) setGetQuery(tab);
        if (getQuery) {
          const elementOne = document.getElementById(getQuery);
          const elementTwo = document.getElementById(getQuery === 'failedPulls' ? 'failedPushes' : 'failedPulls');
          
          if (elementOne) elementOne.setAttribute('class', 'active-button');
          if (elementTwo) elementTwo.setAttribute('class', 'inactive-button');
        }
      } else {
        setTab('');

        if (!getQuery) setGetQuery(currentPage);
        if (getQuery) {
          const elementOne = document.getElementById(getQuery);
          const elementTwo = document.getElementById(getQuery === 'failedPulls' ? 'failedPushes' : 'failedPulls');
          
          if (elementOne) elementOne.setAttribute('class', 'active-button');
          if (elementTwo) elementTwo.setAttribute('class', 'inactive-button');
        }
      }

      if (sessionStorage.getItem('action')) setClick(false);
    }
    return () => mounted = false;
  }, [action, click, currentPage, getQuery, loggedIn, state, tab]);
  
  // Set the tab state variable when a user clicks on a redirect link from the homepage.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (!click) {
        if (type && tab !== null) {
          if (type.includes('Failed')) setTab('failedPushes');
          else setTab('ignoredOrders');  
        }
      } else {
        setTab(null);
      }
    }
    return () => mounted = false;
}, [type, tab, getQuery, click]);

  // Get data from the db.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      getOrders(getQuery).then(
        res => {
          if (res?.data) {
            if (getQuery === 'failedPushes') {
              setUnpushed(res.data);
              setUnpushedIsLoaded(true);
              setUnpulledIsLoaded(false);
              setIgnoredIsLoaded(false);
              setError(null);
            } else if (getQuery === 'failedPulls') {
              setUnpulled(res.data);
              setUnpulledIsLoaded(true);
              setUnpushedIsLoaded(false);
              setIgnoredIsLoaded(false);
              setError(null);
            } else if (getQuery === 'ignoredOrders') {
              setIgnored(res.data);
              setIgnoredIsLoaded(true);
              setUnpulledIsLoaded(false);
              setUnpushedIsLoaded(false);
              setError(null);
            }
          } else if (res.name) {
            setError({name: res.name, message: res.message});
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
      return () => mounted = false;
    }
  }, [getQuery, query]);

  // Set the query path.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (id === 'order-details' && getQuery !== 'failedPushes') setQuery('failedPushes');
      else setQuery('failedPulls');
    }
    return () => mounted = false;
  }, [id, getQuery]);

  // Set the loggedIn and loggedInUser variables.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setloggedIn(localStorage.getItem('loggedIn') ? parseInt(localStorage.getItem('loggedIn')) : 0);
      setLoggedInUser(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
    }
    return () => mounted = false;
  }, []);
    
  return !loggedIn ? 
  ( // Redirect the user to the sign-in page when not logged in.
    <Redirect to={{
        pathname: '/login',
        state: {
          action: 'Sign In',
          message: 'Please sign in.'
        },
      }}
    />
  )
  : error ?
  ( // Render the error when there's an error.
    <div className="signin-error">{error?.message}</div>
  )
  :
  (
    loggedInUser && (loggedInUser.restrictions.pages === 'None' || !loggedInUser.restrictions.pages.includes('Failed Orders')) ?
    ( // Render the page.
      getQuery ? (
        <>
          <div className='order-actions'>
            <form>
              <button className='active-button' id='failedPulls' value='failedPulls' onClick={(e) => handleClick(e)}>
                Failed to Pull
              </button>
            </form>
            <form>
              <button id='failedPushes' value='failedPushes' onClick={(e) => handleClick(e)}>
                Failed to Push
              </button>
            </form>
            <form>
              <button className="inactive-button" id="ignoredOrders" value="ignoredOrders" onClick={(e) => handleClick(e)}>
                Ignored Orders
              </button>
            </form>
          </div>
          {getQuery === 'failedPulls' ? 
          (
            <Unpulled
              data={unpulled}
              error={error}
              isLoaded={unpulledIsLoaded}
              getQuery={getQuery}
              postPath={postPath}
              recall={recallApi}
              order={order}
              action={action}
              callerId={id}
              click={click}
              restrictedActions={restrictedActions.current}
            />
          ) : getQuery === 'failedPushes' ?
          (
            <Unpushed
              data={unpushed}
              error={error}
              isLoaded={unpushedIsLoaded}
              getQuery={getQuery}
              postPath={postPath}
              recall={recallApi}
              order={order}
              action={action}
              callerId={id}
              click={click}
              restrictedActions={restrictedActions.current}
              tab={type}
            />
          ) : getQuery === 'ignoredOrders' ?
          (
            <Ignored
              data={ignored}
              error={error}
              isLoaded={ignoredIsLoaded}
              getQuery={getQuery}
              postPath={postPath}
              recall={recallApi}
              order={order}
              action={action}
              callerId={id}
              click={click}
              restrictedActions={restrictedActions.current}
              tab={type}
            />
          ) : (
            ''
          )}
        </>
      ) : (
        null
      )  
    )
    :
    (
      <div className="role-denied">Your profile's assigned role of "{loggedInUser.role}" does not allow you to access this page.</div>
    )
  )
};

export default FailedOrders;
