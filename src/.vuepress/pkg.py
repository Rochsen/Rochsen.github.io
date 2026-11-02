import os
import shutil


def main():
    """
    删除 dist.zip 与 dist 后重新构建，并打包为 dist.zip。
    由 pnpm docs:build 或双击本脚本触发。
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, "..", ".."))

    # 产物在 src/.vuepress/dist，与双击脚本时的相对路径一致
    os.chdir(script_dir)
    if os.path.exists("dist.zip"):
        os.remove("dist.zip")
    if os.path.exists("dist"):
        shutil.rmtree("dist")

    # 直接构建，避免再调用 pnpm docs:build 造成递归
    os.chdir(project_root)
    os.system("pnpm exec vuepress-vite build src")

    os.chdir(script_dir)
    os.system(r'"C:\Program Files\Bandizip\bz.exe" c -r -y dist.zip dist')


if __name__ == "__main__":
    main()
