#!/bin/bash

#
# Scaffold composable
#
# Scaffold a new composable for the app, creating basic versions of the files
# required to get up and running quickly.
#
# Usage: ./support/scaffold-composable.sh <composable-name> --parent [parent-component]
#
# Parameters:
#   <composable-name>  (required)
#     The name of the composable in kebab-case. Remember the convention of
#     beginning composable names with "use-".
#   --folder [folder-name]  (optional)
#     The name of the folder where the composable will be created in the root
#     composables folder.
#   --parent [parent-component]
#     The name of the parent component to which this composable will belong to.
#     A fragment composable is one that doesn't really stand alone, but
#     is part of a larger whole, and is used to better organise a particularly
#     complex component.
#
# Example:
#   ./support/scaffold-composable.sh use-translation-mode
#
# Recommended alias:
#   scaffold:composable
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/colours.sh"

if [ -z "$1" ]; then
	echo -e "\nPlease provide a ${BLUE}composable-name${RESET_COLOUR} for the composable."
	echo -e "Usage: ${PURPLE}./support/scaffold-composable.sh${RESET_COLOUR} ${BLUE}<composable-name>${RESET_COLOUR} [--folder <folder-name>] [--parent <parent-component>]"
	exit 1
fi

# Determine the passed parameters
COMPOSABLE_NAME="$1"
shift

FOLDER_PATH=""
PARENT_COMPONENT=""
IS_FRAGMENT=false

while [[ "$#" -gt 0 ]]; do
	case $1 in
		--folder)
			FOLDER_PATH="$2"
			shift
			;;
		--parent)
			PARENT_COMPONENT="$2"
			IS_FRAGMENT=true
			shift
			;;
		*)
			echo -e "\nUnknown parameter passed: $1"
			echo -e "Usage: ${PURPLE}./support/scaffold-composable.sh${RESET_COLOUR} ${BLUE}<composable-name>${RESET_COLOUR} [--parent <parent-component>]"
			exit 1
			;;
	esac
    shift
done

# The base path is where the composable will be created.
BASE_PATH="src/composables"

# If a parent component is provided, we update our base path to join the parent
# itself.
if [ -n "$PARENT_COMPONENT" ]; then
	BASE_PATH="src/components/$PARENT_COMPONENT/composables"
fi

# If a folder path is provided, append it to the base path
if [ -n "$FOLDER_PATH" ]; then
    BASE_PATH="$BASE_PATH/$FOLDER_PATH"
fi

mkdir -p "$BASE_PATH/$COMPOSABLE_NAME"
cd "$BASE_PATH/$COMPOSABLE_NAME"

# Generate a cameCase version of our name, used within templates.
CAMEL_CASE_NAME=$(echo $COMPOSABLE_NAME | awk -F'-' '{for(i=2;i<=NF;i++)$i=toupper(substr($i,1,1)) substr($i,2)} 1' OFS='')

# Generate our scaffold files from templates.
templates=(
	"composable.js"
	"composable.test.js"
)

output_files=(
	"${COMPOSABLE_NAME}.js"
	"${COMPOSABLE_NAME}.test.js"
)

for i in "${!templates[@]}"; do
	TEMPLATE_FILE="$SCRIPT_DIR/templates/composable/${templates[$i]}"
	OUTPUT_FILE="${output_files[$i]}"

	sed "s/{{COMPOSABLE_NAME}}/$COMPOSABLE_NAME/g; s/{{CAMEL_CASE_NAME}}/$CAMEL_CASE_NAME/g" "$TEMPLATE_FILE" > "$OUTPUT_FILE"

	code -r $OUTPUT_FILE
done

# Print the success message
echo -e "\nComposable ${PURPLE}$COMPOSABLE_NAME${RESET_COLOUR} scaffolded successfully in ${BLUE}$BASE_PATH/$COMPOSABLE_NAME${RESET_COLOUR}.\n"
echo -e "${PURPLE}$COMPOSABLE_NAME${RESET_COLOUR}"
echo "  ↳ $COMPOSABLE_NAME.js"
echo "  ↳ $COMPOSABLE_NAME.test.js"
