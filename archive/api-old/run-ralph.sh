#!/bin/bash

MODELS=(
    "opencode/grok-code"
    "opencode/gpt-5-nano"
    "opencode/big-pickle"
    "opencode/minimax-m2.1-free"
    "opencode/glm-4.7-free"
)

for MODEL in "${MODELS[@]}"; do
    echo "Trying model: $MODEL"

    # Kill any existing opencode processes
    pkill -9 -f "opencode run" 2>/dev/null
    sleep 1

    # Remove old files
    rm -f ralph.log .ralph-lock

    # Start Ralph with this model
    nohup bash -c 'while :; do opencode run -m "'"$MODEL"'" "READ plan.md. Pick ONE task from the first incomplete section. Complete task. Commit change (update plan.md in same commit). Update plan.md. When ALL tasks complete, create .ralph-done and exit. NEVER GIT PUSH."; done' > ralph.log 2>&1 &

    # Wait and check if it works
    sleep 30

    # Check for credit error
    if grep -q "credit balance is too low" ralph.log 2>/dev/null; then
        echo "❌ $MODEL - Credits required"
        pkill -9 -f "opencode run" 2>/dev/null
        sleep 1
        continue
    fi

    # Check if it's running
    if ps aux | grep -q "opencode run.*$MODEL" | grep -v grep; then
        echo "✅ $MODEL - Working! Monitoring..."
        exit 0
    else
        echo "❌ $MODEL - Failed to start"
        cat ralph.log | tail -5
    fi
done

echo "No working model found"
