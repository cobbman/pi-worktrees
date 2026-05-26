/**
 * Secure Git worktree management for Pi Coding Agent.
 */

import type { ExtensionFactory } from '@earendil-works/pi-coding-agent';
import type { CmdHandler } from './types.ts';
import { cmdCd } from './cmds/cmdCd.ts';
import { cmdCreate } from './cmds/cmdCreate.ts';
import { cmdInit } from './cmds/cmdInit.ts';
import { cmdList } from './cmds/cmdList.ts';
import { cmdPrune } from './cmds/cmdPrune.ts';
import { cmdRemove } from './cmds/cmdRemove.ts';
import { cmdSettings } from './cmds/cmdSettings.ts';
import { cmdStatus } from './cmds/cmdStatus.ts';
import { cmdTemplates } from './cmds/cmdTemplates.ts';
import { createPiWorktreeConfigService } from './services/config/config.ts';
import { createCompletionFactory } from './services/completions.ts';
import { StatusIndicator } from './ui/status.ts';

const HELP_TEXT = `
/worktree - Git worktree management

Commands:
  /worktree init                   Configure worktree settings interactively
  /worktree settings [key] [val]   Get/set individual settings
  /worktree create <branch> [--name <worktree-name>]  Create new worktree from branch
  /worktree create --generate [--name <worktree-name>] <prompt-or-name>  Generate branch via config command
  /worktree list                   List worktrees and run onSwitch for a selection
  /worktree remove <name>          Remove a worktree (runs onBeforeRemove if set)
  /worktree status                 Show current worktree info
  /worktree cd <name>              Print path to worktree
  /worktree prune                  Clean up stale references
  /worktree templates              Show template variables preview

Configuration (~/.pi/agent/pi-worktrees.config.json):
  {
    "worktrees": {
      "**": {
        "worktreeRoot": "{{mainWorktree}}.worktrees",
        "onCreate": "echo Created {{path}}"
      },
      "github.com/org/repo": {
        "worktreeRoot": "~/work/repo.worktrees",
        "onCreate": "npm install",
        "onSwitch": "pwd",
        "onBeforeRemove": "git status --short",
        "branchNameGenerator": "printf 'feature/%s' $PI_WORKTREE_PROMPT"
      }
    },
    "matchingStrategy": "fail-on-tie"
  }

Pattern matching: exact URL > most-specific glob > ** fallback
Matching strategies: fail-on-tie | first-wins | last-wins
Hook vars: {{path}}, {{name}}, {{branch}}, {{project}}, {{mainWorktree}}
Hooks: onCreate, onSwitch, onBeforeRemove
Generated branch names require explicit --generate and must pass git check-ref-format.
`.trim();

const commands: Record<string, CmdHandler> = {
  init: cmdInit,
  settings: cmdSettings,
  config: cmdSettings,
  create: cmdCreate,
  list: cmdList,
  ls: cmdList,
  remove: cmdRemove,
  rm: cmdRemove,
  status: cmdStatus,
  cd: cmdCd,
  prune: cmdPrune,
  templates: cmdTemplates,
  vars: cmdTemplates,
  tokens: cmdTemplates,
};

const PiWorktreeExtension: ExtensionFactory = async function (pi) {
  const configService = await createPiWorktreeConfigService();
  const statusService = new StatusIndicator('pi-worktree');
  const getSubcommandCompletions = createCompletionFactory(commands);

  pi.registerCommand('worktree', {
    description: 'Git worktree management for isolated workspaces',
    getArgumentCompletions(argumentPrefix) {
      return getSubcommandCompletions(argumentPrefix);
    },
    handler: async (args, ctx) => {
      const [cmd, ...rest] = args.trim().split(/\s+/);
      const command = commands[cmd];

      if (!command) {
        ctx.ui.notify(HELP_TEXT, 'info');
        return;
      }

      try {
        await configService.reload();
        const settings = configService.current(ctx);
        await command(rest.join(' '), ctx, {
          settings,
          configService,
          statusService,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        ctx.ui.notify(`Worktree command failed: ${message}`, 'error');
      }
    },
  });
};

export default PiWorktreeExtension;
