import React, { useEffect } from 'react';
import formatHeaders from '../hooks/format-headers';

const Tabs = props => {

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
