import apiCall from './api-call';

export async function getSettings(path) {
  const operation = `${path}`;
  let query = `query ${operation} {${operation} `;
  query += 'maps' === operation ? `{Id IsoCountryCode ErpCompanyId SourceWarehouse SourceShipMethod DestinationWarehouse IsoCurrencyCode ErpCurrencyCode ProcessingSequence ActivatedAt DeactivatedAt ModifiedAt ModifiedBy Error {name code message}}}` : `{Name Value Category SubCategory ValueTypeId ValueType Notes EnabledDate ModifiedAt ModifiedBy UserId Error {name code message}}}`;
  
  const result = await apiCall(operation, query).then(
    res => { return res; },
    err => { console.error(err); }
  );

  return result;
};

export async function updateSettings(path, name, column, newValue) {
  if (!newValue) newValue = null;
  const operation = `${path}Update`;
  let query = `mutation ${path}Update($id: ID!, $column: String!, $newValue: String) {${path}Update(id: $id, column: $column, newValue: $newValue)`;
  if (path === 'params') query += `{Name${column !== 'Name' ? ' ' + column : '' } ValueTypeId EnabledDate Error {message}}}`;
  else if (path === 'maps') query += `{Id ${column} Error {message}}}`;
  const variables = { id: name, column: column, newValue };
  const result = await apiCall(operation, query, variables).then(
    res => { return res; },
    err => { console.error(err); }
  );

  return result;
};

export async function getParamByName(name) {
  const operation = 'getParamByName';
  const query = `query ${operation}($name: String!) {${operation}(name: $name) {Value EnabledDate Error {message}}}`;
  const variables = { name };
  const result = await apiCall(operation, query, variables).then(
    res => { return res?.data; },
    err => { console.error(err); }
  );

  return result;
};

export async function getValueTypeId(dataType) {
  const operation = 'getValueTypeId';
  const query = `query ${operation}($dataType: String!) {${operation}(dataType: $dataType) {Id}}`;
  const variables = { dataType };
  const result = await apiCall(operation, query, variables).then(
    res => { return res?.data?.getValueTypeId?.Id; },
    err => console.error(err)
  );

  return result;
};
