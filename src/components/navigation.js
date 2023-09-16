import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Home from '../pages/home/home';
import FailedOrders from '../pages/failed-orders/failed-orders';
// import OrderView from '../pages/order-view/order-view';
import Settings from '../pages/settings/settings';
import FailedProcesses from '../pages/failed-processes/failed-processes';
import Users from '../pages/users/users';
import Login from '../pages/login/login';
import MobileLinksModal from './mobile-links-modal';
import initialRoutes from '../routes';
import useLinks from '../hooks/get-links';
// import nCompassLogo from '../nCompass_logo_fullsize_square.png'; // For logo.otherExtension
import {ReactComponent as Logo} from '../logo.svg';  // For logo.svg.
import MenuIcon from '@mui/icons-material/Menu';
import LinearScaleIcon from '@mui/icons-material/LinearScale';

const NavBar = () => {
  // const [linkId, setLinkId] = useState(null);
  // const [inputId, setInputId] = useState(null);
  // const [inputDisplay, setInputDisplay] = useState(null);
  const [signUp, setSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('loggedIn') ? JSON.parse(localStorage.getItem('loggedIn')) : null);
  const [activePage, setActivePage] = useState(null);
  const [renderMobileLinksModal, setRenderMobileLinksModal] = useState(false);
  const [reRender, setReRender] = useState(false);
  const loggedInUser = useRef(null);
  const links = useLinks(routes, null, null, handleClick);

  // (Hoisted function.) If the user logs out, this function causes the user's token to expire.
  function handleClick(event) {
    const id = event.target.id;
    
    // setInputDisplay(null); // For the search-order field, which isn't being used.
    setRenderMobileLinksModal(false);
    document.getElementsByTagName('body')[0].classList.remove('no-scroll');

    if (id === 'Sign Out') {
      setLoggedIn(0);
      setSignUp(false);
    }

    if (id === 'Sign In') setError('');
    if (id === 'Users') setError(null);

    if (id === 'Failed Processes') {
      setReRender(false);
      setReRender(true);
    } else {
      setReRender(false);
    }
  };

  // Handle the user's clicking of the hamburger menu.
  const handleMenuClick = () => {
    const activePage = document.getElementsByClassName('active')[0].innerText;

    if (activePage) {
      // Disable/enable vertical scrolling on click of the hamburger menu and its closed counterpart.
      document.getElementsByTagName('body')[0].classList.toggle('no-scroll');
      // Set the active page.
      setActivePage(activePage);

      // Render the component that will show a modal of menu items.
      setRenderMobileLinksModal(!renderMobileLinksModal);
    }
  }

  // For redacted search-by-order field: Sets the inputId equal to the user's input in the input field and sets linkId to null.
  // const handleSubmit = event => {
  //   event.preventDefault();
  //   if (typeof inputDisplay === 'number') {
  //       setInputId(inputDisplay);
  //       setLinkId(null);
  //       setRedirect(true);
  //   } else setInputDisplay('Need a number.');
  // };

  // For redacted search-by-order field.
  // const handleChange = event => {
  //   let id = parseInt(event.target.value);
  //   typeof id === 'number' ? setInputDisplay(id) : setInputDisplay('Enter a number.');
  // };

  // // Retrieves the ID from params.state. 
  // const getIdOnClick = num => {
  //   let id;
  //   if (num) id = parseInt(num);
  //   if (id) {
  //     if (inputDisplay) {
  //       if (inputDisplay !== id) {
  //         setLinkId(id);
  //         setInputDisplay(id);
  //         setInputId(null);
  //       } else {
  //         // console.log('id === inputDisplay');
  //       }
  //     } else {
  //       if(id !== inputId) {
  //         setLinkId(id);
  //         setInputDisplay(id);
  //         setInputId(null);
  //       } else {
  //         setInputDisplay(inputId);
  //       }
  //     }
  //   }
  // };

  const liftUser = user => {
    loggedInUser.current = user;
    if (!user) setLoggedIn(0);
  };

  // Relays an action taken via submit on a page down river.
  const liftData = (boolean, caller, error = false, line = 0) => {
    if (caller === 'signin') {
      if (!error) {
        setLoggedIn(boolean ? 1 : 0);
        setSignUp(false);
      } else setError(null);
    } else if (caller === 'signup') {
      setSignUp(boolean);
    } else if (caller === 'user') {
      setLoggedIn(boolean);
    } else {
      setSignUp(false);
      setLoggedIn(0);
    }
  }

  // Update the routes to reflect whether a user is signed in or out.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const updatedRoutes = initialRoutes.map(route => {        
        if (route.path === '/login') {
          const temp = Object.assign({}, route);
          temp.name = parseInt(loggedIn) ? 'Sign Out' : 'Sign In';
          return temp;
        }
        return route;
      });
      
      setRoutes(updatedRoutes);
      localStorage.setItem('loggedIn', loggedIn);
    }
    return () => mounted = false;
  }, [loggedIn, signUp, reRender]);
  
  return (
    <Router>
      <nav className='navbar'>
        <div className='logo-links mobile'>
          <div className="logo-container">
            <a href={process.env.REACT_APP_HOME ? process.env.REACT_APP_HOME : 'https://hulk.yoli.net:3002/'}><Logo /></a>
            {/* <a href={process.env.REACT_APP_HOME}><img className="logo" src={nCompassLogo} alt="logo" /></a> */}
            <h1>Orders</h1>
          </div>
          <div className="links-container">
            <div className={"navbar-links"}>
              {links}
            </div>
              {loggedIn ? // Hamburger menu icon.
              (
                !renderMobileLinksModal 
                ? <div className="hamburger-menu-icon" onClick={handleMenuClick}><MenuIcon /></div>
                : <div className="hamburger-menu-icon" onClick={handleMenuClick}><LinearScaleIcon /></div>
              )
              : null
              }
          </div>
        </div>
        <div className='logo-links tablet'>
          <div className='links-container'>
            <div className={"navbar-links"}>
              {links}
            </div>
          </div>
          <div className='logo-container'>
            <a href={process.env.REACT_APP_HOME ? process.env.REACT_APP_HOME : 'https://hulk.yoli.net:3002/'}><Logo /></a>
            {/* <a href={process.env.REACT_APP_HOME}><img className="logo" src={nCompassLogo} alt="logo" /></a> */}
            <h1>Orders</h1>
          </div>
          {loggedIn ? // Hamburger menu icon.
          (
            !renderMobileLinksModal 
            ? <div className="hamburger-menu-icon" onClick={handleMenuClick}><MenuIcon /></div>
            : <div className="hamburger-menu-icon" onClick={handleMenuClick}><LinearScaleIcon /></div>
          )
          : null
          }
        </div>
        <div className='logo-links desktop'>
          <div className="logo-container">
            <a href={process.env.REACT_APP_HOME ? process.env.REACT_APP_HOME : 'https://hulk.yoli.net:3002/'}><Logo /></a>
            {/* <a href={process.env.REACT_APP_HOME}><img className="logo" src={nCompassLogo} alt="logo" /></a> */}
            <h1>Orders</h1>
          </div>
          <div className="links-container">
            <div className={"navbar-links"}>
              {links}
            </div>
          </div>
        </div>
        {/* <div className='order-search'>
          <input
            className='search-field'
            value={inputDisplay ? inputDisplay : ''}
            placeholder="Order Search by ID"
            onChange={handleChange}
            onKeyPress={event => event.key === 'Enter' ? handleSubmit(event) : {}}
            onClick={handleClick}
          />
        </div> */}
      </nav>
      <main className='main'>
        <Switch>
          {/* <Route exact path='/' >
            <Home />
          </Route> */}
          <Redirect exact from='/' to={!loggedIn ? '/login' : '/dashboard'} />
          <Route exact path='/dashboard'>
            <Home />
          </Route>
          <Route exact path='/failed-orders'>
            <FailedOrders />
          </Route>
          <Route exact path='/failed-processes'>
            <FailedProcesses />
          </Route>
          {/* <Route exact path='/order-view'>
            <OrderView getId={getIdOnClick}/>
          </Route> */}
          <Route exact path='/settings'>
            <Settings />
          </Route>
          <Route exact path='/users'>
            <Users 
              liftData={liftData}
              liftUser={liftUser}
              // clearId={clearId} 
            />
          </Route>
          <Route exact path='/login'>
            <Login liftData={liftData} liftUser={liftUser} loggedIn={loggedIn} signUp={signUp} error={error} />
          </Route>
        </Switch>
        {/* {redirect === true ? (
          <Redirect 
            to={{
              pathname: '/order-view',
              state: {
                order: inputId ? inputId : linkId,
              },
            }}
          />
        ) : (
          '' 
        )} */}
      </main>
      {renderMobileLinksModal ? <MobileLinksModal links={links} activePage={activePage} /> : null}
    </Router>
  );
};

export default NavBar;
