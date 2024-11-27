function dateTimeFormat(recDate, type) {
  if (!recDate && type === -1) return 'Not Submitted';
  const dateObj = new Date(recDate);
  const year = dateObj.getFullYear();
  const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
  const date = ('0' + dateObj.getDate()).slice(-2);
  let hours = dateObj.getHours();
  const minutes = ('0' + dateObj.getMinutes()).slice(-2);
  if (type === -1 || type === -2) {
    let str = date + '-' + month + '-' + year + ' ';
    if (type === -1) str += 'T- ';
    //
    if (hours > 12) hours -= 12;
    else if (hours === 0) hours = 12;
    str += ('0' + hours).slice(-2);
    //
    str += ':' + minutes + ' ';
    if (hours > 12) str += 'PM';
    else str += 'AM';
    return str;
  } else {
    hours = ('0' + hours).slice(-2);
    return `${year}-${month}-${date}T${hours}:${minutes}`;
  }
}
export { dateTimeFormat };
