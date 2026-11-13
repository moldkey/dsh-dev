<p align="center"><strong>开发工具：cURL 转 Python</strong></p>

生成 requests 代码

## 安装（任选一种）

**1）插件市场（推荐）**：在 https://deepseekbase.com/zh/tools/ 搜索 dev_curl_to_python，点安装。

**2）命令行**：

    dsh plugin --profile web add dsh-dev-curl-to-python

**3）GitHub monorepo（不经 npm 也能装）**：

    dsh plugin --profile web add github:moldkey/dsh-dev#path:/plugins/dsh-dev-curl-to-python

## 能做什么

- 生成 requests 代码
- 本地执行，输入不出机器
- 只注册一个工具，不常驻进程、无需网络

## 用法

在会话里直接说「用cURL 转 Python处理」，或调用工具 dev_curl_to_python。

    工具: dev_curl_to_python
    参数: text（必填）

## 示例

输入：

    {"a":1}

工具会返回处理结果，末尾带全部工具入口。

## 兼容

- DSH >= 0.2.0-rc.2
- Node 18+
- 无外部依赖

## 更多

- 全部工具：https://deepseekbase.com/zh/tools/
- 同类插件：github.com/moldkey/dsh-dev

## 许可

MIT
