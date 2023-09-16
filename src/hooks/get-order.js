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
  const operation = 'unpushed';
  const query = `query ${operation} {${operation} {Market, OrderTotalAmount, PushStatusId, Error}}`;
  const variables = { status }
  const result = await apiCall(operation, query, variables).then(
    res => { return res; },
    err => { return err; }
  );

  return result;
}

export async function userAction(tab, operation, ids) {
  if (!operation || !ids) return;
  const query = tab === 'unpushed' ? `mutation ${operation}($ids: [String]!) {${operation}(ids: $ids) {OrderNumber}}` : tab === 'unpulled' ? `mutation ${operation}($ids: [String]!) {${operation}(ids: $ids) {Id, OrderNumber, OrderDate, OrderTotal, CurrencyCode, Message, At, IgnoredAt, Exception}}` : tab === 'ignored' ? `mutation ${operation}($ids: [IgnoredObject]!) {${operation}(ids: $ids) {OrderNumber}}` : '';
  const variables = { ids };
  return await apiCall(operation, query, variables).then(
    res => { return res; },
    err => console.err(err)
  );
}
