## 剖析Vue实现原理 - 如何实现双向绑定mvvm

## 使用 webpack打包
```bash
# npm install webpack webpack-dev-server webpack-merge --save-dev

# npm run build
```

## 引入 babel-loader

安装
```bash
# npm install babel-core babel-loader babel-preset-env --save-dev
```

配置
```json
{
  "presets": [
    ["env", {
      "modules": false,
      "targets": {
        "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
      }
    }]
  ]
}
```

## Usage

```bash

# git clone https://github.com/AlenQi/mvvm
# cd mvvm
# npm install
# npm run dev
```


## 当前对象
- Observe
- Dep
- Watcher
- MVVM
- Compiler
