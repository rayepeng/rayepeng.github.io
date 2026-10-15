---
title: 'CSRF相关总结'
date: 2020-03-19
category: '渗透测试'
tags:
  - 'CSRF'
lang: 'zh'
draft: false
---
刚开始想写这篇文章的时候有点纠结分类，感觉归类到CTF不是很好，因为在CTF中就没遇到过，归类到渗透测试呢，又感觉不太对23333，算了还是丢到渗透测试吧

## 同源策略(SOP)

SOP影响范围包括：普通的HTTP请求、XMLHttpRequest、XSLT、XBL。

同源是指，**域名，协议，端口相同**

跨域的种类

-   协议不同
-   端口不同
-   主域名不同
-   子域名不同

允许跨域的标签

```
<script src="..."></script>
<img src="...">
<video src="..."></video>
<audio src="..."></audio>
<embed src="...">
<frame src="...">
<iframe src="..."></iframe>
<link rel="stylesheet" href="...">
<applet code="..."></applet>
<object data="..." ></object>
```

同源策略虽然感觉很陌生，但确实前端的基石，地位类似于在牛顿定律在力学中的地位

试想没有同源策略的话，那么任何一个网页都可以随意操控其他网页的数据，那真的是web世界的灾难。就像牛顿定律如果失效，估计地球都不知道怎么绕太阳转了

**重点：**

**跨域并不是请求发不出去，请求能发出去，服务端能收到请求并正常返回结果，只是结果被浏览器拦截了**。你可能会疑问明明通过表单的方式可以发起跨域请求，为什么 Ajax 就不会?因为归根结底，跨域是为了阻止用户读取到另一个域名下的内容，Ajax 可以获取响应，浏览器认为这不安全，所以拦截了响应。但是表单并不会获取新的内容，所以可以发起跨域请求。同时也说明了跨域并不能完全阻止 CSRF，因为请求毕竟是发出去了。

## 如何跨域？

跨域是必须的，因为同源策略的限制太严格了，子域名居然也和域名不同源！

1.  设置window.domain

浏览器允许通过设置 `document.domain` 来共享cookie

2.  cookie本身的domain属性

cookie本身可以设置 `domain` 属性，指定Cookie的所属域名为一级域名，比如`.example.com`。那么二级和三级域名也可以读取到cookie

### jsonp跨域

声明一个回调函数，其函数名(如show)当做参数值，要传递给跨域请求数据的服务器，函数形参为要获取目标数据(服务器返回的data)。

创建一个`<script>`标签，把那个跨域的API数据接口地址，赋值给script的src,还要在这个地址中向服务器传递该函数名（可以通过问号传参:?callback=show）。

服务器接收到请求后，需要进行特殊的处理：把传递进来的函数名和它需要给你的数据拼接成一个字符串,例如：传递进去的函数名是show，它准备好的数据是`show('我不爱你')`。

最后服务器把准备的数据通过HTTP协议返回给客户端，客户端再调用执行之前声明的回调函数（show），对返回的数据进行操作。

一个典型的jsonp攻击的代码

```js
<script>
function wooyun(v){
    alert(v.username);
}
</script>
<script src="http://js.login.360.cn/?o=sso&m=info&func=wooyun"></script>
```

发送请求过去之后，服务端返回了数据，然后就被弹出来了

遇到过的一个CTF题目

```
<script/src=&unit=https://www.google.com/complete/search?client=chrome&q=hello&callback=alert></script>
```

#### 防御jsonp攻击

验证 JSON 文件调用的来源（ Referer ）。这个方案是主要利用了 `<script>` 远程加载 JSON 文件时会发送 Referer ，在网站输出 JSON 数据时判断 Referer 是不是白名单合法的就可以进行防御！这个方法是可行的

1.  正则过滤不严谨
2.  空referer

### CORS 跨域资源共享

允许浏览器向跨源服务器，发出[`XMLHttpRequest`](http://www.ruanyifeng.com/blog/2012/09/xmlhttprequest_level_2.html)请求，从而克服了AJAX只能[同源](http://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html)使用的限制。

区分简单请求和非简单请求：

```
（1) 请求方法是以下三种方法之一：

HEAD
GET
POST
（2）HTTP的头信息不超出以下几种字段：

Accept
Accept-Language
Content-Language
Last-Event-ID
Content-Type：只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain
```

满足以上要求即是简单请求

重点在最后一句：

> Content-Type：只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain

对于简单请求，浏览器直接发出CORS请求。具体来说，就是在头信息之中，增加一个`Origin`字段。这个字段用来说明，本次请求来自哪个源（协议 + 域名 + 端口）。服务器根据这个值，决定是否同意这次请求。

如果`Origin`指定的域名在许可范围内，服务器返回的响应，会多出几个头信息字段。

```
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: FooBar
Content-Type: text/html; charset=utf-8
```

Access-Control-Allow-Origin： 要么是 origin 的值，要么就是 \*

Access-Control-Allow-Credentials: 它的值是一个布尔值，表示是否允许发送Cookie。如果不要的话就删除这个字段

Access-Control-Expose-Headers：如果想拿到其他字段，就必须在`Access-Control-Expose-Headers`里面指定。

CORS请求默认不发送Cookie和HTTP认证信息。如果要把Cookie发到服务器，一方面要服务器同意，指定`Access-Control-Allow-Credentials`字段。

## cookie属性

cookie的五大属性:“path, domain, expire, HttpOnly, Secure”，很少有人了解到cookie还有一个SameSite属性，这是一个专门用于防止csrf漏洞的属性。

1.  http-only:

浏览器会禁止页面中的 JavaScript 访问带有 HttpOnly 属性的 Cookie

2.  domain

domain标识域，如域A为t1.test.com，域B为t2.test.com，那么在域A生产一个令域A和域B都能访问的cookie就要将该cookie的domain设置为.test.com

3.  expire

过期时间

4.  Secure

当设置为true时，表示创建的 Cookie 会被以安全的形式向服务器传输，也就是只能在 HTTPS 连接中被浏览器传递到服务器端进行会话验证，如果是 HTTP 连接则不会传递该信息，所以不会被窃取到Cookie 的具体内容。

5.  path

path表示cookie所在的目录

### cookie分类

## 防护

### samsite属性

面试真实问题：vue开发的前后端项目如何避免CSRF？

查到的解决方案：

1.  如果后端用Django开发，可以通过传递CSRF token过来
