---
title: 'Linux目录配置与分区'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
#### 写在前面
我害怕装Linux双系统， 其实最大的一个原因就是不会分区， 害怕自己分区不对把原有的Windows覆盖掉了，那就得不偿失了

#### Linux的目录配置
FHS 文件层次结构标准

![约定](https://upload-images.jianshu.io/upload_images/10651191-15c60d964b636706.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

说实话我没看懂上面那张图。

事实上，FHS针对目录树架构仅定义出三层目录下面应该放置什么数据而已，分别是下面这三个目录的定义：

* / （root, 根目录）：与开机系统有关；
* /usr （unix software resource）：与软件安装/执行有关；
* /var （variable）：与系统运行过程有关。
（还是鸟哥总结的精辟）

##### 根目录约定

###### FHS规定必须存在 根目录下的
/bin   放置可执行文件的目录
/boot 放置开机会使用到的文件
/dev 设备文件， 比较重要的文件有： /dev/zero， /dev/tty， /dev/sd
/etc 系统主要的配置文件几乎都存放在这个目录
特别重要的目录有： /etc/modprobe.d/, /etc/passwd, /etc/fstab, /etc/issue 
/lib 放置函数库的目录
/media 软盘， 光盘， DVD等设备都暂时挂载于此
/mnt  也是挂载设备的目录， 其中 Windows上的Ubuntu就是通过这个目录去挂载windows上的其他的目录的
/opt 第三方协力软件放置的目录
/run 开机所产生的信息放置到这个目录下
/sbin 设置系统环境的文件的目录
/srv 服务的目录
/tmp 暂时存放的目录

/usr 
/var
以上两个目录是另外设置的， 但是也位于根目录中。

###### 可选的目录 
/home /lib<qual> /root

先放这张图便于理解目录的层次结构
![目录树架构](https://upload-images.jianshu.io/upload_images/10651191-549937925edb9ca6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其中 /proc  是一个虚拟文件系统
/sys 也是一个虚拟的文件系统
/lost+found 当文件发生错误的时候， 将一些遗失的片段放入到这个目录

##### /usr目录约定
是 Unix software resource 的缩写， 不是User的缩写

###### 必须的目录
/usr/bin 所有一般用户能够用到的指令都放在这里
/usr/lib 功能与/lib相同， 可以将/lib链接到这个目录
/usr/local 系统管理员下载的软件，建议安装到这个目录
/usr/sbin 非系统正常运行所需要的指令， 所以可以将/sbin 链接到此目录
/usr/share 主要放置只读架构的数据文件，当然也包括共享文件
其中可能存在次目录 /usr/share/man 线上说明文档 
/usr/share/doc 软件杂项的文件说明 
/usr/share/zoneinfo 与时区有关的文件

##### /var目录约定
 
###### 必须的目录
/var/cache 缓存目录
/var/lib 程序执行时候的数据文件放置的目录
/var/lock 上锁的目录
/var/log 登陆文件放置的目录
/var/mail 电子邮件信箱的目录， 不过这个目录也被放置到/var/spool/mail
/var/run 放置PID的目录
/var/spool 伫列数据的目录

---
不过鸟哥也总结了，centos 稍做了修改
* /bin --> /usr/bin
* /sbin --> /usr/sbin
* /lib --> /usr/lib
* /lib64 --> /usr/lib64
* /var/lock --> /run/lock
* /var/run --> /run
