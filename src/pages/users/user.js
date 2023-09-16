import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import formatHeaders from '../../hooks/format-headers';
import useSort from '../../hooks/sort-data';
import Checkbox from '../../components/checkbox';
import User from '../../hooks/get-user';
import selectElementContents from '../../hooks/select-all';
import getType from '../../hooks/get-type';
import logChange from '../../hooks/log-change';
import OrderDetails from '../../components/order-details';
import Tabs from '../../components/tabs';

const Users = (props) => {
  const [tabs, setTabs] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [isChecked, setIsChecked] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [activeTab, setActiveTab] = useState('All Roles');
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [activeTabCount, setActiveTabCount] = useState(0);
  const [activeLink, setActiveLink] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [newValue, setNewValue] = useState({});
  const [orderDetails, setOrderDetails] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [roleName, setRoleName] = useState(null);
  const [vpWidth, setVpWidth] = useState(window.innerWidth);
  const messageRef = useRef('');
  const clickLocation = useRef('');
  const clickCount = useRef(0);
  const prevElement = useRef('');
  const dataType = useRef({}); // => dataType.current = {ColumnName, DataType, MaxLength}
  const changeDate = useRef('');
  const updated = useRef(false);
  const user = new User();
  let tableHeaders = props.users.length > 0 ? Object.keys(props.users[0]) : [], formattedHeaders = [];
  let { items, requestSort, sortConfig } = useSort(users, 'users');
  const getClassNamesFor = useCallback(name => {
    if (!sortConfig) return;
    let className = 'Name' === name || 'Role' === name ? 'header-editable' : '';
    className = sortConfig.key === name ? sortConfig.direction + ' ' + className : className;
    return className ? className : undefined;
  }, [sortConfig]);

  // Format the table headers.
  if (tableHeaders.length > 0) {
    // Remove RoleId from the headers before formatting.
    tableHeaders = tableHeaders.filter(header => header !== 'RoleId');
    formattedHeaders = formatHeaders(tableHeaders, 'Error');
  }

  // // Handles the selection and formatting of the page's tabs.
  const handleTabClick = (event, next) => {
    let chosenButtonValue;

    if (event) {
      event.preventDefault();
      chosenButtonValue = event.target.value;
    } else chosenButtonValue = next;
    setActiveTab(chosenButtonValue);
    setActiveLink(false);
    props.handleClick(chosenButtonValue);
    setIsChecked([]);
  };
  
  // Handles the toggling of the select-all checkbox.
  const handleSelectAll = event => {
    const tab = event.target.value;
    const activeItems = items.filter(item => item.RoleId === activeTab || 0 === activeTab);
    
    if (tab === activeTab) setAllChecked(!allChecked);
    setIsChecked(activeItems.map(item => item.Id));
    setAllChecked(!allChecked);
    if (allChecked) setIsChecked([]);
  };

  // Handles the toggling of individual checkboxes.
  const handleSelect = event => {
    const { value, checked } = event.target;
    setIsChecked([...isChecked, value]);
    if (!checked) setIsChecked(isChecked.filter(item => item !== value));
  };
  
  // Handles the action initiated by the user.
  const action = (path, item, idx) => {
    if (path === 'showDetails') {
      item.idx = idx;
      setOrderDetails(item);
      setShowDetails(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (isChecked.length !== 0) {
      const ids = [];
      const filteredRows = users.filter(row => isChecked.includes(row.Id));
      filteredRows.forEach(row => ids.push(row.Id));

      // This feature deletes the user.
      if (ids.length > 0) {
        user.deleteUser(path, ids).then(
          res => {
            if (res.data) {// IDs of deleted users are being returned but not currently used.
              setError('');
              setShowMessage(true);

              // Log the user out if all users are deleted or if the signed-in user is deleted.
              if (res.data.deleteUser.length === users.length) { // All users were deleted.
                user.signOut().then(
                  () => {
                    localStorage.setItem('user', null);
                    props.liftData(0, 'user', false);
                  },
                  err => { console.error(err); }
                )
              } else { // Not all users were deleted: if the user deleted herself, sign her out.
                const match = ids.filter(id => id === loggedInUser.id);
                
                if (match.length === 1) {
                  user.signOut().then(
                    () => { 
                      localStorage.setItem('user', null);
                      props.liftData(0, 'user', false);  
                     },
                    err => { console.error(err); }
                  )
                }
              }

            } else if (res.name) {
              console.error('Error: ', res.message);
              setError(res.message);
              setShowMessage(true);
            }

            props.recall(path);
          },
          err => {
            console.error({err});
            setError(err.message);
          }
        );
      }

      setIsChecked([]);
      setAllChecked(false);
    } else alert('Please tick a user.');
    
    // Store a flag in storage to indicate that a new action has been initiated.
    sessionStorage.setItem('action', true);
  };

  // Generates the message to show the user after an action has been initiated.
  const message = (action) => {
    let pastTenseVerb;
    if (action && action === 'Delete User') {
      pastTenseVerb = 'deleted';
    }
    if (action && action === 'Add User') {
      pastTenseVerb = 'added';
    }
    return pastTenseVerb;
  };

  // Helps manage the editing of editable fields.
  const handleClick = (event, row, column) => {
    let currentValue = event.textContent;
    let defaultValue = event.dataset.defaultValue;
    const element = document.getElementById(`${column}-${row}`);
    
    if (clickLocation.current !== event.id) {
      clickCount.current = 0;
      if (element) { // Restore the element's previous value if unclicked.
        const id = prevElement ? prevElement?.current?.id : '';
        const value = id ? prevElement?.current?.value : '';
        const tempElement = id ? document.getElementById(id) : '';
        if (tempElement && value) document.getElementById(id).innerHTML = value;
        prevElement.current = '';
      }
    }
    
    if (clickCount.current <= 1 && vpWidth >= 1024) selectElementContents(element); // Selects all content in the field.
    if (defaultValue !== currentValue) { // Replace errors in entries with the previous text; also, check unchecked boxes for the DateEnabled field.
      element.textContent = defaultValue;
      element.removeAttribute('style');
    } else {
      element.setAttribute('contentEditable', 'true');
      updated.current = false;
    }

    clickCount.current++;
    clickLocation.current = event.id;
  };

  // Handles user edits.
  const handleBlur = (userId, row, column, event, idx) => {
    let prevValue = 'Role' !== column ? event?.target?.dataset?.defaultValue : prevElement.current;
    const newValue = 'Role' !== column ? event?.target?.textContent : event?.target?.textContent;
    const table = 'Users';
    const element = 'Role' !== column ? document.getElementById(`${column}-${row}`) : null;

    if (prevValue === newValue) {
      if (element) element.removeAttribute('contentEditable');
      return;
    }

    // Get the column's configuration from the DB.
    if (table && column) {
      getType(table, column).then(
        res => {
          dataType.current = res;

          // Check the input against type and length.
          if (JSON.stringify(dataType.current) !== '{}') {
            if (newValue) {
              const columnName = dataType.current.ColumnName;
              if (columnName === column) {
                const type = dataType.current.DataType;
                let typeNewValue = 'Role' === column ? typeof tabs.indexOf(newValue) : typeof newValue;
                                        
                if (type === typeNewValue) {
                  if (dataType.current.MaxLength > newValue.length || !dataType.current.MaxLength || -1 === dataType.current.MaxLength) {
                    if (prevValue !== newValue) {
                      if (!/<\/?[a-z][\s\S]*>/i.test(newValue)) { // Check that no html is being introduced.
                        items[row][column] = newValue ? newValue : 'None'; 
                        setNewValue({ id: userId, row, column, prevValue, newValue: newValue, idx });

                        if (element) {
                          element.textContent = newValue ? newValue : 'None';
                        }
                      } else {
                        element.setAttribute('style', 'color: red');
                        element.textContent = 'There is html in the new value. Please revise your input and resubmit.';
                        element.scrollIntoViewIfNeeded({behavior:'smooth', inline:'start'});
                      }
                    } 
                  }
                } else {
                  element.setAttribute('style', 'color: red');
                  element.textContent = `The new value's datatype (${typeof newValue}) doesn't match the databases's data type (${type}).`;
                  element.scrollIntoViewIfNeeded({behavior:'smooth', inline:'start'});
                }
              }
            } else {
              element.textContent = prevValue;
            }
          }
        },
        err => { console.error({err}); }
      );
    }
  };
  
  // Close the modal on click of the X.
  const closeModal = () => {
    setShowDetails(false);
    setIsChecked([]);
    clickCount.current = 0;
  };

  // Toggle the roles' dropdown menu.
  const toggleSelect = (key) => {
    const options = document.getElementById(`select-role-${key}`).children;

    if (options) {
      Object.values(options).forEach(option => {
        if (option.id) {
          if (!option.id.includes('user-role')) {
            option.classList.toggle('show-option');
          } else {
            option.classList.toggle('fade-default')
          }
        }
      });
    }

    setRoleName(null);
  };
  
  // Capture the user's role.
  const handleRoleSelect = (event, idx, key, item, caller) => {
    const roleName = event.target.textContent;
    const options = document.getElementById(`select-role-${key}`).children;

    if (options) {
      Object.values(options).forEach(option => {
        if (option.id) {
          if (!option.id.includes('user-role')) {
            option.classList.remove('show-option');
          } else {
            option.classList.remove('fade-default')
          }
        }
      });
    }

    setRoleName({key, roleName});
    prevElement.current = item.Role;
    handleBlur(item.Id, caller === 'modal' ? idx : key, 'Role', event, idx);
  };
  
  // Send updates to the db for edited fields.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const element = newValue.column !== 'Role' ? document.getElementById(`${newValue.column}-${newValue.row}`) : document.getElementById(`user-role-${newValue.row}`);
      let userRole;
      
      if (JSON.stringify(newValue) !== '{}' && !updated.current) {
        const operation = 'userUpdate';
        const user = new User();

        if ('Role' === newValue.column) {
          userRoles.forEach(role => {
            if (role.Role === newValue.newValue) userRole = role.Id;
          });
        }
        
        user.updateUser(operation, newValue.id, newValue.column, userRole ? userRole : newValue.newValue).then(
          res => {
            if (res.data) {
              let value = res.data[operation] ? res.data[operation][newValue.column] : '';
              const valueType = 10; // 10 === 'string' in the AppParamsValueType table.
              const error = res.data[operation]?.Error;
    
              if (typeof value === 'number') value = JSON.stringify(value);
              if (value) {
                if ('Role' === newValue.column) {
                  userRoles.forEach(role => {
                    if (role.Id === value) value = role.Role;
                  });
                }
                
                if (value === newValue.newValue) {
                  if (element) {
                    if (loggedInUser.id === newValue.id) { // The current user is being modified and needs to be updated in storage.
                      if (newValue.column === 'Role') loggedInUser.role = newValue.newValue;
                      else if (newValue.column === 'Name') loggedInUser.name = newValue.newValue;

                      setLoggedInUser(loggedInUser);
                      localStorage.setItem('user', JSON.stringify(loggedInUser));
                    }
                    
                    element.removeAttribute('contentEditable');
                    element.setAttribute('data-default-value', newValue.newValue);
                    element.scrollIntoViewIfNeeded({behavior:'smooth', inline:'start'});
                    element.classList.toggle('edited');
                    
                    setTimeout(() => {
                      element.classList.toggle('edited');
                      updated.current = true;
                    }, 2000);
                  }

                  // Log the change to the database.
                  logChange('Users', newValue.column, newValue.id, newValue.prevValue, newValue.newValue, valueType).then(
                    res => {
                      if (res.data) {
                        const changeDateTime = res.data?.logChange?.DateTime;
                        changeDate.current = changeDateTime;
                        setNewValue({}); 
                      } else if (res.errors) {
                        console.error(res.errors);
                      }
                    },
                    err => { console.error({err}); }
                  );
                }
              } else if (error) {
                element.textContent = error + ' Please correct your input.';
                element.setAttribute('style', 'color:red');
              }
            } else if (res.name) {
              setError(res.name);
            }
          },
          err => { console.error({err}) }
        );
      }
    }
    
    return () => mounted = false;
  }, [loggedInUser, newValue, userRoles]);

  // Get the tabs for the page.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (items.length > 0) {
        // const tabsObject = {'All Roles': 0};
        const tabsArray = ['All Roles'];
        let tempTabs = [...items];
                
        // Sort the array by role ID, so that the tabs will always be in the same order.
        tempTabs.sort((a, b) => {
          const one = parseInt(a.RoleId);
          const two = parseInt(b.RoleId);
        
          return one > two ? 1 : -1;
        });
  
        // Reduce the array of tempTabs to unique ones only.
        tempTabs.forEach(item => {
          // tabsObject[item.Role] = item.RoleId;
          if (!tabsArray.includes(item.Role)) tabsArray.push(item.Role);
        });
  
        // setTabs(Object.entries(tabsObject));
        setTabs(tabsArray);

      };
    }
    return () => mounted = false;
  }, [items]);
  
  // Populate and update users from props.
  useEffect(() => {
    let mounted = true;
    if (mounted) if (props.users) setUsers(props.users);
    return () => mounted = false;
  }, [props.users]);
  
  // Toggle allChecked.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (users && users.length !== 0 && isChecked.length === users.length) setAllChecked(true);
      else setAllChecked(false);
    }
    return () => mounted = false;
  }, [isChecked, users]);
  
  // Set the active tab, when it changes.
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      if (props.activeTab && activeTab !== props.activeTab) {
        setActiveTab(props.activeTab);
      }
    }

    return () => mounted = false;
  }, [activeTab, props.activeTab]);
  
  // Set the active-tab count.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (Array.isArray(props.users)) {
        let counter = 0;
        props.users.forEach(user => {
          if (user.Role === activeTab || activeTab === 'All Roles') counter++;
        });
        setActiveTabCount(counter);
      }
    }
    return () => mounted = false;
  }, [props.users, activeTab]);
  
  // Show or hide optional actions.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const element = document.getElementById('retried-order-message');
      if (isChecked.length > 0) {
        const className = element ? element.getAttribute('class') : '';        
        if (className && !className.includes('hidden')) element.setAttribute('class', `${className}-hidden`);
        setActiveLink(true);
      } else {
        const className = element ? element.getAttribute('class').replace('-hidden', '') : ''; 
        if (className) element.setAttribute('class', className);
        setActiveLink(false);
      }
    }
    return () => mounted = false;
  }, [isChecked]);
  
  // Set loggedInUser from local storage.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setLoggedInUser(JSON.parse(localStorage.getItem('user')));
    }
    return () => mounted = false;
  }, []);

  // Set the activeTabIndex variable.
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      const activeTabKeyValue = Object.entries(tabs).filter(job => job[1] === formatHeaders(activeTab));
      if (activeTabKeyValue && activeTabKeyValue.length > 0) setActiveTabIndex(parseInt(activeTabKeyValue[0][0]));
    }

    return () => mounted = false;
  }, [activeTab, tabs]);

  // Set showMessage after a user has been added.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (props.action === 'Add User') setShowMessage(true)
    }
    return () => mounted = false;
  }, [props.action]);
  
  // Update the vpWidth variable.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const handleResize = () => {
        setVpWidth(window.innerWidth);
      }
      window.addEventListener('resize', handleResize)
    }
    return () => mounted = false;
  }, [vpWidth]);
  
  // Get the user's available roles for sign-up.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const user = new User(); // Must create a new user inside the useEffect, otherwise the code runs ad nauseum.
      user.getUserRoles().then(
        res => {
          if (res.data) {
            const userRoles = res.data?.getUserRoles;
            setUserRoles(userRoles);
          } else if (res.name) {
            setError(res.message);
          }
        },
        err => { console.error({err}); }
      );
    }
    return () => mounted = false;
  }, []);
  
  return props.error ? 
  ( // Render the sign-in error.
    <div className="signin-error">{props.error.message}</div>
  ) 
  : !props.isLoaded ? 
  (  // Render the loading message.
    <div className="loading unprocessed">Loading . . . </div>
  ) 
  : loggedInUser?.role === 'Admin' ?
  ( // If the user has the correct permissions, load the page.
    items ?
    (
      <div className='user-container'>
        <div className="order-actions user">
          <Tabs activeTab={activeTab} tabIndex={activeTabIndex} tabs={tabs} handleClick={handleTabClick} caller={'user'} />
        </div>
        <div className="order-info">
          <div className='stats'>
            {tabs.length > 1 ? <p className="order-info-number-display">Tab: {`${activeTabIndex + 1} of ${tabs.length}`}</p> : null}
            <p className="order-info-number-display">Selected: {isChecked.length}</p>
            <p className="order-info-number-display">Count: {activeTabCount}</p>
          </div>
            <div className='action-links'>
              <form className='link'>
                <Link
                  to={{
                    pathname: '/login',
                    state: {
                      user: {
                        id: '',
                        action: 'Add User',
                        role: activeTab !== 'All Roles' ? activeTab : ''
                      }
                    },
                  }}
                  >
                  Add
                </Link>
                {activeLink ? (
                  <Link
                    to={{
                      pathname: '/users',
                      state: {
                        id: isChecked,
                        action: 'Delete User',
                      },
                    }}
                    onClick={() => action('deleteUser')}
                  >
                    Delete
                  </Link>
                ) : (
                  ''
                )}
              </form>
            </div>
            {!activeLink && error ? (
              <div>Error: {error}</div>
            ) : (
              ''
            )}
            {(props.action === 'Delete User' || props.action === 'Add User') && showMessage ? 
            (
              !error ? 
              (
                props.message && !activeLink ?
                (
                  <div className="retried-order-set" id="retried-order-message" ref={messageRef}>
                    <p>{props.message}</p>
                  </div>
                ) : props.id && !activeLink ? 
                (
                  !Array.isArray(props.id) ? 
                  (
                    <div className="retried-order-set" id="retried-order-message" ref={messageRef}>
                      <p>User #{props.id} has been {message(props.action)}.</p>
                    </div>
                  ) 
                  : 
                  (
                    props.id.length === 1 ? 
                    (
                      <div className="retried-order-set" id="retried-order-message" ref={messageRef}>
                        <p>User #{props.id[0]} has been {message(props.action)}.</p>
                      </div>
                    ) 
                    : 
                    (
                      <div className="retried-order-set" id="retried-order-message" ref={messageRef}>
                        <p>The following users have been {message(props.action)}:&nbsp;</p>
                        <div className='orders-in-array'>
                          {props.id.map((id, key) => (
                            props.id.length === 1 ?
                            (
                              <p key={key}>{id}</p>
                            )
                            : key === props.id.length - 1 ?
                            (
                              <p key={key}>{id}.</p>
                            )
                            :
                            (
                              <p key={key}>{id},<span>&nbsp;</span></p>
                            )
                            ))}
                        </div>
                      </div>
                    )
                  )
                ) : ( 
                  '' 
                )
              ) 
              : // There was an error in the action.
              ( 
              props.id ? 
              (
                !Array.isArray(props.id) ? 
                (
                  <div className="retried-order-set" id="retried-order-message" ref={messageRef}>
                    <p>The following error occurred when user #{props.id} was {message(props.action)}: {error}.</p>
                  </div>
                ) : (
                  props.id.length > 1 ?
                  (
                    <div className="retried-order-set" id="retried-order-message" ref={messageRef}>
                      <p>There was a "{error}" error when the following IDs were {message(props.action)}:</p>
                      <div className='orders-in-array'>
                        {props.id.map((id, key) => (
                          <p key={key}>{id}</p>))}
                      </div>
                    </div>
                  ) : (
                    <div className="retried-order-set" id="retried-order-message" ref={messageRef}>
                      <p>The following error occurred when user #{props.id[0]} was {message(props.action)}: {error}.</p>
                    </div>
                  )
                )
              ) : (
                ''
              )
            )
          ) : (
            ''
          )}
          {showDetails ? <OrderDetails details={orderDetails} closeModal={closeModal} handleBlur={handleBlur} handleClick={handleClick} toggleSelect={toggleSelect} handleRoleSelect={handleRoleSelect} getClassNamesFor={getClassNamesFor} caller={{ users: 'user' }} userRoles={userRoles} /> : null}
        </div>
        <table>
          <thead>
            <tr className="header-row">
              {items.length !== 0 ? (
                <th className='checkbox-th'>
                  <Checkbox
                    type='checkbox'
                    name='selectAll'
                    handleClick={handleSelectAll}
                    isChecked={allChecked}
                    value={activeTab ? activeTab : ''}
                  />
                </th>
              ) : (
                <th className='hidden-checkbox'></th>
              )}
              {formattedHeaders.map((header, key) => (
                vpWidth < 1280 ?
                (
                  header !== 'Email' && header !== 'Date Registered' && header !== 'Last Login' && header !== 'Logged In' && header !== 'Failed Attempts' ?
                  (
                    <th
                      key={key}
                      onClick={() => requestSort(header.split(' ').join(''))}
                      className={getClassNamesFor(header.split(' ').join(''))}
                    >
                      {header}
                    </th>
                  )
                  :
                  (
                    null
                  )
                )
                :
                (
                  <th
                    key={key}
                    onClick={() => requestSort(header.split(' ').join(''))}
                    className={getClassNamesFor(header.split(' ').join(''))}
                  >
                    {header === 'Failed Attempts' ? 'Failed' : header === 'Date Registered' ? 'Registered' : header}
                  </th>
                )
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, key) => {
              return item.Role === activeTab || activeTab === 'All Roles' ? 
              (
                <tr key={key}>
                  <td className='select-one'>
                    <Checkbox
                      type='checkbox'
                      name={item.Id}
                      value={item.Id ? item.Id : ''}
                      handleClick={handleSelect}
                      isChecked={isChecked.includes(item.Id)}
                    />
                  </td>
                  <td className='user-link'>
                    {vpWidth < 1280 ? (
                      <Link to='#' onClick={() => action('showDetails', item, key)} >
                        {item.Id}
                      </Link>
                    )
                    :
                    (
                      item.Id
                    )}
                  </td>
                  <td
                    className="editable"
                    suppressContentEditableWarning="true"
                    data-default-value={item.Name}
                    id={`Name-${key}`}
                    onBlur={(e) => handleBlur(item.Id, key, 'Name', e)}
                    onClick={(e) => handleClick(e.target, key, 'Name')}
                  >
                    {item.Name}
                  </td>
                  <td className='desktop'>{item.Email}</td>
                  <td className='editable select-container' id={`select-role-${key}`} name='role'>
                    <p 
                      className='role-option default' 
                      id={`user-role-${key}`}
                      data-default-value={item.Role}
                      onClick={() => toggleSelect(key)}
                    >
                      {roleName && parseInt(roleName.key) === key ? roleName.roleName : item.Role}
                    </p>
                    {userRoles.map((value, idx) => (
                      <p 
                        className='role-option' 
                        id={`Role-${idx}`}
                        key={idx} 
                        data-value={value.Id} 
                        onClick={(e) => handleRoleSelect(e, idx, key, item)}
                      >
                        {value.Role}
                      </p>
                    ))}
                  </td>
                  <td className='desktop'>
                    {item.DateRegistered ? new Date(parseInt(item.DateRegistered)).toISOString().split('T')[0] : 'N/A'}
                  </td>
                  <td className='desktop'>
                    {item.LastLogin ? new Date(parseInt(item.LastLogin)).toISOString().split('T')[0] : 'N/A'}
                  </td>
                  <td className='desktop'>{item.LoggedIn ? 'Yes' : 'No'}</td>
                  <td className='desktop'>{item.FailedAttempts ? item.FailedAttempts : 0}</td>
                  <td>{item.Active ? 'Yes' : 'No'}</td>
                </tr>
              ) : (
                null
              )
              })}
          </tbody>
        </table>
      </div>
    ) 
    : 
    ( 
      <p>No users have been registered for this service.</p>
    )
  ) 
  : 
  (
    <div className="role-denied">Your profile's assigned role of "{loggedInUser?.role}" does not allow you to access this page.</div>
  )
}

export default Users;
