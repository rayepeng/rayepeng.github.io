---
title: 'docker架构'
date: 2019-01-01
category: 'docker实战'
tags: []
lang: 'zh'
draft: true
---
之前虽然对docker有过很深入地了解，但是其实只停留在命令的阶段，并没有对其中的架构有很深的理解。

#### docker架构
![docker架构](https://upload-images.jianshu.io/upload_images/10651191-42d38fcef66561e2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到其中有一个核心就是docker daemon
也就是曾今我一直很不理解的docker守护进程。

![架构](https://upload-images.jianshu.io/upload_images/10651191-6314d05b68bc76d0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

`docker run ubuntu echo hello  docker`
通过docker运行一个ubuntu操作系统然后显示一个hello docker

`docker images`可以查看本地的镜像

`docker run -p 8080:80 -d daocloud.io/nginx`
运行一个nginx服务， -p是端口映射， 把nginx的80端口映射到本机的8080端口。
-d:让容器在后台运行。
-P:将容器内部使用的网络端口映射到我们使用的主机上。

`docker ps`可以查看运行的镜像
`docker cp` 拷贝命令
`docker commit -m ""` 修改一个镜像并提交
