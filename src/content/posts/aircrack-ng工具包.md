---
title: 'aircrack-ng工具包'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
## 破解wifi过程中用到的命令

### 查看当前系统中的无线网络接口
`airmon-ng`

### 激活无线网络到监听模式
`airmon-ng start wlan0`

### 杀死无关的进程
`airmon-ng check kill PID`

### 测试是否可以注入

`aireplay-ng --test wlan0mon`

### 定位附近的无线网络
`airodump-ng wlan0mon `

#### 捕获到的网络的参数详解

* BSSID ： 无限的IP地址
* PWR： 网卡报告的信号水平
* Beacons： 无线发出的通告编号
* \#Data: 被捕获到的数据分组的数量, 包括广播分组
* \#/s 过去10秒钟内每秒捕获到的数据分组的数量
* CH： 信道号
* MB：无线所支持的最大速率。如果MB=11，它是802.11b；如果MB=22，它是 802.11b+；如果更高就是802.11g。后面的点（高于54之后）表明支持短前导 码。 
* ENC：使用的加密算法体系。OPN表示无加密。WEP？表示WEP或者 WPA/WPA2模式，WEP（没有问号）表示静态或动态WEP。如果出现TKIP或 CCMP，那么就是WPA/WPA2。 
* CIPHER：检测到的加密算法，是CCMP、WRAAP、TKIP、WEP和WEP104 中的一个。典型的来说（不一定），TKIP与WPA结合使用，CCMP与WPA2结 合使用。如果密钥索引值大于0，显示为WEP40。标准情况下，索引0-3是 40bit，104bit应该是0。 
* AUTH：使用的认证协议。常用的有MGT（WPA/WPA2使用独立的认证服务 器，平时我们常说的802.1x、radius和eap等）、SKA（WEP的共享密钥）、 PSK（WPA/WPA2的预共享密钥）或者OPN（WEP开放式）。 
* ESSID：指所谓的SSID号。如果启用隐藏的SSID的话，它可以为空。这种情况下，airodump-ng试图从proberesponses和associationrequests中获取 SSID。 
* STATION：客户端的MAC地址，包括连上的和想要搜索无线来连接的客户 端。如果客户端没有连接上，就在BSSID下显示“notassociated”。 Rate：表示传输率。 
* Rate：表示传输率。
* Lost：在过去10秒钟内丢失的数据分组，基于序列号检测。它意味着从客户端 来的数据丢包，每个非管理帧中都有一个序列号字段，把刚接收到的那个帧中 的序列号和前一个帧中的序列号一减就能知道丢了几个包。 
* Frames：客户端发送的数据分组数量。 
* Probe：被客户端查探的ESSID。如果客户端正试图连接一个无线，但是没有 连接上，那么就显示在这里。 

### airodump-ng 命令

常用的选项

-c 指定选择的频道
-w 指定一个文件名
-bssid 指定攻击的BSSID

--beacons  记录所有的信号

![指定网络进行抓包](https://upload-images.jianshu.io/upload_images/10651191-e7cb757e1a862f76.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### aireplay-ng 命令
aireplay-ng是一个注入帧的工具。它的主要作用是产生数据流量，而这些随后将会被用于[aircrack-ng](https://www.baidu.com/s?wd=aircrack-ng&tn=24004469_oem_dg&rsv_dl=gh_pl_sl_csd)破解WEP和WPA/WPA2秘钥。aireplay-ng里包含了很多种不同的攻击方式用来获取WPA握手包。如：解除认证攻击（-0）、伪造认证攻击（-1）、交互式数据包重放攻击（-2）、手动ARP请求注入攻击（-3）、ARP请求重放注入攻击（-4）。

#### 攻击类型
* Attack 0：解除认证攻击
* Attack 1：伪造认证攻击
* Attack 2：交互式注入攻击
* Attack 3：ARP请求包重放攻击
* Attack 4：chopchop Korek攻击
* Attack 5：碎片交错攻击
* Attack 6：Cafe-latte 攻击
* Attack 7：面向客户的碎片攻击
* Attack 8：WPA迁移模式
* Attack 9：数据包注入测试

#### 过滤选项

* -b bssid ：接入点的MAC地址
* -d dmac：目的MAC地址
* -s smac：源MAC地址
* -m len：数据包最小长度
* -n len：数据包最大长度
* -u type：含有关键词的控制帧
* -v subt：含有表单数据的控制帧
* -t tods：到目的地址的控制帧
* -f fromds：从目的地址出发的控制帧
* -w iswep：含有WEP数据的控制帧
* -D 禁止 AP检测

#### 重放选项

* -x nbpps: 每秒钟发送的数据包
* -p fctrl: 
* -a bssid: 设定AP的MAC地址
* -c dmac: 设定目标的MAC地址
* -h smac: 设定源的MAC地址
* -g value: 
* -F: 选择最先匹配的数据包
