const sortDataByMonth = (data = []) => {
  if (!data.length > 0) return { length: 0 };

  const map = { months: {}, length: 0 };

  data.forEach(item => {
    if (!map.months[item.Month]) {
      map.months[item.Month] = {};
      map.months[item.Month][item.OrderType] = item.Count;
      map.length++;
    } else {
      if (!map.months[item.Month][item.OrderType]) {
        map.months[item.Month][item.OrderType] = item.Count;
      }
    }
  });
  
  return map;
}

export default sortDataByMonth;
