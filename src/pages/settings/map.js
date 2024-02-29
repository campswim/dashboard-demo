import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import useSort from '../../hooks/sort-data';
import getType from '../../hooks/get-type';
import selectElementContents from '../../hooks/select-all';
import logChange from '../../hooks/log-change';
import { updateSettings } from '../../hooks/get-settings';
import formatHeaders from '../../hooks/format-headers';
import OrderDetails from '../../components/order-details';

const Map = props => {  
  const [orderDetails, setOrderDetails] = useState({});
  const [newValue, setNewValue] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [vpWidth, setVpWidth] = useState(window.innerWidth);
  const dataType = useRef({}); // => dataType.current = {ColumnName, DataType, MaxLength}
  const changeDate = useRef('');
  const clickCount = useRef(0);
  const clickLocation = useRef('');
  const updated = useRef(false);

  const { items, requestSort, sortConfig } = useSort(props.mapData ? props.mapData : '', 'map');
  const getClassNamesFor = useCallback(name => {
    if (!sortConfig) return;
    let className = 'SourceWarehouse' === name || 'SourceShipMethod' === name || 'DestinationWarehouse' === name ? 'header-editable' : '';
    className = sortConfig.key === name ? sortConfig.direction + ' ' + className : className;
    return className ? className : undefined;
  }, [sortConfig]);
  const error = items && items.length === 1 && items[0].Error ? items[0].Error : '';
  
  // Format the headers.
  const headers = items && items.length > 0 ? formatHeaders(Object.keys(items[0]), 'Error') : '';

  // Handle a user clicking in editable fields.
  const handleClick = (event, row, column) => {    
    let currentValue = event?.textContent;
    let defaultValue = event.dataset.defaultValue ? event.dataset.defaultValue : 'None';
    const element = document.getElementById(`${column}-${row}`);

    if (clickLocation.current !== event.id) clickCount.current = 0;
    if (clickCount.current <= 1 && vpWidth >= 1024) selectElementContents(element); // Selects all content in the field.
    clickCount.current++;
    clickLocation.current = event.id;

    if (element) {
      if (defaultValue && defaultValue !== currentValue) { // Replace errors in entries with the previous text.
        element.textContent = defaultValue;
        element.removeAttribute('style');
      } else {
        element.setAttribute('contentEditable', 'true'); // Make the element editable.
      }
    }
  }

  // Handle user edits.
  const handleBlur = (id, row, column, event) => {
    const prevVal = event.target.dataset.defaultValue ? event.target.dataset.defaultValue : 'None';
    const newVal = event?.target?.textContent;
    const table = 'Maps';
    const element = document.getElementById(`${column}-${row}`);

    if (prevVal === newVal) {
      element.removeAttribute('contentEditable');
      return;
    }

    // Get the column's configuration from the DB.
    if (table && column) {
      getType(table, column).then(
        res => {
          if (res) dataType.current = res;
                    
          // Check the input against type and length.
          if (JSON.stringify(dataType.current) !== '{}') {
            if (newVal || newVal === '') {
              const columnName = dataType.current.ColumnName;

              if (columnName === column) {
                const type = dataType.current.DataType;
                let typeNewValue = columnName === 'ValueType' ? parseInt(newVal) : newVal;
                typeNewValue = Number.isNaN(typeNewValue) ? typeNewValue : typeof typeNewValue;

                if (type === typeNewValue) {
                  if (dataType.current.MaxLength > newVal.length || !dataType.current.MaxLength) {
                    if (prevVal !== newVal) {
                      if (!/<\/?[a-z][\s\S]*>/i.test(newVal)) { // Check that no html is being introduced.
                        element.textContent = newVal ? newVal : 'None';
                        items[row][column] = newVal ? newVal : 'None';
                        setNewValue({ id: parseInt(id), row, column, prevVal, newVal });
                        updated.current = false;
                      } else {
                        element.setAttribute('style', 'color: red');
                        element.textContent = 'There is html in the new value. Please revise your input and resubmit.';
                        element.scrollIntoViewIfNeeded({behavior:'smooth', inline:'start'});
                      }
                    } 
                  }
                } else {
                  element.setAttribute('style', 'color: red');
                  element.textContent = `The new value's datatype (${typeof newVal}) doesn't match the databases's data type (${type}).`;
                  element.scrollIntoViewIfNeeded({behavior:'smooth', inline:'start'});
                }
              }
            } else {
              element.textContent = prevVal;
            }
          }
        },
        err => { console.error({err}); }
      );
    }
  };

  // Handles the action chosen by the user, if applicable.
  const action = (path, item) => {
    if (path === 'showDetails') {
      setOrderDetails(item);
      setShowDetails(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    //Store a flag in storage to indicate that a new action has been initiated.
    sessionStorage.setItem('action', true);
  };
  
  // Close the modal on click of the X.
  const closeModal = () => {
    setShowDetails(false);
    clickCount.current = 0;
  };

  // Send updates to the db for edited fields.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      const element = document.getElementById(`${newValue.column}-${newValue.row}`);
      
      if (JSON.stringify(newValue) !== '{}' && !updated.current) {
        // Update the settings's value.
        updateSettings('maps', parseInt(newValue.id), newValue.column, newValue.newVal).then(
          res => {
            if (res?.data?.mapsUpdate) {
              let value = res.data?.mapsUpdate[newValue.column];
              value = null === value ? '' : value;
              const error = res.data?.mapsUpdate?.Error;
              const userId = JSON.parse(localStorage.getItem('user')).id;
  
              if (typeof value === 'number') value = JSON.stringify(value);
              if (value === newValue.newVal) {
                if (element) {
                  const modifiedAtElement = document.getElementById(`ModifiedAt-${newValue.row}`);
                  const modifiedByElement = document.getElementById(`ModifiedBy-${newValue.row}`);
                  
                  element.removeAttribute('contentEditable');
                  modifiedAtElement.textContent = new Date().toISOString().split('T')[0];
                  modifiedByElement.textContent = props.user.name;
                  element.setAttribute('data-default-value', newValue.newVal ? newValue.newVal : 'None');

                  element.scrollIntoViewIfNeeded({behavior:'smooth', inline:'start'});
                  element.classList.toggle('edited');

                  setTimeout(() => {
                    element.classList.toggle('edited');
                    updated.current = true;
                  }, 2000);
                }
                                
                // Log the change to the database.
                logChange('AppParams', `${newValue.id}`, newValue.column, userId, newValue.prevVal, newValue.newVal, dataType.current.DataType).then(
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
              }
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
            }
          },
          err => { console.error({err}) }
        );
      }
    }

    return () => mounted = false;
  }, [items, newValue, props]);
  
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
  });
  
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
      <p>{error.name}: {error.message}</p>
    </div>
  ) 
  : props.role === 'Admin' ?
  (
    <>
      <div className="order-info no-actions">
        {showDetails ? <OrderDetails details={orderDetails} closeModal={closeModal} handleBlur={handleBlur} handleClick={handleClick} getClassNamesFor={getClassNamesFor} caller={{ settings: 'maps' }} /> : null}
      </div>
      <div className="map-table-large">
        <table className="map-table">
          <thead>
            <tr className='header-row'>
              {headers ? 
              (
                headers.map((header, key) => (
                  vpWidth < 1280 ?
                  (
                    header !== 'Company' && header !== 'Erp Company Id' && header !== 'Source Warehouse' && header !== 'Source Ship Method' && header !== 'Destination Warehouse' && header !== 'Iso Currency Code' && header !== 'Erp Currency Code' && header !== 'Processing Sequence' && header !== 'Activated At' && header !== 'Deactivated At' ?
                    (
                      <th
                        key={key}
                        onClick={() => requestSort(header.split(' ').join(''))}
                        className={getClassNamesFor(header.split(' ').join(''))}
                      >
                        {header === 'Iso Country Code' ? 'Country' : header === 'Modified At' ? 'Modified' : header === 'Modified By' ? 'By' : header}
                      </th>
                    )
                    :
                    (
                      null
                    )
                  )
                  :
                  (
                    header !== 'Activated At' ?
                    (
                      <th
                        key={key}
                        onClick={() => requestSort(header.split(' ').join(''))}
                        className={getClassNamesFor(header.split(' ').join(''))}
                      >
                        {header === 'Iso Country Code' ? 'Country' : header === 'Modified At' ? 'Modified' : header === 'Modified By' ? 'By' : header === 'Source Warehouse' ? 'Src WH' : header === 'Source Ship Method' ? 'Src Ship' : header === 'Destination Warehouse' ? 'Dest WH' : header === 'Iso Currency Code' ? 'ISO $' : header === 'Erp Currency Code' ? 'ERP $' : header === 'Processing Sequence' ? 'Seq' : header === 'Activated At' ? 'Activated' : header === 'Deactivated At' ? 'Deactivated' : header}
                      </th>
                    )
                    :
                    (
                      null
                    )
                  )
                ))
              )
              : null
            }
            </tr>
          </thead>
          <tbody>
          {items.map((item, key) => (
              <tr key={key}>
                <td className="map-id">
                  {vpWidth < 1280 ?
                  (
                    <Link to='#' onClick={() => action('showDetails', item)} >
                      {item.Id ? item.Id : 'None'}
                    </Link>
                  )
                  :
                  (
                    item.Id ? item.Id : 'None'
                  )}
                </td>
                <td>{item.IsoCountryCode}</td>
                <td className="desktop">{item.ErpCompanyId}</td>
                <td
                  className="editable desktop"
                  suppressContentEditableWarning="true"
                  data-default-value={item.SourceWarehouse}
                  // id={`${item.SourceWarehouse}-${key}`}
                  id={`SourceWarehouse-${key}`}
                  onBlur={(e) => handleBlur(item.Id, key, 'SourceWarehouse', e)}
                  onClick={(e) => handleClick(e.target, key, 'SourceWarehouse')}
                >
                  {item.SourceWarehouse ? item.SourceWarehouse : 'None'}
                </td>
                <td
                  className="editable desktop"
                  suppressContentEditableWarning="true"
                  data-default-value={item.SourceShipMethod ? item.SourceShipMethod : 'None'}
                  // id={`${item.SourceShipMethod ? item.SourceShipMethod : 'None'}-${key}`}
                  id={`SourceShipMethod-${key}`}
                  onBlur={(e) => handleBlur(item.Id, key, 'SourceShipMethod', e)}
                  onClick={(e) => handleClick(e.target, key, 'SourceShipMethod')}                
                >
                  {item.SourceShipMethod ? item.SourceShipMethod : 'None'}
                </td>
                <td
                  className="editable desktop"
                  suppressContentEditableWarning="true"
                  data-default-value={item.DestinationWarehouse}
                  // id={`${item.DestinationWarehouse}-${key}`}
                  id={`DestinationWarehouse-${key}`}
                  onBlur={(e) => handleBlur(item.Id, key, 'DestinationWarehouse', e)}
                  onClick={(e) => handleClick(e.target, key, 'DestinationWarehouse')}                                
                >
                  {item.DestinationWarehouse ? item.DestinationWarehouse : 'None'}
                </td>
                <td className='desktop'>{item.IsoCurrencyCode}</td>
                <td className='desktop'>{item.ErpCurrencyCode}</td>
                <td className='desktop'>{item.ProcessingSequence ? item.ProcessingSequence : 'None'}</td>
                {/* <td className='desktop'>
                  {item.ActivatedAt ? new Date(parseInt(item.ActivatedAt)).toISOString().split('T')[0] : 'None'}
                </td> */}
                <td className='desktop'>
                  {item.DeactivatedAt ? new Date(parseInt(item.DeactivatedAt)).toISOString().split('T')[0] : 'None'}
                </td>
                <td className='date' id={`ModifiedAt-${key}`}>{item.ModifiedAt ? new Date(parseInt(item.ModifiedAt)).toISOString().split('T')[0] : 'N/A'}</td>
                <td className='by-user' id={`ModifiedBy-${key}`}>{item.ModifiedBy ? item.ModifiedBy : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
  :
  (
    <div className="role-denied">Your profile's assigned role of "{props.role}" does not allow you to access this page.</div>

  )
};

export default Map;
