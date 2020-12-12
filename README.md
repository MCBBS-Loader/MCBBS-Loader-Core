# MCBBS-Loader-Core

<span style='font-size:1.5rem;color:#df307f'><strong>MCBBS Loader Core 是 MCBBS 模块加载器</strong></span>

---

## 简介

MCBBS Loader 可以加载符合要求的 MCBBS 模块到客户端，以扩展 MCBBS 的功能。

---

## 模块标准

MCBBS Loader 可以加载符合下面标准的模块：

```javascript
/* MCBBS Module
id=com.example.example
name=Example Module
author=You
description=Lorem ipsum.
icon=https://example.com/example.png
depend=com.example.dep1, com.example.dep2, com.example.dep3
after=com.example.after1, com.example.after2
before=com.example.before1
*/
console.log("This is a module!");
```

一个模块必须以 `/* MCBBS-Module` 开头。

每个属性格式为 `<键>=<值>` ：

- id：唯一识别 ID，建议使用包名，不得含有空白字符

- name：显示名称

- icon：图片 URL，可以使用 BASE64（需要前缀）

- version：版本号，如果不进行自动更新，则不要填写此行

- updateURL：更新 URL，需要指向新的 JavaScript 文件

- author：作者名称

- permissions：权限，多个项之间用英文逗号隔开，每项的首末空格被忽略

- depend：硬依赖，缺失则无法运行，多个项指定方式和permission一致

- before：需要在指定的模块加载之后加载，如果指定缺失将被忽略，多个项目的指定方式和depend相同

- after：和before一样，但是是在指定模块之后

信息部分以 `*/` 结尾，其下的所有部分均视为可执行代码，会在 DOM 加载完成后执行。

以上项目中，只有 `id` 是必填项。

before和after仅推荐在多个模块先后操作同一个DOM元素的时候使用

有关更多信息，请访问我们的 [Wiki](https://github.com/MCBBS-Loader/MCBBS-Loader-Core/wiki/) 或 [网站](https://mcbbs-loader.xuogroup.top/)

## 许可证

本产品是自由软件，采用 [GNU General Public License (Version 3)](https://www.gnu.org/licenses/gpl-3.0.html) 授权。

![GPL 3.0](https://www.gnu.org/graphics/gplv3-with-text-136x68.png)
