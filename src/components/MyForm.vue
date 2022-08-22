<template>
  <section style="width: 80%; margin: 0 auto;">
    <div class="toolbar">
      <el-button type="primary" @click="updateData()" style="float: left; margin-right: 10px;">新建</el-button>
      <div class="mt-4" style="float: left; width: 40%;">
        <el-input v-model="keywords" placeholder="搜索" class="input-with-select">
          <template #prepend>
            <el-select v-model="searchType" placeholder="Select" style="width: 115px">
              <el-option label="姓名" value="name" />
              <el-option label="年龄" value="age" />
              <el-option label="性别" value="sex" />
              <el-option label="联系电话" value="phone" />
              <el-option label="详细地址" value="address" />
            </el-select>
          </template>
          <template #append>
            <el-button :icon="Search" @click="search()" />
          </template>
        </el-input>
      </div>

      <el-button type="info" @click="withdrawn()" style="float: right;">撤销</el-button>
    </div>
    <el-table ref="multipleTableRef" :data="showData.data.filter(x => !x.delete).slice((cpage - 1)*5, (cpage - 1)*5 + 5)" stripe
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55" />
      <el-table-column property="name" label="姓名" align="center" width="80" />
      <el-table-column property="age" label="年龄" align="center" width="80" />
      <el-table-column property="sex" label="性别" align="center" width="80" />
      <el-table-column property="phone" label="联系电话" align="center" width="120" />
      <el-table-column property="address" label="详细地址" align="center" width="600" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" plain text @click="updateData(scope.row)">编辑</el-button>
          <el-button type="danger" plain text @click="deleteData(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button type="danger" @click="multiDelete()" style="float: left; margin-top:10px">批量删除</el-button>
    <el-pagination background layout="prev, pager, next" style="float: right; margin-top:10px" :page-size="5" :total="showData.data.filter(x => !x.delete).length" :current-page="cpage" @update:current-page="handleCurrentChange" />
  </section>

  <!-- 新建/编辑用户对话框 -->
  <el-dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form v-if="showData.dialogData" :inline="true" :model="showData.dialogData" class="demo-form-inline">
      <el-form-item label="姓名">
        <el-input v-model="showData.dialogData.name" placeholder="姓名" />
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="showData.dialogData.sex" placeholder="性别">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>
      <el-form-item label="年龄">
        <el-input v-model="showData.dialogData.age" placeholder="年龄" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="showData.dialogData.phone" placeholder="联系电话" />
      </el-form-item>
      <el-form-item label="详细地址" style="margin-left: -40px;">
        <el-col :span="5">
          <div class="example-block" style="width: 100%;">
            <el-cascader v-model="area" :options="areaOptions" :show-all-levels="false" />
          </div>
        </el-col>
        <el-col :span="18" style="margin-left: 10px;">
          <el-input v-model="showData.dialogData.address" placeholder="详细地址" />
        </el-col>

      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveData()">保存</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script lang="ts" setup>
import 'element-plus/dist/index.css'
import { ref, reactive, toRaw } from 'vue'
import { ElTable } from 'element-plus'
import myMessageBox from '../utils/myMessageBox'
import { User } from '../type/index'
import { Search } from '@element-plus/icons-vue'

// 历史操作
// 目前只有3中操作，add，update，delete
// 每一项 的第一个元素为操作类型，第二个元素根据情况而定
// 如果是 add 操作， 第二个元素为添加后的对象的id
// 如果是 update 操作， 第二个元素为更新前的对象
// 如果是 delete 操作， 第二个元素为未删除前的对象的id
const myHistory: any = []
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<User[]>([])
const handleSelectionChange = (val: User[]) => {
  multipleSelection.value = val
}
const searchType = ref("name")
const cacheData = sessionStorage.getItem("tableData")
const tableData = cacheData ? reactive<User[]>(JSON.parse(cacheData)) : reactive<User[]>([
  {
    id: 0,
    name: '张三',
    age: 18,
    sex: '男',
    phone: '13226112341',
    address: '广东省广州市天河区地区1',
    delete: 0
  },
  {
    id: 1,
    name: '李四',
    age: 19,
    sex: '男',
    phone: '14567112341',
    address: '广东省广州市番禺区地区2',
    delete: 0
  },
  {
    id: 2,
    name: '王五',
    age: 20,
    sex: '男',
    phone: '1388654241',
    address: '广东省广州市花都区地区3',
    delete: 0
  },
  {
    id: 3,
    name: '刘六',
    age: 21,
    sex: '女',
    phone: '13123465341',
    address: '广东省广州市越秀区地区4',
    delete: 0
  },
  {
    id: 4,
    name: '恩七',
    age: 22,
    sex: '女',
    phone: '13123454123',
    address: '广东省广州市海珠区地区5',
    delete: 0
  },
  {
    id: 5,
    name: '老八',
    age: 23,
    sex: '男',
    phone: '14564541213',
    address: '广东省广州市海珠区地区6',
    delete: 0
  },
])
const keywords = ref("")


