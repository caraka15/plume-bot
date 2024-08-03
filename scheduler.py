import subprocess
import time

def run_command(command):
    """Run the command using subprocess"""
    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error occurred while running command: {e}")

def main():
    while True:
        # Run checkIn.js every 5 hours
        run_command('/usr/bin/node /root/plume-bot/checkIn.js')
        time.sleep(5 * 60 * 60)  # Sleep for 5 hours

        # Run movement.js every 5 hours
        run_command('/usr/bin/node /root/plume-bot/movement.js')
        time.sleep(5 * 60 * 60)  # Sleep for 5 hours

        # Run landshare.js every 12 hours
        run_command('/usr/bin/node /root/plume-bot/landshare.js')
        time.sleep(12 * 60 * 60)  # Sleep for 12 hours

if __name__ == "__main__":
    main()
