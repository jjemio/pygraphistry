#!/usr/bin/env bash

# Usage: generate-routes-worker.sh [<number of workers>]
# Generates nginx config defining location mappings for <number of workers> (default: 32) workers.
# Writes to the config files "routes-workers.conf" and "upstreams-workers.conf" in the same
# directory as this script.
#
# Example (generates routes for 16 workers):
#   generate-routes-worker.sh 16

cd "$(dirname "$0")"

worker_count=${1:-32}
start_port=10000
end_port=$(( $start_port + $worker_count - 1 ))

routes_outfile="$PWD/routes-workers.conf"
upstreams_outfile="$PWD/upstreams-workers.conf"

worker_keepalive=32



(
    printf '### DO NOT EDIT BY HAND - Autoo-generated by generate-routes-worker.sh\n'
    printf '### Generated routes for %d workers at ports %d-%d, on %s by %s\n\n' "$worker_count" "$start_port" "$end_port" "$(date)" "$USER"
    for worker in $(seq $start_port $end_port); do
        printf 'location @worker%d { \n' $worker
        printf '    set $worker_id  %d;\n' $worker
        printf '    proxy_pass      http://worker%d;\n' $worker
        printf '}\n\n'
    done
) > $routes_outfile

echo "Wrote config: $routes_outfile"

(
    printf '### DO NOT EDIT BY HAND - Autoo-generated by generate-routes-worker.sh\n'
    printf '### Generated routes for %d workers at ports %d-%d, on %s by %s\n\n' "$worker_count" "$start_port" "$end_port" "$(date)" "$USER"

    for worker in $(seq $start_port $end_port); do
        printf 'upstream worker%d {\n' $worker
        printf '    server                      127.0.0.1:%d;\n' $worker
        printf '    keepalive                   %d;\n' $worker_keepalive
        printf '}\n\n'
    done

    printf '\nmap $worker_path $worker_location {\n'
    printf '    default  @worker_notfound;\n'
    for worker in $(seq $start_port $end_port); do
        printf '    %d    @worker%d;\n' $worker $worker
    done
    printf '}\n\n'
) > $upstreams_outfile

echo "Wrote config: $upstreams_outfile"

echo
echo "Done"