#!/usr/bin/env bash

# Parse options
while getopts "d:c:" opt; do
  case "$opt" in
    d)
      DIR_TO_WATCH="$OPTARG"
      ;;
    c)
      # Capture the command and all its arguments
      COMMAND_TO_RUN="$OPTARG"
      # Append any following arguments (until next flag or end)
      shift $((OPTIND - 1))
      while [[ $# -gt 0 && ! "$1" =~ ^- ]]; do
        COMMAND_TO_RUN+=" $1"
        shift
      done
      break
      ;;
    *)
      echo "Usage: $0 -d <file> -c <command ...>"
      exit 1
      ;;
  esac
done

# Check required arguments
if [[ -z "$DIR_TO_WATCH" || -z "$COMMAND_TO_RUN" ]]; then
  echo "Error: both -d and -c are required."
  echo "Usage: $0 -d <file> -c <command ...>"
  exit 1
fi

# Check if inotifywait is installed
if ! command -v inotifywait >/dev/null 2>&1; then
  echo "Error: 'inotifywait' is not installed."
  echo "Please install it with your package manager, e.g.:"
  echo "  sudo apt install inotify-tools     # Debian/Ubuntu"
  echo "  sudo dnf install inotify-tools     # Fedora/RHEL"
  echo "  sudo pacman -S inotify-tools       # Arch/Manjaro"
  return 1 2>/dev/null || exit 1
fi

inotifywait -m -e close_write "$DIR_TO_WATCH" | while read -r directory events filename; do
  echo "Detected change in: $filename"
  bash -c "$COMMAND_TO_RUN"
done
