<template>
    <div style="display:flex; flex-direction: row;margin-top:5px;margin-bottom:5px">
        <div style="display:flex; flex-direction: row;margin:5px">
            <div style="width:50px">类名</div>：
            <input style="min-width: 50px;" v-model="props.item.className"/>
        </div>
    </div>
    <div style="display:flex; flex-direction: row;margin-top:5px;margin-bottom:5px">
        <div style="display:flex; flex-direction: row;margin:5px">
            <div style="width:50px">X</div>：
            <input style="min-width: 50px;" v-model="props.item.x" type="number" min="0"/>
        </div>
        <div style="display:flex; flex-direction: row;margin:5px">
            <div style="width:50px">Y</div>：
            <input style="min-width: 50px;" v-model="props.item.y" type="number" min="0"/>
        </div>
    </div>
    <div style="display:flex; flex-direction: row;margin-top:5px;margin-bottom:5px">
        <div style="display:flex; flex-direction: row;margin:5px">
            <div style="width:50px">宽</div>：
            <input style="min-width: 50px;" v-model="props.item.size[0]" type="number" min="0"/>
        </div>
        <div style="display:flex; flex-direction: row;margin:5px">
            <div style="width:50px">高</div>：
            <input style="min-width: 50px;" v-model="props.item.size[1]" type="number" min="0"/>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
const props = defineProps({
    item:Object
    // className:String,
    // offsetX:Number,
    // offsetY:Number,
    // width:Number,
    // height:Number,
    // type:Object,
})

console.log(props)
</script>

<style scoped>
.div{
    width:50px;
}
</style>