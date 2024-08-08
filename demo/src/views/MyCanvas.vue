<template>
    <!-- <div style="margin-bottom:20px;">
        <el-input-number v-model="scaler" :step="10" min="20" max="200" @change="scale" />
    </div> -->

    <div style="width:100vw">
        <!-- 功能区-->
        <a-flex justify="space-between" align="flex-start">
            <div>
                <a-button type="text">
                    <PlusCircleOutlined />放大
                </a-button>
                <a-button type="text" style="margin-left: -1vh">
                    <MinusCircleOutlined />缩小
                </a-button>
                <a-button v-show="!simuStarted" type="text" style="margin-left: -1vh" @click="codeGenerate">
                    <PlayCircleOutlined />仿真工程代码生成
                </a-button>
                <a-button v-show="!simuStarted" type="text" style="margin-left: -1vh" @click="runSimulation">
                    <PlayCircleOutlined />仿真工程编译
                </a-button>
                <a-button v-show="!simuStarted" type="text" style="margin-left: -1vh" @click="() => { simuStarted = true }">
                    <SettingOutlined />仿真运行配置
                </a-button>

                <a-button v-show="simuStarted" type="text" style="margin-left: -1vh" @click="downloadRunSimulation">
                    <DownloadOutlined />仿真工程下载与启动
                </a-button>
                <a-button v-show="simuStarted" type="text" style="margin-left: -1vh" @click="() => { simuStarted = false }">
                    <EditOutlined />仿真工程编辑
                </a-button>
            </div>
            <div style="margin-right: 10px">
                <a-button type="text">
                    <UserOutlined />
                </a-button>
            </div>

        </a-flex>
        <div style="display:flex;">
            <div id="shape-selector" style="width: 20%; height: 60%; border: 0px solid #ccc; padding-left: 0.5vw;
                display:block; flex-direction:column; justify-items:center; align-items:center">
                <!-- <div v-for="(category, index) in categories" :key="index" style="margin-bottom: 20px;">
                  <h3>{{ category.categoryName }}</h3>
                  <div v-for="model in category.models" :key="model.class_name" class="drag-node model"
                      draggable="true" @dragstart="onDragStart($event, model.class_name)"
                      :style="{ backgroundColor: model.color }">
                      {{ model.description }}
                  </div>
              </div> -->
                <el-menu>
                    <template v-for="(category, index) in categories" :key="index">
                        <el-sub-menu v-show="!simuStarted" v-if="category.categoryName != '仿真资源'">
                            <!-- <h3>{{ category.categoryName }}</h3> -->
                            <template v-slot:title>
                                <BorderOuterOutlined style="margin-right: 0.5vh" />
                                <span style="font-weight: 700;font-size: 18px;">{{ category.categoryName }}</span>
                            </template>
                            <div
                                style="margin-top: -0.5vh;display:flex; flex-direction:column; justify-items:center; align-items:center">
                                <el-menu-item v-for="model in category.models" :key="model.class_name"
                                    class="drag-node model" draggable="true"
                                    @dragstart="onDragStart($event, model.class_name, model.type)"
                                    :style="{ backgroundColor: model.color }">
                                    {{ model.description }}
                                </el-menu-item>
                            </div>
                        </el-sub-menu>
                        <el-sub-menu v-show="simuStarted" v-if="category.categoryName == '仿真资源'">
                            <template v-slot:title>
                                <BorderOuterOutlined style="margin-right: 0.5vh" />
                                <span style="font-weight: 700;font-size: 18px;">{{ category.categoryName }}</span>
                            </template>
                            <div
                                style="margin-top: -0.5vh;display:flex; flex-direction:column; justify-items:center; align-items:center">
                                <el-menu-item v-for="model in category.models" :key="model.class_name"
                                    class="drag-node model" draggable="true"
                                    @dragstart="onDragStart($event, model.class_name, model.type)"
                                    :style="{ backgroundColor: model.color }">
                                    {{ model.description }}
                                </el-menu-item>
                            </div>
                        </el-sub-menu>
                    </template>
                </el-menu>
                <div id="class-adder" style="margin: 2vh;">
                    <el-button v-show="!simuStarted" @click="addClassDialogVisible = true">新增类</el-button>
                    <el-dialog v-model="addClassDialogVisible" title="新增类">
                        <el-form :model="addClassForm" label-width="100px">
                            <el-form-item label="类名">
                                <el-input v-model="addClassForm.className" placeholder="请输入类名"></el-input>
                            </el-form-item>
                            <el-form-item label="代码">
                                <el-input v-model="addClassForm.code" placeholder="请输入类代码"></el-input>
                            </el-form-item>
                            <el-form-item label="入参信息">
                                <el-row v-for="(param, index) in addClassForm.inParams" :key="index">
                                    <el-col :span="8">
                                        <el-input v-model="param.name" placeholder="名称"></el-input>
                                    </el-col>
                                    <el-col :span="8">
                                        <el-input v-model="param.type" placeholder="类型"></el-input>
                                    </el-col>
                                    <el-col :span="8">
                                        <el-input v-model="param.tag" placeholder="标签"></el-input>
                                    </el-col>
                                    <el-button plain type="danger" @click="removeClassInParam(index)">移除</el-button>
                                </el-row>
                                <el-button @click="addClassInParam('input')">新增入参</el-button>
                            </el-form-item>
                            <el-form-item label="出参信息">
                                <el-row v-for="(param, index) in addClassForm.outParams" :key="index">
                                    <el-col :span="8">
                                        <el-input v-model="param.name" placeholder="名称"></el-input>
                                    </el-col>
                                    <el-col :span="8">
                                        <el-input v-model="param.type" placeholder="类型"></el-input>
                                    </el-col>
                                    <el-col :span="8">
                                        <el-input v-model="param.tag" placeholder="标签"></el-input>
                                    </el-col>
                                    <el-button plain type="danger" @click="removeClassOutParam(index)">移除</el-button>
                                </el-row>
                                <el-button @click="addClassOutParam('output')">新增出参</el-button>
                            </el-form-item>
                            <el-form-item label="本地依赖">
                                <el-upload ref="upload" multiple :on-change="handleFileSelection"
                                    :before-upload="() => false" :show-file-list="false">
                                    <el-button slot="trigger" size="small" type="primary">选择文件</el-button>
                                    <div v-if="addClassForm.localDependencies.length > 0">
                                        已选择文件:
                                        <ul>
                                            <li v-for="(file, index) in addClassForm.localDependencies" :key="index">{{
                    file.name }}</li>
                                        </ul>
                                    </div>
                                </el-upload>
                            </el-form-item>
                        </el-form>
                        <span slot="footer" class="dialog-footer">
                            <el-button type="primary" @click="saveAddClass">保 存</el-button>
                            <el-button @click="addClassDialogVisible = false">取 消</el-button>
                        </span>
                    </el-dialog>
                    <el-dialog v-model="modifyGroupInfo" title="修改节点信息">
                        <el-form :model="groupInfoForm" label-width="100px" :rule="groupInfoRules"
                            ref="groupInfoFormRef">
                            <el-form-item label="ip地址" prop="ip">
                                <el-input v-model="groupInfoForm.ip" placeholder="请输入ip"></el-input>
                            </el-form-item>
                            <el-form-item label="端口" prop="port">
                                <el-input-number v-model="groupInfoForm.port" placeholder="请输入端口号" :min="1" :max="65536"
                                    :controls=false></el-input-number>
                            </el-form-item>
                            <el-form-item label="名称" prop="name">
                                <el-input v-model="groupInfoForm.name" placeholder="请输入名称"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="saveGroupInfo(groupInfoFormRef)">保 存</el-button>
                                <el-button @click="modifyGroupInfo = false">取 消</el-button>
                            </el-form-item>
                        </el-form>

                    </el-dialog>
                </div>
            </div>
            <!--画布-->
            <div class="parent-canvas" ref="parent-canvas">
                <div id="container" ref="container" style="width: 80%; height: 80%;"></div>
            </div>
        </div>
        
        <!-- 终端输出框 -->
        <div class="terminal-container">
            <div class="terminal-header">
                <a-button type="text" @click="codeGenerate">
                    <PlayCircleOutlined />仿真工程代码生成
                </a-button>
                <a-button type="text" @click="runSimulation">
                    <PlayCircleOutlined />仿真工程编译
                </a-button>
                <a-button type="text" @click="downloadRunSimulation">
                    <DownloadOutlined />仿真工程下载与启动
                </a-button>
            </div>
            <div class="terminal-output">
                <pre>{{ terminalOutput }}</pre>
            </div>
        </div>
    </div>

    <!-- <div>
        <button @click="saveGraph">SAVE</button>
        <input id="LdGf" type="file" ref="fileInput" @change="loadGraph">
    </div>
    <div v-show="selectedItem" v-if="selectedItem">
        <attrWindow id="attrWindow1" style="width:500px" :item="selectedItem" @update="handleUpdate" />
    </div> -->
