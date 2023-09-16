import apiCall from './api-call';

export default async function logChange(table, column, userId, prevValue, newValue, dataType) {  
  if (!column || !userId) return;
  if (typeof dataType === 'number' ) dataType = dataType.toString();
  
  const operation = 'logChange';
  const query = `query ${operation}($table: String!, $column: String!, $userId: Int!, $prevValue: String, $newValue: String, $dataType: String!) {${operation}(table: $table, column: $column, userId: $userId, prevValue: $prevValue, newValue: $newValue, dataType: $dataType) {Id, TableName, ColumnName, PrevValue, NewValue, DataType, DateTime, Error}}`;
  const variables = { table, column, userId: parseInt(userId), prevValue, newValue, dataType };
  
  return await apiCall(operation, query, variables).then(
    res => { return res },
    err => { console.error(err); }
  );
}
