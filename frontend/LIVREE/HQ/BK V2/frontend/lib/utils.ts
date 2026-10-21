export function maskPhone(phone: string): string {
  if (phone.length < 3) return phone;
  const start = phone.substring(0, 3);
  const end = phone.substring(phone.length - 2);
  return `${start}***${end}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ar-MR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
