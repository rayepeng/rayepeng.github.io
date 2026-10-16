---
title: 'Android开发入门'
date: 2019-01-01
category: 'Android开发'
tags: []
lang: 'zh'
draft: true
---
全部出自菜鸟教程， 侵删
折腾了半天终于把`Android studio `和 `Android sdk`下载安装好了
现在开始愉快的入门Android吧

参考菜鸟教程

先了解几个文件
> res/layout/main.xml App主窗体布局文件，你的应用长什么样都在这边定义，有Design和Text两种模式
res/values/strings.xml 可以理解为i18n文件，这个文件用来存放程序调用的各种字符串
src/com/example/helloandroid/MyActivity.java 这个就是我们的主程序类，等下要实现的功能都在这个文件里添加

先看一段最简单的代码
主程序中定义button点击后改变textview显示的文本，并且弹出Toast提示信息，代码如下：

```
public class MyActivity extends Activity {
    /**
     * Called when the activity is first created.
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        //得到按钮实例
        Button hellobtn = (Button)findViewById(R.id.hellobutton);
        //设置监听按钮点击事件
        hellobtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //得到textview实例
                TextView hellotv = (TextView)findViewById(R.id.hellotextView);
                //弹出Toast提示按钮被点击了
                Toast.makeText(MyActivity.this,"Clicked",Toast.LENGTH_SHORT).show();
                //读取strings.xml定义的interact_message信息并写到textview上
                hellotv.setText(R.string.interact_message);
            }
        });
    }

}

```

我们简单地分析一下上面的代码
其实就是我学到的java的一个继承
实例化对象之后， 重写`onclick方法

我们所有的资源文件都会在R.java文件下生成一个资源id，我们可以通过这个资源id来完成资源的访问，使用情况有两种：Java代码中使用和XML代码中使用。

`MainActivity.java`
布局文件：`activity_main`
Android配置文件：`AndroidManifest.xml`

我们从是示例开始分析
```
package jay.com.example.firstapp;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
    }
}
```

![](https://upload-images.jianshu.io/upload_images/10651191-98f57f1d04637e38.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

activity_main.xml：
```
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/hello_world" />

</RelativeLayout>
```

AndroidManifest.xml配置文件:

```
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="jay.com.example.firstapp" >

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme" >
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name" >
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
```
