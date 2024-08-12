import apiCall from './api-call';

export async function getOrders(query) { // Used by the failed-orders page to populate its Failed to Pull, Failed to Push, and Ignored Orders tabs.
  if (!query) return;

  const operation = query;

  query = `query ${operation} {${operation} `;
  query += 'failedPushes' === operation ? 
    (
      '{OrderNumber Market Warehouse CurrencyCode OrderTotalAmount OrderTypeDescription CustomerNumber OrderDate StagingImportDate ErrorCode ErrorMessage}}' 
    ) 
    : 'failedPulls' === operation ? 
    (
      '{Id OrderNumber OrderDate OrderTotal CurrencyCode At Message Exception}}' 
    )
    : 'ignoredOrders' === operation ?
    (
      '{Type OrderNumber OrderDate OrderTotal CurrencyCode Message IgnoredAt IgnoredBy }}'
    )
    : // -> 'unpushedNoFail' === operation
    (
      '{OrderNumber Market Warehouse CurrencyCode OrderTotalAmount OrderTypeDescription CustomerNumber OrderDate StagingImportDate}}'
    );

  return await apiCall(operation, query).then(
    res =>  res,
    err => err
  );
}

export async function getUnpushedOrders(status) { // Used by the home page's "Staged Orders" section to populate the Unpushed, Failed Pushes, and Ingored Pushes cards.
  const operation = status;  
  const query = `query ${operation} {${operation} {Type, Market, OrderTotalAmount, Count, Error}}`;
  const variables = { status };
  const result = await apiCall(operation, query, variables).then(
    res => { return res; },
    err => { return err; }
  );

  return result;
}

export async function userAction(tab, operation, ids) {
  if (!operation || !ids) return;
  const mode = process.env.REACT_APP_MODE;

  const query = 
    tab === 'unpushed' ? 
      `mutation ${operation}($ids: [String]!, $mode: String) {${operation}(ids: $ids, mode: $mode) {OrderNumber, Message}}` : 
    tab === 'unpulled' ? 
      `mutation ${operation}($ids: [String]!, $mode: String) {${operation}(ids: $ids, mode: $mode) {Id, OrderNumber, OrderDate, OrderTotal, CurrencyCode, Message, At, IgnoredAt, Exception}}` : 
    tab === 'ignored' ? 
      `mutation ${operation}($ids: [IgnoredObject]!) {${operation}(ids: $ids) {OrderNumber}}` :
    tab === 'failedPayments' ?
      `mutation ${operation}($ids: [ID]!) {${operation}(ids: $ids) {PaymentId, DismissedAt, DismissedBy}}` : 
    tab === 'failedProcesses' ?
      `mutation ${operation}($ids: [ID]!) {${operation}(ids: $ids) {Id, DismissedAt, DismissedBy}}` : 
    '';
  const variables = tab === 'unpulled' || tab === 'unpushed' ? { ids, mode } : { ids };

  return await apiCall(operation, query, variables).then(
    res => res,
    err => console.err(err)
  );
}

export async function getOrderDetails(id) {
  if (!id) return { Error: 'No order number was entered.' };

  const operation = 'orderDetails';
  const query = `query ${operation}($id: String!) {${operation}(id: $id) {OrderNumber, CustomerNumber, Market, CurrencyCode, PushStatusId, OrderTypeDescription, ReferenceOrderNumber, OrderTotalAmount, TaxAmount, FreightAmount, FreightTaxAmount, OrderDate, ShipDate, Warehouse, ShipMethod, PickupName PushStatus, PulledDate, SentToErp, ErpOrderNumber, ErpInvoicedAt, Error}}`;
  const variables = { id };

  return await apiCall(operation, query, variables).then(
    res => { return res; },
    err => { return err; }
  );
}

export async function getCrmOrderDetails(id) {
  if (!id) return { Error: 'No order number was entered.' };

  const operation = 'getCrmOrderDetails';
  const query = `query ${operation}($id: String!) {${operation}(id: $id) {OrderNumber, OrderDate, OrderTotal, CurrencyCode, Message, At, IgnoredAt, Exception}}`;
  const variables = { id };

  return await apiCall(operation, query, variables).then(
    res => res,
    err => err
  )
}

export async function getPushStatusById(id) {
  if (!id) return;
  
  const operation = 'getPushStatusById';
  const query = `query ${operation}($id: ID!) {${operation}(id: $id) {Id Name}}`;
  const variables = { id };
  return await apiCall(operation, query, variables).then(
    res => { return res; },
    err => { return err; }
  );

}