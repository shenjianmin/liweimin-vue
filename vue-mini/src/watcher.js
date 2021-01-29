class Watcher {
    constructor(vm, key, cb, precb){
        this.vm = vm
        this.key = key
        this.cb = cb
        this.precb = precb || undefined

        // 把 Watcher 对象记录到 Dep 的静态属性 target 上
        Dep.target = this

        // 对于属性的访问，会触发 getter 从而使得 Watcher 实例被添加到 Dep 中
        this.oldValue = vm[key]
        Dep.target = null // 方式 dep.addSub 多次执行
    }

    update(oldValue){
        let newValue = this.vm[this.key]
        // 如果不是传入的  oldValue， 那么比较的每次this.oldValue 都是实例化产生的value(永远都是第一个值)
        if( newValue === oldValue){
            return 
        }
        this.precb && this.precb(oldValue)
        this.cb(newValue)
    }
}