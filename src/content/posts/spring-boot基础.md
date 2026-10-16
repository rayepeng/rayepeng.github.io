---
title: 'spring-boot基础'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
在[spring initializer](https://start.spring.io/)可以选择新建一个spring boot应用然后打包下载

之后使用IDEA导入

参考imooc实现一个很简单的spring boot应用

说一下自己的理解吧

## 创建模型User

新建一个用户模型，拥有id和name两个属性同时通过IDEA快捷方式生成了set和get还有toString方法
```
package com.imooc.firsetappdemo.domain;

/**
 * 用户模型
 */
public class User {
    private int id;
    //用户名称
    private  String name;

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    /**
     * 强烈建议实现一些toString方法
     * @return
     */
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
```

## 创建用户仓库进行存储
此处我们采用内存模型进行存储

使用了一个`ConcurrentMap`来保存用户

```
package com.imooc.firsetappdemo.repository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicInteger;

import com.imooc.firsetappdemo.domain.User;
/**
 * {@link User}{@link org.springframework.stereotype.Repository}
 */

@Repository
public class UserRepository {

    /**
     * 通过内存进行存储
     */
    private final ConcurrentMap<Integer, User>  repository =
            new ConcurrentHashMap<>();

    private final static AtomicInteger idGenerator = new AtomicInteger();

    /**
     * 保存用户对象
     * @param user
     * @return 如果保存成功<code>true</code>
     * 否则<code>false</code>
     */
    public boolean save(User user){
        //id自增
        Integer id = idGenerator.incrementAndGet(); //id从1开始
        user.setId(id);
        return repository.put(id,user)==null;
    }
}
```

## 编写控制器
在控制器中我们注入`UserRepository`这个类

同时进行了路由映射
`@PostMapping("/person/save")`

```
package com.imooc.firsetappdemo.controller;

import com.imooc.firsetappdemo.domain.User;
import com.imooc.firsetappdemo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {
    /**
     * 注入
     */
    private final UserRepository userRepository;

    @Autowired

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/person/save")
    public User save(String name){
        User user = new User();
        user.setName(name);
        if (userRepository.save(user)) {
            System.out.printf("用户对象保存成功:%s\n", user);
        }

        return user;
    }
}
```

## 如何理解依赖注入

之前学习`thinkphp`的时候就一直不明白依赖注入的原理

现在回过头来看`spring`感觉有了一点眉目

>  平常的Java开发中，程序员在某个类中需要依赖其它类的方法。
    通常是new一个依赖类再调用类实例的方法，这种开发存在的问题是new的类实例不好统一管理。
    Spring提出了依赖注入的思想，即依赖类不由程序员实例化，而是通过Spring容器帮我们new指定实例并且将实例注入到需要该对象的类中。
    依赖注入的另一种说法是"控制反转"。通俗的理解是：平常我们new一个实例，这个实例的控制权是我们程序员。
而控制反转是指new实例工作不由我们程序员来做而是交给Spring容器来做。

## 参考
[spring依赖注入方式详解](https://www.cnblogs.com/java-class/p/4727775.html)
