import React from 'react';
import formatHeaders from '../hooks/format-headers';

const Tabs = props => {  
  return props.tabs ? 
  (
    <div className='tabs-container'>
      {props.tabs.map((tab, key) => (
          <div key={key} className="page-tab">
          <form>
            {props.caller !== 'payments' ? 
            (
              <button className={formatHeaders(props.activeTab) === tab ? 'active-button' : 'inactive-button'} id={`failed-process-tab-${key+1}`} value={tab} onClick={props.handleClick}>
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
