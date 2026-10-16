---
title: 'py3-5启动jupyter-notebook的问题'
date: 2019-01-01
category: 'docker实战'
tags: []
lang: 'zh'
draft: true
---
#### 疑惑
由于要用到tensorflow的原因，所以我在电脑上安装了一个py3.5版本的python， 然后用 pip install jupyter notebook之后， 启动我的jupyter总是会报错，报错信息如下
`ImportError: No module named 'prompt_toolkit.formatted_text'`

#### 解决方案
之前一直以为是电脑问题，后来Google后才知道原因如下：
`jupyter` requires jupyter-console and ipykernel. `jupyter-console==5.2.0 (the most recent)` requires prompt-toolkit<2.0.0, but `ipykernel==5.0.0 (the most recent)`requires prompt-toolkit>=2.0.0. prompt-toolkit-1.0.15 ends up being installed, which results in error

This occurs when doing `pip install jupyter`, in Python 3.5. It is triggered by the new release of `ipykernel 5.0.0.`

大致的意思就是如果在py3.5中直接用原来的命令安装就会出问题。

解决措施如下：
`pip uninstall ipykernel`
`pip install ipykernel==4.8.0`
