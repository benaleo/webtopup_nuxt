declare module 'bcryptjs' {
  export interface Bcrypt {
    compare(data: string, encrypted: string): Promise<boolean>
    hash(data: string, salt: number | string): Promise<string>
  }
  const bcrypt: Bcrypt
  export default bcrypt
}
