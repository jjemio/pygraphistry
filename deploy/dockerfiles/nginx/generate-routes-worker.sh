#!/usr/bin/env bash

# Usage: generate-routes-worker.sh [<number of workers>]
# Generates nginx config defining location mappings for <number of workers> (default: 32) workers.
#
# Example (generates routes for 16 workers):
#   generate-routes-worker.sh 16 > ./routes-worker.conf


worker_count=${1:-32}
start_port=10000
end_port=$(( $start_port + $worker_count - 1 ))

printf '### DO NOT EDIT BY HAND - Autoo-generated by generate-routes-worker.sh\n'
printf '### Generated routes for %d workers at ports %d-%d, on %s by %s\n\n' "$worker_count" "$start_port" "$end_port" "$(date)" "$USER"

for worker in $(seq $start_port $end_port); do
    printf 'location @worker%d { \n' $worker
    printf '    set $worker_id  %d;\n' $worker
    printf '    proxy_pass      http://worker%d;\n' $worker
    printf '}\n\n'
done


printf 'map $worker_path $worker_location {\n'
printf '    default  @worker_notfound;\n'
for worker in $(seq $start_port $end_port); do
    printf '    %d    @worker%d;\n' $worker $worker
done
printf '}\n\n'
