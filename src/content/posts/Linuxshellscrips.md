---
title: 'Linuxshellscrips'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
#### echo命令

##### echo嵌入变量
> echo "Hello $LOGNAME, Have a nice day !"

echo 使用一对双引号， 同时会把对应的变量，转化为对应的值

##### echo嵌入命令
> echo "Your are working in directory \`pwd`."

使用一对 \` ` 在echo中嵌入命令

> echo "You are working on a machine called \`uname -n`."

uname -n 
-n, --nodename : print the network node hostname

##### 显示时间
>  echo "Bye for now $LOGNAME. The time is `date +%T`!"

date输出的结果
> Mon Feb  4 09:08:50 DST 2019
date +%T
使用 %H:%M:%S来显示时间

##### echo， 单引号， 变量

> planet="Earth"
echo \$planet
\# Earth
echo '\$planet'
\# \$planet
echo "\$planet"
\#Earth

echo也可以不加单引号在屏幕上打印出 $planet
> echo \$planet

可以理解成单引号会里面的所有字符都会原样的打印出来， 而双引号中的变量会被对应的值取代， 不加引号和加了双引号的效果是一样的。不过同样的在双引号和不加双引号都可以用转义符。

##### echo与 read交互
> echo Enter some text
read planet
echo \'\$planet\' now equals \$planet
exit 0

#### 环境变量
先来看一个恶作剧脚本
```
export TZ=America/Los_Angeles
echo "Your Timezone is = $TZ"
date
export TZ=Asia/Tokyo
echo "Your Timezone is = $TZ"
date
unset TZ
echo "Your Timezone is = $(cat /etc/timezone)"
# For Redhat or Fedora /etc/localtime
date
```
TZ即是TimeZone， 在双引号下 $TZ 会被对应的值取代。在设置好TZ之后显示的date会随着变化。

最好玩的是这句：
> echo "Your Timezone is = \$(cat /etc/timezone)"

等价于
> echo "Your Timezone is = \`cat /etc/timezone\`"

#### 数组

```
#!/bin/bash
FRUIT[0]="Pears"
FRUIT[1]="Apple"
FRUIT[2]="Mango"
FRUIT[3]="Banana"
FRUIT[4]="Papaya"
echo "First Index: ${FRUIT[0]}"
echo "Second Index: ${FRUIT[1]}"
```
先设置一系列的数组的值，通过在echo使用 `${}` 
如果我们这样做
> echo "First Index: $FRUIT[0] "

打印出来的结果为：
> First Index: Pears[0]

所以我们必须用一个大括号

如果要一次性打印出数组内所有的内容：
```
echo "Method One : ${FRUIT[*]}"
echo "Method Two : ${FRUIT[@]}"
```
