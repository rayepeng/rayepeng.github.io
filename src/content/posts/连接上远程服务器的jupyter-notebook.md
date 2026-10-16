---
title: '连接上远程服务器的jupyter-notebook'
date: 2019-01-01
category: 'docker实战'
tags: []
lang: 'zh'
draft: true
---
#### 疑惑
曾今在有一次遇到过notebook出现过一点问，说是密码不对啥的，后来明白过来， notebook其实就是一个运行在机器上的web服务，既然如此，在远程服务器上运行的notebook， 自然可以在本地的浏览器中打开， 问题是怎么才能做到

#### 参考博客
参考了一下几篇博客
[远程访问服务器端Jupyter notebook](https://blog.csdn.net/zhu_lihua/article/details/80263211)
[Windows远程访问服务器的Jupyter Notebook](https://blog.csdn.net/Design_by_TaoZ/article/details/80632238)
[Jupyter notebook远程访问服务器](https://blog.csdn.net/sinat_36256646/article/details/80753593)

大部分都是说要按照以下几个步骤进行：
先是生成jupyter notebook的配置文件， 然后修改几个配置就行了。

然而...没成功。
报错信息如下：
```python
[E 06:13:09.096 NotebookApp] Exception while loading config file /root/.jupyter/jupyter_notebook_config.py
    Traceback (most recent call last):
      File "/usr/local/lib/python2.7/dist-packages/traitlets/config/application.py", line 562, in _load_config_files
        config = loader.load_config()
      File "/usr/local/lib/python2.7/dist-packages/traitlets/config/loader.py", line 457, in load_config
        self._read_file_as_dict()
      File "/usr/local/lib/python2.7/dist-packages/traitlets/config/loader.py", line 489, in _read_file_as_dict
        py3compat.execfile(conf_filename, namespace)
      File "/usr/local/lib/python2.7/dist-packages/ipython_genutils/py3compat.py", line 290, in execfile
        builtin_mod.execfile(filename, *where)
      File "/root/.jupyter/jupyter_notebook_config.py", line 267, in <module>
        c.NotebookApp.open_browser = false
    NameError: name 'false' is not defined
[E 06:13:09.099 NotebookApp] Exception while loading config file /root/.jupyter/jupyter_notebook_config.py
    Traceback (most recent call last):
      File "/usr/local/lib/python2.7/dist-packages/traitlets/config/application.py", line 562, in _load_config_files
        config = loader.load_config()
      File "/usr/local/lib/python2.7/dist-packages/traitlets/config/loader.py", line 457, in load_config
        self._read_file_as_dict()
      File "/usr/local/lib/python2.7/dist-packages/traitlets/config/loader.py", line 489, in _read_file_as_dict
        py3compat.execfile(conf_filename, namespace)
      File "/usr/local/lib/python2.7/dist-packages/ipython_genutils/py3compat.py", line 290, in execfile
        builtin_mod.execfile(filename, *where)
      File "/root/.jupyter/jupyter_notebook_config.py", line 267, in <module>
        c.NotebookApp.open_browser = false
    NameError: name 'false' is not defined

```
