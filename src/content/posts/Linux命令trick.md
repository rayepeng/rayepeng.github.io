---
title: 'Linux命令trick'
date: 2020-02-07
category: '编程'
tags:
  - 'Linux'
lang: 'zh'
draft: false
---
## 常用的命令组合

**统计字符串长度**

```bash
$ echo -n 12345 | wc -c
5
```

## 搜索文件后门

```bash
# 简单的查找后门
find . -name '*.php' | xargs grep -n 'eval('
find . -name '*.php' | xargs grep -n 'assert('
find . -name '*.php' | xargs grep -n 'system('
```

## 数据库备份 mysqldump用法

```bash
mysqldump -u db_user -p db_passwd db_name > bak.sql//备份指定数据库
mysqldump --all-databases > bak.sql //备份所有数据库

mysql -u db_user -p db_passwd db_name < bak.sql //还原指定数据库
//也可以登录到mysql之后再 source xxx.sql
```

## mysql 修改密码

```
mysql> set password for root@localhost = password('root');
Query OK, 0 rows affected, 1 warning (0.00 sec)
```

但是这条命令似乎不行

```
update user set password=PASSWORD('NEW PASSWORD') where user='root';
```
