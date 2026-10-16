---
title: 'flask框架——表单'
date: 2019-01-01
category: 'python'
tags: []
lang: 'zh'
draft: true
---
我们使用wtforms 这个包来导入我们所需要的表单字段

# 先做一个表单类
> from wtforms import ....

FileField
PasswordField
BooleanField
等等

这样你就可以写一个表单类

```
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired(), Length(8, 128)])
    remember = BooleanField('Remember me')
    submit = SubmitField('Log in')

```

这里用了一系列相似的语句
你可以理解成你的表单由什么构成，你就实例化哪些字段

其中还可以添加验证器 `validators`
比如`username`是一定需要的， `password`的长度有一定的限制等等

# 自定义验证器

```
# custom validator
class FortyTwoForm(FlaskForm):
    answer = IntegerField('The Number')
    submit = SubmitField()

    def validate_answer(form, field):
        if field.data != 42:
            raise ValidationError('Must be 42.')

```

这个类继承自 `FlaskForm`， 定义了两个字段， 同时验证答案必须是42

# 文件上传

使用 `FileField` 这个类

```
class UploadForm(FlaskForm):
    photo = FileField('Upload Image', validators=[FileRequired(), FileAllowed(['jpg', \
'jpeg', 'png', 'gif'])])
    submit = SubmitField()

```

# 看一下路由是如何实现的

## 根目录
```
@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')
```

`render_template`函数对`index.html`进行渲染

## /html

进去之后是这样子的
![](https://upload-images.jianshu.io/upload_images/10651191-b0be96c52fa85dc3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

登陆之后变成了这样

![](https://upload-images.jianshu.io/upload_images/10651191-b8b969378c660f71.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

首先实例化了 `LoginForm()`类

HTTP方法必须是 `POST`（这个貌似是交给浏览器去做的）

通过 `request.form.get()`获取到了`username`（用户填写的）
然后`flash`一下
接着重定向到`index`视图

```
@app.route('/html', methods=['GET', 'POST'])
def html():
    form = LoginForm()
    if request.method == 'POST':
        username = request.form.get('username')
        flash('Welcome home, %s!' % username)
        return redirect(url_for('index'))
    return render_template('pure_html.html')
```

这是没有经过渲染的页面

![](https://upload-images.jianshu.io/upload_images/10651191-42eb8d7ec3f87200.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

之后其他的页面都很类似的

# 安全

直接抓包之后就绕过了上传检测

![](https://upload-images.jianshu.io/upload_images/10651191-64b255899a571cd1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

问题就在这里了

![](https://upload-images.jianshu.io/upload_images/10651191-8a441ab72348b743.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 疑问

出现乱码就很奇怪
