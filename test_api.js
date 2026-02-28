import http from 'http';

http.get('http://localhost:3000/api/config', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('config:', data));
});
http.get('http://localhost:3000/api/products', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('products:', data));
});
http.get('http://localhost:3000/api/categories', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('categories:', data));
});
