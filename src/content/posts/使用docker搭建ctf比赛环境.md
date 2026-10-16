---
title: '使用docker搭建ctf比赛环境'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
在szf大佬的强力推荐下， 下载了一个GitHub上的项目， 准备开始构建镜像， 然后刷题。

# 2048

这个我很顺利地就构建了镜像

![2048](https://upload-images.jianshu.io/upload_images/10651191-ff521d08208ef49b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

有一个叫做2048/web的镜像

但是并不知道题目在哪里。是不是apache 再去了解一下？
![run一下](https://upload-images.jianshu.io/upload_images/10651191-e28e0d4f7e4c74f4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

去网上找了一下解决办法

[apache](https://askubuntu.com/questions/256013/apache-error-could-not-reliably-determine-the-servers-fully-qualified-domain-n)

并没有看到正在运行的docker容器

![](https://upload-images.jianshu.io/upload_images/10651191-dada74c52cd6713e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 解决中

netstat 是可以查看正在监听的端口服务， 但是并没有安装
![](https://upload-images.jianshu.io/upload_images/10651191-721ac4e64d120a80.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到此时apache2正在运行

![](https://upload-images.jianshu.io/upload_images/10651191-6bcc176d8c27a645.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

并且知道apache2的默认监听端口是80

![](https://upload-images.jianshu.io/upload_images/10651191-e786285c2eeb071f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

还是没办法解决掉遇到的问题， 无法让容器在后台保持运行

![](https://upload-images.jianshu.io/upload_images/10651191-184ec9434f12d97a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# docker-compose命令
docker-compose up 运行

docker-compose build 构建

# exapmle中的pwn
在构建镜像的过程中， 最后一步失败了

![](https://upload-images.jianshu.io/upload_images/10651191-a956af0b907144e7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 资料

[docker的网络连接问题]([https://codeday.me/bug/20171218/110086.html](https://codeday.me/bug/20171218/110086.html)
)

[解决Windows下无法对docker容器进行端口映射](https://blog.csdn.net/qq_33212500/article/details/79412930)

[docker-compose命令](https://beginor.github.io/2017/06/08/use-compose-instead-of-run.html)
