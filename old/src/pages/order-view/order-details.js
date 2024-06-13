import React, { useEffect } from 'react';
import formatHeaders from '../../hooks/format-headers';
import formatCurrency from '../../hooks/format-currency';

const OrderDetails = props => {
	const formattedOrder = props.order;
	const dateRelated = ['OrderDate', 'ShipDate', 'PulledDate', 'SentToErp', 'ErpInvoicedAt'];
	const currencyRelated = ['OrderTotalAmount', 'TaxAmount', 'FreightAmount', 'FreightTaxAmount'];
	const erpCategories = ['PushStatus', 'SentToErp', 'ErpOrderNumber', 'ErpInvoicedAt'];
	const erpHeaders = formatHeaders(erpCategories);
	const headers = formatHeaders(Object.keys(formattedOrder), ['OrderNumber', 'Error']);
	const crmValues = []; 
	const erpValues = [];

	// Remove the order number from the order object.
	if (formattedOrder.OrderNumber) delete formattedOrder.OrderNumber;

	// Separate the CRM and ERP values into separate arrays.
	if (formattedOrder && JSON.stringify(formattedOrder) !== '{}') {
		for (const property in formattedOrder) {
			if (erpCategories.includes(property)) erpValues.push({ [property]: formattedOrder[property] });
			else crmValues.push({ [property]: formattedOrder[property] });
		}
	}

	// Send the orderId back up to the parent.
	useEffect(() => {
		let mounted = true;
		if (mounted) {
			props.getId(props.orderId);
		}
	}, [props]);
	
	return formattedOrder && JSON.stringify(formattedOrder) !== '{}' ? 
	(
		<>
			<div className='order-view-container desktop'>
				<div className='order-view-header'>
					<h3>Order {props.orderId} in Exigo</h3>
					<div className="order-view-summary">
						<table className="order-summary-table-1">
							<thead>
								<tr className='header-row'>
									{headers.map((header, key) => {
										return !erpHeaders.includes(header) && header !== 'Currency Code' ? 
										<th key={key} className="order-view-summary-col-header">
											{
												header === 'Customer Number' ?
												(
													'Customer #'
												)
												:	header === 'Order Type Description' ? 
												(
													'Order Type'
												) 
												: header === 'Reference Order Number' ?
												(
													'Ref Order #'
												)
												: header === 'Order Total Amount' ?
												(
													'Total'
												)
												: header === 'Tax Amount' ?
												(
													'Tax'
												)
												: header === 'Freight Amount' ?
												(
													'Freight'
												)
												: header === 'Freight Tax Amount' ?
												(
													'Freight Tax'
												)
												: header
											}
										</th> : null;
								})}
								</tr>
							</thead>
							<tbody>
								<tr>
									{crmValues.map((val, key) => {
										const property = Object.keys(val)[0];
										const value = Object.values(val)[0];

										return property !== 'CurrencyCode' ?
										(
											<td class={property === 'OrderTypeDescription' || property === 'ShipMethod' ? 'whitespace-prewrap' : ''} key={key}>
												{(value || value === 0) && currencyRelated.includes(property) ? formatCurrency(value, formattedOrder.CurrencyCode) : value && dateRelated.includes(property) ? new Date(parseInt(value)).toISOString().split('T')[0] : !value ? 'N/A' : value}
											</td>
										)
										:
										(
											null
										)
									})}
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div className='order-view-container desktop'>
				<div className='order-view-header'>
					<h3>Order {props.orderId} in Business Central</h3>
					<div className="order-view-summary">
						<table className="order-summary-table-1">
							<thead>
								<tr className='header-row'>
									{erpHeaders.map((header, key) =>
										<th key={key} className="order-view-summary-col-header">{header}</th>
									)}
								</tr>
							</thead>
							<tbody>
								<tr>
									{erpValues.map((val, key) => {
										const property = Object.keys(val)[0];
										const value = Object.values(val)[0];

										return <td key={key}>{(value || value === 0) && currencyRelated.includes(property) ? formatCurrency(value, formattedOrder.CurrencyCode) : value && dateRelated.includes(property) ? new Date(parseInt(value)).toISOString().split('T')[0] : !value ? 'N/A' : value}</td>
									})}
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{ /* Display the table vertically for mobile. */ }
			<div className='order-view-container mobile'>
				<div className='order-view-header'>
					<h3>Order {props.orderId} in Exigo</h3>
					<div className="order-view-summary">
						<table>
							<thead>
								{headers.map((header, j) => (
									!erpHeaders.includes(header) && header !== 'Currency Code' ? 
									(
										<tr key={j}>
											<th>{header === 'Customer Number' ? 'Customer #' : header === 'Order Type Description' ? 'Order Type' : header === 'Reference Order Number' ? 'Ref Order #' : header === 'Order Total Amount' ? 'Total' : header === 'Frieght Amount' ? 'Freight' : header === 'Freight Tax Amount' ? 'Freight Tax' : header}</th>
											<td>{formattedOrder[header.split(' ').join('')] ? formattedOrder[header.split(' ').join('')] : 'None'}</td>
										</tr>
									)
									:
								(
									null
								)
								))}
							</thead>
						</table>
					</div>
				</div>
			</div>
			<div className='order-view-container mobile'>
				<div className='order-view-header'>
					<h3>Order {props.orderId} in Exigo</h3>
					<div className="order-view-summary">
						<table>
							<thead>
								{erpHeaders.map((header, j) => (
									<tr key={j}>
										<th>{header}</th>
										<td>{formattedOrder[header.split(' ').join('')] ? formattedOrder[header.split(' ').join('')] : 'None'}</td>
									</tr>
								))}
							</thead>
						</table>
					</div>
				</div>
			</div>

		</>
	)
	:
	(
		null
	)
}

export default OrderDetails;