</template>

<script setup name="GraphEditor">
import G6 from '@antv/g6';
import { ref, onMounted, reactive, computed } from 'vue'
// import { readFile } from 'original-fs';
// import attrWindow from '@/components/attrWindow.vue';
import {
    PlusCircleOutlined,
    MinusCircleOutlined,
    CloudUploadOutlined,
    UserOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    AlignLeftOutlined,
    BorderOuterOutlined,
    DownloadOutlined,
    EditOutlined,
    SettingOutlined,
} from '@ant-design/icons-vue';

window.electronAPI.onSaveGraph((value) => {
    saveGraph()
})

window.electronAPI.onLoadGraph(async (value) => {
    const dt = await window.electronAPI.openFile()
    const data = JSON.parse(dt)
    loadGraphFromData(data)
    // console.log(filePath)
})

window.electronAPI.onNewClass(async (value) => {
    addClassDialogVisible.value = true
})

// display
const selectedItem = ref(null)
let count = 0;
let resCount = 0;
const simuStarted = ref(false)

const terminalOutput = ref('初始化完成')
function printToTerminal(message) {
    terminalOutput.value += '\n' + message 
}

function runSimulation() {
    printToTerminal('仿真工程编译开始...')
    window.electronAPI.executeCommand("notepad")
    printToTerminal('编译成功，开始仿真...')
}

function downloadRunSimulation() {
    window.electronAPI.executeCommand("notepad")
    console.log("仿真工程下载与启动")
    printToTerminal('仿真工程下载与启动')
}

function codeGenerate() {
    const folderPath = 'D:\\sthgithub\\seElectron';
    window.electronAPI.openFileExplorer(folderPath);
    printToTerminal('代码生成成功');
}

