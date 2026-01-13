#!/bin/bash

# Ralph Driven Development - Execution Loop
# 
# This script runs the headless execution loop for Ralph-driven development.
# It forces the agent to re-read the full context every iteration, eliminating context drift.
#
# Usage:
#   ./ralph-loop.sh              # Run with default model
#   ./ralph-loop.sh --model <m>  # Run with specific model
#
# Prerequisites:
#   - opencode CLI installed
#   - plan.md with checkboxes in root
#   - AGENTS.md with operational knowledge

set -e

# Configuration
MODEL="${OPENCODE_MODEL:-opencode/claude-opus-4-5}"
PROMPT_FILE="PROMPT.md"
PLAN_FILE="plan.md"
AGENTS_FILE="AGENTS.md"
PROGRESS_FILE="progress.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Ralph Driven Development Loop${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if [ ! -f "$PLAN_FILE" ]; then
        print_error "plan.md not found in current directory!"
        exit 1
    fi
    
    if ! command -v opencode &> /dev/null; then
        print_error "opencode CLI not found. Please install it first."
        exit 1
    fi
    
    print_status "Prerequisites check passed!"
}

# Count remaining tasks
count_remaining_tasks() {
    local remaining=$(grep -c '^\- \[ \]' "$PLAN_FILE" 2>/dev/null || echo "0")
    echo $remaining
}

# Count completed tasks
count_completed_tasks() {
    local completed=$(grep -c '^\- \[x\]' "$PLAN_FILE" 2>/dev/null || echo "0")
    echo $completed
}

print_progress() {
    local remaining=$(count_remaining_tasks)
    local completed=$(count_completed_tasks)
    local total=$((remaining + completed))
    
    echo ""
    echo -e "${BLUE}Progress:${NC}"
    echo -e "  Completed: ${GREEN}$completed${NC}"
    echo -e "  Remaining: ${YELLOW}$remaining${NC}"
    echo -e "  Total:     $total"
    echo ""
}

# Read prompt from PROMPT.md or use default
get_prompt() {
    if [ -f "$PROMPT_FILE" ]; then
        cat "$PROMPT_FILE"
    else
        cat << EOF
READ all of plan.md. Pick ONE uncompleted task. Verify via web/code search. Complete task, verify via CLI/Test output. Commit change. ONLY do one task. Update plan.md. If you learn a critical operational detail (e.g. how to build), update AGENTS.md. If all tasks done, sleep 5s and exit. NEVER GIT PUSH. ONLY COMMIT.
EOF
    fi
}

# Main execution loop
run_loop() {
    local iteration=0
    local model="$1"
    
    print_header
    
    while true; do
        iteration=$((iteration + 1))
        
        # Check remaining tasks
        local remaining=$(count_remaining_tasks)
        
        if [ "$remaining" -eq 0 ]; then
            print_status "All tasks completed! Exiting loop."
            break
        fi
        
        echo -e "${BLUE}Iteration $iteration${NC}"
        print_progress
        
        # Get the prompt
        local prompt=$(get_prompt)
        
        # Run the agent
        print_status "Running agent with model: $model"
        
        if opencode run -m "$model" "$prompt"; then
            print_status "Iteration completed successfully"
        else
            print_warning "Iteration failed - agent may need adjustment"
            print_status "Consider updating AGENTS.md with operational knowledge"
        fi
        
        echo ""
        echo "----------------------------------------"
        echo ""
        
        # Small delay between iterations
        sleep 1
    done
    
    print_status "Loop finished after $iteration iterations"
}

# Alternative: Run single task
run_single() {
    local model="$1"
    local prompt=$(get_prompt)
    
    print_status "Running single task with model: $model"
    opencode run -m "$model" "$prompt"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --model)
                MODEL="$2"
                shift 2
                ;;
            --single)
                SINGLE_RUN=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

show_help() {
    echo "Ralph Driven Development - Execution Loop"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --model <m>     Specify the model to use (default: opencode/claude-opus-4-5)"
    echo "  --single        Run only a single iteration"
    echo "  --help, -h      Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  OPENCODE_MODEL  Default model to use"
    echo ""
    echo "Examples:"
    echo "  $0                              # Run loop with default model"
    echo "  $0 --model anthropic/claude-3   # Use specific model"
    echo "  $0 --single                     # Run single iteration"
}

# Main entry point
main() {
    parse_args "$@"
    
    check_prerequisites
    
    if [ "$SINGLE_RUN" = true ]; then
        run_single "$MODEL"
    else
        run_loop "$MODEL"
    fi
}

main "$@"
