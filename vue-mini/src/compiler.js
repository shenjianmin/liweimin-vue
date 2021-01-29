class Compiler {
    constructor(vm){
        this.el = vm.$el
        this.vm = vm
        this.compile(this.el)
    }

    // 编译模板 处理文本节点 处理元素节点
    compile(el){
        const childNodes = el.childNodes
        Array.from(childNodes).forEach(node => {
            if(this.isTextNode(node)){
                this.compileText(node)
            }else if(this.isElementNode(node)){
                this.compilerElement(node)
            }

            // 如果node还有节点， 得递归调用 compile 方法， 完成所有节点的遍历
            if(node.childNodes && node.childNodes.length){
                this.compile(node)
            }
        })
    }

    // 编译元素节点
    compilerElement(node){
        Array.from(node.attributes).forEach(attr => {
            let attrName = attr.name
            if(this.isDirective(attrName)){
                attrName = attrName.substr(2)
                const key = attr.value
                // 这样就不用 写一堆 if-else 
                this.update(node, key, attrName)
            }
        })
    }

    /**
     * 
     * @param {*} node 当前 node 节点
     * @param {*} key 绑定值对应的变量名
     * @param {*} attrName 指令名 比如 v-text key就是text
     */
    update(node, key, attrName){
        // console.log(node, key, attrName);
        // 指令名
        let orderName = ''
        // 事件名
        let eventName = ''
        // 处理事件绑定的冒号
        if(attrName.indexOf(':') !== -1){
            [orderName, eventName] = attrName.split(':')
        }
        orderName = orderName || attrName
        // console.log(orderName, key, eventName);
        const updaterFnc = this[`${orderName}Updater`]
        let value = eventName ? this.vm.$options.methods[key]: this.vm[key]
        updaterFnc && updaterFnc.call(this, node, value, key, eventName)
    }

    // v-text 指令
    textUpdater(node, value, key){
        node.textContent = value
        new Watcher(this.vm, key, (newValue) => {
            node.textContent = newValue
        })
    }

    // v-modal 指令
    modalUpdater(node, value, key){
        node.value = value
        new Watcher(this.vm, key, (newValue) => {
            node.value = newValue
        })
        node.addEventListener('input', (e) => {
            this.vm[key] = e.target.value
        })
    }

    // v-html 指令: 将html文本解析为html
    htmlUpdater(node, value, key){
        node.innerHTML = value
        new Watcher(this.vm, key, (newValue) => {
            node.innerHTML = newValue
        })
    }

    // v-on 指令: 为DOM绑定事件回调
    // 形式： v-on:事件名='事件回调函数'  举例： <button v-on:click="doThis"></button>
    // 事件处理函数是不是响应式数据？  代码中更改了事件处理函数，会导致页面重渲染， 所以它是响应式数据
    onUpdater(node, value, key, eventName){
        node.addEventListener(eventName, value)
        new Watcher(this.vm.$options.methods, key, (newValue) => {
            node.addEventListener(eventName, newValue)
        },(oldVlaue)=>{
            // 先把之前的事件处理函数卸载掉
            console.log('....执行了....', oldVlaue);
            node.removeEventListener(eventName, oldVlaue)
        })
    }


    // 编译文本节点, 这里插值表达式不支持表达式形式
    compileText(node){
        // console.dir(node);
        // 要匹配的模式  {{ msg }}
        let value = node.textContent
        // . 任意字符   + 一个或多个 ?0此或1次
        let regex = /\{\{(.+?)\}\}/
        if(regex.test(value)){
            let key = RegExp.$1.trim()
            node.textContent = this.vm[key]
            new Watcher(this.vm, key, (newValue) => {
                node.textContent = newValue
            })
        }
        
    }

    // 判断节点属性是不是 指令
    isDirective(attrName){
        return attrName.startsWith('v-')
    }

    // 判断是不是文本节点
    isTextNode(node){
        return node.nodeType === 3
    }

    // 判断是不是元素节点
    isElementNode(node){
        return node.nodeType === 1
    }
}