const processParallelEdgesOnAnchorPoint = (
    edges,
    offsetDiff = 15,
    multiEdgeType = 'quadratic',
    singleEdgeType = undefined,
    loopEdgeType = undefined
) => {
    const len = edges.length;
    const cod = offsetDiff * 2;
    const loopPosition = [
        'top',
        'top-right',
        'right',
        'bottom-right',
        'bottom',
        'bottom-left',
        'left',
        'top-left',
    ];
    const edgeMap = {};
    const tags = [];
    const reverses = {};
    for (let i = 0; i < len; i++) {
        const edge = edges[i];
        const { source, target, sourceAnchor, targetAnchor } = edge;
        const sourceTarget = `${source}|${sourceAnchor}-${target}|${targetAnchor}`;

        if (tags[i]) continue;
        if (!edgeMap[sourceTarget]) {
            edgeMap[sourceTarget] = [];
        }
        tags[i] = true;
        edgeMap[sourceTarget].push(edge);
        for (let j = 0; j < len; j++) {
            if (i === j) continue;
            const sedge = edges[j];
            const { source: src, target: dst, sourceAnchor: srcAnchor, targetAnchor: dstAnchor } = sedge;

            // 两个节点之间共同的边
            // 第一条的source = 第二条的target
            // 第一条的target = 第二条的source
            if (!tags[j]) {
                if (source === dst && sourceAnchor === dstAnchor
                    && target === src && targetAnchor === srcAnchor) {
                    edgeMap[sourceTarget].push(sedge);
                    tags[j] = true;
                    reverses[`${src}|${srcAnchor}|${dst}|${dstAnchor}|${edgeMap[sourceTarget].length - 1}`] = true;
                } else if (source === src && sourceAnchor === srcAnchor
                    && target === dst && targetAnchor === dstAnchor) {
                    edgeMap[sourceTarget].push(sedge);
                    tags[j] = true;
                }
            }
        }
    }

    for (const key in edgeMap) {
        const arcEdges = edgeMap[key];
        const { length } = arcEdges;
        for (let k = 0; k < length; k++) {
            const current = arcEdges[k];
            if (current.source === current.target) {
                if (loopEdgeType) current.type = loopEdgeType;
                // 超过8条自环边，则需要重新处理
                current.loopCfg = {
                    position: loopPosition[k % 8],
                    dist: Math.floor(k / 8) * 20 + 50,
                };
                continue;
            }
            if (length === 1 && singleEdgeType && (current.source !== current.target || current.sourceAnchor !== current.targetAnchor)) {
                current.type = singleEdgeType;
                continue;
            }
            current.type = multiEdgeType;
            const sign =
                (k % 2 === 0 ? 1 : -1) * (reverses[`${current.source}|${current.sourceAnchor}|${current.target}|${current.targetAnchor}|${k}`] ? -1 : 1);
            if (length % 2 === 1) {
                current.curveOffset = sign * Math.ceil(k / 2) * cod;
            } else {
                current.curveOffset = sign * (Math.floor(k / 2) * cod + offsetDiff);
            }
        }
    }
    return edges;
};

// 实际接入后端后，改为在init时进行处理
// const categories = ref([
//     {
//         categoryName: "第一类",
//         models: [
//             { class_name: "A", description: "矩形-3-2(A)", color: "#d3d6e0" },
//             { class_name: "B", description: "矩形-4-3(B)", color: "#d3d6e0" },
//         ]
//     },
//     {
//         categoryName: "第二类",
//         models: [
//             { class_name: "C", description: "矩形-1-5(C)", color: "#FFD700" },
//             { class_name: "D", description: "矩形-1-3(D)", color: "#FFD700" },
//         ]
//     },
//     {
//         categoryName: "自定义类",
//         models: [

//         ]
//     },
// ]);

// const categories = ref([
//     {
//         categoryName: "节点",
//         models: [
//             { class_name: "1", description: "节点(1)", color: "#d3d6e0" },
//             { class_name: "2", description: "节点(2)", color: "#d3d6e0" },
//             { class_name: "3", description: "节点(3)", color: "#d3d6e0" },
//             { class_name: "4", description: "节点(4)", color: "#d3d6e0" },
//         ]
//     },
//     {
//         categoryName: "模型",
//         models: [
//             { class_name: "A", description: "模型(A)", color: "#d3d6e0" },
//             { class_name: "B", description: "模型(B)", color: "#d3d6e0" },
//             { class_name: "C", description: "模型(C)", color: "#d3d6e0" },
//             { class_name: "D", description: "模型(D)", color: "#d3d6e0" },
//         ]
//     },
//     {
//         categoryName: "自定义类",
//         models: [

//         ]
//     },
// ]);
const categories = ref([
    {
        categoryName: "节点",
        models: [
            { class_name: "group1", description: "计算节点", color: "#fff", type: "group", ip: "127.0.0.1", port: 6001, name: "计算节点" },
            { class_name: "group2", description: "GPU计算节点", color: "#fff", type: "group", ip: "127.0.0.1", port: 6002, name: "GPU计算节点" },
            { class_name: "group3", description: "存储节点", color: "#fff", type: "group", ip: "127.0.0.1", port: 6003, name: "存储节点" },
            { class_name: "group4", description: "通讯节点", color: "#fff", type: "group", ip: "127.0.0.1", port: 6004, name: "通讯节点" }
        ]
    },
    {
        categoryName: "模型",
        models: [
            { class_name: "导引头模型", description: "导引头模型", color: "#fff", type: "model" },
            { class_name: "控制模型", description: "控制模型", color: "#fff", type: "model" },
            { class_name: "弹体模型", description: "弹体模型", color: "#fff", type: "model" },
            { class_name: "目标运动模型", description: "目标运动模型", color: "#fff", type: "model" },
            { class_name: "信号转换模块", description: "信号转换模块", color: "#fff", type: "model" },
            { class_name: "相对运动模型", description: "相对运动模型", color: "#fff", type: "model" }
        ]
    },
    {
        categoryName: "仿真资源",
        models: [
            { class_name: "resource1", description: "机器A", color: "#fff", type: "resource", ip: "127.0.0.1", port: 6001, name: "机器A" },
            { class_name: "resource2", description: "机器B", color: "#fff", type: "resource", ip: "127.0.0.1", port: 6002, name: "机器B" },
            { class_name: "resource3", description: "机器C", color: "#fff", type: "resource", ip: "127.0.0.1", port: 6003, name: "机器C" },
            { class_name: "resource4", description: "机器D", color: "#fff", type: "resource", ip: "127.0.0.1", port: 6004, name: "机器D" },
        ]
    },
    {
        categoryName: "自定义类",
        models: [

        ]
    },
]);

