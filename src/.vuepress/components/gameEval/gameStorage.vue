<template>
  <div class="gameEvalplanB">
    <!-- 搜索组件 -->
    <a-input-search placeholder="搜索游戏..." style="margin-bottom: 16px;" allowClear @search="handleSearch" />

    <!-- 游戏卡片栅格 -->
    <a-row :gutter="[16, 16]">
      <a-col :span="6" v-for="(item, index) in filteredList">
        <a-card hoverable style="width: 180px">
          <!-- 封面 -->
          <template #cover>
            <img draggable="false" alt="noPic" :src="combinePicName(item.key)" loading="lazy" />
          </template>
          <!-- body -->
          <a-card-meta>
            <template #title>
              <a-tooltip :title="item.gameName">
                <span>{{ item.gameName }}</span>
              </a-tooltip>
            </template>
            <template #description>
              <a-tag v-for="(category, index) in item.gameCategory" :key="index" :color="getCategoryColor(category)">{{
                category }}</a-tag>
            </template>
          </a-card-meta>
          <!-- 操作按钮区 -->
          <template #actions>
            <!-- 游玩时间 -->
            <a-tooltip title="游玩时间（单位: 小时）">
              <span style="color: #000;">{{ item.gameTime }}</span>
            </a-tooltip>

            <!-- 查看详情，跳转到页面 -->
            <a-tooltip title="查看详情">
              <EyeFilled style="color: #000; font-size: 16px" @click="handleClick(item)" />
            </a-tooltip>

            <!-- 心动值 -->
            <a-space :gutter="[16, 16]">
              <HeartFilled style="color: red;" />
              <a-tooltip title="喜爱度">
                <span style="color: red;">{{ item.myScore }}</span>
              </a-tooltip>
            </a-space>
          </template>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang='ts'>
import { gameEvalList, categoryColors } from './data.ts'
import { HeartFilled, SmallDashOutlined, RightOutlined, EyeFilled, EyeTwoTone } from '@antdv-next/icons'
import { ref } from 'vue'

defineOptions({
  name: 'gameEvalCard'
})

// 响应式存储过滤后的游戏列表
const filteredList = ref([...gameEvalList])

// 获取分类对应的颜色
const getCategoryColor = (category: string) => {
  return categoryColors[category] || "default"
}

// 图片路径拼接
const combinePicName = (name: string) => {
  return `/game/600900/${name}.jpg`
}

// 点击查看详情，跳转到页面
const handleClick = (item: any) => {
  window.open(`/games/${item.gameNameEn}`, '_parent')
}


// 搜索功能
const handleSearch = (value: string) => {
  if (!value.trim()) {
    // 如果搜索框为空，恢复显示所有游戏
    filteredList.value = [...gameEvalList]
  } else {
    // 根据搜索条件过滤游戏列表
    filteredList.value = gameEvalList.filter(item =>
      item.gameName.toLowerCase().includes(value.toLowerCase())
    )
  }
}

</script>

<style scoped></style>