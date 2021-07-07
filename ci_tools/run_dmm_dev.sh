CI_SCRIPT_DIR=`dirname $0`
PROJECT_ROOT_DIR=`(cd "$CI_SCRIPT_DIR/../" && echo "$(pwd -P)")`

if [ -z ${INTERACTIVE_FLAGS+x} ]; then INTERACTIVE_FLAGS="-it"; fi

docker run --rm=true $INTERACTIVE_FLAGS -v "$PROJECT_ROOT_DIR":/hostmount/ -p 8020:4200 dmm_dev "$@"
