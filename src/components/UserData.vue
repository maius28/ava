<template>

  <!-- 用户管理 -->
  <div>
    <div class="table-operations">
      <a-input-search v-model:value="userSearchValue" placeholder="搜索用户名称" style="width: 300px"
        @search="onUserSearch" />
      <a-button type="primary" @click="showUserModal">
        <plus-outlined />新增用户
      </a-button>
    </div>

    <a-table :columns="userColumns" :data-source="filteredUsers" :row-key="record => record.id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'tags'">
          <a-tag v-for="tag in record.tags" :key="tag" :color="getTagColor(tag)">
            {{ tag }}
          </a-tag>
        </template>
        <template v-if="column.key === 'relatedIntel'">
          <a-tag v-for="intel in record.relatedIntel" :key="intel" color="blue">
            {{ intel }}
          </a-tag>
        </template>
        <template v-if="column.key === 'actions'">
          <a-button type="link" @click="editUser(record)">编辑</a-button>
          <a-button type="link" danger @click="deleteUser(record)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>


  <!-- 新增/编辑用户弹窗 -->
  <a-modal v-model:open="userModalVisible" :title="userModalTitle" @ok="handleUserModalOk"
    @cancel="userModalVisible = false">
    <a-form :model="userForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="用户名称" name="name" :rules="[{ required: true, message: '请输入用户名称' }]">
        <a-input v-model:value="userForm.name" />
      </a-form-item>
      <a-form-item label="位置" name="location">
        <a-input v-model:value="userForm.location" />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select v-model:value="userForm.tags" mode="multiple" placeholder="选择标签" style="width: 100%">
          <a-select-option v-for="tag in allTags" :key="tag.name" :value="tag.name">
            {{ tag.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="关联情报" name="relatedIntel">
        <a-select v-model:value="userForm.relatedIntel" mode="multiple" placeholder="选择关联情报" style="width: 100%">
          <a-select-option v-for="intel in allIntelligence" :key="intel" :value="intel">
            {{ intel }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { UserOutlined, TagsOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

// 导航选中项
const selectedKeys = ref(['users']);

// ==================== 用户管理 ====================
// 用户表格列定义
const userColumns = [
  { title: '编号', dataIndex: 'id', key: 'id' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '位置', dataIndex: 'location', key: 'location' },
  { title: '标签', key: 'tags' },
  { title: '关联情报', key: 'relatedIntel' },
  { title: '操作', key: 'actions' }
];

// 模拟用户数据
const users = ref([
  {
    id: 1,
    name: '北京用户',
    location: '北京市海淀区',
    tags: ['政府部门', '决策层'],
    relatedIntel: ['南海情报', '边境动态']
  },
  {
    id: 2,
    name: '上海用户',
    location: '上海市浦东新区',
    tags: ['商业机构', '分析师'],
    relatedIntel: ['经济情报', '产业动态']
  },
  {
    id: 3,
    name: '广州用户',
    location: '广州市天河区',
    tags: ['研究机构', '专家'],
    relatedIntel: ['南海情报', '技术情报']
  }
]);

// 用户搜索
const userSearchValue = ref('');
const filteredUsers = computed(() => {
  if (!userSearchValue.value) return users.value;
  return users.value.filter(user =>
    user.name.toLowerCase().includes(userSearchValue.value.toLowerCase())
  );
});

const onUserSearch = (value) => {
  userSearchValue.value = value;
};

// 用户表单操作
const userModalVisible = ref(false);
const userModalTitle = ref('新增用户');
const userForm = reactive({
  id: 0,
  name: '',
  location: '',
  tags: [],
  relatedIntel: []
});
const isEditingUser = ref(false);

const showUserModal = () => {
  userModalTitle.value = '新增用户';
  Object.assign(userForm, {
    id: 0,
    name: '',
    location: '',
    tags: [],
    relatedIntel: []
  });
  isEditingUser.value = false;
  userModalVisible.value = true;
};

const editUser = (record) => {
  userModalTitle.value = '编辑用户';
  Object.assign(userForm, { ...record });
  isEditingUser.value = true;
  userModalVisible.value = true;
};

const deleteUser = (record) => {
  users.value = users.value.filter(user => user.id !== record.id);
  message.success('删除成功');
};

const handleUserModalOk = () => {
  if (!userForm.name) {
    message.error('用户名称不能为空');
    return;
  }

  if (isEditingUser.value) {
    // 编辑现有用户
    const index = users.value.findIndex(user => user.id === userForm.id);
    if (index !== -1) {
      users.value[index] = { ...userForm };
      message.success('用户更新成功');
    }
  } else {
    // 添加新用户
    const newId = Math.max(0, ...users.value.map(u => u.id)) + 1;
    users.value.push({
      ...userForm,
      id: newId
    });
    message.success('用户创建成功');
  }

  userModalVisible.value = false;
};

// 获取标签颜色
const getTagColor = (tagName) => {
  const colors = ['blue', 'green', 'orange', 'purple', 'cyan', 'magenta'];
  // 基于标签名生成确定的颜色索引
  const colorIndex = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[colorIndex];
};

</script>

<style scoped>
.layout-container {
  min-height: calc(100vh - 64px);
}

.content-container {
  padding: 24px;
  background: #fff;
}

.table-operations {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}
</style>