---
title: 'Linux网络配置知识整理'
date: 2019-01-01
category: 'IOT'
tags: []
lang: 'zh'
draft: true
---
## Linux添加虚拟网卡三种方法

可以使用`ifconfig`命令：
```
ifconfig eth0:0 192.168.1.10 netmask 255.255.255.0 up
```
删除虚拟网卡
```
ifconfig eth0:0 down
```

或者修改网卡配置文件
```
cat /etc/network/interfaces
auto eth0
iface eth0 inet dhcp
auto eth0:1
iface eth0:1 inet static
        address 192.168.11.1
        netmask 255.255.255.0
        gateway 192.168.11.1
auto eth0:2
iface eth0:2 inet static
        address 192.168.12.1
        netmask 255.255.255.0
        gateway 192.168.12.1
```
事实上是我在WSL中做实验：
![](https://upload-images.jianshu.io/upload_images/10651191-8ccf771a0d0d7164.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看来是可以的

## Linux原始网络配置文件解读

```
/home/oit [oit@ubuntu] [19:35]
> cat /etc/network/interfaces
# interfaces(5) file used by ifup(8) and ifdown(8)
auto lo
iface lo inet loopback
auto eth0
iface eth0 inet dhcp
```

从这个文件中可以明白，我们让`lo`网卡自动配置，并且配置为`loopback`
`eth0`网卡也是自动配置，并且获取的ip的方式为`dhcp`

这是另一种配置
```
interfaces(5) file used by ifup(8) and ifdown(8)
auto lo
iface lo inet loopback
auto eth0
iface eth0 inet manual
up ifconfig eth0 0.0.0.0 up
auto br0
iface br0 inet dhcp
bridge_ports eth0
bridge_stp off
bridge_maxwait 1
```
我们修改了`eth0`网卡为手动
同时分配的ip为`0.0.0.0`
之后再设置一块`br0`网卡，获取ip方式为`dhcp`
并且桥接了`eth0`

可以通过`sudo /etc/init.d/networking restart`重启使得网络生效
但是我并不能这样，所以只能通过重启虚拟机实现

重启之后就会发现多了一块`br0`网卡，这就所谓的桥接网卡

然后我们到已经下载好了MIPS虚拟机的目录下

```
/home/oit/Downloads/MIPSVmware [oit@ubuntu] [20:15]
> ls
debian_squeeze_mips_standard.qcow2  vmlinux-2.6.32-5-4kc-malta

/home/oit/Downloads/MIPSVmware [oit@ubuntu] [20:15]
> qemu-system-mips -M malta -kernel vmlinux-2.6.32-5-4kc-malta -hda debian_squeeze_mips_standard.qcow2 -append "root=/dev/sda1 console=tty0" -net nic -net tap
qemu-system-mips: -net tap: could not configure /dev/net/tun: Operation not permitted
qemu-system-mips: -net tap: Device 'tap' could not be initialized

/home/oit/Downloads/MIPSVmware [oit@ubuntu] [20:15]
> sudo qemu-system-mips -M malta -kernel vmlinux-2.6.32-5-4kc-malta -hda debian_squeeze_mips_standard.qcow2 -append "root=/dev/sda1 console=tty0" -net nic -net tap
[sudo] password for oit: 
```
在原有的选项之后，我还加上了`-net nic -net tap`
所以启动之后就又多了一块网卡

![](https://upload-images.jianshu.io/upload_images/10651191-2757663453cb872d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

启动MIPS虚拟机之后我发现MIPS虚拟机的网卡只有lo
修改一下配置文件将`eth1`改为`eth0`
然后`ifup eth0`

![](https://upload-images.jianshu.io/upload_images/10651191-d9f6aa6ba1c97c3b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这时候就可以通过ping 通外网和主机了
![](https://upload-images.jianshu.io/upload_images/10651191-e2f89b5a57b7c695.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

同理也可以运行arm虚拟机

命令 `sudo qemu-system-arm -M versatilepb -kernel vmlinuz-2.6.32-5-versatile -initrd initrd.img-2.6.32-5-versatile -hda debian_squeeze_armel_standard.qcow2 -append "root=/dev/sda1" -net nic -net tap
`
![](https://upload-images.jianshu.io/upload_images/10651191-9ea4ac93b42f0506.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 参考

[qemu网络配置](https://blog.csdn.net/qq1084283172/article/details/69652258)