// 删除
const deleteData = (user: User) => {
  myMessageBox("删除", 'warning').then(() => {
    user.delete = 1
    myHistory.push(["delete", user.id])
  })
    .catch(() => {
      // catch error
    })

}
const multiDelete = () => {
  myMessageBox("将所选项删除", 'warning').then(() => {
    multipleSelection.value.forEach(user => {
      user.delete = 1
      myHistory.push(["delete", user.id])
    })
  })
    .catch(() => {
      // catch error
    })
}

// 地区选择器
const area = ref([])
const areaOptions: any = [
  {
    value: '广东省',
    label: "广东省",
    children: [
      {
        value: '广州市',
        label: "广州市",
        children: [
          {
            value: '番禺区',
            label: "番禺区",
          },
          {
            value: '越秀区',
            label: "越秀区",
          },
          {
            value: '花都区',
            label: "花都区",
          },
          {
            value: '海珠区',
            label: "海珠区",
          },
          {
            value: '天河区',
            label: "天河区",
          },
        ]
      }
    ]
  }
]

// 新建/编辑用户
const dialogVisible = ref(false)
const dialogTitle = ref('新建用户')
const showData = reactive<{ dialogData: User | null, data: User[] }>({
  data: tableData,
  dialogData: null
})
const updateData = (user?: User) => {
  dialogVisible.value = true
  // 新建
  if (!user) {
    dialogTitle.value = "新建用户"
    showData.dialogData = {
      id: tableData.length ? tableData.at(-1)!.id + 1 : 0,
      name: "",
      age: null,
      sex: "",
      phone: "",
      address: "",
      delete: 0
    }
  }
  //编辑
  else {
    dialogTitle.value = "编辑用户"
    showData.dialogData = JSON.parse(JSON.stringify(toRaw(user)))
    showData.dialogData!.address = showData.dialogData!.address!.slice(9)
  }
}
const saveData = () => {
  showData.dialogData!.address = area.value.join("") + showData.dialogData!.address
  const data = JSON.parse(JSON.stringify(showData.dialogData))
  if (dialogTitle.value == "新建用户") {
    tableData.push(data)
    myHistory.push(["add", data.id])
  }
  else {
    for (let i = 0, len = tableData.length; i < len; i++) {
      if (tableData[i].id === showData.dialogData?.id) {
        myHistory.push(["update", JSON.parse(JSON.stringify(tableData[i]))])
        tableData[i] = data
        break
      }
    }
  }
  dialogVisible.value = false
  showData.dialogData = null
}

// 撤销
const withdrawn = () => {
  if (myHistory.length) {
    const [type, ori] = myHistory.pop()
    switch (type) {
      case "add":
        for (let i = 0; i < tableData.length; i++) {
          if (tableData[i].id == ori) {
            tableData[i].delete = 1
            break
          }
        }
        break
      case "delete":
        for (let i = 0; i < tableData.length; i++) {
          if (tableData[i].id == ori) {
            tableData[i].delete = 0
            break
          }
        }
        break
      case "update":
        for (let i = 0; i < tableData.length; i++) {
          if (tableData[i].id == ori.id) {
            tableData[i] = ori
            break
          }
        }
        break
    }
  }
}

// 搜索
const search = () => {
  if (keywords.value == "") {
    showData.data = tableData
  }
  else {
    // 根据筛选条件筛选
    if (searchType.value == 'age') {
      showData.data = tableData.filter(x => x.age === parseInt(keywords.value))
    }
    //@ts-ignore
    else showData.data = tableData.filter(x => x[searchType.value].includes(keywords.value))
  }
}

// 监听刷新
window.addEventListener("beforeunload", () => {
  sessionStorage.setItem("tableData", JSON.stringify(toRaw(tableData)))
})

// 分页
const cpage = ref(1)
const handleCurrentChange = (val:number) => {
  cpage.value = val
}
</script>

<style scoped lang="less">
</style>