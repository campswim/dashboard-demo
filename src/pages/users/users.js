import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import User from './user';
import UserClass from '../../hooks/get-user';

const Users = (props) => {
  const [users, setUsers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const [error, setError] = useState('');
  const [rerender, setRerender] = useState(false);
  const currentTab = useRef(null);
  const params = useLocation();  
  const state = params?.state;

  // Set the current tab.
  const handleClick = (callerId) => {
    setRerender(!rerender);
    currentTab.current = callerId;
  }

  // Refresh the users page.
  const recall = path => {
  if (path) setIsLoaded(false);
   setRerender(!rerender);
  }

  // Get users from the db.
  useEffect(() => {
    let mounted = true;
    const user = new UserClass();
    
    if (mounted) {
      user.getAllUsers().then(
        res => {          
          if (res.data) {
            if (res.data.users) setUsers(Array.isArray(res.data.users) ? res.data.users : [res.data.users]);
            setIsLoaded(true);
            setError(null);
          } else if (res.name) {
            setError({code: res.name, message: res.message});
            setIsLoaded(true);
          }
        },
        err => {
          console.error({err});
          setError(err);
          setIsLoaded(false);
        }
      );
    }
    
    return () => mounted = false;
  }, [rerender]);
  
  // Set the user from local storage.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setLoggedInUser(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
    }
    return () => mounted = false;
  }, []);
  
  return !loggedInUser ? 
  ( // The user is not logged in, so return her to the log-in page.
    <Redirect to=
      {
        {
          pathname: '/login',
          state: {
            // id,
            action: 'Sign In',
            message: 'Please sign in.'
          },
        }
      }
    />
  ) 
  :
  (
    loggedInUser.restrictions.pages === 'None' || !loggedInUser.restrictions.pages.includes('Users') ?
    (
      !props.clearId ?
      (
        props.role !== 'User' ?
          <User 
            users={users} 
            isLoaded={isLoaded} 
            error={error} 
            handleClick={handleClick} 
            activeTab={currentTab.current} 
            recall={recall} 
            role={props.role} 
            action={state?.action} 
            id={state?.id} 
            message={state?.message} 
            liftData={props.liftData} 
            liftUser={props.liftUser} 
          />
        : <div className="role-denied">Your profile's assigned role of "{props.role}" does not allow you to access this page.</div>
      )
      : 
      (
        null
      )
    )
    :
    (
      <div className="role-denied">Your profile's assigned role of "{loggedInUser.role}" does not allow you to access this page.</div>
    )
  )
};

export default Users;