let graph = ref(null)
let nodes = ref([])
let edges = ref([])
let groups = ref([])
let sourceAnchorIdx, targetAnchorIdx
let registeredNodes = ref([])
// const menu = ref(null)

import classesData from '@/static/classes.json'
import jiedianData from '@/static/jiedian.json'

let classes = classesData.classes
let jiedian = jiedianData.jiedian

let curVarType = ref('')
let isDragging = ref(false)

let scaler = ref(100)

function scale() {
    console.log(scaler.value / 100)
    graph.value.zoomTo(scaler.value / 100)
}

let modifyGroupInfo = ref(false)
let groupInfoFormRef = ref()
let groupInfoForm = ref({
    ip: '',
    port: 0,
    name: ''
})
const validateIp = (rule, value, callback) => {
    console.log(value)
    if (value === '') {
        callback(new Error('ip不可为空'))
    } else {
        const ipv4Regex = new RegExp('/^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/')
        console.log(ipv4Regex.test(value))
        if (ipv4Regex.test(value)) {
            callback()
        }
        else {
            callback(new Error('ip格式错误'))
        }
    }
}
const groupInfoRules = reactive({
    ip: [
        { validator: validateIp, trigger: 'blur', required: true }
    ],
    port: [
        { trigger: 'blur', required: true }
    ],
    name: [
        { trigger: 'blur', required: true }
    ]
})

async function saveGroupInfo(formEl) {
    if (!formEl) return
    console.log(formEl)
    await formEl.validate((valid) => {
        if (valid) {
            console.log('submit!')
            console.log(selectedItem.value)
            let className = selectedItem.value.className
            selectedItem.value.ip = groupInfoForm.value.ip
            selectedItem.value.port = groupInfoForm.value.port
            selectedItem.value.label = groupInfoForm.value.name
            updateGraph()
            // let model = categories.value[0].models.find(item => item.class_name == className)
            // model.ip = groupInfoForm.ip
            // model.port = groupInfoForm.port
            // model.name = groupInfoForm.name
            modifyGroupInfo.value = false
            selectedItem.value = null
        } else {
            console.log('error submit!')
        }
    })
}

// for newly-added class
let addClassDialogVisible = ref(false)
let addClassForm = ref({
    className: '',
    code: '',
    inParams: [],
    outParams: [],
    localDependencies: []
})

function addClassInParam() {
    addClassForm.value.inParams.push({ name: '', type: '', tag: '' });
}

function addClassOutParam() {
    addClassForm.value.outParams.push({ name: '', type: '', tag: '' });
}

function removeClassInParam(index) {
    addClassForm.value.inParams.splice(index, 1);
}

function removeClassOutParam(index) {
    addClassForm.value.outParams.splice(index, 1);
}

// 处理文件选择的函数
const handleFileSelection = (file, fileList) => {
    // 使用 Element UI el-upload 组件时，fileList 参数包含了所有选中的文件
    // 这里我们将 fileList 直接赋值给 localDependencies，存储选中的文件信息
    addClassForm.value.localDependencies = [...fileList];
};


// 保存添加的类的函数
function saveAddClass() {
    console.log("保存添加的类");
    classes.push({
        class_name: addClassForm.value.className,
        code: addClassForm.value.code,
        input_num: addClassForm.value.inParams.length,
        output_num: addClassForm.value.outParams.length,
        input_params: addClassForm.value.inParams,
        output_params: addClassForm.value.outParams,
        local_dependencies: addClassForm.value.localDependencies, // 包含本地依赖
        category: 2,
    });
    console.log(classes);
    categories.value.find(item => item.categoryName == "自定义类").models.push({
        class_name: addClassForm.value.className,
        description: `矩形-${addClassForm.value.inParams.length}-${addClassForm.value.outParams.length}-(${addClassForm.value.className})`,
        color: "#fff"
    });

    addClassDialogVisible.value = false;
    addClassForm.value.className = '';
    addClassForm.value.inParams = [];
    addClassForm.value.outParams = [];
    addClassForm.value.localDependencies = []; // 重置本地依赖
}

onMounted(() => {
    initGraph()
    initMenu()
    setupDragEvents()
})

function hideAnchorPointsVisibility(item) {
    const anchorPoints = item.getContainer().findAll(ele => ele.get('name') === 'anchor-point');
    anchorPoints.forEach(point => {
        point.attr({ opacity: 0.5 })
    })
}

function showAnchorPointsVisibility(item) {
    const anchorPoints = item.getContainer().findAll(ele => ele.get('name') === 'anchor-point');
    anchorPoints.forEach(point => {
        point.attr({ opacity: 1 })
    })
}

function getRectAnchors(inNum, outNum) {
    // 4,3 leads to [[0, 0.2], [0, 0.4], [0, 0.6], [0, 0.8], [1, 0.25], [1, 0.5], [1, 0.75]]
    inNum = Number(inNum)
    outNum = Number(outNum)
    let inInterval = 1 / (inNum + 1)
    let outInterval = 1 / (outNum + 1)
    let anchors = []
    for (let i = 1; i <= inNum; i++)
        anchors.push([0, i * inInterval])
    for (let i = 1; i <= outNum; i++)
        anchors.push([1, i * outInterval])
    return anchors
}

