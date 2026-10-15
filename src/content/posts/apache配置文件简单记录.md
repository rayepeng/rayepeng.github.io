---
title: 'apache配置文件简单记录'
date: 2020-03-14
updated: 2020-03-15
category: 'CTF'
tags:
  - 'apache'
lang: 'zh'
draft: false
---
一直不太清楚apache的配置文件，简单记录一下

`/etc/apache2` 下的文件

`apache2.conf` 是主配置文件，之后的 `available` 代表可用的, `enable` 代表已经启用的

![](./attachments/1584192313504.png)

`sites-enabled` 下

![](./attachments/1584192394696.png)

000-default.conf 文件规定了网站根目录

```
<VirtualHost *:80>
        # The ServerName directive sets the request scheme, hostname and port that
        # the server uses to identify itself. This is used when creating
        # redirection URLs. In the context of virtual hosts, the ServerName
        # specifies what hostname must appear in the request's Host: header to
        # match this virtual host. For the default virtual host (this file) this
        # value is not decisive as it is used as a last resort host regardless.
        # However, you must set it for any further virtual host explicitly.
        #ServerName www.example.com

        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/html

        # Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
        # error, crit, alert, emerg.
        # It is also possible to configure the loglevel for particular
        # modules, e.g.
        #LogLevel info ssl:warn

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        # For most configuration files from conf-available/, which are
        # enabled or disabled at a global level, it is possible to
        # include a line for only one particular virtual host. For example the
        # following line enables the CGI configuration for this host only
        # after it has been globally disabled with "a2disconf".
        #Include conf-available/serve-cgi-bin.conf
</VirtualHost>

# vim: syntax=apache ts=4 sw=4 sts=4 sr noet
```

`/etc/apache2/mods-enabled /mime.conf` 中配置了可以解析的文件类型

![](./attachments/1584192584702.png)

这样就能解析 php5 等的后缀了
