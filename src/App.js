import React, { useState, useEffect } from 'react';
import NavBar from './components/navigation';
import Footer from './components/footer';
import { checkDbConnection } from './hooks/get-dashboard';

const App = () => {
  const [connected, setConnected] = useState(false);
  
  // Check whether the API is running.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      checkDbConnection().then(
        res => {          
          const networkError = res?.message;
          const apiConnected = res?.data?.checkDbConnection?.Connected;

          if (networkError) {
            setConnected(false);
          } else if (apiConnected) {
            setConnected(apiConnected);
          }
        },
        err => console.error(err)
      );
    }
    return () => mounted = false;
  }, []);
  
  return !connected ?
  (
    <div className="api-down">
      <h3>This application's API may be down.</h3>
      <p>Please contact technical support.</p>
    </div>
  )
  :
  (
    <>
      <NavBar />
      <Footer />
    </>
  )
}

export default App;
