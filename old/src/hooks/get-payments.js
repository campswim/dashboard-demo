import apiCall from './api-call';

export async function getAllFailedPayments() {
  const operation = 'getAllFailedPayments';
  const query = `query ${operation} {${operation} {OrderNumber, PaymentId, PaymentType, PaymentAmount, PaymentDate, AttemptedAt, CardNumber, ErrorReason, CurrencyCode, DismissedAt, DismissedBy}}`;

  return await apiCall(operation, query).then(
    res => { return res; },
    err => { return err; }
  );
}
