---
title: 'json_decode与waf'
date: 2019-01-01
category: '代码审计'
tags: []
lang: 'zh'
draft: true
---
#### 关于编码的问题
还没想好怎么写

#### about json
之前在一片博客文章中有提到过， post的四种方式， 其中一种就是有利用json的

那么到底什么是json呢？

**JSON: JavaScript Object Notation(JavaScript 对象表示法)**

##### json实例
```
{
    "sites": [
    { "name":"菜鸟教程" , "url":"www.runoob.com" }, 
    { "name":"google" , "url":"www.google.com" }, 
    { "name":"微博" , "url":"www.weibo.com" }
    ]
}
```
---
留着之后深入地探究json编码吧， 目前大概了解了json的格式就行了

####  关于json与waf
SQL注入的基本原理我大概还是明白的。

然而如果传输的数据是json格式的， 由于服务器会对json数据进行一次json解析， 导致有些字符可能会漏防， 所以主要研究有哪些字符在php+mysql执行环境中的json解码后容易出现遗漏。
![数据传输过程](https://upload-images.jianshu.io/upload_images/10651191-b6ab38d9f1fe37a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

测试代码如下：
```
<?php
include_once 'global.php';
$id = json_decode($_GET['id'])->id;
for($i = 0; $i < strlen($id); $i ++)
{
printf("%x",ord($id[$i]));
echo ",";
}
$arc = getArticleInfo($id);
?>
```
第一次测试URL
> http://127.0.0.1/phpaacms/show.php?id={"id":"31 and 1=1"}

第二次测试URL
> http://127.0.0.1/phpaacms/show.php?id={"id":"31 and\n1=1"}
 
经过分析得知 \n 被解析成 0x0a带入mysql执行语句中，  但是换行符本身对mysql查询是没有影响的。

##### URL编码探测
使用Burp suit的 Inturder模块进行暴力破解
测试URL如下：
> http://127.0.0.1/phpaacms/show.php?id={"id":"31 and%(00-FF)1=1"}

经验证发现：仅有%20（space）和%2B（+） 可以在json格式中存活，在常见注入的url中的%0A %0B……这些字符并不能被php的json_decode所解析。

##### 转义探测
经过’\’转义过的字符是否会被json decode并在mysql中执行？

测试URL入下：
> http://127.0.0.1/phpaacms/show.php?id={"id":"31 and\%(00-FF)1=1"}

%66（f）、%6E（n）、 %72（r）、%74（t）。也就是说 \f \n \r \t 这四个字符经过json_decode后，可以被当作mysql分隔符进行解析。

> http://127.0.0.1/phpaacms/show.php?id={"id":"31 and\u00(00-FF)1=1"}

\u0009、\u000A、\u000B、\u000C、\u000D、\u0020、\u002B均可以被json_decode并带入mysql作为mysql单词分隔符。

##### 单词中的探测
探测\x这类字符是否会被json_decode解析后替换为空
在and 之中插入字符
> http://127.0.0.1/phpaacms/show.php?id={"id":"31 an\%(00-FF)d 1=1"}

结果是无法执行

##### 十六进制探测
> http://127.0.0.1/phpaacms/show.php?id={"id":"31 and(00-FF) 1=1"}

无法执行

> http://127.0.0.1/phpaacms/show.php?id={"id":"31 and\x(00-FF)1=1"}

照样无法执行

---
我可能还是第一次接触编码这方面的问题， 安全真的好像是一个坑呀， 感觉怎么也挖不尽， 还是好好地努力，积累经验吧。

#### 参考资料
[json教程](http://www.runoob.com/json/json-tutorial.html)

[浅谈json参数解析对waf绕过的影响](https://xz.aliyun.com/t/306/)
