require('dotenv').config();
const schedule = require('node-schedule');
const moment = require('moment-timezone');
const { fork } = require('child_process');
const path = require('path');
const chalk = require('chalk');
const config = require('../config/scheduler-config.json');

const activeJobs = new Map();
const runningProcesses = new Map();

function getCurrentTime() {
    return moment().tz(config.timezone || "Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
}

function logWithBorder(message, borderChar = "=") {
    const line = borderChar.repeat(100);
    console.log(chalk.yellow(`\n${line}`));
    console.log(message);
    console.log(chalk.yellow(line));
}

async function executeScript(taskConfig) {
    try {
        if (runningProcesses.has(taskConfig.name)) {
            const oldProcess = runningProcesses.get(taskConfig.name);
            oldProcess.kill();
            runningProcesses.delete(taskConfig.name);
        }

        logWithBorder(chalk.green(`🚀 Starting task: ${taskConfig.name} at ${getCurrentTime()}`));

        // Jalankan file dari root directory
        const scriptPath = path.join(process.cwd(), taskConfig.file);
        const childProcess = fork(scriptPath, [], {
            stdio: 'inherit'
        });

        runningProcesses.set(taskConfig.name, childProcess);

        childProcess.on('exit', (code) => {
            if (code === 0) {
                logWithBorder(chalk.green(`✅ Task ${taskConfig.name} completed successfully`));
            } else {
                logWithBorder(chalk.red(`❌ Task ${taskConfig.name} failed with code ${code}`));
            }
            runningProcesses.delete(taskConfig.name);
        });

    } catch (error) {
        logWithBorder(chalk.red(`Error executing ${taskConfig.name}: ${error.message}`));
    }
}

function updateCountdown(taskConfig) {
    const now = moment().tz(config.timezone);
    let nextExecution = moment().tz(config.timezone);
    const [hour, minute] = taskConfig.schedule.split(":").map(Number);

    nextExecution.set({ hour, minute, second: 0 });

    if (nextExecution.isSameOrBefore(now)) {
        nextExecution.add(1, "day");
    }

    const duration = moment.duration(nextExecution.diff(now));
    const hours = duration.hours().toString().padStart(2, "0");
    const minutes = duration.minutes().toString().padStart(2, "0");
    const seconds = duration.seconds().toString().padStart(2, "0");

    process.stdout.write(
        chalk.cyan(`\r${taskConfig.name} next execution in: ${chalk.yellow(`${hours}:${minutes}:${seconds}`)}`)
    );
}

function scheduleTask(taskConfig) {
    if (!taskConfig.enabled) {
        console.log(chalk.yellow(`Task ${taskConfig.name} is disabled, skipping...`));
        return;
    }

    if (activeJobs.has(taskConfig.name)) {
        activeJobs.get(taskConfig.name).cancel();
    }

    const [hour, minute] = taskConfig.schedule.split(":").map(Number);

    logWithBorder(
        chalk.cyan(`📅 Scheduling ${taskConfig.name} to run at ${taskConfig.schedule} ${config.timezone}`)
    );

    // Run immediately if runNow is true
    if (taskConfig.runNow) {
        executeScript(taskConfig);
        taskConfig.runNow = false;
    }

    // Schedule regular execution
    const job = schedule.scheduleJob(
        { hour, minute, tz: config.timezone },
        () => executeScript(taskConfig)
    );

    activeJobs.set(taskConfig.name, job);

    const countdownInterval = setInterval(() => {
        if (!runningProcesses.has(taskConfig.name)) {
            updateCountdown(taskConfig);
        }
    }, 1000);

    if (!activeJobs.has(`${taskConfig.name}_countdown`)) {
        activeJobs.set(`${taskConfig.name}_countdown`, countdownInterval);
    }
}

function startScheduler() {
    logWithBorder(chalk.cyan(`🔄 Starting Scheduler at ${getCurrentTime()}`));

    config.tasks.forEach(taskConfig => {
        scheduleTask(taskConfig);
    });

    process.on('SIGINT', () => {
        logWithBorder(chalk.red(`👋 Shutting down scheduler...`));

        for (const [name, job] of activeJobs) {
            if (typeof job.cancel === 'function') {
                job.cancel();
            } else if (typeof job.kill === 'function') {
                job.kill();
            } else {
                clearInterval(job);
            }
        }

        for (const [name, proc] of runningProcesses) {
            proc.kill();
        }

        process.exit(0);
    });
}

module.exports = {
    startScheduler
};