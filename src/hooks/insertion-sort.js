function insertionSort(array) {
  if (!array || array.length <= 0) return;

  for (let i = 0; i < array.length; i++) {
    if (array[i].order) {
      // Compare the value at i to the value at 0 and place at 0 if smaller.
      if (array[i].order < array[0].order) {
        array.unshift(array.splice(i, 1)[0]);
      }
      // Insert the number in its rightful spot.
      else {
        for (let j = 1; j < array.length; j++) {
          if (array[i].order > array[j - 1].order && array[i].order < array[j].order) {
            array.splice(j, 0, array.splice(i, 1)[0]);
          }
        }
      }
    } else {
      if (typeof array[i] === 'string') {
        if (array[i].includes('-')) {
          const key = array[i];
          const keyValue = Number(key.split('-').join(''));
          let j = i - 1;

          // Move elements of array[0..i-1] that are greater than key
          // to one position ahead of their current position
          while (j >= 0 && Number(array[j].split('-').join('')) > keyValue) {
            array[j + 1] = array[j];
            j--;
          }
          array[j + 1] = key; // Insert key into the correct positi
        }
      }
    }
  }

  return array;
}

export default insertionSort;
