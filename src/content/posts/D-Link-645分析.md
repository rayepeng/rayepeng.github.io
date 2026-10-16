---
title: 'D-Link-645分析'
date: 2019-01-01
category: 'IOT'
tags: []
lang: 'zh'
draft: true
---
[D-Link 850L&645路由漏洞分析](https://xz.aliyun.com/t/2941)

D-Link850和D-Link645都存在远程敏感信息读取漏洞

查看了文章中对于漏洞的分析

文章分析了`getcfg.php`位于/htdocs/web目录下
至于为什么对这个文件那么感兴趣，查略了一下cgi的意思，通用网关接口
就是运行在服务端的一个程序，能将从用户那里接受的数据进行处理，相当于web服务中的apache

存在漏洞的原因：
![](https://upload-images.jianshu.io/upload_images/10651191-19d3ae60ebdac453.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

`dophp`函数具体的定义我也没找到，但是从这里猜测出应该是加载`$file`的意思
而`$file`是由`$GETCFG_SVC`变量拼接的，继续往上看会发现这个变量的来源就是`$_POST['SERVICES']`也就是将用户通过post传来的servies的值直接拼接过来，这样就会导致任意文件读取。

还有一个关键点就是要绕过`is_power_user()`函数的判断
`is_power_user()`函数如下：
![](https://upload-images.jianshu.io/upload_images/10651191-e8dba0f5885aebe1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

原文中提到`$_GLOBALS`变量并不是php中的那个`$_GLOBALS`数组，而是在`cgibin`文件中定义，这个很疑惑，原文中也没有仔细说

接下来分析`cgibin`这个文件，由于是MIPS而不是x86，所以IDA无法直接反编译，有两种解决办法，一是安装一个`retdec-idaplugin`插件，但是没有安装成功，后来又去找了`jeb`这个工具去反编译，但是也不是所有的函数都能反编译

如下是main函数反编译的结果

![](https://upload-images.jianshu.io/upload_images/10651191-6464ff82a3185641.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

原文说关键在于`phpcgi_main`这个函数
![](https://upload-images.jianshu.io/upload_images/10651191-68ea493646186152.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是我没有办法反编译成功

这里直接参考原文中的代码

可以看到这个函数是针对不同的请求方式做出不同的响应，典型的cgi文件的工作方式

![](https://upload-images.jianshu.io/upload_images/10651191-afccea0e0244872f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

猜测`sobj_add_string`函数是拼接字符串
同时`sobj_add_char`是拼接一个字符
10就是'\n'对应的ascii码
于是据此构造出payload

> curl -d "SERVICES=DEVICE.ACCOUNT&attack=ture%0aAUTHORIZED_GROUP=1" "http://VictimIp:8080/getcfg.php"

SERVICES的值为我们想要读取的文件，这里我们选择`DEVICE.ACCOUNT.xml.php`文件
同时我们要让AUTHORIZED_GROUP为1

这里不理解为什么要添加一个`attack`参数

DIR-645的漏洞成因是类似的，

在虚拟机中测试了一下DIR-645，结果如下：
![](https://upload-images.jianshu.io/upload_images/10651191-66b0b277413f9256.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
