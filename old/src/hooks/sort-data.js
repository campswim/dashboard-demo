import { useState, useMemo } from 'react';

const useSort = (items, caller) => {
  if (!items) items = [];
  if (items['data'] && items['data']['failedPulls']) items = items.data.failedPulls;
  if (items['data'] && items['data']['failedPushes']) items = items.data.failedPushes;
  
  const [sortConfig, setSortConfig] = useState({
    key: caller === 'params' || caller === 'users' ? 'Name' : caller === 'map' ? 'Id' : caller === 'unpulled' || caller === 'unpushed' || caller === 'ignored' ? 'OrderNumber' : caller === 'order-details' ? 'lineNumber' : caller === 'jobs' || caller === 'payments' ? 'OrderNumber' : caller === 'jobs-summary' ? 'Count' : caller === 'staged' ? 'market' : 'missing-items' ? 'itemCode' : null,
    direction: 'ascending',
  });

  const sortedData = useMemo(() => {
    let sortedItems = items && items.length > 0 ? [...items] : [];

    sortedItems.sort((a, b) => {
      let elementOne = a[sortConfig.key];
      let elementTwo = b[sortConfig.key];
      
      // Correct for cases when the user ID is used in the ModifiedBy field, i.e., when a job modifies a parameter, not a user.
      if (sortConfig.key === 'ModifiedBy') {
        if (!elementOne && a.UserId && isNaN(a.UserId)) elementOne = a.UserId;
        if (!elementTwo && b.UserId && isNaN(b.UserId)) elementTwo = b.UserId;
      }

      if (!isNaN(parseInt(elementOne)) && !isNaN(parseInt(elementTwo))) {
        elementOne = parseInt(elementOne);
        elementTwo = parseInt(elementTwo);
      } else if ('EnabledDate' === sortConfig.key) {
        if (elementOne && elementOne.includes('T')) elementOne = new Date(elementOne).getUTCMilliseconds();
        if (elementTwo && elementTwo.includes('T')) elementTwo = new Date (elementTwo).getUTCMilliseconds();
      }

      // Correct for null or undefined;
      if (elementOne === null || elementOne === undefined) elementOne = '';
      if (elementTwo === null || elementTwo === undefined) elementTwo = '';
      
      if (typeof elementOne === 'string' && typeof elementTwo === 'string') {
        if (elementOne.toUpperCase() < elementTwo.toUpperCase())
          return sortConfig.direction === 'ascending' ? -1 : 1;
        else if (elementOne.toUpperCase() > elementTwo.toUpperCase())
          return sortConfig.direction === 'ascending' ? 1 : -1;
      } else {
        if (elementOne < elementTwo)
          return sortConfig.direction === 'ascending' ? -1 : 1;
        else if (elementOne > elementTwo)
          return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return sortedItems;
  }, [items, sortConfig]);

  const requestSort = (key, override, pause = false) => {
    if (pause) return;
    let direction = 'ascending';
    if (!override) {
      if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    } else direction = override;

    setSortConfig({ key, direction });
  };

  return { items: sortedData, requestSort, sortConfig };
};

export default useSort;
