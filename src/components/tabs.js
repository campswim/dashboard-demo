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
  if (props?.caller === 'payments' || 'unprocessed') {
    if (props.tabs.includes('All')) {
      const index = props.tabs.indexOf('All');
      props.tabs.splice(index, 1);
    }
    if (!props.tabs.includes('All')) props.tabs.unshift('All');
  }

  return props.tabs ? 
  (
    <div className='tabs-container'>
      {props.tabs.map((tab, key) => (
          <div key={key} className="page-tab">
          <form>
            {props.caller !== 'payments' ? 
            (
              <button 
                className={formatHeaders(props.activeTab) === tab ? 'active-button' : 'inactive-button'} 
                id={`failed-process-tab-${key+1}`}
                value={tab} 
                onClick={props.handleClick}
              >
                {tab}
              </button>
            )
            :
            (
              <button className={props.activeTab === tab ? 'active-button' : 'inactive-button'} id={`failed-process-tab-${key+1}`} value={tab} onClick={props.handleClick}>
                {tab}
              </button>
            )}
          </form>
        </div>
      ))}
    </div>
  )
  :
  (
    null
  )
}

export default Tabs;
