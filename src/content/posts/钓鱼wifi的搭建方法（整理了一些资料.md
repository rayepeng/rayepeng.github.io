---
title: '钓鱼wifi的搭建方法（整理了一些资料'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
## 查看自己的网关

`ip route show`

## 一些步骤解惑

### 安装dhcp服务

`  apt-get install isc-dhcp-server –y `

### 配置dhcp服务

> kali系统中DHCP服务的默认主配置文件为/etc/dhcp/dhcpd.conf
为了方便还原，尽量先备份文件之后再修改

#### 配置的方式就百花齐放了。。

##### 第一种
```
default-lease-time 600;                                  #DHCP租约时间
 
max-lease-time 7200;                                 #DHCP最大租约时间
 
subnet 192.168.0.0 netmask 255.255.255.0 {          #DHCP服务用于分配地址的网段
 
     range    192.168.0.10 192.168.0.20;                                   #地址池
 
     option    subnet-mask 255.255.255.0;                               #子网掩码
 
     option    routers 192.168.0.1;                                           #默认网关
 
     option    broadcast-address 192.168.0.255;                    #广播地址
 
     option    domain-name-servers 192.168.0.1;               #DNS服务器的地址
 
}
```

##### 第二种

```
authoritative;

default-lease-time 700;
max-lease-time 8000;

subnet 10.0.0.0 netmask 255.255.255.0 {
option routers 10.0.0.1;
option subnet-mask 255.255.255.0;

option domain-name-servers 10.0.0.1;

range 10.0.0.10 10.0.0.100;

}
```

##### 第三种

```
option domain-name "hanxiao";
option routers 10.0.0.1; #默认网关
subnet 10.0.0.0 netmask 255.255.255.0 
{
    range 10.0.0.100 10.0.0.200; #地址池 
    option domain-name-servers 10.0.0.1; #默认DNS
    option broadcast-address 10.0.0.255; #广播地址    
}
default-lease-time 6000;
max-lease-time 72000; 
```

### 需要不需要设置静态IP地址？

有说要的， 有说不要的。

### 对于无线网卡的配置

```
airmon-ng start wlan0

airbase-ng -e Fishing -c 11 mon0

ifconfig at0 up
ifconfig at0 10.0.0.1 netmask 255.255.255.0
route add -net 10.0.0.0 netmask 255.255.255.0 gw 10.0.0.1
```

打开IP转发

> echo 1 > /proc/sys/net/ipv4/ip_forward

### 开启DHCP服务

第一种
```
dhcpd -cf /etc/dhcp/dhcpd.conf -pf /var/run/dhcpd.pid at0
service isc-dhcp-server start
```

第二种

```
ifconfig at0 up
ifconfig at0 10.0.0.1 netmask 255.255.255.0
ifconfig at0 mtu 1500
route add -net 10.0.0.0 netmask 255.255.255.0 gw 10.0.0.1
/etc/init.d/dhcp3-server restart
/etc/init.d/dhcp3-server start

```

### 针对防火墙进行配置

```
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
 #对eth0进行源nat
iptables -A FORWARD -i wlan1 -o eth0 -j ACCEPT
 #把无线网卡流量转发到有线网卡（或者什么能上网的网卡）上面
iptables -A FORWARD -p tcp --syn -s 10.0.0.0/24 -j TCPMSS --set-mss 1356
 #修改最大报文段长度

```

## 开始搭建

修改dhcpd.conf文件
![dhcpd.conf](https://upload-images.jianshu.io/upload_images/10651191-0a3a502ae98bfc86.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 参考资料

[利用kali进行wifi钓鱼](https://www.freebuf.com/articles/wireless/69840.html)
[重写Linux网卡设置静态IP](https://blog.csdn.net/hu_belif/article/details/82318539)
[修改静态IP报错](https://blog.csdn.net/hu_belif/article/details/82319485)
[kali Linux搭建钓鱼wifi](https://blog.csdn.net/qq_33936481/article/details/51295233)