function register(inNum, outNum, inPar, outPar, className) {
    count++;
    registeredNodes.value.push({
        class_name: className,
        input_num: inNum,
        output_num: outNum,
        input_params: inPar,
        output_params: outPar
    })
    let newName = `rect-node-${inNum}-${outNum}`
    G6.registerNode(newName, {
        getAnchorPoints(cfg) {
            return cfg.anchorPoints || getRectAnchors(inNum, outNum);
            // return cfg.anchorPoints || [[0, 0.2], [0, 0.4], [0, 0.6], [0, 0.8], [1, 0.25], [1, 0.5], [1, 0.75]];
        },
        // draw anchor-point circles according to the anchorPoints in afterDraw
        afterDraw(cfg, group) {
            const bbox = group.getBBox();

            // 用className找到注册过的类
            console.log('afterdraw:', cfg.id, cfg.className)
            let cla = registeredNodes.value.find(ele => ele.class_name == cfg.className)
            // console.log(cla.input_num,cla.input_params,cla.output_num,cla.output_params)

            const anchorPoints = this.getAnchorPoints(cfg)
            anchorPoints.forEach((anchorPos, i) => {
                const isEntryPoint = i < inNum;
                group.addShape('circle', {
                    attrs: {
                        r: 5,
                        x: bbox.x + bbox.width * anchorPos[0],
                        y: bbox.y + bbox.height * anchorPos[1],
                        fill: '#fff',
                        stroke: '#5F95FF',
                        opacity: 0
                    },
                    // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                    name: `anchor-point`, // the name, for searching by group.find(ele => ele.get('name') === 'anchor-point')
                    anchorPointIdx: i, // flag the idx of the anchor-point circle
                    links: 1, // cache the number of edges connected to this shape
                    visible: true, // invisible by default, shows up when links > 1 or the node is in showAnchors state
                    draggable: true, // allow to catch the drag events on this shape
                    pointType: isEntryPoint ? 'entry' : 'exit', // 入点或出点

                    // parType: isEntryPoint ? inPar[i].type : outPar[i - inNum].type,
                    // parName: isEntryPoint ? inPar[i].name : outPar[i - inNum].name,
                    // parTag: isEntryPoint ? inPar[i].tag : outPar[i - inNum].tag,

                    // 采用以上写法会导致bug：在相同出/入锚点数量时全部使用最新的inPar/outPar

                    parType: isEntryPoint ? cla.input_params[i].type : cla.output_params[i - inNum].type,
                    parName: isEntryPoint ? cla.input_params[i].name : cla.output_params[i - inNum].name,
                    parTag: isEntryPoint ? cla.input_params[i].tag : cla.output_params[i - inNum].tag,
                    available: true
                })
            })
        },

        // response the state changes and show/hide the link-point circles
        setState(name, value, item) {
            if (name === 'showAnchors') {
                const anchorPoints = item.getContainer().findAll(ele => ele.get('name') === 'anchor-point');
                anchorPoints.forEach(point => {
                    if (value || point.get('links') > 0) point.show()
                    else point.hide()
                })
            }
        }
    }, 'rect')
    console.log("register node:", newName)
    return newName
}


function initTooltip() {
    const tooltip = new G6.Tooltip({
        offsetX: 10,
        offsetY: 10,
        getContent(e) {
            const outDiv = document.createElement('div')
            outDiv.style.width = '180px'
            let type = e.item.getType();
            if (type == 'node' || type == 'combo') {
                if (e.target.get('name') == 'anchor-point') {
                    outDiv.innerHTML = `
                        <h4>Anchor Point</h4>
                        <ul><li>Name: ${e.target.get('parName')}</li></ul>
                        <ul><li>Type: ${e.target.get('parType')}</li></ul>
                        <ul><li>Tag: ${e.target.get('parTag')}</li></ul>
                        `
                    return outDiv
                }
                else {
                    let nodeClass = e.item.getModel().nodeClass
                    if (nodeClass == 'resource') {
                        outDiv.innerHTML = `
                            <h4>Node</h4>
                            <ul><li>ID: ${e.item.getID()}</li></ul>
                            <ul><li>ip: ${e.item.getModel().ip}</li></ul>
                            <ul><li>port: ${e.item.getModel().port}</li></ul>
                        `
                    }
                    else {
                        outDiv.innerHTML = `
                            <h4>Node</h4>
                            <ul><li>ID: ${e.item.getID()}</li></ul>
                            <ul><li>Code: ${e.item.getModel().label || e.item.getModel().id}</li></ul>
                        `
                    }
                    return outDiv
                }
            }
            else if (type == 'edge') {
                let sourceClassName = nodes.value.find(ele => ele.id == e.item.getSource().getID()).className;
                let targetClassName = nodes.value.find(ele => ele.id == e.item.getTarget().getID()).className;
                let sourceClass = classes.find(item => item.class_name == sourceClassName);
                let targetClass = classes.find(item => item.class_name == targetClassName);
                let sourceAP = sourceClass.output_params[e.item.getModel().sourceAnchor - sourceClass.input_num]
                let targetAP = targetClass.input_params[e.item.getModel().targetAnchor]
                outDiv.innerHTML = `
        <h4>Edge</h4>
        <h5>Source:</h5>
        <ul>
          <li>Name: ${sourceAP.name}</li>
          <li>Type: ${sourceAP.type}</li>
          <li>Tag: ${sourceAP.tag}</li>
        </ul>
        <h5>Target:</h5>
        <ul>
          <li>Name: ${targetAP.name}</li>
          <li>Type: ${targetAP.type}</li>
          <li>Tag: ${targetAP.tag}</li>
        </ul>
        `
                return outDiv
            }
        },
        itemTypes: ['node', 'edge', 'combo']
    })
    return tooltip
}

