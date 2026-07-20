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
      <a class="personality-link" href="https://www.16personalities.com/ch/istp-%E4%BA%BA%E6%A0%BC" target="_blank">
        <img class="istp-img-style" src="/about/ISTP-A.svg" loading="lazy" />
      </a>
    </div>

    <!-- 个人职业生涯纪录 -->
    <div class="career-block">
      <div class="career-content">
        <div class="career-title">个人职业生涯记录</div>
        <div class="career-timeline-container">
          <a-timeline class="custom-timeline">
            <a-timeline-item v-for="item in career" :key="item.step" :dot="nodeChange(item)" class="career-timeline-item">
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
        <a-space class="background-item" size="large">
          <img src="/about/zhkulogo.png" width="120" height="120" loading="lazy" />
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div class="background-item-time">2018.09 ~ 2022.06</div>
            <div class="background-item-title">仲恺农业工程大学</div>
            <div class="background-item-desc">种子科学与工程</div>
          </div>
        </a-space>
        <a-space class="background-item" size="large">
          <img src="/about/gszx.png" width="120" height="120" loading="lazy" />
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div class="background-item-time">2015.09 ~ 2018.06</div>
            <div class="background-item-title">中山市桂山中学</div>
            <div class="background-item-desc">理科 - 物化生</div>
          </div>
        </a-space>
      </div>
    </div>

    <!-- 联系 -->
    <div class="contact-block">
      <div style="font-size: 30px; font-weight: bold; margin: 10px 0; color: black">如何找到我？</div>
      <div class="contact-info">
        <a-button style="border-radius: 10px; min-width: 150px;" color="default" variant="solid" size="large"
          @click="clickGithub">
          <GithubOutlined />
          github
        </a-button>
        <a-button style="border-radius: 10px; min-width: 150px;" color="pink" variant="solid" size="large"
          @click="clickBilibili">
          <BilibiliOutlined />
          Bilibili
        </a-button>
        <!-- <a-button style="border-radius: 10px; min-width: 150px;" color="orange" variant="solid" size="large">
          <MailOutlined />
          email
        </a-button> -->
      </div>
    </div>
  </a-space>
</template>

<script setup lang="ts">
import "./index.scss"
import { skills, career } from "./data";
import {
  GithubOutlined,
  BilibiliOutlined,
  MailOutlined,
} from '@antdv-next/icons'

// 节点图标
import { h } from "vue";
import { CheckCircleFilled, LoadingOutlined } from "@antdv-next/icons";


defineOptions({
  name: 'AboutPageVue'
})

// 节点更换
const nodeChange = (item) => {
  return item.state === 'completed' ?
    () => h(CheckCircleFilled, { style: { fontSize: '20px', color: '#000' } }) :
    () => h(LoadingOutlined, { style: { fontSize: '25px', color: '#e8e8e8' } })
}

// 联系我-点击事件-github
const clickGithub = () => {
  window.open('https://github.com/Rochsen', '_blank')
}

// 联系我-点击事件-bilibili
const clickBilibili = () => {
  window.open('https://space.bilibili.com/361524948', '_blank')
}

</script>