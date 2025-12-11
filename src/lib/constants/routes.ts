export const ROUTES = {
  ADMIN: {
    LOGIN: '/admin/login',
    CHANGE_PASSWORD: '/admin/change-password',
    WORKPLACE: '/admin/workplace',
    WORKPLACE_SETTING: '/admin/workplace-setting',
    EXPORTS: '/admin/exports',
    USERS: '/admin/users',
    USER_DETAIL: (id: string) => `/admin/user-detail/${id}`,
    MY_PAGE: '/admin/my-page',
  },
  MONITOR: '/monitor',
  ERROR: {
    403: '/403',
  },
}
