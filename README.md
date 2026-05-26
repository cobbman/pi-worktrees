# pi-worktrees

Secure Git worktree management for Pi Coding Agent.

`pi-worktrees` adds a focused `/worktree` command for creating, listing, switching to, and removing Git worktrees from inside Pi. It is intentionally small: shell-safe Git execution, predictable branch-first behavior, and no release/memory scaffolding in the package.

## Install

After publish:

```bash
pi install npm:@cobbman/pi-worktrees
```

Project-local install:

```bash
pi install -l npm:@cobbman/pi-worktrees
```

Development from this repo:

```bash
npm install
npm run build
pi -e ./dist/index.js
```

If Pi is already running, use `/reload` after installing or rebuilding.

## Commands

```text
/worktree init
/worktree settings [key] [value]
/worktree create <branch> [--name <worktree-name>]
/worktree create --generate [--name <worktree-name>] <prompt>
/worktree list
/worktree status
/worktree cd <name>
/worktree remove <name>
/worktree prune
/worktree templates
```

## Default behavior

- New worktrees are created at `{{mainWorktree}}.worktrees/<slugified-branch>`.
- `/worktree create` is branch-first: the first argument is the branch name.
- Existing branches are refused by default.
- Branch names are validated with `git check-ref-format --branch`.
- Destructive actions require confirmation in interactive Pi sessions.
- The main worktree and current worktree are protected from removal.

## Configuration

Settings live in `~/.pi/agent/pi-worktrees.config.json`.

```json
{
  "worktrees": {
    "**": {
      "worktreeRoot": "{{mainWorktree}}.worktrees",
      "onCreate": "echo Created {{path}}"
    },
    "github.com/org/repo": {
      "worktreeRoot": "~/work/repo.worktrees",
      "onCreate": ["npm install"],
      "onSwitch": "pwd",
      "onBeforeRemove": "git status --short",
      "branchNameGenerator": "printf 'feature/%s' \"$PI_WORKTREE_PROMPT\""
    }
  },
  "matchingStrategy": "fail-on-tie"
}
```

Template variables available to paths and hooks:

- `{{path}}`
- `{{name}}`
- `{{branch}}`
- `{{project}}`
- `{{mainWorktree}}`

## Security

- Git commands are executed with `execFileSync('git', args)` rather than shell interpolation.
- Branch names are validated before creation.
- Hook commands (`onCreate`, `onSwitch`, `onBeforeRemove`, `branchNameGenerator`) intentionally run through the shell because they are user configuration. Treat them like local scripts and only configure commands you trust.

See [SECURITY.md](./SECURITY.md) for the security model.

## Development

```bash
npm install
npm test
npm run typecheck
npm run lint
npm run build
npm pack --dry-run
```

## Release checklist

1. Update `CHANGELOG.md`.
2. Run `npm test && npm run typecheck && npm run lint && npm run build`.
3. Run `npm pack --dry-run` and inspect included files.
4. Publish with `npm publish --access public`.
