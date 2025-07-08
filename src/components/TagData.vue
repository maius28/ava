<template>

  <!-- 标签管理 -->
  <div>
    <div class="table-operations">
      <a-input-search v-model:value="tagSearchValue" placeholder="搜索标签名称" style="width: 300px" @search="onTagSearch" />
      <a-button type="primary" @click="showTagModal">
        <plus-outlined />创建标签
      </a-button>
    </div>

    <a-table :columns="tagColumns" :data-source="filteredTags" :row-key="record => record.id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'actions'">
          <a-button type="link" @click="editTag(record)">编辑</a-button>
          <a-button type="link" danger @click="deleteTag(record)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>


  <!-- 创建/编辑标签弹窗 -->
  <a-modal v-model:open="tagModalVisible" :title="tagModalTitle" @ok="handleTagModalOk"
    @cancel="tagModalVisible = false">
    <a-form :model="tagForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
      <a-form-item label="所属主体" name="entity">
        <a-select v-model:value="tagForm.entity" style="width: 100%">
          <a-select-option value="user">用户</a-select-option>
          <a-select-option value="intel">情报</a-select-option>
          <a-select-option value="other">其他</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="标签名称" name="name" :rules="[{ required: true, message: '请输入标签名称' }]">
        <a-input v-model:value="tagForm.name" />
      </a-form-item>
      <a-form-item label="标签分组" name="group">
        <a-select v-model:value="tagForm.group" style="width: 100%">
          <a-select-option value="interest">兴趣偏好</a-select-option>
          <a-select-option value="behavior">行为特征</a-select-option>
          <a-select-option value="value">价值属性</a-select-option>
          <a-select-option value="custom">自定义</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value="tagForm.remark" :rows="4" />
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


// ==================== 标签管理 ====================
// 标签表格列定义
const tagColumns = [
  { title: '编号', dataIndex: 'id', key: 'id' },
  { title: '标签名称', dataIndex: 'name', key: 'name' },
  { title: '所属主体', dataIndex: 'entity', key: 'entity' },
  { title: '标签分组', dataIndex: 'group', key: 'group' },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '操作', key: 'actions' }
];

// 模拟标签数据
const tags = ref([
  { id: 1, name: '政府部门', entity: 'user', group: 'value', remark: '政府机关及部门相关用户' },
  { id: 2, name: '决策层', entity: 'user', group: 'value', remark: '具有决策权限的高层用户' },
  { id: 3, name: '商业机构', entity: 'user', group: 'value', remark: '各类商业组织相关用户' },
  { id: 4, name: '分析师', entity: 'user', group: 'value', remark: '专业情报分析人员' },
  { id: 5, name: '研究机构', entity: 'user', group: 'value', remark: '科研院所及研究机构' },
  { id: 6, name: '专家', entity: 'user', group: 'value', remark: '特定领域专业人士' }
]);

// 所有标签（供用户选择）
const allTags = computed(() => tags.value);

// 模拟情报数据（供用户关联）
const allIntelligence = ref([
  '南海情报', '边境动态', '经济情报', '产业动态', '技术情报'
]);

// 标签搜索
const tagSearchValue = ref('');
const filteredTags = computed(() => {
  if (!tagSearchValue.value) return tags.value;
  return tags.value.filter(tag =>
    tag.name.toLowerCase().includes(tagSearchValue.value.toLowerCase())
  );
});

const onTagSearch = (value) => {
  tagSearchValue.value = value;
};

// 标签表单操作
const tagModalVisible = ref(false);
const tagModalTitle = ref('创建标签');
const tagForm = reactive({
  id: 0,
  name: '',
  entity: 'user',
  group: 'interest',
  remark: ''
});
const isEditingTag = ref(false);

const showTagModal = () => {
  tagModalTitle.value = '创建标签';
  Object.assign(tagForm, {
    id: 0,
    name: '',
    entity: 'user',
    group: 'interest',
    remark: ''
  });
  isEditingTag.value = false;
  tagModalVisible.value = true;
};

const editTag = (record) => {
  tagModalTitle.value = '编辑标签';
  Object.assign(tagForm, { ...record });
  isEditingTag.value = true;
  tagModalVisible.value = true;
};

const deleteTag = (record) => {
  tags.value = tags.value.filter(tag => tag.id !== record.id);
  message.success('删除成功');
};

const handleTagModalOk = () => {
  if (!tagForm.name) {
    message.error('标签名称不能为空');
    return;
  }

  if (isEditingTag.value) {
    // 编辑现有标签
    const index = tags.value.findIndex(tag => tag.id === tagForm.id);
    if (index !== -1) {
      tags.value[index] = { ...tagForm };
      message.success('标签更新成功');
    }
  } else {
    // 添加新标签
    const newId = Math.max(0, ...tags.value.map(t => t.id)) + 1;
    tags.value.push({
      ...tagForm,
      id: newId
    });
    message.success('标签创建成功');
  }

  tagModalVisible.value = false;
};

</script>

<style scoped></style>