# Security

## Security model

`pi-worktrees` manages local Git worktrees and can run user-configured hook commands. It assumes the user trusts their local repository and their own Pi extension configuration.

## Git command execution

Git subprocesses are executed without a shell:

```ts
execFileSync('git', args, ...)
```

This means branch names, paths, and remote values passed to Git are argv elements, not shell text. Shell metacharacters in a branch name are not interpreted by the shell.

## Hook command execution

The following configuration values intentionally run through a shell:

- `onCreate`
- `onSwitch`
- `onBeforeRemove`
- `branchNameGenerator`

These are user-authored automation hooks. Treat them like scripts in your shell profile or package scripts. Do not copy hook commands from sources you do not trust.

## Reporting issues

Please report security issues through the repository issue tracker or private maintainer contact if available. Include:

- affected version or commit
- reproduction steps
- expected impact
- relevant OS/shell/Git/Pi versions
