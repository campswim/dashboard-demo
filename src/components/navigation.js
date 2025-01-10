import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Home from '../pages/home/home';
import FailedOrders from '../pages/failed-orders/failed-orders';
import OrderSummary from '../pages/order-view/order-summary';
import Settings from '../pages/settings/settings';
import FailedProcesses from '../pages/failed-processes/failed-processes';
import FailedPayments from '../pages/failed-payments/failed-payments';
import ErrorLogs from '../pages/error-logs/error-logs';
import Users from '../pages/users/users';
import Login from '../pages/login/login';
import MobileLinksModal from './mobile-links-modal';
import initialRoutes from '../routes';
import useLinks from '../hooks/get-links';
import campSwimLogo from '../camp-swim-logo-nobg.png'; // For logo.otherExtension
// import {ReactComponent as Logo} from '../logo.svg';  // For logo.svg.
import MenuIcon from '@mui/icons-material/Menu';
import LinearScaleIcon from '@mui/icons-material/LinearScale';

const NavBar = () => {
  // const [linkId, setLinkId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [signUp, setSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('loggedIn') ? JSON.parse(localStorage.getItem('loggedIn')) : null);
  const [activePage, setActivePage] = useState(null);
  const [renderMobileLinksModal, setRenderMobileLinksModal] = useState(false);
  const [reRender, setReRender] = useState(false);
  const loggedInUser = useRef(null);
  const restrictedPages = useRef('');
  const links = useLinks(routes, null, null, handleClick, restrictedPages.current);
  // const siteLocation = window.location.href;
  const logoLink = process.env.REACT_APP_ENV === 'production' ? 
      process.env.REACT_APP_HOME
    : process.env.REACT_APP_HOME_DEV 
  
  // (Hoisted function.) If the user logs out, this function causes the user's token to expire.
  function handleClick(event) {
    const id = event.target.id;
        
    setRenderMobileLinksModal(false);
    document.getElementsByTagName('body')[0].classList.remove('body--no-scroll');

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
      document.getElementsByTagName('body')[0].classList.toggle('body--no-scroll');
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
  //       // setRedirect(true);
  //   } else setInputDisplay('Need a number.');
  // };

  // For redacted search-by-order field.
  // const handleChange = event => {
  //   let id = parseInt(event.target.value);
  //   typeof id === 'number' ? setInputDisplay(id) : setInputDisplay('Enter a number.');
  // };

  // Retrieves the ID from its children. 
  const getIdOnClick = num => {
    if (num) {
      setOrderId(num);
    }
  };

  const liftUser = user => {
    loggedInUser.current = user;
    
    if (!user || user === 'null') {
      setLoggedIn(0);
    }
  };

  // Relays an action taken via submit on a page down river.
  const liftData = (boolean, caller, error = false, line) => {
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
  
  // Reset loggedIn to false if there is no user in local storage.
  useEffect(() => {
    let mounted = true;
      if (mounted) {
        const user = localStorage.getItem('user');

        if (!user || user === 'null') {
          setLoggedIn(0);
        } else {
          loggedInUser.current = user;
          setLoggedIn(1);
        }
      }
    return () => mounted = false;
  }, [loggedIn]);

  // Hide nav links based on a user's role.
  useEffect(() => {
    const userPageRestrictions = loggedInUser.current && typeof loggedInUser.current === 'string' ? 
      JSON.parse(loggedInUser.current)?.restrictions?.pages : 
        loggedInUser.current ? 
      loggedInUser.current?.restrictions?.pages : 
      null;

    if (userPageRestrictions && userPageRestrictions !== 'None') {
      restrictedPages.current = userPageRestrictions;
    } else {
      restrictedPages.current = '';
    }
  });

  console.log({restrictedPages});

  return (
    <Router>
      <nav className='navbar'>
        <div className={`logo-links mobile ${process.env.REACT_APP_ENV}`}>
          <div className={`logo-container ${process.env.REACT_APP_ENV}`}>
            {/* <a href={logoLink}><Logo /></a> */}
            <a href={logoLink}><img className="logo" src={campSwimLogo} alt="logo" /></a>
            <div className='logo-subheading'>
              <p className={`dev-or-live ${process.env.REACT_APP_ENV}`}>{process.env.REACT_APP_ENV.includes('development') ? 'Dev' : process.env.REACT_APP_ENV === 'production-manual' ? 'Live' : ''}</p>
              <h1>Orders</h1>
            </div>
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
        <div className={`logo-links tablet ${process.env.REACT_APP_ENV}`}>
          <div className='links-container'>
            <div className={"navbar-links"}>
              {links}
            </div>
          </div>
          <div className='logo-container'>
            {/* <a href={logoLink}><Logo /></a> */}
            <a href={logoLink}><img className="logo" src={campSwimLogo} alt="logo" /></a>
            <div className='logo-subheading'>
              <p className={`dev-or-live ${process.env.REACT_APP_ENV}`}>{process.env.REACT_APP_ENV.includes('development') ? 'Dev' : process.env.REACT_APP_ENV === 'production-manual' ? 'Live' : ''}</p>
              <h1>Orders</h1>
            </div>
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
        <div className={`logo-links desktop ${process.env.REACT_APP_ENV}`}>
          <div className="logo-container">
            {/* <a href={logoLink}><Logo /></a> */}
            <a href={logoLink}><img className="logo" src={campSwimLogo} alt="logo" /></a>
            <div className='logo-subheading'>
              <p className={`dev-or-live ${process.env.REACT_APP_ENV}`}>{process.env.REACT_APP_ENV.includes('development') ? 'Dev' : process.env.REACT_APP_ENV === 'production-manual' ? 'Live' : ''}</p>
              <h1>Orders</h1>
            </div>
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
            <Home loggedIn={loggedIn} />
          </Route>
          <Route exact path='/failed-orders'>
            <FailedOrders />
          </Route>
          <Route exact path='/failed-processes'>
            <FailedProcesses />
          </Route>
          <Route exact path= '/failed-payments'>
            <FailedPayments />
          </Route>
          <Route exact path='/order-summary'>
            <OrderSummary 
              getId={getIdOnClick}
              orderId={orderId}
            />
          </Route>
          <Route exact path='/settings'>
            <Settings />
          </Route>
          <Route exact path='/error-logs'>
            <ErrorLogs />
          </Route>
          <Route exact path='/users'>
            <Users 
              liftData={liftData}
              liftUser={liftUser}
            />
          </Route>
          <Route exact path='/login'>
            <Login 
              liftData={liftData} 
              liftUser={liftUser} 
              loggedIn={loggedIn} 
              signUp={signUp} 
              error={error} 
            />
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
        {renderMobileLinksModal ? <MobileLinksModal links={links} activePage={activePage} /> : null}
      </main>
    </Router>
  );
};

export default NavBar;
