import React from 'react';
import { NavLink } from 'react-router-dom';
import { ListItem } from '@mui/material';

const useLinks = (routes, inputId, linkId, handleClick) => {
  const links = (
    routes.map((route, key) => {
      return route.path === '/order-view' ? // Not currently an active feature.
        (
          <NavLink
            to={{
              pathname: route.path,
              state: {
                order: inputId ? inputId : linkId,
              },
            }}
            key={key}
            className='nav-link'
            activeStyle={{ border: '1px solid cornflowerblue', borderRadius: '20px', margin: '0', color: 'orange' }}
          >
            <ListItem style={{ padding: '0 1rem 0 1.5rem', margin: '0' }}>
              <route.icon style={{ fontSize: '2rem', padding: '0', margin: '0' }} />
              <h5 value={route.name} className='list-item-text'>{route.name}</h5>
            </ListItem>
          </NavLink>
        ) : (
          <NavLink
            to={{
              pathname: route.path,
              state: {
                user: {
                  action: route.name,
                },
              }
            }}
            key={key}
            className={`nav-link ${route.layout}`}
            activeStyle={{ border: '1px solid cornflowerblue', borderRadius: '20px', margin: '0', color: 'orange' }}
          >
            <ListItem style={{ padding: '0 1rem 0 1.5rem', margin: '0' }}>
              <route.icon style={{ fontSize: '2rem', padding: '0', margin: '0', paddingRight: '5px' }} />
              <h5 id={route.name} className='list-item-text' onClick={handleClick}>{route.name}</h5>
            </ListItem>
          </NavLink>
        );
    })
  );

  return links;
}

export default useLinks;