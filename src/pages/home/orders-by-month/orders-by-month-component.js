import React from 'react';
import BarChart from '../../../components/bar-chart';

const OrdersByMonth = props => {  
  return props?.data?.length && props.data.length > 0 && <BarChart data={props.data} />
}

export default OrdersByMonth;
