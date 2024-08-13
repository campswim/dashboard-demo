import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import { getOrders } from '../../hooks/get-order';
import Unpulled from './unpulled';
import FailedToPush from './failed-to-push';
import Unpushed from './unpushed';
import Ignored from './ignored';

const FailedOrders = () => {
  // Get state when passed from a link or redirect component.
  const params = useLocation();
  const state = params?.state;
  const { order, postPath, action, id, type } = state ? state : ''; // This is for user-initiated actions, not the get-all-failed called.
  
  const [getQuery, setGetQuery] = useState('failedPulls');
  const [click, setClick] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [tab, setTab] = useState('');
  const [failedToPush, setFailedToPush] = useState([]);
  const [unpushed, setUnpushed] = useState([]);
  const [unpulled, setUnpulled] = useState([]);
  const [ignored, setIgnored] = useState([]);
  const [error, setError] = useState(null);
  const [unpulledIsLoaded, setUnpulledIsLoaded] = useState(false);
  const [failedToPushIsLoaded, setFailedToPushIsLoaded] = useState(false);
  const [unpushedIsLoaded, setUnpushedIsLoaded] = useState(false);
  const [ignoredIsLoaded, setIgnoredIsLoaded] = useState(false);
  const [query, setQuery] = useState(getQuery);
  const [loggedIn, setloggedIn] = useState(localStorage.getItem('loggedIn') ? parseInt(localStorage.getItem('loggedIn')) : 0);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [unpushedTab, setUnpushedTab] = useState('active-button');
  const [failedToPullTab, setFailedToPullTab] = useState('inactive-button');
  const [failedToPushTab, setFailedToPushTab] = useState('inactive-button');
  const [ignoredOrdersTab, setIgnoredOrdersTab] = useState('inactive-button');
  const restrictedActions = useRef(loggedInUser?.restrictions?.actions);

  const recallApi = newQuery => {    
    if (newQuery === query) setQuery('');
    if (newQuery !== query) setQuery(newQuery);
  };

  // Handle the clicking of a tab.
  const handleClick = event => {
    event.preventDefault();
    const chosenPage = event.target.value;

    setClick(true);
    setCurrentPage(chosenPage);

    if (chosenPage) {
      if (chosenPage === getQuery) setGetQuery(null);
      else setGetQuery(chosenPage);
      if (chosenPage === 'failedPulls') {
        setFailedToPullTab('active-button');
        setFailedToPushTab('inactive-button');
        setIgnoredOrdersTab('inactive-button');
        setUnpushedTab('inactive-button');
      } else if (chosenPage === 'failedPushes') {
        setFailedToPushTab('active-button');
        setFailedToPullTab('inactive-button');
        setIgnoredOrdersTab('inactive-button');
        setUnpushedTab('inactive-button');
      } else if (chosenPage === 'ignoredOrders') {
        setIgnoredOrdersTab('active-button');
        setFailedToPullTab('inactive-button');
        setFailedToPushTab('inactive-button');
        setUnpushedTab('inactive-button');
      } else { // The chosen page === 'unpushed'
        setUnpushedTab('active-button');
        setIgnoredOrdersTab('inactive-button');
        setFailedToPullTab('inactive-button');
        setFailedToPushTab('inactive-button');
      }
    }
  };

  // Set the active and inactive tabs.
  useEffect(() => {
    let mounted = true;
    if (mounted && loggedIn) {
      // Set the active tab.
      if (!click) { // Redirect from the homepage.
        if (tab) {
          setGetQuery(tab);
          if (tab === 'failedPushes') {
            setFailedToPushTab('active-button');
            setFailedToPullTab('inactive-button');
            setIgnoredOrdersTab('inactive-button');
            setUnpushedTab('inactive-button');
          } else if (tab === 'ignoredOrders') {
            setIgnoredOrdersTab('active-button');
            setFailedToPullTab('inactive-button');
            setFailedToPushTab('inactive-button');
            setUnpushedTab('inactive-button');
          } else if (tab === 'unpushedNoFail') {
            setUnpushedTab('active-button');
            setIgnoredOrdersTab('inactive-button');
            setFailedToPullTab('inactive-button');
            setFailedToPushTab('inactive-button');
          }
        }
      } else { // Click by user of a tab on the failed-orders page.
        setTab('');

        if (!getQuery) setGetQuery(currentPage);
        if (getQuery) {
          if (getQuery === 'failedPulls') {
            setFailedToPullTab('active-button');
            setFailedToPushTab('inactive-button');
            setIgnoredOrdersTab('inactive-button');
            setUnpushedTab('inactive-button');
          } else if (getQuery === 'failedPushes') {
            setFailedToPushTab('active-button');
            setFailedToPullTab('inactive-button');
            setIgnoredOrdersTab('inactive-button');
            setUnpushedTab('inactive-button');
          } else if (getQuery === 'ignoredOrders') {
            setIgnoredOrdersTab('active-button');
            setFailedToPullTab('inactive-button');
            setFailedToPushTab('inactive-button');
            setUnpushedTab('inactive-button');
          } else if (getQuery === 'unpushedNoFail') {
            setUnpushedTab('active-button');
            setIgnoredOrdersTab('inactive-button');
            setFailedToPullTab('inactive-button');
            setFailedToPushTab('inactive-button');
          }
        }
      }

      if (sessionStorage.getItem('action')) setClick(false);
    }
    return () => mounted = false;
  }, [click, currentPage, getQuery, loggedIn, tab]);
  
  // Set the tab state variable.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (!click) {
        if (type && tab !== null) {
          if (type.includes('Failed')) setTab('failedPushes');
          else if (type === 'Unpushed') setTab('unpushedNoFail')
          else setTab('ignoredOrders');  
        }
      } else {
        setTab(null);
      }
    }
    return () => mounted = false;
}, [type, tab, click]);

  // Get data from the db.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      getOrders(getQuery).then(
        res => {          
          if (res?.data) {
            if (getQuery === 'failedPushes') {
              setFailedToPush(res.data);
              setFailedToPushIsLoaded(true);
              setUnpulledIsLoaded(false);
              setUnpushedIsLoaded(false);
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
            } else if (getQuery === 'unpushedNoFail') {
              setUnpushed(res.data);
              setUnpushedIsLoaded(true);
              setUnpulledIsLoaded(false);
              setFailedToPushIsLoaded(false);
              setIgnoredIsLoaded(false);
              setError(null);
            }

            setIsLoaded(true);
          } else if (res?.name) {
            setError({name: res.name, message: res.message});
            setIsLoaded(false);
          } 
        },
        err => {
          console.error({err});
          setError(err);
          setUnpulledIsLoaded(true);
          setFailedToPushIsLoaded(true);
          setUnpushedIsLoaded(true);
          setIgnoredIsLoaded(true);
          setIsLoaded(true);
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
  : isLoaded ?
  (
    loggedInUser && (loggedInUser.restrictions.pages === 'None' || !loggedInUser.restrictions.pages.includes('Failed Orders')) ?
    ( // Render the page.
      getQuery ? (
        <>
          <div className='order-actions'>
            <form>
              <button 
                className={unpushedTab}
                id='unpushedNoFail' 
                value='unpushedNoFail' 
                onClick={(e) => handleClick(e)}
              >
                Unpushed
              </button>
            </form>
            <form>
              <button 
                className={failedToPullTab}
                id='failedPulls' 
                value='failedPulls' 
                onClick={(e) => handleClick(e)}
              >
                Failed to Pull
              </button>
            </form>
            <form>
              <button 
                className={failedToPushTab}
                id='failedPushes' 
                value='failedPushes' 
                onClick={(e) => handleClick(e)}
              >
                Failed to Push
              </button>
            </form>
            <form>
              <button 
                className={ignoredOrdersTab}
                id="ignoredOrders" 
                value="ignoredOrders" 
                onClick={(e) => handleClick(e)}
              >
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
            <FailedToPush
              data={failedToPush}
              error={error}
              isLoaded={failedToPushIsLoaded}
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
          ) 
          : getQuery === 'unpushedNoFail' ?
          (
            <Unpushed
              data={unpushed}
              error={error}
              isLoaded={!unpushedIsLoaded && unpushed.length > 0 ? true : unpushed}
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
          )
          : getQuery === 'ignoredOrders' ?
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
  :
  (
    null
  )
};

export default FailedOrders;
