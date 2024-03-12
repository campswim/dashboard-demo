import apiCall from './api-call';

export async function getOrders(query) {
  if (!query) return;
  const operation = query;
  query = `query ${operation} {${operation} `;
  query += 'failedPushes' === operation ? `{OrderNumber Market Warehouse CurrencyCode OrderTotalAmount OrderTypeDescription CustomerNumber OrderDate StagingImportDate ErrorCode ErrorMessage}}` : 'failedPulls' === operation ? `{Id OrderNumber OrderDate OrderTotal CurrencyCode At Message Exception}}` : `{Type OrderNumber OrderDate OrderTotal CurrencyCode IgnoredDate User Message}}`;  
  const result = await apiCall(operation, query).then(
    res => { return res; },
    err => { return err; }
  );

  return result;
}

export async function getUnpushedOrders(status) {  
  const operation = status;
  const query = `query ${operation} {${operation} {Market, OrderTotalAmount, PushStatusId, Error}}`;
  const variables = { status };
  const result = await apiCall(operation, query, variables).then(
    res => { return res; },
    err => { return err; }
  );

  return result;
}

export async function userAction(tab, operation, ids) {
  if (!operation || !ids) return;
    
  const query = 
    tab === 'unpushed' ? 
      `mutation ${operation}($ids: [String]!) {${operation}(ids: $ids) {OrderNumber}}` : 
    tab === 'unpulled' ? 
      `mutation ${operation}($ids: [String]!) {${operation}(ids: $ids) {OrderNumber Error}}` : 
    tab === 'ignored' ? 
      `mutation ${operation}($ids: [IgnoredObject]!) {${operation}(ids: $ids) {OrderNumber}}` :
    tab === 'failedProcesses' || tab === 'failedPayments' ?
      `mutation ${operation}($ids: [ID]!) {${operation}(ids: $ids) {PaymentId, DismissedAt, DismissedBy}}` : 
    '';
  const variables = { ids };

  return await apiCall(operation, query, variables).then(
    res => res,
    err => console.err(err)
  );
}

export async function getOrderDetails(id) {
  if (!id) return;

  const operation = 'orderDetails';
  const query = `query ${operation}($id: String!) {${operation}(id: $id) {OrderNumber, CustomerNumber, Market, CurrencyCode, OrderTypeDescription, ReferenceOrderNumber, OrderTotalAmount, TaxAmount, FreightAmount, FreightTaxAmount, OrderDate, ShipDate, Warehouse, ShipMethod, PickupName PushStatus, PulledDate, SentToErp, ErpOrderNumber, ErpInvoicedAt, Error}}`;
  const variables = { id };  
  return await apiCall(operation, query, variables).then(
    res => { return res; },
    err => { return err; }
  );
}