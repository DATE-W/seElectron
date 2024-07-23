<template>
    <a-flex justify="space-between" align="flex-start">
      <div>
        <a-button type="text">
          <PlusCircleOutlined />放大
        </a-button>

        <a-divider type="vertical" style="height: auto" />

        <a-button type="text">
          <MinusCircleOutlined />缩小
        </a-button>

        <a-divider type="vertical" style="height: auto" />

        <a-button type="text">
          <CloudUploadOutlined />导出
        </a-button>
      </div>
      <div style="margin-right: 10px">
        <a-button type="text">
          <UserOutlined />
        </a-button>
      </div>

  </a-flex>


</template>
<script setup lang="ts">
import { ref } from 'vue';
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  CloudUploadOutlined ,
  UserOutlined,
} from '@ant-design/icons-vue';


</script>

<style scoped>

</style>