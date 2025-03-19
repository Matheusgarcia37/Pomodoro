// DOM Elements
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const pomodoroBtn = document.getElementById('pomodoro-btn');
const shortBreakBtn = document.getElementById('short-break-btn');
const longBreakBtn = document.getElementById('long-break-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const saveSettingsBtn = document.getElementById('save-settings');
const pomodoroTimeInput = document.getElementById('pomodoro-time');
const shortBreakTimeInput = document.getElementById('short-break-time');
const longBreakTimeInput = document.getElementById('long-break-time');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Timer variables
let timer;
let minutes = 25;
let seconds = 0;
let isRunning = false;
let currentMode = 'pomodoro';
let settings = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
};

// Tasks array
let tasks = [];

// Theme
let isDarkTheme = false;

// YouTube player
let player;

// Initialize YouTube API
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '200',
        width: '100%',
        videoId: 'jfKfPfyJRdk', // Default lofi hip hop radio
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'modestbranding': 1,
            'rel': 0,
            'showinfo': 0
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    event.target.setVolume(50);
    event.target.playVideo();
}

// Timer functions
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        timer = setInterval(() => {
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(timer);
                    isRunning = false;
                    playAlarm();
                    
                    if (currentMode === 'pomodoro') {
                        switchMode('shortBreak');
                    } else {
                        switchMode('pomodoro');
                    }
                    
                    return;
                }
                minutes--;
                seconds = 59;
            } else {
                seconds--;
            }
            
            updateTimerDisplay();
        }, 1000);
    }
}

function pauseTimer() {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // Reset to current mode's time
    if (currentMode === 'pomodoro') {
        minutes = settings.pomodoro;
    } else if (currentMode === 'shortBreak') {
        minutes = settings.shortBreak;
    } else {
        minutes = settings.longBreak;
    }
    
    seconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    minutesElement.textContent = minutes.toString().padStart(2, '0');
    secondsElement.textContent = seconds.toString().padStart(2, '0');
    
    // Update document title
    document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - Pomodoro Timer`;
}

function switchMode(mode) {
    currentMode = mode;
    
    // Reset active class
    pomodoroBtn.classList.remove('active');
    shortBreakBtn.classList.remove('active');
    longBreakBtn.classList.remove('active');
    
    // Set time based on mode
    if (mode === 'pomodoro') {
        minutes = settings.pomodoro;
        pomodoroBtn.classList.add('active');
    } else if (mode === 'shortBreak') {
        minutes = settings.shortBreak;
        shortBreakBtn.classList.add('active');
    } else {
        minutes = settings.longBreak;
        longBreakBtn.classList.add('active');
    }
    
    seconds = 0;
    updateTimerDisplay();
    resetTimer();
}

function playAlarm() {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    audio.play();
}

// Task functions
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText) {
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        taskInput.value = '';
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        
        taskItem.innerHTML = `
            <span class="task-text">${task.text}</span>
            <div class="task-actions">
                <button class="complete-btn" data-id="${task.id}"><i class="fas fa-check"></i></button>
                <button class="delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        taskList.appendChild(taskItem);
    });
    
    // Add event listeners to task buttons
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = parseInt(btn.getAttribute('data-id'));
            toggleTaskComplete(taskId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = parseInt(btn.getAttribute('data-id'));
            deleteTask(taskId);
        });
    });
}

function toggleTaskComplete(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('pomodoro-tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    renderTasks();
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

pomodoroBtn.addEventListener('click', () => switchMode('pomodoro'));
shortBreakBtn.addEventListener('click', () => switchMode('shortBreak'));
longBreakBtn.addEventListener('click', () => switchMode('longBreak'));

settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
});

saveSettingsBtn.addEventListener('click', () => {
    settings.pomodoro = parseInt(pomodoroTimeInput.value) || 25;
    settings.shortBreak = parseInt(shortBreakTimeInput.value) || 5;
    settings.longBreak = parseInt(longBreakTimeInput.value) || 15;
    
    // Save settings to localStorage
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
    
    // Update current timer
    switchMode(currentMode);
    
    // Hide settings panel
    settingsPanel.classList.add('hidden');
});

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

muteBtn.addEventListener('click', () => {
    if (player) {
        if (player.isMuted()) {
            player.unMute();
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            player.mute();
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    }
});

volumeSlider.addEventListener('input', () => {
    if (player) {
        player.setVolume(volumeSlider.value);
        if (player.isMuted()) {
            player.unMute();
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }
});

// Theme toggle
themeToggleBtn.addEventListener('click', toggleTheme);

// Theme functions
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
    saveTheme();
}

function saveTheme() {
    localStorage.setItem('pomodoro-dark-theme', isDarkTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('pomodoro-dark-theme');
    if (savedTheme !== null) {
        isDarkTheme = savedTheme === 'true';
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        pomodoroTimeInput.value = settings.pomodoro;
        shortBreakTimeInput.value = settings.shortBreak;
        longBreakTimeInput.value = settings.longBreak;
    }
    
    // Initialize timer display
    minutes = settings.pomodoro;
    updateTimerDisplay();
    
    // Load tasks
    loadTasks();
    
    // Load theme
    loadTheme();
});