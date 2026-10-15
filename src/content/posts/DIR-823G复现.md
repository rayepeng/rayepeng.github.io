---
title: 'DIR-823G复现'
date: 2019-08-03
updated: 2019-08-19
category: 'IOT'
tags:
  - 'CVE'
  - 'goahead'
lang: 'zh'
draft: false
---
## Dlink DIR-823G漏洞复现(CVE-2019-7298, CVE-2019-7297)

binwale提取文件

文件下载[地址](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/DIR823GA1_FW102B03.bin)

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/DIR823.png)

之后进行固件的模拟，

成功ping通网络  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/ping0.png)

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/DIR823-4.png)

第一次进入路由器需要需要进行一些设置页面，查看是否有未授权访问的情况

导出配置文件（信息泄露）。

![DIR823-0](https://i.imgur.com/2ElxWaU.png)

浏览器访问直接弹出了下载页面

![DIR823-1](https://i.imgur.com/7Y9pWFQ.png)

导出配置文件，  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/DIR823-2.png)

获取到系统信息

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/DIR823-3.png)

## goahead程序分析(命令注入)

在查看固件的bin目录时发现了一个goahead的程序，说明此路由器是通过goahead进行开发的

拖入到IDA中进行分析，发现0x42424C处注册了处理函数

抓取到登陆的数据包，是发往/HNAP1/的

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/DIR823-5.png)

分析`/HNAP1` 处理函数的逻辑。 函数位于`0x42383C`

在这个部分，从函数表中进行遍历，寻找函数

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/DIR823-6.png)

函数表如下：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/DIR823-7.png)

找到了需要调用的处理函数后，会首先记录 POST 的原始报文, 首先用 snprintf 生成命令， 然后使用 system 执行。

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/DIR823-8.png)

我们可以通过直接注入 `'` 来命令执行

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/DIR823-9.png)

验证一下：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/DIR823-10.png)

## 参考

[DIR-823G HNAP\_Entry\_Func](https://github.com/leonW7/D-Link/blob/master/Vul_2.md)
