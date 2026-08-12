<template>
  <a-space orientation="vertical" size="large" style="display: flex;">
    <!-- 欢迎部分 -->
    <div class="welcome-block">
      <div class="welcome-content">
        <span style="font-size: 18px">你好，很高兴认识你👋</span>
        <span style="font-size: 30px; font-weight: bold; margin: 10px 0">我叫 罗浩森</span>
        <span style="font-size: 16px">是一位 全栈式生信分析开发工程师</span>
      </div>
    </div>

    <!-- 技术栈部分 -->
    <div class="tech-block">
      <div class="tech-title">个人技术栈</div>
      <div class="tech-skills">
        <a-tag v-for="skill in skills" :key="skill.name" class="skill-tag" :href="skill.url" target="_blank">
          <a-space size="small">
            <img :src="skill.svg" class="skill-icon" loading="lazy" />
            <span>{{ skill.name }}</span>
          </a-space>
        </a-tag>
      </div>
    </div>

    <!-- 人格类型 -->
    <div class="personality-type-block">
      <!-- 人格类型说明 -->
      <div class="personality-type-block-content">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px">
          <span class="personality-type-name" style="color: gray; font-size: 25px;">人格类型</span>
          <span class="personality-type-code" style="font-size: 45px; font-weight: bold; color: #f0b100">ISTP-A</span>
          <span class="personality-type-name" style="font-size: 30px; color: #f0b100">鉴赏家</span>
        </div>
      </div>
      <!-- 人格图片 -->
      <a class="personality-link" :href="personality.url" target="_blank">
        <img class="istp-img-style" :src="personality.img" loading="lazy" />
      </a>
    </div>

    <!-- 个人职业生涯纪录 -->
    <div class="career-block">
      <div class="career-content">
        <div class="career-title">个人职业生涯记录</div>
        <div class="career-timeline-container">
          <a-timeline class="custom-timeline">
            <a-timeline-item v-for="item in career" :key="item.step" :dot="nodeChange(item)"
              class="career-timeline-item">
              <div class="career-timeline-content">
                <div class="career-timeline-title">{{ item.title }}</div>
                <div class="career-timeline-description">{{ item.description }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </div>

    <!-- 教育背景 -->
    <div class="background-block">
      <div class="background-title">教育背景</div>
      <div class="background-content">
        <a-space class="background-item" size="large" v-for="item in education">
          <img :src="item.img" width="120" height="120" loading="lazy" />
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div class="background-item-time">{{ item.time }}</div>
            <div class="background-item-title">{{ item.title }}</div>
            <div class="background-item-desc">{{ item.desc }}</div>
          </div>
        </a-space>
      </div>
    </div>

    <!-- 联系 -->
    <div class="contact-block">
      <div style="font-size: 30px; font-weight: bold; margin: 10px 0; color: black">如何找到我？</div>
      <div class="contact-info">
        <a-button v-for="item in contactMe" :key="item.title" style="border-radius: 10px; min-width: 150px;"
          :color="item.buttonColor" variant="solid" size="large" @click="openLink(item.url)">
          <component :is="item.icon" />
          {{ item.title }}
        </a-button>
      </div>
    </div>
  </a-space>
</template>

<script setup lang="ts">
import "./index.scss"
import { skills, career, education, personality, contactMe } from "./data.ts";

// 节点图标
import { h } from "vue";
import { CheckCircleFilled, LoadingOutlined } from "@antdv-next/icons";

// 前端规范格式
import { CareerSchema, contactMeSchema } from "./schema.ts";


defineOptions({
  name: 'AboutPageVue'
})

// 节点更换
const nodeChange = (item: CareerSchema) => {
  return item.state === 'completed' ?
    () => h(CheckCircleFilled, { style: { fontSize: '20px', color: '#000' } }) :
    () => h(LoadingOutlined, { style: { fontSize: '25px', color: '#e8e8e8' } })
}

// 联系我-点击事件-通用
const openLink = (url: string) => {
  if (url.startsWith("mailto:")) {
    window.location.href = url
  } else {
    window.open(url, "_blank")
  }
}

</script>