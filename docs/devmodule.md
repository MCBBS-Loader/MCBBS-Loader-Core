# 模块开发指南

## 快速上手

1. 创建一个空文件夹。

2. 在其中新建一个 JavaScript 文件（例如 `main.js`）。

3. 向其中写入：

   ```javascript
   // MCBBS-Module
   // @id test.test
   // @name 我的第一个模块
   // @description 希望能运行……
   // @author 你的名字
   // @icon https://github.com/favicon.ico
   // -MCBBS-Module
   alert("Hello World!");
   ```

   这样就创建好了一个模块！

4. 打开「MCBBS 模块管理」：

   ![Manager](https://i.loli.net/2020/11/14/H7i5bNOBRC6WZ8l.png)

5. 将以上代码粘贴到安装区，单击「安装」，模块即可出现在页面中，同时，模块中的代码会被执行：

   ![Modules](https://i.loli.net/2020/11/14/KwRi8AhXxCPSqj1.png)