<script setup lang="ts">
import { Blog } from "vuepress-theme-hope/blog";
// import BingHeroBackground from "vuepress-theme-hope/presets/BingHeroBackground.js";
import HitokotoBlogHero from "vuepress-theme-hope/presets/HitokotoBlogHero.js";
</script>

<template>
    <!-- 必应壁纸 -->
    <!-- <template #heroBg>
        <BingHeroBackground />
    </template> -->
    <!-- 一言描述替换tagline -->
    <Blog>
        <template #heroInfo="data">
            <HitokotoBlogHero v-bind="data" />
        </template>
    </Blog>
</template>