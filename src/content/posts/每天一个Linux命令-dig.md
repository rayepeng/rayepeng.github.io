---
title: '每天一个Linux命令-dig'
date: 2020-01-30
updated: 2020-02-01
category: '编程'
tags:
  - 'Linux'
  - 'dig'
lang: 'zh'
draft: false
---
## 基本选项：

@<服务器地址>：指定进行域名解析的域名服务器；  
\-b<ip地址>：当主机具有多个IP地址，指定使用本机的哪个IP地址向域名服务器发送域名查询请求；  
\-f<文件名称>：指定dig以批处理的方式运行，指定的文件中保存着需要批处理查询的DNS任务信息；  
\-P：指定域名服务器所使用端口号；  
\-t<类型>：指定要查询的DNS数据类型；  
\-x<IP地址>：执行逆向域名查询；  
\-4：使用IPv4；  
\-6：使用IPv6；  
\-h：显示指令帮助信息。

比如我要用Google的DNS

`dig prontosil.club @8.8.8.8`

查询解析记录  
`dig prontosil.club -t CNAME`

得到结果：

```
;; QUESTION SECTION:
;prontosil.club.                        IN      CNAME

;; ANSWER SECTION:
prontosil.club.         600     IN      CNAME   2zeqwj.coding-pages.com.

;; Query time: 55 msec
```

查询 TXT 记录

`dig _pages-challenge.prontosil.club -t TXT`

得到结果：

```
;; ANSWER SECTION:
_pages-challenge.prontosil.club. 600 IN TXT     "rCAijO55WRowkOABj2JwHDEacVPpxo5rkCtDr2eG7J0=.ItO58cZnxtPdQAIzuUTAumBPxAZ4nwBjsGfmWl/Rhg0="
```
