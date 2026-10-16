---
title: 'java近期笔记整理'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
#0x01 图形界面的设计

java有swing包，可以很方便地设计图形界面
各种组件可以new出来，然后将其添加进container中
每一个组件可以加监视器

比如实现的这个：

![](https://upload-images.jianshu.io/upload_images/10651191-40f637444d20e18a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

共3个按钮，每点击一个按钮就会弹出一个消息

具体实现如下：
```java
package javaStudyDemo.swingDemo;

import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
public class SwingControlDemo {
    private JFrame mainFrame;
    private JLabel headerLabel;
    private JLabel statusLabel;
    private JPanel controlPanel;
    public SwingControlDemo(){
            prepareGUI();
        }
        public static void main(String[] args){
            SwingControlDemo swingControlDemo = new SwingControlDemo();
            swingControlDemo.showEventDemo();
        }
        private void prepareGUI(){
            mainFrame = new JFrame("Java SWING Examples");
        mainFrame.setSize(400,400);
        mainFrame.setLayout(new GridLayout(3, 1));
        headerLabel = new JLabel("",JLabel.CENTER );
        statusLabel = new JLabel("",JLabel.CENTER);
        statusLabel.setSize(350,100);
        mainFrame.addWindowListener(new WindowAdapter() {
            public void windowClosing(WindowEvent windowEvent){
                System.exit(0);
            }
        });
        controlPanel = new JPanel();
        controlPanel.setLayout(new FlowLayout());
        mainFrame.add(headerLabel);
        mainFrame.add(controlPanel);
        mainFrame.add(statusLabel);
        mainFrame.setVisible(true);
    }
    private void showEventDemo(){
        headerLabel.setText("Control in action: Button");
        JButton okButton = new JButton("OK");
        JButton submitButton = new JButton("Submit");
        JButton cancelButton = new JButton("Cancel");
        okButton.setActionCommand("OK");
        submitButton.setActionCommand("Submit");
        cancelButton.setActionCommand("Cancel");
        okButton.addActionListener(new ButtonClickListener());
        submitButton.addActionListener(new ButtonClickListener());
        cancelButton.addActionListener(new ButtonClickListener());
        controlPanel.add(okButton);
        controlPanel.add(submitButton);
        controlPanel.add(cancelButton);
        mainFrame.setVisible(true);
    }
    private class ButtonClickListener implements ActionListener{
        public void actionPerformed(ActionEvent e) {
            String command = e.getActionCommand();
            if( command.equals( "OK" ))  {
                statusLabel.setText("Ok Button clicked.");
            }
            else if( command.equals( "Submit" ) )  {
                statusLabel.setText("Submit Button clicked.");
            }
            else  {
                statusLabel.setText("Cancel Button clicked.");
            }
        }
    }
}
```

# 0x02 java IO

java IO大体分为字节流和字符流
> InputStreamReader和OutputStreamWriter是转换流，前者将字节转化为字符，后者将字符转化为字节(这两个类其实更多的是起到一个桥梁的作用，进行编码的转换)

BufferedReader和BufferedWriter是字符缓冲区

BufferedImage图片的缓冲区
BufferedImage简单示例：
先用FileInputStream打开流，
```java
String imgPath = "C://demo.jpg";  
BufferedImage image = ImageIO.read(new FileInputStream(imgPath));  
```

FileReader和FileWriter读取文本中的字符，是一个快捷类

字节流的类都继承于InputStream和OutputStream
字符流的类都继承于Reader和Writer

# 0x03 java 序列化与反序列化

> Java 提供了一种对象序列化的机制，该机制中，一个对象可以被表示为一个字节序列，该字节序列包括该对象的数据、有关对象的类型的信息和存储在对象中数据的类型。
将序列化对象写入文件之后，可以从文件中读取出来，并且对它进行反序列化，也就是说，对象的类型信息、对象的数据，还有对象中的数据类型可以用来在内存中新建对象。
整个过程都是 Java 虚拟机（JVM）独立的，也就是说，在一个平台上序列化的对象可以在另一个完全不同的平台上反序列化该对象。

怎么理解序列化和反序列化呢
打个比方，比如A要见B，但是A和B相隔很远无法到达，A只好委托一个人将B的信息(比如身高啦，眼睛啦，各种相貌特征)传送过来，然后自己画出或者想象出B的样子，这就是一次数据传输的过程，也就是一次序列化和反序列化的过程。

# 0x04 java 在线反编译环境
经常间歇性忘记jar包要怎么反编译，这里有一个在线的反编译环境
[在线环境](http://www.javadecompilers.com/)

# 0x05 java调用摄像头
可以直接用GitHub上的一个包
[地址](https://github.com/sarxos/webcam-capture)

# 0x06 什么是java包管理工具？
java包管理工具，主要有Maven和Gradle,之前一直没有明白java的包管理工具的用处是什么，后来亲自导入外部的包才意识到，原来java的包管理工具也就相当于python的pip命令了。

# 0x07 java管理注册表

有一个已经打包好的工具：
[JRegistry](https://gitee.com/jianggujin/JRegistry/tree/master)

# 0x08 java robot
这个没有做过多的了解，顾名思义就是一个机器人，可以实现自动化的一些操作。

# 0x09 java OpenCv学习
第一个OpenCv的demo
![](https://upload-images.jianshu.io/upload_images/10651191-18e8d60a8869a35b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是当用OpenCv去打开摄像头的时候出错，问题还没解决
