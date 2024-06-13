import React, { useState } from 'react';
import Dropdown from '../pushed/dropdown';

const PushedOrders = () => {
  const baseUrl = 'StagingOrders/summary/1/';

  const [pathOneDays, setPathOneDays] = useState(0);
  const [pathOne, setPathOne] = useState(`${baseUrl}${pathOneDays}`);
  const [pathTwoDays, setPathTwoDays] = useState(1);
  const [pathTwo, setPathTwo] = useState(`${baseUrl}${pathTwoDays}`);
  const [pathThreeDays, setPathThreeDays] = useState(6);
  const [pathThree, setPathThree] = useState(`${baseUrl}${pathThreeDays}`);

  const handleChange = event => {
    event.preventDefault();
    const path = event.target.className;
    const days = parseInt(event.target.value);

    if (path === `${baseUrl}${pathOneDays}`) {
      setPathOneDays(days);
      setPathOne(`${baseUrl}${days}`);
    } else if (path === `${baseUrl}${pathTwoDays}`) {
      setPathTwoDays(days);
      setPathTwo(`${baseUrl}${days}`);
    } else if (path === `${baseUrl}${pathThreeDays}`) {
      setPathThreeDays(days);
      setPathThree(`${baseUrl}${days}`);
    }
  };

  return (
    <>
      <h3>Orders Pushed to GP</h3>
      <div className='dash-pushed'>
        <Dropdown path={pathOne} days={pathOneDays} handleChange={handleChange} />
        <Dropdown path={pathTwo} days={pathTwoDays} handleChange={handleChange} />
        <Dropdown path={pathThree} days={pathThreeDays} handleChange={handleChange}
        />
      </div>
    </>
  );
};

export default PushedOrders;
