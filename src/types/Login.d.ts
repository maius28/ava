//声明登录接口信息
export interface UserInfo {
  userId: number
  username: string
  permissionUrls: string[] // 用户菜单权限列表
  roleId: number
}
