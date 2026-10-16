---
title: 'bwApp靶场'
date: 2019-01-01
category: '渗透测试'
tags: []
lang: 'zh'
draft: true
---
是一款非常好用的漏洞演示平台，打算用它来复现一些漏洞

## 安装
安装的过程挺简单，至少没有BWVS这些靶场那么难
下载之后直接放在wamp的目录下，然后访问index.php就行了，数据库什么的都会自动建立好

## 测试
**HTML Injection - Reflected (GET)**
![](https://upload-images.jianshu.io/upload_images/10651191-d69b696340646a38.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是没找到SSRF

## 参考资料
[BWAPP：一款非常好用的漏洞演示平台](https://www.freebuf.com/sectool/76885.html)
[SSRF学习之路](https://www.freebuf.com/column/157466.html)
