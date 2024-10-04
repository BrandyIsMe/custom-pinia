<template>
  <header class="sticky top-0 bg-weather-primary shadow-lg">
    <nav
      class="container flex flex-col sm:flex-row sm:bg-red-500 items-center gap-4 text-white py-6"
    >
     <span @click="handleClick">{{ test.info }}{{ test.data }}</span>
      <RouterLink :to="{name: 'home'}">
        <div class="flex items-center gap-3 ">
          <i class="fa-solid fa-sun text-2xl"></i>
          <p class="text-2xl">本地气温</p>
        </div>
      </RouterLink>
      <div class="flex gap-3 flex-1  justify-end">
        <i class="fa-solid fa-circle-info text-xl hover:text-weather-secondary duration-150 cursor-pointer"></i>
      </div>
    </nav>
  </header>
</template>

<!-- <script setup lang="ts"></script> -->

<script>
export default {
  data() {
    return {
      test: {
        info : '1111'
      }
    }
  },

  methods: {
    handleClick() {
      // this.test.info = '2222'
      this.test.data = 'haha'
    }
  }
}
</script>
