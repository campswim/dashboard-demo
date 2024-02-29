import apiCall from './api-call';

export async function getAllFailedPayments() {
  const operation = 'getAllFailedPayments';
  const query = `query ${operation} {${operation} {OrderNumber, PaymentId, PaymentType, PaymentAmount, PaymentDate, AttemptedAt, CardNumber, ErrorReason, CurrencyCode, DismissedAt, DismissedBy}}`;

  return await apiCall(operation, query).then(
    res => {      
      const results = res?.data?.getAllFailedPayments;
      const errors = res?.errors;
      const empty = results.length === 1 && !results?.PaymentId ? true : false;
            
      if (!empty) {
        if (results) return results;
        else return errors;
      } else {
        return null;
      }
    },
    err => { return err; }
  );
}