// 处理子组件发出的更新
function handleUpdate(updatedItem) {
    if (isDragging.value == true) {
        return;
    }
    selectedItem.value = updatedItem;
    updateGraph(); // 调用更新图表的方法
}

function initMenu() {
    const menu = new G6.Menu({
        getContent(evt) {
            let header;
            if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
                header = 'Canvas ContextMenu';
            } else if (evt.item) {
                const itemType = evt.item.getType();
                header = `${itemType.toUpperCase()} ContextMenu`;
            }
            const outDiv = document.createElement('div');
            outDiv.style.cursor = 'pointer'
            outDiv.innerHTML = '<p id="deleteNode">删除</p>'
            // let btn = outDiv.querySelector('#deleteNode')
            // console.log(btn)
            // btn.addEventListener('click', test)
            // return `
            // <h3>${header}</h3>
            // <ul>
            //   <li title='1'>li 1</li>
            //   <li title='2'>li 2</li>
            //   <li>li 3</li>
            //   <li>li 4</li>
            //   <li>li 5</li>
            // </ul>`;
            return outDiv
        },
        handleMenuClick: (target, item) => {
            console.log(target, item);
            graph.value.removeItem(item);
            edges.value = graph.value.save().edges
            nodes.value = graph.value.save().nodes
            groups.value = graph.value.save().combos
        },
        // offsetX and offsetY include the padding of the parent container
        // 需要加上父级容器的 padding-left 16 与自身偏移量 10
        offsetX: 16 + 10,
        // 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
        offsetY: 0,
        // the types of items that allow the menu show up
        // 在哪些类型的元素上响应
        itemTypes: ['node', 'edge', 'combo'],
    })
    return menu;
}

let canvas_width = ref(0);
let canvas_height = ref(0);

