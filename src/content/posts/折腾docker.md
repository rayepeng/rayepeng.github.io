---
title: '折腾docker'
date: 2019-01-01
category: 'docker实战'
tags: []
lang: 'zh'
draft: true
---
##### 关于docker

其实我也不知道docker是干嘛的，不过听说它很强大，所以试着玩一玩呗。

####

##### 下载docker

[菜鸟教程](http://www.runoob.com/docker/windows-docker-install.html)

通过docker-toolbox来安装[下载地址](http://mirrors.aliyun.com/docker-toolbox/windows/docker-toolbox/)

> Docker CLI 客户端，用来运行docker引擎创建镜像和容器
Docker Machine. 可以让你在windows的命令行中运行docker引擎命令
Docker Compose. 用来运行docker-compose命令
Kitematic. 这是Docker的GUI版本
Docker QuickStart shell. 这是一个已经配置好Docker的命令行环境
Oracle VM Virtualbox. 虚拟机
然后我的电脑里面就塞满了这些东西

刚下载之后，桌面上确实会有三个图标，但是Windows好像找不到，所以自己手动去目录里面翻了一下。
![文件](https://upload-images.jianshu.io/upload_images/10651191-c216468a2d79b2db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

无他，shift加右键打开start.sh脚本，不过Windows命令行是没办法运行这个脚本的，所有它会默认用git bash打开。(突然发现git是不是就相当于一个Linux的bash？好多命令都可以用，那我不是可以通过它来管理我的电脑？这个坑之后再去补上)

会经过一段时间的等待，
![start.sh](https://upload-images.jianshu.io/upload_images/10651191-537ea3f96ecc2936.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

通过提示信息可以看到它正在进行默认的配置。

之后会打开virtual box，可以看到正在分配IP地址。

我这里貌似尝试了一次之后失败了，所以接着又尝试了一下，
![docker](https://upload-images.jianshu.io/upload_images/10651191-75439e732c5daddd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

成功了！！！

之后尝试了第一个命令：

docker run hello-world
![hello-world](https://upload-images.jianshu.io/upload_images/10651191-123889bba280b779.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到docker先在本地查找hello-world的镜像，没找到，然后去一个hub里面检查并下载，

这就是docker入门的开始啦！

> 12月12日晚上

运行docker命令总是报错,如下：

![报错](https://upload-images.jianshu.io/upload_images/10651191-81c9d3de67632584.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> E:\ProgramFiles\Docker Toolbox\docker.exe: error during connect: Post https://192.168.99.100:2376/v1.37/containers/create: dial tcp 192.168.99.100:2376: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.
See 'E:\ProgramFiles\Docker Toolbox\docker.exe run --help'.

根据报错提示，可能是超时了，没有接收到响应。

另外记个笔记:

docker运行的时候，是有一个虚拟机开着的，这就是为啥安装Docker Toolbox的时候需要同时安装virtual box了。

所以重启电脑之后，需要手动开启虚拟机。
> [阿里镜像](https://cr.console.aliyun.com/cn-hangzhou/mirrors)
> 
> [win10安装docker](http://mirrors.aliyun.com/docker-toolbox/windows/docker-for-windows/?spm=5176.8351553.0.0.13be1991LXrGiw)
> 
> [docker文档](https://docs.docker.com/engine/reference/commandline/cli/?spm=5176.8351553.0.0.13be1991LXrGiw)
> 
> [docker documentation](https://docs.docker.com/engine/reference/builder/?spm=5176.8351553.0.0.13be1991LXrGiw)
> 
> [toolbox](http://mirrors.aliyun.com/docker-toolbox/windows/docker-toolbox/?spm=5176.8351553.0.0.13be1991LXrGiw)

之前说过win10安装docker有两种方式，但是win190更加推荐docker for Windows。

但是这个功能必须要求电脑开启了了hyper-v服务(应该就是win10自带的创建虚拟机的服务)

第一部当然是看一下处理器支不支持了，命令行下输入systeminfo

然而，如果是win10家庭版，默认是没有显示hyper-v服务的。

[家庭版添加hyper-v](https://jingyan.baidu.com/article/d7130635e5678113fcf4757f.html)
```
pushd "%~dp0"

dir /b %SystemRoot%\servicing\Packages\*Hyper-V*.mum >hyper-v.txt

for /f %%i in ('findstr /i . hyper-v.txt 2^>nul') do dism /online /norestart /add-package:"%SystemRoot%\servicing\Packages\%%i"

del hyper-v.txt

Dism /online /enable-feature /featurename:Microsoft-Hyper-V-All /LimitAccess /ALL
```
就是运行一个批处理程序。

然后我们就能愉快的找到hyper-v服务啦。
![hyper-v](https://upload-images.jianshu.io/upload_images/10651191-3fb991a84fa6f1e2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
