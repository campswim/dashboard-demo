export default function formatHeaders(headers, ignore = '') {
  if (!headers || headers.length <= 0) return;
  if (Array.isArray(headers)) {
    const formattedHeaders = [];

    headers.forEach(header => {
      if (!ignore.includes(header)) {
        const firstInitial = header[0].toUpperCase();
        const sample = header.slice(1);
        const match = sample.match(/[A-Z]/g);
        
        if (match) {
          let formatted = sample.split('');        
          const indices = [];
          
          formatted.forEach((letter, idx) => {
            if (match.includes(letter)) indices.push(idx);
          });
  
          if (indices.length > 0) {
            let counter = 0;
  
            indices.forEach(index => {
              formatted.splice(index + counter, 0, ' ');
              counter++;
            })
          }
  
          formatted = formatted.join('');
          formatted = firstInitial + formatted;
          formattedHeaders.push(formatted);
        } else {
          header = firstInitial + sample;
          formattedHeaders.push(header);
        }
      }
    });
    
    return formattedHeaders.length <= 0 ? null : formattedHeaders;
  } else { // The headers argument is a single string, not an array.    
    let formattedHeader, headerArray = headers.split(' ');
    let sample = headerArray[headerArray.length - 1];
    const firstInitial = sample[0].toUpperCase();
    sample = sample.slice(1);
    const match = sample.match(/[A-Z]/g);
    
    if (match && match.length === headers.length - 1) return headers;
    if (match) {
      let formatted = sample.split('');
      const indices = [];
      
      formatted.forEach((letter, idx) => {
        if (match.includes(letter)) indices.push(idx);
      });

      if (indices.length > 0) {
        let counter = 0;

        indices.forEach(index => {
          if (index > 0) {
            formatted.splice(index + counter, 0, ' ');
            counter++;
          }
        });
      }

      formatted = formatted.join('');
      formatted = firstInitial + formatted;
      headerArray[headerArray.length - 1] = formatted;
      formattedHeader = headerArray.join(' ');
    } else {
      headerArray[headerArray.length - 1] = firstInitial + sample;
      formattedHeader = headerArray.join(' ');
    }

    return formattedHeader;
  }
}
