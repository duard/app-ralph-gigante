#!/bin/bash

MODELS=(
    "opencode/grok-code:Grok - Code"
    "opencode/gpt-5-nano:GPT-5 - Nano"
    "opencode/big-pickle:Big - Pickle"
    "opencode/glm-4.7-free:GLM-4.7 - Free"
    "opencode/minimax-m2.1-free:Minimax - M2.1"
    "anthropic/claude-opus-4-5:Claude - Opus (paid)"
    "anthropic/claude-3-5-sonnet-20241022:Claude - Sonnet (paid)"
)

echo "=========================================="
echo "       Ralph Model Selector"
echo "=========================================="
echo ""

for i in "${!MODELS[@]}"; do
    echo "[$((i+1))] ${MODELS[$i]}"
done

echo ""
echo "[q] Quit"
echo ""

read -p "Select a model (1-${#MODELS[@]} or q): " SELECTION

if [ "$SELECTION" = "q" ]; then
    echo "Exiting..."
    exit 0
fi

if ! [[ "$SELECTION" =~ ^[0-9]+$ ]]; then
    echo "Invalid selection"
    exit 1
fi

INDEX=$((SELECTION-1))
if [ $INDEX -lt 0 ] || [ $INDEX -ge ${#MODELS[@]} ]; then
    echo "Invalid selection"
    exit 1
fi

# Extract just the model name (before the colon)
MODEL=$(echo "${MODELS[$INDEX]}" | cut -d':' -f1)
DESCRIPTION=$(echo "${MODELS[$INDEX]}" | cut -d':' -f2-)

echo "Selected model: $MODEL ($DESCRIPTION)"

# Get current script PID to avoid killing it
SCRIPT_PID=$$

# Kill existing opencode run processes
pkill -9 -f "opencode run" 2>/dev/null
sleep 2

# Clean up
rm -f ralph.log .ralph-lock .ralph-state.json

echo "Starting Ralph with $MODEL..."
echo ""

# Start Ralph
nohup bash -c 'while :; do opencode run -m "'"$MODEL"'" "READ plan.md. Pick ONE task from the first incomplete section. Complete task. Commit change (update plan.md in same commit). Update plan.md. When ALL tasks complete, create .ralph-done and exit. NEVER GIT PUSH."; done' > ralph.log 2>&1 &

sleep 5

# Check for credit error
if grep -q "credit balance is too low" ralph.log 2>/dev/null; then
    echo "❌ ERROR: Credits required for this model"
    cat ralph.log | tail -3
    pkill -9 -f "opencode run" 2>/dev/null
    exit 1
fi

# Check if it's running
if ps aux | grep -q "[o]pencode run.*$MODEL"; then
    echo "✅ Ralph is running with $MODEL"
    echo ""
    echo "📄 Monitor: tail -f ralph.log"
    echo "🛑 Stop: pkill -9 -f 'opencode run'"
    echo ""
    echo "Press Ctrl+C to exit monitor, Ralph will continue running in background"
    tail -f ralph.log
else
    echo "❌ Failed to start Ralph"
    echo "Log output:"
    tail -10 ralph.log
fi
