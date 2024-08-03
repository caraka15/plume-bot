import subprocess
import time
import threading

def run_command(command):
    """Run the command using subprocess"""
    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error occurred while running command: {e}")

def run_checkIn():
    while True:
        run_command('/usr/bin/node /root/plume-bot/checkIn.js')
        time.sleep(5 * 60 * 60)  # Sleep for 5 hours

def run_movement():
    while True:
        run_command('/usr/bin/node /root/plume-bot/movement.js')
        time.sleep(5 * 60 * 60)  # Sleep for 5 hours

def run_landshare():
    while True:
        run_command('/usr/bin/node /root/plume-bot/landShare.js')
        time.sleep(12 * 60 * 60)  # Sleep for 12 hours

def main():
    # Create threads for each task
    checkIn_thread = threading.Thread(target=run_checkIn)
    movement_thread = threading.Thread(target=run_movement)
    landshare_thread = threading.Thread(target=run_landshare)

    # Start threads
    checkIn_thread.start()
    movement_thread.start()
    landshare_thread.start()

    # Wait for threads to complete (they won't, as they run indefinitely)
    checkIn_thread.join()
    movement_thread.join()
    landshare_thread.join()

if __name__ == "__main__":
    main()
