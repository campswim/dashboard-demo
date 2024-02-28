import React from 'react';
import { Link } from 'react-router-dom';
import actions from '../actions';

  // Create the action buttons.
  const getActions = (tab, restrictions, isChecked, takeAction, isCheckedNums, dismissed) => {
    const links = (
      restrictions === 'All' ? 
      (
        null
      )
      :
      (
        actions[tab].map((action, key) => (
          !restrictions.includes(action.title) ?
          (
            tab === 'jobError' || tab === 'paymentError' ?
            (
              dismissed && dismissed.length <= 0 ?
              (
                key === 0 ? 
                (
                  <Link
                    to={{
                      pathname: action.pathname,
                      state: {
                        order: isChecked,
                        orderNum: isCheckedNums,
                        postPath: action.postPath,
                        action: action.action,
                        id: action.actionId
                      },
                    }}
                    key={key}
                    onClick={() => takeAction(action.onClickArg, isChecked)}
                  >
                    {action.title}
                  </Link>
                )
                :
                (
                  null
                )
              )
              :
              (
                key === 1 ?
                (
                  <Link
                  to={{
                    pathname: action.pathname,
                    state: {
                      order: isChecked,
                      orderNum: isCheckedNums,
                      postPath: action.postPath,
                      action: action.action,
                      id: action.actionId
                    },
                  }}
                  key={key}
                  onClick={() => takeAction(action.onClickArg, isChecked)}
                >
                  {action.title}
                </Link>
                )
                :
                (
                  null
                )
              )
            )
            :
            (
              <Link
                to={{
                  pathname: action.pathname,
                  state: {
                    order: isChecked,
                    orderNum: isCheckedNums,
                    postPath: action.postPath,
                    action: action.action,
                    id: action.actionId
                  },
                }}
                key={key}
                onClick={() => takeAction(action.onClickArg, isChecked)}
              >
                {action.title}
              </Link>
            )
          )
          :
          (
            null
          )
        ))
      )
    );
    
    return links;
  };

  export default getActions;
