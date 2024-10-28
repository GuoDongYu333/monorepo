module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 108],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      [
        'feat', //新功能
        'fix', //修复
        'perf', //性能优化
        'style', //样式调整
        'docs', //文档更新
        'test', //测试
        'refactor', //重构
        'build', //外部依赖更新
        'chore', //其他维护
        'revert', //回滚
        'types', //类型定义
        'wip',
      ],
    ],
  },
}
