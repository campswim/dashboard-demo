const formatDate = date => {
  const months = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sep',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec',
  };
  const militaryHours = {
    13: '1',
    14: '2',
    15: '3',
    16: '4',
    17: '5',
    18: '6',
    19: '7',
    20: '8',
    21: '9',
    22: '10',
    23: '11',
    24: '12',
  };

  const amOrPm = date[3] < 12 ? 'a.m.' : 'p.m.';
  const day = date[0];
  const month = months[date[1]];
  const year = date[2];
  const hour = amOrPm === 'p.m.' ? militaryHours[date[3]] : date[3];
  const minutes = date[4].toString().padStart(2, '0');
  const seconds = date[5].toString().padStart(2, '0');

  return { day, month, year, hour, minutes, seconds, amOrPm };
};

export default formatDate;
