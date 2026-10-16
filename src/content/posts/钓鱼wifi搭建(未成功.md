---
title: '钓鱼wifi搭建(未成功'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
## 环境搭建

```
git clone https://github.com/brav0hax/easy-creds
cd easy-creds
./install.sh
```

然后就会自动开始安装啦

## 修改配置文件

第一次使用ettercap 需要修改其默认配置文件 `/etc/ettercap/etter.conf `
需要我们把ettercap的ec_uid、ec_gid的值修改为0：以系统最高权限运行。

![image.png](https://upload-images.jianshu.io/upload_images/10651191-24be1607504b5998.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

另外，如果系统使用了iptables防火墙，还需取消#后的注释使iptables配置生效，将：

![image.png](https://upload-images.jianshu.io/upload_images/10651191-2bc547d07c89e2e0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

开启ipv4 数据包转发

进行iptables设置

启动服务

![image.png](https://upload-images.jianshu.io/upload_images/10651191-d60776b069d58b9e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-b348dee22eca6d8d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

修改
![](https://upload-images.jianshu.io/upload_images/10651191-cea9a2b7d942efed.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-1573e7e9450456a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

重启网络服务

![image.png](https://upload-images.jianshu.io/upload_images/10651191-6c80932981b4b8e7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-e5e541781b56045e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-a4d1001e7212323d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-774485eef89fb14a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-e3c13d220f6131b9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-64ca2357da1b3c18.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-121383a80183f570.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

服务正在启动
![image.png](https://upload-images.jianshu.io/upload_images/10651191-381e21efb7f23f07.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
