import apiCall from './api-call';

export async function checkDbConnection() {
  const operation = 'checkDbConnection';
  const query = `query ${operation} {${operation} {Connected, Message}}`;
  return await apiCall(operation, query).then(
    res => { return res; },
    err => { return err; }
  );
};

export async function getAllActiveItems(daysBack, markets) {    
  if ('number' !== typeof daysBack) daysBack = parseInt(daysBack);
  const operation = 'getAllActiveItems';
  const query = `query ${operation}($daysBack: Int!, $markets: [String]!) {${operation}(daysBack: $daysBack, markets: $markets) {ItemCode, Country}}`;
  const variables = { daysBack, markets };
  
  return await apiCall(operation, query, variables).then(
    res => { return res; },
    err => { return err; }
  );
};

export async function getAllErpItems(itemCodes, markets, environment) {    
  const operation = 'getAllErpItems';
  const query = `query ${operation}($itemCodes: [ItemObject]!, $markets: [String]!, $environment: String) {${operation}(itemCodes: $itemCodes, markets: $markets, environment: $environment) {ItemCode Country Error}}`;
  const variables = { itemCodes, markets, environment };
  return await apiCall(operation, query, variables).then(
    res => { return res; },
    err => { return err; }
  );
}

export async function getAllFailedProcesses() {
  const operation = 'getAllProcessingErrors';
  const query = `query ${operation} {${operation} {Id, Name, ProcessJobId, Category, ExternalSystem, DataDirection}}`;
  const jobs = {};

  return await apiCall(operation, query).then(
    res => {
      const results = res?.data?.getAllProcessingErrors;
      const errors = res?.errors;
      
      if (results) {
        const allErrors = res.data?.getAllProcessingErrors;

        if (allErrors) {
          allErrors.forEach(error => {
            if (!jobs[error.ProcessJobId]) {
              jobs[error.ProcessJobId] = { 
                Name: error.Name, 
                Count: 1, 
                Direction: error.DataDirection, 
                ExternalSystem: error.ExternalSystem, 
                Categories: [error.Category]
              };
            } else {
              let count = jobs[error.ProcessJobId].Count;
              jobs[error.ProcessJobId].Count = count + 1;
              
              if (!jobs[error.ProcessJobId].Categories.includes(error.Category)) jobs[error.ProcessJobId].Categories.push(error.Category);
            }
          });
        }

        return jobs;
      } else if (errors) {
        if (Array.isArray(errors)) {
          errors.forEach((error, idx) => {
            jobs.errors = { [idx]: error.message };
          })
        } else {
          jobs.errors = errors.message;
        }

        return jobs;
      }
    },
    err => { return err }
  );
}

export async function getAllUnpushedPayments() {
  const operation = 'getAllUnpushedPayments';
  const query = `query ${operation} {${operation} {PaymentType, PaymentAmount, CurrencyCode}}`;
  const unpushedPayments = {};

  return await apiCall(operation, query).then(
    res => {
      const results = res?.data?.getAllUnpushedPayments;
      const errors = res?.errors;
      
      if (results) {
        results.forEach(result => {
          const aggregatePaymentType = result.PaymentType === 'Credit Card' ? result.PaymentType + ' (' + result.CurrencyCode + ')' : result.PaymentType;

          if (!unpushedPayments[aggregatePaymentType]) {
            unpushedPayments[aggregatePaymentType] = {
              Type: aggregatePaymentType,
              Count: 1,
              AggregateAmount: result.PaymentAmount,
              CurrencyCode: result.CurrencyCode,
            }
          } else {
            let count = unpushedPayments[aggregatePaymentType].Count;
            let aggregateAmount = unpushedPayments[aggregatePaymentType].AggregateAmount;

            unpushedPayments[aggregatePaymentType].Count = count + 1;
            unpushedPayments[aggregatePaymentType].AggregateAmount = aggregateAmount + result.PaymentAmount;
          }
        });

        return unpushedPayments;
      } else if (errors) {
        return errors;
      }
    },
    err => { return err; }
  );
}

export async function getAllFailedPaymentsSummary() {
  const operation = 'getAllFailedPayments';
  const query = `query ${operation} {${operation} {PaymentId, OrderNumber, PaymentType, PaymentAmount, PaymentDate, CardNumber, AttemptedAt, ErrorReason, CurrencyCode}}`;
  const failedPayments = {};

  return await apiCall(operation, query).then(
    res => {
      const results = res?.data?.getAllFailedPayments;
      const errors = res?.errors;
      
      if (results) {
        results.forEach(result => {
          if (!failedPayments[result.PaymentType]) {
            failedPayments[result.PaymentType] = {
              Type: result.PaymentType,
              Count: 1,
              AggregateAmount: result.PaymentAmount,
              CurrencyCode: result.CurrencyCode,
              ErrorReasons: [result.ErrorReason]
            }
          } else {
            let count = failedPayments[result.PaymentType].Count;
            let aggregateAmount = failedPayments[result.PaymentType].AggregateAmount;

            failedPayments[result.PaymentType].Count = count + 1;
            failedPayments[result.PaymentType].AggregateAmount = aggregateAmount + result.PaymentAmount;
          }
        });

        return failedPayments;
      } else if (errors) {
        return errors;
      }
    },
    err => { return err; }
  );
}

export async function getOrderSummaryByMonth(monthsBack = 4) {
  const operation = 'getOrderSummaryByMonth';
  const query = `query ${operation}($monthsBack: Int!) {${operation}(monthsBack: $monthsBack) { Month, OrderType, Count}}`;
  const variables = { monthsBack };
  return await apiCall(operation, query, variables).then(
    res => res,
    err => err
  );
}

export async function getOrdersByMonthDay(month) {
  const operation = 'getOrdersByMonthDay';
  const query = `query ${operation}($month: String!) {${operation}(month: $month) {Day OrderCount}}`;
  const variables = { month };
  return await apiCall(operation, query, variables).then(
    res => res,
    err => err
  );
}