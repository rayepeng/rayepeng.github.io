---
title: 'sqlite数据库笔记'
date: 2020-04-20
updated: 2020-04-24
category: '编程'
tags:
  - 'sqlit'
  - '数据库'
lang: 'zh'
draft: false
---
## 基本操作

`.quit` 退出

`.tables` 列出所有的表

`.schema` 查看构建表的sql语句

`.database` 查看数据库

## 创建数据库

只需要 `sqlite` 加上数据库名即可

## 创建表

```
CREATE TABLE user(
ID INT NOT NULL PRIMARY KEY,
name TEXT ,
age TEXT,
password TEXT);
```

**sqlite不支持修改表已经存在的字段**，只能把原有的表重命名一下再创建一个

```
alter table user rename to `user_123`;
```

如果主键要求自动递增

```sql
CREATE TABLE user(
ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
name TEXT,
password TEXT
);
```

## 插入数据

```
insert into user(name,password) values("pxy", '123456');
```

## 查询数据

```sql
sqlite> select * from user;
1|pxy|123456
```
