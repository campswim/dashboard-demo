import React from 'react';
import { useLocation } from 'react-router-dom';
import Signin from './signin';


const Login = (props) => {
  let loggedIn = props?.loggedIn;  
  const params = useLocation();
  const state = params?.state;
  const user = state?.user;

  if (loggedIn) loggedIn = parseInt(loggedIn);
  
  return ( 
    <div className='login-container'>
      <Signin profile={user ? user : { action: 'Sign In' }} message={state?.message} liftData={props ? props.liftData : ''} liftUser={props.liftUser} clearError={props ? props.error : ''} signedIn={loggedIn} signUp={props.signUp} />
    </div>
  );
}

export default Login;
