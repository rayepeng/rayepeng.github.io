---
title: 'Linux应急响应'
date: 2020-04-03
updated: 2020-04-05
category: '渗透测试'
tags:
  - 'Linux'
  - '应急响应'
lang: 'zh'
draft: false
---
## 相关命令补充

## 入侵排查思路

### 账号安全

用户信息文件/etc/passwd

```
root:x:0:0:root:/root:/bin/bash
account:password:UID:GID:GECOS:directory:shell
用户名：密码：用户ID：组ID：用户说明：家目录：登陆之后shell
```

注意：无密码只允许本机登陆，远程不允许登陆

`/etc/shadow` 文件

```
root:$6$oGs1PqhL2p3ZetrE$X7o7bzoouHQVSEmSgsYN5UD4.kMHx6qgbTqwNVC5oOAouXvcjQSt.Ft7ql1WpkopY0UV9ajBwUt1DpYxTCVvI/:16809:0:99999:7:::
用户名：加密密码：密码最后一次修改日期：两次密码的修改时间间隔：密码有效期：密码修改到期到的警告天数：密码过期之后的宽限天数：账号失效时间：保留
```

相关命令

```
who   查看当前登录用户（tty本地登陆 pts远程登录）
w    查看系统信息，想知道某一时刻用户的行为
uptime 查看登陆多久、多少用户，负载
```

查找特权用户(UID=0)

```
awk -F: '$3==0{print $1}' /etc/passwd
```

查找可以远程登陆的账号信息

```
$ sudo awk '/\$1|\$6/{print $1}' /etc/shadow
root:$6$ogEENApZAzc/p2XN$TQ.P2pRw7IwUuYPMXymUH2fbGNrNqJutxiao3xAJpCSYlhjNCL1BYByO1W75i4I6ri1GWGu61VMqexIXw5s0l.:18298:0:99999:7:::
pxy:$6$7LQL0eO/Dk93UKqU$U9fSZEej9Dx1/InOImWFsfRdtWW2dJHzWYhnBRJj79.NLVQ9og.5E0jAo7eYB.vmwR9PuYjND.e4yBWwhqVvq.:18253:0:99999:7:::
```

除root帐号外，其他帐号是否存在sudo权限。如非管理需要，普通帐号应删除sudo权限

```
sudo more /etc/sudoers | grep -v "^#\|^$" | grep "ALL=(ALL)"
```

禁用或者删除可疑的账号

```
usermod -L user  禁用帐号，帐号无法登录，/etc/shadow第二栏为!开头
userdel user    删除user用户
userdel -r user  将删除user用户，并且将/home目录下的user目录一并删除
```

### 历史命令

-   `history` 查看历史命令
    
-   打开/home各帐号目录下的.bash\_history，查看普通帐号的历史命令
    

保存一万条命令

```
sed -i 's/^HISTSIZE=1000/HISTSIZE=10000/g' /etc/profile
```

增加ip信息

```bash
######jiagu history xianshi#########
USER_IP=`who -u am i 2>/dev/null | awk '{print $NF}' | sed -e 's/[()]//g'`
if [ "$USER_IP" = "" ]
then
USER_IP=`hostname`
fi
export HISTTIMEFORMAT="%F %T $USER_IP `whoami` "
shopt -s histappend
export PROMPT_COMMAND="history -a"
######### jiagu history xianshi ##########
```

`source /etc/profile` 让配置生效
