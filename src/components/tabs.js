import React, { useEffect } from 'react';
import formatHeaders from '../hooks/format-headers';

const Tabs = props => {
  // Scroll the active button into view.
  useEffect(() => {
    const element = document.getElementsByClassName('active-button');

    if (element) {
      Array.from(element).forEach(el => {
        if (el?.className === 'active-button') {
          el.scrollIntoView(true);
        }
      });
    }
  });
    
  // Add "All" to the front of the tabs array for the failed-payments page.
  if (props?.caller === 'payments' || props?.caller === 'unprocessed') {
    if (props.tabs.includes('All')) {
      const index = props.tabs.indexOf('All');
      props.tabs.splice(index, 1);
    }
    if (!props.tabs.includes('All')) props.tabs.unshift('All');
  }

  return props.tabs && 
  (
    <div className='tabs-container order-actions__tabs-container'>
      {props.tabs.map((tab, key) => (
          <div key={key} className='order-actions__tabs-container__page-tab'>
          <form className='order-actions__tabs-container__page-tab__form'>
            {props.caller !== 'payments' ? 
            (
              <button 
                className={`order-actions__tabs-container__page-tab__form__button ${formatHeaders(props.activeTab) === tab ? 'active-button' : 'inactive-button'}`} 
                id={`failed-process-tab-${key+1}`}
                value={tab} 
                onClick={props.handleClick}
              >
                {tab}
              </button>
            )
            :
            (
              <button 
                className={`tabs-container order-actions__tabs-container__page-tab__form__button ${formatHeaders(props.activeTab) === tab ? 'active-button' : 'inactive-button'}`} 
                id={`failed-process-tab-${key+1}`} 
                value={tab} 
                onClick={props.handleClick}
              >
                {tab}
              </button>
            )}
          </form>
        </div>
      ))}
    </div>
  )
}

export default Tabs;
