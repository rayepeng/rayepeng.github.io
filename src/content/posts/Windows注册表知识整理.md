---
title: 'Windows注册表知识整理'
date: 2019-01-01
category: 'windows'
tags: []
lang: 'zh'
draft: true
---
在以前的DOS和Windows 3x时代， 没有注册表这个概念

在Windows 95出现之后， 引入了Windows NT 注册表的概念

注册表的特点：
1. 注册表采用了二进制形式的数据
2. 注册表支持子健
3. 注册表中的键值项可以包含代码
4. 注册表可以被远程访问

根键
**HKEY_CLASS_ROOT** 管理文件系统
**HKEY_CURRENT_ USER** 管理系统当前用户信息
**HKEY_LOCAL_MACHINNE** 管理当前系统的硬件配置
**HKEY_USERS** 管理系统的用户信息
**HKEY_CURRENT_CONFIG** 管理当前用户的系统配置
**HKEY_DYN_DATA** 管理系统运行数据
