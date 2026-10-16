---
title: 'spring-boot-基础知识整理'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
## 0x01 常见注解

`@RestController`

可以实现 Restfule 风格的API，返回的数据是json，原来如果要返回json的话需要使用 `@ResponseBody` 配合 `@Controller` 

如果 直接使用 @Controller需要渲染模板

`@Entity`
定义实体

`@Id`和 `@GeneratedValue` 一般配合指定数据库增长的主键

`@RequestMapping` 配置URL映射

`@PathVariable` 获取URL中的数据

`@RequestParam` 获取请求参数的值

`@Autowired` 依赖注入

## 使用spring-boot 简单地实现一个用户注册和查询用户的接口

首先建立User的实体

```java
package com.pxy.lyb;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

/**
 * @description: 用户实体
 * @author: Pxy
 * @create: 2020-02-17 10:55
 **/
@Entity
public class User {

    @Id
    @GeneratedValue
    private Integer id; //id需要Id注解和一个自增长的注解

    private String username;

    private String password;

    public User() {
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}

```

然后编写Dao层，这里我们只需要简单地继承一下即可

```java
package com.pxy.lyb;

import org.springframework.data.jpa.repository.JpaRepository;
/**
 * @description: 用户仓储
 * @author: Pxy
 * @create: 2020-02-17 10:57
 **/
public interface UserRepository extends JpaRepository<User, Integer> {
    User findByUsernameAndPassword(String username, String password);
}
```
然后我们就可以编写我们的restful API了

```java
package com.pxy.lyb;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController{

    @Autowired
    public UserRepository userRepository;
    /**
     * 注册用户
     *
     * @return boolean 是否注册成功
     */
    @PostMapping("/rigister")
    public void register(@RequestParam(value = "username", required = true) String username, @RequestParam(value =
            "password", required = true) String password) {
        User user = new User();
        user.setPassword(password);
        user.setUsername(username);
        userRepository.save(user);
    }

    @GetMapping("/list")
    public String listAllUser() {
        return userRepository.findAll().toString();
    }
}
```

可以看到整个的流程还是比较简单的，通过 `userRepository` 可以很方便地对数据库进行操作
