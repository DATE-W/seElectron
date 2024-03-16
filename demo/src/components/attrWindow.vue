<template>
    <div style="display:flex; flex-direction: row;margin-top:5px;margin-bottom:5px">
        <div style="display:flex; flex-direction: row;margin:5px">
            <div style="width:50px">类名</div>：
            <label style="min-width: 50px;">{{props.item.className}} </label>
        </div>
    </div>
    <div style="display:flex; flex-direction: row;margin-top:5px;margin-bottom:5px">
        <div style="display:flex; flex-direction: row;margin:5px">
            <div style="width:50px">X</div>：
            <el-input style="min-width: 50px;" v-model="props.item.x" type="number" min="0"/>
        </div>
        <div style="display:flex; flex-direction: row;margin:5px">
            <div style="width:50px">Y</div>：
            <el-input style="min-width: 50px;" v-model="props.item.y" type="number" min="0"/>
        </div>
    </div>
    <div style="display:flex; flex-direction: row;margin-top:5px;margin-bottom:5px">
        <div style="display:flex; flex-direction: row;margin:5px">
            <div style="width:50px">宽</div>：
            <label style="min-width: 50px;">{{props.item.size[0]}}</label>
        </div>
        <div style="display:flex; flex-direction: row;margin:5px">
            <div style="width:50px">高</div>：
            <label style="min-width: 50px;">{{props.item.size[1]}}</label>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits, watch, ref } from 'vue'

const props = defineProps({
  item: Object,
});

const emit = defineEmits(['update']);

const internalItemState = ref({ ...props.item });

// 使用watchEffect或watch来深度监听props.item
watch(() => props.item, (newVal) => {
  // 只有当internalItemState与newVal不完全相等时，才认为是有效更新
  if (JSON.stringify(internalItemState.value) !== JSON.stringify(newVal)) {
    emit('update', newVal);
    internalItemState.value = { ...newVal }; // 更新内部状态以防止无意义的循环
  }
}, { deep: true });
</script>


<style scoped>
.div{
    width:50px;
}
</style>