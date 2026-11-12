// The restaurant reports calendar days in Philippine time. Explicit offsets
// prevent the existing API from treating a date-only end value as midnight.
export function reportQuery({ start_date, end_date }) {
  const params = new URLSearchParams();
  if (start_date && end_date) {
    params.set('start_date',start_date+'T00:00:00.000+08:00');
    params.set('end_date',end_date+'T23:59:59.999+08:00');
  }
  return params.toString();
}

