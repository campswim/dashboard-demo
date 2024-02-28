import React, { useState, useEffect } from 'react';
import formatHeaders from '../hooks/format-headers';
import formatCurrency from '../hooks/format-currency';

const OrderDetails = props => {
  const [item, setItem] = useState({});
  const [pastedValue, setPastedValue] = useState(null);
  const category = props.caller ? Object.keys(props.caller)[0] : null;
  const caller = props.caller ? Object.values(props.caller)[0] : null;
  const editableFields = {
    settings: {
      maps: [
        'SourceWarehouse',
        'SourceShipMethod',
        'DestinationWarehouse'
      ],
      params: [
        'EnabledDate',
        'Value',
        'Category',
        'SubCategory',
        'Notes'
      ]
    },
    users: {
      user: [
        'Name',
        'Role'
      ]
    }
  };

  const closeModal = () => {
    const main = Object.values(document.getElementsByTagName('main'))[0];
    const attribute = main.getAttribute('style');
    if (attribute) main.removeAttribute('style'); // Remove the style attribute that fixes the main's height upon closing the modal.
    props.closeModal();
  };
  
  const handlePaste = (event, id) => {
    event.preventDefault();
    const paste = (event.clipboardData || window.clipboardData).getData('text');
    setPastedValue([id, paste]);
  };

  const handleClick = (e, key, item) => {
    const role = document.getElementById(`user-role-${key}`);
    const newRole = e.target.textContent;

    if (role && newRole) role.textContent = newRole;

    props.handleRoleSelect(e, props.details.idx, key, item, 'modal');
  };

  // Populate the item state variable.
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setItem(props.details);
    }
    return () => mounted = false;
  }, [props.details]);
  
  // Resize the main tag to fit the modal.
  useEffect(() => {
    const modal = document.getElementsByClassName('order-details-modal');
    
    if (modal && modal.length > 0) {
      const main = Object.values(document.getElementsByTagName('main'))[0];
      const modalHeight = Object.values(modal)[0]?.clientHeight;
      const mainHeight = main.clientHeight;

      if (modalHeight > mainHeight) {
        main.setAttribute('style', `height: ${modalHeight + 10}px`);
      } else {
        const attribute = main.getAttribute('style');
        if (attribute) main.removeAttribute('style');
      }
    }
  }, [item]);
    
  return item && JSON.stringify(item) !== '{}' ? 
  (
    <div className='order-details-modal'>
      <div className='x-close-container'>
        <span className="x-close" onClick={() => closeModal()}>x</span>
      </div>
      <div className='order-details-card'>
        {Object.entries(item).map((detail, key) => (
          detail[0] !== 'idx' ? 
          (
            <div key={key} className='order-details-detail'>
              {caller && category ? 
              (
                editableFields[category][caller].includes(detail[0]) ?
                (
                  <div className='order-details-detail-container'>
                    {detail[0] === 'EnabledDate' ? 
                    (
                      <>
                        <p className={props.getClassNamesFor(detail[0])}>Enabled</p>
                        <p
                        className="editable"
                        suppressContentEditableWarning="true"
                        data-default-value="&#10003;"
                        id={`checkmark-${key}`}
                        onBlur={(e) => props.handleBlur(caller === 'maps' ? item.Id : item.Name, key, detail[0], e, caller === 'params' ? item.idx : null)}
                        onClick={(e) => props.handleClick(e.target, key, detail[0], item.Name, item.EnabledDate, item, item.idx)}
                        onPaste={(e) => {handlePaste(e, `${detail[1] ? detail[1] : 'None'}-${key}`)}}
                      >
                        {detail[1] && detail[1] !== 'disable' ? <span data-default-value="&#10003;">&#10003;</span> : <span data-default-value="&#10003;">No</span>}
                      </p>
                    </>
                    )
                    : detail[0] === 'Role' ?
                    (
                      <>
                        <p className={props.getClassNamesFor(detail[0])}>{formatHeaders(detail[0])}</p>
                        <div className='editable select-container' id={`select-role-${key}`} name='role'>
                          <p 
                            className='role-option default' 
                            id={`user-role-${key}`}
                            data-default-value={detail[1]}
                            onClick={() => props.toggleSelect(key)}
                          >
                            {detail[1]}
                          </p>
                          {props.userRoles.map((value, idx) => (
                            <p 
                              className='role-option' 
                              id={`${item.Role}-${idx}`}
                              key={idx} 
                              data-value={value.Id} 
                              onClick={(e) => handleClick(e, key, item)}
                            >
                              {value.Role}
                            </p>
                          ))}
                        </div>
                      </>
                    )
                    :
                    (
                      <>
                        <p className={props.getClassNamesFor(detail[0])}>{formatHeaders(detail[0])}</p>
                        <p
                          className="editable"
                          suppressContentEditableWarning="true"
                          data-default-value={detail[1]}
                          id={`${detail[0] ? detail[0] : 'None'}-${key}`}
                          onBlur={(e) => props.handleBlur(caller === 'maps' || caller === 'user' ? item.Id : item.Name, caller === 'user' ? item.idx : key, detail[0], e, caller === 'params' || caller === 'user' ? item.idx : null)}
                          onClick={(e) => props.handleClick(e.target, key, detail[0])}
                          onPaste={(e) => {handlePaste(e, `${detail[1] ? detail[1] : 'None'}-${key}`)}}
                        >
                          {pastedValue && pastedValue[1] !== detail[1] && pastedValue[0] === `${detail[1] ? detail[1] : 'None'}-${key}` ? pastedValue[1] : detail[1] ? detail[1] : 'None'}
                        </p>
                      </>
                    )}
                  </div>
                )
                : detail[0] === 'ActivatedAt' || detail[0] === 'DeactivatedAt' || detail[0] === 'ModifiedAt' || detail[0] === 'At' || detail[0] === 'DateRegistered' || detail[0] === 'LastLogin' || detail[0] === 'OrderDate' || detail[0] === 'IgnoredAt' || detail[0] === 'StagingImportDate' || detail[0] === 'IgnoredDate' ?
                (
                  <div className='order-details-detail-container'>
                    <p>{formatHeaders(detail[0])}</p>
                    <p>{detail[1] ? new Date(parseInt(detail[1])).toISOString().split('T')[0] : 'N/A'}</p>
                  </div>
                )
                : detail[0] === 'ProcessJobIds' ?
                (
                  <div className='order-details-detail-container'>
                    <p>{formatHeaders(detail[0])}</p>
                    <p>{detail[1] ? detail[1].split(',').join(', ') : null}</p>
                  </div>
                )  
                :
                (
                  <div className='order-details-detail-container'>
                    <p>{formatHeaders(detail[0])}</p>
                    <p>{(detail[0] === 'LoggedIn' || detail[0] === 'Active') && detail[1] ? 'Yes' : (detail[0]  === 'LoggedIn' || detail[0] === 'Active') && !detail[1] ? 'No' : detail[1] ? detail[1] : 'None'}</p>
                  </div>
                )
              )
              : detail[0] === 'ActivatedAt' || detail[0] === 'DeactivatedAt' || detail[0] === 'ModifiedAt' || detail[0] === 'At' || detail[0] === 'DateRegistered' || detail[0] === 'LastLogin' || detail[0] === 'OrderDate' || detail[0] === 'IgnoredAt' || detail[0] === 'StagingImportDate' || detail[0] === 'IgnoredDate' || detail[0] === 'DismissedAt' ?
              (
                <div className='order-details-detail-container'>
                  <p>{formatHeaders(detail[0])}</p>
                  <p>{detail[1] ? new Date(parseInt(detail[1])).toISOString().split('T')[0] : 'None'}</p>
                </div>
              )
              :
              (
                detail[0] !== 'CurrencyCode' ? 
                (
                  <div className='order-details-detail-container'>
                    <p>{formatHeaders(detail[0])}</p>
                    <p>{detail[0].includes('OrderTotal') ? formatCurrency(detail[1], item['CurrencyCode']) : detail[1] ? detail[1] : 'None'}</p>
                  </div>
                )
                :
                (
                  null
                )
              )}
            </div>
          )
          :
          (
            null
          )
        ))}
      </div>
    </div>
  )
  :
  (
    null
  );
}

export default OrderDetails;
