import React, { useState, useEffect, useRef } from 'react';
import {  Redirect } from 'react-router-dom';
import User from '../../hooks/get-user';

const Signin = ({ profile, message, liftData, liftUser, signUp }) => {
  const [username, setUsername] = useState(profile && (profile.email || profile.email === '') ? profile.email : 'demo@demo.demo');
  const [password, setPassword] = useState(profile && (profile.password || profile.password === '') ? profile.password : 'demo');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [id, setId] = useState('');
  const [name, setName] = useState([]);
  const [role, setRole] = useState(profile?.role);
  const [roleName, setRoleName] = useState(null);
  const [roles, setRoles] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(0);
  const [renderSignUp, setRenderSignUp] = useState(signUp);
  const [changePassword, setChangePassword] = useState(false);
  const userAction = useRef(profile?.action);
  const userInfo = useRef(null);
  const user = new User();

  // Handle the clicking of the sign-in button.
  const handleSignIn = event => {
    event.preventDefault();
    document.getElementById('sign-in-button').innerText = 'Signing in . . . ';
    userAction.current = 'Sign In';
    user.email = username;
    setError(null);
        
    if (!changePassword) {
      // See if the user already exists in the db.
      user.getUserByEmail().then(
        res => {
          if (res.data) {
            const id = res.data?.userByEmail?.Id;
            
            if (id) { // We have a user.
              const activeUser = res.data?.userByEmail?.Active;
              const firstSignin = res.data?.userByEmail?.LastLogin;
              user.id = id;
              user.password = password;
              
              if (!activeUser) { // The user has been deactivated and should not be given access to the site.
                setError('This user profile has been deactivated.');
              } else { // The user is active.
                if (!firstSignin) { // Make the user change her password.
                  user.changePassword(true).then(  // arg => firstSignin
                    res => {
                      if (res) {
                        const id = res?.data?.changePassword?.Id;
                        const error = res?.data?.changePassword?.Error;
                        if (id && !error) {
                          const signInButton = document.getElementById('sign-in-button');
                          setChangePassword(true);
                          document.getElementById('new-password-first-field').focus();

                          if (signInButton) signInButton.innerText = 'Update';
                          setError('');
                          setId(id);
                          setPassword('');
                          setConfirmPassword('');
                        } else if (error) setError(error);
                      } else if (res.name) { // There was an error.
                        setError(res.message);
                      }
                    },
                    err => { console.error(err); }
                  );
                } else { // Make the API call to validate the user and generate/sign her token.
                  user.signIn().then(
                    res => {                      
                      if (res.data) {
                        const userData = res.data?.signin;
                        const error = userData?.Error;
                        setId(id);
                        
                        if (error) { // Print the error and reset the sign-in button's text.
                          setError(error);
                          document.getElementById('sign-in-button').innerText = 'Sign In';
                        } else {
                          if (userData) { // Get user restrictions from the db and add them to the user object in local storage.
                            user.getUserRestrictions(userData.RoleId).then(
                              res => {                                
                                if (res) {                                  
                                  const roleProfile = res?.data?.getUserRestrictions;
                                  const error = roleProfile?.Error;
                                
                                  if (!error) { // Build the user object to be stored in the browser.
                                    const userObject = {
                                      id: userData.Id,
                                      name: userData.Name,
                                      role: userData.Role,
                                      roleId: userData.RoleId,
                                      restrictions: {
                                        pages: roleProfile.RestrictedPages,
                                        actions: roleProfile.RestrictedActions
                                      }
                                    };
                                            
                                    localStorage.setItem('user', JSON.stringify(userObject));                                  
                                    userInfo.current = userObject;
                                    liftData(!error ? true : false, 'signin', false, 103);
                                    liftUser(userObject);
                                    setLoggedIn(!error ? 1 : 0);
                                    setRenderSignUp(false);
                
                                  } else setError(error);
                                }
                              },
                              err => {
                                setError(err);
                                console.error(err);
                              }
                            );
                          } else {
                            if (res.errors) {
                              const errorsArray = [];

                              res.errors.forEach(err => {
                                const errorMessage = err.message;
                                errorsArray.push(errorMessage);
                              });

                              if (errorsArray.length > 0) setError(errorsArray);
                            }
                          }
                        }
                      } else if (res.name) {
                        setError(res.message);
                      }
                    },
                    err => { console.error({err}) }
                  );
                }
              }
            } else { // The user needs to be registered (or they entered an incorrect email address).
              // If there are no users at all in the database, render the signup page.
              user.getAllUsersSansToken().then(
                res => {
                  if (res.data) {
                    const id = res.data?.users[0].Id;
                    const error = res.data?.users[0].Error;
                    if (!id && !error) {
                      setRenderSignUp(true);
                      userAction.current = 'Add User';
                    } else if (id && !error) {
                      setError('There is no user associated with this email address.\n\nPlease ensure you\'ve entered the correct email address or ask the site\'s administrator for access.');                      
                      liftData(false, 'signin', true); // Args => boolean, caller, error (boolean).
                      document.getElementById('sign-in-button').innerText = 'Sign in';
                      document.getElementById('sign-in-button').classList.remove('reset-color');
                    }
                  } else if (res.name) {
                    setError(res.message);
                  }
                },
                err => {
                  console.error({err});
                }
              );
            }
          } else {
            if (!res.response) {
              const signInButton = document.getElementById('sign-in-button');

              setError('Network error. Check that the API is up and running');
              if (signInButton) signInButton.innerText = 'Sign In';
            }
          }
        },
        err => { console.error({err}); }
      );
    } else { // Update the user's password.
      if (confirmPassword !== password) { // Ensure that the user has entered her password correctly.
        setError('The passwords do not match; please re-enter them.');
        setPassword('');
        setConfirmPassword('');
      } else { // The passwords match, so send it to the db and sign the user in.
        setError(null);
        user.id = id;
        user.password = confirmPassword;
        user.changePassword(false).then(  // The return on this call to changePassword is the same as for signin.
          res => {
            if (res.data) {
              const userData = res.data?.changePassword;
              const id = userData?.Id;
              const error = userData?.Error;

              // If id, the user's password has been updated and the user has been logged in, so redirect to the dashboard.
              if (id && !error) {
                setId(id);

                // Get user restrictions from the db and add them to the user object in local storage.
                user.getUserRestrictions(userData.RoleId).then(
                  res => {
                    if (res) {
                      const roleProfile = res?.data?.getUserRestrictions;
                      const error = roleProfile?.Error;

                      if (!error) { // Build the user object to be stored in the browser.
                        const userObject = {
                          id: userData.Id,
                          name: userData.Name,
                          role: userData.Role,
                          roleId: userData.RoleId,
                          restrictions: {
                            pages: roleProfile.RestrictedPages,
                            actions: roleProfile.RestrictedActions
                          }
                        };

                        localStorage.setItem('user', JSON.stringify(userObject));
                        userInfo.current = userObject;
                        liftData(!error ? true : false, 'signin', false);
                        liftUser(userData);
                        setLoggedIn(1);
                        setError(null);
                        setChangePassword(false);
                      } else {
                        setError(error);
                        setLoggedIn(0);
                      }
                    }
                  },
                  err => {
                    console.error(err);
                    setError(err);
                  }
                );
              }
            }
          },
          err => { 
            console.error(err);
            setError(err);
          }
        );
      }
    }
  };

  // Handle the clicking of the sign-up button.
  const handleSignUp = (event) => {
    event.preventDefault();
    document.getElementById('register-button').textContent = 'Registering . . .';
    user.email = username;
    user.password = password;
    user.name = name;
    user.role = role ? role : '';
    user.role = !isNaN(parseInt(user.role)) ? parseInt(user.role) : user.role;
    setError(null);

    if (role) {
      user.signUp().then(
        res => {
          if (res.data) {
            if (res.data?.signup?.Error) {
              setError(res.data?.signup?.Error);
              setLoggedIn(0);
              document.getElementById('register-button').textContent = 'Register';
            } else if (res.data.signup?.Id) {
              setSuccessMessage(res.data?.signup?.Message);
              setError(null);
              setId(res.data?.signup?.Id);
              userAction.current = 'Sign In';
            }
          } else if (res.name) {
            setError(res.message);
          } 
          
          if (res.errors) res.errors.forEach(error => console.error({error})); // For debugging.
        },
        err => { console.error({err}) }
      );
    } else setError('Please select a role for this user.');
  }

  // Toggle the roles' dropdown menu on click.
  const toggleSelect = () => {
    const options = document.getElementById('select-role').children;
    if (options) {
      Object.values(options).forEach(option => {
        if (option.id) {
          if (!option.id.includes('default')) option.classList.toggle('show-option');
          else option.classList.toggle('fade-default');
        }
      });
    }

    setRoleName(null);
    setRole(null);
  };

  // Open the roles' dropdown menu on focus.
  const openDropdown = () => {
    const options = document.getElementById('select-role').children;
    
    if (options) {
      Object.values(options).forEach(option => {
        if (option.id) {
          if (!option.id.includes('default')) {
            option.classList.add('show-option');
          } else {
            option.classList.add('fade-default')
          }
        }
      });
    }
  };

  // Toggle the class that highlights the role.
  const toggleClass = (event) => {
    const options = document.getElementById('select-role').children;
    const id = event.target.id;

    setRoleName(null);
    setRole(null);

    if (options) {
      for (let option of options) {
        if (!option.id.includes('default')) {
          if (option.id !== id) {
            document.getElementById(option.id).classList.remove('highlight-option');
          } else {
            document.getElementById(id).classList.add('highlight-option');
          }
        }
      }
    }
  };

  // Capture the user's role.
  const handleSelect = (event) => {
    const roleId = event.target.dataset.value;
    const roleName = event.target.textContent;
    const options = document.getElementById('select-role').children;

    if (options) {
      Object.values(options).forEach(option => {
        if (option.id) {
          if (!option.id.includes('default')) {
            option.classList.remove('show-option');
          } else {
            option.classList.remove('fade-default')
            option.classList.add('role-selected');
          }
        }
      });
    }

    setRole(roleId);
    setRoleName(roleName);
  };

  // Render the sign-up form.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (userAction.current === 'Add User' && profile.action === 'Add User') setRenderSignUp(true);
      else setRenderSignUp(false);
    }
    return () => mounted = false;
  }, [profile.action]);
  
  // Change the page's nav title.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (userAction.current === 'Add User' && profile.action === 'Add User') {
        liftData(true, 'signup', false);
        setRenderSignUp(true);
      } else if (profile.action === 'Sign Out' && userAction.current === 'Sign Out') {
        const user = new User();
        user.signOut().then(
          res => {
            if (res) {
              if (res.data) {
                setLoggedIn(0);
                userAction.current = 'Sign In';
                liftData(false, 'signin', false);
                setError(null);
                setRenderSignUp(false);
                liftUser(null);
                localStorage.setItem('user', null)
              } else if (res.name) {
                // console.error(res.message);
              }  
            }
          },
          err => { console.error({err}) }
        );  
      }
    }
    return () => mounted = false;
  }, [liftData, liftUser, profile.action]);

  // Get the user's available roles for sign-up.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const user = new User(); // Must create a new user inside the useEffect, otherwise the code runs ad nauseum.
      user.getUserRoles().then(
        res => {          
          if (res.data) {
            const userRoles = res.data?.getUserRoles;
            setRoles(userRoles);
          } else if (res.name) {
            setError(res.message);
          }
        },
        err => { console.error({err}); }
      );
    }
    return () => mounted = false;
  }, []);
    
  return !renderSignUp && !changePassword ?
  ( // Sign in.
    <> 
      <div className='signin-container'>
        <p>{message}</p>
        <form onSubmit={(e) => handleSignIn(e)}>
          <input name='username' value={username} placeholder='Email' onChange={(e) => setUsername(e.target.value)} required />
          <input name='password' value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)} required type='password'/>
          <button id='sign-in-button' name='submit' type='submit'>Sign In</button>
        </form>
      </div>
      <div className='dashboard-description'>
        <h2>Order-tracking Dashboard Demo</h2>
        <p>This dashboard, custom built for and currently used by a multinational company, tracks orders through their full lifecycle, from origination in the CRM to their transfer to the ERP, with error tracking and resolution, and user authentication and authorization.</p>
        <ul className='primary-ul-container'>
          <p className='list-header'>Features</p>
          <li>Authentication, secured with SSL and JWT, with persistence between sessions and automatic timeout.</li>
          <li>Authorization, with role-based access to view pages and take actions.</li>
          <li>Interactivity
            <ul className='secondary-ul-container'>
              <li>Hyperlinking to ease navigation among pages.</li>
              <li>Role-based rendering of pages and available actions.</li>
              <li>User actions, either in singular or in builk, including repull, repush, ignore, and delete.</li>
              <li>Inline content editing of predefined categories.</li>
              <li>Sorting of each column in ascending and descending order.</li>
              <li>Adding, editing, and deleting of users.</li>
            </ul>
          </li>
          <li>Responsive Design: simple, legible layout on any screen size.</li>
          <li>Tech Stack
            <ul className='secondary-ul-container'>
              <li>Frontend
                <ul>
                  <li>SPA built in React using hooks and functional components.</li>
                  <li>Deployed on Netlify via the Netlify CLI.</li>
                </ul>
              </li>
              <li>Backend
                <ul className='secondary-ul-container'>
                  <li>NodeJS API: Express server with GraphQL.</li>
                  <li>Deployed on Heroku using a CI/CD pipeline via GitHub.</li>
                  <li>MySQL database hosted by JawsDB on Heroku.</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
        <ul className='primary-ul-container'>
          <p className='list-header'>Logging In</p>
          <li>Admin: accessible on request.</li>
          <li>Agent: replace the word "demo" in the default value of the email field with "agent," using this word in lowercase as the password.</li>
          <li>User: click or tap the Sign In button.</li>
        </ul>
      </div>
      {error ?
      (
        <div className='sign-in-error'>{error}</div>
      )
      : parseInt(loggedIn) && userInfo.current ?
      (
        <Redirect to={{
          pathname: '/dashboard',
          state: {
            user: {
              id: userInfo.current?.Id,
              name: userInfo.current?.Name,
              role: userInfo.current?.Role,
              action: 'Dashboard'
            }
          }
        }}
        />
      )
      : 
      (
        ''
      )}
    </>
  ) 
  : !renderSignUp && changePassword ? 
  ( // Change password.
    <> 
      <div className='signin-container'>
        <p>Enter a new password and confirm it in the second field.</p>
        <form onSubmit={(e) => handleSignIn(e)}>
          <input id='new-password-first-field' name='password' value={password} placeholder='Enter your new password.' onChange={(e) => setPassword(e.target.value)} type='password' required />
          <input name='password' value={confirmPassword} placeholder='Re-enter your new password.' onChange={(e) => setConfirmPassword(e.target.value)} required type='password' />
          <button id='sign-in-button' name='submit' type='submit'>Update</button>
        </form>
      </div>
      {error ?
        <div>{error}</div>
      : parseInt(loggedIn) && userInfo.current ?
        <Redirect to={{
          pathname: '/dashboard',
          state: {
            user: {
              id: userInfo.current?.Id,
              name: userInfo.current?.Name,
              role: userInfo.current?.Role
            }
          }
        }}
        />
      : ''}
    </>
  ) 
  : 
  ( // Sign up.
    <div className='signup-container'>
      {!id ? 
      (
        <>
          <form onSubmit={handleSignUp}>
            <input name='your-name' value={name} placeholder='Name' onChange={(e) => setName(e.target.value)} required />
            <input name='email' value={username} placeholder='Email' onChange={(e) => setUsername(e.target.value)} required />
            <div className='select-container add-user' id='select-role' name='role' onChange={() => handleSelect()}>
              <p 
                className='role-option default' 
                id='default' value='default' 
                onClick={() => toggleSelect()}
                onKeyUp={() => openDropdown()}
                tabIndex='0'
              >
                {roleName ? roleName : 'Role'}
              </p>
              {roles.map((value, key) => (
                <p 
                  className='role-option' 
                  id={`option-${key}`} 
                  key={key} 
                  data-value={value.Id} 
                  onClick={(e) => handleSelect(e)} 
                  onFocus={(e) => toggleClass(e, key)} 
                  onKeyPress={(e) => handleSelect(e)}
                  tabIndex='0'
                >
                  {value.Role}
                </p>
              ))}
            </div>
            <input name='password' value={password} placeholder='Password' type='password' onChange={(e) => setPassword(e.target.value)} required />
            <button id='register-button' name='submit' type='submit'>Register</button>
          </form>
          {error ? 
          (
            <div>{error}</div>
          ) : (
            ''
          )}
        </>
      ) : (
        <Redirect to={
          {
            pathname: '/users',
            state: {
              id,
              action: 'Add User',
              message: successMessage
            },
          }
        }
        />
      )}
    </div>
  )
}

export default Signin;