function initGraph() {
    const tooltip = initTooltip()
    const menu = initMenu()
    // this.canvas_width = this.$refs.parent-canvas.ClientWidth;
    // this.canvas_height = this.$refs.parent-canvas.ClientHeight;
    graph.value = new G6.Graph({
        container: 'container',
        // width: this.canvas_width,
        // height: this.canvas_height,
        width: 1920,
        height: 1080,
        plugins: [menu, tooltip],
        groupType: 'rect',
        groupByTypes: 'false',
        groupStyle: {
            default: {},
            hover: {},
            collapse: {},
        },
        modes: {
            default: [
                'drag-combo', 'drag-node-with-combo',
                'drag-group', 'drag-node-with-group', 'collapse-expand-group',
                'drag-canvas',
                'zoom-canvas',
                // config the shouldBegin for drag-node to avoid node moving while dragging on the anchor-point circles
                {
                    type: 'drag-node',
                    shouldBegin: e => {
                        if (e.target.get('name') === 'anchor-point') return false;
                        return true;
                    }
                },
                // config the shouldBegin and shouldEnd to make sure the create-edge is began and ended at anchor-point circles
                {
                    type: 'create-edge',
                    trigger: 'drag', // set the trigger to be drag to make the create-edge triggered by drag
                    shouldBegin: e => {
                        // avoid beginning at other shapes on the node
                        if (e.target && e.target.get('name') !== 'anchor-point') return false;
                        sourceAnchorIdx = e.target.get('anchorPointIdx');
                        if (e.target.get('pointType') != 'exit') return false;
                        curVarType = e.target.get('parType');
                        e.target.set('links', e.target.get('links') + 1); // cache the number of edge connected to this anchor-point circle
                        return true;
                    },
                    shouldEnd: e => {
                        // avoid ending at other shapes on the node
                        if (e.target && e.target.get('name') !== 'anchor-point') return false;
                        if (e.target.get('pointType') != 'entry') return false;
                        if (e.target.get('available') == false) {
                            //   alert("已经……被塞满了……")
                            alert("该锚点可连接数达到上限")
                            return false;
                        }
                        if (e.target.get('parType') != curVarType) {
                            alert(`出点的类型为: ${curVarType}，入点的类型为: ${e.target.get('parType')}，二者类型不同，不能相互连接。`);
                            curVarType = '';
                            return false;
                        }
                        if (e.target) {
                            targetAnchorIdx = e.target.get('anchorPointIdx');
                            e.target.set('links', e.target.get('links') + 1);  // cache the number of edge connected to this anchor-point circle
                            e.target.set('available', false);
                            return true;
                        }

                        targetAnchorIdx = undefined;
                        return true;
                    },
                }],
        },
        defaultNode: {
            shape: 'rect'
            // type: 'rect-node',
            // size: [60, 100],
            // style: {
            //     fill: '#d3d6e0',
            //     stroke: '#5B8FF9',
            //     lineWidth: 2,
            // },
        },
        defaultEdge: {
            // type: 'quadratic',
            type: 'line',
            style: {
                stroke: '#1f1f1f',
                lineWidth: 2,
                endArrow: {
                    path: G6.Arrow.vee(5, 10, 10),
                    d: 10,
                },
            },
            labelCfg: {
                autoRotate: true,
            },
        },
    })
    // Event listeners
    // graph.value.on('node:click', onNodeClick);

    graph.value.on('aftercreateedge', (e) => {
        // count++;
        // update the sourceAnchor and targetAnchor for the newly added edge
        graph.value.updateItem(e.edge, {
            sourceAnchor: sourceAnchorIdx,
            targetAnchor: targetAnchorIdx
        })

        // update the curveOffset for parallel edges
        const tempEdges = graph.value.save().edges;
        edges.value = tempEdges
        processParallelEdgesOnAnchorPoint(tempEdges);
        graph.value.getEdges().forEach((edge, i) => {
            graph.value.updateItem(edge, {
                curveOffset: tempEdges[i].curveOffset,
                curvePosition: tempEdges[i].curvePosition,
            });
        });

    });
    // // after drag from the first node, the edge is created, update the sourceAnchor
    graph.value.on('afteradditem', (e) => {
        if (e.item && e.item.getType() === 'edge' && sourceAnchorIdx != null) {
            graph.value.updateItem(e.item, {
                sourceAnchor: sourceAnchorIdx
            });
        }
        if (e.item && e.item.getType() === 'edge') {
            let targetNode = graph.value.findById(e.item.get("target").getID())
            let anchor = (targetNode.getContainer().findAll(ele => ele.get('name') === 'anchor-point'))[e.item.get("model").targetAnchor]
            if (anchor)
                anchor.set('available', false)
        }
    })
    // if create-edge is canceled before ending, update the 'links' on the anchor-point circles
    graph.value.on('afterremoveitem', e => {
        if (e.item && e.item.source && e.item.target) {
            const sourceNode = graph.value.findById(e.item.source);
            const targetNode = graph.value.findById(e.item.target);
            const { sourceAnchor, targetAnchor } = e.item;
            if (sourceNode && !isNaN(sourceAnchor)) {
                const sourceAnchorShape = sourceNode.getContainer().find(ele => (ele.get('name') === 'anchor-point' && ele.get('anchorPointIdx') === sourceAnchor));
                sourceAnchorShape.set('links', sourceAnchorShape.get('links') - 1);
            }
            if (targetNode && !isNaN(targetAnchor)) {
                const targetAnchorShape = targetNode.getContainer().find(ele => (ele.get('name') === 'anchor-point' && ele.get('anchorPointIdx') === targetAnchor));
                targetAnchorShape.set('links', targetAnchorShape.get('links') - 1);
                let anchor = (targetNode.getContainer().findAll(ele => ele.get('name') === 'anchor-point'))[e.item.targetAnchor]
                anchor.set('available', true)
            }
        }
    })

    // 节点双击事件
    graph.value.on('dblclick', e => {
        if (e.item && e.item.getType() !== 'edge') {
            let model = e.item.getModel()
            console.log(model)
            if (model.nodeClass === 'resource') {
                modifyGroupInfo.value = true
                groupInfoForm.value.ip = model.ip
                groupInfoForm.value.port = model.port
                groupInfoForm.value.name = model.label
            }
            selectedItem.value = e.item._cfg.model
            // selectedItem.value.className = "123123"
            console.log(e.item._cfg.model)
        }
        else {
            selectedItem.value = null;
        }
    })

    // some listeners to control the state of nodes to show and hide anchor-point circles
    graph.value.on('node:mouseenter', e => {
        // graph.value.setItemState(e.item, 'showAnchors', true);
        showAnchorPointsVisibility(e.item)
    })
    graph.value.on('node:mouseleave', e => {
        // graph.value.setItemState(e.item, 'showAnchors', false);
        hideAnchorPointsVisibility(e.item)
    })
    graph.value.on('node:mouseout', e => {
        // mouseout不符合预期，暂时不考虑触发隐藏锚点
        // hideAnchorPointsVisibility(e.item)
    })
    graph.value.on('node:dragenter', e => {
        // graph.value.setItemState(e.item, 'showAnchors', true);
        hideAnchorPointsVisibility(e.item)
    })
    graph.value.on('node:dragleave', e => {
        // console.log("dragleave")
        // graph.value.setItemState(e.item, 'showAnchors', false);
        hideAnchorPointsVisibility(e.item)
    })
    graph.value.on('node:dragstart', e => {
        // graph.value.setItemState(e.item, 'showAnchors', true);
        isDragging.value = true;
        showAnchorPointsVisibility(e.item)
    })
    graph.value.on('node:dragend', e => {
        // graph.value.setItemState(e.item, 'showAnchors', false);
        // console.log('dragend')
        isDragging.value = false;
        hideAnchorPointsVisibility(e.item)
    })
    // Initial render
    updateGraph();
}

function onDragStart(event, className, type) {
    let dragClass = classes.find(item => item.class_name == className);
    event.dataTransfer.setData('className', dragClass.class_name)
    event.dataTransfer.setData('type', type)
    // console.log("Drag Class: ", dragClass.class_name)
}

