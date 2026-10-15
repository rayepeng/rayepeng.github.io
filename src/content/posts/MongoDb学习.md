---
title: 'MongoDb学习'
date: 2019-08-16
updated: 2019-08-20
category: 'note'
tags:
  - 'MongoDb'
  - 'NoSQL'
lang: 'zh'
draft: false
---
最近接触了一些NoSQL的题目，主要的数据库还是以MongoDb为主，于是总结一下MongoDb的学习

MongoDb中的数据库，集合，文档和传统的关系型数据的对应就不用细说了

*db*显示当前使用的数据库  
*show dbs*显示所有可用的数据库，如果一个数据库里面啥都没有这里就不会显示  
*use xxx*指定使用哪种个数据库，如果不存在会自动创建  
*show tables*显示当前数据库下所有的表(又回到了关系型数据库的概念了23333)

后面的实验都在test数据库下：  

```
> show tables
runoob
users
```

## 插入数据

```
> db.users.insert({'username':'xxx','password':11111}
... )
WriteResult({ "nInserted" : 1 })
```

当前表中的内容：

```
> db.users.find()
{ "_id" : ObjectId("5d53bd7674357af54ea6fb01"), "username" : "prontosil", "password" : "123456" }
{ "_id" : ObjectId("5d53bd8574357af54ea6fb02"), "username" : "abc", "password" : "gaashasfa" }
{ "_id" : ObjectId("5d53bd8a74357af54ea6fb03"), "username" : "abcddd", "password" : "gaasasdfashasfa" }
{ "_id" : ObjectId("5d53beab74357af54ea6fb04"), "username" : "xxxppp" }
{ "_id" : ObjectId("5d53c8ae74357af54ea6fb05"), "username" : "pxy", "password" : 123 }
{ "_id" : ObjectId("5d5642185a9caa8f023df426"), "username" : "admin", "password" : 123 }
{ "_id" : ObjectId("5d564c035a9caa8f023df427"), "username" : "xxx", "password" : 11111 }
```

## MongoDb聚合

> MongoDB中聚合(aggregate)主要用于处理数据(诸如统计平均值,求和等)，并返回计算后的数据结果。有点类似sql语句中的 count(\*)。

参考菜鸟教程中的栗子：  
集合中的数据如下：

```
{
   _id: ObjectId(7df78ad8902c)
   title: 'MongoDB Overview', 
   description: 'MongoDB is no sql database',
   by_user: 'runoob.com',
   url: 'http://www.runoob.com',
   tags: ['mongodb', 'database', 'NoSQL'],
   likes: 100
},
{
   _id: ObjectId(7df78ad8902d)
   title: 'NoSQL Overview', 
   description: 'No sql database is very fast',
   by_user: 'runoob.com',
   url: 'http://www.runoob.com',
   tags: ['mongodb', 'database', 'NoSQL'],
   likes: 10
},
{
   _id: ObjectId(7df78ad8902e)
   title: 'Neo4j Overview', 
   description: 'Neo4j is no sql database',
   by_user: 'Neo4j',
   url: 'http://www.neo4j.com',
   tags: ['neo4j', 'database', 'NoSQL'],
   likes: 750
},
```

使用aggregate语句：

```
> db.mycol.aggregate([{$group : {_id : "$by_user", num_tutorial : {$sum : 1}}}])
{
   "result" : [
      {
         "_id" : "runoob.com",
         "num_tutorial" : 2
      },
      {
         "_id" : "Neo4j",
         "num_tutorial" : 1
      }
   ],
   "ok" : 1
}
>
```

它类似于：

> select by\_user, count(\*) from mycol group by by\_user
