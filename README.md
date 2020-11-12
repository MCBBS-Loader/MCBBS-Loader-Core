# MCBBS-Loader-Core

<span style='font-size:1.5rem;color:#df307f'><strong>MCBBS Loader Core 是 MCBBS 模块加载器</strong></span>

---

## 简介

MCBBS Loader 可以加载符合要求的 MCBBS 模块到客户端，以扩展 MCBBS 的功能。

[立即获取（需要 TamperMonkey）](https://cdn.jsdelivr.net/gh/MCBBS-Loader/MCBBS-Loader-Core@main/dist/main.bundle.prod.user.js)

---

## 模块标准

MCBBS Loader 可以加载符合下面标准的模块：

```javascript
// MCBBS-Module
// @id com.example.id
// @name MyModule
// @icon https://example.com/icon.png
// @version 1.0.0
// @update https://example.com/new.js
// @author You
// -MCBBS-Module
console.log("This is a module!");
```

一个模块必须以 `// MCBBS-Module` 开头。

每个 `// @` 后面注明了属性值：

- id：唯一识别 ID，建议使用包名。

- name：显示名称。

- icon：图片 URL，可以使用 BASE64（需要前缀）。

- version：版本号，如果不进行自动更新，则不要填写此行

- update：更新 URL，需要指向新的 JavaScript 文件。

- author：作者名称。

信息部分以 `// -MCBBS-Module` 结尾，其下的所有部分均视为可执行代码，会在 DOM 加载完成后执行。

以上项目中，只有 `id` 是必填项。

有关 MCBBS Loader 提供的 API，请参阅 [模块开发指南](./docs/devmodule.md)

## 许可证

本产品是自由软件，采用 [GNU General Public License (Version 3)](https://www.gnu.org/licenses/gpl-3.0.html) 授权。

![GPL 3.0](https://www.gnu.org/graphics/gplv3-with-text-136x68.png)
