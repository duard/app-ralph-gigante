# Ralph Loop Script

This script implements the Ralph Driven Development execution loop for headless agent execution.

## Quick Start

```bash
# Make executable (already done)
chmod +x ralph-loop.sh

# Run the loop
./ralph-loop.sh

# Run with specific model
./ralph-loop.sh --model anthropic/claude-3-5-sonnet

# Run single iteration
./ralph-loop.sh --single
```

## How It Works

1. **Reads context**: plan.md, AGENTS.md, progress.txt
2. **Picks ONE task**: Unchecked task from plan.md
3. **Verifies**: Runs CLI/tests to confirm completion
4. **Commits**: Only commits, never pushes
5. **Updates**: Marks task as done in plan.md
6. **Repeats**: Loops until all tasks complete

## Configuration

### Environment Variables

- `OPENCODE_MODEL`: Default model to use

### Files

- `plan.md`: Task backlog with checkboxes
- `AGENTS.md`: Operational knowledge
- `PROMPT.md`: Custom prompt (optional)
- `progress.txt`: Iteration learnings

## Output Example

```
========================================
  Ralph Driven Development Loop
========================================

Checking prerequisites...
[INFO] Prerequisites check passed!

[INFO] Iteration 1

Progress:
  Completed: 45
  Remaining: 12
  Total:     57

[INFO] Running agent with model: opencode/claude-opus-4-5
...
```

## Stop Conditions

- All tasks in plan.md complete
- Critical error (agent exits)
- User manually stops (Ctrl+C)

## For Humans

After loop completes:

1. Review commits: `git log --oneline -20`
2. Run full test suite: `make test-all`
3. Build both projects: `make build-all`
4. Push when satisfied: `git push`
