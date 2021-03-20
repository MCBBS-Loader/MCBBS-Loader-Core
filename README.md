# MCBBS-Loader-Core

![Webpack Build CI](https://github.com/MCBBS-Loader/MCBBS-Loader-Core/workflows/Webpack%20Build%20CI/badge.svg)

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

- depend：硬依赖，缺失则无法运行，多个项之间使用英文逗号隔开，所有空白字符被忽略

- before：需要在指定的模块加载之后加载，如果指定缺失将被忽略，多个项目的指定方式和 depend 相同。

- after：和 before 一样，但是是在指定模块之后

**注意！** `after` 和 `before` 仅指定加载顺序，不保证依赖关系，如果要指定硬依赖并决定先后顺序，请**同时指定** `after` 和 `before` ！

信息部分以 `*/` 结尾，其下的所有部分均视为可执行代码，会在 DOM 加载完成后执行。

以上项目中，只有 `id` 是必填项。

有关更多信息，请访问我们的 [Wiki](https://github.com/MCBBS-Loader/MCBBS-Loader-Core/wiki/) 或 [网站](https://mcbbs-loader.xuogroup.top/)

## 构建软件源
将你的所有模块文件（有效的模块文件应当大写驼峰命名）塞进一个文件夹，然后在该目录下运行本仓库根目录下的`buildsrc.js`，用法为`node buildsrc.js -g <gid格式化字符串，当中%basename%会被替换成无后缀的文件名>`
之后上传至合适位置即可，还有疑问建议阅读`node buildsrc.js -h`

## 许可证

本产品是自由软件，采用 [GNU General Public License (Version 3)](https://www.gnu.org/licenses/gpl-3.0.html) 授权。

![GPL 3.0](https://www.gnu.org/graphics/gplv3-with-text-136x68.png)
