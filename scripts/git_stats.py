#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Git代码统计工具 - Python版本
用于统计Git仓库中每个提交者的代码量
"""

import os
import subprocess
import json
import sys
from pathlib import Path
from typing import List, Dict, Any


def run_command(command: str, cwd: str = None) -> str:
    """执行命令并返回输出"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        print(f"命令执行超时: {command}", file=sys.stderr)
        return ""
    except Exception as e:
        print(f"命令执行失败: {command}, 错误: {e}", file=sys.stderr)
        return ""


def find_git_repositories(root_path: str) -> List[str]:
    """查找指定路径下的所有Git仓库"""
    repositories = []
    root = Path(root_path)
    
    # 要跳过的目录
    skip_dirs = {
        'node_modules', 'vendor', 'venv', '__pycache__',
        '.venv', 'env', 'build', 'dist', '.next'
    }
    
    for item in root.rglob('.git'):
        if item.is_dir():
            repo_path = str(item.parent)
            # 检查路径中是否包含要跳过的目录
            if not any(skip_dir in repo_path for skip_dir in skip_dirs):
                repositories.append(repo_path)
    
    return repositories


def get_repository_authors(repo_path: str) -> List[str]:
    """获取仓库的所有提交者"""
    command = 'git log --all --format="%aN" | sort -u'
    output = run_command(command, cwd=repo_path)
    
    if not output:
        return []
    
    authors = [author.strip() for author in output.split('\n') if author.strip()]
    return authors


def get_author_stats(repo_path: str, author: str) -> Dict[str, Any]:
    """获取特定作者的统计数据"""
    # 获取代码统计（添加、删除行数）
    stats_command = f'''git log --all --author="{author}" --pretty=tformat: --numstat | awk '{{ add += $1; subs += $2; loc += $1 - $2 }} END {{ print add "," subs "," loc }}\''''
    stats_output = run_command(stats_command, cwd=repo_path)
    
    added, deleted, total = 0, 0, 0
    if stats_output:
        try:
            parts = stats_output.split(',')
            added = int(parts[0]) if parts[0] else 0
            deleted = int(parts[1]) if len(parts) > 1 and parts[1] else 0
            total = int(parts[2]) if len(parts) > 2 and parts[2] else 0
        except (ValueError, IndexError):
            pass
    
    # 获取提交次数
    commits_command = f'git log --all --author="{author}" --oneline | wc -l'
    commits_output = run_command(commits_command, cwd=repo_path)
    commits = int(commits_output) if commits_output.isdigit() else 0
    
    return {
        'author': author,
        'added': added,
        'deleted': deleted,
        'totalChanges': added + deleted,
        'commits': commits
    }


def analyze_repository(repo_path: str) -> Dict[str, Any]:
    """分析单个仓库"""
    repo_name = os.path.basename(repo_path)
    print(f"正在分析仓库: {repo_name} ({repo_path})")
    
    authors = get_repository_authors(repo_path)
    print(f"  发现 {len(authors)} 个提交者")
    
    contributors = []
    for author in authors:
        stats = get_author_stats(repo_path, author)
        contributors.append(stats)
        print(f"    - {author}: {stats['totalChanges']} 行改动, {stats['commits']} 次提交")
    
    # 按总改动量排序
    contributors.sort(key=lambda x: x['totalChanges'], reverse=True)
    
    return {
        'name': repo_name,
        'path': repo_path,
        'contributors': contributors
    }


def analyze_folder(folder_path: str) -> Dict[str, Any]:
    """分析文件夹中的所有Git仓库"""
    if not os.path.exists(folder_path):
        return {
            'success': False,
            'message': '文件夹路径不存在'
        }
    
    print(f"\n开始扫描文件夹: {folder_path}")
    print("=" * 60)
    
    # 查找所有Git仓库
    repositories = find_git_repositories(folder_path)
    print(f"\n发现 {len(repositories)} 个Git仓库\n")
    
    if not repositories:
        return {
            'success': True,
            'message': '未找到Git仓库',
            'data': {
                'repositories': [],
                'total': {
                    'repositoryCount': 0,
                    'contributorCount': 0,
                    'totalAdded': 0,
                    'totalDeleted': 0,
                    'totalChanges': 0,
                    'totalCommits': 0
                }
            }
        }
    
    # 分析每个仓库
    repo_stats = []
    for repo_path in repositories:
        try:
            stats = analyze_repository(repo_path)
            repo_stats.append(stats)
            print()
        except Exception as e:
            print(f"分析仓库失败 {repo_path}: {e}\n")
    
    # 计算总体统计
    all_contributors = set()
    total_added = 0
    total_deleted = 0
    total_changes = 0
    total_commits = 0
    
    for repo in repo_stats:
        for contributor in repo['contributors']:
            all_contributors.add(contributor['author'])
            total_added += contributor['added']
            total_deleted += contributor['deleted']
            total_changes += contributor['totalChanges']
            total_commits += contributor['commits']
    
    result = {
        'success': True,
        'data': {
            'repositories': repo_stats,
            'total': {
                'repositoryCount': len(repositories),
                'contributorCount': len(all_contributors),
                'totalAdded': total_added,
                'totalDeleted': total_deleted,
                'totalChanges': total_changes,
                'totalCommits': total_commits
            }
        }
    }
    
    return result


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python git_stats.py <文件夹路径> [输出文件路径]")
        print("示例: python git_stats.py /Users/username/projects output.json")
        sys.exit(1)
    
    folder_path = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    # 执行分析
    result = analyze_folder(folder_path)
    
    # 输出结果
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"\n结果已保存到: {output_file}")
    else:
        print("\n" + "=" * 60)
        print("分析结果:")
        print("=" * 60)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    # 打印总结
    if result['success'] and result.get('data'):
        total = result['data']['total']
        print("\n" + "=" * 60)
        print("总体统计:")
        print("=" * 60)
        print(f"仓库总数: {total['repositoryCount']}")
        print(f"提交者总数: {total['contributorCount']}")
        print(f"总添加行数: {total['totalAdded']:,}")
        print(f"总删除行数: {total['totalDeleted']:,}")
        print(f"总改动量: {total['totalChanges']:,}")
        print(f"总提交次数: {total['totalCommits']:,}")
        print("=" * 60)


if __name__ == '__main__':
    main()

