export type TUser = {
  id: string
  loginId: string
  name: string
  role: 'ADMIN' | 'WORKER'
  licensePhoto: null | string
}
