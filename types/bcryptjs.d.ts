declare module 'bcryptjs' {
  const compare: (data: string, encrypted: string) => Promise<boolean>
  const hash: (data: string, salt: number | string) => Promise<string>
  export { compare, hash }
  export default { compare, hash }
}
