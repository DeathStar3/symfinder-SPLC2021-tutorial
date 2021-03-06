#!/bin/bash
#
# This file is part of symfinder.
#
# symfinder is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# symfinder is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with symfinder. If not, see <http://www.gnu.org/licenses/>.
#
# Copyright 2018-2019 Johann Mortara <johann.mortara@univ-cotedazur.fr>
# Copyright 2018-2019 Xhevahire Tërnava <xhevahire.ternava@lip6.fr>
# Copyright 2018-2019 Philippe Collet <philippe.collet@univ-cotedazur.fr>
#

function run_tests() {
  export CONTEXT_FILE="$1"
  export TESTS_DIR="$2"
  docker-compose -f visualization-tests-compose.yaml up --abort-on-container-exit --exit-code-from karma
  RETURN_CODE=$?
  docker-compose -f visualization-tests-compose.yaml down
}

docker-compose -f visualization-tests-compose.yaml build

echo "Running tests on standard visualization"
run_tests "pages/context.html" "tests"

if [ $RETURN_CODE != 0 ]; then
    exit $RETURN_CODE
fi

echo "Running tests on usage visualization"
run_tests "pages/context_usage.html" "usage_tests"

exit $RETURN_CODE
