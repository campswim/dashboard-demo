import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import useSort from '../../hooks/sort-data';
import getType from '../../hooks/get-type';
import selectElementContents from '../../hooks/select-all';
import logChange from '../../hooks/log-change';
import { updateSettings, getParamByName } from '../../hooks/get-settings';
import formatHeaders from '../../hooks/format-headers';
import OrderDetails from '../../components/order-details';

const Params = props => {  
  const [orderDetails, setOrderDetails] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [newValue, setNewValue] = useState({});
  const [vpWidth, setVpWidth] = useState(window.innerWidth);
  const dataType = useRef({}); // => dataType.current = {ColumnName, DataType, MaxLength}
  const changeDate = useRef('');
  const clickCount = useRef(0);
  const clickLocation = useRef('');
  const updated = useRef(false);
  let { items, requestSort, sortConfig } = useSort(props.paramsData ? props.paramsData : '', 'params');
  const error = items && Array.isArray(items) && items.length === 1 && items[0].message ? items[0] : '';

  const getClassNamesFor = useCallback(name => {
    if (!sortConfig) return;

    let className = 'Name' !== name && 'ValueType' !== name && 'ModifiedAt' !== name && 'ModifiedBy' !== name ? 'header-editable' : '';
    className = sortConfig.key === name ? sortConfig.direction + ' ' + className : className;
    return className ? className : undefined;
  }, [sortConfig]);

  // Format the headers.
  const headers = items && items.length > 0 ? formatHeaders(Object.keys(items[0]), ['ValueTypeId', 'EnabledDate', 'CreatedAt', 'CreatedBy', 'UserId', 'Error']) : '';

  const handleClick = (event, row, column, id, enabledDate = null, item, idx) => {    
    let currentValue = event.textContent;
    let defaultValue = event.dataset.defaultValue, element;

    if ('✓' === defaultValue) element = document.getElementById(`checkmark-${row}`);
    else element = document.getElementById(`${column}-${row}`);
    
    if (clickLocation.current !== event.id) clickCount.current = 0;
    if (clickCount.current <= 1 && vpWidth >= 1024) selectElementContents(element); // Selects all content in the field.
    clickCount.current++;
    clickLocation.current = event.id;

    if ('Name' !== column) { // Editing the Name column is not allowed, it being the PK in the db table.      
      if (defaultValue !== currentValue) { // Replace errors in entries with the previous text; also, check unchecked boxes for the DateEnabled field.
        element.textContent = defaultValue;
        element.removeAttribute('style');

        if ('EnabledDate' === column) element.setAttribute('style', 'color:green');
      } else {
        if ('EnabledDate' !== column) element.setAttribute('contentEditable', 'true');
        else {
          element.textContent = 'X';
          element.setAttribute('style', 'color:red');
        }
      }
    }
    
    if ('EnabledDate' === column) { // Update the EnabledDate in the db with today's date/time (in YYYY-MM-DD HH:MM:SS).
      currentValue = 'X' === currentValue ? new Date().toISOString() : 'disable';
      defaultValue = 'disable' || 'X' === currentValue ? `checkmark-${row}` : defaultValue;
      setNewValue({ id, row, column, prevVal: defaultValue, newVal: currentValue, enabledDate, idx });

      if (vpWidth < 1280) {
        item['EnabledDate'] = currentValue;
        setOrderDetails(item);
      }
    }
  }

  // Handle user edits.
  const handleBlur = (id, row, column, event, idx) => {
    const prevValue = event.target.dataset.defaultValue ? event.target.dataset.defaultValue : 'None';
    const newVal = event.target.textContent ? event.target.textContent : 'None';
    const table = 'AppParams';
    const element = document.getElementById(`${column}-${row}`);

    if (prevValue === newVal && prevValue !== 'None') {
      element.removeAttribute('contentEditable');
      return;
    }

    // Get the column's configuration from the DB.
    if (table && column) {
      getType(table, column).then(
        res => {
          dataType.current = res;

          // Check the input against type and length.
          if (JSON.stringify(dataType.current) !== '{}') {
            if (newVal) {
              const columnName = dataType.current.ColumnName;
              if (columnName === column) {
                const type = dataType.current.DataType;
                let typeNewValue = columnName === 'ValueType' ? parseInt(newVal) : newVal;
                typeNewValue = Number.isNaN(typeNewValue) ? typeNewValue : typeof typeNewValue;

                if (type === typeNewValue) {
                  if (dataType.current.MaxLength > newVal.length || !dataType.current.MaxLength) {
                    if (!/<\/?[a-z][\s\S]*>/i.test(newVal)) { // Check that no html is being introduced.
                      if (vpWidth > 1280) {          
                        items[row][column] = newVal ? newVal : 'None'; // For desktop.
                      } else {
                        if (idx) items[idx][column] = newVal ? newVal : 'None'; // For edits in the modal.
                      }
                      element.textContent = newVal;
                      setNewValue({ id, row, column, prevValue, newVal, idx });
                      updated.current = false;
                    } else {
                      element.setAttribute('style', 'color: red');
                      element.textContent = 'There is html in the new value. Please revise your input and resubmit.';
                      element.scrollIntoViewIfNeeded({behavior:'smooth', inline:'start'});
                    }
                  }
                } else {
                  element.setAttribute('style', 'color: red');
                  element.textContent = `The new value's datatype (${typeof newVal}) doesn't match the databases's data type (${type}).`;
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

  // Handles the action chosen by the user, if applicable.
  const action = (path, item, idx) => {
    if (path === 'showDetails') {
      item.idx = idx;
      setShowDetails(true);
      setOrderDetails(item);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    //Store a flag in storage to indicate that a new action has been initiated.
    sessionStorage.setItem('action', true);
  };
  
  // Close the modal on click of the X.
  const closeModal = () => {
    setShowDetails(false);
    clickCount.current = 0;
    // setIsChecked([]);
  };  
  
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

  // Send updates to the db for edited fields.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const element = document.getElementById(`${newValue.column}-${newValue.row}`);
      
      if (JSON.stringify(newValue) !== '{}' && !updated.current) {
        // Get the parameter's previous value.
        getParamByName(newValue.id).then(
          res => {
            const prevEnabledDate = res?.getParamByName?.EnabledDate;
            const paramByNameError = res?.getParamByName?.Error;
  
            // Update the parameter's value in the AppParams table.
            updateSettings('params', newValue.id, newValue.column, newValue.newVal).then(
              res => {
                let value = res?.data?.paramsUpdate[newValue.column] ? res?.data?.paramsUpdate[newValue.column] : 'None';
                const valueType = res?.data?.paramsUpdate?.ValueTypeId;
                const error = res?.data?.paramsUpdate?.Error;
                const userId = JSON.parse(localStorage.getItem('user')).id;
                const enabledDate = res?.data?.paramsUpdate?.EnabledDate;
                
                if (typeof value === 'number') value = JSON.stringify(value);
                if (value === newValue.newVal) {
                  if (element) {
                    const modifiedAtElement = document.getElementById(`ModifiedAt-${newValue.row}`);
                    const modifiedByElement = document.getElementById(`ModifiedBy-${newValue.row}`);
                    
                    element.removeAttribute('contentEditable');
                    // element.textContent = newValue.newVal ? newValue.newVal : 'None';
                    modifiedAtElement.textContent = new Date().toISOString().split('T')[0];
                    modifiedByElement.textContent = props.user.name;

                    if (newValue.column !== 'EnabledDate') element.setAttribute('data-default-value', newValue.newVal);

                    element.scrollIntoViewIfNeeded({behavior:'smooth', inline:'start'});
                    element.classList.toggle('edited');
                    setTimeout(() => {
                      element.classList.toggle('edited');
                      updated.current = true;
                    }, 2000);
                  }
                    
                  // Log the change to the database.
                  logChange('AppParams', newValue.id, newValue.column, userId, newValue.prevValue, newValue.newVal, valueType).then(
                    res => {
                      if (res.data) {
                        const changeDateTime = res.data?.logChange?.DateTime;
                        changeDate.current = changeDateTime;
                      } else if (res.errors) {
                        console.error(res.errors);
                      }
                    },
                    err => { console.error({err}); }
                  );
                } else if (error && null !== error.message) {
                  element.textContent = error.message + ' Please correct your input.';
                  element.setAttribute('style', 'color:red');
                } else if (res?.errors) {
                  let errorString = '';
    
                  if (res.errors.length > 0 && res.errors.length < 2) {
                    errorString = res.errors[0].message;
                  } else if (res.errors.length >= 2) {
                    res.errors.forEach((error, idx) => {
                      if (idx === 0) errorString += error.message;
                      else if (idx === res.errors.length - 1) errorString += ', ' + error.message;
                      else errorString += ', ' + error.message;
                    });
                  }
    
                  if (errorString) {
                    element.textContent = errorString + ' Please correct your input.';
                    element.setAttribute('style', 'color:red; white-space:pre-wrap');
                  }
                } else { // Special logging for the date-enabled column.
                  if (newValue.column === 'EnabledDate' & !paramByNameError) {
                    logChange('AppParams', newValue.id, newValue.column, userId, prevEnabledDate ? new Date(parseInt(prevEnabledDate)).toISOString() : null, enabledDate ? new Date(parseInt(enabledDate)).toISOString() : null, 8).then(
                      res => {
                        const changeDateTime = res?.logChange?.DateTime;
                        changeDate.current = changeDateTime;
                      },
                      err => { console.error({err}); }
                    );
                  } else {
                    console.error({paramByNameError});
                  }
                }
              },
              err => { console.error({err}) }
            );
          },
          err => { console.error(err); }
        );
      }
    }

    return () => mounted = false;
  }, [items, newValue, props, orderDetails, vpWidth]);
    
  return props.error ? 
  ( 
    <div className="signin-error">{props.error.message}</div> 
  ) 
  : !props.isLoaded ? 
  ( 
    <div className="loading">Loading . . .</div> 
  ) 
  : error ?
  (
    <div>
      <p>{error.name ? error.name + ': ' : null}{error.message}</p>
    </div>
  ) 
  : props.role === 'Admin' ?
  (
      <>
        <div className="order-info no-actions">
        {showDetails ? <OrderDetails details={orderDetails} closeModal={closeModal} handleBlur={handleBlur} handleClick={handleClick} getClassNamesFor={getClassNamesFor} caller={{ settings: 'params' }} /> : null}
        </div>
        <table className="params-table">
          <thead>
            <tr className='header-row'>
              {headers ?
                (
                  <>
                    <th               
                      onClick={() => requestSort('EnabledDate')}
                      className={`${getClassNamesFor('EnabledDate')} desktop`}
                    >
                      Enabled
                    </th>
                    {headers.map((header, key) => (
                      vpWidth < 1280 ?
                      (
                        header !== 'Value' && header !== 'Process Job Ids' && header !== 'Category' && header !== 'Sub Category' && header !== 'Value Type' && header !== 'Notes' && header !== 'Idx' && header !== 'User Id' ?
                        (
                          <th
                            key={key}
                            onClick={() => requestSort(header.split(' ').join(''))}
                            className={getClassNamesFor(header.split(' ').join(''))}
                          >
                            {header === 'Modified At' ? 'Modified' : header === 'Modified By' ? 'By' : header}
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
                          {header === 'Process Job Ids' ? 'Job Ids' : header === 'Modified At' ? 'Modified' : header === 'Modified By' ? 'By' : header === 'Value Type' ? 'Type' : header}
                        </th>
                      )
                    ))}
                  </>
                )
                : null
              }
            </tr>
          </thead>
          <tbody>
            {items.map((item, key) => {
                return item.Name !== 'BcAccessToken' ? 
                (
                  <tr key={key}>
                    <>
                      <td 
                        className="checkmark editable desktop"
                        suppressContentEditableWarning="true" 
                        data-default-value="&#10003;"
                        id={`checkmark-${key}`}
                        onBlur={(e) => handleBlur(item.Name, key, 'EnabledDate', e)} // params: id, row, column, event
                        onClick={(e) => handleClick(e.target, key, 'EnabledDate', item.Name, item.EnabledDate, item, key)} // params: event, row, column, id, enabled date
                        style={item.EnabledDate ? {color:'green'} : {color:'red'}}
                      >
                        {item.EnabledDate ? <>&#10003;</> : 'X'}
                      </td>
                      <td className='params-id'>
                        {vpWidth < 1280 ?
                        (
                          <Link to='#' onClick={() => action('showDetails', item, key)} >
                            {vpWidth < 500 && item.Name && item.Name.length > 15 ? item.Name.substring(0, 12) + '...' : vpWidth <= 768 && item.Name && item.Name.length > 31 ? item.Name.substring(0, 28) + '...' : item.Name ? item.Name : null}
                          </Link>
                        )
                        :
                        (
                          item.Name
                        )}
                      </td>
                      <td
                        className="editable desktop"
                        suppressContentEditableWarning="true" 
                        data-default-value={item.Value ? item.Value : 'None'}
                        // id={`${item.Value}-${key}`}
                        id={`Value-${key}`}
                        onBlur={(e) => handleBlur(item.Name, key, 'Value', e)}
                        onClick={(e) => handleClick(e.target, key, 'Value', item.Name, null, item, key)}
                      >{item.Value ? item.Value : 'None'}
                      </td>
                      {vpWidth < 1280 ? null : <td className='process-job-ids'>{item.ProcessJobIds ? item.ProcessJobIds.split(',').join(', ') : 'None'}</td>}
                      <td
                        className="editable desktop"
                        suppressContentEditableWarning="true" 
                        data-default-value={item.Category ? item.Category : 'None'}
                        // id={`${item.Category}-${key}`}
                        id={`Category-${key}`}
                        onBlur={(e) => handleBlur(item.Name, key, 'Category', e)}
                        onClick={(e) => handleClick(e.target, key, 'Category', item.Name, null, item, key)}
                      >{item.Category ? item.Category : 'None'}</td>
                      <td
                        className="editable desktop"
                        suppressContentEditableWarning="true" 
                        data-default-value={item.SubCategory ? item.SubCategory : 'None'}
                        // id={`${item.SubCategory}-${key}`}
                        id={`SubCategory-${key}`}
                        onBlur={(e) => handleBlur(item.Name, key, 'SubCategory', e)}
                        onClick={(e) => handleClick(e.target, key, 'SubCategory', item.Name, null, item, key)}                  
                      >{item.SubCategory ? item.SubCategory : 'None'}</td>
                      <td className='desktop'>{item.ValueType}</td>
                      <td 
                        className="notes editable desktop"
                        suppressContentEditableWarning="true" 
                        data-default-value={item.Notes ? item.Notes : 'None'}
                        // id={`${item.Notes}-${key}`}
                        id={`Notes-${key}`}
                        onBlur={(e) => handleBlur(item.Name, key, 'Notes', e)}
                        onClick={(e) => handleClick(e.target, key, 'Notes', item.Name, null, item, key)}                  
                      >
                        {item.Notes ? item.Notes : 'None'}
                      </td>
                      <td className='date' id={`ModifiedAt-${key}`}>{item.ModifiedAt ? new Date(parseInt(item.ModifiedAt)).toISOString().split('T')[0] : 'N/A'}</td>
                      <td className='by-user' id={`ModifiedBy-${key}`}>{item.ModifiedBy ? item.ModifiedBy : item.UserId && isNaN(parseInt(item.UserId)) ? item.UserId : 'N/A'}</td>
                    </>
                  </tr>
              ) : null
                    })}
          </tbody>
        </table>        
      </>
  ) 
  :
  (
    <div className="role-denied">Your profile's assigned role of "{props.role}" does not allow you to access this page.</div>
  )
};

export default Params;
