import React, { useState, useEffect, useRef } from 'react';

const Dropdown = ({ path, numsBack, handleChange, selectedOption }) => {
  const maxBack = path === 'orders-by-month' ? 9 : path === 'filter-num-errors' ? 500 : 25;
  const increment = 50;
  const options = path === 'orders-by-month' ? Array.from({ length: maxBack + 1 }, (_, i) => i) : path === 'filter-level' ? ['All', 'Information', 'Debug', 'Error', 'Warning', 'Fatal'] : path === 'filter-num-errors' ? [25, ...Array.from({ length: maxBack / increment }, (_, i) => (i + 1) * increment)] : [];
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Handle the selection of a different number of errors to view.
  const handleOptionClick = (event, option) => {
    event.stopPropagation(); // Prevent toggleDropdown from running.
    const label = path === 'orders-by-month' ? `${option} Month${option > 1 ? 's' : ''}`
      : path === 'filter-level' ? `${option}`
      : `${option} ${option > 1 ? 'Entries' : 'Entry'}`
    ;


    if (option !== 0) {
      handleChange(option, 'num-of-errors', label);
    }

    setIsOpen(false);
  };

  // Handle the filtering of the data by the Level column.
  const handleSelect = (event, option) => {
    event.stopPropagation();
    setIsOpen(false);
    handleChange(option, 'filter-by-level', `Level: ${option}`)
  }

  const clickSniffer = (event) => {
    const target = event.target;

    // Check if the click is outside the dropdown.
    if (dropdownRef.current && !dropdownRef.current.contains(target) && isOpen) {
      setIsOpen(false);
    }
  };

  // Bind the event listener.
  useEffect(() => {
    document.addEventListener('mousedown', clickSniffer);
    return () => document.removeEventListener('mousedown', clickSniffer); // Clean up.
  });
  
  return (
    <div className="dropdown-container">
      <button className="custom-select" onClick={toggleDropdown} ref={dropdownRef}>
        <div className="selected-option">
          Viewing {selectedOption || 
          (path === 'filter-num-errors' ? 
              (numsBack === 1 ? `${numsBack} Entry` : `${numsBack} Entries`) 
            : path === 'filter-level' ? 'Level: All'
            : numsBack === 1 ? `${numsBack} Month` : `${numsBack} Months`
          )}
        </div>
        {isOpen && (
          <div className="dropdown">
            {options.map((val) => (
              <div
                key={val}
                className="option"
                onClick={(e) => {
                  path === 'filter-num-errors' || path === 'orders-by-month' ? handleOptionClick(e, val) : handleSelect(e, val)
                }}
              >
                {!isNaN(val) ?
                (
                  val !== 0 && 
                  (
                    path === 'orders-by-month' ? 
                      `${val} Month${val > 1 ? 's' : ''}`
                    : `${val} ${val > 1 ? 'Entriess' : 'Entry'}`
                  )
                )
                :
                (
                  val
                )}
              </div>
            ))}
          </div>
        )}
      </button>
    </div>
  );
};

export default Dropdown;