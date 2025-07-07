<template>
  <div :id="containerId" class="relation-graph-container" :style="{ width: '100%', height: height }"></div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  graphData: {
    nodes: any[];
    links: any[];
  },
  height?: string
}>()

const containerId = `relation-graph-${Math.random().toString(36).slice(2)}`
const height = props.height || '300px'

let chart: echarts.ECharts | null = null

const renderGraph = () => {
  if (!props.graphData) return
  const dom = document.getElementById(containerId)
  if (!dom) return
  if (!chart) chart = echarts.init(dom)
  chart.setOption({
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [{
      type: 'graph',
      layout: 'none',
      symbolSize: 50,
      data: props.graphData.nodes,
      links: props.graphData.links,
      roam: true,
      label: { show: true },
      edgeSymbol: ['circle', 'arrow'],
      edgeSymbolSize: [10, 20],
      edgeLabel: {
        fontSize: 20
      },
      lineStyle: {
        opacity: 0.9,
        width: 3,
        // curveness: 0.5
      }
    }]
  })
}

onMounted(renderGraph)
watch(() => props.graphData, renderGraph, { deep: true })
</script>

<style scoped>
.relation-graph-container {
  background-color: #f9f9f9;
  border-radius: 4px;
  border-left: 4px solid #1890ff;
  font-family: 'Courier New', Courier, monospace;
  padding: 12px;
  box-sizing: border-box;
}
</style>
