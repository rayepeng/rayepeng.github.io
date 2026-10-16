---
title: 'FourAndSix靶机渗透'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
> 有点小白， 专业是网络安全， 但是目前刚刚接触， 心里诚惶诚恐， 想学， 但是害怕失败， 聊寄于写博客来不断地提升自己好了。

# FourAndSix靶机
这个是通过百度云找到的。

之后通过Vmware 导入 OVA文件。
![启动靶机](https://upload-images.jianshu.io/upload_images/10651191-8580ec4551723047.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到网络地址的范围是 192.168.41.132到 192.168.41.254

# nmap
这个扫描界的神奇， 然而我还是用的不熟练

## nmap 参数

-F 扫描100个最有可能开放的端口
-v 获取扫描到的信息
-sT 采用TCP扫描
-p 指定端口
-sV 版本检测
-Pn 将所有主机都默认为在线，跳过主机发现
-n 不做DNS解析
-R 总是做DNS反向解析
--dns-servers指定自定义的DNS服务器
--system-dns 使用操作系统的DNS
--traceroute 追踪每台主机的跳转路径

# nmap 扫描
由于不熟悉nmap， 各种命令都试一下

最简单的命令：
> nmap 192.168.41.132

```
PS C:\WINDOWS\system32> nmap 192.168.41.132
Starting Nmap 7.70 ( https://nmap.org ) at 2019-02-08 15:56 ?D1ú±ê×?ê±??
Nmap scan report for bogon (192.168.41.132)
Host is up (0.0000050s latency).
Not shown: 997 closed ports
PORT     STATE SERVICE
22/tcp   open  ssh
111/tcp  open  rpcbind
2049/tcp open  nfs
MAC Address: 00:0C:29:81:23:53 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 22.66 seconds

```
> 加入-v 和 -F选项， 速度加快了
```
PS C:\WINDOWS\system32> nmap -v -F 192.168.41.132
Starting Nmap 7.70 ( https://nmap.org ) at 2019-02-08 15:59 ?D1ú±ê×?ê±??
Initiating ARP Ping Scan at 15:59
Scanning 192.168.41.132 [1 port]
Completed ARP Ping Scan at 15:59, 1.33s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 15:59
Completed Parallel DNS resolution of 1 host. at 15:59, 0.01s elapsed
Initiating SYN Stealth Scan at 15:59
Scanning bogon (192.168.41.132) [100 ports]
Discovered open port 22/tcp on 192.168.41.132
Discovered open port 111/tcp on 192.168.41.132
Discovered open port 2049/tcp on 192.168.41.132
Completed SYN Stealth Scan at 15:59, 0.01s elapsed (100 total ports)
Nmap scan report for bogon (192.168.41.132)
Host is up (0.0010s latency).
Not shown: 97 closed ports
PORT     STATE SERVICE
22/tcp   open  ssh
111/tcp  open  rpcbind
2049/tcp open  nfs
MAC Address: 00:0C:29:81:23:53 (VMware)

Read data files from: E:\ProgramFiles\Nmap
Nmap done: 1 IP address (1 host up) scanned in 8.07 seconds
           Raw packets sent: 101 (4.428KB) | Rcvd: 101 (4.040KB)
```
> 指定一个ip地址范围进行扫描
```
PS C:\WINDOWS\system32> nmap -v -F 192.168.41.132-254
Starting Nmap 7.70 ( https://nmap.org ) at 2019-02-08 16:01 ?D1ú±ê×?ê±??
Initiating ARP Ping Scan at 16:01
Scanning 123 hosts [1 port/host]
Completed ARP Ping Scan at 16:01, 6.19s elapsed (123 total hosts)
Initiating Parallel DNS resolution of 123 hosts. at 16:01
Completed Parallel DNS resolution of 123 hosts. at 16:01, 0.01s elapsed
Nmap scan report for 192.168.41.133 [host down]
Nmap scan report for 192.168.41.134 [host down]
Nmap scan report for 192.168.41.135 [host down]
Nmap scan report for 192.168.41.136 [host down]
...
Nmap scan report for 192.168.41.156 [host down]
Nmap scan report for 192.168.41.157 [host down]
Nmap scan report for 192.168.41.251 [host down]
Nmap scan report for 192.168.41.252 [host down]
Nmap scan report for 192.168.41.253 [host down]
Initiating SYN Stealth Scan at 16:01
Scanning 2 hosts [100 ports/host]
Discovered open port 22/tcp on 192.168.41.132
Discovered open port 111/tcp on 192.168.41.132
Discovered open port 2049/tcp on 192.168.41.132
Completed SYN Stealth Scan against 192.168.41.132 in 1.14s (1 host left)
Completed SYN Stealth Scan at 16:01, 2.13s elapsed (200 total ports)
Nmap scan report for bogon (192.168.41.132)
Host is up (0.00087s latency).
Not shown: 97 closed ports
PORT     STATE SERVICE
22/tcp   open  ssh
111/tcp  open  rpcbind
2049/tcp open  nfs
MAC Address: 00:0C:29:81:23:53 (VMware)

Nmap scan report for bogon (192.168.41.254)
Host is up (0.00s latency).
All 100 scanned ports on bogon (192.168.41.254) are filtered
MAC Address: 00:50:56:F7:B4:93 (VMware)

Read data files from: E:\ProgramFiles\Nmap
Nmap done: 123 IP addresses (2 hosts up) scanned in 15.43 seconds
           Raw packets sent: 561 (20.780KB) | Rcvd: 132 (5.268KB)
```

# NFS服务
22端口开放了ssh服务，
111端口开放了 rpcbind服务
2049端口开放了 nfs服务

NFS就是网络文件系统
可以简单地看作一个文件服务器
重点是：
NFS的功能比较丰富， 但是端口不固定
所以需要远程过程调用RPC。 
客户机通过RPC服务去连接对应的NFS服务
所以在启动NFS之前， RPC服务要在这之前先启动。

探测nfs可以挂载的脚本

> nmap -sV --script=nfs-showmount 192.168.41.132

```
PS C:\WINDOWS\system32> nmap -sV --script=nfs-showmount 192.168.41.132
Starting Nmap 7.70 ( https://nmap.org ) at 2019-02-08 16:11 ?D1ú±ê×?ê±??
Nmap scan report for bogon (192.168.41.132)
Host is up (0.0000040s latency).
Not shown: 997 closed ports
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.9 (protocol 2.0)
111/tcp  open  rpcbind 2 (RPC #100000)
| nfs-showmount:
|_  /home/user/storage
| rpcinfo:
|   program version   port/proto  service
|   100000  2            111/tcp  rpcbind
|   100000  2            111/udp  rpcbind
|   100003  2,3         2049/tcp  nfs
|   100003  2,3         2049/udp  nfs
|   100005  1,3          606/tcp  mountd
|_  100005  1,3          812/udp  mountd
2049/tcp open  nfs     2-3 (RPC #100003)
MAC Address: 00:0C:29:81:23:53 (VMware)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 28.26 seconds

```
这里使用了脚本参数 --script=nfs-showmount
  ![nfs-showmount](https://upload-images.jianshu.io/upload_images/10651191-1707e2f5064cdf90.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们发现了一个可供挂载的目录： /home/usr/storage
接下来的想法就是要挂载到那个目录下，然后看看有没有什么文件可供利用的

---
后面的内容暂时有点无法继续， 鸽一会儿

# 参考资料
[nmap所有参数](https://blog.csdn.net/qq_26090065/article/details/80285088)
[nmap命令的实用29个例子](https://www.cnblogs.com/hongfei/p/3801357.html)
[FourAndSix2渗透实战](https://www.jianshu.com/p/7ce17c5dcea3)
[Linux下NFS服务器搭建](https://www.cnblogs.com/liuyisai/p/5992511.html)
[渗透测试之Jarbas和FourandSix靶机实战](https://xz.aliyun.com/t/3092)
