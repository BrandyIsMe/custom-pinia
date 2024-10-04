
import {ref,effectScope, App} from 'vue'
import { piniaSymbol } from './piniaSymbol'
export let activePinia:any
export const setActivePinia = (pinia:any) => activePinia = pinia
export function createPinia() {
    const scope = effectScope(true)
    const state = scope.run(()=>ref({}))
    const _plugins:any = []
    const pinia = {
        use(plugin:any) { // 提供给外界用于注册插件
          _plugins.push(plugin)
          return this //返回this方便链式调用
        },
        install(app:App) {
          setActivePinia(pinia) //将这个piniaStore暴露到全局上，为了在不是vue组件中也能访问到piniaStore（比如router）。
          app.provide(piniaSymbol, pinia) //这样就能让vue3的所有组件都可以通过app.inject(piniaSymbol)访问到piniaStore
          app.config.globalProperties.$pinia = pinia //这样就能让vue2的组件实例也可以共享piniaStore
        },
        _plugins ,
        _stores: new Map(), //存放所有的store
        _e:scope, //用来停止所有state的响应式。（实际上pinia并没有提供停止所有 响应式的方法，但是我们可以在pinia中可以使用store1._p._e.stop()来终止所有effect，但当然pinia是不推荐这样做的（注：store1是指一个store实例））
        state,
    }
    return pinia
}