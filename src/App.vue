<template>
  <div class="flex flex-col min-h-screen font-Roboto bg-weather-primary">
    <!-- {{test.count  }} -->

    {{ obj.info }}
    {{ obj.test }}
    <button @click="handleClick">点击</button>
    <SiteNavigation />
    <RouterView />
  </div>
</template>

<!-- <script setup lang="ts">
import SiteNavigation from './components/SiteNavigation.vue'
import {useTestStore} from './main'
const test = useTestStore() 

const handleClick = () => {
  test.increment()
}
</script> -->

<script>
import SiteNavigation from './components/SiteNavigation.vue'
export default {
  data() {
    return {
      obj: {
        info: 'hello world'
      }
    }
  },

  components: {
    SiteNavigation
  },

  methods: {
    handleClick() {
      this.$store.commit('increment')
    }
  },
  // mounted (){
  //   this.obj.test = 'test'
  // }
}

</script>




<style scoped></style>
