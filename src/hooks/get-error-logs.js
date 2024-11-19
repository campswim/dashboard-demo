import apiCall from './api-call';

export async function getErrorLogs(numOfErrors = 99, errorLevel = null) {
  const operation = 'getErrorLogs';
  const query = `query ${operation}($numOfErrors: Int!, $errorLevel: String) {${operation}(numOfErrors: $numOfErrors, errorLevel: $errorLevel) {TimeStamp JobName Level MachineName Message Exception }}`;
  const variables = { numOfErrors, errorLevel };
  
  return await apiCall(operation, query, variables).then(
    res => res,
    err => err
  );
}
