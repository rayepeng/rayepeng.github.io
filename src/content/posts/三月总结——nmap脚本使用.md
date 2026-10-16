---
title: '三月总结——nmap脚本使用'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
> 一直没弄懂nmap， 不过以前也没怎么用过这个工具。 现在先开一篇博客记下来

NMap，也就是Network Mapper，是Linux下的网络扫描和嗅探工具包。

先放几张图感受一下nmap的强大吧

用的是nmap的图形界面版本

![](https://upload-images.jianshu.io/upload_images/10651191-90658970ed73910f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-0a4dd2dfa3af037f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-e639ee7ac54e0b18.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里是利用了百度的ip地址进行扫描

常用的选项
> -p 指定端口 1-65536
-sU  表示udp扫描
-Pn  不对目标进行ping检测

# nmap命令的常见写法
> nmap -T4 -A -v 192.168.10.100
> nmap -A -v www.baidu.com/24
nmap -p22 192.168.53.1 -sV
nmap -p1-65535 192.16.53.1 -sV
nmap -p5000-6000 192.16.53.1 -sV
nmap -sV -O -T4 192.168.1.107

# 有关脚本的命令行参数如下：
-sC: 等价于–script=default，使用默认类别的脚本进行扫描 可更换其他类别 
–script=<Lua scripts>: <Lua scripts>使用某个或某类脚本进行扫描，支持通配符描述
–script-args=<n1=v1,[n2=v2,...]>: 为脚本提供默认参数
–script-args-file=filename: 使用文件来为脚本提供参数
–script-trace: 显示脚本执行过程中发送与接收的数据
–script-updatedb: 更新脚本数据库
–script-help=<scripts>: 显示脚本的帮助信息，其中<scripts>部分可以逗号分隔的文件或脚本类别

# nmap 按脚本分类扫描

* auth ： 负责处理鉴权证书的脚本
* broadcast： 在局域网内探查更多服务开启状况
* brute： 提供暴力破解方式

# 参考资料
[nmap脚本使用总结](https://www.cnblogs.com/h4ck0ne/p/5154683.html)