function setupDragEvents() {
    const container = document.getElementById('container');
    container.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    container.addEventListener('drop', (event) => {
        // hideAnchorPointsVisibility(event.item)
        // const anchorPoints = this.findAll(ele => ele.get('name') === 'anchor-point');
        // anchorPoints.forEach(point => {
        //     console.log(point)
        //     point.attr({opacity:0})
        // })
        console.log("cececes")
        event.preventDefault();
        let type = event.dataTransfer.getData('type');
        let className = event.dataTransfer.getData('className');
        if (type == "group" || type == "resource") {
            // console.log(event.dataTransfer)
            event.dataTransfer.clearData();
            // let nodeType = register(0, 0, 0, 0) // 节点应该不需要出入参数
            let dragClass = classes.find(item => item.class_name == className);
            let model = categories.value[dragClass.category].models.find(item => item.class_name == className)
            // let models = categories.value.find(item => {
            //     if (item) {
            //         return item.models[0].class_name == className
            //     }
            //     return false
            // })
            // let model = models.find(item => item.class_name == className)
            // console.log(test)
            let _ip = model.ip
            let _port = model.port
            let text = model.name
            // text.replace("group", "节点")
            if (true) {
                if (type == 'group')
                    count++;
                else if (type == 'resource')
                    resCount++;
                const model = {
                    id: type == 'group' ? `jiedian-${count}` : `resource-${resCount}`,
                    title: `${count}`,
                    className: className,
                    ip: _ip,
                    port: _port,
                    x: event.offsetX,
                    y: event.offsetY,
                    size: [500, 300],
                    type: 'rect',
                    nodeClass: type,
                    label: text,
                    labelCfg: {
                        style: {
                            fontSize: 16
                        },
                    },
                    style: {
                        "fill": categories.value[dragClass.category].models[0].color
                    },
                }
                groups.value.push(model);
                updateGraph(); // Re-render the graph
            }

        }
        else {
            // let className = event.dataTransfer.getData('className');
            let dragClass = classes.find(item => item.class_name == className);
            console.log('Drag:', dragClass)
            let inNum = dragClass.input_num;
            let outNum = dragClass.output_num;
            let inPar = dragClass.input_params;
            let outPar = dragClass.output_params;
            let text = dragClass.code;
            let class_name = dragClass.class_name;
            event.dataTransfer.clearData();
            let nodeType = register(inNum, outNum, inPar, outPar, class_name);
            // console.log(categories.value)
            if (nodeType) {
                const model = {
                    id: `${nodeType}-${count}`,
                    // comboId: 'jiedian-1',
                    className: className,
                    x: event.offsetX,
                    y: event.offsetY,
                    label: `${text}`,
                    labelCfg: {
                        style: {
                            fontSize: 15
                        },
                    },
                    type: nodeType,
                    nodeClass: type,
                    size: [90, 60],
                    style: {
                        "fill": categories.value[dragClass.category].models[0].color
                    }
                };
                nodes.value.push(model); // Add node to nodes array
                updateGraph(); // Re-render the graph
            }
        }
    });
}

function updateGraph() {
    graph.value.data({
        nodes: nodes.value,
        edges: edges.value,
        combos: groups.value,
    });
    G6.Util.processParallelEdges(edges.value);
    sourceAnchorIdx = null;
    graph.value.render();
}

function saveGraph() {
    // 将数据组合成一个对象
    const jsonData = {
        // count:count,
        classesData: classes,
        registerData: registeredNodes.value, // 自定义Node信息（inNum, outNum, inPar, outPar），load后重新注册
        graphData: graph.value.save(),
    };
    const jsonDataStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonDataStr], { type: 'application/json' }); // 创建一个 Blob 对象

    const url = URL.createObjectURL(blob); // 创建一个 URL 对象
    // 创建一个 <a> 标签，并设置其属性，模拟用户点击下载
    const link = document.createElement('a');
    link.href = url;
    link.download = `saved-${Date.now()}.json`; // 下载文件的文件名
    // 触发点击事件以下载文件
    document.body.appendChild(link);
    link.click();
    // 清理 URL 对象
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
    console.log('save')
}

function loadGraph(event) {
    const file = event.target.files[0]; // 获取用户选择的文件
    if (!file) return;
    const reader = new FileReader(); // 创建一个FileReader对象
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result); // 读取文件内容并解析为 JSON
            console.log("Load:", file)
            count = 0
            classes = data.classesData
            categories.value.find(item => item.categoryName == "自定义类").models.length = 0
            classes.forEach(cla => {
                if (cla.category == 2) {
                    categories.value.find(item => item.categoryName == "自定义类").models.push({
                        class_name: cla.class_name,
                        description: `矩形-${cla.input_num}-${cla.output_num}-(${cla.class_name})`,
                        color: "#fff"
                    })
                }
            })

            let registered = data.registerData
            registered.forEach(node => {
                register(node.input_num, node.output_num, node.input_params, node.output_params)
            })

            edges.value = data.graphData.edges
            nodes.value = data.graphData.nodes
            updateGraph()
        } catch (error) {
            console.error(error);
        }
    };

    reader.readAsText(file); // 以文本形式读取文件内容
}

function loadGraphFromData(data) {

    try {
        count = 0
        classes = data.classesData
        categories.value.find(item => item.categoryName == "自定义类").models.length = 0
        classes.forEach(cla => {
            if (cla.category == 2) {
                categories.value.find(item => item.categoryName == "自定义类").models.push({
                    class_name: cla.class_name,
                    description: `矩形-${cla.input_num}-${cla.output_num}-(${cla.class_name})`,
                    color: "#fff"
                })
            }
        })

        let registered = data.registerData
        registered.forEach(node => {
            register(node.input_num, node.output_num, node.input_params, node.output_params)
        })

        edges.value = data.graphData.edges
        nodes.value = data.graphData.nodes
        updateGraph()
    }
    catch (error) {
        console.error(error);
    }
}

</script>



<style scoped>
.model {
    width: 10vw;
    height: 40px;
    cursor: grab;
    margin-top: 5px;
    border-radius: 10%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 0 !important;
    padding-right: 0 !important;
    border: 1px solid black;
    font-size: 16px;
}

.g6-component-tooltip {
    background-color: rgba(255, 255, 255, 0.8);
    padding: 0px 10px 24px 10px;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
}

.parent-canvas {
    min-width: 80vw;
    flex-grow: 1;
    min-height: 90vh;
    border: 1px solid #fff;
}

.terminal-container {
    margin-top: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 0px;
    background-color: #ccc;
    color: #fff;
}

.terminal-header {
    display: flex;
    justify-content: left;
    margin-bottom: 0px;
}

.terminal-output {
    background-color: #000;
    padding: 10px;
    border-radius: 5px;
    height: 200px;
    overflow-y: auto;
}

pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
}
</style>