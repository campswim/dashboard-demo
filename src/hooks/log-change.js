/* eslint-disable no-unreachable */
import apiCall from './api-call';

export default async function logChange(table, rowName, column, userId, prevValue, newValue, dataType) {
  return true; // Not using for the demo, in order to avoid the free-tier db from going over its limit.
  if (!column || !userId) return;
  if (typeof dataType === 'number' ) dataType = dataType.toString();
  
  const operation = 'logChange';
  const query = `query ${operation}($table: String!, $rowName: String!, $column: String!, $userId: Int!, $prevValue: String, $newValue: String, $dataType: String!) {${operation}(table: $table, rowName: $rowName, column: $column, userId: $userId, prevValue: $prevValue, newValue: $newValue, dataType: $dataType) {Id, TableName, RowName, ColumnName, PrevValue, NewValue, DataType, DateTime, Error}}`;
  const variables = { table, rowName, column, userId: parseInt(userId), prevValue, newValue, dataType };
  
  return await apiCall(operation, query, variables).then(
    res => { return res },
    err => { console.error(err); }
  );
}
