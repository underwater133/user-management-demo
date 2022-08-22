import { ElMessageBox } from 'element-plus'
export default function (msg: string, type: string) {
  return ElMessageBox.confirm(`你确定要${msg}吗？`, type, {
    confirmButtonText: msg,
    cancelButtonText: '取消',
    type: 'warning',
    center: true,
  })
}