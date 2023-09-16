import React from 'react';

const Checkbox = ({ value, type, name, handleClick, isChecked }) => {
  return (
    <input
      value={value}
      name={name}
      type={type}
      onChange={handleClick}
      checked={isChecked}
      className='checkbox'
    />
  );
};

export default Checkbox;
