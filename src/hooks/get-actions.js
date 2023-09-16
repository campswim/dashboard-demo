import React from 'react';
import { Link } from 'react-router-dom';
import actions from '../actions';

  // Create the action buttons.
  const getActions = (tab, restrictions, isChecked, takeAction) => {
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
            <Link
              to={{
                pathname: action.pathname,
                state: {
                  order: isChecked,
                  postPath: action.postPath,
                  action: action.action,
                  id: action.actionId
                },
              }}
              key={key}
              onClick={() => takeAction(action.onClickArg)}
            >
              {action.title}
            </Link>
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
