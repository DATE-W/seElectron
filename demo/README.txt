请在使用前先将visual studio的路径的父文件夹的父文件夹下VC\Auxiliary\Build添加到环境变量中
如果在安装vs时使用了默认的路径，那么需要添加的路径应该类似下文：
C:\Program Files (x86)\Microsoft Visual Studio\2017\Enterprise\VC\Auxiliary\Build

脚本使用参数：1 文件工程路径2 待执行文件名称（包括文件拓展名）3 服务机IP地址使用样例：工程在C:\Users\Administrator\Desktop\demo下，待执行文件路径为（rtss文件相对于工程的目录不能改变）：C:\Users\Administrator\Desktop\demo\x64\RtssRelease\CodeDemo_RTX.rtss，服务机IP地址为192.128.0.102，则运行命令为：script.bat C:\Users\Administrator\Desktop\demo CodeDemo_RTX.rtss 192.168.0.102