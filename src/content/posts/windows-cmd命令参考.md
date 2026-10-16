---
title: 'windows-cmd命令参考'
date: 2019-01-01
category: 'windows'
tags: []
lang: 'zh'
draft: true
---
摘自 [windows常用命令](http://www.cnblogs.com/kekec/p/3662125.html)
[windows CMD命令](https://www.jb51.net/article/141568.htm)
# net命令
> net start
查看已经启动的服务

```
   Adobe Acrobat Update Service
   Adobe Genuine Monitor Service
   Apple Mobile Device
   Application Information
   AVCTP 服务
   Background Intelligent Transfer Service
   Background Tasks Infrastructure Service
   Base Filtering Engine
   Bonjour 服务
   CDPUserSvc_3a30e
   CNG Key Isolation
   COM+ Event System
   Connected User Experiences and Telemetry
   CoreMessaging
   Credential Manager
   Cryptographic Services
   DCOM Server Process Launcher
   Delivery Optimization
   Device Association Service
   DHCP Client
   Diagnostic Policy Service
   Diagnostic Service Host
   Diagnostic System Host
   Distributed Link Tracking Client
   DNS Client
   ESIF Upper Framework Service
   Everything
   Flash Helper Service
   Geolocation Service
   Group Policy Client
   HP CASL Framework Service
   HP Comm Recovery
   HP JumpStart Bridge
   HP Service
   HP Support Solutions Framework Service
   HPWMISVC
   Hyper-V 主机计算服务
   Hyper-V 虚拟机管理
   IKE and AuthIP IPsec Keying Modules
   Intel Bluetooth Service
   Intel(R) Content Protection HDCP Service
   Intel(R) Content Protection HECI Service
   Intel(R) Dynamic Application Loader Host Interface Service
   Intel(R) HD Graphics Control Panel Service
   Intel(R) Rapid Storage Technology
   IP Helper
   IPsec Policy Agent
   Local Session Manager
   Microsoft Office 即点即用服务
   Microsoft Passport
   Microsoft Passport Container
   Network Connected Devices Auto-Setup
   Network Connection Broker
   Network List Service
   Network Location Awareness
   Network Store Interface Service
   NVIDIA Telemetry Container
   OneSyncSvc_3a30e
   PimIndexMaintenanceSvc_3a30e
   Plug and Play
   Power
   Print Spooler
   Program Compatibility Assistant Service
   QPCore Service
   Realtek Audio Service
   Remote Access Connection Manager
   Remote Procedure Call (RPC)
   RPC Endpoint Mapper
   Secure Socket Tunneling Protocol Service
   Security Accounts Manager
   Security Center
   Server
   Shell Hardware Detection
   SQL Server VSS Writer
   SSDP Discovery
   State Repository Service
   Storage Service
   SynTPEnh Caller Service
   System Event Notification Service
   System Events Broker
   System Guard 运行时监视器代理
   Task Scheduler
   TCP/IP NetBIOS Helper
   Telephony
   Themes
   Time Broker
   Touch Keyboard and Handwriting Panel Service
   UnistoreSvc_3a30e
   Update Orchestrator Service
   User Manager
   User Profile Service
   UserDataSvc_3a30e
   VMware Authorization Service
   VMware DHCP Service
   VMware NAT Service
   VMware USB Arbitration Service
   VMware Workstation Server
   Web 帐户管理器
   Windows Audio
   Windows Audio Endpoint Builder
   Windows Connection Manager
   Windows Defender Antivirus Network Inspection Service
   Windows Defender Antivirus Service
   Windows Defender Firewall
   Windows Defender 安全中心服务
   Windows Event Log
   Windows Font Cache Service
   Windows Image Acquisition (WIA)
   Windows Management Instrumentation
   Windows Presentation Foundation Font Cache 3.0.0.0
   Windows Remediation Service
   Windows Update
   Windows 推送通知系统服务
   Windows 许可证管理器服务
   WinHTTP Web Proxy Auto-Discovery Service
   WLAN AutoConfig
   Workstation
   WpnUserService_3a30e
   WWAN AutoConfig
   付款和 NFC/SE 管理器
   功能访问管理器服务
   数据使用量
   无线电管理服务
   蓝牙支持服务
   蓝牙音频网关服务
   连接设备平台服务

```
以上是我电脑上启动的服务。
惭愧， 我是在学习了Linux之后才知道服务的真正含义的， 但是却忽视了赖以生存的windows环境。 只能说不同的系统都有其独特的地方， 好好的钻研吧

> net share
 
查看当前用户下的共享目录

> net user

查看用户

> nslookup

使用系统DNS去解析域名

> netstat -a

查看开启了哪些端口
> netstat -n

查看端口的网络连接情况

> netstat -v

查看正在进行的工作

> tracert ip

查看ip的路由路径

> route 

显示ip路由

> telnet  ip

探测ip是否使用TCP协议监听8000端口

> ftp ip

连接ftp服务器

> arp -a

显示arp缓存列表

> find

文件中搜索字符串

> tasklist

显示进程
