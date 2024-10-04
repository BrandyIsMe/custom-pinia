import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia, defineStore } from "./myPinia";
import "./assets/tailwind.css"

const pinia = createPinia()

const app = createApp(App);
app.use(router);
app.use(pinia);


export const useTestStore =  defineStore('test', {
    state: () => ({
        count: 1
    }),
    getters: {
        doubleCount: (state:any) => state.count * 2
    },
    actions: {
        increment () {
            this.count++
        }
    }
})

const testStore = useTestStore()

console.log('testStore', testStore);


console.log('pinia', pinia);

// console.log('testStore', testStore);


app.mount("#app");
