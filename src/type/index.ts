export interface User {
  id: number,
  name: string,
  age: number | null,
  sex: string | null,
  phone: string | null,
  address: string | null,
  delete: 0 | 1
}