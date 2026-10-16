---
title: 'frida-hook工具使用'
date: 2019-01-01
category: 'PHP'
tags: []
lang: 'zh'
draft: true
---
## frida基础

1. 下载好对应的 frida server，这个在官方的GitHub release页面去找，注意如果用电脑模拟器（如夜神模拟器，则对应架构位x86）
2. adb连接模拟器，push 第一步下载好的server到目录 /data/local/tmp (一般是这个目录），chmod a+x后启动
3. pip install frida frida-tools
4. 输入 frida-ps -U 可以看到手机的进程列表，此时就配置成功了

## 编写、运行hook 脚本

```bash
frida -U -l exploit.js -f com.xxx.yyy
```

如果要一个string

```jsx
var x = Java.use("java.lang.String").$new("xxxxxxxx")
```

如果要用到某个类的某个方法

```jsx
Java.use("com.xxx.yyy").method(param1, param2)
```

整个过程其实有点像java的反射

如果要hook某个方法

```jsx
Java.perform(function() {
	var class = Java.use("com.xxx.yyy")
	classs.方法名.implementation = function(param1, param2){
      send();
			return this.xxxx			
	}
})
```

## 示例

### hook rsa加密

一次比赛中，有一个关卡是破解apk，jadx获得源码发现是一个RSA加密，这里有个坑搞了半天

> 安卓的RSA和java包中的实现不一样，需要手动下载一个 BouncyCastleProvider.jar 包，引入项目后修改代码即可运行
> 

其实最简单的方案就是用frida进行hook

实现的代码如下:

```python
function main(){
    Java.perform(function(){
        var enc = Java.use("java.lang.String").$new("F3RSCi59ewpMm+dIGtiAn752tBQ0TPx7tCayrCXrrwyG2gtlUJ3C82rcrfgg2A4X7XfhXWGidsJgGDzbD9JwvzGbKMHTK5kxJUf1EJ605R/Rv2N+6Jtr54wQAKbqGyU8g/rUhLUf/EgNqPPYTQ6fa4LqFEMTrPm/UZMvL/4yTNhFoM5vQbceQeD9QNATh6kdYEzLfRdWbv/ESllURlgZbQsc7+pHC8Sg9wVh/2MGZHKzZI8a67Usqhk8ojmfgN5ABodQ2z1DOCICg7AH+l+3fx6eOn1dup/Q1hpCHVCgtojMOPfoLcxICY5LkSonrFjAKzv4JHO/f5ihFXX8Dr4MFw=="); // new一个string
        var PrivateKey = Java.use("java.lang.String").$new("MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDcscawF6Fy4Smk\nqwOy2W/IcewNTYzHe9ZFV6w1dqrZ+sRBRD6Sapv7k4deLF9ziYsWXfcDNuvG2HN6\nAgk6CeN5QHUj7OiJmTnitHAQFIw7Ed6O3uyE64i3dhZIKh7oAies6EMpfKusXIZ6\nt1lFwVVpPjlrW6435j/nW5X0OeaRRk89zOxIbzAhS0yxArkMSecy9lr+UwzWQhFO\nW4+O/ywesds9VdCuycx2S/1zbG7BwJP507nTxstLkUnet0BHqXH3tH8cRXXDyFo1\n13gBgrBZ7Y79Z7T39B+21qq7RxfwvPDqu6Rq3p9cOUQCwfJSWlHYBVtYOME04vZP\nkZj/PqLhAgMBAAECggEBAL9QLRkBoydfISZqSW6FJ23vs91kWKGlLH44HkTKdhk4\nVWDus/9hA472uOZeOPCDT1s4YaUbuxBJGvGtSipR4CuAQQu/l2WQuqlYGb0W0ulx\n+CiJ/ybKt12ytGYifWBKXfJ59Z7FQFzOaJWA05awnkX5dvUmKMS0iLkan8dzWfic\nCn379Jn/bLmRXSTKgWNMi9toT4kNhnr2/cf1ah1i2MHHZb4ZMdC9rqnSvyzFRAFM\nuess0Qg8ckyoNzx2daP9vXapn8rg6B/MFBZqjorwyv0KJms/S6W/YKw88OixM/J3\nxlBsk8QHJqaL5IZW6/QeIHJk4K6o9+3fTxtHEjcWoAECgYEA8ASApzgATrHUFVdT\nZ6ZohLFMyQQZzaKLtZhBRfenASrWQSpHHcGdF15C45fik/vohZvF/byrHLkwvosp\nvC6BHyF7toJDrTEWBo/xymGNYmovr0keMUc3T4aRomaERz0gY8CLhKpHMKJrVtgj\nkHlAGqkRZB6AAlcEQUSOyvYziyECgYEA62Pg4xMw1BfJKSfLhCoaWHeWBMAbuZ8K\ncEOLIO8CtGKwXRLBe6MUKTDnHt7aXawVd/j6jk27uhD8p1noYqbsAexzMIKAAzic\nI6fsCVgUfvRZzhaQ98xyBO34AmAtzhJQEg65TnybyEf8tC5xPSegCzzYA5w8QfaM\necRq8V8R38ECgYEAkRNXpDuATBDGzaN8AXGfSV1VuUcmRZpTcg82nREFO/pliPwC\nAmVuC5rpOWIsDSC9ukyezzEECJeTdAjv0BQX7fYyLe3s9DlwQ8Ur9BUk/XCLpBrB\nCi4uq33+dzgaCmlTM5hFfInj/+ycjuCUFpaDfdnlbivVWhS4uK601M8d9qECgYEA\nuxel1ZaZRtqo/tcsgZ3dVtemG5x97OmmKFjnKoQOiEWwnCmeM6EJEzxVV0oWEkIG\nxlbU/2p1fYym5HUnqdG24EiJvdLb4LOMFyMPDtY9ZDLfdlilXO/Y6GYkq+66OYKA\ntfmR+/o679OX3bbUNqFaKdRwdV4m3t8SBG7D+Zlw4YECgYAp2B4F1WOu5H/P0yC6\n6Hn/FGcQec8ty6MCPlH1km9dQBS3jMvBAFpmnMv+hWiR4W93tOHRqRndR6VFC/dX\n+io76NklgjQGteUJ/Nawhg0sDpWCUGECRypwbNTgmhcrmu/RF1B22rO8sckPXXeB\nDzVmjKFXgpDDIJ0eDUTQbqEEMw=="); // new一个string
        var encB64Decode = Java.use("com.chaos.view.example.Base64Utils").decode(enc); // 调用Base64Utils的decode方法
        var loadPrivateKey = Java.use("com.chaos.view.example.RSAUtils").loadPrivateKey(PrivateKey); // 调用RSAUtils的loadPrivateKey方法

        var res = Java.use("java.lang.String").$new(Java.use("com.chaos.view.example.RSAUtils").decryptDataPrivate(encB64Decode, loadPrivateKey)); // 调用RSAUtils的decryptDataPrivate解密方法
        
        var qaq = Java.use("com.chaos.view.example.Qaq").decode(res, 127);
        console.log(qaq);
    })
 
}
setImmediate(main)
```

调用 `frida -U -l xxx.js` 

## 问题

没办法直接hook MainActivity的方法，毕竟需要实例化才行的
