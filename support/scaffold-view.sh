#!/bin/bash

#
# Scaffold view
#
# Scaffold a new view, creating basic versions of the files required to get up
# and running quickly.
#
# Usage: ./support/scaffold-view.sh <view-name> --folder [folder-name] --fragment [parent-view]
#
# Parameters:
#   <view-name>  (required)
#     The name of the view in kebab-case. Remember that to follow Vue component
#     naming conventions and avoid confusion with native elements, all component
#     and view names should contain at least two words.
#   --folder [folder-name]  (optional)
#     The name of the folder where the view will be created in the root
#     views folder.
#   --fragment [parent-view]
#     The name of the parent view to which this component will be a fragment. A
#     fragment component is one that doesn't really stand alone, but is part of
#     larger whole, and is mostly used for organisation.
#
# Example:
#   ./support/scaffold-view.sh page-about --folder company
#
# Recommended alias:
#   scaffold:view
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/colours.sh"

if [ -z "$1" ]; then
	echo -e "\nPlease provide a ${BLUE}view-name${RESET_COLOUR} for the view."
	echo -e "Usage: ${PURPLE}./support/scaffold-view.sh${RESET_COLOUR} ${BLUE}<view-name>${RESET_COLOUR} [--folder <folder-name>] [--fragment <parent-view>]"
	exit 1
fi

# Determine the passed parameters
VIEW_NAME="$1"
shift

FOLDER_PATH=""
PARENT_VIEW=""
IS_FRAGMENT=false

while [[ "$#" -gt 0 ]]; do
	case $1 in
		--folder)
			FOLDER_PATH="$2"
			shift
			;;
		--fragment)
			PARENT_VIEW="$2"
			IS_FRAGMENT=true
			shift
			;;
		*)
			echo -e "\nUnknown parameter passed: $1"
			echo -e "Usage: ${PURPLE}./support/scaffold-view.sh${RESET_COLOUR} ${BLUE}<view-name>${RESET_COLOUR} [--folder <folder-name>] [--fragment <parent-view>]"
			exit 1
			;;
	esac
    shift
done

# The base path is where the view will be created.
BASE_PATH="src/views"

# If a folder path is provided, append it to the base path
if [ -n "$FOLDER_PATH" ]; then
    BASE_PATH="$BASE_PATH/$FOLDER_PATH"
fi

# If a parent view is provided, append it to the base path and add "fragments"
if [ -n "$PARENT_VIEW" ]; then
	BASE_PATH="$BASE_PATH/$PARENT_VIEW/fragments"
fi

mkdir -p "$BASE_PATH/$VIEW_NAME"
cd "$BASE_PATH/$VIEW_NAME"

# Generate a PascalCase version of our name, used within view templates.
PASCAL_CASE_NAME=$(echo "$VIEW_NAME" | awk -F- '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1' OFS='')

# Generate our scaffold files from templates.
templates=(
	"view.vue"
	"view.cy.js"
	"view.test.js"
)

output_files=(
	"${VIEW_NAME}.vue"
	"${VIEW_NAME}.cy.js"
	"${VIEW_NAME}.test.js"
)

for i in "${!templates[@]}"; do
	TEMPLATE_FILE="$SCRIPT_DIR/templates/view/${templates[$i]}"
	OUTPUT_FILE="${output_files[$i]}"

	sed "s/{{VIEW_NAME}}/$VIEW_NAME/g; s/{{PASCAL_CASE_NAME}}/$PASCAL_CASE_NAME/g" "$TEMPLATE_FILE" > "$OUTPUT_FILE"

	code -r $OUTPUT_FILE
done

# Print the success message
echo -e "\nView ${PURPLE}$VIEW_NAME${RESET_COLOUR} scaffolded successfully in ${BLUE}$BASE_PATH/$VIEW_NAME${RESET_COLOUR}.\n"
echo -e "${PURPLE}$VIEW_NAME${RESET_COLOUR}"
echo "  ↳ $VIEW_NAME.vue"
echo "  ↳ $VIEW_NAME.cy.js"
echo "  ↳ $VIEW_NAME.test.js"
