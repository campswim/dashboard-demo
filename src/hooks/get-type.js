import apiCall from './api-call';

export default async function getType(table, column) {  
  if (!column) return;
  const operation = 'getType';
  const query = `query ${operation}($table: String!, $column: String!) {${operation}(table: $table, column: $column) {ColumnName DataType MaxLength}}`;
  const variables = { table, column };
  const typeMap = {
    bool: 'boolean',
    int: 'number',
    tinyint: 'number',
    long: 'bigint',
    byte: 'number',
    float: 'number',
    double: 'number',
    decimal: 'number',
    DateTime: 'object',
    char: 'string',
    varchar: 'string',
    object: 'object',
    string: 'string',
    JSON: 'object',
    XML: 'string'
  };

  return await apiCall(operation, query, variables).then(
    res => { // res.data.getType => { ColumnName, DataType, MaxLength }      
      if (res.data) {
        const columnConfig = res.data?.getType;
        const type = typeMap[columnConfig.DataType];
        columnConfig.DataType = type;
        return columnConfig; 
      }
    },
    err => { console.error({err}) }
  );
}
