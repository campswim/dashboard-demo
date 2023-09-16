const formatCurrency = (num, currency = 'USD', locale = 'en-US') => {
  currency = currency.toUpperCase();  
  if (currency === 'PHP') locale = 'fil';
  if (currency === 'AUS') currency = 'USD';
  if (currency.includes('Z')) 
    currency =
        currency === 'Z-PHP'
          ? 'PHP'
          : currency === 'Z-C$'
          ? 'CAD'
          : currency === 'Z-MXN'
          ? 'MXN'
          : 'USD';
  const result = new Intl.NumberFormat(locale, { style: 'currency', currency }).format(num);
  return result;
}

export default formatCurrency;
