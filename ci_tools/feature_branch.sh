# script to perform build and tests on a feature branch

CI_SCRIPT_DIR=`dirname $0`

# stop any containers still running from any previous runs
# filter out common error messages that container isn't found
docker stop dmm_dev 2>&1 | grep -v "no such id" | grep -v "failed to stop"
docker rm dmm_dev 2>&1 | grep -v "no such id" |grep -v "failed to remove"

cd $CI_SCRIPT_DIR && \
    sh build_dmm_dev.sh && \
    INTERACTIVE_FLAGS='' sh run_dmm_dev.sh npm install && \
    INTERACTIVE_FLAGS='' sh run_dmm_dev.sh ng build && \
    INTERACTIVE_FLAGS='' sh run_dmm_dev.sh ng test && \
    INTERACTIVE_FLAGS='' sh run_dmm_dev.sh ng e2e
