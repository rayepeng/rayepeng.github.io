---
title: 'HCTF-admin'
date: 2019-01-01
category: 'bugku-Writeup'
tags: []
lang: 'zh'
draft: true
---
## 准备
准备复盘hctf的题目

![项目的结构](https://upload-images.jianshu.io/upload_images/10651191-c436cd50bb8d4251.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

进入到 app目录下， 运行 docker build -t admin:v1 .
![运行过程](https://upload-images.jianshu.io/upload_images/10651191-0352107149a0f52d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

补充一下 docker-compose

## 参考资料

[docker build 命令](http://www.runoob.com/docker/docker-build-command.html)
[docker-compose命令详解](https://blog.csdn.net/u011781521/article/details/80464826)
[客户端session导致的安全问题](https://www.leavesongs.com/PENETRATION/client-session-security.html)
[从两道题目分析flask客户端session安全问题](https://blog.szfszf.top/tech/%E4%BB%8E%E4%B8%A4%E9%81%93hctf%E9%A2%98%E5%88%86%E6%9E%90flask%E5%AE%A2%E6%88%B7%E7%AB%AFsession%E5%AE%89%E5%85%A8%E9%97%AE%E9%A2%98/)
