import {piniaSymbol} from './piniaSymbol'
import {getCurrentInstance,inject,reactive,effectScope,isRef,isReactive, toRefs, computed} from 'vue'
import { activePinia, setActivePinia } from './createPinia'

function isComputed(v:any) { // 计算属性是ref，同时也是一个effect
    return !!(isRef(v as any)&& v.effect)
}

function createSetupStore(id:string, setup:any, piniaStore:any,isOption?:any) {
    let scope
    function $patch(){}
    const partialStore = {//内置的api存放到这个store里
      $patch
    }
    const store = reactive(partialStore) //store就是一个响应式对象，这个是最后暴露出去的store，会存放内置的api和用户定义的store
  
    if (!piniaStore.state.value[id] && !isOption) { // 整个pinia的store里还没有存放过目前这个state 且 用户用options语法来define的store
      piniaStore.state.value[id] = {}
    }
  
    //这个函数就是为了到时候方便停止响应式。（核心的创建store可以不要这部分代码）
    const setupStore = piniaStore._e.run(() => { //这样包一层就可以到时候通过pinia.store.stop()来停止全部store的响应式
      scope = effectScope()
      return scope.run(()=>setup()) //这样包一层就可以到时候通过scope.stop()来停止这个store的响应式
    })
  
    //遍历这个store里的所有属性，做进一步处理
    for (let key in setupStore) {
      const prop = setupStore[key]
  
       //处理action
      if (typeof prop == 'function') {
        setupStore[key] = wrapAction(key, prop)
      }
  
      //处理state
      if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) { //如果他是ref或者是reactive则说明它是state（注意由于computed也是ref，所以要排除掉计算属性）
        if (!isOption) { //如果是setup语法，把里面的state也存到全局的state里
          piniaStore.state.value[id][key] = prop
        }
      }
}
 /**对actions包一层，做一些处理。store里面存的actions实际都是经过了这个包装的actions。*/
        function wrapAction(name:any, action:any) {
            return function () {
            let ret = action.apply(store, arguments) //使this永远指向store

            //action执行后可能是一个promise，todo......

            return ret
            }
        }

        // 把不是用户定义的和是用户定义的都合并到store里，并给外面使用
        Object.assign(store,setupStore)
        piniaStore._stores.set(id, store)//将这个store存到piniaStore中
    return store
}


function createOptionsStore(id:any, options:any,piniaStore:any) {
    const { state, actions, getters } = options
  
    function setup() { //处理store里的state、actions、getters
      piniaStore.state.value[id] = state ? state() : {} //把这个store的state存到piniaStore里
      const localState = toRefs(piniaStore.state.value[id]) //把这个store的state转换成ref即变成响应式，因为options写法里的state并不是响应式的。
      return Object.assign( //这里返回的对象就是用户存放用户定义的属性和方法
        localState, //用户的state
        actions, // 用户的actions
        Object.keys(getters || {}).reduce((memo:any, name) => { //用户的getters，因为用户的getters这个对象里的属性都是函数，所以我要把这些函数都执行了变成计算属性
          memo[name] = computed(() => {
            let store = piniaStore._stores.get(id)
            return getters[name].call(store)
          })//call是为了保证this指向store
      },{}))
    }
  
    const store:any = createSetupStore(id, setup, piniaStore, true)
  
    store.$reset = function () {
      const rawState = state ? state() : {}
      store.$patch((state:any) => {
        Object.assign(state,rawState)
      })
    }
}
export function defineStore(idOrOptions:any, optionsOrSetup:any) {
    let id:any, options:any

    if (typeof idOrOptions === 'string') { //是第一种传参方式
        id = idOrOptions
        options = optionsOrSetup
      } else { // 是第二种传参方式
        options = idOrOptions
        id = options.id
      }

      function useStore() {
        const instance = getCurrentInstance() // 获得当前组件实例
        let piniaStore:any = instance && inject(piniaSymbol) //如果当前组件实例存在就注入整个piniaStore(因为只有在vue组件里才能使用inject)
        if (piniaStore) {
          setActivePinia(piniaStore)
        }
        piniaStore = activePinia //这样就可以哪怕不是在vue组件中使用也能拿到整个piniaStore（比如在router中使用）
        if (!piniaStore._stores.has(id)) { //如果是还没有这个store（即第一次使用这个useStore），那就创建这个store。！！在use的时候才会创建这个store！！
          if (typeof optionsOrSetup === 'function') { //传进来一个setup函数 ，是第三种传参方式
            createSetupStore(id, optionsOrSetup,piniaStore)
          } else { //前两种传参方式都用这个来构建store
            createOptionsStore(id,options,piniaStore)
          }
        }
        return piniaStore._stores.get(id) //获得目前use的这个store
      }

      return useStore
}