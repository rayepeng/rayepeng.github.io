---
title: '只允许txt上传'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
确定是文件上传的题目咩？

![](https://upload-images.jianshu.io/upload_images/10651191-ec24dae8beb73471.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我修改了页面， 设置了两个按钮

每个文件内容都是

![](https://upload-images.jianshu.io/upload_images/10651191-bfa434c80a4bcea7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-0bd1372bc493fa2e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

御剑只扫出了一个

然后看到这些txt文件的文件名， 感觉很有规律

还有就是难道要我上传一个 一句话木马？
上传是有可能的，

```
<input type="file">
<input type="submit"> 

```
![](https://upload-images.jianshu.io/upload_images/10651191-2b6ce521ec265982.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我也是才发现
那个一键getshell就是一个submit

![](https://upload-images.jianshu.io/upload_images/10651191-f53fb4a9a8f693e3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然而文件内容并没有被显示出来

![](https://upload-images.jianshu.io/upload_images/10651191-6e5ec615068ef3be.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这样子修改

![](https://upload-images.jianshu.io/upload_images/10651191-2bca43e93d42f378.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可是我也不知道到底文件有没有被上传呀。。

![](https://upload-images.jianshu.io/upload_images/10651191-13f5d872839f9e6a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
