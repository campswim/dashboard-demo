import React from 'react';

const Checkbox = ({ value, type, name, handleClick, isChecked, dismissed }) => {
  return (
    <input
      value={value}
      name={name}
      type={type}
      data-dismissed={dismissed}
      onChange={handleClick}
      checked={isChecked}
      className='checkbox'
    />
  );
};

export default Checkbox;
