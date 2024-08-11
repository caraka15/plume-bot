#!/bin/bash

# Fungsi untuk menjalankan perintah
run_command() {
    local command="$1"
    echo "Running command: $command"
    eval "$command"
}

# Fungsi untuk menjalankan checkIn
run_checkIn() {
    while true; do
        run_command '/usr/bin/node /root/plume-bot/checkIn.js'
        sleep $((5 * 60 * 60))  # Tidur selama 5 jam
    done
}

# Fungsi untuk menjalankan movement
run_movement() {
    while true; do
        run_command '/usr/bin/node /root/plume-bot/movement.js'
        sleep $((5 * 60 * 60))  # Tidur selama 5 jam
    done
}

run_rivalz() {
    while true; do
        run_command '/usr/bin/node /root/plume-bot/rivalz.js'
        sleep $((24 * 60 * 60))  # Tidur selama 5 jam
    done
}

# Fungsi untuk menjalankan landShare
run_landshare() {
    while true; do
        run_command '/usr/bin/node /root/plume-bot/landShare.js'
        sleep $((12 * 60 * 60))  # Tidur selama 12 jam
    done
}

# Jalankan fungsi di latar belakang
run_checkIn &
run_movement &
run_rivalz &
run_landshare &

# Tunggu hingga semua proses latar belakang selesai (akan terus berjalan)
wait

